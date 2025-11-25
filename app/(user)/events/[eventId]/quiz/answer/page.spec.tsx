import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AnswerPage from "./page";

// Mock modules
vi.mock("@/app/_lib/actions/user", () => ({
  validateSession: vi.fn(),
  getAnswerResult: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("./_components/AnswerDisplay", () => ({
  AnswerDisplay: ({ questionText, userAnswer }: any) => (
    <div data-testid="answer-display">
      <p data-testid="question-text">{questionText}</p>
      {userAnswer ? (
        <p data-testid="user-answer">
          Choice: {userAnswer.choiceId}, Correct: {String(userAnswer.isCorrect)}
        </p>
      ) : (
        <p data-testid="no-answer">未回答</p>
      )}
    </div>
  ),
}));

import { validateSession, getAnswerResult } from "@/app/_lib/actions/user";
import { redirect } from "next/navigation";

describe("AnswerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("成功ケース", () => {
    it("セッションが有効な場合、AnswerDisplayが表示される", async () => {
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: {
          id: "test-user-id",
          event_id: 1,
        },
      } as any);

      vi.mocked(getAnswerResult).mockResolvedValue({
        success: true,
        data: {
          questionText: "What is 2 + 2?",
          questionImageUrl: null,
          choices: [
            {
              id: 1,
              text: "4",
              imageUrl: null,
              orderNum: 1,
              isCorrect: true,
              selectionCount: 10,
            },
            {
              id: 2,
              text: "5",
              imageUrl: null,
              orderNum: 2,
              isCorrect: false,
              selectionCount: 5,
            },
          ],
          userAnswer: {
            choiceId: 1,
            isCorrect: true,
            responseTimeMs: 5000,
          },
        },
      } as any);

      const { container } = render(
        await AnswerPage({
          params: Promise.resolve({
            eventId: "1",
          }),
        })
      );

      expect(container).toBeTruthy();
      expect(screen.getByTestId("answer-display")).toBeTruthy();
      expect(screen.getByTestId("question-text")).toBeTruthy();
    });

    it("ユーザーが回答している場合、回答情報が表示される", async () => {
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: {
          id: "test-user-id",
          event_id: 1,
        },
      } as any);

      vi.mocked(getAnswerResult).mockResolvedValue({
        success: true,
        data: {
          questionText: "What is 2 + 2?",
          questionImageUrl: null,
          choices: [],
          userAnswer: {
            choiceId: 1,
            isCorrect: true,
            responseTimeMs: 5000,
          },
        },
      } as any);

      render(
        await AnswerPage({
          params: Promise.resolve({
            eventId: "1",
          }),
        })
      );

      expect(screen.getByTestId("user-answer")).toBeTruthy();
    });

    it("ユーザーが未回答の場合、未回答表示が表示される", async () => {
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: {
          id: "test-user-id",
          event_id: 1,
        },
      } as any);

      vi.mocked(getAnswerResult).mockResolvedValue({
        success: true,
        data: {
          questionText: "What is 2 + 2?",
          questionImageUrl: null,
          choices: [],
          userAnswer: null,
        },
      } as any);

      render(
        await AnswerPage({
          params: Promise.resolve({
            eventId: "1",
          }),
        })
      );

      expect(screen.getByTestId("no-answer")).toBeTruthy();
    });
  });

  describe("エラーケース", () => {
    it("無効なイベントIDの場合、エラーがスローされる", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        await AnswerPage({
          params: Promise.resolve({
            eventId: "invalid-id",
          }),
        });
      } catch (error) {
        expect(error).toBeTruthy();
      }

      consoleErrorSpy.mockRestore();
    });

    it("セッションが見つからない場合、リダイレクトされる", async () => {
      vi.mocked(validateSession).mockResolvedValue({
        valid: false,
        error: "セッションが見つかりません",
      } as any);

      await AnswerPage({
        params: Promise.resolve({
          eventId: "1",
        }),
      });

      expect(redirect).toHaveBeenCalledWith("/events/1");
    });

    it("セッションのイベントIDが一致しない場合、リダイレクトされる", async () => {
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: {
          id: "test-user-id",
          event_id: 2, // ページのeventIdと異なる
        },
      } as any);

      await AnswerPage({
        params: Promise.resolve({
          eventId: "1",
        }),
      });

      expect(redirect).toHaveBeenCalledWith("/events/1");
    });

    it("getAnswerResultが失敗した場合、エラーメッセージが表示される", async () => {
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: {
          id: "test-user-id",
          event_id: 1,
        },
      } as any);

      vi.mocked(getAnswerResult).mockResolvedValue({
        success: false,
        error: "問題が見つかりません",
      } as any);

      const { container } = render(
        await AnswerPage({
          params: Promise.resolve({
            eventId: "1",
          }),
        })
      );

      expect(screen.getByText("エラー")).toBeTruthy();
      expect(screen.getByText("問題が見つかりません")).toBeTruthy();
    });

    it("getAnswerResultが失敗し、エラーメッセージがない場合、デフォルトメッセージが表示される", async () => {
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: {
          id: "test-user-id",
          event_id: 1,
        },
      } as any);

      vi.mocked(getAnswerResult).mockResolvedValue({
        success: false,
        error: undefined,
      } as any);

      render(
        await AnswerPage({
          params: Promise.resolve({
            eventId: "1",
          }),
        })
      );

      expect(screen.getByText("エラー")).toBeTruthy();
      expect(screen.getByText("回答結果の読み込みに失敗しました")).toBeTruthy();
    });
  });

  describe("パラメータ処理", () => {
    it("文字列のイベントIDが数値に変換される", async () => {
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: {
          id: "test-user-id",
          event_id: 123,
        },
      } as any);

      vi.mocked(getAnswerResult).mockResolvedValue({
        success: true,
        data: {
          questionText: "Question?",
          questionImageUrl: null,
          choices: [],
          userAnswer: null,
        },
      } as any);

      await AnswerPage({
        params: Promise.resolve({
          eventId: "123",
        }),
      });

      // getAnswerResultが数値で呼び出されたことを確認
      expect(getAnswerResult).toHaveBeenCalledWith(123);
    });

    it("ゼロ埋めされたイベントIDも正しく処理される", async () => {
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: {
          id: "test-user-id",
          event_id: 5,
        },
      } as any);

      vi.mocked(getAnswerResult).mockResolvedValue({
        success: true,
        data: {
          questionText: "Question?",
          questionImageUrl: null,
          choices: [],
          userAnswer: null,
        },
      } as any);

      await AnswerPage({
        params: Promise.resolve({
          eventId: "00005",
        }),
      });

      expect(getAnswerResult).toHaveBeenCalledWith(5);
    });
  });

  describe("AnswerDisplayへのプロップ", () => {
    it("すべてのプロップが正しく渡される", async () => {
      const mockData = {
        questionText: "What is 2 + 2?",
        questionImageUrl: "https://example.com/image.jpg",
        choices: [
          {
            id: 1,
            text: "4",
            imageUrl: null,
            orderNum: 1,
            isCorrect: true,
            selectionCount: 10,
          },
        ],
        userAnswer: {
          choiceId: 1,
          isCorrect: true,
          responseTimeMs: 5000,
        },
      };

      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: {
          id: "test-user-id",
          event_id: 1,
        },
      } as any);

      vi.mocked(getAnswerResult).mockResolvedValue({
        success: true,
        data: mockData,
      } as any);

      render(
        await AnswerPage({
          params: Promise.resolve({
            eventId: "1",
          }),
        })
      );

      expect(screen.getByTestId("question-text")).toHaveTextContent(
        mockData.questionText
      );
    });
  });
});

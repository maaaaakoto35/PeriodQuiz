import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnswerDisplay } from "./AnswerDisplay";
import type { Choice } from "../../../_components";

// Mock modules
vi.mock("../../../_components", () => ({
  EventNameHeader: () => <div data-testid="event-header">Event Header</div>,
  QuestionContent: ({ text, imageUrl }: any) => (
    <div data-testid="question-content">
      {text}
      {imageUrl && <img src={imageUrl} alt="question" />}
    </div>
  ),
  ChoiceButtonGroup: ({
    choices,
    userSelectedChoiceId,
    showCorrectness,
  }: any) => (
    <div data-testid="choice-group">
      {choices.map((choice: any) => (
        <button
          key={choice.id}
          data-testid={`choice-${choice.id}`}
          data-selected={choice.id === userSelectedChoiceId}
          data-correct={choice.isCorrect && showCorrectness}
        >
          {choice.text}
        </button>
      ))}
    </div>
  ),
}));

describe("AnswerDisplay", () => {
  const mockChoices: Choice[] = [
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
  ];

  describe("レンダリング", () => {
    it("コンポーネントが正常にレンダリングされる", () => {
      const { container } = render(
        <AnswerDisplay
          questionText="What is 2 + 2?"
          questionImageUrl={null}
          choices={mockChoices}
          userAnswer={{
            choiceId: 1,
            isCorrect: true,
            responseTimeMs: 5000,
          }}
        />
      );

      expect(container).toBeTruthy();
      expect(screen.getByTestId("event-header")).toBeTruthy();
      expect(screen.getByTestId("question-content")).toBeTruthy();
      expect(screen.getByTestId("choice-group")).toBeTruthy();
    });

    it("背景画像が設定される", () => {
      const { container } = render(
        <AnswerDisplay
          questionText="What is 2 + 2?"
          questionImageUrl={null}
          choices={mockChoices}
          userAnswer={{
            choiceId: 1,
            isCorrect: true,
            responseTimeMs: 5000,
          }}
        />
      );

      // CSS Modulesで背景が設定されているため、classNameの存在を確認
      const background = container.querySelector("div") as HTMLElement;
      expect(background?.className).toBeTruthy();
    });
  });

  describe("正解の場合", () => {
    it("正解マークと「正解！」が表示される", () => {
      render(
        <AnswerDisplay
          questionText="What is 2 + 2?"
          questionImageUrl={null}
          choices={mockChoices}
          userAnswer={{
            choiceId: 1,
            isCorrect: true,
            responseTimeMs: 5000,
          }}
        />
      );

      expect(screen.getByText("正解！")).toBeTruthy();
      expect(screen.getByText("✓")).toBeTruthy();
    });

    it("回答時間が表示される（正解時）", () => {
      render(
        <AnswerDisplay
          questionText="What is 2 + 2?"
          questionImageUrl={null}
          choices={mockChoices}
          userAnswer={{
            choiceId: 1,
            isCorrect: true,
            responseTimeMs: 5000,
          }}
        />
      );

      expect(screen.getByText("5.000秒")).toBeTruthy();
    });

    it("不正解の正解表示が表示されない", () => {
      render(
        <AnswerDisplay
          questionText="What is 2 + 2?"
          questionImageUrl={null}
          choices={mockChoices}
          userAnswer={{
            choiceId: 1,
            isCorrect: true,
            responseTimeMs: 5000,
          }}
        />
      );

      expect(screen.queryByText("正解は:")).toBeFalsy();
    });
  });

  describe("不正解の場合", () => {
    it("不正解マークと「不正解」が表示される", () => {
      render(
        <AnswerDisplay
          questionText="What is 2 + 2?"
          questionImageUrl={null}
          choices={mockChoices}
          userAnswer={{
            choiceId: 2,
            isCorrect: false,
            responseTimeMs: 3000,
          }}
        />
      );

      expect(screen.getByText("不正解")).toBeTruthy();
      expect(screen.getByText("✗")).toBeTruthy();
    });

    it("回答時間が表示される（不正解時）", () => {
      render(
        <AnswerDisplay
          questionText="What is 2 + 2?"
          questionImageUrl={null}
          choices={mockChoices}
          userAnswer={{
            choiceId: 2,
            isCorrect: false,
            responseTimeMs: 3000,
          }}
        />
      );

      expect(screen.getByText("3.000秒")).toBeTruthy();
    });

    it("正解の選択肢が表示される", () => {
      render(
        <AnswerDisplay
          questionText="What is 2 + 2?"
          questionImageUrl={null}
          choices={mockChoices}
          userAnswer={{
            choiceId: 2,
            isCorrect: false,
            responseTimeMs: 3000,
          }}
        />
      );

      expect(screen.getByText("正解は:")).toBeTruthy();
      // 複数の「4」が存在するため、正解表示エリアのものを特定
      const correctAnswerSection = screen.getByText("正解は:");
      expect(correctAnswerSection.parentElement?.textContent).toContain("4");
    });
  });

  describe("未回答の場合", () => {
    it("「未回答」が表示される", () => {
      render(
        <AnswerDisplay
          questionText="What is 2 + 2?"
          questionImageUrl={null}
          choices={mockChoices}
          userAnswer={null}
        />
      );

      expect(screen.getByText(/未回答/)).toBeTruthy();
    });

    it("回答時間と正解情報が表示されない", () => {
      render(
        <AnswerDisplay
          questionText="What is 2 + 2?"
          questionImageUrl={null}
          choices={mockChoices}
          userAnswer={null}
        />
      );

      expect(screen.queryByText(/秒/)).toBeFalsy();
      expect(screen.queryByText("正解は:")).toBeFalsy();
    });
  });

  describe("問題画像", () => {
    it("問題画像のURLが渡されると、QuestionContentに渡される", () => {
      const imageUrl = "https://example.com/question.jpg";
      render(
        <AnswerDisplay
          questionText="What is 2 + 2?"
          questionImageUrl={imageUrl}
          choices={mockChoices}
          userAnswer={{
            choiceId: 1,
            isCorrect: true,
            responseTimeMs: 5000,
          }}
        />
      );

      // QuestionContentにimageUrlが渡されていることを確認
      const questionContent = screen.getByTestId("question-content");
      expect(
        questionContent.querySelector(`img[src="${imageUrl}"]`)
      ).toBeTruthy();
    });
  });

  describe("選択肢の表示", () => {
    it("すべての選択肢が表示される", () => {
      render(
        <AnswerDisplay
          questionText="What is 2 + 2?"
          questionImageUrl={null}
          choices={mockChoices}
          userAnswer={{
            choiceId: 1,
            isCorrect: true,
            responseTimeMs: 5000,
          }}
        />
      );

      expect(screen.getByTestId("choice-1")).toBeTruthy();
      expect(screen.getByTestId("choice-2")).toBeTruthy();
    });

    it("ユーザーが選択した選択肢がマークされる", () => {
      render(
        <AnswerDisplay
          questionText="What is 2 + 2?"
          questionImageUrl={null}
          choices={mockChoices}
          userAnswer={{
            choiceId: 2,
            isCorrect: false,
            responseTimeMs: 3000,
          }}
        />
      );

      const selectedChoice = screen.getByTestId("choice-2");
      expect(selectedChoice.getAttribute("data-selected")).toBe("true");
    });

    it("正解の選択肢がマークされる", () => {
      render(
        <AnswerDisplay
          questionText="What is 2 + 2?"
          questionImageUrl={null}
          choices={mockChoices}
          userAnswer={{
            choiceId: 2,
            isCorrect: false,
            responseTimeMs: 3000,
          }}
        />
      );

      const correctChoice = screen.getByTestId("choice-1");
      expect(correctChoice.getAttribute("data-correct")).toBe("true");
    });
  });

  describe("回答時間のフォーマット", () => {
    it("回答時間が正しくフォーマットされる", () => {
      const testCases = [
        { ms: 1000, expected: "1.000秒" },
        { ms: 5000, expected: "5.000秒" },
        { ms: 1234, expected: "1.234秒" },
        { ms: 100, expected: "0.100秒" },
      ];

      testCases.forEach(({ ms, expected }) => {
        const { unmount } = render(
          <AnswerDisplay
            questionText="What is 2 + 2?"
            questionImageUrl={null}
            choices={mockChoices}
            userAnswer={{
              choiceId: 1,
              isCorrect: true,
              responseTimeMs: ms,
            }}
          />
        );

        expect(screen.getByText(expected)).toBeTruthy();
        unmount();
      });
    });
  });
});

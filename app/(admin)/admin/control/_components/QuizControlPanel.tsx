"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/app/_lib/supabase/client";
import {
  updateQuizControl,
  type UpdateQuizControlResult,
} from "@/app/_lib/actions/admin/updateQuizControl";
import { QuizScreen } from "@/app/_lib/types/quiz";
import { QUIZ_TRANSITION_RULES } from "@/app/_lib/constants/quiz-transition";

interface QuizControlPanelProps {
  eventId: number;
}

interface QuizControlState {
  currentScreen: QuizScreen;
  currentPeriodId: number | null;
  currentQuestionId: number | null;
  periodName?: string;
  questionText?: string;
}

/**
 * 画面名マッピング
 */
const SCREEN_NAMES: Record<QuizScreen, string> = {
  waiting: "待機中",
  question: "問題表示",
  answer: "正解発表",
  break: "休憩",
  period_result: "ピリオド結果",
  final_result: "最終結果",
};

/**
 * ボタンの色スキーム
 */
const BUTTON_COLORS: Record<
  QuizScreen,
  { bg: string; border: string; hover: string; text: string }
> = {
  waiting: {
    bg: "bg-slate-50",
    border: "border-slate-300",
    hover: "hover:bg-slate-100 hover:border-slate-400",
    text: "text-slate-900",
  },
  question: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    hover: "hover:bg-amber-100 hover:border-amber-400",
    text: "text-amber-900",
  },
  answer: {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    hover: "hover:bg-emerald-100 hover:border-emerald-400",
    text: "text-emerald-900",
  },
  break: {
    bg: "bg-sky-50",
    border: "border-sky-300",
    hover: "hover:bg-sky-100 hover:border-sky-400",
    text: "text-sky-900",
  },
  period_result: {
    bg: "bg-violet-50",
    border: "border-violet-300",
    hover: "hover:bg-violet-100 hover:border-violet-400",
    text: "text-violet-900",
  },
  final_result: {
    bg: "bg-rose-50",
    border: "border-rose-300",
    hover: "hover:bg-rose-100 hover:border-rose-400",
    text: "text-rose-900",
  },
};

export function QuizControlPanel({ eventId }: QuizControlPanelProps) {
  const [state, setState] = useState<QuizControlState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState(0);

  const supabase = createClient();

  // 初期ロード
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: quizControl, error: controlError } = await supabase
          .from("quiz_control")
          .select("*")
          .eq("event_id", eventId)
          .single();

        if (controlError || !quizControl) {
          setError("クイズ制御情報が見つかりません");
          return;
        }

        // ピリオド情報を取得
        let periodName = "";
        if (quizControl.current_period_id) {
          const { data: period } = await supabase
            .from("periods")
            .select("name")
            .eq("id", quizControl.current_period_id)
            .single();
          periodName = period?.name || "";
        }

        // 質問情報を取得
        let questionText = "";
        if (quizControl.current_question_id) {
          const { data: question } = await supabase
            .from("questions")
            .select("text")
            .eq("id", quizControl.current_question_id)
            .single();
          questionText = question?.text || "";
        }

        // ユーザー数を取得
        const { count: total } = await supabase
          .from("users")
          .select("*", { count: "exact" })
          .eq("event_id", eventId);

        setUserCount(total || 0);

        setState({
          currentScreen: quizControl.current_screen as QuizScreen,
          currentPeriodId: quizControl.current_period_id,
          currentQuestionId: quizControl.current_question_id,
          periodName,
          questionText,
        });
      } catch (err) {
        console.error("Failed to load quiz control:", err);
        setError("読み込み中にエラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialState();
  }, [eventId, supabase]);

  // 画面遷移ボタンのクリック
  const handleTransition = useCallback(
    async (nextScreen: QuizScreen) => {
      if (!state) return;

      setIsUpdating(true);
      setError(null);

      try {
        const result: UpdateQuizControlResult = await updateQuizControl({
          eventId,
          nextScreen,
        });

        // 失敗時は状態を更新しない
        if (!result.success) {
          setError(result.error);
          return;
        }

        // 成功時のみ状態を更新
        // ピリオド情報と質問情報も取得して更新
        let periodName = "";
        if (result.data.currentPeriodId) {
          const { data: period } = await supabase
            .from("periods")
            .select("name")
            .eq("id", result.data.currentPeriodId)
            .single();
          periodName = period?.name || "";
        }

        let questionText = "";
        if (result.data.currentQuestionId) {
          const { data: question } = await supabase
            .from("questions")
            .select("text")
            .eq("id", result.data.currentQuestionId)
            .single();
          questionText = question?.text || "";
        }

        setState((prevState) =>
          prevState
            ? {
                ...prevState,
                currentScreen: result.data.currentScreen,
                currentPeriodId: result.data.currentPeriodId,
                currentQuestionId: result.data.currentQuestionId,
                periodName,
                questionText,
              }
            : null
        );
      } catch (err) {
        console.error("Failed to update quiz control:", err);
        setError("状態更新に失敗しました");
        // 例外時も状態を更新しない
      } finally {
        setIsUpdating(false);
      }
    },
    [state, eventId]
  );

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-center text-red-600">制御パネルが利用できません</p>
      </div>
    );
  }

  const possibleTransitions = QUIZ_TRANSITION_RULES[state.currentScreen] || [];

  // すべての画面状態
  const allScreens: QuizScreen[] = [
    "waiting",
    "question",
    "answer",
    "break",
    "period_result",
    "final_result",
  ];

  return (
    <div className="space-y-6">
      {/* 現在の状態表示 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">現在の状態</h2>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-600 uppercase">
              画面状態
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-900">
              {SCREEN_NAMES[state.currentScreen]}
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-xs font-semibold text-green-600 uppercase">
              参加者数
            </p>
            <p className="mt-2 text-2xl font-bold text-green-900">
              {userCount}
            </p>
          </div>

          <div className="rounded-lg bg-purple-50 p-4">
            <p className="text-xs font-semibold text-purple-600 uppercase">
              正答ユーザー数(未実装)
            </p>
            <p className="mt-2 text-2xl font-bold text-purple-900">
              {userCount}
            </p>
          </div>
        </div>

        {state.periodName && (
          <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm text-gray-600">
            <p>
              <strong>現在のピリオド:</strong> {state.periodName}
            </p>
            {state.questionText && (
              <p>
                <strong>現在の質問:</strong> {state.questionText}
              </p>
            )}
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* 遷移ボタン */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">画面遷移</h2>

        <div className="space-y-2">
          {allScreens.map((nextScreen) => {
            const colors = BUTTON_COLORS[nextScreen];
            const isEnabled = possibleTransitions.includes(nextScreen);

            return (
              <button
                key={nextScreen}
                onClick={() => handleTransition(nextScreen)}
                disabled={isUpdating || !isEnabled}
                className={`
                  w-full px-4 py-3 text-left
                  rounded-lg border-2 ${colors.bg} ${colors.border}
                  ${isEnabled ? colors.hover : "hover:opacity-50"}
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-colors
                  font-medium ${colors.text}
                `}
              >
                {SCREEN_NAMES[nextScreen]} へ移行
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

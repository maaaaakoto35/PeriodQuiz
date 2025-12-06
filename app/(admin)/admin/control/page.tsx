import Link from "next/link";
import { createClient as createServerClient } from "@/app/_lib/supabase/server";
import { QuizControlPanel } from "./_components";
import { type QuizControlState } from "./_hooks";
import { type QuizScreen } from "@/app/_lib/types/quiz";

interface ControlPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * クイズ制御ページ（Server Component）
 *
 * 責務:
 * - 初期ロード（4つのクエリをサーバーで実行）
 * - EventName、QuizControl、Period、Question、UserCount を取得
 * - QuizControlPanel に初期データを Props で渡す
 */
async function getQuizControlData(eventId: number): Promise<{
  eventName: string;
  initialState: QuizControlState;
  userCount: number;
} | null> {
  const supabase = await createServerClient();

  try {
    // 1. イベント名を取得
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("name")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return null;
    }

    // 2. クイズ制御情報を取得
    const { data: quizControl, error: controlError } = await supabase
      .from("quiz_control")
      .select("*")
      .eq("event_id", eventId)
      .single();

    if (controlError || !quizControl) {
      return null;
    }

    // 3. ピリオド情報を取得
    let periodName = "";
    if (quizControl.current_period_id) {
      const { data: period } = await supabase
        .from("periods")
        .select("name")
        .eq("id", quizControl.current_period_id)
        .single();
      periodName = period?.name || "";
    }

    // 4. 質問情報を取得
    let questionText = "";
    if (quizControl.current_question_id) {
      const { data: question } = await supabase
        .from("questions")
        .select("text")
        .eq("id", quizControl.current_question_id)
        .single();
      questionText = question?.text || "";
    }

    // 5. ユーザー数を取得
    const { count: total } = await supabase
      .from("users")
      .select("*", { count: "exact" })
      .eq("event_id", eventId);

    const initialState: QuizControlState = {
      currentScreen: quizControl.current_screen as QuizScreen,
      currentPeriodId: quizControl.current_period_id,
      currentQuestionId: quizControl.current_question_id,
      bgmEnabled: quizControl.bgm_enabled,
      periodName,
      questionText,
    };

    return {
      eventName: event.name,
      initialState,
      userCount: total || 0,
    };
  } catch (err) {
    console.error("[getQuizControlData] Error:", err);
    return null;
  }
}

export default async function ControlPage({ searchParams }: ControlPageProps) {
  const params = await searchParams;
  const eventIdParam = params.eventId;

  if (!eventIdParam || typeof eventIdParam !== "string") {
    return (
      <div className="space-y-6">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">イベントが指定されていません</p>
        </div>
        <Link
          href="/admin/events"
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          イベント一覧に戻る
        </Link>
      </div>
    );
  }

  const eventId = parseInt(eventIdParam, 10);

  if (isNaN(eventId)) {
    return (
      <div className="space-y-6">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">イベントIDが無効です</p>
        </div>
        <Link
          href="/admin/events"
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          イベント一覧に戻る
        </Link>
      </div>
    );
  }

  const data = await getQuizControlData(eventId);

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">クイズ制御情報が見つかりません</p>
        </div>
        <Link
          href="/admin/events"
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          イベント一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {data.eventName} - 画面制御
          </h1>
          <p className="mt-2 text-gray-600">
            リアルタイムでクイズの進行状況を制御します
          </p>
        </div>
      </div>

      {/* 制御パネル */}
      <QuizControlPanel
        eventId={eventId}
        initialState={data.initialState}
        initialUserCount={data.userCount}
      />

      {/* 戻るリンク */}
      <Link
        href="/admin/events"
        className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        イベント一覧に戻る
      </Link>
    </div>
  );
}

/**
 * 未実装画面コンポーネント
 *
 * quiz_control.current_screenが未実装の値（answer, break, period_result, final_result）
 * の場合に表示されるコンポーネント
 */
interface UnimplementedScreenProps {
  currentScreen: string;
}

// TODO: US-003-03〜US-003-06で各画面を実装したら、このコンポーネントは削除する
export function UnimplementedScreen({
  currentScreen,
}: UnimplementedScreenProps) {
  const screenLabels = {
    answer: "正解発表画面",
    break: "休憩画面",
    period_result: "ピリオド結果画面",
    final_result: "最終結果画面",
  } as const;

  const screenLabel =
    currentScreen in screenLabels
      ? screenLabels[currentScreen as keyof typeof screenLabels]
      : "画面";

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">準備中</h1>
        <p className="text-lg text-gray-600">この画面は現在準備中です</p>
      </div>

      <div
        className="
        p-6
        bg-yellow-50 rounded-lg
        border-2 border-yellow-200
      "
      >
        <div className="animate-pulse">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-400 rounded-full opacity-75"></div>
        </div>
        <p className="text-xl font-semibold text-gray-800">
          {screenLabel}の実装準備中
        </p>
        <p className="mt-2 text-sm text-gray-600">
          管理者により次の画面の準備が進められています
        </p>
        <p className="mt-3 text-xs text-gray-500">
          スクリーン:{" "}
          <code className="bg-gray-100 px-2 py-1 rounded">{currentScreen}</code>
        </p>
      </div>

      <div className="pt-4 space-y-2 text-sm text-gray-500">
        <p>💡 このページを開いたままお待ちください</p>
        <p>📱 画面が自動的に切り替わります</p>
      </div>
    </>
  );
}

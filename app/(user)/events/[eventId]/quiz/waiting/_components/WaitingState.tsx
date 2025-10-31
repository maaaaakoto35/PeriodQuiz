import type { Database } from "@/app/_lib/types/database";

type User = Database["public"]["Tables"]["users"]["Row"];

interface WaitingStateProps {
  user: User;
}

/**
 * 待機状態表示コンポーネント（Server Component）
 *
 * ユーザーのニックネームとクイズ開始待機メッセージを表示します
 * ユーザー情報はサーバーから取得済みのため、Server Componentで実装
 */
export function WaitingState({ user }: WaitingStateProps) {
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">参加完了!</h1>
        <p className="text-lg text-gray-600">
          ようこそ、
          <span className="font-semibold text-blue-600">{user.nickname}</span>
          さん
        </p>
      </div>

      <div
        className="
        p-6
        bg-blue-50 rounded-lg
        border-2 border-blue-200
      "
      >
        <div className="animate-pulse">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full opacity-75"></div>
        </div>
        <p className="text-xl font-semibold text-gray-800">
          クイズ開始をお待ちください
        </p>
        <p className="mt-2 text-sm text-gray-600">
          主催者がクイズを開始するまで、このまましばらくお待ちください
        </p>
      </div>

      <div className="pt-4 space-y-2 text-sm text-gray-500">
        <p>💡 このページを開いたままお待ちください</p>
        <p>📱 画面が自動的に切り替わります</p>
      </div>
    </>
  );
}

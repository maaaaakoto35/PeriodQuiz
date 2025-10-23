import type { Database } from "@/app/_lib/types/database";
import { WaitingState } from "./WaitingState";
import { SessionHeartbeatManager } from "./SessionHeartbeatManager";

type User = Database["public"]["Tables"]["users"]["Row"];

interface WaitingPageContentProps {
  user: User;
  eventId: number;
}

/**
 * 待機画面のコンテンツコンポーネント
 *
 * US-001-04の実装：
 * - Realtime監視で quiz_control 変更を検知
 * - 15秒ごとに last_active_at を更新
 * - セッション状態をユーザーに表示
 *
 * コンポーネント構成：
 * - WaitingState: Server Component で待機状態を表示
 * - SessionHeartbeatManager: Client Component でハートビート管理
 */
export function WaitingPageContent({ user, eventId }: WaitingPageContentProps) {
  return (
    <main
      className="
      flex flex-col items-center justify-center
      min-h-screen
      p-4
      bg-gradient-to-br from-blue-50 to-indigo-100
    "
    >
      <div
        className="
        w-full max-w-md
        p-8 space-y-6
        bg-white rounded-lg shadow-lg
        text-center
      "
      >
        <WaitingState user={user} />

        <SessionHeartbeatManager eventId={eventId} userId={user.id} />
      </div>
    </main>
  );
}

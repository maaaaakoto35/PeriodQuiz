"use client";

interface MonitorWaitingProps {
  eventId: number;
}

/**
 * モニター画面 - 待機中
 *
 * クイズ開始を待っている状態を表示
 */
export function MonitorWaiting({ eventId }: MonitorWaitingProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-r-blue-600"></div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          クイズ開始待機中
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          主催者がクイズを開始するまで、このまましばらくお待ちください
        </p>

        <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
          <p className="text-sm text-gray-600">
            このモニター画面は、ユーザー画面と同期して自動的に切り替わります
          </p>
        </div>
      </div>
    </div>
  );
}

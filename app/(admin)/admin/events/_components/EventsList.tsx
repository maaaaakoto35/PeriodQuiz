"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getEvents,
  deleteEvent,
  type EventRecord,
} from "@/app/_lib/actions/admin/events";

export function EventsList() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  // イベント一覧取得
  const loadEvents = async () => {
    setIsLoading(true);
    setError("");
    const result = await getEvents();
    if (result.success && result.data) {
      setEvents(result.data);
    } else {
      setError(result.error || "イベント一覧の取得に失敗しました");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // イベント削除
  const handleDelete = async (eventId: number) => {
    if (!confirm("このイベントを削除してもよろしいですか？")) {
      return;
    }

    setActionInProgress(eventId);
    const result = await deleteEvent({ id: eventId });

    if (result.success) {
      setEvents(events.filter((e) => e.id !== eventId));
    } else {
      setError(result.error || "イベント削除に失敗しました");
    }
    setActionInProgress(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">イベント一覧</h2>
        <Link
          href="/admin/events/new"
          className="
            inline-flex items-center justify-center
            rounded-md bg-blue-600 px-4 py-2
            text-sm font-medium text-white
            hover:bg-blue-700
            transition-colors
          "
        >
          新規作成
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">イベントがまだ作成されていません</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  イベント名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  作成日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{event.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {event.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(event.created_at).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="
                          inline-flex items-center justify-center
                          rounded px-2 py-1
                          text-xs font-medium text-blue-600
                          hover:bg-blue-50
                          transition-colors
                        "
                      >
                        編集
                      </Link>
                      <Link
                        href={`/admin/events/${event.id}/periods`}
                        className="
                          inline-flex items-center justify-center
                          rounded px-2 py-1
                          text-xs font-medium text-purple-600
                          hover:bg-purple-50
                          transition-colors
                        "
                      >
                        クイズ作成
                      </Link>
                      <Link
                        href={`/admin/control?eventId=${event.id}`}
                        className="
                          inline-flex items-center justify-center
                          rounded px-2 py-1
                          text-xs font-medium text-orange-600
                          hover:bg-orange-50
                          transition-colors
                        "
                      >
                        制御
                      </Link>
                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={actionInProgress === event.id}
                        className="
                          inline-flex items-center justify-center
                          rounded px-2 py-1
                          text-xs font-medium text-red-600
                          hover:bg-red-50
                          disabled:text-gray-400
                          transition-colors
                        "
                      >
                        {actionInProgress === event.id ? "処理中..." : "削除"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

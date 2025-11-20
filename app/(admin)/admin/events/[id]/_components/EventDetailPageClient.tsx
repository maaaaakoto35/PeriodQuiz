"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getEvent,
  updateEvent,
  type EventRecord,
} from "@/app/_lib/actions/admin/events";
import { EventForm } from "../../_components/EventForm";

interface EventDetailPageClientProps {
  id: string;
}

export function EventDetailPageClient({ id }: EventDetailPageClientProps) {
  const router = useRouter();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      setIsLoading(true);
      setError("");
      const result = await getEvent(id);
      if (result.success && result.data) {
        setEvent(result.data);
      } else {
        setError(result.error || "イベントの取得に失敗しました");
      }
      setIsLoading(false);
    };

    loadEvent();
  }, [id]);

  const handleSubmit = async (data: { name: string; description: string }) => {
    setIsSaving(true);
    setError("");
    try {
      const result = await updateEvent({
        id,
        ...data,
      });
      if (result.success && result.data) {
        setEvent(result.data);
        router.push("/admin/events");
      } else {
        throw new Error(result.error || "イベント更新に失敗しました");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="space-y-6">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
        <Link
          href="/admin/events"
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          イベント一覧に戻る
        </Link>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">イベント編集</h1>
          <p className="mt-2 text-gray-600">イベント情報を編集します</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-6">
          <EventForm
            initialData={event}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 h-fit space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              作成日時
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(event.created_at).toLocaleDateString("ja-JP")}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              更新日時
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(event.updated_at).toLocaleDateString("ja-JP")}
            </p>
          </div>
        </div>
      </div>

      <Link
        href="/admin/events"
        className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        キャンセル
      </Link>
    </div>
  );
}

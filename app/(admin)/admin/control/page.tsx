"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/app/_lib/supabase/client";
import { QuizControlPanel } from "./_components/QuizControlPanel";

export default function ControlPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [eventName, setEventName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setError("イベントIDが指定されていません");
      setIsLoading(false);
      return;
    }

    const loadEventName = async () => {
      try {
        const supabase = createClient();
        const { data, error: queryError } = await supabase
          .from("events")
          .select("name")
          .eq("id", parseInt(eventId))
          .single();

        if (queryError || !data) {
          setError("イベントが見つかりません");
          return;
        }

        setEventName(data.name);
      } catch (err) {
        console.error("Failed to load event:", err);
        setError("イベント情報の読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    loadEventName();
  }, [eventId]);

  if (!eventId) {
    return (
      <div className="space-y-6">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">イベントが指定されていません</p>
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
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

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {eventName ? `${eventName} - 画面制御` : "画面制御"}
          </h1>
          <p className="mt-2 text-gray-600">
            リアルタイムでクイズの進行状況を制御します
          </p>
        </div>
      </div>

      {/* 制御パネル */}
      <QuizControlPanel eventId={parseInt(eventId)} />

      {/* 戻るリンク */}
      <Link
        href="/admin/events"
        className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        イベント一覧に戻る
      </Link>
    </div>
  );
}

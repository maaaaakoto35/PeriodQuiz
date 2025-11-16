"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createEvent } from "@/app/_lib/actions/admin/events";
import { EventForm } from "../_components/EventForm";

export default function NewEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: { name: string; description: string }) => {
    setIsLoading(true);
    try {
      const result = await createEvent(data);
      if (result.success) {
        router.push("/admin/events");
      } else {
        throw new Error(result.error || "イベント作成に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新規イベント作成</h1>
          <p className="mt-2 text-gray-600">新しいクイズイベントを作成します</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6">
        <EventForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      <Link
        href="/admin/events"
        className="
          inline-flex items-center justify-center
          rounded-md px-4 py-2
          text-sm font-medium text-gray-600
          hover:text-gray-900 hover:bg-gray-100
          transition-colors
        "
      >
        キャンセル
      </Link>
    </div>
  );
}

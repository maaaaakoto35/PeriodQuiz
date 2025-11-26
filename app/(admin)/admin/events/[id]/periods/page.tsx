"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPeriods } from "@/app/_lib/actions/admin/periods";
import { PeriodList } from "./_components/PeriodList";
import type { PeriodRecord } from "@/app/_lib/actions/admin/periods";

export default function PeriodsPage() {
  const params = useParams();
  const eventId = Number(params.id);

  const [periods, setPeriods] = useState<PeriodRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPeriods = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await getPeriods({ eventId });
      if (result.success && result.data) {
        setPeriods(result.data);
      } else {
        setError(result.error || "ピリオド一覧の取得に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">クイズ作成</h1>
          <p className="mt-2 text-gray-600">ピリオドごとにクイズを作成します</p>
        </div>
        <Link
          href={`/admin/events/${eventId}/periods/new`}
          className="
            inline-flex items-center justify-center
            rounded-md bg-blue-600 px-4 py-2
            text-sm font-medium text-white
            hover:bg-blue-700
            transition-colors
          "
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          新規ピリオド作成
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <PeriodList
            periods={periods}
            eventId={eventId}
            onUpdate={fetchPeriods}
          />
        </div>
      )}

      <Link
        href="/admin/events/"
        className="
          inline-flex items-center justify-center
          rounded-md px-4 py-2
          text-sm font-medium text-gray-600
          hover:text-gray-900 hover:bg-gray-100
          transition-colors
        "
      >
        戻る
      </Link>
    </div>
  );
}

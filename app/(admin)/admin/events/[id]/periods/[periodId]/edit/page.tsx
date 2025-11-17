"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getPeriods, updatePeriod } from "@/app/_lib/actions/admin/periods";
import { PeriodForm } from "../../_components/PeriodForm";
import type { PeriodRecord } from "@/app/_lib/actions/admin/periods";

export default function EditPeriodPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.id);
  const periodId = Number(params.periodId);

  const [period, setPeriod] = useState<PeriodRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPeriod = async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await getPeriods({ eventId });
        if (result.success && result.data) {
          const found = result.data.find((p) => p.id === periodId);
          if (found) {
            setPeriod(found);
          } else {
            setError("ピリオドが見つかりません");
          }
        } else {
          setError("ピリオド情報の取得に失敗しました");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPeriod();
  }, [eventId, periodId]);

  const handleSubmit = async (data: { name: string }) => {
    setIsSubmitting(true);
    try {
      const result = await updatePeriod({
        id: periodId,
        name: data.name,
      });
      if (result.success) {
        router.push(`/admin/events/${eventId}/periods`);
      } else {
        throw new Error(result.error || "ピリオド更新に失敗しました");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error || !period) {
    return (
      <div className="space-y-6">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {error || "ピリオドが見つかりません"}
          </p>
        </div>
        <Link
          href={`/admin/events/${eventId}/periods`}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ピリオド編集</h1>
          <p className="mt-2 text-gray-600">
            ピリオド「{period.name}」を編集します
          </p>
        </div>
      </div>

      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6">
        <PeriodForm
          initialData={period}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>

      <Link
        href={`/admin/events/${eventId}/periods`}
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

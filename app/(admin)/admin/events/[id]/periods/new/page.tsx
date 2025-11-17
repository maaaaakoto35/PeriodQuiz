"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { createPeriod } from "@/app/_lib/actions/admin/periods";
import { PeriodForm } from "../_components/PeriodForm";

export default function NewPeriodPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.id);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: { name: string }) => {
    setIsLoading(true);
    try {
      const result = await createPeriod({
        eventId,
        name: data.name,
      });
      if (result.success) {
        router.push(`/admin/events/${eventId}/periods`);
      } else {
        throw new Error(result.error || "ピリオド作成に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新規ピリオド作成</h1>
          <p className="mt-2 text-gray-600">新しいピリオドを作成します</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6">
        <PeriodForm onSubmit={handleSubmit} isLoading={isLoading} />
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

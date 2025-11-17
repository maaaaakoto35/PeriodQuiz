"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { usePeriodFormSubmit } from "../_hooks/usePeriodFormSubmit";
import { PeriodForm } from "../_components/PeriodForm";

export default function NewPeriodPage() {
  const params = useParams();
  const eventId = Number(params.id);

  const { isLoading, error, handleSubmit } = usePeriodFormSubmit({
    eventId,
  });

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
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { deletePeriod, reorderPeriods } from "@/app/_lib/actions/admin/periods";
import type { PeriodRecord } from "@/app/_lib/actions/admin/periods";

interface PeriodListProps {
  periods: PeriodRecord[];
  eventId: number;
  onUpdate: () => Promise<void>;
}

export function PeriodList({ periods, eventId, onUpdate }: PeriodListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [localPeriods, setLocalPeriods] = useState(periods);

  const handleDelete = async (id: number) => {
    if (!confirm("このピリオドを削除してもよろしいですか？")) {
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const result = await deletePeriod({ id });
      if (!result.success) {
        setError(result.error || "削除に失敗しました");
      } else {
        await onUpdate();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newPeriods = [...localPeriods];
    const [movedPeriod] = newPeriods.splice(index, 1);
    newPeriods.splice(index - 1, 0, movedPeriod);

    setLocalPeriods(newPeriods);

    const reorderedData = newPeriods.map((p, i) => ({
      id: p.id,
      orderNum: i + 1,
    }));

    setIsLoading(true);
    setError("");
    try {
      const result = await reorderPeriods({
        eventId,
        periods: reorderedData,
      });
      if (!result.success) {
        setError(result.error || "順序変更に失敗しました");
        setLocalPeriods(periods);
      } else {
        await onUpdate();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === localPeriods.length - 1) return;

    const newPeriods = [...localPeriods];
    const [movedPeriod] = newPeriods.splice(index, 1);
    newPeriods.splice(index + 1, 0, movedPeriod);

    setLocalPeriods(newPeriods);

    const reorderedData = newPeriods.map((p, i) => ({
      id: p.id,
      orderNum: i + 1,
    }));

    setIsLoading(true);
    setError("");
    try {
      const result = await reorderPeriods({
        eventId,
        periods: reorderedData,
      });
      if (!result.success) {
        setError(result.error || "順序変更に失敗しました");
        setLocalPeriods(periods);
      } else {
        await onUpdate();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {localPeriods.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">ピリオドがまだ作成されていません</p>
          <Link
            href={`/admin/events/${eventId}/periods/new`}
            className="
              mt-4 inline-block
              rounded-md bg-blue-600 px-4 py-2
              text-sm font-medium text-white
              hover:bg-blue-700
              transition-colors
            "
          >
            新規ピリオド作成
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {localPeriods.map((period, index) => (
            <div
              key={period.id}
              className="
                flex items-center justify-between
                rounded-lg border border-gray-200 bg-white p-4
                transition-shadow hover:shadow-md
              "
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">
                    #{period.order_num}
                  </span>
                  <h3 className="text-lg font-medium text-gray-900">
                    {period.name}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    {period.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0 || isLoading}
                  title="上へ移動"
                  className="
                    p-2 text-gray-400 hover:text-gray-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === localPeriods.length - 1 || isLoading}
                  title="下へ移動"
                  className="
                    p-2 text-gray-400 hover:text-gray-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <Link
                  href={`/admin/events/${eventId}/periods/${period.id}/edit`}
                  className="
                    inline-flex items-center justify-center
                    rounded-md px-3 py-2
                    text-sm font-medium text-blue-600
                    hover:bg-blue-50
                    transition-colors
                  "
                >
                  編集
                </Link>

                <button
                  onClick={() => handleDelete(period.id)}
                  disabled={isLoading}
                  className="
                    inline-flex items-center justify-center
                    rounded-md px-3 py-2
                    text-sm font-medium text-red-600
                    hover:bg-red-50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

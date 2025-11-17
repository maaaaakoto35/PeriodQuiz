"use client";

import { useState } from "react";
import Link from "next/link";
import { deletePeriod, reorderPeriods } from "@/app/_lib/actions/admin/periods";
import { PeriodListItem } from "./PeriodListItem";
import { moveUp, moveDown } from "./utils/reorderPeriods";
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

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const newPeriods =
      direction === "up" ? moveUp(localPeriods, index) : moveDown(localPeriods, index);
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
            <PeriodListItem
              key={period.id}
              period={period}
              index={index}
              totalCount={localPeriods.length}
              onMoveUp={() => handleReorder(index, "up")}
              onMoveDown={() => handleReorder(index, "down")}
              onDelete={handleDelete}
              eventId={eventId}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}


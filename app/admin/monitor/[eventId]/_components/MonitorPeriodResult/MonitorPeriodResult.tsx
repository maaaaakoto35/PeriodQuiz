"use client";

import { useEffect, useState } from "react";
import {
  getPeriodResultsForMonitor,
  type PeriodResultData,
} from "@/app/_lib/actions/admin";

interface MonitorPeriodResultProps {
  eventId: number;
}

/**
 * モニター画面 - ピリオド結果
 *
 * ピリオド終了時のランキングを表示
 */
export function MonitorPeriodResult({ eventId }: MonitorPeriodResultProps) {
  const [data, setData] = useState<PeriodResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetch = async () => {
      const result = await getPeriodResultsForMonitor(eventId);

      if (!isMounted) return;

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    fetch();
    return () => {
      isMounted = false;
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-r-blue-600"></div>
          <p className="mt-4 text-gray-600">結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-red-600 font-semibold">
            {error || "読み込み失敗"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* タイトル */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ピリオド結果</h1>
        <p className="text-lg text-gray-600">{data.periodName}</p>
      </div>

      {/* ランキング表 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
            <tr>
              <th className="px-6 py-4 text-left text-white font-bold">順位</th>
              <th className="px-6 py-4 text-left text-white font-bold">
                ニックネーム
              </th>
              <th className="px-6 py-4 text-right text-white font-bold">
                正解数
              </th>
            </tr>
          </thead>
          <tbody>
            {data.ranking.length > 0 ? (
              data.ranking.map((entry, index) => (
                <tr
                  key={`${entry.rank}-${entry.userId}`}
                  className={`border-t border-gray-200 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-semibold">
                    {entry.nickname}
                  </td>
                  <td className="px-6 py-4 text-right text-lg font-bold text-blue-600">
                    {entry.correctCount}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  ランキングデータがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

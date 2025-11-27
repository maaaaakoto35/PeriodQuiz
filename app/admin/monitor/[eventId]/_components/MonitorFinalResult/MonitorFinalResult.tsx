"use client";

import { useEffect, useState } from "react";
import { getFinalResultForMonitor } from "@/app/_lib/actions/admin";
import type { FinalResultDataForMonitor } from "@/app/_lib/actions/admin";

interface MonitorFinalResultProps {
  eventId: number;
}

/**
 * モニター画面 - 最終結果
 *
 * クイズ終了時の最終ランキングを表示
 */
export function MonitorFinalResult({ eventId }: MonitorFinalResultProps) {
  const [data, setData] = useState<FinalResultDataForMonitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFinalResult = async () => {
      const result = await getFinalResultForMonitor(eventId);

      if (!isMounted) return;

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    fetchFinalResult();

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

  const rankings = data.ranking;
  const eventName = data.eventName;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* タイトル */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🎉 最終結果</h1>
        {eventName && <p className="text-lg text-gray-600">{eventName}</p>}
      </div>

      {/* トップ3表示 */}
      {rankings.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-4">
          {rankings.slice(0, 3).map((entry, index) => {
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <div
                key={`${entry.rank}-${entry.nickname}`}
                className={`p-6 rounded-lg border-2 transition-all ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-500"
                    : index === 1
                    ? "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400"
                    : "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{medals[index]}</span>
                    <div>
                      <p className="text-sm text-gray-600">第{entry.rank}位</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {entry.nickname}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">正解数</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {entry.correctCount}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 全ランキング表 */}
      {rankings.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
              <tr>
                <th className="px-6 py-4 text-left text-white font-bold">
                  順位
                </th>
                <th className="px-6 py-4 text-left text-white font-bold">
                  ニックネーム
                </th>
                <th className="px-6 py-4 text-right text-white font-bold">
                  正解数
                </th>
                <th className="px-6 py-4 text-right text-white font-bold">
                  合計回答時間
                </th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((entry, index) => (
                <tr
                  key={`${entry.rank}-${entry.nickname}`}
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
                  <td className="px-6 py-4 text-right text-gray-600">
                    {(entry.totalResponseTimeMs / 1000).toFixed(1)}秒
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ピリオドチャンピオン表示 */}
      {data.periodChampions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🏆 ピリオドチャンピオン
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {data.periodChampions.map((champion) => (
              <div
                key={champion.periodId}
                className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {champion.periodName}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {champion.nickname}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">正解数</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {champion.correctCount}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

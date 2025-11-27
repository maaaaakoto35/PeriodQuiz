"use client";

import { useState, useMemo } from "react";
import { type RankingsData } from "@/app/_lib/types/ranking";

interface RankingsPanelProps {
  rankings: RankingsData | null;
  isLoading: boolean;
}

/**
 * ランキング表示コンポーネント
 * ピリオドランキングとイベント全体ランキングをタブで切り替え
 */
export function RankingsPanel({ rankings, isLoading }: RankingsPanelProps) {
  const [activeTab, setActiveTab] = useState<"period" | "event">("period");

  const displayRankings = useMemo(() => {
    if (!rankings) return [];

    return activeTab === "period"
      ? rankings.period.entries
      : rankings.event.entries;
  }, [rankings, activeTab]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4" />
          <p className="text-gray-600">ランキングを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!rankings) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-center">
          ランキングデータを取得できません
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* タブ切り替え */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("period")}
          className={`
            px-4 py-2 font-semibold transition-colors
            ${
              activeTab === "period"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }
          `}
        >
          ピリオドランキング
        </button>
        <button
          onClick={() => setActiveTab("event")}
          className={`
            px-4 py-2 font-semibold transition-colors
            ${
              activeTab === "event"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }
          `}
        >
          イベント全体ランキング
        </button>
      </div>

      {/* ランキング表示 */}
      <div className="overflow-x-auto">
        {displayRankings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            ランキングデータがありません
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  順位
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  ニックネーム
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  正解数
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  回答数
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  合計時間
                </th>
              </tr>
            </thead>
            <tbody>
              {displayRankings.map((entry, index) => (
                <tr
                  key={`${entry.userId}-${index}`}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {getMedalEmoji(entry.rank)}
                    {entry.rank}位
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {entry.nickname}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 font-semibold">
                    {entry.correctCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">
                    {entry.answeredCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">
                    {formatTime(entry.totalResponseTimeMs)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* タブ情報 */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div>
          {activeTab === "period"
            ? `ピリオドランキング（Top ${displayRankings.length}）`
            : `イベント全体ランキング（Top ${displayRankings.length}）`}
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          5秒ごとに更新
        </div>
      </div>
    </div>
  );
}

/**
 * 順位に応じたメダル絵文字を返す
 */
function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return "🥇 ";
    case 2:
      return "🥈 ";
    case 3:
      return "🥉 ";
    default:
      return "";
  }
}

/**
 * ミリ秒を秒単位の文字列に変換（小数点第3位まで）
 */
function formatTime(ms: number): string {
  const seconds = ms / 1000;
  return `${seconds.toFixed(3)}秒`;
}

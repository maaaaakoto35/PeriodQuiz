"use client";

import { type FinalResultData } from "@/app/_lib/actions/user";

interface FinalResultDisplayProps {
  data: FinalResultData;
}

/**
 * 最終結果表示コンポーネント（Client Component）
 *
 * 責務:
 * 1. イベント名の表示
 * 2. 全体ランキング表示（上位20位）
 * 3. ユーザーの順位と成績表示
 * 4. 優勝者（1位）の特別な強調表示
 * 5. 各ピリオドのチャンピオン一覧表示
 */
export function FinalResultDisplay({ data }: FinalResultDisplayProps) {
  const { eventName, ranking, userResult, periodChampions } = data;
  const isChampion = userResult.rank === 1;

  // 回答時間をミリ秒から秒に変換
  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(1);
  };

  return (
    <div
      className="
        w-full min-h-screen
        flex items-center justify-center
        p-4
      "
      style={{
        backgroundImage: "url('/quiz_background.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 背景オーバーレイ */}
      <div className="absolute inset-0 bg-black/30" />

      {/* メインコンテンツ */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* ヘッダー */}
        <div
          className="
            bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400
            px-8 py-6
            text-white text-center
            rounded-t-2xl
            border-b-4 border-yellow-400
            shadow-2xl
          "
        >
          <h1 className="text-4xl font-bold mb-2">最終結果</h1>
          <p className="text-2xl font-bold text-yellow-200">{eventName}</p>
        </div>

        {/* メインコンテンツ */}
        <div
          className="
            bg-white/95 backdrop-blur
            px-8 py-8
            space-y-8
          "
        >
          {/* 全体ランキングセクション */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              全体ランキング
            </h2>

            {/* ランキングリスト */}
            <div className="space-y-3">
              {ranking.map((entry) => (
                <div
                  key={entry.userId}
                  className={`
                    flex items-center gap-4 px-6 py-4 rounded-lg
                    font-bold text-lg
                    transition-all transform
                    ${
                      entry.rank === 1
                        ? "bg-gradient-to-r from-yellow-300 to-yellow-200 shadow-lg scale-105"
                        : entry.rank <= 3
                        ? "bg-gradient-to-r from-gray-100 to-gray-50 shadow-md"
                        : "bg-gray-50 hover:bg-gray-100"
                    }
                    border-l-4
                    ${
                      entry.rank === 1
                        ? "border-yellow-500"
                        : entry.rank === 2
                        ? "border-gray-400"
                        : entry.rank === 3
                        ? "border-orange-300"
                        : "border-purple-300"
                    }
                  `}
                >
                  {/* 順位 */}
                  <div className="w-16 text-center flex-shrink-0">
                    <div className="text-3xl font-black">
                      {entry.rank === 1
                        ? "🥇"
                        : entry.rank === 2
                        ? "🥈"
                        : entry.rank === 3
                        ? "🥉"
                        : entry.rank}
                    </div>
                  </div>

                  {/* ニックネーム */}
                  <div className="flex-grow">
                    <p className="text-gray-900 truncate">{entry.nickname}</p>
                  </div>

                  {/* 正解数バッジ */}
                  <div className="flex-shrink-0 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {entry.correctCount}問
                  </div>

                  {/* 合計時間 */}
                  <div className="w-24 text-right flex-shrink-0">
                    <p className="text-gray-800 font-bold">
                      {formatTime(entry.totalResponseTimeMs)}秒
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 区切り線 */}
          <div className="my-6 border-t-2 border-gray-300" />

          {/* ユーザーの順位と成績 */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              あなたの成績
            </h2>
            <div
              className={`
                rounded-2xl border-4 p-8
                ${
                  isChampion
                    ? "bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-400 shadow-xl"
                    : "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 shadow-lg"
                }
              `}
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-gray-600 font-semibold text-sm">
                    順位
                  </span>
                  <p
                    className={`
                      text-4xl font-black mt-2
                      ${isChampion ? "text-yellow-600" : "text-purple-600"}
                    `}
                  >
                    {userResult.rank === 1 ? "🏆" : userResult.rank}位
                  </p>
                </div>

                <div>
                  <span className="text-gray-600 font-semibold text-sm">
                    ニックネーム
                  </span>
                  <p className="text-2xl font-bold text-gray-900 mt-2 truncate">
                    {userResult.nickname}
                  </p>
                </div>

                <div>
                  <span className="text-gray-600 font-semibold text-sm">
                    全体正解数
                  </span>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {userResult.correctCount}問
                  </p>
                </div>

                <div>
                  <span className="text-gray-600 font-semibold text-sm">
                    全体合計時間
                  </span>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatTime(userResult.totalResponseTimeMs)}秒
                  </p>
                </div>
              </div>

              {/* 優勝者メッセージ */}
              {isChampion && (
                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-xl border-4 border-yellow-500 text-center">
                  <p className="text-3xl font-black text-yellow-900 mb-2">
                    🎉 優勝です！ 🎉
                  </p>
                  <p className="text-lg font-semibold text-yellow-800">
                    全員の中でチャンピオンです！おめでとうございます！
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 区切り線 */}
          {periodChampions.length > 0 && (
            <div className="my-6 border-t-2 border-gray-300" />
          )}

          {/* ピリオドチャンピオン一覧 */}
          {periodChampions.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                各ピリオドのチャンピオン
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {periodChampions.map((champion) => (
                  <div
                    key={champion.periodId}
                    className="
                      bg-gradient-to-r from-amber-50 to-orange-50
                      rounded-xl border-2 border-amber-300
                      p-6
                      shadow-md hover:shadow-lg transition-shadow
                    "
                  >
                    <h3 className="text-lg font-bold text-amber-900 mb-3">
                      {champion.periodName}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold">
                          チャンピオン
                        </span>
                        <span className="text-xl font-bold text-amber-600">
                          {champion.nickname}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold">
                          正解数
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {champion.correctCount}問
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div
          className="
            bg-gradient-to-r from-purple-600 to-purple-500
            px-8 py-4
            text-white text-center
            rounded-b-2xl
            text-sm font-semibold
          "
        >
          ご参加ありがとうございました！
        </div>
      </div>
    </div>
  );
}

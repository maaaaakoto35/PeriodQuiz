"use client";

import Image from "next/image";
import { useBreakImageRotation } from "./hooks/useBreakImageRotation";

interface BreakImage {
  id: string;
  image_url: string;
}

interface BreakScreenClientProps {
  images: BreakImage[];
}

/**
 * 休憩画面のクライアント側（画像カルーセル）
 * - ランダム順序で画像を表示
 * - 5秒ごとに自動で次の画像に切り替え
 * - 前後のボタン、キーボード操作対応
 */
export function BreakScreenClient({ images }: BreakScreenClientProps) {
  const { currentImage, currentIndex, goToSlide } =
    useBreakImageRotation(images);

  if (!currentImage) {
    return null;
  }

  return (
    <>
      {/* メインコンテンツ */}
      <div
        className="
        relative z-10 flex flex-col items-center justify-start h-full
        px-4 py-8
      "
      >
        {/* 白枠カード */}
        <div
          className="
          bg-white rounded-2xl shadow-2xl
          p-8 w-[70vw]
          flex flex-col items-center
        "
        >
          {/* 休憩中テキスト */}
          <h1
            className="
            text-3xl font-bold text-gray-800 mb-6
            md:text-4xl
          "
          >
            休憩中☕
          </h1>

          {/* カルーセルコンテナ */}
          <div className="relative w-full mb-6">
            {/* 画像表示エリア */}
            <div
              className="
              relative h-[200px] overflow-hidden
              rounded-lg bg-gray-100
            "
            >
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`
                    absolute inset-0
                    transition-opacity duration-700 ease-in-out
                    flex items-center justify-center
                    ${index === currentIndex ? "opacity-100" : "opacity-0"}
                  `}
                >
                  <Image
                    src={image.image_url}
                    alt={`休憩画像 ${index + 1}`}
                    width={600}
                    height={400}
                    className="
                      w-full h-full object-contain
                    "
                    priority={index === currentIndex}
                  />
                </div>
              ))}
            </div>

            {/* インジケータ */}
            {images.length > 1 && (
              <div
                className="
                absolute bottom-4 left-1/2 -translate-x-1/2 z-30
                flex gap-2
              "
              >
                {images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`
                      h-3 w-3 rounded-full
                      transition-all duration-300 ease-in-out
                      ${
                        index === currentIndex
                          ? "bg-blue-600 w-6 scale-100"
                          : "bg-white/50 hover:bg-white/80"
                      }
                    `}
                    aria-current={index === currentIndex}
                    aria-label={`スライド ${index + 1}`}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 画像カウント表示 */}
          {images.length > 1 && (
            <div
              className="
              text-sm font-medium text-gray-500
            "
            >
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

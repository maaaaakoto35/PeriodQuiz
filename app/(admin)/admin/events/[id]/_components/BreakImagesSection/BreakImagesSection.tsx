"use client";

import { useEffect, useRef, useState } from "react";
import { useBreakImages } from "./hooks/useBreakImages";

interface BreakImagesSectionProps {
  eventId: number;
}

/**
 * 休憩画像セクション（Admin画面用）
 * - 画像のアップロード
 * - 画像のプレビュー
 * - 画像の削除
 * - 最大10枚制限
 */
export function BreakImagesSection({ eventId }: BreakImagesSectionProps) {
  const {
    images,
    isLoading,
    isUploading,
    error,
    fetchImages,
    handleUpload,
    handleDelete,
  } = useBreakImages(eventId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // マウント時に画像を取得
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];

    if (!file) return;

    // ファイル形式チェック
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedMimeTypes.includes(file.type)) {
      setUploadError("PNG, JPEG, WebP, GIF形式のみ対応しています");
      return;
    }

    // ファイルサイズチェック
    if (file.size > 4 * 1024 * 1024) {
      setUploadError("ファイルサイズは4MB以下にしてください");
      return;
    }

    await handleUpload(file);

    // ファイルインプットをリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const maxImagesReached = images.length >= 10;

  return (
    <section
      className="
      bg-white rounded-lg border border-gray-200 p-6 shadow-sm
    "
    >
      <h2
        className="
        text-lg font-semibold text-gray-900 mb-4
      "
      >
        休憩画像
      </h2>

      {/* エラーメッセージ */}
      {(error || uploadError) && (
        <div
          className="
          bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700
        "
        >
          {error || uploadError}
        </div>
      )}

      {/* 画像数表示 */}
      <p
        className="
        text-sm text-gray-600 mb-4
      "
      >
        {images.length}/10 枚アップロード済み
      </p>

      {/* ファイルアップロード */}
      <div
        className="
        mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg
        hover:border-gray-400 transition-colors
      "
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          disabled={maxImagesReached || isUploading}
          className="
            hidden
          "
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={maxImagesReached || isUploading}
          className="
            w-full py-3 px-4 rounded-lg bg-blue-50 text-blue-700
            border border-blue-200 hover:bg-blue-100
            disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200
            disabled:cursor-not-allowed
            transition-colors font-medium
          "
        >
          {isUploading
            ? "アップロード中..."
            : maxImagesReached
            ? "最大枚数に達しました"
            : "+ 画像を追加"}
        </button>

        <p
          className="
          text-xs text-gray-500 mt-2 text-center
        "
        >
          {maxImagesReached
            ? "最大10枚までアップロード可能です"
            : "対応形式: PNG, JPEG, WebP, GIF（最大4MB）"}
        </p>
      </div>

      {/* 画像リスト */}
      {isLoading ? (
        <div
          className="
          text-center py-8 text-gray-500
        "
        >
          読み込み中...
        </div>
      ) : images.length === 0 ? (
        <div
          className="
          text-center py-8 text-gray-500
        "
        >
          休憩画像がまだアップロードされていません
        </div>
      ) : (
        <div
          className="
          grid grid-cols-2 sm:grid-cols-3 gap-4
        "
        >
          {images.map((image) => (
            <div
              key={image.id}
              className="
                relative group
              "
            >
              {/* 画像 */}
              <div
                className="
                aspect-square bg-gray-100 rounded-lg overflow-hidden
                border border-gray-200
              "
              >
                <img
                  src={image.image_url}
                  alt="休憩画像"
                  className="
                    w-full h-full object-cover
                  "
                />
              </div>

              {/* 削除ボタン（ホバー時表示） */}
              <button
                onClick={() => handleDelete(image.id)}
                className="
                  absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50
                  group-hover:bg-opacity-50 transition-all
                  flex items-center justify-center
                  opacity-0 group-hover:opacity-100
                "
                aria-label="削除"
              >
                <span
                  className="
                  text-white text-sm font-medium
                "
                >
                  削除
                </span>
              </button>

              {/* 日付 */}
              <p
                className="
                text-xs text-gray-500 mt-1
              "
              >
                {new Date(image.created_at).toLocaleDateString("ja-JP")}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

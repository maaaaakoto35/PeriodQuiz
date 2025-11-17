"use client";

import { useState } from "react";
import type { EventRecord } from "@/app/_lib/actions/admin/events";

interface EventFormProps {
  initialData?: EventRecord;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  isLoading?: boolean;
}

export function EventForm({
  initialData,
  onSubmit,
  isLoading = false,
}: EventFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // バリデーション
    if (!name.trim()) {
      setError("イベント名は必須です");
      return;
    }
    if (name.length > 100) {
      setError("イベント名は100文字以内で入力してください");
      return;
    }
    if (!description.trim()) {
      setError("説明は必須です");
      return;
    }
    if (description.length > 1000) {
      setError("説明は1000文字以内で入力してください");
      return;
    }

    try {
      await onSubmit({ name, description });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          イベント名 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          disabled={isLoading}
          className="
            mt-1 block w-full
            rounded-md border border-gray-300
            px-3 py-2
            text-gray-900
            placeholder-gray-500
            shadow-sm
            focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
          "
          placeholder="例：2025年度 クイズ大会"
        />
        <p className="mt-1 text-xs text-gray-500">{name.length}/100文字</p>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          説明 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          disabled={isLoading}
          rows={5}
          className="
            mt-1 block w-full
            rounded-md border border-gray-300
            px-3 py-2
            text-gray-900
            placeholder-gray-500
            shadow-sm
            focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
          "
          placeholder="このイベントについて説明してください"
        />
        <p className="mt-1 text-xs text-gray-500">
          {description.length}/1000文字
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="
            inline-flex items-center justify-center
            rounded-md bg-blue-600 px-4 py-2
            text-sm font-medium text-white
            hover:bg-blue-700
            disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {isLoading ? "処理中..." : initialData ? "更新" : "作成"}
        </button>
      </div>
    </form>
  );
}

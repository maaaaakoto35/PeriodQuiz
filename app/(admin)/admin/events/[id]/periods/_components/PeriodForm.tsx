"use client";

import { useState } from "react";
import type { PeriodRecord } from "@/app/_lib/actions/admin/periods";

interface PeriodFormProps {
  initialData?: PeriodRecord;
  onSubmit: (data: { name: string }) => Promise<void>;
  isLoading?: boolean;
}

export function PeriodForm({
  initialData,
  onSubmit,
  isLoading = false,
}: PeriodFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // バリデーション
    if (!name.trim()) {
      setError("ピリオド名は必須です");
      return;
    }
    if (name.length > 100) {
      setError("ピリオド名は100文字以内で入力してください");
      return;
    }

    try {
      await onSubmit({ name });
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
          ピリオド名 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          disabled={isLoading}
          placeholder="例：ピリオド1"
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
        />
        <p className="mt-1 text-xs text-gray-500">{name.length}/100文字</p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="
          w-full
          rounded-md bg-blue-600 px-4 py-2
          text-sm font-medium text-white
          hover:bg-blue-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:bg-gray-400 disabled:cursor-not-allowed
          transition-colors
        "
      >
        {isLoading ? "処理中..." : "保存"}
      </button>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useNicknameForm } from "./hooks/useNicknameForm";
import type { SessionErrorReason } from "@/app/_lib/actions/user";

type NicknameFormProps = {
  eventId: number;
  errorReason?: SessionErrorReason;
};

export function NicknameForm({ eventId, errorReason }: NicknameFormProps) {
  const router = useRouter();
  const {
    nickname,
    error,
    isChecking,
    isSubmitting,
    isValid,
    handleChange,
    handleSubmit,
  } = useNicknameForm({
    eventId,
    onSuccess: () => {
      // 待機画面に遷移
      router.push(`/events/${eventId}/waiting`);
    },
  });

  // エラーメッセージのマッピング
  const getErrorMessage = (reason: SessionErrorReason): string => {
    switch (reason) {
      case "quiz_started":
        return "クイズは既に開始されています。新規参加はできません。";
      case "session_expired":
        return "セッションが無効です。ニックネームを入力して再度参加してください。";
      default:
        return "";
    }
  };

  const sessionErrorMessage = errorReason ? getErrorMessage(errorReason) : "";

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full max-w-md
        p-6 space-y-6
        bg-white rounded-lg shadow-lg
      "
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          ニックネームを入力
        </h2>
        <p className="text-sm text-center text-gray-600">
          クイズに参加するためのニックネームを入力してください
        </p>
      </div>

      {sessionErrorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700" role="alert">
            {sessionErrorMessage}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="nickname"
          className="block text-sm font-medium text-gray-700"
        >
          ニックネーム
        </label>
        <input
          type="text"
          id="nickname"
          value={nickname}
          onChange={handleChange}
          placeholder="例: たなか太郎"
          maxLength={20}
          disabled={isSubmitting}
          className="
            w-full px-4 py-2
            text-gray-900 placeholder-gray-400
            border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
          "
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "nickname-error" : undefined}
        />
        <p className="text-xs text-gray-500">
          {nickname.length}/20文字（英数字、ひらがな、カタカナ、漢字のみ）
        </p>

        {error && (
          <p id="nickname-error" className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {isChecking && <p className="text-sm text-blue-600">確認中...</p>}
      </div>

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="
          w-full px-4 py-3
          text-white font-semibold
          bg-blue-600 rounded-md
          hover:bg-blue-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:bg-gray-400 disabled:cursor-not-allowed
          transition-colors duration-200
        "
      >
        {isSubmitting ? "登録中..." : "参加する"}
      </button>

      <p className="text-xs text-center text-gray-500">
        参加することで、クイズのルールに同意したものとみなされます
      </p>
    </form>
  );
}

"use client";

interface ErrorAlertProps {
  message: string;
}

/**
 * エラーメッセージを表示するコンポーネント
 *
 * 表示:
 * - エラーメッセージ（赤背景）
 */
export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="rounded-lg bg-red-50 p-4">
      <p className="text-sm text-red-800">{message}</p>
    </div>
  );
}

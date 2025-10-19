'use client';

import { useState } from 'react';
import {
  registerUser,
  checkNicknameAvailability,
} from '@/app/_lib/actions/user';
import { nicknameSchema } from '@/app/_lib/validation/nickname';
import { useDebouncedCallback } from './useDebouncedCallback';

type UseNicknameFormProps = {
  eventId: number;
  onSuccess?: (nickname: string) => void;
};

type UseNicknameFormReturn = {
  nickname: string;
  error: string;
  isChecking: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
};

/**
 * ニックネーム入力フォームのロジックを管理するカスタムフック
 *
 * @param eventId - イベントID
 * @param onSuccess - 登録成功時のコールバック
 * @returns フォーム状態とハンドラー
 */
export function useNicknameForm({
  eventId,
  onSuccess,
}: UseNicknameFormProps): UseNicknameFormReturn {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // リアルタイム重複チェック（デバウンス付き）
  const checkNickname = useDebouncedCallback(async (value: string) => {
    // 空の場合はチェックしない
    if (!value) {
      setError('');
      setIsChecking(false);
      return;
    }

    // クライアント側バリデーション
    const validation = nicknameSchema.safeParse({ nickname: value });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setIsChecking(false);
      return;
    }

    // サーバー側重複チェック
    setIsChecking(true);
    const result = await checkNicknameAvailability(eventId, value);
    setIsChecking(false);

    if (!result.available) {
      setError(result.error);
    } else {
      setError('');
    }
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    setError('');
    checkNickname(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isChecking || error) {
      return;
    }

    setIsSubmitting(true);

    const result = await registerUser(eventId, nickname);

    if (result.success) {
      onSuccess?.(nickname);
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  const isValid = nickname.length > 0 && !error && !isChecking;

  return {
    nickname,
    error,
    isChecking,
    isSubmitting,
    isValid,
    handleChange,
    handleSubmit,
  };
}

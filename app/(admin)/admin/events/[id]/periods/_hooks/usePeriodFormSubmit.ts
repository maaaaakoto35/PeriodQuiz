'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPeriod, updatePeriod } from '@/app/_lib/actions/admin/periods';

interface UsePeriodFormSubmitOptions {
  eventId: number;
  periodId?: number; // undefined = 作成, 数値 = 編集
  onSuccess?: () => void;
}

export function usePeriodFormSubmit({
  eventId,
  periodId,
  onSuccess,
}: UsePeriodFormSubmitOptions) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: { name: string }) => {
    setIsLoading(true);
    setError('');

    try {
      const result = periodId
        ? await updatePeriod({ id: periodId, name: data.name })
        : await createPeriod({ eventId, name: data.name });

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          // デフォルトはピリオド一覧へ戻る
          router.push(`/admin/events/${eventId}/periods`);
        }
      } else {
        setError(result.error || 'エラーが発生しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, handleSubmit };
}

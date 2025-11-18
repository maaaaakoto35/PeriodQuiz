'use server';

import { z } from 'zod';
import type { ZodSchema } from 'zod';
import type { ActionResult } from './errorHandler';

/**
 * Zodスキーマを使用したバリデーション
 */
export function validateInput<T>(
  schema: ZodSchema,
  input: unknown
): ActionResult<T> {
  try {
    const validatedInput = schema.parse(input) as T;
    return {
      success: true,
      data: validatedInput,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.flatten().fieldErrors;
      const errorMessage = Object.values(messages)
        .flat()
        .join(', ');
      return {
        success: false,
        error: errorMessage,
      } as ActionResult<T>;
    }
    return {
      success: false,
      error: '入力値が無効です',
    } as ActionResult<T>;
  }
}

/**
 * 複数フィールドのバリデーション結果をまとめる
 */
export function combineValidationErrors(errors: Record<string, string>): string {
  return Object.values(errors).join(', ');
}

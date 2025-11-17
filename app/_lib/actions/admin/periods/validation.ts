import { z } from 'zod';

/**
 * ピリオド作成・更新時のバリデーションスキーマ
 */
export const periodFormSchema = z.object({
  name: z
    .string()
    .min(1, 'ピリオド名は必須です')
    .max(100, 'ピリオド名は100文字以内で入力してください'),
});

/**
 * ピリオド作成時のスキーマ
 */
export const createPeriodSchema = z.object({
  eventId: z.string().or(z.number()).pipe(z.coerce.number()),
  name: z
    .string()
    .min(1, 'ピリオド名は必須です')
    .max(100, 'ピリオド名は100文字以内で入力してください'),
});

/**
 * ピリオド更新時のスキーマ
 */
export const updatePeriodSchema = z.object({
  id: z.string().or(z.number()).pipe(z.coerce.number()),
  name: z
    .string()
    .min(1, 'ピリオド名は必須です')
    .max(100, 'ピリオド名は100文字以内で入力してください'),
});

/**
 * ピリオド削除時のスキーマ
 */
export const deletePeriodSchema = z.object({
  id: z.string().or(z.number()).pipe(z.coerce.number()),
});

/**
 * ピリオド順序変更時のスキーマ
 */
export const reorderPeriodsSchema = z.object({
  eventId: z.string().or(z.number()).pipe(z.coerce.number()),
  periods: z.array(
    z.object({
      id: z.string().or(z.number()).pipe(z.coerce.number()),
      orderNum: z.string().or(z.number()).pipe(z.coerce.number()),
    })
  ),
});

/**
 * ピリオド一覧取得時のスキーマ
 */
export const getPeriodsSchema = z.object({
  eventId: z.string().or(z.number()).pipe(z.coerce.number()),
});

// 型抽出
export type CreatePeriodInput = z.infer<typeof createPeriodSchema>;
export type UpdatePeriodInput = z.infer<typeof updatePeriodSchema>;
export type DeletePeriodInput = z.infer<typeof deletePeriodSchema>;
export type ReorderPeriodsInput = z.infer<typeof reorderPeriodsSchema>;
export type GetPeriodsInput = z.infer<typeof getPeriodsSchema>;
export type PeriodFormInput = z.infer<typeof periodFormSchema>;

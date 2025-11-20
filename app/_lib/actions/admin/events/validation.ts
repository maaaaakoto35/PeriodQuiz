import { z } from 'zod';

/**
 * イベント作成・更新時のバリデーションスキーマ
 */
export const eventFormSchema = z.object({
  name: z
    .string()
    .min(1, 'イベント名は必須です')
    .max(100, 'イベント名は100文字以内で入力してください'),
  description: z
    .string()
    .min(1, '説明は必須です')
    .max(1000, '説明は1000文字以内で入力してください'),
});

/**
 * イベント作成時のスキーマ
 */
export const createEventSchema = eventFormSchema.extend({});

/**
 * イベント更新時のスキーマ
 */
export const updateEventSchema = eventFormSchema.extend({
  id: z.string().or(z.number()).pipe(z.coerce.number()),
});

/**
 * イベント削除時のスキーマ
 */
export const deleteEventSchema = z.object({
  id: z.string().or(z.number()).pipe(z.coerce.number()),
});

// 型抽出
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type DeleteEventInput = z.infer<typeof deleteEventSchema>;

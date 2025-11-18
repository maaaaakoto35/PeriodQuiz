import { z } from 'zod';

/**
 * 選択肢のバリデーションスキーマ
 */
export const choiceSchema = z.object({
  text: z
    .string()
    .min(1, '選択肢は必須です')
    .max(200, '選択肢は200文字以内で入力してください'),
  imageUrl: z.string().url('画像URLが無効です').optional().or(z.literal('')),
  isCorrect: z.boolean(),
});

/**
 * クイズ作成・更新時のバリデーションスキーマ
 */
export const quizFormSchema = z.object({
  text: z
    .string()
    .min(1, '問題文は必須です')
    .max(1000, '問題文は1000文字以内で入力してください'),
  imageUrl: z.string().url('画像URLが無効です').optional().or(z.literal('')),
  choices: z
    .array(choiceSchema)
    .min(2, '選択肢は最低2個必要です')
    .max(4, '選択肢は最大4個までです')
    .refine(
      (choices) => choices.some((choice) => choice.isCorrect),
      '正解となる選択肢を1つ選択してください'
    )
    .refine(
      (choices) => choices.filter((choice) => choice.isCorrect).length === 1,
      '正解となる選択肢は1つだけ選択してください'
    ),
});

/**
 * クイズ作成時のスキーマ
 */
export const createQuizSchema = z.object({
  periodId: z.string().or(z.number()).pipe(z.coerce.number()),
  text: z
    .string()
    .min(1, '問題文は必須です')
    .max(1000, '問題文は1000文字以内で入力してください'),
  imageUrl: z.string().url('画像URLが無効です').optional().or(z.literal('')),
  choices: z
    .array(choiceSchema)
    .min(2, '選択肢は最低2個必要です')
    .max(4, '選択肢は最大4個までです')
    .refine(
      (choices) => choices.some((choice) => choice.isCorrect),
      '正解となる選択肢を1つ選択してください'
    )
    .refine(
      (choices) => choices.filter((choice) => choice.isCorrect).length === 1,
      '正解となる選択肢は1つだけ選択してください'
    ),
});

/**
 * クイズ更新時のスキーマ
 */
export const updateQuizSchema = z.object({
  id: z.string().or(z.number()).pipe(z.coerce.number()),
  text: z
    .string()
    .min(1, '問題文は必須です')
    .max(1000, '問題文は1000文字以内で入力してください'),
  imageUrl: z.string().url('画像URLが無効です').optional().or(z.literal('')),
  choices: z
    .array(choiceSchema)
    .min(2, '選択肢は最低2個必要です')
    .max(4, '選択肢は最大4個までです')
    .refine(
      (choices) => choices.some((choice) => choice.isCorrect),
      '正解となる選択肢を1つ選択してください'
    )
    .refine(
      (choices) => choices.filter((choice) => choice.isCorrect).length === 1,
      '正解となる選択肢は1つだけ選択してください'
    ),
});

/**
 * クイズ削除時のスキーマ
 */
export const deleteQuizSchema = z.object({
  id: z.string().or(z.number()).pipe(z.coerce.number()),
});

/**
 * クイズ順序変更時のスキーマ
 */
export const reorderQuizzesSchema = z.object({
  periodId: z.string().or(z.number()).pipe(z.coerce.number()),
  quizzes: z.array(
    z.object({
      id: z.string().or(z.number()).pipe(z.coerce.number()),
      orderNum: z.string().or(z.number()).pipe(z.coerce.number()),
    })
  ),
});

/**
 * クイズ一覧取得時のスキーマ
 */
export const getQuizzesSchema = z.object({
  periodId: z.string().or(z.number()).pipe(z.coerce.number()),
});

/**
 * 画像アップロード時のスキーマ
 */
export const uploadQuizImageSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    'ファイルサイズは5MB以下である必要があります'
  ),
  type: z.enum(['question', 'choice']),
  quizId: z.string().or(z.number()).pipe(z.coerce.number()).optional(),
});

// 型抽出
export type QuizFormInput = z.infer<typeof quizFormSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type DeleteQuizInput = z.infer<typeof deleteQuizSchema>;
export type ReorderQuizzesInput = z.infer<typeof reorderQuizzesSchema>;
export type GetQuizzesInput = z.infer<typeof getQuizzesSchema>;
export type UploadQuizImageInput = z.infer<typeof uploadQuizImageSchema>;
export type ChoiceInput = z.infer<typeof choiceSchema>;

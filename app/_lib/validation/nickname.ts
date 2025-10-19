import { z } from 'zod';

/**
 * ニックネームバリデーションスキーマ
 * 
 * 許可する文字種:
 * - 英数字 (a-z, A-Z, 0-9)
 * - ひらがな (ぁ-ん)
 * - カタカナ (ァ-ヶー)
 * - 漢字 (一-龠々)
 * 
 * 禁止する文字種:
 * - 記号
 * - 絵文字
 * - スペース
 */
export const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(1, 'ニックネームを入力してください')
    .max(20, 'ニックネームは20文字以内で入力してください')
    .regex(
      /^[a-zA-Z0-9ぁ-んァ-ヶー一-龠々]+$/,
      '英数字、ひらがな、カタカナ、漢字のみ使用できます'
    ),
});

/**
 * ニックネーム入力の型
 */
export type NicknameInput = z.infer<typeof nicknameSchema>;

/**
 * ニックネームのバリデーション結果
 */
export type NicknameValidationResult = {
  success: boolean;
  errors?: {
    nickname?: string[];
  };
};

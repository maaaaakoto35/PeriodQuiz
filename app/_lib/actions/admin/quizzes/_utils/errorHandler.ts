'use server';

/**
 * Server Actions用の標準レスポンス型
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 認証エラーレスポンス
 */
export function authError(): ActionResult {
  return {
    success: false,
    error: '認証が必要です',
  };
}

/**
 * バリデーションエラーレスポンス
 */
export function validationError(message: string): ActionResult {
  return {
    success: false,
    error: message,
  };
}

/**
 * 一般的なエラーレスポンス
 */
export function actionError(message: string): ActionResult {
  return {
    success: false,
    error: message,
  };
}

/**
 * 成功レスポンス
 */
export function success<T>(data?: T): ActionResult<T> {
  return {
    success: true,
    data,
  };
}

/**
 * エラーハンドリング（キャッチブロック用）
 */
export function handleError(error: unknown): ActionResult {
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }
  return {
    success: false,
    error: '予期しないエラーが発生しました',
  };
}

/**
 * Supabase エラーハンドリング
 */
export function handleSupabaseError(error: unknown, context: string): ActionResult {
  console.error(`[${context}] Supabase error:`, error);
  return {
    success: false,
    error: 'データベース操作に失敗しました',
  };
}

/**
 * 条件付きエラーハンドリング（単一エラー）
 * 特定のエラーコードを除外する場合に使用
 */
export function handleConditionalError(
  error: unknown,
  excludeCode?: string
): boolean {
  if (!error) return false;

  // PostgreSQL固有のエラーコードをチェック
  if (
    typeof error === 'object' &&
    'code' in error &&
    error.code === excludeCode
  ) {
    return false;
  }

  return true;
}

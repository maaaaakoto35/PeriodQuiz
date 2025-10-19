/**
 * Server Actions のエラーハンドリングユーティリティ
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionError';
  }
}

export class RegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistrationError';
  }
}

/**
 * エラーハンドリングのヘルパー関数
 * エラーメッセージを統一する
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof DatabaseError) {
    // 重複キーエラー
    if (error.code === '23505') {
      return 'このニックネームは既に使用されています';
    }
    return 'データベース処理に失敗しました';
  }

  if (error instanceof SessionError) {
    return error.message;
  }

  if (error instanceof RegistrationError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '予期しないエラーが発生しました';
}

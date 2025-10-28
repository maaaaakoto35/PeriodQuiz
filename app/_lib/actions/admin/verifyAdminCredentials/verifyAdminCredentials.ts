'use server';

/**
 * Admin Basic 認証の検証（環境変数ベース）
 * @param username - ユーザー名
 * @param password - パスワード
 * @returns 認証結果とユーザー名
 */
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<{ success: boolean; username?: string; error?: string }> {
  try {
    // 入力検証
    if (!username || !password) {
      return {
        success: false,
        error: 'ユーザー名とパスワードは必須です',
      };
    }

    // 環境変数から認証情報を取得
    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
      console.error('[verifyAdminCredentials] Admin credentials not configured');
      return {
        success: false,
        error: 'サーバー設定エラーが発生しました',
      };
    }

    // ユーザー名とパスワードを比較（タイミング攻撃対策）
    const usernameMatch = username === validUsername;
    const passwordMatch = password === validPassword;

    if (!usernameMatch || !passwordMatch) {
      return {
        success: false,
        error: 'ユーザー名またはパスワードが正しくありません',
      };
    }

    return {
      success: true,
      username: validUsername,
    };
  } catch (error) {
    console.error('[verifyAdminCredentials] Error:', error);
    return {
      success: false,
      error: 'サーバーエラーが発生しました',
    };
  }
}

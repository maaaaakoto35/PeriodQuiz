import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { verifyAdminCredentials } from './verifyAdminCredentials';

describe('verifyAdminCredentials', () => {
  beforeEach(() => {
    // 環境変数を設定
    process.env.ADMIN_USERNAME = 'testadmin';
    process.env.ADMIN_PASSWORD = 'testpassword123';
  });

  afterEach(() => {
    // 環境変数をクリア
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
  });

  it('should verify admin credentials successfully', async () => {
    const result = await verifyAdminCredentials('testadmin', 'testpassword123');

    expect(result.success).toBe(true);
    expect(result.username).toBe('testadmin');
    expect(result.error).toBeUndefined();
  });

  it('should fail with wrong password', async () => {
    const result = await verifyAdminCredentials('testadmin', 'wrongpassword');

    expect(result.success).toBe(false);
    expect(result.error).toBe('ユーザー名またはパスワードが正しくありません');
  });

  it('should fail with non-existent username', async () => {
    const result = await verifyAdminCredentials(
      'nonexistent',
      'testpassword123'
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('ユーザー名またはパスワードが正しくありません');
  });

  it('should fail with empty username', async () => {
    const result = await verifyAdminCredentials('', 'testpassword123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('ユーザー名とパスワードは必須です');
  });

  it('should fail with empty password', async () => {
    const result = await verifyAdminCredentials('testadmin', '');

    expect(result.success).toBe(false);
    expect(result.error).toBe('ユーザー名とパスワードは必須です');
  });

  it('should return error if credentials not configured', async () => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;

    const result = await verifyAdminCredentials('testadmin', 'testpassword123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('サーバー設定エラーが発生しました');
  });
});

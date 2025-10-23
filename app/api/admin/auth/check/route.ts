import { checkAdminAuth } from '@/app/_lib/actions/admin/checkAdminAuth';
import { NextResponse } from 'next/server';

/**
 * Admin 認証状態をチェック
 */
export async function GET() {
  const result = await checkAdminAuth();

  if (result.authenticated) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json(
    { authenticated: false, error: result.error },
    { status: 401 }
  );
}

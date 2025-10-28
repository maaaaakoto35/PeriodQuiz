import { verifyAdminCredentials } from '@/app/_lib/actions/admin/verifyAdminCredentials';
import { createAdminSession } from '@/app/_lib/actions/admin/createAdminSession';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';

/**
 * Admin Basic 認証ログイン
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Basic ')) {
      return NextResponse.json(
        { error: 'Basic 認証が必要です' },
        { status: 401 }
      );
    }

    // Base64 デコード
    const credentials = Buffer.from(authHeader.slice(6), 'base64').toString(
      'utf8'
    );
    const [username, password] = credentials.split(':');

    if (!username || !password) {
      return NextResponse.json(
        { error: '無効な認証情報です' },
        { status: 400 }
      );
    }

    // ユーザー認証
    const authResult = await verifyAdminCredentials(username, password);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // セッション作成（username を渡す）
    const sessionResult = await createAdminSession(authResult.username!);
    if (!sessionResult.success) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: 500 }
      );
    }

    // Cookie に保存
    const cookieStore = await cookies();
    cookieStore.set('admin_session_id', sessionResult.sessionId!, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/admin/auth/login] Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

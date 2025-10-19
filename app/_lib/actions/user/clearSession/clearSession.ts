'use server';

import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '../session.constants';

/**
 * セッションCookieを削除する
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

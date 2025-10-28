"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Admin 画面用 Basic 認証コンポーネント
 * @param children - レンダリングするコンポーネント
 */
export function AdminAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ログインページを除外（認証チェックをスキップ）
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // ログインページの場合は認証チェックをスキップ
    if (isLoginPage) {
      setIsLoading(false);
      setIsAuthenticated(true); // ログインページを表示できるようにする
      return;
    }

    // サーバーに認証状態を確認
    async function checkAuth() {
      try {
        const response = await fetch("/api/admin/auth/check", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // 認証が必要な場合、ログインページへリダイレクト
          router.push("/admin/login");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/admin/login");
        return;
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router, isLoginPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // ログインページにリダイレクト中のため、この状態は一時的
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">ログインページへ移動中...</p>
        </div>
      </div>
    );
  }

  return children;
}

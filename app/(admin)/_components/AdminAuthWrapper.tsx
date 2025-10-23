"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
          // 認証が必要な場合、ユーザーに Basic 認証を促す
          const credentials = prompt("Admin ユーザー名を入力してください:");
          if (credentials) {
            const password = prompt("パスワードを入力してください:");
            if (password) {
              // Basic 認証を試みる
              const encoded = btoa(`${credentials}:${password}`);
              const response = await fetch("/api/admin/auth/login", {
                method: "POST",
                headers: {
                  Authorization: `Basic ${encoded}`,
                },
                credentials: "include",
              });

              if (response.ok) {
                setIsAuthenticated(true);
                // ページをリロード
                router.refresh();
              } else {
                alert("認証に失敗しました");
                setIsAuthenticated(false);
              }
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        読み込み中...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Admin ログイン
          </h1>
          <p className="text-gray-600 text-center mb-4">
            このページを表示するには、Admin 認証が必要です。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            再度ログインしてみてください
          </button>
        </div>
      </div>
    );
  }

  return children;
}

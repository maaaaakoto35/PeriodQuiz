"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/admin/auth/check", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          // already authenticated, go to admin
          router.push("/admin");
        }
      } catch (err) {
        // ignore — user will see login form
        console.error("Session check failed:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  const submit = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const encoded = btoa(`${username}:${password}`);

      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          Authorization: `Basic ${encoded}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        router.push("/admin");
      } else {
        const data = await response.json().catch(() => ({}));
        setError((data && data.error) || "ログインに失敗しました");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("ログイン処理中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    error,
    isLoading,
    isSubmitting,
    submit,
  } as const;
}

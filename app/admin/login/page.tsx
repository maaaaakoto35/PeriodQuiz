"use client";

import { AdminLoginForm } from "@/app/admin/login/AdminLoginForm";
import { useAdminLogin } from "./hooks/useAdminLogin";

export default function AdminLoginPage() {
  const {
    username,
    setUsername,
    password,
    setPassword,
    error,
    isLoading,
    isSubmitting,
    submit,
  } = useAdminLogin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLoginForm
      username={username}
      setUsername={setUsername}
      password={password}
      setPassword={setPassword}
      error={error}
      isSubmitting={isSubmitting}
      onSubmit={submit}
    />
  );
}

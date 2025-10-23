"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/app/_lib/actions/admin/getUsers";
import { UsersListHeader } from "./UsersListHeader";
import { UsersListState } from "./UsersListState";
import { UsersTable } from "./UsersTable";

interface UserWithEvents {
  id: number;
  nickname: string;
  eventNames: string[];
  createdAt: string;
  connectionStatus: "connected" | "disconnected";
}

export function UsersList() {
  const [users, setUsers] = useState<UserWithEvents[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // 15秒ごとに自動更新
    const interval = setInterval(fetchUsers, 15000);

    return () => clearInterval(interval);
  }, []);

  const hasUsers = users.length > 0;

  return (
    <div className="bg-white rounded-lg shadow">
      <UsersListHeader userCount={users.length} />

      <UsersListState
        isLoading={isLoading}
        hasUsers={hasUsers}
        error={error}
      />

      {hasUsers && <UsersTable users={users} />}
    </div>
  );
}

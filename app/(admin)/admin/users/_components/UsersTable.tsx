import { UsersTableHeader } from "./UsersTableHeader";
import { UserRow } from "./UserRow";

interface UsersTableProps {
  users: Array<{
    id: number;
    nickname: string;
    eventNames: string[];
    createdAt: string;
    connectionStatus: "connected" | "disconnected";
  }>;
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <UsersTableHeader />
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <UserRow
              key={user.id}
              id={user.id}
              nickname={user.nickname}
              eventNames={user.eventNames}
              createdAt={user.createdAt}
              connectionStatus={user.connectionStatus}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

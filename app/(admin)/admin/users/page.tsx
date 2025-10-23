import { UsersList } from "./_components/UsersList";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
        <p className="mt-2 text-gray-600">
          システムに登録されているユーザーの一覧を表示します
        </p>
      </div>

      <UsersList />
    </div>
  );
}

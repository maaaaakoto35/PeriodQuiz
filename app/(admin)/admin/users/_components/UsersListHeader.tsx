interface UsersListHeaderProps {
  userCount: number;
}

export function UsersListHeader({ userCount }: UsersListHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          ユーザー一覧
        </h2>
        <div className="text-sm text-gray-600">
          参加者数: <span className="font-semibold">{userCount}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        15秒ごとに自動更新されます
      </p>
    </div>
  );
}

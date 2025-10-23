interface UsersListStateProps {
  isLoading: boolean;
  hasUsers: boolean;
  error: string | null;
}

export function UsersListState({ isLoading, hasUsers, error }: UsersListStateProps) {
  if (error) {
    return (
      <div className="px-6 py-4 text-red-600 text-sm">
        エラー: {error}
      </div>
    );
  }

  if (isLoading && !hasUsers) {
    return (
      <div className="px-6 py-4 text-gray-600 text-center">
        読み込み中...
      </div>
    );
  }

  if (!hasUsers) {
    return (
      <div className="px-6 py-4 text-gray-600 text-center">
        ユーザーがいません
      </div>
    );
  }

  return null;
}

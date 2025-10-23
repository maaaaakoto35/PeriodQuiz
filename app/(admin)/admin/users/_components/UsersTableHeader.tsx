export function UsersTableHeader() {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
          ニックネーム
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
          イベント名
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
          セッション確立時刻
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
          接続状態
        </th>
      </tr>
    </thead>
  );
}

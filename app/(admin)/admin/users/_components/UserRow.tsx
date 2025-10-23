interface UserRowProps {
  id: number;
  nickname: string;
  eventNames: string[];
  createdAt: string;
  connectionStatus: "connected" | "disconnected";
}

export function UserRow({
  nickname,
  eventNames,
  createdAt,
  connectionStatus,
}: UserRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {nickname}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        <div className="flex flex-wrap gap-1">
          {eventNames.length > 0 ? (
            eventNames.map((eventName) => (
              <span
                key={eventName}
                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
              >
                {eventName}
              </span>
            ))
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {new Date(createdAt).toLocaleString("ja-JP")}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            connectionStatus === "connected"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {connectionStatus === "connected" ? "接続中" : "接続断"}
        </span>
      </td>
    </tr>
  );
}

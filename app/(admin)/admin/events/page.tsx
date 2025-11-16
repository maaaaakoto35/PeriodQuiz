import { EventsList } from "./_components/EventsList";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">イベント管理</h1>
        <p className="mt-2 text-gray-600">
          クイズイベントの作成・編集・削除を行えます
        </p>
      </div>

      <EventsList />
    </div>
  );
}

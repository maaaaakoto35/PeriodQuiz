import Link from "next/link";
import { createClient } from "@/app/_lib/supabase/server";

export default async function UserPage() {
  const supabase = await createClient();

  // アクティブなイベント一覧を取得
  const { data: events, error } = await supabase
    .from("events")
    .select("id, name, description")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          PeriodQuiz
        </h1>
        <p className="text-center text-gray-600 mb-8">
          ピリオドごとにチャンピオンが決まる
          <br />
          リアルタイムクイズシステム
        </p>

        {error || !events || events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              現在、利用可能なイベントがありません
            </p>
            <p className="text-sm text-gray-400">
              しばらく経ってからアクセスしてください
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              参加可能なイベント
            </h2>
            <div className="grid gap-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="
                    block p-5 rounded-lg border border-gray-200
                    hover:border-blue-500 hover:bg-blue-50
                    transition duration-200 ease-in-out
                    transform hover:scale-[1.02]
                  "
                >
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    {event.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {event.description}
                  </p>
                  <div className="mt-3 inline-block">
                    <span className="text-blue-600 font-medium text-sm">
                      参加する →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

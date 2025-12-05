import { createClient } from "@/app/_lib/supabase/server";
import { BreakScreenClient } from "./BreakScreenClient";

interface BreakScreenProps {
  eventId: number;
}

interface BreakImage {
  id: string;
  image_url: string;
}

/**
 * 休憩画面（User画面用・Server Component）
 * - サーバー側で休憩画像を取得
 * - クライアント側（BreakScreenClient）でランダムに表示（5秒ごと切り替え）
 * - 画像未設定時はメッセージ表示
 */
export async function BreakScreen({ eventId }: BreakScreenProps) {
  // サーバー側で休憩画像を取得
  let images: BreakImage[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("event_break_images")
      .select("id, image_url")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[BreakScreen] Fetch error:", error);
    } else {
      images = data || [];
    }
  } catch (error) {
    console.error("[BreakScreen] Unexpected error:", error);
  }

  // 画像がない場合
  if (images.length === 0) {
    return (
      <div
        className="
        flex items-center justify-center h-screen
        relative overflow-hidden
      "
        style={{
          backgroundImage: "url('/quiz_background.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* メインコンテンツ */}
        <div
          className="
          relative z-10 flex flex-col items-center justify-center h-full
          px-4 py-8
        "
        >
          {/* コーヒーアイコン */}
          <div
            className="
            text-6xl mb-4
          "
          >
            ☕
          </div>

          {/* 白枠カード */}
          <div
            className="
            bg-white rounded-2xl shadow-2xl
            p-8 max-w-2xl w-full
            flex flex-col items-center justify-center
            min-h-64
          "
          >
            <h1
              className="
              text-3xl font-bold text-gray-800 mb-4
              md:text-4xl
            "
            >
              休憩中
            </h1>
            <p
              className="
              text-lg text-gray-600 text-center
            "
            >
              次の問題をお待ちください
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 画像を表示（Client Componentで管理）
  return (
    <div
      className="
      flex items-center justify-center h-screen
      relative overflow-hidden"
    >
      <BreakScreenClient images={images} />
    </div>
  );
}

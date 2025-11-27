"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/_lib/supabase/client";
import { BreakScreenClient } from "@/app/(user)/events/[eventId]/quiz/break/_components/BreakScreen/BreakScreenClient";

interface MonitorBreakProps {
  eventId: number;
}

interface BreakImage {
  id: string;
  image_url: string;
}

/**
 * モニター画面 - ピリオド間の休憩
 *
 * - クライアント側で休憩画像を取得
 * - BreakScreenClient でランダムに表示（5秒ごと切り替え）
 * - 画像未設定時はメッセージ表示
 */
export function MonitorBreak({ eventId }: MonitorBreakProps) {
  const [images, setImages] = useState<BreakImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreakImages = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("event_break_images")
          .select("id, image_url")
          .eq("event_id", eventId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[MonitorBreak] Fetch error:", error);
        } else {
          setImages(data || []);
        }
      } catch (error) {
        console.error("[MonitorBreak] Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakImages();
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-r-blue-600"></div>
        </div>
      </div>
    );
  }

  // 画像がない場合
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block p-8 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">休憩中</h2>
            <p className="text-lg text-gray-600">
              次のピリオドまでお待ちください
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 画像を表示（Client Componentで管理）
  return <BreakScreenClient images={images} />;
}

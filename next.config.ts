import type { NextConfig } from "next";

// NEXT_PUBLIC_SUPABASE_URL から ホスト名とプロトコルを抽出
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseUrl_obj = new URL(supabaseUrl);
const supabaseHostname = supabaseUrl_obj.hostname;
const supabasePort = supabaseUrl_obj.port;
const supabaseProtocol = supabaseUrl_obj.protocol.replace(":", "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (動的に環境変数から取得)
      ...(supabaseUrl
        ? [
            {
              protocol: supabaseProtocol as "http" | "https",
              hostname: supabaseHostname,
              ...(supabasePort && { port: supabasePort }),
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // 本番環境の Supabase Storage
      {
        protocol: "https" as const,
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;

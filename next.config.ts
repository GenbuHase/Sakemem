import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // LAN 上の別端末や 192.168.x.x での開発アクセス時にクライアント JS を許可する
  allowedDevOrigins: ["192.168.*.*"],
  experimental: {
    // プロフィール画像は最大 2 MB。Server Action の既定 1 MB だとアップロードが失敗する
    serverActions: {
      bodySizeLimit: "3mb",
    },
    proxyClientMaxBodySize: "3mb",
  },
};

export default withSerwist(nextConfig);

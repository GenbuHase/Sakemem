import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // LAN 上の別端末や 192.168.x.x での開発アクセス時にクライアント JS を許可する
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false, // ekran kayıtlarında görünmesin
  /* config options here */
};

export default nextConfig;

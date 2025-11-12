import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Pour Docker/Cloud Run
  reactStrictMode: true,
  serverExternalPackages: ["better-auth"],
};

export default nextConfig;
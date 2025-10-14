import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // IGNORA ERROS DE TYPE NO BUILD
    ignoreBuildErrors: true,
  },
  eslint: {
    // IGNORA ERROS DE LINT NO BUILD
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

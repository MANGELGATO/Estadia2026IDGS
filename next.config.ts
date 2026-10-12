import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Estándar PLAi: servidor Node autónomo para empaquetar en Docker (sección 4.1)
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

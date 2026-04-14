import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Usar webpack em vez de turbopack (necessário para pdfjs-dist)
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "canvas": false,
      };
    }
    return config;
  },
};

export default nextConfig;

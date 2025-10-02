import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore Supabase edge functions directory from Next.js build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Exclude supabase directory from transpilation
  transpilePackages: [],
};

export default nextConfig;

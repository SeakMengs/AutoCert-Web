import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    DOMAIN: process.env.DOMAIN,
  },
  images: {
    // temporary
    dangerouslyAllowSVG: true,
    remotePatterns: [{ protocol: "https", hostname: "*", port: "" }],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    // TODO: remove this when all type errors are fixed
    // ignoreBuildErrors: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: "./empty-module.ts",
      },
    },
    // reactCompiler: true,
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
  devIndicators: false,
};

export default nextConfig;

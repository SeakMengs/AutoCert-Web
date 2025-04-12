import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    reactCompiler: true,
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
  devIndicators: false,
};

export default nextConfig;

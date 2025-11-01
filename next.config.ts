import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Temporarily disable PWA for build testing
const pwa = (config: NextConfig) => config;

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Unified Image Handling
  images: {
    // Allow both local and remote (Sanity) images
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**", // Sanity-hosted images
      },
      {
        protocol: "https",
        hostname: "kroii.onrender.com",
        pathname: "/cars/**", // Local cars folder (if migrating from Render)
      },
      {
        protocol: "https",
        hostname: "*.render.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
        pathname: "/**", // Vercel preview/production domains
      },
    ],
    loader: "default",
    // Enable Vercel's image optimization for better performance
    unoptimized: false,
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
    styledComponents: true,
  },

  compress: true,
  poweredByHeader: false,

  // Prevent slow builds from timing out
  staticPageGenerationTimeout: 120,

  generateBuildId: async () => {
    return "kroi-auto-build-" + Date.now();
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // Reduce memory usage during build
    memoryBasedWorkersCount: true,
  },
};

export default bundleAnalyzer(pwa(nextConfig));

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "http",  hostname: "localhost" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",  value: "nosniff"        },
          { key: "X-Frame-Options",          value: "SAMEORIGIN"     },
          { key: "X-XSS-Protection",         value: "1; mode=block"  },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  // API rewrite (CORS muammolarini oldini olish)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/:path*`,
      },
    ];
  },
};

export default nextConfig;

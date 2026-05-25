import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "api.jubalboard.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "jubalboard-storage-989615776310-eu-north-1-an.s3.eu-north-1.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://api.jubalboard.com/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the parent site to embed this app via iframe, and anyone to open it
  // directly. Everything else stays locked down.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://www.nejdettut.com https://nejdettut.com https://*.nejdettut.com",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

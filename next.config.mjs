// Clean up any extraneous quotes or non-standard formatting in NODE_ENV from hosting providers
if (process.env.NODE_ENV) {
  process.env.NODE_ENV = process.env.NODE_ENV.replace(/['"]+/g, '').trim();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Security: Hide 'X-Powered-By: Next.js' header
  compress: true, // Item 15: Enable gzip/brotli payload compression
  swcMinify: true, // Item 6: Fast SWC code & CSS minification
  devIndicators: {
    buildActivity: false,
  },
  
  // Item 1: Modern WebP / AVIF image compression
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache for static images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.cloudflarestorage.com",
      },
    ],
  },

  // Item 3: Tree-shaking & code splitting for heavy icon and date utility chunks
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },

  // Item 6: Strip console logs in production bundles for smaller, faster JS
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  
  // Item 4 & 5: CDN & Browser Caching Headers (#16 HTTPS, #17 Security Headers, #8 XSS Protection)
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // Protect against clickjacking
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Protect against MIME-sniffing
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload", // Enforce HTTPS
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com", // Needed for Next.js hydration + Vercel Analytics
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' ws: wss: https://vitals.vercel-insights.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

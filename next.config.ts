import type { NextConfig } from "next";

function getSupabaseOrigin() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) return "";
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.hostname.includes("*")
    ) {
      throw new Error();
    }
    return url.origin;
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must define an exact HTTPS origin.");
  }
}

const supabaseOrigin = getSupabaseOrigin();
const contentSecurityPolicy = [
  "default-src 'self'",
  // Static headers cannot provide a fresh nonce for Next.js hydration scripts.
  "script-src 'self' 'unsafe-inline'",
  "script-src-attr 'none'",
  // Preserve Next.js/React inline styles (including image positioning).
  "style-src 'self' 'unsafe-inline'",
  [
    "img-src 'self' data: blob:",
    supabaseOrigin && `${supabaseOrigin}/storage/v1/object/public/product-images/`,
  ].filter(Boolean).join(" "),
  "font-src 'self'",
  ["connect-src 'self'", supabaseOrigin].filter(Boolean).join(" "),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL ? [{
      protocol: "https",
      hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
      pathname: "/storage/v1/object/public/product-images/**",
    }] : [],
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(), payment=(), accelerometer=(), gyroscope=(), usb=(), bluetooth=()",
        },
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
      ],
    }];
  },
};

export default nextConfig;

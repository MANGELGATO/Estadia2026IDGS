import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export' removed — incompatible with dynamic routes (useRouter, usePathname)
  // and the admin panel. Use Firebase App Hosting or Cloud Run for full Next.js support.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;


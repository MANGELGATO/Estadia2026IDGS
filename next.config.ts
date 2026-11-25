import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

function getOriginSafe(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
}

const keycloakOrigin = getOriginSafe(process.env.KEYCLOAK_ISSUER);

const connectSrc = [
  "'self'",
  ...(keycloakOrigin ? [keycloakOrigin] : []),
  ...(!isProd ? ['http://localhost:*', 'ws://localhost:*'] : []),
].join(' ');

const formActionSrc = [
  "'self'",
  ...(keycloakOrigin ? [keycloakOrigin] : []),
].join(' ');

// En producción NO se permite 'unsafe-eval' ni orígenes localhost/ws
const scriptSrc = isProd
  ? "'self' 'unsafe-inline'"
  : "'self' 'unsafe-eval' 'unsafe-inline'";

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob:",
      `connect-src ${connectSrc}`,
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      `form-action ${formActionSrc}`,
      ...(isProd ? ['upgrade-insecure-requests'] : []),
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // Estándar PLAi: servidor Node autónomo para empaquetar en Docker (sección 4.1)
  output: 'standalone',
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

// Las cabeceras estáticas se mantienen aquí; Content-Security-Policy se calcula
// dinámicamente por petición en `proxy.ts` con nonce criptográfico y el origen
// real de KEYCLOAK_ISSUER en tiempo de ejecución (sin 'unsafe-inline' en script-src).
// Nota: Strict-Transport-Security (HSTS) se emite exclusivamente desde NGINX (puerto 8443 TLS)
// para evitar duplicar la cabecera en cada respuesta HTTPS.
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
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

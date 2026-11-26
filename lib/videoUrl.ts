/**
 * Utilidades puras para validar y normalizar URLs de video embebibles (YouTube).
 * Alineado con la directiva `frame-src` de la CSP en `proxy.ts` (sin comodines).
 */

const ALLOWED_YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
]);

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{6,20}$/;

/**
 * Extrae el ID de video de una URL válida de YouTube (`watch?v=`, `youtu.be/`, `embed/`, `shorts/`).
 * Devuelve `null` si el dominio no pertenece a YouTube o el formato no es seguro.
 */
export function extractYouTubeVideoId(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:') {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (!ALLOWED_YOUTUBE_HOSTS.has(host)) {
    return null;
  }

  let videoId: string | null = null;
  if (host === 'youtu.be') {
    videoId = parsed.pathname.replace(/^\/+/, '').split('/')[0] || null;
  } else if (parsed.pathname === '/watch') {
    videoId = parsed.searchParams.get('v');
  } else if (parsed.pathname.startsWith('/embed/')) {
    videoId = parsed.pathname.slice('/embed/'.length).split('/')[0] || null;
  } else if (parsed.pathname.startsWith('/shorts/')) {
    videoId = parsed.pathname.slice('/shorts/'.length).split('/')[0] || null;
  }

  if (!videoId || !YOUTUBE_ID_REGEX.test(videoId)) {
    return null;
  }

  return videoId;
}

/**
 * Valida que la URL de video sea vacía o una URL HTTPS válida de YouTube.
 */
export function isAllowedVideoUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return true;
  return extractYouTubeVideoId(trimmed) !== null;
}

/**
 * Convierte cualquier enlace válido de YouTube (`watch?v=...`, `youtu.be/...`, `embed/...`)
 * a su URL canónica embebible (`https://www.youtube.com/embed/<id>`).
 * Devuelve `null` si la URL no es un enlace válido de YouTube.
 */
export function toYouTubeEmbedUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;
  const videoId = extractYouTubeVideoId(rawUrl);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

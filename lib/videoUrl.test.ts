import { describe, it, expect } from 'vitest';
import { isAllowedVideoUrl, toYouTubeEmbedUrl } from './videoUrl';

describe('Utilidades de URL de video YouTube (CSP frame-src)', () => {
  it('acepta enlaces watch?v=, youtu.be/ y embed/ de YouTube y los normaliza a embed', () => {
    expect(isAllowedVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(toYouTubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    );

    expect(isAllowedVideoUrl('https://youtu.be/dQw4w9WgXcQ?si=abc')).toBe(true);
    expect(toYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ?si=abc')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    );

    expect(isAllowedVideoUrl('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')).toBe(true);
    expect(toYouTubeEmbedUrl('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    );
  });

  it('permite cadena vacía (sin video configurado)', () => {
    expect(isAllowedVideoUrl('')).toBe(true);
    expect(toYouTubeEmbedUrl('')).toBeNull();
  });

  it('rechaza dominios externos arbitrarios, http plano y javascript:', () => {
    expect(isAllowedVideoUrl('https://vimeo.com/123456')).toBe(false);
    expect(isAllowedVideoUrl('http://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false);
    expect(isAllowedVideoUrl('javascript:alert(1)')).toBe(false);
    expect(toYouTubeEmbedUrl('https://evil.example/embed/abc')).toBeNull();
  });
});

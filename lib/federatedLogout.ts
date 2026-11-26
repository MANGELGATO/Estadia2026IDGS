'use client';

/**
 * Ejecuta el cierre de sesión federado (SLO) vía POST /api/auth/federated-logout
 * para cumplir con la protección anti-Logout CSRF (el endpoint rechaza GET con 405)
 * y redirige al `end_session_endpoint` de Keycloak devuelto por el servidor.
 */
export async function triggerFederatedLogout(): Promise<void> {
  try {
    const res = await fetch('/api/auth/federated-logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
    const data = await res.json().catch(() => ({}));
    const target = typeof data.logoutUrl === 'string' && data.logoutUrl ? data.logoutUrl : '/login';
    window.location.assign(target);
  } catch {
    window.location.assign('/login');
  }
}

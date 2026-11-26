import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NavAuthStatus from './NavAuthStatus';
import AdminSidebar from './admin/AdminSidebar';
import UserSidebar from './usuario/UserSidebar';

const mockUseSession = vi.fn();

vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

describe('Botones de cierre de sesión federado (POST /api/auth/federated-logout)', () => {
  const originalLocation = window.location;
  const assignMock = vi.fn();
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        logoutUrl: 'https://sso.plai.mx/realms/plai/protocol/openid-connect/logout',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, assign: assignMock },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('NavAuthStatus envía POST con same-origin y redirige a logoutUrl', async () => {
    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { name: 'Ana Admin', email: 'ana@plai.mx', role: 'admin' } },
    });

    render(<NavAuthStatus />);
    fireEvent.click(screen.getByTitle('Cerrar Sesión (SSO Keycloak)'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/auth/federated-logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      expect(assignMock).toHaveBeenCalledWith(
        'https://sso.plai.mx/realms/plai/protocol/openid-connect/logout'
      );
    });
  });

  it('AdminSidebar envía POST (no GET) al pulsar Cerrar Sesión', async () => {
    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { name: 'Carlos Admin', email: 'carlos@plai.mx', role: 'admin' } },
    });

    render(<AdminSidebar />);
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/auth/federated-logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      expect(assignMock).toHaveBeenCalledWith(
        'https://sso.plai.mx/realms/plai/protocol/openid-connect/logout'
      );
    });
  });

  it('UserSidebar envía POST (no GET) al pulsar Cerrar Sesión', async () => {
    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { name: 'Sofía Usuaria', email: 'sofia@plai.mx', role: 'usuario' } },
    });

    render(<UserSidebar />);
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/auth/federated-logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      expect(assignMock).toHaveBeenCalledWith(
        'https://sso.plai.mx/realms/plai/protocol/openid-connect/logout'
      );
    });
  });
});

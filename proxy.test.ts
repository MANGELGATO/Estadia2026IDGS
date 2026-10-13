import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';
import * as jwt from 'next-auth/jwt';

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

describe('Proxy Security and RBAC (Next.js 16)', () => {
  const getTokenMock = vi.mocked(jwt.getToken);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirige a /login cuando un usuario anónimo intenta entrar a /admin', async () => {
    getTokenMock.mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost:3000/admin');
    const res = await proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login?callbackUrl=%2Fadmin');
  });

  it('redirige a /login cuando un usuario anónimo intenta entrar a /usuario', async () => {
    getTokenMock.mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost:3000/usuario/prestamos');
    const res = await proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login?callbackUrl=%2Fusuario%2Fprestamos');
  });

  it('bloquea a un usuario estándar que intenta entrar a /admin y lo redirige a /usuario', async () => {
    getTokenMock.mockResolvedValueOnce({
      id: 'usr-standard-01',
      role: 'usuario',
      email: 'usuario@plai.mx',
    } as unknown as jwt.JWT);

    const req = new NextRequest('http://localhost:3000/admin/inventario');
    const res = await proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/usuario');
  });

  it('permite el acceso a /admin a un usuario con rol admin', async () => {
    getTokenMock.mockResolvedValueOnce({
      id: 'usr-admin-01',
      role: 'admin',
      email: 'admin@plai.mx',
    } as unknown as jwt.JWT);

    const req = new NextRequest('http://localhost:3000/admin');
    const res = await proxy(req);

    // NextResponse.next() no redirecciona (status 200 y sin cabecera location)
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirige a su dashboard a un usuario ya autenticado que visita /login', async () => {
    getTokenMock.mockResolvedValueOnce({
      id: 'usr-admin-01',
      role: 'admin',
      email: 'admin@plai.mx',
    } as unknown as jwt.JWT);

    const req = new NextRequest('http://localhost:3000/login');
    const res = await proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/admin');
  });
});

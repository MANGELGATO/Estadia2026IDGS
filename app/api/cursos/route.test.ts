import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { rateLimiter } from '../../../lib/rateLimit';
import { addDaysToYmd, getMexicoTodayYmd } from '../../../lib/dateMexico';
import * as nextAuth from 'next-auth';

const mockCursos = [
  {
    id: 'CUR-20261125-AAAAAAAA',
    titulo: 'Taller de Robótica Industrial',
    tipo: 'Visita Académica',
    fecha: '2026-12-01',
    hora: '10:00 - 13:00',
    lugar: 'Laboratorio PLAi',
    asistentes: 20,
    estado: 'Confirmado',
    icon: '🎓',
    instructor: 'Equipo Académico PLAi',
    descripcion: 'Recorrido de robótica.',
    solicitante_nombre: 'Persona Tercera',
    solicitante_email: 'tercero@institucion.mx',
    institucion: 'Universidad Externa',
  },
  {
    id: 'CUR-20261125-BBBBBBBB',
    titulo: 'Mi Solicitud Pendiente',
    tipo: 'Sesión Formativa',
    fecha: '2026-12-02',
    hora: '11:00 - 13:00',
    lugar: 'Laboratorio PLAi',
    asistentes: 10,
    estado: 'En revisión',
    icon: '🎓',
    instructor: 'Equipo Académico PLAi',
    descripcion: 'Mi propia solicitud.',
    solicitante_nombre: 'Usuario Actual',
    solicitante_email: 'usuario@plai.mx',
    institucion: 'Mi Facultad',
  },
];

vi.mock('../../../lib/directus', () => ({
  directus: {
    getItems: vi.fn(async () => mockCursos),
    createItem: vi.fn(async (_col: string, data: Record<string, unknown>) => data),
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('/api/cursos API Endpoint (privacidad PII y validación Zod)', () => {
  const getServerSessionMock = vi.mocked(nextAuth.getServerSession);

  beforeEach(() => {
    vi.clearAllMocks();
    rateLimiter.reset();
    getServerSessionMock.mockResolvedValue({
      user: {
        id: 'kc-usr-1',
        name: 'Usuario Actual',
        email: 'usuario@plai.mx',
        role: 'usuario',
      },
    });
  });

  it('oculta nombre, correo e institución de terceros en cursos Confirmados para usuarios normales', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.data).toHaveLength(2);
    const ajeno = json.data.find((c: { id: string }) => c.id === 'CUR-20261125-AAAAAAAA');
    expect(ajeno.solicitanteNombre).toBeUndefined();
    expect(ajeno.solicitanteEmail).toBeUndefined();
    expect(ajeno.institucion).toBeUndefined();

    const propio = json.data.find((c: { id: string }) => c.id === 'CUR-20261125-BBBBBBBB');
    expect(propio.solicitanteNombre).toBe('Usuario Actual');
    expect(propio.solicitanteEmail).toBe('usuario@plai.mx');
    expect(propio.institucion).toBe('Mi Facultad');
  });

  it('rechaza POST con fecha inválida mediante validación Zod (400)', async () => {
    const req = new NextRequest('http://localhost:3000/api/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solicitanteNombre: 'Usuario Actual',
        fecha: 'no-es-fecha',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.errors?.fecha).toBeDefined();
  });

  it('crea curso válido con folio criptográfico único (201) y exige acceptPrivacy', async () => {
    const futureDate = addDaysToYmd(getMexicoTodayYmd(), 5);

    const noPrivacyRes = await POST(
      new NextRequest('http://localhost:3000/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solicitanteNombre: 'Usuario Actual',
          fecha: futureDate,
          titulo: 'Taller de VR',
          asistentes: 12,
          acceptPrivacy: false,
        }),
      })
    );
    expect(noPrivacyRes.status).toBe(400);

    const req = new NextRequest('http://localhost:3000/api/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solicitanteNombre: 'Usuario Actual',
        fecha: futureDate,
        titulo: 'Taller de VR',
        asistentes: 12,
        acceptPrivacy: true,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.id).toMatch(/^CUR-\d{8}-[0-9A-F]{8}$/);
  });
});

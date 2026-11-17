import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ReservationForm from './ReservationForm';
import { mockDevices } from '../../lib/mockData';

let mockSessionStatus: 'authenticated' | 'unauthenticated' | 'loading' = 'authenticated';
const mockSession = {
  user: {
    name: 'Investigador / Alumno PLAi',
    email: 'user@plai.edu.mx',
    role: 'user',
  },
};

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: mockSessionStatus === 'authenticated' ? mockSession : null,
    status: mockSessionStatus,
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/equipos',
}));

describe('ReservationForm', () => {
  const device = mockDevices[0];

  beforeEach(() => {
    mockSessionStatus = 'authenticated';
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('deshabilita la hora de fin hasta elegir la de inicio', () => {
    render(<ReservationForm device={device} onClose={() => {}} />);
    expect(document.getElementById('res-end')).toBeDisabled();
    fireEvent.change(document.getElementById('res-start')!, { target: { value: '10:00' } });
    expect(document.getElementById('res-end')).toBeEnabled();
  });

  it('rechaza un préstamo mayor a 2 horas, muestra alerta accesible y limpia la hora de fin', () => {
    render(<ReservationForm device={device} onClose={() => {}} />);
    fireEvent.change(document.getElementById('res-start')!, { target: { value: '10:00' } });
    fireEvent.change(document.getElementById('res-end')!, { target: { value: '13:00' } });
    
    const alertBanner = screen.getByRole('alert');
    expect(alertBanner).toBeInTheDocument();
    expect(alertBanner).toHaveTextContent(/2 horas/i);
    expect(document.getElementById('res-end')).toHaveValue('');
  });

  it('acepta un rango válido sin mostrar alerta', () => {
    render(<ReservationForm device={device} onClose={() => {}} />);
    fireEvent.change(document.getElementById('res-start')!, { target: { value: '10:00' } });
    fireEvent.change(document.getElementById('res-end')!, { target: { value: '11:30' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(document.getElementById('res-end')).toHaveValue('11:30');
  });

  it('muestra el nombre del equipo y llama onClose al cancelar', () => {
    const onClose = vi.fn();
    render(<ReservationForm device={device} onClose={onClose} />);
    expect(screen.getByRole('heading', { name: device.name })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('solicita inicio de sesión institucional si el usuario no está autenticado', () => {
    mockSessionStatus = 'unauthenticated';
    const onClose = vi.fn();
    render(<ReservationForm device={device} onClose={onClose} />);
    expect(screen.getByText(/Acceso Institucional Requerido/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });
});

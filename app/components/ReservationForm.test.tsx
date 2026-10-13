import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ReservationForm from './ReservationForm';
import { mockDevices } from '../../lib/mockData';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ReservationForm', () => {
  const device = mockDevices[0];

  it('deshabilita la hora de fin hasta elegir la de inicio', () => {
    render(<ReservationForm device={device} onClose={() => {}} />);
    expect(document.getElementById('res-end')).toBeDisabled();
    fireEvent.change(document.getElementById('res-start')!, { target: { value: '10:00' } });
    expect(document.getElementById('res-end')).toBeEnabled();
  });

  it('rechaza un préstamo mayor a 2 horas y limpia la hora de fin', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<ReservationForm device={device} onClose={() => {}} />);
    fireEvent.change(document.getElementById('res-start')!, { target: { value: '10:00' } });
    fireEvent.change(document.getElementById('res-end')!, { target: { value: '13:00' } });
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('2 horas'));
    expect(document.getElementById('res-end')).toHaveValue('');
  });

  it('acepta un rango válido', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<ReservationForm device={device} onClose={() => {}} />);
    fireEvent.change(document.getElementById('res-start')!, { target: { value: '10:00' } });
    fireEvent.change(document.getElementById('res-end')!, { target: { value: '11:30' } });
    expect(alertSpy).not.toHaveBeenCalled();
    expect(document.getElementById('res-end')).toHaveValue('11:30');
  });

  it('muestra el nombre del equipo y llama onClose al cancelar', () => {
    const onClose = vi.fn();
    render(<ReservationForm device={device} onClose={onClose} />);
    expect(screen.getByRole('heading', { name: device.name })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });
});

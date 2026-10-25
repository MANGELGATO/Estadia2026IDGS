import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import GlobalError from './error';

describe('GlobalError Page (500 / error boundary)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });
  it('renderiza el mensaje de error institucional sin exponer trazas sensibles', () => {
    const error = new Error('Database password leak risk');
    render(<GlobalError error={error} reset={() => {}} />);

    expect(screen.getByRole('heading', { level: 1, name: /Ha ocurrido un error inesperado/i })).toBeInTheDocument();
    // No debe contener el texto del error sensible directamente en pantalla
    expect(screen.queryByText('Database password leak risk')).not.toBeInTheDocument();
  });

  it('permite reintentar la acción mediante el botón de reinicio', () => {
    const resetMock = vi.fn();
    const error = new Error('Transient error');
    render(<GlobalError error={error} reset={resetMock} />);

    const retryButton = screen.getByRole('button', { name: /Intentar nuevamente/i });
    fireEvent.click(retryButton);
    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  it('muestra el código digest cuando se proporciona', () => {
    const error = Object.assign(new Error('Digest error'), { digest: 'ERR_12345' });
    render(<GlobalError error={error} reset={() => {}} />);

    expect(screen.getByText('ERR_12345')).toBeInTheDocument();
  });
});

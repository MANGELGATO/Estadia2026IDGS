import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

describe('NotFound Page (404)', () => {
  it('muestra el código 404 y el título institucional', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Página no encontrada/i })).toBeInTheDocument();
  });

  it('contiene enlaces para regresar al inicio y al catálogo', () => {
    render(<NotFound />);
    const homeLink = screen.getByRole('link', { name: /Volver al Inicio/i });
    expect(homeLink).toHaveAttribute('href', '/');

    const catalogLink = screen.getByRole('link', { name: /Explorar Catálogo/i });
    expect(catalogLink).toHaveAttribute('href', '/categoria/laboratorio-de-innovacion-tecnologica');
  });
});

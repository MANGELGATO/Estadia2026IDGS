import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import AccessibilityButton from './AccessibilityButton';

describe('AccessibilityButton Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.fontSize = '';
    document.documentElement.style.filter = '';
    document.documentElement.className = '';
  });

  afterEach(() => {
    cleanup();
  });

  it('renderiza el botón flotante con accesibilidad ARIA adecuada', () => {
    render(<AccessibilityButton />);
    const button = screen.getByRole('button', { name: /Abrir opciones de accesibilidad/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('abre el menú de herramientas al hacer clic en el botón activador', () => {
    render(<AccessibilityButton />);
    const trigger = screen.getByRole('button', { name: /Abrir opciones de accesibilidad/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog', { name: /Panel de opciones de accesibilidad/i })).toBeInTheDocument();
    expect(screen.getByText('Accesibilidad')).toBeInTheDocument();
  });

  it('incrementa el tamaño de la fuente y lo aplica a documentElement', () => {
    render(<AccessibilityButton />);
    fireEvent.click(screen.getByRole('button', { name: /Abrir opciones de accesibilidad/i }));

    const increaseBtn = screen.getByRole('button', { name: /A\+ Ampliar/i });
    fireEvent.click(increaseBtn);

    expect(document.documentElement.style.fontSize).toBe('115%');
    expect(screen.getByText(/Tamaño del Texto \(115%\)/i)).toBeInTheDocument();
  });

  it('permite alternar el alto contraste y restablecer ajustes', () => {
    render(<AccessibilityButton />);
    fireEvent.click(screen.getByRole('button', { name: /Abrir opciones de accesibilidad/i }));

    const contrastBtn = screen.getByRole('button', { name: /Alto Contraste/i });
    fireEvent.click(contrastBtn);

    expect(document.documentElement.style.filter).toContain('contrast');

    // Restablecer
    const resetBtn = screen.getByRole('button', { name: /Restablecer ajustes/i });
    fireEvent.click(resetBtn);

    expect(document.documentElement.style.filter).toBe('');
    expect(document.documentElement.style.fontSize).toBe('');
  });
});

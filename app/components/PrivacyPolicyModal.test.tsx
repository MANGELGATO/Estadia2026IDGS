import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PrivacyPolicyModal from './PrivacyPolicyModal';

describe('PrivacyPolicyModal Component', () => {
  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(<PrivacyPolicyModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza con role="dialog" y las secciones normativas cuando isOpen es true', () => {
    render(<PrivacyPolicyModal isOpen={true} onClose={() => {}} />);

    const dialog = screen.getByRole('dialog', { name: /Aviso de Privacidad Integral/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Cumplimiento LFPDPPP/i)).toBeInTheDocument();
    expect(screen.getByText(/Derechos ARCO/i)).toBeInTheDocument();
    expect(screen.getByText(/transparencia@plai.mx/i)).toBeInTheDocument();
  });

  it('ejecuta onClose al hacer clic en el botón Entendido y Aceptar', () => {
    const onClose = vi.fn();
    render(<PrivacyPolicyModal isOpen={true} onClose={onClose} />);

    const acceptButton = screen.getByRole('button', { name: /Entendido y Aceptar/i });
    fireEvent.click(acceptButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra el modal al presionar la tecla Escape', () => {
    const onClose = vi.fn();
    render(<PrivacyPolicyModal isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

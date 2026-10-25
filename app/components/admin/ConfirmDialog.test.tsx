import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        title="¿Eliminar recurso?"
        description="Esta acción no se puede deshacer"
        onConfirm={() => {}}
        onClose={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza con atributos de accesibilidad role="alertdialog" cuando isOpen es true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="¿Eliminar usuario?"
        description="Se desactivará el acceso al sistema"
        onConfirm={() => {}}
        onClose={() => {}}
      />
    );

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('¿Eliminar usuario?')).toBeInTheDocument();
    expect(screen.getByText('Se desactivará el acceso al sistema')).toBeInTheDocument();
  });

  it('ejecuta onConfirm y onClose al hacer clic en confirmar', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        title="¿Continuar?"
        description="Confirmar acción"
        confirmText="Aceptar"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra el diálogo al presionar tecla Escape', () => {
    const onClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        title="¿Continuar?"
        description="Presiona Escape"
        onConfirm={() => {}}
        onClose={onClose}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

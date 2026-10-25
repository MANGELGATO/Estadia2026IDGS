'use client';

import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(22,46,80,0.55)] p-4 backdrop-blur-[6px] animate-fade-in"
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div
        className="relative flex w-full max-w-[440px] animate-pop-in flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(22,46,80,0.25)] border border-black/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-plai-muted hover:bg-slate-100 hover:text-navy transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
              isDestructive ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 id="confirm-dialog-title" className="font-heading text-lg font-extrabold text-navy">
              {title}
            </h3>
            <p id="confirm-dialog-desc" className="mt-1.5 text-sm leading-relaxed text-plai-gray font-body">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 font-heading text-sm font-semibold text-plai-gray transition-colors hover:bg-slate-50 hover:text-navy active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-xl px-5 py-2 font-heading text-sm font-bold text-white shadow-plai-sm transition-all active:scale-95 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary hover:bg-[#004a87]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

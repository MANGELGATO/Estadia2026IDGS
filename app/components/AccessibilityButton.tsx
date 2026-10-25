'use client';

import { useState, useEffect, useRef } from 'react';
import { Type, Eye, Link as LinkIcon, RotateCcw, X, Check } from 'lucide-react';

interface AccessibilityPreferences {
  fontSize: number; // 100, 115, 130 (%)
  highContrast: boolean;
  grayscale: boolean;
  highlightLinks: boolean;
}

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  fontSize: 100,
  highContrast: false,
  grayscale: false,
  highlightLinks: false,
};

const STORAGE_KEY = 'plai_a11y_prefs';

function applyPreferences(p: AccessibilityPreferences) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Tamaño de fuente base
  root.style.fontSize = p.fontSize === 100 ? '' : `${p.fontSize}%`;

  // Filtros combinados (contraste y escala de grises)
  const filters: string[] = [];
  if (p.highContrast) filters.push('contrast(135%) brightness(95%)');
  if (p.grayscale) filters.push('grayscale(100%)');
  root.style.filter = filters.length > 0 ? filters.join(' ') : '';

  // Resaltado de enlaces
  if (p.highlightLinks) {
    root.classList.add('a11y-highlight-links');
  } else {
    root.classList.remove('a11y-highlight-links');
  }
}

function loadInitialPreferences(): AccessibilityPreferences {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        applyPreferences(parsed);
        return parsed;
      }
    } catch {
      // Ignorar errores de parseo
    }
  }
  return DEFAULT_PREFERENCES;
}

export default function AccessibilityButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [prefs, setPrefs] = useState<AccessibilityPreferences>(loadInitialPreferences);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePreferences = (newPrefs: AccessibilityPreferences) => {
    setPrefs(newPrefs);
    applyPreferences(newPrefs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
    } catch {
      // Ignorar errores de almacenamiento
    }
  };

  const handleFontSizeChange = (delta: number) => {
    const levels = [100, 115, 130];
    const currentIndex = levels.indexOf(prefs.fontSize);
    const newIndex = Math.max(0, Math.min(levels.length - 1, currentIndex + delta));
    updatePreferences({ ...prefs, fontSize: levels[newIndex] });
  };

  const toggleContrast = () => {
    updatePreferences({ ...prefs, highContrast: !prefs.highContrast });
  };

  const toggleGrayscale = () => {
    updatePreferences({ ...prefs, grayscale: !prefs.grayscale });
  };

  const toggleHighlightLinks = () => {
    updatePreferences({ ...prefs, highlightLinks: !prefs.highlightLinks });
  };

  const handleReset = () => {
    updatePreferences(DEFAULT_PREFERENCES);
  };

  // Cerrar con Escape y clics externos
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [isOpen]);

  const hasActiveModifiers =
    prefs.fontSize !== 100 || prefs.highContrast || prefs.grayscale || prefs.highlightLinks;

  return (
    <div className="fixed bottom-6 right-6 z-[95]" ref={menuRef}>
      {/* Menú emergente de herramientas */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Panel de opciones de accesibilidad"
          className="absolute bottom-16 right-0 mb-2 w-80 animate-pop-in rounded-2xl border border-black/[0.08] bg-white p-5 shadow-[0_20px_60px_rgba(22,46,80,0.2)]"
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-navy/10 text-navy">
                <Type size={16} />
              </span>
              <h2 className="font-heading text-base font-extrabold text-navy">Accesibilidad</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-plai-muted hover:bg-slate-100 hover:text-navy transition-colors"
              aria-label="Cerrar panel de accesibilidad"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-3 font-body text-sm">
            {/* Control de tamaño de fuente */}
            <div className="flex flex-col gap-1.5">
              <label className="font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">
                Tamaño del Texto ({prefs.fontSize}%)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFontSizeChange(-1)}
                  disabled={prefs.fontSize <= 100}
                  className="flex-1 rounded-xl border border-slate-200 py-2 font-heading text-xs font-bold text-navy hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  A- Reducir
                </button>
                <button
                  type="button"
                  onClick={() => handleFontSizeChange(1)}
                  disabled={prefs.fontSize >= 130}
                  className="flex-1 rounded-xl border border-slate-200 py-2 font-heading text-xs font-bold text-navy hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  A+ Ampliar
                </button>
              </div>
            </div>

            {/* Alternar Alto Contraste */}
            <button
              type="button"
              onClick={toggleContrast}
              className={`flex items-center justify-between rounded-xl border p-2.5 transition-colors ${
                prefs.highContrast
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-slate-200 text-plai-gray hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 font-heading text-xs font-bold">
                <Eye size={16} />
                <span>Alto Contraste</span>
              </div>
              {prefs.highContrast && <Check size={16} className="text-primary" />}
            </button>

            {/* Alternar Escala de Grises */}
            <button
              type="button"
              onClick={toggleGrayscale}
              className={`flex items-center justify-between rounded-xl border p-2.5 transition-colors ${
                prefs.grayscale
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-slate-200 text-plai-gray hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 font-heading text-xs font-bold">
                <span className="size-4 rounded-full border border-current bg-gradient-to-r from-gray-400 to-gray-800" />
                <span>Escala de Grises</span>
              </div>
              {prefs.grayscale && <Check size={16} className="text-primary" />}
            </button>

            {/* Alternar Resaltado de Enlaces */}
            <button
              type="button"
              onClick={toggleHighlightLinks}
              className={`flex items-center justify-between rounded-xl border p-2.5 transition-colors ${
                prefs.highlightLinks
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-slate-200 text-plai-gray hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 font-heading text-xs font-bold">
                <LinkIcon size={16} />
                <span>Resaltar Enlaces</span>
              </div>
              {prefs.highlightLinks && <Check size={16} className="text-primary" />}
            </button>

            {/* Botón Restablecer */}
            {hasActiveModifiers && (
              <button
                type="button"
                onClick={handleReset}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2 font-heading text-xs font-bold text-plai-gray hover:bg-slate-200 transition-colors"
              >
                <RotateCcw size={14} />
                Restablecer ajustes
              </button>
            )}
          </div>
        </div>
      )}

      {/* Botón flotante activador */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn btn-circle size-12 border-0 shadow-[0_4px_20px_rgba(27,54,93,0.3)] transition-all duration-[250ms] hover:scale-110 active:scale-95 ${
          hasActiveModifiers ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-navy text-white hover:bg-plai'
        }`}
        aria-label="Abrir opciones de accesibilidad"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        id="accessibility-btn"
        title="Herramientas de Accesibilidad PLAi"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="16" cy="4" r="1" />
          <path d="m18 19 1-7-5.87.94" />
          <path d="M5 8l3-3 5.5 3-2.36 3.5" />
          <path d="m9 12.8-.3 4.2L14 19" />
        </svg>
      </button>
    </div>
  );
}

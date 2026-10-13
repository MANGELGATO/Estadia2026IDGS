export default function AccessibilityButton() {
  return (
    <button
      className="btn btn-circle fixed bottom-6 right-6 z-[90] size-12 border-0 bg-navy text-white shadow-[0_4px_20px_rgba(27,54,93,0.3)] transition-all duration-[250ms] hover:scale-110 hover:bg-plai hover:shadow-[0_6px_24px_rgba(168,30,113,0.35)]"
      aria-label="Opciones de accesibilidad"
      id="accessibility-btn"
      title="Accesibilidad"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="4" r="1"/>
        <path d="m18 19 1-7-5.87.94"/>
        <path d="M5 8l3-3 5.5 3-2.36 3.5"/>
        <path d="m9 12.8-.3 4.2L14 19"/>
      </svg>
    </button>
  );
}

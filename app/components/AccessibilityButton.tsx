import styles from './AccessibilityButton.module.css';

export default function AccessibilityButton() {
  return (
    <button
      className={styles.fab}
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

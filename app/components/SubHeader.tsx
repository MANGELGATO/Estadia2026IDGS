import styles from './SubHeader.module.css';

export default function SubHeader() {
  return (
    <div className={styles.subheader}>
      <div className={styles.container}>
        {/* Icon mirroring the CD symbol from the real site */}
        <div className={styles.iconWrapper}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="18" r="11" stroke="white" strokeWidth="2.5" fill="none"/>
            <circle cx="12" cy="18" r="5" stroke="white" strokeWidth="2.5" fill="none"/>
            <circle cx="24" cy="18" r="11" stroke="white" strokeWidth="2.5" fill="none"/>
            <circle cx="24" cy="18" r="5" stroke="white" strokeWidth="2.5" fill="none"/>
          </svg>
        </div>
        <div>
          <p className={styles.label}>Aprender</p>
          <p className={styles.subtitle}>Las competencias del futuro y desarrollar el talento</p>
        </div>
      </div>
    </div>
  );
}

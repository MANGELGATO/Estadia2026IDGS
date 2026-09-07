import Link from 'next/link';
import { mockApps } from '../../lib/mockData';
import styles from './AplicacionesPage.module.css';
import { ArrowLeft } from 'lucide-react';

export default function AplicacionesPage() {
  return (
    <div>
      <div className={styles.hero}>
        <div className={styles.heroContainer}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} /> Volver al inicio
          </Link>
          <h1 className={styles.heroTitle}>Catálogo de Software</h1>
          <p className={styles.heroDesc}>
            Explora todas las aplicaciones, motores gráficos y herramientas de diseño disponibles en las instalaciones de PLAi.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentContainer}>
          <div className={styles.grid}>
            {mockApps.map(app => (
              <div key={app.id} className={styles.card}>
                <div className={styles.cardIcon}>
                  {app.iconUrl}
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.category}>{app.category}</p>
                  <h3 className={styles.title}>{app.name}</h3>
                  <p className={styles.description}>{app.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

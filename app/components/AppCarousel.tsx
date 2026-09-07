import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './AppCarousel.module.css';
import { mockApps } from '../../lib/mockData';

export default function AppCarousel() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h2 className={styles.sectionTitle}>Catálogo de Software y Aplicaciones</h2>
          <Link href="/aplicaciones" className={styles.seeAllBtn}>
            Ver catálogo completo <ArrowRight size={15} />
          </Link>
        </div>
        
        <div className={styles.carousel}>
          {mockApps.map((app) => (
            <div key={app.id} className={styles.card}>
              <div className={styles.cardInner}>
                <div className={styles.iconWrapper}>
                  <span className={styles.icon}>{app.iconUrl}</span>
                </div>
                <div className={styles.info}>
                  <p className={styles.category}>{app.category}</p>
                  <h3 className={styles.name}>{app.name}</h3>
                  <p className={styles.description}>{app.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

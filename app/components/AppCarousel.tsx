import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './AppCarousel.module.css';
import { mockApps } from '../../lib/mockData';

const platformIcon: Record<string, string> = {
  'Meta Quest': '🥽',
  'PC': '💻',
  'Meta Quest + PC': '🎮',
};

// Show only first 8 in the landing carousel
const PREVIEW_COUNT = 8;

export default function AppCarousel() {
  const preview = mockApps.slice(0, PREVIEW_COUNT);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <h2 className={styles.sectionTitle}>Catálogo de Software y Aplicaciones</h2>
            <p className={styles.sectionSubtitle}>
              Juegos educativos e inmersivos para Meta Quest VR y PC disponibles en PLAi
            </p>
          </div>
          <Link href="/aplicaciones" className={styles.seeAllBtn}>
            Ver catálogo completo <ArrowRight size={15} />
          </Link>
        </div>

        <div className={styles.carousel}>
          {preview.map((app) => (
            <div key={app.id} className={styles.card}>
              <div className={styles.cardInner}>
                <div className={styles.iconWrapper}>
                  <span className={styles.icon}>{app.iconUrl}</span>
                </div>
                <div className={styles.info}>
                  <div className={styles.metaRow}>
                    <span className={styles.category}>{app.category}</span>
                    <span className={styles.platform}>
                      {platformIcon[app.platform]} {app.platform}
                    </span>
                  </div>
                  <h3 className={styles.name}>{app.name}</h3>
                  <p className={styles.developer}>{app.developer}</p>
                  <p className={styles.description}>{app.description}</p>
                  <span className={styles.ageBadge}>👤 {app.ageRating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <Link href="/aplicaciones" className={styles.seeAllBtnBottom}>
            Ver las {mockApps.length} aplicaciones disponibles <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

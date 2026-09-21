import React from 'react';
import styles from './StatCard.module.css';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
};

export default function StatCard({ title, value, icon, variant = 'primary' }: StatCardProps) {
  let iconClass = styles.iconPrimary;
  if (variant === 'success') iconClass = styles.iconSuccess;
  if (variant === 'warning') iconClass = styles.iconWarning;
  if (variant === 'danger') iconClass = styles.iconDanger;

  return (
    <div className={styles.card}>
      <div className={`${styles.iconWrapper} ${iconClass}`}>
        {icon}
      </div>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>{value}</span>
      </div>
    </div>
  );
}

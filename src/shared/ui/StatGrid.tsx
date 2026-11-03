import type { Stat } from '@/entities/dataset/types';
import styles from './ui.module.css';
import { cn } from '@/shared/lib/cn';

interface StatGridProps {
  stats: Stat[];
  compact?: boolean;
}

export function StatGrid({ stats, compact = false }: StatGridProps) {
  return (
    <div className={styles.statGrid}>
      {stats.map((stat) => (
        <div key={stat.label} className={cn(styles.stat, compact && styles.statCompact)}>
          <span className={styles.statLabel}>{stat.label}</span>
          <span className={cn(styles.statValue, compact && styles.statValueCompact)}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}

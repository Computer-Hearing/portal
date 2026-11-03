import type { ReactNode } from 'react';
import styles from './tools.module.css';

interface ToolCardProps {
  href: string;
  name: string;
  description: string;
  host: string;
  icon: ReactNode;
}

export function ToolCard({ href, name, description, host, icon }: ToolCardProps) {
  return (
    <a className={styles.card} href={href} target="_blank" rel="noopener noreferrer">
      <span className={styles.icon}>{icon}</span>
      <span className={styles.title}>{name}</span>
      <span className={styles.description}>{description}</span>
      <span className={styles.footer}>
        <span>{host}</span>
        <span className={styles.open}>Открыть →</span>
      </span>
    </a>
  );
}

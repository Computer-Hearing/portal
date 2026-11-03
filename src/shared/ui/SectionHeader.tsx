import type { ReactNode } from 'react';
import styles from './ui.module.css';
import { cn } from '@/shared/lib/cn';

interface SectionHeaderProps {
  title: string;
  lead?: string;
  as?: 'h1' | 'h2';
  size?: 'lg' | 'md';
  id?: string;
  children?: ReactNode;
}

export function SectionHeader({
  title,
  lead,
  as: Tag = 'h2',
  size = 'lg',
  id,
  children,
}: SectionHeaderProps) {
  return (
    <div className={styles.sectionHeader}>
      <Tag id={id} className={cn(styles.sectionTitle, size === 'md' && styles.sectionTitleMd)}>
        {title}
      </Tag>
      {lead ? <p className={styles.sectionLead}>{lead}</p> : null}
      {children}
    </div>
  );
}

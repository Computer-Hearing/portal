import type { ReactNode } from 'react';
import styles from './ui.module.css';
import { cn } from '@/shared/lib/cn';

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn(styles.chip, className)}>{children}</span>;
}

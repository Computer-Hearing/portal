import type { ButtonHTMLAttributes } from 'react';
import styles from './ui.module.css';
import { cn } from '@/shared/lib/cn';

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Pill({ active = false, className, ...rest }: PillProps) {
  return (
    <button
      type="button"
      className={cn(styles.pill, active && styles.pillOn, className)}
      aria-pressed={active}
      {...rest}
    />
  );
}

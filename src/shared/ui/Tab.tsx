import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './ui.module.css';
import { cn } from '@/shared/lib/cn';

interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
}

export function Tab({ active = false, className, children, ...rest }: TabProps) {
  return (
    <button
      type="button"
      className={cn(styles.tab, active && styles.tabOn, rest.disabled && styles.tabOff, className)}
      aria-current={active ? 'page' : undefined}
      {...rest}
    >
      {children}
    </button>
  );
}

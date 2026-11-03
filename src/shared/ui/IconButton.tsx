import type { ButtonHTMLAttributes } from 'react';
import styles from './ui.module.css';
import { cn } from '@/shared/lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(styles.iconBtn, className)}
      aria-label={label}
      {...rest}
    >
      {children}
    </button>
  );
}

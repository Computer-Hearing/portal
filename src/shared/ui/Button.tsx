import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './ui.module.css';
import { cn } from '@/shared/lib/cn';

type ButtonVariant = 'default' | 'accent';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'default', className, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(styles.btn, variant === 'accent' && styles.btnAccent, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function LinkButton({
  variant = 'default',
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <a className={cn(styles.btn, variant === 'accent' && styles.btnAccent, className)} {...rest}>
      {children}
    </a>
  );
}

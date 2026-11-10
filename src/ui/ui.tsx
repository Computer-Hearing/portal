// Небольшие общие компоненты портала. Стили — в ui.module.css.
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import type { Stat } from '@/data/portal';
import styles from './ui.module.css';

/** Склеивает имена классов, пропуская пустые: cn('a', cond && 'b') */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

// --- Кнопки ----------------------------------------------------------------

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

// --- Мелочи ------------------------------------------------------------------

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn(styles.chip, className)}>{children}</span>;
}

export function Spinner() {
  return <span className={styles.spinner} aria-hidden="true" />;
}

// --- Заголовок раздела -----------------------------------------------------

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

// --- Сетка показателей -----------------------------------------------------

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

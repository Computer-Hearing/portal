import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...rest,
  };
}

export function LogoMark({ size = 36, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <rect x="0.5" y="0.5" width="35" height="35" rx="9" stroke="var(--border-strong)" />
      <path
        d="M8 18h2M13 13v10M18 9v18M23 13v10M28 18h-2"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronRight({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...base({ size, ...rest })}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronDown({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...base({ size, ...rest })}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function CloseIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...base({ size, ...rest })}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function DownloadIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...base({ size, ...rest })}>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

export function RotateIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...base({ size, ...rest })}>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export function FlaskIcon({ size = 40, ...rest }: IconProps) {
  return (
    <svg {...base({ size, ...rest })}>
      <path d="M9 3h6" />
      <path d="M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3" />
      <path d="M7.5 14h9" />
    </svg>
  );
}

export function ChartIcon({ size = 40, ...rest }: IconProps) {
  return (
    <svg {...base({ size, ...rest })}>
      <path d="M3 20h18" />
      <path d="M5 16l4-5 4 3 6-8" />
    </svg>
  );
}

export function ContainersIcon({ size = 40, ...rest }: IconProps) {
  return (
    <svg {...base({ size, ...rest })}>
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" />
      <path d="M7 7h.01M7 17h.01" />
    </svg>
  );
}

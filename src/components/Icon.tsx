// Iconos SVG profesionales (estilo línea, tipo Lucide). Usan `currentColor`
// para heredar el color del contexto. Sin emojis en toda la app.

type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

function base(size = 18, strokeWidth = 2) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

export function PlayIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SkipIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  );
}

export function CheckIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CloseIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function DotIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function TrophyIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <path d="M6 4h12v4a6 6 0 0 1-12 0V4z" />
      <path d="M6 6H4a2 2 0 0 0 0 4h2" />
      <path d="M18 6h2a2 2 0 0 1 0 4h-2" />
      <line x1="12" y1="14" x2="12" y2="18" />
      <path d="M8 21h8" />
      <path d="M9 18h6v3H9z" />
    </svg>
  );
}

export function GamepadIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <line x1="6" y1="11" x2="10" y2="11" />
      <line x1="8" y1="9" x2="8" y2="13" />
      <line x1="15" y1="12" x2="15.01" y2="12" />
      <line x1="18" y1="10" x2="18.01" y2="10" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.98 3.59L2 14.5A2.5 2.5 0 0 0 6.5 16l1.5-2h8l1.5 2a2.5 2.5 0 0 0 4.5-1.5l-.7-5.91A4 4 0 0 0 17.32 5z" />
    </svg>
  );
}

export function SpinnerIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg
      {...base(size, strokeWidth)}
      className={`spin-cw ${className ?? ""}`}
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export function AlertIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function InfoIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function CalendarIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function ArrowRightIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function TwitchIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <path d="M4 3h16v11l-4 4h-4l-3 3H7v-3H4V3z" />
      <line x1="10" y1="8" x2="10" y2="12" />
      <line x1="15" y1="8" x2="15" y2="12" />
    </svg>
  );
}

export function LiveIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      <path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4" />
    </svg>
  );
}

export function EyeIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function UsersIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function ZapIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <polygon
        points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function VolumeIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M18.36 5.64a9 9 0 0 1 0 12.72" />
    </svg>
  );
}

export function VolumeMuteIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

export function SaveIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

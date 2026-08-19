import * as React from 'react';
import { cn } from '../utils';

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl md:text-5xl',
} as const;

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: keyof typeof sizeClasses;
}

// Wordmark ClubOS : "Club" en navy, "OS" en dégradé bleu (icône power du
// logo de marque). Cf. packages/ui/src/tokens.ts::brandGradient.
export function Logo({ size = 'md', className, ...props }: LogoProps) {
  return (
    <span className={cn('inline-flex items-baseline font-extrabold tracking-tight', sizeClasses[size], className)} {...props}>
      <span className="text-navy">Club</span>
      <span className="bg-gradient-to-br from-brand-400 to-brand-600 bg-clip-text text-transparent">OS</span>
    </span>
  );
}

export interface TaglineProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof sizeClasses;
}

// Tagline "Un club. Une plateforme." avec le soulignement en arc du logo —
// le mot "plateforme" est mis en avant par le dégradé de marque.
export function Tagline({ size = 'md', className, ...props }: TaglineProps) {
  return (
    <div className={cn('relative inline-block', className)} {...props}>
      <p className={cn('font-bold text-navy', sizeClasses[size])}>
        Un club. <span className="bg-gradient-to-br from-brand-400 to-brand-600 bg-clip-text text-transparent">Une plateforme.</span>
      </p>
      <svg viewBox="0 0 200 12" preserveAspectRatio="none" className="mt-1 h-2 w-full" aria-hidden="true">
        <path d="M2 8 Q 100 -4 198 8" fill="none" stroke="url(#clubos-swoosh)" strokeWidth="3" strokeLinecap="round" />
        <defs>
          <linearGradient id="clubos-swoosh" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

import * as React from 'react';
import { cn, initials } from '../utils';

const AVATAR_PALETTE = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#0891B2'];

function colorForName(name: string): string {
  const hash = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = { sm: 'h-6 w-6 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' };

export function Avatar({ firstName, lastName, avatarUrl, size = 'md', className, ...props }: AvatarProps) {
  const label = initials(firstName, lastName);

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={`${firstName} ${lastName}`}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn('flex items-center justify-center rounded-full font-semibold text-white', sizeClasses[size], className)}
      style={{ backgroundColor: colorForName(`${firstName}${lastName}`) }}
      title={`${firstName} ${lastName}`}
      {...props}
    >
      {label}
    </div>
  );
}

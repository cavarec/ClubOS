import * as React from 'react';
import { Avatar } from './Avatar';
import { cn } from '../utils';
import type { PresenceStatus } from '@clubos/database';

export interface PresenceToggleProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  status: PresenceStatus | null;
  onChange: (status: PresenceStatus) => void;
}

const options: { value: PresenceStatus; label: string }[] = [
  { value: 'present', label: 'Présent' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excusé' },
];

export function PresenceToggle({ firstName, lastName, avatarUrl, status, onChange }: PresenceToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-none">
      <div className="flex items-center gap-3">
        <Avatar firstName={firstName} lastName={lastName} avatarUrl={avatarUrl} size="sm" />
        <span className="text-sm font-medium text-ink">
          {firstName} {lastName}
        </span>
      </div>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-medium transition-colors',
              status === opt.value
                ? opt.value === 'present'
                  ? 'bg-green-600 text-white'
                  : opt.value === 'absent'
                    ? 'bg-red-600 text-white'
                    : 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

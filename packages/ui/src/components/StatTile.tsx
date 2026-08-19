import * as React from 'react';
import { cn } from '../utils';

export interface StatTileProps {
  label: string;
  value: string | number;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
}

const toneClasses = {
  neutral: 'text-ink',
  success: 'text-green-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
};

export function StatTile({ label, value, tone = 'neutral', icon }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        {icon}
      </div>
      <span className={cn('text-2xl font-semibold', toneClasses[tone])}>{value}</span>
    </div>
  );
}

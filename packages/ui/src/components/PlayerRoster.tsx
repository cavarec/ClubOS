'use client';

import * as React from 'react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import type { TeamMemberRole } from '@clubos/database';

export interface RosterPlayer {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: TeamMemberRole;
  presenceRate?: number; // 0-100, taux de présence sur la saison
}

export interface PlayerRosterProps {
  players: RosterPlayer[];
  onSelectPlayer?: (id: string) => void;
}

export function PlayerRoster({ players, onSelectPlayer }: PlayerRosterProps) {
  return (
    <ul className="divide-y divide-slate-100">
      {players.map((p) => (
        <li key={p.id}>
          <button
            onClick={() => onSelectPlayer?.(p.id)}
            className="flex w-full items-center justify-between gap-3 py-2 text-left hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <Avatar firstName={p.firstName} lastName={p.lastName} avatarUrl={p.avatarUrl} size="sm" />
              <div>
                <p className="text-sm font-medium text-ink">
                  {p.firstName} {p.lastName}
                </p>
                {typeof p.presenceRate === 'number' && (
                  <p className="text-xs text-slate-500">{p.presenceRate}% de présence</p>
                )}
              </div>
            </div>
            {p.role !== 'player' && <Badge variant="brand">{p.role === 'coach' ? 'Entraîneur' : 'Manager'}</Badge>}
          </button>
        </li>
      ))}
    </ul>
  );
}

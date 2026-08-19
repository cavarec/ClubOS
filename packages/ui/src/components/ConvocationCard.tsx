import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import type { ConvocationResponseStatus } from '@clubos/database';

export interface ConvocationCardProps {
  eventTitle: string;
  eventLocation: string | null;
  startAt: string;
  meetTime?: string;
  myStatus: ConvocationResponseStatus;
  onRespond: (status: 'present' | 'absent' | 'maybe') => void;
  carpoolSeatsAvailable?: number;
  onOpenCarpool?: () => void;
}

const statusLabel: Record<ConvocationResponseStatus, string> = {
  pending: 'En attente de réponse',
  present: 'Présent confirmé',
  absent: 'Absence signalée',
  maybe: 'Réponse incertaine',
};

const statusVariant: Record<ConvocationResponseStatus, 'neutral' | 'success' | 'danger' | 'warning'> = {
  pending: 'neutral',
  present: 'success',
  absent: 'danger',
  maybe: 'warning',
};

export function ConvocationCard({
  eventTitle,
  eventLocation,
  startAt,
  meetTime,
  myStatus,
  onRespond,
  carpoolSeatsAvailable,
  onOpenCarpool,
}: ConvocationCardProps) {
  const date = new Date(startAt);
  const formatted = date.toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{eventTitle}</CardTitle>
          <Badge variant={statusVariant[myStatus]}>{statusLabel[myStatus]}</Badge>
        </div>
        <p className="text-sm text-slate-500">
          {formatted}
          {eventLocation ? ` · ${eventLocation}` : ''}
          {meetTime ? ` · Rdv ${meetTime}` : ''}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Button variant={myStatus === 'present' ? 'primary' : 'outline'} size="sm" onClick={() => onRespond('present')}>
            Présent
          </Button>
          <Button variant={myStatus === 'absent' ? 'destructive' : 'outline'} size="sm" onClick={() => onRespond('absent')}>
            Absent
          </Button>
          <Button variant={myStatus === 'maybe' ? 'secondary' : 'outline'} size="sm" onClick={() => onRespond('maybe')}>
            ?
          </Button>
        </div>
        {typeof carpoolSeatsAvailable === 'number' && (
          <button
            onClick={onOpenCarpool}
            className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
          >
            <span>🚗 Covoiturage : {carpoolSeatsAvailable} place(s) disponible(s)</span>
            <span className="text-brand-600">Réserver →</span>
          </button>
        )}
      </CardContent>
    </Card>
  );
}

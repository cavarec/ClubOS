'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import type { OrderStatus } from '@clubos/database';

export interface PaymentCardProps {
  productName: string;
  amountCents: number;
  status: OrderStatus;
  installmentsAvailable?: boolean;
  onPay: () => void;
  onChooseInstallments?: () => void;
}

const statusVariant: Record<OrderStatus, 'neutral' | 'success' | 'danger' | 'warning'> = {
  pending: 'warning',
  paid: 'success',
  failed: 'danger',
  refunded: 'neutral',
};

const statusLabel: Record<OrderStatus, string> = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échec',
  refunded: 'Remboursé',
};

function formatAmount(cents: number): string {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export function PaymentCard({
  productName,
  amountCents,
  status,
  installmentsAvailable,
  onPay,
  onChooseInstallments,
}: PaymentCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{productName}</CardTitle>
          <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-xl font-semibold text-ink">{formatAmount(amountCents)}</span>
        {status === 'pending' && (
          <div className="flex gap-2">
            {installmentsAvailable && (
              <Button variant="outline" size="sm" onClick={onChooseInstallments}>
                Échelonner
              </Button>
            )}
            <Button size="sm" onClick={onPay}>
              Payer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  accentClass?: string;
}

export function StatsCard({ label, value, subtitle, accentClass }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <p className="text-xs text-text-tertiary mb-1">{label}</p>
      <p className={cn('text-2xl font-bold text-text-primary', accentClass)}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-text-tertiary mt-1">{subtitle}</p>
      )}
    </div>
  );
}

import type { KPI } from '@/lib/dataAnalyzer';
import { Box, Gauge, Clock, AlertTriangle, PackageCheck } from 'lucide-react';

const icons = {
  production: Box,
  efficiency: Gauge,
  downtime: Clock,
  defect: AlertTriangle,
  orders: PackageCheck,
};

const colorMap = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
};

const barColorMap = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

export default function KPICards({ kpis }: { kpis: KPI[] }) {
  if (!kpis.length) return null;

  return (
    <div className="grid gap-3 shrink-0" style={{ gridTemplateColumns: `repeat(${Math.min(kpis.length, 5)}, 1fr)` }}>
      {kpis.slice(0, 5).map((kpi, i) => {
        const Icon = icons[kpi.icon];
        return (
          <div key={i} className="bg-card rounded-lg p-4 flex flex-col items-center justify-center border border-border min-h-[120px]">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-5 h-5 ${colorMap[kpi.color]}`} />
              <span className="text-kpi-label text-sm font-body font-medium truncate max-w-[140px]">{kpi.label}</span>
            </div>
            <span className={`text-5xl font-display font-extrabold ${colorMap[kpi.color]} leading-none my-1`}>
              {kpi.value}
            </span>
            {kpi.progress !== undefined && (
              <div className="w-full h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColorMap[kpi.color]}`}
                  style={{ width: `${Math.min(100, kpi.progress)}%` }}
                />
              </div>
            )}
            {kpi.progress !== undefined && (
              <span className="text-xs text-muted-foreground mt-1 font-body">{kpi.progress}% da meta</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

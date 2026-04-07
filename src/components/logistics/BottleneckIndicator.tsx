import { useMemo } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import type { Order } from '@/lib/logisticsData';

interface Props {
  orders: Order[];
}

export default function BottleneckIndicator({ orders }: Props) {
  const insights = useMemo(() => {
    const total = orders.length;
    if (!total) return [];

    // Phase counts
    const phaseCounts: Record<string, number> = {};
    orders.forEach(o => { phaseCounts[o.phase] = (phaseCounts[o.phase] || 0) + 1; });

    const sorted = Object.entries(phaseCounts).sort((a, b) => b[1] - a[1]);
    const topPhase = sorted[0];

    // Backlog: orders stuck before separation
    const backlog = (phaseCounts['Em Digit.'] || 0) + (phaseCounts['A Sep.'] || 0);
    const backlogPct = total ? Math.round((backlog / total) * 100) : 0;

    // Throughput: completed separation
    const throughput = (phaseCounts['Sep. Conf.'] || 0) + (phaseCounts['Em Cko.'] || 0) + (phaseCounts['Cko Vol. Ok'] || 0) + (phaseCounts['N.F. Conf.'] || 0);
    const throughputPct = total ? Math.round((throughput / total) * 100) : 0;

    // Conf Sep rate
    const confSep = orders.filter(o => o.dtConfSep).length;
    const confSepPct = total ? Math.round((confSep / total) * 100) : 0;

    const result = [];

    if (backlogPct > 30) {
      result.push({ icon: AlertTriangle, color: 'text-[hsl(var(--warning))]', bg: 'bg-[hsl(var(--warning))]/10', label: 'Gargalo Identificado', desc: `${backlogPct}% dos pedidos aguardando separação` });
    }

    if (topPhase) {
      result.push({ icon: Zap, color: 'text-primary', bg: 'bg-primary/10', label: 'Maior Concentração', desc: `${topPhase[0]}: ${topPhase[1]} pedidos (${Math.round((topPhase[1]/total)*100)}%)` });
    }

    result.push({ icon: throughputPct >= 50 ? TrendingUp : TrendingDown, color: throughputPct >= 50 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]', bg: throughputPct >= 50 ? 'bg-[hsl(var(--success))]/10' : 'bg-[hsl(var(--destructive))]/10', label: 'Fluxo Operacional', desc: `${throughputPct}% em fases avançadas` });

    result.push({ icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', label: 'Taxa Conf. Separação', desc: `${confSepPct}% dos pedidos confirmados` });

    return result.slice(0, 4);
  }, [orders]);

  if (!insights.length) return null;

  return (
    <div className="bg-card rounded-lg border border-border p-3 h-full flex flex-col">
      <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
        Insights Operacionais
      </h3>
      <div className="flex-1 flex flex-col gap-2 justify-center">
        {insights.map((item, i) => (
          <div key={i} className={`flex items-center gap-2.5 rounded-md px-3 py-2 ${item.bg}`}>
            <item.icon className={`w-4 h-4 shrink-0 ${item.color}`} />
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-foreground block leading-tight">{item.label}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

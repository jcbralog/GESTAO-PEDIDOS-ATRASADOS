import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { WduOrder } from '@/lib/wduData';
import { computeMetrics } from '@/lib/wduData';

interface Props { orders: WduOrder[]; }

export default function WduTopOverdue({ orders }: Props) {
  const top = useMemo(() => {
    const now = new Date();
    return orders
      .map(o => ({ o, lead: computeMetrics(o, now).leadTime }))
      .filter(x => x.lead > 1)
      .sort((a, b) => b.lead - a.lead)
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="bg-[#7F1D1D] border border-[#EF4444]/40 rounded-lg p-4 h-full flex flex-col">
      <h3 className="text-xs uppercase tracking-[0.1em] text-white font-semibold mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        Top 5 Mais Atrasados
      </h3>
      {top.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-white/80 text-sm">
          Nenhum pedido em atraso ✓
        </div>
      ) : (
        <ul className="flex-1 space-y-2 text-white">
          {top.map(({ o, lead }) => (
            <li key={o.noDP} className="flex items-center justify-between gap-3 bg-black/20 rounded px-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-mono font-semibold">#{o.noDP}</div>
                <div className="text-[11px] text-white/80 truncate">{o.cliente}</div>
                <div className="text-[10px] text-white/60">{o.sitFase}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold leading-none">{lead.toFixed(1).replace('.', ',')}</div>
                <div className="text-[10px] text-white/70">dias úteis</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
    <div className="bg-white border border-[#FECACA] rounded-lg p-3 h-full flex flex-col shadow-sm">
      <h3 className="text-[11px] uppercase tracking-[0.1em] text-[#991B1B] font-semibold mb-2 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5" />
        Top 5 Mais Atrasados
      </h3>
      {top.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[#10B981] text-sm font-semibold">
          Nenhum pedido em atraso ✓
        </div>
      ) : (
        <ul className="flex-1 space-y-2">
          {top.map(({ o, lead }) => (
            <li key={o.noDP} className="flex items-center justify-between gap-3 bg-[#FEF2F2] border border-[#FECACA] rounded px-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-mono font-semibold text-[#0F172A]">#{o.noDP}</div>
                <div className="text-[11px] text-[#475569] truncate">{o.cliente}</div>
                <div className="text-[10px] text-[#94A3B8]">{o.sitFase}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold leading-none text-[#DC2626]">{lead.toFixed(1).replace('.', ',')}</div>
                <div className="text-[10px] text-[#94A3B8]">dias úteis</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useMemo } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import type { WduOrder } from '@/lib/wduData';
import { computeMetrics } from '@/lib/wduData';

interface Props { orders: WduOrder[]; }

export default function WduGauge({ orders }: Props) {
  const { pct, noPrazo, atraso } = useMemo(() => {
    const now = new Date();
    const total = orders.length || 1;
    const atraso = orders.filter(o => computeMetrics(o, now).emAtraso).length;
    const noPrazo = orders.length - atraso;
    return { pct: (noPrazo / total) * 100, noPrazo, atraso };
  }, [orders]);

  const color = pct > 70 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
  const status = pct > 70 ? 'Saudável' : pct >= 50 ? 'Atenção' : 'Crítico';

  const data = [{ name: 'pct', value: pct, fill: color }];

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-3 h-full flex flex-col">
      <h3 className="text-[11px] uppercase tracking-[0.1em] text-[#94A3B8] font-semibold mb-1">
        Saúde Operacional
      </h3>
      <div className="flex-1 relative min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="68%" outerRadius="100%" data={data} startAngle={210} endAngle={-30}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background={{ fill: '#0F172A' }} dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-3xl font-bold leading-none" style={{ color }}>{pct.toFixed(0)}%</div>
          <div className="text-[9px] uppercase tracking-wider text-[#94A3B8] mt-0.5">No Prazo</div>
          <div className="text-[10px] font-semibold mt-0.5" style={{ color }}>{status}</div>
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#94A3B8] border-t border-[#334155] pt-1.5">
        <span>OK: <span className="text-[#10B981] font-semibold">{noPrazo}</span></span>
        <span>Atraso: <span className="text-[#EF4444] font-semibold">{atraso}</span></span>
      </div>
    </div>
  );
}

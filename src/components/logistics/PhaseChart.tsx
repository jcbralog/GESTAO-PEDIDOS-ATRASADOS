import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PHASE_COLORS_RAW } from '@/lib/logisticsData';
import type { Order } from '@/lib/logisticsData';

// Phase order for lead time calculation
const PHASE_ORDER = ['Em Digit.', 'A Sep.', 'Em Sep.', 'Sep. Conf.', 'Em Cko.', 'Cko Vol. Ok', 'N.F. Conf.', 'Faturado', 'Expedido', 'Em Trânsito', 'Entregue', 'Devolvido'];

interface Props {
  orders: Order[];
}

export default function PhaseChart({ orders }: Props) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    const dateSums: Record<string, number[]> = {};

    orders.forEach(o => {
      counts[o.phase] = (counts[o.phase] || 0) + 1;
      if (!dateSums[o.phase]) dateSums[o.phase] = [];
      dateSums[o.phase].push(o.leadTimeDays);
    });

    return Object.entries(counts)
      .map(([name, value]) => {
        const times = dateSums[name] || [];
        const avgTime = times.length ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : '0';
        return { name, value, avgTime: Number(avgTime), fill: PHASE_COLORS_RAW[name] || '#3B82F6' };
      })
      .sort((a, b) => {
        const ia = PHASE_ORDER.indexOf(a.name);
        const ib = PHASE_ORDER.indexOf(b.name);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      });
  }, [orders]);

  return (
    <div className="bg-card rounded-lg border border-border p-3 h-full flex flex-col">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Situação / Fase dos Pedidos</h3>
      <div className="flex-1 min-h-0 grid grid-cols-[1fr_auto] gap-2">
        <div className="min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
              <XAxis type="number" tick={{ fill: 'hsl(215,20%,65%)', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fill: 'hsl(0,0%,100%)', fontSize: 9 }} />
              <Tooltip
                contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,20%)', borderRadius: 8, fontSize: 12, color: '#fff' }}
                formatter={(v: number, _name: string, entry: any) => {
                  const item = data.find(d => d.name === entry.payload.name);
                  return [`${v} pedidos • ${item?.avgTime || 0}d médio`, 'Fase'];
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Avg time legend */}
        <div className="flex flex-col justify-center gap-0.5 pr-1">
          <span className="text-[8px] text-muted-foreground uppercase font-semibold mb-1">Tempo Médio</span>
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: d.fill }} />
              <span className="text-[9px] text-foreground font-mono font-semibold">{d.avgTime}d</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

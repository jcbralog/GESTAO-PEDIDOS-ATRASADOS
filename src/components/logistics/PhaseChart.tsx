import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PHASE_COLORS_RAW } from '@/lib/logisticsData';
import type { Order } from '@/lib/logisticsData';

interface Props {
  orders: Order[];
}

export default function PhaseChart({ orders }: Props) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => { counts[o.phase] = (counts[o.phase] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, fill: PHASE_COLORS_RAW[name] || '#3B82F6' }))
      .sort((a, b) => b.value - a.value);
  }, [orders]);

  return (
    <div className="bg-card rounded-lg border border-border p-3 h-full flex flex-col">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Situação / Fase dos Pedidos</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
            <XAxis type="number" tick={{ fill: 'hsl(215,20%,65%)', fontSize: 10 }} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fill: 'hsl(0,0%,100%)', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,20%)', borderRadius: 8, fontSize: 12, color: '#fff' }}
              formatter={(v: number) => [v, 'Pedidos']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

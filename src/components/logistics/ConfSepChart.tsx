import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from 'recharts';
import type { Order } from '@/lib/logisticsData';

interface Props {
  orders: Order[];
}

export default function ConfSepChart({ orders }: Props) {
  const data = useMemo(() => {
    const withSep = orders.filter(o => o.dtConfSep);
    const grouped: Record<string, number> = {};
    withSep.forEach(o => {
      const dt = o.dtConfSep!;
      grouped[dt] = (grouped[dt] || 0) + 1;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-15)
      .map(([date, count]) => ({ date: date.slice(5), count }));
  }, [orders]);

  const avg = useMemo(() => {
    if (!data.length) return 0;
    return Math.round(data.reduce((s, d) => s + d.count, 0) / data.length);
  }, [data]);

  if (!data.length) return null;

  return (
    <div className="bg-card rounded-lg border border-border p-3 h-full flex flex-col">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
        Confirmações de Separação por Dia
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,15%)" />
            <XAxis dataKey="date" tick={{ fill: 'hsl(215,20%,65%)', fontSize: 10 }} />
            <YAxis tick={{ fill: 'hsl(215,20%,65%)', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,20%)', borderRadius: 8, fontSize: 12, color: '#fff' }}
              formatter={(v: number) => [v, 'Confirmações']}
            />
            <ReferenceLine y={avg} stroke="#F59E0B" strokeDasharray="5 3" label={{ value: `Média: ${avg}`, fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Conf. Sep.">
              {data.map((d, i) => (
                <Cell key={i} fill={d.count >= avg ? '#22C55E' : '#3B82F6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

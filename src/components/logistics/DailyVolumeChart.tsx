import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Order } from '@/lib/logisticsData';

interface Props {
  orders: Order[];
}

export default function DailyVolumeChart({ orders }: Props) {
  const data = useMemo(() => {
    const grouped: Record<string, { orders: number; units: number }> = {};
    orders.forEach(o => {
      if (!grouped[o.date]) grouped[o.date] = { orders: 0, units: 0 };
      grouped[o.date].orders++;
      grouped[o.date].units += o.units;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date: date.slice(5), ...v }));
  }, [orders]);

  return (
    <div className="bg-card rounded-lg border border-border p-3 h-full flex flex-col">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Volume Diário — Pedidos & Unidades</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,15%)" />
            <XAxis dataKey="date" tick={{ fill: 'hsl(215,20%,65%)', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: 'hsl(215,20%,65%)', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(215,20%,65%)', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,20%)', borderRadius: 8, fontSize: 12, color: '#fff' }} />
            <Area yAxisId="left" type="monotone" dataKey="orders" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} name="Pedidos" strokeWidth={2} />
            <Area yAxisId="right" type="monotone" dataKey="units" stroke="#22C55E" fill="#22C55E" fillOpacity={0.15} name="Unidades" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

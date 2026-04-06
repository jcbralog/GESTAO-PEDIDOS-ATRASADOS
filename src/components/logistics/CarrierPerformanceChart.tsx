import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Order } from '@/lib/logisticsData';

interface Props {
  orders: Order[];
}

export default function CarrierPerformanceChart({ orders }: Props) {
  const data = useMemo(() => {
    const grouped: Record<string, { total: number; onTime: number; delivered: number }> = {};
    orders.forEach(o => {
      if (!grouped[o.carrier]) grouped[o.carrier] = { total: 0, onTime: 0, delivered: 0 };
      grouped[o.carrier].total++;
      if (o.onTime) grouped[o.carrier].onTime++;
      if (o.phase === 'Entregue') grouped[o.carrier].delivered++;
    });
    return Object.entries(grouped)
      .map(([name, v]) => ({
        name,
        pedidos: v.total,
        onTime: v.total ? Math.round((v.onTime / v.total) * 100) : 0,
        entregues: v.delivered,
      }))
      .sort((a, b) => b.pedidos - a.pedidos);
  }, [orders]);

  return (
    <div className="bg-card rounded-lg border border-border p-3 h-full flex flex-col">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Performance por Transportadora</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fill: 'hsl(215,20%,65%)', fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fill: 'hsl(215,20%,65%)', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,20%)', borderRadius: 8, fontSize: 12, color: '#fff' }} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#fff' }} />
            <Bar dataKey="pedidos" fill="#3B82F6" name="Pedidos" radius={[4, 4, 0, 0]} />
            <Bar dataKey="entregues" fill="#22C55E" name="Entregues" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

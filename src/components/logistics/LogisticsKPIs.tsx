import { Package, Truck, Clock, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import type { Order } from '@/lib/logisticsData';
import { useMemo } from 'react';

interface Props {
  orders: Order[];
}

export default function LogisticsKPIs({ orders }: Props) {
  const kpis = useMemo(() => {
    const totalOrders = orders.length;
    const totalUnits = orders.reduce((s, o) => s + o.units, 0);
    const delivered = orders.filter(o => o.phase === 'Entregue').length;
    const onTime = orders.filter(o => o.onTime).length;
    const returned = orders.filter(o => o.phase === 'Devolvido').length;
    const avgLead = totalOrders ? (orders.reduce((s, o) => s + o.leadTimeDays, 0) / totalOrders) : 0;

    const dates = [...new Set(orders.map(o => o.date))];
    const numDays = Math.max(dates.length, 1);
    const ordersPerDay = (totalOrders / numDays).toFixed(1);
    const unitsPerDay = (totalUnits / numDays).toFixed(1);

    return [
      { label: 'Total Pedidos', value: totalOrders.toLocaleString('pt-BR'), icon: Package, color: 'text-primary' },
      { label: 'Unidades Totais', value: totalUnits.toLocaleString('pt-BR'), icon: BarChart3, color: 'text-primary' },
      { label: 'Pedidos/Dia', value: ordersPerDay, icon: TrendingUp, color: 'text-[hsl(var(--success))]' },
      { label: 'Unidades/Dia', value: unitsPerDay, icon: TrendingUp, color: 'text-[hsl(var(--success))]' },
      { label: 'Entregues', value: `${delivered} (${totalOrders ? ((delivered / totalOrders) * 100).toFixed(0) : 0}%)`, icon: Truck, color: 'text-[hsl(var(--success))]' },
      { label: 'On-Time', value: `${totalOrders ? ((onTime / totalOrders) * 100).toFixed(0) : 0}%`, icon: Clock, color: 'text-[hsl(var(--warning))]' },
      { label: 'Lead Time Médio', value: `${avgLead.toFixed(1)}d`, icon: Clock, color: 'text-primary' },
      { label: 'Devoluções', value: `${returned} (${totalOrders ? ((returned / totalOrders) * 100).toFixed(1) : 0}%)`, icon: AlertTriangle, color: 'text-[hsl(var(--destructive))]' },
    ];
  }, [orders]);

  return (
    <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
      {kpis.map(k => (
        <div key={k.label} className="bg-card rounded-lg p-3 border border-border flex flex-col items-center text-center">
          <k.icon className={`w-5 h-5 mb-1 ${k.color}`} />
          <span className="text-lg font-bold font-['Barlow_Condensed'] text-foreground leading-tight">{k.value}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{k.label}</span>
        </div>
      ))}
    </div>
  );
}

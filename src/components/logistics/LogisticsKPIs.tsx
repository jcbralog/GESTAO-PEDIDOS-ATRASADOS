import { Package, Truck, Clock, AlertTriangle, TrendingUp, BarChart3, CheckCircle2, CalendarCheck } from 'lucide-react';
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

    // Conf Sep stats
    const withConfSep = orders.filter(o => o.dtConfSep);
    const confSepCount = withConfSep.length;
    const confSepPct = totalOrders ? ((confSepCount / totalOrders) * 100).toFixed(0) : '0';

    // Phase breakdown for highlights
    const aguardandoSep = orders.filter(o => o.phase === 'Aguardando Separação').length;
    const emSeparacao = orders.filter(o => o.phase === 'Em Separação').length;

    return [
      { label: 'Total Pedidos', value: totalOrders.toLocaleString('pt-BR'), icon: Package, color: 'text-primary', highlight: false },
      { label: 'Pedidos/Dia', value: ordersPerDay, icon: TrendingUp, color: 'text-[hsl(var(--success))]', highlight: false },
      { label: 'Unidades/Dia', value: unitsPerDay, icon: BarChart3, color: 'text-[hsl(var(--success))]', highlight: false },
      { label: 'Conf. Separação', value: `${confSepCount} (${confSepPct}%)`, icon: CalendarCheck, color: 'text-primary', highlight: true },
      { label: 'Aguard. Separação', value: aguardandoSep.toLocaleString('pt-BR'), icon: Clock, color: 'text-[hsl(var(--warning))]', highlight: true },
      { label: 'Em Separação', value: emSeparacao.toLocaleString('pt-BR'), icon: CheckCircle2, color: 'text-[hsl(var(--chart-2))]', highlight: true },
      { label: 'Entregues', value: `${delivered} (${totalOrders ? ((delivered / totalOrders) * 100).toFixed(0) : 0}%)`, icon: Truck, color: 'text-[hsl(var(--success))]', highlight: false },
      { label: 'On-Time', value: `${totalOrders ? ((onTime / totalOrders) * 100).toFixed(0) : 0}%`, icon: Clock, color: 'text-[hsl(var(--warning))]', highlight: false },
      { label: 'Lead Time Médio', value: `${avgLead.toFixed(1)}d`, icon: Clock, color: 'text-primary', highlight: false },
      { label: 'Devoluções', value: `${returned} (${totalOrders ? ((returned / totalOrders) * 100).toFixed(1) : 0}%)`, icon: AlertTriangle, color: 'text-[hsl(var(--destructive))]', highlight: false },
    ];
  }, [orders]);

  return (
    <div className="grid grid-cols-5 lg:grid-cols-10 gap-1.5">
      {kpis.map(k => (
        <div
          key={k.label}
          className={`rounded-lg p-2.5 border flex flex-col items-center text-center ${
            k.highlight
              ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20'
              : 'bg-card border-border'
          }`}
        >
          <k.icon className={`w-4 h-4 mb-0.5 ${k.color}`} />
          <span className="text-base font-bold font-['Barlow_Condensed'] text-foreground leading-tight">{k.value}</span>
          <span className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{k.label}</span>
        </div>
      ))}
    </div>
  );
}

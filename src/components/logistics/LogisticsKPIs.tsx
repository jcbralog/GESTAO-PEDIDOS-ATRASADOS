import { Package, Truck, Clock, TrendingUp, BarChart3, CheckCircle2, CalendarCheck, FileText, BoxSelect, ScanLine, ClipboardCheck } from 'lucide-react';
import type { Order } from '@/lib/logisticsData';
import { useMemo } from 'react';

interface Props {
  orders: Order[];
}

export default function LogisticsKPIs({ orders }: Props) {
  const kpis = useMemo(() => {
    const totalOrders = orders.length;
    const totalUnits = orders.reduce((s, o) => s + o.units, 0);

    const dates = [...new Set(orders.map(o => o.date))];
    const numDays = Math.max(dates.length, 1);
    const ordersPerDay = (totalOrders / numDays).toFixed(1);
    const unitsPerDay = totalUnits.toLocaleString('pt-BR');

    // Conf Sep stats
    const withConfSep = orders.filter(o => o.dtConfSep);
    const confSepCount = withConfSep.length;
    const confSepPct = totalOrders ? ((confSepCount / totalOrders) * 100).toFixed(0) : '0';

    // Phase counts
    const emDigit = orders.filter(o => o.phase === 'Em Digit.').length;
    const aSep = orders.filter(o => o.phase === 'A Sep.').length;
    const emSep = orders.filter(o => o.phase === 'Em Sep.').length;
    const sepConf = orders.filter(o => o.phase === 'Sep. Conf.').length;
    const emCko = orders.filter(o => o.phase === 'Em Cko.').length;
    const ckoVolOk = orders.filter(o => o.phase === 'Cko Vol. Ok').length;
    const nfConf = orders.filter(o => o.phase === 'N.F. Conf.').length;

    return [
      { label: 'Total Pedidos', value: totalOrders.toLocaleString('pt-BR'), icon: Package, color: 'text-primary', highlight: false },
      { label: 'Pedidos/Dia', value: ordersPerDay, icon: TrendingUp, color: 'text-[hsl(var(--success))]', highlight: false },
      { label: 'Unit. Totais', value: unitsPerDay, icon: BarChart3, color: 'text-[hsl(var(--success))]', highlight: false },
      { label: 'Em Digit.', value: emDigit.toLocaleString('pt-BR'), icon: FileText, color: 'text-[hsl(var(--warning))]', highlight: true },
      { label: 'A Sep.', value: aSep.toLocaleString('pt-BR'), icon: Clock, color: 'text-[hsl(38,80%,65%)]', highlight: true },
      { label: 'Em Sep.', value: emSep.toLocaleString('pt-BR'), icon: BoxSelect, color: 'text-primary', highlight: true },
      { label: 'Sep. Conf.', value: sepConf.toLocaleString('pt-BR'), icon: ClipboardCheck, color: 'text-[hsl(200,70%,55%)]', highlight: true },
      { label: 'Em Cko.', value: emCko.toLocaleString('pt-BR'), icon: ScanLine, color: 'text-[hsl(280,67%,60%)]', highlight: true },
      { label: 'Cko Vol. Ok', value: ckoVolOk.toLocaleString('pt-BR'), icon: CheckCircle2, color: 'text-[hsl(var(--chart-2))]', highlight: true },
      { label: 'N.F. Conf.', value: nfConf.toLocaleString('pt-BR'), icon: Truck, color: 'text-[hsl(170,60%,45%)]', highlight: true },
      { label: 'Conf. Separação', value: `${confSepCount} (${confSepPct}%)`, icon: CalendarCheck, color: 'text-primary', highlight: false },
    ];
  }, [orders]);

  return (
    <div className="grid grid-cols-11 gap-1.5">
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

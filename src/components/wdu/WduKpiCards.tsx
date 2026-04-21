import { Package, Boxes, Truck, Clock } from 'lucide-react';
import type { WduOrder } from '@/lib/wduData';
import { computeMetrics } from '@/lib/wduData';
import { useMemo } from 'react';

interface Props {
  orders: WduOrder[];
}

export default function WduKpiCards({ orders }: Props) {
  const stats = useMemo(() => {
    const now = new Date();
    const totalPedidos = orders.length;
    const totalUnidades = orders.reduce((s, o) => s + (o.qtTot || 0), 0);
    const totalVolumes = orders.reduce((s, o) => s + (o.vols || 0), 0);
    const emAtraso = orders.filter(o => computeMetrics(o, now).emAtraso).length;
    const pctAtraso = totalPedidos ? (emAtraso / totalPedidos) * 100 : 0;
    return { totalPedidos, totalUnidades, totalVolumes, emAtraso, pctAtraso };
  }, [orders]);

  const atrasoColor =
    stats.pctAtraso > 30 ? 'bg-[#7F1D1D] border-[#EF4444]/40 text-white'
    : stats.pctAtraso >= 15 ? 'bg-[#78350F] border-[#F59E0B]/40 text-white'
    : 'bg-[#064E3B] border-[#10B981]/40 text-white';

  const atrasoIconColor =
    stats.pctAtraso > 30 ? 'text-[#EF4444]'
    : stats.pctAtraso >= 15 ? 'text-[#F59E0B]'
    : 'text-[#10B981]';

  const cards = [
    { label: 'Total Pedidos', value: stats.totalPedidos.toLocaleString('pt-BR'), icon: Package },
    { label: 'Total Unidades', value: stats.totalUnidades.toLocaleString('pt-BR'), icon: Boxes },
    { label: 'Total Volumes', value: stats.totalVolumes.toLocaleString('pt-BR'), icon: Truck },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(c => (
        <div key={c.label} className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-[0.1em] text-[#94A3B8] font-semibold">{c.label}</span>
            <c.icon className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="text-3xl font-bold text-[#F8FAFC]">{c.value}</div>
        </div>
      ))}
      <div className={`border rounded-lg p-4 ${atrasoColor}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-[0.1em] font-semibold opacity-90">Em Atraso</span>
          <Clock className={`w-4 h-4 ${atrasoIconColor}`} />
        </div>
        <div className="text-3xl font-bold">
          {stats.emAtraso.toLocaleString('pt-BR')}
          <span className="text-base font-semibold opacity-90 ml-1.5">
            ({stats.pctAtraso.toFixed(1).replace('.', ',')}%)
          </span>
        </div>
      </div>
    </div>
  );
}

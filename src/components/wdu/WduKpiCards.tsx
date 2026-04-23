import { Package, Boxes, Truck, Clock, ChevronRight } from 'lucide-react';
import type { WduOrder } from '@/lib/wduData';
import { computeMetrics } from '@/lib/wduData';
import { useMemo, useState } from 'react';
import WduDetailsModal from './WduDetailsModal';

interface Props {
  orders: WduOrder[];
}

type DrillKey = 'all' | 'units' | 'volumes' | 'overdue' | null;

export default function WduKpiCards({ orders }: Props) {
  const [drill, setDrill] = useState<DrillKey>(null);

  const stats = useMemo(() => {
    const now = new Date();
    const totalPedidos = orders.length;
    const totalUnidades = orders.reduce((s, o) => s + (o.qtTot || 0), 0);
    const totalVolumes = orders.reduce((s, o) => s + (o.vols || 0), 0);
    const overdueOrders = orders.filter(o => computeMetrics(o, now).emAtraso);
    const emAtraso = overdueOrders.length;
    const pctAtraso = totalPedidos ? (emAtraso / totalPedidos) * 100 : 0;
    return { totalPedidos, totalUnidades, totalVolumes, emAtraso, pctAtraso, overdueOrders };
  }, [orders]);

  const atrasoColor =
    stats.pctAtraso > 30 ? 'bg-gradient-to-br from-[#7F1D1D] to-[#991B1B] border-[#EF4444]/50'
    : stats.pctAtraso >= 15 ? 'bg-gradient-to-br from-[#78350F] to-[#92400E] border-[#F59E0B]/50'
    : 'bg-gradient-to-br from-[#064E3B] to-[#065F46] border-[#10B981]/50';

  const atrasoIconColor =
    stats.pctAtraso > 30 ? 'text-[#FCA5A5]'
    : stats.pctAtraso >= 15 ? 'text-[#FCD34D]'
    : 'text-[#6EE7B7]';

  const cards: Array<{ key: DrillKey; label: string; value: string; icon: typeof Package }> = [
    { key: 'all', label: 'Total Pedidos', value: stats.totalPedidos.toLocaleString('pt-BR'), icon: Package },
    { key: 'units', label: 'Total Unidades', value: stats.totalUnidades.toLocaleString('pt-BR'), icon: Boxes },
    { key: 'volumes', label: 'Total Volumes', value: stats.totalVolumes.toLocaleString('pt-BR'), icon: Truck },
  ];

  const drillData = useMemo(() => {
    if (!drill) return null;
    if (drill === 'overdue') {
      return {
        title: 'Pedidos em Atraso',
        description: `${stats.emAtraso} pedidos com lead > 1 dia útil. Conferência por cliente.`,
        orders: stats.overdueOrders,
        highlightOverdue: true,
      };
    }
    if (drill === 'units') {
      return {
        title: 'Total de Unidades por Cliente',
        description: `${stats.totalUnidades.toLocaleString('pt-BR')} unidades em ${stats.totalPedidos} pedidos.`,
        orders,
        highlightOverdue: false,
      };
    }
    if (drill === 'volumes') {
      return {
        title: 'Total de Volumes por Cliente',
        description: `${stats.totalVolumes.toLocaleString('pt-BR')} volumes em ${stats.totalPedidos} pedidos.`,
        orders,
        highlightOverdue: false,
      };
    }
    return {
      title: 'Todos os Pedidos',
      description: `${stats.totalPedidos.toLocaleString('pt-BR')} pedidos no escopo atual.`,
      orders,
      highlightOverdue: true,
    };
  }, [drill, orders, stats]);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(c => (
          <button
            key={c.label}
            onClick={() => setDrill(c.key)}
            className="group bg-[#1E293B] border border-[#334155] rounded-lg p-3 text-left hover:border-[#3B82F6]/60 hover:bg-[#1E293B]/80 transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-[0.1em] text-[#94A3B8] font-semibold">{c.label}</span>
              <c.icon className="w-3.5 h-3.5 text-[#3B82F6]" />
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-[#F8FAFC] leading-none">{c.value}</div>
              <ChevronRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-[10px] text-[#64748B] mt-1.5 group-hover:text-[#3B82F6]">Clique para detalhar</div>
          </button>
        ))}
        <button
          onClick={() => setDrill('overdue')}
          className={`group border rounded-lg p-3 text-left text-white transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-[#EF4444]/20 ${atrasoColor}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-[0.1em] font-semibold opacity-90">Em Atraso</span>
            <Clock className={`w-3.5 h-3.5 ${atrasoIconColor}`} />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold leading-none">
              {stats.emAtraso.toLocaleString('pt-BR')}
              <span className="text-sm font-semibold opacity-90 ml-1.5">
                ({stats.pctAtraso.toFixed(1).replace('.', ',')}%)
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-[10px] text-white/70 mt-1.5">Clique para conferir clientes</div>
        </button>
      </div>

      {drillData && (
        <WduDetailsModal
          open={drill !== null}
          onOpenChange={(o) => !o && setDrill(null)}
          title={drillData.title}
          description={drillData.description}
          orders={drillData.orders}
          highlightOverdue={drillData.highlightOverdue}
        />
      )}
    </>
  );
}

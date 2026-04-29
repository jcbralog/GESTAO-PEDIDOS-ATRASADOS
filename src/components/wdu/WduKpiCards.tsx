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
    stats.pctAtraso > 30 ? 'bg-gradient-to-br from-[#FEE2E2] to-[#FECACA] border-[#EF4444]/40'
    : stats.pctAtraso >= 15 ? 'bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] border-[#F59E0B]/40'
    : 'bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] border-[#10B981]/40';

  const atrasoTextColor =
    stats.pctAtraso > 30 ? 'text-[#991B1B]'
    : stats.pctAtraso >= 15 ? 'text-[#92400E]'
    : 'text-[#065F46]';

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
            className="group bg-white border border-[#E5E7EB] rounded-lg p-3 text-left hover:border-[#10B981] hover:shadow-md hover:shadow-[#10B981]/10 transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-[0.1em] text-[#64748B] font-semibold">{c.label}</span>
              <c.icon className="w-3.5 h-3.5 text-[#10B981]" />
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-[#0F172A] leading-none">{c.value}</div>
              <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#10B981] group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-[10px] text-[#94A3B8] mt-1.5 group-hover:text-[#10B981]">Clique para detalhar</div>
          </button>
        ))}
        <button
          onClick={() => setDrill('overdue')}
          className={`group border rounded-lg p-3 text-left transition-all hover:scale-[1.01] hover:shadow-md ${atrasoColor} ${atrasoTextColor}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-[0.1em] font-semibold opacity-80">Em Atraso</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold leading-none">
              {stats.emAtraso.toLocaleString('pt-BR')}
              <span className="text-sm font-semibold opacity-80 ml-1.5">
                ({stats.pctAtraso.toFixed(1).replace('.', ',')}%)
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-[10px] opacity-70 mt-1.5">Clique para conferir clientes</div>
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

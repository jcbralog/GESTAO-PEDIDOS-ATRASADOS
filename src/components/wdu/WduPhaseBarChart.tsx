import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3 } from 'lucide-react';
import type { WduOrder, WduPhase } from '@/lib/wduData';
import { WDU_PHASE_ORDER, PHASE_GROUP, GROUP_COLORS } from '@/lib/wduData';
import WduDetailsModal from './WduDetailsModal';

interface Props {
  orders: WduOrder[];
}

export default function WduPhaseBarChart({ orders }: Props) {
  const [drillPhase, setDrillPhase] = useState<WduPhase | null>(null);

  const data = useMemo(() => {
    const counts = new Map<string, number>();
    WDU_PHASE_ORDER.forEach(p => counts.set(p, 0));
    orders.forEach(o => counts.set(o.sitFase, (counts.get(o.sitFase) || 0) + 1));
    return WDU_PHASE_ORDER.map(p => ({
      fase: p,
      pedidos: counts.get(p) || 0,
      color: GROUP_COLORS[PHASE_GROUP[p]],
    }));
  }, [orders]);

  const total = orders.length;
  const maxValue = Math.max(...data.map(d => d.pedidos), 1);

  const drillOrders = useMemo(() => {
    if (!drillPhase) return [];
    return orders.filter(o => o.sitFase === drillPhase);
  }, [orders, drillPhase]);

  return (
    <>
      <div className="bg-white border border-[#10B981]/20 rounded-lg p-3 h-full flex flex-col shadow-sm animate-slide-up">
        <div className="flex items-start justify-between mb-2 flex-wrap gap-2 pb-2 border-b border-[#10B981]/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#064E3B] flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#FBBF24]" />
            </div>
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A]">
                Pedidos por Situação / Fase
              </h2>
              <p className="text-[10px] text-[#64748B]">Clique nas barras para detalhar</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-wider text-[#64748B]">Total</div>
            <div className="text-sm font-bold text-[#059669] font-mono">
              {total.toLocaleString('pt-BR')}
            </div>
            <div className="text-[9px] text-[#94A3B8] font-mono">
              {format(new Date(), "dd/MM HH:mm", { locale: ptBR })}
            </div>
          </div>
        </div>

        {/* Group legend */}
        <div className="flex flex-wrap gap-2 mb-2 text-[10px]">
          {Object.entries(GROUP_COLORS).map(([group, color]) => (
            <div key={group} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-[#475569]">{group}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 min-h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="fase"
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 10 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
                allowDecimals={false}
                domain={[0, Math.ceil(maxValue * 1.15)]}
                width={32}
              />
              <Tooltip
                cursor={{ fill: 'rgba(16,185,129,0.08)' }}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #10B981',
                  borderRadius: 6,
                  color: '#0F172A',
                  fontSize: 11,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => {
                  const pct = total ? ((value / total) * 100).toFixed(1) : '0';
                  return [`${value.toLocaleString('pt-BR')} (${pct}%)`, 'Pedidos'];
                }}
              />
              <Bar
                dataKey="pedidos"
                radius={[3, 3, 0, 0]}
                cursor="pointer"
                onClick={(payload) => {
                  const fase = (payload as unknown as { fase?: string })?.fase
                    ?? (payload as unknown as { payload?: { fase?: string } })?.payload?.fase;
                  if (fase) setDrillPhase(fase as WduPhase);
                }}
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="pedidos"
                  position="top"
                  fill="#0F172A"
                  fontSize={11}
                  fontWeight={700}
                  formatter={(v: number) => (v > 0 ? v.toLocaleString('pt-BR') : '')}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {drillPhase && (
        <WduDetailsModal
          open={drillPhase !== null}
          onOpenChange={(o) => !o && setDrillPhase(null)}
          title={`Pedidos na fase: ${drillPhase}`}
          description={`${drillOrders.length} pedidos • Conferência por cliente`}
          orders={drillOrders}
          highlightOverdue
        />
      )}
    </>
  );
}

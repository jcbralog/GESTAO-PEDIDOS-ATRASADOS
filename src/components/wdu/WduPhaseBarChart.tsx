import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3 } from 'lucide-react';
import type { WduOrder } from '@/lib/wduData';
import { WDU_PHASE_ORDER, PHASE_GROUP, GROUP_COLORS } from '@/lib/wduData';

interface Props {
  orders: WduOrder[];
}

export default function WduPhaseBarChart({ orders }: Props) {
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

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#3B82F6]" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">
              Pedidos por Situação / Fase
            </h2>
            <p className="text-[11px] text-[#94A3B8]">
              Visão operacional para acompanhamento da equipe
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-[#94A3B8]">Total</div>
          <div className="text-lg font-bold text-[#F8FAFC] font-mono">
            {total.toLocaleString('pt-BR')} pedidos
          </div>
          <div className="text-[10px] text-[#64748B] font-mono">
            {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </div>
        </div>
      </div>

      {/* Group legend */}
      <div className="flex flex-wrap gap-3 mb-3 text-[11px]">
        {Object.entries(GROUP_COLORS).map(([group, color]) => (
          <div key={group} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-[#CBD5E1]">{group}</span>
          </div>
        ))}
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="fase"
              tick={{ fill: '#CBD5E1', fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              interval={0}
            />
            <YAxis
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              allowDecimals={false}
              domain={[0, Math.ceil(maxValue * 1.15)]}
            />
            <Tooltip
              cursor={{ fill: 'rgba(59,130,246,0.08)' }}
              contentStyle={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: 6,
                color: '#F8FAFC',
                fontSize: 12,
              }}
              formatter={(value: number) => {
                const pct = total ? ((value / total) * 100).toFixed(1) : '0';
                return [`${value.toLocaleString('pt-BR')} pedidos (${pct}%)`, 'Quantidade'];
              }}
            />
            <Bar dataKey="pedidos" radius={[4, 4, 0, 0]}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
              <LabelList
                dataKey="pedidos"
                position="top"
                fill="#F8FAFC"
                fontSize={12}
                fontWeight={700}
                formatter={(v: number) => (v > 0 ? v.toLocaleString('pt-BR') : '')}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

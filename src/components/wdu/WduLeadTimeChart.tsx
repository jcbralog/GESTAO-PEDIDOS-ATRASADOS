import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, ReferenceLine, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import type { WduOrder } from '@/lib/wduData';
import { WDU_PHASE_ORDER, PHASE_GROUP, GROUP_COLORS, computeMetrics } from '@/lib/wduData';

interface Props { orders: WduOrder[]; }

export default function WduLeadTimeChart({ orders }: Props) {
  const data = useMemo(() => {
    const now = new Date();
    return WDU_PHASE_ORDER.map(phase => {
      const list = orders.filter(o => o.sitFase === phase);
      const metrics = list.map(o => computeMetrics(o, now));
      const leadAvg = metrics.length ? metrics.reduce((s, m) => s + m.leadTime, 0) / metrics.length : 0;
      const atraso = metrics.filter(m => m.emAtraso).length;
      const pctAtraso = list.length ? (atraso / list.length) * 100 : 0;
      return { phase, leadAvg: +leadAvg.toFixed(2), pedidos: list.length, atraso, pctAtraso, group: PHASE_GROUP[phase] };
    }).sort((a, b) => b.leadAvg - a.leadAvg);
  }, [orders]);

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4 h-full flex flex-col">
      <h3 className="text-xs uppercase tracking-[0.1em] text-[#94A3B8] font-semibold mb-3">
        Lead Time Médio por Fase (dias úteis)
      </h3>
      <div className="flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 40, bottom: 8, left: 8 }}>
            <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#94A3B8' }} />
            <YAxis type="category" dataKey="phase" stroke="#94A3B8" width={90} tick={{ fontSize: 11, fill: '#CBD5E1' }} axisLine={false} tickLine={false} />
            <ReferenceLine x={1} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'SLA', fill: '#EF4444', fontSize: 10, position: 'top' }} />
            <Tooltip
              cursor={{ fill: 'rgba(59,130,246,0.08)' }}
              contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 6, fontSize: 12, color: '#F8FAFC' }}
              formatter={(v: number, _n, p) => {
                const item = p.payload;
                return [`${v.toFixed(2).replace('.', ',')} d • ${item.atraso} em atraso (${item.pctAtraso.toFixed(0)}%)`, 'Lead'];
              }}
            />
            <Bar dataKey="leadAvg" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {data.map((d, i) => (
                <Cell key={i} fill={GROUP_COLORS[d.group]} />
              ))}
              <LabelList dataKey="leadAvg" position="right" formatter={(v: number) => `${v.toFixed(1)}d`} style={{ fontSize: 11, fill: '#F8FAFC' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

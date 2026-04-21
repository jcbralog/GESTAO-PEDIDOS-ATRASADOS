import { useMemo } from 'react';
import type { WduOrder, WduPhase } from '@/lib/wduData';
import { WDU_PHASE_ORDER, PHASE_GROUP, GROUP_COLORS, computeMetrics } from '@/lib/wduData';

interface Props {
  orders: WduOrder[];
  selectedPhase: WduPhase | null;
  onSelectPhase: (p: WduPhase | null) => void;
}

export default function WduPhaseTable({ orders, selectedPhase, onSelectPhase }: Props) {
  const rows = useMemo(() => {
    const total = orders.length || 1;
    const now = new Date();
    return WDU_PHASE_ORDER.map(phase => {
      const list = orders.filter(o => o.sitFase === phase);
      const pedidos = list.length;
      const unidades = list.reduce((s, o) => s + (o.qtTot || 0), 0);
      const volumes = list.reduce((s, o) => s + (o.vols || 0), 0);
      const metrics = list.map(o => computeMetrics(o, now));
      const leadAvg = metrics.length ? metrics.reduce((s, m) => s + m.leadTime, 0) / metrics.length : 0;
      const emAtraso = metrics.filter(m => m.emAtraso).length;
      const pct = (pedidos / total) * 100;
      return { phase, pedidos, unidades, volumes, leadAvg, emAtraso, pct, group: PHASE_GROUP[phase] };
    });
  }, [orders]);

  const totals = useMemo(() => ({
    pedidos: rows.reduce((s, r) => s + r.pedidos, 0),
    unidades: rows.reduce((s, r) => s + r.unidades, 0),
    volumes: rows.reduce((s, r) => s + r.volumes, 0),
    emAtraso: rows.reduce((s, r) => s + r.emAtraso, 0),
  }), [rows]);

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#334155] flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.1em] text-[#94A3B8] font-semibold">Funil por Situação / Fase</h3>
        {selectedPhase && (
          <button
            onClick={() => onSelectPhase(null)}
            className="text-[11px] text-[#3B82F6] hover:underline"
          >
            Limpar seleção ({selectedPhase})
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] text-[#CBD5E1]">
          <thead>
            <tr className="text-left text-[11px] uppercase text-[#94A3B8] border-b border-[#334155]">
              <th className="px-4 py-2 font-medium">Fase</th>
              <th className="px-3 py-2 font-medium text-right">Pedidos</th>
              <th className="px-3 py-2 font-medium text-right">Unidades</th>
              <th className="px-3 py-2 font-medium text-right">Volumes</th>
              <th className="px-3 py-2 font-medium text-right">Lead Médio</th>
              <th className="px-3 py-2 font-medium text-right">Em Atraso</th>
              <th className="px-4 py-2 font-medium w-[180px]">Progresso</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const isSelected = selectedPhase === r.phase;
              return (
                <tr
                  key={r.phase}
                  className={`border-b border-[#334155]/50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#3B82F6]/10' : 'hover:bg-[#334155]/30'
                  }`}
                  onClick={() => onSelectPhase(isSelected ? null : r.phase)}
                >
                  <td className="px-4 py-2">
                    <span
                      className="inline-block px-2.5 py-1 rounded text-[11px] font-semibold text-white"
                      style={{ backgroundColor: GROUP_COLORS[r.group] }}
                    >
                      {r.phase}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.pedidos.toLocaleString('pt-BR')}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.unidades.toLocaleString('pt-BR')}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.volumes.toLocaleString('pt-BR')}</td>
                  <td className={`px-3 py-2 text-right tabular-nums font-semibold ${r.leadAvg > 1 ? 'text-[#EF4444]' : 'text-[#CBD5E1]'}`}>
                    {r.leadAvg.toFixed(2).replace('.', ',')} d
                  </td>
                  <td className="px-3 py-2 text-right">
                    {r.emAtraso > 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EF4444] text-white">
                        {r.emAtraso}
                      </span>
                    ) : (
                      <span className="text-[#64748B]">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${r.pct}%`, backgroundColor: GROUP_COLORS[r.group] }}
                        />
                      </div>
                      <span className="text-[11px] text-[#94A3B8] w-10 text-right tabular-nums">
                        {r.pct.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[#0F172A] text-[#F8FAFC] font-semibold">
              <td className="px-4 py-2.5 text-[11px] uppercase tracking-wider">Totais</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{totals.pedidos.toLocaleString('pt-BR')}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{totals.unidades.toLocaleString('pt-BR')}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{totals.volumes.toLocaleString('pt-BR')}</td>
              <td className="px-3 py-2.5 text-right">—</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-[#EF4444]">{totals.emAtraso}</td>
              <td className="px-4 py-2.5 text-right text-[#94A3B8] text-[11px]">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

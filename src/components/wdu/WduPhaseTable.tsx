import { useMemo, useState } from 'react';
import type { WduOrder, WduPhase } from '@/lib/wduData';
import { WDU_PHASE_ORDER, PHASE_GROUP, GROUP_COLORS, computeMetrics } from '@/lib/wduData';
import WduDetailsModal from './WduDetailsModal';

interface Props {
  orders: WduOrder[];
  selectedPhase: WduPhase | null;
  onSelectPhase: (p: WduPhase | null) => void;
}

export default function WduPhaseTable({ orders, selectedPhase, onSelectPhase }: Props) {
  const [drillPhase, setDrillPhase] = useState<WduPhase | null>(null);

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
      return { phase, pedidos, unidades, volumes, leadAvg, emAtraso, pct, group: PHASE_GROUP[phase], list };
    });
  }, [orders]);

  const totals = useMemo(() => ({
    pedidos: rows.reduce((s, r) => s + r.pedidos, 0),
    unidades: rows.reduce((s, r) => s + r.unidades, 0),
    volumes: rows.reduce((s, r) => s + r.volumes, 0),
    emAtraso: rows.reduce((s, r) => s + r.emAtraso, 0),
  }), [rows]);

  const drillRow = drillPhase ? rows.find(r => r.phase === drillPhase) : null;

  return (
    <>
      <div className="bg-white border border-[#10B981]/20 rounded-lg overflow-hidden h-full flex flex-col shadow-sm animate-slide-up">
        <div className="px-3 py-2 border-b border-[#10B981]/20 bg-[#064E3B] flex items-center justify-between">
          <h3 className="text-[11px] uppercase tracking-[0.1em] text-[#F0FDF4] font-semibold">Funil por Situação / Fase</h3>
          {selectedPhase && (
            <button
              onClick={() => onSelectPhase(null)}
              className="text-[10px] text-[#FBBF24] hover:underline font-semibold"
            >
              Limpar ({selectedPhase})
            </button>
          )}
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-[12px] text-[#334155]">
            <thead className="bg-[#0A2F22]">
              <tr className="text-left text-[10px] uppercase text-[#6EE7B7] border-b border-[#10B981]/20">
                <th className="px-3 py-2 font-medium">Fase</th>
                <th className="px-2 py-2 font-medium text-right">Ped.</th>
                <th className="px-2 py-2 font-medium text-right">Lead</th>
                <th className="px-2 py-2 font-medium text-right">Atraso</th>
                <th className="px-3 py-2 font-medium w-[110px]">%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => {
                const isSelected = selectedPhase === r.phase;
                return (
                  <tr
                    key={r.phase}
                    className={`border-b border-[#10B981]/10 transition-colors animate-fade-in ${
                      isSelected ? 'bg-[#D1FAE5]/50' : 'hover:bg-[#F0FDF4]'
                    }`}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectPhase(isSelected ? null : r.phase)}
                          className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-white hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: GROUP_COLORS[r.group] }}
                          title="Filtrar por esta fase"
                        >
                          {r.phase}
                        </button>
                        <button
                          onClick={() => setDrillPhase(r.phase)}
                          className="text-[10px] text-[#94A3B8] hover:text-[#10B981]"
                          title="Ver pedidos / clientes"
                        >
                          ↗
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      <button
                        onClick={() => setDrillPhase(r.phase)}
                        className="hover:text-[#10B981] hover:underline font-semibold"
                      >
                        {r.pedidos.toLocaleString('pt-BR')}
                      </button>
                    </td>
                    <td className={`px-2 py-1.5 text-right tabular-nums font-semibold ${r.leadAvg > 1 ? 'text-[#DC2626]' : 'text-[#334155]'}`}>
                      {r.leadAvg.toFixed(1).replace('.', ',')}d
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {r.emAtraso > 0 ? (
                        <button
                          onClick={() => setDrillPhase(r.phase)}
                          className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors"
                        >
                          {r.emAtraso}
                        </button>
                      ) : (
                        <span className="text-[#94A3B8]">0</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${r.pct}%`, backgroundColor: GROUP_COLORS[r.group] }}
                          />
                        </div>
                        <span className="text-[10px] text-[#64748B] w-9 text-right tabular-nums">
                          {r.pct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#10B981] text-white font-semibold">
                <td className="px-3 py-2 text-[10px] uppercase tracking-wider">Totais</td>
                <td className="px-2 py-2 text-right tabular-nums text-[12px]">{totals.pedidos.toLocaleString('pt-BR')}</td>
                <td className="px-2 py-2 text-right text-white/70">—</td>
                <td className="px-2 py-2 text-right tabular-nums text-[12px]">{totals.emAtraso}</td>
                <td className="px-3 py-2 text-right text-white/80 text-[10px]">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {drillRow && (
        <WduDetailsModal
          open={drillPhase !== null}
          onOpenChange={(o) => !o && setDrillPhase(null)}
          title={`Fase: ${drillRow.phase}`}
          description={`${drillRow.pedidos} pedidos • ${drillRow.unidades.toLocaleString('pt-BR')} unidades • ${drillRow.volumes.toLocaleString('pt-BR')} volumes • ${drillRow.emAtraso} em atraso`}
          orders={drillRow.list}
          highlightOverdue
        />
      )}
    </>
  );
}

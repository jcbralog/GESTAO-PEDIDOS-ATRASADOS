import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download } from 'lucide-react';
import type { WduOrder } from '@/lib/wduData';
import { computeMetrics } from '@/lib/wduData';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  orders: WduOrder[];
  highlightOverdue?: boolean;
}

export default function WduDetailsModal({ open, onOpenChange, title, description, orders, highlightOverdue }: Props) {
  const now = new Date();

  const grouped = useMemo(() => {
    const byClient = new Map<string, { pedidos: WduOrder[]; unidades: number; volumes: number; emAtraso: number }>();
    for (const o of orders) {
      const cur = byClient.get(o.cliente) || { pedidos: [], unidades: 0, volumes: 0, emAtraso: 0 };
      cur.pedidos.push(o);
      cur.unidades += o.qtTot || 0;
      cur.volumes += o.vols || 0;
      if (computeMetrics(o, now).emAtraso) cur.emAtraso += 1;
      byClient.set(o.cliente, cur);
    }
    return Array.from(byClient.entries())
      .map(([cliente, v]) => ({ cliente, ...v, total: v.pedidos.length }))
      .sort((a, b) => b.total - a.total);
  }, [orders, now]);

  const totals = useMemo(() => ({
    pedidos: orders.length,
    unidades: orders.reduce((s, o) => s + (o.qtTot || 0), 0),
    volumes: orders.reduce((s, o) => s + (o.vols || 0), 0),
    emAtraso: orders.filter(o => computeMetrics(o, now).emAtraso).length,
  }), [orders, now]);

  const exportCSV = () => {
    const brandHeader = '# Bralog — Gestão de Pedidos Atrasados | Logística Avançada';
    const brandLine = `# Exportado em: ${format(now, "dd/MM/yyyy HH:mm", { locale: ptBR })}`;
    const header = ['No. D.P.', 'Cliente', 'Sit. Fase', 'Unidades', 'Volumes', 'Lead (d)', 'Em Atraso', 'Dt. Incl. SLA', 'Transportadora'];
    const rows = orders.map(o => {
      const m = computeMetrics(o, now);
      return [
        o.noDP, o.cliente, o.sitFase, o.qtTot, o.vols || 0,
        m.leadTime.toFixed(2).replace('.', ','), m.emAtraso ? 'SIM' : 'NÃO',
        format(new Date(o.dtIncSLA), 'dd/MM/yyyy HH:mm'), o.transportadora || '',
      ];
    });
    const csv = [brandHeader, brandLine, '', header, ...rows].map(r => r.map ? r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';') : r).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bralog-pedidos-${format(now, 'yyyyMMdd-HHmm')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col bg-[#0A2F22] border-[#10B981]/40 text-[#F0FDF4]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-[#F0FDF4]">{title}</DialogTitle>
              {description && <DialogDescription className="text-[#6EE7B7]">{description}</DialogDescription>}
            </div>
            <button
              onClick={exportCSV}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0A2F22] text-xs font-semibold transition-colors mr-6"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
          </div>
        </DialogHeader>

        {/* Summary strip */}
        <div className="grid grid-cols-4 gap-2 py-2 border-y border-[#10B981]/30 bg-[#064E3B] rounded">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-[#6EE7B7]">Pedidos</div>
            <div className="text-lg font-bold tabular-nums text-[#F0FDF4]">{totals.pedidos.toLocaleString('pt-BR')}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-[#6EE7B7]">Unidades</div>
            <div className="text-lg font-bold tabular-nums text-[#F0FDF4]">{totals.unidades.toLocaleString('pt-BR')}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-[#6EE7B7]">Volumes</div>
            <div className="text-lg font-bold tabular-nums text-[#F0FDF4]">{totals.volumes.toLocaleString('pt-BR')}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-[#6EE7B7]">Em Atraso</div>
            <div className="text-lg font-bold tabular-nums text-[#FCA5A5]">{totals.emAtraso.toLocaleString('pt-BR')}</div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          {/* Per-client summary */}
          <div className="mb-4">
            <h4 className="text-[11px] uppercase tracking-wider text-[#6EE7B7] font-semibold mb-2">Resumo por Cliente</h4>
            <div className="overflow-x-auto rounded border border-[#10B981]/30">
              <table className="w-full text-[12px]">
                <thead className="bg-[#064E3B] text-[#6EE7B7] text-[10px] uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Cliente</th>
                    <th className="px-3 py-2 text-right font-medium">Pedidos</th>
                    <th className="px-3 py-2 text-right font-medium">Unidades</th>
                    <th className="px-3 py-2 text-right font-medium">Volumes</th>
                    {highlightOverdue && <th className="px-3 py-2 text-right font-medium">Atrasados</th>}
                  </tr>
                </thead>
                <tbody>
                  {grouped.map(g => (
                    <tr key={g.cliente} className="border-t border-[#10B981]/10 hover:bg-[#064E3B]">
                      <td className="px-3 py-1.5 truncate max-w-[280px] text-[#D1FAE5]">{g.cliente}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums font-semibold text-[#10B981]">{g.total}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-[#D1FAE5]">{g.unidades.toLocaleString('pt-BR')}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-[#D1FAE5]">{g.volumes.toLocaleString('pt-BR')}</td>
                      {highlightOverdue && (
                        <td className="px-3 py-1.5 text-right tabular-nums">
                          {g.emAtraso > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-[#EF4444] text-white font-semibold text-[10px]">
                              {g.emAtraso}
                            </span>
                          ) : <span className="text-[#94A3B8]">0</span>}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed orders */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider text-[#6EE7B7] font-semibold mb-2">
              Pedidos ({orders.length.toLocaleString('pt-BR')})
            </h4>
            <div className="overflow-x-auto rounded border border-[#10B981]/30">
              <table className="w-full text-[12px]">
                <thead className="bg-[#064E3B] text-[#6EE7B7] text-[10px] uppercase sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">No. D.P.</th>
                    <th className="px-3 py-2 text-left font-medium">Cliente</th>
                    <th className="px-3 py-2 text-left font-medium">Fase</th>
                    <th className="px-3 py-2 text-right font-medium">Unid.</th>
                    <th className="px-3 py-2 text-right font-medium">Vols.</th>
                    <th className="px-3 py-2 text-right font-medium">Lead</th>
                    <th className="px-3 py-2 text-left font-medium">Inclusão SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const m = computeMetrics(o, now);
                    return (
                      <tr key={o.noDP} className={`border-t border-[#10B981]/10 ${m.emAtraso ? 'bg-[#7F1D1D]/40' : 'hover:bg-[#064E3B]'}`}>
                        <td className="px-3 py-1.5 font-mono text-[#F0FDF4]">{o.noDP}</td>
                        <td className="px-3 py-1.5 truncate max-w-[240px] text-[#D1FAE5]">{o.cliente}</td>
                        <td className="px-3 py-1.5 text-[#D1FAE5]">{o.sitFase}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-[#D1FAE5]">{o.qtTot.toLocaleString('pt-BR')}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-[#D1FAE5]">{o.vols ?? '—'}</td>
                        <td className={`px-3 py-1.5 text-right tabular-nums font-semibold ${m.emAtraso ? 'text-[#FCA5A5]' : 'text-[#D1FAE5]'}`}>
                          {m.leadTime.toFixed(1).replace('.', ',')}d
                        </td>
                        <td className="px-3 py-1.5 text-[#6EE7B7]">
                          {format(new Date(o.dtIncSLA), 'dd/MM/yy HH:mm', { locale: ptBR })}
                        </td>
                      </tr>
                    );
                  })}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-[#6EE7B7]">Nenhum pedido encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

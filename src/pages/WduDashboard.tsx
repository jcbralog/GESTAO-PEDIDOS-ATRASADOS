import { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import WduKpiCards from '@/components/wdu/WduKpiCards';
import WduPhaseTable from '@/components/wdu/WduPhaseTable';
import WduLeadTimeChart from '@/components/wdu/WduLeadTimeChart';
import WduTopOverdue from '@/components/wdu/WduTopOverdue';
import WduGauge from '@/components/wdu/WduGauge';
import WduFilters, { type SlaFilter } from '@/components/wdu/WduFilters';
import WduExport from '@/components/wdu/WduExport';
import WduUploadButton from '@/components/wdu/WduUploadButton';
import WduPhaseBarChart from '@/components/wdu/WduPhaseBarChart';
import { generateExtendedMock, computeMetrics, WDU_PHASE_ORDER, type WduOrder, type WduPhase } from '@/lib/wduData';

export default function WduDashboard() {
  const [orders, setOrders] = useState<WduOrder[]>(() => generateExtendedMock());
  const [isMock, setIsMock] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());
  const [fileName, setFileName] = useState('Dados de exemplo');

  // Filters
  const [selectedPhases, setSelectedPhases] = useState<Set<WduPhase>>(() => new Set(WDU_PHASE_ORDER));
  const [selectedPhaseDrill, setSelectedPhaseDrill] = useState<WduPhase | null>(null);
  const [selectedClientes, setSelectedClientes] = useState<Set<string>>(() => new Set());
  const [transportadora, setTransportadora] = useState('all');
  const [slaFilter, setSlaFilter] = useState<SlaFilter>('all');

  // Live clock for "agora"
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const printRef = useRef<HTMLDivElement>(null);

  const handleLoaded = (parsed: WduOrder[], name: string) => {
    setOrders(parsed);
    setIsMock(false);
    setFileName(name);
    setUpdatedAt(new Date());
    setSelectedPhases(new Set(WDU_PHASE_ORDER));
    setSelectedPhaseDrill(null);
    setSelectedClientes(new Set());
    setTransportadora('all');
    setSlaFilter('all');
  };

  const filtered = useMemo(() => {
    const now = new Date();
    const hasClienteFilter = selectedClientes.size > 0;
    return orders.filter(o => {
      if (selectedPhaseDrill && o.sitFase !== selectedPhaseDrill) return false;
      if (!selectedPhases.has(o.sitFase)) return false;
      if (hasClienteFilter && !selectedClientes.has(o.cliente)) return false;
      if (transportadora !== 'all' && o.transportadora !== transportadora) return false;
      if (slaFilter !== 'all') {
        const m = computeMetrics(o, now);
        if (slaFilter === 'overdue' && !m.emAtraso) return false;
        if (slaFilter === 'on_time' && m.emAtraso) return false;
      }
      return true;
    });
  }, [orders, selectedPhases, selectedPhaseDrill, selectedClientes, transportadora, slaFilter]);

  const resetFilters = () => {
    setSelectedPhases(new Set(WDU_PHASE_ORDER));
    setSelectedPhaseDrill(null);
    setSelectedClientes(new Set());
    setTransportadora('all');
    setSlaFilter('all');
  };

  return (
    <div className="min-h-screen bg-[#0A2F22] text-[#F0FDF4] font-body">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#064E3B]/95 backdrop-blur border-b-2 border-[#10B981]/50 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/Bralog_Logo.png" alt="Bralog" className="h-9 w-auto shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight truncate text-white">GESTÃO DE PEDIDOS ATRASADOS</h1>
              <p className="text-[11px] text-[#6EE7B7] leading-tight">
                Bralog Logística Ltda – ES
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-[#6EE7B7]">
              <span className="text-[#F0FDF4]">{fileName}</span> • Atualizado em:{' '}
              <span className="font-mono text-[#F0FDF4]">{format(updatedAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
            </span>
            <WduUploadButton onLoaded={handleLoaded} />
            <WduExport orders={filtered} printRef={printRef} />
          </div>
        </div>
      </header>

      <main ref={printRef} className="p-4 space-y-4 max-w-[1600px] mx-auto">
        {/* KPI Cards */}
        <WduKpiCards orders={filtered} />

        {/* Filters */}
        <WduFilters
          orders={orders}
          selectedPhases={selectedPhases}
          onPhasesChange={setSelectedPhases}
          selectedClientes={selectedClientes}
          onClientesChange={setSelectedClientes}
          transportadora={transportadora}
          onTransportadoraChange={setTransportadora}
          slaFilter={slaFilter}
          onSlaChange={setSlaFilter}
          onReset={resetFilters}
        />

        {/* Phase analysis: funnel table + bar chart side-by-side */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-2">
            <WduPhaseTable
              orders={filtered}
              selectedPhase={selectedPhaseDrill}
              onSelectPhase={setSelectedPhaseDrill}
            />
          </div>
          <div className="xl:col-span-3">
            <WduPhaseBarChart orders={filtered} />
          </div>
        </div>

        {/* Lead time + health row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <WduLeadTimeChart orders={filtered} />
          </div>
          <WduGauge orders={filtered} />
          <WduTopOverdue orders={filtered} />
        </div>

        <footer className="text-center text-[10px] text-[#6EE7B7] pt-4 pb-2">
          {filtered.length.toLocaleString('pt-BR')} pedidos exibidos • Lead time considera dias úteis (seg–sex), excluindo feriados nacionais, ES e Vitória/ES.
        </footer>
      </main>
    </div>
  );
}

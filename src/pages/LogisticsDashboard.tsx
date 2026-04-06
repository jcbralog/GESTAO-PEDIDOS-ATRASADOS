import { useState, useMemo, useEffect } from 'react';
import { generateDemoOrders, type Order } from '@/lib/logisticsData';
import LogisticsFilters from '@/components/logistics/LogisticsFilters';
import LogisticsKPIs from '@/components/logistics/LogisticsKPIs';
import PhaseChart from '@/components/logistics/PhaseChart';
import DailyVolumeChart from '@/components/logistics/DailyVolumeChart';
import CarrierPerformanceChart from '@/components/logistics/CarrierPerformanceChart';
import ClientDistributionChart from '@/components/logistics/ClientDistributionChart';
import RecentOrdersTable from '@/components/logistics/RecentOrdersTable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function LogisticsDashboard() {
  const [allOrders] = useState<Order[]>(() => generateDemoOrders(500));
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedCarrier, setSelectedCarrier] = useState('all');
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return allOrders.filter(o => {
      if (dateRange.from && o.date < dateRange.from.toISOString().slice(0, 10)) return false;
      if (dateRange.to && o.date > dateRange.to.toISOString().slice(0, 10)) return false;
      if (selectedClient !== 'all' && o.client !== selectedClient) return false;
      if (selectedCarrier !== 'all' && o.carrier !== selectedCarrier) return false;
      return true;
    });
  }, [allOrders, dateRange, selectedClient, selectedCarrier]);

  const resetFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setSelectedClient('all');
    setSelectedCarrier('all');
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <div className="h-12 shrink-0 bg-[hsl(var(--topbar-bg))] border-b border-border flex items-center justify-between px-4">
        <h1 className="text-sm font-bold text-foreground tracking-wide font-['Barlow_Condensed'] uppercase">
          Painel Logístico — Visão Analítica
        </h1>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{filtered.length} pedidos filtrados</span>
          <span>{format(clock, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="shrink-0 px-4 py-2 border-b border-border bg-[hsl(var(--topbar-bg))]">
        <LogisticsFilters
          orders={allOrders}
          dateRange={dateRange}
          selectedClient={selectedClient}
          selectedCarrier={selectedCarrier}
          onDateChange={setDateRange}
          onClientChange={setSelectedClient}
          onCarrierChange={setSelectedCarrier}
          onReset={resetFilters}
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col gap-3 min-h-0 overflow-hidden">
        {/* KPIs */}
        <LogisticsKPIs orders={filtered} />

        {/* Charts row 1 */}
        <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
          <PhaseChart orders={filtered} />
          <DailyVolumeChart orders={filtered} />
        </div>

        {/* Charts row 2 + table */}
        <div className="flex-1 grid grid-cols-3 gap-3 min-h-0">
          <CarrierPerformanceChart orders={filtered} />
          <ClientDistributionChart orders={filtered} />
          <RecentOrdersTable orders={filtered} />
        </div>
      </div>
    </div>
  );
}

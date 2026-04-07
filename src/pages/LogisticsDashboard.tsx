import { useState, useMemo, useEffect, useCallback } from 'react';
import { generateDemoOrders, parseExcelToOrders, type Order } from '@/lib/logisticsData';
import LogisticsFilters from '@/components/logistics/LogisticsFilters';
import LogisticsKPIs from '@/components/logistics/LogisticsKPIs';
import PhaseChart from '@/components/logistics/PhaseChart';
import DailyVolumeChart from '@/components/logistics/DailyVolumeChart';
import CarrierPerformanceChart from '@/components/logistics/CarrierPerformanceChart';
import ConfSepChart from '@/components/logistics/ConfSepChart';
import RecentOrdersTable from '@/components/logistics/RecentOrdersTable';
import LogisticsUpload from '@/components/logistics/LogisticsUpload';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Upload, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImportRecord {
  fileName: string;
  timestamp: Date;
  rowCount: number;
}

export default function LogisticsDashboard() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [showUpload, setShowUpload] = useState(true);
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedCarrier, setSelectedCarrier] = useState('all');
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleDataLoaded = useCallback((rows: Record<string, unknown>[], fileName: string) => {
    let parsed: Order[];
    if (fileName === '__demo__') {
      parsed = generateDemoOrders(500);
    } else {
      parsed = parseExcelToOrders(rows);
    }
    setOrders(parsed);
    setImports(prev => [...prev, { fileName, timestamp: new Date(), rowCount: parsed.length }]);
    setShowUpload(false);
  }, []);

  const filtered = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => {
      if (dateRange.from && o.date < dateRange.from.toISOString().slice(0, 10)) return false;
      if (dateRange.to && o.date > dateRange.to.toISOString().slice(0, 10)) return false;
      if (selectedClient !== 'all' && o.client !== selectedClient) return false;
      if (selectedCarrier !== 'all' && o.carrier !== selectedCarrier) return false;
      return true;
    });
  }, [orders, dateRange, selectedClient, selectedCarrier]);

  const resetFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setSelectedClient('all');
    setSelectedCarrier('all');
  };

  const todayImports = imports.filter(imp => {
    const today = new Date().toISOString().slice(0, 10);
    return imp.timestamp.toISOString().slice(0, 10) === today;
  });

  const lastImport = imports.length > 0 ? imports[imports.length - 1] : null;

  if (showUpload || !orders) {
    return (
      <LogisticsUpload
        onDataLoaded={handleDataLoaded}
        hasData={!!orders}
        importCount={todayImports.length}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <div className="h-12 shrink-0 bg-[hsl(var(--topbar-bg))] border-b border-border flex items-center justify-between px-4">
        <h1 className="text-sm font-bold text-foreground tracking-wide font-['Barlow_Condensed'] uppercase">
          Painel Logístico — Visão Analítica
        </h1>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {lastImport && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">
              {lastImport.fileName !== '__demo__' ? lastImport.fileName : 'Demo'} • {lastImport.rowCount} registros
            </span>
          )}
          <span className="text-[10px] bg-card px-2 py-0.5 rounded border border-border">
            Importação {todayImports.length}/5 do dia
          </span>
          {lastImport && (
            <span className="text-[10px]">
              Atualizado: {format(lastImport.timestamp, "HH:mm", { locale: ptBR })}
            </span>
          )}
          <span>{filtered.length} pedidos</span>
          <span>{format(clock, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] gap-1 border-border"
            onClick={() => setShowUpload(true)}
          >
            <Upload className="w-3 h-3" />
            Importar Planilha
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="shrink-0 px-4 py-2 border-b border-border bg-[hsl(var(--topbar-bg))]">
        <LogisticsFilters
          orders={orders}
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
      <div className="flex-1 p-3 flex flex-col gap-2 min-h-0 overflow-hidden">
        {/* KPIs */}
        <LogisticsKPIs orders={filtered} />

        {/* Charts row 1 — Phase + Conf Sep (DESTAQUE) */}
        <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
          <PhaseChart orders={filtered} />
          <ConfSepChart orders={filtered} />
        </div>

        {/* Charts row 2 + table */}
        <div className="flex-1 grid grid-cols-3 gap-2 min-h-0">
          <CarrierPerformanceChart orders={filtered} />
          <DailyVolumeChart orders={filtered} />
          <RecentOrdersTable orders={filtered} />
        </div>
      </div>
    </div>
  );
}

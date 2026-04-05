import { useMemo } from 'react';
import { analyzeData } from '@/lib/dataAnalyzer';
import TopBar from './TopBar';
import KPICards from './KPICards';
import MainChart from './MainChart';
import SecondaryChart from './SecondaryChart';
import StatusTable from './StatusTable';

interface Props {
  rows: Record<string, unknown>[];
  fileName: string;
  lastUpdate: Date;
  onRefresh: () => void;
}

export default function Dashboard({ rows, fileName, lastUpdate, onRefresh }: Props) {
  const analysis = useMemo(() => analyzeData(rows), [rows]);

  const statusColumn = useMemo(() =>
    analysis.columns.find(c => c.role === 'status')?.name, [analysis.columns]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <TopBar
        fileName={fileName}
        shiftLabel={analysis.shiftLabel}
        lastUpdate={lastUpdate}
        onRefresh={onRefresh}
      />

      <div className="flex-1 p-4 flex flex-col gap-3 min-h-0">
        {/* KPI Row */}
        <KPICards kpis={analysis.kpis} />

        {/* Charts Row */}
        <div className="flex-1 grid grid-cols-5 gap-3 min-h-0">
          <div className="col-span-3">
            <MainChart
              data={analysis.mainChartData}
              type={analysis.mainChartType}
              label={analysis.mainChartLabel}
            />
          </div>
          <div className="col-span-2">
            <SecondaryChart
              data={analysis.secondaryChartData}
              type={analysis.secondaryChartType}
              label={analysis.secondaryChartLabel}
            />
          </div>
        </div>

        {/* Status Table */}
        <div className="h-[280px] shrink-0">
          <StatusTable
            columns={analysis.tableColumns}
            rows={analysis.tableRows}
            statusColumn={statusColumn}
          />
        </div>
      </div>
    </div>
  );
}

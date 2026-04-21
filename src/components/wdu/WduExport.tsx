import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { WduOrder } from '@/lib/wduData';
import { computeMetrics } from '@/lib/wduData';

interface Props {
  orders: WduOrder[];
  printRef: React.RefObject<HTMLDivElement>;
}

export default function WduExport({ orders, printRef }: Props) {
  const [busy, setBusy] = useState(false);

  const exportXlsx = () => {
    const now = new Date();
    const rows = orders.map(o => {
      const m = computeMetrics(o, now);
      return {
        'No. D.P.': o.noDP,
        'Cliente': o.cliente,
        'Sit. Fase': o.sitFase,
        'Qt. Tot.': o.qtTot,
        'Vols.': o.vols ?? '',
        'Dt. Incl. SLA': o.dtIncSLA,
        'Dt. Conf. Sep.': o.dtConfSep ?? '',
        'Transportadora': o.transportadora ?? '',
        'Lead Time (dias úteis)': m.leadTime,
        'Em Atraso': m.emAtraso ? 'S' : 'N',
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'WDU');
    XLSX.writeFile(wb, `painel-wdu-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPdf = async () => {
    if (!printRef.current) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(printRef.current, { backgroundColor: '#0F172A', scale: 1.4 });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pw / canvas.width, ph / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      pdf.addImage(img, 'PNG', (pw - w) / 2, (ph - h) / 2, w, h);
      pdf.save(`painel-wdu-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" disabled={busy} className="h-9 bg-[#3B82F6] hover:bg-[#2563EB] text-white">
          <Download className="w-4 h-4 mr-1.5" />
          {busy ? 'Gerando...' : 'Exportar'}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#1E293B] border-[#334155] text-[#CBD5E1]">
        <DropdownMenuItem onClick={exportXlsx} className="cursor-pointer focus:bg-[#334155]">
          <FileSpreadsheet className="w-4 h-4 mr-2 text-[#10B981]" />
          Exportar Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPdf} className="cursor-pointer focus:bg-[#334155]">
          <FileText className="w-4 h-4 mr-2 text-[#EF4444]" />
          Exportar PDF (A4)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

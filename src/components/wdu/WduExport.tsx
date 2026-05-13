import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import type { WduOrder } from '@/lib/wduData';
import { computeMetrics } from '@/lib/wduData';

interface Props {
  orders: WduOrder[];
  printRef: React.RefObject<HTMLDivElement>;
}

const BRAND_GREEN = '064E3B';
const BRAND_GREEN_LIGHT = '10B981';
const BRAND_GREEN_BG = 'F0FDF4';
const BRAND_YELLOW = 'FBBF24';
const BRAND_WHITE = 'FFFFFF';
const BRAND_TEXT_DARK = '0F172A';
const BRAND_TEXT_GRAY = '64748B';

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function WduExport({ orders, printRef }: Props) {
  const [busy, setBusy] = useState(false);

  const exportXlsx = async () => {
    setBusy(true);
    try {
      const now = new Date();
      const wb = new ExcelJS.Workbook();
      wb.creator = 'Bralog';
      wb.title = 'Gestão de Pedidos Atrasados';

      const ws = wb.addWorksheet('Gestão de Pedidos Atrasados', {
        views: [{ state: 'frozen', ySplit: 5 }],
      });

      // Column definitions
      const columns: { header: string; key: string; width: number }[] = [
        { header: 'No. D.P.', key: 'noDP', width: 14 },
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Sit. Fase', key: 'sitFase', width: 14 },
        { header: 'Qt. Tot.', key: 'qtTot', width: 12 },
        { header: 'Vols.', key: 'vols', width: 10 },
        { header: 'Lead Time (d)', key: 'leadTime', width: 16 },
        { header: 'Em Atraso', key: 'emAtraso', width: 14 },
        { header: 'Dt. Incl. SLA', key: 'dtIncSLA', width: 20 },
        { header: 'Dt. Conf. Sep.', key: 'dtConfSep', width: 20 },
        { header: 'Transportadora', key: 'transportadora', width: 22 },
      ];

      ws.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width }));

      // --- ROW 1: Brand header ---
      const row1 = ws.getRow(1);
      row1.height = 36;
      ws.mergeCells(1, 1, 1, 10);
      const cell1 = row1.getCell(1);
      cell1.value = 'BRALOG — GESTÃO DE PEDIDOS ATRASADOS';
      cell1.font = { name: 'Calibri', size: 16, bold: true, color: { argb: BRAND_WHITE } };
      cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_GREEN } };
      cell1.alignment = { horizontal: 'center', vertical: 'middle' };

      // --- ROW 2: Subtitle ---
      const row2 = ws.getRow(2);
      row2.height = 20;
      ws.mergeCells(2, 1, 2, 10);
      const cell2 = row2.getCell(1);
      cell2.value = 'Logística Avançada | Bralog Logística Ltda – ES';
      cell2.font = { name: 'Calibri', size: 10, color: { argb: BRAND_TEXT_GRAY } };
      cell2.alignment = { horizontal: 'center', vertical: 'middle' };

      // --- ROW 3: Export date ---
      const row3 = ws.getRow(3);
      row3.height = 18;
      ws.mergeCells(3, 1, 3, 10);
      const cell3 = row3.getCell(1);
      cell3.value = `Exportado em: ${formatDate(now)}`;
      cell3.font = { name: 'Calibri', size: 9, italic: true, color: { argb: BRAND_TEXT_GRAY } };
      cell3.alignment = { horizontal: 'center', vertical: 'middle' };

      // --- ROW 4: Empty spacer ---
      ws.getRow(4).height = 6;

      // --- ROW 5: Table headers ---
      const headerRow = ws.getRow(5);
      headerRow.height = 22;
      columns.forEach((col, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = col.header;
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BRAND_WHITE } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_GREEN } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: BRAND_GREEN_LIGHT } },
          bottom: { style: 'thin', color: { argb: BRAND_GREEN_LIGHT } },
          left: { style: 'thin', color: { argb: BRAND_GREEN_LIGHT } },
          right: { style: 'thin', color: { argb: BRAND_GREEN_LIGHT } },
        };
      });

      // --- DATA ROWS ---
      const dataRows = orders.map((o, idx) => {
        const m = computeMetrics(o, now);
        return {
          noDP: o.noDP,
          cliente: o.cliente,
          sitFase: o.sitFase,
          qtTot: o.qtTot,
          vols: o.vols ?? '',
          leadTime: m.leadTime.toFixed(2).replace('.', ','),
          emAtraso: m.emAtraso ? 'SIM' : 'NÃO',
          dtIncSLA: formatDate(new Date(o.dtIncSLA)),
          dtConfSep: o.dtConfSep ? formatDate(new Date(o.dtConfSep)) : '—',
          transportadora: o.transportadora ?? '',
          _emAtraso: m.emAtraso,
        };
      });

      dataRows.forEach((rowData, idx) => {
        const rowNum = idx + 6;
        const row = ws.getRow(rowNum);
        row.height = 20;
        const isOdd = idx % 2 === 0;
        const bgColor = isOdd ? BRAND_WHITE : BRAND_GREEN_BG;

        columns.forEach((col, ci) => {
          const cell = row.getCell(ci + 1);
          const val = rowData[col.key as keyof typeof rowData];
          cell.value = val ?? '';
          cell.font = {
            name: 'Calibri',
            size: 10,
            color: { argb: rowData._emAtraso && col.key === 'emAtraso' ? 'EF4444' : BRAND_TEXT_DARK },
            bold: col.key === 'noDP',
          };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
          cell.alignment = {
            horizontal: ['noDP', 'qtTot', 'vols', 'leadTime', 'emAtraso'].includes(col.key) ? 'right' : 'left',
            vertical: 'middle',
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
            left: { style: 'thin', color: { argb: 'E5E7EB' } },
            right: { style: 'thin', color: { argb: 'E5E7EB' } },
          };
        });

        // Red highlight for overdue rows
        if (rowData._emAtraso) {
          for (let ci = 0; ci < columns.length; ci++) {
            const cell = row.getCell(ci + 1);
            if (columns[ci].key === 'emAtraso') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
              cell.font = { ...cell.font as object, bold: true, color: { argb: 'DC2626' } };
            }
          }
        }
      });

      // --- TOTALS ROW ---
      const totalRowNum = dataRows.length + 6;
      const totalRow = ws.getRow(totalRowNum);
      totalRow.height = 22;
      ws.mergeCells(totalRowNum, 1, totalRowNum, 3);
      const totalLabelCell = totalRow.getCell(1);
      totalLabelCell.value = 'TOTAIS';
      totalLabelCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BRAND_WHITE } };
      totalLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_GREEN } };
      totalLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };

      const totalQt = dataRows.reduce((s, r) => s + (r.qtTot || 0), 0);
      const totalVols = dataRows.reduce((s, r) => s + (Number(r.vols) || 0), 0);
      const totalAtraso = dataRows.filter(r => r._emAtraso).length;

      const totalValues: Record<number, string | number> = {
        1: 'TOTAIS',
        2: '',
        3: '',
        4: totalQt,
        5: totalVols,
        6: '',
        7: totalAtraso,
      };

      Object.entries(totalValues).forEach(([colIdx, val]) => {
        const ci = parseInt(colIdx);
        const cell = totalRow.getCell(ci);
        cell.value = val;
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BRAND_WHITE } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_GREEN } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'medium', color: { argb: BRAND_GREEN_LIGHT } },
          bottom: { style: 'medium', color: { argb: BRAND_GREEN_LIGHT } },
          left: { style: 'thin', color: { argb: BRAND_GREEN_LIGHT } },
          right: { style: 'thin', color: { argb: BRAND_GREEN_LIGHT } },
        };
      });

      // --- FOOTER ---
      const footerRowNum = totalRowNum + 2;
      const footerRow = ws.getRow(footerRowNum);
      footerRow.height = 20;
      ws.mergeCells(footerRowNum, 1, footerRowNum, 10);
      const footerCell = footerRow.getCell(1);
      footerCell.value = 'Bralog · Tecnologia em Logística | © 2024 Grupo D&Y Soluções Logísticas';
      footerCell.font = { name: 'Calibri', size: 8, italic: true, color: { argb: BRAND_TEXT_GRAY } };
      footerCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Generate buffer and save
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bralog-pedidos-atrasados-${now.toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel export error:', err);
      alert('Erro ao exportar Excel. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  const exportPdf = async () => {
    if (!printRef.current) return;
    setBusy(true);
    try {
      const now = new Date();
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pw = doc.internal.pageSize.getWidth();

      // --- HEADER ---
      doc.setFillColor(6, 78, 59);
      doc.rect(0, 0, pw, 56, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('BRALOG — GESTÃO DE PEDIDOS ATRASADOS', pw / 2, 24, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(110, 231, 183);
      doc.text(`Bralog Logística Ltda – ES | Exportado em: ${formatDate(now)}`, pw / 2, 42, { align: 'center' });

      // --- TABLE ---
      const rows = orders.map(o => {
        const m = computeMetrics(o, now);
        return [
          String(o.noDP),
          o.cliente,
          o.sitFase,
          String(o.qtTot),
          o.vols ?? '—',
          m.leadTime.toFixed(2).replace('.', ','),
          m.emAtraso ? 'SIM' : 'NÃO',
          formatDate(new Date(o.dtIncSLA)),
          o.transportadora ?? '—',
        ];
      });

      (doc as any).autoTable({
        startY: 68,
        head: [['No. D.P.', 'Cliente', 'Sit. Fase', 'Qt. Tot.', 'Vols.', 'Lead (d)', 'Atraso', 'Dt. Incl. SLA', 'Transp.']],
        body: rows,
        styles: {
          fontSize: 7,
          cellPadding: 3,
          font: 'helvetica',
          textColor: [15, 23, 42],
          lineColor: [229, 231, 235],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [6, 78, 59],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7,
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: [240, 253, 244],
        },
        columnStyles: {
          0: { halign: 'right', fontStyle: 'bold' },
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'right' },
          6: { halign: 'center' },
        },
        didParseCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 6 && data.cell.text[0] === 'SIM') {
            data.cell.styles.fillColor = [254, 226, 226];
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
        },
        margin: { left: 20, right: 20 },
      });

      // Add total row manually after autoTable
      const totalQt = orders.reduce((s, o) => s + (o.qtTot || 0), 0);
      const totalVols = orders.reduce((s, o) => s + (o.vols || 0), 0);
      const totalAtraso = orders.filter(o => computeMetrics(o, new Date()).emAtraso).length;
      const tableEnd = (doc as any).lastAutoTable.finalY;
      doc.setFillColor(6, 78, 59);
      doc.rect(20, tableEnd, pw - 40, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const colWidths = [
        50, 70, 50, 50, 40, 50, 40, 70, 50,
      ];
      let cx = 20;
      const totalVals = ['TOTAIS', '', '', String(totalQt), String(totalVols), '', String(totalAtraso), '', ''];
      totalVals.forEach((v, i) => {
        doc.text(v, cx + colWidths[i] / 2, tableEnd + 12, { align: 'center' });
        cx += colWidths[i];
      });

      // --- FOOTER ---
      const finalY = (doc as any).lastAutoTable.finalY + 16;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text('Bralog · Tecnologia em Logística | © 2024 Grupo D&Y Soluções Logísticas', pw / 2, finalY, { align: 'center' });

      doc.save(`bralog-pedidos-atrasados-${now.toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" disabled={busy} className="h-9 bg-[#10B981] hover:bg-[#059669] text-white">
          <Download className="w-4 h-4 mr-1.5" />
          {busy ? 'Gerando...' : 'Exportar'}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#0A2F22] border-[#10B981]/40 text-[#D1FAE5]">
        <DropdownMenuItem onClick={exportXlsx} className="cursor-pointer focus:bg-[#064E3B]">
          <FileSpreadsheet className="w-4 h-4 mr-2 text-[#10B981]" />
          Exportar Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPdf} className="cursor-pointer focus:bg-[#064E3B]">
          <FileText className="w-4 h-4 mr-2 text-[#EF4444]" />
          Exportar PDF (A4)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

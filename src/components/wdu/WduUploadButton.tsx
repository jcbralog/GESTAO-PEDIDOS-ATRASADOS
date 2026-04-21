import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseWduExcel, type WduOrder } from '@/lib/wduData';

interface Props {
  onLoaded: (orders: WduOrder[], fileName: string) => void;
}

export default function WduUploadButton({ onLoaded }: Props) {
  const [busy, setBusy] = useState(false);

  const pick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setBusy(true);
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = new Uint8Array(ev.target!.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array', cellDates: true });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          // Header at row 7 (index 6) per spec
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { range: 6, defval: '' });
          const parsed = parseWduExcel(rows);
          onLoaded(parsed, file.name);
        } catch (err) {
          console.error(err);
          alert('Erro ao processar planilha. Verifique se o cabeçalho está na linha 7.');
        } finally {
          setBusy(false);
        }
      };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  };

  return (
    <Button onClick={pick} disabled={busy} size="sm" className="h-9 bg-[#10B981] hover:bg-[#059669] text-white">
      <Upload className="w-4 h-4 mr-1.5" />
      {busy ? 'Processando...' : 'Importar Excel'}
    </Button>
  );
}

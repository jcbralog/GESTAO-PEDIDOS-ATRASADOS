import { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { Settings, Upload, FileSpreadsheet } from 'lucide-react';

interface FileUploadProps {
  onDataLoaded: (rows: Record<string, unknown>[], fileName: string, sheets: string[], activeSheet: string) => void;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const processFile = useCallback((file: File) => {
    if (!file.name.match(/\.xlsx?$/i)) {
      setError('Arquivo inválido. Envie uma planilha .xlsx ou .xls.');
      return;
    }
    setLoading(true);
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array', cellDates: true });
        const sheets = wb.SheetNames;
        const sheet = sheets[0];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheet]);
        if (!rows.length) {
          setError('Planilha sem dados. Verifique o arquivo e tente novamente.');
          setLoading(false);
          return;
        }
        setTimeout(() => onDataLoaded(rows, file.name, sheets, sheet), 600);
      } catch {
        setError('Erro ao processar arquivo. Verifique o formato.');
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
        <Settings className="w-16 h-16 text-primary animate-spin mb-6" />
        <p className="text-2xl font-body text-muted-foreground">Carregando dados da produção...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50 p-8">
      <div className="mb-8 flex flex-col items-center">
        <Settings className="w-20 h-20 text-primary mb-4" />
        <h1 className="text-4xl font-display font-bold text-foreground">PAINEL DE PRODUÇÃO</h1>
        <p className="text-lg text-muted-foreground mt-2 font-body">Envie sua planilha para gerar o painel automaticamente</p>
      </div>

      <div
        className={`w-full max-w-xl border-2 border-dashed rounded-lg p-16 flex flex-col items-center cursor-pointer transition-colors ${
          dragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.xlsx,.xls';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) processFile(file);
          };
          input.click();
        }}
      >
        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-xl text-foreground font-body font-semibold mb-2">Arraste a planilha aqui</p>
        <p className="text-muted-foreground font-body">ou clique para selecionar</p>
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <FileSpreadsheet className="w-4 h-4" />
          <span>.xlsx ou .xls</span>
        </div>
      </div>

      {error && (
        <div className="mt-6 px-6 py-3 bg-destructive/20 border border-destructive/50 rounded-lg">
          <p className="text-destructive font-body">{error}</p>
        </div>
      )}
    </div>
  );
}

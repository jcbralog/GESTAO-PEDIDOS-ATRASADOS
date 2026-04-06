import { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Settings, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onDataLoaded: (rows: Record<string, unknown>[], fileName: string) => void;
  hasData?: boolean;
  importCount?: number;
}

export default function LogisticsUpload({ onDataLoaded, hasData, importCount = 0 }: Props) {
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
        const sheet = wb.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheet]);
        if (!rows.length) {
          setError('Planilha sem dados. Verifique o arquivo e tente novamente.');
          setLoading(false);
          return;
        }
        setTimeout(() => {
          onDataLoaded(rows, file.name);
          setLoading(false);
        }, 600);
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

  const openFilePicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) processFile(file);
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 z-50 backdrop-blur-sm">
        <Settings className="w-16 h-16 text-primary animate-spin mb-6" />
        <p className="text-2xl text-muted-foreground">Processando dados logísticos...</p>
      </div>
    );
  }

  // Compact inline mode when dashboard already has data
  if (hasData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/90 z-50 backdrop-blur-sm">
        <div className="bg-card border border-border rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">Importar Dados</h2>
              <p className="text-xs text-muted-foreground">Importação {importCount + 1} de 5 do dia</p>
            </div>
          </div>
          <div
            className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center cursor-pointer transition-colors ${
              dragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={openFilePicker}
          >
            <Upload className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-foreground font-semibold mb-1">Arraste a planilha aqui</p>
            <p className="text-muted-foreground text-sm">ou clique para selecionar</p>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>.xlsx ou .xls</span>
            </div>
          </div>
          {error && (
            <div className="mt-4 px-4 py-2 bg-destructive/20 border border-destructive/50 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full-screen initial mode
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50 p-8">
      <div className="mb-8 flex flex-col items-center">
        <Package className="w-20 h-20 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">
          Painel Logístico
        </h1>
        <p className="text-lg text-muted-foreground mt-2">Importe sua planilha Excel para gerar o painel analítico</p>
      </div>

      <div
        className={`w-full max-w-xl border-2 border-dashed rounded-lg p-16 flex flex-col items-center cursor-pointer transition-colors ${
          dragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={openFilePicker}
      >
        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-xl text-foreground font-semibold mb-2">Arraste a planilha aqui</p>
        <p className="text-muted-foreground">ou clique para selecionar</p>
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <FileSpreadsheet className="w-4 h-4" />
          <span>.xlsx ou .xls</span>
        </div>
      </div>

      <Button variant="ghost" className="mt-6 text-muted-foreground" onClick={() => onDataLoaded([], '__demo__')}>
        Usar dados demonstrativos
      </Button>

      {error && (
        <div className="mt-6 px-6 py-3 bg-destructive/20 border border-destructive/50 rounded-lg">
          <p className="text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}

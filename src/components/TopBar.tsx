import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface TopBarProps {
  fileName: string;
  shiftLabel: string;
  lastUpdate: Date;
  onRefresh: () => void;
}

export default function TopBar({ fileName, shiftLabel, lastUpdate, onRefresh }: TopBarProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="h-14 bg-topbar flex items-center justify-between px-6 border-b border-border shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-display font-bold text-foreground tracking-wide">PAINEL DE PRODUÇÃO</h1>
        <span className="text-sm text-muted-foreground font-body hidden xl:inline">
          {fileName} · Atualizado {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-display font-semibold text-foreground capitalize">{dateStr}</span>
        <span className="text-lg font-display font-bold text-primary ml-2">{timeStr}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 bg-primary/20 text-primary rounded text-sm font-display font-semibold">{shiftLabel}</span>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded text-sm font-body transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar Dados
        </button>
      </div>
    </div>
  );
}

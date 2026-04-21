import { useMemo, useState } from 'react';
import type { WduOrder, WduPhase } from '@/lib/wduData';
import { WDU_PHASE_ORDER } from '@/lib/wduData';
import { Check, ChevronDown, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type SlaFilter = 'all' | 'on_time' | 'overdue';

interface Props {
  orders: WduOrder[];
  selectedPhases: Set<WduPhase>;
  onPhasesChange: (s: Set<WduPhase>) => void;
  cliente: string;
  onClienteChange: (v: string) => void;
  transportadora: string;
  onTransportadoraChange: (v: string) => void;
  slaFilter: SlaFilter;
  onSlaChange: (v: SlaFilter) => void;
  onReset: () => void;
}

export default function WduFilters({
  orders, selectedPhases, onPhasesChange,
  cliente, onClienteChange, transportadora, onTransportadoraChange,
  slaFilter, onSlaChange, onReset,
}: Props) {
  const [open, setOpen] = useState(false);

  const clientes = useMemo(
    () => Array.from(new Set(orders.map(o => o.cliente).filter(Boolean))).sort(),
    [orders]
  );
  const transportadoras = useMemo(
    () => Array.from(new Set(orders.map(o => o.transportadora).filter(Boolean))).sort() as string[],
    [orders]
  );

  const togglePhase = (p: WduPhase) => {
    const next = new Set(selectedPhases);
    if (next.has(p)) next.delete(p); else next.add(p);
    onPhasesChange(next);
  };

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-3 flex flex-wrap items-center gap-2">
      <Filter className="w-4 h-4 text-[#94A3B8]" />

      {/* Phases multi-select */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 bg-[#0F172A] border-[#334155] text-[#CBD5E1] hover:bg-[#334155]/40 hover:text-[#F8FAFC]">
            Fases ({selectedPhases.size}/{WDU_PHASE_ORDER.length})
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2 bg-[#1E293B] border-[#334155]">
          <div className="space-y-1">
            {WDU_PHASE_ORDER.map(p => {
              const checked = selectedPhases.has(p);
              return (
                <label key={p} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#334155]/40 cursor-pointer text-sm text-[#CBD5E1]">
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-[#3B82F6] border-[#3B82F6]' : 'border-[#475569]'}`}>
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => togglePhase(p)} className="sr-only" />
                  {p}
                </label>
              );
            })}
            <div className="flex gap-1 pt-2 border-t border-[#334155]">
              <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs" onClick={() => onPhasesChange(new Set(WDU_PHASE_ORDER))}>Todas</Button>
              <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs" onClick={() => onPhasesChange(new Set())}>Nenhuma</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Cliente */}
      <Select value={cliente} onValueChange={onClienteChange}>
        <SelectTrigger className="h-9 w-[220px] bg-[#0F172A] border-[#334155] text-[#CBD5E1] text-sm">
          <SelectValue placeholder="Cliente" />
        </SelectTrigger>
        <SelectContent className="bg-[#1E293B] border-[#334155] text-[#CBD5E1]">
          <SelectItem value="all">Todos os clientes</SelectItem>
          {clientes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Transportadora */}
      <Select value={transportadora} onValueChange={onTransportadoraChange}>
        <SelectTrigger className="h-9 w-[180px] bg-[#0F172A] border-[#334155] text-[#CBD5E1] text-sm">
          <SelectValue placeholder="Transportadora" />
        </SelectTrigger>
        <SelectContent className="bg-[#1E293B] border-[#334155] text-[#CBD5E1]">
          <SelectItem value="all">Todas transportadoras</SelectItem>
          {transportadoras.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* SLA toggle */}
      <div className="inline-flex rounded-md border border-[#334155] overflow-hidden">
        {(['all', 'on_time', 'overdue'] as SlaFilter[]).map(s => (
          <button
            key={s}
            onClick={() => onSlaChange(s)}
            className={`px-3 h-9 text-xs font-semibold transition-colors ${
              slaFilter === s
                ? s === 'overdue' ? 'bg-[#EF4444] text-white'
                  : s === 'on_time' ? 'bg-[#10B981] text-white'
                  : 'bg-[#3B82F6] text-white'
                : 'bg-[#0F172A] text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            {s === 'all' ? 'Todos' : s === 'on_time' ? 'No Prazo' : 'Em Atraso'}
          </button>
        ))}
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={onReset}
        className="h-9 ml-auto bg-[#3B82F6] border-[#3B82F6] text-white hover:bg-[#2563EB] hover:text-white"
      >
        <X className="w-3.5 h-3.5 mr-1" />
        Limpar Filtros
      </Button>
    </div>
  );
}

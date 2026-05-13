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
  selectedClientes: Set<string>;
  onClientesChange: (s: Set<string>) => void;
  transportadora: string;
  onTransportadoraChange: (v: string) => void;
  slaFilter: SlaFilter;
  onSlaChange: (v: SlaFilter) => void;
  onReset: () => void;
}

export default function WduFilters({
  orders,
  selectedPhases: selectedPhasesProp,
  onPhasesChange,
  selectedClientes: selectedClientesProp,
  onClientesChange,
  transportadora, onTransportadoraChange,
  slaFilter, onSlaChange, onReset,
}: Props) {
  const selectedPhases = selectedPhasesProp ?? new Set<WduPhase>();
  const selectedClientes = selectedClientesProp ?? new Set<string>();
  const [openPhases, setOpenPhases] = useState(false);
  const [openClientes, setOpenClientes] = useState(false);
  const [clienteSearch, setClienteSearch] = useState('');

  const clientes = useMemo(
    () => Array.from(new Set(orders.map(o => o.cliente).filter(Boolean))).sort(),
    [orders]
  );
  const transportadoras = useMemo(
    () => Array.from(new Set(orders.map(o => o.transportadora).filter(Boolean))).sort() as string[],
    [orders]
  );

  const filteredClientes = useMemo(() => {
    const q = clienteSearch.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(c => c.toLowerCase().includes(q));
  }, [clientes, clienteSearch]);

  const togglePhase = (p: WduPhase) => {
    const next = new Set(selectedPhases);
    if (next.has(p)) next.delete(p); else next.add(p);
    onPhasesChange(next);
  };

  const toggleCliente = (c: string) => {
    const next = new Set(selectedClientes);
    if (next.has(c)) next.delete(c); else next.add(c);
    onClientesChange(next);
  };

  const allClientesSelected = selectedClientes.size === 0 || selectedClientes.size === clientes.length;
  const clienteLabel = allClientesSelected
    ? `Todos os clientes (${clientes.length})`
    : selectedClientes.size === 1
      ? Array.from(selectedClientes)[0]
      : `${selectedClientes.size} clientes selecionados`;

  const triggerCls = "h-9 bg-[#064E3B] border-[#10B981]/40 text-[#F0FDF4] hover:bg-[#065F46] hover:border-[#FBBF24] hover:text-[#FBBF24]";

  return (
    <div className="bg-[#064E3B] border border-[#10B981]/40 rounded-lg p-3 flex flex-wrap items-center gap-2 shadow-sm animate-fade-in">
      <Filter className="w-4 h-4 text-[#FBBF24]" />

      {/* Phases multi-select */}
      <Popover open={openPhases} onOpenChange={setOpenPhases}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={triggerCls}>
            Fases ({selectedPhases.size}/{WDU_PHASE_ORDER.length})
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2 bg-[#0A2F22] border-[#10B981]/40">
          <div className="space-y-1">
            {WDU_PHASE_ORDER.map(p => {
              const checked = selectedPhases.has(p);
              return (
                <label key={p} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#064E3B] cursor-pointer text-sm text-[#D1FAE5]">
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-[#10B981] border-[#10B981]' : 'border-[#6EE7B7]/40'}`}>
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => togglePhase(p)} className="sr-only" />
                  {p}
                </label>
              );
            })}
            <div className="flex gap-1 pt-2 border-t border-[#10B981]/30">
              <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs text-[#6EE7B7] hover:bg-[#064E3B] hover:text-[#FBBF24]" onClick={() => onPhasesChange(new Set(WDU_PHASE_ORDER))}>Todas</Button>
              <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs text-[#6EE7B7] hover:bg-[#064E3B] hover:text-[#FBBF24]" onClick={() => onPhasesChange(new Set())}>Nenhuma</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Cliente multi-select */}
      <Popover open={openClientes} onOpenChange={setOpenClientes}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`${triggerCls} w-[260px] justify-between`}
          >
            <span className="truncate text-left">{clienteLabel}</span>
            <ChevronDown className="w-3 h-3 ml-1 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-2 bg-[#0A2F22] border-[#10B981]/40" align="start">
          <input
            type="text"
            placeholder="Buscar cliente…"
            value={clienteSearch}
            onChange={(e) => setClienteSearch(e.target.value)}
            className="w-full mb-2 h-8 px-2 text-sm rounded bg-[#064E3B] border border-[#10B981]/40 text-[#F0FDF4] placeholder:text-[#6EE7B7] focus:outline-none focus:border-[#FBBF24]"
          />
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {filteredClientes.length === 0 && (
              <div className="text-xs text-[#94A3B8] px-2 py-3 text-center">Nenhum cliente encontrado</div>
            )}
            {filteredClientes.map(c => {
              const checked = selectedClientes.has(c);
              return (
                <label key={c} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#064E3B] cursor-pointer text-sm text-[#D1FAE5]">
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-[#10B981] border-[#10B981]' : 'border-[#6EE7B7]/40'}`}>
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => toggleCliente(c)} className="sr-only" />
                  <span className="truncate">{c}</span>
                </label>
              );
            })}
          </div>
          <div className="flex gap-1 pt-2 mt-2 border-t border-[#10B981]/30">
            <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs text-[#6EE7B7] hover:bg-[#064E3B] hover:text-[#FBBF24]" onClick={() => onClientesChange(new Set(clientes))}>Todos</Button>
            <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs text-[#6EE7B7] hover:bg-[#064E3B] hover:text-[#FBBF24]" onClick={() => onClientesChange(new Set())}>Nenhum</Button>
          </div>
          {selectedClientes.size > 0 && !allClientesSelected && (
            <div className="pt-2 mt-2 border-t border-[#E5E7EB] flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {Array.from(selectedClientes).map(c => (
                <span key={c} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FBBF24]/20 text-[#FBBF24] text-[10px]">
                  <span className="truncate max-w-[160px]">{c}</span>
                  <button onClick={() => toggleCliente(c)} className="hover:text-[#FBBF24]">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Transportadora */}
      <Select value={transportadora} onValueChange={onTransportadoraChange}>
        <SelectTrigger className="h-9 w-[180px] bg-[#064E3B] border-[#10B981]/40 text-[#F0FDF4] text-sm">
          <SelectValue placeholder="Transportadora" />
        </SelectTrigger>
        <SelectContent className="bg-[#0A2F22] border-[#10B981]/40 text-[#D1FAE5]">
          <SelectItem value="all">Todas transportadoras</SelectItem>
          {transportadoras.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* SLA toggle */}
      <div className="inline-flex rounded-md border border-[#10B981]/40 overflow-hidden">
        {(['all', 'on_time', 'overdue'] as SlaFilter[]).map(s => (
          <button
            key={s}
            onClick={() => onSlaChange(s)}
            className={`px-3 h-9 text-xs font-semibold transition-colors ${
              slaFilter === s
                ? s === 'overdue' ? 'bg-[#EF4444] text-white'
                  : s === 'on_time' ? 'bg-[#059669] text-white'
                  : 'bg-[#10B981] text-white'
                : 'bg-[#064E3B] text-[#6EE7B7] hover:text-[#FBBF24] hover:bg-[#065F46]'
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
        className="h-9 ml-auto bg-[#FBBF24] border-[#FBBF24] text-[#0A2F22] hover:bg-[#F59E0B] hover:text-[#0A2F22] hover:border-[#F59E0B] font-bold"
      >
        <X className="w-3.5 h-3.5 mr-1" />
        Limpar Filtros
      </Button>
    </div>
  );
}

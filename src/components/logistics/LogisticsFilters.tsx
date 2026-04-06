import { useMemo } from 'react';
import { CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Order } from '@/lib/logisticsData';

interface Props {
  orders: Order[];
  dateRange: { from: Date | undefined; to: Date | undefined };
  selectedClient: string;
  selectedCarrier: string;
  onDateChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  onClientChange: (v: string) => void;
  onCarrierChange: (v: string) => void;
  onReset: () => void;
}

export default function LogisticsFilters({
  orders, dateRange, selectedClient, selectedCarrier,
  onDateChange, onClientChange, onCarrierChange, onReset,
}: Props) {
  const clients = useMemo(() => [...new Set(orders.map(o => o.client))].sort(), [orders]);
  const carriers = useMemo(() => [...new Set(orders.map(o => o.carrier))].sort(), [orders]);

  const hasFilters = dateRange.from || dateRange.to || selectedClient !== 'all' || selectedCarrier !== 'all';

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Filter className="w-4 h-4 text-muted-foreground" />

      {/* Date From */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn(
            "h-8 text-xs gap-1.5 border-border bg-card",
            !dateRange.from && "text-muted-foreground"
          )}>
            <CalendarIcon className="w-3.5 h-3.5" />
            {dateRange.from ? format(dateRange.from, 'dd/MM/yy', { locale: ptBR }) : 'Data início'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange.from}
            onSelect={(d) => onDateChange({ ...dateRange, from: d })}
            locale={ptBR}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Date To */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn(
            "h-8 text-xs gap-1.5 border-border bg-card",
            !dateRange.to && "text-muted-foreground"
          )}>
            <CalendarIcon className="w-3.5 h-3.5" />
            {dateRange.to ? format(dateRange.to, 'dd/MM/yy', { locale: ptBR }) : 'Data fim'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange.to}
            onSelect={(d) => onDateChange({ ...dateRange, to: d })}
            locale={ptBR}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Client */}
      <Select value={selectedClient} onValueChange={onClientChange}>
        <SelectTrigger className="h-8 w-[160px] text-xs bg-card border-border">
          <SelectValue placeholder="Cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Clientes</SelectItem>
          {clients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Carrier */}
      <Select value={selectedCarrier} onValueChange={onCarrierChange}>
        <SelectTrigger className="h-8 w-[160px] text-xs bg-card border-border">
          <SelectValue placeholder="Transportadora" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas Transportadoras</SelectItem>
          {carriers.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={onReset}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

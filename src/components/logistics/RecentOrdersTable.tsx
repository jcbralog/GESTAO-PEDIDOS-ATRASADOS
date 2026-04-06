import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { PHASE_COLORS } from '@/lib/logisticsData';
import type { Order } from '@/lib/logisticsData';

interface Props {
  orders: Order[];
}

export default function RecentOrdersTable({ orders }: Props) {
  const rows = useMemo(() => orders.slice(0, 12), [orders]);

  return (
    <div className="bg-card rounded-lg border border-border p-3 h-full flex flex-col">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Pedidos Recentes</h3>
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-1.5 px-2 font-medium">Pedido</th>
              <th className="text-left py-1.5 px-2 font-medium">Data</th>
              <th className="text-left py-1.5 px-2 font-medium">Cliente</th>
              <th className="text-left py-1.5 px-2 font-medium">Transp.</th>
              <th className="text-left py-1.5 px-2 font-medium">Fase</th>
              <th className="text-right py-1.5 px-2 font-medium">Unid.</th>
              <th className="text-right py-1.5 px-2 font-medium">Lead</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="py-1.5 px-2 font-mono text-foreground">{o.id}</td>
                <td className="py-1.5 px-2 text-muted-foreground">{o.date.slice(5)}</td>
                <td className="py-1.5 px-2 text-foreground">{o.client}</td>
                <td className="py-1.5 px-2 text-foreground">{o.carrier}</td>
                <td className="py-1.5 px-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 border-0 font-medium"
                    style={{ backgroundColor: PHASE_COLORS[o.phase] + '22', color: PHASE_COLORS[o.phase] }}
                  >
                    {o.phase}
                  </Badge>
                </td>
                <td className="py-1.5 px-2 text-right text-foreground">{o.units}</td>
                <td className="py-1.5 px-2 text-right text-foreground">{o.leadTimeDays}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { Order } from '@/lib/logisticsData';
import { AlertTriangle } from 'lucide-react';

interface Props {
  orders: Order[];
}

function countBusinessDays(startStr: string, endDate: Date): number {
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endDate.toISOString().slice(0, 10) + 'T00:00:00');
  if (end <= start) return 0;
  let count = 0;
  const cur = new Date(start);
  cur.setDate(cur.getDate() + 1);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

const COMPLETED_PHASES = ['Faturado', 'Expedido', 'Em Trânsito', 'Entregue', 'Devolvido'];

const BANDS = [
  { label: '1–2 dias', min: 1, max: 2, color: 'hsl(38, 80%, 55%)' },
  { label: '3–5 dias', min: 3, max: 5, color: 'hsl(25, 85%, 55%)' },
  { label: '6–10 dias', min: 6, max: 10, color: 'hsl(15, 80%, 50%)' },
  { label: '10+ dias', min: 11, max: Infinity, color: 'hsl(0, 70%, 50%)' },
];

export default function OverdueOrdersChart({ orders }: Props) {
  const { data, total } = useMemo(() => {
    const now = new Date();
    const overdue = orders.filter(o => {
      if (o.dtConfSep) return false;
      if (COMPLETED_PHASES.includes(o.phase)) return false;
      const bd = countBusinessDays(o.date, now);
      return bd > 1;
    });

    const bandData = BANDS.map(b => {
      const count = overdue.filter(o => {
        const bd = countBusinessDays(o.date, now);
        return bd >= b.min && bd <= b.max;
      }).length;
      return { name: b.label, value: count, color: b.color };
    });

    return { data: bandData, total: overdue.length };
  }, [orders]);

  return (
    <Card className="h-full flex flex-col border-border bg-card">
      <CardHeader className="pb-1 pt-2 px-3">
        <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
          Pedidos Pendentes &gt;24h úteis
          <span className="ml-auto text-lg font-bold text-destructive">{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-2 pb-2 min-h-0">
        {total === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            Nenhum pedido pendente além de 24h úteis ✓
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 30, bottom: 4, left: 8 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={65} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 11 }}
                formatter={(v: number) => [`${v} pedidos`, 'Qtd']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
                <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

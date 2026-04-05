import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props {
  data: { name: string; value: number; target?: number }[];
  type: 'bar' | 'line';
  label: string;
}

export default function MainChart({ data, type, label }: Props) {
  if (!data.length) return <div className="flex items-center justify-center h-full text-muted-foreground">Sem dados para gráfico</div>;

  const hasTarget = data.some(d => d.target !== undefined && d.target > 0);
  const avgTarget = hasTarget ? data.reduce((s, d) => s + (d.target || 0), 0) / data.filter(d => d.target).length : 0;

  const common = {
    data,
    margin: { top: 10, right: 20, left: 10, bottom: 5 },
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 flex flex-col h-full">
      <h3 className="text-lg font-display font-bold text-foreground mb-2 shrink-0">{label}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart {...common}>
              <XAxis dataKey="name" tick={{ fill: 'hsl(215,20%,65%)', fontSize: 14 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: 'hsl(215,20%,65%)', fontSize: 14 }} width={60} />
              <Tooltip contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,20%)', borderRadius: 8, color: '#fff', fontSize: 14 }} />
              <Bar dataKey="value" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} />
              {hasTarget && <ReferenceLine y={avgTarget} stroke="hsl(142,71%,45%)" strokeDasharray="6 4" strokeWidth={2} label={{ value: 'Meta', fill: 'hsl(142,71%,45%)', fontSize: 14 }} />}
            </BarChart>
          ) : (
            <LineChart {...common}>
              <XAxis dataKey="name" tick={{ fill: 'hsl(215,20%,65%)', fontSize: 14 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: 'hsl(215,20%,65%)', fontSize: 14 }} width={60} />
              <Tooltip contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,20%)', borderRadius: 8, color: '#fff', fontSize: 14 }} />
              <Line type="monotone" dataKey="value" stroke="hsl(217,91%,60%)" strokeWidth={3} dot={{ r: 4, fill: 'hsl(217,91%,60%)' }} />
              {hasTarget && <ReferenceLine y={avgTarget} stroke="hsl(142,71%,45%)" strokeDasharray="6 4" strokeWidth={2} />}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

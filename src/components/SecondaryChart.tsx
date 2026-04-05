import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { name: string; value: number; color: string }[];
  type: 'pie' | 'bar';
  label: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderLabel = (props: any) => {
  const name = String(props.name ?? '');
  const percent = Number(props.percent ?? 0);
  return `${name} (${(percent * 100).toFixed(0)}%)`;
};

export default function SecondaryChart({ data, type, label }: Props) {
  if (!data.length) return <div className="flex items-center justify-center h-full text-muted-foreground">Sem dados</div>;

  return (
    <div className="bg-card rounded-lg border border-border p-4 flex flex-col h-full">
      <h3 className="text-lg font-display font-bold text-foreground mb-2 shrink-0">{label}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'pie' ? (
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="40%" outerRadius="75%"
                label={renderLabel} labelLine={{ stroke: 'hsl(215,20%,65%)' }}
                style={{ fontSize: 13, fill: 'hsl(0,0%,100%)' }}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,20%)', borderRadius: 8, color: '#fff', fontSize: 14 }} />
            </PieChart>
          ) : (
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis type="number" tick={{ fill: 'hsl(215,20%,65%)', fontSize: 14 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(215,20%,65%)', fontSize: 13 }} width={100} />
              <Tooltip contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,20%)', borderRadius: 8, color: '#fff', fontSize: 14 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

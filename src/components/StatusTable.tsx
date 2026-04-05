import { useEffect, useRef, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {};
const PALETTE = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
let colorIdx = 0;
function getStatusColor(status: string): string {
  if (!STATUS_COLORS[status]) {
    STATUS_COLORS[status] = PALETTE[colorIdx % PALETTE.length];
    colorIdx++;
  }
  return STATUS_COLORS[status];
}

interface Props {
  columns: string[];
  rows: Record<string, unknown>[];
  statusColumn?: string;
}

const MAX_VISIBLE = 8;

export default function StatusTable({ columns, rows, statusColumn }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const needsScroll = rows.length > MAX_VISIBLE;

  useEffect(() => {
    if (!needsScroll) return;
    const interval = setInterval(() => {
      setOffset(prev => {
        const next = prev + 1;
        return next >= rows.length ? 0 : next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [needsScroll, rows.length]);

  const visibleRows = needsScroll
    ? Array.from({ length: MAX_VISIBLE }, (_, i) => rows[(offset + i) % rows.length])
    : rows;

  if (!columns.length) return null;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden flex flex-col h-full" ref={containerRef}>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border">
            {columns.map(col => (
              <th key={col} className="px-4 py-2 text-sm font-display font-bold text-muted-foreground uppercase tracking-wider">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-card' : 'bg-secondary/30'}>
              {columns.map(col => {
                const val = String(row[col] ?? '');
                const isStatus = col === statusColumn;
                return (
                  <td key={col} className="px-4 py-2 text-base font-body text-foreground whitespace-nowrap">
                    {isStatus ? (
                      <span className="px-2 py-0.5 rounded text-sm font-bold" style={{ backgroundColor: getStatusColor(val) + '30', color: getStatusColor(val) }}>
                        {val}
                      </span>
                    ) : val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

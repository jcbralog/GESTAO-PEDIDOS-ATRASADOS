export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'text' | 'date' | 'percentage' | 'boolean';
  role: string; // production, target, efficiency, downtime, defect, status, order, product, shift, operator, other
  sum?: number;
  avg?: number;
  min?: number;
  max?: number;
  categories?: { name: string; count: number; color: string }[];
}

export interface AnalysisResult {
  columns: ColumnInfo[];
  kpis: KPI[];
  mainChartData: { name: string; value: number; target?: number }[];
  mainChartType: 'bar' | 'line';
  mainChartLabel: string;
  secondaryChartData: { name: string; value: number; color: string }[];
  secondaryChartType: 'pie' | 'bar';
  secondaryChartLabel: string;
  tableColumns: string[];
  tableRows: Record<string, unknown>[];
  shiftLabel: string;
}

export interface KPI {
  label: string;
  value: string;
  icon: 'production' | 'efficiency' | 'downtime' | 'defect' | 'orders';
  progress?: number; // 0-100
  color: 'primary' | 'success' | 'warning' | 'destructive';
}

const PRODUCTION_KEYWORDS = ['produção', 'producao', 'produzido', 'realizado', 'quantidade', 'qtd', 'qty', 'output', 'produced', 'peças', 'pecas', 'total produzido'];
const TARGET_KEYWORDS = ['meta', 'target', 'objetivo', 'planejado', 'previsto', 'plan'];
const EFFICIENCY_KEYWORDS = ['oee', 'eficiência', 'eficiencia', 'efficiency', 'rendimento', 'performance', 'disponibilidade'];
const DOWNTIME_KEYWORDS = ['parada', 'downtime', 'stop', 'tempo parado', 'indisponibilidade', 'paradas'];
const DEFECT_KEYWORDS = ['refugo', 'scrap', 'defeito', 'retrabalho', 'rework', 'rejeitado', 'sucata', 'não conforme'];
const STATUS_KEYWORDS = ['status', 'fase', 'phase', 'situação', 'situacao', 'estado', 'etapa', 'andamento'];
const ORDER_KEYWORDS = ['pedido', 'ordem', 'order', 'op', 'os', 'número', 'numero', 'nº', 'lote'];
const PRODUCT_KEYWORDS = ['produto', 'product', 'item', 'descrição', 'descricao', 'linha', 'line', 'modelo', 'referência'];
const SHIFT_KEYWORDS = ['turno', 'shift', 'período', 'periodo'];
const OPERATOR_KEYWORDS = ['operador', 'operator', 'responsável', 'responsavel', 'colaborador', 'funcionário'];
const DATE_KEYWORDS = ['data', 'date', 'dia', 'day', 'hora', 'time', 'período'];

const BADGE_COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

function matchesKeywords(name: string, keywords: string[]): boolean {
  const lower = name.toLowerCase().trim();
  return keywords.some(k => lower.includes(k));
}

function detectColumnRole(name: string): string {
  if (matchesKeywords(name, PRODUCTION_KEYWORDS)) return 'production';
  if (matchesKeywords(name, TARGET_KEYWORDS)) return 'target';
  if (matchesKeywords(name, EFFICIENCY_KEYWORDS)) return 'efficiency';
  if (matchesKeywords(name, DOWNTIME_KEYWORDS)) return 'downtime';
  if (matchesKeywords(name, DEFECT_KEYWORDS)) return 'defect';
  if (matchesKeywords(name, STATUS_KEYWORDS)) return 'status';
  if (matchesKeywords(name, ORDER_KEYWORDS)) return 'order';
  if (matchesKeywords(name, PRODUCT_KEYWORDS)) return 'product';
  if (matchesKeywords(name, SHIFT_KEYWORDS)) return 'shift';
  if (matchesKeywords(name, OPERATOR_KEYWORDS)) return 'operator';
  if (matchesKeywords(name, DATE_KEYWORDS)) return 'date';
  return 'other';
}

function detectColumnType(values: unknown[]): 'numeric' | 'text' | 'date' | 'percentage' | 'boolean' {
  const sample = values.filter(v => v != null && v !== '').slice(0, 50);
  if (sample.length === 0) return 'text';

  const numCount = sample.filter(v => typeof v === 'number' || (!isNaN(Number(v)) && String(v).trim() !== '')).length;
  const pctCount = sample.filter(v => typeof v === 'string' && v.includes('%')).length;
  const boolCount = sample.filter(v => typeof v === 'boolean' || ['sim', 'não', 'nao', 'yes', 'no', 'true', 'false'].includes(String(v).toLowerCase())).length;
  const dateCount = sample.filter(v => v instanceof Date || (!isNaN(Date.parse(String(v))) && String(v).length > 6)).length;

  if (pctCount > sample.length * 0.5) return 'percentage';
  if (boolCount > sample.length * 0.5) return 'boolean';
  if (numCount > sample.length * 0.5) return 'numeric';
  if (dateCount > sample.length * 0.5) return 'date';
  return 'text';
}

function getNumericValues(rows: Record<string, unknown>[], col: string): number[] {
  return rows.map(r => {
    const v = r[col];
    if (typeof v === 'number') return v;
    const str = String(v).replace('%', '').replace(',', '.').trim();
    const n = Number(str);
    return isNaN(n) ? null : n;
  }).filter((v): v is number => v !== null);
}

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'K';
  if (n % 1 !== 0) return n.toFixed(1);
  return n.toLocaleString('pt-BR');
}

export function analyzeData(rows: Record<string, unknown>[]): AnalysisResult {
  if (!rows.length) {
    return {
      columns: [], kpis: [], mainChartData: [], mainChartType: 'bar', mainChartLabel: '',
      secondaryChartData: [], secondaryChartType: 'pie', secondaryChartLabel: '',
      tableColumns: [], tableRows: [], shiftLabel: 'Turno Atual',
    };
  }

  const headers = Object.keys(rows[0]);
  const columns: ColumnInfo[] = headers.map(name => {
    const values = rows.map(r => r[name]);
    const type = detectColumnType(values);
    const role = detectColumnRole(name);
    const info: ColumnInfo = { name, type, role };

    if (type === 'numeric' || type === 'percentage') {
      const nums = getNumericValues(rows, name);
      if (nums.length) {
        info.sum = nums.reduce((a, b) => a + b, 0);
        info.avg = info.sum / nums.length;
        info.min = Math.min(...nums);
        info.max = Math.max(...nums);
      }
    }

    if (type === 'text' || role === 'status' || role === 'shift') {
      const counts: Record<string, number> = {};
      values.forEach(v => {
        const s = String(v ?? '').trim();
        if (s) counts[s] = (counts[s] || 0) + 1;
      });
      const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (entries.length <= 20) {
        info.categories = entries.map(([cat, count], i) => ({
          name: cat, count, color: BADGE_COLORS[i % BADGE_COLORS.length],
        }));
      }
    }

    return info;
  });

  // Find key columns
  const prodCol = columns.find(c => c.role === 'production' && (c.type === 'numeric' || c.type === 'percentage'));
  const targetCol = columns.find(c => c.role === 'target' && c.type === 'numeric');
  const effCol = columns.find(c => c.role === 'efficiency');
  const downCol = columns.find(c => c.role === 'downtime');
  const defectCol = columns.find(c => c.role === 'defect');
  const statusCol = columns.find(c => c.role === 'status');
  const orderCol = columns.find(c => c.role === 'order');
  const productCol = columns.find(c => c.role === 'product');
  const shiftCol = columns.find(c => c.role === 'shift');
  const operatorCol = columns.find(c => c.role === 'operator');
  const dateCol = columns.find(c => c.role === 'date' || c.type === 'date');
  const categoryCol = productCol || shiftCol || operatorCol || columns.find(c => c.type === 'text' && c.categories && c.categories.length >= 2 && c.categories.length <= 15);

  // Build KPIs
  const kpis: KPI[] = [];
  const numericCols = columns.filter(c => (c.type === 'numeric' || c.type === 'percentage') && c.sum !== undefined);

  if (prodCol && prodCol.sum !== undefined) {
    const progress = targetCol?.sum ? Math.round((prodCol.sum / targetCol.sum) * 100) : undefined;
    kpis.push({
      label: 'Produção Realizada',
      value: formatNumber(prodCol.sum),
      icon: 'production',
      progress,
      color: progress ? (progress >= 90 ? 'success' : progress >= 70 ? 'warning' : 'destructive') : 'primary',
    });
  }

  if (effCol && effCol.avg !== undefined) {
    const val = effCol.avg > 1 ? effCol.avg : effCol.avg * 100;
    kpis.push({
      label: effCol.name,
      value: val.toFixed(1) + '%',
      icon: 'efficiency',
      progress: Math.min(100, Math.round(val)),
      color: val >= 85 ? 'success' : val >= 65 ? 'warning' : 'destructive',
    });
  }

  if (downCol && downCol.sum !== undefined) {
    kpis.push({
      label: 'Paradas',
      value: formatNumber(downCol.sum),
      icon: 'downtime',
      color: 'warning',
    });
  }

  if (defectCol && defectCol.sum !== undefined) {
    const pct = prodCol?.sum ? ((defectCol.sum / prodCol.sum) * 100) : undefined;
    kpis.push({
      label: 'Refugo / Retrabalho',
      value: pct ? pct.toFixed(1) + '%' : formatNumber(defectCol.sum),
      icon: 'defect',
      progress: pct ? Math.min(100, Math.round(pct)) : undefined,
      color: (pct && pct > 5) ? 'destructive' : 'warning',
    });
  }

  if (statusCol?.categories) {
    const done = statusCol.categories.filter(c =>
      ['concluído', 'concluido', 'finalizado', 'done', 'completo', 'entregue', 'pronto'].some(k => c.name.toLowerCase().includes(k))
    ).reduce((s, c) => s + c.count, 0);
    kpis.push({
      label: 'Pedidos Concluídos',
      value: `${done}/${rows.length}`,
      icon: 'orders',
      progress: Math.round((done / rows.length) * 100),
      color: done / rows.length >= 0.8 ? 'success' : 'warning',
    });
  }

  // Fill remaining KPI slots with top numeric columns
  const usedNames = new Set(kpis.map(k => k.label));
  for (const col of numericCols) {
    if (kpis.length >= 5) break;
    if (usedNames.has(col.name) || col.role === 'target') continue;
    if ([prodCol, effCol, downCol, defectCol].some(c => c?.name === col.name)) continue;
    kpis.push({
      label: col.name,
      value: formatNumber(col.sum!),
      icon: 'production',
      color: 'primary',
    });
    usedNames.add(col.name);
  }

  // Main chart
  let mainChartData: { name: string; value: number; target?: number }[] = [];
  let mainChartType: 'bar' | 'line' = 'bar';
  let mainChartLabel = 'Produção';
  const primaryNumCol = prodCol || numericCols[0];

  if (dateCol && primaryNumCol) {
    mainChartType = 'line';
    mainChartLabel = primaryNumCol.name;
    const grouped: Record<string, { sum: number; target: number }> = {};
    rows.forEach(r => {
      const key = String(r[dateCol.name] ?? '').substring(0, 10);
      if (!grouped[key]) grouped[key] = { sum: 0, target: 0 };
      grouped[key].sum += Number(r[primaryNumCol.name]) || 0;
      if (targetCol) grouped[key].target += Number(r[targetCol.name]) || 0;
    });
    mainChartData = Object.entries(grouped).slice(0, 15).map(([name, v]) => ({
      name, value: v.sum, ...(targetCol ? { target: v.target } : {}),
    }));
  } else if (categoryCol && primaryNumCol) {
    mainChartLabel = primaryNumCol.name + ' por ' + categoryCol.name;
    const grouped: Record<string, { sum: number; target: number }> = {};
    rows.forEach(r => {
      const key = String(r[categoryCol.name] ?? '');
      if (!grouped[key]) grouped[key] = { sum: 0, target: 0 };
      grouped[key].sum += Number(r[primaryNumCol.name]) || 0;
      if (targetCol) grouped[key].target += Number(r[targetCol.name]) || 0;
    });
    mainChartData = Object.entries(grouped).map(([name, v]) => ({
      name, value: v.sum, ...(targetCol ? { target: v.target } : {}),
    }));
  } else if (primaryNumCol) {
    mainChartLabel = primaryNumCol.name;
    mainChartData = rows.slice(0, 15).map((r, i) => ({
      name: String(r[headers[0]] ?? `#${i + 1}`),
      value: Number(r[primaryNumCol.name]) || 0,
    }));
  }

  // Secondary chart
  let secondaryChartData: { name: string; value: number; color: string }[] = [];
  let secondaryChartType: 'pie' | 'bar' = 'pie';
  let secondaryChartLabel = 'Distribuição';

  if (statusCol?.categories) {
    secondaryChartLabel = 'Status: ' + statusCol.name;
    secondaryChartData = statusCol.categories.map(c => ({ name: c.name, value: c.count, color: c.color }));
  } else {
    const catCol = columns.find(c => c.categories && c.categories.length >= 2 && c.categories.length <= 10 && c !== categoryCol);
    if (catCol?.categories) {
      secondaryChartLabel = catCol.name;
      secondaryChartData = catCol.categories.map(c => ({ name: c.name, value: c.count, color: c.color }));
    } else if (numericCols.length >= 2) {
      secondaryChartType = 'bar';
      secondaryChartLabel = 'Indicadores';
      secondaryChartData = numericCols.slice(0, 6).map((c, i) => ({
        name: c.name, value: c.sum!, color: BADGE_COLORS[i % BADGE_COLORS.length],
      }));
    }
  }

  // Table columns & rows
  const tableColPriority = [orderCol, productCol, statusCol, operatorCol, ...columns.filter(c => c.type === 'numeric').slice(0, 2)].filter(Boolean) as ColumnInfo[];
  const seen = new Set<string>();
  const tableColumns = tableColPriority.filter(c => { if (seen.has(c.name)) return false; seen.add(c.name); return true; }).map(c => c.name);
  if (tableColumns.length === 0) {
    headers.slice(0, 6).forEach(h => { if (!seen.has(h)) { seen.add(h); tableColumns.push(h); } });
  }
  const tableRows = rows.slice(0, 30);

  // Shift
  const shiftLabel = shiftCol?.categories?.[0]?.name || 'Turno Atual';

  return {
    columns, kpis, mainChartData, mainChartType, mainChartLabel,
    secondaryChartData, secondaryChartType, secondaryChartLabel,
    tableColumns, tableRows, shiftLabel,
  };
}

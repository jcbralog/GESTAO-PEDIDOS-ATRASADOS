// Logistics data types and Excel parser

const CLIENTS = ['Magazine Luiza', 'Americanas', 'Casas Bahia', 'Mercado Livre', 'Amazon BR', 'Shopee', 'Via Varejo', 'Carrefour'];
const CARRIERS = ['Jadlog', 'Correios', 'Total Express', 'Loggi', 'Azul Cargo', 'TNT Mercúrio', 'Braspress'];
const PHASES = ['Aguardando Separação', 'Em Separação', 'Embalagem', 'Faturado', 'Expedido', 'Em Trânsito', 'Entregue', 'Devolvido'];
const PRODUCTS = ['Eletrônicos', 'Vestuário', 'Alimentos', 'Cosméticos', 'Móveis', 'Brinquedos', 'Papelaria', 'Ferramentas'];
const CITIES = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Salvador', 'Recife', 'Fortaleza', 'Brasília', 'Manaus'];

export interface Order {
  id: string;
  date: string;
  client: string;
  carrier: string;
  phase: string;
  units: number;
  weight: number;
  product: string;
  city: string;
  leadTimeDays: number;
  onTime: boolean;
  dtConfSep?: string; // Data Confirmação Separação
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateDemoOrders(count = 500): Order[] {
  const orders: Order[] = [];
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  for (let i = 0; i < count; i++) {
    const d = randomDate(start, end);
    const phase = pick(PHASES);
    const leadTime = Math.floor(Math.random() * 10) + 1;
    const hasSep = ['Em Separação', 'Embalagem', 'Faturado', 'Expedido', 'Em Trânsito', 'Entregue', 'Devolvido'].includes(phase);
    const sepDate = hasSep ? new Date(d.getTime() + Math.random() * 3 * 86400000) : undefined;
    orders.push({
      id: `PED-${String(10000 + i).slice(1)}`,
      date: d.toISOString().slice(0, 10),
      client: pick(CLIENTS),
      carrier: pick(CARRIERS),
      phase,
      units: Math.floor(Math.random() * 50) + 1,
      weight: Math.round((Math.random() * 200 + 1) * 10) / 10,
      product: pick(PRODUCTS),
      city: pick(CITIES),
      leadTimeDays: leadTime,
      onTime: leadTime <= 5,
      dtConfSep: sepDate ? sepDate.toISOString().slice(0, 10) : undefined,
    });
  }
  return orders.sort((a, b) => b.date.localeCompare(a.date));
}

// --- Excel column mapping ---
// Tries to find best matching column for each Order field via fuzzy keywords
const COLUMN_MAP: Record<keyof Order, string[]> = {
  id: ['pedido', 'nº pedido', 'numero pedido', 'order', 'id', 'cod', 'código', 'num'],
  date: ['data', 'dt', 'data pedido', 'dt pedido', 'date', 'dt. pedido'],
  client: ['cliente', 'client', 'razão social', 'razao social', 'destinatário', 'destinatario'],
  carrier: ['transportadora', 'carrier', 'transp', 'empresa transporte', 'logística'],
  phase: ['fase', 'situação', 'situacao', 'status', 'phase', 'situação fase', 'sit', 'etapa'],
  units: ['unidades', 'qtd', 'quantidade', 'units', 'peças', 'pecas', 'itens', 'volume', 'qtde'],
  weight: ['peso', 'weight', 'kg', 'peso total'],
  product: ['produto', 'product', 'item', 'descrição', 'descricao', 'mercadoria'],
  city: ['cidade', 'city', 'destino', 'localidade', 'município', 'municipio', 'uf'],
  leadTimeDays: ['lead time', 'prazo', 'dias', 'sla', 'tempo entrega'],
  onTime: ['no prazo', 'on time', 'pontual', 'dentro prazo'],
  dtConfSep: ['dt. conf .sep', 'dt conf sep', 'dt.conf.sep', 'data confirmação separação', 'data conf sep', 'conf sep', 'confirmação separação', 'dt. conf. sep.', 'dt conf. sep', 'data separação', 'dt separação', 'dt. sep'],
};

function normalizeStr(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function findColumn(headers: string[], keywords: string[]): string | null {
  const normalized = headers.map(normalizeStr);
  for (const kw of keywords) {
    const nkw = normalizeStr(kw);
    const idx = normalized.findIndex(h => h === nkw);
    if (idx >= 0) return headers[idx];
  }
  for (const kw of keywords) {
    const nkw = normalizeStr(kw);
    const idx = normalized.findIndex(h => h.includes(nkw) || nkw.includes(h));
    if (idx >= 0) return headers[idx];
  }
  return null;
}

function toDateStr(val: unknown): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  const s = String(val).trim();
  // dd/mm/yyyy
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  // yyyy-mm-dd already
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // Try parsing
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s;
}

export function parseExcelToOrders(rows: Record<string, unknown>[]): Order[] {
  if (!rows.length) return [];
  const headers = Object.keys(rows[0]);

  const colMap: Partial<Record<keyof Order, string>> = {};
  for (const [field, keywords] of Object.entries(COLUMN_MAP)) {
    const col = findColumn(headers, keywords);
    if (col) colMap[field as keyof Order] = col;
  }

  return rows.map((row, i) => {
    const get = (field: keyof Order): unknown => {
      const col = colMap[field];
      return col ? row[col] : undefined;
    };

    const unitsVal = get('units');
    const weightVal = get('weight');
    const dateVal = get('date');
    const dtConfSepVal = get('dtConfSep');

    return {
      id: String(get('id') || `ROW-${i + 1}`),
      date: toDateStr(dateVal) || new Date().toISOString().slice(0, 10),
      client: String(get('client') || 'N/D'),
      carrier: String(get('carrier') || 'N/D'),
      phase: String(get('phase') || 'N/D'),
      units: Number(unitsVal) || 0,
      weight: Number(weightVal) || 0,
      product: String(get('product') || 'N/D'),
      city: String(get('city') || 'N/D'),
      leadTimeDays: Number(get('leadTimeDays')) || 0,
      onTime: (() => {
        const v = get('onTime');
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') return ['sim', 'yes', 's', '1', 'true'].includes(v.toLowerCase());
        return false;
      })(),
      dtConfSep: toDateStr(dtConfSepVal) || undefined,
    };
  }).sort((a, b) => b.date.localeCompare(a.date));
}

export const PHASE_COLORS: Record<string, string> = {
  'Aguardando Separação': 'hsl(var(--warning))',
  'Em Separação': 'hsl(38, 80%, 65%)',
  'Embalagem': 'hsl(var(--primary))',
  'Faturado': 'hsl(217, 70%, 50%)',
  'Expedido': 'hsl(280, 67%, 60%)',
  'Em Trânsito': 'hsl(var(--chart-2))',
  'Entregue': 'hsl(var(--success))',
  'Devolvido': 'hsl(var(--destructive))',
};

export const PHASE_COLORS_RAW: Record<string, string> = {
  'Aguardando Separação': '#F59E0B',
  'Em Separação': '#D4A04A',
  'Embalagem': '#3B82F6',
  'Faturado': '#2563EB',
  'Expedido': '#8B5CF6',
  'Em Trânsito': '#22C55E',
  'Entregue': '#16A34A',
  'Devolvido': '#EF4444',
};

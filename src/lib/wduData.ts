// WDU (Painel de Saída) — types, mock, parser and business-day calculations
import { addDays, isWeekend, isSameDay, startOfDay, setHours, setMinutes, setSeconds, isBefore, differenceInMinutes } from 'date-fns';

export type WduPhase =
  | 'Em Digit.'
  | 'A Sep.'
  | 'Em Sep.'
  | 'Sep. Ok'
  | 'Sep. Conf.'
  | 'Em Cko.'
  | 'Cko. Ok'
  | 'CkoVol. Ok'
  | 'N.F. Conf.';

export const WDU_PHASE_ORDER: WduPhase[] = [
  'Em Digit.', 'A Sep.', 'Em Sep.', 'Sep. Ok', 'Sep. Conf.',
  'Em Cko.', 'Cko. Ok', 'CkoVol. Ok', 'N.F. Conf.',
];

export type PhaseGroup = 'Digitação' | 'Separação' | 'Conferência' | 'Faturamento';

export const PHASE_GROUP: Record<WduPhase, PhaseGroup> = {
  'Em Digit.': 'Digitação',
  'A Sep.': 'Separação',
  'Em Sep.': 'Separação',
  'Sep. Ok': 'Separação',
  'Sep. Conf.': 'Separação',
  'Em Cko.': 'Conferência',
  'Cko. Ok': 'Conferência',
  'CkoVol. Ok': 'Conferência',
  'N.F. Conf.': 'Faturamento',
};

export const GROUP_COLORS: Record<PhaseGroup, string> = {
  'Digitação': '#64748B',
  'Separação': '#3B82F6',
  'Conferência': '#F59E0B',
  'Faturamento': '#10B981',
};

export interface WduOrder {
  noDP: number;
  cliente: string;
  obsResumida?: string;
  noPedCli?: string;
  sku?: string;
  qtTot: number;
  dtIncSLA: string; // ISO datetime
  sitFase: WduPhase;
  pctSep?: number;
  pctCko?: number;
  pctVol?: number;
  noNF?: string;
  vols?: number | null;
  dtConfSep?: string;
  dtConfNF?: string;
  transportadora?: string;
  destinatario?: string;
  doca?: string;
  prior?: string;
}

// ============== Holidays ==============
// Returns "MM-DD" key
function md(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const FIXED_HOLIDAYS = new Set<string>([
  '01-01', // Confraternização
  '04-21', // Tiradentes
  '05-01', // Dia do Trabalho
  '09-07', // Independência
  '10-12', // N. Sra. Aparecida
  '11-02', // Finados
  '11-15', // Proclamação
  '12-25', // Natal
  '10-28', // Dia do Servidor Público (ES)
  '09-08', // N. Sra. da Vitória (Vitória/ES)
  '04-24', // Fundação de Vitória/ES
]);

export function isHoliday(date: Date): boolean {
  return FIXED_HOLIDAYS.has(md(date));
}

export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

function nextBusinessDayAt8(date: Date): Date {
  let d = startOfDay(date);
  // If same day is business day AND original time is before 18:00 AND >= 08:00, keep
  const isBd = isBusinessDay(date);
  const hour = date.getHours();
  if (isBd && hour >= 8 && hour < 18) return date;
  if (isBd && hour < 8) {
    return setSeconds(setMinutes(setHours(d, 8), 0), 0);
  }
  // After hours or weekend/holiday → next business day at 08:00
  d = addDays(d, 1);
  while (!isBusinessDay(d)) d = addDays(d, 1);
  return setSeconds(setMinutes(setHours(d, 8), 0), 0);
}

/**
 * Counts business days between start and end (inclusive of fractional via hours).
 * Returns a number of business days (can be fractional, e.g. 1.5).
 * Business hours considered: 08:00 – 18:00 (10h work day).
 */
export function calcularDiasUteis(inicio: Date, fim: Date): number {
  if (!inicio || !fim) return 0;
  const start = nextBusinessDayAt8(inicio);
  if (isBefore(fim, start)) return 0;

  const WORK_MINUTES_PER_DAY = 10 * 60; // 08–18
  let totalMinutes = 0;
  let cursor = new Date(start);

  while (isBefore(cursor, fim) || isSameDay(cursor, fim)) {
    if (isBusinessDay(cursor)) {
      const dayStart = setSeconds(setMinutes(setHours(cursor, 8), 0), 0);
      const dayEnd = setSeconds(setMinutes(setHours(cursor, 18), 0), 0);
      const segStart = isBefore(cursor, dayStart) ? dayStart : cursor;
      const segEnd = isBefore(fim, dayEnd) ? fim : dayEnd;
      if (isSameDay(cursor, fim) && isBefore(fim, dayStart)) {
        // fim before working hours of the day → no add
      } else if (isBefore(segStart, segEnd)) {
        totalMinutes += differenceInMinutes(segEnd, segStart);
      }
      if (isSameDay(cursor, fim)) break;
    }
    cursor = setSeconds(setMinutes(setHours(addDays(cursor, 1), 8), 0), 0);
  }
  return +(totalMinutes / WORK_MINUTES_PER_DAY).toFixed(2);
}

export interface OrderMetrics {
  leadTime: number; // business days (fractional)
  emAtraso: boolean;
}

export function computeMetrics(o: WduOrder, now: Date = new Date()): OrderMetrics {
  const dt = new Date(o.dtIncSLA);
  const leadTime = calcularDiasUteis(dt, now);
  return { leadTime, emAtraso: leadTime > 1 };
}

// ============== MOCK ==============
export const MOCK_WDU: WduOrder[] = [
  { noDP: 139855, cliente: 'ZAKAT DISTRIBUIDORA ATACADO (ES)', sitFase: 'Em Sep.', qtTot: 104025, vols: null, dtIncSLA: '2026-01-14T10:27:00', transportadora: 'JAMEF', destinatario: 'CD Vitória' },
  { noDP: 178633, cliente: 'ZAKAT DISTRIBUIDORA ATACADO (ES)', sitFase: 'A Sep.', qtTot: 574, vols: 2, dtIncSLA: '2026-03-13T11:26:00', transportadora: 'BRASPRESS' },
  { noDP: 181511, cliente: 'QUMORY DISTRIBUIDORA (ECOMMERCE)', sitFase: 'Em Digit.', qtTot: 1, vols: null, dtIncSLA: '2026-03-17T09:47:00', transportadora: 'CORREIOS' },
  { noDP: 145503, cliente: 'QUMORY DISTRIBUIDORA (ECOMMERCE)', sitFase: 'Sep. Conf.', qtTot: 3, vols: 1, dtIncSLA: '2026-01-27T10:24:00', transportadora: 'JADLOG' },
  { noDP: 184001, cliente: 'BEAUTY HUB ATACADO (ES)', sitFase: 'Sep. Ok', qtTot: 120, vols: 8, dtIncSLA: '2026-04-10T08:00:00', transportadora: 'BRASPRESS' },
  { noDP: 184200, cliente: 'APICE ATACADO ES (01)', sitFase: 'Em Cko.', qtTot: 350, vols: 20, dtIncSLA: '2026-04-08T14:00:00', transportadora: 'JAMEF' },
  { noDP: 184300, cliente: 'BEAUTY HUB ATACADO (ES)', sitFase: 'Cko. Ok', qtTot: 90, vols: 12, dtIncSLA: '2026-04-15T09:00:00', transportadora: 'TOTAL EXPRESS' },
  { noDP: 184400, cliente: 'APICE ATACADO ES (01)', sitFase: 'CkoVol. Ok', qtTot: 81, vols: 5, dtIncSLA: '2026-04-09T10:00:00', transportadora: 'JADLOG' },
  { noDP: 184500, cliente: 'PROTEÇÃO SOLAR DO BRASIL', sitFase: 'N.F. Conf.', qtTot: 200, vols: 15, dtIncSLA: '2026-04-14T11:00:00', transportadora: 'JAMEF' },
];

// Bigger demo set for richer preview (extends mock)
export function generateExtendedMock(): WduOrder[] {
  const clientes = [
    'ZAKAT DISTRIBUIDORA ATACADO (ES)',
    'QUMORY DISTRIBUIDORA (ECOMMERCE)',
    'BEAUTY HUB ATACADO (ES)',
    'APICE ATACADO ES (01)',
    'PROTEÇÃO SOLAR DO BRASIL',
    'NUTRA SAÚDE LTDA',
    'FARMA EXPRESS ES',
    'COSMETIC PRO BR',
  ];
  const transportadoras = ['JAMEF', 'BRASPRESS', 'CORREIOS', 'JADLOG', 'TOTAL EXPRESS', 'TRANSEUROPA'];
  const fases: WduPhase[] = WDU_PHASE_ORDER;
  const out: WduOrder[] = [...MOCK_WDU];
  let dp = 200000;
  const now = new Date();
  for (let i = 0; i < 1064; i++) {
    const fase = fases[Math.floor(Math.random() * fases.length)];
    const offsetDays = Math.floor(Math.random() * 30);
    const d = new Date(now);
    d.setDate(d.getDate() - offsetDays);
    d.setHours(8 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0);
    out.push({
      noDP: dp++,
      cliente: clientes[Math.floor(Math.random() * clientes.length)],
      sitFase: fase,
      qtTot: Math.floor(Math.random() * 800) + 1,
      vols: Math.random() > 0.4 ? Math.floor(Math.random() * 30) + 1 : null,
      dtIncSLA: d.toISOString(),
      transportadora: transportadoras[Math.floor(Math.random() * transportadoras.length)],
    });
  }
  return out;
}

// ============== Excel parsing ==============
const HEADER_KEYS: Record<keyof WduOrder, string[]> = {
  noDP: ['no. d.p.', 'no d.p.', 'no. dp', 'no dp', 'd.p.', 'dp'],
  cliente: ['cliente'],
  obsResumida: ['obs. resumida', 'obs resumida', 'obs'],
  noPedCli: ['no. ped. cli.', 'no ped cli', 'pedido cliente', 'no.ped.cli'],
  sku: ['sku'],
  qtTot: ['qt. tot.', 'qt tot', 'qt.tot', 'quantidade', 'qtd'],
  dtIncSLA: ['dt. incl. sla', 'dt incl sla', 'dt.incl.sla', 'dt inc sla', 'dt. inc. sla'],
  sitFase: ['sit. fase', 'sit fase', 'situação fase', 'situacao fase', 'fase'],
  pctSep: ['% sep'],
  pctCko: ['% cko'],
  pctVol: ['% vol'],
  noNF: ['no. n.f.', 'no nf', 'nf'],
  vols: ['vols.', 'vols', 'volumes'],
  dtConfSep: ['dt. conf. sep.', 'dt conf sep', 'dt.conf.sep', 'data conf sep'],
  dtConfNF: ['dt. conf. n.f.', 'dt conf nf', 'dt.conf.nf'],
  transportadora: ['transportadora'],
  destinatario: ['destinatário', 'destinatario'],
  doca: ['doca'],
  prior: ['prior.', 'prior', 'prioridade'],
};

function normalize(s: string): string {
  return s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function findColumn(headers: string[], candidates: string[]): string | null {
  const norm = headers.map(normalize);
  for (const c of candidates) {
    const nc = normalize(c);
    const idx = norm.findIndex(h => h === nc);
    if (idx >= 0) return headers[idx];
  }
  for (const c of candidates) {
    const nc = normalize(c);
    const idx = norm.findIndex(h => h.includes(nc));
    if (idx >= 0) return headers[idx];
  }
  return null;
}

function parseDate(val: unknown): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString();
  const s = String(val).trim();
  // dd/mm/yyyy hh:mm
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s*(\d{1,2}):?(\d{2})?/);
  if (m) {
    const iso = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}T${(m[4] || '00').padStart(2, '0')}:${(m[5] || '00').padStart(2, '0')}:00`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString();
  return '';
}

/**
 * Parses raw rows. Header is at row 7 (index 6). Caller must pass rows already
 * starting from header row. We use sheet_to_json with `range: 6` upstream.
 */
export function parseWduExcel(rows: Record<string, unknown>[]): WduOrder[] {
  if (!rows.length) return [];
  const headers = Object.keys(rows[0]);
  const map: Partial<Record<keyof WduOrder, string>> = {};
  for (const [field, candidates] of Object.entries(HEADER_KEYS)) {
    const col = findColumn(headers, candidates);
    if (col) map[field as keyof WduOrder] = col;
  }
  return rows
    .map((r, i) => {
      const get = (f: keyof WduOrder) => (map[f] ? r[map[f]!] : undefined);
      const fase = String(get('sitFase') || '').trim() as WduPhase;
      if (!fase) return null;
      const order: WduOrder = {
        noDP: Number(get('noDP')) || i + 1,
        cliente: String(get('cliente') || 'N/D'),
        obsResumida: get('obsResumida') ? String(get('obsResumida')) : undefined,
        noPedCli: get('noPedCli') ? String(get('noPedCli')) : undefined,
        sku: get('sku') ? String(get('sku')) : undefined,
        qtTot: Number(get('qtTot')) || 0,
        dtIncSLA: parseDate(get('dtIncSLA')) || new Date().toISOString(),
        sitFase: fase,
        pctSep: get('pctSep') !== undefined ? Number(get('pctSep')) : undefined,
        pctCko: get('pctCko') !== undefined ? Number(get('pctCko')) : undefined,
        pctVol: get('pctVol') !== undefined ? Number(get('pctVol')) : undefined,
        noNF: get('noNF') ? String(get('noNF')) : undefined,
        vols: get('vols') !== undefined && get('vols') !== null && get('vols') !== '' ? Number(get('vols')) : null,
        dtConfSep: parseDate(get('dtConfSep')) || undefined,
        dtConfNF: parseDate(get('dtConfNF')) || undefined,
        transportadora: get('transportadora') ? String(get('transportadora')) : undefined,
        destinatario: get('destinatario') ? String(get('destinatario')) : undefined,
        doca: get('doca') ? String(get('doca')) : undefined,
        prior: get('prior') ? String(get('prior')) : undefined,
      };
      return order;
    })
    .filter((o): o is WduOrder => o !== null);
}

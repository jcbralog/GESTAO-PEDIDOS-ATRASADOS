// Demo data generator for logistics dashboard

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
    });
  }
  return orders.sort((a, b) => b.date.localeCompare(a.date));
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

import { LineItem } from '@/types/quote';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function calculateTotals(lineItems: LineItem[]) {
  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const hst = subtotal * 0.13;
  const total = subtotal + hst;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    hst: Math.round(hst * 100) / 100,
    total: Math.round(total * 100) / 100,
    commission_10: Math.round(subtotal * 0.15 * 100) / 100,
    commission_12: Math.round(subtotal * 0.15 * 100) / 100,
  };
}

export function generateQuoteNumber(lastNumber: string | null): string {
  if (!lastNumber) return 'MK-001';
  const match = lastNumber.match(/MK-(\d+)/);
  if (!match) return 'MK-001';
  return `MK-${String(parseInt(match[1], 10) + 1).padStart(3, '0')}`;
}

export function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

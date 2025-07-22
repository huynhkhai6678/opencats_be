import * as moment from 'moment'; 

export function toStringSafe(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (value instanceof Date) return value.toISOString();
  return '';
}

export function formatDate(date: Date): string {
  return moment(date).format('DD/MM/YYYY (hh:mm A)');
}

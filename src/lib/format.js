import data from '../data.js';

export const RISK_FLOOR = 35;

export const int = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
export const dec1 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const pct = new Intl.NumberFormat('tr-TR', {
  style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1
});
const moneyFmt = new Intl.NumberFormat('tr-TR', {
  style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0
});

const MINUS = '\u2212';
const DASH = '\u2014';
export const money = (value) => moneyFmt.format(value);
export const fmtWeight = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return DASH;
  return `${Number.isInteger(value) ? int.format(value) : dec1.format(value)} kg`;
};
export const signedInt = (value) => (value > 0 ? '+' : value < 0 ? MINUS : '') + int.format(Math.abs(value));
export const signedMoney = (value) => (value > 0 ? '+' : value < 0 ? MINUS : '') + money(Math.abs(value));

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export const dateOf = (iso) => {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day, 12);
};

export const fmtDay = (iso) => {
  const date = dateOf(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
};

export const fmtNextRoast = (iso) => {
  const [dayPart, timePart] = iso.split('T');
  const date = dateOf(dayPart);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${DAYS[date.getDay()]}, ${timePart.slice(0, 5)}`;
};

export const fold = (value) => String(value)
  .toLocaleLowerCase('tr-TR')
  .replace(/ı/g, 'i')
  .replace(/ş/g, 's')
  .replace(/ğ/g, 'g')
  .replace(/ç/g, 'c')
  .replace(/ö/g, 'o')
  .replace(/ü/g, 'u')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

export const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2)
  .map((part) => part.charAt(0)).join('').toLocaleUpperCase('tr-TR');

export const riskLevel = (risk) => {
  if (risk >= 60) return { level: 'high', label: 'Yüksek risk', pill: 'negative' };
  if (risk >= RISK_FLOOR) return { level: 'watch', label: 'İzlemede', pill: 'neutral' };
  return { level: 'healthy', label: 'Sağlıklı', pill: 'positive' };
};

const daysSince = (iso) => Math.round((dateOf(data.snapshot.date) - dateOf(iso)) / 86400000);

export const fmtAgo = (iso) => {
  const days = daysSince(iso);
  if (days <= 0) return 'bugün';
  if (days === 1) return 'dün';
  return `${int.format(days)} gün önce`;
};

export const genericMessage = (customer) => {
  const first = customer.name.split(' ')[0];
  return `Merhaba ${first}, Kavurma’daki ${customer.plan} aboneliğin için kısa bir not bırakmak istedim. Son kutunun senin için nasıl gittiğini merak ediyorum; bir sonraki kavurmayı birlikte planlayabiliriz. - Elif`;
};

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const buildCsv = () => {
  const rows = [['Hafta', 'Katılan', 'Ayrılan', 'Net']];
  data.weeks.forEach((week) => rows.push([week.start, week.joined, week.cancelled, week.joined - week.cancelled]));
  rows.push([]);
  rows.push(['Abone', 'Plan', 'Üyelik (ay)', 'Son kutu', 'Risk', 'Sinyal']);
  data.customers.forEach((customer) => rows.push([
    customer.name, customer.plan, customer.months, customer.lastBox, customer.risk, customer.signal
  ]));
  return '\uFEFF' + rows.map((row) => row.map(csvCell).join(';')).join('\r\n');
};

export const downloadCsv = () => {
  const blob = new Blob([buildCsv()], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `kavurma-abone-akisi-${data.snapshot.date}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    field.remove();
    return copied;
  }
};

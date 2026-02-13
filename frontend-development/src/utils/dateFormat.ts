export type DateFormatLocale = 'id-ID' | 'en-US';

const DEFAULT_LOCALE: DateFormatLocale = 'id-ID';

function isValidDate(d: Date): boolean {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

/**
 * Safely parses common backend date shapes:
 * - YYYY-MM-DD
 * - ISO timestamps
 */
export function parseDateLoose(value?: string | null): Date | null {
  if (!value) return null;

  // 가장 common for date inputs / API.
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  // Prefer parsing YYYY-MM-DD as local date (avoid timezone shifting).
  const m = /^\d{4}-\d{2}-\d{2}$/.exec(trimmed);
  if (m) {
    const [y, mo, d] = trimmed.split('-').map((n) => Number(n));
    const date = new Date(y, mo - 1, d);
    return isValidDate(date) ? date : null;
  }

  const date = new Date(trimmed);
  return isValidDate(date) ? date : null;
}

/**
 * Formats a date to Indonesian long date, e.g. "29 Desember 2024".
 */
export function formatIndonesianLongDate(value?: string | null): string {
  const date = parseDateLoose(value);
  if (!date) return '';

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats a datetime to Indonesian long date time, e.g. "05 Januari 2026 23.10".
 * Accepts ISO timestamps from backend like "2026-01-05T16:48:12.000Z".
 */
export function formatIndonesianLongDateTime(value?: string | null): string {
  const date = parseDateLoose(value);
  if (!date) return '';

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    // Some environments insert comma between date and time; normalize.
    .format(date)
    .replace(',', '');
}

/**
 * Formats a campaign period:
 * - With end: "29 Desember 2024 - 2 Januari 2025"
 * - No end/present: "29 Desember 2024 - selesai"
 */
export function formatCampaignPeriod(params: {
  start?: string | null;
  end?: string | null;
  presentLabel?: string;
}): string {
  const { start, end, presentLabel = 'selesai' } = params;

  const startLabel = formatIndonesianLongDate(start);
  if (!startLabel) return '';

  const endLabel = formatIndonesianLongDate(end);
  return `${startLabel} - ${endLabel || presentLabel}`;
}

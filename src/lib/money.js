// Formatting helper. Uses native Intl when possible, falls back to symbol+number.

const SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£',
  INR: '₹', BDT: '৳', PKR: '₨', LKR: '₨', NPR: '₨', BTN: 'Nu',
  AED: 'د.إ', SAR: 'ر.س', QAR: 'ر.ق', KWD: 'د.ك', BHD: '.د.ب', OMR: 'ر.ع.', JOD: 'د.ا',
  ILS: '₪', TRY: '₺',
  CNY: '¥', HKD: 'HK$', MOP: 'MOP$', TWD: 'NT$', JPY: '¥', KRW: '₩',
  SGD: 'S$', MYR: 'RM', IDR: 'Rp', THB: '฿', VND: '₫', PHP: '₱',
  CAD: 'CA$', MXN: 'MX$', BRL: 'R$', ARS: 'AR$', CLP: 'CL$', COP: 'CO$', PEN: 'S/.',
  AUD: 'A$', NZD: 'NZ$', FJD: 'FJ$',
  ZAR: 'R', NGN: '₦', KES: 'KSh', GHS: '₵', EGP: 'E£', MAD: 'DH',
  CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', RON: 'lei',
  RUB: '₽', UAH: '₴',
};

export function currencySymbol(code) {
  if (!code) return '$';
  return SYMBOLS[code.toUpperCase()] || code.toUpperCase() + ' ';
}

export function formatMoney(amount, currency = 'USD', opts = {}) {
  const code = (currency || 'USD').toUpperCase();
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';

  // Try native Intl first — gives correct decimal handling per currency (e.g. JPY has 0 decimals).
  try {
    return new Intl.NumberFormat(opts.locale || undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: opts.maxDecimals,
      minimumFractionDigits: opts.minDecimals,
    }).format(n);
  } catch {
    // Unknown currency — fall back to symbol + 2dp.
    return `${currencySymbol(code)}${n.toFixed(2)}`;
  }
}

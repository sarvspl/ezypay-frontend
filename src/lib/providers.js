/**
 * Catalog of supported wallet/banking providers.
 * Add an entry here and the dashboard picks it up automatically.
 */
export const PROVIDERS = {
  // Mobile wallets (Bangladesh / South Asia)
  bkash:   { id: 'bkash',   name: 'bKash',   initials: 'bK', bg: 'bg-pink-500',    variants: ['personal', 'agent'] },
  nagad:   { id: 'nagad',   name: 'Nagad',   initials: 'Na', bg: 'bg-orange-500',  variants: ['personal', 'agent'] },
  rocket:  { id: 'rocket',  name: 'Rocket',  initials: 'Ro', bg: 'bg-purple-500',  variants: ['personal', 'agent'] },

  // UPI (India). One provider with app-flavour variants.
  upi:     { id: 'upi',     name: 'UPI',     initials: 'UP', bg: 'bg-emerald-600', variants: ['gpay', 'phonepe', 'paytm', 'other'] },
};

export const PROVIDER_CATEGORIES = [
  { id: 'mobile', label: 'Mobile Wallets',     providers: ['bkash', 'nagad', 'rocket'] },
  { id: 'upi',    label: 'UPI / Bank Transfer', providers: ['upi'] },
];

export function getProvider(id) {
  return PROVIDERS[id] || { id, name: id, initials: id.slice(0, 2).toUpperCase(), bg: 'bg-slate-500', variants: [] };
}

const VARIANT_LABELS = {
  personal: 'Personal',
  agent:    'Agent',
  gpay:     'Google Pay',
  phonepe:  'PhonePe',
  paytm:    'Paytm',
  other:    'Other UPI',
};

export function labelVariant(v) {
  if (!v) return '';
  return VARIANT_LABELS[v] || (v.charAt(0).toUpperCase() + v.slice(1));
}

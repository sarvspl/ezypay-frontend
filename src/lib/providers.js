/**
 * Catalog of supported wallet/banking providers.
 * Add an entry here and the dashboard picks it up automatically.
 */
export const PROVIDERS = {
  bkash:   { id: 'bkash',   name: 'bKash',   initials: 'bK', bg: 'bg-pink-500',    variants: ['personal', 'agent'] },
  nagad:   { id: 'nagad',   name: 'Nagad',   initials: 'Na', bg: 'bg-orange-500',  variants: ['personal', 'agent'] },
  rocket:  { id: 'rocket',  name: 'Rocket',  initials: 'Ro', bg: 'bg-purple-500',  variants: ['personal', 'agent'] },
};

export const PROVIDER_CATEGORIES = [
  { id: 'wallets', label: 'Wallets', providers: ['bkash', 'nagad', 'rocket'] },
];

export function getProvider(id) {
  return PROVIDERS[id] || { id, name: id, initials: id.slice(0, 2).toUpperCase(), bg: 'bg-slate-500', variants: [] };
}

const VARIANT_LABELS = {
  personal: 'Personal',
  agent:    'Agent',
};

export function labelVariant(v) {
  if (!v) return '';
  return VARIANT_LABELS[v] || (v.charAt(0).toUpperCase() + v.slice(1));
}

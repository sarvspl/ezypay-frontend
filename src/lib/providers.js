/**
 * Provider catalog helpers. The actual catalog is fetched from the backend
 * (`GET /api/providers`) — these helpers work on whatever list you pass in.
 *
 * `FALLBACK_PROVIDERS` is used only if the backend fetch hasn't completed yet
 * (preserves old behavior on initial render).
 */

export const COLOR_TO_BG = {
  pink:    'bg-pink-500',
  orange:  'bg-orange-500',
  purple:  'bg-purple-500',
  emerald: 'bg-emerald-500',
  blue:    'bg-blue-500',
  indigo:  'bg-indigo-500',
  red:     'bg-red-500',
  amber:   'bg-amber-500',
  teal:    'bg-teal-500',
  rose:    'bg-rose-500',
  slate:   'bg-slate-500',
};

export const FALLBACK_PROVIDERS = [
  { id: 'bkash',  name: 'bKash',  initials: 'bK', color: 'pink',   variants: ['personal', 'agent'] },
  { id: 'nagad',  name: 'Nagad',  initials: 'Na', color: 'orange', variants: ['personal', 'agent'] },
  { id: 'rocket', name: 'Rocket', initials: 'Ro', color: 'purple', variants: ['personal', 'agent'] },
];

/** Look up a provider in a given list (e.g. fetched from API) and return it with `bg` filled in.
 *  Falls back to a generic shape if not found. */
export function getProviderFromList(list, id) {
  const found = (list || FALLBACK_PROVIDERS).find((p) => p.id === id);
  if (found) {
    return { ...found, bg: COLOR_TO_BG[found.color] || 'bg-slate-500' };
  }
  return {
    id,
    name: id || 'Unknown',
    initials: (id || '??').slice(0, 2).toUpperCase(),
    color: 'slate',
    bg: 'bg-slate-500',
    variants: [],
  };
}

/** Convenience: id-only lookup using the static fallback catalog (works without fetching). */
export function getProvider(id) {
  return getProviderFromList(FALLBACK_PROVIDERS, id);
}

const VARIANT_LABELS = {
  personal: 'Personal',
  agent:    'Agent',
};

export function labelVariant(v) {
  if (!v) return '';
  if (VARIANT_LABELS[v]) return VARIANT_LABELS[v];
  // Title-case fallback: 'merchant' → 'Merchant', 'student_card' → 'Student Card'
  return String(v)
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

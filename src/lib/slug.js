export function slugifyUsername(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

export const USERNAME_RE = /^[a-z0-9_]{3,40}$/;

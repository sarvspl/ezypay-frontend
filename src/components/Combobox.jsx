'use client';

import { useEffect, useRef, useState } from 'react';

export default function Combobox({
  value,
  onChange,
  options,
  placeholder = 'Search…',
  className = '',
  name,
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const wrapRef = useRef(null);
  const listRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Reset highlight when filter changes
  useEffect(() => setHighlighted(0), [query, open]);

  // Keep highlighted option visible
  useEffect(() => {
    if (!open || !listRef.current) return;
    const node = listRef.current.children[highlighted];
    if (node && node.scrollIntoView) node.scrollIntoView({ block: 'nearest' });
  }, [highlighted, open]);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const select = (opt) => {
    onChange(opt);
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      e.preventDefault();
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setHighlighted((h) => Math.max(h - 1, 0));
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (filtered[highlighted]) select(filtered[highlighted]);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  // Display text: query when typing, otherwise the selected value
  const display = open ? query : value;

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={display}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onKeyDown={onKeyDown}
        className="input pr-9"
      />
      {/* Hidden field for native form submission / validation */}
      {name && (
        <input type="hidden" name={name} value={value || ''} required={required} />
      )}

      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">No results</li>
          ) : (
            filtered.map((opt, i) => (
              <li
                key={opt}
                role="option"
                aria-selected={opt === value}
                onMouseDown={(e) => { e.preventDefault(); select(opt); }}
                onMouseEnter={() => setHighlighted(i)}
                className={[
                  'px-3 py-2 text-sm cursor-pointer transition-colors',
                  i === highlighted ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50',
                  opt === value ? 'font-semibold' : '',
                ].join(' ')}
              >
                {opt}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

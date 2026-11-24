import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import data from '../data.js';
import { fold, int } from '../lib/format.js';

const MAX_QUERY = 80;

const matchesFor = (value) => {
  const needle = fold(value.trim());
  if (!needle) return [];
  return data.customers
    .filter((customer) => fold([
      customer.name, customer.id, customer.plan, customer.signal
    ].join(' ')).includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
};

export default function SubscriberSearch({
  onSelect,
  inputRef,
  placeholder = 'Abone ara',
  variant = 'toolbar'
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const rootRef = useRef(null);
  const fieldRef = useRef(null);
  const baseId = useId();
  const listId = `${baseId}-results`;
  const { pathname } = useLocation();

  const matches = useMemo(() => matchesFor(query), [query]);
  const expanded = open && query.trim().length > 0;
  const activeIndex = matches.length ? Math.min(active, matches.length - 1) : 0;
  const activeCustomer = matches[activeIndex] || null;

  const setField = (node) => {
    fieldRef.current = node;
    if (typeof inputRef === 'function') inputRef(node);
    else if (inputRef) inputRef.current = node;
  };

  useEffect(() => {
    setQuery('');
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!expanded || !activeCustomer) return;
    document.getElementById(`${listId}-${activeCustomer.id}`)?.scrollIntoView({ block: 'nearest' });
  }, [expanded, activeCustomer, listId]);

  const choose = (customer) => {
    setQuery('');
    setOpen(false);
    onSelect?.(customer.id, fieldRef.current);
  };

  const clear = () => {
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      clear();
      event.currentTarget.blur();
      return;
    }
    if (event.key === 'Enter') {
      if (!expanded || !activeCustomer) return;
      event.preventDefault();
      choose(activeCustomer);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!matches.length) return;
      if (!expanded) {
        setOpen(true);
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((current) => (current + step + matches.length) % matches.length);
      return;
    }
    if (event.key === 'Home' && expanded && matches.length) {
      event.preventDefault();
      setActive(0);
      return;
    }
    if (event.key === 'End' && expanded && matches.length) {
      event.preventDefault();
      setActive(matches.length - 1);
    }
  };

  return (
    <div className={variant === 'topbar' ? 'search' : 'field-search'} role="search" ref={rootRef}>
      <label className="sr-only" htmlFor={`${listId}-input`}>Abone ara</label>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <circle cx="7" cy="7" r="4.5" />
        <path d="m10.5 10.5 3 3" />
      </svg>
      <input
        id={`${listId}-input`}
        ref={setField}
        type="search"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={expanded && activeCustomer ? `${listId}-${activeCustomer.id}` : undefined}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
        data-search-input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value.slice(0, MAX_QUERY));
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => {
          if (query.trim()) setOpen(true);
        }}
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget)) setOpen(false);
        }}
        onKeyDown={onKeyDown}
      />
      {variant === 'topbar' && <kbd aria-hidden="true">/</kbd>}

      {expanded && (
        <div className="search-suggest">
          <ul id={listId} role="listbox" aria-label="Abone sonuçları" className="suggest-list">
            {matches.length === 0 ? (
              <li className="suggest-empty" role="presentation">Eşleşen abone yok.</li>
            ) : matches.map((customer, index) => (
              <li
                key={customer.id}
                id={`${listId}-${customer.id}`}
                role="option"
                aria-selected={index === activeIndex}
                className="suggest-option"
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(customer)}
              >
                <span className="suggest-name">{customer.name}</span>
                <span className="suggest-risk" aria-label={`Risk ${int.format(customer.risk)}`}>{int.format(customer.risk)}</span>
                <span className="suggest-meta">
                  <span className="suggest-id">{customer.id}</span>
                  <span> · {customer.plan}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="suggest-foot">
            <span>{matches.length === 0 ? 'Sonuç yok' : `${int.format(matches.length)} abone`}</span>
            <span>↑↓ gez · ↵ aç</span>
          </p>
        </div>
      )}
    </div>
  );
}

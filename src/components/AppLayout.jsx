import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import data from '../data.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { downloadCsv, initials } from '../lib/format.js';
import BrandMark from './BrandMark.jsx';
import MessageDialog from './MessageDialog.jsx';
import SubscriberDrawer from './SubscriberDrawer.jsx';
import ActionDialog from './ActionDialog.jsx';

const PAGE_META = {
  '/genel-bakis': { nav: 'overview', crumb: 'Genel bakış', title: 'Kavurma · Abonelik sağlığı' },
  '/aboneler': { nav: 'subscribers', crumb: 'Aboneler', title: 'Kavurma · Aboneler' },
  '/aksiyonlar': { nav: 'actions', crumb: 'Aksiyonlar', title: 'Kavurma · Aksiyonlar' },
  '/partiler': { nav: 'batches', crumb: 'Kavurma partileri', title: 'Kavurma · Kavurma partileri' }
};

const NAV_ITEMS = [
  {
    key: 'overview',
    to: '/genel-bakis',
    label: 'Genel bakış',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="5.5" height="5.5" rx="1" />
        <rect x="11.5" y="3" width="5.5" height="5.5" rx="1" />
        <rect x="3" y="11.5" width="5.5" height="5.5" rx="1" />
        <rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1" />
      </svg>
    )
  },
  {
    key: 'subscribers',
    to: '/aboneler',
    label: 'Aboneler',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="8" cy="7" r="2.6" />
        <path d="M3.4 16c.5-2.6 2.4-4.1 4.6-4.1s4.1 1.5 4.6 4.1" />
        <path d="M13.1 4.7a2.6 2.6 0 0 1 0 4.8M14.8 12.2c1.2.5 2.1 1.8 2.4 3.8" />
      </svg>
    )
  },
  {
    key: 'actions',
    to: '/aksiyonlar',
    label: 'Aksiyonlar',
    actorOnly: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 6.5h12M4 10h8M4 13.5h5" />
        <circle cx="15" cy="13.5" r="2.5" />
      </svg>
    )
  },
  {
    key: 'batches',
    to: '/partiler',
    label: 'Kavurma partileri',
    group: 'Üretim',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.5 7.5 10 4l5.5 3.5v5L10 16l-5.5-3.5v-5Z" />
        <path d="M4.5 7.5 10 11l5.5-3.5M10 11v5" />
      </svg>
    )
  }
];

const customerById = new Map(data.customers.map((customer) => [customer.id, customer]));

export default function AppLayout() {
  const { session, canAct, signOut } = useAuth();
  const showToast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [actions, setActions] = useState(() => data.actions.map((item) => ({ ...item })));
  const [messageId, setMessageId] = useState(null);
  const [drawerId, setDrawerId] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [globalQ, setGlobalQ] = useState('');

  const overlayReturn = useRef(null);
  const sidebarRef = useRef(null);
  const menuToggleRef = useRef(null);
  const menuCloseRef = useRef(null);

  const pathKey = location.pathname.replace(/\/+$/, '') || '/';
  const meta = PAGE_META[pathKey] || PAGE_META['/genel-bakis'];
  const onSubscribers = pathKey === '/aboneler';
  const searchParams = new URLSearchParams(location.search);
  const searchValue = onSubscribers ? (searchParams.get('q') || '') : globalQ;

  useEffect(() => {
    document.title = meta.title;
  }, [meta.title]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
    const heading = document.querySelector('#main h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }, [location.pathname]);

  useEffect(() => {
    setGlobalQ('');
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-locked');
      menuCloseRef.current?.focus();
    } else {
      document.body.classList.remove('menu-locked');
    }
    return () => document.body.classList.remove('menu-locked');
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        menuToggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !sidebarRef.current) return;
      const focusable = [...sidebarRef.current.querySelectorAll('a[href], button:not([disabled])')]
        .filter((node) => node.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target.matches('input, textarea, select, [contenteditable="true"]')) return;
      if (document.querySelector('dialog[open]')) return;
      const visible = [...document.querySelectorAll('[data-search-input]')]
        .find((node) => node.offsetParent !== null);
      if (visible) {
        event.preventDefault();
        visible.focus();
        visible.select();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const closeMenu = (restoreFocus = true) => {
    setMenuOpen(false);
    if (restoreFocus) requestAnimationFrame(() => menuToggleRef.current?.focus());
  };

  const openMenu = () => {
    if (window.matchMedia('(min-width: 861px)').matches) return;
    setMenuOpen(true);
  };

  const rememberReturn = (returnTo) => {
    const target = returnTo || (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    if (target) overlayReturn.current = target;
  };

  const restoreReturn = () => {
    const target = overlayReturn.current;
    overlayReturn.current = null;
    requestAnimationFrame(() => {
      if (target && document.contains(target) && target.offsetParent !== null) target.focus();
    });
  };

  const openMessage = (id, returnTo) => {
    if (!messageId && !drawerId && !actionId) rememberReturn(returnTo);
    setMessageId(id);
  };

  const openDrawer = (id, returnTo) => {
    if (!messageId && !drawerId && !actionId) rememberReturn(returnTo);
    setDrawerId(id);
  };

  const openAction = (id, returnTo) => {
    if (!messageId && !drawerId && !actionId) rememberReturn(returnTo);
    setActionId(id);
  };

  const closeMessage = () => {
    setMessageId(null);
    restoreReturn();
  };

  const closeDrawer = () => {
    setDrawerId(null);
    restoreReturn();
  };

  const closeAction = () => {
    setActionId(null);
    restoreReturn();
  };

  const handleDrawerMessage = (id) => {
    setDrawerId(null);
    openMessage(id);
  };

  const handleActionMessage = (id) => {
    setActionId(null);
    openMessage(id);
  };

  const saveAction = (type, note) => {
    setActions((rows) => rows.map((item) => (
      item.id === actionId ? { ...item, status: 'resolved', resolution: type, note } : item
    )));
    closeAction();
    showToast('Aksiyon çözüldü olarak kaydedildi.');
  };

  const reopenAction = (note) => {
    setActions((rows) => rows.map((item) => (
      item.id === actionId ? { ...item, status: 'pending', resolution: '', note } : item
    )));
    closeAction();
    showToast('Aksiyon yeniden açıldı.');
  };

  const updateSearch = (value) => {
    const clean = value.slice(0, 80);
    if (onSubscribers) {
      const next = new URLSearchParams(location.search);
      if (clean) next.set('q', clean);
      else next.delete('q');
      navigate(`/aboneler${next.toString() ? `?${next}` : ''}`, { replace: true });
    } else {
      setGlobalQ(clean);
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchValue.trim().slice(0, 80);
    if (onSubscribers) {
      updateSearch(query);
    } else {
      setGlobalQ(query);
      navigate(`/aboneler${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    }
  };

  const handleExport = () => {
    if (!canAct) return;
    downloadCsv();
    showToast('CSV indirildi.');
  };

  const handleSignOut = () => {
    setMessageId(null);
    setDrawerId(null);
    setActionId(null);
    setMenuOpen(false);
    signOut();
    navigate('/giris', { replace: true });
  };

  const messageCustomer = messageId ? customerById.get(messageId) : null;
  const drawerCustomer = drawerId ? customerById.get(drawerId) : null;
  const currentAction = actionId ? actions.find((item) => item.id === actionId) : null;
  const actionCustomer = currentAction ? customerById.get(currentAction.customerId) : null;
  const avatar = initials(session.name);

  return (
    <>
      <a className="skip-link" href="#main">İçeriğe geç</a>

      <div className="app">
        <aside className={`sidebar${menuOpen ? ' open' : ''}`} id="sidebar" aria-label="Ana gezinme" ref={sidebarRef}>
          <button
            className="sidebar-close"
            type="button"
            aria-label="Menüyü kapat"
            ref={menuCloseRef}
            onClick={() => closeMenu()}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" /></svg>
          </button>

          <div className="brand">
            <BrandMark />
            <div>
              <span className="brand-name">Kavurma</span>
              <span className="brand-scope">Kadıköy · İstanbul</span>
            </div>
          </div>

          <nav className="nav" aria-label="Bölümler">
            <p className="group-label">İzleme</p>
            {NAV_ITEMS.filter((item) => !item.actorOnly || canAct).map((item) => (
              <Fragment key={item.key}>
                {item.group && <p className="group-label">{item.group}</p>}
                <NavLink
                  className="nav-item"
                  to={item.to}
                  onClick={() => closeMenu(false)}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </Fragment>
            ))}
          </nav>

          <div className="sidebar-foot">
            <div className="user">
              <span className="avatar lg" aria-hidden="true">{avatar}</span>
              <div className="user-copy">
                <strong>{session.name}</strong>
                <span>{session.title}</span>
              </div>
            </div>
            <button className="signout" type="button" onClick={handleSignOut}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 6V4.5A1.5 1.5 0 0 0 10.5 3h-5A1.5 1.5 0 0 0 4 4.5v11A1.5 1.5 0 0 0 5.5 17h5a1.5 1.5 0 0 0 1.5-1.5V14" />
                <path d="M8.5 10h8M14 7.5l2.5 2.5-2.5 2.5" />
              </svg>
              Çıkış yap
            </button>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <button
              className="menu-toggle"
              type="button"
              aria-controls="sidebar"
              aria-expanded={menuOpen}
              aria-label="Menüyü aç"
              ref={menuToggleRef}
              onClick={openMenu}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M3 5.5h14M3 10h14M3 14.5h14" /></svg>
            </button>

            <Link className="mobile-brand" to="/genel-bakis" aria-label="Kavurma, genel bakışa dön">
              <BrandMark className="" />
              <span>Kavurma</span>
            </Link>

            <nav className="crumbs" aria-label="Konum">
              <span>Kavurma Roasters</span>
              <span className="sep" aria-hidden="true">/</span>
              <span className="current">{meta.crumb}</span>
            </nav>

            <form className="search" role="search" onSubmit={submitSearch}>
              <label className="sr-only" htmlFor="global-q">Abone ara</label>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>
              <input
                id="global-q"
                type="search"
                placeholder="Abone ara"
                autoComplete="off"
                spellCheck="false"
                data-search-input
                value={searchValue}
                onChange={(event) => updateSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    updateSearch('');
                    event.currentTarget.blur();
                  }
                }}
              />
              <kbd aria-hidden="true">/</kbd>
            </form>

            <div className="topbar-actions">
              {canAct && (
                <button className="btn export" type="button" data-export title="Haftalık akışı ve abone listesini CSV olarak indir" onClick={handleExport}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M8 2.5v7M5 7l3 3 3-3M2.5 11.5v1.2a.8.8 0 0 0 .8.8h9.4a.8.8 0 0 0 .8-.8v-1.2" />
                  </svg>
                  <span className="export-text">CSV indir</span>
                </button>
              )}
              <span className="avatar" role="img" aria-label={session.name}>{avatar}</span>
            </div>
          </header>

          <main className="sheet" id="main">
            <Outlet context={{ actions, openMessage, openDrawer, openAction, canAct }} />
          </main>
        </div>
      </div>

      {messageCustomer && (
        <MessageDialog customer={messageCustomer} onClose={closeMessage} />
      )}

      {drawerCustomer && (
        <SubscriberDrawer
          customer={drawerCustomer}
          canAct={canAct}
          onClose={closeDrawer}
          onMessage={handleDrawerMessage}
        />
      )}

      {currentAction && actionCustomer && (
        <ActionDialog
          action={currentAction}
          customer={actionCustomer}
          onClose={closeAction}
          onSave={saveAction}
          onReopen={reopenAction}
          onMessage={handleActionMessage}
        />
      )}
    </>
  );
}

/* Kavurma - subscription health demo.
   Static data in assets/data.js; charts in assets/charts.js. No dependencies,
   no build step, no network calls. */
(() => {
  'use strict';

  const D = window.KAVURMA;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const RISK_FLOOR = 35;

  const int = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
  const dec1 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const pct = new Intl.NumberFormat('tr-TR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const moneyFmt = new Intl.NumberFormat('tr-TR', {
    style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0
  });
  const MINUS = '\u2212';

  const money = (value) => moneyFmt.format(value);
  const signedInt = (value) => (value > 0 ? '+' : value < 0 ? MINUS : '') + int.format(Math.abs(value));
  const signedMoney = (value) => (value > 0 ? '+' : value < 0 ? MINUS : '') + money(Math.abs(value));
  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
  ));

  const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const dateOf = (iso) => {
    const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day, 12);
  };
  const fmtDay = (iso) => {
    const date = dateOf(iso);
    return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  };
  const fmtNextRoast = (iso) => {
    const [dayPart, timePart] = iso.split('T');
    const date = dateOf(dayPart);
    return `${date.getDate()} ${MONTHS[date.getMonth()]} ${DAYS[date.getDay()]}, ${timePart.slice(0, 5)}`;
  };

  const fold = (value) => String(value)
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!D) return;

  /* ---------- static facts, computed once ---------- */
  const totals = D.totals;
  const mrrDelta = D.snapshot.mrr - D.snapshot.priorMrr;
  const churnNow = Math.round(totals.churn * 1000) / 10;
  const churnPrior = Math.round(totals.priorChurn * 1000) / 10;
  const churnDelta = Math.round((churnNow - churnPrior) * 10) / 10;
  const riskCustomers = D.customers.filter((customer) => customer.risk >= RISK_FLOOR);
  const healthyCustomers = D.customers.filter((customer) => customer.risk < RISK_FLOOR);

  $('#finding').innerHTML = (() => {
    const last4 = D.weeks.slice(-4).map((week) => week.cancelled);
    return `Büyüme sürüyor; iptaller son dört haftada <strong>${int.format(last4[0])}</strong>’dan <strong>${int.format(last4[last4.length - 1])}</strong>’e çıktı.`;
  })();
  $('#stamp').textContent = `${fmtDay(D.snapshot.date)} ${dateOf(D.snapshot.date).getFullYear()}, ${D.snapshot.time} itibarıyla`;
  $$('[data-risk-count]').forEach((node) => { node.textContent = int.format(riskCustomers.length); });

  $('#kpi-mrr').textContent = money(D.snapshot.mrr);
  $('#kpi-mrr-delta').innerHTML = `<span class="${mrrDelta >= 0 ? 'pos' : 'neg'}">${signedMoney(mrrDelta)}</span> <span class="baseline">son 4 hafta</span>`;

  $('#kpi-active').textContent = int.format(D.snapshot.activeSubscribers);
  $('#kpi-active-delta').innerHTML = `<span class="${totals.last4.net >= 0 ? 'pos' : 'neg'}">${signedInt(totals.last4.net)}</span> <span class="baseline">son 4 hafta</span>`;

  $('#kpi-new').textContent = int.format(totals.last4.joined);
  $('#kpi-new-delta').innerHTML = `<span class="${totals.last4.joined - totals.prior4.joined >= 0 ? 'pos' : 'neg'}">${signedInt(totals.last4.joined - totals.prior4.joined)}</span> <span class="baseline">son 4 hafta</span>`;

  $('#kpi-churn').textContent = pct.format(totals.churn);
  const churnWord = churnDelta === 0 ? 'değişmedi' : `${dec1.format(Math.abs(churnDelta))} puan ${churnDelta > 0 ? 'arttı' : 'azaldı'}`;
  $('#kpi-churn-delta').innerHTML = `<span class="${churnDelta > 0 ? 'neg' : churnDelta < 0 ? 'pos' : ''}">${churnWord}</span> <span class="sep" aria-hidden="true">·</span> <span class="baseline">önceki 4 hafta ${pct.format(totals.priorChurn)}</span>`;

  /* ---------- subscribers in view ---------- */
  const state = { filter: 'all', q: '', sort: 'risk', dir: 'desc' };

  const SORTERS = {
    name: (a, b) => a.name.localeCompare(b.name, 'tr'),
    plan: (a, b) => a.plan.localeCompare(b.plan, 'tr'),
    months: (a, b) => a.months - b.months,
    lastBox: (a, b) => a.lastBox.localeCompare(b.lastBox),
    signal: (a, b) => a.signal.localeCompare(b.signal, 'tr'),
    risk: (a, b) => a.risk - b.risk
  };

  const filteredCustomers = () => {
    let rows = D.customers.slice();
    if (state.filter === 'risk') rows = rows.filter((customer) => customer.risk >= RISK_FLOOR);
    if (state.filter === 'healthy') rows = rows.filter((customer) => customer.risk < RISK_FLOOR);
    if (state.q) {
      const needle = fold(state.q);
      rows = rows.filter((customer) => fold([
        customer.name, customer.id, customer.plan, customer.signal
      ].join(' ')).includes(needle));
    }
    const sorter = SORTERS[state.sort] || SORTERS.risk;
    const direction = state.dir === 'asc' ? 1 : -1;
    rows.sort((a, b) => direction * sorter(a, b) || a.name.localeCompare(b.name, 'tr'));
    return rows;
  };

  const messageButton = (customer) =>
    `<button class="row-action" type="button" data-message="${esc(customer.id)}" aria-label="${esc(customer.name)} için mesaj hazırla">Mesaj</button>`;

  // The name is a real button so the drawer opens from the keyboard; the row
  // itself is clickable too, for the rest of the line.
  const openButton = (customer, inner) =>
    `<button class="row-open" type="button" data-open="${esc(customer.id)}" aria-label="${esc(customer.name)} abone detayını aç">${inner}</button>`;

  const renderSubs = () => {
    const rows = filteredCustomers();
    const counts = { all: D.customers.length, risk: riskCustomers.length, healthy: healthyCustomers.length };

    $$('.chip').forEach((chip) => {
      const filter = chip.dataset.filter;
      chip.setAttribute('aria-pressed', String(filter === state.filter));
      const count = $('.count', chip);
      if (count) count.textContent = int.format(counts[filter]);
    });

    $('#sub-count').textContent = `${int.format(rows.length)} abone`;

    $$('.th-sort').forEach((button) => {
      const active = button.dataset.sortKey === state.sort;
      button.closest('th').setAttribute('aria-sort', active ? (state.dir === 'asc' ? 'ascending' : 'descending') : 'none');
    });
    $('#sub-sort').value = state.sort;

    $('#subs-body').innerHTML = rows.map((customer) => `
      <tr data-open="${esc(customer.id)}">
        <td class="name-cell">
          ${openButton(customer, `<span class="name">${esc(customer.name)}</span><span class="id">${esc(customer.id)}</span>`)}
        </td>
        <td>${esc(customer.plan)}</td>
        <td class="n tenure-col">${int.format(customer.months)} ay</td>
        <td class="n last-col">${fmtDay(customer.lastBox)}</td>
        <td class="signal-cell"><span title="${esc(customer.signal)}">${esc(customer.signal)}</span></td>
        <td class="n risk-cell">${int.format(customer.risk)}</td>
        <td class="action-cell">${messageButton(customer)}</td>
      </tr>
    `).join('');

    $('#subs-cards').innerHTML = rows.map((customer) => `
      <article class="sub-row" data-open="${esc(customer.id)}">
        <div class="sub-top">
          ${openButton(customer, `<span class="name">${esc(customer.name)}</span><span class="id">${esc(customer.id)}</span>`)}
          <span class="sub-risk" aria-label="Risk skoru ${int.format(customer.risk)}">${int.format(customer.risk)}</span>
        </div>
        <p class="sub-meta">${esc(customer.plan)} · ${int.format(customer.months)} ay · son kutu ${fmtDay(customer.lastBox)}</p>
        <div class="sub-bottom">
          <span class="signal">${esc(customer.signal)}</span>
          ${messageButton(customer)}
        </div>
      </article>
    `).join('');

    const empty = rows.length === 0;
    $('#subs-empty').hidden = !empty;
    $('.table-wrap').hidden = empty;
    $('#subs-cards').hidden = empty;
  };

  // Delegated once: buttons are re-rendered with the table and the cards.
  document.addEventListener('click', (event) => {
    const msgButton = event.target.closest('[data-message]');
    if (msgButton) {
      openMessage(msgButton.dataset.message);
      return;
    }
    const actionButton = event.target.closest('[data-action-modal]');
    if (actionButton) openActionModal(actionButton.dataset.actionModal, actionButton);
  });

  /* ---------- actions queue ---------- */
  const actionState = { category: 'all', status: 'all' };
  const customerById = new Map(D.customers.map((customer) => [customer.id, customer]));
  const actionRows = D.actions.map((item) => ({ ...item }));

  const filteredActions = () => {
    return actionRows.filter((item) => {
      if (actionState.category !== 'all' && item.category !== actionState.category) return false;
      if (actionState.status !== 'all' && item.status !== actionState.status) return false;
      return true;
    });
  };

  const actionStatusPill = (status) => status === 'resolved'
    ? '<span class="pill positive">Çözüldü</span>'
    : '<span class="pill neutral">Bekliyor</span>';

  const actionButtons = (item, customer) => `
    <span class="row-actions">
      <button class="row-action accent" type="button" data-action-modal="${esc(item.id)}">${item.status === 'resolved' ? 'Düzenle' : 'Telafi / Çöz'}</button>
      ${messageButton(customer)}
    </span>
  `;

  const renderActions = () => {
    const rows = filteredActions();
    const counts = {
      all: actionRows.length,
      teslimat: actionRows.filter((item) => item.category === 'teslimat').length,
      odeme: actionRows.filter((item) => item.category === 'odeme').length,
      'geri-kazanim': actionRows.filter((item) => item.category === 'geri-kazanim').length
    };
    const pendingTotal = actionRows.filter((item) => item.status === 'pending').length;

    $('#actions-pending-summary').textContent = `${int.format(pendingTotal)} bekleyen aksiyon`;
    $$('.action-chip').forEach((chip) => {
      const cat = chip.dataset.actionCat;
      chip.setAttribute('aria-pressed', String(cat === actionState.category));
      const count = $('.count', chip);
      if (count) count.textContent = int.format(counts[cat] ?? 0);
    });
    $('#action-status').value = actionState.status;
    $('#action-count').textContent = `${int.format(rows.length)} aksiyon`;

    $('#actions-body').innerHTML = rows.map((item) => {
      const customer = customerById.get(item.customerId);
      if (!customer) return '';
      const resolutionText = item.resolution
        ? `<span class="action-signal-sub">${esc(item.resolution)}${item.note ? ` · ${esc(item.note)}` : ''}</span>`
        : '';
      return `
        <tr data-open="${esc(customer.id)}">
          <td class="name-cell">
            ${openButton(customer, `<span class="name">${esc(customer.name)}</span><span class="id">${esc(item.id)} · ${esc(customer.plan)}</span>`)}
          </td>
          <td>${esc(item.categoryLabel)}</td>
          <td class="signal-cell"><span title="${esc(customer.signal)}">${esc(customer.signal)}</span>${resolutionText}</td>
          <td>${actionStatusPill(item.status)}</td>
          <td class="n">${fmtDay(item.due)}</td>
          <td class="action-cell">${actionButtons(item, customer)}</td>
        </tr>
      `;
    }).join('');

    $('#actions-cards').innerHTML = rows.map((item) => {
      const customer = customerById.get(item.customerId);
      if (!customer) return '';
      return `
        <article class="sub-row" data-open="${esc(customer.id)}">
          <div class="sub-top">
            ${openButton(customer, `<span class="name">${esc(customer.name)}</span><span class="id">${esc(item.id)} · ${esc(item.categoryLabel)}</span>`)}
            ${actionStatusPill(item.status)}
          </div>
          <p class="sub-meta">${esc(customer.plan)} · hedef ${fmtDay(item.due)}</p>
          <div class="sub-bottom">
            <span class="signal">${esc(item.resolution || customer.signal)}</span>
            ${actionButtons(item, customer)}
          </div>
        </article>
      `;
    }).join('');

    const empty = rows.length === 0;
    $('#actions-empty').hidden = !empty;
    $('#actions-table-wrap').hidden = empty;
    $('#actions-cards').hidden = empty;
  };

  /* ---------- plan mix ---------- */
  const planShares = D.plans.map((plan) => plan.subscribers / totals.totalSubs);
  const planColors = ['var(--accent)', 'var(--text)', 'var(--chart-muted)'];
  $('#plan-list').innerHTML = `
    <div class="plan-share" aria-hidden="true">
      ${D.plans.map((plan, index) => `<span style="width:${(planShares[index] * 100).toFixed(2)}%;background:${planColors[index]}"></span>`).join('')}
    </div>
    <div class="plan-legend">
      ${D.plans.map((plan, index) => `
        <div class="plan-row">
          <span class="plan-swatch" style="background:${planColors[index]}" aria-hidden="true"></span>
          <span class="plan-name">${esc(plan.name)}</span>
          <span class="plan-count">${int.format(plan.subscribers)} <small>abone</small></span>
          <span class="plan-percent">${pct.format(planShares[index])}</span>
        </div>
      `).join('')}
    </div>
  `;

  /* ---------- roast plan ---------- */
  const roastPct = Math.round(totals.boxesPct * 100);
  $('#roast-figure').innerHTML = `${int.format(D.roast.boxes)} <small>/ ${int.format(D.roast.capacity)} kutu</small>`;
  $('#roast-pct').textContent = `%${roastPct}`;
  $('#capacity-fill').style.width = `${Math.min(100, totals.boxesPct * 100).toFixed(1)}%`;
  $('#roast-note').textContent = `${int.format(D.roast.skipped)} abone bu haftayı atladı`;
  $('#roast-meta').textContent = fmtNextRoast(D.roast.nextRoast);

  /* ---------- risk preview ---------- */
  $('#risk-rows').innerHTML = riskCustomers.slice(0, 4).map((customer) => `
    <div class="risk-row" data-open="${esc(customer.id)}">
      <div class="who">
        ${openButton(customer, `<span class="name">${esc(customer.name)}</span><span class="sub">${esc(customer.plan)} · ${int.format(customer.months)} ay</span>`)}
      </div>
      <span class="signal" title="${esc(customer.signal)}">${esc(customer.signal)}</span>
      <span class="risk-rank">${int.format(customer.risk)}</span>
      ${messageButton(customer)}
    </div>
  `).join('');

  /* ---------- channels ---------- */
  const channelMax = Math.max(...D.channels.map((channel) => channel.value));
  $('#channel-list').innerHTML = D.channels.map((channel) => `
    <div class="channel-row">
      <div class="channel-line">
        <span class="channel-label">${esc(channel.label)}</span>
        <span class="channel-value">${int.format(channel.value)}</span>
      </div>
      <span class="channel-track" aria-hidden="true"><i style="width:${(channel.value / channelMax * 100).toFixed(1)}%"></i></span>
    </div>
  `).join('');

  /* ---------- flow chart ---------- */
  const chartEl = $('#flow-chart');
  let chartWindow = 8;

  const drawFlow = (size = chartWindow) => {
    chartWindow = size;
    try {
      const weeks = D.weeks.slice(-size);
      const joined = weeks.map((week) => week.joined);
      const cancelled = weeks.map((week) => week.cancelled);
      const net = joined.reduce((sum, value) => sum + value, 0) - cancelled.reduce((sum, value) => sum + value, 0);
      $('#flow-summary').innerHTML = `Son ${int.format(size)} haftada net <strong>${signedInt(net)}</strong> abone`;

      window.Charts.diverging(chartEl, {
        labels: weeks.map((week) => fmtDay(week.start)),
        up: joined,
        down: cancelled,
        above: 'Katılan',
        below: 'Ayrılan',
        height: 240,
        xAt: chartEl.clientWidth < 520
          ? (size === 4 ? [1, 2, 3] : size === 8 ? [2, 5, 7] : [3, 7, 10, 12])
          : null,
        format: (value) => int.format(value),
        tickFormat: (value) => int.format(value)
      });
    } catch (error) {
      console.error('Abone akışı çizilemedi:', error);
      chartEl.innerHTML = '<div class="empty-state"><strong>Grafik yüklenemedi.</strong><span>Veri dosyası okunamadı.</span><button class="row-action" type="button" data-retry-flow>Yeniden dene</button></div>';
    }
  };

  document.addEventListener('click', (event) => {
    const retry = event.target.closest('[data-retry-flow]');
    if (retry) drawFlow();
  });

  $$('[data-window]').forEach((button) => {
    button.addEventListener('click', () => {
      $$('[data-window]').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      drawFlow(Number(button.dataset.window));
    });
  });

  drawFlow(8);
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => drawFlow(chartWindow), 160);
  });

  /* ---------- router ---------- */
  const viewOverview = $('#view-overview');
  const viewSubs = $('#view-subscribers');
  const viewActions = $('#view-actions');
  const navLinks = $$('[data-nav]');
  const crumb = $('#crumb-current');
  const globalSearch = $('#global-q');
  const subSearch = $('#sub-q');
  const sidebar = $('#sidebar');
  const menuToggle = $('#menu-toggle');
  const menuClose = $('#sidebar-close');
  let menuOpen = false;
  let menuReturn = null;

  const parseHash = () => {
    const raw = location.hash.replace(/^#/, '') || 'genel-bakis';
    const [name, query = ''] = raw.split('?');
    return { name: name || 'genel-bakis', params: new URLSearchParams(query) };
  };

  const syncHash = () => {
    const params = new URLSearchParams();
    if (state.filter !== 'all') params.set('filter', state.filter);
    if (state.q) params.set('q', state.q);
    const next = `#aboneler${params.toString() ? `?${params}` : ''}`;
    try {
      history.replaceState(null, '', next);
    } catch {
      location.hash = next;
    }
  };

  const route = () => {
    const { name, params } = parseHash();
    const currentView = name === 'aboneler' ? 'subscribers' : name === 'aksiyonlar' ? 'actions' : 'overview';
    viewOverview.hidden = currentView !== 'overview';
    viewSubs.hidden = currentView !== 'subscribers';
    viewActions.hidden = currentView !== 'actions';

    navLinks.forEach((link) => {
      if (link.dataset.nav === currentView) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    const titles = {
      overview: ['Genel bakış', 'Kavurma · Abonelik sağlığı'],
      subscribers: ['Aboneler', 'Kavurma · Aboneler'],
      actions: ['Aksiyonlar', 'Kavurma · Aksiyonlar']
    };
    crumb.textContent = titles[currentView][0];
    document.title = titles[currentView][1];

    if (currentView === 'subscribers') {
      const filter = params.get('filter');
      state.filter = ['all', 'risk', 'healthy'].includes(filter) ? filter : 'all';
      state.q = (params.get('q') || '').slice(0, 80);
      if (document.activeElement !== globalSearch) globalSearch.value = state.q;
      if (document.activeElement !== subSearch) subSearch.value = state.q;
      renderSubs();
    } else if (currentView === 'actions') {
      if (document.activeElement !== globalSearch) globalSearch.value = '';
      renderActions();
    } else {
      if (document.activeElement !== globalSearch) globalSearch.value = '';
    }

    closeMenu(false);
    const activeView = currentView === 'subscribers' ? viewSubs : currentView === 'actions' ? viewActions : viewOverview;
    const heading = $('h1', activeView);
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      if (sidebar.contains(document.activeElement) || menuOpen) heading.focus({ preventScroll: true });
    }
    window.scrollTo(0, 0);
  };

  window.addEventListener('hashchange', route);

  const openMenu = () => {
    if (menuOpen || window.matchMedia('(min-width: 861px)').matches) return;
    menuOpen = true;
    menuReturn = document.activeElement;
    sidebar.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-locked');
    menuClose.focus();
    document.addEventListener('keydown', menuKeys);
  };

  function closeMenu(restoreFocus = true) {
    if (!menuOpen) return;
    menuOpen = false;
    sidebar.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-locked');
    document.removeEventListener('keydown', menuKeys);
    if (restoreFocus && menuReturn && document.contains(menuReturn)) menuReturn.focus();
  }

  function menuKeys(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = $$('a[href], button:not([disabled])', sidebar).filter((node) => node.offsetParent !== null);
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
  }

  menuToggle.addEventListener('click', openMenu);
  menuClose.addEventListener('click', () => closeMenu());
  $$('#sidebar a').forEach((link) => link.addEventListener('click', () => closeMenu(false)));
  window.matchMedia('(min-width: 861px)').addEventListener('change', (event) => {
    if (event.matches) {
      closeMenu(false);
      document.body.classList.remove('menu-locked');
    }
  });

  /* ---------- search ---------- */
  $('#global-search').addEventListener('submit', (event) => {
    event.preventDefault();
    const query = globalSearch.value.trim();
    const onSubs = !viewSubs.hidden;
    if (onSubs) {
      state.q = query.slice(0, 80);
      syncHash();
      renderSubs();
    } else {
      location.hash = `#aboneler${query ? `?q=${encodeURIComponent(query)}` : ''}`;
    }
  });

  globalSearch.addEventListener('input', () => {
    if (viewSubs.hidden) return;
    state.q = globalSearch.value.slice(0, 80);
    syncHash();
    renderSubs();
  });

  subSearch.addEventListener('input', () => {
    state.q = subSearch.value.slice(0, 80);
    syncHash();
    renderSubs();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (target.matches('input, textarea, select, [contenteditable="true"]')) return;
    if ($('#message-dialog').open || $('#subscriber-drawer').open || $('#action-dialog').open) return;
    const visible = globalSearch.offsetParent !== null ? globalSearch : (subSearch.offsetParent !== null ? subSearch : null);
    if (visible) {
      event.preventDefault();
      visible.focus();
      visible.select();
    }
  });

  globalSearch.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      globalSearch.value = '';
      globalSearch.blur();
    }
  });

  /* ---------- filters ---------- */
  $$('[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.filter = chip.dataset.filter;
      syncHash();
      renderSubs();
    });
  });

  $$('.action-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      actionState.category = chip.dataset.actionCat;
      renderActions();
    });
  });

  $('#action-status').addEventListener('change', (event) => {
    actionState.status = event.target.value;
    renderActions();
  });

  $('#clear-action-filters').addEventListener('click', () => {
    actionState.category = 'all';
    actionState.status = 'all';
    renderActions();
  });

  $('#sub-sort').addEventListener('change', (event) => {
    state.sort = event.target.value;
    state.dir = 'desc';
    renderSubs();
  });

  $$('.th-sort').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.sortKey;
      if (state.sort === key) state.dir = state.dir === 'desc' ? 'asc' : 'desc';
      else {
        state.sort = key;
        state.dir = 'desc';
      }
      renderSubs();
    });
  });

  $('#clear-filters').addEventListener('click', () => {
    state.filter = 'all';
    state.q = '';
    subSearch.value = '';
    globalSearch.value = '';
    syncHash();
    renderSubs();
    const visibleSearch = globalSearch.offsetParent !== null ? globalSearch : subSearch;
    visibleSearch.focus();
  });

  /* ---------- message sheet ---------- */
  const dialog = $('#message-dialog');
  const msgBody = $('#msg-body');
  const msgName = $('#msg-name');
  const msgPlan = $('#msg-plan');
  const msgSignal = $('#msg-signal');
  let currentCustomer = null;
  let dialogReturn = null;

  const genericMessage = (customer) => {
    const first = customer.name.split(' ')[0];
    return `Merhaba ${first}, Kavurma’daki ${customer.plan} aboneliğin için kısa bir not bırakmak istedim. Son kutunun senin için nasıl gittiğini merak ediyorum; bir sonraki kavurmayı birlikte planlayabiliriz. - Elif`;
  };

  function openMessage(id, returnTo = document.activeElement) {
    const customer = D.customers.find((row) => row.id === id);
    if (!customer) return;
    currentCustomer = customer;
    dialogReturn = returnTo;
    msgName.textContent = customer.name;
    msgPlan.textContent = `${customer.plan} · ${int.format(customer.months)} aydır abone · son kutu ${fmtDay(customer.lastBox)}`;
    msgSignal.textContent = `${customer.risk >= RISK_FLOOR ? 'Sinyal' : 'Durum'}: ${customer.signal}`;
    msgBody.value = customer.message || genericMessage(customer);
    if (!dialog.open) dialog.showModal();
    msgBody.focus();
    msgBody.setSelectionRange(msgBody.value.length, msgBody.value.length);
  }

  const closeDialog = () => {
    if (dialog.open) dialog.close();
  };

  $('#msg-close').addEventListener('click', closeDialog);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener('close', () => {
    if (dialogReturn && document.contains(dialogReturn)) dialogReturn.focus();
    currentCustomer = null;
  });

  const showToast = (message) => {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
  };

  const copyText = async (text) => {
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

  $('#msg-copy').addEventListener('click', async () => {
    const copied = await copyText(msgBody.value);
    if (copied) {
      showToast('Mesaj panoya kopyalandı.');
      msgBody.focus();
    } else {
      msgBody.focus();
      msgBody.select();
      showToast('Metin seçildi; kopyalamak için ⌘C / Ctrl+C.');
    }
  });

  $('#msg-mail').addEventListener('click', () => {
    if (!currentCustomer) return;
    const subject = `Kavurma · ${currentCustomer.plan} aboneliğin hakkında`;
    const body = msgBody.value;
    location.href = `mailto:${encodeURIComponent(currentCustomer.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  /* ---------- subscriber detail drawer ---------- */
  const drawer = $('#subscriber-drawer');
  const drawerName = $('#drawer-name');
  const drawerMeta = $('#drawer-meta');
  const drawerRisk = $('#drawer-risk');
  const drawerPill = $('#drawer-pill');
  const drawerRiskValue = $('#drawer-risk-value');
  const drawerRiskBar = $('#drawer-risk-bar');
  const drawerPlan = $('#drawer-plan');
  const drawerTenure = $('#drawer-tenure');
  const drawerLastBox = $('#drawer-lastbox');
  const drawerSignal = $('#drawer-signal');
  const drawerMail = $('#drawer-mail');
  const drawerId = $('#drawer-id');
  const drawerCopy = $('#drawer-copy');
  let drawerCustomer = null;
  let drawerReturn = null;
  let drawerRestoreFocus = true;

  const riskLevel = (risk) => {
    if (risk >= 60) return { level: 'high', label: 'Yüksek risk', pill: 'negative' };
    if (risk >= RISK_FLOOR) return { level: 'watch', label: 'İzlemede', pill: 'neutral' };
    return { level: 'healthy', label: 'Sağlıklı', pill: 'positive' };
  };

  const daysSince = (iso) => Math.round((dateOf(D.snapshot.date) - dateOf(iso)) / 86400000);
  const fmtAgo = (iso) => {
    const days = daysSince(iso);
    if (days <= 0) return 'bugün';
    if (days === 1) return 'dün';
    return `${int.format(days)} gün önce`;
  };

  function openDrawer(id, returnTo = document.activeElement) {
    const customer = D.customers.find((row) => row.id === id);
    if (!customer) return;
    const level = riskLevel(customer.risk);
    drawerCustomer = customer;
    drawerReturn = returnTo;
    drawerName.textContent = customer.name;
    drawerMeta.textContent = `${customer.id} · ${customer.plan}`;
    drawerRisk.dataset.level = level.level;
    drawerPill.className = `pill ${level.pill}`;
    drawerPill.textContent = level.label;
    drawerRiskValue.textContent = int.format(customer.risk);
    drawerRiskBar.style.width = `${Math.min(100, Math.max(2, customer.risk))}%`;
    drawerPlan.textContent = customer.plan;
    drawerTenure.textContent = `${int.format(customer.months)} ay`;
    drawerLastBox.textContent = `${fmtDay(customer.lastBox)} · ${fmtAgo(customer.lastBox)}`;
    drawerSignal.textContent = customer.signal;
    drawerMail.textContent = customer.email;
    drawerMail.href = `mailto:${customer.email}`;
    drawerId.textContent = customer.id;
    drawerCopy.textContent = 'E-postayı kopyala';
    drawerCopy.disabled = false;
    if (!drawer.open) drawer.showModal();
    $('#drawer-close').focus();
  }

  const closeDrawer = (restoreFocus = true) => {
    drawerRestoreFocus = restoreFocus;
    if (drawer.open) drawer.close();
  };

  $('#drawer-close').addEventListener('click', () => closeDrawer());
  drawer.addEventListener('click', (event) => {
    if (event.target === drawer) closeDrawer();
  });
  drawer.addEventListener('close', () => {
    const target = drawerReturn;
    drawerCustomer = null;
    drawerReturn = null;
    if (drawerRestoreFocus && target && document.contains(target) && target.offsetParent !== null) {
      target.focus();
    }
  });

  // Rows are clickable, the name inside them is a button. The message and
  // action modal triggers must not bubble into the drawer.
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-message], [data-action-modal]')) return;
    const opener = event.target.closest('[data-open]');
    if (!opener) return;
    const target = opener.matches('button') ? opener : $('.row-open', opener);
    openDrawer(opener.dataset.open, target || document.activeElement);
  });

  $('#drawer-message').addEventListener('click', () => {
    if (!drawerCustomer) return;
    const id = drawerCustomer.id;
    const returnTo = drawerReturn;
    closeDrawer(false);
    openMessage(id, returnTo);
  });

  $('#drawer-copy').addEventListener('click', async () => {
    if (!drawerCustomer) return;
    const copied = await copyText(drawerCustomer.email);
    drawerCopy.textContent = copied ? 'Kopyalandı' : 'Kopyalanamadı';
    drawerCopy.disabled = true;
    clearTimeout(drawerCopy.timer);
    drawerCopy.timer = setTimeout(() => {
      drawerCopy.textContent = 'E-postayı kopyala';
      drawerCopy.disabled = false;
    }, 2000);
  });

  /* ---------- action modal ---------- */
  const actionDialog = $('#action-dialog');
  const actionForm = $('#action-form');
  const actionType = $('#action-type');
  const actionNote = $('#action-note');
  const actionWho = $('#action-who');
  const actionPill = $('#action-pill');
  const actionPlan = $('#action-plan');
  const actionSignal = $('#action-signal');
  const actionReopen = $('#action-reopen');
  const actionSave = $('#action-save');
  let currentAction = null;
  let actionReturn = null;
  let actionRestoreFocus = true;

  const defaultResolution = {
    teslimat: 'Ücretsiz telafi kutusu gönder',
    odeme: 'Ödemeyi 7 gün ertele',
    'geri-kazanim': '1 ay %20 geri kazanım indirimi'
  };

  function openActionModal(actionId, returnTo = document.activeElement) {
    const item = actionRows.find((row) => row.id === actionId);
    const customer = item && customerById.get(item.customerId);
    if (!item || !customer) return;
    currentAction = item;
    actionReturn = returnTo;
    actionRestoreFocus = true;

    actionWho.textContent = customer.name;
    actionPill.className = `pill ${item.status === 'resolved' ? 'positive' : 'neutral'}`;
    actionPill.textContent = item.status === 'resolved' ? 'Çözüldü' : 'Bekliyor';
    actionPlan.textContent = `${item.id} · ${item.categoryLabel} · ${customer.plan} · hedef ${fmtDay(item.due)}`;
    $('#action-modal-meta').textContent = `${item.categoryLabel} · operasyon`;
    actionSignal.textContent = `Sinyal: ${customer.signal}`;
    actionType.value = item.resolution || defaultResolution[item.category] || 'Birebir arama ile çözüldü';
    actionNote.value = item.note || '';
    actionReopen.hidden = item.status !== 'resolved';
    actionSave.textContent = item.status === 'resolved' ? 'Kaydı güncelle' : 'Çözüldü olarak kaydet';

    if (!actionDialog.open) actionDialog.showModal();
    actionType.focus();
  }

  const closeActionModal = (restoreFocus = true) => {
    actionRestoreFocus = restoreFocus;
    if (actionDialog.open) actionDialog.close();
  };

  $('#action-close').addEventListener('click', () => closeActionModal());
  actionDialog.addEventListener('click', (event) => {
    if (event.target === actionDialog) closeActionModal();
  });
  actionDialog.addEventListener('close', () => {
    const target = actionReturn;
    currentAction = null;
    actionReturn = null;
    if (actionRestoreFocus && target && document.contains(target) && target.offsetParent !== null) {
      target.focus();
    }
  });

  actionForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!currentAction) return;
    currentAction.status = 'resolved';
    currentAction.resolution = actionType.value;
    currentAction.note = actionNote.value.trim();
    renderActions();
    closeActionModal();
    showToast('Aksiyon çözüldü olarak kaydedildi.');
  });

  actionReopen.addEventListener('click', () => {
    if (!currentAction) return;
    currentAction.status = 'pending';
    currentAction.resolution = '';
    currentAction.note = actionNote.value.trim();
    renderActions();
    closeActionModal();
    showToast('Aksiyon yeniden açıldı.');
  });

  $('#action-to-message').addEventListener('click', () => {
    if (!currentAction) return;
    const customerId = currentAction.customerId;
    const returnTo = actionReturn;
    closeActionModal(false);
    openMessage(customerId, returnTo);
  });

  /* ---------- CSV ---------- */
  const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const buildCsv = () => {
    const rows = [['Hafta', 'Katılan', 'Ayrılan', 'Net']];
    D.weeks.forEach((week) => rows.push([week.start, week.joined, week.cancelled, week.joined - week.cancelled]));
    rows.push([]);
    rows.push(['Abone', 'Plan', 'Üyelik (ay)', 'Son kutu', 'Risk', 'Sinyal']);
    D.customers.forEach((customer) => rows.push([
      customer.name, customer.plan, customer.months, customer.lastBox, customer.risk, customer.signal
    ]));
    return '\uFEFF' + rows.map((row) => row.map(csvCell).join(';')).join('\r\n');
  };

  $$('[data-export]').forEach((button) => {
    button.addEventListener('click', () => {
      const blob = new Blob([buildCsv()], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kavurma-abone-akisi-${D.snapshot.date}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('CSV indirildi.');
    });
  });

  /* ---------- boot ---------- */
  route();
})();

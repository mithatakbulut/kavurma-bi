import { useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import data from '../data.js';
import { MessageButton, SubscriberOpen } from '../components/SubscriberActions.jsx';
import SubscriberSearch from '../components/SubscriberSearch.jsx';
import { fmtDay, int, RISK_FLOOR } from '../lib/format.js';

const SORTERS = {
  name: (a, b) => a.name.localeCompare(b.name, 'tr'),
  plan: (a, b) => a.plan.localeCompare(b.plan, 'tr'),
  months: (a, b) => a.months - b.months,
  lastBox: (a, b) => a.lastBox.localeCompare(b.lastBox),
  signal: (a, b) => a.signal.localeCompare(b.signal, 'tr'),
  risk: (a, b) => a.risk - b.risk
};

const FILTERS = ['all', 'risk', 'healthy'];

const riskCustomers = data.customers.filter((customer) => customer.risk >= RISK_FLOOR);
const healthyCustomers = data.customers.filter((customer) => customer.risk < RISK_FLOOR);

export default function Subscribers() {
  const { canAct, openMessage, openDrawer } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('risk');
  const [dir, setDir] = useState('desc');
  const searchRef = useRef(null);

  const rawFilter = searchParams.get('filter');
  const filter = FILTERS.includes(rawFilter) ? rawFilter : 'all';

  useEffect(() => {
    if (rawFilter && !FILTERS.includes(rawFilter)) {
      const next = new URLSearchParams(searchParams);
      next.delete('filter');
      setSearchParams(next, { replace: true });
    }
  }, [rawFilter, searchParams, setSearchParams]);

  const rows = useMemo(() => {
    let list = data.customers.slice();
    if (filter === 'risk') list = list.filter((customer) => customer.risk >= RISK_FLOOR);
    if (filter === 'healthy') list = list.filter((customer) => customer.risk < RISK_FLOOR);
    const sorter = SORTERS[sort] || SORTERS.risk;
    const direction = dir === 'asc' ? 1 : -1;
    return list.sort((a, b) => direction * sorter(a, b) || a.name.localeCompare(b.name, 'tr'));
  }, [filter, sort, dir]);

  const counts = {
    all: data.customers.length,
    risk: riskCustomers.length,
    healthy: healthyCustomers.length
  };

  const setFilter = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('filter');
    else params.set('filter', next);
    setSearchParams(params, { replace: true });
  };

  const changeSort = (key) => {
    if (sort === key) {
      setDir((current) => (current === 'desc' ? 'asc' : 'desc'));
    } else {
      setSort(key);
      setDir('desc');
    }
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
    requestAnimationFrame(() => {
      const visible = [...document.querySelectorAll('[data-search-input]')]
        .find((node) => node.offsetParent !== null) || searchRef.current;
      if (visible) {
        visible.focus();
        visible.select?.();
      }
    });
  };

  const openRow = (event, customer) => {
    openDrawer(customer.id, event.currentTarget.querySelector('.row-open'));
  };

  const sortHeader = (key, label, className = '') => (
    <th scope="col" className={className} aria-sort={sort === key ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button className="th-sort" type="button" onClick={() => changeSort(key)}>
        {label}
        <svg className="sort-icon" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 1.5v6.5M2.4 5.4 5 8l2.6-2.6" /></svg>
      </button>
    </th>
  );

  return (
    <section className="view" aria-labelledby="subs-title">
      <div className="title-row subs-title">
        <div>
          <h1 id="subs-title">Aboneler</h1>
          <p className="view-sub">Kadıköy mutfağındaki abonelikler; risk skoruna göre izlenir.</p>
        </div>
      </div>

      <div className="toolbar">
        <SubscriberSearch
          inputRef={searchRef}
          onSelect={openDrawer}
          placeholder="İsim veya sinyal ara"
        />
        <div className="chips" role="group" aria-label="Abone filtresi">
          {FILTERS.map((key) => (
            <button
              key={key}
              className="chip"
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {key === 'all' ? 'Tümü' : key === 'risk' ? 'Riskli' : 'Sağlıklı'}{' '}
              <span className="count">{int.format(counts[key])}</span>
            </button>
          ))}
        </div>
        <span className="spacer" />
        <label className="sr-only" htmlFor="sub-sort">Sıralama</label>
        <select
          className="select"
          id="sub-sort"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value);
            setDir('desc');
          }}
        >
          <option value="risk">Risk skoruna göre</option>
          <option value="name">İsme göre</option>
          <option value="plan">Plana göre</option>
          <option value="months">Üyelik süresine göre</option>
          <option value="lastBox">Son kutuya göre</option>
          <option value="signal">Sinyale göre</option>
        </select>
      </div>

      <p className="result-count" aria-live="polite">{int.format(rows.length)} abone</p>

      {rows.length === 0 ? (
        <div className="empty-state">
          <strong>Aramanla eşleşen abone yok.</strong>
          <span>Filtreyi temizleyip 24 abonenin tamamına bakabilirsin.</span>
          <button className="row-action" type="button" onClick={clearFilters}>Filtreyi temizle</button>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="subs-table">
              <colgroup>
                <col style={{ width: '30%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '9%' }} />
                <col />
                <col style={{ width: '7%' }} />
                <col style={{ width: '7%' }} />
              </colgroup>
              <thead>
                <tr>
                  {sortHeader('name', 'Abone')}
                  {sortHeader('plan', 'Plan')}
                  {sortHeader('months', 'Üyelik', 'n tenure-col')}
                  {sortHeader('lastBox', 'Son kutu', 'n last-col')}
                  {sortHeader('signal', 'Sinyal')}
                  {sortHeader('risk', 'Risk', 'n')}
                  <th scope="col"><span className="sr-only">Mesaj</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((customer) => (
                  <tr key={customer.id} onClick={(event) => openRow(event, customer)}>
                    <td className="name-cell">
                      <SubscriberOpen customer={customer} onOpen={openDrawer}>
                        <span className="name">{customer.name}</span>
                        <span className="id">{customer.id}</span>
                      </SubscriberOpen>
                    </td>
                    <td>{customer.plan}</td>
                    <td className="n tenure-col">{int.format(customer.months)} ay</td>
                    <td className="n last-col">{fmtDay(customer.lastBox)}</td>
                    <td className="signal-cell"><span title={customer.signal}>{customer.signal}</span></td>
                    <td className="n risk-cell">{int.format(customer.risk)}</td>
                    <td className="action-cell">
                      <MessageButton customer={customer} canAct={canAct} onMessage={openMessage} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="subs-cards">
            {rows.map((customer) => (
              <article className="sub-row" key={customer.id} onClick={(event) => openRow(event, customer)}>
                <div className="sub-top">
                  <SubscriberOpen customer={customer} onOpen={openDrawer}>
                    <span className="name">{customer.name}</span>
                    <span className="id">{customer.id}</span>
                  </SubscriberOpen>
                  <span className="sub-risk" aria-label={`Risk skoru ${int.format(customer.risk)}`}>
                    {int.format(customer.risk)}
                  </span>
                </div>
                <p className="sub-meta">
                  {customer.plan} · {int.format(customer.months)} ay · son kutu {fmtDay(customer.lastBox)}
                </p>
                <div className="sub-bottom">
                  <span className="signal">{customer.signal}</span>
                  <MessageButton customer={customer} canAct={canAct} onMessage={openMessage} />
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import data from '../data.js';
import { MessageButton, SubscriberOpen } from '../components/SubscriberActions.jsx';
import { fmtDay, int } from '../lib/format.js';

const CATEGORIES = [
  { key: 'all', label: 'Tümü' },
  { key: 'teslimat', label: 'Teslimat' },
  { key: 'odeme', label: 'Ödeme' },
  { key: 'geri-kazanim', label: 'Geri kazanım' }
];

const customerById = new Map(data.customers.map((customer) => [customer.id, customer]));

const StatusPill = ({ status }) => (
  status === 'resolved'
    ? <span className="pill positive">Çözüldü</span>
    : <span className="pill neutral">Bekliyor</span>
);

export default function Actions() {
  const { actions, openMessage, openDrawer, openAction } = useOutletContext();
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  const rows = actions.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    if (status !== 'all' && item.status !== status) return false;
    return true;
  });

  const counts = {
    all: actions.length,
    teslimat: actions.filter((item) => item.category === 'teslimat').length,
    odeme: actions.filter((item) => item.category === 'odeme').length,
    'geri-kazanim': actions.filter((item) => item.category === 'geri-kazanim').length
  };
  const pendingTotal = actions.filter((item) => item.status === 'pending').length;

  const clearFilters = () => {
    setCategory('all');
    setStatus('all');
  };

  const openRow = (event, customer) => {
    openDrawer(customer.id, event.currentTarget.querySelector('.row-open'));
  };

  const actionButtons = (item, customer) => (
    <span className="row-actions">
      <button
        className="row-action accent"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          openAction(item.id, event.currentTarget);
        }}
      >
        {item.status === 'resolved' ? 'Düzenle' : 'Telafi / Çöz'}
      </button>
      <MessageButton customer={customer} canAct onMessage={openMessage} />
    </span>
  );

  return (
    <section className="view" aria-labelledby="actions-title">
      <div className="title-row subs-title">
        <div>
          <h1 id="actions-title">Aksiyonlar</h1>
          <p className="view-sub">Teslimat, ödeme ve geri kazanım kuyruğu; telafi veya çözüm kaydı ile kapatılır.</p>
        </div>
        <div className="title-actions">
          <p className="stamp">{int.format(pendingTotal)} bekleyen aksiyon</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Kategori filtresi">
          {CATEGORIES.map((item) => (
            <button
              key={item.key}
              className="chip action-chip"
              type="button"
              aria-pressed={category === item.key}
              onClick={() => setCategory(item.key)}
            >
              {item.label} <span className="count">{int.format(counts[item.key] ?? 0)}</span>
            </button>
          ))}
        </div>
        <span className="spacer" />
        <label className="sr-only" htmlFor="action-status">Durum filtresi</label>
        <select
          className="select"
          id="action-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">Tüm durumlar</option>
          <option value="pending">Bekleyenler</option>
          <option value="resolved">Çözülenler</option>
        </select>
      </div>

      <p className="result-count" aria-live="polite">{int.format(rows.length)} aksiyon</p>

      {rows.length === 0 ? (
        <div className="empty-state">
          <strong>Seçili filtrede aksiyon yok.</strong>
          <span>Tüm kategorileri ve durumları görmek için filtreyi sıfırlayabilirsin.</span>
          <button className="row-action" type="button" onClick={clearFilters}>Filtreyi temizle</button>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="subs-table actions-table">
              <colgroup>
                <col style={{ width: '24%' }} />
                <col style={{ width: '13%' }} />
                <col />
                <col style={{ width: '12%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '16%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Abone</th>
                  <th scope="col">Kategori</th>
                  <th scope="col">Sinyal / Çözüm</th>
                  <th scope="col">Durum</th>
                  <th scope="col" className="n">Hedef</th>
                  <th scope="col"><span className="sr-only">İşlem</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => {
                  const customer = customerById.get(item.customerId);
                  if (!customer) return null;
                  return (
                    <tr key={item.id} onClick={(event) => openRow(event, customer)}>
                      <td className="name-cell">
                        <SubscriberOpen customer={customer} onOpen={openDrawer}>
                          <span className="name">{customer.name}</span>
                          <span className="id">{item.id} · {customer.plan}</span>
                        </SubscriberOpen>
                      </td>
                      <td>{item.categoryLabel}</td>
                      <td className="signal-cell">
                        <span title={customer.signal}>{customer.signal}</span>
                        {item.resolution && (
                          <span className="action-signal-sub">
                            {item.resolution}{item.note ? ` · ${item.note}` : ''}
                          </span>
                        )}
                      </td>
                      <td><StatusPill status={item.status} /></td>
                      <td className="n">{fmtDay(item.due)}</td>
                      <td className="action-cell">{actionButtons(item, customer)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="subs-cards">
            {rows.map((item) => {
              const customer = customerById.get(item.customerId);
              if (!customer) return null;
              return (
                <article className="sub-row" key={item.id} onClick={(event) => openRow(event, customer)}>
                  <div className="sub-top">
                    <SubscriberOpen customer={customer} onOpen={openDrawer}>
                      <span className="name">{customer.name}</span>
                      <span className="id">{item.id} · {item.categoryLabel}</span>
                    </SubscriberOpen>
                    <StatusPill status={item.status} />
                  </div>
                  <p className="sub-meta">{customer.plan} · hedef {fmtDay(item.due)}</p>
                  <div className="sub-bottom">
                    <span className="signal">{item.resolution || customer.signal}</span>
                    {actionButtons(item, customer)}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

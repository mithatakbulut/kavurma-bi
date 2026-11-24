import { useState } from 'react';
import data from '../data.js';
import { dateOf, fmtDay, int } from '../lib/format.js';

const STATUSES = [
  { key: 'all', label: 'Tümü' },
  { key: 'roasted', label: 'Kavruldu' },
  { key: 'packing', label: 'Paketlemede' },
  { key: 'planned', label: 'Planlandı' }
];

const StatusBadge = ({ status, label }) => {
  const tone = status === 'roasted' ? 'ok' : status === 'packing' ? 'warn' : 'muted';
  return <span className={`badge ${tone}`}>{label}</span>;
};

export default function Batches() {
  const [status, setStatus] = useState('all');
  const batchRows = data.roastBatches;
  const rows = batchRows.filter((item) => status === 'all' || item.status === status);

  const counts = {
    all: batchRows.length,
    roasted: batchRows.filter((item) => item.status === 'roasted').length,
    packing: batchRows.filter((item) => item.status === 'packing').length,
    planned: batchRows.filter((item) => item.status === 'planned').length
  };
  const totalKg = batchRows.reduce((sum, item) => sum + item.kg, 0);
  const roastedBoxes = batchRows
    .filter((item) => item.status === 'roasted')
    .reduce((sum, item) => sum + item.boxes, 0);
  const roastPct = Math.round(data.totals.boxesPct * 100);

  return (
    <section className="view" aria-labelledby="batches-title">
      <div className="title-row subs-title">
        <div>
          <h1 id="batches-title">Kavurma partileri</h1>
          <p className="view-sub">Haftalık kavurma planı, çekirdek menşeleri ve paketleme durumu.</p>
        </div>
        <div className="title-actions">
          <p className="stamp">
            {fmtDay(data.roast.nextRoast)} {dateOf(data.roast.nextRoast).getFullYear()} haftası
          </p>
        </div>
      </div>

      <div className="kpis" aria-label="Haftalık kavurma özeti">
        <div className="kpi lead">
          <p className="kpi-label">Planlanan kutu</p>
          <p className="kpi-value">{int.format(data.roast.boxes)}</p>
          <p className="kpi-delta">
            <span className="pos">%{roastPct} doluluk</span>{' '}
            <span className="baseline">{int.format(data.roast.capacity)} kapasite</span>
          </p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Kavrulacak çekirdek</p>
          <p className="kpi-value">{int.format(totalKg)} kg</p>
          <p className="kpi-delta"><span className="baseline">{batchRows.length} aktif parti</span></p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Tamamlanan parti</p>
          <p className="kpi-value">{counts.roasted} / {batchRows.length}</p>
          <p className="kpi-delta">
            <span className="pos">{int.format(roastedBoxes)} kutu</span>{' '}
            <span className="baseline">kavruldu</span>
          </p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Atlayan abone</p>
          <p className="kpi-value">{int.format(data.roast.skipped)}</p>
          <p className="kpi-delta"><span className="baseline">bu hafta pas geçildi</span></p>
        </div>
      </div>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Parti durumu filtresi">
          {STATUSES.map((item) => (
            <button
              key={item.key}
              className="chip batch-chip"
              type="button"
              aria-pressed={status === item.key}
              onClick={() => setStatus(item.key)}
            >
              {item.label} <span className="count">{int.format(counts[item.key] ?? 0)}</span>
            </button>
          ))}
        </div>
        <span className="spacer" />
      </div>

      <p className="result-count" aria-live="polite">{int.format(rows.length)} parti</p>

      <div className="table-wrap">
        <table className="subs-table">
          <colgroup>
            <col style={{ width: '26%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '11%' }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Parti / Menşe</th>
              <th scope="col">Kavrum</th>
              <th scope="col" className="n">Kutu</th>
              <th scope="col" className="n">Miktar</th>
              <th scope="col">Durum</th>
              <th scope="col" className="n">Tarih</th>
              <th scope="col">Not</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <td className="name-cell">
                  <div className="sub-id">
                    <span className="name">{item.origin}</span>
                    <span className="id">{item.id}</span>
                  </div>
                </td>
                <td>{item.roastLevel}</td>
                <td className="n">{int.format(item.boxes)}</td>
                <td className="n">{int.format(item.kg)} kg</td>
                <td><StatusBadge status={item.status} label={item.statusLabel} /></td>
                <td className="n">{fmtDay(item.roastDate)}</td>
                <td>{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="subs-cards">
        {rows.map((item) => (
          <article className="sub-row" key={item.id}>
            <div className="sub-top">
              <div className="sub-id">
                <span className="name">{item.origin}</span>
                <span className="id">{item.id} · {item.roastLevel}</span>
              </div>
              <StatusBadge status={item.status} label={item.statusLabel} />
            </div>
            <p className="sub-meta">
              {int.format(item.boxes)} kutu · {int.format(item.kg)} kg · {fmtDay(item.roastDate)}
            </p>
            <div className="sub-bottom">
              <span className="signal">{item.note}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

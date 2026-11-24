import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import data from '../data.js';
import FlowChart from '../components/FlowChart.jsx';
import { MessageButton, SubscriberOpen } from '../components/SubscriberActions.jsx';
import {
  dateOf, dec1, fmtDay, fmtNextRoast, int, money, pct, signedInt, signedMoney
} from '../lib/format.js';

export default function Overview() {
  const { canAct, openMessage, openDrawer } = useOutletContext();
  const [period, setPeriod] = useState(8);

  const { totals, snapshot } = data;
  const mrrDelta = snapshot.mrr - snapshot.priorMrr;
  const churnNow = Math.round(totals.churn * 1000) / 10;
  const churnPrior = Math.round(totals.priorChurn * 1000) / 10;
  const churnDelta = Math.round((churnNow - churnPrior) * 10) / 10;
  const churnWord = churnDelta === 0
    ? 'değişmedi'
    : `${dec1.format(Math.abs(churnDelta))} puan ${churnDelta > 0 ? 'arttı' : 'azaldı'}`;

  const last4 = data.weeks.slice(-4).map((week) => week.cancelled);
  const riskCustomers = data.atRisk;
  const windowWeeks = data.weeks.slice(-period);
  const net = windowWeeks.reduce((sum, week) => sum + week.joined - week.cancelled, 0);

  const planShares = data.plans.map((plan) => plan.subscribers / totals.totalSubs);
  const planColors = ['var(--accent)', 'var(--text)', 'var(--chart-muted)'];
  const roastPct = Math.round(totals.boxesPct * 100);
  const channelMax = Math.max(...data.channels.map((channel) => channel.value));

  const handleRow = (event, customer) => {
    openDrawer(customer.id, event.currentTarget.querySelector('.row-open'));
  };

  return (
    <section className="view" aria-labelledby="overview-title">
      <div className="title-row">
        <div>
          <h1 id="overview-title">Abonelik sağlığı</h1>
          <p className="finding">
            Büyüme sürüyor; iptaller son dört haftada <strong>{int.format(last4[0])}</strong>’dan <strong>{int.format(last4[last4.length - 1])}</strong>’e çıktı.
          </p>
        </div>
        <div className="title-actions">
          <p className="stamp">
            {fmtDay(snapshot.date)} {dateOf(snapshot.date).getFullYear()}, {snapshot.time} itibarıyla
          </p>
          <Link className="btn primary" to="/aboneler?filter=risk">
            Riskli <span>{int.format(riskCustomers.length)}</span> aboneye ulaş
          </Link>
        </div>
      </div>

      <div className="kpis" aria-label="Son dört haftanın özeti">
        <div className="kpi lead">
          <p className="kpi-label">Aylık yinelenen gelir</p>
          <p className="kpi-value">{money(snapshot.mrr)}</p>
          <p className="kpi-delta">
            <span className={mrrDelta >= 0 ? 'pos' : 'neg'}>{signedMoney(mrrDelta)}</span>{' '}
            <span className="baseline">son 4 hafta</span>
          </p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Aktif abone</p>
          <p className="kpi-value">{int.format(snapshot.activeSubscribers)}</p>
          <p className="kpi-delta">
            <span className={totals.last4.net >= 0 ? 'pos' : 'neg'}>{signedInt(totals.last4.net)}</span>{' '}
            <span className="baseline">son 4 hafta</span>
          </p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Yeni abone</p>
          <p className="kpi-value">{int.format(totals.last4.joined)}</p>
          <p className="kpi-delta">
            <span className={totals.last4.joined - totals.prior4.joined >= 0 ? 'pos' : 'neg'}>
              {signedInt(totals.last4.joined - totals.prior4.joined)}
            </span>{' '}
            <span className="baseline">son 4 hafta</span>
          </p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Aylık churn</p>
          <p className="kpi-value">{pct.format(totals.churn)}</p>
          <p className="kpi-delta">
            <span className={churnDelta > 0 ? 'neg' : churnDelta < 0 ? 'pos' : ''}>{churnWord}</span>{' '}
            <span className="sep" aria-hidden="true">·</span>{' '}
            <span className="baseline">önceki 4 hafta {pct.format(totals.priorChurn)}</span>
          </p>
        </div>
      </div>

      <div className="dash-grid">
        <section className="panel chart-panel span-8" aria-labelledby="flow-title">
          <div className="panel-head chart-head">
            <div>
              <h2 id="flow-title">Abone akışı</h2>
              <p className="meta">Haftalık katılan ve ayrılan</p>
            </div>
            <div className="segmented" role="group" aria-label="Grafik dönemi">
              {[4, 8, 13].map((size) => (
                <button key={size} type="button" aria-pressed={period === size} onClick={() => setPeriod(size)}>
                  {size} hafta
                </button>
              ))}
            </div>
          </div>
          <p className="chart-summary">
            Son {int.format(period)} haftada net <strong>{signedInt(net)}</strong> abone
          </p>
          <FlowChart size={period} />
          <p className="chart-source">Kaynak: Kavurma abonelik veritabanı</p>
        </section>

        <div className="rail span-4">
          <section className="panel plan-panel" aria-labelledby="plan-title">
            <div className="panel-head">
              <div>
                <h2 id="plan-title">Plan dağılımı</h2>
                <p className="meta">Aboneye göre</p>
              </div>
            </div>
            <div className="plan-list">
              <div className="plan-share" aria-hidden="true">
                {data.plans.map((plan, index) => (
                  <span
                    key={plan.name}
                    style={{ width: `${(planShares[index] * 100).toFixed(2)}%`, background: planColors[index] }}
                  />
                ))}
              </div>
              <div className="plan-legend">
                {data.plans.map((plan, index) => (
                  <div className="plan-row" key={plan.name}>
                    <span className="plan-swatch" style={{ background: planColors[index] }} aria-hidden="true" />
                    <span className="plan-name">{plan.name}</span>
                    <span className="plan-count">{int.format(plan.subscribers)} <small>abone</small></span>
                    <span className="plan-percent">{pct.format(planShares[index])}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel roast-panel" aria-labelledby="roast-title">
            <div className="panel-head">
              <div>
                <h2 id="roast-title">Kavurma planı</h2>
                <p className="meta">{fmtNextRoast(data.roast.nextRoast)}</p>
              </div>
            </div>
            <div className="roast-head">
              <span className="roast-figure num">
                {int.format(data.roast.boxes)} <small>/ {int.format(data.roast.capacity)} kutu</small>
              </span>
              <span className="roast-pct num">%{roastPct}</span>
            </div>
            <span className="capacity" aria-hidden="true">
              <i style={{ width: `${Math.min(100, totals.boxesPct * 100).toFixed(1)}%` }} />
            </span>
            <p className="roast-note">{int.format(data.roast.skipped)} abone bu haftayı atladı</p>
          </section>
        </div>

        <section className="panel risk-panel span-8" aria-labelledby="risk-title">
          <div className="panel-head">
            <div>
              <h2 id="risk-title">Riskli aboneler</h2>
              <p className="meta">Risk skoruna göre</p>
            </div>
            <Link className="panel-link" to="/aboneler?filter=risk">Tümünü gör</Link>
          </div>
          <div className="risk-list">
            <div className="risk-head" aria-hidden="true">
              <span>Abone</span>
              <span>Sinyal</span>
              <span className="num">Risk</span>
              <span className="head-action" />
            </div>
            <div>
              {riskCustomers.slice(0, 4).map((customer) => (
                <div
                  className="risk-row"
                  key={customer.id}
                  onClick={(event) => handleRow(event, customer)}
                >
                  <div className="who">
                    <SubscriberOpen customer={customer} onOpen={openDrawer}>
                      <span className="name">{customer.name}</span>
                      <span className="sub">{customer.plan} · {int.format(customer.months)} ay</span>
                    </SubscriberOpen>
                  </div>
                  <span className="signal" title={customer.signal}>{customer.signal}</span>
                  <span className="risk-rank">{int.format(customer.risk)}</span>
                  <MessageButton customer={customer} canAct={canAct} onMessage={openMessage} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel channels-panel span-4" aria-labelledby="channels-title">
          <div className="panel-head">
            <div>
              <h2 id="channels-title">Abone kaynağı</h2>
              <p className="meta">Son 4 hafta</p>
            </div>
          </div>
          <div className="channel-list">
            {data.channels.map((channel) => (
              <div className="channel-row" key={channel.label}>
                <div className="channel-line">
                  <span className="channel-label">{channel.label}</span>
                  <span className="channel-value">{int.format(channel.value)}</span>
                </div>
                <span className="channel-track" aria-hidden="true">
                  <i style={{ width: `${(channel.value / channelMax * 100).toFixed(1)}%` }} />
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

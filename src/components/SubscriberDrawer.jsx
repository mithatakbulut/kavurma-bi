import { useEffect, useRef, useState } from 'react';
import { copyText, fmtAgo, fmtDay, int, riskLevel } from '../lib/format.js';
import { useToast } from '../context/ToastContext.jsx';

export default function SubscriberDrawer({ customer, canAct, onClose, onMessage }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const [copied, setCopied] = useState(null);
  const showToast = useToast();
  const level = riskLevel(customer.risk);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (copied === null) return undefined;
    const timer = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const close = () => dialogRef.current?.close();

  const handleBackdrop = (event) => {
    if (event.target === event.currentTarget) close();
  };

  const handleCopy = async () => {
    const ok = await copyText(customer.email);
    setCopied(ok);
    showToast(ok ? 'E-posta panoya kopyalandı.' : 'E-posta kopyalanamadı.');
  };

  return (
    <dialog
      className="sheet-dialog detail-drawer"
      ref={dialogRef}
      aria-labelledby="drawer-name"
      aria-describedby="drawer-meta"
      onClose={onClose}
      onClick={handleBackdrop}
    >
      <div className="dialog-inner detail-inner">
        <header className="dialog-head">
          <div>
            <h2 id="drawer-name">{customer.name}</h2>
            <p className="meta" id="drawer-meta">{customer.id} · {customer.plan}</p>
          </div>
          <button className="icon-btn" type="button" aria-label="Abone detayını kapat" ref={closeRef} onClick={close}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" /></svg>
          </button>
        </header>

        <div className="detail-risk" data-level={level.level}>
          <div className="detail-risk-head">
            <p className="detail-risk-label">Risk skoru</p>
            <span className={`pill ${level.pill}`}>{level.label}</span>
          </div>
          <p className="detail-risk-score"><span>{int.format(customer.risk)}</span><small>/100</small></p>
          <span className="detail-track" aria-hidden="true">
            <i style={{ width: `${Math.min(100, Math.max(2, customer.risk))}%` }} />
          </span>
        </div>

        <dl className="detail-list">
          <dt>Plan</dt>
          <dd>{customer.plan}</dd>
          <dt>Üyelik</dt>
          <dd>{int.format(customer.months)} ay</dd>
          <dt>Son kutu</dt>
          <dd>{fmtDay(customer.lastBox)} · {fmtAgo(customer.lastBox)}</dd>
          <dt>Sinyal</dt>
          <dd>{customer.signal}</dd>
          <dt>E-posta</dt>
          <dd><a className="detail-mail" href={`mailto:${customer.email}`}>{customer.email}</a></dd>
          <dt>Abone no</dt>
          <dd className="mono">{customer.id}</dd>
        </dl>

        <div className="dialog-actions detail-actions">
          <button className="btn" type="button" onClick={handleCopy} disabled={copied !== null}>
            {copied === true ? 'Kopyalandı' : copied === false ? 'Kopyalanamadı' : 'E-postayı kopyala'}
          </button>
          {canAct && (
            <button className="btn primary" type="button" onClick={() => onMessage(customer.id)}>
              Mesaj hazırla
            </button>
          )}
        </div>
        <p className="dialog-hint">
          Risk skoru 35 ve üzeri aboneler riskli listesinde izlenir; detaylar demo verisinden gelir.
        </p>
      </div>
    </dialog>
  );
}

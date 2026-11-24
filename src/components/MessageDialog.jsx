import { useEffect, useRef, useState } from 'react';
import { copyText, fmtDay, genericMessage, int, RISK_FLOOR } from '../lib/format.js';
import { useToast } from '../context/ToastContext.jsx';

export default function MessageDialog({ customer, onClose }) {
  const dialogRef = useRef(null);
  const bodyRef = useRef(null);
  const showToast = useToast();
  const [body, setBody] = useState(() => customer.message || genericMessage(customer));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    bodyRef.current?.focus();
    bodyRef.current?.setSelectionRange(bodyRef.current.value.length, bodyRef.current.value.length);
  }, []);

  const close = () => dialogRef.current?.close();

  const handleBackdrop = (event) => {
    if (event.target === event.currentTarget) close();
  };

  const handleCopy = async () => {
    const copied = await copyText(body);
    if (copied) {
      showToast('Mesaj panoya kopyalandı.');
      bodyRef.current?.focus();
    } else {
      bodyRef.current?.focus();
      bodyRef.current?.select();
      showToast('Metin seçildi; kopyalamak için ⌘C / Ctrl+C.');
    }
  };

  const handleMail = () => {
    const subject = `Kavurma · ${customer.plan} aboneliğin hakkında`;
    window.location.href = `mailto:${encodeURIComponent(customer.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <dialog
      className="sheet-dialog"
      ref={dialogRef}
      aria-labelledby="msg-title"
      aria-describedby="msg-hint"
      onClose={onClose}
      onClick={handleBackdrop}
    >
      <div className="dialog-inner">
        <header className="dialog-head">
          <div>
            <h2 id="msg-title">Mesaj hazırla</h2>
            <p className="meta">Kavurma · abone iletişimi</p>
          </div>
          <button className="icon-btn" type="button" aria-label="Kapat" onClick={close}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" /></svg>
          </button>
        </header>

        <div className="msg-context">
          <p className="who">{customer.name}</p>
          <p className="meta">
            {customer.plan} · {int.format(customer.months)} aydır abone · son kutu {fmtDay(customer.lastBox)}
          </p>
          <p className="signal">{customer.risk >= RISK_FLOOR ? 'Sinyal' : 'Durum'}: {customer.signal}</p>
        </div>

        <div className="msg-field">
          <label htmlFor="msg-body">Mesaj</label>
          <textarea id="msg-body" ref={bodyRef} spellCheck="false" value={body} onChange={(event) => setBody(event.target.value)} />
        </div>

        <div className="dialog-actions">
          <button className="btn" type="button" onClick={handleMail}>E-posta aç</button>
          <button className="btn primary" type="button" onClick={handleCopy}>Mesajı kopyala</button>
        </div>
        <p className="dialog-hint" id="msg-hint">
          Bu demo mesaj göndermez; panoya kopyalar veya e-posta uygulamanızda açar.
        </p>
      </div>
    </dialog>
  );
}

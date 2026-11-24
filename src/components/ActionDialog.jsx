import { useEffect, useRef, useState } from 'react';
import { fmtDay } from '../lib/format.js';

const DEFAULT_RESOLUTION = {
  teslimat: 'Ücretsiz telafi kutusu gönder',
  odeme: 'Ödemeyi 7 gün ertele',
  'geri-kazanim': '1 ay %20 geri kazanım indirimi'
};

const RESOLUTION_OPTIONS = [
  'Ücretsiz telafi kutusu gönder',
  'Ödemeyi 7 gün ertele',
  'Adres / teslimat saatini güncelle',
  '1 ay %20 geri kazanım indirimi',
  'Plan değişikliği (Keşif)',
  'Birebir arama ile çözüldü'
];

export default function ActionDialog({ action, customer, onClose, onSave, onReopen, onMessage }) {
  const dialogRef = useRef(null);
  const typeRef = useRef(null);
  const resolved = action.status === 'resolved';
  const [type, setType] = useState(
    action.resolution || DEFAULT_RESOLUTION[action.category] || 'Birebir arama ile çözüldü'
  );
  const [note, setNote] = useState(action.note || '');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    typeRef.current?.focus();
  }, []);

  const close = () => dialogRef.current?.close();

  const handleBackdrop = (event) => {
    if (event.target === event.currentTarget) close();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(type, note.trim());
  };

  return (
    <dialog
      className="modal-dialog"
      ref={dialogRef}
      aria-labelledby="action-modal-title"
      aria-describedby="action-modal-hint"
      onClose={onClose}
      onClick={handleBackdrop}
    >
      <form className="modal-inner" id="action-form" onSubmit={handleSubmit}>
        <header className="dialog-head">
          <div>
            <h2 id="action-modal-title">Aksiyon kaydı</h2>
            <p className="meta">{action.categoryLabel} · operasyon</p>
          </div>
          <button className="icon-btn" type="button" aria-label="Aksiyon penceresini kapat" onClick={close}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" /></svg>
          </button>
        </header>

        <div className="msg-context action-context">
          <div className="action-context-top">
            <p className="who">{customer.name}</p>
            <span className={`pill ${resolved ? 'positive' : 'neutral'}`}>{resolved ? 'Çözüldü' : 'Bekliyor'}</span>
          </div>
          <p className="meta">
            {action.id} · {action.categoryLabel} · {customer.plan} · hedef {fmtDay(action.due)}
          </p>
          <p className="signal">Sinyal: {customer.signal}</p>
        </div>

        <div className="modal-fields">
          <div className="modal-field">
            <label htmlFor="action-type">Telafi / çözüm tipi</label>
            <select
              className="select"
              id="action-type"
              ref={typeRef}
              required
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              {RESOLUTION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          <div className="modal-field">
            <label htmlFor="action-note">Operasyon notu</label>
            <textarea
              id="action-note"
              rows="4"
              placeholder="Örn. 24 Kasım partisine telafi kutusu eklendi, kargo takip kodu paylaşıldı."
              spellCheck="false"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>

        <div className="dialog-actions modal-actions">
          <button className="btn" type="button" onClick={() => onMessage(customer.id)}>Mesaj hazırla</button>
          {resolved && (
            <button className="btn" type="button" onClick={() => onReopen(note.trim())}>Yeniden aç</button>
          )}
          <button className="btn primary" type="submit">
            {resolved ? 'Kaydı güncelle' : 'Çözüldü olarak kaydet'}
          </button>
        </div>
        <p className="dialog-hint" id="action-modal-hint">
          Bu demo yalnızca oturum içi durumu günceller; sayfa yenilendiğinde sıfırlanır.
        </p>
      </form>
    </dialog>
  );
}

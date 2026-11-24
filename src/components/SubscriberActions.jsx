export function MessageButton({ customer, canAct, onMessage }) {
  if (!canAct) return null;
  return (
    <button
      className="row-action"
      type="button"
      aria-label={`${customer.name} için mesaj hazırla`}
      onClick={(event) => {
        event.stopPropagation();
        onMessage(customer.id, event.currentTarget);
      }}
    >
      Mesaj
    </button>
  );
}

export function SubscriberOpen({ customer, onOpen, children }) {
  return (
    <button
      className="row-open"
      type="button"
      aria-label={`${customer.name} abone detayını aç`}
      onClick={(event) => {
        event.stopPropagation();
        onOpen(customer.id, event.currentTarget);
      }}
    >
      {children}
    </button>
  );
}

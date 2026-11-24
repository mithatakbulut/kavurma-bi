export default function BrandMark({ className = 'brand-mark' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="7.2" ry="9.6" transform="rotate(34 12 12)" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.4 6.6c3.2 1.3 4.1 4.5 2.5 7.1-1.1 1.8-1.2 3.7-.4 5.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

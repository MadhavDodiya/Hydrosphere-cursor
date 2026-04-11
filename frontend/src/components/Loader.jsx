/**
 * Accessible loading spinner for pages and sections.
 */
export default function Loader({ label = "Loading", className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-sky-600"
        aria-hidden
      />
      <span className="text-sm text-slate-600">{label}…</span>
    </div>
  );
}

/** Compact inline spinner (buttons, small areas). */
export function Spinner({ className = "h-5 w-5" }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-slate-300 border-t-sky-600 ${className}`}
      aria-hidden
    />
  );
}

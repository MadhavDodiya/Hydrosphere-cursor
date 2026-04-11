/**
 * Simple layout wrapper for auth and listing forms (labels + spacing).
 */
export function Form({ title, children, onSubmit, className = "" }) {
  return (
    <form
      onSubmit={onSubmit}
      className={`mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      {title && (
        <h1 className="mb-4 text-xl font-semibold text-slate-800">{title}</h1>
      )}
      {children}
    </form>
  );
}

export function FormField({ label, id, children }) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

export function FormActions({ children }) {
  return <div className="mt-6 flex flex-wrap gap-2">{children}</div>;
}

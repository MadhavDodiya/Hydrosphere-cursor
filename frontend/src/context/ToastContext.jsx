import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ToastContext = createContext(null);

/**
 * Simple global toasts for errors and success (non-blocking).
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, variant = "error") => {
    if (!message) return;
    setToast({ message, variant, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="hs-toast-container"
        >
          <div
            className={`hs-toast ${toast.variant === "success" ? "hs-toast-success" : "hs-toast-error"}`}
          >
            <div className="d-flex align-items-center gap-3">
              <i className={`bi ${toast.variant === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"}`}></i>
              <div className="fw-medium">{toast.message}</div>
              <button onClick={() => setToast(null)} className="btn-close btn-close-white shadow-none ms-auto small" style={{ fontSize: '0.6rem' }}></button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

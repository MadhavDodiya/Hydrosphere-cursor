import { useEffect, useMemo, useState } from "react";
import { createInquiry } from "../services/inquiryService.js";
import { getApiErrorMessage } from "../utils/apiError.js";
import { Spinner } from "./Loader.jsx";

function initialValues(prefill) {
  return {
    name: prefill?.name || "",
    email: prefill?.email || "",
    phone: "",
    message: "",
  };
}

export default function InquiryModal({ open, onClose, listing, prefill, onSuccess, showToast }) {
  const [values, setValues] = useState(() => initialValues(prefill));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(() => {
    if (!listing) return "Contact seller";
    return `Contact seller about ${listing.companyName}`;
  }, [listing]);

  useEffect(() => {
    if (!open) return;
    setValues(initialValues(prefill));
    setBusy(false);
    setError("");
  }, [open, prefill]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!listing?._id) return;
    setBusy(true);
    setError("");
    try {
      await createInquiry({
        listingId: listing._id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        message: values.message,
      });
      showToast?.("Inquiry sent to the seller.", "success");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      const msg = getApiErrorMessage(err, "Could not send inquiry.");
      setError(msg);
      showToast?.(msg);
    } finally {
      setBusy(false);
    }
  };

  const setField = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-slate-900/40"
        onClick={() => onClose?.()}
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-xs text-slate-600">
              Share your requirement. The seller will get your contact details.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="px-4 py-4 sm:px-6">
          {error && (
            <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}

          <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-800">Name</span>
              <input
                required
                value={values.name}
                onChange={setField("name")}
                className="min-h-[44px] rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-sky-500"
                placeholder="Your name"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-800">Email</span>
              <input
                required
                type="email"
                value={values.email}
                onChange={setField("email")}
                className="min-h-[44px] rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-sky-500"
                placeholder="you@company.com"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-800">Phone</span>
              <input
                required
                value={values.phone}
                onChange={setField("phone")}
                className="min-h-[44px] rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-sky-500"
                placeholder="+91..."
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-800">Message</span>
              <textarea
                required
                rows={5}
                value={values.message}
                onChange={setField("message")}
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-sky-500"
                placeholder="Tell the seller what you need (quantity, location, timeline, etc.)"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onClose?.()}
              disabled={busy}
              className="min-h-[44px] rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="min-h-[44px] rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {busy && <Spinner className="h-4 w-4" />}
              Send inquiry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


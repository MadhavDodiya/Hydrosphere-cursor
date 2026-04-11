import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import InquiryModal from "../components/InquiryModal.jsx";
import Loader, { Spinner } from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { fetchListingById } from "../services/listingService.js";
import { saveListing, unsaveListing } from "../services/savedService.js";
import { getApiErrorMessage } from "../utils/apiError.js";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

/**
 * Full listing view + save / unsave.
 */
export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchListingById(id);
      setListing(data);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Could not load this listing.");
      setError(msg);
      showToast(msg);
      setListing(null);
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSave = async () => {
    if (!isAuthenticated) {
      showToast("Log in to save listings.");
      navigate("/login", { state: { from: { pathname: `/listings/${id}` } } });
      return;
    }
    if (!listing) return;
    setSaveBusy(true);
    try {
      if (listing.saved) {
        await unsaveListing(listing._id);
        setListing((prev) => (prev ? { ...prev, saved: false } : prev));
        showToast("Removed from saved.", "success");
      } else {
        await saveListing(listing._id);
        setListing((prev) => (prev ? { ...prev, saved: true } : prev));
        showToast("Saved. View it on your dashboard.", "success");
      }
    } catch (err) {
      showToast(getApiErrorMessage(err, "Could not update saved list."));
    } finally {
      setSaveBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Loader label="Loading listing" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error || "Listing not found."}
        </p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-sky-700 hover:underline">
          ← Back to listings
        </Link>
      </div>
    );
  }

  const seller = listing.seller;
  const sellerLabel = seller?.name
    ? `${seller.name} (${seller.email})`
    : seller?.email || "—";

  const sellerCompanyName = seller?.companyName?.trim() || "";
  const verified = Boolean(seller?.isVerified);

  const contactDisabledReason = !isAuthenticated
    ? "Log in as a buyer to contact sellers."
    : user?.role !== "buyer"
      ? "Only buyers can contact sellers."
      : "";

  const emailHref = seller?.email
    ? `mailto:${seller.email}?subject=${encodeURIComponent(
        `Inquiry about ${listing.companyName}`
      )}`
    : null;

  const whatsappText = `Hi, I'm interested in your listing on HydroSphere: ${listing.companyName}.`;
  const whatsappNumberRaw = seller?.phone ? String(seller.phone) : "";
  let whatsappNumber = whatsappNumberRaw.replace(/[^\d]/g, "");
  if (whatsappNumber.length === 10) whatsappNumber = `91${whatsappNumber}`;
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <Link
        to="/"
        className="mb-4 inline-flex min-h-[44px] items-center text-sm font-medium text-sky-700 hover:underline"
      >
        ← All listings
      </Link>

      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white px-4 py-4 sm:px-6">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            {listing.companyName}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span>Listed by {sellerLabel}</span>
            {sellerCompanyName && <span className="text-slate-400">·</span>}
            {sellerCompanyName && <span className="text-slate-700">{sellerCompanyName}</span>}
            {verified && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Verified Seller
              </span>
            )}
          </div>
        </div>

        <dl className="grid gap-4 px-4 py-5 sm:grid-cols-2 sm:px-6">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Hydrogen type</dt>
            <dd className="mt-1 text-lg font-medium text-slate-900">{listing.hydrogenType}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Price</dt>
            <dd className="mt-1 text-lg font-medium text-slate-900">${listing.price}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Quantity</dt>
            <dd className="mt-1 text-lg font-medium text-slate-900">{listing.quantity}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Location</dt>
            <dd className="mt-1 text-lg font-medium text-slate-900 break-words">{listing.location}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</dt>
            <dd className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {listing.description || "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Listed</dt>
            <dd className="mt-1 text-sm text-slate-700">{formatDate(listing.createdAt)}</dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-4 sm:flex-row sm:px-6">
          <button
            type="button"
            onClick={toggleSave}
            disabled={saveBusy}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60 sm:flex-none"
          >
            {saveBusy && <Spinner className="h-4 w-4" />}
            {listing.saved ? "Remove from saved" : "Save listing"}
          </button>

          <button
            type="button"
            title={contactDisabledReason || "Send an inquiry to the seller"}
            disabled={Boolean(contactDisabledReason)}
            onClick={() => {
              if (!isAuthenticated) {
                showToast("Log in as a buyer to contact sellers.");
                navigate("/login", { state: { from: { pathname: `/listings/${id}` } } });
                return;
              }
              if (user?.role !== "buyer") {
                showToast("Only buyers can contact sellers.");
                return;
              }
              setInquiryOpen(true);
            }}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
          >
            Contact seller
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            WhatsApp
          </a>

          <a
            href={emailHref || undefined}
            onClick={(e) => {
              if (!emailHref) {
                e.preventDefault();
                showToast("Seller email not available.");
              }
            }}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Email
          </a>
        </div>
      </article>

      <InquiryModal
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        listing={listing}
        prefill={{ name: user?.name, email: user?.email }}
        showToast={showToast}
      />
    </div>
  );
}

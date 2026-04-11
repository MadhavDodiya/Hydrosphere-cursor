import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListingCard from "../components/ListingCard.jsx";
import Loader, { Spinner } from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { fetchListings, deleteListing } from "../services/listingService.js";
import { fetchSellerInquiries } from "../services/inquiryService.js";
import { fetchSavedListings, unsaveListing } from "../services/savedService.js";
import { updateMe } from "../services/userService.js";
import { getApiErrorMessage } from "../utils/apiError.js";

/**
 * Seller: own listings + edit/delete.
 * Buyer: saved listings only (bookmark from listing details).
 */
export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [companyName, setCompanyName] = useState(() => user?.companyName || "");
  const [profileBusy, setProfileBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      if (user.role === "seller") {
        const data = await fetchListings({ seller: user.id });
        setListings(data);
      } else {
        const data = await fetchSavedListings();
        setListings(data);
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, "Could not load dashboard data.");
      setError(msg);
      showToast(msg);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setCompanyName(user?.companyName || "");
  }, [user?.companyName]);

  const loadInquiries = useCallback(async () => {
    if (user?.role !== "seller") return;
    setInquiriesLoading(true);
    try {
      const data = await fetchSellerInquiries();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Could not load inquiries.");
      showToast(msg);
      setInquiries([]);
    } finally {
      setInquiriesLoading(false);
    }
  }, [user?.role, showToast]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const handleDelete = async (listing) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await deleteListing(listing._id);
      setListings((prev) => prev.filter((l) => l._id !== listing._id));
      showToast("Listing deleted.", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Delete failed"));
    }
  };

  const handleUnsave = async (listing) => {
    try {
      await unsaveListing(listing._id);
      setListings((prev) => prev.filter((l) => l._id !== listing._id));
      showToast("Removed from saved.", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Could not remove listing."));
    }
  };

  const isSeller = user?.role === "seller";
  const title = isSeller ? "Seller dashboard" : "Buyer dashboard";
  const subtitle = isSeller
    ? "Your hydrogen listings. Create new ones from the navbar."
    : "Listings you saved. Browse the marketplace to add more.";

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!isSeller) return;
    setProfileBusy(true);
    try {
      const next = await updateMe({ companyName });
      updateUser(next);
      showToast("Profile updated.", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Could not update profile."));
    } finally {
      setProfileBusy(false);
    }
  };

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>

      {isSeller && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Seller profile</h2>
              <p className="mt-1 text-sm text-slate-600">
                {user?.isVerified ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Verified Seller
                  </span>
                ) : (
                  <span className="text-slate-500">Not verified yet</span>
                )}
              </p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-800">Company name</span>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="min-h-[44px] rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-sky-500"
                placeholder="Your company"
              />
            </label>
            <button
              type="submit"
              disabled={profileBusy}
              className="min-h-[44px] rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {profileBusy && <Spinner className="h-4 w-4" />}
              Save
            </button>
          </form>
        </section>
      )}

      {loading && <Loader label="Loading dashboard" />}

      {!loading && error && (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {!loading && !error && listings.length === 0 && (
        <p className="mt-8 text-slate-600">
          {isSeller
            ? "You have no listings yet. Use “Add listing” in the menu."
            : "No saved listings yet. Open any listing and tap “Save listing”."}
        </p>
      )}

      {!loading && listings.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              showSellerActions={isSeller}
              onUnsave={!isSeller ? handleUnsave : undefined}
              onEdit={(l) => navigate(`/add-listing/${l._id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isSeller && (
        <section className="mt-10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">Inquiries</h2>
            <button
              type="button"
              onClick={loadInquiries}
              disabled={inquiriesLoading}
              className="min-h-[40px] rounded-md border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60 inline-flex items-center gap-2"
            >
              {inquiriesLoading && <Spinner className="h-4 w-4" />}
              Refresh
            </button>
          </div>

          {inquiriesLoading && inquiries.length === 0 && (
            <div className="mt-4">
              <Loader label="Loading inquiries" />
            </div>
          )}

          {!inquiriesLoading && inquiries.length === 0 && (
            <p className="mt-4 text-sm text-slate-600">No inquiries yet.</p>
          )}

          {inquiries.length > 0 && (
            <div className="mt-4 grid gap-3">
              {inquiries.map((inq) => {
                const buyer = inq.buyerId;
                const l = inq.listingId;
                return (
                  <article key={inq._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">
                        {buyer?.name || inq.name || "Buyer"}
                        {buyer?.email && <span className="text-slate-500"> · {buyer.email}</span>}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(inq.createdAt)}</p>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{inq.message}</p>

                    {l && (
                      <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                        <span className="font-medium">{l.companyName}</span>
                        <span className="text-slate-500"> · {l.hydrogenType}</span>
                        <span className="text-slate-500"> · {l.location}</span>
                        <span className="text-slate-500"> · ${l.price}</span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

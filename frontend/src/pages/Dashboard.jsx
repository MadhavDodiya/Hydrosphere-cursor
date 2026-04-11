import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListingCard from "../components/ListingCard.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { fetchListings, deleteListing } from "../services/listingService.js";
import { fetchSavedListings, unsaveListing } from "../services/savedService.js";
import { getApiErrorMessage } from "../utils/apiError.js";

/**
 * Seller: own listings + edit/delete.
 * Buyer: saved listings only (bookmark from listing details).
 */
export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>

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
    </div>
  );
}

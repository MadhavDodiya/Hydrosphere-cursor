import { useCallback, useEffect, useState } from "react";
import FilterBar from "../components/FilterBar.jsx";
import ListingCard from "../components/ListingCard.jsx";
import Loader from "../components/Loader.jsx";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { fetchListings } from "../services/listingService.js";
import { getApiErrorMessage } from "../utils/apiError.js";
import { useToast } from "../context/ToastContext.jsx";

/**
 * Public listings page with debounced search and filters.
 */
export default function Marketplace() {
  const { showToast } = useToast();
  const [listings, setListings] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = { ...appliedFilters };
    if (debouncedSearch.trim()) params.q = debouncedSearch.trim();
    try {
      const data = await fetchListings(params);
      setListings(data);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Could not load listings.");
      setError(msg);
      showToast(msg);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, debouncedSearch, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Hydrogen listings</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Green hydrogen marketplace — search listings by keyword (company, location, or description), then refine
            with filters.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <FilterBar
          searchQuery={searchInput}
          onSearchChange={setSearchInput}
          onFilter={setAppliedFilters}
          initial={appliedFilters}
        />
      </div>

      {loading && <Loader label="Loading listings" className="py-10" />}

      {!loading && error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{error}</p>
          <button
            type="button"
            className="mt-3 rounded bg-slate-800 px-4 py-2 text-xs font-medium text-white hover:bg-slate-900"
            onClick={() => load()}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <p className="text-slate-600">No listings match your search or filters.</p>
      )}

      {!loading && listings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}


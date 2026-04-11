import { Link } from "react-router-dom";

/**
 * Listing preview — spec: company, type, price, location (details page has the rest).
 */
export default function ListingCard({
  listing,
  showSellerActions = false,
  onEdit,
  onDelete,
  onUnsave,
}) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-lg font-semibold text-slate-800">{listing.companyName}</h3>
      <dl className="mt-3 grid flex-1 gap-2 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Hydrogen type</dt>
          <dd className="font-medium text-slate-800">{listing.hydrogenType}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Price</dt>
          <dd className="font-medium text-slate-800">${listing.price}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Location</dt>
          <dd className="max-w-[60%] break-words text-right font-medium text-slate-800">
            {listing.location}
          </dd>
        </div>
      </dl>

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
        <Link
          to={`/listings/${listing._id}`}
          className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-sky-600 py-2.5 text-center text-sm font-medium text-white hover:bg-sky-700"
        >
          View details
        </Link>
        {onUnsave && (
          <button
            type="button"
            onClick={() => onUnsave(listing)}
            className="w-full rounded-lg border border-slate-300 py-2.5 text-sm text-slate-700 hover:bg-slate-50 min-h-[44px]"
          >
            Remove from saved
          </button>
        )}
        {showSellerActions && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(listing)}
              className="min-h-[44px] flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800 hover:bg-slate-200"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(listing)}
              className="min-h-[44px] flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

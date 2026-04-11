import { useState } from "react";

const HYDROGEN_TYPES = ["", "Green", "Blue", "Grey"];

/**
 * Keyword search (debounced in parent) + location, type, and price filters.
 */
export default function FilterBar({
  searchQuery = "",
  onSearchChange,
  onFilter,
  initial = {},
}) {
  const [location, setLocation] = useState(initial.location || "");
  const [hydrogenType, setHydrogenType] = useState(initial.hydrogenType || "");
  const [minPrice, setMinPrice] = useState(initial.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice ?? "");

  const buildParams = () => {
    const params = {};
    if (location.trim()) params.location = location.trim();
    if (hydrogenType) params.hydrogenType = hydrogenType;
    if (minPrice !== "" && !Number.isNaN(Number(minPrice))) params.minPrice = Number(minPrice);
    if (maxPrice !== "" && !Number.isNaN(Number(maxPrice))) params.maxPrice = Number(maxPrice);
    return params;
  };

  const apply = (e) => {
    e.preventDefault();
    onFilter(buildParams());
  };

  const clear = () => {
    setLocation("");
    setHydrogenType("");
    setMinPrice("");
    setMaxPrice("");
    onSearchChange?.("");
    onFilter({});
  };

  return (
    <form
      onSubmit={apply}
      className="mb-6 space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="w-full">
        <label
          htmlFor="hs-search"
          className="mb-1 block text-xs font-medium text-slate-600"
        >
          Search (company or location)
        </label>
        <input
          id="hs-search"
          type="search"
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm min-h-[44px]"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Type to search…"
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1 sm:min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-slate-600">Location filter</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-2 text-sm min-h-[44px]"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Texas"
          />
        </div>
        <div className="w-full sm:w-auto sm:min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-slate-600">Hydrogen type</label>
          <select
            className="w-full rounded border border-slate-300 px-2 py-2 text-sm min-h-[44px]"
            value={hydrogenType}
            onChange={(e) => setHydrogenType(e.target.value)}
          >
            {HYDROGEN_TYPES.map((t) => (
              <option key={t || "any"} value={t}>
                {t || "Any"}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:w-auto">
          <div className="w-full sm:w-28">
            <label className="mb-1 block text-xs font-medium text-slate-600">Min $</label>
            <input
              type="number"
              min={0}
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm min-h-[44px]"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-28">
            <label className="mb-1 block text-xs font-medium text-slate-600">Max $</label>
            <input
              type="number"
              min={0}
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm min-h-[44px]"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="submit"
            className="min-h-[44px] flex-1 rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 sm:flex-none"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={clear}
            className="min-h-[44px] flex-1 rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 sm:flex-none"
          >
            Clear all
          </button>
        </div>
      </div>
    </form>
  );
}

import React, { useState, useEffect } from "react";

export default function FilterSidebar({ filters = {}, onFilterChange = () => {} }) {
  // 5. Logic Bug: Safe normalization
  const normalizedFilters = {
    ...filters,
    types: Array.isArray(filters.types) ? filters.types : []
  };

  // 9. Debounce Logic for Location
  const [localLocation, setLocalLocation] = useState(filters.location || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localLocation !== filters.location) {
        onFilterChange(prev => ({ ...prev, location: localLocation }));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localLocation, onFilterChange, filters.location]);

  // Sync local state if filters change from outside (e.g. Clear All)
  useEffect(() => {
    setLocalLocation(filters.location || "");
  }, [filters.location]);

  const handleTypeChange = (type) => {
    onFilterChange(prev => {
      const currentTypes = Array.isArray(prev.types) ? prev.types : [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type];
      return { ...prev, types: newTypes };
    });
  };

  const handleClear = () => {
    // 3. Filter Reset Logic
    onFilterChange({
      location: "",
      types: [],
      minPrice: "",
      maxPrice: "",
      minRating: null,
      deliveryAvailability: ""
    });
  };

  return (
    <div className="bg-white p-8 md:p-10 rounded-[42px] shadow-2xl shadow-black/[0.03] border border-black/[0.02] lg:sticky lg:top-24 animate-apple">
      <div className="space-y-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-black text-[#1d1d1f] uppercase tracking-widest">Filters</h3>
          <button 
            className="text-sm font-bold text-[#0071E3] hover:underline transition-all active:scale-95" 
            onClick={handleClear}
          >
            Clear All
          </button>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <label htmlFor="filter-location" className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1 cursor-pointer">
            Location
          </label>
          <div className="relative group">
            <i className="bi bi-geo-alt absolute left-5 top-1/2 -translate-y-1/2 text-[#86868b] group-focus-within:text-[#0071E3] transition-colors" />
            <input
              id="filter-location"
              type="text"
              className="form-control-apple w-full pl-12"
              placeholder="Search region..."
              value={localLocation}
              onChange={(e) => setLocalLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Hydrogen Type */}
        <div className="space-y-4">
          <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">Hydrogen Type</label>
          <div className="space-y-3">
            {['Green Hydrogen', 'Blue Hydrogen', 'Grey Hydrogen'].map((type, idx) => (
              <label key={type} htmlFor={`type-${idx}`} className="flex items-center gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    id={`type-${idx}`}
                    type="checkbox"
                    className="peer sr-only"
                    checked={normalizedFilters.types.includes(type)}
                    onChange={() => handleTypeChange(type)}
                  />
                  <div className="w-6 h-6 rounded-[8px] bg-black/[0.03] border border-black/[0.05] peer-checked:bg-[#0071E3] peer-checked:border-[#0071E3] transition-all" />
                  <i className="bi bi-check text-white absolute scale-0 peer-checked:scale-100 transition-transform font-bold" />
                </div>
                <span className={`text-sm font-bold transition-colors ${normalizedFilters.types.includes(type) ? 'text-[#0071E3]' : 'text-[#1d1d1f] group-hover:text-[#0071E3]'}`}>
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">Price Range (₹/kg)</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <input
                id="min-price"
                type="number"
                className="form-control-apple w-full text-center px-2"
                placeholder="Min"
                value={filters.minPrice || ""}
                onChange={(e) => onFilterChange(prev => ({
                  ...prev,
                  minPrice: e.target.value ? Number(e.target.value) : ""
                }))}
              />
            </div>
            <span className="text-[#86868b] text-[10px] font-black uppercase tracking-tighter mt-1">to</span>
            <div className="flex-1 space-y-1">
              <input
                id="max-price"
                type="number"
                className="form-control-apple w-full text-center px-2"
                placeholder="Max"
                value={filters.maxPrice || ""}
                onChange={(e) => onFilterChange(prev => ({
                  ...prev,
                  maxPrice: e.target.value ? Number(e.target.value) : ""
                }))}
              />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-4">
          <label htmlFor="availability" className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1 cursor-pointer">
            Availability
          </label>
          <div className="relative">
            <select
              id="availability"
              className="form-control-apple w-full appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTIgMSIgc3Ryb2tlPSIjODY4NjhCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-no-repeat bg-[right_1.25rem_center]"
              value={filters.deliveryAvailability || ""}
              onChange={(e) => onFilterChange(prev => ({ ...prev, deliveryAvailability: e.target.value }))}
            >
              <option value="">Any Availability</option>
              <option value="Available">Ready to Ship</option>
              <option value="30 Days Lead Time">30 Days Lead Time</option>
              <option value="60 Days Lead Time">60 Days Lead Time</option>
              <option value="Pickup Only">Pickup Only</option>
            </select>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-4">
          <label htmlFor="min-rating" className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1 cursor-pointer">
            Min Rating
          </label>
          <label htmlFor="min-rating" className="flex items-center gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                id="min-rating"
                type="checkbox"
                className="peer sr-only"
                checked={!!filters.minRating}
                onChange={(e) => onFilterChange(prev => ({ ...prev, minRating: e.target.checked ? 4 : null }))}
              />
              <div className="w-6 h-6 rounded-[8px] bg-black/[0.03] border border-black/[0.05] peer-checked:bg-[#FF9500] peer-checked:border-[#FF9500] transition-all" />
              <i className="bi bi-star-fill text-white absolute scale-0 peer-checked:scale-100 transition-transform text-[10px]" />
            </div>
            <div className="flex items-center gap-1 text-[#FF9500]">
              <i className="bi bi-star-fill" />
              <i className="bi bi-star-fill" />
              <i className="bi bi-star-fill" />
              <i className="bi bi-star-fill" />
              <i className="bi bi-star text-[#c1c1c6]" />
              <span className="text-sm font-bold text-[#86868b] ml-1">& Up</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

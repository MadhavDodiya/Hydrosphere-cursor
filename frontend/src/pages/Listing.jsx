import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import { Card, Button, Badge } from '../components/ui';
import api from '../api/axiosInstance';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

export default function Listing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0 });

  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    types: searchParams.get('types')?.split(',') || [],
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || null,
    deliveryAvailability: searchParams.get('deliveryAvailability') || ''
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.location) params.append('location', filters.location);
        if (filters.types.length) params.append('types', filters.types.join(','));
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.minRating) params.append('minRating', filters.minRating);
        if (filters.deliveryAvailability) params.append('deliveryAvailability', filters.deliveryAvailability);

        const response = await api.get(`/listings?${params.toString()}`);
        const result = response.data || response; // Handle both direct data and wrapped response
        
        const listingData = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
        const totalCount = typeof result.total === 'number' ? result.total : listingData.length;

        setListings(listingData);
        setStats({ total: totalCount });
        setSearchParams(params);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
    window.scrollTo(0, 0);
  }, [filters, setSearchParams]);

  return (
    <div className="bg-[#F5F5F7] min-h-screen selection:bg-[#0071E3]/10">
      <Helmet>
        <title>Marketplace | HydroSphere — Source Verified Hydrogen</title>
      </Helmet>

      {/* Header */}
      <section className="pt-24 pb-12 px-6 bg-white border-b border-black/[0.03]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge variant="primary" className="mb-4">Global Network</Badge>
            <h1 className="text-4xl md:text-5xl font-black text-[#1d1d1f] tracking-tight mb-2">Hydrogen Marketplace</h1>
            <p className="text-[#86868b] font-medium">Discover {stats.total} verified suppliers across the globe.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest mb-1">Market Sentiment</p>
                <div className="flex items-center gap-2 text-green-600 font-bold">
                   <i className="bi bi-graph-up-arrow" />
                   <span>Supply Growing</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1">
             <FilterSidebar filters={filters} onFilterChange={setFilters} />
          </aside>

          {/* Results */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 4, 5, 6].map(i => (
                  <Card key={i} className="h-96 animate-pulse bg-white/50 border-none" hover={false} />
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-apple">
                {listings.map(item => (
                  <Link key={item._id} to={`/listings/${item._id}`}>
                    <Card className="p-0 overflow-hidden h-full flex flex-col group">
                       <div className="p-8 pb-0 flex justify-between items-start">
                          <Badge variant={item.hydrogenType === 'Green Hydrogen' ? 'success' : 'neutral'}>
                            {item.hydrogenType}
                          </Badge>
                          <div className="flex items-center gap-1 text-[#FF9500] text-xs font-bold">
                             <i className="bi bi-star-fill" />
                             <span>4.9</span>
                          </div>
                       </div>
                       
                       <div className="p-8 pt-6 flex-grow">
                          <h3 className="text-2xl font-black text-[#1d1d1f] mb-2 tracking-tight group-hover:text-[#0071E3] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm font-bold text-[#86868b] mb-6 flex items-center gap-2">
                             <i className="bi bi-geo-alt-fill text-[#0071E3]" />
                             {item.location}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 py-6 border-y border-black/[0.03]">
                             <div>
                                <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest mb-1">Purity</p>
                                <p className="text-sm font-bold text-[#1d1d1f]">{item.purity}%</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest mb-1">Availability</p>
                                <p className="text-sm font-bold text-[#1d1d1f]">{item.deliveryAvailability}</p>
                             </div>
                          </div>
                       </div>

                       <div className="p-8 bg-[#F5F5F7]/50 flex items-center justify-between border-t border-black/[0.03]">
                          <div>
                             <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest mb-1">Price Start</p>
                             <p className="text-xl font-black text-[#1d1d1f]">₹{item.pricePerKg}<span className="text-xs font-bold text-[#86868b]">/kg</span></p>
                          </div>
                          <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">View Detail</Button>
                       </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="py-32 flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-[#F5F5F7] rounded-full flex items-center justify-center text-[#86868b] text-3xl mb-6">
                    <i className="bi bi-search" />
                 </div>
                 <h2 className="text-2xl font-black text-[#1d1d1f] mb-2">No results found</h2>
                 <p className="text-[#86868b] font-medium mb-10 max-w-sm">Try adjusting your filters or search keywords to find what you're looking for.</p>
                 <Button variant="secondary" onClick={() => setFilters({
                    location: '', types: [], minPrice: '', maxPrice: '', minRating: null, deliveryAvailability: ''
                 })}>Clear All Filters</Button>
              </Card>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Badge } from '../components/ui';
import api from '../api/axiosInstance';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import InquiryModal from '../components/InquiryModal';
import { Helmet } from 'react-helmet-async';

export default function Detail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInquiry, setShowInquiry] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/listings/${id}`);
        setListing(response.data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
      <div className="w-10 h-10 border-4 border-black/5 border-t-[#0071E3] rounded-full animate-spin" />
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] p-6 text-center">
       <h1 className="text-3xl font-black mb-4">Listing Not Found</h1>
       <Button onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
    </div>
  );

  return (
    <div className="bg-[#F5F5F7] min-h-screen selection:bg-[#0071E3]/10">
      <Helmet>
        <title>{listing.title} | HydroSphere Marketplace</title>
      </Helmet>

      {/* Hero / Header */}
      <section className="pt-24 pb-12 px-6 bg-white border-b border-black/[0.03]">
        <div className="max-w-7xl mx-auto">
           <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm font-bold text-[#86868b] hover:text-[#0071E3] mb-8 transition-colors">
              <i className="bi bi-arrow-left" /> Back to Marketplace
           </Link>
           
           <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="animate-apple">
                 <div className="flex items-center gap-3 mb-6">
                    <Badge variant="primary">{listing.hydrogenType}</Badge>
                    <Badge variant="success">Available Now</Badge>
                 </div>
                 <h1 className="text-4xl md:text-6xl font-black text-[#1d1d1f] tracking-tight mb-4">
                    {listing.title}
                 </h1>
                 <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2 text-[#86868b] font-bold">
                       <i className="bi bi-geo-alt-fill text-[#0071E3]" />
                       {listing.location}
                    </div>
                    <div className="w-[1px] h-4 bg-black/10" />
                    <div className="flex items-center gap-2 text-[#FF9500] font-bold">
                       <i className="bi bi-star-fill" />
                       <span>4.9 (24 Reviews)</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-4 animate-apple">
                 <div className="text-right hidden md:block mr-4">
                    <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest mb-1">Estimated Price</p>
                    <p className="text-3xl font-black text-[#1d1d1f]">₹{listing.pricePerKg}<span className="text-sm font-bold text-[#86868b]">/kg</span></p>
                 </div>
                 <Button size="lg" className="px-10 py-5 shadow-2xl shadow-blue-500/20" onClick={() => isAuthenticated ? setShowInquiry(true) : navigate('/login')}>
                    Send Inquiry
                 </Button>
              </div>
           </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* Left: Specs & Description */}
            <div className="lg:col-span-2 space-y-16 animate-apple">
               
               {/* Gallery Mockup */}
               <div className="aspect-video bg-white rounded-[42px] shadow-2xl shadow-black/[0.03] border border-black/[0.02] flex items-center justify-center text-[#86868b] text-4xl overflow-hidden group relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#0071E3]/5 to-transparent" />
                  <i className="bi bi-image text-white/50 relative z-10" />
               </div>

               <div className="space-y-10">
                  <h3 className="text-2xl font-black text-[#1d1d1f] tracking-tight">Product Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {[
                       { label: 'Purity Level', value: `${listing.purity}%`, icon: 'bi-droplet-fill' },
                       { label: 'MOQ', value: `${listing.minOrderQuantity} kg`, icon: 'bi-box-fill' },
                       { label: 'Max Capacity', value: `${listing.maxCapacity} MT/year`, icon: 'bi-speedometer' },
                       { label: 'Logistics', value: listing.deliveryAvailability, icon: 'bi-truck' },
                       { label: 'Certification', value: 'PESO & ISO 9001', icon: 'bi-patch-check-fill' },
                       { label: 'Origin', value: listing.location, icon: 'bi-globe-central-south-asia' }
                     ].map((spec, i) => (
                       <Card key={i} className="p-6 flex items-center gap-4 bg-white/50 border-none shadow-sm" hover={true}>
                          <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/5 flex items-center justify-center text-xl text-[#0071E3]">
                             <i className={`bi ${spec.icon}`} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest mb-0.5">{spec.label}</p>
                             <p className="text-sm font-bold text-[#1d1d1f]">{spec.value}</p>
                          </div>
                       </Card>
                     ))}
                  </div>
               </div>

               <div className="space-y-10">
                  <h3 className="text-2xl font-black text-[#1d1d1f] tracking-tight">About this product</h3>
                  <p className="text-[#86868b] font-medium leading-[1.8] text-lg">
                     {listing.description}
                  </p>
               </div>
            </div>

            {/* Right: Supplier Info & Trust */}
            <aside className="space-y-10 animate-apple">
               <Card className="p-8 border-none shadow-2xl shadow-black/[0.03]">
                  <h4 className="text-[11px] font-black text-[#86868b] uppercase tracking-widest mb-8">Supplier Profile</h4>
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-16 h-16 rounded-full bg-[#f5f5f7] border border-black/5 flex items-center justify-center text-2xl font-black text-[#1d1d1f] shadow-sm">
                        {listing.supplierId?.name?.[0] || 'S'}
                     </div>
                     <div>
                        <h5 className="text-lg font-black text-[#1d1d1f] tracking-tight">{listing.supplierId?.companyName}</h5>
                        <div className="flex items-center gap-2 text-[#0071E3] font-bold text-xs mt-1">
                           <i className="bi bi-patch-check-fill" />
                           Verified Supplier
                        </div>
                     </div>
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-black/[0.03]">
                     <div className="flex justify-between text-sm">
                        <span className="text-[#86868b] font-medium">Joined</span>
                        <span className="text-[#1d1d1f] font-bold">Oct 2024</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-[#86868b] font-medium">Fulfillment Rate</span>
                        <span className="text-[#1d1d1f] font-bold">98.2%</span>
                     </div>
                  </div>

                  <Button variant="secondary" className="w-full mt-10">Visit Storefront</Button>
               </Card>

               <Card className="p-8 bg-[#1d1d1f] text-white border-none shadow-xl">
                  <i className="bi bi-shield-lock-fill text-[#0071E3] text-3xl mb-6 block" />
                  <h4 className="text-lg font-black mb-4 tracking-tight">HydroSphere Guarantee</h4>
                  <p className="text-white/60 text-sm font-medium leading-relaxed mb-8">
                     All trade communications and inquiry logs are encrypted and stored for audit compliance. 
                     We verify the PESO certification of every supplier on our platform.
                  </p>
                  <Link to="/about" className="text-xs font-black text-[#0071E3] uppercase tracking-widest hover:underline">Learn about safety</Link>
               </Card>
            </aside>
         </div>
      </div>

      <Footer />

      {showInquiry && (
        <InquiryModal 
          listing={listing} 
          onClose={() => setShowInquiry(false)} 
        />
      )}
    </div>
  );
}

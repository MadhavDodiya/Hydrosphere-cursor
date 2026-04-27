import React from "react";
import { Link } from "react-router-dom";
import { Card, Badge, Button } from "./ui";

export default function SupplierCard({ supplier }) {
  if (!supplier) {
    return (
      <Card className="h-[420px] animate-pulse bg-white/50 border-none" hover={false} />
    );
  }

  const { 
    id, _id, name, location, rating, description, 
    price, pricePerKg, imageUrl, images,
    hydrogenType, type, 
    deliveryAvailability, productionCapacity, 
    isVerified, purity 
  } = supplier;

  const displayId = _id || id;
  const displayPrice = price || pricePerKg;
  const displayType = hydrogenType || type;
  const displayImage = (images && images[0]) || imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop";

  return (
    <Link to={`/listings/${displayId}`}>
      <Card className="p-0 overflow-hidden h-full flex flex-col group transition-all duration-500 hover:translate-y-[-8px]">
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={displayImage} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt={name} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {isVerified && (
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-black/5">
                <i className="bi bi-patch-check-fill text-[#0071E3] text-xs" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1d1d1f]">Verified</span>
              </div>
            )}
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-black/5">
               <i className="bi bi-star-fill text-[#FF9500] text-xs" />
               <span className="text-[10px] font-black text-[#1d1d1f]">{rating || "4.9"}</span>
            </div>
          </div>

          {purity && (
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{purity}% Purity</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-8 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <Badge variant={displayType === 'Green Hydrogen' ? 'success' : 'primary'}>
              {displayType}
            </Badge>
          </div>
          
          <h3 className="text-xl font-black text-[#1d1d1f] mb-2 tracking-tight group-hover:text-[#0071E3] transition-colors line-clamp-1">
            {name}
          </h3>
          
          <p className="text-xs font-bold text-[#86868b] mb-6 flex items-center gap-1.5">
            <i className="bi bi-geo-alt-fill text-[#0071E3]" />
            {location}
          </p>
          
          <p className="text-sm font-medium text-[#86868b] line-clamp-2 mb-6 leading-relaxed flex-grow">
            {description}
          </p>

          <div className="flex items-center gap-3 mb-6">
            {deliveryAvailability && (
              <div className="bg-black/[0.03] px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#86868b] flex items-center gap-1">
                <i className="bi bi-truck" /> {deliveryAvailability}
              </div>
            )}
            {productionCapacity && (
              <div className="bg-black/[0.03] px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#86868b] flex items-center gap-1">
                <i className="bi bi-gear" /> {productionCapacity}
              </div>
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div className="px-8 py-6 bg-[#F5F5F7]/50 border-t border-black/[0.03] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest mb-0.5">Price Start</p>
            <p className="text-xl font-black text-[#1d1d1f]">
              ₹{displayPrice}<span className="text-xs font-bold text-[#86868b]">/kg</span>
            </p>
          </div>
          <Button size="sm" className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            View Details
          </Button>
        </div>
      </Card>
    </Link>
  );
}


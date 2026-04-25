import React from 'react';
import { Card } from '../ui';

export default function StatsCard({ title, value, trend, icon, colorClass, loading }) {
  const colors = {
    primary: 'text-[#0071E3] bg-[#0071E3]/5',
    success: 'text-green-600 bg-green-50',
    warning: 'text-orange-600 bg-orange-50',
    info: 'text-purple-600 bg-purple-50',
    error: 'text-red-600 bg-red-50',
  };

  if (loading) {
    return (
      <Card className="p-6 animate-pulse border-none shadow-sm" hover={false}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-black/[0.03]" />
          <div className="space-y-2 flex-grow">
            <div className="h-2 bg-black/[0.03] rounded-full w-1/2" />
            <div className="h-4 bg-black/[0.03] rounded-full w-3/4" />
          </div>
        </div>
      </Card>
    );
  }

  const isTrendPositive = trend?.startsWith('+');

  return (
    <Card className="p-6 border-none shadow-sm group hover:ring-2 hover:ring-[#0071E3]/5 transition-all">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${colors[colorClass] || colors.primary}`}>
          <i className={`bi ${icon}`} />
        </div>
        <div>
          <p className="text-[10px] font-black text-[#86868b] uppercase tracking-[0.2em] mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-[#1d1d1f] tracking-tight">{value}</h3>
            {trend && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${isTrendPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Mini Visualizer */}
      <div className="flex items-end gap-1 h-8 px-1">
        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-t-sm transition-all duration-500 delay-[${i * 50}ms] ${isTrendPositive ? 'bg-[#0071E3]/10 group-hover:bg-[#0071E3]/20' : 'bg-red-500/10 group-hover:bg-red-500/20'}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </Card>
  );
}

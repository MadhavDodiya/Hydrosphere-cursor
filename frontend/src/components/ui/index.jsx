import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false, 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-full';
  
  const variants = {
    primary: 'bg-[#0071E3] text-white shadow-lg shadow-blue-500/20 hover:bg-[#0077ED]',
    secondary: 'bg-black/[0.03] text-[#1d1d1f] hover:bg-black/[0.06]',
    outline: 'border-2 border-[#0071E3] text-[#0071E3] hover:bg-[#0071E3] hover:text-white',
    ghost: 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.03]',
    danger: 'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-10 py-4 text-base',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {children}
    </button>
  );
};

export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <input
        className={`form-control-apple w-full ${error ? 'ring-2 ring-red-500/20 border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[10px] text-red-500 font-bold ml-1 animate-apple">
          {error}
        </p>
      )}
    </div>
  );
};

export const Card = ({ children, className = '', hover = true }) => {
  return (
    <div className={`bg-white rounded-[32px] p-8 shadow-2xl shadow-black/[0.03] border border-black/[0.02] transition-all duration-400 ${hover ? 'hover:scale-[1.01] hover:shadow-black/[0.06]' : ''} ${className}`}>
      {children}
    </div>
  );
};

export const Badge = ({ children, variant = 'neutral' }) => {
  const variants = {
    neutral: 'bg-black/[0.05] text-[#86868b]',
    success: 'bg-green-50 text-green-600 border border-green-100',
    warning: 'bg-orange-50 text-orange-600 border border-orange-100',
    error: 'bg-red-50 text-red-600 border border-red-100',
    primary: 'bg-[#0071E3]/5 text-[#0071E3] border border-[#0071E3]/10',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${variants[variant]}`}>
      {children}
    </span>
  );
};

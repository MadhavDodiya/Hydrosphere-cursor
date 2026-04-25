import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    location: '',
    businessRegistrationNumber: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1 && role === 'supplier') {
      setStep(2);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await register({ ...formData, role });
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 selection:bg-[#0071E3]/10">
      <div className="w-full max-w-[520px] animate-apple">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 transition-transform active:scale-95">
            <div className="w-12 h-12 bg-[#0071E3] rounded-[14px] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
              H
            </div>
          </Link>
          <h1 className="text-3xl font-black text-[#1d1d1f] tracking-tight mt-6">Create account</h1>
          <p className="text-[#86868b] font-medium mt-2">Join the global hydrogen marketplace</p>
        </div>

        <Card className="p-10">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 flex gap-3 animate-apple">
              <i className="bi bi-exclamation-circle text-red-500 mt-0.5" />
              <div className="text-sm text-red-600 font-bold leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <div className="flex p-1 bg-black/[0.03] rounded-[20px] border border-black/[0.02] mb-8">
                  {['buyer', 'supplier'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 py-3 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all ${role === r ? 'bg-white text-[#1d1d1f] shadow-md' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <Input
                  label="Full Name"
                  name="name"
                  placeholder="Jane Doe"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="jane@company.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                />
              </>
            ) : (
              <div className="space-y-6 animate-apple">
                <div className="flex items-center gap-3 mb-6">
                   <button type="button" onClick={() => setStep(1)} className="w-8 h-8 rounded-full bg-black/[0.03] flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                     <i className="bi bi-chevron-left" />
                   </button>
                   <span className="text-sm font-bold text-[#1d1d1f]">Company Details</span>
                </div>
                <Input
                  label="Company Legal Name"
                  name="companyName"
                  placeholder="e.g. H2 Industries"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                />
                <Input
                  label="HQ Location"
                  name="location"
                  placeholder="City, Country"
                  required
                  value={formData.location}
                  onChange={handleChange}
                />
                <Input
                  label="Tax / Reg ID"
                  name="businessRegistrationNumber"
                  placeholder="GSTIN/VAT Number"
                  required
                  value={formData.businessRegistrationNumber}
                  onChange={handleChange}
                />
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {role === 'supplier' && step === 1 ? 'Next: Company Info' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-black/5 text-center">
            <p className="text-sm text-[#86868b] font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-[#0071E3] font-black hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        <p className="mt-10 text-center text-[10px] text-[#86868b] font-medium uppercase tracking-widest leading-relaxed opacity-50 px-6">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 selection:bg-[#0071E3]/10">
      <div className="w-full max-w-[440px] animate-apple">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 transition-transform active:scale-95">
            <div className="w-12 h-12 bg-[#0071E3] rounded-[14px] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
              H
            </div>
          </Link>
          <h1 className="text-3xl font-black text-[#1d1d1f] tracking-tight mt-6">Welcome back</h1>
          <p className="text-[#86868b] font-medium mt-2">Sign in to your HydroSphere account</p>
        </div>

        <Card className="p-10">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 flex gap-3 animate-apple">
              <i className="bi bi-exclamation-circle text-red-500 mt-0.5" />
              <div className="text-sm text-red-600 font-bold leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest">
                  Password
                </label>
                <Link to="/forgot-password" size="sm" className="text-[11px] font-black text-[#0071E3] uppercase tracking-widest hover:underline">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                className="form-control-apple w-full"
                placeholder="Required"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-black/5 text-center">
            <p className="text-sm text-[#86868b] font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#0071E3] font-black hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </Card>

        <p className="mt-10 text-center text-[11px] text-[#86868b] font-medium uppercase tracking-widest opacity-50">
          Secure, Encrypted & Industry Compliant
        </p>
      </div>
    </div>
  );
}
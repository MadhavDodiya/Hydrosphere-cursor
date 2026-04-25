import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import api from '../api/axiosInstance';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await api.post('/auth/reset-password', { token, password });
      setStatus({ type: 'success', message: 'Password has been reset successfully.' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6">
        <Card className="max-w-md w-full p-10 text-center">
           <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 text-2xl">
             <i className="bi bi-x-lg" />
           </div>
           <h2 className="text-xl font-black text-[#1d1d1f] mb-2">Invalid Link</h2>
           <p className="text-sm text-[#86868b] mb-8 font-medium">This password reset link is missing or invalid.</p>
           <Button className="w-full" onClick={() => navigate('/forgot-password')}>Request New Link</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 selection:bg-[#0071E3]/10">
      <div className="w-full max-w-[440px] animate-apple">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 transition-transform active:scale-95">
            <div className="w-12 h-12 bg-[#0071E3] rounded-[14px] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
              H
            </div>
          </Link>
          <h1 className="text-3xl font-black text-[#1d1d1f] tracking-tight mt-6">New password</h1>
          <p className="text-[#86868b] font-medium mt-2">Enter your new secure password</p>
        </div>

        <Card className="p-10">
          {status.message && (
            <div className={`rounded-2xl p-4 mb-8 flex gap-3 animate-apple ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              <i className={`bi bi-${status.type === 'success' ? 'check-circle' : 'exclamation-circle'}-fill mt-0.5`} />
              <div className="text-sm font-bold leading-relaxed">{status.message}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="New Password"
              type="password"
              placeholder="Min. 6 characters"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Reset Password
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-black/5 text-center">
            <Link to="/login" className="text-sm font-black text-[#86868b] hover:text-[#0071E3] transition-colors">
              Cancel and return to sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

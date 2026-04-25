import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import api from '../api/axiosInstance';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus({ type: 'success', message: 'If an account exists for this email, you will receive reset instructions shortly.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 selection:bg-[#0071E3]/10">
      <div className="w-full max-w-[440px] animate-apple">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 transition-transform active:scale-95">
            <div className="w-12 h-12 bg-[#0071E3] rounded-[14px] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
              H
            </div>
          </Link>
          <h1 className="text-3xl font-black text-[#1d1d1f] tracking-tight mt-6">Reset password</h1>
          <p className="text-[#86868b] font-medium mt-2">We'll send you a recovery link</p>
        </div>

        <Card className="p-10">
          {status.message && (
            <div className={`rounded-2xl p-4 mb-8 flex gap-3 animate-apple ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              <i className={`bi bi-${status.type === 'success' ? 'check-circle' : 'exclamation-circle'}-fill mt-0.5`} />
              <div className="text-sm font-bold leading-relaxed">{status.message}</div>
            </div>
          )}

          {!status.message || status.type === 'error' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Send Recovery Link
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
               <Button variant="outline" className="w-full" size="lg" onClick={() => setStatus({ type: '', message: '' })}>
                 Resend Email
               </Button>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-black/5 text-center">
            <Link to="/login" className="text-sm font-black text-[#86868b] hover:text-[#0071E3] transition-colors flex items-center justify-center gap-2">
              <i className="bi bi-arrow-left" /> Back to sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

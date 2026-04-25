import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Badge } from '../components/ui';
import api from '../api/axiosInstance';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 selection:bg-[#0071E3]/10">
      <div className="w-full max-w-[440px] animate-apple">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 transition-transform active:scale-95">
            <div className="w-12 h-12 bg-[#0071E3] rounded-[14px] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
              H
            </div>
          </Link>
        </div>

        <Card className="p-10 text-center">
          {status === 'loading' && (
            <div className="py-10">
              <div className="w-16 h-16 border-4 border-[#0071E3]/20 border-t-[#0071E3] rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">{message}</h2>
              <p className="text-sm text-[#86868b]">Please wait while we secure your account.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="animate-apple py-10">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 text-4xl shadow-sm">
                <i className="bi bi-check-lg" />
              </div>
              <h2 className="text-2xl font-black text-[#1d1d1f] mb-3">Verified!</h2>
              <p className="text-[#86868b] font-medium mb-10 leading-relaxed px-4">
                Your email has been verified. You can now access all features of HydroSphere.
              </p>
              <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="animate-apple py-10">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500 text-3xl shadow-sm">
                <i className="bi bi-x-lg" />
              </div>
              <h2 className="text-2xl font-black text-[#1d1d1f] mb-3">Verification Failed</h2>
              <p className="text-red-600/80 font-bold mb-10 leading-relaxed px-4 italic">
                "{message}"
              </p>
              <div className="space-y-4">
                <Button variant="outline" className="w-full" size="lg" onClick={() => navigate('/contact')}>
                  Contact Support
                </Button>
                <Link to="/login" className="block text-sm font-bold text-[#86868b] hover:text-[#0071E3] transition-colors">
                  Return to login
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
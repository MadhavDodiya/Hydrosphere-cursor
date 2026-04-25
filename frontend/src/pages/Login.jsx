import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowResendLink(false);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = getApiErrorMessage(err, "Login failed. Please check your credentials.");
      setError(msg);
      if (msg.toLowerCase().includes("verify") || msg.toLowerCase().includes("verification")) {
        setShowResendLink(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 selection:bg-[#0071E3]/20">
      <div className="w-full max-w-[440px] animate-apple">
        
        {/* Brand Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 transition-transform active:scale-95">
            <div className="w-12 h-12 bg-[#0071E3] rounded-[14px] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
              H
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mt-6">HydroSphere</h1>
          <p className="text-[#86868b] text-sm font-medium mt-1 uppercase tracking-widest">B2B Hydrogen Marketplace</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl shadow-black/[0.03] border border-black/[0.02]">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-[#1d1d1f]">Welcome Back</h2>
            <p className="text-[#86868b] mt-1">Sign in to manage your energy portfolio.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex gap-3 animate-apple">
              <i className="bi bi-exclamation-circle text-red-500 mt-0.5" />
              <div className="text-sm text-red-600 font-medium leading-relaxed">
                {error}
                {showResendLink && (
                  <div className="mt-2">
                    <Link to="/verify-email" className="text-[#0071E3] hover:underline font-bold">Resend verification email →</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                required
                className="form-control-apple w-full"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-bold text-[#0071E3] uppercase tracking-widest hover:underline">Forgot?</Link>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-control-apple w-full pr-12"
                  placeholder="Required"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#0071E3] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-4 text-base font-bold shadow-xl shadow-blue-500/20 mt-4 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <i className="bi bi-chevron-right text-xs" /></>
              )}
            </button>
          </form>

          <div className="text-center mt-10 pt-6 border-t border-black/5">
            <span className="text-[#86868b] text-sm">New to HydroSphere? </span>
            <Link to="/free-trial" className="text-[#0071E3] text-sm font-bold hover:underline">Start Free Trial</Link>
          </div>
        </div>

        {/* Demo Footer */}
        <div className="mt-8 p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-black/[0.03] text-center">
           <p className="text-[10px] font-black text-[#86868b] uppercase tracking-[0.2em] mb-2">Internal Sandbox Credentials</p>
           <div className="flex flex-col gap-1 text-[11px] text-[#1d1d1f] font-medium opacity-80">
              <p>Supplier: <span className="font-bold">supplier@hydrosphere.demo</span></p>
              <p>Buyer: <span className="font-bold">buyer@hydrosphere.demo</span></p>
              <p>Password: <code className="bg-white/50 px-1 rounded text-[#0071E3]">password123</code></p>
           </div>
        </div>
      </div>
    </div>
  );
}
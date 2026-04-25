import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("buyer");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    
    if (role === "supplier" && (!companyName || !location || !businessRegistrationNumber)) {
      setError("Please fill in all company details.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await register({ 
        name: trimmed, 
        email, 
        password, 
        role, 
        companyName,
        location,
        businessRegistrationNumber 
      });
      setSuccessMsg(data.message || "Registration successful!");
      if (data.token) {
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center py-12 px-6 selection:bg-[#0071E3]/20">
      <div className="w-full max-w-[560px] animate-apple">
        
        {/* Brand Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 transition-transform active:scale-95">
            <div className="w-12 h-12 bg-[#0071E3] rounded-[14px] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
              H
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mt-6">Create Account</h1>
          <p className="text-[#86868b] text-sm font-medium mt-1 uppercase tracking-widest">Join the hydrogen marketplace</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl shadow-black/[0.03] border border-black/[0.02]">
          
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 flex gap-3 animate-apple">
              <i className="bi bi-exclamation-circle text-red-500 mt-0.5" />
              <div className="text-sm text-red-600 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="text-center py-10 animate-apple">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 text-4xl shadow-sm">
                <i className="bi bi-check-lg" />
              </div>
              <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">{successMsg}</h2>
              <p className="text-[#86868b] mb-8">Welcome to the future of energy sourcing.</p>
              <Link to="/dashboard" className="btn-primary inline-flex px-10">Go to Dashboard</Link>
            </div>
          )}

          {!successMsg && (
            <>
              {/* Role Selector */}
              <div className="mb-10">
                <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest ml-1 mb-4 block">Select Account Type</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "buyer", label: "Buyer", icon: "bi-cart3", desc: "Purchase energy" },
                    { value: "supplier", label: "Supplier", icon: "bi-shop", desc: "Sell energy" },
                  ].map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`text-left p-5 rounded-[22px] border-2 transition-all duration-300 ${
                        role === r.value 
                          ? 'bg-[#0071E3]/5 border-[#0071E3] shadow-md shadow-blue-500/10' 
                          : 'bg-[#F5F5F7] border-transparent hover:border-black/5'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${role === r.value ? 'bg-[#0071E3] text-white' : 'bg-white text-[#86868b]'}`}>
                        <i className={`bi ${r.icon} text-lg`} />
                      </div>
                      <div className={`text-sm font-black transition-colors ${role === r.value ? 'text-[#0071E3]' : 'text-[#1d1d1f]'}`}>{r.label}</div>
                      <div className="text-[10px] text-[#86868b] font-medium mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      className="form-control-apple w-full"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
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
                </div>

                {role === "supplier" && (
                  <div className="space-y-6 pt-2 animate-apple">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest ml-1">Company Legal Name</label>
                      <input
                        type="text"
                        required
                        className="form-control-apple w-full"
                        placeholder="e.g. H2 Industries Pvt Ltd"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest ml-1">HQ Location</label>
                        <input
                          type="text"
                          required
                          className="form-control-apple w-full"
                          placeholder="City, Country"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest ml-1">Tax / Reg ID</label>
                        <input
                          type="text"
                          required
                          className="form-control-apple w-full"
                          placeholder="GSTIN/VAT Number"
                          value={businessRegistrationNumber}
                          onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest ml-1">Create Password</label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      className="form-control-apple w-full pr-12"
                      placeholder="Min. 6 characters"
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

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-4 text-base font-bold shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Create Account <i className="bi bi-chevron-right text-xs" /></>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-[#86868b] font-medium mt-4 px-4 leading-relaxed">
                    By joining, you agree to HydroSphere's <span className="text-[#1d1d1f] font-bold underline">Terms of Service</span> and <span className="text-[#1d1d1f] font-bold underline">Privacy Policy</span>.
                  </p>
                </div>
              </form>

              <div className="text-center mt-12 pt-6 border-t border-black/5">
                <span className="text-[#86868b] text-sm">Already have an account? </span>
                <Link to="/login" className="text-[#0071E3] text-sm font-bold hover:underline">Sign In</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Footer from "../components/Footer.jsx";
import { trackEvent, ANALYTICS_EVENTS } from "../utils/analytics.js";
import "./FreeTrial.css";

export default function FreeTrial() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "supplier",
    companyName: "",
    location: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    
    setLoading(true);
    try {
      await register(formData);
      trackEvent(ANALYTICS_EVENTS.TRIAL_STARTED, { role: formData.role });
      showToast("Welcome! Your 7-day free trial has started. 🎉");
      navigate("/dashboard");
    } catch (err) {
      showToast(err?.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col selection:bg-[#0071E3]/20 font-inter">
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Panel: Narrative & Value */}
        <div className="lg:w-[40%] bg-[#1d1d1f] p-12 lg:p-20 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0071E3]/20 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <Link to="/" className="text-xl font-black tracking-tight hover:opacity-80 transition-opacity">
              HydroSphere<span className="text-[#0071E3]">.</span>
            </Link>
            
            <div className="mt-20 space-y-6">
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Scale your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0071E3] to-[#5AC8FA]">Hydrogen</span> enterprise.
              </h1>
              <p className="text-lg text-[#86868b] font-medium max-w-md">
                Get immediate access to global buyers and industrial-grade procurement tools.
              </p>
            </div>

            <div className="mt-16 space-y-8">
               {[
                 { title: "Zero Commitment", desc: "No credit card required to start.", icon: "bi-shield-check" },
                 { title: "Verified Network", desc: "Access 500+ audited industrial partners.", icon: "bi-patch-check" },
                 { title: "Cancel Anytime", desc: "Full flexibility as your supply scales.", icon: "bi-arrow-repeat" }
               ].map((item, i) => (
                 <div key={i} className="flex gap-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#0071E3] transition-all group-hover:bg-[#0071E3] group-hover:text-white">
                      <i className={`bi ${item.icon} text-xl`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">{item.title}</h4>
                      <p className="text-sm text-[#86868b] font-medium">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="relative z-10 pt-20 border-t border-white/10 mt-20">
             <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                   {[1,2,3].map(i => (
                     <img key={i} className="w-10 h-10 rounded-full border-2 border-[#1d1d1f]" src={`https://i.pravatar.cc/100?u=${i+50}`} alt="user" />
                   ))}
                </div>
                <p className="text-xs font-bold text-[#86868b] uppercase tracking-widest">Trusted by 500+ Suppliers</p>
             </div>
          </div>
        </div>

        {/* Right Panel: Registration Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-20">
          <div className="w-full max-w-[480px] animate-apple">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-[#1d1d1f] tracking-tight">Begin Free Trial</h2>
              <p className="text-[#86868b] mt-2 font-medium">Your 7-day complimentary access starts now.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#86868b] uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    className="form-control w-full"
                    placeholder="John Doe" 
                    required 
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#86868b] uppercase tracking-widest ml-1">Work Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="form-control w-full"
                    placeholder="name@company.com" 
                    required 
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#86868b] uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  className="form-control w-full"
                  placeholder="••••••••" 
                  required 
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#86868b] uppercase tracking-widest ml-1">Business Role</label>
                <select 
                  name="role" 
                  className="form-control w-full appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTIgMSIgc3Ryb2tlPSIjODY4NjhCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-no-repeat bg-[right_1.25rem_center]"
                  value={formData.role} 
                  onChange={handleChange}
                >
                  <option value="supplier">Supplier (Selling Hydrogen)</option>
                  <option value="buyer">Buyer (Procuring Hydrogen)</option>
                </select>
              </div>

              {formData.role === 'supplier' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-apple">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#86868b] uppercase tracking-widest ml-1">Company</label>
                    <input 
                      type="text" 
                      name="companyName" 
                      className="form-control w-full"
                      placeholder="EcoH2 Corp" 
                      required 
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#86868b] uppercase tracking-widest ml-1">Location</label>
                    <input 
                      type="text" 
                      name="location" 
                      className="form-control w-full"
                      placeholder="Berlin, DE" 
                      required 
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="btn-primary w-full py-4 text-base font-black shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Initialize Account →"
                  )}
                </button>
              </div>

              <p className="text-center text-sm font-medium text-[#86868b]">
                Already a member? <Link to="/login" className="text-[#0071E3] font-bold hover:underline">Sign In</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

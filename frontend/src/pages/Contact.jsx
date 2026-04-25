import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext.jsx";
import Footer from "../components/Footer.jsx";
import api from "../api/axiosInstance";

export default function Contact() {
  const { showToast } = useToast();
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    user_phone: "",
    user_role: "Buyer",
    subject: "General Inquiry",
    message: ""
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Contact Us — HydroSphere India";
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await api.post("/contacts", formData);
      
      setStatus({ 
        type: "success", 
        message: "Message sent! We'll get back to you within 24 hours." 
      });
      showToast("Message sent successfully!", "success");
      setFormData({
        user_name: "",
        user_email: "",
        user_phone: "",
        user_role: "Buyer",
        subject: "General Inquiry",
        message: ""
      });
    } catch (error) {
      console.error("Submission Error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Something went wrong";
      setStatus({ 
        type: "danger", 
        message: errorMsg
      });
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F5F7] min-h-screen font-inter selection:bg-[#0071E3]/10 selection:text-[#0071E3]">
      {/* 1. Refined Hero Header */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none overflow-hidden">
           <div className="absolute -top-24 -left-24 w-[400px] h-[400px] bg-[#0071E3]/5 rounded-full blur-[100px]"></div>
           <div className="absolute top-0 -right-24 w-[350px] h-[350px] bg-[#00D1B2]/5 rounded-full blur-[80px]"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 mb-8 text-[11px] font-black tracking-[0.2em] text-[#0071E3] uppercase bg-[#0071E3]/5 rounded-full border border-[#0071E3]/10">
            Connect with Experts
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-[#1d1d1f] mb-8 tracking-tight">
            How can we <span className="text-[#0071E3]">help you?</span>
          </h1>
          <p className="text-xl text-[#86868b] font-medium max-w-2xl mx-auto leading-relaxed">
            Whether you're scaling a hydrogen plant or sourcing for manufacturing, 
            our specialized team is ready to assist.
          </p>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Premium Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-[42px] p-10 md:p-14 shadow-2xl shadow-black/[0.03] border border-black/[0.02] animate-apple">
            <h3 className="text-2xl font-black text-[#1d1d1f] mb-10">Send a Message</h3>
            
            {status.message && (
              <div className={`p-5 rounded-2xl mb-10 flex gap-4 animate-apple ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                <i className={`bi bi-${status.type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill text-xl`} />
                <div className="text-sm font-bold">{status.message}</div>
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    name="user_name"
                    className="form-control-apple w-full" 
                    placeholder="Jane Doe"
                    required
                    value={formData.user_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" 
                    name="user_email"
                    className="form-control-apple w-full" 
                    placeholder="jane@company.com"
                    required
                    value={formData.user_email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  name="user_phone"
                  className="form-control-apple w-full" 
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.user_phone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">Your Role</label>
                <div className="flex p-1 bg-black/[0.03] rounded-[20px] border border-black/[0.02]">
                  {['Buyer', 'Supplier'].map(role => (
                    <label key={role} className="flex-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="user_role" 
                        value={role}
                        className="sr-only"
                        checked={formData.user_role === role}
                        onChange={handleChange}
                      />
                      <div className={`text-center py-3 rounded-[16px] text-sm font-bold transition-all ${formData.user_role === role ? 'bg-white text-[#1d1d1f] shadow-md' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>
                        {role}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">Subject</label>
                <select 
                  name="subject"
                  className="form-control-apple w-full appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTIgMSIgc3Ryb2tlPSIjODY4NjhCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-no-repeat bg-[right_1.5rem_center]"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option>General Inquiry</option>
                  <option>Want to List Products</option>
                  <option>Report an Issue</option>
                  <option>Partnership</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">Message</label>
                <textarea 
                  name="message"
                  className="form-control-apple w-full min-h-[160px] resize-none" 
                  placeholder="Tell us how we can help you..."
                  required
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#0071E3] text-white py-5 rounded-[22px] font-black text-base shadow-2xl shadow-blue-500/30 hover:bg-[#0077ED] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Send Message <i className="bi bi-send-fill text-sm" /></>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Contact Information Cards */}
          <div className="lg:col-span-5 space-y-8">
            <h3 className="text-2xl font-black text-[#1d1d1f] mb-10 pl-2">Information</h3>
            
            <div className="space-y-6">
              {[
                { 
                  icon: "bi-envelope-fill", 
                  label: "Email Support", 
                  value: "madhavdodiya2017@gmail.com", 
                  link: "mailto:madhavdodiya2017@gmail.com",
                  color: "bg-blue-50 text-blue-600"
                },
                { 
                  icon: "bi-whatsapp", 
                  label: "WhatsApp Business", 
                  value: "+91 8140674266", 
                  link: "https://wa.me/918140674266",
                  color: "bg-green-50 text-green-600"
                },
                { 
                  icon: "bi-geo-alt-fill", 
                  label: "Headquarters", 
                  value: "Ahmedabad, Gujarat, India", 
                  color: "bg-orange-50 text-orange-600"
                }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-[32px] p-8 flex items-center gap-6 shadow-2xl shadow-black/[0.02] border border-black/[0.02] transition-transform hover:scale-[1.02]">
                  <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center text-2xl flex-shrink-0 ${item.color}`}>
                    <i className={`bi ${item.icon}`} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest mb-1">{item.label}</p>
                    {item.link ? (
                      <a href={item.link} target={item.link.startsWith('http') ? '_blank' : '_self'} rel="noreferrer" className="text-lg font-bold text-[#1d1d1f] hover:text-[#0071E3] transition-colors truncate block">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-lg font-bold text-[#1d1d1f] truncate block">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#0071E3]/5 rounded-[32px] p-8 border border-[#0071E3]/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0071E3] flex items-center justify-center text-white">
                  <i className="bi bi-clock-history" />
                </div>
                <p className="text-sm font-bold text-[#1d1d1f] leading-relaxed">
                  Typical response time: <span className="text-[#0071E3]">24 hours</span>. <br/>
                  <span className="text-[#86868b] font-medium">Available Mon-Sat, 9 AM - 6 PM IST.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CTA Banner */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-[48px] bg-[#1d1d1f] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[#0071E3]/10 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">Are you a hydrogen supplier?</h2>
            <p className="text-lg text-[#86868b] font-medium mb-12 max-w-xl mx-auto">Join the world's most advanced hydrogen marketplace and reach industrial buyers globally.</p>
            <Link 
              to="/signup" 
              className="inline-flex items-center gap-3 bg-[#0071E3] text-white px-10 py-5 rounded-full font-black text-lg hover:bg-[#0077ED] transition-all shadow-2xl shadow-blue-500/40 active:scale-95"
            >
              List Your Products Free <i className="bi bi-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

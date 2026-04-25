import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge } from '../components/ui';
import Footer from '../components/Footer';
import api from '../api/axiosInstance';
import { Helmet } from 'react-helmet-async';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    user_role: 'Buyer',
    subject: 'General Inquiry',
    message: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await api.post('/contacts', formData);
      setStatus({ type: 'success', message: "Message sent! Our team will get back to you within 24 hours." });
      setFormData({
        user_name: '',
        user_email: '',
        user_phone: '',
        user_role: 'Buyer',
        subject: 'General Inquiry',
        message: ''
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F5F7] min-h-screen selection:bg-[#0071E3]/10">
      <Helmet>
        <title>Contact Sales | HydroSphere — Global Hydrogen Infrastructure</title>
      </Helmet>

      {/* Header */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center animate-apple">
          <Badge variant="primary">Global Support</Badge>
          <h1 className="text-5xl md:text-7xl font-black text-[#1d1d1f] mt-8 mb-8 tracking-tight">
            How can we <br /> <span className="text-[#0071E3]">help you?</span>
          </h1>
          <p className="text-lg md:text-xl text-[#86868b] font-medium max-w-2xl mx-auto">
            Our specialized team is ready to assist with scaling your hydrogen 
            operations or sourcing for large-scale manufacturing.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Info Cards */}
          <div className="lg:col-span-5 space-y-8">
            <h3 className="text-2xl font-black text-[#1d1d1f] mb-8 tracking-tight">Information</h3>
            
            <div className="space-y-6">
              {[
                { label: 'Email Support', value: 'madhavdodiya2017@gmail.com', icon: 'bi-envelope' },
                { label: 'WhatsApp Business', value: '+91 8140674266', icon: 'bi-whatsapp' },
                { label: 'Headquarters', value: 'Ahmedabad, Gujarat, India', icon: 'bi-geo-alt' }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-[32px] p-8 flex items-center gap-6 shadow-2xl shadow-black/[0.02] border border-black/[0.02] hover:scale-[1.02] transition-transform">
                   <div className="w-16 h-16 rounded-[20px] bg-[#0071E3]/5 flex items-center justify-center text-2xl text-[#0071E3]">
                      <i className={`bi ${item.icon}`} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-lg font-bold text-[#1d1d1f]">{item.value}</p>
                   </div>
                </div>
              ))}
            </div>

            <div className="bg-[#0071E3]/5 rounded-[32px] p-8 border border-[#0071E3]/10">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-[#0071E3] flex items-center justify-center text-white">
                   <i className="bi bi-clock-history" />
                 </div>
                 <p className="text-sm font-bold text-[#1d1d1f]">
                   Typical response time: <span className="text-[#0071E3]">24 hours</span> <br />
                   <span className="text-[#86868b] font-medium">Mon-Sat, 9 AM - 6 PM IST</span>
                 </p>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <Card className="lg:col-span-7 p-10 md:p-14 border-none" hover={false}>
            <h3 className="text-2xl font-black text-[#1d1d1f] mb-10 tracking-tight">Send a Message</h3>
            
            {status.message && (
              <div className={`p-5 rounded-2xl mb-10 flex gap-4 animate-apple ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                <i className={`bi bi-${status.type === 'success' ? 'check-circle' : 'exclamation-circle'}-fill text-xl`} />
                <div className="text-sm font-bold leading-relaxed">{status.message}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                  label="Full Name"
                  name="user_name"
                  placeholder="Jane Doe"
                  required
                  value={formData.user_name}
                  onChange={handleChange}
                />
                <Input
                  label="Email Address"
                  name="user_email"
                  type="email"
                  placeholder="jane@company.com"
                  required
                  value={formData.user_email}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                  label="Phone Number"
                  name="user_phone"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.user_phone}
                  onChange={handleChange}
                />
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">Your Role</label>
                  <div className="flex p-1 bg-black/[0.03] rounded-[16px] border border-black/[0.02]">
                    {['Buyer', 'Supplier'].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormData({...formData, user_role: r})}
                        className={`flex-1 py-3 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all ${formData.user_role === r ? 'bg-white text-[#1d1d1f] shadow-md' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">Subject</label>
                <select
                  name="subject"
                  className="form-control-apple w-full appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTIgMSIgc3Ryb2tlPSIjODY4NjhCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-no-repeat bg-[right_1.5rem_center]"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option>General Inquiry</option>
                  <option>Interested in Listing</option>
                  <option>Partnership Proposal</option>
                  <option>Technical Issue</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">Message</label>
                <textarea
                  name="message"
                  className="form-control-apple w-full min-h-[160px] resize-none"
                  placeholder="How can we help your business?"
                  required
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}

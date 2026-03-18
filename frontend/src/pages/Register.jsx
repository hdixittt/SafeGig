import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Hash, Clock, Lock, Shield, ArrowRight, Sparkles } from 'lucide-react';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';

const PLATFORMS = ['Zepto', 'Blinkit', 'Instamart'];
const tiers = [
  { tier: 'Low',      premium: '₹29', coverage: '₹800',   color: '#22c55e' },
  { tier: 'Standard', premium: '₹49', coverage: '₹1,500', color: '#3b82f6' },
  { tier: 'High',     premium: '₹79', coverage: '₹2,500', color: '#f59e0b' },
  { tier: 'Premium',  premium: '₹89', coverage: '₹3,500', color: '#ef4444' },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', phone:'', email:'', city:'', pin_code:'', platform:'Zepto', weekly_hours:40, password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('sb_token', data.token);
      localStorage.setItem('worker_id', data.worker.id);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, #ea580c 0%, transparent 70%)' }} />
      </div>
      <div className="absolute top-6 right-6 z-50"><ThemeToggle /></div>

      <div className="hidden lg:flex flex-col justify-center px-20 w-[48%] relative z-10">
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8 }} className="max-w-xl">
          <div className="flex items-center gap-4 mb-20">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
              <Shield size={32} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight" style={{ color:'var(--text-1)' }}>SafeGig</h1>
              <p className="text-sm font-bold text-orange-500 uppercase tracking-widest">Worker Portal</p>
            </div>
          </div>
          <div className="mb-16">
            <h2 className="text-7xl font-black leading-[0.95] mb-8" style={{ color:'var(--text-1)' }}>
              Protect your<br /><span className="gradient-text">daily income</span>
            </h2>
            <p className="text-xl leading-relaxed max-w-lg font-light" style={{ color:'var(--text-2)' }}>
              AI-powered parametric insurance for India's gig delivery workers. Instant payouts, zero paperwork.
            </p>
          </div>
          <div className="glass-card-strong p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={18} className="text-orange-400" />
              <p className="text-xs font-black uppercase tracking-widest" style={{ color:'var(--text-2)' }}>Coverage Tiers</p>
            </div>
            <div className="space-y-5">
              {tiers.map(({ tier, premium, coverage, color }) => (
                <div key={tier} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full transition-transform group-hover:scale-125" style={{ background:color }} />
                    <span className="text-base font-bold" style={{ color:'var(--text-1)' }}>{tier}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-semibold" style={{ color:'var(--text-2)' }}>{premium}/wk</span>
                    <span className="text-lg font-black" style={{ color }}>{coverage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative z-10">
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.6 }} className="w-full max-w-2xl">
          <div className="glass-card-strong p-10">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
                  <Shield size={24} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-3xl font-black" style={{ color:'var(--text-1)' }}>Create Account</h3>
                  <p className="text-sm font-medium" style={{ color:'var(--text-2)' }}>Join SafeGig today</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--text-2)' }}>Full Name</label>
                  <div className="input-with-icon">
                    <User size={16} className="input-icon" />
                    <input name="name" type="text" placeholder="Your name" value={form.name} onChange={handleChange} required className="input-premium text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--text-2)' }}>Phone</label>
                  <div className="input-with-icon">
                    <Phone size={16} className="input-icon" />
                    <input name="phone" type="tel" placeholder="Phone number" value={form.phone} onChange={handleChange} required className="input-premium text-sm" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--text-2)' }}>Email <span style={{ color:'var(--text-3)' }}>(optional)</span></label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} className="input-premium text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--text-2)' }}>City</label>
                  <div className="input-with-icon">
                    <MapPin size={16} className="input-icon" />
                    <input name="city" type="text" placeholder="e.g. Mumbai" value={form.city} onChange={handleChange} required className="input-premium text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--text-2)' }}>PIN Code</label>
                  <div className="input-with-icon">
                    <Hash size={16} className="input-icon" />
                    <input name="pin_code" type="text" placeholder="400001" value={form.pin_code} onChange={handleChange} required className="input-premium text-sm" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--text-2)' }}>Weekly Hours</label>
                  <div className="input-with-icon">
                    <Clock size={16} className="input-icon" />
                    <input name="weekly_hours" type="number" placeholder="40" value={form.weekly_hours} onChange={handleChange} required className="input-premium text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--text-2)' }}>Platform</label>
                  <select name="platform" value={form.platform} onChange={handleChange} className="input-premium text-sm font-semibold">
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--text-2)' }}>Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input name="password" type="password" placeholder="Create a password" value={form.password} onChange={handleChange} required className="input-premium text-sm" />
                </div>
              </div>
              {error && (
                <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 flex items-start gap-3">
                  <span className="text-red-400 text-xl">⚠️</span>
                  <p className="text-sm text-red-300 font-semibold">{error}</p>
                </motion.div>
              )}
              <button type="submit" disabled={loading} className="btn-premium text-lg font-black flex items-center justify-center gap-3 group mt-6">
                {loading
                  ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Creating account...</span></>
                  : <><span>Register & Get Insured</span><ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} /></>
                }
              </button>
            </form>
            <div className="mt-8 pt-6 text-center" style={{ borderTop:'1px solid var(--border)' }}>
              <p className="text-sm" style={{ color:'var(--text-2)' }}>
                Already registered?{' '}
                <Link to="/login" className="text-orange-400 font-bold hover:text-orange-300 transition-colors">Sign in</Link>
              </p>
            </div>
          </div>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }} className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-card">
              <Sparkles size={16} className="text-orange-400" />
              <span className="text-sm font-semibold" style={{ color:'var(--text-2)' }}>Trusted by 10M+ gig workers</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

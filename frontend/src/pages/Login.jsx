import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Lock, Shield, Eye, EyeOff, ArrowRight, Sparkles, Zap } from 'lucide-react';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('sb_token', data.token);
      localStorage.setItem('worker_id', data.worker.id);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden page-bg" style={{ background: 'var(--bg)' }}>
      {/* Animated background blurs */}
      <div className="absolute inset-0 opacity-30 glow-blob">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, #ea580c 0%, transparent 70%)' }} />
      </div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center px-20 w-[50%] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
          className="max-w-xl"
        >
          <div className="flex items-center gap-4 mb-20">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600" />
              <Shield size={32} className="text-white relative z-10" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-1)' }}>SafeGig</h1>
              <p className="text-sm font-bold text-orange-500 uppercase tracking-widest">Worker Portal</p>
            </div>
          </div>

          <div className="mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-7xl font-black leading-[0.95] mb-8"
              style={{ color: 'var(--text-1)' }}
            >
              Welcome<br />
              <span className="gradient-text">back</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl leading-relaxed max-w-lg font-light"
              style={{ color: 'var(--text-2)' }}
            >
              Sign in to access your coverage, live conditions, and claim history.
            </motion.p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Zap,      label: 'Instant Payouts', value: '< 2 min',  color: '#f97316' },
              { icon: Shield,   label: 'Max Coverage',    value: '₹3,500',   color: '#fb923c' },
              { icon: Sparkles, label: 'Starting From',   value: '₹29/week', color: '#fdba74' },
            ].map(({ icon: Icon, label, value, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                className="glass-card p-6 flex items-center gap-5"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15` }}>
                  <Icon size={24} style={{ color }} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-2)' }}>{label}</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>{value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] }}
          className="w-full max-w-md"
        >
          <div className="glass-card-strong p-12">
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
                  <Shield size={24} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-3xl font-black" style={{ color: 'var(--text-1)' }}>Sign In</h3>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>Worker Portal</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-2)' }}>Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input type="tel" placeholder="Enter your phone number" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} required
                    className="input-premium" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-2)' }}>Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input type={showPwd ? 'text' : 'password'} placeholder="Enter your password" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} required
                    className="input-premium" style={{ paddingRight: '52px' }} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-3)' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl px-5 py-4 flex items-start gap-3"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  <span className="text-red-400 text-xl">⚠️</span>
                  <p className="text-sm font-semibold text-red-300">{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-premium text-lg font-black flex items-center justify-center gap-3 group mt-8"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 space-y-4 text-center" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                New to SafeGig?{' '}
                <Link to="/register" className="font-bold text-orange-400 hover:text-orange-300 transition-colors">
                  Create account
                </Link>
              </p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                Admin user?{' '}
                <Link to="/admin/login" className="font-semibold" style={{ color: 'var(--text-2)' }}>
                  Admin login →
                </Link>
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-card">
              <Sparkles size={16} className="text-orange-400" />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>
                Trusted by 10M+ gig workers
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Lock, Eye, EyeOff, ArrowRight, Terminal, Zap } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const ADMIN_CREDENTIALS = { username: 'admin@safegig.demo', password: 'SafeGig@2026' };

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = e => {
    e.preventDefault(); setLoading(true); setError('');
    setTimeout(() => {
      if (form.username === ADMIN_CREDENTIALS.username && form.password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('admin_token', 'demo_admin_token');
        navigate('/admin');
      } else {
        setError('Invalid admin credentials');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden page-bg" style={{ background: 'var(--bg)' }}>
      {/* Background blurs */}
      <div className="absolute inset-0 opacity-25 glow-blob">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }} />
      </div>

      <div className="absolute top-6 right-6 z-50"><ThemeToggle /></div>

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center px-20 w-[50%] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
          className="max-w-xl"
        >
          {/* Logo */}
          <div className="flex items-center gap-4 mb-20">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-600">
              <ShieldCheck size={32} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-1)' }}>SafeGig</h1>
              <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#ef4444' }}>Admin Portal</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-7xl font-black leading-[0.95] mb-8"
              style={{ color: 'var(--text-1)' }}
            >
              Admin<br />
              <span className="gradient-text">Control Center</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl leading-relaxed max-w-lg font-light"
              style={{ color: 'var(--text-2)' }}
            >
              Monitor workers, fire parametric triggers, review claims and manage payouts from one place.
            </motion.p>
          </div>

          {/* Feature list */}
          <div className="space-y-4 mb-12">
            {[
              { icon: Zap,         label: 'Fire Parametric Triggers', desc: 'Rain, heat, AQI, curfew' },
              { icon: ShieldCheck, label: 'Manage All Policies',       desc: 'Real-time worker coverage' },
              { icon: Terminal,    label: 'Operations Dashboard',      desc: 'Claims, payouts, analytics' },
            ].map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                className="glass-card p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.12)' }}>
                  <Icon size={20} style={{ color: '#ef4444' }} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-2)' }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Demo credentials card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="glass-card-strong p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-2 h-2 rounded-full bg-green-400 pulse-glow" />
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>
                Demo Credentials
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-2)' }}>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Username</span>
                <span className="text-sm font-mono font-bold" style={{ color: 'var(--text-1)' }}>admin@safegig.demo</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-2)' }}>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Password</span>
                <span className="text-sm font-mono font-bold" style={{ color: 'var(--text-1)' }}>SafeGig@2026</span>
              </div>
            </div>
          </motion.div>
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
            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                  <ShieldCheck size={24} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-3xl font-black" style={{ color: 'var(--text-1)' }}>Admin Sign In</h3>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>Restricted access</p>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-glow" />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#ef4444' }}>
                  Admin Only
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-2)' }}>Admin Username</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input type="text" placeholder="admin@safegig.demo" value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })} required
                    className="input-premium" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-2)' }}>Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input type={showPwd ? 'text' : 'password'} placeholder="Enter admin password"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
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
                className="w-full flex items-center justify-center gap-3 rounded-2xl font-black text-lg text-white transition-all group"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #f97316)',
                  padding: '18px 32px',
                  boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as Admin</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 text-center" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                Worker login?{' '}
                <Link to="/login" className="font-bold text-orange-400 hover:text-orange-300 transition-colors">
                  Go to worker portal →
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
              <ShieldCheck size={16} style={{ color: '#ef4444' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>
                Secured admin access · SafeGig Ops
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

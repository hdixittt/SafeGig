import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, ArrowRight, Sparkles, Zap, Shield, Heart, AlertCircle } from 'lucide-react';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';
import CoverlyLogo from '../components/CoverlyLogo';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Organic background blobs — drifting, not static */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob-drift absolute" style={{
          top: '-10%', left: '-5%', width: 600, height: 600,
          borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
          background: 'radial-gradient(circle, rgba(112,145,230,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div className="blob-drift absolute" style={{
          bottom: '-15%', right: '-8%', width: 500, height: 500,
          borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%',
          background: 'radial-gradient(circle, rgba(61,82,160,0.14) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animationDelay: '3s',
        }} />
        <div className="blob-drift absolute" style={{
          top: '40%', left: '45%', width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(173,187,218,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animationDelay: '6s',
        }} />
      </div>

      {/* Top controls — language + theme */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      {/* ── LEFT PANEL — marketing, breathing room ── */}
      <div className="hidden lg:flex flex-col justify-center px-16 xl:px-24 w-[52%] relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg"
        >
          {/* Logo — not a rigid box */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="flex items-center gap-4 mb-14"
          >
            <div className="float-anim" style={{
              width: 60, height: 60,
              borderRadius: '18px 24px 18px 24px',
              background: 'rgba(255,255,255,0.58)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.8)',
              boxShadow: '0 8px 28px rgba(61,82,160,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CoverlyLogo size={40} />
            </div>
            <div>
              <h1 className="text-3xl coverly-brand" style={{ color: 'var(--text-1)' }}>Coverly</h1>
              <p className="text-xs font-semibold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-3)' }}>
                {t('workerPortal')}
              </p>
            </div>
          </motion.div>

          {/* Tagline — large, warm, human */}
          <div className="mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.22,1,0.36,1] }}
              className="font-black leading-[1.1] mb-5"
              style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                color: 'var(--text-1)',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {t('tagline')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-base leading-relaxed"
              style={{ color: 'var(--text-2)', fontWeight: 400, maxWidth: 400 }}
            >
              {t('taglineSub')}
            </motion.p>
          </div>

          {/* Feature highlights — flowing, not boxed */}
          <div className="space-y-3">
            {[
              { icon: Zap,      labelKey: 'instantPayouts', value: '< 2 min',  color: '#3D52A0', delay: 0.5 },
              { icon: Shield,   labelKey: 'maxCoverage',    value: '₹3,500',   color: '#5B6FD4', delay: 0.6 },
              { icon: Sparkles, labelKey: 'startingFrom',   value: '₹29/week', color: '#7091E6', delay: 0.7 },
            ].map(({ icon: Icon, labelKey, value, color, delay }) => (
              <motion.div
                key={labelKey}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay, duration: 0.6, ease: [0.22,1,0.36,1] }}
                className="glass-card flex items-center gap-4 px-5 py-4"
                style={{ borderRadius: '16px 20px 16px 20px' }}
              >
                <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center"
                  style={{
                    borderRadius: '12px 14px 10px 14px',
                    background: `${color}14`,
                    border: `1px solid ${color}20`,
                  }}>
                  <Icon size={20} style={{ color }} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-3)' }}>
                    {t(labelKey)}
                  </p>
                  <p className="text-lg font-black" style={{ color: 'var(--text-1)' }}>{value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust note — human, warm */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-10 flex items-center gap-3"
          >
            <Heart size={14} style={{ color: '#ef4444', fill: '#ef4444' }} />
            <p className="text-sm" style={{ color: 'var(--text-3)', fontWeight: 500 }}>
              {t('trustedBy')}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL — form, airy ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
          className="w-full max-w-[420px]"
        >
          {/* Form card — organic shape */}
          <div className="glass-float px-10 py-10" style={{ borderRadius: '28px 32px 28px 32px' }}>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div style={{
                width: 48, height: 48,
                borderRadius: '14px 18px 14px 18px',
                background: 'linear-gradient(140deg, #3D52A0, #7091E6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(61,82,160,0.28)',
              }}>
                <CoverlyLogo size={30} />
              </div>
              <div>
                <h3 className="text-xl font-black" style={{ color: 'var(--text-1)' }}>{t('signIn')}</h3>
                <p className="text-sm" style={{ color: 'var(--text-3)', fontWeight: 400 }}>{t('workerPortal')}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-2)' }}>
                  {t('phoneNumber')}
                </label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon" />
                  <input type="tel" placeholder={t('enterPhone')} value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} required
                    className="input-premium" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-2)' }}>
                  {t('password')}
                </label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input type={showPwd ? 'text' : 'password'} placeholder={t('enterPassword')} value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} required
                    className="input-premium" style={{ paddingRight: '52px' }} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 transition-all hover:scale-110"
                    style={{ color: 'var(--text-3)' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 flex items-start gap-3"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12 }}>
                  <span>⚠️</span>
                  <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>{error}</p>
                </motion.div>
              )}

              <button type="submit" disabled={loading}
                className="btn-premium flex items-center justify-center gap-3 group mt-2">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>{t('signingIn')}</span></>
                ) : (
                  <><span>{t('signIn')}</span><ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" strokeWidth={2.5} /></>
                )}
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-7 pt-6 space-y-2.5 text-center" style={{ borderTop: '1px solid rgba(134,151,196,0.15)' }}>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                {t('newToApp')}{' '}
                <Link to="/register" className="font-bold transition-colors" style={{ color: 'var(--accent)' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent-light)'}
                  onMouseLeave={e => e.target.style.color = 'var(--accent)'}>
                  {t('createAccount')}
                </Link>
              </p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                {t('adminUser')}{' '}
                <Link to="/admin/login" className="font-semibold hover:underline" style={{ color: 'var(--text-2)' }}>
                  {t('adminLogin')}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

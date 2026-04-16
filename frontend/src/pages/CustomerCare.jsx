import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, Clock, CheckCircle, Send, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const SUPPORT_OPTIONS = [
  { icon: MessageCircle, title: 'Live Chat', desc: 'Chat with our AI assistant instantly', action: 'Chat Now', color: '#3D52A0', available: true },
  { icon: Phone,         title: 'Call Support', desc: '1800-COVERLY (Mon–Sat, 8AM–8PM)', action: '1800-268-3759', color: '#22c55e', available: true },
  { icon: Mail,          title: 'Email Support', desc: 'support@coverly.in', action: 'Send Email', color: '#7091E6', available: true },
];

const TICKET_CATEGORIES = ['Claim Issue', 'Payment Problem', 'Policy Question', 'Account Help', 'Burnout Bonus', 'Platform Downtime', 'Other'];

export default function CustomerCare() {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState({ category: 'Claim Issue', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/workers/me').then(r => setWorker(r.data)).catch(() => navigate('/login'));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => { setSubmitted(true); setSubmitting(false); }, 1200);
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar worker={worker} />
      <main className="flex-1 overflow-auto">
        <div className="topbar-premium px-10 py-6 sticky top-0 z-20">
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--text-1)' }}>Customer Care</h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>We're here to help — 24/7 support for all workers</p>
        </div>

        <div className="p-10 max-w-4xl space-y-8">
          {/* Support channels */}
          <div className="grid grid-cols-3 gap-5">
            {SUPPORT_OPTIONS.map((opt, i) => (
              <motion.div key={opt.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${opt.color}15`, border: `1px solid ${opt.color}25` }}>
                  <opt.icon size={24} style={{ color: opt.color }} />
                </div>
                <h3 className="text-base font-black mb-1" style={{ color: 'var(--text-1)' }}>{opt.title}</h3>
                <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>{opt.desc}</p>
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-semibold text-green-400">Available Now</span>
                </div>
                <button className="w-full py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${opt.color}, ${opt.color}cc)` }}>
                  {opt.action}
                </button>
              </motion.div>
            ))}
          </div>

          {/* SLA info */}
          <div className="glass-card-strong p-5 rounded-2xl flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Clock size={18} style={{ color: '#7091E6' }} />
              <div>
                <p className="text-sm font-black" style={{ color: 'var(--text-1)' }}>Response Times</p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>Live Chat: &lt;2 min · Email: &lt;4 hrs · Phone: Immediate</p>
              </div>
            </div>
            <div className="h-8 w-px" style={{ background: 'rgba(134,151,196,0.2)' }} />
            <div className="flex items-center gap-3">
              <CheckCircle size={18} style={{ color: '#22c55e' }} />
              <div>
                <p className="text-sm font-black" style={{ color: 'var(--text-1)' }}>Claim Disputes</p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>Resolved within 24 hours, guaranteed</p>
              </div>
            </div>
            <div className="h-8 w-px" style={{ background: 'rgba(134,151,196,0.2)' }} />
            <div className="flex items-center gap-3">
              <AlertCircle size={18} style={{ color: '#f59e0b' }} />
              <div>
                <p className="text-sm font-black" style={{ color: 'var(--text-1)' }}>Emergency Line</p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>1800-COVERLY — 24/7 for urgent claims</p>
              </div>
            </div>
          </div>

          {/* Ticket form */}
          <div className="glass-card-strong p-8 rounded-2xl">
            <h2 className="text-xl font-black mb-6" style={{ color: 'var(--text-1)' }}>Submit a Support Ticket</h2>
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-1)' }}>Ticket Submitted!</h3>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                  Ticket #CVR-{Math.floor(Math.random() * 90000) + 10000} created. We'll respond within 4 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-2)' }}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="input-premium">
                    {TICKET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-2)' }}>Subject</label>
                  <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Brief description of your issue" required className="input-premium" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-2)' }}>Message</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Describe your issue in detail..." required rows={5}
                    className="input-premium resize-none" />
                </div>
                <button type="submit" disabled={submitting}
                  className="btn-premium flex items-center justify-center gap-2">
                  {submitting
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                    : <><Send size={16} /> Submit Ticket</>
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

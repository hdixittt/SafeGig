import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const FAQS = [
  {
    category: 'Coverage & Claims',
    items: [
      { q: 'How does zero-touch claims work?', a: 'When a trigger fires in your zone (heavy rain, extreme heat, pollution, curfew, or accident surge), Coverly automatically detects it, validates your GPS location, runs a fraud check, and credits the payout to your UPI — all within seconds. No forms, no calls.' },
      { q: 'What triggers are covered?', a: 'Depending on your plan: Heavy Rain (>50mm/hr), Extreme Heat (>42°C), Severe Pollution (AQI >300), Curfew/Strike, Road Accident Surge. Higher plans cover more triggers.' },
      { q: 'How long does a payout take?', a: 'Payouts are instant — typically under 2 minutes from trigger detection to UPI credit. This is parametric insurance: no manual review needed.' },
      { q: 'Can I file a claim manually?', a: 'Claims are auto-filed when triggers fire. If you believe a trigger occurred but no claim was filed, contact our support team within 24 hours.' },
      { q: 'What is GPS zone validation?', a: 'Your PIN code is used to define your coverage zone. When a trigger fires, we verify you were working in that zone. This prevents fraud and ensures fair payouts.' },
    ]
  },
  {
    category: 'Plans & Pricing',
    items: [
      { q: 'What plans are available?', a: 'Basic Shield (₹29/wk, ₹800 coverage), Standard Guard (₹49/wk, ₹1,500), Pro Protect (₹79/wk, ₹2,500), Elite Cover (₹99/wk, ₹3,500). All plans include zero-touch claims.' },
      { q: 'How is my premium calculated?', a: 'Your premium is dynamically calculated by our ML model based on your city risk score, weekly hours, platform, and historical trigger data in your zone.' },
      { q: 'Can I change my plan?', a: 'Yes, you can upgrade or downgrade at the start of each week. Changes take effect from the next Monday.' },
      { q: 'Is there a loyalty discount?', a: 'Yes! After 3 consecutive clean weeks (no claims), you get a 10% discount. After 8 weeks, 15% off.' },
    ]
  },
  {
    category: 'Burnout & Wellness',
    items: [
      { q: 'What is Burnout Protection?', a: 'If you log more than 55 hours in a week, Coverly detects this and offers a ₹150 wellness bonus to encourage you to take a break. Your health matters more than any delivery.' },
      { q: 'How is working hours tracked?', a: 'Hours are self-reported during registration and updated weekly. We trust our workers — this is an honor system backed by platform data.' },
    ]
  },
  {
    category: 'Platform Downtime',
    items: [
      { q: 'What is Platform Downtime Protection?', a: 'If your delivery platform (Zepto, Blinkit, etc.) goes down for more than 30 minutes during your working hours, you receive compensation based on your plan tier (₹50–₹300).' },
      { q: 'How is downtime detected?', a: 'We monitor platform status APIs and public incident reports in real-time. When a confirmed outage is detected, eligible workers are automatically compensated.' },
    ]
  },
  {
    category: 'Account & Registration',
    items: [
      { q: 'What is a Rider ID?', a: 'Your Rider ID is the unique identifier assigned by your delivery platform (e.g., ZPT-12345 for Zepto). Find it in your app under Profile → ID. It helps us verify your employment.' },
      { q: 'Is my data safe?', a: 'Yes. We use bank-grade encryption and never share your personal data with third parties. Your UPI details are processed securely through Razorpay.' },
      { q: 'Can I register for multiple platforms?', a: 'Currently one account per phone number. Multi-platform support is coming soon.' },
    ]
  },
];

export default function FAQ() {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [open, setOpen] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/workers/me').then(r => setWorker(r.data)).catch(() => navigate('/login'));
  }, []);

  const toggle = (key) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  const filtered = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar worker={worker} />
      <main className="flex-1 overflow-auto">
        <div className="topbar-premium px-10 py-6 sticky top-0 z-20">
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--text-1)' }}>FAQs</h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>Everything you need to know about Coverly</p>
        </div>

        <div className="p-10 max-w-3xl space-y-6">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#ADBBDA' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search FAQs..."
              className="input-premium pl-11"
            />
          </div>

          {filtered.map(cat => (
            <div key={cat.category}>
              <h2 className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
                {cat.category}
              </h2>
              <div className="space-y-2">
                {cat.items.map((item, i) => {
                  const key = `${cat.category}-${i}`;
                  return (
                    <motion.div key={key} layout className="glass-card overflow-hidden">
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <HelpCircle size={16} style={{ color: '#7091E6', flexShrink: 0 }} />
                          <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{item.q}</span>
                        </div>
                        <ChevronDown size={16} style={{ color: 'var(--text-3)', transform: open[key] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                      </button>
                      <AnimatePresence>
                        {open[key] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-5 pb-5 pt-0">
                              <div className="h-px mb-4" style={{ background: 'rgba(134,151,196,0.15)' }} />
                              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{item.a}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

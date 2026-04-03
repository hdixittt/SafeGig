import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, CheckCircle, Star, ArrowRight, CloudRain, Thermometer, Wind, AlertOctagon, AlertTriangle, IndianRupee } from 'lucide-react';
import api from '../api';
import Sidebar from '../components/Sidebar';

const PLANS = [
  {
    key: 'low',
    name: 'Basic Shield',
    tier: 'Low Risk',
    premium: 29,
    coverage: 800,
    color: '#22c55e',
    gradient: 'from-green-500/20 to-green-600/5',
    border: 'border-green-500/30',
    description: 'Ideal for part-time workers in low-risk zones with fewer hours on road.',
    features: [
      'Rs 800 weekly coverage',
      'Rain trigger (>50mm/hr)',
      'Extreme heat trigger (>42°C)',
      'UPI instant payout',
      'Zero-touch claims',
    ],
    triggers: ['heavy_rain', 'extreme_heat'],
    badge: null,
  },
  {
    key: 'standard',
    name: 'Standard Guard',
    tier: 'Standard Risk',
    premium: 49,
    coverage: 1500,
    color: '#3b82f6',
    gradient: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/30',
    description: 'Best for full-time delivery workers in mid-tier cities with moderate exposure.',
    features: [
      'Rs 1,500 weekly coverage',
      'Rain + Heat triggers',
      'Pollution trigger (AQI >300)',
      'UPI instant payout',
      'Zero-touch claims',
      'Loyalty discount after clean weeks',
    ],
    triggers: ['heavy_rain', 'extreme_heat', 'severe_pollution'],
    badge: 'Most Popular',
  },
  {
    key: 'high',
    name: 'Pro Protect',
    tier: 'High Risk',
    premium: 79,
    coverage: 2500,
    color: '#f97316',
    gradient: 'from-orange-500/20 to-orange-600/5',
    border: 'border-orange-500/30',
    description: 'For high-mileage workers in metro cities with heavy traffic and pollution.',
    features: [
      'Rs 2,500 weekly coverage',
      'All 4 weather triggers',
      'Curfew / Strike trigger',
      'Accident surge trigger',
      'UPI instant payout',
      'Zero-touch claims',
      'Flood zone discount',
    ],
    triggers: ['heavy_rain', 'extreme_heat', 'severe_pollution', 'curfew_strike'],
    badge: 'Recommended',
  },
  {
    key: 'critical',
    name: 'Elite Cover',
    tier: 'Critical Risk',
    premium: 99,
    coverage: 3500,
    color: '#8b5cf6',
    gradient: 'from-purple-500/20 to-purple-600/5',
    border: 'border-purple-500/30',
    description: 'Maximum protection for workers in high-risk metros like Delhi, Mumbai, Kolkata.',
    features: [
      'Rs 3,500 weekly coverage',
      'All 5 triggers active',
      'Highest payout ratio (40%)',
      'Priority fraud review',
      'UPI instant payout',
      'Zero-touch claims',
      'Flood zone + loyalty discounts',
      'Adverse weather coverage boost',
    ],
    triggers: ['heavy_rain', 'extreme_heat', 'severe_pollution', 'curfew_strike', 'road_accident_surge'],
    badge: 'Max Coverage',
  },
];

const TRIGGER_ICONS = {
  heavy_rain:          { icon: CloudRain,     label: 'Heavy Rain'    },
  extreme_heat:        { icon: Thermometer,   label: 'Extreme Heat'  },
  severe_pollution:    { icon: Wind,          label: 'Pollution'     },
  curfew_strike:       { icon: AlertOctagon,  label: 'Curfew/Strike' },
  road_accident_surge: { icon: AlertTriangle, label: 'Accidents'     },
};

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id  = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Plans() {
  const navigate = useNavigate();
  const [worker, setWorker]         = useState(null);
  const [riskProfile, setRiskProfile] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [paying, setPaying]         = useState(null); // plan key being paid
  const [success, setSuccess]       = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: w } = await api.get('/workers/me');
        setWorker(w);
        const { data: rp } = await api.get(`/workers/${w.id}/risk-profile`);
        setRiskProfile(rp);
      } catch { navigate('/login'); }
      finally { setLoading(false); }
    })();
  }, [navigate]);

  const handlePay = async (plan) => {
    setPaying(plan.key);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { alert('Razorpay SDK failed to load. Check your connection.'); return; }

      const { data: order } = await api.post('/payments/create-order', {
        worker_id: worker.id,
        plan: plan.key,
      });

      // Mock mode — skip Razorpay UI and directly verify
      if (order.mock) {
        const { data: result } = await api.post('/payments/verify', {
          razorpay_order_id:   order.order_id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature:  'mock_signature',
          worker_id:           worker.id,
          plan:                plan.key,
        });
        setSuccess(result);
        setTimeout(() => navigate('/dashboard'), 2500);
        return;
      }

      // Real Razorpay checkout
      const options = {
        key:         order.key,
        amount:      order.amount,
        currency:    order.currency,
        name:        'SafeGig Insurance',
        description: `${plan.name} — Weekly Policy`,
        order_id:    order.order_id,
        image:       '/logo.png',
        prefill: {
          name:    worker.name,
          contact: worker.phone,
          email:   worker.email,
        },
        theme: { color: plan.color },
        handler: async (response) => {
          const { data: result } = await api.post('/payments/verify', {
            ...response,
            worker_id: worker.id,
            plan:      plan.key,
          });
          setSuccess(result);
          setTimeout(() => navigate('/dashboard'), 2500);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => alert(`Payment failed: ${r.error.description}`));
      rzp.open();
    } catch (e) {
      console.error('[pay]', e);
      alert('Payment initiation failed. Please try again.');
    } finally {
      setPaying(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  // Success overlay
  if (success) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center p-12 glass-card-strong rounded-3xl max-w-md">
        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-400" strokeWidth={2} />
        </div>
        <h2 className="text-3xl font-black mb-3" style={{ color: 'var(--text-1)' }}>Policy Activated!</h2>
        <p className="text-lg font-semibold mb-2 text-green-400">Rs {success.policy?.coverage_amount} coverage active</p>
        <p className="text-sm font-medium" style={{ color: 'var(--text-3)' }}>Redirecting to dashboard...</p>
      </motion.div>
    </div>
  );

  const recommendedKey = riskProfile?.tier?.toLowerCase() || 'standard';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar worker={worker} />
      <main className="flex-1 overflow-auto">
        <div className="topbar-premium px-10 py-6 sticky top-0 z-20">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-black mb-1" style={{ color: 'var(--text-1)' }}>
            Choose Your Plan
          </motion.h1>
          <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
            AI-recommended: <span className="text-orange-400 font-bold capitalize">{riskProfile?.tier} tier</span>
            {riskProfile && <span> — Rs {riskProfile.premium}/week based on your risk profile</span>}
          </p>
        </div>

        <div className="p-10 max-w-[1400px]">
          <div className="grid grid-cols-4 gap-6">
            {PLANS.map((plan, i) => {
              const isRecommended = plan.tier.toLowerCase().includes(recommendedKey);
              const isCurrentlyPaying = paying === plan.key;

              return (
                <motion.div key={plan.key}
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative flex flex-col rounded-3xl p-7 border bg-gradient-to-br ${plan.gradient} ${plan.border} ${isRecommended ? 'ring-2' : ''}`}
                  style={isRecommended ? { ringColor: plan.color } : {}}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black text-white"
                      style={{ background: plan.color }}>
                      {plan.badge === 'Most Popular' && <Star size={10} className="inline mr-1" />}
                      {plan.badge}
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: `${plan.color}20` }}>
                      <Shield size={22} style={{ color: plan.color }} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-black mb-1" style={{ color: 'var(--text-1)' }}>{plan.name}</h3>
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${plan.color}20`, color: plan.color }}>
                      {plan.tier}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-4xl font-black" style={{ color: 'var(--text-1)' }}>₹{plan.premium}</span>
                      <span className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>/week</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IndianRupee size={13} style={{ color: plan.color }} />
                      <span className="text-sm font-bold" style={{ color: plan.color }}>₹{plan.coverage.toLocaleString()} coverage</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs font-medium mb-5 leading-relaxed" style={{ color: 'var(--text-3)' }}>
                    {plan.description}
                  </p>

                  {/* Triggers covered */}
                  <div className="mb-5">
                    <p className="text-xs font-black uppercase mb-2" style={{ color: 'var(--text-3)' }}>Triggers Covered</p>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.triggers.map(t => {
                        const cfg = TRIGGER_ICONS[t];
                        const Icon = cfg.icon;
                        return (
                          <div key={t} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
                            style={{ background: `${plan.color}15`, color: plan.color }}>
                            <Icon size={10} strokeWidth={2.5} />
                            {cfg.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-6 space-y-2">
                    {plan.features.map((f, fi) => (
                      <div key={fi} className="flex items-start gap-2">
                        <CheckCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: plan.color }} strokeWidth={2.5} />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handlePay(plan)}
                    disabled={!!paying}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: isCurrentlyPaying ? `${plan.color}80` : plan.color }}
                  >
                    {isCurrentlyPaying ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                    ) : (
                      <><Zap size={15} strokeWidth={2.5} /> Activate with Razorpay <ArrowRight size={14} /></>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Info strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-8 p-6 glass-card-strong rounded-2xl flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 flex items-center justify-center flex-shrink-0">
              <Zap size={22} className="text-orange-400" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-black mb-1" style={{ color: 'var(--text-1)' }}>Zero-Touch Claims on All Plans</p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>
                Once activated, claims auto-file when a trigger fires in your zone. No forms, no calls, no waiting.
                Payout hits your UPI within seconds of trigger detection.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, MessageSquare, Eye, Smartphone, IndianRupee, CloudRain, CheckCircle } from 'lucide-react';

const RULES = [
  { id:'r1', event:'UPI Payout Confirmed',    channel:'SMS + WhatsApp', lang:'Hindi + English', enabled:true  },
  { id:'r2', event:'Trigger Alert Fired',      channel:'Push + SMS',     lang:'Hindi',           enabled:true  },
  { id:'r3', event:'Policy Renewal Due',       channel:'WhatsApp',       lang:'English',         enabled:true  },
  { id:'r4', event:'Claim Auto-Approved',      channel:'SMS',            lang:'Hindi + English', enabled:true  },
  { id:'r5', event:'Fraud Flag Raised',        channel:'Email (Ops)',    lang:'English',         enabled:false },
  { id:'r6', event:'3+ Zones Trigger Simultaneously', channel:'Email + Slack', lang:'English',  enabled:true  },
];

// Sample payout notification — all message types with bilingual content
const SAMPLE_NOTIFICATIONS = [
  {
    type: 'payout',
    icon: IndianRupee,
    color: '#22c55e',
    label: 'UPI Payout Confirmed',
    amount: '₹1,200',
    trigger: 'Heavy Rain',
    txn: 'TXN174300012AB',
    en: `SafeGig: Your claim has been approved! ₹1,200 has been sent to your UPI account (TXN174300012AB). Trigger: Heavy Rain in your zone. No action needed. — SafeGig Insurance`,
    hi: `SafeGig: आपका दावा स्वीकृत हो गया! ₹1,200 आपके UPI खाते में भेज दिए गए हैं (TXN174300012AB)। कारण: आपके क्षेत्र में भारी बारिश। कोई कार्रवाई आवश्यक नहीं। — SafeGig Insurance`,
  },
  {
    type: 'trigger',
    icon: CloudRain,
    color: '#3b82f6',
    label: 'Trigger Alert Fired',
    amount: null,
    trigger: 'Heavy Rain',
    txn: null,
    en: `SafeGig Alert: Heavy rain detected in your zone (65mm/hr). Your policy is active. If conditions persist, your claim will be auto-filed. Stay safe! — SafeGig`,
    hi: `SafeGig अलर्ट: आपके क्षेत्र में भारी बारिश (65mm/hr) दर्ज की गई है। आपकी पॉलिसी सक्रिय है। यदि स्थिति बनी रहती है, तो आपका दावा स्वतः दर्ज हो जाएगा। सुरक्षित रहें! — SafeGig`,
  },
  {
    type: 'claim',
    icon: CheckCircle,
    color: '#f97316',
    label: 'Claim Auto-Approved',
    amount: '₹1,200',
    trigger: 'Heavy Rain',
    txn: null,
    en: `SafeGig: Your claim for Heavy Rain disruption has been auto-approved. ₹1,200 payout is being processed to your UPI. Zero paperwork needed. — SafeGig`,
    hi: `SafeGig: भारी बारिश के कारण आपका दावा स्वतः स्वीकृत हो गया है। ₹1,200 आपके UPI में भेजे जा रहे हैं। कोई कागज़ी कार्रवाई नहीं। — SafeGig`,
  },
];

function PhoneMockup({ message, lang }) {
  return (
    <div className="rounded-2xl p-4" style={{background:'var(--bg-2)', border:'1px solid rgba(255,255,255,0.06)'}}>
      <div className="flex items-center gap-2 mb-3">
        <Smartphone size={13} style={{color:'var(--text-3)'}} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{color:'var(--text-3)'}}>{lang === 'hi' ? 'Hindi (हिंदी)' : 'English'}</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold" style={{background:'rgba(34,197,94,0.15)',color:'#22c55e'}}>SMS / WhatsApp</span>
      </div>
      <div className="p-3 rounded-xl text-sm leading-relaxed" style={{background:'rgba(255,255,255,0.04)', color:'var(--text-1)', fontFamily: lang === 'hi' ? 'system-ui' : 'inherit'}}>
        {message}
      </div>
    </div>
  );
}

export default function Notifications() {
  const [rules, setRules] = useState(RULES);
  const [activeNotif, setActiveNotif] = useState(0);

  const toggle = (id) => setRules(r => r.map(x => x.id===id ? {...x,enabled:!x.enabled} : x));
  const notif = SAMPLE_NOTIFICATIONS[activeNotif];
  const Icon = notif.icon;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black" style={{color:'var(--text-1)'}}>Notifications & Alerts Config</h2><p className="text-sm" style={{color:'var(--text-3)'}}>Manage automated notifications and escalation rules</p></div>

      {/* Bilingual Sample Payout Notification */}
      <div className="glass-card-strong p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-5">
          <MessageSquare size={16} style={{color:'#3b82f6'}} />
          <h3 className="font-bold" style={{color:'var(--text-1)'}}>Sample Worker Notifications</h3>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold ml-auto" style={{background:'rgba(59,130,246,0.15)',color:'#3b82f6'}}>Hindi + English</span>
        </div>

        {/* Notification type selector */}
        <div className="flex gap-2 mb-5">
          {SAMPLE_NOTIFICATIONS.map((n, i) => {
            const NIcon = n.icon;
            return (
              <button key={i} onClick={() => setActiveNotif(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeNotif===i?'text-white':'hover:bg-white/5'}`}
                style={activeNotif===i?{background:`linear-gradient(135deg,${n.color},${n.color}bb)`}:{color:'var(--text-3)'}}>
                <NIcon size={12} />
                {n.label}
              </button>
            );
          })}
        </div>

        {/* Notification header */}
        <div className="flex items-center gap-4 p-4 rounded-xl mb-4" style={{background:`${notif.color}10`, border:`1px solid ${notif.color}25`}}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${notif.color}20`}}>
            <Icon size={18} style={{color:notif.color}} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black" style={{color:'var(--text-1)'}}>{notif.label}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs" style={{color:'var(--text-3)'}}>Trigger: {notif.trigger}</span>
              {notif.amount && <span className="text-xs font-bold" style={{color:notif.color}}>{notif.amount}</span>}
              {notif.txn && <span className="text-xs font-mono" style={{color:'var(--text-3)'}}>{notif.txn}</span>}
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{background:'rgba(34,197,94,0.15)',color:'#22c55e'}}>Auto-sent</span>
        </div>

        {/* Bilingual messages */}
        <div className="grid grid-cols-2 gap-4">
          <PhoneMockup message={notif.en} lang="en" />
          <PhoneMockup message={notif.hi} lang="hi" />
        </div>
      </div>

      {/* Notification Rules */}
      <div className="glass-card-strong rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3" style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <Bell size={15} style={{color:'#f97316'}} /><h3 className="font-bold" style={{color:'var(--text-1)'}}>Notification Rules</h3>
        </div>
        <div className="divide-y" style={{borderColor:'rgba(255,255,255,0.04)'}}>
          {rules.map(r => (
            <div key={r.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
              <div>
                <p className="text-sm font-semibold" style={{color:'var(--text-1)'}}>{r.event}</p>
                <p className="text-xs mt-0.5" style={{color:'var(--text-3)'}}>{r.channel} · {r.lang}</p>
              </div>
              <button onClick={()=>toggle(r.id)}
                className={`w-11 h-6 rounded-full transition-all relative ${r.enabled?'bg-orange-500':'bg-white/10'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${r.enabled?'left-6':'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Escalation Rules */}
      <div className="glass-card-strong p-6 rounded-2xl">
        <h3 className="font-bold mb-4" style={{color:'var(--text-1)'}}>Escalation Rules</h3>
        <div className="space-y-3">
          {[['3+ zones trigger simultaneously','Alert Ops team via Slack + Email'],['Fraud score > 0.8 on any claim','Notify Fraud Analyst immediately'],['Payout failure rate > 5%','Alert Finance team'],['Model drift > 0.10','Trigger auto-retrain + notify ML team']].map(([cond,action])=>(
            <div key={cond} className="flex items-center justify-between p-4 rounded-xl" style={{background:'var(--bg-2)'}}>
              <div><p className="text-sm font-semibold" style={{color:'var(--text-1)'}}>If: {cond}</p><p className="text-xs mt-0.5" style={{color:'var(--text-3)'}}>Then: {action}</p></div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{background:'rgba(34,197,94,0.15)',color:'#22c55e'}}>Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
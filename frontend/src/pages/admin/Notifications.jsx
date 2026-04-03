import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, MessageSquare, Save, Eye } from 'lucide-react';

const RULES = [
  { id:'r1', event:'UPI Payout Confirmed',    channel:'SMS + WhatsApp', lang:'Hindi + English', enabled:true  },
  { id:'r2', event:'Trigger Alert Fired',      channel:'Push + SMS',     lang:'Hindi',           enabled:true  },
  { id:'r3', event:'Policy Renewal Due',       channel:'WhatsApp',       lang:'English',         enabled:true  },
  { id:'r4', event:'Claim Auto-Approved',      channel:'SMS',            lang:'Hindi + English', enabled:true  },
  { id:'r5', event:'Fraud Flag Raised',        channel:'Email (Ops)',    lang:'English',         enabled:false },
  { id:'r6', event:'3+ Zones Trigger Simultaneously', channel:'Email + Slack', lang:'English',  enabled:true  },
];

const PREVIEWS = {
  hindi:   'आपका दावा स्वीकृत हो गया है। ₹1,200 आपके UPI खाते में भेज दिए गए हैं। — SafeGig',
  english: 'Your claim has been approved. ₹1,200 has been dispatched to your UPI account. — SafeGig',
};

export default function Notifications() {
  const [rules, setRules] = useState(RULES);
  const [preview, setPreview] = useState(null);

  const toggle = (id) => setRules(r => r.map(x => x.id===id ? {...x,enabled:!x.enabled} : x));

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black" style={{color:'var(--text-1)'}}>Notifications & Alerts Config</h2><p className="text-sm" style={{color:'var(--text-3)'}}>Manage automated notifications and escalation rules</p></div>

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
              <div className="flex items-center gap-3">
                <button onClick={()=>setPreview(r.event)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{color:'var(--text-3)'}}>
                  <Eye size={12} />Preview
                </button>
                <button onClick={()=>toggle(r.id)}
                  className={`w-11 h-6 rounded-full transition-all relative ${r.enabled?'bg-orange-500':'bg-white/10'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${r.enabled?'left-6':'left-1'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card-strong p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-4"><MessageSquare size={15} style={{color:'#3b82f6'}} /><h3 className="font-bold" style={{color:'var(--text-1)'}}>NLP Message Preview</h3></div>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(PREVIEWS).map(([lang,msg]) => (
            <div key={lang} className="p-4 rounded-xl" style={{background:'var(--bg-2)'}}>
              <p className="text-xs font-bold uppercase mb-2 capitalize" style={{color:'var(--text-3)'}}>{lang}</p>
              <p className="text-sm" style={{color:'var(--text-1)'}}>{msg}</p>
            </div>
          ))}
        </div>
      </div>

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

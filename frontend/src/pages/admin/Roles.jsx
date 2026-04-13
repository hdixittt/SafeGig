import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCog, Plus, Shield, Eye, Edit, Trash2 } from 'lucide-react';

const ROLES = [
  { id:'r1', name:'Super Admin',   color:'#ef4444', perms:['All access','User management','System config','Audit log'] },
  { id:'r2', name:'Ops Manager',   color:'#FFCE32', perms:['Workers','Policies','Triggers','Claims','Payouts'] },
  { id:'r3', name:'Finance',       color:'#22c55e', perms:['Payouts','Reports','Premium Engine (read)'] },
  { id:'r4', name:'Fraud Analyst', color:'#8b5cf6', perms:['Claims','Fraud Console','Worker flags'] },
];

const USERS = [
  { id:'u1', name:'Admin',          email:'admin@safegig.demo',   role:'Super Admin',   last:'Just now',    status:'active' },
  { id:'u2', name:'Ops Lead',       email:'ops@safegig.demo',     role:'Ops Manager',   last:'2h ago',      status:'active' },
  { id:'u3', name:'Finance Head',   email:'finance@safegig.demo', role:'Finance',       last:'Yesterday',   status:'active' },
  { id:'u4', name:'Fraud Analyst',  email:'fraud@safegig.demo',   role:'Fraud Analyst', last:'3 days ago',  status:'inactive' },
];

const AUDIT = [
  { user:'Admin',       action:'Fired trigger heavy_rain for PIN 400001',  time:'10:05 AM' },
  { user:'Ops Lead',    action:'Extended policy P-2024 by 7 days',          time:'09:30 AM' },
  { user:'Admin',       action:'Cleared fraud flag for worker Rahul Verma', time:'09:00 AM' },
  { user:'Fraud Analyst',action:'Escalated claim C-003 for investigation',  time:'Yesterday' },
];

const ROLE_COLOR = { 'Super Admin':'#ef4444', 'Ops Manager':'#FFCE32', 'Finance':'#22c55e', 'Fraud Analyst':'#8b5cf6' };

export default function Roles() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black" style={{color:'var(--text-1)'}}>User & Role Management</h2><p className="text-sm" style={{color:'var(--text-3)'}}>Admin accounts, permissions, and audit log</p></div>

      <div className="grid grid-cols-4 gap-4">
        {ROLES.map(r => (
          <div key={r.id} className="glass-card-strong p-5 rounded-2xl" style={{border:`1px solid ${r.color}20`}}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} style={{color:r.color}} />
              <span className="text-sm font-black" style={{color:r.color}}>{r.name}</span>
            </div>
            <div className="space-y-1.5">
              {r.perms.map(p => <div key={p} className="text-xs flex items-center gap-1.5" style={{color:'var(--text-3)'}}><span className="w-1 h-1 rounded-full" style={{background:r.color}} />{p}</div>)}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card-strong rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3" style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <UserCog size={15} style={{color:'#FFCE32'}} /><h3 className="font-bold" style={{color:'var(--text-1)'}}>Admin Users</h3>
          <button className="ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{background:'linear-gradient(135deg,#FFCE32,#1D63FF)'}}>
            <Plus size={12} />Add User
          </button>
        </div>
        <table className="w-full text-sm">
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            {['Name','Email','Role','Last Active','Status','Actions'].map(h=>(
              <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{color:'var(--text-3)'}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {USERS.map((u,i) => (
              <motion.tr key={u.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                className="hover:bg-white/5 transition-colors" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white" style={{background:`linear-gradient(135deg,${ROLE_COLOR[u.role]||'#6b7280'},${ROLE_COLOR[u.role]||'#6b7280'}bb)`}}>{u.name[0]}</div>
                    <span className="font-semibold" style={{color:'var(--text-1)'}}>{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs font-mono" style={{color:'var(--text-3)'}}>{u.email}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{background:`${ROLE_COLOR[u.role]||'#6b7280'}18`,color:ROLE_COLOR[u.role]||'#6b7280'}}>{u.role}</span>
                </td>
                <td className="px-5 py-3.5 text-xs" style={{color:'var(--text-3)'}}>{u.last}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.status==='active'?'bg-green-500/15 text-green-400':'bg-gray-500/15 text-gray-400'}`}>{u.status}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1.5">
                    <button className="p-1.5 rounded-lg hover:bg-white/10"><Eye size={13} style={{color:'var(--text-3)'}} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-blue-500/10"><Edit size={13} className="text-blue-400" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 size={13} className="text-red-400" /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-card-strong p-6 rounded-2xl">
        <h3 className="font-bold mb-4" style={{color:'var(--text-1)'}}>Audit Log</h3>
        <div className="space-y-2">
          {AUDIT.map((a,i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl text-sm" style={{background:'var(--bg-2)'}}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="font-bold" style={{color:'var(--text-1)'}}>{a.user}</span>
                <span style={{color:'var(--text-2)'}}>{a.action}</span>
              </div>
              <span className="text-xs flex-shrink-0" style={{color:'var(--text-3)'}}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

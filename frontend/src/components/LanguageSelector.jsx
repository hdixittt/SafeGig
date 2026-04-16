import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm transition-all"
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'white',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Globe size={14} />
        <span>{current?.label}</span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden z-50 min-w-[140px]"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(134,151,196,0.3)',
            boxShadow: '0 16px 48px rgba(61,82,160,0.2)',
          }}
        >
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all hover:bg-blue-50 text-left"
              style={{
                color: l.code === lang ? '#3D52A0' : '#8697C4',
                fontWeight: l.code === lang ? 700 : 500,
                borderBottom: '1px solid rgba(134,151,196,0.1)',
              }}
            >
              <span className="text-base w-6 text-center">{l.label}</span>
              <span>{l.name}</span>
              {l.code === lang && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

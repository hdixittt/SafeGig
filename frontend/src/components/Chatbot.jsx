import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const GEMINI_API_KEY = 'AIzaSyBD4xk3Z8B7ro6Npyuuil47gEeENuude3A';

const SYSTEM_CONTEXT = `You are Coverly's AI assistant — a friendly, helpful chatbot for gig delivery workers in India. 
Coverly is a parametric insurance platform that provides instant payouts to delivery workers (Zepto, Blinkit, Instamart, Swiggy, Zomato) when triggers like heavy rain, extreme heat, pollution, curfew, or accidents occur.

Key facts:
- Plans start at ₹29/week with ₹800 coverage (Basic Shield)
- Standard Guard: ₹49/week, ₹1,500 coverage
- Pro Protect: ₹79/week, ₹2,500 coverage  
- Elite Cover: ₹99/week, ₹3,500 coverage
- Claims are zero-touch — auto-filed when triggers fire
- Payouts go to UPI within seconds
- Burnout Protection: if you work >60 hrs/week, you get a wellness break bonus
- Platform Downtime Protection: if your delivery app goes down, you get compensated

Keep answers short, friendly, and in the language the user writes in. Use emojis occasionally. Always be supportive of gig workers.`;

async function callGemini(messages) {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_CONTEXT }] },
        contents,
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
      })
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not respond right now.';
}

const QUICK_QUESTIONS = [
  'How do claims work?',
  'What triggers are covered?',
  'How much does it cost?',
  'What is burnout protection?',
];

export default function Chatbot() {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Coverly's AI assistant. Ask me anything about your coverage, claims, or plans!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const reply = await callGemini(newMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #3D52A0, #7091E6)',
          boxShadow: '0 8px 32px rgba(61,82,160,0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}}><X size={22} className="text-white" /></motion.div>
            : <motion.div key="chat" initial={{rotate:90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}}><MessageCircle size={22} className="text-white" /></motion.div>
          }
        </AnimatePresence>
        {/* Pulse ring */}
        {!open && <span className="absolute inset-0 rounded-full animate-ping" style={{background:'rgba(112,145,230,0.3)'}} />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-96 rounded-3xl overflow-hidden flex flex-col"
            style={{
              height: 520,
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.8)',
              boxShadow: '0 24px 80px rgba(61,82,160,0.25)',
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #3D52A0, #5B6FD4)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Coverly Assistant</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs text-white/70">Powered by Gemini AI</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto text-white/60 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    m.role === 'assistant'
                      ? 'bg-gradient-to-br from-[#3D52A0] to-[#7091E6]'
                      : 'bg-gradient-to-br from-[#5B6FD4] to-[#8697C4]'
                  }`}>
                    {m.role === 'assistant' ? <Bot size={13} className="text-white" /> : <User size={13} className="text-white" />}
                  </div>
                  <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'text-white rounded-tr-sm'
                      : 'rounded-tl-sm'
                  }`}
                    style={m.role === 'user'
                      ? { background: 'linear-gradient(135deg, #3D52A0, #5B6FD4)', fontWeight: 500 }
                      : { background: 'rgba(61,82,160,0.06)', color: '#1E2D6B', border: '1px solid rgba(134,151,196,0.2)' }
                    }>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3D52A0] to-[#7091E6] flex items-center justify-center">
                    <Bot size={13} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
                    style={{ background: 'rgba(61,82,160,0.06)', border: '1px solid rgba(134,151,196,0.2)' }}>
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#7091E6] animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map(q => (
                  <button key={q} onClick={() => send(q)}
                    className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all hover:scale-105"
                    style={{ background: 'rgba(61,82,160,0.08)', color: '#3D52A0', border: '1px solid rgba(61,82,160,0.15)' }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 flex gap-2" style={{ borderTop: '1px solid rgba(134,151,196,0.15)' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask anything about Coverly..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: 'rgba(61,82,160,0.06)',
                  border: '1.5px solid rgba(134,151,196,0.25)',
                  color: '#1E2D6B',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
              <button onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #3D52A0, #7091E6)' }}>
                <Send size={15} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

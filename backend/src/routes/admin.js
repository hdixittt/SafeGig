const router = require('express').Router();
const { supabaseAdmin: supabase } = require('../supabase');

// Simple admin auth check — in production use proper role-based middleware
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token === (process.env.ADMIN_TOKEN || 'admin-safegig-2026')) return next();
  // Also allow if any token present (for demo — tighten in prod)
  if (token) return next();
  return res.status(401).json({ error: 'Unauthorized' });
};

router.use(adminAuth);

router.get('/workers', async (req, res) => {
  const { data, error } = await supabase.from('workers').select('*').order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/policies', async (req, res) => {
  const { data, error } = await supabase
    .from('policies')
    .select('*, workers(name, city)')
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data.map(p => ({ ...p, worker_name: p.workers?.name, city: p.workers?.city })));
});

router.get('/claims', async (req, res) => {
  const { data, error } = await supabase
    .from('claims')
    .select('*, policies(worker_id, workers(name, city))')
    .order('initiated_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data.map(c => ({ ...c, worker_name: c.policies?.workers?.name, city: c.policies?.workers?.city })));
});

router.get('/payouts', async (req, res) => {
  const { data, error } = await supabase
    .from('payouts')
    .select('*, claims(trigger_type, policies(workers(name)))')
    .order('initiated_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data.map(p => ({ ...p, worker_name: p.claims?.policies?.workers?.name, trigger_type: p.claims?.trigger_type })));
});

router.get('/stats/workers', async (req, res) => {
  const { count } = await supabase.from('workers').select('id', { count: 'exact', head: true });
  res.json({ total: count || 0 });
});

router.get('/stats/policies', async (req, res) => {
  const { count: active } = await supabase.from('policies').select('id', { count: 'exact', head: true }).eq('status', 'active');
  res.json({ active: active || 0 });
});

router.get('/stats/claims', async (req, res) => {
  const { count: pending } = await supabase.from('claims').select('id', { count: 'exact', head: true }).eq('status', 'manual_review');
  const { count: flagged } = await supabase.from('claims').select('id', { count: 'exact', head: true }).gt('fraud_score', 0.7);
  res.json({ pending: pending || 0, flagged: flagged || 0 });
});

router.get('/stats/payouts', async (req, res) => {
  const { data } = await supabase.from('payouts').select('amount').eq('status', 'completed');
  const total = (data || []).reduce((s, p) => s + (p.amount || 0), 0);
  res.json({ total_amount: total });
});

module.exports = router;

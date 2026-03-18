const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin: supabase } = require('../supabase');
const { computeRiskScore } = require('../lib/riskEngine');

// POST /api/policies — create weekly policy
router.post('/', authMiddleware, async (req, res) => {
  const { worker_id } = req.body;

  const { data: worker, error: workerError } = await supabase
    .from('workers')
    .select('city, pin_code, platform, weekly_hours')
    .eq('id', worker_id)
    .single();

  if (workerError) return res.status(404).json({ error: 'Worker not found' });

  const { risk_score, premium, coverage } = computeRiskScore(worker);

  const weekStart = new Date();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const { data, error } = await supabase
    .from('policies')
    .insert([{
      worker_id,
      week_start: weekStart.toISOString(),
      week_end: weekEnd.toISOString(),
      premium_paid: premium,
      coverage_amount: coverage,
      risk_score,
      status: 'active',
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET /api/policies/worker/:workerId
router.get('/worker/:workerId', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('worker_id', req.params.workerId)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;

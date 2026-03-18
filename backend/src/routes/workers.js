const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin: supabase } = require('../supabase');
const { computeRiskScore } = require('../lib/riskEngine');

// GET /api/workers/me
router.get('/me', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('workers')
    .select('id, name, phone, email, city, pin_code, platform, weekly_hours, created_at')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'Worker not found' });
  res.json(data);
});

// GET /api/workers/:id/risk-profile
router.get('/:id/risk-profile', authMiddleware, async (req, res) => {
  const { data: worker, error } = await supabase
    .from('workers')
    .select('city, pin_code, platform, weekly_hours')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Worker not found' });

  res.json(computeRiskScore(worker));
});

module.exports = router;

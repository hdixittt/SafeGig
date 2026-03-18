const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin: supabase } = require('../supabase');

// Inline fraud scoring — simulates Isolation Forest output.
// Low claim frequency = low fraud score. Replace with real model when ML service is integrated.
function mockFraudScore(claimFrequency = 1) {
  // Simulate: 1–2 claims/week is normal (score ~0.1), 5+ is suspicious (score ~0.8)
  const base = Math.min((claimFrequency - 1) * 0.15, 0.9);
  const jitter = (Math.random() * 0.05).toFixed(3);
  return Math.min(+(base + parseFloat(jitter)).toFixed(3), 1.0);
}

// POST /api/claims — auto-initiate claim when trigger fires
router.post('/', authMiddleware, async (req, res) => {
  const { policy_id, trigger_id } = req.body;

  const [{ data: policy }, { data: trigger }] = await Promise.all([
    supabase.from('policies').select('*').eq('id', policy_id).single(),
    supabase.from('triggers').select('*').eq('id', trigger_id).single(),
  ]);

  if (!policy || policy.status !== 'active') {
    return res.status(400).json({ error: 'No active policy found' });
  }
  if (!trigger) {
    return res.status(400).json({ error: 'Trigger not found' });
  }

  // Count existing claims this week to feed fraud scorer
  const { count } = await supabase
    .from('claims')
    .select('id', { count: 'exact', head: true })
    .eq('policy_id', policy_id);

  const fraudScore = mockFraudScore((count || 0) + 1);
  const status = fraudScore > 0.75 ? 'manual_review' : 'approved';
  const payoutAmount = Math.round(policy.coverage_amount * 0.3);

  const { data: claim, error } = await supabase
    .from('claims')
    .insert([{
      policy_id,
      trigger_id,
      amount: payoutAmount,
      fraud_score: fraudScore,
      status,
      initiated_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Auto-create payout record for approved claims
  if (status === 'approved') {
    const txnId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    await supabase.from('payouts').insert([{
      claim_id: claim.id,
      amount: payoutAmount,
      channel: 'UPI (Mock)',
      status: 'completed',
      transaction_id: txnId,
      initiated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    }]);
    await supabase.from('claims').update({ status: 'paid' }).eq('id', claim.id);
    claim.status = 'paid';
  }

  res.json({
    claim,
    message: status === 'approved'
      ? `Claim approved. ₹${payoutAmount} payout initiated via UPI (Mock).`
      : 'Claim flagged for manual review due to anomaly detection.',
  });
});

// GET /api/claims/worker/:workerId
router.get('/worker/:workerId', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('claims')
    .select('*, policies!inner(worker_id)')
    .eq('policies.worker_id', req.params.workerId)
    .order('initiated_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;

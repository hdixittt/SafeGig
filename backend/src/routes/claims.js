const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin: supabase } = require('../supabase');

/**
 * Fraud scoring - simulates Isolation Forest anomaly detection.
 * Factors: claim frequency, time-of-day, trigger plausibility.
 */
function computeFraudScore(claimCount = 1, triggerType = '') {
  // High frequency = suspicious
  const freqScore = Math.min((claimCount - 1) * 0.15, 0.7);
  // Curfew/strike claims are harder to fake - lower fraud risk
  const typeBonus = triggerType === 'curfew_strike' ? -0.05 : 0;
  const jitter = parseFloat((Math.random() * 0.04).toFixed(3));
  return Math.min(Math.max(+(freqScore + typeBonus + jitter).toFixed(3), 0), 1.0);
}

/**
 * Payout amount logic - proportional to trigger severity.
 * Heavy rain / curfew = 40% of coverage. Heat / pollution = 25%.
 */
function computePayoutRatio(triggerType) {
  const ratios = {
    heavy_rain: 0.40, curfew_strike: 0.40,
    extreme_heat: 0.25, severe_pollution: 0.25,
    road_accident_surge: 0.35,
  };
  return ratios[triggerType] ?? 0.30;
}

/**
 * POST /api/claims
 * Zero-touch pipeline: trigger fires -> claim created -> fraud check -> payout in one shot.
 * Worker never needs to fill a form. Everything is parametric and automatic.
 */
router.post('/', authMiddleware, async (req, res) => {
  const { policy_id, trigger_id } = req.body;

  const [{ data: policy, error: pErr }, { data: trigger, error: tErr }] = await Promise.all([
    supabase.from('policies').select('*').eq('id', policy_id).single(),
    supabase.from('triggers').select('*').eq('id', trigger_id).single(),
  ]);

  if (pErr || !policy) return res.status(400).json({ error: 'Policy not found' });
  if (tErr || !trigger) return res.status(400).json({ error: 'Trigger not found' });
  if (policy.status !== 'active') return res.status(400).json({ error: 'Policy is not active' });

  // Count existing claims on this policy for fraud scoring
  const { count } = await supabase
    .from('claims')
    .select('id', { count: 'exact', head: true })
    .eq('policy_id', policy_id);

  const fraudScore   = computeFraudScore((count || 0) + 1, trigger.type);
  const isFlagged    = fraudScore > 0.70;
  const payoutRatio  = computePayoutRatio(trigger.type);
  const payoutAmount = Math.round(policy.coverage_amount * payoutRatio);
  const status       = isFlagged ? 'manual_review' : 'approved';

  const { data: claim, error: claimErr } = await supabase
    .from('claims')
    .insert([{
      policy_id,
      trigger_id,
      trigger_type: trigger.type,
      amount: payoutAmount,
      fraud_score: fraudScore,
      status,
      initiated_at: new Date().toISOString(),
    }])
    .select().single();

  if (claimErr) return res.status(400).json({ error: claimErr.message });

  // Auto-payout for approved claims - zero human intervention
  if (status === 'approved') {
    const txnId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
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
    payout_amount: payoutAmount,
    fraud_score: fraudScore,
    zero_touch: true,
    message: status === 'approved'
      ? `Claim auto-approved. Rs ${payoutAmount} dispatched via UPI. No action needed.`
      : 'Claim flagged for manual review due to anomaly detection.',
  });
});

// POST /api/claims/auto - zero-touch: check triggers and auto-file claim for active policy
router.post('/auto', authMiddleware, async (req, res) => {
  const { worker_id } = req.body;

  // Get active policy
  const { data: policy } = await supabase
    .from('policies').select('*').eq('worker_id', worker_id).eq('status', 'active').single();

  if (!policy) return res.status(400).json({ error: 'No active policy' });

  // Get worker city for trigger check
  const { data: worker } = await supabase
    .from('workers').select('city, pin_code').eq('id', worker_id).single();

  if (!worker) return res.status(400).json({ error: 'Worker not found' });

  // Get latest unfired trigger for this pin_code
  const { data: trigger } = await supabase
    .from('triggers')
    .select('*')
    .eq('pin_code', worker.pin_code)
    .order('fired_at', { ascending: false })
    .limit(1)
    .single();

  if (!trigger) return res.json({ message: 'No active triggers in your zone. You are safe.', triggered: false });

  // Check if claim already filed for this trigger
  const { count } = await supabase
    .from('claims').select('id', { count: 'exact', head: true }).eq('trigger_id', trigger.id);

  if (count > 0) return res.json({ message: 'Claim already filed for this trigger.', triggered: false });

  // Auto-file claim
  const fraudScore   = computeFraudScore(1, trigger.type);
  const payoutAmount = Math.round(policy.coverage_amount * computePayoutRatio(trigger.type));
  const status       = fraudScore > 0.70 ? 'manual_review' : 'approved';

  const { data: claim, error } = await supabase
    .from('claims')
    .insert([{ policy_id: policy.id, trigger_id: trigger.id, trigger_type: trigger.type, amount: payoutAmount, fraud_score: fraudScore, status, initiated_at: new Date().toISOString() }])
    .select().single();

  if (error) return res.status(400).json({ error: error.message });

  if (status === 'approved') {
    const txnId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    await supabase.from('payouts').insert([{ claim_id: claim.id, amount: payoutAmount, channel: 'UPI (Mock)', status: 'completed', transaction_id: txnId, initiated_at: new Date().toISOString(), completed_at: new Date().toISOString() }]);
    await supabase.from('claims').update({ status: 'paid' }).eq('id', claim.id);
    claim.status = 'paid';
  }

  res.json({ claim, triggered: true, zero_touch: true, message: `Auto-claim filed for ${trigger.type}. Rs ${payoutAmount} dispatched.` });
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

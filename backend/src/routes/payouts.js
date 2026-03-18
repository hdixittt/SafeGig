const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin: supabase } = require('../supabase');

// POST /api/payouts — mock UPI payout (Razorpay sandbox placeholder)
router.post('/', authMiddleware, async (req, res) => {
  const { claim_id, amount, channel = 'UPI (Mock)' } = req.body;

  const txnId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

  const { data, error } = await supabase
    .from('payouts')
    .insert([{
      claim_id,
      amount,
      channel,
      status: 'completed',
      transaction_id: txnId,
      initiated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  await supabase.from('claims').update({ status: 'paid' }).eq('id', claim_id);

  res.json({
    payout: data,
    message: `₹${amount} payout initiated via ${channel}. Transaction ID: ${txnId}`,
  });
});

// GET /api/payouts/claim/:claimId
router.get('/claim/:claimId', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('claim_id', req.params.claimId)
    .single();

  if (error) return res.status(404).json({ error: 'Payout not found' });
  res.json(data);
});

module.exports = router;

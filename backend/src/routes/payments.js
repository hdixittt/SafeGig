const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin: supabase } = require('../supabase');
const { computeRiskScore } = require('../lib/riskEngine');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

// POST /api/payments/create-order
// Creates a Razorpay order for the selected plan premium
router.post('/create-order', authMiddleware, async (req, res) => {
  const { worker_id, plan } = req.body;

  const PLAN_PREMIUMS = {
    low:      2900,   // paise (Rs 29)
    standard: 4900,
    high:     7900,
    critical: 9900,
  };

  const amount = PLAN_PREMIUMS[plan?.toLowerCase()];
  if (!amount) return res.status(400).json({ error: 'Invalid plan. Choose: low, standard, high, critical' });

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt:  `sg_${worker_id.substring(0, 8)}_${Date.now()}`,
      notes:    { worker_id, plan },
    });
    res.json({ order_id: order.id, amount, currency: 'INR', key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder' });
  } catch (err) {
    console.error('[payments] Razorpay order error:', err);
    // In test/demo mode without real keys, return a mock order
    res.json({
      order_id:  `order_mock_${Date.now()}`,
      amount,
      currency:  'INR',
      key:       process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      mock:      true,
    });
  }
});

// POST /api/payments/verify
// Verifies Razorpay signature and activates policy
router.post('/verify', authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, worker_id, plan } = req.body;

  // Signature verification (skip for mock orders)
  if (!razorpay_order_id.startsWith('order_mock_')) {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(body).digest('hex');
    if (expected !== razorpay_signature)
      return res.status(400).json({ error: 'Payment verification failed' });
  }

  // Get worker and compute risk
  const { data: worker } = await supabase.from('workers').select('*').eq('id', worker_id).single();
  if (!worker) return res.status(404).json({ error: 'Worker not found' });

  const riskResult = computeRiskScore({ ...worker, claim_count: 0 });

  const weekStart = new Date();
  const weekEnd   = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const { data: policy, error } = await supabase
    .from('policies')
    .insert([{
      worker_id,
      week_start:      weekStart.toISOString(),
      week_end:        weekEnd.toISOString(),
      premium_paid:    riskResult.premium,
      coverage_amount: riskResult.coverage,
      risk_score:      riskResult.risk_score,
      status:          'active',
    }])
    .select().single();

  if (error) return res.status(400).json({ error: error.message });

  res.json({
    success: true,
    policy,
    pricing_breakdown: riskResult.adjustments,
    message: `Policy activated. Covered for Rs ${riskResult.coverage} this week.`,
  });
});

module.exports = router;

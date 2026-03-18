const router = require('express').Router();
const supabaseModule = require('../supabase');
const supabase = supabaseModule.supabase;
const supabaseAdmin = supabaseModule.supabaseAdmin;

// POST /api/auth/register
// Creates a Supabase Auth user, then inserts a worker profile row.
router.post('/register', async (req, res) => {
  const { name, phone, email, city, pin_code, platform, weekly_hours, password } = req.body;

  // Use phone as the email identifier (e.g. phone@safegig.demo) so Supabase
  // email/password auth works without requiring a real email address.
  const authEmail = email || `${phone}@safegig.demo`;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: authEmail,
    password,
  });

  if (authError) {
    console.error('[register] Supabase auth error:', authError);
    return res.status(400).json({ error: authError.message });
  }

  const userId = authData.user.id;

  const { data: worker, error: workerError } = await supabaseAdmin
    .from('workers')
    .insert([{ id: userId, name, phone, email: authEmail, city, pin_code, platform, weekly_hours }])
    .select('id, name, city')
    .single();

  if (workerError) {
    console.error('[register] Worker insert error:', workerError);
    return res.status(400).json({ error: workerError.message });
  }

  res.json({
    token: authData.session?.access_token,
    worker,
  });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  // Look up the auth email from the workers table by phone
  const { data: workerRow, error: lookupError } = await supabaseAdmin
    .from('workers')
    .select('email, id, name, city')
    .eq('phone', phone)
    .single();

  if (lookupError || !workerRow) return res.status(401).json({ error: 'Worker not found' });

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: workerRow.email,
    password,
  });

  if (authError) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({
    token: authData.session.access_token,
    worker: { id: workerRow.id, name: workerRow.name, city: workerRow.city },
  });
});

module.exports = router;

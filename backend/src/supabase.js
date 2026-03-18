const { createClient } = require('@supabase/supabase-js');

// Auth client — uses anon key, respects RLS (used for verifying user sessions)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin client — uses service role key, bypasses RLS (used for all DB writes from backend)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

module.exports = { supabase, supabaseAdmin };

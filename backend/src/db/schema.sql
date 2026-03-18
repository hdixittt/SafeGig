-- SafeGig Database Schema (Supabase / PostgreSQL)

-- workers.id matches the Supabase Auth user UUID — no separate password column needed.
CREATE TABLE workers (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  phone        TEXT UNIQUE NOT NULL,
  email        TEXT NOT NULL,
  city         TEXT NOT NULL,
  pin_code     TEXT NOT NULL,
  platform     TEXT NOT NULL CHECK (platform IN ('Zepto', 'Blinkit', 'Instamart')),
  weekly_hours NUMERIC NOT NULL DEFAULT 40,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE policies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id       UUID REFERENCES workers(id) ON DELETE CASCADE,
  week_start      TIMESTAMPTZ NOT NULL,
  week_end        TIMESTAMPTZ NOT NULL,
  premium_paid    NUMERIC NOT NULL,
  coverage_amount NUMERIC NOT NULL,
  risk_score      NUMERIC NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE triggers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL CHECK (type IN ('heavy_rain', 'extreme_heat', 'severe_pollution', 'curfew_strike')),
  pin_code        TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  actual_value    NUMERIC NOT NULL,
  fired_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE claims (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id    UUID REFERENCES policies(id) ON DELETE CASCADE,
  trigger_id   UUID REFERENCES triggers(id),
  amount       NUMERIC NOT NULL,
  fraud_score  NUMERIC NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'paid', 'manual_review', 'rejected')),
  initiated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payouts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id       UUID REFERENCES claims(id) ON DELETE CASCADE,
  amount         NUMERIC NOT NULL,
  channel        TEXT NOT NULL DEFAULT 'UPI',
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_id TEXT,
  initiated_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_at   TIMESTAMPTZ
);

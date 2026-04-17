# SafeGig (Coverly) — Project Overview

AI-powered parametric insurance platform for gig delivery workers in India. Workers pay a weekly premium and receive automatic payouts when environmental triggers (rain, heat, pollution, curfew, accidents, platform downtime, burnout) cross defined thresholds — no forms, no claims process, no waiting.

---

## Problem Statement

India's 15 million+ gig delivery workers (Zepto, Blinkit, Swiggy, Zomato) have zero income protection. A heavy rain day, a curfew, or extreme heat can wipe out an entire week's earnings. Traditional insurance is too slow, too expensive, and requires manual claims. SafeGig solves this with parametric insurance — payouts triggered automatically by real-world data, not paperwork.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)               │
│  Worker Portal          Admin Portal (13 sections)       │
│  localhost:5173         /admin                           │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (Axios, /api proxy)
┌────────────────────────▼────────────────────────────────┐
│                 BACKEND (Node.js + Express)              │
│                    localhost:5001                        │
│  Auth / Workers / Policies / Triggers / Claims          │
│  Payouts / Payments / Admin API                         │
└──────┬──────────────────────────┬───────────────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────┐
│  Supabase   │          │  External APIs  │
│  Auth + DB  │          │  Open-Meteo     │
│  PostgreSQL │          │  (weather/AQI)  │
└─────────────┘          └─────────────────┘
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI framework |
| Vite | 5.0 | Build tool and dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| Framer Motion | 11.0 | Animations and transitions |
| Recharts | 2.12 | Charts (bar, area, line, radial, pie) |
| Lucide React | 0.344 | Icon library |
| Axios | 1.6 | HTTP client |
| React Router DOM | 6.21 | Client-side routing |
| Context API | native | Multi-language localization and state propagation |
| PostCSS + Autoprefixer | latest | CSS processing |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22.x | Runtime |
| Express | 4.18 | HTTP server and routing |
| @supabase/supabase-js | 2.39 | Database and auth client |
| Razorpay | 2.9 | Payment gateway SDK |
| dotenv | 16.3 | Environment variable management |
| cors | 2.8 | Cross-origin request handling |
| nodemon | 3.0 | Dev auto-restart |

### Database

| Technology | Purpose |
|---|---|
| Supabase (PostgreSQL) | Primary database — workers, policies, triggers, claims, payouts |
| Supabase Auth | User authentication (email/password, JWT sessions) |
| Row Level Security | Disabled for backend writes (service role key bypasses RLS) |

### ML Service (Python)

| Technology | Version | Purpose |
|---|---|---|
| FastAPI | latest | REST API framework |
| scikit-learn | latest | Risk scoring model (XGBoost-style simulation) |
| pandas / numpy | latest | Data processing |
| uvicorn | latest | ASGI server |

Note: ML service is not required for the demo. Risk scoring and fraud detection run inline in the Node.js backend via `riskEngine.js`.

### External APIs (Free, No Key Required)

| API | Purpose | Key Required |
|---|---|---|
| Open-Meteo | Real-time temperature and rainfall | No |
| Open-Meteo Air Quality | PM2.5 data converted to US AQI via EPA breakpoints | No |
| Razorpay | Payment gateway (test mode) | Yes (test keys) |

---

## Project Structure

```
safegig/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── schema.sql              PostgreSQL schema
│   │   ├── lib/
│   │   │   └── riskEngine.js           Dynamic ML pricing engine
│   │   ├── middleware/
│   │   │   └── auth.js                 JWT/Supabase token verification
│   │   ├── routes/
│   │   │   ├── admin.js                Admin API (workers, policies, claims, stats)
│   │   │   ├── auth.js                 Register and login
│   │   │   ├── claims.js               Zero-touch claim pipeline
│   │   │   ├── payments.js             Razorpay order creation and verification
│   │   │   ├── payouts.js              Payout records
│   │   │   ├── policies.js             Weekly policy creation
│   │   │   ├── triggers.js             5 automated triggers + live conditions API
│   │   │   └── workers.js              Worker profile and risk profile
│   │   ├── index.js                    Express app entry point
│   │   └── supabase.js                 Supabase client (anon + service role)
│   ├── .env                            Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminSidebar.jsx        13-tab admin navigation
│   │   │   ├── BurnoutProtection.jsx   Burnout monitoring module
│   │   │   ├── Chatbot.jsx             Context-aware AI assistant
│   │   │   ├── ClaimsTable.jsx         Claims list with trigger icons
│   │   │   ├── CoverageMap.jsx         Active disruption zones visualization
│   │   │   ├── CoverlyLogo.jsx         Branded platform logo
│   │   │   ├── LanguageSelector.jsx    Multi-language UI toggle
│   │   │   ├── LiveConditions.jsx      Real-time weather/AQI/trigger display
│   │   │   ├── PlatformDowntime.jsx    Outage tracker for gig apps
│   │   │   ├── PolicyCard.jsx          Policy summary card
│   │   │   ├── RiskCard.jsx            Risk score display
│   │   │   ├── Sidebar.jsx             Worker portal navigation
│   │   │   ├── StatCard.jsx            Metric card component
│   │   │   └── ThemeToggle.jsx         Dark/light mode toggle
│   │   ├── context/
│   │   │   ├── LanguageContext.jsx     Multi-language context state
│   │   │   └── ThemeContext.jsx        Global theme state (localStorage)
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Overview.jsx        Command center — platform pulse
│   │   │   │   ├── Workers.jsx         Worker registry with search/filter
│   │   │   │   ├── Policies.jsx        Policy management and overrides
│   │   │   │   ├── PricingEngine.jsx   ML pricing monitor and zone heatmap
│   │   │   │   ├── TriggerMonitor.jsx  Live 5-trigger dashboard + manual fire
│   │   │   │   ├── Claims.jsx          Full claims pipeline with drill-down
│   │   │   │   ├── Fraud.jsx           Fraud console and watchlist
│   │   │   │   ├── Payouts.jsx         UPI transaction tracker
│   │   │   │   ├── Heatmap.jsx         Zone risk heatmap (visual grid)
│   │   │   │   ├── MLHealth.jsx        Model metrics, drift, retrain
│   │   │   │   ├── Notifications.jsx   Alert config and NLP preview
│   │   │   │   ├── Reports.jsx         CSV/PDF report downloads
│   │   │   │   └── Roles.jsx           User roles and audit log
│   │   │   ├── AdminDashboard.jsx      Admin shell with tab routing
│   │   │   ├── AdminLogin.jsx          Admin login page
│   │   │   ├── BonusDashboard.jsx      Dashboard for tracking incentives
│   │   │   ├── CustomerCare.jsx        Support resources and ticket portal
│   │   │   ├── Dashboard.jsx           Worker dashboard
│   │   │   ├── FAQ.jsx                 Frequently Asked Questions portal
│   │   │   ├── Login.jsx               Worker login
│   │   │   ├── Plans.jsx               Plan selection + Razorpay checkout
│   │   │   └── Register.jsx            Worker registration
│   │   ├── api.js                      Axios instance with auth interceptor
│   │   ├── App.jsx                     Route definitions
│   │   ├── index.css                   Global styles, CSS variables, glassmorphism
│   │   └── main.jsx                    React entry point with ThemeProvider
│   ├── vite.config.js                  Vite config with /api proxy to :5001
│   └── package.json
│
├── ml-service/
│   ├── main.py                         FastAPI app entry
│   ├── ml_core.py                      Risk model training and inference
│   ├── routers/
│   │   ├── risk.py                     Risk scoring endpoint
│   │   ├── fraud.py                    Fraud detection endpoint
│   │   └── summary.py                  Worker summary endpoint
│   ├── risk_model.pkl                  Trained scikit-learn model
│   ├── city_encoder.pkl                Label encoder for cities
│   ├── platform_encoder.pkl            Label encoder for platforms
│   └── requirements.txt
│
├── .env.example                        Environment variable template
├── README.md                           Project readme
└── PROJECT_OVERVIEW.md                 This file
```

---

## Database Schema

### workers
```sql
id           UUID  (FK to auth.users)
name         TEXT
phone        TEXT  UNIQUE
email        TEXT
city         TEXT
pin_code     TEXT
platform     TEXT
weekly_hours NUMERIC
created_at   TIMESTAMPTZ
```

### policies
```sql
id              UUID
worker_id       UUID  (FK workers)
week_start      TIMESTAMPTZ
week_end        TIMESTAMPTZ
premium_paid    NUMERIC
coverage_amount NUMERIC
risk_score      NUMERIC
status          TEXT  (active | expired | cancelled)
created_at      TIMESTAMPTZ
```

### triggers
```sql
id              UUID
type            TEXT  (heavy_rain | extreme_heat | severe_pollution | curfew_strike | road_accident_surge)
pin_code        TEXT
threshold_value NUMERIC
actual_value    NUMERIC
source          TEXT  (mock_weather_api | mock_aqi_api | mock_ndma_api | admin_mock | live)
fired_at        TIMESTAMPTZ
```

### claims
```sql
id           UUID
policy_id    UUID  (FK policies)
trigger_id   UUID  (FK triggers)
trigger_type TEXT
amount       NUMERIC
fraud_score  NUMERIC
status       TEXT  (approved | paid | manual_review | rejected)
initiated_at TIMESTAMPTZ
```

### payouts
```sql
id             UUID
claim_id       UUID  (FK claims)
amount         NUMERIC
channel        TEXT
status         TEXT  (pending | completed | failed)
transaction_id TEXT
initiated_at   TIMESTAMPTZ
completed_at   TIMESTAMPTZ
```

---

## Core Features

### 1. Dynamic ML Pricing Engine (riskEngine.js)

Simulates an XGBoost-style model with 4 independently adjustable risk signals:

| Signal | Source | Effect |
|---|---|---|
| City base risk | Historical incident data (mock) | Base premium tier |
| Hours worked | Worker profile | +0.18 factor per 80h/week |
| Platform risk | Platform type (Zepto/Blinkit etc.) | +0.04 to +0.07 |
| Weather forecast | Weekly forecast per city (mock) | +0.02 to +0.11 |

Dynamic adjustments applied on top:
- Safe flood zone (pin-code) → Rs 2-5 discount
- Adverse weather forecast → +Rs 8 premium, +Rs 500 coverage
- Zero-claim loyalty → Rs 3 discount
- Severe pollution zone → Rs 4 surcharge

Output: `{ risk_score, tier, premium, coverage, adjustments[], forecast }`

### 2. Five Automated Triggers

| Trigger | Threshold | Data Source |
|---|---|---|
| Heavy Rain | >50 mm/hr | Open-Meteo (real) |
| Extreme Heat | >42°C | Open-Meteo (real) |
| Severe Pollution | AQI >300 | Open-Meteo Air Quality (real, EPA PM2.5 conversion) |
| Curfew / Strike | flag=1 | Mock (NDMA API placeholder) |
| Road Accident Surge | >5 incidents/hr | Mock (traffic API placeholder) |

Live conditions refresh every 60 seconds on the worker dashboard.

### 3. Zero-Touch Claims Pipeline

```
Trigger fires in worker's zone
        ↓
POST /api/claims/auto (runs every 30s on dashboard)
        ↓
Isolation Forest fraud score computed
        ↓
fraud_score > 0.70 → manual_review
fraud_score ≤ 0.70 → approved
        ↓
Payout record created (UPI Mock)
        ↓
Claim status → paid
        ↓
Worker sees banner notification
```

Payout ratios by trigger type:
- Heavy rain / Curfew: 40% of coverage
- Accident surge: 35% of coverage
- Heat / Pollution: 25% of coverage

### 4. Fraud Detection

Simulates Isolation Forest anomaly detection:
- Claim frequency scoring: each additional claim/week adds 0.15 to fraud score
- Trigger type bonus: curfew claims get -0.05 (harder to fake)
- Random jitter: ±0.04 for realistic variance
- Threshold: >0.70 flags for manual review
- **Live GPS Spoofing Demo**: Visualizes and traces fraudulent location manipulation directly within the Admin Fraud Console.

### 5. Payment Flow (Razorpay)

```
Worker selects plan on /plans
        ↓
POST /api/payments/create-order
        ↓
Razorpay checkout opens (real keys) OR mock mode (no keys)
        ↓
POST /api/payments/verify (signature check)
        ↓
Policy created in database
        ↓
Redirect to /dashboard
```

---

## API Endpoints

### Auth
```
POST /api/auth/register    Create Supabase auth user + worker profile
POST /api/auth/login       Sign in, return JWT token
```

### Workers
```
GET  /api/workers/me                    Current worker profile
GET  /api/workers/:id/risk-profile      ML risk score + pricing breakdown
```

### Policies
```
POST /api/policies                      Create weekly policy (ML-priced)
GET  /api/policies/worker/:workerId     Worker's policy history
```

### Triggers
```
GET  /api/triggers/conditions/:city     Live weather + AQI + trigger status
POST /api/triggers/check                Evaluate and store fired triggers
POST /api/triggers/mock                 Admin: manually fire a trigger
```

### Claims
```
POST /api/claims                        Manual claim creation
POST /api/claims/auto                   Zero-touch auto-claim check
GET  /api/claims/worker/:workerId       Worker's claim history
```

### Payments
```
POST /api/payments/create-order         Create Razorpay order
POST /api/payments/verify               Verify payment + activate policy
```

### Admin
```
GET  /api/admin/workers                 All workers
GET  /api/admin/policies                All policies with worker names
GET  /api/admin/claims                  All claims with worker names
GET  /api/admin/payouts                 All payouts with trigger info
GET  /api/admin/stats/workers           Total worker count
GET  /api/admin/stats/policies          Active policy count
GET  /api/admin/stats/claims            Pending + flagged claim counts
GET  /api/admin/stats/payouts           Total payout amount
```

---

## Admin Portal (13 Sections)

| Section | Description |
|---|---|
| Overview | Platform pulse — 6 live stats, payout chart, claims trend, tier distribution |
| Workers | Full registry, search/filter by city/platform/tier, profile modal, flag/suspend |
| Policies | Active/expired/cancelled list, extend/cancel actions |
| Premium Engine | ML signal bars, zone pricing heatmap, manual re-price trigger |
| Trigger Monitor | Live 5-trigger dashboard with real API data. Manual mock triggers immediately auto-file claims for all workers in the affected pin code. |
| Claims | Full pipeline table, drill-down modal with fraud score + GPS validation |
| Fraud Console | Score distribution chart, suspicious patterns, watchlist, and **Live GPS Spoofing Demo** |
| Payout Tracker | Every UPI transaction, aggregate stats, failed retry queue |
| Zone Heatmap | Visual grid of 8 cities with risk/rain/AQI/temp metric toggle |
| ML Health | Accuracy/AUC-ROC metrics, predicted vs actual chart, drift alert, retrain button |
| Notifications | Toggle rules, Hindi/English NLP preview, escalation rules |
| Reports | 6 report types, date range filter, CSV/PDF download, scheduled delivery |
| Roles | Role cards with permissions, user table, audit log |

---

## Environment Variables

```env
# Backend (.env)
PORT=5001
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

# Frontend (vite.config.js proxy — no .env needed for local dev)
# For production deployment:
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Running Locally

```bash
# Terminal 1 — Backend
cd safegig/backend
node src/index.js

# Terminal 2 — Frontend
cd safegig/frontend
npm run dev
```

Open http://localhost:5173

Worker demo: register at /register
Admin demo: admin@safegig.demo / SafeGig@2026 at /admin/login

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Backend | Render (free tier) | https://safegig-ts26.onrender.com |
| Frontend | Vercel (free tier) | https://safe-gig-omega.vercel.app |
| Database | Supabase (free tier) | Managed PostgreSQL |

---

## Design System

- Theme: Rebranded to **Coverly**, using a vibrant Yellow (#FFCE32) and Prussian Blue (#1D63FF) color scheme.
- CSS variables: `--bg`, `--bg-2`, `--text-1`, `--text-2`, `--text-3`, `--border`
- Multi-Language: Powered by Context API allowing seamless localized UX.
- Dark/light toggle stored in localStorage as `sg_theme`, applied via `data-theme` on `<html>`
- Typography: Inter (system font stack), font-black for headings
- Animations: Framer Motion for page transitions, full-screen UPI receipt popups, banner notifications
- Charts: Recharts — AreaChart, BarChart, LineChart, RadialBarChart, PieChart

---

## Key Design Decisions

1. Supabase service role key used for all backend DB writes — bypasses RLS, avoids permission errors
2. ML service not required for demo — risk scoring runs inline in Node.js for zero-dependency deployment
3. Open-Meteo used for weather and AQI — completely free, no API key, reliable uptime
4. AQI computed from PM2.5 using official EPA breakpoints (not Open-Meteo's inaccurate us_aqi field)
5. Razorpay falls back to mock mode if keys are missing — demo works end-to-end without payment keys
6. Zero-touch claims feature 10-second polling on the dashboard. Admin triggers instantly file claims for all workers in that zone, showing a full-screen UPI receipt.
7. Admin portal uses tab-based routing (no URL changes) to keep the single /admin route clean
8. City matching uses partial string matching — "Gurgaon", "Gurugram", "New Delhi" all resolve correctly
9. Chatbot & Customer Care modules integrate Google Gemini to provide instant, context-aware gig query resolutions.
10. Multi-language support implemented via Context API ensures an inclusive workflow for diverse driver demographics.

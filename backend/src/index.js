require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/workers');
const policyRoutes = require('./routes/policies');
const triggerRoutes = require('./routes/triggers');
const claimRoutes = require('./routes/claims');
const payoutRoutes = require('./routes/payouts');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/triggers', triggerRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/payouts', payoutRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'safegig-backend' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SafeGig backend running on port ${PORT}`));

const express = require('express');
const cors = require('cors');
const marketsRouter = require('./routes/markets');
const betsRouter = require('./routes/bets');
const fundsRouter = require('./routes/funds');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// ── Request logger (helpful during dev) ────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ──────────────────────────────────────────────────
app.use('/api/markets', marketsRouter);
app.use('/api/bets', betsRouter);
app.use('/api/funds', fundsRouter);

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 fallback ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Phitien API running at http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health\n`);
});

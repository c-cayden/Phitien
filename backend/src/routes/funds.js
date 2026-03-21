const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const USERS_PATH = path.join(__dirname, '../data/users.json');

// Point packages available for purchase
const PACKAGES = [
  { id: 'starter',    points: 500,  usdPrice: 4.99,  rateLabel: '100 pts / $1' },
  { id: 'popular',    points: 1200, usdPrice: 9.99,  rateLabel: '120 pts / $1' },
  { id: 'pro',        points: 2750, usdPrice: 19.99, rateLabel: '137 pts / $1' },
  { id: 'best-value', points: 6000, usdPrice: 39.99, rateLabel: '150 pts / $1' },
];

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
}
function writeUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

// ── GET /api/funds/packages ────────────────────────────────────
router.get('/packages', (_req, res) => {
  res.json(PACKAGES);
});

// ── GET /api/funds/balance/:userId ────────────────────────────
router.get('/balance/:userId', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ balance: user.balance });
});

// ── POST /api/funds/purchase ──────────────────────────────────
// Simulated payment — no real charge. Validates form fields,
// then credits the user's balance with the selected package points.
router.post('/purchase', (req, res) => {
  const { userId = 'demo-user', packageId, cardName, cardNumber, expiry, cvv } = req.body;

  // Validate required fields
  if (!packageId) return res.status(400).json({ error: 'packageId is required' });
  if (!cardName || !cardNumber || !expiry || !cvv) {
    return res.status(400).json({ error: 'All card fields are required' });
  }

  // Basic card validation (placeholder — not real payment processing)
  const cleanCard = cardNumber.replace(/\s/g, '');
  if (cleanCard.length < 13 || cleanCard.length > 19) {
    return res.status(400).json({ error: 'Invalid card number length' });
  }

  const pkg = PACKAGES.find(p => p.id === packageId);
  if (!pkg) return res.status(404).json({ error: 'Package not found' });

  const users = readUsers();
  const userIdx = users.findIndex(u => u.id === userId);
  if (userIdx === -1) return res.status(404).json({ error: 'User not found' });

  // Simulate a short processing delay (handled client-side)
  users[userIdx].balance = parseFloat((users[userIdx].balance + pkg.points).toFixed(2));
  writeUsers(users);

  res.json({
    success: true,
    pointsAdded: pkg.points,
    newBalance: users[userIdx].balance,
    packageName: pkg.id,
  });
});

module.exports = router;

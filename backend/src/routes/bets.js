const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const USERS_PATH = path.join(__dirname, '../data/users.json');
const MARKETS_PATH = path.join(__dirname, '../data/markets.json');

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
}
function writeUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}
function readMarkets() {
  return JSON.parse(fs.readFileSync(MARKETS_PATH, 'utf-8'));
}
function writeMarkets(markets) {
  fs.writeFileSync(MARKETS_PATH, JSON.stringify(markets, null, 2));
}

// ── POST /api/bets ────────────────────────────────────────────
// Place a bet on a market
router.post('/', (req, res) => {
  const { userId = 'demo-user', marketId, side, amount } = req.body;

  if (!marketId || !side || !amount) {
    return res.status(400).json({ error: 'marketId, side, and amount are required' });
  }
  if (!['YES', 'NO'].includes(side)) {
    return res.status(400).json({ error: 'side must be YES or NO' });
  }
  if (amount <= 0) {
    return res.status(400).json({ error: 'amount must be positive' });
  }

  const users = readUsers();
  const userIdx = users.findIndex(u => u.id === userId);
  if (userIdx === -1) return res.status(404).json({ error: 'User not found' });

  const user = users[userIdx];
  if (user.balance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  const markets = readMarkets();
  const marketIdx = markets.findIndex(m => m.id === parseInt(marketId));
  if (marketIdx === -1) return res.status(404).json({ error: 'Market not found' });
  if (markets[marketIdx].resolved) {
    return res.status(400).json({ error: 'Market is already resolved' });
  }

  // Calculate payout
  const market = markets[marketIdx];
  const prob = side === 'YES' ? market.yesProb / 100 : (100 - market.yesProb) / 100;
  const payout = parseFloat((amount / prob).toFixed(2));

  // Deduct balance
  user.balance = parseFloat((user.balance - amount).toFixed(2));

  // Record the bet
  const bet = {
    id: Date.now(),
    marketId: parseInt(marketId),
    marketTitle: market.title,
    side,
    amount,
    payout,
    entryProb: prob,
    placedAt: new Date().toISOString(),
    settled: false,
  };
  user.bets.push(bet);
  users[userIdx] = user;
  writeUsers(users);

  // Nudge market probability
  markets[marketIdx].yesProb = Math.min(93, Math.max(7, market.yesProb + (side === 'YES' ? 2 : -2)));
  markets[marketIdx].volume = parseFloat((market.volume + amount).toFixed(2));
  writeMarkets(markets);

  res.status(201).json({
    bet,
    newBalance: user.balance,
    updatedMarket: markets[marketIdx],
  });
});

// ── GET /api/bets/:userId ─────────────────────────────────────
router.get('/:userId', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.bets);
});

module.exports = router;

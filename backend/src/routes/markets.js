const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '../data/markets.json');

// ── Helpers ─────────────────────────────────────────────────
function readMarkets() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeMarkets(markets) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(markets, null, 2));
}

// ── GET /api/markets ─────────────────────────────────────────
// Returns all markets, optionally filtered by ?category=Finance
router.get('/', (req, res) => {
  try {
    let markets = readMarkets();
    if (req.query.category && req.query.category !== 'All') {
      markets = markets.filter(
        m => m.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }
    res.json(markets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load markets' });
  }
});

// ── GET /api/markets/:id ─────────────────────────────────────
router.get('/:id', (req, res) => {
  const markets = readMarkets();
  const market = markets.find(m => m.id === parseInt(req.params.id));
  if (!market) return res.status(404).json({ error: 'Market not found' });
  res.json(market);
});

// ── POST /api/markets ─────────────────────────────────────────
// Create a new market manually (for non-technical team members via admin)
router.post('/', (req, res) => {
  const { title, category, yesProb, volume } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: 'title and category are required' });
  }
  const markets = readMarkets();
  const newMarket = {
    id: Date.now(),
    title,
    category,
    yesProb: yesProb ?? 50,
    volume: volume ?? 0,
    resolved: false,
    outcome: null,
    createdAt: new Date().toISOString(),
  };
  markets.unshift(newMarket);
  writeMarkets(markets);
  res.status(201).json(newMarket);
});

// ── PATCH /api/markets/:id/probability ───────────────────────
// Internal: nudge probability after a bet is placed
router.patch('/:id/probability', (req, res) => {
  const { shift, volumeAdd } = req.body;
  const markets = readMarkets();
  const idx = markets.findIndex(m => m.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Market not found' });

  markets[idx].yesProb = Math.min(93, Math.max(7, markets[idx].yesProb + (shift || 0)));
  markets[idx].volume += volumeAdd || 0;
  writeMarkets(markets);
  res.json(markets[idx]);
});

// ── POST /api/markets/generate ────────────────────────────────
// AI-powered market generation using Anthropic API + web search
router.post('/generate', async (req, res) => {
  const { topic, apiKey } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic is required' });
  if (!apiKey) return res.status(400).json({ error: 'apiKey is required' });

  const SYSTEM = `You are a prediction market maker for PHITIEN, a Kalshi-style betting platform.
Use the web_search tool to research current real-world events, then create 4-6 YES/NO prediction markets.
Respond ONLY with a JSON array — no markdown, no backticks, no preamble:
[{"title":"Will X happen by Y date?","category":"Finance","yesProb":62,"volume":45000}]
Rules:
- title: clear YES/NO question with specific conditions or dates
- category: one of Finance | Crypto | Sports | Tech | Politics | Economy | Entertainment | Science
- yesProb: realistic integer 5-95
- volume: realistic integer 5000-250000
- Ground every market in real current events found via search`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: SYSTEM,
        messages: [{ role: 'user', content: `Create prediction markets about: ${topic}. Search for current news first.` }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(502).json({ error: err.error?.message || 'Anthropic API error' });
    }

    const data = await response.json();
    const block = data.content.find(b => b.type === 'text');
    if (!block) return res.status(502).json({ error: 'No text in Anthropic response' });

    let raw = block.text.trim().replace(/```json|```/g, '').trim();
    const start = raw.indexOf('['), end = raw.lastIndexOf(']');
    if (start < 0 || end < 0) return res.status(502).json({ error: 'Could not parse AI response' });

    const parsed = JSON.parse(raw.slice(start, end + 1));
    const markets = readMarkets();
    const newMarkets = parsed.map((m, i) => ({
      id: Date.now() + i,
      title: m.title,
      category: m.category,
      yesProb: Math.min(95, Math.max(5, m.yesProb)),
      volume: m.volume || 0,
      resolved: false,
      outcome: null,
      createdAt: new Date().toISOString(),
    }));

    markets.unshift(...newMarkets);
    writeMarkets(markets);
    res.json(newMarkets);
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/markets/:id ───────────────────────────────────
router.delete('/:id', (req, res) => {
  const markets = readMarkets();
  const filtered = markets.filter(m => m.id !== parseInt(req.params.id));
  if (filtered.length === markets.length) return res.status(404).json({ error: 'Market not found' });
  writeMarkets(filtered);
  res.json({ success: true });
});

module.exports = router;

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const USER_ID = 'demo-user';
const API_BASE = '/api';

export function AppProvider({ children }) {
  const [markets, setMarkets]     = useState([]);
  const [bets, setBets]           = useState([]);
  const [balance, setBalance]     = useState(1000);
  const [apiKey, setApiKey]       = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading]     = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast]         = useState(null);

  // ── Toast helper ──────────────────────────────────────────
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Fetch balance ─────────────────────────────────────────
  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/funds/balance/${USER_ID}`);
      const data = await res.json();
      if (data.balance !== undefined) setBalance(data.balance);
    } catch {
      // fallback: keep current balance
    }
  }, []);

  // ── Fetch markets ─────────────────────────────────────────
  const fetchMarkets = useCallback(async (category = 'All') => {
    setLoading(true);
    try {
      const url = category === 'All'
        ? `${API_BASE}/markets`
        : `${API_BASE}/markets?category=${encodeURIComponent(category)}`;
      const res = await fetch(url);
      const data = await res.json();
      setMarkets(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load markets', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ── Fetch bets ────────────────────────────────────────────
  const fetchBets = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/bets/${USER_ID}`);
      const data = await res.json();
      setBets(Array.isArray(data) ? data : []);
    } catch {
      // silent fail
    }
  }, []);

  // ── Initial load ──────────────────────────────────────────
  useEffect(() => {
    fetchMarkets('All');
    fetchBets();
    fetchBalance();
  }, [fetchMarkets, fetchBets, fetchBalance]);

  // ── Re-fetch when tab changes ─────────────────────────────
  useEffect(() => {
    fetchMarkets(activeTab);
  }, [activeTab, fetchMarkets]);

  // ── Place bet ─────────────────────────────────────────────
  const placeBet = useCallback(async (marketId, side, amount) => {
    try {
      const res = await fetch(`${API_BASE}/bets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, marketId, side, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bet failed');

      setBalance(data.newBalance);
      setBets(prev => [...prev, data.bet]);
      // Update the market in state
      setMarkets(prev =>
        prev.map(m => m.id === data.updatedMarket.id ? data.updatedMarket : m)
      );
      showToast(
        `${side === 'YES' ? '▲' : '▼'} ${side} — ${amount} pts staked · max payout ${data.bet.payout.toFixed(1)} pts`,
        side === 'YES' ? 'success' : 'error'
      );
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  }, [showToast]);

  // ── Generate AI markets ───────────────────────────────────
  const generateMarkets = useCallback(async (topic) => {
    if (!apiKey) { showToast('Enter your Anthropic API key first', 'error'); return; }
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/markets/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      await fetchMarkets(activeTab);
      showToast(`${data.length} new markets generated`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setGenerating(false);
    }
  }, [apiKey, activeTab, fetchMarkets, showToast]);

  // ── Purchase funds ────────────────────────────────────────
  const purchaseFunds = useCallback(async (packageId, cardDetails) => {
    try {
      const res = await fetch(`${API_BASE}/funds/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, packageId, ...cardDetails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Purchase failed');
      setBalance(data.newBalance);
      return data;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      markets, bets, balance, apiKey, setApiKey,
      activeTab, setActiveTab,
      loading, generating,
      toast,
      placeBet, generateMarkets, purchaseFunds,
      fetchMarkets, fetchBets, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
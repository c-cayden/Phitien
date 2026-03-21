import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Header.css';

export default function Header({ onAddFunds }) {
  const { balance, apiKey, setApiKey } = useApp();
  const [keyInput, setKeyInput] = useState('');
  const [keySet, setKeySet] = useState(false);

  function handleConnect(e) {
    e.preventDefault();
    const val = keyInput.trim();
    if (!val.startsWith('sk-ant-')) {
      alert('API key must start with sk-ant-');
      return;
    }
    setApiKey(val);
    setKeySet(true);
  }

  return (
    <header className="header">
      <div className="header-inner">

        {/* Brand */}
        <div className="header-brand">
          <span className="brand-suit red">♥</span>
          <span className="brand-name">Phitien</span>
          <span className="brand-suit muted">♠</span>
          <span className="brand-tagline">Prediction Markets</span>
        </div>

        {/* Right side */}
        <div className="header-right">

          {/* API Key */}
          {!keySet ? (
            <form className="api-form" onSubmit={handleConnect}>
              <input
                className="api-input"
                type="password"
                placeholder="Anthropic API key (sk-ant-...)"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
              />
              <button className="api-btn" type="submit">Connect AI</button>
            </form>
          ) : (
            <div className="api-connected">
              <span className="api-dot" />
              AI connected
            </div>
          )}

          {/* Add funds */}
          <button className="add-funds-btn" onClick={onAddFunds}>
            <BillIcon />
            Add Funds
          </button>

          {/* Balance */}
          <div className="balance-chip">
            <BillIcon />
            <span className="balance-number">{balance.toLocaleString()}</span>
            <span className="balance-unit">pts</span>
          </div>

        </div>
      </div>
    </header>
  );
}

function BillIcon() {
  return (
    <svg width="26" height="15" viewBox="0 0 26 15" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="25" height="14" rx="2" fill="#0d2e14" stroke="#4ade80" strokeWidth="1"/>
      <rect x="2" y="2" width="4" height="3" rx="0.5" fill="none" stroke="#4ade80" strokeWidth="0.7" opacity="0.5"/>
      <rect x="20" y="9" width="4" height="3" rx="0.5" fill="none" stroke="#4ade80" strokeWidth="0.7" opacity="0.5"/>
      <circle cx="13" cy="7.5" r="3" fill="none" stroke="#4ade80" strokeWidth="0.9"/>
      <circle cx="13" cy="7.5" r="1.4" fill="#4ade80" opacity="0.35"/>
      <line x1="9" y1="3" x2="17" y2="3" stroke="#4ade80" strokeWidth="0.5" opacity="0.3"/>
      <line x1="9" y1="12" x2="17" y2="12" stroke="#4ade80" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  );
}

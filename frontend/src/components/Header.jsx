import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Header.css';

export default function Header({ onAddFunds }) {
  const { balance, setApiKey } = useApp();
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

        <div className="header-brand">
          <HorseshoeIcon />
          <div className="brand-text-wrap">
            <span className="brand-name">PHITIEN</span>
            <span className="brand-tagline">Prediction Markets</span>
          </div>
        </div>

        <div className="header-right">
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

          <button className="add-funds-btn" onClick={onAddFunds}>
            <BillIcon />
            Add Funds
          </button>

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

function HorseshoeIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path
        d="M18 4C10.268 4 4 10.268 4 18C4 22.5 6.1 26.5 9.4 29.1L12 26C9.6 24 8 21.2 8 18C8 12.477 12.477 8 18 8C23.523 8 28 12.477 28 18C28 21.2 26.4 24 24 26L26.6 29.1C29.9 26.5 32 22.5 32 18C32 10.268 25.732 4 18 4Z"
        fill="none" stroke="#c8922a" strokeWidth="2.5" strokeLinecap="round"
      />
      <path d="M9.5 29L7 33" stroke="#c8922a" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M26.5 29L29 33" stroke="#c8922a" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="13" cy="19" r="1.5" fill="#c8922a"/>
      <circle cx="23" cy="19" r="1.5" fill="#c8922a"/>
    </svg>
  );
}

function BillIcon() {
  return (
    <svg width="26" height="15" viewBox="0 0 26 15" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="25" height="14" rx="1" fill="#1a0f04" stroke="#5dba72" strokeWidth="1"/>
      <rect x="2" y="2" width="4" height="3" rx="0.3" fill="none" stroke="#5dba72" strokeWidth="0.7" opacity="0.5"/>
      <rect x="20" y="9" width="4" height="3" rx="0.3" fill="none" stroke="#5dba72" strokeWidth="0.7" opacity="0.5"/>
      <circle cx="13" cy="7.5" r="3" fill="none" stroke="#5dba72" strokeWidth="0.9"/>
      <circle cx="13" cy="7.5" r="1.4" fill="#5dba72" opacity="0.35"/>
      <line x1="9" y1="3" x2="17" y2="3" stroke="#5dba72" strokeWidth="0.5" opacity="0.3"/>
      <line x1="9" y1="12" x2="17" y2="12" stroke="#5dba72" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  );
}
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './MarketCard.css';

const SUITS = ['♠', '♥', '♦', '♣'];

const CAT_CLASS = {
  Finance:       'cat-finance',
  Crypto:        'cat-crypto',
  Sports:        'cat-sports',
  Tech:          'cat-tech',
  Politics:      'cat-politics',
  Economy:       'cat-economy',
  Entertainment: 'cat-entertainment',
  Science:       'cat-science',
};

function shortVol(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(1)}k`;
  return `$${v}`;
}

export default function MarketCard({ market, index }) {
  const { placeBet, balance } = useApp();
  const [stake, setStake] = useState(10);
  const [placing, setPlacing] = useState(false);

  const yp = Math.min(95, Math.max(5, market.yesProb));
  const np = 100 - yp;
  const yesPayout = stake > 0 ? (stake / yp * 100).toFixed(1) : '0.0';
  const noPayout  = stake > 0 ? (stake / np * 100).toFixed(1) : '0.0';
  const suit = SUITS[index % 4];
  const catClass = CAT_CLASS[market.category] || 'cat-finance';

  async function handleBet(side) {
    if (placing) return;
    if (!stake || stake <= 0) return;
    setPlacing(true);
    await placeBet(market.id, side, Number(stake));
    setPlacing(false);
  }

  return (
    <div className="market-card">
      {/* Card header */}
      <div className="card-header">
        <span className={`card-category ${catClass}`}>{market.category}</span>
        <span className="card-suit">{suit}</span>
      </div>

      {/* Title */}
      <p className="card-title">{market.title}</p>

      {/* Probability bar */}
      <div className="prob-bar-wrap">
        <div
          className="prob-bar-yes"
          style={{ width: `${yp}%` }}
          title={`YES ${yp}%`}
        />
        <div className="prob-bar-no" title={`NO ${np}%`} />
      </div>

      {/* Probability labels */}
      <div className="prob-labels">
        <span className="prob-yes-lbl">YES &nbsp;{yp}%</span>
        <span className="prob-no-lbl">{np}%&nbsp; NO</span>
      </div>

      {/* Stake row */}
      <div className="stake-row">
        <label className="stake-label" htmlFor={`stake-${market.id}`}>Stake</label>
        <div className="stake-input-wrap">
          <input
            id={`stake-${market.id}`}
            className="stake-input"
            type="number"
            min="1"
            step="1"
            value={stake}
            onChange={e => setStake(Math.max(1, parseInt(e.target.value) || 1))}
          />
          <span className="stake-unit">pts</span>
        </div>
        <span className="vol-label">{shortVol(market.volume)} vol</span>
      </div>

      {/* Payout preview */}
      <div className="payout-preview">
        YES pays <span className="payout-yes">{yesPayout} pts</span>
        &nbsp;·&nbsp;
        NO pays <span className="payout-no">{noPayout} pts</span>
      </div>

      {/* Bet buttons */}
      <div className="bet-buttons">
        <button
          className="btn-yes"
          onClick={() => handleBet('YES')}
          disabled={placing || stake > balance}
        >
          {placing ? '...' : '▲ Buy YES'}
        </button>
        <button
          className="btn-no"
          onClick={() => handleBet('NO')}
          disabled={placing || stake > balance}
        >
          {placing ? '...' : '▼ Buy NO'}
        </button>
      </div>

      {stake > balance && (
        <p className="insufficient">Insufficient points — add funds to continue</p>
      )}
    </div>
  );
}

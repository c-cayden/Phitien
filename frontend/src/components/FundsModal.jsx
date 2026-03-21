import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './FundsModal.css';

const PACKAGES = [
  { id: 'starter',    points: 500,  usdPrice: '4.99',  rate: '100 pts / $1',  badge: null },
  { id: 'popular',    points: 1200, usdPrice: '9.99',  rate: '120 pts / $1',  badge: 'Popular' },
  { id: 'pro',        points: 2750, usdPrice: '19.99', rate: '137 pts / $1',  badge: null },
  { id: 'best-value', points: 6000, usdPrice: '39.99', rate: '150 pts / $1',  badge: 'Best Value' },
];

function BillIcon() {
  return (
    <svg width="22" height="13" viewBox="0 0 26 15" fill="none" aria-hidden="true">
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

export default function FundsModal({ open, onClose }) {
  const { purchaseFunds, balance } = useApp();

  const [view, setView] = useState('packages'); // 'packages' | 'payment' | 'success'
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  // Card form state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [formError, setFormError] = useState('');

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setView('packages');
        setSelected(null);
        setCardName(''); setCardNumber(''); setExpiry(''); setCvv('');
        setFormError('');
        setResult(null);
        setProcessing(false);
      }, 300);
    }
  }, [open]);

  function formatCardNumber(val) {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiry(val) {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + ' / ' + digits.slice(2);
    return digits;
  }

  function validate() {
    if (!cardName.trim())                            return 'Cardholder name is required.';
    if (cardNumber.replace(/\s/g, '').length < 13)  return 'Enter a valid card number.';
    if (expiry.replace(/[\s/]/g, '').length < 4)    return 'Enter a valid expiry date.';
    if (cvv.length < 3)                              return 'Enter a valid CVV.';
    return null;
  }

  async function handlePurchase() {
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormError('');
    setProcessing(true);

    try {
      const data = await purchaseFunds(selected.id, {
        cardName,
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiry,
        cvv,
      });
      setResult(data);
      setView('success');
    } catch {
      // error already toasted by context
    } finally {
      setProcessing(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        {/* ── PACKAGES VIEW ── */}
        {view === 'packages' && (
          <>
            <h2 className="modal-title">Add Funds</h2>
            <p className="modal-sub">
              Choose a points package. Points are used to place bets on Phitien markets.
              Your current balance: <strong>{balance.toLocaleString()} pts</strong>
            </p>

            <div className="pkg-grid">
              {PACKAGES.map(pkg => (
                <button
                  key={pkg.id}
                  className={`pkg-card ${selected?.id === pkg.id ? 'pkg-card--selected' : ''}`}
                  onClick={() => setSelected(pkg)}
                >
                  {pkg.badge && <span className="pkg-badge">{pkg.badge}</span>}
                  <div className="pkg-pts">
                    <BillIcon />
                    <span>{pkg.points.toLocaleString()}</span>
                  </div>
                  <div className="pkg-usd">${pkg.usdPrice}</div>
                  <div className="pkg-rate">{pkg.rate}</div>
                </button>
              ))}
            </div>

            <button
              className="modal-primary-btn"
              disabled={!selected}
              onClick={() => setView('payment')}
            >
              Continue to Payment →
            </button>
          </>
        )}

        {/* ── PAYMENT VIEW ── */}
        {view === 'payment' && (
          <>
            <button className="modal-back-btn" onClick={() => setView('packages')}>
              ← Back
            </button>
            <h2 className="modal-title">Card Payment</h2>

            {/* Order summary */}
            <div className="order-summary">
              <span className="order-summary-left">
                {selected?.points.toLocaleString()} pts — Phitien Balance
              </span>
              <span className="order-summary-right">${selected?.usdPrice}</span>
            </div>

            {/* Card form */}
            <div className="form-field">
              <label className="form-label">Cardholder Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Jane Smith"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                autoComplete="cc-name"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Card Number</label>
              <input
                className="form-input"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                autoComplete="cc-number"
                inputMode="numeric"
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Expiry</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="MM / YY"
                  value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))}
                  maxLength={7}
                  autoComplete="cc-exp"
                  inputMode="numeric"
                />
              </div>
              <div className="form-field">
                <label className="form-label">CVV</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="•••"
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  autoComplete="cc-csc"
                  inputMode="numeric"
                />
              </div>
            </div>

            {formError && <p className="form-error">{formError}</p>}

            <button
              className="modal-primary-btn"
              onClick={handlePurchase}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Complete Purchase'}
            </button>

            <p className="form-disclaimer">
              This is a demo — no real charge will be made.
            </p>
          </>
        )}

        {/* ── SUCCESS VIEW ── */}
        {view === 'success' && (
          <div className="success-view">
            <div className="success-check">✓</div>
            <h2 className="success-title">Payment Confirmed</h2>
            <div className="success-pts">+{result?.pointsAdded?.toLocaleString()} pts added</div>
            <p className="success-sub">
              Your new balance is <strong>{result?.newBalance?.toLocaleString()} pts</strong>.
            </p>
            <button className="modal-primary-btn" onClick={onClose}>
              Continue Betting
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

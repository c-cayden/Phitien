import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import CategoryTabs from '../components/CategoryTabs';
import MarketCard from '../components/MarketCard';
import PositionsList from '../components/PositionsList';
import './Home.css';

const SKELETON_COUNT = 6;

export default function Home() {
  const {
    markets,
    activeTab,
    setActiveTab,
    loading,
    generating,
    generateMarkets,
  } = useApp();
  const [topic, setTopic] = useState('');

  async function handleGenerate(event) {
    event.preventDefault();
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) return;

    await generateMarkets(trimmedTopic);
    setTopic('');
  }

  return (
    <div className="home">
      <div className="home-inner">
        <section className="generate-section">
          <form className="generate-form" onSubmit={handleGenerate}>
            <div className="generate-label">AI Market Generator</div>
            <div className="generate-row">
              <input
                className="generate-input"
                type="text"
                placeholder="Try: Fed, March Madness, Bitcoin, AI regulation"
                value={topic}
                onChange={event => setTopic(event.target.value)}
                disabled={generating}
              />
              <button
                className="generate-btn"
                type="submit"
                disabled={generating || !topic.trim()}
              >
                {generating ? 'Generating...' : 'Generate Markets'}
              </button>
            </div>
            <p className="generate-hint">
              Connect your Anthropic API key in the header, then generate fresh markets from current news.
            </p>
          </form>
        </section>

        <CategoryTabs />

        <section className="markets-section">
          {loading ? (
            <div className="markets-grid" aria-live="polite" aria-busy="true">
              {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <div className="skeleton-card" key={index}>
                  <div className="skeleton-line short" />
                  <div className="skeleton-line long" />
                  <div className="skeleton-bar" />
                  <div className="skeleton-line medium" />
                  <div className="skeleton-buttons" />
                </div>
              ))}
            </div>
          ) : markets.length ? (
            <div className="markets-grid">
              {markets.map((market, index) => (
                <MarketCard key={market.id} market={market} index={index} />
              ))}
            </div>
          ) : (
            <div className="markets-empty">
              <div className="markets-empty-title">
                No {activeTab === 'All' ? '' : `${activeTab.toLowerCase()} `}markets found
              </div>
              <p className="markets-empty-sub">
                {activeTab === 'All'
                  ? 'Generate new markets above to populate the board.'
                  : 'Try a different category or switch back to all markets.'}
              </p>
              {activeTab !== 'All' && (
                <button
                  className="markets-empty-link"
                  type="button"
                  onClick={() => setActiveTab('All')}
                >
                  View all markets
                </button>
              )}
            </div>
          )}
        </section>

        <hr className="section-divider" />

        <section className="positions-section">
          <h2 className="section-heading">Open Positions</h2>
          <PositionsList />
        </section>
      </div>
    </div>
  );
}

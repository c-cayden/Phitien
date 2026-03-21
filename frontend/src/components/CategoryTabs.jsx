import React from 'react';
import { useApp } from '../context/AppContext';
import './CategoryTabs.css';

const CATEGORIES = [
  { key: 'All',           label: 'All Markets' },
  { key: 'Finance',       label: 'Finance' },
  { key: 'Crypto',        label: 'Crypto' },
  { key: 'Sports',        label: 'Sports' },
  { key: 'Tech',          label: 'Tech' },
  { key: 'Politics',      label: 'Politics' },
  { key: 'Economy',       label: 'Economy' },
  { key: 'Entertainment', label: 'Entertainment' },
  { key: 'Science',       label: 'Science' },
];

export default function CategoryTabs() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div className="tabs-container">
      <div className="tabs-row">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`tab ${activeTab === cat.key ? 'tab--active' : ''} tab--${cat.key}`}
            onClick={() => setActiveTab(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

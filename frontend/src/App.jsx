import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Home from './pages/Home';
import FundsModal from './components/FundsModal';
import Toast from './components/Toast';

export default function App() {
  const [fundsOpen, setFundsOpen] = useState(false);

  return (
    <AppProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header onAddFunds={() => setFundsOpen(true)} />
        <main style={{ flex: 1 }}>
          <Home />
        </main>
        <FundsModal open={fundsOpen} onClose={() => setFundsOpen(false)} />
        <Toast />
      </div>
    </AppProvider>
  );
}
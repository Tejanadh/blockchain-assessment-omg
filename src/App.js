import React, { useState } from 'react';
import './App.css';

import BlockchainViewer from './components/BlockchainViewer';
import TransactionForm from './components/TransactionForm';
import WalletPanel from './components/WalletPanel';
import StatsPanel from './components/StatsPanel';
import PendingTransactionsPanel from './components/PendingTransactionsPanel';
import Header from './components/Header';

import useBlockchain from './hooks/useBlockchain';
import { mineBlock } from './api/blockchain.api';
import { useWallet } from './context/WalletContext';

function App() {
  const { chain, stats, loading, error, refresh } = useBlockchain();
  const { wallet } = useWallet();
  const [mineError, setMineError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = async () => {
    await refresh();
    setRefreshKey((current) => current + 1);
  };

  const handleMine = async () => {
    setMineError('');
    try {
      const rewardAddress = wallet?.publicKey || 'miner1';
      await mineBlock(rewardAddress);
      await handleRefresh();
    } catch (err) {
      setMineError(err.message || 'Mining failed');
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading Blockchain...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <div className="app-container">
        {(error || mineError) && (
          <div className="error-banner">
            <p>{error || mineError}</p>
          </div>
        )}

        <div className="main-content">
          <div className="left-panel">
            <StatsPanel stats={stats} onMine={handleMine} walletAddress={wallet?.publicKey} />
            <WalletPanel />
            <TransactionForm onTransactionAdded={handleRefresh} />
            <PendingTransactionsPanel refreshKey={refreshKey} />
          </div>

          <div className="right-panel">
            <BlockchainViewer blockchain={chain} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

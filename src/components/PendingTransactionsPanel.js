import React, { useEffect, useState } from 'react';
import './TransactionForm.css';
import { fetchPendingTransactions } from '../api/blockchain.api';
import { truncateAddress } from '../utils/formatters';

const PendingTransactionsPanel = ({ refreshKey }) => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadPending = async () => {
      setLoading(true);
      try {
        const response = await fetchPendingTransactions();
        if (active) {
          setPending(response.pendingTransactions || []);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load pending transactions');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPending();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <div className="transaction-form pending-panel">
      <h2 className="panel-title">Pending Pool</h2>
      <p className="panel-subtitle">Transactions waiting to be mined into the next block.</p>

      {loading && <div className="wallet-note">Loading pending transactions...</div>}
      {error && <div className="form-message error">{error}</div>}

      {!loading && pending.length === 0 && (
        <div className="wallet-note">No pending transactions. Create one to get started.</div>
      )}

      {pending.map((tx, index) => (
        <div key={`${tx.timestamp}-${index}`} className="pending-item">
          <div className="pending-row">
            <span className="tx-label">From</span>
            <span className="tx-address">{truncateAddress(tx.fromAddress || 'Mining Reward')}</span>
          </div>
          <div className="pending-row">
            <span className="tx-label">To</span>
            <span className="tx-address">{truncateAddress(tx.toAddress)}</span>
          </div>
          <div className="pending-row">
            <span className="tx-label">Amount</span>
            <span className="field-value">{tx.amount}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingTransactionsPanel;
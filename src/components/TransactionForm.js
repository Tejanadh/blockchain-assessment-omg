import React, { useState } from 'react';
import './TransactionForm.css';
import { signAndSubmitTransaction } from '../api/blockchain.api';
import { useWallet } from '../context/WalletContext';
import { truncateAddress } from '../utils/formatters';

const TransactionForm = ({ onTransactionAdded }) => {
  const { wallet } = useWallet();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!wallet?.privateKey) {
      setMessage('Create a wallet before sending a transaction');
      setLoading(false);
      return;
    }

    try {
      await signAndSubmitTransaction(wallet.privateKey, toAddress, amount);
      setMessage('Signed transaction added to the pending pool');
      setToAddress('');
      setAmount('');
      onTransactionAdded();
    } catch (err) {
      setMessage(err.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-form">
      <h2 className="panel-title">Create Transaction</h2>

      <form onSubmit={handleSubmit}>
        <p className="panel-subtitle">
          Transactions are signed server-side with your active wallet private key and added to the pending pool.
        </p>

        <div className="form-group">
          <label htmlFor="fromAddress">From Address</label>
          <input
            type="text"
            id="fromAddress"
            name="fromAddress"
            value={wallet?.publicKey ? truncateAddress(wallet.publicKey, 18) : 'Create a wallet first'}
            readOnly
          />
        </div>

        <div className="form-group">
          <label htmlFor="toAddress">To Address</label>
          <input
            type="text"
            id="toAddress"
            name="toAddress"
            value={toAddress}
            onChange={(e) => {
              setToAddress(e.target.value);
              setMessage('');
            }}
            placeholder="Recipient public key"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setMessage('');
            }}
            placeholder="e.g., 100"
            step="0.01"
            min="0"
            required
          />
        </div>

        {message && (
          <div className={`form-message ${message.includes('added') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button type="submit" className="submit-button" disabled={loading || !wallet}>
          {loading ? 'Signing...' : 'Sign & Add Transaction'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
import React, { useState } from 'react';
import './TransactionForm.css';
import { createWallet, fetchBalance } from '../api/blockchain.api';
import { useWallet } from '../context/WalletContext';
import { truncateAddress } from '../utils/formatters';

const WalletPanel = () => {
  const { wallet, balance, setWallet, setBalance, clearWallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const handleCreateWallet = async () => {
    setLoading(true);
    setMessage('');

    try {
      const walletData = await createWallet();
      setWallet(walletData);
      const balanceResponse = await fetchBalance(walletData.publicKey);
      setBalance(balanceResponse.balance);
      setMessage('Wallet created successfully');
    } catch (err) {
      setMessage(err.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshBalance = async () => {
    if (!wallet?.publicKey) return;

    setLoading(true);
    try {
      const balanceResponse = await fetchBalance(wallet.publicKey);
      setBalance(balanceResponse.balance);
      setMessage('Balance refreshed');
    } catch (err) {
      setMessage(err.message || 'Failed to refresh balance');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (value, fieldName) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldName);
      window.setTimeout(() => setCopiedField(''), 1500);
    } catch (error) {
      setMessage('Unable to copy to clipboard');
    }
  };

  return (
    <div className="transaction-form">
      <h2 className="panel-title">Wallet Studio</h2>
      <p className="panel-subtitle">Generate a secp256k1 key pair and use it to sign transactions.</p>

      <div className="wallet-actions">
        <button type="button" className="submit-button" onClick={handleCreateWallet} disabled={loading}>
          {loading ? 'Generating...' : 'Create Wallet'}
        </button>
        {wallet && (
          <>
            <button type="button" className="secondary-button" onClick={handleRefreshBalance} disabled={loading}>
              Refresh Balance
            </button>
            <button type="button" className="secondary-button" onClick={clearWallet}>
              Clear Wallet
            </button>
          </>
        )}
      </div>

      {message && <div className={`form-message ${message.includes('success') || message.includes('refreshed') ? 'success' : 'error'}`}>{message}</div>}

      <div className="wallet-note">Tip: copy your keys before leaving the page. The active wallet is shared with the transaction form.</div>

      {wallet && (
        <div className="form-group">
          <label>Active Wallet</label>
          <div className="value-row">
            <div className="field-value hash">{truncateAddress(wallet.publicKey, 16)}</div>
            <button type="button" className="copy-button" onClick={() => handleCopy(wallet.publicKey, 'publicKey')}>
              {copiedField === 'publicKey' ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <label>Private Key</label>
          <div className="value-row">
            <div className="field-value hash">••••••••••••••••</div>
            <button type="button" className="copy-button" onClick={() => handleCopy(wallet.privateKey, 'privateKey')}>
              {copiedField === 'privateKey' ? 'Copied!' : 'Copy PEM'}
            </button>
          </div>

          <label>Balance</label>
          <div className="value-row">
            <div className="field-value">{balance}</div>
            <button type="button" className="copy-button" onClick={() => handleCopy(String(balance), 'balance')} disabled={balance === null}>
              {copiedField === 'balance' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPanel;
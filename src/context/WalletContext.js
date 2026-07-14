import React, { createContext, useContext, useMemo, useState } from 'react';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);

  const value = useMemo(
    () => ({
      wallet,
      balance,
      setWallet,
      setBalance,
      clearWallet: () => {
        setWallet(null);
        setBalance(null);
      },
    }),
    [wallet, balance]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
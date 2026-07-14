const crypto = require('crypto');
const { Transaction } = require('../models/blockchain');

/**
 * Derive the hex-encoded public key from a PEM private key.
 *
 * @param {string} privateKeyPem - PKCS#8 PEM private key.
 * @returns {string} Hex-encoded DER public key.
 */
const getPublicKeyFromPrivateKey = (privateKeyPem) => {
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const publicKey = crypto.createPublicKey(privateKey);
  return publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
};

/**
 * Build and cryptographically sign a blockchain transaction.
 *
 * @param {object} params
 * @param {string} params.privateKeyPem - Sender private key in PEM format.
 * @param {string} params.toAddress - Recipient public key.
 * @param {number} params.amount - Transfer amount.
 * @returns {Transaction} Signed transaction ready for the pending pool.
 */
const signTransaction = ({ privateKeyPem, toAddress, amount }) => {
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const transaction = new Transaction(null, toAddress, amount);
  transaction.signTransaction(privateKey);
  return transaction;
};

module.exports = {
  getPublicKeyFromPrivateKey,
  signTransaction,
};
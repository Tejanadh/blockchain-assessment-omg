const crypto = require('crypto');
const { sendSuccess, sendError, sendCreated } = require('../utils/response');
const { isValidAddress, sanitizeAddress, isValidAmount, sanitizeAmount } = require('../utils/validator');
const { blockchain } = require('../models');
const signingService = require('../services/signing.service');
const persistenceService = require('../services/persistence.service');

const generateWallet = (req, res) => {
  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256k1',
    });

    const publicKeyHex = publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
    const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });

    sendSuccess(res, {
      publicKey: publicKeyHex,
      privateKey: privateKeyPem,
      balance: blockchain.getBalanceOfAddress(publicKeyHex),
    });
  } catch (error) {
    sendError(res, error.message || 'Failed to create wallet', 500);
  }
};

const getWalletBalance = (req, res) => {
  const address = sanitizeAddress(req.params.address);

  if (!isValidAddress(address)) {
    return sendError(res, 'Invalid wallet address', 400);
  }

  sendSuccess(res, { address, balance: blockchain.getBalanceOfAddress(address) });
};

const signAndSubmitTransaction = async (req, res, next) => {
  try {
    const { privateKey, toAddress, amount } = req.body;

    if (!privateKey || typeof privateKey !== 'string') {
      return sendError(res, 'Private key is required', 400);
    }

    if (!isValidAddress(toAddress)) {
      return sendError(res, 'Invalid recipient address', 400);
    }

    if (!isValidAmount(amount)) {
      return sendError(res, 'Amount must be a positive number', 400);
    }

    const transaction = signingService.signTransaction({
      privateKeyPem: privateKey,
      toAddress: sanitizeAddress(toAddress),
      amount: sanitizeAmount(amount),
    });

    blockchain.addTransaction(transaction);
    await persistenceService.save(blockchain);

    sendCreated(res, {
      message: 'Signed transaction added to pending pool',
      transaction,
      fromAddress: transaction.fromAddress,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateWallet, getWalletBalance, signAndSubmitTransaction };

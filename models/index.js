const crypto = require('crypto');
const config = require('../config');
const logger = require('../utils/logger');
const persistenceService = require('../services/persistence.service');
const { Blockchain, Block, Transaction } = require('./blockchain');

let blockchain = new Blockchain(
  config.blockchain.difficulty,
  config.blockchain.miningReward
);

const seedDemoData = () => {
  if (!config.demoData.enabled) {
    return;
  }

  try {
    // Demo transfers need funded, signed wallets — not bare string addresses.
    // 1) Mine a reward to the sender, 2) sign a transfer, 3) mine it in.
    const sender = crypto.generateKeyPairSync('ec', { namedCurve: 'secp256k1' });
    const recipient = crypto.generateKeyPairSync('ec', { namedCurve: 'secp256k1' });
    const senderAddress = sender.publicKey
      .export({ type: 'spki', format: 'der' })
      .toString('hex');
    const recipientAddress = recipient.publicKey
      .export({ type: 'spki', format: 'der' })
      .toString('hex');

    blockchain.minePendingTransactions(senderAddress);

    const transferAmount = Math.min(
      50,
      Math.floor(blockchain.miningReward / 2) || 1
    );
    const demoTx = new Transaction(senderAddress, recipientAddress, transferAmount);
    demoTx.signTransaction(sender.privateKey);
    blockchain.addTransaction(demoTx);
    blockchain.minePendingTransactions(config.blockchain.initialMinerAddress);

    logger.info('Seeded demo blockchain data');
  } catch (error) {
    logger.error(`Failed to seed demo data: ${error.message}`);
  }
};

const initializeBlockchain = async () => {
  const restored = await persistenceService.load();

  if (restored) {
    blockchain = restored;
    logger.info('Loaded persisted blockchain state');
    return;
  }

  seedDemoData();
  await persistenceService.save(blockchain);
};

initializeBlockchain();

module.exports = {
  get blockchain() {
    return blockchain;
  },
  Blockchain,
  Block,
  Transaction,
};

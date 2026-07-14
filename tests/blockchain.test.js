const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

const { Blockchain, Transaction } = require('../models/blockchain');
const persistenceService = require('../services/persistence.service');
const signingService = require('../services/signing.service');

const originalStatePath = process.env.BLOCKCHAIN_STATE_PATH;

const createSignedTransaction = (fromKeyPair, toAddress, amount) => {
  const privateKeyPem = fromKeyPair.privateKey.export({ type: 'pkcs8', format: 'pem' });
  return signingService.signTransaction({
    privateKeyPem,
    toAddress,
    amount,
  });
};

const createKeyPair = () => crypto.generateKeyPairSync('ec', { namedCurve: 'secp256k1' });

test.beforeEach(async () => {
  process.env.BLOCKCHAIN_STATE_PATH = `${process.cwd()}/tests/.tmp-blockchain.json`;
  await persistenceService.clear();
});

test.afterEach(async () => {
  if (originalStatePath === undefined) {
    delete process.env.BLOCKCHAIN_STATE_PATH;
  } else {
    process.env.BLOCKCHAIN_STATE_PATH = originalStatePath;
  }
  await persistenceService.clear();
});

test('rejects unsigned transactions', () => {
  const chain = new Blockchain(1, 10);
  const tx = new Transaction('wallet-a', 'wallet-b', 25);

  assert.throws(() => chain.addTransaction(tx), /signature/i);
});

test('rejects transfers that exceed available balance', () => {
  const chain = new Blockchain(1, 10);
  const sender = createKeyPair();
  const recipient = createKeyPair();
  const senderAddress = signingService.getPublicKeyFromPrivateKey(
    sender.privateKey.export({ type: 'pkcs8', format: 'pem' })
  );
  const recipientAddress = signingService.getPublicKeyFromPrivateKey(
    recipient.privateKey.export({ type: 'pkcs8', format: 'pem' })
  );

  chain.minePendingTransactions(senderAddress);
  const tx = createSignedTransaction(sender, recipientAddress, 500);

  assert.throws(() => chain.addTransaction(tx), /insufficient balance/i);
});

test('validates proof-of-work when checking the chain', () => {
  const chain = new Blockchain(2, 10);
  const miner = createKeyPair();
  const minerAddress = signingService.getPublicKeyFromPrivateKey(
    miner.privateKey.export({ type: 'pkcs8', format: 'pem' })
  );

  chain.minePendingTransactions(minerAddress);
  assert.equal(chain.isChainValid(), true);

  chain.chain[1].hash = 'tampered-hash';
  assert.equal(chain.isChainValid(), false);
});

test('persists and restores blockchain state', async () => {
  const chain = new Blockchain(1, 10);
  const sender = createKeyPair();
  const recipient = createKeyPair();
  const senderAddress = signingService.getPublicKeyFromPrivateKey(
    sender.privateKey.export({ type: 'pkcs8', format: 'pem' })
  );
  const recipientAddress = signingService.getPublicKeyFromPrivateKey(
    recipient.privateKey.export({ type: 'pkcs8', format: 'pem' })
  );

  chain.minePendingTransactions(senderAddress);
  const tx = createSignedTransaction(sender, recipientAddress, 5);
  chain.addTransaction(tx);

  await persistenceService.save(chain);
  const restored = await persistenceService.load();

  assert.ok(restored);
  assert.equal(restored.chain.length, 2);
  assert.equal(restored.pendingTransactions.length, 1);
  assert.equal(restored.pendingTransactions[0].amount, 5);
  assert.equal(restored.isChainValid(), true);
});
# Blockchain Explorer and Smart Contract Assessment

Full-stack assessment submission covering a simplified proof-of-work blockchain, wallet signing flow, React explorer UI, and an ERC-20-style Solidity token with Hardhat tooling.

## Highlights

- Layered Express backend (`routes → controllers → models/services`)
- Proof-of-work mining with SHA-256 block hashing and chain validation
- ECDSA transaction signing using secp256k1 key pairs
- Balance checks for confirmed and pending outgoing transfers
- JSON persistence with validation on restore
- React dashboard with wallet studio, signed transaction flow, and pending pool
- Extended `AssessmentToken` contract with mint, burn, and ownership controls
- Hardhat compile/test/deploy workflow

## Architecture

```text
Client (React)  :3000
  └─ src/api/blockchain.api.js  (+ setupProxy → API)
       └─ Express API (/api)  :3002
            ├─ routes → controllers
            ├─ models/blockchain.js      (Block, Transaction, Blockchain)
            ├─ services/signing.service.js
            └─ services/persistence.service.js  → blockchain.json
```

### Blockchain primitives

| Concept | Implementation |
|---|---|
| Block hash | SHA-256 over `previousHash + timestamp + transactions + nonce` |
| Proof of work | Increment `nonce` until the hash has `difficulty` leading zeros |
| Transactions | ECDSA (secp256k1) signatures; mining rewards use `fromAddress = null` |
| Balances | Account-based: sum inflows − outflows across confirmed blocks only |
| Pending pool | Valid txs wait until the next `POST /api/mine` |
| Persistence | JSON file (`BLOCKCHAIN_STATE_PATH`) with restore + re-validation |

### Transaction flow

1. **Create wallet**  `POST /api/wallets` returns a secp256k1 key pair (public key hex = address).
2. **Fund via mining**  `POST /api/mine` with `miningRewardAddress` packs a coinbase reward (`fromAddress = null`) into the new block; the miner’s balance increases once that block is on chain.
3. **Sign & submit**  UI/API signs `{from, to, amount, timestamp}` with the private key (`POST /api/wallets/sign`). The chain rejects missing/invalid signatures and spends that exceed confirmed balance (including other pending outs).
4. **Pending pool**  Accepted txs sit in memory (+ are persisted) until mined.
5. **Mine again**  Pending transfers plus a new coinbase reward are hashed under PoW; the chain grows and balances update.

### Proof of work

- Hash input: `previousHash + timestamp + JSON(transactions) + nonce`.
- Target: hash must start with `difficulty` zeros (default `2` via `BLOCKCHAIN_DIFFICULTY`).
- `isChainValid()` rechecks hashes, previous-hash links, signatures, and PoW on every non-genesis block.

### Persistence

- After successful mine / signed submit, state is written to `blockchain.json` (or `BLOCKCHAIN_STATE_PATH`).
- On boot, the file is loaded and rehydrated into `Block` / `Transaction` instances; invalid files fall back to a fresh chain (+ optional demo seed).
- Demo seed (`SEED_DEMO_DATA=true`) mines a funded wallet first, then a signed transfer — it does not invent unfunded addresses.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
cp .env.example .env
```

### Development

```bash
# Terminal 1 — React dev server (port 3000)
npm start

# Terminal 2 — API server (port 3002)
npm run dev
```

Open `http://localhost:3000`.

### Production

```bash
npm run serve
```

## API Overview

All responses use:

```json
{ "success": true, "message": "...", ... }
```

| Method | Path | Description |
|---|---|---|
| GET | `/api/chain` | Return the full blockchain |
| GET | `/api/chain/valid` | Validate chain integrity and proof-of-work |
| POST | `/api/transactions` | Add a pre-signed transaction |
| GET | `/api/transactions/pending` | View pending transactions |
| POST | `/api/mine` | Mine pending transactions into a new block |
| GET | `/api/balance/:address` | Get address balance |
| GET | `/api/stats` | Chain and mining statistics |
| POST | `/api/wallets` | Generate a wallet key pair |
| POST | `/api/wallets/sign` | Sign and submit a transaction |
| GET | `/api/wallets/:address` | Wallet balance lookup |

## Wallet and Transaction Flow

1. Create a wallet in the UI (`POST /api/wallets`).
2. Mine a block so the wallet receives the mining reward.
3. Send a signed transaction via the transaction form (`POST /api/wallets/sign`).
4. Inspect the pending pool, then mine again to confirm transfers.

## Smart Contract

`contracts/AssessmentToken.sol` is an ERC-20-style token with:

- `transfer`, `approve`, `transferFrom`
- owner-only `mint`
- holder `burn`
- `transferOwnership`

### Hardhat commands

```bash
npm run compile
npm run test:contracts
npx hardhat run scripts/deploy-contract.js
```

## Testing

```bash
npm run test          # Node blockchain regression suite
npm run test:contracts
npm run test:all
```

## Known Limitations

- Educational blockchain only; no networking, mempool sync, or UTXO model
- Private keys are handled in-browser/server for demo convenience, not HSM-grade security
- Contract is unaudited and simplified for assessment discussion
- Demo seed data is optional and can be disabled with `SEED_DEMO_DATA=false`

## License

One More Game

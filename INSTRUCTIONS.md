# Assessment Submission Notes

This document records how the assessment requirements were addressed in this submission.

## Tracks Covered

### Blockchain Engineer

- Documented block hashing, proof-of-work, and validation in `README.md`
- Rejected unsigned and invalid signatures with explicit error messages
- Added balance validation against confirmed and pending outgoing transfers
- Added proof-of-work checks during `isChainValid()`
- Fixed persistence restore bug (`Block` import) and verified restart behavior in tests

### Smart Contract Engineer

- Reviewed and extended `contracts/AssessmentToken.sol` with:
  - owner-controlled `mint`
  - holder `burn`
  - `transferOwnership`
  - internal `_transfer` helper and zero-address guards
- Added Hardhat config, compile script, deployment script, and contract tests

### Web3 Full Stack Engineer

- Connected React UI to Express API through `src/api/blockchain.api.js`
- Implemented realistic wallet flow with shared `WalletContext`
- Added signed transaction submission via `POST /api/wallets/sign`
- Added pending transaction panel, mining reward targeting, and improved feedback states

## Key Files Added or Updated

| Area | Files |
|---|---|
| Blockchain core | `models/blockchain.js`, `services/persistence.service.js` |
| Signing | `services/signing.service.js`, `controllers/wallet.controller.js` |
| Frontend | `src/context/WalletContext.js`, `src/components/PendingTransactionsPanel.js` |
| Contracts | `contracts/AssessmentToken.sol`, `hardhat.config.js`, `tests/contracts/AssessmentToken.test.js` |
| Docs/tests | `README.md`, `.env.example`, `tests/blockchain.test.js` |

## Suggested Interview Talking Points

1. Why pending and confirmed balances are validated separately
2. How ECDSA signing binds `fromAddress` to the transaction payload
3. Trade-offs of JSON persistence versus a database or LevelDB approach
4. How the Solidity contract differs from a full OpenZeppelin ERC-20 implementation

## Run Instructions

```bash
npm install
cp .env.example .env
npm start   # terminal 1
npm run dev # terminal 2
npm run test:all
```
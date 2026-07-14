const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Addresses are secp256k1 public keys exported as SPKI DER hex
 * (Node crypto `publicKey.export({ type: 'spki', format: 'der' })`).
 * That encoding is always 88 bytes → 176 hex characters.
 */
const SPKI_SECP256K1_HEX_LENGTH = 176;
const ADDRESS_HEX_PATTERN = new RegExp(`^[0-9a-f]{${SPKI_SECP256K1_HEX_LENGTH}}$`);

const isValidAddress = (address) => {
  if (!isNonEmptyString(address)) return false;
  return ADDRESS_HEX_PATTERN.test(String(address).trim().toLowerCase());
};

const isValidAmount = (amount) => {
  const parsed = parseFloat(amount);
  return !Number.isNaN(parsed) && Number.isFinite(parsed) && parsed > 0;
};

const sanitizeAddress = (address) => String(address).trim().toLowerCase();

const sanitizeAmount = (amount) => parseFloat(amount);

module.exports = {
  isNonEmptyString,
  isValidAddress,
  isValidAmount,
  sanitizeAddress,
  sanitizeAmount,
  SPKI_SECP256K1_HEX_LENGTH,
};

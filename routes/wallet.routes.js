const { Router } = require('express');
const { generateWallet, getWalletBalance, signAndSubmitTransaction } = require('../controllers/wallet.controller');
const { validateBody } = require('../middleware/validateRequest.middleware');

const router = Router();

router.post('/', validateBody([]), generateWallet);
router.post('/sign', validateBody(['privateKey', 'toAddress', 'amount']), signAndSubmitTransaction);
router.get('/:address', getWalletBalance);

module.exports = router;

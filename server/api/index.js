const router = require('express').Router();

const users = require('./users/routes');
const payment_method = require('./payment_method/routes')
const fridge = require('./fridge/routes')
const product = require('./product/routes')
const fridge_x_product = require('./fridge_x_product/routes')
const transactions = require('./transactions/routes')
const mercadopago = require('./mercadopago/routes')
const transactions_x_product = require('./transaction_x_product/routes')
const transactions_nextonia = require('./transactions_nextonia/routes')
const mercadopago_pse = require('./mercadopago_pse/routes')
const movements_bambbu = require('./movements_bambbu/routes')
const movements_payments = require('./movements_payments/routes')
const help_center = require('./help_center/routes')
const review = require('./review/routes')
const status_token = require('./status_token/routes')

router.use('/users', users);
router.use('/pay-meth', payment_method)
router.use('/fridge', fridge)
router.use('/product', product)
router.use('/fxp', fridge_x_product)
router.use('/transactions', transactions)
router.use('/mercadopago', mercadopago)
router.use('/t_x_p', transactions_x_product)
router.use('/nex_tran', transactions_nextonia)
router.use('/mercadopago_pse',mercadopago_pse )
router.use('/movements', movements_bambbu)
router.use('/movements_payments', movements_payments)
router.use('/help_center', help_center)
router.use('/review',review)
router.use('/status_token', status_token)

module.exports = router;

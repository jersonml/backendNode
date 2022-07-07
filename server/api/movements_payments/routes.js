const router = require('express').Router({
    mergeParams: true,
  });
const controller = require('./controller');
const { auth, isUserAdmin,verify_and_token_bambu,verify_register_bambbu } = require('../auth');


router.route('/payment_wallet').post(auth, verify_and_token_bambu, verify_register_bambbu,  controller.payment_wallet);
router.route('/get_movements_payment/:user_id').get(auth, verify_and_token_bambu, verify_register_bambbu, controller.get_movements_payment);
router.route('/card_payment_pending').post(auth, controller.card_payment_pending)

module.exports = router;

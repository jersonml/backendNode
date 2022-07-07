const router = require('express').Router({
    mergeParams: true,
  });
  const controller = require('./controller');
  const { auth,verify_and_token_bambu,verify_register_bambbu } = require('../auth');
  
  router.route('/recharge_pse').post(auth,verify_and_token_bambu, verify_register_bambbu, controller.make_mercadopago_pse);
  //router.route('/get_transactions_pse/:user_id').get(auth, verify_and_token_bambu, verify_register_bambbu, controller.consult_transaction);
  router.route('/confirm_pse/:user_id').get(verify_and_token_bambu, verify_register_bambbu, controller.confirm_pse);
  router.route('/cancel_pse/:transaction_id').delete(auth, verify_and_token_bambu, verify_register_bambbu, controller.cancel_pse)
  module.exports = router;
  
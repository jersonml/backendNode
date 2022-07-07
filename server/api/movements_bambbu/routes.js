const router = require('express').Router({
    mergeParams: true,
  });
  const controller = require('./controller');
  const { auth, isUserAdmin,verify_and_token_bambu,verify_register_bambbu } = require('../auth');
  
  router.route('/recharge_card').post(auth,verify_and_token_bambu, verify_register_bambbu, controller.Payment_Card);
  router.route('/get_money/:user_id').get(auth, verify_and_token_bambu, verify_register_bambbu, controller.get_money);
  router.route('/get_movements/:user_id').get(auth, verify_and_token_bambu, verify_register_bambbu, controller.get_movements);
  module.exports = router;
  
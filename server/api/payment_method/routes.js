const router = require('express').Router({
  mergeParams: true,
});
const controller = require('./controller');
const { auth, isUserAdmin } = require('../auth');


router.route('/create_pay_m').post(controller.create_payment_method);
router.route('/get_payment_method/:user_id').get(auth, controller.get_payment_method);
router.route('/get_payment_method_all/:user_id').get(auth, controller.get_payment_method_all);
router.route('/change_card_default/:payment_id').put(controller.change_card_default);

module.exports = router;

const router = require('express').Router({
  mergeParams: true,
});
const controller = require('./controller');
const { auth, isUserAdmin } = require('../auth');

router.route('/create').post(auth, isUserAdmin, controller.create);
router.route('/get_p_x_f/:fridge_id').get(auth, isUserAdmin, controller.getfridge_x_product);
router.route('/get_p_x_f').get(auth, isUserAdmin, controller.getfridge_x_products)
router.route('/delete_p_x_f').post(auth, isUserAdmin, controller.delete)

module.exports = router;

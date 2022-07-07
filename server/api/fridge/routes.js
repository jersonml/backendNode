const router = require('express').Router({
  mergeParams: true,
});
const controller = require('./controller');
const { auth, isUserAdmin } = require('../auth');



router.route('/create').post(auth, isUserAdmin, controller.create);
router.route('/getfridges').get(auth, isUserAdmin, controller.getfridges);

module.exports = router;

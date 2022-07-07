const router = require('express').Router({
  mergeParams: true,
});
const controller = require('./controller');
const { auth, isUserAdmin } = require('../auth');


router.route('/add').post(auth, isUserAdmin, controller.add);




module.exports = router;

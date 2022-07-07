const router = require('express').Router({
  mergeParams: true,
});
const controller = require('./controller');
const { auth, isUserAdmin } = require('../auth');


router.route('/get_nex_tra').get(auth, isUserAdmin, controller.get_transactions);




module.exports = router;

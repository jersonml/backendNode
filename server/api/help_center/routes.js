const router = require('express').Router({
    mergeParams: true,
  });
const controller = require('./controller');
const { auth, isGetUserAdmin, } = require('../auth');


router.route('/link_ws').get(auth, controller.Get_link);
router.route('/update_phone/:phone').put(auth,isGetUserAdmin, controller.Put_phone);
router.route('/get_help').get(auth, controller.Get_help);
router.route('/post_help').post(auth, isGetUserAdmin, controller.Post_help);
router.route('/put_help/:id').put(auth, isGetUserAdmin, controller.Put_help);
router.route('/delete_help/:id').delete(auth, isGetUserAdmin, controller.Delete_help)

module.exports = router;
const router = require('express').Router({
    mergeParams: true,
  });
  const controller = require('./controller');
  const { auth, isUserAdmin } = require('../auth');

  router.route('/clearToken').get(auth, controller.clearToken)
  
  module.exports = router;
  
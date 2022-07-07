const router = require('express').Router({
    mergeParams: true,
  });
  const controller = require('./controller');
  const { auth, isUserAdmin } = require('../auth');
  const multer = require('multer');
  const inMemoryStorage = multer.memoryStorage();
  const uploadStrategy = multer({ storage: inMemoryStorage }).single('image');
  
  router.route('/create').post(uploadStrategy, auth, controller.postReview);
  router.route('/listUser/:user_id').get(auth, controller.listReview);
  router.route('/listAllUsers').get(auth, isUserAdmin, controller.listAllReview)
  router.route('/putReviews/:id').put(uploadStrategy, auth, controller.putReviews)
  
  
  module.exports = router;
  
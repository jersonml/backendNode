const router = require('express').Router({
  mergeParams: true,
});
const controller = require('./controller');
const { auth, isUserAdmin } = require('../auth');
const multer = require('multer');
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('image');

router.route('/create').post(auth, isUserAdmin, controller.create);
router.route('/getproducts').get(auth, isUserAdmin, controller.getproducts)
router.route('/getproducts/<product_id>').get(auth, isUserAdmin, controller.getOneProduct)
router.route('/putproducts/:id').put(uploadStrategy, auth, controller.putProduct)
router.route('/postproduct').post(uploadStrategy, auth, controller.postProduct)
router.route('/deleteproducts/:id').delete(auth, controller.deleteProduct)
router.route('/deleteproductstatus/:id').delete(auth, controller.deleteProductStatus)


module.exports = router;

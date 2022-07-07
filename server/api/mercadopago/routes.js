const router = require('express').Router({
  mergeParams: true,
});
const controller = require('./controller');
const { auth, isUserAdmin } = require('../auth');
const controllertest = require('./controller_test')


router.route('/agregarCardToken').post(auth, controller.addCardTokenToUser);
router.route('/realizarPago').post(auth, isUserAdmin, controller.realizarPago);
router.route('/testagregarCardToken').post(auth, controllertest.addCardTokenToUser);
router.route('/deleteCard/:card_id').delete(auth, controller.deleteCard);
router.route('/agregarCard').post(auth, controller.addCard);
router.route('/deleteCardGeneral/:card_id').delete(auth, controller.deleteCardGeneric);
router.route('/testaddCard').post(auth, controllertest.addCardsMultiples)
router.route('/createToken').post(auth, controller.createToken);
router.route('/verify_hash/:id').post(auth, controller.verify_hash)
router.route('/deleteCardGenericNew/:card_id/:user_id').delete(auth, controller.deleteCardGenericNew);
// router.route('/pagosRealizados').get(controller.pagosRealizados);
//$2y$12$IHAQEatVj2sQm/ozz9zjsuFVtP9eUTFkWJARsbPRnaLxobIzmwAOm 
module.exports = router;

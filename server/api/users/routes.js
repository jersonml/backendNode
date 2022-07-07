const router = require('express').Router({
  mergeParams: true,
});

const controller = require('./controller');
const { auth, isUserAdmin,verify_and_token_bambu,verify_register_bambbu } = require('../auth');

/*
* /api/users/ POST - CREATE
* /api/users/ GET - READ ALL
* /api/users/:id GET - READ ONE
* /api/users/:id PUT - UPDATE
* /api/users/signin POST - SIGN IN IF USER IS ADMIN (ONLY FRONTEND)
* /api/users/get-authorization POST - SIGN IN IF USER IS NOT ADMIN (ONLY EXTERNAL APPS)
*/

router.get('/', auth, controller.listUsers)
router.route('/signin').post(controller.create);
router.route('/signin2').post(controller.create_);
router.route('/login').post(controller.login);
router.route('/loginw').post(controller.login_web);
router.route('/block/:user_id').post(auth, controller.inactive)
router.route('/active/:user_id').put(auth, controller.active)
router.route('/verify').post(controller.verify_email)
router.route('/change_pass').post(controller.change_passw)
router.route('/verify_pass').post(controller.verify_password)
router.route('/resend_pass').post(controller.resend_pass)
router.route('/resend_code').post(controller.resend_code)
router.route('/accept_conditions/:user_id').put(auth, controller.accept_conditions);
router.route('/method_payment/:user_id').get(auth,verify_and_token_bambu,verify_register_bambbu, controller.method_payment);
router.route('/update_method_payment/:user_id').put(auth,verify_and_token_bambu,verify_register_bambbu, controller.update_method_payment);
router.route('/signin_oauth').post(controller.create_oauth);
router.route('/signin_new').post(controller.create_new);
router.route('/login_new').post(controller.login_new);
router.route('/verify_phone/:id').put(controller.verify_code_sms);
router.route('/send_code_sms/:id').post(controller.send_code_sms);
router.route('/update_phone/:id').put(auth, controller.update_phone);
router.route('/consult_user').get(controller.consult_user);
router.route('/change_identification/:id').put(auth, controller.change_identification)
router.route('/getUserDispenser').get(auth, controller.getUserDispenser)
router.route('/postDispenser').post(auth, controller.postDispenser)
module.exports = router;

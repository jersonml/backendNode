const router = require('express').Router({
  mergeParams: true,
});
const path = require('path')

const controller = require('./controller');
const multer = require('multer');
const { auth, isUserAdmin,verify_and_token_bambu,verify_register_bambbu } = require('../auth');

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    console.log("estoy haciendo esto")
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: function (req, file, cb) {
    console.log("estoy haciendo esto")
    cb(null, file.fieldname + '-' + Date.now() + '.mp4')
  }
})
const upload = multer({ storage: storage })

/*
* /api/transactions/ POST - CREATE
* /api/transactions/ GET - READ ALL
* /api/transactions/:id GET - READ ONE
*/

router.route('/upload-video').post(upload.single('file'), controller.create_video)
router.route('/get_p_transactions').get(auth, controller.unpaid_transactions)
router.route('/get_transactions/:transaction_state').get(auth, controller.transactions)
router.route('/charge').put(auth, isUserAdmin, controller.charge)
router.route('/get_pending_transactions').get(auth, controller.pending_transactions)
router.route('/:user_id').get(auth, controller.get_user_transaction)
router.route('/history/:user_id').get(auth, controller.get_transactions_history)
router.route('/pay').post(auth,verify_and_token_bambu,verify_register_bambbu, controller.charge_nextonia)
router.route('/test_pay').post(controller.test_charge_nextonia)


module.exports = router;

const express = require('express')
const router = express.Router()

const auth = require('../meddlewares/authentication')

const {
    register,
    sendCode,
    login,
    refresh,
    logout,
    resetPassword,
    forgotPassword
} = require('../controllers/auth')

router.route('/send-code').post(sendCode)
router.route('/register').post(register)
router.route('/login').post(login)
router.route('/logout').post(auth,logout)
router.route('/refresh').post(refresh)
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password/:token').post(resetPassword)

module.exports = router
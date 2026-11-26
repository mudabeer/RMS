const express = require('express')
const router = express.Router()

const auth = require('../meddlewares/authentication')
const { loginLimiter, sendCodeLimiter } = require('../meddlewares/rateLimiter')

const {
    register,
    sendCode,
    login,
    refresh,
    logout,
    getProfile,
    resetPassword,
    forgotPassword
} = require('../controllers/auth')

router.route('/send-code').post(sendCodeLimiter, sendCode)
router.route('/register').post(register)
router.route('/login').post(loginLimiter, login)
router.route('/logout').post(auth,logout)
router.route('/profile').get(auth,getProfile)
router.route('/refresh').post(refresh)
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password/:token').post(resetPassword)

module.exports = router

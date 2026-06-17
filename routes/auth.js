const express = require('express')
const router = express.Router()

const {
    register,
    sendCode,
    login,
    refresh
} = require('../controllers/auth')

router.route('/send-code').post(sendCode)
router.route('/register').post(register)
router.route('/login').post(login)
router.route('/refresh').post(refresh)

module.exports = router
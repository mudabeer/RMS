const rateLimit = require('express-rate-limit');

const createLimiter = (max, message) =>
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, msg: message },
    });

const loginLimiter = createLimiter(10, 'Too many login attempts. Please try again later.');
const sendCodeLimiter = createLimiter(5, 'Too many OTP requests. Please try again later.');
const genVcoLimiter = createLimiter(10, 'Too many verification code requests. Please try again later.');

module.exports = {
    loginLimiter,
    sendCodeLimiter,
    genVcoLimiter,
};


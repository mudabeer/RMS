const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const otpSchema = mongoose.Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: [true,'the email already exist'],
        required: [true, 'Email address is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    otp: {
        type: String,
        required: true,
    },
    attempts: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0,
    }
})

module.exports = mongoose.model('Otp',otpSchema)
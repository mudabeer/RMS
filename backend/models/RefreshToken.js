const mongoose = require('mongoose')

const RefreshTokenSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tokenHash: {
        type: String,
        required: [true,'token must be provided']
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0,
    }
})

module.exports = mongoose.model("RefreshToken",RefreshTokenSchema)
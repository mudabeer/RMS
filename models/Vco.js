const mongoose = require('mongoose')

const vcoSchema = mongoose.Schema({
    roomId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true,'please provide room id']
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    attempts:{
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        default: Date.now() + 30 * 60 * 1000,
        expires: 0
    }
})

module.exports = mongoose.model('Vco',vcoSchema)
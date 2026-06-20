    const mongoose = require('mongoose')

const roomSchema = mongoose.Schema({
    name: {
        type: String,
        default: 'Room1'
    },
    roomCode: {
        type: String,
        required: true,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'creator account required']
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'user is must be provided']
        },
        role: {
            type: String,
            enum: {
                values: ['creator','admin','member'],
                _message: 'invalid role'
            },
            default: 'member'
        }
    }
    ]
},{timestamps: true})

module.exports = mongoose.model('Room',roomSchema)
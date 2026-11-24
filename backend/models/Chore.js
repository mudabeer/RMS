const mongoose = require('mongoose')

const choreSchema = mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    title: {
        type: String,
        required: [true, 'please provide a chore title'],
        trim: true,
        maxlength: [120, 'chore title must be at most 120 characters']
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    dueDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true })

choreSchema.index({ roomId: 1, dueDate: 1 })

module.exports = mongoose.model('Chore', choreSchema)

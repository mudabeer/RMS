const mongoose = require('mongoose')

const transactionSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'please provide description']
    },
    amount: {
        type: Number,
        required: [true,'please provide amount']
    },
    category: {
        type: String,
        default: 'unknown'
    },
    roomId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    shareAmount:{
        type: Number,
        required: true
    },
    paidBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    splitAmong:{
        type:[{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        debtAmount:{
            type: Number,
            required: true
        },
        paidAmount:{
            type:Number,
            default: 0,    
            validate: {
                validator: function (value) {
                    return value >= 0 && value <= this.debtAmount;
                },
            message: 'Paid amount must be between 0 and debt amount'
            }
        },
        status:{
            type: String,
            enum:{
                values: ['Pending','Paid','Partial'],
                _message: 'invalid status'
            },
            default: 'Pending'
        }
    }
    ],
    required: [true, 'please provide members'],
    validate: {
        validator: arr => arr.length > 0,
        message: 'At least one member is required'
    }
    }
},
{timestamps:true})

module.exports = mongoose.model('transaction',transactionSchema)
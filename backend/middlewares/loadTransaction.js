const Transaction = require('../models/Transaction')

const {NotFoundError} = require('../errors/index')

const loadTransaction = async (req,res,next) => {
    const transaction = await Transaction.findOne({_id:req.params.transactionId,roomId:req.params.roomId})

    if(!transaction){
        throw new NotFoundError('transaction not found')
    }

    req.transaction = transaction

    next()
}

module.exports = loadTransaction
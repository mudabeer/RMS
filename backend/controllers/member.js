const Room = require('../models/Room')
const User = require('../models/User')
const Transaction = require('../models/Transaction')
const {StatusCodes} = require('http-status-codes')

const {
    NotFoundError,
    BadRequestError
} = require('../errors/index')

const updateMember = async (req,res) => {
    const {role} = req.body

    if(!role){
        throw new BadRequestError('please provide role')
    }

    if(role === 'creator' || req.room.creator.toString() === req.params.memberId){
        throw new BadRequestError('invalid request can not edit or update cerator')
    }

    req.targetMember.role = role

    await req.room.save()

    res.status(StatusCodes.OK).json({
        success: true,    
        'msg':'member updated'
    })
}

const deleteMember = async (req,res) => {
    const { roomId, memberId } = req.params

    if(req.room.creator.toString() === memberId){
        throw new BadRequestError('can not delete creator from room')
    }

    const blockingTransaction = await Transaction.findOne({
        roomId,
        $or: [
            {
                paidBy: memberId,
                splitAmong: { $elemMatch: { status: { $in: ['Pending', 'Partial'] } } }
            },
            {
                splitAmong: { $elemMatch: { userId: memberId, status: { $in: ['Pending', 'Partial'] } } }
            }
        ]
    })

    if(blockingTransaction){
        throw new BadRequestError('cannot remove member with outstanding debts or active creditor transactions')
    }

    req.targetMember.deleteOne();

    await req.room.save()

    res.status(StatusCodes.NO_CONTENT).end()

}

module.exports = {
    updateMember,
    deleteMember
}
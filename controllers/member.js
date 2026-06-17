const Room = require('../models/Room')
const User = require('../models/User')
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

    res.status(StatusCodes.OK).json({'msg':'member updated'})
}

const deleteMember = async (req,res) => {
    req.targetMember.deleteOne();

    await req.room.save()

    res.status(StatusCodes.OK).json({'msg':"member deleted"})

}

module.exports = {
    updateMember,
    deleteMember
}
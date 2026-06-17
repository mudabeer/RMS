const Room = require('../models/Room')

const {
    NotFoundError,
    BadRequestError
} = require('../errors/index')

const loadRoomAndMember = async (req,res,next) => {
    const room = await Room.findOne({_id:req.params.roomId});

    if(!room){
        throw new NotFoundError('room not found')
    }

    const member = room.members.find(
        m => m.user.toString() === req.params.memberId
    )

    if(!member){
        throw new NotFoundError('member does not exist in room')
    }

    req.room = room
    req.targetMember = member

    if( req.room.creator.toString() !== req.user.userId){
        throw new BadRequestError('invalid authentication') 
    }

    next();
}

module.exports = loadRoomAndMember
const Room = require('../models/Room')

const {
    NotFoundError,
} = require('../errors/index')

const loadRoom = async (req,res,next) => {
    const room = await Room.findOne({_id:req.params.roomId});

    if(!room){
        throw new NotFoundError('room not found')
    }

    req.room = room

    next()
}

module.exports = loadRoom
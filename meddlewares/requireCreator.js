const Room = require('../models/Room')

const {
    BadRequestError
} = require('../errors/index')

const requireCreator = async (req,res,next) => {

    if( req.room.creator.toString() !== req.user.userId){
        throw new BadRequestError('invalid authentication') 
    }

    next();
}

module.exports = requireCreator
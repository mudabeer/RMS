const Room = require('../models/Room')

const {
    ForbiddenError
} = require('../errors/index')

const requireCreator = async (req,res,next) => {

    if( req.room.creator.toString() !== req.user.userId){
        throw new ForbiddenError('invalid authentication') 
    }

    next();
}

module.exports = requireCreator
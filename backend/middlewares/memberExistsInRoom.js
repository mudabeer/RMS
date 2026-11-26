const {
    NotFoundError
} = require('../errors/index')


const memberExistsInRoom  = async (req,res,next) => {
    const member = req.room.members.find(
        m => m.user.toString() === req.params.memberId
    )

    if(!member){
        throw new NotFoundError('member does not exist in room')
    }

    req.targetMember = member

    next()
}

module.exports = memberExistsInRoom
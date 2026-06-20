const {
    BadRequestError
} = require('../errors/index')

const requireRoomMember = async (req,res,next) => {
    const membersDoc = req.room.members.map(member => member.user.toString())
    
    const exist =  membersDoc.some(
    member => {
        return member === req.user.userId.toString()
    })

    if(!exist){
        throw new BadRequestError('invalid requset of non existing member in room')
    }
    
    req.membersDoc = membersDoc

    next()
}

module.exports = requireRoomMember
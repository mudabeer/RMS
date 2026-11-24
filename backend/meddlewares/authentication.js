const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser')

const {UnauthenticatedError} = require('../errors/index')

const auth = async (req,res,next) => {
    let accessToken = req.headers.authorization
    
    if(!accessToken || !accessToken.startsWith("Bearer ")){
        throw new UnauthenticatedError('invalid token')
    }

    accessToken = accessToken.replace("Bearer ","")


    
    try {
        const {userId,userName} = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)

        req.user = {userId,userName}
        next()
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid')
    }
}

module.exports = auth
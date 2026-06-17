const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser')

const {UnauthenticatedError} = require('../errors/index')

const auth = async (req,res,next) => {
    const token = req.cookies.accessToken

    if(!token){
        throw new UnauthenticatedError('invalid token')
    }

    try {
        const {userId,userName} = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

        req.user = {userId,userName}
        next()
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid')
    }
}

module.exports = auth
const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser')

const {UnauthenticatedError} = require('../errors/index')

const auth = async (req,res,next) => {
    // const token = req.cookies.accessToken

    const authHeader = req.headers.authorization

    console.log(authHeader);
    

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthenticatedError('No token provided')
    }

    const token = authHeader.split(' ')[1]

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
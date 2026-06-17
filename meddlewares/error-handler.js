const {StatusCodes} = require('http-status-codes')
const CustomAPIError = require('../errors/custom-api')

const errorHandler = (err,req,res,next) => {
    console.log(err)
    let customError = {
        msg: err.message || 'some thing went wrong try again',
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    }

    if(err.name === 'ValidationError'){
        customError.msg = Object.values(err.errors)
        .map((item) => item )
        .join(',')
        customError.statusCode = StatusCodes.BAD_REQUEST
    }

    if(err.code && err.code === 11000){
        customError.msg = `Duplicate value entered for ${Object.keys(
        err.keyValue
        )} field, please choose another value`
        customError.statusCode = StatusCodes.BAD_REQUEST
    }

    if(err.code === 'EENVELOPE'){
        customError.msg = "Invalid recipients:",
        customError.statusCode = StatusCodes.BAD_REQUEST
    }

    if (err.name === 'CastError') {
    customError.msg = `No item found with id : ${err.value}`
    customError.statusCode = StatusCodes.NOT_FOUND
    }

    if (
        err.name === 'TypeError' &&
        err.message.includes('Cannot destructure property')
    ){
        customError.msg  = 'request body is required'
        customError.statusCode = StatusCodes.BAD_REQUEST
    }

    res.status(customError.statusCode).json(customError.msg)
}

module.exports = errorHandler
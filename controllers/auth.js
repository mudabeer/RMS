// models
const User = require('../models/User')
const Otp = require('../models/Otp')
const RefreshToken = require('../models/RefreshToken')


const {StatusCodes} = require('http-status-codes')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const generateOtp = require('../utils/generateOTP')
const {
    sendRegCode,
    greetMail,
    resetPasswordMail
} = require('../services/emailService')

const {
    attachAccessToken,
    attachRefreshToken
} = require('../utils/cookies')

const {BadRequestError,
    NotFoundError,
    UnauthenticatedError
} = require('../errors/index')
const { transporter } = require('../config/email')


const sendCode = async (req,res) => {
    const {email} = req.body
    
    const user = await User.findOne({email});
    
    if(user){
        throw new BadRequestError('email already exist')
    }

    const otp = generateOtp()

    const salt = await bcrypt.genSalt(10)
    const otpHash = await bcrypt.hash(otp,salt)

    const result = await Otp.findOneAndUpdate(
        {email},
        {
            otp: otpHash,
            expiresAt: new Date(
            Date.now() + 10 * 60 * 1000
            ),
        },
        {
            upsert: true,
        }
    )

    await sendRegCode(email,otp)
    
    res.status(StatusCodes.OK).json({msg:'verification code sent!',otp:result})
}


const register = async (req,res) => {
    const {name, email, password, otp} = req.body

    const otpDoc = await Otp.findOne({email})

    if(!otpDoc){
       throw new BadRequestError('OTP expired or not found')
    }

    const validateOtp = await bcrypt.compare(otp,otpDoc.otp)

    if(!validateOtp){
        otpDoc.attempts += 1;

        if(otpDoc.attempts >= 5){
            await Otp.deleteOne({email:otpDoc.email})

            throw new BadRequestError('Too many failed attempts. Please request a new OTP.')
        }

        await otpDoc.save();

        throw new BadRequestError('invalid OTP')
    }

    const user = await User.create({
        name,
        email,
        password
    })

    await greetMail(email,name)

    res.status(StatusCodes.OK).json({msg:'register successfully!!'})

}

const forgotPassword = async (req,res) => {
    const {email} = req.body

    if(!email){
        throw new BadRequestError('please provide email')
    }

    const user = await User.findOne({email})

    if(!user){
        throw new NotFoundError('user not found')
    }

    const resetToken = crypto.randomBytes(32).toString('hex')

    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    user.passwordResetToken = hashedToken
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000

    await user.save()

    const resetLink = `${process.env.FRONTEND_URL || 'frot'}/reset-password/${resetToken}`

    await resetPasswordMail(resetLink,email)

    res.status(StatusCodes.OK).json({'msg':'password reset link sent to email'})
}

const resetPassword = async (req,res) => {
    const {newPassword} = req.body

    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')

    const user = await User.findOne({passwordResetToken:hashedToken})

    if(!user || user.passwordResetExpires < Date.now()){
        throw new BadRequestError('invalid token')
    }

    if(!newPassword){
        throw new BadRequestError('please provide newpassword')
    }

    user.password = newPassword
    await user.save()

    res.status(StatusCodes.OK).json({'msg':"password reset successfull"})
}

const login = async (req,res) => {
    const {email,password} = req.body

    const user = await User.findOne({email})

    if(!user){
        throw new NotFoundError('account does not exist')
    }

    if( ! await bcrypt.compare(password,user.password)){
        throw new BadRequestError('credential does not match')
    }

    const refreshToken = await user.createRefreshToken()
    const accessToken = await user.creatAccessToken()

    const salt = await bcrypt.genSalt(10)
    const refreshTokenHash = await  bcrypt.hash(refreshToken,salt)

    await RefreshToken.create({
        user,
        tokenHash:refreshTokenHash,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    })

    attachRefreshToken(res, refreshToken)
    attachAccessToken(res, accessToken)

    res.status(StatusCodes.OK).json({msg:'login successfully!!'})
}

const refresh = async (req,res) => {
    const refreshToken = req.cookies.refreshToken

    if(!refreshToken){
        throw new UnauthenticatedError('refresh token missing')
    }

    try {
        const playload = jwt.verify(
            refreshToken,
            process.env.JWT_REHRESH_SECRET
        )

        const tokenDoc = await RefreshToken.findOne({
            user: playload.userId
        })

        if(!tokenDoc){
            throw new UnauthenticatedError('invalid refresh token')
        }

        if(! await bcrypt.compare(refreshToken,tokenDoc.tokenHash)){
            throw new UnauthenticatedError('invalid refresh token')
        }

        const user = await User.findOne({_id:playload.userId})

        const accessToken = await user.creatAccessToken()

        attachAccessToken(res,accessToken)

        res.status(StatusCodes.OK).json('refresh success!!')
    } catch (error) {
        console.log(error)
        throw new UnauthenticatedError('invalid refresh token')
    }
}

const logout = async (req,res) => {
    console.log(req.user);
    
    await RefreshToken.deleteOne({user:req.user.userId})

    res.clearCookie('refreshToken', {
        httpOnly: true,
    });

    res.clearCookie('accessToken', {
        httpOnly: true,
    });

    res.status(StatusCodes.OK).json({'msg':'logout successfull!!'})
}

module.exports = {
    sendCode,
    register,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword
}
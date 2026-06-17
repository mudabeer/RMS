const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type:String,
        trim: true,
        required: [true, 'name is required'],
        maxlength: [50, 'name must be less then 50 characters']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'password is required']
    }
})

userSchema.pre('save', async function() {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
})

userSchema.methods.createRefreshToken = function(){
    return jwt.sign(
        {userId: this._id,userName: this.name},
        process.env.JWT_REHRESH_SECRET,
        {expiresIn:process.env.JWT_REFRESH_LIFETIME}
    )
}

userSchema.methods.creatAccessToken = function(){
    return jwt.sign(
        {userId: this._id,userName: this.name},
        process.env.JWT_ACCESS_SECRET,
        {expiresIn:process.env.JWT_ACCESS_LIFETIME}
    )
}

module.exports = mongoose.model('User',userSchema)
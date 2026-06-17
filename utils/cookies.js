const RefreshToken = require("../models/RefreshToken")

const attachAccessToken = (res,accessToken) => {
    res.cookie('accessToken', accessToken,{
        httpOnly: true,
        maxAge: 15 * 60 * 1000
    })
}

const attachRefreshToken = (res,refreshToken) => {
    res.cookie('refreshToken',refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
    })
}

module.exports = {
    attachAccessToken,
    attachRefreshToken
}
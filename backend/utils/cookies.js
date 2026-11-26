const refreshCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
})

const attachRefreshToken = (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, refreshCookieOptions())
}

const clearRefreshToken = (res) => {
    const { maxAge, ...options } = refreshCookieOptions()
    res.clearCookie('refreshToken', options)
}

module.exports = {
    attachRefreshToken,
    clearRefreshToken
}
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service:'gmail',
    host:'stmp.gmail.com',
    port:587,
    secure:false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

module.exports = transporter
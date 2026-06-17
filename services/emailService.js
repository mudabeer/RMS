const transporter = require('../config/email')

const {BadRequestError
} = require('../errors/index')

const sendRegCode = async (email,otp) => {
    
    const info = await transporter.sendMail({
        from:process.env.EMAIL,
        to:email,
        subject: 'RMS Email verification code',
        html: `<h1>HI!</h1>
        <br/><br/>
        Your verification code is: ${otp} Use this code to verify your login email.
        <br/>If you didn't request the code, please ignore this message.<br/><br/>Best regards,<br/>RMS`
    },)
    if(info.accepted.length === 0){
        throw new BadRequestError('Failed to send verification email')
    }    
};

const greetMail = async (email, name) => {


    const info = await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Welcome to RMS!',
        html: `
            <h2>Hello ${name},</h2> 
            <p> Welcome to RMS! Your account has been successfully created. </p> 
            <p> We are excited to have you join our platform. 
            You can now access all features and services available through RMS. </p> 
            <table cellpadding="8" cellspacing="0" style="margin:20px 0;"> 
            <tr> 
            <td><strong>Name:</strong></td> 
            <td>${name}</td> 
            </tr> 
            <tr> 
            <td><strong>Email:</strong></td> 
            <td>${email}</td> </tr> </table> 
            <p> If you did not create this account, please contact support immediately. </p> 
            <p> Thank you for choosing RMS. </p> 
            <p> Best Regards,<br> <strong>RMS Team</strong> </p> 
            </td> 
            </tr> 
            <tr> <td style="background:#f8fafc;padding:20px;text-align:center;color:#64748b;font-size:14px;"> © 2026 RMS. All rights reserved.
        `
    })
    if(info.accepted.length === 0){
        throw new BadRequestError('Failed to send verification email')
    }  
}

const sendVco = async (email,name, vco) => {
    const info = await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'VCO Code For Joining Room',
        html:`
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
        <div style="background:#2563eb;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0;">Room Verification</h1>
        </div>

        <div style="padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <p>Hello,</p>

          <p>
            Use the verification code below to join the room for ${name}.
          </p>

          <div style="text-align:center;margin:30px 0;">
            <span style="
              display:inline-block;
              padding:15px 30px;
              font-size:32px;
              font-weight:bold;
              letter-spacing:5px;
              background:#f3f4f6;
              border-radius:8px;
              color:#2563eb;
            ">
              ${vco}
            </span>
          </div>

          <p>
            This code will expire in <strong>10 minutes</strong>.
          </p>

          <p>
            If request this code not requested by valid member, please ignore this email.
          </p>

          <hr>

          <p style="color:#6b7280;font-size:12px;">
            RMS - Room Management System
          </p>
        </div>
      </div>
        ` 
    })
}

const sendNewMember = async (memberName,email,roomName) => {
    const info = await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Room Update: New Member Added',
        html:`
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #2563eb;">New Member Joined</h2>
              <p>Hello,</p>

              <p>
                  We are pleased to inform you that
                  <strong>${memberName}</strong> has joined the room
                  <strong>${roomName}</strong>.
              </p>

              <p>
                  You can now collaborate, share updates, and work together within the room.
              </p>

              <p>
                  Thank you for using our platform.
              </p>

              <br>

              <p>
                  Best regards,<br>
                  <strong>RMS Team</strong>
              </p>
              </div>
        ` 
    })
}

module.exports = {
    sendRegCode,
    greetMail,
    sendVco,
    sendNewMember
}
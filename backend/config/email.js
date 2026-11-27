const { google } = require('googleapis')

const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send'

const validateHeaderValue = (value, label) => {
  if (typeof value !== 'string' || !value.trim() || /[\r\n]/.test(value)) {
    throw new Error(`Email ${label} is missing or invalid.`)
  }
  return value.trim()
}

const encodeSubject = (subject) => {
  const value = validateHeaderValue(subject, 'subject')
  return /^[\x20-\x7E]*$/.test(value)
    ? value
    : `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`
}

const createRawMessage = ({ from, to, subject, html }) => {
  const sender = validateHeaderValue(from, 'sender')
  const recipient = validateHeaderValue(to, 'recipient')
  const encodedHtml = Buffer.from(String(html), 'utf8').toString('base64')
  const mimeMessage = [
    `From: ${sender}`,
    `To: ${recipient}`,
    `Subject: ${encodeSubject(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    encodedHtml.match(/.{1,76}/g)?.join('\r\n') || ''
  ].join('\r\n')

  return Buffer.from(mimeMessage, 'utf8').toString('base64url')
}

const createEmailSender = ({ googleApi = google, env = process.env } = {}) => async ({ to, subject, html }) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, EMAIL } = env
  if (!GOOGLE_CLIENT_ID) throw new Error('GOOGLE_CLIENT_ID is required to send email.')
  if (!GOOGLE_CLIENT_SECRET) throw new Error('GOOGLE_CLIENT_SECRET is required to send email.')
  if (!GOOGLE_REFRESH_TOKEN) throw new Error('GOOGLE_REFRESH_TOKEN is required to send email.')
  if (!EMAIL) throw new Error('EMAIL is required to send email.')
  if (typeof html !== 'string' || !html) throw new Error('Email HTML body is required.')

  try {
    const auth = new googleApi.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
    auth.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN })
    const gmail = googleApi.gmail({ version: 'v1', auth })
    const raw = createRawMessage({ from: EMAIL, to, subject, html })
    return await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw }
    })
  } catch (error) {
    if (error.message.startsWith('Email ')) throw error

    const googleError = error.response?.data?.error
    let message = String(googleError?.message || error.message || 'Unknown Gmail API error')
    for (const secret of [GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN]) {
      if (secret) message = message.replaceAll(secret, '[REDACTED]')
    }
    message = message
      .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
      .replace(/\bya29\.[A-Za-z0-9._~-]+/g, '[REDACTED]')
      .replace(/(client_secret|refresh_token|access_token)\s*[:=]\s*[^,\s]+/gi, '$1=[REDACTED]')

    const googleCode = googleError?.errors?.[0]?.reason || googleError?.status || googleError?.code || error.code
    console.error('Gmail API email send failed', {
      httpStatus: Number.isInteger(error.response?.status) ? error.response.status : null,
      googleCode: typeof googleCode === 'string' && /^[A-Za-z0-9_.-]{1,80}$/.test(googleCode)
        ? googleCode
        : Number.isInteger(googleCode) ? googleCode : null,
      message: message.slice(0, 300)
    })

    const deliveryError = new Error('Email delivery failed.')
    deliveryError.statusCode = 500
    throw deliveryError
  }
}

const sendEmail = createEmailSender()

module.exports = { sendEmail, createEmailSender, createRawMessage, GMAIL_SEND_SCOPE }

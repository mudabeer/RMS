const fs = require('node:fs/promises')
const path = require('node:path')
const http = require('node:http')
const crypto = require('node:crypto')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const { google } = require('googleapis')

const HOST = 'localhost'
const PORT = 3000
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`
const SCOPE = 'https://www.googleapis.com/auth/gmail.send'
const TOKEN_PATH = path.join(__dirname, '.gmail-token.json')

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env

if (require.main === module) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before running this helper.')
    process.exitCode = 1
  } else {
    run().catch(() => {
      console.error('OAuth helper failed. Check OAuth credentials and consent setup.')
      process.exitCode = 1
    })
  }
}

async function run() {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  )
  const state = crypto.randomBytes(32).toString('hex')
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [SCOPE],
    state
  })

  let completed = false
  const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url, 'http://localhost')

    if (requestUrl.pathname === '/' && request.method === 'GET') {
      response.writeHead(302, { Location: authorizationUrl })
      response.end()
      return
    }

    if (requestUrl.pathname !== '/oauth2callback' || request.method !== 'GET') {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Not found')
      return
    }

    if (completed) {
      response.writeHead(410, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('This authorization request has already been handled.')
      return
    }

    if (!isValidOAuthState(requestUrl.searchParams.get('state'), state)) {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Invalid OAuth state. Restart the authorization flow and try again.')
      return
    }

    completed = true

    try {
      const oauthError = requestUrl.searchParams.get('error')
      if (oauthError) {
        throw new Error('Google authorization was denied or could not be completed.')
      }

      const code = requestUrl.searchParams.get('code')
      if (!code) throw new Error('Google did not return an authorization code.')

      const { tokens } = await oauth2Client.getToken(code)
      if (!tokens.refresh_token) {
        throw new Error('Google did not return a refresh token. Run the helper again and approve consent.')
      }

      const temporaryPath = `${TOKEN_PATH}.tmp`
      await fs.writeFile(
        temporaryPath,
        `${JSON.stringify({ refresh_token: tokens.refresh_token }, null, 2)}\n`,
        { mode: 0o600, flag: 'w' }
      )
      await fs.chmod(temporaryPath, 0o600)
      await fs.rename(temporaryPath, TOKEN_PATH)

      response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Authorization completed. You can close this tab and return to the terminal.')
      console.log('Authorization completed. The refresh token was saved locally with restricted permissions.')
      server.close()
    } catch {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Authorization could not be completed. Check the terminal for a safe error message.')
      console.error('OAuth callback failed. The authorization was not saved; review the setup and try again.')
      server.close(() => { process.exitCode = 1 })
    }
  })

  server.on('error', (error) => {
    console.error(`Could not start the local OAuth server: ${error.message}`)
    process.exitCode = 1
  })

  server.listen(PORT, HOST, () => {
    console.log(`OAuth helper is listening at http://${HOST}:${PORT}`)
    console.log('Open http://localhost:3000 in your browser to authorize Gmail sending.')
    console.log('No authorization codes or tokens will be printed.')
  })
}

function isValidOAuthState(receivedState, expectedState) {
  if (typeof receivedState !== 'string' || !receivedState || typeof expectedState !== 'string' || !expectedState) {
    return false
  }
  const received = Buffer.from(receivedState, 'utf8')
  const expected = Buffer.from(expectedState, 'utf8')
  return received.length === expected.length && crypto.timingSafeEqual(received, expected)
}

module.exports = { isValidOAuthState }

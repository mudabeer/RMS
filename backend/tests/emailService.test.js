import { beforeEach, describe, expect, it, vi } from 'vitest'

const { createEmailSender } = require('../config/email')
const mocks = {
  gmailSend: vi.fn(),
  gmail: vi.fn(),
  setCredentials: vi.fn(),
  OAuth2: vi.fn()
}
const fakeGoogle = {
  auth: { OAuth2: mocks.OAuth2 },
  gmail: mocks.gmail
}
const env = {
  GOOGLE_CLIENT_ID: 'test-client-id',
  GOOGLE_CLIENT_SECRET: 'test-client-secret',
  GOOGLE_REFRESH_TOKEN: 'test-refresh-token',
  EMAIL: 'sender@example.com'
}
let sendEmail

describe('Gmail API email sender', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(env, {
      GOOGLE_CLIENT_ID: 'test-client-id',
      GOOGLE_CLIENT_SECRET: 'test-client-secret',
      GOOGLE_REFRESH_TOKEN: 'test-refresh-token',
      EMAIL: 'sender@example.com'
    })
    mocks.OAuth2.mockImplementation(function OAuth2() {
      return { setCredentials: mocks.setCredentials }
    })
    mocks.gmail.mockReturnValue({
      users: { messages: { send: mocks.gmailSend } }
    })
    mocks.gmailSend.mockResolvedValue({ data: { id: 'mock-message-id' } })
    sendEmail = createEmailSender({ googleApi: fakeGoogle, env })
  })

  it('sends a MIME message through Gmail API with the OAuth refresh token', async () => {
    let error
    try {
      await sendEmail({
        to: 'recipient@example.com',
        subject: 'Welcome to RMS',
        html: '<h1>Hello</h1>'
      })
    } catch (caughtError) {
      error = caughtError
    }

    expect(mocks.OAuth2).toHaveBeenCalledWith('test-client-id', 'test-client-secret')
    expect(mocks.setCredentials).toHaveBeenCalledWith({ refresh_token: 'test-refresh-token' })
    expect(mocks.gmail).toHaveBeenCalledWith({ version: 'v1', auth: expect.any(Object) })
    expect(mocks.gmailSend).toHaveBeenCalled()
    expect(error).toBeUndefined()

    const request = mocks.gmailSend.mock.calls[0][0]
    expect(request.userId).toBe('me')
    const mimeMessage = Buffer.from(request.requestBody.raw, 'base64url').toString('utf8')
    expect(mimeMessage).toContain('From: sender@example.com')
    expect(mimeMessage).toContain('To: recipient@example.com')
    expect(mimeMessage).toContain('Subject: Welcome to RMS')
    expect(mimeMessage).toContain('MIME-Version: 1.0')
    expect(mimeMessage).toContain('Content-Type: text/html; charset=UTF-8')
    expect(mimeMessage).toContain(Buffer.from('<h1>Hello</h1>').toString('base64'))
  })

  it('rejects missing deployment credentials without calling Gmail', async () => {
    delete env.GOOGLE_REFRESH_TOKEN

    await expect(sendEmail({
      to: 'recipient@example.com',
      subject: 'Test',
      html: '<p>Test</p>'
    })).rejects.toThrow('GOOGLE_REFRESH_TOKEN is required to send email.')
    expect(mocks.gmailSend).not.toHaveBeenCalled()
  })

  it('logs safe Gmail diagnostics without exposing credentials or changing the API error', async () => {
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.gmailSend.mockRejectedValue({
      message: 'Google API request failed',
      response: {
        status: 401,
        data: {
          error: {
            code: 401,
            status: 'UNAUTHENTICATED',
            message: 'Token refresh failed; client_secret=test-client-secret; refresh_token=test-refresh-token; Authorization: Bearer test-access-token'
          }
        }
      },
      config: { headers: { Authorization: 'Bearer test-access-token' } }
    })

    try {
      await expect(sendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Private content</p>'
      })).rejects.toThrow('Email delivery failed.')

      const [message, details] = logSpy.mock.calls[0]
      expect(message).toBe('Gmail API email send failed')
      expect(details).toMatchObject({ httpStatus: 401, googleCode: 'UNAUTHENTICATED' })
      expect(details.message).toContain('Token refresh failed')
      const loggedDetails = JSON.stringify(logSpy.mock.calls)
      expect(loggedDetails.includes('test-client-secret')).toBe(false)
      expect(loggedDetails.includes('test-refresh-token')).toBe(false)
      expect(loggedDetails.includes('test-access-token')).toBe(false)
      expect(loggedDetails.includes('Private content')).toBe(false)
    } finally {
      logSpy.mockRestore()
    }
  })
})

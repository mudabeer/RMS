import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_ACCESS_LIFETIME = '15m';
process.env.JWT_REFRESH_LIFETIME = '7d';

const app = require('../app');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const generateOtp = require('../utils/generateOTP');

let mongod;

const extractRefreshCookie = (res) => {
  const cookies = res.headers['set-cookie'] || [];
  const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
  if (!refreshCookie) return null;
  return refreshCookie.split(';')[0];
};

const extractCookieValue = (cookiePair) => cookiePair.split('=')[1];

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

describe('Phase 1 — Auth & Session Hardening Integration Tests', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  it('generates 6-digit numeric OTPs using crypto.randomInt', () => {
    for (let i = 0; i < 20; i++) {
      const otp = generateOtp();
      expect(otp).toMatch(/^\d{6}$/);
      const num = Number(otp);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThan(1000000);
    }
  });

  it('authenticates via Authorization Bearer header after login', async () => {
    await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: 'Password123!',
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'Password123!' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.accessToken).toBeTruthy();

    const refreshCookie = extractRefreshCookie(loginRes);
    expect(refreshCookie).toBeTruthy();

    const unauthRes = await request(app).get('/api/v1/auth/profile');
    expect(unauthRes.status).toBe(401);

    const profileRes = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.email).toBe('user@example.com');
  });

  it('rotates refresh tokens on /refresh and hashes them with SHA-256', async () => {
    const user = await User.create({
      name: 'Rotate User',
      email: 'rotate@example.com',
      password: 'Password123!',
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rotate@example.com', password: 'Password123!' });

    const firstCookie = extractRefreshCookie(loginRes);
    const firstRawToken = extractCookieValue(firstCookie);
    const firstHash = hashToken(firstRawToken);

    const storedBefore = await RefreshToken.findOne({ user: user._id });
    expect(storedBefore).toBeTruthy();
    expect(storedBefore.tokenHash).toBe(firstHash);

    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [firstCookie]);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.accessToken).toBeTruthy();

    const secondCookie = extractRefreshCookie(refreshRes);
    expect(secondCookie).toBeTruthy();
    expect(secondCookie).not.toBe(firstCookie);

    const oldDoc = await RefreshToken.findOne({ tokenHash: firstHash });
    expect(oldDoc).toBeNull();

    const newDoc = await RefreshToken.findOne({
      tokenHash: hashToken(extractCookieValue(secondCookie)),
    });
    expect(newDoc).toBeTruthy();
  });

  it('revokes all user sessions when a rotated refresh token is reused', async () => {
    const user = await User.create({
      name: 'Reuse User',
      email: 'reuse@example.com',
      password: 'Password123!',
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'reuse@example.com', password: 'Password123!' });

    const stolenOldCookie = extractRefreshCookie(loginRes);

    // Legitimate rotation
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [stolenOldCookie]);
    expect(refreshRes.status).toBe(200);
    const validNewCookie = extractRefreshCookie(refreshRes);

    // Attacker reuses the already-rotated refresh token
    const reuseRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [stolenOldCookie]);
    expect(reuseRes.status).toBe(401);

    // All sessions for the user must be revoked
    const remainingTokens = await RefreshToken.countDocuments({ user: user._id });
    expect(remainingTokens).toBe(0);

    // Even the legitimate new cookie is now rejected
    const followUpRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [validNewCookie]);
    expect(followUpRes.status).toBe(401);
  });

  it('invalidates all refresh tokens on password reset', async () => {
    const resetToken = 'test-reset-token-123';
    const resetTokenHash = hashToken(resetToken);

    const user = await User.create({
      name: 'Reset User',
      email: 'reset@example.com',
      password: 'OldPassword123!',
      passwordResetToken: resetTokenHash,
      passwordResetExpires: Date.now() + 10 * 60 * 1000,
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'reset@example.com', password: 'OldPassword123!' });

    const cookie = extractRefreshCookie(loginRes);
    expect(await RefreshToken.countDocuments({ user: user._id })).toBe(1);

    const resetRes = await request(app)
      .post(`/api/v1/auth/reset-password/${resetToken}`)
      .send({ newPassword: 'NewPassword123!' });

    expect(resetRes.status).toBe(200);
    expect(await RefreshToken.countDocuments({ user: user._id })).toBe(0);

    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [cookie]);
    expect(refreshRes.status).toBe(401);
  });
});


import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_ACCESS_LIFETIME = '15m';
process.env.JWT_REFRESH_LIFETIME = '7d';

const transporter = require('../config/email');
vi.spyOn(transporter, 'sendMail').mockResolvedValue({
  accepted: ['mock@example.com'],
});

const app = require('../app');
const User = require('../models/User');
const Room = require('../models/Room');
const Vco = require('../models/Vco');
const Otp = require('../models/Otp');
const RefreshToken = require('../models/RefreshToken');

let mongod;

describe('Phase 6 — Backend Room & Registration Integration Tests', () => {
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
    vi.clearAllMocks();
    transporter.sendMail.mockResolvedValue({ accepted: ['mock@example.com'] });
    await User.deleteMany({});
    await Room.deleteMany({});
    await Vco.deleteMany({});
    await Otp.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  it('completes OTP send -> register -> login -> logout flow', async () => {
    const sendRes = await request(app)
      .post('/api/v1/auth/send-code')
      .send({ email: 'newuser@example.com' });

    expect(sendRes.status).toBe(200);
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);

    const otpHtml = transporter.sendMail.mock.calls[0][0].html;
    const otpMatch = otpHtml.match(/\b(\d{6})\b/);
    expect(otpMatch).toBeTruthy();
    const plainOtp = otpMatch[1];

    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password123!',
        otp: plainOtp,
      });

    expect(registerRes.status).toBe(201);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'newuser@example.com', password: 'Password123!' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.accessToken).toBeTruthy();

    const cookies = loginRes.headers['set-cookie'] || [];
    const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeTruthy();

    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .set('Cookie', refreshCookie.split(';')[0]);

    expect(logoutRes.status).toBe(200);
    const remainingTokens = await RefreshToken.countDocuments({});
    expect(remainingTokens).toBe(0);
  });

  it('completes room flow: create -> gen-vco -> join -> list members', async () => {
    await User.create({
      name: 'Room Creator',
      email: 'creator@example.com',
      password: 'Password123!',
    });
    await User.create({
      name: 'Room Joiner',
      email: 'joiner@example.com',
      password: 'Password123!',
    });

    const creatorLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'creator@example.com', password: 'Password123!' });
    const creatorToken = creatorLogin.body.accessToken;

    const joinerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'joiner@example.com', password: 'Password123!' });
    const joinerToken = joinerLogin.body.accessToken;

    // 1. Create room
    const createRes = await request(app)
      .post('/api/v1/room')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ roomName: 'Flat 402' });

    expect(createRes.status).toBe(201);
    const createdRoom = createRes.body.data;
    expect(createdRoom.name).toBe('Flat 402');
    expect(createdRoom.roomCode).toBeTruthy();

    // 2. Joiner requests VCO
    const vcoRes = await request(app)
      .post('/api/v1/room/gen-vco')
      .set('Authorization', `Bearer ${joinerToken}`)
      .send({ roomCode: createdRoom.roomCode });

    expect(vcoRes.status).toBe(200);
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);

    const vcoDoc = await Vco.findOne({ roomId: createdRoom._id });
    expect(vcoDoc).toBeTruthy();

    // 3. Joiner joins room using VCO
    const joinRes = await request(app)
      .patch('/api/v1/room/join-room')
      .set('Authorization', `Bearer ${joinerToken}`)
      .send({ vco: vcoDoc.code });

    expect(joinRes.status).toBe(200);

    // 4. List members via single room endpoint and rooms list
    const roomDetailRes = await request(app)
      .get(`/api/v1/room/${createdRoom._id}`)
      .set('Authorization', `Bearer ${joinerToken}`);

    expect(roomDetailRes.status).toBe(200);
    expect(roomDetailRes.body.data.members).toHaveLength(2);
    const memberEmails = roomDetailRes.body.data.members.map((m) => m.user.email);
    expect(memberEmails).toContain('creator@example.com');
    expect(memberEmails).toContain('joiner@example.com');

    const roomsListRes = await request(app)
      .get('/api/v1/room')
      .set('Authorization', `Bearer ${joinerToken}`);

    expect(roomsListRes.status).toBe(200);
    expect(roomsListRes.body.data.rooms).toHaveLength(1);
    expect(roomsListRes.body.data.rooms[0].name).toBe('Flat 402');
  });
});

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_ACCESS_LIFETIME = '15m';
process.env.JWT_REFRESH_LIFETIME = '7d';

const app = require('../app');
const User = require('../models/User');
const Room = require('../models/Room');
const Transaction = require('../models/Transaction');
const Chore = require('../models/Chore');
const Vco = require('../models/Vco');
const RefreshToken = require('../models/RefreshToken');

let mongod;

const createUserWithToken = async (name, email) => {
  const user = await User.create({
    name,
    email,
    password: 'Password123!',
  });
  const token = user.createAccessToken();
  return { user, token };
};

describe('Phase 2 — Backend Integrity & Defense Integration Tests', () => {
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
    await Promise.all([
      User.deleteMany({}),
      Room.deleteMany({}),
      Transaction.deleteMany({}),
      Chore.deleteMany({}),
      Vco.deleteMany({}),
      RefreshToken.deleteMany({}),
    ]);
  });

  it('splits uneven amounts in integer cents with remainder distribution and settles accurately', async () => {
    const { user: u1, token: t1 } = await createUserWithToken('Alice', 'alice@example.com');
    const { user: u2, token: t2 } = await createUserWithToken('Bob', 'bob@example.com');
    const { user: u3 } = await createUserWithToken('Charlie', 'charlie@example.com');

    const room = await Room.create({
      name: 'Flat 101',
      roomCode: 'FLAT101A',
      creator: u1._id,
      members: [
        { user: u1._id, role: 'creator' },
        { user: u2._id, role: 'member' },
        { user: u3._id, role: 'member' },
      ],
    });

    const createRes = await request(app)
      .post(`/api/v1/transaction/${room._id}`)
      .set('Authorization', `Bearer ${t1}`)
      .send({
        title: 'Groceries',
        amount: 100,
        category: 'Food',
        splitType: 'allRoomMember',
      });

    expect(createRes.status).toBe(201);

    const tx = await Transaction.findOne({ roomId: room._id });
    expect(tx).toBeTruthy();

    const totalCents = tx.splitAmong.reduce(
      (sum, entry) => sum + Math.round(entry.debtAmount * 100),
      0
    );
    expect(totalCents).toBe(10000);
    expect(tx.splitAmong.map((m) => m.debtAmount)).toEqual([33.34, 33.33, 33.33]);

    // Non-creditor cannot settle debt (403 Forbidden)
    const forbiddenRes = await request(app)
      .patch(`/api/v1/transaction/${room._id}/${tx._id}/payment/${u2._id}`)
      .set('Authorization', `Bearer ${t2}`)
      .send({ payment: 10 });
    expect(forbiddenRes.status).toBe(403);

    // Creditor settles Bob's 33.33 debt in two parts (11.11 + 22.22)
    const partialRes = await request(app)
      .patch(`/api/v1/transaction/${room._id}/${tx._id}/payment/${u2._id}`)
      .set('Authorization', `Bearer ${t1}`)
      .send({ payment: 11.11 });
    expect(partialRes.status).toBe(200);

    const fullRes = await request(app)
      .patch(`/api/v1/transaction/${room._id}/${tx._id}/payment/${u2._id}`)
      .set('Authorization', `Bearer ${t1}`)
      .send({ payment: 22.22 });
    expect(fullRes.status).toBe(200);

    const updatedTx = await Transaction.findById(tx._id);
    const bobEntry = updatedTx.splitAmong.find(
      (entry) => entry.userId.toString() === u2._id.toString()
    );
    expect(bobEntry.status).toBe('Paid');
    expect(bobEntry.paidAmount).toBe(33.33);
  });

  it('rejects negative/zero amounts, non-room custom members, and sanitizes MongoDB operators', async () => {
    const { user: u1, token: t1 } = await createUserWithToken('Alice', 'alice@example.com');
    const { user: outsider } = await createUserWithToken('Outsider', 'outsider@example.com');

    const room = await Room.create({
      name: 'Flat 102',
      roomCode: 'FLAT102B',
      creator: u1._id,
      members: [{ user: u1._id, role: 'creator' }],
    });

    const zeroRes = await request(app)
      .post(`/api/v1/transaction/${room._id}`)
      .set('Authorization', `Bearer ${t1}`)
      .send({
        title: 'Zero',
        amount: 0,
        splitType: 'allRoomMember',
      });
    expect(zeroRes.status).toBe(400);

    const negativeRes = await request(app)
      .post(`/api/v1/transaction/${room._id}`)
      .set('Authorization', `Bearer ${t1}`)
      .send({
        title: 'Negative',
        amount: -25,
        splitType: 'allRoomMember',
      });
    expect(negativeRes.status).toBe(400);

    const outsiderRes = await request(app)
      .post(`/api/v1/transaction/${room._id}`)
      .set('Authorization', `Bearer ${t1}`)
      .send({
        title: 'Custom',
        amount: 50,
        splitType: 'custom',
        members: [u1._id.toString(), outsider._id.toString()],
      });
    expect(outsiderRes.status).toBe(400);

    // Operator injection attempt on login is sanitized and cannot match existing user
    const injectionRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: { $gt: '' },
        password: { $ne: '' },
      });
    expect(injectionRes.status).toBe(404);
  });

  it('returns 200 on getSingleTrans, 204 with empty body on deletes, and enforces cascade & member debt guards', async () => {
    const { user: u1, token: t1 } = await createUserWithToken('Alice', 'alice@example.com');
    const { user: u2 } = await createUserWithToken('Bob', 'bob@example.com');

    const room = await Room.create({
      name: 'Flat 103',
      roomCode: 'FLAT103C',
      creator: u1._id,
      members: [
        { user: u1._id, role: 'creator' },
        { user: u2._id, role: 'member' },
      ],
    });

    await request(app)
      .post(`/api/v1/transaction/${room._id}`)
      .set('Authorization', `Bearer ${t1}`)
      .send({
        title: 'WiFi',
        amount: 100,
        splitType: 'allRoomMember',
      });

    const tx = await Transaction.findOne({ roomId: room._id });

    // getSingleTrans returns 200 (not 201)
    const singleRes = await request(app)
      .get(`/api/v1/transaction/${room._id}/${tx._id}`)
      .set('Authorization', `Bearer ${t1}`);
    expect(singleRes.status).toBe(200);

    // Removing member with outstanding debt is blocked
    const blockedRemove = await request(app)
      .delete(`/api/v1/room/${room._id}/member/${u2._id}`)
      .set('Authorization', `Bearer ${t1}`);
    expect(blockedRemove.status).toBe(400);

    // Settle debt, then remove member -> 204 with empty body
    await request(app)
      .patch(`/api/v1/transaction/${room._id}/${tx._id}/payment/${u2._id}`)
      .set('Authorization', `Bearer ${t1}`)
      .send({ payment: 50 });

    const removeMemberRes = await request(app)
      .delete(`/api/v1/room/${room._id}/member/${u2._id}`)
      .set('Authorization', `Bearer ${t1}`);
    expect(removeMemberRes.status).toBe(204);
    expect(removeMemberRes.text).toBe('');

    // Create chore & vco, then delete room -> cascade cleanup + 204 empty body
    await Chore.create({ roomId: room._id, title: 'Trash', createdBy: u1._id });
    await Vco.create({
      roomId: room._id,
      roomCode: room.roomCode,
      userId: u2._id,
      code: '1234',
    });

    const deleteRoomRes = await request(app)
      .delete(`/api/v1/room/${room._id}`)
      .set('Authorization', `Bearer ${t1}`);
    expect(deleteRoomRes.status).toBe(204);
    expect(deleteRoomRes.text).toBe('');

    expect(await Transaction.countDocuments({ roomId: room._id })).toBe(0);
    expect(await Chore.countDocuments({ roomId: room._id })).toBe(0);
    expect(await Vco.countDocuments({ roomId: room._id })).toBe(0);
  });

  it('defines required database indexes and mounts helmet + rate limiting', async () => {
    const roomIndexes = Room.schema.indexes();
    expect(
      roomIndexes.some(([fields, opts]) => fields.roomCode === 1 && opts.unique === true)
    ).toBe(true);

    const txIndexes = Transaction.schema.indexes();
    expect(
      txIndexes.some(([fields]) => fields.roomId === 1 && fields.createdAt === -1)
    ).toBe(true);
    expect(
      txIndexes.some(([fields]) => fields['splitAmong.userId'] === 1)
    ).toBe(true);

    const refreshIndexes = RefreshToken.schema.indexes();
    expect(refreshIndexes.some(([fields]) => fields.user === 1)).toBe(true);

    const userIndexes = User.schema.indexes();
    expect(
      userIndexes.some(
        ([fields, opts]) => fields.passwordResetToken === 1 && opts.sparse === true
      )
    ).toBe(true);

    // Helmet headers + rate limiting on /api/v1/auth/login
    let lastRes;
    for (let i = 0; i < 11; i += 1) {
      lastRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'wrong' });
    }
    expect(lastRes.headers['x-content-type-options']).toBe('nosniff');
    expect(lastRes.status).toBe(429);
  });
});

const request = require('supertest');
const express = require('express');
const createApiRouter = require('../routes');
const path = require('path');

const sentEmails = [];
const sendEmail = (to, subject, body) => sentEmails.push({ to, subject, body });

const app = express();
app.use(express.json());
app.use('/api', createApiRouter({
  usersFile: path.join(__dirname, '../data/test-users.json'),
  booksFile: path.join(__dirname, '../data/test-books.json'),
  readJSON: (file) => require('fs').existsSync(file) ? JSON.parse(require('fs').readFileSync(file, 'utf-8')) : [],
  writeJSON: (file, data) => require('fs').writeFileSync(file, JSON.stringify(data, null, 2)),
  authenticateToken: (req, res, next) => next(),
  SECRET_KEY: 'test_secret',
  sendEmail,
}));

describe('Auth API', () => {
  const testUser = { username: 'testuser', password: 'testpass' };

  it('POST /api/register should fail with missing fields', async () => {
    const res = await request(app).post('/api/register').send({ username: '' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/register should succeed with valid data', async () => {
    const res = await request(app).post('/api/register').send(testUser);
    // 201 or 409 if already exists
    expect([201, 409]).toContain(res.statusCode);
  });

  it('POST /api/register should fail if user already exists', async () => {
    await request(app).post('/api/register').send(testUser); // ensure exists
    const res = await request(app).post('/api/register').send(testUser);
    expect(res.statusCode).toBe(409);
  });

  it('POST /api/login should succeed with correct credentials', async () => {
    await request(app).post('/api/register').send(testUser); // ensure exists
    const res = await request(app).post('/api/login').send(testUser);
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/login should fail with wrong password', async () => {
    const res = await request(app).post('/api/login').send({ username: testUser.username, password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/login should fail with missing fields', async () => {
    const res = await request(app).post('/api/login').send({ username: '' });
    expect(res.statusCode).toBe(401);
  });
});

describe('Forgot/Reset Password API', () => {
  const testUserWithEmail = { username: 'resetuser', password: 'oldpass', email: 'resetuser@example.com' };

  function extractToken(body) {
    const match = body.match(/token=([a-f0-9]+)&/);
    return match ? match[1] : null;
  }

  beforeAll(async () => {
    await request(app).post('/api/register').send(testUserWithEmail); // ensure exists
  });

  it('POST /api/forgot-password should require an email', async () => {
    const res = await request(app).post('/api/forgot-password').send({});
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/forgot-password should respond generically for unknown emails', async () => {
    const before = sentEmails.length;
    const res = await request(app).post('/api/forgot-password').send({ email: 'unknown@example.com' });
    expect(res.statusCode).toBe(200);
    expect(sentEmails.length).toBe(before); // no email sent for unknown address
  });

  it('POST /api/forgot-password should send a reset email for a known email', async () => {
    const res = await request(app).post('/api/forgot-password').send({ email: testUserWithEmail.email });
    expect(res.statusCode).toBe(200);
    const email = sentEmails.find(e => e.to === testUserWithEmail.email);
    expect(email).toBeDefined();
    expect(extractToken(email.body)).toBeTruthy();
  });

  it('POST /api/reset-password should fail with an invalid token', async () => {
    const res = await request(app).post('/api/reset-password').send({
      email: testUserWithEmail.email,
      token: 'not-a-valid-token',
      newPassword: 'newpass',
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/reset-password should reset the password with a valid token and allow login', async () => {
    sentEmails.length = 0;
    await request(app).post('/api/forgot-password').send({ email: testUserWithEmail.email });
    const email = sentEmails.find(e => e.to === testUserWithEmail.email);
    const token = extractToken(email.body);
    expect(token).toBeTruthy();

    const resetRes = await request(app).post('/api/reset-password').send({
      email: testUserWithEmail.email,
      token,
      newPassword: 'newpass123',
    });
    expect(resetRes.statusCode).toBe(200);

    const loginRes = await request(app).post('/api/login').send({
      username: testUserWithEmail.username,
      password: 'newpass123',
    });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.token).toBeDefined();

    // The token should be single-use: attempting to reuse it must fail
    const reuseRes = await request(app).post('/api/reset-password').send({
      email: testUserWithEmail.email,
      token,
      newPassword: 'anotherpass',
    });
    expect(reuseRes.statusCode).toBe(400);
  });

  it('POST /api/reset-password should fail with an expired token', async () => {
    sentEmails.length = 0;
    await request(app).post('/api/forgot-password').send({ email: testUserWithEmail.email });
    const email = sentEmails.find(e => e.to === testUserWithEmail.email);
    const token = extractToken(email.body);

    // Simulate token expiry by rewriting the stored expiry into the past
    const fs = require('fs');
    const usersFile = path.join(__dirname, '../data/test-users.json');
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    const user = users.find(u => u.email === testUserWithEmail.email);
    user.resetPasswordExpires = Date.now() - 1000;
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    const res = await request(app).post('/api/reset-password').send({
      email: testUserWithEmail.email,
      token,
      newPassword: 'somepass',
    });
    expect(res.statusCode).toBe(400);
  });
});

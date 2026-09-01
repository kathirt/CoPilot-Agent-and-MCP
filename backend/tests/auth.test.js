const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const createApiRouter = require('../routes');
const path = require('path');

const SECRET_KEY = 'test_secret';

const app = express();
app.use(express.json());
app.use('/api', createApiRouter({
  usersFile: path.join(__dirname, '../data/test-users.json'),
  booksFile: path.join(__dirname, '../data/test-books.json'),
  readJSON: (file) => require('fs').existsSync(file) ? JSON.parse(require('fs').readFileSync(file, 'utf-8')) : [],
  writeJSON: (file, data) => require('fs').writeFileSync(file, JSON.stringify(data, null, 2)),
  authenticateToken: (req, res, next) => next(),
  SECRET_KEY,
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

  it('POST /api/register should default new users to member role', async () => {
    const roleUser = { username: 'roleuser', password: 'rolepass' };
    const res = await request(app).post('/api/register').send(roleUser);
    expect([201, 409]).toContain(res.statusCode);
    const loginRes = await request(app).post('/api/login').send(roleUser);
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.role).toBe('member');
  });

  it('POST /api/register should accept an administrator role', async () => {
    const adminUser = { username: `adminuser${Date.now()}`, password: 'adminpass', role: 'administrator' };
    const res = await request(app).post('/api/register').send(adminUser);
    expect(res.statusCode).toBe(201);
    const loginRes = await request(app).post('/api/login').send(adminUser);
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.role).toBe('administrator');
  });

  it('POST /api/login response and JWT payload should include the role', async () => {
    await request(app).post('/api/register').send(testUser); // ensure exists
    const res = await request(app).post('/api/login').send(testUser);
    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe('member');
    const decoded = jwt.verify(res.body.token, SECRET_KEY);
    expect(decoded.role).toBe('member');
  });
});

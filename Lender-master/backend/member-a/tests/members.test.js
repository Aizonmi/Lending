const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Member = require('../models/Member');

describe('Members API', () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lendify-test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up and close connection
    await Member.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear members before each test
    await Member.deleteMany({});
  });

  describe('POST /api/members', () => {
    it('should create a new member', async () => {
      const memberData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890'
      };

      const response = await request(app)
        .post('/api/members')
        .send(memberData)
        .expect(201);

      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(memberData.name);
      expect(response.body.data.email).toBe(memberData.email);
    });

    it('should reject duplicate email', async () => {
      const memberData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      await request(app)
        .post('/api/members')
        .send(memberData)
        .expect(201);

      const response = await request(app)
        .post('/api/members')
        .send(memberData)
        .expect(409);

      expect(response.body.error.message).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/members')
        .send({})
        .expect(400);

      expect(response.body.error.message).toBe('Validation failed');
    });
  });

  describe('GET /api/members', () => {
    it('should list all members', async () => {
      await Member.create([
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Smith', email: 'jane@example.com' }
      ]);

      const response = await request(app)
        .get('/api/members')
        .expect(200);

      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when no members exist', async () => {
      const response = await request(app)
        .get('/api/members')
        .expect(200);

      expect(response.body.count).toBe(0);
      expect(response.body.data).toHaveLength(0);
    });
  });
});


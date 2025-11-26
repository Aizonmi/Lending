const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Item = require('../models/Item');
const Member = require('../models/Member');

describe('Items API', () => {
  let testMember;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lendify-test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await Item.deleteMany({});
    await Member.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Item.deleteMany({});
    await Member.deleteMany({});
    
    testMember = await Member.create({
      name: 'Test Owner',
      email: 'owner@example.com'
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const itemData = {
        title: 'Test Book',
        type: 'book',
        owner: testMember._id.toString(),
        description: 'A test book'
      };

      const response = await request(app)
        .post('/api/items')
        .send(itemData)
        .expect(201);

      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(itemData.title);
      expect(response.body.data.type).toBe(itemData.type);
      expect(response.body.data.owner._id.toString()).toBe(testMember._id.toString());
      expect(response.body.data.available).toBe(true);
    });

    it('should reject item with invalid owner', async () => {
      const itemData = {
        title: 'Test Book',
        type: 'book',
        owner: new mongoose.Types.ObjectId().toString()
      };

      const response = await request(app)
        .post('/api/items')
        .send(itemData)
        .expect(404);

      expect(response.body.error.message).toContain('Owner member not found');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .expect(400);

      expect(response.body.error.message).toBe('Validation failed');
    });

    it('should validate item type', async () => {
      const itemData = {
        title: 'Test Item',
        type: 'invalid-type',
        owner: testMember._id.toString()
      };

      const response = await request(app)
        .post('/api/items')
        .send(itemData)
        .expect(400);

      expect(response.body.error.message).toBe('Validation failed');
    });
  });

  describe('GET /api/items', () => {
    it('should list all items', async () => {
      await Item.create([
        {
          title: 'Book 1',
          type: 'book',
          owner: testMember._id
        },
        {
          title: 'Tool 1',
          type: 'tool',
          owner: testMember._id
        }
      ]);

      const response = await request(app)
        .get('/api/items')
        .expect(200);

      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter items by availability', async () => {
      await Item.create([
        {
          title: 'Available Item',
          type: 'book',
          owner: testMember._id,
          available: true
        },
        {
          title: 'Borrowed Item',
          type: 'book',
          owner: testMember._id,
          available: false
        }
      ]);

      const response = await request(app)
        .get('/api/items?available=true')
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.data[0].available).toBe(true);
    });
  });
});


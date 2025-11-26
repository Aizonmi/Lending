const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Loan = require('../models/Loan');
const Item = require('../models/Item');
const Member = require('../models/Member');

describe('Loans API', () => {
  let testOwner, testBorrower, testItem;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lendify-test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await Loan.deleteMany({});
    await Item.deleteMany({});
    await Member.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Loan.deleteMany({});
    await Item.deleteMany({});
    await Member.deleteMany({});

    // Create test owner
    testOwner = await Member.create({
      name: 'Test Owner',
      email: 'owner@example.com'
    });

    // Create test borrower
    testBorrower = await Member.create({
      name: 'Test Borrower',
      email: 'borrower@example.com'
    });

    // Create test item
    testItem = await Item.create({
      title: 'Test Book',
      type: 'book',
      owner: testOwner._id,
      available: true
    });
  });

  describe('POST /api/loans/borrow', () => {
    it('should borrow an available item', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // 7 days from now

      const response = await request(app)
        .post('/api/loans/borrow')
        .send({
          itemId: testItem._id.toString(),
          borrowerMemberId: testBorrower._id.toString(),
          dueDate: dueDate.toISOString()
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.itemId).toBeDefined();
      expect(response.body.data.borrowerMemberId).toBeDefined();

      // Verify item availability updated
      const updatedItem = await Item.findById(testItem._id);
      expect(updatedItem.available).toBe(false);
    });

    it('should reject borrowing unavailable item', async () => {
      // Mark item as unavailable
      testItem.available = false;
      await testItem.save();

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const response = await request(app)
        .post('/api/loans/borrow')
        .send({
          itemId: testItem._id.toString(),
          borrowerMemberId: testBorrower._id.toString(),
          dueDate: dueDate.toISOString()
        })
        .expect(409);

      expect(response.body.error.message).toContain('not available');
    });

    it('should reject borrowing own item', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const response = await request(app)
        .post('/api/loans/borrow')
        .send({
          itemId: testItem._id.toString(),
          borrowerMemberId: testOwner._id.toString(),
          dueDate: dueDate.toISOString()
        })
        .expect(400);

      expect(response.body.error.message).toContain('Cannot borrow your own item');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/loans/borrow')
        .send({})
        .expect(400);

      expect(response.body.error.message).toBe('Validation failed');
    });

    it('should validate due date is in the future', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const response = await request(app)
        .post('/api/loans/borrow')
        .send({
          itemId: testItem._id.toString(),
          borrowerMemberId: testBorrower._id.toString(),
          dueDate: pastDate.toISOString()
        })
        .expect(400);

      expect(response.body.error.message).toBe('Validation failed');
    });
  });

  describe('POST /api/loans/return', () => {
    it('should return a borrowed item', async () => {
      // First borrow the item
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const borrowResponse = await request(app)
        .post('/api/loans/borrow')
        .send({
          itemId: testItem._id.toString(),
          borrowerMemberId: testBorrower._id.toString(),
          dueDate: dueDate.toISOString()
        })
        .expect(201);

      const loanId = borrowResponse.body.data._id;

      // Now return it
      const returnResponse = await request(app)
        .post('/api/loans/return')
        .send({ loanId })
        .expect(200);

      expect(returnResponse.body.data.status).toBe('returned');
      expect(returnResponse.body.data.returnDate).toBeDefined();

      // Verify item availability updated
      const updatedItem = await Item.findById(testItem._id);
      expect(updatedItem.available).toBe(true);
    });

    it('should reject returning already returned item', async () => {
      // Create and return a loan
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const borrowResponse = await request(app)
        .post('/api/loans/borrow')
        .send({
          itemId: testItem._id.toString(),
          borrowerMemberId: testBorrower._id.toString(),
          dueDate: dueDate.toISOString()
        })
        .expect(201);

      const loanId = borrowResponse.body.data._id;

      await request(app)
        .post('/api/loans/return')
        .send({ loanId })
        .expect(200);

      // Try to return again
      const response = await request(app)
        .post('/api/loans/return')
        .send({ loanId })
        .expect(409);

      expect(response.body.error.message).toContain('already been returned');
    });
  });

  describe('GET /api/loans', () => {
    it('should list all loans', async () => {
      // Create a loan
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      await Loan.create({
        itemId: testItem._id,
        borrowerMemberId: testBorrower._id,
        dueDate,
        status: 'active'
      });

      const response = await request(app)
        .get('/api/loans')
        .expect(200);

      expect(response.body.count).toBeGreaterThan(0);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter loans by status', async () => {
      // Create loans with different statuses
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      await Loan.create([
        {
          itemId: testItem._id,
          borrowerMemberId: testBorrower._id,
          dueDate,
          status: 'active'
        },
        {
          itemId: testItem._id,
          borrowerMemberId: testBorrower._id,
          dueDate,
          status: 'returned',
          returnDate: new Date()
        }
      ]);

      const response = await request(app)
        .get('/api/loans?status=active')
        .expect(200);

      expect(response.body.data.every(loan => loan.status === 'active')).toBe(true);
    });
  });
});


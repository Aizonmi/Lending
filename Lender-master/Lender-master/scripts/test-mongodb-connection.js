const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('\n🔍 Testing MongoDB Connection...\n');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lendify';

console.log('Connection String: ' + mongoURI.replace(/:[^:@]+@/, ':****@') + '\n');
console.log('Attempting to connect...\n');

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ SUCCESS! MongoDB connection established!\n');
  console.log('Your MongoDB connection is working correctly.\n');
  mongoose.connection.close();
  process.exit(0);
})
.catch((err) => {
  console.error('❌ FAILED! MongoDB connection error:\n');
  console.error(err.message);
  
  if (err.message.includes('authentication')) {
    console.error('\n💡 Issue: Authentication failed');
    console.error('   Solution: Check your password in .env files');
    console.error('   Run: npm run update:password\n');
  } else if (err.message.includes('timeout') || err.message.includes('buffering')) {
    console.error('\n💡 Issue: Connection timeout');
    console.error('   Possible causes:');
    console.error('   1. IP not whitelisted in MongoDB Atlas');
    console.error('   2. Network connectivity issues');
    console.error('   3. Incorrect connection string');
    console.error('\n   Check your MongoDB Atlas Network Access settings\n');
  } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
    console.error('\n💡 Issue: Cannot resolve hostname');
    console.error('   Solution: Check your connection string is correct');
    console.error('   Verify cluster address: cluster0.v8zubag.mongodb.net\n');
  }
  
  process.exit(1);
});


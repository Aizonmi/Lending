const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('\n🔍 Testing MongoDB Connection...\n');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lendify';

// Hide password in output
const safeURI = mongoURI.replace(/:[^:@]+@/, ':****@');
console.log('Connection String: ' + safeURI + '\n');
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
  
  if (err.message.includes('authentication') || err.message.includes('bad auth')) {
    console.error('\n💡 Issue: Authentication failed');
    console.error('   Solution: Check your password in .env files');
    console.error('   Run from root: npm run update:password\n');
    console.error('   Or manually edit .env files and replace <db_password> with your actual password\n');
  } else if (err.message.includes('timeout') || err.message.includes('buffering')) {
    console.error('\n💡 Issue: Connection timeout');
    console.error('   Possible causes:');
    console.error('   1. IP not whitelisted in MongoDB Atlas');
    console.error('      → Go to MongoDB Atlas → Network Access → Add IP Address');
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

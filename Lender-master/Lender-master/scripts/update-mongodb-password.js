const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔐 MongoDB Password Update Helper\n');
console.log('This script will update the password in all three .env files.\n');

rl.question('Enter your MongoDB Atlas password: ', (password) => {
  if (!password || password.trim() === '') {
    console.error('❌ Password cannot be empty!');
    rl.close();
    process.exit(1);
  }

  // URL encode the password (handle special characters)
  const encodedPassword = encodeURIComponent(password);
  
  // MongoDB URI template
  const uri = `mongodb+srv://zervic:${encodedPassword}@cluster0.v8zubag.mongodb.net/lendify?retryWrites=true&w=majority`;
  
  const envFolder = path.join(__dirname, '..', '.env');
  const files = [
    { name: 'MemberA.env', port: 5000 },
    { name: 'MemberB.env', port: 5001 },
    { name: 'MemberC.env', port: 5002 }
  ];

  console.log('\n📝 Updating .env files...\n');

  files.forEach((file) => {
    const filePath = path.join(envFolder, file.name);
    const content = `PORT=${file.port}\nMONGODB_URI=${uri}\nNODE_ENV=development\n`;
    
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${file.name}`);
    } catch (error) {
      console.error(`❌ Error updating ${file.name}:`, error.message);
    }
  });

  console.log('\n✅ All .env files updated successfully!');
  console.log('\n💡 Note: The password is URL-encoded to handle special characters.');
  console.log('🚀 You can now run: npm start\n');
  
  rl.close();
});


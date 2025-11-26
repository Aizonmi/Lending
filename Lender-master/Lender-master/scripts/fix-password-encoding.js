const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔐 MongoDB Password Encoding Fix\n');
console.log('If your password has special characters, they need to be URL-encoded.\n');
console.log('Common characters that need encoding:');
console.log('  @ → %40');
console.log('  # → %23');
console.log('  $ → %24');
console.log('  & → %26');
console.log('  / → %2F');
console.log('  : → %3A');
console.log('  ? → %3F');
console.log('  = → %3D');
console.log('  % → %25');
console.log('  space → %20\n');

rl.question('Enter your MongoDB Atlas password (will be automatically encoded): ', (password) => {
  if (!password || password.trim() === '') {
    console.error('❌ Password cannot be empty!');
    rl.close();
    process.exit(1);
  }

  // URL encode the password (handle special characters)
  const encodedPassword = encodeURIComponent(password);
  
  // Show what encoding was done
  if (password !== encodedPassword) {
    console.log('\n⚠️  Password contains special characters!');
    console.log(`   Original: ${password}`);
    console.log(`   Encoded:  ${encodedPassword}`);
    console.log('   Special characters have been URL-encoded.\n');
  }
  
  // MongoDB URI template
  const uri = `mongodb+srv://zervic:${encodedPassword}@cluster0.v8zubag.mongodb.net/lendify?retryWrites=true&w=majority`;
  
  const envFolder = path.join(__dirname, '..', '.env');
  const files = [
    { name: 'MemberA.env', port: 5000 },
    { name: 'MemberB.env', port: 5001 },
    { name: 'MemberC.env', port: 5002 }
  ];

  console.log('📝 Updating .env files with properly encoded password...\n');

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

  console.log('\n✅ All .env files updated with URL-encoded password!');
  console.log('\n💡 The startup script will copy these to backend folders.');
  console.log('🚀 You can now run: npm start\n');
  
  rl.close();
});


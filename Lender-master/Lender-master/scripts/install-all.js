const { spawn } = require('child_process');
const path = require('path');

console.log('📦 Installing dependencies for all services...\n');

const installCommands = [
  {
    name: 'Member A Backend',
    cwd: path.join(__dirname, '..', 'backend', 'member-a'),
  },
  {
    name: 'Member B Backend',
    cwd: path.join(__dirname, '..', 'backend', 'member-b'),
  },
  {
    name: 'Member C Backend',
    cwd: path.join(__dirname, '..', 'backend', 'member-c'),
  },
  {
    name: 'Frontend',
    cwd: path.join(__dirname, '..', 'frontend'),
  },
];

let completed = 0;

installCommands.forEach((cmd) => {
  console.log(`Installing dependencies for ${cmd.name}...`);
  
  const proc = spawn('npm', ['install'], {
    cwd: cmd.cwd,
    shell: true,
    stdio: 'inherit',
  });

  proc.on('exit', (code) => {
    completed++;
    if (code === 0) {
      console.log(`✅ ${cmd.name} dependencies installed\n`);
    } else {
      console.error(`❌ ${cmd.name} installation failed\n`);
    }

    if (completed === installCommands.length) {
      console.log('🎉 All dependencies installed!');
      process.exit(0);
    }
  });

  proc.on('error', (error) => {
    console.error(`Error installing ${cmd.name}:`, error.message);
    completed++;
    if (completed === installCommands.length) {
      process.exit(1);
    }
  });
});



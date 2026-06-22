const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const serverPath = path.join('c:', 'Users', 'rdh00', 'OneDrive', 'Desktop', 'CareerPilot', 'backend', 'server.js');

const child = exec(`node ${serverPath}`, { cwd: path.join('c:', 'Users', 'rdh00', 'OneDrive', 'Desktop', 'CareerPilot', 'backend') });

let output = '';

child.stdout.on('data', (data) => {
  output += data;
});

child.stderr.on('data', (data) => {
  output += data;
});

setTimeout(() => {
  child.kill();
  fs.writeFileSync(path.join('c:', 'Users', 'rdh00', 'OneDrive', 'Desktop', 'CareerPilot', 'backend', 'server_error.log'), output);
  console.log('Wrote to server_error.log');
}, 3000);

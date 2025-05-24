const { exec } = require('child_process');

const frontend = exec('cd frontend && npm start', { stdio: 'inherit' });
const backend = exec('cd backend && npm start', { stdio: 'inherit' });

frontend.stdout?.pipe(process.stdout);
frontend.stderr?.pipe(process.stderr);
backend.stdout?.pipe(process.stdout);
backend.stderr?.pipe(process.stderr);

process.on('exit', () => {
  frontend.kill();
  backend.kill();
});

const { exec } = require('child_process');
const os = require('os');

const port = process.env.PORT || 3000;
const platform = os.platform();

const killProcess = (pid) => {
  const killCmd = platform === 'win32' ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;
  exec(killCmd, (err) => {
    if (err) {
      console.log(`Failed to kill process on port ${port}`);
    } else {
      console.log(`Successfully freed port ${port}`);
    }
  });
};

if (platform === 'win32') {
  exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
    if (!stdout) return console.log(`Port ${port} is free.`);
    const lines = stdout.trim().split('\n');
    for (const line of lines) {
      if (line.includes(`:${port}`)) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
          console.log(`Killing process ${pid} on port ${port}...`);
          killProcess(pid);
          return;
        }
      }
    }
    console.log(`Port ${port} is free.`);
  });
} else {
  exec(`lsof -i :${port} -t`, (err, stdout) => {
    if (!stdout) return console.log(`Port ${port} is free.`);
    const pids = stdout.trim().split('\n');
    for (const pid of pids) {
      if (pid) {
        console.log(`Killing process ${pid} on port ${port}...`);
        killProcess(pid);
      }
    }
  });
}

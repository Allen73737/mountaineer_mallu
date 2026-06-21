const { execSync } = require('child_process');
try {
    const output = execSync('netstat -ano | findstr :5000').toString();
    const lines = output.split('\n');
    for (const line of lines) {
        if (line.includes('LISTENING')) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            console.log('Killing PID', pid);
            execSync(`taskkill /F /PID ${pid}`);
        }
    }
} catch (e) {
    console.error('Error:', e.message);
}

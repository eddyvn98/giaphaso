const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 1. Chạy Vite Server trên Port 3010
console.log('🚀 Đang khởi động Vite Server (Port 3010)...');
const vite = spawn('npm.cmd', ['run', 'dev'], { shell: true });

vite.stdout.on('data', (data) => console.log(`[Vite]: ${data}`));
vite.stderr.on('data', (data) => console.error(`[Vite Error]: ${data}`));

// 2. Chạy Cloudflare Tunnel
console.log('🌐 Đang kết nối Cloudflare Tunnel...');
const tunnel = spawn(path.join(process.cwd(), 'cloudflared.exe'), ['tunnel', '--url', 'http://localhost:3010'], { shell: true });

tunnel.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('trycloudflare.com')) {
        const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
        if (match) {
            const url = match[0];
            console.log('\n' + '='.repeat(50));
            console.log(`✅ GIA PHẢ ĐÃ ONLINE: ${url}`);
            console.log('='.repeat(50) + '\n');
            fs.writeFileSync('online_url.txt', url);
        }
    }
});

tunnel.stderr.on('data', (data) => {
    // Cloudflare log thường ở stderr
    const output = data.toString();
    if (output.includes('trycloudflare.com')) {
        const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
        if (match) {
            const url = match[0];
            console.log('\n' + '='.repeat(50));
            console.log(`✅ GIA PHẢ ĐÃ ONLINE: ${url}`);
            console.log('='.repeat(50) + '\n');
            fs.writeFileSync('online_url.txt', url);
        }
    }
});

const http = require('http');
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const mime = {
  '.html': 'text/html',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

http.createServer((q, r) => {
  let p = q.url === '/' ? 'index.html' : q.url.replace(/\/$/, '') + '.html';
  let f = path.join(dir, p);
  if (!fs.existsSync(f)) { r.writeHead(404); r.end(); return; }
  let ct = mime[path.extname(f)] || 'application/octet-stream';
  r.writeHead(200, { 'Content-Type': ct, 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-cache' });
  fs.createReadStream(f).pipe(r);
}).listen(3003, () => console.log('http://localhost:3003'));

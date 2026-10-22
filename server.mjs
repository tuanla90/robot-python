// Máy chủ tĩnh cho Railway và chạy thử trên máy: không cần build, không cần gói ngoài.
//   /          → Đường học (hoc/game/choi.html)
//   /tran      → Trận đấu (tran/choi-tran.html)
//   /nhan      → mockup sân robot đợt 1 (nhan/san-robot-dot-1.html)
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';

const root = resolve(fileURLToPath(new URL('./', import.meta.url)));
const thuMucMo = ['hoc', 'tran', 'nhan'].map((d) => resolve(root, d));
const port = Number(process.env.PORT || 4180);
const chuyen = {
  '/': '/hoc/game/choi.html',
  '/hoc': '/hoc/game/choi.html',
  '/tran': '/tran/choi-tran.html',
  '/nhan': '/nhan/san-robot-dot-1.html',
};
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};
const COMPRESSIBLE = new Set(['.css', '.html', '.js', '.json', '.svg']);

createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  const dich = chuyen[pathname.replace(/\/$/, '') || '/'];
  if (dich) {
    response.writeHead(302, { Location: dich }).end();
    return;
  }

  const file = resolve(root, `.${pathname}`);
  const ext = extname(file).toLowerCase();
  if (!types[ext] || !thuMucMo.some((d) => file.startsWith(`${d}${sep}`))) {
    response.writeHead(404).end('Not found');
    return;
  }

  let fileStat;
  try {
    fileStat = await stat(file);
    if (!fileStat.isFile()) throw new Error('Not a file');
  } catch {
    response.writeHead(404).end('Not found');
    return;
  }

  const canGzip = COMPRESSIBLE.has(ext) && /\bgzip\b/i.test(request.headers['accept-encoding'] || '');
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': types[ext],
    'X-Content-Type-Options': 'nosniff',
  };

  if (canGzip) {
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
    response.writeHead(200, headers);
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).pipe(createGzip()).pipe(response);
  } else {
    headers['Content-Length'] = fileStat.size;
    response.writeHead(200, headers);
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).pipe(response);
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Đội Robot Chấn Hưng: http://localhost:${port}`);
});

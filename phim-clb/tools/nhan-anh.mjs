// Máy nhận ảnh tạm (chỉ localhost): trang TopView trong trình duyệt tự gửi ảnh vừa sinh về đây bằng POST /<tên>.png,
// ảnh lưu vào phim-clb/tam-anh/. Chạy: node tools/nhan-anh.mjs  (cổng 4215), tắt khi xong.
import {createServer} from 'node:http';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {basename, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ra = resolve(dirname(fileURLToPath(import.meta.url)), '../tam-anh');
mkdirSync(ra, {recursive: true});
createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.end();
  // trang cầu nối: trang TopView (khác nguồn, bị chặn gọi localhost) mở trang này rồi postMessage {ten, blob}; trang này POST cùng nguồn
  // GET /gui/<tên>: trang này đọc ảnh tam-anh/<tên> rồi postMessage blob lên trang cha (TopView nhúng trang này trong iframe để lấy ảnh tham chiếu)
  if (req.method === 'GET' && req.url.startsWith('/tep/')) {
    try { const b = readFileSync(resolve(ra, basename(decodeURIComponent(req.url.slice(5))))); res.setHeader('Content-Type', 'image/jpeg'); return res.end(b); }
    catch { res.statusCode = 404; return res.end(); }
  }
  if (req.method === 'GET' && req.url.startsWith('/gui/')) {
    const ten = basename(decodeURIComponent(req.url.slice(5)));
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(`<!doctype html><meta charset="utf-8"><script>
      fetch('/tep/${ten}').then(r => r.blob()).then(b => parent.postMessage({ten: '${ten}', blob: b}, '*'));
    </script>`);
  }
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(`<!doctype html><meta charset="utf-8"><title>nhan-anh</title><p>Nhận ảnh…</p><script>
      addEventListener('message', async (e) => {
        const {ten, blob} = e.data || {};
        if (!ten || !blob) return;
        const r = await fetch('/' + encodeURIComponent(ten), {method: 'POST', body: blob});
        const t = await r.text(); document.body.append(ten + ': ' + t + ' · ');
        e.source && e.source.postMessage({ten, kq: t}, '*');
      });
      opener && opener.postMessage({san: true}, '*');
    </script>`);
  }
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  const ten = basename(decodeURIComponent(req.url || '')).replace(/[^\w.-]/g, '');
  if (!/\.(png|jpg|webp)$/.test(ten)) { res.statusCode = 400; return res.end('ten'); }
  const phan = [];
  req.on('data', (c) => phan.push(c));
  req.on('end', () => { const b = Buffer.concat(phan); writeFileSync(resolve(ra, ten), b); console.log('lưu', ten, b.length); res.end('ok ' + b.length); });
}).listen(4215, '127.0.0.1', () => console.log('nhận ảnh ở http://127.0.0.1:4215'));

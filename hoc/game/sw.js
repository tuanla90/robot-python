/* ============================================================================
   sw.js — "Đường học": SERVICE WORKER cho chơi KHÔNG CẦN MẠNG.
   Cài đặt: đọc choi.html, lấy mọi <script src> / <link href> (kể cả tệp ngoài hoc/game như ../san-hoc.js,
   ../../nhan/san-robot-core.js), đọc font/font.css lấy các tệp .woff2, rồi cất hết vào bộ đệm.
   Khi chạy: mọi yêu cầu GET cùng nguồn đi MẠNG TRƯỚC (luôn có bản mới nhất, chép đè vào bộ đệm);
   mất mạng hoặc mạng chậm quá HEN_MS thì lấy bản trong bộ đệm.
   Tệp mới trong choi.html tự được cất ở lần cài sau; đổi BAN khi muốn bỏ hẳn bộ đệm cũ.
   ========================================================================== */
'use strict';

var BAN = 'duong-hoc-v1';
var HEN_MS = 4000;
var THEM = ['choi.html', 'manifest.webmanifest', 'font/font.css', 'icon/icon-192.png', 'icon/icon-512.png', 'icon/icon-maskable-512.png'];

function dsTep(html, re) {
  var kq = [], m;
  while ((m = re.exec(html))) kq.push(m[1]);
  return kq;
}

async function catHet() {
  var c = await caches.open(BAN);
  var html = await (await fetch('choi.html', { cache: 'no-cache' })).text();
  var css = await (await fetch('font/font.css', { cache: 'no-cache' })).text();
  var ds = THEM
    .concat(dsTep(html, /<script src="([^"]+)"/g))
    .concat(dsTep(html, /<link [^>]*href="([^"]+)"/g))
    .concat(dsTep(css, /url\(([^)]+\.woff2)\)/g).map(function (f) { return 'font/' + f; }))
    .filter(function (u) { return !/^https?:/.test(u); });
  ds = ds.filter(function (u, i) { return ds.indexOf(u) === i; });
  await c.addAll(ds.map(function (u) { return new Request(u, { cache: 'no-cache' }); }));
}

self.addEventListener('install', function (ev) {
  ev.waitUntil(catHet().then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (ev) {
  ev.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== BAN; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (ev) {
  var rq = ev.request;
  if (rq.method !== 'GET' || new URL(rq.url).origin !== self.location.origin) return;
  ev.respondWith(mangTruoc(rq));
});

async function mangTruoc(rq) {
  var c = await caches.open(BAN);
  var mang = fetch(rq).then(function (r) {
    if (r && r.ok) c.put(rq, r.clone());
    return r;
  });
  mang.catch(function () { /* lỗi mạng xử lý ở dưới */ });
  var hen = new Promise(function (xong) { setTimeout(xong, HEN_MS, null); });
  try {
    var r = await Promise.race([mang, hen]);
    if (r) return r;
  } catch (e) { /* mất mạng: lấy bộ đệm */ }
  var cu = await c.match(rq, { ignoreSearch: true });
  if (cu) return cu;
  return mang;          // không có trong bộ đệm: chờ mạng tiếp (hoặc báo lỗi mạng như bình thường)
}

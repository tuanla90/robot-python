/* kiem-ban-on-thi.mjs — GĐ 3 gộp diem10code-python (17/11): HAI BẢN trên một lõi, một giao diện.
   Bản đầy đủ (game/choi.html, 9 mùa) và bản Ôn thi THPT (game/on-thi.html, 5 mùa, nội dung hoc/on-thi/) chạy chung
   san-hoc.js, cham.js, kho-ham.js, game/*.js; chỗ khác nhau đọc ở ban.js (window.Ban). Máy này giữ hai bản tách nhau:
     1. Bản Ôn thi: 160 màn, lời giải đủ 3 sao, đủ luật khuôn (chạy hoc/on-thi/kiem-khuon.mjs ở tiến trình riêng, BAN_GAME = 'on-thi').
     2. Bản Ôn thi không dạy thứ của bản đầy đủ: không act(, không dict, không list 2 chiều, không tuple trong code mẫu / lời giải.
     3. Hàm gốc: bản đầy đủ không có pick / drop / seed (không đặt BAN_GAME thì như cũ); bản Ôn thi có.
     4. Kho lưu tách: luu.js của bản Ôn thi ghi 'on-thi:…', không đụng 'duong-hoc:…' của bản đầy đủ, và ngược lại.
     5. Trang: on-thi.html đặt BAN_GAME trước ban.js, ban.js ngay sau bang-mau.js, chỉ nạp nội dung ../on-thi/; choi.html không đặt BAN_GAME;
        mọi script hai trang nạp đều có trên đĩa.
     6. Cửa vào (18/11): chon-ban.html dẫn tới hai bản; server.mjs, index.html, manifest vào trang chọn bản; sw.js cất cả ba trang.
   Chạy: node hoc/kiem-ban-on-thi.mjs   (npm test chạy cùng các máy kiem-*.mjs khác) */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HOC = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.join(HOC, 'game');
let dat = 0, hong = 0;
function ok(dk, ten, chiTiet) {
  if (dk) { dat++; return; }
  hong++; console.log('  HỎNG ' + ten + (chiTiet ? ': ' + chiTiet : ''));
}

/* Phần chạy ở tiến trình con với BAN_GAME = 'on-thi' (require lưu đệm theo tiến trình, nên mỗi bản một tiến trình). */
if (process.argv[2] === '--on-thi') {
  globalThis.BAN_GAME = 'on-thi';
  const require = createRequire(import.meta.url);
  const Ban = require('./ban.js');
  const KhoHam = require('./kho-ham.js');
  const ManHoc = require('./on-thi/lo-trinh-hoc.js');
  const ds = ManHoc.danhSach;
  const tom = { ban: Ban.ma, hamGoc: KhoHam.HAM_GOC_BAN, soMan: ds.length, loi: [] };
  const CAM = [
    [/\bact\s*\(/, 'act()'],
    [/\[\s*\[/, 'list 2 chiều'],
    [/(=|\(|,|return)\s*\{/, 'dict'],
    [/(=|return|in)\s*\(\s*[^()]*,[^()]*\)\s*(:|$)/m, 'tuple']
  ];
  for (const m of ds) {
    const doan = [];
    const them = (x) => { if (Array.isArray(x)) doan.push(...x.map(String)); else if (typeof x === 'string') doan.push(x); };
    for (const k of ['loiGiai', 'maMau']) {
      const b = m[k]; if (!b) continue;
      them(b.chinh);
      for (const f of [...(b.hamCuaMan || []), ...(b.hamCuaEmMoi || [])]) them(f.than);
    }
    for (const d of doan) for (const [re, ten] of CAM) if (re.test(d)) tom.loi.push(`${m.ma}: ${ten} trong "${d.trim().slice(0, 60)}"`);
    if (m.banOnThi !== true) tom.loi.push(`${m.ma}: thiếu banOnThi`);
  }
  console.log(JSON.stringify(tom));
  process.exit(0);
}

console.log('kiem-ban-on-thi: hai bản trên một lõi');

/* 1. 160 màn bản Ôn thi đủ luật khuôn */
{
  const r = spawnSync(process.execPath, [path.join(HOC, 'on-thi', 'kiem-khuon.mjs')], { encoding: 'utf8', maxBuffer: 64 << 20 });
  const ra = (r.stdout || '') + (r.stderr || '');
  const dong = ra.trim().split('\n').pop();
  ok(r.status === 0 && /160 màn, 0 lỗi/.test(ra), 'on-thi/kiem-khuon.mjs (160 màn, 0 lỗi)', dong);
}

/* 2, 3a. Bản Ôn thi: không thứ của bản đầy đủ; có pick / drop / seed */
{
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--on-thi'], { encoding: 'utf8', maxBuffer: 64 << 20 });
  let tom = null;
  try { tom = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch (e) { /* báo dưới */ }
  ok(!!tom, 'tiến trình bản Ôn thi chạy được', (r.stderr || '').slice(0, 300));
  if (tom) {
    ok(tom.ban === 'on-thi', 'BAN_GAME = on-thi thì Ban.ma = on-thi', tom.ban);
    ok(tom.soMan === 160, 'bản Ôn thi có 160 màn', String(tom.soMan));
    ok(['pick', 'drop', 'seed'].every((h) => tom.hamGoc.includes(h)), 'bản Ôn thi có hàm gốc pick / drop / seed');
    ok(!tom.hamGoc.includes('act'), 'bản Ôn thi không có act()');
    ok(tom.loi.length === 0, 'code bản Ôn thi không có act() / dict / list 2 chiều / tuple', tom.loi.slice(0, 5).join(' · '));
  }
}

/* 3b. Bản đầy đủ: không đặt BAN_GAME thì như cũ */
{
  const require = createRequire(import.meta.url);
  const Ban = require('./ban.js');
  const KhoHam = require('./kho-ham.js');
  ok(Ban.ma === 'day-du' && !Ban.laOnThi && Ban.tienToKho === 'duong-hoc:', 'không đặt BAN_GAME thì là bản đầy đủ');
  ok(KhoHam.HAM_GOC_BAN === KhoHam.HAM_GOC_MAC_DINH, 'bản đầy đủ dùng HAM_GOC_MAC_DINH');
  ok(!['pick', 'drop', 'seed'].some((h) => KhoHam.HAM_GOC_MAC_DINH.includes(h)), 'bản đầy đủ không có pick / drop / seed');
}

/* 4. Kho lưu tách: chạy luu.js trong một window giả, chung một localStorage */
{
  const mem = {};
  const ls = {
    getItem: (k) => (Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null),
    setItem: (k, v) => { mem[k] = String(v); },
    removeItem: (k) => { delete mem[k]; },
    key: (i) => Object.keys(mem)[i] ?? null,
    get length() { return Object.keys(mem).length; }
  };
  const nap = (banGame) => {
    const win = { localStorage: ls, BAN_GAME: banGame, console };
    win.window = win; win.globalThis = win;
    const ctx = vm.createContext(win);
    vm.runInContext(fs.readFileSync(path.join(HOC, 'ban.js'), 'utf8'), ctx, { filename: 'ban.js' });
    vm.runInContext(fs.readFileSync(path.join(GAME, 'luu.js'), 'utf8'), ctx, { filename: 'luu.js' });
    return win;
  };
  let loi = null, wDu = null, wOt = null;
  try { wDu = nap(undefined); wOt = nap('on-thi'); } catch (e) { loi = e.message; }
  ok(!loi && wDu && wDu.Luu && wOt && wOt.Luu, 'luu.js chạy được ở cả hai bản', loi);
  if (wDu && wOt && wDu.Luu && wOt.Luu) {
    wDu.Luu.kho.setItem('duong-hoc:thu-tach', 'day-du');
    wOt.Luu.kho.setItem('duong-hoc:thu-tach', 'on-thi');
    ok(mem['duong-hoc:thu-tach'] === 'day-du', 'bản Ôn thi không ghi đè khóa duong-hoc: của bản đầy đủ', mem['duong-hoc:thu-tach']);
    ok(mem['on-thi:thu-tach'] === 'on-thi', 'bản Ôn thi ghi vào khóa on-thi:', mem['on-thi:thu-tach']);
    ok(wOt.Luu.kho.getItem('duong-hoc:thu-tach') === 'on-thi' && wDu.Luu.kho.getItem('duong-hoc:thu-tach') === 'day-du', 'mỗi bản đọc lại đúng giá trị của mình');
    const khoaOt = []; for (let i = 0; i < wOt.Luu.kho.length; i++) khoaOt.push(wOt.Luu.kho.key(i));
    ok(khoaOt.every((k) => k.startsWith('duong-hoc:')) && khoaOt.includes('duong-hoc:thu-tach') && khoaOt.length === Object.keys(mem).filter((k) => k.startsWith('on-thi:')).length,
      'key() / length của bản Ôn thi chỉ thấy khóa của mình', khoaOt.join(', '));
    wOt.Luu.kho.removeItem('duong-hoc:thu-tach');
    ok(mem['duong-hoc:thu-tach'] === 'day-du' && !('on-thi:thu-tach' in mem), 'removeItem bản Ôn thi chỉ xóa khóa của mình');
  }
}

/* 5. Hai trang */
{
  const doc = (f) => fs.readFileSync(path.join(GAME, f), 'utf8');
  const scripts = (h) => [...h.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map((x) => ({ src: (/src="([^"]+)"/.exec(x[1]) || [])[1] || null, ma: x[2] }));
  const ot = scripts(doc('on-thi.html')), du = scripts(doc('choi.html'));
  for (const [ten, ds] of [['on-thi.html', ot], ['choi.html', du]]) {
    const thieu = ds.filter((s) => s.src && !/^https?:/.test(s.src)).map((s) => s.src.split('?')[0]).filter((s) => !fs.existsSync(path.join(GAME, s)));
    ok(thieu.length === 0, ten + ': mọi script có trên đĩa', thieu.join(', '));
    const coSrc = ds.filter((s) => s.src).map((s) => s.src);
    ok(coSrc[0] === 'bang-mau.js' && coSrc[1] === '../ban.js', ten + ': bang-mau.js rồi ../ban.js là hai script đầu tiên có src (trước mọi tệp đọc window.Ban)', coSrc.slice(0, 3).join(', '));
  }
  const iDat = ot.findIndex((s) => !s.src && /BAN_GAME\s*=\s*'on-thi'/.test(s.ma));
  const iBanOt = ot.findIndex((s) => s.src && /ban\.js/.test(s.src));
  ok(iDat >= 0 && iDat < iBanOt, "on-thi.html đặt window.BAN_GAME = 'on-thi' trước ban.js");
  ok(!du.some((s) => /BAN_GAME/.test(s.ma)), 'choi.html không đặt BAN_GAME');
  const noiDungDu = ot.filter((s) => s.src && /^\.\.\/(man-|lo-trinh-hoc|thu-tu-chuong|gioi-thieu-part)/.test(s.src)).map((s) => s.src);
  ok(noiDungDu.length === 0, 'on-thi.html không nạp nội dung bản đầy đủ', noiDungDu.join(', '));
  ok(ot.some((s) => s.src === '../on-thi/lo-trinh-hoc.js'), 'on-thi.html nạp ../on-thi/lo-trinh-hoc.js');
  ok(!du.some((s) => s.src && /on-thi\//.test(s.src)), 'choi.html không nạp nội dung bản Ôn thi');
}

/* 6. Cửa vào (18/11): trang chọn bản là cửa vào duy nhất, dẫn tới đủ hai bản; bộ đệm không mạng có cả ba trang */
{
  const GOC = path.dirname(HOC);
  const doc = (f) => fs.readFileSync(f, 'utf8');
  const cb = doc(path.join(GAME, 'chon-ban.html'));
  const href = [...cb.matchAll(/<a class="the[^"]*" href="([^"]+)" data-ban="([^"]+)"/g)].map((x) => x[2] + '=' + x[1]).sort().join(' ');
  ok(href === 'day-du=choi.html on-thi=on-thi.html', 'chon-ban.html: hai thẻ, day-du → choi.html, on-thi → on-thi.html', href);
  ok(/data-sao="on-thi:tien-do"/.test(cb) && /data-sao="duong-hoc:tien-do"/.test(cb), 'chon-ban.html đọc sao của mỗi bản ở khóa của bản đó');
  ok(/chon-ban:cuoi/.test(cb) && /chon-ban:cuoi/.test(doc(path.join(GAME, 'man-dau.js'))), 'trang chọn bản và trang đầu mỗi bản cùng ghi / đọc khóa chon-ban:cuoi');
  const sv = doc(path.join(GOC, 'server.mjs'));
  ok(/'\/':\s*'\/hoc\/game\/chon-ban\.html'/.test(sv) && /'\/hoc':\s*'\/hoc\/game\/chon-ban\.html'/.test(sv), 'server.mjs: / và /hoc vào trang chọn bản');
  ok(/location\.replace\('hoc\/game\/chon-ban\.html'\)/.test(doc(path.join(GOC, 'index.html'))), 'index.html chuyển vào trang chọn bản');
  ok(JSON.parse(doc(path.join(GAME, 'manifest.webmanifest'))).start_url === 'chon-ban.html', 'manifest: start_url là trang chọn bản');
  const trang = /var TRANG = \[([^\]]*)\]/.exec(doc(path.join(GAME, 'sw.js')));
  ok(!!trang && ['chon-ban.html', 'choi.html', 'on-thi.html'].every((t) => trang[1].includes("'" + t + "'")), 'sw.js cất cả ba trang (và script của chúng) cho chơi không mạng', trang && trang[1]);
}

console.log(`ĐẠT ${dat} · HỎNG ${hong}`);
process.exit(hong ? 1 : 0);

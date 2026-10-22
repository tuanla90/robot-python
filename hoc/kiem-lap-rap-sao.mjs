/* ============================================================================
   kiem-lap-rap-sao.mjs — máy kiểm SAO "NHANH HOẶC RẺ" và danh sách CÁCH LẮP KHÔNG QUA của ba chương lắp ráp (22/10).
     1. mỗi màn lắp ráp có sao.re = { gia, o }: gia = giá cách lắp mẫu rẻ nhất, cách đó thắng 3 sao với ô ≤ re.o; cachLap[0] vẫn 3 sao;
     2. lapRap.khongQua: mỗi mục khớp ít nhất một cách lắp vừa ngân sách, có lý do; mọi cách khớp được bộ dò chứng minh KHÔNG có đường thắng
        (dò hết trạng thái, không bị cắt); cách nào bộ dò chứng minh không thắng nổi thì phải có trong khongQua (người chơi được báo);
     3. máy chấm: chạy hỏng với cách lắp không qua → chẩn đoán 'lap-khong-qua' đứng đầu, kèm lý do; cách khác không bao giờ có chẩn đoán này;
        lắp rẻ thì sao thứ ba có ngay, ngưỡng ô = max(sao.o, re.o);
     4. giao diện: bảng thắng dùng nguongO và dòng "Rẻ", màn Lắp robot nói luật sao thứ ba.
   Bộ dò: do-duong-rap-du.mjs (chạy thật SanHoc). Cách thắng được thường dò lâu (tới hàng chục giây) nên chỉ dò tới TRAN trạng thái: bị cắt thì
   "chưa rõ" (không trượt), vì bằng chứng "không thắng nổi" chỉ có khi dò hết.
   Chạy: node hoc/kiem-lap-rap-sao.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const LapRap = require(path.join(day, 'lap-rap.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
let ManHoc = null;
for (const f of fs.readdirSync(day).filter((x) => /^man-.*[.]js$/.test(x)).sort()) {
  try { ManHoc = require(path.join(day, f)); } catch (e) { /* bỏ qua */ }
}
const DD = await import('./do-duong-rap-du.mjs');
const TRAN = 8000;

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) dat++;
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const ds = ManHoc.danhSach.filter((m) => m.lapRap);
const khop = (k, c) => ['than', 'tay', 'camBien'].every((kh) => !(kh in k) || (k[kh] || null) === (c[kh] || null));

console.log('1. sao.re');
kiem('30 màn lắp ráp', ds.length === 30, ds.length);
for (const m of ds) {
  const re = m.sao && m.sao.re;
  kiem(m.ma + ': có sao.re { gia, o }', !!re && Number.isInteger(re.gia) && Number.isInteger(re.o), J(m.sao));
  if (!re) continue;
  const tk = LapRap.thongKeMau(m);
  const reNhat = tk.slice().sort((a, b) => a.gia - b.gia)[0];
  kiem(m.ma + ': re.gia = giá cách mẫu rẻ nhất (' + reNhat.ten + ')', re.gia === reNhat.gia, re.gia + ' / ' + reNhat.gia);
  kiem(m.ma + ': cách mẫu rẻ nhất thắng 3 sao, ô ≤ re.o', reNhat.thang && reNhat.sao === 3 && reNhat.o <= re.o, J(reNhat));
  kiem(m.ma + ': cachLap[0] vẫn 3 sao', tk[0].thang && tk[0].sao === 3, J(tk[0]));
  kiem(m.ma + ': re.gia vừa ngân sách', re.gia <= m.lapRap.nganSach);
}

console.log('2. cách lắp không qua');
let soChuaRo = 0, soDo = 0;
const t0 = Date.now();
for (const m of ds) {
  const kq = m.lapRap.khongQua || [];
  const cach = LapRap.dsCachLap(m);
  const md = LapRap.cachMacDinh(m), qua = cach.filter((c) => !kq.some((k) => khop(k, c)));
  kiem(m.ma + ': cách chọn sẵn (' + LapRap.moTa(md) + ') vừa ngân sách, không nằm trong khongQua, rẻ nhất trong các cách qua được',
    LapRap.kiemCachLap(m, md).ok && !LapRap.khongQua(m, md) && !kq.some((k) => khop(k, md)) && LapRap.giaCach(md) === Math.min(...qua.map((c) => c.gia)), J(md));
  for (const k of kq) {
    kiem(m.ma + ': khongQua ' + J(k) + ' có lý do, khớp ≥ 1 cách lắp vừa ngân sách', !!k.lyDo && !/[()]/.test(k.lyDo) && cach.some((c) => khop(k, c)));
  }
  for (const c of cach) {
    const trong = kq.some((k) => khop(k, c));
    const r = DD.nhipCachLap(m, c, { toiDaNhip: 80, toiDaTrangThai: TRAN, toiDaGiay: 20 });
    soDo++;
    const chungMinhKhong = !r.giaiDuoc && !r.catNgang;
    if (trong) kiem(m.ma + ': ' + LapRap.moTa(c) + ' nằm trong khongQua nên bộ dò phải chứng minh không thắng nổi', chungMinhKhong, J({ nhip: r.nhip, catNgang: r.catNgang }));
    else {
      kiem(m.ma + ': ' + LapRap.moTa(c) + ' không thắng nổi thì phải có trong khongQua', !chungMinhKhong);
      if (!r.giaiDuoc && r.catNgang) soChuaRo++;
    }
  }
}
console.log('   dò ' + soDo + ' cách lắp trong ' + Math.round((Date.now() - t0) / 1000) + ' giây; ' + soChuaRo + ' cách thắng được nhưng dò bị cắt (chưa rõ nhịp)');

console.log('3. máy chấm');
for (const m of ds) {
  for (const c of LapRap.dsCachLap(m)) {
    const a = LapRap.apDung(m, c);
    const r = ChamHoc.cham(a, { chinh: ['wait()'], hamCuaMan: [] }, []);
    const trong = (m.lapRap.khongQua || []).some((k) => khop(k, c));
    const co = r.chanDoan.some((x) => x.ma === 'lap-khong-qua');
    kiem(m.ma + ' ' + LapRap.moTa(c) + ': chẩn đoán lap-khong-qua ' + (trong ? 'đứng đầu' : 'không có'), trong ? r.chanDoan[0].ma === 'lap-khong-qua' && r.chanDoan[0].muc === 'loi' : !co, J(r.chanDoan.map((x) => x.ma)));
  }
}
{ // lắp rẻ: sao thứ ba có ngay; lắp đắt mà chậm: không có
  const m = ds.find((x) => x.ma === 'rap-nao.1');
  const re = m.lapRap.cachLap.find((c) => c.than === 'hai-banh'), nhanh = m.lapRap.cachLap[0];
  const kho = LapRap.khoMau(m);
  const rRe = ChamHoc.cham(LapRap.apDung(m, re), { chinh: re.loiGiai.chinh.slice(), hamCuaMan: [] }, kho);
  kiem('rap-nao.1 hai bánh 2 xu: thắng, lắp rẻ, 3 sao, ngưỡng ô = re.o', rRe.thang && rRe.re === true && rRe.sao === 3 && rRe.nguongO === m.sao.re.o, J({ sao: rRe.sao, re: rRe.re, o: rRe.nguongO }));
  const cham = (ch) => ChamHoc.cham(LapRap.apDung(m, nhanh), { chinh: ch, hamCuaMan: [] }, kho);
  const rNhanh = cham(nhanh.loiGiai.chinh.slice());
  kiem('rap-nao.1 bánh xích 3 xu: không phải lắp rẻ, ngưỡng ô = sao.o', rNhanh.re === false && rNhanh.nguongO === m.sao.o && rNhanh.sao === 3);
  const rCham = cham(['turn_left()', 'move()', 'turn_right()', 'forward(3)', 'turn_right()', 'move()']);
  kiem('rap-nao.1 bánh xích đi đường vòng (chậm): mất sao thứ ba', !rCham.thang || rCham.sao < 3, J({ thang: rCham.thang, sao: rCham.sao, nhip: rCham.soNhip }));
}
{ // màn thường không bị đụng: không có re, nguongO = sao.o
  const m = ManHoc.danhSach.find((x) => x.ma === 'hai-banh.2');
  const r = ChamHoc.cham(m, m.loiGiai, []);
  kiem('màn thường: re false, nguongO = sao.o, 3 sao như cũ', r.re === false && r.nguongO === m.sao.o && r.sao === 3, J({ re: r.re, o: r.nguongO, sao: r.sao }));
}

console.log('4. giao diện');
const choi = fs.readFileSync(path.join(day, 'game', 'man-choi.js'), 'utf8');
kiem('bảng thắng dùng nguongO và dòng thang.re', choi.includes('k.nguongO') && choi.includes("t('thang.re'") && choi.includes("'thang.thieuNhipRe'"));
const lap = fs.readFileSync(path.join(day, 'game', 'man-lap.js'), 'utf8');
kiem('màn Lắp robot nói luật sao thứ ba', lap.includes("t('lap.saoRe'"));
const chu = fs.readFileSync(path.join(day, 'game', 'chu.js'), 'utf8');
for (const k of ['thang.re', 'thang.hoacRe', 'thang.thieuNhipRe', 'lap.saoRe']) kiem('chu.js có ' + k, chu.includes("'" + k + "'"));

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

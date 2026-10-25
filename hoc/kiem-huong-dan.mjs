/* ============================================================================
   kiem-huong-dan.mjs — máy kiểm HƯỚNG DẪN TỪNG BƯỚC CHO TỪNG MÀN ("Robot Chấn Hưng", game/huong-dan-man.js + khung game/huong-dan.js).
   Kiểm:
   - mọi mã màn trong window.HuongDanMan là màn có thật; các màn làm quen có thao tác mới đều có hướng dẫn (danh sách PHAI_CO), kể cả màn nhiều sân đầu tiên;
   - mỗi bước đúng dạng: khóa hợp lệ, `dich` đúng cú pháp (nut: / khoi: / dong: / x: / so: / bộ chọn CSS, hay function trả về đích hợp lệ khi gọi trong môi trường rỗng),
     `chu` là câu ngắn (≤ 120 ký tự, không gạch dài), `xong` là 'bam' / sự kiện CÓ THẬT trong game / function / { su, khi } / mảng, `huong` hợp lệ;
   - bước nào cũng có lối thoát (không chặn người chơi): xong, hạn `han`, hoặc `daLam`; bước xong bằng 'bam' / sự kiện mà không có han / daLam chỉ được là việc bắt buộc (Chạy, Thử, Về sân…);
   - mọi sự kiện mà bước chờ đều được game báo (HuongDan.bao / baoHd trong thanh-phan.js, xuong-ham.js, man-choi.js);
   - khung: HuongDan.vaoMan lấy bước từ HuongDanMan, man.huongDan được ưu tiên, xongMan dừng chuỗi và lưu cờ, `daLam` làm bước tự qua;
   - game/choi.html nạp huong-dan-man.js sau các tệp màn, trước man-choi.js.
   Chạy: node hoc/kiem-huong-dan.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
for (const f of ['thu-tu-chuong', 'so-lenh', 'man-chuoi-1']) require(path.join(day, f + '.js'));
for (const f of fs.readdirSync(day).filter((f) => /^man-.*\.js$/.test(f)).sort()) require(path.join(day, f));          // MỌI tệp màn (kể cả chương mới)
// Hướng dẫn đi cùng game xuất bản, không đi cùng thứ tự ngân hàng bài gốc.
const ManHoc = require(path.join(day, 'lo-trinh-hoc.js'));
const doc = (f) => fs.readFileSync(path.join(day, 'game', f), 'utf8');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}

/* ---------------------------------------------------------------- nạp huong-dan.js + huong-dan-man.js trong môi trường rỗng */
const luuGia = { co: {}, daXem(k) { return !!this.co[k]; }, datDaXem(k) { this.co[k] = true; return true; } };
const rong = () => null;
const docGia = { addEventListener() {}, getElementById: rong, querySelector: rong, querySelectorAll: () => [], createElement: () => ({ style: {}, appendChild() {}, classList: { add() {}, remove() {}, contains: () => false } }), head: null };
const ctx = vm.createContext({ console, document: docGia, Luu: luuGia, setTimeout, clearTimeout });
ctx.window = ctx;
vm.runInContext(doc('huong-dan.js'), ctx, { filename: 'huong-dan.js' });
vm.runInContext(doc('huong-dan-man.js'), ctx, { filename: 'huong-dan-man.js' });
const HuongDan = ctx.HuongDan, HDM = ctx.HuongDanMan;
const maCo = Object.keys(HDM || {});

console.log('== 1. HuongDanMan: màn có thật, màn làm quen đều có hướng dẫn ==');
kiem('huong-dan-man.js đặt window.HuongDanMan (mã màn → mảng bước)', !!HDM && typeof HDM === 'object' && maCo.length > 0 && maCo.every((m) => Array.isArray(HDM[m]) && HDM[m].length > 0));
const khongCo = maCo.filter((m) => !ManHoc.timMa(m));
kiem('mọi mã trong HuongDanMan là màn có thật (ManHoc.timMa)', khongCo.length === 0, khongCo.join(', '));
const PHAI_CO = ['hai-banh.1', 'hai-banh.2', 'hai-banh.10', 'xuong-ham.1', 'xuong-ham.2', 'xuong-ham.3', 'che-xe.1', 'che-xe.4', 'tay-gap.1', 'tay-gap.5',
  'vong-lap.1', 'vong-lap.2', 'vong-lap.3', 'vong-lap.8', 'khoang-cach.1', 'khoang-cach.2', 'che-cam-bien.5', 'nhen.2', 'nhen.3', 'sung-hoi.1', 'sung-hoi.2', 'sung-hoi.4', 'che-sung-hoi.1', 'che-sung-hoi.2', 'list.1', 'che-list.1', 'che-list.4'];
const thieu = PHAI_CO.filter((m) => !HDM[m]);
kiem('có hướng dẫn cho các màn có thao tác mới (nút Chạy / chèn khối / xóa / kéo / Xưởng / thụt lề / for / if / while / đếm)', thieu.length === 0, thieu.join(', '));
const thuTu = ctx.ThuTuChuong || require(path.join(day, 'thu-tu-chuong.js'));
const sapXep = ManHoc.danhSach.slice().sort((a, b) => (thuTu.thuTu.indexOf(a.chuong) - thuTu.thuTu.indexOf(b.chuong)) || (a.so - b.so));
const nhieuSanDau = sapXep.find((m) => Array.isArray(m.san[0]));
kiem('màn nhiều sân ĐẦU TIÊN (theo thứ tự chương) có hướng dẫn dải chọn sân (.sanbar)', !!nhieuSanDau && !!HDM[nhieuSanDau.ma] && HDM[nhieuSanDau.ma].some((b) => b.dich === '.sanbar'), nhieuSanDau && nhieuSanDau.ma);
kiem('bảng Gỡ lỗi (go-loi.js) không có hướng dẫn (HuongDanMan không đụng tới, go-loi không chạy chuỗi nào); chỉ được TẮT hướng dẫn khi Mở hết (HuongDan.dung, tatHuongDan)', !maCo.some((m) => /go-loi/.test(m)) && !/HuongDan\.(chay|bao|vaoMan)/.test(doc('go-loi.js')) && /tatHuongDan/.test(doc('go-loi.js')) && /GoLoi\.tatHuongDan\(\)\) return null/.test(doc('huong-dan.js')));

console.log('\n== 2. Từng bước đúng dạng ==');
const SU_KIEN = new Set(['chen-khoi', 'chon-dong', 'xoa-dong', 'hoan-tac', 'doi-cho', 'doi-bac', 'doi-so', 'doi-the', 'doi-xe', 'chay', 'xem-san', 'mo-xuong', 'tao-ham', 'thu', 'dong-xuong']);
const KHOA_BUOC = new Set(['dich', 'chu', 'xong', 'huong', 'han', 'neo', 'rong', 'xuong', 'khongAn', 'phu', 'daLam']);
const RE_DICH = [/^nut:[\w-]+$/, /^khoi:(?:(?:em|goc|man|dk|vong|bien|dem):)?[\w=-]+$/, /^(?:dong|x):\d+$/, /^so:\d+(?::\d+)?$/, /^[.#\[].+/];
const dichHopLe = (s) => typeof s === 'string' && RE_DICH.some((re) => re.test(s));
const dsDichHopLe = (d) => dichHopLe(d) || (Array.isArray(d) && d.length > 0 && d.every((x) => dichHopLe(x) || typeof x === 'function'));
const xongHopLe = (x) => x === undefined || x === 'bam' || (typeof x === 'string' && SU_KIEN.has(x)) || typeof x === 'function'
  || (x && typeof x === 'object' && !Array.isArray(x) && SU_KIEN.has(x.su)) || (Array.isArray(x) && x.length > 0 && x.every((y) => xongHopLe(y) && y !== undefined));
const loi = [], suDung = new Set(), thoatKem = [];
let tongBuoc = 0;
for (const ma of maCo) {
  HDM[ma].forEach((b, i) => {
    tongBuoc++;
    const ten = ma + ' bước ' + (i + 1);
    const khoaLa = Object.keys(b).filter((k) => !KHOA_BUOC.has(k));
    if (khoaLa.length) loi.push(ten + ': khóa lạ ' + khoaLa.join(','));
    // đích
    let d = b.dich;
    if (typeof d === 'function') {
      try { d = d(); } catch (e) { loi.push(ten + ': dich() ném lỗi trong môi trường rỗng: ' + e.message); d = null; }
      if (!(d === null || d === undefined || (Array.isArray(d) && d.every((x) => dichHopLe(x) || (x && typeof x === 'object'))) || dichHopLe(d) || (d && typeof d === 'object'))) loi.push(ten + ': dich() trả về ' + JSON.stringify(d));
    } else if (!dsDichHopLe(d)) loi.push(ten + ': dich không hợp lệ ' + JSON.stringify(b.dich));
    // lời
    let chu = b.chu;
    if (typeof chu === 'function') { try { chu = chu(); } catch (e) { loi.push(ten + ': chu() ném lỗi: ' + e.message); chu = ''; } }
    if (typeof chu !== 'string' || !chu.trim()) loi.push(ten + ': chu rỗng');
    else {
      if (chu.length > 120) loi.push(ten + ': lời dài ' + chu.length + ' ký tự: ' + chu);
      if (/—|–/.test(chu)) loi.push(ten + ': có gạch dài trong lời');
    }
    // xong / han / huong / rong
    if (!xongHopLe(b.xong)) loi.push(ten + ': xong không hợp lệ ' + JSON.stringify(b.xong));
    const ds = Array.isArray(b.xong) ? b.xong : [b.xong];
    ds.forEach((x) => { if (typeof x === 'string' && x !== 'bam') suDung.add(x); else if (x && typeof x === 'object' && typeof x !== 'function') suDung.add(x.su); });
    if (b.han !== undefined && !(typeof b.han === 'number' && (b.han === 0 || b.han >= 3000 && b.han <= 120000))) loi.push(ten + ': han phải là 0 (đợi thao tác) hoặc 3–120 giây ' + b.han);
    if (b.huong !== undefined && !(typeof b.huong === 'function' || ['tren', 'duoi', 'auto'].includes(b.huong))) loi.push(ten + ': huong lạ ' + b.huong);
    if (typeof b.huong === 'function') { try { const h = b.huong(); if (h !== undefined && !['tren', 'duoi', 'auto'].includes(h)) loi.push(ten + ': huong() trả về ' + h); } catch (e) { loi.push(ten + ': huong() ném lỗi: ' + e.message); } }
    if (b.rong !== undefined && !(typeof b.rong === 'number' && b.rong >= 100 && b.rong <= 200)) loi.push(ten + ': rong ngoài 100–200 ' + b.rong);
    if (b.daLam !== undefined) { if (typeof b.daLam !== 'function') loi.push(ten + ': daLam không phải function'); else { try { b.daLam(); } catch (e) { loi.push(ten + ': daLam() ném lỗi: ' + e.message); } } }
    if (typeof b.xong === 'function') { try { b.xong('chen-khoi', { dong: 0 }); } catch (e) { loi.push(ten + ': xong() ném lỗi: ' + e.message); } }
    // lối thoát
    if (b.han === undefined && b.daLam === undefined && b.xong === undefined) loi.push(ten + ': không có lối thoát (xong / han / daLam)');
    if (b.han === undefined && b.daLam === undefined) thoatKem.push({ ten, xong: b.xong, dich: b.dich });
  });
}
kiem('mỗi bước: khóa hợp lệ, dich đúng cú pháp (function gọi được trong môi trường rỗng), lời ≤ 120 ký tự không gạch dài, xong / han / huong / rong hợp lệ (' + tongBuoc + ' bước, ' + maCo.length + ' màn)', loi.length === 0, loi.join(' | '));
// bước chỉ có xong (không han, không daLam): chỉ được là việc bắt buộc chạy chương trình / Thử / Về sân (dich 'nut:…') hoặc bước đã có lối thoát khác
const BAT_BUOC = /^nut:(chay|thu|ve)$|^nut:chay$/;
const treo = thoatKem.filter((x) => !(typeof x.dich === 'string' && BAT_BUOC.test(x.dich)) && !(Array.isArray(x.dich) && x.dich.every((s) => typeof s === 'string' && /^nut:(chay|nhip)$/.test(s))));
kiem('bước không có han / daLam chỉ là bước bấm Chạy / Nhịp / Thử / Về sân (việc bắt buộc); mọi bước khác tự qua được khi người chơi làm khác hay chờ lâu', treo.length === 0, treo.map((x) => x.ten).join(', '));

console.log('\n== 3. Sự kiện mà bước chờ đều được game báo ==');
const nguon = { tp: doc('thanh-phan.js'), xuong: doc('xuong-ham.js'), choi: doc('man-choi.js') };
const duocBao = (su) => new RegExp("(?:baoHd|HuongDan\\.bao)\\('" + su + "'").test(nguon.tp + nguon.xuong + nguon.choi);
const chuaBao = [...suDung].filter((su) => !duocBao(su));
kiem('mọi sự kiện dùng ở HuongDanMan có chỗ báo trong thanh-phan.js / xuong-ham.js / man-choi.js', chuaBao.length === 0, chuaBao.join(', '));
kiem('sự kiện mới: doi-cho, doi-bac, doi-so (Editor), thu, dong-xuong, tao-ham (Xưởng), xem-san (màn chơi) đều được báo', ['doi-cho', 'doi-bac', 'doi-so', 'thu', 'dong-xuong', 'tao-ham', 'xem-san'].every(duocBao));
kiem('thắng màn thì HuongDan.xongMan (dừng chuỗi, lưu cờ)', /HuongDan\.xongMan\(S\.man\)/.test(nguon.choi));
kiem('mọi sự kiện được báo đều ghi ở đầu huong-dan.js (CÁCH DÙNG)', [...SU_KIEN].every((su) => doc('huong-dan.js').includes("'" + su + "'")));

console.log('\n== 4. Khung: HuongDanMan, ưu tiên man.huongDan, xongMan, daLam, phu ==');
{
  luuGia.co = {};
  const man = ManHoc.timMa('hai-banh.1');
  const c = HuongDan.vaoMan(man);
  kiem('vaoMan lấy bước từ HuongDanMan[man.ma] khi màn không tự khai man.huongDan; chuỗi id "man:<mã>"', !!c && HuongDan.dangChay('man:hai-banh.1') && HuongDan.buocHienTai('man:hai-banh.1') === 0);
  HuongDan.bao('chay');
  kiem('bước "chạy" xong khi người chơi bấm Chạy: chuỗi hết, cờ "hd:hai-banh.1" lưu, vào lại thì không hiện nữa', !HuongDan.dangChay('man:hai-banh.1') && luuGia.co['hd:hai-banh.1'] === true && HuongDan.vaoMan(man) === null);
  luuGia.co = {};
  const rieng = HuongDan.vaoMan({ ma: 'hai-banh.1', huongDan: [{ dich: 'nut:nhip', xong: 'chay', chu: 'riêng' }, { dich: 'nut:chay', xong: 'chay' }] });
  kiem('man.huongDan (màn tự khai) được ưu tiên hơn HuongDanMan', !!rieng && HuongDan.buocHienTai('man:hai-banh.1') === 0 && (HuongDan.bao('chay'), HuongDan.buocHienTai('man:hai-banh.1') === 1));
  HuongDan.dung();
  luuGia.co = {};
  HuongDan.vaoMan(man); HuongDan.xongMan(man);
  kiem('xongMan (thắng màn): dừng chuỗi đang chạy và lưu cờ "đã xem"', !HuongDan.dangChay('man:hai-banh.1') && luuGia.co['hd:hai-banh.1'] === true);
  kiem('màn không có hướng dẫn: vaoMan trả về null, xongMan không lỗi', HuongDan.vaoMan({ ma: 'khong-co.1' }) === null && (HuongDan.xongMan({ ma: 'khong-co.1' }), true));
  // daLam: bước tự qua khi việc đã làm sẵn
  luuGia.co = {};
  let xong = 0, daLam1 = false;
  HuongDan.chay({ id: 'dl', co: 'co-dl', khiXong: () => { xong++; }, buoc: [{ dich: 'nut:chay', xong: 'chay', daLam: () => daLam1 }, { dich: 'nut:chay', xong: 'chay' }] });
  HuongDan.nhip();
  kiem('daLam chưa đúng: bước giữ nguyên', HuongDan.buocHienTai('dl') === 0);
  daLam1 = true; HuongDan.nhip();
  kiem('daLam đúng (kiểm mỗi nhịp đồng hồ): bước tự qua mà người chơi không phải làm gì', HuongDan.buocHienTai('dl') === 1);
  HuongDan.dung();
  HuongDan.chay({ id: 'dl2', co: 'co-dl2', khiXong: () => { xong++; }, buoc: [{ dich: 'nut:chay', xong: 'chay', daLam: () => true }, { dich: 'nut:chay', xong: 'chay', daLam: () => true }] });
  kiem('daLam đúng ngay lúc vào bước (mọi bước đã làm sẵn): chuỗi xong luôn, lưu cờ, gọi khiXong một lần', !HuongDan.dangChay('dl2') && luuGia.co['co-dl2'] === true && xong === 1);
  const nguonHD = doc('huong-dan.js');
  kiem('bước `phu` (nút Tạo hàm, bảng chọn số): vẽ ở #stage, thêm kiểu #stage > .hd-vien / .hd-bong cao hơn hộp thoại (z-index 40) và bảng chọn số (70)', /phu/.test(nguonHD) && /#stage>\.hd-vien/.test(nguonHD) && /z-index:9[0-9]/.test(nguonHD) && /sanKhau\(\)/.test(nguonHD));
  kiem('HuongDan.timDich (đích dạng chuỗi cho bước viết dich: function) có mặt', typeof HuongDan.timDich === 'function' && typeof HuongDan.xongMan === 'function');
}

console.log('\n== 5. game/choi.html ==');
{
  const html = doc('choi.html');
  const a = html.indexOf('huong-dan-man.js');
  kiem('choi.html nạp huong-dan-man.js sau mọi tệp màn (man-drone.js), sau huong-dan.js và trước man-choi.js; tệp có trên đĩa', a > 0 && a > html.indexOf('../man-drone.js') && a > html.indexOf('huong-dan.js') && a < html.indexOf('man-choi.js') && fs.existsSync(path.join(day, 'game', 'huong-dan-man.js')));
  kiem('man-choi.js gọi HuongDan.vaoMan(m) khi vào màn (lấy cả HuongDanMan)', /HuongDan\.vaoMan\(m\)/.test(nguon.choi));
}

console.log('\n== 6. Vị trí hộp và luồng hướng dẫn thực tế ==');
{
  const rect = (left, top, right, bottom) => ({ left, top, right, bottom });
  const cham = (a, b) => Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);
  const cacDich = [rect(220, 370, 342, 410), rect(20, 570, 178, 615), rect(240, 65, 340, 95), rect(70, 8, 180, 40)];
  let dung = true;
  for (const H of [568, 640, 800]) for (const d0 of cacDich) {
    const d = rect(d0.left, Math.min(d0.top, H - 45), d0.right, Math.min(d0.bottom, H - 8));
    const v = HuongDan.viTriBong({ W: 360, H, w: 170, h: 72, neo: d, dich: [d], tranh: [rect(14, 280, 346, H - 10)] });
    dung &&= !!v && v.left >= 8 && v.top >= 8 && v.right <= 352 && v.bottom <= H - 8 && !cham(v, d);
  }
  kiem('hộp ở trong màn, tránh đích sát trên/dưới trên ba chiều cao', dung);
  const pal = rect(210, 300, 346, 625), code = rect(14, 280, 195, 625), d = rect(220, 385, 342, 420);
  const v = HuongDan.viTriBong({ W: 360, H: 640, w: 170, h: 72, neo: d, dich: [d], tranh: [pal, code] });
  kiem('hướng dẫn khối trong khay không che khay hoặc khung code', !!v && !cham(v, pal) && !cham(v, code));
  kiem('không cố ép hộp đè lên đích khi toàn màn không còn chỗ', HuongDan.viTriBong({ W: 360, H: 640, w: 170, h: 72, neo: rect(0,0,360,640), dich: [rect(0,0,360,640)] }) === null);
  kiem('6.3 không tự bỏ qua bước bắt buộc theo thời gian', HDM['vong-lap.3'].every(b => !(b.han > 0)));
  const timCu = HuongDan.timDich;
  HuongDan.timDich = s => s === 'khoi:wait' ? [{}] : [];
  kiem('wait ghim không khiến tutorial nhận nhầm đã mở thẻ Tay', JSON.stringify(HDM['tay-gap.1'][1].dich()) === JSON.stringify(['nut:pal-the-sau', 'nut:pal-the-truoc']));
  HuongDan.timDich = timCu;

  let codeMoi = [];
  ctx.Choi = { trangThai: () => ({ bai: { chinh: codeMoi } }) };
  HuongDan.dung(); luuGia.co = { 'hd:vong-lap.3': true };
  HuongDan.vaoMan(ManHoc.timMa('vong-lap.3'));
  kiem('6.3 chưa thắng vẫn nhận hướng dẫn mới dù đã xem bản cũ', HuongDan.buocHienTai('man:vong-lap.3') === 0);
  codeMoi = ['for i in range(2):']; HuongDan.nhip();
  codeMoi.push('    move()'); HuongDan.nhip();
  kiem('6.3 hướng dẫn vòng đầu trước lệnh rẽ', HuongDan.buocHienTai('man:vong-lap.3') === 3);
  codeMoi[0] = 'for i in range(5):'; HuongDan.nhip();
  codeMoi.push('    turn_right()'); HuongDan.nhip();
  kiem('6.3 chưa bỏ qua bước đưa lệnh rẽ ra ngoài for', HuongDan.buocHienTai('man:vong-lap.3') === 5);
  codeMoi[2] = 'turn_right()'; HuongDan.nhip();
  codeMoi.push('for i in range(2):'); HuongDan.nhip();
  kiem('6.3 move của vòng đầu không làm bỏ qua move của vòng hai', HuongDan.buocHienTai('man:vong-lap.3') === 8);
  codeMoi.push('    move()'); HuongDan.nhip();
  codeMoi[3] = 'for i in range(6):'; HuongDan.nhip();
  kiem('6.3 chỉ tới bước Chạy sau khi hoàn thành cả hai vòng', HuongDan.buocHienTai('man:vong-lap.3') === 11 && JSON.stringify(codeMoi) === JSON.stringify(ManHoc.timMa('vong-lap.3').loiGiai.chinh));
  kiem('mẹo xóa chung không chen ngang tutorial màn', HuongDan.chay({ id: 'xoa-dong', buoc: [{ dich: 'nut:chay', chu: 'xóa', xong: 'chay' }] }) === null);
  HuongDan.bao('chay');
  kiem('6.3 ghi cờ đúng phiên bản sau khi xem xong', luuGia.co['hd:vong-lap.3:v2'] === true);

  HuongDan.dung(); luuGia.co = {};
  codeMoi = ['move()', 'move()', 'move()'];
  HuongDan.vaoMan(ManHoc.timMa('xuong-ham.3'));
  kiem('2.3 không bảo chạy khi mới ghép ba move đầu', HuongDan.buocHienTai('man:xuong-ham.3') === 1);
  codeMoi.push('left_move()', 'wait()'); HuongDan.nhip();
  kiem('2.3 còn hướng dẫn đoạn sau khi đã ghép lệnh rẽ', HuongDan.buocHienTai('man:xuong-ham.3') === 2);
  codeMoi.push('move()', 'move()'); HuongDan.nhip();
  kiem('2.3 đủ đường đi mới chỉ nút Chạy', HuongDan.buocHienTai('man:xuong-ham.3') === 3);

  HuongDan.dung(); luuGia.co = {};
  codeMoi = ManHoc.timMa('tay-gap.1').maMau.chinh.concat(['move()', 'arm_down()', 'release()']);
  HuongDan.vaoMan(ManHoc.timMa('tay-gap.1'));
  kiem('4.1 chưa coi thả vật là xong khi thiếu wait()', HuongDan.buocHienTai('man:tay-gap.1') === 1);
  codeMoi.push('wait()'); HuongDan.nhip();
  kiem('4.1 đã có wait() mới chỉ nút Chạy', HuongDan.buocHienTai('man:tay-gap.1') === 2);
  HuongDan.dung();
  delete ctx.Choi;
}

console.log('\n---------------------------------------------\nĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

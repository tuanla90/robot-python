/* ============================================================================
   kiem-ve-mua-8.mjs — máy kiểm HÌNH mùa 8 Hang động (KE-HOACH-MUA-8.md, P2): không trường vật nào của màn mùa 8 thiếu hình.
   Gồm:
   1. HÌNH Ô (game/ve-vector-o-hang.js): đăng ký 'chuong-da', 'da-chuong', 'cua-ngach'; mọi trạng thái mẫu và mọi nốt 1–8 vẽ không lỗi; màu nốt đủ 8.
   2. BỘ VẼ SÂN (game/san-ve.js): đọc chuongDa / danDoi / daChuong / ngachHang; vẽ đè lên sàn (cả ô đá ướt I); đồng bộ đá chuông theo vết ở ĐẦU nhịp;
      hoạt cảnh sự kiện qua-ngach / ngach-chan; rung-da-chuong / vo-da-chuong / doi-gai là hiệu ứng tức thì.
   3. NỐI: man-choi.js truyền ba trường xuống sân; choi.html, xem-mua-moi.html, xem-vector.html nạp tệp hình.
   4. THẺ BỘ PHẬN (gioi-thieu-part.js): gai, loa, am-thanh có đủ lệnh của lõi (san-hoc.js) và lời khớp luật lõi.
   5. MÀN: mọi màn mùa 8 (lo-trinh-hoc.js) chỉ dùng trường vật có hình; vật nằm trong sân, không đè tường.
   Chạy: node hoc/kiem-ve-mua-8.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const doc = (f) => fs.readFileSync(path.join(day, f), 'utf8');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);

/* ================================================================= 1. HÌNH Ô */
console.log('\n== 1. Hình ô hang động ==');
const dk = {};
{
  const g = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => ({ addColorStop() {} })), set: (t, k, v) => { t[k] = v; return true; } });
  const H = { bo() {}, to() {}, vien() {}, tron() {}, duong() {}, gradDoc: () => 'grad', rgba: (c, a) => 'rgba(' + c + ',' + a + ')' };
  const BM = new Proxy({}, { get: (t, k) => (typeof k === 'string' ? '#' + k : undefined) });
  const root = { BangMau: BM, VeVector: { dangKy: (d) => { dk[d.ma] = d; } } };
  root.window = root;
  vm.runInNewContext(doc('game/ve-vector-o-hang.js'), root, { filename: 've-vector-o-hang.js' });
  ['chuong-da', 'da-chuong', 'cua-ngach'].forEach((ma) => kiem('đăng ký hình ô "' + ma + '"', !!dk[ma] && dk[ma].loai === 'o' && typeof dk[ma].ve === 'function' && (dk[ma].cacTrangThai || []).length >= 3));
  const loi = [];
  Object.values(dk).forEach((d) => {
    const ts = d.cacTrangThai.slice();
    if (d.ma !== 'cua-ngach') for (let n = 1; n <= 8; n++) ts.push({ not: n, ben: 3, ngan: n % 4 }, { not: n, vo: true });
    else for (let m = 0; m < 8; m++) ts.push({ mau: m, dau: m & 1 ? 'b' : 'a' });
    ts.push(undefined, {});
    ts.forEach((s) => { try { d.ve(g, s, H); } catch (e) { loi.push(d.ma + ' ' + J(s) + ': ' + e.message); } });
  });
  kiem('mọi trạng thái (mẫu, nốt 1–8, đã vỡ, sáu màu ngách, trạng thái rỗng) vẽ không lỗi', !loi.length, loi.slice(0, 3).join(' | '));
  kiem('màu nốt đủ 8 (MAU_NOT[1..8]) và hàm mauNot dùng chung', root.VeVector.MAU_NOT && root.VeVector.MAU_NOT.slice(1).every(Boolean) && root.VeVector.MAU_NOT.length === 9 && typeof root.VeVector.mauNot === 'function');
  kiem('ít nhất 6 màu cặp ngách (một sân có tới 6 ngách vẫn phân biệt được)', (root.VeVector.MAU_NGACH || []).length >= 6);
}

/* ================================================================= 2. BỘ VẼ SÂN */
console.log('\n== 2. Bộ vẽ sân (san-ve.js) ==');
const sv = doc('game/san-ve.js');
{
  kiem('nap: đọc chuongDa (hay danDoi), daChuong, ngachHang vào this.cfg', /chuongDa: Array\.isArray\(cfg\.chuongDa\) \? cfg\.chuongDa : Array\.isArray\(cfg\.danDoi\)/.test(sv) && /daChuong: Array\.isArray\(cfg\.daChuong\)/.test(sv) && /ngachHang: Array\.isArray\(cfg\.ngachHang\)/.test(sv));
  kiem('dungMuaMoi: bảng chuongT / daChuong0 / ngachT; datLaiMuaMoi: daChuongT chưa rung chưa vỡ', /this\.chuongT = \{\}; this\.daChuong0 = \{\}; this\.ngachT = \{\}/.test(sv) && /this\.daChuongT = \{\};/.test(sv));
  kiem('veOHang vẽ ba hình, gọi ở sàn thường và ở ô đá ướt I', /veOHang: function/.test(sv) && /ve\('cua-ngach'/.test(sv) && /ve\('da-chuong'/.test(sv) && /ve\('chuong-da'/.test(sv) && /ch === 'I'\) \{ ve\('da-uot'\); this\.veOHang/.test(sv) && /if \(this\.veOHang\(g, x, y, kO, now\)\) return;/.test(sv));
  kiem('đá chuông đồng bộ theo vết ở đầu nhịp (phatNhip) và cuối nhịp (dongBoMuaMoi)', /phatNhip: async function[\s\S]{0,1800}if \(e\.daChuong\) this\.dongBoHang\(e\.daChuong\)/.test(sv) && /if \(e\.daChuong\) this\.dongBoHang\(e\.daChuong\);\s*\/\/ HANG ĐỘNG: đá chuông đúng vết/.test(sv));
  kiem('hoạt cảnh qua-ngach (chui rồi trồi) và ngach-chan (rung, ô chặn nháy)', /s\.ma === 'qua-ngach'/.test(sv) && /s\.ma === 'ngach-chan'/.test(sv) && /'qua-ngach': 1\.15/.test(sv));
  kiem('rung-da-chuong / vo-da-chuong / doi-gai là hiệu ứng tức thì (không chiếm thời gian nhịp)', /'rung-da-chuong': 1, 'vo-da-chuong': 1, 'doi-gai': 1/.test(sv));
  const core = doc('san-hoc.js');
  const suKien = [...new Set((core.match(/ma: '(qua-ngach|ngach-chan|rung-da-chuong|vo-da-chuong|doi-gai)'/g) || []).map((s) => s.slice(5, -1)))];
  kiem('mọi sự kiện mùa 8 của lõi đều được bộ vẽ biết', suKien.length === 5 && suKien.every((m) => sv.indexOf("'" + m + "'") >= 0), J(suKien));
}

/* ================================================================= 3. NỐI */
console.log('\n== 3. Nối trường xuống sân, nạp tệp hình ==');
{
  const mc = doc('game/man-choi.js');
  kiem('man-choi.js cauHinhSan truyền chuongDa / daChuong / ngachHang của sân', /chuongDa: lm\.chuongDa \|\| undefined, daChuong: lm\.daChuong \|\| undefined, ngachHang: lm\.ngachHang \|\| undefined/.test(mc));
  ['game/choi.html', 'game/xem-mua-moi.html', 'hinh-mau/xem-vector.html'].forEach((f) => kiem(f + ' nạp ve-vector-o-hang.js', /ve-vector-o-hang\.js/.test(doc(f))));
}

/* ================================================================= 4. THẺ BỘ PHẬN */
console.log('\n== 4. Thẻ bộ phận Bánh gai / Loa / Mic ==');
{
  const GT = require(path.join(day, 'gioi-thieu-part.js'));
  const DS = GT.DS || GT.ds || GT;
  const the = (ma) => (DS && DS[ma]) || (GT.the && GT.the(ma)) || null;
  const gai = the('gai'), loa = the('loa'), mic = the('am-thanh');
  kiem('có thẻ gai, loa, am-thanh', !!gai && !!loa && !!mic, Object.keys(GT).join(','));
  if (gai && loa && mic) {
    kiem('thẻ gai đủ lệnh thân + thu / bung gai', ['left_move', 'right_move', 'left_back', 'right_back', 'retract_spikes', 'extend_spikes'].every((l) => gai.lenh.includes(l)));
    kiem('thẻ loa: note, beat (như TAY_LOA của lõi)', J(loa.lenh.slice().sort()) === J(['beat', 'note']));
    kiem('thẻ mic: hear, listen', J(mic.lenh.slice().sort()) === J(['hear', 'listen']));
    const chuLoa = J(loa), chuMic = J(mic);
    kiem('lời thẻ loa khớp lõi: đủ vạch thì vỡ, sai nốt / nghỉ thì tắt, tầm 3 ô; không còn "rụt xuống" / "trồi lên"', /vỡ/.test(chuLoa) && /tắt hết/.test(chuLoa) && /3 ô/.test(chuLoa) && !/rụt|trồi/.test(chuLoa));
    kiem('lời thẻ mic khớp lõi: nghe mọi hướng, vách không cản, tầm 9 ô; không còn "6 ô" / "trước mặt"', /mọi hướng/.test(chuMic) && /không cản/.test(chuMic) && /9 ô/.test(chuMic) && !/6 ô|trước mặt/.test(chuMic));
  }
}

/* ================================================================= 5. MÀN */
console.log('\n== 5. Màn mùa 8 chỉ dùng vật có hình ==');
{
  const M = require(path.join(day, 'lo-trinh-hoc.js'));
  const TT = require(path.join(day, 'thu-tu-chuong.js'));
  const ch8 = TT.goi.filter((g) => g.mua === 'mua-8').flatMap((g) => g.chuong);
  const ds = M.danhSach.filter((m) => ch8.includes(m.chuong));
  const CO_HINH = new Set(['chuongDa', 'danDoi', 'daChuong', 'ngachHang', 'noi', 'cuaNhip', 'mau', 'vatMau', 'vatChat', 'vatThem', 'thungThem', 'demTu', 'dong', 'nutBat', 'dieu', 'bongMo']);
  const TRUONG_VAT = ['chuongDa', 'danDoi', 'daChuong', 'ngachHang', 'noi', 'cuaNhip', 'mau', 'vatMau', 'vatChat', 'vatDang', 'vatThem', 'thungThem', 'demTu', 'dong', 'nutBat', 'lua', 'sanDoc', 'hinh', 'chong', 'tau', 'bongMo', 'dieu'];
  const thieu = [], ngoai = [];
  ds.forEach((m) => {
    TRUONG_VAT.forEach((k) => { if (m[k] !== undefined && m[k] !== null && !CO_HINH.has(k)) thieu.push(m.ma + ':' + k); });
    const sanDs = Array.isArray(m.san[0]) ? m.san : [m.san];
    sanDs.forEach((rows, i) => {
      const lay = (l) => (Array.isArray(m.san[0]) && Array.isArray(l) && Array.isArray(l[0]) ? l[i] || [] : l || []);
      const o = (p) => { const r = rows[p.y]; return r ? r[p.x] : undefined; };
      lay(m.chuongDa || m.danDoi).concat(lay(m.daChuong)).forEach((p) => { const c = o(p); if (c === undefined || c === '#') ngoai.push(m.ma + ' (' + p.x + ', ' + p.y + ')'); });
      lay(m.ngachHang).forEach((p) => [p.a, p.b].forEach((q) => { const c = o(q); if (c === undefined || c === '#') ngoai.push(m.ma + ' ngách (' + q.x + ', ' + q.y + ')'); }));
    });
  });
  kiem('có màn mùa 8 trong lộ trình (' + ds.length + ')', ds.length > 0);
  kiem('không màn nào dùng trường vật chưa có hình', !thieu.length, thieu.slice(0, 8).join(' '));
  kiem('chuông đá / đá chuông / miệng ngách nằm trong sân, không đè tường', !ngoai.length, ngoai.slice(0, 8).join(' '));
}

console.log('\n' + (hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) : 'ĐẠT cả ' + dat) + ' phép kiểm hình mùa 8');
process.exit(hong ? 1 : 0);

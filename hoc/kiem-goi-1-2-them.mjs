/* ============================================================================
   kiem-goi-1-2-them.mjs — máy kiểm brief SM1-B (30/10): mùa 1 gói 1 (trùm chương hai-banh), gói 2 (vòng for lồng, tay kẹp ở chương vong-lap),
   gói 3 (`not` ở che-cam-bien.2). Màn mới ở man-goi-1-2-them.js, màn viết lại ở lo-trinh-hoc.js (khối "SM1-B").
   A. Chương hai-banh (việc 1):
      1. Thứ tự 10 màn, số, hàng; hai-banh.6 cất, hai-banh.11 mới (mã không trùng màn cất); tên không trùng; chỉ trùm hai-banh.10 có huy hiệu hai-banh;
         choi.html và lo-trinh-hoc.js nạp man-goi-1-2-them.js; hướng dẫn kéo dòng của hai-banh.10 còn.
      2. Màn mới / viết lại: chỉ lệnh bánh, khung 10 ô, chưa mở Xưởng; lời giải 3 sao đúng sao.o / sao.nhip, không chẩn đoán, vừa khung; mã mẫu chưa thắng;
         lời sai thua đúng mã.
      3. Trùm hai-banh.10: nhịp VÀ ô lớn hơn màn 9, nhịp lớn nhất chương (bằng nhau được với màn 7 hai-banh.11 vì khung 10 ô chặn trên), không quá 2 lần
         màn 9; mã mẫu đầy khung, chạy thì đâm tường; lời giải là hoán vị đúng các dòng của mã mẫu (không thêm, không bớt), không phải dãy con; một lần kéo
         đổi chỗ hai dòng cạnh nhau chưa ra 3 sao.
      4. Bộ dò vét cạn (mỗi nhịp: tiến / quay phải / quay trái / đứng chờ, tới 5 nhịp, chạy thật bằng cham.js): đường thắng ngắn nhất đúng sao.nhip,
         ít ô nhất trong các đường đó đúng sao.o (không có đường tắt).
      5. Đường cong: dòng, nhịp màn n ≤ max(1,5 × màn n−1, màn n−1 + bù) ở cặp có màn mới / viết lại / đổi chỗ, trừ trùm (bù: dòng +3, nhịp +4).
   --loi-gia: cắm lỗi giả (sao.nhip trùm lệch, mã mẫu trùm thêm một dòng, sân hai-banh.11 mở lối tắt) rồi chạy: phải thấy HỎNG.
   Chạy: node hoc/kiem-goi-1-2-them.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Cham = require('./cham.js');
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const clone = (x) => JSON.parse(JSON.stringify(x));
const LOI_GIA = process.argv.includes('--loi-gia');
const get = (ma) => M.timMa(ma);

let dat = 0, hong = 0;
function kiem(ten, fn) {
  try { fn(); dat++; } catch (e) { hong++; console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); }
}

if (LOI_GIA) {
  get('hai-banh.10').sao.nhip += 1;                                                    // A2: sao.nhip lệch
  get('hai-banh.10').maMau.chinh.push('wait()');                                       // A3: mã mẫu tràn khung, không còn là hoán vị lời giải
  get('hai-banh.11').san[1] = '.#F#.'; get('hai-banh.11').san[2] = '.....';            // A4: cờ dời lên sát sau lưng: có đường 3 nhịp, ngưỡng 4 sai
}

/* ------------------------------------------------------------------ kho hàm của em theo thứ tự lộ trình */
const khoTruoc = new Map();
{
  const kho = new Map();
  for (const m of M.danhSach) {
    khoTruoc.set(m.ma, clone([...kho.values()]));
    if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
  }
}
function cham(m, bai, moi) {
  const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, clone(h)]));
  for (const h of moi || []) hs.set(h.ten, clone(h));
  return Cham.cham(m, { chinh: bai.chinh, hamCuaMan: bai.hamCuaMan || [] }, [...hs.values()]);
}
const maCua = (r) => r.chanDoan.map((c) => c.ma);
const soDong = (m) => (m.chinhCoDinh ? 0 : m.loiGiai.chinh.length) + (m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).reduce((s, h) => s + h.than.length, 0);
const tran = (a, b, bu) => a <= Math.max(1.5 * b, b + bu);
const demLoai = (ds) => ds.reduce((a, x) => { a[x] = (a[x] || 0) + 1; return a; }, {});
const dayCon = (con, me) => { let i = 0; for (const x of me) if (i < con.length && x === con[i]) i++; return i === con.length; };
const BU = { dong: 3, nhip: 4 };

/* ================================================================== A. chương hai-banh */
const HB_THU_TU = ['hai-banh.1', 'hai-banh.2', 'hai-banh.3', 'hai-banh.4', 'hai-banh.5', 'hai-banh.7', 'hai-banh.11', 'hai-banh.8', 'hai-banh.9', 'hai-banh.10'];
const HB_MOI = ['hai-banh.11'], HB_VIET_LAI = ['hai-banh.10'], HB_CAT = ['hai-banh.6'];
const HB = M.danhSach.filter((m) => m.chuong === 'hai-banh');
const hangTheo = (i) => (i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum');

kiem('A1 chương hai-banh: đúng 10 màn theo thứ tự, số và hàng đúng; gói xe vẫn hai chương hai-banh, xuong-ham', () => {
  assert.deepEqual(HB.map((m) => m.ma), HB_THU_TU);
  assert.deepEqual(HB.map((m) => m.so), HB_THU_TU.map((_, i) => i + 1));
  assert.deepEqual(HB.map((m) => m.hang), HB_THU_TU.map((_, i) => hangTheo(i)));
  assert.deepEqual(TT.goi.find((g) => g.ma === 'xe').chuong, ['hai-banh', 'xuong-ham']);
});
kiem('A1 hai-banh.6 cất (manCat, ngân hàng còn); hai-banh.11 mới không trùng màn cất; tên màn không trùng trong lộ trình', () => {
  for (const ma of HB_CAT) { assert.ok(M.manCat.includes(ma), ma); assert.equal(get(ma), null, ma + ' còn trong lộ trình'); }
  assert.ok(/so: 6, ten: 'Chữ L ngược'/.test(fs.readFileSync(new URL('./man-chuoi-1.js', import.meta.url), 'utf8')), 'ngân hàng mất hai-banh.6');
  for (const ma of HB_MOI) { assert.ok(get(ma)); assert.ok(!M.manCat.includes(ma)); }
  const ten = M.danhSach.map((m) => m.ten);
  for (const ma of HB_MOI.concat(HB_VIET_LAI)) assert.equal(ten.filter((t) => t === get(ma).ten).length, 1, 'tên "' + get(ma).ten + '" trùng');
});
kiem('A1 huy hiệu hai-banh chỉ ở trùm hai-banh.10; hướng dẫn kéo dòng của hai-banh.10 còn; choi.html và lo-trinh-hoc.js nạp man-goi-1-2-them.js', () => {
  assert.deepEqual(M.danhSach.filter((m) => m.huyHieu && m.huyHieu.ma === 'hai-banh').map((m) => m.ma), ['hai-banh.10']);
  for (const m of HB.slice(0, -1)) assert.ok(!m.huyHieu, m.ma);
  const hd = fs.readFileSync(new URL('./game/huong-dan-man.js', import.meta.url), 'utf8');
  assert.ok(/H\['hai-banh\.10'\] = \[[^\]]*xong: 'doi-cho'/.test(hd), 'hướng dẫn kéo dòng hai-banh.10');
  assert.ok(/Nhấn giữ/.test(get('hai-banh.10').veMaMau) && /kéo/.test(get('hai-banh.10').veMaMau));
  const html = fs.readFileSync(new URL('./game/choi.html', import.meta.url), 'utf8');
  const a = html.indexOf('../man-goi-1-2-them.js'), b = html.indexOf('../lo-trinh-hoc.js');
  assert.ok(a > 0 && a < b, 'choi.html');
  const lt = fs.readFileSync(new URL('./lo-trinh-hoc.js', import.meta.url), 'utf8');
  assert.ok(/'goi-1-2-them'/.test(lt) && /M\.them\(M\.manGoi12Them/.test(lt), 'lo-trinh-hoc.js');
});
for (const ma of HB_MOI.concat(HB_VIET_LAI)) {
  const m = get(ma);
  kiem('A2 ' + ma + ': chỉ lệnh bánh, khung 10 ô, chưa mở Xưởng, cấm hàm của em, một sân, không for', () => {
    assert.deepEqual(m.hamGoc, ['left_move', 'right_move', 'wait']);
    assert.equal(m.khung.chinh, 10);
    assert.equal(m.moXuong, false); assert.equal(m.camHamCuaEm, true);
    assert.ok(!Array.isArray(m.san[0]));
    assert.deepEqual(m.cauTruc, []);
  });
  kiem('A2 ' + ma + ': lời giải 3 sao đúng ngưỡng, không chẩn đoán, vừa khung; mã mẫu chưa thắng; lời sai thua đúng mã', () => {
    const r = cham(m, m.loiGiai);
    assert.ok(r.thang, JSON.stringify(maCua(r)));
    assert.equal(r.sao, 3);
    assert.equal(r.soO, m.sao.o, 'soO ' + r.soO + ' khai ' + m.sao.o);
    assert.equal(r.soNhip, m.sao.nhip, 'soNhip ' + r.soNhip + ' khai ' + m.sao.nhip);
    assert.deepEqual(maCua(r), []);
    assert.ok(m.loiGiai.chinh.length <= m.khung.chinh);
    assert.equal(cham(m, m.maMau).thang, false, 'mã mẫu thắng sẵn');
    assert.ok(m.loiSai.length >= 2);
    for (const ls of m.loiSai) {
      const rl = cham(m, ls.baiLam);
      assert.equal(rl.thang, false, 'lời sai "' + ls.moTa + '" thắng');
      for (const x of ls.phaiCoMa) assert.ok(maCua(rl).includes(x), 'lời sai "' + ls.moTa + '" thiếu mã ' + x + ' (có ' + maCua(rl) + ')');
    }
  });
}
kiem('A3 trùm hai-banh.10: nhịp và ô lớn hơn màn 9; nhịp lớn nhất chương; không quá 2 lần màn 9', () => {
  const trum = get('hai-banh.10'), m9 = HB[8];
  assert.ok(trum.sao.nhip > m9.sao.nhip && trum.sao.o > m9.sao.o, 'trùm ' + trum.sao.nhip + ' nhịp ' + trum.sao.o + ' ô so với màn 9 ' + m9.sao.nhip + ' / ' + m9.sao.o);
  for (const m of HB.slice(0, -1)) assert.ok(trum.sao.nhip >= m.sao.nhip && trum.sao.o >= m.sao.o, m.ma + ' khó hơn trùm');
  assert.ok(trum.sao.nhip <= 2 * m9.sao.nhip);
});
kiem('A3 trùm hai-banh.10: mã mẫu đầy khung, chạy thì đâm tường; lời giải là hoán vị đủ các dòng của mã mẫu, không phải dãy con; một lần đổi hai dòng cạnh nhau chưa 3 sao', () => {
  const m = get('hai-banh.10'), mm = m.maMau.chinh, lg = m.loiGiai.chinh;
  assert.equal(mm.length, m.khung.chinh, 'mã mẫu ' + mm.length + ' dòng');
  const r = cham(m, m.maMau);
  assert.ok(!r.thang && maCua(r).includes('dam-tuong') && !maCua(r).includes('tran-khung'), JSON.stringify(maCua(r)));
  assert.deepEqual(demLoai(lg), demLoai(mm), 'lời giải không cùng bộ dòng với mã mẫu');
  assert.ok(!dayCon(lg, mm), 'chỉ xóa là đủ');
  for (let i = 0; i + 1 < mm.length; i++) { const c = mm.slice(); [c[i], c[i + 1]] = [c[i + 1], c[i]]; assert.ok(cham(m, { chinh: c }).sao < 3, 'đổi dòng ' + i + ' / ' + (i + 1) + ' đã 3 sao'); }
});
const BUOC_HB = { tien: ['left_move()', 'right_move()', 'wait()'], phai: ['left_move()', 'wait()'], trai: ['right_move()', 'wait()'], cho: ['wait()'] };
const doHB = {};
for (const ma of HB_MOI.concat(HB_VIET_LAI)) {
  kiem('A4 ' + ma + ': bộ dò vét cạn (tới 5 nhịp): đường thắng ngắn nhất = sao.nhip, ít ô nhất trong các đường đó = sao.o', () => {
    const m = get(ma);
    let tot = null;
    const di = (ds) => {
      if (ds.length) {
        const chinh = ds.flatMap((k) => BUOC_HB[k]);
        const r = Cham.cham(m, { chinh, hamCuaMan: [] }, []);
        if (r.thang) { if (!tot || r.soNhip < tot.nhip || (r.soNhip === tot.nhip && chinh.length < tot.o)) tot = { nhip: r.soNhip, o: chinh.length, ds: ds.join(' ') }; return; }
      }
      if (ds.length < 5) for (const k of Object.keys(BUOC_HB)) di(ds.concat(k));
    };
    di([]);
    doHB[ma] = tot;
    assert.ok(tot, 'không tìm được đường thắng');
    assert.equal(tot.nhip, m.sao.nhip, 'đường dò ' + tot.ds + ' ' + tot.nhip + ' nhịp, ngưỡng ' + m.sao.nhip);
    assert.equal(tot.o, m.sao.o, 'đường dò ' + tot.ds + ' ' + tot.o + ' ô, ngưỡng ' + m.sao.o);
  });
}
// Cặp có màn mới / viết lại / đổi chỗ (hai-banh.7 lên thứ 6). Cặp 1.1 → 1.2 (3 → 9 dòng, ngân hàng, màn chạy sẵn rồi viết đủ ba ô) có từ trước, không đổi.
const HB_DOI = HB_MOI.concat(HB_VIET_LAI, ['hai-banh.7']);
kiem('A5 đường cong chương hai-banh: dòng / nhịp màn n ≤ max(1,5 × màn n−1, màn n−1 + bù) ở cặp có màn mới / viết lại / đổi chỗ, trừ trùm', () => {
  for (let i = 1; i < HB.length; i++) {
    const m = HB[i], t = HB[i - 1];
    if (m.hang === 'trum' || !HB_DOI.some((x) => x === m.ma || x === t.ma)) continue;
    assert.ok(tran(soDong(m), soDong(t), BU.dong), m.ma + ' dòng ' + soDong(m) + ' so với ' + t.ma + ' ' + soDong(t));
    assert.ok(tran(m.sao.nhip, t.sao.nhip, BU.nhip), m.ma + ' nhịp ' + m.sao.nhip + ' so với ' + t.ma + ' ' + t.sao.nhip);
  }
});
console.log('A. hai-banh: số | mã | tên | dòng | nhịp | ô | đường dò');
for (const m of HB) console.log('  ' + [m.so, m.ma + (HB_MOI.includes(m.ma) ? ' (mới)' : HB_VIET_LAI.includes(m.ma) ? ' (viết lại)' : ''), m.ten, soDong(m), m.sao.nhip, m.sao.o, (doHB[m.ma] || {}).ds || ''].join(' | '));

console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra brief SM1-B (gói 1, 2, 3 mùa 1)' + (LOI_GIA ? ' [lỗi giả: phải có HỎNG]' : '') + '.');
if (LOI_GIA ? hong === 0 : hong) process.exitCode = 1;

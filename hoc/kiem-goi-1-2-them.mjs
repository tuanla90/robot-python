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
   B. Chương vong-lap (việc 2, 3):
      1. Thứ tự 10 màn; vong-lap.5 cất, vong-lap.11 mới; vong-lap.11 là màn trình diễn (chiChay, chinhCoDinh), có hướng dẫn, đứng NGAY trước vong-lap.9;
         theo thứ tự lộ trình, màn đầu tiên có for lồng là vong-lap.11, và nó không dùng tay / thùng (một màn một điều mới).
      2. Màn mới / viết lại (vong-lap.11, vong-lap.10): lời giải 3 sao đúng ngưỡng, không chẩn đoán (không đâm tường); mã mẫu: trình diễn thì bằng lời giải,
         trùm thì chưa thắng; lời giải khác 2 sao; lời sai thua đúng mã; hàm của em cần đã tạo trước màn.
      3. Trùm vong-lap.10: có tay kẹp (mang thùng, mục tiêu dua-vat, lời giải gọi pick / drop); chế tối đa hai hàm (bend_left, bend_right; thân đúng như
         ngân hàng man-vong-lap.js vì bang-chuyen.8 mùa 2 dùng lại, được tạo trước bang-chuyen.8); có for lồng; nhịp lớn nhất chương, ≤ 2 × màn 9.
      4. Bộ dò BFS (move / rẽ 1 nhịp, pick 2 nhịp, drop 2 nhịp hay 1 nhịp nếu đặt xong là thắng): đường ngắn nhất đúng sao.nhip (không đường tắt).
      5. Đường cong chương vong-lap ở cặp có màn mới / viết lại / đổi chỗ: nhịp như mục A5; dòng so với màn KHÔNG trình diễn đứng trước.
   C. `not` (việc 4): che-cam-bien.7 "Thừa chữ not" (not viết sẵn trong hàm của màn, đề nói not đảo ngược câu trả lời) đứng ngay trước che-cam-bien.2;
      theo thứ tự lộ trình not xuất hiện lần đầu ở mã mẫu che-cam-bien.7, lần đầu phải tự viết là che-cam-bien.2 (while not); mã mẫu .7 làm xe đứng im;
      lời giải 3 sao; bỏ hẳn if thì đâm tường (thua); đường cong ba màn đầu.
   --loi-gia: cắm lỗi giả (sao.nhip trùm hai-banh lệch, mã mẫu trùm thêm một dòng, sân hai-banh.11 có lối tắt, trùm vong-lap chế ba hàm,
     sân vong-lap.11 có lối tắt, che-cam-bien.7 mất chữ not trong mã mẫu) rồi chạy: phải thấy HỎNG.
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
  get('vong-lap.10').taoHam = ['row', 'bend_left', 'bend_right'];                       // B3: trùm chế ba hàm
  get('vong-lap.11').san[4] = '....F';                                                   // B4: mở lối tắt dọc hàng dưới
  get('che-cam-bien.7').maMau.hamCuaMan[0].than[0] = 'if front_clear():';                // C1: mã mẫu không còn cho thấy not
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

/* ================================================================== B. chương vong-lap */
const VL_THU_TU = ['vong-lap.1', 'vong-lap.2', 'vong-lap.3', 'vong-lap.4', 'vong-lap.6', 'vong-lap.8', 'vong-lap.11', 'vong-lap.9', 'che-lap.5', 'vong-lap.10'];
const VL_MOI = ['vong-lap.11'], VL_VIET_LAI = ['vong-lap.10'], VL_CAT = ['vong-lap.5'];
const VL = M.danhSach.filter((m) => m.chuong === 'vong-lap');
const coForLong = (ds) => { const st = []; for (const l of ds || []) { const t = l.match(/^ */)[0].length; while (st.length && st[st.length - 1] >= t) st.pop(); if (/^\s*for\b/.test(l)) { if (st.length) return true; st.push(t); } } return false; };
const dongBai = (b) => [...(b.chinh || []), ...(b.hamCuaMan || []).concat(b.hamCuaEmMoi || []).flatMap((h) => h.than)];
const TAY = /\b(pick|drop|carry|sweep|arm_down|arm_up|grab|release)\s*\(/;
kiem('B1 chương vong-lap: đúng 10 màn theo thứ tự, số và hàng đúng; vong-lap.5 cất, ngân hàng còn; vong-lap.11 mới không trùng màn cất', () => {
  assert.deepEqual(VL.map((m) => m.ma), VL_THU_TU);
  assert.deepEqual(VL.map((m) => m.so), VL_THU_TU.map((_, i) => i + 1));
  assert.deepEqual(VL.map((m) => m.hang), VL_THU_TU.map((_, i) => hangTheo(i)));
  for (const ma of VL_CAT) { assert.ok(M.manCat.includes(ma)); assert.equal(get(ma), null); }
  assert.ok(/so: 5, ten: 'Bậc thang'/.test(fs.readFileSync(new URL('./man-vong-lap.js', import.meta.url), 'utf8')));
  for (const ma of VL_MOI) { assert.ok(get(ma)); assert.ok(!M.manCat.includes(ma)); }
  const ten = M.danhSach.map((m) => m.ten);
  for (const ma of VL_MOI.concat(VL_VIET_LAI)) assert.equal(ten.filter((t) => t === get(ma).ten).length, 1, 'tên "' + get(ma).ten + '" trùng');
});
kiem('B1 vong-lap.11 là màn trình diễn có hướng dẫn, đứng ngay trước vong-lap.9; màn đầu tiên của lộ trình có for lồng là vong-lap.11, không tay / thùng', () => {
  const m = get('vong-lap.11');
  assert.ok(m.chiChay && m.chinhCoDinh);
  assert.equal(VL[VL.indexOf(m) + 1].ma, 'vong-lap.9');
  const hd = fs.readFileSync(new URL('./game/huong-dan-man.js', import.meta.url), 'utf8');
  assert.ok(/H\['vong-lap\.11'\] = \[/.test(hd), 'thiếu hướng dẫn vong-lap.11');
  const dau = M.danhSach.find((x) => coForLong(dongBai(x.loiGiai)) || coForLong(dongBai(x.maMau)));
  assert.equal(dau && dau.ma, 'vong-lap.11', 'for lồng đầu tiên ở ' + (dau && dau.ma));
  assert.ok(!dongBai(m.loiGiai).some((l) => TAY.test(l)) && !/[oD]/.test(m.san.join('')), 'màn trình diễn có tay / thùng');
  assert.ok(coForLong(dongBai(get('vong-lap.9').loiGiai)), 'vong-lap.9 không còn for lồng');
});
const khoTaoTruoc = new Map();
{ const da = new Set(); for (const m of M.danhSach) { khoTaoTruoc.set(m.ma, new Set(da)); for (const t of (m.taoHam || []).concat((m.loiGiai.hamCuaEmMoi || []).map((h) => h.ten))) da.add(t); } }
for (const ma of VL_MOI.concat(VL_VIET_LAI)) {
  const m = get(ma);
  kiem('B2 ' + ma + ': lời giải 3 sao đúng ngưỡng, không chẩn đoán; mã mẫu (trình diễn: bằng lời giải; khác: chưa thắng); lời giải khác 2 sao; lời sai đúng mã; hàm cần đã tạo trước', () => {
    const r = cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi);
    assert.ok(r.thang, JSON.stringify(maCua(r)));
    assert.equal(r.sao, 3);
    assert.equal(r.soO, m.sao.o, 'soO ' + r.soO + ' khai ' + m.sao.o);
    assert.equal(r.soNhip, m.sao.nhip, 'soNhip ' + r.soNhip + ' khai ' + m.sao.nhip);
    assert.deepEqual(maCua(r), []);
    if (m.chiChay) assert.deepEqual(m.maMau.chinh, m.loiGiai.chinh);
    else assert.equal(cham(m, m.maMau).thang, false, 'mã mẫu thắng sẵn');
    if (m.loiGiaiKhac) { const rk = cham(m, m.loiGiaiKhac.baiLam, m.loiGiaiKhac.hamCuaEmMoi); assert.ok(rk.thang && rk.sao === 2, 'lời giải khác sao=' + rk.sao); }
    for (const ls of m.loiSai) {
      const rl = cham(m, ls.baiLam, ls.hamCuaEmMoi || ls.baiLam.hamCuaEmMoi);
      assert.equal(rl.thang, false, 'lời sai "' + ls.moTa + '" thắng');
      for (const x of ls.phaiCoMa) assert.ok(maCua(rl).includes(x), 'lời sai "' + ls.moTa + '" thiếu mã ' + x + ' (có ' + maCua(rl) + ')');
    }
    for (const h of m.hamCuaEmCan) assert.ok(khoTaoTruoc.get(ma).has(h), 'cần ' + h + ' trước khi tạo');
  });
}
kiem('B3 trùm vong-lap.10: mang thùng (dua-vat, pick / drop), chế tối đa hai hàm, có for lồng; nhịp lớn nhất chương, ≤ 2 × màn 9', () => {
  const t = get('vong-lap.10'), m9 = VL[8];
  assert.equal(t.mucTieu, 'dua-vat');
  assert.ok(/o/.test(t.san.join('')) && /D/.test(t.san.join('')));
  const goi = dongBai(t.loiGiai).join('\n');
  assert.ok(/pick\(\)/.test(goi) && /drop\(\)/.test(goi), 'lời giải không dùng tay');
  assert.ok((t.taoHam || []).length <= 2, 'trùm chế ' + t.taoHam.length + ' hàm');
  assert.ok(coForLong(t.loiGiai.chinh), 'trùm không có for lồng');
  for (const m of VL.slice(0, -1)) assert.ok(t.sao.nhip > m.sao.nhip, m.ma + ' ' + m.sao.nhip + ' nhịp ≥ trùm ' + t.sao.nhip);
  assert.ok(t.sao.nhip <= 2 * m9.sao.nhip, 'trùm ' + t.sao.nhip + ' gấp quá 2 lần màn 9 ' + m9.sao.nhip);
});
kiem('B3 bend_left / bend_right: thân đúng như ngân hàng man-vong-lap.js; được tạo ở vong-lap.10, trước bang-chuyen.8 (mùa 2) dùng chúng', () => {
  const nh = fs.readFileSync(new URL('./man-vong-lap.js', import.meta.url), 'utf8');
  const t = get('vong-lap.10');
  for (const [ten, fn] of [['bend_left', 'hBendL'], ['bend_right', 'hBendR']]) {
    const mt = nh.match(new RegExp('function ' + fn + "\\(\\) \\{ return H\\('" + ten + "', \\[([^\\]]*)\\]"));
    assert.ok(mt, 'ngân hàng thiếu ' + fn);
    const h = t.loiGiai.hamCuaEmMoi.find((x) => x.ten === ten);
    assert.ok(h, 'trùm không tạo ' + ten);
    assert.deepEqual(h.than, mt[1].split(',').map((s) => s.trim().replace(/^'|'$/g, '')), 'thân ' + ten + ' khác ngân hàng');
  }
  assert.deepEqual(t.taoHam, ['bend_left', 'bend_right']);
  const bc = get('bang-chuyen.8');
  // bang-chuyen.8 (PDM2a2, 31/10) viết lại trên xe cứu hỏa, không còn dùng bend_*: chỉ chặt khi màn còn gọi chúng
  assert.ok(bc && (!bc.hamCuaEmCan.includes('bend_left') || (khoTaoTruoc.get('bang-chuyen.8').has('bend_left') && khoTaoTruoc.get('bang-chuyen.8').has('bend_right'))));
});
/** BFS khối chuẩn cho xe bánh có tay (một vật): move / turn_left / turn_right 1 nhịp, pick 2 nhịp, drop 2 nhịp (1 nếu đặt xong là thắng). */
function bfsTay(m) {
  const san = m.san, H = san.length, W = san[0].length, VEC = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const o = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? '#' : san[y][x]);
  let vat = null; san.forEach((r, y) => [...r].forEach((c, x) => { if (c === 'o') vat = [x, y]; }));
  const thang = (s) => (m.mucTieu === 'dua-vat' ? (s.vx >= 0 && o(s.vx, s.vy) === 'D') : o(s.x, s.y) === 'F');
  const key = (s) => [s.x, s.y, s.h, s.vx, s.vy].join(',');
  const b = m.batDau, dau = { x: b.x, y: b.y, h: b.huong, vx: vat ? vat[0] : -1, vy: vat ? vat[1] : -1, n: 0 };
  const best = new Map([[key(dau), 0]]), hang = [dau];
  let tot = Infinity;
  while (hang.length) {
    hang.sort((a, c) => a.n - c.n);
    const s = hang.shift();
    if (s.n >= tot) break;
    const cam = s.vx === -2;
    const [dx, dy] = VEC[s.h], fx = s.x + dx, fy = s.y + dy;
    const ke = [];
    if (o(fx, fy) !== '#' && !(s.vx === fx && s.vy === fy)) ke.push({ ...s, x: fx, y: fy, n: s.n + 1 });
    ke.push({ ...s, h: (s.h + 1) % 4, n: s.n + 1 }, { ...s, h: (s.h + 3) % 4, n: s.n + 1 });
    if (!cam && s.vx === fx && s.vy === fy) ke.push({ ...s, vx: -2, vy: -2, n: s.n + 2 });
    if (cam && o(fx, fy) !== '#') { const t = { ...s, vx: fx, vy: fy, n: s.n + 2 }; if (thang(t)) t.n = s.n + 1; ke.push(t); }
    for (const t of ke) {
      if (thang(t)) { tot = Math.min(tot, t.n); continue; }
      const k = key(t); if (best.has(k) && best.get(k) <= t.n) continue; best.set(k, t.n); hang.push(t);
    }
  }
  return tot;
}
for (const ma of VL_MOI.concat(VL_VIET_LAI)) kiem('B4 ' + ma + ': bộ dò BFS: đường ngắn nhất đúng sao.nhip', () => {
  const m = get(ma), n = bfsTay(m);
  assert.equal(n, m.sao.nhip, 'đường dò ' + n + ' nhịp, ngưỡng ' + m.sao.nhip);
});
const VL_DOI = VL_MOI.concat(VL_VIET_LAI, ['vong-lap.6']);     // vong-lap.6 đứng ngay sau vong-lap.4 (vong-lap.5 cất)
kiem('B5 đường cong chương vong-lap ở cặp có màn mới / viết lại / đổi chỗ: nhịp n ≤ max(1,5 × n−1, n−1 + 4), dòng so với màn không trình diễn đứng trước', () => {
  for (let i = 1; i < VL.length; i++) {
    const m = VL[i], t = VL[i - 1];
    if (m.hang === 'trum' || !VL_DOI.some((x) => x === m.ma || x === t.ma)) continue;
    assert.ok(tran(m.sao.nhip, t.sao.nhip, BU.nhip), m.ma + ' nhịp ' + m.sao.nhip + ' so với ' + t.ma + ' ' + t.sao.nhip);
    if (m.chiChay) continue;
    let j = i - 1; while (j > 0 && VL[j].chiChay) j--;
    assert.ok(tran(soDong(m), soDong(VL[j]), BU.dong), m.ma + ' dòng ' + soDong(m) + ' so với ' + VL[j].ma + ' ' + soDong(VL[j]));
  }
});
console.log('B. vong-lap: số | mã | tên | dòng | nhịp | ô | tay');
for (const m of VL) console.log('  ' + [m.so, m.ma + (VL_MOI.includes(m.ma) ? ' (mới)' : VL_VIET_LAI.includes(m.ma) ? ' (viết lại)' : ''), m.ten, soDong(m), m.sao.nhip, m.sao.o, dongBai(m.loiGiai).some((l) => TAY.test(l)) ? 'tay' : ''].join(' | '));

/* ================================================================== C. `not` ở chương che-cam-bien */
const CB = M.danhSach.filter((m) => m.chuong === 'che-cam-bien');
const coNot = (ds) => (ds || []).some((l) => !/^\s*#/.test(l) && /\bnot\b/.test(l));
kiem('C1 che-cam-bien.7 (not viết sẵn) đứng thứ 2, NGAY TRƯỚC che-cam-bien.2 (chế face_open với while not); chương vẫn 10 màn, hàng đúng', () => {
  assert.deepEqual(CB.map((m) => m.ma), [1, 7, 2, 11, 12, 13, 3, 14, 15, 16].map((n) => 'che-cam-bien.' + n));
  assert.deepEqual(CB.map((m) => m.hang), CB.map((_, i) => hangTheo(i)));
  assert.equal(get('che-cam-bien.7').so + 1, get('che-cam-bien.2').so);
});
kiem('C1 theo thứ tự lộ trình, lần đầu chữ not xuất hiện là ở MÃ MẪU của che-cam-bien.7 (người chơi thấy trước, đề bài nói not đảo ngược câu trả lời); lần đầu phải tự viết not là che-cam-bien.2', () => {
  const dau = M.danhSach.find((x) => coNot(dongBai(x.maMau)) || coNot(dongBai(x.loiGiai)));
  assert.equal(dau && dau.ma, 'che-cam-bien.7', 'not xuất hiện đầu tiên ở ' + (dau && dau.ma));
  const m7 = get('che-cam-bien.7');
  assert.ok(coNot(dongBai(m7.maMau)) && !coNot(dongBai(m7.loiGiai)), 'che-cam-bien.7: mã mẫu phải có not, lời giải bỏ not');
  assert.ok(/\bnot\b/.test(m7.deBai) && /đảo ngược/.test(m7.deBai), 'đề che-cam-bien.7 phải nói not đảo ngược câu trả lời');
  const tuViet = M.danhSach.find((x) => coNot(dongBai(x.loiGiai)) && !coNot(dongBai(x.maMau)));
  assert.equal(tuViet && tuViet.ma, 'che-cam-bien.2');
  assert.ok(/while not front_clear\(\)/.test(dongBai(get('che-cam-bien.2').loiGiai).join('\n')));
});
kiem('C2 che-cam-bien.7: lời giải 3 sao đúng ngưỡng, không chẩn đoán; mã mẫu thua và xe không nhúc nhích (thấy ngay not làm ngược); đâm tường là thua', () => {
  const m = get('che-cam-bien.7');
  const r = cham(m, m.loiGiai);
  assert.ok(r.thang && r.sao === 3, JSON.stringify(maCua(r)));
  assert.equal(r.soO, m.sao.o); assert.equal(r.soNhip, m.sao.nhip);
  assert.deepEqual(maCua(r), []);
  const rm = cham(m, m.maMau);
  assert.ok(!rm.thang && rm.soNhip === 0, 'mã mẫu ' + rm.soNhip + ' nhịp, thắng=' + rm.thang);
  assert.ok(m.damLaThua);
  const bo = cham(m, { chinh: m.maMau.chinh, hamCuaMan: [{ ten: 'safe_move2', thamSo: [], than: ['move()'] }] });
  assert.ok(!bo.thang && maCua(bo).includes('dam-tuong'), 'bỏ hẳn if (tiến bốn lần) phải đâm tường: ' + maCua(bo));
});
kiem('C3 đường cong ba màn đầu che-cam-bien (che-cam-bien.1 → .7 → .2 → .11): nhịp n ≤ max(1,5 × n−1, n−1 + 4)', () => {
  for (let i = 1; i < 4; i++) assert.ok(tran(CB[i].sao.nhip, CB[i - 1].sao.nhip, BU.nhip), CB[i].ma + ' nhịp ' + CB[i].sao.nhip + ' so với ' + CB[i - 1].ma + ' ' + CB[i - 1].sao.nhip);
});
console.log('C. che-cam-bien (ba màn đầu): ' + CB.slice(0, 4).map((m) => m.so + ' ' + m.ma + ' ' + m.sao.nhip + ' nhịp' + (coNot(dongBai(m.maMau)) ? ' (not trong mã mẫu)' : coNot(dongBai(m.loiGiai)) ? ' (tự viết not)' : '')).join(' · '));

console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra brief SM1-B (gói 1, 2, 3 mùa 1)' + (LOI_GIA ? ' [lỗi giả: phải có HỎNG]' : '') + '.');
if (LOI_GIA ? hong === 0 : hong) process.exitCode = 1;

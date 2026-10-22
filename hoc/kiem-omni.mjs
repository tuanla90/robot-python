/* ============================================================================
   kiem-omni.mjs — máy kiểm chương `omni` (Bánh omni) của "Đường học".
   Gồm: luật omni (có mọi lệnh bánh của xe hai bánh; thêm slide_left / slide_right trượt ngang 1 ô theo HƯỚNG MẶT ở cả
   4 hướng, không đổi hướng; KHÔNG ĐI CHÉO: slide cộng lệnh bánh = chỉ slide; slide_left + slide_right cùng nhịp = lệnh sau
   bị bỏ; tay hạ chặn trượt; không leo bậc thang; băng chuyền đẩy MẠNH HƠN: 1 nhịp trên băng là bị đẩy 1 ô, xuôi băng
   2 ô / nhịp, ngược băng đứng im), bộ dò đường tắt cho omni (do-duong-omni.mjs) và so chéo với san-hoc.js bằng chương trình
   ngẫu nhiên, dữ liệu 10 màn, canHam (không dùng hàm trượt thì tràn khung), chẩn đoán 'omni-khong-cheo' và 'slide-goi-lai',
   Xưởng hàm với omni, so omni với xe hai bánh trên cùng sân và bảng 10 màn.
   Các kiểm chung cho cả 90 màn (đi tuần tự, sao, lời sai, đường tắt BFS…) nằm ở kiem-hoc.mjs.
   Chạy: node hoc/kiem-omni.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { nhipOmniNganNhat, buocMotNhip, dungNguCanh, trangThaiDau, hanhDongTuDo, chuoiThanhMa, TO_HOP, soOCoNganNhat, SLIDE_TRAI, SLIDE_PHAI } from './do-duong-omni.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
require(path.join(day, 'man-chuoi-2.js'));
require(path.join(day, 'man-tay-gap.js'));
require(path.join(day, 'man-vong-lap.js'));
require(path.join(day, 'man-bang-chuyen.js'));
require(path.join(day, 'man-tham-so.js'));
require(path.join(day, 'man-nhen.js'));
require(path.join(day, 'man-xich.js'));
const ManHoc = require(path.join(day, 'man-omni.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
/** n lần `lenh`, mỗi lần có wait() theo sau nếu coWait. */
const LAP2 = (n, lenh, coWait) => { const kq = []; for (let i = 0; i < n; i++) { kq.push(lenh); if (coWait) kq.push('wait()'); } return kq; };
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const vt = (r) => r.x + ',' + r.y;
const maSK = (kq, ma) => kq.suKien.filter((e) => e.ma === ma);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');

const ds = ManHoc.danhSach.filter((m) => m.chuong === 'omni');
const tatCa = ManHoc.danhSach;
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];

/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải). */
function khoTruoc(id) {
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  for (const m of tatCa) {
    if (m.id === id) break;
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi) {
      if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo, { taoHam: m.taoHam });
      kho.sua(h.ten, h.than);
    }
  }
  return kho.ds();
}
const tron = (kho, moi) => {
  const kq = kho.map((h) => H(h.ten, h.than.slice(), h.thamSo.slice()));
  for (const h of moi || []) { const i = kq.findIndex((x) => x.ten === h.ten); const b = H(h.ten, h.than.slice(), (h.thamSo || []).slice()); if (i >= 0) kq[i] = b; else kq.push(b); }
  return kq;
};
const man = (id) => ManHoc.tim(id);
const chamGiai = (m) => ChamHoc.cham(m, m.loiGiai, tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi));

const OMNI = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait'];
const OMNI_TAY = OMNI.concat(['arm_down', 'arm_up', 'grab', 'release']);
const L = (...d) => d.join('\n') + '\n';
const lapLenh = (l, n) => Array(n).fill(l).join('\n') + '\n';
const omni = (rows, bd, code, extra) => SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'omni' }, extra || {}), code);
const omniTay = (rows, bd, code, extra) => omni(rows, bd, code, Object.assign({ hamGoc: OMNI_TAY }, extra || {}));
const TRONG = ['.......', '.......', '.......', '.......', '.......'];
const O = (h) => ({ x: 3, y: 2, huong: h });
const TIEN = L('left_move()', 'right_move()', 'wait()');
const SR = L('slide_right()', 'wait()'), SL = L('slide_left()', 'wait()');
const CHINH_10_CHUAN = 'slide_l(1),pick(),slide_r(1),forward(2),slide_r(2),forward(3),drop()';

/** Số nhịp ngắn nhất của XE HAI BÁNH (tiến, quay trái, quay phải, chờ; băng đẩy sau 2 nhịp) trên một sân. null nếu không tới. */
/** Ô xe hai bánh (không tay) không vào: luật chặn của lõi + hố u + vật / thùng nặng / cửa đóng (màn gặp khó, 15/10). */
const chanBanh = (san, x, y) => { const c = san.o[y] && san.o[y][x]; return !!SanHoc.lyDoChan(san, 'banh', x, y) || 'uoXHhC'.includes(c); };
function nhipBanhNganNhat(m) {
  const san = SanHoc.docSan(m.san), bd = m.batDau;
  const khoa = (s) => [s.x, s.y, s.h, s.d].join();
  let lop = [{ x: bd.x, y: bd.y, h: bd.huong, d: 0 }];
  const thay = new Set([khoa(lop[0])]);
  for (let b = 1; b <= 400 && lop.length; b++) {
    const tiep = [];
    for (const s of lop) for (const a of ['tien', 'trai', 'phai', 'cho']) {
      let { x, y, h, d } = s;
      if (a === 'tien') { const v = SanHoc.VEC[h]; if (!chanBanh(san, x + v[0], y + v[1])) { x += v[0]; y += v[1]; } }
      else if (a === 'trai') h = (h + 3) % 4; else if (a === 'phai') h = (h + 1) % 4;
      const o = san.o[y][x];
      if (SanHoc.BANG[o] !== undefined) {
        d++;
        if (d >= 2) { const v = SanHoc.VEC[SanHoc.BANG[o]]; if (!chanBanh(san, x + v[0], y + v[1])) { x += v[0]; y += v[1]; } d = 0; }
      } else d = 0;
      if (san.o[y][x] === 'F') return b;
      const n = { x, y, h, d };
      if (!thay.has(khoa(n))) { thay.add(khoa(n)); tiep.push(n); }
    }
    lop = tiep;
  }
  return null;
}

/* ====================================================== 1. LUẬT TRƯỢT THEO HƯỚNG MẶT */
console.log('\n== 1. Omni: có mọi lệnh bánh của xe hai bánh; slide_left / slide_right trượt 1 ô theo hướng mặt ==');
{
  kiem('HAM_GOC.omni = bộ lệnh xe bánh + slide_left, slide_right (+ wait)', J(SanHoc.HAM_GOC.omni) === J(OMNI) && SanHoc.HAM_GOC.banh.every((t) => SanHoc.HAM_GOC.omni.includes(t)));
  kiem('OMNI_TRUOT: slide_left = -1, slide_right = +1', J(SanHoc.OMNI_TRUOT) === J({ slide_left: -1, slide_right: 1 }));
  // 4 hướng: vị trí sau slide_right / slide_left
  const VEC = SanHoc.VEC, huongTen = SanHoc.TEN_HUONG;
  for (let h = 0; h < 4; h++) {
    const r = omni(TRONG, O(h), SR), l = omni(TRONG, O(h), SL);
    const dr = VEC[(h + 1) % 4], dl = VEC[(h + 3) % 4];
    kiem('xe quay mặt ' + huongTen[h] + ': slide_right() sang (' + dr + '), slide_left() sang (' + dl + '); 1 nhịp, hướng mặt không đổi',
      vt(r.robot) === (3 + dr[0]) + ',' + (2 + dr[1]) && vt(l.robot) === (3 + dl[0]) + ',' + (2 + dl[1]) && r.robot.huong === h && l.robot.huong === h && r.nhip === 1 && l.nhip === 1 && !r.suKien.length && !l.suKien.length, J([r.robot, l.robot]));
  }
  kiem('mặt lên: slide_right() đi sang phải màn hình, slide_left() sang trái; mặt sang trái: slide_right() đi LÊN màn hình',
    vt(omni(TRONG, O(0), SR).robot) === '4,2' && vt(omni(TRONG, O(0), SL).robot) === '2,2' && vt(omni(TRONG, O(3), SR).robot) === '3,1' && vt(omni(TRONG, O(3), SL).robot) === '3,3');
  kiem('slide là một nhịp; wait() trôi một nhịp; trượt n lần = n nhịp, n ô', (() => { const r = omni(TRONG, O(0), lapLenh(SR.trim(), 3)); return r.nhip === 3 && vt(r.robot) === '6,2'; })());
  kiem('vết nhịp của omni có robot.truot: +1 phải, -1 trái, 0 khi không trượt; bánh ghi 0/0 ở nhịp trượt', (() => {
    const r = omni(TRONG, O(0), SR + SL + TIEN);
    const t = nhipVet(r).map((n) => n.robot.truot);
    return J(t) === '[1,-1,0]' && J(nhipVet(r)[0].robot.banh) === '{"trai":0,"phai":0}' && J(nhipVet(r)[2].robot.banh) === '{"trai":1,"phai":1}';
  })());
  kiem('chỉ ra lệnh slide mà thiếu wait(): lệnh không chạy, ghi quen-wait', (() => { const r = omni(TRONG, O(0), 'slide_right()'); return vt(r.robot) === '3,2' && r.nhip === 0 && maSK(r, 'quen-wait').length === 1; })());
  kiem('slide_left() ngoài danh sách hamGoc của xe bánh là lỗi chạy; xe bánh, nhện, xích không có slide', ['banh', 'nhen', 'xich'].every((loai) => {
    try { SanHoc.chay({ san: TRONG, batDau: O(0), loaiRobot: loai, hamGoc: OMNI }, 'wait()'); return false; } catch (e) { return /không thuộc loại robot/.test(e.message); }
  }) && ['banh', 'nhen', 'xich'].every((loai) => { const r = SanHoc.chay({ san: TRONG, batDau: O(0), loaiRobot: loai }, 'slide_right()\nwait()'); return r.loi && r.loi.loai === 'runtime-error'; }));

  // mọi lệnh bánh cũ vẫn đúng
  const r0 = omni(TRONG, { x: 3, y: 4, huong: 0 }, lapLenh(TIEN.trim(), 3));
  kiem('move() cũ (left_move + right_move + wait) chạy đúng: 3 lần = 3 ô lên, 3 nhịp', vt(r0.robot) === '3,1' && r0.nhip === 3);
  kiem('lùi: left_back + right_back lùi 1 ô', vt(omni(TRONG, O(0), L('left_back()', 'right_back()', 'wait()')).robot) === '3,3');
  kiem('turn_right() cũ (left_move + wait) quay phải 90° trong 1 nhịp; turn_left() cũ (right_move + wait) quay trái; u_turn() (turn_right hai lần) quay đầu 180° trong 2 nhịp',
    omni(TRONG, O(0), L('left_move()', 'wait()')).robot.huong === 1 && omni(TRONG, O(0), L('right_move()', 'wait()')).robot.huong === 3 && (() => { const r = omni(TRONG, O(0), lapLenh(L('left_move()', 'wait()').trim(), 2)); return r.robot.huong === 2 && r.nhip === 2; })());
  kiem('quay đầu 180° trong MỘT nhịp (trái tiến, phải lùi) như xe bánh, không như xích', (() => { const r = omni(TRONG, O(0), L('left_move()', 'right_back()', 'wait()')); return r.robot.huong === 2 && r.nhip === 1; })());
  kiem('xe omni quay xong rồi slide: hướng mới quyết định bên trượt (quay phải rồi slide_right đi xuống)', vt(omni(TRONG, O(0), L('left_move()', 'wait()') + SR).robot) === '3,3');
  kiem('không có quay dở (khác xích): robot.quayDo không tồn tại trên omni, vết nhịp không có quayDo', omni(TRONG, O(0), SR).quayDo === undefined && nhipVet(omni(TRONG, O(0), SR)).every((n) => n.robot.quayDo === undefined));
}

/* ====================================================== 2. KHÔNG ĐI CHÉO */
console.log('\n== 2. Không đi chéo: slide + lệnh bánh cùng nhịp = chỉ slide; hai lệnh slide cùng nhịp = lệnh sau bị bỏ ==');
{
  const A = O(0);
  for (const [mota, lenhs] of [
    ['tiến (cả hai bánh)', ['left_move()', 'right_move()']], ['lùi', ['left_back()', 'right_back()']],
    ['quay phải (chỉ bánh trái tiến)', ['left_move()']], ['quay trái (chỉ bánh phải tiến)', ['right_move()']], ['quay đầu (trái tiến, phải lùi)', ['left_move()', 'right_back()']]
  ]) {
    for (const [ten, sl, expected] of [['slide_right', 'slide_right()', '4,2'], ['slide_left', 'slide_left()', '2,2']]) {
      // thứ tự bất kỳ: lệnh bánh trước hoặc sau lệnh slide
      for (const truoc of [true, false]) {
        const code = truoc ? L(...lenhs, sl, 'wait()') : L(sl, ...lenhs, 'wait()');
        const r = omni(TRONG, A, code);
        kiem(ten + ' + ' + mota + (truoc ? ' (lệnh bánh viết trước)' : ' (slide viết trước)') + ': chỉ trượt ' + expected + ', hướng giữ nguyên, ghi omni-khong-cheo',
          vt(r.robot) === expected && r.robot.huong === 0 && r.nhip === 1 && maSK(r, 'omni-khong-cheo').length === 1, J([r.robot, r.suKien]));
      }
    }
  }
  const e = maSK(omni(TRONG, A, L('left_move()', 'right_move()', 'slide_right()', 'wait()')), 'omni-khong-cheo')[0];
  kiem('sự kiện omni-khong-cheo nêu nhịp, lệnh bánh bị bỏ (left_move, dòng 1) và lệnh trượt (slide_right, dòng 3)', e.nhip === 1 && e.lenh.ten === 'left_move' && e.lenh.dongPy === 1 && e.truot.ten === 'slide_right' && e.truot.dongPy === 3, J(e));
  kiem('slide đơn lẻ, hay lệnh bánh đơn lẻ: KHÔNG ghi omni-khong-cheo', !maSK(omni(TRONG, A, SR + TIEN), 'omni-khong-cheo').length);
  kiem('hai nhịp tách bằng wait() thì trượt rồi tiến (không mất lệnh nào): đi (4,2) rồi lên (4,1)', (() => { const r = omni(TRONG, A, SR + TIEN); return vt(r.robot) === '4,1' && r.nhip === 2; })());
  kiem('"đi chéo" bằng cách gộp một lần trượt với move() trong cùng nhịp CHỈ trượt, nhịp sau mới tiến: stair lỗi', (() => {
    const code = L('def move():', '    left_move()', '    right_move()', '    wait()', 'slide_right()', 'move()', 'slide_right()', 'move()');
    const r = omni(TRONG, A, code);
    return vt(r.robot) === '5,2' && maSK(r, 'omni-khong-cheo').length === 2;
  })());
  // hai lệnh slide cùng nhịp
  const g = omni(TRONG, A, L('slide_left()', 'slide_right()', 'wait()'));
  kiem('slide_left() rồi slide_right() cùng nhịp: lệnh đầu thắng (trượt trái), lệnh sau bị bỏ (slide-goi-lai)', vt(g.robot) === '2,2' && maSK(g, 'slide-goi-lai').length === 1 && g.nhip === 1);
  const g2 = omni(TRONG, A, L('slide_right()', 'slide_right()', 'wait()'));
  kiem('hai lần slide_right() cùng nhịp cũng chỉ trượt một ô: slide-goi-lai nêu nhịp, lệnh bị bỏ (dòng 2) và lệnh đã giữ nhịp (dòng 1)',
    vt(g2.robot) === '4,2' && (() => { const e2 = maSK(g2, 'slide-goi-lai')[0]; return e2 && e2.nhip === 1 && e2.ten === 'slide_right' && e2.dongPy === 2 && e2.truoc.ten === 'slide_right' && e2.truoc.dongPy === 1; })(), J(g2.suKien));
  kiem('slide-goi-lai ghi nhịp đúng khi xảy ra ở nhịp thứ ba', (() => { const r = omni(TRONG, A, SR + SR + L('slide_right()', 'slide_left()', 'wait()')); return maSK(r, 'slide-goi-lai')[0].nhip === 3 && vt(r.robot) === '6,2'; })());
  // slide + hai lệnh bánh gọi lại: banh-goi-lai vẫn riêng
  const g3 = omni(TRONG, A, L('left_move()', 'left_move()', 'slide_right()', 'wait()'));
  kiem('banh-goi-lai vẫn ghi riêng (hai lệnh cho bánh trái) kèm omni-khong-cheo', maSK(g3, 'banh-goi-lai').length === 1 && maSK(g3, 'omni-khong-cheo').length === 1 && vt(g3.robot) === '4,2');
  // đâm tường khi trượt
  const t = omni(['..#..'], { x: 1, y: 0, huong: 0 }, SR);
  kiem('trượt vào tường: đứng yên, mất 1 nhịp, ghi dam-tuong (vat tuong)', vt(t.robot) === '1,0' && t.nhip === 1 && maSK(t, 'dam-tuong').length === 1 && maSK(t, 'dam-tuong')[0].vat === 'tuong');
  kiem('trượt ra ngoài sân: dam-tuong với vat ngoai-san', maSK(omni(['..#..'], { x: 0, y: 0, huong: 0 }, SL), 'dam-tuong')[0].vat === 'ngoai-san');
  kiem('bậc thang S chặn omni (như xe bánh): đi hay trượt vào S đều dam-tuong bac-thang; lyDoChan omni', (() => {
    const s = omni(['.S'], { x: 0, y: 0, huong: 0 }, SR), m = omni(['.', 'S'], { x: 0, y: 0, huong: 2 }, TIEN);
    return maSK(s, 'dam-tuong')[0].vat === 'bac-thang' && maSK(m, 'dam-tuong')[0].vat === 'bac-thang' && SanHoc.lyDoChan(SanHoc.docSan(['S']), 'omni', 0, 0) === 'bac-thang';
  })());
}

/* ====================================================== 3. TAY KẸP CỦA OMNI */
console.log('\n== 3. Tay kẹp của omni: tay hạ thì không đi, không quay, không trượt; tay nâng cùng nhịp với slide thì được; vật đi theo ==');
{
  // luật vật mới: vật nằm đất chiếm ô; tay gắp / thả ở ô TRƯỚC MẶT (xe ở (2,2) mặt lên, vật ở (2,1) ngay trước mặt)
  const S = ['.......', '..o....', '.......', '.......', '.......'];
  const bd = { x: 2, y: 2, huong: 0 };
  const a = omniTay(S, bd, L('arm_down()', 'grab()', 'wait()'));
  kiem('arm_down + grab + wait: một nhịp nhặt được vật ở ô trước mặt', a.nhip === 1 && a.tay.cam === 1 && a.vat[0].trangThai === 'cam');
  const b = omniTay(S, bd, L('arm_down()', 'slide_right()', 'wait()'));
  kiem('tay hạ mà ra lệnh trượt: lệnh bị bỏ (tay-vuong, lenh = slide_right), xe không trượt', maSK(b, 'tay-vuong').length === 1 && maSK(b, 'tay-vuong')[0].lenh.ten === 'slide_right' && vt(b.robot) === '2,2' && nhipVet(b)[0].robot.truot === 0, J(b.suKien));
  const c = omniTay(S, bd, L('arm_down()', 'left_move()', 'right_move()', 'wait()'));
  kiem('tay hạ mà ra lệnh bánh: tay vướng như xe bánh (lenh = left_move)', maSK(c, 'tay-vuong').length === 1 && maSK(c, 'tay-vuong')[0].lenh.ten === 'left_move' && vt(c.robot) === '2,2');
  const d = omniTay(S, bd, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'slide_right()', 'wait()'));
  kiem('pick() rồi nâng tay chung nhịp với slide_right(): nâng tay xong mới trượt, vật đi theo xe', d.nhip === 2 && vt(d.robot) === '3,2' && d.vat[0].x === 3 && d.vat[0].trangThai === 'cam' && !d.suKien.length, J([d.robot, d.vat, d.suKien]));
  const e = omniTay(S, bd, L('arm_down()', 'grab()', 'wait()', 'slide_right()', 'wait()'));
  kiem('nhặt xong KHÔNG nâng tay rồi trượt: tay vướng sàn, xe không trượt', maSK(e, 'tay-vuong').length === 1 && vt(e.robot) === '2,2');
  const f = omniTay(S, bd, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'slide_left()', 'wait()', 'arm_down()', 'release()', 'wait()'), { mucTieu: 'dua-vat', dich: [{ x: 1, y: 1 }] });
  kiem('mục tiêu dua-vat với omni: nhặt vật trước mặt, nâng, trượt trái, hạ tay thả xuống ô đích trước mặt → thắng sau 4 nhịp', f.thang && f.nhip === 4, J([f.thang, f.nhip]));
  kiem('thả khi tay nâng sau khi trượt: vật vỡ (vat-vo), dừng sớm', (() => { const r = omniTay(S, bd, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'slide_left()', 'wait()', 'release()', 'wait()'), { mucTieu: 'dua-vat', dich: [{ x: 1, y: 1 }] }); return !r.thang && r.dungSom === 'vat-vo'; })());
  kiem('tay hạ trước, slide ra lệnh nhưng tay nâng ở cùng nhịp (arm_up + slide) → trượt được', (() => { const r = omniTay(S, bd, L('arm_down()', 'wait()', 'arm_up()', 'slide_left()', 'wait()')); return vt(r.robot) === '1,2' && !maSK(r, 'tay-vuong').length; })());
  kiem('không khai lệnh tay thì omni gọi arm_down() là lỗi chạy', (() => { const r = omni(S, bd, 'arm_down()\nwait()'); return r.loi && r.loi.loai === 'runtime-error' && r.tay === null; })());
}

/* ====================================================== 4. BĂNG CHUYỀN ĐẨY OMNI MẠNH HƠN */
console.log('\n== 4. Băng chuyền: omni bị đẩy ngay sau 1 nhịp; xuôi băng 2 ô / nhịp; ngược băng đứng im ==');
{
  const BANG_PHAI = ['.......', '.......', '.>>>>>.', '.......', '.......'];
  kiem('đứng chờ 1 nhịp trên băng xuôi chiều: omni bị đẩy 1 ô (xe bánh phải 2 nhịp)', (() => {
    const o1 = omni(BANG_PHAI, { x: 1, y: 2, huong: 1 }, 'wait()');
    const b1 = SanHoc.chay({ san: BANG_PHAI, batDau: { x: 1, y: 2, huong: 1 }, loaiRobot: 'banh' }, 'wait()');
    return vt(o1.robot) === '2,2' && vt(b1.robot) === '1,2' && maSK({ suKien: nhipVet(o1)[0].suKien }, 'bang-day').length === 1;
  })());
  kiem('mỗi nhịp đứng trên băng omni bị đẩy tiếp: wait 3 lần = 3 ô', vt(omni(BANG_PHAI, { x: 1, y: 2, huong: 1 }, lapLenh('wait()', 3)).robot) === '4,2');
  for (const [c, dx, dy] of [['>', 1, 0], ['<', -1, 0], ['^', 0, -1], ['v', 0, 1]]) {
    const r = omni(['.....', '.....', '..' + c + '..', '.....', '.....'], { x: 2, y: 2, huong: 0 }, 'wait()');
    kiem('băng "' + c + '" đẩy omni 1 ô theo chiều mũi tên sau 1 nhịp đứng yên', vt(r.robot) === (2 + dx) + ',' + (2 + dy), vt(r.robot));
  }
  kiem('đi XUÔI băng bằng move(): 2 ô mỗi nhịp (tự đi 1 + băng đẩy 1)', (() => {
    const r = omni(['>>>>>>>>>'], { x: 0, y: 0, huong: 1 }, lapLenh(TIEN.trim(), 3));
    return vt(r.robot) === '6,0' && r.nhip === 3;
  })());
  kiem('đi xuôi băng bằng slide_right(): cũng 2 ô / nhịp (mặt lên, băng sang phải)', (() => { const r = omni(['>>>>>>>>>'], { x: 0, y: 0, huong: 0 }, lapLenh(SR.trim(), 3)); return vt(r.robot) === '6,0' && r.nhip === 3; })());
  kiem('đi NGƯỢC băng: bước lên ô băng rồi bị đẩy về chỗ cũ, đứng im mãi', (() => {
    const r = omni(['.<<<<<.'], { x: 0, y: 0, huong: 0 }, lapLenh(SR.trim(), 5));
    return vt(r.robot) === '0,0' && r.nhip === 5;
  })());
  kiem('đi ngược băng 8 nhịp: xe bánh còn nhích được (bị đẩy lùi cứ 2 nhịp một lần, tiến chậm), omni đứng im ở ô xuất phát', (() => {
    const san = ['.<<<<<<<F'], bd = { x: 0, y: 0, huong: 1 };
    const b = SanHoc.chay({ san, batDau: bd, loaiRobot: 'banh' }, lapLenh(TIEN.trim(), 8)), o = omni(san, bd, lapLenh(TIEN.trim(), 8));
    return !b.thang && b.robot.x > 0 && !o.thang && vt(o.robot) === '0,0';
  })());
  kiem('băng đẩy vào tường thì đứng yên (bang-chan), không phải đâm tường chẩn đoán', (() => {
    const r = omni(['.>#'], { x: 1, y: 0, huong: 0 }, 'wait()');
    return vt(r.robot) === '1,0' && nhipVet(r)[0].suKien.some((s) => s.ma === 'bang-chan') && !r.suKien.some((s) => s.ma === 'bang-chan');
  })());
  kiem('băng ngang đẩy omni đang đi lên cắt qua: ra khỏi ô băng thì thôi, vị trí lệch 1 ô (hành lang 1 ô bị tường chặn thì không lệch)', (() => {
    const lech = omni(['...', '.>.', '...'], { x: 1, y: 2, huong: 0 }, TIEN);
    const hep = omni(['#.#', '#>#', '#.#'], { x: 1, y: 2, huong: 0 }, TIEN);
    return vt(lech.robot) === '2,1' && vt(hep.robot) === '1,1';
  })());
  kiem('băng đẩy omni tới cờ thì thắng ngay (không cần tự bước vào cờ)', (() => { const r = omni(['.>F'], { x: 1, y: 0, huong: 0 }, 'wait()'); return r.thang && r.nhip === 1; })());
  kiem('băng đẩy chồng: omni đứng trên ô băng sau khi bị đẩy lên ô băng khác chỉ bị đẩy MỘT lần mỗi nhịp', (() => { const r = omni(['>>>>>'], { x: 0, y: 0, huong: 0 }, 'wait()'); return vt(r.robot) === '1,0'; })());
  kiem('omni đang cầm vật: vật đi theo xe khi bị băng đẩy', (() => {
    const r = omniTay(['.o>>>>.'], { x: 0, y: 0, huong: 1 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'));
    return vt(r.robot) === '3,0' && r.vat[0].trangThai === 'cam' && r.vat[0].x === 3;
  })());
  kiem('xích và nhện KHÔNG bị đổi luật băng: nhện vẫn đứng 2 nhịp mới bị đẩy, xích vẫn không bị đẩy', (() => {
    const san = ['.>>>>.'], bd = { x: 1, y: 0, huong: 1 };
    const x = SanHoc.chay({ san, batDau: bd, loaiRobot: 'xich' }, 'wait()\nwait()'), n = SanHoc.chay({ san, batDau: bd, loaiRobot: 'nhen' }, 'wait()');
    const n2 = SanHoc.chay({ san, batDau: bd, loaiRobot: 'nhen' }, 'wait()\nwait()');
    return vt(x.robot) === '1,0' && vt(n.robot) === '1,0' && vt(n2.robot) === '2,0';
  })());
}

/* ====================================================== 5. BỘ DÒ ĐƯỜNG TẮT CHO OMNI */
console.log('\n== 5. Bộ dò đường tắt cho omni (BFS theo nhịp) và so chéo với san-hoc.js ==');
{
  const bfs = (san, bd, ex) => nhipOmniNganNhat(Object.assign({ loaiRobot: 'omni', san, batDau: bd }, ex || {}));
  kiem('đường ngang 4 ô = 4 nhịp trượt (không cần quay)', bfs(['.....F'].map((s) => s.slice(1)), { x: 0, y: 0, huong: 0 }).nhip === 4);
  kiem('xe mặt lên, cờ bên phải 2 ô và 2 ô lên: 4 nhịp (không đi chéo, không quay)', bfs(['..F', '...', '...'].map((s) => s + '.'), { x: 0, y: 2, huong: 0 }).nhip === 4);
  kiem('BFS biết lùi: cờ ngay sau lưng 3 ô thì lùi 3 nhịp, không quay đầu', bfs(['F...'], { x: 3, y: 0, huong: 1 }).nhip === 3);
  kiem('BFS biết quay: ở hành lang một cột thì quay không hơn gì trượt/tiến (xe mặt lên, hành lang ngang: trượt)', bfs(['...F'], { x: 0, y: 0, huong: 0 }).nhip === 3);
  kiem('bậc thang S chặn omni → cờ sau S không tới được (null)', bfs(['.SF'], { x: 0, y: 0, huong: 1 }).nhip === null);
  kiem('băng chuyền được tính: xuôi băng "..>>>>F" nhanh hơn đi bộ; ngược băng không qua được', bfs(['.>>>>.F'], { x: 0, y: 0, huong: 1 }).nhip === 4 && bfs(['.<<<<.F'], { x: 0, y: 0, huong: 1 }).nhip === null);
  kiem('cờ bị tường vây kín → null', bfs(['.....', '.###.', '.#F#.', '.###.', '.....'], { x: 0, y: 0, huong: 1 }).nhip === null);
  const co = bfs(['.o.D'], { x: 0, y: 0, huong: 1 }, { hamGoc: OMNI_TAY, mucTieu: 'dua-vat' });
  kiem('dua-vat: nhặt vật trước mặt (1: hạ tay + kẹp) + đi 2 (2, nâng tay gộp vào nhịp đi) + thả xuống ô đích trước mặt (1) = 4 nhịp', co.nhip === 4, String(co.nhip));
  kiem('chuoiThanhMa: mã sinh từ BFS chạy trong san-hoc.js cho đúng số nhịp (dua-vat)', (() => {
    const r = omniTay(['.o.D'], { x: 0, y: 0, huong: 1 }, chuoiThanhMa(co.chuoi), { mucTieu: 'dua-vat' });
    return r.thang && r.nhip === co.nhip;
  })());
  kiem('chuoiThanhMa viết slide_left() / slide_right() cho hành động 9 / 10', chuoiThanhMa([{ tuThe: null, kep: null, banh: SLIDE_TRAI }, { tuThe: null, kep: null, banh: SLIDE_PHAI }]) === L('slide_left()', 'wait()', 'slide_right()', 'wait()'));
  kiem('soOCoNganNhat: số ô ngắn nhất tới cờ (bỏ hướng), null nếu không tới', soOCoNganNhat({ san: ['..F'], batDau: { x: 0, y: 0, huong: 1 } }) === 2 && soOCoNganNhat({ san: ['.#F'], batDau: { x: 0, y: 0, huong: 1 } }) === null);

  // so chéo: chương trình ngẫu nhiên (xorshift cố định)
  let seed = 246813579;
  const rnd = (n) => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed % n; };
  const KY = '.....##SS>><<^^vv';
  const LENH_BANH = [[], ['left_move()'], ['right_move()'], ['left_back()'], ['right_back()'], ['left_move()', 'right_move()'], ['left_back()', 'right_back()']];
  let soCa = 0, lech = 0, ghiLech = '', soTruot = 0, soBang = 0, soCheo = 0, soVat = 0;
  for (let lan = 0; lan < 600; lan++) {
    const rong = 4 + rnd(3), cao = 4 + rnd(3);
    const rows = [];
    for (let y = 0; y < cao; y++) { let s = ''; for (let x = 0; x < rong; x++) s += KY[rnd(KY.length)]; rows.push(s); }
    const dat1 = (ch, n) => { for (let i = 0; i < n; i++) { const x = rnd(rong), y = rnd(cao); if (rows[y][x] === '.') rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1); } };
    dat1('o', 2); dat1('D', 2);
    let bd = null;
    for (let i = 0; i < 50 && !bd; i++) { const x = rnd(rong), y = rnd(cao); if (rows[y][x] !== '#' && rows[y][x] !== 'S') bd = { x, y, huong: rnd(4) }; }
    if (!bd) continue;
    const manR = { loaiRobot: 'omni', san: rows, batDau: bd, hamGoc: OMNI_TAY, mucTieu: 'dua-vat' };
    const ctx = dungNguCanh(manR), HD = hanhDongTuDo(ctx);
    const chuoi = [];
    for (let i = 0; i < 14; i++) chuoi.push(rnd(4) === 0 && chuoi.length ? chuoi[chuoi.length - 1] : HD[rnd(HD.length)]);
    // mã Python: hành động trượt có thể kèm lệnh bánh cùng nhịp (omni chỉ trượt)
    const dong = [];
    for (const a of chuoi) {
      if (a.tuThe === 'duoi') dong.push('arm_down()'); else if (a.tuThe === 'tren') dong.push('arm_up()');
      if (a.kep === 'kep') dong.push('grab()'); else if (a.kep === 'tha') dong.push('release()');
      if (a.banh >= SLIDE_TRAI) {
        const kem = LENH_BANH[rnd(LENH_BANH.length)];
        const sl = a.banh === SLIDE_TRAI ? 'slide_left()' : 'slide_right()';
        if (kem.length && rnd(2) === 0) { dong.push(...kem, sl); soCheo++; } else { dong.push(sl, ...kem); if (kem.length) soCheo++; }
      } else {
        const [t, p] = TO_HOP[a.banh];
        if (t === 1) dong.push('left_move()'); else if (t === -1) dong.push('left_back()');
        if (p === 1) dong.push('right_move()'); else if (p === -1) dong.push('right_back()');
      }
      dong.push('wait()');
    }
    const code = dong.join('\n') + '\n';
    let S = trangThaiDau(ctx), nhip = 0;
    for (const a of chuoi) { S = buocMotNhip(ctx, S, a); nhip++; }
    const kq = SanHoc.chay({ san: rows, batDau: bd, loaiRobot: 'omni', hamGoc: OMNI_TAY, mucTieu: 'toi-co' }, code);
    soCa++;
    const vatBfs = S.pos.map((p) => (p === -2 ? 'vo' : p === -1 ? 'cam' : (p % ctx.rong) + ',' + Math.floor(p / ctx.rong)));
    const vatSan = kq.vat.map((v) => (v.trangThai === 'vo' ? 'vo' : v.trangThai === 'cam' ? 'cam' : v.x + ',' + v.y));
    const tayBfs = S.t === 1 ? 'duoi' : 'tren';
    const ok = kq.robot.x === S.x && kq.robot.y === S.y && kq.robot.huong === S.h && kq.nhip === nhip && kq.tay.tuThe === tayBfs && J(vatBfs) === J(vatSan);
    if (chuoi.some((a) => a.banh >= SLIDE_TRAI)) soTruot++;
    if (nhipVet(kq).some((n) => n.suKien.some((s) => s.ma === 'bang-day'))) soBang++;
    if (S.pos.some((p) => p === -1 || p >= 0)) soVat++;
    if (!ok) { lech++; if (!ghiLech) ghiLech = J({ rows, bd, code, bfs: [S.x, S.y, S.h, nhip, tayBfs, vatBfs], san: [kq.robot.x, kq.robot.y, kq.robot.huong, kq.nhip, kq.tay.tuThe, vatSan] }); }
  }
  kiem('so chéo ' + soCa + ' chương trình ngẫu nhiên (sân có tường, bậc thang, băng 4 chiều, vật, đích, tay, slide kèm lệnh bánh cùng nhịp): BFS và san-hoc.js trùng vị trí, hướng, nhịp, tay, vật', soCa >= 550 && lech === 0, lech + ' lệch · ' + ghiLech);
  kiem('mẫu ngẫu nhiên có đủ các loại ca: nhiều chương trình có trượt (' + soTruot + '), băng đẩy (' + soBang + '), slide kèm lệnh bánh (' + soCheo + ')', soTruot >= 450 && soBang >= 100 && soCheo >= 100, [soTruot, soBang, soCheo].join(' / '));
}

/* ====================================================== 6. DỮ LIỆU 10 MÀN */
console.log('\n== 6. Dữ liệu 10 màn: omni, tay kẹp ở 6 và 10, hàm slide_r / slide_l, băng ở 7 và 10, hướng mặt ở 5 và 10 ==');
{
  kiem('đúng 10 màn, số 1..10, id theo vị trí trong thuTu (sau xich và che-xich), mã omni.1…, tên "Bánh omni"',
    ds.length === 10 && ds.every((m, i) => m.so === i + 1 && m.id === (ThuTu.thuTu.indexOf('omni') + 1) + '.' + (i + 1) && m.ma === 'omni.' + (i + 1)) && ThuTu.thuTu.indexOf('omni') > ThuTu.thuTu.indexOf('xich') && ThuTu.ten.omni === 'Bánh omni');
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ 11.10 có huy hiệu omni',
    J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) &&
      ds.filter((m) => m.huyHieu).length === 1 && ds[9].huyHieu.ma === 'omni' && ds[9].huyHieu.ten === 'Huy hiệu Bánh omni');
  kiem('mọi màn: loaiRobot omni, robot { than: "omni", tay }, cauTruc ["for","if"], Xưởng mở, được dùng hàm của em, chương trình 10 ô + mỗi hàm 10 ô',
    ds.every((m) => m.loaiRobot === 'omni' && m.robot && m.robot.than === 'omni' && J(m.cauTruc) === '["for","if"]' && m.moXuong === true && m.camHamCuaEm === false && m.khung.chinh === 10 && m.khung.moiHam === 10));
  kiem('tay kẹp chỉ ở 11.6 và 11.10 (robot.tay "kep", hamGoc có 4 lệnh tay, mục tiêu dua-vat); các màn khác tay null, hamGoc = bộ lệnh omni',
    ds.every((m) => { const co = ['19.6', '19.10'].includes(m.id); return co ? m.robot.tay === 'kep' && J(m.hamGoc) === J(OMNI_TAY) && m.mucTieu === 'dua-vat' : m.robot.tay === null && J(m.hamGoc) === J(OMNI) && m.mucTieu === undefined; }));
  kiem('sân tối đa 7×7; màn tới cờ có đúng một cờ F; màn dua-vat có vật và ô đích',
    ds.every((m) => m.san.length <= 7 && m.san[0].length <= 7 && (m.mucTieu === 'dua-vat' ? /o/.test(m.san.join('')) && /D/.test(m.san.join('')) : (m.san.join('').match(/F/g) || []).length === 1)));
  kiem('không màn nào có bậc thang S (omni không leo được); băng chuyền chỉ ở 11.7 và 11.10',
    ds.every((m) => !/S/.test(m.san.join(''))) && J(ds.filter((m) => /[<>^v]/.test(m.san.join(''))).map((m) => m.id)) === '["19.7","19.10"]');
  kiem('hướng mặt: 11.5 quay sang trái (huong 3), 11.10 quay sang phải (huong 1), các màn còn lại quay lên (huong 0)',
    ds.every((m) => m.batDau.huong === ({ '19.5': 3, '19.10': 1 }[m.id] || 0)));
  kiem('hàm cốt truyện mới: 11.3 tạo slide_r, 11.4 tạo slide_l; các màn khác không tạo; tên không trùng hàm cốt truyện chương trước và không phải hàm gốc',
    ds.every((m) => J(m.taoHam) === J({ '19.3': ['slide_r'], '19.4': ['slide_l'] }[m.id] || [])) &&
      (() => { const cu = tatCa.filter((m) => m.chuong !== 'omni').flatMap((m) => m.taoHam); return ['slide_r', 'slide_l'].every((t) => !cu.includes(t) && !KhoHam.HAM_GOC_MAC_DINH.includes(t) && tenCotTruyen.includes(t)); })());
  kiem('KhoHam.HAM_GOC_MAC_DINH có slide_left và slide_right (không đặt tên hàm trùng lệnh gốc)', ['slide_left', 'slide_right'].every((t) => KhoHam.HAM_GOC_MAC_DINH.includes(t)) && KhoHam.moi().tao('slide_left').ma === 'ten-trung-ham-goc');
  kiem('slide_r(n) và slide_l(n): một tham số n, 3 ô mỗi hàm (for i in range(n): lệnh trượt + wait), dùng slide_right / slide_left', (() => {
    const a = man('19.3').loiGiai.hamCuaEmMoi[0], b = man('19.4').loiGiai.hamCuaEmMoi[0];
    return a.ten === 'slide_r' && J(a.thamSo) === '["n"]' && KhungCode.soOHam(a) === 3 && a.than[0] === 'for i in range(n):' && a.than[1].trim() === 'slide_right()' &&
      b.ten === 'slide_l' && J(b.thamSo) === '["n"]' && KhungCode.soOHam(b) === 3 && b.than[0] === 'for i in range(n):' && b.than[1].trim() === 'slide_left()';
  })());
  kiem('hamCuaEmCan đúng: 11.1 [], 11.2 [move], 11.3 [move, forward], 11.4 [move, forward, slide_r], 11.5 [move, forward, slide_r, slide_l], 11.6 [move, forward, pick, drop], 11.7 [move, forward, slide_r], 11.8 [move, forward, slide_r], 11.9 [move, slide_r], 11.10 [move, forward, slide_r, slide_l, pick, drop]',
    ds.every((m) => J(m.hamCuaEmCan) === J({ '19.1': [], '19.2': ['move'], '19.3': ['move', 'forward'], '19.4': ['move', 'forward', 'slide_r'], '19.5': ['move', 'forward', 'slide_r', 'slide_l'], '19.6': ['move', 'forward', 'pick', 'drop'], '19.7': ['move', 'forward', 'slide_r'], '19.8': ['move', 'forward', 'slide_r'], '19.9': ['move', 'slide_r'], '19.10': ['move', 'forward', 'slide_r', 'slide_l', 'pick', 'drop'] }[m.id])));
  kiem('kho lúc tới mỗi màn có đủ hàm cần: ⊆ kho thật (chạy tuần tự)', ds.every((m) => { const t = khoTruoc(m.id).map((h) => h.ten); return m.hamCuaEmCan.every((x) => t.includes(x)); }));
  kiem('lời giải 3 sao với kho thật; ô và nhịp khớp sao của đề, không chẩn đoán nào', ds.every((m) => { const r = chamGiai(m); return r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0; }));

  // đường tắt
  for (const m of ds) {
    const b = nhipOmniNganNhat(m), r = chamGiai(m);
    const tk = m.nhipTheoLoiGiai === true;
    kiem(m.id + ' không có ĐƯỜNG TẮT: BFS ' + b.nhip + (tk ? ' ≤ ' : ' = ') + 'nhịp lời giải ' + r.soNhip + ' (sao.nhip ' + m.sao.nhip + ')',
      b.nhip !== null && !b.catNgang && r.soNhip === m.sao.nhip && (tk ? b.nhip <= m.sao.nhip : b.nhip === m.sao.nhip), J([b.nhip, r.soNhip, m.sao.nhip]));
  }
  kiem('nhipTheoLoiGiai chỉ ở màn có pick / drop (11.6, 11.10); chênh BFS đúng 1 nhịp (nâng tay của pick() gộp được vào nhịp trượt)',
    ds.every((m) => (m.nhipTheoLoiGiai === true) === ['19.6', '19.10'].includes(m.id)) && ['19.6', '19.10'].every((id) => { const m = man(id); return m.sao.nhip - nhipOmniNganNhat(m).nhip === 1; }));

  // canHam: không dùng hàm trượt (và hàm tiến) thì tràn khung
  const trai = (dsd, tenHam, than) => dsd.flatMap((s) => (s.replace(/\(.*\)/, '') === tenHam ? than(s) : [s]));
  const soLan = (s) => Number((/\((\d+)\)/.exec(s) || [])[1]);
  const noiLien = (id) => {
    const m = man(id);
    let chinh = m.loiGiai.chinh.slice();
    chinh = trai(chinh, 'slide_r', (s) => ['for i in range(' + soLan(s) + '):', '    slide_right()', '    wait()']);
    chinh = trai(chinh, 'slide_l', (s) => ['for i in range(' + soLan(s) + '):', '    slide_left()', '    wait()']);
    return chinh;
  };
  for (const m of ds.filter((x) => x.canHam)) {
    const chinh = noiLien(m.id);
    const r = ChamHoc.cham(m, { chinh }, khoTruoc(m.id));
    kiem(m.id + ' canHam ' + m.canHam + ': viết thẳng các vòng trượt (giữ forward / pick / drop của kho) thì ' + KhungCode.soDong(chinh) + ' dòng > 10 ô, tran-khung, không chạy',
      m.canHam === 'tran-khung' && KhungCode.soDong(chinh) > m.khung.chinh && maCua(r).includes('tran-khung') && !r.thang && r.sao === 0, J([KhungCode.soDong(chinh), maCua(r)]));
  }
  kiem('canHam chỉ ở 11.3, 11.4, 11.10', J(ds.filter((m) => m.canHam).map((m) => m.id)) === J(['19.3', '19.4', '19.10']));

  // 11.1
  const m91 = man('19.1');
  { const r = ChamHoc.cham(m91, m91.maMau, khoTruoc('19.1')); const n = r.theoSan[0].vet.filter((e) => e.loai === 'nhip');
    kiem('11.1: maMau trượt xe một ô sang phải (robot.truot +1) mà mặt xe vẫn quay lên (huong 0); chưa tới cờ', !r.thang && n.length === 1 && n[0].robot.x === 1 && n[0].robot.huong === 0 && n[0].robot.truot === 1); }
  kiem('11.1: xe hai bánh cùng sân cần quay: 5 nhịp (1 quay + 4 tiến) > omni 4 nhịp', nhipBanhNganNhat(m91) === 5 && nhipOmniNganNhat(m91).nhip === 4);
  kiem('11.1: lời giải chỉ dùng hàm gốc, không dùng hàm của em (hamDaDung rỗng)', chamGiai(m91).hamDaDung.length === 0);
  // 11.2
  const m92 = man('19.2');
  kiem('11.2: tường chắn giữa cột giữa; lời giải trượt PHẢI rồi TRÁI: vòng bên trái (trượt trái rồi phải) cũng 6 nhịp (đối xứng)',
    m92.san[2] === '.#.' && m92.san[0] === '#F#' && chamGiai(m92).soNhip === 6 && (() => {
      const doi = { chinh: m92.loiGiai.chinh.map((s) => (s === 'slide_right()' ? 'slide_left()' : s === 'slide_left()' ? 'slide_right()' : s)) };
      const r = ChamHoc.cham(m92, doi, khoTruoc('19.2'));
      return r.thang && r.soNhip === 6 && r.sao === 3;
    })());
  kiem('11.2: xe hai bánh phải quay: nhiều nhịp hơn omni (BFS bánh ' + nhipBanhNganNhat(m92) + ' > 6)', nhipBanhNganNhat(m92) > 6);
  // 11.3 / 11.4
  for (const id of ['19.3', '19.4']) {
    const m = man(id);
    kiem(id + ': hành lang một ô rộng, mặt xe luôn quay lên (lời giải không gọi turn_*); omni ' + m.sao.nhip + ' nhịp < xe hai bánh ' + nhipBanhNganNhat(m) + ' nhịp', nhipVet(chamGiai(m).theoSan[0]).every((n) => n.robot.huong === 0) && nhipBanhNganNhat(m) > m.sao.nhip);
  }
  kiem('11.3: ba đoạn trượt phải (3, 2, 1 ô) xen kẽ ba đoạn lên: lời giải gọi slide_r với ba số khác nhau', (() => { const c = man('19.3').loiGiai.chinh.filter((s) => /^slide_r\(/.test(s)); return J(c) === '["slide_r(3)","slide_r(2)","slide_r(1)"]'; })());
  kiem('11.4: hành lang uốn rắn: trái, phải, trái, mỗi đoạn dài 4 ô, hai lần slide_l', (() => { const c = man('19.4').loiGiai.chinh.filter((s) => /^slide_[lr]\(/.test(s)); return J(c) === '["slide_l(4)","slide_r(4)","slide_l(4)"]'; })());
  // 11.5
  const m95 = man('19.5');
  kiem('11.5: xe quay mặt sang trái; slide_right() đi LÊN, slide_left() đi XUỐNG; lời giải chạy ra đúng đường', (() => {
    const r = chamGiai(m95);
    const n = nhipVet(r.theoSan[0]);
    return m95.batDau.huong === 3 && n[2].robot.truot === 1 && n[2].robot.y === 3 && n[4].robot.y === 1 && r.thang && n[n.length - 2].robot.truot === -1 && n[n.length - 1].robot.y === 3;
  })());
  kiem('11.5: nhịp ít hơn xe hai bánh (' + nhipBanhNganNhat(m95) + ' > 10)', nhipBanhNganNhat(m95) > 10);
  kiem('11.5: nghĩ theo màn hình (slide_left là sang trái) thì xe đâm tường: lời sai 1 có dam-tuong', ChamHoc.cham(m95, m95.loiSai[0].baiLam, khoTruoc('19.5')).chanDoan.some((c) => c.ma === 'dam-tuong'));
  // 11.6
  const m96 = man('19.6');
  kiem('11.6: vật ở góc trên BÊN TRÁI, ô đích ở góc trên bên phải, cùng hàng (trước mặt xe khi trượt tới cột đó); xe không quay lần nào (mặt lên suốt)', (() => {
    const s = SanHoc.docSan(m96.san), r = chamGiai(m96);
    return s.vat[0].x === 0 && s.dich[0].x === 2 && s.vat[0].y === 1 && s.dich[0].y === 1 && nhipVet(r.theoSan[0]).every((n) => n.robot.huong === 0);
  })());
  kiem('11.6: lời giải viết thẳng slide_left / slide_right 9 dòng (trong khung 10), ít ô hơn dùng slide_l(1) / slide_r(2)', man('19.6').loiGiai.chinh.length === 9 && man('19.6').loiGiaiKhac.baiLam.chinh.length === 5 && ChamHoc.cham(m96, m96.loiGiaiKhac.baiLam, khoTruoc('19.6')).soO > m96.sao.o);
  // 11.7
  const m97 = man('19.7'), b97 = nhipOmniNganNhat(m97);
  kiem('11.7: BFS ' + b97.nhip + ' nhịp = 3 trượt xuôi băng ngang + 2 tiến xuôi băng dọc; lời giải không tự đi hết ô: 6 ô ngang trong 3 nhịp, 4 ô dọc trong 2', b97.nhip === 5 && m97.loiGiai.chinh.join() === 'slide_r(3),move(),move()');
  kiem('11.7: băng cột trái ngược chiều: lên cột trái xe đứng im (forward(4) bỏ xe ở ô xuất phát)', (() => { const r = ChamHoc.cham(m97, { chinh: ['forward(4)'] }, khoTruoc('19.7')); return !r.thang && vt(r.theoSan[0].robot) === '0,4'; })());
  kiem('11.7: đổi mọi băng thành sàn thì BFS tăng (băng giúp): đường 10 nhịp > 5', (() => { const phang = Object.assign({}, m97, { san: m97.san.map((r) => r.replace(/[<>^v]/g, '.')) }); return nhipOmniNganNhat(phang).nhip === 10; })());
  kiem('11.7: xe hai bánh cùng sân cần nhiều nhịp hơn omni (băng yếu hơn, lại phải quay): ' + nhipBanhNganNhat(m97) + ' > 5', nhipBanhNganNhat(m97) > 5);
  kiem('11.7: đếm theo ô thay vì nhịp (slide_r(6)): xe đâm tường 3 lần (dam-tuong), vẫn tới cờ nhưng chậm → chỉ 2 sao', (() => { const r = ChamHoc.cham(m97, m97.loiSai[1].baiLam, khoTruoc('19.7')); return r.thang && r.sao === 2 && maCua(r).includes('dam-tuong'); })());
  kiem('11.7: lời sai (slide_r(3), move()): xe dừng sát cờ, chưa tới', !ChamHoc.cham(m97, m97.loiSai[3].baiLam, khoTruoc('19.7')).thang);
  // 11.8
  const m98 = man('19.8');
  kiem('11.8: hàm của màn side_r nhầm slide_left (cùng tên khác slide_r của em, không đè); lời giải sửa thành slide_right; không tạo hàm của em', m98.maMau.hamCuaMan.length === 1 && m98.maMau.hamCuaMan[0].ten === 'side_r' && m98.maMau.hamCuaMan[0].than[1].trim() === 'slide_left()' && m98.loiGiai.hamCuaMan[0].ten === 'side_r' && m98.loiGiai.hamCuaMan[0].than[1].trim() === 'slide_right()' && m98.loiGiai.hamCuaEmMoi.length === 0);
  kiem('11.8: maMau KHÔNG thắng (xe trượt trái, đâm tường), lời giải thắng', !ChamHoc.cham(m98, m98.maMau, khoTruoc('19.8')).thang && chamGiai(m98).thang && maCua(ChamHoc.cham(m98, m98.maMau, khoTruoc('19.8'))).includes('dam-tuong'));
  kiem('11.8: bỏ side_r, tự gọi slide_r của em (có từ 11.3) cũng tới cờ với đúng số nhịp, nhưng ít ô hơn thì không: đi đường của em tốn thêm hàm', (() => {
    const r = ChamHoc.cham(m98, { chinh: m98.loiGiai.chinh.map((s) => s.replace('side_r', 'slide_r')) }, khoTruoc('19.8'));
    return r.thang && r.soNhip === m98.sao.nhip && r.soO > 0;
  })());
  kiem('11.8: sân là bậc thang năm đoạn (phải 2, lên 2, phải 2, lên 2, phải 2), không đường tắt; hai ô sơn màu r / b (màn gặp khó trước Cảm biến màu)', m98.san.length === 5 && J(m98.san) === J(['####..F', '####b##', '##.r.##', '##.####', '...####']));
  // 11.9
  const m99 = man('19.9');
  kiem('11.9: maMau gộp slide_right() và move() trong cùng nhịp: chạy ra omni-khong-cheo (thông tin) + dam-tuong + chua-toi-co, xe chỉ trượt ngang rồi đâm tường', (() => { const r = ChamHoc.cham(m99, m99.maMau, khoTruoc('19.9')); return !r.thang && ['omni-khong-cheo', 'dam-tuong', 'chua-toi-co'].every((c) => maCua(r).includes(c)) && r.chanDoan.find((c) => c.ma === 'omni-khong-cheo').muc === 'thong-tin'; })());
  kiem('11.9: sửa bằng một dòng wait() chen giữa slide_right() và move() → thắng 3 sao', (() => { const r = chamGiai(m99); return r.thang && r.sao === 3 && J(m99.loiGiai.chinh) === J(['for i in range(4):', '    slide_right()', '    wait()', '    move()']); })());
  kiem('11.9: cầu thang chéo: 4 bậc, mỗi bậc 1 trượt phải + 1 tiến, không có đường đi chéo trong sân', m99.san.join('|') === '####F|###..|##..#|#..##|..###' && nhipOmniNganNhat(m99).nhip === 8);
  kiem('11.9: xe hai bánh cùng sân: quay phải rồi tiến, quay trái rồi tiến: ' + nhipBanhNganNhat(m99) + ' nhịp > 8 (omni ít nhịp hơn)', nhipBanhNganNhat(m99) > 8);
  // 11.10
  const m910 = man('19.10');
  kiem('11.10: trùm — xe quay mặt sang phải, trượt lên cho vật ở trước mặt rồi nhặt, trượt xuống, tiến, xuống theo băng chuyền (2 nhịp xuôi băng), tiến tới sát ô đích ở cuối đáy sân và thả; huy hiệu omni',
    m910.batDau.huong === 1 && /v/.test(m910.san.join('')) && m910.huyHieu.ma === 'omni' && m910.loiGiai.chinh.join() === CHINH_10_CHUAN);
  kiem('11.10: lời giải dùng đủ pick, drop, slide_r, slide_l, forward (kho hoàn chỉnh của chương), 7 dòng', ['pick', 'drop', 'slide_r', 'slide_l', 'forward'].every((t) => chamGiai(m910).hamDaDung.includes(t)) && m910.loiGiai.chinh.length === 7);
  kiem('11.10: băng chuyền dọc chỉ có tác dụng với xe thật sự đứng trên băng; bỏ băng (đổi thành sàn) làm BFS tăng', (() => { const phang = Object.assign({}, m910, { san: m910.san.map((r) => r.replace(/[<>^v]/g, '.')) }); return nhipOmniNganNhat(phang).nhip > nhipOmniNganNhat(m910).nhip; })());

  // khai triển ra lệnh gốc cho cùng kết quả (hàm không đổi luật)
  for (const m of ds.filter((x) => x.id !== '19.8')) {
    const r = chamGiai(m);
    const raw = r.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten + '()').join('\n') + '\n';
    const k = SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: 'omni', hamGoc: m.hamGoc, mucTieu: m.mucTieu || 'toi-co' }, raw);
    kiem(m.id + ': khai triển lời giải ra từng lệnh gốc (' + raw.split('\n').length + ' dòng) chạy ra cùng kết quả, cùng ' + r.soNhip + ' nhịp', k.thang === r.thang && k.nhip === r.soNhip && J(k.robot) === J(r.theoSan[0].robot));
  }
}

/* ====================================================== 7. CHẨN ĐOÁN CHO OMNI + XƯỞNG HÀM */
console.log('\n== 7. Chẩn đoán omni-khong-cheo (thông tin) và slide-goi-lai (lỗi); sân thử của Xưởng hàm với omni ==');
{
  const m9 = man('19.9'), k9 = khoTruoc('19.9');
  const r = ChamHoc.cham(m9, m9.maMau, k9);
  const c = r.chanDoan.find((x) => x.ma === 'omni-khong-cheo');
  kiem('chẩn đoán omni-khong-cheo: mức thông tin (không phải lỗi), nói rõ "Bánh omni không đi chéo: một nhịp chỉ trượt ngang HOẶC tiến/quay"', c && c.muc === 'thong-tin' && /Bánh omni không đi chéo: một nhịp chỉ trượt ngang HOẶC tiến\/quay/.test(c.loi), c && c.loi);
  kiem('omni-khong-cheo nêu nhịp, nơi đặt lệnh bánh bị bỏ (hàm move của em) và lệnh trượt (chương trình, dòng 2)', c && c.nhip === 1 && c.cho && c.cho.cot === 'hamEm' && c.cho.ten === 'move' && c.choTruot && c.choTruot.cot === 'chinh' && c.choTruot.dong === 2 && /slide_right\(\)/.test(c.loi) && /chương trình, dòng 2/.test(c.loi), c && c.loi);
  kiem('omni-khong-cheo nhiều lần: kèm "Chuyện này xảy ra N lần"', c && c.soLan === 4 && /xảy ra 4 lần/.test(c.loi), c && c.loi);
  kiem('chỉ omni-khong-cheo là thông tin; dam-tuong và chua-toi-co là lỗi', r.chanDoan.filter((x) => x.muc === 'thong-tin').map((x) => x.ma).join() === 'omni-khong-cheo' && r.chanDoan.filter((x) => x.muc === 'loi').map((x) => x.ma).sort().join() === 'chua-toi-co,dam-tuong');
  kiem('lời giải đúng không có omni-khong-cheo; xe bánh, nhện, xích (màn cũ) không bao giờ có omni-khong-cheo hay slide-goi-lai',
    maCua(chamGiai(m9)).length === 0 && tatCa.filter((m) => m.loaiRobot !== 'omni').every((m) => { const q = maCua(ChamHoc.cham(m, m.maMau, khoTruoc(m.id))); return !q.includes('omni-khong-cheo') && !q.includes('slide-goi-lai'); }));
  const m1 = man('19.1');
  const sg = ChamHoc.cham(m1, { chinh: LAP2(4, 'slide_right()') }, []).chanDoan.find((x) => x.ma === 'slide-goi-lai');
  kiem('chẩn đoán slide-goi-lai: mức lỗi, nêu lệnh bị bỏ (chương trình, dòng 2) và lệnh đã giữ nhịp (chương trình, dòng 1), nhắc wait()', sg && sg.muc === 'loi' && /chương trình, dòng 2/.test(sg.loi) && /chương trình, dòng 1/.test(sg.loi) && /wait\(\)/.test(sg.loi) && sg.nhip === 1, sg && sg.loi);
  const dt = ChamHoc.cham(m1, { chinh: LAP2(5, 'slide_left()', true) }, []).chanDoan.find((x) => x.ma === 'dam-tuong');
  kiem('dam-tuong của omni: lời nhắc nói slide tính theo hướng mặt xe (và vẫn nói quay mặt), không nói go_*', dt && /hướng mặt/.test(dt.loi) && /quay mặt/.test(dt.loi) && !/go_\*/.test(dt.loi), dt && dt.loi);
  kiem('chua-toi-co của omni nói quay mặt hướng nào (omni có hướng mặt)', (() => { const x = ChamHoc.cham(m1, { chinh: ['slide_right()', 'wait()'] }, []).chanDoan.find((y) => y.ma === 'chua-toi-co'); return x && /quay mặt hướng lên/.test(x.loi); })());
  kiem('tay-vuong với lệnh trượt: lời nhắc nêu "xe không đi hay quay được" và lệnh slide bị bỏ', (() => {
    const m = man('19.6');
    const q = ChamHoc.cham(m, { chinh: ['arm_down()', 'slide_left()', 'wait()'] }, khoTruoc('19.6')).chanDoan.find((x) => x.ma === 'tay-vuong');
    return q && /slide_left\(\)/.test(q.loi) && /tay đang hạ sát đất/.test(q.loi);
  })());
  // Xưởng hàm
  const k3 = khoTruoc('19.5');
  const t1 = ChamHoc.thuHam(man('19.5'), { chinh: [] }, 'slide_r', k3, { doiSo: [2] });
  kiem('Xưởng hàm: thử slide_r(2) trên sân thử 5×5 mặc định (xe ở (2,2) mặt lên): xe trượt sang phải tới (4,2), 2 nhịp, mặt vẫn lên', vt(t1.robot) === '4,2' && t1.robot.huong === 0 && t1.soNhip === 2 && !t1.chanDoan.length, J([t1.robot, t1.soNhip, maCua(t1)]));
  const t2 = ChamHoc.thuHam(man('19.5'), { chinh: [] }, 'slide_l', k3, { doiSo: [4] });
  kiem('Xưởng hàm: thử slide_l(4) trượt ra khỏi sân thử: dừng ở (0,2), báo dam-tuong ngoài sân thử', vt(t2.robot) === '0,2' && maCua(t2).includes('dam-tuong') && /ngoài sân thử/.test(t2.chanDoan.find((x) => x.ma === 'dam-tuong').loi), J(maCua(t2)));
  const t3 = ChamHoc.thuHam(man('19.5'), { chinh: [] }, 'slide_r', k3, { doiSo: [2], sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 3 } } });
  kiem('Xưởng hàm: xếp xe quay mặt sang trái rồi thử slide_r(2): xe đi LÊN tới (2,0)', vt(t3.robot) === '2,0' && t3.robot.huong === 3);
  const t4 = ChamHoc.thuHam(man('19.5'), { chinh: [] }, 'slide_r', k3, { doiSo: [2], sanThu: { rong: 5, cao: 5, batDau: { x: 1, y: 2, huong: 0 }, tuong: [{ x: 3, y: 2 }] } });
  kiem('Xưởng hàm: tường chặn trượt: dừng sát tường (2,2), báo dam-tuong', vt(t4.robot) === '2,2' && maCua(t4).includes('dam-tuong'));
  const t5 = ChamHoc.thuHam(man('19.8'), { chinh: [], hamCuaMan: [H('side_r', ['for i in range(n):', '    slide_left()', '    wait()'], ['n'])] }, 'side_r', khoTruoc('19.8'), { doiSo: [1] });
  kiem('Xưởng hàm: thử side_r(1) của màn 11.8 (bản sai): xe trượt sang trái, tới (1,2)', vt(t5.robot) === '1,2');
  const t6 = ChamHoc.thuHam(man('19.6'), { chinh: [] }, 'pick', khoTruoc('19.6'), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 1 }] } });
  kiem('Xưởng hàm: thử pick() với vật ở ô trước mặt omni có tay: nhặt được vật', t6.tay && t6.tay.cam === 1 && t6.vat[0].trangThai === 'cam');
  kiem('hàm gốc slide_left / slide_right chặn tên hàm của em: tạo hàm tên slide_right báo ten-trung-ham-goc', KhoHam.moi({ tenCoDinh: tenCotTruyen }).tao('slide_right').ma === 'ten-trung-ham-goc');
  // lỗi cũ vẫn còn
  const hc = ChamHoc.cham(man('19.3'), man('19.3').maMau, khoTruoc('19.3'));
  kiem('gọi slide_r() khi chưa tạo hàm: ham-chua-co, kèm lời "cần tạo nó trong Xưởng hàm"', maCua(hc).includes('ham-chua-co') && /Xưởng hàm/.test(hc.chanDoan.find((x) => x.ma === 'ham-chua-co').loi));
  kiem('11.2: lời giải chấm với kho đầy đủ (có cả slide_r, slide_l) vẫn 3 sao, không chẩn đoán', (() => { const m = man('19.2'); const day2 = KhoHam.moi({ tenCoDinh: tenCotTruyen }); for (const x of tatCa) { if (x.tietKiemNhip) continue; for (const h of x.loiGiai.hamCuaEmMoi) { if (!day2.tim(h.ten)) day2.tao(h.ten, h.thamSo, { taoHam: x.taoHam }); day2.sua(h.ten, h.than); } } const q = ChamHoc.cham(m, m.loiGiai, day2.ds()); return q.sao === 3 && q.chanDoan.length === 0; })());
  kiem('tên hàm của màn 11.8 (side_r) không có trong kho; kho không bị đổi bởi màn 11.8', !KhoHam.moi({ tenCoDinh: tenCotTruyen }).tim('side_r') && !khoTruoc('19.9').some((h) => h.ten === 'side_r'));
}

/* ====================================================== 8. BẢNG 10 MÀN */
console.log('\n== 8. Bảng 10 màn chương Bánh omni (so với xe hai bánh) ==');
{
  console.log('  màn  | sân | tay | ô  | nhịp | BFS | bánh | hàng     | tạo hàm  | lời giải');
  for (const m of ds) {
    const r = chamGiai(m), b = nhipOmniNganNhat(m);
    const banh = m.mucTieu === 'dua-vat' ? '-' : String(nhipBanhNganNhat(m));
    console.log('  ' + m.id.padEnd(4) + ' | ' + (m.san[0].length + '×' + m.san.length).padEnd(3) + ' | ' + (m.robot.tay ? 'kẹp' : '-').padEnd(3) + ' | ' + String(r.soO).padEnd(2) + ' | ' + String(r.soNhip).padEnd(4) + ' | ' + String(b.nhip).padEnd(3) + ' | ' + banh.padEnd(4) + ' | ' + m.hang.padEnd(8) + ' | ' + (m.taoHam.join(', ') || '-').padEnd(8) + ' | ' + m.loiGiai.chinh.map((s) => s.replace(/^ {4}/, '· ')).join(' | '));
  }
  for (const m of ds) {
    console.log('\n  ' + m.id + ' ' + m.ten + ' [' + m.hang + (m.mucTieu === 'dua-vat' ? ', dua-vat' : '') + '] ' + m.san[0].length + '×' + m.san.length + ' · omni (' + m.batDau.x + ', ' + m.batDau.y + ') hướng ' + SanHoc.TEN_HUONG[m.batDau.huong]);
    for (const g of m.san) console.log('    ' + g);
    console.log('    đề: ' + m.deBai);
  }
  kiem('bảng đã in', true);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

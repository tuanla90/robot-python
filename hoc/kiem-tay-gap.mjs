/* ============================================================================
   kiem-tay-gap.mjs — máy kiểm LUẬT TAY GẮP và chương `tay-gap` của "Đường học".
   Gồm: lệnh tay chạy theo nhịp, thứ tự (tư thế → kẹp / thả → bánh → băng chuyền), trạng thái tay,
   grab / release, tay vướng sàn, vật đi theo xe, ô chỉ chứa một vật, mục tiêu dua-vat, ký hiệu sân,
   vết cho giao diện, chẩn đoán qua máy chấm, bộ dò đường tắt dua-vat (kiểm chéo với mô phỏng và kiểm
   ngẫu nhiên), và bảng 10 màn.
   Chạy: node robotics/hoc/kiem-tay-gap.mjs        (trượt thì thoát mã 1)
   Các kiểm chung cho cả 40 màn (đi tuần tự, đường tắt, sao…) nằm ở kiem-hoc.mjs.
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { nhipDuaVatNganNhat, dungNguCanh, trangThaiDau, buocMotNhip, laThang, chuoiThanhMa, HANH_DONG } from './do-duong-tay.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
require(path.join(day, 'man-chuoi-2.js'));
require(path.join(day, 'man-tay-gap.js'));
const ManHoc = require(path.join(day, 'man-vong-lap.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
const MAU = require(path.join(day, 'thu-vien-mau.js'));
const tron = (kho, moi) => {                                           // kho + hàm ghi đè / thêm (không đụng vào kho gốc)
  const kq = kho.map((h) => H(h.ten, h.than.slice(), (h.thamSo || []).slice()));
  for (const h of moi || []) { const i = kq.findIndex((x) => x.ten === h.ten); const b = H(h.ten, h.than.slice(), (h.thamSo || []).slice()); if (i >= 0) kq[i] = b; else kq.push(b); }
  return kq;
};

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });

const HG = ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];
const chay = (rows, bd, code, extra) => SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: HG, mucTieu: 'dua-vat' }, extra || {}), code);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
const maSK = (kq, ma) => kq.suKien.filter((e) => e.ma === ma);
const maTrongNhip = (n, ma) => n.suKien.filter((e) => e.ma === ma);
const L = (...d) => d.join('\n') + '\n';
const vt = (r) => r.x + ',' + r.y;
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const SAN = ['.....', '.....', '.....', '.....', '.....'];          // sân trống 5×5
const XE = { x: 2, y: 2, huong: 0 };                                  // xe ở giữa quay lên
const BANH = L('left_move()', 'right_move()');                        // hai lệnh bánh: tiến một ô khi có wait()
const TAY0 = { tuThe: 'tren', kep: false, cam: null };

/* ===================================================================== 1 */
console.log('\n== 1. Lệnh tay CHỈ RA LỆNH; wait() cho nhịp trôi ==');
{
  const a = chay(SAN, XE, 'arm_down()');
  kiem('arm_down() không wait: chưa có nhịp nào, tay vẫn nâng', a.nhip === 0 && J(a.tay) === J(TAY0), J(a.tay));
  const b = chay(SAN, XE, L('arm_down()', 'wait()'));
  kiem('arm_down() rồi wait(): 1 nhịp, tay hạ', b.nhip === 1 && b.tay.tuThe === 'duoi', J(b.tay));
  const c = chay(SAN, XE, L('arm_down()', 'wait()', 'arm_up()', 'wait()'));
  kiem('arm_up() đưa tay lên lại ở nhịp sau', c.tay.tuThe === 'tren' && c.nhip === 2);
  kiem('tay mặc định: nâng (tren), kẹp mở, không cầm gì', J(chay(SAN, XE, 'wait()').tay) === J(TAY0));
  const d = chay(SAN, XE, L('arm_down()', 'left_move()', 'right_move()', 'wait()'));
  kiem('lệnh tay và lệnh bánh cùng chờ một wait(): chỉ một nhịp', d.nhip === 1);
  const e = chay(SAN, XE, L('arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'wait()'));
  kiem('arm_up + bánh cùng nhịp (tay đã nâng): xe đi, rồi hạ tay ở nhịp sau', vt(e.robot) === '2,1' && e.tay.tuThe === 'duoi' && e.nhip === 2, vt(e.robot));
  kiem('hàm gốc có lệnh tay: arm_down, arm_up, grab, release thuộc TAY_LENH; nhện cũng dùng được (chương nhen), tên lạ vẫn bị từ chối',
    J(SanHoc.TAY_LENH) === J(['arm_down', 'arm_up', 'grab', 'release']) &&
      (() => { try { const k = SanHoc.chay({ san: SAN, batDau: XE, loaiRobot: 'nhen', hamGoc: ['arm_down', 'wait'] }, 'wait()'); return k.tay !== null; } catch (err) { return false; } })() &&
      (() => { try { SanHoc.chay({ san: SAN, batDau: XE, loaiRobot: 'nhen', hamGoc: ['left_move'] }, 'wait()'); return false; } catch (err) { return true; } })());
  kiem('không khai hamGoc lệnh tay: gọi arm_down() là lỗi chạy (loi runtime), vết không có tay',
    (() => { const k = SanHoc.chay({ san: SAN, batDau: XE, loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait'] }, 'arm_down()\nwait()'); return k.loi && k.loi.loai === 'runtime-error' && k.tay === null; })());
}

console.log('\n== 2. Gọi lại cùng một nhóm lệnh tay trong một nhịp: tay-goi-lai ==');
{
  const a = chay(SAN, XE, L('arm_down()', 'arm_up()', 'wait()'));
  const e = maSK(a, 'tay-goi-lai')[0];
  kiem('arm_down() rồi arm_up(): lệnh đầu thắng (tay hạ), lệnh sau bị bỏ, ghi tay-goi-lai', maSK(a, 'tay-goi-lai').length === 1 && a.tay.tuThe === 'duoi', J(a.suKien));
  kiem('  sự kiện ghi nhóm, lệnh bị bỏ + dòng, lệnh đã giữ nhóm + dòng, nhịp',
    e.nhom === 'tu-the' && e.ten === 'arm_up' && e.dongPy === 2 && e.truoc.ten === 'arm_down' && e.truoc.dongPy === 1 && e.nhip === 1, J(e));
  const b = chay(SAN, XE, L('arm_down()', 'arm_down()', 'wait()'));
  kiem('cùng một lệnh hai lần trong nhịp cũng là gọi lại', maSK(b, 'tay-goi-lai').length === 1 && b.tay.tuThe === 'duoi');
  const c = chay(SAN, { x: 2, y: 2, huong: 0 }, L('arm_down()', 'grab()', 'release()', 'wait()'), { vat: [{ x: 2, y: 2 }] });
  kiem('grab() rồi release(): lệnh thả bị bỏ (nhóm kẹp), vật vẫn trên tay', maSK(c, 'tay-goi-lai')[0].nhom === 'kep' && c.tay.cam === 1, J(c.suKien));
  const d = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()'));
  kiem('tư thế và kẹp là HAI nhóm khác nhau: arm_down + grab chung nhịp không phải gọi lại', maSK(d, 'tay-goi-lai').length === 0);
  const e2 = chay(SAN, XE, L('arm_down()', 'wait()', 'arm_up()', 'wait()'));
  kiem('hai lệnh cùng nhóm ở hai nhịp khác nhau: không phải gọi lại', maSK(e2, 'tay-goi-lai').length === 0);
  const f = chay(SAN, XE, L('arm_up()', 'arm_down()', 'arm_up()', 'wait()'));
  kiem('ba lệnh cùng nhóm: hai sự kiện tay-goi-lai, đều chỉ ra lệnh đầu tiên giữ nhóm', maSK(f, 'tay-goi-lai').length === 2 && maSK(f, 'tay-goi-lai').every((x) => x.truoc.ten === 'arm_up'));
  const g = chay(SAN, XE, L('left_move()', 'left_move()', 'arm_down()', 'arm_up()', 'wait()'));
  kiem('banh-goi-lai và tay-goi-lai độc lập, cùng ghi được trong một nhịp', maSK(g, 'banh-goi-lai').length === 1 && maSK(g, 'tay-goi-lai').length === 1);
}

console.log('\n== 3. Hết chương trình mà còn lệnh tay chưa wait(): quen-wait ==');
{
  const a = chay(SAN, XE, 'arm_down()');
  kiem('chỉ lệnh tay chưa wait(): quen-wait, lệnh không chạy', maSK(a, 'quen-wait').length === 1 && maSK(a, 'quen-wait')[0].lenh.map((x) => x.ten).join() === 'arm_down' && a.tay.tuThe === 'tren');
  const b = chay(SAN, XE, L('arm_down()', 'wait()', 'grab()', 'left_move()'));
  kiem('lệnh tay + lệnh bánh treo: quen-wait liệt kê cả hai theo thứ tự', maSK(b, 'quen-wait')[0].lenh.map((x) => x.ten).join() === 'grab,left_move' && b.tay.tuThe === 'duoi' && b.nhip === 1, J(b.suKien));
  kiem('có wait() cuối thì không quen-wait', maSK(chay(SAN, XE, L('arm_down()', 'wait()')), 'quen-wait').length === 0);
  const m = ManHoc.timMa('tay-gap.1');
  const r = ChamHoc.cham(m, { chinh: ['arm_down()'] }, []);
  kiem('qua máy chấm: quen-wait nói "lệnh tay", chua-dua-vat đi kèm', maCua(r).join() === 'quen-wait,chua-dua-vat' && /lệnh tay/.test(r.chanDoan[0].loi) && /Lệnh tay chỉ có tác dụng/.test(r.chanDoan[0].loi), r.chanDoan[0].loi);
  const r2 = ChamHoc.cham(m, { chinh: ['arm_down()', 'left_move()'] }, []);
  kiem('qua máy chấm: pha lệnh bánh và tay → "lệnh bánh và tay"', /lệnh bánh và tay/.test(r2.chanDoan[0].loi), r2.chanDoan[0].loi);
  const r3 = ChamHoc.cham(ManHoc.timMa('hai-banh.1'), { chinh: ['left_move()', 'right_move()'] }, []);
  kiem('chương cũ: quen-wait vẫn nói "lệnh bánh" như trước', /lệnh bánh \(/.test(r3.chanDoan[0].loi) && !/tay/.test(r3.chanDoan[0].loi), r3.chanDoan[0].loi);
}

/* ===================================================================== 2 */
console.log('\n== 4. Thứ tự trong một nhịp: (a) tư thế → (b) kẹp / thả ở tư thế MỚI → (c) bánh → (d) băng chuyền ==');
{
  const VAT = { vat: [{ x: 2, y: 2 }] };
  const a = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()'), VAT);
  kiem('arm_down + grab cùng nhịp: kẹp ở tư thế hạ nên NHẶT được vật (tay { duoi, kep, cam 1 })',
    J(a.tay) === J({ tuThe: 'duoi', kep: true, cam: 1 }) && a.vat[0].trangThai === 'cam' && a.nhip === 1 && maTrongNhip(nhipVet(a)[0], 'nhat-vat').length === 1, J([a.tay, a.vat]));
  const b = chay(SAN, XE, L('grab()', 'arm_down()', 'wait()'), VAT);
  kiem('thứ tự DÒNG lệnh trong nhịp không quan trọng: grab() viết trước arm_down() vẫn nhặt được', J(b.tay) === J(a.tay) && b.vat[0].trangThai === 'cam');
  const c = chay(SAN, XE, L('arm_down()', 'wait()', 'grab()', 'wait()'), VAT);
  kiem('hạ tay ở nhịp 1, kẹp ở nhịp 2: cũng nhặt được', c.tay.cam === 1 && c.nhip === 2);
  const d = chay(SAN, XE, L('arm_down()', 'grab()', 'left_move()', 'right_move()', 'wait()'), VAT);
  kiem('bánh + tay cùng nhịp: tay hạ trước, kẹp nhặt vật, rồi bánh bị chặn (tay-vuong) — xe không đi, vật vẫn ở tay',
    vt(d.robot) === '2,2' && d.tay.cam === 1 && maSK(d, 'tay-vuong').length === 1 && maSK(d, 'dam-tuong').length === 0, J([d.robot, d.tay, d.suKien]));
  const nang = L('arm_down()', 'grab()', 'wait()');
  const e = chay(SAN, XE, nang + L('arm_up()', 'left_move()', 'right_move()', 'wait()'), VAT);
  kiem('arm_up + bánh cùng nhịp (tay nâng TRƯỚC khi bánh chạy): xe đi, vật đi theo; không tay-vuong',
    vt(e.robot) === '2,1' && e.vat[0].x === 2 && e.vat[0].y === 1 && maSK(e, 'tay-vuong').length === 0, J([e.robot, e.vat]));
  const f = chay(SAN, XE, nang + L('arm_up()', 'release()', 'wait()'), VAT);
  kiem('arm_up + release cùng nhịp: thả ở tư thế MỚI (nâng) nên vật rơi VỠ', f.vat[0].trangThai === 'vo' && maSK(f, 'vat-vo').length === 1 && f.tay.cam === null, J([f.vat, f.suKien]));
  const g = chay(SAN, XE, nang + L('arm_up()', 'wait()', 'arm_down()', 'release()', 'wait()'), VAT);
  kiem('arm_down + release cùng nhịp: thả ở tư thế hạ nên vật nằm xuống ô hiện tại', g.vat[0].trangThai === 'dat' && vt(g.vat[0]) === '2,2' && g.tay.cam === null && g.tay.kep === false && maTrongNhip(nhipVet(g)[2], 'dat-vat').length === 1, J([g.vat, g.tay]));
  const h = chay(SAN, XE, L('arm_down()', 'grab()', 'left_move()', 'wait()', 'arm_up()', 'right_move()', 'wait()'), VAT);
  kiem('quay tại chỗ cũng bị chặn khi tay hạ (nhịp 1), rồi quay được khi tay đã nâng (nhịp 2)', h.vet.filter((e2) => e2.loai === 'nhip')[0].robot.huong === 0 && h.robot.huong === 3, J(h.robot));
  // băng chuyền sau bánh; vật đi theo
  const BANG = ['.>>>.'];
  const bg = chay(BANG, { x: 1, y: 0, huong: 1 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'wait()'), { vat: [{ x: 1, y: 0 }] });
  const nbg = nhipVet(bg);
  kiem('(d) băng chuyền như cũ, sau tay và bánh: đủ 2 nhịp trên băng thì đẩy xe 1 ô; vật đang cầm đi theo xe',
    vt(nbg[1].robot) === '2,0' && nbg[1].vat[0].x === 2 && maTrongNhip(nbg[1], 'bang-day').length === 1 && nbg[0].vat[0].x === 1, J(nbg.map((n) => [vt(n.robot), n.vat[0].x])));
  const th = chay(['.>>D.'], { x: 1, y: 0, huong: 1 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'wait()', 'wait()', 'arm_down()', 'release()', 'wait()'), { vat: [{ x: 1, y: 0 }] });
  kiem('mang vật bằng băng chuyền (hai lần đẩy: 1→2→3), thả xuống đích ở (3,0): thắng ở nhịp 5', th.thang === true && th.nhip === 5 && vt(th.vat[0]) === '3,0', J([th.thang, th.nhip, th.vat]));
}

/* ===================================================================== 3 */
console.log('\n== 5. grab(): chỉ gắp được vật ngang tầm tay ==');
{
  const VAT = { vat: [{ x: 2, y: 2 }] };
  const a = chay(SAN, XE, L('grab()', 'wait()'), VAT);
  const ev = maSK(a, 'kep-hut')[0];
  kiem('tay nâng mà grab() ở ô có vật: kẹp vào không khí — kep đóng, không cầm gì, vật vẫn nằm; sự kiện kep-hut (tay-nang)',
    J(a.tay) === J({ tuThe: 'tren', kep: true, cam: null }) && a.vat[0].trangThai === 'dat' && maSK(a, 'kep-hut').length === 1 && ev.lyDo === 'tay-nang' && ev.nhip === 1 && vt(ev.o) === '2,2', J([a.tay, a.suKien]));
  const b = chay(SAN, XE, L('grab()', 'wait()', 'arm_down()', 'grab()', 'wait()'), VAT);
  kiem('kẹp hụt (kẹp đóng) rồi hạ tay + grab(): nhặt được ở nhịp sau', b.tay.cam === 1 && b.nhip === 2 && maSK(b, 'kep-hut').length === 1);
  const c = chay(SAN, XE, L('grab()', 'wait()'));
  kiem('tay nâng grab() ở ô KHÔNG có vật: kẹp đóng, không sự kiện gì (không có gì để báo)', c.tay.kep === true && c.tay.cam === null && c.suKien.length === 0, J(c.suKien));
  const d = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()'));
  kiem('tay hạ grab() ở ô không có vật: kep-hut (khong-co-vat)', maSK(d, 'kep-hut')[0].lyDo === 'khong-co-vat' && d.tay.cam === null);
  const e = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()', 'grab()', 'wait()'), VAT);
  kiem('đang cầm vật mà grab() lần nữa: không đổi gì (vẫn cầm vật 1, không sự kiện thêm)', e.tay.cam === 1 && e.tay.kep === true && maSK(e, 'kep-hut').length === 0 && maTrongNhip(nhipVet(e)[1], 'nhat-vat').length === 0);
  const f = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()'), { vat: [{ x: 2, y: 1 }] });
  kiem('vật ở ô KHÁC (ô trước mặt) thì không gắp được dù tay hạ: kep-hut (khong-co-vat), vật vẫn nằm', f.vat[0].trangThai === 'dat' && maSK(f, 'kep-hut')[0].lyDo === 'khong-co-vat');
  const g = chay(['..o..', '.....', '.....', '.....', '.....'], { x: 2, y: 4, huong: 0 }, L('left_move()', 'right_move()', 'wait()', 'arm_down()', 'grab()', 'wait()'));
  kiem('vật được đọc từ ký hiệu o của sân: xe mới đi một ô, chưa tới ô vật nên kẹp hụt (khong-co-vat)', maSK(g, 'kep-hut').length === 1 && g.tay.cam === null && maSK(g, 'kep-hut')[0].lyDo === 'khong-co-vat', J(g.suKien));
  const T4 = L('left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()');
  const g2 = chay(['..o..', '.....', '.....', '.....', '.....'], { x: 2, y: 4, huong: 0 }, T4 + L('arm_down()', 'grab()', 'wait()'));
  kiem('đi tới đúng ô có ký hiệu o rồi hạ tay + grab(): nhặt được', g2.tay.cam === 1 && vt(g2.vat[0]) === '2,0', J([g2.tay, g2.vat]));
}

console.log('\n== 6. Tay đang hạ thì xe KHÔNG đi, KHÔNG quay: tay-vuong ==');
{
  const hHa = L('arm_down()', 'wait()');
  const a = chay(SAN, XE, hHa + L('left_move()', 'right_move()', 'wait()'));
  const ev = maSK(a, 'tay-vuong')[0];
  kiem('tay hạ + tiến: xe đứng yên, ghi tay-vuong (nhịp, ô đang đứng, lệnh bánh bị bỏ)', vt(a.robot) === '2,2' && maSK(a, 'tay-vuong').length === 1 && ev.nhip === 2 && vt(ev.tu) === '2,2' && ev.lenh.ten === 'left_move' && ev.lenh.dongPy === 3, J(ev));
  kiem('  nhịp vẫn trôi (tay vướng sàn vẫn mất một nhịp), vết ghi tay-vuong chứ không tien', a.nhip === 2 && maTrongNhip(nhipVet(a)[1], 'tien').length === 0 && maTrongNhip(nhipVet(a)[1], 'tay-vuong').length === 1);
  const b = chay(SAN, XE, hHa + L('left_move()', 'wait()'));
  kiem('tay hạ + quay phải tại chỗ: bị chặn, xe giữ nguyên hướng', b.robot.huong === 0 && maSK(b, 'tay-vuong').length === 1);
  const c = chay(SAN, XE, hHa + L('right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'));
  kiem('tay hạ: nhiều nhịp bánh liên tiếp đều bị chặn, mỗi nhịp một sự kiện', maSK(c, 'tay-vuong').length === 2 && vt(c.robot) === '2,2' && c.robot.huong === 0);
  const d = chay(SAN, XE, hHa + 'wait()\nwait()\n');
  kiem('tay hạ + đứng yên (chỉ wait): KHÔNG phải tay-vuong (không có lệnh bánh nào bị chặn)', maSK(d, 'tay-vuong').length === 0);
  const HG2 = HG.concat(['left_back', 'right_back']);
  const e = chay(SAN, XE, hHa + L('left_back()', 'right_back()', 'wait()'), { hamGoc: HG2 });
  kiem('tay hạ + lùi cũng bị chặn', vt(e.robot) === '2,2' && maSK(e, 'tay-vuong').length === 1);
  const f = chay(SAN, XE, hHa + L('arm_up()', 'left_move()', 'right_move()', 'wait()'));
  kiem('nâng tay trong CHÍNH nhịp đi thì không bị chặn (tư thế đổi trước bánh)', vt(f.robot) === '2,1' && maSK(f, 'tay-vuong').length === 0);
  const g = chay(SAN, XE, L('left_move()', 'right_move()', 'wait()'));
  kiem('tay nâng (mặc định) đi bình thường', vt(g.robot) === '2,1' && maSK(g, 'tay-vuong').length === 0);
  const h = chay(SAN, XE, L('arm_down()', 'left_move()', 'right_move()', 'wait()', 'wait()'));
  kiem('hạ tay và đi chung một nhịp: hạ trước nên bị chặn ngay nhịp đó', vt(h.robot) === '2,2' && maSK(h, 'tay-vuong')[0].nhip === 1);
  const i = chay(SAN, XE, L('arm_down()', 'left_move()', 'wait()'));
  kiem('tay-vuong chặn trước đâm tường: xe ở sát tường mà tay hạ chỉ báo tay-vuong', (() => {
    const k = chay(SAN, { x: 2, y: 0, huong: 0 }, L('arm_down()', 'left_move()', 'right_move()', 'wait()'));
    return maSK(k, 'tay-vuong').length === 1 && maSK(k, 'dam-tuong').length === 0;
  })());
}

console.log('\n== 7. Xe đi thì vật đang cầm đi theo ==');
{
  const VAT = { vat: [{ x: 2, y: 2 }] };
  const prog = L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'wait()', 'left_move()', 'right_move()', 'wait()');
  const a = chay(SAN, XE, prog, VAT);
  const n = nhipVet(a);
  kiem('từng nhịp: vật đang cầm luôn trùng ô xe (nhặt tại (2,2); đi lên (2,1); quay phải; đi sang (3,1))',
    n.map((x) => vt(x.vat[0]) + (x.vat[0].trangThai === 'cam' ? 'c' : 'd')).join(' ') === '2,2c 2,1c 2,1c 3,1c' && vt(a.robot) === '3,1', n.map((x) => vt(x.vat[0])).join(' '));
  kiem('vật không cầm thì đứng yên khi xe đi: hai vật, chỉ vật 1 được nhặt', (() => {
    const k = chay(SAN, XE, prog, { vat: [{ x: 2, y: 2 }, { x: 0, y: 0 }] });
    return k.vat[1].x === 0 && k.vat[1].y === 0 && k.vat[1].trangThai === 'dat' && k.vat[0].trangThai === 'cam';
  })());
  kiem('xe đâm tường khi đang cầm: xe đứng yên thì vật cũng đứng yên ở ô xe', (() => {
    const k = chay(SAN, { x: 2, y: 0, huong: 0 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()'), { vat: [{ x: 2, y: 0 }] });
    return maSK(k, 'dam-tuong').length === 1 && vt(k.vat[0]) === '2,0' && k.vat[0].trangThai === 'cam';
  })());
}

console.log('\n== 8. release(): hạ tay thì đặt xuống, nâng tay thì vỡ; không cầm gì thì không sao ==');
{
  const VAT = { vat: [{ x: 2, y: 2 }] };
  const nhat = L('arm_down()', 'grab()', 'wait()');
  const a = chay(SAN, XE, nhat + L('release()', 'wait()'), VAT);
  kiem('tay hạ + release: vật nằm xuống ô hiện tại, kẹp mở, tay không cầm; sự kiện dat-vat', a.vat[0].trangThai === 'dat' && vt(a.vat[0]) === '2,2' && J(a.tay) === J({ tuThe: 'duoi', kep: false, cam: null }) && maTrongNhip(nhipVet(a)[1], 'dat-vat').length === 1);
  const b = chay(SAN, XE, nhat + L('arm_up()', 'wait()', 'release()', 'wait()', 'wait()'), VAT);
  kiem('tay nâng + release: vật rơi vỡ — biến mất khỏi tính toán (trangThai vo), tay không cầm; vat-vo kèm id, ô, nhịp',
    b.vat[0].trangThai === 'vo' && b.tay.cam === null && b.tay.kep === false && maSK(b, 'vat-vo')[0].id === 1 && maSK(b, 'vat-vo')[0].nhip === 3 && vt(maSK(b, 'vat-vo')[0].o) === '2,2', J(b.suKien));
  kiem('  vỡ ở mục tiêu dua-vat thì chương trình dừng ngay (dungSom), nhịp 3', b.dungSom === 'vat-vo' && b.nhip === 3);
  const k = chay(SAN, XE, nhat + L('arm_up()', 'wait()', 'release()', 'wait()', 'arm_down()', 'grab()', 'wait()'), Object.assign({ mucTieu: 'toi-co' }, VAT));
  kiem('  vật vỡ không còn là "vật nằm" ở ô đó (mục tiêu không dừng sớm): hạ tay + grab() ở ô đó là kẹp hụt (khong-co-vat), vật vẫn vo',
    k.tay.cam === null && k.vat[0].trangThai === 'vo' && maSK(k, 'kep-hut').slice(-1)[0].lyDo === 'khong-co-vat', J(k.suKien));
  const c = chay(SAN, XE, L('release()', 'wait()', 'arm_down()', 'release()', 'wait()'), VAT);
  kiem('không cầm gì mà release (tay nâng hay hạ) thì không sao: không sự kiện, vật nằm yên', c.suKien.length === 0 && c.vat[0].trangThai === 'dat' && c.tay.kep === false);
  const d = chay(SAN, XE, L('grab()', 'wait()', 'release()', 'wait()'), VAT);
  kiem('kẹp hụt rồi release: kẹp mở lại, không vỡ gì', d.tay.kep === false && d.vat[0].trangThai === 'dat' && maSK(d, 'vat-vo').length === 0);
}

console.log('\n== 9. Mỗi ô chứa tối đa một vật đang nằm: o-co-vat ==');
{
  const a = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()'), { vat: [{ x: 2, y: 2 }, { x: 2, y: 1 }] });
  kiem('đặt vật xuống ô đã có vật: thất bại, vật vẫn ở tay (kẹp vẫn đóng), ô kia giữ nguyên; sự kiện o-co-vat',
    maSK(a, 'o-co-vat').length === 1 && a.tay.cam === 1 && a.tay.kep === true && a.vat[0].trangThai === 'cam' && vt(a.vat[1]) === '2,1' && a.vat[1].trangThai === 'dat' && maSK(a, 'o-co-vat')[0].id === 1 && vt(maSK(a, 'o-co-vat')[0].o) === '2,1', J([a.suKien, a.tay]));
  const b = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()'),
    { vat: [{ x: 2, y: 2 }, { x: 2, y: 1 }] });
  kiem('thất bại một lần rồi đi sang ô trống đặt xuống được', b.vat[0].trangThai === 'dat' && vt(b.vat[0]) === '2,0' && b.tay.cam === null && maSK(b, 'o-co-vat').length === 1, J(b.vat));
  const c = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_up()', 'release()', 'wait()'), { vat: [{ x: 2, y: 2 }, { x: 2, y: 1 }] });
  kiem('thả từ tay nâng lên ô đã có vật: vỡ chứ không phải o-co-vat (kiểm vỡ trước)', maSK(c, 'vat-vo').length === 1 && maSK(c, 'o-co-vat').length === 0);
  kiem('hai vật khai trùng một ô (ký hiệu o + cfg.vat) chỉ tính một vật', chay(['o....'], { x: 1, y: 0, huong: 1 }, 'wait()', { vat: [{ x: 0, y: 0 }] }).vat.length === 1);
}

/* ===================================================================== 4 */
console.log('\n== 10. Mục tiêu dua-vat: thắng NGAY khi mọi vật đều nằm trên ô đích ==');
{
  const R = ['.....', '.....', '..D..', '..o..', '.....'];
  const bd = { x: 2, y: 3, huong: 0 };
  const thang = L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()');
  const a = chay(R, bd, thang + 'left_move()\nright_move()\nwait()\n');
  kiem('thắng đúng ở cuối nhịp 3 khi vật được đặt xuống ô đích; chương trình dừng ngay (lệnh sau không chạy)',
    a.thang && a.nhip === 3 && maTrongNhip(nhipVet(a)[2], 'xong-dua-vat').length === 1 && a.vet.filter((e) => e.loai === 'lenh').length === 10, J([a.thang, a.nhip, a.vet.length]));
  kiem('  vết cuối có vật nằm trên đích; kq.dich là danh sách ô đích', a.vat[0].trangThai === 'dat' && vt(a.vat[0]) === '2,2' && J(a.dich) === J([{ x: 2, y: 2 }]));
  const b = chay(R, bd, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()'));
  kiem('vật đang được cầm TRÊN ô đích chưa tính là xong (phải thả xuống)', !b.thang && b.vat[0].trangThai === 'cam' && vt(b.vat[0]) === '2,2');
  const c = chay(R, bd, L('arm_down()', 'grab()', 'wait()'));
  kiem('chưa thả vật tới đích: không thắng', !c.thang);
  const D2 = ['..D..', '.....', '..D..', '.....', '..o..'];
  const dd = chay(D2, { x: 2, y: 4, huong: 0 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()'));
  kiem('một vật, hai ô đích: chỉ cần đặt lên MỘT ô đích nào đó', dd.thang && vt(dd.vat[0]) === '2,2');
  const V2 = ['#D#', '#o#', '#D#', '#o#'];
  const bd2 = { x: 1, y: 3, huong: 0 };
  const leg1 = L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()');
  const leg2 = L('arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()');
  const e = chay(V2, bd2, leg1);
  kiem('hai vật, hai đích: đặt xong MỘT vật chưa thắng', !e.thang && e.vat.filter((v) => v.trangThai === 'dat' && vt(v) === '1,2').length === 1 && e.dich.length === 2);
  const f = chay(V2, bd2, leg1 + L('arm_up()', 'left_move()', 'right_move()', 'wait()'));
  kiem('  đi tới vật kia mà chưa nhặt: vẫn chưa thắng', !f.thang && f.nhip === 4);
  const hai = chay(V2, bd2, leg1 + leg2 + L('wait()', 'wait()'));
  kiem('  nhặt vật thứ hai chở lên đích còn lại và thả: thắng ngay ở cuối nhịp 7 (lệnh wait() sau đó không chạy)',
    hai.thang && hai.nhip === 7 && hai.vat.every((v) => v.trangThai === 'dat') && hai.vet[hai.vet.length - 1].loai === 'nhip', J([hai.thang, hai.nhip, hai.vat]));
  const X = ['.....', '.....', '..X..', '.....', '.....'];
  const g = chay(X, XE, 'wait()');
  kiem('ô X = đích đã có vật sẵn: mọi vật đã trên đích nên thắng ngay ở nhịp đầu (wait đầu tiên)', g.thang && g.nhip === 1 && g.dich.length === 1 && g.vatBanDau.length === 1, J([g.thang, g.nhip]));
  const h = chay(X, XE, L('arm_down()', 'grab()', 'wait()'));
  kiem('nhấc vật khỏi ô X: lúc đầu thắng ngay nhịp 1 (nhặt ở nhịp 1 nhưng điều kiện đúng ở cuối nhịp 1 thì vật đã cầm) → không thắng', !h.thang && h.vat[0].trangThai === 'cam');
  const k0 = chay(['.....', '..D..', '.....', '.....', '.....'], XE, L('wait()', 'wait()'));
  kiem('không có vật nào trên sân: không bao giờ thắng (không thắng trống)', !k0.thang && k0.vat.length === 0);
  const TIEN3 = L('left_move()', 'right_move()', 'wait()');
  const k1 = chay(['..F..', '.....', '.....', '..o..', '.....'], { x: 2, y: 4, huong: 0 }, TIEN3 + TIEN3 + TIEN3 + TIEN3);
  kiem('mục tiêu dua-vat bỏ qua cờ F: xe tới cờ (2,0) không thắng', !k1.thang && vt(k1.robot) === '2,0', J([k1.thang, k1.nhip, vt(k1.robot)]));
  const cof = chay(['.....', '..F..', '..o..', '.....', '.....'], { x: 2, y: 4, huong: 0 }, L('left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'wait()'), { mucTieu: 'toi-co' });
  kiem('mục tiêu toi-co giữ nguyên dù xe có tay và sân có vật: chạm cờ là thắng ngay (nhịp 3)', cof.thang && cof.nhip === 3 && maSK(cof, 'tay-vuong').length === 0, J([cof.thang, cof.nhip]));
  kiem('mục tiêu lạ bị từ chối khi cấu hình sai', (() => { try { chay(SAN, XE, 'wait()', { mucTieu: 'ban-do' }); return false; } catch (err) { return true; } })());
  const hh = chay(R, bd, 'while True:\n    wait()', { nhipToiDa: 30 });
  kiem('lặp vô hạn nhịp: qua-nhieu-nhip, đúng 30 nhịp', hh.loi && hh.loi.loai === 'qua-nhieu-nhip' && hh.nhip === 30);

  // vật vỡ: dừng sớm
  const vo = chay(R, bd, thang.replace('arm_down()\nrelease()', 'release()') + L('wait()', 'wait()', 'wait()'));
  kiem('vật vỡ: không thể thắng nữa nên dừng ngay cuối nhịp vỡ (dungSom vat-vo), không chạy tiếp', !vo.thang && vo.dungSom === 'vat-vo' && vo.nhip === 3 && vo.vat[0].trangThai === 'vo', J([vo.nhip, vo.dungSom]));
  kiem('  dừng sớm vì vỡ không kèm quen-wait / lỗi chạy, và vet kết thúc ở nhịp vỡ', maSK(vo, 'quen-wait').length === 0 && vo.loi === null && nhipVet(vo).length === 3);
  const vo2 = chay(V2, bd2, leg1.replace('arm_down()\nrelease()', 'release()') + leg2);
  kiem('hai vật, vật thứ nhất vỡ: dừng ngay, không bao giờ thắng dù chương trình còn đưa vật kia lên đích', vo2.dungSom === 'vat-vo' && !vo2.thang && vo2.nhip === 3 && vo2.vat.filter((v) => v.trangThai === 'vo').length === 1 && vo2.vat.filter((v) => v.trangThai === 'dat').length === 1, J([vo2.dungSom, vo2.nhip, vo2.vat]));
}

console.log('\n== 11. Ký hiệu sân: o vật · D ô đích · X đích có vật sẵn; xe đi qua ô vật không bị chặn ==');
{
  const s = SanHoc.docSan(['o.D', 'X..', '...']);
  kiem('docSan: vat = o và X (đọc từng hàng), dich = D và X', J(s.vat) === J([{ x: 0, y: 0 }, { x: 0, y: 1 }]) && J(s.dich) === J([{ x: 2, y: 0 }, { x: 0, y: 1 }]), J([s.vat, s.dich]));
  kiem('docSan giữ nguyên các ký tự của sân; sân cũ (chỉ . # F S băng) có vat và dich rỗng', s.o[0] === 'o.D' && SanHoc.docSan(['.#F', 'S>.']).vat.length === 0 && SanHoc.docSan(['.#F', 'S>.']).dich.length === 0);
  kiem('lyDoChan: ô o, D, X đều là sàn (không chặn)', ['o', 'D', 'X'].every((c) => SanHoc.lyDoChan(SanHoc.docSan([c]), 'banh', 0, 0) === null));
  kiem('ký hiệu lạ vẫn bị từ chối', (() => { try { SanHoc.docSan(['.q.']); return false; } catch (err) { return /Ký hiệu lạ/.test(err.message); } })());
  const a = chay(['.o.', '...', '...'], { x: 1, y: 2, huong: 0 }, L('left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'));
  kiem('xe đi qua ô vật không bị chặn (hai nhịp tiến qua ô có vật), không dam-tuong', vt(a.robot) === '1,0' && maSK(a, 'dam-tuong').length === 0);
  const b = chay(['.....'], { x: 0, y: 0, huong: 1 }, 'wait()', { vat: [{ x: 3, y: 0 }, { x: 9, y: 0 }, { x: -1, y: 0 }], dich: [{ x: 4, y: 0 }] });
  kiem('cfg.vat / cfg.dich thêm lớp riêng cạnh sân; vật ngoài sân bị bỏ', b.vat.length === 1 && b.dich.length === 1 && b.vat[0].id === 1 && vt(b.vat[0]) === '3,0');
  kiem('vật đặt trên tường (cfg.vat) bị bỏ', chay(['.#.'], { x: 0, y: 0, huong: 1 }, 'wait()', { vat: [{ x: 1, y: 0 }] }).vat.length === 0);
  kiem('id vật 1, 2, 3 … theo thứ tự đọc sân (hàng trên trước, trái sang phải), rồi tới cfg.vat', (() => {
    const k = chay(['..o', 'o..', '..o'], { x: 1, y: 1, huong: 0 }, 'wait()', { vat: [{ x: 0, y: 0 }] });
    return J(k.vat.map((v) => [v.id, v.x, v.y])) === J([[1, 2, 0], [2, 0, 1], [3, 2, 2], [4, 0, 0]]);
  })());
}

console.log('\n== 12. Vết cho giao diện: robot.tay và vat từng nhịp; chương cũ không đổi ==');
{
  const VAT = { vat: [{ x: 2, y: 2 }] };
  const a = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()'), VAT);
  const n = nhipVet(a);
  kiem('mỗi nhịp có robot.tay { tuThe, kep, cam } (sau nhịp) và vat [{ id, x, y, trangThai }]',
    n.length === 2 && n.every((x) => x.robot.tay && x.vat && x.vat.every((v) => ['dat', 'cam', 'vo'].includes(v.trangThai))) &&
      J(n[0].robot.tay) === J({ tuThe: 'duoi', kep: true, cam: 1 }) && J(n[1].robot.tay) === J({ tuThe: 'tren', kep: true, cam: 1 }), J(n.map((x) => x.robot.tay)));
  kiem('vet.tay là BẢN CHỤP: đổi tay sau đó không làm đổi các nhịp trước', n[0].robot.tay.tuThe === 'duoi' && n[1].robot.tay.tuThe === 'tren');
  kiem('kq.vatBanDau là vật lúc xuất phát; kq.vat là trạng thái cuối', J(a.vatBanDau) === J([{ id: 1, x: 2, y: 2, trangThai: 'dat' }]) && a.vat[0].trangThai === 'cam');
  const cu = SanHoc.chay({ san: SAN, batDau: XE, loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait'] }, 'left_move()\nright_move()\nwait()');
  kiem('hàm gốc chưa có lệnh tay (chương cũ): vết nhịp chỉ có banh như trước — không tay, không vat; kq.tay = null',
    cu.tay === null && nhipVet(cu).every((x) => x.robot.tay === undefined && x.vat === undefined && x.robot.banh) && J(Object.keys(nhipVet(cu)[0].robot).sort()) === J(['banh', 'huong', 'x', 'y']));
  const hc = ChamHoc.cham(ManHoc.timMa('tay-gap.1'), ManHoc.timMa('tay-gap.1').loiGiai, []);
  kiem('qua máy chấm (cham): kq.vatBanDau, kq.dich, kq.tay, kq.vat, theoSan[0].tay / vat / dich', hc.vatBanDau.length === 1 && hc.dich.length === 1 && hc.tay && hc.vat && hc.theoSan[0].vat && hc.theoSan[0].dich && hc.theoSan[0].tay);
}

/* ===================================================================== 5 */
console.log('\n== 13. Chẩn đoán qua máy chấm: mã, mức, lời ==');
{
  const m5 = ManHoc.timMa('tay-gap.5'), m2 = ManHoc.timMa('tay-gap.2'), m1 = ManHoc.timMa('tay-gap.1');
  const T_PICK = ['arm_down()', 'grab()', 'wait()'];
  const run = (m, chinh, kho) => ChamHoc.cham(m, { chinh }, kho || []);
  const mac = [];
  const r1 = run(m1, ['arm_down()', 'grab()', 'wait()', 'left_move()', 'right_move()', 'wait()']);
  const tv = r1.chanDoan.find((c) => c.ma === 'tay-vuong');
  mac.push(r1);
  kiem('tay-vuong: mức loi, nêu nhịp, lệnh bánh bị bỏ và nơi viết ra nó', tv && tv.muc === 'loi' && tv.nhip === 2 && /nhịp 2/.test(tv.loi) && /left_move\(\)/.test(tv.loi) && /chương trình, dòng 4/.test(tv.loi), tv && tv.loi);
  const r2 = run(m2, ['move()', 'grab()', 'wait()'], [H('move', ['left_move()', 'right_move()', 'wait()'])]);
  const kh = r2.chanDoan.find((c) => c.ma === 'kep-hut');
  mac.push(r2);
  kiem('kep-hut: mức thong-tin (không phải lỗi), nói "kẹp vào không khí: vật nằm dưới đất mà tay đang nâng"', kh && kh.muc === 'thong-tin' && /kẹp vào không khí/.test(kh.loi) && /vật nằm dưới đất mà tay đang nâng/.test(kh.loi) && kh.lyDo === 'tay-nang', kh && kh.loi);
  const r2b = run(m2, ['arm_down()', 'grab()', 'wait()']);
  const kh2 = r2b.chanDoan.find((c) => c.ma === 'kep-hut');
  mac.push(r2b);
  kiem('kep-hut (khong-co-vat): nói ô không có vật để gắp', kh2 && kh2.lyDo === 'khong-co-vat' && /không có vật nào để gắp/.test(kh2.loi));
  const r3 = run(m1, ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'release()', 'wait()']);
  const vv = r3.chanDoan.find((c) => c.ma === 'vat-vo');
  mac.push(r3);
  kiem('vat-vo: mức loi, nói "thả từ trên cao nên rơi vỡ", nêu nhịp; dừng sớm nên KHÔNG có chua-dua-vat', vv && vv.muc === 'loi' && /từ trên cao nên rơi vỡ/.test(vv.loi) && vv.nhip === 3 && !maCua(r3).includes('chua-dua-vat') && r3.sao === 0 && r3.theoSan[0].thang === false, vv && vv.loi);
  const m9 = ManHoc.timMa('tay-gap.9');
  const r4 = run(m9, ['pick()', 'arm_up()', 'move()', 'move()', 'drop()'], [H('pick', T_PICK), H('drop', ['arm_down()', 'release()', 'wait()']), H('move', ['left_move()', 'right_move()', 'wait()'])]);
  const oc = r4.chanDoan.find((c) => c.ma === 'o-co-vat');
  mac.push(r4);
  kiem('o-co-vat: mức loi, nêu ô và "mỗi ô chỉ chứa một vật"; vẫn có chua-dua-vat', oc && oc.muc === 'loi' && /đã có một vật/.test(oc.loi) && /Mỗi ô chỉ chứa một vật/.test(oc.loi) && maCua(r4).includes('chua-dua-vat'), oc && oc.loi);
  const r5 = run(m1, ['arm_down()', 'arm_up()', 'wait()']);
  const gl = r5.chanDoan.find((c) => c.ma === 'tay-goi-lai');
  mac.push(r5);
  kiem('tay-goi-lai: mức loi, nêu cả hai lệnh (kèm nơi viết) và nói "mỗi nhịp tay chỉ đổi tư thế một lần"', gl && gl.muc === 'loi' && /arm_down\(\)/.test(gl.loi) && /arm_up\(\)/.test(gl.loi) && /đổi tư thế một lần/.test(gl.loi) && gl.nhom === 'tu-the', gl && gl.loi);
  const r6 = run(m1, ['grab()', 'release()', 'wait()']);
  mac.push(r6);
  kiem('tay-goi-lai (nhóm kẹp): nói "kẹp hoặc thả một lần"', /kẹp hoặc thả một lần/.test(r6.chanDoan.find((c) => c.ma === 'tay-goi-lai').loi));
  const r7 = run(m1, ['arm_down()', 'grab()', 'wait()', 'wait()']);
  mac.push(r7);
  kiem('mục tiêu dua-vat chưa xong: chua-dua-vat (không phải chua-toi-co), nói còn mấy vật chưa nằm yên trên đích', maCua(r7).includes('chua-dua-vat') && !maCua(r7).includes('chua-toi-co') && /còn 1 trong 1 vật/.test(r7.chanDoan.find((c) => c.ma === 'chua-dua-vat').loi));
  const r8 = ChamHoc.cham(ManHoc.timMa('hai-banh.1'), { chinh: ['wait()'] }, []);
  kiem('chương mục tiêu tới cờ vẫn chua-toi-co như cũ', maCua(r8).join() === 'chua-toi-co');
  const r9 = ChamHoc.cham(ManHoc.timMa('hai-banh.1'), { chinh: ['arm_down()', 'wait()'] }, []);
  kiem('lệnh tay ở chương chưa có tay gắp: ham-chua-co, liệt kê hàm gốc của màn (không có lệnh tay)', maCua(r9).join() === 'ham-chua-co' && !/arm_down, arm_up/.test(r9.chanDoan[0].loi) && /left_move, right_move, wait/.test(r9.chanDoan[0].loi), r9.chanDoan[0].loi);
  const r10 = ChamHoc.cham(ManHoc.timMa('vong-lap.1'), { chinh: ['arm_down()', 'wait()', 'arm_up()', 'wait()', 'move()', 'move()'] }, [H('move', ['left_move()', 'right_move()', 'wait()'])]);
  kiem('chương vong-lap cũng có 4 lệnh tay trong hàm gốc (nhất quán): gọi được, không ham-chua-co', !maCua(r10).includes('ham-chua-co'));
  kiem('mọi lời chẩn đoán tay đều là tiếng Việt, ≤ 330 ký tự, có muc',
    mac.every((r) => r.chanDoan.every((c) => c.loi && c.loi.length <= 330 && /[a-zà-ỹ]/.test(c.loi) && (c.muc === 'loi' || c.muc === 'thong-tin'))), mac.map((r) => r.chanDoan.map((c) => c.loi.length)).join('|'));
}

/* ===================================================================== 6 */
console.log('\n== 14. Bộ dò đường tắt cho dua-vat (BFS) ==');
{
  const man = (san, bd) => ({ san, batDau: bd, loaiRobot: 'banh' });
  kiem('vật dưới xe, đích kề: 3 nhịp (nhặt, nâng+tiến, thả)', nhipDuaVatNganNhat(man(['.....', '..D..', '..o..'], { x: 2, y: 2, huong: 0 })).nhip === 3);
  kiem('vật dưới xe, đích cách hai ô: 4 nhịp', nhipDuaVatNganNhat(man(['..D..', '.....', '..o..'], { x: 2, y: 2, huong: 0 })).nhip === 4);
  kiem('xe cách vật một ô, đích sau vật một ô: 4 nhịp (đi, nhặt, nâng+đi, thả)', nhipDuaVatNganNhat(man(['..D..', '..o..', '.....'], { x: 2, y: 2, huong: 0 })).nhip === 4);
  kiem('ô X: mọi vật đã trên đích — 0 nhịp', nhipDuaVatNganNhat(man(['..X..'], { x: 0, y: 0, huong: 1 })).nhip === 0);
  kiem('không có vật nào: không bao giờ thắng', nhipDuaVatNganNhat(man(['..D..'], { x: 0, y: 0, huong: 1 })).nhip === null);
  kiem('đích bị tường vây kín: không tới được (null, không cắt ngang)', (() => { const k = nhipDuaVatNganNhat(man(['o.#D#', '..###'], { x: 0, y: 0, huong: 1 })); return k.nhip === null && k.catNgang === false; })());
  const nho = nhipDuaVatNganNhat(man(['.....', '.....', '..D..', '.....', '..o..'], { x: 2, y: 4, huong: 0 }), { toiDaTrangThai: 20 });
  kiem('giới hạn trạng thái: quá giới hạn thì báo catNgang (không khẳng định gì về đường tắt)', nho.nhip === null && nho.catNgang === true);
  kiem('hai vật, hai đích: bộ dò cho đáp án tối ưu (chọn vật nào lên đích nào)', nhipDuaVatNganNhat(man(['D.D', '...', 'o.o'], { x: 0, y: 2, huong: 0 })).nhip >= 7);
  // đường tắt: sân thật bỏ tường thì có đường tắt
  const m7 = ManHoc.timMa('tay-gap.7');
  const rong = Object.assign({}, m7, { san: ['...', '..D', '...', 'o..', '...'] });
  const bfs7 = nhipDuaVatNganNhat(m7).nhip;
  kiem('mở hành lang của tay-gap.7 (bỏ tường) thì có ĐƯỜNG TẮT (' + nhipDuaVatNganNhat(rong).nhip + ' < ' + bfs7 + ' của sân gốc)', nhipDuaVatNganNhat(rong).nhip < bfs7, String(nhipDuaVatNganNhat(rong).nhip));
  kiem('  tay-gap.7 chấm sao theo lời giải chuẩn (nhipTheoLoiGiai): BFS sân gốc ' + bfs7 + ' ≤ sao.nhip ' + m7.sao.nhip + ', chênh đúng 1 nhịp (một lần pick() tốn thêm nhịp nâng tay)', m7.nhipTheoLoiGiai === true && bfs7 <= m7.sao.nhip && m7.sao.nhip - bfs7 === 1, J([bfs7, m7.sao.nhip]));
  // bộ dò có tính băng chuyền (chương bang-chuyen): chuỗi BFS chạy trong SanHoc phải thắng đúng nhịp đó; kiểm sâu hơn ở kiem-bang-chuyen.mjs
  for (const [ten, san, bd] of [['băng thuận', ['o>>>D'], { x: 0, y: 0, huong: 1 }], ['băng ngược', ['D<<<o'], { x: 4, y: 0, huong: 3 }], ['băng rẽ góc', ['o>v.', '###D'], { x: 0, y: 0, huong: 1 }]]) {
    const k = nhipDuaVatNganNhat(man(san, bd));
    const r = SanHoc.chay({ san, batDau: bd, loaiRobot: 'banh', hamGoc: HG, mucTieu: 'dua-vat' }, chuoiThanhMa(k.chuoi));
    kiem('bộ dò có tính băng chuyền (' + ten + '): BFS ' + k.nhip + ' nhịp, chuỗi của BFS chạy trong SanHoc thắng đúng nhịp đó', k.nhip !== null && !k.catNgang && r.thang && r.nhip === k.nhip, J([k.nhip, r.thang, r.nhip]));
  }

  // kiểm chéo: chuỗi BFS chạy trong mô phỏng thật phải thắng đúng nhịp đó
  const ds = ManHoc.danhSach.filter((m) => m.chuong === 'tay-gap');
  for (const m of ds) {
    const k = nhipDuaVatNganNhat(m);
    const r = SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: 'banh', hamGoc: m.hamGoc, mucTieu: 'dua-vat' }, chuoiThanhMa(k.chuoi));
    const theoLoiGiai = m.nhipTheoLoiGiai === true;
    kiem(m.id + ': BFS = ' + k.nhip + ' nhịp (' + k.soTrangThai + ' trạng thái, không bị cắt), ' + (theoLoiGiai ? '≤ sao.nhip ' + m.sao.nhip + ' (chấm theo lời giải chuẩn)' : '= sao.nhip') + '; chuỗi hành động của BFS chạy trong SanHoc thắng đúng nhịp đó',
      (theoLoiGiai ? k.nhip !== null && k.nhip <= m.sao.nhip : k.nhip === m.sao.nhip) && k.catNgang === false && r.thang && r.nhip === k.nhip, J([k.nhip, r.thang, r.nhip]));
  }
}

console.log('\n== 15. Kiểm ngẫu nhiên: mô hình của bộ dò = mô phỏng SanHoc (mọi nhịp, mọi tổ hợp) ==');
{
  function prng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const bang = [
    { san: ['.....', '.o...', '..D..', '...o.', '..D..'], bd: { x: 1, y: 1, huong: 0 } },
    { san: ['#o.D#', '..#..', 'o.D.o', '.#...', 'X....'], bd: { x: 2, y: 2, huong: 1 } },
    { san: ['..o..', '.#.#.', 'DoD..', '.....', '..o..'], bd: { x: 2, y: 4, huong: 3 } },
    { san: ['ooD..', 'o.o..', '..D..', '.....', '.....'], bd: { x: 0, y: 0, huong: 1 } },
    // có băng chuyền: xe, vật đang cầm đi theo băng; vật nằm dưới đất không bị băng đẩy
    { san: ['.o>>D', '.>v.o', 'D<<..', '.....', '..o..'], bd: { x: 0, y: 0, huong: 1 } },
    { san: ['o.v.D', '.>>v.', 'D^<<o', '.#...', '.....'], bd: { x: 2, y: 3, huong: 0 } }
  ];
  let soChay = 0, soNhip = 0, lech = '';
  const dem = { nhat: 0, dat: 0, vo: 0, oco: 0, vuong: 0, kephut: 0 };
  bang.forEach((b, bi) => {
    const rand = prng(12345 + bi);
    const ctx = dungNguCanh({ san: b.san, batDau: b.bd, loaiRobot: 'banh' });
    for (let lan = 0; lan < 250 && !lech; lan++) {
      const dai = 1 + Math.floor(rand() * 14);
      const chuoi = [];
      for (let i = 0; i < dai; i++) chuoi.push(HANH_DONG[Math.floor(rand() * HANH_DONG.length)]);
      const kq = SanHoc.chay({ san: b.san, batDau: b.bd, loaiRobot: 'banh', hamGoc: HG, mucTieu: 'dua-vat' }, chuoiThanhMa(chuoi));
      let S = trangThaiDau(ctx);
      const nv = nhipVet(kq);
      soChay++;
      for (let i = 0; i < nv.length && !lech; i++) {
        S = buocMotNhip(ctx, S, chuoi[i]);
        const x = nv[i], tay = x.robot.tay;
        const moHinhVat = S.pos.map((p, id) => (p === -2 ? ['vo'] : p === -1 ? ['cam', S.x, S.y] : ['dat', p % ctx.rong, Math.floor(p / ctx.rong)]));
        const mpVat = x.vat.map((v) => (v.trangThai === 'vo' ? ['vo'] : [v.trangThai, v.x, v.y]));
        const ok = x.robot.x === S.x && x.robot.y === S.y && x.robot.huong === S.h && tay.tuThe === (S.t ? 'duoi' : 'tren') && (tay.cam === null ? -1 : tay.cam - 1) === S.cam && J(moHinhVat) === J(mpVat);
        soNhip++;
        for (const e of x.suKien) { if (e.ma === 'nhat-vat') dem.nhat++; else if (e.ma === 'dat-vat') dem.dat++; else if (e.ma === 'vat-vo') dem.vo++; else if (e.ma === 'o-co-vat') dem.oco++; else if (e.ma === 'tay-vuong') dem.vuong++; else if (e.ma === 'kep-hut') dem.kephut++; }
        if (!ok) lech = 'bảng ' + bi + ' lần ' + lan + ' nhịp ' + (i + 1) + ': mô hình ' + J([S.x, S.y, S.h, S.t, S.cam, moHinhVat]) + ' ≠ mô phỏng ' + J([x.robot, tay, mpVat]) + ' chuỗi ' + J(chuoi.slice(0, i + 1));
      }
      if (!lech && nv.length < chuoi.length) {                       // dừng sớm: chỉ khi thắng hay vỡ ở nhịp cuối của vết
        const cuoi = nv[nv.length - 1];
        const dung = kq.thang ? laThang(ctx, S) : kq.dungSom === 'vat-vo' && S.pos.some((p) => p === -2);
        if (!dung) lech = 'bảng ' + bi + ' lần ' + lan + ': mô phỏng dừng ở nhịp ' + nv.length + ' mà mô hình không thắng / không vỡ';
      }
      if (!lech && kq.thang !== (nv.length > 0 && laThang(ctx, (() => { let T = trangThaiDau(ctx); for (let i = 0; i < nv.length; i++) T = buocMotNhip(ctx, T, chuoi[i]); return T; })()))) lech = 'bảng ' + bi + ' lần ' + lan + ': kết luận thắng khác nhau';
    }
  });
  kiem('hơn 900 chương trình ngẫu nhiên (' + soChay + ' chạy, ' + soNhip + ' nhịp): vị trí, hướng, tư thế tay, vật cầm và trạng thái từng vật khớp hoàn toàn', soChay >= 900 && lech === '', lech);
  kiem('  phủ đủ các sự kiện: nhặt ' + dem.nhat + ', đặt ' + dem.dat + ', vỡ ' + dem.vo + ', ô-có-vật ' + dem.oco + ', tay-vướng ' + dem.vuong + ', kẹp-hụt ' + dem.kephut,
    Object.values(dem).every((v) => v > 0), J(dem));
}

/* ===================================================================== 7 */
console.log('\n== 16. Chương tay-gap: dữ liệu 10 màn, bảng tóm tắt ==');
{
  const ds = ManHoc.danhSach.filter((m) => m.chuong === 'tay-gap');
  kiem('đúng 10 màn, số 1..10, id 3.1…3.10 (chương thứ 3), mã tay-gap.1…', ds.length === 10 && ds.every((m, i) => m.so === i + 1 && m.id === '3.' + (i + 1) && m.ma === 'tay-gap.' + (i + 1)));
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ màn 10 có huy hiệu tay-gap',
    J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) &&
      ds.filter((m) => m.huyHieu).length === 1 && ds[9].huyHieu.ma === 'tay-gap' && ds[9].huyHieu.ten === 'Huy hiệu Tay gắp');
  kiem('màn nào cũng: mục tiêu dua-vat, chưa có for, chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, xe hai bánh', ds.every((m) => m.mucTieu === 'dua-vat' && J(m.cauTruc) === '[]' && m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong && m.loaiRobot === 'banh'));
  kiem('sân tối đa 7×7, mỗi sân có ít nhất một vật và một ô đích', ds.every((m) => m.san.length <= 7 && m.san[0].length <= 7 && SanHoc.docSan(m.san).vat.length >= 1 && SanHoc.docSan(m.san).dich.length >= SanHoc.docSan(m.san).vat.length));
  kiem('taoHam: màn 5 pick, màn 6 drop, màn 10 carry; các màn khác không tạo hàm', J(ds.map((m) => m.taoHam)) === J([[], [], [], [], ['pick'], ['drop'], [], [], [], ['carry']]));
  const kho = KhoHam.moi();
  for (const h of MAU.filter((x) => ['move', 'turn_right', 'turn_left'].includes(x.ten))) { kho.tao(h.ten, h.thamSo); kho.sua(h.ten, h.than); }
  const bangTom = [];
  for (const m of ds) {
    const truoc = kho.ds();
    const tenTruoc = truoc.map((h) => h.ten);
    // màn "Tiết kiệm nhịp" (tietKiemNhip): lời giải SỬA riêng pick() / drop() có sẵn trong kho; không ghi vào kho dùng chung cho các màn sau
    const suaRieng = m.tietKiemNhip === true ? m.loiGiai.hamCuaEmMoi.filter((h) => tenTruoc.includes(h.ten)) : [];
    for (const h of m.loiGiai.hamCuaEmMoi) { if (suaRieng.includes(h)) continue; if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo); kho.sua(h.ten, h.than); }
    const khoChoMan = suaRieng.length ? tron(kho.ds(), suaRieng) : kho.ds();
    const r = ChamHoc.cham(m, m.loiGiai, khoChoMan);
    const hamMan = m.loiGiai.hamCuaMan.map((h) => h.ten), hamMoi = m.loiGiai.hamCuaEmMoi.map((h) => h.ten).filter((t) => !tenTruoc.includes(t) || !suaRieng.some((h) => h.ten === t));
    const tuKho = r.hamDaDung.filter((t) => !hamMan.includes(t) && !hamMoi.includes(t));
    kiem(m.id + ': hamCuaEmCan [' + m.hamCuaEmCan.join(', ') + '] khớp đúng các hàm lấy từ kho mà lời giải gọi tới (không thừa, không thiếu)',
      J(m.hamCuaEmCan.slice().sort()) === J(tuKho.slice().sort()), J([m.hamCuaEmCan, tuKho]));
    kiem(m.id + ': lời giải thắng 3 sao, không chẩn đoán (kể cả thông tin), thắng ở cuối nhịp ' + r.soNhip + ' và ' + (m.tietKiemNhip ? 'ít hơn hoặc bằng sao.o ' + m.sao.o + ' (sao.o theo lời giải chuẩn; ' + r.soO + ' ô)' : 'đúng sao.o ' + m.sao.o + ' (' + r.soO + ' ô)'),
      r.thang && r.sao === 3 && r.chanDoan.length === 0 && r.soNhip === m.sao.nhip && (m.tietKiemNhip ? r.soO <= m.sao.o : r.soO === m.sao.o) && r.theoSan[0].vet.slice(-1)[0].suKien.some((e) => e.ma === 'xong-dua-vat'), J([r.sao, r.soNhip, r.soO, maCua(r)]));
    kiem(m.id + ': lời giải KHÔNG dùng cấu trúc chưa học (for)', !/\bfor\b/.test(JSON.stringify(m.loiGiai)));
    bangTom.push({ m, r });
  }
  const maDaCo = new Set();
  for (const m of ds) for (const ls of m.loiSai) for (const c of ls.phaiCoMa) maDaCo.add(c);
  kiem('lời sai của chương phủ các mã mới: kep-hut, tay-vuong, vat-vo, o-co-vat, tay-goi-lai, chua-dua-vat (và tran-khung, quen-wait, dam-tuong, ham-chua-co)',
    ['kep-hut', 'tay-vuong', 'vat-vo', 'o-co-vat', 'tay-goi-lai', 'chua-dua-vat', 'tran-khung', 'quen-wait', 'dam-tuong', 'ham-chua-co'].every((c) => maDaCo.has(c)), J([...maDaCo]));
  const wantMan = (id) => ds.find((m) => m.id === id);
  kiem('3.3 là "đố": maMau dùng arm_up() trước grab() → kẹp hụt; sửa đúng một lệnh là thắng',
    (() => { const m = wantMan('3.3'); const r = ChamHoc.cham(m, m.maMau, kho.ds()); return !r.thang && maCua(r).includes('kep-hut') && m.maMau.chinh[0] === 'arm_up()' && m.maMau.chinh[1] === 'grab()' && m.loiGiai.chinh[0] === 'arm_down()' && m.maMau.chinh.slice(1).join() === m.loiGiai.chinh.slice(1).join(); })());
  kiem('3.4 là "đố": maMau quên nâng tay sau khi nhặt → xe kẹt (tay-vuong); thêm arm_up() + wait() (cách chuẩn) là thắng, chỉ thêm arm_up() ngay trước lệnh đi (gộp nhịp) cũng thắng',
    (() => {
      const m = wantMan('3.4'); const r = ChamHoc.cham(m, m.maMau, kho.ds());
      const chuan = m.maMau.chinh.slice(); chuan.splice(3, 0, 'arm_up()', 'wait()');           // sau nhặt (3 dòng) chèn nâng tay + wait
      const gop = m.maMau.chinh.slice(); gop.splice(3, 0, 'arm_up()');                         // chỉ arm_up() ngay trước lệnh đi
      const rc = ChamHoc.cham(m, { chinh: chuan }, kho.ds()), rg = ChamHoc.cham(m, { chinh: gop }, kho.ds());
      return !r.thang && maCua(r).includes('tay-vuong') && J(chuan) === J(m.loiGiai.chinh) && m.maMau.chinh.filter((x) => x === 'arm_up()').length === 0 &&
        rc.thang && rc.sao === 3 && rg.thang && rg.sao === 3 && rg.soNhip < rc.soNhip;
    })());
  kiem('3.8 sửa hàm của màn: drop_nhanh() thiếu arm_down() → thả từ trên cao, vật vỡ; sửa thân hàm là thắng',
    (() => { const m = wantMan('3.8'); const r = ChamHoc.cham(m, m.maMau, kho.ds()); return !r.thang && maCua(r).includes('vat-vo') && m.maMau.hamCuaMan[0].ten === 'drop_nhanh' && m.loiGiai.hamCuaMan[0].than.includes('arm_down()') && !m.maMau.hamCuaMan[0].than.includes('arm_down()') && m.loiGiai.chinh.join() === m.maMau.chinh.join(); })());
  kiem('3.9: hai vật, hai đích; 3.10: ba vật, ba đích, có huy hiệu', SanHoc.docSan(wantMan('3.9').san).vat.length === 2 && SanHoc.docSan(wantMan('3.9').san).dich.length === 2 && SanHoc.docSan(wantMan('3.10').san).vat.length === 3 && SanHoc.docSan(wantMan('3.10').san).dich.length === 3);
  kiem('3.5 và 3.6, 3.10 buộc phải gói hàm: không gói thì tran-khung (lời sai tran-khung có sẵn)', ['3.5', '3.6', '3.10'].every((id) => wantMan(id).loiSai.some((l) => l.phaiCoMa.includes('tran-khung'))));
  kiem('mọi lời giải khác (loiGiaiKhac) có cấu trúc khác lời giải (khác dòng chương trình, hoặc thân hàm)', ds.every((m) => J(m.loiGiaiKhac.baiLam.chinh) !== J(m.loiGiai.chinh) || J(m.loiGiaiKhac.hamCuaEmMoi) !== J(m.loiGiai.hamCuaEmMoi) || J(m.loiGiaiKhac.baiLam.hamCuaMan) !== J(m.loiGiai.hamCuaMan)));

  /* ---- cách chấm sao theo quyết định mới: pick() / drop() chuẩn làm trọn việc, viết tự nhiên là 3 sao ---- */
  const thanMau = (ten) => MAU.find((x) => x.ten === ten).than;
  kiem('thư viện mẫu: pick() = hạ tay, kẹp, wait, nâng tay, wait; drop() = hạ tay, thả, wait, nâng tay, wait (trả tay về nâng)',
    J(thanMau('pick')) === J(['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()']) && J(thanMau('drop')) === J(['arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()']));
  kiem('pick() / drop() do lời giải 3.5 và 3.6 tạo ra khớp đúng thư viện mẫu (cách chuẩn)',
    J(wantMan('3.5').loiGiai.hamCuaEmMoi[0].than) === J(thanMau('pick')) && J(wantMan('3.6').loiGiai.hamCuaEmMoi[0].than) === J(thanMau('drop')));
  const goiPickDrop = (m) => { const t = JSON.stringify([m.loiGiai.chinh, m.loiGiai.hamCuaEmMoi, m.loiGiai.hamCuaMan]); return t.includes('"pick()"') || t.includes('"drop()"'); };
  const manPD = ds.filter((m) => goiPickDrop(m) && !m.tietKiemNhip);
  kiem('có màn dùng pick() / drop(): 3.5, 3.6, 3.7, 3.8, 3.10 (3.9 là màn tiết kiệm nhịp)', J(manPD.map((m) => m.id)) === J(['3.5', '3.6', '3.7', '3.8', '3.10']), J(manPD.map((m) => m.id)));
  const khoMau = MAU.map((h) => H(h.ten, h.than.slice(), h.thamSo.slice()));
  for (const m of manPD) {
    const r = ChamHoc.cham(m, m.loiGiai, tron(khoMau, m.loiGiai.hamCuaEmMoi));
    kiem(m.id + ': dùng pick() / drop() CHUẨN của thư viện mẫu (làm trọn việc) → 3 sao, đúng sao.nhip ' + m.sao.nhip + ' và sao.o ' + m.sao.o, r.thang && r.sao === 3 && r.soNhip === m.sao.nhip && r.soO === m.sao.o, J([r.sao, r.soNhip, r.soO, maCua(r)]));
    const gop = tron(khoMau, [H('pick', ['arm_down()', 'grab()', 'wait()', 'arm_up()']), H('drop', ['arm_down()', 'release()', 'wait()', 'arm_up()'])].concat(m.loiGiai.hamCuaEmMoi.filter((h) => !['pick', 'drop'].includes(h.ten))));
    const rg = ChamHoc.cham(m, m.loiGiai, gop);
    kiem(m.id + ': pick() / drop() bản gộp (nâng tay chung nhịp với lệnh kế) cũng 3 sao, ít nhịp hơn hoặc bằng (' + rg.soNhip + ' ≤ ' + m.sao.nhip + ')', rg.thang && rg.sao === 3 && rg.soNhip <= m.sao.nhip && rg.soO <= m.sao.o, J([rg.sao, rg.soNhip, rg.soO, maCua(rg)]));
  }
  const nhipBfs = (m) => nhipDuaVatNganNhat(m).nhip;
  const kcNhip = ds.map((m) => m.sao.nhip - nhipBfs(m));
  kiem('cờ nhipTheoLoiGiai đúng chỗ: có cờ (mọi màn trừ 3.9) thì sao.nhip > BFS; 3.9 không cờ thì sao.nhip = BFS',
    ds.every((m, i) => (m.nhipTheoLoiGiai === true ? kcNhip[i] > 0 : kcNhip[i] === 0)) && J(ds.filter((m) => m.nhipTheoLoiGiai).map((m) => m.id)) === J(['3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.10']), J(kcNhip));
  {
    const T_P = ['arm_down()', 'grab()', 'wait()'], T_T = ['arm_down()', 'release()', 'wait()'];
    const gop31 = ChamHoc.cham(wantMan('3.1'), { chinh: [...T_P, 'arm_up()', 'move()', ...T_T] }, khoMau);
    const gop32 = ChamHoc.cham(wantMan('3.2'), { chinh: ['move()', ...T_P, 'arm_up()', 'move()', ...T_T] }, khoMau);
    kiem('3.1 / 3.2: cách gộp arm_up() với lệnh đi (không dùng wait() riêng) vẫn 3 sao, nhanh hơn một nhịp so với sao.nhip',
      [gop31, gop32].every((r, i) => r.thang && r.sao === 3 && r.soNhip === wantMan(i ? '3.2' : '3.1').sao.nhip - 1), J([gop31.sao, gop31.soNhip, gop32.sao, gop32.soNhip]));
    kiem('3.1 / 3.2 / 3.4: lời giải chuẩn viết tự nhiên vừa khung 10 ô (9, 10, 10 dòng chương trình)',
      J(['3.1', '3.2', '3.4'].map((id) => wantMan(id).loiGiai.chinh.length)) === J([9, 10, 10]));
  }
  const tk = ds.filter((m) => m.tietKiemNhip);
  kiem('đúng MỘT màn "Tiết kiệm nhịp" (3.9): sao.nhip = BFS; đề bài nói tới số nhịp, gợi ý nhắc lệnh tay và lệnh bánh chạy chung một nhịp',
    tk.length === 1 && tk[0].id === '3.9' && tk[0].ten === 'Tiết kiệm nhịp' && tk[0].sao.nhip === nhipBfs(tk[0]) && tk[0].deBai.includes('nhịp') && tk[0].goiY[0].includes('arm_up()') && tk[0].goiY[0].includes('cùng nhịp'));
  {
    const m9 = wantMan('3.9');
    const std = ChamHoc.cham(m9, m9.loiGiaiKhac.baiLam, tron(khoMau, m9.loiGiaiKhac.hamCuaEmMoi));
    kiem('3.9: cách chuẩn (pick() / drop() đầy đủ) thắng nhưng đúng 2 sao (ô = sao.o ' + m9.sao.o + ', chậm: ' + std.soNhip + ' > ' + m9.sao.nhip + ' nhịp)',
      std.thang && std.sao === 2 && std.soO === m9.sao.o && std.soNhip > m9.sao.nhip && std.chanDoan.length === 0, J([std.sao, std.soO, std.soNhip, maCua(std)]));
    const fast = ChamHoc.cham(m9, m9.loiGiai, tron(khoMau, m9.loiGiai.hamCuaEmMoi));
    kiem('3.9: sửa pick() / drop() thành bản gộp → 3 sao, ' + fast.soNhip + ' nhịp = BFS, ít ô hơn cách chuẩn (' + fast.soO + ' < ' + m9.sao.o + ')', fast.thang && fast.sao === 3 && fast.soNhip === nhipBfs(m9) && fast.soO < m9.sao.o);
    // người chơi thật: bản sửa ở 3.9 ở lại trong kho; các màn khác vẫn 3 sao (nhanh hơn hoặc bằng, ít ô hơn)
    const khoSau = tron(khoMau, m9.loiGiai.hamCuaEmMoi);
    const tiep = manPD.map((m) => ChamHoc.cham(m, m.loiGiai, tron(khoSau, m.loiGiai.hamCuaEmMoi.filter((h) => !['pick', 'drop'].includes(h.ten)))));
    kiem('sau khi sửa pick() / drop() ở 3.9, các màn còn lại dùng chúng vẫn 3 sao (nhịp và ô không vượt sao.nhip, sao.o)',
      tiep.every((r, i) => { const m = manPD[i]; return r.thang && r.sao === 3 && r.soNhip <= m.sao.nhip && r.soO <= m.sao.o; }), J(tiep.map((r) => [r.sao, r.soNhip, r.soO])));
  }

  console.log('\n  Bảng 10 màn tay-gap (sân in lưới: o vật · D đích · # tường · xe ^ > v < theo hướng bắt đầu)');
  const mui = ['^', '>', 'v', '<'];
  for (const { m, r } of bangTom) {
    console.log('\n  ' + m.id + '  ' + m.ten + '   ô ' + m.sao.o + ' · nhịp ' + m.sao.nhip + ' · ' + (m.hamCuaEmCan.length ? 'kho: ' + m.hamCuaEmCan.join(', ') : 'kho: -') + (m.taoHam.length ? ' · tạo: ' + m.taoHam.join(', ') : ''));
    m.san.forEach((hang, y) => {
      let d = '';
      for (let x = 0; x < hang.length; x++) d += (x === m.batDau.x && y === m.batDau.y) ? (hang[x] === 'o' ? '@' : mui[m.batDau.huong]) : hang[x];
      console.log('      ' + d);
    });
    console.log('      (@ = xe đứng trên vật)');
    console.log('      chương trình: ' + m.loiGiai.chinh.join(' ; '));
    for (const h of m.loiGiai.hamCuaEmMoi) console.log('      hàm mới ' + h.ten + '(): ' + h.than.join(' ; '));
    for (const h of m.loiGiai.hamCuaMan) console.log('      hàm của màn ' + h.ten + '(): ' + h.than.join(' ; '));
  }
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

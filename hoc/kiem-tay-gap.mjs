/* ============================================================================
   kiem-tay-gap.mjs — máy kiểm LUẬT TAY GẮP và chương `tay-gap` của "Đường học".
   Gồm: lệnh tay chạy theo nhịp, thứ tự (tư thế → kẹp / thả → bánh → băng chuyền), trạng thái tay,
   grab / release Ở Ô TRƯỚC MẶT, vật chiếm ô (mọi thân đứng im khi gặp vật), tay vướng sàn, vật đi theo xe, thả bị chặn (tha-bi-chan),
   color() theo phần cứng (cảm biến bụng đọc sàn dưới xe kể cả khi mang vật; camera đọc ô trước mặt), load() ở ô trước, mục tiêu dua-vat, ký hiệu sân,
   vết cho giao diện, chẩn đoán qua máy chấm, bộ dò đường tắt dua-vat (kiểm chéo với mô phỏng và kiểm
   ngẫu nhiên), và bảng 10 màn.
   Chạy: node hoc/kiem-tay-gap.mjs        (trượt thì thoát mã 1)
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
  kiem('hàm gốc có lệnh tay: arm_down, arm_up, grab, release (và arm_left, arm_right của tay xoay) thuộc TAY_LENH; nhện cũng dùng được (chương nhen), tên lạ vẫn bị từ chối',
    J(SanHoc.TAY_LENH) === J(['arm_down', 'arm_up', 'grab', 'release', 'arm_left', 'arm_right']) &&
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
  const c = chay(SAN, { x: 2, y: 2, huong: 0 }, L('arm_down()', 'grab()', 'release()', 'wait()'), { vat: [{ x: 2, y: 1 }] });
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
console.log('\n== 4. Thứ tự trong một nhịp: (a) tư thế → (b) kẹp / thả ở tư thế MỚI (Ô TRƯỚC MẶT) → (c) bánh → (d) băng chuyền ==');
{
  const VAT = { vat: [{ x: 2, y: 1 }] };                                  // vật ngay trước mặt xe (2,2) quay lên
  const a = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()'), VAT);
  kiem('arm_down + grab cùng nhịp: kẹp ở tư thế hạ nên NHẶT được vật ở ô trước mặt (tay { duoi, kep, cam 1 }); vật đi theo xe (vẽ ở ô xe)',
    J(a.tay) === J({ tuThe: 'duoi', kep: true, cam: 1 }) && a.vat[0].trangThai === 'cam' && vt(a.vat[0]) === '2,2' && a.nhip === 1 && maTrongNhip(nhipVet(a)[0], 'nhat-vat').length === 1, J([a.tay, a.vat]));
  kiem('  sự kiện nhat-vat nêu ô vật nằm (2,1), không phải ô xe', vt(maTrongNhip(nhipVet(a)[0], 'nhat-vat')[0].o) === '2,1');
  const b = chay(SAN, XE, L('grab()', 'arm_down()', 'wait()'), VAT);
  kiem('thứ tự DÒNG lệnh trong nhịp không quan trọng: grab() viết trước arm_down() vẫn nhặt được', J(b.tay) === J(a.tay) && b.vat[0].trangThai === 'cam');
  const c = chay(SAN, XE, L('arm_down()', 'wait()', 'grab()', 'wait()'), VAT);
  kiem('hạ tay ở nhịp 1, kẹp ở nhịp 2: cũng nhặt được', c.tay.cam === 1 && c.nhip === 2);
  const d = chay(SAN, XE, L('arm_down()', 'grab()', 'left_move()', 'right_move()', 'wait()'), VAT);
  kiem('bánh + tay cùng nhịp: tay hạ trước, kẹp nhặt vật, rồi bánh bị chặn (tay-vuong) — xe không đi, vật vẫn ở tay',
    vt(d.robot) === '2,2' && d.tay.cam === 1 && maSK(d, 'tay-vuong').length === 1 && maSK(d, 'dam-tuong').length === 0, J([d.robot, d.tay, d.suKien]));
  const nang = L('arm_down()', 'grab()', 'wait()');
  const e = chay(SAN, XE, nang + L('arm_up()', 'left_move()', 'right_move()', 'wait()'), VAT);
  kiem('arm_up + bánh cùng nhịp (tay nâng TRƯỚC khi bánh chạy): vật đã nhặt nên ô trước trống, xe đi vào, vật đi theo; không tay-vuong',
    vt(e.robot) === '2,1' && e.vat[0].x === 2 && e.vat[0].y === 1 && maSK(e, 'tay-vuong').length === 0 && maSK(e, 'dam-tuong').length === 0, J([e.robot, e.vat]));
  const f = chay(SAN, XE, nang + L('arm_up()', 'release()', 'wait()'), VAT);
  kiem('arm_up + release cùng nhịp: thả ở tư thế MỚI (nâng) nên vật rơi xuống ô trước mặt (2,1) và VỠ', f.vat[0].trangThai === 'vo' && maSK(f, 'vat-vo').length === 1 && f.tay.cam === null && vt(maSK(f, 'vat-vo')[0].o) === '2,1', J([f.vat, f.suKien]));
  const g = chay(SAN, XE, nang + L('arm_up()', 'wait()', 'arm_down()', 'release()', 'wait()'), VAT);
  kiem('arm_down + release cùng nhịp: thả ở tư thế hạ nên vật nằm xuống Ô TRƯỚC MẶT (2,1), xe vẫn ở (2,2)', g.vat[0].trangThai === 'dat' && vt(g.vat[0]) === '2,1' && vt(g.robot) === '2,2' && g.tay.cam === null && g.tay.kep === false && maTrongNhip(nhipVet(g)[2], 'dat-vat').length === 1, J([g.vat, g.tay]));
  const h = chay(SAN, XE, L('arm_down()', 'grab()', 'left_move()', 'wait()', 'arm_up()', 'right_move()', 'wait()'), VAT);
  kiem('quay tại chỗ cũng bị chặn khi tay hạ (nhịp 1), rồi quay được khi tay đã nâng (nhịp 2)', h.vet.filter((e2) => e2.loai === 'nhip')[0].robot.huong === 0 && h.robot.huong === 3, J(h.robot));
  // băng chuyền sau bánh; vật đi theo (xe đứng trên băng, vật nằm trên băng ngay trước mặt)
  const BANG = ['.>>>.'];
  const bg = chay(BANG, { x: 1, y: 0, huong: 1 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'wait()'), { vat: [{ x: 2, y: 0 }] });
  const nbg = nhipVet(bg);
  kiem('(d) băng chuyền như cũ, sau tay và bánh: đủ 2 nhịp trên băng thì đẩy xe 1 ô (ô trước đã trống vì vật được nhặt); vật đang cầm đi theo xe',
    vt(nbg[1].robot) === '2,0' && nbg[1].vat[0].x === 2 && maTrongNhip(nbg[1], 'bang-day').length === 1 && nbg[0].vat[0].x === 1, J(nbg.map((n) => [vt(n.robot), n.vat[0].x])));
  const th = chay(['.>>>D'], { x: 1, y: 0, huong: 1 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'wait()', 'wait()', 'arm_down()', 'release()', 'wait()'), { vat: [{ x: 2, y: 0 }] });
  kiem('mang vật bằng băng chuyền (hai lần đẩy: 1→2→3), thả xuống đích ở ô trước mặt (4,0): thắng ở nhịp 5', th.thang === true && th.nhip === 5 && vt(th.vat[0]) === '4,0' && vt(th.robot) === '3,0', J([th.thang, th.nhip, th.vat]));
}

/* ===================================================================== 3 */
console.log('\n== 5. grab(): chỉ gắp được vật ở Ô TRƯỚC MẶT, ngang tầm tay ==');
{
  const VAT = { vat: [{ x: 2, y: 1 }] };
  const a = chay(SAN, XE, L('grab()', 'wait()'), VAT);
  const ev = maSK(a, 'kep-hut')[0];
  kiem('tay nâng mà grab() khi ô trước có vật: kẹp vào không khí — kep đóng, không cầm gì, vật vẫn nằm; sự kiện kep-hut (tay-nang)',
    J(a.tay) === J({ tuThe: 'tren', kep: true, cam: null }) && a.vat[0].trangThai === 'dat' && maSK(a, 'kep-hut').length === 1 && ev.lyDo === 'tay-nang' && ev.nhip === 1 && vt(ev.o) === '2,1', J([a.tay, a.suKien]));
  const b = chay(SAN, XE, L('grab()', 'wait()', 'arm_down()', 'grab()', 'wait()'), VAT);
  kiem('kẹp hụt (kẹp đóng) rồi hạ tay + grab(): nhặt được ở nhịp sau', b.tay.cam === 1 && b.nhip === 2 && maSK(b, 'kep-hut').length === 1);
  const c = chay(SAN, XE, L('grab()', 'wait()'));
  kiem('tay nâng grab() khi ô trước KHÔNG có vật: kẹp đóng, không sự kiện gì (không có gì để báo)', c.tay.kep === true && c.tay.cam === null && c.suKien.length === 0, J(c.suKien));
  const d = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()'));
  kiem('tay hạ grab() khi ô trước không có vật: kep-hut (khong-co-vat), ô nêu là ô trước mặt (2,1)', maSK(d, 'kep-hut')[0].lyDo === 'khong-co-vat' && vt(maSK(d, 'kep-hut')[0].o) === '2,1' && d.tay.cam === null);
  const e = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()', 'grab()', 'wait()'), VAT);
  kiem('đang cầm vật mà grab() lần nữa: không đổi gì (vẫn cầm vật 1, không sự kiện thêm)', e.tay.cam === 1 && e.tay.kep === true && maSK(e, 'kep-hut').length === 0 && maTrongNhip(nhipVet(e)[1], 'nhat-vat').length === 0);
  const f = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()'), { vat: [{ x: 2, y: 0 }] });
  kiem('vật cách xe hai ô (không sát) thì không gắp được dù tay hạ: kep-hut (khong-co-vat), vật vẫn nằm', f.vat[0].trangThai === 'dat' && maSK(f, 'kep-hut')[0].lyDo === 'khong-co-vat');
  // gắp theo HƯỚNG MẶT: phải, xuống, trái
  const huongs = [[1, { x: 3, y: 2 }], [2, { x: 2, y: 3 }], [3, { x: 1, y: 2 }], [0, { x: 2, y: 1 }]];
  kiem('grab() lấy vật ở ô trước mặt theo cả bốn hướng mặt (phải, xuống, trái, lên); vật ở ba ô còn lại không bị đụng',
    huongs.every(([h, o]) => {
      const k = chay(SAN, { x: 2, y: 2, huong: h }, L('arm_down()', 'grab()', 'wait()'), { vat: [o, { x: 0, y: 0 }] });
      return k.tay.cam === 1 && k.vat[0].trangThai === 'cam' && k.vat[1].trangThai === 'dat' && maSK(k, 'kep-hut').length === 0;
    }));
  const trai = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()'), { vat: [{ x: 1, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 3 }] });
  kiem('vật ở bên trái / bên phải / sau lưng (không phải trước mặt) không gắp được', trai.tay.cam === null && maSK(trai, 'kep-hut').length === 1);
  const g = chay(['..o..', '.....', '.....', '.....', '.....'], { x: 2, y: 4, huong: 0 }, L('left_move()', 'right_move()', 'wait()', 'arm_down()', 'grab()', 'wait()'));
  kiem('vật được đọc từ ký hiệu o của sân: xe mới đi một ô, chưa sát vật nên kẹp hụt (khong-co-vat)', maSK(g, 'kep-hut').length === 1 && g.tay.cam === null && maSK(g, 'kep-hut')[0].lyDo === 'khong-co-vat', J(g.suKien));
  const T3 = L('left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()');
  const g2 = chay(['..o..', '.....', '.....', '.....', '.....'], { x: 2, y: 4, huong: 0 }, T3 + L('arm_down()', 'grab()', 'wait()'));
  kiem('đi 3 ô tới sát ô có ký hiệu o rồi hạ tay + grab(): nhặt được, vật đi theo xe (vẽ ở ô xe (2,1))', g2.tay.cam === 1 && vt(g2.vat[0]) === '2,1' && maSK(g2, 'dam-tuong').length === 0, J([g2.tay, g2.vat]));
  const T4 = T3 + L('left_move()', 'right_move()', 'wait()');
  const g3 = chay(['..o..', '.....', '.....', '.....', '.....'], { x: 2, y: 4, huong: 0 }, T4 + L('arm_down()', 'grab()', 'wait()'));
  kiem('đi thêm ô thứ 4: xe đâm vào vật (vật chiếm ô), đứng ở (2,1) rồi vẫn nhặt được', maSK(g3, 'dam-tuong').length === 1 && maSK(g3, 'dam-tuong')[0].vat === 'vat' && g3.tay.cam === 1 && vt(g3.robot) === '2,1');
  // thùng nặng ở ô trước: không gắp nổi
  const thung = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()'), { thung: [{ x: 2, y: 1 }] });
  kiem('ô trước mặt là thùng nặng: kep-hut (qua-nang), kẹp đóng, không cầm gì; ô nêu là (2,1)', maSK(thung, 'kep-hut').length === 1 && maSK(thung, 'kep-hut')[0].lyDo === 'qua-nang' && vt(maSK(thung, 'kep-hut')[0].o) === '2,1' && thung.tay.cam === null && thung.tay.kep === true);
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
  kiem('tay-vuong chặn trước đâm tường: xe ở sát tường mà tay hạ chỉ báo tay-vuong', (() => {
    const k = chay(SAN, { x: 2, y: 0, huong: 0 }, L('arm_down()', 'left_move()', 'right_move()', 'wait()'));
    return maSK(k, 'tay-vuong').length === 1 && maSK(k, 'dam-tuong').length === 0;
  })());
  kiem('tay-vuong chặn trước cả vướng vật: tay hạ mà vật ở ngay trước mặt, tiến thì chỉ báo tay-vuong', (() => {
    const k = chay(SAN, XE, L('arm_down()', 'left_move()', 'right_move()', 'wait()'), { vat: [{ x: 2, y: 1 }] });
    return maSK(k, 'tay-vuong').length === 1 && maSK(k, 'dam-tuong').length === 0;
  })());
}

console.log('\n== 7. Xe đi thì vật đang cầm đi theo ==');
{
  const VAT = { vat: [{ x: 2, y: 1 }] };
  const prog = L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'wait()', 'left_move()', 'right_move()', 'wait()');
  const a = chay(SAN, XE, prog, VAT);
  const n = nhipVet(a);
  kiem('từng nhịp: vật đang cầm luôn trùng ô xe (nhặt ở ô trước (2,1) nên vẽ ở (2,2); đi lên (2,1); quay phải; đi sang (3,1))',
    n.map((x) => vt(x.vat[0]) + (x.vat[0].trangThai === 'cam' ? 'c' : 'd')).join(' ') === '2,2c 2,1c 2,1c 3,1c' && vt(a.robot) === '3,1', n.map((x) => vt(x.vat[0])).join(' '));
  kiem('vật không cầm thì đứng yên khi xe đi: hai vật, chỉ vật 1 được nhặt', (() => {
    const k = chay(SAN, XE, prog, { vat: [{ x: 2, y: 1 }, { x: 0, y: 0 }] });
    return k.vat[1].x === 0 && k.vat[1].y === 0 && k.vat[1].trangThai === 'dat' && k.vat[0].trangThai === 'cam';
  })());
  kiem('xe đâm mép sân khi đang cầm: xe đứng yên thì vật cũng đứng yên ở ô xe', (() => {
    const k = chay(SAN, { x: 2, y: 1, huong: 0 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'), { vat: [{ x: 2, y: 0 }] });
    return maSK(k, 'dam-tuong').length === 1 && vt(k.vat[0]) === '2,0' && k.vat[0].trangThai === 'cam' && vt(k.robot) === '2,0';
  })());
}

console.log('\n== 8. release(): hạ tay thì đặt xuống ô TRƯỚC MẶT, nâng tay thì vỡ; không cầm gì thì không sao ==');
{
  const VAT = { vat: [{ x: 2, y: 1 }] };
  const nhat = L('arm_down()', 'grab()', 'wait()');
  const a = chay(SAN, XE, nhat + L('release()', 'wait()'), VAT);
  kiem('tay hạ + release: vật nằm xuống ô trước mặt (2,1), kẹp mở, tay không cầm; sự kiện dat-vat nêu ô (2,1)', a.vat[0].trangThai === 'dat' && vt(a.vat[0]) === '2,1' && J(a.tay) === J({ tuThe: 'duoi', kep: false, cam: null }) && maTrongNhip(nhipVet(a)[1], 'dat-vat').length === 1 && vt(maTrongNhip(nhipVet(a)[1], 'dat-vat')[0].o) === '2,1');
  const b = chay(SAN, XE, nhat + L('arm_up()', 'wait()', 'release()', 'wait()', 'wait()'), VAT);
  kiem('tay nâng + release: vật rơi xuống ô trước mặt và vỡ — biến mất khỏi tính toán (trangThai vo), tay không cầm; vat-vo kèm id, ô (2,1), nhịp',
    b.vat[0].trangThai === 'vo' && b.tay.cam === null && b.tay.kep === false && maSK(b, 'vat-vo')[0].id === 1 && maSK(b, 'vat-vo')[0].nhip === 3 && vt(maSK(b, 'vat-vo')[0].o) === '2,1', J(b.suKien));
  kiem('  vỡ ở mục tiêu dua-vat thì chương trình dừng ngay (dungSom), nhịp 3', b.dungSom === 'vat-vo' && b.nhip === 3);
  const k = chay(SAN, XE, nhat + L('arm_up()', 'wait()', 'release()', 'wait()', 'arm_down()', 'grab()', 'wait()'), Object.assign({ mucTieu: 'toi-co' }, VAT));
  kiem('  vật vỡ không còn là "vật nằm" ở ô đó (mục tiêu không dừng sớm): hạ tay + grab() ở ô đó là kẹp hụt (khong-co-vat), vật vẫn vo',
    k.tay.cam === null && k.vat[0].trangThai === 'vo' && maSK(k, 'kep-hut').slice(-1)[0].lyDo === 'khong-co-vat', J(k.suKien));
  kiem('  vật vỡ không chiếm ô nữa: xe đi thẳng vào ô vỡ được', (() => {
    const k2 = chay(SAN, XE, nhat + L('arm_up()', 'wait()', 'release()', 'wait()', 'left_move()', 'right_move()', 'wait()'), Object.assign({ mucTieu: 'toi-co' }, VAT));
    return vt(k2.robot) === '2,1' && maSK(k2, 'dam-tuong').length === 0;
  })());
  const c = chay(SAN, XE, L('release()', 'wait()', 'arm_down()', 'release()', 'wait()'), VAT);
  kiem('không cầm gì mà release (tay nâng hay hạ) thì không sao: không sự kiện, vật nằm yên', c.suKien.length === 0 && c.vat[0].trangThai === 'dat' && c.tay.kep === false);
  const d = chay(SAN, XE, L('grab()', 'wait()', 'release()', 'wait()'), VAT);
  kiem('kẹp hụt rồi release: kẹp mở lại, không vỡ gì', d.tay.kep === false && d.vat[0].trangThai === 'dat' && maSK(d, 'vat-vo').length === 0);
}

console.log('\n== 9. Thả bị chặn: ô trước mặt phải là sàn trống, nếu không vật VẪN Ở TAY (tha-bi-chan) ==');
{
  const prog = (them) => L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()') + (them || '');
  const a = chay(SAN, XE, prog(), { vat: [{ x: 2, y: 1 }, { x: 2, y: 0 }] });
  const tb = maSK(a, 'tha-bi-chan')[0];
  kiem('đặt vật xuống ô trước mặt đã có vật: thất bại, vật vẫn ở tay (kẹp vẫn đóng), ô kia giữ nguyên; sự kiện tha-bi-chan (vat "vat", kieu "kep")',
    maSK(a, 'tha-bi-chan').length === 1 && a.tay.cam === 1 && a.tay.kep === true && a.vat[0].trangThai === 'cam' && vt(a.vat[1]) === '2,0' && a.vat[1].trangThai === 'dat' && tb.id === 1 && vt(tb.o) === '2,0' && tb.vat === 'vat' && tb.kieu === 'kep', J([a.suKien, a.tay]));
  const b = chay(SAN, XE, prog(L('arm_up()', 'left_move()', 'wait()', 'arm_down()', 'release()', 'wait()')), { vat: [{ x: 2, y: 1 }, { x: 2, y: 0 }] });
  kiem('thất bại một lần rồi quay sang hướng có ô trống đặt xuống được (ô (3,1))', b.vat[0].trangThai === 'dat' && vt(b.vat[0]) === '3,1' && b.tay.cam === null && maSK(b, 'tha-bi-chan').length === 1, J(b.vat));
  const c = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_up()', 'release()', 'wait()'), { vat: [{ x: 2, y: 1 }, { x: 2, y: 0 }] });
  kiem('thả từ tay nâng lên ô trước mặt đã có vật: vỡ chứ không phải tha-bi-chan (kiểm vỡ trước)', maSK(c, 'vat-vo').length === 1 && maSK(c, 'tha-bi-chan').length === 0);
  kiem('hai vật khai trùng một ô (ký hiệu o + cfg.vat) chỉ tính một vật', chay(['o....'], { x: 1, y: 0, huong: 1 }, 'wait()', { vat: [{ x: 0, y: 0 }] }).vat.length === 1);
  // thả bị chặn bởi từng loại ô: tường, hàng rào, thùng nặng, bậc thang, ngoài sân, vật
  const nhat1 = L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()');
  const loai = [
    ['tường', ['..#..', '.....', '.....', '.....', '.....'], 'tuong', {}],
    ['hàng rào', ['..=..', '.....', '.....', '.....', '.....'], 'rao', {}],
    ['bậc thang', ['..S..', '.....', '.....', '.....', '.....'], 'bac-thang', {}],
    ['thùng nặng', SAN, 'thung-nang', { thung: [{ x: 2, y: 0 }] }]
  ];
  for (const [ten, rows, ma, extra] of loai) {
    const k = chay(rows, { x: 2, y: 2, huong: 0 }, nhat1.replace('arm_up()\nwait()\n', '') + L('arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()'), Object.assign({ vat: [{ x: 2, y: 1 }], hamGoc: HG }, extra));
    const t = maSK(k, 'tha-bi-chan')[0];
    kiem('ô trước mặt là ' + ten + ': không thả được (tha-bi-chan, vat "' + ma + '"), vật vẫn ở tay, kẹp đóng', !!t && t.vat === ma && k.tay.cam === 1 && k.tay.kep === true && k.vat[0].trangThai === 'cam', J([k.suKien, k.tay]));
  }
  const ng2 = chay(SAN, XE, nhat1.slice(0, nhat1.indexOf('arm_up()')) + L('arm_up()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()'), { vat: [{ x: 2, y: 1 }] });
  kiem('cầm vật đi tới mép sân rồi thả: ô trước là ngoài sân → tha-bi-chan (ngoai-san), vật vẫn ở tay', maSK(ng2, 'tha-bi-chan').length === 1 && maSK(ng2, 'tha-bi-chan')[0].vat === 'ngoai-san' && ng2.tay.cam === 1, J(ng2.suKien));
  // thả được: ô băng chuyền, ô đích, ô màu
  const ok = (rows, extra) => chay(rows, { x: 2, y: 2, huong: 0 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()'), Object.assign({ vat: [{ x: 2, y: 1 }] }, extra || {}));
  const kb = ok(['..>..', '.....', '.....', '.....', '.....']);
  kiem('ô trước là ô BĂNG CHUYỀN: thả được, vật nằm đó, băng không kéo vật nằm đất', kb.vat[0].trangThai === 'dat' && vt(kb.vat[0]) === '2,0' && kb.tay.cam === null && maSK(kb, 'tha-bi-chan').length === 0);
  const kd = ok(['..D..', '.....', '.....', '.....', '.....'], { mucTieu: 'dua-vat' });
  kiem('ô trước là ô ĐÍCH: thả được, và vì mọi vật đã trên đích nên thắng ngay', kd.thang === true && vt(kd.vat[0]) === '2,0');
  const km = ok(['..r..', '.....', '.....', '.....', '.....']);
  kiem('ô trước là ô MÀU: thả được như sàn thường', km.vat[0].trangThai === 'dat' && vt(km.vat[0]) === '2,0' && maSK(km, 'tha-bi-chan').length === 0);
  const ks = chay(['..D..', '.....', '.....', '.....', '.....'], { x: 2, y: 2, huong: 0 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()'), { vat: [{ x: 2, y: 1, mau: 'blue' }], mau: ['..r..', '.....', '.....', '.....', '.....'] });
  kiem('ô đích có màu khác màu vật: vẫn thả được nhưng báo dat-sai-mau (vật nằm đó, chưa tính)', ks.vat[0].trangThai === 'dat' && !ks.thang && maSK(ks, 'dat-sai-mau').length === 1, J(ks.suKien));
}

/* ===================================================================== 4 */
console.log('\n== 10. Mục tiêu dua-vat: thắng NGAY khi mọi vật đều nằm trên ô đích ==');
{
  const R = ['.....', '.....', '..D..', '..o..', '.....'];
  const bd = { x: 2, y: 4, huong: 0 };
  const thang = L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()');
  const a = chay(R, bd, thang + 'left_move()\nright_move()\nwait()\n');
  kiem('thắng đúng ở cuối nhịp 3 khi vật được đặt xuống ô đích (ô trước mặt); chương trình dừng ngay (lệnh sau không chạy)',
    a.thang && a.nhip === 3 && maTrongNhip(nhipVet(a)[2], 'xong-dua-vat').length === 1 && a.vet.filter((e) => e.loai === 'lenh').length === 10, J([a.thang, a.nhip, a.vet.length]));
  kiem('  vết cuối có vật nằm trên đích; kq.dich là danh sách ô đích; xe đứng sát đích ở (2,3)', a.vat[0].trangThai === 'dat' && vt(a.vat[0]) === '2,2' && J(a.dich) === J([{ x: 2, y: 2 }]) && vt(a.robot) === '2,3');
  const b = chay(R, bd, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()'));
  kiem('vật đang được cầm (xe đã sát ô đích) chưa tính là xong (phải thả xuống)', !b.thang && b.vat[0].trangThai === 'cam' && vt(b.vat[0]) === '2,3');
  const c = chay(R, bd, L('arm_down()', 'grab()', 'wait()'));
  kiem('chưa thả vật tới đích: không thắng', !c.thang);
  const D2 = ['..D..', '.....', '..D..', '.....', '..o..', '.....'];
  const dd = chay(D2, { x: 2, y: 5, huong: 0 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()'));
  kiem('một vật, hai ô đích: chỉ cần đặt lên MỘT ô đích nào đó', dd.thang && vt(dd.vat[0]) === '2,2');
  const V2 = ['#D#', '#.#', '#o#', '#.#', '#o#', '#D#'];
  const bd2 = { x: 1, y: 3, huong: 0 };
  const TIEN3 = L('left_move()', 'right_move()', 'wait()');
  const QD = L('arm_up()', 'left_move()', 'wait()', 'left_move()', 'wait()');                      // nâng tay + quay đầu (hai lần quay phải)
  const leg1 = L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()');
  const leg2 = QD + TIEN3 + TIEN3 + L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()');
  const e = chay(V2, bd2, leg1);
  kiem('hai vật, hai đích (hành lang): đặt xong MỘT vật chưa thắng, vật nằm ở đích (1,0)', !e.thang && e.vat.filter((v) => v.trangThai === 'dat' && vt(v) === '1,0').length === 1 && e.dich.length === 2 && e.nhip === 4);
  const f = chay(V2, bd2, leg1 + QD + TIEN3 + TIEN3);
  kiem('  quay đầu, đi tới sát vật kia mà chưa nhặt: vẫn chưa thắng', !f.thang && f.nhip === 8, J([f.thang, f.nhip]));
  const hai = chay(V2, bd2, leg1 + leg2 + L('wait()', 'wait()'));
  kiem('  nhặt vật thứ hai chở lên đích còn lại và thả: thắng ngay ở cuối nhịp 11 (lệnh wait() sau đó không chạy)',
    hai.thang && hai.nhip === 11 && hai.vat.every((v) => v.trangThai === 'dat') && hai.vet[hai.vet.length - 1].loai === 'nhip', J([hai.thang, hai.nhip, hai.vat]));
  const chanDuong = chay(V2, bd2, leg1 + L('arm_up()', 'left_move()', 'right_move()', 'wait()'));
  kiem('  vật thứ nhất nằm trên đích CHẶN hành lang: xe không tiến tiếp được (dam-tuong, vat "vat")', maSK(chanDuong, 'dam-tuong').length === 1 && maSK(chanDuong, 'dam-tuong')[0].vat === 'vat' && vt(chanDuong.robot) === '1,1');
  const X = ['.....', '.....', '..X..', '.....', '.....'];
  const bdX = { x: 2, y: 3, huong: 0 };
  const g = chay(X, bdX, 'wait()');
  kiem('ô X = đích đã có vật sẵn: mọi vật đã trên đích nên thắng ngay ở nhịp đầu (wait đầu tiên)', g.thang && g.nhip === 1 && g.dich.length === 1 && g.vatBanDau.length === 1, J([g.thang, g.nhip]));
  const h = chay(X, bdX, L('arm_down()', 'grab()', 'wait()'));
  kiem('nhấc vật khỏi ô X: lúc đầu thắng ngay nhịp 1 (nhặt ở nhịp 1 nhưng điều kiện đúng ở cuối nhịp 1 thì vật đã cầm) → không thắng', !h.thang && h.vat[0].trangThai === 'cam');
  const k0 = chay(['.....', '..D..', '.....', '.....', '.....'], XE, L('wait()', 'wait()'));
  kiem('không có vật nào trên sân: không bao giờ thắng (không thắng trống)', !k0.thang && k0.vat.length === 0);
  const k1 = chay(['..F..', '.....', '.....', 'o....', '.....'], { x: 2, y: 4, huong: 0 }, TIEN3 + TIEN3 + TIEN3 + TIEN3);
  kiem('mục tiêu dua-vat bỏ qua cờ F: xe tới cờ (2,0) không thắng', !k1.thang && vt(k1.robot) === '2,0', J([k1.thang, k1.nhip, vt(k1.robot)]));
  const cof = chay(['.....', '..F..', 'o....', '.....', '.....'], { x: 2, y: 4, huong: 0 }, L('left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'wait()'), { mucTieu: 'toi-co' });
  kiem('mục tiêu toi-co giữ nguyên dù xe có tay và sân có vật: chạm cờ là thắng ngay (nhịp 3)', cof.thang && cof.nhip === 3 && maSK(cof, 'tay-vuong').length === 0, J([cof.thang, cof.nhip]));
  kiem('mục tiêu lạ bị từ chối khi cấu hình sai', (() => { try { chay(SAN, XE, 'wait()', { mucTieu: 'ban-do' }); return false; } catch (err) { return true; } })());
  const hh = chay(R, bd, 'while True:\n    wait()', { nhipToiDa: 30 });
  kiem('lặp vô hạn nhịp: qua-nhieu-nhip, đúng 30 nhịp', hh.loi && hh.loi.loai === 'qua-nhieu-nhip' && hh.nhip === 30);

  // vật vỡ: dừng sớm
  const vo = chay(R, bd, thang.replace('arm_down()\nrelease()', 'release()') + L('wait()', 'wait()', 'wait()'));
  kiem('vật vỡ: không thể thắng nữa nên dừng ngay cuối nhịp vỡ (dungSom vat-vo), không chạy tiếp', !vo.thang && vo.dungSom === 'vat-vo' && vo.nhip === 3 && vo.vat[0].trangThai === 'vo', J([vo.nhip, vo.dungSom]));
  kiem('  dừng sớm vì vỡ không kèm quen-wait / lỗi chạy, và vet kết thúc ở nhịp vỡ', maSK(vo, 'quen-wait').length === 0 && vo.loi === null && nhipVet(vo).length === 3);
  const vo2 = chay(V2, bd2, leg1.replace('arm_down()\nrelease()', 'release()') + leg2);
  kiem('hai vật, vật thứ nhất vỡ: dừng ngay, không bao giờ thắng dù chương trình còn đưa vật kia lên đích', vo2.dungSom === 'vat-vo' && !vo2.thang && vo2.nhip === 4 && vo2.vat.filter((v) => v.trangThai === 'vo').length === 1 && vo2.vat.filter((v) => v.trangThai === 'dat').length === 1, J([vo2.dungSom, vo2.nhip, vo2.vat]));
}

console.log('\n== 11. Ký hiệu sân: o vật · D ô đích · X đích có vật sẵn; vật nằm đất CHIẾM Ô (xe không đi vào) ==');
{
  const s = SanHoc.docSan(['o.D', 'X..', '...']);
  kiem('docSan: vat = o và X (đọc từng hàng), dich = D và X', J(s.vat) === J([{ x: 0, y: 0 }, { x: 0, y: 1 }]) && J(s.dich) === J([{ x: 2, y: 0 }, { x: 0, y: 1 }]), J([s.vat, s.dich]));
  kiem('docSan giữ nguyên các ký tự của sân; sân cũ (chỉ . # F S băng) có vat và dich rỗng', s.o[0] === 'o.D' && SanHoc.docSan(['.#F', 'S>.']).vat.length === 0 && SanHoc.docSan(['.#F', 'S>.']).dich.length === 0);
  kiem('lyDoChan: ô o, D, X đều là sàn (vật chiếm ô được xử lý lúc chạy, không ở lyDoChan)', ['o', 'D', 'X'].every((c) => SanHoc.lyDoChan(SanHoc.docSan([c]), 'banh', 0, 0) === null));
  kiem('ký hiệu lạ vẫn bị từ chối', (() => { try { SanHoc.docSan(['.q.']); return false; } catch (err) { return /Ký hiệu lạ/.test(err.message); } })());
  const a = chay(['.o.', '...', '...'], { x: 1, y: 2, huong: 0 }, L('left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'));
  kiem('xe KHÔNG đi xuyên ô vật: nhịp 1 tiến tới (1,1), nhịp 2 vướng vật nên đứng yên (dam-tuong, vat "vat", idVat 1), vẫn mất nhịp', vt(a.robot) === '1,1' && maSK(a, 'dam-tuong').length === 1 && maSK(a, 'dam-tuong')[0].vat === 'vat' && maSK(a, 'dam-tuong')[0].idVat === 1 && a.nhip === 2 && vt(maSK(a, 'dam-tuong')[0].den) === '1,0', J(a.suKien));
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
  const VAT = { vat: [{ x: 2, y: 1 }] };
  const a = chay(SAN, XE, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()'), VAT);
  const n = nhipVet(a);
  kiem('mỗi nhịp có robot.tay { tuThe, kep, cam } (sau nhịp) và vat [{ id, x, y, trangThai }]',
    n.length === 2 && n.every((x) => x.robot.tay && x.vat && x.vat.every((v) => ['dat', 'cam', 'vo'].includes(v.trangThai))) &&
      J(n[0].robot.tay) === J({ tuThe: 'duoi', kep: true, cam: 1 }) && J(n[1].robot.tay) === J({ tuThe: 'tren', kep: true, cam: 1 }), J(n.map((x) => x.robot.tay)));
  kiem('vet.tay là BẢN CHỤP: đổi tay sau đó không làm đổi các nhịp trước', n[0].robot.tay.tuThe === 'duoi' && n[1].robot.tay.tuThe === 'tren');
  kiem('kq.vatBanDau là vật lúc xuất phát; kq.vat là trạng thái cuối', J(a.vatBanDau) === J([{ id: 1, x: 2, y: 1, trangThai: 'dat' }]) && a.vat[0].trangThai === 'cam');
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
  kiem('kep-hut: mức thong-tin (không phải lỗi), nói "kẹp vào không khí: vật nằm trước mặt xe mà tay đang nâng"', kh && kh.muc === 'thong-tin' && /kẹp vào không khí/.test(kh.loi) && /vật nằm trước mặt xe/.test(kh.loi) && /tay đang nâng/.test(kh.loi) && kh.lyDo === 'tay-nang', kh && kh.loi);
  const r2b = run(m2, ['arm_down()', 'grab()', 'wait()']);
  const kh2 = r2b.chanDoan.find((c) => c.ma === 'kep-hut');
  mac.push(r2b);
  kiem('kep-hut (khong-co-vat): nói ô không có vật để gắp', kh2 && kh2.lyDo === 'khong-co-vat' && /không có vật nào để gắp/.test(kh2.loi) && /ngay trước mặt xe/.test(kh2.loi));
  const r3 = run(m1, ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'release()', 'wait()']);
  const vv = r3.chanDoan.find((c) => c.ma === 'vat-vo');
  mac.push(r3);
  kiem('vat-vo: mức loi, nói "thả từ trên cao nên rơi xuống ô trước mặt và vỡ", nêu nhịp; dừng sớm nên KHÔNG có chua-dua-vat', vv && vv.muc === 'loi' && /từ trên cao nên rơi xuống ô trước mặt và vỡ/.test(vv.loi) && vv.nhip === 3 && !maCua(r3).includes('chua-dua-vat') && r3.sao === 0 && r3.theoSan[0].thang === false, vv && vv.loi);
  const r4 = run(m1, ['pick()', 'move()', 'move()', 'move()', 'move()', 'drop()'], [H('pick', [...T_PICK, 'arm_up()', 'wait()']), H('move', ['left_move()', 'right_move()', 'wait()']), H('drop', ['arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'])]);
  const oc = r4.chanDoan.find((c) => c.ma === 'tha-bi-chan');
  mac.push(r4);
  kiem('tha-bi-chan (tay kẹp): mức loi, nêu release(), ô trước mặt và lý do (mép sân), nói vật vẫn nằm trong kẹp; vẫn có chua-dua-vat', oc && oc.muc === 'loi' && /release\(\)/.test(oc.loi) && /ngay trước mặt xe/.test(oc.loi) && /mép sân/.test(oc.loi) && /vẫn nằm trong kẹp/.test(oc.loi) && oc.kieu === 'kep' && maCua(r4).includes('chua-dua-vat'), oc && oc.loi);
  const r4b = run(m1, ['move()', 'move()'], [H('move', ['left_move()', 'right_move()', 'wait()'])]);
  const dv = r4b.chanDoan.find((c) => c.ma === 'dam-tuong');
  mac.push(r4b);
  kiem('dam-tuong vào vật: mức loi, nói "vật nằm đất", "vật chiếm ô" và gợi ý gắp vật lên hay đi vòng', dv && dv.muc === 'loi' && /vật nằm đất/.test(dv.loi) && /chiếm ô/.test(dv.loi) && /gắp vật lên/.test(dv.loi) && !/tường/.test(dv.loi), dv && dv.loi);
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
  kiem('vật ngay trước mặt, đích ngay sau vật: 3 nhịp (nhặt, nâng+tiến, thả)', nhipDuaVatNganNhat(man(['..D..', '..o..', '.....'], { x: 2, y: 2, huong: 0 })).nhip === 3);
  kiem('vật ngay trước mặt, đích cách vật hai ô: 4 nhịp', nhipDuaVatNganNhat(man(['..D..', '.....', '..o..', '.....'], { x: 2, y: 3, huong: 0 })).nhip === 4);
  kiem('xe cách vật một ô trống, đích sau vật một ô: 4 nhịp (đi, nhặt, nâng+đi, thả)', nhipDuaVatNganNhat(man(['..D..', '..o..', '.....', '.....'], { x: 2, y: 3, huong: 0 })).nhip === 4);
  kiem('vật ngay SAU lưng xe: phải quay đầu (2 nhịp) rồi nhặt, nâng+tiến, thả — 5 nhịp', nhipDuaVatNganNhat(man(['.....', '..D..', '..o..', '.....', '.....'], { x: 2, y: 3, huong: 2 })).nhip === 5);
  kiem('ô X: mọi vật đã trên đích — 0 nhịp', nhipDuaVatNganNhat(man(['..X..'], { x: 0, y: 0, huong: 1 })).nhip === 0);
  kiem('không có vật nào: không bao giờ thắng', nhipDuaVatNganNhat(man(['..D..'], { x: 0, y: 0, huong: 1 })).nhip === null);
  kiem('đích bị tường vây kín: không tới được (null, không cắt ngang)', (() => { const k = nhipDuaVatNganNhat(man(['o.#D#', '..###'], { x: 0, y: 1, huong: 0 })); return k.nhip === null && k.catNgang === false; })());
  kiem('vật chiếm ô: vật nằm CHẶN HẾT hành lang một ô thì xe không qua được (nhưng nhặt vật lên thì qua)', (() => {
    const k = nhipDuaVatNganNhat(man(['#D#', '#.#', '#o#', '#.#'], { x: 1, y: 3, huong: 0 }));
    return k.nhip === 4 && !k.catNgang;
  })());
  const nho = nhipDuaVatNganNhat(man(['.....', '.....', '..D..', '.....', '..o..', '.....'], { x: 2, y: 5, huong: 0 }), { toiDaTrangThai: 20 });
  kiem('giới hạn trạng thái: quá giới hạn thì báo catNgang (không khẳng định gì về đường tắt)', nho.nhip === null && nho.catNgang === true);
  kiem('hai vật, hai đích: bộ dò cho đáp án tối ưu (chọn vật nào lên đích nào)', nhipDuaVatNganNhat(man(['D.D', '...', 'o.o', '...'], { x: 0, y: 3, huong: 0 })).nhip >= 7);
  // đường tắt: sân thật bỏ tường thì có đường tắt
  const m7 = ManHoc.timMa('tay-gap.7');
  const rong = Object.assign({}, m7, { san: ['..D', '...', 'o..', '...', '...'] });
  const bfs7 = nhipDuaVatNganNhat(m7).nhip;
  kiem('mở hành lang của tay-gap.7 (bỏ tường) thì có ĐƯỜNG TẮT (' + nhipDuaVatNganNhat(rong).nhip + ' < ' + bfs7 + ' của sân gốc)', nhipDuaVatNganNhat(rong).nhip < bfs7, String(nhipDuaVatNganNhat(rong).nhip));
  kiem('  tay-gap.7 chấm sao theo lời giải chuẩn (nhipTheoLoiGiai): BFS sân gốc ' + bfs7 + ' ≤ sao.nhip ' + m7.sao.nhip + ', chênh đúng 1 nhịp (một lần pick() tốn thêm nhịp nâng tay)', m7.nhipTheoLoiGiai === true && bfs7 <= m7.sao.nhip && m7.sao.nhip - bfs7 === 1, J([bfs7, m7.sao.nhip]));
  // bộ dò có tính băng chuyền (chương bang-chuyen): chuỗi BFS chạy trong SanHoc phải thắng đúng nhịp đó; kiểm sâu hơn ở kiem-bang-chuyen.mjs
  for (const [ten, san, bd] of [['băng thuận', ['.o>>>D'], { x: 0, y: 0, huong: 1 }], ['băng ngược', ['D<<<o.'], { x: 5, y: 0, huong: 3 }], ['băng rẽ góc', ['.o>v.', '###.D'], { x: 0, y: 0, huong: 1 }]]) {
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
    { san: ['.....', '.o...', '..D..', '...o.', '..D..'], bd: { x: 0, y: 0, huong: 1 } },
    { san: ['#o.D#', '..#..', 'o.D.o', '.#...', 'X....'], bd: { x: 2, y: 2, huong: 1 } },
    { san: ['..o..', '.#.#.', 'DoD..', '.....', '..o..'], bd: { x: 2, y: 3, huong: 3 } },
    { san: ['ooD..', 'o.o..', '..D..', '.....', '.....'], bd: { x: 3, y: 3, huong: 0 } },
    // có băng chuyền: xe, vật đang cầm đi theo băng; vật nằm dưới đất không bị băng đẩy
    { san: ['.o>>D', '.>v.o', 'D<<..', '.....', '..o..'], bd: { x: 0, y: 0, huong: 1 } },
    { san: ['o.v.D', '.>>v.', 'D^<<o', '.#...', '.....'], bd: { x: 2, y: 3, huong: 0 } },
    // băng chuyền đẩy xe vào ô có vật: xe đứng im như gặp tường (bang-chan, vat 'vat')
    { san: ['>o.D.', '.....', '.>o..', '.v...', '.o.D.'], bd: { x: 0, y: 0, huong: 1 } }
  ];
  let soChay = 0, soNhip = 0, lech = '';
  const dem = { nhat: 0, dat: 0, vo: 0, thaChan: 0, vuong: 0, kephut: 0, damVat: 0, banChan: 0 };
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
        for (const e of x.suKien) { if (e.ma === 'nhat-vat') dem.nhat++; else if (e.ma === 'dat-vat') dem.dat++; else if (e.ma === 'vat-vo') dem.vo++; else if (e.ma === 'tha-bi-chan') dem.thaChan++; else if (e.ma === 'tay-vuong') dem.vuong++; else if (e.ma === 'kep-hut') dem.kephut++; else if (e.ma === 'dam-tuong' && e.vat === 'vat') dem.damVat++; else if (e.ma === 'bang-chan' && e.vat === 'vat') dem.banChan++; }
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
  kiem('  phủ đủ các sự kiện: nhặt ' + dem.nhat + ', đặt ' + dem.dat + ', vỡ ' + dem.vo + ', thả-bị-chặn ' + dem.thaChan + ', tay-vướng ' + dem.vuong + ', kẹp-hụt ' + dem.kephut + ', đâm-vật ' + dem.damVat + ', băng-chặn-vật ' + dem.banChan,
    Object.values(dem).every((v) => v > 0), J(dem));
}

/* ===================================================================== 7 */
console.log('\n== 16. Chương tay-gap: dữ liệu 10 màn, bảng tóm tắt ==');
{
  const ds = ManHoc.danhSach.filter((m) => m.chuong === 'tay-gap');
  kiem('đúng 10 màn, số 1..10, id 4.1…4.10 (chương thứ 4, sau che-xe), mã tay-gap.1…', ds.length === 10 && ds.every((m, i) => m.so === i + 1 && m.id === '4.' + (i + 1) && m.ma === 'tay-gap.' + (i + 1)));
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ màn 10 có huy hiệu tay-gap',
    J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) &&
      ds.filter((m) => m.huyHieu).length === 1 && ds[9].huyHieu.ma === 'tay-gap' && ds[9].huyHieu.ten === 'Huy hiệu Tay gắp');
  kiem('màn nào cũng: mục tiêu dua-vat, chưa có for, chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, xe hai bánh', ds.every((m) => m.mucTieu === 'dua-vat' && J(m.cauTruc) === '[]' && m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong && m.loaiRobot === 'banh'));
  kiem('xe không xuất phát trên ô vật (vật chiếm ô); sân tối đa 7×7, mỗi sân có ít nhất một vật và một ô đích',
    ds.every((m) => { const sh = SanHoc.docSan(m.san); return !sh.vat.some((v) => v.x === m.batDau.x && v.y === m.batDau.y); }) && ds.every((m) => m.san.length <= 7 && m.san[0].length <= 7 && SanHoc.docSan(m.san).vat.length >= 1 && SanHoc.docSan(m.san).dich.length >= SanHoc.docSan(m.san).vat.length));
  kiem('taoHam: màn 5 pick, màn 6 drop, màn 10 carry; các màn khác không tạo hàm', J(ds.map((m) => m.taoHam)) === J([[], [], [], [], ['pick'], ['drop'], [], [], [], ['carry']]));
  const kho = KhoHam.moi();
  for (const h of MAU.filter((x) => ['move', 'turn_right', 'turn_left', 'u_turn'].includes(x.ten))) { kho.tao(h.ten, h.thamSo); kho.sua(h.ten, h.than); }
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
  kiem('lời sai của chương phủ các mã mới: kep-hut, tay-vuong, vat-vo, tha-bi-chan, tay-goi-lai, chua-dua-vat (và tran-khung, quen-wait, dam-tuong, ham-chua-co)',
    ['kep-hut', 'tay-vuong', 'vat-vo', 'tha-bi-chan', 'tay-goi-lai', 'chua-dua-vat', 'tran-khung', 'quen-wait', 'dam-tuong', 'ham-chua-co'].every((c) => maDaCo.has(c)), J([...maDaCo]));
  const wantMan = (id) => ds.find((m) => m.id === id);
  kiem('4.3 là "đố": maMau dùng arm_up() trước grab() → kẹp hụt; sửa đúng một lệnh là thắng',
    (() => { const m = wantMan('4.3'); const r = ChamHoc.cham(m, m.maMau, kho.ds()); return !r.thang && maCua(r).includes('kep-hut') && m.maMau.chinh[0] === 'arm_up()' && m.maMau.chinh[1] === 'grab()' && m.loiGiai.chinh[0] === 'arm_down()' && m.maMau.chinh.slice(1).join() === m.loiGiai.chinh.slice(1).join(); })());
  kiem('4.4 là "đố": maMau quên nâng tay sau khi nhặt → xe kẹt (tay-vuong); thêm arm_up() + wait() (cách chuẩn) là thắng, chỉ thêm arm_up() ngay trước lệnh đi (gộp nhịp) cũng thắng',
    (() => {
      const m = wantMan('4.4'); const r = ChamHoc.cham(m, m.maMau, kho.ds());
      const chuan = m.maMau.chinh.slice(); chuan.splice(3, 0, 'arm_up()', 'wait()');           // sau nhặt (3 dòng) chèn nâng tay + wait
      const gop = m.maMau.chinh.slice(); gop.splice(3, 0, 'arm_up()');                         // chỉ arm_up() ngay trước lệnh đi
      const rc = ChamHoc.cham(m, { chinh: chuan }, kho.ds()), rg = ChamHoc.cham(m, { chinh: gop }, kho.ds());
      return !r.thang && maCua(r).includes('tay-vuong') && J(chuan) === J(m.loiGiai.chinh) && m.maMau.chinh.filter((x) => x === 'arm_up()').length === 0 &&
        rc.thang && rc.sao === 3 && rg.thang && rg.sao === 3 && rg.soNhip < rc.soNhip;
    })());
  kiem('4.8 sửa hàm của màn: drop_nhanh() thiếu arm_down() → thả từ trên cao, vật vỡ; sửa thân hàm là thắng',
    (() => { const m = wantMan('4.8'); const r = ChamHoc.cham(m, m.maMau, kho.ds()); return !r.thang && maCua(r).includes('vat-vo') && m.maMau.hamCuaMan[0].ten === 'drop_nhanh' && m.loiGiai.hamCuaMan[0].than.includes('arm_down()') && !m.maMau.hamCuaMan[0].than.includes('arm_down()') && m.loiGiai.chinh.join() === m.maMau.chinh.join(); })());
  kiem('4.9: hai vật, hai đích; 4.10: ba vật, ba đích, có huy hiệu', SanHoc.docSan(wantMan('4.9').san).vat.length === 2 && SanHoc.docSan(wantMan('4.9').san).dich.length === 2 && SanHoc.docSan(wantMan('4.10').san).vat.length === 3 && SanHoc.docSan(wantMan('4.10').san).dich.length === 3);
  kiem('4.5 và 4.6, 4.10 buộc phải gói hàm: không gói thì tran-khung (lời sai tran-khung có sẵn)', ['4.5', '4.6', '4.10'].every((id) => wantMan(id).loiSai.some((l) => l.phaiCoMa.includes('tran-khung'))));
  kiem('mọi lời giải khác (loiGiaiKhac) có cấu trúc khác lời giải (khác dòng chương trình, hoặc thân hàm)', ds.every((m) => J(m.loiGiaiKhac.baiLam.chinh) !== J(m.loiGiai.chinh) || J(m.loiGiaiKhac.hamCuaEmMoi) !== J(m.loiGiai.hamCuaEmMoi) || J(m.loiGiaiKhac.baiLam.hamCuaMan) !== J(m.loiGiai.hamCuaMan)));

  /* ---- cách chấm sao theo quyết định mới: pick() / drop() chuẩn làm trọn việc, viết tự nhiên là 3 sao ---- */
  const thanMau = (ten) => MAU.find((x) => x.ten === ten).than;
  kiem('thư viện mẫu: pick() = hạ tay, kẹp, wait, nâng tay, wait; drop() = hạ tay, thả, wait, nâng tay, wait (trả tay về nâng)',
    J(thanMau('pick')) === J(['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()']) && J(thanMau('drop')) === J(['arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()']));
  kiem('pick() / drop() do lời giải 4.5 và 4.6 tạo ra khớp đúng thư viện mẫu (cách chuẩn)',
    J(wantMan('4.5').loiGiai.hamCuaEmMoi[0].than) === J(thanMau('pick')) && J(wantMan('4.6').loiGiai.hamCuaEmMoi[0].than) === J(thanMau('drop')));
  const goiPickDrop = (m) => { const t = JSON.stringify([m.loiGiai.chinh, m.loiGiai.hamCuaEmMoi, m.loiGiai.hamCuaMan]); return t.includes('"pick()"') || t.includes('"drop()"'); };
  const manPD = ds.filter((m) => goiPickDrop(m) && !m.tietKiemNhip);
  kiem('có màn dùng pick() / drop(): 4.5, 4.6, 4.7, 4.8, 4.10 (4.9 là màn tiết kiệm nhịp)', J(manPD.map((m) => m.id)) === J(['4.5', '4.6', '4.7', '4.8', '4.10']), J(manPD.map((m) => m.id)));
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
  kiem('cờ nhipTheoLoiGiai đúng chỗ: có cờ (mọi màn trừ 4.9) thì sao.nhip > BFS; 4.9 không cờ thì sao.nhip = BFS',
    ds.every((m, i) => (m.nhipTheoLoiGiai === true ? kcNhip[i] > 0 : kcNhip[i] === 0)) && J(ds.filter((m) => m.nhipTheoLoiGiai).map((m) => m.id)) === J(['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.10']), J(kcNhip));
  {
    const T_P = ['arm_down()', 'grab()', 'wait()'], T_T = ['arm_down()', 'release()', 'wait()'];
    const gop31 = ChamHoc.cham(wantMan('4.1'), { chinh: [...T_P, 'arm_up()', 'move()', ...T_T] }, khoMau);
    const gop32 = ChamHoc.cham(wantMan('4.2'), { chinh: ['move()', ...T_P, 'arm_up()', 'move()', ...T_T] }, khoMau);
    kiem('4.1 / 4.2: cách gộp arm_up() với lệnh đi (không dùng wait() riêng) vẫn 3 sao, nhanh hơn một nhịp so với sao.nhip',
      [gop31, gop32].every((r, i) => r.thang && r.sao === 3 && r.soNhip === wantMan(i ? '4.2' : '4.1').sao.nhip - 1), J([gop31.sao, gop31.soNhip, gop32.sao, gop32.soNhip]));
    kiem('4.1 / 4.2 / 4.4: lời giải chuẩn viết tự nhiên vừa khung 10 ô (9, 10, 10 dòng chương trình)',
      J(['4.1', '4.2', '4.4'].map((id) => wantMan(id).loiGiai.chinh.length)) === J([9, 10, 10]));
  }
  const tk = ds.filter((m) => m.tietKiemNhip);
  kiem('đúng MỘT màn "Tiết kiệm nhịp" (4.9): sao.nhip = BFS; đề bài nói tới số nhịp, gợi ý nhắc lệnh tay và lệnh bánh chạy chung một nhịp',
    tk.length === 1 && tk[0].id === '4.9' && tk[0].ten === 'Tiết kiệm nhịp' && tk[0].sao.nhip === nhipBfs(tk[0]) && tk[0].deBai.includes('nhịp') && tk[0].goiY[0].includes('arm_up()') && tk[0].goiY[0].includes('cùng nhịp'));
  {
    const m9 = wantMan('4.9');
    const std = ChamHoc.cham(m9, m9.loiGiaiKhac.baiLam, tron(khoMau, m9.loiGiaiKhac.hamCuaEmMoi));
    kiem('4.9: cách chuẩn (pick() / drop() đầy đủ) thắng nhưng đúng 2 sao (ô = sao.o ' + m9.sao.o + ', chậm: ' + std.soNhip + ' > ' + m9.sao.nhip + ' nhịp)',
      std.thang && std.sao === 2 && std.soO === m9.sao.o && std.soNhip > m9.sao.nhip && std.chanDoan.length === 0, J([std.sao, std.soO, std.soNhip, maCua(std)]));
    const fast = ChamHoc.cham(m9, m9.loiGiai, tron(khoMau, m9.loiGiai.hamCuaEmMoi));
    kiem('4.9: sửa pick() / drop() thành bản gộp → 3 sao, ' + fast.soNhip + ' nhịp = BFS, ít ô hơn cách chuẩn (' + fast.soO + ' < ' + m9.sao.o + ')', fast.thang && fast.sao === 3 && fast.soNhip === nhipBfs(m9) && fast.soO < m9.sao.o);
    // người chơi thật: bản sửa ở 4.9 ở lại trong kho; các màn khác vẫn 3 sao (nhanh hơn hoặc bằng, ít ô hơn)
    const khoSau = tron(khoMau, m9.loiGiai.hamCuaEmMoi);
    const tiep = manPD.map((m) => ChamHoc.cham(m, m.loiGiai, tron(khoSau, m.loiGiai.hamCuaEmMoi.filter((h) => !['pick', 'drop'].includes(h.ten)))));
    kiem('sau khi sửa pick() / drop() ở 4.9, các màn còn lại dùng chúng vẫn 3 sao (nhịp và ô không vượt sao.nhip, sao.o)',
      tiep.every((r, i) => { const m = manPD[i]; return r.thang && r.sao === 3 && r.soNhip <= m.sao.nhip && r.soO <= m.sao.o; }), J(tiep.map((r) => [r.sao, r.soNhip, r.soO])));
  }

  console.log('\n  Bảng 10 màn tay-gap (sân in lưới: o vật · D đích · # tường · xe ^ > v < theo hướng bắt đầu)');
  const mui = ['^', '>', 'v', '<'];
  for (const { m, r } of bangTom) {
    console.log('\n  ' + m.id + '  ' + m.ten + '   ô ' + m.sao.o + ' · nhịp ' + m.sao.nhip + ' · ' + (m.hamCuaEmCan.length ? 'kho: ' + m.hamCuaEmCan.join(', ') : 'kho: -') + (m.taoHam.length ? ' · tạo: ' + m.taoHam.join(', ') : ''));
    m.san.forEach((hang, y) => {
      let d = '';
      for (let x = 0; x < hang.length; x++) d += (x === m.batDau.x && y === m.batDau.y) ? mui[m.batDau.huong] : hang[x];
      console.log('      ' + d);
    });
    console.log('      chương trình: ' + m.loiGiai.chinh.join(' ; '));
    for (const h of m.loiGiai.hamCuaEmMoi) console.log('      hàm mới ' + h.ten + '(): ' + h.than.join(' ; '));
    for (const h of m.loiGiai.hamCuaMan) console.log('      hàm của màn ' + h.ten + '(): ' + h.than.join(' ; '));
  }
}

/* ===================================================================== 8 */
console.log('\n== 17. Luật vật mới (14/10): vật chiếm ô với MỌI thân; nhện có mặt cố định; color() / load() / nam châm / cảm biến theo ô trước ==');
{
  const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  const TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  const NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  const OMNI = BANH.concat(['slide_left', 'slide_right']);
  const run = (loai, hamGoc, rows, bd, code, extra) => SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: loai, hamGoc, mucTieu: 'toi-co' }, extra || {}), code);
  const damVat = (kq) => maSK(kq, 'dam-tuong').filter((e) => e.vat === 'vat');
  const doc = (kq) => kq.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
  const SV = ['...', '.o.', '...'];                                    // vật ở giữa sân 3×3
  const SV4 = ['...', '.o.', '...', '...'];                           // sân 3×4, vật ở (1,1)

  // ---- mọi thân không vào được ô có vật
  const tien = run('banh', BANH, SV4, { x: 1, y: 3, huong: 0 }, L('left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'));
  kiem('hai bánh: nhịp 1 tiến vào ô sát vật, nhịp 2 tiến vào ô vật thì đứng im (dam-tuong, vat "vat"), vẫn mất nhịp', vt(tien.robot) === '1,2' && damVat(tien).length === 1 && tien.nhip === 2, J([tien.robot, tien.suKien]));
  const lui = run('banh', BANH, SV, { x: 1, y: 2, huong: 2 }, L('left_back()', 'right_back()', 'wait()'));
  kiem('hai bánh: LÙI vào ô vật cũng đứng im', damVat(lui).length === 1 && vt(lui.robot) === '1,2', J(lui.suKien));
  const quay = run('banh', BANH, SV, { x: 1, y: 2, huong: 0 }, L('left_move()', 'wait()', 'right_move()', 'wait()'));
  kiem('hai bánh: quay tại chỗ sát vật là bình thường (không đâm gì)', damVat(quay).length === 0 && vt(quay.robot) === '1,2');
  const xich = run('xich', BANH, SV4, { x: 1, y: 3, huong: 0 }, L('left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'));
  kiem('xích: tiến vào ô vật thì đứng im (dam-tuong, vat "vat")', damVat(xich).length === 1 && vt(xich.robot) === '1,2');
  const omni = run('omni', OMNI, SV, { x: 0, y: 1, huong: 0 }, L('slide_right()', 'wait()'));
  kiem('omni: TRƯỢT vào ô vật thì đứng im (dam-tuong, vat "vat", kieu truot)', damVat(omni).length === 1 && damVat(omni)[0].kieu === 'truot' && vt(omni.robot) === '0,1', J(omni.suKien));
  const omni2 = run('omni', OMNI, SV4, { x: 1, y: 3, huong: 0 }, L('left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'));
  kiem('omni: tiến vào ô vật thì đứng im', damVat(omni2).length === 1 && vt(omni2.robot) === '1,2');
  const nhen = run('nhen', NHEN, SV4, { x: 1, y: 3, huong: 0 }, L('go_up()', 'go_up()'));
  kiem('nhện: bước thứ nhất tới ô sát vật, bước thứ hai vào ô vật thì đứng im (dam-tuong, vat "vat")', damVat(nhen).length === 1 && vt(nhen.robot) === '1,2', J([nhen.robot, nhen.suKien]));
  const nhen2 = run('nhen', NHEN, ['o..', '...', '...'], { x: 0, y: 1, huong: 0 }, L('go_up()', 'go_right()'));
  kiem('nhện: bước vào ô vật thì đứng im, bước sang ô trống thì đi bình thường', damVat(nhen2).length === 1 && vt(nhen2.robot) === '1,1');

  // ---- băng chuyền đẩy xe vào ô vật: đứng im như gặp tường
  const bangXe = run('banh', BANH, ['>o.'], { x: 0, y: 0, huong: 1 }, L('wait()', 'wait()', 'wait()'));
  const bc = maSK(bangXe, 'dam-tuong');
  kiem('băng chuyền đẩy xe vào ô vật: xe đứng im ở (0,0), sự kiện bang-chan (vat "vat") trong vết nhịp', vt(bangXe.robot) === '0,0' && bangXe.vet.filter((e) => e.loai === 'nhip').some((n) => n.suKien.some((e) => e.ma === 'bang-chan' && e.vat === 'vat')) && bc.length === 0, J(bangXe.vet.filter((e) => e.loai === 'nhip').map((n) => n.suKien.map((e) => e.ma))));
  const bangOmni = run('omni', OMNI, ['>o.'], { x: 0, y: 0, huong: 1 }, L('wait()'));
  kiem('băng chuyền đẩy omni vào ô vật: cũng đứng im', vt(bangOmni.robot) === '0,0' && bangOmni.vet.filter((e) => e.loai === 'nhip').some((n) => n.suKien.some((e) => e.ma === 'bang-chan' && e.vat === 'vat')));
  const bangThong = run('banh', BANH, ['>.o'], { x: 0, y: 0, huong: 1 }, L('wait()', 'wait()'));
  kiem('đối chứng: băng đẩy sang ô trống thì xe đi (1,0)', vt(bangThong.robot) === '1,0');

  // ---- nhện: mặt trước CỐ ĐỊNH theo hướng ban đầu
  const HNT = NHEN.concat(TAY);
  const nGap = run('nhen', HNT, ['.o.', '...', '...'], { x: 1, y: 1, huong: 0 }, L('arm_down()', 'grab()', 'wait()'));
  kiem('nhện (hướng ban đầu 0 = lên): arm_down + grab lấy vật ở ô phía trên (1,0)', nGap.tay.cam === 1 && nGap.vat[0].trangThai === 'cam' && maSK(nGap, 'kep-hut').length === 0, J([nGap.tay, nGap.suKien]));
  const nGap2 = run('nhen', HNT, ['...', '.o.', '...'], { x: 0, y: 0, huong: 1 }, L('arm_down()', 'grab()', 'wait()'));
  kiem('nhện (hướng ban đầu 1 = phải): mặt trước là bên phải, vật ở phía dưới (1,1) thì không với tới', nGap2.tay.cam === null && maSK(nGap2, 'kep-hut').length === 1, J(nGap2.suKien));
  const nGap3 = run('nhen', HNT, ['...', '.o.', '...'], { x: 0, y: 1, huong: 1 }, L('arm_down()', 'grab()', 'wait()'));
  kiem('nhện (hướng 1): vật ngay bên phải (1,1) gắp được', nGap3.tay.cam === 1 && vt(nGap3.vat[0]) === '0,1');
  const nDi = run('nhen', HNT, ['.o.', '...', '...'], { x: 1, y: 1, huong: 0 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'go_right()', 'arm_down()', 'release()', 'wait()'));
  kiem('nhện đi sang phải (go_right) KHÔNG quay: mặt vẫn hướng lên, nên thả vật xuống ô phía trên chỗ mới (2,0), không phải bên phải', nDi.thang === false && vt(nDi.vat[0]) === '2,0' && nDi.vat[0].trangThai === 'dat' && vt(nDi.robot) === '2,1', J([nDi.vat, nDi.robot, nDi.suKien]));
  kiem('  nhện giữ nguyên huong của batDau suốt cuộc chạy (không đổi hướng khi đi)', nDi.robot.huong === 0 && nDi.vet.filter((e) => e.loai === 'nhip').every((n) => n.robot.huong === 0));

  // ---- color() PHỤ THUỘC PHẦN CỨNG (14/10): cảm biến BỤNG luôn đọc sàn dưới xe, kể cả khi đang mang vật (kẹp / dính / rổ); CAMERA đọc ô trước mặt, vật mang không tính
  const HM = BANH.concat(TAY, ['color']);
  const sanM = ['.o.', '...', '...'];
  const mauSan = ['...', '.r.', '...'];                                  // sàn dưới xe (1,1) đỏ
  const c1 = run('banh', HM, sanM, { x: 1, y: 1, huong: 0 }, L('color()', 'arm_down()', 'grab()', 'wait()', 'color()', 'arm_up()', 'wait()', 'arm_down()', 'release()', 'wait()', 'color()'), { vatMau: ['.b.', '...', '...'], mau: mauSan });
  const d1 = doc(c1);
  kiem('BỤNG: color() luôn là màu SÀN dưới xe (red, nguồn san): chưa nhặt, đang cầm vật xanh (kẹp), và sau khi thả — vật đang mang không tính',
    d1.length === 3 && d1.every((x) => x.mau === 'red' && x.nguon === 'san' && x.idVat === null && x.cam === 'mau'), J(d1.map((x) => [x.mau, x.nguon, x.idVat])));
  const c2 = run('banh', HM, sanM, { x: 1, y: 1, huong: 0 }, L('arm_down()', 'grab()', 'wait()', 'color()'), { mau: mauSan });
  kiem('BỤNG, mang vật KHÔNG màu: color() vẫn là sàn dưới xe "red" (không phải "none" của vật)', doc(c2)[0].mau === 'red' && doc(c2)[0].nguon === 'san');
  const HMN = ['left_move', 'right_move', 'wait', 'magnet_n', 'magnet_off', 'color'];
  const c3 = run('banh', HMN, ['.o.', '...', '...'], { x: 1, y: 1, huong: 0 }, L('color()', 'magnet_n()', 'wait()', 'color()'), { vatMau: ['.g.', '...', '...'], vatChat: ['.s.', '...', '...'], mau: mauSan });
  kiem('BỤNG, nam châm: vật sắt xanh lá dính vào mũi xe rồi mà color() vẫn trả màu sàn "red" (trước và sau khi dính)', doc(c3)[0].mau === 'red' && doc(c3)[1].mau === 'red' && doc(c3)[1].nguon === 'san' && c3.vat[0].trangThai === 'cam', J(doc(c3).map((x) => [x.mau, x.nguon])));
  const HN = ['left_move', 'right_move', 'wait', 'aim', 'throw', 'load', 'color'];
  const c4 = run('banh', HN, ['.o.', '...', '...'], { x: 1, y: 1, huong: 0 }, L('color()', 'load()', 'wait()', 'color()'), { vatMau: ['.y.', '...', '...'], mau: mauSan });
  kiem('BỤNG, máy ném: load() nạp vật vàng vào rổ mà color() vẫn trả màu sàn "red" (trước và sau khi nạp)', doc(c4)[0].mau === 'red' && doc(c4)[1].mau === 'red' && doc(c4)[1].nguon === 'san' && c4.vat[0].trangThai === 'ro', J(doc(c4).map((x) => [x.mau, x.nguon])));
  const c5 = run('banh', HN, ['...', '...', '...'], { x: 1, y: 1, huong: 0 }, L('color()'), { roBanDau: { mau: 'blue' }, mau: mauSan });
  kiem('BỤNG, máy ném, rổ có sẵn vật xanh dương: color() trả màu sàn "red" (vật trong rổ không tính)', doc(c5)[0].mau === 'red' && doc(c5)[0].nguon === 'san');
  // CAMERA: đọc ô trước mặt; vật đang mang (kẹp, dính, rổ) không tính
  const CAMC = { camBien: [{ ma: 'camera', o: 'tren' }] };
  const cam1 = run('banh', HM, sanM, { x: 1, y: 1, huong: 0 }, L('color()', 'arm_down()', 'grab()', 'wait()', 'color()', 'arm_up()', 'wait()', 'arm_down()', 'release()', 'wait()', 'color()'), Object.assign({ vatMau: ['.b.', '...', '...'], mau: ['.y.', '.r.', '...'] }, CAMC));
  const ec1 = doc(cam1);
  kiem('CAMERA, tay kẹp: nhìn ô trước mặt — vật xanh → "blue" (nguồn vat, idVat 1); nhặt xong ô trống → màu sàn ô đó "yellow" (vật đang cầm không tính); thả xuống lại → "blue"',
    ec1.length === 3 && ec1[0].mau === 'blue' && ec1[0].nguon === 'vat' && ec1[0].idVat === 1 && ec1[1].mau === 'yellow' && ec1[1].nguon === 'san' && ec1[2].mau === 'blue' && ec1.every((x) => x.cam === 'camera'), J(ec1.map((x) => [x.mau, x.nguon, x.idVat])));
  const cam3 = run('banh', HMN, ['.o.', '...', '...'], { x: 1, y: 1, huong: 0 }, L('color()', 'magnet_n()', 'wait()', 'color()'), Object.assign({ vatMau: ['.g.', '...', '...'], vatChat: ['.s.', '...', '...'], mau: ['.y.', '.r.', '...'] }, CAMC));
  kiem('CAMERA, nam châm: trước khi hút thấy vật "green"; vật sắt dính vào mũi xe (lơ lửng, không nằm ở ô trước) thì camera thấy sàn ô trước "yellow"', doc(cam3)[0].mau === 'green' && doc(cam3)[0].nguon === 'vat' && doc(cam3)[1].mau === 'yellow' && doc(cam3)[1].nguon === 'san' && cam3.vat[0].trangThai === 'cam', J(doc(cam3).map((x) => [x.mau, x.nguon])));
  const cam4 = run('banh', HN, ['.o.', '...', '...'], { x: 1, y: 1, huong: 0 }, L('color()', 'load()', 'wait()', 'color()'), Object.assign({ vatMau: ['.y.', '...', '...'], mau: ['.b.', '.r.', '...'] }, CAMC));
  kiem('CAMERA, máy ném: trước khi nạp thấy vật "yellow"; load() vào rổ thì ô trước trống, camera thấy sàn "blue"', doc(cam4)[0].mau === 'yellow' && doc(cam4)[0].nguon === 'vat' && doc(cam4)[1].mau === 'blue' && doc(cam4)[1].nguon === 'san' && cam4.vat[0].trangThai === 'ro', J(doc(cam4).map((x) => [x.mau, x.nguon])));
  const cam5 = run('banh', HN, ['...', '...', '...'], { x: 1, y: 1, huong: 0 }, L('color()'), Object.assign({ roBanDau: { mau: 'blue' }, mau: ['.g.', '.r.', '...'] }, CAMC));
  kiem('CAMERA, máy ném, rổ có sẵn vật xanh dương: ô trước trống, camera thấy sàn "green" (vật trong rổ không tính)', doc(cam5)[0].mau === 'green' && doc(cam5)[0].nguon === 'san');

  // ---- load() ở ô TRƯỚC MẶT
  const l1 = run('banh', HN, ['.o.', '...', '...'], { x: 1, y: 1, huong: 0 }, L('load()', 'wait()', 'left_move()', 'right_move()', 'wait()'));
  kiem('load(): nạp vật ở ô trước mặt (1,0) vào rổ (nap-vat, ô (1,0)); ô đó trống ra nên xe tiến vào được (1,0); vật trong rổ đi theo xe', l1.vet.filter((e) => e.loai === 'nhip')[0].suKien.some((e) => e.ma === 'nap-vat' && vt(e.o) === '1,0') && vt(l1.robot) === '1,0' && l1.vat[0].trangThai === 'ro' && vt(l1.vat[0]) === '1,0' && l1.nem.ro === 1 && damVat(l1).length === 0, J([l1.robot, l1.vat, l1.suKien]));
  const l2 = run('banh', HN, ['...', '.o.', '...'], { x: 1, y: 1, huong: 0 }, L('load()', 'wait()'));
  kiem('load() khi vật nằm đúng ô xe đứng (dưới xe): không nạp được — nap-hut ở ô trước mặt (1,0); rổ trống', maSK(l2, 'nap-hut').length === 1 && vt(maSK(l2, 'nap-hut')[0].o) === '1,0' && l2.nem.ro === null);
  const l3 = run('banh', HN, ['...', '...', '.o.'], { x: 1, y: 1, huong: 0 }, L('load()', 'wait()'));
  kiem('load() khi vật ở sau lưng: nap-hut', maSK(l3, 'nap-hut').length === 1 && l3.nem.ro === null);
  const l4 = run('banh', HN, ['.o.', '...', '...'], { x: 1, y: 1, huong: 0 }, L('load()', 'wait()', 'aim(1)', 'throw()', 'wait()'));
  kiem('nạp xong ném tầm 1: vật rơi xuống ô cách xe 1 ô (1,0), ô vật cũ — nằm đó (nem-roi)', l4.vet.filter((e) => e.loai === 'nhip')[1].suKien.some((e) => e.ma === 'nem-roi' && vt(e.o) === '1,0') && l4.vat[0].trangThai === 'dat' && vt(l4.vat[0]) === '1,0', J(l4.suKien));
  // ---- nam châm: vật nằm đất chặn xe; thả ra ô trước mặt như cũ
  const HNC = ['left_move', 'right_move', 'wait', 'magnet_n', 'magnet_off'];
  const n1 = run('banh', HNC, ['.o.', '...', '...'], { x: 1, y: 1, huong: 0 }, L('left_move()', 'right_move()', 'wait()'));
  kiem('nam châm: vật gỗ nằm đất chặn xe (dam-tuong vat "vat")', damVat(n1).length === 1 && vt(n1.robot) === '1,1');
  const n2 = run('banh', HNC, ['.o.', '...', '...'], { x: 1, y: 2, huong: 0 }, L('magnet_n()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'magnet_off()', 'wait()'), { vatChat: ['.s.', '...', '...'] });
  kiem('nam châm: hút vật sắt từ 2 ô, tiến 1 ô, magnet_off() thả xuống ô trước mặt (1,0) như cũ', n2.vat[0].trangThai === 'dat' && vt(n2.vat[0]) === '1,0' && vt(n2.robot) === '1,1', J([n2.vat, n2.robot, n2.suKien]));
  const n3 = run('banh', HNC, ['.o.', '...', '...'], { x: 1, y: 2, huong: 0 }, L('magnet_n()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'magnet_off()', 'wait()', 'left_move()', 'right_move()', 'wait()'), { vatChat: ['.s.', '...', '...'] });
  kiem('  vật vừa thả nằm đất lại chặn xe: tiến tiếp thì dam-tuong (vat "vat")', damVat(n3).length === 1 && vt(n3.robot) === '1,1');

  // ---- cảm biến khoảng cách: ô có vật là KHÔNG trống
  const HK = BANH.concat(['front_clear', 'left_clear', 'right_clear']);
  const k1 = run('banh', HK, ['.o.', '...', '...'], { x: 1, y: 1, huong: 0 }, L('front_clear()', 'left_clear()', 'right_clear()'));
  const dk = doc(k1);
  kiem('front_clear() khi ô trước có vật: False (vat "vat"); hai bên hông trống: True', dk[0].trong === false && dk[0].vat === 'vat' && dk[1].trong === true && dk[2].trong === true, J(dk.map((x) => [x.ham, x.trong, x.vat])));
  const k2 = run('banh', HK, ['...', '...', '.o.'], { x: 1, y: 1, huong: 0 }, L('front_clear()'));
  kiem('vật ở sau lưng không ảnh hưởng front_clear()', doc(k2)[0].trong === true);

  // ---- thùng nặng không bị đẩy vào ô có vật; thùng vẫn chiếm ô
  const HP = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'shoot', 'shoot_back'];
  const t1 = run('banh', HP, ['.Ho.'], { x: 0, y: 0, huong: 1 }, L('shoot_back()', 'wait()'));
  kiem('súng hơi: cú giật vào thùng mà ô sau thùng có vật thì thung-chan (vat "vat"): xe và thùng đứng yên', maSK(t1, 'thung-chan').length === 1 && maSK(t1, 'thung-chan')[0].vat === 'vat' && vt(t1.robot) === '0,0' && vt(t1.thung[0]) === '1,0', J(t1.suKien));
  const t2 = run('banh', HP, ['.H.o'], { x: 0, y: 0, huong: 1 }, L('shoot_back()', 'wait()'));
  kiem('shoot_back(): thùng trượt tới sát vật thì dừng (ô vật chặn như tường) ở (2,0)', vt(t2.thung[0]) === '2,0', J(t2.suKien));
  // ---- tay 'tren' + release: vật vỡ ở ô trước mặt (hay ô xe nếu ô trước ngoài sân)
  const v2 = run('banh', BANH.concat(TAY), ['...', '.o.', '...'], { x: 1, y: 2, huong: 0 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'arm_up()', 'release()', 'wait()'));
  kiem('xe cầm vật tới sát mép sân rồi thả từ tay nâng: vật vỡ, ô vỡ = ô xe đứng (vì ô trước ngoài sân)', v2.vat[0].trangThai === 'vo' && maSK(v2, 'vat-vo').length === 1 && vt(maSK(v2, 'vat-vo')[0].o) === '1,0', J(v2.suKien));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

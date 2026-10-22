/* ============================================================================
   kiem-hai-robot.mjs — máy kiểm LÕI NHIỀU ROBOT của san-hoc.js (KE-HOACH-HAI-ROBOT.md).
     1. đường nhiều robot với ĐÚNG MỘT robot (cfg.doi = [{}]) cho kết quả y hệt đường cũ ở lời giải của MỌI màn một robot (từng nhịp, vật, cửa…);
     2. nhịp chung: hai robot chạy song song, mỗi robot tới một cờ thì dừng, thắng khi cả hai đã tới;
     3. va chạm công bằng: cùng nhắm một ô, đổi chỗ, bám đuôi đều bị chặn, đảo thứ tự robot vẫn ra cùng kết quả;
     4. đồng đội là vật cản: cảm biến khoảng cách, camera, thả vật, băng chuyền;
     5. phối hợp chỉ bằng cảm biến: R2 chờ tới khi trước mặt có vật rồi mới kẹp (bàn giao); hai robot cùng kẹp một vật thì không ai được;
     6. dừng: một robot lỗi thì cả trận dừng (ghi robot nào); hai robot chờ nhau mãi thì quá nhịp; cấu hình sai thì báo lỗi.
   Chạy: node hoc/kiem-hai-robot.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));
let ManHoc = null;
for (const f of fs.readdirSync(day).filter((x) => /^man-.*[.]js$/.test(x)).sort()) {
  try { ManHoc = require(path.join(day, f)); } catch (e) { /* bỏ qua */ }
}
const DD = await import('./do-duong-rap-du.mjs');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) dat++;
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const L = (...d) => d.join('\n') + '\n';
const HG = ['left_move', 'right_move', 'wait', 'front_clear', 'left_clear', 'right_clear', 'arm_down', 'arm_up', 'grab', 'release'];
const TIEN = ['left_move()', 'right_move()', 'wait()'];
const tien = (n) => L('for i in range(' + n + '):', '    left_move()', '    right_move()', '    wait()');
const maSk = (d) => d.suKien.map((s) => s.ma + (s.vat ? ':' + s.vat : '') + (s.lyDo ? ':' + s.lyDo : ''));
const nhipSk = (d) => d.vet.filter((v) => v.loai === 'nhip').map((v) => v.suKien.map((s) => s.ma + (s.vat ? ':' + s.vat : '')).join('+'));

console.log('1. một robot qua đường nhiều robot = đường cũ (lời giải mọi màn)');
let soMan = 0, soBoQua = 0;
const gon = (r) => J({ thang: r.thang, nhip: r.nhip, robot: r.robot, loi: r.loi && r.loi.loai, vat: r.vat, cua: r.cua, nut: r.nut, thung: r.thung, dungSom: r.dungSom,
  tay: r.tay, namCham: r.namCham, nem: r.nem, sung: r.sung, pin: r.pin, chan: r.chan, quayDo: r.quayDo,
  vet: r.vet.filter((v) => v.loai === 'nhip').map((v) => [v.robot, v.suKien.map((s) => s.ma)]), suKien: r.suKien.map((s) => s.ma) });
for (const m0 of ManHoc.danhSach) {
  const m = m0.lapRap ? LapRap.apDung(m0, m0.lapRap.cachLap[0]) : m0;
  if (m.mucTieu === 'bong-mo' || !m.loiGiai) { soBoQua++; continue; }
  let py;
  try { py = ChamHoc.cham(m, m.loiGiai, LapRap.khoMau(m0).concat(m.loiGiai.hamCuaEmMoi || [])).py; } catch (e) { soBoQua++; continue; }
  const soSan = Array.isArray(m.san[0]) ? m.san.length : 1;
  for (let i = 0; i < soSan; i++) {
    const cfg = DD.cauHinhSan(m, i);
    let a, b, la = null, lb = null;
    try { a = SanHoc.chay(cfg, py); } catch (e) { la = e.message; }
    try { b = SanHoc.chay(Object.assign({}, cfg, { doi: [{}] }), [py]); } catch (e) { lb = e.message; }
    soMan++;
    kiem(m.ma + ' sân ' + (i + 1) + ': một robot qua cfg.doi chạy y hệt', la === lb && (la !== null || gon(a) === gon(b)), la || lb || (gon(a).slice(0, 300) + '\n     ' + gon(b).slice(0, 300)));
  }
}
console.log('   ' + soMan + ' sân so khớp, bỏ qua ' + soBoQua + ' màn (bóng mờ / không có lời giải)');
kiem('so khớp ≥ 250 sân', soMan >= 250, soMan);

console.log('2. nhịp chung, tới cờ');
{
  const r = SanHoc.chay({ san: ['F.F', '...', '...', '...'], doi: [{ batDau: { x: 0, y: 3, huong: 0 } }, { batDau: { x: 2, y: 3, huong: 0 } }], hamGoc: HG }, [tien(3), tien(3)]);
  kiem('hai xe song song tới hai cờ trong 3 nhịp', r.thang && r.nhip === 3 && !r.loi && r.doi.every((d) => d.toiCo), J({ thang: r.thang, nhip: r.nhip, loi: r.loi }));
  kiem('kết quả có doi[2], cấp ngoài là của R1', r.doi.length === 2 && r.doi[0].ten === 'R1' && r.doi[1].ten === 'R2' && J(r.robot) === J(r.doi[0].robot));
  const r2 = SanHoc.chay({ san: ['F.F', '...', '...', '...'], doi: [{ batDau: { x: 0, y: 3, huong: 0 } }, { batDau: { x: 2, y: 3, huong: 0 } }], hamGoc: HG },
    [L('for i in range(3):', '    left_move()', '    right_move()', '    wait()', 'left_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'), tien(1) + L('wait()', 'wait()', 'wait()') + tien(2)]);
  kiem('R1 tới cờ thì dừng chương trình (không chạy tiếp các dòng sau), thắng khi R2 tới', r2.thang && J(r2.doi[0].robot) === J({ x: 0, y: 0, huong: 0 }) && r2.nhip === 6, J({ nhip: r2.nhip, r1: r2.doi[0].robot }));
  const r3 = SanHoc.chay({ san: ['F..', '...', '...'], doi: [{ batDau: { x: 0, y: 2, huong: 0 } }, { batDau: { x: 2, y: 2, huong: 0 } }], hamGoc: HG }, [tien(2), tien(2)]);
  kiem('chỉ một cờ cho hai robot: chưa thắng (mỗi robot phải tới một cờ)', !r3.thang && r3.doi[0].toiCo && !r3.doi[1].toiCo);
  const r4 = SanHoc.chay({ san: ['F.F', '...', '...', '...'], doi: [{ batDau: { x: 0, y: 3, huong: 0 } }, { batDau: { x: 2, y: 3, huong: 0 } }], hamGoc: HG }, [tien(3), L('wait()', 'wait()') + tien(3)]);
  kiem('robot chậm hơn: nhịp chung, R2 vào cờ ở nhịp 5', r4.thang && r4.nhip === 5, r4.nhip);
}

console.log('3. va chạm công bằng');
{
  const cfg = (a, b) => ({ san: ['.....', '.....', '.....'], doi: [{ batDau: a }, { batDau: b }], hamGoc: HG, mucTieu: 'dua-vat', dich: [{ x: 0, y: 0 }], vat: [{ x: 4, y: 0 }] });
  const mot = L(...TIEN);
  let r = SanHoc.chay(cfg({ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }), [mot, mot]);
  kiem('cùng nhắm một ô: cả hai đứng yên, ghi đâm đồng đội', J(r.doi.map((d) => d.robot)) === J([{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }]) && r.doi.every((d) => maSk(d).includes('dam-tuong:dong-doi')), J(r.doi.map(maSk)));
  const rDao = SanHoc.chay(cfg({ x: 3, y: 1, huong: 3 }, { x: 1, y: 1, huong: 1 }), [mot, mot]);
  kiem('đảo thứ tự robot vẫn ra cùng kết quả', J(rDao.doi.map((d) => d.robot).reverse()) === J(r.doi.map((d) => d.robot)));
  r = SanHoc.chay(cfg({ x: 1, y: 1, huong: 1 }, { x: 2, y: 1, huong: 3 }), [mot, mot]);
  kiem('đổi chỗ xuyên qua nhau: cả hai đứng yên', J(r.doi.map((d) => d.robot)) === J([{ x: 1, y: 1, huong: 1 }, { x: 2, y: 1, huong: 3 }]));
  r = SanHoc.chay(cfg({ x: 1, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }), [mot, mot]);
  kiem('bám đuôi sát (R1 vào ô R2 vừa rời): R1 đứng yên, R2 đi', J(r.doi.map((d) => d.robot)) === J([{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 1 }]));
  r = SanHoc.chay(cfg({ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 1 }), [mot, mot]);
  kiem('cách một ô thì cùng đi được', J(r.doi.map((d) => d.robot)) === J([{ x: 2, y: 1, huong: 1 }, { x: 4, y: 1, huong: 1 }]));
  const rD = SanHoc.chay({ san: ['...', '...'], doi: [{ batDau: { x: 0, y: 0, huong: 1 } }, { batDau: { x: 1, y: 0 }, loaiRobot: 'drone', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait'] }], hamGoc: HG, mucTieu: 'dua-vat', dich: [{ x: 0, y: 1 }], vat: [{ x: 2, y: 1 }] },
    [mot, L('wait()')]);
  kiem('xe dưới đất đi vào ô có drone bay phía trên được (khác độ cao)', J(rD.doi[0].robot) === J({ x: 1, y: 0, huong: 1 }), J(rD.doi[0].robot));
}

console.log('4. đồng đội là vật cản');
{
  const r = SanHoc.chay({ san: ['...', '...'], doi: [{ batDau: { x: 0, y: 0, huong: 1 } }, { batDau: { x: 1, y: 0, huong: 2 } }], hamGoc: HG, mucTieu: 'dua-vat', dich: [{ x: 0, y: 1 }], vat: [{ x: 2, y: 1 }] },
    [L('if front_clear():', '    left_move()', 'else:', '    right_move()', 'wait()'), L('wait()')]);
  kiem('front_clear() trả False khi đồng đội đứng trước (xe quay trái thay vì quay phải)', J(r.doi[0].robot) === J({ x: 0, y: 0, huong: 0 }), J(r.doi[0].robot));
  const dc = r.doi[0].vet.find((v) => v.docCamBien);
  kiem('sự kiện đọc cảm biến ghi vat: dong-doi', dc && dc.docCamBien.vat === 'dong-doi', dc && J(dc.docCamBien));
  const rc = SanHoc.chay({ san: ['.r.', '...'], doi: [{ batDau: { x: 0, y: 0, huong: 1 }, hamGoc: HG.concat(['color']), camBien: [{ ma: 'camera', o: 'tren' }] }, { batDau: { x: 1, y: 0, huong: 2 } }], hamGoc: HG, mucTieu: 'dua-vat', dich: [{ x: 0, y: 1 }], vat: [{ x: 2, y: 1 }] },
    [L('if color() == "none":', '    left_move()', 'wait()'), L('wait()')]);
  kiem('camera thấy đồng đội đứng trên ô màu: "none" (xe quay)', J(rc.doi[0].robot) === J({ x: 0, y: 0, huong: 2 }), J(rc.doi[0].robot));
  const rc2 = SanHoc.chay({ san: ['.r.', '...'], doi: [{ batDau: { x: 0, y: 0, huong: 1 }, hamGoc: HG.concat(['color']), camBien: [{ ma: 'camera', o: 'tren' }] }, { batDau: { x: 2, y: 1, huong: 2 } }], hamGoc: HG, mucTieu: 'dua-vat', dich: [{ x: 0, y: 1 }], vat: [{ x: 1, y: 1 }] },
    [L('if color() == "none":', '    left_move()', 'wait()'), L('wait()')]);
  kiem('đối chứng: không có đồng đội thì camera đọc "red" (xe không quay)', J(rc2.doi[0].robot) === J({ x: 0, y: 0, huong: 1 }), J(rc2.doi[0].robot));
  const rt = SanHoc.chay({ san: ['o..', '...'], doi: [{ batDau: { x: 0, y: 1, huong: 0 } }, { batDau: { x: 1, y: 1, huong: 2 } }], hamGoc: HG, mucTieu: 'dua-vat', dich: [{ x: 2, y: 1 }] },
    [L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'left_move()', 'wait()', 'arm_down()', 'release()', 'wait()'), L('wait()', 'wait()', 'wait()', 'wait()')]);
  kiem('thả vật vào ô đồng đội đang đứng: bị chặn, vật vẫn ở tay', rt.doi[0].suKien.some((s) => s.ma === 'tha-bi-chan' && s.vat === 'dong-doi') && rt.doi[0].tay.cam === 1, J(rt.doi[0].suKien.map((s) => s.ma + ':' + s.vat)));
  const rb = SanHoc.chay({ san: ['>..', '...'], doi: [{ batDau: { x: 0, y: 0, huong: 2 } }, { batDau: { x: 1, y: 0, huong: 2 } }], hamGoc: HG, mucTieu: 'dua-vat', dich: [{ x: 0, y: 1 }], vat: [{ x: 2, y: 1 }] },
    [L('wait()', 'wait()', 'wait()'), L('wait()', 'wait()', 'wait()')]);
  kiem('băng chuyền đẩy xe vào ô đồng đội: bị chặn', J(rb.doi[0].robot) === J({ x: 0, y: 0, huong: 2 }) && rb.doi[0].vet.some((v) => v.suKien && v.suKien.some((s) => s.ma === 'bang-chan' && s.vat === 'dong-doi')), J(nhipSk(rb.doi[0])));
}

console.log('5. phối hợp chỉ bằng cảm biến');
{
  const c1 = L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'left_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()');
  const c2 = L('while front_clear():', '    wait()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'left_move()', 'wait()', 'left_move()', 'wait()', 'arm_down()', 'release()', 'wait()');
  const cfg = { san: ['......', '......', '.o....', '......'], doi: [{ batDau: { x: 1, y: 3, huong: 0 } }, { batDau: { x: 4, y: 3, huong: 3 } }], hamGoc: HG, mucTieu: 'dua-vat', dich: [{ x: 5, y: 3 }], nhipToiDa: 40 };
  const r = SanHoc.chay(cfg, [c1, c2]);
  kiem('bàn giao: R1 đặt vật trước mặt R2, R2 chờ bằng while front_clear() rồi kẹp, mang tới đích', r.thang && r.nhip === 10 && J(r.vat) === J([{ id: 1, x: 5, y: 3, trangThai: 'dat' }]), J({ thang: r.thang, nhip: r.nhip, vat: r.vat }));
  kiem('R2 kẹp được vật ở đúng nhịp sau khi R1 đặt (nhịp 6)', nhipSk(r.doi[1])[5].includes('nhat-vat') && nhipSk(r.doi[0])[4].includes('dat-vat'), J(nhipSk(r.doi[1])));
  const kep = L('arm_down()', 'grab()', 'wait()');
  const rk = SanHoc.chay({ san: ['.o.', '...'], doi: [{ batDau: { x: 0, y: 0, huong: 1 } }, { batDau: { x: 2, y: 0, huong: 3 } }], hamGoc: HG, mucTieu: 'dua-vat', dich: [{ x: 1, y: 1 }] }, [kep, kep]);
  kiem('hai robot cùng kẹp một vật trong một nhịp: không ai được', rk.doi.every((d) => d.tay.cam === null && d.suKien.some((s) => s.ma === 'kep-hut' && s.lyDo === 'tranh-vat')), J(rk.doi.map(maSk)));
}

console.log('6. dừng và cấu hình');
{
  const r = SanHoc.chay({ san: ['F.F', '...', '...'], doi: [{ batDau: { x: 0, y: 2, huong: 0 } }, { batDau: { x: 2, y: 2, huong: 0 } }], hamGoc: HG }, [tien(2), L('left_move(', 'wait()')]);
  kiem('R2 lỗi cú pháp: cả trận dừng, lỗi ghi robot 2', !r.thang && r.loi && r.loi.robot === 1, J(r.loi));
  const cho = L('while front_clear():', '    wait()');
  const rc = SanHoc.chay({ san: ['.....', '.....'], doi: [{ batDau: { x: 0, y: 0, huong: 1 } }, { batDau: { x: 4, y: 0, huong: 3 } }], hamGoc: HG, mucTieu: 'dua-vat', dich: [{ x: 0, y: 1 }], vat: [{ x: 4, y: 1 }], nhipToiDa: 30 }, [cho, cho]);
  kiem('hai robot chờ nhau mãi: quá nhịp', rc.loi && rc.loi.loai === 'qua-nhieu-nhip' && rc.nhip === 30, J(rc.loi));
  let loiCh = null;
  try { SanHoc.chay({ san: ['...'], doi: [{ batDau: { x: 0, y: 0 } }, { batDau: { x: 0, y: 0 } }], hamGoc: HG }, ['', '']); } catch (e) { loiCh = e.message; }
  kiem('hai robot xuất phát cùng một ô: báo lỗi cấu hình', /cùng một ô/.test(loiCh || ''), loiCh);
  loiCh = null;
  try { SanHoc.chay({ san: ['...'], doi: [{ batDau: { x: 0, y: 0 } }, { batDau: { x: 2, y: 0 } }], hamGoc: HG }, ['']); } catch (e) { loiCh = e.message; }
  kiem('số chương trình khác số robot: báo lỗi', /mỗi robot một chương trình/.test(loiCh || ''), loiCh);
  const rh = SanHoc.chay({ san: ['F.F', '...', '...'], doi: [{ batDau: { x: 0, y: 2, huong: 0 } }, { batDau: { x: 2, y: 2, huong: 0 } }], hamGoc: HG }, [tien(2), L('left_move()')]);
  kiem('robot hết chương trình mà còn lệnh chưa wait(): quen-wait ghi ở robot đó', rh.doi[1].suKien.some((s) => s.ma === 'quen-wait') && !rh.doi[0].suKien.some((s) => s.ma === 'quen-wait'), J(rh.doi.map(maSk)));
}

console.log('7. máy chấm hai robot (cham.js)');
{
  const H = (ten, than, thamSo) => ({ ten, thamSo: thamSo || [], than });
  const man = { ma: 'thu-doi', ten: 'Thử hai robot', san: ['F.F', '...', '...', '...'], doi: [{ batDau: { x: 0, y: 3, huong: 0 } }, { batDau: { x: 2, y: 3, huong: 0 } }],
    hamGoc: ['left_move', 'right_move', 'wait'], mucTieu: 'toi-co', sao: { o: 7, nhip: 3 } };
  const step = H('step', ['left_move()', 'right_move()', 'wait()']);
  const bai = { doi: [{ chinh: ['step()', 'step()', 'step()'] }, { chinh: ['step()', 'step()', 'step()'] }], hamCuaMan: [] };
  let r = ChamHoc.cham(man, bai, [step]);
  kiem('hai robot dùng chung hàm của em step(): thắng, 3 nhịp', r.thang && r.soNhip === 3, J({ thang: r.thang, nhip: r.soNhip, cd: r.chanDoan.map((c) => c.loi) }));
  kiem('ô = 3 + 3 dòng chính + thân step() một lần (3) = 9', r.soO === 9 && J(r.chiTietO.chinh) === '[3,3]', J({ o: r.soO, ct: r.chiTietO }));
  kiem('sao: thắng + nhịp (ô 9 > 7) = 2', r.sao === 2, r.sao);
  kiem('kết quả có vết của từng robot', r.doi.length === 2 && r.doi.every((d) => d.vet.some((e) => e.loai === 'nhip')) && Array.isArray(r.py) && r.py.length === 2);
  const gon = { doi: [{ chinh: ['for i in range(3):', '    step()'] }, { chinh: ['for i in range(3):', '    step()'] }], hamCuaMan: [] };
  r = ChamHoc.cham(Object.assign({}, man, { cauTruc: ['for'] }), gon, [step]);
  kiem('viết gọn bằng for: 2 + 2 + 3 = 7 ô, 3 sao', r.thang && r.soO === 7 && r.sao === 3, J({ thang: r.thang, o: r.soO, sao: r.sao, cd: r.chanDoan.map((c) => c.loi) }));
  r = ChamHoc.cham(man, { doi: [{ chinh: ['step()', 'step()', 'step()'] }, { chinh: ['step()', 'step()'] }], hamCuaMan: [] }, [step]);
  kiem('R2 thiếu một bước: không thắng, chẩn đoán ghi "R2:"', !r.thang && r.chanDoan.some((c) => c.loi.startsWith('R2: ') && c.xe === 1) && !r.chanDoan.some((c) => c.loi.startsWith('R1: ')), J(r.chanDoan.map((c) => c.loi)));
  r = ChamHoc.cham(man, { doi: [{ chinh: ['step()'] }, { chinh: ['step()'] }], hamCuaMan: [] }, [step]);
  kiem('cả hai cùng thiếu: không có lời lặp lại', r.chanDoan.length === new Set(r.chanDoan.map((c) => c.loi)).size, J(r.chanDoan.map((c) => c.loi)));
  r = ChamHoc.cham(man, { doi: [{ chinh: ['step()', 'grab()'] }, { chinh: ['step()'] }], hamCuaMan: [] }, [step]);
  kiem('R1 dùng lệnh không có trên khay: lỗi ghi "R1:"', !r.thang && r.chanDoan.some((c) => c.loi.startsWith('R1: ')), J(r.chanDoan.map((c) => c.loi)));
  const man2 = Object.assign({}, man, { doi: [{ batDau: { x: 0, y: 3, huong: 0 } }, { batDau: { x: 2, y: 3, huong: 0 }, hamGoc: ['left_move', 'right_move', 'wait', 'front_clear'] }] });
  r = ChamHoc.cham(Object.assign({}, man2, { cauTruc: ['while'] }), { doi: [{ chinh: ['step()', 'step()', 'step()'] }, { chinh: ['while front_clear():', '    step()'] }], hamCuaMan: [] }, [step]);
  kiem('khay riêng từng robot (R2 có cảm biến): R2 tự dừng ở cờ', r.thang && r.soNhip === 3, J({ thang: r.thang, nhip: r.soNhip, cd: r.chanDoan.map((c) => c.loi) }));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

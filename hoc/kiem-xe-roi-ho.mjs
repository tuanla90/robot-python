/* ============================================================================
   kiem-xe-roi-ho.mjs — máy kiểm XE RƠI HỐ (P1 mùa 3, 29/10): hố 'u' không chỉ cho nhện. Xe hai bánh / xích / omni đi vào, bị băng chuyền đẩy, bị đệm từ kéo / đẩy
   vào ô hố thì RƠI (roi-ho, dungSom, không thắng); lời cham.js nói "xe rơi xuống hố ở ô (x, y)", không bảo xe nhảy; nhện giữ lời cũ; drone bay qua.
   Chạy: node hoc/kiem-xe-roi-ho.mjs            (trượt thì thoát mã 1)
         node hoc/kiem-xe-roi-ho.mjs --loi-gia  (cố ý bẻ luật: phải ĐỎ)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const ManHoc = require(path.join(day, 'man-chuoi-1.js'));

const LOI_GIA = process.argv.includes('--loi-gia');
let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const nhip = (kq) => kq.vet.filter((v) => v.loai === 'nhip');
const vt = (kq) => kq.robot.x + ',' + kq.robot.y;
const HG_XE = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'magnet_n', 'magnet_s', 'magnet_off'];
const HG_XICH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const HG_OMNI = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'slide_left', 'slide_right'];
const MV = 'left_move()\nright_move()\nwait()\n';
const chay = (loai, hg, cfg, ct) => SanHoc.chay(Object.assign({ loaiRobot: loai, hamGoc: hg, mucTieu: 'toi-co' }, cfg), ct);
const roi = (kq) => kq.dungSom === 'roi-ho' && !kq.thang && kq.suKien.some((e) => e.ma === 'roi-ho');

console.log('A. Lõi: xe rơi hố');
{
  const kB = chay('banh', HG_XE, { san: ['.u.F'], batDau: { x: 0, y: 0, huong: 1 } }, MV + MV + MV);
  kiem('xe hai bánh tiến vào ô hố (1,0): roi-ho ở nhịp 1, dungSom roi-ho, dừng (1 nhịp), không thắng, xe đứng ở ô hố', roi(kB) && vt(kB) === '1,0' && nhip(kB).length === (LOI_GIA ? 3 : 1) && kB.suKien.find((e) => e.ma === 'roi-ho').nhip === 1, J({ dungSom: kB.dungSom, vt: vt(kB), n: nhip(kB).length }));
  const kX = chay('xich', HG_XICH, { san: ['.u.F'], batDau: { x: 0, y: 0, huong: 1 } }, MV + MV);
  const kO = chay('omni', HG_OMNI, { san: ['.u.F'], batDau: { x: 0, y: 0, huong: 1 } }, MV + MV);
  kiem('xích và omni tiến vào ô hố cũng rơi', roi(kX) && vt(kX) === '1,0' && roi(kO) && vt(kO) === '1,0', J([kX.dungSom, kO.dungSom]));
  const kO2 = chay('omni', HG_OMNI, { san: ['..F', '.u.'], batDau: { x: 1, y: 0, huong: 1 } }, 'slide_right()\nwait()\n');
  kiem('omni trượt ngang vào ô hố (1,1) cũng rơi', roi(kO2) && vt(kO2) === '1,1', J({ dungSom: kO2.dungSom, vt: vt(kO2) }));
  const kL = chay('banh', HG_XE, { san: ['u.F'], batDau: { x: 1, y: 0, huong: 1 } }, 'left_back()\nright_back()\nwait()\n');
  kiem('xe lùi vào ô hố cũng rơi', roi(kL) && vt(kL) === '0,0', J({ dungSom: kL.dungSom }));
  const kD = chay('drone', ['go_up', 'go_down', 'go_left', 'go_right', 'wait'], { san: ['.u.F'], batDau: { x: 0, y: 0, huong: 1 } }, 'go_right()\ngo_right()\ngo_right()\n');
  kiem('drone bay qua hố: không rơi, tới cờ', !roi(kD) && kD.thang === true, J({ dungSom: kD.dungSom, thang: kD.thang }));
  // băng chuyền đẩy xe vào hố: xe đứng trên băng 2 nhịp liên tiếp bị đẩy 1 ô
  const kBg = chay('banh', HG_XE, { san: ['.>u.', '....'], batDau: { x: 0, y: 0, huong: 1 } }, MV + 'wait()\nwait()\nwait()\n');
  kiem('băng chuyền > đẩy xe đứng chờ trên băng (1,0) vào ô hố (2,0): bang-day rồi roi-ho cùng nhịp', roi(kBg) && vt(kBg) === '2,0' && nhip(kBg).some((n) => n.suKien.some((s) => s.ma === 'bang-day') && n.suKien.some((s) => s.ma === 'roi-ho')), J({ dungSom: kBg.dungSom, vt: vt(kBg), sk: nhip(kBg).map((n) => n.suKien.map((s) => s.ma)) }));
  // đệm từ kéo xe vào hố (luật bản thử, kiem-dem-tu.mjs ca 16 cũng có): xe (2,2), đệm S (2,0), hố (2,1)
  const kDm = chay('banh', HG_XE, { san: ['.....', '..u..', '.....'], demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 2, y: 2, huong: 1 } }, 'wait()\n');
  kiem('đệm từ S hút xe (2,2) lên ô hố (2,1): dem-hut rồi roi-ho cùng nhịp', roi(kDm) && vt(kDm) === '2,1' && nhip(kDm)[0].suKien.some((s) => s.ma === 'dem-hut'), J({ dungSom: kDm.dungSom, sk: nhip(kDm).map((n) => n.suKien.map((s) => s.ma)) }));
  const kDd = chay('banh', HG_XE, { san: ['.....', '.....', '.....', '..u..'], demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 2, y: 2, huong: 1 } }, 'magnet_s()\nwait()\n');
  kiem('đệm từ S đẩy xe bật S từ (2,2) xuống ô hố (2,3): dem-day rồi roi-ho', roi(kDd) && vt(kDd) === '2,3' && nhip(kDd)[0].suKien.some((s) => s.ma === 'dem-day'), J({ dungSom: kDd.dungSom, sk: nhip(kDd).map((n) => n.suKien.map((s) => s.ma)) }));
  // front_clear() trước hố: hố KHÔNG chắn (xe đi vào được): cảm biến coi là trống
  const kC = SanHoc.chay({ loaiRobot: 'banh', hamGoc: HG_XE.concat(['front_clear']), mucTieu: 'toi-co', san: ['.u.F'], batDau: { x: 0, y: 0, huong: 1 } }, 'if front_clear():\n    left_move()\n    right_move()\nwait()\n');
  kiem('front_clear() trước ô hố trả True (hố không chắn đường): xe đi vào và rơi (luật cũ giữ nguyên)', roi(kC) && vt(kC) === '1,0', J({ dungSom: kC.dungSom, vt: vt(kC) }));
}

console.log('B. Lời cham.js');
{
  function man(m) {
    return ManHoc.chuanHoa(Object.assign({ ma: 'thu.1', id: 'thu.1', chuong: 'thu', so: 1, ten: 'thử', hang: 'lam-quen', deBai: '', mucTieu: 'toi-co', cauTruc: [], moXuong: true, camHamCuaEm: false,
      khung: { chinh: 10, moiHam: 10 }, maMau: { chinh: [] }, hamCuaEmCan: [], taoHam: [], sao: { o: 5, nhip: 5 }, loiGiai: { chinh: ['wait()'] }, loiSai: [], goiY: [] }, m));
  }
  const mX = man({ loaiRobot: 'banh', hamGoc: HG_XE, robot: { than: 'hai-banh', tay: 'nam-cham', camBien: [] }, san: ['.u.F'], batDau: { x: 0, y: 0, huong: 1 } });
  const cX = ChamHoc.cham(mX, { chinh: ['left_move()', 'right_move()', 'wait()'] }, []);
  const rX = (cX.chanDoan || []).find((c) => c.ma === 'roi-ho');
  kiem('xe hai bánh đi vào hố: lời roi-ho "xe rơi xuống hố ở ô (1, 0)", nói xe không nhảy được / đi đường khác, KHÔNG bảo "nhện phải nhảy", không thắng', !cX.thang && !!rX && /xe rơi xuống hố ở ô \(1, 0\)/.test(rX.loi) && /không nhảy qua hố được/.test(rX.loi) && /đi đường khác/.test(rX.loi) && !/nhện phải nhảy/.test(rX.loi) && /dừng ở đó/.test(rX.loi), J((cX.chanDoan || []).map((c) => c.ma + ': ' + c.loi)));
  const mXc = man({ loaiRobot: 'xich', hamGoc: HG_XICH, robot: { than: 'xich', camBien: [] }, san: ['.u.F'], batDau: { x: 0, y: 0, huong: 1 } });
  const cXc = ChamHoc.cham(mXc, { chinh: ['left_move()', 'right_move()', 'wait()'] }, []);
  const rXc = (cXc.chanDoan || []).find((c) => c.ma === 'roi-ho');
  kiem('xích đi vào hố: cũng "xe rơi xuống hố"', !!rXc && /xe rơi xuống hố/.test(rXc.loi), J((cXc.chanDoan || []).map((c) => c.ma + ': ' + c.loi)));
  const mB = man({ loaiRobot: 'banh', hamGoc: HG_XE, robot: { than: 'hai-banh', tay: 'nam-cham', camBien: [] }, san: ['.>u.', '...F'], batDau: { x: 0, y: 0, huong: 1 } });
  const cB = ChamHoc.cham(mB, { chinh: ['left_move()', 'right_move()', 'wait()', 'wait()', 'wait()', 'wait()'] }, []);
  const rB = (cB.chanDoan || []).find((c) => c.ma === 'roi-ho');
  kiem('băng chuyền đẩy xe vào hố: lời roi-ho nói rõ "(băng chuyền đẩy xe vào ô hố)"', !!rB && /băng chuyền đẩy xe vào ô hố/.test(rB.loi), J((cB.chanDoan || []).map((c) => c.ma + ': ' + c.loi)));
  const mD = man({ loaiRobot: 'banh', hamGoc: HG_XE, robot: { than: 'hai-banh', tay: 'nam-cham', camBien: [] }, san: ['.....', '..u..', '.....'], demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 2, y: 2, huong: 1 } });
  const cD = ChamHoc.cham(mD, { chinh: ['wait()'] }, []);
  kiem('đệm kéo xe vào hố: lời dem-roi-ho (đệm từ), không có roi-ho thường', (cD.chanDoan || []).some((c) => c.ma === 'dem-roi-ho') && !(cD.chanDoan || []).some((c) => c.ma === 'roi-ho'), J((cD.chanDoan || []).map((c) => c.ma)));
  const mN = man({ loaiRobot: 'nhen', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand'], robot: { than: 'nhen', camBien: [] }, san: ['.u.F'], batDau: { x: 0, y: 0, huong: 1 } });
  const cN = ChamHoc.cham(mN, { chinh: ['go_right()'] }, []);
  const rN = (cN.chanDoan || []).find((c) => c.ma === 'roi-ho');
  kiem('nhện đi vào hố: lời cũ "nhện rơi xuống hố", "nhện phải nhảy" giữ nguyên', !!rN && /nhện rơi xuống hố/.test(rN.loi) && /nhện phải nhảy/.test(rN.loi), J((cN.chanDoan || []).map((c) => c.ma + ': ' + c.loi)));
}

console.log('\n' + (hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) : 'Đạt ' + dat + ' / ' + dat) + (LOI_GIA ? ' (--loi-gia: phải HỎNG)' : ''));
process.exit(hong ? 1 : 0);

/* ============================================================================
   kiem-lai-mua-9.mjs — máy kiểm BẢY TỔ HỢP LAI mùa 9 (L4 L5 L6 L7 L11 L12 L14) và tương tác R (rắc cát) của "Mật Lệnh Robot"
   (gói M9B1 4/11; kế hoạch hoc/KE-HOACH-MUA-9-TO-HOP.md mục 4, cột "Luật thêm"). Mỗi lai:
   a. BẢNG: ô ★ bị chặn khi màn không mở (ma 'lai-chua-co'), ghép được khi man.lapRap.moLai (hay man.moLai) có mã — BangGhep, LapRap.kiemGhep / kiemCachLap / apDung;
   b. LÕI: một sân nhỏ chứng minh HÀNH VI của cột "Luật thêm" (SanHoc.chay trên robot dựng bằng LapRap.apDung);
   c. BỘ VẼ: VeVector.kiemGhep không ném, VeVector.robot vẽ được cấu hình đó (theo ổ gắn của thân; hình riêng để gói hình sau);
   d. TỰ CHỨNG MINH: chạy đúng phép b với cấu hình thiếu part / thân khác / chương trình thiếu lệnh → phép b phải ĐỎ.
   Luật tự đặt (ghi ở chú thích lõi san-hoc.js, chờ người giao duyệt):
     L7  nhện + loa: nốt làm rung đá chuông trong tầm Manhattan |dx| + |dy| ≤ 3 quanh nhện, tường KHÔNG chặn (như tầm quanh sẵn có của xe), không có tia từ mũi.
     L11 / L12 shape(): thân không mũi (drone, nhện) chỉ nhận "up" / "right" / "down" / "left" / "here" theo bản đồ; "front" / "back" báo lỗi.
     L14 radar(): trên xuồng, ô bờ / cống đóng hiện '#' (chặn xuồng).
     R   chỉ dot() rắc cát (pen_down không), ô 'I' thành sàn thường cả lượt, sự kiện { ma: 'rac-cat', o }, kết quả / vết có racCat.
   Chạy: node hoc/kiem-lai-mua-9.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const BG = require(path.join(day, 'bang-ghep.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));
const SanHoc = require(path.join(day, 'san-hoc.js'));
const VV = LapRap.veVector();

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); } else { hong++; console.log('  ✗ HỎNG ' + ten + (chiTiet ? '\n      ' + String(chiTiet).slice(0, 1500) : '')); }
}
const J = (o) => JSON.stringify(o);

/** Dựng robot cách lắp `cach` bằng LapRap.apDung trên màn mở lai `lai`, chạy `code` trong lõi. `them`: trường cfg thêm (chuongDa, daChuong, vatDang, nhanDang…). */
function chay(lai, cach, san, batDau, code, them) {
  const m = LapRap.apDung(Object.assign({ ma: 'tam.' + lai, san, batDau, lapRap: { moLai: [lai] } }, them || {}), cach);
  return SanHoc.chay(Object.assign({ san: m.san, batDau: m.batDau, loaiRobot: m.loaiRobot, hamGoc: m.hamGoc, camBien: m.robot.camBien, pin: m.pin, phanCung: SanHoc.phanCungCua(m) }, them || {}), code);
}
/** Chạy phép b; ném hay lỗi chạy → false (để phép d dùng lại với cấu hình hỏng). */
function thu(f) { try { return f(); } catch (e) { return false; } }
const doc = (k) => k.vet.filter((v) => v.docCamBien).map((v) => v.docCamBien);
const coSk = (k, ma) => k.vet.some((v) => v.loai === 'nhip' && (v.suKien || []).some((e) => e.ma === ma)) || k.suKien.some((e) => e.ma === ma);

/* ------------------------------------------------------- a + c: bảng và bộ vẽ */
const CAU_HINH = [
  { lai: 'L4', cach: { than: 'nhen', tay: null, camBien: 'am-thanh' } },
  { lai: 'L5', cach: { than: 'xuong', tay: 'loa', camBien: null } },
  { lai: 'L5', cach: { than: 'xuong', tay: null, camBien: 'am-thanh' } },
  { lai: 'L5', cach: { than: 'xuong', tay: 'loa', camBien: 'am-thanh' } },
  { lai: 'L6', cach: { than: 'nhen', tay: 'son', camBien: null } },
  { lai: 'L7', cach: { than: 'nhen', tay: 'loa', camBien: null } },
  { lai: 'L11', cach: { than: 'drone', tay: null, camBien: 'radar' } },
  { lai: 'L12', cach: { than: 'nhen', tay: null, camBien: 'camera-4' } },
  { lai: 'L12', cach: { than: 'nhen', tay: null, camBien: 'radar' } },
  { lai: 'L14', cach: { than: 'xuong', tay: null, camBien: 'camera' } },
  { lai: 'L14', cach: { than: 'xuong', tay: null, camBien: 'radar' } }
];
const moTa = (x) => x.lai + ' ' + LapRap.moTa(x.cach);
function manLap(x, moLai) {
  return { ma: 'tam.lap', lapRap: { than: [x.cach.than], tay: x.cach.tay ? [x.cach.tay] : [], camBien: x.cach.camBien ? [x.cach.camBien] : [], nganSach: 999, moLai: moLai, cachLap: [] } };
}
console.log('a. bảng: ô ★ chặn khi màn không mở, ghép được khi màn mở (man.lapRap.moLai / man.moLai)');
for (const x of CAU_HINH) {
  const c = x.cach, bgChan = BG.kiemGhep(c.than, c.tay, c.camBien), bgMo = BG.kiemGhep(c.than, c.tay, c.camBien, { moLai: [x.lai] });
  const lrChan = LapRap.kiemGhep(c), lrMo = LapRap.kiemGhep(c, { lapRap: { moLai: [x.lai] } }), lrMoMan = LapRap.kiemGhep(c, { moLai: [x.lai] }), lrKhac = LapRap.kiemGhep(c, { lapRap: { moLai: ['L1'] } });
  const clChan = LapRap.kiemCachLap(manLap(x, []), c), clMo = LapRap.kiemCachLap(manLap(x, [x.lai]), c);
  let apChan = false; try { LapRap.apDung({ ma: 't' }, c); } catch (e) { apChan = true; }
  let apMo = false; try { apMo = !!LapRap.apDung({ ma: 't', lapRap: { moLai: [x.lai] } }, c).robot; } catch (e) { apMo = false; }
  const ok = !bgChan.ok && bgChan.ma === 'lai-chua-co' && bgChan.lai === x.lai && bgMo.ok && !lrChan.ok && lrChan.ma === 'lai-chua-co' && lrMo.ok && lrMoMan.ok && !lrKhac.ok &&
    !clChan.ok && clChan.ma === 'ghep-sai' && clMo.ok && apChan && apMo;
  kiem(moTa(x) + ': chặn khi không mở (bảng, kiemGhep, kiemCachLap, apDung), mở được khi màn khai moLai', ok, J({ bgChan, bgMo, lrChan, lrMo, lrMoMan, lrKhac, clChan, clMo, apChan, apMo }));
}
console.log('c. bộ vẽ: VeVector vẽ được mọi cấu hình lai (không cần biết màn)');
for (const x of CAU_HINH) {
  let loi = null;
  try { const cfg = LapRap.cauHinhCua(x.cach); VV.kiemGhep(cfg); VV.xoaDem(); VV.robot(cfg, {}, 0, 56); VV.robot(cfg, {}, 1, 56); } catch (e) { loi = e.message; }
  kiem(moTa(x) + ': VeVector.kiemGhep không ném, VeVector.robot vẽ được', loi === null, loi);
}

/* --------------------------------------------------------------- b + d: lõi */
console.log('b + d. lõi: hành vi đúng cột "Luật thêm", và phép b đỏ khi tắt luật');

/* L4 nhện + mic: hear() / listen() như bánh gai (mic không cần mũi) */
{
  const L4 = (cach, them) => {
    const k = chay('L4', cach, ['.....', '.....', '....F'], { x: 0, y: 0, huong: 1 }, 'a = hear()\ngo_right()\nb = hear()\nc = listen()\n', Object.assign({ chuongDa: [{ x: 3, y: 0, not: 5 }], phanAm: true }, them));
    const d = doc(k);
    return !k.loi && d.length === 3 && d[0].khoang === 3 && d[1].khoang === 2 && d[2].not === 5;
  };
  kiem('L4 b: nhện + mic nghe chuông đá: hear() = 3 rồi 2 sau một bước (Manhattan, không cần mũi), listen() = nốt 5', thu(() => L4({ than: 'nhen', camBien: 'am-thanh' })));
  kiem('L4 d: nhện KHÔNG gắn mic chạy cùng sân → phép b đỏ', !thu(() => L4({ than: 'nhen', camBien: null })));
}

/* L5 xuồng + loa (+ mic): note() / beat() như xe có bánh; đá chuông nằm ở ô nước chắn luồng, vỡ rồi là nước đi được */
{
  const DI4 = 'for i in range(4):\n    left_move()\n    right_move()\n    wait()\n';
  const L5 = (cach, code) => {
    const k = chay('L5', cach, ['~~~~Q', '~~#~~'], { x: 0, y: 0, huong: 1 }, code, { daChuong: [{ x: 2, y: 0, not: 3 }] });
    return !k.loi && k.thang && k.daChuong[0].daVo && k.robot.x === 4;
  };
  const L5chan = () => {
    const k = chay('L5', { than: 'xuong', tay: 'loa' }, ['~~~~Q', '~~#~~'], { x: 0, y: 0, huong: 1 }, DI4, { daChuong: [{ x: 2, y: 0, not: 3 }] });
    return !k.thang && k.robot.x === 1 && !k.daChuong[0].daVo && k.suKien.some((e) => e.ma === 'dam-tuong' && e.vat === 'da-chuong');
  };
  kiem('L5 b: xuồng + loa phát note(3) phá đá chuông trên ô nước chắn luồng, rồi chạy qua ô đó tới phao đích', thu(() => L5({ than: 'xuong', tay: 'loa' }, 'note(3)\nwait()\n' + DI4)));
  kiem('L5 b: không phát nốt thì đá chuông chắn xuồng như cửa đóng (đâm "da-chuong", đứng ở ô 1)', thu(L5chan));
  const L5tia = (cach) => {                                                     // đá chuông cách 4 ô thẳng mũi: ngoài tầm quanh (3) nhưng trên tia mũi xuồng → vẫn vỡ (như xe có bánh)
    const k = chay('L5', cach, ['~~~~~Q'], { x: 0, y: 0, huong: 1 }, 'note(2)\nwait()\n', { daChuong: [{ x: 4, y: 0, not: 2 }] });
    return !k.loi && k.daChuong[0].daVo;
  };
  kiem('L5 b: tia từ mũi xuồng như xe: đá chuông cách 4 ô thẳng mũi vẫn vỡ', thu(() => L5tia({ than: 'xuong', tay: 'loa' })));
  const L5mic = (cach) => {
    const k = chay('L5', cach, ['~~~~Q'], { x: 0, y: 0, huong: 1 }, 'a = hear()\nleft_move()\nright_move()\nwait()\nb = hear()\n', { chuongDa: [{ x: 3, y: 0, not: 4 }] });
    const d = doc(k); return !k.loi && d.length === 2 && d[0].khoang === 3 && d[1].khoang === 2;
  };
  kiem('L5 b: xuồng + mic: hear() = 3 rồi 2 sau một nhịp tiến', thu(() => L5mic({ than: 'xuong', camBien: 'am-thanh' })));
  kiem('L5 b: xuồng + loa + mic cùng lúc: phá đá chuông và nghe được', thu(() => L5({ than: 'xuong', tay: 'loa', camBien: 'am-thanh' }, 'a = hear()\nnote(3)\nwait()\n' + DI4)));
  kiem('L5 d: xuồng KHÔNG gắn loa chạy cùng chương trình → phép b đỏ', !thu(() => L5({ than: 'xuong', tay: null }, 'note(3)\nwait()\n' + DI4)));
  kiem('L5 d: xuồng gắn loa nhưng bỏ note(3) → phép b đỏ', !thu(() => L5({ than: 'xuong', tay: 'loa' }, 'wait()\n' + DI4)));
  kiem('L5 d: xuồng KHÔNG gắn mic → phép b (mic) đỏ', !thu(() => L5mic({ than: 'xuong', tay: 'loa' })));
  let motTay = null; try { SanHoc.chay({ san: ['~~~Q'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'xuong', hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'note', 'beat', 'cast_net', 'drop_net'] }, 'wait()\n'); } catch (e) { motTay = e.message; }
  kiem('L5: một robot một tay — loa không đi chung tay lưới của xuồng (lõi báo)', /loa không đi chung với tay lưới/.test(motTay || ''), motTay);
}

/* L6 nhện + bộ gieo hạt: dot() / ink() ở ô dưới bụng (như drone); pen_down / pen_up y vậy */
{
  const L6 = (cach) => {
    const k = chay('L6', cach, ['....', '...F'], { x: 0, y: 0 }, 'ink("red")\ndot()\ngo_right()\nink("blue")\ndot()\nwait()\ngo_right()\npen_down()\ngo_down()\npen_up()\nwait()\n');
    const s = {}; k.daSon.forEach((q) => { s[q.x + ',' + q.y] = q.mau; });
    return !k.loi && s['0,0'] === 'red' && s['1,0'] === 'blue' && s['2,0'] === 'blue' && s['2,1'] === 'blue' && Object.keys(s).length === 4 && k.robot.x === 2 && k.robot.y === 1;
  };
  kiem('L6 b: nhện chấm đỏ ô (0,0), chấm xanh ô (1,0), hạ bút kẻ (2,0) → (2,1), nhấc bút (ô dưới bụng, như drone)', thu(() => L6({ than: 'nhen', tay: 'son' })));
  kiem('L6 d: nhện KHÔNG gắn bộ gieo hạt → phép b đỏ', !thu(() => L6({ than: 'nhen', tay: null })));
}

/* L7 nhện + loa: note() vang trong tầm 3 ô quanh nhện (Manhattan, tường không chặn), không có tia từ mũi */
{
  const L7 = (cach) => {
    const k = chay('L7', cach, ['......', '#.....', '.....F'], { x: 0, y: 0, huong: 1 }, 'note(3)\nwait()\n', { daChuong: [{ x: 2, y: 0, not: 3 }, { x: 4, y: 0, not: 3 }, { x: 0, y: 2, not: 3 }, { x: 1, y: 1, not: 5 }, { x: 3, y: 0, not: 3 }] });
    const v = k.daChuong.map((d) => d.daVo);
    return !k.loi && J(v) === J([true, false, true, false, true]);
  };
  kiem('L7 b: nhện phát note(3): đá chuông cách 2 ô vỡ, cách 2 ô sau tường vỡ, cách 3 ô vỡ, cách 4 ô thẳng hàng KHÔNG vỡ (không tia mũi), nốt khác không vỡ', thu(() => L7({ than: 'nhen', tay: 'loa' })));
  const L7di = (cach) => {                                                       // note() rồi bước go_*: phát ở nhịp đầu của bước
    const k = chay('L7', cach, ['......', '.....F'], { x: 0, y: 0 }, 'note(2)\ngo_right()\n', { daChuong: [{ x: 2, y: 1, not: 2 }] });
    return !k.loi && k.daChuong[0].daVo && k.robot.x === 1;
  };
  kiem('L7 b: note() trước go_right() phát ở nhịp đầu của bước (vừa đi vừa phát)', thu(() => L7di({ than: 'nhen', tay: 'loa' })));
  const L7ngan = (cach) => {
    const k = chay('L7', cach, ['....', '...F'], { x: 0, y: 0 }, 'note(4, 3)\nwait()\n', { daChuong: [{ x: 2, y: 0, not: 4, ben: 3 }] });
    return !k.loi && k.daChuong[0].daVo && k.nhip === 3;
  };
  kiem('L7 b: note(4, 3) + wait() ngân 3 nhịp, đủ ben 3 thì đá chuông vỡ', thu(() => L7ngan({ than: 'nhen', tay: 'loa' })));
  kiem('L7 d: nhện KHÔNG gắn loa → phép b đỏ', !thu(() => L7({ than: 'nhen', tay: null })));
  kiem('L7 d: xe hai bánh + loa cùng sân (có tia mũi) → phép b đỏ (đá chuông cách 4 ô thẳng mũi vỡ)', !thu(() => L7({ than: 'hai-banh', tay: 'loa' })));
}

/* L11 drone + radar: radar() / shape() như omni nhưng không mũi; drone đang bay vẫn quét 3 × 3 quanh ô của nó */
{
  const SAN = ['.o..', '...#', '.oo.', '...F'], DANG = ['.r..', '....', '.sq.', '....'];
  const L11 = (cach, bd) => {
    const k = chay('L11', cach, SAN, bd || { x: 1, y: 1, huong: 1 }, 'r = radar()\na = shape("up")\nb = shape("left")\nc = shape("right")\ngo_right()\ns = radar()\n', { vatDang: DANG, nhanDang: true });
    const d = doc(k);
    return !k.loi && J(d[0].luoi) === J([['.', 'V', '.'], ['.', '.', '.'], ['.', 'V', 'V']]) && d[1].dang === 'round' && d[2].dang === 'none' && d[3].dang === 'none' && J(d[4].luoi) === J([['V', '.', '.'], ['.', '.', '#'], ['V', 'V', '.']]);
  };
  kiem('L11 b: drone + radar quét 3 × 3 quanh ô đang bay (cả sau khi bay), shape("up") = round theo bản đồ dù drone hướng phải', thu(() => L11({ than: 'drone', camBien: 'radar' })));
  let loiTruoc = null; try { const k = chay('L11', { than: 'drone', camBien: 'radar' }, SAN, { x: 1, y: 1 }, 'a = shape("front")\n', { vatDang: DANG, nhanDang: true }); loiTruoc = k.loi && k.loi.ma; } catch (e) { loiTruoc = 'nem'; }
  kiem('L11: shape("front") trên drone báo lỗi hướng (drone không mũi)', loiTruoc === 'huong-radar-sai', loiTruoc);
  kiem('L11 d: drone KHÔNG gắn radar → phép b đỏ', !thu(() => L11({ than: 'drone', camBien: null })));
}

/* L12 nhện + radar / camera bốn hướng: đọc bốn hướng TUYỆT ĐỐI ("up" / "right" / "down" / "left" theo bản đồ, như camera bốn hướng của drone) */
{
  const L12cam = (cach, bd) => {
    const k = chay('L12', cach, ['.r.', 'g.b', '.yF'], bd || { x: 1, y: 1, huong: 1 }, 'a = color("up")\nb = color("right")\nc = color("down")\nd = color("left")\n');
    return !k.loi && J(doc(k).map((e) => e.mau)) === J(['red', 'blue', 'yellow', 'green']);
  };
  kiem('L12 b: nhện + camera bốn hướng: up đỏ, right xanh dương, down vàng, left xanh lá (theo bản đồ, nhện xuất phát hướng phải)', thu(() => L12cam({ than: 'nhen', camBien: 'camera-4' })));
  const SAN = ['.o.', 'o.o', '.oF'], DANG = ['.r.', 's.q', '.r.'];
  const L12rad = (cach, bd) => {
    const k = chay('L12', cach, SAN, bd || { x: 1, y: 1, huong: 1 }, 'r = radar()\na = shape("up")\nb = shape("right")\nc = shape("down")\nd = shape("left")\n', { vatDang: DANG, nhanDang: true });
    const d = doc(k);
    return !k.loi && J(d[0].luoi) === J([['.', 'V', '.'], ['V', '.', 'V'], ['.', 'V', 'F']]) && J(d.slice(1).map((e) => e.dang)) === J(['round', 'ore', 'round', 'square']);
  };
  kiem('L12 b: nhện + radar: radar() 3 × 3 theo bản đồ; shape up / right / down / left = round / ore / round / square TUYỆT ĐỐI dù nhện xuất phát hướng phải', thu(() => L12rad({ than: 'nhen', camBien: 'radar' })));
  kiem('L12 d: nhện KHÔNG gắn camera → phép b (camera) đỏ', !thu(() => L12cam({ than: 'nhen', camBien: null })));
  kiem('L12 d: xe omni + radar cùng sân (có mũi: shape left / right theo mũi) → phép b (radar) đỏ', !thu(() => L12rad({ than: 'omni', camBien: 'radar' })));
}

/* L14 xuồng + camera trước / radar: color() đọc ô trước mũi xuồng; radar như xe (bờ hiện '#') */
{
  const L14cam = (cach) => {
    const k = chay('L14', cach, ['~~r', '~~Q', 'y~~'], { x: 1, y: 0, huong: 1 }, 'a = color()\nleft_move()\nwait()\nleft_move()\nwait()\nb = color()\n');
    const m = doc(k).map((e) => e.mau);
    return !k.loi && J(m) === J(['red', 'none']);
  };
  kiem('L14 b: xuồng + camera trước: color() = red (bờ đỏ trước mũi), quay đầu xong thấy nước trống = none', thu(() => L14cam({ than: 'xuong', camBien: 'camera' })));
  const L14rad = (cach) => {
    const k = chay('L14', cach, ['..~', '~~~', '~~Q'], { x: 1, y: 1, huong: 1 }, 'a = radar()\n');
    return !k.loi && J(doc(k)[0].luoi) === J([['#', '#', '.'], ['.', '.', '.'], ['.', '.', 'F']]);
  };
  kiem('L14 b: xuồng + radar: 3 × 3 quanh xuồng, hai ô bờ phía trên hiện "#" (chặn xuồng), nước là "."', thu(() => L14rad({ than: 'xuong', camBien: 'radar' })));
  kiem('L14 d: xuồng KHÔNG gắn camera → phép b (camera) đỏ', !thu(() => L14cam({ than: 'xuong', camBien: null })));
  kiem('L14 d: xuồng KHÔNG gắn radar → phép b (radar) đỏ', !thu(() => L14rad({ than: 'xuong', camBien: null })));
}

/* R rắc cát: dot() của bộ gieo hạt lên ô 'I' → sàn thường VĨNH VIỄN trong lượt; sự kiện rac-cat; racCat trong kết quả */
{
  const TOI = 'left_move()\nright_move()\nwait()\n', LUI = 'left_back()\nright_back()\nwait()\n';
  // xe hai bánh xuất phát TRÊN ô 'I' (2, 0): rắc cát, tiến ra (3, 0), lùi về (2, 0): có cát thì dừng ở (2, 0); không cát thì trượt thẳng tới (1, 0)
  const R = (cach, coDot, lai) => {
    const k = chay(lai || 'R', cach, ['..I.F', '.....'], { x: 2, y: 0, huong: 1 }, 'ink("yellow")\n' + (coDot ? 'dot()\n' : '') + 'wait()\n' + TOI + LUI);
    return { k, ok: !k.loi && k.robot.x === 2 && J(k.racCat) === J([{ x: 2, y: 0 }]) && coSk(k, 'rac-cat') && !coSk(k, 'truot-da-uot') };
  };
  kiem('R b: xe hai bánh dot() trên ô bùn trơn I rồi tiến ra, lùi về: KHÔNG trượt (dừng ở ô đã rắc), sự kiện rac-cat, racCat = [(2, 0)]', thu(() => R({ than: 'hai-banh', tay: 'son' }, true).ok), J(thu(() => R({ than: 'hai-banh', tay: 'son' }, true).k.robot)));
  const khong = thu(() => R({ than: 'hai-banh', tay: 'son' }, false).k);
  kiem('R d: cùng sân KHÔNG dot() → trượt thẳng tới (1, 0) như luật đá ướt mùa 8, không có racCat (phép b đỏ)', khong && khong.robot.x === 1 && khong.racCat.length === 0 && !R({ than: 'hai-banh', tay: 'son' }, false).ok && coSk(khong, 'truot-da-uot'), J(khong && khong.robot));
  // nhện L6: rắc cát ô dưới bụng (nhện trượt trên I như xe)
  const Rn = (cach, coDot) => {
    const k = chay('L6', cach, ['.I..', '...F'], { x: 1, y: 0 }, 'ink("yellow")\n' + (coDot ? 'dot()\n' : '') + 'go_right()\ngo_left()\n');
    return !k.loi && k.robot.x === 1 && J(k.racCat) === J([{ x: 1, y: 0 }]);
  };
  kiem('R b: nhện + bộ gieo hạt (L6) rắc cát ô dưới bụng, đi ra rồi bước về: dừng ở ô đã rắc', thu(() => Rn({ than: 'nhen', tay: 'son' }, true)));
  kiem('R d: nhện không dot() → trượt khỏi ô I (phép b đỏ)', !thu(() => Rn({ than: 'nhen', tay: 'son' }, false)));
  // drone: rắc cát khi đang bay (drone không trượt) → racCat có ô đó
  const Rd = (cach) => { const k = chay('R', cach, ['.I.', '..F'], { x: 0, y: 0 }, 'go_right()\nink("yellow")\ndot()\nwait()\n'); return !k.loi && J(k.racCat) === J([{ x: 1, y: 0 }]) && coSk(k, 'rac-cat'); };
  kiem('R b: drone + bộ gieo hạt rắc cát ô I dưới bụng (sự kiện rac-cat)', thu(() => Rd({ than: 'drone', tay: 'son' })));
  kiem('R d: drone KHÔNG gắn bộ gieo hạt → phép b đỏ', !thu(() => Rd({ than: 'drone', tay: null })));
  // pen_down không rắc cát; dot() trên sàn thường không tạo racCat
  const pen = thu(() => chay('R', { than: 'hai-banh', tay: 'son' }, ['..I.F', '.....'], { x: 2, y: 0, huong: 1 }, 'pen_down()\nwait()\n' + TOI + 'pen_up()\n' + LUI));
  kiem('R: pen_down() kẻ qua ô I KHÔNG rắc cát (xe vẫn trượt khi lùi về)', pen && pen.racCat.length === 0 && pen.robot.x === 1, J(pen && pen.robot));
  const san = thu(() => chay('R', { than: 'hai-banh', tay: 'son' }, ['.....', '....F'], { x: 1, y: 0, huong: 1 }, 'ink("red")\ndot()\nwait()\n'));
  kiem('R: dot() trên sàn thường chỉ tô màu, không có racCat / rac-cat', san && san.racCat.length === 0 && !coSk(san, 'rac-cat') && san.daSon.length === 1);
}

console.log('\nĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);

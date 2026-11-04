/* ============================================================================
   kiem-lai-mua-9.mjs — máy kiểm TỔ HỢP LAI mùa 9 (M9B1: L4 L5 L6 L7 L11 L12 L14 + R rắc cát; M9B2: L1 L2 L8 L13 + T2 container lấp hố; M9C1: L3 xe tời bờ + P người cần cứu; M9C2: L9 giỏ cứu hộ, L10 thả phao, T3 vòi phun gạt van, T4 bè sạc) của "Mật Lệnh Robot"
   (gói M9B1 / M9B2 4/11; kế hoạch hoc/KE-HOACH-MUA-9-TO-HOP.md mục 4, cột "Luật thêm"). Mỗi lai:
   a. BẢNG: ô ★ bị chặn khi màn không mở (ma 'lai-chua-co'), ghép được khi man.lapRap.moLai (hay man.moLai) có mã — BangGhep, LapRap.kiemGhep / kiemCachLap / apDung;
   b. LÕI: một sân nhỏ chứng minh HÀNH VI của cột "Luật thêm" (SanHoc.chay trên robot dựng bằng LapRap.apDung);
   c. BỘ VẼ: VeVector.kiemGhep không ném, VeVector.robot vẽ được cấu hình đó (theo ổ gắn của thân; hình riêng để gói hình sau);
   d. TỰ CHỨNG MINH: chạy đúng phép b với cấu hình thiếu part / thân khác / chương trình thiếu lệnh → phép b phải ĐỎ.
   Luật tự đặt (ghi ở chú thích lõi san-hoc.js, chờ người giao duyệt):
     L7  nhện + loa: nốt làm rung đá chuông trong tầm Manhattan |dx| + |dy| ≤ 3 quanh nhện, tường KHÔNG chặn (như tầm quanh sẵn có của xe), không có tia từ mũi.
     L11 / L12 shape(): thân không mũi (drone, nhện) chỉ nhận "up" / "right" / "down" / "left" / "here" theo bản đồ; "front" / "back" báo lỗi.
     L14 radar(): trên xuồng, ô bờ / cống đóng hiện '#' (chặn xuồng).
     R   chỉ dot() rắc cát (pen_down không), ô 'I' thành sàn thường cả lượt, sự kiện { ma: 'rac-cat', o }, kết quả / vết có racCat.
     M9B2: nam châm / gầu ngoạm trên cẩu không áp luật tải (vật không có tấn); gầu chỉ grab / release; container trôi = bè 'B' khai trong lớp contTroi;
           T2 chỉ bật khi màn khai cfg.contLapHo (màn Cảng sông cũ có ô 'u' trong tầm cần giữ luật "hố chặn hạ").
     M9C1 (luật P mục 8b + L3 mục 4): người = lớp cfg.nguoi / cfg.tramCuu / cfg.thac (không ký hiệu sân mới); người là vật noi 'nguoi'; đường về trạm CỐ ĐỊNH = BFS sân tĩnh lúc khai (hay duong khai);
           người dưới nước chỉ tự lên bờ khi VỪA ĐƯỢC LƯỚI KÉO (đang trong lưới hay vừa thả) và ô sát bờ đi được; cấm chạm = lỗi chạy 'cham-nguoi' (chương trình dừng);
           thua nhẹ 'nguoi-troi-xa' khi trôi bị chặn ở mép sân / vào cống mở / ô thac; mục tiêu 'cuu-nguoi'; mục tiêu khác + có người → chờ mọi người tới trạm; chương trình hết → nhịp rỗng cho người đi tiếp.
           L3 cast_net trên xe cạn kéo MỘT LẦN (không giữ, không dắt), vật đầu tiên trên dây; drop_net trên xe chỉ báo 'khong-keo'.
     M9C2 (mục 4 dòng L9 L10 T3 T4): cẩu / drone chỉ có cast_net() / drop_net() không đối số (không set_length);
           L9 giỏ vớt người dưới nước / vật nổi ở ô đầu cần (không người trên cạn, không vật nằm đất / thùng / container), đặt CHỈ lên ô bờ có đường về trạm; không luật tải;
           L10 drone mang MỘT phao, phao neo tại ô (không trôi, không chặn), người trôi tới ô có phao cũng bám; drop_net() thu phao (không khi người bám); thả phao không được ở bờ / cống / thác;
           T3 bóng vòi phun dừng ở van V (trước 4/11 bay qua V); T4 bè sạc = lớp cfg.beSac gắn lên bè B, drone đậu trên bè đi theo bè.
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
  { lai: 'L14', cach: { than: 'xuong', tay: null, camBien: 'radar' } },
  // M9B2 (4/11): cần cẩu lai (ô đầu cần) và xuồng + đầu đọc mã
  { lai: 'L1', cach: { than: 'cau', tay: 'nam-cham', camBien: null } },
  { lai: 'L8', cach: { than: 'cau', tay: 'kep', camBien: null } },
  { lai: 'L13', cach: { than: 'cau', tay: null, camBien: 'tu' } },
  { lai: 'L13', cach: { than: 'cau', tay: null, camBien: 'camera-bay' } },
  { lai: 'L2', cach: { than: 'xuong', tay: null, camBien: 'quet-ma' } },
  { lai: 'L2', cach: { than: 'xuong', tay: 'day-keo', camBien: 'quet-ma' } },
  // M9C1 (4/11): xe tời bờ — tay lưới trên bốn thân có bánh
  { lai: 'L3', cach: { than: 'hai-banh', tay: 'day-keo', camBien: null } },
  { lai: 'L3', cach: { than: 'xich', tay: 'day-keo', camBien: null } },
  { lai: 'L3', cach: { than: 'omni', tay: 'day-keo', camBien: null } },
  { lai: 'L3', cach: { than: 'gai', tay: 'day-keo', camBien: null } },
  // M9C2 (4/11): cần cẩu + tay lưới (giỏ cứu hộ), drone + tay lưới (thả phao)
  { lai: 'L9', cach: { than: 'cau', tay: 'day-keo', camBien: null } },
  { lai: 'L10', cach: { than: 'drone', tay: 'day-keo', camBien: null } }
];
const moTa = (x) => x.lai + ' ' + LapRap.moTa(x.cach);
function manLap(x, moLai) {
  return { ma: 'tam.lap', lapRap: { than: [x.cach.than], tay: x.cach.tay ? [x.cach.tay] : [], camBien: x.cach.camBien ? [x.cach.camBien] : [], nganSach: 999, moLai: moLai, cachLap: [] } };
}
console.log('a. bảng: ô ★ chặn khi màn không mở, ghép được khi màn mở (man.lapRap.moLai / man.moLai)');
for (const x of CAU_HINH) {
  const c = x.cach, bgChan = BG.kiemGhep(c.than, c.tay, c.camBien), bgMo = BG.kiemGhep(c.than, c.tay, c.camBien, { moLai: [x.lai] });
  const lrChan = LapRap.kiemGhep(c), lrMo = LapRap.kiemGhep(c, { lapRap: { moLai: [x.lai] } }), lrMoMan = LapRap.kiemGhep(c, { moLai: [x.lai] }), lrKhac = LapRap.kiemGhep(c, { lapRap: { moLai: [x.lai === 'L1' ? 'L2' : 'L1'] } });
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

/* ============================================================ M9B2 (4/11): cần cẩu lai ở Ô ĐẦU CẦN, xuồng + đầu đọc mã, T2 */
const sk1 = (k, ma) => { for (const v of k.vet) if (v.loai === 'nhip') for (const e of (v.suKien || [])) if (e.ma === ma) return e; return null; };

/* L1 cần cẩu + nam châm: magnet_* hút / thả vật sắt ở ô đầu cần (thay chỗ móc), qua tường */
{
  // bệ (0, 2), nấc 2 (phải) tầm 1: đầu cần trên tường (1, 2); extend → (2, 2) sau tường; magnet_n hút; quay lên-phải → (2, 0); magnet_off thả
  const SAN = ['.....', '.....', '.#o..', '....F'];
  const L1 = (cach, chat) => {
    const k = chay('L1', cach, SAN, { x: 0, y: 2, nac: 2, tam: 1 }, 'extend()\nmagnet_n()\nswing_left()\nmagnet_off()\n', { vatChat: ['.....', '.....', '..' + chat + '..', '.....'] });
    return { k, v: k.vat[0], hut: sk1(k, 'cau-hut'), tha: sk1(k, 'cau-tha') };
  };
  const ok1 = (cach) => { const r = L1(cach, 's'); return !r.k.loi && r.hut && J(r.hut.o) === J({ x: 2, y: 2 }) && r.tha && r.v.x === 2 && r.v.y === 0 && r.v.trangThai === 'dat' && r.k.vet.filter((v) => v.loai === 'nhip')[2].robot.dangMang === 1; };
  kiem('L1 b: cẩu + nam châm hút thanh sắt sau tường ở ô đầu cần ("cau-hut"), quay cần mang theo, magnet_off thả ở ô đầu cần mới (2, 0) ("cau-tha")', thu(() => ok1({ than: 'cau', tay: 'nam-cham' })));
  const go = thu(() => L1({ than: 'cau', tay: 'nam-cham' }, 'g'));
  kiem('L1 b: thùng gỗ ở ô đầu cần KHÔNG bị hút ("hut-go"), vẫn nằm ở (2, 2)', go && !go.hut && go.v.x === 2 && go.v.y === 2 && go.k.suKien.some((e) => e.ma === 'hut-go'));
  const tuong = thu(() => chay('L1', { than: 'cau', tay: 'nam-cham' }, SAN, { x: 0, y: 2, nac: 2, tam: 1 }, 'extend()\nmagnet_n()\nretract()\nmagnet_off()\n', { vatChat: ['.....', '.....', '..s..', '.....'] }));
  kiem('L1 b: thả lên ô tường → "tha-bi-chan" (vật vẫn dính ở đầu cần)', tuong && tuong.suKien.some((e) => e.ma === 'tha-bi-chan' && e.vat === 'tuong' && e.kieu === 'nam-cham') && tuong.vat[0].trangThai === 'cam');
  kiem('L1 d: cẩu KHÔNG gắn nam châm → phép b đỏ', !thu(() => ok1({ than: 'cau', tay: null })));
  kiem('L1 d: drone + nam châm cùng sân (nam châm dưới bụng, không ở đầu cần) → phép b đỏ', !thu(() => ok1({ than: 'drone', tay: 'nam-cham' })));
  let motTay = null; try { SanHoc.chay({ san: ['....'], batDau: { x: 0, y: 0, nac: 2, tam: 1 }, loaiRobot: 'cau', hamGoc: ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'pick_up', 'set_down', 'magnet_n', 'magnet_s', 'magnet_off'] }, 'wait()\n'); } catch (e) { motTay = e.message; }
  kiem('L1: một tay — móc cẩu không đi chung nam châm trên đầu cần (lõi báo)', /móc cẩu không đi chung/.test(motTay || ''), motTay);
}

/* L8 cần cẩu + kẹp (gầu ngoạm): grab() / release() vật thường ở ô đầu cần, qua tường */
{
  const SAN = ['.....', '.....', '.#o..', '....F'];
  const L8 = (cach) => {
    const k = chay('L8', cach, SAN, { x: 0, y: 2, nac: 2, tam: 1 }, 'extend()\ngrab()\nswing_left()\nrelease()\n');
    const v = k.vat[0], ng = sk1(k, 'gau-ngoam'), th = sk1(k, 'gau-tha');
    return !k.loi && ng && J(ng.o) === J({ x: 2, y: 2 }) && th && J(th.o) === J({ x: 2, y: 0 }) && v.x === 2 && v.y === 0 && v.trangThai === 'dat';
  };
  kiem('L8 b: cẩu + gầu ngoạm ngoạm thùng gỗ sau tường ở ô đầu cần ("gau-ngoam"), quay cần, thả ở (2, 0) ("gau-tha")', thu(() => L8({ than: 'cau', tay: 'kep' })));
  const nang = thu(() => chay('L8', { than: 'cau', tay: 'kep' }, ['.....', '.....', '.#H..', '....F'], { x: 0, y: 2, nac: 2, tam: 1 }, 'extend()\ngrab()\n'));
  kiem('L8 b: thùng nặng ở ô đầu cần: gầu không nhấc nổi ("gau-hut" lyDo qua-nang)', nang && nang.suKien.some((e) => e.ma === 'gau-hut' && e.lyDo === 'qua-nang'));
  const cont = thu(() => chay('L8', { than: 'cau', tay: 'kep' }, ['.....', '.....', '.#...', '....F'], { x: 0, y: 2, nac: 2, tam: 1 }, 'extend()\ngrab()\n', { chong: [{ x: 2, y: 2, cont: [{ so: 3 }] }] }));
  kiem('L8 b: container ở ô đầu cần: gầu không ngoạm, phải dùng móc ("gau-hut" lyDo container)', cont && cont.suKien.some((e) => e.ma === 'gau-hut' && e.lyDo === 'container'));
  const khay = LapRap.apDung({ ma: 't', san: SAN, batDau: { x: 0, y: 2 }, lapRap: { moLai: ['L8'] } }, { than: 'cau', tay: 'kep' }).hamGoc;
  let arm = null; try { SanHoc.chay({ san: ['....'], batDau: { x: 0, y: 0, nac: 2, tam: 1 }, loaiRobot: 'cau', hamGoc: ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'grab', 'release', 'arm_down'] }, 'wait()\n'); } catch (e) { arm = e.message; }
  kiem('L8: khay cẩu + gầu chỉ có grab / release (không arm_down / arm_up); lõi báo lỗi nếu khay có arm_down', khay.includes('grab') && khay.includes('release') && !khay.includes('arm_down') && !khay.includes('arm_up') && /Gầu ngoạm của cần cẩu chỉ có grab/.test(arm || ''), J({ khay, arm }));
  kiem('L8 d: cẩu KHÔNG gắn gầu → phép b đỏ', !thu(() => L8({ than: 'cau', tay: null })));
  kiem('L8 d: cẩu gắn nam châm thay gầu (gọi grab) → phép b đỏ', !thu(() => L8({ than: 'cau', tay: 'nam-cham' })));
}

/* L13 cần cẩu + cảm biến từ / camera bụng: đọc Ô ĐẦU CẦN (từ: front_metal / front_pole; camera bụng: look() như drone đọc ô dưới bụng) */
{
  // bệ (0, 2) nấc 1 (lên-phải) tầm 2 → (2, 0) vật nam châm N; swing_right → nấc 2 → (2, 2) sắt sau tường (1, 2); retract → (1, 2) tường
  const SAN = ['..o..', '.....', '.#o..', '....F'], CHAT = ['..N..', '.....', '..s..', '.....'];
  const L13tu = (cach) => {
    const k = chay('L13', cach, SAN, { x: 0, y: 2, nac: 1, tam: 2 }, 'a = front_metal()\nb = front_pole()\nswing_right()\nc = front_metal()\nd = front_pole()\nretract()\ne = front_metal()\n', { vatChat: CHAT });
    const d = doc(k);
    return !k.loi && J(d.map((e) => e.trong)) === J([false, true, true, false, false]) && d[1].cuc === 'N' && J(d[2].o) === J({ x: 2, y: 2 });
  };
  kiem('L13 b: cẩu + cảm biến từ: ô đầu cần có vật nam châm → front_pole "N", front_metal False; quay sang sắt sau tường → True; đầu cần trên tường → False', thu(() => L13tu({ than: 'cau', camBien: 'tu' })));
  const L13cam = (cach) => {
    const k = chay('L13', cach, ['..r..', '.....', '.#o..', '....F'], { x: 0, y: 2, nac: 1, tam: 2 }, 'a = look()\nswing_right()\nb = look()\nretract()\nc = look()\n', { vatMau: ['.....', '.....', '..y..', '.....'] });
    const d = doc(k);
    return !k.loi && J(d.map((e) => e.mau)) === J(['red', 'yellow', 'none']) && J(d.map((e) => e.nguon)) === J(['san', 'vat', 'chan']) && d[1].cam === 'camera-bay';
  };
  kiem('L13 b: cẩu + camera bụng: look() đọc ô đầu cần — sàn đỏ "red", vật vàng sau tường "yellow", đầu cần trên tường "none"', thu(() => L13cam({ than: 'cau', camBien: 'camera-bay' })));
  kiem('L13 d: cẩu KHÔNG gắn cảm biến từ → phép b (từ) đỏ', !thu(() => L13tu({ than: 'cau', camBien: null })));
  kiem('L13 d: cẩu KHÔNG gắn camera bụng → phép b (camera) đỏ', !thu(() => L13cam({ than: 'cau', camBien: null })));
  kiem('L13 d: drone + camera bụng cùng sân (đọc ô dưới drone, không phải ô đầu cần) → phép b (camera) đỏ', !thu(() => L13cam({ than: 'drone', camBien: 'camera-bay' })));
}

/* L2 xuồng + đầu đọc mã (+ tay lưới): read_code() đọc số vật nổi ở ô trước mũi; container trôi = vật nổi 'B' khai trong lớp contTroi { x, y, so, tan } */
{
  // xuồng (1, 1) hướng phải: (2, 1) container trôi số 7 nặng 3; quay phải (left_move + wait) → mũi xuống (1, 2) là bè thường
  const SAN = ['~~~~~', '~~B~~', '~B~~Q'], CT = [{ x: 2, y: 1, so: 7, tan: 3 }];
  const L2 = (cach, them) => {
    const k = chay('L2', cach, SAN, { x: 1, y: 1, huong: 1 }, 'a = read_code()\nb = weight()\nleft_move()\nwait()\nc = read_code()\n', them === undefined ? { contTroi: CT } : them);
    const d = doc(k);
    return !k.loi && J(d.map((e) => e.so)) === J([7, 7, -1]) && d[1].tan === 3 && d[2].noi === 'be' && k.vat[0].noi === 'container' && k.vat[0].so === 7;
  };
  kiem('L2 b: xuồng + đầu đọc mã: container trôi trước mũi read_code() = 7, weight() = 3; quay mũi sang bè thường → -1', thu(() => L2({ than: 'xuong', camBien: 'quet-ma' })));
  const L2luoi = (cach) => {                                                     // container trôi cách 2 ô: tay lưới bắt được như vật nổi khác
    const k = chay('L2', cach, ['~~~~~', '~~~B~', '~~~~Q'], { x: 1, y: 1, huong: 1 }, 'a = read_code()\ncast_net()\nwait()\n', { contTroi: [{ x: 3, y: 1, so: 12 }] });
    const e = sk1(k, 'keo-vat');
    return !k.loi && doc(k)[0].so === -1 && e && e.id === 1 && k.vat[0].noi === 'container' && k.vat[0].tan === 1;
  };
  kiem('L2 b: xuồng + tay lưới + đầu đọc mã: container trôi cách 2 ô (read_code -1 vì ô sát mũi trống), cast_net() bắt container ("keo-vat")', thu(() => L2luoi({ than: 'xuong', tay: 'day-keo', camBien: 'quet-ma' })));
  let sai = null; try { SanHoc.chay({ san: ['~~~Q'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'xuong', hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait'], contTroi: [{ x: 1, y: 0, so: 3 }] }, 'wait()\n'); } catch (e) { sai = e.message; }
  kiem('L2: container trôi phải đặt trên ô bè B (lõi báo lỗi cấu hình)', /phải đặt trên ô bè B/.test(sai || ''), sai);
  kiem('L2 d: xuồng KHÔNG gắn đầu đọc mã → phép b đỏ', !thu(() => L2({ than: 'xuong', camBien: null })));
  kiem('L2 d: màn không khai container trôi (bè thường) → phép b đỏ (read_code -1)', !thu(() => L2({ than: 'xuong', camBien: 'quet-ma' }, {})));
}

/* T2 container lấp hố: cfg.contLapHo, set_down() lên ô hố 'u' → container thành sàn, xe dưới đất đi qua được */
{
  const SAN = ['.....', '.#u#.', '.....', '....F'], DI = 'left_move()\nright_move()\nwait()\n';
  // cẩu (2, 0) nấc 5 tầm 2 nhấc container ở (0, 2), quay về nấc 4 → (2, 2), thu cần → (2, 1) hố, hạ; xe hai bánh (2, 3) chờ 4 nhịp rồi tiến 2 ô vào (2, 1)
  const T2 = (lap, codeCau) => {
    const k = SanHoc.chay({ san: SAN, contLapHo: lap, chong: [{ x: 0, y: 2, cont: [{ so: 5 }] }], doi: [
      { batDau: { x: 2, y: 0, nac: 5, tam: 2 }, loaiRobot: 'cau', hamGoc: ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'pick_up', 'set_down'] },
      { batDau: { x: 2, y: 3, huong: 0 }, loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait'] }] },
      [codeCau || 'pick_up()\nswing_left()\nretract()\nset_down()\n', 'wait()\nwait()\nwait()\nwait()\n' + DI + DI]);
    return { k, ok: !k.loi && J(k.lapHo) === J([{ x: 2, y: 1, so: 5, tan: 1 }]) && J(k.doi[1].robot) === J({ x: 2, y: 1, huong: 0 }) && !k.doi[1].suKien.some((e) => e.ma === 'roi-ho') && k.dungSom !== 'roi-ho' };
  };
  kiem('T2 b: cẩu hạ container lên ô hố ("lap-ho"): hố thành sàn, xe hai bánh đi vào ô đó KHÔNG rơi', thu(() => T2(true).ok));
  const khong = thu(() => T2(false).k);
  kiem('T2 d: màn không khai contLapHo (như Cảng sông cũ): hạ lên hố bị chặn ("ha-bi-chan" vat ho), xe rơi hố (phép b đỏ)', khong && !T2(false).ok && khong.suKien.some((e) => e.ma === 'ha-bi-chan' && e.vat === 'ho') && khong.dungSom === 'roi-ho');
  const KHONG_HA = 'pick_up()\nswing_left()\nretract()\nwait()\n', khongHa = thu(() => T2(true, KHONG_HA).k);
  kiem('T2 d: có contLapHo nhưng cẩu không set_down() → xe rơi hố (phép b đỏ)', khongHa && khongHa.dungSom === 'roi-ho' && !T2(true, KHONG_HA).ok);
}

/* ============================================================ M9C1 (4/11): L3 xe tời bờ, P người cần cứu */
const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const TIEN = 'left_move()\nright_move()\nwait()\n';
const skNg = (k) => k.vet.filter((v) => v.loai === 'nhip').map((v) => v.nhip + ':' + (v.suKien || []).map((e) => e.ma).join(',')).join(' | ');
const vetNhip = (k) => k.vet.filter((v) => v.loai === 'nhip');

/* L3 xe có bánh + tay lưới: cast_net kéo MỘT LẦN vật đầu tiên trên dây (vật nổi về ô nước gần xe nhất; thùng gỗ về ô trước mũi; không thùng nặng; không vật có xe đứng) */
{
  // xe (0, 0) hướng phải; (1, 0) (2, 0) nước; bè ở (3, 0): dây mặc định 2 → hết tầm; set_length(3) → bè về (1, 0) (ô nước sát mũi)
  const L3be = (cach, code) => {
    const k = chay('L3', cach, ['.~~B', '...F'], { x: 0, y: 0, huong: 1 }, code);
    const e = sk1(k, 'keo-vat');
    return !k.loi && e && e.toi === true && e.soO === 2 && J(e.den) === J({ x: 1, y: 0 }) && k.vat[0].x === 1 && k.vat[0].y === 0 && k.vat[0].noi === 'be';
  };
  kiem('L3 b: xe hai bánh + tay lưới set_length(3) + cast_net(): bè cách 3 ô kéo về ô nước sát mũi (1, 0) ("keo-vat" toi, soO 2), xe không giữ bè', thu(() => L3be({ than: 'hai-banh', tay: 'day-keo' }, 'set_length(3)\ncast_net()\nwait()\n')));
  const hetTam = thu(() => chay('L3', { than: 'hai-banh', tay: 'day-keo' }, ['.~~B', '...F'], { x: 0, y: 0, huong: 1 }, 'cast_net()\nwait()\n'));
  kiem('L3 b: dây mặc định 2 ô không tới bè cách 3 ô: "keo-hut" het-tam, bè đứng yên', hetTam && !hetTam.loi && hetTam.suKien.some((e) => e.ma === 'keo-hut' && e.vat === 'het-tam') && hetTam.vat[0].x === 3);
  // thùng gỗ chắn lối ở (2, 1): xe hai bánh (0, 1) kéo về ô trước mũi (1, 1), rồi xích (2, 0) hướng xuống đi qua (2, 1) tới cờ (2, 2) — màn hai robot
  const SAN_GO = ['..o..', '.....', '..F..'];
  const L3go = (lap, codeKeo, codeXich) => {
    const m = LapRap.apDung({ ma: 'tam.L3', san: ['.....', '.....', '..F..'], batDau: { x: 0, y: 1, huong: 1 }, lapRap: { moLai: ['L3'] } }, lap);
    const k = SanHoc.chay({ san: ['.....', 'F.o..', '..F..'], doi: [
      { batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: m.loaiRobot, hamGoc: m.hamGoc, phanCung: SanHoc.phanCungCua(m) },
      { batDau: { x: 2, y: 0, huong: 2 }, loaiRobot: 'xich', hamGoc: BANH }] },
      [codeKeo || 'cast_net()\nwait()\n', codeXich || 'wait()\n' + TIEN + TIEN]);
    return { k, ok: !k.loi && k.thang && k.vat[0].x === 1 && k.vat[0].y === 1 && J(k.doi[1].robot) === J({ x: 2, y: 2, huong: 2 }) };
  };
  kiem('L3 b (hai robot): xe hai bánh kéo thùng gỗ chắn lối (2, 1) về ô trước mũi (1, 1), xích đi qua ô đó tới cờ: thắng', thu(() => L3go({ than: 'hai-banh', tay: 'day-keo' }).ok), J(thu(() => L3go({ than: 'hai-banh', tay: 'day-keo' }).k.vat)));
  const khongKeo = thu(() => L3go({ than: 'hai-banh', tay: 'day-keo' }, 'wait()\n').k);
  kiem('L3 d: xe không cast_net() → xích đâm thùng gỗ, không thắng (phép b đỏ)', khongKeo && !khongKeo.thang && khongKeo.doi[1].suKien.some((e) => e.ma === 'dam-tuong' && e.vat === 'vat') && !L3go({ than: 'hai-banh', tay: 'day-keo' }, 'wait()\n').ok);
  kiem('L3 d: xe hai bánh KHÔNG gắn tay lưới → phép b đỏ', !thu(() => L3go({ than: 'hai-banh', tay: null }).ok));
  const nang = thu(() => chay('L3', { than: 'xich', tay: 'day-keo' }, ['..H.', '...F'], { x: 0, y: 0, huong: 1 }, 'cast_net()\nwait()\n'));
  kiem('L3 b: thùng nặng H trên dây: không kéo ("keo-hut" thung-nang), thùng đứng yên', nang && !nang.loi && nang.suKien.some((e) => e.ma === 'keo-hut' && e.vat === 'thung-nang') && nang.thung[0].x === 2);
  // vật nổi có xe đứng trên (cầu phao): không kéo
  const coXe = thu(() => SanHoc.chay({ san: ['.~B.', '...F'], doi: [
    { batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH.concat(['cast_net', 'drop_net']) },
    { batDau: { x: 3, y: 0, huong: 3 }, loaiRobot: 'banh', hamGoc: BANH }] }, ['wait()\ncast_net()\nwait()\n', TIEN]));   // R2 lên cầu phao (2, 0) ở nhịp 1, R1 tung lưới ở nhịp 2
  kiem('L3 b: bè đang có xe đứng trên (cầu phao): không kéo ("keo-hut" co-xe)', coXe && coXe.suKien.some((e) => e.ma === 'keo-hut' && e.vat === 'co-xe') && coXe.vat[0].x === 2 && coXe.doi[1].robot.x === 2, J(coXe && coXe.suKien));
  const dropNet = thu(() => chay('L3', { than: 'omni', tay: 'day-keo' }, ['..o.', '...F'], { x: 0, y: 0, huong: 1 }, 'cast_net()\nwait()\ndrop_net()\nwait()\n'));
  kiem('L3 b: xe omni kéo thùng gỗ rồi drop_net(): xe không giữ gì → "khong-keo" (thùng vẫn ở ô trước mũi)', dropNet && !dropNet.loi && dropNet.suKien.some((e) => e.ma === 'khong-keo') && dropNet.vat[0].x === 1);
  let motTay = null; try { SanHoc.chay({ san: ['....'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH.concat(['cast_net', 'drop_net', 'grab', 'release', 'arm_up', 'arm_down']) }, 'wait()\n'); } catch (e) { motTay = e.message; }
  kiem('L3: một tay — tay lưới trên xe không đi chung tay kẹp (lõi báo)', /tay lưới \(xe tời bờ\) không đi chung/.test(motTay || ''), motTay);
  let gaiBe = thu(() => L3be({ than: 'gai', tay: 'day-keo' }, 'set_length(3)\ncast_net()\nwait()\n'));
  kiem('L3 b: bánh gai + tay lưới kéo bè như xe hai bánh', gaiBe === true);
  kiem('L3 d: xuồng + tay lưới cùng sân (xuồng không xuất phát trên bờ) → phép b đỏ', !thu(() => L3be({ than: 'xuong', tay: 'day-keo' }, 'set_length(3)\ncast_net()\nwait()\n')));
}

/* P người cần cứu: trên cạn tự về trạm khi lối trống, robot chặn thì chờ; dưới nước trôi; lưới kéo tới sát bờ → lên bờ → về trạm → thắng; trôi xa → thua nhẹ; vòi phun vào người → lỗi lời Việt */
{
  const P = (them, code, san, bd) => SanHoc.chay(Object.assign({ san: san || ['.....', '....F'], batDau: bd || { x: 0, y: 1, huong: 1 }, hamGoc: BANH.concat(['spray']), mucTieu: 'cuu-nguoi', nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 0 }] }, them || {}), code);
  const tuDi = thu(() => P({}, 'wait()\n'));
  kiem('P b: người (0, 0) trên cạn tự bước mỗi nhịp theo đường ngắn nhất tới trạm (3, 0): 3 nhịp, "nguoi-buoc" ×3, "nguoi-toi-tram", thắng cuu-nguoi (chương trình chỉ 1 wait: lõi chạy thêm nhịp cho người đi)',
    tuDi && tuDi.thang && tuDi.nhip === 3 && tuDi.nguoi[0].toiTram && J([tuDi.nguoi[0].x, tuDi.nguoi[0].y]) === J([3, 0]) && vetNhip(tuDi).every((v) => v.suKien.some((e) => e.ma === 'nguoi-buoc')) && coSk(tuDi, 'nguoi-toi-tram') && coSk(tuDi, 'xong-cuu-nguoi'), tuDi && skNg(tuDi));
  kiem('P b: vết mỗi nhịp có vị trí người (mucVet.nguoi), nguoiBanDau (0, 0), tramCuu (3, 0)', tuDi && J(vetNhip(tuDi)[0].nguoi.map((n) => [n.x, n.y])) === J([[1, 0]]) && J(tuDi.nguoiBanDau[0].x) === '0' && J(tuDi.tramCuu) === J([{ x: 3, y: 0 }]));
  const chan = thu(() => P({ batDau: { x: 1, y: 0, huong: 2 } }, 'wait()\nwait()\n' + TIEN + 'wait()\n'));
  kiem('P b: robot đứng (1, 0) chắn lối: người đứng chờ ("nguoi-cho" vat robot) 2 nhịp, robot tiến xuống thì người đi tiếp, thắng ở nhịp 5', chan && chan.thang && chan.nhip === 5 && vetNhip(chan)[0].suKien.some((e) => e.ma === 'nguoi-cho' && e.vat === 'robot') && vetNhip(chan)[1].suKien.some((e) => e.ma === 'nguoi-cho') && vetNhip(chan)[2].suKien.some((e) => e.ma === 'nguoi-buoc'), chan && skNg(chan));
  const chanMai = thu(() => P({ batDau: { x: 1, y: 0, huong: 2 } }, 'wait()\n'));
  kiem('P b: robot chắn mãi: người không nhúc nhích, lõi không chạy thêm quá 2 nhịp rỗng, không thắng', chanMai && !chanMai.thang && chanMai.nhip <= 3 && !chanMai.nguoi[0].toiTram, chanMai && skNg(chanMai));
  const diVao = thu(() => P({ batDau: { x: 1, y: 0, huong: 3 }, nguoi: [{ x: 0, y: 0, duong: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 0 }] }] }, TIEN));
  kiem('P b: robot tiến vào ô người: "dam-tuong" vat nguoi, đứng yên; đường khai duong (vòng dưới) được dùng', diVao && diVao.suKien.some((e) => e.ma === 'dam-tuong' && e.vat === 'nguoi') && diVao.robot.x === 1 && vetNhip(diVao)[0].nguoi[0].y === 1, diVao && skNg(diVao));
  // dưới nước: dòng chảy sang phải trên hàng 0, người (0, 0) trôi tới mép (3, 0) → thua nhẹ
  const DONG = [0, 1, 2, 3].map((x) => ({ x, y: 0, huong: 1, suc: 1 }));
  const troi = thu(() => P({ dong: DONG, tramCuu: [{ x: 3, y: 2 }] }, 'wait()\nwait()\nwait()\nwait()\nwait()\n', ['~~~~', '....', '...F']));
  kiem('P b: người dưới nước trôi theo dòng mỗi nhịp ("nguoi-troi"), tới mép sân → dungSom "nguoi-troi-xa" vi mep-san, chương trình dừng ở nhịp 4, không thắng',
    troi && !troi.thang && troi.dungSom === 'nguoi-troi-xa' && troi.nhip === 4 && vetNhip(troi)[0].suKien.some((e) => e.ma === 'nguoi-troi') && troi.suKien.some((e) => e.ma === 'nguoi-troi-xa' && e.vi === 'mep-san' && /trôi xa quá/.test(e.thongDiep)), troi && skNg(troi));
  const cong = thu(() => P({ dong: [{ x: 0, y: 0, huong: 1, suc: 1 }, { x: 1, y: 0, huong: 1, suc: 1 }], tramCuu: [{ x: 3, y: 2 }] }, 'wait()\nwait()\nwait()\n', ['~~k~', '....', '...F']));
  kiem('P b: người trôi vào ô cống đang mở k → thua nhẹ vi cong', cong && cong.dungSom === 'nguoi-troi-xa' && cong.suKien.some((e) => e.ma === 'nguoi-troi-xa' && e.vi === 'cong'), cong && skNg(cong));
  const thac = thu(() => P({ dong: [{ x: 0, y: 0, huong: 1, suc: 1 }], thac: [{ x: 1, y: 0 }], tramCuu: [{ x: 3, y: 2 }] }, 'wait()\nwait()\n', ['~~~~', '....', '...F']));
  kiem('P b: người trôi vào ô thác (cfg.thac) → thua nhẹ vi thac', thac && thac.dungSom === 'nguoi-troi-xa' && thac.suKien.some((e) => e.ma === 'nguoi-troi-xa' && e.vi === 'thac'), thac && skNg(thac));
  const yen = thu(() => P({ tramCuu: [{ x: 3, y: 2 }] }, 'wait()\nwait()\n', ['~~~~', '....', '...F']));
  kiem('P b: nước êm (không dòng): người nổi tại chỗ, không trôi, không lên bờ dù sát bờ (chưa được kéo), không thua', yen && !yen.thang && !yen.dungSom && !yen.loi && J([yen.nguoi[0].x, yen.nguoi[0].y, yen.nguoi[0].can]) === J([0, 0, false]), yen && skNg(yen));
  // xuồng kéo người: xuồng (0, 1) hướng phải trên sông hàng 0–1, người (2, 1) nước, bờ hàng 2, trạm (4, 3)
  const XUONG = BANH.concat(['cast_net', 'drop_net']);
  const SAN_X = ['~~~~~', '~~~~~', '.....', '....F'];
  const cuuX = (code, them) => SanHoc.chay(Object.assign({ san: SAN_X, batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'xuong', hamGoc: XUONG, mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 1 }], tramCuu: [{ x: 4, y: 3 }] }, them || {}), code);
  const keoX = thu(() => cuuX('cast_net()\nwait()\nwait()\n'));
  kiem('P b: xuồng cast_net() bắt người cách 2 ô ("keo-vat"), người đang trong lưới sát bờ → lên bờ ("nguoi-len-bo" thaLuoi, xuồng không còn giữ) → đi về trạm (4, 3) → thắng',
    keoX && keoX.thang && vetNhip(keoX)[0].suKien.some((e) => e.ma === 'keo-vat') && vetNhip(keoX)[0].suKien.some((e) => e.ma === 'nguoi-len-bo' && e.thaLuoi === true) && keoX.keo === null && keoX.nguoi[0].toiTram, keoX && skNg(keoX) + ' ' + J(keoX.keo));
  // người giữa sông (hàng 0), xuồng (2, 2) hướng lên bắt rồi quay phải, tiến dọc bờ: người theo dây (2 ô sau xuồng) tới (2, 1) → chưa sát bờ; tới (2, 2) → sát bờ (hàng 3 là cạn) → lên bờ
  const SAN_Y = ['~~~~~', '~~~~~', '~~~~~', '.....', '....F'], QUAY = 'left_move()\nwait()\n';
  const keoY = thu(() => SanHoc.chay({ san: SAN_Y, batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'xuong', hamGoc: XUONG, mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 0 }], tramCuu: [{ x: 4, y: 4 }] },
    'cast_net()\nwait()\n' + QUAY + TIEN + 'drop_net()\nwait()\n'));
  kiem('P b: xuồng (2, 2) hướng lên bắt người (2, 0), quay phải, tiến 1: người theo dây tới (2, 1) (chưa sát bờ, không lên); drop_net thả → người vẫn dưới nước tại (2, 1), không thua, không thắng',
    keoY && !keoY.thang && !keoY.loi && !keoY.dungSom && keoY.nguoi[0].can === false && J([keoY.nguoi[0].x, keoY.nguoi[0].y]) === J([2, 1]) && coSk(keoY, 'tha-keo'), keoY && skNg(keoY) + J(keoY.nguoi));
  const keoY2 = thu(() => SanHoc.chay({ san: SAN_Y, batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'xuong', hamGoc: XUONG, mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 0 }], tramCuu: [{ x: 4, y: 4 }] },
    'cast_net()\nwait()\n' + QUAY + TIEN + TIEN));
  kiem('P b: xuồng bắt người, quay phải, tiến 2 dọc bờ: người theo dây tới ô nước sát bờ (2, 2) → tự lên bờ (2, 3) (thả lưới) → về trạm (4, 4) → thắng (chương trình hết, lõi chạy thêm nhịp)',
    keoY2 && keoY2.thang && keoY2.nguoi[0].toiTram && coSk(keoY2, 'nguoi-len-bo') && keoY2.keo === null, keoY2 && skNg(keoY2) + J(keoY2.nguoi));
  const troiSauTha = thu(() => SanHoc.chay({ san: SAN_Y, batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'xuong', hamGoc: XUONG, mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 0 }], tramCuu: [{ x: 4, y: 4 }], dong: [{ x: 2, y: 1, huong: 3, suc: 1 }, { x: 1, y: 1, huong: 3, suc: 1 }, { x: 0, y: 1, huong: 3, suc: 1 }] },
    'cast_net()\nwait()\n' + QUAY + TIEN + 'drop_net()\nwait()\nwait()\nwait()\n'));
  kiem('P b: thả người ở ô có dòng (2, 1): người trôi theo dòng sang trái ("nguoi-troi"), tới mép (0, 1) → thua nhẹ (trôi xoá dấu "vừa được kéo")',
    troiSauTha && troiSauTha.dungSom === 'nguoi-troi-xa' && coSk(troiSauTha, 'nguoi-troi'), troiSauTha && skNg(troiSauTha) + J(troiSauTha.nguoi));
  const khoang = thu(() => cuuX('cast_net()\nwait()\nset_length(0)\nwait()\n', { hamGoc: XUONG.concat(['set_length']), nguoi: [{ x: 2, y: 0 }], batDau: { x: 0, y: 0, huong: 1 } }));
  kiem('P b: set_length(0) khi đang giữ người: không thu vào khoang ("luoi-vuong" vat nguoi), người vẫn dưới nước', khoang && khoang.suKien.some((e) => e.ma === 'luoi-vuong' && e.vat === 'nguoi') && khoang.nguoi[0].can === false, khoang && skNg(khoang));
  // cấm chạm
  const phun = thu(() => P({ nguoi: [{ x: 2, y: 1 }] }, 'spray()\nwait()\n' + TIEN));
  kiem('P b: spray() nhắm ô có người: lỗi chạy ma cham-nguoi "Không phun nước vào người!", không bắn (không "ban"), chương trình dừng ở nhịp 1',
    phun && phun.loi && phun.loi.ma === 'cham-nguoi' && phun.loi.thongDiep === 'Không phun nước vào người!' && !coSk(phun, 'ban') && phun.nhip === 1 && coSk(phun, 'cham-nguoi'), phun && J(phun.loi));
  const kep = thu(() => SanHoc.chay({ san: ['.....', '....F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release']), mucTieu: 'cuu-nguoi', nguoi: [{ x: 1, y: 1 }], tramCuu: [{ x: 3, y: 0 }] }, 'arm_down()\ngrab()\nwait()\n'));
  kiem('P b: grab() ô có người: lỗi "Không kẹp người!", người không bị cầm', kep && kep.loi && kep.loi.ma === 'cham-nguoi' && /kẹp người/.test(kep.loi.thongDiep) && kep.vat[0].trangThai === 'dat', kep && J(kep.loi));
  const hut = thu(() => SanHoc.chay({ san: ['.....', '....F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH.concat(['magnet_n', 'magnet_s', 'magnet_off']), mucTieu: 'cuu-nguoi', nguoi: [{ x: 1, y: 1 }], tramCuu: [{ x: 3, y: 0 }] }, 'magnet_n()\nwait()\n'));
  kiem('P b: nam châm bật nhắm ô có người: lỗi "Không hút người bằng nam châm!"', hut && hut.loi && hut.loi.ma === 'cham-nguoi' && /nam châm/.test(hut.loi.thongDiep), hut && J(hut.loi));
  const nem = thu(() => SanHoc.chay({ san: ['o....', '....F'], batDau: { x: 1, y: 0, huong: 1 }, hamGoc: BANH.concat(['load', 'throw']), mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 0 }], tramCuu: [{ x: 4, y: 1 }], roBanDau: true }, 'throw()\nwait()\n'));
  kiem('P b: throw() rơi vào ô có người: lỗi "Không ném vào người!", vật vẫn trong rổ', nem && nem.loi && nem.loi.ma === 'cham-nguoi' && /ném/.test(nem.loi.thongDiep) && nem.vat.some((v) => v.trangThai === 'ro'), nem && J(nem.loi));
  const moc = thu(() => SanHoc.chay({ san: ['.....', '.....', '....F'], batDau: { x: 0, y: 0, nac: 2, tam: 1 }, loaiRobot: 'cau', hamGoc: ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'pick_up', 'set_down'], mucTieu: 'cuu-nguoi', nguoi: [{ x: 1, y: 0 }], tramCuu: [{ x: 4, y: 1 }] }, 'pick_up()\n'));
  kiem('P b: pick_up() đầu cần trên ô có người: lỗi "Không móc cẩu vào người!"', moc && moc.loi && moc.loi.ma === 'cham-nguoi' && /móc cẩu/.test(moc.loi.thongDiep), moc && J(moc.loi));
  // kết hợp với toi-co: robot tới cờ mà người chưa tới trạm thì chưa thắng; người tới rồi thì thắng
  const ketHop = thu(() => SanHoc.chay({ san: ['.....', '.F...'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH, nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 0 }] }, TIEN));
  kiem('P b: mục tiêu toi-co + có người: xe tới cờ ở nhịp 1 nhưng người tới trạm ở nhịp 3 → thắng ở nhịp 3 (toi-co chỉ ghi khi người đã về)', ketHop && ketHop.thang && ketHop.nhip === 3 && !vetNhip(ketHop)[0].suKien.some((e) => e.ma === 'toi-co') && vetNhip(ketHop)[2].suKien.some((e) => e.ma === 'toi-co'), ketHop && skNg(ketHop));
  const doi = thu(() => SanHoc.chay({ san: ['.....', 'F...F'], doi: [{ batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH }, { batDau: { x: 4, y: 1, huong: 3 }, hamGoc: BANH }], nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 4, y: 0 }] }, ['wait()\n', 'wait()\n']));
  kiem('P b: đội hai robot (toi-co) đứng sẵn ở cờ: thắng khi người tới trạm (nhịp 4), vết đội có nguoi', doi && doi.thang && doi.nhip === 4 && doi.nguoi[0].toiTram && vetNhip(doi.doi[0])[0].nguoi, doi && J(doi.loi));
  // d: tắt luật (không khai người) → phép b đỏ
  kiem('P d: cùng sân KHÔNG khai nguoi / tramCuu (mục tiêu toi-co) → phép b "tự về trạm" đỏ', !thu(() => { const k = SanHoc.chay({ san: ['.....', '....F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH }, 'wait()\n'); return k.thang && k.nguoi[0].toiTram; }));
  kiem('P d: cùng sân KHÔNG khai người → spray() bắn bình thường (phép b cấm chạm đỏ)', !thu(() => { const k = SanHoc.chay({ san: ['.....', '....F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH.concat(['spray']) }, 'spray()\nwait()\n'); return k.loi && k.loi.ma === 'cham-nguoi'; }));
  let cfgLoi = null; try { SanHoc.chay({ san: ['.#...', '.#..F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH, nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 0 }] }, 'wait()\n'); } catch (e) { cfgLoi = e.message; }
  kiem('P: người không có đường đi bộ tới trạm (tường chắn) → lỗi cấu hình nói rõ', /không có đường đi bộ tới trạm/.test(cfgLoi || ''), cfgLoi);
}

/* ============================================================ M9C2 (4/11): L9 giỏ cứu hộ, L10 thả phao, T3 vòi phun gạt van, T4 bè sạc */
/* T3 vòi phun gạt van cống: tia phun (spray / spray_back) trúng van V thì van đổi như lưới kéo van ('phun-van'), cống đổi cuối nhịp */
{
  const XUONG_DI = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  const T3 = (codeXe, hamXe) => SanHoc.chay({ san: ['.V...', '~K~~~', '#####'], doi: [{ batDau: { x: 0, y: 0, huong: 1 }, hamGoc: hamXe || BANH.concat(['spray']) }, { batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'xuong', hamGoc: XUONG_DI }] },
    [codeXe, 'wait()\n' + TIEN + TIEN + TIEN]);
  const t3 = thu(() => T3('spray()\nwait()\n'));
  kiem('T3 b: xe phun trúng van V (1, 0): "phun-van" bat true, cống K (1, 1) mở cuối nhịp 1 ("cong-doi"), xuồng chạy qua cống tới (3, 1)',
    t3 && !t3.loi && coSk(t3.doi[0], 'phun-van') && t3.cong[0].mo === true && t3.doi[1].robot.x === 3 && t3.van[0].bat === true, t3 && J({ loi: t3.loi, cong: t3.cong, r: t3.doi[1].robot }));
  const t3b = thu(() => SanHoc.chay({ san: ['...V.', '#####'], batDau: { x: 4, y: 0, huong: 1 }, hamGoc: BANH.concat(['spray', 'spray_back']) }, 'spray_back()\nwait()\n'));
  kiem('T3 b: spray_back() ra sau đuôi cũng gạt van (tia trúng V ở ô sát đuôi, soO 0), không giật vì phun nhẹ', t3b && !t3b.loi && t3b.van[0].bat === true && sk1(t3b, 'phun-van') && sk1(t3b, 'phun-van').soO === 0 && t3b.robot.x === 4, t3b && skNg(t3b));
  const t3d = thu(() => T3('wait()\n'));
  kiem('T3 d: xe không phun → cống vẫn đóng, xuồng đâm cống ở (0, 1) (phép b đỏ)', t3d && t3d.cong[0].mo === false && t3d.doi[1].robot.x === 0 && !thu(() => { const k = T3('wait()\n'); return k.cong[0].mo && k.doi[1].robot.x === 3; }), t3d && J(t3d.doi[1].robot));
  kiem('T3 d: xe không gắn vòi phun (spray không có trên khay) → phép b đỏ', !thu(() => { const k = T3('spray()\nwait()\n', BANH); return k.cong[0].mo && k.doi[1].robot.x === 3; }));
}

/* T4 bè sạc: cfg.beSac = [{ x, y }] gắn ô sạc lên bè B ở ô đó; ô sạc đi theo bè; drone bay / đậu trên bè sạc được sạc như ô P */
{
  const BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'land', 'take_off'];
  const DONG = [{ x: 1, y: 0, huong: 1, suc: 1 }, { x: 2, y: 0, huong: 1, suc: 1 }];
  const T4 = (them, code, bd) => SanHoc.chay(Object.assign({ san: ['~B~~', '....', '...F'], batDau: bd || { x: 0, y: 1 }, loaiRobot: 'drone', hamGoc: BAY, pin: 6, dong: DONG, beSac: [{ x: 1, y: 0 }] }, them || {}), code);
  const t4 = thu(() => T4({}, 'go_right()\ngo_right()\ngo_right()\ngo_up()\nland()\n'));
  const dap4 = t4 && sk1(t4, 'dap');
  kiem('T4 b: bè sạc trôi 2 ô (1, 0) → (3, 0) ("be-sac-di" ×2), drone bay tới, land() trên bè ở chỗ mới: "dap" be, "sac-pin" ở (3, 0), pin đầy 6',
    t4 && !t4.loi && vetNhip(t4).filter((v) => v.suKien.some((e) => e.ma === 'be-sac-di')).length === 2 && dap4 && dap4.be === 1 && dap4.sac === true && sk1(t4, 'sac-pin') && sk1(t4, 'sac-pin').o.x === 3 && t4.pin === 6 && t4.vat[0].sac === true,
    t4 && (skNg(t4) + ' pin ' + t4.pin));
  const theo = thu(() => T4({}, 'land()\nwait()\nwait()\n', { x: 1, y: 0 }));
  kiem('T4 b: drone đậu trên bè sạc đang trôi đi theo bè ("theo-be" ×2), cuối cùng ở (3, 0) vẫn đậu, pin đầy', theo && !theo.loi && theo.robot.x === 3 && vetNhip(theo).filter((v) => v.suKien.some((e) => e.ma === 'theo-be')).length === 2 && theo.pin === 6,
    theo && (skNg(theo) + ' ' + J(theo.robot)));
  const bay4 = thu(() => T4({ hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait'] }, 'go_right()\ngo_right()\ngo_right()\ngo_up()\n'));
  kiem('T4 b: drone gốc (không land) bay tới đứng trên bè sạc cuối nhịp: pin đầy như ô P', bay4 && !bay4.loi && bay4.pin === 6 && sk1(bay4, 'sac-pin'), bay4 && (skNg(bay4) + ' pin ' + bay4.pin));
  const t4d = thu(() => T4({ beSac: undefined }, 'go_right()\ngo_right()\ngo_right()\ngo_up()\nland()\n'));
  kiem('T4 d: cùng sân KHÔNG khai beSac → bè thường: land() trên bè bị chặn ("dap-bi-chan"), không sạc (phép b đỏ)', t4d && !sk1(t4d, 'sac-pin') && t4d.suKien.some((e) => e.ma === 'dap-bi-chan') && t4d.pin < 6, t4d && skNg(t4d));
  let cfg4 = null; try { T4({ beSac: [{ x: 0, y: 1 }] }, 'wait()\n'); } catch (e) { cfg4 = e.message; }
  kiem('T4: beSac đặt ngoài ô bè B → lỗi cấu hình nói rõ', /phải đặt trên ô bè B/.test(cfg4 || ''), cfg4);
}

/* L10 drone + tay lưới (thả phao): cast_net() thả phao xuống ô nước dưới bụng; người ở ô có phao (hay trôi tới) bám, thôi trôi; drone không kéo; drop_net() thu phao */
{
  const BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  const XUONG_DI = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'cast_net', 'drop_net'];
  const SAN10 = ['~~~~', '~~~~', '~~~~', '....'];
  const DONG10 = [{ x: 1, y: 2, huong: 1, suc: 1 }, { x: 2, y: 2, huong: 1, suc: 1 }];
  const XUONG_TOI = TIEN + TIEN + 'left_move()\nwait()\ncast_net()\nwait()\n';     // xuồng (0, 0) tiến 2 ô, quay phải (mặt xuống), tung lưới 2 ô xuống (2, 2) ở nhịp 4
  const L10 = (codeDrone, hamDrone) => SanHoc.chay({ san: SAN10, mucTieu: 'cuu-nguoi', nguoi: [{ x: 1, y: 2 }], tramCuu: [{ x: 0, y: 3 }], thac: [{ x: 3, y: 2 }], dong: DONG10,
    doi: [{ batDau: { x: 2, y: 2 }, loaiRobot: 'drone', hamGoc: hamDrone || BAY.concat(['cast_net', 'drop_net']) }, { batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'xuong', hamGoc: XUONG_DI }] }, [codeDrone, XUONG_TOI]);
  const l10 = thu(() => L10('cast_net()\nwait()\n'));
  kiem('L10 b: drone thả phao ở (2, 2) ("tha-phao"), người trôi tới bám phao ("bam-phao"), không trôi tới thác (3, 2); xuồng tới kéo vào bờ ở nhịp 4 → người về trạm → thắng',
    l10 && l10.thang && coSk(l10.doi[0], 'tha-phao') && vetNhip(l10.doi[0]).some((v) => v.suKien.some((e) => e.ma === 'bam-phao')) && l10.nguoi[0].toiTram && !l10.dungSom, l10 && (J(l10.loi) + ' ' + l10.dungSom + ' ' + skNg(l10.doi[0]) + ' || ' + skNg(l10.doi[1])));
  const l10d = thu(() => L10('wait()\n'));
  kiem('L10 d: cùng sân drone KHÔNG thả phao → người trôi tới thác ở nhịp 2: thua nhẹ "nguoi-troi-xa" vi thac (phép b đỏ)', l10d && !l10d.thang && l10d.dungSom === 'nguoi-troi-xa' && !thu(() => L10('wait()\n').thang), l10d && (l10d.dungSom + ' ' + l10d.nhip));
  kiem('L10 d: drone KHÔNG gắn tay lưới (cast_net không có) → phép b đỏ', !thu(() => L10('cast_net()\nwait()\n', BAY).thang));
  // drone không kéo: bay đi thì người vẫn bám phao tại chỗ; drop_net khi người bám → 'phao-hut' co-nguoi; drop_net xa phao → 'xa-phao'; thả hai lần → 'het-phao'
  const D1 = (code, them) => chay('L10', { than: 'drone', tay: 'day-keo' }, ['~~~~~', '~~~~~', '...F.'], { x: 2, y: 0 }, code, Object.assign({ nguoi: [{ x: 1, y: 0 }], tramCuu: [{ x: 0, y: 2 }], dong: [1, 2, 3].map((x) => ({ x, y: 0, huong: 1, suc: 1 })) }, them || {}));
  const keoKhong = thu(() => D1('cast_net()\ngo_right()\ngo_right()\ndrop_net()\nwait()\n'));
  kiem('L10 b (lắp ráp drone + tay lưới): phao thả ở (2, 0), người trôi tới bám; drone bay sang phải 2 ô: người vẫn ở (2, 0) trên dòng (drone không kéo, không trôi tới mép), drop_net() xa phao → "phao-hut" xa-phao',
    keoKhong && !keoKhong.loi && !keoKhong.dungSom && J([keoKhong.nguoi[0].x, keoKhong.nguoi[0].y]) === J([2, 0]) && keoKhong.suKien.some((e) => e.ma === 'phao-hut' && e.lyDo === 'xa-phao') && sk1(keoKhong, 'tha-phao').nguoi === null && sk1(keoKhong, 'bam-phao'),
    keoKhong && (J(keoKhong.loi) + skNg(keoKhong)));
  const coNg = thu(() => D1('cast_net()\nwait()\ndrop_net()\nwait()\ncast_net()\nwait()\n'));
  kiem('L10 b: drop_net() khi người đang bám → "phao-hut" co-nguoi (không thu), cast_net() lần hai → "phao-hut" het-phao (drone mang một phao)',
    coNg && coNg.suKien.some((e) => e.ma === 'phao-hut' && e.lyDo === 'co-nguoi' && /bám phao/.test(e.thongDiep)) && coNg.suKien.some((e) => e.ma === 'phao-hut' && e.lyDo === 'het-phao') && coNg.nguoi[0].x === 2, coNg && skNg(coNg));
  const thuVe = thu(() => D1('cast_net()\nwait()\ndrop_net()\nwait()\ncast_net()\nwait()\n', { nguoi: [{ x: 1, y: 2 }], dong: [] }));
  kiem('L10 b: phao thả ở ô nước trống, drop_net() ngay trên phao thu về ("thu-phao"), thả lại được; vết nhịp có phao', thuVe && !thuVe.loi && coSk(thuVe, 'thu-phao') && vetNhip(thuVe).filter((v) => v.suKien.some((e) => e.ma === 'tha-phao')).length === 2 && vetNhip(thuVe).some((v) => v.phao && v.phao.length === 1), thuVe && skNg(thuVe));
  const bo = thu(() => D1('go_down()\ngo_down()\ncast_net()\nwait()\n', { nguoi: [{ x: 1, y: 2 }], dong: [] }));
  kiem('L10 b: cast_net() trên bờ → "phao-hut" bo (lời Việt "phao chỉ thả xuống nước")', bo && bo.suKien.some((e) => e.ma === 'phao-hut' && e.lyDo === 'bo' && /thả xuống nước/.test(e.thongDiep)), bo && skNg(bo));
  let mt = null; try { SanHoc.chay({ san: ['~~', '.F'], batDau: { x: 0, y: 0 }, loaiRobot: 'drone', hamGoc: BAY.concat(['cast_net', 'drop_net', 'magnet_n', 'magnet_s', 'magnet_off']) }, 'wait()\n'); } catch (e) { mt = e.message; }
  kiem('L10: một tay — phao trên drone không đi chung nam châm (lõi báo)', /phao \(tay lưới trên drone\) không đi chung/.test(mt || ''), mt);
  let ts = null; const ts1 = thu(() => SanHoc.chay({ san: ['~~', '.F'], batDau: { x: 0, y: 0 }, loaiRobot: 'drone', hamGoc: BAY.concat(['cast_net', 'drop_net']) }, 'cast_net("front")\nwait()\n')); ts = ts1 && ts1.loi;
  kiem('L10: cast_net("front") trên drone → lỗi chạy lời Việt (phao thả thẳng xuống, không nhận đối số)', ts && /không nhận đối số/.test(ts.thongDiep), J(ts));
}

/* L9 cần cẩu + tay lưới (giỏ cứu hộ): cast_net() vớt người / vật nổi ở ô đầu cần, giỏ treo theo đầu cần; drop_net() đặt lên ô bờ ở đầu cần; người lên bờ tự về trạm */
{
  const GIO = { than: 'cau', tay: 'day-keo' };
  const SAN9 = ['~~~~~', '.....', '.....'];
  const VOT = 'cast_net()\nswing_left()\nswing_left()\ndrop_net()\n';           // vớt ở (2, 0), quay cần 2 nấc trái (lên-trái rồi trái), đặt ở (1, 1)
  const L9 = (cach, code, them) => chay('L9', cach, SAN9, { x: 2, y: 1, nac: 0, tam: 1 }, code, Object.assign({ mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 0 }], tramCuu: [{ x: 0, y: 2 }] }, them || {}));
  const l9 = thu(() => L9(GIO, VOT));
  const n9 = l9 && vetNhip(l9);
  kiem('L9 b: cẩu vớt người ở ô nước đầu cần (2, 0) ("gio-vot" nguoi), quay cần: người treo theo đầu cần (1, 0) rồi (1, 1), drop_net() đặt lên bờ ("gio-dat") → người tự đi về trạm (0, 2) → thắng',
    l9 && l9.thang && coSk(l9, 'gio-vot') && sk1(l9, 'gio-vot').nguoi === true && J([n9[1].nguoi[0].x, n9[1].nguoi[0].y]) === J([1, 0]) && J([n9[2].nguoi[0].x, n9[2].nguoi[0].y]) === J([1, 1]) && coSk(l9, 'gio-dat') && l9.nguoi[0].toiTram && !coSk(l9, 'cham-nguoi'),
    l9 && (J(l9.loi) + ' ' + skNg(l9)));
  kiem('L9 d: cẩu KHÔNG gắn tay lưới (cast_net không có) → phép b đỏ', !thu(() => L9({ than: 'cau', tay: null }, VOT).thang));
  kiem('L9 d: cùng sân không cast_net() (chỉ quay cần) → người vẫn nổi ở (2, 0), không thắng (phép b đỏ)', !thu(() => L9(GIO, 'swing_left()\nswing_left()\ndrop_net()\n').thang));
  const nuoc = thu(() => L9(GIO, 'cast_net()\nswing_right()\ndrop_net()\n'));
  kiem('L9 b: drop_net() khi đầu cần trên mặt nước (3, 0) → "gio-hut" nuoc lời Việt ("phải đặt lên ô bờ"), người vẫn trong giỏ', nuoc && !nuoc.loi && nuoc.suKien.some((e) => e.ma === 'gio-hut' && e.lyDo === 'nuoc' && /ô bờ/.test(e.thongDiep)) && nuoc.vat[0].trangThai === 'gio', nuoc && skNg(nuoc));
  const be = thu(() => chay('L9', GIO, ['~B~~~', '.....', '....F'], { x: 2, y: 1, nac: 7, tam: 1 }, 'cast_net()\nswing_left()\ndrop_net()\n'));
  kiem('L9 b: giỏ vớt vật nổi (bè B ở (1, 0)) rồi đặt lên bờ (1, 1): "gio-vot" nguoi false, bè nằm trên bờ', be && !be.loi && sk1(be, 'gio-vot') && sk1(be, 'gio-vot').nguoi === false && be.vat[0].trangThai === 'dat' && J([be.vat[0].x, be.vat[0].y]) === J([1, 1]), be && skNg(be));
  const vDat = thu(() => chay('L9', GIO, ['~~~~~', '.o...', '....F'], { x: 2, y: 1, nac: 6, tam: 1 }, 'cast_net()\n'));
  kiem('L9 b: giỏ không nhặt vật nằm đất (thùng gỗ o) → "gio-hut" vat-dat', vDat && vDat.suKien.some((e) => e.ma === 'gio-hut' && e.lyDo === 'vat-dat') && vDat.vat[0].trangThai === 'dat', vDat && skNg(vDat));
  const can = thu(() => chay('L9', GIO, SAN9, { x: 2, y: 1, nac: 6, tam: 1 }, 'cast_net()\n', { mucTieu: 'cuu-nguoi', nguoi: [{ x: 1, y: 1 }], tramCuu: [{ x: 0, y: 2 }] }));
  kiem('L9 b: người trên cạn ở đầu cần → không vớt ("gio-hut" nguoi-tren-can)', can && can.suKien.some((e) => e.ma === 'gio-hut' && e.lyDo === 'nguoi-tren-can'), can && skNg(can));
  let mt9 = null; try { SanHoc.chay({ san: SAN9, batDau: { x: 2, y: 1, nac: 0, tam: 1 }, loaiRobot: 'cau', hamGoc: ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'pick_up', 'set_down', 'cast_net', 'drop_net'] }, 'wait()\n'); } catch (e) { mt9 = e.message; }
  kiem('L9: một tay — giỏ cứu hộ không đi chung móc cẩu trên đầu cần (lõi báo)', /giỏ cứu hộ .* không đi chung móc cẩu/.test(mt9 || ''), mt9);
  const ts9 = thu(() => L9(GIO, 'cast_net("front")\n'));
  kiem('L9: cast_net("front") trên cẩu → lỗi chạy lời Việt (giỏ thả ngay ở đầu cần)', ts9 && ts9.loi && /không nhận đối số/.test(ts9.loi.thongDiep), ts9 && J(ts9.loi));
}

console.log('\nĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);

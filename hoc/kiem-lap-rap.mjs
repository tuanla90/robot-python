/* ============================================================================
   kiem-lap-rap.mjs — máy kiểm LÕI + GIAO DIỆN CHẾ ĐỘ LẮP RÁP của "Robot Chấn Hưng" (lap-rap.js, KE-HOACH-LAP-RAP.md). Dùng MÀN TẠM trong bộ nhớ (không thêm màn nào vào game). Gồm:
   1. danh mục part: mã part thật có trong game/part, giá đúng bảng kế hoạch (thân 2 3 4 4 5 · tay 2 3 3 3 3 · não 1 2 2 2 2), icon có trong ve.js, mỗi mục có một dòng "vượt được gì";
   2. luật ghép: bảng luật của lõi khớp từng tổ hợp (5 thân × 6 tay × 6 não = 180) với Part.ghep VÀ với SanHoc.chay (cấu hình robot đúng thì chay() không ném lỗi); các ca cụ thể + lý do tiếng Việt;
   3. kiemCachLap: part ngoài danh sách màn, thiếu khe bắt buộc, vượt ngân sách (thieu), giá, bí danh `giá`; dsCachLap đếm đúng (đếm độc lập bằng tay);
   4. apDung: loaiRobot, robot, hamGoc (hợp lệnh các part + wait; battery chỉ khi drone có pin; pin bị bỏ khi thân khác), không đổi màn gốc, ném lỗi khi ghép sai;
   5. chấm thắng một màn tạm bằng hai cách lắp khác nhau (xích đi thẳng qua bậc · hai bánh đi vòng), lời giải cách này trượt trên robot kia, thongKeMau, không cách nào hơn hẳn;
   6. kiemDuLieu bắt dữ liệu màn sai; lenhKhongCon (Lắp lại đổi part);
   7. giao diện: choi.html nạp lap-rap.js / man-lap.js và có màn sc-lap, chữ lap.* trong chu.js, Luu.docLap / ghiLap, App.vaoMan / lapLai, nút Lắp lại, bảng "Cách lắp khác".
   Chạy: node hoc/kiem-lap-rap.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const LapRap = require(path.join(day, 'lap-rap.js'));
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const ManHoc = require(path.join(day, 'man-chuoi-1.js'));
const Part = LapRap.part();

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const doc = (f) => fs.readFileSync(path.join(day, f), 'utf8');
const tap = (a) => J([...a].sort());
const bang = (a, b) => tap(a) === tap(b);

/* ---------------------------------------------------------------- 1. danh mục */
console.log('1. danh mục part');
const GIA = { than: { 'hai-banh': 2, xich: 3, omni: 4, nhen: 4, drone: 5 }, tay: { kep: 2, xoay: 3, 'nam-cham': 3, nem: 3, hoi: 3 }, camBien: { 'khoang-cach': 1, mau: 2, camera: 2, tu: 2, 'camera-bay': 2 } };
const LOAI_PART = { than: 'than', tay: 'tay', camBien: 'cam-bien' };
for (const khe of LapRap.KHE) {
  const ds = LapRap.DANH_MUC[khe];
  kiem('khe ' + khe + ': đúng ' + Object.keys(GIA[khe]).length + ' part, mã không trùng', ds.length === Object.keys(GIA[khe]).length && new Set(ds.map((d) => d.ma)).size === ds.length, ds.map((d) => d.ma).join(','));
  kiem('khe ' + khe + ': giá đúng bảng kế hoạch', ds.every((d) => d.gia === GIA[khe][d.ma]), ds.map((d) => d.ma + '=' + d.gia).join(' '));
  kiem('khe ' + khe + ': mã part thật có trong game/part (Part.lay)', ds.every((d) => !!Part.lay(LOAI_PART[khe], d.part)), ds.filter((d) => !Part.lay(LOAI_PART[khe], d.part)).map((d) => d.ma).join(','));
  kiem('khe ' + khe + ': có tên và một dòng "vượt được gì" ngắn (≤ 40 chữ)', ds.every((d) => d.ten && d.vuot && d.vuot.length <= 40), ds.filter((d) => !d.ten || !d.vuot || d.vuot.length > 40).map((d) => d.ma + ':' + (d.vuot || '').length).join(','));
}
kiem('thân: loại robot đúng lõi SanHoc (hai-banh→banh, còn lại cùng tên)', LapRap.DANH_MUC.than.every((d) => d.loai === (d.ma === 'hai-banh' ? 'banh' : d.ma) && !!SanHoc.HAM_GOC[d.loai]));
kiem('cảm biến từ (tu) dùng part khoang-cach + hai hàm front_metal / front_pole', LapRap.tim('camBien', 'tu').part === 'khoang-cach' && ['front_metal', 'front_pole'].every((h) => LapRap.tim('camBien', 'tu').ham.includes(h)));
for (const khe of LapRap.KHE) {
  const sai = LapRap.DANH_MUC[khe].filter((d) => { const p = Part.lay(LOAI_PART[khe], d.part), ex = d.ma === 'tu' ? ['front_metal', 'front_pole'] : []; return !bang(d.ham, p.hamGoc.concat(ex)); });
  kiem('khe ' + khe + ': `ham` của từng mục đúng Part.hamGoc (cảm biến từ thêm front_metal / front_pole)', sai.length === 0, sai.map((d) => d.ma).join(','));
}
const hinhVe = doc('game/ve.js');
const iconCan = [...new Set(['than', 'tay', 'camBien'].flatMap((k) => LapRap.DANH_MUC[k].map((d) => d.icon)).concat(['xu', 'banhRang']))];
kiem('icon dùng trong thẻ part có trong ve.js (denBanh… denCam, xu, banhRang)', iconCan.every((i) => new RegExp('\\b' + i + ':\\s*\\[').test(hinhVe)), iconCan.filter((i) => !new RegExp('\\b' + i + ':\\s*\\[').test(hinhVe)).join(','));

/* ------------------------------------------------------------- 2. luật ghép */
console.log('2. luật ghép');
const TAYS = [null, ...LapRap.DANH_MUC.tay.map((d) => d.ma)], CAMS = [null, ...LapRap.DANH_MUC.camBien.map((d) => d.ma)], THANS = LapRap.DANH_MUC.than.map((d) => d.ma);
const manDo = { ma: 'tam.do', pin: 9, lapRap: { than: THANS, tay: TAYS.slice(1), camBien: CAMS.slice(1), nganSach: 99, cachLap: [] } };
let lech = [], soTo = 0, soDat = 0;
for (const th of THANS) for (const ta of TAYS) for (const cb of CAMS) {
  soTo++;
  const c = { than: th, tay: ta, camBien: cb }, r = LapRap.kiemGhep(c);
  let partOk = true, simOk = true, simLoi = '';
  try { Part.ghep(LapRap.cauHinhCua(c)); } catch (e) { partOk = false; }
  try {
    const goc = LapRap.tim('than', th).loai, ch = LapRap.cauHinhCua(c);
    const hg = new Set(Part.hamGoc(ch)); (cb && LapRap.tim('camBien', cb).hamThem || []).forEach((h) => hg.add(h));
    if (th !== 'drone') hg.delete('battery');
    const cam = ch.camBien.slice(); if (th === 'drone') cam.push({ ma: 'pin', o: 'than' });
    SanHoc.chay({ san: ['.....', '.....', '..F..'], batDau: { x: 2, y: 0, huong: 0 }, loaiRobot: goc, hamGoc: [...hg], camBien: cam, pin: th === 'drone' ? 9 : undefined }, 'wait()\n');
  } catch (e) { simOk = false; simLoi = e.message; }
  if (r.ok) soDat++;
  if (r.ok !== (partOk && simOk)) lech.push(th + '/' + ta + '/' + cb + ' bảng=' + r.ok + ' part=' + partOk + ' sim=' + simOk + ' ' + simLoi);
}
kiem('bảng luật khớp Part.ghep VÀ SanHoc.chay ở cả ' + soTo + ' tổ hợp (' + soDat + ' ghép được)', lech.length === 0, lech.slice(0, 3).join(' | '));
const gh = (th, ta, cb) => LapRap.kiemGhep({ than: th, tay: ta, camBien: cb });
const ca = [
  ['drone + tay kẹp: sai, lý do nhắc nam châm', gh('drone', 'kep', null), false, /nam châm/],
  ['drone + máy ném: sai', gh('drone', 'nem', null), false],
  ['drone + nam châm: được', gh('drone', 'nam-cham', null), true],
  ['drone + khoảng cách: sai (không có mặt trước)', gh('drone', null, 'khoang-cach'), false, /mặt trước/],
  ['drone + cảm biến từ: sai', gh('drone', null, 'tu'), false],
  ['drone + camera trước: sai', gh('drone', null, 'camera'), false],
  ['drone + màu bụng: được', gh('drone', null, 'mau'), true],
  ['drone + camera bụng: được', gh('drone', null, 'camera-bay'), true],
  ['drone + nam châm + camera bụng: được', gh('drone', 'nam-cham', 'camera-bay'), true],
  ['hai bánh + camera bụng: sai (chỉ drone)', gh('hai-banh', null, 'camera-bay'), false, /drone/],
  ['xích + camera bụng: sai', gh('xich', 'kep', 'camera-bay'), false],
  ['nhện + tay xoay: sai (không có hướng mặt)', gh('nhen', 'xoay', null), false, /hướng mặt/],
  ['nhện + nam châm: sai', gh('nhen', 'nam-cham', null), false],
  ['nhện + máy ném: sai', gh('nhen', 'nem', null), false],
  ['nhện + súng hơi: sai', gh('nhen', 'hoi', null), false],
  ['nhện + tay kẹp: được', gh('nhen', 'kep', null), true],
  ['nhện + khoảng cách: sai', gh('nhen', null, 'khoang-cach'), false],
  ['nhện + cảm biến từ: sai', gh('nhen', null, 'tu'), false],
  ['nhện + màu bụng: được', gh('nhen', null, 'mau'), true],
  ['nhện + camera trước: được', gh('nhen', null, 'camera'), true],
  ['omni + súng hơi + cảm biến từ: được', gh('omni', 'hoi', 'tu'), true],
  ['xích + tay xoay + camera: được', gh('xich', 'xoay', 'camera'), true],
  ['thiếu thân: sai', LapRap.kiemGhep({ tay: 'kep' }), false],
  ['mã thân lạ: sai', gh('xe-ba-gac', null, null), false]
];
for (const [ten, r, ok, re] of ca) kiem(ten, r.ok === ok && (!re || re.test(r.lyDo)), J(r));
kiem('ghép sai báo khe nào xung đột (xung)', J(gh('drone', 'kep', null).xung) === J(['than', 'tay']) && J(gh('nhen', null, 'tu').xung) === J(['than', 'camBien']));

/* --------------------------------------------------------- màn tạm 1: bậc thang */
const TIEN = ['left_move()', 'right_move()', 'wait()'];
const lap = (n, ds) => ['for i in range(' + n + '):'].concat(ds.map((s) => '    ' + s));
const XICH = lap(3, TIEN);                                                             // xích: đi thẳng qua bậc thang (3 nhịp)
const HAI_BANH = [].concat(['right_move()', 'wait()'], lap(2, TIEN), ['left_move()', 'wait()'], lap(3, TIEN), ['left_move()', 'wait()'], lap(2, TIEN));   // hai bánh: đi vòng bên trái (10 nhịp)
function manBac(them) {
  return ManHoc.chuanHoa(Object.assign({
    chuong: 'rap-nao', so: 1, ma: 'tam.bac', id: 'T.1', ten: 'Qua bậc thang (tạm)', hang: 'lam-quen', deBai: 'Tới cờ. Giữa đường có bậc thang.', cauTruc: ['for'],
    san: ['.....', '..F..', '.#S##', '.....', '.....'], batDau: { x: 2, y: 4, huong: 0 }, khung: { chinh: 30, moiHam: 10 }, moXuong: false, camHamCuaEm: true,
    maMau: { chinh: [] }, loiGiai: { chinh: XICH }, loiSai: [], sao: { o: 4, nhip: 3 },
    lapRap: {
      than: ['hai-banh', 'xich', 'omni', 'nhen'], tay: [], camBien: ['khoang-cach', 'mau'], nganSach: 3,
      cachLap: [
        { than: 'xich', tay: null, camBien: null, loiGiai: { chinh: XICH }, ghiChu: 'Leo thẳng qua bậc: nhanh, gọn, tốn 3 xu.' },
        { than: 'hai-banh', tay: null, camBien: null, loiGiai: { chinh: HAI_BANH }, ghiChu: 'Đi vòng bên trái: rẻ nhưng chậm.' }
      ]
    }
  }, them || {}));
}

/* -------------------------------------------------------------- 3. kiemCachLap */
console.log('3. kiemCachLap · dsCachLap');
const bac = manBac();
const kc = (c, m) => LapRap.kiemCachLap(m || bac, c);
let r = kc({ than: 'hai-banh' });
kiem('hai bánh một mình: hợp lệ, giá 2', r.ok && r.gia === 2 && r.lyDo === '', J(r));
r = kc({ than: 'xich' });
kiem('xích: hợp lệ, giá 3 (vừa đủ ngân sách 3)', r.ok && r.gia === 3, J(r));
r = kc({ than: 'hai-banh', camBien: 'khoang-cach' });
kiem('hai bánh + khoảng cách: 3 xu, vừa đủ', r.ok && r.gia === 3, J(r));
r = kc({ than: 'xich', camBien: 'khoang-cach' });
kiem('xích + khoảng cách: 4 xu → vượt ngân sách, thiếu 1 xu', !r.ok && r.ma === 'vuot-ngan-sach' && r.thieu === 1 && /Thiếu 1 xu/.test(r.lyDo) && r.gia === 4, J(r));
r = kc({ than: 'omni' });
kiem('omni 4 xu → thiếu 1 xu', !r.ok && r.ma === 'vuot-ngan-sach' && r.thieu === 1, J(r));
r = kc({ than: 'hai-banh', tay: 'kep' });
kiem('màn không có khe tay mà gắn tay kẹp → không cho (khong-cho), lý do nói không có khe tay', !r.ok && r.ma === 'khong-cho' && /khe tay/.test(r.lyDo), J(r));
r = kc({ than: 'drone' });
kiem('thân drone ngoài danh sách màn → khong-cho', !r.ok && r.ma === 'khong-cho', J(r));
r = kc({ than: 'hai-banh', camBien: 'camera' });
kiem('cảm biến ngoài danh sách màn (camera) → khong-cho', !r.ok && r.ma === 'khong-cho', J(r));
r = kc({});
kiem('chưa chọn thân → thieu-khe', !r.ok && r.ma === 'thieu-khe', J(r));
r = kc({ than: 'hai-banh', camBien: ['khoang-cach'] });
kiem('khe nhận cả mảng một phần tử', r.ok && r.gia === 3, J(r));
kiem('bí danh giá (có dấu) trả cùng số với gia', kc({ than: 'xich' })['giá'] === 3 && !Object.keys(kc({ than: 'xich' })).includes('giá'));
// phaiCo: khe bắt buộc
const manDu = (them) => ({ ma: 'tam.du', lapRap: Object.assign({ than: ['hai-banh', 'drone'], tay: ['kep', 'nam-cham'], camBien: ['mau', 'camera-bay'], nganSach: 9, phaiCo: ['tay'], cachLap: [] }, them || {}) });
r = kc({ than: 'hai-banh' }, manDu());
kiem('phaiCo [tay]: thiếu tay → thieu-khe, nói cần gắn khe tay', !r.ok && r.ma === 'thieu-khe' && /khe tay/.test(r.lyDo), J(r));
r = kc({ than: 'hai-banh', tay: 'kep' }, manDu());
kiem('phaiCo [tay]: có tay → hợp lệ (não vẫn có thể trống)', r.ok && r.gia === 4, J(r));
r = kc({ than: 'drone', tay: 'kep' }, manDu());
kiem('drone + tay kẹp: ghep-sai kể cả khi trong danh sách màn', !r.ok && r.ma === 'ghep-sai', J(r));
r = kc({ than: 'drone', tay: 'nam-cham', camBien: 'camera-bay' }, manDu({ nganSach: 11 }));
kiem('drone + nam châm + camera bụng: 5 + 3 + 2 = 10 xu', r.ok && r.gia === 10, J(r));
r = kc({ than: 'drone', tay: 'nam-cham', camBien: 'camera-bay' }, manDu({ nganSach: 9 }));
kiem('cùng cách ấy với ngân sách 9: thiếu 1 xu', !r.ok && r.thieu === 1, J(r));
kiem('màn không phải màn lắp ráp: kiemCachLap không ok', !LapRap.kiemCachLap({ ma: 'x' }, { than: 'hai-banh' }).ok);

// dsCachLap: đếm độc lập
let ds = LapRap.dsCachLap(bac);
kiem('dsCachLap màn bậc thang (ngân sách 3): đúng 3 cách = hai bánh (2) · hai bánh + khoảng cách (3) · xích (3)', ds.length === 3 && J(ds.map((x) => x.gia)) === J([2, 3, 3]) && ds[0].than === 'hai-banh' && !ds[0].camBien, J(ds));
kiem('dsCachLap xếp theo giá tăng dần, mỗi mục có than / tay / camBien / gia', ds.every((x, i) => ('than' in x) && ('tay' in x) && ('camBien' in x) && (i === 0 || ds[i - 1].gia <= x.gia)));
const manLon = { ma: 'tam.lon', lapRap: { than: ['hai-banh', 'nhen', 'drone'], tay: ['kep', 'nam-cham', 'xoay', 'nem'], camBien: ['mau', 'camera', 'camera-bay', 'tu', 'khoang-cach'], nganSach: 99, cachLap: [] } };
// đếm tay: hai bánh 5 tay × 5 não (bỏ camera-bay) = 25 · nhện {không, kẹp} × {không, màu, camera} = 6 · drone {không, nam châm} × {không, màu, camera bụng} = 6
kiem('dsCachLap màn lớn (3 thân, 4 tay, 5 não, ngân sách thừa): đúng 37 cách', LapRap.dsCachLap(manLon).length === 37, String(LapRap.dsCachLap(manLon).length));
function demTay(nganSach) {                                                            // đếm lại độc lập bằng luật viết tay và bảng giá của kế hoạch
  let n = 0;
  const camOk = { 'hai-banh': [null, 'mau', 'camera', 'tu', 'khoang-cach'], nhen: [null, 'mau', 'camera'], drone: [null, 'mau', 'camera-bay'] };
  const tayOk = { 'hai-banh': [null, 'kep', 'nam-cham', 'xoay', 'nem'], nhen: [null, 'kep'], drone: [null, 'nam-cham'] };
  for (const th of Object.keys(camOk)) for (const ta of tayOk[th]) for (const cb of camOk[th])
    if (GIA.than[th] + (ta ? GIA.tay[ta] : 0) + (cb ? GIA.camBien[cb] : 0) <= nganSach) n++;
  return n;
}
for (const ns of [2, 4, 6, 8]) kiem('dsCachLap màn lớn, ngân sách ' + ns + ': ' + demTay(ns) + ' cách (đếm tay)', LapRap.dsCachLap(Object.assign({}, manLon, { lapRap: Object.assign({}, manLon.lapRap, { nganSach: ns }) })).length === demTay(ns), String(LapRap.dsCachLap(Object.assign({}, manLon, { lapRap: Object.assign({}, manLon.lapRap, { nganSach: ns }) })).length));
kiem('dsCachLap màn có phaiCo [tay]: không cách nào thiếu tay', LapRap.dsCachLap(manDu()).length > 0 && LapRap.dsCachLap(manDu()).every((x) => x.tay));
kiem('dsCachLap: mọi cách liệt kê đều qua kiemCachLap', ds.every((x) => LapRap.kiemCachLap(bac, x).ok) && LapRap.dsCachLap(manLon).every((x) => LapRap.kiemCachLap(manLon, x).ok));
kiem('dsCachLap: ngân sách 0 hay màn thường → không cách nào', LapRap.dsCachLap({ ma: 'x' }).length === 0);

/* -------------------------------------------------------------------- 4. apDung */
console.log('4. apDung');
const mDrone = { ma: 'tam.dr', ten: 'x', pin: 12, san: ['..'], lapRap: { than: ['hai-banh', 'drone'], tay: ['nam-cham', 'kep'], camBien: ['mau', 'camera-bay', 'khoang-cach', 'tu'], nganSach: 20, cachLap: [] } };
let a = LapRap.apDung(mDrone, { than: 'hai-banh', tay: 'kep', camBien: 'mau' });
kiem('hai bánh + kẹp + màu: loaiRobot banh, robot đúng', a.loaiRobot === 'banh' && J(a.robot) === J({ than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'mau', o: 'hong' }] }), J(a.robot));
kiem('hamGoc = bốn lệnh bánh + wait + bốn lệnh kẹp + color', bang(a.hamGoc, ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'color']), a.hamGoc.join(','));
kiem('thân khác drone: bỏ pin của màn (lõi ném lỗi nếu còn), không có battery', !('pin' in a) && !a.hamGoc.includes('battery'));
kiem('apDung không đổi màn gốc (không hamGoc / robot, vẫn còn pin)', !('hamGoc' in mDrone) && !('robot' in mDrone) && !('loaiRobot' in mDrone) && mDrone.pin === 12);
kiem('bản áp dụng giữ lapRap, trỏ về màn gốc (manGoc) và cách đã chọn', a.lapRap === mDrone.lapRap && a.manGoc === mDrone && J(a.cachLapDaChon) === J({ than: 'hai-banh', tay: 'kep', camBien: 'mau' }));
a = LapRap.apDung(mDrone, { than: 'drone', tay: 'nam-cham', camBien: 'camera-bay' });
kiem('drone + nam châm + camera bụng: loaiRobot drone, giữ pin 12', a.loaiRobot === 'drone' && a.pin === 12);
kiem('drone có pin: hamGoc có battery, magnet_*, look, go_*, wait; camBien thêm { pin, than }', bang(a.hamGoc, ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'battery', 'magnet_n', 'magnet_s', 'magnet_off', 'look']) && J(a.robot.camBien) === J([{ ma: 'camera-bay', o: 'bung' }, { ma: 'pin', o: 'than' }]), a.hamGoc.join(',') + ' ' + J(a.robot.camBien));
a = LapRap.apDung(Object.assign({}, mDrone, { pin: undefined }), { than: 'drone' });
kiem('drone KHÔNG có pin ở màn: không battery, không camBien pin', !a.hamGoc.includes('battery') && J(a.robot.camBien) === '[]' && bang(a.hamGoc, ['go_up', 'go_down', 'go_left', 'go_right', 'wait']), a.hamGoc.join(','));
a = LapRap.apDung(mDrone, { than: 'omni', tay: null, camBien: 'tu' });
kiem('omni + cảm biến từ: có front_clear / left_clear / right_clear + front_metal / front_pole, bánh + trượt', bang(a.hamGoc, ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'front_clear', 'left_clear', 'right_clear', 'front_metal', 'front_pole']) && a.loaiRobot === 'omni' && a.robot.camBien[0].ma === 'khoang-cach', a.hamGoc.join(','));
a = LapRap.apDung(mDrone, { than: 'nhen', tay: 'kep', camBien: null });
kiem('nhện + kẹp: loaiRobot nhen, có crouch / stand / go_*', a.loaiRobot === 'nhen' && ['crouch', 'stand', 'go_up', 'go_left', 'arm_down', 'wait'].every((h) => a.hamGoc.includes(h)), a.hamGoc.join(','));
let nem = false; try { LapRap.apDung(mDrone, { than: 'drone', tay: 'kep' }); } catch (e) { nem = /nam châm/.test(e.message); }
kiem('ghép sai thì apDung ném lỗi tiếng Việt (drone + tay kẹp)', nem);
a = LapRap.apDung(mDrone, { than: 'xich', loiGiai: { chinh: ['wait()'] } });
kiem('apDung chép lời giải của cách mẫu vào loiGiai (chinh, hamCuaMan, hamCuaEmMoi)', J(a.loiGiai) === J({ chinh: ['wait()'], hamCuaMan: [], hamCuaEmMoi: [] }));
// hamGoc của mọi cách hợp lệ nằm trọn trong những gì lõi chấp nhận (SanHoc.chay không ném)
let loiChay = [];
for (const th of THANS) for (const ta of TAYS) for (const cb of CAMS) {
  const c = { than: th, tay: ta, camBien: cb };
  if (!LapRap.kiemGhep(c).ok) continue;
  try {
    const m = LapRap.apDung(Object.assign({}, manDo, { san: ['.....', '.....', '..F..'], batDau: { x: 2, y: 0, huong: 0 } }), c);
    SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: m.loaiRobot, hamGoc: m.hamGoc, camBien: m.robot.camBien, pin: m.pin, phanCung: SanHoc.phanCungCua(m) }, 'wait()\n');
  } catch (e) { loiChay.push(th + '/' + ta + '/' + cb + ': ' + e.message); }
}
kiem('mọi cách hợp lệ: bản apDung chạy được trong SanHoc.chay (hamGoc, camBien, pin khớp lõi)', loiChay.length === 0, loiChay.slice(0, 2).join(' | '));

/* ------------------------------------------------- 5. chấm thắng bằng hai cách */
console.log('5. chấm một màn tạm bằng hai cách lắp');
const mx = LapRap.apDung(bac, bac.lapRap.cachLap[0]), mh = LapRap.apDung(bac, bac.lapRap.cachLap[1]);
const rx = ChamHoc.cham(mx, { chinh: XICH, hamCuaMan: [] }, []), rh = ChamHoc.cham(mh, { chinh: HAI_BANH, hamCuaMan: [] }, []);
kiem('cách 1 (xích, đi thẳng qua bậc): thắng 3 nhịp, 4 ô, 3 sao', rx.thang && rx.soNhip === 3 && rx.soO === 4 && rx.sao === 3, J({ t: rx.thang, n: rx.soNhip, o: rx.soO, s: rx.sao }));
kiem('cách 2 (hai bánh, đi vòng): thắng 10 nhịp, 18 ô, chỉ 1 sao (đánh đổi)', rh.thang && rh.soNhip === 10 && rh.soO === 18 && rh.sao === 1, J({ t: rh.thang, n: rh.soNhip, o: rh.soO, s: rh.sao }));
const sai = ChamHoc.cham(mh, { chinh: XICH, hamCuaMan: [] }, []);
kiem('lời giải của xích trượt trên hai bánh: đâm bậc thang, chưa tới cờ', !sai.thang && sai.chanDoan.some((c) => c.ma === 'dam-tuong'), J(sai.chanDoan.map((c) => c.ma)));
kiem('apDung bản có loiGiai: chạy lời giải của chính cách mẫu thắng', ChamHoc.cham(LapRap.apDung(bac, bac.lapRap.cachLap[0]), { chinh: LapRap.apDung(bac, bac.lapRap.cachLap[0]).loiGiai.chinh, hamCuaMan: [] }, []).thang);
const tk = LapRap.thongKeMau(bac);
kiem('thongKeMau: hai dòng, thắng cả hai, nhịp 3 / 10, ô 4 / 18, giá 3 / 2, tên part', tk.length === 2 && tk.every((x) => x.thang) && J(tk.map((x) => [x.gia, x.nhip, x.o])) === J([[3, 3, 4], [2, 10, 18]]) && tk[0].ten === 'Bánh xích' && tk[1].ten === 'Hai bánh', J(tk));
kiem('thongKeMau mang theo ghiChu của cách mẫu', tk[0].ghiChu === bac.lapRap.cachLap[0].ghiChu && tk[1].ghiChu !== '');
kiem('hai cách mẫu: không cách nào hơn hẳn cách kia ở cả giá, nhịp lẫn ô', LapRap.cachBiHonHan(tk).length === 0, J(LapRap.cachBiHonHan(tk)));
kiem('honHan nhận ra cách hơn hẳn (rẻ hơn, nhanh hơn, gọn hơn)', LapRap.honHan({ gia: 2, nhip: 3, o: 4 }, { gia: 3, nhip: 3, o: 5 }) && !LapRap.honHan({ gia: 2, nhip: 3, o: 4 }, { gia: 2, nhip: 3, o: 4 }) && !LapRap.honHan({ gia: 3, nhip: 3, o: 4 }, { gia: 2, nhip: 10, o: 18 }));
kiem('cachBiHonHan bắt cặp: thêm một cách tệ hơn hẳn thì báo', LapRap.cachBiHonHan(tk.concat([{ gia: 4, nhip: 11, o: 19, thang: true }])).length === 2);
// hai cách có thể chơi từ giao diện: ngân sách đủ cho cả hai
kiem('hai cách mẫu đều nằm trong dsCachLap của màn', bac.lapRap.cachLap.every((cl) => LapRap.dsCachLap(bac).some((x) => x.than === cl.than && x.tay === (cl.tay || null) && x.camBien === (cl.camBien || null))));

/* ------------------------------------------------ bản mặc định (chuanHoa) + kiemCanMan */
console.log('5b. bản mặc định của màn lắp ráp · kiemCanMan');
const clone = (m, sua) => { const c = Object.assign({}, m, { lapRap: Object.assign({}, m.lapRap) }); sua(c.lapRap); return c; };
const mDef = ManHoc.chuanHoa({ chuong: 'rap-nao', so: 3, ma: 'tam.def', ten: 'x', hang: 'lam-quen', deBai: 'x', cauTruc: ['for'], san: ['..F'], batDau: { x: 0, y: 0, huong: 1 }, maMau: { chinh: [] }, loiSai: [], sao: { o: 4, nhip: 3 },
  lapRap: { than: ['hai-banh', 'xich'], tay: [], camBien: [], nganSach: 3, cachLap: [{ than: 'xich', loiGiai: { chinh: ['wait()'] } }, { than: 'hai-banh', loiGiai: { chinh: ['wait()'] } }] } });
kiem('ManHoc.chuanHoa điền robot mặc định theo cachLap[0] khi màn không khai (loaiRobot, robot, hamGoc, loiGiai)', mDef.loaiRobot === 'xich' && J(mDef.robot) === J({ than: 'xich', tay: null, camBien: [] }) && bang(mDef.hamGoc, ['left_move', 'right_move', 'left_back', 'right_back', 'wait']) && J(mDef.loiGiai.chinh) === J(['wait()']) && J(mDef.loiGiai.hamCuaEmMoi) === '[]', J({ l: mDef.loaiRobot, r: mDef.robot, g: mDef.hamGoc }));
const mDef2 = ManHoc.chuanHoa({ chuong: 'rap-nao', so: 4, ma: 'tam.def2', ten: 'x', hang: 'lam-quen', deBai: 'x', cauTruc: [], san: ['..F'], batDau: { x: 0, y: 0, huong: 1 }, maMau: { chinh: [] }, loiSai: [], loiGiai: { chinh: ['tu_khai()'] }, hamGoc: ['wait'], loaiRobot: 'banh',
  lapRap: { than: ['hai-banh'], tay: [], camBien: [], nganSach: 3, cachLap: [{ than: 'hai-banh', loiGiai: { chinh: ['wait()'] } }, { than: 'xich', loiGiai: { chinh: ['wait()'] } }] } });
kiem('macDinh không ghi đè trường màn đã khai (hamGoc, loaiRobot, loiGiai)', J(mDef2.hamGoc) === J(['wait']) && mDef2.loaiRobot === 'banh' && J(mDef2.loiGiai.chinh) === J(['tu_khai()']) && mDef2.robot.than === 'hai-banh');
kiem('màn thường (không lapRap): chuanHoa không đụng tới robot', !('robot' in ManHoc.chuanHoa({ chuong: 'rap-nao', so: 5, ma: 'tam.th', ten: 'x', hang: 'lam-quen', deBai: 'x', cauTruc: [], san: ['..F'], batDau: { x: 0, y: 0, huong: 1 }, maMau: { chinh: [] }, loiSai: [], loiGiai: { chinh: [] } })));
kiem('màn tạm bậc thang (chuanHoa): bản mặc định chấm thắng 3 sao bằng lời giải của cachLap[0], bản apDung cách 2 cũng thắng', ChamHoc.cham(bac, { chinh: bac.loiGiai.chinh, hamCuaMan: [] }, []).sao === 3 && bac.loaiRobot === 'xich');
kiem('kiemCanMan: màn tạm bậc thang ổn (dữ liệu, cả hai cách thắng, cachLap[0] ba sao, không cách hơn hẳn)', LapRap.kiemCanMan(bac).length === 0, J(LapRap.kiemCanMan(bac)));
const canLoi = (sua) => LapRap.kiemCanMan(clone(bac, sua));
kiem('kiemCanMan bắt: cachLap[0] không đạt 3 sao (cách chậm đứng đầu)', canLoi((L) => { L.cachLap = [L.cachLap[1], L.cachLap[0]]; }).some((x) => /3 sao/.test(x)), J(canLoi((L) => { L.cachLap = [L.cachLap[1], L.cachLap[0]]; })));
kiem('kiemCanMan bắt: một cách mẫu không thắng (lời giải sai)', canLoi((L) => { L.cachLap = [L.cachLap[0], Object.assign({}, L.cachLap[1], { loiGiai: { chinh: XICH } })]; }).some((x) => /không thắng/.test(x)));
kiem('kiemCanMan bắt: cách mẫu vô dụng (đắt hơn, chậm hơn, dài hơn hẳn)', canLoi((L) => { L.nganSach = 4; L.cachLap = L.cachLap.concat([{ than: 'hai-banh', camBien: 'khoang-cach', loiGiai: { chinh: HAI_BANH.concat(['wait()']) } }]); }).some((x) => /hơn hẳn/.test(x)), J(canLoi((L) => { L.nganSach = 4; L.cachLap = L.cachLap.concat([{ than: 'hai-banh', camBien: 'khoang-cach', loiGiai: { chinh: HAI_BANH.concat(['wait()']) } }]); })));
kiem('kiemCanMan trả lỗi dữ liệu trước khi chấm (chỉ một cách mẫu)', canLoi((L) => { L.cachLap = L.cachLap.slice(0, 1); }).some((x) => /ít nhất 2/.test(x)));

/* --------------------------------------------------------------- 6. kiemDuLieu */
console.log('6. kiemDuLieu · tiện ích');
kiem('màn tạm đúng dữ liệu: kiemDuLieu rỗng', LapRap.kiemDuLieu(bac).length === 0, J(LapRap.kiemDuLieu(bac)));
const loi = (sua) => LapRap.kiemDuLieu(clone(bac, sua));
kiem('bắt: chỉ 1 cách mẫu', loi((L) => { L.cachLap = L.cachLap.slice(0, 1); }).some((s) => /ít nhất 2/.test(s)));
kiem('bắt: cách mẫu vượt ngân sách', loi((L) => { L.cachLap = L.cachLap.concat([{ than: 'omni', loiGiai: { chinh: [] } }]); }).some((s) => /Thiếu 1 xu/.test(s)));
kiem('bắt: mã part lạ', loi((L) => { L.than = ['hai-banh', 'ba-gac']; }).some((s) => /mã lạ/.test(s)));
kiem('bắt: ngân sách thiếu hay không nguyên', loi((L) => { L.nganSach = 0; }).some((s) => /nganSach/.test(s)) && loi((L) => { L.nganSach = 2.5; }).some((s) => /nganSach/.test(s)));
kiem('bắt: cách mẫu thiếu lời giải', loi((L) => { L.cachLap = [L.cachLap[0], { than: 'hai-banh' }]; }).some((s) => /loiGiai/.test(s)));
kiem('bắt: hai cách mẫu trùng nhau', loi((L) => { L.cachLap = [L.cachLap[0], Object.assign({}, L.cachLap[0])]; }).some((s) => /trùng/.test(s)));
kiem('bắt: cách mẫu ngoài danh sách màn cho (camera)', loi((L) => { L.cachLap = [L.cachLap[0], { than: 'hai-banh', camBien: 'camera', loiGiai: { chinh: [] } }]; }).some((s) => /không cho dùng/.test(s)));
kiem('bắt: phaiCo nhắc khe màn không có', loi((L) => { L.phaiCo = ['tay']; }).some((s) => /phaiCo/.test(s)));
kiem('bắt: màn không có lapRap', LapRap.kiemDuLieu({ ma: 'x' }).length === 1);
kiem('cachMacDinh: thân đầu tiên, khe khác trống; có phaiCo thì lấy part đầu của khe đó', J(LapRap.cachMacDinh(bac)) === J({ than: 'hai-banh', tay: null, camBien: null }) && J(LapRap.cachMacDinh(manDu())) === J({ than: 'hai-banh', tay: 'kep', camBien: null }));
kiem('dsKhe: ẩn khe tay khi lapRap.tay rỗng', J(LapRap.dsKhe(bac)) === J(['than', 'camBien']) && J(LapRap.dsKhe(manLon)) === J(['than', 'tay', 'camBien']) && J(LapRap.dsKhe({ ma: 'x' })) === '[]');
kiem('moTa nối tên part: "Hai bánh + Tay kẹp + Màu bụng"', LapRap.moTa({ than: 'hai-banh', tay: 'kep', camBien: 'mau' }) === 'Hai bánh + Tay kẹp + Màu bụng' && LapRap.moTa({ than: 'xich' }) === 'Bánh xích');
const mHong = LapRap.apDung(mDrone, { than: 'hai-banh', tay: 'kep' });
const lk = LapRap.lenhKhongCon(LapRap.apDung(mDrone, { than: 'hai-banh' }), ['left_move()', 'arm_down()', '# grab()', '  grab()', 'x = color()', 'wait()', 'my_func()']);
kiem('lenhKhongCon: chỉ ra dòng gọi lệnh của part đã tháo (bỏ chú thích; wait và hàm tự đặt không tính)', J([...lk]) === J([1, 3, 4]) && J(lk.ten) === J(['arm_down', 'grab', 'color']), J([...lk]) + ' ' + J(lk.ten));
kiem('lenhKhongCon: robot còn đủ lệnh thì không dòng nào', LapRap.lenhKhongCon(mHong, ['arm_down()', 'left_move()', 'grab()']).length === 0);

/* ------------------------------------------------------------- 7. giao diện */
console.log('7. giao diện (tệp)');
const html = doc('game/choi.html'), chu = doc('game/chu.js'), luu = doc('game/luu.js'), ung = doc('game/ung-dung.js'), mc = doc('game/man-choi.js'), css = doc('game/choi.css');
const lap7 = fs.existsSync(path.join(day, 'game/man-lap.js')) ? doc('game/man-lap.js') : '';
kiem('choi.html: có màn sc-lap, nạp lap-rap.js (TRƯỚC các tệp màn: chuanHoa cần nó) và man-lap.js (sau man-choi.js)', /id="sc-lap"/.test(html) && /src="\.\.\/lap-rap\.js"/.test(html) && /src="man-lap\.js"/.test(html) && html.indexOf('lap-rap.js') < html.indexOf('man-chuoi-1.js') && html.indexOf('man-lap.js') > html.indexOf('man-choi.js'));
kiem('ung-dung.js: màn hình lap, App.vaoMan mở màn Lắp robot trước, App.lapLai', /lap:\s*'sc-lap'/.test(ung) && /m\.lapRap/.test(ung) && /App\.lapLai\s*=/.test(ung) && /LapRobot\.vao/.test(ung));
kiem('luu.js: Luu.docLap / ghiLap / xoaLap (khóa duong-hoc:lap:<mã màn>)', /duong-hoc:lap:/.test(luu) && /docLap/.test(luu) && /ghiLap/.test(luu) && /xoaLap/.test(luu));
const khoaChu = ['lap.tieuDe', 'lap.ve', 'lap.deBai', 'lap.xong', 'lap.xongThieu', 'lap.xongCan', 'lap.lapLai', 'lap.lapLaiNhan', 'lap.khe.than', 'lap.khe.tay', 'lap.khe.camBien', 'lap.khongGan', 'lap.khongGanMoTa', 'lap.xuCon', 'lap.xuThieu', 'lap.thieu', 'lap.chonThe', 'lap.boTruoc', 'lap.doiThan', 'lap.lenhMat', 'thang.cachKhac', 'thang.cachEm', 'thang.cachSo', 'thang.cachChua', 'thang.lapLai'];
kiem('chu.js: đủ chữ lap.* và bảng thắng (' + khoaChu.length + ' khóa)', khoaChu.every((k) => chu.includes("'" + k + "'")), khoaChu.filter((k) => !chu.includes("'" + k + "'")).join(','));
kiem('man-choi.js: nút Lắp lại (chỉ màn lắp ráp), vao nhận cách lắp, bảng thắng có "Cách lắp khác" từ thongKeMau', /data-nut="lap-lai"/.test(mc) && /LapRap\.apDung/.test(mc) && /thang\.cachKhac/.test(mc) && /thongKeMau/.test(mc));
kiem('man-lap.js: dùng LapRap.kiemGhep (thẻ mờ), kiemCachLap (khóa Lắp xong), VeRobot.ve (hình robot ghép)', /LapRap\.kiemGhep/.test(lap7) && /LapRap\.kiemCachLap/.test(lap7) && /VeRobot\.ve/.test(lap7));
kiem('choi.css: có kiểu màn Lắp robot (#sc-lap, .lr-the)', /#sc-lap/.test(css) && /\.lr-the/.test(css));

console.log('\nĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);

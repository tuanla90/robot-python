/* ============================================================================
   kiem-drone.mjs — máy kiểm chương `drone` (Drone) của "Học lập trình".
   Gồm: bay bốn hướng (mỗi lệnh 1 nhịp, tự trôi nhịp, không cần wait()), bay qua hàng rào / băng chuyền / vật / thùng nặng / bậc thang, bị tường cao / mép sân / cửa đóng / nút chặn,
   băng không đẩy drone, vật không bị đẩy hay chiếm ô với drone, PIN (trừ mỗi nhịp kể cả wait() và nhịp đâm tường, hết pin, đến cờ đúng nhịp pin về 0, ô sạc P, battery() không tốn nhịp),
   NAM CHÂM TREO (hút vật sắt ở ô DƯỚI drone, vật gỗ không hút, thả xuống ô dưới, thả bị chặn, thứ tự trong nhịp, gộp lệnh nam châm với lệnh bay), color() khi đang dính vật,
   go(d) / walk(path) của chương nhện chạy trên drone, thân không hợp (tay kẹp, tấm đẩy, máy ném, súng bóng, cảm biến khoảng cách, battery cho xe) bị từ chối, sân thử của Xưởng (pin, ô sạc),
   chẩn đoán tiếng Việt CÓ `cho` (het-pin, drone-khong-bay, tha-bi-chan / hut-go lời cho drone), bộ dò đường tắt có pin (BFS có giới hạn; so chéo ngẫu nhiên với san-hoc.js),
   dữ liệu 10 màn (BFS tách nhịp = sao.nhip, BFS gộp <= sao.nhip) và bảng 10 màn.
   Các kiểm chung cho cả 170 màn (đi tuần tự, sao, lời sai, đường tắt BFS…) nằm ở kiem-hoc.mjs.
   Chạy: node hoc/kiem-drone.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
for (const f of ['man-chuoi-2', 'man-tay-gap', 'man-vong-lap', 'man-bang-chuyen', 'man-tham-so', 'man-nhen', 'man-xich', 'man-omni', 'man-khoang-cach', 'man-mau', 'man-nam-cham', 'man-may-nem']) require(path.join(day, f + '.js'));
const ManHoc = require(path.join(day, 'man-drone.js'));
const BoDo = await import('./do-duong-drone.mjs');
const { nhipDroneNganNhat, nhipDroneTatCa, buocMotNhip, dungNguCanh, trangThaiDau, laThang, chuoiThanhMa, hanhDongTuDo } = BoDo;

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const maSK = (kq, ma) => kq.suKien.filter((e) => e.ma === ma);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
/** Sự kiện của vết nhịp (di, bay-qua, sac-pin, hut-vat…; khác maSK là các mốc chẩn đoán). */
const ev = (kq, ma) => nhipVet(kq).flatMap((n) => n.suKien).filter((e) => e.ma === ma);
const L = (...d) => d.join('\n') + '\n';
const loi = (f) => { try { f(); return null; } catch (e) { return e.message; } };
const VEC = SanHoc.VEC;

const ds = ManHoc.danhSach.filter((m) => m.chuong === 'drone');
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
const man = (so) => ManHoc.timMa('drone.' + so);
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const bdCua = (m) => (Array.isArray(m.batDau) ? m.batDau : sanCua(m).map(() => m.batDau));

const BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
const NC = ['magnet_n', 'magnet_s', 'magnet_off'];
function chay(rows, bd, code, extra) {
  extra = extra || {};
  const hamGoc = BAY.concat(NC, ['color'], extra.pin !== undefined ? ['battery'] : []);
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'drone', hamGoc }, extra), code);
}
const UP = 'go_up()\n', DOWN = 'go_down()\n', LEFT = 'go_left()\n', RIGHT = 'go_right()\n', WAIT = 'wait()\n';
const ON = L('magnet_n()', 'wait()'), OFF = L('magnet_off()', 'wait()');
const trong = (n, c = '.') => Array.from({ length: n }, () => c.repeat(n));
const dat1 = (rows, x, y, ch) => rows.map((r, j) => (j === y ? r.slice(0, x) + ch + r.slice(x + 1) : r));
const BD = { x: 2, y: 2, huong: 0 };
const vatTai = (kq, x, y) => kq.vat.find((v) => v.x === x && v.y === y && v.trangThai === 'dat');

/* ============================================================================ 1. BAY BỐN HƯỚNG */
console.log('\n== 1. go_*(): bay 1 ô mỗi lệnh, 1 nhịp, tự trôi nhịp; wait() lơ lửng ==');
{
  let dung = 0; const sai = [];
  const lenh = ['go_up', 'go_right', 'go_down', 'go_left'];
  for (let h = 0; h < 4; h++) {
    const kq = chay(trong(5), BD, lenh[h] + '()\n');
    const ok = kq.nhip === 1 && kq.robot.x === 2 + VEC[h][0] && kq.robot.y === 2 + VEC[h][1] && kq.loi === null && kq.lenhTon.length === 0 && ev(kq, 'di').length === 1;
    if (ok) dung++; else sai.push(h + ':' + J(kq.robot));
  }
  kiem('go_up / go_right / go_down / go_left: mỗi lệnh bay đúng 1 ô và tốn đúng 1 nhịp, KHÔNG cần wait() (không còn lệnh treo)', dung === 4, sai.join(' | '));
  const k2 = chay(trong(5), BD, RIGHT + RIGHT + UP);
  kiem('ba lệnh liền nhau = 3 nhịp, tới (4, 1); vết có robot.x / y từng nhịp', k2.nhip === 3 && k2.robot.x === 4 && k2.robot.y === 1 && J(nhipVet(k2).map((n) => [n.robot.x, n.robot.y])) === J([[3, 2], [4, 2], [4, 1]]));
  const k3 = chay(trong(5), BD, WAIT + WAIT + RIGHT);
  kiem('wait() = 1 nhịp lơ lửng đứng yên (sự kiện dung-yen); drone không có hướng mặt: huong luôn là hướng ban đầu', k3.nhip === 3 && k3.robot.x === 3 && nhipVet(k3).every((n) => n.robot.huong === 0) && ev(k3, 'dung-yen').length === 2);
  const k4 = chay(trong(5), { x: 0, y: 0, huong: 2 }, RIGHT + DOWN + LEFT);
  kiem('huong ban đầu không ảnh hưởng: đi theo hướng TUYỆT ĐỐI theo màn hình (batDau.huong 2 vẫn go_right sang phải)', k4.robot.x === 0 && k4.robot.y === 1 && nhipVet(k4)[0].robot.x === 1);
  const k5 = chay(['..F'], { x: 0, y: 0, huong: 0 }, RIGHT + RIGHT + RIGHT);
  kiem('tới cờ thì thắng ngay (dừng ở nhịp đó, lệnh sau không chạy)', k5.thang && k5.nhip === 2);
  kiem('hamGoc của drone: go_up, go_down, go_left, go_right, wait; nhện cùng bộ lệnh đi (và thêm crouch, stand cho chân); xe bánh không có go_*', J(SanHoc.HAM_GOC.drone) === J(SanHoc.HAM_GOC.nhen.slice(0, 5)) && J(SanHoc.HAM_GOC.nhen.slice(5)) === '["crouch","stand"]' && J(SanHoc.HAM_GOC.drone) === J(BAY) && SanHoc.HAM_GOC.banh.indexOf('go_up') < 0);
  const nhen = SanHoc.chay({ san: trong(5), batDau: BD, loaiRobot: 'nhen' }, RIGHT + RIGHT);
  const dr = SanHoc.chay({ san: trong(5), batDau: BD, loaiRobot: 'drone' }, RIGHT + RIGHT);
  kiem('so với nhện: cùng hai lệnh, nhện mất 4 nhịp, drone mất 2 nhịp (nhanh gấp đôi)', nhen.nhip === 4 && dr.nhip === 2 && nhen.robot.x === dr.robot.x);
}

/* ============================================================================ 2. BAY QUA, BỊ CHẶN */
console.log('\n== 2. Bay qua rào / băng / vật / thùng / bậc thang; chặn bởi tường cao / mép sân / cửa đóng / nút; băng không đẩy ==');
{
  const SAN = (ch) => dat1(trong(5), 3, 2, ch);
  let ok1 = 0; const loai1 = ['=', '>', '<', '^', 'v', 'S', 'P', 'r', 'D', 'F'];
  for (const ch of loai1) {
    const kq = chay(SAN(ch), BD, RIGHT + RIGHT);
    if (kq.robot.x === 4 && kq.nhip >= 1 && maSK(kq, 'dam-tuong').length === 0 || (ch === 'F' && kq.thang)) ok1++;
  }
  kiem('bay QUA hàng rào, băng chuyền (bốn chiều), bậc thang, ô sạc, sàn màu, ô đích, cờ: không đâm (' + loai1.length + ' loại ô)', ok1 === loai1.length, ok1 + '/' + loai1.length);
  const kRao = chay(SAN('='), BD, RIGHT);
  kiem('trên ô hàng rào: sự kiện bay-qua { o, tren ["rao"] } cho giao diện vẽ bóng; trên băng ["bang"], bậc thang ["bac-thang"]', J(ev(kRao, 'bay-qua').map((e) => e.tren)) === '[["rao"]]' && ev(kRao, 'bay-qua')[0].o.x === 3 &&
    J(ev(chay(SAN('^'), BD, RIGHT), 'bay-qua').map((e) => e.tren)) === '[["bang"]]' && J(ev(chay(SAN('S'), BD, RIGHT), 'bay-qua').map((e) => e.tren)) === '[["bac-thang"]]' && ev(chay(SAN('.'), BD, RIGHT), 'bay-qua').length === 0);
  // tường cao, nút, mép sân, cửa đóng
  for (const [ch, vat] of [['#', 'tuong'], ['N', 'nut'], ['C', 'cua']]) {
    const kq = chay(SAN(ch), BD, RIGHT + RIGHT);
    const dt = maSK(kq, 'dam-tuong')[0];
    kiem('drone KHÔNG qua ' + (ch === '#' ? 'tường cao' : ch === 'N' ? 'nút (nằm trong tường)' : 'cửa đóng') + ': dam-tuong vat "' + vat + '", đứng yên, vẫn mất 1 nhịp mỗi lần húc', !!dt && dt.vat === vat && kq.robot.x === 2 && kq.nhip === 2 && maSK(kq, 'dam-tuong').length === 2, J(dt));
  }
  const kMep = chay(trong(5), { x: 0, y: 0, huong: 0 }, LEFT + UP);
  kiem('mép sân chặn như tường (ngoai-san), mỗi lần húc vẫn mất 1 nhịp', maSK(kMep, 'dam-tuong').length === 2 && maSK(kMep, 'dam-tuong')[0].vat === 'ngoai-san' && kMep.nhip === 2 && kMep.robot.x === 0 && kMep.robot.y === 0);
  const kCuaMo = chay(SAN('c'), BD, RIGHT + RIGHT);
  kiem('cửa mở (c) bay qua được', kCuaMo.robot.x === 4 && maSK(kCuaMo, 'dam-tuong').length === 0);
  kiem('lyDoChan cho drone: tường, nút, mép sân chặn; hàng rào và bậc thang KHÔNG chặn (xe bánh: rào chặn, bậc thang chặn)', (() => {
    const sd = SanHoc.docSan(['#N=S.']);
    return SanHoc.lyDoChan(sd, 'drone', 0, 0) === 'tuong' && SanHoc.lyDoChan(sd, 'drone', 1, 0) === 'nut' && SanHoc.lyDoChan(sd, 'drone', 2, 0) === null && SanHoc.lyDoChan(sd, 'drone', 3, 0) === null && SanHoc.lyDoChan(sd, 'drone', -1, 0) === 'ngoai-san' &&
      SanHoc.lyDoChan(sd, 'banh', 2, 0) === 'rao' && SanHoc.lyDoChan(sd, 'banh', 3, 0) === 'bac-thang';
  })());
  // băng không đẩy
  const kBang = chay(['.>>>.'], { x: 1, y: 0, huong: 0 }, WAIT + WAIT + WAIT + WAIT + WAIT);
  kiem('băng chuyền KHÔNG đẩy drone: lơ lửng 5 nhịp trên băng vẫn đứng yên (xe bánh bị đẩy sau 2 nhịp)', kBang.robot.x === 1 && ev(kBang, 'bang-day').length === 0 &&
    SanHoc.chay({ san: ['.>>>.'], batDau: { x: 1, y: 0, huong: 0 }, loaiRobot: 'banh' }, 'wait()\nwait()\n').robot.x === 2);
  const kBang2 = chay(['.<<<.'], { x: 3, y: 0, huong: 0 }, LEFT + LEFT + LEFT);
  kiem('bay NGƯỢC chiều băng đi bình thường: 3 lệnh = 3 ô (nhện bị kẹt ở đây)', kBang2.robot.x === 0 && kBang2.nhip === 3);
  // vật và thùng
  const kVat = chay(dat1(trong(5), 3, 2, 'o'), BD, RIGHT + RIGHT);
  kiem('bay qua vật nằm đất: không đâm (xe bánh bị vướng vật), vật vẫn nằm yên ở ô cũ', kVat.robot.x === 4 && maSK(kVat, 'dam-tuong').length === 0 && vatTai(kVat, 3, 2) && ev(kVat, 'bay-qua')[0].tren.indexOf('vat') >= 0);
  const kThung = chay(dat1(trong(5), 3, 2, 'H'), BD, RIGHT + RIGHT);
  kiem('bay qua thùng nặng: không đâm, thùng không bị đẩy (ở yên (3, 2)); trên thùng ghi bay-qua "thung-nang"', kThung.robot.x === 4 && maSK(kThung, 'dam-tuong').length === 0 && kThung.thung[0].x === 3 && ev(kThung, 'bay-qua')[0].tren[0] === 'thung-nang');
  const kThungWait = chay(['.>H<.'], { x: 2, y: 0, huong: 0 }, WAIT + WAIT + WAIT);
  kiem('drone lơ lửng trên thùng nặng nằm trên băng: không chặn thùng (băng vẫn đẩy thùng, như khi không có drone)', (() => {
    const khong = chay(['.>H<.'], { x: 0, y: 0, huong: 0 }, WAIT + WAIT + WAIT);
    return kThungWait.thung[0].x === khong.thung[0].x;
  })());
  kiem('cửa nhịp đang đóng chặn drone như tường; mở thì qua', (() => {
    const k = chay(['.C.'], { x: 0, y: 0, huong: 0 }, RIGHT + RIGHT, { cuaNhip: [{ x: 1, y: 0, mo: 1, dong: 1, pha: 1 }] });
    return maSK(k, 'dam-tuong').length >= 1;
  })());
  kiem('drone xuất phát trên hàng rào / bậc thang / băng được (không phải tường)', chay(['=.'], { x: 0, y: 0, huong: 0 }, RIGHT).robot.x === 1 && chay(['S.'], { x: 0, y: 0, huong: 0 }, RIGHT).robot.x === 1 && /không đứng được/.test(loi(() => chay(['#.'], { x: 0, y: 0, huong: 0 }, ''))));
}

/* ============================================================================ 3. PIN */
console.log('\n== 3. Pin: mỗi nhịp tốn 1, hết pin, tới cờ đúng nhịp pin về 0, ô sạc P, battery() ==');
{
  const hang = ['.......'];
  const bd = { x: 0, y: 0, huong: 0 };
  const a = chay(hang, bd, RIGHT + RIGHT + RIGHT, { pin: 5 });
  kiem('mỗi lệnh bay tốn 1 pin: pin 5, bay 3 ô còn 2; kết quả có pin (còn lại), pinToiDa; vết từng nhịp có robot.pin 4, 3, 2', a.pin === 2 && a.pinToiDa === 5 && J(nhipVet(a).map((n) => n.robot.pin)) === J([4, 3, 2]));
  const b = chay(hang, bd, WAIT + WAIT, { pin: 5 });
  kiem('wait() lơ lửng cũng tốn 1 pin', b.pin === 3 && b.nhip === 2);
  const c = chay(['....'], { x: 3, y: 0, huong: 0 }, RIGHT + RIGHT, { pin: 5 });
  kiem('nhịp đâm tường / mép sân cũng tốn pin', c.pin === 3 && maSK(c, 'dam-tuong').length === 2);
  const d = chay(hang, bd, RIGHT.repeat(6), { pin: 3 });
  kiem('hết pin giữa chừng: pin về 0 mà chưa tới đích thì hạ cánh khẩn, dừng ngay (dungSom "het-pin", sự kiện het-pin { nhip, o }), drone ở ô (3, 0) sau 3 nhịp; không có lỗi chạy', d.dungSom === 'het-pin' && d.nhip === 3 && d.robot.x === 3 && !d.thang && d.loi === null && maSK(d, 'het-pin')[0].o.x === 3 && maSK(d, 'het-pin')[0].lenh.ten === 'go_right', J([d.dungSom, d.nhip, d.robot]));
  const e = chay(['....F'], bd, RIGHT.repeat(6), { pin: 4 });
  kiem('tới cờ đúng nhịp pin về 0 thì vẫn THẮNG (pin 4, cờ cách 4 ô)', e.thang && e.nhip === 4 && e.pin === 0 && e.dungSom === null);
  const f = chay(['....F'], bd, RIGHT.repeat(6), { pin: 3 });
  kiem('pin 3, cờ cách 4 ô: hết pin trước cờ, không thắng', !f.thang && f.dungSom === 'het-pin' && f.robot.x === 3);
  const g = chay(['.P.....'], bd, RIGHT + RIGHT + RIGHT, { pin: 3 });
  kiem('cuối nhịp ở trên ô sạc P thì pin đầy lại (sự kiện sac-pin { nhip, o, tu, den }): pin 3, bay vào P còn 2 → 3; bay tiếp còn 1 sau 2 lệnh nữa', ev(g, 'sac-pin').length === 1 && ev(g, 'sac-pin')[0].tu === 2 && ev(g, 'sac-pin')[0].den === 3 && ev(g, 'sac-pin')[0].o.x === 1 && J(nhipVet(g).map((n) => n.robot.pin)) === J([3, 2, 1]), J(nhipVet(g).map((n) => n.robot.pin)));
  const h = chay(['.P.....'], bd, RIGHT + WAIT + WAIT + WAIT + WAIT, { pin: 2 });
  kiem('đứng lơ lửng trên ô sạc: mỗi nhịp tốn 1 rồi sạc đầy lại nên không bao giờ hết pin (4 nhịp wait trên P với pin 2)', !h.dungSom && h.pin === 2 && ev(h, 'sac-pin').length === 5);
  const i = chay(['P....'], bd, RIGHT + RIGHT, { pin: 3 });
  kiem('xuất phát trên ô sạc: lần đầu rời đi còn 2; không sạc nếu không ở trên P cuối nhịp', i.pin === 1 && ev(i, 'sac-pin').length === 0);
  const j = chay(['.P'], bd, RIGHT, { pin: 1 });
  kiem('pin 1, bay vào đúng ô sạc: pin về 0 nhưng sạc ngay trong cùng nhịp nên không rơi (thứ tự: tốn pin → sạc → xét hết pin)', !j.dungSom && j.pin === 1 && ev(j, 'sac-pin').length === 1);
  const k = chay(hang, bd, RIGHT + RIGHT + RIGHT);
  kiem('không khai pin: pin vô hạn (pin null, pinToiDa null, robot.pin null), bay 200 nhịp không rơi', k.pin === null && k.pinToiDa === null && nhipVet(k).every((n) => n.robot.pin === null) && chay(trong(5), BD, WAIT.repeat(150)).dungSom === null);
  // battery()
  const bat = chay(hang, bd, 'a = battery()\n' + RIGHT + 'b = battery()\n' + RIGHT + 'if battery() < 4:\n    go_right()\n', { pin: 5 });
  kiem('battery() trả số pin còn lại và KHÔNG tốn nhịp: đọc 5, bay (còn 4), đọc 4, bay (còn 3), if battery() < 4 đúng nên bay thêm một ô; tổng 3 nhịp, pin còn 2', bat.nhip === 3 && bat.robot.x === 3 && bat.pin === 2 && bat.loi === null);
  const doc = bat.vet.filter((e) => e.docCamBien).map((e) => e.docCamBien);
  kiem('mỗi lần đọc ghi mục lệnh có docCamBien { cam "pin", ham "battery", pin, pinToiDa } và sự kiện doc-cam-bien ở nhịp kế; soLanDoc đếm', J(doc.map((x) => x.pin)) === J([5, 4, 3]) && doc.every((x) => x.cam === 'pin' && x.ham === 'battery' && x.pinToiDa === 5) && bat.soLanDoc === 3 && ev(bat, 'doc-cam-bien').length === 3, J(doc.map((x) => x.pin)));
  const lap = chay(hang, bd, 'while battery() > 0:\n    x = battery()\n', { pin: 3 });
  kiem('while battery() > 0 mà bên trong không bay: nhân chặn vòng đọc không có nhịp (infinite-loop), không treo', lap.loi && lap.loi.loai === 'infinite-loop' && lap.soLanDoc > 1000);
  const nhieuLan = chay(hang, bd, 'while battery() > 1:\n    go_right()\n', { pin: 4 });
  kiem('while battery() > 1: go_right() chạy đúng 3 lần (pin 4 → 1) rồi dừng; pin còn 1', nhieuLan.robot.x === 3 && nhieuLan.pin === 1 && !nhieuLan.dungSom);
  kiem('battery() khi màn không khai pin → lỗi cấu hình; battery() cho xe bánh → lỗi; pin cho xe bánh → lỗi; pin không hợp lệ (0, 1.5, âm, chuỗi, > 999) → lỗi',
    /cần màn khai pin/.test(loi(() => SanHoc.chay({ san: hang, batDau: bd, loaiRobot: 'drone', hamGoc: BAY.concat(['battery']) }, ''))) &&
    /chỉ dành cho drone/.test(loi(() => SanHoc.chay({ san: hang, batDau: BD0(), loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait', 'battery'] }, ''))) &&
    /chỉ dùng cho drone/.test(loi(() => SanHoc.chay({ san: hang, batDau: BD0(), loaiRobot: 'banh', pin: 5 }, ''))) &&
    [0, 1.5, -2, '5', 1000].every((p) => /số nguyên từ 1 đến 999/.test(loi(() => chay(hang, bd, '', { pin: p })))));
  function BD0() { return { x: 0, y: 0, huong: 0 }; }
  kiem('battery() là hàm lạ khi hamGoc không có: nhân báo chưa có hàm; chẩn đoán chua-gan-cam-bien nói đo pin', (() => {
    const k2 = SanHoc.chay({ san: hang, batDau: bd, loaiRobot: 'drone', pin: 5 }, 'battery()\n');
    const r = ChamHoc.cham(Object.assign({}, man(3)), { chinh: ['x = battery()'] }, []);
    return k2.loi && /Chưa có biến hay hàm/.test(k2.loi.thongDiep) && r.chanDoan.some((c) => c.ma === 'chua-gan-cam-bien' && /pin/.test(c.loi));
  })());
  kiem('pin ở mỗi nhịp khi hết: nhịp cuối có robot.pin 0; ô sạc của sân có trong kết quả (sac [{x, y}])', d.pin === 0 && nhipVet(d)[2].robot.pin === 0 && g.sac.length === 1 && g.sac[0].x === 1 && g.sac[0].y === 0);
  kiem('ký hiệu P là sàn: xe bánh đi qua P như sàn, không sạc gì; docSan ghi sac', (() => {
    const xe = SanHoc.chay({ san: ['.P.F'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'banh' }, L('left_move()', 'right_move()', 'wait()').repeat(3));
    return xe.thang && xe.pin === null && SanHoc.docSan(['.P.P']).sac.length === 2;
  })());
}

/* ============================================================================ 4. NAM CHÂM TREO */
console.log('\n== 4. Nam châm treo: hút vật sắt ở ô DƯỚI drone, thả xuống ô dưới; thứ tự trong nhịp; gộp với lệnh bay ==');
{
  const S = ['.....', '.....', '..o..', '.....', '.....'];
  const CH = ['.....', '.....', '..s..', '.....', '.....'];
  const bd = { x: 2, y: 2, huong: 0 };
  const bdTruoc = { x: 2, y: 3, huong: 0 };
  const a = chay(S, bd, ON, { vatChat: CH });
  kiem('hút: drone đứng trên vật sắt, magnet_n() + wait(): vật dính dưới bụng (trangThai cam, x y = ô drone), namCham { bat, cam }, sự kiện hut-vat (soO 0, tu = den) + dinh-vat', a.vat[0].trangThai === 'cam' && a.namCham.bat === true && a.namCham.cam === 1 && ev(a, 'hut-vat').length === 1 && ev(a, 'hut-vat')[0].soO === 0 && ev(a, 'dinh-vat').length === 1 && a.nhip === 1);
  const b = chay(S, bdTruoc, ON, { vatChat: CH });
  kiem('KHÁC nam châm gắn mũi xe: vật sắt ở ô TRƯỚC (cách 1 ô) không bị hút, chỉ hút ô ngay dưới', b.vat[0].trangThai === 'dat' && b.namCham.cam === null && maSK(b, 'hut-go').length === 0);
  const c = chay(S, { x: 2, y: 4, huong: 0 }, ON, { vatChat: CH });
  kiem('vật sắt cách 2 ô cũng không hút (nam châm chỉ hút ô dưới)', c.vat[0].trangThai === 'dat');
  const d = chay(S, bd, ON, {});
  kiem('vật GỖ (mặc định) không hút: hut-go (thông tin) ghi ô dưới drone, khoảng 0; vật ở yên', d.vat[0].trangThai === 'dat' && maSK(d, 'hut-go').length === 1 && maSK(d, 'hut-go')[0].khoang === 0 && maSK(d, 'hut-go')[0].o.x === 2);
  // gộp lệnh nam châm với lệnh bay
  const e = chay(S, bdTruoc, 'magnet_n()\ngo_up()\n', { vatChat: CH });
  kiem('lệnh nam châm làm ở nhịp kế (go_*): "magnet_n(); go_up()" là MỘT nhịp: bật, bay lên ô vật, hút ở cuối nhịp', e.nhip === 1 && e.vat[0].trangThai === 'cam' && e.robot.y === 2 && e.lenhTon.length === 0);
  const f = chay(S, bdTruoc, 'magnet_n()\n' + UP + 'go_up()\n' + 'go_up()\n', { vatChat: CH });
  kiem('nam châm bật suốt: bay qua vật sắt là hút, vật dính đi theo drone tới ô kế (vat.x y bằng ô drone từng nhịp)', f.vat[0].trangThai === 'cam' && f.vat[0].y === 0 && J(nhipVet(f).map((n) => [n.vat[0].trangThai, n.vat[0].x, n.vat[0].y])) === J([['cam', 2, 2], ['cam', 2, 1], ['cam', 2, 0]]), J(nhipVet(f).map((n) => n.vat[0])));
  // thả
  const g = chay(S, bd, ON + RIGHT + OFF, { vatChat: CH });
  kiem('thả: magnet_off() + wait() sau khi bay sang ô (3, 2): vật nằm xuống ô DƯỚI drone (3, 2) (tha-vat); nam châm tắt; vật cũ ô (2, 2) trống', vatTai(g, 3, 2) && g.namCham.bat === false && g.namCham.cam === null && ev(g, 'tha-vat').length === 1 && ev(g, 'tha-vat')[0].den.x === 3 && !vatTai(g, 2, 2));
  const h = chay(S, bd, ON + 'magnet_off()\n' + RIGHT, { vatChat: CH });
  kiem('thả TRƯỚC khi bay trong cùng nhịp: "magnet_off(); go_right()" thả vật ở ô CŨ (2, 2) rồi mới bay đi (thứ tự: lệnh nam châm → bay → hút)', vatTai(h, 2, 2) && h.robot.x === 3 && h.nhip === 2);
  const i = chay(S, bd, ON + RIGHT + OFF + LEFT + ON, { vatChat: CH });
  kiem('bay lại trên vật vừa thả với nam châm đã tắt: không hút; bật lại thì hút lại được', (() => {
    const k = chay(S, bd, ON + RIGHT + OFF + LEFT, { vatChat: CH });
    return !!vatTai(k, 3, 2) && i.vat[0].trangThai === 'dat' && i.namCham.cam === null;
  })());
  // thả bị chặn
  for (const [ch, ly] of [['=', 'rao'], ['S', 'bac-thang'], ['H', 'thung-nang']]) {
    const k = chay(dat1(S, 3, 2, ch), bd, ON + RIGHT + OFF, { vatChat: CH });
    const tb = maSK(k, 'tha-bi-chan')[0];
    kiem('thả bị chặn: ô dưới drone là ' + (ch === '=' ? 'hàng rào' : ch === 'S' ? 'bậc thang' : 'thùng nặng') + ' → tha-bi-chan vat "' + ly + '", vật VẪN dính, nam châm vẫn bật', !!tb && tb.vat === ly && k.vat[0].trangThai === 'cam' && k.namCham.bat === true && k.namCham.cam === 1, J(tb));
  }
  const kv = chay(dat1(S, 3, 2, 'o'), bd, ON + RIGHT + OFF, { vatChat: CH });
  kiem('thả bị chặn khi ô dưới đã có vật khác (vat "vat"): vật vẫn dính', maSK(kv, 'tha-bi-chan')[0].vat === 'vat' && kv.vat[0].trangThai === 'cam');
  const kb = chay(dat1(S, 3, 2, '>'), bd, ON + RIGHT + OFF + WAIT + WAIT + WAIT, { vatChat: CH });
  kiem('thả lên ô băng chuyền được; vật nằm đất không bị băng kéo (luật chung)', !!vatTai(kb, 3, 2) && maSK(kb, 'tha-bi-chan').length === 0);
  const kd = chay(dat1(S, 3, 2, 'D'), bd, ON + RIGHT + OFF, { vatChat: CH, mucTieu: 'dua-vat' });
  kiem('thả lên ô đích D: thắng (mucTieu dua-vat thắng ngay khi vật nằm trên đích, sự kiện xong-dua-vat)', kd.thang && kd.nhip === 3 && ev(kd, 'xong-dua-vat').length === 1);
  // thả xuống đích khác màu
  const Mau = ['.....', '.....', '.....', '...r.', '.....'];
  const kmau = chay(dat1(dat1(S, 3, 2, 'D'), 3, 2, 'D'), bd, ON + RIGHT + OFF, { vatChat: CH, mau: ['.....', '.....', '...r.', '.....', '.....'], vatMau: ['.....', '.....', '..b..', '.....', '.....'], mucTieu: 'dua-vat' });
  void Mau;
  kiem('thả xuống ô đích khác màu: dat-sai-mau, vật nằm đó nhưng chưa thắng', !kmau.thang && maSK(kmau, 'dat-sai-mau').length === 1 && !!vatTai(kmau, 3, 2));
  kiem('color() khi chưa mang vật là màu sàn dưới drone ', chay(S, bd, 'c = color()\n', { vatChat: CH, mau: ['.....', '.....', '..y..', '.....', '.....'] }).vet.filter((e) => e.docCamBien)[0].docCamBien.mau === 'yellow');
  kiem('color() của drone (cảm biến bụng) là màu sàn dưới drone, cả khi chưa mang vật' + String.fromCharCode(44) + ' lẫn khi đang DÍNH vật sắt (vật dính không tính, nguon "san"), cả lúc bay qua ô có vật', (() => {
    const k = chay(S, bd, 'c = color()' + String.fromCharCode(10) + ON + 'd = color()' + String.fromCharCode(10) + RIGHT + 'e = color()' + String.fromCharCode(10), { vatChat: CH, mau: ['.....', '.....', '..y.g', '.....', '.....'], vatMau: ['.....', '.....', '..b..', '.....', '.....'] });
    const x = k.vet.filter((e) => e.docCamBien).map((e) => e.docCamBien);
    return x.length === 3 && x[0].mau === 'yellow' && x[1].mau === 'yellow' && x[2].mau === 'none' && x.every((q) => q.nguon === 'san' && q.cam === 'mau' && q.idVat === null);
  })());
  kiem('drone KHÔNG gắn camera (không có hướng mặt): cfg.camBien có camera → lỗi cấu hình tiếng Việt, cả khi hamGoc không có color()', /Drone không gắn camera/.test(loi(() => chay(S, bd, 'wait()' + String.fromCharCode(10), { camBien: [{ ma: 'camera', o: 'tren' }] }))) && /Drone không gắn camera/.test(loi(() => SanHoc.chay({ san: S, batDau: bd, loaiRobot: 'drone', hamGoc: BAY, camBien: [{ ma: 'camera', o: 'tren' }] }, ''))));
  // gọi lại, quên wait
  const kl = chay(S, bd, 'magnet_n()\nmagnet_off()\nwait()\n', { vatChat: CH });
  kiem('hai lệnh nam châm chưa trôi nhịp: lệnh sau bị bỏ (magnet-goi-lai, lỗi)', maSK(kl, 'magnet-goi-lai').length === 1 && maSK(kl, 'magnet-goi-lai')[0].truoc.ten === 'magnet_n');
  const kq = chay(S, bd, 'magnet_n()\n', { vatChat: CH });
  kiem('magnet_n() không có go_* hay wait() theo sau: quen-wait, chưa hút, 0 nhịp; chẩn đoán nói "lệnh nam châm" và có `cho`', maSK(kq, 'quen-wait').length === 1 && kq.nhip === 0 && kq.vat[0].trangThai === 'dat' &&
    (() => { const r = ChamHoc.cham(Object.assign({}, man(7), { san: S, vatChat: CH, batDau: bd }), { chinh: ['magnet_n()'] }, []); const c2 = r.chanDoan.find((x) => x.ma === 'quen-wait'); return c2 && /lệnh nam châm/.test(c2.loi) && c2.cho && c2.cho.dong === 1; })());
  const kt = chay(S, bd, ON + OFF + ON, { vatChat: CH });
  kiem('hút rồi thả rồi hút lại ngay tại chỗ: thả xuống ô dưới (vẫn là ô của vật cũ), bật lại thì hút lại được: dính', kt.vat[0].trangThai === 'cam' && ev(kt, 'tha-vat').length === 1 && ev(kt, 'hut-vat').length === 2);
  const hai = chay(['.oo..'], { x: 1, y: 0, huong: 0 }, ON + RIGHT + ON, { vatChat: ['.ss..'] });
  kiem('đang dính một vật thì không hút thêm vật khác (mỗi lần một vật)', hai.vat[0].trangThai === 'cam' && hai.vat[1].trangThai === 'dat' && ev(hai, 'hut-vat').length === 1);
  kiem('robot { namCham } và vet.vat có `chat` khi robot có nam châm; chẩn đoán thả-bị-chặn lời cho drone nói "ô ngay dưới drone"', (() => {
    const r = ChamHoc.cham(Object.assign({}, man(7), { san: dat1(S, 3, 2, '='), vatChat: CH, batDau: bd, mucTieu: 'dua-vat' }), { chinh: ['magnet_n()', 'wait()', 'go_right()', 'magnet_off()', 'wait()'] }, []);
    const c2 = r.chanDoan.find((x) => x.ma === 'tha-bi-chan');
    return nhipVet(a)[0].robot.namCham.cam === 1 && nhipVet(a)[0].vat[0].chat === 'sat' && c2 && /ô ngay dưới drone/.test(c2.loi) && c2.cho && c2.cho.dong === 4;
  })());
  kiem('chẩn đoán hut-go lời cho drone: nói vật ngay dưới drone', (() => {
    const r = ChamHoc.cham(Object.assign({}, man(7), { san: S, vatChat: ['.....', '.....', '.....', '.....', '.....'], batDau: bd }), { chinh: ['magnet_n()', 'wait()'] }, []);
    const c2 = r.chanDoan.find((x) => x.ma === 'hut-go');
    return c2 && c2.muc === 'thong-tin' && /ngay dưới drone/.test(c2.loi);
  })());
  kiem('mục tiêu dua-vat + vatCan "sat": vật gỗ ở đâu cũng được, chỉ vật sắt phải về đích', (() => {
    const san2 = ['.oD..'], chat2 = ['.s...'];
    const k = chay(san2, { x: 1, y: 0, huong: 0 }, ON + RIGHT + OFF, { vatChat: chat2, mucTieu: 'dua-vat', vatCan: 'sat' });
    const k2 = chay(['.ooD.'], { x: 1, y: 0, huong: 0 }, ON + RIGHT + RIGHT + OFF, { vatChat: ['.ss..'], mucTieu: 'dua-vat', vatCan: 'sat' });
    return k.thang && !k2.thang;
  })());
}

/* ============================================================================ 5. HÀM CỦA CHƯƠNG NHỆN */
console.log('\n== 5. go(d) / walk(path) viết cho nhện chạy trên drone mà không sửa ==');
{
  const T_GO = ['if d == "U":', '    go_up()', 'elif d == "D":', '    go_down()', 'elif d == "L":', '    go_left()', 'elif d == "R":', '    go_right()'];
  const go = H('go', T_GO, ['d']), walk = H('walk', ['for c in path:', '    go(c)'], ['path']);
  const m2 = man(2);
  const kho2 = khoTruoc('32.2');
  kiem('kho lúc tới 19.2 có đúng go và walk của chương nhện (thân giống nhện)', J(kho2.filter((h) => h.ten === 'go' || h.ten === 'walk').map((h) => h.than)) === J([T_GO, walk.than]));
  const r = ChamHoc.cham(m2, { chinh: ['walk("RRRRDDLLLL")'] }, kho2);
  kiem('walk("RRRRDDLLLL") trên drone: 10 chữ = 10 nhịp, thắng; hamDaDung gồm go và walk', r.thang && r.soNhip === 10 && r.hamDaDung.indexOf('go') >= 0 && r.hamDaDung.indexOf('walk') >= 0, J([r.thang, r.soNhip, r.hamDaDung]));
  // cùng chuỗi trên nhện: gấp đôi nhịp
  const nhenMan = ManHoc.timMa('nhen.9');
  const rn = SanHoc.chay({ san: m2.san, batDau: m2.batDau, loaiRobot: 'nhen' }, KhungDong(go, walk, 'walk("RRRRDDLLLL")'));
  kiem('cùng chuỗi trên nhện mất 20 nhịp (hai nhịp một ô); drone mất 10', rn.nhip === 20 && r.soNhip === 10 && !!nhenMan);
  function KhungDong(g, w, chinh) { return ['def go(d):'].concat(g.than.map((s) => '    ' + s), ['def walk(path):'], w.than.map((s) => '    ' + s), [chinh]).join('\n') + '\n'; }
  kiem('pick / drop của chương tay gắp KHÔNG chạy trên drone (drone không có lệnh tay kẹp): chẩn đoán ham-chua-co', maCua(ChamHoc.cham(m2, { chinh: ['arm_down()'] }, kho2)).includes('ham-chua-co'));
}

/* ============================================================================ 6. THÂN KHÔNG HỢP */
console.log('\n== 6. Ghép sai: drone không gắn tay kẹp, tấm đẩy, máy ném, súng bóng, cảm biến khoảng cách, cảm biến từ ==');
{
  const cfg = (hamGoc) => () => SanHoc.chay({ san: trong(5), batDau: BD, loaiRobot: 'drone', hamGoc }, '');
  kiem('tay kẹp (arm_down, arm_up, grab, release) → lỗi cấu hình nói rõ', /Drone không gắn tay kẹp/.test(loi(cfg(BAY.concat(['arm_down', 'arm_up', 'grab', 'release'])))));
  kiem('súng hơi shoot_back → lỗi', /Drone không gắn súng hơi/.test(loi(cfg(BAY.concat(['shoot_back'])))));
  kiem('máy ném aim / throw / load → lỗi', /Drone không gắn máy ném/.test(loi(cfg(BAY.concat(['aim', 'throw', 'load'])))));
  kiem('súng hơi shoot → lỗi', /Drone không gắn súng hơi/.test(loi(cfg(BAY.concat(['shoot'])))));
  kiem('cảm biến khoảng cách front_clear / left_clear / right_clear → lỗi (drone không có hướng mặt)', ['front_clear', 'left_clear', 'right_clear'].every((t) => /Drone không gắn cảm biến khoảng cách/.test(loi(cfg(BAY.concat([t]))))));
  kiem('cảm biến từ front_metal → lỗi', /Drone không gắn cảm biến khoảng cách hay cảm biến từ/.test(loi(cfg(BAY.concat(['front_metal'])))));
  kiem('lệnh của xe bánh (left_move…) không thuộc drone → lỗi cấu hình', /không thuộc loại robot drone/.test(loi(cfg(BAY.concat(['left_move'])))));
  kiem('nam châm, màu và đo pin hợp lệ với drone; hamGoc mặc định của drone chạy được', loi(cfg(BAY.concat(NC, ['color']))) === null && SanHoc.chay({ san: trong(5), batDau: BD, loaiRobot: 'drone' }, 'go_up()\n').nhip === 1);
  kiem('nhện / xe bánh không có nam châm treo kiểu drone: nhện vẫn không gắn nam châm', /Nhện không gắn nam châm/.test(loi(() => SanHoc.chay({ san: trong(5), batDau: BD, loaiRobot: 'nhen', hamGoc: ['go_up', 'wait', 'magnet_n', 'magnet_off'] }, ''))));
  kiem('lyDoChan / loại robot lạ vẫn báo lỗi; loại "drone" được nhận', /Loại robot lạ/.test(loi(() => SanHoc.chay({ san: trong(5), batDau: BD, loaiRobot: 'bay' }, ''))));
  kiem('drone xuất phát trên cửa đóng → lỗi; trên cửa mở, nút → xem lyDoChan', /cửa đang đóng/.test(loi(() => chay(['C.'], { x: 0, y: 0, huong: 0 }, ''))));
}

/* ============================================================================ 7. SÂN THỬ CỦA XƯỞNG */
console.log('\n== 7. Sân thử Xưởng hàm: sanThu.pin, sanThu.sac, battery() ==');
{
  const m5 = man(5);
  const recharge = H('recharge', ['if battery() < 3:', '    go_up()', '    go_down()']);
  const st = { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, sac: [{ x: 2, y: 1 }], pin: 2 };
  const r = ChamHoc.thuHam(m5, { chinh: [], hamCuaMan: [] }, 'recharge', [recharge], { sanThu: st });
  kiem('thử recharge() ở sân thử có ô sạc phía trên, pin 2: bay lên (sạc đầy), bay xuống; 2 nhịp, pin còn 1, pinToiDa 2; kết quả có pin / pinToiDa / sac', r.soNhip === 2 && r.pin === 1 && r.pinToiDa === 2 && r.sac.length === 1 && r.robot.x === 2 && r.robot.y === 2 && ev(r, 'sac-pin').length === 1, J([r.soNhip, r.pin, r.pinToiDa, r.chanDoan.map((c) => c.ma)]));
  const r2 = ChamHoc.thuHam(m5, { chinh: [], hamCuaMan: [] }, 'recharge', [recharge], { sanThu: Object.assign({}, st, { pin: 4 }) });
  kiem('pin 4 (battery() không nhỏ hơn 3): recharge() không làm gì, 0 nhịp', r2.soNhip === 0 && r2.pin === 4);
  const r3 = ChamHoc.thuHam(m5, { chinh: [], hamCuaMan: [] }, 'recharge', [recharge], { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, pin: 1 } });
  kiem('sân thử không có ô sạc, pin 1: bay lên là hết pin → het-pin (lỗi) có `cho`, dungSom nằm trong chẩn đoán', maCua(r3).includes('het-pin') && r3.chanDoan.find((c) => c.ma === 'het-pin').cho.cot === 'hamEm', J(maCua(r3)));
  const r4 = ChamHoc.thuHam(m5, { chinh: [], hamCuaMan: [] }, 'recharge', [recharge], {});
  kiem('không khai sanThu.pin thì lấy man.pin (5): battery() = 5, không làm gì; sân thử mặc định không ô sạc', r4.pin === 5 && r4.soNhip === 0 && r4.sac.length === 0);
  const cs = ChamHoc.chuanSanThu({ rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, tuong: [{ x: 1, y: 1 }], rao: [{ x: 3, y: 3 }], sac: [{ x: 2, y: 2 }, { x: 1, y: 1 }, { x: 3, y: 3 }, { x: 9, y: 9 }, { x: 0, y: 0 }, { x: 0, y: 0 }], pin: 7 });
  kiem('chuanSanThu: sac nhận ô xe, bỏ ô tường / hàng rào / ngoài sân / trùng (còn (2,2), (0,0)); pin hợp lệ giữ lại; pin lạ (0, 1.5, 1000, chuỗi) bị bỏ; sân thử cũ không có sac / pin', cs.sac.length === 2 && cs.pin === 7 && [0, 1.5, 1000, '5'].every((p) => ChamHoc.chuanSanThu({ pin: p }).pin === undefined) && ChamHoc.chuanSanThu({}).sac === undefined && ChamHoc.chuanSanThu({}).pin === undefined, J(cs));
  const hs = ChamHoc.hangSanThu(cs);
  kiem('hangSanThu vẽ P cho ô sạc', hs[2][2] === 'P' && hs[0][0] === 'P' && hs[1][1] === '#' && hs[3][3] === '=');
  const r5 = ChamHoc.thuHam(Object.assign({}, man(7)), { chinh: [], hamCuaMan: [] }, 'fly', [H('fly', ['go_right()', 'magnet_n()', 'wait()', 'go_right()', 'magnet_off()', 'wait()'])], { sanThu: { rong: 5, cao: 5, batDau: { x: 0, y: 2, huong: 0 }, vat: [{ x: 1, y: 2, chat: 'sat' }] } });
  kiem('sân thử màn nam châm treo: vật sắt đặt sẵn, thử hàm hút rồi thả: vật nằm ở (2, 2), namCham tắt', r5.vat.length === 1 && r5.vat[0].chat === 'sat' && r5.vat[0].x === 2 && r5.vat[0].trangThai === 'dat' && r5.namCham && r5.namCham.bat === false, J(r5.vat));
  kiem('sân thử màn drone không pin: thuHam không truyền pin cho SanHoc, pin null', ChamHoc.thuHam(man(7), { chinh: [], hamCuaMan: [] }, 'f', [H('f', ['go_up()'])], {}).pin === null);
}

/* ============================================================================ 8. CHẨN ĐOÁN CÓ `cho` */
console.log('\n== 8. Chẩn đoán tiếng Việt cho drone, ghi `cho` ==');
{
  const m4 = man(4);
  const r = ChamHoc.cham(m4, { chinh: ['for i in range(6):', '    go_right()'] }, []);
  const hp = r.chanDoan.find((c) => c.ma === 'het-pin');
  kiem('het-pin: lỗi, tiếng Việt, nói nhịp và ô, nhắc "mỗi nhịp tốn 1 pin" và ô sạc, `cho` trỏ dòng go_right() (dòng 2 của chương trình)', hp && hp.muc === 'loi' && /pin của drone về 0/.test(hp.loi) && /ô sạc/.test(hp.loi) && hp.cho && hp.cho.cot === 'chinh' && hp.cho.dong === 2 && hp.nhip === 5, J(hp));
  const rw = ChamHoc.cham(man(3), { chinh: ['wait()', 'wait()', 'for i in range(6):', '    go_right()'] }, []);
  const hw = rw.chanDoan.find((c) => c.ma === 'het-pin');
  kiem('het-pin khi có wait() thừa: lời nhắc nói rõ có 2 nhịp chỉ lơ lửng cũng tốn pin', hw && /kể cả 2 nhịp chỉ lơ lửng/.test(hw.loi), hw && hw.loi);
  const rh = ChamHoc.cham(man(3), { chinh: ['go_up()', 'for i in range(6):', '    go_right()', 'wait()', 'wait()'] }, []);
  kiem('het-pin khi nhịp cuối là wait(): cho null (không có lệnh bay gây ra), vẫn có mã', (() => { const q = ChamHoc.cham(man(3), { chinh: ['for i in range(8):', '    wait()'] }, []); const c2 = q.chanDoan.find((x) => x.ma === 'het-pin'); return c2 && c2.cho === null; })() && rh.chanDoan.some((c) => c.ma === 'het-pin'));
  const rd = ChamHoc.cham(man(2), { chinh: ['walk("rrrr")'] }, khoTruoc('32.2'));
  const kb = rd.chanDoan.find((c) => c.ma === 'drone-khong-bay');
  kiem('drone-khong-bay: chạy xong mà drone chưa bay lần nào (chữ thường không khớp nhánh) → lỗi, tiếng Việt, nhắc chữ hoa / thường', kb && kb.muc === 'loi' && /chưa bay đi đâu/.test(kb.loi) && /chữ hoa và chữ thường/.test(kb.loi));
  kiem('nhện không có mã drone-khong-bay; drone có bay thì không có mã đó', !maCua(ChamHoc.cham(ManHoc.timMa('nhen.5'), { chinh: ['go("rr")'] }, khoTruoc('14.5'))).includes('drone-khong-bay') && !maCua(ChamHoc.cham(man(1), { chinh: ['go_right()'] }, [])).includes('drone-khong-bay'));
  const rt = ChamHoc.cham(man(1), { chinh: ['go_down()'] }, []);
  const dt = rt.chanDoan.find((c) => c.ma === 'dam-tuong');
  kiem('dam-tuong của drone: lời nhắc nhớ drone không quay, bay qua được rào / băng / vật / bậc thang nhưng không qua tường hay mép sân; `cho` trỏ dòng go_down()', dt && /drone không quay/.test(dt.loi) && /tường cao hay mép sân/.test(dt.loi) && dt.cho && dt.cho.dong === 1);
  const rc = ChamHoc.cham(man(1), { chinh: ['go_right()'] }, []);
  const tc = rc.chanDoan.find((c) => c.ma === 'chua-toi-co');
  kiem('chua-toi-co của drone không nói "quay mặt hướng" (drone không có hướng mặt)', tc && !/quay mặt/.test(tc.loi));
  kiem('lời giải 3 sao của 10 màn không có chẩn đoán nào, kể cả thông tin (sac-pin chỉ là sự kiện của vết, không phải chẩn đoán)', ds.every((m) => ChamHoc.cham(m, m.loiGiai, tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi)).chanDoan.length === 0));
  kiem('vết lệnh battery() qua cham(): mục lệnh có docCamBien cam "pin"; theoSan có pin / pinToiDa / sac', (() => {
    const q = ChamHoc.cham(man(5), { chinh: ['x = battery()', 'go_right()'] }, []);
    return q.vet.some((e) => e.loai === 'lenh' && e.docCamBien && e.docCamBien.cam === 'pin' && e.docCamBien.pin === 5) && q.theoSan[0].pinToiDa === 5 && q.theoSan[0].sac.length === 2 && q.pin === 4;
  })());
  kiem('màn nhiều sân pin song song (19.6): mỗi sân pin riêng 7, 5, 4; theoSan[i].pinToiDa; kết quả cham lấy sân chưa thắng', (() => {
    const m6 = man(6);
    const q = ChamHoc.cham(m6, { chinh: ['for i in range(6):', '    go_right()'] }, khoTruoc('32.6'));
    return J(q.theoSan.map((s) => s.pinToiDa)) === J([7, 5, 4]) && q.theoSan[0].thang && !q.theoSan[1].thang && !q.theoSan[2].thang && q.pinToiDa === 5 && q.chanDoan.some((c) => c.ma === 'het-pin' && /Sân 2/.test(c.loi));
  })());
}

/* ============================================================================ 9. BỘ DÒ ĐƯỜNG TẮT */
console.log('\n== 9. Bộ dò đường tắt có pin (BFS có giới hạn) + so chéo ngẫu nhiên với san-hoc.js ==');
{
  const a = { loaiRobot: 'drone', san: ['..=..', '####^', '####^', '####F'], batDau: { x: 0, y: 0, huong: 0 } };
  const bd = nhipDroneNganNhat(a);
  kiem('bộ dò: sân 19.1 = 7 nhịp (bay qua rào và băng ngược chiều), không cắt ngang', bd.nhip === 7 && !bd.catNgang, J(bd.chuoi));
  kiem('bộ dò: cờ bị tường bao kín → không tới được (null, không cắt ngang)', (() => { const k = nhipDroneNganNhat({ loaiRobot: 'drone', san: ['.#F'], batDau: { x: 0, y: 0, huong: 0 } }); return k.nhip === null && !k.catNgang; })());
  kiem('bộ dò: pin bị tính — hành lang 6 ô, pin 5: không tới được; có ngách sạc thì được (8 nhịp)', nhipDroneNganNhat({ loaiRobot: 'drone', san: ['.......'.slice(0, 6) + 'F'], batDau: { x: 0, y: 0, huong: 0 }, pin: 5 }).nhip === null &&
    nhipDroneNganNhat({ loaiRobot: 'drone', san: ['##P####', '......F', '#######'], batDau: { x: 0, y: 1, huong: 0 }, pin: 5 }).nhip === 8);
  kiem('bộ dò: tới cờ đúng nhịp pin về 0 vẫn tính (pin 6, cờ cách 6 ô → 6 nhịp)', nhipDroneNganNhat({ loaiRobot: 'drone', san: ['......F'], batDau: { x: 0, y: 0, huong: 0 }, pin: 6 }).nhip === 6);
  kiem('bộ dò có GIỚI HẠN: toiDaTrangThai nhỏ thì cắt ngang (catNgang true); toiDaMs 0 cũng cắt ngang, không treo', (() => {
    const big = { loaiRobot: 'drone', san: ['.......', '.......', '.......', '.......', '......F'], batDau: { x: 0, y: 0, huong: 0 } };
    const k1 = nhipDroneNganNhat(big, { toiDaTrangThai: 5 });
    const kho = { loaiRobot: 'drone', san: ['.......', '.......', '.......', '.......', '.......', '###.###', '..F....'].map((r) => r.replace('F', '#')), batDau: { x: 0, y: 0, huong: 0 } };
    const k2 = nhipDroneNganNhat(kho, { toiDaMs: 0 });
    return k1.catNgang === true && k1.nhip === null && (k2.catNgang === true || k2.nhip === null) && k2.soTrangThai < 100000;
  })());
  kiem('bộ dò: loại robot khác drone → lỗi rõ; sân có cửa / nút → lỗi rõ (chưa hỗ trợ)', /chỉ biết drone/.test(loi(() => nhipDroneNganNhat(Object.assign({}, a, { loaiRobot: 'banh' })))) && /chưa hỗ trợ cửa và nút/.test(loi(() => nhipDroneNganNhat({ loaiRobot: 'drone', san: ['.C.F'], batDau: { x: 0, y: 0, huong: 0 } }))));
  const nc1 = { loaiRobot: 'drone', san: ['#######', '..o=..D', '#######'], batDau: { x: 0, y: 1, huong: 0 }, mucTieu: 'dua-vat', vatCan: 'sat', vatChat: ['.......', '..s....', '.......'] };
  const tach = nhipDroneNganNhat(nc1, { tachNhip: true }), gop = nhipDroneNganNhat(nc1);
  kiem('bộ dò nam châm: màn 19.7 — gộp lệnh nam châm với lệnh bay 7 nhịp, tách nhịp (magnet_n / off đứng một mình) 8 nhịp', gop.nhip === 7 && tach.nhip === 8, J([gop.nhip, tach.nhip]));
  const sh = SanHoc.chay(Object.assign({}, nc1, { hamGoc: BAY.concat(NC) }), chuoiThanhMa(tach.chuoi));
  kiem('chuỗi hành động của bộ dò đổi sang Python rồi chạy thật trên san-hoc.js: thắng đúng số nhịp bộ dò báo (cả bản gộp)', sh.thang && sh.nhip === tach.nhip && SanHoc.chay(Object.assign({}, nc1, { hamGoc: BAY.concat(NC) }), chuoiThanhMa(gop.chuoi)).nhip === gop.nhip);
  kiem('bộ dò: vật gỗ không hút được (không bao giờ về đích); vatCan "sat" bỏ qua vật gỗ', nhipDroneNganNhat(Object.assign({}, nc1, { vatChat: ['.......', '.......', '.......'] })).nhip === null && nhipDroneNganNhat(Object.assign({}, nc1, { san: ['#######', '..oo..D'.replace('o', 'o'), '#######'], vatChat: ['.......', '..s....', '.......'] })).nhip !== null);

  // so chéo ngẫu nhiên
  let seed = 20261016;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  let soCa = 0, lech = 0, soNhip = 0, soHut = 0, soTha = 0, soSac = 0, soRoi = 0, soThang = 0, soChan = 0; const ghiLech = [];
  for (let ca = 0; ca < 2000; ca++) {
    const rong = 5 + Math.floor(rnd() * 3), cao = 4 + Math.floor(rnd() * 3);
    const g = Array.from({ length: cao }, () => Array(rong).fill('.'));
    const o = () => [Math.floor(rnd() * rong), Math.floor(rnd() * cao)];
    const datCh = (ch, n) => { for (let i = 0; i < n; i++) { const [x, y] = o(); if (g[y][x] === '.') g[y][x] = ch; } };
    datCh('#', 3); datCh('=', 3); datCh('S', 2); datCh('>', 1); datCh('<', 1); datCh('^', 1); datCh('v', 1); datCh('P', 1 + Math.floor(rnd() * 2));
    const mt = rnd() < 0.7 ? 'dua-vat' : 'toi-co';
    const nVat = 2 + Math.floor(rnd() * 3);
    if (mt === 'toi-co') datCh('F', 1); else { datCh('o', nVat); datCh('D', 1 + Math.floor(rnd() * 2)); }
    const cells = (ch) => { const r = []; g.forEach((row, y) => row.forEach((c, x) => { if (c === ch) r.push([x, y]); })); return r; };
    if (mt === 'dua-vat' && (!cells('o').length || !cells('D').length)) continue;
    if (mt === 'toi-co' && !cells('F').length) continue;
    const sanh = []; g.forEach((row, y) => row.forEach((c, x) => { if (c !== '#') sanh.push([x, y]); }));
    const [xx, yy] = pick(sanh);
    const xe = { x: xx, y: yy, huong: Math.floor(rnd() * 4) };
    const rows = g.map((r) => r.join(''));
    const vatChat = rows.map((r, y) => [...r].map((c, x) => (c === 'o' && rnd() < 0.6 ? 's' : '.')).join(''));
    const vatThem = []; for (let k = 0; k < 2; k++) { const [vx, vy] = o(); if ('<>^vS'.includes(g[vy][vx]) && !vatThem.some((q) => q.x === vx && q.y === vy)) vatThem.push({ x: vx, y: vy, chat: rnd() < 0.6 ? 'sat' : 'go' }); }
    const pin = rnd() < 0.8 ? 3 + Math.floor(rnd() * 10) : undefined;
    const man0 = { san: rows, batDau: xe, loaiRobot: 'drone', mucTieu: mt, vatChat, vatThem, vatCan: rnd() < 0.5 ? 'sat' : undefined, pin };
    let ctx;
    try { ctx = dungNguCanh(man0); } catch (e) { continue; }
    if (mt === 'dua-vat' && rows[xe.y][xe.x] === '#') continue;
    const HD = hanhDongTuDo(ctx);
    const dai = 10 + Math.floor(rnd() * 22);
    const chuoi = Array.from({ length: dai }, () => pick(HD));
    let S = trangThaiDau(ctx), nhipDo = 0, thangDo = false, roi = false;
    const trace = [];
    for (const ac of chuoi) { S = buocMotNhip(ctx, S, ac); nhipDo++; trace.push(S); if (laThang(ctx, S)) { thangDo = true; break; } if (S.rơi) { roi = true; break; } }
    const code = chuoiThanhMa(chuoi.slice(0, nhipDo));
    let res;
    try { res = SanHoc.chay({ san: rows, batDau: xe, loaiRobot: 'drone', hamGoc: BAY.concat(NC), mucTieu: mt, vatChat, vat: vatThem, vatCan: man0.vatCan, pin }, code); } catch (e) { lech++; if (ghiLech.length < 2) ghiLech.push('NÉM ' + e.message + J({ rows, xe })); continue; }
    soCa++;
    const nv = nhipVet(res);
    let ok = res.thang === thangDo && (res.dungSom === 'het-pin') === roi && nv.length === nhipDo && res.loi === null;
    for (let i = 0; ok && i < nv.length; i++) {
      const s = trace[i], r = nv[i].robot;
      if (r.x !== s.x || r.y !== s.y) ok = false;
      if ((pin === undefined ? null : s.pin) !== r.pin) ok = false;
      if (r.namCham.bat !== (s.bat === 1)) ok = false;
      // vị trí vật: -1 = dính, còn lại = ô
      const vs = nv[i].vat.map((v) => (v.trangThai === 'cam' ? -1 : v.y * ctx.rong + v.x));
      for (let j = 0; j < vs.length; j++) if (vs[j] !== s.pos[j]) ok = false;
    }
    if (!ok) { lech++; if (ghiLech.length < 2) ghiLech.push(J({ rows, xe, mt, pin, vatChat, vatThem, vatCan: man0.vatCan, code: code.split('\n').join(';') })); }
    soNhip += nhipDo; soHut += ev(res, 'hut-vat').length; soTha += ev(res, 'tha-vat').length; soSac += ev(res, 'sac-pin').length; if (roi) soRoi++; if (res.thang) soThang++; soChan += maSK(res, 'tha-bi-chan').length;
  }
  kiem('so chéo ' + soCa + ' ca ngẫu nhiên (tường cao, rào, bậc thang, băng chuyền, ô sạc, vật sắt / gỗ kể cả vật trên băng / rào / bậc thang, nam châm bật tắt gộp với lệnh bay, pin ngẫu nhiên hoặc vô hạn, mục tiêu cờ / đưa vật): từng nhịp bộ dò và san-hoc.js trùng hoàn toàn (drone, pin, nam châm, vị trí vật, thắng, rơi)',
    soCa >= 1100 && lech === 0, lech + ' lệch · ' + ghiLech.join(' || '));
  kiem('các ca ngẫu nhiên có đủ thứ: hút (' + soHut + '), thả (' + soTha + '), sạc (' + soSac + '), rơi hết pin (' + soRoi + '), thả bị chặn (' + soChan + '), thắng (' + soThang + '), tổng ' + soNhip + ' nhịp',
    soHut >= 100 && soTha >= 50 && soSac >= 100 && soRoi >= 30 && soChan >= 10 && soThang >= 10, [soHut, soTha, soSac, soRoi, soChan, soThang].join());
}

/* ============================================================================ 10. DỮ LIỆU 10 MÀN */
console.log('\n== 10. Dữ liệu 10 màn: sân, pin, đường tắt (BFS tách nhịp = sao.nhip), lời giải ==');
const BANG = [];
function bang(a, b) { return J(a) === J(b); }
{
  const SAO_NHIP = [7, 10, 6, 8, 8, 24, 8, 12, 11, 20];
  kiem('đúng 10 màn drone, id theo vị trí trong thuTu, mã drone.1…10, tên chương "Drone"', ds.length === 10 && ds.every((m, i) => m.id === (require(path.join(day, 'thu-tu-chuong.js')).thuTu.indexOf('drone') + 1) + '.' + (i + 1) && m.ma === 'drone.' + (i + 1)) && ManHoc.chuong().find((c) => c.ma === 'drone').ten === 'Drone');
  kiem('hang: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm', bang(ds.map((m) => m.hang), ['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']));
  kiem('sao.nhip đúng bảng chốt (7 10 6 8 8 24 8 12 11 20)', bang(ds.map((m) => m.sao.nhip), SAO_NHIP), J(ds.map((m) => m.sao.nhip)));
  kiem('chỉ 19.5 tạo recharge và 19.10 tạo ship; chỉ 19.8 có hàm của màn (ferry); huy hiệu drone ở 17.10; tên recharge, ship bị khóa trong kho; battery là hàm gốc của kho', bang(ds.map((m) => m.taoHam), [[], [], [], [], ['recharge'], [], [], [], [], ['ship']]) &&
    ds.every((m) => (m.so === 8) === (m.maMau.hamCuaMan.length === 1 && m.loiGiai.hamCuaMan.length === 1)) && ds[9].huyHieu.ma === 'drone' && ds.slice(0, 9).every((m) => !m.huyHieu) && tenCotTruyen.includes('recharge') && tenCotTruyen.includes('ship') && !tenCotTruyen.includes('ferry') &&
    KhoHam.HAM_GOC_MAC_DINH.includes('battery') && !KhoHam.HAM_GOC_MAC_DINH.includes('recharge') && KhoHam.SO_HAM_MAC_DINH >= tenCotTruyen.length + 2);
  kiem('Xưởng mở, khung 10/10, cauTruc for/if/while; 1–6 tới cờ; 7–10 dua-vat + vatCan "sat" + nhipTheoLoiGiai', ds.every((m) => m.moXuong && m.camHamCuaEm === false && m.khung.chinh === 10 && m.khung.moiHam === 10 && bang(m.cauTruc, ['for', 'if', 'while']) &&
    (m.so >= 7 ? m.mucTieu === 'dua-vat' && m.vatCan === 'sat' && m.nhipTheoLoiGiai === true : m.mucTieu === undefined && !m.nhipTheoLoiGiai)));
  kiem('hàm gốc & robot: bay + wait; nam châm từ 17.7; battery ở 19.5, 19.6, 17.10; robot { than "drone", tay "nam-cham" từ 7, camBien [pin] ở 5, 6, 10 }', ds.every((m) => bang(m.hamGoc, BAY.concat(m.so >= 7 ? NC : [], [5, 6, 10].includes(m.so) ? ['battery'] : [])) &&
    m.robot.than === 'drone' && m.robot.tay === (m.so >= 7 ? 'nam-cham' : null) && bang(m.robot.camBien, [5, 6, 10].includes(m.so) ? [{ ma: 'pin', o: 'than' }] : []) && m.loaiRobot === 'drone'));
  kiem('pin: 19.3 = 7, 19.4 = 5, 19.5 = 5, 19.6 = [7, 5, 4] (ba sân), 19.10 = 14; 19.1, 19.2, 19.7, 19.8, 19.9 không khai pin (pin vô hạn)', ds.map((m) => m.pin === undefined ? null : m.pin).map((p) => J(p)).join() === [null, null, 7, 5, 5, [7, 5, 4], null, null, null, 14].map((p) => J(p)).join(), J(ds.map((m) => m.pin)));
  kiem('ô sạc P: 19.4 một ô, 19.5 và 19.6 hai ô (ngách ở cột 2 và 4), 19.10 một ô; màn khai pin mà không có ô sạc: 19.3 (đường ngắn đủ pin)', (() => {
    const dem = (m) => (sanCua(m)[0].join('').match(/P/g) || []).length;
    return dem(man(4)) === 1 && dem(man(5)) === 2 && dem(man(6)) === 2 && dem(man(10)) === 1 && dem(man(3)) === 0;
  })());
  kiem('nhiều sân: 19.6 là 3 sân cùng bản đồ (batDau song song, pin song song, nhipTheo "tong"); các màn còn lại một sân', ds.every((m) => m.so === 6 ? Array.isArray(m.san[0]) && m.san.length === 3 && Array.isArray(m.batDau) && m.batDau.length === 3 && m.nhipTheo === 'tong' && m.san.every((sn) => J(sn) === J(m.san[0])) : !Array.isArray(m.san[0]) && m.nhipTheo === undefined));
  kiem('đặc trưng sân: 19.1 có hàng rào và làn băng ngược chiều đi; 19.2 có rào và băng ngược chiều; 19.3 có hàng rào chắn đường thẳng; 19.9 có vật gỗ và vật sắt trên băng (vatThem); 19.10 có rào, băng, vật gỗ, ô sạc', (() => {
    const k = (m) => sanCua(m)[0].join('');
    return /=/.test(k(man(1))) && /\^/.test(k(man(1))) && /=/.test(k(man(2))) && />/.test(k(man(2))) && /=/.test(k(man(3))) && man(9).vatThem.length === 1 && />/.test(k(man(9))) && /o/.test(k(man(9))) && /=/.test(k(man(10))) && />/.test(k(man(10))) && /P/.test(k(man(10)));
  })());

  for (const m of ds) {
    const dsSan = sanCua(m), bds = bdCua(m);
    const ok = dsSan.every((rows, i) => {
      const lm = SanHoc.lopMauCuaSan(m, i);
      const sd = SanHoc.docSan(rows, lm.mau, lm.vatMau, null);
      const bdx = bds[i], c = rows[bdx.y][bdx.x];
      return (m.mucTieu === 'dua-vat' ? sd.dich.length >= 1 && sd.vat.length >= 1 : !!sd.co) && c !== '#' && rows.length <= 7 && rows[0].length <= 7;
    });
    kiem(m.id + ': mọi sân có ' + (m.mucTieu === 'dua-vat' ? 'ô đích và vật' : 'cờ F') + ', drone xuất phát ngoài tường, sân ≤ 7×7', ok);
    const tach = nhipDroneTatCa(m, { tachNhip: true }), gop = nhipDroneTatCa(m);
    kiem(m.id + ': không có ĐƯỜNG TẮT — BFS (nam châm đứng một mình trong nhịp, có pin) = sao.nhip = ' + m.sao.nhip + (m.nhipTheoLoiGiai ? '; BFS gộp ' + gop + ' <= sao.nhip' : ''), tach === m.sao.nhip && gop !== null && gop <= m.sao.nhip && (m.nhipTheoLoiGiai || gop === tach), 'tách ' + tach + ' · gộp ' + gop);
    const kt = khoTruoc(m.id);
    const r = ChamHoc.cham(m, m.loiGiai, tron(kt, m.loiGiai.hamCuaEmMoi));
    BANG.push({ id: m.id, ten: m.ten, o: r.soO, nhip: r.soNhip, san: dsSan.length, sao: r.sao, de: m.deBai });
    kiem(m.id + ': lời giải mẫu 3 sao, ' + r.soO + ' ô, ' + r.soNhip + ' nhịp, không chẩn đoán nào', r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, o: r.soO, nhip: r.soNhip, cd: maCua(r) }));
    const alt = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kt, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': lời giải khác (' + m.loiGiaiKhac.moTa + ') cùng nhịp, nhiều ô hơn (' + alt.soO + ' > ' + m.sao.o + '), đúng 2 sao', alt.thang && alt.soNhip === m.sao.nhip && alt.soO > m.sao.o && alt.sao === 2);
    const mm = ChamHoc.cham(m, m.maMau, kt);
    kiem(m.id + ': maMau không thắng, vừa khung; veMaMau nói về code có sẵn', !mm.thang && !maCua(mm).includes('tran-khung') && typeof m.veMaMau === 'string' && m.veMaMau.length > 20);
    const thieu = [];
    m.loiSai.forEach((ls, i) => { const q = ChamHoc.cham(m, ls.baiLam, tron(kt, ls.hamCuaEmMoi)); const co = maCua(q); if (q.sao >= 3 || ls.phaiCoMa.some((x) => !co.includes(x))) thieu.push('#' + (i + 1)); });
    kiem(m.id + ': ' + m.loiSai.length + ' lời sai đều không đủ 3 sao và đủ mã chẩn đoán', thieu.length === 0, thieu.join());
  }
  const dungMa = new Set(ds.flatMap((m) => m.loiSai.flatMap((l) => l.phaiCoMa)));
  kiem('các lời sai dùng đủ mã của chương: het-pin, drone-khong-bay, tha-bi-chan, hut-go, quen-wait, dam-tuong, ham-chua-co, tran-khung, chua-dua-vat, chua-toi-co', ['het-pin', 'drone-khong-bay', 'tha-bi-chan', 'hut-go', 'quen-wait', 'dam-tuong', 'ham-chua-co', 'tran-khung', 'chua-dua-vat', 'chua-toi-co'].every((x) => dungMa.has(x)), J([...dungMa]));

  // từng màn
  const m1 = man(1), m2 = man(2), m3 = man(3), m4 = man(4), m5 = man(5), m6 = man(6), m7 = man(7), m8 = man(8), m9 = man(9), m10 = man(10);
  const xe1 = SanHoc.chay({ san: m1.san, batDau: m1.batDau, loaiRobot: 'nhen' }, 'for i in range(4):\n    go_right()\nfor i in range(3):\n    go_down()\n');
  kiem('19.1: làn băng ^ ngược chiều đi xuống: nhện đi cùng đường bị đẩy lùi (không tới cờ) còn drone qua thẳng', !xe1.thang && ChamHoc.cham(m1, m1.loiGiai, []).thang);
  kiem('19.2: hamCuaEmCan go, walk; chuỗi chỉ đường "RRRRDDLLLL" 10 nhịp (nhện mất 20); chữ thường không bay (drone-khong-bay)', bang(m2.hamCuaEmCan, ['go', 'walk']) && m2.taoHam.length === 0 && maCua(ChamHoc.cham(m2, m2.loiSai[0].baiLam, khoTruoc('32.2'))).includes('drone-khong-bay'));
  const r3d = ChamHoc.cham(m3, { chinh: ['go_up()', 'for i in range(6):', '    go_right()', 'go_down()'] }, []);
  kiem('19.3: pin 7 — đường thẳng qua hai hàng rào 6 nhịp; vòng trên hàng trên 8 nhịp > 7 pin → het-pin; chen wait() cũng tốn pin', !r3d.thang && maCua(r3d).includes('het-pin') && ChamHoc.cham(m3, m3.loiGiai, []).pin === 1);
  const r4k = ChamHoc.cham(m4, m4.loiGiai, []);
  kiem('19.4: pin 5, bay vào ngách sạc ở cột 2 (pin đầy lại), xuống, bay 4 ô tới cờ đúng nhịp pin về 0: thắng với pin 0; bay thẳng không ghé thì het-pin', r4k.thang && r4k.pin === 0 && r4k.soNhip === 8 && maCua(ChamHoc.cham(m4, m4.maMau, [])).includes('het-pin'));
  const r5o = ChamHoc.cham(m5, m5.loiGiai, m5.loiGiai.hamCuaEmMoi);
  kiem('19.5: recharge() = if battery() < 3: go_up(), go_down(); khóa tên; chỉ ghé sạc đúng 1 lần (vòng 2, pin 1); pin cuối 2; 3 ô thân hàm', bang(m5.loiGiai.hamCuaEmMoi[0].than, ['if battery() < 3:', '    go_up()', '    go_down()']) && r5o.thang && ev({ vet: r5o.vet }, 'sac-pin').length === 1 && r5o.pin === 2 && m5.loiGiai.hamCuaEmMoi[0].thamSo.length === 0);
  const r5kk = ChamHoc.cham(m5, { chinh: ['for i in range(3):', '    go_right()', '    go_right()', '    recharge()'] }, [H('recharge', ['go_up()', 'go_down()'])]);
  kiem('19.5: recharge() ghé sạc không điều kiện sau mỗi cặp ô (không dùng battery()) vẫn tới cờ nhưng mất 10 nhịp > 8: chỉ 2 sao', r5kk.thang && r5kk.soNhip === 10 && r5kk.sao === 2);
  const r5kh = ChamHoc.cham(m5, { chinh: ['for i in range(3):', '    go_right()', '    go_right()', '    go_up()', '    go_down()'] }, []);
  kiem('19.5: không tạo recharge() (viết thẳng go_up(), go_down()): tới cờ nhưng chưa thắng, chua-tao-ham (23/10: recharge() dùng ở 4 màn sau)', !r5kh.thang && r5kh.chanDoan[0].ma === 'chua-tao-ham');
  kiem('19.6: cùng chương trình thắng cả ba sân: nhịp 6, 8, 10 (pin 7, 5, 4: không, một, hai lần ghé sạc), tổng 24', bang(ChamHoc.cham(m6, m6.loiGiai, khoTruoc('32.6')).theoSan.map((s) => s.soNhip), [6, 8, 10]) && ChamHoc.cham(m6, m6.loiGiai, khoTruoc('32.6')).soNhip === 24);
  kiem('19.6: viết cứng "ghé sạc một lần" thắng sân 1 và 2 nhưng rơi ở sân 3 (pin 4); bay thẳng chỉ thắng sân 1; hamCuaEmCan recharge', (() => {
    const q = ChamHoc.cham(m6, m6.loiSai[1].baiLam, khoTruoc('32.6'));
    const q2 = ChamHoc.cham(m6, m6.loiSai[0].baiLam, khoTruoc('32.6'));
    return J(q.theoSan.map((s) => s.thang)) === J([true, true, false]) && J(q2.theoSan.map((s) => s.thang)) === J([true, false, false]) && bang(m6.hamCuaEmCan, ['recharge']);
  })());
  const r7 = ChamHoc.cham(m7, m7.loiGiai, []);
  kiem('19.7: hút vật sắt dưới bụng ở (2, 1), bay qua hàng rào (3, 1) khi đang mang vật, thả lên đích (6, 1); 8 nhịp; viết gộp "magnet_n(); go_right()" nhanh hơn một nhịp (7)', r7.thang && r7.soNhip === 8 && ChamHoc.cham(m7, { chinh: ['go_right()', 'magnet_n()', 'go_right()', 'go_right()', 'go_right()', 'go_right()', 'go_right()', 'magnet_off()', 'wait()'] }, []).soNhip === 7 &&
    ev({ vet: r7.vet }, 'bay-qua').some((e) => e.tren.indexOf('rao') >= 0));
  kiem('19.8: maMau gọi ferry() thả vật TRƯỚC khi bay (vật ở yên chỗ cũ); lời giải chỉ đổi thứ tự thân ferry, chương trình giữ nguyên; ferry không vào kho', bang(m8.maMau.hamCuaMan[0].than, ['magnet_n()', 'wait()', 'magnet_off()', 'wait()', 'walk(path)']) && bang(m8.loiGiai.hamCuaMan[0].than, ['magnet_n()', 'wait()', 'walk(path)', 'magnet_off()', 'wait()']) &&
    bang(m8.maMau.chinh, m8.loiGiai.chinh) && maCua(ChamHoc.cham(m8, m8.maMau, khoTruoc('32.8'))).includes('chua-dua-vat') && m8.loiGiai.hamCuaEmMoi.length === 0);
  kiem('19.9: hai vật sắt (một nằm trên băng) và một vật gỗ giữa hai vật sắt; vật gỗ không bị đụng tới (ở yên (3, 1)); bật nam châm trên vật gỗ → hut-go', (() => {
    const r = ChamHoc.cham(m9, m9.loiGiai, khoTruoc('32.9'));
    const rg = ChamHoc.cham(m9, m9.loiSai[1].baiLam, khoTruoc('32.9'));
    return r.thang && r.vat.some((v) => v.x === 3 && v.y === 1 && v.trangThai === 'dat' && v.chat === 'go') && r.vat.filter((v) => v.chat === 'sat').every((v) => v.y === 0) && maCua(rg).includes('hut-go');
  })());
  const r10 = ChamHoc.cham(m10, m10.loiGiai, tron(khoTruoc('32.10'), m10.loiGiai.hamCuaEmMoi));
  kiem('19.10: pin 14, hai chuyến bay thẳng cần 16 pin nên chuyến thứ nhất ghé ô sạc (U L U D R R U); sac-pin đúng 1 lần; 20 nhịp; ship() = hút, walk(path), thả (5 ô)', r10.thang && r10.soNhip === 20 && ev({ vet: r10.vet }, 'sac-pin').length === 1 && bang(m10.loiGiai.hamCuaEmMoi[0].than, ['magnet_n()', 'wait()', 'walk(path)', 'magnet_off()', 'wait()']) && bang(m10.loiGiai.hamCuaEmMoi[0].thamSo, ['path']) && bang(m10.hamCuaEmCan, ['go', 'walk']) && m10.canHam === 'tran-khung');
  const khong = ChamHoc.cham(m10, m10.loiSai[4].baiLam, khoTruoc('32.10'));
  kiem('19.10: không dùng ship(), viết thẳng 12 dòng > 10 ô: tran-khung, không chạy', khong.chiTietO.chinh >= 12 && maCua(khong).includes('tran-khung') && !khong.thang);
}

console.log('\n== Bảng 10 màn chương Drone (lời giải mẫu) ==');
{
  console.log('  màn   | ô  | nhịp | sân | tên');
  for (const b of BANG) console.log('  ' + b.id.padEnd(5) + ' | ' + String(b.o).padEnd(2) + ' | ' + String(b.nhip).padEnd(4) + ' | ' + String(b.san).padEnd(3) + ' | ' + b.ten);
  console.log('\n  Lời đề:');
  for (const b of BANG) console.log('  ' + b.id + ': ' + b.de);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
void bdCua; void H; void LEFT; void DOWN;

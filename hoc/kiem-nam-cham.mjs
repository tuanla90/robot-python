/* ============================================================================
   kiem-nam-cham.mjs — máy kiểm chương `nam-cham` (Nam châm) của "Đường học".
   Gồm: luật hút (1–2 ô, bốn hướng, tường chắn, bậc thang không chắn, gỗ không hút và còn chắn sắt, vật gần nhất trước, mỗi lần một vật),
   dính đi theo xe (đi, quay, băng chuyền), thả (ô trống / bị chặn: tường, mép sân, bậc thang, vật; tha-bi-chan), thứ tự lệnh trong nhịp (gộp
   với lệnh đi), quên wait / gọi lại, băng chuyền (vật sắt trên băng hút được, vật không trôi), omni và xích, robot không có tay nam châm,
   nhện không gắn được, nam châm không đi chung tay kẹp hay tấm đẩy, cảm biến từ front_metal() (đọc, không tốn nhịp, sự kiện, giới hạn đọc),
   vatCan 'sat', lớp vatChat / vatThem, đích có màu, chẩn đoán tiếng Việt, sân thử của Xưởng, bộ dò đường tắt (so chéo với san-hoc.js bằng
   chương trình ngẫu nhiên), dữ liệu 10 màn (sao.nhip = BFS "tách nhịp") và bảng 10 màn.
   Các kiểm chung cho cả 130 màn (đi tuần tự, sao, lời sai, đường tắt BFS trên từng sân…) nằm ở kiem-hoc.mjs.
   Chạy: node robotics/hoc/kiem-nam-cham.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
for (const f of ['man-chuoi-2', 'man-tay-gap', 'man-vong-lap', 'man-bang-chuyen', 'man-tham-so', 'man-nhen', 'man-xich', 'man-omni', 'man-tam-day', 'man-khoang-cach', 'man-mau']) require(path.join(day, f + '.js'));
const ManHoc = require(path.join(day, 'man-nam-cham.js'));
const BoDo = await import('./do-duong-nam-cham.mjs');
const { nhipNamChamNganNhat, nhipNamChamTatCa, buocMotNhip, dungNguCanh, trangThaiDau, laThang, chuoiThanhMa, hanhDongTuDo } = BoDo;

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
/** Sự kiện của vết nhịp (hut-vat, dinh-vat, tha-vat, xong-dua-vat…; khác maSK là các mốc chẩn đoán). */
const ev = (kq, ma) => nhipVet(kq).flatMap((n) => n.suKien).filter((e) => e.ma === ma);
const L = (...d) => d.join('\n') + '\n';
const loi = (f) => { try { f(); return null; } catch (e) { return e.message; } };
const VEC = SanHoc.VEC;

const ds = ManHoc.danhSach.filter((m) => m.chuong === 'nam-cham');
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
const man = (so) => ManHoc.timMa('nam-cham.' + so);
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const bdCua = (m) => (Array.isArray(m.batDau) ? m.batDau : sanCua(m).map(() => m.batDau));

const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const OMNI = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait'];
const NC = ['magnet_on', 'magnet_off'];
const TU = ['front_metal'];
function chay(rows, bd, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: BANH.concat(NC, TU, ['front_clear']) }, extra || {}), code);
}
/** Các lần đọc cảm biến trong vết, theo thứ tự. */
const doc = (kq) => kq.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
const TIEN = L('left_move()', 'right_move()', 'wait()');
const PHAI = L('left_move()', 'wait()');
const TRAI = L('right_move()', 'wait()');
const HUT = L('magnet_on()', 'wait()');
const THA = L('magnet_off()', 'wait()');
const trong = (n, c = '.') => Array.from({ length: n }, () => c.repeat(n));
const dat1 = (rows, x, y, ch) => rows.map((r, j) => (j === y ? r.slice(0, x) + ch + r.slice(x + 1) : r));
const vatCua = (kq, id) => kq.vat.find((v) => v.id === id);

/* ============================================================================ 1. HÚT */
console.log('\n== 1. Hút: tầm 2 ô, bốn hướng, tường chắn, bậc thang, gỗ, vật gần nhất, mỗi lần một vật ==');
{
  let tong = 0, dung = 0; const sai = [];
  for (const h of [0, 1, 2, 3]) for (const d of [1, 2, 3]) {
    const xe = { x: 3, y: 3, huong: h };
    const vx = 3 + VEC[h][0] * d, vy = 3 + VEC[h][1] * d;
    const rows = dat1(trong(7), vx, vy, 'o');
    const chat = dat1(trong(7), vx, vy, 's');
    const kq = chay(rows, xe, HUT, { vatChat: chat });
    tong++;
    const hut = ev(kq, 'hut-vat')[0];
    const ok = d <= 2
      ? hut && hut.soO === d - 1 && hut.tu.x === vx && hut.tu.y === vy && hut.den.x === 3 + VEC[h][0] && hut.den.y === 3 + VEC[h][1] && ev(kq, 'dinh-vat').length === 1 &&
        kq.namCham.bat === true && kq.namCham.cam === 1 && vatCua(kq, 1).trangThai === 'cam' && vatCua(kq, 1).x === 3 && vatCua(kq, 1).y === 3 && kq.nhip === 1
      : !hut && kq.namCham.cam === null && vatCua(kq, 1).trangThai === 'dat' && vatCua(kq, 1).x === vx && maSK(kq, 'hut-go').length === 0;
    if (ok) dung++; else sai.push('h' + h + '/d' + d + ':' + J(kq.suKien.map((e) => e.ma)));
  }
  kiem('vật sắt cách 1 hoặc 2 ô trước mặt, bốn hướng: bị hút về ô sát mũi xe và dính (hut-vat soO = d − 1, dinh-vat, cam = 1); cách 3 ô: không hút (' + tong + ' ca)', dung === tong, sai.slice(0, 3).join(' | '));
  kiem('vật sắt phía SAU xe hay bên hông: không hút', (() => {
    const k1 = chay(dat1(trong(7), 3, 5, 'o'), { x: 3, y: 3, huong: 0 }, HUT, { vatChat: dat1(trong(7), 3, 5, 's') });
    const k2 = chay(dat1(trong(7), 4, 3, 'o'), { x: 3, y: 3, huong: 0 }, HUT, { vatChat: dat1(trong(7), 4, 3, 's') });
    return k1.namCham.cam === null && k2.namCham.cam === null;
  })());

  // tường chắn
  const t1 = chay(dat1(dat1(trong(7), 3, 2, '#'), 3, 1, 'o'), { x: 3, y: 3, huong: 0 }, HUT, { vatChat: dat1(trong(7), 3, 1, 's') });
  kiem('tường ở ô 1 chắn vật sắt ở ô 2: không hút (và không hut-go: tường không phải vật gỗ)', t1.namCham.cam === null && ev(t1, 'hut-vat').length === 0 && maSK(t1, 'hut-go').length === 0);
  const t2 = chay(dat1(dat1(trong(7), 3, 1, '#'), 3, 2, 'o'), { x: 3, y: 3, huong: 0 }, HUT, { vatChat: dat1(trong(7), 3, 2, 's') });
  kiem('tường ở ô 2, vật sắt ở ô 1: tường đứng SAU vật nên không cản, vật vẫn bị hút', t2.namCham.cam === 1);
  // bậc thang S không chắn
  const s1 = chay(dat1(dat1(trong(7), 3, 2, 'S'), 3, 1, 'o'), { x: 3, y: 3, huong: 0 }, HUT, { vatChat: dat1(trong(7), 3, 1, 's') });
  kiem('bậc thang S ở ô 1 KHÔNG chắn: vật sắt ở ô 2 vẫn bị hút (hút xuyên qua bậc thang)', s1.namCham.cam === 1 && ev(s1, 'hut-vat')[0].soO === 1);
  kiem('vật sắt đặt trên ô bậc thang S (khai bằng cfg.vat vì ô S không viết được ký hiệu o): hút được, vật về ô xe', (() => {
    const k = chay(dat1(trong(7), 3, 2, 'S'), { x: 3, y: 4, huong: 0 }, HUT, { vat: [{ x: 3, y: 2, chat: 'sat' }] });
    return k.namCham.cam === 1 && k.vat[0].x === 3 && k.vat[0].y === 4;
  })());

  // gỗ
  const g1 = chay(dat1(trong(7), 3, 2, 'o'), { x: 3, y: 3, huong: 0 }, HUT);
  kiem('vật gỗ (mặc định) ở ô 1: không hút, ghi hut-go { id, o, khoang 1 }', g1.namCham.cam === null && maSK(g1, 'hut-go').length === 1 && maSK(g1, 'hut-go')[0].khoang === 1 && maSK(g1, 'hut-go')[0].o.y === 2 && maSK(g1, 'hut-go')[0].id === 1, J(g1.suKien));
  const g2 = chay(dat1(trong(7), 3, 1, 'o'), { x: 3, y: 3, huong: 0 }, HUT);
  kiem('vật gỗ ở ô 2: không hút, hut-go khoang 2', g2.namCham.cam === null && maSK(g2, 'hut-go')[0].khoang === 2);
  kiem('vật gỗ khai tường minh chat "go" (cfg.vat) giống mặc định', (() => {
    const k = chay(trong(7), { x: 3, y: 3, huong: 0 }, HUT, { vat: [{ x: 3, y: 2, chat: 'go' }] });
    return k.namCham.cam === null && maSK(k, 'hut-go').length === 1;
  })());
  // (vật đánh số theo thứ tự đọc từng hàng: vật ở hàng trên có id nhỏ hơn)
  const g3 = chay(dat1(dat1(trong(7), 3, 2, 'o'), 3, 1, 'o'), { x: 3, y: 3, huong: 0 }, HUT, { vatChat: dat1(trong(7), 3, 1, 's') });
  kiem('gỗ ở ô 1 CHẮN sắt ở ô 2 (id 1 = sắt ở ô 2, id 2 = gỗ ở ô 1): không hút, hut-go nói vật gỗ id 2', g3.namCham.cam === null && maSK(g3, 'hut-go').length === 1 && maSK(g3, 'hut-go')[0].id === 2);
  const g4 = chay(dat1(dat1(trong(7), 3, 2, 'o'), 3, 1, 'o'), { x: 3, y: 3, huong: 0 }, HUT, { vatChat: dat1(trong(7), 3, 2, 's') });
  kiem('sắt ở ô 1 (id 2), gỗ ở ô 2 (id 1): hút sắt, gỗ đứng sau không cản, không hut-go', g4.namCham.cam === 2 && maSK(g4, 'hut-go').length === 0);
  const g5 = chay(trong(7), { x: 3, y: 3, huong: 0 }, HUT);
  kiem('không có vật nào trong tầm: không hút, không hut-go', g5.namCham.cam === null && maSK(g5, 'hut-go').length === 0 && ev(g5, 'hut-vat').length === 0);

  // vật gần nhất trước, mỗi lần một vật
  const hai = dat1(dat1(trong(7), 3, 2, 'o'), 3, 1, 'o'), haiSat = dat1(dat1(trong(7), 3, 2, 's'), 3, 1, 's');
  const n1 = chay(hai, { x: 3, y: 3, huong: 0 }, HUT, { vatChat: haiSat });
  kiem('hai vật sắt ở ô 1 (id 2) và ô 2 (id 1): hút vật GẦN NHẤT (id 2), vật ở ô 2 nằm yên', n1.namCham.cam === 2 && vatCua(n1, 1).trangThai === 'dat' && vatCua(n1, 1).y === 1 && ev(n1, 'hut-vat').length === 1, J(n1.vat));
  const n2 = chay(hai, { x: 3, y: 3, huong: 0 }, L(HUT, 'wait()', 'wait()'), { vatChat: haiSat });
  kiem('đang dính một vật thì không hút thêm dù còn vật sắt trong tầm (nhiều nhịp)', n2.namCham.cam === 2 && ev(n2, 'hut-vat').length === 1 && vatCua(n2, 1).trangThai === 'dat');
  const n3 = chay(hai, { x: 3, y: 3, huong: 0 }, L(HUT, 'magnet_off()', 'wait()', 'magnet_on()', 'wait()'), { vatChat: haiSat });
  kiem('thả vật gần rồi bật lại: vật vừa thả nằm ở ô 1 nên được hút lại đúng vật đó (id 2), không phải vật ở ô 2', n3.namCham.cam === 2 && ev(n3, 'hut-vat').length === 2);
  kiem('nam châm tắt: không hút gì dù vật sắt sát mặt', (() => {
    const k = chay(dat1(trong(7), 3, 2, 'o'), { x: 3, y: 3, huong: 0 }, 'wait()', { vatChat: dat1(trong(7), 3, 2, 's') });
    return k.namCham.bat === false && k.namCham.cam === null && vatCua(k, 1).trangThai === 'dat';
  })());
  // vật nằm dưới xe không bị hút
  const du = chay(dat1(trong(7), 3, 3, 'o'), { x: 3, y: 3, huong: 0 }, HUT, { vatChat: dat1(trong(7), 3, 3, 's') });
  kiem('vật sắt nằm ngay dưới xe: không hút (chỉ hút vật trước mặt)', du.namCham.cam === null);
}

/* ============================================================================ 2. DÍNH ĐI THEO XE */
console.log('\n== 2. Vật dính đi theo xe: đi, quay, băng chuyền; trạng thái "cam" ==');
{
  const rows = dat1(trong(7), 3, 1, 'o'), chat = dat1(trong(7), 3, 1, 's');
  const bd = { x: 3, y: 5, huong: 0 };
  const k = chay(rows, bd, L(HUT, TIEN, TIEN), { vatChat: chat });
  const nv = nhipVet(k);
  kiem('nam châm bật khi xe ở (3,5), vật cách 4 ô: chưa tới tầm nên chưa dính; tiến thêm một ô (cách 3) vẫn chưa; tiến ô nữa (cách 2) thì dính ở cuối nhịp đó', nv[0].robot.namCham.cam === null && nv[0].vat[0].trangThai === 'dat' && nv[1].robot.namCham.cam === null && nv[2].robot.namCham.cam === 1 && nv[2].robot.y === 3, J(nv.map((n) => [n.robot.y, n.robot.namCham.cam])));
  const k2 = chay(rows, { x: 3, y: 3, huong: 0 }, L(HUT, TIEN, PHAI, TIEN), { vatChat: chat });
  const n2 = nhipVet(k2);
  kiem('hút ở nhịp 1 (vật cách 2 ô); xe tiến, rẽ phải, tiến: vật luôn ở ô xe (x, y của vật = x, y của xe), trangThai "cam", vết nhịp có robot.namCham { bat, cam }',
    n2.length === 4 && n2.every((n) => n.vat[0].trangThai === 'cam' && n.vat[0].x === n.robot.x && n.vat[0].y === n.robot.y && n.robot.namCham.cam === 1 && n.robot.namCham.bat === true), J(n2.map((n) => [n.robot, n.vat[0]])));
  kiem('vết nhịp của robot có tay nam châm có vat với trường chat ("sat" / "go"); robot khác thì vật sắt vẫn có chat sat, vật gỗ không có trường chat', n2[0].vat[0].chat === 'sat' && (() => {
    const c = SanHoc.chay({ san: ['o.D', '...'], batDau: { x: 0, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release']), mucTieu: 'dua-vat', vatChat: ['s..', '...'] }, 'wait()');
    const c2 = SanHoc.chay({ san: ['o.D', '...'], batDau: { x: 0, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release']), mucTieu: 'dua-vat' }, 'wait()');
    return nhipVet(c)[0].vat[0].chat === 'sat' && !('chat' in nhipVet(c2)[0].vat[0]);
  })());
  // quay: xe quay phải, vật vẫn dính; thả sang ô mới trước mũi
  const q = chay(rows, { x: 3, y: 3, huong: 0 }, L(HUT, PHAI, THA), { vatChat: chat });
  kiem('hút, quay phải, thả: vật rơi xuống ô trước mũi MỚI (4, 3), nằm yên (trangThai dat), nam châm tắt', q.namCham.cam === null && q.namCham.bat === false && vatCua(q, 1).trangThai === 'dat' && vatCua(q, 1).x === 4 && vatCua(q, 1).y === 3 && ev(q, 'tha-vat').length === 1 && ev(q, 'tha-vat')[0].den.x === 4, J(q.vat));
  // thả xong có thể hút lại: vật nằm trước mũi (ô 1)
  const q2 = chay(rows, { x: 3, y: 3, huong: 0 }, L(HUT, PHAI, THA, HUT), { vatChat: chat });
  kiem('thả xong bật lại ngay: vật nằm ô 1 trước mũi nên được hút lại', q2.namCham.cam === 1);
  // băng chuyền đẩy xe mang theo vật
  const rowsC = ['.>.o...'].concat(Array(6).fill('.......'));
  const chC = ['...s...'].concat(Array(6).fill('.......'));
  const c = chay(rowsC, { x: 1, y: 0, huong: 1 }, L('magnet_on()', 'wait()', 'wait()'), { vatChat: chC });
  kiem('xe đứng trên băng 2 nhịp bị đẩy 1 ô sang phải, vật dính (hút ở nhịp 1 khi vật cách 2 ô) đi theo: cuối cùng vật ở ô của xe', c.robot.x === 2 && c.namCham.cam === 1 && vatCua(c, 1).x === 2 && vatCua(c, 1).y === 0 && ev(c, 'hut-vat').length === 1, J([c.robot, c.vat]));
  // vật nằm dưới đất không bị băng kéo, vật sắt nằm trên băng hút được
  const rowsBang = ['.>>....'].concat(Array(6).fill('.......'));
  const tb = chay(rowsBang, { x: 6, y: 1, huong: 0 }, L('wait()', 'wait()', 'wait()', 'wait()'), { vat: [{ x: 1, y: 0, chat: 'sat' }] });
  kiem('vật nằm trên băng chuyền không trôi (luật chung: vật dưới đất không bị băng kéo)', tb.vat[0].x === 1 && tb.vat[0].y === 0 && tb.nhip === 4);
  const hb = chay(rowsBang, { x: 1, y: 2, huong: 0 }, L('magnet_on()', 'wait()'), { vat: [{ x: 1, y: 0, chat: 'sat' }] });
  kiem('vật sắt đặt trên ô băng chuyền (cfg.vat) vẫn hút được; vật rời băng, về ô xe', hb.namCham.cam === 1 && hb.vat[0].x === 1 && hb.vat[0].y === 2);
  kiem('vật dính luôn ở ô xe suốt lượt chạy qua cả ô băng (xe tiến qua băng, bị đẩy)', (() => {
    const k3 = chay(['..o.>>.'].concat(Array(6).fill('.......')), { x: 0, y: 0, huong: 1 }, L(HUT, TIEN, TIEN, TIEN, TIEN, TIEN), { vatChat: ['..s....'].concat(Array(6).fill('.......')) });
    return nhipVet(k3).every((n) => n.vat[0].trangThai === 'cam' && n.vat[0].x === n.robot.x && n.vat[0].y === n.robot.y) && k3.robot.x === 6;
  })());
}

/* ============================================================================ 3. THẢ */
console.log('\n== 3. magnet_off(): thả xuống ô trước mũi; bị chặn thì vẫn dính (tha-bi-chan) ==');
{
  const base = (extra) => Object.assign({ vatChat: dat1(trong(7), 3, 2, 's') }, extra || {});
  const rows = dat1(trong(7), 3, 2, 'o');
  const bd = { x: 3, y: 3, huong: 0 };
  // thả vào ô trống
  const t0 = chay(rows, { x: 3, y: 4, huong: 0 }, L(HUT, 'wait()') + L('left_back()', 'right_back()', 'wait()') + THA, base());
  kiem('thả khi ô trước mũi trống: tha-vat { den }, vật nằm yên (dat) đúng ô, cam null, bat false', t0.namCham.cam === null && t0.namCham.bat === false && ev(t0, 'tha-vat').length === 1 && vatCua(t0, 1).trangThai === 'dat', J(t0.suKien.map((e) => e.ma)));
  // thả khi chưa dính gì
  const t1 = chay(rows, bd, L('magnet_on()', 'wait()', 'magnet_off()', 'wait()'), base({}));
  kiem('hút rồi thả liền: vật rơi lại ô trước mũi (3,2), không phải ô lạ', vatCua(t1, 1).x === 3 && vatCua(t1, 1).y === 2 && vatCua(t1, 1).trangThai === 'dat');
  const t2 = chay(trong(7), bd, THA);
  kiem('magnet_off() khi chưa dính gì: tắt nam châm, không sự kiện gì', t2.namCham.bat === false && ev(t2, 'tha-vat').length === 0 && maSK(t2, 'tha-bi-chan').length === 0);
  // chặn: tường, mép sân, bậc thang, vật nằm. Xe hút một vật phía trước rồi quay sang một ô bị chặn, thả thì không được
  const chan = (rowsC, xe, ten, ly) => {
    const code = L(HUT, ...xe.truoc, THA);
    const k = chay(rowsC, xe.bd, code, { vatChat: xe.chat });
    const e = maSK(k, 'tha-bi-chan')[0];
    kiem(ten, e && e.vat === ly && e.nhip === k.nhip && k.namCham.cam === 1 && k.namCham.bat === true && vatCua(k, 1).trangThai === 'cam' && ev(k, 'tha-vat').length === 0, J(k.suKien));
    return k;
  };
  const tu = dat1(dat1(trong(7), 3, 1, 'o'), 4, 3, '#');
  chan(tu, { bd, chat: dat1(trong(7), 3, 1, 's'), truoc: [PHAI.trim()] }, 'thả khi trước mũi là TƯỜNG: tha-bi-chan (vat "tuong"), vật vẫn dính, nam châm vẫn bật', 'tuong');
  chan(dat1(trong(7), 3, 0, 'o'), { bd: { x: 3, y: 2, huong: 0 }, chat: dat1(trong(7), 3, 0, 's'), truoc: [TIEN.trim(), TIEN.trim()] }, 'thả khi trước mũi là MÉP SÂN (xe ở hàng trên cùng, quay lên): tha-bi-chan (vat "ngoai-san")', 'ngoai-san');
  chan(dat1(dat1(trong(7), 3, 1, 'o'), 4, 3, 'S'), { bd, chat: dat1(trong(7), 3, 1, 's'), truoc: [PHAI.trim()] }, 'thả khi trước mũi là BẬC THANG: tha-bi-chan (vat "bac-thang")', 'bac-thang');
  chan(dat1(dat1(trong(7), 3, 1, 'o'), 4, 3, 'o'), { bd, chat: dat1(trong(7), 3, 1, 's'), truoc: [PHAI.trim()] }, 'thả khi trước mũi đã có một vật nằm sẵn (gỗ): tha-bi-chan (vat "vat"), mỗi ô một vật', 'vat');
  // sau khi bị chặn, đổi hướng rồi thả được: quay phải rồi (thả không được), quay trái hai lần để hướng sang trái (ô trống)
  const sau = chay(tu, bd, L(HUT, PHAI, THA, TRAI, TRAI, THA), { vatChat: dat1(trong(7), 3, 1, 's') });
  kiem('bị chặn rồi quay sang ô trống và thả lại: thả được (tha-vat), cam null, nam châm tắt', maSK(sau, 'tha-bi-chan').length === 1 && ev(sau, 'tha-vat').length === 1 && sau.namCham.cam === null && sau.namCham.bat === false, J(sau.suKien.map((e) => e.ma)));
  // thả xuống ô đích → thắng
  const winOk = chay(['.o.', '.D.', '...'], { x: 1, y: 2, huong: 0 }, L(HUT, 'magnet_off()', 'wait()'), { mucTieu: 'dua-vat', vatCan: 'sat', vatChat: ['.s.', '...', '...'] });
  kiem('xe ở (1,2), vật (1,0) bị hút, đích (1,1) ngay trước mũi: thả → thắng, đúng 2 nhịp, sự kiện xong-dua-vat', winOk.thang && winOk.nhip === 2 && ev(winOk, 'xong-dua-vat').length === 1, J([winOk.thang, winOk.nhip]));
  const dangDinh = chay(['.o.', '.D.', '...'], { x: 1, y: 2, huong: 0 }, HUT, { mucTieu: 'dua-vat', vatCan: 'sat', vatChat: ['.s.', '...', '...'] });
  kiem('vật đang dính (ở mũi xe) trên ô trước đích thì chưa tính: chưa thắng', !dangDinh.thang);
  // thứ tự trong nhịp: thả TRƯỚC khi bánh chạy
  const tt = chay(['.o.', '...', '.D.', '...'], { x: 1, y: 2, huong: 0 }, L(HUT, 'magnet_off()', 'left_move()', 'right_move()', 'wait()'), { vatChat: ['.s.', '...', '...', '...'], mucTieu: 'dua-vat', vatCan: 'sat' });
  kiem('thả chung nhịp với lệnh đi: thả TRƯỚC (xuống ô trước mũi cũ (1,1)), rồi xe mới đi: vật vừa thả chiếm ô nên xe đâm vật (dam-tuong, vat "vat"), đứng yên ở (1,2)', vatCua(tt, 1).x === 1 && vatCua(tt, 1).y === 1 && vatCua(tt, 1).trangThai === 'dat' && tt.robot.y === 2 && tt.namCham.cam === null && maSK(tt, 'dam-tuong').length === 1 && maSK(tt, 'dam-tuong')[0].vat === 'vat', J([tt.robot, tt.vat, maSK(tt, 'dam-tuong')]));
}

/* ============================================================================ 4. THỨ TỰ LỆNH, GỘP NHỊP, QUÊN WAIT */
console.log('\n== 4. Thứ tự lệnh trong nhịp, gộp nhịp, quên wait(), gọi lại ==');
{
  const rows = dat1(trong(7), 3, 0, 'o'), chat = dat1(trong(7), 3, 0, 's');
  const g = chay(rows, { x: 3, y: 3, huong: 0 }, L('magnet_on()', TIEN), { vatChat: chat });
  kiem('magnet_on() chung nhịp với một bước đi: một nhịp, hút ở CUỐI nhịp sau khi xe đã đi (vật từ cách 3 ô còn cách 2 ô nên bị hút)', g.nhip === 1 && g.namCham.cam === 1 && g.robot.y === 2, J([g.nhip, g.namCham, g.robot]));
  const g2 = chay(rows, { x: 3, y: 3, huong: 0 }, L(HUT, TIEN), { vatChat: chat });
  kiem('nếu magnet_on() có wait() riêng thì một nhịp tốn thêm: hai nhịp, vật chưa trong tầm ở nhịp 1 nhưng bị hút ở nhịp 2', g2.nhip === 2 && g2.namCham.cam === 1 && nhipVet(g2)[0].robot.namCham.cam === null);
  const q = chay(rows, { x: 3, y: 3, huong: 0 }, 'magnet_on()');
  kiem('quên wait(): lệnh không chạy, quen-wait liệt kê magnet_on, nam châm vẫn tắt', maSK(q, 'quen-wait').length === 1 && maSK(q, 'quen-wait')[0].lenh[0].ten === 'magnet_on' && q.namCham.bat === false && q.nhip === 0);
  const gl = chay(rows, { x: 3, y: 3, huong: 0 }, L('magnet_on()', 'magnet_off()', 'wait()'));
  kiem('hai lệnh nam châm cùng nhịp: lệnh sau bị bỏ (magnet-goi-lai { ten, dongPy, truoc }), nam châm bật', maSK(gl, 'magnet-goi-lai').length === 1 && maSK(gl, 'magnet-goi-lai')[0].ten === 'magnet_off' && maSK(gl, 'magnet-goi-lai')[0].truoc.ten === 'magnet_on' && gl.namCham.bat === true, J(gl.suKien));
  const gl2 = chay(rows, { x: 3, y: 3, huong: 0 }, L('magnet_on()', 'wait()', 'magnet_on()', 'wait()'));
  kiem('bật rồi bật lại ở hai nhịp khác nhau: không phải gọi lại', maSK(gl2, 'magnet-goi-lai').length === 0 && gl2.namCham.bat === true);
  const bw = chay(rows, { x: 3, y: 3, huong: 0 }, L('magnet_on()', 'wait()', 'magnet_off()'));
  kiem('wait rồi lại ra lệnh không wait → quen-wait', maSK(bw, 'quen-wait').length === 1 && bw.namCham.bat === true);
  const lt = chay(rows, { x: 3, y: 3, huong: 0 }, L('magnet_on()', 'left_move()', 'wait()'));
  kiem('lệnh nam châm không chiếm bánh: magnet_on() cùng left_move() không banh-goi-lai', maSK(lt, 'banh-goi-lai').length === 0 && lt.namCham.bat === true && lt.robot.huong === 1);
  kiem('vết lệnh có mục lệnh magnet_on / magnet_off với dongPy', (() => {
    const v = chay(rows, { x: 3, y: 3, huong: 0 }, L('wait()', 'magnet_on()', 'wait()', 'magnet_off()', 'wait()')).vet.filter((e) => e.loai === 'lenh' && /^magnet/.test(e.ten));
    return v.length === 2 && v[0].dongPy === 2 && v[1].dongPy === 4;
  })());
}

/* ============================================================================ 5. LOẠI ROBOT, KHÔNG CÓ TAY, XUNG ĐỘT TAY */
console.log('\n== 5. Omni và xích có nam châm; không có tay nam châm; nhện; xung đột tay ==');
{
  const rows = dat1(dat1(trong(7), 1, 2, 'o'), 5, 4, 'D'), chat = dat1(trong(7), 1, 2, 's');
  const om = SanHoc.chay({ san: rows, batDau: { x: 1, y: 4, huong: 0 }, loaiRobot: 'omni', hamGoc: OMNI.concat(NC), mucTieu: 'dua-vat', vatCan: 'sat', vatChat: chat },
    L(HUT, 'slide_right()', 'wait()', 'slide_right()', 'wait()', 'slide_right()', 'wait()', 'slide_right()', 'wait()', 'magnet_off()', 'wait()'));
  kiem('omni: hút (cách 2 ô), trượt phải 4 lần giữ hướng mặt, vật dính theo, thả xuống ô trước mũi (5,3)... vật nằm đúng ô trước mũi', om.namCham.cam === null && vatCua(om, 1).trangThai === 'dat' && vatCua(om, 1).x === 5 && vatCua(om, 1).y === 3 && om.robot.huong === 0, J([om.robot, om.vat]));
  const om2 = SanHoc.chay({ san: ['...', '.o.', '...', '...'], batDau: { x: 1, y: 3, huong: 0 }, loaiRobot: 'omni', hamGoc: OMNI.concat(NC), vatChat: ['...', '.s.', '...', '...'] }, L('magnet_on()', 'slide_right()', 'wait()'));
  kiem('omni: magnet_on() chung nhịp với slide_right(): trượt xong cột mới không có vật nên không hút (hút sau khi trượt, ở cột mới)', om2.namCham.cam === null && om2.robot.x === 2);
  const om3 = SanHoc.chay({ san: ['...', '.o.', '...', '...'], batDau: { x: 0, y: 3, huong: 0 }, loaiRobot: 'omni', hamGoc: OMNI.concat(NC), vatChat: ['...', '.s.', '...', '...'] }, L('magnet_on()', 'slide_right()', 'wait()'));
  kiem('omni: trượt vào cột có vật cách 2 ô cùng nhịp với magnet_on(): hút ngay ở cuối nhịp', om3.namCham.cam === 1 && om3.robot.x === 1);
  const xi = SanHoc.chay({ san: ['...', '.o.', '...', '...'], batDau: { x: 1, y: 3, huong: 0 }, loaiRobot: 'xich', hamGoc: BANH.concat(NC), vatChat: ['...', '.s.', '...', '...'] }, HUT);
  kiem('xích gắn được nam châm: hút như xe bánh', xi.namCham.cam === 1);
  const khong = SanHoc.chay({ san: ['...', '.o.', '...'], batDau: { x: 1, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH }, 'magnet_on()\nwait()');
  kiem('robot không có tay nam châm: gọi magnet_on() là lỗi "chưa có hàm", namCham null', khong.loi && khong.loi.loai === 'runtime-error' && /Chưa có biến hay hàm/.test(khong.loi.thongDiep) && khong.namCham === null);
  const khong2 = SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release']) }, 'wait()');
  kiem('robot tay kẹp: kết quả namCham null, vết nhịp không có robot.namCham', khong2.namCham === null && !('namCham' in nhipVet(khong2)[0].robot));
  kiem('nhện không gắn nam châm: ném lỗi', /Nhện không gắn nam châm/.test(loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'nhen', hamGoc: ['go_up', 'wait', 'magnet_on', 'magnet_off'] }, 'wait()')) || ''));
  kiem('nhện không gắn cảm biến từ front_metal: ném lỗi', /Nhện không gắn cảm biến/.test(loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'nhen', hamGoc: ['go_up', 'wait', 'front_metal'] }, 'wait()')) || ''));
  kiem('một robot một tay: nam châm không đi chung tay kẹp', /chỉ có một tay/.test(loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC, ['arm_down', 'grab']) }, 'wait()')) || ''));
  kiem('một robot một tay: nam châm không đi chung tấm đẩy', /chỉ có một tay/.test(loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC, ['push']) }, 'wait()')) || ''));
  kiem('hàm gốc lạ vẫn bị từ chối', /không thuộc loại robot/.test(loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['magnet_x']) }, 'wait()')) || ''));
  kiem('vatCan lạ: ném lỗi', /vatCan lạ/.test(loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'banh', vatCan: 'dong' }, 'wait()')) || ''));
}

/* ============================================================================ 6. CẢM BIẾN TỪ front_metal() */
console.log('\n== 6. front_metal(): sắt trong tầm → True; không tốn nhịp; sự kiện doc-cam-bien (cam "tu") ==');
{
  const bd = { x: 3, y: 3, huong: 0 };
  const mk = (cacVat) => { let rows = trong(7), chat = trong(7); for (const [y, c] of cacVat) { rows = dat1(rows, 3, y, 'o'); chat = dat1(chat, 3, y, c === 's' ? 's' : '.'); } return { rows, chat }; };
  const bang = [
    ['sắt ở ô 1', [[2, 's']], true], ['sắt ở ô 2', [[1, 's']], true], ['sắt ở ô 3', [[0, 's']], false], ['gỗ ở ô 1', [[2, 'g']], false], ['gỗ ở ô 2', [[1, 'g']], false],
    ['gỗ ô 1 + sắt ô 2', [[2, 'g'], [1, 's']], false], ['sắt ô 1 + gỗ ô 2', [[2, 's'], [1, 'g']], true], ['trống', [], false]
  ];
  for (const [ten, vs, kv] of bang) {
    const { rows, chat } = mk(vs);
    const k = chay(rows, bd, 'a = front_metal()', { vatChat: chat });
    kiem('(có vatChat) front_metal() ' + ten + ' → ' + kv, doc(k)[0].trong === kv, J(doc(k)[0]));
  }
  // tường chắn
  const { rows: rw, chat: ct } = mk([[1, 's']]);
  const kt = chay(dat1(rw, 3, 2, '#'), bd, 'a = front_metal()', { vatChat: ct });
  kiem('tường ở ô 1 chắn: front_metal() = False', doc(kt)[0].trong === false && doc(kt)[0].khoang === 0 && doc(kt)[0].o === null);
  // sự kiện: trường
  const { rows: r2, chat: c2 } = mk([[1, 's']]);
  const ev = chay(r2, bd, L('a = front_metal()', 'left_move()', 'right_move()', 'wait()'), { vatChat: c2 });
  const d = doc(ev)[0];
  kiem('docCamBien { cam "tu", ham, tu, huong, o, khoang, chat "sat", idVat, trong, nhip }', d.ma === 'doc-cam-bien' && d.cam === 'tu' && d.tu.y === 3 && d.huong === 0 && d.o.y === 1 && d.khoang === 2 && d.chat === 'sat' && d.idVat === 1 && d.trong === true && d.nhip === 0, J(d));
  kiem('sự kiện doc-cam-bien nằm trong suKien của nhịp kế tiếp', nhipVet(ev)[0].suKien[0].ma === 'doc-cam-bien' && nhipVet(ev)[0].suKien[0].cam === 'tu');
  const g = chay(dat1(trong(7), 3, 2, 'o'), bd, 'a = front_metal()');
  kiem('vật gỗ đầu tiên: chat "go", trong false', doc(g)[0].chat === 'go' && doc(g)[0].trong === false);
  const k0 = chay(trong(7), bd, L(...Array(40).fill('front_metal()')));
  kiem('40 lần đọc không tốn nhịp: nhịp 0, soLanDoc 40, không quen-wait, xe đứng yên', k0.nhip === 0 && k0.soLanDoc === 40 && maSK(k0, 'quen-wait').length === 0 && k0.robot.y === 3);
  const vo = chay(trong(7), bd, 'while front_metal() == False:\n    pass');
  kiem('while front_metal() == False: pass — quá 1000 lần đọc không có nhịp thì dừng, infinite-loop', vo.loi && vo.loi.loai === 'infinite-loop' && vo.soLanDoc === 1001);
  const hon = chay(trong(7), bd, L(...Array(600).fill('front_metal()'), ...Array(600).fill('color()')), { hamGoc: BANH.concat(NC, TU, ['color']) });
  kiem('front_metal chung bộ đếm 1000 lần với cảm biến khác (600 + 600 → infinite-loop)', hon.loi && hon.loi.loai === 'infinite-loop');
  const ngoac = chay(trong(7), bd, 'while not front_metal():\n    left_move()\n    right_move()\n    wait()');
  kiem('while not front_metal(): move — không có sắt thì xe đi hết sân rồi húc tường tới nhipToiDa (qua-nhieu-nhip)', ngoac.loi && ngoac.loi.loai === 'qua-nhieu-nhip');
  // điều kiện dùng trong if / while
  const w = chay(dat1(dat1(trong(7), 3, 0, 'o'), 3, 1, 'o'), { x: 3, y: 6, huong: 0 }, 'while not front_metal():\n    left_move()\n    right_move()\n    wait()', { vatChat: dat1(trong(7), 3, 0, 's') });
  kiem('while not front_metal(): tiến — xe dừng khi sắt vào tầm; vật gỗ ở ô 1 làm front_metal False nên xe đi tiếp, dừng khi đứng trên vật gỗ', w.robot.y === 2 || w.robot.y === 1, J(w.robot));
  // robot không có cảm biến từ
  const khong = chay(trong(7), bd, 'a = front_metal()', { hamGoc: BANH.concat(NC) });
  kiem('hamGoc không có front_metal: gọi là lỗi "chưa có hàm"', khong.loi && /Chưa có biến hay hàm/.test(khong.loi.thongDiep));
  kiem('SanHoc.laHamCamBien nhận front_metal; CAM_TU_HAM, TAY_NAM_CHAM xuất ra', SanHoc.laHamCamBien('front_metal') && SanHoc.laHamCamBien('front_clear') && SanHoc.laHamCamBien('color') && !SanHoc.laHamCamBien('magnet_on') && SanHoc.CAM_TU_HAM[0] === 'front_metal' && SanHoc.TAY_NAM_CHAM.length === 2 && SanHoc.TAM_HUT === 2);
  kiem('front_metal() = bật nam châm lúc này sẽ hút được: so với kết quả hút thật ở cả tám ca trên', bang.every(([ten, vs, kv]) => {
    const { rows, chat } = mk(vs);
    const k = chay(rows, bd, HUT, { vatChat: chat });
    return (k.namCham.cam !== null) === kv;
  }));
}

/* ============================================================================ 7. vatChat, vatThem, vatCan */
console.log('\n== 7. Lớp vatChat / vatThem; vatCan "sat"; đích có màu ==');
{
  const od = SanHoc.docSan(['oD.', 'X..'], null, null, ['s..', 'g..']);
  kiem('docSan: vật theo lớp vatChat (s sắt, g gỗ), đích X giữ vật sắt hay gỗ', od.vat.length === 2 && od.vat[0].chat === 'sat' && od.vat[1].chat === 'go' && od.dich.length === 2, J(od.vat));
  const od2 = SanHoc.docSan(['oD.', 'X..']);
  kiem('docSan không có lớp chất: vật không có trường chat (các sân cũ giữ nguyên dạng)', od2.vat.every((v) => !('chat' in v)));
  kiem('lớp chất đặt ở ô không có vật: lỗi cấu hình', /không có vật/.test(loi(() => SanHoc.docSan(['o..', '...'], null, null, ['.s.', '...'])) || ''));
  kiem('ký hiệu lạ trong lớp chất (x): lỗi; lớp sai cỡ: lỗi', /Ký hiệu lạ trong lớp chất/.test(loi(() => SanHoc.docSan(['o..', '...'], null, null, ['x..', '...'])) || '') && /cùng cỡ/.test(loi(() => SanHoc.docSan(['o..', '...'], null, null, ['s.', '...'])) || '') && /mảng 2 chuỗi/.test(loi(() => SanHoc.docSan(['o..', '...'], null, null, ['s..'])) || ''));
  kiem('lopMauCuaSan: màn một sân trả nguyên lớp; màn nhiều sân trả lớp của sân thứ i; có vatChat và vatThem', (() => {
    const m1 = { san: ['o'], vatChat: ['s'], vatThem: [{ x: 0, y: 0 }] };
    const m2 = { san: [['o'], ['o']], vatChat: [['s'], ['.']], vatThem: [[{ x: 1, y: 1 }], [{ x: 2, y: 2 }]] };
    const a = SanHoc.lopMauCuaSan(m1, 0), b = SanHoc.lopMauCuaSan(m2, 1);
    return a.vatChat[0] === 's' && a.vatThem.length === 1 && b.vatChat[0] === '.' && b.vatThem[0].x === 2 && SanHoc.lopMauCuaSan({ san: ['o'] }, 0).vatChat === null;
  })());

  // vatCan 'sat'
  const chat = ['s..', '...', '...'];
  // hai vật: sắt (0,0) id 1, gỗ (2,0) id 2; đích (1,1); xe ở (0,2) quay lên
  const hai = { san: ['o.o', '.D.', '...'], vatChat: chat, batDau: { x: 0, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat' };
  const lamDay = L(HUT, 'left_move()', 'right_move()', 'wait()', PHAI, THA);       // hút (0,0), tiến lên (0,1), rẽ phải (mũi xe nhìn (1,1)), thả
  const k7 = SanHoc.chay(Object.assign({}, hai, { vatCan: 'sat' }), lamDay);
  kiem('vatCan "sat": hút vật sắt, tiến lên, rẽ phải, thả vào đích (1,1): thắng dù vật gỗ nằm yên ở (2,0)', k7.thang === true && vatCua(k7, 2).x === 2 && vatCua(k7, 2).y === 0 && vatCua(k7, 1).x === 1 && vatCua(k7, 1).y === 1, J([k7.thang, k7.vat]));
  const khongCan = SanHoc.chay(hai, lamDay);
  kiem('không khai vatCan: phải đưa MỌI vật (kể cả gỗ) tới đích — cùng chương trình đó thì chưa thắng', khongCan.thang === false && khongCan.vat.length === 2);
  const khongSat = SanHoc.chay({ san: ['.o.', '.D.', '...'], batDau: { x: 1, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat', vatCan: 'sat' }, L(HUT, THA));
  kiem('vatCan "sat" mà sân không có vật sắt: không bao giờ thắng', khongSat.thang === false);
  kiem('chua-dua-vat nói "vật sắt" khi vatCan sat, đếm đúng số vật sắt còn lại', (() => {
    const m = Object.assign({}, man(1), { san: ['.o.', '.D.', '...'], batDau: { x: 1, y: 2, huong: 0 }, vatChat: ['.s.', '...', '...'] });
    const r = ChamHoc.cham(m, { chinh: ['wait()'] }, []);
    const c = r.chanDoan.find((x) => x.ma === 'chua-dua-vat');
    return c && /vật sắt/.test(c.loi) && c.conLai === 1 && c.tong === 1;
  })());
  // vatThem
  const vt = chay(['...', '...'], { x: 0, y: 1, huong: 0 }, 'wait()', { vat: [{ x: 0, y: 0, chat: 'sat' }, { x: 0, y: 0, chat: 'go' }, { x: 5, y: 5 }] });
  kiem('cfg.vat: mỗi ô một vật (ô trùng bị bỏ), ô ngoài sân bị bỏ', vt.vat.length === 1 && vt.vat[0].chat === 'sat');
  // đích có màu + nam châm
  const dm = SanHoc.chay({ san: ['.o.', '.D.', '...'], mau: ['...', '.r.', '...'], vatMau: ['.b.', '...', '...'], vatChat: ['.s.', '...', '...'], batDau: { x: 1, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat', vatCan: 'sat' }, L(HUT, THA));
  kiem('đích đỏ, vật sắt xanh dương: thả xuống đích khác màu → dat-sai-mau, chưa thắng; vật vẫn nằm đó', !dm.thang && maSK(dm, 'dat-sai-mau').length === 1 && maSK(dm, 'dat-sai-mau')[0].mauVat === 'blue' && maSK(dm, 'dat-sai-mau')[0].mauDich === 'red' && vatCua(dm, 1).trangThai === 'dat');
  const dm2 = SanHoc.chay({ san: ['.o.', '.D.', '...'], mau: ['...', '.r.', '...'], vatMau: ['.r.', '...', '...'], vatChat: ['.s.', '...', '...'], batDau: { x: 1, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat', vatCan: 'sat' }, L(HUT, THA));
  kiem('đích đỏ, vật sắt đỏ: thắng', dm2.thang === true);
  // color() là cảm biến BỤNG (14/10): luôn đọc màu SÀN dưới xe, kể cả lúc đang dính vật (vật dính không tính)
  const cm = SanHoc.chay({ san: ['.o.', '...', '...'], vatMau: ['.r.', '...', '...'], mau: ['...', '...', '.y.'], vatChat: ['.s.', '...', '...'], batDau: { x: 1, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC, ['color']) }, L('a = color()', HUT, 'b = color()'));
  const dc = doc(cm);
  kiem('color() (cảm biến bụng): vật sắt đỏ dính ở mũi xe mà color() vẫn là màu SÀN dưới xe "yellow" (trước và sau khi dính; nguon "san", idVat null)', dc.length === 2 && dc.every((x) => x.mau === 'yellow' && x.nguon === 'san' && x.idVat === null && x.cam === 'mau') && cm.namCham.cam === 1, J(dc));
  const cm2 = SanHoc.chay({ san: ['.o.', '...', '...'], mau: ['...', '...', '.g.'], vatChat: ['.s.', '...', '...'], batDau: { x: 1, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC, ['color']) }, L(HUT, 'a = color()', 'magnet_off()', 'wait()', 'b = color()'));
  const dc2 = doc(cm2);
  kiem('vật sắt KHÔNG màu đang dính: color() vẫn là màu sàn "green" (không phải "none" của vật); thả vật xong vẫn "green"', dc2.length === 2 && dc2.every((x) => x.mau === 'green' && x.nguon === 'san'), J(dc2));
  // xe mang vật sắt đi qua ô màu: đọc đúng vạch (cơ sở của 14.10: quay về ô vàng khi đang dính vật)
  const cm3 = SanHoc.chay({ san: ['.o..', '....'], mau: ['..y.', '....'], vatChat: ['.s..', '....'], batDau: { x: 3, y: 0, huong: 3 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC, ['color']) }, L('magnet_on()', 'wait()', 'x = color()', TIEN, 'y = color()'));
  kiem('xe đang dính vật sắt đi qua ô vàng: color() đọc đúng sàn mỗi ô ("none" rồi "yellow"), nguon "san"', (() => { const x = doc(cm3); return x.length === 2 && x[0].mau === 'none' && x[1].mau === 'yellow' && x.every((q) => q.nguon === 'san') && cm3.namCham.cam === 1; })(), J(doc(cm3)));
}

/* ============================================================================ 8. CHẨN ĐOÁN, SÂN THỬ */
console.log('\n== 8. Chẩn đoán tiếng Việt; chấm nhiều sân có vatChat; sân thử của Xưởng ==');
{
  const m1 = man(1);
  const run = (m, chinh, kho) => ChamHoc.cham(m, { chinh }, kho || []);
  const r1 = run(m1, ['magnet_on()', 'wait()', 'turn_right()', 'magnet_off()', 'wait()'], khoTruoc('19.1'));
  const cd = (r, ma) => r.chanDoan.find((c) => c.ma === ma);
  const tb = cd(r1, 'tha-bi-chan');
  kiem('tha-bi-chan: không có vì thả được xuống ô trống (đây là thả sớm, chưa tới đích)', !tb && cd(r1, 'chua-dua-vat'));
  const r2 = run(man(4), ['move()', 'move()', 'magnet_on()', 'wait()', 'magnet_off()', 'wait()'], khoTruoc('19.4'));
  const tb2 = cd(r2, 'tha-bi-chan');
  kiem('tha-bi-chan (lỗi): nói ô trước mũi là gì (bậc thang), vật vẫn dính, nam châm vẫn bật, chỉ dòng lệnh magnet_off', tb2 && tb2.muc === 'loi' && /bậc thang/.test(tb2.loi) && /vẫn dính/.test(tb2.loi) && tb2.cho && tb2.cho.cot === 'chinh' && tb2.cho.dong === 5 && tb2.nhip === 4, J(tb2));
  const r3 = run(man(2), ['magnet_on()', 'wait()'], khoTruoc('19.2'));
  const hg = cd(r3, 'hut-go');
  kiem('hut-go (thông tin, không phải lỗi): nói vật gỗ chắn đường hút; gợi ý front_metal', hg && hg.muc === 'thong-tin' && /vật GỖ/.test(hg.loi) && /front_metal/.test(hg.loi) && hg.khoang === 1, J(hg));
  const r4 = run(man(1), ['magnet_on()', 'magnet_off()', 'wait()'], khoTruoc('19.1'));
  const ml = cd(r4, 'magnet-goi-lai');
  kiem('magnet-goi-lai (lỗi): nói lệnh trước giữ nam châm, chỉ cả hai dòng', ml && ml.muc === 'loi' && /magnet_on/.test(ml.loi) && /magnet_off/.test(ml.loi) && ml.cho.dong === 2 && ml.choTruoc.dong === 1, J(ml));
  const r5 = run(man(1), ['magnet_on()'], khoTruoc('19.1'));
  const qw = cd(r5, 'quen-wait');
  kiem('quen-wait tính magnet_on là lệnh tay: "chưa có wait() theo sau"', qw && /lệnh tay/.test(qw.loi) && /magnet_on\(\)/.test(qw.loi), J(qw && qw.loi));
  const m6 = man(6);
  const r6 = ChamHoc.cham(Object.assign({}, m6, { hamGoc: m6.hamGoc.filter((t) => t !== 'front_metal') }), { chinh: ['while not front_metal():', '    move()'] }, khoTruoc('19.6'));
  const cg = cd(r6, 'chua-gan-cam-bien');
  kiem('chua-gan-cam-bien (robot có cảm biến khoảng cách nhưng màn chưa cho front_metal): liệt kê hàm cảm biến dùng được, nói chưa có front_metal()', cg && /chưa có front_metal\(\)/.test(cg.loi) && /front_clear\(\)/.test(cg.loi) && cg.ten === 'front_metal', J(cg && cg.loi));
  const r6b = ChamHoc.cham(Object.assign({}, m6, { hamGoc: ['left_move', 'right_move', 'wait', 'magnet_on', 'magnet_off'] }), { chinh: ['a = front_metal()'] }, []);
  kiem('chua-gan-cam-bien (robot chưa gắn cảm biến nào): nói rõ cảm biến từ (kim loại) và tên hàm', cd(r6b, 'chua-gan-cam-bien') && /từ \(kim loại\)/.test(cd(r6b, 'chua-gan-cam-bien').loi) && /front_metal/.test(cd(r6b, 'chua-gan-cam-bien').loi), J(r6b.chanDoan.map((c) => c.loi)));

  // nhiều sân có vatChat
  const r7 = ChamHoc.cham(m6, m6.loiGiai, tron(khoTruoc('19.6'), []));
  kiem('14.6 (3 sân, vatChat song song): lời giải thắng cả ba, mỗi sân một mục theoSan, soNhip = tổng', r7.thang && r7.theoSan.length === 3 && r7.theoSan.every((s) => s.thang) && r7.soNhip === r7.theoSan.reduce((a, s) => a + s.soNhip, 0) && r7.nhipTong === r7.soNhip, J(r7.theoSan.map((s) => s.soNhip)));
  kiem('kết quả cham có namCham (trạng thái cuối) và vật có chat', r7.namCham && r7.namCham.bat === false && r7.vat.some((v) => v.chat === 'sat') && r7.theoSan.some((s) => s.vat.some((v) => v.chat === 'go')), J(r7.vat));

  // sân thử
  const st = ChamHoc.chuanSanThu({ rong: 5, cao: 5, batDau: { x: 2, y: 4, huong: 0 }, vat: [{ x: 2, y: 2, chat: 'sat' }, { x: 1, y: 1 }, { x: 9, y: 9, chat: 'sat' }] });
  kiem('chuanSanThu: vật giữ chat "sat", vật thường không có trường chat, vật ngoài sân bị bỏ', st.vat.length === 2 && st.vat[0].chat === 'sat' && !('chat' in st.vat[1]), J(st.vat));
  const mT = man(3);
  const kT = ChamHoc.thuHam(mT, { chinh: [] }, 'fetch', tron(khoTruoc('19.3'), [hF()]), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 0, chat: 'sat' }] } });
  function hF() { return H('fetch', ['magnet_on()', 'wait()', 'u_turn()', 'move()', 'magnet_off()', 'wait()']); }
  kiem('Xưởng: thử fetch() trên sân thử 5×5 (xe (2,2) quay lên, vật sắt (2,0)): hút, quay đầu, tiến một ô, thả — nam châm tắt, vật nằm yên ở (2, 4), xe ở (2, 3) quay xuống, không chẩn đoán', kT.namCham && kT.namCham.cam === null && kT.namCham.bat === false && kT.vat[0].trangThai === 'dat' && kT.vat[0].x === 2 && kT.vat[0].y === 4 && kT.robot.y === 3 && kT.robot.huong === 2 && maCua(kT).length === 0, J([kT.vat, kT.robot, maCua(kT)]));
  const kT2 = ChamHoc.thuHam(mT, { chinh: [] }, 'fetch', tron(khoTruoc('19.3'), [hF()]), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 0 }] } });
  kiem('Xưởng: vật gỗ trong sân thử không dính; có hut-go (thông tin) và vật vẫn nằm ở (2, 0)', maCua(kT2).includes('hut-go') && kT2.vat[0].trangThai === 'dat' && kT2.vat[0].y === 0 && kT2.chanDoan.find((c) => c.ma === 'hut-go').muc === 'thong-tin');
}

/* ============================================================================ 9. BỘ DÒ ĐƯỜNG TẮT */
console.log('\n== 9. Bộ dò đường tắt nam châm (do-duong-nam-cham.mjs): luật y hệt san-hoc.js ==');
{
  // ca nhỏ biết trước đáp án
  const mk = (rows, chat, bd, extra) => Object.assign({ san: rows, vatChat: chat, batDau: bd, loaiRobot: 'banh', vatCan: 'sat' }, extra || {});
  const a = mk(['.....', '..o..', '.....', '....D', '.....'], ['.....', '..s..', '.....', '.....', '.....'], { x: 2, y: 3, huong: 0 });
  kiem('bộ dò: màn 14.1 kiểu: hút, rẽ phải, tiến, thả = 4 nhịp tách; gộp cũng 4', nhipNamChamNganNhat(a, { tachNhip: true }).nhip === 4 && nhipNamChamNganNhat(a).nhip === 4);
  const b = mk(['.....', '..oD.', '..o..', '.....', '.....'], ['.....', '..s..', '.....', '.....', '.....'], { x: 2, y: 3, huong: 0 });
  const bTach = nhipNamChamNganNhat(b, { tachNhip: true });
  const iOn = bTach.chuoi.findIndex((a) => a.nc === 'on'), iTien = bTach.chuoi.findIndex((a) => a.banh === BoDo.TIEN);
  kiem('bộ dò: gỗ ngay trước mặt chiếm ô và chắn sắt đứng sau: không đi xuyên, không hút xuyên; tách 9, gộp < 9; đường ngắn nhất rẽ sang bên và tiến TRƯỚC khi magnet_on', bTach.nhip === 9 && nhipNamChamNganNhat(b).nhip < 9 && iTien >= 0 && iTien < iOn && bTach.chuoi.slice(0, iOn).every((a) => a.nc === null), J(bTach.chuoi));
  kiem('bộ dò: gỗ chiếm ô chặn xe cả khi lối thẳng duy nhất (hành lang một ô rộng, cột bị gỗ chắn, hai bên tường) → null', nhipNamChamNganNhat(mk(['#D#', '#o#', '#o#', '#.#'], ['...', '.s.', '...', '...'], { x: 1, y: 3, huong: 0 })).nhip === null);
  const c = mk(['.....', '.###.', '.#o#.', '.###.', '....D'], ['.....', '.....', '..s..', '.....', '.....'], { x: 0, y: 0, huong: 0 });
  kiem('bộ dò: vật sắt nhốt trong tường kín, ngoài tầm nhìn thẳng: không giải được → null', nhipNamChamNganNhat(c).nhip === null);
  const d = mk(['.....', '.....', '..o..', '.....', '..D..'], ['.....', '.....', '..s..', '.....', '.....'], { x: 2, y: 0, huong: 2 });
  kiem('bộ dò: tách nhịp luôn >= gộp nhịp (và hành động dayDu không tệ hơn thường)', nhipNamChamNganNhat(d, { tachNhip: true }).nhip >= nhipNamChamNganNhat(d).nhip && nhipNamChamNganNhat(d, { dayDu: true }).nhip <= nhipNamChamNganNhat(d).nhip);
  kiem('bộ dò: không có vật cần (vatCan sat, sân toàn gỗ) → không thắng được: null', nhipNamChamNganNhat(mk(['.o.', '.D.', '...'], null, { x: 1, y: 2, huong: 0 })).nhip === null);
  kiem('bộ dò: loại robot lạ (nhện) → ném lỗi', /chỉ biết xe bánh và omni/.test(loi(() => nhipNamChamNganNhat(Object.assign({}, a, { loaiRobot: 'nhen' }))) || ''));
  // chuoiThanhMa chạy đúng trên SanHoc
  const kq = nhipNamChamNganNhat(a, { tachNhip: true });
  const ma = chuoiThanhMa(kq.chuoi);
  const sh = SanHoc.chay({ san: a.san, vatChat: a.vatChat, batDau: a.batDau, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat', vatCan: 'sat' }, ma);
  kiem('chuỗi hành động của bộ dò đổi sang Python rồi chạy thật trên san-hoc.js: thắng đúng số nhịp bộ dò báo', sh.thang && sh.nhip === kq.nhip, J([sh.thang, sh.nhip, kq.nhip]));

  // so chéo ngẫu nhiên
  let seed = 20261014;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  let soCa = 0, lech = 0, soNhip = 0, soHut = 0, soTha = 0, soThang = 0, soChan = 0; const ghiLech = [];
  for (let ca = 0; ca < 1600; ca++) {
    const omni = ca % 4 === 3;
    const loai = omni ? 'omni' : 'banh';
    const rong = 5 + Math.floor(rnd() * 2), cao = 5;
    let g = Array.from({ length: cao }, () => Array(rong).fill('.'));
    const o = () => [Math.floor(rnd() * rong), Math.floor(rnd() * cao)];
    for (let i = 0; i < 4; i++) { const [x, y] = o(); g[y][x] = '#'; }
    for (let i = 0; i < 2; i++) { const [x, y] = o(); if (g[y][x] === '.') g[y][x] = 'S'; }
    for (let i = 0; i < 3; i++) { const [x, y] = o(); if (g[y][x] === '.') g[y][x] = pick(['>', '<', '^', 'v']); }
    const nVat = 2 + Math.floor(rnd() * 2);
    const chatRows = Array.from({ length: cao }, () => Array(rong).fill('.'));
    let dem = 0;
    for (let t = 0; t < 40 && dem < nVat; t++) { const [x, y] = o(); if (g[y][x] === '.') { g[y][x] = 'o'; if (rnd() < 0.65) chatRows[y][x] = 's'; dem++; } }
    for (let i = 0; i < 2; i++) { const [x, y] = o(); if (g[y][x] === '.') g[y][x] = 'D'; else if (g[y][x] === 'o') g[y][x] = 'X'; }
    let xe = null;
    for (let t = 0; t < 60 && !xe; t++) { const [x, y] = o(); if (g[y][x] !== '#' && g[y][x] !== 'S') xe = { x, y, huong: Math.floor(rnd() * 4) }; }
    if (!xe) continue;
    const rows = g.map((r) => r.join('')), chat = chatRows.map((r) => r.join(''));
    const man0 = { san: rows, vatChat: chat, batDau: xe, loaiRobot: loai, vatCan: rnd() < 0.5 ? 'sat' : undefined };
    let ctx;
    try { ctx = dungNguCanh(man0); } catch (e) { continue; }
    const HD = hanhDongTuDo(ctx, { dayDu: true });
    const dai = 10 + Math.floor(rnd() * 14);
    const chuoi = Array.from({ length: dai }, () => pick(HD));
    // mô phỏng bằng bộ dò: dừng khi thắng
    let S = trangThaiDau(ctx), nhipDo = 0, thangDo = false;
    const trace = [];
    for (const ac of chuoi) { S = buocMotNhip(ctx, S, ac); nhipDo++; trace.push(S); if (laThang(ctx, S)) { thangDo = true; break; } }
    // chạy thật
    const code = chuoiThanhMa(chuoi.slice(0, nhipDo));
    const res = SanHoc.chay({ san: rows, vatChat: chat, batDau: xe, loaiRobot: loai, hamGoc: (omni ? OMNI : BANH).concat(NC), mucTieu: 'dua-vat', vatCan: man0.vatCan }, code);
    soCa++;
    const nv = nhipVet(res);
    let ok = res.thang === thangDo && nv.length === nhipDo && res.loi === null;
    for (let i = 0; ok && i < nv.length; i++) {
      const s = trace[i], r = nv[i].robot, v = nv[i].vat;
      if (r.x !== s.x || r.y !== s.y || r.huong !== s.h || r.namCham.bat !== (s.bat === 1)) ok = false;
      s.pos.forEach((p, j) => {
        const vv = v[j];
        if (p === -1) { if (vv.trangThai !== 'cam' || vv.x !== s.x || vv.y !== s.y) ok = false; if (r.namCham.cam !== vv.id) ok = false; }
        else if (vv.trangThai !== 'dat' || vv.y * ctx.rong + vv.x !== p) ok = false;
      });
      if (!s.pos.includes(-1) && r.namCham.cam !== null) ok = false;
    }
    if (!ok) { lech++; if (ghiLech.length < 2) ghiLech.push(J({ rows, chat, xe, loai, code: code.split('\n').join(';') })); }
    soNhip += nhipDo; soHut += ev(res, 'hut-vat').length; soTha += ev(res, 'tha-vat').length; soChan += maSK(res, 'tha-bi-chan').length; if (res.thang) soThang++;
  }
  kiem('so chéo ' + soCa + ' ca ngẫu nhiên (xe bánh và omni, tường, bậc thang, băng chuyền, gỗ lẫn sắt, đủ chín tổ hợp bánh + trượt): từng nhịp bộ dò và san-hoc.js trùng hoàn toàn (xe, hướng, nam châm, từng vật)',
    soCa >= 1200 && lech === 0, lech + ' lệch · ' + ghiLech.join(' || '));
  kiem('các ca ngẫu nhiên có đủ thứ: hút (' + soHut + '), thả (' + soTha + '), thả bị chặn (' + soChan + '), thắng (' + soThang + '), tổng ' + soNhip + ' nhịp', soHut >= 300 && soTha >= 100 && soChan >= 30 && soThang >= 20, [soHut, soTha, soChan, soThang].join());
}

/* ============================================================================ 10. DỮ LIỆU 10 MÀN */
console.log('\n== 10. Dữ liệu 10 màn: sân, vatChat, đường tắt (BFS tách nhịp), cảm biến, canHam ==');
const BANG = [];
{
  const SAO_NHIP = [4, 9, 25, 8, 13, 22, 6, 10, 11, 28];
  const SAO_O = [11, 18, 23, 15, 14, 17, 10, 17, 10, 17];
  kiem('đúng 10 màn nam-cham, id 19.1…19.10, mã nam-cham.1…10, tên chương "Nam châm"', ds.length === 10 && ds.every((m, i) => m.id === '19.' + (i + 1) && m.ma === 'nam-cham.' + (i + 1)) && ManHoc.chuong().find((c) => c.ma === 'nam-cham').ten === 'Nam châm');
  kiem('hang: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm', J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']));
  kiem('sao.nhip và sao.o đúng bảng chốt', J(ds.map((m) => m.sao.nhip)) === J(SAO_NHIP) && J(ds.map((m) => m.sao.o)) === J(SAO_O), J([ds.map((m) => m.sao.nhip), ds.map((m) => m.sao.o)]));
  kiem('chỉ 14.3 tạo hàm (fetch); chỉ 14.8 có hàm của màn (haul); huy hiệu nam-cham ở 14.10', J(ds.map((m) => m.taoHam)) === J([[], [], ['fetch'], [], [], [], [], [], [], []]) &&
    ds.every((m) => (m.so === 8) === (m.maMau.hamCuaMan.length === 1 && m.loiGiai.hamCuaMan.length === 1)) && ds[9].huyHieu.ma === 'nam-cham' && ds.slice(0, 9).every((m) => !m.huyHieu));
  kiem('mọi màn: mucTieu dua-vat, vatCan sat, nhipTheoLoiGiai, Xưởng mở, khung 10/10, cauTruc for/if/while', ds.every((m) => m.mucTieu === 'dua-vat' && m.vatCan === 'sat' && m.nhipTheoLoiGiai === true && m.moXuong && m.khung.chinh === 10 && m.khung.moiHam === 10 && J(m.cauTruc) === '["for","if","while"]'));
  kiem('cảm biến: 14.6 có front_clear + front_metal (camBien khoang-cach); 14.10 thêm color (camBien khoang-cach + mau: cảm biến màu Ở BỤNG, không phải camera); các màn còn lại không có cảm biến nào; 14.9 là omni',
    ds.every((m) => (m.so === 6 || m.so === 10) === m.hamGoc.includes('front_metal') && (m.so === 10) === m.hamGoc.includes('color') && (m.so === 6 || m.so === 10) === m.hamGoc.includes('front_clear') && (m.so === 9) === (m.loaiRobot === 'omni') && (m.so === 9) === m.hamGoc.includes('slide_left')) && J(man(6).robot.camBien) === J([{ ma: 'khoang-cach', o: 'hong' }]) && man(1).robot.camBien.length === 0);
  kiem('robot.tay "nam-cham" ở mọi màn; than hai-banh (omni ở 14.9)', ds.every((m) => m.robot.tay === 'nam-cham' && m.robot.than === (m.so === 9 ? 'omni' : 'hai-banh')));

  for (const m of ds) {
    const dsSan = sanCua(m), bds = bdCua(m);
    // cấu trúc sân
    const chatOK = dsSan.every((rows, i) => {
      const lm = SanHoc.lopMauCuaSan(m, i);
      const sd = SanHoc.docSan(rows, lm.mau, lm.vatMau, lm.vatChat);
      const them = lm.vatThem || [];
      const tatVat = sd.vat.concat(them);
      const bdx = bds[i];
      return tatVat.some((v) => v.chat === 'sat') && sd.dich.length >= 1 && rows[bdx.y][bdx.x] !== '#' && them.every((v) => rows[v.y][v.x] !== '#' && v.x >= 0 && v.x < sd.rong && v.y >= 0 && v.y < sd.cao) &&
        (m.so === 7 ? sd.vat.some((v) => v.chat !== 'sat') : true);
    });
    kiem(m.id + ': mọi sân có ít nhất một vật sắt và một ô đích; xe không xuất phát trong tường' + (m.so === 7 ? '; vật sắt chính nằm trên băng (vatThem), vật gỗ chỉ để đủ sân' : ''), chatOK);
    // BFS: tách nhịp = sao.nhip; gộp <= sao.nhip
    const tach = nhipNamChamTatCa(m, { tachNhip: true }), gop = nhipNamChamTatCa(m);
    kiem(m.id + ': BFS tách nhịp (lệnh nam châm đứng một mình trong nhịp) = sao.nhip = ' + m.sao.nhip + ' (không có đường tắt); BFS gộp = ' + gop + ' <= sao.nhip',
      tach === m.sao.nhip && gop !== null && gop <= m.sao.nhip, 'tách ' + tach + ' · gộp ' + gop);
    // lời giải mẫu chạy đúng bấy nhiêu nhịp và 3 sao
    const kt = khoTruoc(m.id);
    const r = ChamHoc.cham(m, m.loiGiai, tron(kt, m.loiGiai.hamCuaEmMoi));
    BANG.push({ id: m.id, ten: m.ten, o: r.soO, nhip: r.soNhip, gop, san: dsSan.length, sao: r.sao });
    kiem(m.id + ': lời giải mẫu 3 sao, ' + r.soO + ' ô, ' + r.soNhip + ' nhịp, không chẩn đoán nào', r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, o: r.soO, nhip: r.soNhip, cd: maCua(r) }));
    const alt = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kt, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': lời giải khác (' + m.loiGiaiKhac.moTa + ') cùng nhịp, nhiều ô hơn (' + alt.soO + ' > ' + m.sao.o + '), đúng 2 sao', alt.thang && alt.soNhip === m.sao.nhip && alt.soO > m.sao.o && alt.sao === 2);
    const mm = ChamHoc.cham(m, m.maMau, kt);
    kiem(m.id + ': maMau không thắng, vừa khung; veMaMau nói về code có sẵn', !mm.thang && !maCua(mm).includes('tran-khung') && typeof m.veMaMau === 'string' && m.veMaMau.length > 20);
    // gộp nhịp thật sự rút ngắn: chương trình gộp magnet_on() vào nhịp đi (bằng chứng cho bài tối ưu)
  }
  // lời giải gộp nhịp cho thấy BFS gộp ngắn hơn: dựng từ chuỗi BFS gộp của vài màn một sân
  for (const so of [2, 4, 5, 7, 8, 9]) {
    const m = man(so);
    const r = nhipNamChamNganNhat(Object.assign({}, m, { san: m.san, batDau: m.batDau, vatThem: m.vatThem }));
    const code = chuoiThanhMa(r.chuoi);
    const sh = SanHoc.chay({ san: m.san, vatChat: m.vatChat, vat: m.vatThem, batDau: m.batDau, loaiRobot: m.loaiRobot, hamGoc: m.hamGoc, mucTieu: 'dua-vat', vatCan: 'sat' }, code);
    kiem(m.id + ': chuỗi BFS gộp nhịp (' + r.nhip + ' nhịp) chạy thật trên san-hoc.js thắng đúng số nhịp đó, ít hơn sao.nhip ' + m.sao.nhip + ' (gộp lệnh nam châm vào nhịp đi: bài tối ưu riêng)', sh.thang && sh.nhip === r.nhip && r.nhip < m.sao.nhip, J([sh.thang, sh.nhip, r.nhip]));
  }

  // 14.3: canHam tran-khung — khai triển fetch ra thì tràn khung
  const m3 = man(3);
  const khaiTrien = ['for i in range(3):'].concat(m3.loiGiai.hamCuaEmMoi[0].than.map((s) => '    ' + s), ['    turn_left()', '    move()', '    move()', '    turn_left()', '    move()']);
  const r3 = ChamHoc.cham(m3, { chinh: khaiTrien }, khoTruoc('19.3'));
  kiem('14.3 canHam "tran-khung": không dùng fetch, viết thẳng cả vòng thì ' + khaiTrien.length + ' dòng > 10 ô, tran-khung, không chạy', m3.canHam === 'tran-khung' && khaiTrien.length > m3.khung.chinh && maCua(r3).includes('tran-khung') && !r3.thang && r3.sao === 0);
  kiem('14.3: fetch() thân đúng 6 dòng ≤ 10 ô, gọi u_turn và move của kho; maMau là chuyến lấy vật viết thẳng (6 dòng) ', bang(m3.loiGiai.hamCuaEmMoi[0].than, ['magnet_on()', 'wait()', 'u_turn()', 'move()', 'magnet_off()', 'wait()']) && bang(m3.maMau.chinh, m3.loiGiai.hamCuaEmMoi[0].than));
  // 14.7: băng đổi đường tối ưu; 14.2: gỗ chắn đổi đường tối ưu
  const m7 = man(7);
  const m7KhongBang = Object.assign({}, m7, { san: m7.san.map((r) => r.replace(/\^/g, '.')) });
  kiem('14.7: bỏ làn băng thì đường tối ưu khác (thả ở hàng xe, không lệch lên một hàng): BFS tách ≠ ' + m7.sao.nhip + ' hoặc đích đòi vị trí khác', nhipNamChamNganNhat(m7KhongBang, { tachNhip: true }).nhip !== m7.sao.nhip);
  const m7DungHang = ChamHoc.cham(m7, { chinh: ['move()', 'magnet_on()', 'wait()', 'move()', 'move()', 'move()', 'move()', 'magnet_off()', 'wait()'] }, khoTruoc('19.7'));
  kiem('14.7: tiến thẳng 4 ô (như khi không có băng) không thắng — băng đẩy xe lên hàng trên; chẩn đoán nói ô trước mũi là mép sân', !m7DungHang.thang && maCua(m7DungHang).includes('tha-bi-chan'));
  const m2 = man(2);
  kiem('14.2: vật gỗ chiếm ô và chắn nên đường ngắn nhất (tách nhịp) vòng sang bên (rẽ, tiến) TRƯỚC khi magnet_on; chương trình hút ngay chỗ xuất phát thì hut-go và không thắng', (() => {
    const c = nhipNamChamNganNhat(m2, { tachNhip: true }).chuoi;
    return c.findIndex((a) => a.banh === BoDo.TIEN) < c.findIndex((a) => a.nc === 'on') && !ChamHoc.cham(m2, m2.maMau, khoTruoc('19.2')).thang && maCua(ChamHoc.cham(m2, m2.maMau, khoTruoc('19.2'))).includes('hut-go');
  })());
  // 14.8: hàm của màn haul() bị sai, sửa là thêm hai dòng
  const m8 = man(8);
  kiem('14.8: maMau gọi haul() sai (thiếu magnet_off, wait), lời giải sửa thành 6 dòng; sửa xong chương trình chính giữ nguyên', bang(m8.maMau.hamCuaMan[0].than, ['magnet_on()', 'wait()', 'turn_right()', 'move()']) && bang(m8.loiGiai.hamCuaMan[0].than, ['magnet_on()', 'wait()', 'turn_right()', 'move()', 'magnet_off()', 'wait()']) && bang(m8.maMau.chinh, m8.loiGiai.chinh));
  // 14.6 và 14.10 phải dùng cảm biến: viết cứng thì trượt
  for (const so of [6, 10]) {
    const m = man(so);
    const cung = m.loiSai.find((l) => /cứng/.test(l.moTa));
    const rc = ChamHoc.cham(m, cung.baiLam, tron(khoTruoc(m.id), cung.hamCuaEmMoi));
    kiem(m.id + ': viết cứng số bước theo sân đầu thì trượt ở sân khác (cả ba sân phải thắng)', !rc.thang && rc.theoSan.length === 3 && rc.theoSan.filter((s) => s.thang).length < 3, J(rc.theoSan.map((s) => s.thang)));
    // mỗi sân giải được riêng với lời giải mẫu (cùng một chương trình)
    const rg = ChamHoc.cham(m, m.loiGiai, tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi));
    kiem(m.id + ': một chương trình duy nhất (lời giải mẫu) thắng cả ba sân; nhịp mỗi sân ≠ nhau (sân khác độ dài đường đi)', rg.thang && new Set(rg.theoSan.map((s) => s.soNhip)).size >= 2, J(rg.theoSan.map((s) => s.soNhip)));
  }
  // 14.9: omni, nam châm hướng lên, không quay
  const m9 = man(9);
  const r9 = ChamHoc.cham(m9, m9.loiGiai, khoTruoc('19.9'));
  kiem('14.9: omni không đổi hướng mặt suốt lượt chạy (huong 0 mọi nhịp), nam châm luôn hút lên', nhipVet({ vet: r9.vet }).every((n) => n.robot.huong === 0) && r9.thang);
  // 14.10: kho sắt lẫn gỗ; ô đích ngay phía trên một ô vàng; xe mang vật sắt về ô vàng (cảm biến bụng đọc sàn khi đang dính vật)
  const m10 = man(10);
  kiem('14.10: mỗi sân đúng một vật sắt + vật gỗ nằm SAU vật sắt (không chắn đường hút), đúng một ô vàng nằm ngay DƯỚI đúng một ô đích D, ô vàng ở phía xuất phát của vật sắt; không dùng màu vật, ô đích không màu; chỉ sân 2 có làn băng chuyền', sanCua(m10).every((rows, i) => {
    const lm = SanHoc.lopMauCuaSan(m10, i);
    const s = SanHoc.docSan(rows, lm.mau, lm.vatMau, m10.vatChat[i]);
    const vang = [];
    rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === 'y') vang.push({ x, y }); }));
    const sat = s.vat.filter((v) => v.chat === 'sat'), go = s.vat.filter((v) => v.chat !== 'sat');
    return s.dich.length === 1 && vang.length === 1 && s.dich[0].x === vang[0].x && s.dich[0].y === vang[0].y - 1 && !s.dich[0].mau && sat.length === 1 && go.length >= 1 && go.every((g) => g.y === sat[0].y && g.x > sat[0].x) && s.vat.every((v) => !v.mau) && vang[0].x < sat[0].x;
  }) && m10.san.filter((rows) => /[<>]/.test(rows.join(''))).length === 1 && m10.vatMau === undefined);
  kiem('14.10: lời giải thắng ba sân; mọi lần đọc color() là cảm biến bụng (cam "mau", nguon "san") và ở MỖI sân có đọc color() lúc xe ĐANG DÍNH vật sắt (sau magnet_on)', (() => {
    const r = ChamHoc.cham(m10, m10.loiGiai, khoTruoc('19.10'));
    return r.thang && r.theoSan.every((sn) => { let hut = false, sau = 0, sai = 0; for (const e of sn.vet) { if (e.loai === 'lenh' && e.ten === 'magnet_on') hut = true; if (e.loai === 'lenh' && e.docCamBien && e.ten === 'color') { if (e.docCamBien.cam !== 'mau' || e.docCamBien.nguon !== 'san') sai++; if (hut) sau++; } } return sai === 0 && sau >= 1; });
  })() && J(m10.robot.camBien) === J([{ ma: 'khoang-cach', o: 'hong' }, { ma: 'mau', o: 'hong' }]));
  const sai10 = ChamHoc.cham(m10, { chinh: ['while not front_metal():', '    move()', 'magnet_on()', 'wait()', 'turn_right()', 'magnet_off()', 'wait()'] }, khoTruoc('19.10'));
  kiem('14.10: hút rồi rẽ phải thả ngay (không mang về ô vàng) thì không thắng (chua-dua-vat)', !sai10.thang && maCua(sai10).includes('chua-dua-vat'), J(maCua(sai10)));
  // 14.5 thứ tự: đảo thứ tự không thể (thùng gần nhất trước) — thử hút lần đầu thấy vật gần nhất
  const m5 = man(5);
  const k5 = SanHoc.chay({ san: m5.san, vatChat: m5.vatChat, batDau: m5.batDau, loaiRobot: 'banh', hamGoc: m5.hamGoc, mucTieu: 'dua-vat', vatCan: 'sat' }, HUT);
  kiem('14.5: ba vật sắt thẳng hàng; hút lần đầu lấy vật GẦN NHẤT (id 3, ở ô sát xe), hai vật kia nằm yên', k5.namCham.cam === 3 && vatCua(k5, 1).trangThai === 'dat' && vatCua(k5, 2).trangThai === 'dat', J(k5.vat));
  // 14.4: bậc thang
  const m4 = man(4);
  const k4 = ChamHoc.cham(m4, { chinh: ['move()', 'move()', 'move()'] }, khoTruoc('19.4'));
  kiem('14.4: xe bánh không leo được bậc thang (đi ô thứ ba đâm vào bậc thang), nhưng nam châm hút xuyên qua nó (lời giải thắng)', maCua(k4).includes('dam-tuong') && ChamHoc.cham(m4, m4.loiGiai, khoTruoc('19.4')).thang);
}

function bang(a, b) { return J(a) === J(b); }

console.log('\n== Bảng 10 màn chương Nam châm (lời giải mẫu) ==');
{
  console.log('  màn   | ô  | nhịp | gộp | sân | tên');
  for (const b of BANG) console.log('  ' + b.id.padEnd(5) + ' | ' + String(b.o).padEnd(2) + ' | ' + String(b.nhip).padEnd(4) + ' | ' + String(b.gop).padEnd(3) + ' | ' + String(b.san).padEnd(3) + ' | ' + b.ten);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);

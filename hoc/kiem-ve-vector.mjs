/* ============================================================================
   kiem-ve-vector.mjs — máy kiểm BỘ VẼ VECTOR (game/ve-vector*.js, gói V1) của "Robot Chấn Hưng". Chạy ở Node với canvas giả (ghi lại lệnh vẽ).
     1. Kho hình khai đủ: ô sàn / tường / cờ, vật thùng gỗ, thân hai bánh (oGan.tay), tay kẹp (diemNeo, gan, vatKep); mỗi hình có ten + ve().
     2. Mỗi hình vẽ được ở nhiều cỡ ô (14 … 168 px): có lệnh tô / viền; mọi màu dùng đều lấy từ bảng màu (BM) hoặc rgba từ bộ ba của bảng.
     3. Điểm gắn: diemNeo của tay nằm trong cụm giữa và trùng ổ tay của thân; ghép dịch đúng (oGan − diemNeo); góc xoay 4 hướng đúng quy ước
        (0 lên, 1 phải, 2 xuống, 3 trái; thân vẽ quay xuống nên lên = 180°).
     4. Sau xoay, ổ tay (và vật trong kẹp) luôn ở PHÍA HƯỚNG MẶT; vật trong kẹp nằm trong ô.
     5. Cả robot (thân + tay, mọi trạng thái, 4 hướng, nhiều cỡ) nằm trọn trong ô: mọi điểm của mọi lệnh vẽ sau phép biến hình nằm trong [0, cạnh].
     6. Màu đội: R1 (sơn '' / vang) và R2 ('lam') cho hai luồng lệnh y hệt, chỉ khác ở đúng ba chỗ kính (gradient), mắt (viền), chấm ăng-ten (tô);
        sơn mở khoá ('ngoc'…) lấy bộ ba SON của bảng màu; không lẫn màu đội kia.
     7. Bộ đệm: cùng (tên, cỡ, trạng thái) → cùng canvas; khác cỡ / trạng thái / hướng / sơn → canvas khác.
     8. coDu(): chỉ cấu hình đủ hình vector mới vẽ bằng vector; công tắc mặc định PIXEL (bat() = false khi không có ?ve=vector / lưu).
     9. VeRobot (ve-robot.js): tiLeChoO / vatKep / REACH đổi theo chế độ và theo coDu; chế độ pixel giữ công thức cũ.
  10. (gói V2) Mọi ký hiệu sân và mọi vật có hình vector — liệt kê TỪ CODE, không gõ tay: ký hiệu = mọi ký tự SanHoc.docSan nhận (thử từng ký tự in được),
       ô pixel = mọi khoá của Ve.tiles() (đọc từ nguồn ve.js), hàm vẽ trực tiếp = mọi lời gọi Ve.make* / Ve.ve* trong san-ve.js, vật = mọi chất SanHoc.CHAT_KY × màu
       SanHoc.MAU_TEN; mỗi thứ phải có trong bảng nối ve-vector-ky-hieu.js và trỏ tới hình đã đăng ký; mỗi hàm Field.* trong bảng có nhánh this.vec.
  11. (gói V2) Mỗi hình × MỌI trạng thái mẫu (cacTrangThai) × 3 cỡ (14, 56, 168): vẽ được, màu từ bảng màu, nằm trong ô; trạng thái khác → luồng lệnh khác và canvas đệm khác;
       màu luật: sàn màu / vật nam châm / khung đích màu lấy nhóm LUAT, bốn màu sàn cách nhau và cách nền sân trắng đủ xa (khoảng cách RGB).
  12. (gói V3) Thân / tay / cảm biến — liệt kê TỪ part/*.js: mỗi bộ phận có hình vector cùng mã, cùng ổ (gan, ten); mọi tệp ve-vector-*.js nạp trong choi.html + trang xem;
       mọi tổ hợp thân × (không tay + tay) × bộ cảm biến (mọi cảm biến ở mọi tên ổ, vài cặp): kiemGhep ném đúng khi Part.ghep ném, CÙNG câu báo; tổ hợp hợp lệ × 4 hướng × 2 cỡ
       vẽ được, màu từ bảng, nằm trong ô (tay xoay: nấc trái / phải trong ô, ±45° trong lề tràn); drone một hình cho 4 hướng, không bóng trong hình; ổ đúng phía sau xoay
       (tay trước, hongTrai trái, hongPhai phải, tren góc mũi trái, sau đuôi); màu đội đúng ba chỗ trên mọi tổ hợp; trạng thái động ra hình khác; MỌI MÀN (cả từng robot
       của màn đội) vẽ được bằng vector qua VeRobot.ve.
   Cờ --loi-gia: cắm sáu lỗi giả (neo tay lệch, góc xoay lệch 90°, màu R2 = R1, đệm bỏ cỡ, ô tường tô mã màu ngoài bảng, ổ tay thân ra ngoài ô) và bốn lỗi V2
   (bỏ ký hiệu hố khỏi bảng nối, bỏ ô bậc thang của Ve.tiles khỏi bảng, băng chuyền bỏ qua pha, sàn màu vàng tô màu ngoài nhóm LUAT) và bốn lỗi V3 (drone mất cờ không hướng,
   xích đổi chỗ hai ổ hông, nam châm tô màu đội, camera-bay sai ổ) → máy kiểm phải ĐỎ.
   Chạy: node hoc/kiem-ve-vector.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.join(day, 'game');
const require = createRequire(import.meta.url);
const LOI_GIA = process.argv.includes('--loi-gia');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); } else { hong++; console.log('  ✗ HỎNG ' + ten + (chiTiet ? '\n      ' + String(chiTiet).slice(0, 1200) : '')); }
}

const BM = require(path.join(GAME, 'bang-mau.js'));
const V = require(path.join(GAME, 've-vector.js'));
/* tệp hình vector: đúng thứ tự choi.html nạp (gói V3: máy kiểm mục 12 đòi mọi ve-vector*.js của hoc/game đều có trong choi.html và trang xem) */
const CHOI_SRC = fs.readFileSync(path.join(GAME, 'choi.html'), 'utf8');
const TEP_VEC = [...CHOI_SRC.matchAll(/<script src="(ve-vector-[\w-]+\.js)"/g)].map((m) => m[1]);
for (const f of TEP_VEC) require(path.join(GAME, f));
let VeRobot = null;
try { VeRobot = require(path.join(GAME, 've-robot.js')); } catch (e) { console.log('(không nạp được ve-robot.js ở Node: ' + e.message + ')'); }

if (LOI_GIA) {
  console.log('(đang cắm sáu lỗi giả: neo tay y = 20, góc xoay lệch 90°, màu R2 = R1, đệm bỏ cỡ, ô tường tô #123456, ổ tay thân y = 140 — máy kiểm phải ĐỎ)');
  V.lay('tay', 'kep').diemNeo.y = 20;
  V._loiGia.gocXoay = true;
  BM.vecDoiR2 = BM.vecDoiR1; BM.vecDoiR2Toi = BM.vecDoiR1Toi;
  V._loiGia.demBoCo = true;
  V.lay('o', 'tuong').ve = function (g) { g.fillStyle = '#123456'; g.fillRect(0, 0, 100, 100); };
  V.lay('than', 'hai-banh').oGan.tay.y = 140;
  console.log('(và bốn lỗi giả V2: bỏ KY_HIEU.u, bỏ TILES.stair, băng chuyền bỏ qua pha, sàn màu vàng tô vecDen)');
  delete V.KY_HIEU.u; delete V.TILES.stair;
  const bang = V.lay('o', 'bang'), veBang = bang.ve; bang.ve = function (g, s, H) { return veBang(g, Object.assign({}, s, { pha: 0 }), H); };
  const sm = V.lay('o', 'san-mau'), veSm = sm.ve; sm.ve = function (g, s, H) { if (s && s.mau === 'yellow') { H.bo(g, 3, 3, 94, 94, 6); H.to(g, BM.vecDen); return; } return veSm(g, s, H); };
  console.log('(và bốn lỗi giả V3: drone mất cờ khongHuong (xoay theo hướng, nhận camera), xích đổi chỗ hongTrai / hongPhai, nam châm tô màu đội, camera-bay gắn ổ tren)');
  V.lay('than', 'drone').khongHuong = false;
  const xi = V.lay('than', 'xich').oGan, tg = xi.hongTrai; xi.hongTrai = xi.hongPhai; xi.hongPhai = tg;
  const nc = V.lay('tay', 'nam-cham'), veNc = nc.ve; nc.ve = function (g, s, M, H) { veNc(g, s, M, H); H.tron(g, 50, 81, 1); H.to(g, M.chinh); };
  V.lay('cam-bien', 'camera-bay').gan = 'tren';
}

const CO = [14, 37, 56, 84, 168];
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
const TEN_HUONG = ['lên', 'phải', 'xuống', 'trái'];
const MAU_BANG = new Set(Object.keys(BM).map((k) => String(BM[k]).toLowerCase()));
const BO_BA = new Set(Object.keys(BM).filter((k) => /^\d{1,3},\d{1,3},\d{1,3}$/.test(BM[k])).map((k) => BM[k]));
const J = JSON.stringify;

/** Mọi màu một luồng lệnh dùng: fillStyle / strokeStyle chuỗi, và các stop của gradient. */
function mauCua(lenh) {
  const ra = [];
  for (const l of lenh) {
    if ((l[0] === 'fillStyle' || l[0] === 'strokeStyle') && typeof l[1] === 'string') ra.push(l[1]);
    if (l[1] && l[1].stops) for (const s of l[1].stops) ra.push(s[1]);
  }
  return ra;
}
function mauHopLe(m) {
  m = String(m).toLowerCase();
  if (MAU_BANG.has(m)) return true;
  const r = /^rgba\((\d{1,3},\d{1,3},\d{1,3}),[\d.]+\)$/.exec(m);
  return !!(r && BO_BA.has(r[1]));
}
/** Chuỗi hoá một lệnh (gradient → kiểu + stop) để so hai luồng. */
function chuoi(l) { return l.map((x) => (x && x.stops ? 'grad:' + x.kieu + J(x.stops) : typeof x === 'number' ? +x.toFixed(6) : x)).join(' '); }
function coVe(lenh) { return lenh.some((l) => l[0] === 'fill' || l[0] === 'stroke' || l[0] === 'fillRect'); }

/** Theo dõi phép biến hình (save / restore / translate / rotate / scale) và trả về mọi điểm của mọi lệnh vẽ theo pixel canvas. */
function diemThietBi(lenh) {
  let m = [1, 0, 0, 1, 0, 0]; const stack = [], pts = []; let lw = 1;
  const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  const ap = (x, y, khongVien) => pts.push({ x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5], le: khongVien ? 0 : lw * Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) / 2 });
  for (const l of lenh) {
    const [c, ...a] = l;
    if (c === 'save') stack.push(m.slice()); else if (c === 'restore') m = stack.pop() || m;
    else if (c === 'translate') m = mul(m, [1, 0, 0, 1, a[0], a[1]]);
    else if (c === 'scale') m = mul(m, [a[0], 0, 0, a[1], 0, 0]);
    else if (c === 'rotate') m = mul(m, [Math.cos(a[0]), Math.sin(a[0]), -Math.sin(a[0]), Math.cos(a[0]), 0, 0]);
    else if (c === 'lineWidth') lw = a[0];
    else if (c === 'moveTo' || c === 'lineTo') ap(a[0], a[1]);
    else if (c === 'bezierCurveTo') { ap(a[0], a[1]); ap(a[2], a[3]); ap(a[4], a[5]); }
    else if (c === 'arcTo') { ap(a[0], a[1]); ap(a[2], a[3]); }
    else if (c === 'arc') { ap(a[0] - a[2], a[1] - a[2]); ap(a[0] + a[2], a[1] + a[2]); }
    else if (c === 'ellipse') { ap(a[0] - a[2], a[1] - a[3]); ap(a[0] + a[2], a[1] + a[3]); }
    else if (c === 'fillRect') { ap(a[0], a[1], true); ap(a[0] + a[2], a[1] + a[3], true); }      // tô không có nét viền
    else if (c === 'rect' || c === 'strokeRect') { ap(a[0], a[1]); ap(a[0] + a[2], a[1] + a[3]); }
  }
  return pts;
}
function ngoaiO(cv) { return diemThietBi(cv.lenh).filter((p) => p.x - p.le < -0.5 || p.y - p.le < -0.5 || p.x + p.le > cv.width + 0.5 || p.y + p.le > cv.height + 0.5); }

/* ================================================================= 1. kho hình */
console.log('== 1. Kho hình vector khai đủ ==');
{
  const can = { o: ['san', 'tuong', 'co'], vat: ['thung-go'], than: ['hai-banh', 'xich', 'nhen', 'omni', 'drone'], tay: ['kep', 'xoay', 'nam-cham', 'nem', 'hoi', 'son'], 'cam-bien': ['khoang-cach', 'mau', 'cham', 'camera', 'camera-bay', 'hong-ngoai'] };
  for (const loai of Object.keys(can)) {
    const thieu = can[loai].filter((ma) => !V.lay(loai, ma));
    kiem(loai + ': có ' + can[loai].join(', ') + ' (kho: ' + V.ds(loai).join(', ') + ')', thieu.length === 0, 'thiếu ' + thieu.join(', '));
  }
  const loiTruong = [];
  for (const loai of ['o', 'vat', 'than', 'tay', 'cam-bien']) for (const ma of V.ds(loai)) {
    const d = V.lay(loai, ma);
    if (!d.ten || typeof d.ve !== 'function') loiTruong.push(loai + '/' + ma + ' thiếu ten / ve');
    if (loai === 'than' && !(d.oGan && (d.oGan.tay || (d.khongHuong && d.oGan.duoi)))) loiTruong.push(loai + '/' + ma + ' thiếu oGan.tay (drone: oGan.duoi)');
    if (loai === 'tay' && !(d.diemNeo && d.gan && [].concat(d.gan).includes('tay'))) loiTruong.push(loai + '/' + ma + ' thiếu diemNeo / gan (tay phải gắn được ổ tay)');
    if (loai === 'tay' && (ma === 'kep' || ma === 'xoay') && !(d.vatKep && d.vatKep.canh > 0)) loiTruong.push(loai + '/' + ma + ' (tay kẹp vật) thiếu vatKep');
    if (loai === 'cam-bien' && !(d.diemNeo && d.gan)) loiTruong.push(loai + '/' + ma + ' thiếu diemNeo / gan');
  }
  kiem('mỗi hình có ten + ve(); thân có oGan.tay (drone: duoi); tay có diemNeo, gan gồm ổ tay; tay kẹp / tay xoay có vatKep; cảm biến có diemNeo, gan', loiTruong.length === 0, loiTruong.join('; '));
  let nem = null; try { V.dangKy({ loai: 'than', ma: 'thu', ten: 'x', ve() {} }); } catch (e) { nem = e.message; }
  kiem('dangKy từ chối thân thiếu oGan.tay', !!nem && /oGan/.test(nem), nem);
  nem = null; try { V.dangKy({ loai: 'o', ma: 'san', ten: 'x', ve() {} }); } catch (e) { nem = e.message; }
  kiem('dangKy từ chối mã trùng', !!nem && /đã có/.test(nem), nem);
}

/* ================================================================= 2. vẽ được ở mọi cỡ, màu từ bảng */
console.log('\n== 2. Mỗi hình vẽ được ở nhiều cỡ ô; màu lấy từ bảng màu ==');
{
  const khongVe = [], mauLa = [];
  for (const ma of V.ds('o')) for (const n of CO) { const cv = V.o(ma, n); if (!cv || !coVe(cv.lenh)) khongVe.push('o/' + ma + '@' + n); for (const m of mauCua(cv.lenh)) if (!mauHopLe(m)) mauLa.push('o/' + ma + ': ' + m); }
  for (const ma of V.ds('vat')) for (const n of [8, 14, 30, 60]) for (const mau of [undefined, 'red', 'green', 'blue', 'yellow']) { const cv = V.vat(ma, n, mau ? { mau } : undefined); if (!cv || !coVe(cv.lenh)) khongVe.push('vat/' + ma + '@' + n); for (const m of mauCua(cv.lenh)) if (!mauHopLe(m)) mauLa.push('vat/' + ma + ': ' + m); }
  const TT = [{}, { tay: { kep: 'mo', tuThe: 'tren' } }, { tay: { kep: 'dong', tuThe: 'tren' } }, { tay: { kep: 'dong', cam: true, tuThe: 'duoi' } }, { than: { banh: { trai: 1, phai: 1 }, buoc: 1 }, tay: { kep: 'mo', tuThe: 'duoi' } }];
  for (const tay of [null, 'kep']) for (const h of [0, 1, 2, 3]) for (const n of CO) for (const st of TT) {
    const cv = V.robot({ than: 'hai-banh', tay }, st, h, n);
    if (!cv || !coVe(cv.lenh)) khongVe.push('robot ' + tay + ' h' + h + '@' + n);
    else for (const m of mauCua(cv.lenh)) if (!mauHopLe(m)) mauLa.push('robot: ' + m);
  }
  kiem('ô (' + V.ds('o').length + ') × ' + CO.length + ' cỡ, vật × 4 cỡ × 5 màu, robot (không tay / kẹp) × 4 hướng × ' + CO.length + ' cỡ × ' + TT.length + ' trạng thái: đều có lệnh tô / viền', khongVe.length === 0, khongVe.slice(0, 8).join(', '));
  kiem('mọi màu dùng (fillStyle, strokeStyle, stop gradient) có trong bảng màu hoặc là rgba(bộ ba của bảng, a)', mauLa.length === 0, [...new Set(mauLa)].slice(0, 8).join(', '));
  const cv = V.robot({ than: 'hai-banh', tay: 'kep' }, {}, 2, 56);
  kiem('canvas robot có cờ .laPart và .laVector, cỡ đúng một ô (56 × 56)', !!cv && cv.laPart === true && cv.laVector === true && cv.width === 56 && cv.height === 56);
}

/* ================================================================= 3. điểm gắn, góc xoay */
console.log('\n== 3. Điểm gắn và góc xoay ==');
{
  const than = V.lay('than', 'hai-banh'), tay = V.lay('tay', 'kep'), oG = than.oGan.tay, neo = tay.diemNeo;
  kiem('diemNeo tay kẹp (' + neo.x + ', ' + neo.y + ') nằm trong cụm giữa của tay (x 34..66, y 76..88)', neo.x >= 34 && neo.x <= 66 && neo.y >= 76 && neo.y <= 88);
  kiem('ổ tay của thân hai bánh (' + oG.x + ', ' + oG.y + ') ở mép dưới vỏ (y 70..90, x = 50) — mặt quay xuống', oG.x === 50 && oG.y >= 70 && oG.y <= 90);
  V.xoaDem();
  const cv = V.robot({ than: 'hai-banh', tay: 'kep' }, {}, 0, 100), lenh = cv.lenh;
  const iXoay = lenh.findIndex((l) => l[0] === 'rotate');
  const dich = lenh.slice(iXoay).filter((l) => l[0] === 'translate');
  kiem('luồng lệnh robot: xoay một lần rồi dịch tâm thân (−50, −56) rồi dịch tay (ổ − neo) = (' + (oG.x - neo.x) + ', ' + (oG.y - neo.y) + ')',
    iXoay > 0 && dich.length >= 2 && dich[0][1] === -V.TAM_THAN.x && dich[0][2] === -V.TAM_THAN.y && dich[1][1] === oG.x - neo.x && dich[1][2] === oG.y - neo.y, J(dich.slice(0, 3)));
  const goc = [0, 1, 2, 3].map((h) => Math.round(V.gocXoay(h) * 180 / Math.PI) % 360);
  kiem('góc xoay theo hướng (lên, phải, xuống, trái) = (180, 270, 0, 90)°; lệnh rotate trong luồng dùng đúng góc đó', J(goc) === J([180, 270, 0, 90]) && Math.abs(lenh[iXoay][1] - V.gocXoay(0)) < 1e-9, J(goc) + ' rotate=' + (lenh[iXoay] && lenh[iXoay][1]));
}

/* ================================================================= 4. tay ở phía hướng mặt */
console.log('\n== 4. Sau xoay, ổ tay và vật trong kẹp ở phía hướng mặt ==');
{
  const sai = [];
  for (const h of [0, 1, 2, 3]) for (const n of CO) {
    const p = V.diemGan({ than: 'hai-banh' }, h, n), dx = p.x - n / 2, dy = p.y - n / 2, d = Math.hypot(dx, dy);
    if (d < n * 0.1 || Math.abs(dx / d - DX[h]) > 1e-6 || Math.abs(dy / d - DY[h]) > 1e-6) sai.push(TEN_HUONG[h] + '@' + n + ' → (' + dx.toFixed(1) + ', ' + dy.toFixed(1) + ')');
  }
  kiem('ổ tay sau xoay nằm đúng trục hướng mặt, cách tâm ≥ 10% ô (4 hướng × ' + CO.length + ' cỡ)', sai.length === 0, sai.slice(0, 4).join(' | '));
  const vk = V.vatKep({ than: 'hai-banh', tay: 'kep' }, 'tren'), vkH = V.vatKep({ than: 'hai-banh', tay: 'kep' }, 'duoi');
  kiem('vatKep (đơn vị 1/100 ô): tâm vật trước tâm thân ' + (vk && vk.ahead.toFixed(1)) + ', cạnh ' + (vk && vk.n.toFixed(1)) + '; tay hạ xa hơn (' + (vkH && vkH.ahead.toFixed(1)) + '); vật nằm trong ô',
    !!vk && !!vkH && vk.ahead > 20 && vk.n > 10 && vkH.ahead > vk.ahead && vkH.ahead + vkH.n / 2 <= 50);
  kiem('không tay → vatKep = null; thân lạ → null; tay không kẹp (nam châm) → null', V.vatKep({ than: 'hai-banh', tay: null }) === null && V.vatKep({ than: 'khong-co', tay: 'kep' }) === null && V.vatKep({ than: 'hai-banh', tay: 'nam-cham' }) === null);
}

/* ================================================================= 5. robot nằm trong ô */
console.log('\n== 5. Cả robot (mọi trạng thái, 4 hướng, nhiều cỡ) nằm trọn trong ô ==');
{
  const TT = [{}, { tay: { kep: 'mo', tuThe: 'duoi' } }, { tay: { kep: 'dong', cam: true, tuThe: 'duoi' } }, { tay: { kep: 'dong', tuThe: 'tren' } }];
  const loi = []; let so = 0;
  for (const tay of [null, 'kep']) for (const h of [0, 1, 2, 3]) for (const n of CO) for (const st of TT) {
    V.xoaDem(); const cv = V.robot({ than: 'hai-banh', tay }, st, h, n); so++;
    const ng = ngoaiO(cv); if (ng.length) loi.push((tay || 'không tay') + ' ' + TEN_HUONG[h] + '@' + n + ' ' + J(st) + ': ' + ng.length + ' điểm, vd (' + ng[0].x.toFixed(1) + ', ' + ng[0].y.toFixed(1) + ')');
  }
  kiem(so + ' ảnh robot: mọi điểm vẽ (kể cả nửa nét) nằm trong [0, cạnh ô]', loi.length === 0, loi.slice(0, 4).join('\n      '));
  const loiO = [];
  for (const ma of V.ds('o')) for (const n of CO) { const ng = ngoaiO(V.o(ma, n)); if (ng.length) loiO.push('o/' + ma + '@' + n); }
  for (const ma of V.ds('vat')) for (const n of [8, 30, 60]) { const ng = ngoaiO(V.vat(ma, n)); if (ng.length) loiO.push('vat/' + ma + '@' + n); }
  kiem('ô và vật cũng nằm trong canvas của mình', loiO.length === 0, loiO.join(', '));
}

/* ================================================================= 6. màu đội */
console.log('\n== 6. Màu đội: kính + mắt + chấm ăng-ten ==');
{
  V.xoaDem();
  const r1 = V.robot({ than: 'hai-banh', tay: 'kep', son: 'vang' }, {}, 2, 84).lenh.map(chuoi);
  const r1b = V.robot({ than: 'hai-banh', tay: 'kep', son: '' }, {}, 2, 84).lenh.map(chuoi);
  const r2 = V.robot({ than: 'hai-banh', tay: 'kep', son: 'lam' }, {}, 2, 84).lenh.map(chuoi);
  kiem("sơn '' và 'vang' đều là R1 (cùng luồng lệnh)", J(r1) === J(r1b));
  const M1 = V.mauDoi('vang'), M2 = V.mauDoi('lam');
  kiem('mauDoi: R1 = vecDoiR1 / vecDoiR1Toi, R2 = vecDoiR2 / vecDoiR2Toi, hai bộ khác nhau', M1.chinh === BM.vecDoiR1 && M1.toi === BM.vecDoiR1Toi && M2.chinh === BM.vecDoiR2 && M2.toi === BM.vecDoiR2Toi && M1.chinh !== M2.chinh && M1.toi !== M2.toi);
  const khac = [];
  for (let i = 0; i < Math.max(r1.length, r2.length); i++) if (r1[i] !== r2[i]) khac.push(i);
  const doiMau = (s) => s.split(M2.chinh).join(M1.chinh).split(M2.toi).join(M1.toi);
  const chiMau = khac.every((i) => doiMau(r2[i]) === r1[i]);
  const loaiKhac = khac.map((i) => r2[i].split(' ')[0]).sort();
  kiem('R1 và R2: cùng độ dài luồng (' + r1.length + '), chỉ khác ở màu đội; chỗ khác = ' + J(loaiKhac),
    r1.length === r2.length && khac.length >= 3 && chiMau && loaiKhac.includes('createLinearGradient') && loaiKhac.includes('strokeStyle') && loaiKhac.includes('fillStyle'), 'khác ' + khac.length + ' chỗ; chỉ màu: ' + chiMau);
  const kinh = r2.filter((s) => s.startsWith('createLinearGradient') && s.includes(M2.toi) && s.includes(M2.chinh)).length;
  const mat = r2.filter((s) => s === 'strokeStyle ' + M2.chinh).length, cham = r2.filter((s) => s === 'fillStyle ' + M2.chinh).length;
  kiem('R2: kính = 1 gradient (toi → chinh), mắt = 2 viền chinh, chấm ăng-ten = 1 tô chinh', kinh === 1 && mat === 2 && cham === 1, 'kính ' + kinh + ', mắt ' + mat + ', chấm ' + cham);
  kiem('luồng R2 không còn màu R1 và ngược lại', !r2.some((s) => s.includes(M1.chinh) || s.includes(M1.toi)) && !r1.some((s) => s.includes(M2.chinh) || s.includes(M2.toi)));
  const Mn = V.mauDoi('ngoc'), Md = V.mauDoi('do');
  kiem("sơn mở khoá 'ngoc' → sonNgoc / sonNgocToi; đối thủ 'do' → sonDo / sonDoToi", Mn.chinh === BM.sonNgoc && Mn.toi === BM.sonNgocToi && Md.chinh === BM.sonDo && Md.toi === BM.sonDoToi);
}

/* ================================================================= 7. bộ đệm */
console.log('\n== 7. Bộ đệm theo (tên, cỡ, trạng thái, hướng, sơn) ==');
{
  V.xoaDem();
  const a = V.o('san', 56), b = V.o('san', 56), c = V.o('san', 57), d = V.o('san', 56, { x: 1 });
  kiem('o(san, 56) hai lần → cùng canvas; 57 → khác; trạng thái khác → khác', a === b && a !== c && a !== d);
  kiem('o(san, 56.4) làm tròn về 56 → cùng canvas với 56', V.o('san', 56.4) === a);
  const r = V.robot({ than: 'hai-banh', tay: 'kep' }, {}, 1, 42);
  kiem('robot: cùng tham số → cùng canvas; khác hướng / cỡ / sơn / trạng thái tay → khác',
    r === V.robot({ than: 'hai-banh', tay: 'kep' }, {}, 1, 42) && r !== V.robot({ than: 'hai-banh', tay: 'kep' }, {}, 2, 42) && r !== V.robot({ than: 'hai-banh', tay: 'kep' }, {}, 1, 43)
    && r !== V.robot({ than: 'hai-banh', tay: 'kep', son: 'lam' }, {}, 1, 42) && r !== V.robot({ than: 'hai-banh', tay: 'kep' }, { tay: { kep: 'dong' } }, 1, 42));
  const v1 = V.vat('thung-go', 30), v2 = V.vat('thung-go', 30, { mau: 'red' });
  kiem('vat(thung-go, 30) và có màu đỏ → hai canvas khác; vật đỏ dùng luatVatDo', v1 !== v2 && mauCua(v2.lenh).includes(BM.luatVatDo) && !mauCua(v1.lenh).includes(BM.luatVatDo));
}

/* ================================================================= 8. coDu, công tắc */
console.log('\n== 8. coDu() và công tắc ==');
{
  kiem('coDu (gói V3): mọi thân / tay / cảm biến đều có hình → true (xích, nam châm, cảm biến màu, drone…); mã lạ → false (rơi về pixel)',
    V.coDu({ than: 'hai-banh' }) && V.coDu({ than: 'hai-banh', tay: 'kep', camBien: [] }) && V.coDu({ than: 'xich' }) && V.coDu({ than: 'hai-banh', tay: 'nam-cham' })
    && V.coDu({ than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'mau', o: 'hong' }] }) && V.coDu({ than: 'drone' }) && !V.coDu({ than: 'khong-co' }) && !V.coDu({ than: 'hai-banh', tay: 'khong-co' }) && !V.coDu({ than: 'hai-banh', camBien: [{ ma: 'khong-co', o: 'hong' }] }));
  kiem('robot() với cấu hình thiếu hình → null (không ném)', V.robot({ than: 'khong-co' }, {}, 0, 56) === null && V.robot({ than: 'hai-banh', tay: 'khong-co' }, {}, 0, 56) === null);
  kiem('mặc định PIXEL: bat() = false khi không có ?ve=vector và chưa lưu', V.bat() === false);
  kiem("datCheDo('vector') → bat() = true; datCheDo('pixel') → false", V.datCheDo('vector') === true && V.bat() === true && V.datCheDo('pixel') === false && V.bat() === false);
}

/* ================================================================= 9. VeRobot theo chế độ */
console.log('\n== 9. VeRobot (ve-robot.js) theo chế độ ==');
if (!VeRobot) kiem('nạp ve-robot.js ở Node', false, 'không nạp được');
else {
  V.datCheDo('pixel');
  const pixel = (S, w) => { const n = Math.floor(0.9 * S / w); return n >= 1 && n * w >= 0.8 * S ? n : Math.max(0.3, 0.85 * S / w); };
  kiem('pixel: tiLeChoO(42) = ' + pixel(42, 20) + ', tiLeChoO(84) = ' + pixel(84, 20) + ' (công thức cũ, thân 20 px khi chưa nạp Part)', VeRobot.tiLeChoO(42, { than: 'hai-banh' }) === pixel(42, 20) && VeRobot.tiLeChoO(84, { than: 'hai-banh' }) === pixel(84, 20));
  kiem('pixel: vatKep(hai-banh, tren) = { ahead: 18, n: 10 }; REACH = 26', J(VeRobot.vatKep({ than: 'hai-banh' }, 'tren')) === J({ ahead: 18, n: 10 }) && VeRobot.REACH === 26);
  V.datCheDo('vector');
  kiem('vector: tiLeChoO(S, hai-banh + kẹp) = S / 100 (84 → 0.84); REACH = 50 (nửa ô)', VeRobot.tiLeChoO(84, { than: 'hai-banh', tay: 'kep' }) === 0.84 && VeRobot.REACH === 50);
  kiem('vector (gói V3): mọi thân đều theo hệ 1/100 ô (xích 84 → 0.84, drone); cấu hình thiếu hình (mã lạ) vẫn dùng công thức pixel',
    VeRobot.tiLeChoO(84, { than: 'xich' }) === 0.84 && VeRobot.tiLeChoO(84, { than: 'drone', tay: 'nam-cham' }) === 0.84 && VeRobot.tiLeChoO(84, { than: 'khong-co' }) === pixel(84, 20));
  const vk = VeRobot.vatKep({ than: 'hai-banh', tay: 'kep' }, 'tren'), vv = V.vatKep({ than: 'hai-banh', tay: 'kep' }, 'tren');
  const vx = VeRobot.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'tren', 0), vxv = V.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'tren', 0);
  kiem('vector: vatKep lấy từ VeVector (' + (vk && vk.ahead.toFixed(1)) + ', ' + (vk && vk.n.toFixed(1)) + '); tay xoay: vatXoay cũng từ VeVector (f ' + (vx && vx.f.toFixed(1)) + ')',
    !!vk && !!vv && vk.ahead === vv.ahead && vk.n === vv.n && !!vx && !!vxv && vx.f === vxv.f && vx.l === vxv.l);
  const hh = VeRobot.hinhHoc({ than: 'hai-banh', tay: 'hoi' }), hv = V.hinhHoc({ than: 'hai-banh', tay: 'hoi' });
  kiem('vector: hinhHoc (mz / mzs / bk / pp / dinh) lấy từ VeVector; reachCua = 50 (+ phần tràn của tay xoay)', J(hh) === J(hv) && VeRobot.reachCua({ than: 'hai-banh', tay: 'kep' }) === 50 && VeRobot.reachCua({ than: 'hai-banh', tay: 'xoay' }) > 50);
  V.datCheDo('pixel');
  kiem('pixel: hinhHoc = hằng pixel part { mz 24, mzs 10,5, bk 23,5, pp 1, dinh 11 }; reachCua = REACH 26; vatXoay công thức cũ', J(VeRobot.hinhHoc({ than: 'hai-banh', tay: 'hoi' })) === J({ mz: 24, mzs: 10.5, bk: 23.5, pp: 1, dinh: 11 }) && VeRobot.reachCua({ than: 'hai-banh', tay: 'xoay' }) === 26
    && J(VeRobot.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'tren', 0)) === J({ f: 22, l: 0, n: 10 }));
  V.datCheDo('pixel');
}

/* ================================================================= 10. mọi ký hiệu / ô / vật có hình vector (liệt kê từ code) */
console.log('\n== 10. Mọi ký hiệu sân, ô của Ve.tiles(), hàm vẽ trực tiếp và vật đều có hình vector ==');
const SanHoc = require(path.join(day, 'san-hoc.js'));
const coHinh = (loai, ma) => !!V.lay(loai, ma);
{
  /* ký hiệu: thử từng ký tự in được với SanHoc.docSan (hai ô liền nhau: cổng cần đúng 2 ô); "Ký hiệu lạ" = không phải ký hiệu sân */
  const ky = [];
  for (let c = 32; c < 127; c++) {
    const ch = String.fromCharCode(c);
    try { SanHoc.docSan([ch + ch]); ky.push(ch); } catch (e) { if (!/Ký hiệu lạ/.test(e.message)) ky.push(ch); }
  }
  const thieuKy = ky.filter((ch) => !V.KY_HIEU[ch]), saiKy = [];
  for (const ch of ky) {
    const kh = V.KY_HIEU[ch]; if (!kh) continue;
    if (!(kh.o || []).length) saiKy.push(ch + ': không có lớp ô');
    for (const l of kh.o || []) { if (!coHinh('o', l[0])) saiKy.push(ch + '→o/' + l[0]); else for (const n of [14, 56, 168]) if (!coVe(V.o(l[0], n, l[1]).lenh)) saiKy.push(ch + '→o/' + l[0] + '@' + n + ' không vẽ'); }
    for (const l of kh.vat || []) if (!coHinh('vat', l[0])) saiKy.push(ch + '→vat/' + l[0]);
  }
  kiem(ky.length + ' ký hiệu SanHoc.docSan nhận (' + ky.join(' ') + ') đều có trong VeVector.KY_HIEU', ky.length > 20 && thieuKy.length === 0, 'thiếu: ' + J(thieuKy));
  kiem('mỗi ký hiệu có ít nhất một lớp ô, trỏ tới ô / vật đã đăng ký, vẽ được ở 3 cỡ với trạng thái của bảng', saiKy.length === 0, saiKy.join(', '));
  const kyHinh = []; for (const loai of ['o', 'vat']) for (const ma of V.ds(loai)) for (const k of V.lay(loai, ma).ky || []) kyHinh.push(k);
  kiem('ký hiệu khai trong từng hình (ky) đều là ký hiệu sân thật', kyHinh.every((k) => ky.includes(k)), J(kyHinh.filter((k) => !ky.includes(k))));

  /* ô pixel: mọi khoá của tileCache trong ve.js */
  const veSrc = fs.readFileSync(path.join(GAME, 've.js'), 'utf8'), m = /tileCache = \{([\s\S]*?)\n    \};/.exec(veSrc);
  const khoa = m ? [...new Set([...m[1].matchAll(/(?:^|[\s,{])([A-Za-z]\w*)\s*:/g)].map((x) => x[1]))] : [];
  const thieuT = khoa.filter((k) => !V.TILES[k] || !(coHinh('o', V.TILES[k]) || coHinh('vat', V.TILES[k])));
  kiem(khoa.length + ' ô của Ve.tiles() (đọc từ ve.js: ' + khoa.join(', ') + ') đều có hình vector trong VeVector.TILES', khoa.length >= 15 && thieuT.length === 0, 'thiếu: ' + J(thieuT));

  /* hàm vẽ trực tiếp của san-ve.js */
  const svSrc = fs.readFileSync(path.join(GAME, 'san-ve.js'), 'utf8');
  const goi = [...new Set([...svSrc.matchAll(/Ve\.((?:make|ve)[A-Z]\w*)\(/g)].map((x) => 'Ve.' + x[1]))];
  const thieuG = goi.filter((k) => !V.VE_TRUC_TIEP[k]);
  kiem(goi.length + ' hàm vẽ trực tiếp san-ve.js gọi (' + goi.join(', ') + ') đều có trong VeVector.VE_TRUC_TIEP', goi.length >= 3 && thieuG.length === 0, 'thiếu: ' + J(thieuG));
  const saiTT = [];
  for (const k of Object.keys(V.VE_TRUC_TIEP)) {
    const [loai, ...ma] = V.VE_TRUC_TIEP[k];
    for (const x of ma) if (!coHinh(loai, x)) saiTT.push(k + '→' + loai + '/' + x);
    if (k.startsWith('Field.')) {
      const ten = k.slice(6), i = svSrc.indexOf('\n    ' + ten + ': function');
      const than = i < 0 ? '' : svSrc.slice(i, svSrc.indexOf('\n    },', i));
      if (!/this\.vec/.test(than)) saiTT.push(k + ' không có nhánh this.vec');
    }
  }
  kiem('VE_TRUC_TIEP trỏ tới hình đã đăng ký; mỗi Field.* có nhánh this.vec trong san-ve.js', saiTT.length === 0, saiTT.join(', '));
  kiem('draw() của san-ve.js vẽ mọi ô bằng veOVec ở chế độ vector; ảnh nhỏ thuSan dùng VeVector.KY_HIEU',
    /if \(this\.vec\) \{ this\.veOVec\(/.test(svSrc) && /function thuOVec[\s\S]*?VeVector\.KY_HIEU/.test(svSrc) && /if \(vecT\) thuOVec\(/.test(svSrc));
  const kySrc = fs.readFileSync(path.join(GAME, 've-vector-ky-hieu.js'), 'utf8');
  const khongDung = [...V.ds('o'), ...V.ds('vat')].filter((ma) => !svSrc.includes("'" + ma + "'") && !kySrc.includes("'" + ma + "'"));
  kiem('mọi hình ô / vật trong kho đều được san-ve.js hay bảng nối dùng tới (không hình thừa)', khongDung.length === 0, J(khongDung));

  /* vật: mọi chất × màu của lõi */
  const DAI = { red: 'luatVatDo', green: 'luatVatXanhLa', blue: 'luatVatXanhDuong', yellow: 'luatVatVang' };
  const chat = [...new Set(Object.values(SanHoc.CHAT_KY))], saiV = [];
  for (const c of chat) for (const mau of [null, ...SanHoc.MAU_TEN]) {
    const o = c === 'N' || c === 'S' ? { chat: 'nam-cham', cuc: c, mau } : { chat: c, mau };
    const hv = V.vatCua(o);
    if (!coHinh('vat', hv[0])) { saiV.push(J(o) + '→' + hv[0]); continue; }
    const cv = V.vat(hv[0], 30, hv[1]);
    if (!coVe(cv.lenh)) saiV.push(J(o) + ' không vẽ');
    if (mau && o.chat !== 'nam-cham' && !mauCua(cv.lenh).includes(BM[DAI[mau]])) saiV.push(J(o) + ' thiếu đai màu luật');
  }
  kiem('mọi vật (chất ' + chat.join(' / ') + ' × không màu + ' + SanHoc.MAU_TEN.length + ' màu) có hình vector qua vatCua; vật màu có đai màu luật (luatVat*)', saiV.length === 0, saiV.slice(0, 6).join('; '));
  kiem('nam châm N tô luatVatDo, S tô luatVatXanhDuong (như bộ pixel); thùng nặng H / h và bóng hơi có hình',
    mauCua(V.vat('nam-cham', 30, { cuc: 'N' }).lenh).includes(BM.luatVatDo) && mauCua(V.vat('nam-cham', 30, { cuc: 'S' }).lenh).includes(BM.luatVatXanhDuong) && coHinh('vat', 'thung-nang') && coHinh('vat', 'bong'));
}

/* ================================================================= 11. mọi trạng thái mẫu × 3 cỡ, màu luật */
console.log('\n== 11. Mỗi hình × mọi trạng thái mẫu × 3 cỡ; trạng thái khác → hình khác; màu luật ==');
{
  const CO3 = [14, 56, 168], khongVe = [], mauLa = [], ngoai = [], trung = [], demSai = []; let so = 0;
  const anh = (loai, ma, n, s) => (loai === 'o' ? V.o(ma, n, s) : V.vat(ma, n, s));
  for (const loai of ['o', 'vat']) for (const ma of V.ds(loai)) {
    const tt = V.lay(loai, ma).cacTrangThai || [{}], luong = new Map();
    for (const s of tt) for (const n of CO3) {
      V.xoaDem(); const cv = anh(loai, ma, n, s); so++;
      if (!cv || !coVe(cv.lenh)) { khongVe.push(loai + '/' + ma + J(s) + '@' + n); continue; }
      for (const m of mauCua(cv.lenh)) if (!mauHopLe(m)) mauLa.push(loai + '/' + ma + ': ' + m);
      if (ngoaiO(cv).length) ngoai.push(loai + '/' + ma + J(s) + '@' + n);
      if (n === 56) { const k = cv.lenh.map(chuoi).join('\n'); if (luong.has(k)) trung.push(loai + '/' + ma + ' ' + J(s) + ' = ' + J(luong.get(k))); else luong.set(k, s); }
    }
    if (tt.length > 1) { V.xoaDem(); const a = anh(loai, ma, 56, tt[0]), b = anh(loai, ma, 56, tt[1]); if (a === b || a !== anh(loai, ma, 56, tt[0])) demSai.push(loai + '/' + ma); }
  }
  kiem(so + ' ảnh (mọi ô / vật × mọi trạng thái mẫu × cỡ ' + CO3.join(', ') + '): đều có lệnh tô / viền', khongVe.length === 0, khongVe.slice(0, 6).join(', '));
  kiem('mọi màu của chúng có trong bảng màu (hay rgba bộ ba của bảng)', mauLa.length === 0, [...new Set(mauLa)].slice(0, 6).join(', '));
  kiem('mọi điểm vẽ (kể cả nửa nét) nằm trong ô', ngoai.length === 0, ngoai.slice(0, 6).join(', '));
  kiem('hai trạng thái mẫu khác nhau của cùng hình → luồng lệnh khác (băng theo pha, cửa theo độ mở, nút theo bật / đè…)', trung.length === 0, trung.slice(0, 4).join('\n      '));
  kiem('bộ đệm theo trạng thái: cùng trạng thái → cùng canvas, khác trạng thái → canvas khác', demSai.length === 0, demSai.join(', '));
  const nen = { red: 'luatSanDo', green: 'luatSanXanhLa', blue: 'luatSanXanhDuong', yellow: 'luatSanVang' }, saiL = [];
  for (const m of Object.keys(nen)) {
    if (!mauCua(V.o('san-mau', 56, { mau: m }).lenh).includes(BM[nen[m]])) saiL.push('sàn ' + m + ' thiếu ' + nen[m]);
    if (!mauCua(V.o('dich', 56, { kieu: 'day', mau: m }).lenh).includes(BM[nen[m] + 'Vien'])) saiL.push('đích ' + m + ' thiếu ' + nen[m] + 'Vien');
  }
  kiem('sàn màu lấy nền luatSan*, khung đích màu lấy luatSan*Vien (nhóm LUAT, cùng màu luật với bộ pixel)', saiL.length === 0, saiL.join(', '));
  const rgb = (h) => { h = String(h).replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }, kc = (a, b) => Math.hypot(...a.map((x, i) => x - b[i]));
  const ds = [['đỏ', BM.luatSanDo], ['xanh lá', BM.luatSanXanhLa], ['xanh dương', BM.luatSanXanhDuong], ['vàng', BM.luatSanVang], ['sàn trắng', BM.vecSan], ['lưới sân', BM.vecSanToi]];
  let nho = Infinity, cap = '';
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < ds.length; j++) { const d = kc(rgb(ds[i][1]), rgb(ds[j][1])); if (d < nho) { nho = d; cap = ds[i][0] + ' – ' + ds[j][0]; } }
  kiem('bốn màu sàn luật cách nhau và cách nền sân trắng ≥ 80 (RGB): nhỏ nhất ' + nho.toFixed(0) + ' (' + cap + ')', nho >= 80);
}

/* ================================================================= 12. (gói V3) mọi thân / tay / cảm biến của bộ PART có hình vector; mọi tổ hợp ghép như Part.ghep */
console.log('\n== 12. (V3) Thân / tay / cảm biến: liệt kê từ part/*.js, ghép mọi tổ hợp như Part.ghep, 4 hướng, ổ đúng phía, màu đội, trạng thái, mọi màn ==');
{
  const Part = require(path.join(GAME, 'part', 'part.js'));
  for (const f of fs.readdirSync(path.join(GAME, 'part')).filter((f) => /^part-.*\.js$/.test(f)).sort()) require(path.join(GAME, 'part', f));
  /* a. danh sách bộ phận */
  const thieu = [], sai = [];
  for (const loai of ['than', 'tay', 'cam-bien']) {
    const mp = Part.ds(loai).map((d) => d.ma), mv = V.ds(loai);
    for (const ma of mp) if (!mv.includes(ma)) thieu.push(loai + '/' + ma);
    for (const ma of mv) if (!mp.includes(ma)) sai.push(loai + '/' + ma + ' (vector có, pixel không)');
    for (const d of Part.ds(loai)) {
      const v = V.lay(loai, d.ma); if (!v) continue;
      if (loai !== 'than' && (J([].concat(v.gan)) !== J([].concat(d.gan)) || v.ten !== d.ten)) sai.push(loai + '/' + d.ma + ': gan / ten khác pixel (' + J(v.gan) + ' / ' + v.ten + ')');
      if (loai === 'tay' && d.diemNeoDuoi && !v.diemNeoDuoi) sai.push('tay/' + d.ma + ' thiếu diemNeoDuoi');
      if (loai === 'than') for (const o of Object.keys(d.oGan)) if (!v.oGan[o]) sai.push('than/' + d.ma + ' thiếu ổ ' + o);
    }
  }
  kiem('mọi bộ phận của part/*.js (' + Part.ds('than').length + ' thân, ' + Part.ds('tay').length + ' tay, ' + Part.ds('cam-bien').length + ' cảm biến) có hình vector cùng mã', thieu.length === 0, 'thiếu: ' + thieu.join(', '));
  kiem('cùng ổ gắn (gan, ten) với pixel; thân vector có đủ mọi ổ của thân pixel (tay, hongTrai, hongPhai, tren; drone: duoi, bung…); không bộ phận thừa', sai.length === 0, sai.join('; '));
  const tepGame = fs.readdirSync(GAME).filter((f) => /^ve-vector-.*\.js$/.test(f)), xemSrc = fs.readFileSync(path.join(day, 'hinh-mau', 'xem-vector.html'), 'utf8');
  const khongNap = tepGame.filter((f) => !TEP_VEC.includes(f) || !xemSrc.includes('../game/' + f + '"'));
  kiem('mọi tệp ve-vector-*.js (' + tepGame.length + ') nạp trong choi.html và hinh-mau/xem-vector.html', khongNap.length === 0, J(khongNap));

  /* b. mọi tổ hợp: thân × (không tay + tay) × bộ cảm biến (không, từng cảm biến ở từng ổ, vài cặp) — Part.ghep ném ⇔ VeVector.kiemGhep ném, cùng câu báo */
  const O = ['hong', 'truoc', 'hongTrai', 'hongPhai', 'tren', 'bung', 'duoi'];
  const boCam = [[]];
  for (const cb of Part.ds('cam-bien')) for (const o of O) boCam.push([{ ma: cb.ma, o }]);
  boCam.push([{ ma: 'camera', o: 'tren' }, { ma: 'mau', o: 'hong' }], [{ ma: 'khoang-cach', o: 'hong' }, { ma: 'mau', o: 'hong' }], [{ ma: 'camera', o: 'tren' }, { ma: 'hong-ngoai', o: 'tren' }],
    [{ ma: 'khoang-cach', o: 'hong' }, { ma: 'cham', o: 'hong' }, { ma: 'hong-ngoai', o: 'tren' }], [{ ma: 'camera-bay', o: 'bung' }, { ma: 'khoang-cach', o: 'hong' }, { ma: 'mau', o: 'hong' }]);
  const hopLe = [], lechLuat = []; let soCam = 0;
  for (const than of Part.ds('than').map((d) => d.ma)) for (const tay of [null, ...Part.ds('tay').map((d) => d.ma)]) for (const camBien of boCam) {
    const cfg = { than, tay, camBien };
    let ep = null, ev = null;
    try { Part.ghep(cfg); } catch (e) { ep = e.message; }
    try { V.kiemGhep(cfg); } catch (e) { ev = e.message; }
    if (ep !== ev) lechLuat.push(J(cfg) + ' pixel: ' + ep + ' | vector: ' + ev);
    else if (ep) soCam++; else hopLe.push(cfg);
  }
  kiem((hopLe.length + soCam) + ' tổ hợp (' + hopLe.length + ' ghép được, ' + soCam + ' cấm): VeVector.kiemGhep ném ĐÚNG khi Part.ghep ném, cùng câu báo (drone + camera, drone + tay khác nam châm, camera-bay trên xe, camera + cảm biến màu, sai ổ…)',
    lechLuat.length === 0 && hopLe.length > 300 && soCam > 100, lechLuat.slice(0, 4).join('\n      '));
  let nem = null; try { V.robot({ than: 'drone', camBien: [{ ma: 'camera', o: 'tren' }] }, {}, 0, 56); } catch (e) { nem = e.message; }
  kiem('VeVector.robot với cấu hình cấm ném lỗi (VeRobot bắt, báo một lần, rơi về hình tạm như pixel): "' + nem + '"', !!nem && /Drone không gắn được camera/.test(nem));

  /* c. mọi tổ hợp hợp lệ × 4 hướng × 2 cỡ: vẽ được, màu từ bảng, nằm trong ô (canvas = một ô; tay xoay có lề tràn), drone không xoay, không bóng đổ trong hình drone */
  const khongVe = [], mauLa = [], ngoai = [], droneXoay = [], bongDrone = [];
  const trongVung = (cv, canh) => { const pad = (cv.width - canh) / 2; return diemThietBi(cv.lenh).filter((p) => p.x - p.le < pad - 0.5 || p.y - p.le < pad - 0.5 || p.x + p.le > pad + canh + 0.5 || p.y + p.le > pad + canh + 0.5); };
  const ST = { kep: { kep: 'mo', tuThe: 'tren' }, xoay: { kep: 'mo', tuThe: 'tren', goc: 0 }, 'nam-cham': { bat: true }, nem: { ngam: 3 }, hoi: { dangBanTruoc: true, dangBanSau: true }, son: { tuThe: 'duoi', mauSon: 'yellow' } };
  for (const cfg of hopLe) for (const n of [37, 84]) {
    const anh = [];
    for (const h of [0, 1, 2, 3]) {
      V.xoaDem();
      const st = { than: { banh: { trai: 1, phai: 1 }, buoc: 1, quat: true }, tay: cfg.tay ? ST[cfg.tay] : undefined, camBien: { bat: true, mat: true } };
      const cv = V.robot(cfg, st, h, n);
      if (!cv || !coVe(cv.lenh)) { khongVe.push(J(cfg) + ' h' + h); continue; }
      for (const m of mauCua(cv.lenh)) if (!mauHopLe(m)) mauLa.push(J(cfg) + ': ' + m);
      if (trongVung(cv, n).length) ngoai.push(J(cfg) + ' ' + TEN_HUONG[h] + '@' + n);
      anh.push(cv.lenh.map(chuoi).join('\n'));
      if (cfg.than === 'drone' && cv.lenh.some((l) => l[0] === 'ellipse' && l[1] === 2 && l[2] === 5)) bongDrone.push(J(cfg));
    }
    if (cfg.than === 'drone' && new Set(anh).size !== 1) droneXoay.push(J(cfg) + '@' + n);
  }
  kiem(hopLe.length + ' tổ hợp × 4 hướng × 2 cỡ (37, 84): đều vẽ được, mọi màu từ bảng màu', khongVe.length === 0 && mauLa.length === 0, khongVe.slice(0, 4).concat([...new Set(mauLa)].slice(0, 4)).join(', '));
  kiem('mọi nét (kể cả nửa nét, trạng thái tay giang rộng nhất) nằm trong ô — tay xoay ở nấc trước cũng vậy', ngoai.length === 0, ngoai.slice(0, 5).join('\n      '));
  kiem('drone không có hướng mặt: bốn hướng ra cùng một hình (không xoay), không bóng đổ trong hình (bóng theo độ cao do san-ve.js vẽ)', droneXoay.length === 0 && bongDrone.length === 0, droneXoay.concat(bongDrone).slice(0, 4).join(', '));

  /* tay xoay: nấc trái / phải trong ô; đang xoay (±45°) có thể chờm sang ô chéo nhưng vẫn trong canvas có lề tràn; vật ở nấc trái nằm bên trái xe */
  const xoaySai = [];
  for (const than of ['hai-banh', 'xich', 'nhen', 'omni']) for (const goc of [-90, -45, 0, 45, 90]) for (const tuThe of ['tren', 'duoi']) for (const h of [0, 1, 2, 3]) {
    V.xoaDem(); const cv = V.robot({ than, tay: 'xoay' }, { tay: { kep: 'dong', cam: true, goc, tuThe } }, h, 84);
    if (Math.abs(goc) !== 45 && trongVung(cv, 84).length) xoaySai.push(than + ' ' + goc + '° ' + tuThe + ' ' + TEN_HUONG[h] + ': ngoài ô');
    if (ngoaiO(cv).length) xoaySai.push(than + ' ' + goc + '° ' + TEN_HUONG[h] + ': ngoài canvas');
  }
  const vT = V.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'tren', -90), vP = V.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'tren', 90), v0 = V.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'tren', 0), vk0 = V.vatKep({ than: 'hai-banh', tay: 'xoay' }, 'tren');
  kiem('tay xoay: nấc trái / trước / phải trong ô, đang xoay ±45° trong canvas lề tràn (' + V.tranCua({ tay: 'xoay' }) + ' ô); vật nấc trái l < 0, nấc phải l > 0, ra ngoài thân (|l| ≥ 30); nấc trước trùng vatKep (f ' + v0.f.toFixed(1) + ')',
    xoaySai.length === 0 && vT.l < -30 && vP.l > 30 && Math.abs(v0.l) < 1e-9 && Math.abs(v0.f - vk0.ahead) < 1e-9 && vT.l + vT.n / 2 >= -50 - 1e-9, xoaySai.slice(0, 4).join('; ') + ' l trái ' + vT.l.toFixed(1));

  /* d. ổ đúng phía sau xoay: tay về phía mặt, hongTrai bên trái xe, hongPhai bên phải, tren phía trước, sau phía sau */
  const oSai = [];
  for (const than of V.ds('than').filter((t) => !V.lay('than', t).khongHuong)) for (const h of [0, 1, 2, 3]) for (const n of [56, 84]) {
    const truoc = [DX[h], DY[h]], trai = [DY[h], -DX[h]], tam = n / 2;
    const huongO = (o) => { const p = V.diemO({ than }, o, h, n); if (!p) { oSai.push(than + ' thiếu ổ ' + o); return [0, 0, 0]; } const d = [p.x - tam, p.y - tam], r = Math.hypot(...d) || 1; return [d[0] / r, d[1] / r, r]; };
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
    const t = huongO('tay'), l = huongO('hongTrai'), r = huongO('hongPhai'), tr = huongO('tren'), sa = huongO('sau');
    if (!(dot(t, truoc) > 0.99 && t[2] > n * 0.1)) oSai.push(than + ' ' + TEN_HUONG[h] + ' tay');
    if (!(dot(l, trai) > 0.9)) oSai.push(than + ' ' + TEN_HUONG[h] + ' hongTrai');
    if (!(dot(r, trai) < -0.9)) oSai.push(than + ' ' + TEN_HUONG[h] + ' hongPhai');
    if (!(dot(tr, truoc) > 0.5 && dot(tr, trai) > 0)) oSai.push(than + ' ' + TEN_HUONG[h] + ' tren (góc mũi trái)');
    if (!(dot(sa, truoc) < -0.5)) oSai.push(than + ' ' + TEN_HUONG[h] + ' sau');
  }
  kiem('sau xoay 4 hướng × 2 cỡ: ổ tay ở phía mặt; hongTrai bên TRÁI xe, hongPhai bên PHẢI; tren ở góc mũi trái; sau ở đuôi (mọi thân có hướng)', oSai.length === 0, oSai.slice(0, 6).join(', '));
  const vkSai = [];
  for (const than of ['hai-banh', 'xich', 'nhen', 'omni']) for (const tay of ['kep', 'xoay']) for (const tt of ['tren', 'duoi']) { const k = V.vatKep({ than, tay }, tt); if (!k || !(k.ahead > 20 && k.ahead + k.n / 2 <= 50.5)) vkSai.push(than + '/' + tay + '/' + tt); }
  kiem('vật trong kẹp (kẹp, tay xoay) ở phía trước, trong ô, trên mọi thân có hướng', vkSai.length === 0, vkSai.join(', '));
  const hh = V.ds('than').map((t) => [t, V.hinhHoc({ than: t, tay: t === 'drone' ? 'nam-cham' : 'hoi' })]), hhSai = hh.filter(([t, x]) => !(x.mz > 30 && x.mz < 50 && x.mzs > 20 && x.mzs < 50 && x.dinh > 20 && x.dinh < 50));
  const bk = V.hinhHoc({ than: 'hai-banh', tay: 'nem' }).bk;
  kiem('hinhHoc: miệng nòng trước / sau, rổ máy ném (' + bk.toFixed(1) + '), đỉnh drone trong (20, 50) phần trăm ô', hhSai.length === 0 && bk > 25 && bk * 27.5 / 23.5 < 46, J(hhSai));

  /* e. màu đội: mọi tổ hợp R1 ↔ R2 chỉ khác màu đội, đúng ba chỗ (kính 1 gradient, mắt 2 viền, chấm ăng-ten 1 tô) */
  const M1 = V.mauDoi('vang'), M2 = V.mauDoi('lam'), doiSai = [];
  const doiMau = (x) => x.split(M2.chinh).join(M1.chinh).split(M2.toi).join(M1.toi);
  for (const cfg of hopLe.filter((c, i) => i % 3 === 0)) {
    V.xoaDem();
    const st = { tay: cfg.tay ? ST[cfg.tay] : undefined, camBien: { bat: true, mat: true }, than: { quat: true, doc: true } };
    const a = V.robot(Object.assign({}, cfg, { son: '' }), st, 1, 84).lenh.map(chuoi), b = V.robot(Object.assign({}, cfg, { son: 'lam' }), st, 1, 84).lenh.map(chuoi);
    const kinh = b.filter((x) => x.startsWith('createLinearGradient') && x.includes(M2.toi) && x.includes(M2.chinh)).length, mat = b.filter((x) => x === 'strokeStyle ' + M2.chinh).length, cham = b.filter((x) => x === 'fillStyle ' + M2.chinh).length;
    const ok = a.length === b.length && b.every((x, i) => doiMau(x) === a[i]) && kinh === 1 && mat === 2 && cham === 1 && b.filter((x) => x.includes(M2.chinh) || x.includes(M2.toi)).length === 5;      // kính: lệnh tạo gradient + fillStyle gradient; hai viền mắt; chấm ăng-ten
    if (!ok) doiSai.push(J(cfg) + ' kính ' + kinh + ' mắt ' + mat + ' chấm ' + cham);
  }
  kiem('màu đội trên mọi thân / tay / cảm biến: R1 ↔ R2 chỉ khác màu đội, đúng ba chỗ (kính, hai mắt, chấm ăng-ten); tay / cảm biến không mang màu đội', doiSai.length === 0, doiSai.slice(0, 4).join('\n      '));

  /* f. trạng thái động: mỗi trạng thái chính ra hình khác */
  const TTD = [
    ['hai-banh', 'kep', [{ tay: { kep: 'mo' } }, { tay: { kep: 'dong' } }, { tay: { kep: 'dong', cam: true } }, { tay: { kep: 'mo', tuThe: 'duoi' } }]],
    ['hai-banh', 'nam-cham', [{ tay: {} }, { tay: { bat: true } }, { tay: { bat: true, cuc: 'N' } }, { tay: { bat: true, cuc: 'S' } }, { tay: { cuc: 'N' } }]],
    ['drone', 'nam-cham', [{ tay: {} }, { tay: { bat: true, cuc: 'S' } }, { than: { quat: false } }, { than: { quat: true, buoc: 1 } }, { than: { doc: true } }]],
    ['hai-banh', 'hoi', [{ tay: {} }, { tay: { dangBanTruoc: true } }, { tay: { dangBanSau: true } }, { tay: { chiTruoc: true } }]],
    ['hai-banh', 'nem', [{ tay: { ngam: 1 } }, { tay: { ngam: 2 } }, { tay: { ngam: 3 } }, { tay: { ngam: 1, dangNem: true } }, { tay: { ngam: 1, cam: true } }]],
    ['hai-banh', 'xoay', [{ tay: { goc: 0 } }, { tay: { goc: -45 } }, { tay: { xoay: 'trai' } }, { tay: { xoay: 'phai' } }, { tay: { goc: 0, kep: 'dong' } }, { tay: { goc: 0, tuThe: 'duoi' } }]],
    ['hai-banh', 'son', [{ tay: { mauSon: 'red' } }, { tay: { mauSon: 'green' } }, { tay: { mauSon: 'blue' } }, { tay: { mauSon: 'yellow' } }, { tay: { mauSon: 'red', tuThe: 'duoi' } }]],
    ['nhen', null, [{}, { than: { co: true } }, { than: { buoc: 1 } }]],
    ['xich', null, [{ than: { banh: { trai: 1, phai: 1 }, buoc: 0 } }, { than: { banh: { trai: 1, phai: 1 }, buoc: 1 } }]],
    ['omni', null, [{ than: { banh: { trai: 1, phai: 1 }, buoc: 0 } }, { than: { banh: { trai: 1, phai: 1 }, buoc: 1 } }]]
  ];
  const ttSai = [];
  for (const [than, tay, ds] of TTD) { const seen = new Map(); for (const st of ds) { V.xoaDem(); let k; try { k = V.robot({ than, tay }, st, 2, 84).lenh.map(chuoi).join('\n'); } catch (e) { ttSai.push(than + '/' + tay + ': ' + e.message); continue; } if (seen.has(k)) ttSai.push(than + '/' + tay + ' ' + J(st) + ' = ' + J(seen.get(k))); else seen.set(k, st); } }
  for (const cb of ['khoang-cach', 'mau', 'cham', 'hong-ngoai', 'camera']) for (const than of ['hai-banh', 'xich', 'nhen', 'omni']) {
    const cfg = { than, camBien: [{ ma: cb, o: cb === 'camera' || cb === 'hong-ngoai' ? 'tren' : 'hong' }] };
    V.xoaDem(); const a = V.robot(cfg, { camBien: {} }, 0, 84).lenh.map(chuoi).join('\n'), b = V.robot(cfg, { camBien: { bat: true, mat: true } }, 0, 84).lenh.map(chuoi).join('\n'), c = V.robot({ than }, {}, 0, 84).lenh.map(chuoi).join('\n');
    if (a === b) ttSai.push(than + '/' + cb + ': đang đọc không khác tắt'); if (a === c) ttSai.push(than + '/' + cb + ': gắn mà không thấy');
  }
  try { V.xoaDem(); const cfg = { than: 'drone', camBien: [{ ma: 'camera-bay', o: 'bung' }] }; if (V.robot(cfg, { camBien: {} }, 0, 84).lenh.map(chuoi).join() === V.robot(cfg, { camBien: { mat: true } }, 0, 84).lenh.map(chuoi).join()) ttSai.push('camera-bay: mat không khác'); } catch (e) { ttSai.push('camera-bay: ' + e.message); }
  kiem('trạng thái động ra hình khác: kẹp mở / đóng / ôm / hạ, nam châm hút + cực, drone quạt / pha / đo pin, súng nạp / bắn trước / sau, máy ném tầm / ném / có vật, tay xoay góc, máy sơn màu / hạ, nhện co / bước, xích / omni nhịp; cảm biến đang đọc, camera sáng mắt', ttSai.length === 0, ttSai.slice(0, 6).join('; '));

  /* g. mọi màn (cả từng robot của màn đội): cấu hình VeRobot.cauHinhCua vẽ được bằng vector — không màn nào rơi về pixel */
  for (const f of ['thu-tu-chuong', 'so-lenh', 'man-chuoi-1']) require(path.join(day, f + '.js'));
  for (const f of fs.readdirSync(day).filter((f) => /^man-.*\.js$/.test(f)).sort()) require(path.join(day, f));
  const ManHoc = require(path.join(day, 'man-chuoi-1.js'));
  V.datCheDo('vector');
  const cacCfg = new Map(), roiPixel = [];
  for (const m of ManHoc.danhSach) {
    const ds = m.doi ? m.doi.map((r) => { const o = Object.assign({}, m, r); delete o.doi; return o; }) : [m];
    for (const mk of ds) { const c = VeRobot.cauHinhCua(mk); const k = J({ than: c.than, tay: c.tay, camBien: c.camBien }); if (!cacCfg.has(k)) cacCfg.set(k, m.id || m.ma); }
  }
  for (const [k, id] of cacCfg) {
    const c = JSON.parse(k); let ep = null; try { Part.ghep(c); } catch (e) { ep = e.message; }
    if (ep) continue;                                                                  // cấu hình pixel cũng không ghép được (hình tạm cả hai chế độ)
    let cv = null; try { cv = VeRobot.ve(c, { wl: 2, wr: 2, ph: 1, tay: { tuThe: 'tren', kep: false }, camBien: { bat: true } }, 1, 0.56); } catch (e) { cv = null; }   // Node: hình tạm (rơi về pixel) cần Ve của trình duyệt
    if (!VeRobot.veVector(c) || !cv || !cv.laVector) roiPixel.push(id + ' ' + k);
  }
  kiem(ManHoc.danhSach.length + ' màn (cả từng robot của màn đội) → ' + cacCfg.size + ' cấu hình robot khác nhau: ở chế độ vector đều vẽ bằng vector (VeRobot.ve cờ .laVector), không rơi về pixel', ManHoc.danhSach.length > 300 && roiPixel.length === 0, roiPixel.slice(0, 5).join('\n      '));
  let nhenKhongTay = false, droneMoi = false, bao = 0, cam = null;
  try {
    nhenKhongTay = VeRobot.ve({ than: 'nhen', tay: null, camBien: [] }, {}, 1, 0.56) === VeRobot.ve({ than: 'nhen', tay: null, camBien: [] }, {}, 3, 0.56);
    droneMoi = VeRobot.ve({ than: 'drone', tay: 'nam-cham', camBien: [] }, {}, 1, 0.56) === VeRobot.ve({ than: 'drone', tay: 'nam-cham', camBien: [] }, {}, 2, 0.56);
    bao = 0; const cw = console.warn; console.warn = () => { bao++; };
    try { cam = VeRobot.ve({ than: 'drone', tay: null, camBien: [{ ma: 'camera', o: 'tren' }] }, {}, 0, 0.56); } catch (e) { cam = null; /* Node: hình tạm cần Ve của trình duyệt */ } console.warn = cw;
  } catch (e) { /* lỗi giả: cấu hình rơi về hình tạm (cần Ve của trình duyệt) */ }
  kiem('VeRobot (như bộ pixel): nhện không tay và drone không quay theo hướng; cấu hình cấm báo một lần rồi không trả hình vector', nhenKhongTay && droneMoi && bao === 1 && !(cam && cam.laVector));
  V.datCheDo('pixel');
}

console.log('\n---------------------------------------------');
console.log((hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) : 'ĐẠT ' + dat + ' · HỎNG 0') + ' kiểm' + (LOI_GIA ? ' (đang cắm lỗi giả: phải đỏ)' : ''));
process.exit(hong ? 1 : 0);

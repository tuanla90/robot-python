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
   Cờ --loi-gia: cắm sáu lỗi giả (neo tay lệch, góc xoay lệch 90°, màu R2 = R1, đệm bỏ cỡ, ô tường tô mã màu ngoài bảng, ổ tay thân ra ngoài ô) → máy kiểm phải ĐỎ.
   Chạy: node hoc/kiem-ve-vector.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
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
for (const f of ['ve-vector-o.js', 've-vector-than-hai-banh.js', 've-vector-tay-kep.js']) require(path.join(GAME, f));
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
  const can = { o: ['san', 'tuong', 'co'], vat: ['thung-go'], than: ['hai-banh'], tay: ['kep'] };
  for (const loai of Object.keys(can)) {
    const thieu = can[loai].filter((ma) => !V.lay(loai, ma));
    kiem(loai + ': có ' + can[loai].join(', ') + ' (kho: ' + V.ds(loai).join(', ') + ')', thieu.length === 0, 'thiếu ' + thieu.join(', '));
  }
  const loiTruong = [];
  for (const loai of ['o', 'vat', 'than', 'tay', 'cam-bien']) for (const ma of V.ds(loai)) {
    const d = V.lay(loai, ma);
    if (!d.ten || typeof d.ve !== 'function') loiTruong.push(loai + '/' + ma + ' thiếu ten / ve');
    if (loai === 'than' && !(d.oGan && d.oGan.tay)) loiTruong.push(loai + '/' + ma + ' thiếu oGan.tay');
    if (loai === 'tay' && !(d.diemNeo && d.gan === 'tay' && d.vatKep && d.vatKep.canh > 0)) loiTruong.push(loai + '/' + ma + ' thiếu diemNeo / gan / vatKep');
  }
  kiem('mỗi hình có ten + ve(); thân có oGan.tay; tay có diemNeo, gan = tay, vatKep', loiTruong.length === 0, loiTruong.join('; '));
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
  kiem('không tay → vatKep = null; thân lạ → null', V.vatKep({ than: 'hai-banh', tay: null }) === null && V.vatKep({ than: 'xich', tay: 'kep' }) === null);
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
  kiem('coDu: hai-banh / hai-banh + kẹp → true; xích, nam châm, cảm biến màu, drone → false (rơi về pixel)',
    V.coDu({ than: 'hai-banh' }) && V.coDu({ than: 'hai-banh', tay: 'kep', camBien: [] }) && !V.coDu({ than: 'xich' }) && !V.coDu({ than: 'hai-banh', tay: 'nam-cham' })
    && !V.coDu({ than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'mau', o: 'hong' }] }) && !V.coDu({ than: 'drone' }));
  kiem('robot() với cấu hình thiếu hình → null (không ném)', V.robot({ than: 'xich' }, {}, 0, 56) === null && V.robot({ than: 'hai-banh', tay: 'hoi' }, {}, 0, 56) === null);
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
  kiem('vector: cấu hình chưa có hình (xích) vẫn dùng công thức pixel', VeRobot.tiLeChoO(84, { than: 'xich' }) === pixel(84, 20));
  const vk = VeRobot.vatKep({ than: 'hai-banh', tay: 'kep' }, 'tren'), vv = V.vatKep({ than: 'hai-banh', tay: 'kep' }, 'tren');
  kiem('vector: vatKep lấy từ VeVector (' + (vk && vk.ahead.toFixed(1)) + ', ' + (vk && vk.n.toFixed(1)) + '); tay khác giữ pixel', !!vk && !!vv && vk.ahead === vv.ahead && vk.n === vv.n && J(VeRobot.vatKep({ than: 'hai-banh', tay: 'xoay' }, 'tren')) === J({ ahead: 18, n: 10 }));
  V.datCheDo('pixel');
}

console.log('\n---------------------------------------------');
console.log((hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) : 'ĐẠT ' + dat + ' · HỎNG 0') + ' kiểm' + (LOI_GIA ? ' (đang cắm lỗi giả: phải đỏ)' : ''));
process.exit(hong ? 1 : 0);

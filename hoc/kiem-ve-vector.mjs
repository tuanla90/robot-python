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
     8. coDu(): chỉ cấu hình đủ hình vector mới vẽ bằng vector; V7c1: game LUÔN vector (bat() = true, không còn ?ve= / luuCheDo).
     9. VeRobot (ve-robot.js): tiLeChoO / vatKep / REACH theo VeVector và theo coDu (cấu hình thiếu hình vẫn rơi về công thức pixel).
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
  13. (gói V4) Hoạt cảnh trên sân: chạy san-ve.js THẬT trong ngữ cảnh vm (canvas giả, đồng hồ ảo, Math.random hạt cố định), phát lại vết ChamHoc (lời giải + lời sai) của 22 màn
       (cả hai-robot): VECTOR y nguyên từng lệnh so với nền 3fe6fa8 (13a-v, V7c1; phanh pixel 13a so a962f7b đã gỡ); VECTOR không còn fillRect / strokeRect; tia cảm biến từ ổ thật; mắt biểu cảm (12 kiểu khác nhau trên 5 thân,
       sự kiện đâm / ? / tới cờ / xong màn / húc bạn / chờ → đúng biểu cảm, chớp 2,5–5 s lệch nhau); camera không đổi mắt (ống kính ở đuôi); cảm biến dính vỏ; VeRobot.veCo; cờ bay, sàn bàn cờ.
  14. (gói V5a) Giao diện phẳng màn chơi (choi-vector.css): nạp đủ phông Google Sans Flex / Code + choi-vector.css sau choi.css; mọi bộ chọn trong body.ve-vector (pixel y nguyên);
       không steps( / pixelated / Handjet / VT323; mọi steps() màn chơi của choi.css (và huong-dan.js) có luật phủ mượt, có prefers-reduced-motion; chữ canvas vector không VT323;
       tương phản WCAG AA mọi cặp chữ / nền khai cùng luật; (14f, V7c1) hết công tắc Kiểu vẽ / ?ve= / luuCheDo, body có sẵn lớp ve-vector; trang xem có mục V5a.
   (gói V6b) mục 13h: cỡ vật trong tay ở vector (phát lại màn kẹp / tay xoay / nam châm): hạ = vật nằm sàn, nâng 1,15–1,25 lần, chuyển dần, bóng nâng xa hơn, vật dính
       nam châm = cỡ nâng; càng / ngón ôm vật ở mọi độ nâng. Mục 4 / 9 / 12: vật trong tay to chờm sang ô trước mặt, nằm trong tầm lớp phủ (VeVector.tamVoi, reachCua).
   (gói V7a) mục 13i: vật treo dưới drone nam châm = cỡ vật nâng (phát lại drone.7, che-drone.6); tay xoay mở / khép dần (khe theo moK); dây nối nút ↔ cửa theo cfg.noi (dungDayNoi, chỉ vector vẽ).
   (gói V8a) mục 13j: dáng bò nhện theo pha liên tục (lan / di / nhac): pha 0 / cuối nhịp = tư thế đứng, 15 pha 1/16 khác nhau, 4 hướng đi khác nhau; phát nhịp chuẩn bị + nhịp bước
       trên sân: hai cặp chân nhấc luân phiên, pha ≥ 8 bậc, hướng đổi đúng sang hệ thân (cả nhện có tay quay mặt), xong bước về đứng. --loi-gia: bỏ dangBo → 13j đỏ.
   Cờ --loi-gia: cắm sáu lỗi giả (neo tay lệch, góc xoay lệch 90°, màu R2 = R1, đệm bỏ cỡ, ô tường tô mã màu ngoài bảng, ổ tay thân ra ngoài ô) và bốn lỗi V2
   (bỏ ký hiệu hố khỏi bảng nối, bỏ ô bậc thang của Ve.tiles khỏi bảng, băng chuyền bỏ qua pha, sàn màu vàng tô màu ngoài nhóm LUAT) và bốn lỗi V3 (drone mất cờ không hướng,
   xích đổi chỗ hai ổ hông, nam châm tô màu đội, camera-bay sai ổ) và sáu lỗi V4 (nhánh pixel veDau tô thêm, hạt vector dùng fillRect, tia từ tâm xe, matSuKien bỏ qua,
   veCo vector bỏ devicePixelRatio, ổ hông hai-banh dời ra 10 đơn vị) và năm lỗi V5a (luật không có body.ve-vector có steps(), bỏ phủ .ffr.rung, chữ canvas về VT323,
   hàng Kiểu vẽ quay lại, cặp chữ / nền 2:1) và hai lỗi V6b (vật trong tay cỡ cũ không theo độ nâng, càng kẹp khe cũ) → máy kiểm phải ĐỎ.
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
const docGame = (f) => fs.readFileSync(path.join(GAME, f), 'utf8');   // V7c1: đọc nguồn một tệp game (mục 6, 9)
const TEP_VEC = [...CHOI_SRC.matchAll(/<script src="(ve-vector-[\w-]+\.js)"/g)].map((m) => m[1]);
for (const f of TEP_VEC) require(path.join(GAME, f));
let VeRobot = null;
try { VeRobot = require(path.join(GAME, 've-robot.js')); } catch (e) { console.log('(không nạp được ve-robot.js ở Node: ' + e.message + ')'); }
/* V7c1: nạp bộ màn NGAY (trước khi cắm lỗi giả): lap-rap.js macDinh nay xét ghép bằng VeVector (globalThis.VeVector = V) — cắm lỗi giả lên V trước rồi mới nạp màn thì màn lắp ráp hỏng, mục 12g ném */
for (const f of ['thu-tu-chuong', 'so-lenh', 'man-chuoi-1']) require(path.join(day, f + '.js'));
for (const f of fs.readdirSync(day).filter((f) => /^man-.*\.js$/.test(f)).sort()) require(path.join(day, f));

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
  V._loiGia.kheCu = true;                                                         // V6b: càng kẹp giữ khe cũ (mục 13h phải đỏ); vật cỡ cũ cắm ở ngữ cảnh vm của mục 13
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
  const tamKep = V.tamVoi({ than: 'hai-banh', tay: 'kep' });
  kiem('vatKep (đơn vị 1/100 ô): tâm vật trước tâm thân ' + (vk && vk.ahead.toFixed(1)) + ', thân vật nâng ' + (vk && vk.n.toFixed(1)) + ' / hạ ' + (vkH && vkH.n.toFixed(1)) + '; tay hạ xa hơn (' + (vkH && vkH.ahead.toFixed(1)) + '); vật không lùi quá tâm thân, nằm trong tầm lớp phủ (V6b: vật to chờm sang ô trước mặt, tamVoi ' + tamKep.toFixed(1) + ')',
    !!vk && !!vkH && vk.ahead > 20 && vk.n > vkH.n && vkH.n > 10 && vkH.ahead > vk.ahead && vk.ahead - vk.n / 2 > 0 && Math.max(vk.ahead + vk.n / 2, vkH.ahead + vkH.n / 2) <= tamKep);
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
  const doiMau = (s) => s.split(M2.chinh).join(M1.chinh).split(M2.toi).join(M1.toi).split(M2.mat).join(M1.mat).split(M2.matRgb).join(M1.matRgb);      // 29/10: lõi / quầng mắt cũng theo đội
  const chiMau = khac.every((i) => doiMau(r2[i]) === r1[i]);
  const loaiKhac = khac.map((i) => r2[i].split(' ')[0]).sort();
  kiem('R1 và R2: cùng độ dài luồng (' + r1.length + '), chỉ khác ở màu đội; chỗ khác = ' + J(loaiKhac),
    r1.length === r2.length && khac.length >= 3 && chiMau && loaiKhac.includes('createLinearGradient') && loaiKhac.includes('strokeStyle') && loaiKhac.includes('fillStyle'), 'khác ' + khac.length + ' chỗ; chỉ màu: ' + chiMau);
  const kinh = r2.filter((s) => s.startsWith('createLinearGradient') && s.includes(M2.toi) && s.includes(M2.chinh)).length;
  const mat = r2.filter((s) => s === 'strokeStyle ' + M2.chinh).length, cham = r2.filter((s) => s === 'fillStyle ' + M2.chinh).length;
  kiem('R2: kính = 1 gradient (toi → chinh), mắt = 2 viền chinh, chấm ăng-ten = 1 tô chinh', kinh === 1 && mat === 2 && cham === 1, 'kính ' + kinh + ', mắt ' + mat + ', chấm ' + cham);
  kiem('luồng R2 không còn màu R1 và ngược lại', !r2.some((s) => s.includes(M1.chinh) || s.includes(M1.toi)) && !r1.some((s) => s.includes(M2.chinh) || s.includes(M2.toi)));
  {   /* 29/10 (user: mắt R2 vẫn xanh, tim đỏ trên kính xanh bị lạc): lõi + quầng mắt theo đội, ở mắt thường lẫn mắt biểu cảm (vui, tim); R2 không còn lõi / quầng mắt của R1 */
    const mR2 = ['thuong', 'vui', 'tim'].map((m) => V.robot({ than: 'hai-banh', son: 'lam' }, { than: { mat: m } }, 2, 84).lenh.map(chuoi));
    const mR1 = ['thuong', 'vui', 'tim'].map((m) => V.robot({ than: 'hai-banh', son: '' }, { than: { mat: m } }, 2, 84).lenh.map(chuoi));
    const coMat = (l, M) => l.some((s) => s.includes(M.mat)) && (l === mR2[0] || l === mR1[0] || l.some((s) => s.includes(M.matRgb)));
    kiem('mắt theo đội: R1 lõi vecMat, R2 lõi vecMatR2 (mắt thường, vui, tim); R2 không dùng lõi / quầng mắt R1, tim không còn hồng cố định',
      M1.mat === BM.vecMat && M2.mat === BM.vecMatR2 && M1.mat !== M2.mat && mR2.every((l) => coMat(l, M2)) && mR1.every((l) => coMat(l, M1)) &&
      !mR2.some((l) => l.some((s) => s.includes(M1.mat) || s.includes(M1.matRgb))) && !mR1[2].some((s) => s.includes(BM.vecHong)));
  }
  const Mn = V.mauDoi('ngoc'), Md = V.mauDoi('do'), Mt = V.mauDoi('tim');
  kiem("(V7c1) sơn mở khoá đã bỏ: 'ngoc' → R1 (vecDoiR1); đối thủ 'do' → sonDo / sonDoToi; dự phòng 'tim' → sonTim", Mn.ma === 'R1' && Mn.chinh === BM.vecDoiR1 && Md.chinh === BM.sonDo && Md.toi === BM.sonDoToi && Mt.chinh === BM.sonTim && !/ngoc|hoang-kim/.test(docGame('ve-vector.js').split('var SON_DOI')[1].split('\n')[0]));
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
  kiem('(V7c1) game LUÔN vector: bat() = true kể cả sau datCheDo(\'pixel\'); ve-vector.js không còn doCheDo / luuCheDo / KHOA_LUU / ?ve=', V.bat() === true && V.datCheDo('pixel') === true && V.bat() === true && !/doCheDo|luuCheDo|KHOA_LUU|ve=pixel/.test(docGame('ve-vector.js')));
}

/* ================================================================= 9. VeRobot theo chế độ */
console.log('\n== 9. VeRobot (ve-robot.js) theo chế độ ==');
if (!VeRobot) kiem('nạp ve-robot.js ở Node', false, 'không nạp được');
else {
  kiem('vector: tiLeChoO(S, hai-banh + kẹp) = S / 100 (84 → 0.84); REACH = 50 (nửa ô)', VeRobot.tiLeChoO(84, { than: 'hai-banh', tay: 'kep' }) === 0.84 && VeRobot.REACH === 50);
  kiem('vector (gói V3): mọi thân đều theo hệ 1/100 ô (xích 84 → 0.84, drone); V7c2: cấu hình thiếu hình (mã lạ) cũng S / 100 (hết công thức pixel)',
    VeRobot.tiLeChoO(84, { than: 'xich' }) === 0.84 && VeRobot.tiLeChoO(84, { than: 'drone', tay: 'nam-cham' }) === 0.84 && VeRobot.tiLeChoO(84, { than: 'khong-co' }) === 0.84);
  const vk = VeRobot.vatKep({ than: 'hai-banh', tay: 'kep' }, 'tren'), vv = V.vatKep({ than: 'hai-banh', tay: 'kep' }, 'tren');
  const vx = VeRobot.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'tren', 0), vxv = V.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'tren', 0);
  kiem('vector: vatKep lấy từ VeVector (' + (vk && vk.ahead.toFixed(1)) + ', ' + (vk && vk.n.toFixed(1)) + '); tay xoay: vatXoay cũng từ VeVector (f ' + (vx && vx.f.toFixed(1)) + ')',
    !!vk && !!vv && vk.ahead === vv.ahead && vk.n === vv.n && !!vx && !!vxv && vx.f === vxv.f && vx.l === vxv.l);
  const hh = VeRobot.hinhHoc({ than: 'hai-banh', tay: 'hoi' }), hv = V.hinhHoc({ than: 'hai-banh', tay: 'hoi' });
  const rK = VeRobot.reachCua({ than: 'hai-banh', tay: 'kep' }), rX = VeRobot.reachCua({ than: 'hai-banh', tay: 'xoay' }), vkN = V.vatKep({ than: 'hai-banh', tay: 'kep' }, 'tren', 1);
  kiem('vector: hinhHoc (mz / mzs / bk / pp / dinh) lấy từ VeVector; reachCua = VeVector.tamVoi: 50 khi tay không cầm vật (súng hơi), kẹp / tay xoay chừa cả vật nâng to + bóng (' + rK.toFixed(1) + ' / ' + rX.toFixed(1) + ')',
    J(hh) === J(hv) && VeRobot.reachCua({ than: 'hai-banh', tay: 'hoi' }) === 50 && rK === V.tamVoi({ than: 'hai-banh', tay: 'kep' }) && rK >= vkN.ahead + vkN.n / 2 && rX > 50 + 100 * V.tranCua({ tay: 'xoay' }) - 1e-9);
  {   /* V7c1 (28/10): bỏ sơn mở khoá: sonHieuLuc không đọc Luu / Part nữa; '' / 'vang' → vang (màu đội), 'lam' / 'do' giữ, 'goc' → null; cùng kết quả ở cả hai chế độ; không còn sonChon */
    const thu = () => ['', 'vang', 'lam', 'do', 'goc'].map((s) => VeRobot.sonHieuLuc(s));
    const px = thu(), vec = thu();
    const vr = docGame('ve-robot.js'), cd = docGame('cai-dat.js'), luu = docGame('luu.js'), chu = docGame('chu.js');
    const sach = !('sonChon' in VeRobot) && !/sonChon|docCaiDat\(\)\.son|P\.SON|DS_SON/.test(vr) && !/hangSon|DS_SON|caiDat\.son/.test(cd) && !/\bson\b/.test(luu.split('cài đặt (cai-dat.js)')[1].split('mùa đã mua')[0]) && !/'caiDat\.son/.test(chu);
    kiem('(V7c1) bỏ sơn mở khoá: sonHieuLuc → vang / vang / lam / do / null ở cả hai chế độ, không đọc Luu / Part; ve-robot.js hết sonChon, cai-dat.js hết hangSon / DS_SON, luu.js hết khoá son, chu.js hết caiDat.son*', J(px) === J(vec) && J(px) === J(['vang', 'vang', 'lam', 'do', null]) && sach, J({ px, vec, sach }));
  }
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

  /* bảng nối TILES (tên ô của bộ pixel cũ → hình vector; V7c2: Ve.tiles() đã xoá, bảng là dữ liệu của ve-vector-ky-hieu.js) */
  const veSrc = fs.readFileSync(path.join(GAME, 've.js'), 'utf8');
  const khoa = Object.keys(V.TILES);
  const thieuT = khoa.filter((k) => !V.TILES[k] || !(coHinh('o', V.TILES[k]) || coHinh('vat', V.TILES[k])));
  kiem(khoa.length + ' tên ô của bảng nối VeVector.TILES (' + khoa.join(', ') + ') đều trỏ tới hình vector đã đăng ký; ve.js không còn Ve.tiles / Painter (V7c2)', khoa.length >= 15 && thieuT.length === 0 && !/tileCache = |function Painter\(|function tiles\(/.test(veSrc), 'thiếu: ' + J(thieuT));

  /* hàm vẽ trực tiếp của san-ve.js */
  const svSrc = fs.readFileSync(path.join(GAME, 'san-ve.js'), 'utf8');
  const goi = [...new Set([...svSrc.matchAll(/Ve\.((?:make|ve)[A-Z]\w*)\(/g)].map((x) => 'Ve.' + x[1]))];
  const thieuG = goi.filter((k) => !V.VE_TRUC_TIEP[k]);
  kiem('(V7c2) san-ve.js không còn gọi hàm vẽ pixel Ve.make* / Ve.ve* nào (trước: ' + Object.keys(V.VE_TRUC_TIEP).filter((k) => k.startsWith('Ve.')).join(', ') + ' đã có hình vector trong VE_TRUC_TIEP)', goi.length === 0 && thieuG.length === 0, 'còn gọi: ' + J(goi));
  const saiTT = [];
  for (const k of Object.keys(V.VE_TRUC_TIEP)) {
    const [loai, ...ma] = V.VE_TRUC_TIEP[k];
    for (const x of ma) if (!coHinh(loai, x)) saiTT.push(k + '→' + loai + '/' + x);
    if (k.startsWith('Field.')) {
      const ten = k.slice(6), i = svSrc.indexOf('\n    ' + ten + ': function');
      if (i < 0) saiTT.push(k + ' không có trong san-ve.js');                     // V7c2: hết nhánh this.vec (game luôn vector), chỉ còn đòi hàm có thật
    }
  }
  kiem('VE_TRUC_TIEP trỏ tới hình đã đăng ký; mỗi Field.* có trong san-ve.js', saiTT.length === 0, saiTT.join(', '));
  kiem('draw() của san-ve.js vẽ mọi ô bằng veOVec (V7c2: không còn rẽ this.vec); ảnh nhỏ thuSan dùng VeVector.KY_HIEU (thuOVec, không còn vecT)',
    /this\.veOVec\(g, x, y, c\.rows\[y\]\[x\]/.test(svSrc) && /function thuOVec[\s\S]*?VeVector\.KY_HIEU/.test(svSrc) && /\n    thuOVec\(g, rows, w, h, s, mauO/.test(svSrc) && !/this\.vec\b|\bvecT\b/.test(svSrc));
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
  /* đệm từ (mùa 3, bản thử: cfg.demTu, ô '.' nên không có ký hiệu): N tô luatVatDo, S tô luatVatXanhDuong; vẽ được, nằm trong ô ở 14 / 24 / 56; san-ve.js vẽ qua veOVec và trượt dem-hut / dem-day */
  const demO = (c, n) => V.o('dem-tu', n, { cuc: c });
  kiem('ô đệm từ: có hình, N tô luatVatDo, S tô luatVatXanhDuong, vẽ được và trong ô ở 14 / 24 / 56; san-ve.js vẽ đệm (demTuT) và trượt xe khi dem-hut / dem-day',
    coHinh('o', 'dem-tu') && mauCua(demO('N', 56).lenh).includes(BM.luatVatDo) && mauCua(demO('S', 56).lenh).includes(BM.luatVatXanhDuong) &&
    ['N', 'S'].every((c) => [14, 24, 56].every((n) => coVe(demO(c, n).lenh) && ngoaiO(demO(c, n)).length === 0)) &&
    /ve\('dem-tu', \{ cuc: dt\.cuc \}\)/.test(svSrc) && /s\.ma === 'dem-hut' \|\| s\.ma === 'dem-day'/.test(svSrc));
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
console.log('\n== 12. (V3 / V7c1) Thân / tay / cảm biến: liệt kê từ dữ liệu chụp bộ pixel (du-lieu-chup-pixel.json), ghép mọi tổ hợp như Part.ghep đã chụp, 4 hướng, ổ đúng phía, màu đội, trạng thái, mọi màn ==');
{
  /* V7c1 (28/10): nguồn so sánh là DỮ LIỆU CHỤP từ part/*.js ở c0 (hoc/chup-du-lieu-pixel.mjs), không nạp bộ pixel nữa */
  const CHUP = JSON.parse(fs.readFileSync(path.join(day, 'du-lieu-chup-pixel.json'), 'utf8'));
  /* 29/10 Xe cứu hỏa R1 (gói vòi phun hình): tên hiển thị part 'hoi' đổi 'Súng hơi hai nòng' → 'Vòi phun hai đầu'; dữ liệu chụp c0 giữ tên cũ, so sánh qua bảng đổi tên này (mã, ổ, hamGoc, luật ghép y nguyên) */
  const DOI_TEN = { 'Súng hơi hai nòng': 'Vòi phun hai đầu' }, tenMoi = (x) => (x == null ? x : Object.keys(DOI_TEN).reduce((a, k) => a.split(k).join(DOI_TEN[k]), x));
  const BP = { than: CHUP.boPhan.filter((b) => b.loai === 'than'), tay: CHUP.boPhan.filter((b) => b.loai === 'tay'), 'cam-bien': CHUP.boPhan.filter((b) => b.loai === 'cam-bien') };
  /* a. danh sách bộ phận */
  const thieu = [], sai = [];
  for (const loai of ['than', 'tay', 'cam-bien']) {
    const mp = BP[loai].map((d) => d.ma), mv = V.ds(loai);
    for (const ma of mp) if (!mv.includes(ma)) thieu.push(loai + '/' + ma);
    const THEM_SAU_CHUP = { 'cam-bien': ['tu'] };                                                   // P1 mùa 3 (29/10): cảm biến từ 'tu' thành part vector riêng (bộ pixel chưa từng có)
    for (const ma of mv) if (!mp.includes(ma) && !(THEM_SAU_CHUP[loai] || []).includes(ma)) sai.push(loai + '/' + ma + ' (vector có, dữ liệu chụp không)');
    for (const d of BP[loai]) {
      const v = V.lay(loai, d.ma); if (!v) continue;
      if (loai !== 'than' && (J([].concat(v.gan)) !== J(d.gan) || v.ten !== tenMoi(d.ten))) sai.push(loai + '/' + d.ma + ': gan / ten khác chụp (' + J(v.gan) + ' / ' + v.ten + ')');
      if (loai === 'tay' && d.diemNeoDuoi && !v.diemNeoDuoi) sai.push('tay/' + d.ma + ' thiếu diemNeoDuoi');
      if (loai === 'than') for (const o of Object.keys(d.oGan)) if (!v.oGan[o]) sai.push('than/' + d.ma + ' thiếu ổ ' + o);
      if (J(v.hamGoc) !== J(d.hamGoc)) sai.push(loai + '/' + d.ma + ': hamGoc ' + J(v.hamGoc) + ' ≠ chụp ' + J(d.hamGoc));
    }
  }
  kiem('mọi bộ phận trong dữ liệu chụp ' + CHUP.commit + ' (' + BP.than.length + ' thân, ' + BP.tay.length + ' tay, ' + BP['cam-bien'].length + ' cảm biến) có hình vector cùng mã', thieu.length === 0, 'thiếu: ' + thieu.join(', '));
  kiem('cùng ổ gắn (gan, ten) và hamGoc với dữ liệu chụp; thân vector có đủ mọi ổ của thân pixel (tay, hongTrai, hongPhai, tren; drone: duoi, bung…); không bộ phận thừa', sai.length === 0, sai.join('; '));
  const tepGame = fs.readdirSync(GAME).filter((f) => /^ve-vector-.*\.js$/.test(f)), xemSrc = fs.readFileSync(path.join(day, 'hinh-mau', 'xem-vector.html'), 'utf8');
  const khongNap = tepGame.filter((f) => !TEP_VEC.includes(f) || !xemSrc.includes('../game/' + f + '"'));
  kiem('mọi tệp ve-vector-*.js (' + tepGame.length + ') nạp trong choi.html và hinh-mau/xem-vector.html', khongNap.length === 0, J(khongNap));

  /* b. mọi tổ hợp: thân × (không tay + tay) × bộ cảm biến (không, từng cảm biến ở từng ổ, vài cặp) — Part.ghep (đã chụp) ném ⇔ VeVector.kiemGhep ném, cùng câu báo */
  const hopLe = [], lechLuat = []; let soCam = 0;
  for (const g of CHUP.ghep) {
    const cfg = g.cfg, ep = tenMoi(g.loi);
    let ev = null;
    try { V.kiemGhep(cfg); } catch (e) { ev = e.message; }
    if (ep !== ev) lechLuat.push(J(cfg) + ' pixel (chụp): ' + ep + ' | vector: ' + ev);
    else if (ep) soCam++; else hopLe.push(cfg);
  }
  kiem((hopLe.length + soCam) + ' tổ hợp (' + hopLe.length + ' ghép được, ' + soCam + ' cấm): VeVector.kiemGhep ném ĐÚNG khi Part.ghep (dữ liệu chụp ' + CHUP.commit + ') ném, cùng câu báo (drone + camera, drone + tay khác nam châm, camera-bay trên xe, camera + cảm biến màu, sai ổ…)',
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
  for (const than of ['hai-banh', 'xich', 'nhen', 'omni']) for (const goc of [-90, -45, 0, 45, 90]) for (const tuThe of ['tren', 'duoi']) for (const h of [0, 1, 2, 3]) for (const cam of [true, false]) {
    V.xoaDem(); const cv = V.robot({ than, tay: 'xoay' }, { tay: { kep: cam ? 'dong' : 'mo', cam, goc, tuThe } }, h, 84);
    if ((goc === 0 || (Math.abs(goc) === 90 && !cam)) && trongVung(cv, 84).length) xoaySai.push(than + ' ' + goc + '° ' + tuThe + (cam ? ' cầm vật ' : ' mở ') + TEN_HUONG[h] + ': ngoài ô');
    if (ngoaiO(cv).length) xoaySai.push(than + ' ' + goc + '° ' + TEN_HUONG[h] + ': ngoài canvas');
  }
  const vT = V.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'tren', -90), vP = V.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'tren', 90), v0 = V.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'tren', 0), vk0 = V.vatKep({ than: 'hai-banh', tay: 'xoay' }, 'tren');
  kiem('tay xoay: nấc trước trong ô, nấc trái / phải trong ô khi không cầm vật (V6b: cầm vật to thì ngón ôm vật chờm sang ô chéo, trong lề tràn), đang xoay ±45° trong canvas lề tràn (' + V.tranCua({ tay: 'xoay' }) + ' ô); vật nấc trái l < 0, nấc phải l > 0, ra ngoài thân (|l| ≥ 30); nấc trước trùng vatKep (f ' + v0.f.toFixed(1) + ')',
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
  for (const than of ['hai-banh', 'xich', 'nhen', 'omni']) for (const tay of ['kep', 'xoay']) for (const tt of ['tren', 'duoi']) { const k = V.vatKep({ than, tay }, tt); if (!k || !(k.ahead > 20 && k.ahead - k.n / 2 > 0 && k.ahead + k.n / 2 <= V.tamVoi({ than, tay }))) vkSai.push(than + '/' + tay + '/' + tt); }
  kiem('vật trong kẹp (kẹp, tay xoay) ở phía trước, không lùi quá tâm thân, trong tầm lớp phủ (tamVoi), trên mọi thân có hướng', vkSai.length === 0, vkSai.join(', '));
  const hh = V.ds('than').map((t) => [t, V.hinhHoc({ than: t, tay: t === 'drone' ? 'nam-cham' : 'hoi' })]), hhSai = hh.filter(([t, x]) => !(x.mz > 30 && x.mz < 50 && x.mzs > 20 && x.mzs < 50 && x.dinh > 20 && x.dinh < 50));
  const bk = V.hinhHoc({ than: 'hai-banh', tay: 'nem' }).bk;
  kiem('hinhHoc: miệng nòng trước / sau, rổ máy ném (' + bk.toFixed(1) + '), đỉnh drone trong (20, 50) phần trăm ô', hhSai.length === 0 && bk > 25 && bk * 27.5 / 23.5 < 46, J(hhSai));

  /* e. màu đội: mọi tổ hợp R1 ↔ R2 chỉ khác màu đội, đúng ba chỗ (kính 1 gradient, mắt 2 viền, chấm ăng-ten 1 tô) */
  const M1 = V.mauDoi('vang'), M2 = V.mauDoi('lam'), doiSai = [];
  const doiMau = (x) => x.split(M2.chinh).join(M1.chinh).split(M2.toi).join(M1.toi).split(M2.mat).join(M1.mat).split(M2.matRgb).join(M1.matRgb);      // 29/10: lõi / quầng mắt cũng theo đội
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
    try { cam = VeRobot.ve({ than: 'drone', tay: null, camBien: [{ ma: 'camera', o: 'tren' }] }, {}, 0, 0.56); } catch (e) { cam = null; } console.warn = cw;
  } catch (e) { /* lỗi giả: cấu hình rơi về hình tạm */ }
  const tam = VeRobot.ve({ than: 'hai-banh', tay: null, camBien: [] }, {}, 0, 0.56);
  kiem('VeRobot: nhện không tay và drone không quay theo hướng; cấu hình cấm báo một lần rồi rơi về hình TẠM = xe hai bánh vector không tay (V7c2: hết hình tạm pixel)', nhenKhongTay && droneMoi && bao === 1 && !!cam && cam.laVector === true && cam === tam);
}


/* ======================================================================================================================================
   13. (gói V4) HOẠT CẢNH / HIỆU ỨNG TRÊN SÂN — chạy san-ve.js THẬT ở Node trong ngữ cảnh vm (DOM / canvas giả ghi từng lệnh, đồng hồ ảo, Math.random có hạt cố định),
       phát lại vết của SanHoc / ChamHoc như man-choi.js (mỗi 16 ms vẽ một khung, ghi lệnh của canvas sân + lớp phủ robot):
       a. chế độ PIXEL: bản nền NEN_V4 (git show) và bản mới ra ĐÚNG TỪNG LỆNH ở mọi khung (lời giải + lời sai của nhiều màn, cả màn nhiều robot);
       b. chế độ VECTOR: cùng các màn đó, không còn fillRect / strokeRect nào (mọi hiệu ứng vẽ bằng đường vector: tròn, bo góc, nét);
       c. tia cảm biến bắt đầu ĐÚNG Ổ (khoảng cách / hồng ngoại: VeVector.diemCamBien; camera: ống kính ở đuôi VeVector.diemOngKinh), không ở tâm xe;
       d. mắt biểu cảm: mỗi biểu cảm ra hình khác nhau trên 5 thân; sự kiện vết đâm / '?' / tới cờ / xong màn / va bạn / chờ kích hoạt đúng biểu cảm; chớp theo thời gian
          (2,5–5 s, ~150 ms, hai xe lệch nhau); camera không còn đổi mắt (khối ống kính ở đuôi, đúng phía sau xoay);
       e. cảm biến DÍNH VỎ: mọi thân × cảm biến × ổ hợp lệ, hộp bao hình cảm biến chạm hộp vỏ thân (≤ 2 đơn vị /100);
       f. VeRobot.veCo (robot ngoài sân theo cỡ hiển thị): pixel = ve(…, pxCss / 24) cùng canvas; vector = đúng một ô pxCss × devicePixelRatio, heSoCss = 1 / dpr;
       g. cờ bay (pha khác → hình khác), sàn bàn cờ hai tông, trang xem có mục V4.
   ====================================================================================================================================== */
{
  console.log('\n== 13. (V4 / V7c1) Hoạt cảnh / hiệu ứng trên sân: vector y nguyên so với nền 3fe6fa8, vector không fillRect, tia từ ổ, mắt biểu cảm, cảm biến dính vỏ, veCo ==');
  const vm = await import('node:vm');
  const { execFileSync } = await import('node:child_process');
  const GOC = path.resolve(day, '..');
  const docMoi = (f) => { let t = fs.readFileSync(path.join(GAME, f), 'utf8'); if (LOI_GIA && f === 'san-ve.js') t = t.replace(/\n\s*if \(!coMatDong\(\)\) \{ ttR\.mat = [^\n]*\n/, '\n'); return t; };   // lỗi giả V7b: bieuCam bỏ qua Cài đặt mắt (13d phải đỏ)
  const CHI_TIET_13A = process.argv.includes('--chi-tiet-13a');
  const NEN_VEC = '9a6d47c';                                                           // 29/10 van hơi (nút bắn N là VAN HƠI): nền VECTOR = 9a6d47c (ô 'nut-ban' vẽ thành van tay quay ba nan có cánh hứng nước, quay nửa vòng khi đổi, mở thì cam nóng + làn hơi trắng (HU.hoiVan); dây nối van N ↔ cửa thành ống hơi có khớp nối (HU.ongHoi; nút đè M giữ dây); huy hiệu do-nhiet / che-do-nhiet vẽ van đang mở; phim: van mở có hơi; so 013ec5d chỉ lệch đúng chỗ có van N / ống hơi: 13a-v sung-hoi.3 (giải + sai), luc-ban.8 (giải + sai); A3-v do-nhiet ×3 trạng thái, che-do-nhiet khoa / mo; B5-v nha-may.1–3, luc-ban.1–2; chứng minh: hoàn bang-mau.js, ve-vector-may.js, ve-vector-hieu-ung.js, san-ve.js, ve-vector-icon.js, huy-hieu-vector.js, phim-vector.js về ba147ca (giữ mọi đổi chữ) thì 13a-v / A3-v / B5-v xanh). Trước đó: 29/10 vòi phun hình (Xe cứu hỏa R1): nền VECTOR = 013ec5d (part 'hoi' vẽ thành vòi phun hai đầu, vật 'bong' thành khối nước tóe giọt, tia nước / vũng trên sân, thẻ đạn giọt nước, icon denSung vòi phun, huy hiệu có tia nước, phim mùa 2 dùng PhimVector.voiPhun + tia .pg-nuoc; so aaeee1f chỉ lệch đúng chỗ có súng / bóng: 13a-v sung-hoi.3 (giải + sai), luc-ban.8; A3-v 8 huy hiệu vẽ 'hoi' / 'bong' (sung-hoi, luc-ban, che-sung-hoi, che-luc-ban, be-sung, che-be-sung, tong-hop-2, nha-may-chay) × 3 trạng thái; B5-v 33 khung phim mùa 2 có robot gắn 'hoi' / bắn nước (mọi khung từ sung-hoi.1 tới nha-may-chay.4; xich.1–4 và phim mùa 1 y nguyên)). Trước đó: 29/10 gộp nhánh điều phối vào main: nền VECTOR = aaeee1f (hợp một tay kẹp V8c + phim xuất xưởng / xich.1 của main; so fbc976e chỉ lệch robot.2, xich.1; so 32513bf chỉ lệch tay kẹp). Trước đó: 29/10 V8c một tay kẹp: nền VECTOR = fbc976e (tay kẹp vẽ y hệt tay xoay ở nấc trước: cụm giữa tâm (50, 84), khớp tròn vành bạc + đèn, hàm khop dùng chung; chứng minh: hoàn ve-vector-tay-kep.js + ve-vector-tay-xoay.js về ad0899a thì 13a-v / A3-v / B5-v / C3-v xanh). Trước đó: 29/10 V8b tay xoay cùng hình tay kẹp: nền VECTOR = fa7637a (tay xoay vẽ bằng càng / cụm / đèn của tay kẹp, thêm khớp tròn vành bạc; chứng minh: hoàn ve-vector-tay-kep.js + ve-vector-tay-xoay.js về e4b3e11 thì 13a-v / A3-v / B5-v / C3-v xanh). Trước đó: 29/10 mắt theo đội: nền VECTOR = 6a4276d (lõi / quầng mắt R2 hồng, mắt trái tim cùng màu mắt đội; chứng minh: hoàn bang-mau.js + ve-vector.js về b38c6be thì 13a-v / A3-v / B5-v / C3-v xanh). Trước đó: 29/10 gộp V8a: nền VECTOR = 3fe6fa8 (thân omni / nhện vuông bo, chân nhện ba khúc, dáng bò; trước đó 8d930ae: mắt vui cung tròn mảnh, mắt tim viền trắng thắng màn; trước đó f8331e9, trước đó eb553bd, huy hiệu mắt thường, phim mở đầu hình bộ phận thật; trước đó 6e04104 = V7c3 e3 (đo chữ bằng phông vector, bỏ fillStyle thừa; trước đó 8780764 gộp V7c2, c830c12 gộp V7b); 13a-v phát lại vector so với nền này
  const _nen = {};
  let coGit = true;
  const docTai = (sha) => (f) => { const k = sha + ':' + f; if (_nen[k] === undefined) { try { _nen[k] = execFileSync('git', ['-C', GOC, 'show', sha + ':hoc/game/' + f], { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { _nen[k] = null; coGit = false; } } return _nen[k]; };
  const docNenVec = docTai(NEN_VEC);

  /** Ngữ cảnh trình duyệt giả chạy bang-mau / ve / part / ve-vector* / ve-robot / san-ve theo đúng thứ tự choi.html. */
  function taoKhung(docTep, cheDo, dpr) {
    let dongHo = 1000, hangCho = [], soHen = 0, hat = 12345;
    const sigCache = new WeakMap();
    const bam = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
    const nhan = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
    const THUOC_G = ['fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'globalAlpha', 'imageSmoothingEnabled', 'imageSmoothingQuality', 'font', 'textAlign', 'textBaseline', 'miterLimit', 'lineDashOffset', 'globalCompositeOperation'];
    const so = (v) => (typeof v === 'number' ? +v.toFixed(3) : v);
    const chu = (v) => (v && v.__cv ? 'cv' + sig(v) : v && v.__gr ? 'gr' + v.kieu + '(' + v.ts.map(so).join(',') + ')[' + v.stops.map((s) => s.join(':')).join(';') + ']'
      : v && v.data && v.width ? 'img' + v.width + 'x' + v.height + ':' + bam(Array.from(v.data).join(',')) : Array.isArray(v) ? '[' + v.map(chu).join(',') + ']' : String(so(v)));
    function sig(cv) {
      const c = sigCache.get(cv);
      if (c && c.n === cv.__ctx.lenh.length && c.w === cv.width && c.h === cv.height) return c.s;
      const s = cv.width + 'x' + cv.height + ':' + bam(cv.__ctx.lenh.join('\n'));
      sigCache.set(cv, { n: cv.__ctx.lenh.length, w: cv.width, h: cv.height, s }); return s;
    }
    class Gr { constructor(kieu, ts) { this.__gr = true; this.kieu = kieu; this.ts = ts; this.stops = []; } addColorStop(o, c) { this.stops.push([o, c]); } }
    class Ctx {
      constructor(cv) { this.canvas = cv; this.lenh = []; this.t = {}; this.m = [1, 0, 0, 1, 0, 0]; this.ngan = []; }
      datLai() { this.t = {}; this.m = [1, 0, 0, 1, 0, 0]; this.ngan = []; this.lenh.push('resize'); }
      ghi(ten, a) { this.lenh.push(ten + '(' + Array.from(a).map(chu).join(',') + ')'); }
      save() { this.ghi('save', []); this.ngan.push({ m: this.m.slice(), t: Object.assign({}, this.t) }); }
      restore() { this.ghi('restore', []); const s = this.ngan.pop(); if (s) { this.m = s.m; this.t = s.t; } }
      setTransform(a, b, c, d, e, f) { this.ghi('setTransform', arguments); this.m = [a, b, c, d, e, f]; }
      translate(x, y) { this.ghi('translate', arguments); this.m = nhan(this.m, [1, 0, 0, 1, x, y]); }
      scale(x, y) { this.ghi('scale', arguments); this.m = nhan(this.m, [x, 0, 0, y, 0, 0]); }
      rotate(a) { this.ghi('rotate', arguments); const c = Math.cos(a), s = Math.sin(a); this.m = nhan(this.m, [c, s, -s, c, 0, 0]); }
      getTransform() { const m = this.m; return { a: m[0], b: m[1], c: m[2], d: m[3], e: m[4], f: m[5] }; }
      createLinearGradient() { return new Gr('l', Array.from(arguments)); }
      createRadialGradient() { return new Gr('r', Array.from(arguments)); }
      measureText(s) { const m = /(\d+)px/.exec(this.t.font || '10px'); return { width: String(s).length * (m ? +m[1] : 10) * 0.5 }; }
      getImageData(x, y, w, h) { this.ghi('getImageData', arguments); return { width: w, height: h, data: new Uint8ClampedArray(Math.max(0, w * h * 4)) }; }
      createImageData(w, h) { if (typeof w === 'object') { h = w.height; w = w.width; } return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; }
      putImageData(id, x, y) { this.ghi('putImageData', [id, x, y]); }
      setLineDash(a) { this.ghi('setLineDash', [a]); }
    }
    for (const k of THUOC_G) Object.defineProperty(Ctx.prototype, k, { get() { return this.t[k]; }, set(v) { this.t[k] = v; this.ghi('=' + k, [v]); } });
    for (const k of ['beginPath', 'closePath', 'moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo', 'arc', 'arcTo', 'ellipse', 'rect', 'fill', 'stroke', 'fillRect', 'strokeRect', 'clearRect', 'drawImage', 'clip', 'fillText', 'strokeText']) Ctx.prototype[k] = function () { this.ghi(k, arguments); };
    class Cv {
      constructor() { this.__cv = true; this._w = 300; this._h = 150; this.style = {}; this.classList = { add() {}, remove() {}, toggle() {} }; this.__ctx = new Ctx(this); }
      get width() { return this._w; } set width(v) { this._w = Math.max(0, Math.floor(v)); this.__ctx.datLai(); }
      get height() { return this._h; } set height(v) { this._h = Math.max(0, Math.floor(v)); this.__ctx.datLai(); }
      getContext() { return this.__ctx; }
      get offsetWidth() { return parseFloat(this.style.width) || 0; } get offsetHeight() { return parseFloat(this.style.height) || 0; }
      get offsetLeft() { return 7; } get offsetTop() { return 7; }
      getBoundingClientRect() { return { left: 7, top: 7, width: this.offsetWidth, height: this.offsetHeight }; }
      closest() { return null; } setAttribute() {} appendChild() {} insertBefore() {}
    }
    const cha = { style: { setProperty() {} }, firstChild: null, clientWidth: 232, clientHeight: 232, insertBefore() {}, appendChild() {}, querySelector() { return null; } };
    const ctx = {
      console: { log() {}, warn() {}, error() {}, info() {} }, document: { createElement() { return new Cv(); }, querySelector() { return null; }, body: {} }, devicePixelRatio: dpr,
      location: { search: cheDo === 'vector' ? '?ve=vector' : '?ve=pixel' }, localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
      performance: { now: () => dongHo }, setTimeout: (f, ms) => { hangCho.push({ t: dongHo + Math.max(0, ms || 0), f, id: ++soHen }); return soHen; }, clearTimeout() {}, requestAnimationFrame: () => 0,
      Math: Object.create(Math), JSON, Object, Array, String, Number, Boolean, Date, Error, RegExp, Map, Set, WeakMap, Symbol, Promise, parseFloat, parseInt, isFinite, isNaN, Uint8ClampedArray
    };
    ctx.Math.random = () => { hat = (Math.imul(hat, 1103515245) + 12345) >>> 0; return (hat >>> 8) / 16777216; };
    ctx.window = ctx; ctx.globalThis = ctx;
    vm.createContext(ctx);
    const ds = [...docTep('choi.html').matchAll(/<script src="([\w./-]+\.js)"/g)].map((m) => m[1]).filter((f) => /^(bang-mau|chu|ve|ve-vector[\w-]*|ve-robot|san-ve|part\/[\w-]+)\.js$/.test(f));
    for (const f of ds) vm.runInContext(docTep(f), ctx, { filename: f });
    if (cheDo === 'vector' && ctx.VeVector.datCheDo) ctx.VeVector.datCheDo('vector');
    async function chayToi(p, field, ghi) {
      let xong = false; p.then(() => { xong = true; });
      let vong = 0, khungSau = dongHo;
      while (!xong && vong++ < 200000) {
        await new Promise((r) => setImmediate(r));
        if (xong) break;
        hangCho.sort((a, b) => a.t - b.t || a.id - b.id);
        const q = hangCho.shift(), den = q ? q.t : dongHo + 16;
        while (khungSau + 16 <= den) { khungSau += 16; dongHo = khungSau; field.draw(dongHo); if (ghi) ghi(); }
        dongHo = Math.max(dongHo, den);
        if (q) q.f();
      }
    }
    return { ctx, Cv, cha, chayToi, gio: () => dongHo, datGio: (t) => { dongHo = t; }, datHat: (h) => { hat = h; } };
  }

  /* --- dữ liệu màn: vết của ChamHoc (lời giải và lời sai đầu tiên), cấu hình sân như man-choi.js cauHinhSan */
  const ManHoc = require(path.join(day, 'man-chuoi-1.js')), ChamHoc = require(path.join(day, 'cham.js'));
  const SanHocV4 = require(path.join(day, 'san-hoc.js'));
  const manCuaXe = (m, i) => { const o = Object.assign({}, m, m.doi[i]); delete o.doi; return o; };
  function cfgSan(K, m) {
    const lm = SanHocV4.lopMauCuaSan(m, 0), nhieu = Array.isArray(m.san[0]), VR = K.ctx.VeRobot;
    return { san: nhieu ? m.san[0] : m.san, batDau: m.doi ? (Array.isArray(m.doi[0].batDau) && nhieu ? m.doi[0].batDau[0] : m.doi[0].batDau) : Array.isArray(m.batDau) ? m.batDau[0] : m.batDau,
      loaiRobot: m.loaiRobot || 'banh', robot: VR.cauHinhCua(m), mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vat: lm.vatThem || undefined,
      roBanDau: Array.isArray(m.roBanDau) ? m.roBanDau[0] : m.roBanDau, cuaNhip: lm.cuaNhip || undefined, nutBat: lm.nutBat || undefined, danToiDa: m.danToiDa,
      pin: Array.isArray(m.pin) ? m.pin[0] : m.pin, bongMo: Array.isArray(m.bongMo) ? m.bongMo[0] : m.bongMo, hinh: lm.hinh || undefined, sonBanDau: lm.sonBanDau || undefined, mucBanDau: m.mucBanDau,
      doiKhang: !!m.doiKhang,
      doi: m.doi ? m.doi.map((r, k) => { const mk = manCuaXe(m, k); return { robot: VR.cauHinhCua(mk), batDau: Array.isArray(mk.batDau) && nhieu ? mk.batDau[0] : mk.batDau, loaiRobot: mk.loaiRobot || 'banh', pin: Array.isArray(mk.pin) ? mk.pin[0] : mk.pin, danToiDa: mk.danToiDa, roBanDau: Array.isArray(mk.roBanDau) ? mk.roBanDau[0] : mk.roBanDau, co: SanHocV4.coCuaSan(mk.co, 0, nhieu) }; }) : undefined };
  }
  function gopVet(doi) {
    const it = doi.map(() => 0), kq = [];
    for (;;) {
      doi.forEach((d, i) => { const v = d.vet; while (it[i] < v.length && v[it[i]].loai !== 'nhip') { v[it[i]].xe = i; kq.push(v[it[i]]); it[i]++; } });
      const ds = doi.map((d, i) => (it[i] < d.vet.length ? d.vet[it[i]++] : null));
      if (ds.every((x) => !x)) break;
      kq.push({ loai: 'nhip', nhip: ds.filter((x) => x)[0].nhip, doi: ds });
    }
    return kq;
  }
  function vetCua(m, sai) {
    const lg = (sai !== undefined ? m.loiSai && m.loiSai[sai] : m.loiGiai) || {};
    let r; try { r = ChamHoc.cham(m, lg.baiLam || lg, ManHoc.khoThamChieu ? ManHoc.khoThamChieu(m).concat(lg.hamCuaEmMoi || []) : lg.hamCuaEmMoi || []); } catch (e) { return null; }
    const ts = r.theoSan && r.theoSan[0];
    const vet = ts && ts.doi ? gopVet(ts.doi) : (ts && ts.vet) || r.vet || [];
    return { vet, thang: r.thang };
  }
  async function phat(K, m, v, ghiKhung) {
    const cv = new K.Cv(); cv.parentNode = K.cha;
    const F = new K.ctx.SanVe.Field(cv, {});
    F.nap(cfgSan(K, m));
    const ghi = ghiKhung ? () => { ghiKhung(cv.__ctx.lenh, F.lop ? F.lop.__ctx.lenh : []); cv.__ctx.lenh.length = 0; if (F.lop) F.lop.__ctx.lenh.length = 0; } : null;
    for (const e of v.vet) {
      if (e.loai === 'lenh') {
        if (e.xe !== undefined && F.xe) F.chonXe(e.xe);
        if (e.docCamBien) F.docCamBien(e.docCamBien, 380); if (e.aimTam) F.datTam(e.aimTam); if (e.inkMau) F.datMauSon(e.inkMau);
        if (F.xe) F.chonXe(0);
        await K.chayToi(new Promise((r) => K.ctx.setTimeout(r, 90)), F, ghi);
      } else if (e.doi) {
        for (let k = 0; k < e.doi.length; k++) { if (!e.doi[k]) continue; F.chonXe(k); await K.chayToi(F.phatNhip(e.doi[k], 140), F, ghi); }
        F.chonXe(0);
      } else await K.chayToi(F.phatNhip(e, 230), F, ghi);
    }
    if (v.thang) F.mungThang(); else { F.chopDo(200); F.quayVe(); }
    await K.chayToi(new Promise((r) => K.ctx.setTimeout(r, 1000)), F, ghi);
    return F;
  }
  const MAN_V4 = ['hai-banh.3', 'tay-gap.4', 'khoang-cach.4', 'che-cam-bien.4', 'nhen.5', 'xich.4', 'omni.3', 'sung-hoi.3', 'luc-ban.8', 'mau.8', 'may-son.3', 'nam-cham.6', 'che-nam-cham.2', 'tay-xoay.3', 'may-nem.2', 'may-nem.7', 'drone.3', 'drone.5', 'flycam.2', 'ban-xoay.1', 'hai-robot.2', 'hai-robot.6'];
  const CA = []; for (const ma of MAN_V4) { const m = ManHoc.danhSach.find((x) => x.ma === ma); if (!m) continue; for (const sai of [undefined, 0]) { const v = vetCua(m, sai); if (v && v.vet.length) CA.push({ m, v, ten: ma + (sai === undefined ? '' : ':sai') }); } }

  /* a-v (V7c1). VECTOR y nguyên so với nền NEN_VEC: cùng harness, cùng CA, cùng hạt; canvas sân + lớp phủ robot ra đúng từng lệnh. Đây là phanh thay cho 13a khi mã pixel bị gỡ. */
  if (!coGit || docNenVec('san-ve.js') === null) kiem('(13a-v) cần git và commit nền vector ' + NEN_VEC, false, 'git show lỗi');
  else {
    const KA = taoKhung(docNenVec, 'vector', 2), KB = taoKhung(docMoi, 'vector', 2);
    if (LOI_GIA) { const hu = KB.ctx.VeVector.HU, cu = hu.hat; hu.hat = function (g) { g.save(); g.restore(); return cu.apply(this, arguments); }; console.log('(và lỗi giả V7c1: HU.hat vector thêm save / restore, mục 13a-v phải đỏ)'); }
    const khac = []; let soKhung = 0;
    for (const c of CA) {
      const A = [], B = [];
      KA.datHat(777); KB.datHat(777); KA.datGio(1000); KB.datGio(1000);
      await phat(KA, c.m, c.v, (a, b) => A.push(a.join('\n') + '\n||\n' + b.join('\n')));
      await phat(KB, c.m, c.v, (a, b) => B.push(a.join('\n') + '\n||\n' + b.join('\n')));
      soKhung += A.length;
      let i = 0; while (i < Math.max(A.length, B.length) && A[i] === B[i]) i++;
      if (i < Math.max(A.length, B.length)) { const a = (A[i] || '').split('\n'), b = (B[i] || '').split('\n'); let j = 0; while (a[j] === b[j]) j++; khac.push(c.ten + ' khung ' + i + ': nền ' + a[j] + ' / mới ' + b[j]); }
      if (CHI_TIET_13A) {                                                                   // V7c3: `--chi-tiet-13a` in MỌI khung khác + lệnh bớt / thêm (đếm theo dòng lệnh) để soát đổi lệnh có chủ ý
        let soKhac = 0; const gom = {};
        for (let k = 0; k < Math.max(A.length, B.length); k++) {
          if (A[k] === B[k]) continue; soKhac++;
          const dem = new Map(); for (const l of (A[k] || '').split('\n')) dem.set(l, (dem.get(l) || 0) + 1); for (const l of (B[k] || '').split('\n')) dem.set(l, (dem.get(l) || 0) - 1);
          for (const [l, n] of dem) if (n) { const kh = (n > 0 ? '− ' : '+ ') + l; (gom[kh] = gom[kh] || []).push(k); }
        }
        if (soKhac) console.log('    [chi tiết 13a-v] ' + c.ten + ': ' + soKhac + ' / ' + Math.max(A.length, B.length) + ' khung khác\n' + Object.keys(gom).map((kh) => '      ' + kh + '   (' + gom[kh].length + ' khung, đầu ' + gom[kh].slice(0, 4).join(',') + ')').join('\n'));
      }
    }
    kiem('(13a-v) CHẾ ĐỘ VECTOR y nguyên: ' + CA.length + ' lần phát lại (lời giải + lời sai, ' + MAN_V4.length + ' màn kể cả màn nhiều robot), ' + soKhung + ' khung — canvas sân + lớp phủ robot của bản mới ra đúng từng lệnh như nền vector ' + NEN_VEC, khac.length === 0 && soKhung > 2000, khac.slice(0, 3).join('\n      '));
  }

  /* b. vector: không fillRect / strokeRect; c. tia từ ổ */
  const KV = taoKhung(docMoi, 'vector', 2);
  if (LOI_GIA) {
    const hu = KV.ctx.VeVector.HU, cu = hu.hat; hu.hat = function (g, ds) { if (ds.length) g.fillRect(ds[0].x, ds[0].y, 1, 1); return cu.apply(this, arguments); };
    KV.ctx.SanVe.Field.prototype.oTia = function (d) { return [{ x: d.tu.x * 14 + 7, y: d.tu.y * 14 + 7 }]; };
    console.log('(và năm lỗi giả V4: nhánh pixel veDau tô thêm, hạt vector dùng fillRect, tia từ tâm xe, veCo vector bỏ devicePixelRatio, ổ hông hai-banh dời ra 10 đơn vị; matSuKien bỏ qua)');
    console.log('(và lỗi giả V7b: bieuCam bỏ qua Cài đặt "Biểu cảm mắt", mục 13d phải đỏ)');
    KV.ctx.SanVe.Field.prototype.matSuKien = function () {};
    const vr = KV.ctx.VeRobot, cu2 = vr.veCo; vr.veCo = function (a, b, c, d) { return vr.ve(a, b, c, d / 100); };
    V.lay('than', 'hai-banh').oGan.hongTrai.x += 10;
  }
  {
    const coRect = [], demHU = { tia: 0 };
    for (const c of CA) {
      KV.datHat(777); KV.datGio(1000);
      await phat(KV, c.m, c.v, (a, b) => { for (const l of a.concat(b)) if (/^(fillRect|strokeRect)\(/.test(l)) coRect.push(c.ten + ': ' + l); });
    }
    kiem('(13b) CHẾ ĐỘ VECTOR: cùng ' + CA.length + ' lần phát lại — canvas sân và lớp phủ robot KHÔNG có fillRect / strokeRect nào (hạt, chớp, dấu, tia, bóng, vạch ngắm, pin, sơn, ô cảnh báo… đều là đường vector)', coRect.length === 0, coRect.slice(0, 4).join('\n      '));
    /* tia đúng ổ: dựng sân nhỏ, đọc cảm biến theo 4 hướng, so gốc tia với ổ (VeVector của ngữ cảnh) */
    const VV = KV.ctx.VeVector, sai = [];
    const thu = (robot, cam, chon) => {
      for (const h of [0, 1, 2, 3]) {
        const cv = new KV.Cv(); cv.parentNode = KV.cha; const F = new KV.ctx.SanVe.Field(cv, {});
        F.nap({ san: ['.....', '.....', '.....', '.....', '.....'], batDau: { x: 2, y: 2, huong: h }, loaiRobot: 'banh', robot });
        const d = { cam, tu: { x: 2, y: 2 }, huong: h, o: { x: 2 + [0, 1, 0, -1][h], y: 2 + [-1, 0, 1, 0][h] }, trong: true }, goc = F.oTia(d), mong = chon(h);
        if (!goc.length || !mong) { sai.push(cam + ' h' + h + ': không có gốc'); continue; }
        const tam = { x: 2 * 14 + 7, y: 2 * 14 + 7 }, xa = Math.min(...goc.map((p) => Math.hypot(p.x - mong.x, p.y - mong.y))), tuTam = Math.min(...goc.map((p) => Math.hypot(p.x - tam.x, p.y - tam.y)));
        if (xa > 1.6 || tuTam < 1.5) sai.push(cam + ' hướng ' + h + ': gốc ' + J(goc.map((p) => [+p.x.toFixed(1), +p.y.toFixed(1)])) + ' ổ ' + J([+mong.x.toFixed(1), +mong.y.toFixed(1)]));
      }
    };
    const R1 = { than: 'hai-banh', tay: null, camBien: [{ ma: 'khoang-cach', o: 'hong' }] }, R2 = { than: 'xich', tay: null, camBien: [{ ma: 'hong-ngoai', o: 'tren' }] }, R3 = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'camera', o: 'tren' }] };
    const quyDoi = (p, h) => (p ? { x: 2 * 14 + p.x, y: 2 * 14 + p.y } : null);
    thu(R1, null, (h) => quyDoi(VV.diemCamBien(R1, 'khoang-cach', h, 14)[0], h));
    thu(R2, 'hong-ngoai', (h) => quyDoi(VV.diemCamBien(R2, 'hong-ngoai', h, 14)[0], h));
    thu(R3, 'camera', (h) => quyDoi(VV.diemOngKinh(R3, h, 14), h));
    kiem('(13c) tia cảm biến bắt đầu ĐÚNG Ổ ở 4 hướng (khoảng cách: tai ở hông; hồng ngoại: ổ tren ở góc mũi; camera: ống kính ở đuôi), không ở tâm xe', sai.length === 0, sai.slice(0, 4).join('\n      '));
  }

  /* d. mắt biểu cảm */
  {
    const VV = KV.ctx.VeVector, KIEU = ['thuong', 'chop1', 'chop2', 'dam', 'xoay', 'vui', 'tim', 'ngac', 'buon', 'lim', 'cho', 'thuong:1', 'thuong:-1'], trung = [];
    for (const than of VV.ds('than')) {
      const thay = new Map();
      for (const k of KIEU) { VV.xoaDem(); const s = VV.robot({ than }, { than: { mat: k, quat: true } }, 2, 84).getContext().lenh.join('\n'); if (thay.has(s)) trung.push(than + ': ' + thay.get(s) + ' = ' + k); thay.set(s, k); }
    }
    kiem('(13d) mắt biểu cảm: ' + KIEU.length + ' kiểu (thường, chớp nửa / khép, đâm X, va nhau > <, vui ◠ ◠, tim (thắng màn), ngạc nhiên, buồn, lim dim, chờ, liếc trái / phải) ra hình KHÁC NHAU trên cả 5 thân', trung.length === 0, trung.slice(0, 4).join('; '));
    /* sự kiện → biểu cảm: phát một nhịp có sự kiện rồi hỏi bieuCam ngay sau */
    const cv = new KV.Cv(); cv.parentNode = KV.cha; const F = new KV.ctx.SanVe.Field(cv, {});
    F.nap({ san: ['....F', '..#..', '.....'], batDau: { x: 1, y: 0, huong: 2 }, loaiRobot: 'banh', robot: { than: 'hai-banh', tay: null, camBien: [] } });
    const mat = () => { const tt = {}; F.bieuCam(F.vis, tt, KV.gio(), 0); return tt.mat.split(':')[0]; }, kq = {};
    await KV.chayToi(F.phatNhip({ robot: { x: 1, y: 0, huong: 2, banh: { trai: 1, phai: 1 } }, suKien: [{ ma: 'dam-tuong', tu: { x: 1, y: 0 }, den: { x: 1, y: 1 }, vat: 'tuong' }] }, 300), F); kq.dam = mat();
    KV.datGio(KV.gio() + 2000); F.baoHieu('?', 900); kq.ngac = mat();
    KV.datGio(KV.gio() + 2000); await KV.chayToi(F.phatNhip({ robot: { x: 4, y: 0, huong: 1, banh: { trai: 1, phai: 1 } }, suKien: [{ ma: 'tien', den: { x: 4, y: 0 } }, { ma: 'toi-co' }] }, 300), F); kq.vui = mat();
    KV.datGio(KV.gio() + 3000); F.mungThang(); KV.datGio(KV.gio() + 700); kq.mung = mat();
    kiem('(13d) sự kiện vết kích hoạt đúng biểu cảm: đâm tường → ' + kq.dam + ', dấu ? → ' + kq.ngac + ', tới cờ → ' + kq.vui + ', xong màn (giữ tới khi hộp kết quả hiện, 700 ms) → ' + kq.mung,
      kq.dam === 'dam' && kq.ngac === 'ngac' && kq.vui === 'vui' && kq.mung === 'tim', J(kq));      // 29/10 user: việc nhỏ (tới cờ) = vui, thắng màn = tim
    {   /* V7b (28/10): Cài đặt "Biểu cảm mắt" TẮT (Luu.docCaiDat().mat === false) → ở vector cũng có tác dụng: mắt thường (không liếc / rung / nảy), chỉ còn chớp */
      KV.ctx.Luu = { docCaiDat: () => ({ mat: false }) };
      KV.datGio(KV.gio() + 3000); F.baoHieu('?', 900); const tatNgac = mat(); F.vis.gocMem = 1; const tt2 = {}; F.bieuCam(F.vis, tt2, KV.gio(), 0); F.vis.gocMem = 0;
      await KV.chayToi(F.phatNhip({ robot: { x: 1, y: 0, huong: 2, banh: { trai: 1, phai: 1 } }, suKien: [{ ma: 'dam-tuong', tu: { x: 1, y: 0 }, den: { x: 1, y: 1 }, vat: 'tuong' }] }, 300), F); const tatDam = mat(), lac = F.vis.lacMat;
      let coChop = false; for (let i = 0; i < 400 && !coChop; i++) { KV.datGio(KV.gio() + 25); const t3 = {}; F.bieuCam(F.vis, t3, KV.gio(), 0); if (/^chop/.test(t3.mat)) coChop = true; }
      delete KV.ctx.Luu; KV.datGio(KV.gio() + 3000);
      kiem('(13d, V7b) Cài đặt "Biểu cảm mắt" tắt → vector: dấu ? / đâm tường / quay vẫn mắt thường, không liếc, không rung; vẫn chớp (quét 10 s)',
        tatNgac === 'thuong' && tatDam === 'thuong' && tt2.mat === 'thuong' && !lac && coChop, J({ tatNgac, tatDam, quay: tt2.mat, lac, coChop }));
    }
    /* chớp theo thời gian: 2 xe của một sân nhiều robot, 14 giây không sự kiện */
    const cv2 = new KV.Cv(); cv2.parentNode = KV.cha; const F2 = new KV.ctx.SanVe.Field(cv2, {});
    F2.nap({ san: ['....', '....'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'banh', robot: { than: 'hai-banh', tay: null, camBien: [] }, doi: [{ batDau: { x: 0, y: 0, huong: 1 }, robot: { than: 'hai-banh', tay: null, camBien: [] } }, { batDau: { x: 3, y: 1, huong: 3 }, robot: { than: 'omni', tay: null, camBien: [] } }] });
    const batDauChop = [[], []], dai = [[], []], t0 = KV.gio();
    let dang = [null, null];
    for (let t = t0; t < t0 + 14000; t += 16) {
      KV.datGio(t);
      for (let k = 0; k < 2; k++) { F2.chonXe(k); const tt = {}; F2.bieuCam(F2.vis, tt, t, 1); const c = /^chop/.test(tt.mat); if (c && dang[k] === null) { dang[k] = t; batDauChop[k].push(t); } if (!c && dang[k] !== null) { dai[k].push(t - dang[k]); dang[k] = null; } }
    }
    F2.chonXe(0);
    const khoang = batDauChop.map((ds) => ds.slice(1).map((x, i) => x - ds[i]).filter((d) => d > 450));        // bỏ lần chớp thứ hai của chớp đôi
    const okChop = batDauChop.every((ds) => ds.length >= 3) && khoang.every((ds) => ds.every((d) => d >= 2400 && d <= 5500)) && dai.every((ds) => ds.every((d) => d >= 100 && d <= 200)) && J(batDauChop[0]) !== J(batDauChop[1]);
    kiem('(13d) chớp theo thời gian (14 s không sự kiện): xe 1 chớp ' + batDauChop[0].length + ' lần, xe 2 ' + batDauChop[1].length + ' lần, khoảng ' + J(khoang.map((ds) => ds.map((d) => Math.round(d / 100) / 10))) + ' s, mỗi lần ~150 ms, hai xe lệch nhau', okChop, J({ batDauChop, dai }));
    /* nhiều robot: húc bạn → '> <' (xoay) cho xe húc, giật mình cho xe bị húc; chờ 2 nhịp → lim dim + "…" */
    F2.chonXe(0); KV.datGio(KV.gio() + 3000);
    await KV.chayToi(F2.phatNhip({ robot: { x: 0, y: 0, huong: 1, banh: { trai: 1, phai: 1 } }, suKien: [{ ma: 'dam-tuong', tu: { x: 0, y: 0 }, den: { x: 3, y: 1 }, vat: 'dong-doi' }] }, 300), F2);
    const mXe = (k) => { F2.chonXe(k); const tt = {}; F2.bieuCam(F2.vis, tt, KV.gio(), 0); F2.chonXe(0); return tt.mat.split(':')[0]; }, kq2 = { huc: mXe(0), biHuc: mXe(1) };
    KV.datGio(KV.gio() + 2000); F2.chonXe(1);
    for (let n = 0; n < 2; n++) await KV.chayToi(F2.phatNhip({ robot: { x: 3, y: 1, huong: 3, banh: { trai: 0, phai: 0 } }, suKien: [{ ma: 'dung-yen' }] }, 100), F2);
    kq2.cho = mXe(1); kq2.boBong = F2.xe[1].vis.choDen > KV.gio();
    kiem('(13d) nhiều robot (chỉ đọc vết): húc bạn → ' + kq2.huc + ', bạn bị húc → ' + kq2.biHuc + ', đứng chờ 2 nhịp → ' + kq2.cho + (kq2.boBong ? ' + bong bóng "…"' : ''), kq2.huc === 'xoay' && kq2.biHuc === 'ngac' && kq2.cho === 'lim' && kq2.boBong, J(kq2));
    /* camera không đổi mắt: hình có camera = hình không camera + phần camera vẽ sau (tiền tố), ống kính ở phía ĐUÔI sau xoay */
    const camSai = [];
    for (const than of ['hai-banh', 'xich', 'nhen', 'omni']) for (const h of [0, 1, 2, 3]) {
      VV.xoaDem(); const a = VV.robot({ than }, {}, h, 84).getContext().lenh.join('\n'), b = VV.robot({ than, camBien: [{ ma: 'camera', o: 'tren' }] }, {}, h, 84).getContext().lenh.join('\n');
      if (!b.startsWith(a.replace(/\nrestore(\(\))?$/, ''))) camSai.push(than + ' h' + h + ': camera đổi phần thân / mắt');
      const p = VV.diemOngKinh({ than, camBien: [{ ma: 'camera', o: 'tren' }] }, h, 84), dx = [0, 1, 0, -1][h], dy = [-1, 0, 1, 0][h];
      if (!p || ((p.x - 42) * dx + (p.y - 42) * dy) > -8) camSai.push(than + ' h' + h + ': ống kính không ở phía đuôi');
    }
    kiem('(13d) camera KHÔNG còn đổi mắt (mắt luôn là mắt cảm xúc): hình có camera = hình không camera + khối camera vẽ thêm; ống kính ở phía ĐUÔI sau xoay (4 thân có hướng × 4 hướng)', camSai.length === 0, camSai.slice(0, 4).join('; '));
  }

  /* e. cảm biến dính vỏ (dùng VeVector của Node: lỗi giả dời ổ hông áp vào đây) */
  {
    const dinh = [];
    const hopCua = (lenh) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const them = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
      for (const l of lenh) { const [k, ...a] = l; if (k === 'moveTo' || k === 'lineTo') them(a[0], a[1]); else if (k === 'arc') { them(a[0] - a[2], a[1] - a[2]); them(a[0] + a[2], a[1] + a[2]); } else if (k === 'ellipse') { them(a[0] - a[2], a[1] - a[3]); them(a[0] + a[2], a[1] + a[3]); } else if (k === 'rect') { them(a[0], a[1]); them(a[0] + a[2], a[1] + a[3]); } }
      return { x0, y0, x1, y1 }; };
    for (const than of V.ds('than')) {
      const t = V.lay('than', than); if (!t.vo) { dinh.push(than + ': thiếu hộp vỏ (vo)'); continue; }
      for (const cb of V.ds('cam-bien')) {
        const d = V.lay('cam-bien', cb);
        for (const o of [].concat(d.gan)) {
          const cams = V.doiCam([{ ma: cb, o }]);
          try { V.kiemGhep({ than, camBien: [{ ma: cb, o }] }); } catch (e) { continue; }
          for (const c of cams) {
            const og = d.oVe === 'cam' && t.oCam ? t.oCam : t.oGan[c.o]; if (!og) continue;
            const cv = new V.CanvasGia(100, 100), g = cv.getContext('2d');
            d.ve(g, { ben: c.o === 'hongTrai' ? 'trai' : 'phai', o: c.o, ra: og.x >= 50 ? 1 : -1, than }, V.mauDoi(''), V.H);
            const hb = hopCua(cv.lenh), dx = og.x - d.diemNeo.x, dy = og.y - d.diemNeo.y, vo = t.vo;
            const kx = Math.max(0, vo.x - (hb.x1 + dx), (hb.x0 + dx) - (vo.x + vo.w)), ky = Math.max(0, vo.y - (hb.y1 + dy), (hb.y0 + dy) - (vo.y + vo.h));
            if (Math.hypot(kx, ky) > 2) dinh.push(than + ' / ' + cb + ' @' + c.o + ': cách vỏ ' + Math.hypot(kx, ky).toFixed(1));
            const ox = Math.max(0, vo.x - og.x, og.x - (vo.x + vo.w)), oy = Math.max(0, vo.y - og.y, og.y - (vo.y + vo.h));        // chân đế (điểm gắn) phải nằm trên vỏ
            if (Math.hypot(ox, oy) > 2) dinh.push(than + ' / ' + cb + ' @' + c.o + ': chân đế cách vỏ ' + Math.hypot(ox, oy).toFixed(1));
          }
        }
      }
    }
    kiem('(13e) cảm biến DÍNH VỎ: mọi thân × cảm biến × ổ hợp lệ, hộp bao hình cảm biến chạm hộp vỏ thân và chân đế (điểm gắn) nằm trên vỏ (≤ 2 đơn vị /100; camera ở đuôi: than.oCam)', dinh.length === 0, dinh.slice(0, 5).join('; '));
  }

  /* f. veCo: robot ngoài sân theo cỡ hiển thị (V7c1: chỉ còn vế vector) */
  {
    const sai = [];
    for (const cfg of [{ than: 'hai-banh', tay: null, camBien: [] }, { than: 'xich', tay: 'kep', camBien: [] }, { than: 'drone', tay: null, camBien: [] }]) for (const ti of [1.5, 2, 3, 4]) {
      const v = KV.ctx.VeRobot.veCo(cfg, {}, 0, ti * 24);
      const ph = KV.ctx.VeRobot.PHONG_NGOAI_SAN;                                  // V5a: vector ngoài sân phóng ×1,2 (bằng bản pixel)
      if (ph !== 1.2 || !v || !v.laVector || v.width !== Math.round(ti * 24 * ph * 2) || Math.abs(KV.ctx.VeRobot.heSoCss(v) * v.width - ti * 24 * ph) > 1e-6) sai.push('vector ' + cfg.than + ' ' + ti * 24 + ' px → ' + (v && v.width));
    }
    const nguon = ['man-lap.js', 'the-part.js', 'mo-dau.js', 'man-dau.js', 'phim-goi.js'].filter((f) => !/VeRobot\.veCo\(/.test(fs.readFileSync(path.join(GAME, f), 'utf8')) || /VeRobot\.ve\(/.test(fs.readFileSync(path.join(GAME, f), 'utf8')));
    kiem('(13f) VeRobot.veCo (robot ngoài sân): vector một ô pxCss × 1,2 (V5a) × dpr (heSoCss = 1 / dpr); màn Lắp robot, thẻ Bộ phận mới, mở đầu, màn đầu, phim đều gọi veCo',
      sai.length === 0 && nguon.length === 0, sai.concat(nguon).slice(0, 5).join('; '));
  }

  /* h. (gói V6b, user 28/10 "Nâng lên to ra") CỠ VẬT TRONG TAY ở vector: phát lại màn kẹp / tay xoay / nam châm bằng san-ve.js thật, đo cạnh THÂN vật mỗi lần vẽ
        (phần trăm cạnh ô: hộp sz × 0,76 / ô): tay hạ (độ nâng 0) = vật nằm sàn, tay nâng (độ nâng 1) = 1,15–1,25 lần, chuyển dần (không nhảy cỡ), bóng nâng xa hơn;
        vật dính nam châm = cỡ vật nâng; càng kẹp / ngón tay xoay ôm vật ở mọi độ nâng (khe ≥ thân vật, sát mép). */
  {
    const VV = KV.ctx.VeVector, P = KV.ctx.SanVe.Field.prototype, veCu = P.veMotVat, ghi = [];
    if (LOI_GIA) { VV._loiGia.coVatCu = true; console.log('(và hai lỗi giả V6b: vật trong tay cỡ cũ 24% không theo độ nâng, càng kẹp giữ khe cũ)'); }
    P.veMotVat = function (g, o, n, x, y, sz, so) {
      const m = g.getTransform(), sc = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1, o1 = 14 * this.kk * this.u / sc;      // cạnh ô theo đơn vị của g
      if (this.lopOK && o1 > 0) ghi.push({ ten: this.__ten, tt: o.tt, nang: o.nang || 0, tay: this.cfg.robot.tay, tuThe: this.vis && this.vis.tay && this.vis.tay.tuThe, nk: this.vis && this.vis.nangK, than: sz * 0.76 / o1 * 100, so: so / o1 * 100 });
      return veCu.apply(this, arguments);
    };
    const MAN_H = CA.filter((c) => ['kep', 'xoay', 'nam-cham'].includes(KV.ctx.VeRobot.cauHinhCua(c.m).tay) && !c.m.doi);
    for (const c of MAN_H) { KV.datHat(777); KV.datGio(1000); P.__ten = c.ten; await phat(KV, c.m, c.v); }
    P.veMotVat = veCu; delete P.__ten;
    const SAN = ghi.filter((r) => r.tt === 'dat' && !r.nang).map((r) => r.than), san = SAN.length ? SAN.reduce((a, b) => a + b, 0) / SAN.length : 0;
    const chuoi2 = (r) => r.ten + ' ' + r.tay + ' ' + r.tuThe + ' k' + (r.nk === undefined ? '-' : (+r.nk).toFixed(2)) + ' thân ' + r.than.toFixed(1);
    const sai = [], bang = {};
    for (const tay of ['kep', 'xoay']) {
      const cam = ghi.filter((r) => r.tt === 'cam' && r.tay === tay), ha = cam.filter((r) => r.tuThe === 'duoi' && r.nk === 0), nang = cam.filter((r) => r.tuThe === 'tren' && r.nk === 1);
      if (!ha.length || !nang.length) { sai.push(tay + ': thiếu khung hạ (' + ha.length + ') / nâng (' + nang.length + ')'); continue; }
      ha.filter((r) => Math.abs(r.than - san) > 1).slice(0, 2).forEach((r) => sai.push('hạ ≠ cỡ sàn: ' + chuoi2(r)));
      nang.filter((r) => !(r.than / san >= 1.15 && r.than / san <= 1.25)).slice(0, 2).forEach((r) => sai.push('nâng không 1,15–1,25 lần sàn: ' + chuoi2(r)));
      if (!(Math.min(...nang.map((r) => r.so)) > Math.max(...ha.map((r) => r.so)))) sai.push(tay + ': bóng vật nâng không xa hơn bóng vật hạ');
      for (let i = 1; i < cam.length; i++) if (cam[i].ten === cam[i - 1].ten && Math.abs(cam[i].than - cam[i - 1].than) > 3) { sai.push(tay + ': nhảy cỡ ' + chuoi2(cam[i - 1]) + ' → ' + cam[i].than.toFixed(1)); break; }
      const giua = cam.filter((r) => r.nk > 0.05 && r.nk < 0.95).length;
      if (!giua) sai.push(tay + ': không có khung chuyển cỡ giữa chừng (nâng / hạ không mượt)');
      bang[tay] = { ha: +(ha[0].than).toFixed(1), nang: +(nang[0].than).toFixed(1), giua };
    }
    const nc = ghi.filter((r) => r.tt === 'cam' && r.tay === 'nam-cham');
    if (!nc.length) sai.push('nam châm: không có khung vật dính'); else if (nc.some((r) => !(r.than / san >= 1.15 && r.than / san <= 1.25))) sai.push('nam châm: vật dính không bằng cỡ vật nâng: ' + chuoi2(nc[0]));
    kiem('(13h) V6b cỡ vật trong tay (vector, ' + MAN_H.length + ' lần phát lại: ' + MAN_H.map((c) => c.ten).join(', ') + '): vật nằm sàn ' + san.toFixed(1) + '% ô; tay hạ = cỡ sàn, tay nâng 1,15–1,25 lần, chuyển dần, bóng nâng xa hơn; vật dính nam châm = cỡ nâng ' + J(bang),
      sai.length === 0 && Math.abs(san - VV.VAT_SAN) < 1, sai.slice(0, 5).join('\n      '));
    /* càng / ngón ôm vật: vẽ riêng tay (canvas giả) ở độ nâng 0 / 0,5 / 1, đo nửa khe (đường tâm nét càng) so với nửa thân vật, theo hệ của tay */
    const om = [];
    for (const ma of ['kep', 'xoay']) for (const k of [0, 0.5, 1]) {
      const cv = new V.CanvasGia(100, 100), g = cv.getContext('2d'); V.lay('tay', ma).ve(g, { kep: 'dong', cam: true, tuThe: k === 0 ? 'duoi' : 'tren', nangK: k }, V.mauDoi(''), V.H);
      const pts = []; let m = [1, 0, 0, 1, 0, 0]; const ngan = [];
      for (const l of cv.lenh) {
        const [c, ...a] = l;
        if (c === 'save') ngan.push(m.slice()); else if (c === 'restore') m = ngan.pop() || m; else if (c === 'translate') m = [m[0], m[1], m[2], m[3], m[4] + m[0] * a[0] + m[2] * a[1], m[5] + m[1] * a[0] + m[3] * a[1]];
        else if (c === 'rotate') { const co = Math.cos(a[0]), si = Math.sin(a[0]); m = [m[0] * co + m[2] * si, m[1] * co + m[3] * si, -m[0] * si + m[2] * co, -m[1] * si + m[3] * co, m[4], m[5]]; }
        else if (c === 'bezierCurveTo') pts.push(m[0] * a[4] + m[2] * a[5] + m[4]);                       // đầu càng (V8b: tay xoay vẽ đúng càng cong của tay kẹp)
      }
      const khe = Math.max(...pts.map((x) => Math.abs(x - 50))), nua = V.coVatKep(k) / V.CO_THAN / 2;
      if (!(khe >= nua && khe <= nua + 4)) om.push(ma + ' k' + k + ': nửa khe ' + khe.toFixed(1) + ', nửa thân vật ' + nua.toFixed(1));
    }
    kiem('(13h) V6b càng kẹp / ngón tay xoay ÔM vật ở mọi độ nâng (0 / 0,5 / 1): đường tâm càng nằm ngoài mép thân vật, cách không quá 4 đơn vị (không xuyên vật, không hở)', om.length === 0, om.join('; '));
  }

  /* i. (gói V7a) drone nam châm: vật treo dưới drone = cỡ vật nâng (phát lại màn drone thật); tay xoay mở / khép DẦN (moK 0 / 0,5 / 1 ra ba khe khác nhau, tăng dần);
        dây nối nút ↔ cửa: màn có nút N / M và cửa có dây, đầu dây ở ô nút, cuối ở ô cửa, theo cfg.noi; màn không nút không dây; nhánh vector gọi veDayNoi. */
  {
    const VV = KV.ctx.VeVector, P = KV.ctx.SanVe.Field.prototype, veCu = P.veMotVat, nangCu = P.coVatNang, ghi = [];
    if (LOI_GIA) { P.coVatNang = P.coVatDat; V._loiGia.xoayBat = true; console.log('(và ba lỗi giả V7a: vật treo drone cỡ sàn, tay xoay bật khe một phát, dungDayNoi không dựng dây)'); }
    P.veMotVat = function (g, o, n, x, y, sz) {
      const m = g.getTransform(), sc = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1, o1 = 14 * this.kk * this.u / sc;
      if (this.lopOK && o1 > 0 && o.tt === 'cam' && this.vis && this.vis.dr && !this.vis.dr.roi) ghi.push(sz * 0.76 / o1 * 100);
      return veCu.apply(this, arguments);
    };
    const DR = ['drone.7', 'che-drone.6'].map((ma) => ManHoc.danhSach.find((x) => x.ma === ma)).filter(Boolean);
    for (const m of DR) { const v = vetCua(m); if (v && v.vet.length) { KV.datHat(777); KV.datGio(1000); await phat(KV, m, v); } }
    P.veMotVat = veCu; P.coVatNang = nangCu;
    const tl = ghi.map((t) => t / VV.VAT_SAN);
    kiem('(13i) V7a vật treo dưới drone nam châm = cỡ vật nâng (1,15–1,25 lần vật nằm sàn; phát lại ' + DR.map((m) => m.ma).join(', ') + ': ' + ghi.length + ' khung treo)',
      ghi.length > 0 && tl.every((k) => k >= 1.15 && k <= 1.25), ghi.length ? 'tỉ lệ ' + Math.min(...tl).toFixed(2) + '–' + Math.max(...tl).toFixed(2) : 'không khung treo nào');
    /* tay xoay: vẽ riêng tay (canvas giả), đo nửa khe (đầu càng: điểm cuối bezierCurveTo xa trục nhất; V8b càng cong như tay kẹp) ở moK 0 / 0,5 / 1 */
    const khe = [0, 0.5, 1].map((k) => {
      const cv = new V.CanvasGia(100, 100), g = cv.getContext('2d'); V.lay('tay', 'xoay').ve(g, { kep: 'dong', cam: false, tuThe: 'tren', moK: k }, V.mauDoi(''), V.H);
      const pts = []; let m = [1, 0, 0, 1, 0, 0]; const ngan = [];
      for (const l of cv.lenh) {
        const [c, ...a] = l;
        if (c === 'save') ngan.push(m.slice()); else if (c === 'restore') m = ngan.pop() || m; else if (c === 'translate') m = [m[0], m[1], m[2], m[3], m[4] + m[0] * a[0] + m[2] * a[1], m[5] + m[1] * a[0] + m[3] * a[1]];
        else if (c === 'rotate') { const co = Math.cos(a[0]), si = Math.sin(a[0]); m = [m[0] * co + m[2] * si, m[1] * co + m[3] * si, -m[0] * si + m[2] * co, -m[1] * si + m[3] * co, m[4], m[5]]; }
        else if (c === 'bezierCurveTo') pts.push(m[0] * a[4] + m[2] * a[5] + m[4]);
      }
      return Math.max(...pts.map((x) => Math.abs(x - 50)));
    });
    V._loiGia.xoayBat = false;
    kiem('(13i) V7a tay xoay mở / khép DẦN: nửa khe ở moK 0 / 0,5 / 1 tăng dần, giữa chừng khác hai đầu (không bật một phát) ' + J(khe.map((k) => +k.toFixed(1))),
      khe[0] < khe[1] - 0.5 && khe[1] < khe[2] - 0.5, '');
    /* dây nối: chạy dungDayNoi trên sân thật của các màn (không cần vẽ) */
    const dung = LOI_GIA ? function () { this.dayNoi = []; } : P.dungDayNoi, saiD = [];
    const MAN_D = ManHoc.danhSach.filter((m) => !Array.isArray(m.san[0]) && !m.doi);
    let coDay = 0, coNut = 0;
    for (const m of MAN_D) {
      const rows = m.san, w = rows[0].length, h = rows.length, f = {};
      dung.call(f, rows, m.noi, m.cuaNhip, { ox: 0, oy: 0, vw: w, vh: h });
      const nut = rows.join('').match(/[NM]/g), cua = rows.join('').match(/[Cc]/g), ds = f.dayNoi || [];
      if (!nut || !cua) { if (ds.length) saiD.push(m.ma + ': không nút / cửa mà có ' + ds.length + ' dây'); continue; }
      coNut++; if (ds.length) coDay++;
      const can = Array.isArray(m.noi) ? m.noi.reduce((s, g) => s + ((g && g.cua) || []).length, 0) : null;
      if (!ds.length && can !== 0) saiD.push(m.ma + ': có nút + cửa mà không dây');
      for (const d of ds) {
        if (rows[d.nut.y][d.nut.x] !== d.nut.ma || !/[Cc]/.test(rows[d.cua.y][d.cua.x])) { saiD.push(m.ma + ': dây nối sai ô'); break; }
        const a = d.diem[0], b = d.diem[d.diem.length - 1];
        if (Math.floor(a[0] / 14) !== d.nut.x || Math.floor(a[1] / 14) !== d.nut.y || Math.floor(b[0] / 14) !== d.cua.x || Math.floor(b[1] / 14) !== d.cua.y) { saiD.push(m.ma + ': đầu / cuối dây không ở ô nút / cửa'); break; }
      }
    }
    const svSrc = fs.readFileSync(path.join(GAME, 'san-ve.js'), 'utf8');
    kiem('(13i) V7a dây nối nút ↔ cửa: ' + coDay + ' / ' + coNut + ' màn có nút + cửa có dây (theo cfg.noi; đầu ô nút, cuối ô cửa); màn không nút không dây; draw() gọi veDayNoi (V7c2: hết điều kiện this.vec)',
      saiD.length === 0 && coDay >= 10 && /\n      this\.veDayNoi\(g, now\);/.test(svSrc), saiD.slice(0, 4).join('; '));
  }

  /* g. cờ bay, sàn bàn cờ, trang xem */
  {
    const VV = KV.ctx.VeVector, s = (ma, st) => { VV.xoaDem(); return VV.o(ma, 56, st).getContext().lenh.join('\n'); };
    const coBay = s('co', { pha: 0 }) !== s('co', { pha: 0.5 }) && s('co', { pha: 0.25 }) !== s('co', { pha: 0.25, manh: 1 });
    const banCo = s('san') !== s('san', { le: 1 });
    const xem = fs.readFileSync(path.join(day, 'hinh-mau', 'xem-vector.html'), 'utf8'), svSrc = fs.readFileSync(path.join(GAME, 'san-ve.js'), 'utf8');
    const trang = ['v4', 'v4-mat', 'v4-mat-nho', 'v4-cam', 'v4-san'].every((id) => xem.includes('id="' + id + '"')) && /SanHoc\.chay/.test(xem) && /ve-vector-hieu-ung\.js/.test(xem);
    kiem('(13g) cờ bay (pha / phất mạnh ra hình khác), sàn bàn cờ hai tông (ô chẵn / lẻ khác nhau, san-ve theo (x + y)), trang xem có mục V4 (mắt, mắt ô nhỏ, cảm biến dính vỏ, sân mẫu chạy SanHoc)',
      coBay && banCo && /le: 1/.test(svSrc) && trang, J({ coBay, banCo, trang }));
  }

  /* j. V8a (29/10, user "ko tạo cảm giác đang bò"): DÁNG BÒ của nhện theo pha liên tục, không còn hai khung buoc 0 / 1 */
  {
    const VV = KV.ctx.VeVector, ve = (st) => { VV.xoaDem(); return VV.robot({ than: 'nhen' }, { than: st }, 2, 84).getContext().lenh.join('\n'); }, sai = [];
    /* (1) hình: pha 0 / 1 (cuối nhịp), nhac 0 = tư thế đứng; mỗi pha 1/16 một hình riêng; 4 hướng đi khác nhau; chuẩn bị: hai cặp nhấc khác nhau; co chân cũng bò */
    for (const co of [false, true]) {
      const c = co ? { co: true } : {}, dung = ve(c), thay = new Map([[dung, 'đứng']]);
      for (const st of [{ lan: 0 }, { lan: 1 }, { lan: 0, di: 3 }, { nhac: 0 }]) if (ve(Object.assign({}, c, st)) !== dung) sai.push((co ? 'co ' : '') + J(st) + ' khác tư thế đứng');
      for (let i = 1; i < 16; i++) { const k = ve(Object.assign({}, c, { lan: i / 16 })); if (thay.has(k)) sai.push((co ? 'co ' : '') + 'lan ' + i + '/16 trùng ' + thay.get(k)); thay.set(k, 'lan ' + i + '/16'); }
      const huong = new Set([0, 1, 2, 3].map((d) => ve(Object.assign({}, c, { lan: 0.25, di: d })))); if (huong.size !== 4) sai.push((co ? 'co ' : '') + 'bốn hướng đi chỉ ra ' + huong.size + ' hình');
      if (ve(Object.assign({}, c, { nhac: 0.25 })) === ve(Object.assign({}, c, { nhac: 0.75 })) || ve(Object.assign({}, c, { nhac: 0.25 })) === dung) sai.push((co ? 'co ' : '') + 'nhịp chuẩn bị: hai cặp nhấc không khác nhau');
    }
    /* (2) đường trạng thái san-ve → VeRobot: phát nhịp chuẩn bị + nhịp bước của nhện, ghi trạng thái truyền cho VeRobot.ve mỗi khung */
    const VR = KV.ctx.VeRobot, veCu = VR.ve, ghi = [];
    VR.ve = function (cfg, tt) { if (cfg.than === 'nhen') ghi.push({ lan: tt.lan, di: tt.di, nhac: tt.nhac }); return veCu.apply(this, arguments); };
    const buoc = async (robot, h, tu, den) => {
      const cv = new KV.Cv(); cv.parentNode = KV.cha; const F = new KV.ctx.SanVe.Field(cv, {});
      F.nap({ san: ['.....', '.....', '.....', '.....'], batDau: { x: tu.x, y: tu.y, huong: h }, loaiRobot: 'nhen', robot });
      if (LOI_GIA) F.dangBo = function () {};                                    // lỗi giả V8a: bỏ dáng bò (như bản cũ: chỉ khung buoc), mục 13j phải đỏ
      ghi.length = 0; KV.datGio(KV.gio() + 3000);
      await KV.chayToi(F.phatNhip({ robot: { x: tu.x, y: tu.y, huong: h, banh: { trai: 0, phai: 0 } }, suKien: [{ ma: 'chuan-bi', nhay: false }] }, 400), F);
      const chuanBi = ghi.splice(0);
      await KV.chayToi(F.phatNhip({ robot: { x: den.x, y: den.y, huong: h, banh: { trai: 0, phai: 0 } }, suKien: [{ ma: 'di', tu, den }] }, 400), F);
      const di = ghi.splice(0);
      await KV.chayToi(new Promise((r) => KV.ctx.setTimeout(r, 50)), F);
      return { nhac: new Set(chuanBi.map((t) => t.nhac)), lan: new Set(di.map((t) => t.lan).filter((x) => x !== undefined)), di: new Set(di.filter((t) => t.lan > 0).map((t) => t.di)), sau: ghi.slice(-1)[0] || {} };
    };
    const KQ = [
      ['nhện không tay sang PHẢI (vẽ hướng 0 → hệ thân −x)', { than: 'nhen', tay: null, camBien: [] }, 0, { x: 1, y: 1 }, { x: 2, y: 1 }, 3],
      ['nhện không tay XUỐNG (hệ thân −y, phía đuôi)', { than: 'nhen', tay: null, camBien: [] }, 0, { x: 1, y: 1 }, { x: 1, y: 2 }, 2],
      ['nhện tay kẹp quay PHẢI, đi phải (về phía mũi +y)', { than: 'nhen', tay: 'kep', camBien: [] }, 1, { x: 1, y: 1 }, { x: 2, y: 1 }, 0]
    ], tom = [];
    for (const [ten, robot, h, tu, den, diMong] of KQ) {
      const k = await buoc(robot, h, tu, den);
      tom.push(ten.split(' (')[0] + ': nhac ' + k.nhac.size + ' / lan ' + k.lan.size + ' / di ' + [...k.di].join(','));
      if (k.nhac.size < 5 || !k.nhac.has(0.25) || !k.nhac.has(0.75)) sai.push(ten + ': nhịp chuẩn bị chỉ có nhac ' + J([...k.nhac]));
      if (k.lan.size < 8) sai.push(ten + ': nhịp bước chỉ có ' + k.lan.size + ' pha ' + J([...k.lan]));
      if (k.di.size !== 1 || !k.di.has(diMong)) sai.push(ten + ': hướng trong hệ thân ' + J([...k.di]) + ', cần ' + diMong);
      if (k.sau.lan !== undefined || k.sau.nhac !== undefined) sai.push(ten + ': xong bước chưa về tư thế đứng ' + J(k.sau));
    }
    VR.ve = veCu;
    kiem('(13j) V8a dáng bò nhện: pha 0 / cuối nhịp = tư thế đứng (cả co chân), 15 pha 1/16 ra 15 hình khác nhau, 4 hướng đi khác nhau; trên sân nhịp chuẩn bị hai cặp chân nhấc luân phiên, nhịp bước pha liên tục ≥ 8 bậc, hướng đổi đúng sang hệ thân (cả nhện có tay quay mặt), xong bước về đứng (' + tom.join('; ') + ')',
      sai.length === 0, sai.slice(0, 5).join('\n      '));
  }
}

/* ============================================================ 14. (gói V5a) GIAO DIỆN PHẲNG màn chơi ở vector (choi-vector.css, body.ve-vector) */
console.log('\n== 14. (V5a) Giao diện phẳng màn chơi: phông mới, choi-vector.css chỉ áp ở body.ve-vector, không steps / pixelated / Handjet / VT323, tương phản, công tắc Cài đặt ==');
{
  const doc = (f) => fs.readFileSync(path.join(GAME, f), 'utf8');
  let cssV = doc('choi-vector.css'), cssP = doc('choi.css'), hieuUng = doc('ve-vector-hieu-ung.js'), fontCss = doc('font/font.css');
  let caiDat = doc('cai-dat.js'); const chu = doc('chu.js'), thanhPhan = doc('thanh-phan.js'), huongDan = doc('huong-dan.js');
  const V5 = V;                                                                          // VeVector của Node (luuCheDo / bat)
  if (LOI_GIA) {
    console.log('(và năm lỗi giả V5a: thêm một luật không có body.ve-vector có steps(), bỏ phần phủ .ffr.rung, chữ canvas về VT323, hàng Kiểu vẽ quay lại (14f); thêm một cặp chữ / nền tương phản 2:1)');
    cssV += '\n.brick{animation:blink .4s steps(1) 4}\n';
    cssV = cssV.replace(/body\.ve-vector \.ffr\.rung\{[^}]*\}/, '');
    cssP += '\n.ffr.rung{animation:rung .3s steps(2) 1}\n';                       // V7c3: choi.css hết steps() nên lỗi giả "bỏ phủ .ffr.rung" phải kèm steps() quay lại choi.css (không thì 14c không đỏ)
    hieuUng = hieuUng.replace("var PHONG_CHU = '", "var PHONG_CHU = '8px VT323, monospace'; var _bo = '");
    caiDat += '\nfunction hangKieuVe() { return VeVector.luuCheDo("pixel"); }\n';   // V7c1: lỗi giả hàng Kiểu vẽ quay lại → 14f đỏ
    cssV += '\nbody.ve-vector .thu-loi-gia{color:var(--g-vecKeDam);background:var(--g-vecThe)}\n';
  }
  /* bộ tách luật CSS phẳng: [{ sel, than, trong }] (trong = '@media …' nếu nằm trong @media); bỏ @keyframes */
  function tachLuat(src) {
    src = src.replace(/\/\*[\s\S]*?\*\//g, '');
    const kq = [];
    (function duyet(s, trong) {
      let i = 0;
      while (i < s.length) {
        const mo = s.indexOf('{', i); if (mo < 0) break;
        const dau = s.slice(i, mo).trim();
        let sau = mo + 1, bac = 1; while (sau < s.length && bac) { if (s[sau] === '{') bac++; else if (s[sau] === '}') bac--; sau++; }
        const than = s.slice(mo + 1, sau - 1);
        if (/^@media/.test(dau)) duyet(than, dau);
        else if (!/^@(-webkit-)?keyframes/.test(dau) && !/^@font-face/.test(dau)) kq.push({ sel: dau, than, trong });
        i = sau;
      }
    })(src, '');
    return kq;
  }
  const luatV = tachLuat(cssV), luatP = tachLuat(cssP);
  const MOC_B = cssV.search(/\n\/\* =+ V7b \(28\/10\): từ đây là NGUYÊN VĂN giao-dien-vector-b\.css/);   // V7b việc 10: phần V5b nối sau dòng mốc; 14e chỉ đo phần V5a (phần V5b đo ở kiem-giao-dien-vector-b mục e với luật nền cha riêng)
  const luatV5a = MOC_B >= 0 ? tachLuat(cssV.slice(0, MOC_B)) : luatV;

  /* a. nạp đủ phông mới + choi-vector.css (sau choi.css), biến phông trỏ phông mới */
  {
    const linkCss = [...CHOI_SRC.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
    const tepPhong = ['gsflex-latin', 'gsflex-latin-ext', 'gsflex-viet', 'gscode-latin', 'gscode-latin-ext', 'gscode-viet'];
    const thieu = tepPhong.filter((f) => !fontCss.includes('url(' + f + '.woff2)') || !fs.existsSync(path.join(GAME, 'font', f + '.woff2')));
    const goc = luatV.find((r) => r.sel === 'body.ve-vector' && /--px:"Google Sans Flex"/.test(r.than) && /--mono:"Google Sans Code"/.test(r.than));
    const ok = linkCss.indexOf('choi-vector.css') > linkCss.indexOf('choi.css') && linkCss.indexOf('choi.css') >= 0 && /font-family: 'Google Sans Flex'/.test(fontCss) && /font-family: 'Google Sans Code'/.test(fontCss) && !thieu.length && !!goc;
    kiem('(14a) choi.html nạp font/font.css và choi-vector.css SAU choi.css; font.css khai Google Sans Flex / Code đủ bộ latin + latin-ext + vietnamese (tệp .woff2 có thật); body.ve-vector đặt --px / --mono về phông mới',
      ok, J({ linkCss, thieu, goc: !!goc }));
  }
  /* b. mọi luật của choi-vector.css chỉ chọn trong body.ve-vector (giữ độ ưu tiên phủ lên choi.css); tệp không có steps( / pixelated / Handjet / VT323 */
  {
    const ngoai = []; for (const r of luatV) for (const s of r.sel.split(',')) if (!/^body\.ve-vector[\s.:>[]|^body\.ve-vector$/.test(s.trim())) ngoai.push(s.trim());
    const cam = ['steps(', 'pixelated', 'Handjet', 'VT323'].filter((w) => luatV.some((r) => r.than.includes(w)));
    kiem('(14b) choi-vector.css: mọi bộ chọn bắt đầu bằng body.ve-vector (body luôn có lớp này; tiền tố giữ độ ưu tiên phủ lên choi.css, V7c3 giữ); không có steps( / pixelated / Handjet / VT323 trong khai báo',
      !ngoai.length && !cam.length, J({ ngoai: ngoai.slice(0, 6), cam }));
  }
  /* c. mọi hoạt cảnh steps() của MÀN CHƠI trong choi.css (và kiểu chèn của huong-dan.js) có luật phủ ở vector đặt lại animation / transition;
        ngoài phạm vi V5a (phim .md / .pg-, màn chọn .g-the / .c-man, Lắp robot .lr-, mua gói .g-mua-nut) để V5b / V6 */
  {
    const NGOAI = /^\.(md|pg-)/;
    const phu = new Map(); for (const r of luatV) if (/(^|;)\s*(animation|transition)\s*:/.test(r.than)) for (const s of r.sel.split(',')) phu.set(s.trim().replace(/^body\.ve-vector\s+/, ''), r.than);
    const can = []; for (const r of luatP) if (/steps\(/.test(r.than)) for (const s of r.sel.split(',')) { const t = s.trim(); if (!NGOAI.test(t)) can.push(t); }
    const hdChen = /#stage>\.hd-vien\{[^}]*steps\(/.test(huongDan) ? ['#stage>.hd-vien'] : [];
    const thieu = can.concat(hdChen).filter((s) => !phu.has(s) || /steps\(/.test(phu.get(s)));
    const tpOk = /veMuot\(\) \? \{ duration: \d+, easing: 'cubic-bezier/.test(thanhPhan) && /giamChuyenDong\(\)/.test(thanhPhan);
    const giam = luatV.some((r) => /prefers-reduced-motion:\s*reduce/.test(r.trong) && /animation-duration:\.01ms!important/.test(r.than) && /transition-duration:\.01ms!important/.test(r.than));
    const conSteps = luatP.filter((r) => /steps\(/.test(r.than)).map((r) => r.sel);                // V7c3: choi.css không còn steps() nào (kể cả phim / màn chọn)
    kiem('(14c) không còn steps() ở màn chơi vector: choi.css 0 bộ chọn steps() (V7c3; có ' + can.length + ' ngoài phim thì phải có luật phủ mượt), kiểu chèn huong-dan.js có luật phủ; dòng code đổi chỗ (thanh-phan.js) trượt cubic-bezier; có @media prefers-reduced-motion',
      !thieu.length && !conSteps.length && tpOk && giam, J({ thieu: thieu.slice(0, 8), conSteps: conSteps.slice(0, 8), tpOk, giam }));
  }
  /* d. phông chữ: choi.css không gõ thẳng phông pixel cũ (V7c3: --px / --mono của choi.css cũng trỏ Google Sans); chữ canvas vector (ve-vector-hieu-ung.js) không còn VT323 */
  {
    const goThang = luatP.filter((r) => /font(-family)?\s*:[^;]*(Handjet|VT323)/.test(r.than)).map((r) => r.sel);
    const canvasCu = (hieuUng.match(/'[^'\n]*VT323[^'\n]*'/g) || []).length;                // chuỗi phông trong mã (chú thích được nhắc tên VT323)
    kiem('(14d) không phông Handjet / VT323 áp vào màn chơi vector: choi.css không gõ thẳng tên phông (chỉ qua --px / --mono), chữ canvas vector (bong chữ, pin, đạn) dùng Google Sans Flex / Code',
      !goThang.length && canvasCu === 0 && /Google Sans Flex/.test(hieuUng) && /Google Sans Code/.test(hieuUng), J({ goThang, canvasCu }));
  }
  /* e. tương phản WCAG AA (4,5:1) của mọi cặp chữ / nền KHAI CÙNG LUẬT trong choi-vector.css (màu đều là vai bảng màu); luật chỉ có màu chữ thì đo trên thẻ trắng vecThe (trong dòng code .strip / .keo-dong: nền ô mã vecMa)
        (trừ chữ trắng: nền của nó là màu đặc khai ở luật khác). Màn thật đo thêm bằng script trong trang (báo cáo V5a). */
  {
    const lum = (hex) => { const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const tl = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const vai = (than, thuoc) => { const m = than.match(new RegExp('(?:^|;)\\s*' + thuoc + '\\s*:\\s*var\\(--g-(\\w+)\\)\\s*(?:;|$)')); return m && /^#[0-9a-f]{6}$/i.test(BM[m[1]] || '') ? m[1] : null; };
    const sai = []; let soCap = 0;
    for (const r of luatV5a) {
      const c = vai(r.than, 'color'); if (!c) continue;
      const n = vai(r.than, 'background') || vai(r.than, 'background-color');
      if (!n && c === 'vecThe') continue;
      const nen = n || (/\.(strip|keo-dong)\b/.test(r.sel) ? 'vecMa' : 'vecThe'); soCap++;            // chữ trong dòng code nằm trên nền ô mã vecMa
      const k = tl(BM[c], BM[nen]);
      if (k < 4.5) sai.push(r.sel.split(',')[0] + ': ' + c + ' / ' + nen + ' = ' + k.toFixed(2));
    }
    kiem('(14e) tương phản chữ WCAG AA: ' + soCap + ' cặp chữ / nền của choi-vector.css (phần V5a, trước dòng mốc V7b) đều ≥ 4,5:1', soCap > 40 && !sai.length, sai.slice(0, 8).join('; '));
  }
  /* f. (V7c1) hết công tắc: cai-dat.js không còn hàng Kiểu vẽ / luuCheDo, chu.js không còn caiDat.kieuVe*, ve-vector.js không ?ve= / localStorage, choi.html đặt sẵn body.ve-vector */
  {
    const html = doc('choi.html'), veSrc = doc('ve-vector.js');
    const sai = [];
    if (/hangKieuVe|luuCheDo|kieu-ve/.test(caiDat)) sai.push('cai-dat.js còn hàng Kiểu vẽ');
    if (/'caiDat\.(kieuVe|netMoi|diemAnh|kieuVeDang|kieuVeDoi)'/.test(chu)) sai.push('chu.js còn khoá caiDat.kieuVe*');
    if (/doCheDo|luuCheDo|KHOA_LUU|localStorage|ve=pixel|ve=vector/.test(veSrc)) sai.push('ve-vector.js còn công tắc');
    if (!/<body class="ve-vector">/.test(html)) sai.push('choi.html thiếu <body class="ve-vector">');
    if (!/function bat\(\) \{ return true; \}/.test(veSrc)) sai.push('bat() không phải hằng true');
    kiem('(14f) V7c1 gỡ công tắc: cai-dat.js hết hàng Kiểu vẽ / luuCheDo, chu.js hết 5 khoá caiDat.kieuVe*, ve-vector.js hết ?ve= / localStorage (bat() luôn true), choi.html <body class="ve-vector"> có sẵn', !sai.length, sai.join(' | '));
  }
  /* g. trang xem có mục V5a (bảng mẫu nút / khối lệnh / khung code ở các trạng thái, nạp choi-vector.css) */
  {
    const xem = fs.readFileSync(path.join(day, 'hinh-mau', 'xem-vector.html'), 'utf8');
    const ok = xem.includes('id="v5a"') && /choi-vector\.css/.test(xem) && /class="[^"]*\bbrick\b/.test(xem) && /class="[^"]*\bstrip\b/.test(xem) && /class="[^"]*\bbt\b/.test(xem);
    kiem('(14g) trang xem hinh-mau/xem-vector.html có mục V5a (nạp choi-vector.css; mẫu nút, khối lệnh, dòng code ở các trạng thái)', ok);
  }
}

/* ============================================================ 15. (V7c2, 28/10) PHANH CHỐNG TÁI PHÁT: bộ vẽ pixel không quay lại */
console.log('\n== 15. (V7c2) Phanh chống tái phát: không thư mục game/part, choi.html không nạp part/, mã game không còn Part. / this.vec / HINH pixel / Painter / Ve.tiles / pixelated / rẽ theo chế độ ==');
{
  // Mẫu cấm (soát trên nguồn JS của hoc/game đã bỏ chú thích khối và chú thích dòng; mẫu nào cũng là thứ V7c1 / V7c2 đã gỡ):
  const MAU_CAM = [
    ['Part.*', /(?<![\w$.])Part\.(ghep|lay|hamGoc|_veMot|veVatNho|rot90|ds|SON|DS_SON|LOP_SON|K)\b/],          // bộ pixel game/part
    ['this.vec', /\bthis\.vec\b/],                                                                              // san-ve.js rẽ chế độ
    ["HINH['x'] = function", /HINH\['[\w-]+'\] = function/],                                                    // huy hiệu pixel
    ['Painter', /\bnew Painter\(|function Painter\(|\bPainter\.prototype\b/],                                   // bộ vẽ điểm ảnh của ve.js / huy-hieu.js
    ['Ve.tiles / make* / veCua / HINH / khungGo / datChatLieu', /(?<!['"])\bVe\.(tiles|make[A-Z]\w*|veCua|HINH|Painter|khungGo|datChatLieu|spriteTrum|icon)\b/],     // (?<!['"]): khoá chuỗi 'Ve.makeConv' của bảng VE_TRUC_TIEP (ve-vector-ky-hieu.js) là dữ liệu, không phải lời gọi
    ['pixelated', /pixelated/],                                                                                 // image-rendering trong JS (CSS để V7c3)
    ['?ve=pixel / rẽ theo VeVector.bat() / cheDoVector()', /ve=pixel|VeVector\.bat\(\)\s*[?&|]|cheDoVector\(\)\s*[?&|]|VeRobot\.coPart|dungPart|\?part=0/],
    ['Handjet / VT323 làm phông dự phòng', /["']Handjet["']|["']VT323["']/]                                       // phông pixel; chuỗi có VT323 / Handjet ở bất kỳ đâu: mục 15c (V7c3)
  ];
  const boChuThich = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\'"])\/\/[^\n]*/g, '$1');
  const tepGame = fs.readdirSync(GAME).filter((f) => /\.js$/.test(f)).sort();
  const nguonJs = Object.fromEntries(tepGame.map((f) => [f, boChuThich(docGame(f))]));
  let html = CHOI_SRC, coPart = fs.existsSync(path.join(GAME, 'part'));
  if (LOI_GIA) {                                                                                               // lỗi giả: bộ pixel "quay lại" ở ba chỗ
    console.log('(đang cắm lỗi giả mục 15: coi như còn thư mục part, choi.html nạp part/part.js, san-ve.js có this.vec + Part.ghep — phải ĐỎ)');
    coPart = true; html += '\n<script src="part/part.js"></script>'; nguonJs['san-ve.js'] += '\nif (this.vec) Part.ghep(cfg, st, h);\n';
  }
  const sai = [];
  if (coPart) sai.push('còn thư mục hoc/game/part');
  if (/<script src="part\//.test(html)) sai.push('choi.html còn nạp part/');
  for (const f of tepGame) for (const [ten, re] of MAU_CAM) if (re.test(nguonJs[f])) sai.push(f + ': ' + ten);
  kiem('(15) V7c2: không thư mục game/part, choi.html không nạp part/, ' + tepGame.length + ' tệp JS của hoc/game (bỏ chú thích) không còn ' + MAU_CAM.map((m) => m[0]).join(' · '), !sai.length, sai.slice(0, 12).join(' | '));
  /* 15c (V7c3, 29/10): CSS / phông / bộ đệm. Soát trên nguồn đã bỏ chú thích. */
  {
    const boCT = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '');
    const css = { 'choi.css': boCT(docGame('choi.css')), 'choi-vector.css': boCT(docGame('choi-vector.css')) };
    let font = docGame('font/font.css'), sw = docGame('sw.js'), tepFont = fs.readdirSync(path.join(GAME, 'font'));
    const js = Object.assign({}, nguonJs);
    if (LOI_GIA) {
      console.log('(đang cắm lỗi giả mục 15c: choi.css có pixelated / steps() / --wood / VT323, font.css thêm @font-face Handjet + tệp handjet-latin.woff2, san-ve.js đo chữ VT323, sw.js BAN duong-hoc-v1 — phải ĐỎ)');
      css['choi.css'] += '\n.loi-gia{image-rendering:pixelated;animation:x 1s steps(2);background-image:var(--wood);font-family:"VT323"}\n';
      font += "\n@font-face { font-family: 'Handjet'; src: url(handjet-latin.woff2) format('woff2'); }\n"; tepFont = tepFont.concat('handjet-latin.woff2');
      js['san-ve.js'] += "\ng.font = '8px VT323, monospace';\n"; sw = sw.replace(/var BAN = '[^']*'/, "var BAN = 'duong-hoc-v1'");
    }
    const sai = [];
    for (const [f, t] of Object.entries(css)) for (const [ten, re] of [['pixelated', /pixelated/], ['steps(', /steps\(/], ['--wood / --chalk / --stud', /--(wood|chalk|stud)\b/], ['Handjet / VT323', /Handjet|VT323/]]) if (re.test(t)) sai.push(f + ': ' + ten);
    const soFF = (boCT(font).match(/@font-face/g) || []).length;
    if (soFF !== 6) sai.push('font.css có ' + soFF + ' @font-face (phải 6)');
    if (/Handjet|VT323/.test(boCT(font))) sai.push('font.css còn Handjet / VT323');
    const woffCu = tepFont.filter((f) => /^(handjet|vt323)-/i.test(f)); if (woffCu.length) sai.push('font/ còn ' + woffCu.join(', '));
    for (const f of tepGame) if (/['"][^'"\n]*(VT323|Handjet)[^'"\n]*['"]/.test(js[f])) sai.push(f + ': chuỗi có VT323 / Handjet');
    const ban = /var BAN = '([^']*)'/.exec(sw); if (!ban || ban[1] === 'duong-hoc-v1') sai.push("sw.js BAN = 'duong-hoc-v1' (bộ đệm cũ còn part/*.js, woff2 pixel)");
    kiem('(15c) V7c3: choi.css / choi-vector.css (bỏ chú thích) không pixelated / steps( / --wood --chalk --stud / Handjet VT323; font.css đúng 6 @font-face, không Handjet / VT323, thư mục font không còn woff2 handjet / vt323; ' + tepGame.length + " tệp JS game không còn chuỗi VT323 / Handjet (cả chuỗi đo chữ); sw.js BAN ≠ 'duong-hoc-v1'",
      !sai.length, sai.slice(0, 14).join(' | '));
  }
  kiem('(15b) V7c2: hoc/chup-du-lieu-pixel.mjs và tools/ve-icon.py đã xoá; du-lieu-chup-pixel.json còn (chuẩn của kiem-lap-rap / mục 12 / A7); hoc/game/ve.js chỉ còn icon svg + mk + MAU + CO_ICON (< 120 dòng)',
    !fs.existsSync(path.join(day, 'chup-du-lieu-pixel.mjs')) && !fs.existsSync(path.join(day, '..', 'tools', 've-icon.py')) && fs.existsSync(path.join(day, 'du-lieu-chup-pixel.json')) && docGame('ve.js').split('\n').length < 120);
}

console.log('\n---------------------------------------------');
console.log((hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) : 'ĐẠT ' + dat + ' · HỎNG 0') + ' kiểm' + (LOI_GIA ? ' (đang cắm lỗi giả: phải đỏ)' : ''));
process.exit(hong ? 1 : 0);

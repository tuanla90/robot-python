/* ============================================================================
   kiem-cam-bien-tu.mjs — máy kiểm CẢM BIẾN TỪ LÀ PART RIÊNG (P1 mùa 3, 29/10; mã 'tu', front_metal / front_pole, thẻ "Cảm biến từ").
   Trước đó 'tu' ghép vào tai khoảng cách (lap-rap: part khoang-cach + hai hàm; the-part vẽ khoang-cach). Nay: part vector 'tu' có hình riêng (ve-vector-cam.js),
   lap-rap 'tu' = part 'tu' chỉ hai hàm, thẻ bộ phận tên "Cảm biến từ", VeRobot lắp 'tu' cho màn khai camBien 'tu' (hay có front_metal mà không khai cảm biến hông),
   51 màn cũ khai khoang-cach giữ hình cũ, lõi chạy y nguyên (chỉ nhìn hamGoc).
   Chạy: node hoc/kiem-cam-bien-tu.mjs            (trượt thì thoát mã 1)
         node hoc/kiem-cam-bien-tu.mjs --loi-gia  (cố ý bẻ luật: phải ĐỎ)
   ========================================================================== */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const LOI_GIA = process.argv.includes('--loi-gia');
let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const loi = (f) => { try { f(); return null; } catch (e) { return e.message; } };

// Harness canvas ghi lệnh (như kiem-bung-nhen.mjs) để ve-vector.js / ve-robot.js chạy trong node.
class Ctx {
  constructor(cv) { this.canvas = cv; this.lenh = []; }
  ghi(t, a) { this.lenh.push(t + '(' + Array.from(a).map((v) => (v && v.__cv ? 'cv' : v && v.__gr ? 'gr' : typeof v === 'number' ? +v.toFixed(3) : String(v))).join(',') + ')'); }
  createLinearGradient() { return { __gr: true, addColorStop() {} }; }
  createRadialGradient() { return { __gr: true, addColorStop() {} }; }
  measureText(s) { return { width: String(s).length * 5 }; }
  getTransform() { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }; }
  getImageData(x, y, w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; }
  setLineDash(a) { this.ghi('setLineDash', [a]); }
}
for (const k of ['fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'globalAlpha', 'imageSmoothingEnabled', 'imageSmoothingQuality', 'font', 'textAlign', 'textBaseline', 'miterLimit', 'globalCompositeOperation', 'filter', 'shadowBlur', 'shadowColor'])
  Object.defineProperty(Ctx.prototype, k, { get() { return this['_' + k]; }, set(v) { this['_' + k] = v; this.ghi('=' + k, [v]); } });
for (const k of ['save', 'restore', 'beginPath', 'closePath', 'moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo', 'arc', 'arcTo', 'ellipse', 'rect', 'fill', 'stroke', 'fillRect', 'strokeRect', 'clearRect', 'drawImage', 'clip', 'fillText', 'strokeText', 'translate', 'rotate', 'scale', 'setTransform', 'putImageData', 'roundRect'])
  Ctx.prototype[k] = function () { this.ghi(k, arguments); };
class Cv { constructor() { this.__cv = true; this.width = 1; this.height = 1; this.style = {}; this.__ctx = new Ctx(this); } getContext() { return this.__ctx; } }
globalThis.document = { createElement() { return new Cv(); } };
const VV = require(path.join(day, 'game', 've-vector.js'));
globalThis.VeVector = VV;
for (const f of ['ve-vector-than-hai-banh', 've-vector-than-xich', 've-vector-than-nhen', 've-vector-than-drone', 've-vector-cam', 've-vector-tay-nam-cham']) require(path.join(day, 'game', f + '.js'));
const SanHoc = require(path.join(day, 'san-hoc.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));
const GTP = require(path.join(day, 'gioi-thieu-part.js'));
let VeRobot = null; try { VeRobot = require(path.join(day, 'game', 've-robot.js')); } catch (e) { console.log('(không nạp được ve-robot.js ở Node: ' + e.message + ')'); }
if (LOI_GIA) { const t = VV.lay('cam-bien', 'tu'); if (t) t.ve = VV.lay('cam-bien', 'khoang-cach').ve; }     // lỗi giả: cảm biến từ vẽ y hệt tai khoảng cách → mục "hình riêng" phải đỏ

console.log('A. Part vector "tu"');
{
  const t = VV.lay('cam-bien', 'tu');
  kiem('VeVector có cam-bien "tu": hamGoc đúng hai hàm front_metal / front_pole, gắn ổ hông (hong / hongTrai / hongPhai)', !!t && J(t.hamGoc) === J(['front_metal', 'front_pole']) && J(t.gan) === J(['hong', 'hongTrai', 'hongPhai']), J(t && { hamGoc: t.hamGoc, gan: t.gan }));
  const ve = (cfg, st, h) => { VV.xoaDem(); const cv = VV.robot(cfg, st, h || 0, 84); return cv ? cv.getContext().lenh.join('\n') : null; };
  const xeTu = ve({ than: 'hai-banh', camBien: [{ ma: 'tu', o: 'hong' }] }, {}), xeKc = ve({ than: 'hai-banh', camBien: [{ ma: 'khoang-cach', o: 'hong' }] }, {}), xeTran = ve({ than: 'hai-banh' }, {});
  const xeTuDoc = ve({ than: 'hai-banh', camBien: [{ ma: 'tu', o: 'hong' }] }, { camBien: { bat: true } });
  kiem('hai bánh + cảm biến từ vẽ được, hình KHÁC tai khoảng cách và khác xe trần; đang đọc (bat) khác đứng yên', !!xeTu && xeTu !== xeKc && xeTu !== xeTran && xeTuDoc !== xeTu, [xeTu && xeTu.length, xeKc && xeKc.length].join('/'));
  const caHai = ve({ than: 'hai-banh', camBien: [{ ma: 'khoang-cach', o: 'hong' }, { ma: 'tu', o: 'hong' }] }, {});
  kiem('gắn cả khoảng cách lẫn từ cùng ổ hông: ghép được (hai part chồng ở hông), hình khác chỉ một part', !!caHai && caHai !== xeTu && caHai !== xeKc);
  kiem('kiemGhep: drone + tu bị từ chối (không có hướng mặt); xích + tu được', /Drone không gắn được/.test(loi(() => VV.kiemGhep({ than: 'drone', camBien: [{ ma: 'tu', o: 'hong' }] })) || '') && loi(() => VV.kiemGhep({ than: 'xich', camBien: [{ ma: 'tu', o: 'hongTrai' }] })) === null);
  const src = fs.readFileSync(path.join(day, 'game', 've-vector-cam.js'), 'utf8');
  kiem('ve-vector-cam.js: đầu dò chữ U hai nhánh N đỏ / S xanh dương (luatVatDo / luatVatXanhDuong), tên part "Cảm biến từ"', /ma: 'tu'[\s\S]*luatVatDo[\s\S]*luatVatXanhDuong/.test(src) && /ten: 'Cảm biến từ/.test(src));
}

console.log('B. Lắp ráp, thẻ bộ phận, VeRobot, lõi');
{
  const tu = LapRap.tim('camBien', 'tu');
  kiem('lap-rap: "tu" là part "tu", chỉ hai hàm, tên "Cảm biến từ", ổ hông, giá giữ 2', !!tu && tu.part === 'tu' && J(tu.ham) === J(['front_metal', 'front_pole']) && tu.ten === 'Cảm biến từ' && tu.o === 'hong' && tu.gia === 2, J(tu));
  kiem('lap-rap kiemGhep: hai bánh + tu được; nhện + tu, drone + tu vẫn sai (không hướng mặt)', LapRap.kiemGhep({ than: 'hai-banh', tay: null, camBien: 'tu' }).ok && !LapRap.kiemGhep({ than: 'nhen', tay: null, camBien: 'tu' }).ok && !LapRap.kiemGhep({ than: 'drone', tay: null, camBien: 'tu' }).ok);
  const ad = LapRap.apDung({ ma: 'tam', ten: 'x', san: ['..'], lapRap: { than: ['hai-banh'], tay: ['nam-cham'], camBien: ['tu'], nganSach: 9, cachLap: [] } }, { than: 'hai-banh', tay: 'nam-cham', camBien: 'tu' });
  kiem('apDung hai bánh + nam châm + tu: robot.camBien [{ tu, hong }], hamGoc có front_metal / front_pole và KHÔNG có front_clear (từ không còn kèm khoảng cách)', J(ad.robot.camBien) === J([{ ma: 'tu', o: 'hong' }]) && ad.hamGoc.includes('front_pole') && !ad.hamGoc.includes('front_clear'), J(ad.robot) + ' ' + ad.hamGoc.join(','));
  const nd = GTP.noiDung('tu', ['front_metal', 'front_pole'], [], 'hai-banh');
  kiem('thẻ bộ phận "tu": tên "Cảm biến từ", mô tả nói đầu dò ở hông / sắt hay nam châm, không còn "gắn cạnh cảm biến khoảng cách"', nd.ten === 'Cảm biến từ' && /đầu dò/i.test(nd.moTa) && /sắt hay nam châm/.test(nd.moTa) && !/gắn cạnh/.test(nd.moTa), J(nd.moTa));
  if (VeRobot && VeRobot.cauHinhCua) {
    const cuMan = { loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait', 'magnet_n', 'magnet_off', 'front_clear', 'front_metal', 'front_pole'], robot: { than: 'hai-banh', tay: 'nam-cham', camBien: [{ ma: 'khoang-cach', o: 'hong' }] } };
    const moiMan = { loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait', 'magnet_n', 'magnet_off', 'front_metal', 'front_pole'], robot: { than: 'hai-banh', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] } };
    const khongKhai = { loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait', 'front_pole'], robot: { than: 'hai-banh', tay: null, camBien: [] } };
    kiem('VeRobot.cauHinhCua: màn cũ (khai khoang-cach + front_metal) KHÔNG lắp thêm tu (hình cũ y nguyên); màn mùa 3 khai tu thì có tu; có front_pole mà không khai cảm biến hông thì tự lắp tu',
      J(VeRobot.cauHinhCua(cuMan).camBien.map((c) => c.ma)) === J(['khoang-cach']) && J(VeRobot.cauHinhCua(moiMan).camBien.map((c) => c.ma)) === J(['tu']) && J(VeRobot.cauHinhCua(khongKhai).camBien.map((c) => c.ma)) === J(['tu']),
      J([VeRobot.cauHinhCua(cuMan).camBien, VeRobot.cauHinhCua(moiMan).camBien, VeRobot.cauHinhCua(khongKhai).camBien]));
  } else kiem('VeRobot.cauHinhCua nạp được ở Node', false, 'không nạp được ve-robot.js');
  const kq = SanHoc.chay({ loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'], mucTieu: 'toi-co', san: ['..o.'], vatChat: ['..N.'], batDau: { x: 0, y: 0, huong: 1 }, camBien: [{ ma: 'tu', o: 'hong' }] }, 'if front_pole() == "N":\n    magnet_s()\nwait()\n');
  kiem('lõi: màn khai camBien tu (không khoang-cach) + front_pole() chạy, đọc "N" rồi bật S và hút vật nam châm N (khác cực)', kq.namCham && kq.namCham.cuc === 'S' && kq.vat[0].trangThai === 'cam', J({ nc: kq.namCham, vat: kq.vat }));
  kiem('lõi: drone + front_metal vẫn lỗi cấu hình; nhện + front_pole vẫn lỗi', /không gắn cảm biến/.test(loi(() => SanHoc.chay({ loaiRobot: 'drone', hamGoc: ['go_up', 'wait', 'front_metal'], san: ['..'], batDau: { x: 0, y: 0, huong: 1 } }, 'wait()\n')) || '') && /không gắn cảm biến/.test(loi(() => SanHoc.chay({ loaiRobot: 'nhen', hamGoc: ['go_up', 'wait', 'front_pole'], san: ['..'], batDau: { x: 0, y: 0, huong: 1 } }, 'wait()\n')) || ''));
}

console.log('\n' + (hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) : 'Đạt ' + dat + ' / ' + dat) + (LOI_GIA ? ' (--loi-gia: phải HỎNG)' : ''));
process.exit(hong ? 1 : 0);

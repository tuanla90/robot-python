/* ============================================================================
   kiem-ve-mua-9.mjs — máy kiểm GÓI VẼ SÂN mùa 9 (M9H1, 4/11): mọi vật / sự kiện mới của lõi mùa 9 (hoc/san-hoc.js, M9B1 / M9B2 / M9C1 / M9C2) có chỗ vẽ trong hoc/game/san-ve.js.
   Khuôn theo hoc/kiem-ve-mua-song-cang.mjs: chạy SÂN MẪU thật qua SanHoc.chay (sân lấy từ hoc/kiem-lai-mua-9.mjs), gom mọi mã sự kiện, đòi mỗi mã có tên trong san-ve.js;
   rồi kiểm theo mã nguồn: vật mới (người, trạm cứu, thác, cát, container trôi, bè sạc, phao, container lấp hố) được nạp và vẽ, hoạt cảnh có bước riêng (NHIP_9),
   đồng bộ cuối nhịp theo vết, màn cũ không đổi (mọi lớp mới chỉ bật khi cfg có lớp đó).
   Chạy: node hoc/kiem-ve-mua-9.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));
const doc = (p) => fs.readFileSync(path.join(day, p), 'utf-8');
const sv = doc('game/san-ve.js'), mc = doc('game/man-choi.js'), vs = doc('game/ve-vector-vat-song.js');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const co = (src, re) => (re instanceof RegExp ? re : new RegExp(re.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).test(src);

/** Robot cách lắp `cach` trên màn mở lai `lai` (như kiem-lai-mua-9.mjs). */
function chay(lai, cach, san, batDau, code, them) {
  const m = LapRap.apDung(Object.assign({ ma: 'tam.' + lai, san, batDau, lapRap: { moLai: [lai] } }, them || {}), cach);
  return SanHoc.chay(Object.assign({ san: m.san, batDau: m.batDau, loaiRobot: m.loaiRobot, hamGoc: m.hamGoc, camBien: m.robot.camBien, pin: m.pin, phanCung: SanHoc.phanCungCua(m) }, them || {}), code);
}
const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const TIEN = 'left_move()\nright_move()\nwait()\n';
const XUONG = BANH.concat(['cast_net', 'drop_net']);
const BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
const BINH_XIT = 'go_right()\ngo_right()\nspray()\ngo_right()\ngo_down()\ngo_right()\ngo_right()\nspray()\ngo_down()\ngo_right()\n';   // M9L15: qua rào tới lửa (2, 0), xịt; ra van V (5, 1) giữa nước, xịt; về cờ
const XIT_NUT = 'go_right()\nspray()\nwait()\ngo_right()\nspray()\nwait()\nspray()\nwait()\nspray()\nwait()\n';   // M9L15: xịt nút N (1, 0), hai lần hụt, lần thứ tư hết bình (3 lần)
const CAU = ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'pick_up', 'set_down'];

/* ---------- 1. sự kiện lõi ↔ san-ve.js */
console.log('\n== 1. Sự kiện lõi mùa 9 phát ra đều có chỗ trong san-ve.js ==');
const SAN_MAU = [
  ['R rắc cát (xe + bộ gieo hạt)', () => chay('R', { than: 'hai-banh', tay: 'son' }, ['..I.F', '.....'], { x: 2, y: 0, huong: 1 }, 'ink("yellow")\ndot()\nwait()\n' + TIEN + 'left_back()\nright_back()\nwait()\n')],
  ['R rắc cát (drone)', () => chay('R', { than: 'drone', tay: 'son' }, ['.I.', '..F'], { x: 0, y: 0 }, 'go_right()\nink("yellow")\ndot()\nwait()\n')],
  ['L1 cẩu + nam châm hút / thả', () => chay('L1', { than: 'cau', tay: 'nam-cham' }, ['.....', '.....', '.#o..', '....F'], { x: 0, y: 2, nac: 1, tam: 1 }, 'extend()\nmagnet_n()\nswing_left()\nmagnet_off()\n', { vatChat: ['.....', '.....', '..s..', '.....'] })],
  ['L8 cẩu + gầu ngoạm / thả', () => chay('L8', { than: 'cau', tay: 'kep' }, ['.....', '.....', '.#o..', '....F'], { x: 0, y: 2, nac: 1, tam: 1 }, 'extend()\ngrab()\nswing_left()\nrelease()\n')],
  ['L8 gầu hụt (thùng nặng)', () => chay('L8', { than: 'cau', tay: 'kep' }, ['.....', '.....', '.#H..', '....F'], { x: 0, y: 2, nac: 1, tam: 1 }, 'extend()\ngrab()\n')],
  ['L2 container trôi + lưới', () => chay('L2', { than: 'xuong', tay: 'day-keo', camBien: 'quet-ma' }, ['~~~~~', '~~~B~', '~~~~Q'], { x: 1, y: 1, huong: 1 }, 'a = read_code()\ncast_net()\nwait()\n', { contTroi: [{ x: 3, y: 1, so: 12 }] })],
  ['T2 container lấp hố', () => SanHoc.chay({ san: ['.....', '.#u#.', '.....', '....F'], contLapHo: true, chong: [{ x: 0, y: 0, cont: [{ so: 5 }] }], doi: [
    { batDau: { x: 2, y: 0, nac: 3, tam: 2 }, loaiRobot: 'cau', hamGoc: CAU }, { batDau: { x: 2, y: 3, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH }] },
    ['pick_up()\nswing_left()\nretract()\nset_down()\n', 'wait()\nwait()\nwait()\nwait()\n' + TIEN + TIEN])],
  ['L3 xe tời bờ kéo bè', () => chay('L3', { than: 'hai-banh', tay: 'day-keo' }, ['.~~B', '...F'], { x: 0, y: 0, huong: 1 }, 'set_length(3)\ncast_net()\nwait()\n')],
  ['L3 xe tời bờ hụt (hết tầm)', () => chay('L3', { than: 'hai-banh', tay: 'day-keo' }, ['.~~B', '...F'], { x: 0, y: 0, huong: 1 }, 'cast_net()\nwait()\n')],
  ['P người tự đi về trạm', () => SanHoc.chay({ san: ['.....', '....F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 0 }] }, 'wait()\n')],
  ['P người chờ robot chắn lối', () => SanHoc.chay({ san: ['.....', '....F'], batDau: { x: 1, y: 0, huong: 2 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 0 }] }, 'wait()\nwait()\n' + TIEN)],
  ['P người trôi xa (mép sân)', () => SanHoc.chay({ san: ['~~~~', '....', '...F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 2 }], dong: [0, 1, 2, 3].map((x) => ({ x, y: 0, huong: 1, suc: 1 })) }, 'wait()\nwait()\nwait()\nwait()\nwait()\n')],
  ['P xuồng kéo người lên bờ', () => SanHoc.chay({ san: ['~~~~~', '~~~~~', '.....', '....F'], batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'xuong', hamGoc: XUONG, mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 1 }], tramCuu: [{ x: 4, y: 3 }] }, 'cast_net()\nwait()\nwait()\n')],
  ['P cấm phun vào người', () => SanHoc.chay({ san: ['.....', '....F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH.concat(['spray']), mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 1 }], tramCuu: [{ x: 3, y: 0 }] }, 'spray()\nwait()\n')],
  ['P người trôi bị chặn', () => SanHoc.chay({ san: ['~~#~', '....', '...F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 1, y: 0 }], tramCuu: [{ x: 3, y: 2 }], dong: [{ x: 1, y: 0, huong: 1, suc: 1 }] }, 'wait()\nwait()\n')],
  ['T3 vòi phun gạt van', () => SanHoc.chay({ san: ['.V...', '~K~~~', '#####'], doi: [{ batDau: { x: 0, y: 0, huong: 1 }, hamGoc: BANH.concat(['spray']) }, { batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'xuong', hamGoc: BANH }] },
    ['spray()\nwait()\n', 'wait()\n' + TIEN + TIEN + TIEN])],
  ['T4 bè sạc trôi, drone đáp', () => SanHoc.chay({ san: ['~B~~', '....', '...F'], batDau: { x: 0, y: 1 }, loaiRobot: 'drone', hamGoc: BAY.concat(['land', 'take_off']), pin: 6, dong: [{ x: 1, y: 0, huong: 1, suc: 1 }, { x: 2, y: 0, huong: 1, suc: 1 }], beSac: [{ x: 1, y: 0 }] }, 'go_right()\ngo_right()\ngo_right()\ngo_up()\nland()\n')],
  ['T4 drone đậu theo bè', () => SanHoc.chay({ san: ['~B~~', '....', '...F'], batDau: { x: 1, y: 0 }, loaiRobot: 'drone', hamGoc: BAY.concat(['land', 'take_off']), pin: 6, dong: [{ x: 1, y: 0, huong: 1, suc: 1 }, { x: 2, y: 0, huong: 1, suc: 1 }], beSac: [{ x: 1, y: 0 }] }, 'land()\nwait()\nwait()\n')],
  ['L10 drone thả phao, người bám, xuồng kéo', () => SanHoc.chay({ san: ['~~~~', '~~~~', '~~~~', '....'], mucTieu: 'cuu-nguoi', nguoi: [{ x: 1, y: 2 }], tramCuu: [{ x: 0, y: 3 }], thac: [{ x: 3, y: 2 }], dong: [{ x: 1, y: 2, huong: 1, suc: 1 }, { x: 2, y: 2, huong: 1, suc: 1 }],
    doi: [{ batDau: { x: 2, y: 2 }, loaiRobot: 'drone', hamGoc: BAY.concat(['cast_net', 'drop_net']) }, { batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'xuong', hamGoc: XUONG }] }, ['cast_net()\nwait()\n', TIEN + TIEN + 'left_move()\nwait()\ncast_net()\nwait()\n'])],
  ['L10 phao: thu, hụt', () => chay('L10', { than: 'drone', tay: 'day-keo' }, ['~~~~~', '~~~~~', '...F.'], { x: 2, y: 0 }, 'cast_net()\nwait()\ndrop_net()\nwait()\ncast_net()\nwait()\ncast_net()\nwait()\ngo_down()\ngo_down()\ndrop_net()\nwait()\n', { nguoi: [{ x: 1, y: 2 }], tramCuu: [{ x: 0, y: 2 }] })],
  ['L10 thác', () => SanHoc.chay({ san: ['~~~~', '....', '...F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 2 }], thac: [{ x: 1, y: 0 }], dong: [{ x: 0, y: 0, huong: 1, suc: 1 }] }, 'wait()\nwait()\n')],
  ['L9 giỏ vớt người, đặt lên bờ', () => chay('L9', { than: 'cau', tay: 'day-keo' }, ['~~~~~', '.....', '.....'], { x: 2, y: 1, nac: 0, tam: 1 }, 'cast_net()\nswing_left()\ndrop_net()\n', { mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 0 }], tramCuu: [{ x: 0, y: 2 }] })],
  ['L9 giỏ hụt (đặt xuống nước)', () => chay('L9', { than: 'cau', tay: 'day-keo' }, ['~~~~~', '.....', '.....'], { x: 2, y: 1, nac: 0, tam: 1 }, 'cast_net()\ndrop_net()\n', { mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 0 }], tramCuu: [{ x: 0, y: 2 }] })],
  // M9L15 (4/11): drone + bình xịt bụng — xịt lửa, van giữa nước; xịt nút N, xịt hụt, hết bình
  ['L15 bình xịt: lửa, van', () => chay('L15', { than: 'drone', tay: 'hoi' }, ['.=.....', '.=..~V~', '......F'], { x: 0, y: 0 }, BINH_XIT, { lua: [{ x: 2, y: 0, suc: 1 }] })],
  ['L15 bình xịt: nút, hụt, hết bình', () => chay('L15', { than: 'drone', tay: 'hoi' }, ['.N...', '....F'], { x: 0, y: 0 }, XIT_NUT)]
];
const tenSK = new Set(), thieu = [], nguonSK = {};
function gom(vet, ten) { (vet || []).filter((e) => e.loai === 'nhip').forEach((e) => (e.suKien || []).forEach((s) => { tenSK.add(s.ma); (nguonSK[s.ma] = nguonSK[s.ma] || ten); })); }
for (const [ten, f] of SAN_MAU) {
  let r = null, loi = '';
  try { r = f(); } catch (e) { loi = e.message; }
  kiem('sân mẫu "' + ten + '" chạy được trong lõi', !!r && !loi, loi || '');
  if (!r) continue;
  gom(r.vet, ten); (r.doi || []).forEach((d) => gom(d.vet, ten));
}
const CU = ['tien', 'lui', 'quay-trai', 'quay-phai', 'quay-dau', 'dam-tuong', 'toi-co', 'dung-yen', 'doc-cam-bien', 'xong-dua-vat'];
const MA_9 = ['rac-cat', 'cau-hut', 'cau-tha', 'gau-ngoam', 'gau-tha', 'gau-hut', 'lap-ho', 'nguoi-buoc', 'nguoi-cho', 'nguoi-troi', 'nguoi-troi-chan', 'nguoi-len-bo', 'nguoi-toi-tram', 'nguoi-troi-xa', 'xong-cuu-nguoi', 'cham-nguoi',
  'phun-van', 'be-sac-di', 'theo-be', 'tha-phao', 'bam-phao', 'thu-phao', 'phao-hut', 'gio-vot', 'gio-dat', 'gio-hut', 'xit-bung', 'xit-hut'];
const thieuMau = MA_9.filter((k) => !tenSK.has(k));
kiem('sân mẫu phát ra đủ ' + MA_9.length + ' mã sự kiện mới của mùa 9', thieuMau.length === 0, 'sân mẫu chưa phát: ' + thieuMau.join(' '));
for (const ma of tenSK) if (!co(sv, "'" + ma + "'")) thieu.push(ma + ' (' + nguonSK[ma] + ')');
kiem('mọi sự kiện của ' + SAN_MAU.length + ' sân mẫu đều có tên trong san-ve.js (' + tenSK.size + ' mã)', thieu.length === 0, 'thiếu: ' + thieu.join(', '));

/* ---------- 2. chạy san-ve.js THẬT (canvas giả, đồng hồ ảo) phát lại vết của sân mẫu: không lỗi, vẽ đúng hình */
console.log('\n== 2. san-ve.js thật phát lại vết sân mẫu: không lỗi, vật mới hiện lên đúng hình ==');
const vm = await import('node:vm');
function taoKhung() {
  let dongHo = 1000, hangCho = [], soHen = 0, hat = 4242;
  const NOOP = ['beginPath', 'closePath', 'moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo', 'arc', 'arcTo', 'ellipse', 'rect', 'fill', 'stroke', 'fillRect', 'strokeRect', 'clearRect', 'drawImage', 'clip', 'fillText', 'strokeText', 'setLineDash', 'putImageData', 'roundRect'];
  class Ctx {
    constructor(cv) { this.canvas = cv; this.m = [1, 0, 0, 1, 0, 0]; this.ngan = []; this.ve = 0; }
    save() { this.ngan.push(this.m.slice()); } restore() { const m = this.ngan.pop(); if (m) this.m = m; }
    setTransform(a, b, c, d, e, f) { this.m = [a, b, c, d, e, f]; } translate() {} scale() {} rotate() {}
    getTransform() { const m = this.m; return { a: m[0], b: m[1], c: m[2], d: m[3], e: m[4], f: m[5] }; }
    createLinearGradient() { return { addColorStop() {} }; } createRadialGradient() { return { addColorStop() {} }; }
    measureText(s) { return { width: String(s).length * 5 }; }
    getImageData(x, y, w, h) { return { width: w, height: h, data: new Uint8ClampedArray(Math.max(0, w * h * 4)) }; }
    createImageData(w, h) { if (typeof w === 'object') { h = w.height; w = w.width; } return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; }
  }
  for (const k of NOOP) Ctx.prototype[k] = function () { this.ve++; };
  class Cv {
    constructor() { this.__cv = true; this.width = 300; this.height = 150; this.style = {}; this.classList = { add() {}, remove() {}, toggle() {} }; this.__ctx = new Ctx(this); }
    getContext() { return this.__ctx; }
    get offsetWidth() { return parseFloat(this.style.width) || 0; } get offsetHeight() { return parseFloat(this.style.height) || 0; }
    get offsetLeft() { return 7; } get offsetTop() { return 7; }
    getBoundingClientRect() { return { left: 7, top: 7, width: this.offsetWidth, height: this.offsetHeight }; }
    closest() { return null; } setAttribute() {} appendChild() {} insertBefore() {}
  }
  const cha = { style: { setProperty() {} }, firstChild: null, clientWidth: 232, clientHeight: 232, insertBefore() {}, appendChild() {}, querySelector() { return null; } };
  const ctx = {
    console: { log() {}, warn() {}, error() {}, info() {} }, document: { createElement() { return new Cv(); }, querySelector() { return null; }, body: {} }, devicePixelRatio: 2,
    location: { search: '?ve=vector' }, localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    performance: { now: () => dongHo }, setTimeout: (f, ms) => { hangCho.push({ t: dongHo + Math.max(0, ms || 0), f, id: ++soHen }); return soHen; }, clearTimeout() {}, requestAnimationFrame: () => 0,
    Math: Object.create(Math), JSON, Object, Array, String, Number, Boolean, Date, Error, RegExp, Map, Set, WeakMap, Symbol, Promise, parseFloat, parseInt, isFinite, isNaN, Uint8ClampedArray
  };
  ctx.Math.random = () => { hat = (Math.imul(hat, 1103515245) + 12345) >>> 0; return (hat >>> 8) / 16777216; };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  const html = doc('game/choi.html');
  const ds = [...html.matchAll(/<script src="([\w./-]+\.js)"/g)].map((m) => m[1]).filter((f) => /^(bang-mau|chu|ve|ve-vector[\w-]*|ve-robot|san-ve|part\/[\w-]+)\.js$/.test(f));
  for (const f of ds) vm.runInContext(doc('game/' + f), ctx, { filename: f });
  if (ctx.VeVector.datCheDo) ctx.VeVector.datCheDo('vector');
  const hinh = {}, goc = ctx.VeVector.vat;                                                     // đếm hình vật đã vẽ: ma → [trạng thái JSON]
  ctx.VeVector.vat = function (ma, px, st) { (hinh[ma] = hinh[ma] || new Set()).add(JSON.stringify(st || {})); return goc.apply(this, arguments); };
  async function chayToi(p, field) {
    let xong = false, loi = null; p.then(() => { xong = true; }, (e) => { xong = true; loi = e; });
    let vong = 0, khungSau = dongHo;
    while (!xong && vong++ < 100000) {
      await new Promise((r) => setImmediate(r));
      if (xong) break;
      hangCho.sort((a, b) => a.t - b.t || a.id - b.id);
      const q = hangCho.shift(), den = q ? q.t : dongHo + 16;
      while (khungSau + 16 <= den) { khungSau += 16; dongHo = khungSau; field.draw(dongHo); }
      dongHo = Math.max(dongHo, den);
      if (q) q.f();
    }
    if (loi) throw loi;
  }
  return { ctx, Cv, cha, chayToi, hinh };
}
const DA_PHAT_9 = new Set(), BO_QUA_9 = {};                                                   // mã đã qua nhipMua9 / mã lọt xuống cuối nhipMua9 (không có nhánh)
/** Phát vết r (một robot hay r.doi) của cfg qua Field thật; trả { F, hinh, loi }. */
async function phatSan(cfg, r) {
  const K = taoKhung(), cv = new K.Cv(); cv.parentNode = K.cha;
  let F = null, loi = null; const dem = {};
  const P = K.ctx.SanVe.Field.prototype;                                                       // đếm lời gọi các hàm vẽ mùa 9 (veTreoCau9: chỉ khi có vật treo; veDayPhao: chỉ dây của xe tời bờ)
  ['veTreoCau9', 'veCat9', 'veTram9', 'veThac9', 'veDayPhao', 'veNguoi9', 'veSan9', 'veXitBung9'].forEach((ten) => { const f = P[ten]; if (!f) return; P[ten] = function () {
    const tinh = ten === 'veTreoCau9' ? !!(this.vis.cau && this.vis.cau.mang) : ten === 'veDayPhao' ? !!(this.dayKeo && this.dayKeo.toi9 !== undefined) : true;
    if (tinh) dem[ten] = (dem[ten] || 0) + 1; return f.apply(this, arguments); }; });
  const nm0 = P.nhipMua9; P.nhipMua9 = function (s) { DA_PHAT_9.add(s.ma); return nm0.apply(this, arguments); };
  const nmm = P.nhipMuaMoi; P.nhipMuaMoi = function (s) { if (s.ma === 'troi' && (this.theoBe9 || []).length) DA_PHAT_9.add('theo-be@troi'); return nmm.apply(this, arguments); };   // mã nào đã thật sự đi qua nhipMua9
  try {
    F = new K.ctx.SanVe.Field(cv, {}); F.boQua9 = BO_QUA_9; F.nap(cfg);
    const vets = r.doi ? r.doi.map((d) => d.vet.filter((e) => e.loai === 'nhip')) : [r.vet.filter((e) => e.loai === 'nhip')];
    const n = Math.max(...vets.map((v) => v.length));
    for (let i = 0; i < n; i++) for (let k = 0; k < vets.length; k++) { if (!vets[k][i]) continue; if (F.xe) F.chonXe(k); await K.chayToi(F.phatNhip(vets[k][i], 300), F); }
    if (F.xe) F.chonXe(0);
    for (let t = 0; t < 30; t++) F.draw(K.ctx.performance.now() + t * 16);
  } catch (e) { loi = e.stack || e.message; }
  return { F, hinh: K.hinh, loi, dem };
}
const coHinh = (h, ma, st) => !!(h[ma] && (st === undefined || [...h[ma]].some((s) => Object.entries(st).every(([k, v]) => JSON.parse(s)[k] === v))));
/** Cấu hình sân như man-choi.js cauHinhSan (một robot / đội) cho cfg lõi. */
function cfgVe(cfgLoi, robot) {
  const c = Object.assign({}, cfgLoi);
  if (cfgLoi.doi) c.doi = cfgLoi.doi.map((d) => ({ robot: d.robot || { than: d.loaiRobot === 'cau' ? 'cau' : d.loaiRobot === 'xuong' ? 'xuong' : d.loaiRobot === 'drone' ? 'drone' : 'hai-banh', tay: d.tay || null, camBien: [] }, batDau: d.batDau, loaiRobot: d.loaiRobot || 'banh', pin: d.pin }));
  if (!cfgLoi.doi) { c.robot = robot || { than: cfgLoi.loaiRobot === 'drone' ? 'drone' : cfgLoi.loaiRobot === 'xuong' ? 'xuong' : cfgLoi.loaiRobot === 'cau' ? 'cau' : 'hai-banh', tay: null, camBien: [] }; c.batDau = cfgLoi.batDau; }
  return c;
}
/** Như chay() nhưng trả cả cấu hình (để nạp sân vẽ). */
function chayCfg(lai, cach, san, batDau, code, them) {
  const m = LapRap.apDung(Object.assign({ ma: 'tam.' + lai, san, batDau, lapRap: { moLai: [lai] } }, them || {}), cach);
  const cfg = Object.assign({ san: m.san, batDau: m.batDau, loaiRobot: m.loaiRobot, hamGoc: m.hamGoc, camBien: m.robot.camBien, pin: m.pin, phanCung: SanHoc.phanCungCua(m) }, them || {});
  return { cfg, robot: m.robot, r: SanHoc.chay(cfg, code) };
}
const CA_VE = [
  { ten: 'P người tự đi về trạm', mk: () => { const cfg = { san: ['.....', '....F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 0 }] }; return { cfg, r: SanHoc.chay(cfg, 'wait()\n') }; },
    kiem: (h, F, d) => d.veTram9 > 0 && coHinh(h, 'nguoi-cuu', { vay: 1 }) && coHinh(h, 'nguoi-cuu', { tram: true }) && F.objs.find((o) => o.noi === 'nguoi').x === 3 && F.objs.find((o) => o.noi === 'nguoi').nguoi.toiTram, mo: 'người vẫy tay khi chờ, khoác chăn khi tới trạm (3, 0), vị trí đúng vết' },
  { ten: 'P xuồng kéo người lên bờ', mk: () => { const cfg = { san: ['~~~~~', '~~~~~', '.....', '....F'], batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'xuong', hamGoc: XUONG, mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 1 }], tramCuu: [{ x: 4, y: 3 }] }; return { cfg, robot: { than: 'xuong', tay: 'day-keo', camBien: [] }, r: SanHoc.chay(cfg, 'cast_net()\nwait()\nwait()\n') }; },
    kiem: (h, F) => coHinh(h, 'nguoi-cuu', { nuoc: true }) && coHinh(h, 'nguoi-cuu', { tram: true }) && F.objs[0].nguoi.can === true, mo: 'người dưới nước (áo phao, nửa chìm) rồi lên bờ, về trạm' },
  { ten: 'P người trôi xa', mk: () => { const cfg = { san: ['~~~~', '....', '...F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 2 }], dong: [0, 1, 2, 3].map((x) => ({ x, y: 0, huong: 1, suc: 1 })) }; return { cfg, r: SanHoc.chay(cfg, 'wait()\nwait()\nwait()\nwait()\nwait()\n') }; },
    kiem: (h, F) => F.objs[0].xa9 === true && F.objs[0].x === 3, mo: 'người trôi tới mép: vòng đỏ (xa9), vị trí (3, 0)' },
  { ten: 'P thác', mk: () => { const cfg = { san: ['~~~~', '....', '...F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 2 }], thac: [{ x: 1, y: 0 }], dong: [{ x: 0, y: 0, huong: 1, suc: 1 }] }; return { cfg, r: SanHoc.chay(cfg, 'wait()\nwait()\n') }; },
    kiem: (h, F, d) => d.veThac9 > 0 && F.objs[0].xa9 === true, mo: 'ô thác vẽ bọt đổ (veThac9), người trôi vào thác: vòng đỏ' },
  { ten: 'L10 drone thả phao', mk: () => { const o = chayCfg('L10', { than: 'drone', tay: 'day-keo' }, ['~~~~~', '~~~~~', '...F.'], { x: 2, y: 0 }, 'cast_net()\nwait()\n', { nguoi: [{ x: 1, y: 0 }], tramCuu: [{ x: 0, y: 2 }], dong: [1, 2, 3].map((x) => ({ x, y: 0, huong: 1, suc: 1 })) }); return o; },
    kiem: (h, F) => coHinh(h, 'phao-cuu') && coHinh(h, 'nguoi-cuu', { bam: true }) && F.phao9.length === 1, mo: 'phao trên nước, người bám phao (dang tay)' },
  { ten: 'L2 container trôi', mk: () => chayCfg('L2', { than: 'xuong', tay: 'day-keo', camBien: 'quet-ma' }, ['~~~~~', '~~~B~', '~~~~Q'], { x: 1, y: 1, huong: 1 }, 'a = read_code()\ncast_net()\nwait()\n', { contTroi: [{ x: 3, y: 1, so: 12 }] }),
    kiem: (h) => coHinh(h, 'container-troi', { so: 12 }) && !coHinh(h, 'be-go'), mo: 'bè B thành container số 12 (không vẽ bè gỗ)' },
  { ten: 'T4 bè sạc, drone theo bè', mk: () => { const cfg = { san: ['~B~~', '....', '...F'], batDau: { x: 1, y: 0 }, loaiRobot: 'drone', hamGoc: BAY.concat(['land', 'take_off']), pin: 6, dong: [{ x: 1, y: 0, huong: 1, suc: 1 }, { x: 2, y: 0, huong: 1, suc: 1 }], beSac: [{ x: 1, y: 0 }] }; return { cfg, r: SanHoc.chay(cfg, 'land()\nwait()\nwait()\n') }; },
    kiem: (h, F) => coHinh(h, 'be-sac') && F.vis.x === 3 && F.objs[0].x === 3, mo: 'bè sạc vẽ riêng, drone trôi cùng bè tới (3, 0)' },
  { ten: 'L9 giỏ cứu hộ', mk: () => chayCfg('L9', { than: 'cau', tay: 'day-keo' }, ['~~~~~', '.....', '.....'], { x: 2, y: 1, nac: 0, tam: 1 }, 'cast_net()\nswing_left()\ndrop_net()\n', { mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 0 }], tramCuu: [{ x: 0, y: 2 }] }),
    kiem: (h, F, d) => d.veTreoCau9 > 10 && coHinh(h, 'gio-cuu-ho', { day: true }) && coHinh(h, 'gio-cuu-ho') && F.vis.cau.mang === null && F.objs[0].nguoi.toiTram, mo: 'giỏ treo đầu cần (có người: lưới căng), đặt xuống rồi người về trạm' },
  { ten: 'L1 cẩu nam châm', mk: () => chayCfg('L1', { than: 'cau', tay: 'nam-cham' }, ['.....', '.....', '.#o..', '....F'], { x: 0, y: 2, nac: 1, tam: 1 }, 'extend()\nmagnet_n()\nswing_left()\nmagnet_off()\n', { vatChat: ['.....', '.....', '..s..', '.....'] }),
    kiem: (h, F, d) => d.veTreoCau9 > 10 && F.vis.cau.mang === null && F.objs[0].x === 0 && F.objs[0].y === 0 && F.objs[0].tt === 'dat', mo: 'thanh sắt treo ở đầu cần (veTreoCau9 vẽ vật treo) rồi thả ở (0, 0)' },
  { ten: 'L8 cẩu gầu', mk: () => chayCfg('L8', { than: 'cau', tay: 'kep' }, ['.....', '.....', '.#o..', '....F'], { x: 0, y: 2, nac: 1, tam: 1 }, 'extend()\ngrab()\nswing_left()\nrelease()\n'),
    kiem: (h, F, d) => d.veTreoCau9 > 10 && F.vis.cau.mang === null && F.objs[0].x === 0 && F.objs[0].y === 0, mo: 'thùng treo ở gầu (veTreoCau9) rồi thả ở (0, 0)' },
  { ten: 'R rắc cát', mk: () => chayCfg('R', { than: 'hai-banh', tay: 'son' }, ['..I.F', '.....'], { x: 2, y: 0, huong: 1 }, 'ink("yellow")\ndot()\nwait()\n'),
    kiem: (h, F, d) => !!F.racCat9['2,0'] && d.veCat9 > 0, mo: 'ô (2, 0) có lớp cát (veCat9)' },
  { ten: 'T2 container lấp hố', mk: () => { const cfg = { san: ['.....', '.#u#.', '.....', '....F'], contLapHo: true, chong: [{ x: 0, y: 0, cont: [{ so: 5 }] }], doi: [{ batDau: { x: 2, y: 0, nac: 3, tam: 2 }, loaiRobot: 'cau', hamGoc: CAU }, { batDau: { x: 2, y: 3, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH }] };
    return { cfg, r: SanHoc.chay(cfg, ['pick_up()\nswing_left()\nretract()\nset_down()\n', 'wait()\nwait()\nwait()\nwait()\n' + TIEN + TIEN]) }; },
    kiem: (h, F) => !!F.lapHo9['2,1'] && F.lapHo9['2,1'].so === 5 && coHinh(h, 'container', { so: 5 }), mo: 'hố (2, 1) có container số 5 nằm phẳng' },
  { ten: 'L3 xe tời bờ', mk: () => chayCfg('L3', { than: 'hai-banh', tay: 'day-keo' }, ['.~~B', '...F'], { x: 0, y: 0, huong: 1 }, 'set_length(3)\ncast_net()\nwait()\n'),
    kiem: (h, F, d) => d.veDayPhao > 3 && F.objs[0].x === 1 && F.dayKeo === null, mo: 'dây xe tời bay ra (veDayPhao), bè kéo về (1, 0), dây thu' },
  { ten: 'T3 vòi phun gạt van', mk: () => { const cfg = { san: ['.V...', '~K~~~', '#####'], doi: [{ batDau: { x: 0, y: 0, huong: 1 }, hamGoc: BANH.concat(['spray']), tay: 'hoi' }, { batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'xuong', hamGoc: BANH }] };
    return { cfg, r: SanHoc.chay(cfg, ['spray()\nwait()\n', 'wait()\n' + TIEN]) }; },
    kiem: (h, F) => F.vanT['1,0'] && F.vanT['1,0'].bat === true && F.congT['1,1'].mo === true, mo: 'van (1, 0) bật, cống (1, 1) mở' },
  /* các nhánh hụt / lỗi: chỉ đòi phát hết không lỗi + không vật treo kẹt; độ phủ mã kiểm ở phép sau vòng */
  { ten: 'L8 gầu hụt (thùng nặng)', mk: () => chayCfg('L8', { than: 'cau', tay: 'kep' }, ['.....', '.....', '.#H..', '....F'], { x: 0, y: 2, nac: 1, tam: 1 }, 'extend()\ngrab()\n'),
    kiem: (h, F) => !F.vis.cau.mang, mo: 'gầu ngoạm hụt, không treo gì' },
  { ten: 'P người chờ robot chắn lối', mk: () => { const cfg = { san: ['.....', '....F'], batDau: { x: 1, y: 0, huong: 2 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 0 }] }; return { cfg, r: SanHoc.chay(cfg, 'wait()\nwait()\n' + TIEN) }; },
    kiem: (h, F) => coHinh(h, 'nguoi-cuu', { tram: true }), mo: 'người đứng chờ rồi đi tiếp về trạm' },
  { ten: 'P cấm phun vào người', mk: () => { const cfg = { san: ['.....', '....F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH.concat(['spray']), mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 1 }], tramCuu: [{ x: 3, y: 0 }] }; return { cfg, r: SanHoc.chay(cfg, 'spray()\nwait()\n') }; },
    kiem: (h, F) => coHinh(h, 'nguoi-cuu', {}) || coHinh(h, 'nguoi-cuu', { vay: 1 }), mo: 'tia trúng người: người rung, báo lỗi' },
  { ten: 'L10 phao: thu, hụt', mk: () => chayCfg('L10', { than: 'drone', tay: 'day-keo' }, ['~~~~~', '~~~~~', '...F.'], { x: 2, y: 0 }, 'cast_net()\nwait()\ndrop_net()\nwait()\ncast_net()\nwait()\ncast_net()\nwait()\ngo_down()\ngo_down()\ndrop_net()\nwait()\n', { nguoi: [{ x: 1, y: 2 }], tramCuu: [{ x: 0, y: 2 }] }),
    kiem: (h, F) => coHinh(h, 'phao-cuu', {}) && F.phaoBay9 === null, mo: 'phao thả, thu lại, thả lần hai; không phao bay kẹt giữa chừng' },
  { ten: 'L9 giỏ hụt (đặt xuống nước)', mk: () => chayCfg('L9', { than: 'cau', tay: 'day-keo' }, ['~~~~~', '.....', '.....'], { x: 2, y: 1, nac: 0, tam: 1 }, 'cast_net()\ndrop_net()\n', { mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 0 }], tramCuu: [{ x: 0, y: 2 }] }),
    kiem: (h, F) => coHinh(h, 'gio-cuu-ho', { day: true }), mo: 'giỏ vớt người rồi hụt khi đặt xuống nước' },
  // M9L15 (4/11): bình xịt bụng drone — tia thẳng xuống (veXitBung9), lửa tắt, van bật; nút đổi, hụt '?'
  { ten: 'L15 bình xịt: lửa, van', mk: () => chayCfg('L15', { than: 'drone', tay: 'hoi' }, ['.=.....', '.=..~V~', '......F'], { x: 0, y: 0 }, BINH_XIT, { lua: [{ x: 2, y: 0, suc: 1 }] }),
    kiem: (h, F, d) => d.veXitBung9 > 3 && F.luaT['2,0'].suc === 0 && F.vanT['5,1'] && F.vanT['5,1'].bat === true && !F.vis.xit9 && F.vis.x === 6 && F.vis.y === 2, mo: 'tia nước từ bụng drone (veXitBung9), lửa (2, 0) tắt, van (5, 1) bật, drone tới cờ (6, 2)' },
  { ten: 'L15 bình xịt: nút, hụt, hết bình', mk: () => chayCfg('L15', { than: 'drone', tay: 'hoi' }, ['.N...', '....F'], { x: 0, y: 0 }, XIT_NUT),
    kiem: (h, F, d) => d.veXitBung9 > 3 && F.nutO(1, 0).bat === true && !F.vis.xit9, mo: 'xịt nút N (1, 0): nút đổi; xịt hụt hai lần (dấu ?), lần thứ tư hết bình' }
];
for (const ca of CA_VE) {
  let o = null, loi0 = null; try { o = ca.mk(); } catch (e) { loi0 = e.message; }
  if (!o) { kiem('vẽ "' + ca.ten + '": sân mẫu chạy được', false, loi0); continue; }
  const kq = await phatSan(cfgVe(o.cfg, o.robot), o.r);
  let ok = false; try { ok = !kq.loi && ca.kiem(kq.hinh, kq.F, kq.dem); } catch (e) { kq.loi = kq.loi || e.stack; }
  kiem('vẽ "' + ca.ten + '": phát hết vết không lỗi, ' + ca.mo, ok, kq.loi ? String(kq.loi).split('\n').slice(0, 3).join(' | ') : JSON.stringify(kq.dem) + ' ' + JSON.stringify(Object.fromEntries(Object.entries(kq.hinh).map(([k, v]) => [k, [...v]]))).slice(0, 600));
}
{
  const NH = ((sv.match(/var NHIP_9 = \{([\s\S]*?)\};/) || [, ''])[1].match(/'([a-z0-9-]+)'/g) || []).map((q) => q.replace(/'/g, ''));
  const chuaPhat = NH.filter((ma) => !DA_PHAT_9.has(ma) && !(ma === 'theo-be' && DA_PHAT_9.has('theo-be@troi')));   // theo-be đi cùng 'troi' của bè thì phát trong bước trôi
  kiem('mỗi mã của NHIP_9 đã được phát thật qua nhipMua9 trong các sân vẽ trên', chuaPhat.length === 0, 'chưa phát: ' + chuaPhat.join(' '));
  const lot = Object.keys(BO_QUA_9);
  kiem('không mã nào lọt xuống cuối nhipMua9 (mã nào cũng có nhánh hoạt cảnh riêng)', lot.length === 0, 'lọt: ' + lot.join(' '));
}

/* ---------- 3. màn cũ không đổi: lớp mùa 9 chỉ bật khi sân có lớp / robot mùa 9 */
console.log('\n== 3. Màn cũ không đổi hình: co9 chỉ bật ở sân mùa 9 ==');
{
  const K = taoKhung();
  const coCua = (cfg) => { const cv = new K.Cv(); cv.parentNode = K.cha; const F = new K.ctx.SanVe.Field(cv, {}); F.nap(cfg); return F.co9; };
  const CU_SAN = [
    ['sân thường xe hai bánh', { san: ['....F'], batDau: { x: 0, y: 0, huong: 1 }, robot: { than: 'hai-banh', tay: 'kep', camBien: [] } }],
    ['Bến sông: xuồng + tay lưới, bè', { san: ['~~B~Q'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'xuong', robot: { than: 'xuong', tay: 'day-keo', camBien: [] } }],
    ['Cảng sông: cẩu + móc', { san: ['.....', '..u..'], batDau: { x: 0, y: 0 }, loaiRobot: 'cau', robot: { than: 'cau', tay: 'moc-cau', camBien: [] }, chong: [{ x: 2, y: 0, cont: [{ so: 3 }] }] }],
    ['Hang động: đá ướt I + bánh gai', { san: ['.II.F'], batDau: { x: 0, y: 0, huong: 1 }, robot: { than: 'gai', tay: null, camBien: [] } }],
    ['máy sơn không có ô I', { san: ['....F'], batDau: { x: 0, y: 0, huong: 1 }, robot: { than: 'hai-banh', tay: 'son', camBien: [] } }],
    ['drone + nam châm', { san: ['.o..F'], batDau: { x: 0, y: 0 }, loaiRobot: 'drone', robot: { than: 'drone', tay: 'nam-cham', camBien: [] } }],
    ['Mỏ đá: máy ném lấp hố', { san: ['o.u.F'], batDau: { x: 1, y: 0, huong: 1 }, robot: { than: 'hai-banh', tay: 'nem', camBien: [] } }]
  ];
  const bat = CU_SAN.filter(([, c]) => { try { return coCua(c); } catch (e) { return true; } }).map(([t]) => t);
  kiem('màn cũ (' + CU_SAN.length + ' kiểu sân) không bật lớp mùa 9 (co9 false)', bat.length === 0, bat.join(', '));
  const MOI = [
    ['người + trạm', { san: ['....F'], batDau: { x: 0, y: 0, huong: 1 }, nguoi: [{ x: 2, y: 0 }], tramCuu: [{ x: 3, y: 0 }] }],
    ['container trôi', { san: ['~~B~Q'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'xuong', contTroi: [{ x: 2, y: 0, so: 4 }] }],
    ['cẩu + gầu', { san: ['....'], batDau: { x: 0, y: 0 }, loaiRobot: 'cau', robot: { than: 'cau', tay: 'kep', camBien: [] } }],
    ['xe tời bờ', { san: ['.~~B'], batDau: { x: 0, y: 0, huong: 1 }, robot: { than: 'xich', tay: 'day-keo', camBien: [] } }],
    ['drone thả phao', { san: ['~~~.'], batDau: { x: 0, y: 0 }, loaiRobot: 'drone', robot: { than: 'drone', tay: 'day-keo', camBien: [] } }],
    ['máy sơn + ô I (rắc cát)', { san: ['.I.F'], batDau: { x: 0, y: 0, huong: 1 }, robot: { than: 'hai-banh', tay: 'son', camBien: [] } }],
    ['container lấp hố', { san: ['.u..'], batDau: { x: 0, y: 0 }, loaiRobot: 'cau', robot: { than: 'cau', tay: 'moc-cau', camBien: [] }, contLapHo: true }]
  ];
  const tat = MOI.filter(([, c]) => { try { return !coCua(c); } catch (e) { return true; } }).map(([t]) => t);
  kiem('sân mùa 9 (' + MOI.length + ' kiểu) bật lớp mùa 9 (co9 true)', tat.length === 0, tat.join(', '));
  kiem("'lap-ho' của Mỏ đá (đá lấp hố, không cont) giữ bước chờ cũ: trọng số 1, không hoạt cảnh mới", co(sv, "s.ma === 'lap-ho' ? (s.cont ? 1.4 : 0)") && co(sv, 'if (!s.cont) { await ngu(per); return; }'));
  kiem('van đổi lúc tia trúng (phun-van), các màn khác giữ apVanDoi đầu nhịp', co(sv, 'if (vanEvs.length && !coKeoVan && !coPhunVan) this.apVanDoi(vanEvs);'));
}

/* ---------- 4. nguồn: bảng hoạt cảnh, nạp, đồng bộ, hình, man-choi */
console.log('\n== 4. Mã nguồn: bảng NHIP_9, nạp lớp, đồng bộ vết, hình vật, man-choi.js ==');
{
  const NHIP_9 = (sv.match(/var NHIP_9 = \{([\s\S]*?)\};/) || [, ''])[1].match(/'([a-z0-9-]+)'/g) || [];
  const TUC = (sv.match(/var TUC_THI_9 = \{([\s\S]*?)\};/) || [, ''])[1].match(/'([a-z0-9-]+)'/g) || [];
  const thieuN = MA_9.filter((ma) => !NHIP_9.includes("'" + ma + "'") && !TUC.includes("'" + ma + "'"));
  kiem('mỗi mã mùa 9 có trong NHIP_9 (bước hoạt cảnh) hay TUC_THI_9 (tức thì)', thieuN.length === 0, 'thiếu: ' + thieuN.join(' '));
  const nm = sv.slice(sv.indexOf('nhipMua9: async function'), sv.indexOf('hieuUng9: function'));
  const khongBuoc = NHIP_9.map((q) => q.replace(/'/g, '')).filter((ma) => !nm.includes("'" + ma + "'"));
  kiem('mỗi mã của NHIP_9 có nhánh riêng trong nhipMua9', khongBuoc.length === 0, 'thiếu: ' + khongBuoc.join(' '));
  kiem('phatNhip rẽ NHIP_9 → nhipMua9, bỏ TUC_THI_9 khỏi bước, cuối nhịp hieuUng9 + dongBoMua9 (chỉ khi co9)', co(sv, 'NHIP_9[s.ma]) {') && co(sv, 'await this.nhipMua9(s, per, my, evs, vanEvs);') && co(sv, '!TUC_THI_9[s.ma]') && co(sv, 'if (this.co9) { this.hieuUng9(evs); this.dongBoMua9(e); }'));
  kiem('nap: người thêm SAU vật nổi, TRƯỚC rổ máy ném (thứ tự id của lõi); container trôi / bè sạc đổi bè B', /vatNoi\.forEach\(function \(o\) \{ this\.themVat[\s\S]{0,200}this\.nap9\(cfg\);[\s\S]{0,300}if \(cfg\.roBanDau/.test(sv) && co(sv, "b.noi = 'container'; b.so = q.so") && co(sv, "this.themVat(Math.floor(q.x), Math.floor(q.y), null, null, null, 'nguoi')"));
  kiem('vẽ: lớp sân (veSan9) sau ô, trước vật; người (veNguoi9) trong veVat; vật treo cẩu bỏ khỏi veVat, vẽ ở veTreoCau9 TRƯỚC cần (móc đè lên)',
    co(sv, 'if (this.co9) this.veSan9(g, now);') && co(sv, "if (o.noi === 'nguoi') { if (o.tt === 'dat') this.veNguoi9(g, o, now, rg); continue; }") && co(sv, 'if (this.co9 && this.treoCau9(o.id)) continue;') && /this\.veTreoCau9\(g, cx, cy, now\);[^\n]*\n\s*var r = VeVector\.veCanCau/.test(sv));
  kiem('cẩu lai: không vẽ vật kẹp / sóng từ ở bệ (veVatKep, veSongTu bỏ khi v.cau)', co(sv, 'if (laTayKep(c.robot.tay) && !v.cau) this.veVatKep') && co(sv, 'if (v.nc && !v.cau) {'));
  kiem('xe tời bờ (L3): dây quăng của xe cạn vẽ ở lớp phủ của chính xe đó (dayKeo.toi9)', co(sv, 'if (!xu) this.dayKeo.toi9 = this.xeDang || 0;') && co(sv, 'this.dayKeo.toi9 === (this.xeDang || 0)') && co(sv, 'if (!xu || !xu.keo ||'));
  kiem('T4: drone đậu trượt cùng bè trong bước trôi của bè (theoBe9), theo-be riêng chỉ khi bè không trôi', co(sv, "this.theoBe9 = evs.filter(function (s) { return s.ma === 'theo-be'; });") && co(sv, 'if (tb) { v.x = rx9 + (tb.den.x - rx9) * k;'));
  kiem('dongBoMua9 đọc vết: e.nguoi (x, y, can, toiTram), e.phao, e.racCat, robot.dangMang của cẩu', ['e.nguoi.forEach', 'e.phao.map', 'e.racCat.forEach', 'r.dangMang'].every((k) => co(sv, k)));
  const blk = sv.slice(sv.indexOf('nap9: function'), sv.indexOf('/** Xích: chương trình dừng'));
  kiem('khối mùa 9 của san-ve.js: màu từ BangMau (không mã hex), không fillRect / strokeRect, không emoji', !/#[0-9a-fA-F]{3,8}\b/.test(blk) && !/fillRect|strokeRect/.test(blk) && !/\p{Extended_Pictographic}/u.test(blk));
  kiem('ve-vector-vat-song.js khai hình nguoi-cuu (vẫy / nước / bám / trạm), phao-cuu, container-troi, be-sac, gio-cuu-ho; không mã hex',
    ['nguoi-cuu', 'phao-cuu', 'container-troi', 'be-sac', 'gio-cuu-ho'].every((m) => co(vs, "ma: '" + m + "'")) && co(vs, "{ nuoc: true, bam: true }, { tram: true }") && !/#[0-9a-fA-F]{3,8}\b/.test(vs.replace(/^var BM[^\n]*\n/, '')));
  kiem('man-choi.js cauHinhSan đưa nguoi / tramCuu / thac / contTroi / contLapHo / beSac xuống Field', co(mc, 'nguoi: lm.nguoi || undefined, tramCuu: lm.tramCuu || undefined, thac: lm.thac || undefined, contTroi: lm.contTroi || undefined, contLapHo: !!m.contLapHo') && co(mc, 'beSac: lm.beSac || undefined'));
}

/* ---------- 5. màn giả soát trên trình duyệt (thu-mua-9.js ThuMua9.vao(...)): chạy qua máy chấm thật cham.js, phát đúng sự kiện cần xem */
console.log('\n== 5. Màn giả soát hình (ThuMua9.san9): qua cham.js phát đúng sự kiện ==');
{
  const Cham = require(path.join(day, 'cham.js')), T9 = require(path.join(day, 'game', 'thu-mua-9.js'));
  const CAN = { 'cuu-nguoi': ['keo-vat', 'nguoi-len-bo', 'nguoi-toi-tram', 'xong-cuu-nguoi'], thac: ['nguoi-troi', 'nguoi-troi-xa'], 'rac-cat': ['rac-cat'],
    phao: ['tha-phao', 'bam-phao'], gio: ['gio-vot', 'gio-dat', 'nguoi-toi-tram'], 'nam-cham': ['cau-hut', 'cau-tha'], gau: ['gau-ngoam', 'gau-tha'], 'xe-toi': ['keo-vat'], 'phun-van': ['phun-van', 'cong-doi'],
    'cont-troi': ['doc-cam-bien'], 'be-sac': ['be-sac-di', 'dap', 'sac-pin'], 'lap-ho': ['lap-ho'], 'binh-xit': ['xit-bung', 'lua-tat', 'phun-van', 'toi-co'] };
  kiem('ThuMua9.dsSan9 có đủ ' + Object.keys(CAN).length + ' màn giả', JSON.stringify(T9.dsSan9) === JSON.stringify(Object.keys(CAN)), JSON.stringify(T9.dsSan9));
  for (const ten of Object.keys(CAN)) {
    let ma = new Set(), loi = '';
    try { const m = T9.san9(ten), r = Cham.cham(m, { chinh: m.maMau.chinh, hamCuaMan: [] }, []); ((r.theoSan || [])[0] || {}).vet.forEach((e) => (e.suKien || []).forEach((k) => ma.add(k.ma))); } catch (e) { loi = e.message; }
    const thieu = CAN[ten].filter((k) => !ma.has(k));
    kiem("ThuMua9.vao('" + ten + "'): lời giải nạp sẵn chạy qua cham.js, phát " + CAN[ten].join(' / '), !loi && thieu.length === 0, loi || ('thiếu: ' + thieu.join(' ') + ' (có: ' + [...ma].join(' ') + ')'));
  }
  {                                                                                            // M9L15: lời Việt của bình xịt bụng qua cham.js (xit-hut thông tin, het-dan drone, xit-tham-so)
    const m = T9.san9('binh-xit'), cd = (chinh) => { try { return Cham.cham(m, { chinh, hamCuaMan: [] }, []).chanDoan || []; } catch (e) { return [{ ma: 'nem', loi: e.message }]; } };
    const a = cd(['spray()', 'wait()', 'spray()', 'wait()', 'spray()', 'wait()', 'spray()', 'wait()']), b = cd(['spray("high")', 'wait()']);
    const xh = a.find((c) => c.ma === 'xit-hut'), hd = a.find((c) => c.ma === 'het-dan'), ts = b.find((c) => c.ma === 'xit-tham-so');
    kiem("ThuMua9.vao('binh-xit') qua cham.js: xịt ô trống → 'xit-hut' mức thông tin; lần thứ tư → 'het-dan' lời drone (bình 3 lần); spray(\"high\") → 'xit-tham-so'",
      xh && xh.muc === 'thong-tin' && /dưới bụng không có lửa, van hay nút/.test(xh.loi) && hd && hd.muc === 'loi' && /xịt được 3 lần/.test(hd.loi) && ts && ts.muc === 'loi', JSON.stringify(a.concat(b).map((c) => [c.ma, c.muc])));
  }
  let soDoc = null; try { const m = T9.san9('cont-troi'), r = Cham.cham(m, { chinh: m.maMau.chinh, hamCuaMan: [] }, []); r.theoSan[0].vet.forEach((e) => (e.suKien || []).forEach((k) => { if (k.ma === 'doc-cam-bien' && soDoc === null) soDoc = k.so; })); } catch (e) { soDoc = e.message; }
  kiem("ThuMua9.vao('cont-troi'): qua cham.js, read_code() đọc số container trôi 12 (cham.js đưa contTroi xuống lõi)", soDoc === 12, String(soDoc));
  const ch = doc('cham.js'), chua = ['contTroi', 'beSac', 'contLapHo'].filter((k) => !ch.includes(k));
  if (chua.length) console.log('  (ghi chú) cham.js chưa đưa ' + chua.join(', ') + ' xuống SanHoc.chay: màn thật có lớp này sẽ chạy khác — chưa có màn giả cho chúng (báo cáo M9H1, câu hỏi cho lõi / chấm)');
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);

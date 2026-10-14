/* ============================================================================
   kiem-khay.mjs — máy kiểm KHAY KHỐI LỆNH theo thẻ bộ phận và giới hạn hàm theo màn của "Đường học" (KE-HOACH-CHE-LENH.md §3.4b).
   Gồm:
   - man.gioiHanHam = n (lõi): chương trình chính gọi trực tiếp tối đa n hàm của em KHÁC NHAU; lỗi khung `qua-gioi-han-ham` đúng lời, đúng dòng;
     không khai thì không kiểm; hàm gọi bên trong hàm khác, hàm của màn, lệnh gốc không tính; Xưởng (thuHam) không bị chặn. Dùng màn GIẢ dựng từ một màn thật, không thêm màn thật;
   - TP.theCuaHam: hàm của em vào thẻ theo lệnh gốc nó gọi, kể cả gián tiếp (cảm biến > tay > thân);
   - TP.theMacDinh: thẻ mặc định (hàm đang sửa / hàm màn bắt chế theo lời giải / thân);
   - Palette (game/thanh-phan.js) chạy trên DOM giả: thẻ có mặt đúng lúc (Thân, Tay, Cảm biến, Của màn), tên thẻ theo bộ phận thật, hàm của em vào đúng thẻ, cấu trúc `for` / `while` / `if`
     đặt đúng chỗ, giữ thẻ khi vẽ lại, ◀ ▶ vòng tròn, khối báo lỗi ở thẻ khác thì tự sang thẻ đó, khối BIẾN ở đầu mọi thẻ, khay không co quá một mức (không còn d2 / d3);
   - game/choi.html nạp đủ tệp.
   Chạy: node robotics/hoc/kiem-khay.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
for (const f of ['thu-tu-chuong', 'so-lenh', 'man-chuoi-1', 'man-chuoi-2', 'man-che-xe', 'man-tay-gap', 'man-vong-lap', 'man-bang-chuyen', 'man-tham-so', 'man-nhen', 'man-xich', 'man-omni', 'man-tam-day', 'man-khoang-cach', 'man-mau', 'man-nam-cham', 'man-may-nem', 'man-sung-bong']) require(path.join(day, f + '.js'));
const ManHoc = require(path.join(day, 'man-drone.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const man = (ma) => ManHoc.timMa(ma);

/* ================================================================= 1. GIỚI HẠN HÀM THEO MÀN (lõi) */
console.log('\n== 1. man.gioiHanHam: lỗi khung qua-gioi-han-ham ==');
{
  const KHO = [H('move', ['left_move()', 'right_move()', 'wait()']), H('turn_right', ['left_move()', 'right_back()', 'wait()']), H('turn_left', ['left_back()', 'right_move()', 'wait()']),
    H('u_turn', ['turn_right()', 'turn_right()']), H('dodge_right', ['turn_right()', 'move()', 'turn_left()']), H('back', ['left_back()', 'right_back()', 'wait()']), H('park', ['turn_left()', 'back()', 'u_turn()'])];
  const goc = man('tay-gap.8');                                                    // màn thật làm nền cho màn giả
  const gia = (n, them) => Object.assign({}, goc, { chuong: goc.chuong, gioiHanHam: n }, them || {});
  const cham = (m, chinh, hamMan) => ChamHoc.cham(m, { chinh, hamCuaMan: hamMan || [] }, KHO);
  const loiGH = (kq) => kq.chanDoan.filter((c) => c.ma === 'qua-gioi-han-ham');
  const khungKq = (kq) => kq.theoSan.length === 0 && kq.thang === false && kq.sao === 0;

  kiem('KhungCode.hamEmTrucTiep: tên hàm của em gọi trực tiếp trong chương trình chính, mỗi tên một lần theo thứ tự đầu tiên; bỏ lệnh gốc, range, chú thích',
    J(KhungCode.hamEmTrucTiep({ chinh: ['move()', 'left_move()', 'for i in range(3):', '    turn_right()', 'move()  # lại', '# back()', 'u_turn()'] }, KHO)) === J(['move', 'turn_right', 'u_turn']));
  kiem('hàm của màn che hàm của em cùng tên và không tính vào số hàm của em',
    J(KhungCode.hamEmTrucTiep({ chinh: ['move()', 'turn_left()', 'go_out()'], hamCuaMan: [H('go_out', ['move()']), H('move', ['wait()'])] }, KHO)) === J(['turn_left']));
  kiem('hàm gọi bên trong hàm khác không tính: chương trình chỉ gọi dodge_right() thì có đúng 1 hàm',
    J(KhungCode.hamEmTrucTiep({ chinh: ['dodge_right()'] }, KHO)) === J(['dodge_right']));

  const mauChu = (n, k, ds) => 'Màn này chỉ mang được ' + n + ' hàm của em. Chương trình đang dùng ' + k + ' hàm: ' + ds.join(', ') + '.';
  // không khai gioiHanHam: không giới hạn chung
  const khong = ChamHoc.cham(Object.assign({}, goc, { gioiHanHam: undefined }), { chinh: ['move()', 'turn_right()', 'turn_left()', 'u_turn()', 'dodge_right()', 'back()', 'park()'], hamCuaMan: [] }, KHO);
  kiem('không khai gioiHanHam: gọi 7 hàm của em khác nhau vẫn không báo lỗi giới hạn (không có giới hạn chung)', loiGH(khong).length === 0 && khong.theoSan.length > 0, J(khong.chanDoan.map((c) => c.ma)));
  // vừa đủ
  const du = cham(gia(3), ['move()', 'turn_right()', 'move()', 'u_turn()', 'move()', 'turn_right()']);
  kiem('gioiHanHam 3, chương trình dùng đúng 3 hàm khác nhau (gọi lại nhiều lần): không lỗi, máy vẫn chạy sân', loiGH(du).length === 0 && du.theoSan.length > 0, J(du.chanDoan.map((c) => c.ma)));
  // vượt
  const vuot = cham(gia(3), ['move()', 'back()', 'move()', 'park()', 'dodge_right()', 'u_turn()']);
  const lv = loiGH(vuot)[0];
  kiem('gioiHanHam 3, chương trình dùng 5 hàm: đúng MỘT lỗi qua-gioi-han-ham, mức lỗi, là lỗi khung (máy chưa chạy sân nào)', loiGH(vuot).length === 1 && lv.muc === 'loi' && khungKq(vuot), J(vuot.chanDoan.map((c) => c.ma)));
  kiem('lời lớp 5: "Màn này chỉ mang được 3 hàm của em. Chương trình đang dùng 5 hàm: move, back, park, dodge_right, u_turn."', lv && lv.loi === mauChu(3, 5, ['move', 'back', 'park', 'dodge_right', 'u_turn']), lv && lv.loi);
  kiem('lỗi trỏ vào dòng đầu tiên gọi hàm thứ n + 1 (dodge_right ở dòng 5 của chương trình), kèm gioiHan / dang / ham',
    lv && lv.cho && lv.cho.cot === 'chinh' && lv.cho.dong === 5 && lv.dong === 5 && lv.cot === 'chinh' && lv.gioiHan === 3 && lv.dang === 5 && J(lv.ham) === J(['move', 'back', 'park', 'dodge_right', 'u_turn']), J(lv));
  const mot = cham(gia(3), ['move()', 'back()', 'park()', 'dodge_right()']);
  kiem('đúng 4 hàm (move, back, park, dodge_right) với giới hạn 3: lời đúng ví dụ của kế hoạch, dòng 4',
    loiGH(mot).length === 1 && loiGH(mot)[0].loi === mauChu(3, 4, ['move', 'back', 'park', 'dodge_right']) && loiGH(mot)[0].cho.dong === 4, J(loiGH(mot)));
  // không tính
  const trong = cham(gia(1), ['dodge_right()', 'dodge_right()', 'left_move()', 'right_move()', 'wait()']);
  kiem('gioiHanHam 1: dodge_right() (gọi move, turn_right, turn_left bên trong) + lệnh gốc left_move / right_move / wait: chỉ tính 1 hàm, không lỗi', loiGH(trong).length === 0, J(trong.chanDoan.map((c) => c.ma)));
  const hm = cham(gia(1), ['go_out()', 'move()', 'go_in()'], [H('go_out', ['move()']), H('go_in', ['move()'])]);
  kiem('hàm của màn (go_out, go_in) không tính: giới hạn 1, gọi 2 hàm của màn + 1 hàm của em: không lỗi', loiGH(hm).length === 0, J(hm.chanDoan.map((c) => c.ma)));
  const cho0 = cham(gia(0), ['move()']);
  kiem('gioiHanHam 0: gọi một hàm của em là lỗi ("chỉ mang được 0 hàm")', loiGH(cho0).length === 1 && loiGH(cho0)[0].loi === mauChu(0, 1, ['move']), J(cho0.chanDoan.map((c) => c.loi)));
  const khongHam = cham(gia(0), ['left_move()', 'right_move()', 'wait()']);
  kiem('gioiHanHam 0, chỉ lệnh gốc: không lỗi', loiGH(khongHam).length === 0);
  // chỉ chương trình chính được kiểm, và chỉ hàm của em đang được dùng
  const nhieuKho = cham(gia(3), ['dodge_right()', 'park()']);
  kiem('kho có nhiều hàm hơn giới hạn nhưng chương trình chỉ gọi 2 hàm (chưa kể hàm gọi bên trong): không lỗi', loiGH(nhieuKho).length === 0, J(nhieuKho.chanDoan.map((c) => c.ma)));
  // Xưởng
  const xu = ChamHoc.thuHam(gia(1), { chinh: [], hamCuaMan: [] }, 'park', KHO, {});
  kiem('Xưởng hàm (thuHam) không bị chặn bởi gioiHanHam: sửa park() gọi turn_left, back, u_turn dù màn chỉ cho 1 hàm', !xu.chanDoan.some((c) => c.ma === 'qua-gioi-han-ham'), J(xu.chanDoan.map((c) => c.ma)));
  // lỗi khung khác vẫn đi trước / cùng lúc
  const cung = cham(gia(1), ['move()', 'back()'], []);
  kiem('lỗi khung có mã nằm trong chanDoan của kết quả cham() như tran-khung (mọi lỗi khung có muc "loi")', cung.chanDoan.every((c) => c.muc === 'loi'));
  kiem('mọi màn thật: man.gioiHanHam nếu có thì là số nguyên ≥ 0 (hiện chưa màn nào khai)', ManHoc.danhSach.every((m) => m.gioiHanHam === undefined || (Number.isInteger(m.gioiHanHam) && m.gioiHanHam >= 0)));
  kiem('màn thật không khai gioiHanHam nào thì không bị kiểm: lời giải 3 sao của mọi màn không có lỗi qua-gioi-han-ham',
    ManHoc.danhSach.filter((m) => m.gioiHanHam === undefined).every((m) => {
      const kho = [];
      for (const h of m.loiGiai.hamCuaEmMoi) kho.push(H(h.ten, h.than.slice(), (h.thamSo || []).slice()));
      return !ChamHoc.cham(m, m.loiGiai, kho).chanDoan.some((c) => c.ma === 'qua-gioi-han-ham');
    }));
}

/* ================================================================= DOM GIẢ để chạy game/thanh-phan.js */
class El {
  constructor(tag) { this.tag = tag; this.children = []; this.attrs = {}; this.handlers = {}; this._cls = new Set(); this.style = {}; this.parentNode = null; this._text = ''; this.disabled = false; this.scrollTop = 0; this.clientHeight = 400; this.scrollHeight = 300; this.clientWidth = 40; this.scrollWidth = 40; this.offsetHeight = 300; }
  get className() { return [...this._cls].join(' '); }
  set className(v) { this._cls = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get classList() {
    const s = this._cls;
    return { add: (...c) => c.forEach((x) => s.add(x)), remove: (...c) => c.forEach((x) => s.delete(x)), contains: (c) => s.has(c), toggle: (c, f) => { const on = f === undefined ? !s.has(c) : !!f; if (on) s.add(c); else s.delete(c); return on; } };
  }
  appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
  get firstChild() { return this.children[0] || null; }
  set innerHTML(v) { this.children = []; }
  get innerHTML() { return ''; }
  set textContent(v) { this._text = String(v); this.children = []; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] === undefined ? null : this.attrs[k]; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); }
  click() { (this.handlers.click || []).forEach((fn) => fn({ stopPropagation() {}, preventDefault() {} })); }
  querySelector(sel) { const c = sel.replace(/^\./, ''); const walk = (n) => { for (const k of n.children) { if (k._cls.has(c)) return k; const r = walk(k); if (r) return r; } return null; }; return walk(this); }
  getBoundingClientRect() { return { top: 0, bottom: 0, height: 0 }; }
}
const doc = {
  addEventListener() {}, createElement: (tag) => new El(tag), createTextNode: (s) => { const e = new El('#text'); e._text = String(s); return e; },
  getElementById: () => null, body: new El('body')
};
const ctx = vm.createContext({ console, document: doc, getComputedStyle: () => ({ fontSize: '11px' }), Ve: { ico: () => new El('i') }, SanHoc, KhungCode });
ctx.window = ctx;
for (const f of ['chu.js', 'thanh-phan.js']) vm.runInContext(fs.readFileSync(path.join(day, 'game', f), 'utf8'), ctx, { filename: f });
const TP = ctx.TP;

/** Một khay mới: host (.pal) nằm trong bảng có .bh (tiêu đề) như game. */
function khayMoi(cb) {
  const bang = new El('div'), bh = new El('div'); bh.className = 'bh';
  const tt = new El('span'); tt.className = 'tt'; bh.appendChild(tt);
  const host = new El('div'); host.className = 'pal';
  bang.appendChild(bh); bang.appendChild(host);
  const pal = new TP.Palette(host, Object.assign({ khiChen() {}, khiSua() {}, khiBien() {}, khiMoi() {} }, cb || {}));
  return { pal, host, bh };
}
/** Các nhóm / khối đang hiện trong khay: [{ nhan }, 'ten', …] gom thành chuỗi "## HÀM CỦA EM" / tên khối (đi vào cả khối con trong .g-2c). */
function noiDung(host) {
  const kq = [];
  (function di(n) { for (const c of n.children) { if (c._cls.has('gl')) kq.push('## ' + c.children[0].textContent); else if (c._cls.has('brick')) kq.push(c.getAttribute('data-ten')); else di(c); } })(host);
  return kq;
}
const tenThe = (k) => (k.bh.querySelector('.the-chu') || { textContent: '' }).textContent;
const coThe = (k) => k.bh.querySelector('.pal-the').style.display !== 'none';
const tatCaThe = (k) => { const ds = k.pal.dsThe(); return ds; };
/** Spec của khay màn chơi: y như veKho của game/man-choi.js. */
function specMan(m, kho, hamMan, them) {
  return Object.assign({
    goc: m.hamGoc, loai: m.loaiRobot, vong: TP.coCauTruc(m, 'for'), vongWhile: TP.coCauTruc(m, 'while') && TP.coDieuKienCua(m), cam: TP.camBienCua(m), mau: TP.coMauCua(m), pin: TP.coPinCua(m),
    chuoi: TP.coCauTruc(m, 'for') && (!!m.chuoi || (m.hamGoc || []).some((n) => /^go_/.test(n))), dieuKien: TP.coCauTruc(m, 'if') && TP.coDieuKienCua(m),
    em: (m.moXuong !== false && !m.camHamCuaEm) ? TP.locHamTheoRobot(m, kho) : null, man: hamMan, coNutMoi: true,
    the: TP.theMacDinh({ man: m, kho, hamMan, dangSua: null }), lamMoi: true
  }, them || {});
}
/** Mọi thẻ của một spec: { khoa: nội dung }. Đi vòng tròn bằng ▶ rồi trả khay về thẻ đầu. */
function quetThe(k) {
  const kq = {}, ds = k.pal.dsThe();
  if (ds.length < 2) { kq[k.pal.theHienTai()] = noiDung(k.host); return kq; }
  const nhan = (c) => k.bh.querySelector('.pal-the').children.filter((x) => x._cls.has('cuon-b'))[c];
  for (let i = 0; i < ds.length; i++) { kq[k.pal.theHienTai()] = noiDung(k.host); nhan(1).click(); }
  return kq;
}

const KHO_CH = [
  H('move', ['left_move()', 'right_move()', 'wait()']), H('turn_right', ['left_move()', 'right_back()', 'wait()']), H('turn_left', ['left_back()', 'right_move()', 'wait()']), H('u_turn', ['turn_right()', 'turn_right()']),
  H('dodge_right', ['turn_right()', 'move()', 'turn_left()']),
  H('pick', ['arm_down()', 'grab()', 'arm_up()']), H('drop', ['arm_down()', 'release()', 'arm_up()']), H('carry', ['pick()', 'move()', 'turn_left()', 'drop()']),
  H('go_wall', ['while front_clear():', '    move()']), H('safe_move', ['if front_clear():', '    move()']),
  H('safe_pick', ['go_wall()', 'pick()']), H('rong', [])
];

/* ================================================================= 2. HÀM CỦA EM VÀO THẺ NÀO */
console.log('\n== 2. TP.theCuaHam: hàm của em → thẻ theo lệnh gốc nó gọi ==');
{
  const tim = (ten) => KHO_CH.find((f) => f.ten === ten) || null;
  const the = (ten) => TP.theCuaHam(tim(ten), tim);
  kiem('hàm chỉ gọi lệnh bánh / hàm thân → "than" (move, turn_right, u_turn, dodge_right)', ['move', 'turn_right', 'u_turn', 'dodge_right'].every((t) => the(t) === 'than'));
  kiem('hàm có lệnh tay (arm_down, grab, release) → "tay" (pick, drop)', the('pick') === 'tay' && the('drop') === 'tay');
  kiem('gián tiếp qua hàm khác: carry gọi pick / drop → "tay"', the('carry') === 'tay');
  kiem('hàm có lệnh cảm biến (front_clear trong if / while) → "cam" (go_wall, safe_move)', the('go_wall') === 'cam' && the('safe_move') === 'cam');
  kiem('có cả cảm biến lẫn tay (safe_pick gọi go_wall và pick) → cảm biến thắng: "cam"', the('safe_pick') === 'cam');
  kiem('hàm còn trống → "than"', the('rong') === 'than');
  const loop = [H('a', ['b()']), H('b', ['a()', 'grab()'])];
  kiem('hàm gọi vòng quanh nhau không treo; vẫn thấy lệnh tay ở hàm kia → "tay"', TP.theCuaHam(loop[0], (t) => loop.find((f) => f.ten === t) || null) === 'tay');
  kiem('lệnh của mọi bộ phận: nam châm (magnet_on), máy ném (aim), súng bóng (shoot), tấm đẩy (push) → "tay"; color / battery / front_metal → "cam"',
    ['magnet_on', 'magnet_off', 'aim', 'throw', 'load', 'shoot', 'push'].every((l) => TP.theCuaHam(H('x', [l + '()']), () => null) === 'tay') && ['color', 'battery', 'front_metal', 'left_clear', 'right_clear'].every((l) => TP.theCuaHam(H('x', [l + '()']), () => null) === 'cam'));
  kiem('chú thích không tính: "move()  # grab()" vẫn là "than"', TP.theCuaHam(H('x', ['move()  # grab()']), () => null) === 'than');
}

/* ================================================================= 3. THẺ MẶC ĐỊNH */
console.log('\n== 3. TP.theMacDinh: thẻ mở sẵn khi vào màn / mở Xưởng ==');
{
  const hamMan = [];
  const m4 = man('tay-gap.5'), m6 = man('khoang-cach.5'), m1 = man('xuong-ham.2');
  kiem('màn không bắt chế gì (taoHam rỗng, vd tay-gap.8): thẻ "than"', TP.theMacDinh({ man: man('tay-gap.8'), kho: KHO_CH, hamMan, dangSua: null }) === 'than');
  kiem('tay-gap.5 bắt chế pick, kho có pick dùng lệnh tay: thẻ "tay"', J(m4.taoHam) === '["pick"]' && TP.theMacDinh({ man: m4, kho: KHO_CH, hamMan, dangSua: null }) === 'tay');
  kiem('tay-gap.5, kho chưa có pick (hay pick còn trống): theo lời giải của màn (pick dùng lệnh tay) → "tay"',
    TP.theMacDinh({ man: m4, kho: [], hamMan, dangSua: null }) === 'tay' && TP.theMacDinh({ man: m4, kho: [H('pick', [])], hamMan, dangSua: null }) === 'tay');
  kiem('khoang-cach.5 bắt chế go_wall (cảm biến): thẻ "cam" cả khi kho chưa có hàm', J(m6.taoHam) === '["go_wall"]' && TP.theMacDinh({ man: m6, kho: [], hamMan, dangSua: null }) === 'cam' && TP.theMacDinh({ man: m6, kho: KHO_CH, hamMan, dangSua: null }) === 'cam');
  kiem('xuong-ham.2 bắt chế move (lệnh bánh): thẻ "than"', TP.theMacDinh({ man: m1, kho: [], hamMan, dangSua: null }) === 'than');
  kiem('hàm bắt chế đã có thân riêng thì theo thân đó: go_wall chỉ viết bằng lệnh bánh → "than"', TP.theMacDinh({ man: m6, kho: [H('go_wall', ['move()'])], hamMan, dangSua: null }) === 'than');
  kiem('Xưởng: theo hàm đang sửa có thân: pick (lệnh tay) → "tay", move → "than", go_wall → "cam"',
    TP.theMacDinh({ man: m1, kho: KHO_CH, hamMan, dangSua: KHO_CH.find((f) => f.ten === 'pick') }) === 'tay' && TP.theMacDinh({ man: m1, kho: KHO_CH, hamMan, dangSua: KHO_CH.find((f) => f.ten === 'move') }) === 'than' && TP.theMacDinh({ man: m1, kho: KHO_CH, hamMan, dangSua: KHO_CH.find((f) => f.ten === 'go_wall') }) === 'cam');
  kiem('Xưởng: hàm mới còn trống ở màn bắt chế nó → theo lời giải (pick ở tay-gap.5 → "tay"); hàm trống tự đặt → "than"',
    TP.theMacDinh({ man: m4, kho: [], hamMan, dangSua: H('pick', []) }) === 'tay' && TP.theMacDinh({ man: m4, kho: [], hamMan, dangSua: H('tu_dat', []) }) === 'than');
  kiem('hàm của màn đang sửa cũng theo thân: hàm của màn dùng grab() → "tay"', TP.theMacDinh({ man: m1, kho: [], hamMan: [H('hm', ['grab()'])], dangSua: H('hm', ['grab()']) }) === 'tay');
}

/* ================================================================= 4. KHAY THEO THẺ (Palette trên DOM giả) */
console.log('\n== 4. Palette: thẻ, tên thẻ, chỗ đặt hàm của em và cấu trúc Python ==');
{
  const hm = (m) => ((m.maMau && m.maMau.hamCuaMan) || []).map((f) => H(f.ten, f.than.slice(), (f.thamSo || []).slice()));
  // 4.1 một thẻ
  const m15 = man('hai-banh.5');
  let k = khayMoi(); k.host.clientHeight = 400;
  k.pal.dung(specMan(m15, KHO_CH, []));
  kiem('hai-banh.5 (xe, chỉ lệnh gốc): MỘT thẻ, ẩn ◀ ▶, vẫn thấy tiêu đề KHỐI LỆNH, không có hàm của em', tatCaThe(k).length === 1 && !coThe(k) && k.bh.querySelector('.tt').style.display !== 'none' && J(noiDung(k.host)) === J(['left_move', 'right_move', 'wait']), J(noiDung(k.host)));

  // 4.2 xe có hàm của màn: Thân, Của màn
  const m37 = man('che-xe.7');
  k = khayMoi(); k.pal.dung(specMan(m37, KHO_CH, hm(m37)));
  kiem('che-xe.7 (xe + hàm go_out của màn): hai thẻ Thân "Xe" và "Của màn"; mở sẵn "Xe" (hàm bắt chế come_back là hàm thân)', J(tatCaThe(k)) === '["than","man"]' && tenThe(k) === 'Xe' && coThe(k) && k.pal.theHienTai() === 'than', J(tatCaThe(k)) + tenThe(k));
  let q = quetThe(k);
  kiem('thẻ Xe: lệnh gốc bánh trước, rồi HÀM CỦA EM (move, turn_right, u_turn, dodge_right, rong…); hàm tay và hàm cảm biến bị lọc theo robot (xe này không có tay, không có cảm biến)',
    J(q.than.slice(0, 7)) === J(['left_move', 'right_move', 'left_back', 'right_back', 'wait', '## HÀM CỦA EM', 'move']) && !q.than.includes('pick') && !q.than.includes('carry') && !q.than.includes('go_wall') && q.than.includes('dodge_right') && !q.than.includes('go_out'), J(q.than));
  kiem('thẻ "Của màn": go_out (cam) và không có hàm của em', J(q.man) === '["go_out"]', J(q.man));

  // 4.3 tay kẹp
  const m45 = man('tay-gap.5');
  k = khayMoi(); k.pal.dung(specMan(m45, KHO_CH, []));
  kiem('tay-gap.5: hai thẻ Xe và "Tay kẹp" (tên theo bộ phận thật); mở sẵn "Tay kẹp" vì màn bắt chế pick', J(tatCaThe(k)) === '["than","tay"]' && k.pal.theHienTai() === 'tay' && tenThe(k) === 'Tay kẹp', J(tatCaThe(k)) + k.pal.theHienTai() + '/' + tenThe(k));
  q = quetThe(k);
  kiem('thẻ Tay kẹp: bốn lệnh tay trước, rồi HÀM CỦA EM chỉ gồm hàm có lệnh tay (pick, drop, carry; safe_pick có cả cảm biến nên không vào đây)',
    J(q.tay.slice(0, 6)) === J(['arm_down', 'arm_up', 'grab', 'release', '## HÀM CỦA EM', 'pick']) && q.tay.includes('carry') && q.tay.includes('drop') && !q.tay.includes('move') && !q.tay.includes('safe_pick') && !q.tay.includes('go_wall'), J(q.tay));
  kiem('thẻ Xe của màn tay: không có hàm tay (pick, drop, carry); hàm có cảm biến (go_wall, safe_pick) bị ẩn vì màn không gắn cảm biến',
    !q.than.includes('pick') && !q.than.includes('carry') && !q.than.includes('go_wall') && !q.than.includes('safe_pick') && q.than.includes('move'), J(q.than));
  kiem('ở màn tay-gap.5 không có `for` (chương chưa học vòng lặp): không thẻ nào có khối for', !J(q).includes('"for"'));

  // 4.4 tay + vòng lặp + cảm biến
  const m69 = man('khoang-cach.9');
  k = khayMoi(); k.pal.dung(specMan(m69, KHO_CH, hm(m69)));
  kiem('khoang-cach.9 (xe + tay + cảm biến): ba thẻ Xe, Tay kẹp, Cảm biến theo thứ tự', J(tatCaThe(k)) === '["than","tay","cam"]', J(tatCaThe(k)));
  q = quetThe(k);
  kiem('thẻ Cảm biến: khối đọc cảm biến (while front_clear, if, else) trước, rồi `for`, rồi HÀM CỦA EM có go_wall, safe_move, safe_pick',
    J(q.cam.slice(0, 5)) === J(['while', 'if', 'else:'.replace(':', ''), 'for', '## HÀM CỦA EM']) && ['go_wall', 'safe_move', 'safe_pick'].every((t) => q.cam.includes(t)) && !q.cam.includes('pick'), J(q.cam));
  kiem('`for` nằm trong MỌI thẻ lệnh (Xe, Tay kẹp, Cảm biến) nên không phải đổi thẻ để lấy; mỗi thẻ đúng một khối for', ['than', 'tay', 'cam'].every((x) => q[x].filter((t) => t === 'for').length === 1), J(q));
  kiem('khối `while` / `if` đọc cảm biến chỉ ở thẻ Cảm biến, không lẫn sang thẻ Xe / Tay', !q.than.includes('while') && !q.than.includes('if') && !q.tay.includes('while') && !q.tay.includes('if'));
  kiem('thẻ Xe có `for` ngay sau lệnh gốc, trước HÀM CỦA EM', J(q.than.slice(4, 8)) === J(['wait', 'for', '## HÀM CỦA EM', 'move']), J(q.than.slice(0, 9)));

  // 4.5 đổi thẻ ◀ ▶ vòng tròn, giữ thẻ khi vẽ lại
  k = khayMoi(); k.pal.dung(specMan(m69, KHO_CH, hm(m69)));
  const [truoc, sau] = k.bh.querySelector('.pal-the').children.filter((x) => x._cls.has('cuon-b'));
  kiem('◀ ở thẻ đầu sang thẻ cuối, ▶ ở thẻ cuối về thẻ đầu (vòng tròn)', (truoc.click(), k.pal.theHienTai() === 'cam') && (sau.click(), k.pal.theHienTai() === 'than') && (sau.click(), k.pal.theHienTai() === 'tay'));
  k.pal.dung(Object.assign(specMan(m69, KHO_CH, hm(m69)), { lamMoi: false, the: 'than' }));
  kiem('vẽ lại khay (thêm khối, sửa hàm…) giữ thẻ đang chọn (Tay), không nhảy về thẻ mặc định', k.pal.theHienTai() === 'tay' && tenThe(k) === 'Tay kẹp');
  k.pal.dung(specMan(m69, KHO_CH, hm(m69), { the: 'cam' }));
  kiem('vào màn / mở Xưởng (lamMoi) bỏ thẻ cũ và dùng thẻ mặc định của spec', k.pal.theHienTai() === 'cam');
  k.pal.lai();
  kiem('pal.lai() vẽ lại mà không đặt lại thẻ', k.pal.theHienTai() === 'cam');
  kiem('khối có data-goi / data-loai để chạm chèn và kéo thả như cũ: lệnh gốc "goc", hàm của em "em", hàm của màn "man"',
    (() => { const ds = []; (function di(n) { for (const c of n.children) { if (c._cls.has('brick')) ds.push([c.getAttribute('data-loai'), c.getAttribute('data-ten'), c.getAttribute('data-goi')]); else di(c); } })(k.host); return ds.some((x) => x[0] === 'em' && x[1] === 'go_wall' && x[2] === 'go_wall()') && ds.some((x) => x[0] === 'dk' && x[2] === 'if front_clear():') && ds.some((x) => x[0] === 'vong' && x[2] === 'while front_clear():'); })());
  // chạm chèn đúng văn bản
  const chen = []; k = khayMoi({ khiChen: (s) => chen.push(s) }); k.pal.dung(specMan(m69, KHO_CH, hm(m69), { the: 'tay' }));
  (function di(n) { for (const c of n.children) { if (c._cls.has('brick') && c.getAttribute('data-ten') === 'grab') c.click(); else di(c); } })(k.host);
  kiem('chạm khối ở khay gọi khiChen với đúng dòng chèn ("grab()")', J(chen) === '["grab()"]', J(chen));

  // 4.6 khối lỗi ở thẻ khác
  k = khayMoi(); k.pal.dung(specMan(m69, KHO_CH, hm(m69), { the: 'than' }));
  k.pal.datLoi(['em:go_wall']);
  kiem('datLoi: khối báo lỗi (em:go_wall) nằm ở thẻ khác thì tự sang thẻ Cảm biến và tô đỏ khối đó', k.pal.theHienTai() === 'cam');
  (function di(n) { for (const c of n.children) { if (c._cls.has('brick') && c.getAttribute('data-ten') === 'go_wall') kiem('khối go_wall có lớp err', c._cls.has('err')); else di(c); } })(k.host);
  k.pal.datLoi([]);
  (function di(n) { for (const c of n.children) { if (c._cls.has('brick')) { if (c._cls.has('err')) kiem('datLoi([]) xóa hết tô đỏ', false); } else di(c); } })(k.host);
  k.pal.datLoi(['em:move']);
  kiem('datLoi một khối ở thẻ Xe thì quay về thẻ Xe', k.pal.theHienTai() === 'than');
  k.pal.datSang('em', 'move');
  kiem('datSang tô khối đang chạy (lit) trong thẻ đang xem', (function di(n) { for (const c of n.children) { if (c._cls.has('brick') && c.getAttribute('data-ten') === 'move' && c._cls.has('lit')) return true; const r = c._cls.has('brick') ? false : di(c); if (r) return true; } return false; })(k.host));

  // 4.7 BIẾN ở đầu mọi thẻ; hàm mới truyền thẻ
  const mTS = man('tham-so.6');
  k = khayMoi(); k.pal.dung(Object.assign(specMan(mTS, KHO_CH, hm(mTS)), { coNutMoi: false, boQua: 'deliver', bien: ['n'], lamMoi: true, the: 'tay' }));
  q = quetThe(k);
  kiem('hàm có tham số (bien ["n"]): nhóm BIẾN ở đầu MỌI thẻ ("## BIẾN" rồi "n")', Object.keys(q).length >= 2 && Object.values(q).every((d) => d[0] === '## BIẾN' && d[1] === 'n'), J(q));
  kiem('boQua: hàm đang sửa (deliver) không có trong khay', !J(q).includes('"deliver"'));
  let moi = null; k = khayMoi({ khiMoi: (the) => { moi = the; } }); k.pal.dung(specMan(m45, KHO_CH, []));
  (function di(n) { for (const c of n.children) { if (c._cls.has('nb')) c.click(); else di(c); } })(k.host);
  kiem('nút Hàm mới báo thẻ đang xem (để Xưởng mở sẵn đúng thẻ): ở thẻ Tay kẹp → "tay"', moi === 'tay', String(moi));

  // 4.8 không co quá một mức
  k = khayMoi(); k.host.scrollHeight = 900; k.pal.dung(specMan(m45, KHO_CH, []));
  kiem('khay dài hơn khung: co một mức (.d1) rồi cuộn (.cuon); KHÔNG có d2 / d3', k.host.classList.contains('d1') && k.host.classList.contains('cuon') && !k.host.classList.contains('d2') && !k.host.classList.contains('d3'));
  k = khayMoi(); k.host.scrollHeight = 300; k.pal.dung(specMan(m45, KHO_CH, []));
  kiem('khay vừa khung: khối cỡ đầy đủ, không d1, không cuộn; ▲ ▼ mờ nhưng có mặt (nhiều thẻ)', !k.host.classList.contains('d1') && !k.host.classList.contains('cuon') && k.bh.querySelector('.cuon-nut').style.display !== 'none' && k.bh.querySelector('.cuon-nut').children.every((b) => b.disabled));
  kiem('khối cấu trúc và tên thẻ không còn thẻ "Python" riêng (tối đa 4 thẻ: Thân, Tay, Cảm biến, Của màn)', ManHoc.danhSach.every((m) => { const kk = khayMoi(); kk.pal.dung(specMan(m, KHO_CH, hm(m))); return kk.pal.dsThe().length <= 4 && kk.pal.dsThe().every((x) => ['than', 'tay', 'cam', 'man'].includes(x)); }));
}

/* ================================================================= 5. MỌI MÀN: thẻ hợp lệ, mọi khối tới được */
console.log('\n== 5. Mọi màn: khay không mất khối nào so với kho cũ ==');
{
  const hm = (m) => ((m.maMau && m.maMau.hamCuaMan) || []).map((f) => H(f.ten, f.than.slice(), (f.thamSo || []).slice()));
  const khoTat = KHO_CH;
  let sai = [];
  for (const m of ManHoc.danhSach) {
    const k = khayMoi();
    const spec = specMan(m, khoTat, hm(m));
    k.pal.dung(spec);
    const tat = new Set(), q = quetThe(k);
    for (const ds of Object.values(q)) for (const t of ds) tat.add(t);
    const can = [];
    for (const n of (m.hamGoc || [])) { if (['front_clear', 'left_clear', 'right_clear', 'color', 'front_metal', 'battery'].includes(n)) continue; can.push(n); }
    for (const f of hm(m)) can.push(f.ten);
    if (spec.em) for (const f of spec.em) can.push(f.ten);
    const thieu = can.filter((n) => !tat.has(n));
    if (thieu.length) sai.push(m.id + ': thiếu ' + thieu.join(','));
    if (!k.pal.dsThe().includes(k.pal.theHienTai())) sai.push(m.id + ': thẻ đang chọn không có');
    if (spec.vong && !Object.values(q).some((d) => d.includes('for'))) sai.push(m.id + ': thiếu khối for');
  }
  kiem('mọi màn (' + ManHoc.danhSach.length + '): lệnh gốc, hàm của màn và hàm của em (đã lọc theo robot) đều có mặt trong một thẻ nào đó; khối for có khi màn học for; thẻ đang chọn luôn hợp lệ', sai.length === 0, sai.slice(0, 6).join(' | '));
}

/* ================================================================= 6. THẺ SCRIPT */
console.log('\n== 6. game/choi.html ==');
{
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  kiem('choi.html nạp khung-code.js trước cham.js (cham.js dùng KhungCode.kiemTra với gioiHanHam)', html.indexOf('../khung-code.js') > 0 && html.indexOf('../khung-code.js') < html.indexOf('../cham.js'));
  kiem('chữ của khay có trong chu.js: tên thẻ, nút ◀ ▶, bộ đếm Hàm k/n, Sổ lệnh "Còn N nhóm chưa mở"',
    ['choi.the.xe', 'choi.the.nhen', 'choi.the.drone', 'choi.the.tay', 'choi.the.tayKep', 'choi.the.tayNamCham', 'choi.the.tayNem', 'choi.the.taySung', 'choi.the.tayDay', 'choi.the.cam', 'choi.the.man', 'choi.theTruoc', 'choi.theSau', 'choi.hamDem', 'so.conKhoa'].every((x) => ctx.t(x) !== x));
  kiem('bộ đếm: t("choi.hamDem") = "Hàm 2/3"', ctx.t('choi.hamDem', { k: 2, n: 3 }) === 'Hàm 2/3');
  const css = fs.readFileSync(path.join(day, 'game', 'choi.css'), 'utf8');
  kiem('choi.css không còn mức co .pal.d2 / .pal.d3 (khối giữ cỡ dễ chạm)', !/\.pal\.d[23]\b/.test(css));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

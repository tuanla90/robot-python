/* ============================================================================
   kiem-khay.mjs — máy kiểm KHAY KHỐI LỆNH theo thẻ bộ phận và giới hạn hàm theo màn của "Đường học" (KE-HOACH-CHE-LENH.md §3.4b).
   Gồm:
   - man.gioiHanHam = n (lõi): chương trình chính gọi trực tiếp tối đa n hàm của em KHÁC NHAU; lỗi khung `qua-gioi-han-ham` đúng lời, đúng dòng;
     không khai thì không kiểm; hàm gọi bên trong hàm khác, hàm của màn, lệnh gốc không tính; Xưởng (thuHam) không bị chặn. Dùng màn GIẢ dựng từ một màn thật, không thêm màn thật;
   - TP.theCuaHam: hàm của em vào thẻ theo lệnh gốc nó gọi, kể cả gián tiếp (cảm biến > tay > thân);
   - TP.theMacDinh: thẻ mặc định (hàm đang sửa / hàm màn bắt chế theo lời giải / thân);
   - Palette (game/thanh-phan.js) chạy trên DOM giả: thẻ có mặt đúng lúc (Thân, Tay, Cảm biến; KHÔNG còn thẻ "Của màn"), tên thẻ theo bộ phận thật, hàm của em VÀ hàm của màn vào đúng thẻ
     (hàm của màn màu cam, nằm trên hàm của em), cấu trúc `for` / `while` / `if` đặt đúng chỗ, giữ thẻ khi vẽ lại, ◀ ▶ vòng tròn, khối báo lỗi ở thẻ khác thì tự sang thẻ đó, khối BIẾN ở đầu mọi thẻ,
     khay KHÔNG tự co nhỏ (không còn d1 / d2 / d3), ổ khóa thay bút chì ở hàm bị khóa;
   - ManHoc.hamSuaDuoc / hamEmKhoa (hàm cốt truyện chỉ sửa được ở màn cần sửa nó), TP.khoaKhay;
   - TP.nhomNhip (ngoặc nhịp), HuongDan (khung hướng dẫn: chuỗi, sự kiện, hạn, cờ), DenBoPhan (đèn theo bộ phận: bộ phận có trên màn, bộ phận sáng theo vết thật);
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
for (const f of ['thu-tu-chuong', 'so-lenh', 'man-chuoi-1']) require(path.join(day, f + '.js'));
for (const f of fs.readdirSync(day).filter((f) => /^man-.*\.js$/.test(f)).sort()) require(path.join(day, f));          // MỌI tệp màn (kể cả chương mới), để các kiểm "mọi màn" phủ hết
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
  removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; return c; }
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
const luuGia = { co: {}, daXem(k) { return !!this.co[k]; }, datDaXem(k) { this.co[k] = true; return true; } };
const ctx = vm.createContext({ console, document: doc, getComputedStyle: () => ({ fontSize: '11px' }), Ve: { ico: () => new El('i'), khoa: () => new El('i') }, SanHoc, KhungCode, ManHoc, Luu: luuGia, setTimeout, clearTimeout });
ctx.window = ctx;
for (const f of ['chu.js', 'huong-dan.js', 'thanh-phan.js', 'den-bo-phan.js']) vm.runInContext(fs.readFileSync(path.join(day, 'game', f), 'utf8'), ctx, { filename: f });
const TP = ctx.TP, HuongDan = ctx.HuongDan, DenBoPhan = ctx.DenBoPhan;

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
const tenThe = (k) => { const e = k.bh.querySelector('.the-chu'); return e ? (e.getAttribute('title') || e.textContent) : ''; };     // tiêu đề thẻ là icon (15/10): tên ở title
const ghimCo = (k) => (k.pal.ghim ? noiDung(k.pal.ghim) : []);                                  // hàng ghim dưới khay: ['wait'] khi màn có wait()
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
  kiem('lệnh của mọi bộ phận: nam châm (magnet_n, magnet_s), máy ném (aim), súng bóng (shoot), tấm đẩy (push) → "tay"; color / battery / front_metal → "cam"',
    ['magnet_n', 'magnet_s', 'magnet_off', 'aim', 'throw', 'load', 'shoot', 'shoot_back'].every((l) => TP.theCuaHam(H('x', [l + '()']), () => null) === 'tay') && ['color', 'battery', 'front_metal', 'front_pole', 'left_clear', 'right_clear'].every((l) => TP.theCuaHam(H('x', [l + '()']), () => null) === 'cam'));
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
  kiem('hai-banh.5 (xe, chỉ lệnh gốc): MỘT thẻ, ẩn ◀ ▶, vẫn thấy tiêu đề KHỐI LỆNH, không có hàm của em', tatCaThe(k).length === 1 && !coThe(k) && k.bh.querySelector('.tt').style.display !== 'none' && J(noiDung(k.host)) === J(['left_move', 'right_move']) && J(ghimCo(k)) === '["wait"]', J(noiDung(k.host)) + ' ghim ' + J(ghimCo(k)));

  // 4.2 xe có hàm của màn: hàm của màn nằm TRONG thẻ Thân (không còn thẻ "Của màn")
  const m37 = man('che-xe.7');
  k = khayMoi(); k.pal.dung(specMan(m37, KHO_CH, hm(m37)));
  kiem('che-xe.7 (xe + hàm go_out của màn): MỘT thẻ "Xe" (go_out là hàm thân nên nằm trong thẻ Thân; không còn thẻ "Của màn"), ẩn ◀ ▶', J(tatCaThe(k)) === '["than"]' && !coThe(k) && k.pal.theHienTai() === 'than', J(tatCaThe(k)));
  let q = quetThe(k);
  kiem('thẻ Xe: lệnh gốc bánh, rồi HÀM CỦA MÀN (go_out), rồi HÀM CỦA EM (move, turn_right, u_turn, dodge_right…); hàm tay và hàm cảm biến bị lọc theo robot (xe này không có tay, không có cảm biến)',
    J(q.than.slice(0, 6)) === J(['left_move', 'right_move', 'left_back', 'right_back', '## HÀM CỦA MÀN', 'go_out']) && q.than.indexOf('## HÀM CỦA MÀN') < q.than.indexOf('## HÀM CÓ SẴN') && q.than.indexOf('move') > q.than.indexOf('## HÀM CÓ SẴN') && !q.than.includes('pick') && !q.than.includes('carry') && !q.than.includes('go_wall') && q.than.includes('dodge_right'), J(q.than));
  kiem('hàm của màn vẽ màu cam (lớp "or", data-loai "man"); hàm của em lớp "gr"',
    (() => { let man_ = null, em_ = null; (function di(n) { for (const c of n.children) { if (c._cls.has('brick')) { if (c.getAttribute('data-ten') === 'go_out') man_ = c; if (c.getAttribute('data-ten') === 'move') em_ = c; } else di(c); } })(k.host); return !!man_ && man_._cls.has('or') && man_.getAttribute('data-loai') === 'man' && !!em_ && em_._cls.has('gr') && em_.getAttribute('data-loai') === 'em'; })());
  // hàm của màn theo thẻ bộ phận như hàm của em: go_drop (lệnh tay) ở thẻ Tay, go_see (lệnh cảm biến) ở thẻ Cảm biến, go_move (chỉ bánh) ở thẻ Xe
  const mm9 = man('khoang-cach.9');
  k = khayMoi(); k.pal.dung(specMan(mm9, KHO_CH, [H('go_drop', ['arm_down()', 'release()', 'arm_up()', 'wait()']), H('go_see', ['if front_clear():', '    move()']), H('go_move', ['move()'])]));
  q = quetThe(k);
  kiem('hàm của màn vào thẻ bộ phận theo CÙNG luật với hàm của em: go_move ở Xe, go_drop ở Tay kẹp, go_see ở Cảm biến; mỗi thẻ có nhóm HÀM CỦA MÀN trên nhóm HÀM CỦA EM',
    q.than.includes('go_move') && !q.than.includes('go_drop') && q.tay.includes('go_drop') && !q.tay.includes('go_move') && q.cam.includes('go_see') && !q.cam.includes('go_drop') &&
    q.tay.indexOf('## HÀM CỦA MÀN') < q.tay.indexOf('## HÀM CÓ SẴN'), J(q));
  kiem('không còn thẻ "man": mọi khóa thẻ là than / tay / cam', tatCaThe(k).every((x) => ['than', 'tay', 'cam'].includes(x)));
  k.pal.datLoi(['man:go_drop']);
  kiem('datLoi một hàm của màn nằm ở thẻ khác thì tự sang thẻ chứa nó (go_drop → Tay kẹp)', k.pal.theHienTai() === 'tay');

  // 4.3 tay kẹp
  const m45 = man('tay-gap.5');
  k = khayMoi(); k.pal.dung(specMan(m45, KHO_CH, []));
  kiem('tay-gap.5: hai thẻ Xe và "Tay kẹp" (tên theo bộ phận thật); mở sẵn "Tay kẹp" vì màn bắt chế pick', J(tatCaThe(k)) === '["than","tay"]' && k.pal.theHienTai() === 'tay' && tenThe(k) === 'Tay kẹp', J(tatCaThe(k)) + k.pal.theHienTai() + '/' + tenThe(k));
  q = quetThe(k);
  kiem('thẻ Tay kẹp: bốn lệnh tay trước, rồi HÀM CỦA EM chỉ gồm hàm có lệnh tay (pick, drop, carry; safe_pick có cả cảm biến nên không vào đây)',
    J(q.tay.slice(0, 6)) === J(['arm_down', 'arm_up', 'grab', 'release', '## HÀM CÓ SẴN', 'pick']) && q.tay.includes('carry') && q.tay.includes('drop') && !q.tay.includes('move') && !q.tay.includes('safe_pick') && !q.tay.includes('go_wall'), J(q.tay));
  kiem('thẻ Xe của màn tay: không có hàm tay (pick, drop, carry); hàm có cảm biến (go_wall, safe_pick) bị ẩn vì màn không gắn cảm biến',
    !q.than.includes('pick') && !q.than.includes('carry') && !q.than.includes('go_wall') && !q.than.includes('safe_pick') && q.than.includes('move'), J(q.than));
  kiem('ở màn tay-gap.5 không có `for` (chương chưa học vòng lặp): không thẻ nào có khối for', !J(q).includes('"for"'));

  // 4.4 tay + vòng lặp + cảm biến
  const m69 = man('khoang-cach.9');
  k = khayMoi(); k.pal.dung(specMan(m69, KHO_CH, hm(m69)));
  kiem('khoang-cach.9 (xe + tay + cảm biến): ba thẻ Xe, Tay kẹp, Logic theo thứ tự', J(tatCaThe(k)) === '["than","tay","cam"]', J(tatCaThe(k)));
  q = quetThe(k);
  kiem('thẻ Logic: `for`, rồi khối đọc cảm biến (while front_clear, if, else), rồi HÀM CỦA EM có go_wall, safe_move, safe_pick',
    J(q.cam.slice(0, 5)) === J(['for', 'while', 'if', 'else', '## HÀM CÓ SẴN']) && ['go_wall', 'safe_move', 'safe_pick'].every((t) => q.cam.includes(t)) && !q.cam.includes('pick'), J(q.cam));
  kiem('`for` chỉ ở thẻ Logic (đúng một khối); thẻ Xe / Tay kẹp chỉ còn lệnh của bộ phận (15/10)', q.cam.filter((t) => t === 'for').length === 1 && !q.than.includes('for') && !q.tay.includes('for'), J(q));
  kiem('khối `while` / `if` đọc cảm biến chỉ ở thẻ Logic, không lẫn sang thẻ Xe / Tay', !q.than.includes('while') && !q.than.includes('if') && !q.tay.includes('while') && !q.tay.includes('if'));
  kiem('thẻ Xe: lệnh gốc bánh rồi HÀM CỦA EM, không for / wait; wait() ở hàng ghim dưới khay, thẻ nào cũng thấy', J(q.than.slice(0, 6)) === J(['left_move', 'right_move', 'left_back', 'right_back', '## HÀM CÓ SẴN', 'move']) && J(ghimCo(k)) === '["wait"]', J(q.than.slice(0, 9)) + ' ghim ' + J(ghimCo(k)));
  k.pal.chonThe('tay');
  kiem('đổi sang thẻ Tay kẹp: hàng ghim vẫn có wait()', J(ghimCo(k)) === '["wait"]');
  kiem('tiêu đề thẻ là icon (lớp co-ic), tên thẻ ở title', k.bh.querySelector('.the-chu')._cls.has('co-ic') && tenThe(k) === 'Tay kẹp', tenThe(k));
  {
    const k11 = khayMoi(); k11.pal.dung(specMan(man('hai-banh.1'), KHO_CH, []));
    const kv = khayMoi(); kv.pal.dung(specMan(man('vong-lap.2'), KHO_CH, []));
    kiem('màn chưa học cấu trúc (1.1): không có thẻ Logic; màn đầu Vòng lặp: có thẻ Logic chứa for', !k11.pal.dsThe().includes('cam') && kv.pal.dsThe().includes('cam') && quetThe(kv).cam.includes('for'), J(k11.pal.dsThe()) + ' / ' + J(kv.pal.dsThe()));
  }

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
  kiem('datLoi: khối báo lỗi (em:go_wall) nằm ở thẻ khác thì tự sang thẻ Logic và tô đỏ khối đó', k.pal.theHienTai() === 'cam');
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
  kiem('khay dài hơn khung: bật cuộn (.cuon), khối KHÔNG tự co nhỏ (không d1 / d2 / d3)', k.host.classList.contains('cuon') && !k.host.classList.contains('d1') && !k.host.classList.contains('d2') && !k.host.classList.contains('d3'));
  kiem('khay cuộn được: cuonDuoc() true, cuonThem(d) đổi scrollTop (vuốt dọc / lăn chuột dùng chung)', k.pal.cuonDuoc() && k.pal.cuonThem(120) === 120 && k.host.scrollTop === 120);
  k = khayMoi(); k.host.scrollHeight = 300; k.pal.dung(specMan(m45, KHO_CH, []));
  kiem('khay vừa khung: khối cỡ đầy đủ, không cuộn; ▲ ▼ mờ nhưng có mặt (nhiều thẻ); cuonDuoc() false', !k.host.classList.contains('d1') && !k.host.classList.contains('cuon') && !k.pal.cuonDuoc() && k.bh.querySelector('.cuon-nut').style.display !== 'none' && k.bh.querySelector('.cuon-nut').children.every((b) => b.disabled));
  kiem('khối cấu trúc và tên thẻ không còn thẻ "Python" hay "Của màn" riêng (tối đa 3 thẻ: Thân, Tay, Cảm biến)', ManHoc.danhSach.every((m) => { const kk = khayMoi(); kk.pal.dung(specMan(m, KHO_CH, hm(m))); return kk.pal.dsThe().length <= 3 && kk.pal.dsThe().every((x) => ['than', 'tay', 'cam'].includes(x)); }));
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
    for (const t of ghimCo(k)) tat.add(t);
    const can = [];
    for (const n of (m.hamGoc || [])) { if (['front_clear', 'left_clear', 'right_clear', 'color', 'front_metal', 'front_pole', 'battery'].includes(n)) continue; can.push(n); }
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
    ['choi.the.xe', 'choi.the.nhen', 'choi.the.drone', 'choi.the.tay', 'choi.the.tayKep', 'choi.the.tayNamCham', 'choi.the.tayNem', 'choi.the.taySung', 'choi.the.cam', 'choi.theTruoc', 'choi.theSau', 'choi.hamDem', 'so.conKhoa',
      'choi.hamKhoaNhan', 'choi.meoXoa', 'choi.meoXoa2', 'choi.meoThe', 'choi.nhipNhan', 'xuong.hamKhoaEm', 'xuong.chiXem', 'choi.den.banhT', 'choi.den.banhP', 'choi.den.truot', 'choi.den.tay', 'choi.den.kep', 'choi.den.namCham', 'choi.den.nem', 'choi.den.sung', 'choi.den.camBien', 'choi.den.chan', 'choi.den.canh'].every((x) => ctx.t(x) !== x));
  kiem('bộ đếm: t("choi.hamDem") = "Hàm 2/3"', ctx.t('choi.hamDem', { k: 2, n: 3 }) === 'Hàm 2/3');
  const css = fs.readFileSync(path.join(day, 'game', 'choi.css'), 'utf8');
  kiem('choi.css không còn mức co .pal.d1 / .pal.d2 / .pal.d3 (khối giữ cỡ dễ chạm, cao ≥ 28px = ngang một dòng khung chương trình, user 15/10)', !/\.pal\.d[123]\b/.test(css) && /\.brick\{[^}]*height:(2[89]|[3-9]\d)px/.test(css));
  kiem('choi.html nạp huong-dan.js và den-bo-phan.js (trước thanh-phan.js / man-choi.js), có tệp trên đĩa', html.indexOf('huong-dan.js') > 0 && html.indexOf('huong-dan.js') < html.indexOf('thanh-phan.js') && html.indexOf('den-bo-phan.js') > 0 && html.indexOf('den-bo-phan.js') < html.indexOf('man-choi.js') && fs.existsSync(path.join(day, 'game', 'huong-dan.js')) && fs.existsSync(path.join(day, 'game', 'den-bo-phan.js')));
}

/* ================================================================= 7. HÀM CỐT TRUYỆN CHỈ SỬA ĐƯỢC Ở MÀN CẦN SỬA NÓ */
console.log('\n== 7. Khóa hàm cốt truyện: ManHoc.hamSuaDuoc / hamEmKhoa, TP.khoaKhay, ổ khóa trên khay ==');
{
  const nguon = (f) => fs.readFileSync(path.join(day, f), 'utf8');
  const coTruyen = ManHoc.hamCotTruyen();
  kiem('hamCotTruyen() gộp taoHam của mọi màn (không trùng); có các hàm gốc của chương Xưởng hàm / chế lệnh xe (move, turn_right, turn_left, u_turn, dodge_right, back, park)',
    new Set(coTruyen).size === coTruyen.length && ['move', 'turn_right', 'turn_left', 'u_turn', 'dodge_right', 'back', 'park'].every((n) => coTruyen.includes(n)), J(coTruyen.slice(0, 12)));
  kiem('mọi hàm trong taoHam của màn đều nằm trong hamSuaDuoc(màn) (màn bắt chế thì được sửa)', ManHoc.danhSach.every((m) => (m.taoHam || []).every((n) => ManHoc.hamSuaDuoc(m).includes(n))));
  const tenLoiGiai = (m) => {
    const kq = [];
    const them = (ds) => (ds || []).forEach((f) => kq.push(f.ten));
    const ct = (c) => (Array.isArray(c) ? c : (c ? [c] : [])).forEach((x) => them(x.hamCuaEmMoi));
    ct(m.loiGiai); ct(m.loiGiaiKhac); ct(m.congThucKhac);
    return kq;
  };
  const sai = [];
  for (const m of ManHoc.danhSach) for (const n of tenLoiGiai(m)) if (!ManHoc.hamSuaDuoc(m).includes(n) || ManHoc.hamEmKhoa(m, n)) sai.push(m.id + ':' + n);
  kiem('với MỌI màn: mọi hàm lời giải (loiGiai, loiGiaiKhac, congThucKhac) sửa / tạo đều nằm trong danh sách sửa được và không bị khóa', sai.length === 0, sai.slice(0, 8).join(' '));
  const m5 = man('che-xe.5'), m6 = man('che-xe.6'), m9 = man('che-xe.9');
  kiem('che-xe.5 sửa u_turn(): sửa được; che-xe.6 (màn kế) mở u_turn() thì khóa (chỉ xem)', ManHoc.hamSuaDuoc(m5).includes('u_turn') && !ManHoc.hamEmKhoa(m5, 'u_turn') && !ManHoc.hamSuaDuoc(m6).includes('u_turn') && ManHoc.hamEmKhoa(m6, 'u_turn'));
  kiem('che-xe.9 sửa turn_right() / turn_left(): sửa được; che-xe.6 thì khóa', ['turn_right', 'turn_left'].every((n) => !ManHoc.hamEmKhoa(m9, n) && ManHoc.hamEmKhoa(m6, n)));
  kiem('xuong-ham.2 bắt chế move(): sửa được; xuong-ham.3 (không bắt chế move) thì khóa', !ManHoc.hamEmKhoa(man('xuong-ham.2'), 'move') && ManHoc.hamEmKhoa(man('xuong-ham.3'), 'move'));
  kiem('hàm người chơi TỰ ĐẶT (tên không phải cốt truyện) không bao giờ khóa ở mọi màn', ManHoc.danhSach.every((m) => !ManHoc.hamEmKhoa(m, 'ham_cua_toi_xyz') && !TP.khoaKhay(m).includes('em:ham_cua_toi_xyz')));
  kiem('TP.khoaKhay(màn): em:<hàm cốt truyện không sửa ở màn>: che-xe.6 khóa u_turn, che-xe.5 không (nhưng khóa move)',
    TP.khoaKhay(m6).includes('em:u_turn') && !TP.khoaKhay(m5).includes('em:u_turn') && TP.khoaKhay(m5).includes('em:move'));
  kiem('che-xe.7: TP.khoaKhay có man:go_out (khoaHamMan)', TP.khoaKhay(man('che-xe.7')).includes('man:go_out'));
  kiem('App.hamSuaDuoc / App.hamEmKhoa có ở ung-dung.js và chỉ dựa vào ManHoc (bảng Gỡ lỗi "Mở hết" KHÔNG mở khóa này)',
    /App\.hamSuaDuoc = function/.test(nguon('game/ung-dung.js')) && /App\.hamEmKhoa = function/.test(nguon('game/ung-dung.js')) && !/moHet/.test(nguon('man-chuoi-1.js').split('ManHoc.hamCotTruyen')[1].split('ManHoc.them(DS)')[0]));
  kiem('khoaKhay và hamKhoa của Xưởng không đọc cờ moHet', !/moHet/.test(nguon('game/thanh-phan.js').split('function khoaKhay')[1].split('/** Lệnh đọc cảm biến')[0]) && !/moHet/.test(nguon('game/xuong-ham.js').split('function hamKhoa')[1].split('function baoHamKhoa')[0]));
  kiem('Xưởng: hamKhoa() cũng khóa hàm của EM cốt truyện (TP.khoaKhay), có toast riêng xuong.hamKhoaEm; màn chơi truyền khoa: TP.khoaKhay(m) cho khay; Xưởng cũng truyền cho khay',
    /TP\.khoaKhay\(m\)\.indexOf\('em:' \+ S\.ten\)/.test(nguon('game/xuong-ham.js')) && /xuong\.hamKhoaEm/.test(nguon('game/xuong-ham.js')) && /khoa: TP\.khoaKhay\(m\)/.test(nguon('game/man-choi.js')) && /khoa: TP\.khoaKhay\(man\)/.test(nguon('game/xuong-ham.js')));
  // ổ khóa trên khay
  const kk = khayMoi(); kk.pal.dung(specMan(m6, KHO_CH, [], { khoa: ['em:u_turn', 'man:go_out'], em: KHO_CH }));
  const brick = (ten) => { let r = null; (function di(n) { for (const c of n.children) { if (c._cls.has('brick') && c.getAttribute('data-ten') === ten) r = c; else if (!c._cls.has('brick')) di(c); } })(kk.host); return r; };
  const edCua = (b) => b.children.find((c) => c._cls.has('ed'));
  const ub = brick('u_turn'), mb = brick('move');
  kiem('hàm bị khóa trên khay: ổ khóa thay bút chì (.ed.khoa, data-khoa), vẫn chạm được để mở Xưởng xem; hàm không khóa giữ bút chì', !!ub && !!edCua(ub) && edCua(ub)._cls.has('khoa') && edCua(ub).getAttribute('data-khoa') === '1' && ub._cls.has('khoa') && !!mb && !edCua(mb)._cls.has('khoa'));
  kiem('aria-label của nút sửa: hàm khóa "chỉ xem", hàm thường "Sửa hàm …"', edCua(ub).getAttribute('aria-label') === ctx.t('choi.hamKhoaNhan', { ten: 'u_turn' }) && edCua(mb).getAttribute('aria-label') === ctx.t('choi.suaHam', { ten: 'move' }));
  const lenhKhoa = []; const kk2 = khayMoi({ khiSua: (loai, ten) => lenhKhoa.push(loai + ':' + ten) }); kk2.pal.dung(specMan(m6, KHO_CH, [], { khoa: ['em:u_turn'], em: KHO_CH }));
  (function di(n) { for (const c of n.children) { if (c._cls.has('ed') && c.getAttribute('data-sua') === 'u_turn') c.click(); else di(c); } })(kk2.host);
  kiem('chạm ổ khóa vẫn gọi khiSua (mở Xưởng ở chế độ chỉ xem)', J(lenhKhoa) === '["em:u_turn"]', J(lenhKhoa));
  // thẻ mặc định cho màn không bắt chế: hàm của màn cho sửa → thẻ của nó; hàm của màn bị khóa thì bỏ qua
  const gia = Object.assign({}, man('tay-gap.8'), { taoHam: [], khoaHamMan: [], loiGiai: { hamCuaEmMoi: [] } });
  kiem('màn không bắt chế hàm nào: thẻ mặc định theo hàm của màn cho sửa (hàm dùng lệnh tay → "tay"); hàm của màn bị khóa thì không tính',
    TP.theMacDinh({ man: gia, kho: [], hamMan: [H('hm', ['arm_down()', 'release()'])], dangSua: null }) === 'tay' && TP.theMacDinh({ man: Object.assign({}, gia, { khoaHamMan: ['hm'] }), kho: [], hamMan: [H('hm', ['arm_down()'])], dangSua: null }) === 'than');
  kiem('màn chỉ sửa hàm của em (che-xe.5 sửa u_turn, không taoHam): thẻ mặc định theo lời giải (u_turn dùng lệnh bánh → "than")', TP.theMacDinh({ man: m5, kho: KHO_CH, hamMan: [], dangSua: null }) === 'than');
}

/* ================================================================= 8. NGOẶC NHỊP */
console.log('\n== 8. TP.nhomNhip: ngoặc nhịp gom lệnh gốc + wait() ==');
{
  const g = (arr) => J(TP.nhomNhip(arr));
  const G = (...x) => J(x.map(([tu, den, so]) => ({ tu, den, so })));
  kiem('hai nhịp liền nhau: [left_move, right_move, wait] ×2 → nhịp 1 (dòng 0–2), nhịp 2 (dòng 3–5)', g(['left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()']) === G([0, 2, 1], [3, 5, 2]));
  kiem('lệnh tay: arm_down, grab, wait | arm_up, wait → hai nhịp', g(['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()']) === G([0, 2, 1], [3, 4, 2]));
  kiem('wait() đứng một mình là một nhịp đứng yên (một dòng)', g(['wait()']) === G([0, 0, 1]));
  kiem('dòng gọi hàm của em ngắt nhóm: move() (hàm của em) rồi left_move, wait → nhịp 1 chỉ gồm 2 dòng sau', g(['move()', 'left_move()', 'wait()']) === G([1, 2, 1]));
  kiem('hàm của em ở giữa ngắt dãy: nhãn đánh số lại từ 1 sau dòng ngắt', g(['left_move()', 'wait()', 'move()', 'right_move()', 'wait()']) === G([0, 1, 1], [3, 4, 1]));
  kiem('for / if / while ngắt nhóm; thân for (thụt lề cùng bậc) có nhóm riêng', g(['for i in range(2):', '    left_move()', '    right_move()', '    wait()', 'wait()']) === G([1, 3, 1], [4, 4, 1]));
  kiem('chú thích và dòng trống ngắt nhóm (lệnh trước chú thích mất nhóm vì chưa có wait)', g(['left_move()', '# xong', 'wait()']) === G([2, 2, 1]) && g(['left_move()', '', 'wait()']) === G([2, 2, 1]));
  kiem('đổi bậc thụt giữa nhóm thì bỏ nhóm dở', g(['    left_move()', 'wait()']) === G([1, 1, 1]));
  kiem('lệnh không có wait() ở cuối: không vẽ ngoặc (đó là lỗi quen wait, lõi sẽ báo)', g(['left_move()', 'right_move()']) === '[]');
  kiem('aim(n) tác dụng ngay: không ngắt nhóm, không vào nhóm khi đứng đầu (aim, throw, wait → nhóm từ throw)', g(['aim(2)', 'throw()', 'wait()']) === G([1, 2, 1]) && g(['throw()', 'aim(3)', 'wait()']) === G([0, 2, 1]));
  kiem('lệnh cảm biến đứng riêng (front_clear()) không phải lệnh ra lệnh: ngắt nhóm', g(['front_clear()', 'wait()']) === G([1, 1, 1]));
  kiem('mọi lệnh gốc "chỉ ra lệnh" đều gom: bánh, trượt, tay, kẹp, đẩy, nam châm, ném, bắn',
    ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'arm_down', 'arm_up', 'grab', 'release', 'magnet_n', 'magnet_s', 'magnet_off', 'load', 'throw', 'shoot', 'shoot_back'].every((l) => g([l + '()', 'wait()']) === G([0, 1, 1])));
  kiem('có chú thích sau lệnh (left_move()  # trái) vẫn là lệnh gốc', g(['left_move()  # trái', 'wait()']) === G([0, 1, 1]));
  const nguonTP = fs.readFileSync(path.join(day, 'game', 'thanh-phan.js'), 'utf8'), mc = fs.readFileSync(path.join(day, 'game', 'man-choi.js'), 'utf8'), xh = fs.readFileSync(path.join(day, 'game', 'xuong-ham.js'), 'utf8');
  kiem('Editor vẽ ngoặc nhịp chỉ khi tuyChon.veNhip(); màn chơi và Xưởng đều truyền veNhip, trừ nhện / drone (go_* tự trôi nhịp)',
    /tuyChon\.veNhip && tuyChon\.veNhip\(\)/.test(nguonTP) && /veNhip: function[^}]*'nhen'[^}]*'drone'/.test(mc) && /veNhip: function[^}]*'nhen'[^}]*'drone'/.test(xh));
  kiem('ngoặc nhịp nằm bên phải (.nj), không đụng ngoặc for / if / while bên trái (.brk); nhãn "nhịp {n}"', /\.nj\{/.test(fs.readFileSync(path.join(day, 'game', 'choi.css'), 'utf8')) && ctx.t('choi.nhipNhan', { n: 3 }) === 'nhịp 3');
}

/* ================================================================= 9. KHUNG HƯỚNG DẪN */
console.log('\n== 9. HuongDan: chuỗi bước, sự kiện, hạn, cờ đã xem, làm sáng đích ==');
{
  luuGia.co = {};
  let xong = 0;
  const hd = HuongDan.chay({
    id: 't1', co: 'co-t1', khiXong: () => { xong++; },
    buoc: [{ dich: 'nut:chay', chu: 'Bước một', xong: 'chen-khoi' }, { dich: 'nut:lai', chu: () => 'Bước hai', xong: { su: 'xoa-dong', khi: (c) => c && c.dong === 2 } }, { dich: 'khoi:move', chu: 'Bước ba', xong: ['bam', 'mo-xuong'] }]
  });
  kiem('chay() chạy chuỗi từ bước 0; cùng id đang chạy thì trả về chính nó, không restart', HuongDan.dangChay('t1') && HuongDan.buocHienTai('t1') === 0 && HuongDan.chay({ id: 't1', buoc: [{ dich: 'nut:x', xong: 'bam' }] }) === hd);
  HuongDan.bao('khong-lien-quan'); HuongDan.bao('xoa-dong', { dong: 2 });
  kiem('sự kiện lạ hoặc sự kiện của bước sau không qua bước', HuongDan.buocHienTai('t1') === 0);
  HuongDan.bao('chen-khoi', { dong: 0 });
  kiem('sự kiện khớp điều kiện xong → sang bước kế', HuongDan.buocHienTai('t1') === 1);
  HuongDan.bao('xoa-dong', { dong: 1 });
  kiem('{ su, khi }: đúng sự kiện nhưng điều kiện khi sai thì chưa qua', HuongDan.buocHienTai('t1') === 1);
  HuongDan.bao('xoa-dong', { dong: 2 });
  kiem('{ su, khi } khớp cả hai → bước 3 (xong chứa mảng: bam hoặc sự kiện khác)', HuongDan.buocHienTai('t1') === 2 && xong === 0 && !luuGia.co['co-t1']);
  HuongDan.bao('mo-xuong');
  kiem('hết bước: gọi khiXong một lần, lưu cờ đã xem (luuKhi mặc định "xong"), chuỗi gỡ ra', xong === 1 && luuGia.co['co-t1'] === true && !HuongDan.dangChay('t1'));
  kiem('đã xem rồi thì chay() không chạy lại (trả về null)', HuongDan.chay({ id: 't1', co: 'co-t1', buoc: [{ dich: 'nut:x', xong: 'bam' }] }) === null && !HuongDan.dangChay('t1'));
  HuongDan.chay({ id: 't2', co: 'co-t2', buoc: [{ dich: 'nut:chay', xong: 'chay' }] }); HuongDan.dung('t2');
  kiem('dừng giữa chừng (rời màn) không lưu cờ khi luuKhi "xong": lần sau còn hiện', !luuGia.co['co-t2'] && !HuongDan.dangChay('t2') && !!HuongDan.chay({ id: 't2', co: 'co-t2', buoc: [{ dich: 'nut:chay', xong: 'chay' }] }));
  HuongDan.dung();
  HuongDan.chay({ id: 't3', co: 'co-t3', luuKhi: 'bat-dau', buoc: [{ dich: 'nut:chay', xong: 'chay' }] });
  kiem('luuKhi "bat-dau": cờ lưu ngay khi bắt đầu (mẹo chỉ hiện một lần dù chưa làm xong)', luuGia.co['co-t3'] === true && HuongDan.dangChay('t3'));
  HuongDan.dung();
  kiem('HuongDan.dung() không tham số gỡ mọi chuỗi', !HuongDan.dangChay());
  kiem('chuỗi sai dạng (không id / không bước) trả về null', HuongDan.chay({}) === null && HuongDan.chay({ id: 'x', buoc: [] }) === null);
  const hm = HuongDan.vaoMan({ ma: 'thu.1', huongDan: [{ dich: 'nut:chay', chu: 'Bấm Chạy', xong: 'chay' }] });
  kiem('man.huongDan khai trong dữ liệu màn: vaoMan chạy chuỗi, cờ mặc định "hd:" + mã màn; xong thì không hiện lại', !!hm && HuongDan.dangChay('man:thu.1') && (HuongDan.bao('chay'), luuGia.co['hd:thu.1'] === true) && HuongDan.vaoMan({ ma: 'thu.1', huongDan: [{ dich: 'nut:chay', xong: 'chay' }] }) === null && HuongDan.vaoMan({ ma: 'khong-co' }) === null);
  HuongDan.dung();

  // làm sáng đích: dựng "màn" giả có khung, nút, bong bóng
  const goc = new El('div'); goc.getBoundingClientRect = () => ({ left: 0, top: 0, right: 360, bottom: 640, width: 360, height: 640 }); goc.offsetWidth = 360; goc.offsetHeight = 640;
  const nut = new El('button'); nut.getBoundingClientRect = () => ({ left: 100, top: 400, right: 160, bottom: 430, width: 60, height: 30 }); nut.parentNode = goc;
  const nutAn = new El('button'); nutAn.getBoundingClientRect = () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 });
  let cokho = false;
  goc.querySelector = (sel) => (/bong\.show|ws-ov\.open|side\.busy/.test(sel) && cokho ? new El('i') : null);
  goc.querySelectorAll = (sel) => (/data-nut="chay"/.test(sel) ? [nutAn, nut] : []);
  const docCu = { qs: doc.querySelector, ae: doc.addEventListener };
  const baoBam = []; doc.querySelector = (s) => (/\.screen/.test(s) ? goc : null); doc.addEventListener = (ev, fn) => baoBam.push([ev, fn]);
  doc.createElement = (tag) => new El(tag);
  HuongDan.chay({ id: 'v1', buoc: [{ dich: 'nut:chay', chu: 'Bấm Chạy', xong: 'bam', han: 400, huong: 'tren' }] });
  const lopCua = (cls) => goc.children.filter((c) => c._cls.has(cls));
  kiem('đích thấy được (bỏ nút ẩn 0×0): dựng đúng 1 viền .hd-vien quanh đích + 1 bong bóng .hd-bong có mũi tên, bong bóng nằm trên đích khi huong "tren"',
    lopCua('hd-vien').length === 1 && lopCua('hd-bong').length === 1 && lopCua('hd-bong')[0]._cls.has('tren') && lopCua('hd-vien')[0].style.left === '98px' && lopCua('hd-vien')[0].style.width === '64px', J(goc.children.map((c) => c.className)));
  kiem('viền và bong bóng không có chữ cứng trong mã: lời bong bóng lấy từ bước', lopCua('hd-bong')[0].textContent === 'Bấm Chạy');
  cokho = true; HuongDan.nhip();
  kiem('đang có bong bóng đề bài / chẩn đoán (.bong.show) hay đang chạy (.side.busy) thì ẩn viền + bong bóng, hết cản thì hiện lại', lopCua('hd-vien').length === 0 && lopCua('hd-bong').length === 0 && (cokho = false, HuongDan.nhip(), lopCua('hd-vien').length === 1));
  HuongDan.nhip();
  kiem('han: đếm theo thời gian ĐÍCH ĐƯỢC THẤY (mỗi nhịp đồng hồ 200 ms): hai nhịp nữa là qua bước, chuỗi xong, viền / bong bóng gỡ hết', !HuongDan.dangChay('v1') && lopCua('hd-vien').length === 0 && lopCua('hd-bong').length === 0);
  HuongDan.chay({ id: 'v2', buoc: [{ dich: 'nut:chay', chu: 'a', xong: 'bam' }, { dich: 'nut:chay', chu: 'b', xong: 'bam' }] });
  const bam = baoBam.filter((x) => x[0] === 'click').map((x) => x[1]);
  kiem('xong "bam": click (giai đoạn bắt) trúng đích hoặc bên trong đích → qua bước; click chỗ khác thì không', bam.length >= 0 && (HuongDan.bam({ target: new El('i') }), HuongDan.buocHienTai('v2') === 0) && (HuongDan.bam({ target: nut }), HuongDan.buocHienTai('v2') === 1) && (HuongDan.bam({ target: nut }), !HuongDan.dangChay('v2')));
  HuongDan.dung(); doc.querySelector = docCu.qs; doc.addEventListener = docCu.ae;
  const nguonHD = fs.readFileSync(path.join(day, 'game', 'huong-dan.js'), 'utf8');
  kiem('huong-dan.js: một chuỗi một lúc (chuỗi mới đang hiện thì chuỗi cũ ẩn, không đếm hạn; nhịp vẽ chuỗi mới trước) và ẩn khi đang kéo (body.dang-keo)',
    /function biChuoiMoiChe\(c\)/.test(nguonHD) && /if \(biChuoiMoiChe\(c\)\) \{ gaHet\(c\); c\.dangHien = false; return false; \}/.test(nguonHD) && /CHUOI\.slice\(\)\.reverse\(\)\.forEach\(function \(c\)/.test(nguonHD) && /contains\('dang-keo'\)\) return true/.test(nguonHD));
  { const nx = fs.readFileSync(path.join(day, 'game', 'xuong-ham.js'), 'utf8');
    kiem('sân thử Xưởng: Đặt vật loại Vật ở MỌI màn (súng hơi có thêm loại Thùng nặng) chạm vật thì đổi gỗ → sắt → nam châm N → nam châm S → bỏ (không còn riêng màn nam châm)',
      nx.includes("} else if (che === 'vat') {") && nx.includes("if (coSung() || /[Hh]/.test(k)) ds.push('thung');") && !nx.includes('coNamCham') && nx.includes("chat: 'sat'") && nx.includes("cuc: 'N'") && nx.includes("cuc: 'S'")); }
  { const nx = fs.readFileSync(path.join(day, 'game', 'xuong-ham.js'), 'utf8'), nc = fs.readFileSync(path.join(day, 'cham.js'), 'utf8');
    kiem('Xưởng (15/10): năm nút Chạy / Lại / Đặt xe / Đặt vật / Đặt sàn (không còn nút Tường, Ô, Rổ, Pin, Màu riêng); đối số thử, pin, rổ ở thanh tên hàm',
      nx.includes("data-nut=\"' + CHE.vat + '\" data-che=\"vat\"") && nx.includes("data-nut=\"' + CHE.san + '\" data-che=\"san\"") && !nx.includes('CHE.tuong') && !nx.includes('nut-o') && nx.includes('<span class="dso"></span>') && nx.includes("chip('nut-pin'") && nx.includes("chip('nut-ro'"));
    kiem('sân thử nhận ký hiệu sân (bậc thang S, gầm n, hố u, băng chuyền < > ^ v) qua sanThu.ky: chuanSanThu lọc, hangSanThu vẽ vào hàng',
      (() => { const st = ChamHoc.chuanSanThu({ rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, tuong: [{ x: 0, y: 0 }], ky: [{ x: 1, y: 1, ky: 'S' }, { x: 2, y: 2, ky: 'u' }, { x: 0, y: 0, ky: 'n' }, { x: 3, y: 1, ky: '>' }, { x: 4, y: 4, ky: 'Q' }] }); const r = ChamHoc.hangSanThu(st); return st.ky.length === 2 && r[1] === '.S.>.' && r[0][0] === '#'; })() && nc.includes("'Snu<>^v'"));
  }
  { // MỖI BỘ PHẬN MỘT LỆNH MỖI NHỊP (thanh-phan.js: lenhCungNhip / lyDoCamNhip, Editor.chenTai, Palette.datCamNhip)
    const J = (x) => JSON.stringify(x), L = (a, at, b) => TP.lenhCungNhip(a, at, b || 0), C = (ten, ds) => TP.lyDoCamNhip(ten, ds);
    const hai = ['left_move()', 'right_move()', 'wait()'];
    kiem('lenhCungNhip: chèn sau wait() là nhịp mới (rỗng); chèn trước wait() / đầu khung lấy các lệnh gốc liền đó', J(L(hai, 3)) === '[]' && J(L(hai, 2)) === '["right_move","left_move"]' && J(L(hai, 0)) === '["left_move","right_move"]', J([L(hai, 3), L(hai, 2), L(hai, 0)]));
    kiem('lenhCungNhip: chỉ dòng cùng bậc thụt (trong for), dừng ở dòng khác (lời gọi hàm), ranh nhịp go_*() của nhện / drone, bỏ qua aim()',
      J(L(['for i in range(2):', '    left_move()', '    wait()'], 2, 1)) === '["left_move"]' && J(L(['move()', 'left_move()'], 2)) === '["left_move"]'
      && J(L(['crouch()', 'go_right()', 'stand()'], 1)) === '["crouch"]' && J(L(['crouch()', 'go_right()', 'stand()'], 3)) === '["stand"]' && J(L(['aim(2)', 'load()'], 2)) === '["load","aim"]');
    const camDu = [['left_back', ['left_move']], ['left_move', ['left_move']], ['arm_up', ['arm_down']], ['release', ['grab']], ['magnet_s', ['magnet_n']], ['magnet_off', ['magnet_s']], ['stand', ['crouch']], ['arm_right', ['arm_left']], ['throw', ['load']], ['shoot', ['shoot']], ['shoot_back', ['shoot']], ['shoot', ['shoot_back']], ['slide_right', ['slide_left']]];
    kiem('cùng bộ phận trong một nhịp thì cấm: bánh trái, tay lên / xuống, gắp / thả, nam châm N / S / ngắt, chân nhện co / duỗi, khớp xoay, máy ném, súng hơi (hai nòng cùng một bộ phận), trượt',
      camDu.every(([a, ds]) => !!C(a, ds)), camDu.filter(([a, ds]) => !C(a, ds)).map((x) => x[0]).join(', '));
    const duoc = [['right_move', ['left_move']], ['grab', ['arm_down']], ['arm_left', ['arm_down', 'grab']], ['wait', ['left_move']], ['move', ['left_move']], ['left_move', []], ['magnet_n', ['left_move', 'right_move']]];
    kiem('khác bộ phận thì được (hai bánh, tay + kẹp + khớp xoay, nam châm + bánh); wait() và lời gọi hàm luôn được', duoc.every(([a, ds]) => C(a, ds) === null), duoc.filter(([a, ds]) => C(a, ds) !== null).map((x) => x[0]).join(', '));
    kiem('một nhịp một kiểu đi: trượt (omni không đi chéo) hay bắn / đẩy (xe đứng yên) không đi chung lệnh bánh',
      !!C('left_move', ['slide_left']) && !!C('slide_right', ['right_move']) && !!C('left_move', ['shoot']) && !!C('shoot_back', ['left_back']) && C('grab', ['slide_left']) === null);
    kiem('câu báo nói tên bộ phận và lệnh đã có ("Bánh trái đã có left_move()…", "Tay đã có arm_down()…") và cách sửa (thêm wait())',
      /^Bánh trái đã có left_move\(\)/.test(C('left_back', ['left_move'])) && /^Tay đã có arm_down\(\)/.test(C('arm_up', ['arm_down'])) && /wait\(\)/.test(C('arm_up', ['arm_down'])) && /slide_left\(\)/.test(C('left_move', ['slide_left'])));
    const nTP = fs.readFileSync(path.join(day, 'game', 'thanh-phan.js'), 'utf8'), nC = fs.readFileSync(path.join(day, 'game', 'man-choi.js'), 'utf8'), nX = fs.readFileSync(path.join(day, 'game', 'xuong-ham.js'), 'utf8');
    const lenhNhip = JSON.parse(/var LENH_NHIP = (\[[^\]]*\])/.exec(nTP)[1].replace(/'/g, '"'));
    const bp = new Set(Object.values(TP.BO_PHAN_LENH).flat());
    { // lời giải / công thức khác / lời giải khác của MỌI màn gõ được theo thứ tự từ trên xuống mà không bị chặn (không có hai lệnh cùng bộ phận trong một nhịp)
      const nap = (arr) => { const loi = []; (arr || []).forEach((d, i) => { const m = /^\s*([A-Za-z_]\w*)\s*\([^()]*\)\s*(#.*)?$/.exec(d); if (!m) return; const ly = C(m[1], L(arr.slice(0, i), i, TP.bacCua(d))); if (ly) loi.push((i + 1) + ':' + m[1]); }); return loi; };
      const sai = [];
      ManHoc.danhSach.forEach((m) => {
        [['loiGiai', m.loiGiai], ['loiGiaiKhac', m.loiGiaiKhac && m.loiGiaiKhac.baiLam]].concat((m.congThucKhac || []).map((c, i) => ['congThucKhac' + i, c.baiLam || c])).forEach(([ten, b]) => {
          if (!b) return;
          [['chinh', b.chinh]].concat((b.hamCuaEmMoi || []).concat(b.hamCuaMan || []).map((h) => [h.ten, h.than])).forEach(([k, arr]) => { const l = nap(arr); if (l.length) sai.push(m.ma + ' ' + ten + ' ' + k + ' ' + l.join(',')); });
        });
      });
      kiem('lời giải, lời giải khác, công thức khác của mọi màn không có hai lệnh cùng bộ phận (hay khác kiểu đi) trong một nhịp — người chơi gõ được', sai.length === 0, sai.slice(0, 6).join(' · '));
    }
    kiem('mọi lệnh gốc trong một nhịp (LENH_NHIP) đều thuộc một bộ phận', lenhNhip.every((l) => bp.has(l)), lenhNhip.filter((l) => !bp.has(l)).join(', '));
    kiem('Editor.chenTai kiểm trước khi chèn (khiCamNhip, trả null), render báo khay (khiNhip → Palette.datCamNhip); khung chính và Xưởng đều nối; khung chính chỉ báo "đầy khung" khi chen() === false',
      /var lyCam = lyDoCamNhip\(tenDon\(txt\), lenhCungNhip\(arr, at, b\)\);/.test(nTP) && nTP.indexOf('var lyCam') < nTP.indexOf("arr.splice(at, 0, datBac(thichNghi(txt, at, b), b));")
      && /if \(!xt && tuyChon\.khiNhip\) tuyChon\.khiNhip\(this\.camNhip\(\)\);/.test(nTP) && /this\.datCamNhip = function/.test(nTP)
      && [nC, nX].every((s) => /khiCamNhip: function \(ly\)/.test(s) && /khiNhip: function \(cam\) \{ if \(S\.pal\) S\.pal\.datCamNhip\(cam\); \}/.test(s)) && /S\.ed\.chen\(txt\) === false/.test(nC));
  }
  kiem('cách dùng ghi ở đầu tệp huong-dan.js (CÁCH DÙNG, MỘT BƯỚC, dich / chu / xong / man.huongDan)', /CÁCH DÙNG/.test(nguonHD) && /MỘT BƯỚC/.test(nguonHD) && /man\.huongDan/.test(nguonHD) && /'chen-khoi'/.test(nguonHD) && /'doi-the'/.test(nguonHD));

  // hai hướng dẫn dựng trên khung: xóa dòng (Editor) và ◀ ▶ (Palette)
  const nguonTP = fs.readFileSync(path.join(day, 'game', 'thanh-phan.js'), 'utf8');
  kiem('hướng dẫn xóa dòng dựng bằng HuongDan.chay: id "xoa-dong", cờ "meo-xoa" lưu khi bắt đầu, hai bước (dòng vừa chèn → nút ✕), sự kiện chon-dong / xoa-dong / hoan-tac / chen-khoi báo từ Editor',
    /id: 'xoa-dong', co: 'meo-xoa', luuKhi: 'bat-dau'/.test(nguonTP) && /xong: 'chon-dong'/.test(nguonTP) && /xong: \['xoa-dong', 'hoan-tac'\]/.test(nguonTP) && ["'chen-khoi'", "'chon-dong'", "'xoa-dong'", "'hoan-tac'"].every((x) => nguonTP.includes('baoHd(' + x)));
  kiem('hướng dẫn ◀ ▶ dựng bằng HuongDan.chay: id "doi-the", cờ "meo-the" / "meo-the-cam", làm sáng CẢ HAI nút ◀ ▶, xong khi người chơi đổi thẻ (sự kiện doi-the)',
    /id: 'doi-the', co: g\.co, luuKhi: 'xong'/.test(nguonTP) && /dich: function \(\) \{ return \[nutTruoc, nutSau\]; \}/.test(nguonTP) && /xong: 'doi-the'/.test(nguonTP) && /HuongDan\.bao\('doi-the'/.test(nguonTP));
  // chạy thật trên khay: màn đầu có 2 thẻ → chuỗi doi-the chạy; bấm ▶ → xong + cờ
  luuGia.co = {}; HuongDan.dung();
  const kg = khayMoi({ goiYThe: true }); kg.pal.dung(specMan(man('tay-gap.1'), KHO_CH, []));
  kiem('khay có từ 2 thẻ lần đầu (màn đầu chương Tay gắp): chuỗi "doi-the" chạy (làm sáng ◀ ▶); khay chỉ 1 thẻ thì không', HuongDan.dangChay('doi-the') && (HuongDan.dung(), kg.pal.dung(specMan(man('hai-banh.1'), KHO_CH, [])), !HuongDan.dangChay('doi-the')));
  const kh = khayMoi({ goiYThe: true }); kh.pal.dung(specMan(man('tay-gap.1'), KHO_CH, []));
  kh.bh.querySelector('.pal-the').children.filter((x) => x._cls.has('cuon-b'))[1].click();
  kiem('người chơi bấm ▶ lần đầu: chuỗi xong, cờ "meo-the" lưu, vẽ lại khay không nhắc nữa', !HuongDan.dangChay('doi-the') && luuGia.co['meo-the'] === true && (kh.pal.dung(specMan(man('tay-gap.1'), KHO_CH, [], { lamMoi: false })), !HuongDan.dangChay('doi-the')));
  luuGia.co = { 'meo-the': true }; HuongDan.dung();
  const kc = khayMoi({ goiYThe: true }); kc.pal.dung(specMan(man('khoang-cach.9'), KHO_CH, []));
  kiem('lần đầu có thẻ Cảm biến (đã biết đổi thẻ từ Tay gắp): vẫn nhắc, vì cờ "meo-the-cam" chưa có; đổi thẻ xong thì lưu cả hai cờ', HuongDan.dangChay('doi-the') && (kc.bh.querySelector('.pal-the').children.filter((x) => x._cls.has('cuon-b'))[0].click(), !HuongDan.dangChay('doi-the') && luuGia.co['meo-the-cam'] === true));
  HuongDan.dung(); luuGia.co = {};
  const kx = khayMoi(); kx.pal.dung(specMan(man('tay-gap.1'), KHO_CH, []));
  kiem('khay Xưởng / khay không bật goiYThe không hướng dẫn đổi thẻ', !HuongDan.dangChay('doi-the'));
  HuongDan.dung();
}

/* ================================================================= 10. ĐÈN THEO BỘ PHẬN */
console.log('\n== 10. DenBoPhan: bộ phận có trên màn, bộ phận sáng theo vết thật ==');
{
  const dsBp = (ma) => J(DenBoPhan.boPhanCuaMan(man(ma)));
  kiem('hai bánh (hai-banh.1): bánh trái, bánh phải', dsBp('hai-banh.1') === '["banhT","banhP"]');
  kiem('tay gắp (tay-gap.1): bánh trái, bánh phải, tay, kẹp', dsBp('tay-gap.1') === '["banhT","banhP","tay","kep"]');
  kiem('xe + tay + cảm biến (khoang-cach.9): thêm cảm biến ở cuối', dsBp('khoang-cach.9') === '["banhT","banhP","tay","kep","camBien"]');
  kiem('omni (omni.3): thêm đèn trượt; xích (xich.3) như bánh; nhện (nhen.4): chỉ chân; drone (drone.5): cánh quạt (+ cảm biến pin)', dsBp('omni.3') === '["banhT","banhP","truot"]' && dsBp('xich.3') === '["banhT","banhP"]' && dsBp('nhen.4') === '["chan"]' && J(DenBoPhan.boPhanCuaMan(man('drone.5'))).includes('"canh"') && !J(DenBoPhan.boPhanCuaMan(man('drone.5'))).includes('banh'));
  kiem('nam châm / máy ném / súng hơi có đèn riêng; không còn đèn tấm đẩy', ['nam-cham.3', 'may-nem.4', 'sung-hoi.3'].map((m) => DenBoPhan.boPhanCuaMan(man(m)).slice(2).join()).join('|') === 'namCham|nem|sung', ['nam-cham.3', 'may-nem.4', 'sung-hoi.3'].map((m) => DenBoPhan.boPhanCuaMan(man(m)).slice(2).join()).join('|'));
  const THU_TU = ['banhT', 'banhP', 'truot', 'tay', 'xoay', 'kep', 'namCham', 'nem', 'sung', 'camBien', 'chan', 'canh'];      // như den-bo-phan.js (xoay: khớp tay xoay)
  kiem('mọi màn: có ít nhất một bộ phận, đúng thứ tự hiển thị, không quá 7 (vừa ô đồng hồ), xe bánh có đủ hai bánh', ManHoc.danhSach.every((m) => { const d = DenBoPhan.boPhanCuaMan(m); const idx = d.map((k) => THU_TU.indexOf(k)); return d.length >= 1 && d.length <= 7 && idx.every((i, j) => i >= 0 && (j === 0 || idx[j - 1] < i)) && (['nhen', 'drone'].includes(m.loaiRobot) || (d.includes('banhT') && d.includes('banhP'))); }));
  // phan() thuần túy
  const P = (e, l) => DenBoPhan.phan(e, l);
  kiem('bánh trái / phải theo robot.banh: chỉ trái chạy → banhT sáng, banhP tắt; đứng yên → cả hai tắt', P({ robot: { banh: { trai: 1, phai: 0 } } }, []).banhT === true && P({ robot: { banh: { trai: 1, phai: 0 } } }, []).banhP === false && !P({ robot: { banh: { trai: 0, phai: 0 } } }, []).banhT);
  kiem('omni trượt (robot.truot ≠ 0): đèn trượt + cả hai bánh sáng', (() => { const r = P({ robot: { banh: { trai: 0, phai: 0 }, truot: 1 } }, []); return r.truot && r.banhT && r.banhP; })());
  kiem('tay: lệnh arm_up / arm_down; kẹp: grab / release; không lẫn nhau', (() => { const r = P({ robot: {} }, [{ ten: 'arm_down' }, { ten: 'wait' }]), r2 = P({ robot: {} }, [{ ten: 'release' }]); return r.tay && !r.kep && r2.kep && !r2.tay; })());
  kiem('nam châm: lệnh magnet_n / magnet_s / off hoặc nam châm đang bật; máy ném: load / throw; súng hơi: shoot hay shoot_back', (() => { const a = P({ robot: { namCham: { bat: true } } }, []), b = P({ robot: {} }, [{ ten: 'magnet_off' }]), c = P({ robot: {} }, [{ ten: 'throw' }]), d = P({ robot: {} }, [{ ten: 'shoot' }]), e = P({ robot: {} }, [{ ten: 'shoot_back' }]); return a.namCham && b.namCham && c.nem && d.sung && e.sung && e.day === undefined && !c.sung; })());
  kiem('cảm biến: mục lệnh có docCamBien hoặc front_clear / color / battery…, hoặc sự kiện doc-cam-bien; nhện: chuan-bi / di; drone: di / dung-yen', (() => { return P({ robot: {} }, [{ ten: 'front_clear', docCamBien: {} }]).camBien && P({ robot: {} }, [{ ten: 'color' }]).camBien && P({ robot: {}, suKien: [{ ma: 'doc-cam-bien' }] }, []).camBien && !P({ robot: {} }, [{ ten: 'wait' }]).camBien && P({ robot: {}, suKien: [{ ma: 'chuan-bi' }] }, []).chan && P({ robot: {}, suKien: [{ ma: 'di' }] }, []).chan && P({ robot: {}, suKien: [{ ma: 'dung-yen' }] }, []).canh && !P({ robot: {}, suKien: [{ ma: 'dung-yen' }] }, []).chan; })());
  // theo vết thật của lời giải
  function khoDen(m) {
    const kho = [];
    const them = (f) => { const i = kho.findIndex((k) => k.ten === f.ten); const o = { ten: f.ten, thamSo: (f.thamSo || []).slice(), than: f.than.slice() }; if (i < 0) kho.push(o); else kho[i] = o; };
    for (const x of ManHoc.danhSach) { if (x.ma === m.ma) break; ((x.loiGiai && x.loiGiai.hamCuaEmMoi) || []).forEach(them); }
    ((m.loiGiai && m.loiGiai.hamCuaEmMoi) || []).forEach(them);
    return kho;
  }
  function nhipSang(ma) {   // [{ e, sang }] cho mọi nhịp của vết sân đầu của lời giải
    const m = man(ma), kq = ChamHoc.cham(m, m.loiGiai, khoDen(m)), vet = kq.theoSan[0].vet, ds = []; let lenh = [];
    for (const e of vet) { if (e.loai === 'lenh') lenh.push(e); else { ds.push({ e, lenh, sang: DenBoPhan.phan(e, lenh) }); lenh = []; } }
    return ds;
  }
  const dem = (ds, k) => ds.filter((x) => x.sang[k]).length;
  let ds = nhipSang('tay-gap.1');
  kiem('tay-gap.1 (vết thật): tay sáng đúng ở nhịp có arm_up / arm_down, kẹp ở nhịp có grab / release, bánh theo robot.banh; có nhịp nào cũng sáng ít nhất một lần',
    ds.every((x) => x.sang.tay === x.lenh.some((l) => ['arm_up', 'arm_down'].includes(l.ten)) && x.sang.kep === x.lenh.some((l) => ['grab', 'release'].includes(l.ten)) && x.sang.banhT === (x.e.robot.banh.trai !== 0)) && dem(ds, 'tay') >= 2 && dem(ds, 'kep') >= 2 && dem(ds, 'banhT') >= 1, J(ds.map((x) => Object.keys(x.sang).filter((k) => x.sang[k]).join('+'))));
  ds = nhipSang('khoang-cach.5');
  kiem('khoang-cach.5: cảm biến sáng ở mỗi nhịp đọc front_clear()', dem(ds, 'camBien') >= 3 && ds.every((x) => x.sang.camBien === x.lenh.some((l) => l.docCamBien || l.ten === 'front_clear')));
  ds = nhipSang('nhen.4');
  kiem('nhện (nhen.4): đèn chân sáng ở nhịp chuẩn bị và nhịp bước, không đèn bánh nào có trong danh sách', dem(ds, 'chan') >= 4 && !DenBoPhan.boPhanCuaMan(man('nhen.4')).includes('banhT'));
  ds = nhipSang('drone.5');
  kiem('drone (drone.5): cánh quạt sáng khi bay, cảm biến pin nháy khi gọi battery()', dem(ds, 'canh') >= 4 && dem(ds, 'camBien') >= 1);
  for (const [ma, k] of [['omni.3', 'truot'], ['nam-cham.3', 'namCham'], ['may-nem.4', 'nem'], ['sung-hoi.3', 'sung'], ['sung-hoi.5', 'sung']]) {
    ds = nhipSang(ma);
    kiem(ma + ' (vết thật): đèn "' + k + '" sáng ít nhất một nhịp', dem(ds, k) >= 1, J(ds.map((x) => Object.keys(x.sang).filter((q) => x.sang[q]).join('+'))));
  }
  const nguonMC = fs.readFileSync(path.join(day, 'game', 'man-choi.js'), 'utf8'), cssDen = fs.readFileSync(path.join(day, 'game', 'choi.css'), 'utf8');
  kiem('man-choi.js: đèn nạp theo màn (DenBoPhan.nap), sáng TRƯỚC khi phát nhịp và tắt SAU khi phát xong, tắt khi chạy lại; không còn đèn T / P cũ', /DenBoPhan\.nap\(m\)/.test(nguonMC) && /DenBoPhan\.bat\(e, lenhNhip\)[\s\S]{0,80}phatNhip[\s\S]{0,120}DenBoPhan\.tat\(true\)/.test(nguonMC) && /DenBoPhan\.tat\(\);/.test(nguonMC) && !/class="lamps"/.test(nguonMC) && !/\.lamp\{/.test(cssDen));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

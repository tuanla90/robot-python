/* ============================================================================
   kiem-gioi-thieu-part.mjs — máy kiểm THẺ GIỚI THIỆU BỘ PHẬN (gioi-thieu-part.js + game/the-part.js).
     1. dữ liệu: mỗi mã có thẻ, mỗi lệnh của thẻ có câu mô tả (SoLenh.lenhGoc hay moTaLenh), dòng "ghép" chỉ dùng lệnh của bộ phận (+ wait);
     2. LUẬT ĐÚNG LÕI: dòng ghép có `ket` chạy thật SanHoc.chay trên sân trống 5×5 (robot ở (2,2) mặt lên) và tới đúng chỗ, đúng hướng thẻ ghi;
     3. PHỦ HẾT: ở MỌI màn (màn lắp ráp: mọi cách lắp vừa ngân sách), mọi lệnh gốc của robot thuộc một bộ phận nào đó đều nằm trong thẻ của một bộ phận robot đang có;
        đi hết các màn theo thứ tự game, mỗi bộ phận được giới thiệu ở màn đầu tiên có nó, lệnh mở thêm sau đó vào thẻ "lệnh mới";
        (gói V8c) đi bằng chính GioiThieuPart.theCanHien / khoaDaXem mà the-part.js dùng; tay 'xoay' = tay kẹp mở thêm xoay: đã xem tay kẹp thì chỉ thẻ lệnh mới;
     3b. (gói V8c) MỘT TAY KẸP: đã xem 'kep' → robot 'xoay' chỉ ra thẻ lệnh mới arm_left / arm_right; chưa xem → thẻ đầy đủ; Sổ lệnh một dòng; lõi chạy đúng dòng ghép xoay;
     4. giao diện: choi.html nạp dữ liệu trước the-part.js, man-choi.js gọi ThePart.choMan trước đề bài, Sổ lệnh có trang "Bộ phận".
   Chạy: node hoc/kiem-gioi-thieu-part.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const GT = require(path.join(day, 'gioi-thieu-part.js'));
const SoLenh = require(path.join(day, 'so-lenh.js'));
const SanHoc = require(path.join(day, 'san-hoc.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));
let ManHoc = null;
for (const f of fs.readdirSync(day).filter((x) => /^man-.*[.]js$/.test(x)).sort()) {
  try { ManHoc = require(path.join(day, f)); } catch (e) { /* bỏ qua */ }
}
// VeRobot.cauHinhCua là hàm thuần nhưng tệp chỉ gắn vào window: chạy tệp trong một window giả.
const hop = { window: {} }; hop.window.window = hop.window;
vm.runInNewContext(fs.readFileSync(path.join(day, 'game', 've-robot.js'), 'utf8'), hop.window);
const VeRobot = hop.window.VeRobot;

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) dat++;
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const moTaGoc = Object.fromEntries(SoLenh.lenhGoc.map((l) => [l.ten, l.moTa]));

console.log('1. dữ liệu thẻ');
kiem('THU_TU và DS cùng các mã', J([...GT.THU_TU].sort()) === J(Object.keys(GT.DS).sort()), J(GT.THU_TU));
for (const ma of GT.THU_TU) {
  const d = GT.DS[ma];
  kiem(ma + ': có khe, tên, mô tả, lệnh', ['than', 'tay', 'camBien'].includes(d.khe) && d.ten && d.moTa && d.lenh.length > 0);
  for (const l of d.lenh) kiem(ma + ': lệnh ' + l + ' có câu mô tả', !!((d.moTaLenh && d.moTaLenh[l]) || moTaGoc[l]));
  for (const g of d.ghep || []) kiem(ma + ': dòng ghép "' + g.ra + '" chỉ dùng lệnh của bộ phận', g.lenh.every((l) => l === 'wait' || d.lenh.includes(l)), J(g.lenh));
  const nd = GT.noiDung(ma, d.lenh, null, null, moTaGoc);
  kiem(ma + ': thẻ đầy đủ có lệnh và mục giỏi / không làm được', nd.lenh.length === d.lenh.length && nd.gioi.length > 0 && nd.khong.length > 0);
  const chu = [nd.ten, nd.moTa, ...nd.lenh.map((l) => l.moTa), ...(d.ghep || []).map((g) => g.ra), ...nd.gioi, ...nd.khong, ...nd.luuY, ...(d.luuY || []).map((m) => (typeof m === 'string' ? m : m.chu))];
  const ngoac = chu.filter((x) => /[()]/.test(String(x).replace(/[A-Za-z_…]+\((?:n|path|d)?\)/g, '')));
  kiem(ma + ': câu chữ không có dấu ngoặc ngoài tên lệnh (phông Handjet vẽ "(" thành "[")', ngoac.length === 0, J(ngoac));
}

console.log('2. dòng ghép chạy thật trên lõi');
const LOAI = { 'hai-banh': 'banh', xich: 'xich', omni: 'omni' };
const TRONG = ['.....', '.....', '.....', '.....', '.....'];
let soKet = 0;
for (const ma of GT.THU_TU) {
  for (const g of GT.DS[ma].ghep || []) {
    if (!g.ket) continue;
    soKet++;
    const r = SanHoc.chay({ san: TRONG, batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: LOAI[ma] }, g.lenh.map((l) => l + '()').join('\n') + '\n');
    const rb = r.robot || {};
    const ok = !r.loi && rb.x === g.ket.x && rb.y === g.ket.y && rb.huong === g.ket.huong && (g.ket.quayDo === undefined || r.quayDo === g.ket.quayDo || rb.quayDo === g.ket.quayDo);
    kiem(ma + ': "' + g.ra + '"', ok, J({ loi: r.loi, robot: rb, quayDo: r.quayDo }));
  }
}
kiem('có dòng ghép được chạy thử', soKet >= 10, soKet);
{ // tay kẹp: "hạ tay rồi kẹp trong một nhịp", nâng, đi, "hạ tay rồi đặt xuống"
  const r = SanHoc.chay({ san: ['.....', '..o..', '.....', '.....'], batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'] },
    ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()'].join('\n') + '\n');
  kiem('kep: hạ tay + kẹp cùng nhịp nhặt được vật, đặt xuống được', !r.loi && r.vat[0].x === 2 && r.vat[0].y === 0 && r.vat[0].trangThai === 'dat' && r.robot.y === 1, J({ loi: r.loi, vat: r.vat, robot: r.robot }));
}

console.log('3. mọi lệnh gốc của mọi màn đều có thẻ');
const LENH_PART = new Set(GT.THU_TU.flatMap((ma) => GT.DS[ma].lenh));
const xem = new Set(), moDau = {}, moLenh = {};
let soMan = 0;
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
const viTri = (m) => ThuTu.thuTu.indexOf(m.chuong);
const thuTu = ManHoc.danhSach.slice().sort((a, b) => viTri(a) - viTri(b) || a.so - b.so);     // đúng thứ tự người chơi gặp
for (const m0 of thuTu) {
  const bien = m0.lapRap ? LapRap.dsCachLap(m0).map((c) => LapRap.apDung(m0, c)) : [m0];
  for (const m of bien) {
    soMan++;
    const cfg = VeRobot.cauHinhCua(m), goc = m.hamGoc || [];
    const bp = GT.boPhanCua(cfg, goc);
    const phu = new Set(bp.flatMap((b) => b.lenh));
    const thieu = goc.filter((l) => LENH_PART.has(l) && !phu.has(l));
    kiem(m.ma + (m0.lapRap ? ' [' + LapRap.moTa(cfg) + ']' : '') + ': lệnh gốc nào cũng thuộc thẻ một bộ phận đang gắn', thieu.length === 0, J({ thieu, cfg: { than: cfg.than, tay: cfg.tay, cam: cfg.camBien.map((c) => c.ma) } }));
    kiem(m.ma + ': thân có thẻ', bp.length > 0 && bp[0].ma === (cfg.than || 'hai-banh'), J(bp.map((b) => b.ma)));
    if (m0.lapRap && m !== bien[0]) continue;                              // đi game theo cách lắp mặc định
    const daXemK = (k) => xem.has(k);
    for (const nd of GT.theCanHien(cfg, goc, daXemK, moTaGoc)) {
      const b = bp.find((x) => x.ma === nd.ma), nhom = GT.cungBoPhan(nd.ma);
      const lenhMoi = b.lenh.filter((l) => !nhom.some((x) => xem.has('part-lenh:' + x + ':' + l)));
      if (!nd.laMoi) { moDau[nd.ma] = moDau[nd.ma] || m.ma; kiem(m.ma + ': thẻ đầy đủ của ' + nd.ma + ' có mô tả', !!nd.moTa && nd.lenh.length === b.lenh.length && !nhom.some((x) => xem.has('part:' + x))); }
      else {
        kiem(m.ma + ': thẻ lệnh mới của ' + nd.ma + ' chỉ có lệnh mới ' + J(lenhMoi), J(nd.lenh.map((l) => l.ten).sort()) === J(lenhMoi.slice().sort()) && !nd.moTa, J(nd.lenh));
        nd.lenh.forEach((l) => { moLenh[nd.ma + ':' + l.ten] = moLenh[nd.ma + ':' + l.ten] || m.ma; });
      }
    }
    GT.khoaDaXem(cfg, goc).forEach((k) => xem.add(k));
  }
}
kiem('đã dò ≥ 300 màn (cả các cách lắp)', soMan >= 300, soMan);
kiem('hai bánh được giới thiệu ở màn đầu tiên', moDau['hai-banh'] === thuTu[0].ma, moDau['hai-banh']);
for (const ma of ['xich', 'omni', 'nhen', 'drone', 'kep', 'nam-cham', 'nem', 'hoi', 'khoang-cach', 'tu', 'mau', 'camera', 'camera-bay'])
  kiem('bộ phận ' + ma + ' có màn giới thiệu trong game', !!moDau[ma]);
console.log('   màn giới thiệu: ' + GT.THU_TU.map((ma) => ma + '=' + (moDau[ma] || '—')).join(' · '));
// gói V8c: đi đúng thứ tự game thì tay 'xoay' KHÔNG có thẻ đầy đủ (là tay kẹp đã gặp ở gói 2), arm_left / arm_right vào thẻ lệnh mới ở tay-xoay.1
kiem('V8c: đi đúng thứ tự game, tay xoay không có thẻ "bộ phận mới" (cùng tay kẹp)', !moDau.xoay, moDau.xoay);
kiem('V8c: arm_left / arm_right được giới thiệu ở thẻ lệnh mới của tay-xoay.1', moLenh['xoay:arm_left'] === 'tay-xoay.1' && moLenh['xoay:arm_right'] === 'tay-xoay.1', J(moLenh));

console.log('3b. (V8c) một tay kẹp: thẻ lệnh mới khi mở xoay');
{
  const tim = (ma) => ManHoc.danhSach.find((m) => m.ma === ma);
  const mKep = tim('tay-gap.1'), mXoay = tim('tay-xoay.1');
  const cK = VeRobot.cauHinhCua(mKep), cX = VeRobot.cauHinhCua(mXoay);
  kiem('V8c: tay-gap.1 gắn tay kep, tay-xoay.1 gắn tay xoay (mã giữ nguyên)', cK.tay === 'kep' && cX.tay === 'xoay', J([cK.tay, cX.tay]));
  kiem('V8c: xoay cùng bộ phận với kep (nangCapCua)', J(GT.cungBoPhan('xoay')) === J(['kep', 'xoay']) && J(GT.cungBoPhan('kep')) === J(['kep', 'xoay']) && J(GT.cungBoPhan('nem')) === J(['nem']));
  kiem('V8c: tên hiển thị nhất quán: kep và xoay cùng tên "Tay kẹp"', GT.DS.kep.ten === 'Tay kẹp' && GT.DS.xoay.ten === GT.DS.kep.ten, J([GT.DS.kep.ten, GT.DS.xoay.ten]));
  const tayCua = (ds) => ds.filter((nd) => nd.khe === 'tay');
  // đã xem tay kẹp (vào tay-gap.1 trước) → robot tay xoay: chỉ thẻ LỆNH MỚI arm_left / arm_right
  const daKep = new Set(GT.khoaDaXem(cK, mKep.hamGoc));
  const t1 = tayCua(GT.theCanHien(cX, mXoay.hamGoc, (k) => daKep.has(k), moTaGoc));
  kiem('V8c: đã xem tay kẹp → tay-xoay.1 chỉ một thẻ tay, là thẻ lệnh mới', t1.length === 1 && t1[0].laMoi === true && t1[0].ma === 'xoay' && !t1[0].moTa, J(t1.map((x) => [x.ma, x.laMoi])));
  kiem('V8c: thẻ lệnh mới chỉ có arm_left, arm_right', t1.length === 1 && J(t1[0].lenh.map((l) => l.ten)) === J(['arm_left', 'arm_right']), t1[0] && J(t1[0].lenh));
  kiem('V8c: thẻ lệnh mới có câu mô tả xoay trái / phải, có mục làm tốt / không làm được / nhớ về xoay', t1.length === 1 && t1[0].lenh.every((l) => /xoay/i.test(l.moTa)) && t1[0].gioi.length > 0 && t1[0].khong.length > 0 && t1[0].luuY.length > 0
    && ![...t1[0].gioi, ...t1[0].khong, ...t1[0].luuY].includes('Lệnh tay cũng chỉ là ra lệnh, wait() mới làm.'), t1[0] && J(t1[0]));
  kiem('V8c: thẻ lệnh mới chỉ ghép dòng có lệnh xoay', t1.length === 1 && t1[0].ghep.length > 0 && t1[0].ghep.every((g) => g.lenh.some((l) => l === 'arm_left' || l === 'arm_right')), t1[0] && J(t1[0].ghep));
  // chưa xem tay kẹp (mở hết gói, vào thẳng gói 6) → thẻ đầy đủ
  const t2 = tayCua(GT.theCanHien(cX, mXoay.hamGoc, () => false, moTaGoc));
  kiem('V8c: chưa xem tay kẹp → tay-xoay.1 ra thẻ đầy đủ (mô tả + đủ lệnh của màn)', t2.length === 1 && !t2[0].laMoi && !!t2[0].moTa && t2[0].lenh.length === GT.boPhanCua(cX, mXoay.hamGoc).find((b) => b.ma === 'xoay').lenh.length, J(t2.map((x) => [x.ma, x.laMoi, x.lenh.length])));
  // đã xem tay kẹp mở xoay trước, quay về gói 2: không lặp thẻ tay kẹp
  const daXoay = new Set(GT.khoaDaXem(cX, mXoay.hamGoc));
  const t3 = tayCua(GT.theCanHien(cK, mKep.hamGoc, (k) => daXoay.has(k), moTaGoc));
  kiem('V8c: đã xem tay xoay → quay về tay-gap.1 không hiện lại thẻ tay kẹp', t3.length === 0, J(t3.map((x) => x.ma)));
  // Sổ lệnh, trang "Bộ phận": một dòng tay, đủ lệnh đã giới thiệu
  const ca = new Set([...daKep, ...GT.khoaDaXem(cX, mXoay.hamGoc)]), dx = (k) => ca.has(k);
  const gap = GT.daGap(dx).filter((ma) => GT.DS[ma].khe === 'tay');
  kiem('V8c: Sổ lệnh "Bộ phận": đã gặp tay kẹp rồi mở xoay → chỉ MỘT dòng tay', J(gap) === J(['xoay']), J(gap));
  kiem('V8c: Sổ lệnh "Bộ phận": chỉ gặp tay kẹp → dòng kep', J(GT.daGap((k) => daKep.has(k)).filter((ma) => GT.DS[ma].khe === 'tay')) === J(['kep']));
  kiem('V8c: lệnh đã giới thiệu của dòng tay gồm cả bốn lệnh tay kẹp + hai lệnh xoay', J(GT.lenhDaXem('xoay', dx)) === J(GT.DS.xoay.lenh), J(GT.lenhDaXem('xoay', dx)));
  // the-part.js dùng đúng các hàm này (không tự chọn thẻ riêng)
  const tp = fs.readFileSync(path.join(day, 'game', 'the-part.js'), 'utf8');
  kiem('V8c: the-part.js chọn thẻ bằng GioiThieuPart.theCanHien / khoaDaXem / daGap / lenhDaXem', ['.theCanHien(', '.khoaDaXem(', '.daGap(daXem)', '.lenhDaXem(ma, daXem)'].every((x) => tp.includes(x)));
  // dòng ghép của tay xoay chạy đúng luật lõi: vật bên trái xe nhặt được trong một nhịp, nhịp sau nâng + xoay về trước
  const r = SanHoc.chay({ san: ['.....', '.....', '.o...', '.....', '.....'], batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: ['wait', 'arm_down', 'arm_up', 'grab', 'release', 'arm_left', 'arm_right'] },
    ['arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()'].join('\n') + '\n');
  const tay = r.tay || {};
  kiem('V8c: xoay: "' + GT.DS.xoay.ghep[0].ra + '" rồi "' + GT.DS.xoay.ghep[1].ra + '" đúng lõi (2 nhịp, cầm vật, tay về trước, nâng)', !r.loi && r.nhip === 2 && tay.xoay === 'truoc' && tay.tuThe === 'tren' && r.vat[0].trangThai === 'cam' && tay.cam === r.vat[0].id,
    J({ loi: r.loi, nhip: r.nhip, tay, vat: r.vat }));
}

console.log('4. giao diện');
const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
const iDuLieu = html.indexOf('../gioi-thieu-part.js'), iThe = html.indexOf('"the-part.js"'), iChoi = html.indexOf('"man-choi.js"'), iTP = html.indexOf('"thanh-phan.js"');
kiem('choi.html nạp gioi-thieu-part.js trước the-part.js, the-part.js sau thanh-phan.js và trước man-choi.js', iDuLieu > 0 && iThe > iDuLieu && iThe > iTP && iThe < iChoi);
const iCuon = html.indexOf('"thanh-cuon.js"');
kiem('choi.html nạp thanh-cuon.js sau thanh-phan.js, trước the-part.js', iCuon > iTP && iCuon < iThe);
for (const f of ['the-part.js', 'man-so-lenh.js', 'bang-mo-khoa.js'])
  kiem(f + ': vùng cuộn dùng thanh cuộn pixel (ThanhCuon.gan)', fs.readFileSync(path.join(day, 'game', f), 'utf8').includes('ThanhCuon.gan('));
const css = fs.readFileSync(path.join(day, 'game', 'choi.css'), 'utf8');
kiem('choi.css: .tc-an ẩn thanh gốc, có .tc-ray / .tc-cuc', /\.tc-an::-webkit-scrollbar\{display:none/.test(css) && css.includes('scrollbar-width:none') && css.includes('.tc-ray{') && css.includes('.tc-cuc{'));
const choi = fs.readFileSync(path.join(day, 'game', 'man-choi.js'), 'utf8');
kiem('man-choi.js: ThePart.choMan chạy trước đề bài và hướng dẫn (giữa hai bước là hộp hỏi lấy lại hàm bị sửa hỏng, nếu có)', /ThePart\.choMan\(m, batDau\)/.test(choi) && /function batDau\(\)\s*\{[\s\S]{0,60}hoiLayLaiHam\(function \(\) \{[\s\S]{0,300}hienDeBai\(\)/.test(choi) && /if \(m\.huongDan \|\| \(window\.HuongDanMan && HuongDanMan\[m\.ma\]\)\) anBongD\(\);\s*else hienDeBai\(\)/.test(choi));
const so = fs.readFileSync(path.join(day, 'game', 'man-so-lenh.js'), 'utf8');
kiem('Sổ lệnh có trang "Bộ phận" mở ThePart.mo', so.includes("TRANG_PART = '@part'") && so.includes('ThePart.mo('));
const chu = fs.readFileSync(path.join(day, 'game', 'chu.js'), 'utf8');
for (const k of ['part.tieuDe', 'part.tieuDeMoi', 'part.lenh', 'part.lenhMoi', 'part.ghep', 'part.gioi', 'part.khong', 'part.luuY', 'part.hieu', 'part.tiep', 'so.boPhan', 'so.boPhanRong'])
  kiem('chu.js có ' + k, chu.includes("'" + k + "'"));

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

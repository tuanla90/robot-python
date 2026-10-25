/* ============================================================================
   kiem-tham-so.mjs — máy kiểm chương `tham-so` (Hàm có tham số) của "Robot Chấn Hưng".
   Gồm: hàm có tham số ở nhân Python (gọi đúng / thiếu / thừa đối số, đối số là biểu thức, biến của hàm không rò
   ra ngoài), đổi tham số thì xe đi đúng số ô (sân thử của Xưởng hàm: forward, right, deliver, step), kho hàm giữ
   tham số, dữ liệu 10 màn, hamCuaEmCan đủ và không thừa, từng màn "đúng số thì thắng, sai số thì trượt",
   canThamSo (khai triển lời gọi hàm có tham số ra thì tràn khung hoặc mất sao) và bảng 10 màn.
   Các kiểm chung cho cả 70 màn (đi tuần tự, sao, lời sai, đường tắt BFS…) nằm ở kiem-hoc.mjs.
   Chạy: node hoc/kiem-tham-so.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { nhipDuaVatNganNhat } from './do-duong-tay.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
require(path.join(day, 'man-chuoi-2.js'));
require(path.join(day, 'man-tay-gap.js'));
require(path.join(day, 'man-vong-lap.js'));
require(path.join(day, 'man-bang-chuyen.js'));
const ManHoc = require(path.join(day, 'man-tham-so.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const maLoi = (kq) => kq.chanDoan.filter((c) => c.muc !== 'thong-tin').map((c) => c.ma);
const loiCua = (kq) => kq.chanDoan.map((c) => c.loi).join(' | ');
const vt = (r) => r.x + ',' + r.y;
const FOR = (n, than, b = 'i') => ['for ' + b + ' in range(' + n + '):'].concat(than.map((s) => '    ' + s));
const lap = (s, n) => Array(n).fill(s);

const ds = ManHoc.danhSach.filter((m) => m.chuong === 'tham-so');
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
/** Gộp: hàm trong `moi` đè / thêm vào `kho` theo tên. */
const tron = (kho, moi) => {
  const kq = kho.map((h) => H(h.ten, h.than.slice(), h.thamSo.slice()));
  for (const h of moi || []) { const i = kq.findIndex((x) => x.ten === h.ten); const b = H(h.ten, h.than.slice(), (h.thamSo || []).slice()); if (i >= 0) kq[i] = b; else kq.push(b); }
  return kq;
};
const KHO = khoTruoc('99.1');                                    // kho đầy đủ sau cả chương (id 99.1 không tồn tại nên đi hết cả chương)
const man = (id) => ManHoc.tim(id);
/** Chấm `chinh` ở màn `id` với kho lúc đó (cộng hàm của em mới / hàm của màn nếu có). */
const chamMan = (id, chinh, them = {}) => {
  const m = man(id);
  return ChamHoc.cham(m, { chinh, hamCuaMan: them.hamCuaMan !== undefined ? them.hamCuaMan : m.loiGiai.hamCuaMan }, tron(khoTruoc(id), them.hamCuaEmMoi !== undefined ? them.hamCuaEmMoi : m.loiGiai.hamCuaEmMoi));
};
const rs = (f, ns) => ns.map((n) => { const r = f(n); return n + ':' + (r.thang ? 'T' + r.soNhip + '/' + r.sao : 'x'); }).join(' ');

/* ================================================== 1. HÀM CÓ THAM SỐ Ở NHÂN PYTHON */
console.log('\n== 1. Hàm có tham số ở nhân Python: gọi đúng / thiếu / thừa đối số ==');
{
  const m33 = man('13.3');
  const FW = [H('forward', FOR('n', ['move()']), ['n'])];
  const kho = tron(khoTruoc('13.3'), FW);
  const chay = (chinh, hamEm = FW) => ChamHoc.cham(m33, { chinh }, tron(khoTruoc('13.3'), hamEm));

  const dung = chay(['forward(5)', 'turn_left()', 'forward(3)', 'turn_left()', 'forward(1)']);
  kiem('forward(n) đúng chữ ký: xe đi đúng 5, 3, 1 ô và thắng 3 sao', dung.thang && dung.sao === 3 && dung.soNhip === 11, J([dung.thang, dung.sao, dung.soNhip, maCua(dung)]));
  const thieu = chay(['forward(5)', 'turn_left()', 'forward()', 'turn_left()', 'forward(1)']);
  kiem('gọi forward() thiếu đối số: loi-chay, nói "cần 1 đối số, đang có 0" và chỉ đúng dòng 3 của chương trình',
    maCua(thieu).join() === 'loi-chay' && /cần 1 đối số, đang có 0/.test(loiCua(thieu)) && /chương trình, dòng 3/.test(loiCua(thieu)), loiCua(thieu));
  const thua = chay(['forward(5, 2)', 'turn_left()', 'forward(3)']);
  kiem('gọi forward(5, 2) thừa đối số: loi-chay, "cần 1 đối số, đang có 2", dòng 1', maCua(thua).join() === 'loi-chay' && /cần 1 đối số, đang có 2/.test(loiCua(thua)) && /dòng 1/.test(loiCua(thua)), loiCua(thua));
  kiem('lỗi gọi sai đối số dừng chương trình ngay: các lệnh đã chạy trước đó vẫn tính, xe không thắng', !thieu.thang && thieu.sao === 0 && thieu.soNhip >= 6, String(thieu.soNhip));
  const trongHam = ChamHoc.cham(man('13.6'), { chinh: ['deliver(3)'] }, tron(khoTruoc('13.6'), [H('deliver', ['pick()', 'forward()', 'drop()'], ['n'])]));
  kiem('gọi forward() thiếu đối số bên TRONG thân deliver: chỉ đúng "hàm deliver, dòng 2"', /hàm deliver, dòng 2/.test(loiCua(trongHam)) && /cần 1 đối số, đang có 0/.test(loiCua(trongHam)), loiCua(trongHam));
  const step1 = ChamHoc.cham(man('13.8'), { chinh: ['step(3)'] }, tron(khoTruoc('13.8'), [H('step', FOR('a', ['move()']), ['a', 'b'])]));
  kiem('hàm hai tham số gọi với một số: "cần 2 đối số, đang có 1"', /cần 2 đối số, đang có 1/.test(loiCua(step1)), loiCua(step1));
  const bieuThuc = chay(['forward(2 + 3)', 'turn_left()', 'forward(6 // 2)', 'turn_left()', 'forward(1)']);
  kiem('đối số là biểu thức: forward(2 + 3), forward(6 // 2) chạy đúng như forward(5), forward(3)', bieuThuc.thang && bieuThuc.sao === 3 && bieuThuc.soNhip === 11, J([bieuThuc.thang, maCua(bieuThuc)]));
  const bienDoi = chay(['d = 5', 'forward(d)', 'turn_left()', 'forward(d - 2)', 'turn_left()', 'forward(1)']);
  kiem('đối số là biến của chương trình: d = 5 rồi forward(d), forward(d - 2) chạy đúng', bienDoi.thang && bienDoi.soNhip === 11, J([bienDoi.thang, maCua(bienDoi)]));
  const roRa = chay(['forward(2)', 'x = n']);
  kiem('biến n là của riêng hàm: sau khi forward(2) chạy xong, chương trình dùng n thì báo "Chưa có biến tên n" (loi-chay), không phải ham-chua-co',
    maCua(roRa).join() === 'loi-chay' && /Chưa có biến tên "n"/.test(loiCua(roRa)) && !maCua(roRa).includes('ham-chua-co'), loiCua(roRa));
  const khongBi = chay(['n = 7', 'forward(2)', 'turn_left()', 'forward(n - 4)']);
  kiem('chương trình có biến n riêng: hàm forward(n) không đè biến n của chương trình (n vẫn là 7 sau khi gọi)', !maCua(khongBi).includes('loi-chay') && !maCua(khongBi).includes('ham-chua-co'), loiCua(khongBi));
  const nhamTen = chay(['forward(5)'], [H('forward', FOR('m', ['move()']), ['n'])]);
  kiem('thân hàm gõ nhầm tên đối số (range(m)): loi-chay "Chưa có biến tên m", nêu "hàm forward, dòng 1"', maCua(nhamTen).join() === 'loi-chay' && /Chưa có biến tên "m"/.test(loiCua(nhamTen)) && /hàm forward, dòng 1/.test(loiCua(nhamTen)), loiCua(nhamTen));
  kiem('mỗi hàm một khung 10 ô: thân forward() 2 ô; chương trình 5 ô; ô của lời giải chia theo chiTietO', dung.soO === 12 && dung.chiTietO.chinh === 5 && dung.chiTietO.ham.find((h) => h.ten === 'forward').o === 2, J(dung.chiTietO));
  const ghep = KhungCode.ghep({ chinh: ['forward(2)'], hamCuaMan: [] }, FW);
  kiem('ghép Python: dòng def mang tên đối số — "def forward(n):" rồi thân thụt 4', ghep.dong[0] === 'def forward(n):' && ghep.dong[1] === '    for i in range(n):' && ghep.dong[2] === '        move()', J(ghep.dong));
  kiem('xuất .py: hàm hai tham số giữ nguyên "def step(a, b):"', KhungCode.xuatPy({ chinh: ['step(3, 1)'], hamCuaMan: [] }, [H('step', ['forward(a)'], ['a', 'b'])]).includes('def step(a, b):'));
}

/* ======================================= 2. ĐỔI THAM SỐ THÌ ĐI ĐÚNG SỐ Ô (SÂN THỬ CỦA XƯỞNG HÀM) */
console.log('\n== 2. Đổi tham số thì xe đi đúng số ô: forward, right, deliver, step trên sân thử ==');
{
  const kho = tron(KHO, []);
  const mT = man('13.10');
  const thu = (ten, doiSo, sanThu, hamEm = kho) => ChamHoc.thuHam(mT, {}, ten, hamEm, { sanThu, doiSo, nhipToiDa: 200 });
  const SAN = { rong: 11, cao: 11, batDau: { x: 5, y: 10, huong: 0 }, vat: [], tuong: [] };
  const fw = [0, 1, 2, 5, 8, 10].map((n) => thu('forward', [n], SAN));
  kiem('forward(n): n = 0, 1, 2, 5, 8, 10 → xe lên đúng n ô (y = 10 − n), n nhịp, không chẩn đoán',
    fw.every((r, i) => { const n = [0, 1, 2, 5, 8, 10][i]; return r.robot.y === 10 - n && r.soNhip === n && r.chanDoan.length === 0; }), J(fw.map((r) => r.robot.y)));
  const fwTuong = thu('forward', [12], SAN);
  kiem('forward(12) trên sân chỉ cao 11: xe đi hết rồi đâm vào mép sân (dam-tuong, ngoai-san)', maCua(fwTuong).includes('dam-tuong') && fwTuong.robot.y === 0, J([maCua(fwTuong), fwTuong.robot]));
  const SAN_Q = { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [], tuong: [] };
  const rk = [0, 1, 2, 3, 4, 5, 8].map((k) => thu('right', [k], SAN_Q));
  kiem('right(k): k = 0, 1, 2, 3, 4, 5, 8 → hướng cuối = k mod 4 (0 lên, 1 phải, 2 xuống, 3 trái), k nhịp, đứng nguyên chỗ',
    rk.every((r, i) => { const k = [0, 1, 2, 3, 4, 5, 8][i]; return r.robot.huong === k % 4 && r.soNhip === k && vt(r.robot) === '2,2'; }), J(rk.map((r) => r.robot.huong)));
  const SAN_D = { rong: 11, cao: 11, batDau: { x: 5, y: 10, huong: 0 }, vat: [{ x: 5, y: 9 }], tuong: [] };
  const dv = [1, 3, 6].map((n) => thu('deliver', [n], SAN_D));
  kiem('deliver(n): vật ở ô TRƯỚC MẶT (y = 9) được nhặt, mang đi n ô rồi đặt xuống ô trước mặt (trạng thái "dat", y = 9 − n), xe đứng sát vật (y = 10 − n)',
    dv.every((r, i) => { const n = [1, 3, 6][i]; return r.vat.length === 1 && r.vat[0].trangThai === 'dat' && r.vat[0].y === 9 - n && r.robot.y === 10 - n && r.chanDoan.length === 0; }), J(dv.map((r) => r.vat)));
  kiem('deliver(n) tốn 2 nhịp nhặt + n nhịp đi + 2 nhịp thả = n + 4 nhịp (tay trở lại tư thế nâng)', dv.every((r, i) => r.soNhip === [1, 3, 6][i] + 4), J(dv.map((r) => r.soNhip)));
  const SAN_S = { rong: 11, cao: 11, batDau: { x: 0, y: 0, huong: 1 }, vat: [], tuong: [] };
  const st = [[3, 1], [1, 3], [2, 2], [4, 5], [0, 2]].map(([a, b]) => ({ a, b, r: thu('step', [a, b], SAN_S) }));
  kiem('step(a, b): xe ở (a, b), quay mặt sang phải như lúc đầu, a + b + 2 nhịp; đổi chỗ a và b cho điểm cuối khác nhau',
    st.every((x) => vt(x.r.robot) === x.a + ',' + x.b && x.r.robot.huong === 1 && x.r.soNhip === x.a + x.b + 2 && x.r.chanDoan.length === 0) && vt(st[0].r.robot) !== vt(st[1].r.robot), J(st.map((x) => vt(x.r.robot))));
  const baiThu = thu('forward', [], SAN);
  kiem('sân thử cũng báo thiếu đối số: forward() không có số → loi-chay "cần 1 đối số, đang có 0"', maCua(baiThu).includes('loi-chay') && /cần 1 đối số, đang có 0/.test(loiCua(baiThu)), loiCua(baiThu));
}

/* ================================================================ 3. KHO HÀM */
console.log('\n== 3. Kho hàm: tham số được giữ, tên đối số hợp lệ, tên cốt truyện bị khóa ==');
{
  const tenMoi = ['forward', 'right', 'deliver', 'step'];
  kiem('bốn hàm cốt truyện mới: forward, right, deliver, step — chỉ tạo ở đúng màn của nó (13.3, 13.4, 13.6, 13.8), tổng 18 tên khóa',
    J(ds.flatMap((m) => m.taoHam)) === J(tenMoi) && ds.filter((m) => m.taoHam.length).map((m) => m.id).join() === '13.3,13.4,13.6,13.8' && tenCotTruyen.length === 18, J(tenCotTruyen));
  const truoc = new Set(tatCa.filter((m) => m.chuong !== 'tham-so').flatMap((m) => m.taoHam));
  kiem('không trùng tên hàm cốt truyện chương trước (move, turn_right, … bend_right) và không trùng tên hàm gốc', tenMoi.every((t) => !truoc.has(t) && !KhoHam.HAM_GOC_MAC_DINH.includes(t)), J([...truoc]));
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  const t1 = kho.tao('forward', ['n'], { taoHam: ['forward'] });
  kiem('tạo forward(n) ở màn có taoHam [forward]: ok, giữ thamSo ["n"]', t1.ok && J(t1.ham.thamSo) === '["n"]', J(t1));
  kiem('tạo forward ở màn khác (không có trong taoHam): ten-danh-cho-cot-truyen', (() => { const k = KhoHam.moi({ tenCoDinh: tenCotTruyen }); return k.tao('forward', ['n']).ma === 'ten-danh-cho-cot-truyen'; })());
  kho.sua('forward', FOR('n', ['move()']));
  const t2 = kho.tao('step', ['a', 'b'], { taoHam: ['step'] });
  kiem('hàm hai tham số: step(a, b) giữ đủ hai đối số a, b', t2.ok && J(t2.ham.thamSo) === '["a","b"]');
  kiem('tên đối số sai: trùng nhau ("a", "a"), từ khóa ("for"), bắt đầu bằng số ("1n") → tham-so-sai',
    ['aa', 'kw', 'so'].every((k, i) => { const r = KhoHam.moi().tao('h' + i, [['a', 'a'], ['for'], ['1n']][i]); return !r.ok && r.ma === 'tham-so-sai'; }));
  kiem('sửa hàm đổi luôn danh sách đối số: kho.sua("forward", thân, ["n", "m"])', (() => { const r = kho.sua('forward', ['move()'], ['n', 'm']); return r.ok && J(kho.tim('forward').thamSo) === '["n","m"]'; })());
  kho.sua('forward', FOR('n', ['move()']), ['n']);
  kiem('tên cốt truyện bị khóa: không đổi tên, không xóa forward (ten-co-dinh); thân sửa tự do', kho.doiTen('forward', 'tien').ma === 'ten-co-dinh' && kho.xoa('forward').ma === 'ten-co-dinh' && kho.sua('forward', ['move()']).ok);
  kho.sua('forward', FOR('n', ['move()']));
  const luu = new Map();
  const kho2 = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  kho2.tao('forward', ['n'], { taoHam: ['forward'] }); kho2.sua('forward', FOR('n', ['move()']));
  kho2.tao('step', ['a', 'b'], { taoHam: ['step'] }); kho2.sua('step', ['forward(a)', 'turn_right()', 'forward(b)', 'turn_left()']);
  const hop = { getItem: (k) => (luu.has(k) ? luu.get(k) : null), setItem: (k, v) => luu.set(k, v) };
  kho2.ghiLuu(hop);
  const kho3 = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  const doc = kho3.docLuu(hop);
  kiem('lưu rồi đọc lại kho: thamSo của forward và step còn nguyên', doc.ok && J(kho3.tim('forward').thamSo) === '["n"]' && J(kho3.tim('step').thamSo) === '["a","b"]' && kho3.tim('step').than.length === 4, J(doc));
  kiem('SO_HAM_MAC_DINH đủ chỗ cho 18 hàm cốt truyện + ít nhất 2 hàm tự đặt', KhoHam.SO_HAM_MAC_DINH >= 18 + 2, String(KhoHam.SO_HAM_MAC_DINH));
}

/* ====================================================== 4. DỮ LIỆU 10 MÀN */
console.log('\n== 4. Chương tham-so: dữ liệu 10 màn ==');
{
  kiem('đúng 10 màn, số 1..10, id 13.1…13.10 (chương thứ 13), mã tham-so.1…', ds.length === 10 && ds.every((m, i) => m.so === i + 1 && m.id === '13.' + (i + 1) && m.ma === 'tham-so.' + (i + 1)));
  kiem('chương đứng thứ 8 trong thứ tự chương (sau bang-chuyen, trước nhen), tên "Hàm có tham số"', ThuTu.thuTu[12] === 'tham-so' && ThuTu.thuTu[11] === 'bang-chuyen' && ThuTu.thuTu[13] === 'nhen' && ThuTu.ten['tham-so'] === 'Hàm có tham số');
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ màn 10 có huy hiệu tham-so',
    J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) &&
      ds.filter((m) => m.huyHieu).length === 1 && ds[9].huyHieu.ma === 'tham-so' && ds[9].huyHieu.ten === 'Huy hiệu Hàm có tham số');
  const HG = ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];
  kiem('màn nào cũng: xe hai bánh có tay gắp, Xưởng mở, chương trình 10 ô + mỗi hàm 10 ô, cauTruc ["for"], được dùng hàm của em',
    ds.every((m) => m.loaiRobot === 'banh' && J(m.hamGoc) === J(HG) && m.moXuong === true && m.camHamCuaEm === false && m.khung.chinh === 10 && m.khung.moiHam === 10 && J(m.cauTruc) === '["for"]' && J(m.khung.cauTruc) === '["for"]'));
  kiem('mục tiêu: 8.6 và 8.10 là dua-vat; tám màn còn lại tới cờ', J(ds.map((m) => m.mucTieu === 'dua-vat')) === J([false, false, false, false, false, true, false, false, false, true]));
  kiem('sân tối đa 7×7; 8.9 và 8.10 có băng chuyền, các màn khác không',
    ds.every((m) => m.san.length <= 7 && m.san[0].length <= 7) && J(ds.map((m) => /[><^v]/.test(m.san.join('')))) === J([false, false, false, false, false, false, false, false, true, true]));
  kiem('sân dua-vat có vật và ô đích; sân tới cờ có đúng một cờ F', ds.every((m) => {
    const s = SanHoc.docSan(m.san);
    return m.mucTieu === 'dua-vat' ? s.vat.length >= 1 && s.dich.length >= s.vat.length && !s.co : !!s.co && s.vat.length === 0 && s.dich.length === 0;
  }));
  kiem('taoHam: 8.3 forward · 8.4 right · 8.6 deliver · 8.8 step; các màn khác không tạo hàm',
    J(ds.map((m) => m.taoHam)) === J([[], [], ['forward'], ['right'], [], ['deliver'], [], ['step'], [], []]));
  kiem('hàm tạo mới có đúng tham số: forward(n), right(k), deliver(n), step(a, b)',
    ds.flatMap((m) => m.loiGiai.hamCuaEmMoi).map((h) => h.ten + '(' + h.thamSo.join(', ') + ')').join() === 'forward(n),right(k),deliver(n),step(a, b)');
  kiem('hàm CỦA MÀN: 8.1 và 8.2 cho forward(n), 8.7 cho run(n); màn khác không có (đều có tham số n)',
    J(ds.map((m) => m.loiGiai.hamCuaMan.map((h) => h.ten + '(' + h.thamSo.join(',') + ')'))) === J([['forward(n)'], ['forward(n)'], [], [], [], [], ['run(n)'], [], [], []]));
  kiem('nhipTheoLoiGiai chỉ ở 8.4, 8.6, 8.10; màn tới cờ khác chấm theo BFS đúng', J(ds.map((m) => !!m.nhipTheoLoiGiai)) === J([false, false, false, true, false, true, false, false, false, true]));
  kiem('mọi màn khai canThamSo ("tran-khung" hoặc "mat-sao"); cả 10 màn hiện là tran-khung', ds.every((m) => ['tran-khung', 'mat-sao'].includes(m.canThamSo)) && ds.every((m) => m.canThamSo === 'tran-khung'));
  kiem('màn có maMau khác rỗng thì có veMaMau: 8.2, 8.3, 8.6, 8.7, 8.8; các màn khác không',
    J(ds.map((m) => m.maMau.chinh.length > 0)) === J([false, true, true, false, false, true, true, true, false, false]) && ds.every((m) => (m.maMau.chinh.length > 0) === (typeof m.veMaMau === 'string')));
  kiem('deBai luôn đúng mục tiêu: không nói "chương trình có sẵn" (đó là việc của veMaMau); nhưng được nói về hàm của màn', ds.every((m) => !/chương trình có sẵn/.test(m.deBai)));
  kiem('lời giải mỗi màn vừa khung 10 ô, 3 sao, chẩn đoán sạch (kho đầy đủ)', ds.every((m) => { const r = ChamHoc.cham(m, m.loiGiai, KHO); return r.thang && r.sao === 3 && maLoi(r).length === 0; }));
  kiem('lời giải mỗi màn dùng dạng gọi hàm có số: dòng chương trình có "(<số>)" hoặc "(<số>, <số>)" ít nhất 3 lần',
    ds.every((m) => m.loiGiai.chinh.filter((s) => /\(\d+(, \d+)?\)/.test(s)).length >= 3));
  kiem('mọi hàm có tham số của chương (forward, right, deliver, step, run) dùng tên đối số trong thân (không viết số cứng)',
    ds.flatMap((m) => m.loiGiai.hamCuaEmMoi.concat(m.loiGiai.hamCuaMan)).filter((h) => h.thamSo.length).every((h) => h.thamSo.every((p) => h.than.some((s) => new RegExp('\\b' + p + '\\b').test(s)))));
}

/* ===================== 5. HAMCUAEMCAN ĐỦ VÀ KHÔNG THỪA: kho chỉ có đúng những hàm đã khai */
console.log('\n== 5. hamCuaEmCan đủ (chỉ kho đã khai vẫn 3 sao) và không thừa (mỗi hàm đã khai được gọi tới) ==');
for (const m of ds) {
  const kho = khoTruoc(m.id);
  const toiThieu = tron(kho.filter((h) => m.hamCuaEmCan.includes(h.ten)), m.loiGiai.hamCuaEmMoi);
  const r = ChamHoc.cham(m, m.loiGiai, toiThieu);
  kiem(m.id + ': kho chỉ gồm ' + (m.hamCuaEmCan.join(', ')) + ' → lời giải vẫn 3 sao', r.thang && r.sao === 3 && r.soO === m.sao.o, J([r.thang, r.sao, r.soO, maCua(r)]));
  const moi = m.loiGiai.hamCuaEmMoi.map((h) => h.ten).concat(m.loiGiai.hamCuaMan.map((h) => h.ten));
  const dung = ChamHoc.cham(m, m.loiGiai, kho.concat(m.loiGiai.hamCuaEmMoi)).hamDaDung.filter((t) => !moi.includes(t));
  kiem(m.id + ': hamCuaEmCan khớp đúng các hàm có sẵn mà lời giải gọi tới (trực tiếp hay gián tiếp)', J(dung.slice().sort()) === J(m.hamCuaEmCan.slice().sort()), 'dùng ' + dung.join() + ' · khai ' + m.hamCuaEmCan.join());
}

/* ====================== 6. TỪNG MÀN: ĐÚNG SỐ THÌ THẮNG, SAI MỘT SỐ THÌ TRƯỢT HOẶC CHẬM */
console.log('\n== 6. Từng màn: số đúng thì thắng, sai số thì trượt hoặc chậm ==');
{
  // 8.1: forward(n) có sẵn, đổi số từng đoạn
  const f1 = (a, b, c) => chamMan('13.1', ['forward(' + a + ')', 'turn_right()', 'forward(' + b + ')', 'turn_left()', 'forward(' + c + ')']);
  kiem('8.1: (4, 3, 2) thắng 3 sao 11 nhịp; sai một số ở đoạn đầu / giữa / cuối thì trượt; đoạn cuối dư vẫn tới (thắng ngay khi chạm cờ)',
    f1(4, 3, 2).sao === 3 && f1(4, 3, 2).soNhip === 11 && !f1(3, 3, 2).thang && !f1(4, 2, 2).thang && !f1(4, 3, 1).thang && f1(4, 3, 5).thang && f1(4, 3, 5).soNhip === 11, rs((c) => f1(4, 3, c), [1, 2, 5]));
  kiem('8.1: đoạn đầu dư một ô (5): vẫn tới cờ nhưng chậm một nhịp, còn 2 sao', f1(5, 3, 2).thang && f1(5, 3, 2).soNhip === 12 && f1(5, 3, 2).sao === 2 && maCua(f1(5, 3, 2)).includes('dam-tuong'), J([f1(5, 3, 2).soNhip, f1(5, 3, 2).sao]));

  // 8.2: sửa thân forward của màn
  const m2 = man('13.2');
  const sua2 = (than) => chamMan('13.2', m2.loiGiai.chinh, { hamCuaMan: [H('forward', than, ['n'])] });
  const mm = ChamHoc.cham(m2, m2.maMau, KHO);
  kiem('8.2: maMau (thân chỉ có move()): xe nhích 1 ô mỗi lần gọi, trượt, chẩn đoán dam-tuong + chua-toi-co', !mm.thang && maCua(mm).includes('dam-tuong') && maCua(mm).includes('chua-toi-co'), J(maCua(mm)));
  kiem('8.2: for i in range(n) → 3 sao 12 nhịp; range(3) trượt; range(n + 1) vẫn tới nhưng chậm; range(2 * n) thừa gấp đôi',
    sua2(FOR('n', ['move()'])).sao === 3 && sua2(FOR('n', ['move()'])).soNhip === 12 && !sua2(FOR(3, ['move()'])).thang && sua2(FOR('n + 1', ['move()'])).sao < 3 && sua2(FOR('2 * n', ['move()'])).sao < 3,
    J([sua2(FOR('n + 1', ['move()'])).thang, sua2(FOR('n + 1', ['move()'])).sao]));
  const wh = sua2(['i = 0', 'while i < n:', '    move()', '    i += 1']);
  kiem('8.2: while thay cho for cũng đúng nhịp nhưng nhiều ô hơn (4 ô thân hàm thay vì 2): 2 sao', wh.thang && wh.soNhip === 12 && wh.soO === m2.sao.o + 2 && wh.sao === 2, J([wh.thang, wh.soO, wh.soNhip, wh.sao]));

  // 8.3: tạo forward
  const m3 = man('13.3');
  const t3 = (than, thamSo = ['n']) => ChamHoc.cham(m3, { chinh: m3.loiGiai.chinh }, tron(khoTruoc('13.3'), [H('forward', than, thamSo)]));
  kiem('8.3: forward(n) với range(n) → 3 sao (12 ô, 11 nhịp); thân hàm có chú thích hoặc dòng trống không đổi nhịp', t3(FOR('n', ['move()'])).sao === 3 && t3(FOR('n', ['move()'])).soO === 12 && t3(['# lặp n lần'].concat(FOR('n', ['move()']))).soNhip === 11);
  kiem('8.3: tạo forward KHÔNG có đối số rồi gọi forward(5) → loi-chay "cần 0 đối số, đang có 1"', (() => { const r = t3(['move()'], []); return /cần 0 đối số, đang có 1/.test(loiCua(r)); })());
  kiem('8.3: tên đối số khác (đặt là "so") vẫn chạy đúng — tên đối số do em chọn, miễn thân hàm dùng cùng tên', t3(FOR('so', ['move()']), ['so']).sao === 3);
  kiem('8.3: tên đối số khác tên dùng trong thân (def forward(so) mà range(n)) → loi-chay', maCua(t3(FOR('n', ['move()']), ['so'])).join() === 'loi-chay');

  // 8.4: right(k)
  const m4 = man('13.4');
  const r4 = (chinh, k = FOR('k', ['turn_right()'])) => ChamHoc.cham(m4, { chinh }, tron(khoTruoc('13.4'), [H('right', k, ['k'])]));
  kiem('8.4: lời giải right(2)…right(3) thắng 3 sao, 15 nhịp (right(3) tốn 3 nhịp); đường nhanh nhất chỉ 13 nhịp nhờ turn_left()', r4(m4.loiGiai.chinh).sao === 3 && r4(m4.loiGiai.chinh).soNhip === 15, J([r4(m4.loiGiai.chinh).soNhip]));
  const nhanh = r4(['right(2)', 'forward(4)', 'right(1)', 'forward(3)', 'turn_left()', 'forward(2)']);
  kiem('8.4: thay right(3) bằng turn_left() thì 13 nhịp (nhanh hơn) nhưng thêm ô của turn_left: 17 ô > 15 → 2 sao', nhanh.thang && nhanh.soNhip === 13 && nhanh.soO === 17 && nhanh.sao === 2, J([nhanh.soNhip, nhanh.soO, nhanh.sao]));
  const cu = ChamHoc.cham(m4, { chinh: ['u_turn()', 'forward(4)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(2)'] }, tron(khoTruoc('13.4'), m4.loiGiai.hamCuaEmMoi));
  kiem('8.4: dùng ba hàm cũ (u_turn, turn_right, turn_left), không gọi right(k): robot tới cờ (13 nhịp) nhưng CHƯA thắng — màn dạy tạo right(k) (chua-tao-ham; 23/10: right dùng ở 6 màn sau)', !cu.thang && cu.soNhip === 13 && cu.chanDoan[0].ma === 'chua-tao-ham', J([cu.thang, cu.soNhip, cu.chanDoan.map((c) => c.ma)]));
  const bo4 = r4(['turn_right()', 'turn_right()', 'forward(4)', 'turn_right()', 'forward(3)', 'turn_right()', 'turn_right()', 'turn_right()', 'forward(2)']);
  kiem('8.4: bỏ right(k), quay bằng turn_right() từng dòng (vẫn dùng forward): vừa khung 9 dòng, robot tới cờ (15 nhịp) nhưng CHƯA thắng (chua-tao-ham)', !bo4.thang && bo4.soNhip === 15 && bo4.chanDoan[0].ma === 'chua-tao-ham', J([bo4.thang, bo4.soNhip, bo4.chanDoan.map((c) => c.ma)]));
  kiem('8.4: right(1) chỉ quay một lần dù k bằng mấy → trượt; right(k) với range(k) và k = 0 thì không quay', !r4(m4.loiGiai.chinh, ['turn_right()']).thang && r4(['right(0)', 'right(2)', 'forward(4)', 'right(1)', 'forward(3)', 'right(3)', 'forward(2)']).soNhip === 15);

  // 8.5
  const m5 = man('13.5');
  const c5 = (chinh) => chamMan('13.5', chinh);
  const lech5 = (i, d) => { const ch = m5.loiGiai.chinh.slice(); ch[i] = 'forward(' + (+/\d+/.exec(ch[i]) + d) + ')'; return c5(ch); };
  kiem('8.5: năm đoạn 4-3-2-3-4 → 3 sao, 20 nhịp, 18 ô; thiếu một ô ở đoạn nào cũng trượt; dư một ô ở bốn đoạn đầu thì đâm tường, chỉ 2 sao',
    c5(m5.loiGiai.chinh).sao === 3 && c5(m5.loiGiai.chinh).soNhip === 20 && c5(m5.loiGiai.chinh).soO === 18 &&
      [0, 2, 4, 6, 8].every((i) => !lech5(i, -1).thang) && [0, 2, 4, 6].every((i) => lech5(i, 1).thang && lech5(i, 1).sao === 2 && maCua(lech5(i, 1)).includes('dam-tuong')), '');
  kiem('8.5: đoạn cuối dư một ô vẫn 3 sao (thắng ngay khi chạm cờ nên số dư không chạy tới)', lech5(8, 1).sao === 3 && lech5(8, 1).soNhip === 20);
  kiem('8.5: đổi chỗ hai khúc rẽ cuối (turn_left cho turn_right) → trượt', !c5(m5.loiGiai.chinh.map((s, i) => (i === 7 ? 'turn_left()' : s))).thang);

  // 8.6
  const m6 = man('13.6');
  const d6 = (chinh, than = T_DELIVER) => ChamHoc.cham(m6, { chinh }, tron(khoTruoc('13.6'), [H('deliver', than, ['n'])]));
  const T_DELIVER = ['pick()', 'forward(n)', 'drop()'];
  kiem('8.6: deliver(3), turn_right(), forward(1), deliver(2), turn_right(), forward(1), deliver(3) → 3 sao, 23 nhịp, 27 ô', d6(m6.loiGiai.chinh).sao === 3 && d6(m6.loiGiai.chinh).soNhip === 23 && d6(m6.loiGiai.chinh).soO === 27, J([d6(m6.loiGiai.chinh).sao, d6(m6.loiGiai.chinh).soNhip, d6(m6.loiGiai.chinh).soO]));
  const lech6 = (i, d) => { const ch = m6.loiGiai.chinh.slice(); ch[i] = ch[i].replace(/\d+/, (x) => +x + d); return d6(ch); };
  kiem('8.6: thiếu một ô ở bất kỳ chuyến nào (n − 1) → không đưa hết vật tới đích; dư một ô thì nhiều lắm cũng chỉ 2 sao',
    [0, 3, 6].every((i) => !lech6(i, -1).thang && lech6(i, 1).sao < 3), J([0, 3, 6].map((i) => [lech6(i, -1).thang, lech6(i, 1).sao])));
  kiem('8.6: forward(1) sau khúc rẽ: forward(0) thì xe còn đứng ở góc, trượt; forward(2) thì xe đâm vào vật chiếm ô (đứng im 1 nhịp, dam-tuong) nên chậm, 2 sao',
    [2, 5].every((i) => { const ch = m6.loiGiai.chinh.slice(); ch[i] = 'forward(0)'; const thieu = d6(ch); ch[i] = 'forward(2)'; const du = d6(ch); return !thieu.thang && du.thang && du.sao === 2 && maCua(du).includes('dam-tuong'); }));
  kiem('8.6: deliver() thả bằng release() khi tay nâng → vat-vo, dừng ngay', maCua(d6(m6.loiGiai.chinh, ['pick()', 'forward(n)', 'release()', 'wait()'])).includes('vat-vo'));

  // 8.7
  const m7 = man('13.7');
  const run7 = (than) => chamMan('13.7', m7.loiGiai.chinh, { hamCuaMan: [H('run', than, ['n'])] });
  const mm7 = ChamHoc.cham(m7, m7.maMau, KHO);
  kiem('8.7: maMau (run luôn đi 3 ô): trượt, dam-tuong; run(3) là lần duy nhất đúng', !mm7.thang && maCua(mm7).includes('dam-tuong'), J(maCua(mm7)));
  kiem('8.7: range(n) rồi turn_right() → 3 sao (13 ô, 22 nhịp); range(n) không có rẽ → trượt; rẽ nằm trong vòng lặp → trượt',
    run7(FOR('n', ['move()']).concat(['turn_right()'])).sao === 3 && run7(FOR('n', ['move()']).concat(['turn_right()'])).soO === 13 && run7(FOR('n', ['move()']).concat(['turn_right()'])).soNhip === 22 &&
      !run7(FOR('n', ['move()'])).thang && !run7(FOR('n', ['move()', 'turn_right()'])).thang);
  const run7f = run7(['forward(n)', 'turn_right()']);
  kiem('8.7: run() gọi forward(n) cũng đúng và đúng nhịp, nhưng 14 ô > 13 → 2 sao', run7f.thang && run7f.soNhip === 22 && run7f.soO === 14 && run7f.sao === 2, J([run7f.soO, run7f.sao]));
  const sai3 = run7(FOR(3, ['move()']).concat(['turn_right()']));
  kiem('8.7: sửa nửa vời (range(3) giữ nguyên) vẫn trượt: lần gọi run(1), run(2) lệch', !sai3.thang);

  // 8.8
  const m8 = man('13.8');
  const s8 = (chinh) => chamMan('13.8', chinh);
  kiem('8.8: step(3, 1), step(2, 2), step(1, 3) → 3 sao, 17 nhịp, 16 ô; chỉ cần 3 dòng chương trình', s8(m8.loiGiai.chinh).sao === 3 && s8(m8.loiGiai.chinh).soNhip === 17 && s8(m8.loiGiai.chinh).soO === 16 && m8.loiGiai.chinh.length === 3);
  kiem('8.8: đổi chỗ hai số của một bậc (step(1, 3) thay step(3, 1)) → trượt; đổi chỗ hai số mọi bậc → trượt',
    !s8(['step(1, 3)', 'step(2, 2)', 'step(1, 3)']).thang && !s8(['step(1, 3)', 'step(2, 2)', 'step(3, 1)']).thang);
  kiem('8.8: step(2, 2) ở giữa đổi chỗ hai số không đổi gì (2, 2) — cả hai cách đều thắng', s8(['step(3, 1)', 'step(2, 2)', 'step(1, 3)']).thang);

  // 8.9: số lần gọi KHÔNG bằng số ô
  const f9 = (a, b, c, d) => chamMan('13.9', ['forward(' + a + ')', 'turn_right()', 'forward(' + b + ')', 'turn_left()', 'forward(' + c + ')', 'turn_left()', 'forward(' + d + ')']);
  kiem('8.9: (2, 3, 6, 2): đoạn xuôi băng 5 ô chỉ cần 3 lần, đoạn ngược băng 4 ô cần 6 lần → 3 sao, 16 nhịp', f9(2, 3, 6, 2).sao === 3 && f9(2, 3, 6, 2).soNhip === 16, J([f9(2, 3, 6, 2).sao, f9(2, 3, 6, 2).soNhip]));
  kiem('8.9: đếm theo số ô (2, 5, 4, 2) trượt; thiếu một lần ở đoạn xuôi băng (2, 2, 6, 2) hay ở đoạn ngược băng (2, 3, 5, 2) đều trượt',
    !f9(2, 5, 4, 2).thang && !f9(2, 2, 6, 2).thang && !f9(2, 3, 5, 2).thang);
  kiem('8.9: dư một lần ở đoạn xuôi băng (2, 4, 6, 2) hay ngược băng (2, 3, 7, 2): vẫn tới cờ nhưng chậm, 2 sao',
    f9(2, 4, 6, 2).thang && f9(2, 4, 6, 2).sao === 2 && f9(2, 3, 7, 2).thang && f9(2, 3, 7, 2).sao === 2);

  // 8.10
  const m10 = man('13.10');
  const b10 = (a, b, c, d, e) => chamMan('13.10', ['deliver(' + a + ')', 'turn_right()', 'forward(' + b + ')', 'turn_right()', 'deliver(' + c + ')', 'turn_left()', 'forward(' + d + ')', 'turn_left()', 'deliver(' + e + ')']);
  kiem('8.10: (4, 2, 5, 2, 3): ba chuyến qua băng → 3 sao, 31 nhịp, 31 ô; chuyến đầu vật dịch 5 ô chỉ cần 4 lần, chuyến giữa 4 ô ngược băng cần 5 lần, chuyến cuối 4 ô cần 3 lần',
    b10(4, 2, 5, 2, 3).sao === 3 && b10(4, 2, 5, 2, 3).soNhip === 31 && b10(4, 2, 5, 2, 3).soO === 31, J([b10(4, 2, 5, 2, 3).sao, b10(4, 2, 5, 2, 3).soNhip]));
  kiem('8.10: đếm theo số ô (5, 2, 4, 2, 4) trượt; thiếu một ở chuyến đầu (3, 2, 5, 2, 3), chuyến giữa (4, 2, 4, 2, 3) hay chuyến cuối (4, 2, 5, 2, 2) trượt',
    !b10(5, 2, 4, 2, 4).thang && !b10(3, 2, 5, 2, 3).thang && !b10(4, 2, 4, 2, 3).thang && !b10(4, 2, 5, 2, 2).thang);
  kiem('8.10: đoạn nối thiếu một ô (forward(1)) → trượt; dư một ô (forward(3)) → xe đâm vật chiếm ô, chậm, 2 sao',
    !b10(4, 1, 5, 2, 3).thang && !b10(4, 2, 5, 1, 3).thang && b10(4, 3, 5, 2, 3).sao === 2 && b10(4, 2, 5, 3, 3).sao === 2);
}

/* ================================== 7. CANTHAMSO: KHAI TRIỂN LỜI GỌI HÀM CÓ THAM SỐ THÌ TRÀN KHUNG / MẤT SAO */
console.log('\n== 7. canThamSo: khai triển hàm có tham số thành move() / turn từng dòng thì tràn khung (tran-khung) hoặc mất sao (mat-sao) ==');
{
  /** Khai triển: thay lời gọi hàm CÓ THAM SỐ bằng thân của nó (đã thay đối số bằng số), đệ quy, rồi trải for số cứng. */
  function khaiTrien(dong, defs) {
    const kq = [];
    for (const s of dong) {
      const mk = /^(\s*)(\w+)\(([^()]*)\)\s*$/.exec(s);
      const h = mk && defs[mk[2]];
      if (!h) { kq.push(s); continue; }
      const args = mk[3].trim() === '' ? [] : mk[3].split(',').map((x) => x.trim());
      let than = h.than.map((l) => {
        let t = l;
        h.thamSo.forEach((p, i) => { t = t.replace(new RegExp('\\b' + p + '\\b', 'g'), args[i]); });
        return t;
      });
      than = khaiTrien(than, defs).map((l) => mk[1] + l);
      kq.push(...than);
    }
    return kq;
  }
  function traiFor(dsd) {
    const kq = [];
    for (let i = 0; i < dsd.length; i++) {
      const mk = /^(\s*)for (\w+) in range\((\d+)\):$/.exec(dsd[i]);
      if (!mk) { kq.push(dsd[i]); continue; }
      const u = mk[1].length;
      const than = [];
      let j = i + 1;
      while (j < dsd.length && new RegExp('^ {' + (u + 4) + '}').test(dsd[j])) { than.push(dsd[j].slice(u + 4)); j++; }
      const trong = traiFor(than);
      for (let k = 0; k < +mk[3]; k++) kq.push(...trong);
      i = j - 1;
    }
    return kq;
  }
  kiem('khaiTrien tự kiểm: forward(2) → move() hai lần; deliver(2) lồng forward; step(1, 2) lồng hai forward', (() => {
    const defs = { forward: H('forward', FOR('n', ['move()']), ['n']), deliver: H('deliver', ['pick()', 'forward(n)', 'drop()'], ['n']), step: H('step', ['forward(a)', 'turn_right()', 'forward(b)', 'turn_left()'], ['a', 'b']) };
    const t = (x) => traiFor(khaiTrien(x, defs));
    return J(t(['forward(2)'])) === J(['move()', 'move()']) && J(t(['deliver(2)'])) === J(['pick()', 'move()', 'move()', 'drop()']) &&
      J(t(['step(1, 2)'])) === J(['move()', 'turn_right()', 'move()', 'move()', 'turn_left()']) && J(t(['turn_right()', 'forward(0)'])) === J(['turn_right()']);
  })());

  const bang = [];
  for (const m of ds) {
    const kho = tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi);
    const defs = {};
    kho.concat(m.loiGiai.hamCuaMan).filter((h) => h.thamSo.length).forEach((h) => { defs[h.ten] = h; });
    // right(k) là hàm có tham số nhưng ở màn 8.4 chỉ khai triển phần quay; kho cũng có hàm KHÔNG tham số (move, turn_right…) được giữ nguyên
    const chinh = traiFor(khaiTrien(m.loiGiai.chinh, defs));
    const r = ChamHoc.cham(m, { chinh, hamCuaMan: [] }, kho);
    const tran = maCua(r).includes('tran-khung');
    bang.push({ id: m.id, can: m.canThamSo, dong: chinh.length, tran, thang: r.thang, sao: r.sao, o: r.soO, saoO: m.sao.o });
    if (m.canThamSo === 'tran-khung') kiem(m.id + ': CẦN hàm có tham số (tràn khung): khai triển ra ' + chinh.length + ' dòng > 10 → tran-khung, không chạy', tran && !r.thang && r.sao === 0 && chinh.length > 10, J([chinh.length, maCua(r)]));
    else kiem(m.id + ': hàm có tham số giúp đạt 3 sao: khai triển ra vẫn vừa khung, thắng nhưng ' + r.soO + ' ô > ' + m.sao.o + ' → dưới 3 sao', !tran && r.thang && r.soO > m.sao.o && r.sao < 3, J([maCua(r), r.thang, r.soO, r.sao]));
  }
  console.log('\n  Bảng chương tham-so: viết không dùng hàm có tham số thì?');
  for (const b of bang) console.log('  ' + b.id.padEnd(5) + ' | ' + b.can.padEnd(10) + ' | ' + String(b.dong).padStart(2) + ' dòng | ' + (b.tran ? 'tràn khung' : 'ô ' + b.o + ' > ' + b.saoO + ' → ' + b.sao + ' sao'));
}

/* ============================================================ 8. BẢNG 10 MÀN */
console.log('\n== 8. Bảng 10 màn (sân in lưới: o vật · D đích · # tường · > < ^ v băng · F cờ; xe và hướng ghi riêng) ==');
{
  const MUI = ['↑', '→', '↓', '←'];
  console.log('  màn  | ô  | nhịp | BFS  | hàng     | tạo hàm');
  for (const m of ds) {
    const r = ChamHoc.cham(m, m.loiGiai, tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi));
    const bfs = m.mucTieu === 'dua-vat' ? nhipDuaVatNganNhat(m).nhip : '=';
    console.log('  ' + m.id.padEnd(4) + ' | ' + String(r.soO).padEnd(2) + ' | ' + String(r.soNhip).padEnd(4) + ' | ' + String(bfs).padEnd(4) + ' | ' + m.hang.padEnd(8) + ' | ' + (m.taoHam.join(', ') || '-'));
  }
  for (const m of ds) {
    const r = ChamHoc.cham(m, m.loiGiai, tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi));
    console.log('\n  ' + m.id + ' ' + m.ten + ' [' + m.hang + (m.mucTieu === 'dua-vat' ? ', dua-vat' : '') + '] ' + m.san[0].length + '×' + m.san.length + ' · ô ' + r.soO + ' · nhịp ' + r.soNhip);
    for (const g of m.san) console.log('    ' + g);
    console.log('    xe: (' + m.batDau.x + ', ' + m.batDau.y + ') quay ' + MUI[m.batDau.huong] + (SanHoc.docSan(m.san).vat.some((v) => v.x === m.batDau.x && v.y === m.batDau.y) ? ' · đứng trên vật' : ''));
    console.log('    lời giải: ' + m.loiGiai.chinh.map((s) => s.replace(/^ {4}/, '· ')).join(' | '));
  }
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

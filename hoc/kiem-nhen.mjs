/* ============================================================================
   kiem-nhen.mjs — máy kiểm chương `nhen` (Thân nhện) của "Đường học".
   Gồm: luật nhện (4 hướng tuyệt đối, 2 nhịp mỗi bước, bậc thang, băng chuyền xuôi / ngược chiều, tay kẹp: lệnh tay
   làm ở nhịp đầu của bước, tay hạ thì chân vướng), chuỗi chữ chỉ đường với go() / walk() (if / elif, for c in "…"),
   bộ dò đường tắt cho nhện (do-duong-nhen.mjs) và so chéo với san-hoc.js bằng chương trình ngẫu nhiên, dữ liệu 10 màn,
   canHam (không dùng hàm / chuỗi thì tràn khung), cauTruc 'if', mã chẩn đoán cho nhện và bảng 10 màn.
   Các kiểm chung cho cả 70 màn (đi tuần tự, sao, lời sai, đường tắt BFS…) nằm ở kiem-hoc.mjs.
   Chạy: node robotics/hoc/kiem-nhen.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { nhipNhenNganNhat, buocMotNhip, dungNguCanh, trangThaiDau, hanhDongTuDo, chuoiThanhMa, laThang } from './do-duong-nhen.mjs';

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
require(path.join(day, 'man-tham-so.js'));
const ManHoc = require(path.join(day, 'man-nhen.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const vt = (r) => r.x + ',' + r.y;
const maSK = (kq, ma) => kq.suKien.filter((e) => e.ma === ma);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');

const ds = ManHoc.danhSach.filter((m) => m.chuong === 'nhen');
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
const man = (id) => ManHoc.tim(id);
const chamGiai = (m) => ChamHoc.cham(m, m.loiGiai, tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi));

const NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
const NHEN_TAY = NHEN.concat(['arm_down', 'arm_up', 'grab', 'release']);
const L = (...d) => d.join('\n') + '\n';
const nhen = (rows, bd, code, extra) => SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'nhen' }, extra || {}), code);
const nhenTay = (rows, bd, code, extra) => nhen(rows, bd, code, Object.assign({ hamGoc: NHEN_TAY }, extra || {}));
const GO = L('def go(d):', '    if d == "U":', '        go_up()', '    elif d == "D":', '        go_down()', '    elif d == "L":', '        go_left()', '    elif d == "R":', '        go_right()');
const WALK = L('def walk(path):', '    for c in path:', '        go(c)');
const TRONG = ['.......', '.......', '.......', '.......', '.......'];
const O = { x: 3, y: 2, huong: 0 };

/* ====================================================== 1. LUẬT NHỆN: ĐI VÀ TƯỜNG */
console.log('\n== 1. Nhện: 4 hướng tuyệt đối, 2 nhịp mỗi bước, bậc thang ==');
{
  const huongHet = ['go_up', 'go_right', 'go_down', 'go_left'].map((l) => nhen(TRONG, O, l + '()'));
  kiem('bốn lệnh go_* đi lên / phải / xuống / trái, mỗi lệnh 2 nhịp', J(huongHet.map((k) => vt(k.robot))) === J(['3,1', '4,2', '3,3', '2,2']) && huongHet.every((k) => k.nhip === 2));
  kiem('nhện KHÔNG có hướng mặt: đi mãi vẫn huong 0', nhen(TRONG, O, L('go_right()', 'go_down()', 'go_left()', 'go_up()')).robot.huong === 0);
  const k = nhen(TRONG, O, 'go_right()');
  const nv = nhipVet(k);
  kiem('nhịp 1 của bước: "chuan-bi", chưa rời ô; nhịp 2: "di", sang ô mới', J(nv.map((n) => vt(n.robot))) === J(['3,2', '4,2']) && nv[0].suKien[0].ma === 'chuan-bi' && nv[1].suKien[0].ma === 'di');
  kiem('wait() của nhện = 1 nhịp đứng yên (lệnh tay chưa có thì không làm gì)', nhen(TRONG, O, 'wait()').nhip === 1);
  const SANG = ['...S...', '...S...', '...S...', '...S...', '...S...'];
  kiem('nhện qua được bậc thang S như một ô thường (mỗi bước vẫn 2 nhịp)', (() => { const r = nhen(SANG, { x: 3, y: 4, huong: 0 }, L('go_up()', 'go_up()', 'go_up()', 'go_up()')); return vt(r.robot) === '3,0' && r.nhip === 8 && !r.suKien.length; })());
  const banh = SanHoc.chay({ san: ['..S..'], batDau: { x: 1, y: 0, huong: 1 }, loaiRobot: 'banh' }, L('left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'));
  kiem('xe bánh không leo được bậc thang: dam-tuong, vat bac-thang, xe đứng im', maSK(banh, 'dam-tuong').length >= 1 && maSK(banh, 'dam-tuong')[0].vat === 'bac-thang' && vt(banh.robot) === '1,0');
  const t = nhen(['.......', '...#...', '.......'], { x: 3, y: 2, huong: 0 }, L('go_up()', 'go_left()'));
  kiem('đâm tường: đứng yên, vẫn tốn 2 nhịp, nhịp ghi lại là nhịp 2 của bước; đi tiếp được', vt(t.robot) === '2,2' && t.nhip === 4 && maSK(t, 'dam-tuong').length === 1 && maSK(t, 'dam-tuong')[0].nhip === 2);
  kiem('ra khỏi sân: dam-tuong (ngoai-san)', maSK(nhen(TRONG, { x: 0, y: 0, huong: 0 }, 'go_left()'), 'dam-tuong')[0].vat === 'ngoai-san');
  kiem('nhện thắng NGAY khi chạm cờ (dừng, không chạy tiếp)', (() => { const r = nhen(['..F'], { x: 0, y: 0, huong: 0 }, L('go_right()', 'go_right()', 'go_right()')); return r.thang && r.nhip === 4 && vt(r.robot) === '2,0'; })());
  kiem('nhện chỉ nhận lệnh nhện: left_move() là lỗi chạy (tên lạ)', (() => { const r = nhen(TRONG, O, 'left_move()'); return r.loi && r.loi.loai === 'runtime-error'; })());
  kiem('không khai hamGoc lệnh tay thì nhện gọi arm_down() là lỗi chạy, vết không có tay', (() => { const r = nhen(TRONG, O, 'arm_down()\nwait()'); return r.loi && r.loi.loai === 'runtime-error' && r.tay === null; })());
}

/* ====================================================== 2. BĂNG CHUYỀN CHO NHỆN */
console.log('\n== 2. Băng chuyền: xuôi chiều được lời, ngược chiều thì kẹt ==');
{
  const NGANG_PHAI = ['.......', '.......', '.>>>>>.', '.......', '.......'];
  const NGANG_TRAI = ['.......', '.......', '.<<<<<.', '.......', '.......'];
  // đi từ ô thường vào băng xuôi
  const xuoi1 = nhen(NGANG_PHAI.map((s) => s.replace('>>>>>', '>....')), { x: 0, y: 2, huong: 0 }, L('go_right()', 'go_right()'));
  kiem('xuôi chiều, băng một ô: hai bước = 3 ô (băng đẩy thêm 1 ở nhịp đầu của bước 2)', vt(xuoi1.robot) === '3,2' && xuoi1.nhip === 4, vt(xuoi1.robot));
  const xuoi2 = nhen(NGANG_PHAI, { x: 0, y: 2, huong: 0 }, L('go_right()', 'go_right()'));
  kiem('xuôi chiều, băng liền nhiều ô: hai bước vẫn chỉ 3 ô (số chữ ≠ số ô khi có băng)', vt(xuoi2.robot) === '3,2', vt(xuoi2.robot));
  const xuoi3 = nhen(NGANG_PHAI, { x: 0, y: 2, huong: 0 }, L('go_right()', 'go_right()', 'go_right()'));
  kiem('xuôi chiều: ba bước = 5 ô, không phải 3', vt(xuoi3.robot) === '5,2' || vt(xuoi3.robot) === '6,2', vt(xuoi3.robot));
  // ngược chiều
  for (const soBuoc of [1, 2, 3, 6]) {
    const r = nhen(NGANG_TRAI.map((s) => s), { x: 0, y: 2, huong: 0 }, lapLenh('go_right()', soBuoc));
    kiem('ngược chiều: ' + soBuoc + ' bước go_right() vào băng "<" không qua được (chỉ lên được ô băng đầu rồi bị đẩy về)', r.robot.x <= 1 && r.robot.y === 2 && r.nhip === 2 * soBuoc, vt(r.robot) + ' nhịp ' + r.nhip);
  }
  const keo = nhen(['.<<<<<F'], { x: 0, y: 0, huong: 0 }, lapLenh('go_right()', 12));
  kiem('đường thẳng ngược băng tới cờ: chạy 12 bước vẫn không tới (chưa thắng)', !keo.thang && keo.robot.x <= 1);
  // đang đứng trên băng ngược chiều rồi bước lên
  const tren = nhen(['<<<<<<<'], { x: 5, y: 0, huong: 0 }, L('go_left()', 'go_left()'));
  kiem('đứng sẵn trên băng "<" và đi theo chiều băng (go_left): được lời, nhanh hơn 1 ô / bước', vt(tren.robot) === '1,0' || vt(tren.robot) === '2,0', vt(tren.robot));
  const nguoc2 = nhen(['>>>>>>>'], { x: 5, y: 0, huong: 0 }, L('go_left()', 'go_left()'));
  kiem('đứng trên băng ">" mà đi ngược (go_left): bước rồi bị đẩy về, kẹt tại chỗ', vt(nguoc2.robot) === '5,0', vt(nguoc2.robot));
  // chờ trên băng
  kiem('đứng chờ 2 nhịp trên băng: bị đẩy 1 ô (như xe)', vt(nhen(NGANG_PHAI, { x: 1, y: 2, huong: 0 }, L('wait()', 'wait()')).robot) === '2,2');
  // băng ngang qua đường đi dọc: bị đẩy lệch
  const CAT = ['.....', '..v..', '.....'];
  const cat = nhen(['.....', '.....', '..v..', '.....', '.....'], { x: 2, y: 0, huong: 0 }, L('go_down()', 'go_down()', 'go_down()'));
  kiem('đi dọc qua một ô băng "v" xuôi chiều: ba bước = 4 ô (băng đẩy thêm 1 ô ở nhịp đầu của bước sau khi bước lên băng)', vt(cat.robot) === '2,4' && cat.nhip === 6, vt(cat.robot));
  const ngang = nhen(['.....', '..^..', '.....'], { x: 0, y: 1, huong: 0 }, L('go_right()', 'go_right()', 'go_right()'));
  kiem('đi ngang qua băng "^": bị đẩy lên 1 ô giữa chừng', vt(ngang.robot) === '3,0' || vt(ngang.robot) === '3,1', vt(ngang.robot));
  void CAT;
}
function lapLenh(l, n) { return Array(n).fill(l).join('\n') + '\n'; }

/* ====================================================== 3. TAY KẸP CỦA NHỆN */
console.log('\n== 3. Tay kẹp của nhện: lệnh tay làm ở nhịp đầu của bước; tay hạ thì chân vướng ==');
{
  // LUẬT VẬT (14/10): vật chiếm ô; tay kẹp ở cạnh TRƯỚC cố định (huong 0 = trên): nhặt / thả ở ô ngay TRÊN ô nhện đứng.
  const S = ['.......', '..o....', '.......', '.......', '.......'];
  const bd = { x: 2, y: 2, huong: 0 };
  const T0 = { tuThe: 'tren', kep: false, cam: null };
  kiem('nhện có tay: tay mặc định nâng, kẹp mở, không cầm gì', J(nhenTay(S, bd, 'wait()').tay) === J(T0));
  const a = nhenTay(S, bd, L('arm_down()', 'grab()', 'wait()'));
  kiem('arm_down + grab + wait: một nhịp, nhặt được vật ở ô ngay trên đầu nhện (ô trước mặt)', a.nhip === 1 && a.tay.cam === 1 && a.tay.tuThe === 'duoi' && a.vat[0].trangThai === 'cam' && maSK(a, 'kep-hut').length === 0);
  const a2 = nhenTay(S, { x: 2, y: 1, huong: 0 }, L('arm_down()', 'grab()', 'wait()'));
  kiem('vật nằm đất chiếm ô: nhện xuất phát trên ô vật thì grab với ô trước mặt (không có vật) → kep-hut khong-co-vat, vật vẫn nằm', maSK(a2, 'kep-hut').length === 1 && maSK(a2, 'kep-hut')[0].lyDo === 'khong-co-vat' && a2.tay.cam === null && a2.vat[0].trangThai === 'dat');
  const a3 = nhenTay(S, { x: 2, y: 3, huong: 0 }, L('go_up()', 'go_up()'));
  kiem('vật chiếm ô: nhện đi lên vào ô có vật thì đứng im, dam-tuong vat "vat" (vẫn mất 2 nhịp mỗi bước)', vt(a3.robot) === '2,2' && maSK(a3, 'dam-tuong').length === 1 && maSK(a3, 'dam-tuong')[0].vat === 'vat' && a3.nhip === 4);
  const a4 = nhenTay(S, { x: 1, y: 1, huong: 0 }, L('go_right()'));
  kiem('vật chiếm ô: nhện đi ngang vào ô có vật cũng bị chặn (hướng đi không quan trọng)', vt(a4.robot) === '1,1' && maSK(a4, 'dam-tuong')[0].vat === 'vat');
  const a5 = nhenTay(S, bd, L('go_right()', 'arm_down()', 'grab()', 'wait()'));
  kiem('tay cố định phía TRÊN: nhện đi sang phải rồi grab thì ô trước mặt (3,1) không có vật → kep-hut khong-co-vat (nhện không quay theo hướng đi)', maSK(a5, 'kep-hut').length === 1 && maSK(a5, 'kep-hut')[0].lyDo === 'khong-co-vat' && maSK(a5, 'kep-hut')[0].o && vt(maSK(a5, 'kep-hut')[0].o) === '3,1');
  const a6 = nhenTay(['.o....', '......'], { x: 0, y: 0, huong: 1 }, L('arm_down()', 'grab()', 'wait()'));
  kiem('batDau.huong 1: tay ở cạnh PHẢI, nhặt được vật ở ô bên phải nhện', a6.tay.cam === 1 && a6.vat[0].trangThai === 'cam');
  const b = nhenTay(S, bd, L('arm_down()', 'grab()', 'go_right()'));
  kiem('arm_down + grab + go_right: tay làm ở NHỊP ĐẦU, nhịp hai chân vướng (tay-vuong), nhện đứng im, mất 2 nhịp',
    b.nhip === 2 && vt(b.robot) === '2,2' && b.tay.cam === 1 && maSK(b, 'tay-vuong').length === 1 && maSK(b, 'tay-vuong')[0].nhip === 2 && maSK(b, 'tay-vuong')[0].lenh && maSK(b, 'tay-vuong')[0].lenh.ten === 'go_right', J(b.suKien));
  kiem('tay-vuong ở nhịp đầu cho thấy nhịp 1 là chuan-bi và tay đã hạ + nhặt xong', (() => { const n = nhipVet(b); return n[0].suKien.some((e) => e.ma === 'nhat-vat') && n[0].suKien.some((e) => e.ma === 'chuan-bi') && n[1].suKien.some((e) => e.ma === 'tay-vuong'); })());
  const c = nhenTay(S, bd, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'go_right()'));
  kiem('arm_up() chờ rồi go_right(): tay nâng ở nhịp đầu, chân bước ngay trong cùng bước (không cần wait() riêng): 1 + 2 nhịp', c.nhip === 3 && vt(c.robot) === '3,2' && c.tay.tuThe === 'tren' && c.tay.cam === 1 && c.vat[0].x === 3);
  const c2 = nhenTay(S, bd, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'go_right()'));
  kiem('cách cũ pick() có wait() sau arm_up(): chậm hơn đúng 1 nhịp, cùng kết quả', c2.nhip === 4 && vt(c2.robot) === '3,2' && c2.tay.cam === 1);
  const d = nhenTay(S, bd, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'go_right()', 'arm_down()', 'release()', 'wait()'), { mucTieu: 'dua-vat', dich: [{ x: 3, y: 1 }] });
  kiem('mang vật sang phải một ô rồi thả xuống ô trước mặt (3,1) là ô đích: thắng NGAY (dua-vat), vật đi theo nhện', d.thang && d.nhip === 4 && d.vat[0].trangThai === 'dat' && d.vat[0].x === 3 && d.vat[0].y === 1 && nhipVet(d).some((n) => n.suKien.some((e) => e.ma === 'xong-dua-vat')), J([d.thang, d.nhip, d.vat]));
  const e = nhenTay(S, bd, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'release()', 'wait()'), { mucTieu: 'dua-vat', dich: [{ x: 5, y: 1 }] });
  kiem('release() khi tay đang nâng: vật rơi VỠ, chạy dừng ngay (dungSom vat-vo)', e.dungSom === 'vat-vo' && !e.thang && maSK(e, 'vat-vo').length === 1 && e.vat[0].trangThai === 'vo');
  const f = nhenTay(S, bd, L('arm_down()', 'arm_down()', 'wait()'));
  kiem('hai lệnh tư thế cùng nhịp: lệnh sau bị bỏ (tay-goi-lai)', maSK(f, 'tay-goi-lai').length === 1 && maSK(f, 'tay-goi-lai')[0].nhom === 'tu-the');
  const g = nhenTay(S, bd, L('arm_down()', 'grab()', 'go_down()', 'arm_up()', 'go_down()'));
  kiem('lệnh tay chờ xong trước bước kế tiếp: bước đầu bị vướng, bước sau (arm_up() trước go_down) đi được', vt(g.robot) === '2,3' && g.nhip === 4 && maSK(g, 'tay-vuong').length === 1);
  const h = nhenTay(S, bd, L('arm_down()', 'grab()'));
  kiem('lệnh tay còn treo khi hết chương trình (không wait / không bước): quen-wait, lệnh không chạy', maSK(h, 'quen-wait').length === 1 && h.nhip === 0 && h.tay.cam === null);
  const i = nhenTay(S, bd, L('go_right()', 'arm_down()', 'grab()', 'go_right()'));
  kiem('hạ tay rồi bước: tay-vuong chỉ khi tay đang hạ lúc nhịp 2 (ở đây hạ ở nhịp 1 của bước sau)', maSK(i, 'tay-vuong').length === 1 && vt(i.robot) === '3,2');
  // tay hạ không cản băng chuyền
  const bang = nhenTay(['.>>>>>>', 'o......'], { x: 0, y: 1, huong: 0 }, L('go_up()', 'wait()'), {});
  void bang;
  const bangTay = nhenTay(['...>>>.'], { x: 3, y: 0, huong: 0 }, L('arm_down()', 'wait()', 'wait()'));
  kiem('tay hạ không cản băng chuyền: nhện đứng trên băng vẫn bị đẩy sau 2 nhịp', vt(bangTay.robot) === '4,0' && bangTay.tay.tuThe === 'duoi');
  const cam = nhenTay(['o......', '.>>>>>.'], { x: 0, y: 1, huong: 0 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'go_right()', 'wait()'), { mucTieu: 'dua-vat', dich: [{ x: 6, y: 0 }] });
  kiem('vật đang cầm đi theo nhện cả khi băng đẩy', cam.vat[0].trangThai === 'cam' && cam.vat[0].x === cam.robot.x && cam.robot.x >= 2, J([cam.robot, cam.vat]));
  // xe bánh vẫn chạy như cũ với cùng cấu trúc xuLy
  const xe = SanHoc.chay({ san: S, batDau: bd, loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'] }, L('arm_down()', 'grab()', 'wait()'));
  kiem('xe bánh có tay gắp không đổi (chung hàng chờ lệnh tay)', xe.tay.cam === 1 && xe.nhip === 1);
}

/* ====================================================== 4. CHUỖI KÝ TỰ VỚI go() VÀ walk() */
console.log('\n== 4. Chuỗi chữ chỉ đường: go(d) bằng if / elif, walk(path) bằng for c in path ==');
{
  const S = TRONG;
  for (const [chu, kq] of [['U', '3,1'], ['D', '3,3'], ['L', '2,2'], ['R', '4,2']]) {
    const r = nhen(S, O, GO + 'go("' + chu + '")\n');
    kiem('go("' + chu + '") đi đúng một bước (' + kq + ') trong 2 nhịp', vt(r.robot) === kq && r.nhip === 2);
  }
  kiem('go("u") chữ thường: không nhánh nào khớp, nhện đứng im, 0 nhịp', (() => { const r = nhen(S, O, GO + 'go("u")\ngo("r")\n'); return vt(r.robot) === '3,2' && r.nhip === 0 && !r.loi; })());
  kiem('go("X") chữ lạ và go("") rỗng: không làm gì, không lỗi', (() => { const r = nhen(S, O, GO + 'go("X")\ngo("")\ngo("UU")\n'); return vt(r.robot) === '3,2' && r.nhip === 0 && !r.loi; })());
  kiem('go(3) số thay vì chuỗi: so sánh khác nhau, không nhánh nào khớp', (() => { const r = nhen(S, O, GO + 'go(3)\n'); return vt(r.robot) === '3,2' && !r.loi; })());
  kiem('go(U) quên dấu nháy: lỗi chạy báo tên chưa có', (() => { const r = nhen(S, O, GO + 'go(U)\n'); return r.loi && r.loi.loai === 'runtime-error' && /Chưa có biến tên "U"/.test(r.loi.thongDiep); })());
  kiem('go("U" + 1): chuỗi cộng số là lỗi chạy tiếng Việt', (() => { const r = nhen(S, O, GO + 'go("U" + 1)\n'); return r.loi && r.loi.loai === 'runtime-error' && /chuỗi/.test(r.loi.thongDiep); })());
  kiem('so sánh chuỗi phân biệt hoa thường: "U" == "u" sai, "U" == "U" đúng', (() => { const r = nhen(S, O, 'if "U" == "u":\n    go_up()\nelif "U" == "U":\n    go_down()\n'); return vt(r.robot) === '3,3'; })());
  kiem('if / elif / else: else chạy khi không nhánh nào khớp', (() => { const r = nhen(S, O, 'd = "Z"\nif d == "U":\n    go_up()\nelif d == "D":\n    go_down()\nelse:\n    go_left()\n'); return vt(r.robot) === '2,2'; })());
  kiem('"in" và "not in" trên chuỗi dùng được cho nhện: if d in "UD"', (() => { const r = nhen(S, O, 'for d in "UXD":\n    if d in "UD":\n        go_up()\n'); return vt(r.robot) === '3,0'; })());
  const w = nhen(S, { x: 0, y: 0, huong: 0 }, GO + WALK + 'walk("RRDD")\nwalk("")\nwalk("LU")\n');
  kiem('walk("RRDD") rồi walk("") rồi walk("LU"): mỗi chữ một bước, chuỗi rỗng không làm gì', vt(w.robot) === '1,1' && w.nhip === 12, vt(w.robot) + ' ' + w.nhip);
  kiem('for c in "UURR": lặp qua từng chữ của chuỗi', vt(nhen(S, { x: 0, y: 4, huong: 0 }, GO + 'for c in "UURR":\n    go(c)\n').robot) === '2,2');
  kiem('walk("RR" * 2 + "D"): phép nhân và cộng chuỗi vẫn dùng được làm đối số', vt(nhen(S, { x: 0, y: 0, huong: 0 }, GO + WALK + 'walk("RR" * 2 + "D")\n').robot) === '4,1');
  const k = nhen(S, O, GO + WALK + 'walk()\n');
  kiem('walk() thiếu đối số: lỗi chạy báo thiếu đối số (tiếng Việt)', k.loi && k.loi.loai === 'runtime-error' && /đối số/.test(k.loi.thongDiep), J(k.loi));
  // khung code
  kiem('cauTruc ["for","if"]: dùng if trong màn nhen không bị báo', KhungCode.kiemTra({ chinh: 10, cauTruc: ['for', 'if'] }, { chinh: ['if "A" == "A":', '    go_up()'] }).length === 0);
  const ifBao = KhungCode.kiemTra({ chinh: 10, cauTruc: ['for'] }, { chinh: ['go_up()', 'if "A" == "A":', '    go_up()'] });
  kiem('màn chỉ cho for mà dùng if: cau-truc-chua-hoc nêu dòng và nói đó là lệnh rẽ nhánh if', ifBao.length === 1 && ifBao[0].ma === 'cau-truc-chua-hoc' && ifBao[0].cauTruc === 'if' && ifBao[0].dong === 2 && /if/.test(ifBao[0].loi));
  const ifTrongHam = KhungCode.kiemTra({ chinh: 10, cauTruc: [] }, { chinh: ['f()'], hamCuaMan: [H('f', ['if 1 == 1:', '    wait()'])] });
  kiem('if trong hàm của màn ở màn chưa học if: báo, cot hamMan kèm tên hàm', ifTrongHam.length === 1 && ifTrongHam[0].cot === 'hamMan' && ifTrongHam[0].ten === 'f' && ifTrongHam[0].cauTruc === 'if');
  kiem('chữ "if" trong chú thích hay tên biến (iffy) không bị báo', KhungCode.kiemTra({ chinh: 10, cauTruc: [] }, { chinh: ['# if x', 'iffy()'] }).length === 0);
  const m61 = ManHoc.tim('8.6'), r61 = ChamHoc.cham(m61, { chinh: ['if 1 == 1:', '    move()'] }, []);
  kiem('qua máy chấm: màn tham-so (cauTruc ["for"]) dùng if → cau-truc-chua-hoc, không chạy', maCua(r61).join() === 'cau-truc-chua-hoc' && r61.vet.length === 0);
  kiem('hàm gốc của nhện không trùng tên hàm cốt truyện: go, walk, bring không là hàm gốc; tên khóa trong kho', ['go', 'walk', 'bring'].every((t) => !KhoHam.HAM_GOC_MAC_DINH.includes(t)) && tenCotTruyen.includes('go') && tenCotTruyen.includes('walk') && tenCotTruyen.includes('bring'));
  kiem('tên hàm cốt truyện của chương nhen không trùng tên hàm cốt truyện chương trước',
    (() => { const cu = tatCa.filter((m) => m.chuong !== 'nhen').flatMap((m) => m.taoHam); return ['go', 'walk', 'bring'].every((t) => !cu.includes(t)); })());
}

/* ====================================================== 5. BỘ DÒ ĐƯỜNG TẮT CHO NHỆN */
console.log('\n== 5. Bộ dò đường tắt cho nhện (BFS theo nhịp) và so chéo với san-hoc.js ==');
{
  const bfs = (san, bd, ex) => nhipNhenNganNhat(Object.assign({ loaiRobot: 'nhen', san, batDau: bd }, ex || {}));
  kiem('đường thẳng 3 ô = 6 nhịp', bfs(['....F'].map((s) => s), { x: 1, y: 0, huong: 0 }).nhip === 6);
  kiem('đường chéo 2 ô: 4 bước = 8 nhịp (không có đường chéo)', bfs(['...', '...', '..F'], { x: 0, y: 0, huong: 0 }).nhip === 8);
  kiem('bậc thang S đi qua được: đường qua S ngắn hơn đường vòng', bfs(['.S.F', '###.'], { x: 0, y: 0, huong: 0 }).nhip === 6);
  kiem('cờ bị tường vây kín → null', bfs(['.....', '.###.', '.#F#.', '.###.', '.....'], { x: 0, y: 0, huong: 0 }).nhip === null);
  kiem('băng ngược chiều chắn đường hẹp → null (kẹt mãi)', bfs(['.<<<F'], { x: 0, y: 0, huong: 0 }).nhip === null);
  kiem('băng xuôi chiều: nhanh hơn đi bộ (cùng 3 ô trong hành lang)', bfs(['.>>F'], { x: 0, y: 0, huong: 0 }).nhip < 6, String(bfs(['.>>F'], { x: 0, y: 0, huong: 0 }).nhip));
  kiem('BFS biết chờ trên băng: chờ cho băng đẩy cũng là hành động', (() => { const b = bfs(['>>>>F'], { x: 0, y: 0, huong: 0 }); return b.nhip !== null && b.nhip <= 8; })());
  // tay ở cạnh trước CỐ ĐỊNH (batDau.huong 1 = bên phải): vật '.o.D' nằm ngay phải nhện, ô đích cách hai ô
  const co = bfs(['.o.D'], { x: 0, y: 0, huong: 1 }, { hamGoc: NHEN_TAY, mucTieu: 'dua-vat' });
  kiem('dua-vat (tay bên phải): nhặt vật ở ô trước mặt (1: hạ tay + kẹp) + đi 2 bước (4) + thả xuống ô đích trước mặt (1) = 6 nhịp, nâng tay gộp vào nhịp đầu của bước', co.nhip === 6, String(co.nhip));
  kiem('chuoiThanhMa: mã sinh từ BFS chạy trong san-hoc.js cho đúng số nhịp (dua-vat)', (() => {
    const r = nhenTay(['.o.D'], { x: 0, y: 0, huong: 1 }, chuoiThanhMa(co.chuoi), { mucTieu: 'dua-vat' });
    return r.thang && r.nhip === co.nhip;
  })());
  kiem('vật chiếm ô: sân hành lang một ô rộng có vật chắn lối (tay huong 0 lên) → BFS null (không bước qua vật, tay không với tới ô đích trên đường thẳng)', bfs(['.o.F'], { x: 0, y: 0, huong: 0 }, { hamGoc: NHEN_TAY }).nhip === null);
  kiem('vật chiếm ô: có tay bên phải thì nhặt vật chắn lối rồi đi tiếp tới cờ (vật cầm không chiếm ô)', bfs(['.o.F'], { x: 0, y: 0, huong: 1 }, { hamGoc: NHEN_TAY }).nhip !== null);
  // so chéo: chương trình ngẫu nhiên (xorshift cố định)
  let seed = 123456789;
  const rnd = (n) => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed % n; };
  const KY = '.....##SS>><<^^vv';
  let soCa = 0, lech = 0, ghiLech = '';
  for (let lan = 0; lan < 400; lan++) {
    const rong = 4 + rnd(3), cao = 4 + rnd(3);
    const rows = [];
    for (let y = 0; y < cao; y++) { let s = ''; for (let x = 0; x < rong; x++) s += KY[rnd(KY.length)]; rows.push(s); }
    // vật và ô đích (ghi đè lên ô thường)
    const dat1 = (ch, n) => { for (let i = 0; i < n; i++) { const x = rnd(rong), y = rnd(cao); if (rows[y][x] === '.' ) rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1); } };
    dat1('o', 2); dat1('D', 2);
    // xuất phát: một ô đứng được
    let bd = null;
    for (let i = 0; i < 50 && !bd; i++) { const x = rnd(rong), y = rnd(cao); if (rows[y][x] !== '#') bd = { x, y, huong: 0 }; }
    if (!bd) continue;
    const man = { loaiRobot: 'nhen', san: rows, batDau: bd, hamGoc: NHEN_TAY, mucTieu: 'dua-vat' };
    const ctx = dungNguCanh(man), HD = hanhDongTuDo(ctx);
    // chương trình ngẫu nhiên: 12 hành động tự do
    const chuoi = [];
    for (let i = 0; i < 12; i++) chuoi.push(HD[rnd(HD.length)]);
    const code = chuoiThanhMa(chuoi);
    // chạy BFS-step theo chuỗi (chen nhịp 2 bắt buộc sau mỗi bước)
    let S = trangThaiDau(ctx), nhip = 0, vo = false;
    for (const a of chuoi) {
      S = buocMotNhip(ctx, S, a); nhip++;
      if (S.p >= 0) { S = buocMotNhip(ctx, S, null); nhip++; }
      if (S.pos.some((p) => p === -2)) vo = true;
    }
    const kq = SanHoc.chay({ san: rows, batDau: bd, loaiRobot: 'nhen', hamGoc: NHEN_TAY, mucTieu: 'toi-co' }, code);   // 'toi-co' không có cờ → không dừng sớm
    soCa++;
    // so sánh vị trí, tay, vật
    const vatBfs = S.pos.map((p) => (p === -2 ? 'vo' : p === -1 ? 'cam' : (p % ctx.rong) + ',' + Math.floor(p / ctx.rong)));
    const vatSan = kq.vat.map((v) => (v.trangThai === 'vo' ? 'vo' : v.trangThai === 'cam' ? 'cam' : v.x + ',' + v.y));
    const tayBfs = S.t === 1 ? 'duoi' : 'tren';
    const ok = kq.robot.x === S.x && kq.robot.y === S.y && kq.nhip === nhip && kq.tay.tuThe === tayBfs && J(vatBfs) === J(vatSan);
    if (!ok) { lech++; if (!ghiLech) ghiLech = J({ rows, bd, code, bfs: [S.x, S.y, nhip, tayBfs, vatBfs], san: [kq.robot.x, kq.robot.y, kq.nhip, kq.tay.tuThe, vatSan] }); }
    void vo;
  }
  kiem('so chéo ' + soCa + ' chương trình ngẫu nhiên (sân có tường, bậc thang, băng 4 chiều, vật, đích, tay): BFS và san-hoc.js trùng vị trí, nhịp, tay, vật', soCa >= 350 && lech === 0, lech + ' lệch · ' + ghiLech);
}

/* ====================================================== 6. DỮ LIỆU 10 MÀN */
console.log('\n== 6. Dữ liệu 10 màn: nhện, tay kẹp ở 6, 9, 10, hàm cốt truyện, đường tắt ==');
{
  kiem('đúng 10 màn, số 1..10, id 9.1…9.10 (chương thứ 9, sau tham-so), mã nhen.1…, tên "Thân nhện"',
    ds.length === 10 && ds.every((m, i) => m.so === i + 1 && m.id === '9.' + (i + 1) && m.ma === 'nhen.' + (i + 1)) && ThuTu.thuTu[8] === 'nhen' && ThuTu.thuTu[7] === 'tham-so' && ThuTu.ten.nhen === 'Thân nhện');
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ 9.10 có huy hiệu nhen',
    J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) &&
      ds.filter((m) => m.huyHieu).length === 1 && ds[9].huyHieu.ma === 'nhen' && ds[9].huyHieu.ten === 'Huy hiệu Thân nhện');
  kiem('mọi màn: loaiRobot nhen, robot { than: "nhen", tay }, cauTruc ["for","if"], Xưởng mở, được dùng hàm của em, chương trình 10 ô + mỗi hàm 10 ô',
    ds.every((m) => m.loaiRobot === 'nhen' && m.robot && m.robot.than === 'nhen' && J(m.cauTruc) === '["for","if"]' && m.moXuong === true && m.camHamCuaEm === false && m.khung.chinh === 10 && m.khung.moiHam === 10));
  kiem('tay kẹp chỉ ở 9.6, 9.9, 9.10 (robot.tay "kep", hamGoc có 4 lệnh tay, mục tiêu dua-vat); các màn khác tay null, hamGoc = 4 go_* + wait',
    ds.every((m) => { const co = ['9.6', '9.9', '9.10'].includes(m.id); return co ? m.robot.tay === 'kep' && J(m.hamGoc) === J(NHEN_TAY) && m.mucTieu === 'dua-vat' : m.robot.tay === null && J(m.hamGoc) === J(NHEN) && m.mucTieu === undefined; }));
  kiem('sân tối đa 7×7; màn tới cờ có đúng một cờ F; màn dua-vat có vật và ô đích',
    ds.every((m) => m.san.length <= 7 && m.san[0].length <= 7 && (m.mucTieu === 'dua-vat' ? /o/.test(m.san.join('')) && /D/.test(m.san.join('')) : (m.san.join('').match(/F/g) || []).length === 1)));
  kiem('9.2 và 9.8 và 9.9 và 9.10 và 9.6 có bậc thang S (xe bánh không qua); 9.8, 9.10 có băng chuyền',
    ['9.2', '9.6', '9.8', '9.9', '9.10'].every((id) => /S/.test(man(id).san.join(''))) && ['9.8', '9.10'].every((id) => /[<>^v]/.test(man(id).san.join(''))));
  kiem('hàm cốt truyện mới: 9.4 tạo go, 9.9 tạo walk, 9.10 tạo bring; các màn khác không tạo', ds.every((m) => J(m.taoHam) === J({ '9.4': ['go'], '9.9': ['walk'], '9.10': ['bring'] }[m.id] || [])));
  kiem('go(d) có 8 ô (if / elif bốn nhánh), walk(path) 2 ô, bring(path) 3 ô, tham số đúng',
    (() => { const g = man('9.4').loiGiai.hamCuaEmMoi[0], w = man('9.9').loiGiai.hamCuaEmMoi[0], b = man('9.10').loiGiai.hamCuaEmMoi[0];
      return g.ten === 'go' && J(g.thamSo) === '["d"]' && KhungCode.soOHam(g) === 8 && w.ten === 'walk' && J(w.thamSo) === '["path"]' && KhungCode.soOHam(w) === 2 && b.ten === 'bring' && J(b.thamSo) === '["path"]' && KhungCode.soOHam(b) === 3; })());
  kiem('9.4: đề bài nói rõ quy ước chữ U lên, D xuống, L trái, R phải', (() => { const t = man('9.4').deBai; return /"U" lên/.test(t) && /"D" xuống/.test(t) && /"L" trái/.test(t) && /"R" phải/.test(t); })());
  kiem('9.4 và 9.5 dùng đúng chữ HOA trong lời giải; không có chữ thường trong chuỗi chỉ đường của các lời giải', ds.every((m) => m.loiGiai.chinh.every((s) => !/for c in "[^"]*[a-z]/.test(s))));
  kiem('9.7: hàm của màn go_sai (khác tên go) cho sẵn bản sai, lời giải sửa bản đó; không đè hàm của em',
    (() => { const m = man('9.7'); return m.maMau.hamCuaMan.length === 1 && m.maMau.hamCuaMan[0].ten === 'go_sai' && m.loiGiai.hamCuaMan[0].ten === 'go_sai' && J(m.maMau.hamCuaMan[0].than) !== J(m.loiGiai.hamCuaMan[0].than) && m.loiGiai.hamCuaEmMoi.length === 0; })());
  kiem('9.7: maMau KHÔNG thắng (nhánh sai), lời giải thắng', (() => { const m = man('9.7'); return !ChamHoc.cham(m, m.maMau, khoTruoc('9.7')).thang && chamGiai(m).thang; })());
  kiem('9.7: bỏ qua go_sai, dùng go() của em (đã có từ 9.4) cũng tới cờ với đúng số ô → 3 sao (cùng 10 ô)', (() => {
    const m = man('9.7'); const r = ChamHoc.cham(m, { chinh: ['for c in "DDRRUURRDDDL":', '    go(c)'], hamCuaMan: [] }, khoTruoc('9.7'));
    return r.thang && r.sao === 3 && r.soO === m.sao.o;
  })());
  kiem('maMau của các màn 9.1, 9.2, 9.3 có 2 dòng (1–2 dòng sẵn), vừa khung, chưa thắng', ['9.1', '9.2', '9.3'].every((id) => { const m = man(id); return m.maMau.chinh.length === 2 && !ChamHoc.cham(m, m.maMau, khoTruoc(id)).thang; }));
  kiem('hamCuaEmCan đúng: 9.5 [go], 9.6 [go, pick, drop], 9.9 [go, pick, drop], 9.10 [go, walk, pick, drop]; còn lại rỗng',
    ds.every((m) => J(m.hamCuaEmCan) === J({ '9.5': ['go'], '9.6': ['go', 'pick', 'drop'], '9.9': ['go', 'pick', 'drop'], '9.10': ['go', 'walk', 'pick', 'drop'] }[m.id] || [])));
  kiem('hamCuaEmCan khớp đúng các hàm có sẵn mà lời giải gọi tới (trực tiếp hay gián tiếp), trừ 9.7 (sửa hàm của màn, không dùng hàm của em)', ds.filter((m) => m.id !== '9.7').every((m) => {
    const r = chamGiai(m); const moi = m.taoHam;
    const dung = r.hamDaDung.filter((t) => !moi.includes(t) && r.chiTietO.ham.find((h) => h.ten === t).cot === 'hamEm' && !['move', 'turn_right'].includes(t));
    const co = m.hamCuaEmCan.slice().sort(), dd = dung.slice().sort();
    return J(co) === J(dd);
  }));

  // đường tắt: BFS bằng nhịp lời giải (hoặc ≤ khi có pick / drop)
  for (const m of ds) {
    const b = nhipNhenNganNhat(m), r = chamGiai(m);
    const tk = m.nhipTheoLoiGiai === true;
    kiem(m.id + ' không có ĐƯỜNG TẮT: BFS ' + b.nhip + (tk ? ' ≤ ' : ' = ') + 'nhịp lời giải ' + r.soNhip + ' (sao.nhip ' + m.sao.nhip + ')',
      b.nhip !== null && !b.catNgang && r.soNhip === m.sao.nhip && (tk ? b.nhip <= m.sao.nhip : b.nhip === m.sao.nhip), J([b.nhip, r.soNhip, m.sao.nhip]));
  }
  kiem('nhipTheoLoiGiai chỉ ở màn có pick / drop (9.6, 9.9, 9.10); chênh BFS đúng bằng số lần pick() + drop() có wait() cuối (không tính drop cuối cùng)',
    ds.every((m) => (m.nhipTheoLoiGiai === true) === ['9.6', '9.9', '9.10'].includes(m.id)) &&
      [['9.6', 1], ['9.9', 3], ['9.10', 5]].every(([id, chenh]) => { const m = man(id); return m.sao.nhip - nhipNhenNganNhat(m).nhip === chenh; }));

  // 9.2: xe bánh không tới được cờ (bậc thang chặn), nhện tới được
  const m72 = man('9.2'), s72 = SanHoc.docSan(m72.san);
  const duoc = (loai) => { const thay = new Set([m72.batDau.x + ',' + m72.batDau.y]); const q = [[m72.batDau.x, m72.batDau.y]]; while (q.length) { const [x, y] = q.shift(); for (const v of SanHoc.VEC) { const nx = x + v[0], ny = y + v[1]; if (!SanHoc.lyDoChan(s72, loai, nx, ny) && !thay.has(nx + ',' + ny)) { thay.add(nx + ',' + ny); q.push([nx, ny]); } } } return thay.has(s72.co.x + ',' + s72.co.y); };
  kiem('9.2: cờ chỉ tới được bằng nhện (xe bánh bị bậc thang chặn)', duoc('nhen') && !duoc('banh'));
  // 9.8: đường thẳng ngược băng không đi được; bỏ bậc thang thì hết đường
  const m78 = man('9.8');
  const khongS = Object.assign({}, m78, { san: m78.san.map((r) => r.replace(/S/g, '#')) });
  const chiBang = Object.assign({}, m78, { san: m78.san.map((r, y) => (y < 3 ? r.replace(/[^#]/g, '#') : r)) });
  kiem('9.8: không có bậc thang (S thành tường) thì không tới được cờ; chỉ còn đường thẳng dọc băng cũng không tới được', nhipNhenNganNhat(khongS).nhip === null && nhipNhenNganNhat(chiBang).nhip === null);
  kiem('9.8: nếu băng chuyền đổi thành sàn thì đường thẳng (6 bước, 12 nhịp) ngắn hơn đường vòng: băng chắn thật sự', nhipNhenNganNhat(Object.assign({}, m78, { san: m78.san.map((r) => r.replace(/</g, '.')) })).nhip === 12 && m78.sao.nhip === 24);
  // 9.10: số chữ ≠ số ô ở hai chặng có băng
  const m710 = man('9.10');
  const chang = (chuoi, mau) => { const r = ChamHoc.cham(m710, { chinh: chuoi }, tron(khoTruoc('9.10'), m710.loiGiai.hamCuaEmMoi)); return r; };
  kiem('9.10: chặng đầu "RR" qua một ô băng xuôi thả vật đúng ô đích (3 ô, 2 chữ); "RRR" đi quá một ô, ô trước mặt là tường nên thả bị chặn (tha-bi-chan), vật vẫn ở tay',
    (() => { const a = chang(['walk("RR")', 'bring("RR")']), b = chang(['walk("RR")', 'bring("RRR")']); return a.vat[0].x === 5 && a.vat[0].y === 0 && a.vat[0].trangThai === 'dat' && b.vat[0].trangThai === 'cam' && b.chanDoan.some((c) => c.ma === 'tha-bi-chan'); })());
  kiem('9.10: viết theo số ô (bring("RRR"), bring("LLL") ở chặng băng) không thắng; viết theo số chữ thắng', !chang(['walk("RR")', 'bring("RRR")', 'walk("DDD")', 'bring("LLL")', 'walk("L")', 'bring("L")']).thang && chamGiai(m710).thang);
  // canHam: không dùng hàm / chuỗi thì tràn khung
  for (const m of ds.filter((x) => x.canHam)) {
    const r = chamGiai(m);
    // khai triển: mỗi bước một dòng (đoạn thẳng liền nhau gộp được bằng for: 2 ô), mỗi pick / drop một dòng
    const buoc = r.vet.filter((e) => e.loai === 'lenh' && /^go_/.test(e.ten)).map((e) => e.ten);
    const tay = r.vet.filter((e) => e.loai === 'lenh' && e.ten === 'arm_down').length;
    let ngan = 0;
    for (let i = 0; i < buoc.length;) { let j = i; while (j < buoc.length && buoc[j] === buoc[i]) j++; ngan += (j - i >= 2 ? 2 : 1); i = j; }
    const tho = buoc.length + tay;
    kiem(m.id + ' canHam ' + m.canHam + ': viết thẳng go_* thì ' + tho + ' dòng' + (tay ? ' (gồm ' + tay + ' dòng pick / drop)' : '') + ', gộp đoạn thẳng bằng for vẫn ' + (ngan + tay) + ' dòng > 10 ô',
      m.canHam === 'tran-khung' && tho > m.khung.chinh && ngan + tay > m.khung.chinh, J([tho, ngan, tay]));
  }
  // khai triển nguyên văn ra raw: chạy lại phải cho cùng kết quả, cùng nhịp (hàm không đổi luật)
  for (const m of ds.filter((x) => x.id !== '9.7')) {
    const r = chamGiai(m);
    const raw = r.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten + '()').join('\n') + '\n';
    const k = SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: 'nhen', hamGoc: m.hamGoc, mucTieu: m.mucTieu || 'toi-co' }, raw);
    kiem(m.id + ': khai triển lời giải ra từng lệnh gốc (' + raw.split('\n').length + ' dòng) chạy ra cùng kết quả, cùng ' + r.soNhip + ' nhịp', k.thang === r.thang && k.nhip === r.soNhip && J(k.robot) === J(r.theoSan[0].robot));
  }
}

/* ====================================================== 7. CHẨN ĐOÁN CHO NHỆN + SÂN THỬ XƯỞNG */
console.log('\n== 7. Chẩn đoán cho nhện và sân thử của Xưởng hàm ==');
{
  const m5 = man('9.5');
  const kho5 = khoTruoc('9.5');
  const thuong = ChamHoc.cham(m5, { chinh: ['for c in "urrdrrddlldld":', '    go(c)'] }, kho5);
  kiem('chuỗi chữ thường: nhen-khong-buoc (nhện chưa bước lần nào) và chua-toi-co; lời nhắc phân biệt chữ hoa / thường', maCua(thuong).includes('nhen-khong-buoc') && maCua(thuong).includes('chua-toi-co') && /hoa và chữ thường/.test(thuong.chanDoan.find((c) => c.ma === 'nhen-khong-buoc').loi));
  const chiDung = ChamHoc.cham(m5, { chinh: ['wait()'] }, kho5);
  kiem('chạy xong chỉ có wait(): cũng nhen-khong-buoc (chưa có go_* nào)', maCua(chiDung).includes('nhen-khong-buoc'));
  const daBuoc = ChamHoc.cham(m5, { chinh: ['for c in "UR":', '    go(c)'] }, kho5);
  kiem('đã bước nhưng chưa tới cờ: chua-toi-co, KHÔNG có nhen-khong-buoc; lời không nhắc "quay mặt hướng"', maCua(daBuoc).includes('chua-toi-co') && !maCua(daBuoc).includes('nhen-khong-buoc') && !/quay mặt/.test(daBuoc.chanDoan[0].loi));
  const thang = chamGiai(m5);
  kiem('lời giải thắng: không có nhen-khong-buoc', !maCua(thang).includes('nhen-khong-buoc'));
  const m1 = man('9.1'), dt = ChamHoc.cham(m1, { chinh: ['go_down()'] }, []);
  kiem('đâm tường của nhện: lời nhắc nói về lệnh go_* (nhện không quay), không nói quay mặt', maCua(dt).includes('dam-tuong') && /go_\*/.test(dt.chanDoan.find((c) => c.ma === 'dam-tuong').loi) && !/quay mặt/.test(dt.chanDoan.find((c) => c.ma === 'dam-tuong').loi));
  const m6 = man('9.6'), tv = ChamHoc.cham(m6, { chinh: ['for c in "DRRDR":', '    go(c)', 'arm_down()', 'grab()', 'go_down()'] }, khoTruoc('9.6'));
  kiem('tay-vuong của nhện: lời nói nhện không bước được, nêu lệnh go_down() và dòng của nó', (() => { const c = tv.chanDoan.find((x) => x.ma === 'tay-vuong'); return c && /nhện không bước được/.test(c.loi) && /go_down\(\)/.test(c.loi) && /chương trình, dòng 5/.test(c.loi) && c.cho && c.cho.dong === 5; })(), loiTV(tv));
  const qw = ChamHoc.cham(m6, { chinh: ['for c in "DRRDR":', '    go(c)', 'arm_down()', 'grab()'] }, khoTruoc('9.6'));
  kiem('quen-wait của nhện: nói rõ lệnh tay cần wait() hoặc bước go_*() đi sau', (() => { const c = qw.chanDoan.find((x) => x.ma === 'quen-wait'); return c && /wait\(\) hay bước go_/.test(c.loi); })());
  // sân thử của Xưởng hàm với nhện
  const thu1 = ChamHoc.thuHam(m5, { chinh: [] }, 'go', tron(kho5, []), { doiSo: ['"R"'] });
  kiem('Xưởng hàm: thử go("R") trên sân thử 5×5 mặc định: nhện từ (2,2) sang (3,2) trong 2 nhịp', vt(thu1.robot) === '3,2' && thu1.soNhip === 2 && thu1.chanDoan.length === 0, J([thu1.robot, thu1.soNhip, thu1.chanDoan.map((c) => c.ma)]));
  const wk = tron(khoTruoc('9.10'), [H('walk', ['for c in path:', '    go(c)'], ['path'])]);
  const thu2 = ChamHoc.thuHam(man('9.10'), { chinh: [] }, 'walk', wk, { doiSo: ['"RRD"'] });
  kiem('Xưởng hàm: thử walk("RRD"): 3 bước = 6 nhịp, tới (4,3)', vt(thu2.robot) === '4,3' && thu2.soNhip === 6, J([thu2.robot, thu2.soNhip]));
  const thu3 = ChamHoc.thuHam(man('9.9'), { chinh: [] }, 'pick', khoTruoc('9.9'), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 1 }] } });
  kiem('Xưởng hàm: thử pick() với vật ở ô ngay trên nhện (ô trước mặt, sân thử) với nhện có tay: nhặt được vật', thu3.tay && thu3.tay.cam === 1 && thu3.vat[0].trangThai === 'cam', J(thu3.tay));
  const thu4 = ChamHoc.thuHam(m5, { chinh: [] }, 'go', tron(kho5, [H('go', ['if d == "U":', '    go_up()'], ['d'])]), { doiSo: ['"D"'] });
  kiem('Xưởng hàm: thử go("D") với bản go() thiếu nhánh: nhện đứng im, 0 nhịp, không báo lỗi', vt(thu4.robot) === '2,2' && thu4.soNhip === 0, J([thu4.robot, thu4.soNhip]));
}
function loiTV(r) { return r.chanDoan.map((c) => c.ma + ': ' + c.loi).join(' | '); }

/* ====================================================== 8. BẢNG 10 MÀN */
console.log('\n== 8. Bảng 10 màn chương Thân nhện ==');
{
  console.log('  màn  | sân | tay | ô  | nhịp | BFS | hàng     | tạo hàm | lời giải');
  for (const m of ds) {
    const r = chamGiai(m), b = nhipNhenNganNhat(m);
    console.log('  ' + m.id.padEnd(4) + ' | ' + (m.san[0].length + '×' + m.san.length).padEnd(3) + ' | ' + (m.robot.tay ? 'kẹp' : '-').padEnd(3) + ' | ' + String(r.soO).padEnd(2) + ' | ' + String(r.soNhip).padEnd(4) + ' | ' + String(b.nhip).padEnd(3) + ' | ' + m.hang.padEnd(8) + ' | ' + (m.taoHam.join(', ') || '-').padEnd(7) + ' | ' + m.loiGiai.chinh.map((s) => s.replace(/^ {4}/, '· ')).join(' | '));
  }
  for (const m of ds) {
    console.log('\n  ' + m.id + ' ' + m.ten + ' [' + m.hang + (m.mucTieu === 'dua-vat' ? ', dua-vat' : '') + '] ' + m.san[0].length + '×' + m.san.length + ' · nhện (' + m.batDau.x + ', ' + m.batDau.y + ')');
    for (const g of m.san) console.log('    ' + g);
  }
  kiem('bảng đã in', true);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

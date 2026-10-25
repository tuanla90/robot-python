/* ============================================================================
   kiem-nhen.mjs — máy kiểm chương `nhen` (Thân nhện, làm lại 15/10 theo khuôn làm quen) của "Robot Chấn Hưng".
   Gồm: luật nhện (4 hướng tuyệt đối, 2 nhịp mỗi bước, bậc thang, băng chuyền xuôi / ngược chiều, tay kẹp: lệnh tay làm ở nhịp đầu của bước, tay hạ thì chân vướng),
   chuỗi chữ chỉ đường với go() / walk() (if / elif, for c in "…"), LUẬT CHÂN MỚI (crouch / stand làm ở nhịp đầu của bước hay nhịp wait, ô gầm n, ô hố u, cú NHẢY, daoChieu "chan",
   bongMo.chan), bộ dò đường tắt cho nhện (do-duong-nhen.mjs) và so chéo với san-hoc.js bằng chương trình ngẫu nhiên, dữ liệu 10 màn, canHam (không dùng hàm / chuỗi thì
   tràn khung), mã chẩn đoán cho nhện (roi-ho, nhay-hut, dau-dung-tran, chan-goi-lai, đâm gầm, lệch chân) và bảng 10 màn.
   Các kiểm chung cho cả mọi màn (đi tuần tự, sao, lời sai, đường tắt BFS…) nằm ở kiem-hoc.mjs. Chương chế lệnh nhện: kiem-che-nhen.mjs.
   Chạy: node hoc/kiem-nhen.mjs        (trượt thì thoát mã 1)
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
  const m61 = ManHoc.tim('13.6'), r61 = ChamHoc.cham(m61, { chinh: ['if 1 == 1:', '    move()'] }, []);
  kiem('qua máy chấm: màn tham-so (cauTruc ["for"]) dùng if → cau-truc-chua-hoc, không chạy', maCua(r61).join() === 'cau-truc-chua-hoc' && r61.vet.length === 0);
  kiem('hàm gốc của nhện không trùng tên hàm cốt truyện: go, walk không là hàm gốc (crouch, stand là hàm gốc của nhện); tên khóa trong kho', ['go', 'walk'].every((t) => !KhoHam.HAM_GOC_MAC_DINH.includes(t)) && tenCotTruyen.includes('go') && tenCotTruyen.includes('walk') && ['crouch', 'stand'].every((t) => KhoHam.HAM_GOC_MAC_DINH.includes(t) && !tenCotTruyen.includes(t)));
  kiem('tên hàm cốt truyện của chương nhen không trùng tên hàm cốt truyện chương trước',
    (() => { const cu = tatCa.filter((m) => m.chuong !== 'nhen').flatMap((m) => m.taoHam); return ['go', 'walk'].every((t) => !cu.includes(t)); })());
}


/* ====================================================== 5. LUẬT CHÂN NHỆN: CO / DUỖI, GẦM, HỐ, NHẢY (lõi, 15/10) */
console.log('\n== 5. Chân nhện: crouch / stand, gầm thấp n, hố u, nhảy ==');
{
  const NC = SanHoc.HAM_GOC.nhen;                                      // go_* + wait + crouch + stand
  const chay = (rows, bd, code, ex) => SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'nhen', hamGoc: NC }, ex || {}), code);
  const B0 = { x: 0, y: 0, huong: 0 };
  const chanVet = (r) => nhipVet(r).map((n) => n.robot.chan);
  kiem('HAM_GOC.nhen có crouch và stand sau wait; LENH_NGUOC: crouch ↔ stand; CHAN_LENH = [crouch, stand]; drone vẫn chỉ có go_* + wait; xe bánh không có hai lệnh này',
    J(SanHoc.HAM_GOC.nhen) === J(['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand']) && SanHoc.LENH_NGUOC.crouch === 'stand' && SanHoc.LENH_NGUOC.stand === 'crouch' && J(SanHoc.CHAN_LENH) === '["crouch","stand"]' &&
      J(SanHoc.HAM_GOC.drone) === J(['go_up', 'go_down', 'go_left', 'go_right', 'wait']) && !SanHoc.HAM_GOC.banh.includes('crouch') && KhoHam.HAM_GOC_MAC_DINH.includes('crouch') && KhoHam.HAM_GOC_MAC_DINH.includes('stand'));
  kiem('lệnh chân chỉ RA LỆNH: crouch() rồi wait(): chân co ở nhịp wait, nhịp 1, sự kiện doi-chan { tu "dung", den "co" }',
    (() => { const r = chay(['...'], B0, L('crouch()', 'wait()')); const e = nhipVet(r)[0].suKien.find((s) => s.ma === 'doi-chan'); return r.nhip === 1 && r.chan === 'co' && e && e.tu === 'dung' && e.den === 'co' && e.lenh.ten === 'crouch' && J(chanVet(r)) === '["co"]'; })());
  kiem('crouch() rồi go_right(): chân co ở NHỊP ĐẦU của bước (chuan-bi), nhịp hai sang ô mới; tổng 2 nhịp, không tốn nhịp riêng',
    (() => { const r = chay(['...'], B0, L('crouch()', 'go_right()')), n = nhipVet(r); return r.nhip === 2 && r.chan === 'co' && vt(r.robot) === '1,0' && n[0].suKien.map((s) => s.ma).join() === 'doi-chan,chuan-bi' && n[1].suKien[0].ma === 'di' && J(chanVet(r)) === '["co","co"]'; })());
  kiem('crouch() lúc đang co, stand() lúc đang đứng: không đổi gì, không sự kiện doi-chan, không lỗi',
    (() => { const a = chay(['...'], B0, L('stand()', 'wait()')), b = chay(['...'], { x: 0, y: 0, huong: 0, chan: 'co' }, L('crouch()', 'wait()')); return a.chan === 'dung' && b.chan === 'co' && !maSK(a, 'doi-chan').length && !nhipVet(a)[0].suKien.some((s) => s.ma === 'doi-chan') && !nhipVet(b)[0].suKien.some((s) => s.ma === 'doi-chan') && !a.loi && !b.loi; })());
  kiem('hai lệnh chân cùng một nhịp: lệnh sau bị bỏ (chan-goi-lai, kèm lệnh trước); crouch() rồi stand() → chân co, không nhảy',
    (() => { const r = chay(['...'], B0, L('crouch()', 'stand()', 'go_right()')), e = maSK(r, 'chan-goi-lai')[0]; return r.chan === 'co' && !!e && e.ten === 'stand' && e.truoc.ten === 'crouch' && r.nhip === 2 && !nhipVet(r)[0].suKien.some((s) => s.ma === 'chuan-bi' && s.nhay); })());
  kiem('lệnh chân còn treo khi hết chương trình: quen-wait kèm lệnh; chân không đổi',
    (() => { const r = chay(['...'], B0, L('go_right()', 'crouch()')), e = maSK(r, 'quen-wait')[0]; return r.chan === 'dung' && !!e && e.lenh.length === 1 && e.lenh[0].ten === 'crouch'; })());
  kiem('lệnh chân + lệnh tay cùng nhịp đầu của bước: tay và chân cùng làm ở nhịp 1 (tay hạ, chân co, rồi nhịp 2 chân vướng vì tay hạ)',
    (() => { const r = chay(['...'], B0, L('arm_down()', 'crouch()', 'go_right()'), { hamGoc: NC.concat(['arm_down', 'arm_up', 'grab', 'release']) }); const n = nhipVet(r); return r.chan === 'co' && r.tay.tuThe === 'duoi' && vt(r.robot) === '0,0' && n[0].suKien.some((s) => s.ma === 'doi-chan') && maSK(r, 'tay-vuong').length === 1; })());

  // ---- gầm thấp
  const GAM = ['#####', '..n..', '#####'], BG = { x: 0, y: 1, huong: 0 };
  kiem('gầm n: chân đứng thì ĐÂM (dam-tuong, vat "gam-thap", đứng yên, vẫn tốn 2 nhịp); chân co thì chui vào và đứng trong gầm được',
    (() => { const a = chay(GAM, BG, L('go_right()', 'go_right()', 'go_right()')), b = chay(GAM, BG, L('crouch()', 'go_right()', 'go_right()', 'go_right()')); return vt(a.robot) === '1,1' && maSK(a, 'dam-tuong').length === 2 && maSK(a, 'dam-tuong')[0].vat === 'gam-thap' && a.nhip === 6 && vt(b.robot) === '3,1' && !maSK(b, 'dam-tuong').length; })());
  kiem('đang đứng trong gầm mà stand(): đầu đụng trần (dau-dung-tran), chân VẪN co; bò ra khỏi gầm rồi stand() mới duỗi được',
    (() => { const a = chay(GAM, BG, L('crouch()', 'go_right()', 'go_right()', 'go_right()', 'stand()', 'wait()')), b = chay(GAM, BG, L('crouch()', 'go_right()', 'go_right()', 'stand()', 'wait()')), c = maSK(b, 'dau-dung-tran')[0]; return a.chan === 'dung' && !maSK(a, 'dau-dung-tran').length && b.chan === 'co' && !!c && vt(c.o) === '2,1' && c.lenh.ten === 'stand'; })());
  kiem('xuất phát trong gầm phải đang co (batDau.chan "co"), không thì lỗi cấu hình; batDau.chan chỉ cho nhện và chỉ "dung" / "co"',
    nem(() => chay(GAM, { x: 2, y: 1, huong: 0 }, '')) && !nem(() => chay(GAM, { x: 2, y: 1, huong: 0, chan: 'co' }, '')) && nem(() => chay(GAM, BG, '', { loaiRobot: 'banh', hamGoc: SanHoc.HAM_GOC.banh, batDau: { x: 0, y: 1, huong: 0, chan: 'co' } })) && nem(() => chay(GAM, { x: 0, y: 1, huong: 0, chan: 'sai' }, '')));
  kiem('lyDoChan: gầm n chặn xe bánh, xích, omni ("gam-thap"); nhện và drone không bị chặn bởi lyDoChan (nhện xét theo chân trong chay()); hố u không chặn ai',
    (() => { const s = SanHoc.docSan(['.n.u']); return ['banh', 'xich', 'omni'].every((l) => SanHoc.lyDoChan(s, l, 1, 0) === 'gam-thap') && ['nhen', 'drone'].every((l) => SanHoc.lyDoChan(s, l, 1, 0) === null) && ['banh', 'nhen', 'xich', 'omni', 'drone'].every((l) => SanHoc.lyDoChan(s, l, 3, 0) === null) && s.gam.length === 1 && s.ho.length === 1 && vt(s.gam[0]) === '1,0' && vt(s.ho[0]) === '3,0'; })());
  kiem('băng chuyền đẩy nhện đang ĐỨNG vào gầm: bang-chan (vat gam-thap), nhện không vào; nhện đang CO thì bị đẩy vào',
    (() => { const rows = ['.>n.']; const a = chay(rows, { x: 1, y: 0, huong: 0 }, L('wait()', 'wait()')), b = chay(rows, { x: 1, y: 0, huong: 0, chan: 'co' }, L('wait()', 'wait()')); return vt(a.robot) === '1,0' && nhipVet(a)[1].suKien.some((s) => s.ma === 'bang-chan' && s.vat === 'gam-thap') && vt(b.robot) === '2,0'; })());

  // ---- hố
  const HO = ['#####', '..u.F', '#####'];
  kiem('hố u: bước vào là RƠI: roi-ho { nhip, o, lenh }, dungSom "roi-ho", nhện nằm ở ô hố, chương trình dừng ngay (lệnh sau không chạy), không thắng',
    (() => { const r = chay(HO, BG, L('go_right()', 'go_right()', 'go_right()', 'go_right()')), e = maSK(r, 'roi-ho')[0]; return !r.thang && r.dungSom === 'roi-ho' && vt(r.robot) === '2,1' && r.nhip === 4 && !!e && e.nhip === 4 && vt(e.o) === '2,1' && e.lenh.ten === 'go_right'; })());
  kiem('băng chuyền đẩy nhện xuống hố: cũng rơi; xuất phát trên hố hay bóng mờ trên hố là lỗi cấu hình; xe bánh cũng rơi hố, drone bay qua',
    (() => { const a = chay(['>u..'], { x: 0, y: 0, huong: 0 }, L('wait()', 'wait()')); const x = SanHoc.chay({ san: ['..u..'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'banh' }, L('left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()')); const d = SanHoc.chay({ san: ['..u..'], batDau: { x: 0, y: 0, huong: 0 }, loaiRobot: 'drone' }, L('go_right()', 'go_right()', 'go_right()'));
      return a.dungSom === 'roi-ho' && vt(a.robot) === '1,0' && x.dungSom === 'roi-ho' && d.dungSom === null && vt(d.robot) === '3,0' && nem(() => chay(HO, { x: 2, y: 1, huong: 0 }, '')) && nem(() => chay(HO, BG, '', { mucTieu: 'bong-mo', bongMo: { x: 2, y: 1, huong: 0 } })); })());
  kiem('vật không đặt lên ô gầm / hố (cfg.vat thêm vào bị bỏ); thả vật xuống gầm / hố bị chặn',
    (() => { const r = chay(['.nu.'], B0, '', { vat: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }] }); return r.vat.length === 1 && vt(r.vat[0]) === '3,0'; })());

  // ---- nhảy
  const NT = ['.u.F'];
  kiem('NHẢY: crouch(); wait(); stand(); go_right() bật qua hố (3 nhịp), đáp ô kế, chân duỗi; sự kiện nhay { tu, qua, den }; nhịp đầu của bước ghi chuan-bi nhay true',
    (() => { const r = chay(NT, B0, L('crouch()', 'wait()', 'stand()', 'go_right()')), n = nhipVet(r), e = maSK(r, 'nhay')[0] || n[2].suKien.find((s) => s.ma === 'nhay'); return vt(r.robot) === '2,0' && r.nhip === 3 && r.chan === 'dung' && !r.loi && !!e && vt(e.tu) === '0,0' && vt(e.qua) === '1,0' && vt(e.den) === '2,0' && n[1].suKien.some((s) => s.ma === 'chuan-bi' && s.nhay === true) && n[2].suKien.some((s) => s.ma === 'nhay'); })());
  kiem('nhảy cần chân đang CO: stand() lúc đang đứng + go_right() chỉ là bước thường (vào hố rơi); co chân bằng bước đi rồi stand + go: nhảy (crouch(); go_right(); stand(); go_right() = 4 nhịp qua ô giữa)',
    (() => { const a = chay(NT, B0, L('stand()', 'go_right()')), b = chay(['..u.F'], B0, L('crouch()', 'go_right()', 'stand()', 'go_right()')); return a.dungSom === 'roi-ho' && vt(a.robot) === '1,0' && b.nhip === 4 && vt(b.robot) === '3,0' && b.chan === 'dung' && !b.dungSom; })());
  kiem('nhảy qua được: ô sàn thường (2 ô trong 3 nhịp), bậc thang S, hàng rào =, vật nằm đất o, băng chuyền, hố u; đáp được: sàn, S, băng, cờ',
    (() => { const hang = (rows, vat) => chay(rows, B0, L('crouch()', 'wait()', 'stand()', 'go_right()')); return ['...', '.S.', '.=.', '.o.', '.>.', '.u.'].every((g) => vt(hang([g]).robot) === '2,0' && !hang([g]).loi); })());
  kiem('nhảy hụt: ô giữa là tường # / nút / mép sân, hay gầm n → nhay-hut (giua true) rơi lại ô cũ; ô đáp là tường, hàng rào, gầm, vật, mép sân → nhay-hut (giua false); vẫn tốn 2 nhịp, chân đã duỗi',
    ['.#.', '.n.', '..#', '..=', '..n', '..o', '..'].every((g) => {
      const r = chay([g], B0, L('crouch()', 'wait()', 'stand()', 'go_right()')), e = maSK(r, 'nhay-hut')[0];
      return !!e && vt(r.robot) === '0,0' && r.nhip === 3 && r.chan === 'dung' && e.giua === (g === '.#.' || g === '.n.') && vt(e.tu) === '0,0' && vt(e.den) === '2,0' && !r.dungSom;
    }));
  kiem('nhảy mà đáp xuống hố: rơi (roi-ho ở ô đáp); nhảy từ ô giáp hố mà ô đáp là hố thứ hai cũng rơi; nhảy hụt vật nằm đất không làm vật vỡ',
    (() => { const a = chay(['..u'], B0, L('crouch()', 'wait()', 'stand()', 'go_right()')); const b = chay(['.uu'], B0, L('crouch()', 'wait()', 'stand()', 'go_right()')); return a.dungSom === 'roi-ho' && vt(a.robot) === '2,0' && b.dungSom === 'roi-ho' && vt(b.robot) === '2,0'; })());
  kiem('nhảy theo 4 hướng: lên, xuống, trái, phải đều bật qua đúng MỘT ô giữa (cách xa 2 ô)',
    (() => { const g = ['.....', '.....', '.....', '.....', '.....']; const o = { x: 2, y: 2, huong: 0 }; return [['go_up', '2,0'], ['go_down', '2,4'], ['go_left', '0,2'], ['go_right', '4,2']].every(([l, kq]) => { const r = chay(g, o, L('crouch()', 'wait()', 'stand()', l + '()')); return vt(r.robot) === kq && r.nhip === 3; }); })());
  kiem('co chân giữ nguyên sau mỗi bước thường; nhảy xong chân duỗi nên muốn nhảy tiếp phải co lại (crouch + wait): hai cú nhảy liền = 6 nhịp',
    (() => { const r = chay(['.u.u.'], B0, L('crouch()', 'wait()', 'stand()', 'go_right()', 'crouch()', 'wait()', 'stand()', 'go_right()')); return vt(r.robot) === '4,0' && r.nhip === 6 && !r.dungSom; })());
  kiem('tay hạ thì chân vướng, cú nhảy cũng bị bỏ (tay-vuong): nhện đứng yên', (() => { const r = chay(['.u.'], B0, L('arm_down()', 'crouch()', 'wait()', 'stand()', 'go_right()'), { hamGoc: NC.concat(['arm_down', 'arm_up', 'grab', 'release']) }); return vt(r.robot) === '0,0' && maSK(r, 'tay-vuong').length === 1 && !r.dungSom; })());

  // ---- đấu dây ngược, bóng mờ có chân
  kiem('daoChieu ["chan"]: crouch() làm chân DUỖI, stand() làm chân CO (nhịp hay bước đầu); vết lệnh vẫn ghi tên lệnh người chơi gọi; nhảy bằng "stand(); wait(); crouch(); go_right()"',
    (() => { const a = chay(NT, B0, L('stand()', 'wait()', 'crouch()', 'go_right()'), { daoChieu: ['chan'] }), b = chay(NT, B0, L('crouch()', 'wait()', 'stand()', 'go_right()'), { daoChieu: ['chan'] }), c = chay(['...'], B0, L('stand()', 'wait()'), { daoChieu: ['chan'] }); return vt(a.robot) === '2,0' && a.chan === 'dung' && b.dungSom === 'roi-ho' && c.chan === 'co' && a.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten).join() === 'stand,wait,crouch,go_right'; })());
  kiem('daoChieu "chan" chỉ cho nhện (xe bánh / drone: lỗi); nhện vẫn không dùng "trai" / "phai"; ghép được ["chan"] một mình',
    nem(() => SanHoc.chay({ san: ['...'], batDau: B0, loaiRobot: 'banh', daoChieu: ['chan'] }, '')) && nem(() => SanHoc.chay({ san: ['...'], batDau: B0, loaiRobot: 'drone', daoChieu: ['chan'] }, '')) && nem(() => chay(['...'], B0, '', { daoChieu: ['trai'] })) && !nem(() => chay(['...'], B0, '', { daoChieu: ['chan'] })));
  kiem('bóng mờ có chân (bongMo.chan): thắng chỉ khi nhện đúng ô VÀ chân đúng tư thế; không khai chan thì không xét; chan sai kiểu / dùng cho xe bánh là lỗi cấu hình',
    (() => { const bm = (chan) => Object.assign({ x: 4, y: 1, huong: 0 }, chan === undefined ? {} : { chan }); const ex = (chan) => ({ mucTieu: 'bong-mo', bongMo: bm(chan) }); const ch = (code, chan) => chay(GAM, BG, code, ex(chan));
      const dung = ['crouch()', 'go_right()', 'go_right()', 'go_right()', 'go_right()', 'stand()', 'wait()'].join('\n'), co = ['crouch()', 'go_right()', 'go_right()', 'go_right()', 'go_right()'].join('\n');
      return ch(dung, 'dung').thang && !ch(co, 'dung').thang && ch(co, 'co').thang && !ch(dung, 'co').thang && ch(co).thang && ch(dung).thang && nem(() => ch(dung, 'sai')) && nem(() => SanHoc.chay({ san: ['.....'], batDau: B0, loaiRobot: 'banh', mucTieu: 'bong-mo', bongMo: { x: 2, y: 0, huong: 0, chan: 'dung' } }, '')); })());
  kiem('kết quả chạy: res.chan (tư thế chân cuối) chỉ có ở nhện; vết nhịp có robot.chan; xe bánh không có', chay(['...'], B0, 'crouch()\nwait()').chan === 'co' && SanHoc.chay({ san: ['...'], batDau: B0, loaiRobot: 'banh' }, '').chan === undefined && nhipVet(SanHoc.chay({ san: ['...'], batDau: B0, loaiRobot: 'banh' }, 'wait()'))[0].robot.chan === undefined);
  kiem('hamGoc có crouch / stand ở xe bánh, xích, omni, drone: lỗi cấu hình ("không thuộc loại robot"); phần cứng mặc định của nhện có crouch / stand dù khay chưa mở',
    ['banh', 'xich', 'omni', 'drone'].every((l) => nem(() => SanHoc.chay({ san: ['...'], batDau: B0, loaiRobot: l, hamGoc: ['wait', 'crouch'] }, ''))) && SanHoc.phanCungMacDinh('nhen', ['go_up']).includes('crouch') && SanHoc.phanCungMacDinh('nhen', ['go_up']).includes('stand'));
  kiem('khay chưa mở lệnh chân: chương trình chính gọi crouch() là lỗi lenh-chua-mo (lệnh thuộc phần cứng mà chưa có trên khay), hàm của em thì gọi được',
    (() => { const code = 'crouch()\nwait()\n'; const r = SanHoc.chay({ san: ['...'], batDau: B0, loaiRobot: 'nhen', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait'], phanCung: SanHoc.phanCungMacDinh('nhen', []), nguonDong: () => 'chinh' }, code); const r2 = SanHoc.chay({ san: ['...'], batDau: B0, loaiRobot: 'nhen', hamGoc: ['go_up', 'wait'], phanCung: SanHoc.phanCungMacDinh('nhen', []), nguonDong: () => 'hamEm' }, code); return r.loi && r.loi.ma === 'lenh-chua-mo' && r.loi.ten === 'crouch' && !r2.loi && r2.chan === 'co'; })());
}
function nem(f) { try { f(); return false; } catch (e) { return true; } }

/* ====================================================== 6. BỘ DÒ ĐƯỜNG TẮT CHO NHỆN (do-duong-nhen.mjs) */
console.log('\n== 6. Bộ dò đường tắt cho nhện (BFS theo nhịp, có co / duỗi / nhảy / hố / gầm) và so chéo với san-hoc.js ==');
{
  const NC = SanHoc.HAM_GOC.nhen;
  const bfs = (san, bd, ex) => nhipNhenNganNhat(Object.assign({ loaiRobot: 'nhen', san, batDau: bd, hamGoc: NC }, ex || {}));
  const B0 = { x: 0, y: 0, huong: 0 };
  kiem('đường thẳng 3 ô: nhảy qua ô sàn thường nhanh hơn đi bộ (co chân bằng bước đầu rồi nhảy 2 ô = 4 nhịp, đi bộ 6) nên BFS ngắn hơn khi có lệnh chân; khay không có crouch / stand thì 6', bfs(['....F'], { x: 1, y: 0, huong: 0 }).nhip === 4 && bfs(['....F'], { x: 1, y: 0, huong: 0 }, { hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait'] }).nhip === 6);
  kiem('hố một ô chắn lối: BFS tìm đúng cú nhảy (crouch + bước + stand + bước nhảy + bước = 6); bỏ lệnh stand khỏi phần cứng thì không tới được', bfs(['..u.F'], B0).nhip === 8 - 2 && bfs(['..u.F'], B0, { phanCung: NC.filter((t) => t !== 'stand'), hamGoc: NC.filter((t) => t !== 'stand') }).nhip === null);
  kiem('hố hai ô liền nhau: không nhảy qua được → null', bfs(['.uu.F'], B0).nhip === null);
  kiem('gầm chắn lối: BFS cho co chân đi qua (crouch + 4 bước, không cần duỗi lại vì mục tiêu tới cờ); phần cứng thiếu crouch thì null', bfs(['.n.F'], B0).nhip === 6 && bfs(['.n.F'], B0, { phanCung: NC.filter((t) => t !== 'crouch'), hamGoc: NC.filter((t) => t !== 'crouch') }).nhip === null);
  kiem('bóng mờ có chân: sau gầm phải duỗi lại thêm 1 nhịp (stand + wait); với chan "co" thì không cần', bfs(['#####', '..n..', '#####'], { x: 0, y: 1, huong: 0 }, { mucTieu: 'bong-mo', bongMo: { x: 4, y: 1, huong: 0, chan: 'dung' } }).nhip === 9 && bfs(['#####', '..n..', '#####'], { x: 0, y: 1, huong: 0 }, { mucTieu: 'bong-mo', bongMo: { x: 4, y: 1, huong: 0, chan: 'co' } }).nhip === 8);
  kiem('daoChieu ["chan"]: BFS tính theo chân THẬT (nhảy vẫn 3 nhịp); chuoiThanhMa đổi lại tên lệnh (stand = co): chạy lại trong san-hoc.js đúng số nhịp',
    (() => { const man = { loaiRobot: 'nhen', san: ['#####', '.u.u.', '#####'], batDau: { x: 0, y: 1, huong: 0 }, hamGoc: NC, daoChieu: ['chan'], mucTieu: 'bong-mo', bongMo: { x: 4, y: 1, huong: 0, chan: 'dung' } }; const b = nhipNhenNganNhat(man), ctx = dungNguCanh(man); const r = SanHoc.chay({ san: man.san, batDau: man.batDau, loaiRobot: 'nhen', daoChieu: ['chan'], mucTieu: 'bong-mo', bongMo: man.bongMo }, chuoiThanhMa(b.chuoi, ctx)); return b.nhip === 6 && r.thang && r.nhip === 6; })());
  kiem('bậc thang, băng chuyền (xuôi nhanh hơn, ngược kẹt → null): như trước', bfs(['.S.F', '###.'], B0, { hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait'] }).nhip === 6 && bfs(['.<<<F'], B0, { hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait'] }).nhip === null);
  // so chéo: chương trình ngẫu nhiên (xorshift cố định), có chân, gầm, hố, rào, bậc thang, băng, vật, tay
  let seed = 987654321;
  const rnd = (n) => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed % n; };
  const KY = '.....##SS>><<^^vvnnu==';
  const HG = NC.concat(['arm_down', 'arm_up', 'grab', 'release']);
  let soCa = 0, lech = 0, ghiLech = '', soNhay = 0, soRoi = 0;
  for (let lan = 0; lan < 1200; lan++) {
    const rong = 4 + rnd(3), cao = 3 + rnd(4);
    const rows = [];
    for (let y = 0; y < cao; y++) { let s = ''; for (let x = 0; x < rong; x++) s += KY[rnd(KY.length)]; rows.push(s); }
    const dat1 = (ch, n) => { for (let i = 0; i < n; i++) { const x = rnd(rong), y = rnd(cao); if (rows[y][x] === '.') rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1); } };
    dat1('o', 2); dat1('D', 2);
    let bd = null;
    for (let i = 0; i < 50 && !bd; i++) { const x = rnd(rong), y = rnd(cao); if ('.S><^v='.indexOf(rows[y][x]) >= 0 && rows[y][x] !== '=') bd = { x, y, huong: rnd(4) }; }
    if (!bd) continue;
    const dao = rnd(6) === 0 ? ['chan'] : undefined;
    if (rnd(5) === 0) bd.chan = 'co';
    const man = { loaiRobot: 'nhen', san: rows, batDau: bd, hamGoc: HG, mucTieu: 'dua-vat', daoChieu: dao };
    const ctx = dungNguCanh(man), HD = hanhDongTuDo(ctx);
    const chuoi = [];
    for (let i = 0; i < 12; i++) chuoi.push(HD[rnd(HD.length)]);
    const code = chuoiThanhMa(chuoi, ctx);
    let S = trangThaiDau(ctx), nhip = 0, roi = false;
    for (const a of chuoi) {
      let N = buocMotNhip(ctx, S, a); nhip++;
      if (!N) { roi = true; break; }
      S = N;
      if (S.p >= 0) { N = buocMotNhip(ctx, S, null); nhip++; if (!N) { roi = true; break; } S = N; }
    }
    const kq = SanHoc.chay({ san: rows, batDau: bd, loaiRobot: 'nhen', hamGoc: HG, mucTieu: 'toi-co', daoChieu: dao }, code);   // 'toi-co' không có cờ → không dừng sớm, trừ khi rơi hố
    soCa++;
    if (nhipVet(kq).some((n) => n.suKien.some((e) => e.ma === 'nhay'))) soNhay++;
    if (roi) soRoi++;
    const vatBfs = S.pos.map((p) => (p === -2 ? 'vo' : p === -1 ? 'cam' : (p % ctx.rong) + ',' + Math.floor(p / ctx.rong)));
    const vatSan = kq.vat.map((v) => (v.trangThai === 'vo' ? 'vo' : v.trangThai === 'cam' ? 'cam' : v.x + ',' + v.y));
    const tayBfs = S.t === 1 ? 'duoi' : 'tren';
    const ok = roi ? (kq.dungSom === 'roi-ho' && kq.nhip === nhip) : (kq.robot.x === S.x && kq.robot.y === S.y && kq.nhip === nhip && kq.tay.tuThe === tayBfs && kq.chan === (S.ch ? 'co' : 'dung') && J(vatBfs) === J(vatSan) && !kq.dungSom);
    if (!ok) { lech++; if (!ghiLech) ghiLech = J({ rows, bd, dao, code, bfs: [S.x, S.y, nhip, tayBfs, S.ch, vatBfs, roi], san: [kq.robot.x, kq.robot.y, kq.nhip, kq.tay.tuThe, kq.chan, vatSan, kq.dungSom] }); }
  }
  kiem('so chéo ' + soCa + ' chương trình ngẫu nhiên (tường, bậc thang, băng 4 chiều, gầm, hố, hàng rào, vật, tay, chân co / duỗi, đấu dây ngược, xuất phát đang co): BFS và san-hoc.js trùng vị trí, nhịp, tay, chân, vật, và rơi hố (' + soNhay + ' có cú nhảy, ' + soRoi + ' rơi hố)',
    soCa >= 1000 && lech === 0 && soNhay >= 50 && soRoi >= 50, lech + ' lệch · ' + ghiLech);
}

/* ====================================================== 7. DỮ LIỆU 10 MÀN */
console.log('\n== 7. Dữ liệu 10 màn: khay, bóng mờ nhen.2, go / walk, hố / gầm / hàng rào, đường tắt, canHam ==');
{
  const NHEN_CHAN = ['go_up', 'go_down', 'go_left', 'go_right', 'crouch', 'stand', 'wait'];
  kiem('đúng 10 màn, số 1..10, id 14.1…14.10 (chương thứ 14, sau tham-so, trước che-nhen), mã nhen.1…, tên "Thân nhện"',
    ds.length === 10 && ds.every((m, i) => m.so === i + 1 && m.id === '14.' + (i + 1) && m.ma === 'nhen.' + (i + 1)) && ThuTu.thuTu[13] === 'nhen' && ThuTu.thuTu[12] === 'tham-so' && ThuTu.thuTu[14] === 'che-nhen' && ThuTu.ten.nhen === 'Thân nhện');
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ nhen.10 có huy hiệu nhen',
    J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && ds.filter((m) => m.huyHieu).length === 1 && ds[9].huyHieu.ma === 'nhen' && ds[9].huyHieu.ten === 'Huy hiệu Thân nhện');
  kiem('mọi màn: loaiRobot nhen, robot { than: "nhen", tay: null }, cauTruc ["for","if"], Xưởng mở, dùng hàm của em, chương trình 10 ô + mỗi hàm 10 ô',
    ds.every((m) => m.loaiRobot === 'nhen' && m.robot && m.robot.than === 'nhen' && m.robot.tay === null && J(m.cauTruc) === '["for","if"]' && m.moXuong === true && m.camHamCuaEm === false && m.khung.chinh === 10 && m.khung.moiHam === 10));
  kiem('khay: nhen.1 chỉ 4 go_* + wait (chưa có chân); nhen.2–10 thêm crouch, stand; không có lệnh tay; phần cứng = khay (không màn hỏng)', ds.every((m) => J(m.hamGoc) === J(m.so === 1 ? ['go_up', 'go_down', 'go_left', 'go_right', 'wait'] : NHEN_CHAN) && m.phanCung === undefined && m.daoChieu === undefined));
  kiem('nhen.2 là bóng mờ có bongMo.chan "dung" (chương trình phải kết thúc với chân duỗi); các màn khác tới cờ; sân tối đa 7×9, mỗi màn tới cờ có đúng một F',
    ds.every((m) => (m.so === 2 ? m.mucTieu === 'bong-mo' && m.bongMo.chan === 'dung' && !/F/.test(m.san.join('')) : m.mucTieu === undefined && (m.san.join('').match(/F/g) || []).length === 1) && m.san.length <= 9 && m.san[0].length <= 7));
  kiem('địa hình mới đúng chỗ: gầm n ở nhen.2, 5, 6, 10; hố u ở nhen.3, 5, 9, 10; hàng rào = ở nhen.6; bậc thang và băng ở nhen.8; nhen.1, 4, 7 không có gầm / hố / rào',
    (() => { const co = (m, re) => re.test(m.san.join('')); const kq = (re) => ds.filter((m) => co(m, re)).map((m) => m.so).join(); return kq(/n/) === '2,5,6,10' && kq(/u/) === '3,5,9,10' && kq(/=/) === '6' && kq(/S/) === '8' && kq(/[<>^v]/) === '8'; })());
  kiem('hàm cốt truyện mới: nhen.4 tạo go, nhen.6 tạo walk; các màn khác không tạo (bring chuyển sang che-nhen)', ds.every((m) => J(m.taoHam) === J({ '14.4': ['go'], '14.6': ['walk'] }[m.id] || [])));
  kiem('go(d) có 8 ô (if / elif bốn nhánh), walk(path) 2 ô (for c in path: go(c)), tham số đúng',
    (() => { const g = man('14.4').loiGiai.hamCuaEmMoi[0], w = man('14.6').loiGiai.hamCuaEmMoi[0]; return g.ten === 'go' && J(g.thamSo) === '["d"]' && KhungCode.soOHam(g) === 8 && w.ten === 'walk' && J(w.thamSo) === '["path"]' && KhungCode.soOHam(w) === 2 && J(w.than) === J(['for c in path:', '    go(c)']); })());
  kiem('nhen.4: đề bài nói rõ quy ước chữ U lên, D xuống, L trái, R phải; lời giải dùng chữ HOA', (() => { const t = man('14.4').deBai; return /"U" lên/.test(t) && /"D" xuống/.test(t) && /"L" trái/.test(t) && /"R" phải/.test(t); })() && ds.every((m) => m.loiGiai.chinh.every((s) => !/for c in "[^"]*[a-z]/.test(s))));
  kiem('nhen.7: hàm của màn go_sai (khác tên go) cho sẵn bản sai; maMau KHÔNG thắng, lời giải thắng; dùng go() của em cũng thắng 3 sao',
    (() => { const m = man('14.7'); const r = ChamHoc.cham(m, { chinh: ['for c in "DDRRUURRDDDL":', '    go(c)'], hamCuaMan: [] }, khoTruoc('14.7')); return m.maMau.hamCuaMan.length === 1 && m.maMau.hamCuaMan[0].ten === 'go_sai' && !ChamHoc.cham(m, m.maMau, khoTruoc('14.7')).thang && chamGiai(m).thang && r.thang && r.sao === 3 && r.soO === m.sao.o; })());
  kiem('maMau của nhen.1, 2, 3, 6, 9 vừa khung và chưa thắng (nhen.4, 5, 7, 8, 10 cũng chưa thắng)', ds.every((m) => { const r = ChamHoc.cham(m, m.maMau, khoTruoc(m.id)); return !r.thang && !maCua(r).includes('tran-khung'); }));
  kiem('hamCuaEmCan đúng: nhen.5 [go], nhen.6 [go], nhen.10 [go, walk]; còn lại rỗng', ds.every((m) => J(m.hamCuaEmCan) === J({ '14.5': ['go'], '14.6': ['go'], '14.10': ['go', 'walk'] }[m.id] || [])));
  kiem('hamCuaEmCan khớp các hàm của em có sẵn mà lời giải gọi tới (trừ nhen.7, hàm của màn)', ds.filter((m) => m.id !== '14.7').every((m) => {
    const r = chamGiai(m); const dung = r.hamDaDung.filter((t) => !m.taoHam.includes(t) && r.chiTietO.ham.find((h) => h.ten === t).cot === 'hamEm');
    return J(m.hamCuaEmCan.slice().sort()) === J(dung.slice().sort());
  }));
  // đường tắt: BFS ngắn nhất ≤ nhịp lời giải; = ở màn không khai nhipTheoLoiGiai
  for (const m of ds) {
    const b = nhipNhenNganNhat(m), r = chamGiai(m), tk = m.nhipTheoLoiGiai === true;
    kiem(m.id + ' không có ĐƯỜNG TẮT: BFS ' + b.nhip + (tk ? ' ≤ ' : ' = ') + 'nhịp lời giải ' + r.soNhip + ' (sao.nhip ' + m.sao.nhip + ')',
      b.nhip !== null && !b.catNgang && r.soNhip === m.sao.nhip && (tk ? b.nhip <= m.sao.nhip : b.nhip === m.sao.nhip), J([b.nhip, r.soNhip, m.sao.nhip]));
  }
  kiem('nhipTheoLoiGiai ở nhen.4–10 (nhện nhảy được qua ô sàn nên đường ngắn nhất có thể ngắn hơn lời giải viết theo chuỗi chỉ đường), không ở nhen.1–3', ds.every((m) => (m.nhipTheoLoiGiai === true) === (m.so >= 4)));
  kiem('nhen.2 và nhen.3: ngoài lời giải còn BFS = nhịp lời giải (9 và 6): không có cách nhanh hơn', nhipNhenNganNhat(man('14.2')).nhip === 9 && nhipNhenNganNhat(man('14.3')).nhip === 6);
  // nhen.5: gầm rồi hố, cách duy nhất là chui rồi nhảy; nhen.3: không có đường vòng
  kiem('nhen.3 và nhen.5: bỏ khả năng nhảy (phần cứng thiếu stand) thì không tới được cờ — cú nhảy là bắt buộc', ['14.3', '14.5'].every((id) => { const m = man(id), pc = m.hamGoc.filter((t) => t !== 'stand'); return nhipNhenNganNhat(Object.assign({}, m, { phanCung: pc, hamGoc: pc })).nhip === null; }));
  kiem('nhen.2, nhen.5, nhen.6, nhen.10: bỏ khả năng co chân (thiếu crouch) thì không tới được: gầm là bắt buộc phải chui', ['14.2', '14.5', '14.6', '14.10'].every((id) => { const m = man(id), pc = m.hamGoc.filter((t) => t !== 'crouch'); return nhipNhenNganNhat(Object.assign({}, m, { phanCung: pc, hamGoc: pc })).nhip === null; }));
  kiem('nhen.6: hàng rào = chắn đường đi bộ (đổi rào thành sàn thì đường thẳng ngắn hơn); chỉ nhảy qua được', (() => { const m = man('14.6'); const sanBo = Object.assign({}, m, { san: m.san.map((r) => r.replace(/=/g, '#')) }); return nhipNhenNganNhat(sanBo).nhip === null && nhipNhenNganNhat(m).nhip !== null; })());
  // canHam: viết thẳng không dùng hàm / chuỗi thì tràn khung (tính từ vết lệnh của lời giải)
  const dongThang = (r) => {
    const l = r.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten);
    let n = 0, i = 0;
    while (i < l.length) { if (/^go_/.test(l[i])) { let j = i; while (j < l.length && l[j] === l[i]) j++; n += (j - i >= 2 ? 2 : 1); i = j; } else { n++; i++; } }
    return n;
  };
  const dongChuoi = (r) => {                                            // viết bằng for c in "…": go(c) (2 dòng mỗi đoạn bước liền nhau; đoạn một bước: go("…") 1 dòng)
    const l = r.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten);
    let n = 0, i = 0;
    while (i < l.length) { if (/^go_/.test(l[i])) { let j = i; while (j < l.length && /^go_/.test(l[j])) j++; n += (j - i >= 2 ? 2 : 1); i = j; } else { n++; i++; } }
    return n;
  };
  for (const m of ds.filter((x) => x.canHam)) {
    const r = chamGiai(m), th = dongThang(r), ch = dongChuoi(r);
    kiem(m.id + ' canHam ' + m.canHam + ': viết thẳng go_* (gộp đoạn thẳng bằng for) cần ' + th + ' dòng > 10' + (m.taoHam.includes('walk') || m.so === 10 ? '; viết bằng for c in "…": go(c) vẫn ' + ch + ' dòng > 10 nên phải dùng walk()' : ''),
      m.canHam === 'tran-khung' && th > m.khung.chinh && (!(m.taoHam.includes('walk') || m.so === 10) || ch > m.khung.chinh) && m.loiSai.some((l) => l.phaiCoMa.includes('tran-khung')), J([th, ch]));
  }
  kiem('khai triển lời giải ra từng lệnh gốc chạy ra cùng kết quả, cùng nhịp (hàm không đổi luật), mọi màn trừ nhen.7',
    ds.filter((x) => x.id !== '14.7').every((m) => {
      const r = chamGiai(m), raw = r.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten + '()').join('\n') + '\n';
      const k = SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: 'nhen', hamGoc: m.hamGoc, mucTieu: m.mucTieu || 'toi-co', bongMo: m.bongMo }, raw);
      return k.thang === r.thang && k.nhip === r.soNhip && J(k.robot) === J(r.theoSan[0].robot);
    }));
}

/* ====================================================== 8. CHẨN ĐOÁN CHO NHỆN + SÂN THỬ XƯỞNG */
console.log('\n== 8. Chẩn đoán cho nhện (chân, gầm, hố, nhảy) và sân thử của Xưởng hàm ==');
{
  const m2 = man('14.2'), k2 = khoTruoc('14.2'), m3 = man('14.3'), k3 = khoTruoc('14.3'), m5 = man('14.5'), kho5 = khoTruoc('14.5');
  const loi = (r, ma) => (r.chanDoan.find((c) => c.ma === ma) || {}).loi || '';
  const r1 = ChamHoc.cham(m3, { chinh: ['go_right()', 'go_right()'] }, k3);
  kiem('rơi hố: roi-ho (lỗi) nói nhịp, ô hố, lệnh gây ra, chương trình dừng và cách qua hố (co chân, duỗi chân cùng bước); có cho (dòng lệnh) và chua-toi-co',
    maCua(r1).includes('roi-ho') && /rơi xuống hố ở ô \(2, 1\)/.test(loi(r1, 'roi-ho')) && /go_right\(\)/.test(loi(r1, 'roi-ho')) && /dừng ở đó/.test(loi(r1, 'roi-ho')) && /crouch\(\)/.test(loi(r1, 'roi-ho')) && /stand\(\)/.test(loi(r1, 'roi-ho')) && r1.chanDoan.find((c) => c.ma === 'roi-ho').cho && maCua(r1).includes('chua-toi-co'), loiTV(r1));
  const r2 = ChamHoc.cham(m2, { chinh: ['go_right()', 'go_right()'] }, k2);
  kiem('đâm gầm: dam-tuong nói đó là gầm thấp, chân đang duỗi nên đụng đầu, nhắc crouch() trước và stand() sau; không nhắc "kiểm tra lại hướng"',
    maCua(r2).includes('dam-tuong') && /gầm thấp/.test(loi(r2, 'dam-tuong')) && /chân đang duỗi/.test(loi(r2, 'dam-tuong')) && /crouch\(\)/.test(loi(r2, 'dam-tuong')) && !/hướng/.test(loi(r2, 'dam-tuong')), loiTV(r2));
  const r3 = ChamHoc.cham(m2, { chinh: ['crouch()', 'for i in range(4):', '    go_right()'] }, k2);
  kiem('chui qua rồi quên duỗi chân: lech-bong-mo nói "Nhện" và chân đang co còn bóng mờ chân duỗi (không nói "Xe")', maCua(r3).join() === 'lech-bong-mo' && /Nhện/.test(loi(r3, 'lech-bong-mo')) && /Chân nhện đang co/.test(loi(r3, 'lech-bong-mo')) && /duỗi/.test(loi(r3, 'lech-bong-mo')) && !/\bXe\b/.test(loi(r3, 'lech-bong-mo')), loiTV(r3));
  const r4 = ChamHoc.cham(m2, { chinh: ['crouch()', 'for i in range(4):', '    go_right()', 'stand()'] }, k2);
  kiem('quen-wait của nhện với lệnh chân: nói "lệnh chân" (không phải lệnh tay), cần wait() hoặc bước go_*() đi sau', (() => { const l = loi(r4, 'quen-wait'); return maCua(r4).includes('quen-wait') && /lệnh chân/.test(l) && !/lệnh tay/.test(l) && /wait\(\) hay bước go_/.test(l); })(), loiTV(r4));
  const r5 = ChamHoc.cham(m3, { chinh: ['go_right()', 'crouch()', 'stand()', 'go_right()'] }, k3);
  kiem('chan-goi-lai: nói chân đã nhận lệnh crouch() rồi nên stand() bị bỏ, mỗi nhịp một lệnh chân', maCua(r5).includes('chan-goi-lai') && /crouch\(\)/.test(loi(r5, 'chan-goi-lai')) && /stand\(\)/.test(loi(r5, 'chan-goi-lai')) && /một lệnh/.test(loi(r5, 'chan-goi-lai')), loiTV(r5));
  const r6 = ChamHoc.cham(m2, { chinh: ['crouch()', 'for i in range(3):', '    go_right()', 'stand()', 'go_right()'] }, k2);
  kiem('nhảy hụt: nhay-hut nói nhện bật lên định nhảy qua ô nào xuống ô nào, ô đáp là ngoài sân, rơi lại ô cũ', maCua(r6).includes('nhay-hut') && /định nhảy từ ô \(3, 1\) qua ô \(4, 1\) xuống ô \(5, 1\)/.test(loi(r6, 'nhay-hut')) && /ngoài sân/.test(loi(r6, 'nhay-hut')) && /ô cũ/.test(loi(r6, 'nhay-hut')), loiTV(r6));
  const r7 = ChamHoc.cham(m2, { chinh: ['crouch()', 'go_right()', 'go_right()', 'stand()', 'wait()', 'go_right()', 'go_right()'] }, k2);
  kiem('stand() trong gầm: dau-dung-tran nói nhện đang ở trong gầm, đầu đụng trần, chân vẫn co', maCua(r7).includes('dau-dung-tran') && /gầm thấp/.test(loi(r7, 'dau-dung-tran')) && /đụng trần/.test(loi(r7, 'dau-dung-tran')) && /vẫn co/.test(loi(r7, 'dau-dung-tran')), loiTV(r7));
  const thang = chamGiai(m2);
  kiem('lời giải nhen.2 thắng, không chẩn đoán nào; kết quả có bongMo.chan "dung" và robot.chan trong vết', thang.thang && thang.chanDoan.length === 0 && thang.bongMo.chan === 'dung' && nhipVet(thang).pop().robot.chan === 'dung');
  const thuong = ChamHoc.cham(m5, { chinh: ['for c in "urrdrrddldld":', '    go(c)'] }, kho5);
  kiem('chuỗi chữ thường: nhen-khong-buoc và chua-toi-co; lời nhắc phân biệt chữ hoa / thường', maCua(thuong).includes('nhen-khong-buoc') && maCua(thuong).includes('chua-toi-co') && /hoa và chữ thường/.test(loi(thuong, 'nhen-khong-buoc')));
  const daBuoc = ChamHoc.cham(m5, { chinh: ['for c in "UR":', '    go(c)'] }, kho5);
  kiem('đã bước nhưng chưa tới cờ: chua-toi-co, KHÔNG có nhen-khong-buoc; lời không nhắc "quay mặt hướng"', maCua(daBuoc).includes('chua-toi-co') && !maCua(daBuoc).includes('nhen-khong-buoc') && !/quay mặt/.test(daBuoc.chanDoan[0].loi));
  const m1 = man('14.1'), dt = ChamHoc.cham(m1, { chinh: ['go_down()'] }, []);
  kiem('đâm tường của nhện: lời nhắc nói về lệnh go_* (nhện không quay), không nói quay mặt', maCua(dt).includes('dam-tuong') && /go_\*/.test(loi(dt, 'dam-tuong')) && !/quay mặt/.test(loi(dt, 'dam-tuong')));
  // sân thử của Xưởng hàm với nhện
  const thu1 = ChamHoc.thuHam(m5, { chinh: [] }, 'go', tron(kho5, []), { doiSo: ['"R"'] });
  kiem('Xưởng hàm: thử go("R") trên sân thử 5×5 mặc định: nhện từ (2,2) sang (3,2) trong 2 nhịp', vt(thu1.robot) === '3,2' && thu1.soNhip === 2 && thu1.chanDoan.length === 0, J([thu1.robot, thu1.soNhip, thu1.chanDoan.map((c) => c.ma)]));
  const wk = tron(khoTruoc('14.10'), []);
  const thu2 = ChamHoc.thuHam(man('14.10'), { chinh: [] }, 'walk', wk, { doiSo: ['"RRD"'] });
  kiem('Xưởng hàm: thử walk("RRD"): 3 bước = 6 nhịp, tới (4,3)', vt(thu2.robot) === '4,3' && thu2.soNhip === 6, J([thu2.robot, thu2.soNhip]));
  const thu4 = ChamHoc.thuHam(m5, { chinh: [] }, 'go', tron(kho5, [H('go', ['if d == "U":', '    go_up()'], ['d'])]), { doiSo: ['"D"'] });
  kiem('Xưởng hàm: thử go("D") với bản go() thiếu nhánh: nhện đứng im, 0 nhịp, không báo lỗi', vt(thu4.robot) === '2,2' && thu4.soNhip === 0, J([thu4.robot, thu4.soNhip]));
  const thu5 = ChamHoc.thuHam(m2, { chinh: [] }, 'chan2', tron(k2, [H('chan2', ['crouch()', 'go_right()', 'stand()', 'wait()'])]), { doiSo: [] });
  kiem('Xưởng hàm: thử một hàm có crouch() / stand() trên sân thử: chân co rồi duỗi, kết quả res.chan có', vt(thu5.robot) === '3,2' && thu5.soNhip === 3 && thu5.chanDoan.length === 0, J([thu5.robot, thu5.soNhip, thu5.chanDoan.map((c) => c.ma)]));
}
function loiTV(r) { return r.chanDoan.map((c) => c.ma + ': ' + c.loi).join(' | '); }

/* ====================================================== 9. BẢNG 10 MÀN */
console.log('\n== 9. Bảng 10 màn chương Thân nhện ==');
{
  console.log('  màn  | sân | ô  | nhịp | BFS | hàng     | tạo hàm | lời giải');
  for (const m of ds) {
    const r = chamGiai(m), b = nhipNhenNganNhat(m);
    console.log('  ' + m.id.padEnd(4) + ' | ' + (m.san[0].length + '×' + m.san.length).padEnd(3) + ' | ' + String(r.soO).padEnd(2) + ' | ' + String(r.soNhip).padEnd(4) + ' | ' + String(b.nhip).padEnd(3) + ' | ' + m.hang.padEnd(8) + ' | ' + (m.taoHam.join(', ') || '-').padEnd(7) + ' | ' + m.loiGiai.chinh.map((s) => s.trim()).join(' ; ').slice(0, 90));
  }
  for (const m of ds) {
    console.log('\n  ' + m.id + ' ' + m.ten + ' [' + m.hang + (m.mucTieu === 'bong-mo' ? ', bóng mờ' : '') + '] ' + m.san[0].length + '×' + m.san.length + ' · nhện (' + m.batDau.x + ', ' + m.batDau.y + ')');
    for (const g of m.san) console.log('    ' + g);
  }
  kiem('bảng đã in', true);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

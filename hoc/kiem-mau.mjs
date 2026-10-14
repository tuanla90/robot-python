/* ============================================================================
   kiem-mau.mjs — máy kiểm chương `mau` (Cảm biến màu) của "Đường học".
   Gồm: color() ở mọi màu và mọi loại ô (ký hiệu r g b y, lớp màu riêng, cộng hai cách, xung đột, ô tường), ô màu đi lại như sàn thường,
   đọc màu không tốn nhịp và ghi sự kiện doc-cam-bien (cam 'mau'), color() phụ thuộc phần cứng (14/10): cảm biến BỤNG luôn đọc màu sàn dưới xe (cả lúc cầm / dính / nạp rổ),
   CAMERA đọc ô trước mặt (vật nằm đó → màu vật, không thì màu sàn; tường, rào, thùng, cửa đóng, nút, mép sân → "none"; bốn hướng; nhện mặt cố định), ghép cả hai hay camera trên drone → lỗi,
   robot không gắn cảm biến màu (chua-gan-cam-bien), chuỗi trả về dùng trong biểu thức, chống vòng lặp vô hạn, đích có màu (đúng / sai màu, dat-sai-mau, vật không màu),
   chẩn đoán so chuỗi sai (ten-mau-sai) và quên nháy (mau-thieu-nhay), chấm NHIỀU SÂN có lớp màu, sân thử của Xưởng có ô màu, bộ dò đường tắt
   có màu, dữ liệu 10 màn và bảng 10 màn.
   Các kiểm chung cho cả 120 màn (đi tuần tự, sao, lời sai, đường tắt BFS trên từng sân…) nằm ở kiem-hoc.mjs.
   Chạy: node robotics/hoc/kiem-mau.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
for (const f of ['man-chuoi-2', 'man-tay-gap', 'man-vong-lap', 'man-bang-chuyen', 'man-tham-so', 'man-nhen', 'man-xich', 'man-omni', 'man-tam-day', 'man-khoang-cach']) require(path.join(day, f + '.js'));
const ManHoc = require(path.join(day, 'man-mau.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
const { nhipDuaVatNganNhat } = await import('./do-duong-tay.mjs');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const maSK = (kq, ma) => kq.suKien.filter((e) => e.ma === ma);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
const L = (...d) => d.join('\n') + '\n';
const loi = (f) => { try { f(); return null; } catch (e) { return e.message; } };

const ds = ManHoc.danhSach.filter((m) => m.chuong === 'mau');
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
const man = (so) => ManHoc.timMa('mau.' + so);
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const bdCua = (m) => (Array.isArray(m.batDau) ? m.batDau : sanCua(m).map(() => m.batDau));

const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const TAY = ['arm_down', 'arm_up', 'grab', 'release'];
const MAU = ['color'];
const VEC = SanHoc.VEC;
function chay(rows, bd, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: BANH.concat(TAY, MAU, ['front_clear']) }, extra || {}), code);
}
/** Các lần đọc cảm biến trong vết, theo thứ tự. */
const doc = (kq) => kq.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
const TIEN = L('left_move()', 'right_move()', 'wait()');

/* ================================================================== 1. LUẬT MÀU */
console.log('\n== 1. color() ở mọi màu: ký hiệu, lớp màu, hướng mặt ==');
{
  const TEN = { r: 'red', g: 'green', b: 'blue', y: 'yellow' };
  let tong = 0, dung = 0, sai = [];
  for (const ky of ['r', 'g', 'b', 'y']) for (const h of [0, 1, 2, 3]) {
    const rows = ['.....', '.....', '..' + ky + '..', '.....', '.....'];
    const kq = chay(rows, { x: 2, y: 2, huong: h }, 'x = color()\nleft_move()\nright_move()\nwait()\ny = color()');
    const e = doc(kq);
    tong++;
    if (e.length === 2 && e[0].mau === TEN[ky] && e[0].tu.x === 2 && e[0].tu.y === 2 && e[0].nguon === 'san' && e[0].cam === 'mau' && e[0].ham === 'color' && e[0].idVat === null && e[1].mau === 'none') dung++;
    else sai.push(ky + '/h' + h + ':' + J(e));
  }
  kiem('4 màu (ký hiệu r g b y) × 4 hướng mặt = ' + tong + ' lần đọc: ô dưới xe đúng tên màu, ô kế (không màu) là "none"', dung === tong, sai.slice(0, 2).join(' | '));
  const k0 = chay(['...', '...'], { x: 1, y: 0, huong: 0 }, 'a = color()');
  kiem('ô sàn thường: "none"', doc(k0)[0].mau === 'none');
  // lớp màu riêng
  const r1 = chay(['..F', '...', '...'], { x: 0, y: 2, huong: 0 }, 'a = color()', { mau: ['..r', '...', 'g..'] });
  kiem('lớp màu riêng (cfg.mau): ô (0,2) xanh lá', doc(r1)[0].mau === 'green' && J(r1.mauO) === J([[null, null, 'red'], [null, null, null], ['green', null, null]]), J(r1.mauO));
  // cờ có màu (F + lớp)
  const r2 = chay(['..F', '...', '...'], { x: 0, y: 0, huong: 1 }, TIEN + TIEN, { mau: ['..b', '...', '...'] });
  kiem('cờ có màu xanh dương (F + lớp màu): xe tới cờ vẫn thắng, color() trên cờ là "blue"', r2.thang && r2.robot.x === 2 && r2.mauO[0][2] === 'blue');
  // cộng ký hiệu + lớp
  const r3 = chay(['r.F', '...', '...'], { x: 0, y: 2, huong: 0 }, 'a = color()', { mau: ['.g.', '...', '...'] });
  kiem('ký hiệu r và lớp màu cộng lại: (0,0) đỏ, (1,0) xanh lá', r3.mauO[0][0] === 'red' && r3.mauO[0][1] === 'green' && r3.mauO[1][0] === null);
  kiem('cùng màu hai nơi: được (không xung đột)', loi(() => chay(['r.F', '...', '...'], { x: 0, y: 2, huong: 0 }, 'a = 1', { mau: ['r..', '...', '...'] })) === null);
  kiem('hai màu khác nhau trên một ô (ký hiệu r, lớp g): lỗi cấu hình', /hai màu khác nhau/.test(loi(() => chay(['r.F', '...', '...'], { x: 0, y: 2, huong: 0 }, 'a = 1', { mau: ['g..', '...', '...'] })) || ''));
  kiem('màu trên ô tường: lỗi cấu hình', /không có màu/.test(loi(() => chay(['#.F', '...', '...'], { x: 1, y: 2, huong: 0 }, 'a = 1', { mau: ['r..', '...', '...'] })) || ''));
  kiem('ký hiệu lạ trong lớp màu (x): lỗi; lớp sai cỡ: lỗi', /Ký hiệu lạ trong lớp/.test(loi(() => chay(['..F', '...', '...'], { x: 0, y: 2, huong: 0 }, 'a = 1', { mau: ['x..', '...', '...'] })) || '') &&
    /cùng cỡ/.test(loi(() => chay(['..F', '...', '...'], { x: 0, y: 2, huong: 0 }, 'a = 1', { mau: ['r.', '...', '...'] })) || ''));
  kiem('lớp màu vật đặt ở ô không có vật: lỗi cấu hình', /không có vật/.test(loi(() => chay(['..F', '...', '...'], { x: 0, y: 2, huong: 0 }, 'a = 1', { vatMau: ['r..', '...', '...'] })) || ''));
  kiem('sân không màu: mauO null và không có trường mau trong vật / đích (các sân cũ giữ nguyên dạng)', (() => {
    const k = chay(['..F', 'o.D', '...'], { x: 0, y: 2, huong: 0 }, 'a = 1', {});
    return k.mauO === null && !('mau' in k.vat[0]) && !('mau' in k.dich[0]);
  })());
  // ô màu đi lại như sàn
  const di = chay(['#####', '#r.b#', '#.#.#', '#y.g#', '#####'], { x: 1, y: 3, huong: 0 }, L('front_clear()', 'left_move()', 'right_move()', 'wait()', 'front_clear()'));
  kiem('ô màu đi lại như sàn thường: front_clear() đúng, xe đi lên ô đỏ, không dam-tuong', doc(di)[0].trong === true && di.robot.x === 1 && di.robot.y === 2 && maSK(di, 'dam-tuong').length === 0);
  kiem('lyDoChan: r g b y đều null cho mọi loại robot (kể cả bánh và omni)', ['r', 'g', 'b', 'y'].every((ky) => ['banh', 'nhen', 'xich', 'omni'].every((loai) => SanHoc.lyDoChan(SanHoc.docSan(['...', '.' + ky + '.', '...']), loai, 1, 1) === null)));
  // màu trên ô băng chuyền (lớp màu), băng vẫn đẩy
  const bang = chay(['.>.', '...', '...'], { x: 1, y: 0, huong: 1 }, L('a = color()', 'wait()', 'wait()', 'b = color()'), { mau: ['.r.', '...', '...'] });
  const db = doc(bang);
  kiem('ô băng chuyền có thể có màu (lớp màu), băng vẫn đẩy: xe đứng trên ô đỏ (1,0) 2 nhịp rồi bị đẩy sang (2,0), lần đọc sau là "none"', bang.robot.x === 2 && db.length === 2 && db[0].mau === 'red' && db[1].mau === 'none', J([bang.robot, db.map((e) => e.mau)]));
  // ô vật / đích có màu
  const od = SanHoc.docSan(['oD.', 'X..'], ['.r.', 'g..'], ['b..', 'r..']);
  kiem('docSan: vật có mau theo lớp vatMau, đích có mau theo lớp màu (đích X và D)', od.vat.length === 2 && od.vat[0].mau === 'blue' && od.vat[1].mau === 'red' && od.dich.length === 2 && od.dich[0].mau === 'red' && od.dich[1].mau === 'green', J([od.vat, od.dich]));
}

console.log('\n== 2. Đọc màu không tốn nhịp; sự kiện doc-cam-bien (cam "mau"); trả về chuỗi ==');
{
  const rows = ['###', '#F#', '#r#', '#g#', '#.#'];
  const bd = { x: 1, y: 4, huong: 0 };
  const r = chay(rows, bd, L(...Array(50).fill('color()')));
  kiem('50 lần đọc không tốn nhịp (nhịp 0), xe đứng yên, soLanDoc 50, không quen-wait', r.nhip === 0 && r.robot.y === 4 && r.soLanDoc === 50 && doc(r).length === 50 && nhipVet(r).length === 0 && maSK(r, 'quen-wait').length === 0 && r.lenhTon.length === 0);
  kiem('lần đọc cuối sau nhịp chót nằm trong docConLai (tối đa 50 sự kiện)', r.docConLai.length === 50 && r.docConLai.every((e) => e.ma === 'doc-cam-bien' && e.cam === 'mau'));
  const m = chay(rows, bd, L('while color() != "red":', '    left_move()', '    right_move()', '    wait()'));
  kiem('while color() != "red": tiến — xe dừng ở ô đỏ (y=2), 2 nhịp, đọc 3 lần', m.robot.y === 2 && m.nhip === 2 && m.soLanDoc === 3, J([m.robot, m.nhip, m.soLanDoc]));
  const nv = nhipVet(m);
  kiem('sự kiện doc-cam-bien gắn vào nhịp KẾ TIẾP, đứng trước sự kiện của nhịp; có mau, nguon, tu, o', nv[0].suKien[0].ma === 'doc-cam-bien' && nv[0].suKien[0].mau === 'none' && nv[0].suKien[1].ma === 'tien' && nv[1].suKien[0].mau === 'green' && nv[1].suKien[0].tu.y === 3, J(nv.map((x) => x.suKien.map((e) => e.ma + ':' + (e.mau || '')))));
  kiem('vết lệnh của color có docCamBien { ma, cam, ham, tu, o, mau, nguon, idVat, nhip }', (() => { const d = m.vet.filter((e) => e.ten === 'color')[0].docCamBien; return d.ma === 'doc-cam-bien' && d.cam === 'mau' && d.ham === 'color' && d.mau === 'none' && d.nguon === 'san' && d.nhip === 0 && d.o.y === 4 && d.tu.y === 4; })());
  // trả chuỗi dùng trong biểu thức
  const b1 = chay(rows, { x: 1, y: 3, huong: 0 }, L('a = color()', 'if a == "green":', '    left_move()', '    right_move()', '    wait()'));
  kiem('gán color() vào biến rồi so sánh: a == "green" → xe tiến', b1.robot.y === 2 && b1.nhip === 1);
  const b2 = chay(rows, { x: 1, y: 3, huong: 0 }, L('if color() != "green":', '    left_move()', '    right_move()', '    wait()', 'x = color() + "!"', 'n = len(color())', 'if x == "green!" and n == 5:', '    left_move()', '    right_move()', '    wait()'));
  kiem('color() là chuỗi thật: + nối chuỗi, len() đếm chữ, and', b2.robot.y === 2 && b2.nhip === 1, J(b2.robot) + ' ' + b2.nhip);
  const b3 = chay(rows, { x: 1, y: 3, huong: 0 }, L('if color() in "red green":', '    left_move()', '    right_move()', '    wait()'));
  kiem('color() in "red green" (in kiểm chuỗi nằm trong chuỗi)', b3.robot.y === 2);
  const b4 = chay(rows, { x: 1, y: 3, huong: 0 }, L('if color() == "Green":', '    left_move()', '    right_move()', '    wait()'));
  kiem('so với "Green" (viết hoa) không khớp: chữ hoa chữ thường là khác nhau, xe đứng yên', b4.robot.y === 3 && b4.nhip === 0);
  const b5 = chay(rows, { x: 1, y: 3, huong: 0 }, L('if color() == 1:', '    left_move()', '    wait()'));
  kiem('so color() với một số bằng == : không lỗi, không bằng (False)', b5.loi === null && b5.nhip === 0);
  const b6 = chay(rows, { x: 1, y: 3, huong: 0 }, L('a = color() + 1'));
  kiem('cộng chuỗi với số: lỗi chạy tiếng Việt (core)', b6.loi && b6.loi.loai === 'runtime-error' && /Không cộng được/.test(b6.loi.thongDiep));
  // vô hạn
  const ok1000 = chay(rows, bd, 'for i in range(1000):\n    color()\nleft_move()\nright_move()\nwait()');
  kiem('1000 lần đọc màu liên tiếp vẫn chưa bị chặn', ok1000.loi === null && ok1000.nhip === 1 && ok1000.soLanDoc === 1000);
  const vo = chay(rows, bd, 'while color() == "none":\n    pass');
  kiem('while color() == "none": pass — quá 1000 lần đọc không có nhịp thì dừng, infinite-loop (cùng bộ đếm với cảm biến khoảng cách)', vo.loi && vo.loi.loai === 'infinite-loop' && vo.soLanDoc === 1001 && vo.nhip === 0);
  const hon = chay(rows, bd, L(...Array(600).fill('color()'), ...Array(600).fill('front_clear()')));
  kiem('hai loại cảm biến dùng chung bộ đếm: 600 color + 600 front_clear liên tiếp → infinite-loop', hon.loi && hon.loi.loai === 'infinite-loop');
  const vo2 = chay(rows, bd, 'while color() != "red":\n    wait()');
  kiem('while color() != "red": wait() — có nhịp nên chạy tới nhipToiDa 200 rồi qua-nhieu-nhip', vo2.loi && vo2.loi.loai === 'qua-nhieu-nhip' && vo2.nhip === 200);
  // nhện cũng gắn được cảm biến màu (chỉ cảm biến khoảng cách mới cần hướng mặt)
  const nh = SanHoc.chay({ san: ['...', '.r.', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'nhen', hamGoc: ['go_up', 'wait', 'color'] }, 'a = color()');
  kiem('nhện gắn được cảm biến màu (không phụ thuộc hướng mặt): đọc "red"', nh.loi === null && doc(nh)[0].mau === 'red');
}

console.log('\n== 3. color() phụ thuộc phần cứng: cảm biến BỤNG đọc sàn dưới xe (kể cả lúc cầm vật), CAMERA đọc ô trước mặt ==');
{
  // xe ở (1,2) mặt lên, sàn dưới xe VÀNG; vật xanh dương ở (1,1) ngay trước mặt; vật không màu ở (3,1) trên sàn đỏ, xe thứ hai đứng ở (3,2) sàn xanh lá
  const rows = ['.....', '.o.o.', '..F..'];
  const vm = ['.....', '.b...', '.....'];            // vật ở (1,1) xanh dương; vật ở (3,1) không màu
  const mau = ['.....', '...r.', '.y.g.'];           // sàn: (3,1) đỏ dưới vật không màu; (1,2) vàng; (3,2) xanh lá
  const base = { mau, vatMau: vm };
  const nhat = L('arm_down()', 'grab()', 'wait()');
  const a = chay(rows, { x: 1, y: 2, huong: 0 }, 'c = color()', base);
  kiem('BỤNG, chưa nhặt: vật ngay trước mặt không đổi color(): màu sàn dưới xe "yellow", nguon "san", idVat null, cam "mau"', doc(a)[0].mau === 'yellow' && doc(a)[0].nguon === 'san' && doc(a)[0].idVat === null && doc(a)[0].cam === 'mau', J(doc(a)));
  const c = chay(rows, { x: 1, y: 2, huong: 0 }, L('a = color()', 'arm_down()', 'grab()', 'wait()', 'b = color()', 'arm_up()', 'wait()', 'c = color()'), base);
  const dc = doc(c);
  kiem('BỤNG, nhặt vật lên (kẹp xong): color() vẫn là màu SÀN "yellow" (vật đang cầm "blue" không tính), nguon "san", idVat null; nâng tay vẫn thế', dc.length === 3 && dc.every((e) => e.mau === 'yellow' && e.nguon === 'san' && e.idVat === null) && c.vat[0].trangThai === 'cam', J(dc.map((e) => e.mau + '/' + e.nguon)));
  const b = chay(rows, { x: 3, y: 2, huong: 0 }, L(nhat, 'x = color()'), base);
  kiem('BỤNG, cầm vật KHÔNG màu: color() vẫn là màu sàn ô xe "green" (không phải "none" của vật)', doc(b)[0].mau === 'green' && doc(b)[0].nguon === 'san' && b.vat[1].trangThai === 'cam', J(doc(b)));
  const d = chay(rows, { x: 1, y: 2, huong: 0 }, L(nhat, 'x = color()', 'release()', 'wait()', 'y = color()'), base);
  kiem('BỤNG, thả vật xuống rồi đọc lại: vẫn "yellow" (trước và sau khi thả như nhau)', doc(d)[0].mau === 'yellow' && doc(d)[1].mau === 'yellow' && doc(d)[1].nguon === 'san' && d.vat[0].trangThai === 'dat', J(doc(d).map((x) => x.mau)));
  const e = chay(rows, { x: 1, y: 2, huong: 0 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'wait()', 'x = color()'), base);
  kiem('BỤNG, vật đang cầm đi theo xe: xe rẽ sang hướng khác, color() vẫn là màu sàn dưới xe "yellow" (xe đọc được vạch kẻ khi đang cầm)', doc(e)[0].mau === 'yellow' && doc(e)[0].nguon === 'san' && e.robot.huong === 1 && e.vat[0].trangThai === 'cam', J([doc(e), e.robot]));
  // xe đi mang vật qua ô màu: sàn dưới xe đổi, color() đổi theo
  const dm = chay(['.....', '.o...', '.....'], { x: 1, y: 2, huong: 0 }, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'wait()', 'x = color()', TIEN, 'y = color()'), { mau: ['.....', '.....', '.rb..'], vatMau: ['.....', '.g...', '.....'] });
  kiem('BỤNG, xe mang vật đi qua các ô màu: đọc đúng màu từng ô sàn đi qua (mỗi lần "san"), không bao giờ màu vật "green"', (() => { const x = doc(dm); return x.length === 2 && x[0].mau === 'red' && x[1].mau === 'blue' && x.every((q) => q.nguon === 'san') && dm.vat[0].trangThai === 'cam'; })(), J(doc(dm)));
  const g = chay(rows, { x: 1, y: 2, huong: 0 }, L('grab()', 'wait()', 'x = color()'), base);
  kiem('BỤNG, tay nâng mà kẹp: kẹp vào không khí, color() vẫn là màu sàn "yellow"', doc(g)[0].mau === 'yellow' && doc(g)[0].nguon === 'san' && g.vat[0].trangThai === 'dat', J(doc(g)));
  const h = chay(rows, { x: 1, y: 1, huong: 0 }, L('arm_down()', 'grab()', 'wait()', 'x = color()'), base);
  kiem('BỤNG, xe xuất phát ngay trên ô có vật (cấu hình không nên làm): vật không gắp được, color() là màu sàn dưới xe, không phải màu vật', doc(h)[0].nguon === 'san' && doc(h)[0].mau === 'none' && h.vat[0].trangThai === 'dat', J(doc(h)));
  kiem('vật mang màu trong kết quả: vat[i].mau chỉ khi có màu; vết nhịp cũng vậy', a.vat[0].mau === 'blue' && !('mau' in a.vat[1]) && a.vatBanDau[0].mau === 'blue' && nhipVet(d)[0].vat[0].mau === 'blue');
  // robot không khai camBien nhưng có color: mặc định là cảm biến bụng (tương thích các cấu hình cũ)
  kiem('cfg.camBien không khai (hay chỉ khai cảm biến khoảng cách): color() là cảm biến BỤNG (mặc định)', doc(chay(rows, { x: 1, y: 2, huong: 0 }, 'c = color()', Object.assign({ camBien: [{ ma: 'khoang-cach', o: 'hong' }] }, base)))[0].cam === 'mau');
}

console.log('\n== 3b. CAMERA: color() đọc Ô TRƯỚC MẶT (vật → màu vật; không vật → màu sàn; chắn / ngoài sân → "none") ==');
{
  const CAM = { camBien: [{ ma: 'camera', o: 'tren' }] };
  const camChay = (rows, bd, code, extra) => chay(rows, bd, code, Object.assign({}, CAM, extra || {}));
  // bốn hướng: xe ở giữa sân 5×5 (2,2); trên (2,1) vật đỏ; phải (3,2) sàn xanh lá; dưới (2,3) tường; trái (1,2) vật xanh dương trên sàn vàng
  const san4 = ['.....', '..o..', '.o...', '..#..', '.....'];
  const vm4 = ['.....', '..r..', '.b...', '.....', '.....'];
  const mauSan = ['.....', '.....', '.y.g.', '.....', '.....'];
  const TEN = [['red', 'vat', 2, 1], ['green', 'san', 3, 2], ['none', 'chan', 2, 3], ['blue', 'vat', 1, 2]];   // theo hướng 0 phải-trên-dưới-trái: lên, phải, xuống, trái
  let ok = 0, sai = [];
  for (let h = 0; h < 4; h++) {
    const kq = camChay(san4, { x: 2, y: 2, huong: h }, 'c = color()', { mau: mauSan, vatMau: vm4 });
    const x = doc(kq)[0], [mm, ng, ox, oy] = TEN[h];
    if (x && x.cam === 'camera' && x.mau === mm && x.nguon === ng && x.o.x === ox && x.o.y === oy && x.huong === h && x.tu.x === 2 && x.tu.y === 2 && x.ham === 'color') ok++; else sai.push('h' + h + ':' + J(x));
  }
  kiem('CAMERA × 4 hướng mặt: lên → vật đỏ, phải → sàn xanh lá, xuống → tường "none" (nguon chan), trái → vật xanh dương (vật che sàn vàng); đúng ô được nhìn, huong, cam "camera"', ok === 4, sai.join(' | '));
  const sanXe = doc(camChay(san4, { x: 2, y: 2, huong: 0 }, 'c = color()', { mau: mauSan, vatMau: vm4 }));
  kiem('CAMERA không đọc sàn dưới xe: xe đứng trên ô vàng, mặt về vật đỏ → "red" chứ không phải sàn dưới xe', sanXe[0].mau === 'red' && doc(camChay(san4, { x: 1, y: 2, huong: 1 }, 'c = color()', { mau: mauSan, vatMau: vm4 }))[0].mau === 'none', J(sanXe));
  // mép sân (ngoài sân) bốn hướng
  const mep = [0, 1, 2, 3].map((h) => doc(camChay(['...', '...', '...'], { x: [1, 2, 1, 0][h], y: [0, 1, 2, 1][h], huong: h }, 'c = color()', { mau: ['rrr', 'rrr', 'rrr'] }))[0]);
  kiem('CAMERA nhìn ra ngoài sân (4 hướng, sàn trong sân toàn đỏ): "none", nguon "chan", ô được nhìn nằm ngoài sân', mep.every((x) => x.mau === 'none' && x.nguon === 'chan') && J(mep.map((x) => [x.o.x, x.o.y])) === J([[1, -1], [3, 1], [1, 3], [-1, 1]]), J(mep));
  // các thứ chắn: tường, hàng rào, thùng nặng, cửa đóng, nút bắn → none/chan; cửa mở, bậc thang, băng, đích, cờ là sàn
  const hang = (ky, mauLop) => doc(camChay(['...', '.' + ky + '.', '...'], { x: 1, y: 2, huong: 0 }, 'c = color()', mauLop ? { mau: ['...', '.' + mauLop + '.', '...'] } : {}))[0];
  const chan = ['#', '=', 'H', 'C', 'N'].map((ky) => hang(ky));
  kiem('CAMERA: tường #, hàng rào =, thùng nặng H, cửa đóng C, nút bắn N ở ô trước mặt → "none", nguon "chan"', chan.every((x) => x.mau === 'none' && x.nguon === 'chan'), J(chan));
  const san = [['c', null], ['S', null], ['>', 'r'], ['D', 'b'], ['F', 'g'], ['.', 'y'], ['.', null]].map(([ky, ml]) => hang(ky, ml));
  kiem('CAMERA: cửa mở c, bậc thang S, ô băng >, đích D, cờ F, sàn thường là SÀN: đọc màu sàn của lớp màu (hay "none" nếu không màu), nguon "san"', J(san.map((x) => x.mau)) === J(['none', 'none', 'red', 'blue', 'green', 'yellow', 'none']) && san.every((x) => x.nguon === 'san'), J(san.map((x) => [x.mau, x.nguon])));
  // vật không màu, vật trên sàn màu, nhiều vật
  const v1 = doc(camChay(['...', '.o.', '...'], { x: 1, y: 2, huong: 0 }, 'c = color()', { mau: ['...', '.y.', '...'] }))[0];
  kiem('CAMERA: vật KHÔNG màu nằm trên sàn vàng → "none" (nguon "vat", idVat 1; vật che sàn, không phải "yellow")', v1.mau === 'none' && v1.nguon === 'vat' && v1.idVat === 1, J(v1));
  const v2 = doc(camChay(['...', '.o.', '...'], { x: 1, y: 2, huong: 0 }, 'c = color()', { mau: ['...', '.y.', '...'], vatMau: ['...', '.r.', '...'] }))[0];
  kiem('CAMERA: vật đỏ nằm trên sàn vàng → "red" (nguon "vat")', v2.mau === 'red' && v2.nguon === 'vat' && v2.idVat === 1, J(v2));
  // trước / sau khi nhặt (tay kẹp)
  const nhatCam = L('arm_down()', 'grab()', 'wait()');
  const tn = camChay(['...', '.o.', '...'], { x: 1, y: 2, huong: 0 }, L('a = color()', nhatCam, 'b = color()', 'arm_up()', 'wait()', 'c = color()'), { mau: ['...', '.y.', '...'], vatMau: ['...', '.r.', '...'] });
  const dn = doc(tn);
  kiem('CAMERA, nhìn rồi nhặt: trước khi nhặt "red" (nguon vat); nhặt xong ô trước mặt TRỐNG nên thấy màu sàn "yellow" (nguon san); vật đang cầm không tính', dn[0].mau === 'red' && dn[0].nguon === 'vat' && dn[1].mau === 'yellow' && dn[1].nguon === 'san' && dn[2].mau === 'yellow' && tn.vat[0].trangThai === 'cam', J(dn.map((x) => x.mau + '/' + x.nguon)));
  const th = camChay(['...', '.o.', '...'], { x: 1, y: 2, huong: 0 }, L(nhatCam, 'arm_down()', 'release()', 'wait()', 'x = color()'), { vatMau: ['...', '.r.', '...'] });
  kiem('CAMERA, nhặt rồi thả xuống ô trước mặt: vật nằm đất lại, camera lại thấy "red" (nguon vat)', doc(th)[0].mau === 'red' && doc(th)[0].nguon === 'vat' && th.vat[0].trangThai === 'dat', J(doc(th)));
  // nhìn xa không thấy: vật cách 2 ô thì camera chỉ thấy ô trước mặt (không phải vật)
  const xa = doc(camChay(['...', '.o.', '...', '...'], { x: 1, y: 3, huong: 0 }, 'c = color()', { vatMau: ['...', '.r.', '...', '...'] }))[0];
  kiem('CAMERA chỉ nhìn ĐÚNG ô liền trước mặt: vật cách xe 2 ô không thấy ("none", nguon san)', xa.mau === 'none' && xa.nguon === 'san' && xa.o.y === 2, J(xa));
  // nhện: mặt trước CỐ ĐỊNH theo hướng ban đầu
  const nh = SanHoc.chay(Object.assign({ san: ['...', '...', '...'], batDau: { x: 1, y: 1, huong: 1 }, loaiRobot: 'nhen', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'color'] }, CAM, { mau: ['..g', '.y.', '..b'] }), L('a = color()', 'go_down()', 'b = color()', 'go_left()', 'c = color()'));
  const dnh = doc(nh);
  kiem('CAMERA trên NHỆN: mặt trước cố định theo huong lúc xuất phát (phải): luôn nhìn ô bên phải xe dù nhện đi lên / xuống / sang trái', nh.loi === null && dnh.length === 3 && dnh.every((x) => x.huong === 1) && J(dnh.map((x) => x.o)) === J([{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }]) && J(dnh.map((x) => x.mau)) === J(['none', 'blue', 'none']), J(dnh.map((x) => [x.mau, x.o])));
  // nhện + camera: vật bên phải đọc được
  const nh2 = SanHoc.chay(Object.assign({ san: ['...', '.o.', '...'], batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'nhen', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'color'] }, CAM, { vatMau: ['...', '.g.', '...'] }), 'a = color()');
  kiem('CAMERA trên NHỆN: vật xanh lá ở ô bên phải → "green" (nguon vat)', doc(nh2)[0].mau === 'green' && doc(nh2)[0].nguon === 'vat', J(doc(nh2)));
  // gắn cả hai → lỗi; camera trên drone → lỗi; camera mà không có color() thì không sao
  const ca = loi(() => chay(['...', '...'], { x: 1, y: 1, huong: 0 }, 'c = color()', { camBien: [{ ma: 'mau', o: 'hong' }, { ma: 'camera', o: 'tren' }] }));
  kiem('ghép CẢ cảm biến màu bụng lẫn camera mà có color(): lỗi cấu hình tiếng Việt, nói rõ không biết đọc ô nào', !!ca && /cả cảm biến màu ở bụng lẫn camera/.test(ca) && /không biết đọc ô nào/.test(ca), ca);
  kiem('ghép cả hai nhưng hamGoc KHÔNG có color(): không lỗi (color() không dùng nên không mơ hồ)', loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH, camBien: [{ ma: 'mau', o: 'hong' }, { ma: 'camera', o: 'tren' }] }, 'wait()')) === null);
  const cd = loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'drone', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'color'], camBien: [{ ma: 'camera', o: 'tren' }] }, 'c = color()'));
  kiem('camera trên DRONE: lỗi cấu hình tiếng Việt (drone không có hướng mặt)', !!cd && /Drone không gắn camera/.test(cd) && /hướng mặt/.test(cd), cd);
  const cd2 = loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'drone', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait'], camBien: [{ ma: 'camera', o: 'tren' }] }, 'wait()'));
  kiem('camera trên DRONE lỗi cả khi chưa dùng color()', !!cd2 && /Drone không gắn camera/.test(cd2));
  const dr = SanHoc.chay({ san: ['...', '.o.', '...'], batDau: { x: 1, y: 2, huong: 0 }, loaiRobot: 'drone', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'color', 'magnet_on', 'magnet_off'], camBien: [{ ma: 'mau', o: 'than' }], mau: ['...', '.r.', 'g..'], vatMau: ['...', '.b.', '...'], vatChat: ['...', '.s.', '...'] }, L('a = color()', 'go_up()', 'b = color()'));
  kiem('DRONE (cảm biến bụng): color() là màu sàn ô dưới drone, bay lên trên ô có vật cũng đọc sàn "red" (vật không tính)', dr.loi === null && doc(dr)[1].mau === 'red' && doc(dr)[1].cam === 'mau' && doc(dr)[0].mau === 'none', J(doc(dr)));
  // qua máy chấm: 13.8 gắn camera, 13.10 gắn cảm biến bụng
  const m8 = man(8), r8 = ChamHoc.cham(m8, m8.loiGiai, khoTruoc('13.8'));
  const dr8 = r8.theoSan.map((sn) => sn.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien)[0]);
  kiem('13.8 qua máy chấm: robot gắn camera; lần đọc color() đầu ở mỗi sân: cam "camera", nguon "vat", idVat 1, màu vật đỏ / xanh dương / đỏ, đúng ô trước mặt xe (3,1)', J(m8.robot.camBien) === J([{ ma: 'camera', o: 'tren' }]) && dr8.length === 3 && dr8.every((x) => x && x.cam === 'camera' && x.nguon === 'vat' && x.idVat === 1 && x.o.x === 3 && x.o.y === 1) && J(dr8.map((x) => x.mau)) === J(['red', 'blue', 'red']), J(dr8));
  const m10 = man(10), r10 = ChamHoc.cham(m10, m10.loiGiai, tron(khoTruoc('13.10'), m10.loiGiai.hamCuaEmMoi));
  const dr10 = r10.theoSan.map((sn) => { let daNhat = false, truoc = 0, sau = 0, saiNguon = 0; for (const e of sn.vet) { if (e.loai === 'lenh' && e.ten === 'grab') daNhat = true; if (e.loai === 'lenh' && e.docCamBien) { if (e.docCamBien.cam !== 'mau' || e.docCamBien.nguon !== 'san') saiNguon++; if (daNhat) sau++; else truoc++; } } return { truoc, sau, saiNguon }; });
  kiem('13.10 qua máy chấm: robot gắn cảm biến bụng; mọi lần đọc là cam "mau", nguon "san"; có đọc color() cả TRƯỚC lẫn SAU khi nhặt (đọc vạch kẻ lúc đang mang hàng)', J(m10.robot.camBien) === J([{ ma: 'mau', o: 'hong' }]) && r10.thang && dr10.every((x) => x.saiNguon === 0 && x.truoc > 0 && x.sau > 0), J(dr10));
}

/* ==================================================================== 4. ĐÍCH CÓ MÀU */
console.log('\n== 4. Đích có màu: chỉ nhận vật cùng màu ==');
{
  // xe ở (1,1) mặt lên, vật ở ô trước mặt (1,0); đích xanh dương ở (0,1) bên trái, đích đỏ ở (2,1) bên phải
  const rows = ['.o.', 'D.D', '...'];
  const mau = ['...', 'b.r', '...'];
  const BD = { x: 1, y: 1, huong: 0 };
  const lenh = (vatMauKy, huong, tha) => chay(rows, BD, 'pick_cho_san', {});
  const code = (cach) => L('arm_down()', 'grab()', 'wait()', 'arm_up()', cach === 'phai' ? 'left_move()' : 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()');
  const thu = (mauVat, cach, mauLop) => chay(rows, BD, code(cach), { mucTieu: 'dua-vat', mau: mauLop === undefined ? mau : mauLop, vatMau: mauVat === null ? undefined : ['.' + mauVat + '.', '...', '...'] });
  const dung = thu('r', 'phai');
  kiem('vật đỏ mang tới đích đỏ (phải): thắng, xong-dua-vat', dung.thang && maSK(dung, 'dat-sai-mau').length === 0 && dung.dich.find((d) => d.x === 2).mau === 'red');
  const sai = thu('r', 'trai');
  kiem('vật đỏ thả xuống đích xanh dương (trái): KHÔNG thắng, sự kiện dat-sai-mau { mauVat red, mauDich blue }, vật vẫn nằm đó',
    !sai.thang && maSK(sai, 'dat-sai-mau').length === 1 && maSK(sai, 'dat-sai-mau')[0].mauVat === 'red' && maSK(sai, 'dat-sai-mau')[0].mauDich === 'blue' && sai.vat[0].trangThai === 'dat' && sai.vat[0].x === 0, J(maSK(sai, 'dat-sai-mau')));
  const khongMau = thu(null, 'phai');
  kiem('vật KHÔNG màu thả xuống đích đỏ: không thắng, dat-sai-mau với mauVat "none"', !khongMau.thang && maSK(khongMau, 'dat-sai-mau')[0] && maSK(khongMau, 'dat-sai-mau')[0].mauVat === 'none');
  const dichTrang = thu('r', 'phai', ['...', '...', '...']);
  kiem('đích không màu nhận mọi vật như cũ (vật đỏ, đích không màu): thắng, không dat-sai-mau', dichTrang.thang && maSK(dichTrang, 'dat-sai-mau').length === 0);
  // sai rồi sửa: nhặt lại vật vừa thả (nó nằm ở ô trước mặt), quay nửa vòng, mang sang đích đúng
  const sua = chay(rows, BD, L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'wait()', 'left_move()', 'wait()', 'arm_down()', 'release()', 'wait()'), { mucTieu: 'dua-vat', mau, vatMau: ['.r.', '...', '...'] });
  kiem('thả nhầm đích xanh dương rồi nhặt lên lại (ô trước mặt), quay nửa vòng, mang sang đích đỏ: thắng (dat-sai-mau chỉ ghi lần thả sai, không dừng sớm)', sua.thang && maSK(sua, 'dat-sai-mau').length === 1 && sua.nhip === 7, J([sua.thang, sua.robot, sua.nhip, maSK(sua, 'dat-sai-mau').length]));
  // hai vật hai màu
  const hai = SanHoc.chay({ san: ['DoD'], batDau: { x: 1, y: 0, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH.concat(TAY, MAU), mucTieu: 'dua-vat', mau: ['rbr'], vatMau: ['.r.'] }, 'a = 1');
  kiem('một vật đỏ, hai đích đỏ / xanh dương: chưa thắng ngay (vật chưa nằm trên đích)', !hai.thang);
  // X: vật sẵn trên đích
  const xs = SanHoc.chay({ san: ['.X.'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH.concat(TAY, MAU), mucTieu: 'dua-vat', mau: ['.r.'], vatMau: ['.r.'] }, 'wait()');
  const xs2 = SanHoc.chay({ san: ['.X.'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH.concat(TAY, MAU), mucTieu: 'dua-vat', mau: ['.r.'], vatMau: ['.b.'] }, 'wait()');
  kiem('vật sẵn trên đích (X): cùng màu → thắng ngay; khác màu → không thắng', xs.thang && !xs2.thang);
  // qua máy chấm: chẩn đoán lời Việt
  const cr = ChamHoc.cham(man(8), { chinh: ['pick()', 'turn_right()', 'move()', 'drop()'] }, khoTruoc('13.8'));
  const dsm = cr.chanDoan.find((c) => c.ma === 'dat-sai-mau');
  kiem('chẩn đoán dat-sai-mau (13.8, luôn rẽ phải): lời Việt nêu nhịp, màu vật và màu đích, tọa độ; không nói đáp án', !!dsm && /màu xanh dương \(blue\)/.test(dsm.loi) && /đích màu đỏ \(red\)/.test(dsm.loi) && /Ở nhịp \d+/.test(dsm.loi) && /cùng màu/.test(dsm.loi) && !/turn_left/.test(dsm.loi) && cr.chanDoan.some((c) => c.ma === 'chua-dua-vat') && !cr.thang, J(cr.chanDoan.map((c) => c.loi)));
  const cdv = cr.chanDoan.find((c) => c.ma === 'chua-dua-vat');
  kiem('chua-dua-vat đếm vật nằm trên đích SAI màu là chưa xong (còn 1 trong 1) và nhắc đích có màu chỉ tính vật cùng màu', !!cdv && /còn 1 trong 1 vật/.test(cdv.loi) && /Đích có màu chỉ tính vật cùng màu/.test(cdv.loi) && cdv.conLai === 1, cdv && cdv.loi);
  kiem('kết quả của máy chấm mang lớp màu: mauO, vat[i].mau, dich[i].mau (theo sân đang xem)', Array.isArray(cr.mauO) && cr.vat[0].mau && cr.dich.every((d) => d.mau) && cr.theoSan.every((s) => Array.isArray(s.mauO)), J([cr.mauO && cr.mauO.length, cr.vat, cr.dich]));
}

/* ============================================= 5. CHẨN ĐOÁN: so chuỗi sai, quên nháy, chưa gắn cảm biến */
console.log('\n== 5. Chẩn đoán: chua-gan-cam-bien, ten-mau-sai, mau-thieu-nhay ==');
{
  const k1 = khoTruoc('13.1');
  const m1 = man(1);
  const cd = (m, chinh, kho, hamMan) => ChamHoc.cham(m, { chinh, hamCuaMan: hamMan || [] }, kho);
  // chưa gắn cảm biến
  const r1 = ChamHoc.cham(ManHoc.timMa('vong-lap.1'), { chinh: ['c = color()'] }, []);
  kiem('chương cũ (không có cảm biến nào) gọi color(): chua-gan-cam-bien, nói "chưa gắn cảm biến màu", nêu hàm gốc dùng được', maCua(r1).join() === 'chua-gan-cam-bien' && /chưa gắn cảm biến màu/.test(r1.chanDoan[0].loi) && /left_move/.test(r1.chanDoan[0].loi) && r1.chanDoan[0].ten === 'color', J(r1.chanDoan));
  const r2 = ChamHoc.cham(ManHoc.timMa('khoang-cach.1'), { chinh: ['c = color()'] }, khoTruoc('6.1'));
  kiem('chương khoang-cach gọi color(): chua-gan-cam-bien, nói màn này mới dùng được front_clear(), chưa có color()', maCua(r2).join() === 'chua-gan-cam-bien' && /mới dùng được front_clear\(\), chưa có color\(\)/.test(r2.chanDoan[0].loi), J(r2.chanDoan));
  const r3 = cd(m1, ['if front_clear():', '    move()'], k1);
  kiem('chương mau (màn 1) gọi front_clear() (chưa có cảm biến khoảng cách): chua-gan-cam-bien, nói mới dùng được color()', maCua(r3).join() === 'chua-gan-cam-bien' && /mới dùng được color\(\), chưa có front_clear\(\)/.test(r3.chanDoan[0].loi), J(r3.chanDoan));
  const r3b = cd(man(7), ['if front_clear() and color() != "yellow":', '    move()', 'if left_clear():', '    move()'], khoTruoc('13.7'));
  kiem('13.7 có cả color() và front_clear() nhưng chưa có left_clear(): chua-gan-cam-bien nêu cả hai hàm được dùng', maCua(r3b).join() === 'chua-gan-cam-bien' && /color\(\), front_clear\(\)|front_clear\(\), color\(\)/.test(r3b.chanDoan[0].loi), J(r3b.chanDoan));
  kiem('gõ sai tên (colour) là ham-chua-co như mọi hàm lạ', maCua(cd(m1, ['c = colour()'], k1)).join() === 'ham-chua-co');
  // ten-mau-sai
  const ts = (chinh, m = m1, kho = k1) => cd(m, chinh, kho);
  const cacBienThe = ['"Red"', '"RED"', '"rEd"', '"redd"', '"reed"', '"red "', "'Red'", '"Blue"', '"bule"', '"blu"', '"Green"', '"gren"', '"grean"', '"yelow"', '"Yellow"', '"None"', '"nonee"'];
  let tong = 0, ok = 0, rac = [];
  for (const lit of cacBienThe) {
    const r = ts(['while color() != ' + lit + ':', '    move()', 'turn_right()', 'move()', 'move()']);
    tong++;
    const c = r.chanDoan.find((x) => x.ma === 'ten-mau-sai');
    if (c && c.cho.cot === 'chinh' && c.cho.dong === 1 && c.chuoi === lit.slice(1, -1) && /chữ thường/.test(c.loi)) ok++; else rac.push(lit);
  }
  kiem('ten-mau-sai báo đúng ' + tong + ' biến thể gần giống tên màu (hoa / thường lẫn lộn, thiếu / thừa / sai một chữ, thừa dấu cách, nháy đơn), trỏ đúng dòng 1', ok === tong, rac.join(' '));
  const ts2 = ts(['while color() != "Red":', '    move()']);
  const cdSai = ts2.chanDoan.find((x) => x.ma === 'ten-mau-sai');
  kiem('lời ten-mau-sai nêu chuỗi sai, liệt kê năm chữ thường hợp lệ, KHÔNG nói đáp án cụ thể cho dòng đó; dài ≤ 330 ký tự', /"Red"/.test(cdSai.loi) && /"red", "green", "blue", "yellow" hoặc "none"/.test(cdSai.loi) && cdSai.loi.length <= 330, String(cdSai.loi.length));
  const khongBao = [
    ['while color() != "red":', '    move()', 'turn_right()', 'move()', 'move()'],                       // đúng: thắng
    ['x = "Red"', 'while color() != "red":', '    move()'],                                                // chuỗi sai nhưng không nằm trong phép so sánh
    ['while color() != "turn":', '    move()'],                                                           // chuỗi lạ xa tên màu
    ['while color() != "orange":', '    move()'],
    ['while color() != "":', '    move()'],
    ['# so với "Red" thì sao', 'while color() != "red":', '    move()']                                      // chuỗi nằm trong chú thích
  ];
  const kb = khongBao.map((c) => maCua(ts(c)).includes('ten-mau-sai'));
  kiem('KHÔNG báo nhầm: chương trình đúng (thắng); chuỗi sai nằm ngoài phép so sánh; chuỗi lạ xa tên màu ("turn", "orange", ""); chuỗi trong chú thích', kb.every((x) => !x), J(kb));
  const thang = ChamHoc.cham(m1, { chinh: ['c = color()', 'while color() != "red":', '    move()', 'turn_right()', 'move()', 'move()', 'x = "Red" == c'] }, k1);
  kiem('đã thắng thì không báo ten-mau-sai (kể cả có so sánh sai ở nhánh không dùng)', thang.thang && !maCua(thang).includes('ten-mau-sai'));
  const hamMan = ChamHoc.cham(man(9), man(9).maMau, khoTruoc('13.9'));
  kiem('hàm của màn (13.9 maMau): dòng sai chỉ rõ "hàm go_by_color của màn, dòng N"', (() => { const c = hamMan.chanDoan.find((x) => x.ma === 'mau-thieu-nhay'); return c && c.cho.cot === 'hamMan' && c.cho.ten === 'go_by_color' && c.cho.dong === 1 && /hàm go_by_color của màn, dòng 1/.test(c.loi); })(), J(hamMan.chanDoan.map((c) => c.ma + ':' + J(c.cho))));
  // mau-thieu-nhay
  for (const ten of ['red', 'green', 'blue', 'yellow', 'none']) {
    const r = ts(['while color() != ' + ten + ':', '    move()']);
    const c = r.chanDoan.find((x) => x.ma === 'mau-thieu-nhay');
    kiem('quên nháy quanh ' + ten + ': mau-thieu-nhay, trỏ đúng dòng, nhắc đặt tên màu trong dấu nháy', !!c && c.ten === ten && c.cho.dong === 1 && /dấu nháy/.test(c.loi) && !r.chanDoan.some((x) => x.ma === 'loi-chay'), J(r.chanDoan.map((x) => x.ma)));
  }
  const khac = ts(['while color() != orange:', '    move()']);
  kiem('tên biến lạ không phải tên màu (orange) vẫn là loi-chay như cũ, không phải mau-thieu-nhay', maCua(khac).join() === 'loi-chay');
  // sân thử: không báo ten-mau-sai (không có điều kiện thắng)
  const tH = ChamHoc.thuHam(man(5), { chinh: [] }, 'read_turn', tron(khoTruoc('13.5'), [H('read_turn', ['if color() == "Red":', '    turn_right()'])]));
  kiem('sân thử của Xưởng không báo ten-mau-sai (không có cờ để "chưa thắng")', !maCua(tH).includes('ten-mau-sai'), J(maCua(tH)));
}

/* ================================================================= 6. NHIỀU SÂN CÓ LỚP MÀU */
console.log('\n== 6. Chấm nhiều sân có lớp màu; cứng số trượt sân khác ==');
{
  kiem('SanHoc.lopMauCuaSan: màn một sân trả lớp nguyên; màn nhiều sân trả lớp của sân i; không khai thì null', (() => {
    const a = SanHoc.lopMauCuaSan({ san: ['..'], mau: ['r.'] }, 0), b = SanHoc.lopMauCuaSan({ san: [['..'], ['..']], mau: [['r.'], ['.g']] }, 1), c = SanHoc.lopMauCuaSan({ san: [['..'], ['..']] }, 1), d = SanHoc.lopMauCuaSan({ san: [['..'], ['..']], mau: [['r.'], null] }, 1);
    return a.mau[0] === 'r.' && b.mau[0] === '.g' && c.mau === null && c.vatMau === null && d.mau === null;
  })());
  const m6 = man(6), k6 = khoTruoc('13.6');
  const tot = ChamHoc.cham(m6, m6.loiGiai, k6);
  kiem('13.6: lời giải thắng ba sân (cờ trên ô xanh dương, lớp màu); soNhip = TỔNG (8 + 7 + 6 = 21), nhipMax 8', tot.thang && tot.theoSan.map((s) => s.soNhip).join() === '8,7,6' && tot.soNhip === 21 && tot.nhipTong === 21 && tot.nhipMax === 8 && tot.sao === 3);
  kiem('13.6: mauO của từng sân khác nhau (ô vàng và cờ xanh dương ở chỗ khác), cờ luôn xanh dương', tot.theoSan.map((s) => J(s.mauO)).filter((x, i, a) => a.indexOf(x) === i).length === 3 && sanCua(m6).every((rows, i) => { const f = rows.join('').indexOf('F'); return tot.theoSan[i].mauO[Math.floor(f / 7)][f % 7] === 'blue'; }));
  const cungSan1 = ChamHoc.cham(m6, { chinh: ['move()', 'move()', 'move()', 'turn_right()', 'move()', 'move()', 'move()', 'move()'] }, k6);
  kiem('13.6: viết cứng theo sân 1 (3 ô, rẽ, 4 ô): thắng sân 1, trượt sân 2 (khúc quẹo ở chỗ khác) → không thắng; sân 3 (đoạn đầu ngắn hơn) thắng nhờ húc tường mất nhịp', !cungSan1.thang && cungSan1.theoSan.map((s) => s.thang).join() === 'true,false,true' && cungSan1.sao === 0 && maCua(cungSan1).includes('dam-tuong'), cungSan1.theoSan.map((s) => s.thang).join());
  // 13.4: đỏ phải / xanh dương trái ở ba sân, cứng số
  const m4 = man(4), k4 = khoTruoc('13.4');
  const r4 = ChamHoc.cham(m4, m4.loiGiai, k4);
  kiem('13.4: ba sân vạch kẻ, lời giải thắng cả ba: nhịp 11 + 12 + 17 = 40', r4.thang && r4.theoSan.map((s) => s.soNhip).join() === '11,12,17' && r4.soNhip === 40);
  const khongElif = ChamHoc.cham(m4, { chinh: ['for i in range(30):', '    if color() == "red":', '        turn_right()', '    move()'] }, k4);
  kiem('13.4: chỉ xử lý ô đỏ (quên xanh dương): trượt sân có khúc rẽ trái', !khongElif.thang && khongElif.theoSan.some((s) => !s.thang));
  const doiMau = ChamHoc.cham(m4, { chinh: ['for i in range(30):', '    if color() != "none":', '        turn_right()', '    move()'] }, k4);
  kiem('13.4: ô nào có màu cũng rẽ phải (ô vàng / xanh lá nhiễu làm rẽ nhầm): trượt', !doiMau.thang);
  const alt = ChamHoc.cham(m4, { chinh: ['for i in range(30):', '    if color() == "red":', '        turn_right()', '    if color() == "blue":', '        turn_left()', '    move()'] }, k4);
  kiem('13.4: hai if rời nhau (không elif) cũng thắng, cùng số ô (13) và nhịp (40) → 3 sao: elif không bắt buộc', alt.thang && alt.sao === 3 && alt.soNhip === 40 && alt.soO === 13, J([alt.thang, alt.sao, alt.soO, alt.soNhip]));
  // chép thẳng: dãy lệnh bánh đã chạy ở sân i, chạy ở mọi sân
  const bang = [];
  for (const m of ds.filter((x) => x.so >= 4)) {
    const kh = khoTruoc(m.id);
    const hg = tron(kh, m.loiGiai.hamCuaEmMoi);
    const rr = ChamHoc.cham(m, m.loiGiai, hg);
    kiem(m.id + ': lời giải thắng cả 3 sân, 3 sao; tổng nhịp = sao.nhip (' + m.sao.nhip + ')', rr.thang && rr.sao === 3 && rr.theoSan.length === 3 && rr.theoSan.every((s) => s.thang) && rr.soNhip === m.sao.nhip && rr.nhipTong === m.sao.nhip, J([rr.thang, rr.sao, rr.soNhip]));
    const cungLoai = [];
    sanCua(m).forEach((rows, i) => {
      const cfg = (j) => { const lm = SanHoc.lopMauCuaSan(m, j); return { san: sanCua(m)[j], batDau: bdCua(m)[j], loaiRobot: 'banh', hamGoc: m.hamGoc, mucTieu: m.mucTieu || 'toi-co', mau: lm.mau, vatMau: lm.vatMau, camBien: m.robot.camBien }; };
      const res = SanHoc.chay(cfg(i), rr.py);
      const code = res.vet.filter((e) => e.loai === 'lenh' && !e.docCamBien).map((e) => e.ten + '()').join('\n');
      let thangHet = true, tong = 0, trat = [];
      sanCua(m).forEach((rows2, j) => {
        const rj = SanHoc.chay(cfg(j), code);
        tong += rj.nhip;
        if (!rj.thang) { thangHet = false; trat.push(j + 1); }
      });
      cungLoai.push({ san: i + 1, thangHet, tong, trat });
    });
    kiem(m.id + ': chép thẳng dãy lệnh đã chạy ở sân 1 / 2 / 3 rồi chạy ở mọi sân — hoặc trượt ít nhất một sân, hoặc thắng hết nhưng tổng nhịp > sao.nhip (không bao giờ 3 sao nhịp)', cungLoai.every((c) => !c.thangHet || c.tong > m.sao.nhip), J(cungLoai));
    kiem(m.id + ': với dãy lệnh cứng chép từ mỗi sân, có ít nhất một sân trượt các sân kia', cungLoai.some((c) => !c.thangHet), J(cungLoai));
    bang.push({ id: m.id });
  }
  kiem('mỗi màn nhiều sân: 3 sân khác nhau từng ô (hoặc khác lớp màu), cùng kích thước, đều ≤ 7×7', ds.filter((x) => x.so >= 4).every((m) => new Set(m.san.map((s) => s.join('/')) .map((k, i) => k + '|' + J(m.mau && m.mau[i]) + '|' + J(m.vatMau && m.vatMau[i]))).size === 3 && m.san.every((s) => s.length === m.san[0].length && s[0].length === m.san[0][0].length && s.length <= 7 && s[0].length <= 7)));
  // hành lang một lối: mọi sân vạch kẻ chỉ có một đường (không có ô nào kề quá hai ô đi được trừ ngã ba / vòng đã khai)
  const gom = (rows) => { const ky = (c) => c !== '#'; let sai = 0; rows.forEach((r, y) => [...r].forEach((c, x) => { if (!ky(c)) return; const k = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => rows[y + dy] && rows[y + dy][x + dx] && ky(rows[y + dy][x + dx])).length; if (k > 2) sai++; })); return sai; };
  kiem('sân vạch kẻ 1–6, 9, 10 là hành lang một lối (không ô nào kề hơn hai ô đi được): không có đường tắt nào giữa các khúc', ds.filter((m) => [1, 2, 3, 4, 5, 6, 9, 10].includes(m.so)).every((m) => sanCua(m).every((rows) => gom(rows) === 0)));
  // đánh giá: mỗi ô màu nhiễu nằm trên đoạn thẳng, không phải khúc rẽ ở 13.4
  const nhieu = sanCua(m4).map((rows) => rows.join('').replace(/[#.FrbR]/g, '').length);
  kiem('13.4: mỗi sân đều có ô nhiễu (vàng / xanh lá) trên đoạn thẳng, để chương trình "ô nào có màu cũng rẽ" bị bắt', nhieu.every((n) => n >= 1), J(nhieu));
}

/* ===================================================== 7. SÂN THỬ CỦA XƯỞNG CÓ Ô MÀU */
console.log('\n== 7. Sân thử của Xưởng hàm có ô màu ==');
{
  const m5 = man(5), k5 = khoTruoc('13.5');
  const rt = H('read_turn', ['if color() == "red":', '    turn_right()', 'elif color() == "blue":', '    turn_left()']);
  const hg = tron(k5, [rt]);
  const t0 = ChamHoc.thuHam(m5, { chinh: [] }, 'read_turn', hg);
  kiem('sân thử mặc định không có ô màu: read_turn() không làm gì (0 nhịp), color() là "none", không chẩn đoán', t0.soNhip === 0 && t0.robot.huong === 0 && t0.chanDoan.length === 0 && t0.sanThu.mau === undefined);
  const t1 = ChamHoc.thuHam(m5, { chinh: [] }, 'read_turn', hg, { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, mau: [{ x: 2, y: 2, mau: 'red' }] } });
  kiem('đặt ô đỏ dưới xe: read_turn() rẽ phải (hướng 1), 1 nhịp; sanThu.mau trả lại chuẩn hóa', t1.robot.huong === 1 && t1.soNhip === 1 && J(t1.sanThu.mau) === J([{ x: 2, y: 2, mau: 'red' }]), J([t1.robot, t1.soNhip, t1.sanThu.mau]));
  const t2 = ChamHoc.thuHam(m5, { chinh: [] }, 'read_turn', hg, { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, mau: [{ x: 2, y: 2, mau: 'b' }] } });
  kiem('ô xanh dương (viết tắt "b"): rẽ trái (hướng 3)', t2.robot.huong === 3 && t2.sanThu.mau[0].mau === 'blue');
  const t3 = ChamHoc.thuHam(m5, { chinh: [] }, 'read_turn', hg, { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, tuong: [{ x: 1, y: 1 }], mau: [{ x: 1, y: 1, mau: 'red' }, { x: 9, y: 9, mau: 'red' }, { x: 0, y: 0, mau: 'tim' }, { x: 3, y: 3, mau: 'red' }, { x: 3, y: 3, mau: 'blue' }] } });
  kiem('chuẩn hóa: ô màu trên tường, ngoài sân, màu lạ đều bị bỏ; ô trùng chỉ lấy lần đầu', J(t3.sanThu.mau) === J([{ x: 3, y: 3, mau: 'red' }]), J(t3.sanThu.mau));
  const m8 = man(8);
  const t4 = ChamHoc.thuHam(m8, { chinh: [] }, 'pick', khoTruoc('13.8'), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 1, mau: 'red' }, { x: 1, y: 2 }] } });
  kiem('vật trong sân thử mang màu (mau: "red"), nằm ở ô trước mặt xe; pick() nhặt được; kết quả vat[0].mau = red', t4.vat.length === 2 && t4.vat[0].mau === 'red' && !('mau' in t4.vat[1]) && t4.vat[0].trangThai === 'cam' && t4.vat[1].trangThai === 'dat', J(t4.vat));
  // 13.8 gắn camera: hàm thử trong Xưởng đọc color() cũng theo camera (ô trước mặt), không phải sàn dưới xe
  const tCam = ChamHoc.thuHam(m8, { chinh: [] }, 'look', tron(khoTruoc('13.8'), [H('look', ['c = color()'])]), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 1, mau: 'blue' }], mau: [{ x: 2, y: 2, mau: 'red' }] } });
  const dCam = tCam.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
  kiem('sân thử của Xưởng ở màn camera (13.8): color() thấy vật xanh dương ở ô trước mặt (cam "camera", nguon "vat"), không phải sàn đỏ dưới xe', dCam.length === 1 && dCam[0].cam === 'camera' && dCam[0].mau === 'blue' && dCam[0].nguon === 'vat', J(dCam));
  const tBung = ChamHoc.thuHam(man(5), { chinh: [] }, 'look', tron(khoTruoc('13.5'), [H('look', ['c = color()'])]), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, mau: [{ x: 2, y: 2, mau: 'red' }, { x: 2, y: 1, mau: 'green' }] } });
  const dBung = tBung.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
  kiem('sân thử ở màn cảm biến bụng (13.5): color() là sàn dưới xe "red", không phải ô trước mặt "green"', dBung.length === 1 && dBung[0].cam === 'mau' && dBung[0].mau === 'red', J(dBung));
}

/* ========================================================= 8. BỘ DÒ ĐƯỜNG TẮT CÓ MÀU */
console.log('\n== 8. Bộ dò đường tắt có màu ==');
{
  // xe ở (1,1) mặt lên, vật ở ô trước mặt (1,0), hai đích ở hai bên xe: cùng khoảng cách
  const cfg = (mauL, vatL) => ({ loaiRobot: 'banh', san: ['.o.', 'D.D'], batDau: { x: 1, y: 1, huong: 0 }, mau: mauL, vatMau: vatL });
  const khong = nhipDuaVatNganNhat(cfg(undefined, undefined));
  const dung = nhipDuaVatNganNhat(cfg(['...', 'b.r'], ['.r.', '...']));
  const sai = nhipDuaVatNganNhat(cfg(['...', 'r.b'], ['.r.', '...']));
  const cungMau = nhipDuaVatNganNhat(cfg(['...', 'r.r'], ['.r.', '...']));
  kiem('đích không màu: tới đích gần nhất; vật đỏ, hai đích (xanh dương, đỏ): BFS chỉ tính đích đỏ (cùng màu); hai đích cùng màu thì chọn gần; lệnh cùng độ dài ở hai phía', khong.nhip === dung.nhip && dung.nhip === sai.nhip && sai.nhip === cungMau.nhip && dung.nhip > 0, J([khong.nhip, dung.nhip, sai.nhip, cungMau.nhip]));
  // bất đối xứng: đích xanh dương gần (phải, 1 ô), đích xa (trái, 2 ô): vật đỏ phải đi xa
  const bd = (mauL, vatL) => nhipDuaVatNganNhat({ loaiRobot: 'banh', san: ['....o..', '.D....D'], batDau: { x: 4, y: 1, huong: 0 }, mau: mauL, vatMau: vatL });
  const gan = bd(undefined, undefined), xa = bd(['.......', '.r....b'], ['....r..', '.......']), xaNguoc = bd(['.......', '.b....r'], ['....r..', '.......']);
  kiem('đích gần xanh dương, đích xa đỏ, vật đỏ: BFS phải mang tới đích đỏ xa (nhiều nhịp hơn đích gần không màu); đổi hai đích thì gần lại', xa.nhip > gan.nhip && xaNguoc.nhip === gan.nhip, J([gan.nhip, xa.nhip, xaNguoc.nhip]));
  const khongDuoc = nhipDuaVatNganNhat({ loaiRobot: 'banh', san: ['....o..', '.D.....'], batDau: { x: 4, y: 1, huong: 0 }, mau: ['.......', '.b.....'], vatMau: ['....r..', '.......'] });
  kiem('vật đỏ mà chỉ có đích xanh dương: không tới được (nhip null, không cắt ngang)', khongDuoc.nhip === null && khongDuoc.catNgang === false);
  // so chéo với SanHoc: chuỗi hành động của BFS chạy thật ở SanHoc cho đúng thắng
  const mb = man(8);
  let chonVen = true, chiTiet = [];
  sanCua(mb).forEach((rows, i) => {
    const lm = SanHoc.lopMauCuaSan(mb, i);
    const r = nhipDuaVatNganNhat({ loaiRobot: 'banh', san: rows, batDau: bdCua(mb)[i], mau: lm.mau, vatMau: lm.vatMau });
    const ma = ((chuoi) => { const d = []; for (const a of chuoi) { if (a.tuThe === 'duoi') d.push('arm_down()'); else if (a.tuThe === 'tren') d.push('arm_up()'); if (a.kep === 'kep') d.push('grab()'); else if (a.kep === 'tha') d.push('release()'); if (a.banh === 'tien') d.push('left_move()', 'right_move()'); else if (a.banh === 'phai') d.push('left_move()'); else if (a.banh === 'trai') d.push('right_move()'); d.push('wait()'); } return d.join('\n') + '\n'; })(r.chuoi);
    const th = SanHoc.chay({ san: rows, batDau: bdCua(mb)[i], loaiRobot: 'banh', hamGoc: mb.hamGoc, mucTieu: 'dua-vat', mau: lm.mau, vatMau: lm.vatMau }, ma);
    chiTiet.push(r.nhip + '/' + th.nhip + '/' + th.thang);
    if (!th.thang || th.nhip !== r.nhip) chonVen = false;
  });
  kiem('13.8: chuỗi hành động ngắn nhất do BFS tìm ra, chạy thật bằng SanHoc.chay, thắng đúng số nhịp ở cả ba sân', chonVen, chiTiet.join(' '));
  const bdc = sanCua(mb).map((rows, i) => { const lm = SanHoc.lopMauCuaSan(mb, i); return nhipDuaVatNganNhat({ loaiRobot: 'banh', san: rows, batDau: bdCua(mb)[i], mau: lm.mau, vatMau: lm.vatMau }).nhip; });
  kiem('13.8: lời giải chuẩn (pick / drop 2 nhịp) chậm hơn BFS ở mỗi sân, tổng BFS ≤ sao.nhip (nhipTheoLoiGiai)', man(8).nhipTheoLoiGiai === true && bdc.reduce((a, b) => a + b, 0) <= man(8).sao.nhip && bdc.reduce((a, b) => a + b, 0) < man(8).sao.nhip, J(bdc));
}

/* ========================================================== 9. DỮ LIỆU 10 MÀN + BẢNG */
console.log('\n== 9. Dữ liệu 10 màn ==');
{
  kiem('đúng 10 màn, id 13.1…13.10, mã mau.1…10, chương đứng thứ 13 sau tam-day (đợt 2), tên "Cảm biến màu"',
    ds.length === 10 && ds.every((m, i) => m.so === i + 1 && m.id === '13.' + (i + 1) && m.ma === 'mau.' + (i + 1)) && ThuTu.thuTu[12] === 'mau' && ThuTu.thuTu[11] === 'tam-day' && ThuTu.laDot2('mau') && ThuTu.ten['mau'] === 'Cảm biến màu');
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ màn 10 có huy hiệu "mau"', J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) &&
    ds.every((m) => !!m.huyHieu === (m.so === 10)) && ds[9].huyHieu.ma === 'mau' && ds[9].huyHieu.ten === 'Huy hiệu Cảm biến màu');
  kiem('hamGoc: mọi màn đủ 5 lệnh bánh và color; 7 có thêm front_clear (và chỉ 7); 8 và 10 có thêm 4 lệnh tay kẹp',
    ds.every((m) => BANH.every((t) => m.hamGoc.includes(t)) && m.hamGoc.includes('color') && m.hamGoc.includes('front_clear') === (m.so === 7) && !m.hamGoc.includes('left_clear') && TAY.every((t) => m.hamGoc.includes(t)) === (m.so === 8 || m.so === 10)));
  kiem('robot.camBien: [{ ma: "mau", o: "hong" }] ở mọi màn TRỪ 13.8 (camera [{ ma: "camera", o: "tren" }]); thêm { ma: "khoang-cach", o: "hong" } ở màn 7; có tay kẹp ("kep") ở 8 và 10; không màn nào gắn cả hai',
    ds.every((m) => J(m.robot.camBien) === J(m.so === 7 ? [{ ma: 'mau', o: 'hong' }, { ma: 'khoang-cach', o: 'hong' }] : m.so === 8 ? [{ ma: 'camera', o: 'tren' }] : [{ ma: 'mau', o: 'hong' }]) && m.robot.than === 'hai-banh' && (m.robot.tay === 'kep') === (m.so === 8 || m.so === 10)));
  kiem('13.1–13.3: một sân; 13.4–13.10: ba sân (mảng), batDau mảng 3 phần tử, nhipTheo "tong"', ds.every((m) => (m.so <= 3 ? !Array.isArray(m.san[0]) && !Array.isArray(m.batDau) && m.nhipTheo === undefined : m.san.length === 3 && Array.isArray(m.batDau) && m.batDau.length === 3 && m.nhipTheo === 'tong')));
  kiem('mọi xe xuất phát trong ô đi được và không đứng trên vật; 13.8: vật nằm ở ô ngay TRƯỚC mặt xe ở cả ba sân; 13.10: mỗi sân đúng một vật nằm ngay cạnh ô xanh lá (chỗ nhặt), đúng một ô xanh lá, đúng một ô vàng cạnh đúng một ô đích D (chỗ thả), vật và ô đích không nằm sát nhau', ds.every((m) => sanCua(m).every((rows, i) => {
    const b = bdCua(m)[i]; const c = rows[b.y][b.x]; if (c === '#' || c === 'o' || c === 'X') return false;
    if (m.so === 8) { const v = VEC[b.huong]; return rows[b.y + v[1]][b.x + v[0]] === 'o'; }
    if (m.so === 10) {
      const k = rows.join(''), W = rows[0].length, vi = (ch) => { const r = []; for (let q = 0; q < k.length; q++) if (k[q] === ch) r.push({ x: q % W, y: Math.floor(q / W) }); return r; };
      const o = vi('o'), g = vi('g'), D = vi('D'), kề = (a, d) => Math.abs(a.x - d.x) + Math.abs(a.y - d.y) === 1;
      const vang = vi('y').filter((y) => D.some((d) => kề(y, d)));
      return o.length === 1 && g.length === 1 && D.length === 1 && kề(o[0], g[0]) && vang.length === 1 && !kề(o[0], D[0]);
    }
    return true;
  })));
  kiem('lớp màu / lớp màu vật khai đúng cỡ sân (docSan không ném lỗi) ở mọi sân của mọi màn', ds.every((m) => sanCua(m).every((rows, i) => { const lm = SanHoc.lopMauCuaSan(m, i); try { SanHoc.docSan(rows, lm.mau, lm.vatMau); return true; } catch (e) { return false; } })));
  kiem('13.8: mỗi sân có đúng một vật có màu và hai đích có màu khác nhau (một đích cùng màu vật); 13.10: mỗi sân đúng một vật KHÔNG màu và đúng một ô đích không màu (cảm biến bụng chỉ đọc sàn nên không phân loại theo màu vật)', sanCua(man(8)).every((rows, i) => { const lm = SanHoc.lopMauCuaSan(man(8), i); const s = SanHoc.docSan(rows, lm.mau, lm.vatMau); return s.vat.length === 1 && !!s.vat[0].mau && s.dich.length === 2 && s.dich.every((d) => d.mau) && s.dich[0].mau !== s.dich[1].mau && s.dich.some((d) => d.mau === s.vat[0].mau); }) &&
    sanCua(man(10)).every((rows, i) => { const lm = SanHoc.lopMauCuaSan(man(10), i); const s = SanHoc.docSan(rows, lm.mau, lm.vatMau); return s.vat.length === 1 && !s.vat[0].mau && s.dich.length === 1 && !s.dich[0].mau; }));
  kiem('màu đích 13.8 là đỏ / xanh dương; 13.10 không có đích màu', (() => {
    const mauDich = (so) => [...new Set(sanCua(man(so)).flatMap((rows, i) => { const lm = SanHoc.lopMauCuaSan(man(so), i); return SanHoc.docSan(rows, lm.mau, lm.vatMau).dich.map((d) => d.mau); }))].sort().join();
    return mauDich(8) === 'blue,red' && mauDich(10) === '';
  })());
  kiem('read_turn là hàm cốt truyện tạo ở 13.5 (taoHam), tên bị khóa trong kho; không màn nào khác tạo hàm; 13.9 cho sẵn go_by_color của màn (hàm có lỗi)',
    J(man(5).taoHam) === '["read_turn"]' && tenCotTruyen.includes('read_turn') && ds.filter((m) => m.so !== 5).every((m) => m.taoHam.length === 0) && man(9).maMau.hamCuaMan.length === 1 && man(9).maMau.hamCuaMan[0].ten === 'go_by_color' && !tenCotTruyen.includes('go_by_color'));
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  kiem('trước 13.5 không đặt được tên read_turn (ten-danh-cho-cot-truyen); ở 13.5 (taoHam) thì đặt được', kho.tao('read_turn', []).ma === 'ten-danh-cho-cot-truyen' && kho.tao('read_turn', [], { taoHam: ['read_turn'] }).ok);
  // lời giải: mọi màn
  kiem('mọi màn có loiGiaiKhac (đúng 2 sao) và ≥ 4 lời sai (kiem-hoc.mjs kiểm chi tiết)', ds.every((m) => m.loiGiaiKhac && m.loiSai.length >= 4));
  kiem('đề bài ghi rõ các chuỗi màu tiếng Anh chữ thường ("red", "green", "blue", "yellow") hoặc dùng tên màu trong ngoặc kép: màn 1 liệt kê đủ năm chuỗi color() có thể trả về', /"red", "green", "blue", "yellow" hoặc "none"/.test(man(1).deBai) && ds.filter((m) => m.so !== 1).every((m) => /"(red|green|blue|yellow)"/.test(m.deBai)));
  kiem('mỗi màn 1, 2, 3, 5, 6, 7, 8, 9, 10 có ít nhất một lời sai báo ten-mau-sai hoặc mau-thieu-nhay; 4 có lời sai cứng số / nhiễu', [1, 2, 3, 5, 6, 7, 8, 9, 10].every((so) => man(so).loiSai.some((l) => l.phaiCoMa.includes('ten-mau-sai') || l.phaiCoMa.includes('mau-thieu-nhay'))) && man(4).loiSai.some((l) => /cứng|nhiễu/i.test(l.moTa)));
  kiem('chương mau mở while ngay từ màn 1 (chương khoang-cach đã dạy): cauTruc ["for","if","while"], không chanWhile', ds.every((m) => J(m.cauTruc) === '["for","if","while"]' && m.khung.chanWhile === undefined));
  const dsCauHoi = ds.map((m) => (m.deBai.match(/[.?!](\s|$)/g) || []).length);
  kiem('đề mỗi màn 1–3 câu', dsCauHoi.every((n) => n >= 1 && n <= 3), J(dsCauHoi));
}

console.log('\n== Bảng 10 màn chương Cảm biến màu (lời giải mẫu) ==');
{
  console.log('  màn   | tên                  | sân | ô  | nhịp (tổng = từng sân)     | hàm dùng');
  const OLO = [10, 9, 13, 13, 14, 10, 10, 25, 14, 29], NHIP = [6, 17, 11, 40, 40, 21, 16, 15, 36, 36];
  const kq = [];
  for (const m of ds) {
    const r = ChamHoc.cham(m, m.loiGiai, tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi));
    kq.push(r);
    console.log('  ' + m.id.padEnd(5) + ' | ' + m.ten.padEnd(20) + ' | ' + String(sanCua(m).length).padEnd(3) + ' | ' + String(r.soO).padEnd(2) + ' | ' + (String(r.soNhip) + ' (' + r.theoSan.map((s) => s.soNhip).join('+') + ')').padEnd(26) + ' | ' + r.hamDaDung.join(', '));
  }
  kiem('bảng 10 màn: số ô 10, 9, 13, 13, 14, 10, 10, 25, 14, 29 và số nhịp (tổng) 6, 17, 11, 40, 40, 21, 16, 15, 36, 36 — đều 3 sao', kq.every((r, i) => r.sao === 3 && r.soO === OLO[i] && r.soNhip === NHIP[i]), kq.map((r) => r.soO + '/' + r.soNhip).join(' '));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

/* ============================================================================
   kiem-khoang-cach.mjs — máy kiểm chương `khoang-cach` (Cảm biến khoảng cách) của "Đường học".
   Gồm: front_clear / left_clear / right_clear ở mọi loại ô và mọi hướng (xe bánh, xích, omni; thùng nặng; mép sân), đọc cảm biến
   không tốn nhịp và ghi sự kiện doc-cam-bien, robot không có cảm biến (chua-gan-cam-bien), nhện không gắn cảm biến, chống vòng
   lặp vô hạn (vong-vo-han: while không nhịp, while quá nhịp, quá 1000 lần đọc liên tiếp), chấm NHIỀU SÂN (thắng khi thắng tất cả;
   nhipTheo 'tong'; lời giải cứng số trượt ít nhất một sân hoặc mất sao nhịp), cờ chanWhile của màn 1, dữ liệu 10 màn và bảng 10 màn.
   Các kiểm chung cho cả 110 màn (đi tuần tự, sao, lời sai, đường tắt BFS trên từng sân…) nằm ở kiem-hoc.mjs.
   Chạy: node robotics/hoc/kiem-khoang-cach.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
for (const f of ['man-chuoi-2', 'man-tay-gap', 'man-vong-lap', 'man-bang-chuyen', 'man-tham-so', 'man-nhen', 'man-xich', 'man-omni', 'man-tam-day']) require(path.join(day, f + '.js'));
const ManHoc = require(path.join(day, 'man-khoang-cach.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));

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

const ds = ManHoc.danhSach.filter((m) => m.chuong === 'khoang-cach');
const tatCa = ManHoc.danhSach;
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];

/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải; màn tiết kiệm nhịp sửa riêng, không ghi vào kho). */
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
const man = (so) => ManHoc.timMa('khoang-cach.' + so);
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const bdCua = (m) => (Array.isArray(m.batDau) ? m.batDau : sanCua(m).map(() => m.batDau));

const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const CAM = ['front_clear', 'left_clear', 'right_clear'];
const VEC = SanHoc.VEC;
function chay(rows, bd, loai, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: loai, hamGoc: BANH.concat(CAM) }, extra || {}), code);
}
/** Các lần đọc cảm biến trong vết, theo thứ tự. */
const doc = (kq) => kq.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);

/* ================================================================= 1. LUẬT CẢM BIẾN */
console.log('\n== 1. front_clear / left_clear / right_clear ở mọi loại ô và mọi hướng ==');
{
  const OFF = { front_clear: 0, right_clear: 1, left_clear: 3 };
  // ký hiệu → [xe bánh / omni, xích]: có đi vào được không
  const BANG_KY_HIEU = [
    ['.', true, true], ['#', false, false], ['S', false, true], ['o', false, false], ['D', true, true], ['X', false, false],
    ['>', true, true], ['<', true, true], ['^', true, true], ['v', true, true], ['F', true, true], ['H', false, false], ['h', false, false]
  ];
  let tong = 0, dung = 0, sai = [];
  for (const [ky, banhOmni, xich] of BANG_KY_HIEU) {
    for (const loai of ['banh', 'omni', 'xich']) {
      const mong = loai === 'xich' ? xich : banhOmni;
      for (const h of [0, 1, 2, 3]) for (const ham of Object.keys(OFF)) {
        const rows = Array.from({ length: 5 }, () => '.....'.split(''));
        const d = (h + OFF[ham]) % 4;
        rows[2 + VEC[d][1]][2 + VEC[d][0]] = ky;
        const kq = chay(rows.map((r) => r.join('')), { x: 2, y: 2, huong: h }, loai, ham + '()');
        const e = doc(kq)[0];
        tong++;
        if (e && e.trong === mong && e.huong === d && e.o.x === 2 + VEC[d][0] && e.o.y === 2 + VEC[d][1] && e.tu.x === 2 && e.tu.y === 2 && e.ham === ham && e.cam === 'khoang-cach') dung++;
        else sai.push(ky + '/' + loai + '/h' + h + '/' + ham + ':' + J(e));
      }
    }
  }
  kiem('13 loại ô × 3 loại robot (bánh, omni, xích) × 4 hướng mặt × 3 hàm = ' + tong + ' phép đo đúng (trống: sàn, đích D, băng, cờ; chặn: tường, vật nằm đất o và đích có vật sẵn X (vật chiếm ô, luật 14/10), thùng nặng H / h; bậc thang S chặn bánh và omni nhưng không chặn xích)', dung === tong && tong === 13 * 3 * 4 * 3, sai.slice(0, 3).join(' | '));
  // lý do bị chặn
  const lyDo = (ky, loai) => { const rows = ['.....', '.....', '..' + '.' + '..', '.....', '.....']; rows[1] = '..' + ky + '..'; return doc(chay(rows, { x: 2, y: 2, huong: 0 }, loai, 'front_clear()'))[0].vat; };
  kiem('lý do chặn: tường → "tuong", vật nằm đất → "vat", thùng nặng → "thung-nang", bậc thang với xe bánh → "bac-thang", ô trống → null',
    lyDo('#', 'banh') === 'tuong' && lyDo('o', 'banh') === 'vat' && lyDo('o', 'xich') === 'vat' && lyDo('H', 'banh') === 'thung-nang' && lyDo('h', 'banh') === 'thung-nang' && lyDo('S', 'banh') === 'bac-thang' && lyDo('S', 'omni') === 'bac-thang' && lyDo('.', 'banh') === null && lyDo('S', 'xich') === null);
  // mép sân
  const mep = chay(['...', '...', '...'], { x: 0, y: 0, huong: 0 }, 'banh', 'front_clear()\nleft_clear()\nright_clear()');
  const dm = doc(mep);
  kiem('mép sân: trên (0,0) mặt lên → trước False "ngoai-san", trái False "ngoai-san", phải True', dm.length === 3 && dm[0].trong === false && dm[0].vat === 'ngoai-san' && dm[1].trong === false && dm[1].vat === 'ngoai-san' && dm[2].trong === true && dm[2].o.x === 1, J(dm));
  const mep2 = chay(['...', '...', '...'], { x: 2, y: 2, huong: 2 }, 'banh', 'front_clear()\nleft_clear()\nright_clear()');
  const dm2 = doc(mep2);
  kiem('mép sân: góc dưới phải, mặt xuống → trước False, trái (phía đông) False, phải (phía tây) True', dm2[0].trong === false && dm2[1].trong === false && dm2[2].trong === true && dm2[2].o.x === 1, J(dm2));
  // cảm biến theo hướng mặt hiện tại
  const quay = chay(['.....', '..#..', '.....', '.....', '.....'], { x: 2, y: 2, huong: 0 }, 'banh', L('front_clear()', 'left_move()', 'wait()', 'front_clear()', 'right_move()', 'wait()', 'front_clear()'));
  const dq = doc(quay);
  kiem('cảm biến theo hướng mặt NGAY LÚC ĐỌC: mặt lên → chặn bởi tường; quay phải → trống; quay trái lại → chặn', dq.length === 3 && dq[0].trong === false && dq[1].trong === true && dq[2].trong === false && dq[1].huong === 1, J(dq));
  // nhận lệnh tiến rồi đọc ngay mà chưa wait(): đọc ở trạng thái hiện tại
  const chuaWait = chay(['.....', '..#..', '.....', '.....', '.....'], { x: 2, y: 3, huong: 0 }, 'banh', L('left_move()', 'right_move()', 'front_clear()', 'wait()', 'front_clear()'));
  const dcw = doc(chuaWait);
  kiem('đọc khi còn lệnh bánh chưa wait(): xe vẫn ở ô cũ (chưa tiến), thấy ô trước mặt TRƯỚC khi lệnh chạy; sau wait() xe đã tiến một ô nên đọc lại thấy tường', dcw[0].tu.y === 3 && dcw[0].trong === true && dcw[1].tu.y === 2 && dcw[1].trong === false, J(dcw));
}

console.log('\n== 2. Đọc cảm biến không tốn nhịp; sự kiện doc-cam-bien; trả về True / False cho chương trình ==');
{
  const bd = { x: 1, y: 4, huong: 0 };
  const rows = ['###', '#F#', '#.#', '#.#', '#.#'];
  const r = chay(rows, bd, 'banh', L(...Array(50).fill('front_clear()')));
  kiem('50 lần đọc không tốn nhịp nào (nhịp 0), xe đứng yên, soLanDoc 50', r.nhip === 0 && r.robot.y === 4 && r.soLanDoc === 50 && doc(r).length === 50 && nhipVet(r).length === 0, r.nhip + ' ' + r.soLanDoc);
  kiem('đọc cảm biến KHÔNG đưa lệnh vào hàng chờ (không quen-wait)', maSK(r, 'quen-wait').length === 0 && r.lenhTon.length === 0);
  kiem('lần đọc cuối sau nhịp chót nằm trong docConLai (tối đa 50 sự kiện gắn vào một nhịp)', r.docConLai.length === 50 && r.docConLai.every((e) => e.ma === 'doc-cam-bien'));
  const m = chay(rows, bd, 'banh', L('while front_clear():', '    left_move()', '    right_move()', '    wait()'));
  kiem('while front_clear(): tiến — xe tới cờ sau 3 nhịp, đọc 3 lần (lần đọc thứ ba xảy ra trước nhịp ba)', m.thang && m.nhip === 3 && m.soLanDoc === 3, m.nhip + ' ' + m.soLanDoc);
  const nv = nhipVet(m);
  kiem('sự kiện doc-cam-bien gắn vào nhịp KẾ TIẾP sau lần đọc, đứng trước sự kiện của nhịp (nhịp 1: đọc ở y=4 rồi "tien")',
    nv[0].suKien[0].ma === 'doc-cam-bien' && nv[0].suKien[0].tu.y === 4 && nv[0].suKien[0].trong === true && nv[0].suKien[1].ma === 'tien' && nv[2].suKien[0].tu.y === 2, J(nv.map((x) => x.suKien.map((e) => e.ma))));
  kiem('vết lệnh của front_clear có docCamBien (ma, cam, ham, tu, huong, o, trong, vat, nhip) và đúng thứ tự xen kẽ với nhịp',
    (() => { const l = m.vet.filter((e) => e.ten === 'front_clear')[0]; const d = l.docCamBien; return d && d.ma === 'doc-cam-bien' && d.cam === 'khoang-cach' && d.ham === 'front_clear' && d.huong === 0 && d.o.y === 3 && d.trong === true && d.vat === null && d.nhip === 0 && d.tu.x === 1; })());
  // trả True / False cho nhân: dùng được trong biểu thức
  const tf = chay(['.....', '..#..', '.....', '.....', '.....'], { x: 2, y: 2, huong: 0 }, 'banh', L('a = front_clear()', 'if a == 0:', '    left_move()', '    wait()', 'b = front_clear()', 'if b:', '    left_move()', '    right_move()', '    wait()'));
  kiem('front_clear() trả về 0 / 1 như False / True: so sánh == 0, gán vào biến, dùng trong if', tf.robot.huong === 1 && tf.robot.x === 3 && tf.nhip === 2, J(tf.robot));
  const kn = chay(['.....', '..#..', '.....', '.....', '.....'], { x: 2, y: 2, huong: 0 }, 'banh', L('if not front_clear() and right_clear():', '    left_move()', '    wait()', 'if front_clear() or left_clear():', '    right_move()', '    wait()'));
  kiem('dùng not / and / or với các hàm cảm biến', kn.nhip === 2 && kn.robot.huong === 0, J(kn.robot) + ' ' + kn.nhip);
  // 1000 lần đọc liên tiếp chưa có nhịp → dừng
  const ok1000 = chay(rows, bd, 'banh', 'for i in range(1000):\n    front_clear()\nleft_move()\nright_move()\nwait()');
  kiem('1000 lần đọc liên tiếp vẫn chưa bị chặn (giới hạn là quá 1000)', ok1000.loi === null && ok1000.nhip === 1 && ok1000.soLanDoc === 1000, J(ok1000.loi));
  const vo = chay(rows, bd, 'banh', 'while front_clear():\n    pass');
  kiem('while front_clear(): pass — đọc quá 1000 lần không có nhịp thì dừng, loi infinite-loop (không phải đợi hết ngân sách 20000 lệnh)', vo.loi && vo.loi.loai === 'infinite-loop' && vo.soLanDoc === 1001 && vo.nhip === 0, J(vo.loi) + ' ' + vo.soLanDoc);
  const vo2 = chay(rows, bd, 'banh', 'while front_clear():\n    wait()');
  kiem('while front_clear(): wait() — có nhịp nên chạy tới nhipToiDa 200 rồi qua-nhieu-nhip', vo2.loi && vo2.loi.loai === 'qua-nhieu-nhip' && vo2.nhip === 200, J(vo2.loi));
}

console.log('\n== 3. Robot không có cảm biến; nhện không gắn cảm biến ==');
{
  const chua = chay(['...', '...'], { x: 1, y: 1, huong: 0 }, 'banh', 'front_clear()', { hamGoc: BANH });
  kiem('hamGoc không có front_clear mà chương trình gọi: nhân báo chưa có hàm (runtime-error)', chua.loi && chua.loi.loai === 'runtime-error' && /front_clear/.test(chua.loi.thongDiep), J(chua.loi));
  const m41 = ManHoc.timMa('vong-lap.1');
  const r = ChamHoc.cham(m41, { chinh: ['front_clear()'] }, []);
  kiem('qua máy chấm (chương vong-lap, không có cảm biến): chua-gan-cam-bien, nói thẳng robot chưa gắn cảm biến khoảng cách, nêu hàm gốc dùng được',
    maCua(r).join() === 'chua-gan-cam-bien' && /chưa gắn cảm biến khoảng cách/.test(r.chanDoan[0].loi) && /front_clear\(\)/.test(r.chanDoan[0].loi) && /left_move/.test(r.chanDoan[0].loi) && r.chanDoan[0].ten === 'front_clear', J(r.chanDoan));
  const m1 = man(1);
  const r2 = ChamHoc.cham(m1, { chinh: ['if right_clear():', '    move()'] }, khoTruoc('8.1'));
  kiem('qua máy chấm (6.1 chỉ mở front_clear): gọi right_clear → chua-gan-cam-bien, nói màn này mới dùng được front_clear()',
    maCua(r2).join() === 'chua-gan-cam-bien' && /mới dùng được front_clear\(\)/.test(r2.chanDoan[0].loi) && !/chưa gắn cảm biến khoảng cách/.test(r2.chanDoan[0].loi), J(r2.chanDoan));
  const r3 = ChamHoc.cham(man(7), { chinh: ['if rigth_clear():', '    move()'] }, khoTruoc('8.7'));
  kiem('gõ sai tên hàm cảm biến (rigth_clear) vẫn là ham-chua-co như mọi hàm lạ', maCua(r3).join() === 'ham-chua-co', J(r3.chanDoan));
  const nhenLoi = (() => { try { SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'nhen', hamGoc: ['go_up', 'wait', 'front_clear'] }, 'wait()'); return false; } catch (e) { return /Nhện/.test(e.message); } })();
  kiem('nhện không có hướng mặt nên không gắn cảm biến: cấu hình sai bị từ chối', nhenLoi);
  const sai = (() => { try { SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: ['wait', 'front_clear', 'sensor_clear'] }, 'wait()'); return false; } catch (e) { return true; } })();
  kiem('hàm gốc lạ vẫn bị từ chối (chỉ front_clear / left_clear / right_clear được thêm)', sai);
  kiem('cảm biến là hàm gốc của kho: không đặt tên hàm của em trùng front_clear / left_clear / right_clear', CAM.every((t) => KhoHam.moi().kiemTen(t).ma === 'ten-trung-ham-goc'));
}

/* ======================================================== 4. VÒNG LẶP VÔ HẠN: LỜI CHẨN ĐOÁN */
console.log('\n== 4. Vòng while chạy mãi: vong-vo-han ==');
{
  const m2 = man(2);
  const kho = khoTruoc('8.2');
  const a = ChamHoc.cham(m2, { chinh: ['while front_clear():', '    pass'] }, kho);
  kiem('while front_clear(): pass → vong-vo-han (loaiCore infinite-loop), trỏ đúng dòng while của chương trình, không thắng, 0 sao',
    maCua(a).join() === 'vong-vo-han' && a.chanDoan[0].loaiCore === 'infinite-loop' && a.chanDoan[0].cho.cot === 'chinh' && a.chanDoan[0].cho.dong === 1 && !a.thang && a.sao === 0, J(a.chanDoan));
  const b = ChamHoc.cham(m2, { chinh: ['while front_clear():', '    wait()'] }, kho);
  kiem('while front_clear(): wait() → vong-vo-han (loaiCore qua-nhieu-nhip), kèm số nhịp và trỏ dòng while',
    maCua(b).join() === 'vong-vo-han' && b.chanDoan[0].loaiCore === 'qua-nhieu-nhip' && b.chanDoan[0].nhip === 200 && b.chanDoan[0].cho.dong === 1, J(b.chanDoan));
  const c = ChamHoc.cham(m2, { chinh: ['x = 1', 'while True:', '    x += 1'] }, kho);
  kiem('while True với thân không có lệnh robot → vong-vo-han ở dòng 2 (dòng while, không phải dòng thân)', maCua(c).join() === 'vong-vo-han' && c.chanDoan[0].cho.dong === 2, J(c.chanDoan));
  const d = ChamHoc.cham(ManHoc.timMa('vong-lap.1'), { chinh: LAP500() }, []);
  kiem('quá nhịp mà chương trình KHÔNG có while vẫn là qua-nhieu-nhip', maCua(d).join() === 'qua-nhieu-nhip', J(d.chanDoan));
  const e = ChamHoc.cham(man(8), man(8).maMau, khoTruoc('8.8'));
  kiem('6.8 chạy maMau (while True: move()): vong-vo-han ở dòng 1 của chương trình, kèm dam-tuong (xe húc tường), không thắng ở sân nào',
    maCua(e).includes('vong-vo-han') && maCua(e).includes('dam-tuong') && e.theoSan.every((s) => !s.thang) && e.chanDoan.find((x) => x.ma === 'vong-vo-han').cho.dong === 1, J(maCua(e)));
  const msgs = [a, b, c, e].map((r) => r.chanDoan.find((x) => x.ma === 'vong-vo-han').loi);
  kiem('lời vong-vo-han bằng tiếng Việt, ≤ 330 ký tự, nói điều kiện không bao giờ sai, KHÔNG nói đáp án (không nhắc front_clear, move, True hay not)',
    msgs.every((s) => s.length <= 330 && /vòng while chạy mãi|vòng while vẫn chưa dừng/.test(s) && /điều kiện không bao giờ sai/.test(s) && !/front_clear|move\(|True|not /.test(s)), msgs.map((s) => s.length).join());
  const g = ChamHoc.thuHam(man(5), { chinh: [] }, 'go_wall', [H('go_wall', ['while front_clear():', '    wait()'])], { nhipToiDa: 20 });
  kiem('sân thử của Xưởng: hàm có vòng while chạy mãi → vong-vo-han, dừng ở nhipToiDa', maCua(g).join() === 'vong-vo-han' && g.soNhip === 20, J(g.chanDoan));
}
function LAP500() { return ['for i in range(500):', '    wait()']; }

/* ================================================================= 5. NHIỀU SÂN */
console.log('\n== 5. Chấm nhiều sân: thắng tất cả; tổng nhịp; cứng số bước ==');
{
  const kho = (id) => khoTruoc(id);
  // 5a: thắng tất cả mới thắng
  const m4 = man(4);
  const khoc = kho('8.4');
  const sanDau = ChamHoc.cham(m4, { chinh: ['move()', 'move()', 'turn_right()', 'move()', 'move()'] }, khoc);
  kiem('6.4: đếm cứng theo sân 1 (2 ô): thắng sân 1, trượt sân 2 và 3 → không thắng, 0 sao', !sanDau.thang && sanDau.sao === 0 && sanDau.theoSan.map((s) => s.thang).join() === 'true,false,false', sanDau.theoSan.map((s) => s.thang).join());
  kiem('chẩn đoán gom từ các sân trượt và ghi rõ sân nào ("Sân 2: …")', sanDau.chanDoan.some((c) => /^Sân 2:/.test(c.loi) && c.san === 1), J(sanDau.chanDoan.map((c) => c.loi.slice(0, 40))));
  kiem('vet lấy từ sân trượt đầu tiên (sân 2), robot nằm trong sân đó', J(sanDau.vet) === J(sanDau.theoSan[1].vet));
  // 5b: nhịp tính theo tổng
  const tot = ChamHoc.cham(m4, m4.loiGiai, khoc);
  kiem('lời giải: soNhip = TỔNG nhịp mọi sân (5 + 7 + 8 = 20); nhipMax = 8; nhipTong = 20; nhịp từng sân đủ trong theoSan', tot.soNhip === 20 && tot.nhipTong === 20 && tot.nhipMax === 8 && tot.theoSan.map((s) => s.soNhip).join() === '5,7,8', J([tot.soNhip, tot.nhipTong, tot.nhipMax]));
  const mMax = Object.assign({}, m4, { nhipTheo: undefined });
  const totMax = ChamHoc.cham(mMax, m4.loiGiai, khoc);
  kiem('không khai nhipTheo thì soNhip là nhịp của sân dài nhất (8) — hành vi mặc định của máy chấm nhiều sân giữ nguyên', totMax.soNhip === 8 && totMax.nhipTong === 20, J([totMax.soNhip, totMax.nhipTong]));
  // 5c: k bước thẳng cứng, rồi rẽ phải và hai ô
  const cungK = (k) => ChamHoc.cham(m4, { chinh: LAPK(k).concat(['turn_right()', 'move()', 'move()']) }, khoc);
  const ketQuaK = [];
  for (let k = 0; k <= 7; k++) { const r = cungK(k); ketQuaK.push(k + ':' + (r.thang ? r.sao + 'sao/' + r.soNhip : 'trượt')); }
  kiem('6.4: viết cứng k bước (k = 0…7) rồi rẽ phải đi hai ô: k < 5 trượt ít nhất một sân; k ≥ 5 thắng nhưng thừa bước húc tường nên tổng nhịp > 20, không bao giờ 3 sao',
    [0, 1, 2, 3, 4, 5, 6, 7].every((k) => { const r = cungK(k); return k < 5 ? !r.thang : (r.thang && r.soNhip > 20 && r.sao < 3 && maCua(r).includes('dam-tuong')); }), ketQuaK.join(' '));
  kiem('6.4: dùng while front_clear() đi đúng số ô ở từng sân → 3 sao; thay while bằng if → chỉ đi một ô → trượt',
    tot.sao === 3 && !ChamHoc.cham(m4, { chinh: ['if front_clear():', '    move()', 'turn_right()', 'move()', 'move()'] }, khoc).thang);
  // 5d: kiểm chung cho các màn nhiều sân (4–10): lời giải thắng mọi sân; lời giải cứng số lấy từ một sân không bao giờ 3 sao
  const bang = [];
  for (const m of ds.filter((x) => x.so >= 4)) {
    const kh = kho(m.id);
    const r = ChamHoc.cham(m, m.loiGiai, tron(kh, m.loiGiai.hamCuaEmMoi));
    kiem(m.id + ': lời giải thắng cả 3 sân, 3 sao; soNhip = tổng = sao.nhip (' + m.sao.nhip + ')', r.thang && r.sao === 3 && r.theoSan.length === 3 && r.theoSan.every((s) => s.thang) && r.soNhip === m.sao.nhip && r.nhipTong === m.sao.nhip, J([r.thang, r.sao, r.soNhip]));
    // lệnh gốc mà lời giải đã chạy ở sân i, viết thẳng (không if / while / for): "cứng số"
    const cungLoai = [];
    sanCua(m).forEach((rows, i) => {
      const res = SanHoc.chay({ san: rows, batDau: bdCua(m)[i], loaiRobot: 'banh', hamGoc: m.hamGoc, mucTieu: m.mucTieu || 'toi-co' }, ChamHoc.cham(m, m.loiGiai, tron(kh, m.loiGiai.hamCuaEmMoi)).py);
      const code = res.vet.filter((e) => e.loai === 'lenh' && !e.docCamBien).map((e) => e.ten + '()').join('\n');
      let thangHet = true, tong = 0, trat = [];
      sanCua(m).forEach((rows2, j) => {
        const rj = SanHoc.chay({ san: rows2, batDau: bdCua(m)[j], loaiRobot: 'banh', hamGoc: m.hamGoc, mucTieu: m.mucTieu || 'toi-co' }, code);
        tong += rj.nhip;
        if (!rj.thang) { thangHet = false; trat.push(j + 1); }
      });
      cungLoai.push({ san: i + 1, thangHet, tong, trat });
    });
    kiem(m.id + ': chép thẳng dãy lệnh bánh đã chạy ở sân 1 / 2 / 3 rồi chạy ở mọi sân — hoặc trượt ít nhất một sân, hoặc thắng hết nhưng tổng nhịp > sao.nhip (không bao giờ 3 sao nhịp)',
      cungLoai.every((c) => !c.thangHet || c.tong > m.sao.nhip), J(cungLoai));
    kiem(m.id + ': với dãy lệnh cứng chép từ mỗi sân, có ít nhất một sân trượt các sân kia (sân ngắn nhất không đủ cho các sân dài)', cungLoai.some((c) => !c.thangHet), J(cungLoai));
    bang.push({ id: m.id, ten: m.ten, cungLoai });
  }
  // 5e: sân khác nhau thật (tường đặt khác), cùng khung
  kiem('mỗi màn nhiều sân: 3 sân khác nhau từng ô, cùng kích thước, đều ≤ 7×7', ds.filter((x) => x.so >= 4).every((m) => new Set(m.san.map((s) => s.join('/'))).size === 3 && m.san.every((s) => s.length === m.san[0].length && s[0].length === m.san[0][0].length && s.length <= 7 && s[0].length <= 7)));
  // 5f: chung chương trình
  const m5 = man(5), k5 = kho('8.5');
  const doiSan = ChamHoc.cham(m5, { chinh: ['go_wall()', 'turn_right()', 'go_wall()', 'turn_right()', 'go_wall()'] }, tron(k5, [H('go_wall', ['while front_clear():', '    move()'])]));
  kiem('6.5: một go_wall() dùng ở cả ba sân: hamDaDung gồm go_wall, move, turn_right (mỗi hàm tính một lần theo HỢP ba sân)', doiSan.sao === 3 && J(doiSan.hamDaDung) === J(['move', 'turn_right', 'go_wall']), J(doiSan.hamDaDung));
  const khongHam = ChamHoc.cham(m5, { chinh: m5.loiGiaiKhac.baiLam.chinh.slice(0, 0).concat(['while front_clear():', '    move()', 'turn_right()', 'while front_clear():', '    move()', 'turn_right()', 'while front_clear():', '    move()']) }, tron(k5, []));
  kiem('6.5 (canHam mat-sao): không dùng go_wall mà viết thẳng ba vòng while vẫn vừa khung và thắng nhưng nhiều ô hơn (13 > 12) → 2 sao', khongHam.thang && khongHam.soO === 13 && khongHam.sao === 2 && m5.canHam === 'mat-sao', J([khongHam.thang, khongHam.soO, khongHam.sao]));
}
function LAPK(k) { return k ? ['for i in range(' + k + '):', '    move()'] : []; }

/* ========================================================= 6. CỜ chanWhile Ở MÀN 1 */
console.log('\n== 6. Màn 1 chưa dạy while; từ màn 2 dùng được ==');
{
  const r = ChamHoc.cham(man(1), { chinh: ['while front_clear():', '    move()'] }, khoTruoc('8.1'));
  kiem('6.1: dùng while → chỉ cau-truc-chua-hoc (không chạy, 0 sao), nêu "vòng lặp while" và dòng 1', maCua(r).join() === 'cau-truc-chua-hoc' && /vòng lặp while/.test(r.chanDoan[0].loi) && r.chanDoan[0].dong === 1 && r.sao === 0 && r.vet.length === 0, J(r.chanDoan));
  const ok = ChamHoc.cham(man(2), man(2).loiGiai, khoTruoc('8.2'));
  kiem('6.2: while được dùng, 3 sao', ok.sao === 3 && ok.chanDoan.length === 0);
  kiem('6.1: khung khai chanWhile, cauTruc ["for","if"]; 6.2–6.10 cauTruc ["for","if","while"], không chanWhile', man(1).khung.chanWhile === true && J(man(1).cauTruc) === '["for","if"]' && ds.slice(1).every((m) => J(m.cauTruc) === '["for","if","while"]' && m.khung.chanWhile === undefined));
  const cu = ChamHoc.cham(ManHoc.timMa('tham-so.2'), { chinh: ['forward(3)'] }, tron(khoTruoc('12.2'), []));
  kiem('các chương cũ không bị chặn while (chanWhile chỉ ở 6.1): 8.2 vẫn dùng được while thay for', ManHoc.timMa('tham-so.2').khung.chanWhile === undefined && !maCua(cu).includes('cau-truc-chua-hoc'));
}

/* ====================================================== 7. HÀM go_wall, CHỮ KÝ, KHO */
console.log('\n== 7. Hàm go_wall của em; thử hàm trong Xưởng ==');
{
  kiem('go_wall là hàm cốt truyện tạo ở 6.5 (taoHam), tên bị khóa trong kho và không trùng hàm gốc', J(man(5).taoHam) === '["go_wall"]' && tenCotTruyen.includes('go_wall') && ds.filter((m) => m.so !== 5).every((m) => m.taoHam.length === 0));
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  kiem('trước 6.5 không đặt được tên go_wall (ten-danh-cho-cot-truyen); ở 6.5 (taoHam) thì đặt được', kho.tao('go_wall', []).ma === 'ten-danh-cho-cot-truyen' && kho.tao('go_wall', [], { taoHam: ['go_wall'] }).ok);
  const t = ChamHoc.thuHam(man(5), { chinh: [] }, 'go_wall', tron(khoTruoc('8.5'), [H('go_wall', ['while front_clear():', '    move()'])]));
  kiem('thử go_wall trong sân thử 5×5 mặc định (xe ở giữa, mặt lên): đi hai ô tới mép trên, 2 nhịp, không chẩn đoán', t.robot.x === 2 && t.robot.y === 0 && t.soNhip === 2 && t.chanDoan.length === 0, J([t.robot, t.soNhip, t.chanDoan]));
  const tt = ChamHoc.thuHam(man(5), { chinh: [] }, 'go_wall', tron(khoTruoc('8.5'), [H('go_wall', ['while front_clear():', '    move()'])]), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 4, huong: 0 }, tuong: [{ x: 2, y: 1 }] } });
  kiem('sân thử có tường: go_wall dừng sát tường (xe ở (2,2)), 2 nhịp', tt.robot.y === 2 && tt.soNhip === 2 && tt.chanDoan.length === 0, J(tt.robot));
}

/* ========================================================== 8. DỮ LIỆU 10 MÀN + BẢNG */
console.log('\n== 8. Dữ liệu 10 màn ==');
{
  kiem('đúng 10 màn, id 8.1…8.10, mã khoang-cach.1…10, chương đứng thứ 6 sau vong-lap (đợt 1; chương cổng mở đợt 2 là robot-hoan-thien, chương 10), tên "Cảm biến khoảng cách"',
    ds.length === 10 && ds.every((m, i) => m.so === i + 1 && m.id === '8.' + (i + 1) && m.ma === 'khoang-cach.' + (i + 1)) && ThuTu.thuTu[7] === 'khoang-cach' && ThuTu.thuTu[5] === 'vong-lap' && ThuTu.congDot2 === 'robot-hoan-thien' && !ThuTu.laDot2('khoang-cach') && ThuTu.ten['khoang-cach'] === 'Cảm biến khoảng cách');
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ màn 10 có huy hiệu "khoang-cach"', J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) &&
    ds.every((m) => !!m.huyHieu === (m.so === 10)) && ds[9].huyHieu.ma === 'khoang-cach');
  kiem('hamGoc: 1–6, 8, 9 chỉ mở front_clear; 7 và 10 mở thêm left_clear, right_clear (bám tường); 9 có thêm 4 lệnh tay kẹp; mọi màn đủ 5 lệnh bánh',
    ds.every((m) => BANH.every((t) => m.hamGoc.includes(t)) && m.hamGoc.includes('front_clear') && m.hamGoc.includes('left_clear') === (m.so === 7 || m.so === 10) && m.hamGoc.includes('right_clear') === (m.so === 7 || m.so === 10) && m.hamGoc.includes('grab') === (m.so === 9)));
  kiem('robot.camBien = [{ ma: "khoang-cach", o: "hong" }] ở mọi màn; có tay kẹp ("kep") chỉ ở màn 9', ds.every((m) => J(m.robot.camBien) === J([{ ma: 'khoang-cach', o: 'hong' }]) && m.robot.than === 'hai-banh' && (m.robot.tay === 'kep') === (m.so === 9)));
  kiem('6.1–6.3: một sân; 6.4–6.10: ba sân (mảng), batDau mảng 3 phần tử, nhipTheo "tong"', ds.every((m) => (m.so <= 3 ? !Array.isArray(m.san[0]) && !Array.isArray(m.batDau) && m.nhipTheo === undefined : m.san.length === 3 && Array.isArray(m.batDau) && m.batDau.length === 3 && m.nhipTheo === 'tong')));
  kiem('mọi xe xuất phát trong ô đi được; 6.9: vật nằm ở ô NGAY TRƯỚC MẶT xe ở cả ba sân (vật chiếm ô, tay gắp ở ô trước mặt)', ds.every((m) => sanCua(m).every((rows, i) => { const b = bdCua(m)[i]; const c = rows[b.y][b.x]; const v = VEC[b.huong]; return c !== '#' && (m.so !== 9 || (c !== 'o' && rows[b.y + v[1]][b.x + v[0]] === 'o')); })));
  kiem('lời giải: màn 1–3 chỉ dùng cờ chanWhile, mọi màn có loiGiaiKhac đúng 2 sao (kiem-hoc.mjs kiểm chi tiết) và đủ trường mới (robot, nhipTheo, hamGoc)', ds.every((m) => m.loiGiaiKhac && m.loiSai.length >= 4 && m.robot && m.hamGoc.length >= 6));
  kiem('mỗi màn có ít nhất một lời sai báo vong-vo-han hoặc ít nhất một lời sai cứng số trượt sân khác (4–6, 9, 10: cứng số; 2, 5, 7, 8: vong-vo-han)',
    [4, 6, 9, 10].every((so) => man(so).loiSai.some((l) => /cứng|Cứng|Đếm cứng|Viết cứng/.test(l.moTa))) && [2, 5, 7, 8].every((so) => man(so).loiSai.some((l) => l.phaiCoMa.includes('vong-vo-han'))));
}

console.log('\n== Bảng 10 màn chương Cảm biến khoảng cách (lời giải mẫu) ==');
{
  console.log('  màn   | tên                  | sân | ô  | nhịp (tổng = từng sân)     | hàm dùng');
  const OLO = [6, 5, 10, 10, 12, 10, 15, 10, 21, 16], NHIP = [3, 4, 8, 20, 32, 34, 70, 24, 24, 45];
  const kq = [];
  for (const m of ds) {
    const r = ChamHoc.cham(m, m.loiGiai, tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi));
    kq.push(r);
    console.log('  ' + m.id.padEnd(5) + ' | ' + m.ten.padEnd(20) + ' | ' + String(sanCua(m).length).padEnd(3) + ' | ' + String(r.soO).padEnd(2) + ' | ' + (String(r.soNhip) + ' (' + r.theoSan.map((s) => s.soNhip).join('+') + ')').padEnd(26) + ' | ' + r.hamDaDung.join(', '));
  }
  kiem('bảng 10 màn: số ô 6, 5, 10, 10, 12, 10, 15, 10, 21, 16 và số nhịp (tổng) 3, 4, 8, 20, 32, 34, 70, 24, 24, 45 — đều 3 sao', kq.every((r, i) => r.sao === 3 && r.soO === OLO[i] && r.soNhip === NHIP[i]), kq.map((r) => r.soO + '/' + r.soNhip).join(' '));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

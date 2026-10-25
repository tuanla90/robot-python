/* ============================================================================
   kiem-robot-hoan-thien.mjs — máy kiểm chương `robot-hoan-thien` (Robot hoàn thiện, chương 10, cuối đợt 1) của "Học lập trình" (KE-HOACH-CHE-LENH.md, mục 5.4).
   Gồm:
   - bộ dò đường do-duong-robot-hoan-thien.mjs (BFS từng sân, cộng lại): đường BFS đổi thành lệnh gốc rồi chạy SanHoc.chay phải thắng đúng bằng số nhịp BFS;
   - 10 màn: lời giải 3 sao trên MỌI sân (đúng sao.o ô, sao.nhip nhịp, không chẩn đoán), BFS ≤ sao.nhip (chấm theo lời giải chuẩn), mọi congThucKhac thắng, loiGiaiKhac đúng 2 sao,
     loiSai đúng mã (kể cả vòng lặp vô hạn, vượt giới hạn hàm, lệnh hỏng, cảm biến ngược), chương trình rỗng không thắng, viết cứng theo sân đầu không thắng hết các sân;
   - luật riêng từng màn (thùng gần xa khác nhau, ngăn kệ, thùng có màu, số thùng khác nhau, hành lang chữ L, cảm biến / tay lắp ngược, bánh phải kẹt số lùi, trùm ◆ + giới hạn 6 hàm);
   - cổng đợt 2 (ThuTuChuong.congDot2), không thêm hàm mới vào Sổ lệnh, thẻ script của game/choi.html.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs.
   Chạy: node hoc/kiem-robot-hoan-thien.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
const SoLenh = require(path.join(day, 'so-lenh.js'));
for (const f of ['man-chuoi-2', 'man-che-xe', 'man-tay-gap', 'man-che-tay', 'man-vong-lap', 'man-che-lap', 'man-bang-chuyen', 'man-tham-so', 'man-nhen', 'man-xich', 'man-omni', 'man-khoang-cach', 'man-che-cam-bien', 'man-robot-hoan-thien', 'man-mau', 'man-nam-cham', 'man-may-nem']) require(path.join(day, f + '.js'));
const ManHoc = require(path.join(day, 'man-drone.js'));
const { nhipRobotHoanThienSan, nhipRobotHoanThienTatCa, manCuaSan, soSan, chuoiThanhMa } = await import('./do-duong-robot-hoan-thien.mjs');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const maLoi = (kq) => kq.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma);
const tatCa = ManHoc.danhSach;
const che = tatCa.filter((m) => m.chuong === 'robot-hoan-thien');
const man = (so) => ManHoc.timMa('robot-hoan-thien.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];

/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải; màn tiết kiệm nhịp sửa riêng). Kho THẬT: có u_turn một nhịp, turn_right / turn_left bằng bánh lùi. */
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
const chayMan = (m, bai, moi) => ChamHoc.cham(m, bai, tron(khoTruoc(m.id), moi || []));

const BANH_DU = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const BANH_HONG = ['left_move', 'right_move', 'left_back', 'wait'];
const TAY = ['arm_down', 'arm_up', 'grab', 'release'];
const BA_CAM = ['front_clear', 'left_clear', 'right_clear'];
/** Ô (x, y) của sân thứ i: ký tự trong chuỗi sân. */
const oTai = (m, i, x, y) => { const r = m.san[i][y]; return r === undefined ? undefined : r[x]; };
const dsSan = (m) => m.san.map((_, i) => i);

/* ================================================================= 1. DỮ LIỆU CHƯƠNG */
console.log('\n== 1. Chương robot-hoan-thien: dữ liệu ==');
{
  const soChuong = ManHoc.chuong().findIndex((c) => c.ma === 'robot-hoan-thien') + 1;
  kiem('đúng 10 màn, số 1..10, id ' + soChuong + '.1…, mã robot-hoan-thien.1…; chương thứ 10 trong thứ tự (ngay sau che-cam-bien), tên "Robot hoàn thiện", đợt 1 (không nằm trong dot2)',
    che.length === 10 && che.every((m, i) => m.so === i + 1 && m.id === soChuong + '.' + (i + 1) && m.ma === 'robot-hoan-thien.' + (i + 1)) && soChuong === 10 && ThuTu.thuTu.indexOf('robot-hoan-thien') === 9 && ThuTu.thuTu.indexOf('robot-hoan-thien') === ThuTu.thuTu.indexOf('che-cam-bien') + 1 &&
      ThuTu.ten['robot-hoan-thien'] === 'Robot hoàn thiện' && !ThuTu.laDot2('robot-hoan-thien'));
  kiem('tên các màn: Giao hàng, Hàng bỏ quên, Xếp ngăn kệ, Đổi thùng, Dọn dãy thùng, Giao hàng quanh góc, Mắt xe lắp ngược, Tay xe lắp ngược, Kẹt số lùi, Ca làm ở kho; hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu robot-hoan-thien',
    J(che.map((m) => m.ten)) === J(['Giao hàng', 'Hàng bỏ quên', 'Xếp ngăn kệ', 'Đổi thùng', 'Dọn dãy thùng', 'Giao hàng quanh góc', 'Mắt xe lắp ngược', 'Tay xe lắp ngược', 'Kẹt số lùi', 'Ca làm ở kho']) &&
      J(che.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && che.every((m) => !!m.huyHieu === (m.so === 10)) &&
      che[9].huyHieu.ma === 'robot-hoan-thien' && che[9].huyHieu.ten === 'Huy hiệu Robot hoàn thiện');
  kiem('chương ÁP DỤNG: không màn nào bắt chế hàm mới (taoHam rỗng, lời giải không tạo / sửa hàm của em); hàm CỦA MÀN chỉ có ở 10.8 (fixed_pick, fixed_drop cho sẵn, đúng, KHÓA bằng khoaHamMan), các màn khác không có hàm của màn',
    che.every((m) => m.taoHam.length === 0 && m.loiGiai.hamCuaEmMoi.length === 0 && (m.so === 8 ? J(m.khoaHamMan) === '["fixed_pick","fixed_drop"]' && J(m.loiGiai.hamCuaMan.map((h) => h.ten)) === '["fixed_pick","fixed_drop"]' : m.loiGiai.hamCuaMan.length === 0 && m.khoaHamMan === undefined)));
  kiem('xe hai bánh (loaiRobot banh), robot { than "hai-banh", tay "kep", camBien [khoang-cach ở hông] } ở cả 10 màn; Xưởng mở, được dùng hàm của em, chương trình 10 ô, mỗi hàm 10 ô, cauTruc ["for","if","while"] cả ở khung, không chanBien / chanWhile',
    che.every((m) => m.loaiRobot === 'banh' && m.robot.than === 'hai-banh' && m.robot.tay === 'kep' && J(m.robot.camBien) === '[{"ma":"khoang-cach","o":"hong"}]' && m.moXuong === true && m.camHamCuaEm === false && m.khung.chinh === 10 && m.khung.moiHam === 10 &&
      J(m.cauTruc) === '["for","if","while"]' && J(m.khung.cauTruc) === J(m.cauTruc) && m.khung.chanBien === undefined && m.khung.chanWhile === undefined));
  kiem('khay: bánh đủ + 4 lệnh tay + front_clear, left_clear, right_clear (màn 9: không có right_back và phanCung = khay); biến đếm mở ở cả 10 màn (man.bienDem)',
    che.every((m) => J(m.hamGoc) === J((m.so === 9 ? BANH_HONG : BANH_DU).concat(TAY, BA_CAM)) && (m.so === 9 ? J(m.phanCung) === J(m.hamGoc) : m.phanCung === undefined) && m.bienDem === true));
  kiem('mọi màn là MẢNG 3 sân cùng khung, batDau và bongMo song song (mục tiêu bóng mờ), nhipTheo "tong", nhipTheoLoiGiai; sân tối đa 7×7; sân nào cũng có vật nằm đất (o) và không có cờ',
    che.every((m) => Array.isArray(m.san[0]) && m.san.length === 3 && m.san.every((s) => s.length === m.san[0].length && s.every((r) => r.length === m.san[0][0].length) && s.length <= 7 && s[0].length <= 7 && s.join('').includes('o') && !s.join('').includes('F')) &&
      Array.isArray(m.batDau) && m.batDau.length === 3 && m.mucTieu === 'bong-mo' && Array.isArray(m.bongMo) && m.bongMo.length === 3 && m.nhipTheo === 'tong' && m.nhipTheoLoiGiai === true));
  kiem('người chơi TỰ VIẾT chương trình chính ở mọi màn: không chinhCoDinh, maMau.chinh rỗng, không veMaMau; lời giải 1–10 dòng',
    che.every((m) => m.chinhCoDinh === undefined && m.maMau.chinh.length === 0 && m.maMau.hamCuaMan.length === (m.so === 8 ? 2 : 0) && m.veMaMau === undefined && m.loiGiai.chinh.length >= 1 && m.loiGiai.chinh.length <= 10));
  kiem('hỏng / lắp ngược ở hàng biến thể: 7 daoChieu ["cam"] + canhBao "Cảm biến lắp ngược"; 8 daoChieu ["tay"] + canhBao "Dây tay đấu ngược"; 9 phanCung hẹp + canhBao "Bánh phải kẹt số lùi"; màn khác không có daoChieu, canhBao, phanCung',
    J(man(7).daoChieu) === '["cam"]' && man(7).canhBao === 'Cảm biến lắp ngược' && J(man(8).daoChieu) === '["tay"]' && man(8).canhBao === 'Dây tay đấu ngược' &&
      man(9).canhBao === 'Bánh phải kẹt số lùi' && man(9).daoChieu === undefined && che.filter((m) => ![7, 8, 9].includes(m.so)).every((m) => m.daoChieu === undefined && m.canhBao === undefined && m.phanCung === undefined));
  kiem('gioiHanHam chỉ ở 6 (5 hàm) và 10 trùm (6 hàm); đề bài nhắc đúng con số',
    che.every((m) => (m.gioiHanHam !== undefined) === [6, 10].includes(m.so)) && man(6).gioiHanHam === 5 && man(10).gioiHanHam === 6 && /5 hàm/.test(man(6).deBai) && /6 hàm/.test(man(10).deBai));
  // chỉ dùng hàm của chương 2–9 (không nhắc hàm đợt 2)
  const dot2 = new Set(tatCa.filter((m) => ThuTu.laDot2(m.chuong)).flatMap((m) => m.taoHam));
  const dungTen = (b) => (b ? [].concat(b.chinh || [], (b.hamCuaMan || []).flatMap((h) => h.than)) : []).concat((b && b.hamCuaEmMoi) ? [].concat(...b.hamCuaEmMoi.map((h) => h.than)) : []);
  const tatCaCode = (m) => [m.maMau, m.loiGiai, m.loiGiaiKhac, ...(m.congThucKhac || []), ...m.loiSai].flatMap((x) => dungTen(x));
  kiem('không màn nào gọi hàm đợt 2 (' + [...dot2].join(', ') + ') trong lời giải, công thức khác hay lời sai; hamCuaEmCan chỉ gồm hàm chế ở chương 2–9', che.every((m) => tatCaCode(m).every((s) => ![...dot2].some((t) => new RegExp('\\b' + t + '\\(').test(s)))) && che.every((m) => m.hamCuaEmCan.every((t) => !dot2.has(t) && tenCotTruyen.includes(t))));
  kiem('hamCuaEmCan ⊆ kho lúc tới màn, và mọi hàm của em gọi trong lời giải đều có trong hamCuaEmCan',
    che.every((m) => { const ten = khoTruoc(m.id).map((h) => h.ten); const goi = KhungCode.hamEmTrucTiep({ chinh: m.loiGiai.chinh, hamCuaMan: [] }, khoTruoc(m.id)); return m.hamCuaEmCan.every((t) => ten.includes(t)) && goi.every((t) => m.hamCuaEmCan.includes(t)); }));
}

/* ================================================================= 2. BỘ DÒ ĐƯỜNG kiểm chéo với SanHoc.chay */
console.log('\n== 2. Bộ dò đường BFS (do-duong-robot-hoan-thien.mjs) kiểm chéo với SanHoc.chay ==');
{
  for (const m of che) {
    const pc = SanHoc.phanCungCua(m);
    const kq = dsSan(m).map((i) => {
      const b = nhipRobotHoanThienSan(m, i);
      const lm = SanHoc.lopMauCuaSan(m, i);
      const k = SanHoc.chay({ san: m.san[i], batDau: m.batDau[i], loaiRobot: 'banh', hamGoc: m.hamGoc, phanCung: pc, mucTieu: 'bong-mo', bongMo: m.bongMo[i], vatMau: lm.vatMau || undefined, nhipToiDa: 300 }, chuoiThanhMa(b.chuoi, pc));
      return { nhip: b.nhip, thang: k.thang === true, nhipChay: k.nhip, loi: k.loi, cat: b.catNgang };
    });
    kiem(m.id + ': đường BFS của cả ba sân (' + kq.map((x) => x.nhip).join(' + ') + ' nhịp) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng nhịp BFS, không lỗi, không bị cắt ngang', kq.every((x) => x.nhip !== null && !x.cat && x.thang && x.nhipChay === x.nhip && !x.loi), J(kq));
  }
}

/* ================================================================= 3. TỪNG MÀN */
console.log('\n== 3. Từng màn: lời giải 3 sao trên mọi sân, BFS, công thức khác, lời sai ==');
const FAIL = new Set(['lech-bong-mo', 'chua-qua-diem', 'chua-toi-co', 'chua-dua-vat', 'vong-vo-han', 'ham-chua-co', 'lenh-chua-mo', 'lenh-goc-hong', 'tran-khung', 'loi-cu-phap', 'loi-thut-le', 'qua-gioi-han-ham', 'loi-chay', 'cau-truc-chua-hoc', 'qua-nhieu-nhip']);
{
  for (const m of che) {
    const kho = khoTruoc(m.id);
    const khoNay = tron(kho, m.loiGiai.hamCuaEmMoi);
    const r = ChamHoc.cham(m, m.loiGiai, khoNay);
    kiem(m.id + ' ' + m.ten + ': lời giải thắng 3 sao trên CẢ BA sân, ' + r.soO + ' ô = sao.o, ' + r.soNhip + ' nhịp = sao.nhip, không chẩn đoán nào',
      r.thang && r.theoSan.length === 3 && r.theoSan.every((s) => s.thang) && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, theoSan: r.theoSan.map((s) => s.thang), sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    kiem(m.id + ': sao nhịp theo tổng ba sân (' + r.theoSan.map((s) => s.soNhip).join(' + ') + ' = nhipTong ' + r.nhipTong + ' = soNhip), nhipMax là sân dài nhất; ba sân có nhịp KHÁC nhau (không sân nào chỉ là bản sao của sân khác)',
      r.nhipTong === r.theoSan.reduce((a, s) => a + s.soNhip, 0) && r.soNhip === r.nhipTong && r.nhipMax === Math.max(...r.theoSan.map((s) => s.soNhip)) && r.nhipMax < r.nhipTong && new Set(r.theoSan.map((s) => s.soNhip)).size >= 2);
    // BFS
    const bfs = nhipRobotHoanThienTatCa(m), bfsTungSan = dsSan(m).map((i) => nhipRobotHoanThienSan(m, i).nhip);
    kiem(m.id + ': không có ĐƯỜNG TẮT bất hợp lệ — BFS nhịp ngắn nhất (' + bfsTungSan.join(' + ') + ' = ' + bfs + ') ≤ sao.nhip (' + m.sao.nhip + ', chấm theo lời giải chuẩn: pick() / drop() mất 2 nhịp)', bfs !== null && bfs <= m.sao.nhip && bfs > 0, 'BFS = ' + bfs + ', sao.nhip = ' + m.sao.nhip);
    kiem(m.id + ': mỗi sân lời giải chuẩn chạy KHÔNG ít hơn BFS của sân đó (BFS thật sự là cận dưới)', r.theoSan.every((s, i) => s.soNhip >= bfsTungSan[i]), J(r.theoSan.map((s) => s.soNhip)) + ' vs ' + J(bfsTungSan));
    // chương trình rỗng không thắng; bóng mờ nằm trên ô đi được
    kiem(m.id + ': chương trình rỗng không thắng (bóng mờ khác chỗ xuất phát ở cả ba sân); bóng mờ và vật mờ nằm trên ô đi được; xe xuất phát không đứng trên ô có vật',
      !ChamHoc.cham(m, { chinh: [] }, khoNay).thang && m.bongMo.every((bm, i) => { const s = SanHoc.docSan(m.san[i], undefined, undefined); return !SanHoc.lyDoChan(s, 'banh', bm.x, bm.y) && (bm.vat || []).every((v) => !SanHoc.lyDoChan(s, 'banh', v.x, v.y)); }) &&
        dsSan(m).every((i) => oTai(m, i, m.batDau[i].x, m.batDau[i].y) === '.'));
    kiem(m.id + ': bóng mờ có đủ vật mờ: số vật mờ = số thùng (o) của sân, ô vật mờ trên sàn; diQua sáng hết khi thắng', m.bongMo.every((bm, i) => (bm.vat || []).length === m.san[i].join('').split('o').length - 1) && r.theoSan.every((s) => s.diQua.every((q) => q.da)));
    // viết cứng theo sân đầu: chạy đường BFS của sân 0 trên sân 1 và sân 2: không thắng hết
    {
      const pc = SanHoc.phanCungCua(m), code = chuoiThanhMa(nhipRobotHoanThienSan(m, 0).chuoi, pc);
      // chuỗi tối ưu của sân đầu quá dài để viết tay (tràn khung 10 ô); chạy nó ở sân khác thì hoặc không thắng, hoặc thắng nhưng thừa nhịp (xe húc thùng / tường): không còn là đường ngắn nhất của sân đó
      const kq = [1, 2].map((i) => { const lm = SanHoc.lopMauCuaSan(m, i); const k = SanHoc.chay({ san: m.san[i], batDau: m.batDau[i], loaiRobot: 'banh', hamGoc: m.hamGoc, phanCung: pc, mucTieu: 'bong-mo', bongMo: m.bongMo[i], vatMau: lm.vatMau || undefined, nhipToiDa: 300 }, code); return k.thang === true ? k.nhip : 'thua'; });
      kiem(m.id + ': CHỐNG VIẾT CỨNG — chuỗi lệnh tối ưu của sân 1 chạy ở sân 2 và 3 không còn tối ưu (' + kq.join(' / ') + ' so với BFS ' + [1, 2].map((i) => nhipRobotHoanThienSan(m, i).nhip).join(' / ') + ')', kq.every((x, j) => x === 'thua' || x > nhipRobotHoanThienSan(m, j + 1).nhip));
    }
    // công thức khác
    kiem(m.id + ': có ít nhất 1 công thức khác (congThucKhac), mỗi cái khác lời giải chuẩn', Array.isArray(m.congThucKhac) && m.congThucKhac.length >= 1 && m.congThucKhac.every((c) => c.moTa && c.baiLam && J(c.baiLam.chinh) !== J(m.loiGiai.chinh)));
    m.congThucKhac.forEach((c, i) => {
      const rk = ChamHoc.cham(m, c.baiLam, tron(khoNay, c.hamCuaEmMoi));
      kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng cả ba sân, không lỗi — ' + rk.sao + ' sao, ' + rk.soO + ' ô, ' + rk.soNhip + ' nhịp', rk.thang && rk.theoSan.every((s) => s.thang) && maLoi(rk).length === 0, J({ thang: rk.thang, cd: maCua(rk) }));
    });
    // lời giải khác
    const lk = m.loiGiaiKhac, rk2 = ChamHoc.cham(m, lk.baiLam, tron(kho, lk.hamCuaEmMoi));
    kiem(m.id + ': loiGiaiKhac (' + lk.moTa + ') thắng đúng 2 sao, nhiều ô hơn (' + rk2.soO + ' > ' + m.sao.o + '), cùng nhịp', rk2.thang && rk2.sao === 2 && rk2.soO > m.sao.o && rk2.soNhip === m.sao.nhip, J({ sao: rk2.sao, soO: rk2.soO, soNhip: rk2.soNhip }));
    // lời sai
    m.loiSai.forEach((ls, i) => {
      const rs = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi)), co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
      const khongThang = ls.phaiCoMa.some((x) => FAIL.has(x));
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): ' + (khongThang ? 'không thắng' : 'thắng nhưng thiếu sao') + ', có mã ' + ls.phaiCoMa.join('+'),
        rs.sao < 3 && thieu.length === 0 && (khongThang ? !rs.thang : rs.thang), 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · thang ' + rs.thang + ' · sao ' + rs.sao);
    });
    // đề bài, gợi ý
    kiem(m.id + ': đề 1–3 câu, gợi ý 1–2 mục (mỗi mục một câu), không nói tên nút, không gạch dài', m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && m.goiY.every((g) => !/\bnút\b/i.test(g) && (g.match(/[.?!](\s|$)/g) || []).length <= 1) && !/—/.test(m.deBai + m.goiY.join('')), m.deBai);
  }
}

/* ================================================================= 4. LUẬT RIÊNG TỪNG MÀN */
console.log('\n== 4. Luật riêng từng màn ==');
{
  const lenhVao = (kq, i) => kq.theoSan[i].vet.filter((e) => e.loai === 'nhip');
  const r1 = chayMan(man(1), man(1).loiGiai);
  kiem('1: thùng nằm xa gần khác nhau (cách xe 2 / 4 / 1 ô), ô cuối hành lang khác nhau; thả sớm khi tới tường là tha-bi-chan (ô trước mặt là tường)',
    dsSan(man(1)).map((i) => { const bd = man(1).batDau[i]; for (let y = bd.y - 1; y >= 0; y--) if (oTai(man(1), i, bd.x, y) === 'o') return bd.y - y; return -1; }).join() === '2,4,1' && new Set(man(1).bongMo.map((b) => b.vat[0].y)).size === 3 && maCua(chayMan(man(1), man(1).loiSai[0].baiLam)).includes('tha-bi-chan') && r1.theoSan.map((s) => s.soNhip).join() === '10,11,9');
  const m2 = man(2);
  kiem('2: thùng bỏ quên nằm NGAY SAU LƯNG xe ở cả ba sân, ô cuối hành lang khác nhau; chỉ grab_back() (hay u_turn / pick / u_turn) nhặt được; quên nhặt thì xe đi tay không',
    dsSan(m2).every((i) => oTai(m2, i, m2.batDau[i].x, m2.batDau[i].y + 1) === 'o') && new Set(m2.bongMo.map((b) => b.vat[0].y)).size === 3 && !chayMan(m2, m2.loiSai[0].baiLam).thang && chayMan(m2, m2.congThucKhac[0].baiLam).thang);
  const m3 = man(3);
  kiem('3: mỗi sân đúng MỘT ngăn kệ mở bên phải hành lang (ở y = 1 / 3 / 4); to_gap() dừng đúng cửa ngăn; viết cứng số ô chỉ đúng một sân; quên nhặt thùng thì to_gap() húc thùng mãi (vong-vo-han)',
    dsSan(m3).every((i) => { let n = 0; for (let y = 0; y < m3.san[i].length; y++) if (!SanHoc.lyDoChan(SanHoc.docSan(m3.san[i]), 'banh', 2, y)) n++; return n === 1; }) && m3.bongMo.map((b) => b.y).join() === '1,3,4' && maCua(chayMan(m3, m3.loiSai[1].baiLam)).includes('vong-vo-han') &&
      chayMan(m3, m3.loiSai[2].baiLam).theoSan.filter((s) => s.thang).length === 1);
  const m4 = man(4), r4 = chayMan(m4, m4.loiGiai);
  kiem('4: vật mờ CÓ MÀU — thùng xanh dương lên trước, thùng đỏ sang bên phải; lớp vatMau song song với sân (thùng đỏ ở ô trước mặt, thùng xanh ở bên phải chỗ xe dừng); swap() cần ô trống sau lưng nên xe phải đi tới sát thùng; xe về chỗ xuất phát quay xuống',
    m4.bongMo.every((b, i) => b.huong === 2 && b.x === 1 && b.y === 6 && J(b.vat.map((v) => v.mau)) === '["blue","red"]' && b.vat[0].x === 1 && b.vat[1].x === 2 && b.vat[1].y === b.vat[0].y + 1) && Array.isArray(m4.vatMau) && m4.vatMau.length === 3 && m4.vatMau.every((rows) => rows.join('').includes('r') && rows.join('').includes('b')) && r4.thang && ChamHoc.cham(m4, { chinh: ['go_wall()', 'u_turn()', 'go_wall()'] }, khoTruoc(m4.id)).thang === false);
  const m5 = man(5);
  kiem('5: mỗi sân một dãy 2 / 3 / 1 thùng thẳng hàng; ô bên phải mỗi thùng trống để dời sang; vòng while hỏi cảm biến (front_clear) cho đúng ở cả ba sân (nhịp 17 + 23 + 11); đếm cứng ba lần chỉ thắng với nhiều nhịp hơn (thiếu sao); không có vòng thì chỉ dời được một thùng',
    m5.bongMo.map((b) => b.vat.length).join() === '2,3,1' && dsSan(m5).map((i) => m5.san[i].join('').split('o').length - 1).join() === '2,3,1' && chayMan(m5, m5.loiGiai).theoSan.map((s) => s.soNhip).join() === '17,23,11' && (() => { const k = chayMan(m5, m5.loiSai[3].baiLam); return k.thang && k.sao === 2 && k.soNhip > m5.sao.nhip; })() && !chayMan(m5, m5.loiSai[0].baiLam).thang);
  const m6 = man(6);
  kiem('6: hành lang chữ L ba cỡ khác nhau (đi lên 5 / 3 / 1 ô rồi sang phải 2 / 3 / 1 ô); gioiHanHam 5: lời giải gọi đúng 5 hàm khác nhau (pick, go_wall, face_open, back, drop); gọi thêm hàm thứ sáu thì qua-gioi-han-ham; quên nhặt thì face_open() quay mãi',
    KhungCode.hamEmTrucTiep({ chinh: m6.loiGiai.chinh, hamCuaMan: [] }, khoTruoc(m6.id)).sort().join() === 'back,drop,face_open,go_wall,pick' && maCua(chayMan(m6, m6.loiSai[3].baiLam)).includes('qua-gioi-han-ham') && maCua(chayMan(m6, m6.loiSai[2].baiLam)).includes('vong-vo-han') &&
      chayMan(m6, m6.loiGiai).theoSan.map((s) => s.soNhip).join() === '13,12,8' && m6.bongMo.every((b) => b.huong === 1));
  const m7 = man(7), k7 = khoTruoc(m7.id);
  const cu7 = ChamHoc.cham(m7, m7.loiSai[0].baiLam, k7);
  const cd7 = cu7.chanDoan.find((c) => c.ma === 'cam-bien-nguoc');
  kiem('7: cảm biến báo ngược nên go_wall() cũ làm xe đứng yên (cam-bien-nguoc, mức thông tin, nêu front_clear()); lời giải tự viết vòng while có not thắng 3 sao; bỏ chữ not thì vòng không chạy; sân thử của Xưởng cũng báo cảm biến ngược',
    !cu7.thang && !!cd7 && cd7.muc === 'thong-tin' && /front_clear\(\)/.test(cd7.loi) && chayMan(m7, m7.loiGiai).sao === 3 && !chayMan(m7, m7.loiSai[1].baiLam).thang && maCua(ChamHoc.thuHam(m7, { chinh: [] }, 'go_wall', k7)).includes('cam-bien-nguoc'));
  const m8 = man(8), k8 = khoTruoc(m8.id);
  kiem('8: tay lắp ngược — fixed_pick() / fixed_drop() là hàm CỦA MÀN cho sẵn (đúng, khóa: khoaHamMan; người chơi đã học viết chúng ở 5.8 nhưng chúng không còn trong kho) và chạy đúng, pick() / drop() cũ làm kẹp hụt (kep-hut); lời giải dựng lại việc quét ba thùng bằng for + hai hàm của màn',
    !k8.some((h) => h.ten === 'fixed_pick' || h.ten === 'fixed_drop') && !m8.hamCuaEmCan.some((t) => /^fixed_/.test(t)) && J(m8.maMau.hamCuaMan.map((h) => h.ten)) === '["fixed_pick","fixed_drop"]' && J(m8.maMau.hamCuaMan[0].than) === J(['arm_up()', 'grab()', 'wait()', 'arm_down()', 'wait()']) && chayMan(m8, m8.loiGiai).sao === 3 && maCua(chayMan(m8, m8.loiSai[0].baiLam)).includes('kep-hut') && m8.loiGiai.chinh.some((s) => /^for /.test(s)) && !m8.loiGiai.chinh.some((s) => /\b(pick|drop)\(\)/.test(s)));
  const hong8 = chayMan(m8, { chinh: m8.loiGiai.chinh, hamCuaMan: [H('fixed_pick', ['wait()']), H('fixed_drop', ['wait()'])] }), chuan8 = chayMan(m8, m8.loiGiai), thieu8 = chayMan(m8, { chinh: m8.loiGiai.chinh, hamCuaMan: [] });
  kiem('8: hàm của màn khóa: gửi bản sửa bậy (chỉ wait) hay không gửi gì lên thì máy chấm vẫn đặt bản mẫu đúng vào (cùng thắng, 3 sao, cùng ô, cùng nhịp; không ham-chua-co); không có mục Sổ lệnh cho chúng',
    [hong8, thieu8].every((r) => J([r.thang, r.sao, r.soO, r.soNhip]) === J([chuan8.thang, chuan8.sao, chuan8.soO, chuan8.soNhip]) && !maCua(r).includes('ham-chua-co')) && chuan8.thang && chuan8.soO === m8.sao.o && SoLenh.tim('fixed_pick') === null && SoLenh.tim('fixed_drop') === null);
  const m9 = man(9);
  const hong9 = chayMan(m9, m9.loiSai[0].baiLam), cdh = hong9.chanDoan.find((c) => c.ma === 'lenh-goc-hong');
  kiem('9: bánh phải kẹt số lùi — khay và phần cứng không có right_back; fetch_back() / back() cũ báo lenh-goc-hong (nêu "Bánh phải kẹt số lùi"); lời giải đếm bước bằng biến n, quay đầu bằng u_turn() rồi đi lại thắng 3 sao; BFS không dùng bước lùi thẳng',
    !m9.hamGoc.includes('right_back') && !SanHoc.phanCungCua(m9).includes('right_back') && !hong9.thang && !!cdh && /Bánh phải kẹt số lùi/.test(cdh.loi) && maCua(chayMan(m9, m9.loiSai[1].baiLam)).includes('lenh-goc-hong') &&
      chayMan(m9, m9.loiGiai).sao === 3 && m9.loiGiai.chinh.includes('n = 0') && m9.loiGiai.chinh.some((s) => /range\(n\)/.test(s)) && m9.bongMo.every((b) => b.huong === 2 && b.vat[0].y === b.y + 1));
  const m10 = man(10), k10 = khoTruoc(m10.id);
  kiem('10: trùm — gioiHanHam 6 và lời giải gọi đúng 6 hàm khác nhau (go_wall, pass_back, bounce, to_gap, turn_right, fetch_back); ◆ ở đầu hành lang (2,0) nên phải có bounce(); thùng chắn lối phải được dọn ra sau lưng xe; hàm thứ bảy thì qua-gioi-han-ham; rẽ bằng lệnh bánh chỉ còn 5 hàm vẫn thắng',
    KhungCode.hamEmTrucTiep({ chinh: m10.loiGiai.chinh, hamCuaMan: [] }, k10).sort().join() === 'bounce,fetch_back,go_wall,pass_back,to_gap,turn_right' && m10.bongMo.every((b) => J(b.diQua) === '[{"x":2,"y":0}]' && b.vat.length === 2 && b.huong === 1) &&
      maCua(chayMan(m10, m10.loiSai[2].baiLam)).includes('qua-gioi-han-ham') && maCua(chayMan(m10, m10.loiSai[0].baiLam)).includes('chua-qua-diem') && maCua(chayMan(m10, m10.loiSai[1].baiLam)).includes('vong-vo-han') &&
      chayMan(m10, m10.congThucKhac[0].baiLam).thang && KhungCode.hamEmTrucTiep({ chinh: m10.congThucKhac[0].baiLam.chinh, hamCuaMan: [] }, k10).length === 5);
  kiem('10: thùng chắn lối (hàm thứ nhất) ở y = 4 / 3 / 4, cửa nhánh ở y = 2 / 1 / 3 (phía trên thùng chắn), nhánh dài 2 / 3 / 3 ô, thùng hàng ở cuối nhánh; vật mờ: thùng chắn lối nằm sau lưng chỗ xe dừng, thùng nhánh nằm ở ô đầu nhánh',
    m10.bongMo.map((b) => b.y).join() === '2,1,3' && m10.bongMo.map((b) => b.vat[1].x + ',' + b.vat[1].y).join(';') === '3,2;3,1;3,3' && m10.bongMo.map((b) => b.vat[0].x + ',' + b.vat[0].y).join(';') === '2,6;2,5;2,6');
}

/* ================================================================= 5. CỔNG ĐỢT 2, SỔ LỆNH, THẺ SCRIPT */
console.log('\n== 5. Cổng đợt 2, Sổ lệnh, game/choi.html ==');
{
  kiem('chương cổng mở đợt 2 là robot-hoan-thien (ThuTuChuong.congDot2), không còn là khoang-cach; dot2 là mọi chương sau chương cổng và không chứa chương cổng; trùm của chương này (robot-hoan-thien.10) là màn có huy hiệu',
    ThuTu.congDot2 === 'robot-hoan-thien' && !ThuTu.dot2.includes(ThuTu.congDot2) && ThuTu.thuTu.indexOf(ThuTu.congDot2) === 9 && ThuTu.thuTu.slice(10).join() === ThuTu.dot2.join() && !!man(10).huyHieu);
  kiem('chương không thêm hàm cốt truyện: Sổ lệnh không có mục nào của chương robot-hoan-thien; mọi hàm cốt truyện (taoHam) của cả game vẫn có mặt trong Sổ lệnh',
    SoLenh.theoChuong('robot-hoan-thien').length === 0 && tenCotTruyen.every((t) => SoLenh.tim(t)));
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có đúng một thẻ script ../man-robot-hoan-thien.js, nạp sau man-che-cam-bien.js và sau thu-tu-chuong.js, có file trên đĩa; bang-mo-khoa.js được nạp', tags.filter((t) => t === '../man-robot-hoan-thien.js').length === 1 && vtri('man-robot-hoan-thien.js') > vtri('man-che-cam-bien.js') && vtri('man-robot-hoan-thien.js') > vtri('thu-tu-chuong.js') && fs.existsSync(path.join(day, 'man-robot-hoan-thien.js')) && tags.some((t) => /bang-mo-khoa\.js$/.test(t)));
}

/* ================================================================= BẢNG */
console.log('\n  Bảng 10 màn robot-hoan-thien (lời giải cách 1, sao)');
console.log('  màn  | tên                  | ô  | nhịp (ba sân)    | BFS | lời giải (chương trình chính)');
for (const m of che) {
  const kho = tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi), r = ChamHoc.cham(m, m.loiGiai, kho);
  console.log('  ' + m.id.padEnd(5) + '| ' + m.ten.padEnd(20) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + (String(m.sao.nhip) + ' (' + r.theoSan.map((s) => s.soNhip).join('+') + ')').padEnd(16) + ' | ' + String(nhipRobotHoanThienTatCa(m)).padEnd(3) + ' | ' + m.loiGiai.chinh.join(' ; '));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

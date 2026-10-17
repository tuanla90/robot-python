/* ============================================================================
   kiem-che-mau.mjs — máy kiểm chương `che-mau` (Chế lệnh màu, 10 màn) của "Đường học" (KE-HOACH-CHE-LENH.md, mục 5c.4).
   Gồm:
   - 10 màn: lời giải 3 sao trên MỌI sân (kho cổ điển lẫn kho thật), sao.nhip = tổng ba sân, BFS (do-duong-che-mau.mjs) = sao.nhip (hay ≤ khi nhipTheoLoiGiai), mọi congThucKhac thắng,
     loiGiaiKhac đúng 2 sao, loiSai đúng mã, chinhCoDinh, gioiHanHam, khoaHamMan, không hàm có tham số, không trùng tên hàm cốt truyện / hàm của màn;
   - luật riêng từng màn (ô nhiễu, dải màu, vạch kẻ hành lang một lối, camera + vật mờ có màu, lệnh ngược của Đường về, hàm nhìn nhầm màu, cảm biến màu hỏng, trùm 4 hàm);
   - bộ dò đường BFS so chéo với SanHoc.chay (đường BFS đổi thành lệnh gốc, hơn 1000 chương trình ngẫu nhiên, đoạn cố định go_out());
   - Sổ lệnh (nhóm 'mau' ngay sau read_turn), huy hiệu, thẻ script của game/choi.html.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs. Id màn KHÔNG ghi cứng: ThuTu.thuTu.indexOf('che-mau') + 1.
   Chạy: node robotics/hoc/kiem-che-mau.mjs        (trượt thì thoát mã 1)
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
// nạp mọi tệp màn đang có trong thư mục (các chương khác đang được làm song song, có chương mới xóa chương cũ); tệp nào hỏng thì báo rồi bỏ qua
let ManHoc = null;
for (const f of fs.readdirSync(day).filter((x) => /^man-.*[.]js$/.test(x)).sort()) {
  try { ManHoc = require(path.join(day, f)); } catch (e) { console.log('  (không nạp được ' + f + ': ' + String(e.message).split('\n')[0] + ')'); }
}
const { nhipCheMauSan, nhipCheMauTatCa, manCuaSan, soSan, chuoiThanhMa, buocMotNhip, trangThaiBanDau, daDatDich, BANH_EFFECT } = await import('./do-duong-che-mau.mjs');

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
const che = tatCa.filter((m) => m.chuong === 'che-mau');
const man = (so) => ManHoc.timMa('che-mau.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const soChuong = ThuTu.thuTu.indexOf('che-mau') + 1;                     // KHÔNG ghi cứng số chương: id tự tính theo vị trí

// kho "cổ điển": như kiem-hoc.mjs, không nhận các bản SỬA hàm cũ của che-xe, che-tay, robot-hoan-thien, che-nam-cham (u_turn một nhịp, turn_right bằng bánh lùi…)
const CHUONG_SUA = new Set(['che-xe', 'che-tay', 'robot-hoan-thien', 'che-nam-cham']);
function khoTruoc(id, coDien) {
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  for (const m of tatCa) {
    if (m.id === id) break;
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi) {
      if (coDien && CHUONG_SUA.has(m.chuong) && kho.tim(h.ten)) continue;
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
// mã chẩn đoán nghĩa là CHƯA THẮNG (ten-mau-sai, mau-thieu-nhay: chỉ báo khi chưa thắng, san-hoc / cham.js)
const FAIL = new Set(['lech-bong-mo', 'chua-qua-diem', 'chua-toi-co', 'chua-dua-vat', 'vong-vo-han', 'ham-chua-co', 'lenh-chua-mo', 'lenh-goc-hong', 'tran-khung', 'loi-cu-phap', 'loi-thut-le', 'qua-gioi-han-ham',
  'loi-chay', 'cau-truc-chua-hoc', 'qua-nhieu-nhip', 'ten-mau-sai', 'mau-thieu-nhay']);
const L = (...d) => d.join('\n') + '\n';

/* ================================================================= 1. DỮ LIỆU CHƯƠNG */
console.log('\n== 1. Chương che-mau: dữ liệu ==');
{
  kiem('đúng 10 màn, số 1..10, id ' + soChuong + '.1…, mã che-mau.1…; chương nằm ngay sau mau trong thứ tự, tên "Chế lệnh màu", đợt 2',
    che.length === 10 && che.every((m, i) => m.so === i + 1 && m.id === soChuong + '.' + (i + 1) && m.ma === 'che-mau.' + (i + 1)) && ThuTu.thuTu.indexOf('che-mau') === ThuTu.thuTu.indexOf('mau') + 1 && ThuTu.ten['che-mau'] === 'Chế lệnh màu' && ThuTu.laDot2('che-mau'));
  kiem('tên các màn: Dừng ở ô đỏ, Qua dải màu, Đường ba đoạn, Dừng sát vạch, Theo vạch kẻ, Phân loại theo màu, Đường về, Nhìn nhầm màu, Cảm biến màu hỏng, Kho màu; hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu che-mau',
    J(che.map((m) => m.ten)) === J(['Dừng ở ô đỏ', 'Qua dải màu', 'Đường ba đoạn', 'Dừng sát vạch', 'Theo vạch kẻ', 'Phân loại theo màu', 'Đường về', 'Nhìn nhầm màu', 'Cảm biến màu hỏng', 'Kho màu']) &&
      J(che.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && che.every((m) => !!m.huyHieu === (m.so === 10)) && che[9].huyHieu.ma === 'che-mau' && che[9].huyHieu.ten === 'Huy hiệu Chế lệnh màu');
  kiem('lệnh chế ở từng màn (taoHam): to_red, cross, —, stop_line, follow_line, sort_color, —, —, —, —; hàm của màn (go_out, come_back, line_step, trace) KHÔNG vào kho: không taoHam, không hàm của em mới ở lời giải',
    J(che.map((m) => m.taoHam)) === J([['to_red'], ['cross'], [], ['stop_line'], ['follow_line'], ['sort_color'], [], [], [], []]) && che.every((m) => m.loiGiai.hamCuaEmMoi.every((h) => m.taoHam.includes(h.ten))) &&
      [7, 8, 9].every((i) => man(i).loiGiai.hamCuaEmMoi.length === 0 && man(i).congThucKhac.every((c) => !c.hamCuaEmMoi || c.hamCuaEmMoi.length === 0)));
  kiem('xe hai bánh (loaiRobot banh, than hai-banh), Xưởng mở, được dùng hàm của em, chương trình 10 ô, mỗi hàm 10 ô, cauTruc ["for","if","while"] cả ở khung; không hàm có tham số nào (khay chưa có bộ chọn màu cho đối số)',
    che.every((m) => m.loaiRobot === 'banh' && m.robot.than === 'hai-banh' && m.moXuong === true && m.camHamCuaEm === false && m.khung.chinh === 10 && m.khung.moiHam === 10 && J(m.cauTruc) === '["for","if","while"]' && J(m.khung.cauTruc) === J(m.cauTruc)) &&
      che.every((m) => [m.maMau, m.loiGiai, m.loiGiaiKhac.baiLam].concat(m.congThucKhac.map((c) => c.baiLam).filter(Boolean)).every((b) => (b.hamCuaMan || []).every((h) => h.thamSo.length === 0)) && m.loiGiai.hamCuaEmMoi.every((h) => h.thamSo.length === 0)));
  const cam = (m) => J(m.robot.camBien);
  kiem('cảm biến: cảm biến màu bụng ở 1–5, 7, 8, 10; camera ở 6; màn 9 có cảm biến màu (hỏng) và cảm biến khoảng cách; tay kẹp ở 6 và 10',
    che.every((m) => (m.so === 6 ? cam(m) === '[{"ma":"camera","o":"tren"}]' : m.so === 9 ? cam(m) === '[{"ma":"mau","o":"hong"},{"ma":"khoang-cach","o":"hong"}]' : cam(m) === '[{"ma":"mau","o":"hong"}]') && m.robot.tay === ([6, 10].includes(m.so) ? 'kep' : null)));
  const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'], TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  kiem('khay: bánh đủ (kể cả hai lệnh lùi) + color (hết trừ màn 9) + bốn lệnh tay ở 6 và 10; màn 9 chỉ có bánh + front_clear, left_clear, right_clear (hamGoc = phanCung, canhBao "Cảm biến màu hỏng")',
    che.every((m) => J(m.hamGoc) === J(BANH.concat([6, 10].includes(m.so) ? TAY : [], m.so === 9 ? ['front_clear', 'left_clear', 'right_clear'] : ['color']))) && J(man(9).phanCung) === J(man(9).hamGoc) && man(9).canhBao === 'Cảm biến màu hỏng' && che.every((m) => m.so === 9 || (m.phanCung === undefined && m.canhBao === undefined)));
  kiem('mọi màn là MẢNG 3 sân cùng khung (≤ 7 cột × 9 hàng), batDau song song, nhipTheo "tong" (sao nhịp = TỔNG nhịp ba sân); màn bóng mờ có bongMo song song với san',
    che.every((m) => Array.isArray(m.san[0]) && m.san.length === 3 && m.san.every((s) => s.length === m.san[0].length && s.every((r) => r.length === m.san[0][0].length)) && m.san[0].length <= 9 && m.san[0][0].length <= 7 && Array.isArray(m.batDau) && m.batDau.length === 3 && m.nhipTheo === 'tong' &&
      (m.mucTieu === 'bong-mo' ? Array.isArray(m.bongMo) && m.bongMo.length === 3 : m.bongMo === undefined)));
  kiem('mục tiêu: bóng mờ ở 1, 2, 4, 5, 6, 7, 10; tới cờ (có chữ F ở cả ba sân) ở 3, 8, 9',
    che.every((m) => (m.mucTieu === 'bong-mo') === ![3, 8, 9].includes(m.so) && ([3, 8, 9].includes(m.so) ? m.mucTieu === undefined && m.san.every((s) => s.join('').includes('F')) : true)));
  kiem('chinhCoDinh ở mọi màn trừ 3 và 10 (người chơi tự viết chương trình chính); khoaHamMan chỉ ở 7 (go_out); gioiHanHam chỉ ở trùm (4)',
    che.every((m) => (m.chinhCoDinh === true) === ![3, 10].includes(m.so) && (m.so === 7) === (m.khoaHamMan !== undefined) && (m.gioiHanHam !== undefined) === (m.so === 10)) && J(man(7).khoaHamMan) === '["go_out"]' && man(10).gioiHanHam === 4);
  kiem('daoChieu không dùng (chương này không có bộ phận lắp ngược); hỏng chỉ ở màn 9 (phanCung)', che.every((m) => m.daoChieu === undefined) && che.every((m) => (m.phanCung !== undefined) === (m.so === 9)));
  const dsHamMan = che.flatMap((m) => m.maMau.hamCuaMan.map((h) => h.ten));
  const DUONG_VE = ['go_out', 'come_back'];                      // tên hàm của màn chung cho mọi màn "Đường về" (che-xe.7, che-drone.7…): hàm của màn sống riêng trong màn nên trùng tên không sao
  const tenKhac = new Set(tatCa.filter((m) => m.chuong !== 'che-mau').flatMap((m) => m.taoHam.concat(m.maMau.hamCuaMan.map((h) => h.ten), m.loiGiai.hamCuaMan.map((h) => h.ten))).filter((t) => !DUONG_VE.includes(t)));
  const moi = che.flatMap((m) => m.taoHam).concat(dsHamMan);
  const khoCuoi = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  const phamLuat = moi.filter((t) => tenKhac.has(t) || KhoHam.HAM_GOC_MAC_DINH.includes(t) || !khoCuoi.kiemTen(t, undefined, { taoHam: [t] }).ok);
  kiem('tên hàm mới (' + moi.join(', ') + ') không trùng hàm cốt truyện / hàm của màn nào của chương khác, không là hàm gốc hay từ khóa, hợp lệ làm tên hàm; không trùng nhau trong chương', phamLuat.length === 0 && new Set(moi).size === moi.length, phamLuat.join());
  kiem('hàm của màn (go_out, come_back, line_step, trace) không là hàm cốt truyện: không trong taoHam của màn nào, không trong Sổ lệnh, không trong hamCuaEmCan, không trong kho cuối game',
    ['go_out', 'come_back', 'line_step', 'trace'].every((t) => tatCa.every((m) => !m.taoHam.includes(t) && !m.hamCuaEmCan.includes(t)) && SoLenh.tim(t) === null && !tenCotTruyen.includes(t)) && !khoTruoc('het').some((h) => ['go_out', 'come_back', 'line_step', 'trace'].includes(h.ten)));
  const camHam = new Set(tatCa.filter((m) => m.chuong === 'che-tay' || m.chuong === 'che-lap').flatMap((m) => m.taoHam));
  kiem('hamCuaEmCan chỉ gồm hàm có từ trước chương này (kho lúc tới màn) và hàm chế trong chính chương: kiểm bằng kho lúc tới từng màn', che.every((m) => { const k = khoTruoc(m.id, true).map((h) => h.ten); return m.hamCuaEmCan.every((t) => k.includes(t)); }));
  void camHam;
}

/* ================================================================= 2. TỪNG MÀN */
console.log('\n== 2. Từng màn: lời giải 3 sao trên mọi sân, BFS, công thức khác, lời sai ==');
{
  for (const m of che) {
    const kho = khoTruoc(m.id), khoCo = khoTruoc(m.id, true);
    const khoNay = tron(kho, m.loiGiai.hamCuaEmMoi), khoCoNay = tron(khoCo, m.loiGiai.hamCuaEmMoi);
    const r = ChamHoc.cham(m, m.loiGiai, khoCoNay);
    kiem(m.id + ' ' + m.ten + ': lời giải thắng 3 sao trên CẢ BA sân, ' + r.soO + ' ô = sao.o, ' + r.soNhip + ' nhịp = sao.nhip, không chẩn đoán nào (kho cổ điển)',
      r.thang && r.theoSan.length === 3 && r.theoSan.every((s) => s.thang) && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, theoSan: r.theoSan.map((s) => s.thang), sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    const rt = ChamHoc.cham(m, m.loiGiai, khoNay);
    kiem(m.id + ': với kho THẬT (đã có các bản sửa u_turn, turn_right, turn_left của che-xe và che-tay) lời giải vẫn thắng 3 sao, không chẩn đoán lỗi, không chậm hơn sao.nhip', rt.thang && rt.sao === 3 && maLoi(rt).length === 0 && rt.soNhip <= m.sao.nhip, J({ thang: rt.thang, sao: rt.sao, soNhip: rt.soNhip, cd: maCua(rt) }));
    kiem(m.id + ': sao nhịp theo tổng ba sân (nhipTong ' + r.nhipTong + ' = ' + r.theoSan.map((s) => s.soNhip).join(' + ') + ') = soNhip; nhipMax là sân dài nhất', r.nhipTong === r.theoSan.reduce((a, s) => a + s.soNhip, 0) && r.soNhip === r.nhipTong && r.nhipMax === Math.max(...r.theoSan.map((s) => s.soNhip)) && r.nhipMax < r.nhipTong);
    // BFS (cả đoạn cố định)
    const bfs = nhipCheMauTatCa(m, khoCo), bfsTungSan = [0, 1, 2].map((i) => nhipCheMauSan(m, i).nhip);
    const duocTat = m.nhipTheoLoiGiai === true;
    kiem(m.id + ': BFS nhịp ngắn nhất (' + bfsTungSan.join(' + ') + (m.khoaHamMan ? ', tính cả đoạn cố định go_out()' : '') + ' = ' + bfs + ') ' + (duocTat ? '≤ sao.nhip (chấm theo lời giải chuẩn, ' + m.sao.nhip + ')' : '= sao.nhip (' + m.sao.nhip + ')'), duocTat ? (bfs !== null && bfs <= m.sao.nhip) : bfs === m.sao.nhip, 'BFS = ' + bfs + ', sao.nhip = ' + m.sao.nhip);
    if (!duocTat) kiem(m.id + ': mỗi sân lời giải chạy đúng nhịp ngắn nhất của sân đó', r.theoSan.every((s, i) => s.soNhip === bfsTungSan[i]), J(r.theoSan.map((s) => s.soNhip)) + ' vs ' + J(bfsTungSan));
    // chương trình chính
    if (m.chinhCoDinh) {
      const gui = ChamHoc.cham(m, { chinh: ['wait()', 'wait()', 'wait()'], hamCuaMan: m.loiGiai.hamCuaMan }, khoCoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính gửi lên bị bỏ qua (kết quả y hệt lời giải)', J([gui.thang, gui.soO, gui.soNhip, gui.py]) === J([r.thang, r.soO, r.soNhip, r.py]) && m.maMau.chinh.length >= 1 && m.maMau.chinh.length <= m.khung.chinh);
    } else {
      kiem(m.id + ': người chơi tự viết chương trình chính (maMau.chinh rỗng, lời giải 1–10 dòng, bản rỗng không thắng)', m.maMau.chinh.length === 0 && m.loiGiai.chinh.length >= 1 && m.loiGiai.chinh.length <= 10 && !ChamHoc.cham(m, { chinh: [] }, khoCo).thang);
    }
    // bóng mờ / tới cờ
    if (m.mucTieu === 'bong-mo') {
      kiem(m.id + ': bóng mờ của cả ba sân nằm trên ô đi được, kết quả có bongMo; sân cần di chuyển thì toi-bong-mo ghi ở nhịp cuối; ◆ (diQua) sáng hết',
        m.bongMo.every((bm, i) => !SanHoc.lyDoChan(SanHoc.docSan(m.san[i]), 'banh', bm.x, bm.y)) && r.theoSan.every((s, i) => s.bongMo && s.bongMo.x === m.bongMo[i].x && s.bongMo.huong === m.bongMo[i].huong && s.diQua.every((q) => q.da) &&
          (s.soNhip === 0 || s.vet.filter((e) => e.loai === 'nhip').slice(-1)[0].suKien.some((e) => e.ma === 'toi-bong-mo'))));
    } else {
      kiem(m.id + ': mục tiêu tới cờ, bản mẫu (maMau) với kho lúc tới màn (chưa viết / sửa gì) không thắng', ChamHoc.cham(m, m.maMau, khoCo).thang === false);
    }
    // công thức khác
    kiem(m.id + ': có ít nhất 1 công thức khác (congThucKhac), mỗi cái khác cách 1', Array.isArray(m.congThucKhac) && m.congThucKhac.length >= 1 && m.congThucKhac.every((c) => c.moTa && (c.hamCuaEmMoi || c.baiLam) && (J(c.hamCuaEmMoi || []) !== J(m.loiGiai.hamCuaEmMoi) || (c.baiLam && J(c.baiLam) !== J({ chinh: m.loiGiai.chinh, hamCuaMan: m.loiGiai.hamCuaMan })))));
    m.congThucKhac.forEach((c, i) => {
      const rk = ChamHoc.cham(m, c.baiLam || m.loiGiai, tron(khoCo, c.hamCuaEmMoi));
      kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng cả ba sân, không lỗi — ' + rk.sao + ' sao, ' + rk.soO + ' ô, ' + rk.soNhip + ' nhịp', rk.thang && rk.theoSan.every((s) => s.thang) && maLoi(rk).length === 0, J({ thang: rk.thang, cd: maCua(rk) }));
    });
    // lời giải khác
    const lk = m.loiGiaiKhac, rk2 = ChamHoc.cham(m, lk.baiLam, tron(khoCo, lk.hamCuaEmMoi));
    kiem(m.id + ': loiGiaiKhac (' + lk.moTa + ') thắng đúng 2 sao, nhiều ô hơn (' + rk2.soO + ' > ' + m.sao.o + '), cùng nhịp', rk2.thang && rk2.sao === 2 && rk2.soO > m.sao.o && rk2.soNhip === m.sao.nhip && J(lk.baiLam) !== J(m.loiGiai), J({ sao: rk2.sao, soO: rk2.soO, soNhip: rk2.soNhip, cd: maCua(rk2) }));
    // lời sai
    m.loiSai.forEach((ls, i) => {
      const rs = ChamHoc.cham(m, ls.baiLam, tron(khoCo, ls.hamCuaEmMoi)), co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
      const khongThang = ls.phaiCoMa.some((x) => FAIL.has(x));
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): ' + (khongThang ? 'không thắng' : 'thắng nhưng thiếu sao') + ', có mã ' + (ls.phaiCoMa.join('+') || '(không mã)'),
        rs.sao < 3 && thieu.length === 0 && (khongThang ? !rs.thang : rs.thang), 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · thang ' + rs.thang + ' · sao ' + rs.sao);
    });
    // đề bài, gợi ý
    const maMauThan = {}; m.maMau.hamCuaMan.forEach((h) => { maMauThan[h.ten] = J(h.than); });
    const tenChe = m.loiGiai.hamCuaEmMoi.map((h) => h.ten).concat(m.loiGiai.hamCuaMan.filter((h) => maMauThan[h.ten] !== J(h.than)).map((h) => h.ten));
    kiem(m.id + ': đề bài nhắc tên lệnh cần chế / sửa (' + (tenChe.join(', ') || 'màn dùng') + ')', tenChe.every((t) => (m.deBai + ' ' + (m.veMaMau || '')).includes(t + '()')), m.deBai);
    kiem(m.id + ': đề 1–3 câu, gợi ý 1–2 câu, không nói tên nút', m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && m.goiY.every((g) => !/\bnút\b/i.test(g)), m.deBai);
    kiem(m.id + ': lời Việt: đề bài và gợi ý không có gạch dài "—", không có tiếng Anh thừa ngoài tên lệnh, màu, hàm', !/—/.test(m.deBai + (m.veMaMau || '') + m.goiY.join('')), m.deBai);
  }
}

/* ================================================================= 3. LUẬT RIÊNG TỪNG MÀN */
console.log('\n== 3. Luật riêng từng màn ==');
{
  const ch = (m, bai, moi) => ChamHoc.cham(m, bai, tron(khoTruoc(m.id, true), moi || []));
  const mauO = (m, i, x, y) => SanHoc.docSan(m.san[i], m.mau && m.mau[i], m.vatMau && m.vatMau[i]).mau[y][x];
  const oMau = (m, i, x, y) => { const s = SanHoc.docSan(m.san[i]); return s.mau ? s.mau[y][x] : null; };
  const thangTungSan = (r) => r.theoSan.map((s) => s.thang).join();
  // ---- 1
  const m1 = man(1);
  const dich1 = m1.bongMo.map((b, i) => oMau(m1, i, b.x, b.y));
  kiem('1: ô đỏ cách xe 2 / 4 / 5 ô, bóng mờ nằm trên ô đỏ ở cả ba sân; có ô màu khác làm nhiễu trên đường (xanh lá, xanh dương, vàng); viết cứng hai ô chỉ đúng sân đầu',
    J(dich1) === '["red","red","red"]' && J(m1.bongMo.map((b, i) => m1.batDau[i].y - b.y)) === '[2,4,5]' && ['green', 'blue', 'yellow'].every((c) => m1.san.some((s, i) => oMau(m1, i, 1, 0) !== c && s.join('').includes({ green: 'g', blue: 'b', yellow: 'y' }[c]))) &&
      thangTungSan(ch(m1, m1.loiSai[0].baiLam, m1.loiSai[0].hamCuaEmMoi)) === 'true,false,false');
  // ---- 2
  const m2 = man(2);
  const dai2 = m2.san.map((rows, i) => { let n = 0; const c0 = oMau(m2, i, 1, 6); for (let y = 6; y >= 0 && oMau(m2, i, 1, y) === c0; y--) n++; return n; });
  kiem('2: xe đứng trên đầu một dải cùng màu dài 3 / 4 / 5 ô, màu mỗi sân một khác (xanh lá, vàng, xanh dương); ô đầu sau dải không màu / đỏ / xanh lá; bóng mờ là ô đầu sau dải',
    J(dai2) === '[3,4,5]' && J(m2.san.map((s, i) => oMau(m2, i, 1, 6))) === '["green","yellow","blue"]' && J(m2.bongMo.map((b, i) => oMau(m2, i, b.x, b.y))) === '[null,"red","green"]' && J(m2.bongMo.map((b, i) => m2.batDau[i].y - b.y)) === '[3,4,5]');
  const r2a = ch(m2, m2.loiSai[0].baiLam, m2.loiSai[0].hamCuaEmMoi), r2b = ch(m2, m2.loiSai[1].baiLam, m2.loiSai[1].hamCuaEmMoi);
  kiem('2: viết cứng "green" chỉ đúng sân 1 (đọc màu lúc đầu mới đúng ở mọi sân); đi tới khi hết màu ("none") chỉ đúng sân 1 (hai sân sau có ô màu ngay sau dải)', thangTungSan(r2a) === 'true,false,false' && thangTungSan(r2b) === 'true,false,false');
  // ---- 3
  const m3 = man(3);
  const dai3 = m3.san.map((rows, i) => { let n = 0; const c0 = oMau(m3, i, 1, 6); for (let y = 6; y >= 0 && oMau(m3, i, 1, y) === c0; y--) n++; return n; });
  kiem('3: dải 2 / 3 / 4 ô (xanh lá, xanh dương, vàng), hết dải rẽ phải, ô đỏ cách ô sau dải 2 / 3 / 1 ô, rẽ trái đi hai ô tới cờ; lời giải 6 dòng dùng cross() và to_red(); mỗi lệnh đều CẦN: thiếu cross() hay to_red() thì không tới cờ',
    J(dai3) === '[2,3,4]' && m3.loiGiai.chinh.length === 6 && m3.loiGiai.chinh[0] === 'cross()' && m3.loiGiai.chinh[2] === 'to_red()' && m3.loiSai.slice(0, 2).every((ls) => !ch(m3, ls.baiLam).thang));
  kiem('3: cứng số bước (11 lệnh move) tràn khung; quên rẽ trái hay rẽ trái xong chỉ đi một ô thì không tới cờ', maCua(ch(m3, { chinh: Array(11).fill('move()') })).includes('tran-khung') && m3.loiSai.slice(3, 5).every((ls) => !ch(m3, ls.baiLam).thang));
  // ---- 4
  const m4 = man(4);
  const ch4 = ch(m4, m4.loiGiai, m4.loiGiai.hamCuaEmMoi);
  kiem('4: xe không nhìn trước được vạch: stop_line() = to_red(), back() tốn khoảng cách tới vạch + 1 nhịp ở mỗi sân (4 + 6 + 5 = 15) trong khi người biết sân chỉ cần 2 + 4 + 3 = 9 (BFS); sân giữa có hai vạch đỏ liền nhau, xe dừng trước vạch ĐẦU',
    J(ch4.theoSan.map((s) => s.soNhip)) === '[4,6,5]' && J([0, 1, 2].map((i) => nhipCheMauSan(m4, i).nhip)) === '[2,4,3]' && m4.nhipTheoLoiGiai === true && oMau(m4, 1, 1, 0) === 'red' && oMau(m4, 1, 1, 1) === 'red' && m4.bongMo[1].y === 2);
  kiem('4: chỉ to_red() thì xe đè lên vạch (lech-bong-mo); lùi hai ô thì dừng cách vạch hai ô; to_red() hai lần liền không đi thêm (xe đã đứng sẵn trên ô đỏ)',
    maCua(ch ? ch(m4, m4.loiSai[0].baiLam, m4.loiSai[0].hamCuaEmMoi) : { chanDoan: [] }).includes('lech-bong-mo') && maCua(ch(m4, m4.loiSai[2].baiLam, m4.loiSai[2].hamCuaEmMoi)).includes('lech-bong-mo') &&
      (() => { const k = ChamHoc.cham(m4, { chinh: C(['to_red()', 'to_red()']) }, tron(khoTruoc(m4.id, true), [])); return k.soNhip === ChamHoc.cham(m4, { chinh: C(['to_red()']) }, khoTruoc(m4.id, true)).soNhip; })());
  function C(chinh) { return chinh; }
  // ---- 5
  const m5 = man(5);
  const laCay = (rows) => {
    const s = SanHoc.docSan(rows), o = []; let canh = 0;
    for (let y = 0; y < s.cao; y++) for (let x = 0; x < s.rong; x++) if (!SanHoc.lyDoChan(s, 'banh', x, y)) { o.push(x + ',' + y); if (x + 1 < s.rong && !SanHoc.lyDoChan(s, 'banh', x + 1, y)) canh++; if (y + 1 < s.cao && !SanHoc.lyDoChan(s, 'banh', x, y + 1)) canh++; }
    return { soO: o.length, canh };
  };
  kiem('5: ba vạch kẻ là hành lang MỘT LỐI (các ô đi được nối thành một đường, số cạnh = số ô - 1, không rẽ nhánh); ô vàng đúng một ô, nằm cuối vạch và là ô bóng mờ; đỏ rẽ phải, xanh dương rẽ trái (có cả hai ở mỗi sân)',
    m5.san.every((rows, i) => { const t = laCay(rows); const ds = SanHoc.docSan(rows); let nv = 0, nd = 0, nx = 0; for (const h of ds.mau) for (const c of h) { if (c === 'yellow') nv++; if (c === 'red') nd++; if (c === 'blue') nx++; } return t.canh === t.soO - 1 && nv === 1 && nd >= 1 && nx >= 1 && ds.mau[m5.bongMo[i].y][m5.bongMo[i].x] === 'yellow'; }));
  kiem('5: quên read_turn() hay quên move() thì vòng chạy mãi (vong-vo-han); đảo so sánh thành == thì xe không đi, lệch bóng mờ', m5.loiSai.slice(0, 3).every((ls) => maCua(ch(m5, ls.baiLam, ls.hamCuaEmMoi)).includes('vong-vo-han')) && maCua(ch(m5, m5.loiSai[4].baiLam, m5.loiSai[4].hamCuaEmMoi)).includes('lech-bong-mo'));
  // ---- 6
  const m6 = man(6), k6 = tron(khoTruoc(m6.id, true), m6.loiGiai.hamCuaEmMoi);
  const r6 = ChamHoc.cham(m6, m6.loiGiai, k6);
  const mauVat6 = m6.san.map((rows, i) => SanHoc.docSan(rows, null, m6.vatMau[i]).vat[0].mau);
  kiem('6: camera (không có cảm biến bụng) và tay kẹp; vật ở ô trước mặt xe, màu đỏ / xanh dương / đỏ; vật mờ chấm theo màu: đỏ ở bên phải xe, xanh dương ở bên trái; lời giải chạy 6 nhịp mỗi sân (nhặt 2, quay 1, đặt 2, quay về 1)',
    J(mauVat6) === '["red","blue","red"]' && J(m6.bongMo.map((b) => b.vat[0].mau)) === '["red","blue","red"]' && J(m6.bongMo.map((b) => b.vat[0].x - b.x)) === '[1,-1,1]' && J(m6.robot.camBien) === '[{"ma":"camera","o":"tren"}]' && J(r6.theoSan.map((s) => s.soNhip)) === '[6,6,6]');
  kiem('6: nhìn màu SAU khi nhặt thì camera chỉ thấy sàn, vật đỏ bị đặt sang trái (lech-bong-mo); luôn chuyền sang phải thì vật xanh dương sai bên; sân giữa là sân duy nhất vật xanh dương',
    thangTungSan(ch(m6, m6.loiSai[1].baiLam, m6.loiSai[1].hamCuaEmMoi)) === 'false,true,false' && thangTungSan(ch(m6, m6.loiSai[0].baiLam, m6.loiSai[0].hamCuaEmMoi)) === 'true,false,true');
  kiem('6: sort_color() đúng 10 dòng (vừa khung, không dư); bản đặt vật đỏ bằng put_right() của che-tay (loiGiaiKhac) đúng 2 sao; thêm một dòng chú thích vào bản chuẩn thì tràn khung',
    m6.loiGiai.hamCuaEmMoi[0].than.length === 10 && maCua(ch(m6, m6.loiGiai, [H('sort_color', ['# nhìn màu trước'].concat(m6.loiGiai.hamCuaEmMoi[0].than))])).includes('tran-khung'));
  // ---- 7
  const m7 = man(7), k7 = khoTruoc(m7.id, true), k7t = khoTruoc(m7.id, false);
  const go = m7.maMau.hamCuaMan.find((h) => h.ten === 'go_out'), cb = m7.loiGiai.hamCuaMan.find((h) => h.ten === 'come_back');
  const dao = { turn_right: 'turn_left', turn_left: 'turn_right', move: 'back', back: 'move' };
  const daoDong = (s) => s.replace(/\b(turn_right|turn_left|move|back)\(\)/, (a, t) => dao[t] + '()');
  const goDao = go.than.map(daoDong);
  const r7m = ChamHoc.cham(m7, m7.maMau, k7);
  kiem('7: go_out() là hàm của màn KHÓA (khoaHamMan), thân = vòng read_turn() + move() tới ô vàng; come_back() thân ban đầu chỉ `pass` (hợp lệ, chưa làm gì: lech-bong-mo, không phải lỗi cú pháp); không vào kho, không taoHam, hamCuaEmCan có back',
    J(go.than) === J(['while color() != "yellow":', '    read_turn()', '    move()']) && J(m7.maMau.hamCuaMan.find((h) => h.ten === 'come_back').than) === '["pass"]' && !r7m.thang && J(maCua(r7m)) === '["lech-bong-mo"]' && m7.taoHam.length === 0 && m7.hamCuaEmCan.includes('back') && !k7.some((h) => h.ten === 'come_back' || h.ten === 'go_out'));
  kiem('7: come_back() = go_out() với MỖI LỆNH THÀNH LỆNH NGƯỢC (move ↔ back, turn_right ↔ turn_left) và điều kiện dừng đổi thành ô xanh lá ("green"): rẽ phải ở ô đỏ lúc đi thì rẽ trái lúc về; xe lùi trên đường cũ nên về ô xanh lá vẫn đúng hướng (không cần u_turn)',
    J(cb.than) === J(['while color() != "green":', '    if color() == "red":', '        turn_left()', '    elif color() == "blue":', '        turn_right()', '    back()']) && !cb.than.join('').includes('u_turn') && goDao.join('') !== go.than.join('') && cb.than.some((s) => /back\(\)/.test(s)));
  kiem('7: ô xanh lá là chỗ xuất phát và chỉ có MỘT ô xanh lá mỗi sân; ô vàng đúng một ô và là ◆; ba vạch là hành lang một lối; lời giải chạy ' + J(ChamHoc.cham(m7, m7.loiGiai, k7).theoSan.map((s) => s.soNhip)) + ' nhịp, BFS tính cả go_out() = ' + nhipCheMauTatCa(m7, k7) + ' = sao.nhip',
    m7.san.every((rows, i) => { const ds = SanHoc.docSan(rows); let ng = 0, nv = 0; ds.mau.forEach((h, y) => h.forEach((c, x) => { if (c === 'green') { ng++; if (x !== m7.batDau[i].x || y !== m7.batDau[i].y) ng += 100; } if (c === 'yellow') { nv++; if (x !== m7.bongMo[i].diQua[0].x || y !== m7.bongMo[i].diQua[0].y) nv += 100; } })); const t = laCay(rows); return ng === 1 && nv === 1 && t.canh === t.soO - 1; }) && nhipCheMauTatCa(m7, k7) === m7.sao.nhip);
  kiem('7: ◆ ở ô vàng — chương trình chính rỗng hay go_out() hỏng không thắng chỉ vì xe còn ở chỗ xuất phát; BFS không tính đoạn cố định thì vẫn phải ghé ◆ (cùng nhịp)',
    !ChamHoc.cham(Object.assign({}, m7, { chinhCoDinh: false }), { chinh: [] }, k7).thang && nhipCheMauSan(m7, 0).nhip === ChamHoc.cham(m7, m7.loiGiai, k7).theoSan[0].soNhip);
  kiem('7: kho cổ điển và kho thật cho đúng cùng nhịp (lời giải không dùng u_turn); sửa go_out() gửi lên vẫn bị thay bằng bản mẫu (khóa)',
    J(ChamHoc.cham(m7, m7.loiGiai, k7).theoSan.map((s) => s.soNhip)) === J(ChamHoc.cham(m7, m7.loiGiai, k7t).theoSan.map((s) => s.soNhip)) &&
      (() => { const a = ChamHoc.cham(m7, { chinh: [], hamCuaMan: [H('go_out', ['move()']), cb] }, k7), b = ChamHoc.cham(m7, m7.loiGiai, k7); return J([a.thang, a.soO, a.soNhip]) === J([b.thang, b.soO, b.soNhip]) && b.sao === 3; })());
  kiem('7: quên đảo luật rẽ (vẫn read_turn) hay quên rẽ thì xe lùi vào tường mãi (vong-vo-han); chỉ lùi một ô thì lệch bóng mờ', m7.loiSai.slice(1, 3).every((ls) => maCua(ch(m7, ls.baiLam)).includes('vong-vo-han')) && maCua(ch(m7, m7.loiSai[3].baiLam)).includes('lech-bong-mo'));
  // ---- 8
  const m8 = man(8), k8 = khoTruoc(m8.id, true);
  const hong8 = ChamHoc.cham(m8, m8.maMau, k8);
  kiem('8: line_step() của màn nhìn nhầm màu (so "green" thay cho "blue"); là hàm của màn, KHÔNG khóa, nằm trong maMau; chạy bản mẫu: không tới cờ ở cả ba sân (sân 1 không rẽ trái được ở ô xanh dương, hai sân kia rẽ trái nhầm ở ô xanh lá nhiễu)',
    m8.maMau.hamCuaMan.length === 1 && m8.maMau.hamCuaMan[0].ten === 'line_step' && m8.khoaHamMan === undefined && !hong8.thang && thangTungSan(hong8) === 'false,false,false' && J(m8.maMau.hamCuaMan[0].than.map((s) => s.replace('green', 'blue'))) === J(m8.loiGiai.hamCuaMan[0].than));
  kiem('8: sân 1 không có ô xanh lá; sân 2 và 3 có ô xanh lá nhiễu trên đoạn thẳng; mọi sân có ô đỏ và ô xanh dương; hành lang một lối',
    m8.san.every((rows, i) => { const ds = SanHoc.docSan(rows); const dem = (mau) => ds.mau.reduce((a, h) => a + h.filter((c) => c === mau).length, 0); const t = laCay(rows); return dem('red') >= 1 && dem('blue') >= 1 && (dem('green') > 0) === (i > 0) && t.canh === t.soO - 1; }));
  kiem('8: sửa hai hướng rẽ mà không sửa màu, hay bỏ move() thì vẫn không tới cờ; sao.nhip = BFS (25 = 8 + 8 + 9)', m8.loiSai.slice(1, 3).every((ls) => !ch(m8, ls.baiLam).thang) && m8.sao.nhip === 25 && nhipCheMauTatCa(m8, k8) === 25);
  // ---- 9
  const m9 = man(9), k9 = khoTruoc(m9.id, true);
  const cu9 = ChamHoc.cham(m9, m9.maMau, k9);
  const cd9 = cu9.chanDoan.find((c) => c.ma === 'lenh-goc-hong');
  kiem('9: chạy bản mẫu (trace() gọi follow_line() cần color()): lenh-goc-hong trỏ dòng 1 của follow_line (hàm của em); lời nêu canhBao "Cảm biến màu hỏng", tên lệnh color() và các lệnh còn chạy được; không phải ham-chua-co',
    !!cd9 && !cu9.thang && cd9.ten === 'color' && /Cảm biến màu hỏng/.test(cd9.loi) && /color\(\) không chạy được ở màn này/.test(cd9.loi) && /front_clear/.test(cd9.loi) && J(cd9.cho) === J({ cot: 'hamEm', dong: 1, ten: 'follow_line' }) && !maCua(cu9).includes('ham-chua-co'), J(cu9.chanDoan));
  const tuGoi = ch(m9, m9.loiSai[1].baiLam);
  kiem('9: tự gọi color() trong hàm của màn cũng lenh-goc-hong (cảm biến màu hỏng) và trỏ vào hàm trace của màn', maCua(tuGoi).includes('lenh-goc-hong') && !tuGoi.thang && J(tuGoi.chanDoan.find((c) => c.ma === 'lenh-goc-hong').cho) === J({ cot: 'hamMan', dong: 2, ten: 'trace' }), J(tuGoi.chanDoan.map((c) => c.cho)));
  kiem('9: phần cứng KHÔNG có color nhưng vẫn đủ bánh và cảm biến khoảng cách; ba vạch là hành lang một lối, có ô màu (vô dụng vì cảm biến hỏng), cờ F ở cuối; lời giải bám tường bằng follow_right() 8 + 9 + 11 = 28 nhịp = BFS',
    !m9.phanCung.includes('color') && ['left_move', 'right_back', 'front_clear', 'right_clear'].every((t) => m9.phanCung.includes(t)) && m9.san.every((rows) => { const ds = SanHoc.docSan(rows), t = laCay(rows); return t.canh === t.soO - 1 && ds.mau.some((h) => h.some((c) => c)); }) && m9.sao.nhip === 28 && nhipCheMauTatCa(m9, k9) === 28);
  const hamEmCoColor = ChamHoc.cham(m9, m9.loiGiai, tron(k9, []));
  kiem('9: các hàm của em dùng color() (read_turn, follow_line, cross, to_red…) vẫn còn trong kho nhưng ở màn này gọi sẽ lenh-goc-hong; lời giải chỉ cần follow_right() (cảm biến khoảng cách) nên không gặp lỗi', hamEmCoColor.thang && maLoi(hamEmCoColor).length === 0 && ['read_turn', 'follow_line', 'cross', 'to_red'].every((t) => k9.some((h) => h.ten === t)));
  // ---- 10
  const m10 = man(10), k10 = tron(khoTruoc(m10.id, true), m10.loiGiai.hamCuaEmMoi);
  const r10 = ChamHoc.cham(m10, m10.loiGiai, k10);
  kiem('10: trùm — gioiHanHam 4 và lời giải gọi đúng 4 hàm của em (pick, follow_line, stop_line, drop); gọi thêm hàm thứ năm thì qua-gioi-han-ham; công thức khác đặt hàng bằng lệnh tay gốc chỉ cần 3 hàm',
    r10.thang && KhungCode.hamEmTrucTiep({ chinh: m10.loiGiai.chinh, hamCuaMan: [] }, k10).join() === 'pick,follow_line,stop_line,drop' && maCua(ChamHoc.cham(m10, m10.loiSai[4].baiLam, k10)).includes('qua-gioi-han-ham') && KhungCode.hamEmTrucTiep({ chinh: m10.congThucKhac[0].baiLam.chinh, hamCuaMan: [] }, k10).length === 3);
  kiem('10: hàng ngay trước mặt xe ở chân vạch kẻ (vật chắn lối: không nhặt thì xe không đi được); vạch đỏ cách ô vàng 2 / 3 / 1 ô; bóng mờ: xe sát trước vạch đỏ (ô ngay dưới), hàng nằm TRÊN vạch đỏ; mỗi sân dài khác nhau (viết cứng không được)',
    m10.san.every((rows, i) => { const ds = SanHoc.docSan(rows); const v = ds.vat[0], b = m10.bongMo[i]; return ds.vat.length === 1 && v.x === m10.batDau[i].x && v.y === m10.batDau[i].y - 1 && ds.mau[b.vat[0].y][b.vat[0].x] === 'red' && b.vat[0].x === b.x && b.vat[0].y === b.y - 1; }) &&
      J(r10.theoSan.map((s) => s.soNhip)) === '[16,16,19]' && maCua(ChamHoc.cham(m10, m10.loiSai[0].baiLam, k10)).includes('vong-vo-han'));
  kiem('10: dùng to_red() thay stop_line() thì hàng rơi ra sau vạch đỏ (lech-bong-mo); quên stop_line() thì hàng đặt ngay sau ô vàng', maCua(ChamHoc.cham(m10, m10.loiSai[2].baiLam, k10)).includes('lech-bong-mo') && maCua(ChamHoc.cham(m10, m10.loiSai[1].baiLam, k10)).includes('lech-bong-mo'));
}

/* ================================================================= 4. SÂN THỬ CỦA XƯỞNG (màu) */
console.log('\n== 4. Sân thử của Xưởng hàm: thử lệnh màu trên sân có ô màu ==');
{
  const m1 = man(1), k = tron(khoTruoc(m1.id, true), m1.loiGiai.hamCuaEmMoi);
  const thu = ChamHoc.thuHam(m1, { chinh: [] }, 'to_red', k, { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 4, huong: 0 }, mau: [{ x: 2, y: 1, mau: 'red' }, { x: 2, y: 3, mau: 'green' }] } });
  kiem('thuHam to_red() trên sân thử có ô đỏ ở (2,1): xe đi tới (2,1) trong 3 nhịp, qua ô xanh lá nhiễu, không lỗi', thu.robot.x === 2 && thu.robot.y === 1 && thu.soNhip === 3 && maLoi(thu).length === 0, J([thu.robot, thu.soNhip, maCua(thu)]));
  const m7 = man(7), k7 = khoTruoc(m7.id, true);
  const thuMan = ChamHoc.thuHam(m7, { chinh: [], hamCuaMan: m7.loiGiai.hamCuaMan }, 'come_back', k7, { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 0, huong: 0 }, mau: [{ x: 2, y: 3, mau: 'green' }] } });
  kiem('thuHam come_back() (hàm của màn) trên sân thử: xe lùi xuống tới ô xanh lá (2,3) rồi dừng (3 nhịp)', thuMan.robot.y === 3 && thuMan.soNhip === 3 && maLoi(thuMan).length === 0, J([thuMan.robot, thuMan.soNhip, maCua(thuMan)]));
}

/* ================================================================= 5. BỘ DÒ ĐƯỜNG */
console.log('\n== 5. Bộ dò đường BFS (do-duong-che-mau.mjs) kiểm chéo với SanHoc.chay ==');
{
  const cauHinh = (con, pc, code) => {
    const lm = SanHoc.lopMauCuaSan(con, 0);
    return SanHoc.chay({ san: con.san, batDau: con.batDau, loaiRobot: 'banh', hamGoc: con.hamGoc, phanCung: pc, mucTieu: con.mucTieu || 'toi-co', bongMo: con.bongMo, mau: con.mau, vatMau: con.vatMau, camBien: con.robot.camBien, nhipToiDa: 300 }, code) && lm;
  };
  const chay = (con, pc, code) => SanHoc.chay({ san: con.san, batDau: con.batDau, loaiRobot: 'banh', hamGoc: con.hamGoc, phanCung: pc, mucTieu: con.mucTieu || 'toi-co', bongMo: con.bongMo, mau: con.mau, vatMau: con.vatMau, camBien: con.robot.camBien, nhipToiDa: 300 }, code);
  void cauHinh;
  // 5a. đường BFS tìm được (mỗi sân, từ chỗ xuất phát) đổi thành lệnh gốc, chạy SanHoc.chay phải THẮNG đúng bằng số nhịp BFS
  let soDuong = 0, soLechDuong = 0, viDuong = '';
  for (const m of che) {
    const pc = SanHoc.phanCungCua(m);
    for (let i = 0; i < 3; i++) {
      const con = manCuaSan(m, i), b = nhipCheMauSan(m, i);
      const k = chay(con, pc, chuoiThanhMa(b.chuoi, pc));
      soDuong++;
      if (!(k.thang === true && k.nhip === b.nhip && !k.loi)) { soLechDuong++; if (!viDuong) viDuong = m.id + ' sân ' + (i + 1) + ': BFS ' + b.nhip + ', chạy thang ' + k.thang + ' nhip ' + k.nhip + ' loi ' + J(k.loi); }
    }
  }
  kiem('đường BFS của cả ' + soDuong + ' sân (10 màn × 3), đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng số nhịp BFS, không lỗi', soDuong === 30 && soLechDuong === 0, viDuong);
  // 5b. chương trình ngẫu nhiên: trạng thái cuối của buocMotNhip trùng SanHoc.chay (xe, hướng, tay, vật, ô ◆) và kết luận thắng trùng nhau
  let rngS = 20240615;
  const rnd = (n) => { rngS = (rngS * 1103515245 + 12345) & 0x7fffffff; return rngS % n; };
  let soMau = 0, soLech = 0, soThangMau = 0, soCamVat = 0, vi = '';
  for (const m of che) {
    const pc = SanHoc.phanCungCua(m), coTay = m.hamGoc.includes('arm_down');
    for (let i = 0; i < 3; i++) {
      const con = manCuaSan(m, i), { ctx, S } = trangThaiBanDau(con);
      const dsHD = [];
      for (const t of coTay ? [null, 'duoi', 'tren'] : [null]) for (const kk of coTay ? [null, 'kep', 'tha'] : [null]) for (const bb of BANH_EFFECT) dsHD.push({ tuThe: t, kep: kk, banh: bb });
      for (let lan = 0; lan < (coTay ? 120 : 40); lan++) {                          // sân có tay kẹp: nhiều mẫu hơn để đủ mẫu cầm vật
        const chuoi = [];
        let cur = S, vo = false;
        const n = 3 + rnd(12);
        for (let j = 0; j < n && !vo; j++) {
          const a = dsHD[rnd(dsHD.length)];
          const r = buocMotNhip(ctx, cur, a, true);
          if (!r) { vo = true; break; }
          chuoi.push(a); cur = r.N;
        }
        if (vo || !chuoi.length) continue;
        const k = chay(con, pc, chuoiThanhMa(chuoi, pc));
        soMau++;
        const rongS = ctx.rong;
        const posSim = k.vat.map((v) => (v.trangThai === 'dat' ? v.y * rongS + v.x : v.trangThai === 'cam' ? -1 : -2));
        const camSim = k.tay && k.tay.cam !== null && k.tay.cam !== undefined ? k.tay.cam - 1 : -1;
        const tuTheSim = k.tay && k.tay.tuThe === 'duoi' ? 1 : 0;
        if (camSim >= 0) soCamVat++;
        const gongNhau = k.robot.x === cur.x && k.robot.y === cur.y && k.robot.huong === cur.h && tuTheSim === cur.t && camSim === cur.cam && J(posSim) === J(cur.pos);
        if (!gongNhau) { soLech++; if (!vi) vi = m.id + ' sân ' + (i + 1) + ' ' + chuoiThanhMa(chuoi, pc).replace(/\n/g, ';') + ' sim ' + J([k.robot, k.tay, posSim]) + ' bfs ' + J(cur); }
        // kết luận thắng: bóng mờ xét khi chạy xong nên so với trạng thái cuối; tới cờ xét giữa đường nên chỉ so khi sim thắng thì bộ dò không thể chưa chạm cờ
        if (con.mucTieu === 'bong-mo') { const th = daDatDich(ctx, cur); if (th) soThangMau++; if (th !== (k.thang === true)) { soLech++; if (!vi) vi = m.id + ' thắng lệch: bfs ' + th + ' sim ' + k.thang + ' ' + chuoiThanhMa(chuoi, pc).replace(/\n/g, ';'); } }
      }
    }
  }
  kiem('chương trình ngẫu nhiên (' + soMau + ' mẫu trên 30 sân): trạng thái cuối (ô, hướng, tư thế tay, vật cầm, ô các vật) của bộ dò trùng SanHoc.chay; kết luận thắng bóng mờ trùng nhau', soMau >= 1000 && soLech === 0, vi || ('chỉ có ' + soMau + ' mẫu'));
  kiem('các mẫu ngẫu nhiên có đủ loại: có mẫu cầm vật (' + soCamVat + '), có mẫu thắng bóng mờ (' + soThangMau + ')', soCamVat >= 30);
  // 5c. bộ dò tự kiểm
  const m7 = man(7), k7 = khoTruoc(m7.id, true);
  kiem('bộ dò: màn có đoạn cố định (7) tính go_out() chạy thật rồi BFS phần còn lại, giữ ◆ đã qua: 66 nhịp = 20 + 20 + 26 (đi ra rồi về, mỗi sân đường một lối)', nhipCheMauTatCa(m7, k7) === 66 && J([0, 1, 2].map((i) => nhipCheMauSan(m7, i).nhip)) === '[20,20,26]');
  const m4 = man(4);
  kiem('bộ dò: phần cứng hẹp hơn thì đường dài hơn (không có bánh lùi: lùi một ô phải quay đầu, tiến, quay đầu = 3 nhịp thay vì 1)', nhipCheMauSan(m4, 0, { phanCung: ['left_move', 'right_move', 'wait', 'color'] }).nhip >= nhipCheMauSan(m4, 0).nhip);
  kiem('bộ dò: vật không bao giờ vỡ trong đường tìm được (không thả khi tay nâng): lời giải BFS của 6 và 10 chạy không có vat-vo', [6, 10].every((so) => { const m = man(so), pc = SanHoc.phanCungCua(m); return [0, 1, 2].every((i) => { const con = manCuaSan(m, i); const k = chay(con, pc, chuoiThanhMa(nhipCheMauSan(m, i).chuoi, pc)); return k.suKien.filter((e) => e.ma === 'vat-vo').length === 0; }); }));
}

/* ================================================================= 6. SỔ LỆNH, HUY HIỆU, THẺ SCRIPT */
console.log('\n== 6. Sổ lệnh, huy hiệu, game/choi.html ==');
{
  const moi = ['to_red', 'cross', 'stop_line', 'follow_line', 'sort_color'];
  kiem('Sổ lệnh có năm hàm của chương, nhóm mau, chuong che-mau, man khớp màn tạo hàm, lời lớp 5 (≤ 80 chữ, không dấu chấm cuối); theo thứ tự chế',
    moi.every((t) => { const h = SoLenh.tim(t); return h && h.nhom === 'mau' && h.chuong === 'che-mau' && h.man === che.find((m) => m.taoHam.includes(t)).ma && h.moTa.length <= 80 && !/[.]$/.test(h.moTa); }) && J(SoLenh.theoChuong('che-mau').map((h) => h.ten)) === J(moi));
  const nhomMau = SoLenh.theoNhom('mau').map((h) => h.ten);
  kiem('nhóm mau của Sổ lệnh: read_turn (chương mau) rồi năm hàm của che-mau, ngay sau nhau', nhomMau.indexOf('read_turn') >= 0 && J(nhomMau.slice(nhomMau.indexOf('read_turn'), nhomMau.indexOf('read_turn') + 6)) === J(['read_turn'].concat(moi)), J(nhomMau));
  const huy = fs.readFileSync(path.join(day, 'game', 'huy-hieu.js'), 'utf8');
  kiem("huy hiệu: game/huy-hieu.js có HINH['che-mau'] vẽ ô màu và bánh răng (themBanhRang)", /HINH\['che-mau'\]\s*=\s*function/.test(huy) && /HINH\['che-mau'\][\s\S]{0,1500}themBanhRang\(p\)/.test(huy));
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có đúng một thẻ script ../man-che-mau.js, nạp sau man-mau.js và sau thu-tu-chuong.js và so-lenh.js, có file trên đĩa', tags.filter((t) => t === '../man-che-mau.js').length === 1 && vtri('man-che-mau.js') > vtri('man-mau.js') && vtri('man-che-mau.js') > vtri('thu-tu-chuong.js') && vtri('man-che-mau.js') > vtri('so-lenh.js') && fs.existsSync(path.join(day, 'man-che-mau.js')));
  kiem('kiem-hoc.mjs nạp man-che-mau.js, gắn nhipCheMauTatCa vào nhipTat; kiem-che-xe.mjs có che-mau → mau trong bảng nhóm Sổ lệnh', (() => {
    const kh = fs.readFileSync(path.join(day, 'kiem-hoc.mjs'), 'utf8'), kx = fs.readFileSync(path.join(day, 'kiem-che-xe.mjs'), 'utf8');
    return /man-che-mau\.js/.test(kh) && /nhipCheMauTatCa/.test(kh) && /m\.chuong === 'che-mau'/.test(kh) && /'che-mau': 'mau'/.test(kx);
  })());
}

console.log('\n  Bảng 10 màn che-mau (lời giải cách 1, sao)');
console.log('  màn  | tên                  | ô  | nhịp (ba sân)    | BFS | tạo / viết             | lời giải (chương trình chính)');
for (const m of che) {
  const kho = tron(khoTruoc(m.id, true), m.loiGiai.hamCuaEmMoi), r = ChamHoc.cham(m, m.loiGiai, kho);
  const tao = m.taoHam.concat(m.loiGiai.hamCuaMan.filter((h) => !m.maMau.hamCuaMan.some((x) => x.ten === h.ten && J(x.than) === J(h.than))).map((h) => h.ten + '*'));
  console.log('  ' + m.id.padEnd(5) + '| ' + m.ten.padEnd(20) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + (String(m.sao.nhip) + ' (' + r.theoSan.map((s) => s.soNhip).join('+') + ')').padEnd(16) + ' | ' + String(nhipCheMauTatCa(m, khoTruoc(m.id, true))).padEnd(3) + ' | ' + tao.join(',').padEnd(22) + ' | ' + m.loiGiai.chinh.join(' ; '));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

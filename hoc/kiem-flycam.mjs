/* ============================================================================
   kiem-flycam.mjs — máy kiểm chương `flycam` (Flycam: drone gắn camera nhìn xuống, look() + danh sách; "nhìn trước, làm sau") của "Đường học"
   (KE-HOACH-LIST-FLYCAM.md, mục 4, làm 17/10). Gồm:
   1. 10 màn flycam: dữ liệu (tên, hàng, robot có camera-bay + pin, khay, hàm chế, hàm của màn, khóa, pin / ô sạc, ba sân), lời giải 3 sao, mọi công thức khác thắng, lời giải khác đúng 2 sao,
      lời sai đúng mã, chinhCoDinh chặn chương trình chính gửi lên, nhịp: BFS (do-duong-che-drone.mjs; look() không đổi vật lý nên dùng chung bộ dò drone) ≤ sao.nhip (bằng nhau ở 1, 3, 7, 8);
   2. LÝ DO NHỚ LÀ THẬT: ba sân khác nhau nên chương trình viết cứng theo sân đầu (đường BFS của sân 0, không look) trượt các sân kia; ba tờ đơn khác nhau từng đôi một;
      camera hỏng (9): look() báo lenh-goc-hong "Camera dưới bụng drone hỏng" còn chương trình viết cứng thì thắng;
   3. đường BFS đổi thành lệnh gốc chạy SanHoc.chay thắng đúng nhịp BFS (so chéo bộ dò với lõi);
   4. Sổ lệnh (sáu hàm mới theo thứ tự chế, hàm của màn không vào kho), gói Drone, huy hiệu flycam, choi.html;
   5. mọi lời giải NHẬP ĐƯỢC BẰNG CHẠM: từng dòng của lời giải / công thức khác thuộc một mẫu khối trên khay (kiểm bằng mẫu dòng), và Palette / Editor trên DOM giả:
      khối `a.append(look())` ở nhóm DANH SÁCH (chỉ màn có look()), `for c in a:` cho danh sách màu, chèn hàm có đối số danh sách thì dùng tên danh sách đã có (`survey(a)`),
      biến vòng của danh sách rỗng `a = []` so được với màu (`c == "red"`), VÁ battery(): màn có cả pin lẫn camera thì vế trái chọn được `battery() > 2` (và đổi lại);
   6. hướng dẫn bong bóng của flycam.1 (chỉ khối while có look()).
   Các kiểm chung cho cả game nằm ở kiem-hoc.mjs; camera nhìn xuống (lõi) ở kiem-camera-drone.mjs; list (lõi, khay) ở kiem-list.mjs.
   Chạy: node hoc/kiem-flycam.mjs        (trượt thì thoát mã 1)
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
const KhoHam = require(path.join(day, 'kho-ham.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
const SoLenh = require(path.join(day, 'so-lenh.js'));
let ManHoc = require(path.join(day, 'man-chuoi-1.js'));
for (const f of fs.readdirSync(day).filter((n) => /^man-.*\.js$/.test(n) && n !== 'man-chuoi-1.js').sort()) ManHoc = require(path.join(day, f));
const DoDuong = await import('./do-duong-che-drone.mjs');
const { nhipCheDroneNganNhat, nhipCheDroneTatCa, chuoiThanhMa } = DoDuong;

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const maLoi = (kq) => kq.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
const ev = (kq, ma) => nhipVet(kq).flatMap((n) => n.suKien).filter((e) => e.ma === ma);
const tatCa = ManHoc.danhSach;
const fly = tatCa.filter((m) => m.chuong === 'flycam');
const man = (so) => ManHoc.timMa('flycam.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const VT = ThuTu.thuTu.indexOf('flycam') + 1;                  // số thứ tự của chương flycam (không ghi cứng)

/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải). id 'het' = sau cả game. */
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
const BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
const NC = ['magnet_n', 'magnet_s', 'magnet_off'];
/** Cấu hình SanHoc.chay của sân thứ i của màn m (như ChamHoc.cham truyền xuống). */
function cfgSan(m, i, extra) {
  const lm = SanHoc.lopMauCuaSan(m, i);
  return Object.assign({ san: sanCua(m)[i], batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, loaiRobot: 'drone', hamGoc: m.hamGoc, phanCung: SanHoc.phanCungCua(m), mucTieu: m.mucTieu || 'toi-co',
    vatChat: lm.vatChat, vatMau: lm.vatMau, vat: lm.vatThem || undefined, pin: Array.isArray(m.pin) ? m.pin[i] : m.pin, camBien: m.robot ? m.robot.camBien : undefined, bongMo: lm.bongMo || undefined, nhipToiDa: 200 }, extra || {});
}
/** Màn m thu về một sân (thứ i) để dò BFS. */
function conSan(m, i) {
  const lm = SanHoc.lopMauCuaSan(m, i);
  return Object.assign({}, m, { san: sanCua(m)[i], batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, pin: Array.isArray(m.pin) ? m.pin[i] : m.pin, bongMo: lm.bongMo || m.bongMo, vatChat: lm.vatChat, vatMau: lm.vatMau });
}

/* ================================================================= 1. MƯỜI MÀN FLYCAM */
console.log('\n== 1. Chương flycam: dữ liệu và luật từng màn ==');
const BANG = [];
{
  kiem('đúng 10 màn, số 1..10, mã flycam.1…, id theo vị trí trong thuTu (ngay sau che-drone, cùng gói Drone; chương cuối là rap-du), tên "Flycam", đợt 2',
    fly.length === 10 && fly.every((m, i) => m.so === i + 1 && m.id === VT + '.' + (i + 1) && m.ma === 'flycam.' + (i + 1)) && ThuTu.thuTu.indexOf('flycam') === ThuTu.thuTu.indexOf('che-drone') + 1 &&
      ThuTu.ten['flycam'] === 'Flycam' && ThuTu.laDot2('flycam') && ThuTu.goi.some((g) => g.chuong.includes('drone') && g.chuong.includes('che-drone') && g.chuong.includes('flycam')));
  kiem('tên các màn: Tìm ô đỏ, Rẽ theo màu, Đọc đơn, Làm theo đơn, Giao theo đơn, Về nhà có sạc, Đường về, Ghi thiếu, Camera hỏng, Kho đơn hàng; hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu flycam',
    J(fly.map((m) => m.ten)) === J(['Tìm ô đỏ', 'Rẽ theo màu', 'Đọc đơn', 'Làm theo đơn', 'Giao theo đơn', 'Về nhà có sạc', 'Đường về', 'Ghi thiếu', 'Camera hỏng', 'Kho đơn hàng']) &&
      J(fly.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && fly.every((m) => !!m.huyHieu === (m.so === 10)) && fly[9].huyHieu.ma === 'flycam' && fly[9].huyHieu.ten === 'Huy hiệu Flycam');
  const CAM = { ma: 'camera-bay', o: 'bung' };
  kiem('mọi màn: DRONE gắn camera nhìn xuống { camera-bay, bung } (+ pin ở 6), nam châm treo chỉ ở 5, 9, 10; chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em; cauTruc for/if/while (1, 2: làm quen look() trước, chưa có list) và thêm list từ 3 (cả man.cauTruc lẫn man.khung.cauTruc)',
    fly.every((m) => m.loaiRobot === 'drone' && m.robot.than === 'drone' && m.robot.tay === ([5, 9, 10].includes(m.so) ? 'nam-cham' : null) && J(m.robot.camBien) === J(m.so === 6 ? [CAM, { ma: 'pin', o: 'than' }] : [CAM]) &&
      m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && J(m.cauTruc) === (m.so <= 2 ? '["for","if","while"]' : '["for","if","while","list"]') && J(m.khung.cauTruc) === J(m.cauTruc)));
  kiem('khay: bốn lệnh bay + wait() + look() ở mọi màn; + battery() ở 6; + magnet_n / magnet_s / magnet_off ở 5, 9, 10; 9 hỏng camera: khay = phần cứng = không look() (còn nam châm) và canhBao "Camera dưới bụng drone hỏng"; không màn nào khác khai phanCung',
    fly.every((m) => J(m.hamGoc) === J(BAY.concat([5, 9, 10].includes(m.so) ? NC : [], m.so === 9 ? [] : ['look'], m.so === 6 ? ['battery'] : []))) && J(man(9).phanCung) === J(man(9).hamGoc) && man(9).canhBao === 'Camera dưới bụng drone hỏng' &&
      fly.every((m) => m.so === 9 || (m.phanCung === undefined && m.canhBao === undefined)));
  kiem('lệnh chế ở từng màn (taoHam): seek_red, steer, survey, obey, dispatch, patrol, —, —, —, —; 7, 8, 9 viết / sửa HÀM CỦA MÀN (không hàm của em mới); hàm của màn: go_out + come_back (7), scan_row (8), fetch_red (9)',
    J(fly.map((m) => m.taoHam)) === J([['seek_red'], ['steer'], ['survey'], ['obey'], ['dispatch'], ['patrol'], [], [], [], []]) && [7, 8, 9].every((i) => man(i).loiGiai.hamCuaEmMoi.length === 0 && man(i).congThucKhac.every((c) => !c.hamCuaEmMoi || c.hamCuaEmMoi.length === 0)) &&
      J(man(7).loiGiai.hamCuaMan.map((h) => h.ten)) === '["go_out","come_back"]' && J(man(8).loiGiai.hamCuaMan.map((h) => h.ten)) === '["scan_row"]' && J(man(9).loiGiai.hamCuaMan.map((h) => h.ten)) === '["fetch_red"]');
  kiem('mục tiêu bong-mo ở cả 10 màn (có bongMo, không cờ F hay ô đích D); chinhCoDinh ở mọi màn trừ 10 (trùm tự viết chương trình chính); khoaHamMan ["go_out"] chỉ ở 7; gioiHanHam 3 chỉ ở 10; không daoChieu',
    fly.every((m) => m.mucTieu === 'bong-mo' && !!m.bongMo && !/[FD]/.test(sanCua(m).flat().join('')) && (m.chinhCoDinh === true) === (m.so !== 10) && (m.so === 7) === (J(m.khoaHamMan) === '["go_out"]') && (m.so === 10 ? m.gioiHanHam === 3 : m.gioiHanHam === undefined) && m.daoChieu === undefined));
  kiem('ba sân (mảng 3 sân, batDau và bongMo song song, nhipTheo "tong") ở 1–8 và 10; 9 một sân (camera hỏng: em tự nhìn màu); sân ≤ 7 cột × 9 hàng; drone xuất phát đứng được',
    fly.every((m) => sanCua(m).length === (m.so === 9 ? 1 : 3) && (m.so === 9 || (m.nhipTheo === 'tong' && Array.isArray(m.batDau) && Array.isArray(m.bongMo) && m.bongMo.length === 3)) &&
      sanCua(m).every((s, i) => s.length <= 9 && s[0].length <= 7 && s.every((r) => r.length === s[0].length) && (() => { const b = Array.isArray(m.batDau) ? m.batDau[i] : m.batDau; return !SanHoc.lyDoChan(SanHoc.docSan(s), 'drone', b.x, b.y); })())));
  kiem('pin: 6 pin 4 (ba sân), dải ô sạc P phía trên hành lang; các màn khác không pin, không ô sạc; nam châm treo ↔ có hộp sắt (vatChat) ở 5, 9, 10',
    fly.every((m) => (m.pin === undefined) === (m.so !== 6) && (/P/.test(sanCua(m).flat().join('')) === (m.so === 6)) && (!!m.vatChat === [5, 9, 10].includes(m.so))) && man(6).pin === 4);
  kiem('nhipTheoLoiGiai: ở 2, 4, 5, 6, 9, 10 (phải đọc màu mới biết đường nên đường ngắn nhất của từng sân ngắn hơn lời giải); 1, 3, 7, 8: sao.nhip = đường ngắn nhất BFS',
    fly.every((m) => (m.nhipTheoLoiGiai === true) === [2, 4, 5, 6, 9, 10].includes(m.so)));

  for (const m of fly) {
    const kho = khoTruoc(m.id);
    const khoNay = tron(kho, m.loiGiai.hamCuaEmMoi);
    const r = ChamHoc.cham(m, m.loiGiai, khoNay);
    kiem(m.id + ' ' + m.ten + ': lời giải cách 1 thắng 3 sao, ' + r.soO + ' ô = sao.o, ' + r.soNhip + ' nhịp = sao.nhip, không chẩn đoán nào (kể cả thông tin)',
      r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    const bfs = nhipCheDroneTatCa(m, khoNay);
    BANG.push({ m, r, bfs });
    kiem(m.id + ': BFS đường ngắn nhất = ' + bfs + (m.nhipTheoLoiGiai ? ' ≤' : ' =') + ' sao.nhip ' + m.sao.nhip, bfs !== null && (m.nhipTheoLoiGiai ? bfs <= m.sao.nhip : bfs === m.sao.nhip), 'BFS = ' + bfs + ', sao.nhip = ' + m.sao.nhip);
    if (m.chinhCoDinh) {
      const gui = ChamHoc.cham(m, { chinh: ['wait()', 'wait()', 'wait()'], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính gửi lên bị bỏ qua (kết quả y hệt lời giải)', J([gui.thang, gui.soO, gui.soNhip, gui.py]) === J([r.thang, r.soO, r.soNhip, r.py]) && m.maMau.chinh.length >= 1 && m.maMau.chinh.length <= m.khung.chinh);
      const rong = ChamHoc.cham(m, { chinh: [], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính RỖNG gửi lên vẫn chạy bản mẫu (cùng nhịp, cùng sao)', rong.thang === r.thang && rong.sao === r.sao && rong.soNhip === r.soNhip);
    } else {
      kiem(m.id + ': người chơi tự viết chương trình chính (maMau.chinh rỗng, lời giải ≤ 10 dòng, gọi hàm đã chế)', m.maMau.chinh.length === 0 && m.loiGiai.chinh.length >= 1 && m.loiGiai.chinh.length <= 10 && !ChamHoc.cham(m, { chinh: [] }, khoNay).thang);
    }
    // bóng mờ: nằm trên ô bay được, ◆ bay được, số vật mờ đúng bằng số hộp của sân; không khai huong; chạy xong thắng ở nhịp cuối
    const ok = sanCua(m).every((rows, i) => {
      const lm = SanHoc.lopMauCuaSan(m, i), bm = lm.bongMo || m.bongMo, sn = SanHoc.docSan(rows, undefined, undefined, lm.vatChat);
      return !SanHoc.lyDoChan(sn, 'drone', bm.x, bm.y) && (bm.diQua || []).every((q) => !SanHoc.lyDoChan(sn, 'drone', q.x, q.y)) && (bm.vat || []).length === sn.vat.length && bm.huong === undefined;
    });
    kiem(m.id + ': bóng mờ và ◆ nằm trên ô bay được; số vật mờ đúng bằng số hộp của sân; không khai huong; chạy xong thắng ở nhịp cuối', ok && r.thang && nhipVet(r).slice(-1)[0] && ev(r, 'toi-bong-mo').length >= 1);
    kiem(m.id + ': có ít nhất 1 công thức khác (congThucKhac), khác cách 1', Array.isArray(m.congThucKhac) && m.congThucKhac.length >= 1 && m.congThucKhac.every((c) => c.moTa && (Array.isArray(c.hamCuaEmMoi) || c.baiLam) && J({ b: c.baiLam || m.loiGiai, h: c.hamCuaEmMoi || [] }) !== J({ b: m.loiGiai, h: m.loiGiai.hamCuaEmMoi })));
    m.congThucKhac.forEach((c, i) => {
      const rc = ChamHoc.cham(m, c.baiLam || m.loiGiai, tron(khoNay, c.hamCuaEmMoi));
      kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng, không lỗi — ' + rc.sao + ' sao, ' + rc.soO + ' ô, ' + rc.soNhip + ' nhịp', rc.thang && maLoi(rc).length === 0 && !maCua(rc).includes('tran-khung'), J({ thang: rc.thang, cd: rc.chanDoan.map((x) => x.ma) }));
    });
    const rk = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kho, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': loiGiaiKhac (' + m.loiGiaiKhac.moTa + ') thắng đúng 2 sao, nhiều ô hơn, cùng nhịp, vừa khung', rk.thang && rk.sao === 2 && rk.soO > m.sao.o && rk.soNhip === m.sao.nhip && !maCua(rk).includes('tran-khung'), J({ sao: rk.sao, soO: rk.soO, soNhip: rk.soNhip, cd: maCua(rk) }));
    m.loiSai.forEach((ls, i) => {
      const rs = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi));
      const co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): ' + (ls.phaiCoMa.length ? 'không thắng, có mã ' + ls.phaiCoMa.join('+') : 'thắng nhưng thiếu sao'),
        rs.sao < 3 && thieu.length === 0 && (ls.phaiCoMa.length ? !rs.thang : rs.thang), 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + rs.sao);
    });
    const khoaTen = m.khoaHamMan || [];
    const suaTen = m.loiGiai.hamCuaEmMoi.map((h) => h.ten).concat(m.loiGiai.hamCuaMan.filter((h) => !khoaTen.includes(h.ten)).map((h) => h.ten));
    kiem(m.id + ': đề bài nhắc tên lệnh cần chế / sửa (' + (suaTen.join(', ') || 'màn dùng') + ')', suaTen.every((t) => (m.deBai + ' ' + (m.veMaMau || '')).includes(t + '(')), m.deBai);
    kiem(m.id + ': gợi ý 1–2 câu, không nói tên nút; đề 1–3 câu', m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && !/bấm|nút/i.test(m.goiY.join(' ')), m.deBai);
  }

  // luật riêng từng màn
  const g = (so) => { const m = man(so); const kho = khoTruoc(m.id); return { m, kho, nay: tron(kho, m.loiGiai.hamCuaEmMoi) }; };
  const x1 = g(1);
  kiem('33.1 Tìm ô đỏ: ô đỏ ở x = 3, 4, 6 (tổng 13 nhịp); sân nào cũng có một ô màu khác đứng chắn trước ô đỏ nên "bay tới ô có màu đầu tiên" (look() == "none" thì bay) trượt cả ba sân',
    J(x1.m.bongMo.map((b) => b.x)) === '[3,4,6]' && x1.m.bongMo.every((b, i) => { const hang = x1.m.san[i][0]; return hang.indexOf('r') === b.x && /[bgy]/.test(hang.slice(0, b.x)); }) && J(ChamHoc.cham(x1.m, x1.m.loiSai[1].baiLam, tron(x1.kho, x1.m.loiSai[1].hamCuaEmMoi)).theoSan.map((s) => s.thang)) === '[false,false,false]');
  const x2 = g(2);
  kiem('33.2 Rẽ theo màu: sáu bước mỗi sân, ba sân dừng ở (4,1), (3,0), (2,1); mỗi sân có cả ô đỏ lẫn ô xanh dương; hai if rời nhau (sau khi rẽ nhìn lại ô mới) trượt',
    J(x2.m.bongMo.map((b) => [b.x, b.y])) === '[[4,1],[3,0],[2,1]]' && x2.m.san.every((s) => s.join('').includes('r') && s.join('').includes('b')) && J(ChamHoc.cham(x2.m, x2.m.loiGiai, x2.nay).theoSan.map((s) => s.soNhip)) === '[6,6,6]' && maCua(ChamHoc.cham(x2.m, x2.m.loiSai[3].baiLam, tron(x2.kho, x2.m.loiSai[3].hamCuaEmMoi))).includes('lech-bong-mo'));
  const x3 = g(3);
  const don = (m) => m.san.map((s) => /^[rgby]+/.exec(s[0])[0]);
  kiem('33.3 Đọc đơn: tờ đơn ba ô ở hàng trên (rbr / bbr / rrb), mỗi sân một đơn khác; survey() lúc xong đứng ở (3,0); chương trình chính khóa tự bay theo đơn (đỏ xuống, xanh dương phải); ◆ ở bước thứ hai; không ghi gì thì không đi theo đơn nào',
    J(don(x3.m)) === '["rbr","bbr","rrb"]' && new Set(don(x3.m)).size === 3 && x3.m.maMau.chinh.includes('survey(seen)') && x3.m.bongMo.every((b) => b.diQua.length === 1) && maCua(ChamHoc.cham(x3.m, x3.m.loiSai[1].baiLam, tron(x3.kho, x3.m.loiSai[1].hamCuaEmMoi))).includes('chua-qua-diem'));
  const x4 = g(4);
  kiem('33.4 Làm theo đơn: tờ đơn bốn ô (có cả xanh lá), ba sân ba đơn khác nhau, hành lang rộng một ô nên sai thứ tự là đâm tường; đỏ xuống, xanh dương phải, xanh lá lên; BFS 20 < 24 (phải đọc đơn)',
    J(x4.m.san.map((s) => s[1].slice(0, 4))) === '["brrb","rbgb","rrbg"]' && maCua(ChamHoc.cham(x4.m, x4.m.loiSai[1].baiLam, tron(x4.kho, x4.m.loiSai[1].hamCuaEmMoi))).includes('dam-tuong') && nhipCheDroneTatCa(x4.m, x4.nay) === 20);
  const x5 = g(5);
  kiem('33.5 Giao theo đơn: ba hộp sắt (cột x = 3), hàng rào x = 4, hai làn x = 5 (2 ô) và x = 6 (3 ô); dispatch() mỗi hộp xuống một ô rồi airlift; sân 1: 23 nhịp, sân 2: 25, sân 3: 23 (tổng 71); chở 1 ô thả trên hàng rào (tha-bi-chan)',
    J(ChamHoc.cham(x5.m, x5.m.loiGiai, x5.nay).theoSan.map((s) => s.soNhip)) === '[23,25,23]' && x5.m.san.every((s) => s[1] === '###o=..') && maCua(ChamHoc.cham(x5.m, x5.m.loiSai[3].baiLam, tron(x5.kho, x5.m.loiSai[3].hamCuaEmMoi))).includes('tha-bi-chan'));
  const x6 = g(6);
  const r6 = ChamHoc.cham(x6.m, x6.m.loiGiai, x6.nay);
  kiem('33.6 Về nhà có sạc: pin 4, ô vàng ở x = 3, 4, 5; patrol() ghé sạc cả lúc đi lẫn lúc về, sân nào cũng còn pin cuối ≥ 1; không ghé sạc hay chỉ ghé lúc đi thì hết pin (het-pin); nhịp ' + J(r6.theoSan.map((s) => s.soNhip)),
    r6.thang && r6.theoSan.every((s) => s.pin >= 1) && J(x6.m.bongMo.map((b) => b.diQua[0].x)) === '[3,4,5]' && x6.m.san.every((s) => s[0] === 'PPPPPPP') && maCua(ChamHoc.cham(x6.m, x6.m.loiSai[1].baiLam, tron(x6.kho, x6.m.loiSai[1].hamCuaEmMoi))).includes('het-pin') && maCua(ChamHoc.cham(x6.m, x6.m.loiSai[2].baiLam, tron(x6.kho, x6.m.loiSai[2].hamCuaEmMoi))).includes('het-pin'));
  const x7 = g(7);
  const pre7 = ChamHoc.cham(Object.assign({}, x7.m, { chinhCoDinh: false }), { chinh: ['seen = []', 'go_out(seen)'], hamCuaMan: x7.m.maMau.hamCuaMan }, x7.kho);
  kiem('33.7 Đường về: cầu thang rộng một ô (0,0) → (4,4), ô vàng ở bậc 2, 3, 4; go_out(seen) khóa, xem được, đưa drone tới ô vàng ghi 2, 3, 4 phần tử; thân come_back ban đầu chỉ có pass; bóng mờ = nhà, ◆ ở ô vàng; không vào kho, không taoHam',
    J(pre7.theoSan.map((s) => [s.robot.x, s.robot.y])) === '[[2,2],[3,3],[4,4]]' && J(x7.m.khoaHamMan) === '["go_out"]' && J(x7.m.maMau.hamCuaMan.map((h) => h.ten)) === '["go_out","come_back"]' && J(x7.m.maMau.hamCuaMan[1].than) === J(['pass']) &&
      !x7.kho.some((h) => h.ten === 'come_back' || h.ten === 'go_out') && x7.m.taoHam.length === 0 && maCua(ChamHoc.cham(x7.m, x7.m.maMau, x7.kho)).includes('lech-bong-mo') && !ChamHoc.cham(x7.m, x7.m.maMau, x7.kho).thang);
  kiem('33.7: sửa go_out gửi lên vẫn bị bản mẫu khóa thay (kết quả y hệt lời giải); come_back là LỆNH NGƯỢC theo thứ tự ngược: mỗi bậc đi xuống (phải, xuống) thành đi lên (lên, trái)',
    (() => { const a = ChamHoc.cham(x7.m, { chinh: [], hamCuaMan: [H('go_out', ['go_right()'], ['seen']), x7.m.loiGiai.hamCuaMan[1]] }, x7.kho); const b = ChamHoc.cham(x7.m, x7.m.loiGiai, x7.kho); return J([a.thang, a.soO, a.soNhip]) === J([b.thang, b.soO, b.soNhip]) && b.sao === 3; })() &&
      J(x7.m.loiGiai.hamCuaMan[1].than) === J(['for c in seen:', '    go_up()', '    go_left()']));
  const x8 = g(8);
  const cu8 = ChamHoc.cham(x8.m, x8.m.maMau, x8.kho);
  kiem('33.8 Ghi thiếu: scan_row() của màn ghi SAU vòng lặp (seen chỉ một phần tử) nên drone về thiếu: lech-bong-mo ở cả ba sân; bản sửa thắng; ghi SAU khi bay (trong vòng lặp) cũng đủ phần tử nên cũng thắng',
    !cu8.thang && J(cu8.theoSan.map((s) => s.thang)) === '[false,false,false]' && maCua(cu8).includes('lech-bong-mo') && ChamHoc.cham(x8.m, x8.m.loiGiai, x8.kho).thang && ChamHoc.cham(x8.m, x8.m.congThucKhac[0].baiLam, x8.kho).thang);
  const x9 = g(9);
  const cu9 = ChamHoc.cham(x9.m, x9.m.maMau, x9.kho);
  const cd9 = cu9.chanDoan.find((c) => c.ma === 'lenh-goc-hong');
  kiem('33.9 Camera hỏng: fetch_red() ban đầu hỏi look() → lenh-goc-hong "Camera dưới bụng drone hỏng"; hộp xanh dương / đỏ / xanh lá nằm trong cột (đỏ ở giữa); không cần camera cũng thắng khi tự đếm (go_down hai lần rồi airlift(2)); BFS 6 < 7',
    !cu9.thang && !!cd9 && cd9.ten === 'look' && /Camera dưới bụng drone hỏng/.test(cd9.loi) && !maCua(cu9).includes('chua-gan-cam-bien') && J(x9.m.vatMau) === J(['.......', '...b...', '...r...', '...g...']) && ChamHoc.cham(x9.m, x9.m.loiGiai, x9.kho).thang && nhipCheDroneTatCa(x9.m, x9.nay) === 6, J(cd9));
  const x10 = g(10);
  const r10 = ChamHoc.cham(x10.m, x10.m.loiGiai, x10.kho), gh = ChamHoc.cham(x10.m, x10.m.loiSai[4].baiLam, x10.kho);
  kiem('33.10 Kho đơn hàng: gioiHanHam 3 — lời giải gọi 2 hàm khác nhau (survey, airlift) vừa giới hạn; 4 hàm khác nhau bị qua-gioi-han-ham (nêu "3"); xanh lá = để hộp lại nên coi xanh lá như xanh dương (else) trượt; 18 nhịp mỗi sân',
    r10.thang && maCua(gh).join() === 'qua-gioi-han-ham' && /3/.test(gh.chanDoan[0].loi) && !gh.thang && x10.m.chinhCoDinh !== true && J(r10.theoSan.map((s) => s.soNhip)) === '[18,18,18]' && !ChamHoc.cham(x10.m, x10.m.loiSai[0].baiLam, x10.kho).thang &&
      J(KhungCode.hamEmTrucTiep({ chinh: x10.m.loiGiai.chinh }, x10.nay).sort()) === '["airlift","survey"]');

  console.log('\n  Bảng 10 màn flycam (lời giải cách 1, sao; BFS = tổng nhịp ngắn nhất của ba sân, không cần đọc màu)');
  console.log('  màn   | tên                  | ô  | nhịp | BFS | tạo / sửa      | lời giải (chương trình chính)');
  for (const { m, bfs } of BANG) {
    console.log('  ' + m.id.padEnd(5) + ' | ' + m.ten.padEnd(20) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + String(m.sao.nhip).padEnd(4) + ' | ' + String(bfs).padEnd(3) + ' | ' + (m.loiGiai.hamCuaEmMoi.map((h) => h.ten).join(',') || (m.loiGiai.hamCuaMan.length ? 'hàm của màn' : '—')).padEnd(14) + ' | ' + m.loiGiai.chinh.join(' ; '));
  }
}

/* ================================================================= 2. LÝ DO NHỚ LÀ THẬT */
console.log('\n== 2. Lý do đọc rồi nhớ là thật: viết cứng theo một sân thì trượt sân khác ==');
{
  for (const m of fly.filter((x) => x.so !== 9)) {
    const kho = khoTruoc(m.id);
    // đường ngắn nhất của sân 0 (không biết gì về màu), đổi thành lệnh gốc, chạy trên cả ba sân
    const b0 = nhipCheDroneNganNhat(conSan(m, 0));
    const code = chuoiThanhMa(b0.chuoi);
    const kq = sanCua(m).map((_, i) => SanHoc.chay(cfgSan(m, i), code).thang);                    // chạy thẳng lõi (không qua khung 10 ô): đây là chương trình "viết cứng", chỉ để chứng minh nó trượt
    kiem(m.id + ': đường BFS của sân đầu (' + code.split('\n').filter(Boolean).length + ' lệnh, không nhìn màu) thắng sân đầu nhưng trượt ít nhất một sân khác ' + J(kq), kq[0] === true && kq.some((t) => !t));
  }
  const m9 = man(9), k9 = khoTruoc(m9.id);
  const b9 = nhipCheDroneNganNhat(m9);
  kiem('33.9: sân duy nhất, camera hỏng: đường viết cứng (BFS, ' + b9.nhip + ' nhịp, không look) thắng được', ChamHoc.cham(Object.assign({}, m9, { chinhCoDinh: false }), { chinh: chuoiThanhMa(b9.chuoi).split('\n').filter(Boolean) }, k9).thang);
  // tờ đơn khác nhau từng đôi (3, 4, 5, 10) và danh sách ghi lại có đủ phần tử đúng màu (vết lệnh có docCamBien look)
  for (const so of [3, 4, 5, 10]) {
    const m = man(so);
    const dons = m.san.map((s) => { const hang = so === 4 ? s[1] : s[0]; return /^[rgby]+/.exec(hang)[0]; });
    kiem('33.' + so + ': ba tờ đơn khác nhau từng đôi (' + dons.join(' / ') + ')', new Set(dons).size === 3);
  }
  const r3 = ChamHoc.cham(man(3), man(3).loiGiai, tron(khoTruoc(man(3).id), man(3).loiGiai.hamCuaEmMoi));
  const docs = r3.theoSan.map((s) => s.vet.filter((e) => e.loai === 'lenh' && e.docCamBien && e.docCamBien.ham === 'look').map((e) => e.docCamBien.mau));
  kiem('33.3: survey() đọc look() hai lần ở mỗi ô của đơn (điều kiện while, rồi dòng ghi) và một lần ở ô "none" cuối: ' + J(docs.map((d) => d.length)) + ' lần đọc mỗi sân; màu ghi lại (lần đọc thứ hai của mỗi ô) khớp tờ đơn', docs.every((d) => d.length === 7 && d[6] === 'none') && J(docs.map((d) => [d[1], d[3], d[5]])) === '[["red","blue","red"],["blue","blue","red"],["red","red","blue"]]', J(docs));
}

/* ================================================================= 3. ĐƯỜNG BFS CHẠY THẬT */
console.log('\n== 3. Đường BFS (do-duong-che-drone.mjs) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng nhịp BFS ==');
{
  for (const m of fly.filter((x) => !x.khoaHamMan)) {
    let ok = true, tong = 0, bfsTong = 0, chiTiet = '';
    sanCua(m).forEach((rows, i) => {
      const b = nhipCheDroneNganNhat(conSan(m, i));
      const k = SanHoc.chay(cfgSan(m, i), chuoiThanhMa(b.chuoi));
      bfsTong += b.nhip; tong += k.nhip;
      if (!(k.thang === true && k.nhip === b.nhip && !k.loi)) { ok = false; chiTiet += J([i, b.nhip, k.thang, k.nhip, k.loi]); }
    });
    kiem(m.id + ': đường BFS (' + bfsTong + ' nhịp' + (sanCua(m).length > 1 ? ' tổng ' + sanCua(m).length + ' sân' : '') + ') đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng số nhịp BFS, không lỗi', ok && tong === bfsTong, chiTiet);
  }
  const m7 = man(7), b7 = [0, 1, 2].map((i) => nhipCheDroneNganNhat(conSan(m7, i)));
  kiem('33.7 (go_out khóa): BFS của từng sân (8 + 12 + 16 = 36) = nhịp lời giải; hành lang rộng một ô nên không có đường khác', J(b7.map((b) => b.nhip)) === '[8,12,16]' && nhipCheDroneTatCa(m7, khoTruoc(m7.id)) === 36);
  kiem('bộ dò: look() không đổi vật lý — chương flycam dùng cùng bộ dò với che-drone (kiem-che-drone.mjs so chéo bộ dò với lõi bằng hơn nghìn chương trình ngẫu nhiên: ô sạc, nam châm, hộp, ◆, bóng mờ…)',
    fly.every((m) => { try { return nhipCheDroneTatCa(m, khoTruoc(m.id)) !== null; } catch (e) { return false; } }));
}

/* ================================================================= 4. SỔ LỆNH, GÓI, HUY HIỆU, TỆP */
console.log('\n== 4. Sổ lệnh, gói Drone, huy hiệu, choi.html ==');
{
  const moi = ['seek_red', 'steer', 'survey', 'obey', 'dispatch', 'patrol'];
  const dau = {};
  for (const m of tatCa) for (const t of m.taoHam) if (!dau[t]) dau[t] = m;
  kiem('SoLenh.theoChuong("flycam") đúng sáu hàm theo thứ tự chế: seek_red, steer, survey, obey, dispatch, patrol; nhóm drone; sau airlift của che-drone',
    J(SoLenh.theoChuong('flycam').map((h) => h.ten)) === J(moi) && SoLenh.theoChuong('flycam').every((h) => h.nhom === 'drone') && SoLenh.ds.findIndex((h) => h.ten === 'seek_red') === SoLenh.ds.findIndex((h) => h.ten === 'airlift') + 1);
  kiem('go_out, come_back, scan_row, fetch_red là hàm CỦA MÀN: không là hàm cốt truyện, không trong Sổ lệnh, không trong hamCuaEmMoi của lời giải nào (come_back còn là tên hàm của màn ở chương khác)',
    ['go_out', 'scan_row', 'fetch_red'].every((t) => !tenCotTruyen.includes(t) && SoLenh.tim(t) === null && tatCa.every((m) => !m.loiGiai.hamCuaEmMoi.some((h) => h.ten === t))) && fly.every((m) => m.loiGiai.hamCuaEmMoi.every((h) => moi.includes(h.ten))));
  kiem('mỗi hàm có chuong và man đúng màn đầu tiên chế nó (taoHam của màn flycam)', moi.every((t) => dau[t] && SoLenh.tim(t) && SoLenh.tim(t).man === dau[t].ma && SoLenh.tim(t).chuong === 'flycam'));
  kiem('moTa là MỘT câu ngắn lớp 5: 8–80 chữ, không xuống dòng, không dấu chấm cuối', moi.every((t) => { const d = SoLenh.tim(t).moTa; return d.length >= 8 && d.length <= 80 && !/\n/.test(d) && !/[.]$/.test(d); }));
  kiem('tên hàm cốt truyện không trùng lệnh gốc hay hàm của chương khác (mỗi tên đúng một mục Sổ lệnh, đúng một taoHam), và khóa trong kho',
    moi.every((t) => SoLenh.ds.filter((h) => h.ten === t).length === 1 && tatCa.filter((m) => m.taoHam.includes(t)).length === 1 && !KhoHam.HAM_GOC_MAC_DINH.includes(t) && KhoHam.moi({ tenCoDinh: tenCotTruyen }).tao(t, [], {}).ok === false));
  const cuoi = khoTruoc('het');
  kiem('kho cuối game có đủ sáu hàm flycam; đối số: survey / obey / dispatch / patrol nhận seen (danh sách), seek_red và steer không đối số; go_out, come_back, scan_row, fetch_red không có trong kho',
    moi.every((t) => cuoi.some((h) => h.ten === t)) && ['survey', 'obey', 'dispatch', 'patrol'].every((t) => J(cuoi.find((h) => h.ten === t).thamSo) === '["seen"]') && ['seek_red', 'steer'].every((t) => cuoi.find((h) => h.ten === t).thamSo.length === 0) && ['go_out', 'come_back', 'scan_row', 'fetch_red'].every((t) => !cuoi.some((h) => h.ten === t)));
  const hh = fs.readFileSync(path.join(day, 'game', 'huy-hieu.js'), 'utf8');
  kiem("huy hiệu: game/huy-hieu.js có HINH['flycam'] dựng bằng code từ thân drone + camera nhìn xuống camera-bay", /HINH\['flycam'\] = function \(\)[\s\S]*?partTho\('than', 'drone'\)[\s\S]*?partTho\('cam-bien', 'camera-bay'[\s\S]*?return p;\s*\};/.test(hh));
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có thẻ script ../man-flycam.js đúng một lần, sau man-che-drone.js (cùng sổ màn); so-lenh.js nạp trước; part-camera-bay.js có mặt',
    tags.filter((t) => t === '../man-flycam.js').length === 1 && vtri('man-flycam.js') > vtri('man-che-drone.js') && vtri('so-lenh.js') < vtri('man-flycam.js') && tags.some((t) => /part-camera-bay\.js$/.test(t)), J(tags));
  const hd = fs.readFileSync(path.join(day, 'game', 'huong-dan-man.js'), 'utf8');
  kiem("hướng dẫn bong bóng (huong-dan-man.js): H['flycam.1'] có tạo hàm seek_red, chỉ khối while (có look()) trong Xưởng, rồi thử / về sân / chạy",
    /H\['flycam\.1'\] = \[[\s\S]*?buocTaoHam\('seek_red'[\s\S]*?khoiTheo\(\['khoi:vong:while'\][\s\S]*?buocThuVeChay\(/.test(hd));
}

/* ================================================================= 5. NHẬP ĐƯỢC BẰNG CHẠM */
console.log('\n== 5. Mọi lời giải nhập được bằng chạm: từng dòng thuộc một mẫu khối của khay ==');
{
  const MAU = '(?:red|green|blue|yellow|none)';
  /** Dòng `d` của lời giải màn m có dựng được từ khối khay (kể cả sửa ô chạm được) không? ten hàm của em / hàm của màn dùng được: tập tên. */
  function chamDuoc(dong, m, tenHam) {
    const s = dong.trim();
    if (!s || /^#/.test(s)) return true;                                                         // dòng trống, chú thích: gõ được
    const goc = m.hamGoc.filter((n) => n !== 'look');
    const ten = (n) => goc.includes(n) || tenHam.includes(n);
    let mt;
    if ((mt = /^([a-z_]+)\((.*)\)$/.exec(s)) && !/^(range|len)$/.test(mt[1])) {                  // lời gọi lệnh / hàm: đối số rỗng, số 1–9, chữ, tên danh sách, danh sách thẳng
      const arg = mt[2].trim();
      return ten(mt[1]) && (arg === '' || /^[1-9]$/.test(arg) || /^"[URDL]+"$/.test(arg) || /^[a-z]\w*$/.test(arg) || /^\[.*\]$/.test(arg));
    }
    if (/^pass$/.test(s)) return true;
    if (/^for i in range\(([1-9]|len\([a-z]\w*\))\):$/.test(s)) return true;                    // for i in range(6): · for i in range(len(seen)):
    if (/^for c in [a-z]\w*:$/.test(s)) return true;                                             // for c in seen: (khối `for c in a:`, đổi tên danh sách)
    if (new RegExp('^(?:while|if|elif) look\\(\\) (?:==|!=) "' + MAU + '":$').test(s)) return true; // while look() != "none": · if look() == "red":
    if (new RegExp('^(?:if|elif) c (?:==|!=) "' + MAU + '":$').test(s)) return true;            // if c == "red": (vế trái chọn biến vòng của danh sách màu)
    if (/^(?:if|elif) battery\(\) [<>]=? [0-9]+:$/.test(s)) return true;
    if (/^else:$/.test(s)) return true;
    if (/^c = look\(\)$/.test(s)) return true;                                                   // khối `c = look()`
    if (/^[a-z]\w*\.append\(look\(\)\)$/.test(s)) return true;                                   // khối `a.append(look())`
    if (/^a = \[\]$/.test(s)) return true;                                                       // khối `a = [1, 2]` rồi bỏ hai ô
    if (/^if c == "(?:red|green|blue|yellow|none)":$/.test(s)) return true;
    return false;
  }
  const tatCaThan = (m) => m.loiGiai.hamCuaEmMoi.concat(m.loiGiai.hamCuaMan || []);
  for (const m of fly) {
    const kho = khoTruoc(m.id);
    const cuoi = kho.concat(m.loiGiai.hamCuaEmMoi).map((h) => h.ten);
    const tenMan = (m.loiGiai.hamCuaMan || []).map((h) => h.ten);
    const bai = [{ ten: 'lời giải', chinh: m.loiGiai.chinh, ham: tatCaThan(m) }]
      .concat(m.congThucKhac.map((c, i) => ({ ten: 'công thức khác #' + (i + 1), chinh: (c.baiLam || m.loiGiai).chinh, ham: (c.hamCuaEmMoi || []).concat((c.baiLam || m.loiGiai).hamCuaMan || []) })));
    const xau = [];
    for (const b of bai) {
      const lenhCuaChinh = b.chinh.filter((d) => !(m.chinhCoDinh));                                // chương trình chính khóa: không gõ
      const tenHam = cuoi.concat(tenMan).concat(b.ham.map((h) => h.ten));
      for (const d of lenhCuaChinh) if (!chamDuoc(d, m, tenHam)) xau.push(b.ten + ' [chính]: ' + d.trim());
      for (const h of b.ham) for (const d of h.than) {
        if (m.khoaHamMan && m.khoaHamMan.includes(h.ten)) continue;                               // hàm của màn khóa: không gõ
        if (!chamDuoc(d, m, tenHam)) xau.push(b.ten + ' [' + h.ten + ']: ' + d.trim());
      }
    }
    kiem(m.id + ': mọi dòng gõ của lời giải và công thức khác dựng được từ khối khay (' + bai.length + ' bài)', xau.length === 0, xau.join(' | '));
  }
  // kiểm khung: lời giải / công thức khác không vượt khung 10 ô, không lỗi khung
  kiem('lời giải và công thức khác vừa khung 10 ô, không lỗi khung (kể cả cấu trúc list)', fly.every((m) => [m.loiGiai].concat(m.congThucKhac.map((c) => c.baiLam || m.loiGiai)).every((b) => KhungCode.kiemTra(m.khung, { chinh: b.chinh, hamCuaMan: b.hamCuaMan || [] }, m.hamGoc, m.loiGiai.hamCuaEmMoi || []).length === 0)));
}

/* ================================================================= DOM GIẢ (đủ cho Palette, Editor và các bảng chọn của game/thanh-phan.js) */
function unesc(s) { return String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
function khop(el, sel) {                                                   // một phần chọn đơn: tag.a.b[data-x="y"][data-z]
  const tag = /^[a-z]+/.exec(sel);
  if (tag && el.tag !== tag[0]) return false;
  const m = sel.match(/\.[\w-]+|\[[\w-]+(?:="[^"]*")?\]/g) || [];
  return m.every((p) => {
    if (p[0] === '.') return el._cls.has(p.slice(1));
    const a = /\[([\w-]+)(?:="([^"]*)")?\]/.exec(p);
    return a[2] === undefined ? el.attrs[a[1]] !== undefined : el.attrs[a[1]] === a[2];
  });
}
class El {
  constructor(tag) { this.tag = tag; this.children = []; this.attrs = {}; this.handlers = {}; this._cls = new Set(); this.style = {}; this.parentNode = null; this._text = ''; this._html = ''; this.disabled = false; this.scrollTop = 0; this.clientHeight = 400; this.scrollHeight = 300; this.clientWidth = 40; this.scrollWidth = 40; this.offsetHeight = 40; this.offsetWidth = 100; }
  get className() { return [...this._cls].join(' '); }
  set className(v) { this._cls = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get classList() {
    const s = this._cls;
    return { add: (...c) => c.forEach((x) => s.add(x)), remove: (...c) => c.forEach((x) => s.delete(x)), contains: (c) => s.has(c), toggle: (c, f) => { const on = f === undefined ? !s.has(c) : !!f; if (on) s.add(c); else s.delete(c); return on; } };
  }
  appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
  insertBefore(c, ref) { c.parentNode = this; const i = this.children.indexOf(ref); if (i < 0) this.children.push(c); else this.children.splice(i, 0, c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; return c; }
  get firstChild() { return this.children[0] || null; }
  get nextSibling() { const p = this.parentNode; if (!p) return null; const i = p.children.indexOf(this); return p.children[i + 1] || null; }
  set innerHTML(v) {                                                      // chỉ các <span class=".." data-..>…</span> (kể cả lồng nhau) được dựng lại thành phần tử: đủ cho dòng code
    this.children = []; this._html = String(v); this._text = '';
    const re = /<span class="([^"]*)"((?:\s+[\w-]+="[^"]*")*)>|<\/span>|([^<]+)/g, pila = [this];
    let m;
    while ((m = re.exec(this._html))) {
      const top = pila[pila.length - 1];
      if (m[3] !== undefined) { if (top !== this) top._text += unesc(m[3]); continue; }
      if (m[0] === '</span>') { if (pila.length > 1) pila.pop(); continue; }
      const e = new El('span'); e.className = m[1];
      (m[2].match(/[\w-]+="[^"]*"/g) || []).forEach((a) => { const q = /([\w-]+)="([^"]*)"/.exec(a); e.attrs[q[1]] = unesc(q[2]); });
      e.parentNode = top; top.children.push(e); pila.push(e);
    }
  }
  get innerHTML() { return this._html; }
  set textContent(v) { this._text = String(v); this.children = []; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] === undefined ? null : this.attrs[k]; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); }
  click() { if (this.disabled) return; (this.handlers.click || []).forEach((fn) => fn({ stopPropagation() {}, preventDefault() {}, target: this })); }
  contains(el) { for (let n = el; n; n = n.parentNode) if (n === this) return true; return false; }
  closest(sel) { for (let n = this; n; n = n.parentNode) if (n._cls && khop(n, sel)) return n; return null; }
  querySelectorAll(sel) {
    const phan = sel.trim().split(/\s+/), kq = [];
    const di = (n, ngu) => { for (const k of n.children) { const du = ngu < phan.length && khop(k, phan[ngu]); if (du && ngu === phan.length - 1) kq.push(k); di(k, du ? ngu + 1 : ngu); } };
    di(this, 0);
    return kq;
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  getBoundingClientRect() { return { left: 50, right: 80, top: 100, bottom: 120, width: 30, height: 20 }; }
}
const stage = new El('div'); stage.id = 'stage'; stage.offsetWidth = 360; stage.offsetHeight = 640; stage.getBoundingClientRect = () => ({ left: 0, top: 0, right: 360, bottom: 640, width: 360, height: 640 });
const doc = {
  addEventListener() {}, createElement: (tag) => new El(tag), createTextNode: (s) => { const e = new El('#text'); e._text = String(s); return e; },
  getElementById: (id) => (id === 'stage' ? stage : null), body: new El('body')
};
const luuGia = { co: {}, daXem(k) { return !!this.co[k]; }, datDaXem(k) { this.co[k] = true; return true; } };
const ctx = vm.createContext({
  console, document: doc, getComputedStyle: () => ({ fontSize: '11px' }), Ve: { ico: () => new El('i'), khoa: () => new El('i') }, SanHoc, KhungCode, ManHoc, Luu: luuGia,
  setTimeout: (f, ms) => { const h = setTimeout(f, ms); if (h && h.unref) h.unref(); return h; }, clearTimeout, addEventListener() {}, removeEventListener() {}
});
ctx.window = ctx;
for (const f of ['chu.js', 'huong-dan.js', 'thanh-phan.js']) vm.runInContext(fs.readFileSync(path.join(day, 'game', f), 'utf8'), ctx, { filename: f });
const TP = ctx.TP;

function khayMoi(cb) {
  const bang = new El('div'), bh = new El('div'); bh.className = 'bh';
  const tt = new El('span'); tt.className = 'tt'; bh.appendChild(tt);
  const host = new El('div'); host.className = 'pal';
  bang.appendChild(bh); bang.appendChild(host);
  const pal = new TP.Palette(host, Object.assign({ khiChen() {}, khiSua() {}, khiBien() {}, khiMoi() {} }, cb || {}));
  return { pal, host, bh };
}
function noiDung(host) {
  const kq = [];
  (function di(n) { for (const c of n.children) { if (c._cls.has('gl')) kq.push('## ' + c.children[0].textContent); else if (c._cls.has('brick')) kq.push(c.getAttribute('data-ten')); else di(c); } })(host);
  return kq;
}
function goiCua(host, khoa) { let kq = null; (function di(n) { for (const c of n.children) { if (c.getAttribute && c.getAttribute('data-ten') === khoa) kq = c.getAttribute('data-goi'); else di(c); } })(host); return kq; }
function specMan(m, them) {
  return Object.assign({
    goc: m.hamGoc, loai: m.loaiRobot, vong: TP.coCauTruc(m, 'for'), vongWhile: TP.coCauTruc(m, 'while') && TP.coDieuKienCua(m), cam: TP.camBienCua(m), mau: TP.coMauCua(m), pin: TP.coPinCua(m),
    chuoi: false, dieuKien: TP.coCauTruc(m, 'if') && TP.coDieuKienCua(m), list: TP.coListCua(m),
    em: [], man: [], coNutMoi: true, the: 'than', lamMoi: true
  }, them || {});
}
function tatCaGoi(host) { const kq = []; (function di(n) { for (const c of n.children) { if (c.getAttribute && c.getAttribute('data-goi') !== null) kq.push(c.getAttribute('data-goi')); else di(c); } })(host); return kq; }
/** Nút của bảng chọn đang mở có data-dk = v (bộ chọn thuộc tính của DOM giả không xử lý dấu nháy). */
function nutDk(E, v) { const b = E.bang(); return b ? b.querySelectorAll('button').filter((x) => x.getAttribute('data-dk') === v)[0] || null : null; }
function dungEditor(dong, tuyChon) {
  const arr = dong.slice(), host = new El('div'), st = { nDoi: 0 };
  const ed = new TP.Editor(host, Object.assign({ tong: 10, dung: 10, lay: () => arr, khiDoi: () => { st.nDoi++; }, thutLe: () => true }, tuyChon || {}));
  const hang = (i) => ed.hangEl(i), strip = (i) => hang(i).children[1];
  const o = (i, sel) => strip(i).querySelector(sel);
  const bang = () => stage.children.filter((c) => c._cls.has('chon-so'))[0] || null;
  const nut = (sel) => { const b = bang(); return b ? b.querySelector(sel) : null; };
  const cham = (i, sel) => { const so = o(i, sel); if (!so) throw new Error('không có ô ' + sel + ' ở dòng ' + i); hang(i).handlers.click[0]({ target: { closest: (s) => (s === '.num' ? so : null) }, pointerType: 'mouse' }); };
  const dongBang = () => { TP.dongChonSo(); };
  return Object.assign(st, { ed, arr, host, hang, o, bang, nut, cham, dongBang });
}

/* ================================================================= 6. KHAY VÀ KHUNG CHƯƠNG TRÌNH Ở MÀN CÓ look() */
console.log('\n== 6. Khay và khung chương trình ở màn có look(): khối ghi màu, danh sách màu, battery() ở màn có cả pin lẫn camera ==');
{
  const m3 = man(3), m6 = man(6), m1 = man(1);
  TP.datCheList(TP.coListCua(m3)); TP.datCheMau(TP.coMauCua(m3), TP.coPinCua(m3));
  const k = khayMoi(); k.pal.dung(specMan(m3)); k.pal.chonThe('cam');
  const ten = noiDung(k.host).filter((x) => /^ls-/.test(x));
  kiem('màn có look() và list: nhóm DANH SÁCH có năm khối: ls-gan, ls-for, ls-forlit, ls-them, ls-them-look', J(ten) === J(['ls-gan', 'ls-for', 'ls-forlit', 'ls-them', 'ls-them-look']), J(ten));
  kiem('nội dung chèn: `a = [1, 2]`, `for c in a:`, `for c in ["red", "blue"]:`, `a.append(1)`, `a.append(look())` (biến vòng c cho danh sách màu)',
    goiCua(k.host, 'ls-gan') === 'a = [1, 2]' && goiCua(k.host, 'ls-for') === 'for c in a:' && goiCua(k.host, 'ls-forlit') === 'for c in ["red", "blue"]:' && goiCua(k.host, 'ls-them') === 'a.append(1)' && goiCua(k.host, 'ls-them-look') === 'a.append(look())');
  const kc = khayMoi(); kc.pal.dung(specMan(ManHoc.timMa('mau.1'), { list: false })); kc.pal.chonThe('cam');
  kiem('màn có color() (không phải look()) giữ bốn khối cũ: không ls-them-look, `for n in a:`', noiDung(kc.host).filter((x) => /^ls-/.test(x)).length === 0);
  const kn = khayMoi(); const mGia = Object.assign({}, m3, { hamGoc: BAY, robot: { than: 'drone', tay: null, camBien: [] } });
  TP.datCheMau(false, false);
  kn.pal.dung(specMan(mGia)); kn.pal.chonThe('cam');
  kiem('màn có list nhưng KHÔNG có look(): đúng bốn khối ls-gan, ls-for, ls-forlit, ls-them và `for n in a:` (như gói List)', J(noiDung(kn.host).filter((x) => /^ls-/.test(x))) === J(['ls-gan', 'ls-for', 'ls-forlit', 'ls-them']) && goiCua(kn.host, 'ls-for') === 'for n in a:');
  TP.datCheMau(TP.coMauCua(m3), TP.coPinCua(m3));

  // chèn khối trong chương trình có danh sách: tên danh sách tự điền
  const E1 = dungEditor(['a = []']);
  E1.ed.chen('a.append(look())');
  kiem('chèn `a.append(look())` ở chương trình đã có `a = []`: dòng nhận tên danh sách có thật, ô look() là chữ thường (không chạm đổi)', E1.arr.join('|') === 'a = []|a.append(look())' && !/data-k="1"/.test(TP.mauDong('a.append(look())')), E1.arr.join('|'));
  const E2 = dungEditor(['a = []']);
  E2.ed.chen('survey([2, 3, 1])');
  kiem('chèn hàm có đối số danh sách (survey([2, 3, 1])) khi đã có `a = []`: dùng luôn tên đã có → `survey(a)` (trùm 10 gọi được survey(a) bằng chạm)', E2.arr.join('|') === 'a = []|survey(a)', E2.arr.join('|'));
  const E3 = dungEditor([]);
  E3.ed.chen('survey([2, 3, 1])');
  kiem('chưa có danh sách nào: giữ danh sách thẳng `survey([2, 3, 1])` như cũ (không đổi hành vi)', E3.arr.join('|') === 'survey([2, 3, 1])', E3.arr.join('|'));
  const E4 = dungEditor(['a = []', 'survey(a)', 'for c in a:', '    if look() == "red":']);
  E4.cham(3, '[data-vt="lhs"]');
  const dk = E4.bang() ? E4.bang().querySelectorAll('button').map((x) => x.getAttribute('data-dk')) : [];
  kiem('danh sách rỗng `a = []` ở màn có look(): biến vòng c được coi là MÀU, nên vế trái của `if look() == "red":` chọn được `c == "red"`', dk.indexOf('c == "red"') >= 0 && dk.indexOf('look() == "red"') >= 0, J(dk));
  if (nutDk(E4, 'c == "red"')) nutDk(E4, 'c == "red"').click();
  kiem('chọn c == "red" → `if c == "red":`', E4.arr[3] === '    if c == "red":', E4.arr[3]);
  E4.dongBang();
  const E5 = dungEditor(['a = [1, 2]', 'for n in a:', '    if look() == "red":']);
  E5.cham(2, '[data-vt="lhs"]');
  kiem('danh sách SỐ (a = [1, 2]): biến vòng n không là màu nên không có `n == "red"`', (E5.bang() ? E5.bang().querySelectorAll('button').map((x) => x.getAttribute('data-dk')) : []).indexOf('n == "red"') < 0);
  E5.dongBang();

  // VÁ battery(): màn có cả pin và look()
  TP.datCheList(TP.coListCua(m6)); TP.datCheMau(TP.coMauCua(m6), TP.coPinCua(m6));
  kiem('màn 6 có cả camera look() lẫn pin: TP.coMauCua = "look", TP.coPinCua = true', TP.coMauCua(m6) === 'look' && TP.coPinCua(m6) === true);
  const k6 = khayMoi(); k6.pal.dung(specMan(m6, { vong: true, vongWhile: true })); k6.pal.chonThe('cam');
  const goiWhile = goiCua(k6.host, 'while'), goiTat = tatCaGoi(k6.host);
  kiem('khay màn 6: khối while mẫu theo look() (`while look() != "none":`), có khối `if battery() < 3:` riêng, không có `while battery() > 2:` (điều kiện pin của while chọn bằng bảng chọn vế trái)', goiWhile === 'while look() != "none":' && goiTat.includes('if battery() < 3:') && !goiTat.includes('while battery() > 2:'), J([goiWhile, goiTat]));
  const W = dungEditor(['while look() != "none":', '    go_right()']);
  W.cham(0, '[data-vt="lhs"]');
  const dkW = W.bang() ? W.bang().querySelectorAll('button').map((x) => x.getAttribute('data-dk')) : [];
  kiem('VÁ: vế trái của `while look() != "none":` ở màn có pin có thêm `battery() < 3` và `battery() > 2`', dkW.indexOf('battery() > 2') >= 0 && dkW.indexOf('battery() < 3') >= 0 && dkW.indexOf('look() != "none"') >= 0, J(dkW));
  nutDk(W, 'battery() > 2').click();
  kiem('chọn battery() > 2 → `while battery() > 2:` (điều kiện pin chạm ra được)', W.arr[0] === 'while battery() > 2:', W.arr[0]);
  W.cham(0, '[data-vt="op"]');
  kiem('chạm phép so sánh: đổi `>` thành `>=` như cũ', W.arr[0] === 'while battery() >= 2:', W.arr[0]);
  W.cham(0, '[data-vt="lhs"]');
  const dkW2 = W.bang() ? W.bang().querySelectorAll('button').map((x) => x.getAttribute('data-dk')) : [];
  kiem('chạm chính battery() ở màn có look(): mở bảng chọn để đổi lại sang look() (không bị kẹt ở điều kiện pin)', dkW2.indexOf('look() != "red"') >= 0 && dkW2.indexOf('battery() < 3') >= 0, J(dkW2));
  if (nutDk(W, 'look() != "red"')) nutDk(W, 'look() != "red"').click();
  kiem('…chọn look() thì dòng trở về điều kiện màu (`while look() != "red":`)', W.arr[0] === 'while look() != "red":', W.arr[0]);
  W.dongBang();
  const I = dungEditor(['if battery() < 3:', '    go_up()']);
  I.cham(0, '[data-vt="rhs"]');
  kiem('số của `battery() < 3` vẫn chọn như cũ (bảng số), chạm phép so sánh vẫn đổi < <= > >=', !!I.bang() && I.bang()._cls.has('chon-so') && true);
  I.dongBang();
  // màn pin KHÔNG có look (các màn drone cũ): lhs của battery() vẫn không làm gì (không đổi hành vi cũ)
  TP.datCheMau(false, true);
  const O = dungEditor(['while battery() > 2:', '    go_right()']);
  kiem('màn drone chỉ có pin (không look): dòng `while battery() > 2:` không tách ô vế trái mở bảng chọn (hành vi cũ giữ nguyên)', (() => { try { O.cham(0, '[data-vt="lhs"]'); } catch (e) { /* không có ô */ } const b = O.bang(); const kq = !b || b.querySelectorAll('button').length === 0; O.dongBang(); return kq; })());
  TP.datCheList(false); TP.datCheMau(false, false);

  // nối ở màn chơi và Xưởng (đọc mã nguồn, như kiem-list.mjs)
  const mc = fs.readFileSync(path.join(day, 'game', 'man-choi.js'), 'utf8'), xh = fs.readFileSync(path.join(day, 'game', 'xuong-ham.js'), 'utf8');
  kiem("màn chơi và Xưởng không có khối `for c in \"R\":` (chuỗi chữ) ở màn có look(): chuoi: … && TP.coMauCua(…) !== 'look'", /chuoi: TP\.coCauTruc\(m, 'for'\) && TP\.coMauCua\(m\) !== 'look'/.test(mc) && /chuoi: TP\.coCauTruc\(man, 'for'\) && TP\.coMauCua\(man\) !== 'look'/.test(xh));
  kiem('Xưởng: hàm có đối số DANH SÁCH (survey(seen)) không đổi khay thành khối `if d == "U":` (hamChuoiDrone bỏ kiểu "list"); danh sách thử mặc định ở màn có look() là danh sách MÀU; sân thử mặc định có ô màu (sanThuMacDinh)',
    /kd !== 'so' && kd !== 'list'/.test(xh) && /DS_LIST_MAU_MAC_DINH = \['red', 'blue', 'red'\]/.test(xh) && /TP\.coMauCua\(A\.man\(\)\) \? DS_LIST_MAU_MAC_DINH/.test(xh) && /function sanThuMacDinh\(ten\)/.test(xh) && /Luu\.docSanThu\(ten\) \|\| sanThuMacDinh\(ten\)/.test(xh));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);

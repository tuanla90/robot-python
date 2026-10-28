/* ============================================================================
   kiem-list-man.mjs — máy kiểm chương `list` (Danh sách, 10 màn làm quen) của "Robot Chấn Hưng" (KE-HOACH-LIST-FLYCAM.md, mục 3). Lõi list + khay: kiem-list.mjs. Chương chế lệnh: kiem-che-list.mjs.
   Gồm:
   - dữ liệu chung của chương: 10 màn, mã list.1…10, id theo vị trí (ngay sau che-nhen, trước che-list), tên, hàng, huy hiệu chỉ ở trùm; xe hai bánh, hamGoc, cauTruc ['for','list'], khung 10 ô;
   - SÂN là hành lang không phân nhánh (đồ thị các ô đi được là một đường, hai đầu: xe và cờ): không có đường tắt; độ dài từng đoạn và hướng rẽ của sân khớp với số trong danh sách của lời giải;
   - LÝ DO CẦN LIST: màn khai canList 'tran-khung' thì viết thẳng forward() + rẽ cho từng đoạn tràn khung 10 ô (loiSai chứng minh bằng chạy thật); màn không khai thì viết thẳng vẫn vừa khung;
   - mỗi màn: lời giải cách 1 thắng 3 sao (sao.o, sao.nhip khớp), BFS = sao.nhip (≤ ở màn nhipTheoLoiGiai), lời giải khác đúng 2 sao, công thức khác thắng, lời sai đúng mã,
     NHẬP ĐƯỢC BẰNG CHẠM (dung-chung-list.mjs: tayNhapDuoc — danh sách ≤ 6 ô giá trị 1–9, a[i] chỉ trong vòng range, a[0], len(a), tên a b c steps route…), đề ≤ 3 câu, gợi ý không nói tên nút;
   - luật riêng: list.3 chỉ sai ở dòng danh sách; list.7 báo lỗi chỉ số bằng lời Việt đúng; list.8 hai hàm của màn bị khóa và không vào kho; list.9 hàm tour sai steps[0];
   - đường BFS đổi thành lệnh gốc chạy SanHoc.chay: thắng đúng nhịp BFS;
   - huy hiệu list, Sổ lệnh không có hàm nào của chương (tour, tour_left là hàm CỦA MÀN), thẻ script choi.html.
   Các kiểm chung cho cả game nằm ở kiem-hoc.mjs. Chạy: node hoc/kiem-list-man.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SanHoc, ChamHoc, KhoHam, KhungCode, ThuTu, SoLenh, ManHoc, tatCa, tenCotTruyen, J, H, maCua, maLoi, sanCua, batDauCua, khoTruoc, tron, laHanhLang, docDuong, tayNhapDuoc } from './dung-chung-list.mjs';
import { coHinhRieng } from './huy-hieu-ds.mjs';   // V7c1: danh sách mã huy hiệu từ dữ liệu bộ vector (không regex huy-hieu.js pixel)
const DoDuong = await import('./do-duong-che-cam-bien.mjs');
const { nhipCheCamBienTatCa, nhipCheCamBienSan } = DoDuong;

const day = path.dirname(fileURLToPath(import.meta.url));
let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const ds = tatCa.filter((m) => m.chuong === 'list');
const man = (so) => ManHoc.timMa('list.' + so);
const VT = ThuTu.thuTu.indexOf('list') + 1;                    // số thứ tự của chương list (không ghi cứng)
const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const soCau = (s) => (s.match(/[.?!](\s|$)/g) || []).length;
const dsTrongDong = (dong, ten) => { const re = new RegExp('^\\s*' + ten + ' = \\[(.*)\\]$'); for (const d of dong) { const m = re.exec(d); if (m) return m[1].trim() ? m[1].split(',').map((x) => +x) : []; } return null; };
const THANG_RA_RE = { 'turn_right()': 'R', 'turn_left()': 'L' };

/** Đổi chuỗi hành động BFS thành chương trình gốc (mỗi hành động một nhịp). */
function chuoiThanhMa(chuoi) {
  const MA = { tien: ['left_move()', 'right_move()'], lui: ['left_back()', 'right_back()'], phai: ['left_move()'], trai: ['right_move()'], dau: ['left_move()', 'right_back()'], dung: [] };
  return chuoi.map((a) => MA[a.split('/')[2]].concat(['wait()']).join('\n')).join('\n') + '\n';
}
/** Cấu hình SanHoc.chay của sân thứ i của màn m. */
function cfgSan(m, i) {
  const lm = SanHoc.lopMauCuaSan(m, i);
  return { san: sanCua(m)[i], batDau: batDauCua(m, i), loaiRobot: 'banh', hamGoc: m.hamGoc, phanCung: SanHoc.phanCungCua(m), mucTieu: m.mucTieu || 'toi-co', vatChat: lm.vatChat, bongMo: lm.bongMo || undefined, nhipToiDa: 200 };
}

/* ================================================================= 1. DỮ LIỆU CHUNG */
console.log('\n== 1. Dữ liệu chung của chương list ==');
{
  kiem('đúng 10 màn, số 1..10, mã list.1…, id theo vị trí trong thuTu (ngay sau che-nhen, trước che-list), tên chương "Danh sách", đợt 2, cùng gói "list" với che-list',
    ds.length === 10 && ds.every((m, i) => m.so === i + 1 && m.id === VT + '.' + (i + 1) && m.ma === 'list.' + (i + 1)) && ThuTu.thuTu.indexOf('list') === ThuTu.thuTu.indexOf('che-nhen') + 1 && ThuTu.thuTu.indexOf('che-list') === VT &&
      ThuTu.ten['list'] === 'Danh sách' && ThuTu.laDot2('list') && ThuTu.goi.some((g) => g.ma === 'list' && g.ten === 'Danh sách' && J(g.chuong) === '["list","che-list"]'));
  kiem('tên các màn: Danh sách đầu tiên, Đường xoắn ốc, Sửa danh sách, Đường chữ S, Hai danh sách, Đoạn cuối, Thiếu một số, Gọi hàm danh sách, Sửa hàm tour, Mê cung kho; 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu list "Huy hiệu Danh sách"',
    J(ds.map((m) => m.ten)) === J(['Danh sách đầu tiên', 'Đường xoắn ốc', 'Sửa danh sách', 'Đường chữ S', 'Hai danh sách', 'Đoạn cuối', 'Thiếu một số', 'Gọi hàm danh sách', 'Sửa hàm tour', 'Mê cung kho']) &&
      J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && ds.every((m) => !!m.huyHieu === (m.so === 10)) && ds[9].huyHieu.ma === 'list' && ds[9].huyHieu.ten === 'Huy hiệu Danh sách');
  kiem('mọi màn: XE HAI BÁNH (robot { than: "hai-banh", tay: null, camBien: [] }), hamGoc = hai bánh (tiến, lùi) + wait, cauTruc ["for","list"] cả ở khung, chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em, tới cờ',
    ds.every((m) => m.loaiRobot === 'banh' && J(m.robot) === J({ than: 'hai-banh', tay: null, camBien: [] }) && J(m.hamGoc) === J(BANH) && J(m.cauTruc) === '["for","list"]' && J(m.khung.cauTruc) === '["for","list"]' &&
      m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && m.mucTieu === undefined && m.bongMo === undefined && m.phanCung === undefined && m.daoChieu === undefined));
  kiem('không màn nào chế hàm của em mới (taoHam rỗng, lời giải không có hamCuaEmMoi): chương làm quen chỉ dùng forward, right, turn_right, turn_left đã chế; hàm nhận danh sách đầu tiên của em là route(steps) ở che-list.1',
    ds.every((m) => m.taoHam.length === 0 && m.loiGiai.hamCuaEmMoi.length === 0 && (m.congThucKhac || []).every((c) => !c.hamCuaEmMoi || !c.hamCuaEmMoi.length)));
  kiem('hamCuaEmCan chỉ gồm hàm đã có trong kho lúc tới màn (chế ở các chương trước)', ds.every((m) => { const kho = khoTruoc(m.id).map((h) => h.ten); return m.hamCuaEmCan.every((t) => kho.includes(t)); }));
  kiem('khóa hàm: hamCuaMan chỉ có ở 8 (tour, tour_left, bị khóa — xem được) và 9 (tour có lỗi, người chơi sửa); chinhCoDinh chỉ ở 9; khoaHamMan ["tour","tour_left"] chỉ ở 8',
    ds.every((m) => (m.maMau.hamCuaMan.length > 0) === [8, 9].includes(m.so) && (m.chinhCoDinh === true) === (m.so === 9) && (m.so === 8 ? J(m.khoaHamMan) === '["tour","tour_left"]' : m.khoaHamMan === undefined)));
  kiem('sân ≤ 7 cột × 9 hàng; MỘT sân mỗi màn; xe đứng được; có đúng một cờ F, không vật / đích / băng chuyền / cửa',
    ds.every((m) => !Array.isArray(m.san[0]) && m.san.length <= 9 && m.san[0].length <= 7 && m.san.every((r) => r.length === m.san[0].length) && !SanHoc.lyDoChan(SanHoc.docSan(m.san), 'banh', m.batDau.x, m.batDau.y) &&
      (m.san.join('').match(/F/g) || []).length === 1 && /^[.#F]+$/.test(m.san.join(''))));
  kiem('sân là HÀNH LANG: một con đường không phân nhánh, không hai ô đường nào kề nhau trừ các ô liền nhau, xe ở một đầu, cờ ở đầu kia (nên không có đường tắt)', ds.every((m) => laHanhLang(m.san, m.batDau) === null), J(ds.map((m) => laHanhLang(m.san, m.batDau))));
}

/* ================================================================= 2. SÂN KHỚP DANH SÁCH · CÓ LÝ DO CẦN LIST */
console.log('\n== 2. Sân khớp số trong danh sách; viết thẳng từng đoạn tràn khung khi canList ==');
{
  const dd = ds.map((m) => docDuong(m.san, m.batDau));
  const soDoan = dd.map((d) => d.doan.length);
  kiem('số đoạn của sân từng màn: 3, 6, 5, 6, 6, 4, 4, 7, 5, 6 (đọc dọc hành lang)', J(soDoan) === '[3,6,5,6,6,4,4,7,5,6]', J(soDoan));
  const lenCua = (m) => docDuong(m.san, m.batDau).doan.map((x) => x.len);
  kiem('list.1, 2, 3, 7: danh sách a của lời giải = độ dài các đoạn của sân (đọc dọc hành lang), các đoạn đều rẽ cùng một chiều (list.3: trái, còn lại: phải)',
    [1, 2, 3, 7].every((so) => J(dsTrongDong(man(so).loiGiai.chinh, 'a')) === J(lenCua(man(so)))) && [1, 2, 7].every((so) => docDuong(man(so).san, man(so).batDau).doan.slice(0, -1).every((x) => x.re === 'R')) && docDuong(man(3).san, man(3).batDau).doan.slice(0, -1).every((x) => x.re === 'L'), J(lenCua(man(1))));
  kiem('list.6: ba đoạn đầu = danh sách a (6, 5, 4) và đoạn cuối dài ĐÚNG len(a) = 3; list.9: năm đoạn của hàm tour = danh sách [4, 3, 6, 2, 1] trong lời gọi',
    J(lenCua(man(6))) === '[6,5,4,3]' && dsTrongDong(man(6).loiGiai.chinh, 'a').length === 3 && J(lenCua(man(9))) === '[4,3,6,2,1]' && man(9).loiGiai.chinh[0] === 'tour([4, 3, 6, 2, 1])');
  kiem('list.4: đường chữ S — a = hai đoạn đầu (rẽ phải), b = bốn đoạn sau (rẽ trái); list.8: a = ba đoạn rẽ phải, b = bốn đoạn rẽ trái',
    (() => { const d4 = dd[3].doan, d8 = dd[7].doan; return J(d4.map((x) => x.re)) === '["R","R","L","L","L",null]' && J(d4.slice(0, 2).map((x) => x.len)) === J(dsTrongDong(man(4).loiGiai.chinh, 'a')) && J(d4.slice(2).map((x) => x.len)) === J(dsTrongDong(man(4).loiGiai.chinh, 'b')) &&
      J(d8.map((x) => x.re)) === '["R","R","R","L","L","L",null]' && /tour\(\[2, 4, 2\]\)/.test(man(8).loiGiai.chinh.join()) && /tour_left\(\[1, 4, 5, 1\]\)/.test(man(8).loiGiai.chinh.join()) && J(d8.slice(0, 3).map((x) => x.len)) === '[2,4,2]' && J(d8.slice(3).map((x) => x.len)) === '[1,4,5,1]'; })());
  kiem('list.5 và list.10: a = độ dài từng đoạn; b = số lần quay phải sau đoạn (1 = rẽ phải, 3 = rẽ trái) khớp hướng rẽ thật của sân; list.10: năm đoạn đầu rồi đoạn cuối dài len(a) = 5',
    (() => { const x5 = dd[4].doan, x10 = dd[9].doan, a5 = dsTrongDong(man(5).loiGiai.chinh, 'a'), b5 = dsTrongDong(man(5).loiGiai.chinh, 'b'), a10 = dsTrongDong(man(10).loiGiai.chinh, 'a'), b10 = dsTrongDong(man(10).loiGiai.chinh, 'b');
      const tuRe = (r) => (r === 'R' ? 1 : 3);
      return J(x5.map((x) => x.len)) === J(a5) && x5.slice(0, 5).every((x, i) => tuRe(x.re) === b5[i]) && J(x10.slice(0, 5).map((x) => x.len)) === J(a10) && x10.slice(0, 5).every((x, i) => tuRe(x.re) === b10[i]) && x10[5].len === a10.length && a10.length === 5 && a5.length === 6 && b5.length === 6; })());
  kiem('mọi danh sách trong lời giải và công thức khác có tối đa 6 ô, mỗi ô 1–9 (khớp khay: LIST_TOI_DA 6, bảng chọn số 1–9)',
    ds.every((m) => [m.loiGiai.chinh, (m.loiGiaiKhac.baiLam.chinh || []), ...(m.congThucKhac || []).map((c) => c.baiLam.chinh)].every((p) => p.every((d) => { const x = /\[([\d, ]*)\]/.exec(d); return !x || !x[1].trim() || (x[1].split(',').length <= 6 && x[1].split(',').every((v) => /^[1-9]$/.test(v.trim()))); }))));
  // viết thẳng: mỗi đoạn một forward(n) và (trừ đoạn cuối) một lệnh rẽ
  const thang = (m) => { const k = docDuong(m.san, m.batDau).doan.length; return 2 * k - 1; };
  const can = ds.filter((m) => m.canList === 'tran-khung').map((m) => m.so);
  kiem('canList "tran-khung" ở list.2, 4, 5, 8, 10 (đường từ sáu đoạn trở lên); các màn khác viết thẳng vẫn vừa khung 10 ô', J(can) === '[2,4,5,8,10]' && ds.every((m) => (m.canList === 'tran-khung') === (thang(m) > m.khung.chinh)), J(ds.map((m) => thang(m))));
  kiem('mỗi màn canList có một loiSai "viết thẳng" tràn khung (mã tran-khung); các màn khác không cần',
    ds.filter((m) => m.canList).every((m) => m.loiSai.some((l) => l.phaiCoMa.includes('tran-khung') && l.baiLam.chinh.length > m.khung.chinh && !l.baiLam.chinh.some((d) => /\[|\bfor\b/.test(d)) || (m.so === 8 && l.phaiCoMa.includes('tran-khung')))));
  kiem('lời giải gọn của mọi màn canList vừa khung 10 ô thật (tran-khung chỉ vì viết thẳng, không vì lời giải)', ds.filter((m) => m.canList).every((m) => m.loiGiai.chinh.length <= 10 && ChamHoc.cham(m, m.loiGiai, tron(khoTruoc(m.id), [])).thang));
}

/* ================================================================= 3. MƯỜI MÀN */
console.log('\n== 3. Chương list: dữ liệu và luật từng màn ==');
const BANG = [];
{
  for (const m of ds) {
    const kho = khoTruoc(m.id);
    const r = ChamHoc.cham(m, m.loiGiai, kho);
    kiem(m.id + ' ' + m.ten + ': lời giải cách 1 thắng 3 sao, ' + r.soO + ' ô = sao.o ' + m.sao.o + ', ' + r.soNhip + ' nhịp = sao.nhip ' + m.sao.nhip + ', không chẩn đoán nào',
      r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    const bfs = nhipCheCamBienTatCa(m);
    BANG.push({ m, r, bfs });
    kiem(m.id + ': BFS đường ngắn nhất = ' + bfs + (m.nhipTheoLoiGiai ? ' ≤' : ' =') + ' sao.nhip ' + m.sao.nhip, bfs !== null && (m.nhipTheoLoiGiai ? bfs <= m.sao.nhip : bfs === m.sao.nhip), 'BFS = ' + bfs);
    kiem(m.id + ': nhipTheoLoiGiai chỉ khi lời giải chuẩn dài hơn đường ngắn nhất (list.5, list.10: quay phải 3 lần để rẽ trái)', (m.nhipTheoLoiGiai === true) === [5, 10].includes(m.so) && ((m.nhipTheoLoiGiai === true) === (bfs < m.sao.nhip)));
    if (m.chinhCoDinh) {
      const gui = ChamHoc.cham(m, { chinh: ['wait()', 'wait()'], hamCuaMan: m.loiGiai.hamCuaMan }, kho);
      kiem(m.id + ': chinhCoDinh — chương trình chính gửi lên bị bỏ qua (kết quả y hệt lời giải)', J([gui.thang, gui.soO, gui.soNhip]) === J([r.thang, r.soO, r.soNhip]));
    } else {
      kiem(m.id + ': chương trình chính do người chơi viết (maMau.chinh ' + (m.so === 3 || m.so === 7 ? 'có sẵn để sửa' : 'rỗng') + '), lời giải ≤ 10 dòng, mở đầu chưa thắng', m.loiGiai.chinh.length <= 10 && (m.maMau.chinh.length === 0 ? !ChamHoc.cham(m, { chinh: [] }, kho).thang : !ChamHoc.cham(m, m.maMau, kho).thang));
    }
    // nhập được bằng chạm: lời giải, lời giải khác, công thức khác (chương trình chính của màn không khóa; thân hàm của màn khi sửa)
    const nhapMan = (bai, ten) => {
      const loi = [];
      if (!m.chinhCoDinh) loi.push(...tayNhapDuoc(bai.chinh || [], {}).map((x) => ten + ' · chính · ' + x));
      for (const h of (bai.hamCuaMan || [])) { if ((m.khoaHamMan || []).includes(h.ten)) continue; loi.push(...tayNhapDuoc(h.than, { list: h.thamSo }).map((x) => ten + ' · ' + h.ten + ' · ' + x)); }
      return loi;
    };
    const ngoai = [...nhapMan(m.loiGiai, 'lời giải'), ...nhapMan(m.loiGiaiKhac.baiLam, 'lời giải khác'), ...(m.congThucKhac || []).flatMap((c, i) => nhapMan(c.baiLam, 'công thức khác #' + (i + 1)))];
    kiem(m.id + ': mọi dòng của lời giải, lời giải khác, công thức khác NHẬP ĐƯỢC BẰNG CHẠM (danh sách ≤ 6 ô, a[i] trong vòng range, tên danh sách trong gợi ý…)', ngoai.length === 0, ngoai.slice(0, 4).join(' | '));
    kiem(m.id + ': có lời giải khác (loiGiaiKhac) và công thức khác (congThucKhac) nếu khai đều thắng', !!m.loiGiaiKhac && (m.congThucKhac || []).every((c) => c.moTa && c.baiLam && ChamHoc.cham(m, c.baiLam, kho).thang && maLoi(ChamHoc.cham(m, c.baiLam, kho)).length === 0));
    const rk = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kho, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': loiGiaiKhac (' + m.loiGiaiKhac.moTa + ') thắng đúng 2 sao, nhiều ô hơn, cùng nhịp, vừa khung', rk.thang && rk.sao === 2 && rk.soO > m.sao.o && rk.soNhip === m.sao.nhip && !maCua(rk).includes('tran-khung'), J({ sao: rk.sao, soO: rk.soO, soNhip: rk.soNhip, cd: maCua(rk) }));
    m.loiSai.forEach((ls, i) => {
      const rs = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi));
      const co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): ' + (ls.phaiCoMa.length ? 'không thắng, có mã ' + ls.phaiCoMa.join('+') : 'thắng nhưng thiếu sao'),
        rs.sao < 3 && thieu.length === 0 && (ls.phaiCoMa.length ? !rs.thang : rs.thang), 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + rs.sao);
    });
    kiem(m.id + ': đề bài 1–3 câu, gợi ý 1–2 câu không nói tên nút, mỗi lời sai có mô tả', soCau(m.deBai) >= 1 && soCau(m.deBai) <= 3 && m.goiY.length >= 1 && m.goiY.length <= 2 && !/bấm|nút/i.test(m.goiY.join(' ')) && m.loiSai.length >= 3 && m.loiSai.every((l) => l.moTa), m.deBai);
  }
  // luật riêng từng màn
  const m1 = man(1), k1 = khoTruoc(m1.id);
  const f1 = ChamHoc.cham(m1, { chinh: ['a = [4, 2, 3]', 'forward(a)'] }, k1).chanDoan.find((c) => c.ma === 'loi-chay');
  kiem('list.1: truyền cả danh sách cho forward() báo lời Việt "range() cần đối số là số, mà đây là một danh sách" và gợi ý for x in a:; quên khai báo danh sách thì nói tên chưa có',
    !!f1 && /range\(\) cần đối số là số, mà đây là một danh sách/.test(f1.loi) && /for x in a:/.test(f1.loi) && ChamHoc.cham(m1, { chinh: ['for n in a:', '    forward(n)'] }, k1).chanDoan.some((c) => c.ma === 'loi-chay'), f1 && f1.loi);
  const m2 = man(2), k2 = khoTruoc(m2.id);
  kiem('list.2: sáu đoạn 6, 7, 4, 5, 2, 3 (32 nhịp); viết thẳng mười một dòng báo tran-khung ở dòng 11 và KHÔNG chạy sân nào; danh sách 6 ô là mức tối đa của khay', (() => { const t = ChamHoc.cham(m2, m2.loiSai[0].baiLam, k2); const c = t.chanDoan.find((x) => x.ma === 'tran-khung'); return m2.sao.nhip === 32 && !!c && t.theoSan.length === 0 && m2.loiSai[0].baiLam.chinh.length === 11 && dsTrongDong(m2.loiGiai.chinh, 'a').length === 6; })());
  const m3 = man(3), k3 = khoTruoc(m3.id);
  const loiGiai3 = m3.loiGiai.chinh, mau3 = m3.maMau.chinh;
  kiem('list.3: chương trình có sẵn khác lời giải CHỈ ở dòng danh sách (cùng số dòng, ba dòng sau y hệt), danh sách mẫu thiếu một số và sai một số; chạy mẫu thì không thắng, xe đâm tường (dam-tuong)',
    loiGiai3.length === mau3.length && J(loiGiai3.slice(1)) === J(mau3.slice(1)) && loiGiai3[0] !== mau3[0] && dsTrongDong(mau3, 'a').length === dsTrongDong(loiGiai3, 'a').length - 1 && !ChamHoc.cham(m3, m3.maMau, k3).thang && maCua(ChamHoc.cham(m3, m3.maMau, k3)).includes('dam-tuong') &&
      dsTrongDong(mau3, 'a').filter((v, i) => v !== dsTrongDong(loiGiai3, 'a')[i]).length === 1);
  const m4 = man(4), k4 = khoTruoc(m4.id);
  kiem('list.4: hai danh sách a (rẽ phải) và b (rẽ trái), mỗi danh sách một vòng for; đổi b thành a ở vòng hai không thắng; 23 nhịp = BFS', ChamHoc.cham(m4, m4.loiGiai, k4).soNhip === 23 && nhipCheCamBienTatCa(m4) === 23 && !ChamHoc.cham(m4, m4.loiSai[3].baiLam, k4).thang);
  const m5 = man(5), k5 = khoTruoc(m5.id);
  const d5 = ChamHoc.cham(m5, { chinh: [...m5.loiGiai.chinh.slice(0, 2), 'for i in range(len(a)):', '    forward(a[i])', '    right(b[i])'] }, k5);
  const r5 = ChamHoc.cham(m5, m5.loiGiai, k5);
  kiem('list.5: lời giải chuẩn 25 nhịp (18 ô + 7 nhịp quay: right(1) bốn lần, right(3) một lần) nhưng BFS 23 (rẽ trái một nhịp); b[5] không dùng tới vì tới cờ trước; range(6) thay range(len(a)) cũng thắng cùng nhịp',
    r5.thang && r5.soNhip === 25 && nhipCheCamBienTatCa(m5) === 23 && d5.thang && ChamHoc.cham(m5, m5.congThucKhac[0].baiLam, k5).soNhip === 25);
  const m6 = man(6), k6 = khoTruoc(m6.id);
  kiem('list.6: forward(len(a)) = 3 ô cuối; viết số 3 thẳng vẫn thắng cùng nhịp nhưng chỉ 2 sao do thêm ô; forward(len(a)) đặt trước vòng for thì đâm mép sân', ChamHoc.cham(m6, m6.loiGiai, k6).sao === 3 && ChamHoc.cham(m6, m6.loiGiaiKhac.baiLam, k6).sao === 2 && !ChamHoc.cham(m6, m6.loiSai[3].baiLam, k6).thang);
  const m7 = man(7), k7 = khoTruoc(m7.id);
  const e7 = ChamHoc.cham(m7, m7.maMau, k7);
  const c7 = e7.chanDoan.find((c) => c.ma === 'loi-chay');
  kiem('list.7: chương trình có sẵn lặp range(4) trên danh sách ba số; chạy mẫu báo lỗi lời Việt "Chỉ số 3 nằm ngoài danh sách … 3 phần tử" ở đúng dòng (dòng 3 của chương trình), xe đã đi ba đoạn trước đó (lần lặp thứ tư mới lỗi)',
    !e7.thang && !!c7 && /Chỉ số 3 nằm ngoài danh sách/.test(c7.loi) && /3 phần tử/.test(c7.loi) && /dòng 3/.test(c7.loi) && e7.theoSan[0].soNhip >= 12, c7 && c7.loi);
  kiem('list.7: lời giải thêm số vào CUỐI danh sách (chỉ khác mẫu ở dòng danh sách, đổi 3 số thành 4 số); đổi range(4) thành range(3) hay range(len(a)) mà không thêm số vẫn không thắng',
    m7.loiGiai.chinh[0] === 'a = [4, 6, 5, 2]' && J(m7.loiGiai.chinh.slice(1)) === J(m7.maMau.chinh.slice(1)) && !ChamHoc.cham(m7, { chinh: ['a = [4, 6, 5]', 'for i in range(len(a)):', '    forward(a[i])', '    turn_right()'] }, k7).thang);
  const m8 = man(8), k8 = khoTruoc(m8.id);
  kiem('list.8: tour và tour_left là hàm CỦA MÀN (khóa, xem được): không trong taoHam của màn nào, không trong Sổ lệnh, không trong kho cuối game; ghi danh sách vào biến rồi tour(a) cũng thắng', ['tour', 'tour_left'].every((t) => !tenCotTruyen.includes(t) && SoLenh.tim(t) === null) &&
    ChamHoc.cham(m8, m8.loiGiaiKhac.baiLam, k8).thang && !khoTruoc('het').some((h) => /^tour/.test(h.ten)));
  const m9 = man(9), k9 = khoTruoc(m9.id);
  kiem('list.9: hàm tour(steps) của màn có lỗi steps[0] (luôn đoạn đầu): mẫu đâm tường; bản sửa steps[i] thắng; chinhCoDinh nên chương trình gửi lên bị bỏ; bản dùng for n in steps cũng thắng (2 sao)',
    m9.maMau.hamCuaMan[0].than.join(' ').includes('steps[0]') && m9.loiGiai.hamCuaMan[0].than.join(' ').includes('steps[i]') && !ChamHoc.cham(m9, m9.maMau, k9).thang && ChamHoc.cham(m9, m9.loiGiai, k9).sao === 3 && ChamHoc.cham(m9, m9.loiGiaiKhac.baiLam, k9).sao === 2 &&
      J(m9.loiGiai.chinh) === J(m9.maMau.chinh) && /tour\(/.test(m9.deBai + ' ' + m9.veMaMau));
  const m10 = man(10), k10 = khoTruoc(m10.id);
  kiem('list.10 trùm: hai danh sách song song + len(a) cho đoạn cuối; 30 nhịp (BFS 26); không khóa chương trình chính; 6 dòng; viết thẳng mười một dòng báo tran-khung',
    ChamHoc.cham(m10, m10.loiGiai, k10).soNhip === 30 && nhipCheCamBienTatCa(m10) === 26 && m10.loiGiai.chinh.length === 6 && !m10.chinhCoDinh && m10.loiSai[0].baiLam.chinh.length === 11 && maCua(ChamHoc.cham(m10, m10.loiSai[0].baiLam, k10)).includes('tran-khung'));

  console.log('\n  Bảng 10 màn list (lời giải cách 1, sao; BFS = nhịp ngắn nhất)');
  console.log('  màn   | tên                      | ô  | nhịp | BFS | lời giải (chương trình chính)');
  for (const { m, bfs } of BANG) {
    console.log('  ' + m.id.padEnd(5) + ' | ' + m.ten.padEnd(24) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + String(m.sao.nhip).padEnd(4) + ' | ' + String(bfs).padEnd(3) + ' | ' + m.loiGiai.chinh.join(' ; ').slice(0, 90));
  }
}

/* ================================================================= 4. ĐƯỜNG BFS CHẠY THẬT */
console.log('\n== 4. Đường BFS (do-duong-che-cam-bien.mjs) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng nhịp BFS ==');
{
  for (const m of ds) {
    const b = nhipCheCamBienSan(m, 0);
    const k = SanHoc.chay(cfgSan(m, 0), chuoiThanhMa(b.chuoi));
    kiem(m.id + ': đường BFS (' + b.nhip + ' nhịp) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng ' + b.nhip + ' nhịp, không lỗi', k.thang === true && k.nhip === b.nhip && !k.loi, J([k.thang, k.nhip, k.loi]));
  }
  const m = man(1);
  const hoTrong = Object.assign({}, m, { san: ['.....', '.....', '.F...'] });
  kiem('bộ dò tự kiểm: bỏ tường hành lang của list.1 (sân trống) thì có ĐƯỜNG TẮT: 3 nhịp ít hơn sao.nhip ' + m.sao.nhip, nhipCheCamBienTatCa(hoTrong) < m.sao.nhip);
}

/* ================================================================= 5. HUY HIỆU, SỔ LỆNH, THẺ SCRIPT */
console.log('\n== 5. Huy hiệu, Sổ lệnh, thẻ script ==');
{
  kiem("huy hiệu: bộ vector có hình riêng 'list' và 'che-list' (huy-hieu-vector.js; V7c1)", coHinhRieng('list') && coHinhRieng('che-list'));
  kiem('Sổ lệnh có nhóm "list" (Danh sách) sau nhóm nhen; chương list KHÔNG có hàm nào trong Sổ lệnh (không chế hàm); các hàm nhận danh sách của em nằm ở che-list', SoLenh.tenNhom.list === 'Danh sách' && SoLenh.thuTuNhom.indexOf('list') === SoLenh.thuTuNhom.indexOf('nhen') + 1 && SoLenh.theoChuong('list').length === 0 &&
    J(SoLenh.theoChuong('che-list').map((h) => h.ten)) === '["route","route_left","scan","box"]');
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có thẻ script ../man-list.js đúng một lần, sau man-che-nhen.js và trước man-che-list.js', tags.filter((t) => t === '../man-list.js').length === 1 && vtri('man-list.js') > vtri('man-che-nhen.js') && vtri('man-list.js') < vtri('man-che-list.js'), J(tags));
  kiem('so-lenh.js và huong-dan-man.js nạp đúng chỗ (hướng dẫn list.1 có trong huong-dan-man.js)', vtri('so-lenh.js') >= 0 && vtri('so-lenh.js') < vtri('man-list.js') && /H\['list\.1'\]/.test(fs.readFileSync(path.join(day, 'game', 'huong-dan-man.js'), 'utf8')));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

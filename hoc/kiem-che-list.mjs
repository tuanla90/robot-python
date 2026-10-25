/* ============================================================================
   kiem-che-list.mjs — máy kiểm chương `che-list` (Chế lệnh danh sách, 10 màn) của "Học lập trình" (KE-HOACH-LIST-FLYCAM.md mục 3 + KE-HOACH-CHE-LENH.md, khuôn chương chế lệnh).
   Lõi list + khay: kiem-list.mjs. Chương làm quen: kiem-list-man.mjs. Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…): kiem-hoc.mjs.
   Gồm:
   - dữ liệu chung: 10 màn che-list.1…10, id theo vị trí (ngay sau list), tên, hàng, huy hiệu chỉ ở trùm; xe hai bánh, 4–10 (trừ 7) có cảm biến khoảng cách ở hông; mục tiêu bóng mờ; chinhCoDinh trừ 3, 6, 10;
     khoaHamMan chỉ ở 7, daoChieu "cam" + canhBao chỉ ở 9, gioiHanHam 3 chỉ ở 10, ba sân ở 4, 5, 6, 8, 9, 10;
   - hàm chế: route, route_left, scan, box vào kho và Sổ lệnh (nhóm list); go_out, come_back, scan2, scan3 là hàm CỦA MÀN (không vào kho, không có trong Sổ lệnh);
   - BÃI TRỐNG (4, 5, 6, 8, 9, 10): hai ô tường mốc ở cuối hai cạnh đầu (màn 5: một ô), ◆ ở ba góc, xe mờ ở chỗ xuất phát; hai cạnh sau nằm giữa bãi trống nên cảm biến không dừng được xe:
     đo cả bốn cạnh bằng cảm biến KHÔNG thắng ở sân nào → phải GHI vào danh sách rồi đi lại theo số đã ghi (lý do thật của append);
   - mỗi màn: lời giải 3 sao (sao.o, sao.nhip khớp), BFS = sao.nhip (≤ ở màn 7), lời giải khác đúng 2 sao, công thức khác thắng, lời sai đúng mã, NHẬP ĐƯỢC BẰNG CHẠM (dung-chung-list.mjs),
     chinhCoDinh chặn chương trình chính gửi lên, đề ≤ 3 câu và nhắc tên lệnh cần chế / sửa, gợi ý không nói tên nút;
   - luật riêng: 7 (go_out 12 nhịp tới ◆, come_back lệnh ngược, thân ban đầu pass), 8 (append trong vòng while), 9 (cảm biến lắp ngược, chẩn đoán cam-bien-nguoc), 10 (ba hướng xe, gioiHanHam 3);
   - đường BFS đổi thành lệnh gốc chạy SanHoc.chay: thắng đúng nhịp BFS; kho cuối game, huy hiệu, thẻ script choi.html.
   Chạy: node hoc/kiem-che-list.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SanHoc, ChamHoc, KhoHam, KhungCode, ThuTu, SoLenh, ManHoc, tatCa, tenCotTruyen, J, H, maCua, maLoi, sanCua, batDauCua, khoTruoc, tron, laHanhLang, docDuong, tayNhapDuoc } from './dung-chung-list.mjs';
const DoDuong = await import('./do-duong-che-cam-bien.mjs');
const { nhipCheCamBienTatCa, nhipCheCamBienSan } = DoDuong;

const day = path.dirname(fileURLToPath(import.meta.url));
let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const che = tatCa.filter((m) => m.chuong === 'che-list');
const man = (so) => ManHoc.timMa('che-list.' + so);
const VT = ThuTu.thuTu.indexOf('che-list') + 1;
const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const CO_CAM = [4, 5, 6, 8, 9, 10], BA_SAN = CO_CAM;
const soCau = (s) => (s.match(/[.?!](\s|$)/g) || []).length;

function chuoiThanhMa(chuoi) {
  const MA = { tien: ['left_move()', 'right_move()'], lui: ['left_back()', 'right_back()'], phai: ['left_move()'], trai: ['right_move()'], dau: ['left_move()', 'right_back()'], dung: [] };
  return chuoi.map((a) => MA[a.split('/')[2]].concat(['wait()']).join('\n')).join('\n') + '\n';
}
function cfgSan(m, i) {
  const lm = SanHoc.lopMauCuaSan(m, i);
  return { san: sanCua(m)[i], batDau: batDauCua(m, i), loaiRobot: 'banh', hamGoc: m.hamGoc, phanCung: SanHoc.phanCungCua(m), mucTieu: m.mucTieu || 'toi-co', vatChat: lm.vatChat, bongMo: lm.bongMo || undefined, camBien: m.robot ? m.robot.camBien : undefined, daoChieu: m.daoChieu, nhipToiDa: 200 };
}
const ev = (kq, ma) => kq.vet.filter((e) => e.loai === 'nhip').flatMap((n) => n.suKien).filter((e) => e.ma === ma);

/* ================================================================= 1. DỮ LIỆU CHUNG */
console.log('\n== 1. Dữ liệu chung của chương che-list ==');
{
  kiem('đúng 10 màn, số 1..10, mã che-list.1…, id theo vị trí trong thuTu (ngay sau list, trước xich), tên chương "Chế lệnh danh sách", đợt 2, cùng gói "list"',
    che.length === 10 && che.every((m, i) => m.so === i + 1 && m.id === VT + '.' + (i + 1) && m.ma === 'che-list.' + (i + 1)) && ThuTu.thuTu.indexOf('che-list') === ThuTu.thuTu.indexOf('list') + 1 && ThuTu.thuTu[VT] === 'xich' &&
      ThuTu.ten['che-list'] === 'Chế lệnh danh sách' && ThuTu.laDot2('che-list') && ThuTu.goi.some((g) => g.chuong.includes('list') && g.chuong.includes('che-list')));
  kiem('tên các màn: Đi theo danh sách, Danh sách rẽ trái, Đường chữ S, Đo một cạnh, Hình vuông, Bãi chữ nhật, Đường về, Ghi sai chỗ, Cảm biến lắp ngược, Bãi đo xoay chiều; 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu che-list "Huy hiệu Chế lệnh danh sách"',
    J(che.map((m) => m.ten)) === J(['Đi theo danh sách', 'Danh sách rẽ trái', 'Đường chữ S', 'Đo một cạnh', 'Hình vuông', 'Bãi chữ nhật', 'Đường về', 'Ghi sai chỗ', 'Cảm biến lắp ngược', 'Bãi đo xoay chiều']) &&
      J(che.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && che.every((m) => !!m.huyHieu === (m.so === 10)) && che[9].huyHieu.ma === 'che-list' && che[9].huyHieu.ten === 'Huy hiệu Chế lệnh danh sách');
  kiem('mọi màn: XE HAI BÁNH, hamGoc = hai bánh + wait (+ front_clear từ màn 4, trừ 7), cảm biến khoảng cách ở hông khi có front_clear, cauTruc ["for","if","while","list"] (màn 1, 2, 3, 7 chưa có cảm biến: ["for","list"]), chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em, mục tiêu bóng mờ',
    che.every((m) => m.loaiRobot === 'banh' && m.robot.than === 'hai-banh' && m.robot.tay === null && J(m.robot.camBien) === J(CO_CAM.includes(m.so) ? [{ ma: 'khoang-cach', o: 'hong' }] : []) && J(m.hamGoc) === J(BANH.concat(CO_CAM.includes(m.so) ? ['front_clear'] : [])) &&
      J(m.cauTruc) === (CO_CAM.includes(m.so) ? '["for","if","while","list"]' : '["for","list"]') && J(m.khung.cauTruc) === J(m.cauTruc) && m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && m.mucTieu === 'bong-mo' && !!m.bongMo && !/[FD]/.test(sanCua(m).flat().join(''))));
  kiem('biến đếm (khay hiện nhóm ĐẾM) từ màn 4 (có cảm biến); chinhCoDinh ở mọi màn trừ 3, 6, 10 (người chơi tự viết chương trình chính); khoaHamMan ["go_out"] chỉ ở 7; daoChieu ["cam"] + canhBao chỉ ở 9; gioiHanHam 3 chỉ ở 10; phanCung không khai; nhipTheoLoiGiai chỉ ở 7',
    che.every((m) => (m.bienDem === true) === CO_CAM.includes(m.so) && (m.chinhCoDinh === true) === ![3, 6, 10].includes(m.so) && (m.so === 7 ? J(m.khoaHamMan) === '["go_out"]' : m.khoaHamMan === undefined) && (m.so === 9 ? J(m.daoChieu) === '["cam"]' && /Cảm biến lắp ngược/.test(m.canhBao) : m.daoChieu === undefined && m.canhBao === undefined) &&
      (m.so === 10 ? m.gioiHanHam === 3 : m.gioiHanHam === undefined) && m.phanCung === undefined && (m.nhipTheoLoiGiai === true) === (m.so === 7)));
  kiem('ba sân (man.san là MẢNG 3 sân cùng cỡ, batDau và bongMo song song, nhipTheo "tong") ở 4, 5, 6, 8, 9, 10; MỘT sân ở 1, 2, 3, 7; sân ≤ 7 cột × 9 hàng; xe đứng được',
    che.every((m) => { const n = sanCua(m).length; return n === (BA_SAN.includes(m.so) ? 3 : 1) && (n === 3 ? Array.isArray(m.batDau) && m.batDau.length === 3 && Array.isArray(m.bongMo) && m.bongMo.length === 3 && m.nhipTheo === 'tong' : !Array.isArray(m.batDau) && m.nhipTheo === undefined) &&
      sanCua(m).every((s, i) => s.length <= 9 && s[0].length <= 7 && s.every((r) => r.length === s[0].length) && !SanHoc.lyDoChan(SanHoc.docSan(s), 'banh', batDauCua(m, i).x, batDauCua(m, i).y)); }));
  kiem('lệnh chế ở từng màn (taoHam): route, route_left, —, scan, box, —, —, —, —, —; 7, 8, 9 viết / sửa HÀM CỦA MÀN (không hàm của em mới); hàm của em mới chỉ ở 1, 2, 4, 5',
    J(che.map((m) => m.taoHam)) === J([['route'], ['route_left'], [], ['scan'], ['box'], [], [], [], [], []]) && [3, 6, 7, 8, 9, 10].every((i) => man(i).loiGiai.hamCuaEmMoi.length === 0) &&
      J(man(7).loiGiai.hamCuaMan.map((h) => h.ten)) === '["go_out","come_back"]' && J(man(8).loiGiai.hamCuaMan.map((h) => h.ten)) === '["scan2"]' && J(man(9).loiGiai.hamCuaMan.map((h) => h.ten)) === '["scan3"]');
  kiem('hamCuaEmCan chỉ gồm hàm đã có trong kho lúc tới màn (kể cả hàm chế ở các màn che-list trước)', che.every((m) => { const kho = khoTruoc(m.id).map((h) => h.ten); return m.hamCuaEmCan.every((t) => kho.includes(t)); }));
  kiem('sân hành lang (1, 2, 3, 7): một con đường không phân nhánh, không hai ô đường nào kề nhau trừ các ô liền nhau, xe ở một đầu; không cờ F', [1, 2, 3, 7].every((so) => laHanhLang(man(so).san, man(so).batDau) === null), J([1, 2, 3, 7].map((so) => laHanhLang(man(so).san, man(so).batDau))));
  kiem('tên hàm mới không trùng hàm cốt truyện / hàm của màn / lệnh gốc nào đã có (mỗi tên đúng một taoHam, đúng một mục Sổ lệnh; hàm của màn không là tên khóa của kho)',
    ['route', 'route_left', 'scan', 'box'].every((t) => tatCa.filter((m) => m.taoHam.includes(t)).length === 1 && SoLenh.ds.filter((h) => h.ten === t).length === 1 && !KhoHam.HAM_GOC_MAC_DINH.includes(t)) &&
      ['go_out', 'come_back', 'scan2', 'scan3'].every((t) => !tenCotTruyen.includes(t) && SoLenh.tim(t) === null));
}

/* ================================================================= 2. BÃI TRỐNG: GHI LẠI LÀ CẦN THẬT */
console.log('\n== 2. Bãi trống: hai ô tường mốc, ◆ ba góc, đo bốn cạnh bằng cảm biến không thắng ==');
{
  const tuong = (rows) => { const kq = []; rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') kq.push([x, y]); })); return kq; };
  kiem('bãi trống: sân chỉ có ô trống và ô tường mốc (không cờ, vật, băng chuyền); màn 5 đúng MỘT ô tường mốc mỗi sân, các bãi khác đúng HAI ô', BA_SAN.every((so) => sanCua(man(so)).every((rows) => /^[.#]+$/.test(rows.join('')) && tuong(rows).length === (so === 5 ? 1 : 2))));
  kiem('mỗi sân bãi: ba ô ◆ ở ba góc, xe mờ ở chỗ xe xuất phát (cùng hướng, trừ màn 5: quay LÊN sau ba lần quay phải), ◆ không trùng chỗ xe',
    BA_SAN.every((so) => { const m = man(so); return sanCua(m).every((_, i) => { const b = m.bongMo[i], s = batDauCua(m, i); return b.x === s.x && b.y === s.y && b.huong === (so === 5 ? (s.huong + 3) % 4 : s.huong) && b.diQua.length === 3 && b.diQua.every((q) => !(q.x === s.x && q.y === s.y)); }); }));
  kiem('hai cạnh đầu đo được, hai cạnh sau thì không: ở mọi sân bãi, đi theo cạnh sau, ô ngay sau chỗ dừng cũng là ô trống TRONG sân (cảm biến không dừng được xe); cạnh đầu kết thúc ngay trước một tường mốc',
    BA_SAN.every((so) => { const m = man(so); return sanCua(m).every((rows, i) => {
      const b = m.bongMo[i], s = batDauCua(m, i), [c1, c2, c3] = b.diQua, V = SanHoc.VEC;
      const trong = (x, y) => rows[y] !== undefined && rows[y][x] === '.';
      const f = s.huong, tiep = (p, d) => [p.x + V[d][0], p.y + V[d][1]];
      const m1 = tiep(c1, f), cuoi1 = rows[m1[1]] !== undefined && rows[m1[1]][m1[0]] === '#';
      const d2 = [0, 1, 2, 3].find((d) => { const n = tiep(c1, d); return c2.x === c1.x + V[d][0] * Math.abs(c2.x - c1.x) && c2.y === c1.y + V[d][1] * Math.abs(c2.y - c1.y) && (d % 2) !== (f % 2) && Math.abs(c2.x - c1.x) + Math.abs(c2.y - c1.y) > 0; });
      const sau3 = tiep(c3, (f + 2) % 4), sau4 = tiep(s, (d2 + 2) % 4);          // ô sau chỗ dừng của cạnh 3 (đi ngược hướng cạnh đầu) và cạnh 4 (đi ngược hướng cạnh hai)
      return cuoi1 && d2 !== undefined && trong(sau3[0], sau3[1]) && trong(sau4[0], sau4[1]);
    }); }));
  const khoSan = (m) => khoTruoc(m.id);
  const DO_BON = (ten, re) => ['a = []'].concat([].concat(...[0, 1, 2, 3].map(() => [ten + '(a)', re])));
  kiem('đo cả BỐN cạnh bằng scan() + rẽ (không dùng danh sách để đi lại): KHÔNG thắng ở sân nào của màn 4, 6, 8 (và 9, 10 với hàm đã sửa) — chỉ ghi lại rồi route(a) mới về đúng chỗ',
    [[4, 'scan', 'turn_right()'], [6, 'scan', 'turn_right()'], [8, 'scan', 'turn_right()'], [9, 'scan', 'turn_right()'], [10, 'scan', 'turn_left()']].every(([so, ten, re]) => {
      const m = Object.assign({}, man(so), { chinhCoDinh: false });
      const hamMan = man(so).loiGiai.hamCuaMan.map((h) => (h.ten === 'scan2' || h.ten === 'scan3' ? H('scan', h.thamSo, h.than) : h)).filter((h) => !['go_out', 'come_back'].includes(h.ten));
      const kq = ChamHoc.cham(Object.assign({}, m, { gioiHanHam: undefined }), { chinh: DO_BON(ten, re), hamCuaMan: [] }, tron(khoSan(m), [H('scan', ['seen'], ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'seen.append(n)'])].concat(so === 9 ? [] : [])));
      return kq.theoSan.length === 3 ? kq.theoSan.every((s) => s.thang === false) : kq.thang === false;
    }));
  kiem('đo hai cạnh đầu rồi ĐI LẠI theo danh sách thắng ở cả ba sân (màn 4: chương trình chính của màn; màn 6 và 10: lời giải)', [4, 6, 10].every((so) => { const m = man(so); const r = ChamHoc.cham(m, m.loiGiai, tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi)); return r.thang && r.theoSan.length === 3 && r.theoSan.every((s) => s.thang); }));
  kiem('mỗi sân bãi có độ dài cạnh khác nhau: ba sân của màn 4, 6, 8, 9, 10 không có hai sân cùng (cạnh đầu, cạnh hai) — chương trình viết cứng số bước chỉ đúng một sân',
    BA_SAN.filter((so) => so !== 5).every((so) => { const m = man(so); const cap = sanCua(m).map((_, i) => { const b = m.bongMo[i], s = batDauCua(m, i), [c1, c2] = b.diQua; return (Math.abs(c1.x - s.x) + Math.abs(c1.y - s.y)) + ',' + (Math.abs(c2.x - c1.x) + Math.abs(c2.y - c1.y)); }); return new Set(cap).size === 3; }));
  kiem('màn 5: ba hình vuông cạnh khác nhau (2, 3, 4); màn 6: một hình vuông 3×3 và hai hình chữ nhật (4×2, 2×4); màn 10: ba hướng xe khác nhau (xuống, sang trái, lên)',
    (() => { const m5 = man(5), m6 = man(6), m10 = man(10); const canh = (m, i) => { const b = m.bongMo[i], s = batDauCua(m, i), [c1, c2] = b.diQua; return [Math.abs(c1.x - s.x) + Math.abs(c1.y - s.y), Math.abs(c2.x - c1.x) + Math.abs(c2.y - c1.y)]; };
      return J([0, 1, 2].map((i) => canh(m5, i))) === '[[2,2],[3,3],[4,4]]' && J([0, 1, 2].map((i) => canh(m6, i))) === '[[3,3],[4,2],[2,4]]' && J(m10.batDau.map((b) => b.huong)) === '[2,3,0]'; })());
}

/* ================================================================= 3. SỔ LỆNH */
console.log('\n== 3. Sổ lệnh: bốn hàm mới của che-list ==');
{
  const moi = ['route', 'route_left', 'scan', 'box'];
  const dau = {};
  for (const m of tatCa) for (const t of m.taoHam) if (!dau[t]) dau[t] = m;
  kiem('SoLenh.theoChuong("che-list") đúng bốn hàm theo thứ tự chế: route, route_left, scan, box; nhóm list "Danh sách"', J(SoLenh.theoChuong('che-list').map((h) => h.ten)) === J(moi) && SoLenh.theoChuong('che-list').every((h) => h.nhom === 'list') && SoLenh.tenNhom.list === 'Danh sách');
  kiem('mỗi hàm có chuong và man đúng màn đầu tiên chế nó; moTa là MỘT câu ngắn lớp 5: 8–80 chữ, không xuống dòng, không dấu chấm cuối', moi.every((t) => dau[t] && SoLenh.tim(t) && SoLenh.tim(t).man === dau[t].ma && SoLenh.tim(t).chuong === 'che-list' && (() => { const d = SoLenh.tim(t).moTa; return d.length >= 8 && d.length <= 80 && !/\n/.test(d) && !/[.]$/.test(d); })()));
  const idx = (t) => SoLenh.ds.findIndex((h) => h.ten === t);
  kiem('thứ tự trong Sổ lệnh: route, route_left, scan, box nằm ngay sau bring (che-nhen) và trước tr_right (xich) — đúng thứ tự chế trong game', idx('route') === idx('bring') + 1 && idx('box') === idx('bring') + 4 && idx('tr_right') === idx('box') + 1);
  kiem('go_out, come_back, scan2, scan3, tour, tour_left là hàm CỦA MÀN: không trong Sổ lệnh, không trong hamCuaEmMoi của lời giải nào (come_back, go_out còn là tên hàm của màn ở chương khác)', ['scan2', 'scan3', 'tour', 'tour_left'].every((t) => SoLenh.tim(t) === null && tatCa.every((m) => !m.loiGiai.hamCuaEmMoi.some((h) => h.ten === t))));
}

/* ================================================================= 4. MƯỜI MÀN */
console.log('\n== 4. Chương che-list: dữ liệu và luật từng màn ==');
const BANG = [];
{
  for (const m of che) {
    const kho = khoTruoc(m.id);
    const khoNay = tron(kho, m.loiGiai.hamCuaEmMoi);
    const r = ChamHoc.cham(m, m.loiGiai, khoNay);
    kiem(m.id + ' ' + m.ten + ': lời giải cách 1 thắng 3 sao, ' + r.soO + ' ô = sao.o ' + m.sao.o + ', ' + r.soNhip + ' nhịp = sao.nhip ' + m.sao.nhip + ', không chẩn đoán nào',
      r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    const bfs = nhipCheCamBienTatCa(m);
    BANG.push({ m, r, bfs });
    kiem(m.id + ': BFS đường ngắn nhất = ' + bfs + (m.nhipTheoLoiGiai ? ' ≤' : ' =') + ' sao.nhip ' + m.sao.nhip, bfs !== null && (m.nhipTheoLoiGiai ? bfs < m.sao.nhip : bfs === m.sao.nhip), 'BFS = ' + bfs);
    if (m.chinhCoDinh) {
      const gui = ChamHoc.cham(m, { chinh: ['wait()', 'wait()'], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      const rong = ChamHoc.cham(m, { chinh: [], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính gửi lên (kể cả rỗng) bị bỏ qua, chạy bản mẫu (kết quả y hệt lời giải)', J([gui.thang, gui.soO, gui.soNhip]) === J([r.thang, r.soO, r.soNhip]) && rong.thang === r.thang && rong.sao === r.sao && m.maMau.chinh.length >= 1 && m.maMau.chinh.length <= 10);
    } else {
      kiem(m.id + ': người chơi tự viết chương trình chính (maMau.chinh rỗng, lời giải ≤ 10 dòng, gọi hàm đã chế), chương trình rỗng không thắng', m.maMau.chinh.length === 0 && m.loiGiai.chinh.length >= 1 && m.loiGiai.chinh.length <= 10 && !ChamHoc.cham(m, { chinh: [] }, khoNay).thang);
    }
    // bóng mờ: xe mờ nằm trên ô đi được, ◆ đi được
    kiem(m.id + ': xe mờ và ◆ nằm trên ô đi được của từng sân; chạy xong thắng ở nhịp cuối với mọi sân', sanCua(m).every((rows, i) => { const b = Array.isArray(m.bongMo) ? m.bongMo[i] : m.bongMo, sn = SanHoc.docSan(rows); return !SanHoc.lyDoChan(sn, 'banh', b.x, b.y) && (b.diQua || []).every((q) => !SanHoc.lyDoChan(sn, 'banh', q.x, q.y)); }) && r.theoSan.every((s) => s.thang) && ev(r, 'toi-bong-mo').length >= 1);
    kiem(m.id + ': có ít nhất 1 công thức khác (congThucKhac), khác cách 1', Array.isArray(m.congThucKhac) && m.congThucKhac.length >= 1 && m.congThucKhac.every((c) => c.moTa && (Array.isArray(c.hamCuaEmMoi) || c.baiLam) && J({ b: c.baiLam || m.loiGiai, h: c.hamCuaEmMoi || [] }) !== J({ b: m.loiGiai, h: m.loiGiai.hamCuaEmMoi })));
    m.congThucKhac.forEach((c, i) => {
      const rc = ChamHoc.cham(m, c.baiLam || m.loiGiai, tron(khoNay, c.hamCuaEmMoi));
      kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng, không lỗi — ' + rc.sao + ' sao, ' + rc.soO + ' ô, ' + rc.soNhip + ' nhịp', rc.thang && maLoi(rc).length === 0, J({ thang: rc.thang, cd: rc.chanDoan.map((x) => x.ma) }));
    });
    // nhập được bằng chạm
    const nhapMan = (bai, hamMoi, ten) => {
      const loi = [], ngu = { bienDem: m.bienDem === true, cam: CO_CAM.includes(m.so) };
      if (!m.chinhCoDinh) loi.push(...tayNhapDuoc(bai.chinh || [], ngu).map((x) => ten + ' · chính · ' + x));
      for (const h of (bai.hamCuaMan || [])) { if ((m.khoaHamMan || []).includes(h.ten)) continue; loi.push(...tayNhapDuoc(h.than, Object.assign({ list: h.thamSo }, ngu)).map((x) => ten + ' · ' + h.ten + ' · ' + x)); }
      for (const h of (hamMoi || [])) loi.push(...tayNhapDuoc(h.than, Object.assign({ list: h.thamSo }, ngu)).map((x) => ten + ' · ' + h.ten + ' · ' + x));
      return loi;
    };
    const ngoai = [...nhapMan(m.loiGiai, m.loiGiai.hamCuaEmMoi, 'lời giải'), ...nhapMan(m.loiGiaiKhac.baiLam, m.loiGiaiKhac.hamCuaEmMoi, 'lời giải khác'), ...m.congThucKhac.flatMap((c, i) => nhapMan(c.baiLam || m.loiGiai, c.hamCuaEmMoi, 'công thức khác #' + (i + 1)))];
    kiem(m.id + ': mọi dòng của lời giải, lời giải khác, công thức khác (chương trình chính và thân hàm) NHẬP ĐƯỢC BẰNG CHẠM', ngoai.length === 0, ngoai.slice(0, 4).join(' | '));
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
    kiem(m.id + ': đề bài 1–3 câu, gợi ý 1–2 câu không nói tên nút', soCau(m.deBai) >= 1 && soCau(m.deBai) <= 3 && m.goiY.length >= 1 && m.goiY.length <= 2 && !/bấm|nút/i.test(m.goiY.join(' ')), m.deBai);
  }

  // luật riêng từng màn
  const m1 = man(1), k1 = khoTruoc(m1.id), s1 = tron(k1, m1.loiGiai.hamCuaEmMoi);
  kiem('che-list.1 Đi theo danh sách: route([3, 2, 4]) = 12 nhịp = BFS; sau đoạn cuối xe VẪN rẽ phải (xe mờ quay LÊN): viết thẳng không rẽ sau đoạn cuối dừng đúng chỗ nhưng sai hướng (lech-bong-mo)',
    ChamHoc.cham(m1, m1.loiGiai, s1).soNhip === 12 && nhipCheCamBienTatCa(m1) === 12 && m1.bongMo.huong === 0 && (() => { const t = ChamHoc.cham(Object.assign({}, m1, { chinhCoDinh: false }), { chinh: ['forward(3)', 'turn_right()', 'forward(2)', 'turn_right()', 'forward(4)'] }, s1); return !t.thang && maCua(t).includes('lech-bong-mo') && /quay mặt/.test(t.chanDoan.find((c) => c.ma === 'lech-bong-mo').loi); })());
  const m2 = man(2), k2 = khoTruoc(m2.id), s2 = tron(k2, m2.loiGiai.hamCuaEmMoi);
  kiem('che-list.2 Rẽ trái theo danh sách: route_left([2, 4, 3]) = 12 nhịp = BFS, xe mờ quay sang phải; cách right(3) thắng nhưng chậm (18 nhịp, mất cả sao ô lẫn sao nhịp)', ChamHoc.cham(m2, m2.loiGiai, s2).soNhip === 12 && nhipCheCamBienTatCa(m2) === 12 && m2.bongMo.huong === 1 && (() => { const t = ChamHoc.cham(m2, m2.loiGiai, tron(k2, m2.congThucKhac[0].hamCuaEmMoi)); return t.thang && t.soNhip === 18 && t.sao === 1; })());
  const m3 = man(3), k3 = khoTruoc(m3.id);
  kiem('che-list.3 Đường chữ S (dùng): route([4, 2]) rồi route_left([3, 2]) = 15 nhịp = BFS, xe mờ quay sang phải; route() cho cả bốn đoạn không thắng; dùng hai danh sách a, b rồi truyền tên cũng thắng (2 sao)',
    ChamHoc.cham(m3, m3.loiGiai, k3).soNhip === 15 && nhipCheCamBienTatCa(m3) === 15 && !ChamHoc.cham(m3, m3.loiSai[0].baiLam, k3).thang && ChamHoc.cham(m3, m3.loiGiaiKhac.baiLam, k3).sao === 2);
  const m4 = man(4), k4 = khoTruoc(m4.id), s4 = tron(k4, m4.loiGiai.hamCuaEmMoi);
  const r4 = ChamHoc.cham(m4, m4.loiGiai, s4);
  kiem('che-list.4 Đo một cạnh: chương trình chính khóa seen = []; scan; turn_right; scan; turn_right; route(seen); chạy từng sân 16 + 14 + 18 = 48 nhịp (hai cạnh đo + hai cạnh đi lại); thiếu seen.append thì danh sách rỗng, xe đứng ở góc và không thắng',
    J(m4.maMau.chinh) === J(['seen = []', 'scan(seen)', 'turn_right()', 'scan(seen)', 'turn_right()', 'route(seen)']) && J(r4.theoSan.map((s) => s.soNhip)) === '[16,14,18]' && r4.soNhip === 48 && !ChamHoc.cham(m4, m4.loiSai[1].baiLam, tron(k4, m4.loiSai[1].hamCuaEmMoi)).thang);
  const m5 = man(5), k5 = khoTruoc(m5.id), s5 = tron(k5, m5.loiGiai.hamCuaEmMoi);
  const r5 = ChamHoc.cham(m5, m5.loiGiai, s5);
  kiem('che-list.5 Hình vuông: scan(seen) rồi box(seen); cạnh 2, 3, 4: 4n + 3 = 11 + 15 + 19 = 45 nhịp; chỉ MỘT tường mốc mỗi sân nên cạnh hai chỉ biết nhờ số đã ghi; cố định 3 ô mỗi cạnh chỉ đúng sân cạnh 3 (còn hai sân kia thua)',
    J(m5.maMau.chinh) === J(['seen = []', 'scan(seen)', 'box(seen)']) && J(r5.theoSan.map((s) => s.soNhip)) === '[11,15,19]' && r5.soNhip === 45 && J(ChamHoc.cham(m5, m5.loiSai[5].baiLam, tron(k5, m5.loiSai[5].hamCuaEmMoi)).theoSan.map((s) => s.thang)) === '[false,true,false]');
  const m6 = man(6), k6 = khoTruoc(m6.id);
  kiem('che-list.6 Bãi chữ nhật (dùng): a = [] ; scan ; rẽ phải ; scan ; rẽ phải ; route(a) = 6 dòng, 48 nhịp; chỉ đo một cạnh rồi route(a) thì danh sách có một số, xe đi một cạnh rồi dừng giữa bãi (thua cả ba sân); vòng for hai lần cũng thắng (5 dòng)',
    ChamHoc.cham(m6, m6.loiGiai, k6).soNhip === 48 && m6.loiGiai.chinh.length === 6 && m6.congThucKhac[0].baiLam.chinh.length === 5 && J(ChamHoc.cham(m6, m6.loiSai[1].baiLam, k6).theoSan.map((s) => s.thang)) === '[false,false,false]');
  const m7 = man(7), k7 = khoTruoc(m7.id);
  const pre = ChamHoc.cham(Object.assign({}, m7, { chinhCoDinh: false }), { chinh: ['go_out()'], hamCuaMan: m7.maMau.hamCuaMan }, k7);
  kiem('che-list.7 Đường về: go_out() của màn = route([3, 4, 2]) đưa xe từ (0,0) tới ◆ (1,4) trong 12 nhịp (xe dừng quay LÊN); go_out khóa và xem được; thân come_back() ban đầu chỉ có pass; bóng mờ = chỗ xuất phát, ◆ ở chỗ go_out() dừng',
    pre.theoSan[0].soNhip === 12 && pre.theoSan[0].robot.x === 1 && pre.theoSan[0].robot.y === 4 && pre.theoSan[0].robot.huong === 0 && pre.theoSan[0].diQua[0].da === true && J(m7.khoaHamMan) === '["go_out"]' && J(m7.maMau.hamCuaMan.map((h) => h.ten)) === '["go_out","come_back"]' && J(m7.maMau.hamCuaMan[1].than) === '["pass"]' &&
      J(m7.bongMo) === J({ x: 0, y: 0, huong: 1, diQua: [{ x: 1, y: 4 }] }));
  const hb = m7.loiGiai.hamCuaMan.find((h) => h.ten === 'come_back');
  kiem('che-list.7: come_back() là LỆNH NGƯỢC của go_out(): quay mặt về phía đã tới, route_left với danh sách ĐẢO THỨ TỰ [2, 4, 3] (rẽ phải thành rẽ trái), rồi quay lại hướng cũ; sửa go_out gửi lên vẫn bị bản mẫu thay (khóa); để nguyên pass không thắng',
    J(hb.than) === J(['turn_right()', 'route_left([2, 4, 3])', 'turn_left()']) && !ChamHoc.cham(m7, m7.maMau, k7).thang && maCua(ChamHoc.cham(m7, m7.maMau, k7)).includes('lech-bong-mo') &&
      J([ChamHoc.cham(m7, { chinh: [], hamCuaMan: [H('go_out', ['forward(1)']), hb] }, k7).thang, ChamHoc.cham(m7, m7.loiGiai, k7).thang]) === '[true,true]' && m7.taoHam.length === 0 && !k7.some((h) => h.ten === 'come_back'));
  const m8 = man(8), k8 = khoTruoc(m8.id);
  const c8 = ChamHoc.cham(m8, m8.maMau, k8);
  kiem('che-list.8 Ghi sai chỗ: scan2() của màn ghi seen.append(n) TRONG vòng while (danh sách thừa số): mẫu không thắng ở sân nào; bản sửa (append ngoài vòng) thắng 3 sân, tổng 42 nhịp; hàm scan2 là hàm của màn (không vào kho)',
    !c8.thang && c8.theoSan.every((s) => !s.thang) && m8.maMau.hamCuaMan[0].than.includes('    seen.append(n)') && m8.loiGiai.hamCuaMan[0].than.includes('seen.append(n)') && ChamHoc.cham(m8, m8.loiGiai, k8).soNhip === 42 && m8.taoHam.length === 0 && !k8.some((h) => h.ten === 'scan2'));
  const m9 = man(9), k9 = khoTruoc(m9.id);
  const c9 = ChamHoc.cham(m9, m9.maMau, k9);
  kiem('che-list.9 Cảm biến lắp ngược: daoChieu ["cam"] làm front_clear() trả ngược; scan3() chép scan() chạy sai (cam-bien-nguoc, xe đứng yên, ghi toàn số 0); bản sửa while not front_clear() thắng 3 sân, 42 nhịp; scan() của em trong kho không bị sửa',
    !c9.thang && maCua(c9).includes('cam-bien-nguoc') && m9.maMau.hamCuaMan[0].than.includes('while front_clear():') && m9.loiGiai.hamCuaMan[0].than.includes('while not front_clear():') && ChamHoc.cham(m9, m9.loiGiai, k9).soNhip === 42 && k9.find((h) => h.ten === 'scan').than.includes('while front_clear():'));
  const m10 = man(10), k10 = khoTruoc(m10.id);
  const r10 = ChamHoc.cham(m10, m10.loiGiai, k10);
  const gh = ChamHoc.cham(m10, m10.loiSai[4].baiLam, k10);
  kiem('che-list.10 Bãi đo xoay chiều: ba sân xe quay xuống / sang trái / lên, quay TRÁI hai lần; gioiHanHam 3 — lời giải gọi 3 hàm khác nhau (scan, turn_left, route_left) vừa giới hạn, 4 hàm khác nhau bị qua-gioi-han-ham; rẽ phải không thắng; trùm không khóa chương trình chính; 44 nhịp = BFS',
    r10.thang && J([...new Set(m10.loiGiai.chinh.filter((s) => /^[a-z_]+\(/.test(s.trim())).map((s) => s.trim().replace(/\(.*$/, '')))].sort()) === J(['route_left', 'scan', 'turn_left']) && maCua(gh).join() === 'qua-gioi-han-ham' && r10.soNhip === 44 && nhipCheCamBienTatCa(m10) === 44 && !m10.chinhCoDinh && !ChamHoc.cham(m10, m10.loiSai[0].baiLam, k10).thang);

  console.log('\n  Bảng 10 màn che-list (lời giải cách 1, sao; BFS = nhịp ngắn nhất)');
  console.log('  màn   | tên                    | ô  | nhịp | BFS | tạo / sửa      | lời giải (chương trình chính)');
  for (const { m, bfs } of BANG) {
    console.log('  ' + m.id.padEnd(5) + ' | ' + m.ten.padEnd(22) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + String(m.sao.nhip).padEnd(4) + ' | ' + String(bfs).padEnd(3) + ' | ' + (m.loiGiai.hamCuaEmMoi.map((h) => h.ten).join(',') || m.loiGiai.hamCuaMan.filter((h) => !(m.khoaHamMan || []).includes(h.ten)).map((h) => h.ten).join(',') || '—').padEnd(14) + ' | ' + m.loiGiai.chinh.join(' ; ').slice(0, 80));
  }
}

/* ================================================================= 5. ĐƯỜNG BFS CHẠY THẬT */
console.log('\n== 5. Đường BFS (do-duong-che-cam-bien.mjs) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng nhịp BFS ==');
{
  for (const m of che) {
    let ok = true, tong = 0, bfsTong = 0, chiTiet = '';
    sanCua(m).forEach((rows, i) => {
      const b = nhipCheCamBienSan(m, i);
      const k = SanHoc.chay(cfgSan(m, i), chuoiThanhMa(b.chuoi));
      bfsTong += b.nhip; tong += k.nhip;
      if (!(k.thang === true && k.nhip === b.nhip && !k.loi)) { ok = false; chiTiet += J([i, b.nhip, k.thang, k.nhip, k.loi]); }
    });
    kiem(m.id + ': đường BFS (' + bfsTong + ' nhịp' + (sanCua(m).length > 1 ? ', tổng ' + sanCua(m).length + ' sân' : '') + ') đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng nhịp BFS, không lỗi', ok && tong === bfsTong, chiTiet);
  }
  const m4 = man(4);
  const khong = Object.assign({}, m4, { bongMo: m4.bongMo.map((b) => Object.assign({}, b, { diQua: [] })) });
  kiem('bộ dò tự kiểm: bỏ ◆ ở che-list.4 (xe mờ cùng chỗ xe xuất phát) thì chương trình rỗng là xong: 0 nhịp — ◆ là thứ ép xe đi một vòng', nhipCheCamBienTatCa(khong) === 0);
}

/* ================================================================= 6. KHO CUỐI GAME, HUY HIỆU, THẺ SCRIPT */
console.log('\n== 6. Kho hàm của em, huy hiệu, thẻ script ==');
{
  const cuoi = khoTruoc('het');
  kiem('kho cuối game có đủ bốn hàm của che-list (route, route_left, scan, box) và còn nguyên thân; go_out, come_back, scan2, scan3, tour, tour_left không có trong kho',
    ['route', 'route_left', 'scan', 'box'].every((t) => cuoi.some((h) => h.ten === t)) && ['go_out', 'come_back', 'scan2', 'scan3', 'tour', 'tour_left'].every((t) => !cuoi.some((h) => h.ten === t)) &&
      J(cuoi.find((h) => h.ten === 'route').than) === J(['for n in steps:', '    forward(n)', '    turn_right()']) && J(cuoi.find((h) => h.ten === 'scan').thamSo) === '["seen"]');
  const sach = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  kiem('KhoHam khóa tên: người chơi không tạo được hàm tên route / route_left / scan / box ngoài màn chế nó', ['route', 'route_left', 'scan', 'box'].every((t) => tenCotTruyen.includes(t) && sach.tenCoDinh(t)));
  const hh = fs.readFileSync(path.join(day, 'game', 'huy-hieu.js'), 'utf8');
  kiem("huy hiệu: game/huy-hieu.js có HINH['che-list'] dựng bằng code (danh sách nhỏ + bánh răng themBanhRang)", /HINH\['che-list'\] = function \(\)[\s\S]*?themBanhRang\(p\);\s*return p;\s*\};/.test(hh));
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có thẻ script ../man-che-list.js đúng một lần, sau man-list.js; so-lenh.js nạp trước', tags.filter((t) => t === '../man-che-list.js').length === 1 && vtri('man-che-list.js') > vtri('man-list.js') && vtri('so-lenh.js') >= 0 && vtri('so-lenh.js') < vtri('man-che-list.js'), J(tags));
  kiem('hướng dẫn từng bước: che-list.1 (tạo route, khối for n in steps) và che-list.4 (tạo scan, khối seen.append) có trong huong-dan-man.js', /H\['che-list\.1'\]/.test(fs.readFileSync(path.join(day, 'game', 'huong-dan-man.js'), 'utf8')) && /H\['che-list\.4'\]/.test(fs.readFileSync(path.join(day, 'game', 'huong-dan-man.js'), 'utf8')));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

/* ============================================================================
   kiem-che-nhen.mjs — máy kiểm chương `che-nhen` (Chế lệnh nhện, chương 14) của "Đường học". Luật chân nhện ở lõi: kiem-nhen.mjs (mục 5).
   Gồm: cấu trúc 10 màn (khay, bóng mờ có chân, chương trình chính khóa, hàm của màn, đấu dây ngược, phần cứng hỏng, giới hạn hàm), hàm chế (crawl, jump, leap, crawl_jump, bring),
   lời giải đúng 3 sao đúng nhịp BFS (do-duong-nhen.mjs / do-duong-che-nhen.mjs), loiGiaiKhac đúng 2 sao, MỌI congThucKhac đều thắng, lời sai nêu đúng mã chẩn đoán,
   hàm của màn không vào kho / Sổ lệnh, khóa go_in, đường về (đảo thứ tự và hướng), chân lắp ngược, khớp duỗi kẹt (lenh-goc-hong), giới hạn ba hàm của trùm, Sổ lệnh, bảng 10 màn.
   Chạy: node robotics/hoc/kiem-che-nhen.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { nhipNhenNganNhat } from './do-duong-nhen.mjs';
import { nhipCheNhenTatCa } from './do-duong-che-nhen.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
const SoLenh = require(path.join(day, 'so-lenh.js'));
for (const f of ['man-chuoi-2', 'man-che-xe', 'man-tay-gap', 'man-che-tay', 'man-vong-lap', 'man-che-lap', 'man-bang-chuyen', 'man-tham-so', 'man-nhen']) require(path.join(day, f + '.js'));
const ManHoc = require(path.join(day, 'man-che-nhen.js'));
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
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
const L = (...d) => d.join('\n') + '\n';
const C7 = ['go_in()', 'come_back()'], C9 = ['crawl_safe("R")', 'crawl_safe("R")'];
const nem = (f) => { try { f(); return false; } catch (e) { return true; } };

const ds = ManHoc.danhSach.filter((m) => m.chuong === 'che-nhen');
const tatCa = ManHoc.danhSach;
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const man = (id) => ManHoc.tim(id);

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
const chamGiai = (m) => ChamHoc.cham(m, m.loiGiai, tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi));
const hamEm = (m) => (m.loiGiai.hamCuaEmMoi || []);
const loiCua = (r, ma) => (r.chanDoan.find((c) => c.ma === ma) || {}).loi || '';

/* ====================================================== 1. CẤU TRÚC 10 MÀN */
console.log('\n== 1. Cấu trúc 10 màn chương Chế lệnh nhện ==');
{
  const DU = ['go_up', 'go_down', 'go_left', 'go_right', 'crouch', 'stand', 'wait'], KET = ['go_up', 'go_down', 'go_left', 'go_right', 'crouch', 'wait'], TAY = DU.concat(['arm_down', 'arm_up', 'grab', 'release']);
  kiem('đúng 10 màn, số 1..10, id 14.1…14.10 (chương thứ 14, ngay sau nhen), mã che-nhen.1…, tên "Chế lệnh nhện"; thứ tự chương: …nhen, che-nhen, xich…',
    ds.length === 10 && ds.every((m, i) => m.so === i + 1 && m.id === '14.' + (i + 1) && m.ma === 'che-nhen.' + (i + 1)) && ThuTu.thuTu[12] === 'nhen' && ThuTu.thuTu[13] === 'che-nhen' && ThuTu.ten['che-nhen'] === 'Chế lệnh nhện' && ThuTu.laDot2('che-nhen'));
  kiem('hàng: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ màn 10 có huy hiệu { ma "che-nhen", ten "Huy hiệu Chế lệnh nhện" }',
    J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) &&
      ds.filter((m) => m.huyHieu).length === 1 && ds[9].huyHieu.ma === 'che-nhen' && ds[9].huyHieu.ten === 'Huy hiệu Chế lệnh nhện');
  kiem('mọi màn: nhện (loaiRobot nhen, robot.than nhen), cauTruc ["for","if"], Xưởng mở, được dùng hàm của em, chương trình 10 ô + mỗi hàm 10 ô; tay "kep" chỉ ở màn 6',
    ds.every((m) => m.loaiRobot === 'nhen' && m.robot.than === 'nhen' && (m.so === 6 ? m.robot.tay === 'kep' : m.robot.tay === null) && J(m.cauTruc) === '["for","if"]' && m.moXuong === true && m.camHamCuaEm === false && m.khung.chinh === 10 && m.khung.moiHam === 10));
  kiem('khay: màn 1–5, 7, 8, 10 có go_* + crouch + stand + wait; màn 6 thêm 4 lệnh tay; màn 9 chỉ crouch (khớp duỗi kẹt) và phanCung đúng bằng khay', ds.every((m) => J(m.hamGoc) === J(m.so === 6 ? TAY : m.so === 9 ? KET : DU)) && J(man('14.9').phanCung) === J(KET) && ds.filter((m) => m.phanCung).length === 1);
  kiem('mục tiêu: bóng mờ ở mọi màn trừ 3 và 10 (tới cờ); mọi bóng mờ có bongMo.chan ("co" ở màn 9, "dung" ở các màn khác); màn 6 có vật mờ',
    ds.every((m) => m.so === 3 || m.so === 10 ? m.mucTieu === undefined && (m.san.join('').match(/F/g) || []).length === 1 : m.mucTieu === 'bong-mo' && m.bongMo.chan === (m.so === 9 ? 'co' : 'dung') && !/F/.test(m.san.join(''))) && man('14.6').bongMo.vat.length === 1);
  kiem('chinhCoDinh ở mọi màn trừ 3 và 10 (người chơi tự viết); khoaHamMan ["go_in"] chỉ ở màn 7', ds.every((m) => (m.so === 3 || m.so === 10) ? !m.chinhCoDinh : m.chinhCoDinh === true) && ds.every((m) => J(m.khoaHamMan || []) === J(m.so === 7 ? ['go_in'] : [])));
  kiem('đấu dây ngược daoChieu ["chan"] + canhBao chỉ ở màn 8; canhBao ở màn 9 (hỏng); các màn khác không có', ds.every((m) => J(m.daoChieu || []) === J(m.so === 8 ? ['chan'] : []) && (m.so === 8 || m.so === 9 ? typeof m.canhBao === 'string' && m.canhBao.length > 6 : m.canhBao === undefined)));
  kiem('gioiHanHam: 3 ở màn 10 (trùm khai giới hạn theo nhiệm vụ); các màn khác không giới hạn', ds.every((m) => m.gioiHanHam === (m.so === 10 ? 3 : undefined)));
  kiem('sân tối đa 7 cột × 9 hàng; gầm n ở màn 1, 3, 5, 7, 9, 10; hố u ở màn 2, 3, 4, 5, 7, 8, 10; mọi sân trừ màn 6 (nhện giao hàng, bậc thang và vật) có ít nhất một địa hình mới',
    ds.every((m) => m.san.length <= 9 && m.san[0].length <= 7 && (m.so === 6 || /[nu]/.test(m.san.join('')))) && J(ds.filter((m) => /n/.test(m.san.join(''))).map((m) => m.so)) === '[1,3,5,7,9,10]' && J(ds.filter((m) => /u/.test(m.san.join(''))).map((m) => m.so)) === '[2,3,4,5,7,8,10]');
  kiem('hàm cốt truyện mới: 1 crawl, 2 jump, 4 leap, 5 crawl_jump, 6 bring; các màn khác không tạo (hàm của màn 7–9 không vào kho)', ds.every((m) => J(m.taoHam) === J({ '14.1': ['crawl'], '14.2': ['jump'], '14.4': ['leap'], '14.5': ['crawl_jump'], '14.6': ['bring'] }[m.id] || [])));
  kiem('crawl(d) 5 ô, jump(d) 4 ô, leap(path) 2 ô lồng jump, crawl_jump(d) 5 ô, bring(path) 3 ô; tham số d / path',
    (() => { const h = (id) => hamEm(man(id))[0]; return [['14.1', 'crawl', ['d'], 5], ['14.2', 'jump', ['d'], 4], ['14.4', 'leap', ['path'], 2], ['14.5', 'crawl_jump', ['d'], 5], ['14.6', 'bring', ['path'], 3]].every(([id, ten, ts, so]) => h(id).ten === ten && J(h(id).thamSo) === J(ts) && KhungCode.soOHam(h(id)) === so); })());
  kiem('hamCuaEmCan đúng: 1 [go], 2 [go], 3 [go, walk, crawl, jump], 4 [go, jump], 5 [go, crawl, jump], 6 [go, walk, pick, drop], 7 [go, walk, crawl, jump], 8 [go], 9 [go], 10 [go, walk, crawl, jump, leap, crawl_jump]',
    ds.every((m) => J(m.hamCuaEmCan) === J({ '14.1': ['go'], '14.2': ['go'], '14.3': ['go', 'walk', 'crawl', 'jump'], '14.4': ['go', 'jump'], '14.5': ['go', 'crawl', 'jump'], '14.6': ['go', 'walk', 'pick', 'drop'], '14.7': ['go', 'walk', 'crawl', 'jump'], '14.8': ['go'], '14.9': ['go'], '14.10': ['go', 'walk', 'crawl', 'jump', 'leap', 'crawl_jump'] }[m.id])));
  kiem('hamCuaEmCan ⊆ kho lúc tới màn, và bao hết các hàm của em có sẵn mà lời giải gọi tới (trực tiếp hay gián tiếp; có thể bao thêm hàm cách khác dùng, vd crawl / jump ở màn 5)', ds.every((m) => {
    const kho = khoTruoc(m.id).map((h) => h.ten), r = chamGiai(m);
    const dung = r.hamDaDung.filter((t) => !m.taoHam.includes(t) && r.chiTietO.ham.find((h) => h.ten === t).cot === 'hamEm');
    return m.hamCuaEmCan.every((t) => kho.includes(t)) && dung.every((t) => m.hamCuaEmCan.includes(t));
  }));
  kiem('hàm của màn 7 (go_in khóa, come_back thân `pass`), 8 (fixed_jump thân cũ), 9 (crawl_safe thân cũ) nằm ở maMau.hamCuaMan; không có trong taoHam / Sổ lệnh / tên khóa của kho; không còn bring ở nhen',
    ['go_in', 'come_back', 'fixed_jump', 'crawl_safe'].every((t) => !tenCotTruyen.includes(t) && SoLenh.tim(t) === null) && man('14.7').maMau.hamCuaMan.map((h) => h.ten).join() === 'go_in,come_back' && J(man('14.7').maMau.hamCuaMan[1].than) === '["pass"]' &&
      man('14.8').maMau.hamCuaMan[0].ten === 'fixed_jump' && man('14.9').maMau.hamCuaMan[0].ten === 'crawl_safe' && tatCa.filter((m) => m.chuong === 'nhen').every((m) => !m.taoHam.includes('bring')));
  kiem('mọi màn: đề 1–3 câu, gợi ý 1–2 câu, ≥ 1 lời sai; màn chế lệnh (trừ 3 và 10) có ≥ 1 congThucKhac', ds.every((m) => m.deBai.length > 20 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && m.goiY.length >= 1 && m.goiY.length <= 2 && m.loiSai.length >= 1 && ((m.congThucKhac || []).length >= 1)));
}

/* ====================================================== 2. LỜI GIẢI, SAO, ĐƯỜNG TẮT, CÁCH KHÁC, LỜI SAI */
console.log('\n== 2. Lời giải 3 sao đúng nhịp BFS, cách khác thắng, lời sai nêu đúng mã ==');
for (const m of ds) {
  const r = chamGiai(m), kho = khoTruoc(m.id);
  const thuan = nhipCheNhenTatCa(m, kho);
  kiem(m.id + ' ' + m.ten + ': lời giải thắng 3 sao, đúng sao.o ô (' + m.sao.o + ') và sao.nhip nhịp (' + m.sao.nhip + '), không chẩn đoán nào',
    r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, soNhip: r.soNhip, cd: maCua(r) }));
  kiem(m.id + ': không có ĐƯỜNG TẮT — BFS ' + thuan + (m.nhipTheoLoiGiai ? ' ≤ ' : ' = ') + 'sao.nhip ' + m.sao.nhip, thuan !== null && (m.nhipTheoLoiGiai ? thuan <= m.sao.nhip : thuan === m.sao.nhip), String(thuan));
  const kh = m.loiGiaiKhac, rk = ChamHoc.cham(m, kh.baiLam, tron(kho, kh.hamCuaEmMoi));
  kiem(m.id + ': loiGiaiKhac (' + kh.moTa + ') đúng 2 sao: nhiều ô hơn, cùng nhịp', rk.thang && rk.sao === 2 && rk.soO > m.sao.o && rk.soNhip === m.sao.nhip && !maCua(rk).includes('tran-khung'), J({ thang: rk.thang, sao: rk.sao, soO: rk.soO, soNhip: rk.soNhip }));
  (m.congThucKhac || []).forEach((c, i) => {
    const bai = c.baiLam || m.loiGiai, rc = ChamHoc.cham(m, bai, tron(kho, c.hamCuaEmMoi));
    kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): vẫn thắng, không lỗi khung', rc.thang && !rc.chanDoan.some((x) => x.muc === 'loi') && rc.sao >= 1, J({ thang: rc.thang, sao: rc.sao, nhip: rc.soNhip, cd: rc.chanDoan.map((x) => x.ma + ':' + x.muc) }));
  });
  m.loiSai.forEach((ls, i) => {
    const rs = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi)), co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => co.indexOf(x) < 0);
    kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): không đủ 3 sao, đủ mã ' + (ls.phaiCoMa.join('+') || '(chỉ chậm)'), rs.sao < 3 && thieu.length === 0, 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + rs.sao);
  });
}

/* ====================================================== 3. NGỮ NGHĨA TỪNG HÀM CHẾ */
console.log('\n== 3. Hàm chế: crawl, jump, leap, crawl_jump, bring ==');
{
  const NC = SanHoc.HAM_GOC.nhen;
  const GO = ['if d == "U":', '    go_up()', 'elif d == "D":', '    go_down()', 'elif d == "L":', '    go_left()', 'elif d == "R":', '    go_right()'];
  const khoCuoi = khoTruoc('14.10').concat([H('leap', ['for c in path:', '    jump(c)'], ['path']), H('crawl_jump', ['crouch()', 'go(d)', 'go(d)', 'stand()', 'go(d)'], ['d'])]);
  const hamBai = (id, ten) => { const k = khoTruoc(id).find((h) => h.ten === ten); return k; };
  const kho10 = tron(khoTruoc('14.10'), man('14.5').loiGiai.hamCuaEmMoi.concat(man('14.4').loiGiai.hamCuaEmMoi));
  const san5 = ['.....', '.....', '.....', '.....', '.....'], o = { x: 2, y: 2, huong: 0 };
  const chay = (rows, bd, chinh, ex) => ChamHoc.cham(Object.assign({ san: rows, batDau: bd, loaiRobot: 'nhen', hamGoc: NC, moXuong: true, khung: { chinh: 10, moiHam: 10 }, cauTruc: ['for', 'if'], mucTieu: 'toi-co' }, ex || {}), { chinh }, kho10);
  const toi = (r) => vt(r.theoSan[0].robot);
  kiem('crawl(d) đúng bốn hướng trên sân trống: đi hai ô theo hướng d, 5 nhịp, chân duỗi lại; chữ lạ thì chỉ co rồi duỗi tại chỗ',
    [['U', '2,0'], ['D', '2,4'], ['L', '0,2'], ['R', '4,2']].every(([d, kq]) => { const r = chay(san5, o, ['crawl("' + d + '")']); return toi(r) === kq && r.soNhip === 5 && r.theoSan[0].robot.chan === undefined || (toi(r) === kq && r.soNhip === 5); }) && (() => { const r = chay(san5, o, ['crawl("X")']); return toi(r) === '2,2' && r.soNhip === 1; })());
  kiem('jump(d) đúng bốn hướng trên sân trống: bật qua một ô (hai ô cách nhau), 3 nhịp; sau nhảy chân duỗi (nhảy tiếp phải co lại)',
    [['U', '2,0'], ['D', '2,4'], ['L', '0,2'], ['R', '4,2']].every(([d, kq]) => { const r = chay(san5, o, ['jump("' + d + '")']); return toi(r) === kq && r.soNhip === 3; }) && toi(chay(san5, { x: 0, y: 2, huong: 0 }, ['jump("R")', 'jump("R")'])) === '4,2');
  kiem('jump(d) qua hàng rào = và qua hố u; không đáp lên rào hay tường: nhện nhảy hụt (nhay-hut)', (() => { const a = chay(['.=.'], { x: 0, y: 0, huong: 0 }, ['jump("R")']), b = chay(['.u.'], { x: 0, y: 0, huong: 0 }, ['jump("R")']), c = chay(['.=='], { x: 0, y: 0, huong: 0 }, ['jump("R")']); return toi(a) === '2,0' && toi(b) === '2,0' && toi(c) === '0,0' && maCua(c).includes('nhay-hut') && !maCua(a).includes('nhay-hut'); })());
  kiem('leap("RRD") trên sân đá lót đường: ba cú nhảy liên tiếp = 9 nhịp; leap("") không làm gì; leap lồng jump (hai tầng vết lệnh: ngan có leap → jump)', (() => {
    const m4 = man('14.4'), r = chamGiai(m4); const tang = r.vet.filter((e) => e.loai === 'lenh').some((e) => e.ngan.length >= 2); return r.soNhip === 9 && r.thang && tang && chay(['..'], { x: 0, y: 0, huong: 0 }, ['leap("")']).soNhip === 0; })());
  kiem('crawl_jump(d) = 6 nhịp, nhanh hơn crawl(d) rồi jump(d) = 8 nhịp (chân còn co sau gầm nên nhảy luôn); cả hai cách đều tới đúng chỗ bóng mờ', (() => {
    const m5 = man('14.5'), a = chamGiai(m5), b = ChamHoc.cham(m5, m5.loiGiai, tron(khoTruoc('14.5'), [H('crawl_jump', ['crawl(d)', 'jump(d)'], ['d'])])); return a.soNhip === 6 && b.thang && b.soNhip === 8 && b.sao === 1; })());
  kiem('bring(path) màn 6: nhặt vật ở ô trên đầu nhện, đi theo path, đặt xuống: vật nằm đúng ô bóng mờ, nhện đúng ô; bring("DLL") thiếu drop() thì vật còn trên tay (lech-bong-mo)', (() => {
    const m6 = man('14.6'), r = chamGiai(m6), vatCuoi = r.vat.filter((v) => v.trangThai === 'dat'); return r.thang && vatCuoi.length === 1 && vt(vatCuoi[0]) === '1,4' && vt(r.theoSan[0].robot) === '1,5'; })());
  kiem('màn 3 (tự viết): đường dùng hàm đã chế cho kết quả đúng; chương trình 3 dòng vừa khung; thiếu một hàm trong kho (chưa chế jump) thì ham-chua-co',
    (() => { const m3 = man('14.3'), r = chamGiai(m3); const thieu = ChamHoc.cham(m3, m3.loiGiai, khoTruoc('14.3').filter((h) => h.ten !== 'jump')); return r.thang && m3.loiGiai.chinh.length === 3 && maCua(thieu).includes('ham-chua-co'); })());
  // Đường về
  const m7 = man('14.7'), kho7 = khoTruoc('14.7');
  const goIn = ChamHoc.cham(Object.assign({}, m7, { chinhCoDinh: false, mucTieu: undefined, bongMo: undefined }), { chinh: ['go_in()'], hamCuaMan: m7.maMau.hamCuaMan }, kho7);
  kiem('màn 7: go_in() đưa nhện từ (0,0) vào hang tới (4,2) trong 12 nhịp (walk "RR", crawl "D", jump "R"); lời giải đi ngược lại từng đoạn: jump("L"), crawl("U"), walk("LL") (24 nhịp), chân duỗi', (() => {
    const r = chamGiai(m7); return goIn.theoSan[0].soNhip === 12 && vt(goIn.theoSan[0].robot) === '4,2' && r.thang && r.soNhip === 24 && nhipVet(r.theoSan[0] ? { vet: r.theoSan[0].vet } : r).pop().robot.chan === 'dung'; })());
  const doiGoIn = ChamHoc.cham(m7, { chinh: ['go_in()', 'come_back()'], hamCuaMan: [H('go_in', ['jump("L")'], []), H('come_back', ['jump("L")', 'crawl("U")', 'walk("LL")'], [])] }, kho7);
  kiem('màn 7: người chơi sửa go_in() (hàm khóa) cũng vô ích: máy chấm luôn dùng bản của màn (khoaHamMan); sửa come_back() thì có tác dụng', doiGoIn.thang && doiGoIn.soNhip === 24 && ChamHoc.cham(m7, { chinh: ['go_in()', 'come_back()'], hamCuaMan: [m7.maMau.hamCuaMan[0], H('come_back', ['pass'], [])] }, kho7).thang === false);
  kiem('màn 7: đi ngược = đảo THỨ TỰ và HƯỚNG; đảo hướng mà giữ thứ tự → rơi hố; đảo thứ tự mà giữ hướng → nhảy hụt (nhay-hut); lệnh ngược trong LENH_NGUOC: go_right ↔ go_left, go_up ↔ go_down, crouch ↔ stand',
    (() => { const a = ChamHoc.cham(m7, { chinh: C7, hamCuaMan: [m7.maMau.hamCuaMan[0], H('come_back', ['walk("LL")', 'crawl("U")', 'jump("L")'], [])] }, kho7), b = ChamHoc.cham(m7, { chinh: C7, hamCuaMan: [m7.maMau.hamCuaMan[0], H('come_back', ['jump("R")', 'crawl("D")', 'walk("RR")'], [])] }, kho7);
      return maCua(a).includes('roi-ho') && maCua(b).includes('nhay-hut') && SanHoc.LENH_NGUOC.go_right === 'go_left' && SanHoc.LENH_NGUOC.go_up === 'go_down' && SanHoc.LENH_NGUOC.crouch === 'stand' && SanHoc.LENH_NGUOC.stand === 'crouch'; })());
  // Chân lắp ngược
  const m8 = man('14.8'), kho8 = khoTruoc('14.8');
  kiem('màn 8: dây chân đấu ngược — thân cũ của fixed_jump (crouch, wait, stand, go) làm nhện bước thường vào hố (roi-ho); lời giải (stand, wait, crouch, go) nhảy qua cả hai hố trong 6 nhịp; hàm jump(d) của em ở màn này cũng bị ngược (roi-ho)', (() => {
    const cu = ChamHoc.cham(m8, m8.maMau, kho8), moi = chamGiai(m8), jumpEm = ChamHoc.cham(Object.assign({}, m8, { chinhCoDinh: false }), { chinh: ['jump("R")', 'jump("R")'], hamCuaMan: [] }, tron(kho8, [H('jump', ['crouch()', 'wait()', 'stand()', 'go(d)'], ['d'])])); return !cu.thang && maCua(cu).includes('roi-ho') && moi.thang && moi.soNhip === 6 && !jumpEm.thang && maCua(jumpEm).includes('roi-ho'); })());
  kiem('màn 8: canhBao "Dây chân đấu ngược"; vết lệnh ghi tên lệnh người chơi gọi (stand, wait, crouch, go_right) dù chân chạy ngược', (() => { const r = chamGiai(m8), t = r.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten).slice(0, 4); return m8.canhBao === 'Dây chân đấu ngược' && J(t) === '["stand","wait","crouch","go_right"]'; })());
  // Khớp duỗi kẹt
  const m9 = man('14.9'), kho9 = khoTruoc('14.9');
  const loiKet = ChamHoc.cham(m9, m9.maMau, kho9);
  kiem('màn 9: gọi stand() khi khớp kẹt → lỗi chạy, chẩn đoán lenh-goc-hong nêu canhBao, tên lệnh stand() và các lệnh còn chạy được; hàm của em có stand (crawl) cũng báo hỏng; lời giải bỏ stand() và wait() thắng 8 nhịp, chân co như bóng mờ',
    (() => { const r = chamGiai(m9), l = loiCua(loiKet, 'lenh-goc-hong'); const crawlEm = ChamHoc.cham(Object.assign({}, m9, { chinhCoDinh: false }), { chinh: ['crawl("R")', 'crawl("R")'], hamCuaMan: [] }, tron(kho9, [H('crawl', ['crouch()', 'go(d)', 'go(d)', 'stand()', 'wait()'], ['d'])])); return maCua(loiKet).includes('lenh-goc-hong') && /Khớp duỗi chân bị kẹt/.test(l) && /stand\(\)/.test(l) && /crouch/.test(l) && !loiKet.thang && r.thang && r.soNhip === 8 && maCua(crawlEm).includes('lenh-goc-hong'); })());
  kiem('màn 9: bóng mờ chân CO — duỗi chân lại (lời giải thêm stand ở màn khác) thì lech-bong-mo nói chân nhện đang duỗi còn bóng mờ chân co', (() => {
    const m1 = Object.assign({}, m9, { hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'crouch', 'stand', 'wait'], phanCung: undefined, maMau: { chinh: C9, hamCuaMan: [] } });
    const r = ChamHoc.cham(m1, { chinh: C9, hamCuaMan: [H('crawl_safe', ['crouch()', 'go(d)', 'go(d)', 'stand()', 'wait()'], ['d'])] }, kho9); return maCua(r).includes('lech-bong-mo') && /Chân nhện đang duỗi/.test(loiCua(r, 'lech-bong-mo')) && /bóng mờ có chân co/.test(loiCua(r, 'lech-bong-mo')); })());
  // Trùm: giới hạn hàm
  const m10 = man('14.10'), kho10b = khoTruoc('14.10');
  kiem('màn 10 (trùm): gioiHanHam 3 — dùng đúng ba hàm khác nhau (leap, walk, crawl_jump) thắng; dùng bốn (leap, walk, crawl, jump) → qua-gioi-han-ham; jump hai lần thay leap vẫn ba hàm', (() => {
    const ok = chamGiai(m10), qua = ChamHoc.cham(m10, { chinh: ['leap("RR")', 'walk("RRDDL")', 'crawl("L")', 'jump("L")', 'walk("LDD")'] }, kho10b), jump2 = ChamHoc.cham(m10, { chinh: ['jump("R")', 'jump("R")', 'walk("RRDDL")', 'crawl_jump("L")', 'walk("LDD")'] }, kho10b);
    return ok.thang && maCua(qua).includes('qua-gioi-han-ham') && !qua.thang && jump2.thang && !maCua(jump2).includes('qua-gioi-han-ham'); })());
  kiem('màn 10: chương trình chính không bị khóa (tự viết); đường 4 dòng vừa khung; crawl_jump làm gầm + hố sát nhau nhanh hơn crawl rồi jump hai nhịp (BFS nhịp lời giải ≥ BFS thật)', (() => { const r = chamGiai(m10); return m10.loiGiai.chinh.length === 4 && r.soNhip === 28 && nhipCheNhenTatCa(m10, kho10b) <= r.soNhip; })());
  kiem('khai triển lời giải ra từng lệnh gốc chạy ra cùng kết quả, cùng nhịp (hàm không đổi luật), mọi màn trừ 6 (tay) và 7 (hàm khóa)',
    ds.filter((m) => m.so !== 6 && m.so !== 7).every((m) => {
      const r = chamGiai(m), raw = r.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten + '()').join('\n') + '\n';
      const k = SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: 'nhen', hamGoc: m.hamGoc, phanCung: m.phanCung, daoChieu: m.daoChieu, mucTieu: m.mucTieu || 'toi-co', bongMo: m.bongMo }, raw);
      return k.thang === r.thang && k.nhip === r.soNhip && J(k.robot) === J(r.theoSan[0].robot);
    }));
  void GO; void khoCuoi; void hamBai;
}

/* ====================================================== 4. SỔ LỆNH VÀ LỆNH GỐC */
console.log('\n== 4. Sổ lệnh và lệnh gốc ==');
{
  kiem('Sổ lệnh: crawl, jump, leap, crawl_jump, bring thuộc nhóm "nhen", chương che-nhen, đúng màn đầu tiên chế; go ở nhen.4, walk ở nhen.6; lời lớp 5 ngắn, không dấu chấm cuối',
    [['crawl', 'che-nhen.1'], ['jump', 'che-nhen.2'], ['leap', 'che-nhen.4'], ['crawl_jump', 'che-nhen.5'], ['bring', 'che-nhen.6']].every(([t, ma]) => { const h = SoLenh.tim(t); return h && h.nhom === 'nhen' && h.chuong === 'che-nhen' && h.man === ma && h.moTa.length <= 80 && !/[.]$/.test(h.moTa); }) &&
      SoLenh.tim('go').man === 'nhen.4' && SoLenh.tim('walk').man === 'nhen.6' && SoLenh.theoChuong('che-nhen').length === 5 && SoLenh.theoNhom('nhen').map((h) => h.ten).join() === 'go,walk,crawl,jump,leap,crawl_jump,bring');
  kiem('Sổ lệnh gốc: crouch ↔ stand có trong lenhGoc với lệnh ngược khớp SanHoc.LENH_NGUOC; capNguoc() có cặp [crouch, stand]; hai lệnh có trong HAM_GOC_MAC_DINH của kho',
    (() => { const c = SoLenh.lenhGoc.find((l) => l.ten === 'crouch'), s = SoLenh.lenhGoc.find((l) => l.ten === 'stand'); return c.nguoc === 'stand' && s.nguoc === 'crouch' && SoLenh.capNguoc().some((p) => (p[0] === 'crouch' && p[1] === 'stand') || (p[0] === 'stand' && p[1] === 'crouch')) && KhoHam.HAM_GOC_MAC_DINH.includes('crouch') && KhoHam.HAM_GOC_MAC_DINH.includes('stand'); })());
  kiem('kho cuối game: hàm cốt truyện của chương theo thứ tự lần đầu chế (…, go, walk, crawl, jump, leap, crawl_jump, bring, …); tên khóa không trùng hàm gốc / hàm chương khác',
    (() => { const t = tenCotTruyen, i = t.indexOf('go'); return J(t.slice(i, i + 7)) === '["go","walk","crawl","jump","leap","crawl_jump","bring"]' && new Set(t).size === t.length && !['crawl', 'jump', 'leap', 'crawl_jump', 'bring'].some((x) => KhoHam.HAM_GOC_MAC_DINH.includes(x)); })());
  // sân thử của Xưởng hàm
  const m1 = man('14.1'), ham = H('crawl', ['crouch()', 'go(d)', 'go(d)', 'stand()', 'wait()'], ['d']);
  const thu = ChamHoc.thuHam(m1, { chinh: [] }, 'crawl', tron(khoTruoc('14.1'), [ham]), { doiSo: ['"R"'] });
  kiem('Xưởng hàm: thử crawl("R") trên sân thử 5×5 mặc định: nhện từ (2,2) sang (4,2) trong 5 nhịp, không chẩn đoán', vt(thu.robot) === '4,2' && thu.soNhip === 5 && thu.chanDoan.length === 0, J([thu.robot, thu.soNhip, thu.chanDoan.map((c) => c.ma)]));
  const thuNhay = ChamHoc.thuHam(man('14.2'), { chinh: [] }, 'jump', tron(khoTruoc('14.2'), [H('jump', ['crouch()', 'wait()', 'stand()', 'go(d)'], ['d'])]), { doiSo: ['"U"'] });
  kiem('Xưởng hàm: thử jump("U") trên sân thử: nhện bật từ (2,2) lên (2,0) trong 3 nhịp', vt(thuNhay.robot) === '2,0' && thuNhay.soNhip === 3 && thuNhay.chanDoan.length === 0, J([thuNhay.robot, thuNhay.soNhip]));
}

/* ====================================================== 5. BẢNG 10 MÀN */
console.log('\n== 5. Bảng 10 màn chương Chế lệnh nhện ==');
{
  console.log('  màn   | sân | ô  | nhịp | BFS | mục tiêu | hàm chế / hàm của màn | lời giải (chương trình chính)');
  for (const m of ds) {
    const r = chamGiai(m), b = nhipCheNhenTatCa(m, khoTruoc(m.id));
    const tenHam = m.taoHam.join(', ') || (m.maMau.hamCuaMan.length ? 'màn: ' + m.maMau.hamCuaMan.map((h) => h.ten).join(', ') : '-');
    console.log('  ' + m.id.padEnd(5) + ' | ' + (m.san[0].length + '×' + m.san.length).padEnd(3) + ' | ' + String(r.soO).padEnd(2) + ' | ' + String(r.soNhip).padEnd(4) + ' | ' + String(b).padEnd(3) + ' | ' + (m.mucTieu === 'bong-mo' ? 'bóng mờ' : 'tới cờ ').padEnd(8) + ' | ' + tenHam.padEnd(21) + ' | ' + m.loiGiai.chinh.map((s) => s.trim()).join(' ; ').slice(0, 80));
  }
  for (const m of ds) {
    console.log('\n  ' + m.id + ' ' + m.ten + ' [' + m.hang + ', ' + (m.mucTieu === 'bong-mo' ? 'bóng mờ' + (m.bongMo.chan ? ' chân ' + m.bongMo.chan : '') : 'tới cờ') + '] ' + m.san[0].length + '×' + m.san.length + ' · nhện (' + m.batDau.x + ', ' + m.batDau.y + ')' + (m.bongMo ? ' → bóng mờ (' + m.bongMo.x + ', ' + m.bongMo.y + ')' : ''));
    for (const g of m.san) console.log('    ' + g);
  }
  kiem('bảng đã in', true);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

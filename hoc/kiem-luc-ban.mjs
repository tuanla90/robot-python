/* ============================================================================
   kiem-luc-ban.mjs — máy kiểm chương `luc-ban` (Lực bắn: spray("low") bắn nhanh / spray("high") bắn tụ, 26/10) của "Robot Chấn Hưng".
   Gồm:
   - LUẬT LÕI (san-hoc.js, phần SÚNG HƠI, mục LỰC BẮN): không đối số = bắn tụ (luật cũ); "low" bay tối đa 2 ô, không giật, hết tầm thì 'ban-ngan';
     spray_back("low"); biến mang lực; lực lạ → 'luc-ban-sai'; màn không khai lucBan → 'luc-chua-mo'; súng lắp ngược; đạn có hạn; bắn nhanh không đẩy thùng;
   - BỘ DÒ (do-duong-sung-hoi.mjs): chỉ thêm hai hành động bắn nhanh khi man.lucBan; đường của bộ dò viết thành mã rồi chạy thật bằng SanHoc cũng tới đích, đúng số nhịp;
   - 10 MÀN: lời giải 3 sao đúng sao.o / sao.nhip, không chẩn đoán; lời giải khác đúng 2 sao; lời sai đủ mã; BFS = sao.nhip (≤ khi nhipTheoLoiGiai); khung 7 × 9;
     hàm cốt truyện squirt / squirt_back / smart_spray có trong Sổ lệnh; đăng ký chương (thứ tự, gói Súng hơi, choi.html, lo-trinh-hoc.js, huy hiệu);
   - KHAY (thanh-phan.js với document giả): taoKieu cho spray ở màn Lực bắn là 'luc', đối số p của squirt(p) suy ra kiểu 'luc'.
   Các kiểm chung (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs.
   Chạy: node hoc/kiem-luc-ban.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { coHinhRieng } from './huy-hieu-ds.mjs';   // V7c2: mã huy hiệu từ dữ liệu bộ vector (huy-hieu.js không còn HINH pixel)

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
const SoLenh = require(path.join(day, 'so-lenh.js'));
const M = require(path.join(day, 'lo-trinh-hoc.js'));
const Bo = await import('./do-duong-sung-hoi.mjs');
const { nhipCheSungHoiTatCa } = await import('./do-duong-che-sung-hoi.mjs');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);

console.log('== 1. Luật lõi ==');
{
  const KHAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back'];
  // nút (3,0) cách xe 2 ô phía trên; thùng (3,3) ngay sau lưng, chỗ trượt (3,4); ô (3,5) để thử hết tầm khi quay xuống
  const SAN = ['#######', '###N###', '#.....#', '###.###', '###H###', '###.###', '###.###', '#######'];
  const goc = { loaiRobot: 'banh', hamGoc: KHAY, san: SAN, batDau: { x: 3, y: 3, huong: 0 }, lucBan: true };
  const chay = (cfg, code) => SanHoc.chay(Object.assign({}, goc, cfg), code);
  const sk = (r) => r.vet.filter((e) => e.loai === 'nhip').flatMap((e) => e.suKien || []);
  const xe = (r) => { const n = r.vet.filter((e) => e.loai === 'nhip'); return n.length ? n[n.length - 1].robot : null; };

  // xe (3,3) quay lên: (3,2) d1, (3,1) nút d2
  let r = chay({}, 'spray("high")\nwait()\n');
  kiem('spray("high") phun mạnh: trúng nút, xe giật lùi đẩy thùng sau lưng', !r.loi && sk(r).some((e) => e.ma === 'nut-doi') && sk(r).some((e) => e.ma === 'thung-di' && e.nguon === 'giat') && sk(r).some((e) => e.ma === 'ban' && e.luc === 'high'), J(sk(r).map((e) => e.ma)));
  r = chay({}, 'spray()\nwait()\n');
  kiem('không đối số = phun nhẹ (29/10), giống hệt spray("low"): không giật', !r.loi && sk(r).some((e) => e.ma === 'ban' && e.luc === 'low') && !sk(r).some((e) => e.ma === 'giat'));
  r = chay({}, 'spray("low")\nwait()\n');
  kiem('spray("low"): trúng nút cách 2 ô, KHÔNG có sự kiện giật, thùng nằm yên, xe đứng yên',
    !r.loi && sk(r).some((e) => e.ma === 'nut-doi') && !sk(r).some((e) => e.ma === 'giat' || e.ma === 'thung-di') && xe(r).x === 3 && xe(r).y === 3 && sk(r).some((e) => e.ma === 'ban' && e.luc === 'low' && !e.hetTam), J(sk(r).map((e) => e.ma)));
  r = chay({ batDau: { x: 1, y: 2, huong: 1 } }, 'spray("low")\nwait()\n');
  const bn = sk(r).find((e) => e.ma === 'ban');
  kiem('bắn nhanh hết tầm: bóng dừng ở ô thứ 2 (hetTam), có thông tin ban-ngan, ô rơi đúng', !!bn && bn.hetTam === true && bn.soO === 2 && bn.cuoi.x === 3 && bn.cuoi.y === 2 && r.suKien.some((e) => e.ma === 'ban-ngan'), J(bn));
  r = chay({ batDau: { x: 3, y: 2, huong: 2 } }, 'spray_back("low")\nwait()\n');
  kiem('spray_back("low"): bóng ra sau trúng nút cách 1 ô, xe không giật tới', !r.loi && sk(r).some((e) => e.ma === 'nut-doi') && xe(r).y === 2 && !sk(r).some((e) => e.ma === 'giat'));
  r = chay({ batDau: { x: 3, y: 2, huong: 2 } }, 'spray("low")\nwait()\n');
  kiem('bắn nhanh trúng thùng: bóng dừng ở thùng, thùng không nhúc nhích', !r.loi && sk(r).some((e) => e.ma === 'ban' && e.trung === 'thung') && !sk(r).some((e) => e.ma === 'thung-di'));
  r = chay({}, 'p = "low"\nspray(p)\nwait()\np = "high"\nspray(p)\nwait()\n');
  kiem('biến mang lực: p = "low" rồi "high" — phát đầu không giật, phát sau giật', !r.loi && sk(r).filter((e) => e.ma === 'ban').map((e) => e.luc).join() === 'low,high' && sk(r).filter((e) => e.ma === 'thung-di').length === 1);
  r = chay({}, 'def squirt(p):\n    spray(p)\n    wait()\nsquirt("low")\n');
  kiem('tham số mang lực: squirt("low") với thân spray(p)', !r.loi && sk(r).some((e) => e.ma === 'ban' && e.luc === 'low'));
  r = chay({}, 'spray("quick")\nwait()\n');
  kiem('lực lạ "quick" → lỗi chạy luc-ban-sai, có lucDat', r.loi && r.loi.ma === 'luc-ban-sai' && r.loi.lucDat === 'quick');
  r = chay({}, 'spray(2)\nwait()\n');
  kiem('lực là số → luc-ban-sai', r.loi && r.loi.ma === 'luc-ban-sai');
  r = chay({}, 'spray("low", "low")\nwait()\n');
  kiem('hai đối số → luc-ban-sai', r.loi && r.loi.ma === 'luc-ban-sai' && /nhiều nhất 1 đối số/.test(r.loi.thongDiep));
  r = chay({ lucBan: false }, 'spray("low")\nwait()\n');
  kiem('màn không khai lucBan mà gọi có đối số → luc-chua-mo', r.loi && r.loi.ma === 'luc-chua-mo');
  r = chay({ lucBan: false }, 'spray()\nwait()\n');
  kiem('màn không khai lucBan: spray() không đối số là phun nhẹ, không giật, thùng nằm yên', !r.loi && sk(r).some((e) => e.ma === 'ban' && e.luc === 'low') && !sk(r).some((e) => e.ma === 'thung-di'));
  r = chay({ daoChieu: ['sung'], batDau: { x: 3, y: 2, huong: 2 } }, 'spray("low")\nwait()\n');
  kiem('súng lắp ngược: spray("low") bắn ra sau, vẫn không giật', !r.loi && sk(r).some((e) => e.ma === 'ban' && e.sau && e.luc === 'low') && sk(r).some((e) => e.ma === 'nut-doi') && !sk(r).some((e) => e.ma === 'giat'));
  r = chay({ danToiDa: 1 }, 'spray("low")\nwait()\nspray("low")\nwait()\n');
  kiem('bắn nhanh cũng tốn đạn: phát thứ hai hết đạn', r.suKien.some((e) => e.ma === 'het-dan'));
  let loiCfg = '';
  try { SanHoc.chay({ loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait'], san: SAN, batDau: { x: 3, y: 3, huong: 0 }, lucBan: true }, 'wait()\n'); } catch (e) { loiCfg = e.message; }
  kiem('lucBan mà robot không có vòi phun → bỏ qua cờ, chạy bình thường (29/10: lộ trình bật cờ cho mọi màn từ gói 6)', loiCfg === '', loiCfg);
  kiem('SanHoc xuất LUC_BAN, TAM_BAN_NHANH = 2', J(SanHoc.LUC_BAN) === '["low","high"]' && SanHoc.TAM_BAN_NHANH === 2);

  // chẩn đoán qua máy chấm
  const man = { ma: 'thu', chuong: 'thu', loaiRobot: 'banh', hamGoc: KHAY, san: SAN, batDau: { x: 1, y: 2, huong: 1 }, lucBan: true, khung: { chinh: 10, moiHam: 10, cauTruc: [] }, cauTruc: [], moXuong: false, sao: { o: 9, nhip: 9 } };
  let kq = ChamHoc.cham(man, { chinh: ['spray("low")', 'wait()'], hamCuaMan: [] }, []);
  const cdNgan = kq.chanDoan.find((c) => c.ma === 'ban-ngan');
  kiem('chẩn đoán ban-ngan (thông tin): nói bay 2 ô rồi rơi, gợi ý "high"', !!cdNgan && cdNgan.muc === 'thong-tin' && /2 ô rồi rơi/.test(cdNgan.loi) && /"high"/.test(cdNgan.loi), cdNgan && cdNgan.loi);
  kq = ChamHoc.cham(man, { chinh: ['spray("Fast")', 'wait()'], hamCuaMan: [] }, []);
  kiem('chẩn đoán luc-ban-sai (lỗi): nhắc chữ thường trong dấu nháy', maCua(kq).includes('luc-ban-sai') && /chữ thường/.test(kq.chanDoan.find((c) => c.ma === 'luc-ban-sai').loi));
  kq = ChamHoc.cham(Object.assign({}, man, { lucBan: false }), { chinh: ['spray("low")', 'wait()'], hamCuaMan: [] }, []);
  kiem('chẩn đoán luc-chua-mo (lỗi)', maCua(kq).includes('luc-chua-mo'));
}

console.log('\n== 2. Bộ dò ==');
const ds = M.danhSach.filter((m) => m.chuong === 'luc-ban').sort((a, b) => a.so - b.so);
{
  const coLuc = Bo.hanhDongChoPhep({ loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back'], lucBan: true }, {});
  const khongLuc = Bo.hanhDongChoPhep({ loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back'] }, {});
  kiem('phun nhẹ luôn có; phun mạnh (không luc) chỉ có ở màn lucBan', coLuc.filter((a) => a.luc === 'low').length === 2 && coLuc.filter((a) => a.ban && !a.luc).length === 2 && khongLuc.filter((a) => a.luc === 'low').length === 2 && !khongLuc.some((a) => a.ban && !a.luc));
  kiem('chuoiThanhMa viết spray() / spray_back() cho phun nhẹ, spray("high") cho phun mạnh', Bo.chuoiThanhMa([{ ban: 'truoc', luc: 'low' }, { ban: 'sau', luc: 'low' }, { ban: 'truoc' }]) === 'spray()\nwait()\nspray_back()\nwait()\nspray("high")\nwait()\n');
  // so chéo: đường của bộ dò chạy thật bằng SanHoc (mỗi sân) cũng tới đích, đúng số nhịp
  for (const m of ds) {
    const nhieu = Array.isArray(m.san[0]), dsSan = nhieu ? m.san : [m.san];
    let ok = true, ct = '';
    dsSan.forEach((rows, i) => {
      const lm = SanHoc.lopMauCuaSan(m, i);
      const con = Object.assign({}, m, { san: rows, batDau: nhieu ? m.batDau[i] : m.batDau, bongMo: lm.bongMo || m.bongMo, noi: lm.noi || m.noi });
      const b = Bo.nhipSungHoiNganNhat(con);
      if (b.nhip === null) { ok = false; ct = 'sân ' + i + ' không giải được'; return; }
      const r = SanHoc.chay(con, Bo.chuoiThanhMa(b.chuoi));
      const nhip = r.vet.filter((e) => e.loai === 'nhip').length;
      if (!r.thang || nhip !== b.nhip) { ok = false; ct = 'sân ' + i + ': thắng ' + r.thang + ', nhịp ' + nhip + '/' + b.nhip; }
    });
    kiem(m.ma + ': đường của bộ dò chạy thật cũng thắng, đúng nhịp', ok, ct);
  }
}

console.log('\n== 3. Mười màn ==');
{
  const kho = [];
  const them = (h) => { const i = kho.findIndex((x) => x.ten === h.ten); if (i >= 0) kho[i] = h; else kho.push(h); };
  for (const ch of ThuTu.thuTu) {
    if (ch === 'luc-ban') break;
    M.danhSach.filter((m) => m.chuong === ch).sort((a, b) => a.so - b.so).forEach((m) => (m.loiGiai.hamCuaEmMoi || []).forEach(them));
  }
  kiem('đúng 10 màn, so 1..10, hàng 3 · 3 · 3 · 1', ds.length === 10 && ds.every((m, i) => m.so === i + 1) && J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']));
  kiem('mọi màn: súng hơi, lucBan, cauTruc for/if/while; 8–10 thêm cảm biến khoảng cách và front_clear', ds.every((m) => m.robot.tay === 'hoi' && m.lucBan === true && J(m.cauTruc) === '["for","if","while"]' &&
    (m.so >= 8) === (m.robot.camBien.some((c) => c.ma === 'khoang-cach') && m.hamGoc.includes('front_clear'))));
  kiem('sân tối đa 7 cột × 9 hàng (cả ba sân của trùm)', ds.every((m) => (Array.isArray(m.san[0]) ? m.san : [m.san]).every((s) => s.length <= 9 && s.every((h) => h.length <= 7))));
  for (const m of ds) {
    const kq = ChamHoc.cham(m, m.loiGiai, (m.loiGiai.hamCuaEmMoi || []).concat(kho));
    kiem(m.ma + ' ' + m.ten + ': lời giải 3 sao, đúng sao.o / sao.nhip, không chẩn đoán', kq.thang && kq.sao === 3 && kq.soO === m.sao.o && kq.soNhip === m.sao.nhip && !kq.chanDoan.length,
      J({ thang: kq.thang, sao: kq.sao, o: kq.soO, nhip: kq.soNhip, cd: maCua(kq) }));
    const mMo = m.chiChay ? Object.assign({}, m, { chiChay: false, chinhCoDinh: false }) : m;       // gói T mùa 2: luc-ban.1 trình diễn (main khoá): lời giải khác / lời sai chấm trên bản không khoá
    if (m.loiGiaiKhac) {
      const k2 = ChamHoc.cham(mMo, m.loiGiaiKhac.baiLam, (m.loiGiaiKhac.hamCuaEmMoi || []).concat(kho));
      kiem(m.ma + ': lời giải khác đúng 2 sao', k2.thang && k2.sao === 2, J({ sao: k2.sao, o: k2.soO, nhip: k2.soNhip }));
    }
    m.loiSai.forEach((ls, i) => {
      const k3 = ChamHoc.cham(mMo, ls.baiLam, (ls.hamCuaEmMoi || []).concat(kho));
      const thieu = ls.phaiCoMa.filter((x) => !maCua(k3).includes(x));
      kiem(m.ma + ' lời sai #' + (i + 1) + ': không thắng, đủ mã ' + ls.phaiCoMa.join('+'), !k3.thang && !thieu.length, 'có ' + maCua(k3).join(','));
    });
    const bfs = nhipCheSungHoiTatCa(m, kho);
    kiem(m.ma + ': BFS ' + (m.nhipTheoLoiGiai ? '≤' : '=') + ' sao.nhip', m.nhipTheoLoiGiai ? bfs !== null && bfs <= m.sao.nhip : bfs === m.sao.nhip, 'BFS ' + bfs + ', sao.nhip ' + m.sao.nhip);
    (m.loiGiai.hamCuaEmMoi || []).forEach(them);
  }
  kiem('màn 1: bắn tụ thì lệch bóng mờ, bắn nhanh thì thắng (lý do chọn lực); gói T: màn 1 là màn trình diễn (chiChay), chấm trên bản không khoá',
    (() => { const m = Object.assign({}, ds[0], { chiChay: false, chinhCoDinh: false }); return ds[0].chiChay === true && !ChamHoc.cham(m, { chinh: ['spray()', 'wait()', 'turn_left()', 'forward(3)'], hamCuaMan: [] }, kho).thang; })());
  kiem('màn 2: bắn nhanh thì bóng rơi (ban-ngan), cửa không mở', (() => { const m = ds[1]; return maCua(ChamHoc.cham(m, { chinh: ['spray("low")', 'wait()', 'turn_left()', 'forward(2)'], hamCuaMan: [] }, kho)).includes('ban-ngan'); })());
  kiem('trùm: luôn một lực thì không qua được cả ba sân (mỗi lực trượt ít nhất một sân)', ds[9].loiSai.length >= 2 && ds[9].loiSai.every((ls) => !ChamHoc.cham(ds[9], ls.baiLam, kho).thang));
  kiem('trùm có huy hiệu luc-ban, nhịp tính tổng ba sân', ds[9].huyHieu && ds[9].huyHieu.ma === 'luc-ban' && ds[9].nhipTheo === 'tong' && ds[9].san.length === 3);
  kiem('hàm cốt truyện tạo ở chương: squirt (4), squirt_back (5), smart_spray (8); có mục Sổ lệnh nhóm hoi, chương luc-ban, đúng màn',
    J(ds.flatMap((m) => m.taoHam)) === '["squirt","squirt_back","smart_spray"]' &&
    ['squirt', 'squirt_back', 'smart_spray'].every((t, i) => SoLenh.tim(t) && SoLenh.tim(t).nhom === 'hoi' && SoLenh.tim(t).chuong === 'luc-ban' && SoLenh.tim(t).man === 'luc-ban.' + [4, 5, 8][i]));
  kiem('hàm của màn tap_left (7) và pick_spray (9) không có trong Sổ lệnh', !SoLenh.tim('tap_left') && !SoLenh.tim('pick_spray'));
}

console.log('\n== 4. Đăng ký ==');
{
  const tt = ThuTu.thuTu;
  // Giữa che-sung-hoi (gói 4 Nhà máy) và luc-ban (gói 6) chỉ có chương của gói 5 Đẩy thùng (hiện khi đã có màn, KE-HOACH-MUA-2.md).
  const giuaLB = tt.slice(tt.indexOf('che-sung-hoi') + 1, tt.indexOf('luc-ban'));
  kiem('thứ tự: luc-ban sau che-sung-hoi, giữa chỉ có chương gói Đẩy thùng; có tên "Phun nhanh, phun tụ" (quy tắc đặt tên 29/10, gói tên "Lực phun"), thuộc đợt 2', tt.indexOf('luc-ban') > tt.indexOf('che-sung-hoi') && giuaLB.every((c) => ['day-thung', 'che-day-thung'].includes(c)) && ThuTu.ten['luc-ban'] === 'Phun nhanh, phun tụ' && ThuTu.laDot2('luc-ban'), J(giuaLB));
  // Khung mùa 2 (27/10, KE-HOACH-MUA-2.md): Lực bắn là gói 6 riêng (chương 1 luc-ban, chương 2 che-luc-ban khi có màn), đứng ngay sau gói Nhà máy (bang-chuyen, che-sung-hoi).
  const gLB = ThuTu.goi.find((g) => g.ma === 'luc-ban'), iLB = ThuTu.goi.indexOf(gLB);
  const gTruoc = iLB > 0 && ThuTu.goi[iLB - 1].ma === 'day-thung' ? ThuTu.goi[iLB - 2] : ThuTu.goi[iLB - 1];
  kiem('gói Lực bắn (mùa 2) mở đầu bằng chương luc-ban, đứng sau gói chứa che-sung-hoi (giữa chỉ có gói Đẩy thùng)',
    gLB && gLB.mua === 'mua-2' && gLB.chuong[0] === 'luc-ban' && gTruoc.chuong.includes('che-sung-hoi'), gLB && J(gLB.chuong));
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  kiem('choi.html nạp ../man-luc-ban.js đúng một lần, ngay sau ../man-che-sung-hoi.js', tags.filter((t) => t === '../man-luc-ban.js').length === 1 && tags.indexOf('../man-luc-ban.js') === tags.indexOf('../man-che-sung-hoi.js') + 1);
  kiem('lo-trinh-hoc.js require luc-ban', /'che-sung-hoi', 'luc-ban'/.test(fs.readFileSync(path.join(day, 'lo-trinh-hoc.js'), 'utf8')));
  kiem('huy hiệu vector có hình cho luc-ban', coHinhRieng('luc-ban'));
}

console.log('\n== 5. Khay ==');
{
  global.window = global;
  global.document = { addEventListener() {}, getElementById() { return null; }, body: { classList: { add() {}, remove() {} } }, createElement() { return { style: {}, classList: { add() {}, remove() {}, toggle() {} }, appendChild() {}, setAttribute() {}, addEventListener() {}, querySelector() { return null; } }; } };
  let TP = null, loiNap = '';
  try { require(path.join(day, 'game', 'thanh-phan.js')); TP = global.window.TP; } catch (e) { loiNap = e.message; }
  kiem('thanh-phan.js nạp được (document giả)', !!TP && typeof TP.taoKieu === 'function', loiNap);
  if (TP) {
    const m4 = ds[3], m1 = ds[0];
    const k4 = TP.taoKieu(() => ({ man: m4, hamCuaMan: [], kho: [] }));
    kiem('màn Lực bắn: kiểu đối số của spray / spray_back là "luc" (thẻ chèn spray("high"))', k4('spray', 0) === 'luc' && k4('spray_back', 0) === 'luc');
    kiem('squirt(p) của lời giải: đối số p suy ra kiểu "luc"', k4('squirt', 0) === 'luc');
    const kTho = TP.taoKieu(() => ({ man: ds[6], hamCuaMan: [], kho: [] }));
    kiem('hàm của màn tap_left(p): đối số p kiểu "luc"', kTho('tap_left', 0) === 'luc');
    const kCu = TP.taoKieu(() => ({ man: M.timMa('sung-hoi.4'), hamCuaMan: [], kho: [] }));
    kiem('màn súng hơi cũ: spray không có ô lực', kCu('spray', 0) !== 'luc');
    void m1;
  }
  const src = fs.readFileSync(path.join(day, 'game', 'thanh-phan.js'), 'utf8');
  kiem('bộ chọn chuỗi có kiểu "luc" với hai nút low / high', /var LUC_BAN = \['low', 'high'\]/.test(src) && /o\.kieu === 'luc' \? LUC_BAN : CHU_HUONG/.test(src));
}

console.log('\nĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

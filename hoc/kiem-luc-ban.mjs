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
  // PDM2b 31/10 (part đúng mùa): R1 là xe cứu hỏa (thân xích + vòi phun); 8–10 thêm mắt hồng ngoại distance() (trước: xe hai bánh + cảm biến khoảng cách front_clear)
  kiem('mọi màn: xe xích gắn vòi phun, lucBan, cauTruc for/if/while; 8–10 thêm mắt hồng ngoại và distance', ds.every((m) => m.loaiRobot === 'xich' && m.robot.than === 'xich' && m.robot.tay === 'hoi' && m.lucBan === true && J(m.cauTruc) === '["for","if","while"]' &&
    !m.hamGoc.includes('front_clear') && (m.so >= 8) === (m.robot.camBien.some((c) => c.ma === 'hong-ngoai') && m.hamGoc.includes('distance'))));
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
    (() => { const m = Object.assign({}, ds[0], { chiChay: false, chinhCoDinh: false }); return ds[0].chiChay === true && !ChamHoc.cham(m, { chinh: ['spray()', 'wait()', 'tr_left()', 'forward(3)'], hamCuaMan: [] }, kho).thang; })());
  kiem('màn 2: bắn nhanh thì bóng rơi (ban-ngan), cửa không mở', (() => { const m = ds[1]; return maCua(ChamHoc.cham(m, { chinh: ['spray("low")', 'wait()', 'tr_left()', 'forward(2)'], hamCuaMan: [] }, kho)).includes('ban-ngan'); })());
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
  kiem('thứ tự: luc-ban sau che-sung-hoi, giữa chỉ có chương gói Đẩy thùng; có tên "Phun mạnh, phun nhẹ" (quy tắc đặt tên 29/10, gói tên "Lực phun"), thuộc đợt 2', tt.indexOf('luc-ban') > tt.indexOf('che-sung-hoi') && giuaLB.every((c) => ['day-thung', 'che-day-thung'].includes(c)) && ThuTu.ten['luc-ban'] === 'Phun mạnh, phun nhẹ' && ThuTu.laDot2('luc-ban'), J(giuaLB));
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

console.log('\n== 6. Ghép nhịp mùa 2: ghì xích (cfg.ghiXich, 2a, phóng ±2) và vừa chạy vừa phun (cfg.phunKhiChay, 2b) ==');
{
  // hành lang 9 ô (x 1..7 đi được), xe xích quay phải (huong 1) ở giữa; mỗi ca đổi sân / chỗ xuất phát khi cần
  const KHAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back'];
  const HL = ['#########', '#.......#', '#########'];
  const goc = { loaiRobot: 'xich', hamGoc: KHAY, san: HL, batDau: { x: 4, y: 1, huong: 1 }, lucBan: true };
  const G = { ghiXich: true }, P = { phunKhiChay: true }, GP = { ghiXich: true, phunKhiChay: true };
  const chay = (cfg, code) => SanHoc.chay(Object.assign({}, goc, cfg), code);
  const nhips = (r) => r.vet.filter((e) => e.loai === 'nhip');
  const sk = (r) => nhips(r).flatMap((e) => e.suKien || []);
  const ma = (r) => sk(r).map((e) => e.ma).join('/');
  const o = (r) => { const n = nhips(r); const x = n[n.length - 1].robot; return x.x + ',' + x.y; };
  const co = (r, m) => sk(r).some((e) => e.ma === m);
  const mot = (r, m) => sk(r).find((e) => e.ma === m) || {};
  const TIEN = 'left_move()\nright_move()\nwait()\n', LUI = 'left_back()\nright_back()\nwait()\n';

  // --- 2a GHÌ XÍCH: tổng 0 ---
  let r = chay(G, 'spray("high")\n' + TIEN);
  kiem('2a spray("high") + hai xích tiến: tổng 0, xe đứng yên, có ghi-xich, KHÔNG giat, KHÔNG ban-dung-yen', !r.loi && o(r) === '4,1' && co(r, 'ghi-xich') && !co(r, 'giat') && !co(r, 'ban-dung-yen') && mot(r, 'ban').luc === 'high', ma(r));
  const gx = mot(r, 'ghi-xich');
  kiem('2a sự kiện ghi-xich { nhip, o, huong = hướng giật bị ghì (trái = 3), xich = hướng xích đẩy (phải = 1) }', co(r, 'ghi-xich') && gx.nhip === 1 && gx.o.x === 4 && gx.o.y === 1 && gx.huong === 3 && gx.xich === 1, J(gx));
  kiem('2a thứ tự: tia bay (ban) trước, rồi ghi-xich', ma(r).indexOf('ban') < ma(r).indexOf('ghi-xich'), ma(r));
  r = chay(G, 'spray_back("high")\n' + LUI);
  kiem('2a spray_back("high") + hai xích lùi: tổng 0, đứng yên, ghi-xich', !r.loi && o(r) === '4,1' && co(r, 'ghi-xich') && !co(r, 'giat'), ma(r));
  // --- PHÓNG ±2 ---
  r = chay(G, 'spray_back("high")\n' + TIEN);
  let ph = mot(r, 'phong');
  kiem('phóng tới: spray_back("high") + tiến → đi 2 ô (4 → 6), phong soO 2, vat null, không giat', !r.loi && o(r) === '6,1' && co(r, 'phong') && ph.soO === 2 && ph.vat === null && ph.tu.x === 4 && ph.den.x === 6 && ph.huong === 1 && !co(r, 'giat'), ma(r) + ' ' + J(ph));
  kiem('phóng tới: hai bước "tien" từng ô (hoạt cảnh trượt 2 ô)', sk(r).filter((e) => e.ma === 'tien').map((e) => e.den.x).join() === '5,6', ma(r));
  r = chay(G, 'spray("high")\n' + LUI);
  ph = mot(r, 'phong');
  kiem('phóng lùi: spray("high") + lùi → đi 2 ô về sau (4 → 2), huong 3', !r.loi && o(r) === '2,1' && co(r, 'phong') && ph.soO === 2 && ph.huong === 3, ma(r));
  r = chay(Object.assign({ batDau: { x: 6, y: 1, huong: 1 } }, G), 'spray_back("high")\n' + TIEN);
  ph = mot(r, 'phong');
  kiem('phóng vướng ô thứ 2: đi 1 ô rồi dừng trước tường (6 → 7), phong soO 1 vat có, dam-tuong ghi lại', o(r) === '7,1' && co(r, 'phong') && ph.soO === 1 && !!ph.vat && co(r, 'dam-tuong') && r.suKien.some((e) => e.ma === 'phong'), ma(r) + ' ' + J(ph));
  r = chay(Object.assign({ batDau: { x: 7, y: 1, huong: 1 } }, G), 'spray_back("high")\n' + TIEN);
  ph = mot(r, 'phong');
  kiem('phóng vướng ngay ô đầu: đứng yên, phong soO 0', o(r) === '7,1' && co(r, 'phong') && ph.soO === 0 && !!ph.vat, ma(r));
  // phóng gặp thùng nặng: từng ô theo luật xích (xichDay tiến thì đẩy thùng; không cờ thì đâm)
  const HLT = ['#########', '#....H..#', '#########'];
  r = chay(Object.assign({ san: HLT, xichDay: true }, G), 'spray_back("high")\n' + TIEN);
  kiem('phóng + xichDay: mỗi ô xích đẩy thùng 1 ô (thùng 5 → 7, xe 4 → 6)', o(r) === '6,1' && sk(r).filter((e) => e.ma === 'thung-di' && e.nguon === 'xich').length === 2 && mot(r, 'phong').soO === 2, ma(r));
  r = chay(Object.assign({ san: HLT }, G), 'spray_back("high")\n' + TIEN);
  kiem('phóng không xichDay: thùng ngay trước mũi chặn như tường, xe đứng yên (soO 0, vat thung-nang)', o(r) === '4,1' && mot(r, 'phong').soO === 0 && mot(r, 'phong').vat === 'thung-nang', ma(r));
  // tổng ±1: bệ súng giữ (không giật) → chỉ còn xích; hết đạn → không phun, không giật → chỉ còn xích
  r = chay(Object.assign({ beSung: true }, G), 'spray("high")\n' + TIEN);
  kiem('ghiXich + beSung: bệ giữ (be-sung), không giật, xích đi 1 ô (4 → 5)', o(r) === '5,1' && co(r, 'be-sung') && !co(r, 'giat') && !co(r, 'phong'), ma(r));
  r = chay(Object.assign({ danToiDa: 0 }, G), 'spray("high")\n' + TIEN);
  kiem('ghiXich + hết đạn: không phun nên không giật, xích vẫn đi 1 ô (het-dan)', o(r) === '5,1' && co(r, 'het-dan') && !co(r, 'ghi-xich'), ma(r));
  // súng lắp ngược: spray("high") bắn ra sau, giật tới → cộng xích tiến = phóng
  r = chay(Object.assign({ daoChieu: ['sung'] }, G), 'spray("high")\n' + TIEN);
  kiem('ghiXich + súng lắp ngược: spray("high") bắn ra sau (giật tới) + tiến → phóng 2 ô', o(r) === '6,1' && mot(r, 'phong').soO === 2 && mot(r, 'ban').sau === true, ma(r));
  // tổ hợp quay vẫn bỏ
  r = chay(G, 'spray("high")\nleft_move()\nwait()\n');
  let bd = mot(r, 'ban-dung-yen');
  kiem('2a quay một bên + phun mạnh: vẫn ban-dung-yen, xe giật như cũ, có ghep { thang: false }', co(r, 'ban-dung-yen') && co(r, 'giat') && o(r) === '3,1' && bd.ghep && bd.ghep.thang === false && bd.ghep.luc === 'high', ma(r) + ' ' + J(bd));
  r = chay(G, 'spray("high")\nleft_move()\nright_back()\nwait()\n');
  kiem('2a hai xích ngược chiều (quay tại chỗ) + phun mạnh: vẫn ban-dung-yen', co(r, 'ban-dung-yen') && co(r, 'giat'), ma(r));
  r = chay(G, 'spray()\n' + TIEN);
  kiem('chỉ ghiXich: phun nhẹ + tiến KHÔNG thuộc 2a → ban-dung-yen, ghep.luc low, xe đứng yên', co(r, 'ban-dung-yen') && mot(r, 'ban-dung-yen').ghep.luc === 'low' && o(r) === '4,1', ma(r));
  // quay dở cũ mất rồi ghì
  r = chay(G, 'left_move()\nwait()\nspray("high")\n' + TIEN);
  kiem('xích quay dở rồi nhịp ghì: xich-quay-do (quay dở mất), nhịp sau ghì đứng yên hướng cũ', co(r, 'xich-quay-do') && co(r, 'ghi-xich') && nhips(r)[1].robot.huong === 1 && o(r) === '4,1', ma(r));
  // --- 2b VỪA CHẠY VỪA PHUN ---
  const HLN = ['##########', '#.......N#', '##########'];
  r = chay(Object.assign({ san: HLN }, P), 'spray()\n' + TIEN);    // xe 4: van ở 8 cách 4 ô; đi 1 ô tới 5, tia nhẹ 2 ô tới 7: chưa tới
  kiem('2b spray() + tiến: xích đi 1 ô TRƯỚC (tien rồi ban), tia phun từ ô mới (ban.tu = 5)', !r.loi && o(r) === '5,1' && ma(r).indexOf('tien') < ma(r).indexOf('ban') && mot(r, 'ban').tu.x === 5 && !co(r, 'ban-dung-yen') && !co(r, 'giat'), ma(r));
  r = chay(Object.assign({ san: HLN, batDau: { x: 5, y: 1, huong: 1 } }, P), 'spray("low")\n' + TIEN);
  kiem('2b tia từ ô mới bay đủ 2 ô: xe 5 → 6, trúng van ở 8 (từ ô cũ thì 3 ô, không tới)', o(r) === '6,1' && co(r, 'nut-doi'), ma(r));
  r = chay(Object.assign({ san: HLN, batDau: { x: 5, y: 1, huong: 1 } }, { lucBan: true }), 'spray("low")\n' + TIEN);
  kiem('không cờ phunKhiChay: cùng mã đó thì bánh bị bỏ (ban-dung-yen), tia hụt van', o(r) === '5,1' && co(r, 'ban-dung-yen') && !co(r, 'nut-doi'), ma(r));
  r = chay(Object.assign({ batDau: { x: 7, y: 1, huong: 1 } }, P), 'spray_back()\n' + TIEN);
  kiem('2b xích bị chặn: đứng yên (dam-tuong), tia phun từ ô cũ', o(r) === '7,1' && co(r, 'dam-tuong') && mot(r, 'ban').tu.x === 7, ma(r));
  r = chay(P, 'spray_back("low")\n' + LUI);
  kiem('2b spray_back("low") + lùi: lùi 1 ô (4 → 3), phun ra sau từ ô mới', o(r) === '3,1' && mot(r, 'ban').tu.x === 3 && mot(r, 'ban').sau === true, ma(r));
  r = chay(P, 'spray()\nright_move()\nwait()\n');
  kiem('2b quay một bên + phun nhẹ: vẫn ban-dung-yen', co(r, 'ban-dung-yen') && mot(r, 'ban-dung-yen').ghep.thang === false, ma(r));
  r = chay(P, 'spray("high")\n' + TIEN);
  kiem('chỉ phunKhiChay: phun MẠNH + tiến vẫn bị bỏ (ban-dung-yen) và giật như cũ', co(r, 'ban-dung-yen') && co(r, 'giat') && o(r) === '3,1', ma(r));
  r = chay(GP, 'spray()\n' + TIEN + 'spray("high")\n' + TIEN);
  kiem('hai cờ cùng màn: nhịp 1 phun nhẹ chạy (4 → 5), nhịp 2 phun mạnh ghì (đứng ở 5)', o(r) === '5,1' && co(r, 'ghi-xich') && !co(r, 'ban-dung-yen'), ma(r));
  // --- cờ chỉ có nghĩa với xích; màn không khai cờ giữ y nguyên ---
  r = chay(Object.assign({ loaiRobot: 'banh' }, GP), 'spray("high")\n' + TIEN);
  kiem('xe hai bánh bỏ qua ghiXich / phunKhiChay: ban-dung-yen, giật, KHÔNG có trường ghep (vết như cũ)', co(r, 'ban-dung-yen') && co(r, 'giat') && mot(r, 'ban-dung-yen').ghep === undefined && o(r) === '3,1', ma(r));
  r = chay({}, 'spray("high")\n' + TIEN);
  kiem('không cờ: ban-dung-yen không có trường ghep, giật lùi như cũ', co(r, 'ban-dung-yen') && mot(r, 'ban-dung-yen').ghep === undefined && o(r) === '3,1', ma(r));
  // --- máy đo ghép nhịp: nhịp ghì / phóng / phun khi chạy không có sự kiện "bị bỏ" ---
  const BI_BO = ['ban-dung-yen', 'banh-goi-lai'];
  r = chay(GP, 'spray("high")\n' + TIEN + 'spray_back("high")\n' + TIEN + 'spray()\n' + TIEN);
  kiem('ba nhịp ghép (ghì, phóng, phun khi chạy) đều không có sự kiện bị bỏ', nhips(r).length === 3 && nhips(r).every((n) => !(n.suKien || []).some((e) => BI_BO.includes(e.ma))), ma(r));
  // --- chẩn đoán lời Việt ---
  const man = { ma: 'thu', chuong: 'thu', loaiRobot: 'xich', hamGoc: KHAY, san: HL, batDau: { x: 4, y: 1, huong: 1 }, lucBan: true, ghiXich: true, khung: { chinh: 10, moiHam: 10, cauTruc: [] }, cauTruc: [], moXuong: false, sao: { o: 9, nhip: 9 } };
  let kq = ChamHoc.cham(man, { chinh: ['spray("high")', 'left_move()', 'wait()'], hamCuaMan: [] }, []);
  let cd = kq.chanDoan.find((c) => c.ma === 'ban-dung-yen');
  kiem('chẩn đoán ban-dung-yen màn ghiXich, xe quay: "vòi phải giữ thẳng hướng", "hai xích cùng chạy thẳng"', !!cd && /giữ thẳng hướng/.test(cd.loi) && /hai xích cùng chạy thẳng/.test(cd.loi), cd && cd.loi);
  kq = ChamHoc.cham(man, { chinh: ['spray("low")', 'left_move()', 'right_move()', 'wait()'], hamCuaMan: [] }, []);
  cd = kq.chanDoan.find((c) => c.ma === 'ban-dung-yen');
  kiem('chẩn đoán ban-dung-yen màn ghiXich, phun nhẹ + đi thẳng: nói chỉ phun mạnh mới ghì được', !!cd && /phun mạnh/.test(cd.loi) && /ghì xích/.test(cd.loi), cd && cd.loi);
  kq = ChamHoc.cham(Object.assign({}, man, { batDau: { x: 6, y: 1, huong: 1 } }), { chinh: ['spray_back("high")', 'left_move()', 'right_move()', 'wait()'], hamCuaMan: [] }, []);
  cd = kq.chanDoan.find((c) => c.ma === 'dam-tuong');
  kiem('chẩn đoán phóng vướng: lời đâm tường có câu về cú phóng, "mới đi được một ô"', !!cd && /cú phóng/.test(cd.loi) && /mới đi được một ô/.test(cd.loi), cd && cd.loi);
  kq = ChamHoc.cham(Object.assign({}, man, { ghiXich: undefined }), { chinh: ['spray("high")', 'left_move()', 'wait()'], hamCuaMan: [] }, []);
  cd = kq.chanDoan.find((c) => c.ma === 'ban-dung-yen');
  kiem('chẩn đoán ban-dung-yen màn không cờ: lời cũ y nguyên ("bánh nghỉ")', !!cd && /Nhịp có lệnh phun chỉ phun \(và giật\), bánh nghỉ\./.test(cd.loi) && !/giữ thẳng/.test(cd.loi), cd && cd.loi);
  // --- bộ dò gói 2 biết ghép nhịp + hố (14/11): hành động ghép chỉ có khi màn khai cờ; so chéo ngẫu nhiên với lõi ---
  const dem = (cfg) => Bo.hanhDongChoPhep(Object.assign({}, goc, cfg)).filter((a) => a.ban && a.banh).length;
  kiem('bộ dò: không cờ thì không có hành động ghép; ghiXich thêm 4 (c/h × tiến/lùi); phunKhiChay thêm 4; xe hai bánh không có', dem({}) === 0 && dem(G) === 4 && dem(P) === 4 && dem(GP) === 8 && dem(Object.assign({ loaiRobot: 'banh' }, GP)) === 0);
  const SANS = [['#########', '#u.H...N#', '#.#.##..#', '#...C...#', '#########'], ['########', '#u....N#', '########'], ['#########', '#..H.u..#', '#.N...H.#', '#########']];
  let hat = 7, lech = '', lan = 0;
  const rr = () => { hat ^= hat << 13; hat >>>= 0; hat ^= hat >> 17; hat ^= hat << 5; hat >>>= 0; return hat / 4294967296; };
  for (const san of SANS) for (const cfg of [G, P, Object.assign({ xichDay: true }, GP), {}]) {
    const man = Object.assign({}, goc, { san, batDau: { x: 2, y: 1, huong: 1 }, mucTieu: 'bong-mo', bongMo: { x: 4, y: 1, huong: 1 } }, cfg);
    const ctx = Bo.dungNguCanh(man), HD = Bo.hanhDongChoPhep(man);
    for (let k = 0; k < 300 && !lech; k++) {
      const ch = [];
      let S = Bo.trangThaiDau(ctx);
      for (let j = 1 + Math.floor(rr() * 10); j > 0 && !S.chet; j--) { const a = HD[Math.floor(rr() * HD.length)]; ch.push(a); S = Bo.buocMotNhip(ctx, S, a); }
      const kq = SanHoc.chay(man, Bo.chuoiThanhMa(ch)), roi = kq.suKien.some((e) => e.ma === 'roi-ho');
      const tl = (kq.thung || []).map((q) => q.y * ctx.rong + q.x).sort((a, b) => a - b).join('.'), ts = S.p.slice().sort((a, b) => a - b).join('.');
      lan++;
      if (S.chet !== roi || (!roi && (kq.robot.x !== S.x || kq.robot.y !== S.y || kq.robot.huong !== S.h || tl !== ts))) lech = J(cfg) + ' ' + J(ch);
    }
  }
  kiem('bộ dò gói 2 (ghì, phóng, phun khi chạy, hố) khớp lõi trên ' + lan + ' dãy ngẫu nhiên', !lech, lech);
}

console.log('\nĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

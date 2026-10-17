/* ============================================================================
   kiem-rap-du.mjs — máy kiểm chương `rap-du` (Lắp ráp: Đủ bộ, chương CUỐI) của "Đường học" (KE-HOACH-LAP-RAP.md; thiết kế: docs/thiet-ke/tham-khao-robocon-v0.1.md §5: đánh đổi, không part nào trội). Gồm:
   1. 10 màn rap-du: dữ liệu (thân + tay + não dưới ngân sách xu, cách lắp mẫu), mọi cách mẫu thắng bằng lời giải chạy thật, cachLap[0] ba sao, không cách nào hơn hẳn cách khác ở cả
      giá / nhịp / ô (LapRap.kiemCanMan), chương dùng đủ năm thân, năm tay và năm não, đủ yếu tố sân (hố, rào, gầm, bậc thang, băng chuyền, cửa + nút, thùng nặng, vật, ô màu, pin + ô sạc, nhiều sân);
   2. bộ dò đường do-duong-rap-du.mjs (BFS chạy thật SanHoc.chay): so chéo với các bộ dò viết tay có sẵn (xích, omni, nhện, drone, máy ném, súng hơi, tay kẹp… ) trên sân của chương và
      trên sân ngẫu nhiên; với MỌI cách lắp trong LapRap.dsCachLap của mỗi màn (gom theo vật lý = thân + tay, vì cảm biến không đổi vật lý): không cách nào thắng nhanh hơn sao.nhip
      (chứng minh bằng BFS tới sao.nhip − 1), robot mặc định (cachLap[0]) thắng đúng sao.nhip (màn khai nhipTheoLoiGiai: BFS ≤ sao.nhip), nhịp ngắn nhất của từng cách mẫu ≤ nhịp lời giải mẫu;
   3. LÝ DO MẮT / NHÌN LÀ THẬT: ở màn nhiều sân, đường ngắn nhất của sân đầu (viết cứng, không đọc cảm biến) trượt các sân kia;
   4. lời giải khác đúng 2 sao, lời sai đúng mã, lời giải mẫu chạy giống hệt với kho hàm thật cuối game;
   5. mọi dòng của mọi lời giải mẫu NHẬP ĐƯỢC BẰNG CHẠM (mẫu khối của khay) và vừa khung 10 ô;
   6. nối vào game: chương đứng cuối thu-tu-chuong.js (gói riêng), huy hiệu rap-du, choi.html, kiem-hoc.mjs (require + nhánh nhipTat).
   Bảng cách lắp / BFS: node kiem-rap-du.mjs --bang. Dò đủ mọi cách (chậm, hàng phút): --day-du.
   Chạy: node robotics/hoc/kiem-rap-du.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));
let ManHoc = require(path.join(day, 'man-chuoi-1.js'));
for (const f of fs.readdirSync(day).filter((n) => /^man-.*\.js$/.test(n) && n !== 'man-chuoi-1.js').sort()) ManHoc = require(path.join(day, f));
const DoDuong = await import('./do-duong-rap-du.mjs');
const { nhipNganNhat, nhipCachLap, vatLyCua, cauHinhSan } = DoDuong;
const probe = {
  xich: (await import('./do-duong-xich.mjs')).nhipXichNganNhat, omni: (await import('./do-duong-omni.mjs')).nhipOmniNganNhat,
  nhen: (await import('./do-duong-nhen.mjs')).nhipNhenNganNhat, drone: (await import('./do-duong-drone.mjs')).nhipDroneNganNhat,
  nem: (await import('./do-duong-may-nem.mjs')).nhipMayNemNganNhat, hoi: (await import('./do-duong-sung-hoi.mjs')).nhipSungHoiNganNhat,
  xoay: (await import('./do-duong-tay-xoay.mjs')).nhipTayXoayNganNhat, nc: (await import('./do-duong-nam-cham.mjs')).nhipNamChamNganNhat
};

const BANG = process.argv.includes('--bang'), DAY_DU = process.argv.includes('--day-du');
let dat = 0, hong = 0;
let moc = Date.now();
const gio = (nhan) => { const t = Date.now(); console.log('  [' + nhan + ': ' + ((t - moc) / 1000).toFixed(1) + ' s]'); moc = t; };
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const tatCa = ManHoc.danhSach;
const rd = tatCa.filter((m) => m.chuong === 'rap-du');
const man = (so) => ManHoc.timMa('rap-du.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const VT = ThuTu.thuTu.indexOf('rap-du') + 1;                            // số thứ tự của chương rap-du (không ghi cứng)
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const soSan = (m) => sanCua(m).length;
const tron = (a, b) => { const kq = a.slice(); for (const h of b || []) { const i = kq.findIndex((x) => x.ten === h.ten); if (i >= 0) kq[i] = h; else kq.push(h); } return kq; };
const khoThat = (() => {                                                // kho cuối game (mọi chương trừ rap-du): như người chơi tới chương này
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  for (const m of tatCa) {
    if (m.chuong === 'rap-du' || m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi) { if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo, { taoHam: m.taoHam }); kho.sua(h.ten, h.than); }
  }
  return kho.ds();
})();
const cachKey = (c) => c.than + '|' + (c.tay || '-') + '|' + (c.camBien || '-');
const nhom = (m) => { const g = new Map(); for (const c of LapRap.dsCachLap(m)) { const k = vatLyCua(c); if (!g.has(k)) g.set(k, c); } return g; };   // vật lý → một cách đại diện (rẻ nhất)

/* ======================================================= 1. dữ liệu chương */
console.log('\n== 1. Chương rap-du (chương ' + VT + '): 10 màn lắp ráp ==');
const HANG = ['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum'];
const MUC_TIEU = [undefined, 'dua-vat', undefined, undefined, undefined, 'dua-vat', 'day-thung', 'dua-vat', 'dua-vat', undefined];
kiem('đúng 10 màn, hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm, so 1–10, mã rap-du.<so>', rd.length === 10 && J(rd.map((m) => m.hang)) === J(HANG) && rd.every((m, i) => m.so === i + 1 && m.ma === 'rap-du.' + (i + 1)));
kiem('id hiển thị tính theo vị trí chương (' + VT + '.x), không ghi cứng', rd.every((m) => m.id === VT + '.' + m.so));
kiem('chương CUỐI của game và có gói riêng "Lắp ráp: Đủ bộ"', ThuTu.thuTu[ThuTu.thuTu.length - 1] === 'rap-du' && ThuTu.ten['rap-du'] === 'Lắp ráp: Đủ bộ' &&
  ThuTu.goi.some((g) => g.ma === 'rap-du' && J(g.chuong) === '["rap-du"]' && g.ten === 'Lắp ráp: Đủ bộ') && ThuTu.dot2.includes('rap-du'));
kiem('khung 10 ô chương trình + 10 ô mỗi hàm, Xưởng mở, được dùng hàm của em, cauTruc for / if / while / list, chương trình chính tự viết (maMau rỗng, không khóa)',
  rd.every((m) => m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && J(m.cauTruc) === '["for","if","while","list"]' && J(m.maMau.chinh) === '[]' && !m.chinhCoDinh));
kiem('mục tiêu từng màn: tới cờ · đưa vật · đẩy thùng (7)', rd.every((m, i) => m.mucTieu === MUC_TIEU[i]), J(rd.map((m) => m.mucTieu)));
kiem('mỗi màn có lapRap: ngân sách nguyên ≥ 2 xu, ≥ 2 cách mẫu, danh sách thân / tay / não hợp lệ', rd.every((m) => LapRap.kiemDuLieu(m).length === 0 && m.lapRap.cachLap.length >= 2 && m.lapRap.nganSach >= 2), J(rd.map((m) => LapRap.kiemDuLieu(m)).filter((x) => x.length)));
kiem('trùm (rap-du.10) có huy hiệu rap-du, các màn khác thì không', rd.every((m) => (m.so === 10) === !!m.huyHieu) && man(10).huyHieu.ma === 'rap-du' && /Lắp ráp/.test(man(10).huyHieu.ten));
kiem('sân tối đa 7 cột × 9 hàng, màn nhiều sân thì từng sân; màn nhiều sân (3, 8, 9) có nhipTheo "tong" và batDau song song', rd.every((m) => sanCua(m).every((s) => s.length <= 9 && s.every((h) => h.length <= 7))) &&
  [3, 8, 9].every((so) => { const m = man(so); return Array.isArray(m.san[0]) && m.san.length === 3 && m.nhipTheo === 'tong' && Array.isArray(m.batDau) && m.batDau.length === 3; }) && rd.filter((m) => ![3, 8, 9].includes(m.so)).every((m) => !Array.isArray(m.san[0])));
kiem('đề bài ≤ 3 câu, gợi ý 1–2 câu, ≥ 1 lời sai, có tên ngắn', rd.every((m) => m.deBai.length > 30 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && m.goiY.length >= 1 && m.goiY.length <= 2 && m.loiSai.length >= 1 && m.ten.length >= 3 && m.ten.length <= 24));

// robot mặc định = cachLap[0]
kiem('robot mặc định của màn (loaiRobot, robot, hamGoc) = cách lắp mẫu đầu tiên (ManHoc.chuanHoa điền); màn không tự khai', rd.every((m) => {
  const a = LapRap.apDung(Object.assign({}, m, { robot: undefined, loaiRobot: undefined, hamGoc: undefined, pin: m.pin !== undefined ? m.pin : m.pinDrone }), m.lapRap.cachLap[0]);
  return m.loaiRobot === a.loaiRobot && J(m.robot) === J(a.robot) && J(m.hamGoc) === J(a.hamGoc);
}));
kiem('màn có pin: chỉ drone mang pin (bản mặc định không phải drone cất pin vào pinDrone)', rd.every((m) => (m.loaiRobot === 'drone') ? true : m.pin === undefined) && man(6).pin === 5 && man(10).pin === undefined && man(10).pinDrone === 6);

// kiemCanMan + bảng
const TK = {};
for (const m of rd) {
  const loi = LapRap.kiemCanMan(m);
  kiem(m.id + ' ' + m.ten + ': LapRap.kiemCanMan rỗng (dữ liệu, mọi cách mẫu thắng, cachLap[0] 3 sao, không cách nào hơn hẳn cách khác)', loi.length === 0, loi.join(' | '));
  const tk = LapRap.thongKeMau(m);
  TK[m.ma] = tk;
  kiem(m.id + ': ' + tk.length + ' cách mẫu (' + tk.map((x) => x.ten + ' ' + x.gia + ' xu').join(' · ') + '), mọi cách trong ngân sách ' + m.lapRap.nganSach, tk.length >= 2 && tk.every((x) => x.thang && x.gia <= m.lapRap.nganSach && x.sao >= 1) && tk[0].sao === 3 && tk[0].nhip === m.sao.nhip && tk[0].o === m.sao.o,
    J(tk.map((x) => [x.ten, x.gia, x.nhip, x.o, x.sao])));
  kiem(m.id + ': đánh đổi thật — cách rẻ hơn thì chậm hơn hoặc dài hơn (từng cặp: cách đắt hơn phải nhanh hơn hay ngắn hơn)',
    tk.every((a, i) => tk.every((b, j) => i === j || a.gia >= b.gia || b.nhip < a.nhip || b.o < a.o)), J(tk.map((x) => [x.gia, x.nhip, x.o])));
}
const TENMA = (khe) => new Set(rd.flatMap((m) => m.lapRap[khe] || []));
kiem('các màn cho phép đủ năm thân, năm tay, năm não: hai-banh · xich · omni · nhen · drone / kep · xoay · nam-cham · nem · hoi / khoang-cach · mau · camera · tu · camera-bay',
  LapRap.DANH_MUC.than.every((d) => TENMA('than').has(d.ma)) && LapRap.DANH_MUC.tay.every((d) => TENMA('tay').has(d.ma)) && LapRap.DANH_MUC.camBien.every((d) => TENMA('camBien').has(d.ma)),
  J({ than: [...TENMA('than')], tay: [...TENMA('tay')], camBien: [...TENMA('camBien')] }));
const mauThan = new Set(rd.flatMap((m) => m.lapRap.cachLap.map((c) => c.than))), mauTay = new Set(rd.flatMap((m) => m.lapRap.cachLap.map((c) => c.tay).filter(Boolean))), mauCam = new Set(rd.flatMap((m) => m.lapRap.cachLap.map((c) => c.camBien).filter(Boolean)));
kiem('cách lắp MẪU dùng đủ năm thân, năm tay (kẹp, xoay, nam châm, ném, súng hơi) và ba loại não (khoảng cách, camera, từ)', mauThan.size === 5 && mauTay.size === 5 && ['khoang-cach', 'camera', 'tu'].every((x) => mauCam.has(x)), J([[...mauThan], [...mauTay], [...mauCam]]));
const kyHieu = new Set(rd.flatMap((m) => sanCua(m).join('').split('')));
kiem('sân dùng: hố u, rào =, gầm n, bậc thang S, băng chuyền <, cửa C + nút N, thùng nặng H, ô đích D, vật o, ô sạc P, cờ F, tường #', 'u=nS<CNHDoPF#'.split('').every((c) => kyHieu.has(c)), 'u=nS<CNHDoPF#'.split('').filter((c) => !kyHieu.has(c)).join(''));
kiem('sân có lớp màu sàn + màu vật (8), chất vật nam châm N / S (9), pin (6 và trùm), mục tiêu day-thung (7), 3 màn nhiều sân', man(8).mau && man(8).vatMau && man(9).vatChat.flat().join('').includes('N') && man(9).vatChat.flat().join('').includes('S') && man(6).vatChat && man(6).pin === 5 && man(10).pinDrone === 6 && man(7).mucTieu === 'day-thung');

gio('mục 1');
/* ===================================================== 2. bộ dò đường tắt (BFS) */
console.log('\n== 2. Bộ dò do-duong-rap-du.mjs: so chéo với các bộ dò viết tay, rồi chứng minh không có đường tắt cho MỌI cách lắp ==');
// 2a. so chéo trên sân của chương: bộ dò viết tay tương ứng (chỉ so khi bộ dò đó hiểu mọi ký hiệu của sân và có đủ bộ lệnh bánh của robot)
const con = (m, i) => { if (!Array.isArray(m.san[0])) return m; const lm = SanHoc.lopMauCuaSan(m, i); return Object.assign({}, m, { san: m.san[i], batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vatThem: lm.vatThem, pin: Array.isArray(m.pin) ? m.pin[i] : m.pin }); };
const probeCua = (th, ta) => {
  if (ta === null && th !== 'hai-banh') return probe[{ xich: 'xich', omni: 'omni', nhen: 'nhen', drone: 'drone' }[th]];
  if (ta === 'kep' && ['xich', 'omni', 'nhen'].includes(th)) return probe[th === 'xich' ? 'xich' : th === 'omni' ? 'omni' : 'nhen'];
  if (ta === 'nem' && th === 'hai-banh') return probe.nem;
  if (ta === 'hoi' && th === 'hai-banh') return probe.hoi;
  if (ta === 'xoay') return probe.xoay;
  if (ta === 'nam-cham' && th === 'drone') return probe.drone;
  return null;
};
{
  let soSo = 0, khac = [], boQua = [];
  for (const m of rd) for (const [k, c] of nhom(m)) {
    const [th, ta] = k.split('|'), f = probeCua(th, ta === '-' ? null : ta);
    if (!f) continue;
    const a = LapRap.apDung(m, c);
    for (let i = 0; i < soSan(m); i++) {
      let t;
      try { const x = f(con(a, i), {}); t = x && typeof x === 'object' ? x.nhip : x; } catch (e) { boQua.push(m.ma + ' ' + k + ': ' + e.message.slice(0, 40)); continue; }
      const r = nhipNganNhat(a, i, { toiDaNhip: 40, toiDaGiay: 6, toiDaTrangThai: 2500 });
      if (r.catNgang) { boQua.push(m.ma + ' ' + k + ' cắt'); continue; }
      soSo++;
      if (t !== r.nhip) khac.push(m.ma + ' ' + k + ' sân ' + i + ': do-duong-rap-du ' + r.nhip + ' · bộ dò viết tay ' + t);
    }
  }
  kiem('so chéo ' + soSo + ' phép dò (thân × tay × sân của chương) với bộ dò viết tay của xích / omni / nhện / drone / máy ném / súng hơi / tay xoay: nhịp ngắn nhất trùng nhau', khac.length === 0 && soSo >= 25, khac.slice(0, 4).join(' | ') + ' [so ' + soSo + ']');
  console.log('  (bộ dò viết tay bỏ qua vì không hiểu sân: ' + boQua.length + ' phép, vd ' + boQua.slice(0, 3).join('; ') + ')');
}
gio('2a so chéo trên sân chương');
// 2b. sân ngẫu nhiên (hạt giống cố định) cho xích / omni / nhện / drone (có pin, băng chuyền, hố, gầm, rào, bậc thang)
{
  let seed = 20261017; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const SYM = { xich: '....##=S>><^v', omni: '....##=>><^vS', nhen: '....##=Su>><nn^v', drone: '....##=S>><^vP' };
  let khop = 0, lech = [];
  for (let t = 0; t < 50; t++) {
    const than = pick(['xich', 'omni', 'nhen', 'drone']), rows = [];
    for (let y = 0; y < 4; y++) { let r = ''; for (let x = 0; x < 6; x++) r += pick(SYM[than]); rows.push(r); }
    const bx = Math.floor(rnd() * 6), by = Math.floor(rnd() * 4), fx = Math.floor(rnd() * 6), fy = Math.floor(rnd() * 4), hu = Math.floor(rnd() * 4);
    if (bx === fx && by === fy) continue;
    const dat1 = (x, y, c) => { rows[y] = rows[y].slice(0, x) + c + rows[y].slice(x + 1); };
    dat1(bx, by, '.'); dat1(fx, fy, 'F');
    const m = { ma: 'ngau-nhien', san: rows, batDau: { x: bx, y: by, huong: than === 'nhen' || than === 'drone' ? 0 : hu }, pin: than === 'drone' && rnd() < 0.5 ? 3 + Math.floor(rnd() * 8) : undefined,
      lapRap: { than: [than], tay: [], camBien: [], nganSach: 9, cachLap: [] } };
    const a = LapRap.apDung(m, { than });
    const r = nhipNganNhat(a, 0, { toiDaNhip: 30, toiDaGiay: 10 });
    if (r.catNgang) continue;
    const x = probe[than](a, {}), th = x && typeof x === 'object' ? x.nhip : x;
    if (th === r.nhip) khop++; else lech.push(than + ' ' + J(rows) + ' bd ' + J(a.batDau) + ' pin ' + a.pin + ': ' + r.nhip + ' ≠ ' + th);
  }
  kiem('so chéo ' + khop + ' sân ngẫu nhiên (xích, omni, nhện, drone; tường, rào, bậc thang, hố, gầm, băng chuyền, ô sạc, pin hay vô hạn): nhịp ngắn nhất bằng bộ dò viết tay', lech.length === 0 && khop >= 40, lech.slice(0, 3).join(' | '));
}
gio('2b sân ngẫu nhiên');
// 2c. tự kiểm bộ dò: sân có đường tắt thì bắt được; đường dò được đổi thành chương trình chạy SanHoc.chay thắng đúng nhịp
{
  const sanNho = { ma: 'nho', san: ['.....', '...F.', '.#S#.', '.....', '.....'], batDau: { x: 2, y: 4, huong: 0 }, lapRap: { than: ['hai-banh', 'xich', 'nhen', 'drone'], tay: [], camBien: [], nganSach: 9, cachLap: [] } };
  const r = (th) => nhipCachLap(sanNho, { than: th }).nhip;
  kiem('bộ dò: bậc thang S giữa tường — xích leo thẳng qua bậc (' + r('xich') + '), hai bánh phải vòng (' + r('hai-banh') + '), drone bay qua (' + r('drone') + '), nhện (' + r('nhen') + ')', r('drone') === 4 && r('xich') < r('hai-banh') && r('nhen') <= r('hai-banh') + 2, J(['xich', 'hai-banh', 'drone', 'nhen'].map(r)));
}
gio('2c tự kiểm + đổi mã');
// 2d. không có đường tắt: MỌI cách lắp (gom theo thân + tay)
const BFS = {};                                                          // BFS[ma][vật lý] = { nhip (tổng theo nhipTheo) | null, cat }
function nhipPair(m, cach, capTong, giay) {
  const a = LapRap.apDung(m, cach), n = soSan(m), tong = m.nhipTheo === 'tong';
  const capSan = tong ? capTong - (n - 1) : capTong;
  if (capSan < 1) return { nhip: null, cat: false };
  const ds = [], chuoi = [];
  for (let i = 0; i < n; i++) {
    const r = nhipNganNhat(a, i, { toiDaNhip: capSan, toiDaGiay: giay || 40, toiDaTrangThai: 400000 });
    if (r.catNgang) return { nhip: null, cat: true };
    if (r.nhip === null) return { nhip: null, cat: false };                // > capSan ở sân này → tổng > capTong
    ds.push(r.nhip); chuoi.push(r.chuoi);
  }
  const nh = tong ? ds.reduce((x, y) => x + y, 0) : Math.max(...ds);
  return { nhip: nh > capTong ? null : nh, cat: false, ds, chuoi, a };                   // từng sân trong tầm nhưng tổng vượt capTong → vẫn là "quá capTong"

}
for (const m of rd) {
  const g = nhom(m), c0 = vatLyCua(m.lapRap.cachLap[0]), tk = TK[m.ma];
  const t0 = Date.now(), kq = {};
  kq[c0] = nhipPair(m, g.get(c0), m.sao.nhip);
  const ref = kq[c0].nhip === null ? m.sao.nhip : kq[c0].nhip;                // đường ngắn nhất của robot mặc định (= sao.nhip, hoặc nhỏ hơn ở màn nhipTheoLoiGiai)
  for (const [k, c] of g) if (k !== c0) kq[k] = nhipPair(m, c, ref - 1);
  BFS[m.ma] = kq;
  const cat = Object.entries(kq).filter(([, v]) => v.cat).map(([k]) => k);
  const loiTat = Object.entries(kq).filter(([k, v]) => k !== c0 && v.nhip !== null).map(([k, v]) => k + '=' + v.nhip);
  kiem(m.id + ' ' + m.ten + ': ' + g.size + ' loại vật lý (' + [...g.keys()].join(', ') + '); KHÔNG loại nào thắng nhanh hơn robot mặc định (' + ref + ' nhịp' + (m.nhipTheoLoiGiai === true ? ', sao.nhip ' + m.sao.nhip + ' theo lời giải mẫu' : '') + ')',
    loiTat.length === 0 && cat.length === 0, 'có đường tắt: ' + loiTat.join(', ') + (cat.length ? ' · bị cắt: ' + cat.join(', ') : ''));
  // đường ngắn nhất tìm được ở từng sân đổi thành mã Python chạy SanHoc.chay: thắng đúng nhịp BFS (so chéo bộ dò với lõi)
  const loiMa = [];
  for (const [k, v] of Object.entries(kq)) if (v.nhip !== null) v.chuoi.forEach((code, i) => { const r = SanHoc.chay(cauHinhSan(v.a, i), code); if (!r.thang || r.nhip !== v.ds[i]) loiMa.push(k + ' sân ' + i + ': ' + J([r.thang, r.nhip, v.ds[i]])); });
  kiem(m.id + ': đường BFS của từng loại vật lý (tới ' + ref + ' nhịp) đổi thành mã Python chạy SanHoc.chay: thắng đúng nhịp BFS', loiMa.length === 0, loiMa.slice(0, 3).join(' | '));
  kiem(m.id + ': robot mặc định (' + c0 + ') BFS ' + (m.nhipTheoLoiGiai === true ? '≤' : '=') + ' sao.nhip ' + m.sao.nhip + ' (ngắn nhất ' + kq[c0].nhip + ') — ' + (Date.now() - t0) + ' ms cho cả màn',
    kq[c0].nhip !== null && (m.nhipTheoLoiGiai === true ? kq[c0].nhip <= m.sao.nhip : kq[c0].nhip === m.sao.nhip), J(kq[c0]));
}
gio('2d chứng minh không đường tắt');
// 2e. nhịp ngắn nhất của từng cách mẫu không dài hơn nhịp lời giải mẫu (và bằng khi lời giải đã tối ưu); ghi lại
const BFS_MAU = {};
{
  const dai = [];
  for (const m of rd) for (const t of TK[m.ma]) {
    const r = nhipPair(m, t.cach, t.nhip, 12);
    BFS_MAU[m.ma + '|' + cachKey(t.cach)] = r.cat ? 'cắt (chậm)' : r.nhip;
    if (r.cat) continue;
    if (r.nhip === null || r.nhip > t.nhip) dai.push(m.ma + ' ' + t.ten + ': BFS ' + r.nhip + ' > lời giải ' + t.nhip);
  }
  kiem('mỗi cách lắp mẫu: nhịp ngắn nhất (BFS) ≤ nhịp lời giải mẫu — lời giải không thể nhanh hơn đường ngắn nhất', dai.length === 0, dai.join(' | '));
}
gio('2e BFS từng cách mẫu');
if (DAY_DU) {
  console.log('  (--day-du) nhịp ngắn nhất của MỌI cách trong dsCachLap, tối đa 40 nhịp:');
  for (const m of rd) {
    const lines = [];
    for (const [k, c] of nhom(m)) { const t = Date.now(); const r = nhipPair(m, c, 40, 60); lines.push(k + '=' + (r.cat ? 'cắt' : r.nhip === null ? '>40/không' : r.nhip) + ' (' + (Date.now() - t) + 'ms)'); }
    console.log('   ' + m.ma + ': ' + lines.join(' · '));
  }
}

gio('mục 2 còn lại');
/* ====================================================== 3. lý do mắt là thật */
console.log('\n== 3. Màn nhiều sân: chương trình viết cứng theo một sân thì trượt sân khác (cảm biến có giá trị thật) ==');
for (const so of [3, 8, 9]) {
  const m = man(so), a = LapRap.apDung(m, m.lapRap.cachLap[0]);
  const r0 = nhipNganNhat(a, 0, { toiDaNhip: 20, toiDaGiay: 20 });
  const thang = [0, 1, 2].map((i) => SanHoc.chay(cauHinhSan(a, i), r0.chuoi).thang);
  kiem(m.id + ': đường ngắn nhất của sân đầu (' + r0.nhip + ' nhịp, không đọc cảm biến) thắng sân 1 nhưng trượt ít nhất một sân khác', thang[0] === true && thang.some((t) => !t), J(thang));
  const gioi = a.hamGoc.filter((h) => ['front_clear', 'right_clear', 'left_clear', 'color', 'front_pole', 'front_metal'].includes(h));
  kiem(m.id + ': robot mặc định có cảm biến đọc được thứ cần đọc (' + (gioi.join(', ') || 'không') + ')', gioi.length > 0);
}
{
  const m = man(3);
  kiem('rap-du.3: nhện KHÔNG cần mắt vì nhảy qua rào ở hàng không có lối (cùng chương trình thắng cả ba sân), hai bánh không mắt thì không thể', LapRap.thongKeMau(m).filter((t) => t.cach.than === 'nhen').every((t) => t.thang) &&
    m.lapRap.cachLap.some((c) => c.than === 'nhen' && !c.camBien));
}

/* ============================================ 4. lời giải khác · lời sai · kho thật */
console.log('\n== 4. Lời giải khác, lời sai, lời giải mẫu với kho hàm thật ==');
for (const m of rd) {
  const lk = m.loiGiaiKhac, rk = ChamHoc.cham(m, lk.baiLam, tron(khoThat, lk.hamCuaEmMoi));
  kiem(m.id + ': loiGiaiKhac (' + lk.moTa + ') thắng, nhiều ô hơn, cùng nhịp, đúng 2 sao', rk.thang && rk.sao === 2 && rk.soO > m.sao.o && rk.soNhip === m.sao.nhip, J([rk.thang, rk.sao, rk.soO, rk.soNhip]));
  const xau = [];
  m.loiSai.forEach((ls, i) => {
    const r = ChamHoc.cham(m, ls.baiLam, tron(khoThat, ls.hamCuaEmMoi)), co = maCua(r), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
    if (r.sao >= 3 || thieu.length) xau.push('#' + (i + 1) + ' sao ' + r.sao + ' thiếu ' + thieu.join() + ' có ' + co.join());
  });
  kiem(m.id + ': ' + m.loiSai.length + ' lời sai không đủ 3 sao và đủ mã chẩn đoán (' + m.loiSai.map((l) => l.phaiCoMa.join('+')).join(' · ') + ')', xau.length === 0 && m.loiSai.every((l) => l.phaiCoMa.length > 0), xau.join(' | '));
  const xl = [];
  for (const cl of m.lapRap.cachLap) {
    const a = LapRap.apDung(m, cl), lg = a.loiGiai;
    const r = ChamHoc.cham(a, { chinh: lg.chinh.slice(), hamCuaMan: lg.hamCuaMan || [] }, tron(khoThat, lg.hamCuaEmMoi));
    const t = TK[m.ma].find((x) => cachKey(x.cach) === cachKey(cl));
    if (!r.thang || r.soNhip !== t.nhip || r.soO !== t.o || maLoi(r).length) xau.push(cachKey(cl));
    if (r.chanDoan.length) xl.push(cachKey(cl) + ':' + maCua(r).join());
  }
  kiem(m.id + ': mọi lời giải mẫu chạy giống hệt với kho hàm thật cuối game (thắng, cùng nhịp, cùng ô) và không chẩn đoán nào', xau.length === 0 && xl.length === 0, xau.join(' ') + ' ' + xl.join(' '));
}
function maLoi(kq) { return kq.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma); }

/* ---- lời giải TỰ NHIÊN dùng hàm kho (luật điều phối 17/10): sao.o = max(ô lời giải dùng hàm, ô lời giải viết thuần lệnh gốc); cả hai đều đạt 3 sao */
for (const m of rd) {
  const c0 = m.lapRap.cachLap[0], a = LapRap.apDung(m, c0), phu = c0.loiGiaiPhu;
  const chay = (lg, kho) => ChamHoc.cham(a, { chinh: lg.chinh.slice(), hamCuaMan: lg.hamCuaMan || [] }, kho);
  const goi = [...new Set(c0.loiGiai.chinh.join('\n').replace(/#.*$/gm, '').match(/[a-z_]\w*(?=\()/g) || [])].filter((t) => khoThat.some((h) => h.ten === t));
  kiem(m.id + ': màn khai lapRap.dungKho, lời giải của cách mặc định (' + c0.than + ') gọi hàm của em có sẵn trong kho (' + goi.join(', ') + ') và không khai / sửa hàm nào (hamCuaEmMoi rỗng, taoHam rỗng)',
    m.lapRap.dungKho === true && goi.length > 0 && !(c0.loiGiai.hamCuaEmMoi || []).length && m.taoHam.length === 0, J({ dungKho: m.lapRap.dungKho, goi, moi: (c0.loiGiai.hamCuaEmMoi || []).length }));
  const r1 = chay(c0.loiGiai, khoThat);
  kiem(m.id + ': cùng lời giải ấy chạy với CHỈ kho thật (không khai lại): thắng ' + r1.soNhip + ' nhịp, ' + r1.soO + ' ô, ' + r1.sao + ' sao — đúng sao.nhip ' + m.sao.nhip + ' và sao.o ' + m.sao.o, r1.thang && r1.sao === 3 && r1.soO === m.sao.o && r1.soNhip === m.sao.nhip && r1.chanDoan.length === 0, J({ t: r1.thang, o: r1.soO, n: r1.soNhip, cd: maCua(r1) }));
  if (phu) {
    const r2 = chay(phu, tron(khoThat, phu.hamCuaEmMoi));
    kiem(m.id + ': lời giải còn lại (' + phu.moTa + ') cũng 3 sao: ' + r2.soO + ' ô, ' + r2.soNhip + ' nhịp; sao.o = max(' + r1.soO + ', ' + r2.soO + ') = ' + m.sao.o, r2.thang && r2.sao === 3 && r2.soO <= m.sao.o && (m.nhipTheoLoiGiai === true ? r2.soNhip <= m.sao.nhip : r2.soNhip === m.sao.nhip) && m.sao.o === Math.max(r1.soO, r2.soO), J({ t: r2.thang, s: r2.sao, o: r2.soO, n: r2.soNhip }));
  } else kiem(m.id + ': một lời giải duy nhất (đã dùng hàm kho, không có cách viết ngắn hơn) nên sao.o = ' + m.sao.o + ' = ô của nó', m.sao.o === r1.soO);
}

/* ============================================ 5. nhập được bằng chạm + khung */
console.log('\n== 5. Mọi dòng lời giải mẫu dựng được từ khối khay; vừa khung ==');
{
  const MAU = '(?:red|green|blue|yellow|none)';
  function chamDuoc(dong, hamGoc, tenHam) {
    const s = dong.trim();
    if (!s || /^#/.test(s)) return true;
    let mt;
    if ((mt = /^([a-z_]+)\(([1-9]?|"[URDL]+")\)$/.exec(s)) && !/^(range|len)$/.test(mt[1])) return hamGoc.includes(mt[1]) || tenHam.includes(mt[1]);
    if (/^for i in range\([1-9]\):$/.test(s)) return true;
    if (/^(?:while|if|elif) (?:not )?(?:front_clear|left_clear|right_clear)\(\):$/.test(s)) return hamGoc.includes(s.match(/(front_clear|left_clear|right_clear)/)[1]);
    if (/^(?:if|elif) front_pole\(\) == "(?:N|S)":$/.test(s)) return hamGoc.includes('front_pole');
    if (/^(?:if|elif) c == "(?:red|green|blue|yellow|none)":$/.test(s)) return true;
    if (/^c = color\(\)$/.test(s)) return hamGoc.includes('color');
    if (/^else:$/.test(s)) return true;
    return false;
  }
  for (const m of rd) {
    const xau = [];
    const cacBai = m.lapRap.cachLap.map((cl) => ({ cl, lg: LapRap.apDung(m, cl).loiGiai, a: LapRap.apDung(m, cl) })).concat(m.lapRap.cachLap[0].loiGiaiPhu ? [{ cl: m.lapRap.cachLap[0], lg: m.lapRap.cachLap[0].loiGiaiPhu, a: LapRap.apDung(m, m.lapRap.cachLap[0]) }] : []);
    for (const { cl, lg, a } of cacBai) {
      const ten = (lg.hamCuaEmMoi || []).map((h) => h.ten).concat(khoThat.map((h) => h.ten));
      for (const d of lg.chinh) if (!chamDuoc(d, a.hamGoc, ten)) xau.push(cachKey(cl) + ': ' + d.trim());
      const kt = KhungCode.kiemTra(m.khung, { chinh: lg.chinh, hamCuaMan: [] }, a.hamGoc, tron(khoThat, lg.hamCuaEmMoi));
      if (kt.length) xau.push(cachKey(cl) + ' khung: ' + J(kt.map((e) => e.ma)));
    }
    kiem(m.id + ': ' + cacBai.length + ' lời giải mẫu — mọi dòng chương trình chính là khối khay (lệnh part, for range 1–9, while / if cảm biến, c = color(), else, hàm của em) và không lỗi khung', xau.length === 0, xau.join(' | '));
  }
  // chẩn đoán khi tháo part: chương trình còn gọi lệnh của part đã bỏ thì lenhKhongCon chỉ ra đúng dòng
  const lk = LapRap.lenhKhongCon(LapRap.apDung(man(4), { than: 'hai-banh' }), ['shoot()', 'wait()', 'turn_right()']);
  kiem('Lắp lại: đổi Hai bánh + Súng hơi thành Hai bánh thì dòng shoot() bị tô đỏ (lenhKhongCon)', J([...lk]) === '[0]' && lk.ten.includes('shoot'));
}

/* ==================================================== 6. nối vào game */
console.log('\n== 6. Gói, huy hiệu, choi.html, kiem-hoc.mjs ==');
{
  const doc = (f) => fs.readFileSync(path.join(day, f), 'utf8');
  const html = doc('game/choi.html'), huy = doc('game/huy-hieu.js'), kh = doc('kiem-hoc.mjs');
  kiem('choi.html nạp man-rap-du.js sau man-flycam.js (chương cuối)', /src="\.\.\/man-rap-du\.js"/.test(html) && html.indexOf('man-rap-du.js') > html.indexOf('man-flycam.js'));
  kiem("huy hiệu HINH['rap-du'] có trong game/huy-hieu.js và ManHoc.chuong() gồm rap-du", /HINH\['rap-du'\]\s*=/.test(huy) && ManHoc.chuong().some((c) => c.ma === 'rap-du' && c.soMan === 10 && c.so === VT));
  kiem('kiem-hoc.mjs: require man-rap-du.js, nhánh nhipTat cho rap-du (do-duong-rap-du.mjs), cauTruc rap-du, camera rap-du.8', /require\(path\.join\(day, 'man-rap-du\.js'\)\)/.test(kh) && /nhipRapDuTatCa/.test(kh) && /m\.chuong === 'rap-du' \? nhipRapDuTatCa/.test(kh) && /m\.chuong === 'rap-du'/.test(kh) && /'rap-du\.8'/.test(kh));
}

/* ==================================================== bảng tóm tắt */
if (BANG) {
  console.log('\n== Bảng cách lắp mẫu ==');
  for (const m of rd) {
    console.log(m.id + ' ' + m.ten + ' [ngân sách ' + m.lapRap.nganSach + ' xu · sao nhịp ' + m.sao.nhip + ' ô ' + m.sao.o + ']');
    for (const t of TK[m.ma]) console.log('   ' + t.ten.padEnd(34) + String(t.gia).padStart(2) + ' xu  nhịp ' + String(t.nhip).padStart(3) + '  ô ' + String(t.o).padStart(3) + '  ' + t.sao + ' sao  BFS ' + BFS_MAU[m.ma + '|' + cachKey(t.cach)]);
    console.log('   BFS từng loại vật lý (tới ' + (m.sao.nhip - 1) + ' nhịp, ' + (BFS[m.ma] ? Object.entries(BFS[m.ma]).map(([k, v]) => k + '=' + (v.nhip === null ? '>' + (m.sao.nhip - 1) : v.nhip)).join(' · ') : '') + ')');
  }
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);

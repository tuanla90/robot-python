/* ============================================================================
   kiem-goi-doi.mjs — LUẬT CHUNG cho mọi gói đội hai robot (man-doi-*.js khai ManHoc.chuongThem; hoc/KE-HOACH-PHOI-HOP.md §3).
   Gói mới chỉ cần khai báo đúng là tự được kiểm ở đây; máy kiểm riêng của gói (kiem-doi-<gói>.mjs) kiểm phần đặc thù.
   - Vị trí: các chương của gói nằm ngay sau chương `sau` (cuối gói part), gói nằm ngay sau gói part; ngưỡng sao không thấp hơn gói part.
   - Mỗi chương: 10 màn, hàng 3 · 3 · 3 · 1, 10 màn khác nhau (sân + lời giải), tên khác nhau, màn 1–9 một sân, trùm ba sân và có huy hiệu.
   - Mỗi màn: ≥ 2 robot; lời giải thắng 3 sao, ngưỡng sao (khối SAO của tệp gói) khớp đúng ô / nhịp lời giải; mẫu chưa thắng;
     robot khóa (doi[i].coDinh) giữ nguyên chương trình mẫu và vẫn còn robot cho người chơi viết; hàm cần đã học trước màn;
     CẦN CẢ ĐỘI: bỏ chương trình của một robot (robot đó có việc trong lời giải) thì không thắng, trừ màn khai choPhepMotRobot.
   - Lõi: cờ riêng của từng robot (doi[i].co) chỉ tính khi đúng chủ.
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const M = require(path.join(day, 'lo-trinh-hoc.js'));
const TT = require(path.join(day, 'thu-tu-chuong.js'));
const Cham = require(path.join(day, 'cham.js'));
const SanHoc = require(path.join(day, 'san-hoc.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const clone = (x) => JSON.parse(JSON.stringify(x));
const soSan = (m) => (Array.isArray(m.san[0]) ? m.san.length : 1);

// kho hàm người chơi có trước mỗi màn (đi tuần tự lộ trình xuất bản)
const kho = new Map(), khoTruoc = new Map();
for (const m of M.danhSach) {
  khoTruoc.set(m.ma, clone([...kho.values()]));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}
function cham(m, bai) {
  const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, h]));
  for (const h of (m.loiGiai.hamCuaEmMoi || [])) hs.set(h.ten, clone(h));
  return Cham.cham(m, { chinh: [], hamCuaMan: bai.hamCuaMan || m.loiGiai.hamCuaMan || [], doi: bai.doi }, [...hs.values()]);
}

const goiDoi = (M.chuongThem || []).map((c) => Object.assign({}, c, { coMan: c.chuong.map((x) => x.ma).filter((k) => M.danhSach.some((m) => m.chuong === k)) }))
  .filter((c) => c.coMan.length);
kiem('có ít nhất hai gói đội đã khai báo', goiDoi.length >= 2, goiDoi.map((c) => c.goi.ma).join(', '));

for (const c of goiDoi) {
  console.log('\n— gói ' + c.goi.ma + ' (' + c.coMan.join(', ') + ')');
  const vt = TT.thuTu.indexOf(c.sau);
  kiem(c.goi.ma + ': chương nằm ngay sau ' + c.sau, J(TT.thuTu.slice(vt + 1, vt + 1 + c.coMan.length)) === J(c.coMan));
  const gi = TT.goi.findIndex((g) => g.ma === c.goi.ma);
  kiem(c.goi.ma + ': gói nằm ngay sau gói part, ngưỡng sao không thấp hơn', gi > 0 && TT.goi[gi - 1].chuong.includes(c.sau) && TT.goi[gi].sao >= TT.goi[gi - 1].sao && TT.goi[gi].khongTangNguong === true,
    gi > 0 ? TT.goi[gi - 1].ma + ' ' + TT.goi[gi - 1].sao + ' → ' + TT.goi[gi].sao : 'không thấy gói');
  for (const ch of c.coMan) {
    const ds = M.danhSach.filter((m) => m.chuong === ch);
    kiem(ch + ': 10 màn, hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm', ds.length === 10 && J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']));
    kiem(ch + ': 10 màn khác nhau và tên khác nhau', new Set(ds.map((m) => J([m.san, m.loiGiai]))).size === 10 && new Set(ds.map((m) => m.ten)).size === 10);
    kiem(ch + ': màn 1–9 một sân, trùm ba sân; chỉ trùm có huy hiệu', ds.every((m) => soSan(m) === (m.so === 10 ? 3 : 1) && !!m.huyHieu === (m.so === 10)), ds.map((m) => soSan(m)).join(''));
    for (const m of ds) {
      const ten = m.ma + ' ' + m.ten;
      if (!(Array.isArray(m.doi) && m.doi.length >= 2 && m.maMau.doi && m.maMau.doi.length === m.doi.length && m.loiGiai.doi.length === m.doi.length)) { kiem(ten + ': dữ liệu nhiều robot', false); continue; }
      const thieu = (m.hamCuaEmCan || []).filter((h) => !khoTruoc.get(m.ma).some((x) => x.ten === h) && !(m.loiGiai.hamCuaEmMoi || []).some((x) => x.ten === h));
      kiem(ten + ': hàm cần đã học trước màn', !thieu.length, thieu.join(', '));
      const r = cham(m, m.loiGiai);
      kiem(ten + ': lời giải thắng 3 sao, ngưỡng khớp ô / nhịp', r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip,
        r.thang ? 'sao ' + r.sao + ', ô ' + r.soO + '/' + m.sao.o + ', nhịp ' + r.soNhip + '/' + m.sao.nhip + ' (chạy tools/do-goi-doi.mjs --ghi)' : J(r.chanDoan).slice(0, 200));
      kiem(ten + ': mẫu chưa thắng sẵn', !cham(m, m.maMau).thang);
      const khoa = m.doi.map((d) => !!d.coDinh);
      kiem(ten + ': robot khóa giữ nguyên chương trình mẫu, còn robot cho em viết', khoa.some((k) => !k) && khoa.every((k, i) => !k || J(m.loiGiai.doi[i].chinh) === J(m.maMau.doi[i].chinh)));
      if (!m.choPhepMotRobot) {
        const boDuoc = m.loiGiai.doi.map((d, i) => i).filter((i) => m.loiGiai.doi[i].chinh.length && cham(m, { doi: m.loiGiai.doi.map((d, j) => ({ chinh: j === i ? [] : d.chinh })), hamCuaMan: m.loiGiai.hamCuaMan }).thang);
        kiem(ten + ': cần cả đội (bỏ một robot thì không thắng)', !boDuoc.length, boDuoc.map((i) => 'R' + (i + 1)).join(', '));
      }
    }
  }
}

console.log('\n— lõi: cờ riêng của từng robot');
{
  const cfg = { san: ['#####', '#F.F#', '#...#', '#####'], mucTieu: 'toi-co', doi: [{ batDau: { x: 2, y: 1, huong: 3 }, loaiRobot: 'banh', co: [{ x: 3, y: 1 }] }, { batDau: { x: 2, y: 2, huong: 1 }, loaiRobot: 'banh', co: [{ x: 1, y: 1 }] }] };
  const tien = 'left_move()\nright_move()\nwait()';
  const r = SanHoc.chay(cfg, [tien, '']);
  kiem('R1 tới cờ riêng của R2 thì chưa tính tới cờ', !r.doi[0].toiCo && !r.thang);
  const r2 = SanHoc.chay(Object.assign({}, cfg, { doi: [Object.assign({}, cfg.doi[0], { batDau: { x: 2, y: 1, huong: 1 } }), cfg.doi[1]] }), [tien, 'turn = 0']);
  kiem('R1 tới đúng cờ của mình thì tính', r2.doi[0].toiCo === true);
  let loi = null; try { SanHoc.chay(Object.assign({}, cfg, { doi: [Object.assign({}, cfg.doi[0], { co: [{ x: 2, y: 2 }] }), cfg.doi[1]] }), ['', '']); } catch (e) { loi = e.message; }
  kiem('cờ riêng phải là ô F', /không phải ô cờ F/.test(loi || ''), loi);
  kiem('coCuaSan: một sân, nhiều sân', J(SanHoc.coCuaSan([{ x: 1, y: 1 }], 2, true)) === J([{ x: 1, y: 1 }]) && J(SanHoc.coCuaSan([[{ x: 1, y: 1 }], [{ x: 2, y: 2 }]], 1, true)) === J([{ x: 2, y: 2 }]));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

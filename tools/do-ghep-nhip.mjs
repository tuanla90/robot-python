// Đo "ghép nhịp" theo mùa (KE-HOACH-GHEP-NHIP.md): chạy lời giải từng màn theo lộ trình, gom các lệnh gốc nằm giữa hai mốc nhịp,
// đếm nhịp có từ 2 BỘ PHẬN trở lên cùng chạy. Tách riêng cặp hai bánh (bánh trái + bánh phải đã học từ gói 1 mùa 1).
// Màn đội: chỉ đếm R1 (R2 là cỗ máy mùa trước), riêng mùa 9 đếm mọi robot. Đo offline, không gọi khi người chơi mở game.
// Chạy: node tools/do-ghep-nhip.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const M = require('../hoc/lo-trinh-hoc.js');
const TT = require('../hoc/thu-tu-chuong.js');
const Cham = require('../hoc/cham.js');
const SanHoc = require('../hoc/san-hoc.js');
const clone = x => JSON.parse(JSON.stringify(x));

// Lệnh gốc → bộ phận. Lệnh cảm biến không tốn nhịp; ink / aim có hiệu lực ngay: không đếm.
const NHOM = {
  left_move: 'banhT', left_back: 'banhT', right_move: 'banhP', right_back: 'banhP',
  slide_left: 'truot', slide_right: 'truot', diag_left: 'truot', diag_right: 'truot',
  go_up: 'buoc', go_down: 'buoc', go_left: 'buoc', go_right: 'buoc',
  crouch: 'chan', stand: 'chan',
  arm_down: 'nangHa', arm_up: 'nangHa', grab: 'kep', release: 'kep', arm_left: 'xoayTay', arm_right: 'xoayTay',
  spray: 'voi', spray_back: 'voi',
  magnet_n: 'namCham', magnet_s: 'namCham', magnet_off: 'namCham',
  dot: 'son', pen_down: 'son', pen_up: 'son',
  load: 'nem', throw: 'nem',
  anchor: 'neo', unanchor: 'neo',
  cast_net: 'luoi', drop_net: 'luoi', set_length: 'luoi', reel_in: 'luoi', reel_out: 'luoi', tow: 'luoi', drop_tow: 'luoi', tether: 'luoi', untether: 'luoi',
  swing_left: 'quayCan', swing_right: 'quayCan', extend: 'vuonCan', retract: 'vuonCan',
  pick_up: 'moc', pick_up2: 'moc', set_down: 'moc', rail: 'ray',
  land: 'cat', take_off: 'cat',
  retract_spikes: 'gai', extend_spikes: 'gai', note: 'loa', beat: 'loa'
};
const BO_QUA = new Set(['wait', 'ink', 'aim']);
// Nhịp có sự kiện lệnh bị bỏ thì không tính là ghép thật.
const BI_BO = new Set(['ban-dung-yen', 'nem-dung-yen', 'khong-co-da', 'omni-khong-cheo', 'tay-vuong', 'banh-goi-lai', 'tay-goi-lai', 'dang-neo']);

const thuMua = TT.mua.map(m => m.ma).filter(m => m !== 'mua-an');
const muaCua = {}, goiCua = {};
for (const mua of thuMua) TT.goi.filter(g => g.mua === mua).forEach((g, i) => g.chuong.forEach(c => { muaCua[c] = mua; goiCua[c] = i + 1; }));

function cacVet(r, mua) {
  const kq = [];
  for (const s of (r.theoSan && r.theoSan.length ? r.theoSan : [r])) {
    if (Array.isArray(s.doi) && s.doi.length) (mua === 'mua-9' ? s.doi : s.doi.slice(0, 1)).forEach(d => kq.push(d.vet || []));
    else kq.push(s.vet || []);
  }
  return kq;
}

const kho = new Map(), tk = {}, la = new Set();
let khongThang = 0;
for (const m of M.danhSach) {
  const hs = new Map(kho);
  for (const h of m.loiGiai.hamCuaEmMoi || []) hs.set(h.ten, clone(h));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
  const mua = muaCua[m.chuong];
  if (!mua) continue;
  const r = Cham.cham(m, { chinh: m.loiGiai.chinh, hamCuaMan: m.loiGiai.hamCuaMan || [], doi: m.loiGiai.doi }, [...hs.values()]);
  if (!r.thang) { khongThang++; console.log('KHÔNG THẮNG:', m.ma); }
  const t = tk[mua] = tk[mua] || { nhip: 0, ghep: 0, khac: 0, man: 0, manKhac: 0, cap: {}, goi: {} };
  const g = goiCua[m.chuong];
  const tg = t.goi[g] = t.goi[g] || { man: 0, khac: 0, ten: TT.goi.filter(x => x.mua === mua)[g - 1].ten };
  t.man++; tg.man++;
  let coKhac = false;
  for (const vet of cacVet(r, mua)) {
    let tap = new Set();
    for (const v of vet) {
      if (v.loai === 'lenh') {
        if (BO_QUA.has(v.ten) || SanHoc.laHamCamBien(v.ten)) continue;
        if (NHOM[v.ten]) tap.add(NHOM[v.ten]); else la.add(v.ten);
      } else if (v.loai === 'nhip') {
        t.nhip++;
        if (tap.size >= 2 && !(v.suKien || []).some(s => BI_BO.has(s.ma))) {
          t.ghep++;
          const k = [...tap].sort().join('+');
          t.cap[k] = (t.cap[k] || 0) + 1;
          if (!(tap.size === 2 && tap.has('banhT') && tap.has('banhP'))) { t.khac++; coKhac = true; }
        }
        tap = new Set();
      }
    }
  }
  if (coKhac) { t.manKhac++; tg.khac++; }
}

const pt = (a, b) => (b ? (100 * a / b).toFixed(1) : '0.0') + '%';
for (const mua of thuMua) {
  const t = tk[mua]; if (!t) continue;
  console.log(`\n${mua} ${TT.mua.find(x => x.ma === mua).ten}: ${t.man} màn, ${t.nhip} nhịp | nhịp ghép ${pt(t.ghep, t.nhip)} | ghép ngoài cặp hai bánh ${pt(t.khac, t.nhip)} | màn có ghép ngoài hai bánh ${t.manKhac}/${t.man}`);
  console.log('  cặp bộ phận:', Object.entries(t.cap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}=${v}`).join('  ') || '(không có)');
  console.log('  theo gói (màn có ghép ngoài hai bánh / số màn):', Object.entries(t.goi).map(([g, x]) => `${g}.${x.ten} ${x.khac}/${x.man}`).join(' | '));
}
if (la.size) console.log('\nLệnh gốc chưa xếp bộ phận (thêm vào NHOM nếu là lệnh tốn nhịp):', [...la].join(', '));
if (khongThang) console.log(`\n${khongThang} màn lời giải không thắng: số đo của các màn đó không đáng tin.`);

/* ============================================================================
   do-duong-trum-mua-2.mjs — BỘ DÒ cho gói 10 mùa 2 "Xe cứu hỏa R1 xuất xưởng" (man-trum-mua-2.js: chương tong-hop-2, trum-mua-2). Dùng trong kiem-trum-mua-2.mjs; chạy riêng cũng được:
     node hoc/do-duong-trum-mua-2.mjs          (mỗi màn: so chéo lõi, BFS từng sân, lời thiếu xích đẩy, dãy chung không cảm biến)

   PDM2c2 (31/10): gói 10 "R1 chạy một mình, nhiều sân": mọi màn MỘT robot XE CỨU HỎA ĐẦY ĐỦ (xích + vòi phun + mắt hồng ngoại; xichDay + lucBan; KHÔNG beSung: phun mạnh
   thì xe giật như xe hai bánh), mọi màn 2–3 sân. Bộ dò dùng bộ mô phỏng xích + vòi của gói Bệ vòi (do-duong-be-sung.mjs: kiemCheo so chéo lõi, nhipNganNhat BFS tự do,
   dayChung dãy chung cho mọi sân) với beSung = false.
   Luật dò (kiem-trum-mua-2.mjs gọi doMan(m, kho, cham) và nhận { bang, loi }):
     (1) so chéo: bộ mô phỏng khớp SanHoc.chay trên các dãy ngẫu nhiên của từng sân; nút bật sẵn không nối gì (kiemDocLap của gói 7);
     (2) BFS tự do từng sân, TỔNG không dài hơn sao.nhip (mọi màn nhipTheo 'tong');
     (3) LỜI THIẾU PART: lời giải có sự kiện 'thung-di' nguồn xích thì lời giải chạy không xichDay phải KHÔNG thắng;
     (4) CHƯƠNG TRÌNH TỔNG QUÁT: lời giải mọi màn phải đọc cảm biến (distance() / warm(), thẳng hay qua hàm của em / hàm của màn), và không dãy hành động CHUNG nào
         (không cảm biến) thắng mọi sân trong ngưỡng sao.nhip (dayChung theo tổng; màn không 'tong' thì ngưỡng áp cho từng sân, tuy.moiSan).
   Hàm xuất: doMan(m, kho, cham, tuy), docCamBien(m, kho), dongBacCau(kho, lg), suKienCua(chay)
   ========================================================================== */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as D from './do-duong-be-sung.mjs';
import { kiemDocLap } from './do-duong-do-nhiet.mjs';

const require = createRequire(import.meta.url);
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const soSan = (m) => dsSan(m).length;
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.replace(/#.*$/, '').replace(/"[^"]*"/g, '""').matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }
/** Mọi dòng lời giải chạy tới (bắc cầu qua kho + hàm của màn + hàm mới), kể cả chương trình hai robot (gói 9 gộp recall). */
export function dongBacCau(kho, lg) {
  const bang = new Map(kho.map((h) => [h.ten, h.than]));
  for (const h of (lg.hamCuaMan || []).concat(lg.hamCuaEmMoi || [])) bang.set(h.ten, h.than);
  const goc = [...(lg.chinh || []), ...(lg.doi || []).flatMap((d) => d.chinh || [])];
  const dong = [...goc], da = new Set(), cho = [...loiGoi(goc)];
  for (const h of (lg.hamCuaMan || []).concat(lg.hamCuaEmMoi || [])) { dong.push(...h.than); for (const t of loiGoi(h.than)) cho.push(t); }
  while (cho.length) { const t = cho.pop(); if (da.has(t)) continue; da.add(t); if (bang.has(t)) { dong.push(...bang.get(t)); cho.push(...loiGoi(bang.get(t))); } }
  return { goi: da, dong };
}
export const docCamBien = (m, kho) => dongBacCau(kho, m.loiGiai).dong.some((l) => /\b(distance|warm)\(\)/.test(l));
/** Mọi sự kiện nhịp của một kết quả cham (mọi sân, mọi robot). */
export function suKienCua(r) {
  const vet = (v) => (v || []).filter((x) => x.loai === 'nhip').flatMap((x) => x.suKien || []);
  return (r.theoSan || []).flatMap((s) => vet(s.vet).concat((s.doi || []).flatMap((d) => vet(d.vet))));
}

/**
 * Dò một màn. kho = hàm của em đứng trước màn; cham(m, baiLam, hamMoi, them) → kết quả cham.js. Trả { bang: { … chữ cho bảng }, loi: [chuỗi] }.
 */
export function doMan(m, kho, cham, tuy = {}) {
  const bang = {}, loi = [];
  const lg = m.loiGiai, tong = m.nhipTheo === 'tong';
  if (m.doi) { loi.push(m.ma + ': gói 10 không còn màn hai robot'); return { bang, loi }; }
  if (m.beSung) loi.push(m.ma + ': còn cờ beSung (Bệ vòi xích đã cất; bộ dò chạy không bệ)');
  const r = cham(m, lg, lg.hamCuaEmMoi);
  const sk = suKienCua(r);
  // (3) lời thiếu part
  bang.canXichDay = '-';
  if (sk.some((e) => e.ma === 'thung-di' && e.nguon === 'xich')) {
    const rk = cham(m, lg, lg.hamCuaEmMoi, { xichDay: false });
    bang.canXichDay = rk.thang ? 'KHÔNG cần' : 'cần';
    if (rk.thang) loi.push(m.ma + ': lời giải đẩy thùng mà chạy không xichDay vẫn thắng');
  }
  // (1) so chéo, (2) BFS từng sân
  const cheo = D.kiemCheo(m, tuy.soLanCheo || 50);
  if (cheo) loi.push(m.ma + ': bộ mô phỏng lệch lõi: ' + cheo);
  const dl = kiemDocLap(m);
  if (dl) loi.push(m.ma + ': ' + dl);
  const bfs = [];
  for (let i = 0; i < soSan(m); i++) { const co = D.nhipNganNhat(D.catSan(m, i), { beSung: false }); bfs.push(co.nhip); }
  bang.bfs = bfs.join('/');
  const bfsSo = bfs.some((x) => x === null) ? null : (tong ? bfs.reduce((a, b) => a + b, 0) : Math.max(...bfs));
  if (bfsSo === null || bfsSo > m.sao.nhip) loi.push(m.ma + ': BFS ' + bang.bfs + (tong ? ' (tổng ' : ' (dài nhất ') + bfsSo + ') > sao.nhip ' + m.sao.nhip);
  // (4) chương trình tổng quát: đọc cảm biến, không dãy chung
  const doc = docCamBien(m, kho);
  bang.docCamBien = doc;
  if (!doc) { loi.push(m.ma + ': lời giải không đọc cảm biến (gói chạy một mình: chương trình tổng quát phải dùng distance() / warm())'); bang.ne = 'KHÔNG đọc cảm biến'; return { bang, loi }; }
  if (soSan(m) < 2) { loi.push(m.ma + ': chỉ một sân'); bang.ne = 'một sân'; return { bang, loi }; }
  const t = D.dayChung(m, m.sao.nhip, { beSung: false, moiSan: !tong, toiDaTT: tuy.toiDaTT });
  if (t && t.catNgang) loi.push(m.ma + ': dò dãy chung bị cắt ngang');
  else if (t) loi.push(m.ma + ': dãy chung ' + t.nhip + ' nhịp ≤ ' + m.sao.nhip + ' thắng mọi sân không cần cảm biến: ' + t.chuoi);
  bang.ne = 'không có dãy chung ≤ ' + m.sao.nhip + ' nhịp' + (tong ? ' (tổng)' : ' mỗi sân');
  return { bang, loi };
}

/* ------------------------------------------------------------------ chạy riêng: in bảng */
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const Cham = require('./cham.js');
  const M = require('./lo-trinh-hoc.js');
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const kho = new Map(), khoTruoc = new Map();
  for (const m of M.danhSach) { khoTruoc.set(m.ma, clone([...kho.values()])); if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h)); }
  let loiTong = 0;
  for (const m of M.manTrumMua2 || []) {
    const cham = (mm, b, moi, them) => { const hs = new Map(khoTruoc.get(mm.ma).map((h) => [h.ten, clone(h)])); for (const h of moi || []) hs.set(h.ten, clone(h)); return Cham.cham(Object.assign({}, mm, them || {}), b, [...hs.values()]); };
    const { bang, loi } = doMan(m, khoTruoc.get(m.ma), cham);
    console.log([m.ma, 'sao.nhip ' + m.sao.nhip, 'BFS ' + (bang.bfs === undefined ? '-' : bang.bfs), 'xích đẩy: ' + bang.canXichDay, bang.ne].join(' · '));
    for (const l of loi) { console.log('  LỖI ' + l); loiTong++; }
  }
  console.log(loiTong ? 'CÓ ' + loiTong + ' LỖI' : 'Bộ dò: mọi màn đạt.');
  if (loiTong) process.exitCode = 1;
}

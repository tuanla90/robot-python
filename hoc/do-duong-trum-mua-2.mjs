/* ============================================================================
   do-duong-trum-mua-2.mjs — BỘ DÒ cho gói 10 mùa 2 "Nhà máy chạy lại" (man-trum-mua-2.js: chương tong-hop-2, trum-mua-2). Dùng trong kiem-trum-mua-2.mjs; chạy riêng cũng được:
     node hoc/do-duong-trum-mua-2.mjs          (mỗi màn: so chéo lõi, BFS bệ súng / không bệ súng, lời thiếu part, lời cố định / dãy chung; màn hai robot: thân cố định của gói 8)

   Gói 10 không có lõi mới: mọi màn là XE XÍCH + SÚNG HƠI (+ mắt hồng ngoại), beSung + xichDay + lucBan, nên bộ dò GHÉP hai bộ dò đã có:
     - màn MỘT robot: bộ mô phỏng xích + súng của gói 9 (do-duong-be-sung.mjs: kiemCheo so chéo lõi, nhipNganNhat BFS tự do, thanCoDinh cho màn khóa, dayChung cho trùm nhiều sân);
     - màn HAI robot (m.doi, cả hai chương trình khóa): bộ dò thân cố định của gói 8 (do-duong-doi-mua-2.mjs: timThanCoDinhDoi liệt kê mọi thân không cảm biến, chấm thật).
   Luật dò (kiem-trum-mua-2.mjs gọi doMan(m, kho, cham) và nhận { bang, loi }):
     (1) so chéo: bộ mô phỏng gói 9 khớp SanHoc.chay trên các dãy ngẫu nhiên của từng sân (có và không bệ súng); nút bật sẵn không nối gì (kiemDocLap của gói 7);
     (2) BFS tự do có bệ súng không dài hơn sao.nhip (một robot);
     (3) LỜI THIẾU PART: lời giải chạy không bệ súng (xích giật như xe hai bánh) và không xích đẩy thùng: màn nào lời giải có sự kiện 'be-sung' thì ghi "cần bệ súng" khi
         lời giải không bệ súng không được 3 sao (bảng recall tính gói 9 ở màn đó); màn nào lời giải có 'thung-di' nguồn xích thì lời giải không xichDay phải KHÔNG thắng;
     (4) LỜI CỐ ĐỊNH: màn đọc cảm biến (lời giải gọi distance() / warm(), thẳng hay qua hàm của em / hàm của màn): màn khóa một robot thì không thân cố định nào (ghép tới 4 dòng
         không cảm biến) được 3 sao; trùm nhiều sân thì không dãy chung nào thắng mọi sân trong sao.nhip; màn hai robot thì không thân cố định nào thắng trong sao.nhip (gói 8);
         màn MỞ một sân KHÔNG được đọc cảm biến.
   Hàm xuất: doMan(m, kho, cham, tuy), docCamBien(m, kho), suKienCua(chay)
   ========================================================================== */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as D from './do-duong-be-sung.mjs';
import { timThanCoDinhDoi } from './do-duong-doi-mua-2.mjs';
import { kiemDocLap } from './do-duong-do-nhiet.mjs';

const require = createRequire(import.meta.url);
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const soSan = (m) => dsSan(m).length;
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.replace(/#.*$/, '').replace(/"[^"]*"/g, '""').matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }
/** Mọi dòng lời giải chạy tới (bắc cầu qua kho + hàm của màn + hàm mới), kể cả chương trình hai robot. */
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
  const lg = m.loiGiai, hm = (lg.hamCuaEmMoi || [])[0] || (lg.hamCuaMan || [])[0];
  const laMan = !(lg.hamCuaEmMoi || []).length;
  const r = cham(m, lg, lg.hamCuaEmMoi);
  const sk = suKienCua(r);
  // (3) lời thiếu part
  const banTu = sk.some((e) => e.ma === 'be-sung');
  const dayThung = sk.some((e) => e.ma === 'thung-di' && e.nguon === 'xich');
  bang.canBeSung = '-';
  if (banTu) {
    const rk = cham(m, lg, lg.hamCuaEmMoi, { beSung: false });
    bang.canBeSung = rk.sao < 3 ? 'cần (không bệ súng: ' + (rk.thang ? rk.sao + ' sao' : 'thua') + ')' : 'KHÔNG cần';
  }
  bang.canXichDay = '-';
  if (dayThung) {
    const rk = cham(m, lg, lg.hamCuaEmMoi, { xichDay: false });
    bang.canXichDay = rk.thang ? 'KHÔNG cần' : 'cần';
    if (rk.thang) loi.push(m.ma + ': lời giải đẩy thùng mà chạy không xichDay vẫn thắng');
  }
  const doc = docCamBien(m, kho);
  bang.docCamBien = doc;
  if (m.doi) {
    // màn hai robot: bộ dò gói 8
    if (!m.doi.every((d) => d.coDinh)) loi.push(m.ma + ': màn hai robot phải khóa cả hai chương trình (chưa có bộ dò chung hai robot cho màn mở)');
    if (!hm) { loi.push(m.ma + ': màn hai robot không có hàm để viết / sửa'); return { bang, loi }; }
    bang.ne = 'hai robot';
    if (!doc) { bang.ne += ': không đọc cảm biến'; return { bang, loi }; }
    const ngan = { nhipToiDa: m.sao.nhip + 1 };
    const chamThan = (than) => {
      const h = Object.assign({}, hm, { than });
      return laMan ? cham(m, Object.assign({}, lg, { hamCuaMan: [h] }), [], ngan) : cham(m, Object.assign({}, lg, { hamCuaMan: lg.hamCuaMan }), [h], ngan);
    };
    const t = timThanCoDinhDoi(m, hm.ten, kho, chamThan);
    bang.ne += ': thân cố định đủ mọi dãy dài ≤ ' + t.du + (t.L > t.du ? ', chờ + ≤ 2 lệnh tới dài ' + t.L : '') + (t.demDuoc ? '' : ' (không đếm tĩnh được)') + ' trên ' + t.chu.length + ' chữ: thử ' + t.soThu + ', thắng trong ngưỡng ' + t.thang.length;
    if (t.thang.length) loi.push(m.ma + ': thân ' + hm.ten + ' cố định thắng ' + t.thang[0].soNhip + ' nhịp ≤ ' + m.sao.nhip + ': ' + t.thang[0].than.join(' / '));
    return { bang, loi };
  }
  // (1) so chéo, (2) BFS
  const cheo = D.kiemCheo(m, tuy.soLanCheo || 50);
  if (cheo) loi.push(m.ma + ': bộ mô phỏng lệch lõi: ' + cheo);
  const dl = kiemDocLap(m);
  if (dl) loi.push(m.ma + ': ' + dl);
  const co = D.nhipNganNhat(m);
  bang.bfs = co.nhip;
  if (co.nhip === null || co.nhip > m.sao.nhip) loi.push(m.ma + ': BFS bệ súng ' + co.nhip + ' > sao.nhip ' + m.sao.nhip);
  const khong = D.nhipNganNhat(m, { beSung: false });
  bang.khong = khong.nhip === null ? 'không tới' : khong.nhip;
  // (4) lời cố định
  const chamThan = (than, them) => {
    const h = Object.assign({}, hm, { than });
    return laMan ? cham(m, { chinh: lg.chinh, hamCuaMan: [h] }, [], them) : cham(m, { chinh: lg.chinh, hamCuaMan: lg.hamCuaMan }, [h], them);
  };
  if (!doc) { bang.ne = 'không đọc cảm biến'; return { bang, loi }; }
  if (soSan(m) > 1) {
    const t = D.dayChung(m, m.sao.nhip);
    if (t && t.catNgang) loi.push(m.ma + ': dò dãy chung bị cắt ngang');
    else if (t) loi.push(m.ma + ': dãy chung ' + t.nhip + ' nhịp ≤ ' + m.sao.nhip + ' thắng mọi sân không cần cảm biến: ' + t.chuoi);
    bang.ne = 'không có dãy chung ≤ ' + m.sao.nhip + ' nhịp';
    return { bang, loi };
  }
  if (!m.chinhCoDinh) { loi.push(m.ma + ': màn mở một sân không được đọc cảm biến (khóa chương trình chính hay làm trùm nhiều sân)'); bang.ne = 'MỞ mà đọc cảm biến'; return { bang, loi }; }
  if (!hm) { loi.push(m.ma + ': khóa chương trình chính mà không có hàm để viết / sửa'); return { bang, loi }; }
  if (!dongBacCau(kho, { chinh: [], hamCuaMan: [hm] }).dong.some((l) => /\b(distance|warm)\(\)/.test(l))) loi.push(m.ma + ': thân ' + hm.ten + ' không đọc cảm biến');
  const t = D.thanCoDinh(m, kho, hm.ten, (than) => chamThan(than), { thamSo: hm.thamSo });
  bang.ne = 'khóa: ' + (t.khong ? 'không thân cố định nào 3 sao (' + t.soThan + ' thân, ' + t.soThang + ' thắng' + (t.moDuoc ? '' : ', chấm thật tới 2 dòng') + ')' : 'thân ' + t.than.join(' / '));
  if (!t.khong) loi.push(m.ma + ': thân ' + hm.ten + ' cố định ' + t.soO + ' ô, ' + t.soNhip + ' nhịp được 3 sao: ' + t.than.join(' / '));
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
    console.log([m.ma, 'sao.nhip ' + m.sao.nhip, 'BFS ' + (bang.bfs === undefined ? '-' : bang.bfs), 'không bệ súng ' + (bang.khong === undefined ? '-' : bang.khong), 'bệ súng: ' + bang.canBeSung, 'xích đẩy: ' + bang.canXichDay, bang.ne].join(' · '));
    for (const l of loi) { console.log('  LỖI ' + l); loiTong++; }
  }
  console.log(loiTong ? 'CÓ ' + loiTong + ' LỖI' : 'Bộ dò: mọi màn đạt.');
  if (loiTong) process.exitCode = 1;
}

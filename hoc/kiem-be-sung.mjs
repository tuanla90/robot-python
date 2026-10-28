/* ============================================================================
   kiem-be-sung.mjs — máy kiểm 20 màn mới của mùa 2, gói 9 "Bệ súng xích" (COMBO, man-be-sung.js): chương `be-sung` (xích bắn tụ không giật) và `che-be-sung` "Hàm bệ súng".
   Màn 10 mỗi chương là trùm có huy hiệu (be-sung, che-be-sung).
   1. Vị trí: gói be-sung (mùa 2) có hai chương be-sung, che-be-sung; mỗi chương đúng 10 màn mới theo `so`, hạng lam-quen ×3 · luyen ×3 · bien-the ×3 · trum;
      be-sung.1 đứng ngay sau màn cuối của gói mùa 2 liền trước (gói 8 khi đã có màn, chưa có thì gói 7), che-be-sung.1 ngay sau be-sung.10;
      trùm mang huy hiệu đúng mã chương (huy-hieu.js có hình), màn khác không mang.
   2. Từng màn: đủ trường (cả kieuBai, ≥ 2 lời sai có phaiCoMa); XÍCH gắn SÚNG HƠI, cờ beSung + xichDay; màn có mắt hồng ngoại thì khay có distance + warm;
      nhiều sân chỉ ở trùm (+ nhipTheo 'tong'); lời giải thắng 3 sao, đúng sao.o / sao.nhip, KHÔNG chẩn đoán; mã mẫu chưa thắng; lời giải khác đúng 2 sao;
      công thức khác (nếu có) thắng; lời sai thua và có đủ mã phaiCoMa; chữ hiển thị không emoji, không gạch dài.
   3. Hàm của em: mọi hàm màn cần đã được tạo ở màn đứng trước (không dùng hàm của gói 8 Đội), mọi lời gọi khai trong hamCuaEmCan; hàm mới (taoHam) không trùng
      hàm cốt truyện nào (kể cả mùa ẩn), có mục Sổ lệnh đúng màn / chương, nhóm hoi; hàm của màn không trùng hàm cốt truyện / hàm trong kho.
   4. Không dùng thứ lạ: nhiều robot (doi, gói 8), return (mùa 5); sân không S / u / n.
   5. Đường cong (mỗi chương): dòng lời giải / nhịp / số ô không tường của màn n ≤ max(1,5 × màn n−1, màn n−1 + lề) (lề +3 dòng, +4 nhịp, +6 ô), trùm được miễn và
      không làm mốc (be-sung.1 so với màn không trùm cuối cùng đứng trước nó, che-be-sung.1 so với be-sung.9); mỗi màn thêm TỐI ĐA MỘT điều mới;
      chương be-sung có màn đố ("Đố…"), chương che-be-sung có màn sửa hàm lỗi ("Sửa…", hàm của màn) và màn khóa tạo hàm đọc warm().
   6. Bộ dò (do-duong-be-sung.mjs, bộ mô phỏng nhịp xích + súng, so chéo với lõi):
      - so chéo: bộ mô phỏng khớp SanHoc.chay trên các dãy ngẫu nhiên của từng sân (có và không bệ súng); nút bật sẵn không nối gì;
      - BFS tự do có bệ súng không dài hơn sao.nhip;
      - CẦN BỆ SÚNG: cùng sân, xích KHÔNG bệ súng (giật như xe hai bánh) không có đường nào trong sao.nhip, và lời giải chạy không bệ súng không được 3 sao;
      - màn đọc cảm biến (lời giải gọi distance() / warm(), thẳng hay qua hàm của em): màn khóa thì không thân cố định nào (ghép tới 3 dòng không cảm biến) được 3 sao;
        trùm nhiều sân thì không có dãy chung nào thắng mọi sân trong sao.nhip; màn mở một sân KHÔNG được đọc cảm biến (để luật "lời cố định không 3 sao" không bị bỏ ngỏ).
   7. BẢNG RECALL (KE-HOACH-MUA-1.md "Đường cong học và recall", đổi bảng gói theo mùa 2): mỗi màn đánh dấu gói 1–7 mùa 2 được dùng, đọc từ lời giải (bắc cầu qua hàm của em /
      hàm của màn), sân và lần chạy lời giải. COMBO (xích + súng hơi + bệ súng) là ý chính của mọi màn nên KHÔNG tính; gói 1 chỉ tính khi có biến hay spin / sidestep,
      gói 2 khi có hàm có tham số (forward(n)…) hay tạo hàm có tham số. Ba luật: (a) mỗi màn ≥ 2 gói; (b) mỗi gói 1–7 được nhắc ≥ 2 lần trên 20 màn;
      (c) không hai màn liền nhau cùng kiểu bài (kieuBai). Phần recall XUẤT được (GOI_RECALL_2, recallMan2, kiemRecall2) để máy kiểm gói 10 gộp gói 9 + 10 (≥ 3 lần).
   Chạy: node hoc/kiem-be-sung.mjs              (trượt thì thoát mã 1)
         node hoc/kiem-be-sung.mjs --loi-gia    (cắm lỗi giả: các mục bị cắm phải ĐỎ; thoát 0 khi đỏ đủ)
         node hoc/kiem-be-sung.mjs --chi=be-sung.3,be-sung.4   (chỉ kiểm từng màn cho các mã này)
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const clone = (x) => JSON.parse(JSON.stringify(x));
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const soSan = (m) => dsSan(m).length;
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.replace(/#.*$/, '').replace(/"[^"]*"/g, '""').matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }

/* ================================================================== RECALL mùa 2 (xuất cho gói 10) */
/** Tên ngắn của gói 1–7 mùa 2 (KE-HOACH-MUA-2.md, bảng 10 gói). Gói 8 Đội không tính ở gói 9 (viết song song). */
export const GOI_RECALL_2 = {
  1: 'xích + biến', 2: 'súng hơi + tham số', 3: 'hồng ngoại distance()', 4: 'nhà máy: nút bắn + cửa, băng chuyền', 5: 'đẩy thùng', 6: 'lực bắn', 7: 'đo nhiệt warm()'
};
const HAM_GOI = {
  1: ['spin', 'sidestep', 'pick_behind'],
  2: ['forward', 'right', 'deliver', 'step'],
  3: ['go_to_wall', 'go_safe', 'clean_step', 'go_get'],
  4: ['jet_back', 'jet_fwd', 'kick_right', 'tap_right', 'kick_left', 'kick_ahead'],
  5: ['push', 'go_around', 'push_around', 'push_back'],
  6: ['fire', 'fire_back', 'smart_fire', 'aim_fire', 'aim_left', 'aim_right', 'fire_left', 'close_fire', 'scan_left', 'aim_turn'],
  7: ['switch_on', 'switch_left', 'find_warm', 'aim_on', 'scan_on', 'switch_right', 'aim_left_on']
};
/** Mọi tên hàm lời giải chạy tới (bắc cầu qua kho + hàm của màn + hàm mới) và mọi dòng của chúng. */
function bacCau(kho, lg) {
  const bang = new Map(kho.map((h) => [h.ten, h.than]));
  for (const h of (lg.hamCuaMan || []).concat(lg.hamCuaEmMoi || [])) bang.set(h.ten, h.than);
  const dong = [...(lg.chinh || [])], da = new Set(), cho = [...loiGoi(lg.chinh)];
  for (const h of (lg.hamCuaMan || []).concat(lg.hamCuaEmMoi || [])) { dong.push(...h.than); for (const t of loiGoi(h.than)) cho.push(t); }
  while (cho.length) { const t = cho.pop(); if (da.has(t)) continue; da.add(t); if (bang.has(t)) { dong.push(...bang.get(t)); cho.push(...loiGoi(bang.get(t))); } }
  return { goi: da, dong };
}
/**
 * Gói 1–7 mùa 2 mà lời giải màn m dùng: { goi: Set<số>, lyDo: { số: chuỗi } }. kho = hàm của em đứng trước màn; chay = kết quả cham.js của lời giải (để thấy xích đẩy thùng).
 */
export function recallMan2(m, kho, chay) {
  const lg = m.loiGiai, goi = new Set(), lyDo = {};
  const dat = (n, s) => { if (!goi.has(n)) { goi.add(n); lyDo[n] = s; } };
  const { goi: L, dong } = bacCau(kho, lg);
  const viet = (lg.chinh || []).concat((lg.hamCuaMan || []).concat(lg.hamCuaEmMoi || []).flatMap((h) => h.than)).map((l) => l.replace(/#.*$/, ''));
  const co = (ds) => ds.filter((t) => L.has(t));
  const chu = dsSan(m).map((s) => s.join('')).join('');
  if (viet.some((l) => /^\s*[A-Za-z_]\w*\s*(=|\+=|-=)[^=]/.test(l))) dat(1, 'biến');
  if (co(HAM_GOI[1]).length) dat(1, co(HAM_GOI[1]).join('/'));
  if ((lg.hamCuaEmMoi || []).concat(lg.hamCuaMan || []).some((h) => h.thamSo.length)) dat(2, 'tạo hàm có tham số');
  if (co(HAM_GOI[2]).length) dat(2, co(HAM_GOI[2]).join('/') + '(n)');
  if (dong.some((l) => /distance\(\)/.test(l))) dat(3, co(HAM_GOI[3].concat(['push', 'aim_fire'])).join('/') || 'distance()');
  if (/N/.test(chu) && /[Cc]/.test(chu)) dat(4, 'nút bắn mở cửa');
  if (/[<>^v]/.test(chu)) dat(4, 'băng chuyền');
  if (co(HAM_GOI[4]).length) dat(4, co(HAM_GOI[4]).join('/'));
  const suKien = (chay && chay.theoSan ? chay.theoSan.flatMap((s) => s.vet || []) : (chay && chay.vet) || []).filter((v) => v.loai === 'nhip').flatMap((v) => v.suKien || []);
  if (suKien.some((e) => e.ma === 'thung-di' && e.nguon === 'xich')) dat(5, 'xích đẩy thùng');
  if (co(HAM_GOI[5]).length) dat(5, co(HAM_GOI[5]).join('/'));
  if (co(HAM_GOI[6]).length) dat(6, co(HAM_GOI[6]).join('/'));
  if (dong.some((l) => /\b(shoot|shoot_back)\("(fast|charge)"\)/.test(l))) dat(6, 'shoot("…")');
  if (dong.some((l) => /warm\(\)/.test(l))) dat(7, co(HAM_GOI[7]).join('/') || 'warm()');
  return { goi, lyDo };
}
/** Ba luật recall trên danh sách màn ds (thứ tự chơi). recall(m) = kết quả recallMan2. Trả { dem: { gói: số lần }, loi: [chuỗi] }. */
export function kiemRecall2(ds, recall, { toiThieu = 2, toiThieuMan = 2 } = {}) {
  const loi = [], dem = {};
  for (let g = 1; g <= 7; g++) dem[g] = 0;
  ds.forEach((m, i) => {
    const r = recall(m);
    for (const g of r.goi) dem[g]++;
    if (r.goi.size < toiThieuMan) loi.push(m.ma + ': chỉ recall ' + r.goi.size + ' gói (cần ≥ ' + toiThieuMan + ')');
    if (!m.kieuBai) loi.push(m.ma + ': thiếu kieuBai');
    if (i > 0 && m.kieuBai && m.kieuBai === ds[i - 1].kieuBai) loi.push(m.ma + ' cùng kiểu bài "' + m.kieuBai + '" với màn liền trước ' + ds[i - 1].ma);
  });
  for (let g = 1; g <= 7; g++) if (dem[g] < toiThieu) loi.push('gói ' + g + ' (' + GOI_RECALL_2[g] + ') chỉ được nhắc ' + dem[g] + ' lần (cần ≥ ' + toiThieu + ')');
  return { dem, loi };
}

/* ================================================================== máy kiểm gói 9 */
async function main() {
  const Cham = require('./cham.js');
  const M = require('./lo-trinh-hoc.js');
  const TT = require('./thu-tu-chuong.js');
  const SL = require('./so-lenh.js');
  const Bo = await import('./do-duong-sung-hoi.mjs');
  const D = await import('./do-duong-be-sung.mjs');
  const { kiemDocLap } = await import('./do-duong-do-nhiet.mjs');
  const LOI_GIA = process.argv.includes('--loi-gia');
  const CHI = (process.argv.find((a) => a.startsWith('--chi=')) || '').slice(6);

  let dat = 0, hong = 0;
  const hongMuc = [];
  const kiem = (ten, fn) => { try { fn(); dat++; } catch (e) { hong++; hongMuc.push(ten); console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); } };

  const CHUONG = ['be-sung', 'che-be-sung'];
  const LE = { dong: 3, nhip: 4, o: 6 };
  const get = (ma) => M.timMa(ma);
  const goiMua2 = TT.goi.filter((g) => g.mua === 'mua-2');
  const goi = goiMua2.find((g) => g.ma === 'be-sung');
  const DS_C = Object.fromEntries(CHUONG.map((c) => [c, M.danhSach.filter((m) => m.chuong === c)]));
  const DS = CHUONG.flatMap((c) => DS_C[c]);
  const viTri = (m) => M.danhSach.indexOf(m);
  const truocGoi = M.danhSach.slice(0, DS.length ? viTri(DS[0]) : 0);
  const MOC = { 'be-sung': [...truocGoi].reverse().find((m) => m.hang !== 'trum'), 'che-be-sung': DS_C['be-sung'][8] };
  /** Chương của gói 8 Đội: hàm tạo ở đây không được dùng (gói 8 viết song song). */
  const CHUONG_GOI_8 = (goiMua2.find((g) => g.ma === 'doi-mua-2') || { chuong: [] }).chuong;

  /* ---------------------------------------------------------------- lỗi giả (--loi-gia): mỗi lỗi làm đỏ một mục */
  const LOI_GIA_DS = [];
  if (LOI_GIA) {
    const a = get('be-sung.1'), b = get('be-sung.2'), c = get('be-sung.3');
    a.sao = Object.assign({}, a.sao, { nhip: a.sao.nhip - 1 }); LOI_GIA_DS.push('be-sung.1: lời giải');                // ngưỡng nhịp sai → lời giải chỉ 2 sao
    b.loiSai[0].phaiCoMa = ['vat-vo']; LOI_GIA_DS.push('be-sung.2: lời giải');                                         // lời sai thiếu mã
    b.hamCuaEmCan = b.hamCuaEmCan.concat(['fly_home']); LOI_GIA_DS.push('be-sung.2: hàm của em');                      // hàm chưa ai tạo
    c.beSung = false; LOI_GIA_DS.push('be-sung.3: đủ trường');                                                          // quên cờ bệ súng
    const d = get('be-sung.1'); d.san = d.san.map((r, i) => (i === 4 ? r.replace('#.####', '######') : r)); LOI_GIA_DS.push('be-sung.1: bộ dò');   // bịt ô sau lưng: không bệ súng vẫn kịp
    const t = DS.find((m) => m.hang === 'trum'); if (t) { t.huyHieu = null; LOI_GIA_DS.push('huy hiệu'); }
    const e = DS.find((m) => (m.taoHam || []).length); if (e) { e.taoHam = ['sweep']; LOI_GIA_DS.push(e.ma + ': hàm của em'); }   // trùng hàm cốt truyện che-lap.5
    get('be-sung.3').kieuBai = get('be-sung.2').kieuBai; LOI_GIA_DS.push('recall');                                      // hai màn liền cùng kiểu bài
  }

  /* ---------------------------------------------------------------- kho hàm của em theo thứ tự lộ trình */
  const khoTruoc = new Map(), daTaoTruoc = new Map(), noiTao = new Map();
  {
    const kho = new Map(), daTao = new Set();
    for (const m of M.danhSach) {
      khoTruoc.set(m.ma, clone([...kho.values()]));
      daTaoTruoc.set(m.ma, new Set(daTao));
      if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
      for (const t of (m.taoHam || []).concat((m.loiGiai.hamCuaEmMoi || []).map((h) => h.ten))) { daTao.add(t); if (!noiTao.has(t)) noiTao.set(t, m.chuong); }
    }
  }
  function cham(m, b, moi, them) {
    const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, clone(h)]));
    for (const h of moi || []) hs.set(h.ten, clone(h));
    return Cham.cham(Object.assign({}, m, them || {}), { chinh: b.chinh, hamCuaMan: b.hamCuaMan || [] }, [...hs.values()]);
  }
  const PY = new Set(['range', 'print', 'len']);
  function moiBai(m) {
    const ds = [{ ten: 'maMau', b: m.maMau, moi: [] }, { ten: 'loiGiai', b: m.loiGiai, moi: m.loiGiai.hamCuaEmMoi }];
    if (m.loiGiaiKhac) ds.push({ ten: 'loiGiaiKhac', b: m.loiGiaiKhac.baiLam, moi: m.loiGiaiKhac.hamCuaEmMoi });
    (m.congThucKhac || []).forEach((c, i) => ds.push({ ten: 'congThucKhac[' + i + ']', b: c.baiLam, moi: c.hamCuaEmMoi }));
    m.loiSai.forEach((ls, i) => ds.push({ ten: 'loiSai[' + i + ']', b: ls.baiLam, moi: ls.hamCuaEmMoi }));
    return ds;
  }
  const dongCua = (x) => [...(x.b.chinh || []), ...(x.b.hamCuaMan || []).concat(x.moi || []).flatMap((h) => h.than)];
  /** Số dòng lời giải người chơi viết / sửa: chương trình chính (trừ khi khóa) + thân hàm mới + thân hàm của màn. */
  const soDong = (m) => (m.chinhCoDinh ? 0 : m.loiGiai.chinh.length) + (m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).reduce((s, h) => s + h.than.length, 0);
  const coSan = (m) => Math.max(...dsSan(m).map((rows) => rows.join('').replace(/#/g, '').length));
  /** Lời "bù giật": thêm move() (cùng thụt lề) sau mỗi dòng bắn tụ ra trước, back() sau mỗi dòng bắn tụ ra sau (thói quen xe hai bánh bị giật). */
  function buGiat(lg) {
    const them = (dong) => dong.flatMap((l, i) => {
      const th = l.match(/^\s*/)[0], t = l.trim(), truoc = (dong[i - 1] || '').trim();
      const tu = /^(fire\("charge"\)|jet_back\(\)|shoot\("charge"\)|shoot\(\))$/.test(t) && !/^shoot/.test(t);
      const sau = /^(fire_back\("charge"\)|jet_fwd\(\))$/.test(t);
      const choSau = t === 'wait()' && /^shoot(_back)?\((\)|"charge"\))$/.test(truoc);
      if (tu || (choSau && /^shoot\(/.test(truoc))) return [l, th + 'move()'];
      if (sau || (choSau && /^shoot_back\(/.test(truoc))) return [l, th + 'back()'];
      return [l];
    });
    const h = (ds) => (ds || []).map((x) => Object.assign({}, x, { than: them(x.than) }));
    return { chinh: them(lg.chinh || []), hamCuaMan: h(lg.hamCuaMan), hamCuaEmMoi: h(lg.hamCuaEmMoi) };
  }
  const docCamBien = (m) =>bacCau(khoTruoc.get(m.ma), m.loiGiai).dong.some((l) => /\b(distance|warm)\(\)/.test(l));

  /* ---------------------------------------------------------------- đặc trưng (điều mới) của một màn, đọc từ lời giải và sân */
  const RE_SO_SANH = /(<=|>=|==|!=|<|>)\s*(\d+|[A-Za-z_]\w*)/g;
  function dacTrung(m) {
    const lg = m.loiGiai, moi = lg.hamCuaEmMoi || [], cuaMan = lg.hamCuaMan || [];
    const dong = [...(lg.chinh || []), ...cuaMan.concat(moi).flatMap((h) => h.than)];
    const kho = new Map((khoTruoc.get(m.ma) || []).map((x) => [x.ten, x]));
    const f = new Set();
    for (const l of dong) {
      if (/distance\(\)/.test(l)) f.add('distance');
      if (/warm\(\)/.test(l)) f.add('warm');
      if (/\bwhile\s+not\s+warm\(\)/.test(l)) f.add('while not warm');
      else if (/\bwhile\s+warm\(\)/.test(l)) f.add('while warm');
      if (/\b(and|or)\b/.test(l.replace(/#.*$/, ''))) f.add('and / or');
      if (/^\s*while\b/.test(l)) f.add(/^\s*while True:/.test(l) ? 'while True' : 'while');
      if (/^\s*if\b/.test(l)) f.add('if');
      if (/^\s*elif\b/.test(l)) f.add('elif');
      if (/^\s*else\s*:/.test(l)) f.add('else');
      if (/^\s*for\b/.test(l)) f.add('for');
      if (/^\s*[A-Za-z_]\w*\s*=\s*"/.test(l)) f.add('bien = chuoi');
      else if (/^\s*[A-Za-z_]\w*\s*=\s*\d+\s*$/.test(l)) f.add('bien = so');
      else if (/^\s*[A-Za-z_]\w*\s*([-+]=|=\s*[A-Za-z_]\w*\s*[-+])/.test(l)) f.add('bien dem');
      else if (/^\s*[A-Za-z_]\w*\s*=\s*\w+\(\)/.test(l)) f.add('bien = cam bien');
      for (const x of l.matchAll(RE_SO_SANH)) if (!/^\s*for\b/.test(l)) f.add('so sanh ' + x[1] + (/^\d+$/.test(x[2]) ? ' so' : ' bien'));
      if (/\b(shoot|shoot_back|fire|fire_back)\("(fast|charge)"\)/.test(l)) f.add('luc ban');
      if (/\b(shoot_back|fire_back|jet_fwd)\(/.test(l)) f.add('ban sau');
    }
    for (const h of moi.concat(cuaMan)) {
      if (h.thamSo.length && h.than.some((l) => new RegExp('\\((' + h.thamSo.join('|') + ')\\)').test(l) && /\b(shoot|shoot_back|fire|fire_back)\(/.test(l))) f.add('tham so luc');
      if (h.than.some((l) => /distance\(\)/.test(l)) && h.than.some((l) => /\b(shoot|fire)\w*\(/.test(l))) f.add('chon luc theo distance');
      if (h.than.some((l) => /warm\(\)/.test(l))) f.add('ham doc warm');
    }
    for (const h of moi) {
      f.add(h.thamSo.length > 1 ? 'tao ham hai tham so' : h.thamSo.length ? 'tao ham co tham so' : 'tao ham');
      const goiKho = [...loiGoi(h.than)].filter((t) => kho.has(t));
      if (goiKho.length) f.add('ham goi ham');
      if (h.than.some((l) => /^\s*for\b/.test(l))) f.add('for trong ham');
      if (h.than.some((l) => /^\s*while\b/.test(l))) f.add('while trong ham');
    }
    if (cuaMan.length) f.add(m.chinhCoDinh ? 'chuong trinh khoa' : 'ham cua man');
    if (m.chinhCoDinh) f.add('chuong trinh khoa');
    if (m.mucTieu) f.add('muc tieu ' + m.mucTieu);
    if (m.lucBan) f.add('luc ban');
    if (m.beSung) f.add('be sung');
    const chu = dsSan(m).map((s) => s.join('')).join('');
    if (/[Hh]/.test(chu)) f.add('thung nang');
    if (/[<>^v]/.test(chu)) f.add('bang chuyen');
    if (/M/.test(chu)) f.add('nut de');
    if (/N/.test(chu)) f.add('nut ban');
    if (/[Cc]/.test(chu)) f.add('cua');
    if (m.nutBat) f.add('nut bat san');
    if (m.bongMo && [].concat(m.bongMo).some((b) => b && b.thung)) f.add('thung mo');
    return f;
  }

  /* ---------------------------------------------------------------- 1. vị trí */
  kiem('gói be-sung (mùa 2): hai chương be-sung, che-be-sung; mỗi chương 10 màn mới đúng so và hạng; nối đúng chỗ trong lộ trình', () => {
    assert.ok(goi && goi.mua === 'mua-2', 'không thấy gói be-sung ở mùa 2');
    assert.deepEqual(goi.chuong, CHUONG);
    for (const c of CHUONG) {
      const ds = DS_C[c];
      assert.deepEqual(ds.map((m) => m.ma), Array.from({ length: 10 }, (_, i) => c + '.' + (i + 1)), c);
      assert.deepEqual(ds.map((m) => m.hang), ds.map((_, i) => (i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum')), c + ' hạng');
    }
    assert.equal((M.manBeSung || []).length, 20, 'ManHoc.manBeSung phải có 20 màn');
    const iGoi = goiMua2.indexOf(goi), goiTruoc = goiMua2[iGoi - 1];
    assert.ok(goiTruoc, 'không có gói mùa 2 đứng trước');
    const cuoi = M.danhSach.filter((m) => goiTruoc.chuong.includes(m.chuong)).pop();
    assert.equal(viTri(DS_C['be-sung'][0]), viTri(cuoi) + 1, 'be-sung.1 phải đứng ngay sau ' + cuoi.ma + ' (màn cuối gói ' + goiTruoc.ma + ')');
    assert.equal(viTri(DS_C['che-be-sung'][0]), viTri(get('be-sung.10')) + 1, 'che-be-sung.1 phải đứng ngay sau be-sung.10');
  });
  kiem('tên màn không trùng trong gói và không trùng màn khác của lộ trình', () => {
    const ten = DS.map((m) => m.ten);
    assert.equal(new Set(ten).size, ten.length, 'trùng tên: ' + ten.filter((t, i) => ten.indexOf(t) !== i));
    const cu = M.danhSach.filter((m) => !CHUONG.includes(m.chuong)).map((m) => m.ten);
    for (const t of ten) assert.ok(!cu.includes(t), 'tên "' + t + '" trùng một màn khác');
  });
  kiem('huy hiệu: chỉ trùm mang, đúng mã chương; huy-hieu.js có hình', () => {
    const hh = fs.readFileSync(new URL('./game/huy-hieu.js', import.meta.url), 'utf8');
    for (const c of CHUONG) {
      const ds = DS_C[c], trum = ds[ds.length - 1];
      assert.equal(trum && trum.hang, 'trum', c + ': chưa có trùm');
      assert.equal(trum.huyHieu && trum.huyHieu.ma, c, c + ': trùm thiếu huy hiệu');
      assert.ok(trum.huyHieu.ten && !/[—]/.test(trum.huyHieu.ten));
      for (const m of ds.slice(0, -1)) assert.ok(!m.huyHieu, m.ma + ' không phải trùm mà có huy hiệu');
      assert.ok(new RegExp("HINH\\['" + c + "'\\]\\s*=\\s*function").test(hh), "huy-hieu.js thiếu HINH['" + c + "']");
    }
  });

  /* ---------------------------------------------------------------- 2–4, 6. từng màn */
  const HAM_COT_TRUYEN = new Map();
  for (const m of M.danhSach) for (const t of m.taoHam || []) if (!HAM_COT_TRUYEN.has(t)) HAM_COT_TRUYEN.set(t, m.ma);
  const bang = {}, ketQua = {};
  for (const m of DS) {
    const kho = khoTruoc.get(m.ma), daTao = daTaoTruoc.get(m.ma);
    bang[m.ma] = {};
    if (CHI && !CHI.split(',').includes(m.ma)) continue;
    kiem(m.ma + ': đủ trường, xích gắn súng hơi, beSung + xichDay, một sân', () => {
      for (const k of ['ten', 'deBai', 'san', 'batDau', 'mucTieu', 'hamGoc', 'robot', 'sao', 'maMau', 'loiGiai', 'loiGiaiKhac', 'goiY', 'hamCuaEmCan', 'yMoi', 'kieuBai']) assert.ok(m[k] !== undefined && m[k] !== '', m.ma + ' thiếu ' + k);
      assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất 2 lời sai');
      for (const ls of m.loiSai) assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
      assert.ok(m.goiY.length >= 1);
      assert.equal(m.loaiRobot, 'xich');
      assert.equal(m.robot.than, 'xich');
      assert.equal(m.robot.tay, 'hoi', m.ma + ' tay ' + m.robot.tay);
      assert.equal(m.beSung, true, m.ma + ' thiếu beSung: true');
      assert.equal(m.xichDay, true, m.ma + ' thiếu xichDay: true');
      for (const h of ['shoot', 'shoot_back']) assert.ok(m.hamGoc.includes(h), m.ma + ' khay thiếu ' + h);
      const mat = (m.robot.camBien || []).map((c) => c.ma);
      if (mat.length) { assert.deepEqual(mat, ['hong-ngoai']); for (const h of ['distance', 'warm']) assert.ok(m.hamGoc.includes(h), m.ma + ' khay thiếu ' + h); }
      else assert.ok(!m.hamGoc.includes('distance') && !m.hamGoc.includes('warm'), m.ma + ' khay có cảm biến mà robot không gắn mắt');
      assert.ok(['toi-co', 'bong-mo', 'day-thung'].includes(m.mucTieu), m.ma + ' mục tiêu ' + m.mucTieu);
      if (m.hang === 'trum') assert.ok(soSan(m) <= 3, m.ma + ' trùm tối đa ba sân');
      else assert.equal(soSan(m), 1, m.ma + ' nhiều sân chỉ ở trùm (luật lộ trình)');
      if (soSan(m) > 1) assert.equal(m.nhipTheo, 'tong', m.ma + ' nhiều sân phải tính tổng nhịp');
      for (const s of ['ten', 'deBai', 'veMaMau', 'yMoi']) if (m[s]) assert.ok(!/—|\p{Extended_Pictographic}/u.test(m[s]), m.ma + ' ' + s + ' có gạch dài / emoji');
      for (const s of m.goiY.concat(m.loiSai.map((x) => x.moTa), [m.loiGiaiKhac.moTa], (m.congThucKhac || []).map((x) => x.moTa))) assert.ok(!/—|\p{Extended_Pictographic}/u.test(s), m.ma + ' chữ có gạch dài / emoji: ' + s);
      if (m.hang === 'trum') assert.ok(m.huyHieu, m.ma + ' trùm thiếu huy hiệu');
    });
    kiem(m.ma + ': không dùng thứ lạ (nhiều robot, return), sân không S / u / n', () => {
      assert.ok(!m.doi, m.ma + ' có nhiều robot (gói 8)');
      for (const x of moiBai(m)) assert.ok(!dongCua(x).some((l) => /^\s*return\b/.test(l)), m.ma + ' ' + x.ten + ' dùng return (mùa 5)');
      for (const rows of dsSan(m)) assert.ok(!/[Sun]/.test(rows.join('')), m.ma + ' sân có S / u / n');
    });
    kiem(m.ma + ': hàm của em cần đã tạo ở màn trước (không của gói 8); mọi lời gọi khai trong hamCuaEmCan; hàm mới không trùng tên cốt truyện, có mục Sổ lệnh', () => {
      for (const h of m.hamCuaEmCan) {
        assert.ok(daTao.has(h) && kho.some((x) => x.ten === h), m.ma + ' cần ' + h + ' nhưng chưa màn nào trước nó tạo');
        assert.ok(!CHUONG_GOI_8.includes(noiTao.get(h)), m.ma + ' dùng hàm ' + h + ' của gói 8 Đội');
      }
      for (const x of moiBai(m)) {
        const rieng = new Set((x.b.hamCuaMan || []).concat(x.moi || []).map((h) => h.ten).concat(m.taoHam || []));
        for (const t of loiGoi(dongCua(x))) {
          if (PY.has(t) || rieng.has(t) || m.hamGoc.includes(t)) continue;
          assert.ok(m.hamCuaEmCan.includes(t), m.ma + ' ' + x.ten + ' gọi ' + t + '() mà không khai trong hamCuaEmCan');
        }
      }
      for (const t of m.taoHam || []) {
        assert.ok(!daTao.has(t), m.ma + ' tạo lại hàm đã có ' + t);
        assert.ok((m.loiGiai.hamCuaEmMoi || []).some((h) => h.ten === t), m.ma + ' taoHam ' + t + ' mà lời giải không tạo');
        const khac = M.danhSach.filter((x) => x !== m && (x.taoHam || []).includes(t)).map((x) => x.ma);
        assert.deepEqual(khac, [], m.ma + ' tên hàm ' + t + ' trùng hàm cốt truyện của màn khác');
        const sl = SL.tim(t);
        assert.ok(sl && sl.man === m.ma && sl.chuong === m.chuong && sl.nhom === 'hoi', m.ma + ' hàm mới ' + t + ' chưa có mục Sổ lệnh đúng màn / chương / nhóm hoi: ' + JSON.stringify(sl));
      }
      for (const x of m.loiGiai.hamCuaMan || []) assert.ok(!HAM_COT_TRUYEN.has(x.ten) && !kho.some((h) => h.ten === x.ten), m.ma + ' hàm của màn ' + x.ten + ' trùng hàm cốt truyện / hàm trong kho');
    });
    kiem(m.ma + ': lời giải 3 sao đúng ngưỡng, không chẩn đoán; mã mẫu chưa thắng; lời giải khác 2 sao; công thức khác thắng; lời sai thua đúng mã', () => {
      const r = cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi);
      ketQua[m.ma] = r;
      assert.ok(r.thang, m.ma + ' lời giải thua: ' + JSON.stringify(r.chanDoan.map((c) => c.ma)));
      assert.equal(r.soO, m.sao.o, m.ma + ' soO=' + r.soO + ' khai ' + m.sao.o);
      assert.equal(r.soNhip, m.sao.nhip, m.ma + ' soNhip=' + r.soNhip + ' khai ' + m.sao.nhip);
      assert.equal(r.sao, 3, m.ma + ' sao=' + r.sao);
      assert.deepEqual(r.chanDoan.map((c) => c.ma), [], m.ma + ' lời giải có chẩn đoán');
      assert.ok(r.theoSan.length === soSan(m) && r.theoSan.every((s) => s.thang));
      const rm = cham(m, m.maMau);
      assert.equal(rm.thang, false, m.ma + ' mã mẫu đã thắng sẵn');
      const rk = cham(m, m.loiGiaiKhac.baiLam, m.loiGiaiKhac.hamCuaEmMoi);
      assert.ok(rk.thang, m.ma + ' lời giải khác thua: ' + JSON.stringify(rk.chanDoan.map((c) => c.ma)));
      assert.equal(rk.sao, 2, m.ma + ' lời giải khác sao=' + rk.sao + ' (ô ' + rk.soO + ', nhịp ' + rk.soNhip + ')');
      (m.congThucKhac || []).forEach((c, i) => { const rc = cham(m, c.baiLam, c.hamCuaEmMoi); assert.ok(rc.thang, m.ma + ' công thức khác ' + i + ' "' + c.moTa + '" thua: ' + JSON.stringify(rc.chanDoan.map((x) => x.ma))); });
      m.loiSai.forEach((ls, i) => {
        const rl = cham(m, ls.baiLam, ls.hamCuaEmMoi);
        assert.equal(rl.thang, false, m.ma + ' lời sai ' + i + ' "' + ls.moTa + '" lại thắng');
        const ma = rl.chanDoan.map((c) => c.ma);
        for (const x of ls.phaiCoMa) assert.ok(ma.includes(x), m.ma + ' lời sai ' + i + ' "' + ls.moTa + '" thiếu mã ' + x + ' (có: ' + ma.join(',') + ')');
      });
      Object.assign(bang[m.ma], { o: r.soO, nhip: r.soNhip });
    });
    kiem(m.ma + ': bộ dò: so chéo với lõi; BFS bệ súng ≤ sao.nhip; CẦN bệ súng (không bệ súng: không đường nào trong sao.nhip, lời giải không 3 sao); đọc cảm biến thì lời cố định không 3 sao', () => {
      const cheo = D.kiemCheo(m, 50);
      assert.equal(cheo, '', m.ma + ': bộ mô phỏng lệch lõi: ' + cheo);
      const dl = kiemDocLap(m);
      assert.equal(dl, '', m.ma + ': ' + dl);
      const co = D.nhipNganNhat(m);
      assert.ok(co.nhip !== null && co.nhip <= m.sao.nhip, m.ma + ' BFS bệ súng ' + co.nhip + ' > sao.nhip ' + m.sao.nhip);
      bang[m.ma].bfs = co.nhip;
      const rk = cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi, { beSung: false });
      assert.ok(rk.sao < 3, m.ma + ': lời giải chạy không bệ súng vẫn 3 sao');
      bang[m.ma].loiKhong = rk.thang ? rk.sao + ' sao' : 'thua';
      const khong = D.nhipNganNhat(m, { beSung: false });
      assert.ok(!khong.catNgang, m.ma + ': BFS không bệ súng bị cắt ngang');
      bang[m.ma].khong = khong.nhip === null ? 'không tới' : khong.nhip;
      // màn khóa: đường tự do không làm được (chương trình chính khóa), nên "cần bệ súng" = không thân nào (lời giải, mọi thân cố định) được 3 sao khi không bệ súng
      const hm = (m.loiGiai.hamCuaEmMoi || [])[0] || (m.loiGiai.hamCuaMan || [])[0];
      const laMan = !(m.loiGiai.hamCuaEmMoi || []).length;
      const chamThan = (than, them) => {
        const h = Object.assign({}, hm, { than });
        return laMan ? cham(m, { chinh: m.loiGiai.chinh, hamCuaMan: [h] }, [], them) : cham(m, { chinh: m.loiGiai.chinh, hamCuaMan: m.loiGiai.hamCuaMan }, [h], them);
      };
      if (m.chinhCoDinh) {
        assert.ok(hm, m.ma + ' khóa chương trình chính mà không có hàm để viết / sửa');
        const t = D.thanCoDinh(m, kho, hm.ten, (than) => chamThan(than, { beSung: false }), { beSung: false, thamSo: hm.thamSo });
        bang[m.ma].khong += ' (khóa: ' + (t.khong ? 'không thân cố định nào 3 sao' : 'thân ' + t.than.join(' / ')) + ')';
        if (!t.khong) assert.fail(m.ma + ': không bệ súng, thân cố định ' + t.than.join(' / ') + ' vẫn 3 sao');
      } else if (soSan(m) > 1) {
        // nhiều sân: BFS từng sân riêng (cộng lại) là cận dưới quá lỏng cho MỘT chương trình chung đọc cảm biến, nên chỉ in ra; "cần bệ súng" = lời giải và lời "bù giật"
        // (thói quen xe hai bánh: thêm move() sau mỗi phát bắn tụ ra trước, back() sau mỗi phát ra sau) chạy không bệ súng đều không được 3 sao
        const bu = buGiat(m.loiGiai);
        const rb = cham(m, bu, bu.hamCuaEmMoi, { beSung: false });
        bang[m.ma].khong += ' (từng sân riêng; lời bù giật: ' + (rb.thang ? rb.sao + ' sao, ' + rb.soNhip + ' nhịp' : 'thua') + ')';
        assert.ok(rb.sao < 3, m.ma + ': lời bù giật chạy không bệ súng vẫn 3 sao');
      } else assert.ok(khong.nhip === null || khong.nhip > m.sao.nhip, m.ma + ': xích KHÔNG bệ súng vẫn kịp trong ' + khong.nhip + ' ≤ ' + m.sao.nhip + ' nhịp: ' + (khong.chuoi || []).join(' | '));
      if (soSan(m) === 1) { const hb = D.nhipNganNhat(m, { haiBanh: true }); bang[m.ma].haiBanh = hb.nhip === null ? 'không tới' : hb.nhip; }
      if (!docCamBien(m)) { bang[m.ma].ne = 'không đọc cảm biến'; return; }
      if (soSan(m) > 1) {
        const t = D.dayChung(m, m.sao.nhip);
        assert.ok(!(t && t.catNgang), m.ma + ': dò dãy chung bị cắt ngang');
        if (t) assert.fail(m.ma + ': dãy chung ' + t.nhip + ' nhịp ≤ ' + m.sao.nhip + ' thắng mọi sân không cần cảm biến: ' + t.chuoi);
        bang[m.ma].ne = 'không có dãy chung ≤ ' + m.sao.nhip + ' nhịp';
        return;
      }
      assert.ok(m.chinhCoDinh, m.ma + ': màn mở một sân không được đọc cảm biến (khóa chương trình chính hay làm trùm nhiều sân)');
      assert.ok(bacCau(kho, { chinh: [], hamCuaMan: [hm] }).dong.some((l) => /\b(distance|warm)\(\)/.test(l)), m.ma + ': thân ' + hm.ten + ' không đọc cảm biến');
      const t = D.thanCoDinh(m, kho, hm.ten, (than) => chamThan(than), { thamSo: hm.thamSo });
      bang[m.ma].ne = 'khóa: ' + (t.khong ? 'không thân cố định nào 3 sao (' + t.soThan + ' thân, ' + t.soThang + ' thắng' + (t.moDuoc ? '' : ', chấm thật tới 2 dòng') + ')' : 'thân ' + t.than.join(' / '));
      if (!t.khong) assert.fail(m.ma + ': thân ' + hm.ten + ' cố định ' + t.soO + ' ô, ' + t.soNhip + ' nhịp được 3 sao: ' + t.than.join(' / '));
    });
  }

  /* ---------------------------------------------------------------- 5. đường cong, điều mới */
  if (!CHI) {
    kiem('đường cong: dòng / nhịp / ô không tường của màn n ≤ max(1,5 × màn n−1, màn n−1 + lề), trùm miễn và không làm mốc', () => {
      for (const c of CHUONG) {
        let t = MOC[c];
        assert.ok(t, c + ': không có màn mốc');
        for (const m of DS_C[c]) {
          if (m.hang === 'trum') continue;
          const tran = (a, b, le) => a <= Math.max(1.5 * b, b + le);
          assert.ok(tran(soDong(m), soDong(t), LE.dong), m.ma + ' dòng ' + soDong(m) + ' so với ' + t.ma + ' ' + soDong(t));
          assert.ok(tran(m.sao.nhip, t.sao.nhip, LE.nhip), m.ma + ' nhịp ' + m.sao.nhip + ' so với ' + t.ma + ' ' + t.sao.nhip);
          assert.ok(tran(coSan(m), coSan(t), LE.o), m.ma + ' ô ' + coSan(m) + ' so với ' + t.ma + ' ' + coSan(t));
          t = m;
        }
      }
    });
  }
  const biet = new Set();
  for (const m of truocGoi) for (const f of dacTrung(m)) biet.add(f);
  const dieuMoi = {};
  if (!CHI) {
    kiem('mỗi màn thêm tối đa MỘT điều mới (so với mọi màn đứng trước, đặc trưng đọc từ lời giải và sân)', () => {
      const da = new Set(biet);
      for (const m of DS) {
        const moi = [...dacTrung(m)].filter((f) => !da.has(f));
        dieuMoi[m.ma] = moi;
        if (m.hang !== 'trum') assert.ok(moi.length <= 1, m.ma + ' thêm ' + moi.length + ' điều mới: ' + moi.join(', '));
        for (const f of dacTrung(m)) da.add(f);
      }
    });
    kiem('có màn đố ("Đố…") ở be-sung, màn sửa hàm lỗi ("Sửa…", hàm của màn) ở che-be-sung; che-be-sung có màn khóa tạo hàm đọc warm()', () => {
      assert.ok(DS_C['be-sung'].some((m) => /^Đố/.test(m.ten)), 'be-sung thiếu màn đố');
      assert.ok(DS_C['che-be-sung'].some((m) => /^Sửa/.test(m.ten) && (m.loiGiai.hamCuaMan || []).length), 'che-be-sung thiếu màn sửa hàm');
      assert.ok(DS_C['che-be-sung'].some((m) => m.chinhCoDinh && (m.loiGiai.hamCuaEmMoi || []).some((h) => h.than.some((l) => /warm\(\)/.test(l)))), 'che-be-sung thiếu màn khóa tạo hàm đọc warm()');
    });
  }

  /* ---------------------------------------------------------------- 7. bảng recall */
  const recall = {};
  for (const m of DS) recall[m.ma] = recallMan2(m, khoTruoc.get(m.ma), ketQua[m.ma] || cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi));
  const rc = kiemRecall2(DS, (m) => recall[m.ma]);
  if (!CHI) kiem('recall: mỗi màn ≥ 2 gói 1–7 mùa 2 (ngoài combo xích + súng hơi + bệ súng); mỗi gói 1–7 nhắc ≥ 2 lần trên gói; không hai màn liền cùng kiểu bài', () => {
    assert.deepEqual(rc.loi, []);
  });

  /* ---------------------------------------------------------------- bảng */
  console.log('\nBẢNG MÀN: số | mã | tên | kiểu bài | điều mới (yMoi) | dòng | nhịp | ô không tường | ô code | BFS bệ súng | không bệ súng | lời giải không bệ súng | hai bánh | lời cố định');
  for (const m of DS) {
    const b = bang[m.ma] || {};
    console.log([m.so, m.ma, m.ten, m.kieuBai, (dieuMoi[m.ma] || []).join(', ') + ' (yMoi: ' + m.yMoi + ')', soDong(m), m.sao.nhip, coSan(m), m.sao.o, b.bfs, b.khong, b.loiKhong, b.haiBanh === undefined ? '-' : b.haiBanh, b.ne || '?'].join(' | '));
  }
  console.log('\nBẢNG RECALL (gói 1–7 mùa 2; combo xích + súng hơi + bệ súng là ý chính, không tính):');
  console.log('mã | ' + Object.entries(GOI_RECALL_2).map(([g, t]) => g + ' ' + t).join(' | ') + ' | số gói');
  for (const m of DS) {
    const r = recall[m.ma];
    console.log(m.ma + ' | ' + Object.keys(GOI_RECALL_2).map((g) => (r.goi.has(+g) ? 'x ' + r.lyDo[g] : '.')).join(' | ') + ' | ' + r.goi.size);
  }
  console.log('số lần mỗi gói: ' + Object.entries(rc.dem).map(([g, n]) => g + ':' + n).join(' · '));
  if (LOI_GIA) {
    const doDu = LOI_GIA_DS.every((x) => hongMuc.some((t) => t.startsWith(x)));
    console.log('Lỗi giả: cắm ' + LOI_GIA_DS.length + ', mục đỏ ' + hongMuc.length + ' → ' + (doDu ? 'ĐỎ ĐỦ' : 'THIẾU: ' + LOI_GIA_DS.filter((x) => !hongMuc.some((t) => t.startsWith(x))).join('; ')));
    process.exit(doDu ? 0 : 1);
  }
  console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra ' + DS.length + ' màn gói Bệ súng xích.');
  if (hong) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

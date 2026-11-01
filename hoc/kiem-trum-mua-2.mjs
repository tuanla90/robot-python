/* ============================================================================
   kiem-trum-mua-2.mjs — máy kiểm 20 màn mới của mùa 2, gói 10 "Xe cứu hỏa R1 xuất xưởng" (man-trum-mua-2.js): chương `tong-hop-2` "Dập lửa" và `trum-mua-2` "Chế lệnh: dập lửa".
   Màn 10 mỗi chương là trùm có huy hiệu (tong-hop-2, nha-may-chay: trùm cuối mùa 2).
   PDM2c2 (31/10, brief hoc/ban-giao/brief-PDM2c2-mua-2-goi-10.md): gói 10 "R1 chạy một mình, nhiều sân" như gói 10 mùa 1 (PDM1): MỌI màn MỘT robot xe cứu hỏa đầy đủ
   (xích + vòi phun + hồng ngoại; xichDay + lucBan; KHÔNG beSung), MỌI màn 2–3 sân ("ngày làm việc"), lời giải đọc cảm biến thắng mọi ngày, ≥ 1 lời sai viết cứng (loiSai.cung).
   1. Vị trí: gói nha-may-chay (mùa 2) có hai chương tong-hop-2, trum-mua-2; mỗi chương đúng 10 màn mới theo `so`, hạng lam-quen ×3 · luyen ×3 · bien-the ×3 · trum;
      tong-hop-2.1 đứng ngay sau màn cuối của gói 9 (che-doi-mua-2.10), trum-mua-2.1 ngay sau tong-hop-2.10; trùm mang huy hiệu (huy-hieu.js có hình), màn khác không mang.
   2. Từng màn: đủ trường (cả kieuBai, ≥ 2 lời sai có phaiCoMa, ≥ 1 lời sai cung); XÍCH gắn VÒI PHUN + mắt hồng ngoại (khay có distance + warm), xichDay + lucBan, KHÔNG beSung,
      KHÔNG màn hai robot; 2–3 sân, mọi màn nhipTheo 'tong' (tổng nhịp mọi ngày: với ngưỡng theo ngày dài nhất, dãy cố định viết cho ngày khó nhất 3 sao mọi ngày); lời giải thắng 3 sao mọi sân, đúng sao.o / sao.nhip,
      KHÔNG chẩn đoán ngoài mức thông tin; mã mẫu chưa thắng; lời giải khác đúng 2 sao; công thức khác thắng; lời sai thua và có đủ mã phaiCoMa; chữ hiển thị không emoji, không gạch dài.
   3. Hàm của em: mọi hàm màn cần đã được tạo ở màn đứng trước, mọi lời gọi khai trong hamCuaEmCan; hàm mới (taoHam) không trùng hàm cốt truyện nào, có mục Sổ lệnh đúng màn / chương,
      nhóm hoi; hàm của màn không trùng hàm cốt truyện / hàm trong kho.
   4. Không dùng thứ lạ: return (mùa 5); sân không S / u / n; không nút đè M (bộ dò gói 9 không mô phỏng).
   5. Đường cong (mỗi chương): dòng lời giải / nhịp / số ô không tường của màn n ≤ max(1,5 × màn n−1, màn n−1 + lề) (lề +3 dòng, +4 nhịp, +6 ô), trùm được miễn và
      không làm mốc (tong-hop-2.1 so với màn không trùm cuối cùng đứng trước nó, trum-mua-2.1 so với tong-hop-2.9); mỗi màn thêm TỐI ĐA MỘT điều mới;
      mỗi chương có màn đố hay sửa hàm; chương trum-mua-2 có màn sửa hàm, màn tạo hàm của em, trùm cuối ≥ 2 sân.
   6. Bộ dò (do-duong-trum-mua-2.mjs): so chéo lõi; tổng BFS các sân ≤ sao.nhip; lời đẩy thùng chạy không xichDay phải thua; mọi màn đọc cảm biến;
      không dãy chung (không cảm biến) nào thắng mọi sân trong tổng sao.nhip.
   7. BẢNG RECALL (KE-HOACH-MUA-1.md "Đường cong học và recall"): mỗi màn đánh dấu gói 1–9 mùa 2 được dùng, đọc từ lời giải (bắc cầu qua hàm của em / hàm của màn), sân và lần chạy:
      gói 1–7 như kiem-be-sung.mjs (recallMan2); gói 8 Góc kho cũ = gọi hàm của gói 8 (pad_open, fence_shot…) hay sân có hàng rào = / thùng gỗ o / nút đè M;
      gói 9 Đội "R2 trở lại" = gọi hàm của gói 9 (wait_clear, step_clear…) hay lời giải CHỜ BẰNG CẢM BIẾN (while distance() / warm() …: wait()).
      Luật: (a) mỗi màn ≥ 2 gói; (b) trong gói 10 mỗi gói 1–8 được nhắc ≥ 3 lần, gói 9 ≥ 2 lần (như PDM1 hạ ngưỡng gói Đội mùa 1: gói 10 không còn đội);
      (c) gộp gói 9 + 10 (40 màn) mỗi gói 1–8 ≥ 3 lần; (d) không hai màn liền nhau cùng kiểu bài (kieuBai). In bảng recall 20 màn + tổng gộp gói 9 + 10.
   30/10 GÓI LỬA (hoc/KE-HOACH-GOI-LUA.md): chương tong-hop-2 thành "Dập lửa" (cfg.lua; bộ dò do-duong-be-sung.mjs mô phỏng lửa). Mục tiêu dap-lua được phép; đặc trưng
   'lua' (sân có lửa) tính là điều mới; màn trình diễn (chiChay, tong-hop-2.1) như kiem-be-sung.mjs: mã mẫu khoá phải thắng 3 sao, lời giải khác / công thức khác / lời sai
   chấm trên bản không khoá, miễn đường cong và không làm mốc.
   Chạy: node hoc/kiem-trum-mua-2.mjs              (trượt thì thoát mã 1)
         node hoc/kiem-trum-mua-2.mjs --loi-gia    (cắm lỗi giả: các mục bị cắm phải ĐỎ; thoát 0 khi đỏ đủ)
         node hoc/kiem-trum-mua-2.mjs --chi=tong-hop-2.3,tong-hop-2.4   (chỉ kiểm từng màn cho các mã này)
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { GOI_RECALL_2, recallMan2 } from './kiem-be-sung.mjs';
import { doMan, docCamBien, dongBacCau, suKienCua } from './do-duong-trum-mua-2.mjs';
import { coHinhRieng } from './huy-hieu-ds.mjs';   // V7c1: danh sách mã huy hiệu từ dữ liệu bộ vector (không regex huy-hieu.js pixel)

const require = createRequire(import.meta.url);
const clone = (x) => JSON.parse(JSON.stringify(x));
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const soSan = (m) => dsSan(m).length;
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.replace(/#.*$/, '').replace(/"[^"]*"/g, '""').matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }

/* ================================================================== RECALL gói 1–9 mùa 2 */
export const GOI_RECALL_10 = Object.assign({}, GOI_RECALL_2, { 8: 'góc kho cũ', 9: 'đội: chờ bằng cảm biến' });
const HAM_GOI_8 = ['pad_open', 'fence_shot', 'hold_shot', 'pass_crate', 'fence_at', 'scan_pads', 'warm_pad'];
const HAM_GOI_9 = ['wait_clear', 'yield_step', 'wait_mate', 'pass_mate', 'clear_squirt', 'step_clear', 'cover', 'guard'];
/** Gói 1–9 mà lời giải màn m dùng: { goi: Set<số>, lyDo }. chay = kết quả cham lời giải. Màn đội (gói 9 gộp): chương trình hai xe gộp làm chinh cho recallMan2. */
export function recallMan10(m, kho, chay) {
  const lg = m.doi ? Object.assign({}, m.loiGiai, { chinh: (m.loiGiai.doi || []).flatMap((d) => d.chinh || []) }) : m.loiGiai;
  const r = recallMan2(m.doi ? Object.assign({}, m, { loiGiai: lg }) : m, kho, chay);
  const dat = (n, s) => { if (!r.goi.has(n)) { r.goi.add(n); r.lyDo[n] = s; } };
  const { goi: L, dong } = dongBacCau(kho, m.loiGiai);
  const co = (ds) => ds.filter((t) => L.has(t));
  const chu = dsSan(m).map((s) => s.join('')).join('');
  if (co(HAM_GOI_8).length) dat(8, co(HAM_GOI_8).join('/'));
  else if (/[=oM]/.test(chu)) dat(8, /=/.test(chu) ? 'hàng rào' : /o/.test(chu) ? 'thùng gỗ' : 'nút đè');
  if (m.doi) dat(9, 'hai robot' + (co(HAM_GOI_9).length ? ' + ' + co(HAM_GOI_9).join('/') : ''));
  else if (co(HAM_GOI_9).length) dat(9, co(HAM_GOI_9).join('/'));
  else if (dong.some((l, i) => /^\s*while\b.*\b(distance|warm)\(\)/.test(l) && /^\s*wait\(\)\s*$/.test(dong[i + 1] || ''))) dat(9, 'chờ bằng cảm biến');
  return r;
}

/* ================================================================== máy kiểm gói 10 */
async function main() {
  const Cham = require('./cham.js');
  const M = require('./lo-trinh-hoc.js');
  const TT = require('./thu-tu-chuong.js');
  const SL = require('./so-lenh.js');
  const LOI_GIA = process.argv.includes('--loi-gia');
  const CHI = (process.argv.find((a) => a.startsWith('--chi=')) || '').slice(6);

  let dat = 0, hong = 0;
  const hongMuc = [];
  const kiem = (ten, fn) => { try { fn(); dat++; } catch (e) { hong++; hongMuc.push(ten); console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); } };

  const CHUONG = ['tong-hop-2', 'trum-mua-2'];
  const HUY_HIEU = { 'tong-hop-2': 'tong-hop-2', 'trum-mua-2': 'nha-may-chay' };
  const LE = { dong: 3, nhip: 4, o: 6 };
  const get = (ma) => M.timMa(ma);
  const goiMua2 = TT.goi.filter((g) => g.mua === 'mua-2');
  const goi = goiMua2.find((g) => g.ma === 'nha-may-chay');
  const DS_C = Object.fromEntries(CHUONG.map((c) => [c, M.danhSach.filter((m) => m.chuong === c)]));
  const DS = CHUONG.flatMap((c) => DS_C[c]);
  const DS9 = M.danhSach.filter((m) => ['doi-mua-2', 'che-doi-mua-2'].includes(m.chuong));     // PDM2c: gói 9 mùa 2 là Đội "R2 trở lại"
  const viTri = (m) => M.danhSach.indexOf(m);
  const truocGoi = M.danhSach.slice(0, DS.length ? viTri(DS[0]) : 0);
  const MOC = { 'tong-hop-2': [...truocGoi].reverse().find((m) => m.hang !== 'trum'), 'trum-mua-2': DS_C['tong-hop-2'][8] };

  /* ---------------------------------------------------------------- lỗi giả (--loi-gia): mỗi lỗi làm đỏ một mục */
  const LOI_GIA_DS = [];
  if (LOI_GIA) {
    const a = get('tong-hop-2.1'), b = get('tong-hop-2.3'), c = get('tong-hop-2.4');
    a.sao = Object.assign({}, a.sao, { nhip: a.sao.nhip - 1 }); LOI_GIA_DS.push('tong-hop-2.1: lời giải');             // ngưỡng nhịp sai → lời giải chỉ 2 sao
    b.loiSai[0].phaiCoMa = ['vat-vo']; LOI_GIA_DS.push('tong-hop-2.3: lời giải');                                      // lời sai thiếu mã
    b.hamCuaEmCan = b.hamCuaEmCan.concat(['fly_home']); LOI_GIA_DS.push('tong-hop-2.3: hàm của em');                   // hàm chưa ai tạo
    c.xichDay = false; LOI_GIA_DS.push('tong-hop-2.4: đủ trường');                                                      // quên cờ xích đẩy thùng
    const d = get('tong-hop-2.7'); d.sao = Object.assign({}, d.sao, { nhip: d.sao.nhip + 30 }); LOI_GIA_DS.push('tong-hop-2.7: bộ dò');   // ngưỡng nhịp lỏng: dãy cố định thắng mọi ngày (hay dò bị cắt ngang)
    const t = DS.find((m) => m.hang === 'trum'); if (t) { t.huyHieu = null; LOI_GIA_DS.push('huy hiệu'); }
    const e = DS.find((m) => (m.taoHam || []).length); if (e) { e.taoHam = ['sweep']; LOI_GIA_DS.push(e.ma + ': hàm của em'); }   // trùng hàm cốt truyện che-lap.5
    get('tong-hop-2.2').kieuBai = get('tong-hop-2.1').kieuBai; LOI_GIA_DS.push('recall');                              // hai màn liền cùng kiểu bài
    const f = get('tong-hop-2.5'); f.san = f.san.map((rows) => rows.map((r, i) => (i === 1 ? r.replace('.', 'M') : r))); LOI_GIA_DS.push('tong-hop-2.5: không dùng');   // nút đè M
  }

  /* ---------------------------------------------------------------- kho hàm của em theo thứ tự lộ trình */
  const khoTruoc = new Map(), daTaoTruoc = new Map();
  {
    const kho = new Map(), daTao = new Set();
    for (const m of M.danhSach) {
      khoTruoc.set(m.ma, clone([...kho.values()]));
      daTaoTruoc.set(m.ma, new Set(daTao));
      if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
      for (const t of (m.taoHam || []).concat((m.loiGiai.hamCuaEmMoi || []).map((h) => h.ten))) daTao.add(t);
    }
  }
  function cham(m, b, moi, them) {
    const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, clone(h)]));
    for (const h of moi || []) hs.set(h.ten, clone(h));
    return Cham.cham(Object.assign({}, m, them || {}), b, [...hs.values()]);
  }
  const PY = new Set(['range', 'print', 'len']);
  /** Hàm của em mới của một lời (màn thường: x.hamCuaEmMoi; màn đội: nằm trong x.baiLam; chuanHoa để [] nên không dùng ||). */
  const hamMoiCua = (x) => ((x.hamCuaEmMoi && x.hamCuaEmMoi.length) ? x.hamCuaEmMoi : (x.baiLam && x.baiLam.hamCuaEmMoi) || []);
  function moiBai(m) {
    const ds = [{ ten: 'maMau', b: m.maMau, moi: [] }, { ten: 'loiGiai', b: m.loiGiai, moi: m.loiGiai.hamCuaEmMoi }];
    if (m.loiGiaiKhac) ds.push({ ten: 'loiGiaiKhac', b: m.loiGiaiKhac.baiLam, moi: hamMoiCua(m.loiGiaiKhac) });
    (m.congThucKhac || []).forEach((c, i) => ds.push({ ten: 'congThucKhac[' + i + ']', b: c.baiLam, moi: hamMoiCua(c) }));
    m.loiSai.forEach((ls, i) => ds.push({ ten: 'loiSai[' + i + ']', b: ls.baiLam, moi: hamMoiCua(ls) }));
    return ds;
  }
  const dongCua = (x) => [...(x.b.chinh || []), ...(x.b.doi || []).flatMap((d) => d.chinh || []), ...(x.b.hamCuaMan || []).concat(x.moi || []).flatMap((h) => h.than)];
  /** Số dòng người chơi viết / sửa: chương trình chính (trừ khi khóa; màn đội: các xe không khóa) + thân hàm mới + thân hàm của màn. */
  const soDong = (m) => (m.doi ? m.loiGiai.doi.filter((d, i) => !m.doi[i].coDinh).reduce((s, d) => s + d.chinh.length, 0) : (m.chinhCoDinh ? 0 : m.loiGiai.chinh.length)) + (m.loiGiai.hamCuaMan || []).filter((h) => !h.capCu).concat(m.loiGiai.hamCuaEmMoi || []).reduce((s, h) => s + h.than.length, 0);   // màn mốc (che-doi-mua-2.9) là màn đội
  const coSan = (m) => Math.max(...dsSan(m).map((rows) => rows.join('').replace(/#/g, '').length));

  /* ---------------------------------------------------------------- đặc trưng (điều mới) của một màn, đọc từ lời giải và sân (như kiem-be-sung.mjs, thêm hai robot) */
  const RE_SO_SANH = /(<=|>=|==|!=|<|>)\s*(\d+|[A-Za-z_]\w*)/g;
  function dacTrung(m) {
    const lg = m.loiGiai, moi = lg.hamCuaEmMoi || [], cuaMan = lg.hamCuaMan || [];
    const dong = [...(lg.chinh || []), ...(lg.doi || []).flatMap((d) => d.chinh || []), ...cuaMan.concat(moi).flatMap((h) => h.than)];
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
      if (/\b(spray|spray_back|squirt|squirt_back)\("(low|high)"\)/.test(l)) f.add('luc ban');
      if (/\b(spray_back|squirt_back|jet_fwd)\(/.test(l)) f.add('ban sau');
    }
    for (const h of moi.concat(cuaMan)) {
      if (h.thamSo.length && h.than.some((l) => new RegExp('\\((' + h.thamSo.join('|') + ')\\)').test(l) && /\b(spray|spray_back|squirt|squirt_back)\(/.test(l))) f.add('tham so luc');
      if (h.than.some((l) => /distance\(\)/.test(l)) && h.than.some((l) => /\b(spray|squirt)\w*\(/.test(l))) f.add('chon luc theo distance');
      if (h.than.some((l) => /warm\(\)/.test(l))) f.add('ham doc warm');
    }
    for (const h of moi) {
      f.add(h.thamSo.length > 1 ? 'tao ham hai tham so' : h.thamSo.length ? 'tao ham co tham so' : 'tao ham');
      const goiKho = [...loiGoi(h.than)].filter((t) => kho.has(t));
      if (goiKho.length) f.add('ham goi ham');
      if (h.than.some((l) => /^\s*for\b/.test(l))) f.add('for trong ham');
      if (h.than.some((l) => /^\s*while\b/.test(l))) f.add('while trong ham');
    }
    if (cuaMan.length) f.add(m.chinhCoDinh || m.doi ? 'chuong trinh khoa' : 'ham cua man');
    if (m.chinhCoDinh) f.add('chuong trinh khoa');
    if (m.doi) f.add('hai robot');
    if (m.mucTieu) f.add('muc tieu ' + m.mucTieu);
    if (m.lua && [].concat(m.lua).flat().length) f.add('lua');
    if (m.lucBan || (m.doi || []).some((d) => d.lucBan)) f.add('luc ban');
    if (m.xichDay || (m.doi || []).some((d) => d.xichDay)) f.add('xich day');
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
  kiem('gói nha-may-chay (mùa 2): hai chương tong-hop-2, trum-mua-2; mỗi chương 10 màn mới đúng so và hạng; nối đúng chỗ trong lộ trình', () => {
    assert.ok(goi && goi.mua === 'mua-2', 'không thấy gói nha-may-chay ở mùa 2');
    assert.deepEqual(goi.chuong, CHUONG);
    for (const c of CHUONG) {
      const ds = DS_C[c];
      assert.deepEqual(ds.map((m) => m.ma), Array.from({ length: 10 }, (_, i) => c + '.' + (i + 1)), c);
      assert.deepEqual(ds.map((m) => m.hang), ds.map((_, i) => (i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum')), c + ' hạng');
    }
    assert.equal((M.manTrumMua2 || []).length, 20, 'ManHoc.manTrumMua2 phải có 20 màn');
    const cuoi9 = get('che-doi-mua-2.10');     // PDM2c 31/10: gói 9 là Đội (Bệ vòi xích cất)
    assert.equal(viTri(DS_C['tong-hop-2'][0]), viTri(cuoi9) + 1, 'tong-hop-2.1 phải đứng ngay sau che-doi-mua-2.10');
    assert.equal(viTri(DS_C['trum-mua-2'][0]), viTri(get('tong-hop-2.10')) + 1, 'trum-mua-2.1 phải đứng ngay sau tong-hop-2.10');
    assert.equal(goiMua2[goiMua2.length - 1], goi, 'nha-may-chay phải là gói cuối mùa 2');
  });
  kiem('tên màn không trùng trong gói và không trùng màn khác của lộ trình', () => {
    const ten = DS.map((m) => m.ten);
    assert.equal(new Set(ten).size, ten.length, 'trùng tên: ' + ten.filter((t, i) => ten.indexOf(t) !== i));
    const cu = M.danhSach.filter((m) => !CHUONG.includes(m.chuong)).map((m) => m.ten);
    for (const t of ten) assert.ok(!cu.includes(t), 'tên "' + t + '" trùng một màn khác');
  });
  kiem('huy hiệu: chỉ trùm mang, đúng mã (tong-hop-2, nha-may-chay); huy-hieu.js có hình', () => {
    for (const c of CHUONG) {
      const ds = DS_C[c], trum = ds[ds.length - 1];
      assert.equal(trum && trum.hang, 'trum', c + ': chưa có trùm');
      assert.equal(trum.huyHieu && trum.huyHieu.ma, HUY_HIEU[c], c + ': trùm thiếu huy hiệu ' + HUY_HIEU[c]);
      assert.ok(trum.huyHieu.ten && !/[—]/.test(trum.huyHieu.ten));
      for (const m of ds.slice(0, -1)) assert.ok(!m.huyHieu, m.ma + ' không phải trùm mà có huy hiệu');
      assert.ok(coHinhRieng(HUY_HIEU[c]), "huy-hieu-vector.js thiếu hình huy hiệu '" + HUY_HIEU[c] + "'");
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
    kiem(m.ma + ': đủ trường, xe cứu hỏa đầy đủ (xích + vòi phun + mắt, xichDay, lucBan, không beSung), một robot, 2–3 sân, ≥ 1 lời sai viết cứng', () => {
      for (const k of ['ten', 'deBai', 'san', 'batDau', 'mucTieu', 'hamGoc', 'robot', 'sao', 'maMau', 'loiGiai', 'loiGiaiKhac', 'goiY', 'hamCuaEmCan', 'yMoi', 'kieuBai']) assert.ok(m[k] !== undefined && m[k] !== '', m.ma + ' thiếu ' + k);
      assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất 2 lời sai');
      for (const ls of m.loiSai) assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
      assert.ok(m.loiSai.some((ls) => ls.cung && /cứng|cố định|nguyên/.test(ls.moTa)), m.ma + ' cần ≥ 1 lời sai viết cứng (cung: true, mô tả nói rõ đếm cứng / cố định)');
      assert.ok(m.goiY.length >= 1);
      assert.equal(m.loaiRobot, 'xich');
      assert.equal(m.robot.than, 'xich');
      assert.equal(m.robot.tay, 'hoi', m.ma + ' tay ' + m.robot.tay);
      assert.ok(!m.beSung, m.ma + ' còn beSung (Bệ vòi xích đã cất khỏi mùa 2)');
      assert.ok(!m.doi, m.ma + ' gói 10 không còn màn hai robot (đội chỉ ở gói 9)');
      for (const h of ['spray', 'spray_back', 'distance', 'warm']) assert.ok(m.hamGoc.includes(h), m.ma + ' khay thiếu ' + h);
      assert.equal(m.xichDay, true, m.ma + ' thiếu xichDay: true');
      assert.equal(m.lucBan, true, m.ma + ' thiếu lucBan: true');
      assert.deepEqual((m.robot.camBien || []).map((c) => c.ma), ['hong-ngoai'], m.ma + ' robot phải gắn mắt hồng ngoại');
      assert.ok(['toi-co', 'bong-mo', 'day-thung', 'dap-lua'].includes(m.mucTieu), m.ma + ' mục tiêu ' + m.mucTieu);
      assert.ok(soSan(m) >= 2 && soSan(m) <= 3, m.ma + ' gói chạy một mình: mỗi màn 2–3 sân, có ' + soSan(m));
      assert.ok(Array.isArray(m.batDau) && m.batDau.length === soSan(m), m.ma + ' batDau phải là mảng song song với san');
      assert.equal(m.nhipTheo, 'tong', m.ma + ' nhiều sân phải tính tổng nhịp mọi ngày');
      for (const s of ['ten', 'deBai', 'veMaMau', 'yMoi']) if (m[s]) assert.ok(!/—|\p{Extended_Pictographic}/u.test(m[s]), m.ma + ' ' + s + ' có gạch dài / emoji');
      for (const s of m.goiY.concat(m.loiSai.map((x) => x.moTa), [m.loiGiaiKhac.moTa], (m.congThucKhac || []).map((x) => x.moTa))) assert.ok(!/—|\p{Extended_Pictographic}/u.test(s), m.ma + ' chữ có gạch dài / emoji: ' + s);
      if (m.hang === 'trum') assert.ok(m.huyHieu, m.ma + ' trùm thiếu huy hiệu');
    });
    kiem(m.ma + ': không dùng thứ lạ (return), sân không S / u / n, không nút đè M', () => {
      for (const x of moiBai(m)) assert.ok(!dongCua(x).some((l) => /^\s*return\b/.test(l)), m.ma + ' ' + x.ten + ' dùng return (mùa 5)');
      for (const rows of dsSan(m)) assert.ok(!/[SunM]/.test(rows.join('')), m.ma + ' sân có S / u / n / M');
    });
    kiem(m.ma + ': hàm của em cần đã tạo ở màn trước; mọi lời gọi khai trong hamCuaEmCan; hàm mới không trùng tên cốt truyện, có mục Sổ lệnh', () => {
      for (const h of m.hamCuaEmCan) assert.ok(daTao.has(h) && kho.some((x) => x.ten === h), m.ma + ' cần ' + h + ' nhưng chưa màn nào trước nó tạo');
      const hgDoi = new Set((m.doi || []).flatMap((d) => d.hamGoc || []));
      for (const x of moiBai(m)) {
        const rieng = new Set((x.b.hamCuaMan || []).concat(x.moi || []).map((h) => h.ten).concat(m.taoHam || []));
        for (const t of loiGoi(dongCua(x))) {
          if (PY.has(t) || rieng.has(t) || m.hamGoc.includes(t) || hgDoi.has(t)) continue;
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
      // PDM2b 31/10: hàm của màn capCu là bản cũ của hàm gói Đội (cất khỏi mùa 2, chờ PDM2c dựng gói 9) cấp lại cho gói 10: không tính trùng
      for (const x of (m.loiGiai.hamCuaMan || []).filter((h) => !h.capCu)) assert.ok(!HAM_COT_TRUYEN.has(x.ten) && !kho.some((h) => h.ten === x.ten), m.ma + ' hàm của màn ' + x.ten + ' trùng hàm cốt truyện / hàm trong kho');
    });
    kiem(m.ma + ': lời giải 3 sao đúng ngưỡng, không chẩn đoán; mã mẫu chưa thắng; lời giải khác 2 sao; công thức khác thắng; lời sai thua đúng mã', () => {
      const r = cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi);
      ketQua[m.ma] = r;
      assert.ok(r.thang, m.ma + ' lời giải thua: ' + JSON.stringify(r.chanDoan.map((c) => c.ma)));
      assert.equal(r.soO, m.sao.o, m.ma + ' soO=' + r.soO + ' khai ' + m.sao.o);
      assert.equal(r.soNhip, m.sao.nhip, m.ma + ' soNhip=' + r.soNhip + ' khai ' + m.sao.nhip);
      assert.equal(r.sao, 3, m.ma + ' sao=' + r.sao);
      assert.deepEqual(r.chanDoan.filter((c) => c.muc !== 'thong-tin').map((c) => c.ma), [], m.ma + ' lời giải có chẩn đoán (ngoài thông tin)');
      assert.ok(r.theoSan.length === soSan(m) && r.theoSan.every((s) => s.thang));
      const rm = cham(m, m.maMau);
      if (m.chiChay) assert.ok(rm.thang && rm.sao === 3 && m.chinhCoDinh, m.ma + ' màn trình diễn: mã mẫu khoá phải thắng 3 sao');    // gói lửa: tong-hop-2.1 trình diễn
      else assert.equal(rm.thang, false, m.ma + ' mã mẫu đã thắng sẵn');
      const mMo = m.chiChay ? Object.assign({}, m, { chiChay: false, chinhCoDinh: false }) : m;      // màn trình diễn: lời khác / lời sai chấm trên bản không khoá
      const xs = moiBai(m);
      const rk = cham(mMo, xs[2].b, xs[2].moi);
      assert.ok(rk.thang, m.ma + ' lời giải khác thua: ' + JSON.stringify(rk.chanDoan.map((c) => c.ma)));
      assert.equal(rk.sao, 2, m.ma + ' lời giải khác sao=' + rk.sao + ' (ô ' + rk.soO + ', nhịp ' + rk.soNhip + ')');
      for (const x of xs.filter((x) => x.ten.startsWith('congThucKhac'))) { const rc = cham(mMo, x.b, x.moi); assert.ok(rc.thang, m.ma + ' ' + x.ten + ' thua: ' + JSON.stringify(rc.chanDoan.map((y) => y.ma))); }
      xs.filter((x) => x.ten.startsWith('loiSai')).forEach((x, i) => {
        const rl = cham(mMo, x.b, x.moi), ls = m.loiSai[i];
        assert.equal(rl.thang, false, m.ma + ' lời sai ' + i + ' "' + ls.moTa + '" lại thắng');
        const ma = rl.chanDoan.map((c) => c.ma);
        for (const y of ls.phaiCoMa) assert.ok(ma.includes(y), m.ma + ' lời sai ' + i + ' "' + ls.moTa + '" thiếu mã ' + y + ' (có: ' + ma.join(',') + ')');
      });
      Object.assign(bang[m.ma], { o: r.soO, nhip: r.soNhip });
    });
    kiem(m.ma + ': bộ dò: so chéo lõi; tổng BFS ≤ sao.nhip; lời đẩy thùng cần xichDay; đọc cảm biến; không dãy chung nào thắng mọi sân trong ngưỡng', () => {
      const { bang: b, loi } = doMan(m, kho, cham);
      Object.assign(bang[m.ma], b);
      assert.deepEqual(loi, []);
    });
  }

  /* ---------------------------------------------------------------- 5. đường cong, điều mới, cơ cấu gói */
  if (!CHI) {
    kiem('đường cong: dòng / nhịp / ô không tường của màn n ≤ max(1,5 × màn n−1, màn n−1 + lề), trùm miễn và không làm mốc', () => {
      for (const c of CHUONG) {
        let t = MOC[c];
        assert.ok(t, c + ': không có màn mốc');
        for (const m of DS_C[c]) {
          if (m.hang === 'trum' || m.chiChay) continue;                         // trùm và màn trình diễn miễn, không làm mốc
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
    kiem('cơ cấu: mỗi chương có màn đố ("Đố…") hay sửa hàm ("Sửa…"); không màn hai robot; trum-mua-2 có màn sửa hàm, màn tạo hàm của em, trùm cuối ≥ 2 sân', () => {
      for (const c of CHUONG) assert.ok(DS_C[c].some((m) => /^(Đố|Sửa)/.test(m.ten)), c + ' thiếu màn đố / sửa hàm');
      assert.equal(DS.filter((m) => m.doi).length, 0, 'gói 10 không còn màn hai robot');
      assert.ok(DS_C['trum-mua-2'].some((m) => /^Sửa/.test(m.ten) && ((m.loiGiai.hamCuaMan || []).length || (m.loiGiai.hamCuaEmMoi || []).length)), 'trum-mua-2 thiếu màn sửa hàm');
      assert.ok(DS_C['trum-mua-2'].some((m) => (m.taoHam || []).length), 'trum-mua-2 thiếu màn tạo hàm của em');
      const cuoi = DS_C['trum-mua-2'][9];
      assert.ok(cuoi && soSan(cuoi) >= 2, 'trùm cuối mùa phải ≥ 2 sân');
    });
  }

  /* ---------------------------------------------------------------- 7. bảng recall gói 10 + gộp gói 9 + 10 */
  const recall = {};
  for (const m of DS) recall[m.ma] = recallMan10(m, khoTruoc.get(m.ma), ketQua[m.ma] || cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi));
  const recall9 = {};
  for (const m of DS9) recall9[m.ma] = recallMan10(m, khoTruoc.get(m.ma), cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi));
  const dem10 = {}, dem910 = {};
  for (let g = 1; g <= 9; g++) { dem10[g] = DS.filter((m) => recall[m.ma].goi.has(g)).length; dem910[g] = dem10[g] + DS9.filter((m) => recall9[m.ma].goi.has(g)).length; }
  const NGUONG_10 = { 9: 2 };      // PDM2c2: gói 9 Đội chỉ cần ≥ 2 lần trong gói 10 (gói 10 không còn đội; như PDM1 hạ ngưỡng gói Đội mùa 1)
  if (!CHI) kiem('recall: mỗi màn ≥ 2 gói; trong gói 10 mỗi gói 1–8 ≥ 3 lần, gói 9 ≥ 2; gộp gói 9 + 10 mỗi gói 1–8 ≥ 3 lần; không hai màn liền cùng kiểu bài', () => {
    const loi = [];
    DS.forEach((m, i) => {
      if (recall[m.ma].goi.size < 2) loi.push(m.ma + ': chỉ recall ' + recall[m.ma].goi.size + ' gói');
      if (i > 0 && m.kieuBai === DS[i - 1].kieuBai) loi.push(m.ma + ' cùng kiểu bài "' + m.kieuBai + '" với màn liền trước ' + DS[i - 1].ma);
    });
    for (let g = 1; g <= 9; g++) if (dem10[g] < (NGUONG_10[g] || 3)) loi.push('gói ' + g + ' (' + GOI_RECALL_10[g] + ') trong gói 10 chỉ được nhắc ' + dem10[g] + ' lần (cần ≥ ' + (NGUONG_10[g] || 3) + ')');
    for (let g = 1; g <= 8; g++) if (dem910[g] < 3) loi.push('gói ' + g + ' gộp gói 9 + 10 chỉ ' + dem910[g] + ' lần (cần ≥ 3)');
    assert.deepEqual(loi, []);
  });

  /* ---------------------------------------------------------------- bảng */
  console.log('\nBẢNG MÀN: số | mã | tên | kiểu bài | điều mới (yMoi) | dòng | sân | nhịp | ô không tường | ô code | BFS từng sân | cần xích đẩy | dãy chung');
  for (const m of DS) {
    const b = bang[m.ma] || {};
    console.log([m.so, m.ma, m.ten, m.kieuBai, (dieuMoi[m.ma] || []).join(', ') + ' (yMoi: ' + m.yMoi + ')', soDong(m), soSan(m), m.sao.nhip, coSan(m), m.sao.o, b.bfs === undefined ? '-' : b.bfs, b.canXichDay || '?', b.ne || '?'].join(' | '));
  }
  console.log('\nBẢNG RECALL gói 10 (gói 1–9 mùa 2):');
  console.log('mã | ' + Object.entries(GOI_RECALL_10).map(([g, t]) => g + ' ' + t).join(' | ') + ' | số gói');
  for (const m of DS) {
    const r = recall[m.ma];
    console.log(m.ma + ' | ' + Object.keys(GOI_RECALL_10).map((g) => (r.goi.has(+g) ? 'x ' + r.lyDo[g] : '.')).join(' | ') + ' | ' + r.goi.size);
  }
  console.log('số màn nhắc mỗi gói, gói 10: ' + Object.entries(dem10).map(([g, n]) => g + ':' + n).join(' · '));
  console.log('số màn nhắc mỗi gói, gộp gói 9 + 10 (40 màn): ' + Object.entries(dem910).map(([g, n]) => g + ':' + n).join(' · '));
  if (LOI_GIA) {
    const doDu = LOI_GIA_DS.every((x) => hongMuc.some((t) => t.startsWith(x)));
    console.log('Lỗi giả: cắm ' + LOI_GIA_DS.length + ', mục đỏ ' + hongMuc.length + ' → ' + (doDu ? 'ĐỎ ĐỦ' : 'THIẾU: ' + LOI_GIA_DS.filter((x) => !hongMuc.some((t) => t.startsWith(x))).join('; ')));
    process.exit(doDu ? 0 : 1);
  }
  console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra ' + DS.length + ' màn gói Xe cứu hỏa R1 xuất xưởng.');
  if (hong) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

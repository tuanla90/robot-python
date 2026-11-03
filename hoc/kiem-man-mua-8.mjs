/* ============================================================================
   kiem-man-mua-8.mjs — máy kiểm MÀN mùa 8 Hang động (KE-HOACH-MUA-8.md, P3). Chạy: node hoc/kiem-man-mua-8.mjs [chương ...]
   1. CHẤM: lời giải thắng 3 sao, đúng ngưỡng sao.o / sao.nhip; mã mẫu chưa thắng (trừ chiChay); ≥ 2 lời sai, mỗi lời sai không 3 sao và có đủ mã chẩn đoán;
      lời giải khác (nếu có) thắng; hàm cần dùng đã có trong kho.
   2. CHỮ: không gạch dài; không chữ vũ khí; gọi người chơi là "bạn" (không "em"); đề mở bằng "Giúp Sola", "Sola làm mẫu" hay "Sola viết vội";
      gợi ý mở bằng "Luna: ".
   3. KHAY: mọi dòng của lời giải / mã mẫu / lời sai / lời giải khác lắp được bằng khay của chính màn đó: lời gọi hàm có trên khay với đối số chạm được
      (số, tên, hear(), listen(), len(x), x["k"], x[k], phép + − giữa chúng); for / while / if / elif / else theo cauTruc; dòng từ điển / tập hợp / số âm thanh
      tách được bằng TP.tachDoiSo (chế độ TD của màn); khoá dùng phải có trong khoaTD.
   4. LÁCH (bộ dò): ở 4 màn đầu dùng một khái niệm mới (đọc sổ, for k in sổ, in sổ, tập hợp, hear(), listen(), note(n, k)) của chương dạy nó, thay khái niệm
      bằng hằng lấy từ lần chạy đầu (sổ đầu tiên, giá trị cảm biến đọc đầu tiên) thì phải THUA hay KHÔNG ĐỦ 3 SAO.
   5. ĐƯỜNG CONG: trong một chương, số dòng lời giải không nhảy quá 5 dòng so với màn trước, sân không lớn quá gấp đôi (trừ trùm).
   Trượt thì thoát mã 1.
   ========================================================================== */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { napKhay } from './dom-gia-khay.mjs';

const require = createRequire(import.meta.url);
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const Cham = require('./cham.js');
const clone = (x) => JSON.parse(JSON.stringify(x));
const IN_LACH = process.argv.includes('--lach');      // in kết quả bộ dò lách ở từng màn ép
const chiChuong = process.argv.slice(2).filter((x) => !x.startsWith('--'));

const kho = new Map(), khoTruoc = new Map();
for (const m of M.danhSach) {
  khoTruoc.set(m.ma, [...kho.values()].map(clone));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}
function hamCo(m, lg) {
  const hs = new Map((khoTruoc.get(m.ma) || []).map((h) => [h.ten, clone(h)]));
  for (const h of (lg && lg.hamCuaEmMoi) || []) hs.set(h.ten, clone(h));
  return hs;
}
function cham(m, lg, them) {
  const mm = them ? Object.assign(clone(m), them) : m;
  return Cham.cham(mm, { chinh: lg.chinh, hamCuaMan: lg.hamCuaMan || [], doi: lg.doi }, [...hamCo(m, lg).values()]);
}
const baiCua = (s, m) => Object.assign({}, s.baiLam, { hamCuaEmMoi: s.hamCuaEmMoi || (s.baiLam && s.baiLam.hamCuaEmMoi) || [] });

const chuongMua8 = TT.goi.filter((g) => g.mua === 'mua-8').flatMap((g) => g.chuong);
const ds = M.danhSach.filter((m) => chuongMua8.includes(m.chuong) && (!chiChuong.length || chiChuong.includes(m.chuong)));

/* ------------------------------------------------------------------ 3. khay */
const K = napKhay();
const { TP } = K;
const RE_SO = /^-?\d+$/, RE_TEN = /^[A-Za-z_]\w*$/;
const RE_CHIP = /^(?:hear\(\)|listen\(\)|len\([A-Za-z_]\w*\)|[A-Za-z_]\w*\[(?:"[A-Za-z_]\w*"|[A-Za-z_]\w*)\])$/;
const LENH_DIEU_KIEN = ['front_clear', 'right_clear', 'left_clear', 'warm', 'front_metal'];
function laNguyenTu(v) { v = v.trim(); return RE_SO.test(v) || RE_TEN.test(v) || RE_CHIP.test(v); }
function laSoKhay(v) {
  v = v.trim();
  if (laNguyenTu(v)) return true;
  const p = v.split(/\s+[-+*]\s+/);
  return p.length === 2 && p.every(laNguyenTu);
}
function tachDoiSo(s) {
  const kq = []; let sau = 0, cur = '';
  for (const c of s) {
    if (c === '(' || c === '[' || c === '{') sau++;
    if (c === ')' || c === ']' || c === '}') sau--;
    if (c === ',' && sau === 0) { kq.push(cur); cur = ''; } else cur += c;
  }
  if (cur.trim()) kq.push(cur);
  return kq.map((x) => x.trim());
}
function laDieuKien(c, khoa) {
  c = c.trim();
  if (/^not\s+/.test(c)) return laDieuKien(c.replace(/^not\s+/, ''), khoa);
  const goi = /^([A-Za-z_]\w*)\(\)$/.exec(c);
  if (goi && LENH_DIEU_KIEN.includes(goi[1])) return true;
  let mm = /^(.+?)\s+(not in|in)\s+([A-Za-z_]\w*)$/.exec(c);
  if (mm) return laSoKhay(mm[1]) || /^"[A-Za-z_]\w*"$/.test(mm[1].trim());
  mm = /^(.+?)\s*(==|!=|<=|>=|<|>)\s*(.+)$/.exec(c);
  if (mm) return laSoKhay(mm[1]) && laSoKhay(mm[3]) && !(RE_SO.test(mm[1].trim()) && RE_SO.test(mm[3].trim()));
  return false;
}
/** Lý do dòng không lắp được (null = lắp được). ten: các hàm gọi được → số tham số. */
function lyDoKhay(dong, m, ten, khoa) {
  const s = dong.replace(/#.*$/, '').trim();
  if (!s) return null;
  const ct = m.cauTruc || [];
  const td = TP.tachDoiSo(dong.trim());
  if (td && td.loai === 'td') {
    const dsKhoa = (td.ds || []).filter((x, i) => td.vt[i] === 'khoa').map((x) => x.replace(/"/g, ''));
    const thieu = dsKhoa.filter((k) => !khoa.includes(k));
    if (thieu.length) return 'khoá không có trên khay: ' + thieu.join(', ');
    if (/^ganDict|ganKhoa$/.test(td.kieu) && !ct.includes('dict')) return 'cauTruc thiếu dict';
    if (/^ganSet|add$/.test(td.kieu) && !ct.includes('set')) return 'cauTruc thiếu set';
    const so = (td.ds || []).filter((x, i) => td.vt[i] === 'so' || td.vt[i] === 'gt');
    if (so.some((x) => !laSoKhay(x) && !/^"[A-Za-z_]\w*"$/.test(x))) return 'ô số không chạm được: ' + so.join(', ');
    return null;
  }
  let mm;
  if ((mm = /^for\s+([A-Za-z_]\w*)\s+in\s+range\((.+)\):$/.exec(s))) return !ct.includes('for') ? 'cauTruc thiếu for' : laSoKhay(mm[2]) ? null : 'range() không chạm được';
  if ((mm = /^for\s+([A-Za-z_]\w*)\s+in\s+([A-Za-z_]\w*):$/.exec(s))) return ct.includes('for') && (ct.includes('dict') || ct.includes('set') || ct.includes('list')) ? null : 'cauTruc thiếu for / dict';
  if ((mm = /^(while|if|elif)\s+(.+):$/.exec(s))) {
    if (!ct.includes(mm[1] === 'elif' ? 'if' : mm[1])) return 'cauTruc thiếu ' + mm[1];
    if (/\b(in|not in)\b/.test(mm[2]) && !/\brange\b/.test(mm[2]) && !(ct.includes('dict') || ct.includes('set'))) return 'cauTruc thiếu dict / set cho in';
    return laDieuKien(mm[2], khoa) ? null : 'điều kiện không chạm được: ' + mm[2];
  }
  if (s === 'else:') return ct.includes('else') || ct.includes('if') ? null : 'cauTruc thiếu else';
  if ((mm = /^([A-Za-z_]\w*)\s*=\s*(.+)$/.exec(s))) {
    if (RE_SO.test(mm[2].trim()) || /^[A-Za-z_]\w*\s*\+\s*1$/.test(mm[2].trim())) return m.bienDem ? null : 'gán biến cần bienDem';
    return 'dòng gán không tách được: ' + s;
  }
  if ((mm = /^([A-Za-z_]\w*)\((.*)\)$/.exec(s))) {
    if (!(mm[1] in ten)) return 'hàm không có trên khay: ' + mm[1];
    const dso = tachDoiSo(mm[2]);
    if (ten[mm[1]] !== null && dso.length !== ten[mm[1]]) return mm[1] + ' cần ' + ten[mm[1]] + ' đối số, có ' + dso.length;
    const xau = dso.filter((x) => !laSoKhay(x));
    return xau.length ? 'đối số không chạm được: ' + xau.join(', ') : null;
  }
  return 'dạng câu lạ';
}
function dongCua(b) {
  if (!b) return [];
  const kq = [];
  (b.chinh || []).forEach((d) => kq.push(['chinh', d]));
  (b.doi || []).forEach((x, i) => (x.chinh || []).forEach((d) => kq.push(['R' + (i + 1), d])));
  [].concat(b.hamCuaMan || [], b.hamCuaEmMoi || []).forEach((h) => (h.than || []).forEach((d) => kq.push([h.ten, d])));
  return kq;
}
function kiemKhay(m) {
  TP.datCheTD(TP.coTDCua(m), TP.khoaTDCua(m), TP.nguonAmCua(m));
  const khoa = TP.khoaTDCua(m);
  const loi = [];
  const cacBai = [['lời giải', m.loiGiai], ['mã mẫu', m.maMau]]
    .concat((m.loiSai || []).map((s) => ['lời sai "' + s.moTa + '"', baiCua(s, m)]))
    .concat([].concat(m.loiGiaiKhac || []).map((k) => ['lời giải khác', baiCua(k, m)]));
  for (const [ten, b] of cacBai) {
    const goi = {};
    const hamGoc = [].concat(m.hamGoc || [], ...((m.doi || []).map((r) => r.hamGoc || [])));
    hamGoc.forEach((h) => { goi[h] = h === 'note' ? null : 0; });
    for (const t of m.taoHam || []) { const h = (m.loiGiai.hamCuaEmMoi || []).find((x) => x.ten === t); if (h) goi[t] = (h.thamSo || []).length; }      // hàm màn bắt chế: khay có sẵn khối gọi
    for (const [t, h] of hamCo(m, b)) goi[t] = (h.thamSo || []).length;
    [].concat(b.hamCuaMan || []).forEach((h) => { goi[h.ten] = (h.thamSo || []).length; });
    for (const [noi, d] of dongCua(b)) {
      const ly = lyDoKhay(d, m, goi, khoa);
      if (ly) loi.push(ten + ' (' + noi + '): `' + d.trim() + '` → ' + ly);
    }
  }
  return loi;
}

/* ------------------------------------------------------------------ 4. lách */
const KN = {
  'doc-so': (d) => /[A-Za-z_]\w*\["[A-Za-z_]\w*"\]/.test(d),
  'for-so': (d) => /^\s*for\s+\w+\s+in\s+(?!range\b)\w+:/.test(d),
  'in-so': (d) => /\bif\s+.+\s+(not in|in)\s+\w+:/.test(d),
  'tap-hop': (d) => /\.add\(|=\s*set\(\)/.test(d),
  hear: (d) => /\bhear\(\)/.test(d),
  listen: (d) => /\blisten\(\)/.test(d),
  'note-ngan': (d) => /\bnote\(\s*[^,()]+,\s*[^,()]+\)/.test(d)
};
function khaiNiemCua(b) {
  const k = new Set();
  for (const [, d] of dongCua(b)) for (const [ten, f] of Object.entries(KN)) if (f(d)) k.add(ten);
  return k;
}
/** Từ điển viết thẳng `x = {"a": 1}` → { ten: x, gt: {a: 1} }. */
function docDict(d) {
  const mm = /^\s*([A-Za-z_]\w*)\s*=\s*\{(.*)\}\s*$/.exec(d);
  if (!mm || /^[^"]*$/.test(mm[2]) && mm[2].trim()) return null;
  const gt = {};
  for (const cap of mm[2].split(',').map((x) => x.trim()).filter(Boolean)) {
    const c = /^"([A-Za-z_]\w*)"\s*:\s*(-?\d+)$/.exec(cap);
    if (!c) return null;
    gt[c[1]] = Number(c[2]);
  }
  return { ten: mm[1], gt };
}
/** Thay khái niệm bằng hằng: sổ → sổ đầu tiên đưa vào, hear() / listen() → giá trị đọc đầu tiên. Trả về bài mới hay null nếu không có gì để thay. */
function lach(m, lg) {
  const r = cham(m, lg);
  const vet = [].concat(...(r.theoSan || []).map((s) => s.vet || []), r.vet || []);
  const dau = {};
  for (const e of vet) if (e.docCamBien && (e.ten === 'hear' || e.ten === 'listen') && dau[e.ten] === undefined) dau[e.ten] = e.ten === 'hear' ? e.docCamBien.khoang : e.docCamBien.not;
  const chinh = [].concat(lg.chinh || []);
  const so = {};
  chinh.forEach((d) => { const x = docDict(d); if (x && !so[x.ten]) so[x.ten] = x.gt; });
  const hamMoi = clone(lg.hamCuaEmMoi || []);
  const thamSoSo = {};
  for (const h of hamMoi) {
    for (const d of [].concat(chinh, ...hamMoi.map((g) => g.than))) {
      const mm = new RegExp('\\b' + h.ten + '\\(([^)]*)\\)').exec(d);
      if (!mm) continue;
      const dso = tachDoiSo(mm[1]);
      h.thamSo.forEach((p, i) => { if (so[dso[i]]) thamSoSo[h.ten + '.' + p] = so[dso[i]]; });
      break;
    }
  }
  let doi = false;
  function thayDong(dongs, env) {
    const kq = [];
    for (let i = 0; i < dongs.length; i++) {
      let d = dongs[i];
      const lui = /^\s*/.exec(d)[0];
      let mm = /^\s*for\s+([A-Za-z_]\w*)\s+in\s+([A-Za-z_]\w*):\s*$/.exec(d);
      if (mm && env[mm[2]]) {
        let j = i + 1; while (j < dongs.length && /^\s*/.exec(dongs[j])[0].length > lui.length) j++;
        const than = dongs.slice(i + 1, j).map((x) => lui + x.slice(lui.length + 4));
        for (const k of Object.keys(env[mm[2]])) kq.push(...thayDong(than.map((x) => x.replace(new RegExp('\\b' + mm[2] + '\\[' + mm[1] + '\\]', 'g'), String(env[mm[2]][k]))), env));
        doi = true; i = j - 1; continue;
      }
      mm = /^\s*if\s+"([A-Za-z_]\w*)"\s+(not in|in)\s+([A-Za-z_]\w*):\s*$/.exec(d);
      if (mm && env[mm[3]]) {
        let j = i + 1; while (j < dongs.length && /^\s*/.exec(dongs[j])[0].length > lui.length) j++;
        let co = mm[1] in env[mm[3]]; if (mm[2] === 'not in') co = !co;
        let than = dongs.slice(i + 1, j).map((x) => lui + x.slice(lui.length + 4)), khac = [], e = j;
        if (j < dongs.length && /^\s*else:\s*$/.test(dongs[j]) && /^\s*/.exec(dongs[j])[0] === lui) {
          e = j + 1; while (e < dongs.length && /^\s*/.exec(dongs[e])[0].length > lui.length) e++;
          khac = dongs.slice(j + 1, e).map((x) => lui + x.slice(lui.length + 4));
        }
        kq.push(...thayDong(co ? than : khac, env));
        doi = true; i = e - 1; continue;
      }
      const goc = d;
      d = d.replace(/\b([A-Za-z_]\w*)\["([A-Za-z_]\w*)"\]/g, (t, n, k) => (env[n] && k in env[n] ? String(env[n][k]) : t));
      if (dau.hear !== undefined) d = d.replace(/\bhear\(\)/g, String(dau.hear));
      if (dau.listen !== undefined) d = d.replace(/\blisten\(\)/g, String(dau.listen));
      if (d !== goc) doi = true;
      kq.push(d);
    }
    return kq;
  }
  let chinhMoi = thayDong(chinh, so);
  for (const h of hamMoi) {
    const env = Object.assign({}, so);
    h.thamSo.forEach((p) => { if (thamSoSo[h.ten + '.' + p]) env[p] = thamSoSo[h.ten + '.' + p]; });
    h.than = thayDong(h.than, env);
  }
  // sổ không còn ai đọc (đã thay hết bằng hằng): bỏ dòng tạo sổ cho lách ngắn nhất
  const conDoc = (ten) => [].concat(chinhMoi.filter((d) => !(docDict(d) && docDict(d).ten === ten)), ...hamMoi.map((h) => h.than)).some((d) => new RegExp('\\b' + ten + '\\b').test(d));
  chinhMoi = chinhMoi.filter((d) => { const x = docDict(d); return !x || conDoc(x.ten); });
  return doi ? { chinh: chinhMoi, hamCuaMan: lg.hamCuaMan || [], hamCuaEmMoi: hamMoi, doi: lg.doi } : null;
}
/** Màn phải ép: 4 màn đầu (không tính chiChay) dùng khái niệm ở chương đầu tiên dạy nó trong mùa 8. */
const epTai = new Map();
{
  const chuongDay = {};
  for (const m of M.danhSach.filter((x) => chuongMua8.includes(x.chuong))) {
    for (const k of khaiNiemCua(m.loiGiai)) if (!chuongDay[k]) chuongDay[k] = m.chuong;
  }
  for (const [k, ch] of Object.entries(chuongDay)) {
    let dem = 0;
    for (const m of M.danhSach.filter((x) => x.chuong === ch)) {
      if (m.chiChay || !khaiNiemCua(m.loiGiai).has(k)) continue;
      if (dem++ < 4) (epTai.get(m.ma) || epTai.set(m.ma, []).get(m.ma)).push(k);
    }
  }
}
/** Khái niệm chỉ có ở mã mẫu sửa số (người chơi chỉ sửa một số, không viết lại): không ép. Ghi ở đây kèm lý do. */
const KHONG_EP = {
  'tu-dien.3': 'màn sửa một số trong sổ: dòng sổ có sẵn, bài là đọc sổ',
  'tu-dien.4': 'màn thêm một cặp vào sổ có sẵn',
  'tu-dien.5': 'màn thêm một dòng gán: dòng gán là điều được dạy',
  'tu-dien.6': 'màn xem vòng for k in d chạy rồi sửa một số; tu-dien.7 mới ép (hai sổ dài khác nhau)'
};

/* ------------------------------------------------------------------ chạy */
const VU_KHI = /\b(súng|đạn|bắn|bom|kiếm|vũ khí|tấn công|chiến đấu|giết)\b/i;
const EM = /(^|[\s,.!?:;(])em([\s,.!?:;)]|$)/i;
let dat = 0, hong = 0;
const truoc = {};
for (const m of ds) {
  const loi = [];
  try {
    const r = cham(m, m.loiGiai);
    for (const h of m.hamCuaEmCan || []) if (!hamCo(m, m.loiGiai).has(h)) loi.push('cần hàm chưa học: ' + h);
    if (!r.thang) loi.push('lời giải không thắng: ' + (r.chanDoan || []).map((c) => c.ma).join(', '));
    else if (r.sao !== 3 || r.soO !== m.sao.o || r.soNhip !== m.sao.nhip) loi.push('lời giải ' + r.sao + ' sao, o=' + r.soO + '/' + m.sao.o + ' nhịp=' + r.soNhip + '/' + m.sao.nhip);
    if (!m.chiChay) {
      if (cham(m, m.maMau).thang) loi.push('mã mẫu đã thắng');
      if ((m.loiSai || []).length < 2) loi.push('cần ≥ 2 lời sai');
    }
    for (const s of m.loiSai || []) {
      const rs = cham(m, baiCua(s, m));
      if (rs.thang && rs.sao === 3) loi.push('lời sai "' + s.moTa + '" thắng 3 sao');
      const ma = (rs.chanDoan || []).map((c) => c.ma);
      for (const c of s.phaiCoMa || []) if (!ma.includes(c)) loi.push('lời sai "' + s.moTa + '" thiếu mã ' + c + ' (có ' + ma.join(', ') + ')');
    }
    for (const k of [].concat(m.loiGiaiKhac || [])) if (!cham(m, baiCua(k, m)).thang) loi.push('lời giải khác "' + k.moTa + '" không thắng');
    // 2. chữ
    const chu = [m.ten, m.deBai, m.veMaMau, ...(m.goiY || []), ...(m.loiSai || []).map((x) => x.moTa)].filter(Boolean);
    if (chu.some((x) => /[—–]/.test(x))) loi.push('chữ có gạch dài');
    if (chu.some((x) => VU_KHI.test(x))) loi.push('chữ có từ vũ khí');
    if (chu.some((x) => EM.test(x))) loi.push('chữ gọi "em" (phải là "bạn")');
    if (!/^(Giúp Sola|Sola làm mẫu|Sola viết vội)/.test(m.deBai || '')) loi.push('đề không mở bằng Giúp Sola / Sola làm mẫu / Sola viết vội');
    if ((m.goiY || []).some((g) => !/^Luna: /.test(g)) || !(m.goiY || []).length) loi.push('gợi ý phải mở bằng "Luna: "');
    // 3. khay
    loi.push(...kiemKhay(m));
    // 4. lách
    const ep = (epTai.get(m.ma) || []);
    if (ep.length && !KHONG_EP[m.ma] && !m.chiChay) {
      const b = lach(m, m.loiGiai);
      if (b && IN_LACH) { const rl = cham(m, b); console.log('  lách ' + m.ma + ' [' + ep.join(', ') + ']: thắng=' + rl.thang + ' sao=' + rl.sao + ' ' + JSON.stringify((b.hamCuaEmMoi || []).map((h) => h.than).concat([b.chinh]))); }
      else if (IN_LACH) console.log('  lách ' + m.ma + ' [' + ep.join(', ') + ']: không có gì để thay');
      if (b) { const rl = cham(m, b); if (rl.thang && rl.sao === 3) loi.push('lách được ' + ep.join(', ') + ' bằng hằng: ' + JSON.stringify(b.chinh) + ' ' + JSON.stringify((b.hamCuaEmMoi || []).map((h) => h.than))); }
    }
    // 5. đường cong
    const t = truoc[m.chuong];
    const n = dongCua(m.loiGiai).length, sanO = [].concat(...[].concat(m.san).map((x) => (Array.isArray(x) ? x : [x]))).join('').length;
    if (t && m.hang !== 'trum') {
      if (n > t.n + 5) loi.push('đường cong: lời giải ' + n + ' dòng, màn trước ' + t.n);
      if (sanO > t.sanO * 2 + 10) loi.push('đường cong: sân ' + sanO + ' ô, màn trước ' + t.sanO);
    }
    truoc[m.chuong] = { n, sanO };
  } catch (e) { loi.push('LỖI ' + e.stack); }
  if (loi.length) { hong++; console.log('  ✗ ' + m.ma + ' (' + m.ten + ')\n      ' + loi.join('\n      ')); }
  else dat++;
}
console.log((hong ? 'HỎNG ' + hong + ' màn; ' : '') + 'ĐẠT ' + dat + '/' + ds.length + ' màn mùa 8' + (chiChuong.length ? ' (' + chiChuong.join(', ') + ')' : '') + '.');
if (hong) process.exit(1);

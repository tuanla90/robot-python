/* ============================================================================
   lach-chung.mjs — phần dùng chung của các MÁY DÒ LỜI GIẢI LÁCH (gói T, 29/10): đọc code Python của màn, chèn dấu để lấy vết chạy,
   dựng lời giải lách A1 / A2 / B từ vết. Tách từ hoc/kiem-lach-mua-1.mjs (HD1 / HD2) để kiem-lach-mua-2.mjs dùng lại; kiem-lach-mua-1.mjs
   vẫn giữ bản riêng (phiên HD3 đang sửa tệp đó song song): đổi nó sang import từ đây sau khi HD3 gộp.
   Các hàm ở đây THUẦN (không đọc dữ liệu lộ trình, không in), trừ chayVet gọi cham.js.
   ========================================================================== */

/* ------------------------------------------------------------------ đọc code */
export const thut = (s) => /^ */.exec(s)[0].length;
export const laHeader = (s) => /^\s*(for|while|if|elif|else)\b/.test(s);
export const laIfDau = (s) => /^\s*if\b/.test(s);
export const laNhanh = (s) => /^\s*(elif|else)\b/.test(s);
export const laWhile = (s) => /^\s*while\b/.test(s);
export const laFor = (s) => /^\s*for\b/.test(s);
export const laTrong = (s) => !String(s).trim() || /^\s*#/.test(s);
export const laGoi = (s) => /^\s*[A-Za-z_]\w*\s*\(.*\)\s*$/.test(s);
/** Dòng gán biến: `x = …` (không phải `==`). */
export const laGan = (s) => /^\s*[A-Za-z_]\w*\s*=(?!=)/.test(s);
export const tenGan = (s) => (/^\s*([A-Za-z_]\w*)\s*=(?!=)/.exec(s) || [])[1];
/** Khái niệm cấu trúc trong các dòng code (for / while / if / not), và mùa 2: bien (gán), distance / warm (cảm biến số), luc (chuỗi lực bắn). */
export function khaiNiem(dong) {
  const k = new Set();
  for (const d of dong) {
    if (laFor(d)) k.add('for');
    if (laWhile(d)) k.add('while');
    if (/^\s*(if|elif|else)\b/.test(d)) k.add('if');
    if (/\bnot\b/.test(d)) k.add('not');
    if (laGan(d)) k.add('bien');
    if (/\bdistance\(\)/.test(d)) k.add('distance');
    if (/\bwarm\(\)/.test(d)) k.add('warm');
    if (/"(fast|charge)"/.test(d)) k.add('luc');
  }
  return k;
}

/* ------------------------------------------------------------------ chèn dấu */
export const DAU = 'front_clear()';
/**
 * Chèn dấu vào một đoạn code: trước mỗi câu lệnh (gọi: 'goi'; header for / while / if: 'truoc') và ở đầu thân mỗi khối ('than').
 * Trả về { dong, ban } với ban[chỉ số dòng mới] = { loai, goc } (goc = chỉ số dòng gốc).
 */
export function chenDau(goc) {
  const dong = [], ban = {};
  goc.forEach((d, i) => {
    if (laTrong(d)) { dong.push(d); return; }
    const sp = ' '.repeat(thut(d));
    if (laHeader(d)) {
      if (!laNhanh(d)) { ban[dong.length] = { loai: 'truoc', goc: i }; dong.push(sp + DAU); }
      dong.push(d);
      ban[dong.length] = { loai: 'than', goc: i }; dong.push(sp + '    ' + DAU);
    } else {
      if (laGoi(d) || laGan(d)) { ban[dong.length] = { loai: laGoi(d) ? 'goi' : 'gan', goc: i }; dong.push(sp + DAU); }
      dong.push(d);
    }
  });
  return { dong, ban };
}

/* ------------------------------------------------------------------ chạy lấy vết */
const clone = (x) => JSON.parse(JSON.stringify(x));
/** Chạy lời giải (đã chèn dấu) trên bản sao màn: khung rộng, main không khoá, có front_clear trên khay. Trả về kết quả cham. */
export function chayVet(Cham, m, bai, hamCuaEm) {
  const c = clone(m);
  delete c.chinhCoDinh; delete c.chiChay; delete c.khoaHamMan; delete c.gioiHanHam;
  c.khung = Object.assign({}, c.khung, { chinh: 400, moiHam: 400 });
  delete c.khung.chanWhile; delete c.khung.chanBien;
  if (!c.hamGoc.includes('front_clear')) c.hamGoc = c.hamGoc.concat(['front_clear']);
  if (c.phanCung && !c.phanCung.includes('front_clear')) c.phanCung = c.phanCung.concat(['front_clear']);
  c.nhipToiDa = Math.max(c.nhipToiDa || 200, 400);
  return Cham.cham(c, bai, hamCuaEm);
}
/** Vết sân s của kết quả: chỉ các mục lệnh. */
export const lenhCua = (r, s) => (r.theoSan[s] ? r.theoSan[s].vet : []).filter((e) => e.loai === 'lenh');
/** Mục vết là dấu (đọc front_clear do máy dò chèn)? Cảm biến khác (distance / warm) cũng là docCamBien nhưng không phải dấu. */
export const laDau = (e) => !!e.docCamBien && (e.ten === 'front_clear' || (e.docCamBien.ham || e.ten) === 'front_clear');

/* ------------------------------------------------------------------ dựng lách */
/** A1: dãy lệnh gốc thật (bỏ đọc cảm biến). Màn chọn lực bắn (lucBan): khối shoot trên khay luôn mang lực, nên giữ lực đã bắn: shoot("fast"). */
export function duoiGoc(vet, lucBan) { return vet.filter((e) => !e.docCamBien).map((e) => e.ten + '(' + (lucBan && e.lucBan && /^shoot/.test(e.ten) ? '"' + e.lucBan + '"' : '') + ')'); }
/** A2: dãy câu lệnh ở mức chương trình chính (dấu 'goi' cột chinh, không trong hàm). */
export function duoiGoi(vet, banChinh, chinhGoc) {
  const kq = [];
  for (const e of vet) {
    if (!laDau(e) || !e.cho || e.cho.cot !== 'chinh' || e.ngan.length) continue;
    const b = banChinh[e.cho.dong - 1];
    if (b && b.loai === 'goi') kq.push(chinhGoc[b.goc].trim());
  }
  return kq;
}
/** Đếm dấu 'truoc' / 'than' theo dòng gốc của một đoạn (cot + ten). */
export function demDau(vet, cot, ten, ban) {
  const truoc = {}, than = {};
  for (const e of vet) {
    if (!laDau(e) || !e.cho || e.cho.cot !== cot || (ten && e.cho.ten !== ten)) continue;
    const b = ban[e.cho.dong - 1];
    if (!b) continue;
    if (b.loai === 'truoc') truoc[b.goc] = (truoc[b.goc] || 0) + 1;
    if (b.loai === 'than') than[b.goc] = (than[b.goc] || 0) + 1;
  }
  return { truoc, than };
}
/** Giá trị các lần đọc cảm biến số (distance → khoang, warm → nong) theo dòng gốc của một đoạn (cot + ten): { [goc]: [giá trị theo thứ tự chạy] }. */
export function giaTriCamBien(vet, cot, ten, ban) {
  const kq = {};
  for (const e of vet) {
    const dc = e.docCamBien;
    if (!dc || laDau(e) || !e.cho || e.cho.cot !== cot || (ten && e.cho.ten !== ten)) continue;
    const ham = dc.ham || e.ten;
    if (ham !== 'distance' && ham !== 'warm') continue;
    // dòng có dấu đứng trước nó trong bản chèn: dòng thật = dòng ngay sau một dấu; tìm dòng gốc gần nhất ≤ e.cho.dong - 1 có trong ban
    let i = e.cho.dong - 1, goc = null;
    while (i >= 0) { if (ban[i]) { goc = ban[i].goc; break; } i--; }
    if (goc === null) continue;
    const k = ham + ':' + goc;
    (kq[k] = kq[k] || []).push(ham === 'distance' ? dc.khoang : (dc.nong ? 'True' : 'False'));
  }
  return kq;
}
/** Khối bắt đầu ở dòng i (header): các dòng thân = những dòng sau có thụt sâu hơn (bỏ dòng trống). Trả về chỉ số dòng kết thúc (không gồm). */
export function cuoiKhoi(dong, i) {
  const t = thut(dong[i]);
  let j = i + 1;
  while (j < dong.length && (laTrong(dong[j]) || thut(dong[j]) > t)) j++;
  return j;
}
export const boThut = (ds, n) => ds.map((d) => (laTrong(d) ? d : d.slice(Math.min(n, thut(d)))));
/** B: dỡ điều kiện của một đoạn code theo số lượt đếm được (truoc / than theo dòng gốc). */
export function doDieuKien(goc, dem) {
  function bien(dong, lech) {       // lech: chỉ số dòng gốc của dong[0]
    const kq = [];
    let i = 0;
    while (i < dong.length) {
      const d = dong[i], g = i + lech;
      if (laWhile(d)) {
        const het = cuoiKhoi(dong, i);
        const vao = dem.truoc[g] || 0, chay = dem.than[g] || 0;
        const k = vao ? Math.round(chay / vao) : 0;
        if (k > 0) {
          kq.push(' '.repeat(thut(d)) + 'for i in range(' + k + '):');
          kq.push(...bien(dong.slice(i + 1, het), g + 1));
        }
        i = het;
      } else if (laIfDau(d)) {
        // cụm if / elif / else cùng bậc
        const t = thut(d), nhanh = [];
        let j = i;
        while (j < dong.length && (j === i || (laNhanh(dong[j]) && thut(dong[j]) === t))) {
          const het = cuoiKhoi(dong, j);
          nhanh.push({ dau: j, het });
          j = het;
        }
        const chon = nhanh.find((n) => (dem.than[n.dau + lech] || 0) > 0);
        if (chon) kq.push(...bien(boThut(dong.slice(chon.dau + 1, chon.het), 4), chon.dau + 1 + lech));
        i = j;
      } else { kq.push(d); i++; }
    }
    return kq;
  }
  return bien(goc, 0);
}
/** Thay mọi lần xuất hiện của tên (từ nguyên) trong một dòng bằng chuỗi khác. */
export function thayTen(dong, ten, bang) { return dong.replace(new RegExp('\\b' + ten + '\\b', 'g'), bang); }
/** D: duỗi lời gọi hàm có tham số ở một đoạn: `f(a, b)` (dòng chỉ là lời gọi) thành thân f với tham số thay bằng đối số. ham: Map tên → { thamSo, than }. */
export function duoiThamSo(dong, ham) {
  const kq = [];
  for (const d of dong) {
    const m = /^(\s*)([A-Za-z_]\w*)\s*\((.*)\)\s*$/.exec(d);
    const h = m && ham.get(m[2]);
    if (!h || !(h.thamSo || []).length) { kq.push(d); continue; }
    const doi = m[3].split(',').map((s) => s.trim());
    for (const t of h.than) {
      let x = t;
      h.thamSo.forEach((p, i) => { x = thayTen(x, p, doi[i] === undefined ? '0' : doi[i]); });
      kq.push(m[1] + x);
    }
  }
  return kq;
}
/** Các đối số (chuỗi) từng dùng khi gọi hàm ten trong các đoạn code: [[đối số theo vị trí]…]. */
export function doiSoCua(ten, cacDoan) {
  const kq = [];
  for (const dong of cacDoan) for (const d of dong) {
    const re = new RegExp('\\b' + ten + '\\s*\\(([^)]*)\\)');
    const m = re.exec(d);
    if (m && m[1].trim()) kq.push(m[1].split(',').map((s) => s.trim()));
  }
  return kq;
}

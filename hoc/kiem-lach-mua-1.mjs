/* ============================================================================
   kiem-lach-mua-1.mjs — MÁY DÒ "LỜI GIẢI LÁCH" cho mùa 1 (HD1, 29/10): màn giới thiệu một khối / khái niệm mới phải ÉP dùng khối đó,
   tức là lời giải KHÔNG dùng khối đó thì phải THUA hoặc KHÔNG ĐỦ SAO. Máy dò tự dựng ba lời giải lách cho từng màn từ lời giải chuẩn:
     A1  DUỖI THẲNG GỐC: chạy lời giải chuẩn trên sân 1, lấy dãy LỆNH GỐC thật đã chạy, viết lại thành chương trình chỉ gồm lệnh gốc
         (không for / if / while / không gọi hàm nào). Bỏ qua mọi khái niệm.
     A2  DUỖI THẲNG LỜI GỌI: như A1 nhưng giữ các lời gọi hàm (của em / của màn) ở mức chương trình chính: chỉ bỏ for / if / while / not.
     B   DỠ ĐIỀU KIỆN: `while cond:` thành `for i in range(k):` với k = số lượt thật trên sân 1; `if / elif / else` thành nhánh đã chạy
         trên sân 1 (không nhánh nào chạy thì bỏ cả cụm). Áp cho chương trình chính (trừ màn chinhCoDinh) và thân hàm của em mới /
         hàm của màn mà lời giải viết. Giữ for và hàm.
   Cách lấy "lượt thật": chèn lệnh đánh dấu front_clear() (đọc cảm biến, không tốn nhịp) trước mỗi câu lệnh và ở đầu mỗi thân khối rồi
   chạy thật bằng cham.js trên bản sao màn (khung rộng, không khoá main): vết chạy cho biết lời gọi nào đã chạy, thân khối nào chạy mấy lần.
   LỖ = lách THẮNG mọi sân, ĐỦ 3 SAO, mà khái niệm nó bỏ qua là khái niệm màn đang ÉP:
     - khái niệm có mặt trong phần lời giải bị biến đổi (for, while, if, not, def = tạo hàm, goi-ham = gọi hàm của em / của màn);
     - "đang ép" = chương này là chương ĐẦU TIÊN của mùa 1 (theo lộ trình) dùng khái niệm đó, hay màn có taoHam (ép tạo hàm).
   Lách thắng mà thiếu sao, hay ở chương đã "thả tự do", chỉ ghi THÔNG TIN. CHAP_NHAN: lỗ chấp nhận có lý do (không đỏ).
   Màn hai robot (man.doi) bỏ qua (ghi). Chạy: node hoc/kiem-lach-mua-1.mjs [--tat-ca] [--loi-gia]
     --tat-ca: in cả dòng không lỗ; --loi-gia: gộp màn ép while đầu tiên về một sân rồi dò, phải thấy LỖ (máy dò tự chứng minh).
   Trượt (có LỖ ngoài CHAP_NHAN) thì thoát mã 1.
   ========================================================================== */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const Cham = require('./cham.js');
const clone = (x) => JSON.parse(JSON.stringify(x));
const TAT_CA = process.argv.includes('--tat-ca');
const LOI_GIA = process.argv.includes('--loi-gia');

/** Lỗ chấp nhận: mã màn → lý do (ghi ở báo cáo HD1). */
const CHAP_NHAN = {};

const chuongMua1 = TT.goi.filter((g) => g.mua === 'mua-1').flatMap((g) => g.chuong);
const ds = M.danhSach.filter((m) => chuongMua1.includes(m.chuong));

/* ------------------------------------------------------------------ đọc code */
const thut = (s) => /^ */.exec(s)[0].length;
const laHeader = (s) => /^\s*(for|while|if|elif|else)\b/.test(s);
const laIfDau = (s) => /^\s*if\b/.test(s);
const laNhanh = (s) => /^\s*(elif|else)\b/.test(s);
const laWhile = (s) => /^\s*while\b/.test(s);
const laFor = (s) => /^\s*for\b/.test(s);
const laTrong = (s) => !String(s).trim() || /^\s*#/.test(s);
const laGoi = (s) => /^\s*[A-Za-z_]\w*\s*\(.*\)\s*$/.test(s);
/** Khái niệm trong các dòng code. */
function khaiNiem(dong) {
  const k = new Set();
  for (const d of dong) {
    if (laFor(d)) k.add('for');
    if (laWhile(d)) k.add('while');
    if (/^\s*(if|elif|else)\b/.test(d)) k.add('if');
    if (/\bnot\b/.test(d)) k.add('not');
  }
  return k;
}

/* ------------------------------------------------------------------ chèn dấu */
const DAU = 'front_clear()';
/**
 * Chèn dấu vào một đoạn code: trước mỗi câu lệnh (gọi: 'goi'; header for / while / if: 'truoc') và ở đầu thân mỗi khối ('than').
 * Trả về { dong, ban } với ban[chỉ số dòng mới] = { loai, goc } (goc = chỉ số dòng gốc).
 */
function chenDau(goc) {
  const dong = [], ban = {};
  goc.forEach((d, i) => {
    if (laTrong(d)) { dong.push(d); return; }
    const sp = ' '.repeat(thut(d));
    if (laHeader(d)) {
      if (!laNhanh(d)) { ban[dong.length] = { loai: 'truoc', goc: i }; dong.push(sp + DAU); }
      dong.push(d);
      ban[dong.length] = { loai: 'than', goc: i }; dong.push(sp + '    ' + DAU);
    } else {
      if (laGoi(d)) { ban[dong.length] = { loai: 'goi', goc: i }; dong.push(sp + DAU); }
      dong.push(d);
    }
  });
  return { dong, ban };
}

/* ------------------------------------------------------------------ chạy lấy vết */
/** Chạy lời giải (đã chèn dấu) trên bản sao màn: khung rộng, main không khoá, có front_clear trên khay. Trả về kết quả cham. */
function chayVet(m, bai, hamCuaEm) {
  const c = clone(m);
  delete c.chinhCoDinh; delete c.khoaHamMan; delete c.gioiHanHam;
  c.khung = Object.assign({}, c.khung, { chinh: 400, moiHam: 400 });
  delete c.khung.chanWhile; delete c.khung.chanBien;
  if (!c.hamGoc.includes('front_clear')) c.hamGoc = c.hamGoc.concat(['front_clear']);
  if (c.phanCung && !c.phanCung.includes('front_clear')) c.phanCung = c.phanCung.concat(['front_clear']);
  c.nhipToiDa = Math.max(c.nhipToiDa || 200, 400);
  return Cham.cham(c, bai, hamCuaEm);
}
/** Vết sân s của kết quả: chỉ các mục lệnh. */
const lenhCua = (r, s) => (r.theoSan[s] ? r.theoSan[s].vet : []).filter((e) => e.loai === 'lenh');

/* ------------------------------------------------------------------ dựng lách */
/** A1: dãy lệnh gốc thật (bỏ đọc cảm biến). */
function duoiGoc(vet) { return vet.filter((e) => !e.docCamBien).map((e) => e.ten + '()'); }
/** A2: dãy câu lệnh ở mức chương trình chính (dấu 'goi' cot chinh, không trong hàm). */
function duoiGoi(vet, banChinh, chinhGoc) {
  const kq = [];
  for (const e of vet) {
    if (!e.docCamBien || !e.cho || e.cho.cot !== 'chinh' || e.ngan.length) continue;
    const b = banChinh[e.cho.dong - 1];
    if (b && b.loai === 'goi') kq.push(chinhGoc[b.goc].trim());
  }
  return kq;
}
/** Đếm dấu 'truoc' / 'than' theo dòng gốc của một đoạn (cot + ten). */
function demDau(vet, cot, ten, ban) {
  const truoc = {}, than = {};
  for (const e of vet) {
    if (!e.docCamBien || !e.cho || e.cho.cot !== cot || (ten && e.cho.ten !== ten)) continue;
    const b = ban[e.cho.dong - 1];
    if (!b) continue;
    if (b.loai === 'truoc') truoc[b.goc] = (truoc[b.goc] || 0) + 1;
    if (b.loai === 'than') than[b.goc] = (than[b.goc] || 0) + 1;
  }
  return { truoc, than };
}
/** Khối bắt đầu ở dòng i (header): các dòng thân = những dòng sau có thụt sâu hơn (bỏ dòng trống). Trả về chỉ số dòng kết thúc (không gồm). */
function cuoiKhoi(dong, i) {
  const t = thut(dong[i]);
  let j = i + 1;
  while (j < dong.length && (laTrong(dong[j]) || thut(dong[j]) > t)) j++;
  return j;
}
const boThut = (ds, n) => ds.map((d) => (laTrong(d) ? d : d.slice(Math.min(n, thut(d)))));
/** B: dỡ điều kiện của một đoạn code theo số lượt đếm được (truoc / than theo dòng gốc). */
function doDieuKien(goc, dem) {
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

/* ------------------------------------------------------------------ chấm lách */
function chamLach(m, bai, hamCuaEm) {
  const r = Cham.cham(m, bai, hamCuaEm);
  return { thang: r.thang, sao: r.sao, loi: r.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma).slice(0, 2).join(',') };
}

/* ------------------------------------------------------------------ khái niệm đang ép */
const DANH_SACH_KN = ['for', 'while', 'if', 'not', 'def', 'goi-ham'];
/** Khái niệm lời giải chuẩn dùng: chinh (main nếu không khoá), ham (thân hàm của em mới + hàm của màn lời giải viết), tatCa (cả def / goi-ham). */
function khaiNiemCua(m) {
  const lg = m.loiGiai, chinh = new Set(), ham = new Set();
  if (!m.chinhCoDinh) for (const x of khaiNiem(lg.chinh || (lg.doi || []).flatMap((d) => d.chinh || []))) chinh.add(x);
  for (const h of (lg.hamCuaEmMoi || []).concat(lg.hamCuaMan || [])) for (const x of khaiNiem(h.than)) ham.add(x);
  const tatCa = new Set([...chinh, ...ham]);
  if ((lg.hamCuaEmMoi || []).length || (m.taoHam || []).length) tatCa.add('def');
  if (((m.hamCuaEmCan || []).length || (lg.hamCuaMan || []).length) && !m.chinhCoDinh) tatCa.add('goi-ham');
  return { chinh, ham, tatCa };
}
const chuongDau = {};
for (const m of ds) for (const x of khaiNiemCua(m).tatCa) if (!chuongDau[x]) chuongDau[x] = m.chuong;
/** Khái niệm màn đang ép: chương đầu tiên của mùa dùng nó; màn tạo hàm ép def; khái niệm trong thân hàm người chơi viết ở màn này (hàm phải dùng lại được). */
function dangEp(m) {
  const kn = khaiNiemCua(m), ep = new Set();
  for (const x of kn.tatCa) if (chuongDau[x] === m.chuong) ep.add(x);
  if ((m.taoHam || []).length) ep.add('def');
  for (const x of kn.ham) ep.add(x);
  return ep;
}
/** Khái niệm mỗi cách lách bỏ qua: A1 tất cả; A2 chỉ cấu trúc ở main; B chỉ while / if / not ở main và thân hàm. */
function boQuaCua(ten, kn) {
  if (ten === 'A1') return [...kn.tatCa];
  if (ten === 'A2') return ['for', 'while', 'if', 'not'].filter((x) => kn.chinh.has(x));
  return ['while', 'if', 'not'].filter((x) => kn.chinh.has(x) || kn.ham.has(x));
}

/* ------------------------------------------------------------------ chạy */
const kho = new Map();
const bang = [], loGhi = [];
let soLo = 0, soLoChapNhan = 0;
for (const m of ds) {
  const truoc = clone([...kho.values()]);
  const lg = m.loiGiai;
  const hamEm = new Map(truoc.map((h) => [h.ten, h]));
  for (const h of lg.hamCuaEmMoi || []) hamEm.set(h.ten, clone(h));
  const hamCuaEm = [...hamEm.values()];
  if (!m.tietKiemNhip) for (const h of lg.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
  if (Array.isArray(m.doi)) { bang.push({ ma: m.ma, ghi: 'hai robot: bỏ qua' }); continue; }
  if (LOI_GIA && m.ma === LOI_GIA_MAN()) {
    // lỗi giả: gộp màn ép while đầu tiên (nhiều sân) về sân 1
    if (Array.isArray(m.san[0])) { m.san = m.san[0]; ['batDau', 'bongMo', 'mau', 'vatMau', 'vatThem'].forEach((k) => { if (Array.isArray(m[k])) m[k] = m[k][0]; }); delete m.nhipTheo; }
  }
  const chuan = chamLach(m, { chinh: lg.chinh, hamCuaMan: lg.hamCuaMan || [] }, hamCuaEm);
  if (!chuan.thang || chuan.sao !== 3) { bang.push({ ma: m.ma, ghi: 'lời giải chuẩn không 3 sao: ' + JSON.stringify(chuan) }); continue; }

  // 1. chạy có dấu
  const cd = chenDau(lg.chinh);
  const hamMoi = (lg.hamCuaEmMoi || []).map((h) => ({ h, cd: chenDau(h.than) }));
  const hamMan = (lg.hamCuaMan || []).map((h) => ({ h, cd: chenDau(h.than) }));
  const khoDau = [...hamEm.values()].map((h) => { const x = hamMoi.find((y) => y.h.ten === h.ten); return x ? { ten: h.ten, thamSo: h.thamSo, than: x.cd.dong } : h; });
  const rv = chayVet(m, { chinh: cd.dong, hamCuaMan: hamMan.map((x) => ({ ten: x.h.ten, thamSo: x.h.thamSo, than: x.cd.dong })) }, khoDau);
  if (!rv.thang) { bang.push({ ma: m.ma, ghi: 'chạy có dấu không thắng: ' + rv.chanDoan.map((c) => c.ma).join(',') }); continue; }
  const vet = lenhCua(rv, 0);

  // 2. ba lời giải lách
  const kn = khaiNiemCua(m), ep = dangEp(m);
  const lach = [];
  if (!m.chinhCoDinh) {
    lach.push({ ten: 'A1', bai: { chinh: duoiGoc(vet), hamCuaMan: lg.hamCuaMan || [] }, kho: hamCuaEm });
    lach.push({ ten: 'A2', bai: { chinh: duoiGoi(vet, cd.ban, lg.chinh), hamCuaMan: lg.hamCuaMan || [] }, kho: hamCuaEm });
  }
  const chinhB = m.chinhCoDinh ? lg.chinh : doDieuKien(lg.chinh, demDau(vet, 'chinh', null, cd.ban));
  const hamManB = hamMan.map((x) => ({ ten: x.h.ten, thamSo: x.h.thamSo, than: doDieuKien(x.h.than, demDau(vet, 'hamMan', x.h.ten, x.cd.ban)) }));
  const khoB = [...hamEm.values()].map((h) => { const x = hamMoi.find((y) => y.h.ten === h.ten); return x ? { ten: h.ten, thamSo: h.thamSo, than: doDieuKien(h.than, demDau(vet, 'hamEm', h.ten, x.cd.ban)) } : h; });
  lach.push({ ten: 'B', bai: { chinh: chinhB, hamCuaMan: hamManB }, kho: khoB });

  for (const l of lach) {
    const boQua = boQuaCua(l.ten, kn);
    if (!boQua.length) continue;                                     // không có gì để bỏ
    const kq = chamLach(m, l.bai, l.kho);
    const epBo = boQua.filter((x) => ep.has(x));
    const lo = kq.thang && kq.sao === 3 && epBo.length > 0;
    const dong = { ma: m.ma, ten: m.ten, lach: l.ten, boQua, ep: [...ep], thang: kq.thang, sao: kq.sao, loi: kq.loi, lo,
      code: l.bai.chinh.concat(l.kho.filter((h) => hamMoi.some((x) => x.h.ten === h.ten)).flatMap((h) => ['def ' + h.ten + '():'].concat(h.than.map((d) => '    ' + d))), l.bai.hamCuaMan.flatMap((h) => ['def ' + h.ten + '():  # hàm của màn'].concat(h.than.map((d) => '    ' + d)))) };
    bang.push(dong);
    if (lo) {
      if (CHAP_NHAN[m.ma]) soLoChapNhan++; else { soLo++; loGhi.push(dong); }
    }
  }
}
function LOI_GIA_MAN() {
  // màn ép while đầu tiên có nhiều sân (sau khi sửa): gộp về một sân thì B phải thắng 3 sao → LỖ
  const m = ds.find((x) => dangEp(x).has('while') && Array.isArray(x.san[0]) && !x.chinhCoDinh);
  return m ? m.ma : null;
}

/* ------------------------------------------------------------------ in */
console.log('Khái niệm · chương đầu tiên dùng (mùa 1): ' + Object.entries(chuongDau).map(([k, c]) => k + '=' + c).join(' · '));
console.log('\nmàn | lách | bỏ qua | đang ép | kết quả | LỖ');
let chuongIn = '';
for (const d of bang) {
  const c = M.timMa(d.ma).chuong;
  if (c !== chuongIn) { chuongIn = c; console.log('--- ' + c); }
  if (d.ghi) { console.log(d.ma + ' | ' + d.ghi); continue; }
  const kq = d.thang ? d.sao + ' sao' : 'thua' + (d.loi ? ' (' + d.loi + ')' : '');
  const lo = d.lo ? (CHAP_NHAN[d.ma] ? 'LỖ (chấp nhận: ' + CHAP_NHAN[d.ma] + ')' : 'LỖ') : '';
  if (TAT_CA || d.lo || (d.thang && d.boQua.some((x) => d.ep.includes(x)))) console.log([d.ma + ' ' + d.ten, d.lach, d.boQua.join(','), d.ep.join(','), kq, lo].join(' | '));
}
if (loGhi.length) {
  console.log('\nLời giải lách thắng 3 sao ở màn đang ép:');
  for (const d of loGhi) console.log('  ' + d.ma + ' [' + d.lach + ']: ' + d.code.join(' / '));
}
const theoChuong = {};
for (const d of loGhi) theoChuong[M.timMa(d.ma).chuong] = (theoChuong[M.timMa(d.ma).chuong] || 0) + 1;
console.log('\nLỗ theo chương: ' + (Object.entries(theoChuong).map(([c, n]) => c + ' ' + n).join(' · ') || 'không'));
if (LOI_GIA) {
  const ma = LOI_GIA_MAN();
  const co = loGhi.some((d) => d.ma === ma);
  console.log('Lỗi giả (gộp ' + ma + ' về một sân): ' + (co ? 'máy dò BẮT ĐƯỢC (ĐẠT)' : 'máy dò KHÔNG bắt được (HỎNG)'));
  process.exit(co ? 0 : 1);
}
console.log((soLo ? 'HỎNG ' : 'ĐẠT ') + soLo + ' lỗ ngoài danh sách chấp nhận · ' + soLoChapNhan + ' lỗ chấp nhận · ' + bang.filter((d) => !d.ghi).length + ' phép dò trên ' + ds.length + ' màn mùa 1.');
if (soLo) process.exitCode = 1;

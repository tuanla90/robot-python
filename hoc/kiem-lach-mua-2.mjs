/* ============================================================================
   kiem-lach-mua-2.mjs — MÁY DÒ "LỜI GIẢI LÁCH" cho MÙA 2 (gói T, 29/10; cùng ý kiem-lach-mua-1.mjs của HD1 / HD2, phần chung ở lach-chung.mjs).
   Màn giới thiệu một khối / khái niệm mới phải ÉP dùng nó: lời giải KHÔNG dùng nó thì phải THUA hoặc KHÔNG ĐỦ SAO. Máy dò tự dựng các lời giải
   lách từ lời giải chuẩn (vết chạy thật trên sân 1 bằng cham.js, chèn dấu front_clear như mùa 1):
     A1  DUỖI THẲNG GỐC: chỉ lệnh gốc.                       A2  DUỖI THẲNG LỜI GỌI: giữ lời gọi hàm ở main, bỏ for / if / while / biến.
     B   DỠ ĐIỀU KIỆN: while → for range(k) theo số lượt thật; if → nhánh đã chạy (B2: màn nhiều sân, k lớn nhất).
   Lách riêng cho khái niệm mùa 2 (định nghĩa ở gói T):
     C   HẰNG THAY BIẾN: trên bản B, bỏ mọi dòng gán (n = 0, n = n + 1, d = distance(), an_toan = 2), mỗi chỗ dùng biến thay bằng một hằng; thử mọi
         hằng 0..8 cho từng biến (tối đa hai biến). Có hằng nào thắng là lách thành công. Bỏ qua: bien (và distance / warm nếu phép gán là chỗ đọc duy nhất).
     D   DUỖI HÀM CÓ THAM SỐ: lời gọi f(3) ở main thành thân f chép ra với tham số thay bằng đối số (hàm không tham số thì giữ). Bỏ qua: tham-so.
     D2  HẰNG THAY THAM SỐ: hàm có tham số người chơi viết (hàm của em mới / hàm của màn) đổi thành hàm KHÔNG tham số, thân thay tham số bằng một đối số
         đã dùng ở lời gọi (thử từng đối số); lời gọi bỏ đối số. Bỏ qua: tham-so (ở thân hàm).
     E   HẰNG THAY CẢM BIẾN SỐ: trên bản B (điều kiện theo distance() / warm() đã thành nhánh / số lượt đã chạy), mọi distance() / warm() còn lại
         (d = distance(), range(distance()), forward(distance() + n)) thay bằng một giá trị đã đo ở sân 1 (thử từng giá trị đã gặp). Bỏ qua: distance / warm.
     F   ĐẢO LỰC: mọi "fast" ↔ "charge". Bỏ qua: luc (chọn lực không quan trọng).
   Khái niệm mỗi lách bỏ qua = khái niệm có trong lời giải chuẩn mà không còn trong bản lách (F: luc).
   LỖ = lách THẮNG mọi sân, ĐỦ 3 SAO (màn có cờ damLaThua: lách đếm cứng bỏ if / while / not / distance / warm mà thắng dù mấy sao), và khái niệm bỏ qua
   là khái niệm màn đang ÉP:
     - khái niệm mùa 2 (bien, tham-so, distance, warm, luc): chương ĐẦU TIÊN của mùa 2 (theo lộ trình) dùng nó, trong BỐN màn kể từ màn đầu tiên dùng nó
       ở chương đó (trình diễn → ép → ép; sau đó thả tự do, chỉ ghi thông tin);
     - khái niệm trong thân hàm người chơi viết ở màn này (hàm phải dùng lại được), màn có taoHam (def).
     Khái niệm mùa 1 (for / if / while / not / def / goi-ham) không ép lại ở mùa 2 ngoài hai luật thân hàm / taoHam.
   Còn kiểm: màn chiChay (trình diễn) bấm Chạy là 3 sao và chương trình khoá; cờ damLaThua (nếu gắn ở mùa 2) chỉ ở màn ép không chiChay, lời giải
   chuẩn không đâm tường ở sân nào. Màn hai robot (man.doi) bỏ qua (ghi).
   Chạy: node hoc/kiem-lach-mua-2.mjs [--tat-ca] [--bang] [--loi-gia]
     --tat-ca: in cả dòng không lỗ; --bang: in bảng chương · cái mới · trình diễn · ép · H (hoc/ban-giao/bang-t-mua-2.md);
     --loi-gia: nới ngưỡng sao (+9 ô, +9 nhịp) của màn ép distance / warm đầu tiên rồi dò: lách hằng (E / C) phải thành LỖ (máy dò tự chứng minh).
   Trượt (có LỖ ngoài CHAP_NHAN) thì thoát mã 1.
   ========================================================================== */
import { createRequire } from 'node:module';
import * as L from './lach-chung.mjs';
const require = createRequire(import.meta.url);
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const Cham = require('./cham.js');
const clone = (x) => JSON.parse(JSON.stringify(x));
const TAT_CA = process.argv.includes('--tat-ca');
const LOI_GIA = process.argv.includes('--loi-gia');
const BANG = process.argv.includes('--bang');

/** Lỗ chấp nhận: mã màn → lý do (ghi ở báo cáo T). */
const CHAP_NHAN = {};

const chuongMua1 = TT.goi.filter((g) => g.mua === 'mua-1').flatMap((g) => g.chuong);
const chuongMua2 = TT.goi.filter((g) => g.mua === 'mua-2').flatMap((g) => g.chuong);
const dsTruoc = M.danhSach.filter((m) => chuongMua1.includes(m.chuong));       // chỉ cộng dồn kho hàm của em
const ds = M.danhSach.filter((m) => chuongMua2.includes(m.chuong));
const KN_MUA_2 = ['bien', 'tham-so', 'distance', 'warm', 'luc'];

/* ------------------------------------------------------------------ khái niệm của một bài */
/** Hàm có tham số mà bài gọi được: tên → thamSo (hàm của em trong kho + hàm của màn). */
function hamThamSo(khoEm, hamMan) {
  const t = new Map();
  for (const h of khoEm) if ((h.thamSo || []).length) t.set(h.ten, h.thamSo);
  for (const h of hamMan || []) if ((h.thamSo || []).length) t.set(h.ten, h.thamSo);
  return t;
}
const goiCoDoi = (dong, tenHam) => dong.some((d) => [...tenHam.keys()].some((t) => new RegExp('\\b' + t + '\\s*\\([^)]+\\)').test(d)));
/** Khái niệm của một bài: chinh (main, trừ khi main khoá mà không phải trình diễn), ham (thân hàm người chơi viết: hàm của em mới + hàm của màn), tatCa. */
function khaiNiemBai(m, chinh, hamMoi, hamMan, khoEm) {
  const tenTS = hamThamSo(khoEm.concat(hamMoi), hamMan);
  const c = new Set(), h = new Set();
  if (!m.chinhCoDinh || m.chiChay) { for (const x of L.khaiNiem(chinh)) c.add(x); if (goiCoDoi(chinh, tenTS)) c.add('tham-so'); }
  for (const f of hamMoi.concat(hamMan || [])) {
    for (const x of L.khaiNiem(f.than)) h.add(x);
    if ((f.thamSo || []).length || goiCoDoi(f.than, tenTS)) h.add('tham-so');
  }
  const tatCa = new Set([...c, ...h]);
  if (hamMoi.length || (m.taoHam || []).length) tatCa.add('def');
  if (((m.hamCuaEmCan || []).length || (hamMan || []).length) && !m.chinhCoDinh) tatCa.add('goi-ham');
  return { chinh: c, ham: h, tatCa };
}
const khaiNiemCua = (m, khoEm) => khaiNiemBai(m, m.loiGiai.chinh || [], m.loiGiai.hamCuaEmMoi || [], m.loiGiai.hamCuaMan || [], khoEm);

/* ------------------------------------------------------------------ đang ép */
const chuongDau = {}, manDau = {};
const SO_MAN_EP = 4;
function dangEp(m, kn) {
  const ep = new Set();
  for (const x of kn.tatCa) if (KN_MUA_2.includes(x) && chuongDau[x] === m.chuong && m.so >= manDau[x] && m.so < manDau[x] + SO_MAN_EP) ep.add(x);
  if ((m.taoHam || []).length) ep.add('def');
  for (const x of kn.ham) if (x !== 'luc') ep.add(x);       // luc: chỉ ép ở chương luc-ban (lực trong thân hàm không phải bài học của chương khác)
  return ep;
}

/* ------------------------------------------------------------------ chấm lách */
function cham(m, bai, hamCuaEm) {
  const r = Cham.cham(m, bai, hamCuaEm);
  return { thang: r.thang, sao: r.sao, loi: r.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma).slice(0, 2).join(',') };
}
const DEM_CUNG = ['if', 'while', 'not', 'distance', 'warm'];

/* ------------------------------------------------------------------ dựng lách C / D / D2 / E / F */
/** Mọi tổ hợp giá trị cho các biến (tối đa hai biến, mỗi biến các giá trị trong ds). */
function toHop(bienDs, giaTri) {
  if (!bienDs.length) return [{}];
  const [b, ...con] = bienDs;
  return toHop(con, giaTri).flatMap((th) => giaTri.map((v) => Object.assign({ [b]: v }, th)));
}
/** C: bỏ dòng gán, thay tên biến bằng hằng theo bảng th. */
function hangThayBien(dong, th) {
  return dong.filter((d) => !L.laGan(d)).map((d) => { let x = d; for (const b in th) x = L.thayTen(x, b, String(th[b])); return x; });
}
/** E: thay distance() / warm() bằng giá trị. */
const thayCamBien = (dong, gt) => dong.map((d) => d.replace(/\bdistance\(\)/g, String(gt.distance)).replace(/\bwarm\(\)/g, String(gt.warm)));
/** Các biến được gán trong một đoạn. */
const bienCua = (dong) => [...new Set(dong.filter(L.laGan).map(L.tenGan))];

/* ------------------------------------------------------------------ chạy */
const kho = new Map();
const bang = [], loGhi = [];
let soLo = 0, soLoChapNhan = 0;
const loiCo = [];
let MAN_LOI_GIA = null;
// kho hàm của em cộng dồn qua mùa 1 (không dò)
for (const m of dsTruoc) if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
// chương đầu tiên / màn đầu tiên dùng khái niệm mùa 2 (cần kho tới lúc đó: tính trong vòng chính, trước khi dò màn)
{
  const k2 = new Map(kho);
  for (const m of ds) {
    const kn = khaiNiemCua(m, [...k2.values()]);
    for (const x of kn.tatCa) if (KN_MUA_2.includes(x) && !chuongDau[x]) { chuongDau[x] = m.chuong; manDau[x] = m.so; }
    if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) k2.set(h.ten, clone(h));
  }
  if (LOI_GIA) {
    const k3 = new Map(kho);
    for (const m of ds) {
      const kn = khaiNiemCua(m, [...k3.values()]);
      const ep = dangEp(m, kn);
      if (!MAN_LOI_GIA && !m.chiChay && !Array.isArray(m.doi) && (ep.has('distance') || ep.has('warm'))) MAN_LOI_GIA = m.ma;
      if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) k3.set(h.ten, clone(h));
    }
  }
}
for (const m of ds) {
  const truoc = clone([...kho.values()]);
  const lg = m.loiGiai;
  const hamEm = new Map(truoc.map((h) => [h.ten, h]));
  for (const h of lg.hamCuaEmMoi || []) hamEm.set(h.ten, clone(h));
  const hamCuaEm = [...hamEm.values()];
  if (!m.tietKiemNhip) for (const h of lg.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
  if (Array.isArray(m.doi)) { bang.push({ ma: m.ma, ghi: 'hai robot: bỏ qua' }); continue; }
  if (LOI_GIA && m.ma === MAN_LOI_GIA) m.sao = { o: m.sao.o + 9, nhip: m.sao.nhip + 9 };     // lỗi giả: nới ngưỡng sao của màn ép distance / warm đầu tiên: lách hằng phải thành 3 sao → LỖ
  const chuan = cham(m, { chinh: lg.chinh, hamCuaMan: lg.hamCuaMan || [] }, hamCuaEm);
  if (!chuan.thang || chuan.sao !== 3) { bang.push({ ma: m.ma, ghi: 'lời giải chuẩn không 3 sao: ' + JSON.stringify(chuan) }); continue; }
  const kn = khaiNiemCua(m, truoc), ep = dangEp(m, kn);
  // cờ đâm-là-thua (nếu gắn ở mùa 2): chỉ ở màn ép không chiChay; lời giải chuẩn không đâm tường ở sân nào
  const epThat = ep.size > 0 && !m.chiChay;
  if (m.damLaThua && !epThat) loiCo.push(m.ma + ': có cờ damLaThua mà không phải màn ép');
  if (m.damLaThua) {
    const rc = Cham.cham(m, { chinh: lg.chinh, hamCuaMan: lg.hamCuaMan || [] }, hamCuaEm);
    const sanDam = rc.theoSan.map((s, i) => (s.chanDoan.some((c) => c.ma === 'dam-tuong') ? i + 1 : 0)).filter(Boolean);
    if (sanDam.length) loiCo.push(m.ma + ': lời giải chuẩn đâm tường ở sân ' + sanDam.join(', ') + ' (màn có cờ damLaThua)');
  }
  if (m.chiChay) {
    const mau = cham(m, { chinh: m.maMau.chinh, hamCuaMan: m.maMau.hamCuaMan || [] }, truoc);
    const ok = m.chinhCoDinh === true && mau.thang && mau.sao === 3 && !(m.taoHam || []).length;
    bang.push({ ma: m.ma, ghi: 'màn trình diễn (chiChay): ' + (ok ? 'bấm Chạy là 3 sao, chương trình khoá' : 'HỎNG ' + JSON.stringify(mau) + ' chinhCoDinh=' + m.chinhCoDinh), hong: !ok });
    if (!ok) soLo++;
    continue;
  }

  // 1. chạy có dấu
  const cd = L.chenDau(lg.chinh);
  const hamMoi = (lg.hamCuaEmMoi || []).map((h) => ({ h, cd: L.chenDau(h.than) }));
  const hamMan = (lg.hamCuaMan || []).map((h) => ({ h, cd: L.chenDau(h.than) }));
  const khoDau = [...hamEm.values()].map((h) => { const x = hamMoi.find((y) => y.h.ten === h.ten); return x ? { ten: h.ten, thamSo: h.thamSo, than: x.cd.dong } : h; });
  const rv = L.chayVet(Cham, m, { chinh: cd.dong, hamCuaMan: hamMan.map((x) => ({ ten: x.h.ten, thamSo: x.h.thamSo, than: x.cd.dong })) }, khoDau);
  if (!rv.thang) { bang.push({ ma: m.ma, ghi: 'chạy có dấu không thắng: ' + rv.chanDoan.map((c) => c.ma).join(',') }); continue; }
  const vet = L.lenhCua(rv, 0);
  const soSan = rv.theoSan.length;
  const vets = rv.theoSan.map((_, s) => L.lenhCua(rv, s));

  // 2. các lời giải lách: { ten, bai: { chinh, hamCuaMan }, kho, boQua? }
  const lach = [];
  const khoVoi = (doi) => [...hamEm.values()].map((h) => { const x = doi.get(h.ten); return x ? { ten: h.ten, thamSo: x.thamSo === undefined ? h.thamSo : x.thamSo, than: x.than } : h; });
  if (!m.chinhCoDinh) {
    lach.push({ ten: 'A1', bai: { chinh: L.duoiGoc(vet, !!m.lucBan), hamCuaMan: lg.hamCuaMan || [] }, kho: hamCuaEm });
    lach.push({ ten: 'A2', bai: { chinh: L.duoiGoi(vet, cd.ban, lg.chinh), hamCuaMan: lg.hamCuaMan || [] }, kho: hamCuaEm });
  }
  function demMax(cot, ten, ban) {
    const ds = vets.map((v) => L.demDau(v, cot, ten, ban)), truoc = {}, than = {};
    for (const d of ds) for (const g of new Set([...Object.keys(d.truoc), ...Object.keys(d.than)])) {
      const k = d.truoc[g] ? Math.round((d.than[g] || 0) / d.truoc[g]) : 0;
      truoc[g] = 1; than[g] = Math.max(than[g] || 0, k);
    }
    return { truoc, than };
  }
  const banB = {};
  for (const [tenLach, dem] of [['B', (cot, ten, ban) => L.demDau(vet, cot, ten, ban)], ['B2', demMax]]) {
    if (tenLach === 'B2' && soSan === 1) continue;
    const chinhB = m.chinhCoDinh ? lg.chinh : L.doDieuKien(lg.chinh, dem('chinh', null, cd.ban));
    const hamManB = hamMan.map((x) => ({ ten: x.h.ten, thamSo: x.h.thamSo, than: L.doDieuKien(x.h.than, dem('hamMan', x.h.ten, x.cd.ban)) }));
    const doiB = new Map(hamMoi.map((x) => [x.h.ten, { than: L.doDieuKien(x.h.than, dem('hamEm', x.h.ten, x.cd.ban)) }]));
    const b = { ten: tenLach, bai: { chinh: chinhB, hamCuaMan: hamManB }, kho: khoVoi(doiB) };
    lach.push(b);
    banB[tenLach] = b;
  }
  const B = banB.B;
  // C: hằng thay biến (trên bản B): biến ở main và ở thân hàm người chơi viết; thử mọi tổ hợp 0..8 (tối đa hai biến mỗi đoạn)
  {
    const doan = [{ cot: 'chinh', dong: B.bai.chinh }].concat(B.bai.hamCuaMan.map((h) => ({ cot: 'hamMan', ten: h.ten, dong: h.than })), B.kho.filter((h) => hamMoi.some((x) => x.h.ten === h.ten)).map((h) => ({ cot: 'hamEm', ten: h.ten, dong: h.than })));
    const coBien = doan.filter((d) => bienCua(d.dong).length);
    if (coBien.length) {
      const GIA_TRI = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const bienTatCa = [...new Set(coBien.flatMap((d) => bienCua(d.dong)))].slice(0, 2);
      const ung = toHop(bienTatCa, GIA_TRI);
      lach.push({ ten: 'C', nhieu: ung.map((th) => ({
        nhan: JSON.stringify(th),
        bai: { chinh: hangThayBien(B.bai.chinh, th), hamCuaMan: B.bai.hamCuaMan.map((h) => ({ ten: h.ten, thamSo: h.thamSo, than: hangThayBien(h.than, th) })) },
        kho: B.kho.map((h) => (hamMoi.some((x) => x.h.ten === h.ten) ? { ten: h.ten, thamSo: h.thamSo, than: hangThayBien(h.than, th) } : h))
      })) });
    }
  }
  // D: duỗi lời gọi hàm có tham số ở main (hàm của em trong kho / hàm mới / hàm của màn)
  {
    const tenTS = new Map();
    for (const h of hamCuaEm) if ((h.thamSo || []).length) tenTS.set(h.ten, h);
    for (const h of lg.hamCuaMan || []) if ((h.thamSo || []).length) tenTS.set(h.ten, h);
    if (!m.chinhCoDinh && tenTS.size && lg.chinh.some((d) => [...tenTS.keys()].some((t) => new RegExp('\\b' + t + '\\s*\\([^)]+\\)').test(d)))) {
      lach.push({ ten: 'D', bai: { chinh: L.duoiThamSo(lg.chinh, tenTS), hamCuaMan: lg.hamCuaMan || [] }, kho: hamCuaEm });
    }
    // D2: hàm có tham số NGƯỜI CHƠI VIẾT thành hàm không tham số, thân thay tham số bằng một đối số đã dùng (thử từng đối số); mọi lời gọi bỏ đối số
    const viet = (lg.hamCuaEmMoi || []).map((h) => ({ h, loai: 'em' })).concat((lg.hamCuaMan || []).map((h) => ({ h, loai: 'man' }))).filter((x) => (x.h.thamSo || []).length);
    for (const x of viet) {
      const cacDoan = [lg.chinh].concat((lg.hamCuaEmMoi || []).concat(lg.hamCuaMan || []).map((h) => h.than));
      const doiSo = L.doiSoCua(x.h.ten, cacDoan);
      const ung = [...new Set(doiSo.map((a) => a.join(', ')))];
      if (!ung.length) continue;
      const boDoi = (dong) => dong.map((d) => d.replace(new RegExp('\\b' + x.h.ten + '\\s*\\([^)]*\\)', 'g'), x.h.ten + '()'));
      lach.push({ ten: 'D2', boQua: ['tham-so'], nhieu: ung.map((a) => {
        const doi = a.split(',').map((s) => s.trim());
        let than = x.h.than.slice();
        x.h.thamSo.forEach((p, i) => { than = than.map((d) => L.thayTen(d, p, doi[i] === undefined ? '0' : doi[i])); });
        const hamManD = (lg.hamCuaMan || []).map((h) => (h === x.h ? { ten: h.ten, thamSo: [], than } : { ten: h.ten, thamSo: h.thamSo, than: boDoi(h.than) }));
        const khoD = hamCuaEm.map((h) => (x.loai === 'em' && h.ten === x.h.ten ? { ten: h.ten, thamSo: [], than } : (hamMoi.some((y) => y.h.ten === h.ten) ? { ten: h.ten, thamSo: h.thamSo, than: boDoi(h.than) } : h)));
        return { nhan: x.h.ten + '(' + a + ')', bai: { chinh: boDoi(lg.chinh), hamCuaMan: hamManD }, kho: khoD };
      }) });
    }
  }
  // E: hằng thay cảm biến số (trên bản B): thử từng giá trị đã đo ở sân 1 (distance: các khoảng đã gặp; warm: True / False)
  {
    const conCamBien = (b) => [b.bai.chinh].concat(b.bai.hamCuaMan.map((h) => h.than), b.kho.filter((h) => hamMoi.some((x) => x.h.ten === h.ten)).map((h) => h.than)).some((dong) => dong.some((d) => /\b(distance|warm)\(\)/.test(d)));
    if (conCamBien(B)) {
      const gt = { distance: new Set(), warm: new Set() };
      const gom = (cot, ten, ban) => { const g = L.giaTriCamBien(vet, cot, ten, ban); for (const k in g) for (const v of g[k]) gt[k.split(':')[0]].add(v); };
      gom('chinh', null, cd.ban); hamMan.forEach((x) => gom('hamMan', x.h.ten, x.cd.ban)); hamMoi.forEach((x) => gom('hamEm', x.h.ten, x.cd.ban));
      if (!gt.distance.size) gt.distance.add(0);
      if (!gt.warm.size) gt.warm.add('False');
      const ung = [...gt.distance].flatMap((d) => [...gt.warm].map((w) => ({ distance: d, warm: w })));
      lach.push({ ten: 'E', nhieu: ung.map((g) => ({
        nhan: 'distance=' + g.distance + ' warm=' + g.warm,
        bai: { chinh: thayCamBien(B.bai.chinh, g), hamCuaMan: B.bai.hamCuaMan.map((h) => ({ ten: h.ten, thamSo: h.thamSo, than: thayCamBien(h.than, g) })) },
        kho: B.kho.map((h) => (hamMoi.some((x) => x.h.ten === h.ten) ? { ten: h.ten, thamSo: h.thamSo, than: thayCamBien(h.than, g) } : h))
      })) });
    }
  }
  // F: đảo lực "fast" ↔ "charge" ở main (nếu không khoá) và thân hàm người chơi viết
  if (kn.tatCa.has('luc')) {
    const dao = (dong) => dong.map((d) => d.replace(/"(fast|charge)"/g, (s, p) => (p === 'fast' ? '"charge"' : '"fast"')));
    lach.push({ ten: 'F', boQua: ['luc'], bai: { chinh: m.chinhCoDinh ? lg.chinh : dao(lg.chinh), hamCuaMan: (lg.hamCuaMan || []).map((h) => ({ ten: h.ten, thamSo: h.thamSo, than: dao(h.than) })) },
      kho: hamCuaEm.map((h) => (hamMoi.some((x) => x.h.ten === h.ten) ? { ten: h.ten, thamSo: h.thamSo, than: dao(h.than) } : h)) });
  }

  // 3. chấm từng lách; bỏ qua = khái niệm chuẩn có mà bản lách không còn
  for (const l of lach) {
    const ung = l.nhieu || [l];
    let tot = null, boQua = null;
    for (const u of ung) {
      const hamMoiU = u.kho.filter((h) => hamMoi.some((x) => x.h.ten === h.ten));
      const knU = khaiNiemBai(m, u.bai.chinh, hamMoiU, u.bai.hamCuaMan, truoc);
      const bq = l.boQua || [...kn.tatCa].filter((x) => !knU.tatCa.has(x) && x !== 'def' && x !== 'goi-ham');
      if (!bq.length) continue;
      const kq = cham(m, u.bai, u.kho);
      const diem = (kq.thang ? 10 + kq.sao : 0);
      if (!tot || diem > tot.diem) { tot = Object.assign({ diem, u, bq }, kq); boQua = bq; }
      if (kq.thang && kq.sao === 3) break;
    }
    if (!tot) continue;
    const kq = tot, u = tot.u;
    const epBo = boQua.filter((x) => ep.has(x));
    const demCung = boQua.some((x) => DEM_CUNG.includes(x));
    const lo = kq.thang && (kq.sao === 3 || (!!m.damLaThua && demCung)) && epBo.length > 0;
    const code = u.bai.chinh.concat(u.kho.filter((h) => hamMoi.some((x) => x.h.ten === h.ten)).flatMap((h) => ['def ' + h.ten + '(' + (h.thamSo || []).join(', ') + '):'].concat(h.than.map((d) => '    ' + d))),
      u.bai.hamCuaMan.flatMap((h) => ['def ' + h.ten + '(' + (h.thamSo || []).join(', ') + '):  # hàm của màn'].concat(h.than.map((d) => '    ' + d))));
    const dong = { ma: m.ma, ten: m.ten, lach: l.ten + (u.nhan ? ' ' + u.nhan : ''), boQua, ep: [...ep], thang: kq.thang, sao: kq.sao, loi: kq.loi, lo, code };
    bang.push(dong);
    if (lo) { if (CHAP_NHAN[m.ma]) soLoChapNhan++; else { soLo++; loGhi.push(dong); } }
  }
}

/* ------------------------------------------------------------------ bảng (--bang): chương · cái mới · trình diễn · ép · H */
if (BANG) {
  const fs = await import('node:fs'); const vm = await import('node:vm'); const path = await import('node:path');
  const goc = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
  const docGame = (f) => fs.readFileSync(path.join(goc, 'game', f), 'utf8');
  const rong = () => null;
  const ctx = vm.createContext({ console, document: { addEventListener() {}, getElementById: rong, querySelector: rong, querySelectorAll: () => [], createElement: () => ({ style: {}, appendChild() {}, classList: { add() {}, remove() {}, contains: () => false } }), head: null }, Luu: { daXem: () => false, datDaXem: () => true }, setTimeout, clearTimeout });
  ctx.window = ctx;
  vm.runInContext(docGame('huong-dan.js'), ctx); vm.runInContext(docGame('huong-dan-man.js'), ctx);
  const HDM = ctx.HuongDanMan || {};
  const daThay = new Set();
  const kho2 = new Map();
  for (const m of dsTruoc) if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho2.set(h.ten, clone(h));
  const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]).flat();
  const TEN_KN = { bien: 'biến', 'tham-so': 'hàm có tham số', distance: 'distance()', warm: 'warm()', luc: 'lực bắn fast / charge', def: 'tạo hàm', 'goi-ham': 'gọi hàm' };
  const moiCua = (m) => {
    const kq = [], ghi = (k, t) => { if (!daThay.has(k)) { daThay.add(k); kq.push(t); } };
    const kn = khaiNiemCua(m, [...kho2.values()]).tatCa;
    for (const x of kn) if (KN_MUA_2.includes(x)) ghi('kn:' + x, TEN_KN[x]);
    const r = m.robot || {};
    if (r.than === 'xich' || m.loaiRobot === 'xich') ghi('than:xich', 'thân xích');
    for (const h of m.hamGoc || []) if (['shoot', 'shoot_back', 'distance', 'warm'].includes(h)) ghi('lenh:' + h, 'lệnh ' + h);
    if (sanCua(m).some((d) => /[<>^v]/.test(d))) ghi('san:bang', 'băng chuyền');
    if (sanCua(m).some((d) => /H/.test(d))) ghi('vat:thung', 'thùng nặng');
    if (sanCua(m).some((d) => /N/.test(d))) ghi('vat:nut', 'nút bắn');
    if (sanCua(m).some((d) => /C/.test(d))) ghi('vat:cua', 'cửa');
    if (m.xichDay) ghi('co:xichDay', 'xích đẩy thùng');
    if (m.lucBan || (m.doi || []).some((d) => d.lucBan)) ghi('co:lucBan', 'chọn lực bắn');
    if (m.nutBat) ghi('co:nutBat', 'nút bật sẵn (nóng)');
    if (m.beSung) ghi('co:beSung', 'bệ súng xích');
    if (Array.isArray(m.doi)) ghi('doi', 'hai robot');
    if (Array.isArray(m.san[0])) ghi('nhieu-san', 'nhiều sân');
    return kq;
  };
  const dongBang = new Map(bang.filter((d) => !d.ghi).map((d) => [d.ma, bang.filter((x) => x.ma === d.ma && !x.ghi)]));
  console.log('# Bảng gói T mùa 2 (sinh bởi node hoc/kiem-lach-mua-2.mjs --bang)\n');
  console.log('Cột "mới": khái niệm / lệnh / part / cơ chế lần đầu xuất hiện trong lộ trình mùa 2 tại màn đó. "HD": có hướng dẫn từng bước (huong-dan-man.js). "trình diễn": chiChay. "ép": khái niệm màn đang ép (máy dò lách kiểm; "lệnh / cơ chế" không có lách cấu trúc). "lỗ": lách thắng ở khái niệm đang ép. "đâm là thua": cờ damLaThua.\n');
  let c = '';
  for (const m of ds) {
    if (m.chuong !== c) { c = m.chuong; console.log('\n## ' + c + ' (' + (TT.ten[c] || '') + ')\n\n| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |\n|---|---|---|---|---|---|---|---|---|'); }
    const moi = moiCua(m);
    const kn = Array.isArray(m.doi) ? { tatCa: new Set(), ham: new Set() } : khaiNiemCua(m, [...kho2.values()]);
    const ep = Array.isArray(m.doi) ? [] : [...dangEp(m, kn)];
    const lo = (dongBang.get(m.ma) || []).filter((d) => d.lo).map((d) => d.lach.split(' ')[0]);
    console.log('| ' + [m.so, m.ma, m.ten, moi.join(', '), HDM[m.ma] ? 'có' : '', m.chiChay ? 'có' : '', ep.join(', '), lo.length ? 'LỖ ' + [...new Set(lo)].join(',') : '', m.damLaThua ? 'có' : ''].join(' | ') + ' |');
    if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho2.set(h.ten, clone(h));
  }
  process.exit(0);
}

/* ------------------------------------------------------------------ in */
console.log('Khái niệm mùa 2 · chương đầu tiên dùng (màn đầu tiên): ' + Object.entries(chuongDau).map(([k, c]) => k + '=' + c + '.' + manDau[k]).join(' · '));
console.log('\nmàn | lách | bỏ qua | đang ép | kết quả | LỖ');
let chuongIn = '';
for (const d of bang) {
  const c = M.timMa(d.ma).chuong;
  if (c !== chuongIn) { chuongIn = c; console.log('--- ' + c); }
  if (d.ghi) { if (TAT_CA || d.hong || !/hai robot/.test(d.ghi)) console.log(d.ma + ' | ' + d.ghi); continue; }
  const kq = d.thang ? d.sao + ' sao' : 'thua' + (d.loi ? ' (' + d.loi + ')' : '');
  const lo = d.lo ? (CHAP_NHAN[d.ma] ? 'LỖ (chấp nhận: ' + CHAP_NHAN[d.ma] + ')' : 'LỖ') : '';
  if (TAT_CA || d.lo || (d.thang && d.boQua.some((x) => d.ep.includes(x)))) console.log([d.ma + ' ' + d.ten, d.lach, d.boQua.join(','), d.ep.join(','), kq, lo].join(' | '));
}
if (loiCo.length) { soLo += loiCo.length; console.log('\nCờ đâm-là-thua (damLaThua) sai:\n  ' + loiCo.join('\n  ')); }
if (loGhi.length) {
  console.log('\nLời giải lách thắng ở màn đang ép:');
  for (const d of loGhi) console.log('  ' + d.ma + ' [' + d.lach + ']: ' + d.code.join(' / '));
}
const theoChuong = {};
for (const d of loGhi) theoChuong[M.timMa(d.ma).chuong] = (theoChuong[M.timMa(d.ma).chuong] || 0) + 1;
console.log('\nLỗ theo chương: ' + (Object.entries(theoChuong).map(([c, n]) => c + ' ' + n).join(' · ') || 'không'));
if (LOI_GIA) {
  const co = MAN_LOI_GIA && loGhi.some((d) => d.ma === MAN_LOI_GIA);
  console.log('Lỗi giả (nới ngưỡng sao của ' + MAN_LOI_GIA + ' thêm 9 ô / 9 nhịp): ' + (co ? 'máy dò BẮT ĐƯỢC (ĐẠT)' : 'máy dò KHÔNG bắt được (HỎNG)' + (MAN_LOI_GIA ? '' : ': không có màn ép distance / warm')));
  process.exit(co ? 0 : 1);
}
console.log((soLo ? 'HỎNG ' : 'ĐẠT ') + soLo + ' lỗ ngoài danh sách chấp nhận · ' + soLoChapNhan + ' lỗ chấp nhận · ' + bang.filter((d) => !d.ghi).length + ' phép dò trên ' + ds.length + ' màn mùa 2.');
if (soLo) process.exitCode = 1;

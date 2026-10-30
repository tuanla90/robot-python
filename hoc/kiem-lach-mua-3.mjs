/* ============================================================================
   kiem-lach-mua-3.mjs — MÁY DÒ "LỜI GIẢI LÁCH" cho MÙA 3 (30/10 phiên Mùa 3; chép khuôn kiem-lach-mua-2.mjs, phần chung ở lach-chung.mjs).
   Màn giới thiệu một khái niệm mới phải ÉP dùng nó: lời giải KHÔNG dùng nó thì phải THUA hoặc KHÔNG ĐỦ SAO. Các lách như mùa 2
   (A1 duỗi gốc, A2 duỗi lời gọi, B / B2 dỡ điều kiện theo vết, C hằng thay biến, D / D2 duỗi tham số), thêm cho mùa 3:
     G   HẰNG THAY CẢM BIẾN TỪ: trên bản B, mọi front_metal() còn lại thay bằng True / False, mọi front_pole() bằng "N" / "S" / "none" (thử mọi tổ hợp).
         Bỏ qua: metal / pole.
   Khái niệm mùa 3 (KN_MUA_3): va-hoac (and / or trong điều kiện), chuoi (chuỗi làm dữ liệu: for c in <biến>, so == "…"), metal (front_metal()),
   pole (front_pole()). Ép ở chương ĐẦU TIÊN của mùa 3 dùng nó, trong BỐN màn kể từ màn đầu tiên dùng nó ở chương đó; khái niệm trong thân hàm
   người chơi viết và màn có taoHam ép như mùa 2. Màn hai robot (man.doi) bỏ qua (ghi). Khái niệm mùa 1–2 không ép lại.
   Chạy: node hoc/kiem-lach-mua-3.mjs [--tat-ca] [--loi-gia]
     --loi-gia: nới ngưỡng sao (+9 ô, +9 nhịp) của màn ép front_metal / front_pole đầu tiên rồi dò: lách G / B phải thành LỖ (máy dò tự chứng minh).
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

/** Lỗ chấp nhận: mã màn → lý do (ghi ở báo cáo T). */
const CHAP_NHAN = {
  'che-bai-tu.4': 'tạo loop_right(k) chỉ gọi loop_right(3); k khác (loop_right(1)) gặp ở tong-hop-3.3 nên hàm cứng số sẽ lộ ra sau; tham số là khái niệm mùa 2, không phải cái mới của gói',
  'che-bai-tu.9': 'màn sửa hàm của màn loop_left(k): bài học là đổi chiều rẽ, không phải tham số',
  'che-doc-cuc.2': 'D2 thay tham số p bằng chính biến p ở main (p = front_pole()): vẫn đọc cực và so chuỗi, không phải lách',
  'nam-cham.6': 'màn có sẵn (mùa 2 cũ) một sân, tạo grip(); doc-cuc.2 đứng trước đã ép front_pole() bằng hai sân',
  'che-nam-cham.7': 'màn có sẵn (mùa 2 cũ) một sân: sửa hàm của màn fixed_grip',
  'che-nam-cham.5': 'màn có sẵn (mùa 2 cũ) một sân: dùng hàm sort() của em'
};

const chuongMua3 = new Set(M.mua3.flatMap((g) => g.chuong.map((c) => c[0])));
const dauMua3 = M.danhSach.findIndex((m) => chuongMua3.has(m.chuong));
const dsTruoc = M.danhSach.slice(0, dauMua3);                                   // chỉ cộng dồn kho hàm của em (mùa 1–2)
const ds = M.danhSach.filter((m) => chuongMua3.has(m.chuong));
const KN_MUA_3 = ['va-hoac', 'chuoi', 'metal', 'pole'];
/** Khái niệm của các dòng code: mùa 1–2 (lach-chung) và mùa 3. */
function khaiNiem3(dong) {
  const k = L.khaiNiem(dong);
  for (const d of dong) {
    if (/^\s*(if|elif|while)\b.*\b(and|or)\b/.test(d)) k.add('va-hoac');
    if (/^\s*for\s+\w+\s+in\s+(?!range\b)/.test(d) || /==\s*"/.test(d)) k.add('chuoi');
    if (/\bfront_metal\(\)/.test(d)) k.add('metal');
    if (/\bfront_pole\(\)/.test(d)) k.add('pole');
  }
  return k;
}

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
  if (!m.chinhCoDinh || m.chiChay) { for (const x of khaiNiem3(chinh)) c.add(x); if (goiCoDoi(chinh, tenTS)) c.add('tham-so'); }
  for (const f of hamMoi.concat(hamMan || [])) {
    for (const x of khaiNiem3(f.than)) h.add(x);
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
  for (const x of kn.tatCa) if (KN_MUA_3.includes(x) && chuongDau[x] === m.chuong && m.so >= manDau[x] && m.so < manDau[x] + SO_MAN_EP) ep.add(x);
  if ((m.taoHam || []).length) ep.add('def');
  for (const x of kn.ham) if (x !== 'luc') ep.add(x);       // luc: chỉ ép ở chương luc-ban (lực trong thân hàm không phải bài học của chương khác)
  return ep;
}

/* ------------------------------------------------------------------ chấm lách */
function cham(m, bai, hamCuaEm) {
  const r = Cham.cham(m, bai, hamCuaEm);
  return { thang: r.thang, sao: r.sao, loi: r.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma).slice(0, 2).join(',') };
}
const DEM_CUNG = ['if', 'while', 'not', 'distance', 'warm', 'metal', 'pole', 'va-hoac'];

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
// kho hàm của em cộng dồn qua mùa 1–2 (không dò)
for (const m of dsTruoc) if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
// chương đầu tiên / màn đầu tiên dùng khái niệm mùa 3 (cần kho tới lúc đó: tính trong vòng chính, trước khi dò màn)
{
  const k2 = new Map(kho);
  for (const m of ds) {
    const kn = khaiNiemCua(m, [...k2.values()]);
    for (const x of kn.tatCa) if (KN_MUA_3.includes(x) && !chuongDau[x]) { chuongDau[x] = m.chuong; manDau[x] = m.so; }
    if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) k2.set(h.ten, clone(h));
  }
  if (LOI_GIA) {
    const k3 = new Map(kho);
    for (const m of ds) {
      const kn = khaiNiemCua(m, [...k3.values()]);
      const ep = dangEp(m, kn);
      if (!MAN_LOI_GIA && !m.chiChay && !Array.isArray(m.doi) && (ep.has('metal') || ep.has('pole'))) MAN_LOI_GIA = m.ma;
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
  if (LOI_GIA && m.ma === MAN_LOI_GIA) {                // lỗi giả: màn ép front_metal / front_pole đầu tiên chỉ còn SÂN 1 và nới ngưỡng sao: lách B / G phải thành LỖ
    m.sao = { o: m.sao.o + 9, nhip: m.sao.nhip + 9 };
    const soSanGoc = Array.isArray(m.san[0]) ? m.san.length : 0;
    if (soSanGoc) for (const k of Object.keys(m)) if (Array.isArray(m[k]) && m[k].length === soSanGoc && k !== 'loiSai' && k !== 'goiY' && k !== 'hamGoc' && k !== 'cauTruc' && k !== 'taoHam' && k !== 'hamCuaEmCan') m[k] = m[k][0];
  }
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
  // màn không trình diễn: mã mẫu (người chơi thấy sẵn) không được thắng 3 sao, nếu không thì màn ép chẳng ép gì (nghiệm thu gói T: tham-so.2 mã mẫu dùng sẵn n vẫn xanh hết 90 bộ)
  if (!m.chiChay && m.maMau) {
    const mm = cham(m, { chinh: m.maMau.chinh || [], hamCuaMan: m.maMau.hamCuaMan || [] }, truoc);
    if (mm.thang && mm.sao === 3) { bang.push({ ma: m.ma, ghi: 'HỎNG mã mẫu đã thắng 3 sao (không phải màn trình diễn)', hong: true }); soLo++; }
  }
  if (m.chiChay) {
    const mau = cham(m, { chinh: m.maMau.chinh, hamCuaMan: m.maMau.hamCuaMan || [] }, truoc);
    const ok = m.chinhCoDinh === true && mau.thang && mau.sao === 3 && !(m.taoHam || []).length;
    bang.push({ ma: m.ma, ghi: 'màn trình diễn (chiChay): ' + (ok ? 'bấm Chạy là 3 sao, chương trình khoá' : 'HỎNG ' + JSON.stringify(mau) + ' chinhCoDinh=' + m.chinhCoDinh), hong: !ok });
    if (!ok) soLo++;
    continue;
  }

  // 1. chạy có dấu (nhện không gắn được cảm biến khoảng cách để làm dấu front_clear: bỏ qua, ghi lại; ở mùa 3 nhện cũng không có cảm biến nào để lách)
  if (m.loaiRobot === 'nhen') { bang.push({ ma: m.ma, ghi: 'nhện: không chèn được dấu, bỏ qua' }); continue; }
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

  // G: hằng thay cảm biến từ (trên bản B): front_metal() → True / False, front_pole() → "N" / "S" / "none"
  {
    const doanCua = (b) => [b.bai.chinh].concat(b.bai.hamCuaMan.map((h) => h.than), b.kho.filter((h) => hamMoi.some((x) => x.h.ten === h.ten)).map((h) => h.than));
    const co = (b, re) => doanCua(b).some((dong) => dong.some((d) => re.test(d)));
    const coMetal = co(B, /front_metal\(\)/), coPole = co(B, /front_pole\(\)/);
    if (coMetal || coPole) {
      const ung = (coMetal ? ['True', 'False'] : [null]).flatMap((a) => (coPole ? ['"N"', '"S"', '"none"'] : [null]).map((p) => ({ metal: a, pole: p })));
      const thay = (dong, g) => dong.map((d) => { let x = d; if (g.metal) x = x.replace(/front_metal\(\)/g, g.metal); if (g.pole) x = x.replace(/front_pole\(\)/g, g.pole); return x; });
      lach.push({ ten: 'G', nhieu: ung.map((g) => ({
        nhan: (g.metal ? 'metal=' + g.metal + ' ' : '') + (g.pole ? 'pole=' + g.pole : ''),
        bai: { chinh: thay(B.bai.chinh, g), hamCuaMan: B.bai.hamCuaMan.map((h) => ({ ten: h.ten, thamSo: h.thamSo, than: thay(h.than, g) })) },
        kho: B.kho.map((h) => (hamMoi.some((x) => x.h.ten === h.ten) ? { ten: h.ten, thamSo: h.thamSo, than: thay(h.than, g) } : h))
      })) });
    }
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

/* ------------------------------------------------------------------ in */
console.log('Khái niệm mùa 3 · chương đầu tiên dùng (màn đầu tiên): ' + Object.entries(chuongDau).map(([k, c]) => k + '=' + c + '.' + manDau[k]).join(' · '));
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
  console.log('Lỗi giả (' + MAN_LOI_GIA + ' chỉ còn sân 1, nới ngưỡng sao thêm 9 ô / 9 nhịp): ' + (co ? 'máy dò BẮT ĐƯỢC (ĐẠT)' : 'máy dò KHÔNG bắt được (HỎNG)' + (MAN_LOI_GIA ? '' : ': không có màn ép distance / warm')));
  process.exit(co ? 0 : 1);
}
console.log((soLo ? 'HỎNG ' : 'ĐẠT ') + soLo + ' lỗ ngoài danh sách chấp nhận · ' + soLoChapNhan + ' lỗ chấp nhận · ' + bang.filter((d) => !d.ghi).length + ' phép dò trên ' + ds.length + ' màn mùa 3.');
if (soLo) process.exitCode = 1;

/* ============================================================================
   kiem-cau-do-mua-9.mjs — máy kiểm DẤU CÂU ĐỐ mùa 9 (gói M9D1 4/11; đặc tả: hoc/KE-HOACH-MUA-9-TO-HOP.md mục 8c; danh sách 200 câu đố: hoc/MUA-9-200-CAU-DO.md) của "Mật Lệnh Robot".
   Mỗi màn mùa 9 khai dấu câu đố:
     man.cauDo = { doi: ['CH', 'DR'] | null, lap: 'gai+kep+khoang-cach' | null, coChe: ['bun', 'nut-de'], cuu: 'hang' | 'may' | 'nguoi' | null, meo: 'giu-cua' }
   Máy kiểm đọc MỌI màn có man.cauDo trong lộ trình (hoc/lo-trinh-hoc.js M.danhSach, cả màn cất) và kiểm:
     (a) dấu khai đủ, trường hợp lệ: doi là mảng mã cỗ máy (CoMay.DS) hay lap là chuỗi part 'than+tay+camBien' (LapRap.DANH_MUC), ít nhất một trong hai; coChe mảng chuỗi; cuu trong CUU; meo trong 12 mẹo MEO;
     (b) không trùng dấu: hai màn mùa 9 không được trùng cả bộ (doi hay lap, coChe, cuu, meo);
     (c) không trùng thật: chạy lời giải mẫu qua máy chấm, rút CHUỖI SỰ KIỆN CHÍNH của mỗi robot (SU_KIEN_CHINH, bỏ lặp liền nhau, gắn sự kiện sân cho robot đang đứng ở ô đó);
         hai màn cùng đội (thân của từng robot) và chuỗi giống hệt là trùng, kể cả khi dấu khác — so cả với 140 màn đội gói 9 của mùa 2–8 (CHUONG_GOI_9_CU) để mùa 9 không chép màn cũ;
     (d) khai đúng: mẹo khai phải thấy trong sự kiện. Kiểm được 4 mẹo: giu-cua (robot A đè nút M trong lúc robot B đứng trên ô cửa), lam-cau (A lấp hố / rắc cát / ghép bè / kéo bè ở ô X, sau đó B đứng lên X),
         don-loi (A nhấc / hút / móc / kéo / ném / đập vật ở ô X, sau đó B đứng lên X), cuu-kip (có người tới trạm / tàu rời / hết pin tránh được: sự kiện nguoi-toi-tram, xong-giao-tau, tau-roi, sac-pin);
         8 mẹo còn lại (tiep-suc, nhuong-duong, cho-tin-hieu, song-song, doi-vai, doc-roi-chon, dan-duong, nhieu-san) báo "chưa kiểm được" (đếm riêng, KHÔNG cho qua im lặng, không tính hỏng).
   Lộ trình hiện CHƯA màn nào khai cauDo (gói D2 mới dựng màn) → máy kiểm tự chứng minh bằng MÀN GIẢ trong bộ nhớ: hai màn giả trùng dấu → (b) kêu; hai màn giả khác dấu nhưng cùng đội + chuỗi → (c) kêu;
   khai giu-cua mà không có nut-de → (d) kêu; bộ dò lam-cau / don-loi / cuu-kip thử trên chuỗi sự kiện dựng tay.
   API cho máy kiểm khác / gói D2: xuất hàm qua `export` (dauCua, chuoiCua, kiemDau, kiemMeo, MEO, CUU).
   Chạy: node hoc/kiem-cau-do-mua-9.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const LapRap = require(path.join(day, 'lap-rap.js'));
const CoMay = require(path.join(day, 'co-may.js'));
const Cham = require(path.join(day, 'cham.js'));
const ManHoc = require(path.join(day, 'man-chuoi-1.js'));
const M = require(path.join(day, 'lo-trinh-hoc.js'));

let dat = 0, hong = 0, chuaKiem = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); } else { hong++; console.log('  ✗ HỎNG ' + ten + (chiTiet ? '\n      ' + String(chiTiet).slice(0, 1200) : '')); }
}
const J = (o) => JSON.stringify(o);
const clone = (o) => JSON.parse(JSON.stringify(o));

/* ------------------------------------------------------------- đặc tả dấu (mục 8c) */
export const MEO = {
  'don-loi': 'dọn lối', 'giu-cua': 'giữ cửa', 'tiep-suc': 'tiếp sức (đưa vật cho bạn)', 'lam-cau': 'làm cầu (cầu phao, lấp hố, rắc cát)', 'nhuong-duong': 'nhường đường',
  'cho-tin-hieu': 'chờ tín hiệu (cảm biến)', 'song-song': 'song song (trần nhịp buộc làm cùng lúc)', 'doi-vai': 'đổi vai', 'doc-roi-chon': 'đọc rồi chọn (số, màu, cực, nốt, dòng)',
  'dan-duong': 'dẫn đường (kéo theo đuôi, dẫn bằng tiếng)', 'cuu-kip': 'cứu kịp (trôi, tàu rời, pin)', 'nhieu-san': 'một chương trình nhiều sân'
};
export const MEO_KIEM_DUOC = ['giu-cua', 'lam-cau', 'don-loi', 'cuu-kip'];
export const CUU = ['hang', 'may', 'nguoi'];
/** Chương gói 9 (đội) của mùa 2–8: 7 mùa × 2 chương × 10 màn = 140 màn (thu-tu-chuong.js: doi-mua-2, doi-xich, doi-nam-cham, doi-omni, doi-cang, doi-xuong, doi-hang-dong + che-*). */
export const CHUONG_GOI_9_CU = ['doi-mua-2', 'che-doi-mua-2', 'doi-xich', 'che-doi-xich', 'doi-nam-cham', 'che-doi-nam-cham', 'doi-omni', 'che-doi-omni', 'doi-cang', 'che-doi-cang', 'doi-xuong', 'che-doi-xuong', 'doi-hang-dong', 'che-doi-hang-dong'];

/** Sự kiện chính (việc robot làm được ở sân), theo mã sự kiện của san-hoc.js; các sự kiện đi / đứng yên / thông tin không tính. */
export const SU_KIEN_CHINH = [
  'nhat-vat', 'dat-vat', 'hut-vat', 'tha-vat', 'kep-hut', 'nem-vat', 'nap-vat', 'dap', 'ban', 'phun-van', 'keo-van', 'van-doi', 'cong-doi',
  'lap-ho', 'rac-cat', 'nut-de', 'nut-doi', 'cua-doi', 'keo-vat', 'keo-theo', 'tha-keo', 'dat-dai-luoi', 'tha-neo', 'nho-neo',
  'moc-cont', 'ha-cont', 'gau-ngoam', 'gio-vot', 'gio-dat', 'tha-phao', 'thu-phao', 'bam-phao', 'nguoi-len-bo', 'nguoi-toi-tram',
  'sac-pin', 'cat-canh', 'nhay', 'qua-ngach', 'rung-da-chuong', 'vo-da-chuong', 'to-o', 'dich-chuyen', 'thung-di', 'tau-cap', 'tau-roi', 'chay-ray',
  'toi-co', 'xong-dua-vat', 'xong-day-thung', 'xong-giao-tau', 'xong-cuu-nguoi', 'xong-dieu', 'xong-to-hinh', 'xong-dap-lua'
];
const LAM_CAU = ['lap-ho', 'rac-cat', 'dat-dai-luoi', 'keo-theo', 'tha-keo'];
const DON_LOI = ['nhat-vat', 'hut-vat', 'moc-cont', 'keo-vat', 'nem-vat', 'dap', 'gau-ngoam', 'gio-vot', 'thung-di'];
const CUU_KIP = ['nguoi-toi-tram', 'xong-giao-tau', 'tau-roi', 'sac-pin'];

/* ------------------------------------------------------------- (a) dấu */
function laMaLap(s) {
  if (typeof s !== 'string') return false;
  const p = s.split('+');
  return p.length >= 1 && p.length <= 3 && !!LapRap.tim('than', p[0]) && (!p[1] || !!LapRap.tim('tay', p[1])) && (!p[2] || !!LapRap.tim('camBien', p[2]));
}
/** Lỗi dấu câu đố của màn (rỗng = ổn). */
export function kiemDau(man) {
  const c = man && man.cauDo, ma = (man && man.ma) || '(màn)', loi = [];
  const them = (s) => loi.push(ma + ': cauDo ' + s);
  if (!c || typeof c !== 'object') { them('thiếu.'); return loi; }
  const coDoi = Array.isArray(c.doi) && c.doi.length > 0, coLap = typeof c.lap === 'string' && c.lap;
  if (!coDoi && !coLap) them('cần doi (mảng mã cỗ máy) hay lap (chuỗi part).');
  if (c.doi != null && !Array.isArray(c.doi)) them('doi phải là mảng.');
  if (coDoi) c.doi.forEach((m) => { if (!CoMay.DS[m]) them('doi có mã cỗ máy lạ "' + m + '".'); });
  if (c.lap != null && !laMaLap(c.lap)) them('lap "' + c.lap + '" không phải chuỗi part than+tay+camBien của danh mục.');
  if (!Array.isArray(c.coChe) || c.coChe.some((x) => typeof x !== 'string' || !x)) them('coChe phải là mảng chuỗi (có thể rỗng).');
  if (c.cuu != null && CUU.indexOf(c.cuu) < 0) them('cuu "' + c.cuu + '" không trong ' + CUU.join(' / ') + ' / null.');
  if (!MEO[c.meo]) them('meo "' + c.meo + '" không trong 12 mẹo: ' + Object.keys(MEO).join(', ') + '.');
  return loi;
}
/** Khoá dấu để so trùng (b): doi (sắp xếp) hay lap, coChe (sắp xếp), cuu, meo. */
export function dauCua(man) {
  const c = man.cauDo;
  return J({ doi: Array.isArray(c.doi) ? c.doi.slice().sort() : null, lap: c.lap || null, coChe: (c.coChe || []).slice().sort(), cuu: c.cuu || null, meo: c.meo });
}

/* ------------------------------------------------------------- (c) chuỗi sự kiện chính */
const khoTruoc = new Map();
{ const kho = new Map(); for (const m of M.danhSach) { khoTruoc.set(m.ma, clone([...kho.values()])); if (!m.tietKiemNhip) for (const h of (m.loiGiai && m.loiGiai.hamCuaEmMoi) || []) kho.set(h.ten, clone(h)); } }
/** Chạy lời giải mẫu của màn qua máy chấm (kho hàm của em như cham-het: hàm các màn trước trong lộ trình + hamCuaEmMoi của màn). */
export function chamMau(man) {
  const hs = new Map((khoTruoc.get(man.ma) || []).map((h) => [h.ten, h]));
  for (const h of (man.loiGiai && man.loiGiai.hamCuaEmMoi) || []) hs.set(h.ten, clone(h));
  const lg = man.loiGiai || {};
  const bai = lg.doi ? LapRap.baiCua(LapRap.loiGiaiCua(lg, man)) : (lg.code !== undefined ? lg.code : lg);   // màn đội: robot khoá không có chương trình trong lời giải thì lấy maMau.doi[i]
  return Cham.cham(man, bai, [...hs.values()]);
}
/** Sự kiện theo robot từ kết quả chấm sân đầu: [{ than, ds: [{ nhip, ma, o?, bat? }] }]; sự kiện sân có ô `o` (nut-de, cua-doi, lap-ho…) gắn cho robot đang đứng ở ô đó nhịp ấy (nếu có), không thì giữ ở robot ghi nó. */
export function suKienCua(kq, man) {
  const san = kq.theoSan && kq.theoSan[0];
  const dsRobot = san ? san.doi : [{ vet: kq.vet, loaiRobot: kq.loaiRobot }];
  const viTri = dsRobot.map((d) => { const m = new Map(); d.vet.forEach((v) => { if (v.loai === 'nhip' && v.robot) m.set(v.nhip, { x: v.robot.x, y: v.robot.y }); }); return m; });
  const kqDs = dsRobot.map((d, i) => ({ than: thanCua(man, i, d), ds: [] }));
  dsRobot.forEach((d, i) => {
    d.vet.forEach((v) => {
      if (v.loai !== 'nhip') return;
      (v.suKien || []).forEach((e) => {
        if (SU_KIEN_CHINH.indexOf(e.ma) < 0) return;
        if (e.ma === 'nut-de' && e.bat === false) return;
        let ai = i;
        if (e.o && !(viTri[i].get(v.nhip) && viTri[i].get(v.nhip).x === e.o.x && viTri[i].get(v.nhip).y === e.o.y)) {
          const k = viTri.findIndex((m) => { const p = m.get(v.nhip); return p && p.x === e.o.x && p.y === e.o.y; });
          if (k >= 0) ai = k;
        }
        kqDs[ai].ds.push({ nhip: v.nhip, ma: e.ma, o: e.o ? { x: e.o.x, y: e.o.y } : (e.tu ? { x: e.tu.x, y: e.tu.y } : null), bat: e.bat });
      });
    });
    (d.suKien || []).forEach((e) => { if (['toi-co', 'xong-dua-vat', 'xong-cuu-nguoi'].indexOf(e.ma) >= 0 && !kqDs[i].ds.some((x) => x.ma === e.ma)) kqDs[i].ds.push({ nhip: e.nhip || 0, ma: e.ma, o: null }); });
  });
  kqDs.forEach((r) => r.ds.sort((a, b) => a.nhip - b.nhip));
  return kqDs;
}
function thanCua(man, i, d) {
  const r = Array.isArray(man.doi) ? Object.assign({}, man, man.doi[i]) : man;
  return (r.robot && r.robot.than) || d.loaiRobot || r.loaiRobot || '?';
}
/** Chuỗi rút gọn mỗi robot (bỏ lặp liền nhau): [{ than, chuoi: 'rac-cat → nhat-vat → toi-co' }]. */
export function chuoiCua(suKien) {
  return suKien.map((r) => {
    const c = [];
    r.ds.forEach((e) => { if (c[c.length - 1] !== e.ma) c.push(e.ma); });
    return { than: r.than, chuoi: c.join(' → ') };
  });
}
/** Khoá so trùng thật: đội (thân từng robot) + chuỗi, sắp theo thân rồi chuỗi để không phụ thuộc thứ tự R1 / R2. */
export function khoaChuoi(chuoi) { return J(chuoi.map((r) => r.than + ':' + r.chuoi).sort()); }
export function doiCua(chuoi) { return chuoi.map((r) => r.than).sort().join('+'); }

/* ------------------------------------------------------------- (d) mẹo khai phải thấy trong sự kiện */
/** Robot B có đứng ở ô `o` sau nhịp `tuNhip` không (theo vết). */
function dungSau(viTri, o, tuNhip) { for (const [n, p] of viTri) if (n > tuNhip && p.x === o.x && p.y === o.y) return true; return false; }
function viTriCua(kq) { const san = kq.theoSan && kq.theoSan[0]; return (san ? san.doi : [{ vet: kq.vet }]).map((d) => { const m = new Map(); d.vet.forEach((v) => { if (v.loai === 'nhip' && v.robot) m.set(v.nhip, { x: v.robot.x, y: v.robot.y }); }); return m; }); }
/**
 * Mẹo `meo` có thấy trong sự kiện không. suKien = suKienCua(kq); viTri = viTriCua(kq) (mảng Map nhịp → ô của từng robot).
 * Trả { ok: true | false | null (chưa kiểm được), lyDo }.
 */
export function kiemMeo(meo, suKien, viTri, man) {
  const n = suKien.length;
  if (meo === 'giu-cua') {
    // robot A đè nút M (nut-de bật) ở nhịp t; từ t tới lúc nút nhả, robot B (≠ A) đứng trên một ô cửa của màn (lớp noi: cua) hay bất kỳ ô cửa 'C'/'c' trong sân
    const oCua = oCuaCua(man);
    for (let a = 0; a < n; a++) for (const e of suKien[a].ds) {
      if (e.ma !== 'nut-de' || e.bat !== true) continue;
      const nha = suKien[a].ds.find((x) => x.ma === 'nut-de' && x.bat === false && x.nhip > e.nhip);
      const den = nha ? nha.nhip : Infinity;
      for (let b = 0; b < n; b++) { if (b === a) continue; for (const [t, p] of viTri[b]) if (t >= e.nhip && t <= den && oCua.some((c) => c.x === p.x && c.y === p.y)) return { ok: true, lyDo: 'R' + (a + 1) + ' đè nút nhịp ' + e.nhip + ', R' + (b + 1) + ' qua cửa nhịp ' + t }; }
    }
    return { ok: false, lyDo: 'khai giữ cửa mà không thấy robot nào đè nút (nut-de) trong lúc robot khác đứng trên ô cửa.' };
  }
  if (meo === 'lam-cau' || meo === 'don-loi') {
    const DS = meo === 'lam-cau' ? LAM_CAU : DON_LOI;
    for (let a = 0; a < n; a++) for (const e of suKien[a].ds) {
      if (DS.indexOf(e.ma) < 0 || !e.o) continue;
      for (let b = 0; b < n; b++) if (b !== a && dungSau(viTri[b], e.o, e.nhip)) return { ok: true, lyDo: 'R' + (a + 1) + ' ' + e.ma + ' ở (' + e.o.x + ', ' + e.o.y + ') nhịp ' + e.nhip + ', sau đó R' + (b + 1) + ' đứng lên ô đó' };
    }
    return { ok: false, lyDo: 'khai ' + MEO[meo] + ' mà không thấy robot nào ' + DS.join(' / ') + ' ở một ô rồi robot khác đứng lên ô đó.' };
  }
  if (meo === 'cuu-kip') {
    for (const r of suKien) for (const e of r.ds) if (CUU_KIP.indexOf(e.ma) >= 0) return { ok: true, lyDo: e.ma + ' nhịp ' + e.nhip };
    return { ok: false, lyDo: 'khai cứu kịp mà không thấy ' + CUU_KIP.join(' / ') + '.' };
  }
  return { ok: null, lyDo: 'mẹo "' + MEO[meo] + '" chưa có bộ dò (chưa kiểm được).' };
}
function oCuaCua(man) {
  const kq = [];
  ((Array.isArray(man.noi) && !Array.isArray(man.san[0]) ? man.noi : []) || []).forEach((g) => (g.cua || []).forEach((c) => kq.push({ x: c.x, y: c.y })));
  const san = Array.isArray(man.san[0]) ? man.san[0] : man.san;
  san.forEach((h, y) => { for (let x = 0; x < h.length; x++) if (h[x] === 'C' || h[x] === 'c') kq.push({ x, y }); });
  return kq;
}

/** Trọn bộ cho một màn: chấm + chuỗi + mẹo. */
export function phanTich(man) {
  LapRap.macDinh(man);
  const kq = chamMau(man);
  const sk = suKienCua(kq, man), vt = viTriCua(kq), ch = chuoiCua(sk);
  return { kq, suKien: sk, viTri: vt, chuoi: ch, khoa: khoaChuoi(ch), doi: doiCua(ch), meo: man.cauDo ? kiemMeo(man.cauDo.meo, sk, vt, man) : null };
}

/* ============================================================================ chạy trên lộ trình */
const mainModule = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (mainModule) {
  console.log('1. Lộ trình: màn có cauDo (mùa 9) + 140 màn đội gói 9 mùa 2–8 để so chuỗi');
  const coDau = M.danhSach.filter((m) => m.cauDo);
  const cu = M.danhSach.filter((m) => CHUONG_GOI_9_CU.indexOf(m.chuong) >= 0);
  kiem('140 màn đội gói 9 mùa 2–8 (7 mùa × 2 chương × 10)', cu.length === 140, cu.length);
  const chuoiCu = new Map();
  let loiCu = 0;
  cu.forEach((m) => { try { const p = phanTich(m); if (!p.kq.thang) loiCu++; chuoiCu.set(p.khoa, m.ma); } catch (e) { loiCu++; console.log('    lỗi ' + m.ma + ': ' + e.message.slice(0, 100)); } });
  kiem('lời giải mẫu 140 màn cũ chạy được, thắng (chuỗi làm nền so trùng)', loiCu === 0, loiCu + ' màn lỗi');
  const trungCu = [...chuoiCu.values()].length;
  console.log('    (140 màn cũ có ' + chuoiCu.size + ' chuỗi khác nhau; ' + (140 - chuoiCu.size) + ' màn cũ trùng chuỗi với nhau — chỉ thông tin, mùa 2–8 không có luật này)');
  console.log('    màn có cauDo trong lộ trình: ' + coDau.length + (coDau.length ? '' : ' (chưa có — gói D2 mới dựng màn; máy kiểm chứng minh bằng màn giả ở mục 2)'));
  const dau = new Map(), chuoi = new Map();
  let aHong = 0, bHong = 0, cHong = 0, dHong = 0;
  coDau.forEach((m) => {
    const la = kiemDau(m); if (la.length) { aHong++; la.forEach((l) => console.log('    (a) ' + l)); return; }
    const k = dauCua(m); if (dau.has(k)) { bHong++; console.log('    (b) ' + m.ma + ' trùng dấu với ' + dau.get(k) + ': ' + k); } else dau.set(k, m.ma);
    let p; try { p = phanTich(m); } catch (e) { cHong++; console.log('    (c) ' + m.ma + ' chấm lỗi: ' + e.message.slice(0, 100)); return; }
    if (chuoi.has(p.khoa)) { cHong++; console.log('    (c) ' + m.ma + ' trùng thật với ' + chuoi.get(p.khoa) + ' (cùng đội ' + p.doi + ', chuỗi ' + J(p.chuoi) + ')'); }
    else if (chuoiCu.has(p.khoa)) { cHong++; console.log('    (c) ' + m.ma + ' chép lại màn cũ ' + chuoiCu.get(p.khoa) + ' (cùng đội ' + p.doi + ', chuỗi ' + J(p.chuoi) + ')'); }
    else chuoi.set(p.khoa, m.ma);
    if (p.meo.ok === false) { dHong++; console.log('    (d) ' + m.ma + ': ' + p.meo.lyDo); }
    else if (p.meo.ok === null) { chuaKiem++; console.log('    (d) ' + m.ma + ': ' + p.meo.lyDo); }
  });
  if (coDau.length) {
    kiem('(a) mọi dấu hợp lệ', aHong === 0, aHong);
    kiem('(b) không màn nào trùng dấu', bHong === 0, bHong);
    kiem('(c) không màn nào trùng thật (kể cả với 140 màn cũ)', cHong === 0, cHong);
    kiem('(d) mẹo khai thấy trong sự kiện (4 mẹo kiểm được)', dHong === 0, dHong);
  }

  /* ============================================================================ 2. tự chứng minh bằng màn giả */
  console.log('2. Tự chứng minh bằng màn giả trong bộ nhớ');
  const FWD = { ten: 'forward', thamSo: ['n'], than: ['for i in range(n):', '    left_move()', '    right_move()', '    wait()'] };
  const WN = { ten: 'wait_n', thamSo: ['n'], than: ['for i in range(n):', '    wait()'] };
  const QUAY = { ten: 'turn_back', thamSo: [], than: ['for i in range(2):', '    left_move()', '    wait()'] };
  const SAN3 = ['########', '#.....F#', '#M....F#', '#..C..F#', '########'];
  /** Màn giả ba robot (như kiem-chon-doi.mjs): R2 (hai bánh) đè nút M giữ cửa C cho R3 (máy khách khoá) qua; cauDo tuỳ truyền. */
  function manGia(ma, cauDo, r2Chinh) {
    const r1 = Object.assign(CoMay.dung('CH', { batDau: { x: 1, y: 1, huong: 1 } }), { co: [{ x: 6, y: 1 }] });
    const r2 = Object.assign(CoMay.dung('CH', { son: 'lam', batDau: { x: 2, y: 2, huong: 3 } }), { co: [{ x: 6, y: 2 }] });
    const r3 = Object.assign(CoMay.dung('CU', { son: 'lam', batDau: { x: 1, y: 3, huong: 1 } }), { coDinh: true, co: [{ x: 6, y: 3 }] });
    const lg = { doi: [{ chinh: ['forward(5)'] }, { chinh: r2Chinh || ['forward(1)', 'wait_n(10)', 'turn_back()', 'forward(5)'] }], hamCuaMan: [FWD, WN, QUAY] };
    const m = {
      ma, chuong: 'thu', so: 1, ten: ma, hang: 'lam-quen', san: SAN3, noi: [{ nut: { x: 1, y: 2 }, cua: [{ x: 3, y: 3 }] }],
      batDau: r1.batDau, loaiRobot: r1.loaiRobot, robot: clone(r1.robot), hamGoc: r1.hamGoc.slice(), mucTieu: 'toi-co', khung: { chinh: 10, moiHam: 8 }, cauTruc: ['for'], hamCuaEmCan: [], camHamCuaEm: false,
      doi: [r1, r2, r3], maMau: { doi: [{ chinh: [] }, { chinh: [] }, { chinh: ['wait_n(4)', 'forward(5)'] }], hamCuaMan: [FWD, WN, QUAY] }, loiGiai: lg, loiSai: [], sao: { o: 20, nhip: 24 }, cauDo
    };
    return ManHoc.chuanHoa(m);
  }
  const D1 = { doi: ['CH', 'CH'], lap: null, coChe: ['nut-de', 'cua'], cuu: 'may', meo: 'giu-cua' };
  const g1 = manGia('gia.1', clone(D1));
  const p1 = phanTich(g1);
  kiem('màn giả giữ cửa: lời giải mẫu thắng; chuỗi R2 có nut-de, R3 có toi-co', p1.kq.thang && /nut-de/.test(p1.chuoi[1].chuoi) && /toi-co/.test(p1.chuoi[2].chuoi), J(p1.chuoi));
  kiem('(a) dấu hợp lệ → không lỗi', kiemDau(g1).length === 0, J(kiemDau(g1)));
  kiem('(d) khai giu-cua, sự kiện có nut-de của R2 trong lúc R3 trên ô cửa → đạt', p1.meo.ok === true, p1.meo.lyDo);
  // (a) dấu sai
  kiem('(a) meo lạ, cuu lạ, thiếu doi lẫn lap, doi mã lạ, lap part lạ → kêu từng lỗi', (() => {
    const l = kiemDau({ ma: 'x', cauDo: { doi: ['ZZ'], lap: 'gai+kep+khong-co', coChe: ['bun'], cuu: 'ca', meo: 'bay' } });
    return l.some((x) => /meo/.test(x)) && l.some((x) => /cuu/.test(x)) && l.some((x) => /mã cỗ máy lạ/.test(x)) && l.some((x) => /lap/.test(x)) && kiemDau({ ma: 'y', cauDo: { coChe: [], meo: 'giu-cua' } }).some((x) => /cần doi/.test(x));
  })());
  kiem('(a) lap hợp lệ "gai+kep+khoang-cach", coChe rỗng, cuu null → không lỗi', kiemDau({ ma: 'z', cauDo: { lap: 'gai+kep+khoang-cach', coChe: [], cuu: null, meo: 'lam-cau' } }).length === 0);
  // (b) trùng dấu: thứ tự doi / coChe khác nhau vẫn là một dấu
  const g2 = manGia('gia.2', { doi: ['CH', 'CH'], lap: null, coChe: ['cua', 'nut-de'], cuu: 'may', meo: 'giu-cua' });
  kiem('(b) hai màn giả trùng dấu (chỉ đảo thứ tự coChe) → cùng khoá dấu → kêu', dauCua(g1) === dauCua(g2));
  const g3 = manGia('gia.3', { doi: ['CH', 'CH'], lap: null, coChe: ['nut-de', 'cua', 'bun'], cuu: 'may', meo: 'giu-cua' });
  kiem('(b) khác một cơ chế → khác dấu', dauCua(g1) !== dauCua(g3));
  // (c) trùng thật: dấu khác nhưng cùng đội + cùng chuỗi
  const p3 = phanTich(g3);
  kiem('(c) gia.1 và gia.3 khác dấu nhưng cùng đội + chuỗi giống hệt → trùng thật, kêu', p3.khoa === p1.khoa && p3.doi === p1.doi && dauCua(g1) !== dauCua(g3), J([p1.khoa, p3.khoa]));
  const g4 = manGia('gia.4', clone(D1), ['forward(1)', 'wait_n(10)', 'turn_back()', 'forward(2)', 'wait()', 'forward(3)']);
  const p4 = phanTich(g4);
  kiem('(c) đổi đường đi nhưng cùng việc → chuỗi vẫn giống (chuỗi chỉ ghi việc chính, không ghi đi lại)', p4.khoa === p1.khoa, J(p4.chuoi));
  kiem('(c) đội khác (thân khác) → khoá khác dù chuỗi giống', khoaChuoi([{ than: 'xich', chuoi: 'nut-de → toi-co' }]) !== khoaChuoi([{ than: 'hai-banh', chuoi: 'nut-de → toi-co' }]));
  kiem('(c) không trùng với màn cũ nào trong 140 màn gói 9 mùa 2–8', !chuoiCu.has(p1.khoa));
  // (d) khai sai
  const g5 = manGia('gia.5', clone(D1), ['turn_back()', 'forward(4)']);                   // R2 không đè nút: R3 kẹt, không thắng
  const p5 = phanTich(g5);
  kiem('(d) khai giu-cua mà không có nut-de → kêu (màn này còn không thắng)', p5.meo.ok === false && !p5.kq.thang, p5.meo.lyDo);
  const g6 = manGia('gia.6', Object.assign(clone(D1), { meo: 'lam-cau' }));
  kiem('(d) khai lam-cau ở màn giữ cửa → kêu (không có lap-ho / rac-cat / ghép bè)', phanTich(g6).meo.ok === false);
  const g7 = manGia('gia.7', Object.assign(clone(D1), { meo: 'cuu-kip' }));
  kiem('(d) khai cuu-kip ở màn giữ cửa → kêu', phanTich(g7).meo.ok === false);
  const g8 = manGia('gia.8', Object.assign(clone(D1), { meo: 'song-song' }));
  kiem('(d) mẹo chưa có bộ dò (song-song) → ok null "chưa kiểm được", không cho qua im lặng', (() => { const r = phanTich(g8).meo; return r.ok === null && /chưa kiểm được/.test(r.lyDo); })());
  // bộ dò lam-cau / don-loi / cuu-kip trên chuỗi sự kiện dựng tay (vị trí: Map nhịp → ô)
  const vt = (ds) => new Map(ds.map(([n, x, y]) => [n, { x, y }]));
  const skA = (ma, nhip, o) => ({ than: 'omni', ds: [{ nhip, ma, o }] });
  const trong = { than: 'hai-banh', ds: [] };
  kiem('(d) lam-cau: R1 lap-ho ở (3,1) nhịp 2, R2 đứng lên (3,1) nhịp 5 → đạt', kiemMeo('lam-cau', [skA('lap-ho', 2, { x: 3, y: 1 }), trong], [vt([[1, 1, 1]]), vt([[1, 1, 2], [5, 3, 1]])], { san: SAN3 }).ok === true);
  kiem('(d) lam-cau: R2 đứng lên ô đó TRƯỚC khi lấp (nhịp 1) → không đạt', kiemMeo('lam-cau', [skA('lap-ho', 2, { x: 3, y: 1 }), trong], [vt([[1, 1, 1]]), vt([[1, 3, 1], [5, 3, 2]])], { san: SAN3 }).ok === false);
  kiem('(d) lam-cau: chính R1 đứng lên ô mình lấp, R2 không → không đạt (phải là cho bạn)', kiemMeo('lam-cau', [skA('lap-ho', 2, { x: 3, y: 1 }), trong], [vt([[1, 1, 1], [4, 3, 1]]), vt([[1, 1, 2]])], { san: SAN3 }).ok === false);
  kiem('(d) lam-cau: rắc cát (rac-cat) cũng là làm cầu', kiemMeo('lam-cau', [skA('rac-cat', 2, { x: 3, y: 1 }), trong], [vt([[1, 1, 1]]), vt([[6, 3, 1]])], { san: SAN3 }).ok === true);
  kiem('(d) don-loi: R1 hut-vat ở (2,2) nhịp 3, R2 đứng lên (2,2) nhịp 6 → đạt; nhat-vat / moc-cont cũng vậy', ['hut-vat', 'nhat-vat', 'moc-cont'].every((ma) => kiemMeo('don-loi', [skA(ma, 3, { x: 2, y: 2 }), trong], [vt([[1, 1, 1]]), vt([[6, 2, 2]])], { san: SAN3 }).ok === true));
  kiem('(d) don-loi: nhặt ở ô không ai đi qua → không đạt', kiemMeo('don-loi', [skA('nhat-vat', 3, { x: 2, y: 2 }), trong], [vt([[1, 1, 1]]), vt([[6, 4, 2]])], { san: SAN3 }).ok === false);
  kiem('(d) cuu-kip: có nguoi-toi-tram / xong-giao-tau / tau-roi / sac-pin → đạt; không có → kêu', CUU_KIP.every((ma) => kiemMeo('cuu-kip', [skA(ma, 9, null)], [vt([])], { san: SAN3 }).ok === true) && kiemMeo('cuu-kip', [skA('nhat-vat', 9, null)], [vt([])], { san: SAN3 }).ok === false);
  kiem('(d) giu-cua: đè nút mà robot kia không đứng ô cửa trong lúc đè → không đạt', kiemMeo('giu-cua', [{ than: 'hai-banh', ds: [{ nhip: 2, ma: 'nut-de', bat: true, o: { x: 1, y: 2 } }, { nhip: 4, ma: 'nut-de', bat: false, o: { x: 1, y: 2 } }] }, trong], [vt([[2, 1, 2], [4, 2, 2]]), vt([[2, 1, 3], [6, 3, 3]])], { san: SAN3, noi: [{ nut: { x: 1, y: 2 }, cua: [{ x: 3, y: 3 }] }] }).ok === false);
  // sự kiện sân gắn đúng robot: nut-de ghi ở vết R1 (pha D) nhưng R2 đứng trên nút → thuộc R2
  kiem('sự kiện sân (nut-de ở vết R1) gắn cho robot đang đứng ở ô nút (R2)', p1.suKien[1].ds.some((e) => e.ma === 'nut-de') && !p1.suKien[0].ds.some((e) => e.ma === 'nut-de'), J(p1.suKien.map((r) => r.ds.map((e) => e.ma))));
  // màn chọn đội: phanTich chạy cách mẫu đầu (macDinh) — dùng màn giả của kiem-chon-doi dạng chonDoi
  const gc = manGia('gia.chon', clone(D1)); delete gc.loiGiai; gc.doi[0] = { batDau: gc.doi[0].batDau, co: gc.doi[0].co }; gc.doi[1] = { batDau: gc.doi[1].batDau, co: gc.doi[1].co };
  gc.chonDoi = { menu: ['CH', 'CU', 'DR'], cachMau: [{ chon: ['CH', 'CH'], loiGiai: g1.loiGiai }], trung: true };
  const pc = phanTich(gc);
  kiem('màn chọn đội (chonDoi, chưa macDinh): phanTich tự điền cách mẫu đầu, chấm thắng, chuỗi như màn giả thường', pc.kq.thang && pc.khoa === p1.khoa, J(pc.chuoi));

  console.log('---------------------------------------------');
  console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + (chuaKiem ? ' · CHƯA KIỂM ĐƯỢC ' + chuaKiem + ' (mẹo chưa có bộ dò)' : ''));
  process.exit(hong ? 1 : 0);
}

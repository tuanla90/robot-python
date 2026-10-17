/* ============================================================================
   dung-chung-list.mjs — ĐỒ DÙNG CHUNG của hai máy kiểm gói List (kiem-list-man.mjs: chương `list`; kiem-che-list.mjs: chương `che-list`). Không phải máy kiểm.
   Gồm:
   - nạp mọi tệp màn, kho hàm của học sinh lúc tới một màn (khoTruoc), trộn hàm vào kho (tron), tiện ích nhỏ;
   - docDuong(rows, bd): đi dọc một HÀNH LANG và trả về các đoạn (độ dài, rẽ phải / trái) → so với số trong danh sách của lời giải;
   - laHanhLang(rows, bd): sân đúng là một con đường không phân nhánh, không hai ô đường nào kề nhau trừ các ô liền nhau, xe ở một đầu, cờ (nếu có) ở đầu kia;
   - tayNhapDuoc(dong, ngu): mọi dòng của một chương trình / thân hàm có nhập được BẰNG CHẠM trên khay danh sách không (không gõ chữ): luật rút từ game/thanh-phan.js
     (nhóm DANH SÁCH: a = [1, 2], for n in a:, for n in [1, 2]:, a.append(1); nhóm ĐẾM: n = 0, n = n + 1; bảng chọn số 1–9 và chip: biến vòng for n in a, biến đếm, a[i] trong vòng range,
     a[0], len(a); tên danh sách chọn trong a b c steps route hay đối số kiểu danh sách của hàm đang sửa; danh sách tối đa 6 ô, giá trị 1–9).
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
export const SanHoc = require(path.join(day, 'san-hoc.js'));
export const ChamHoc = require(path.join(day, 'cham.js'));
export const KhoHam = require(path.join(day, 'kho-ham.js'));
export const KhungCode = require(path.join(day, 'khung-code.js'));
export const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
export const SoLenh = require(path.join(day, 'so-lenh.js'));
let ManHocTam = require(path.join(day, 'man-chuoi-1.js'));
for (const f of fs.readdirSync(day).filter((n) => /^man-.*\.js$/.test(n) && n !== 'man-chuoi-1.js').sort()) ManHocTam = require(path.join(day, f));
export const ManHoc = ManHocTam;
export const tatCa = ManHoc.danhSach;
export const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
export const VEC = [[0, -1], [1, 0], [0, 1], [-1, 0]];

export const J = (o) => JSON.stringify(o);
export const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
export const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
export const maLoi = (kq) => kq.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma);
export const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
export const batDauCua = (m, i = 0) => (Array.isArray(m.batDau) ? m.batDau[i] : m.batDau);

/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải). */
export function khoTruoc(id) {
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  for (const m of tatCa) {
    if (m.id === id) break;
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi) {
      if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo, { taoHam: m.taoHam });
      kho.sua(h.ten, h.than);
    }
  }
  return kho.ds();
}
/** Trộn / thay hàm `moi` vào kho `kho` (theo tên). */
export function tron(kho, moi) {
  const kq = kho.map((h) => H(h.ten, h.than.slice(), h.thamSo.slice()));
  for (const h of moi || []) { const i = kq.findIndex((x) => x.ten === h.ten); const b = H(h.ten, h.than.slice(), (h.thamSo || []).slice()); if (i >= 0) kq[i] = b; else kq.push(b); }
  return kq;
}

/* ------------------------------------------------------------------- hành lang */
/** Các ô đi được của sân (không phải tường '#') → tập 'x,y'. */
function oMo(rows) { const s = new Set(); rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '#') s.add(x + ',' + y); })); return s; }
/**
 * Sân là MỘT ĐƯỜNG: đồ thị các ô đi được (kề nhau theo bốn hướng) là một đường không phân nhánh (n ô, n - 1 cặp kề nhau, đúng hai đầu), nên không thể có đường tắt.
 * Trả về null nếu đúng, hay lời nói vì sao sai.
 */
export function laHanhLang(rows, bd) {
  const mo = oMo(rows), ds = [...mo].map((k) => k.split(',').map(Number));
  let canh = 0; const bac = {};
  for (const [x, y] of ds) { let b = 0; for (const [dx, dy] of VEC) if (mo.has((x + dx) + ',' + (y + dy))) b++; bac[x + ',' + y] = b; canh += b; }
  canh /= 2;
  if (canh !== ds.length - 1) return 'có ' + ds.length + ' ô nhưng ' + canh + ' cặp kề nhau (đường phải có ' + (ds.length - 1) + ')';
  const dau = Object.keys(bac).filter((k) => bac[k] === 1);
  if (dau.length !== 2 || Object.values(bac).some((b) => b > 2)) return 'có chỗ rẽ nhánh hay không đúng hai đầu: ' + J(dau);
  if (!dau.includes(bd.x + ',' + bd.y)) return 'xe không đứng ở một đầu của đường';
  const co = rows.map((r, y) => [...r].map((c, x) => (c === 'F' ? x + ',' + y : null)).filter(Boolean)).flat();
  if (co.length && !(co.length === 1 && dau.includes(co[0]) && co[0] !== bd.x + ',' + bd.y)) return 'cờ không ở đầu kia của đường';
  return null;
}
/** Đi dọc hành lang từ batDau: [{ len, re: 'R' | 'L' | null }] (re = rẽ sau đoạn đó) và ô cuối. */
export function docDuong(rows, bd) {
  const mo = oMo(rows), thay = new Set([bd.x + ',' + bd.y]);
  let x = bd.x, y = bd.y, h = bd.huong || 0, dai = 0; const doan = [];
  for (;;) {
    const v = VEC[h], k = (x + v[0]) + ',' + (y + v[1]);
    if (mo.has(k) && !thay.has(k)) { x += v[0]; y += v[1]; thay.add(k); dai++; continue; }
    const p = VEC[(h + 1) % 4], q = VEC[(h + 3) % 4];
    const kp = (x + p[0]) + ',' + (y + p[1]), kq = (x + q[0]) + ',' + (y + q[1]);
    const duoc = (kk) => mo.has(kk) && !thay.has(kk);
    if (dai === 0 && !doan.length && !duoc(k)) { if (duoc(kp)) { h = (h + 1) % 4; continue; } if (duoc(kq)) { h = (h + 3) % 4; continue; } }       // xe quay mặt vào tường lúc đầu
    if (duoc(kp)) { doan.push({ len: dai, re: 'R' }); dai = 0; h = (h + 1) % 4; }
    else if (duoc(kq)) { doan.push({ len: dai, re: 'L' }); dai = 0; h = (h + 3) % 4; }
    else { doan.push({ len: dai, re: null }); break; }
  }
  return { doan, cuoi: { x, y, huong: h } };
}

/* ------------------------------------------------------------------- nhập bằng chạm */
const TEN_LIST_GOI_Y = ['a', 'b', 'c', 'steps', 'route'];
const SO19 = /^[1-9]$/;
/** Tách các đối số ở mức ngoài cùng của một lời gọi hàm: 'step(a[i], [1, 2])' → ['a[i]', '[1, 2]']. */
function tachDoiSo(s) {
  const kq = []; let sau = 0, cur = '';
  for (const c of s) { if ('([' .includes(c)) sau++; if (')]'.includes(c)) sau--; if (c === ',' && sau === 0) { kq.push(cur.trim()); cur = ''; } else cur += c; }
  if (cur.trim()) kq.push(cur.trim());
  return kq;
}
/**
 * Mọi dòng của `dong` (mảng chuỗi, có thụt lề 4 dấu cách một bậc) nhập được bằng chạm không? ngu = { list: [tên danh sách là đối số hàm đang sửa], bienDem: bool (khay có nhóm ĐẾM),
 * cam: bool (khay có điều kiện front_clear), gocCoSan: [tên biến sẵn có] }. Trả về mảng lời sai (rỗng nếu được).
 */
export function tayNhapDuoc(dong, ngu = {}) {
  const loi = [], lists = new Set(ngu.list || []), dem = new Set(), cacBac = [];     // cacBac: ngăn xếp các vòng đang mở { bac, bien, loai: 'range' | 'list' }
  const bacCua = (d) => Math.floor(/^ */.exec(d)[0].length / 4);
  const kiemSo = (arg, ctx) => {                                                      // một đối số kiểu số: 1–9, hay chip trong bảng chọn
    if (SO19.test(arg)) return null;
    if (/^[a-z_]\w*$/.test(arg)) {
      if (cacBac.some((v) => v.loai === 'list' && v.bien === arg)) return null;       // biến vòng for n in a
      if (dem.has(arg)) return null;                                                  // biến đếm đã gán ở phía trên
      return 'biến "' + arg + '" không có trong bảng chọn số';
    }
    let m = /^([a-z_]\w*)\[([a-z_]\w*|0)\]$/.exec(arg);
    if (m) {
      if (!lists.has(m[1])) return 'danh sách "' + m[1] + '" chưa có';
      if (m[2] === '0') return null;
      return cacBac.some((v) => v.loai === 'range' && v.bien === m[2]) ? null : 'chỉ số "' + m[2] + '" không phải biến vòng range';
    }
    m = /^len\(([a-z_]\w*)\)$/.exec(arg);
    if (m) return lists.has(m[1]) ? null : 'danh sách "' + m[1] + '" chưa có';
    return 'đối số "' + arg + '" không chọn được bằng chạm';
  };
  const kiemDs = (arg) => {                                                           // đối số kiểu danh sách: tên danh sách đã có, hay danh sách đặt thẳng
    if (/^\[(?:\s*[1-9]\s*(?:,\s*[1-9]\s*){0,5})?\]$/.test(arg)) return null;
    if (/^[a-z_]\w*$/.test(arg) && lists.has(arg)) return null;
    return 'đối số danh sách "' + arg + '" không nhập được';
  };
  dong.forEach((d, i) => {
    const t = d.trim(), b = bacCua(d), ten = 'dòng ' + (i + 1) + ' (' + t + ')';
    while (cacBac.length && cacBac[cacBac.length - 1].bac >= b) cacBac.pop();
    if (!t || t === 'pass' || t[0] === '#') return;
    let m;
    if ((m = /^([a-z_]\w*) = \[(.*)\]$/.exec(t))) {
      if (!TEN_LIST_GOI_Y.includes(m[1]) && !(ngu.tenListThem || []).includes(m[1])) loi.push(ten + ': tên danh sách "' + m[1] + '" không có trong gợi ý ' + TEN_LIST_GOI_Y.join(' '));
      const ph = m[2].trim() ? m[2].split(',').map((x) => x.trim()) : [];
      if (ph.length > 6 || ph.some((x) => !SO19.test(x))) loi.push(ten + ': danh sách tối đa 6 ô, mỗi ô 1–9');
      lists.add(m[1]); return;
    }
    if ((m = /^for n in ([a-z_]\w*):$/.exec(t))) { if (!lists.has(m[1])) loi.push(ten + ': danh sách "' + m[1] + '" chưa có'); cacBac.push({ bac: b, bien: 'n', loai: 'list' }); return; }
    if ((m = /^for n in (\[.*\]):$/.exec(t))) { const e = kiemDs(m[1]); if (e) loi.push(ten + ': ' + e); cacBac.push({ bac: b, bien: 'n', loai: 'list' }); return; }
    if ((m = /^for i in range\((.+)\):$/.exec(t))) { const e = kiemSo(m[1].trim()); if (e) loi.push(ten + ': ' + e); cacBac.push({ bac: b, bien: 'i', loai: 'range' }); return; }
    if ((m = /^([a-z_]\w*)\.append\((.+)\)$/.exec(t))) { if (!lists.has(m[1])) loi.push(ten + ': danh sách "' + m[1] + '" chưa có'); const e = kiemSo(m[2].trim()); if (e) loi.push(ten + ': ' + e); return; }
    if (t === 'n = 0' || t === 'n = n + 1') { if (!ngu.bienDem) loi.push(ten + ': khay chưa có nhóm ĐẾM'); dem.add('n'); return; }
    if ((m = /^(while|if) (not )?front_clear\(\):$/.exec(t))) { if (!ngu.cam) loi.push(ten + ': khay chưa có điều kiện cảm biến'); cacBac.push({ bac: b, bien: null, loai: 'dk' }); return; }
    if ((m = /^([a-z_]\w*)\((.*)\)$/.exec(t))) {
      for (const arg of tachDoiSo(m[2])) {
        const e = /^\[.*\]$/.test(arg) ? kiemDs(arg) : /^[a-z_]\w*$/.test(arg) && lists.has(arg) ? null : kiemSo(arg);
        if (e) loi.push(ten + ': ' + e);
      }
      return;
    }
    loi.push(ten + ': dạng dòng không có khối trên khay');
  });
  return loi;
}

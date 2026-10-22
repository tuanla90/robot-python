/* ============================================================================
   do-duong-hai-robot.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `hai-robot` (HAI xe hai bánh gắn tay kẹp, mục tiêu 'toi-co' hoặc 'dua-vat'; một sân hay mảng sân).
   Dùng trong máy kiểm (kiem-hai-robot-man.mjs, kiem-hoc.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái CHUNG của các robot: (ô, hướng, tư thế tay, vật đang cầm, đã tới cờ) của từng robot + ô của từng vật. Cảm biến chỉ giúp
   chương trình quyết định nên bộ dò bỏ qua. Mỗi nhịp mỗi robot chọn một hành động như bộ dò che-tay (do-duong-che-tay.mjs): tay đổi tư thế → kẹp / thả ở
   ô trước mặt → bánh chạy (tay hạ thì bánh không chạy). Luật hai robot y như san-hoc.js (KE-HOACH-HAI-ROBOT.md):
     - pha hành động chạy LẦN LƯỢT R1 rồi R2, mỗi robot thấy đồng đội ở chỗ đang đứng (R1 đã đi trong nhịp thì R2 thấy chỗ mới);
     - trước nhịp, robot tiến / lùi có một ô ĐỊNH TỚI; robot không vào được ô đồng đội đang đứng hay ô đồng đội định tới (cùng nhắm một ô thì cả hai đứng yên;
       đổi chỗ xuyên nhau cũng bị chặn); vật chiếm ô;
     - thả vật không được vào ô đồng đội đang đứng; hai robot cùng kẹp một vật trong một nhịp thì không ai kẹp được;
     - 'toi-co': robot tới một ô cờ F (cờ nào cũng được) thì dừng hẳn; thắng khi mọi robot đã tới cờ. 'dua-vat': thắng khi mọi vật nằm trên ô đích (ô đích nào cũng được).
   TÁCH VÙNG: sân chia thành các vùng sàn liền nhau (tường ngăn). Hai robot ở hai vùng khác nhau thì không bao giờ gặp nhau: dò riêng từng robot với vật trong vùng
   của nó, nhịp cả đội = nhịp lớn hơn (hai robot chạy song song). Nhờ vậy sân hai làn nhiều vật (7) dò nhanh.
   Mảng sân: tổng nhịp ngắn nhất từng sân (nhipTheo 'tong').

   Hàm xuất:
     nhipHaiRobotSan(man, i, tuyChon) → { nhip, soTrangThai, catNgang, chuoi: [[hđ R1, hđ R2] mỗi nhịp] } của sân i
     nhipHaiRobotTatCa(man, tuyChon)  → tổng nhịp ngắn nhất các sân (null nếu một sân không tới được hay bị cắt ngang)
     chuoiThanhMaDoi(chuoi)           → [mã Python R1, mã Python R2] bằng lệnh gốc (kiểm chéo với SanHoc.chay)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chuoiThanhMa } from './do-duong-che-tay.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

const BANH = ['tien', 'lui', 'phai', 'trai', 'dau', 'cho'];
const DUNG = { tuThe: null, kep: null, banh: 'cho' };

export function soSan(man) { return Array.isArray(man.san[0]) ? man.san.length : 1; }
const theoSan = (v, i, nhieu) => (nhieu && Array.isArray(v) ? v[i] : v);

function dungNguCanh(man, si) {
  const nhieu = Array.isArray(man.san[0]);
  const rows = nhieu ? man.san[si] : man.san;
  if (/[><^vHhNCcP=S]/.test(rows.join(''))) throw new Error('Bộ dò hai robot chỉ hỗ trợ sân có tường, vật, ô đích, cờ.');
  const san = SanHoc.docSan(rows);
  const rong = san.rong, cao = san.cao, nCell = rong * cao;
  const chan = new Uint8Array(nCell), co = new Uint8Array(nCell), dich = new Uint8Array(nCell);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) {
    const c = y * rong + x;
    chan[c] = SanHoc.lyDoChan(san, 'banh', x, y) ? 1 : 0;
    co[c] = rows[y][x] === 'F' ? 1 : 0;
  }
  san.dich.forEach((d) => { dich[d.y * rong + d.x] = 1; });
  // vùng sàn liền nhau (4 hướng)
  const vung = new Int32Array(nCell).fill(-1);
  let soVung = 0;
  for (let c0 = 0; c0 < nCell; c0++) {
    if (chan[c0] || vung[c0] >= 0) continue;
    const q = [c0]; vung[c0] = soVung;
    while (q.length) {
      const c = q.pop(), x = c % rong, y = (c - x) / rong;
      for (const [dx, dy] of SanHoc.VEC) {
        const nx = x + dx, ny = y + dy, n = ny * rong + nx;
        if (nx >= 0 && ny >= 0 && nx < rong && ny < cao && !chan[n] && vung[n] < 0) { vung[n] = soVung; q.push(n); }
      }
    }
    soVung++;
  }
  const bd = man.doi.map((r) => theoSan(r.batDau, si, nhieu));
  return { rong, cao, nCell, chan, co, dich, vung, mucTieu: man.mucTieu || 'toi-co', vat0: san.vat.map((v) => v.y * rong + v.x), bd };
}

/** Hành động hợp lệ của một robot ở tư thế tay t (0 nâng, 1 hạ): tay nâng thì bánh chạy, tay hạ thì chỉ kẹp / thả / đứng. */
function hanhDong(t) {
  const ds = [];
  for (const tuThe of t === 0 ? [null, 'duoi'] : [null, 'tren']) {
    const t2 = tuThe === 'duoi' ? 1 : tuThe === 'tren' ? 0 : t;
    if (t2 === 0) for (const b of BANH) ds.push({ tuThe, kep: null, banh: b });
    else for (const k of [null, 'kep', 'tha']) ds.push({ tuThe, kep: k, banh: 'cho' });
  }
  return ds;
}
const HD = [hanhDong(0), hanhDong(1)];

const truoc = (ctx, R) => { const v = SanHoc.VEC[R.h], x = R.x + v[0], y = R.y + v[1]; return x >= 0 && y >= 0 && x < ctx.rong && y < ctx.cao ? y * ctx.rong + x : -1; };
function dinhToi(ctx, R, a) {
  if (a.banh !== 'tien' && a.banh !== 'lui') return -2;
  const v = SanHoc.VEC[R.h], d = a.banh === 'tien' ? 1 : -1, x = R.x + v[0] * d, y = R.y + v[1] * d;
  return x >= 0 && y >= 0 && x < ctx.rong && y < ctx.cao ? y * ctx.rong + x : -1;
}
const oCua = (ctx, R) => R.y * ctx.rong + R.x;

/** Một nhịp cho các robot (lần lượt). S = { r: [R…], pos }. Trả trạng thái mới hay null (vật vỡ). */
function buoc(ctx, S, as) {
  const r = S.r.map((R) => Object.assign({}, R)), pos = S.pos.slice(), n = r.length;
  const dinh = r.map((R, i) => (R.xong ? -2 : dinhToi(ctx, R, as[i])));
  const kepO = r.map((R, i) => {
    const a = as[i]; if (R.xong || a.kep !== 'kep' || R.cam >= 0) return -1;
    const t = a.tuThe === 'duoi' ? 1 : a.tuThe === 'tren' ? 0 : R.t; return t === 1 ? truoc(ctx, R) : -1;
  });
  const tranh = n === 2 && kepO[0] >= 0 && kepO[0] === kepO[1];
  for (let i = 0; i < n; i++) {
    const R = r[i], a = as[i], K = n === 2 ? r[1 - i] : null;
    if (R.xong) continue;
    if (a.tuThe === 'duoi') R.t = 1; else if (a.tuThe === 'tren') R.t = 0;
    const f = truoc(ctx, R);
    if (a.kep === 'kep' && R.cam < 0 && R.t === 1 && f >= 0 && !tranh) {
      const j = pos.indexOf(f); if (j >= 0) { pos[j] = -1; R.cam = j; }
    } else if (a.kep === 'tha' && R.cam >= 0) {
      if (R.t === 0) return null;
      if (f >= 0 && !ctx.chan[f] && pos.indexOf(f) < 0 && (!K || f !== oCua(ctx, K))) { pos[R.cam] = f; R.cam = -1; }
    }
    if (R.t === 0) {
      const b = a.banh;
      if (b === 'tien' || b === 'lui') {
        const c = dinh[i];
        if (c >= 0 && !ctx.chan[c] && pos.indexOf(c) < 0 && (!K || (c !== oCua(ctx, K) && c !== dinh[1 - i]))) { R.x = c % ctx.rong; R.y = (c - R.x) / ctx.rong; }
      } else if (b === 'phai') R.h = (R.h + 1) % 4;
      else if (b === 'trai') R.h = (R.h + 3) % 4;
      else if (b === 'dau') R.h = (R.h + 2) % 4;
    }
  }
  if (ctx.mucTieu === 'toi-co') r.forEach((R) => { if (ctx.co[oCua(ctx, R)]) R.xong = true; });
  return { r, pos };
}

/** BFS cho các robot `ids` (chỉ số trong ctx.bd) với các vật `vids` (chỉ số trong ctx.vat0). */
function bfs(ctx, ids, vids, toiDa) {
  const nVat = vids.length, N1 = ctx.nCell + 2;
  const S0 = { r: ids.map((i) => { const b = ctx.bd[i]; return { x: b.x, y: b.y, h: b.huong || 0, t: 0, cam: -1, xong: false }; }), pos: vids.map((j) => ctx.vat0[j]) };
  const laDich = (S) => (ctx.mucTieu === 'toi-co' ? S.r.every((R) => R.xong) : S.pos.every((p) => p >= 0 && ctx.dich[p]));
  const maR = (R) => ((((R.y * ctx.rong + R.x) * 4 + R.h) * 2 + R.t) * (nVat + 1) + (R.cam + 1)) * 2 + (R.xong ? 1 : 0);
  const MR = ctx.nCell * 4 * 2 * (nVat + 1) * 2;
  const khoa = (S) => { let k = 0; for (const R of S.r) k = k * MR + maR(R); for (let i = 0; i < nVat; i++) k = k * N1 + (S.pos[i] + 1); return k; };
  if (laDich(S0)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const ds = [S0], cha = [-1], hd = [null];
  const thay = new Set([khoa(S0)]);
  let lop = [0], nhip = 0;
  while (lop.length) {
    nhip++;
    const tiep = [];
    for (const i of lop) {
      const S = ds[i];
      const lua = S.r.map((R) => (R.xong ? [DUNG] : HD[R.t]));
      const toHop = lua.length === 1 ? lua[0].map((a) => [a]) : lua[0].flatMap((a) => lua[1].map((b) => [a, b]));
      for (const as of toHop) {
        const N = buoc(ctx, S, as);
        if (!N) continue;
        const k = khoa(N);
        if (thay.has(k)) continue;
        thay.add(k);
        ds.push(N); cha.push(i); hd.push(as);
        const j = ds.length - 1;
        if (laDich(N)) {
          const chuoi = []; for (let q = j; q > 0; q = cha[q]) chuoi.push(hd[q]);
          return { nhip, soTrangThai: ds.length, catNgang: false, chuoi: chuoi.reverse() };
        }
        tiep.push(j);
        if (ds.length > toiDa) return { nhip: null, soTrangThai: ds.length, catNgang: true, chuoi: null };
      }
    }
    lop = tiep;
  }
  return { nhip: null, soTrangThai: ds.length, catNgang: false, chuoi: null };
}

export function nhipHaiRobotSan(man, si = 0, tuyChon = {}) {
  const ctx = dungNguCanh(man, si);
  const toiDa = tuyChon.toiDaTrangThai || 3000000;
  const vungR = ctx.bd.map((b) => ctx.vung[b.y * ctx.rong + b.x]);
  const tatCaVat = ctx.vat0.map((_, j) => j);
  if (ctx.bd.length !== 2 || vungR[0] === vungR[1]) return bfs(ctx, ctx.bd.map((_, i) => i), tatCaVat, toiDa);
  // hai robot ở hai vùng không thông nhau: dò riêng, nhịp = nhịp lớn hơn; vật nằm ngoài cả hai vùng thì không ai tới được
  if (ctx.vat0.some((c) => vungR.indexOf(ctx.vung[c]) < 0)) return { nhip: null, soTrangThai: 0, catNgang: false, chuoi: null };
  const kq = [0, 1].map((i) => bfs(ctx, [i], tatCaVat.filter((j) => ctx.vung[ctx.vat0[j]] === vungR[i]), toiDa));
  if (kq.some((k) => k.nhip === null)) return { nhip: null, soTrangThai: kq[0].soTrangThai + kq[1].soTrangThai, catNgang: kq.some((k) => k.catNgang), chuoi: null };
  const nhip = Math.max(kq[0].nhip, kq[1].nhip), chuoi = [];
  for (let t = 0; t < nhip; t++) chuoi.push([0, 1].map((i) => (kq[i].chuoi[t] ? kq[i].chuoi[t][0] : DUNG)));
  return { nhip, soTrangThai: kq[0].soTrangThai + kq[1].soTrangThai, catNgang: false, chuoi };
}

export function nhipHaiRobotTatCa(man, tuyChon = {}) {
  let tong = 0;
  for (let i = 0; i < soSan(man); i++) {
    const r = nhipHaiRobotSan(man, i, tuyChon);
    if (r.nhip === null) return null;
    tong += r.nhip;
  }
  return tong;
}

/** Chuỗi hành động hai robot → [mã R1, mã R2] (mỗi nhịp mỗi robot kết thúc bằng wait()). */
export function chuoiThanhMaDoi(chuoi) {
  const PC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  return [0, 1].map((i) => chuoiThanhMa(chuoi.map((c) => c[i]), PC));
}

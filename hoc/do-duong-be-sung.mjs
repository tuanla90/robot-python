/* ============================================================================
   do-duong-be-sung.mjs — BỘ DÒ cho gói 9 mùa 2 "Bệ súng xích" (man-be-sung.js: chương be-sung, che-be-sung). Dùng trong kiem-be-sung.mjs; chạy riêng cũng được:
     node hoc/do-duong-be-sung.mjs              (mỗi màn: BFS bệ súng / không bệ súng / xe hai bánh; màn khóa đọc cảm biến: thân cố định; trùm: dãy chung)

   XE BÁNH XÍCH gắn SÚNG HƠI (luật ở san-hoc.js: BÁNH XÍCH, XÍCH ĐẨY THÙNG NẶNG, BỆ SÚNG XÍCH, THÙNG NẶNG + SÚNG HƠI). Bộ dò súng hơi của gói 2 (do-duong-sung-hoi.mjs) chỉ biết
   xe hai bánh, bộ dò đẩy thùng của gói 5 không biết súng, nên ở đây có một bộ mô phỏng NHỊP riêng cho xích + súng (dùng lại ngữ cảnh sân, trạng thái đầu, đích của bộ dò gói 2):
     hành động  M tiến (xichDay: thùng trước mũi trượt 1 ô nếu ô sau nhận được thùng) · B lùi (không kéo thùng) · R / L quay phải / trái (HAI nhịp liền, xích quay chậm)
                W đứng yên · c / h bắn tụ ra trước / ra sau · f / g bắn nhanh ra trước / ra sau (chỉ màn lucBan; bay tối đa 2 ô, không giật).
     Bắn tụ: bóng bay tới vật cản đầu tiên (nút đổi, cửa theo nút đổi ở cuối nhịp); xích có bệ súng (beSung) thì KHÔNG giật; không bệ súng thì giật một ô như xe hai bánh
     (ô sau trống thì xe dời, có thùng thì thùng trượt tới vật cản, bị chặn thì đứng yên). Băng chuyền không đẩy xích, đẩy thùng sau 2 nhịp. Cửa không đóng đè lên xe / thùng.
   Nửa vòng quay dở bị mất nếu nhịp sau khác tổ hợp: không bao giờ có lợi hơn W (đứng yên), nên R / L là hai nhịp liền một khối, đúng luật.
   Nút bật sẵn (cfg.nutBat) không nối gì (lõi cấm), nên không đổi động học sân: bộ dò bỏ qua (như gói 7); kiemDocLap của do-duong-do-nhiet.mjs kiểm lại điều đó.
   Bộ mô phỏng được SO CHÉO với lõi thật: kiemCheo() chạy các dãy ngẫu nhiên trên cả hai (SanHoc.chay) và so ô xe, hướng, thùng, nút, cửa, thắng (lệch là báo lỗi).

   Hàm xuất:
     ngoCanh(man, i)                         → ngữ cảnh sân thứ i (dùng dungNguCanh của bộ dò gói 2)
     buoc(ctx, S, a, tuy)                    → trạng thái sau một hành động (tuy.beSung, tuy.xichDay)
     nhipNganNhat(man, tuy)                  → { nhip, chuoi } BFS tự do mỗi sân, cộng lại (tuy.beSung mặc định theo màn; tuy.haiBanh: xe hai bánh qua bộ dò gói 2)
     dayChung(man, gioiHan, tuy)             → { nhip, chuoi } dãy hành động CHUNG thắng mọi sân với tổng nhịp ≤ gioiHan (nhipTheo 'tong'), hay null
     chuoiThanhMa(chuoi, man)                → mã Python lệnh gốc của một dãy hành động
     kiemCheo(man, soLan, hat)               → '' nếu bộ mô phỏng khớp lõi trên soLan dãy ngẫu nhiên mỗi sân, chuỗi lỗi nếu lệch
     thanCoDinh(man, kho, tenHam, chamThan, tuy) → màn khóa: thân cố định (không cảm biến) rẻ nhất được 3 sao, hay { khong: true, soThan }
     moChinh(dong, bang, tenX), chayDay(man, day, tuy) → mở chương trình chính khóa thành dãy; chạy một dãy cố định
   ========================================================================== */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as Bo from './do-duong-sung-hoi.mjs';

const require = createRequire(import.meta.url);
const SanHoc = require('./san-hoc.js');
const VEC = SanHoc.VEC;

/* ------------------------------------------------------------------ 1. ngữ cảnh, một nhịp */
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
/** Màn một sân thứ i (mọi lớp song song với san được cắt như lopMauCuaSan). */
export function catSan(m, i) {
  if (!Array.isArray(m.san[0])) return Object.assign({}, m);
  const lm = SanHoc.lopMauCuaSan(m, i);
  const con = Object.assign({}, m, { san: m.san[i], batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau });
  for (const k of ['mau', 'vatMau', 'vatChat', 'cuaNhip', 'noi', 'nutBat', 'bongMo']) {
    const v = lm[k] || (Array.isArray(m[k]) ? null : m[k]);
    if (v !== undefined && v !== null) con[k] = v; else delete con[k];
  }
  return con;
}
export function ngoCanh(m, i = 0) {
  const con = catSan(m, i);
  // bộ dò gói 2 dựng sân (ô chặn, nút, cửa, nhóm nối, băng, đích, bóng mờ); xích và xe hai bánh chỉ khác nhau ở bậc thang S (mùa 2 không có)
  const ctx = Bo.dungNguCanh(Object.assign({}, con, { loaiRobot: 'banh', hamGoc: (con.hamGoc || []).filter((h) => !SanHoc.TAY_LENH.includes(h)) }));
  if (/[S]/.test(con.san.join(''))) throw new Error('Bộ dò bệ súng không hỗ trợ bậc thang S.');
  ctx.con = con;
  return ctx;
}
export const HANH_DONG = ['M', 'B', 'R', 'L', 'W', 'c', 'h', 'f', 'g'];
export const GIA = { M: 1, B: 1, R: 2, L: 2, W: 1, c: 1, h: 1, f: 1, g: 1 };
/** Các hành động màn cho phép (phun mạnh c / h chỉ khi lucBan, phun nhẹ f / g luôn có (29/10: mặc định); phun ra sau khi khay có spray_back). */
export function hanhDong(m) {
  const hg = m.hamGoc || [];
  return HANH_DONG.filter((a) => !((a === 'c' || a === 'h') && !m.lucBan) && !((a === 'h' || a === 'g') && !hg.includes('spray_back')) && !((a === 'c' || a === 'f') && !hg.includes('spray')));
}

function coThungKet(ctx, S) {
  const { rong } = ctx;
  const tm = (x, y) => !ctx.trongSan(x, y) || ctx.mepGoc[y * rong + x] === 1;
  for (const c of S.p) {
    if (ctx.dich[c]) continue;
    const x = c % rong, y = Math.floor(c / rong);
    if (!(tm(x - 1, y) || tm(x + 1, y))) continue;
    if (!(tm(x, y - 1) || tm(x, y + 1))) continue;
    const hb = ctx.bang[c];
    if (hb >= 0) {
      const v = VEC[hb], nx = x + v[0], ny = y + v[1];
      if (ctx.trongSan(nx, ny) && ctx.san.o[ny][nx] !== '#' && ctx.san.o[ny][nx] !== 'S') continue;
    }
    return true;
  }
  return false;
}

/** Một nhịp của xích (R / L gọi hai lần nửa vòng: nhịp đầu như W, nhịp sau đổi hướng). tuy.beSung, tuy.xichDay. */
function motNhip(ctx, S, a, tuy) {
  const N = { x: S.x, y: S.y, h: S.h, d: 0, p: S.p.slice(), e: S.e.slice(), nm: S.nm, cm: S.cm, bm: S.bm, t: S.t, q: S.q, chet: false };
  const { rong } = ctx;
  const cuaDong = (cell) => { const j = ctx.cuaIdx[cell]; return j >= 0 && !((N.cm >> j) & 1); };
  const cellXe = () => N.y * rong + N.x;
  const thungChan = (x, y) => {
    if (!ctx.trongSan(x, y)) return true;
    const c = y * rong + x;
    if (ctx.thungChanTinh[c] || cuaDong(c) || N.p.indexOf(c) >= 0) return true;
    return N.x === x && N.y === y;
  };
  let doiCua = 0;
  if (a === 'c' || a === 'h' || a === 'f' || a === 'g') {
    const sau = a === 'h' || a === 'g', nhanh = a === 'f' || a === 'g';
    const hb = sau ? (N.h + 2) % 4 : N.h, v = VEC[hb];
    let x = N.x, y = N.y, d = 0;
    for (;;) {                                                            // (a) bóng bay tới vật cản đầu tiên (bắn nhanh: rơi sau 2 ô)
      x += v[0]; y += v[1]; d++;
      if (nhanh && d > SanHoc.TAM_BAN_NHANH) break;
      if (!ctx.trongSan(x, y)) break;
      const cell = y * rong + x;
      if (ctx.banDung[cell] || cuaDong(cell) || N.p.indexOf(cell) >= 0) {
        const ni = ctx.nutIdx[cell];
        if (ni >= 0) {
          N.nm ^= 1 << ni;
          for (const b of ctx.nutBang[ni]) N.bm ^= 1 << b;
          for (const j of ctx.nutCua[ni]) doiCua ^= 1 << j;
        }
        break;
      }
    }
    if (!nhanh && !tuy.beSung) {                                          // (b) giật: chỉ khi không bệ súng
      const hg = (hb + 2) % 4, vg = VEC[hg], nx = N.x + vg[0], ny = N.y + vg[1];
      if (ctx.trongSan(nx, ny)) {
        const cell = ny * rong + nx;
        if (!ctx.chan[cell] && !cuaDong(cell)) {
          const i = N.p.indexOf(cell);
          if (i >= 0) {                                                   // luật 29/10: thùng nhích 1 ô, xe vào ô thùng vừa rời (như xích đẩy); ô sau thùng bị chặn thì cả hai đứng yên
            const sx = nx + vg[0], sy = ny + vg[1];
            if (!thungChan(sx, sy)) { N.p[i] = sy * rong + sx; N.e[i] = 0; N.x = nx; N.y = ny; }
          } else { N.x = nx; N.y = ny; }
        }
      }
    }
  } else if (a === 'M' || a === 'B') {
    const v = VEC[N.h], s = a === 'M' ? 1 : -1, nx = N.x + v[0] * s, ny = N.y + v[1] * s;
    if (ctx.trongSan(nx, ny)) {
      const cell = ny * rong + nx, i = N.p.indexOf(cell);
      if (i >= 0) {
        if (a === 'M' && tuy.xichDay) {                                   // xích tiến vào thùng nặng: thùng trượt 1 ô nếu ô sau nhận được thùng
          const sx = nx + v[0], sy = ny + v[1];
          if (!thungChan(sx, sy)) { N.p[i] = sy * rong + sx; N.e[i] = 0; N.x = nx; N.y = ny; }
        }
      } else if (!ctx.chan[cell] && !cuaDong(cell)) { N.x = nx; N.y = ny; }
    }
  } else if (a === 'r') N.h = (N.h + 1) % 4;
  else if (a === 'l') N.h = (N.h + 3) % 4;
  // băng chuyền: không đẩy xích; đẩy thùng nằm trên băng đủ 2 nhịp liền
  if (N.p.length) {
    let dung = [];
    for (let i = 0; i < N.p.length; i++) {
      const c = N.p[i];
      if (ctx.bang[c] >= 0 && !((N.bm >> ctx.bangIdx[c]) & 1)) { N.e[i]++; if (N.e[i] >= 2) dung.push(i); } else N.e[i] = 0;
    }
    let doi = true;
    while (doi && dung.length) {
      doi = false;
      dung = dung.filter((i) => {
        const c = N.p[i], vb = VEC[ctx.bang[c]], x = c % rong + vb[0], y = Math.floor(c / rong) + vb[1];
        if (thungChan(x, y)) return true;
        N.p[i] = y * rong + x; N.e[i] = 0; doi = true;
        return false;
      });
    }
    dung.forEach((i) => { N.e[i] = 0; });
  }
  // cửa đổi ở cuối nhịp
  const tMoi = S.t + 1;
  ctx.cua.forEach((d, j) => {
    const dangMo = (N.cm >> j) & 1;
    const muon = d.nhip ? (((tMoi + d.nhip.pha) % (d.nhip.mo + d.nhip.dong)) < d.nhip.mo ? 1 : 0) : ((doiCua >> j) & 1 ? 1 - dangMo : dangMo);
    if (muon === dangMo) return;
    if (!muon && (d.cell === cellXe() || N.p.indexOf(d.cell) >= 0)) return;
    if (muon) N.cm |= 1 << j; else N.cm &= ~(1 << j);
  });
  N.t = tMoi % ctx.L;
  const k = ctx.diQua.indexOf(cellXe());
  if (k >= 0) N.q |= 1 << k;
  if (ctx.mucTieu === 'day-thung' && !Bo.laDich(ctx, N) && coThungKet(ctx, N)) N.chet = true;
  return N;
}
/** Một hành động (R / L = hai nhịp). Trả { S, nhip } với S.thang nếu chạm đích giữa chừng (toi-co / day-thung thắng ngay). */
export function buoc(ctx, S, a, tuy) {
  if (a === 'R' || a === 'L') {
    const S1 = motNhip(ctx, S, 'W', tuy);
    if (S1.chet) return { S: S1, nhip: 1 };
    return { S: motNhip(ctx, S1, a === 'R' ? 'r' : 'l', tuy), nhip: 2 };
  }
  return { S: motNhip(ctx, S, a, tuy), nhip: 1 };
}
const khoa = (S) => S.x + ',' + S.y + ',' + S.h + ',' + S.p.join('.') + ',' + S.e.join('.') + ',' + S.nm + ',' + S.cm + ',' + S.bm + ',' + S.t + ',' + S.q;
const thangNgay = (ctx) => ctx.mucTieu !== 'bong-mo';
function tuyCua(m, tuy) { return { beSung: tuy.beSung === undefined ? !!m.beSung : tuy.beSung, xichDay: tuy.xichDay === undefined ? !!m.xichDay : tuy.xichDay }; }

/* ------------------------------------------------------------------ 2. BFS tự do (chi phí nhịp 1 hay 2: hàng đợi theo nhịp) */
function bfsMotSan(m, i, tuy) {
  const ctx = ngoCanh(m, i), t = tuyCua(m, tuy), HD = tuy.hanhDong || hanhDong(m);
  const dau = Bo.trangThaiDau(ctx);
  if (Bo.laDich(ctx, dau)) return { nhip: 0, chuoi: '' };
  const toiDa = tuy.toiDa || 400;
  const lop = [[{ S: dau, c: '' }]], thay = new Map([[khoa(dau), 0]]);
  let soTT = 0;
  for (let n = 0; n < lop.length && n <= toiDa; n++) {
    for (const { S, c } of lop[n] || []) {
      for (const a of HD) {
        const { S: N, nhip } = buoc(ctx, S, a, t);
        if (N.chet) continue;
        const nn = n + nhip, cc = c + a;
        if (Bo.laDich(ctx, N)) return { nhip: nn, chuoi: cc, soTT };
        const k = khoa(N);
        if (thay.has(k) && thay.get(k) <= nn) continue;
        thay.set(k, nn); soTT++;
        (lop[nn] || (lop[nn] = [])).push({ S: N, c: cc });
        if (soTT > (tuy.toiDaTT || 500000)) return { nhip: null, chuoi: null, catNgang: true, soTT };
      }
    }
  }
  return { nhip: null, chuoi: null, soTT };
}
/** BFS tự do: tổng nhịp ngắn nhất (mỗi sân một đường riêng) hay null. tuy.haiBanh: xe hai bánh (bộ dò gói 2, giật như thường). */
export function nhipNganNhat(m, tuy = {}) {
  let tong = 0;
  const chuoi = [];
  for (let i = 0; i < dsSan(m).length; i++) {
    let r;
    if (tuy.haiBanh) {
      const con = catSan(m, i);
      const hb = Object.assign({}, con, { loaiRobot: 'banh', beSung: false, hamGoc: (con.hamGoc || []).filter((h) => !SanHoc.TAY_LENH.includes(h)) });
      const k = Bo.nhipSungHoiNganNhat(hb, { toiDaMs: 20000 });
      r = { nhip: k.nhip, chuoi: k.chuoi ? k.chuoi.map((a) => (a.ban ? a.ban + (a.luc || '') : a.banh)).join(' ') : null };
    } else r = bfsMotSan(m, i, tuy);
    if (r.nhip === null) return { nhip: null, chuoi: null, san: i, catNgang: !!r.catNgang };
    tong += r.nhip; chuoi.push(r.chuoi);
  }
  return { nhip: tong, chuoi };
}

/* ------------------------------------------------------------------ 3. dãy CHUNG cho mọi sân (màn nhiều sân, nhipTheo 'tong': mỗi nhịp tốn bằng số sân chưa xong) */
export function dayChung(m, gioiHan, tuy = {}) {
  const n = dsSan(m).length, ctxs = [], t = tuyCua(m, tuy), HD = tuy.hanhDong || hanhDong(m);
  for (let i = 0; i < n; i++) ctxs.push(ngoCanh(m, i));
  const dau = ctxs.map((c) => ({ S: Bo.trangThaiDau(c), xong: false }));
  const k = (ds) => ds.map((d) => (d.xong ? 'X' : khoa(d.S))).join('|');
  const lop = [[{ ds: dau, c: '' }]], thay = new Map([[k(dau), 0]]);
  let soTT = 0;
  for (let g = 0; g < lop.length && g <= gioiHan; g++) {
    for (const { ds, c } of lop[g] || []) {
      for (const a of HD) {
        let gia = 0, chet = false;
        const moi = ds.map((d, i) => {
          if (d.xong) return d;
          const { S: N, nhip } = buoc(ctxs[i], d.S, a, t);
          gia += nhip;
          if (N.chet) chet = true;
          return { S: N, xong: thangNgay(ctxs[i]) && Bo.laDich(ctxs[i], N) };
        });
        if (chet) continue;
        const gg = g + gia;
        if (gg > gioiHan) continue;
        const xongHet = moi.every((d, i) => d.xong || (!thangNgay(ctxs[i]) && Bo.laDich(ctxs[i], d.S)));
        if (xongHet) return { nhip: gg, chuoi: c + a, soTT };
        const kk = k(moi);
        if (thay.has(kk) && thay.get(kk) <= gg) continue;
        thay.set(kk, gg); soTT++;
        (lop[gg] || (lop[gg] = [])).push({ ds: moi, c: c + a });
        if (soTT > (tuy.toiDaTT || 1500000)) return { catNgang: true, soTT };
      }
    }
  }
  return null;
}

/* ------------------------------------------------------------------ 4. dãy → mã Python, so chéo với lõi */
export function chuoiThanhMa(chuoi, m) {
  const MA = {
    M: ['left_move()', 'right_move()', 'wait()'], B: ['left_back()', 'right_back()', 'wait()'],
    R: ['right_back()', 'wait()', 'right_back()', 'wait()'], L: ['right_move()', 'wait()', 'right_move()', 'wait()'], W: ['wait()'],
    c: ['spray("high")', 'wait()'], h: ['spray_back("high")', 'wait()'], f: ['spray()', 'wait()'], g: ['spray_back()', 'wait()']
  };
  return [...chuoi].flatMap((a) => MA[a]).join('\n') + '\n';
}
function rng(hat) { let s = hat >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
/** So bộ mô phỏng với SanHoc.chay trên soLan dãy ngẫu nhiên mỗi sân (bệ súng theo màn và cả không bệ súng). '' nếu khớp. */
export function kiemCheo(m, soLan = 60, hat = 7) {
  const r = rng(hat), HD = hanhDong(m);
  for (let i = 0; i < dsSan(m).length; i++) {
    const ctx = ngoCanh(m, i), con = ctx.con;
    for (const beSung of [!!m.beSung, false]) {
      const t = tuyCua(m, { beSung });
      for (let lan = 0; lan < soLan; lan++) {
        const dai = 1 + Math.floor(r() * 14);
        let c = '';
        for (let j = 0; j < dai; j++) c += HD[Math.floor(r() * HD.length)];
        let S = Bo.trangThaiDau(ctx), nhip = 0, thang = false, cat = c.length;
        for (let j = 0; j < c.length; j++) {
          const b = buoc(ctx, S, c[j], t);
          S = b.S; nhip += b.nhip;
          if (S.chet) { cat = j + 1; break; }
          if (thangNgay(ctx) && Bo.laDich(ctx, S)) { thang = true; cat = j + 1; break; }
        }
        const cc = c.slice(0, cat);
        const cfg = Object.assign({}, con, { beSung, nhipToiDa: 200 });
        let kq;
        try { kq = SanHoc.chay(cfg, chuoiThanhMa(cc, m)); } catch (e) { return 'sân ' + (i + 1) + ' lõi báo lỗi: ' + e.message; }
        if (S.chet) continue;                                            // thùng kẹt góc: lõi dừng sớm, chỉ cần cùng dừng
        if (!thangNgay(ctx)) thang = Bo.laDich(ctx, S);
        const { rong } = ctx;
        const lech = [];
        if (kq.robot.x !== S.x || kq.robot.y !== S.y || kq.robot.huong !== S.h) lech.push('xe ' + JSON.stringify(kq.robot) + ' / ' + S.x + ',' + S.y + ',' + S.h);
        const tl = (kq.thung || []).map((q) => q.y * rong + q.x).sort((a, b) => a - b).join('.'), ts = S.p.slice().sort((a, b) => a - b).join('.');
        if (tl !== ts) lech.push('thùng ' + tl + ' / ' + ts);
        const nl = (kq.nut || []).map((q) => (q.bat ? 1 : 0)).join(''), ns = ctx.san.nut.map((_, j) => ((S.nm >> j) & 1)).join('');
        const nutBat = (con.nutBat || []).map((q) => ctx.san.nut.findIndex((n) => n.x === q.x && n.y === q.y));
        const ns2 = [...ns].map((b, j) => (nutBat.includes(j) ? 1 - +b : +b)).join('');
        if (nl !== ns2) lech.push('nút ' + nl + ' / ' + ns2);
        const cl = (kq.cua || []).map((q) => (q.mo ? 1 : 0)).join(''), cs = ctx.cua.map((_, j) => ((S.cm >> j) & 1)).join('');
        if (cl !== cs) lech.push('cửa ' + cl + ' / ' + cs);
        if (!!kq.thang !== thang) lech.push('thắng ' + kq.thang + ' / ' + thang);
        if (kq.nhip !== nhip) lech.push('nhịp ' + kq.nhip + ' / ' + nhip);
        if (lech.length) return 'sân ' + (i + 1) + (beSung ? ' bệ súng' : ' không bệ súng') + ', dãy ' + cc + ': ' + lech.join('; ');
      }
    }
  }
  return '';
}

/* ------------------------------------------------------------------ 5. màn khóa: thân cố định (không cảm biến) của hàm tenHam
   Thân cố định = ghép tới tuy.dai (mặc định 4) dòng không đọc cảm biến, mỗi dòng một khối hành động (bảng DONG: lệnh của xích, hàm của em không cảm biến, lệnh bắn có lực).
   Một thân cố định chạy ra CÙNG một dãy hành động ở mọi lần gọi, nên chương trình chính khóa (mở được thành dãy: for số cố định, lệnh trong bảng, X = lời gọi hàm) thành
   một dãy cố định: mô phỏng nhanh bằng bộ mô phỏng (beSung theo tuy), chỉ thân nào THẮNG trong sao.nhip mới chấm thật bằng cham.js (chamThan(than) → kết quả cham, để lấy ô và sao).
   Chương trình chính không mở được (có lời gọi đọc cảm biến): chấm thật mọi thân tới 2 dòng. Trả thân rẻ nhất được 3 sao hay { khong: true, soThan, soThang }. */
function bangDong(m, kho) {
  const ten = new Set(kho.map((h) => h.ten)), hg = m.hamGoc || [];
  const ds = [['move()', 'M'], ['back()', 'B'], ['tr_right()', 'R'], ['tr_left()', 'L'], ['spin()', 'RR'], ['sidestep()', 'RML'], ['wait()', 'W'],
    ['forward(2)', 'MM'], ['forward(3)', 'MMM']];
  if (m.lucBan) ds.push(['squirt("high")', 'c'], ['squirt("low")', 'f'], ['squirt_back("high")', 'h'], ['squirt_back("low")', 'g']);
  return ds.filter(([l, a]) => {
    const t = l.match(/^(\w+)\(/)[1];
    if (!(hg.includes(t) || ten.has(t))) return false;
    if (/[hg]/.test(a) && !hg.includes('spray_back')) return false;
    if (/[cf]/.test(a) && !hg.includes('spray')) return false;
    return true;
  });
}
/** Mở chương trình chính khóa thành dãy hành động ('X' = lời gọi hàm tenX), hay null nếu có dòng ngoài bảng (cảm biến, if, while…). */
export function moChinh(dong, bang, tenX) {
  const ma = new Map(bang);
  const ds = dong.map((l) => l.replace(/#.*$/, '')).filter((l) => l.trim());
  const thut = (l) => l.match(/^ */)[0].length;
  function khoi(a, b) {
    let kq = '';
    for (let i = a; i < b; i++) {
      const t = ds[i].trim(), f = t.match(/^for\s+\w+\s+in\s+range\((\d+)\):$/);
      if (f) { let j = i + 1; while (j < b && thut(ds[j]) > thut(ds[i])) j++; const k = khoi(i + 1, j); if (k === null) return null; kq += k.repeat(+f[1]); i = j - 1; continue; }
      if (t === tenX + '()') { kq += 'X'; continue; }
      if (t === 'go_to_wall()') { kq += 'G'; continue; }                 // chương trình chính khóa có go_to_wall(): mô phỏng thẳng (tiến tới khi ô trước bị chặn)
      const fw = t.match(/^forward((d+))$/);
      if (fw && ma.has('move()')) { kq += 'M'.repeat(+fw[1]); continue; }
      if (!ma.has(t)) return null;
      kq += ma.get(t);
    }
    return kq;
  }
  return khoi(0, ds.length);
}
/** Mô phỏng một dãy cố định trên màn một sân; trả số nhịp nếu thắng trong gioiHan, không thì false. */
const CTX = new WeakMap();
export function chayDay(m, day, tuy = {}) {
  if (!CTX.has(m)) CTX.set(m, ngoCanh(m, 0));
  const ctx = CTX.get(m), t = tuyCua(m, tuy), { rong } = ctx;
  const truocTrong = (S) => {                                             // go_to_wall(): distance() > 0 khi ô ngay trước mũi trống (không tường, nút, rào, cửa đóng, thùng)
    const v = VEC[S.h], x = S.x + v[0], y = S.y + v[1];
    if (!ctx.trongSan(x, y)) return false;
    const c = y * rong + x, j = ctx.cuaIdx[c];
    return !ctx.chan[c] && !(j >= 0 && !((S.cm >> j) & 1)) && S.p.indexOf(c) < 0;
  };
  let S = Bo.trangThaiDau(ctx), nhip = 0;
  const gioiHan = tuy.gioiHan === undefined ? m.sao.nhip : tuy.gioiHan;
  for (const a of day) {
    if (a === 'G') {
      while (truocTrong(S)) {
        const b = buoc(ctx, S, 'M', t);
        S = b.S; nhip += b.nhip;
        if (S.chet || nhip > gioiHan) return false;
        if (thangNgay(ctx) && Bo.laDich(ctx, S)) return nhip;
      }
      continue;
    }
    const b = buoc(ctx, S, a, t);
    S = b.S; nhip += b.nhip;
    if (S.chet || nhip > gioiHan) return false;
    if (thangNgay(ctx) && Bo.laDich(ctx, S)) return nhip;
  }
  return !thangNgay(ctx) && Bo.laDich(ctx, S) ? nhip : false;
}
export function thanCoDinh(m, kho, tenX, chamThan, tuy = {}) {
  const bang = bangDong(m, kho), dai = tuy.dai || 4;
  const chinh = moChinh(m.loiGiai.chinh, bang, tenX);
  let tot = null, soThan = 0, soThang = 0;
  const thu = (than) => {
    const r = chamThan(than);
    if (r.thang && r.sao === 3 && (!tot || r.soO < tot.soO)) tot = { soO: r.soO, soNhip: r.soNhip, than: than.slice() };
  };
  if (chinh === null) {
    (function di(than) {
      if (than.length) { soThan++; thu(than); }
      if (than.length >= 2) return;
      for (const [l] of bang) { than.push(l); di(than); than.pop(); }
    })([]);
    soThan++; thu(['pass']);
    if (tuy.thamSo && tuy.thamSo.length) {                                 // hàm có tham số n: thêm thân "for i in range(n):" với một hay hai dòng cố định
      const n = tuy.thamSo[0];
      for (const [a] of bang) { soThan++; thu(['for i in range(' + n + '):', '    ' + a]); for (const [b] of bang) { soThan++; thu(['for i in range(' + n + '):', '    ' + a, '    ' + b]); } }
    }
  } else {
    const thang = new Map();                                              // dãy x thắng → các thân ngắn nhất cho ra x
    (function di(than, x) {
      soThan++;
      const n = chayDay(m, chinh.split('X').join(x), tuy);
      if (n !== false) {
        soThang++;
        const ds = thang.get(x) || [];
        if (!ds.length || ds[0].length === than.length) { ds.push(than.slice()); thang.set(x, ds); }
        else if (than.length < ds[0].length) thang.set(x, [than.slice()]);
      }
      if (than.length >= dai) return;
      for (const [l, a] of bang) { than.push(l); di(than, x + a); than.pop(); }
    })([], '');
    for (const ds of thang.values()) for (const than of ds) thu(than.length ? than : ['pass']);
  }
  return tot ? Object.assign(tot, { soThan, soThang, moDuoc: chinh !== null }) : { khong: true, soThan, soThang, moDuoc: chinh !== null };
}

/* ------------------------------------------------------------------ chạy riêng: in bảng */
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const M = require('./lo-trinh-hoc.js');
  for (const m of M.manBeSung || []) {
    const co = nhipNganNhat(m), khong = nhipNganNhat(m, { beSung: false }), hb = dsSan(m).length === 1 ? nhipNganNhat(m, { haiBanh: true }) : { nhip: '-' };
    console.log([m.ma, 'sao.nhip ' + m.sao.nhip, 'bệ súng ' + co.nhip + ' ' + (co.chuoi || []).join('|'), 'không bệ súng ' + khong.nhip, 'hai bánh ' + hb.nhip, 'so chéo ' + (kiemCheo(m, 40) || 'khớp')].join(' · '));
  }
}

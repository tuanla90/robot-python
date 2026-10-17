/* ============================================================================
   do-duong-sung-hoi.mjs — BỘ DÒ ĐƯỜNG TẮT cho màn của XE GẮN SÚNG HƠI (chương `sung-hoi`; che-sung-hoi dùng lại qua do-duong-che-sung-hoi.mjs). loaiRobot 'banh'.
   Dùng trong máy kiểm (kiem-hoc.mjs, kiem-sung-hoi.mjs, kiem-che-sung-hoi.mjs); không nằm trong game.

   BFS theo NHỊP, luật y hệt san-hoc.js (phần THÙNG NẶNG + SÚNG HƠI). Trạng thái: ô xe, hướng, bộ đếm băng chuyền của xe, vị trí + bộ đếm băng của từng thùng,
   nút nào đang bật, cửa nào đang mở, băng nào đang tắt, nhịp mod chu kỳ cửa nhịp, tập ô ◆ (diQua) đã qua.
   Một HÀNH ĐỘNG mỗi nhịp, MỘT trong:
     - hiệu quả bánh: tien | lui | phai | trai | dau | cho (đứng yên) — tập cho phép do phần cứng quyết định (toHopChoPhep của do-duong-che-xe.mjs; mặc định đủ sáu);
     - ban-truoc  (shoot không đảo: bóng ra trước, xe giật lùi)  hay  ban-sau (bóng ra sau, xe giật tới) — nếu phần cứng có shoot / shoot_back.
   Nhịp có bắn thì bánh nghỉ (khay chặn luôn lệnh bánh cùng nhịp), nên bắn là MỘT hành động riêng.
   Thứ tự trong nhịp: bắn (bóng bay, nút đổi, băng đổi ngay) → giật (xe / thùng) → băng chuyền xe → băng chuyền thùng → cửa đổi ở cuối nhịp (cửa không đóng đè lên xe hay thùng).
   Mục tiêu: 'toi-co' (chạm cờ F), 'day-thung' (mọi thùng nằm trên ô đích; thùng kẹt góc = trạng thái chết), 'bong-mo' (xe đúng tư thế, đã qua mọi ô ◆, thùng mờ nếu khai: thắng khi chương trình CHẠY XONG nên
   BFS dừng ở trạng thái đầu tiên thỏa). Không hỗ trợ: vật nhẹ (o, X), tay kẹp, xích / omni, hố / gầm.
   BFS CÓ GIỚI HẠN: tuyChon.toiDaTrangThai (mặc định 600000) và tuyChon.toiDaMs (mặc định 10000); vượt thì trả { nhip: null, catNgang: true }.

   Hàm xuất:
     nhipSungHoiNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi:[hành động] } | { nhip:null, … }   (man: MỘT sân)
        tuyChon.phanCung, tuyChon.batDau {x,y,huong}, tuyChon.trangThai {p, nm, cm, bm, t, q}  (trạng thái giữa chừng, sau một đoạn chương trình cố định), tuyChon.hanhDong (ép tập hành động)
     nhipSungHoiTatCa(man, tuyChon)    → TỔNG nhịp ngắn nhất trên mọi sân (null nếu có sân không giải được hay bị cắt ngang)
     dungNguCanh, trangThaiDau, buocMotNhip, laDich, hanhDongChoPhep, chuoiThanhMa — để so chéo với SanHoc
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { toHopChoPhep } from './do-duong-che-xe.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

export const HIEU_QUA_BANH = ['cho', 'tien', 'phai', 'trai', 'lui', 'dau'];

/** Các hành động cho phép theo phần cứng: bánh (6 hiệu quả) + ban-truoc / ban-sau. */
export function hanhDongChoPhep(man, tuyChon = {}) {
  const pc = tuyChon.phanCung || SanHoc.phanCungCua(man);
  const kq = toHopChoPhep(man, { phanCung: pc, daoChieu: (man.daoChieu || []).filter((x) => x === 'trai' || x === 'phai') }).map((b) => ({ banh: b }));
  // daoChieu 'sung' chỉ đổi TÊN lệnh (shoot ↔ shoot_back), không đổi tập hiệu quả làm được: ban-truoc cần nòng trước, ban-sau cần nòng sau (đã tính đảo)
  const dao = (man.daoChieu || []).includes('sung');
  const truoc = dao ? 'shoot_back' : 'shoot', sau = dao ? 'shoot' : 'shoot_back';
  if (pc.includes(truoc)) kq.push({ ban: 'truoc' });
  if (pc.includes(sau)) kq.push({ ban: 'sau' });
  return kq;
}

/** Dựng ngữ cảnh từ một màn MỘT sân (san, batDau, mucTieu, bongMo, noi, cuaNhip). */
export function dungNguCanh(man, tuyChon = {}) {
  const loai = man.loaiRobot || 'banh';
  if (loai !== 'banh') throw new Error('Bộ dò súng hơi chỉ biết xe hai bánh.');
  const san = SanHoc.docSan(man.san, man.mau || null, null, null);
  if (san.vat.length) throw new Error('Bộ dò súng hơi không hỗ trợ vật nhẹ (o, X).');
  if (san.gam.length || san.ho.length) throw new Error('Bộ dò súng hơi không hỗ trợ gầm / hố.');
  if ((man.hamGoc || []).some((t) => SanHoc.TAY_LENH.includes(t))) throw new Error('Bộ dò súng hơi không hỗ trợ tay kẹp.');
  const rong = san.rong, cao = san.cao, o = (x, y) => y * rong + x;
  const trongSan = (x, y) => x >= 0 && y >= 0 && x < rong && y < cao;
  const chan = new Uint8Array(rong * cao), banDung = new Uint8Array(rong * cao), thungChanTinh = new Uint8Array(rong * cao), mepGoc = new Uint8Array(rong * cao);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) {
    const c = san.o[y][x];
    chan[o(x, y)] = SanHoc.lyDoChan(san, loai, x, y) ? 1 : 0;
    banDung[o(x, y)] = c === '#' || c === 'N' || c === 'S' ? 1 : 0;
    thungChanTinh[o(x, y)] = c === '#' || c === 'N' || c === '=' || c === 'S' ? 1 : 0;       // ô thùng không trượt vào được (cửa đóng và thùng khác xét riêng)
    mepGoc[o(x, y)] = c === '#' || c === '=' ? 1 : 0;                                          // tường / hàng rào: tính là "tường" cho thùng kẹt góc
  }
  const bang = new Int8Array(rong * cao).fill(-1), bangIdx = new Int16Array(rong * cao).fill(-1), bangDs = [];
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) {
    const h = SanHoc.BANG[san.o[y][x]];
    if (h !== undefined) { bang[o(x, y)] = h; bangIdx[o(x, y)] = bangDs.length; bangDs.push(o(x, y)); }
  }
  const nutIdx = new Int16Array(rong * cao).fill(-1);
  san.nut.forEach((n, i) => { nutIdx[o(n.x, n.y)] = i; });
  const cuaIdx = new Int16Array(rong * cao).fill(-1);
  const cua = san.cua.map((d, i) => { cuaIdx[o(d.x, d.y)] = i; return { cell: o(d.x, d.y), mo0: d.mo, nhip: null }; });
  for (const cn of man.cuaNhip || []) {
    const d = cua[cuaIdx[o(cn.x, cn.y)]];
    if (!d) throw new Error('Cửa nhịp không ở ô cửa.');
    d.nhip = { mo: cn.mo, dong: cn.dong, pha: cn.pha || 0 };
  }
  let L = 1;
  for (const d of cua) if (d.nhip) { const ck = d.nhip.mo + d.nhip.dong; L = (L * ck) / gcd(L, ck); }
  if (L > 2000) throw new Error('Chu kỳ cửa nhịp quá dài cho bộ dò.');
  const nutCua = san.nut.map(() => []), nutBang = san.nut.map(() => []);
  if (man.noi) {
    for (const g of man.noi) {
      const i = nutIdx[o(g.nut.x, g.nut.y)];
      if (i < 0) throw new Error('Nhóm nối: không phải nút.');
      for (const c of g.cua || []) { const j = cuaIdx[o(c.x, c.y)]; if (j < 0 || cua[j].nhip) throw new Error('Nhóm nối: cửa sai.'); if (!nutCua[i].includes(j)) nutCua[i].push(j); }
      for (const b of g.bang || []) { const j = bangIdx[o(b.x, b.y)]; if (j < 0) throw new Error('Nhóm nối: băng sai.'); if (!nutBang[i].includes(j)) nutBang[i].push(j); }
    }
  } else {
    san.nut.forEach((_, i) => { cua.forEach((d, j) => { if (!d.nhip) nutCua[i].push(j); }); bangDs.forEach((_, j) => nutBang[i].push(j)); });
  }
  const dich = new Uint8Array(rong * cao);
  for (const d of san.dich) dich[o(d.x, d.y)] = 1;
  const mucTieu = man.mucTieu || 'toi-co';
  const bm = mucTieu === 'bong-mo' ? man.bongMo : null;
  const diQua = bm ? (bm.diQua || []).map((q) => o(q.x, q.y)) : [];
  const thungMo = bm && bm.thung ? bm.thung.map((q) => o(q.x, q.y)) : null;
  return { san, loai, rong, cao, o, trongSan, chan, banDung, thungChanTinh, mepGoc, bang, bangIdx, bangDs, nutIdx, cuaIdx, cua, nutCua, nutBang, L, dich, mucTieu, bm, diQua, thungMo,
    thung0: san.thung.map((t) => o(t.x, t.y)), bd: tuyChon.batDau || man.batDau, nguong: 2 };
}

const cuaMoNhip = (nh, t) => ((t + nh.pha) % (nh.mo + nh.dong)) < nh.mo;

/** Trạng thái đầu (hay trạng thái giữa chừng nếu có tuyChon.trangThai). */
export function trangThaiDau(ctx, tuyChon = {}) {
  const tt = tuyChon.trangThai || {};
  let cm = 0;
  ctx.cua.forEach((d, i) => { const mo = d.nhip ? cuaMoNhip(d.nhip, tt.t || 0) : d.mo0; if (mo) cm |= 1 << i; });
  if (tt.cm !== undefined) cm = tt.cm;
  const p = (tt.p || ctx.thung0).slice();
  return { x: ctx.bd.x, y: ctx.bd.y, h: ctx.bd.huong || 0, d: 0, p, e: p.map(() => 0), nm: tt.nm || 0, cm, bm: tt.bm || 0, t: (tt.t || 0) % ctx.L, q: tt.q || 0 };
}

/** Thùng kẹt góc (không phải ô đích)? Giống thungKet() của san-hoc.js. */
function coThungKet(ctx, S) {
  const { rong, cao } = ctx;
  const tm = (x, y) => !ctx.trongSan(x, y) || ctx.mepGoc[y * rong + x] === 1;
  for (const c of S.p) {
    if (ctx.dich[c]) continue;
    const x = c % rong, y = Math.floor(c / rong);
    if (!(tm(x - 1, y) || tm(x + 1, y))) continue;
    if (!(tm(x, y - 1) || tm(x, y + 1))) continue;
    const hb = ctx.bang[c];
    if (hb >= 0) {
      const v = SanHoc.VEC[hb], nx = x + v[0], ny = y + v[1];
      if (ctx.trongSan(nx, ny) && ctx.san.o[ny][nx] !== '#' && ctx.san.o[ny][nx] !== 'S') continue;
    }
    return true;
  }
  return false;
}

/** Một nhịp. Trả về trạng thái mới (bản sao). */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, h: S.h, d: S.d, p: S.p.slice(), e: S.e.slice(), nm: S.nm, cm: S.cm, bm: S.bm, t: S.t, q: S.q, chet: false };
  const { rong, VEC = SanHoc.VEC } = ctx;
  const cuaDong = (cell) => { const j = ctx.cuaIdx[cell]; return j >= 0 && !((N.cm >> j) & 1); };
  const cellXe = () => N.y * rong + N.x;
  /** Ô (x, y) không nhận thêm được một thùng? (oThungChan của san-hoc.js) */
  const thungChan = (x, y) => {
    if (!ctx.trongSan(x, y)) return true;
    const c = y * rong + x;
    if (ctx.thungChanTinh[c]) return true;
    if (cuaDong(c)) return true;
    if (N.p.indexOf(c) >= 0) return true;
    return N.x === x && N.y === y;
  };
  let doiCua = 0;
  if (a.ban) {
    const hb = a.ban === 'sau' ? (N.h + 2) % 4 : N.h;
    // (a) bóng bay
    const v = VEC[hb];
    let x = N.x, y = N.y;
    for (;;) {
      x += v[0]; y += v[1];
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
    // (b) giật
    const hg = (hb + 2) % 4, vg = VEC[hg], nx = N.x + vg[0], ny = N.y + vg[1];
    if (ctx.trongSan(nx, ny)) {
      const cell = ny * rong + nx;
      if (!ctx.chan[cell] && !cuaDong(cell)) {
        const i = N.p.indexOf(cell);
        if (i >= 0) {                                              // thùng nhận lực: trượt ra xa tới vật cản đầu tiên
          let cx = nx, cy = ny;
          while (!thungChan(cx + vg[0], cy + vg[1])) { cx += vg[0]; cy += vg[1]; }
          if (cx !== nx || cy !== ny) { N.p[i] = cy * rong + cx; N.e[i] = 0; }
        } else { N.x = nx; N.y = ny; }
      }
    }
  } else {
    const tuDi = (huongDi, soBuoc) => {
      const v = VEC[huongDi], nx = N.x + v[0] * soBuoc, ny = N.y + v[1] * soBuoc;
      if (!ctx.trongSan(nx, ny)) return;
      const cell = ny * rong + nx;
      if (!ctx.chan[cell] && !cuaDong(cell) && N.p.indexOf(cell) < 0) { N.x = nx; N.y = ny; }
    };
    switch (a.banh) {
      case 'tien': tuDi(N.h, 1); break;
      case 'lui': tuDi(N.h, -1); break;
      case 'phai': N.h = (N.h + 1) % 4; break;
      case 'trai': N.h = (N.h + 3) % 4; break;
      case 'dau': N.h = (N.h + 2) % 4; break;
      default: break;
    }
  }
  // băng chuyền của xe
  const hb = ctx.bang[cellXe()];
  if (hb >= 0 && !((N.bm >> ctx.bangIdx[cellXe()]) & 1)) {
    N.d++;
    if (N.d >= ctx.nguong) {
      const v = VEC[hb], nx = N.x + v[0], ny = N.y + v[1];
      if (ctx.trongSan(nx, ny)) {
        const cell = ny * rong + nx;
        if (!ctx.chan[cell] && !cuaDong(cell) && N.p.indexOf(cell) < 0) { N.x = nx; N.y = ny; }
      }
      N.d = 0;
    }
  } else N.d = 0;
  // băng chuyền đẩy thùng
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
    const muon = d.nhip ? (cuaMoNhip(d.nhip, tMoi) ? 1 : 0) : ((doiCua >> j) & 1 ? 1 - dangMo : dangMo);
    if (muon === dangMo) return;
    if (!muon && (d.cell === cellXe() || N.p.indexOf(d.cell) >= 0)) return;     // xe hay thùng đang ở ô cửa: giữ mở
    if (muon) N.cm |= 1 << j; else N.cm &= ~(1 << j);
  });
  N.t = tMoi % ctx.L;
  // ô ◆
  const k = ctx.diQua.indexOf(cellXe());
  if (k >= 0) N.q |= 1 << k;
  if (ctx.mucTieu === 'day-thung' && !laDich(ctx, N) && coThungKet(ctx, N)) N.chet = true;
  return N;
}

/** Trạng thái S đã đạt mục tiêu chưa (bong-mo: nếu chương trình dừng ở đây). */
export function laDich(ctx, S) {
  if (ctx.mucTieu === 'toi-co') { const co = ctx.san.co; return !!co && S.x === co.x && S.y === co.y; }
  if (ctx.mucTieu === 'day-thung') return S.p.length > 0 && S.p.every((c) => ctx.dich[c]);
  const bm = ctx.bm;
  if (S.x !== bm.x || S.y !== bm.y) return false;
  if (bm.huong !== null && bm.huong !== undefined && S.h !== bm.huong) return false;
  if (S.q !== (1 << ctx.diQua.length) - 1) return false;
  if (ctx.thungMo) {
    if (S.p.length !== ctx.thungMo.length) return false;
    if (!ctx.thungMo.every((c) => S.p.includes(c))) return false;
  }
  return true;
}

function khoa(S) {
  return S.x + ',' + S.y + ',' + S.h + ',' + S.d + ',' + S.p.join('.') + ',' + S.e.join('.') + ',' + S.nm + ',' + S.cm + ',' + S.bm + ',' + S.t + ',' + S.q;
}

export function nhipSungHoiNganNhat(man, tuyChon = {}) {
  const ctx = dungNguCanh(man, tuyChon);
  const toiDa = tuyChon.toiDaTrangThai === undefined ? 600000 : tuyChon.toiDaTrangThai;
  const toiDaMs = tuyChon.toiDaMs === undefined ? 10000 : tuyChon.toiDaMs;
  const t0 = Date.now();
  const dau = trangThaiDau(ctx, tuyChon);
  if (laDich(ctx, dau)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const HD = tuyChon.hanhDong || hanhDongChoPhep(man, tuyChon);
  const thay = new Set([khoa(dau)]);
  const cha = [-1], act = [null], kho = [dau];
  let i = 0, nhip = 0;
  while (i < kho.length) {
    nhip++;
    const cuoiLop = kho.length;
    for (; i < cuoiLop; i++) {
      if ((i & 255) === 0 && Date.now() - t0 >= toiDaMs) return { nhip: null, soTrangThai: kho.length, catNgang: true, chuoi: null };
      const S = kho[i];
      for (const a of HD) {
        const N = buocMotNhip(ctx, S, a);
        if (N.chet) continue;
        const kk = khoa(N);
        if (thay.has(kk)) continue;
        thay.add(kk);
        cha.push(i); act.push(a); kho.push(N);
        if (laDich(ctx, N)) {
          const chuoi = [];
          for (let j = kho.length - 1; j > 0; j = cha[j]) chuoi.push(act[j]);
          return { nhip, soTrangThai: kho.length, catNgang: false, chuoi: chuoi.reverse() };
        }
        if (kho.length > toiDa) return { nhip: null, soTrangThai: kho.length, catNgang: true, chuoi: null };
      }
    }
  }
  return { nhip: null, soTrangThai: kho.length, catNgang: false, chuoi: null };
}

/** TỔNG nhịp ngắn nhất trên mọi sân (nhiều sân: man.san là mảng sân; batDau / bongMo / mau / cuaNhip / noi song song nếu là mảng). */
export function nhipSungHoiTatCa(man, tuyChon = {}) {
  const nhieu = Array.isArray(man.san[0]);
  const dsSan = nhieu ? man.san : [man.san];
  let tong = 0;
  dsSan.forEach((rows, i) => {
    const lm = SanHoc.lopMauCuaSan(man, i);
    const con = Object.assign({}, man, { san: rows, batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau, mau: lm.mau, bongMo: lm.bongMo || man.bongMo, cuaNhip: lm.cuaNhip || undefined, noi: lm.noi || undefined });
    const k = nhipSungHoiNganNhat(con, tuyChon).nhip;
    tong = tong === null || k === null ? null : tong + k;
  });
  return tong;
}

/**
 * Chuỗi hành động → mã Python lệnh gốc (mỗi hành động một nhóm lệnh + wait()).
 * tuyChon.daoChieu: ['sung'] thì ban-truoc viết shoot_back() và ban-sau viết shoot() (hiệu quả THẬT khác tên lệnh); ['trai'] / ['phai'] đảo lệnh bánh tương ứng.
 */
export function chuoiThanhMa(chuoi, tuyChon = {}) {
  const dao = tuyChon.daoChieu || [], pc = tuyChon.phanCung || null;
  const daoT = dao.includes('trai'), daoP = dao.includes('phai'), daoS = dao.includes('sung');
  const tl = (t) => (t === 0 ? [] : t > 0 === !daoT ? ['left_move()'] : ['left_back()']);     // giá trị THẬT t của bánh trái → lệnh (đảo thì chọn lệnh ngược)
  const pl = (p) => (p === 0 ? [] : p > 0 === !daoP ? ['right_move()'] : ['right_back()']);
  const BANH = { cho: [0, 0], tien: [1, 1], lui: [-1, -1], phai: [1, 0], trai: [0, 1], dau: [1, -1] };
  const dong = [];
  for (const a of chuoi) {
    if (a.ban) dong.push(((a.ban === 'truoc') === !daoS) ? 'shoot()' : 'shoot_back()');
    else { const [t, p] = BANH[a.banh]; dong.push(...tl(t), ...pl(p)); }
    dong.push('wait()');
  }
  void pc;
  return dong.join('\n') + '\n';
}

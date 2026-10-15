/* ============================================================================
   do-duong-nam-cham.mjs — BỘ DÒ ĐƯỜNG TẮT cho màn của XE GẮN NAM CHÂM CÓ CỰC (chương `nam-cham` và `che-nam-cham`; loaiRobot 'banh' hoặc 'omni').
   Dùng trong máy kiểm (kiem-hoc.mjs, kiem-nam-cham.mjs, kiem-che-nam-cham.mjs, do-duong-che-nam-cham.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô xe, hướng, cực nam châm: 0 tắt · 1 N · 2 S, bộ đếm băng chuyền, tập ô diQua đã qua, vị trí từng vật).
   Vị trí vật: ô trên sân, hoặc -1 = đang dính nam châm. Vật giống hệt nhau (cùng chất, cực, màu) được xếp tăng dần để gộp các trạng thái tương đương.
   Luật y hệt san-hoc.js (phần NAM CHÂM, 15/10: nam châm có CỰC):
     Thứ tự trong nhịp: (a) lệnh nam châm  →  (b) bánh chạy  →  (c) băng chuyền  →  (d) HÚT / ĐẨY.
     (a) magnet_n / magnet_s: đặt cực. magnet_off: ngắt; nếu đang dính một vật thì thả xuống ô ngay trước mũi xe khi ô đó nhận được (không tường, mép sân, bậc thang, hàng rào, nút, vật nằm);
         bị chặn thì vật vẫn dính và nam châm vẫn bật.
     (d) nam châm có cực, chưa dính vật: nhìn ô 1, 2, 3 trước mặt (tường, mép sân chắn); VẬT ĐẦU TIÊN: gỗ → không gì; sắt (cách ≤ 2 ô) → hút, cực nào cũng hút, không bao giờ bị đẩy;
         vật nam châm (cách ≤ 3 ô) khác cực → hút, cùng cực → bị ĐẨY: trượt thẳng ra xa xe tối đa 3 ô, dừng ngay trước vật cản (tường, mép sân, bậc thang, rào, vật khác).
         Đang dính vật nam châm mà cực tay đổi thành CÙNG cực với vật: bị bắn ra (rơi xuống ô sát mũi nếu trống, rồi trượt như bị đẩy); sắt vẫn dính.
     Không hỗ trợ thùng nặng, nút, cửa (báo lỗi).
   Một HÀNH ĐỘNG = lệnh nam châm (không | n | s | off) × hiệu quả bánh. Mặc định: xe 'banh': đứng yên | tiến | quay phải | quay trái (4); xe 'omni': thêm trượt trái | trượt phải (6).
   tuyChon.dayDu = true: chín tổ hợp bánh. tuyChon.hieuQua = ['cho','tien','lui','phai','trai','dau']: tập hiệu quả bánh (chương che-nam-cham: phần cứng của màn).
   tuyChon.nc = ['n','s','off']: lệnh nam châm làm được (màn hỏng thiếu cực S: ['n','off']). tuyChon.batDau = { x, y, huong, cuc: 0|1|2, pos: [ô các vật], daQua: [ô diQua] }: trạng thái xuất phát khác.
   tuyChon.tachNhip = true: lệnh nam châm phải đứng MỘT MÌNH trong nhịp (bánh đứng yên), đúng cách viết "magnet_n()  wait()" của lời giải chuẩn. Không có tuyChon này, lệnh nam châm gộp được vào nhịp
   đi / quay ("magnet_n()  move()" là MỘT nhịp): đường ngắn hơn, là bài tối ưu riêng.
   Băng chuyền: đứng trên ô băng sau hành động thì đếm +1; đủ ngưỡng (2; omni: 1) thì đẩy 1 ô theo mũi tên (bị chặn thì đứng yên). Vật nằm dưới đất KHÔNG bị băng đẩy; vật dính đi theo xe.
   Vật nằm đất CHIẾM Ô: xe (và băng chuyền) không đưa xe vào ô có vật.
   Mục tiêu 'dua-vat': mọi vật cần (man.vatCan: 'sat' | 'nam-cham' | 'tu' | không có = mọi vật) nằm trên ô đích (ô đích có màu thì cùng màu vật; vật nam châm mang màu theo cực N đỏ, S xanh dương).
   Mục tiêu 'toi-co': xe chạm ô cờ F (vật chỉ là chướng ngại).
   Mục tiêu 'bong-mo': đúng bongMoDat của san-hoc.js (xe đúng ô và hướng, đã qua mọi ô diQua, xe đang dính vật nếu bongMo.cam, các vật còn lại đúng các ô bongMo.vat).
   Một sân. Nhiều sân: nhipNamChamTatCa() cộng nhịp từng sân.

   Hàm xuất:
     nhipNamChamNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }   (man: MỘT sân)
     nhipNamChamTatCa(man, tuyChon)    → tổng nhịp ngắn nhất trên mọi sân (null nếu có sân không giải được)
     dungNguCanh, trangThaiDau, buocMotNhip, laThang, hanhDongTuDo, chuoiThanhMa — để so chéo với SanHoc
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

// các tổ hợp bánh (trái, phải); 9 = trượt trái, 10 = trượt phải (chỉ omni)
const TO_HOP = [];
for (let t = -1; t <= 1; t++) for (let p = -1; p <= 1; p++) TO_HOP.push([t, p]);
const SLIDE_TRAI = 9, SLIDE_PHAI = 10;
const DUNG = TO_HOP.findIndex((x) => x[0] === 0 && x[1] === 0);
const TIEN = TO_HOP.findIndex((x) => x[0] === 1 && x[1] === 1);
const PHAI = TO_HOP.findIndex((x) => x[0] === 1 && x[1] === 0);
const TRAI = TO_HOP.findIndex((x) => x[0] === 0 && x[1] === 1);
const LUI = TO_HOP.findIndex((x) => x[0] === -1 && x[1] === -1);
const QUAY_DAU = TO_HOP.findIndex((x) => x[0] === 1 && x[1] === -1);
const HIEU_QUA = { cho: DUNG, tien: TIEN, lui: LUI, phai: PHAI, trai: TRAI, dau: QUAY_DAU };
const CUC_SO = { N: 1, S: 2 };

/** Dựng ngữ cảnh từ một màn MỘT sân (san, batDau, mau, vatMau, vatChat, vatThem, vatCan, loaiRobot, mucTieu, bongMo). */
export function dungNguCanh(man) {
  const loai = man.loaiRobot || 'banh';
  if (loai !== 'banh' && loai !== 'omni') throw new Error('Bộ dò nam châm chỉ biết xe bánh và omni.');
  if (/[HhNCc]/.test(man.san.join(''))) throw new Error('Bộ dò nam châm không hỗ trợ thùng nặng, nút, cửa.');
  const san = SanHoc.docSan(man.san, man.mau, man.vatMau, man.vatChat);
  const rong = san.rong, cao = san.cao;
  const o = (x, y) => y * rong + x;
  const chan = new Uint8Array(rong * cao);                       // xe không vào được (tường, bậc thang với bánh / omni, hàng rào)
  const khongNhan = new Uint8Array(rong * cao);                  // ô không nhận vật thả / trượt vào: tường, bậc thang, hàng rào
  const tuong = new Uint8Array(rong * cao);                      // tường cao: chắn tầm nhìn của nam châm
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) {
    const c = san.o[y][x];
    chan[o(x, y)] = SanHoc.lyDoChan(san, loai, x, y) ? 1 : 0;
    tuong[o(x, y)] = c === '#' ? 1 : 0;
    khongNhan[o(x, y)] = c === '#' || c === 'S' || c === '=' ? 1 : 0;
  }
  const dich = new Uint8Array(rong * cao);
  for (const d of san.dich) dich[o(d.x, d.y)] = 1;
  const bang = new Int8Array(rong * cao).fill(-1);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) { const h = SanHoc.BANG[san.o[y][x]]; if (h !== undefined) bang[o(x, y)] = h; }
  const ma = (m) => (m ? SanHoc.MAU_TEN.indexOf(m) + 1 : 0);
  const mauDich = new Uint8Array(rong * cao);
  for (const d of san.dich) mauDich[o(d.x, d.y)] = ma(d.mau);
  // vật nằm sẵn: các ô o / X của sân, rồi man.vatThem ({x, y, chat?, cuc?, mau?}: vật đặt ở ô không viết được bằng ký hiệu, vd trên băng chuyền), mỗi ô một vật như san-hoc.js
  const dsVat = san.vat.slice();
  for (const e of man.vatThem || []) if (!dsVat.some((v) => v.x === e.x && v.y === e.y)) dsVat.push(e);
  // chất: 0 gỗ · 1 sắt · 2 vật nam châm cực N · 3 vật nam châm cực S
  const kind = dsVat.map((v) => (v.chat === 'sat' ? 1 : v.chat === 'nam-cham' ? (v.cuc === 'N' ? 2 : 3) : 0));
  const mauVat = dsVat.map((v, i) => ma(v.mau || (kind[i] >= 2 ? SanHoc.CUC_MAU[v.cuc] : null)));
  const vc = man.vatCan || null;
  const can = dsVat.map((v, i) => (vc === null ? true : vc === 'sat' ? kind[i] === 1 : vc === 'nam-cham' ? kind[i] >= 2 : kind[i] >= 1));
  const mucTieu = man.mucTieu || (san.co ? 'toi-co' : 'dua-vat');
  const laBongMo = mucTieu === 'bong-mo';
  const co = mucTieu === 'toi-co' && san.co ? o(san.co.x, san.co.y) : -1;                         // mục tiêu 'toi-co': thắng NGAY khi xe chạm ô cờ F
  const bm = laBongMo ? man.bongMo : null;
  const diQua = bm ? (bm.diQua || []).map((q) => o(q.x, q.y)) : [];
  const dichVat = bm ? (bm.vat || []).map((q) => ({ o: o(q.x, q.y), mau: ma(q.mau) })) : [];
  return { san, loai, rong, cao, o, chan, tuong, khongNhan, dich, bang, mauDich, mauVat, kind, can, vat0: dsVat.map((v) => o(v.x, v.y)), bd: man.batDau,
    nguong: loai === 'omni' ? 1 : 2, lop: dsVat.map((v, i) => kind[i] * 8 + mauVat[i]),
    laBongMo, bm, diQua, dichVat, cam: !!(bm && bm.cam), camMau: bm && bm.camMau ? ma(bm.camMau) : 0, co };
}

/** Trạng thái đầu. pos[i]: ô của vật i, -1 = đang dính nam châm. c: cực (0 tắt, 1 N, 2 S). m: mặt nạ các ô diQua đã qua. */
export function trangThaiDau(ctx, tuyChon = {}) {
  const b = tuyChon.batDau || {};
  const bd = ctx.bd;
  const S = { x: b.x !== undefined ? b.x : bd.x, y: b.y !== undefined ? b.y : bd.y, h: b.huong !== undefined ? b.huong : (bd.huong || 0), c: b.cuc || 0, d: 0,
    m: 0, pos: b.pos ? b.pos.slice() : ctx.vat0.slice() };
  S.m = (b.daQua || []).reduce((mm, oq) => { const i = ctx.diQua.indexOf(oq); return i >= 0 ? mm | (1 << i) : mm; }, 0) | maDiQua(ctx, S.y * ctx.rong + S.x);
  return S;
}
const maDiQua = (ctx, oc) => { const i = ctx.diQua.indexOf(oc); return i >= 0 ? 1 << i : 0; };

/** Các hành động: lệnh nam châm × hành động bánh. */
export function hanhDongTuDo(ctx, tuyChon = {}) {
  let banh;
  if (tuyChon.hieuQua) banh = tuyChon.hieuQua.map((e) => HIEU_QUA[e]);
  else banh = tuyChon.dayDu ? TO_HOP.map((_, i) => i) : [DUNG, TIEN, PHAI, TRAI];
  if (ctx.loai === 'omni') banh.push(SLIDE_TRAI, SLIDE_PHAI);
  const ds = [];
  for (const nc of [null].concat(tuyChon.nc || ['n', 's', 'off'])) for (const b of banh) {          // tuyChon.nc: các lệnh nam châm làm được (màn hỏng: thiếu 's' hay 'n')
    if (tuyChon.tachNhip && nc !== null && b !== DUNG) continue;
    ds.push({ nc, banh: b });
  }
  return ds;
}

function trong(ctx, x, y) { return x >= 0 && y >= 0 && x < ctx.rong && y < ctx.cao; }

/** Một nhịp. Trả về trạng thái mới (bản sao). */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, h: S.h, c: S.c, d: S.d, m: S.m, pos: S.pos.slice() };
  const { rong } = ctx;
  const VEC = SanHoc.VEC;
  const o = (x, y) => y * rong + x;
  // ô (x, y) nhận được vật thả / trượt vào không (không tường, mép sân, bậc thang, hàng rào, vật nằm)
  const nhan = (x, y) => trong(ctx, x, y) && !ctx.khongNhan[o(x, y)] && N.pos.indexOf(o(x, y)) < 0;
  // (a) nam châm
  if (a.nc === 'n') N.c = 1;
  else if (a.nc === 's') N.c = 2;
  else if (a.nc === 'off') {
    const i = N.pos.indexOf(-1);
    if (i < 0) N.c = 0;
    else {
      const v = VEC[N.h], fx = N.x + v[0], fy = N.y + v[1];
      if (nhan(fx, fy)) { N.pos[i] = o(fx, fy); N.c = 0; }
    }
  }
  // (b) bánh
  const tuDi = (huongDi, soBuoc) => {
    const v = VEC[huongDi], nx = N.x + v[0] * soBuoc, ny = N.y + v[1] * soBuoc;
    if (trong(ctx, nx, ny) && !ctx.chan[o(nx, ny)] && N.pos.indexOf(o(nx, ny)) < 0) { N.x = nx; N.y = ny; }
  };
  if (a.banh === SLIDE_TRAI) tuDi((N.h + 3) % 4, 1);
  else if (a.banh === SLIDE_PHAI) tuDi((N.h + 1) % 4, 1);
  else {
    const [t, p] = TO_HOP[a.banh];
    if (t === 1 && p === 1) tuDi(N.h, 1);
    else if (t === -1 && p === -1) tuDi(N.h, -1);
    else if ((t === 1 && p === -1) || (t === -1 && p === 1)) N.h = (N.h + 2) % 4;
    else if ((t === 1 && p === 0) || (t === 0 && p === -1)) N.h = (N.h + 1) % 4;
    else if ((t === 0 && p === 1) || (t === -1 && p === 0)) N.h = (N.h + 3) % 4;
  }
  // (c) băng chuyền
  const hb = ctx.bang[o(N.x, N.y)];
  if (hb >= 0) {
    N.d++;
    if (N.d >= ctx.nguong) {
      const v = VEC[hb], nx = N.x + v[0], ny = N.y + v[1];
      if (trong(ctx, nx, ny) && !ctx.chan[o(nx, ny)] && N.pos.indexOf(o(nx, ny)) < 0) { N.x = nx; N.y = ny; }
      N.d = 0;
    }
  } else N.d = 0;
  N.m |= maDiQua(ctx, o(N.x, N.y));                              // "đã đi qua": cuối một nhịp xe đứng ở ô diQua
  // (d) hút / đẩy
  if (N.c) {
    const v = VEC[N.h];
    // trượt vật i từ ô (cx, cy) ra xa xe theo hướng mặt, tối đa TAM_DAY ô, dừng trước vật cản
    const truot = (i, cx, cy) => {
      let k = 0;
      N.pos[i] = o(cx, cy);                                       // (đặt tạm để ô xuất phát không bị tính là trống)
      while (k < SanHoc.TAM_DAY) {
        const nx = cx + v[0], ny = cy + v[1];
        if (!nhan(nx, ny)) break;
        cx = nx; cy = ny; k++;
      }
      N.pos[i] = o(cx, cy);
    };
    const i = N.pos.indexOf(-1);
    if (i >= 0) {                                                 // đang dính: vật nam châm cùng cực với tay thì bị bắn ra
      if (ctx.kind[i] >= 2 && CUC_SO[ctx.kind[i] === 2 ? 'N' : 'S'] === N.c) {
        const fx = N.x + v[0], fy = N.y + v[1];
        if (nhan(fx, fy)) truot(i, fx, fy);
      }
    } else {
      for (let k = 1; k <= SanHoc.TAM_CUC; k++) {
        const x = N.x + v[0] * k, y = N.y + v[1] * k;
        if (!trong(ctx, x, y) || ctx.tuong[o(x, y)]) break;
        const j = N.pos.indexOf(o(x, y));
        if (j < 0) continue;
        const kd = ctx.kind[j];
        if (kd === 1) { if (k <= SanHoc.TAM_HUT) N.pos[j] = -1; }
        else if (kd >= 2) {
          if (CUC_SO[kd === 2 ? 'N' : 'S'] === N.c) truot(j, x, y);     // cùng cực: đẩy
          else N.pos[j] = -1;                                           // khác cực: hút
        }
        break;
      }
    }
  }
  return N;
}

export function laThang(ctx, S) {
  if (ctx.co >= 0) return S.y * ctx.rong + S.x === ctx.co;
  if (ctx.laBongMo) return daBongMo(ctx, S);
  let coCan = false;
  for (let i = 0; i < S.pos.length; i++) {
    if (!ctx.can[i]) continue;
    coCan = true;
    const p = S.pos[i];
    if (p < 0 || !ctx.dich[p] || !(ctx.mauDich[p] === 0 || ctx.mauDich[p] === ctx.mauVat[i])) return false;
  }
  return coCan;
}

/** Bóng mờ: đúng bongMoDat của san-hoc.js. */
function daBongMo(ctx, S) {
  const bm = ctx.bm;
  if (S.x !== bm.x || S.y !== bm.y) return false;
  if (bm.huong !== null && bm.huong !== undefined && S.h !== bm.huong) return false;
  if (S.m !== (1 << ctx.diQua.length) - 1) return false;
  const dinh = S.pos.indexOf(-1);
  if (ctx.cam) {
    if (dinh < 0) return false;
    if (ctx.camMau && ctx.mauVat[dinh] !== ctx.camMau) return false;
  }
  if (ctx.dichVat.length || ctx.cam) {
    let dat = 0;
    for (const p of S.pos) if (p >= 0) dat++;
    if (dat + (ctx.cam ? 1 : 0) !== S.pos.length || dat !== ctx.dichVat.length) return false;
    for (const q of ctx.dichVat) {
      let ok = false;
      for (let i = 0; i < S.pos.length; i++) if (S.pos[i] === q.o && (!q.mau || ctx.mauVat[i] === q.mau)) { ok = true; break; }
      if (!ok) return false;
    }
  }
  return true;
}

function khoa(ctx, S) {
  const cell = S.y * ctx.rong + S.x;
  // vật cùng lớp (chất + cực + màu) xếp tăng dần
  const nhom = {};
  S.pos.forEach((p, i) => { (nhom[ctx.lop[i]] = nhom[ctx.lop[i]] || []).push(p + 1); });
  const base = ctx.rong * ctx.cao + 1;
  let k = ((((cell * 4 + S.h) * 3 + S.c) * 2 + S.d) * (1 << ctx.diQua.length)) + S.m;
  for (const lop of Object.keys(nhom).sort((a, b) => a - b)) for (const c of nhom[lop].sort((a, b) => a - b)) k = k * base + c;
  return k;
}

export function nhipNamChamNganNhat(man, tuyChon = {}) {
  const ctx = dungNguCanh(man);
  const toiDa = tuyChon.toiDaTrangThai || 3000000;
  const dau = trangThaiDau(ctx, tuyChon);
  if (laThang(ctx, dau)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const HD = hanhDongTuDo(ctx, tuyChon);
  const thay = new Map();
  const cha = [-1], act = [null];
  const kho = [dau];
  thay.set(khoa(ctx, dau), 0);
  let i = 0, nhip = 0;
  while (i < kho.length) {
    nhip++;
    const cuoiLop = kho.length;
    for (; i < cuoiLop; i++) {
      const S = kho[i];
      for (const a of HD) {
        const N = buocMotNhip(ctx, S, a);
        const k = khoa(ctx, N);
        if (thay.has(k)) continue;
        thay.set(k, kho.length);
        cha.push(i); act.push(a); kho.push(N);
        if (laThang(ctx, N)) {
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

/** Tổng nhịp ngắn nhất trên mọi sân của màn (nhiều sân: man.san là mảng sân; mau / vatMau / vatChat / vatThem / bongMo / batDau song song). */
export function nhipNamChamTatCa(man, tuyChon = {}) {
  const nhieu = Array.isArray(man.san[0]);
  const dsSan = nhieu ? man.san : [man.san];
  let tong = 0;
  dsSan.forEach((rows, i) => {
    const lm = SanHoc.lopMauCuaSan(man, i);
    const con = Object.assign({}, man, { san: rows, batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau, mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vatThem: lm.vatThem, bongMo: lm.bongMo || man.bongMo });
    const k = nhipNamChamNganNhat(con, tuyChon).nhip;
    tong = tong === null || k === null ? null : tong + k;
  });
  return tong;
}

/** Chuỗi hành động → mã Python (mỗi hành động một nhóm lệnh + wait()). tuyChon.phanCung: chọn tổ hợp bánh phần cứng có sẵn; tuyChon.daoChieu có 'cuc': lệnh ghi ngược để ra cực THẬT. */
export function chuoiThanhMa(chuoi, tuyChon = {}) {
  const pc = tuyChon.phanCung || null, dao = (tuyChon.daoChieu || []).includes('cuc');
  const co = (ten) => !pc || pc.includes(ten);
  const goc = { n: dao ? 'magnet_s' : 'magnet_n', s: dao ? 'magnet_n' : 'magnet_s', off: 'magnet_off' };
  const dong = [];
  for (const a of chuoi) {
    if (a.nc) { if (!co(goc[a.nc])) throw new Error('Phần cứng không có ' + goc[a.nc]); dong.push(goc[a.nc] + '()'); }
    if (a.banh === SLIDE_TRAI) dong.push('slide_left()');
    else if (a.banh === SLIDE_PHAI) dong.push('slide_right()');
    else {
      const chon = [a.banh].concat(HIEU_QUA_TUONG_DUONG[a.banh] || []).map((i) => TO_HOP[i]).find(([t, p]) => (t === 0 || co(t > 0 ? 'left_move' : 'left_back')) && (p === 0 || co(p > 0 ? 'right_move' : 'right_back')));
      if (!chon) throw new Error('Phần cứng không làm được tổ hợp bánh ' + a.banh);
      const [t, p] = chon;
      if (t === 1) dong.push('left_move()'); else if (t === -1) dong.push('left_back()');
      if (p === 1) dong.push('right_move()'); else if (p === -1) dong.push('right_back()');
    }
    dong.push('wait()');
  }
  return dong.join('\n') + '\n';
}
// các tổ hợp bánh cho cùng một hiệu quả (xe quay phải = (1,0) hay (0,-1); quay trái = (0,1) hay (-1,0); quay đầu = (1,-1) hay (-1,1))
const HIEU_QUA_TUONG_DUONG = {
  [PHAI]: [TO_HOP.findIndex((x) => x[0] === 0 && x[1] === -1)],
  [TRAI]: [TO_HOP.findIndex((x) => x[0] === -1 && x[1] === 0)],
  [QUAY_DAU]: [TO_HOP.findIndex((x) => x[0] === -1 && x[1] === 1)]
};

export { TO_HOP, SLIDE_TRAI, SLIDE_PHAI, DUNG, TIEN, PHAI, TRAI, LUI, QUAY_DAU, HIEU_QUA };

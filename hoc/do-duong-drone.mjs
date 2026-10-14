/* ============================================================================
   do-duong-drone.mjs — BỘ DÒ ĐƯỜNG TẮT cho màn của DRONE (chương `drone`; loaiRobot 'drone').
   Dùng trong máy kiểm (kiem-hoc.mjs, kiem-drone.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô drone, pin còn lại, nam châm bật hay tắt, vị trí từng vật).
   Vị trí vật: ô trên sân, hoặc -1 = đang dính nam châm. Vật giống hệt nhau (cùng chất, cùng màu) được xếp tăng dần để gộp trạng thái.
   Luật y hệt san-hoc.js (phần DRONE). Một HÀNH ĐỘNG = lệnh nam châm (không | bật | tắt) × lệnh bay (đứng yên | lên | phải | xuống | trái).
   Thứ tự trong nhịp: (a) lệnh nam châm (tắt = thả xuống ô DƯỚI drone nếu ô đó nhận được) → (b) bay (tường cao / mép sân chặn; hàng rào, băng, vật, thùng, bậc thang thì bay qua)
   → (c) HÚT vật sắt ở ô dưới drone → (d) tốn 1 pin; đứng trên ô sạc P thì pin đầy → (e) thắng? → (f) pin về 0 mà chưa thắng thì rơi (bỏ trạng thái đó).
   Băng chuyền KHÔNG đẩy drone. Cửa C / c chưa hỗ trợ (chương này không dùng): dựng ngữ cảnh sẽ báo lỗi.
   tuyChon.tachNhip = true: lệnh nam châm phải đứng MỘT MÌNH trong nhịp (bay đứng yên), đúng cách viết "magnet_on()  wait()" của lời giải chuẩn. Không có tuyChon này,
   lệnh nam châm gộp được vào nhịp bay ("magnet_on(); go_right()" là MỘT nhịp): đường ngắn hơn, là bài tối ưu riêng.
   Mục tiêu 'toi-co' (cờ F) hoặc 'dua-vat' (mọi vật cần nằm trên ô đích, đúng màu; man.vatCan === 'sat' thì chỉ vật sắt).
   BFS CÓ GIỚI HẠN: tuyChon.toiDaTrangThai (mặc định 400000) và tuyChon.toiDaMs (mặc định 8000); vượt thì trả { nhip: null, catNgang: true }.

   Hàm xuất:
     nhipDroneNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }   (man: MỘT sân)
     nhipDroneTatCa(man, tuyChon)    → TỔNG nhịp ngắn nhất trên mọi sân (null nếu có sân không giải được hay bị cắt ngang)
     dungNguCanh, trangThaiDau, buocMotNhip, laThang, hanhDongTuDo, chuoiThanhMa — để so chéo với SanHoc
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

const TEN_LENH = ['go_up', 'go_right', 'go_down', 'go_left'];   // hướng 0..3

/** Dựng ngữ cảnh từ một màn MỘT sân (san, batDau, mau, vatMau, vatChat, vatThem, vatCan, mucTieu, pin). */
export function dungNguCanh(man) {
  if ((man.loaiRobot || 'drone') !== 'drone') throw new Error('Bộ dò drone chỉ biết drone.');
  const san = SanHoc.docSan(man.san, man.mau, man.vatMau, man.vatChat);
  if (san.cua.length || san.nut.length) throw new Error('Bộ dò drone chưa hỗ trợ cửa và nút.');
  const rong = san.rong, cao = san.cao;
  const o = (x, y) => y * rong + x;
  const chan = new Uint8Array(rong * cao);               // drone không vào được (tường cao)
  const khongTha = new Uint8Array(rong * cao);           // ô không nhận vật thả xuống (hàng rào, bậc thang, thùng)
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) {
    chan[o(x, y)] = SanHoc.lyDoChan(san, 'drone', x, y) ? 1 : 0;
    const c = san.o[y][x];
    khongTha[o(x, y)] = c === '=' || c === 'S' || c === '#' ? 1 : 0;
  }
  for (const t of san.thung) khongTha[o(t.x, t.y)] = 1;
  const dich = new Uint8Array(rong * cao);
  for (const d of san.dich) dich[o(d.x, d.y)] = 1;
  const sac = new Uint8Array(rong * cao);
  for (const s of san.sac) sac[o(s.x, s.y)] = 1;
  const ma = (m) => (m ? SanHoc.MAU_TEN.indexOf(m) + 1 : 0);
  const mauDich = new Uint8Array(rong * cao);
  for (const d of san.dich) mauDich[o(d.x, d.y)] = ma(d.mau);
  const dsVat = san.vat.slice();
  for (const e of man.vatThem || []) if (!dsVat.some((v) => v.x === e.x && v.y === e.y)) dsVat.push(e);
  const mauVat = dsVat.map((v) => ma(v.mau));
  const sat = dsVat.map((v) => (v.chat === 'sat' ? 1 : 0));
  const can = dsVat.map((v, i) => (man.vatCan === 'sat' ? sat[i] === 1 : true));
  const pinToiDa = man.pin === undefined || man.pin === null ? -1 : man.pin;
  return { san, rong, cao, o, chan, khongTha, dich, sac, mauDich, mauVat, sat, can, pinToiDa, mucTieu: man.mucTieu || 'toi-co',
    co: san.co ? o(san.co.x, san.co.y) : -1, vat0: dsVat.map((v) => o(v.x, v.y)), bd: man.batDau, lop: dsVat.map((v, i) => sat[i] * 8 + mauVat[i]) };
}

export function trangThaiDau(ctx) {
  return { x: ctx.bd.x, y: ctx.bd.y, pin: ctx.pinToiDa, bat: 0, pos: ctx.vat0.slice() };
}

/** Các hành động: lệnh nam châm × lệnh bay (-1 = đứng yên, 0..3 = hướng). Chỉ có nam châm khi màn có vật. */
export function hanhDongTuDo(ctx, tuyChon = {}) {
  const ds = [];
  const ncs = ctx.vat0.length ? [null, 'on', 'off'] : [null];
  for (const nc of ncs) for (let b = -1; b <= 3; b++) {
    if (tuyChon.tachNhip && nc !== null && b !== -1) continue;
    ds.push({ nc, bay: b });
  }
  return ds;
}

function trong(ctx, x, y) { return x >= 0 && y >= 0 && x < ctx.rong && y < ctx.cao; }

/** Một nhịp. Trả về trạng thái mới (bản sao); rơi = true nếu hết pin mà chưa thắng. */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, pin: S.pin, bat: S.bat, pos: S.pos.slice(), rơi: false };
  const { rong } = ctx;
  if (a.nc === 'on') N.bat = 1;
  else if (a.nc === 'off') {
    const i = N.pos.indexOf(-1);
    if (i < 0) N.bat = 0;
    else {
      const c = N.y * rong + N.x;
      if (!ctx.khongTha[c] && N.pos.indexOf(c) < 0) { N.pos[i] = c; N.bat = 0; }
    }
  }
  if (a.bay >= 0) {
    const v = SanHoc.VEC[a.bay], nx = N.x + v[0], ny = N.y + v[1];
    if (trong(ctx, nx, ny) && !ctx.chan[ny * rong + nx]) { N.x = nx; N.y = ny; }
  }
  if (N.bat && N.pos.indexOf(-1) < 0) {                       // hút: vật ở ô NGAY DƯỚI drone, chỉ vật sắt
    const i = N.pos.indexOf(N.y * rong + N.x);
    if (i >= 0 && ctx.sat[i]) N.pos[i] = -1;
  }
  if (N.pin >= 0) {
    N.pin--;
    if (ctx.sac[N.y * rong + N.x]) N.pin = ctx.pinToiDa;
  }
  if (!laThang(ctx, N) && N.pin === 0) N.rơi = true;
  return N;
}

export function laThang(ctx, S) {
  if (ctx.mucTieu === 'toi-co') return S.y * ctx.rong + S.x === ctx.co;
  let coCan = false;
  for (let i = 0; i < S.pos.length; i++) {
    if (!ctx.can[i]) continue;
    coCan = true;
    const p = S.pos[i];
    if (p < 0 || !ctx.dich[p] || !(ctx.mauDich[p] === 0 || ctx.mauDich[p] === ctx.mauVat[i])) return false;
  }
  return coCan;
}

function khoa(ctx, S) {
  const nhom = {};
  S.pos.forEach((p, i) => { (nhom[ctx.lop[i]] = nhom[ctx.lop[i]] || []).push(p + 1); });
  let k = S.x + ',' + S.y + ',' + S.pin + ',' + S.bat;
  for (const lop of Object.keys(nhom).sort((a, b) => a - b)) k += '|' + nhom[lop].sort((a, b) => a - b).join(',');
  return k;
}

export function nhipDroneNganNhat(man, tuyChon = {}) {
  const ctx = dungNguCanh(man);
  const toiDa = tuyChon.toiDaTrangThai === undefined ? 400000 : tuyChon.toiDaTrangThai;
  const toiDaMs = tuyChon.toiDaMs === undefined ? 8000 : tuyChon.toiDaMs;
  const t0 = Date.now();
  const dau = trangThaiDau(ctx);
  if (laThang(ctx, dau)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const HD = hanhDongTuDo(ctx, tuyChon);
  const thay = new Set();
  const cha = [-1], act = [null];
  const kho = [dau];
  thay.add(khoa(ctx, dau));
  let i = 0, nhip = 0;
  while (i < kho.length) {
    nhip++;
    const cuoiLop = kho.length;
    for (; i < cuoiLop; i++) {
      if ((i & 255) === 0 && Date.now() - t0 >= toiDaMs) return { nhip: null, soTrangThai: kho.length, catNgang: true, chuoi: null };
      const S = kho[i];
      for (const a of HD) {
        const N = buocMotNhip(ctx, S, a);
        if (N.rơi) continue;
        const k = khoa(ctx, N);
        if (thay.has(k)) continue;
        thay.add(k);
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

/** TỔNG nhịp ngắn nhất trên mọi sân của màn (nhiều sân: man.san là mảng sân; batDau / pin / mau / vatMau / vatChat / vatThem song song nếu là mảng). */
export function nhipDroneTatCa(man, tuyChon = {}) {
  const nhieu = Array.isArray(man.san[0]);
  const dsSan = nhieu ? man.san : [man.san];
  let tong = 0;
  dsSan.forEach((rows, i) => {
    const lm = SanHoc.lopMauCuaSan(man, i);
    const con = Object.assign({}, man, { san: rows, batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau, mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vatThem: lm.vatThem,
      pin: Array.isArray(man.pin) ? man.pin[i] : man.pin });
    const k = nhipDroneNganNhat(con, tuyChon).nhip;
    tong = tong === null || k === null ? null : tong + k;
  });
  return tong;
}

/** Chuỗi hành động → mã Python (mỗi hành động: lệnh nam châm rồi lệnh bay, hoặc wait() nếu đứng yên). */
export function chuoiThanhMa(chuoi) {
  const dong = [];
  for (const a of chuoi) {
    if (a.nc === 'on') dong.push('magnet_on()'); else if (a.nc === 'off') dong.push('magnet_off()');
    dong.push(a.bay >= 0 ? TEN_LENH[a.bay] + '()' : 'wait()');
  }
  return dong.join('\n') + '\n';
}

export { TEN_LENH };

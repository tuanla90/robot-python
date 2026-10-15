/* ============================================================================
   do-duong-nhen.mjs — BỘ DÒ ĐƯỜNG TẮT cho màn của NHỆN (loaiRobot 'nhen'): chương `nhen` và `che-nhen`.
   Dùng trong máy kiểm (kiem-hoc.mjs, kiem-nhen.mjs, kiem-che-nhen.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô nhện, bước đang dở + cờ NHẢY, tư thế chân, tư thế tay, đang cầm hay không, bộ đếm băng chuyền,
   vị trí các vật nằm dưới đất, tập ô ◆ đã qua). Luật y hệt san-hoc.js (phần CHÂN NHỆN và phần NHỆN):
     - go_* = 2 nhịp: nhịp 1 "chuẩn bị" (chưa rời ô; lệnh tay và lệnh CHÂN đang chờ làm ở nhịp này), nhịp 2 sang ô mới
       (bị bỏ nếu tay đang 'duoi', hay bị tường / gầm chặn). Bước đang dở (p) thì nhịp kế BẮT BUỘC là nhịp 2.
     - wait() = 1 nhịp đứng yên (lệnh tay và lệnh chân đang chờ làm ở nhịp này).
     - CHÂN: 'dung' | 'co'. Ô gầm n chỉ vào được khi đang co; đang đứng trong gầm mà duỗi chân thì đầu đụng trần (chân vẫn co).
       Duỗi chân (stand) từ lúc đang co, cùng nhịp đầu của bước go_*, thì nhịp 2 của bước là cú NHẢY: sang ô cách 2 ô, bay qua ô giữa
       (sàn, hố, hàng rào thấp bay qua được; tường, nút, gầm, mép sân chắn); ô đáp phải đứng được (không tường, rào, gầm, vật, mép sân) — không thì nhảy hụt, đứng yên.
     - Ô hố u: đứng ở đó cuối nhịp (đi vào, bị băng đẩy, nhảy xuống) là RƠI = thua (trạng thái chết, bị bỏ).
     - Băng chuyền: sau hành động của MỖI nhịp, đứng trên băng thì đếm +1; đủ 2 thì đẩy 1 ô theo mũi tên (chặn bởi tường, vật, gầm khi đang đứng).
   Lệnh dùng được = PHẦN CỨNG của màn (man.phanCung; không khai thì khay man.hamGoc; không có nữa thì trọn bộ nhện), vì hàm của em gọi được mọi lệnh phần cứng.
   daoChieu ['chan']: crouch() làm chân duỗi, stand() làm chân co (bộ dò tính theo tư thế THẬT; chuoiThanhMa đổi lại thành tên lệnh).
   Một HÀNH ĐỘNG tự do (bước đang rảnh) = tư thế tay (không | hạ | nâng) × kẹp/thả (không | kẹp | thả) × chân (không | co | duỗi) × bước (chờ | lên | phải | xuống | trái).
   LUẬT VẬT (14/10): vật nằm đất chiếm ô (nhện không bước vào, băng không đẩy vào, không đáp lên được); grab / release làm ở Ô TRƯỚC MẶT = cạnh gắn tay,
   CỐ ĐỊNH theo man.batDau.huong (mặc định 0 = lên) vì nhện không quay. release chỉ đặt được xuống ô sàn trống (không gầm, hố, hàng rào); tay 'tren' thả thì vật vỡ.
   Mục tiêu 'toi-co': thắng khi nhện chạm cờ F (cuối bất kỳ nhịp nào). 'dua-vat': mọi vật nằm trên ô đích. 'bong-mo': đứng đúng ô bóng mờ (và đúng chân nếu bongMo.chan)
   sau khi đã qua mọi ô ◆, vật mờ đúng chỗ, lúc không còn bước dở.

   Hàm xuất:
     nhipNhenNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }
        tuyChon.batDau : trạng thái xuất phát khác { x, y, chan, pos?, daQua? } (vd sau một đoạn chương trình cố định)
        tuyChon.toiDaTrangThai, tuyChon.ctx
     chuoiThanhMa(chuoi, ctx?)      → mã Python (mỗi hành động tự do một nhóm lệnh)
     dungNguCanh(man, tuyChon), trangThaiDau(ctx), hanhDongTuDo(ctx), buocMotNhip(ctx, S, a) → trạng thái mới | null (rơi hố), laThang(ctx, S)   (để so chéo với SanHoc)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

const CHAN = [null, 'up', 'right', 'down', 'left'];       // chỉ để đọc: chỉ số 0 = đứng chờ, 1.. = hướng 0..3
const TEN_LENH = ['go_up', 'go_right', 'go_down', 'go_left'];   // hướng 0..3

/** Dựng ngữ cảnh từ một màn. */
export function dungNguCanh(man, tuyChon = {}) {
  const san = SanHoc.docSan(man.san);
  if (san.nut.length || san.cua.length || san.thung.length) throw new Error('Bộ dò nhện không hỗ trợ nút, cửa, thùng nặng.');
  const rong = san.rong, cao = san.cao;
  const o = (x, y) => y * rong + x;
  const ds = man.phanCung || man.hamGoc || SanHoc.HAM_GOC.nhen;
  const tuong = new Uint8Array(rong * cao), rao = new Uint8Array(rong * cao), gam = new Uint8Array(rong * cao), ho = new Uint8Array(rong * cao);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) {
    const c = san.o[y][x], ly = SanHoc.lyDoChan(san, 'nhen', x, y);
    if (c === '=') rao[o(x, y)] = 1;                       // đi không qua được, nhảy qua được, đáp lên không được
    else if (ly) tuong[o(x, y)] = 1;                       // tường, nút, (bậc thang không chặn nhện)
    if (c === 'n') gam[o(x, y)] = 1;
    if (c === 'u') ho[o(x, y)] = 1;
  }
  const dich = new Uint8Array(rong * cao);
  for (const d of san.dich) dich[o(d.x, d.y)] = 1;
  const bang = new Int8Array(rong * cao).fill(-1);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) { const h = SanHoc.BANG[san.o[y][x]]; if (h !== undefined) bang[o(x, y)] = h; }
  const co = san.co ? o(san.co.x, san.co.y) : -1;
  const dao = !!(man.daoChieu && man.daoChieu.includes('chan'));
  const coTay = ds.some((t) => SanHoc.TAY_LENH.indexOf(t) >= 0);
  const mucTieu = man.mucTieu || 'toi-co';
  const bm = mucTieu === 'bong-mo' ? man.bongMo : null;
  const diQua = bm ? (bm.diQua || []).map((q) => o(q.x, q.y)) : [];
  return {
    san, rong, cao, o, tuong, rao, gam, ho, dich, bang, co, coTay, mucTieu, bm, diQua, dao,
    cho: { dir: [0, 1, 2, 3].map((h) => ds.includes(TEN_LENH[h])), co: dao ? ds.includes('stand') : ds.includes('crouch'), dung: dao ? ds.includes('crouch') : ds.includes('stand'),
      tuThe: ds.includes('arm_down') || ds.includes('arm_up'), kep: ds.includes('grab') || ds.includes('release') },
    vat0: san.vat.map((v) => o(v.x, v.y)), bd: man.batDau, huong: (man.batDau && man.batDau.huong) || 0
  };
}

export function trangThaiDau(ctx, tuyChon = {}) {
  const b = tuyChon.batDau || {};
  const x = b.x !== undefined ? b.x : ctx.bd.x, y = b.y !== undefined ? b.y : ctx.bd.y;
  const ch = (b.chan !== undefined ? b.chan : (ctx.bd && ctx.bd.chan)) === 'co' ? 1 : 0;
  let dq = 0;
  (b.daQua || []).forEach((q) => { const i = ctx.diQua.indexOf(ctx.o(q.x, q.y)); if (i >= 0) dq |= 1 << i; });
  return { x, y, p: -1, nh: 0, ch, t: 0, cam: -1, d: 0, pos: (b.pos || ctx.vat0).slice(), dq };      // ô ◆ chỉ tính khi cuối một nhịp nhện đứng ở đó (như lõi)
}

/** Các hành động TỰ DO (khi không có bước dở). chan: 0 không đổi, 1 co, 2 duỗi; move: -1 chờ, 0..3 hướng. */
export function hanhDongTuDo(ctx) {
  const ds = [];
  const tuThes = ctx.coTay && ctx.cho.tuThe ? [null, 'duoi', 'tren'] : [null];
  const keps = ctx.coTay && ctx.cho.kep ? [null, 'kep', 'tha'] : [null];
  const chans = [0];
  if (ctx.cho.co) chans.push(1);
  if (ctx.cho.dung) chans.push(2);
  const moves = [-1];
  for (let h = 0; h < 4; h++) if (ctx.cho.dir[h]) moves.push(h);
  for (const tuThe of tuThes) for (const kep of keps) for (const chan of chans) for (const move of moves) ds.push({ tuThe, kep, chan, move });
  return ds;
}

function ngoai(ctx, x, y) { return x < 0 || y < 0 || x >= ctx.rong || y >= ctx.cao; }
function coVat(S, ctx, x, y) { return S.pos.indexOf(y * ctx.rong + x) >= 0; }

/** Một nhịp. a = hành động tự do nếu S.p < 0; nếu S.p >= 0 thì a bị bỏ qua (nhịp 2 bắt buộc). Trả về null nếu nhện rơi xuống hố. */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, p: S.p, nh: S.nh, ch: S.ch, t: S.t, cam: S.cam, d: S.d, pos: S.pos.slice(), dq: S.dq };
  const { rong } = ctx;
  if (S.p < 0) {
    if (a.tuThe === 'duoi') N.t = 1; else if (a.tuThe === 'tren') N.t = 0;
    const vf = SanHoc.VEC[ctx.huong], fx = N.x + vf[0], fy = N.y + vf[1];
    const front = (fx >= 0 && fy >= 0 && fx < ctx.rong && fy < ctx.cao) ? fy * rong + fx : -1;     // ô trước mặt (cạnh gắn tay, cố định)
    if (a.kep === 'kep') {
      if (N.cam < 0) {
        const i = front >= 0 ? N.pos.indexOf(front) : -1;
        if (i >= 0 && N.t === 1) { N.pos[i] = -1; N.cam = i; }
      }
    } else if (a.kep === 'tha') {
      if (N.cam >= 0) {
        if (N.t === 0) { N.pos[N.cam] = -2; N.cam = -1; }
        else if (front >= 0 && !ctx.tuong[front] && !ctx.rao[front] && !ctx.gam[front] && !ctx.ho[front] && N.pos.indexOf(front) < 0) { N.pos[N.cam] = front; N.cam = -1; }
      }
    }
    let nhay = false;
    if (a.chan) {
      const muon = a.chan === 1 ? 1 : 0;
      if (muon !== N.ch) {
        if (muon === 0 && ctx.gam[N.y * rong + N.x]) { /* đầu đụng trần: chân vẫn co */ }
        else { nhay = N.ch === 1 && muon === 0; N.ch = muon; }
      }
    }
    if (a.move >= 0) { N.p = a.move; N.nh = nhay ? 1 : 0; }
  } else {
    if (N.t === 0) {
      const v = SanHoc.VEC[S.p];
      if (S.nh) {                                                           // cú NHẢY: ô giữa bay qua được, ô đáp phải đứng được
        const mx = N.x + v[0], my = N.y + v[1], dx = N.x + 2 * v[0], dy = N.y + 2 * v[1];
        const giuaChan = ngoai(ctx, mx, my) || ctx.tuong[my * rong + mx] || ctx.gam[my * rong + mx];
        const dapChan = ngoai(ctx, dx, dy) || ctx.tuong[dy * rong + dx] || ctx.rao[dy * rong + dx] || ctx.gam[dy * rong + dx] || coVat(N, ctx, dx, dy);
        if (!giuaChan && !dapChan) { N.x = dx; N.y = dy; }
      } else {
        const nx = N.x + v[0], ny = N.y + v[1];
        const chan = ngoai(ctx, nx, ny) || ctx.tuong[ny * rong + nx] || ctx.rao[ny * rong + nx] || coVat(N, ctx, nx, ny) || (ctx.gam[ny * rong + nx] && N.ch === 0);
        if (!chan) { N.x = nx; N.y = ny; }
      }
    }
    N.p = -1; N.nh = 0;
  }
  const hb = ctx.bang[N.y * rong + N.x];
  if (hb >= 0) {
    N.d++;
    if (N.d >= 2) {
      const v = SanHoc.VEC[hb], nx = N.x + v[0], ny = N.y + v[1];
      const chan = ngoai(ctx, nx, ny) || ctx.tuong[ny * rong + nx] || ctx.rao[ny * rong + nx] || coVat(N, ctx, nx, ny) || (ctx.gam[ny * rong + nx] && N.ch === 0);
      if (!chan) { N.x = nx; N.y = ny; }
      N.d = 0;
    }
  } else N.d = 0;
  if (ctx.ho[N.y * rong + N.x]) return null;                                // rơi hố
  const k = ctx.diQua.indexOf(N.y * rong + N.x);
  if (k >= 0) N.dq |= 1 << k;
  return N;
}

export function laThang(ctx, S) {
  if (ctx.mucTieu === 'toi-co') return S.y * ctx.rong + S.x === ctx.co;
  if (ctx.mucTieu === 'bong-mo') {
    const b = ctx.bm;
    if (S.p >= 0 || S.x !== b.x || S.y !== b.y) return false;
    if (b.chan && (S.ch ? 'co' : 'dung') !== b.chan) return false;
    if (S.dq !== (1 << ctx.diQua.length) - 1) return false;
    const dat = S.pos.filter((p) => p >= 0);
    const can = (b.vat || []).map((q) => q.y * ctx.rong + q.x);
    if ((b.vat && b.vat.length) || b.cam) {
      if (b.cam && S.cam < 0) return false;
      if (S.pos.some((p) => p === -2)) return false;
      if (dat.length !== can.length || !can.every((c) => dat.includes(c))) return false;
    } else if (!b.cam && S.cam >= 0 && b.vat) { /* không khai vật mờ: không xét vật */ }
    return true;
  }
  if (!S.pos.length) return false;
  return S.pos.every((p) => p >= 0 && ctx.dich[p]);
}

function khoa(ctx, S) {
  const cell = S.y * ctx.rong + S.x;
  const chuSo = S.pos.map((p) => p + 2).sort((a, b) => a - b);
  let k = ((((((cell * 5 + (S.p + 1)) * 2 + S.nh) * 2 + S.ch) * 2 + S.t) * 2 + (S.cam >= 0 ? 1 : 0)) * 2) + S.d;
  k = k * 256 + S.dq;
  for (const c of chuSo) k = k * (ctx.rong * ctx.cao + 3) + c;
  return k;
}

export function nhipNhenNganNhat(man, tuyChon = {}) {
  const ctx = tuyChon.ctx || dungNguCanh(man, tuyChon);
  const toiDa = tuyChon.toiDaTrangThai || 3000000;
  const dau = trangThaiDau(ctx, tuyChon);
  if (laThang(ctx, dau)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const HD = hanhDongTuDo(ctx);
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
      const dsA = S.p >= 0 ? [null] : HD;
      for (const a of dsA) {
        const N = buocMotNhip(ctx, S, a);
        if (!N) continue;
        if (N.pos.some((p) => p === -2) && ctx.mucTieu === 'dua-vat') continue;
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

/** Chuỗi hành động (có chỗ null = nhịp 2 bắt buộc) → mã Python: mỗi hành động tự do thành lệnh chân + lệnh tay + go_* / wait(). dao: chân lắp ngược (đổi tên lệnh chân). */
export function chuoiThanhMa(chuoi, ctx) {
  const dao = !!(ctx && ctx.dao);
  const dong = [];
  for (const a of chuoi) {
    if (a === null) continue;                       // nhịp 2 của bước: go_* đã gồm
    if (a.chan === 1) dong.push(dao ? 'stand()' : 'crouch()'); else if (a.chan === 2) dong.push(dao ? 'crouch()' : 'stand()');
    if (a.tuThe === 'duoi') dong.push('arm_down()'); else if (a.tuThe === 'tren') dong.push('arm_up()');
    if (a.kep === 'kep') dong.push('grab()'); else if (a.kep === 'tha') dong.push('release()');
    dong.push(a.move >= 0 ? TEN_LENH[a.move] + '()' : 'wait()');
  }
  return dong.join('\n') + '\n';
}

export { CHAN, TEN_LENH };

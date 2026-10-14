/* ============================================================================
   do-duong-nhen.mjs — BỘ DÒ ĐƯỜNG TẮT cho màn của NHỆN (loaiRobot 'nhen'): chương `nhen`.
   Dùng trong máy kiểm (kiem-hoc.mjs, kiem-nhen.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô nhện, bước đang dở, tư thế tay, đang cầm hay không,
   vị trí các vật nằm dưới đất, bộ đếm băng chuyền). Luật y hệt san-hoc.js:
     - go_* = 2 nhịp: nhịp 1 "chuẩn bị" (chưa rời ô; lệnh tay đang chờ làm ở nhịp này), nhịp 2 sang ô mới
       (bị bỏ nếu tay đang 'duoi', hoặc bị tường chặn). Bước đang dở (p) thì nhịp kế BẮT BUỘC là nhịp 2.
     - wait() = 1 nhịp đứng yên (lệnh tay đang chờ làm ở nhịp này).
     - Băng chuyền: sau hành động của MỖI nhịp, đứng trên băng thì đếm +1; đủ 2 thì đẩy 1 ô theo mũi tên.
   Một HÀNH ĐỘNG tự do (bước đang rảnh) = tư thế tay (không | hạ | nâng) × kẹp/thả (không | kẹp | thả) × chân
   (đứng chờ | lên | xuống | trái | phải). Màn không có lệnh tay thì chỉ còn 5 chân.
   LUẬT VẬT (14/10): vật nằm đất chiếm ô (nhện không bước vào, băng không đẩy vào); grab / release làm ở Ô TRƯỚC MẶT = cạnh gắn tay, CỐ ĐỊNH theo
   man.batDau.huong (mặc định 0 = lên) vì nhện không quay. release chỉ đặt được xuống ô sàn trống; tay 'tren' thả thì vật vỡ.
   Mục tiêu 'toi-co': thắng khi nhện chạm cờ F (cuối bất kỳ nhịp nào). 'dua-vat': mọi vật nằm trên ô đích.

   Hàm xuất:
     nhipNhenNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }
     chuoiThanhMa(chuoi)             → mã Python (mỗi hành động tự do một nhóm lệnh)
     buocMotNhip(ctx, S, a)          → trạng thái mới (để so chéo với SanHoc)
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
export function dungNguCanh(man) {
  const san = SanHoc.docSan(man.san);
  const rong = san.rong, cao = san.cao;
  const o = (x, y) => y * rong + x;
  const chan = new Uint8Array(rong * cao);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) chan[o(x, y)] = SanHoc.lyDoChan(san, 'nhen', x, y) ? 1 : 0;
  const dich = new Uint8Array(rong * cao);
  for (const d of san.dich) dich[o(d.x, d.y)] = 1;
  const bang = new Int8Array(rong * cao).fill(-1);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) { const h = SanHoc.BANG[san.o[y][x]]; if (h !== undefined) bang[o(x, y)] = h; }
  const co = san.co ? o(san.co.x, san.co.y) : -1;
  const coTay = (man.hamGoc || SanHoc.HAM_GOC.nhen).some((t) => SanHoc.TAY_LENH.indexOf(t) >= 0);
  return { san, rong, cao, o, chan, dich, bang, co, coTay, mucTieu: man.mucTieu || 'toi-co', vat0: san.vat.map((v) => o(v.x, v.y)), bd: man.batDau, huong: (man.batDau && man.batDau.huong) || 0 };
}

export function trangThaiDau(ctx) {
  return { x: ctx.bd.x, y: ctx.bd.y, p: -1, t: 0, cam: -1, d: 0, pos: ctx.vat0.slice() };
}

/** Các hành động TỰ DO (khi không có bước dở). */
export function hanhDongTuDo(ctx) {
  const ds = [];
  const tuThes = ctx.coTay ? [null, 'duoi', 'tren'] : [null];
  const keps = ctx.coTay ? [null, 'kep', 'tha'] : [null];
  for (const tuThe of tuThes) for (const kep of keps) for (let ch = 0; ch <= 4; ch++) ds.push({ tuThe, kep, chan: ch - 1 });   // chan -1 = chờ, 0..3 = hướng
  return ds;
}

function ngoai(ctx, x, y) { return x < 0 || y < 0 || x >= ctx.rong || y >= ctx.cao || ctx.chan[y * ctx.rong + x]; }
/** Ô (x, y) có vật nằm đất (chiếm ô) không. */
function coVat(ctx, S, x, y) { return S.pos.indexOf(y * ctx.rong + x) >= 0; }

/** Một nhịp. a = hành động tự do {tuThe, kep, chan} nếu S.p < 0; nếu S.p >= 0 thì a bị bỏ qua (nhịp 2 bắt buộc). */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, p: S.p, t: S.t, cam: S.cam, d: S.d, pos: S.pos.slice() };
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
        else if (front >= 0 && !ctx.chan[front] && N.pos.indexOf(front) < 0) { N.pos[N.cam] = front; N.cam = -1; }
      }
    }
    if (a.chan >= 0) N.p = a.chan;          // nhịp 1 của bước: chuẩn bị
  } else {
    if (N.t === 0) {
      const v = SanHoc.VEC[S.p], nx = N.x + v[0], ny = N.y + v[1];
      if (!ngoai(ctx, nx, ny) && !coVat(ctx, N, nx, ny)) { N.x = nx; N.y = ny; }
    }
    N.p = -1;
  }
  const hb = ctx.bang[N.y * rong + N.x];
  if (hb >= 0) {
    N.d++;
    if (N.d >= 2) {
      const v = SanHoc.VEC[hb], nx = N.x + v[0], ny = N.y + v[1];
      if (!ngoai(ctx, nx, ny) && !coVat(ctx, N, nx, ny)) { N.x = nx; N.y = ny; }
      N.d = 0;
    }
  } else N.d = 0;
  if (N.cam >= 0) { /* vật đang cầm đi theo nhện: vị trí do pos[cam] = -1 quản lý */ }
  return N;
}

export function laThang(ctx, S) {
  if (ctx.mucTieu === 'toi-co') return S.y * ctx.rong + S.x === ctx.co;
  if (!S.pos.length) return false;
  return S.pos.every((p) => p >= 0 && ctx.dich[p]);
}

function khoa(ctx, S) {
  const cell = S.y * ctx.rong + S.x;
  const chuSo = S.pos.map((p) => p + 1).sort((a, b) => a - b);
  let k = ((((cell * 5 + (S.p + 1)) * 2 + S.t) * 2 + (S.cam >= 0 ? 1 : 0)) * 2) + S.d;
  for (const c of chuSo) k = k * (ctx.rong * ctx.cao + 1) + c;
  return k;
}

export function nhipNhenNganNhat(man, tuyChon = {}) {
  const ctx = dungNguCanh(man);
  const toiDa = tuyChon.toiDaTrangThai || 3000000;
  const dau = trangThaiDau(ctx);
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
        if (N.pos.some((p) => p === -2)) continue;
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

/** Chuỗi hành động (có chỗ null = nhịp 2 bắt buộc) → mã Python: mỗi hành động tự do thành lệnh tay + go_* / wait(). */
export function chuoiThanhMa(chuoi) {
  const dong = [];
  for (const a of chuoi) {
    if (a === null) continue;                       // nhịp 2 của bước: go_* đã gồm
    if (a.tuThe === 'duoi') dong.push('arm_down()'); else if (a.tuThe === 'tren') dong.push('arm_up()');
    if (a.kep === 'kep') dong.push('grab()'); else if (a.kep === 'tha') dong.push('release()');
    dong.push(a.chan >= 0 ? TEN_LENH[a.chan] + '()' : 'wait()');
  }
  return dong.join('\n') + '\n';
}

export { CHAN, TEN_LENH };

/* ============================================================================
   do-duong-xich.mjs — BỘ DÒ ĐƯỜNG TẮT cho màn của XE BÁNH XÍCH (loaiRobot 'xich'): chương `xich`.
   Dùng trong máy kiểm (kiem-hoc.mjs, kiem-xich.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô, hướng, phần quay dở, tư thế tay, đang cầm hay không, vị trí các vật nằm dưới đất).
   Luật y hệt san-hoc.js:
     - Mỗi nhịp chọn tổ hợp bánh (trái, phải) ∈ {-1,0,1}². (1,1) tiến, (-1,-1) lùi, (0,0) đứng yên.
       Sáu tổ hợp quay ((1,0) (0,-1) (1,-1) quay phải; (0,1) (-1,0) (-1,1) quay trái): lần đầu chỉ "nhích nửa vòng"
       (phần quay dở = tổ hợp đó); nhịp kế CÙNG tổ hợp thì quay đủ 90°; nhịp kế khác tổ hợp thì phần quay dở mất.
     - Tay hạ ('duoi') thì lệnh bánh của nhịp bị bỏ (tay vướng) và phần quay dở mất.
     - Băng chuyền KHÔNG đẩy được xích; bậc thang S đi như sàn.
   Một HÀNH ĐỘNG = tư thế tay (không | hạ | nâng) × kẹp/thả (không | kẹp | thả) × tổ hợp bánh (9). Màn không có lệnh tay
   thì chỉ còn 9 tổ hợp bánh.
   LUẬT VẬT (14/10): vật nằm đất chiếm ô (xe không tiến / lùi vào ô có vật); grab / release làm ở Ô TRƯỚC MẶT; release chỉ đặt được xuống ô sàn trống.
   Mục tiêu 'toi-co': thắng khi xích chạm cờ F. 'dua-vat': mọi vật nằm trên ô đích.

   Hàm xuất:
     nhipXichNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }
     chuoiThanhMa(chuoi)             → mã Python (mỗi hành động một nhóm lệnh + wait())
     buocMotNhip(ctx, S, a)          → trạng thái mới (để so chéo với SanHoc)
     soOCoNganNhat(man)              → số ô ngắn nhất (BFS thuần theo ô, bỏ hướng) tới cờ; để so với nhịp (màn "so tốc độ")
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

// các tổ hợp bánh (trái, phải); chỉ số cố định để mã hóa trạng thái
const TO_HOP = [];
for (let t = -1; t <= 1; t++) for (let p = -1; p <= 1; p++) TO_HOP.push([t, p]);
const CHIEU_QUAY = TO_HOP.map(([t, p]) => SanHoc.XICH_QUAY[t + ',' + p] || 0);   // 0 nếu không phải tổ hợp quay

/** Dựng ngữ cảnh từ một màn. */
export function dungNguCanh(man) {
  const san = SanHoc.docSan(man.san);
  const rong = san.rong, cao = san.cao;
  const o = (x, y) => y * rong + x;
  const chan = new Uint8Array(rong * cao);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) chan[o(x, y)] = SanHoc.lyDoChan(san, 'xich', x, y) ? 1 : 0;
  const dich = new Uint8Array(rong * cao);
  for (const d of san.dich) dich[o(d.x, d.y)] = 1;
  const co = san.co ? o(san.co.x, san.co.y) : -1;
  const coTay = (man.hamGoc || SanHoc.HAM_GOC.xich).some((t) => SanHoc.TAY_LENH.indexOf(t) >= 0);
  return { san, rong, cao, o, chan, dich, co, coTay, mucTieu: man.mucTieu || 'toi-co', vat0: san.vat.map((v) => o(v.x, v.y)), bd: man.batDau };
}

/** q: chỉ số tổ hợp của phần quay dở, -1 nếu không có. */
export function trangThaiDau(ctx) {
  return { x: ctx.bd.x, y: ctx.bd.y, h: ctx.bd.huong || 0, q: -1, t: 0, cam: -1, pos: ctx.vat0.slice() };
}

/** Các hành động: tư thế tay × kẹp/thả × tổ hợp bánh (chỉ số 0..8 trong TO_HOP). */
export function hanhDongTuDo(ctx) {
  const ds = [];
  const tuThes = ctx.coTay ? [null, 'duoi', 'tren'] : [null];
  const keps = ctx.coTay ? [null, 'kep', 'tha'] : [null];
  for (const tuThe of tuThes) for (const kep of keps) for (let b = 0; b < TO_HOP.length; b++) ds.push({ tuThe, kep, banh: b });
  return ds;
}

function ngoai(ctx, x, y) { return x < 0 || y < 0 || x >= ctx.rong || y >= ctx.cao || ctx.chan[y * ctx.rong + x]; }

/** Một nhịp. */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, h: S.h, q: S.q, t: S.t, cam: S.cam, pos: S.pos.slice() };
  const { rong } = ctx;
  if (a.tuThe === 'duoi') N.t = 1; else if (a.tuThe === 'tren') N.t = 0;
  const vf = SanHoc.VEC[N.h], fx = N.x + vf[0], fy = N.y + vf[1];
  const front = (fx >= 0 && fy >= 0 && fx < ctx.rong && fy < ctx.cao) ? fy * rong + fx : -1;     // ô trước mặt
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
  const [t, p] = TO_HOP[a.banh];
  if (ctx.coTay && N.t === 1 && (t !== 0 || p !== 0)) {          // tay vướng sàn: bánh không chạy, quay dở mất
    N.q = -1;
  } else {
    const q = CHIEU_QUAY[a.banh];
    if (q === 0) {
      N.q = -1;
      if (t === 1 && p === 1) { const v = SanHoc.VEC[N.h], nx = N.x + v[0], ny = N.y + v[1]; if (!ngoai(ctx, nx, ny) && N.pos.indexOf(ny * rong + nx) < 0) { N.x = nx; N.y = ny; } }
      else if (t === -1 && p === -1) { const v = SanHoc.VEC[N.h], nx = N.x - v[0], ny = N.y - v[1]; if (!ngoai(ctx, nx, ny) && N.pos.indexOf(ny * rong + nx) < 0) { N.x = nx; N.y = ny; } }
    } else if (S.q === a.banh) { N.h = (N.h + (q > 0 ? 1 : 3)) % 4; N.q = -1; }
    else N.q = a.banh;
  }
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
  let k = ((((cell * 4 + S.h) * 10 + (S.q + 1)) * 2 + S.t) * 2 + (S.cam >= 0 ? 1 : 0));
  for (const c of chuSo) k = k * (ctx.rong * ctx.cao + 1) + c;
  return k;
}

export function nhipXichNganNhat(man, tuyChon = {}) {
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
      for (const a of HD) {
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

/** Chuỗi hành động → mã Python: mỗi hành động thành lệnh tay + lệnh bánh + wait(). */
export function chuoiThanhMa(chuoi) {
  const dong = [];
  for (const a of chuoi) {
    if (a.tuThe === 'duoi') dong.push('arm_down()'); else if (a.tuThe === 'tren') dong.push('arm_up()');
    if (a.kep === 'kep') dong.push('grab()'); else if (a.kep === 'tha') dong.push('release()');
    const [t, p] = TO_HOP[a.banh];
    if (t === 1) dong.push('left_move()'); else if (t === -1) dong.push('left_back()');
    if (p === 1) dong.push('right_move()'); else if (p === -1) dong.push('right_back()');
    dong.push('wait()');
  }
  return dong.join('\n') + '\n';
}

/** Số ô ngắn nhất (BFS thuần theo ô, bỏ qua hướng) từ xuất phát tới cờ; null nếu không tới. Dùng để so với nhịp. */
export function soOCoNganNhat(man) {
  const ctx = dungNguCanh(man);
  if (ctx.co < 0) return null;
  const d = new Map([[ctx.o(ctx.bd.x, ctx.bd.y), 0]]);
  const q = [[ctx.bd.x, ctx.bd.y]];
  while (q.length) {
    const [x, y] = q.shift();
    if (ctx.o(x, y) === ctx.co) return d.get(ctx.co);
    for (const v of SanHoc.VEC) {
      const nx = x + v[0], ny = y + v[1];
      if (ngoai(ctx, nx, ny) || d.has(ctx.o(nx, ny))) continue;
      d.set(ctx.o(nx, ny), d.get(ctx.o(x, y)) + 1);
      q.push([nx, ny]);
    }
  }
  return null;
}

export { TO_HOP };

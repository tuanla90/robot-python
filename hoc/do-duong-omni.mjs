/* ============================================================================
   do-duong-omni.mjs — BỘ DÒ ĐƯỜNG TẮT cho màn của XE BÁNH OMNI (loaiRobot 'omni'): chương `omni`.
   Dùng trong máy kiểm (kiem-hoc.mjs, kiem-omni.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô, hướng, tư thế tay, đang cầm hay không, vị trí các vật nằm dưới đất).
   Luật y hệt san-hoc.js (loại 'omni'):
     - Mỗi nhịp chọn MỘT trong 11 hành động bánh: chín tổ hợp bánh (trái, phải) ∈ {-1,0,1}² như xe bánh ((1,1) tiến, (-1,-1) lùi,
       (1,0) (0,-1) quay phải, (0,1) (-1,0) quay trái, (1,-1) (-1,1) quay đầu 180°, (0,0) đứng yên) HOẶC slide_left HOẶC slide_right.
       (Omni không đi chéo: slide cộng lệnh bánh = chỉ slide, nên slide + lệnh bánh không thêm hành động nào mới.)
     - Slide đi 1 ô sang trái / phải so với hướng mặt, hướng không đổi.
     - Tay hạ ('duoi') thì bánh và slide đều không chạy (tay vướng).
     - Băng chuyền: sau hành động, đang đứng trên ô băng thì bị đẩy 1 ô (mỗi nhịp, mạnh hơn xe bánh); bị chặn thì đứng yên.
     - Bậc thang S chặn omni (như xe bánh).
   Một HÀNH ĐỘNG = tư thế tay (không | hạ | nâng) × kẹp/thả (không | kẹp | thả) × hành động bánh (11).
   Mục tiêu 'toi-co': thắng khi omni chạm cờ F. 'dua-vat': mọi vật nằm trên ô đích.

   Hàm xuất:
     nhipOmniNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }
     chuoiThanhMa(chuoi)            → mã Python (mỗi hành động một nhóm lệnh + wait())
     buocMotNhip(ctx, S, a)         → trạng thái mới (để so chéo với SanHoc)
     soOCoNganNhat(man)             → số ô ngắn nhất (BFS thuần theo ô, bỏ hướng và băng) tới cờ
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

// các tổ hợp bánh (trái, phải) — chỉ số 0..8; 9 = slide_left, 10 = slide_right
const TO_HOP = [];
for (let t = -1; t <= 1; t++) for (let p = -1; p <= 1; p++) TO_HOP.push([t, p]);
const SLIDE_TRAI = 9, SLIDE_PHAI = 10, SO_BANH = 11;

/** Dựng ngữ cảnh từ một màn. */
export function dungNguCanh(man) {
  const san = SanHoc.docSan(man.san);
  const rong = san.rong, cao = san.cao;
  const o = (x, y) => y * rong + x;
  const chan = new Uint8Array(rong * cao);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) chan[o(x, y)] = SanHoc.lyDoChan(san, 'omni', x, y) ? 1 : 0;
  const dich = new Uint8Array(rong * cao);
  for (const d of san.dich) dich[o(d.x, d.y)] = 1;
  const bang = new Int8Array(rong * cao).fill(-1);           // hướng đẩy của ô băng, -1 nếu không phải băng
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) { const c = san.o[y][x]; if (SanHoc.BANG[c] !== undefined) bang[o(x, y)] = SanHoc.BANG[c]; }
  const co = san.co ? o(san.co.x, san.co.y) : -1;
  const coTay = (man.hamGoc || SanHoc.HAM_GOC.omni).some((t) => SanHoc.TAY_LENH.indexOf(t) >= 0);
  return { san, rong, cao, o, chan, dich, bang, co, coTay, mucTieu: man.mucTieu || 'toi-co', vat0: san.vat.map((v) => o(v.x, v.y)), bd: man.batDau };
}

export function trangThaiDau(ctx) {
  return { x: ctx.bd.x, y: ctx.bd.y, h: ctx.bd.huong || 0, t: 0, cam: -1, pos: ctx.vat0.slice() };
}

/** Các hành động: tư thế tay × kẹp/thả × hành động bánh (0..10). */
export function hanhDongTuDo(ctx) {
  const ds = [];
  const tuThes = ctx.coTay ? [null, 'duoi', 'tren'] : [null];
  const keps = ctx.coTay ? [null, 'kep', 'tha'] : [null];
  for (const tuThe of tuThes) for (const kep of keps) for (let b = 0; b < SO_BANH; b++) ds.push({ tuThe, kep, banh: b });
  return ds;
}

function ngoai(ctx, x, y) { return x < 0 || y < 0 || x >= ctx.rong || y >= ctx.cao || ctx.chan[y * ctx.rong + x]; }

/** Một nhịp. */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, h: S.h, t: S.t, cam: S.cam, pos: S.pos.slice() };
  const { rong } = ctx;
  if (a.tuThe === 'duoi') N.t = 1; else if (a.tuThe === 'tren') N.t = 0;
  const cell = N.y * rong + N.x;
  if (a.kep === 'kep') {
    if (N.cam < 0) {
      const i = N.pos.indexOf(cell);
      if (i >= 0 && N.t === 1) { N.pos[i] = -1; N.cam = i; }
    }
  } else if (a.kep === 'tha') {
    if (N.cam >= 0) {
      if (N.t === 0) { N.pos[N.cam] = -2; N.cam = -1; }
      else if (N.pos.indexOf(cell) < 0) { N.pos[N.cam] = cell; N.cam = -1; }
    }
  }
  const tuDi = (huongDi, soBuoc) => {
    const v = SanHoc.VEC[huongDi], nx = N.x + v[0] * soBuoc, ny = N.y + v[1] * soBuoc;
    if (!ngoai(ctx, nx, ny)) { N.x = nx; N.y = ny; }
  };
  if (a.banh >= SLIDE_TRAI) {
    if (!(ctx.coTay && N.t === 1)) tuDi((N.h + (a.banh === SLIDE_PHAI ? 1 : 3)) % 4, 1);     // tay vướng sàn thì không trượt
  } else {
    const [t, p] = TO_HOP[a.banh];
    if (ctx.coTay && N.t === 1 && (t !== 0 || p !== 0)) { /* tay vướng sàn: bánh không chạy */ }
    else if (t === 1 && p === 1) tuDi(N.h, 1);
    else if (t === -1 && p === -1) tuDi(N.h, -1);
    else if ((t === 1 && p === -1) || (t === -1 && p === 1)) N.h = (N.h + 2) % 4;
    else if ((t === 1 && p === 0) || (t === 0 && p === -1)) N.h = (N.h + 1) % 4;
    else if ((t === 0 && p === 1) || (t === -1 && p === 0)) N.h = (N.h + 3) % 4;
  }
  // băng chuyền: đứng trên băng sau hành động thì bị đẩy 1 ô ngay trong nhịp này
  const hd = ctx.bang[N.y * rong + N.x];
  if (hd >= 0) tuDi(hd, 1);
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
  let k = ((((cell * 4 + S.h) * 2 + S.t) * 2 + (S.cam >= 0 ? 1 : 0)));
  for (const c of chuSo) k = k * (ctx.rong * ctx.cao + 1) + c;
  return k;
}

export function nhipOmniNganNhat(man, tuyChon = {}) {
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

/** Chuỗi hành động → mã Python: mỗi hành động thành lệnh tay + lệnh bánh / trượt + wait(). */
export function chuoiThanhMa(chuoi) {
  const dong = [];
  for (const a of chuoi) {
    if (a.tuThe === 'duoi') dong.push('arm_down()'); else if (a.tuThe === 'tren') dong.push('arm_up()');
    if (a.kep === 'kep') dong.push('grab()'); else if (a.kep === 'tha') dong.push('release()');
    if (a.banh === SLIDE_TRAI) dong.push('slide_left()');
    else if (a.banh === SLIDE_PHAI) dong.push('slide_right()');
    else {
      const [t, p] = TO_HOP[a.banh];
      if (t === 1) dong.push('left_move()'); else if (t === -1) dong.push('left_back()');
      if (p === 1) dong.push('right_move()'); else if (p === -1) dong.push('right_back()');
    }
    dong.push('wait()');
  }
  return dong.join('\n') + '\n';
}

/** Số ô ngắn nhất (BFS thuần theo ô, bỏ hướng và băng) từ xuất phát tới cờ; null nếu không tới. */
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

export { TO_HOP, SLIDE_TRAI, SLIDE_PHAI, SO_BANH };

/* ============================================================================
   do-duong-che-lap.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `che-lap` (Chế lệnh có for): xe hai bánh, mục tiêu 'bong-mo' hoặc 'toi-co'.
   Dùng trong máy kiểm (kiem-che-lap.mjs, kiem-hoc.mjs); không nằm trong game.

   - Màn KHÔNG có vật (hầu hết): dùng lại BFS của chương che-xe (do-duong-che-xe.mjs): trạng thái (ô, hướng, tập ô ◆ đã qua), luật bánh trên PHẦN CỨNG của màn.
   - Màn CÓ VẬT NẰM ĐẤT và tay kẹp (che-lap.5 "Dọn hàng"): BFS riêng ở đây. Trạng thái = (ô xe, hướng, tư thế tay, vật đang cầm, vị trí các vật, tập ô ◆ đã qua).
     Một nhịp = tổ hợp (đổi tư thế tay) × (kẹp / thả) × (hiệu quả bánh trong phần cứng), thứ tự y hệt san-hoc.js: (a) tư thế → (b) kẹp / thả ở tư thế mới, ở Ô TRƯỚC MẶT
     → (c) bánh (tay hạ thì bánh không chạy, không quay) → ô ◆. Vật giống hệt nhau nên vị trí được xếp tăng dần để gộp trạng thái. Thả khi tay nâng thì vật vỡ: bỏ trạng thái.
     Thắng: xe đúng tư thế bóng mờ, đã qua mọi ◆, mọi vật nằm đất đúng các ô bongMo.vat (không thừa không thiếu, không cầm gì).

   Hàm xuất:
     nhipCheLapNganNhat(man, tuyChon)  → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }
     nhipCheLapTatCa(man, hamCuaEm)    → số nhịp ngắn nhất của cả màn (cộng đoạn chương trình cố định chạy trước nếu có, như che-xe.7); null nếu không tới được
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { nhipCheXeNganNhat, nhipCheXeTatCa, toHopChoPhep } from './do-duong-che-xe.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

const TAY_TU_THE = [null, 'duoi', 'tren'];
const TAY_KEP = [null, 'kep', 'tha'];

/** BFS cho màn có vật nằm đất + tay kẹp + bóng mờ (kèm ô ◆). */
export function nhipVatNganNhat(man, tuyChon = {}) {
  const san = SanHoc.docSan(man.san, man.mau, man.vatMau);
  const rong = san.rong, cao = san.cao, nO = rong * cao;
  const bm = man.bongMo, diQua = bm.diQua || [];
  const chan = new Uint8Array(nO);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) chan[y * rong + x] = SanHoc.lyDoChan(san, 'banh', x, y) ? 1 : 0;
  const maDiQua = new Int16Array(nO);
  diQua.forEach((q, i) => { maDiQua[q.y * rong + q.x] |= (1 << i); });
  const day2 = (1 << diQua.length) - 1;
  const dichVat = (bm.vat || []).map((q) => q.y * rong + q.x).sort((a, b) => a - b);
  const choPhep = toHopChoPhep(man, tuyChon);
  const coTay = SanHoc.phanCungCua(man).includes('arm_down');
  const tuTheDS = coTay ? TAY_TU_THE : [null], kepDS = coTay ? TAY_KEP : [null];
  const bd = tuyChon.batDau || man.batDau;

  const dau = { x: bd.x, y: bd.y, h: bd.huong || 0, t: 0, cam: -1, pos: san.vat.map((v) => v.y * rong + v.x), m: maDiQua[bd.y * rong + bd.x] };
  const khoa = (S) => {
    const p = S.pos.slice().sort((a, b) => a - b);                       // -1 (đang cầm) đứng đầu
    let k = ((((S.y * rong + S.x) * 4 + S.h) * 2 + S.t) * 2 + (S.cam >= 0 ? 1 : 0)) * (day2 + 1) + S.m;
    for (const c of p) k = k * (nO + 1) + (c + 1);
    return k;
  };
  const laDich = (S) => {
    if (S.x !== bm.x || S.y !== bm.y || S.h !== bm.huong || S.m !== day2 || S.cam >= 0) return false;
    const p = S.pos.slice().sort((a, b) => a - b);
    return p.length === dichVat.length && p.every((c, i) => c === dichVat[i]);
  };
  const buoc = (S, tt, kep, hq) => {
    const N = { x: S.x, y: S.y, h: S.h, t: S.t, cam: S.cam, pos: S.pos.slice(), m: S.m };
    if (tt === 'duoi') N.t = 1; else if (tt === 'tren') N.t = 0;
    const vf = SanHoc.VEC[N.h], fx = N.x + vf[0], fy = N.y + vf[1];
    const front = fx >= 0 && fy >= 0 && fx < rong && fy < cao ? fy * rong + fx : -1;
    if (kep === 'kep') {
      if (N.cam < 0 && front >= 0 && N.t === 1) { const i = N.pos.indexOf(front); if (i >= 0) { N.pos[i] = -1; N.cam = i; } }
    } else if (kep === 'tha' && N.cam >= 0) {
      if (N.t === 0) return null;                                          // tay nâng mà thả: vật vỡ, bỏ trạng thái
      if (front >= 0 && !chan[front] && N.pos.indexOf(front) < 0) { N.pos[N.cam] = front; N.cam = -1; }
    }
    if (!(N.t === 1 && hq !== 'cho')) {
      if (hq === 'tien' || hq === 'lui') {
        const d = hq === 'tien' ? 1 : -1, nx = N.x + vf[0] * d, ny = N.y + vf[1] * d;
        const c = nx >= 0 && ny >= 0 && nx < rong && ny < cao ? ny * rong + nx : -1;
        if (c >= 0 && !chan[c] && N.pos.indexOf(c) < 0) { N.x = nx; N.y = ny; }
      } else if (hq === 'phai') N.h = (N.h + 1) % 4;
      else if (hq === 'trai') N.h = (N.h + 3) % 4;
      else if (hq === 'dau') N.h = (N.h + 2) % 4;
    }
    N.m |= maDiQua[N.y * rong + N.x];
    return N;
  };

  if (laDich(dau)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const toiDa = tuyChon.toiDaTrangThai || 3000000;
  const thay = new Map([[khoa(dau), 0]]);
  const dsTT = [dau], cha = [-1], act = [null];
  let lop = [0];
  for (let b = 1; b <= 200 && lop.length; b++) {
    const tiep = [];
    for (const i of lop) {
      const S = dsTT[i];
      for (const tt of tuTheDS) for (const kep of kepDS) for (const hq of choPhep) {
        const N = buoc(S, tt, kep, hq);
        if (!N) continue;
        const k = khoa(N);
        if (thay.has(k)) continue;
        thay.set(k, dsTT.length); dsTT.push(N); cha.push(i); act.push({ tt, kep, hq });
        if (laDich(N)) {
          const chuoi = [];
          for (let j = dsTT.length - 1; j > 0; j = cha[j]) chuoi.push(act[j]);
          return { nhip: b, soTrangThai: dsTT.length, catNgang: false, chuoi: chuoi.reverse() };
        }
        tiep.push(dsTT.length - 1);
        if (dsTT.length > toiDa) return { nhip: null, soTrangThai: dsTT.length, catNgang: true, chuoi: null };
      }
    }
    lop = tiep;
  }
  return { nhip: null, soTrangThai: dsTT.length, catNgang: false, chuoi: null };
}

/** Sân có vật nằm đất (o / X)? */
function coVat(man) { return /[oX]/.test(man.san.join('')); }

export function nhipCheLapNganNhat(man, tuyChon = {}) {
  if (coVat(man)) return nhipVatNganNhat(man, tuyChon);
  return nhipCheXeNganNhat(man, tuyChon);
}

export function nhipCheLapTatCa(man, hamCuaEm, tuyChon = {}) {
  if (coVat(man)) return nhipVatNganNhat(man, tuyChon).nhip;
  return nhipCheXeTatCa(man, hamCuaEm, tuyChon);
}

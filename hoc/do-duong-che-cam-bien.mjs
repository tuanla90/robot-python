/* ============================================================================
   do-duong-che-cam-bien.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `che-cam-bien` (xe hai bánh + cảm biến khoảng cách, có thể thêm tay kẹp;
   mục tiêu 'bong-mo' hoặc 'toi-co'; một sân hay MẢNG sân). Dùng trong máy kiểm (kiem-che-cam-bien.mjs, kiem-hoc.mjs); không nằm trong game.

   Cảm biến chỉ giúp CHƯƠNG TRÌNH quyết định, không đổi luật vật lý: nhịp ngắn nhất để tới đích là phép dò trên hành động thật của robot,
   không phụ thuộc cảm biến (daoChieu 'cam' cũng không đổi gì ở đây).

   BFS theo NHỊP trên trạng thái (ô, hướng, tập ô diQua đã qua, tư thế tay, đang cầm vật nào, vị trí các vật nằm đất).
   Một HÀNH ĐỘNG = một nhịp = (tay đổi tư thế | không) × (kẹp | thả | không) × (hiệu quả của hai bánh), luật y hệt san-hoc.js / do-duong-tay.mjs:
     (a) tư thế tay → (b) kẹp / thả ở tư thế mới (vật ở Ô TRƯỚC MẶT; kẹp cần tay hạ; thả từ tay nâng thì vật vỡ — bỏ trạng thái đó) → (c) bánh
         (tay HẠ thì bánh không chạy: mọi hành động bánh trừ đứng yên bị bỏ). Vật nằm đất CHIẾM Ô: tiến / lùi không vào ô có vật.
   Hiệu quả của hai bánh (do-duong-che-xe.mjs): tien, lui, phai, trai, dau (quay đầu một nhịp), cho; tập con theo PHẦN CỨNG của màn (man.phanCung).
   Tay chỉ có khi hamGoc có arm_down / arm_up / grab / release.
   Đích: 'bong-mo' = đứng đúng tư thế bóng mờ SAU KHI đã qua mọi ô diQua, và (nếu bongMo.vat) mọi vật nằm đất đúng các ô đó, không ai cầm;
         'toi-co' = chạm ô F ở cuối một nhịp.

   Hàm xuất:
     nhipCheCamBienSan(man, i = 0, tuyChon) → { nhip, soTrangThai, chuoi } | { nhip: null, … }   BFS cho sân thứ i
     nhipCheCamBienTatCa(man)               → tổng nhịp ngắn nhất của mọi sân (null nếu một sân không tới được)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { toHopChoPhep } from './do-duong-che-xe.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

/** Man con cho sân thứ i: san, batDau, bongMo của sân đó. */
export function manCuaSan(man, i = 0) {
  const nhieu = Array.isArray(man.san[0]);
  return Object.assign({}, man, {
    san: nhieu ? man.san[i] : man.san,
    batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau,
    bongMo: Array.isArray(man.bongMo) ? man.bongMo[i] : man.bongMo
  });
}
export function soSan(man) { return Array.isArray(man.san[0]) ? man.san.length : 1; }

export function nhipCheCamBienSan(man, i = 0, tuyChon = {}) {
  const m = manCuaSan(man, i);
  const san = SanHoc.docSan(m.san);
  if (san.thung.length || san.dich.length || /[><^v=NCcSP]/.test(m.san.join(''))) throw new Error('Bộ dò che-cam-bien không hỗ trợ thùng, đích, băng chuyền, cửa…');
  const laBongMo = (m.mucTieu || 'toi-co') === 'bong-mo', bm = m.bongMo;
  const goc = m.hamGoc || [];
  const coTay = ['arm_down', 'arm_up', 'grab', 'release'].some((t) => goc.includes(t));
  const diQua = laBongMo ? (bm.diQua || []) : [];
  const vatDich = laBongMo ? (bm.vat || []) : [];
  const { rong, cao } = san;
  const chan = new Uint8Array(rong * cao);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) chan[y * rong + x] = SanHoc.lyDoChan(san, 'banh', x, y) ? 1 : 0;
  const banhChoPhep = toHopChoPhep(m, tuyChon).map((a) => (a === 'cho' ? 'dung' : a));
  const tuTheDs = coTay ? [null, 'duoi', 'tren'] : [null];
  const kepDs = coTay ? [null, 'kep', 'tha'] : [null];
  const maDiQua = (x, y) => { for (let k = 0; k < diQua.length; k++) if (diQua[k].x === x && diQua[k].y === y) return 1 << k; return 0; };
  const day2 = (1 << diQua.length) - 1;
  const bd = tuyChon.batDau || m.batDau;
  const vat0 = san.vat.map((v) => v.y * rong + v.x);                  // pos[i]: ô của vật i; -1 = đang cầm; -2 = vỡ
  const dichVat = vatDich.map((v) => v.y * rong + v.x).sort((a, b) => a - b);
  const laDich = (s) => {
    if (laBongMo) {
      if (s.x !== bm.x || s.y !== bm.y || s.h !== bm.huong || s.m !== day2) return false;
      if (dichVat.length || s.pos.length) {
        if (s.pos.length !== dichVat.length) return false;
        const p = s.pos.slice().sort((a, b) => a - b);
        return p.every((c, k) => c === dichVat[k]);
      }
      return true;
    }
    return !!san.co && s.x === san.co.x && s.y === san.co.y;
  };
  const khoa = (s) => [s.x, s.y, s.h, s.m, s.t, s.cam, s.pos.join('.')].join(',');
  const dau = { x: bd.x, y: bd.y, h: bd.huong || 0, m: maDiQua(bd.x, bd.y), t: 0, cam: -1, pos: vat0.slice() };
  if (laDich(dau)) return { nhip: 0, soTrangThai: 1, chuoi: [] };
  const thay = new Map([[khoa(dau), 0]]);
  const ds = [dau], cha = [-1], act = [null];
  let lop = [0];
  const nhom = (a) => [a.tuThe || '-', a.kep || '-', a.banh].join('/');
  for (let b = 1; b <= 300 && lop.length; b++) {
    const tiep = [];
    for (const si of lop) {
      const S = ds[si];
      for (const tuThe of tuTheDs) for (const kep of kepDs) for (const banh of banhChoPhep) {
        const N = { x: S.x, y: S.y, h: S.h, m: S.m, t: S.t, cam: S.cam, pos: S.pos.slice() };
        if (tuThe === 'duoi') N.t = 1; else if (tuThe === 'tren') N.t = 0;
        const vf = SanHoc.VEC[N.h], fx = N.x + vf[0], fy = N.y + vf[1];
        const trongSan = fx >= 0 && fy >= 0 && fx < rong && fy < cao;
        const front = trongSan ? fy * rong + fx : -1;
        if (kep === 'kep') {
          if (N.cam < 0) {
            const k = front >= 0 ? N.pos.indexOf(front) : -1;
            if (k >= 0 && N.t === 1) { N.pos[k] = -1; N.cam = k; }
          }
        } else if (kep === 'tha') {
          if (N.cam >= 0) {
            if (N.t === 0) continue;                                            // thả từ tay nâng: vật vỡ, bỏ trạng thái
            if (front >= 0 && !chan[front] && N.pos.indexOf(front) < 0) { N.pos[N.cam] = front; N.cam = -1; }
          }
        }
        if (!(N.t === 1 && banh !== 'dung')) {
          if (banh === 'tien' || banh === 'lui') {
            const d = banh === 'tien' ? 1 : -1, nx = N.x + vf[0] * d, ny = N.y + vf[1] * d;
            if (nx >= 0 && ny >= 0 && nx < rong && ny < cao && !chan[ny * rong + nx] && N.pos.indexOf(ny * rong + nx) < 0) { N.x = nx; N.y = ny; }
          } else if (banh === 'phai') N.h = (N.h + 1) % 4;
          else if (banh === 'trai') N.h = (N.h + 3) % 4;
          else if (banh === 'dau') N.h = (N.h + 2) % 4;
        }
        N.m |= maDiQua(N.x, N.y);
        const k = khoa(N);
        if (thay.has(k)) continue;
        thay.set(k, ds.length); ds.push(N); cha.push(si); act.push(nhom({ tuThe, kep, banh }));
        if (laDich(N)) {
          const chuoi = [];
          for (let j = ds.length - 1; j > 0; j = cha[j]) chuoi.push(act[j]);
          return { nhip: b, soTrangThai: ds.length, chuoi: chuoi.reverse() };
        }
        tiep.push(ds.length - 1);
      }
    }
    lop = tiep;
  }
  return { nhip: null, soTrangThai: ds.length, chuoi: [] };
}

/** Tổng nhịp ngắn nhất trên mọi sân (nhipTheo 'tong'); một sân thì chính nhịp của sân đó. null nếu có sân không tới được. */
export function nhipCheCamBienTatCa(man, tuyChon = {}) {
  let tong = 0;
  for (let i = 0; i < soSan(man); i++) {
    const r = nhipCheCamBienSan(man, i, tuyChon);
    if (r.nhip === null) return null;
    tong += r.nhip;
  }
  return tong;
}

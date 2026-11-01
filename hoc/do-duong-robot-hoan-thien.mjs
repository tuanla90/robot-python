/* ============================================================================
   do-duong-robot-hoan-thien.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `robot-hoan-thien` (xe hai bánh + tay kẹp + cảm biến khoảng cách; mục tiêu 'bong-mo'; MẢNG 3 sân,
   có vật nằm đất, vật có màu, ô diQua, phần cứng hẹp ở màn hỏng). Dùng trong máy kiểm (kiem-robot-hoan-thien.mjs, kiem-hoc.mjs); không nằm trong game.

   Cảm biến chỉ giúp CHƯƠNG TRÌNH quyết định, không đổi luật vật lý (daoChieu 'cam' cũng vậy); daoChieu 'tay' / 'kep' chỉ đổi TÊN lệnh. Nên nhịp ngắn nhất để tới bóng mờ
   là phép dò trên hành động thật của xe + tay: dùng lại BFS của chương che-tay (do-duong-che-tay.mjs: tay, vật có màu, ô diQua, phanCung) cho TỪNG SÂN rồi cộng lại
   (nhipTheo 'tong'). Mỗi sân dựng thành màn một sân: san, batDau, bongMo, và lớp màu vật (vatMau) của đúng sân đó.

   Hàm xuất:
     manCuaSan(man, i)                    → màn một sân cho sân thứ i
     soSan(man)                           → số sân
     nhipRobotHoanThienSan(man, i, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } của sân i (tuyChon.gop = false: cách viết chuẩn pick() / drop() 2 nhịp)
     nhipRobotHoanThienTatCa(man, tuyChon)  → tổng nhịp ngắn nhất ba sân (null nếu một sân không tới được hay bị cắt ngang)
     dayChungRobotHoanThien(man, gioiHan, tuyChon) → dãy chung cố định (không cảm biến) thắng mọi sân trong gioiHan tổng nhịp, hay null
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { nhipCheTayNganNhat, chuoiThanhMa, trangThaiBanDau, buocMotNhip, daDatDich } from './do-duong-che-tay.mjs';
import { toHopChoPhep } from './do-duong-che-xe.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const BANH_EFFECT = ['tien', 'lui', 'phai', 'trai', 'dau'];

export function soSan(man) { return Array.isArray(man.san[0]) ? man.san.length : 1; }

/** Màn một sân cho sân thứ i: san, batDau, bongMo và các lớp màu của đúng sân đó. */
export function manCuaSan(man, i = 0) {
  const nhieu = Array.isArray(man.san[0]);
  const lm = SanHoc.lopMauCuaSan(man, i);
  return Object.assign({}, man, {
    san: nhieu ? man.san[i] : man.san,
    batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau,
    bongMo: nhieu && man.bongMo ? man.bongMo[i] : man.bongMo,
    mau: lm.mau, vatMau: lm.vatMau
  });
}

export function nhipRobotHoanThienSan(man, i = 0, tuyChon = {}) {
  return nhipCheTayNganNhat(manCuaSan(man, i), tuyChon);
}

export function nhipRobotHoanThienTatCa(man, tuyChon = {}) {
  let tong = 0;
  for (let i = 0; i < soSan(man); i++) {
    const r = nhipRobotHoanThienSan(man, i, tuyChon);
    if (r.nhip === null) return null;
    tong += r.nhip;
  }
  return tong;
}

function dungHD(choPhep, gop) {
  const ds = [];
  if (gop) {
    for (const t of [null, 'duoi', 'tren']) for (const k of [null, 'kep', 'tha']) for (const b of BANH_EFFECT) if (choPhep.includes(b)) ds.push({ tuThe: t, kep: k, banh: b });
  } else {
    for (const b of BANH_EFFECT) if (choPhep.includes(b)) ds.push({ khoi: 'banh', banh: b });
    ds.push({ khoi: 'pick' }, { khoi: 'drop' });
  }
  return ds;
}

function canDuoiSan(ctx, N) {
  let h = 0;
  if (ctx.laBongMo) {
    const bm = ctx.bm;
    for (let i = 0; i < N.pos.length; i++) {
      const p = N.pos[i];
      if (p < 0) continue;
      const m = ctx.mauVat[i];
      if (!ctx.dichVat.some((q) => q.o === p && (!q.mau || q.mau === m))) h += 4;
    }
    if (N.cam >= 0 && !ctx.cam) h += 2;
    let dx = Math.abs(N.x - bm.x) + Math.abs(N.y - bm.y);
    ctx.diQua.forEach((o, k) => {
      if (!(N.mask & (1 << k))) {
        const qx = o % ctx.rong, qy = (o - qx) / ctx.rong;
        const d = Math.abs(N.x - qx) + Math.abs(N.y - qy) + Math.abs(qx - bm.x) + Math.abs(qy - bm.y);
        if (d > dx) dx = d;
      }
    });
    h += dx + (bm.huong !== null && bm.huong !== undefined && N.h !== bm.huong ? 1 : 0);
  } else if (ctx.co >= 0) {
    const cx = ctx.co % ctx.rong, cy = (ctx.co - cx) / ctx.rong;
    h += Math.abs(N.x - cx) + Math.abs(N.y - cy);
  }
  return h;
}

/** Dò dãy hành động chung cố định (không cảm biến) thắng mọi sân trong ngưỡng `gioiHan` tổng nhịp. Trả { nhip, chuoi, soTT } hoặc null. */
export function dayChungRobotHoanThien(man, gioiHan, tuyChon = {}) {
  const n = soSan(man), gop = !!tuyChon.gop, toiDa = tuyChon.toiDaTT || 1500000;
  const phanCung = tuyChon.phanCung || SanHoc.phanCungCua(man);
  const choPhep = toHopChoPhep(man, { phanCung });
  const dsHD = dungHD(choPhep, gop);
  const bds = [];
  for (let i = 0; i < n; i++) bds.push(trangThaiBanDau(manCuaSan(man, i), { phanCung }));
  const ctxs = bds.map((x) => x.ctx);
  const thangNgay = (ctx) => !ctx.laBongMo;
  const dau = bds.map((x, i) => ({ S: x.S, xong: thangNgay(ctxs[i]) && daDatDich(ctxs[i], x.S) }));
  const khoaSan = (ctx, N) => {
    const { rong, nCell, nVat } = ctx, N1 = nCell + 2, nDq = ctx.diQua.length;
    let k = ((((N.y * rong + N.x) * 4 + N.h) * 2 + N.t) * (nVat + 1) + (N.cam + 1)) * (1 << nDq) + N.mask;
    for (let i = 0; i < nVat; i++) k = k * N1 + (N.pos[i] + 1);
    return k;
  };
  const khoa = (ds) => ds.map((d, i) => (d.xong ? 'X' : khoaSan(ctxs[i], d.S))).join('|');
  const lop = [[{ ds: dau, c: [] }]], thay = new Map([[khoa(dau), 0]]);
  let soTT = 0;
  for (let g = 0; g < lop.length && g <= gioiHan; g++) {
    for (const { ds, c } of lop[g] || []) {
      if (thay.get(khoa(ds)) < g) continue;
      for (const a of dsHD) {
        let gia = 0, uoc = 0, hong = false;
        const moi = ds.map((d, i) => {
          if (d.xong) return d;
          const r = buocMotNhip(ctxs[i], d.S, a, gop);
          if (!r) { hong = true; return d; }
          gia += r.nhip;
          const xong = thangNgay(ctxs[i]) && daDatDich(ctxs[i], r.N);
          if (!xong) uoc += canDuoiSan(ctxs[i], r.N);
          return { S: r.N, xong };
        });
        if (hong) continue;
        const gg = g + gia;
        if (gg + uoc > gioiHan) continue;
        const xongHet = moi.every((d, i) => d.xong || (!thangNgay(ctxs[i]) && daDatDich(ctxs[i], d.S)));
        if (xongHet) return { nhip: gg, chuoi: c.concat([a]), soTT };
        const kk = khoa(moi);
        if (thay.has(kk) && thay.get(kk) <= gg) continue;
        thay.set(kk, gg); soTT++;
        (lop[gg] || (lop[gg] = [])).push({ ds: moi, c: c.concat([a]) });
        if (soTT > toiDa) return { catNgang: true, soTT };
      }
    }
  }
  return null;
}

export { chuoiThanhMa };

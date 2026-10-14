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
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { nhipCheTayNganNhat, chuoiThanhMa } from './do-duong-che-tay.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

export function soSan(man) { return Array.isArray(man.san[0]) ? man.san.length : 1; }

/** Màn một sân cho sân thứ i: san, batDau, bongMo và các lớp màu của đúng sân đó. */
export function manCuaSan(man, i = 0) {
  const nhieu = Array.isArray(man.san[0]);
  const lm = SanHoc.lopMauCuaSan(man, i);
  return Object.assign({}, man, {
    san: nhieu ? man.san[i] : man.san,
    batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau,
    bongMo: nhieu ? man.bongMo[i] : man.bongMo,
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

export { chuoiThanhMa };

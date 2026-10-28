/* ============================================================================
   huy-hieu-ds.mjs — ĐỒ DÙNG CHUNG của các máy kiểm (không phải máy kiểm): DANH SÁCH MÃ HUY HIỆU đọc từ DỮ LIỆU của bộ vẽ vector
   (game/huy-hieu-vector.js: VeVector.HUY_HIEU.dsTatCa() = hình riêng + bí danh; V7c1 28/10). Trước đây 26 máy kiểm tự regex `HINH['ma'] = function`
   trong chữ game/huy-hieu.js (bộ pixel, V7c2 xoá) — nay gọi coHuyHieu / coHinhRieng ở đây.
   Nạp ve-vector.js + huy-hieu-vector.js trong một ngữ cảnh vm riêng (không đặt VeVector lên globalThis của Node, để máy kiểm nạp ve-robot.js không đổi chế độ).
     dsHuyHieu()      → mọi mã huy hiệu của game (hình riêng + bí danh)
     coHuyHieu(ma)    → mã có trong danh sách (hình riêng hay bí danh dùng hình của mã khác)
     coHinhRieng(ma)  → mã có hình riêng (không phải bí danh)
     biDanh()         → { mã: mã gốc }
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.join(day, 'game');
const require = createRequire(import.meta.url);

let HH = null;
function nap() {
  if (HH) return HH;
  const ctx = { BangMau: require(path.join(GAME, 'bang-mau.js')), console, Math, JSON, Object, Array, String, Number, Error, RegExp };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of ['ve-vector.js', 'huy-hieu-vector.js']) vm.runInContext(fs.readFileSync(path.join(GAME, f), 'utf8'), ctx, { filename: f });
  HH = ctx.VeVector.HUY_HIEU;
  return HH;
}
export const dsHuyHieu = () => nap().dsTatCa();
export const coHuyHieu = (ma) => dsHuyHieu().includes(ma);
export const coHinhRieng = (ma) => nap().co(ma);
export const biDanh = () => Object.assign({}, nap().BI_DANH);

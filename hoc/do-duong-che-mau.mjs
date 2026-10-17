/* ============================================================================
   do-duong-che-mau.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `che-mau` (xe hai bánh + cảm biến màu / camera, có thể thêm tay kẹp; mục tiêu 'bong-mo' hoặc 'toi-co'; MẢNG 3 sân).
   Dùng trong máy kiểm (kiem-che-mau.mjs, kiem-hoc.mjs); không nằm trong game.

   Màu KHÔNG đổi vật lý: ô sàn màu đi lại như sàn thường, vật có màu nhặt / đặt như vật thường, camera và cảm biến bụng chỉ giúp CHƯƠNG TRÌNH quyết định. Nên nhịp ngắn nhất tới đích là phép dò
   trên hành động thật của robot, y hệt chế lệnh tay (do-duong-che-tay.mjs: BFS theo nhịp trên (ô, hướng, tư thế tay, vật đang cầm, ô các vật, ô ◆ đã qua), luật y hệt san-hoc.js).
   Bộ dò này chỉ làm thêm hai việc:
     1. cắt MẢNG sân thành từng sân một (san, batDau, mau, vatMau, bongMo song song với san) rồi gọi BFS của che-tay cho sân đó;
     2. đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (che-mau.7: go_out() của màn, khóa): chạy thật từng sân bằng ChamHoc.cham rồi BFS từ trạng thái sau đoạn đó
        (xe, hướng, tay, vật, ô ◆ đã qua), như nhipCheTayTatCa nhưng cho nhiều sân.
   Bộ dò không hỗ trợ băng chuyền, thùng nặng, nút, cửa, ô sạc (dungNguCanh của che-tay ném lỗi).

   Hàm xuất:
     soSan(man), manCuaSan(man, i)                       màn con một sân thứ i
     nhipCheMauSan(man, i, tuyChon) → { nhip, soTrangThai, chuoi } | { nhip:null, … }   BFS cho sân i (tuyChon như nhipCheTayNganNhat: batDau, phanCung, gop, toiDaTrangThai)
     nhipCheMauTatCa(man, hamCuaEm, tuyChon) → tổng nhịp ngắn nhất của mọi sân (null nếu có sân không tới được), tính cả đoạn cố định gọi hàm khóa của màn
     chuoiThanhMa, buocMotNhip, trangThaiBanDau, daDatDich, BANH_EFFECT   (của do-duong-che-tay.mjs) để máy kiểm so chéo với SanHoc.chay
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { nhipCheTayNganNhat, trangThaiBanDau, buocMotNhip, daDatDich, chuoiThanhMa, BANH_EFFECT } from './do-duong-che-tay.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

export function soSan(man) { return Array.isArray(man.san[0]) ? man.san.length : 1; }

/** Màn con cho sân thứ i: san, batDau, mau, vatMau, bongMo của sân đó (màn một sân thì giữ nguyên). */
export function manCuaSan(man, i = 0) {
  const nhieu = Array.isArray(man.san[0]);
  const lm = SanHoc.lopMauCuaSan(man, i);
  return Object.assign({}, man, {
    san: nhieu ? man.san[i] : man.san,
    batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau,
    mau: lm.mau, vatMau: lm.vatMau, bongMo: lm.bongMo || man.bongMo
  });
}

export function nhipCheMauSan(man, i = 0, tuyChon = {}) {
  return nhipCheTayNganNhat(manCuaSan(man, i), tuyChon);
}

/** Số dòng đầu của chương trình chính CỐ ĐỊNH chỉ gọi hàm KHÓA của màn (man.khoaHamMan). */
function soDongCoDinh(man) {
  const khoa = man.khoaHamMan || [], chinh = man.chinhCoDinh && man.maMau ? man.maMau.chinh : [];
  let n = 0;
  while (n < chinh.length && khoa.some((t) => chinh[n].trim() === t + '()')) n++;
  return n;
}

/**
 * Nhịp ngắn nhất của cả màn (mọi sân cộng lại). Màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (che-mau.7: go_out() do màn cho) thì mỗi sân tính:
 * nhịp của đoạn đó (chạy thật với kho hamCuaEm) + BFS từ trạng thái sau đoạn đó, giữ các ô ◆ đã qua.
 */
export function nhipCheMauTatCa(man, hamCuaEm, tuyChon = {}) {
  const n = soDongCoDinh(man);
  const chinh = n ? man.maMau.chinh.slice(0, n) : [];
  const ChamHoc = n ? require(path.join(day, 'cham.js')) : null;
  let tong = 0;
  for (let i = 0; i < soSan(man); i++) {
    const con = manCuaSan(man, i);
    let nhip;
    if (!n) nhip = nhipCheTayNganNhat(con, tuyChon).nhip;
    else {
      const pre = ChamHoc.cham(Object.assign({}, con, { chinhCoDinh: false }), { chinh, hamCuaMan: man.maMau.hamCuaMan }, hamCuaEm);
      if (!pre.theoSan.length || !pre.vet.length || pre.chanDoan.some((c) => c.ma === 'ham-chua-co' || c.ma === 'loi-chay' || c.ma === 'vat-vo')) throw new Error('Đoạn cố định của ' + man.ma + ' (sân ' + (i + 1) + ') chạy lỗi.');
      const r = pre.theoSan[0], rong = SanHoc.docSan(con.san, con.mau, con.vatMau).rong;
      const pos = r.vat.map((v) => (v.trangThai === 'dat' ? v.y * rong + v.x : -1));
      const cam = r.tay && r.tay.cam !== null && r.tay.cam !== undefined ? r.tay.cam - 1 : -1;
      const b = nhipCheTayNganNhat(con, Object.assign({}, tuyChon, {
        batDau: { x: r.robot.x, y: r.robot.y, huong: r.robot.huong, tuThe: r.tay ? r.tay.tuThe : 'tren', cam, pos, daQua: (r.diQua || []).filter((q) => q.da).map((q) => q.y * rong + q.x) }
      }));
      nhip = b.nhip === null ? null : r.soNhip + b.nhip;
    }
    if (nhip === null) return null;
    tong += nhip;
  }
  return tong;
}

export { chuoiThanhMa, buocMotNhip, trangThaiBanDau, daDatDich, BANH_EFFECT };

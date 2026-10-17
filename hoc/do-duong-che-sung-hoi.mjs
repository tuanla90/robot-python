/* ============================================================================
   do-duong-che-sung-hoi.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `che-sung-hoi` (xe hai bánh gắn SÚNG HƠI, loaiRobot 'banh', mục tiêu 'bong-mo' hoặc 'toi-co').
   Dùng trong máy kiểm (kiem-che-sung-hoi.mjs, kiem-hoc.mjs); không nằm trong game.

   Dựa trên BFS của do-duong-sung-hoi.mjs (luật y hệt san-hoc.js, phần THÙNG NẶNG + SÚNG HƠI): trạng thái = (ô xe, hướng, đếm băng, thùng, nút, cửa, băng tắt, nhịp mod chu kỳ cửa nhịp, ô ◆ đã qua).
   Khác chương sung-hoi ở chỗ chọn HÀNH ĐỘNG theo PHẦN CỨNG của màn:
     - hiệu quả bánh: toHopChoPhep của do-duong-che-xe.mjs (màn hỏng bánh có ít hơn);
     - ban-truoc / ban-sau: cần nòng trước (shoot) / nòng sau (shoot_back) trong phần cứng. daoChieu 'sung' (súng lắp ngược) chỉ đổi TÊN lệnh người chơi gọi (shoot() bắn ra sau), không đổi tập
       hiệu quả làm được, nên bộ dò tính theo hiệu quả THẬT; màn hỏng nòng sau khai phanCung thiếu shoot_back nên chỉ còn ban-truoc.
   Mục tiêu 'bong-mo' có thể kèm thùng mờ (bongMo.thung) và ô ◆ (bongMo.diQua).
   Màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (che-sung-hoi.9: go_out() của màn): nhipCheSungHoiTatCa chạy thật đoạn đó rồi BFS từ trạng thái sau nó.
   Màn nhiều sân: bongMo, batDau, san song song; nhịp = tổng các sân.

   Hàm xuất:
     nhipCheSungHoiNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }   (man MỘT sân; tuyChon.phanCung, .batDau, .trangThai, .toiDaTrangThai, .toiDaMs)
     nhipCheSungHoiTatCa(man, hamCuaEm, tuyChon) → tổng nhịp mọi sân (null nếu có sân không giải được hay bị cắt ngang), tính cả đoạn cố định gọi hàm khóa của màn
     chuoiThanhMa(chuoi, man) → mã Python lệnh gốc của đường (đúng daoChieu, phanCung của màn) để kiểm chéo với SanHoc.chay
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import * as Bo from './do-duong-sung-hoi.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

export function nhipCheSungHoiNganNhat(man, tuyChon = {}) {
  return Bo.nhipSungHoiNganNhat(man, tuyChon);
}

/** Cấu hình một sân của màn m (như ChamHoc.cham truyền xuống). */
function conCua(man, i) {
  const lm = SanHoc.lopMauCuaSan(man, i);
  const nhieu = Array.isArray(man.san[0]);
  return Object.assign({}, man, { san: nhieu ? man.san[i] : man.san, batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau, mau: lm.mau, bongMo: lm.bongMo || man.bongMo, cuaNhip: lm.cuaNhip || undefined, noi: lm.noi || undefined });
}

/**
 * Nhịp ngắn nhất của cả màn (mọi sân cộng lại). Màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (che-sung-hoi.9: go_out() do màn cho) thì tính:
 * nhịp của đoạn đó (chạy thật, với kho hamCuaEm) + BFS từ trạng thái sau đoạn đó. Đoạn cố định = những dòng đầu của chương trình chính cố định (maMau.chinh) chỉ gọi hàm KHÓA của màn (man.khoaHamMan).
 */
export function nhipCheSungHoiTatCa(man, hamCuaEm, tuyChon = {}) {
  const khoa = man.khoaHamMan || [], chinh = man.chinhCoDinh && man.maMau ? man.maMau.chinh : [];
  let n = 0;
  while (n < chinh.length && khoa.some((t) => chinh[n].trim() === t + '()')) n++;
  const nhieu = Array.isArray(man.san[0]);
  if (!n) {
    let tong = 0;
    (nhieu ? man.san : [man.san]).forEach((_, i) => {
      const k = nhipCheSungHoiNganNhat(conCua(man, i), tuyChon).nhip;
      tong = tong === null || k === null ? null : tong + k;
    });
    return tong;
  }
  if (nhieu) throw new Error('Đoạn cố định + nhiều sân chưa hỗ trợ.');
  const ChamHoc = require(path.join(day, 'cham.js'));
  const pre = ChamHoc.cham(Object.assign({}, man, { chinhCoDinh: false }), { chinh: chinh.slice(0, n), hamCuaMan: man.maMau.hamCuaMan }, hamCuaEm);
  if (!pre.theoSan.length || !pre.vet.length || pre.chanDoan.some((c) => c.ma === 'ham-chua-co' || c.ma === 'loi-chay')) throw new Error('Đoạn cố định của ' + man.ma + ' chạy lỗi.');
  const r = pre.theoSan[0], san = SanHoc.docSan(man.san, null, null, null), rong = san.rong;
  const ctx = Bo.dungNguCanh(man);
  const cm = (() => { let m = 0; (r.cua || []).forEach((d) => { const j = ctx.cuaIdx[d.y * rong + d.x]; if (d.mo && j >= 0) m |= 1 << j; }); return m; })();
  const nm = (() => { let m = 0; (r.nut || []).forEach((d) => { const j = ctx.nutIdx[d.y * rong + d.x]; if (d.bat && j >= 0) m |= 1 << j; }); return m; })();
  const bmk = (() => { let m = 0; (r.bangTat || []).forEach((d) => { const j = ctx.bangIdx[d.y * rong + d.x]; if (j >= 0) m |= 1 << j; }); return m; })();
  const q = (() => { let m = 0; (r.diQua || []).forEach((d, i) => { if (d.da) m |= 1 << i; }); return m; })();
  const b = nhipCheSungHoiNganNhat(man, Object.assign({}, tuyChon, {
    batDau: { x: r.robot.x, y: r.robot.y, huong: r.robot.huong },
    trangThai: { p: (r.thung || []).map((t) => t.y * rong + t.x), nm, cm, bm: bmk, t: r.soNhip, q }
  }));
  return b.nhip === null ? null : r.soNhip + b.nhip;
}

/** Chuỗi hành động (hiệu quả THẬT) → mã Python lệnh gốc theo phần cứng và daoChieu của màn. */
export function chuoiThanhMa(chuoi, man) {
  return Bo.chuoiThanhMa(chuoi, { phanCung: SanHoc.phanCungCua(man), daoChieu: man.daoChieu || [] });
}

export { Bo };

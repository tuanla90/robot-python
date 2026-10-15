/* ============================================================================
   do-duong-che-nam-cham.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `che-nam-cham` (xe hai bánh gắn tay nam châm CÓ CỰC, loaiRobot 'banh', mục tiêu 'bong-mo' hoặc 'toi-co').
   Dùng trong máy kiểm (kiem-che-nam-cham.mjs, kiem-hoc.mjs); không nằm trong game.

   Dựa trên BFS của do-duong-nam-cham.mjs (luật y hệt san-hoc.js, phần NAM CHÂM): trạng thái = (ô xe, hướng, cực, bộ đếm băng, ô diQua đã qua, ô từng vật).
   Khác chương nam-cham ở chỗ chọn HÀNH ĐỘNG theo PHẦN CỨNG của màn:
     - hiệu quả bánh: toHopChoPhep của do-duong-che-xe.mjs (sáu hiệu quả tien, lui, phai, trai, dau, cho; màn hỏng bánh có ít hơn);
     - lệnh nam châm: n (cực N), s (cực S), off (ngắt) nếu phần cứng có magnet_n / magnet_s / magnet_off. Màn hỏng cực S (che-nam-cham.8) khai phanCung không có magnet_s nên chỉ còn n, off.
     daoChieu 'cuc' (dây cực đấu ngược) chỉ đổi TÊN lệnh người chơi gọi (magnet_n() ra cực S thật), không đổi tập hiệu quả làm được, nên bộ dò tính theo cực THẬT.
   Lệnh nam châm gộp được vào nhịp đi / quay (đường ngắn nhất thật); tuyChon.tachNhip = true: lệnh nam châm đứng MỘT MÌNH trong nhịp (đúng cách viết "magnet_n()  wait()").
   Màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (che-nam-cham.9: go_pull() của màn): nhipCheNamChamTatCa chạy thật đoạn đó rồi BFS từ trạng thái sau nó.
   Màn nhiều sân (che-nam-cham.5, .7, .10): bongMo, vatChat, batDau song song với san; nhịp = tổng các sân.

   Hàm xuất:
     nhipCheNamChamNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }   (man MỘT sân; tuyChon.tachNhip, tuyChon.phanCung, tuyChon.batDau, tuyChon.toiDaTrangThai)
     nhipCheNamChamTatCa(man, hamCuaEm, tuyChon) → tổng nhịp mọi sân (null nếu có sân không giải được), tính cả đoạn cố định gọi hàm khóa của màn
     chuoiThanhMa(chuoi, man) → mã Python lệnh gốc của đường (đúng daoChieu, phanCung của màn) để kiểm chéo với SanHoc.chay
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { toHopChoPhep } from './do-duong-che-xe.mjs';
import * as BoNC from './do-duong-nam-cham.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

/** Các lệnh nam châm làm được ('n', 's', 'off') theo phần cứng. */
export function lenhNamChamChoPhep(man, phanCung) {
  const pc = phanCung || SanHoc.phanCungCua(man);
  const kq = [];
  if (pc.includes('magnet_n')) kq.push('n');
  if (pc.includes('magnet_s')) kq.push('s');
  if (pc.includes('magnet_off')) kq.push('off');
  return kq;
}
function tuyChonBFS(man, tuyChon) {
  const phanCung = tuyChon.phanCung || SanHoc.phanCungCua(man);
  return Object.assign({}, tuyChon, { hieuQua: toHopChoPhep(man, { phanCung }), nc: lenhNamChamChoPhep(man, phanCung) });
}

export function nhipCheNamChamNganNhat(man, tuyChon = {}) {
  return BoNC.nhipNamChamNganNhat(man, tuyChonBFS(man, tuyChon));
}

/**
 * Nhịp ngắn nhất của cả màn (mọi sân cộng lại). Màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (che-nam-cham.9: go_pull() do màn cho) thì tính:
 * nhịp của đoạn đó (chạy thật với kho hamCuaEm) + BFS từ trạng thái sau đoạn đó (xe, cực, vật đang dính / nằm ở ô nào, ô diQua đã qua).
 * Đoạn cố định = những dòng đầu của chương trình chính cố định (maMau.chinh) chỉ gọi hàm KHÓA của màn (man.khoaHamMan).
 */
export function nhipCheNamChamTatCa(man, hamCuaEm, tuyChon = {}) {
  const khoa = man.khoaHamMan || [], chinh = man.chinhCoDinh && man.maMau ? man.maMau.chinh : [];
  let n = 0;
  while (n < chinh.length && khoa.some((t) => chinh[n].trim() === t + '()')) n++;
  if (!n) {
    const nhieu = Array.isArray(man.san[0]);
    const dsSan = nhieu ? man.san : [man.san];
    let tong = 0;
    dsSan.forEach((rows, i) => {
      const lm = SanHoc.lopMauCuaSan(man, i);
      const con = Object.assign({}, man, { san: rows, batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau, mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vatThem: lm.vatThem, bongMo: lm.bongMo || man.bongMo });
      const k = nhipCheNamChamNganNhat(con, tuyChon).nhip;
      tong = tong === null || k === null ? null : tong + k;
    });
    return tong;
  }
  if (Array.isArray(man.san[0])) throw new Error('Đoạn cố định + nhiều sân chưa hỗ trợ.');
  const ChamHoc = require(path.join(day, 'cham.js'));
  const pre = ChamHoc.cham(Object.assign({}, man, { chinhCoDinh: false }), { chinh: chinh.slice(0, n), hamCuaMan: man.maMau.hamCuaMan }, hamCuaEm);
  if (!pre.theoSan.length || !pre.vet.length || pre.chanDoan.some((c) => c.ma === 'ham-chua-co' || c.ma === 'loi-chay')) throw new Error('Đoạn cố định của ' + man.ma + ' chạy lỗi.');
  const r = pre.theoSan[0], rong = SanHoc.docSan(man.san, man.mau, man.vatMau, man.vatChat).rong;
  const pos = r.vat.map((v) => (v.trangThai === 'dat' ? v.y * rong + v.x : -1));
  const cuc = r.namCham && r.namCham.cuc === 'N' ? 1 : r.namCham && r.namCham.cuc === 'S' ? 2 : 0;
  const b = nhipCheNamChamNganNhat(man, Object.assign({}, tuyChon, {
    batDau: { x: r.robot.x, y: r.robot.y, huong: r.robot.huong, cuc, pos, daQua: (r.diQua || []).filter((q) => q.da).map((q) => q.y * rong + q.x) }
  }));
  return b.nhip === null ? null : r.soNhip + b.nhip;
}

/** Chuỗi hành động (cực THẬT) → mã Python lệnh gốc theo phần cứng và daoChieu của màn. */
export function chuoiThanhMa(chuoi, man) {
  return BoNC.chuoiThanhMa(chuoi, { phanCung: SanHoc.phanCungCua(man), daoChieu: man.daoChieu || [] });
}

export { BoNC };

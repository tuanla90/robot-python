/* ============================================================================
   do-duong-che-nhen.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `che-nhen` (nhện, mục tiêu 'bong-mo' hoặc 'toi-co').
   Dùng trong máy kiểm (kiem-che-nhen.mjs, kiem-hoc.mjs); không nằm trong game.

   Dùng lại BFS theo NHỊP của do-duong-nhen.mjs (co / duỗi chân, gầm, hố, nhảy, hàng rào, bước dở, tay kẹp + vật, băng chuyền, ô ◆):
   lệnh dùng được là PHẦN CỨNG của màn (man.phanCung, không có thì khay man.hamGoc) — hàm của em gọi được mọi lệnh phần cứng — và daoChieu ['chan'] đã tính.
   Thêm ở đây: màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (che-nhen.7: go_in() do màn cho, khóa) thì tính
   nhịp của đoạn đó (chạy thật, với kho hamCuaEm) + BFS từ tư thế sau đoạn đó (ô, chân, vật), giữ các ô ◆ đã qua.
   Đoạn cố định = những dòng đầu của chương trình chính cố định (maMau.chinh) chỉ gọi hàm KHÓA của màn (man.khoaHamMan).

   Hàm xuất:
     nhipCheNhenNganNhat(man, tuyChon) → { nhip, soTrangThai, chuoi } | { nhip:null, … }   (tuyChon.batDau: { x, y, chan, pos, daQua })
     nhipCheNhenTatCa(man, hamCuaEm, tuyChon) → số nhịp ngắn nhất của cả màn (tính cả đoạn cố định), hay null
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { nhipNhenNganNhat } from './do-duong-nhen.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

export function nhipCheNhenNganNhat(man, tuyChon = {}) {
  return nhipNhenNganNhat(man, tuyChon);
}

export function nhipCheNhenTatCa(man, hamCuaEm, tuyChon = {}) {
  const khoa = man.khoaHamMan || [], chinh = man.chinhCoDinh && man.maMau ? man.maMau.chinh : [];
  let n = 0;
  while (n < chinh.length && khoa.some((t) => chinh[n].trim() === t + '()')) n++;
  if (!n) return nhipCheNhenNganNhat(man, tuyChon).nhip;
  const ChamHoc = require(path.join(day, 'cham.js'));
  const pre = ChamHoc.cham(Object.assign({}, man, { chinhCoDinh: false }), { chinh: chinh.slice(0, n), hamCuaMan: man.maMau.hamCuaMan }, hamCuaEm);
  if (!pre.theoSan.length || !pre.vet.length || pre.chanDoan.some((c) => c.ma === 'ham-chua-co' || c.ma === 'loi-chay')) throw new Error('Đoạn cố định của ' + man.ma + ' chạy lỗi.');
  const r = pre.theoSan[0], cuoi = r.vet.filter((e) => e.loai === 'nhip').pop();
  const chan = cuoi && cuoi.robot ? cuoi.robot.chan : 'dung';
  const b = nhipCheNhenNganNhat(man, Object.assign({}, tuyChon, { batDau: { x: r.robot.x, y: r.robot.y, chan, daQua: (r.diQua || []).filter((q) => q.da) } }));
  return b.nhip === null ? null : r.soNhip + b.nhip;
}

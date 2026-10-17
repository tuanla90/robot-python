/* ============================================================================
   do-duong-che-xe.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `che-xe` (xe hai bánh, loaiRobot 'banh', mục tiêu 'bong-mo' hoặc 'toi-co').
   Dùng trong máy kiểm (kiem-che-xe.mjs, kiem-hoc.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái (ô, hướng, tập ô diQua đã qua). Luật y hệt san-hoc.js (xe bánh):
     - Mỗi nhịp chọn một tổ hợp bánh (trái, phải); giá trị THẬT của mỗi bánh = lệnh người chơi chọn, đảo dấu nếu bánh đó bị đấu dây ngược (daoChieu).
     - Lệnh nào chọn được thì do PHẦN CỨNG của màn quyết định (man.phanCung; mặc định xe bánh có đủ left_move, right_move, left_back, right_back, wait),
       KHÔNG phải khay: hàm của em gọi được mọi lệnh phần cứng. Màn hỏng khai phanCung hẹp hơn nên ít tổ hợp hơn.
     - Sáu hiệu quả: (1,1) tiến, (-1,-1) lùi, (1,0) (0,-1) quay phải, (0,1) (-1,0) quay trái, (1,-1) (-1,1) quay đầu, (0,0) đứng yên.
   Mục tiêu 'bong-mo': đứng đúng tư thế bóng mờ SAU KHI đã qua mọi ô diQua (qua = cuối một nhịp đứng ở ô đó). 'toi-co': chạm cờ F.
   Màn chế lệnh không có băng chuyền, vật, thùng: gặp thì báo lỗi.

   Hàm xuất:
     nhipCheXeNganNhat(man, tuyChon) → { nhip, soTrangThai, chuoi:[tên hành động] } | { nhip:null, … }
        tuyChon.batDau   : tư thế xuất phát khác (vd sau một đoạn chương trình cố định), mặc định man.batDau
        tuyChon.daQua    : mảng ô diQua đã qua từ trước
     hieuQua(t, p)       → 'tien' | 'lui' | 'phai' | 'trai' | 'dau' | 'cho'
     toHopChoPhep(man)   → các tổ hợp (bánh trái, bánh phải) thật mà phần cứng cho phép
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

export function hieuQua(t, p) {
  if (t === 1 && p === 1) return 'tien';
  if (t === -1 && p === -1) return 'lui';
  if ((t === 1 && p === 0) || (t === 0 && p === -1)) return 'phai';
  if ((t === 0 && p === 1) || (t === -1 && p === 0)) return 'trai';
  if ((t === 1 && p === -1) || (t === -1 && p === 1)) return 'dau';
  return 'cho';
}

/** Các hiệu quả (hành động) mà phần cứng của màn làm được: tập con của tien, lui, phai, trai, dau, cho. */
export function toHopChoPhep(man, tuyChon = {}) {
  const pc = tuyChon.phanCung || SanHoc.phanCungCua(man);
  const dao = tuyChon.daoChieu || man.daoChieu || [];
  const giaTri = (tien, lui, daoNay) => {
    const kq = [0];
    if (pc.includes(tien)) kq.push(daoNay ? -1 : 1);
    if (pc.includes(lui)) kq.push(daoNay ? 1 : -1);
    return kq;
  };
  const ts = giaTri('left_move', 'left_back', dao.includes('trai'));
  const ps = giaTri('right_move', 'right_back', dao.includes('phai'));
  const hq = new Set();
  for (const t of ts) for (const p of ps) hq.add(hieuQua(t, p));
  return [...hq];
}

export function nhipCheXeNganNhat(man, tuyChon = {}) {
  const san = SanHoc.docSan(man.san);
  const coTay = (man.hamGoc || []).includes('grab');
  if (((san.vat.length || san.thung.length) && coTay) || /[><^v]/.test(man.san.join(''))) throw new Error('Bộ dò che-xe không hỗ trợ vật (khi có tay gắp), thùng, băng chuyền.');
  const bm = man.bongMo, laBongMo = (man.mucTieu || 'toi-co') === 'bong-mo';
  const diQua = laBongMo ? (bm.diQua || []) : [];
  const bd = tuyChon.batDau || man.batDau;
  const choPhep = toHopChoPhep(man, tuyChon);
  const rong = san.rong, cao = san.cao;
  const chan = (x, y) => { const c = san.o[y] && san.o[y][x]; return !!SanHoc.lyDoChan(san, 'banh', x, y) || c === 'u' || (!coTay && 'oXHhC'.includes(c)); };      // hố: vào là rơi; vật / thùng / cửa đóng: tường khi không có tay (màn gặp khó)
  const maDiQua = (x, y) => { for (let i = 0; i < diQua.length; i++) if (diQua[i].x === x && diQua[i].y === y) return 1 << i; return 0; };
  let mask0 = 0;
  (tuyChon.daQua || []).forEach((q) => { mask0 |= maDiQua(q.x, q.y); });
  const day2 = (1 << diQua.length) - 1;
  const khoa = (x, y, h, m) => ((((m * cao + y) * rong + x) * 4) + h);
  const dau = { x: bd.x, y: bd.y, h: bd.huong || 0, m: mask0 };
  const laDich = (s) => laBongMo ? (s.x === bm.x && s.y === bm.y && s.h === bm.huong && s.m === day2) : (san.co && s.x === san.co.x && s.y === san.co.y);
  if (laDich(dau)) return { nhip: 0, soTrangThai: 1, chuoi: [] };
  const thay = new Map([[khoa(dau.x, dau.y, dau.h, dau.m), -1]]);
  const dsTT = [dau], cha = [-1], act = [null];
  let lop = [0];
  for (let b = 1; b <= 400 && lop.length; b++) {
    const tiep = [];
    for (const i of lop) {
      const s = dsTT[i];
      for (const a of choPhep) {
        let { x, y, h } = s, m = s.m;
        if (a === 'tien' || a === 'lui') {
          const v = SanHoc.VEC[h], d = a === 'tien' ? 1 : -1;
          const nx = x + v[0] * d, ny = y + v[1] * d;
          if (!chan(nx, ny)) { x = nx; y = ny; }
        } else if (a === 'phai') h = (h + 1) % 4;
        else if (a === 'trai') h = (h + 3) % 4;
        else if (a === 'dau') h = (h + 2) % 4;
        m |= maDiQua(x, y);
        const k = khoa(x, y, h, m);
        if (thay.has(k)) continue;
        const n = { x, y, h, m };
        thay.set(k, dsTT.length); dsTT.push(n); cha.push(i); act.push(a);
        if (laDich(n)) {
          const chuoi = [];
          for (let j = dsTT.length - 1; j > 0; j = cha[j]) chuoi.push(act[j]);
          return { nhip: b, soTrangThai: dsTT.length, chuoi: chuoi.reverse() };
        }
        tiep.push(dsTT.length - 1);
      }
    }
    lop = tiep;
  }
  return { nhip: null, soTrangThai: dsTT.length, chuoi: [] };
}

/**
 * Nhịp ngắn nhất của cả màn. Màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (3.7: go_out() do màn cho) thì tính:
 * nhịp của đoạn đó (chạy thật, với kho hamCuaEm) + BFS từ tư thế sau đoạn đó, giữ các ô diQua đã qua.
 * Đoạn cố định = những dòng đầu của chương trình chính cố định (maMau.chinh) chỉ gọi hàm KHÓA của màn (man.khoaHamMan).
 */
export function nhipCheXeTatCa(man, hamCuaEm, tuyChon = {}) {
  const khoa = man.khoaHamMan || [], chinh = man.chinhCoDinh && man.maMau ? man.maMau.chinh : [];
  let n = 0;
  while (n < chinh.length && khoa.some((t) => chinh[n].trim() === t + '()')) n++;
  if (!n) return nhipCheXeNganNhat(man, tuyChon).nhip;
  const ChamHoc = require(path.join(day, 'cham.js'));
  const pre = ChamHoc.cham(Object.assign({}, man, { chinhCoDinh: false }), { chinh: chinh.slice(0, n), hamCuaMan: man.maMau.hamCuaMan }, hamCuaEm);
  if (!pre.theoSan.length || !pre.vet.length || pre.chanDoan.some((c) => c.ma === 'ham-chua-co' || c.ma === 'loi-chay')) throw new Error('Đoạn cố định của ' + man.ma + ' chạy lỗi.');
  const r = pre.theoSan[0];
  const b = nhipCheXeNganNhat(man, Object.assign({}, tuyChon, { batDau: r.robot, daQua: (r.diQua || []).filter((q) => q.da) }));
  return b.nhip === null ? null : r.soNhip + b.nhip;
}

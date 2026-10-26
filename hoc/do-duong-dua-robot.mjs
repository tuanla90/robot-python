/* ============================================================================
   do-duong-dua-robot.mjs — BỘ DÒ ĐƯỜNG TẮT cho gói Đua đối kháng (`dua-robot`, `che-dua-robot`; man.doiKhang). Dùng trong kiem-dua-robot.mjs; không nằm trong game.

   Đối thủ R2 chạy chương trình khóa (có cảm biến, có thể bị R1 cản), và sân có bàn xoay, cổng dịch chuyển, nút đè: viết lại luật cho bộ dò thì dễ lệch lõi.
   Nên bộ dò này KHÔNG tự mô phỏng: mỗi nhánh là một chuỗi hành động của R1 (mỗi nhịp một hành động như bộ dò che-tay: tay đổi tư thế → kẹp / thả → bánh),
   viết thành lệnh gốc rồi CHẤM THẬT bằng ChamHoc.cham (R2 chạy chương trình khóa với man.khoDoiThu). BFS theo nhịp; hai nhánh trùng nhau khi ở cuối nhịp d
   hai robot (ô, hướng, tay, vật đang cầm) và mọi vật giống nhau (R2 là chương trình tất định nên trạng thái đó đủ đại diện cho những gì R2 sẽ làm tiếp).
   Nhánh thua sớm (R2 đã tới cờ) thì bỏ. Đường tìm được luôn là đường THẬT (đã chấm thắng), nên bộ dò không báo nhầm đường tắt; chỉ có thể bỏ sót khi bị cắt ngang.

   Hàm xuất:
     nhipDuaSan(man, i, tuyChon) → { nhip, chuoi, soNhanh, catNgang } của sân i (nhip null: không tìm thấy đường thắng nào ≤ tuyChon.toiDa nhịp)
     nhipDuaTatCa(man, tuyChon)  → tổng nhịp ngắn nhất của từng sân (CẬN DƯỚI ở màn nhiều sân: một chương trình chung không thể nhanh hơn), null nếu có sân không tìm thấy
   tuyChon: toiDa (nhịp tối đa dò, mặc định sao.nhip), toiDaMs (mặc định 20000 mỗi sân).
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chuoiThanhMa } from './do-duong-che-tay.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const Cham = require(path.join(day, 'cham.js'));

const BANH = ['cho', 'tien', 'lui', 'phai', 'trai', 'dau'];
/** Hành động của R1 mỗi nhịp: sáu hiệu quả bánh (tay giữ nguyên), các thao tác tay đứng yên, và nâng tay cùng lúc đi. */
export function hanhDongDua(man) {
  const kq = BANH.map((b) => ({ banh: b }));
  if ((man.hamGoc || []).includes('grab')) {
    kq.push({ tuThe: 'duoi', banh: 'cho' }, { tuThe: 'duoi', kep: 'kep', banh: 'cho' }, { tuThe: 'duoi', kep: 'tha', banh: 'cho' },
      { kep: 'kep', banh: 'cho' }, { kep: 'tha', banh: 'cho' });
    BANH.forEach((b) => kq.push({ tuThe: 'tren', banh: b }));
  }
  return kq;
}

/** Màn chỉ còn sân i (màn nhiều sân: san, batDau của từng robot là mảng song song). Khung nới rộng: chuỗi lệnh gốc dài hơn 10 dòng. */
function conSan(man, i) {
  const nhieu = Array.isArray(man.san[0]);
  const m = Object.assign({}, man, { khung: Object.assign({}, man.khung, { chinh: 999, moiHam: 999 }), gioiHanHam: undefined });
  if (nhieu) {
    m.san = man.san[i];
    m.doi = man.doi.map((d) => Object.assign({}, d, { batDau: Array.isArray(d.batDau) ? d.batDau[i] : d.batDau }));
    m.batDau = m.doi[0].batDau;
    delete m.nhipTheo;
  }
  return m;
}

function chuKy(r, d) {
  const lay = (k) => {
    const v = (r.doi[k] ? r.doi[k].vet : []).filter((e) => e.loai === 'nhip');
    return v.find((e) => e.nhip === d) || v[v.length - 1] || null;
  };
  const a = lay(0), b = lay(1);
  const rb = (e) => (e ? [e.robot.x, e.robot.y, e.robot.huong, e.robot.tay ? e.robot.tay.tuThe + ':' + e.robot.tay.cam : ''].join(',') : '-');
  return rb(a) + '|' + rb(b) + '|' + JSON.stringify(a ? a.vat || [] : []);
}

export function nhipDuaSan(man, i, tuyChon = {}) {
  const m = conSan(man, i), toiDa = tuyChon.toiDa === undefined ? man.sao.nhip : tuyChon.toiDa, toiDaMs = tuyChon.toiDaMs || 20000;
  const HD = hanhDongDua(m), R2 = m.maMau.doi[1].chinh, hamCuaMan = m.maMau.hamCuaMan || [];
  const t0 = Date.now();
  let lop = [[]], soNhanh = 0;
  const thay = new Set();
  for (let d = 1; d <= toiDa; d++) {
    const moi = [];
    for (const seq of lop) {
      for (const a of HD) {
        if (Date.now() - t0 > toiDaMs) return { nhip: null, chuoi: null, soNhanh, catNgang: true };
        const s2 = seq.concat([a]);
        let code;
        try { code = chuoiThanhMa(s2, m.hamGoc).trim().split('\n'); } catch (e) { continue; }
        const r = Cham.cham(m, { doi: [{ chinh: code }, { chinh: R2 }], hamCuaMan }, []);
        soNhanh++;
        if (r.thang && r.soNhip <= d) return { nhip: r.soNhip, chuoi: s2, soNhanh, catNgang: false };
        if (r.chanDoan.some((c) => c.ma === 'doi-thu-thang' && c.nhip <= d)) continue;
        const k = chuKy(r, d);
        if (thay.has(k)) continue;
        thay.add(k);
        moi.push(s2);
      }
    }
    lop = moi;
    if (!lop.length) break;
  }
  return { nhip: null, chuoi: null, soNhanh, catNgang: false };
}

export function nhipDuaTatCa(man, tuyChon = {}) {
  const n = Array.isArray(man.san[0]) ? man.san.length : 1;
  let tong = 0;
  for (let i = 0; i < n; i++) {
    const k = nhipDuaSan(man, i, tuyChon);
    if (k.nhip === null) return null;
    tong += k.nhip;
  }
  return tong;
}

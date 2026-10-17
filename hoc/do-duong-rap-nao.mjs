/* ============================================================================
   do-duong-rap-nao.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `rap-nao` (Lắp ráp: Thân + Não). Dùng trong máy kiểm (kiem-rap-nao.mjs, kiem-hoc.mjs); không nằm trong game.

   Chương này cho người chơi tự chọn THÂN (hai bánh · xích · omni · nhện) và NÃO (cảm biến khoảng cách · màu · camera · không gắn). Cảm biến KHÔNG đổi vật lý (chúng chỉ giúp CHƯƠNG TRÌNH
   quyết định), nên nhịp ngắn nhất để tới cờ chỉ phụ thuộc vào THÂN và sân. Bộ dò này gom bốn thân:
     · hai bánh: BFS theo nhịp trên (ô, hướng, bộ đếm băng chuyền) với chín tổ hợp bánh (tiến, lùi, quay phải, quay trái, quay đầu một nhịp, chờ), y hệt san-hoc.js:
         bậc thang S, gầm n, hàng rào =, tường # chặn; hố u là rơi (thua); băng chuyền: đứng đủ 2 nhịp thì bị đẩy 1 ô;
     · xích · omni · nhện: dùng lại do-duong-xich.mjs · do-duong-omni.mjs · do-duong-nhen.mjs (mỗi bộ dò đã đối chiếu SanHoc.chay ở máy kiểm của chương đó).
   Mục tiêu 'toi-co': thắng khi chạm cờ F. Màn nhiều sân (man.san là mảng sân, batDau và các lớp màu song song): tính TỪNG SÂN rồi cộng lại (nhipTheo 'tong').

   Hàm xuất:
     soSan(man), manCuaSan(man, i)           màn con một sân thứ i
     nhipBanh(man)                           BFS hai bánh cho màn MỘT sân → { nhip, chuoi, soTrangThai } | { nhip: null }
     nhipSan(man, i)                         nhịp ngắn nhất ở sân i theo man.loaiRobot (man đã qua LapRap.apDung) → số | null
     nhipTatCa(man)                          tổng nhịp ngắn nhất mọi sân (null nếu có sân không tới được)
     nhipTheoCach(man, cach)                 apDung(man, cach) rồi nhipTatCa
     chuoiBanhThanhMa(chuoi)                 mã Python của đường BFS hai bánh (để chạy thử bằng SanHoc.chay)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import * as XICH from './do-duong-xich.mjs';
import * as OMNI from './do-duong-omni.mjs';
import * as NHEN from './do-duong-nhen.mjs';
const { nhipXichNganNhat } = XICH, { nhipOmniNganNhat } = OMNI, { nhipNhenNganNhat } = NHEN;

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));

export function soSan(man) { return Array.isArray(man.san[0]) ? man.san.length : 1; }

/** Màn con cho sân thứ i: san, batDau và các lớp màu của đúng sân đó (màn một sân thì giữ nguyên). */
export function manCuaSan(man, i = 0) {
  const nhieu = Array.isArray(man.san[0]);
  if (!nhieu) return man;
  const lm = SanHoc.lopMauCuaSan(man, i);
  return Object.assign({}, man, {
    san: man.san[i],
    batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau,
    mau: lm.mau, vatMau: lm.vatMau, bongMo: undefined
  });
}

/* ------------------------------------------------------------------ hai bánh */
// chín tổ hợp bánh (trái, phải) → { dh: đổi hướng, di: -1 lùi | 0 | +1 tiến }
const HAI_BANH = [];
for (let t = -1; t <= 1; t++) for (let p = -1; p <= 1; p++) {
  let dh = 0, di = 0;
  if (t === 1 && p === 1) di = 1;
  else if (t === -1 && p === -1) di = -1;
  else if ((t === 1 && p === 0) || (t === 0 && p === -1)) dh = 1;
  else if ((t === 0 && p === 1) || (t === -1 && p === 0)) dh = 3;
  else if (t !== p && t * p === -1) dh = 2;
  HAI_BANH.push({ t, p, dh, di });
}
const TEN_HB = (a) => (a.di === 1 ? 'tien' : a.di === -1 ? 'lui' : a.dh === 1 ? 'phai' : a.dh === 3 ? 'trai' : a.dh === 2 ? 'dau' : 'cho');

/** Bộ dò hai bánh có CÙNG giao diện với do-duong-xich / omni / nhen (dungNguCanh, trangThaiDau, hanhDongTuDo, buocMotNhip, laThang) để dùng chung cho BFS và cho phép thử chương trình mù. */
export const BANH = {
  dungNguCanh(man) {
    const san = SanHoc.docSan(man.san);
    const chan = (x, y) => { const c = san.o[y] && san.o[y][x]; return c === undefined || !!SanHoc.lyDoChan(san, 'banh', x, y) || 'oXHhC'.includes(c); };
    return { san, chan, bd: man.batDau };
  },
  trangThaiDau(ctx) { return { x: ctx.bd.x, y: ctx.bd.y, h: ctx.bd.huong || 0, d: 0 }; },
  hanhDongTuDo() { return HAI_BANH; },
  /** Một nhịp: trạng thái mới, hay null nếu xe rơi xuống hố. */
  buocMotNhip(ctx, S, a) {
    let { x, y, h, d } = S;
    if (a.di) {
      const v = SanHoc.VEC[h];
      const nx = x + a.di * v[0], ny = y + a.di * v[1];
      if (!ctx.chan(nx, ny)) { x = nx; y = ny; }
    } else h = (h + a.dh) % 4;
    const o = ctx.san.o[y][x];
    if (SanHoc.BANG[o] !== undefined) {
      d++;
      if (d >= 2) {
        const v = SanHoc.VEC[SanHoc.BANG[o]];
        if (!ctx.chan(x + v[0], y + v[1])) { x += v[0]; y += v[1]; }
        d = 0;
      }
    } else d = 0;
    if (ctx.san.o[y][x] === 'u') return null;                                // rơi xuống hố: thua
    return { x, y, h, d };
  },
  laThang(ctx, S) { return ctx.san.o[S.y][S.x] === 'F'; }
};

/** BFS hai bánh theo nhịp cho màn MỘT sân (mục tiêu tới cờ). Trả { nhip, chuoi (mảng 'tien' | 'lui' | 'phai' | 'trai' | 'dau' | 'cho'), soTrangThai }. */
export function nhipBanh(man) {
  const ctx = BANH.dungNguCanh(man);
  const khoa = (s) => s.x + ',' + s.y + ',' + s.h + ',' + s.d;
  const dau = Object.assign(BANH.trangThaiDau(ctx), { cha: null, a: null });
  let lop = [dau];
  const thay = new Set([khoa(dau)]);
  for (let b = 1; b <= 400 && lop.length; b++) {
    const tiep = [];
    for (const s of lop) {
      for (const a of HAI_BANH) {
        const N = BANH.buocMotNhip(ctx, s, a);
        if (!N) continue;
        const n = Object.assign(N, { cha: s, a });
        if (BANH.laThang(ctx, n)) {
          const chuoi = [];
          for (let c = n; c.cha; c = c.cha) chuoi.push(TEN_HB(c.a));
          return { nhip: b, chuoi: chuoi.reverse(), soTrangThai: thay.size };
        }
        if (!thay.has(khoa(n))) { thay.add(khoa(n)); tiep.push(n); }
      }
    }
    lop = tiep;
  }
  return { nhip: null, chuoi: null, soTrangThai: thay.size };
}
const MA_HB = { tien: 'left_move()\nright_move()\n', lui: 'left_back()\nright_back()\n', phai: 'left_move()\n', trai: 'right_move()\n', dau: 'left_move()\nright_back()\n', cho: '' };
export function chuoiBanhThanhMa(chuoi) { return chuoi.map((a) => MA_HB[a] + 'wait()\n').join(''); }

/* ------------------------------------------------------------------- gom lại */
/** Nhịp ngắn nhất ở sân i, theo loaiRobot của man (banh · xich · omni · nhen). */
export function nhipSan(man, i = 0) {
  const con = manCuaSan(man, i);
  const loai = man.loaiRobot || 'banh';
  if (loai === 'banh') return nhipBanh(con).nhip;
  if (loai === 'xich') return nhipXichNganNhat(con).nhip;
  if (loai === 'omni') return nhipOmniNganNhat(con).nhip;
  if (loai === 'nhen') return nhipNhenNganNhat(con).nhip;
  throw new Error('do-duong-rap-nao: chưa có bộ dò cho thân "' + loai + '"');
}
export function nhipTatCa(man) {
  let tong = 0;
  for (let i = 0; i < soSan(man); i++) {
    const k = nhipSan(man, i);
    if (k === null) return null;
    tong += k;
  }
  return tong;
}
export function nhipTheoCach(man, cach) { return nhipTatCa(LapRap.apDung(man, cach)); }

/** Tên bộ dò theo loại robot (cùng giao diện: dungNguCanh · trangThaiDau · hanhDongTuDo · buocMotNhip · laThang). */
const BO_DO = { banh: BANH, xich: XICH, omni: OMNI, nhen: NHEN };

/**
 * CHƯƠNG TRÌNH "MÙ": robot không có cảm biến thì chương trình chính chỉ là một DÃY lệnh cố định (không rẽ nhánh theo sân). Với màn nhiều sân, một dãy hành động
 * thắng cả ba sân phải đưa MỌI sân tới cờ (sân thắng rồi thì xong, các sân còn lại vẫn chạy tiếp cùng dãy ấy). BFS đồng bộ trên bộ ba trạng thái, tối đa toiDa nhịp.
 * Chỉ xét hành động bánh / bước (không tay). Trả { thang, nhip, soTrangThai, catNgang }: thang = có dãy mù nào thắng cả ba sân không.
 */
export function chuongTrinhMuThang(man, toiDa = 60, giuHan = 600000) {
  const loai = man.loaiRobot || 'banh', B = BO_DO[loai];
  if (!B) throw new Error('do-duong-rap-nao: chưa có bộ dò cho thân "' + loai + '"');
  const n = soSan(man);
  const ctxs = [];
  for (let i = 0; i < n; i++) ctxs.push(B.dungNguCanh(manCuaSan(man, i)));
  const HD = B.hanhDongTuDo(ctxs[0]);
  const dau = ctxs.map((c) => ({ S: B.trangThaiDau(c), xong: false }));
  const khoa = (v) => JSON.stringify(v.map((e) => (e.xong ? 0 : e.S)));
  let lop = [dau];
  const thay = new Set([khoa(dau)]);
  for (let nhip = 1; nhip <= toiDa && lop.length; nhip++) {
    const tiep = [];
    for (const v of lop) {
      for (const a of HD) {
        const w = [];
        let tatCa = true;
        for (let i = 0; i < n; i++) {
          if (v[i].xong) { w.push(v[i]); continue; }
          const N = B.buocMotNhip(ctxs[i], v[i].S, a);
          if (!N) { w.push(null); tatCa = false; break; }                  // rơi hố: dãy này thua ở sân i
          const xong = B.laThang(ctxs[i], N);
          w.push({ S: N, xong });
          if (!xong) tatCa = false;
        }
        if (w.includes(null)) continue;
        if (tatCa) return { thang: true, nhip, soTrangThai: thay.size, catNgang: false };
        const k = khoa(w);
        if (thay.has(k)) continue;
        if (thay.size >= giuHan) return { thang: false, nhip: null, soTrangThai: thay.size, catNgang: true };
        thay.add(k); tiep.push(w);
      }
    }
    lop = tiep;
  }
  return { thang: false, nhip: null, soTrangThai: thay.size, catNgang: false };
}

/**
 * Chương trình mù TỐT NHẤT: tổng nhịp ít nhất (nhipTheo 'tong' = cộng thời điểm thắng của từng sân) của một dãy hành động cố định thắng cả ba sân.
 * Dijkstra theo bậc thang chi phí: mỗi nhịp tốn đúng số sân chưa thắng. Trả { tong, nhip (độ dài dãy), soTrangThai, catNgang } (tong null nếu không có dãy nào trong toiDa nhịp / giuHan trạng thái).
 */
export function chuongTrinhMuTotNhat(man, toiDa = 150, giuHan = 900000) {
  let best = null;
  const loai = man.loaiRobot || 'banh', B = BO_DO[loai];
  if (!B) throw new Error('do-duong-rap-nao: chưa có bộ dò cho thân "' + loai + '"');
  const n = soSan(man);
  const ctxs = [];
  for (let i = 0; i < n; i++) ctxs.push(B.dungNguCanh(manCuaSan(man, i)));
  const HD = B.hanhDongTuDo(ctxs[0]);
  const khoa = (v) => JSON.stringify(v.map((e) => (e.xong ? 0 : e.S)));
  const dau = ctxs.map((c) => ({ S: B.trangThaiDau(c), xong: false }));
  const tot = new Map([[khoa(dau), 0]]);
  const xo = [[{ v: dau, d: 0 }]];                                           // xo[c] = các trạng thái tốn c
  let catNgang = false;
  for (let c = 0; c < xo.length; c++) {
    const lop = xo[c] || [];
    for (const e of lop) {
      const k = khoa(e.v);
      if (tot.get(k) !== c) continue;                                        // đã có đường rẻ hơn
      if (e.d >= toiDa) continue;
      const chua = e.v.filter((x) => !x.xong).length;
      for (const a of HD) {
        const w = [];
        let roi = false, tatCa = true;
        for (let i = 0; i < n; i++) {
          if (e.v[i].xong) { w.push(e.v[i]); continue; }
          const N = B.buocMotNhip(ctxs[i], e.v[i].S, a);
          if (!N) { roi = true; break; }
          const xong = B.laThang(ctxs[i], N);
          w.push({ S: N, xong });
          if (!xong) tatCa = false;
        }
        if (roi) continue;
        const cc = c + chua;                                                  // sân đang chạy tốn một nhịp (kể cả sân thắng ở chính nhịp này)
        if (tatCa) {
          // thắng cả ba: tổng nhịp là cc; tìm min qua mọi hành động còn lại ở bậc cc (Dijkstra thật: ghi nhận ứng viên tốt nhất)
          if (best === null || cc < best.tong) best = { tong: cc, nhip: e.d + 1 };
          continue;
        }
        const k2 = khoa(w);
        if (tot.has(k2) && tot.get(k2) <= cc) continue;
        if (tot.size >= giuHan) { catNgang = true; continue; }
        tot.set(k2, cc);
        (xo[cc] = xo[cc] || []).push({ v: w, d: e.d + 1 });
      }
    }
    if (best !== null && c >= best.tong) break;
  }
  return { tong: best ? best.tong : null, nhip: best ? best.nhip : null, soTrangThai: tot.size, catNgang };
}

/** Cho kiem-hoc.mjs: nhịp ngắn nhất của màn (đã gắn robot mặc định = cachLap[0]), mọi sân cộng lại. */
export function nhipRapNaoTatCa(man) { return nhipTatCa(man); }

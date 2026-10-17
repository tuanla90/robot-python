/* ============================================================================
   do-duong-che-drone.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `che-drone` (DRONE, loaiRobot 'drone'; mục tiêu 'bong-mo' hoặc 'toi-co'; có thể có pin, ô sạc P, nam châm treo, vật sắt / gỗ).
   Dùng trong máy kiểm (kiem-che-drone.mjs, kiem-hoc.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô drone, pin còn lại, nam châm bật hay tắt, vị trí từng vật, tập ô ◆ đã qua). Luật y hệt san-hoc.js (phần DRONE, BÓNG MỜ):
     - Một HÀNH ĐỘNG = lệnh nam châm (không | bật | tắt) × lệnh bay (đứng yên | lên | phải | xuống | trái). Thứ tự trong nhịp: (a) lệnh nam châm (tắt = thả xuống ô DƯỚI drone nếu ô đó nhận được)
       → (b) bay (tường cao / mép sân chặn; hàng rào, băng chuyền, vật, thùng, bậc thang thì bay qua) → (c) HÚT vật sắt ở ô dưới drone → (d) tốn 1 pin; đứng trên ô sạc P thì pin đầy
       → (e) ◆: cuối nhịp drone đứng ở ô đó thì ô đã qua → (f) pin về 0 mà chưa thắng thì rơi (bỏ trạng thái đó).
     - PHẦN CỨNG của màn (man.phanCung; mặc định = trọn bộ lệnh drone + khay) quyết định hướng bay và lệnh nam châm làm được: màn "cánh hỏng" (thiếu go_down…) có ít hành động hơn.
     - Mục tiêu 'bong-mo' thắng khi chương trình CHẠY XONG: drone đúng ô bóng mờ (drone không có hướng mặt nên bỏ huong), đã qua mọi ô ◆, vật đúng ô vật mờ (bongMo.vat), đang dính vật khi bongMo.cam.
       Vì thắng xét ở CUỐI chương trình nên nhịp pin về 0 (kể cả nhịp cuối) là rơi: nhịp đó drone không đứng trên ô sạc thì trạng thái bị bỏ. Mục tiêu 'toi-co': chạm cờ F (đến cờ đúng nhịp pin về 0 vẫn thắng).
     - Màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (che-drone.7: go_out() của màn): nhipCheDroneTatCa chạy thật đoạn đó rồi BFS từ trạng thái sau nó.
   BFS CÓ GIỚI HẠN: tuyChon.toiDaTrangThai (mặc định 600000) và tuyChon.toiDaMs (mặc định 20000); vượt thì trả { nhip: null, catNgang: true }.

   Hàm xuất:
     dungNguCanh(man, tuyChon)              → ngữ cảnh (sân, chặn, thả được, sạc, ◆, bóng mờ, hành động cho phép)
     trangThaiDau(ctx, batDau?)             → trạng thái xuất phát (batDau: { x, y, pin?, bat?, pos?, mask? } nếu xuất phát khác man.batDau)
     buocMotNhip(ctx, S, a)                 → trạng thái mới (có .roi = true nếu hết pin mà chưa thắng) để so chéo với SanHoc.chay
     laThang(ctx, S)                        → đạt mục tiêu chưa (bong-mo: lúc chạy xong)
     nhipCheDroneNganNhat(man, tuyChon)     → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }   (man MỘT sân)
     nhipCheDroneTatCa(man, hamCuaEm, tuyChon) → TỔNG nhịp ngắn nhất mọi sân (null nếu có sân không giải được), tính cả đoạn cố định gọi hàm khóa của màn
     chuoiThanhMa(chuoi)                    → mã Python lệnh gốc của đường (mỗi hành động: lệnh nam châm rồi lệnh bay, hay wait() nếu đứng yên)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

export const TEN_LENH = ['go_up', 'go_right', 'go_down', 'go_left'];   // hướng 0..3

/** Hành động cho phép theo PHẦN CỨNG: hướng bay làm được và lệnh nam châm có (bật = magnet_n hay magnet_s; tắt = magnet_off). */
export function hanhDongChoPhep(man, ctxVat0) {
  const pc = SanHoc.phanCungCua(man);
  const bay = [-1];
  for (let b = 0; b <= 3; b++) if (pc.includes(TEN_LENH[b])) bay.push(b);
  const ncs = [null];
  if (ctxVat0) {
    if (pc.includes('magnet_n') || pc.includes('magnet_s')) ncs.push('on');
    if (pc.includes('magnet_off')) ncs.push('off');
  }
  const ds = [];
  for (const nc of ncs) for (const b of bay) ds.push({ nc, bay: b });
  return ds;
}

/** Dựng ngữ cảnh từ một màn MỘT sân. */
export function dungNguCanh(man, tuyChon = {}) {
  if ((man.loaiRobot || 'drone') !== 'drone') throw new Error('Bộ dò drone chỉ biết drone.');
  const san = SanHoc.docSan(man.san, man.mau, man.vatMau, man.vatChat);
  if (san.cua.length || san.nut.length) throw new Error('Bộ dò drone chưa hỗ trợ cửa và nút.');
  const rong = san.rong, cao = san.cao;
  const o = (x, y) => y * rong + x;
  const chan = new Uint8Array(rong * cao), khongTha = new Uint8Array(rong * cao);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) {
    chan[o(x, y)] = SanHoc.lyDoChan(san, 'drone', x, y) ? 1 : 0;
    const c = san.o[y][x];
    khongTha[o(x, y)] = c === '=' || c === 'S' || c === '#' ? 1 : 0;
  }
  for (const t of san.thung) khongTha[o(t.x, t.y)] = 1;
  const dich = new Uint8Array(rong * cao), sac = new Uint8Array(rong * cao);
  for (const d of san.dich) dich[o(d.x, d.y)] = 1;
  for (const s of san.sac) sac[o(s.x, s.y)] = 1;
  const ma = (m) => (m ? SanHoc.MAU_TEN.indexOf(m) + 1 : 0);
  const mauDich = new Uint8Array(rong * cao);
  for (const d of san.dich) mauDich[o(d.x, d.y)] = ma(d.mau);
  const dsVat = san.vat.slice();
  for (const e of man.vatThem || []) if (!dsVat.some((v) => v.x === e.x && v.y === e.y)) dsVat.push(e);
  const mauVat = dsVat.map((v) => ma(v.mau));
  const sat = dsVat.map((v) => (v.chat === 'sat' ? 1 : 0));
  const can = dsVat.map((v, i) => (man.vatCan === 'sat' ? sat[i] === 1 : true));
  const pinToiDa = man.pin === undefined || man.pin === null ? -1 : man.pin;
  const mucTieu = man.mucTieu || 'toi-co';
  const bm = mucTieu === 'bong-mo' ? man.bongMo : null;
  const diQua = bm && bm.diQua ? bm.diQua.map((q) => o(q.x, q.y)) : [];
  const hanhDong = hanhDongChoPhep(man, dsVat.length > 0 || (bm && bm.cam));
  return { san, rong, cao, o, chan, khongTha, dich, sac, mauDich, mauVat, sat, can, pinToiDa, mucTieu, bm, diQua, hanhDong,
    co: san.co ? o(san.co.x, san.co.y) : -1, vat0: dsVat.map((v) => o(v.x, v.y)), bd: man.batDau, lop: dsVat.map((v, i) => sat[i] * 8 + mauVat[i]) };
}

export function trangThaiDau(ctx, batDau) {
  const b = batDau || ctx.bd;
  return { x: b.x, y: b.y, pin: b.pin !== undefined ? b.pin : ctx.pinToiDa, bat: b.bat || 0, pos: b.pos ? b.pos.slice() : ctx.vat0.slice(), mask: b.mask || 0, roi: false };
}

const trong = (ctx, x, y) => x >= 0 && y >= 0 && x < ctx.rong && y < ctx.cao;

/** Một nhịp. a = { nc: null|'on'|'off', bay: -1|0..3 }. Trả bản sao; .roi = true nếu hết pin mà chưa thắng. */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, pin: S.pin, bat: S.bat, pos: S.pos.slice(), mask: S.mask, roi: false };
  const { rong } = ctx;
  if (a.nc === 'on') N.bat = 1;
  else if (a.nc === 'off') {
    const i = N.pos.indexOf(-1);
    if (i < 0) N.bat = 0;
    else {
      const c = N.y * rong + N.x;
      if (!ctx.khongTha[c] && N.pos.indexOf(c) < 0) { N.pos[i] = c; N.bat = 0; }
    }
  }
  if (a.bay >= 0) {
    const v = SanHoc.VEC[a.bay], nx = N.x + v[0], ny = N.y + v[1];
    if (trong(ctx, nx, ny) && !ctx.chan[ny * rong + nx]) { N.x = nx; N.y = ny; }
  }
  if (N.bat && N.pos.indexOf(-1) < 0) {                       // hút: vật ở ô NGAY DƯỚI drone, chỉ vật sắt
    const i = N.pos.indexOf(N.y * rong + N.x);
    if (i >= 0 && ctx.sat[i]) N.pos[i] = -1;
  }
  if (N.pin >= 0) {
    N.pin--;
    if (ctx.sac[N.y * rong + N.x]) N.pin = ctx.pinToiDa;
  }
  const dq = ctx.diQua.indexOf(N.y * rong + N.x);
  if (dq >= 0) N.mask |= (1 << dq);
  // bong-mo: thắng xét ở CUỐI chương trình nên pin về 0 giữa chừng (kể cả nhịp cuối) là rơi; toi-co: đến cờ đúng nhịp pin về 0 vẫn thắng
  if (N.pin === 0 && (ctx.mucTieu === 'bong-mo' || !laThang(ctx, N))) N.roi = true;
  return N;
}

export function laThang(ctx, S) {
  if (ctx.mucTieu === 'toi-co') return S.y * ctx.rong + S.x === ctx.co;
  if (ctx.mucTieu === 'bong-mo') {
    const bm = ctx.bm;
    if (S.x !== bm.x || S.y !== bm.y) return false;
    if (S.mask !== (1 << ctx.diQua.length) - 1) return false;
    const dsVat = bm.vat || [], camBM = !!bm.cam;
    const dangCam = S.pos.filter((p) => p === -1).length;
    if (camBM && dangCam < 1) return false;
    if (dsVat.length || camBM) {
      const dat = S.pos.filter((p) => p >= 0);
      if (dat.length + (camBM ? 1 : 0) !== S.pos.length || dat.length !== dsVat.length) return false;
      if (!dsVat.every((q) => dat.includes(q.y * ctx.rong + q.x))) return false;
    }
    return true;
  }
  let coCan = false;
  for (let i = 0; i < S.pos.length; i++) {
    if (!ctx.can[i]) continue;
    coCan = true;
    const p = S.pos[i];
    if (p < 0 || !ctx.dich[p] || !(ctx.mauDich[p] === 0 || ctx.mauDich[p] === ctx.mauVat[i])) return false;
  }
  return coCan;
}

function khoa(ctx, S) {
  const nhom = {};
  S.pos.forEach((p, i) => { (nhom[ctx.lop[i]] = nhom[ctx.lop[i]] || []).push(p + 1); });
  let k = S.x + ',' + S.y + ',' + S.pin + ',' + S.bat + ',' + S.mask;
  for (const lop of Object.keys(nhom).sort((a, b) => a - b)) k += '|' + nhom[lop].sort((a, b) => a - b).join(',');
  return k;
}

export function nhipCheDroneNganNhat(man, tuyChon = {}) {
  const ctx = dungNguCanh(man, tuyChon);
  const toiDa = tuyChon.toiDaTrangThai === undefined ? 600000 : tuyChon.toiDaTrangThai;
  const toiDaMs = tuyChon.toiDaMs === undefined ? 20000 : tuyChon.toiDaMs;
  const t0 = Date.now();
  const dau = trangThaiDau(ctx, tuyChon.batDau);
  if (laThang(ctx, dau)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const thay = new Set([khoa(ctx, dau)]);
  const kho = [dau], cha = [-1], act = [null];
  let i = 0, nhip = 0;
  while (i < kho.length) {
    nhip++;
    const cuoiLop = kho.length;
    for (; i < cuoiLop; i++) {
      if ((i & 255) === 0 && Date.now() - t0 >= toiDaMs) return { nhip: null, soTrangThai: kho.length, catNgang: true, chuoi: null };
      const S = kho[i];
      for (const a of ctx.hanhDong) {
        const N = buocMotNhip(ctx, S, a);
        if (N.roi) continue;
        const k = khoa(ctx, N);
        if (thay.has(k)) continue;
        thay.add(k);
        cha.push(i); act.push(a); kho.push(N);
        if (laThang(ctx, N)) {
          const chuoi = [];
          for (let j = kho.length - 1; j > 0; j = cha[j]) chuoi.push(act[j]);
          return { nhip, soTrangThai: kho.length, catNgang: false, chuoi: chuoi.reverse() };
        }
        if (kho.length > toiDa) return { nhip: null, soTrangThai: kho.length, catNgang: true, chuoi: null };
      }
    }
  }
  return { nhip: null, soTrangThai: kho.length, catNgang: false, chuoi: null };
}

/**
 * TỔNG nhịp ngắn nhất trên mọi sân của màn (màn nhiều sân: man.san là mảng sân; batDau / pin / bongMo / mau… song song nếu là mảng).
 * Màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (che-drone.7: go_out() của màn, hàm khóa man.khoaHamMan) thì tính:
 * nhịp của đoạn đó (chạy thật với kho hamCuaEm) + BFS từ trạng thái sau nó (drone, pin, vật, ô ◆ đã qua).
 */
export function nhipCheDroneTatCa(man, hamCuaEm, tuyChon = {}) {
  const khoaTen = man.khoaHamMan || [], chinh = man.chinhCoDinh && man.maMau ? man.maMau.chinh : [];
  let n = 0;
  while (n < chinh.length && khoaTen.some((t) => chinh[n].trim() === t + '()')) n++;
  const nhieu = Array.isArray(man.san[0]);
  const dsSan = nhieu ? man.san : [man.san];
  if (!n) {
    let tong = 0;
    dsSan.forEach((rows, i) => {
      const lm = SanHoc.lopMauCuaSan(man, i);
      const con = Object.assign({}, man, { san: rows, batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau, mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vatThem: lm.vatThem,
        pin: Array.isArray(man.pin) ? man.pin[i] : man.pin, bongMo: lm.bongMo || man.bongMo });
      const k = nhipCheDroneNganNhat(con, tuyChon).nhip;
      tong = tong === null || k === null ? null : tong + k;
    });
    return tong;
  }
  if (dsSan.length > 1) throw new Error('Đoạn cố định + nhiều sân chưa hỗ trợ.');
  const ChamHoc = require(path.join(day, 'cham.js'));
  const pre = ChamHoc.cham(Object.assign({}, man, { chinhCoDinh: false }), { chinh: chinh.slice(0, n), hamCuaMan: man.maMau.hamCuaMan }, hamCuaEm);
  if (!pre.theoSan.length || !pre.vet.length || pre.chanDoan.some((c) => c.ma === 'ham-chua-co' || c.ma === 'loi-chay')) throw new Error('Đoạn cố định của ' + man.ma + ' chạy lỗi.');
  const r = pre.theoSan[0], rong = SanHoc.docSan(man.san, man.mau, man.vatMau, man.vatChat).rong;
  let mask = 0;
  (r.diQua || []).forEach((q, i) => { if (q.da) mask |= (1 << i); });
  const pos = r.vat.map((v) => (v.trangThai === 'dat' ? v.y * rong + v.x : -1));
  const b = nhipCheDroneNganNhat(man, Object.assign({}, tuyChon, { batDau: { x: r.robot.x, y: r.robot.y, pin: r.pin === null || r.pin === undefined ? undefined : r.pin, bat: r.namCham && r.namCham.bat ? 1 : 0, pos, mask } }));
  return b.nhip === null ? null : r.soNhip + b.nhip;
}

/** Chuỗi hành động → mã Python lệnh gốc: mỗi hành động là (lệnh nam châm rồi) lệnh bay, hay wait() nếu đứng yên. */
export function chuoiThanhMa(chuoi) {
  const dong = [];
  for (const a of chuoi) {
    if (a.nc === 'on') dong.push('magnet_n()'); else if (a.nc === 'off') dong.push('magnet_off()');
    dong.push(a.bay >= 0 ? TEN_LENH[a.bay] + '()' : 'wait()');
  }
  return dong.join('\n') + '\n';
}

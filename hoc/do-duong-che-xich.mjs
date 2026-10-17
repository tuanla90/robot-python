/* ============================================================================
   do-duong-che-xich.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `che-xich` (xe BÁNH XÍCH, loaiRobot 'xich', mục tiêu 'bong-mo' hoặc 'toi-co'; có thể gắn tay kẹp).
   Dùng trong máy kiểm (kiem-che-xich.mjs, kiem-hoc.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô, hướng, phần quay dở, tư thế tay, vật đang cầm, vị trí các vật nằm đất, tập ô ◆ đã qua). Luật y hệt san-hoc.js (phần 'xich'):
     - Mỗi nhịp chọn tổ hợp bánh THẬT (trái, phải) ∈ {-1,0,1}². (1,1) tiến, (-1,-1) lùi, (0,0) đứng yên.
       Sáu tổ hợp quay ((1,0) (0,-1) (1,-1) quay phải; (0,1) (-1,0) (-1,1) quay trái): lần đầu chỉ "nhích nửa vòng" (phần quay dở = tổ hợp đó);
       nhịp kế CÙNG tổ hợp thì quay đủ 90°; nhịp kế khác tổ hợp thì phần quay dở mất. Không có quay đầu 180° trong một nhịp.
     - Tổ hợp làm được do PHẦN CỨNG của màn quyết định (man.phanCung; mặc định xe xích có đủ left_move, right_move, left_back, right_back, wait), KHÔNG phải khay:
       hàm của em gọi được mọi lệnh phần cứng. Màn hỏng khai phanCung hẹp hơn nên ít tổ hợp hơn. daoChieu ['trai'] / ['phai'] (đấu dây ngược) đảo dấu giá trị THẬT của bánh đó
       (lệnh left_move() làm bánh trái quay lùi): bộ dò tính theo giá trị THẬT, chuoiThanhMa đổi lại thành lệnh người chơi gọi.
     - Tay hạ ('duoi') thì lệnh bánh của nhịp bị bỏ (tay vướng) và phần quay dở mất. Băng chuyền KHÔNG đẩy được xích; bậc thang S đi như sàn.
     - Vật nằm đất chiếm ô; grab / release làm ở Ô TRƯỚC MẶT; release chỉ đặt được xuống ô SÀN trống (không phải S, tường, vật khác); thả khi tay nâng thì vật vỡ (bỏ nhánh này).
   Mục tiêu 'bong-mo': xe đúng tư thế bóng mờ SAU KHI đã qua mọi ô ◆ (qua = cuối một nhịp đứng ở ô đó), vật nằm đúng các ô vật mờ (nếu khai), tay cầm đúng khi bongMo.cam;
   phần quay dở lúc xong KHÔNG cản (hướng chưa đổi). Mục tiêu 'toi-co': chạm cờ F. 'dua-vat': mọi vật nằm trên ô đích.
   Màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (che-xich.7: to_hill() của màn): nhipCheXichTatCa chạy thật đoạn đó rồi BFS từ trạng thái sau nó.

   Hàm xuất:
     toHopChoPhep(man, tuyChon)          → các tổ hợp bánh THẬT [t, p] mà phần cứng cho phép
     dungNguCanh(man, tuyChon)           → ngữ cảnh (sân, chặn, vật, ◆, bóng mờ, hành động)
     trangThaiDau(ctx, batDau?)          → trạng thái xuất phát (batDau: { x, y, huong, vat?, tuThe?, cam?, daQua? } nếu xuất phát khác man.batDau)
     buocMotNhip(ctx, S, a)              → trạng thái mới (để so chéo với SanHoc.chay)
     laThang(ctx, S)                     → đạt mục tiêu chưa (bong-mo: lúc chạy xong)
     nhipCheXichNganNhat(man, tuyChon)   → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }     (man MỘT sân)
     nhipCheXichTatCa(man, hamCuaEm, tuyChon) → tổng nhịp mọi sân (null nếu có sân không giải được), tính cả đoạn cố định gọi hàm khóa của màn
     chuoiThanhMa(chuoi, man)            → mã Python lệnh gốc của đường (đúng daoChieu của màn) để kiểm chéo với SanHoc.chay
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

/** Các tổ hợp bánh THẬT [t, p] mà phần cứng + daoChieu của màn cho phép (luôn có [0, 0]). */
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
  const kq = [];
  for (const t of ts) for (const p of ps) kq.push([t, p]);
  return kq;
}

const khoaBanh = (t, p) => t + ',' + p;

/** Dựng ngữ cảnh từ một màn MỘT sân. tuyChon.phanCung / daoChieu ghi đè (để thử phần cứng khác). */
export function dungNguCanh(man, tuyChon = {}) {
  const san = SanHoc.docSan(man.san, man.mau, man.vatMau, man.vatChat);
  const rong = san.rong, cao = san.cao;
  const o = (x, y) => y * rong + x;
  const chan = new Uint8Array(rong * cao), datDuoc = new Uint8Array(rong * cao);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) {
    chan[o(x, y)] = SanHoc.lyDoChan(san, 'xich', x, y) || san.o[y][x] === 'u' ? 1 : 0;
    datDuoc[o(x, y)] = '#N=Snu'.includes(san.o[y][x]) ? 0 : 1;      // ô thả được vật (oThaChan của san-hoc.js): không phải tường, nút, rào, bậc thang S, gầm, hố (vật khác thì xét lúc thả)
  }
  const dich = new Uint8Array(rong * cao);
  for (const d of san.dich) dich[o(d.x, d.y)] = 1;
  const co = san.co ? o(san.co.x, san.co.y) : -1;
  const hamGoc = man.hamGoc || SanHoc.HAM_GOC.xich;
  const coTay = hamGoc.some((t) => SanHoc.TAY_LENH.indexOf(t) >= 0);
  const mucTieu = man.mucTieu || 'toi-co';
  const bm = mucTieu === 'bong-mo' ? man.bongMo : null;
  const diQua = bm && bm.diQua ? bm.diQua.map((q) => o(q.x, q.y)) : [];
  const bd = tuyChon.batDau || man.batDau;
  const toHop = toHopChoPhep(man, tuyChon);
  const hanhDong = [];
  const tuThes = coTay ? [null, 'duoi', 'tren'] : [null], keps = coTay ? [null, 'kep', 'tha'] : [null];
  for (const tuThe of tuThes) for (const kep of keps) for (const b of toHop) hanhDong.push({ tuThe, kep, banh: b });
  return { san, rong, cao, o, chan, datDuoc, dich, co, coTay, mucTieu, bm, diQua, bd, toHop, hanhDong, vat0: san.vat.map((v) => o(v.x, v.y)) };
}

/** Trạng thái xuất phát. q: chỉ số khoá của phần quay dở ('t,p') hay '' nếu không có. pos: ô của từng vật (-1 đang cầm, -2 đã vỡ). */
export function trangThaiDau(ctx, batDau) {
  const b = batDau || ctx.bd;
  return {
    x: b.x, y: b.y, h: b.huong || 0, q: b.q || '', t: b.tuThe === 'duoi' ? 1 : 0,
    pos: b.pos ? b.pos.slice() : ctx.vat0.slice(), mask: b.mask || 0
  };
}

const ngoai = (ctx, x, y) => x < 0 || y < 0 || x >= ctx.rong || y >= ctx.cao || ctx.chan[y * ctx.rong + x];

/** Một nhịp. a = { tuThe: null|'duoi'|'tren', kep: null|'kep'|'tha', banh: [t, p] } (t, p là giá trị THẬT của hai bánh). */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, h: S.h, q: S.q, t: S.t, pos: S.pos.slice(), mask: S.mask };
  const { rong } = ctx;
  if (a.tuThe === 'duoi') N.t = 1; else if (a.tuThe === 'tren') N.t = 0;
  const vf = SanHoc.VEC[N.h], fx = N.x + vf[0], fy = N.y + vf[1];
  const front = (fx >= 0 && fy >= 0 && fx < ctx.rong && fy < ctx.cao) ? fy * rong + fx : -1;     // ô trước mặt
  const cam = N.pos.indexOf(-1);
  if (a.kep === 'kep') {
    if (cam < 0) {
      const i = front >= 0 ? N.pos.indexOf(front) : -1;
      if (i >= 0 && N.t === 1) N.pos[i] = -1;
    }
  } else if (a.kep === 'tha') {
    if (cam >= 0) {
      if (N.t === 0) N.pos[cam] = -2;                                                    // thả khi tay nâng: vỡ
      else if (front >= 0 && ctx.datDuoc[front] && N.pos.indexOf(front) < 0) N.pos[cam] = front;       // thả không được thì vật vẫn ở tay
    }
  }
  const [t, p] = a.banh, kh = khoaBanh(t, p);
  const q = SanHoc.XICH_QUAY[kh] || 0;
  if (ctx.coTay && N.t === 1 && (t !== 0 || p !== 0)) {                                  // tay vướng sàn: bánh không chạy, quay dở mất
    N.q = '';
  } else if (q === 0) {
    N.q = '';
    if (t === 1 && p === 1) { const nx = N.x + vf[0], ny = N.y + vf[1]; if (!ngoai(ctx, nx, ny) && N.pos.indexOf(ny * rong + nx) < 0) { N.x = nx; N.y = ny; } }
    else if (t === -1 && p === -1) { const nx = N.x - vf[0], ny = N.y - vf[1]; if (!ngoai(ctx, nx, ny) && N.pos.indexOf(ny * rong + nx) < 0) { N.x = nx; N.y = ny; } }
  } else if (S.q === kh) { N.h = (N.h + (q > 0 ? 1 : 3)) % 4; N.q = ''; }
  else N.q = kh;
  const dq = ctx.diQua.indexOf(N.y * rong + N.x);                                        // ◆: cuối nhịp xe đứng ở ô đó
  if (dq >= 0) N.mask |= (1 << dq);
  return N;
}

/** Đạt mục tiêu chưa. bong-mo: xét lúc chương trình CHẠY XONG (trạng thái này là cuối nhịp). */
export function laThang(ctx, S) {
  if (ctx.mucTieu === 'toi-co') return S.y * ctx.rong + S.x === ctx.co;
  if (ctx.mucTieu === 'dua-vat') return S.pos.length > 0 && S.pos.every((p) => p >= 0 && ctx.dich[p]);
  const bm = ctx.bm;
  if (S.x !== bm.x || S.y !== bm.y || S.h !== bm.huong) return false;
  if (S.mask !== (1 << ctx.diQua.length) - 1) return false;
  const camBM = !!bm.cam, dsVat = bm.vat || [];
  if (dsVat.length || camBM) {
    const dat = S.pos.filter((p) => p >= 0), dangCam = S.pos.filter((p) => p === -1).length;
    if (S.pos.some((p) => p === -2)) return false;
    if (dat.length + (camBM ? 1 : 0) !== S.pos.length || dat.length !== dsVat.length) return false;
    if (camBM && dangCam !== 1) return false;
    if (!dsVat.every((q) => dat.includes(q.y * ctx.rong + q.x))) return false;
  }
  return true;
}

function khoaTT(ctx, S) {
  return S.x + ',' + S.y + ',' + S.h + ',' + S.q + ',' + S.t + ',' + S.mask + ',' + S.pos.join('.');
}

export function nhipCheXichNganNhat(man, tuyChon = {}) {
  const ctx = dungNguCanh(man, tuyChon);
  const toiDa = tuyChon.toiDaTrangThai || 3000000;
  const dau = trangThaiDau(ctx, tuyChon.batDau);
  if (laThang(ctx, dau)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const thay = new Set([khoaTT(ctx, dau)]);
  const kho = [dau], cha = [-1], act = [null];
  let i = 0, nhip = 0;
  while (i < kho.length) {
    nhip++;
    const cuoiLop = kho.length;
    for (; i < cuoiLop; i++) {
      const S = kho[i];
      for (const a of ctx.hanhDong) {
        const N = buocMotNhip(ctx, S, a);
        if (N.pos.some((p) => p === -2)) continue;
        const k = khoaTT(ctx, N);
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
 * Nhịp ngắn nhất của cả màn (mọi sân cộng lại). Màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (che-xich.7: to_hill() do màn cho) thì tính:
 * nhịp của đoạn đó (chạy thật với kho hamCuaEm) + BFS từ trạng thái sau đoạn đó (xe, vật, ô ◆ đã qua).
 * Đoạn cố định = những dòng đầu của chương trình chính cố định (maMau.chinh) chỉ gọi hàm KHÓA của màn (man.khoaHamMan).
 */
export function nhipCheXichTatCa(man, hamCuaEm, tuyChon = {}) {
  const khoa = man.khoaHamMan || [], chinh = man.chinhCoDinh && man.maMau ? man.maMau.chinh : [];
  let n = 0;
  while (n < chinh.length && khoa.some((t) => chinh[n].trim() === t + '()')) n++;
  const dsSan = Array.isArray(man.san[0]) ? man.san : [man.san];
  if (!n) {
    let tong = 0;
    dsSan.forEach((rows, i) => {
      const lm = SanHoc.lopMauCuaSan(man, i);
      const con = Object.assign({}, man, { san: rows, batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau, mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, bongMo: lm.bongMo || man.bongMo });
      const k = nhipCheXichNganNhat(con, tuyChon).nhip;
      tong = tong === null || k === null ? null : tong + k;
    });
    return tong;
  }
  if (dsSan.length > 1) throw new Error('Đoạn cố định + nhiều sân chưa hỗ trợ.');
  const ChamHoc = require(path.join(day, 'cham.js'));
  const pre = ChamHoc.cham(Object.assign({}, man, { chinhCoDinh: false }), { chinh: chinh.slice(0, n), hamCuaMan: man.maMau.hamCuaMan }, hamCuaEm);
  if (!pre.theoSan.length || !pre.vet.length || pre.chanDoan.some((c) => c.ma === 'ham-chua-co' || c.ma === 'loi-chay')) throw new Error('Đoạn cố định của ' + man.ma + ' chạy lỗi.');
  const r = pre.theoSan[0], rong = SanHoc.docSan(man.san, man.mau, man.vatMau, man.vatChat).rong;
  if (r.quayDo) throw new Error('Đoạn cố định của ' + man.ma + ' dừng khi còn quay dở.');
  const diQua = (man.bongMo && man.bongMo.diQua) || [];
  let mask = 0;
  (r.diQua || []).forEach((q, i) => { if (q.da) mask |= (1 << i); });
  const pos = r.vat.map((v) => (v.trangThai === 'dat' ? v.y * rong + v.x : v.trangThai === 'cam' ? -1 : -2));
  const b = nhipCheXichNganNhat(man, Object.assign({}, tuyChon, { batDau: { x: r.robot.x, y: r.robot.y, huong: r.robot.huong, tuThe: r.tay && r.tay.tuThe === 'duoi' ? 'duoi' : 'tren', pos, mask } }));
  return b.nhip === null ? null : r.soNhip + b.nhip;
}

/** Chuỗi hành động (giá trị bánh THẬT) → mã Python lệnh gốc, đúng daoChieu của màn: mỗi hành động thành lệnh tay + lệnh bánh + wait(). */
export function chuoiThanhMa(chuoi, man) {
  const dao = (man && man.daoChieu) || [];
  const dong = [];
  const ten = (v, tien, lui, daoNay) => ((v > 0) !== daoNay ? tien : lui);
  for (const a of chuoi) {
    if (a.tuThe === 'duoi') dong.push('arm_down()'); else if (a.tuThe === 'tren') dong.push('arm_up()');
    if (a.kep === 'kep') dong.push('grab()'); else if (a.kep === 'tha') dong.push('release()');
    const [t, p] = a.banh;
    if (t !== 0) dong.push(ten(t, 'left_move', 'left_back', dao.includes('trai')) + '()');
    if (p !== 0) dong.push(ten(p, 'right_move', 'right_back', dao.includes('phai')) + '()');
    dong.push('wait()');
  }
  return dong.join('\n') + '\n';
}

/* ============================================================================
   do-duong-rap-du.mjs — BỘ DÒ ĐƯỜNG NGẮN NHẤT CHUNG cho chương `rap-du` (Lắp ráp: Đủ bộ): một bộ dò cho MỌI tổ hợp thân × tay × não của danh mục lắp ráp.
   Dùng trong máy kiểm (kiem-rap-du.mjs, kiem-hoc.mjs); không nằm trong game.

   KHÁC các bộ do-duong-*.mjs khác: không tự viết lại luật sân. Mỗi bước dò CHẠY THẬT SanHoc.chay (lõi của game) trên chương trình = dãy nhịp đã chọn,
   rồi lấy trạng thái cuối làm nút của đồ thị (so trùng bằng khóa trạng thái). Vì vậy luật luôn đúng với game, kể cả tay xoay, nam châm có cực, máy ném, súng hơi,
   chân nhện, drone có pin, camera… — không có chuyện bộ dò lệch lõi. Đổi lại chậm hơn bộ dò viết riêng (~0,1 ms mỗi bước), nên sân của chương này phải gọn;
   `toiDaTrangThai` / `toiDaNhip` chặn cho khỏi chạy mãi (khi bị chặn kết quả `catNgang: true` KHÔNG còn là bằng chứng).

   Cảm biến (khoảng cách, màu, camera, từ, camera bụng) KHÔNG đổi vật lý: chúng chỉ giúp CHƯƠNG TRÌNH quyết định, nên nhịp ngắn nhất chỉ phụ thuộc (thân, tay) — hàm
   `vatLyCua(cach)` cho biết hai cách lắp cùng vật lý (cùng thân, cùng tay) để máy kiểm chỉ dò một lần.

   Một NHỊP của đồ thị (hành động) là một "manh chương trình" kết thúc bằng wait() (nhện và drone: bằng một bước go_*, tự trôi nhịp). Gộp lệnh của các bộ phận khác nhau vào
   cùng một nhịp (nâng tay + đi, lệnh nam châm + bay, lệnh chân nhện + bước…) được xét đầy đủ; chỉ bỏ những hành động không thể có ích tại trạng thái đó
   (vd. kẹp khi chưa hạ tay hay ô trước không có vật, thả khi không cầm, đổi tư thế tay bằng chính tư thế đang có, ném khi rổ trống):
   chúng chỉ dẫn tới trạng thái cũ hay trạng thái hỏng, nên bỏ đi không làm đường ngắn nhất dài ra.
   Khi sân KHÔNG có vật / thùng / nút thì tay không thể làm gì ích cho xe (tay hạ chỉ làm xe không đi được; súng hơi giật lùi chỉ bằng lùi một ô) nên bỏ lệnh tay; có thì xét đủ.

   Khóa trạng thái: ô, hướng, tư thế tay (nâng / hạ, kẹp, đang cầm vật nào, nấc khớp), nam châm (cực, vật dính), máy ném (tầm, rổ), đạn, từng vật (ô, trạng thái; vật giống hệt nhau
   thì xếp tăng dần để gộp), thùng, cửa, nút, băng chuyền tắt, pin, chân nhện, nửa vòng quay của xích, và bộ đếm băng chuyền (suy ra từ nhịp cuối).

   Hàm xuất:
     nhipNganNhat(m, i, tuyChon)      → { nhip, chuoi (mã Python), soTrangThai, soLanChay, catNgang }  (m: màn đã gắn robot; i: chỉ số sân)
     nhipCachLap(man, cach, tuyChon)  → { nhip (theo man.nhipTheo), theoSan: [..], giaiDuoc, catNgang }  (man: màn lắp ráp; cach: { than, tay, camBien })
     vatLyCua(cach)                   → khóa 'than|tay' (+ pin nếu drone)
     tomTatSan(m, i)                  → { coVat, coThung, coNut }
   tuyChon: { toiDaNhip (mặc định 60), toiDaTrangThai (mặc định 150000), toiDaGiay }
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));

const VEC = SanHoc.VEC;

/** Cấu hình SanHoc.chay của sân thứ i (giống cham.js). */
export function cauHinhSan(m, i = 0) {
  const nhieu = Array.isArray(m.san[0]);
  const rows = nhieu ? m.san[i] : m.san;
  const bd = Array.isArray(m.batDau) ? m.batDau[i] : m.batDau;
  const lm = SanHoc.lopMauCuaSan(m, nhieu ? i : 0);
  return {
    san: rows, batDau: bd, loaiRobot: m.loaiRobot || 'banh',
    hamGoc: m.hamGoc, nhipToiDa: 400, mucTieu: m.mucTieu || 'toi-co',
    mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vatCan: m.vatCan, vat: lm.vatThem || undefined,
    roBanDau: Array.isArray(m.roBanDau) ? m.roBanDau[i] : m.roBanDau,
    cuaNhip: lm.cuaNhip || undefined, noi: lm.noi || undefined, danToiDa: m.danToiDa,
    pin: Array.isArray(m.pin) ? m.pin[i] : m.pin,
    camBien: m.robot ? m.robot.camBien : undefined,
    bongMo: lm.bongMo || undefined, daoChieu: m.daoChieu, phanCung: SanHoc.phanCungCua(m)
  };
}

export function tomTatSan(m, i = 0) {
  const nhieu = Array.isArray(m.san[0]);
  const k = (nhieu ? m.san[i] : m.san).join('');
  const cfg = cauHinhSan(m, i);
  const chat = (cfg.vatChat || []).join('') + ((cfg.vat || []).map((v) => v.chat === 'nam-cham' ? 'N' : '').join(''));
  return { coVat: /[oX]/.test(k) || !!cfg.roBanDau || !!(cfg.vat && cfg.vat.length), coThung: /[Hh]/.test(k), coNut: /[NCc]/.test(k), coVatCuc: /[NS]/.test(chat) };
}

/** Khóa vật lý: hai cách lắp cùng thân + tay thì cùng nhịp ngắn nhất (cảm biến không đổi vật lý). */
export function vatLyCua(cach) {
  const c = LapRap.chuanCach(cach);
  return c.than + '|' + (c.tay || '-');
}

/* ------------------------------------------------------------------ hành động */

const SO_BANH = { cho: [0, 0], tien: [1, 1], lui: [-1, -1], phai: [1, 0], trai: [0, 1], dau: [1, -1] };
function dongBanh(t, p) {
  const d = [];
  if (t === 1) d.push('left_move()'); else if (t === -1) d.push('left_back()');
  if (p === 1) d.push('right_move()'); else if (p === -1) d.push('right_back()');
  return d;
}
function banhCuaLoai(loai) {
  if (loai === 'xich') { const kq = []; for (let t = -1; t <= 1; t++) for (let p = -1; p <= 1; p++) kq.push([t, p]); return kq; }
  return Object.values(SO_BANH);
}
const HUONG_ONG = { go_up: 0, go_right: 1, go_down: 2, go_left: 3 };

function oTruoc(rb, nac) {
  const h = nac === 'trai' ? (rb.huong + 3) % 4 : nac === 'phai' ? (rb.huong + 1) % 4 : rb.huong;
  return { x: rb.x + VEC[h][0], y: rb.y + VEC[h][1] };
}
function vatDatTai(res, o) { return res.vat.some((v) => v.trangThai === 'dat' && v.x === o.x && v.y === o.y); }

/** Các "manh chương trình" (một nhịp mỗi manh) dùng được từ trạng thái res. ctx: { loai, coTay, tay, sanTomTat }. */
function hanhDongTu(ctx, res) {
  const kq = [];
  const rb = res.robot, loai = ctx.loai;
  const them = (lines) => kq.push(lines);
  const cs = ctx.tomTat;
  const tayCoLoi = ctx.tay && (ctx.tay === 'hoi' || cs.coVat);
  // ---- tay: các lựa chọn lệnh tay cho nhịp này (mỗi lựa chọn: { dong, tuTheSau, chanBanh })
  let luaTay = [{ dong: [], chanBanh: false }];
  if (tayCoLoi) {
    const t = res.tay, nc = res.namCham, nem = res.nem;
    if (ctx.tay === 'kep' || ctx.tay === 'xoay') {
      const cam = t && t.cam !== null && t.cam !== undefined;
      const ts = [];
      const xoayOpts = ctx.tay === 'xoay' ? [null, 'arm_left', 'arm_right'].filter((c) => {
        if (c === null) return true;
        const nac = t.xoay;
        if (c === 'arm_left' && nac === 'trai') return false;
        if (c === 'arm_right' && nac === 'phai') return false;
        return true;
      }) : [null];
      for (const xo of xoayOpts) {
        const nacSau = xo === 'arm_left' ? (t.xoay === 'phai' ? 'truoc' : 'trai') : xo === 'arm_right' ? (t.xoay === 'trai' ? 'truoc' : 'phai') : (t.xoay || 'truoc');
        for (const tu of [null, 'arm_down', 'arm_up']) {
          if (tu === 'arm_down' && t.tuThe !== 'tren') continue;
          if (tu === 'arm_up' && t.tuThe !== 'duoi') continue;
          const sau = tu === 'arm_down' ? 'duoi' : tu === 'arm_up' ? 'tren' : t.tuThe;
          if (xo && t.tuThe === 'duoi' && tu !== 'arm_up') continue;          // tay hạ thì khớp xoay kẹt (trừ khi nâng tay cùng nhịp)
          const o = oTruoc(rb, ctx.tay === 'xoay' ? nacSau : 'truoc');
          for (const kp of [null, 'grab', 'release']) {
            if (kp === 'grab' && !(sau === 'duoi' && !cam && vatDatTai(res, o))) continue;
            if (kp === 'release' && !(sau === 'duoi' && cam)) continue;
            const dong = [];
            if (xo) dong.push(xo + '()');
            if (tu) dong.push(tu + '()');
            if (kp) dong.push(kp + '()');
            ts.push({ dong, chanBanh: sau === 'duoi' });
          }
        }
      }
      luaTay = ts;
    } else if (ctx.tay === 'nam-cham') {
      const ds = [{ dong: [], chanBanh: false }];
      const cuc = nc ? nc.cuc : null;
      if (cuc !== 'N') ds.push({ dong: ['magnet_n()'], chanBanh: false });
      if (cuc !== 'S' && cs.coVatCuc) ds.push({ dong: ['magnet_s()'], chanBanh: false });                  // không có vật nam châm (chỉ sắt / gỗ) thì hai cực như nhau: bỏ magnet_s
      if (cuc !== null || (nc && nc.cam !== null)) ds.push({ dong: ['magnet_off()'], chanBanh: false });
      luaTay = ds;
    } else if (ctx.tay === 'nem') {
      const ds = [{ dong: [], chanBanh: false }];
      if (nem.ro === null && vatDatTai(res, oTruoc(rb, 'truoc'))) ds.push({ dong: ['load()'], chanBanh: true });
      if (nem.ro !== null) for (let k = 1; k <= 3; k++) ds.push({ dong: ['aim(' + k + ')', 'throw()'], chanBanh: true });
      luaTay = ds;
    } else if (ctx.tay === 'hoi') {
      luaTay = [{ dong: [], chanBanh: false }, { dong: ['shoot()'], chanBanh: true }, { dong: ['shoot_back()'], chanBanh: true }];
    }
  }
  if (loai === 'banh' || loai === 'xich' || loai === 'omni') {
    const banh = banhCuaLoai(loai);
    for (const lt of luaTay) {
      if (lt.chanBanh) { them(lt.dong.concat(['wait()'])); continue; }               // tay hạ / bắn / ném: xe đứng yên trong nhịp này
      for (const [t, p] of banh) them(lt.dong.concat(dongBanh(t, p), ['wait()']));
      if (loai === 'omni') { them(lt.dong.concat(['slide_left()', 'wait()'])); them(lt.dong.concat(['slide_right()', 'wait()'])); }
    }
  } else if (loai === 'nhen') {
    const chans = [[]];
    if (ctx.chanCo.dung) chans.push(['crouch()']);
    if (ctx.chanCo.co) chans.push(['stand()']);
    for (const lt of luaTay) for (const ch of chans) {
      const tien = lt.dong.concat(ch);
      them(tien.concat(['wait()']));
      if (lt.chanBanh) continue;
      for (const g of Object.keys(HUONG_ONG)) them(tien.concat([g + '()']));
    }
  } else if (loai === 'drone') {
    for (const lt of luaTay) {
      them(lt.dong.concat(['wait()']));
      for (const g of Object.keys(HUONG_ONG)) them(lt.dong.concat([g + '()']));
    }
  }
  return kq;
}

/* ------------------------------------------------------------------ khóa trạng thái */

const BANG_KY = new Set(Object.keys(SanHoc.BANG));
function demBangCuoi(res, cfg, rows) {
  // bộ đếm băng chuyền ẩn của lõi: =1 khi nhịp cuối kết thúc trên ô băng đang chạy mà chưa bị đẩy
  const nh = res.vet.filter((e) => e.loai === 'nhip');
  if (!nh.length) return 0;
  const cuoi = nh[nh.length - 1];
  if (cuoi.suKien.some((e) => e.ma === 'bang-day' || e.ma === 'bang-chan' || e.ma === 'bang-khong-day')) return 0;
  const c = rows[res.robot.y] && rows[res.robot.y][res.robot.x];
  if (!c || !BANG_KY.has(c)) return 0;
  if (res.bangTat && res.bangTat.some((b) => b.x === res.robot.x && b.y === res.robot.y)) return 0;
  if (cfg.loaiRobot === 'drone') return 0;
  return 1;
}
function tohopBanhCuoi(res) {                                      // xích quay dở: chỉ nhịp kế CÙNG tổ hợp bánh mới đủ 90°
  const nh = res.vet.filter((e) => e.loai === 'nhip');
  const b = nh.length ? nh[nh.length - 1].robot.banh : null;
  return b ? b.trai + ',' + b.phai : '';
}
function khoaVat(res, giongNhau) {
  const lop = (v) => (v.chat || '') + (v.mau || '') + (v.cuc || '');
  const camId = res.tay && res.tay.cam !== null && res.tay.cam !== undefined ? res.tay.cam : (res.namCham && res.namCham.cam !== null && res.namCham.cam !== undefined ? res.namCham.cam : null);
  const ds = res.vat.map((v) => lop(v) + ':' + v.trangThai + ':' + v.x + ',' + v.y + (camId === v.id ? '*' : ''));
  return giongNhau ? ds.sort().join('|') : ds.join('|');
}
function khoaTrangThai(res, cfg, rows, ctx) {
  const rb = res.robot, t = res.tay, nc = res.namCham, nem = res.nem;
  return [
    rb.x, rb.y, rb.huong,
    t ? t.tuThe + (t.kep ? 'k' : '') + (t.xoay || '') : '',
    nc ? (nc.cuc || '-') : '', nem ? nem.tam + ':' + (nem.ro === null ? '-' : nem.ro) : '', res.sung && res.sung.dan !== null ? res.sung.dan : '',
    khoaVat(res, ctx.vatGiong),
    res.thung && res.thung.length ? res.thung.map((h) => h.x + ',' + h.y).sort().join('|') : '',
    res.cua && res.cua.length ? res.cua.map((c) => (c.mo ? 1 : 0)).join('') : '',
    res.nut && res.nut.length ? res.nut.map((n) => (n.bat ? 1 : 0)).join('') : '',
    res.bangTat && res.bangTat.length ? res.bangTat.map((b) => b.x + ',' + b.y).join('|') : '',
    res.pin === null || res.pin === undefined ? '' : res.pin,
    res.chan || '', res.quayDo || 0, res.quayDo ? tohopBanhCuoi(res) : '', demBangCuoi(res, cfg, rows),
    ctx.chuKyCua ? res.nhip % ctx.chuKyCua : 0
  ].join(';');
}

/* ------------------------------------------------------------------ dò */

/**
 * Nhịp ngắn nhất (và một chương trình đạt nó) để thắng sân thứ i của màn đã gắn robot m. Dijkstra theo nhịp (nhện: mỗi bước 2 nhịp).
 * Trả { nhip: số | null, chuoi: mã Python | null, soTrangThai, soLanChay, catNgang }. nhip null + catNgang false = KHÔNG giải được trong toiDaNhip (đã dò hết).
 */
export function nhipNganNhat(m, i = 0, tuyChon = {}) {
  const cfg = cauHinhSan(m, i);
  const rows = cfg.san;
  const toiDaNhip = tuyChon.toiDaNhip || 60;
  const toiDaTT = tuyChon.toiDaTrangThai || 150000;
  const toiDaMs = (tuyChon.toiDaGiay || 120) * 1000;
  const t0 = Date.now();
  const tomTat = tomTatSan(m, i);
  const robot = m.robot || {};
  const ctx = {
    loai: cfg.loaiRobot, tay: robot.tay || null, tomTat,
    chanCo: { dung: true, co: true },
    vatGiong: true,                                                       // vật giống hệt (cùng chất, màu, cực) xếp tăng dần để gộp
    chuKyCua: cfg.cuaNhip && cfg.cuaNhip.length ? cfg.cuaNhip.reduce((a, c) => a * ((c.mo + c.dong) / gcd(a, c.mo + c.dong)), 1) : 0
  };
  if (cfg.loaiRobot === 'nhen') { ctx.chanCo = { dung: true, co: true }; }
  const goc = SanHoc.chay(cfg, 'wait()\n');
  if (goc.thang) return { nhip: 0, chuoi: '', soTrangThai: 1, soLanChay: 1, catNgang: false };
  // trạng thái xuất phát = chạy chương trình rỗng; dùng "wait" làm nhịp 0 sẽ tính một nhịp nên ta cần trạng thái khởi điểm riêng
  const dau = SanHoc.chay(cfg, 'pass\n');
  const nut = new Map();                       // khóa → nhịp tốt nhất
  const hangDoi = [];                          // hangDoi[n] = các nút có nhịp n: { res, prog }
  const them = (n, o) => { (hangDoi[n] = hangDoi[n] || []).push(o); };
  const k0 = khoaTrangThai(dau, cfg, rows, ctx);
  nut.set(k0, 0);
  them(0, { res: dau, prog: '', k: k0 });
  let soLanChay = 1, soTT = 1, tot = null, catNgang = false;
  for (let n = 0; n <= toiDaNhip && !catNgang; n++) {
    if (tot !== null && n + 1 >= tot.nhip) break;
    const lop = hangDoi[n];
    if (!lop) continue;
    for (const cur of lop) {
      if (nut.get(cur.k) < n) continue;
      const ds = hanhDongTu(ctx, cur.res);
      for (const manh of ds) {
        const code = cur.prog + manh.join('\n') + '\n';
        const res = SanHoc.chay(cfg, code);
        soLanChay++;
        if (res.loi || res.dungSom) continue;
        if (res.thang) {
          if (tot === null || res.nhip < tot.nhip) tot = { nhip: res.nhip, chuoi: code };
          continue;
        }
        if (res.nhip > toiDaNhip || res.nhip <= n) continue;
        if (res.lenhTon && res.lenhTon.length) continue;
        const k = khoaTrangThai(res, cfg, rows, ctx);
        const cu = nut.get(k);
        if (cu !== undefined && cu <= res.nhip) continue;
        nut.set(k, res.nhip);
        soTT++;
        them(res.nhip, { res, prog: code, k });
        if (soTT > toiDaTT || Date.now() - t0 > toiDaMs) { catNgang = true; break; }
      }
      if (catNgang) break;
    }
  }
  return { nhip: tot ? tot.nhip : null, chuoi: tot ? tot.chuoi : null, soTrangThai: soTT, soLanChay, catNgang: catNgang && tot === null };
}
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

/** Nhịp ngắn nhất của màn lắp ráp `man` với cách lắp `cach`: mỗi sân dò riêng, rồi lấy lớn nhất (hay tổng nếu man.nhipTheo === 'tong') như máy chấm. */
export function nhipCachLap(man, cach, tuyChon = {}) {
  const m = LapRap.apDung(man, cach);
  const nhieu = Array.isArray(m.san[0]);
  const soSan = nhieu ? m.san.length : 1;
  const theoSan = [];
  for (let i = 0; i < soSan; i++) theoSan.push(nhipNganNhat(m, i, tuyChon));
  const giaiDuoc = theoSan.every((r) => r.nhip !== null);
  const catNgang = theoSan.some((r) => r.catNgang);
  let nhip = null;
  if (giaiDuoc) nhip = man.nhipTheo === 'tong' ? theoSan.reduce((a, r) => a + r.nhip, 0) : Math.max(...theoSan.map((r) => r.nhip));
  return { nhip, theoSan, giaiDuoc, catNgang };
}

/**
 * Cho kiem-hoc.mjs: nhịp ngắn nhất của robot MẶC ĐỊNH của màn (= cách lắp mẫu đầu tiên, cachLap[0], đã được ManHoc.chuanHoa điền vào màn). Màn nhiều sân: lấy theo man.nhipTheo.
 * null nếu có sân không thắng được trong toiDaNhip. Các cách lắp còn lại do kiem-rap-du.mjs dò.
 */
export function nhipRapDuTatCa(man, tuyChon = {}) {
  const r = nhipCachLap(man, man.lapRap.cachLap[0], Object.assign({ toiDaNhip: Math.max(60, man.sao.nhip + 10) }, tuyChon));
  return r.nhip;
}

/* ============================================================================
   do-duong-rap-tay.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `rap-tay` (Lắp ráp: Thân + Tay) của "Robot Chấn Hưng", dùng cho TỪNG cách lắp: thân hai bánh / xích / omni / nhện × tay kẹp / xoay /
   nam châm / máy ném / súng hơi / không gắn. Dùng trong máy kiểm (kiem-rap-tay.mjs, kiem-hoc.mjs); không nằm trong game.

   KHÁC các bộ dò khác (do-duong-che-*.mjs): các bộ dò kia viết lại luật sân bằng tay cho MỘT loại robot. Chương lắp ráp có tới ~20 loại robot nên bộ dò này KHÔNG viết lại luật: nó dùng
   chính SanHoc.chay làm "thước đo". Mỗi trạng thái được biểu diễn bằng đoạn chương trình (các nhịp) dẫn tới nó; mở rộng = chạy lại SanHoc.chay với đoạn đó cộng một HÀNH ĐỘNG (một nhịp của
   mọi bộ phận robot). Vì vậy kết quả đúng luật lõi theo định nghĩa (không có chuyện bộ dò và lõi lệch nhau), đổi lại chậm hơn: chỉ hợp với sân nhỏ và nhịp ngắn.

   Dijkstra theo NHỊP (nhện: một bước go_* tốn 2 nhịp), loại trùng bằng "dấu vân tay" của trạng thái (vị trí / hướng robot, tay, nam châm, rổ máy ném, vật, thùng, cửa, nút, băng tắt, ô đi qua, thế chân
   của nhện, nửa vòng quay của xích, bộ đếm băng chuyền). Vật giống hệt nhau được xếp theo ô để gộp trạng thái. Thắng = SanHoc.chay báo `thang` (đúng mục tiêu của màn: tới cờ, đưa vật, đẩy thùng,
   bóng mờ khi chương trình chạy xong). Trạng thái chết (lỗi chạy, vật vỡ, rơi hố, thùng kẹt) không mở rộng.

   Hành động mỗi nhịp = tích các nhóm lệnh của robot, đã bỏ bớt các cách làm CHẮC CHẮN không có lợi (lệnh lặp lại trạng thái đang có, đi khi tay đang hạ…):
     bánh / bước : xe hai bánh · omni: đứng · tiến · lùi · quay phải · quay trái · quay đầu (+ trượt trái / phải với omni) · xích: đứng · tiến · lùi · quay phải · quay trái (quay chậm) ·
                   nhện: bước 4 hướng (2 nhịp)
     tay kẹp     : nâng / hạ, kẹp / thả (tay xoay thêm xoay trái / phải)        nam châm: bật N / bật S / ngắt        máy ném: nạp / ném tầm 1, 2, 3        súng hơi: bắn trước / bắn sau
     chân nhện   : co / duỗi
   Hàm xuất:
     nhipRapTayNganNhat(man, cach, tuyChon) → { nhip, soTrangThai, catNgang, chuoi, ma }   man = màn lắp ráp GỐC (có lapRap), cach = { than, tay, camBien }
        tuyChon.toiDaNhip       : không mở rộng quá số nhịp này (mặc định 40); trả nhip null nếu không tới đích trong ngưỡng
        tuyChon.toiDaTrangThai  : giới hạn số trạng thái (mặc định 40000); vượt thì catNgang true (KHÔNG kết luận)
     nhipRapTayTatCa(man)       → nhịp ngắn nhất của cách lắp mẫu ĐẦU TIÊN (cachLap[0]) — dùng cho kiem-hoc.mjs
     nhipMoiCach(man, tuyChon)  → [{ cach, ten, gia, nhip, catNgang, soTrangThai }] cho MỌI cách trong LapRap.dsCachLap(man)
     chuoiThanhMa(chuoi)        → mã Python (lệnh gốc) của đường tìm được, để kiểm chéo bằng ChamHoc / SanHoc.chay
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));

/** Cấu hình SanHoc.chay của sân thứ i của màn đã gắn robot (như ChamHoc.cham truyền xuống). */
export function cfgCua(m, i = 0) {
  const lm = SanHoc.lopMauCuaSan(m, i);
  const nhieu = Array.isArray(m.san[0]);
  return {
    san: nhieu ? m.san[i] : m.san, batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, loaiRobot: m.loaiRobot || 'banh',
    hamGoc: m.hamGoc, nhipToiDa: m.nhipToiDa || 200, mucTieu: m.mucTieu || 'toi-co',
    mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vatCan: m.vatCan, vat: lm.vatThem || undefined, roBanDau: Array.isArray(m.roBanDau) ? m.roBanDau[i] : m.roBanDau,
    cuaNhip: lm.cuaNhip || undefined, noi: lm.noi || undefined, danToiDa: m.danToiDa,
    pin: Array.isArray(m.pin) ? m.pin[i] : m.pin, camBien: m.robot ? m.robot.camBien : undefined,
    bongMo: lm.bongMo || undefined, daoChieu: m.daoChieu, phanCung: SanHoc.phanCungCua(m)
  };
}

/* --------------------------------------------------------------------- hành động */
// mỗi hành động = { ten, code (các dòng lệnh, chưa có wait) , ... }
const BANH = {
  tien: 'left_move()\nright_move()\n', lui: 'left_back()\nright_back()\n', phai: 'left_move()\n', trai: 'right_move()\n', dau: 'left_move()\nright_back()\n',
  truotTrai: 'slide_left()\n', truotPhai: 'slide_right()\n'
};
const BUOC = { len: 'go_up()\n', xuong: 'go_down()\n', trai: 'go_left()\n', phai: 'go_right()\n' };

/** Danh sách hành động (một nhịp, hay một bước 2 nhịp của nhện) hợp lệ ở trạng thái `tt` (kết quả SanHoc.chay của đường dẫn tới đó; null = trạng thái đầu). */
function hanhDongTu(m, tt) {
  const hg = m.hamGoc, co = (t) => hg.includes(t), loai = m.loaiRobot;
  const kq = [];
  const tay = tt ? tt.tay : null;
  const coKep = co('grab'), coXoay = co('arm_left') || co('arm_right');
  const duoi0 = tay ? tay.tuThe === 'duoi' : false, cam0 = tay ? !!tay.cam : false, nac0 = tay && tay.xoay ? tay.xoay : 'truoc';
  // ---- nhóm tay (lệnh làm trước bánh): mỗi mục { code, tuTheCuoi: 'tren'|'duoi', ten }. Chỉ giữ các cách làm KHÔNG bị cách khác lấn át:
  //      · hạ tay luôn đi kèm kẹp / thả trong CÙNG nhịp (hạ một mình rồi kẹp ở nhịp sau chỉ chậm hơn);
  //      · tay đang hạ thì chỉ nâng lên (kèm bánh / xoay), không kẹp thêm lần nữa ở nhịp sau;
  //      · tay xoay: xoay được cả khi nâng tay cùng nhịp (nâng → xoay → hạ → kẹp)
  let nhomTay = [{ code: '', tuTheCuoi: duoi0 ? 'duoi' : 'tren', ten: '' }];
  if (coKep) {
    nhomTay = [];
    const xoays = [{ c: '' }];
    if (coXoay) {
      if (nac0 !== 'trai') xoays.push({ c: 'arm_left()\n' });
      if (nac0 !== 'phai') xoays.push({ c: 'arm_right()\n' });
    }
    const kep = cam0 ? 'release()\n' : 'grab()\n', tenKep = cam0 ? 'thả' : 'kẹp';
    const gon = (c) => c.replace(/\(\)\n/g, ' ').trim();
    const them = (code, cuoi, ten) => nhomTay.push({ code, tuTheCuoi: cuoi, ten });
    if (!duoi0) {
      for (const x of xoays) {
        them(x.c, 'tren', gon(x.c));
        them(x.c + 'arm_down()\n' + kep, 'duoi', (x.c ? gon(x.c) + '+' : '') + 'hạ+' + tenKep);
      }
    } else {
      for (const x of xoays) {
        them('arm_up()\n' + x.c, 'tren', 'nâng' + (x.c ? '+' + gon(x.c) : ''));
        if (x.c) them('arm_up()\n' + x.c + 'arm_down()\n' + kep, 'duoi', 'nâng+' + gon(x.c) + '+hạ+' + tenKep);
      }
    }
  }
  // ---- nhóm "tay" khác: nam châm, máy ném, súng hơi (độc lập với bánh nhưng có thể chặn bánh)
  let nhomKhac = [{ code: '', chanBanh: false, ten: '' }];
  if (co('magnet_n')) {
    const nc = tt && tt.namCham ? tt.namCham : { cuc: null };
    nhomKhac = [{ code: '', chanBanh: false, ten: '' }];
    if (nc.cuc !== 'N') nhomKhac.push({ code: 'magnet_n()\n', chanBanh: false, ten: 'magnet_n' });
    if (nc.cuc !== 'S') nhomKhac.push({ code: 'magnet_s()\n', chanBanh: false, ten: 'magnet_s' });
    if (nc.cuc !== null) nhomKhac.push({ code: 'magnet_off()\n', chanBanh: false, ten: 'magnet_off' });
  } else if (co('load')) {
    nhomKhac = [{ code: '', chanBanh: false, ten: '' }, { code: 'load()\n', chanBanh: true, ten: 'load' }];
    for (let t = 1; t <= 3; t++) nhomKhac.push({ code: 'aim(' + t + ')\nthrow()\n', chanBanh: true, ten: 'ném' + t });
  } else if (co('shoot')) {
    nhomKhac = [{ code: '', chanBanh: false, ten: '' }, { code: 'shoot()\n', chanBanh: true, ten: 'bắn' }, { code: 'shoot_back()\n', chanBanh: true, ten: 'bắn_sau' }];
  }
  // ---- nhóm bánh / bước
  const tenBanh = (n) => n;
  if (loai === 'nhen') {
    const chan = tt && tt.chan ? tt.chan : 'dung';
    const chans = [{ c: '', ten: '' }];
    if (co('crouch')) { if (chan === 'dung') chans.push({ c: 'crouch()\n', ten: 'co' }); else chans.push({ c: 'stand()\n', ten: 'duỗi' }); }
    for (const t of nhomTay) for (const ch of chans) {
      // chỉ-đứng (wait), tốn 1 nhịp
      if (t.code || ch.c) kq.push({ code: t.code + ch.c, ten: [t.ten, ch.ten].filter(Boolean).join('+'), buoc: false });
      else kq.push({ code: '', ten: 'chờ', buoc: false });
      // bước 4 hướng: tay phải đang nâng sau nhóm tay
      if (t.tuTheCuoi === 'tren') for (const [d, c] of Object.entries(BUOC)) kq.push({ code: t.code + ch.c + c, ten: [t.ten, ch.ten, 'đi_' + d].filter(Boolean).join('+'), buoc: true });
    }
    return kq;
  }
  let banhs = [{ c: '', ten: 'chờ' }];
  const dsB = loai === 'xich' ? ['tien', 'lui', 'phai', 'trai'] : ['tien', 'lui', 'phai', 'trai', 'dau'];
  // xích: quay phải = (1,0); quay trái = (0,1) — hai tổ hợp cùng chiều quay là tương đương, chỉ cần một đại diện
  for (const b of dsB) banhs.push({ c: BANH[b], ten: tenBanh(b) });
  if (loai === 'omni') { banhs.push({ c: BANH.truotTrai, ten: 'trượt_trái' }); banhs.push({ c: BANH.truotPhai, ten: 'trượt_phải' }); }
  for (const t of nhomTay) for (const k of nhomKhac) for (const b of banhs) {
    const choDi = t.tuTheCuoi === 'tren' && !k.chanBanh;
    if (b.c && !choDi) continue;                                        // bánh bị chặn (tay hạ / nhịp nạp / ném / bắn): bỏ, đã có hành động "chờ" tương đương
    const code = t.code + k.code + b.c;
    kq.push({ code, ten: [t.ten, k.ten, b.c ? b.ten : ''].filter(Boolean).join('+') || 'chờ', buoc: false });
  }
  return kq;
}

/* ---------------------------------------------------------------------- dấu vân tay */
function dauVanTay(m, res, hd) {
  const r = res.robot;
  const p = [r.x, r.y, r.huong];
  if (res.tay) p.push('T' + res.tay.tuThe + (res.tay.kep ? 'k' : '') + (res.tay.cam ? 'c' : '') + (res.tay.xoay || ''));
  if (res.namCham) p.push('N' + (res.namCham.cuc || '-') + (res.namCham.cam ? 'c' : ''));
  if (res.nem) p.push('M' + res.nem.tam + (res.nem.ro ? 'r' : ''));
  if (res.sung && res.sung.dan !== null && res.sung.dan !== undefined) p.push('S' + res.sung.dan);
  if (res.chan) p.push('C' + res.chan);
  if (res.quayDo) p.push('Q' + res.quayDo + hd);                        // xích quay dở: nhịp kế phải cùng tổ hợp, tức cùng hành động (đại diện duy nhất) nên chỉ cần chiều
  const v = res.vat.map((o) => o.trangThai + ':' + o.x + ',' + o.y + (o.mau ? o.mau : '') + (o.chat ? o.chat : '') + (o.cuc ? o.cuc : '')).sort();
  p.push('V' + v.join(';'));
  if (res.thung && res.thung.length) p.push('H' + res.thung.map((t) => t.x + ',' + t.y).sort().join(';'));
  if (res.cua && res.cua.length) p.push('D' + res.cua.map((c) => (c.mo ? 1 : 0)).join(''));
  if (res.nut && res.nut.length) p.push('B' + res.nut.map((n) => (n.bat ? 1 : 0)).join(''));
  if (res.bangTat && res.bangTat.length) p.push('X' + res.bangTat.map((b) => b.x + ',' + b.y).join(';'));
  if (res.diQua && res.diQua.length) p.push('Q' + res.diQua.map((q) => (q.da ? 1 : 0)).join(''));
  // bộ đếm băng chuyền: đứng trên băng (đang chạy) mà nhịp cuối không bị đẩy / chặn = đã đếm 1
  const nhipVet = res.vet.filter((e) => e.loai === 'nhip');
  const cuoi = nhipVet.length ? nhipVet[nhipVet.length - 1] : null;
  if (cuoi && m.san.join('').match(/[><^v]/) && !cuoi.suKien.some((e) => e.ma === 'bang-day' || e.ma === 'bang-chan' || e.ma === 'bang-khong-day')) p.push('Z1');
  return p.join('|');
}

/* -------------------------------------------------------------------------- BFS */
const NHO = new Map();
export function nhipRapTayNganNhat(man, cach, tuyChon = {}) {
  const toiDaNhip = tuyChon.toiDaNhip || 40, toiDaTT = tuyChon.toiDaTrangThai || 40000;
  const m = LapRap.apDung(man.manGoc || man, cach);
  if (Array.isArray(m.san[0])) throw new Error('Bộ dò rap-tay chỉ nhận màn MỘT sân.');
  const cfg = cfgCua(m, 0);
  const chay = (code) => SanHoc.chay(cfg, code);
  const nodes = [{ code: '', nhip: 0, cha: -1, hd: '', tt: null }];
  const thay = new Map();
  const r0 = chay('');
  if (r0.thang) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [], ma: '' };
  nodes[0].tt = r0;
  thay.set(dauVanTay(m, r0, ''), 0);
  const xep = [[0]];                                                     // xếp theo nhịp (Dijkstra với cạnh 1 hay 2 nhịp)
  let tot = Infinity, totNut = -1, totHd = null, catNgang = false;
  for (let b = 0; b < xep.length && b <= toiDaNhip && b < tot; b++) {
    const ds = xep[b] || [];
    for (let k = 0; k < ds.length; k++) {
      const i = ds[k], nut = nodes[i];
      if (nut.nhip !== b) continue;
      for (const hd of hanhDongTu(m, nut.tt)) {
        const code = nut.code + hd.code + (hd.buoc ? '' : 'wait()\n');
        const res = chay(code);
        if (res.loi || res.dungSom) continue;
        const nhipMoi = res.nhip;
        if (nhipMoi <= nut.nhip) continue;
        if (res.thang) { if (nhipMoi < tot && nhipMoi <= toiDaNhip) { tot = nhipMoi; totNut = i; totHd = { hd, code }; } continue; }
        if (nhipMoi >= tot || nhipMoi > toiDaNhip) continue;
        const dv = dauVanTay(m, res, hd.ten);
        const cu = thay.get(dv);
        if (cu !== undefined && nodes[cu].nhip <= nhipMoi) continue;
        if (nodes.length >= toiDaTT) { catNgang = true; continue; }
        nodes.push({ code, nhip: nhipMoi, cha: i, hd: hd.ten, tt: res });
        thay.set(dv, nodes.length - 1);
        (xep[nhipMoi] = xep[nhipMoi] || []).push(nodes.length - 1);
      }
    }
  }
  if (tot === Infinity) return { nhip: null, soTrangThai: nodes.length, catNgang, chuoi: [], ma: '' };
  const chuoi = [totHd.hd.ten];
  for (let i = totNut; i > 0; i = nodes[i].cha) chuoi.unshift(nodes[i].hd);
  return { nhip: tot, soTrangThai: nodes.length, catNgang, chuoi, ma: totHd.code };
}

/** Mã Python của đường tìm được (dòng lệnh gốc + wait()). */
export function chuoiThanhMa(kq) { return kq.ma; }

/** Nhịp ngắn nhất của cách lắp mẫu đầu tiên (cachLap[0]). */
export function nhipRapTayTatCa(man, tuyChon = {}) {
  const L = man.lapRap;
  const kq = nhipRapTayNganNhat(man, L.cachLap[0], Object.assign({ toiDaNhip: (man.sao && man.sao.nhip ? man.sao.nhip + 2 : 40) }, tuyChon));
  return kq.catNgang ? null : kq.nhip;
}

/** Nhịp ngắn nhất của MỌI cách lắp trong ngân sách (LapRap.dsCachLap). */
export function nhipMoiCach(man, tuyChon = {}) {
  return LapRap.dsCachLap(man).map((c) => {
    const kq = nhipRapTayNganNhat(man, c, tuyChon);
    return { cach: { than: c.than, tay: c.tay, camBien: c.camBien }, ten: LapRap.moTa(c), gia: c.gia, nhip: kq.nhip, catNgang: kq.catNgang, soTrangThai: kq.soTrangThai, ma: kq.ma, chuoi: kq.chuoi };
  });
}

/* ============================================================================
   kiem-bang-ghep.mjs — máy kiểm BẢNG GHÉP MỘT CHỖ (hoc/bang-ghep.js), TÁM CỖ MÁY (hoc/co-may.js) và danh mục lắp ráp 8 × 9 × 11 (hoc/lap-rap.js) của "Mật Lệnh Robot"
   (gói M9A, kế hoạch hoc/KE-HOACH-MUA-9-TO-HOP.md mục 2–3, 5a, 9.1–9.3). Gồm:
   a. bảng đủ hai mặt 8 thân × 9 tay và 8 thân × 11 cảm biến; mọi ô có trạng thái hợp lệ; ô ✗ có lý do tiếng Việt; ô ★ có mã lai L; mã part đúng bộ vẽ vector và danh mục lắp ráp;
   b. ô ● khớp đúng tám bộ cỗ máy trong co-may.js (đúng 16 ô, mỗi thân một cỗ máy, tay + cảm biến gốc);
   c. mọi ô ● / ✔: LapRap.apDung dựng robot, SanHoc.chay chạy "wait()" trên một sân nhỏ không lỗi, và MỘT LỆNH GỐC của part chạy được (không ném); VeVector.kiemGhep không ném, VeVector.robot vẽ được;
   d. mọi ô ✗ / ★ / ·: LapRap.kiemGhep trả ok:false đúng mã (ghep-sai / lai-chua-co / khong-mo) với lý do của bảng; ★ có `lai`; VeVector.kiemGhep ném cho ô ✗ / · có part mới, ô ★ thì VẼ ĐƯỢC (M9B1);
      lai mở theo màn: BangGhep.kiemGhep(…, { moLai }), LapRap.kiemGhep(c, man) đọc man.lapRap.moLai / man.moLai;
   e. tám cỗ máy: CoMay.dung chạy được trong lõi, ghép hợp lệ ở lap-rap và bộ vẽ;
   f. TỰ CHỨNG MINH: tạm đổi một ô ✔ thành ✗ (BangGhep.dat, trong bộ nhớ) → phép c phải kêu, phép d phải kêu ngược lại; đặt lại ô cũ.
   In bảng tổng số ô mỗi trạng thái và danh sách ô ✔ chưa có màn nào dùng (chưa có hình tổ hợp riêng: gói hình sau).
   Chạy: node hoc/kiem-bang-ghep.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const BG = require(path.join(day, 'bang-ghep.js'));
const CoMay = require(path.join(day, 'co-may.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));
const SanHoc = require(path.join(day, 'san-hoc.js'));
const VV = LapRap.veVector();

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); } else { hong++; console.log('  ✗ HỎNG ' + ten + (chiTiet ? '\n      ' + String(chiTiet).slice(0, 1500) : '')); }
}
const J = (o) => JSON.stringify(o);
const LOAI_VE = { than: 'than', tay: 'tay', camBien: 'cam-bien' };

/* ------------------------------------------------------------ sân nhỏ theo thân */
function sanCua(than, ray) {
  if (than === 'xuong') return { san: ['~~~~~', '~~~~~', '~~Q~~'], batDau: { x: 2, y: 0, huong: 2 } };
  if (than === 'cau') return { san: ['.....', ray ? '.RRR.' : '.....', '..F..'], batDau: { x: 2, y: 1, nac: 2, tam: 1 } };   // ray: dải R ≥ 2 ô cho cỗ máy CC có rail()
  return { san: ['.....', '.....', '..F..'], batDau: { x: 2, y: 0, huong: 0 } };
}
/* một lệnh gốc mẫu của từng part (chạy thử trong lõi) */
const LENH_MAU = {
  tay: { kep: 'arm_down()', xoay: 'arm_left()', hoi: 'spray()', 'nam-cham': 'magnet_n()', 'moc-cau': 'pick_up()', 'day-keo': 'cast_net()', son: 'ink("red")\ndot()', nem: 'load()', loa: 'note(1)' },
  camBien: { 'khoang-cach': 'front_clear()', 'hong-ngoai': 'distance()', tu: 'front_metal()', 'quet-ma': 'read_code()', 'dong-chay': 'flow_dir()', camera: 'color()', 'camera-bay': 'look()', radar: 'radar()', 'am-thanh': 'hear()', mau: 'color()' }
};
function lenhMau(than, khe, ma) {
  if (khe === 'camBien' && ma === 'camera-4') return BG.NHOM[BG.NHOM_THAN[than]].mui ? 'color("front")' : 'color("up")';
  return LENH_MAU[khe][ma];
}
function cachCua(x) { return { than: x.than, tay: x.khe === 'tay' ? x.ma : null, camBien: x.khe === 'camBien' ? x.ma : null }; }
/** Dựng robot của ô x bằng LapRap.apDung rồi chạy chương trình `ct` trong lõi; trả lỗi (chuỗi) hay null. */
function chayO(x, ct) {
  try {
    const s = sanCua(x.than), m = LapRap.apDung({ ma: 'tam.bg', san: s.san, batDau: s.batDau }, cachCua(x));
    SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: m.loaiRobot, hamGoc: m.hamGoc, camBien: m.robot.camBien, pin: m.pin, phanCung: SanHoc.phanCungCua(m) }, ct);
    return null;
  } catch (e) { return e.message; }
}
function veO(x) {
  try {
    const c = LapRap.cauHinhCua(cachCua(x));
    VV.kiemGhep(c); VV.xoaDem(); VV.robot(c, {}, 0, 56);
    return null;
  } catch (e) { return e.message; }
}

/* ---------------------------------------------------------------- a. bảng */
console.log('a. bảng ghép hai mặt');
const TAT_CA = BG.dsO();
kiem('8 thân × 9 tay + 8 thân × 11 cảm biến = ' + (8 * 9 + 8 * 11) + ' ô, mỗi ô có trạng thái', TAT_CA.length === 160 && TAT_CA.every((x) => BG.TRANG_THAI.includes(x.tt)), TAT_CA.length);
kiem('thứ tự thân đúng bảng kế hoạch (hai bánh, xích, omni, bánh gai, xuồng, nhện, drone, cần cẩu)', J(BG.THAN) === J(['hai-banh', 'xich', 'omni', 'gai', 'xuong', 'nhen', 'drone', 'cau']));
kiem('mã thân / tay / cảm biến đều là mã bộ phận thật của bộ vẽ vector', ['than', 'tay', 'camBien'].every((k) => BG.dsCua(k).every((ma) => !!VV.lay(LOAI_VE[k], ma))),
  J(['than', 'tay', 'camBien'].flatMap((k) => BG.dsCua(k).filter((ma) => !VV.lay(LOAI_VE[k], ma)))));
kiem('mã của bảng = mã danh mục lắp ráp (LapRap.DANH_MUC) ở cả ba khe', ['than', 'tay', 'camBien'].every((k) => J([...BG.dsCua(k)].sort()) === J(LapRap.DANH_MUC[k].map((d) => d.ma).sort())),
  J(['than', 'tay', 'camBien'].map((k) => [BG.dsCua(k).length, LapRap.DANH_MUC[k].length])));
const cam = BG.dsO('cam'), lai = BG.dsO('lai');
kiem('mọi ô ✗ (' + cam.length + ') có lý do tiếng Việt cho trẻ (≥ 20 chữ, không nói tên luật lõi)', cam.every((x) => x.lyDo && x.lyDo.length >= 20 && !/loai|hamGoc|cfg|rc\./.test(x.lyDo)), J(cam.filter((x) => !x.lyDo || x.lyDo.length < 20)));
kiem('mọi ô ★ (' + lai.length + ') có mã lai L1…L14', lai.every((x) => /^L([1-9]|1[0-4])$/.test(x.lai || '')), J(lai.filter((x) => !/^L([1-9]|1[0-4])$/.test(x.lai || ''))));
kiem('ba điều cấm vì sức: drone + loa / móc cẩu / vòi phun / máy ném ✗; xuồng + vòi phun / máy ném ✗; chong chóng ✗ trên mọi thân trừ xuồng',
  ['loa', 'moc-cau', 'hoi', 'nem'].every((t) => BG.trangThai('drone', 'tay', t) === 'cam') && ['hoi', 'nem'].every((t) => BG.trangThai('xuong', 'tay', t) === 'cam') &&
  BG.THAN.every((th) => BG.trangThai(th, 'camBien', 'dong-chay') === (th === 'xuong' ? 'goc' : 'cam')));
kiem('nhóm thân: xe có bánh (4) có mũi; nhện, drone không mũi có bụng; cần cẩu đứng yên; xuồng có mũi', BG.THAN.every((th) => !!BG.NHOM[BG.NHOM_THAN[th]]) && ['hai-banh', 'xich', 'omni', 'gai'].every((t) => BG.NHOM_THAN[t] === 'banh') && BG.NHOM['khong-mui'].bung && !BG.NHOM.banh.bung);
kiem('ô cũ của lắp ráp giữ câu báo cũ (drone + kẹp nhắc nam châm; nhện + kẹp xoay / khoảng cách nhắc hướng mặt; xe + camera bụng nhắc drone)',
  /nam châm/.test(BG.lyDo('drone', 'tay', 'kep')) && /hướng mặt/.test(BG.lyDo('nhen', 'tay', 'xoay')) && /hướng mặt/.test(BG.lyDo('nhen', 'camBien', 'khoang-cach')) && /drone/.test(BG.lyDo('hai-banh', 'camBien', 'camera-bay')));

/* ------------------------------------------------------- b. ô ● = tám cỗ máy */
console.log('b. ô ● khớp tám cỗ máy (co-may.js)');
const goc = BG.dsO('goc');
kiem('đúng 16 ô ● (8 thân × tay gốc + cảm biến gốc), mỗi thân đúng một tay ● và một cảm biến ●', goc.length === 16 && BG.THAN.every((th) => goc.filter((x) => x.than === th && x.khe === 'tay').length === 1 && goc.filter((x) => x.than === th && x.khe === 'camBien').length === 1), J(goc.map((x) => x.than + '/' + x.ma)));
kiem('tám cỗ máy CH CU PL CC XU DR KT HD, mỗi thân một cỗ máy', J(CoMay.THU_TU) === J(['CH', 'CU', 'PL', 'CC', 'XU', 'DR', 'KT', 'HD']) && BG.THAN.every((th) => !!CoMay.cuaThan(th)) && new Set(CoMay.THU_TU.map((m) => CoMay.DS[m].than)).size === 8);
kiem('mọi ô ● là part gốc của cỗ máy thân đó và ngược lại (CoMay.laGoc)', goc.every((x) => CoMay.laGoc(x.than, x.khe, x.ma)) && CoMay.THU_TU.every((m) => { const d = CoMay.DS[m]; return BG.trangThai(d.than, 'tay', d.tay) === 'goc' && d.camBien.every((c) => BG.trangThai(d.than, 'camBien', c.ma) === 'goc'); }),
  J(goc.filter((x) => !CoMay.laGoc(x.than, x.khe, x.ma))));
kiem('hamGoc của mỗi cỗ máy là hợp lệnh của ba part trong danh mục lắp ráp (kể cả nâng cấp), cộng wait', CoMay.THU_TU.every((m) => {
  const d = CoMay.DS[m], co = new Set(['wait']);
  [['than', d.than], ['tay', d.tay], ['camBien', d.camBien[0].ma]].forEach(([k, ma]) => { const p = LapRap.tim(k, ma); p.ham.concat(p.nangCap || []).forEach((h) => co.add(h)); });
  return d.hamGoc.every((h) => co.has(h));
}), J(CoMay.THU_TU.map((m) => [m, CoMay.DS[m].hamGoc.filter((h) => { const d = CoMay.DS[m], co = new Set(['wait']); [['than', d.than], ['tay', d.tay], ['camBien', d.camBien[0].ma]].forEach(([k, ma]) => { const p = LapRap.tim(k, ma); p.ham.concat(p.nangCap || []).forEach((x) => co.add(x)); }); return !co.has(h); })])));

/* --------------------------------------------------- c. ô ● / ✔ chạy được trong lõi */
console.log('c. mọi ô ● / ✔ chạy được trong lõi và vẽ được');
const duoc = TAT_CA.filter((x) => x.tt === 'goc' || x.tt === 'duoc');
function kiemDuoc(ds) {
  const loiChay = [], loiLenh = [], loiVe = [], loiGhep = [];
  for (const x of ds) {
    const r = LapRap.kiemGhep(cachCua(x)); if (!r.ok) loiGhep.push(x.than + '/' + x.ma + ': ' + r.lyDo);
    const e1 = chayO(x, 'wait()\n'); if (e1) loiChay.push(x.than + '/' + x.ma + ': ' + e1);
    const e2 = chayO(x, lenhMau(x.than, x.khe, x.ma) + '\nwait()\n'); if (e2) loiLenh.push(x.than + '/' + x.ma + ' [' + lenhMau(x.than, x.khe, x.ma).replace(/\n/g, '; ') + ']: ' + e2);
    const e3 = veO(x); if (e3) loiVe.push(x.than + '/' + x.ma + ': ' + e3);
  }
  return { loiGhep, loiChay, loiLenh, loiVe };
}
{
  const r = kiemDuoc(duoc);
  kiem(duoc.length + ' ô ● / ✔: LapRap.kiemGhep ok', r.loiGhep.length === 0, r.loiGhep.slice(0, 6).join(' | '));
  kiem(duoc.length + ' ô ● / ✔: LapRap.apDung + SanHoc.chay("wait()") trên sân nhỏ không ném lỗi', r.loiChay.length === 0, r.loiChay.slice(0, 6).join(' | '));
  kiem(duoc.length + ' ô ● / ✔: một lệnh gốc của part chạy được trong lõi (không ném)', r.loiLenh.length === 0, r.loiLenh.slice(0, 6).join(' | '));
  kiem(duoc.length + ' ô ● / ✔: VeVector.kiemGhep không ném, VeVector.robot vẽ được (ô chưa có hình tổ hợp riêng: vẽ tạm theo ổ gắn của thân)', r.loiVe.length === 0, r.loiVe.slice(0, 6).join(' | '));
}

/* ------------------------------------------------- d. ô ✗ / ★ / · bị chặn đúng mã */
console.log('d. ô ✗ / ★ / · bị chặn');
const chan = TAT_CA.filter((x) => x.tt === 'cam' || x.tt === 'lai' || x.tt === 'khong-mo');
const MA_CHAN = { cam: 'ghep-sai', lai: 'lai-chua-co', 'khong-mo': 'khong-mo' };
function kiemChan(ds) {
  const sai = [], saiVe = [];
  for (const x of ds) {
    const r = LapRap.kiemGhep(cachCua(x));
    if (r.ok || r.ma !== MA_CHAN[x.tt] || (x.tt === 'cam' && r.lyDo !== x.lyDo) || (x.tt === 'lai' && r.lai !== x.lai) || !r.xung.includes(x.khe)) sai.push(x.than + '/' + x.ma + ' (' + x.tt + '): ' + J(r));
    let nemApDung = false; try { LapRap.apDung({ ma: 't' }, cachCua(x)); } catch (e) { nemApDung = true; }
    if (!nemApDung) sai.push(x.than + '/' + x.ma + ': apDung không ném');
    const moi = BG.laMoi('than', x.than) || BG.laMoi(x.khe, x.ma);
    if (moi && x.tt !== 'lai' && !veO(x)) saiVe.push(x.than + '/' + x.ma);
  }
  return { sai, saiVe };
}
{
  const r = kiemChan(chan);
  kiem(chan.length + ' ô ✗ / ★ / ·: LapRap.kiemGhep ok:false, đúng mã (ghep-sai / lai-chua-co / khong-mo), lý do của bảng, ★ kèm mã lai, xung có khe; apDung ném', r.sai.length === 0, r.sai.slice(0, 6).join(' | '));
  kiem('ô ✗ / · có part mới (ngoài dữ liệu chụp bộ pixel): VeVector.kiemGhep cũng ném (bộ vẽ đọc cùng bảng)', r.saiVe.length === 0, r.saiVe.join(', '));
}
/* M9B1 (4/11): lai mở THEO MÀN (man.lapRap.moLai / man.moLai), không còn cờ toàn cục MO_LAI; bộ vẽ không biết màn nên ô ★ vẽ được */
kiem('không còn cờ toàn cục BangGhep.MO_LAI', BG.MO_LAI === undefined);
kiem('BangGhep.kiemGhep(…, { moLai: ["L1"] }): cần cẩu + nam châm ghép được; không khai / khai mã khác thì vẫn ★ bị chặn',
  BG.kiemGhep('cau', 'nam-cham', null, { moLai: ['L1'] }).ok && BG.kiemGhep('cau', 'nam-cham', null).ma === 'lai-chua-co' && BG.kiemGhep('cau', 'nam-cham', null, { moLai: ['L4'] }).ma === 'lai-chua-co');
kiem('LapRap.kiemGhep(c, màn): đọc man.lapRap.moLai, không thì man.moLai; không có màn = không mở',
  LapRap.kiemGhep({ than: 'nhen', camBien: 'am-thanh' }, { lapRap: { moLai: ['L4'] } }).ok && LapRap.kiemGhep({ than: 'nhen', camBien: 'am-thanh' }, { moLai: ['L4'] }).ok &&
  !LapRap.kiemGhep({ than: 'nhen', camBien: 'am-thanh' }).ok && !LapRap.kiemGhep({ than: 'nhen', camBien: 'am-thanh' }, { lapRap: { moLai: ['L5'] } }).ok);
{
  const lai = TAT_CA.filter((x) => x.tt === 'lai'), loiVe = [];
  const CHO_HINH = [];                                                               // M9B2: thân cau đã có ổ 'bung' (L13 camera bụng vẽ được theo ổ)
  for (const x of lai) { const l = veO(x); if (l && !CHO_HINH.includes(x.than + '/' + x.khe + '/' + x.ma)) loiVe.push(x.than + '/' + x.ma + ' (' + x.lai + '): ' + l); }
  kiem(lai.length + ' ô ★ (trừ ' + CHO_HINH.join(', ') + ': chờ ổ của hình): VeVector.kiemGhep không ném, VeVector.robot vẽ được (theo ổ gắn của thân; hình riêng để gói sau)', loiVe.length === 0, loiVe.join(' | '));
}

/* ----------------------------------------------------------- e. tám cỗ máy chạy */
console.log('e. tám cỗ máy chạy được');
{
  const loi = [];
  for (const ma of CoMay.THU_TU) {
    const d = CoMay.DS[ma], s = sanCua(d.than, true);
    try {
      const r = CoMay.dung(ma, { son: 'lam', batDau: s.batDau });
      if (r.robot.son !== 'lam' || r.loaiRobot !== d.loaiRobot) throw new Error('dung() sai sơn / loaiRobot');
      SanHoc.chay(Object.assign({ san: s.san }, r, { camBien: r.robot.camBien, phanCung: SanHoc.phanCungCua(r) }), 'wait()\n');
      const lr = LapRap.kiemGhep({ than: d.than, tay: d.tay, camBien: d.camBien[0].ma }); if (!lr.ok) throw new Error('lap-rap: ' + lr.lyDo);
      VV.kiemGhep({ than: d.than, tay: d.tay, camBien: d.camBien });
    } catch (e) { loi.push(ma + ': ' + e.message); }
  }
  kiem('CoMay.dung(mã, { son, batDau }) của cả 8 cỗ máy chạy "wait()" trong lõi, ghép hợp lệ ở lap-rap và bộ vẽ', loi.length === 0, loi.join(' | '));
  let pinOk = false; try { const r = CoMay.dung('DR', { pin: 7, batDau: { x: 2, y: 0 } }); pinOk = r.pin === 7 && r.hamGoc.includes('battery'); SanHoc.chay(Object.assign({ san: ['.....', '.....', '..F..'] }, r, { camBien: r.robot.camBien, phanCung: SanHoc.phanCungCua(r) }), 'battery()\nwait()\n'); } catch (e) { pinOk = false; }
  kiem('drone DR có pin khi màn khai (dung(…, { pin }) thêm battery)', pinOk);
}

/* ---------------------------------------------------- f. tự chứng minh bắt được lỗi */
console.log('f. tự chứng minh máy kiểm bắt được lỗi (đổi tạm một ô trong bộ nhớ)');
{
  const o = duoc.find((x) => x.than === 'xich' && x.khe === 'tay' && x.ma === 'loa');
  const cu = BG.dat('xich', 'tay', 'loa', { tt: 'cam', lyDo: 'Lỗi giả: xích không gắn loa (máy kiểm tự thử).' });
  const rc = kiemDuoc([o]), rd = kiemChan([Object.assign({}, o, { tt: 'cam', lyDo: 'Lỗi giả: xích không gắn loa (máy kiểm tự thử).' })]);
  BG.dat('xich', 'tay', 'loa', cu);
  kiem('đổi tạm xích + loa ✔ → ✗: phép c kêu (kiemGhep không ok, apDung ném) và phép d thấy ô ✗ mới bị chặn đúng lý do giả', rc.loiGhep.length === 1 && rc.loiChay.length === 1 && rd.sai.length === 0, J({ c: rc.loiGhep, d: rd.sai }));
  const o2 = chan.find((x) => x.than === 'drone' && x.khe === 'tay' && x.ma === 'loa');
  const cu2 = BG.dat('drone', 'tay', 'loa', 'duoc');
  const rd2 = kiemChan([o2]), rc2 = kiemDuoc([Object.assign({}, o2, { tt: 'duoc' })]);
  BG.dat('drone', 'tay', 'loa', cu2);
  kiem('đổi tạm drone + loa ✗ → ✔: phép d kêu (không còn bị chặn) và phép c thấy lõi san-hoc vẫn chặn drone + loa (ô ✔ không chạy được)', rd2.sai.length >= 1 && rc2.loiChay.length === 1, J({ d: rd2.sai.slice(0, 1), c: rc2.loiChay }));
  kiem('đặt lại xong: bảng như cũ', BG.trangThai('xich', 'tay', 'loa') === 'duoc' && BG.trangThai('drone', 'tay', 'loa') === 'cam');
}

/* ------------------------------------------------------------------ tổng kết */
console.log('\nBẢNG GHÉP:\n' + BG.inBang('tay') + '\n\n' + BG.inBang('camBien'));
const tk = BG.tongKet();
console.log('\nTỔNG: ' + BG.TRANG_THAI.map((t) => BG.KY_HIEU[t] + ' ' + t + ' = ' + tk[t]).join(' · ') + ' · tổng ' + tk.tong);
{
  const dung = new Set();
  for (const f of fs.readdirSync(day).filter((f) => /^man-.*\.js$/.test(f))) {
    const src = fs.readFileSync(path.join(day, f), 'utf8');
    for (const m of src.matchAll(/than:\s*'([\w-]+)',\s*tay:\s*('([\w-]+)'|null),\s*camBien:\s*\[(?:\{\s*ma:\s*'([\w-]+)')?/g)) { if (m[3]) dung.add(m[1] + '/tay/' + m[3]); if (m[4]) dung.add(m[1] + '/camBien/' + m[4]); }
  }
  const chuaCo = duoc.filter((x) => !dung.has(x.than + '/' + x.khe + '/' + x.ma));
  console.log('Ô ● / ✔ chưa có màn nào dùng (chưa có hình tổ hợp riêng, bộ vẽ vẽ tạm theo ổ gắn; gói hình sau): ' + chuaCo.length + ' / ' + duoc.length + '\n  ' + chuaCo.map((x) => x.than + ' + ' + x.ma).join(', '));
}
console.log('\nĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);

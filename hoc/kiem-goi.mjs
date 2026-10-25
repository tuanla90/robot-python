/* ============================================================================
   kiem-goi.mjs — máy kiểm GÓI MÀN + LUẬT MỞ KHÓA + BA MÀN HÌNH MỚI của "Robot Chấn Hưng" (bố cục kiểu Cut the Rope, 15/10).
   Kiểm:
   - ThuTuChuong.goi: mỗi chương của thuTu nằm đúng một gói, thứ tự gói theo thứ tự chương; mã gói không trùng;
   - game/mo-goi.js: gói đầu cần 0 sao; sao cần = TI_LE_SAO × tổng sao tối đa các gói trước (bội 5), không giảm, luôn với tới được; gói rỗng = "Sắp có";
   - luật mở màn: gói chưa đủ sao ('sao'), chương thứ hai của gói chờ thử thách chương đầu ('chuoi'), hàm em chế ở chương khác chưa có ('can-ham'),
     hàng Làm quen lần lượt ('hang1'), Luyện / Biến thể sau Làm quen ('hang23'), thử thách sau 9 màn ('trum'); "Mở hết" mở mọi màn; màn chơi tiếp;
   - game/choi.html có ba màn hình (sc-dau, sc-goi, sc-chon) và nạp mo-goi.js, man-dau.js, man-goi.js trước ung-dung.js;
   - lưới màn không còn khung "Hàm của em": Sổ lệnh (thư viện hàm) là một nút ở cả ba màn hình; mọi khóa chữ t('…') của ba màn hình có trong chu.js.
   Chạy: node hoc/kiem-goi.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const TT = require(path.join(day, 'thu-tu-chuong.js'));
for (const f of fs.readdirSync(day).filter((f) => /^man-.*\.js$/.test(f))) require(path.join(day, f));
const ManHoc = require(path.join(day, 'man-chuoi-1.js'));
const doc = (f) => fs.readFileSync(path.join(day, 'game', f), 'utf8');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}

const ctx = vm.createContext({ ManHoc, ThuTuChuong: TT, console });
vm.runInContext(doc('mo-goi.js'), ctx, { filename: 'mo-goi.js' });
const MoGoi = ctx.MoGoi;
/** Bản lưu giả: { 'ma': sao }. */
const luu = (sao) => ({ saoTot: (ma) => sao[ma] || 0 });
const manCua = (c) => ManHoc.danhSach.filter((m) => m.chuong === c);
const tatCa = (c, s) => Object.fromEntries(manCua(c).map((m) => [m.ma, s]));
const tt = (ma, sao, moHet) => MoGoi.trangThai(ManHoc.timMa(ma), luu(sao), moHet);

console.log('== 1. ThuTuChuong.goi ==');
{
  const goi = TT.goi || [];
  const phang = goi.flatMap((g) => g.chuong);
  kiem('có mảng goi, mỗi gói có ma / ten / chuong (không rỗng)', goi.length > 0 && goi.every((g) => g.ma && g.ten && Array.isArray(g.chuong) && g.chuong.length));
  kiem('mã gói không trùng', new Set(goi.map((g) => g.ma)).size === goi.length);
  kiem('mỗi chương của thuTu nằm đúng một gói', TT.thuTu.every((c) => phang.filter((x) => x === c).length === 1) && phang.every((c) => TT.thuTu.includes(c)),
    TT.thuTu.filter((c) => phang.filter((x) => x === c).length !== 1).join(', '));
  kiem('gói xếp theo đúng thứ tự chương (nối các gói lại = thuTu)', JSON.stringify(phang) === JSON.stringify(TT.thuTu));
  kiem('gói hai chương = chương làm quen + chương chế lệnh của nó (che-*), riêng gói Xưởng hàm = xuong-ham + che-xe, gói Đường dài = bang-chuyen + tham-so',
    goi.filter((g) => g.chuong.length === 2 && g.ma !== 'bang-chuyen').every((g) => /^che-/.test(g.chuong[1])) && JSON.stringify(goi.find((g) => g.ma === 'ham').chuong) === '["xuong-ham","che-xe"]' &&
      JSON.stringify(goi.find((g) => g.ma === 'bang-chuyen').chuong) === '["bang-chuyen","tham-so"]');
  kiem('loai của gói (nếu khai) là bo-phan / khai-niem / thu-thach', goi.every((g) => g.loai === undefined || ['bo-phan', 'khai-niem', 'thu-thach'].includes(g.loai)));
  kiem('gói thử thách chỉ có một chương (10 màn); gói bộ phận có chương làm quen (gói nhiều chương: kèm chương chế lệnh)',
    goi.filter((g) => g.loai === 'thu-thach').every((g) => g.chuong.length === 1) && goi.filter((g) => g.loai === 'bo-phan').every((g) => g.chuong.length === 1 || /^che-/.test(g.chuong[1])),
    goi.filter((g) => g.loai === 'thu-thach' && g.chuong.length !== 1).map((g) => g.ma).join(', '));
}

console.log('\n== 2. MoGoi.dsGoi: sao cần ==');
{
  const ds = MoGoi.dsGoi(), coMan = ds.filter((g) => !g.sapCo);
  kiem('gói đầu là Xe hai bánh, cần 0 sao', ds[0].ma === 'xe' && ds[0].saoCan === 0);
  kiem('dsGoi mang loai (mặc định khai-niem): Tay gắp là bo-phan, Vòng lặp khai-niem, Robot hoàn thiện thu-thach',
    MoGoi.goiTheoMa('tay-gap').loai === 'bo-phan' && MoGoi.goiTheoMa('vong-lap').loai === 'khai-niem' && MoGoi.goiTheoMa('robot').loai === 'thu-thach');
  let truoc = 0, dung = true, giam = false, cu = 0, muaCu = null;
  for (const g of coMan) {
    if (g.mua !== muaCu) { truoc = 0; cu = 0; muaCu = g.mua; }                    // ngưỡng tính trong từng mùa (bán theo mùa, 25/10)
    const mong = Math.floor(MoGoi.TI_LE_SAO * truoc / 5) * 5, khai = (TT.goi || []).find((x) => x.ma === g.ma);
    if (khai && typeof khai.sao === 'number') { if (g.saoCan !== khai.sao || g.saoCan > mong) dung = false; }    // khai cứng: đúng số khai, không khó hơn công thức
    else if (g.saoCan !== mong) dung = false;
    if (g.saoCan < cu) giam = true;
    if (g.saoCan > truoc) dung = false;
    cu = g.saoCan; truoc += g.saoToiDa;
  }
  kiem('sao cần = số khai cứng (không khó hơn công thức) hoặc ' + MoGoi.TI_LE_SAO + ' × tổng sao tối đa các gói trước (làm tròn xuống bội 5), không vượt số sao lấy được', dung, coMan.map((g) => g.ma + ':' + g.saoCan).join(' '));
  kiem('sao cần không giảm theo thứ tự gói trong mỗi mùa', !giam);
  kiem('saoToiDa = 3 × số màn; man đúng các màn của các chương trong gói, theo thứ tự', coMan.every((g) => g.saoToiDa === 3 * g.man.length && g.man.length === g.chuong.reduce((s, c) => s + manCua(c).length, 0)));
  kiem('gói chưa có màn nào là "Sắp có" (sapCo, không tính vào sao)', ds.filter((g) => g.sapCo).every((g) => !g.man.length && g.saoToiDa === 0));
  kiem('goiCua(chương) trả đúng gói (kể cả chương chưa có màn)', TT.thuTu.every((c) => { const g = MoGoi.goiCua(c); return g && g.chuongKhai.includes(c); }));
  kiem('dot = 2 cho gói có chương đợt 2', ds.every((g) => g.dot === (g.chuongKhai.some((c) => (TT.dot2 || []).includes(c)) ? 2 : 1)));
}

console.log('\n== 3. Luật mở màn ==');
{
  kiem('chưa chơi gì: chỉ màn 1.1 mở; màn chơi tiếp = hai-banh.1', tt('hai-banh.1', {}).mo && !tt('hai-banh.2', {}).mo && MoGoi.manTiepTheo(luu({})).ma === 'hai-banh.1');
  kiem('Làm quen chơi lần lượt (hang1)', tt('hai-banh.2', {}).lyDo === 'hang1' && tt('hai-banh.2', { 'hai-banh.1': 1 }).mo);
  const h1 = Object.fromEntries(manCua('hai-banh').filter((m) => m.hang === 'lam-quen').map((m) => [m.ma, 1]));
  const luyen = manCua('hai-banh').find((m) => m.hang === 'luyen');
  kiem('Luyện / Biến thể khóa tới khi xong Làm quen (hang23)', tt(luyen.ma, { 'hai-banh.1': 1 }).lyDo === 'hang23' && tt(luyen.ma, h1).mo);
  const trum = manCua('hai-banh').find((m) => m.hang === 'trum');
  const chin = Object.fromEntries(manCua('hai-banh').filter((m) => m.hang !== 'trum').map((m) => [m.ma, 1]));
  kiem('thử thách khóa tới khi qua đủ 9 màn (trum)', tt(trum.ma, h1).lyDo === 'trum' && tt(trum.ma, chin).mo);

  const ham = MoGoi.goiTheoMa('ham');
  const it = { 'hai-banh.1': 3, 'hai-banh.2': 3, 'hai-banh.3': 3, 'hai-banh.4': 2 };          // 11 sao < 15
  const r1 = tt('xuong-ham.1', it);
  kiem('gói Xưởng hàm chưa đủ sao: lyDo "sao" kèm can / co', r1.lyDo === 'sao' && r1.can === ham.saoCan && r1.co === 11, JSON.stringify(r1));
  const du = { ...it, 'hai-banh.4': 3, 'hai-banh.5': 3 };                                         // 15 sao
  kiem('đủ ' + ham.saoCan + ' sao: xuong-ham.1 mở (kể cả khi chưa thắng thử thách gói Xe)', tt('xuong-ham.1', du).mo);
  const r2 = tt('che-xe.1', du);
  kiem('chương thứ hai của gói (che-xe) chờ thử thách chương đầu (chuoi, số chương 2)', r2.lyDo === 'chuoi' && r2.chuong === 'xuong-ham' && r2.chuoi === 2, JSON.stringify(r2));
  kiem('thắng thử thách Xưởng hàm thì che-xe.1 mở', tt('che-xe.1', { ...du, ...tatCa('xuong-ham', 1) }).mo);

  // đủ sao tới gói Cảm biến (chơi Xe, Xưởng hàm, Vòng lặp 3 sao) mà chưa qua màn chế pick() của Tay gắp
  const nhieu = { ...tatCa('hai-banh', 3), ...tatCa('xuong-ham', 3), ...tatCa('che-xe', 3), ...tatCa('vong-lap', 3) };
  const r3 = tt('khoang-cach.1', nhieu);
  const noiPick = ManHoc.danhSach.find((m) => (m.taoHam || []).includes('pick'));
  kiem('đủ sao nhưng thiếu hàm em chế ở chương khác: lyDo "can-ham" (ham, canChuong, canMan)', r3.lyDo === 'can-ham' && ['pick', 'drop'].includes(r3.ham) && r3.canChuong === 'tay-gap', JSON.stringify(r3));
  kiem('qua màn chế pick / drop thì khoang-cach.1 mở', tt('khoang-cach.1', { ...nhieu, ...tatCa('tay-gap', 1) }).mo, noiPick && noiPick.ma);
  kiem('canHam chỉ kể hàm chế ở chương KHÁC, mỗi hàm một lần', TT.thuTu.every((c) => { const k = MoGoi.canHam(c); return k.every((x) => x.man.chuong !== c) && new Set(k.map((x) => x.ham)).size === k.length; }));
  // kho thiếu hàm đã "tạo" ở màn đã qua (bản cũ: 4.6 qua được mà không tạo drop): màn cần hàm đó khóa, chỉ về màn tạo hàm
  const noiDrop = ManHoc.danhSach.find((m) => (m.taoHam || []).includes('drop'));
  const canDrop = ManHoc.danhSach.find((m) => m !== noiDrop && (m.hamCuaEmCan || []).includes('drop'));
  const het = Object.fromEntries(ManHoc.danhSach.map((m) => [m.ma, 3]));
  const thieuDrop = { saoTot: (ma) => het[ma] || 0, coHam: (t) => t !== 'drop' }, duDrop = { saoTot: (ma) => het[ma] || 0, coHam: () => true };
  const r4 = MoGoi.trangThai(canDrop, thieuDrop);
  kiem('kho thiếu drop() dù đã qua màn tạo nó: màn cần drop() khóa, lyDo "mat-ham" chỉ về màn tạo (' + (noiDrop && noiDrop.ma) + ')',
    r4.lyDo === 'mat-ham' && r4.ham === 'drop' && r4.canMan === noiDrop.ma && MoGoi.trangThai(canDrop, duDrop).lyDo !== 'mat-ham', JSON.stringify(r4));
  // mọi màn thường: hàm của em mà lời giải gọi, tạo ở màn khác, phải khai trong hamCuaEmCan (luật khóa can-ham / mat-ham mới chặn được khi chưa có hàm).
  // Màn lắp ráp (lapRap) cố ý để trống: hàm trong kho thì dùng, thiếu vẫn giải được.
  const noiTaoAll = {}; ManHoc.danhSach.forEach((m) => (m.taoHam || []).forEach((t) => { if (!noiTaoAll[t]) noiTaoAll[t] = m; }));
  const goiTrong = (dong) => [...dong.join('\n').matchAll(/\b([a-z_][a-z0-9_]*)\(/g)].map((x) => x[1]);
  const thieuKhai = [];
  ManHoc.danhSach.filter((m) => !m.lapRap).forEach((m) => {
    const lg = m.loiGiai || {}, moi = (lg.hamCuaEmMoi || []).map((h) => h.ten);
    const dong = [].concat(lg.chinh || [], ...(lg.hamCuaEmMoi || []).map((h) => h.than || []), ...(lg.doi || []).map((d) => d.chinh || []));
    const co = new Set((m.hamCuaEmCan || []).concat(((m.maMau && m.maMau.hamCuaMan) || []).map((h) => h.ten), (lg.hamCuaMan || []).map((h) => h.ten)));
    new Set(goiTrong(dong)).forEach((t) => { if (noiTaoAll[t] && noiTaoAll[t] !== m && !co.has(t) && !moi.includes(t)) thieuKhai.push(m.ma + ':' + t); });
  });
  kiem('màn thường gọi hàm của em tạo ở màn khác thì khai trong hamCuaEmCan (22/10: 4.9 thiếu u_turn khi nhảy chương)', !thieuKhai.length, thieuKhai.join(' '));
  kiem('"Mở hết" (moHet) mở mọi màn', ManHoc.danhSach.every((m) => MoGoi.trangThai(m, luu({}), true).mo));
  kiem('tongSao / saoGoi / soQua cộng đúng', MoGoi.tongSao(luu(du)) === 15 && MoGoi.saoGoi(MoGoi.goiTheoMa('xe'), luu(du)) === 15 && MoGoi.soQua(MoGoi.goiTheoMa('xe'), luu(du)) === 5);
}

console.log('\n== 3b. Mùa bán riêng (25/10) và gói không bao giờ khóa lại ==');
{
  const dsM = MoGoi.dsMua();
  const muaCua = (ma) => MoGoi.goiTheoMa(ma).mua;
  kiem('bốn mùa: Xưởng R1 miễn phí, ba mùa sau có `ban` (giá)', dsM.map((x) => x.ma).join() === 'mua-1,mua-2,mua-3,mua-4' && !dsM[0].ban && dsM.slice(1).every((x) => x.ban && x.ban.gia));
  kiem('mùa 1 dừng ở Robot hoàn thiện; mùa 2 mở đầu bằng Đội hai robot, mùa 3 Súng hơi, mùa 4 Tay xoay',
    muaCua('robot') === 'mua-1' && muaCua('hai-robot') === 'mua-2' && muaCua('omni') === 'mua-2' && muaCua('sung-hoi') === 'mua-3' && muaCua('nam-cham') === 'mua-3' &&
      muaCua('tay-xoay') === 'mua-4' && muaCua('rap-du') === 'mua-4');
  kiem('gói đầu mỗi mùa cần 0 sao', dsM.every((x) => x.goi.filter((g) => !g.sapCo)[0].saoCan === 0));
  kiem('mọi gói khai cứng `sao` (thêm gói sau này không đổi ngưỡng đã công bố)', (TT.goi || []).every((g) => typeof g.sao === 'number'), (TT.goi || []).filter((g) => typeof g.sao !== 'number').map((g) => g.ma).join(', '));
  kiem('saoMua chỉ đếm sao trong mùa', MoGoi.saoMua('mua-1', luu(tatCa('hai-banh', 3))) === 30 && MoGoi.saoMua('mua-2', luu(tatCa('hai-banh', 3))) === 0);

  const hr = MoGoi.goiTheoMa('hai-robot'), m2 = MoGoi.muaTheoMa('mua-2');
  const mua2 = (sao, xem) => ({ saoTot: (ma) => (sao || {})[ma] || 0, daMua: (ma) => ma === 'mua-2', daXem: (c) => (xem || []).includes(c) });
  kiem('chưa mua: mùa và gói khóa, lyDo "chua-mua" (dù đủ sao mùa 1)', !MoGoi.muaMo(m2, luu({})) && !MoGoi.goiMo(hr, luu(tatCa('hai-banh', 3))) && tt('hai-robot.1', {}).lyDo === 'chua-mua' && tt('hai-robot.1', {}).mua === 'mua-2');
  kiem('cờ goi-mo / mua-mo cũ không vượt được khóa chưa mua', !MoGoi.goiMo(hr, { saoTot: () => 0, daXem: (c) => c === 'goi-mo:hai-robot' || c === 'mua-mo:mua-2' }));
  kiem('đã mua: gói đầu mùa mở ngay, không cần sao mùa 1', MoGoi.muaMo(m2, mua2()) && MoGoi.goiMo(hr, mua2()) && MoGoi.trangThai(ManHoc.timMa('hai-robot.1'), mua2()).mo);
  kiem('đã mua mùa 2 không mở mùa 3', !MoGoi.goiMo(MoGoi.goiTheoMa('sung-hoi'), mua2()));
  kiem('mua thẳng mùa sau: hàm chế ở mùa trước không chặn (được nạp sẵn khi vào màn)',
    ManHoc.danhSach.filter((m) => MoGoi.goiCua(m.chuong) === hr).every((m) => !['can-ham', 'mat-ham'].includes(MoGoi.trangThai(m, mua2()).lyDo)));
  kiem('"Mở hết" coi mọi mùa như đã mua', MoGoi.goiMo(MoGoi.goiTheoMa('rap-du'), luu({}), true) && !MoGoi.chuaMua(m2, luu({}), true));
  const fly = MoGoi.goiTheoMa('flycam');
  const coCo = { saoTot: () => 0, daMua: () => true, daXem: (c) => c === 'goi-mo:flycam' };
  kiem('gói đã mở (cờ goi-mo:<mã>) thì không khóa lại dù không đủ sao', !MoGoi.goiMo(fly, { saoTot: () => 0, daMua: () => true }) && MoGoi.goiMo(fly, coCo) && MoGoi.trangThai(ManHoc.timMa('flycam.1'), coCo).lyDo !== 'sao');

  // mùa giả mở theo điều kiện: gói Lắp ráp: Đủ bộ chuyển sang mùa thử, mở khi qua hết gói Xe hai bánh
  const rd = TT.goi.find((g) => g.ma === 'rap-du'), cuSao = rd.sao, cuMua = rd.mua;
  TT.mua.push({ ma: 'mua-thu', ten: 'Mùa thử', mo: { goi: 'xe' } }); rd.mua = 'mua-thu'; delete rd.sao;
  try {
    const g = MoGoi.goiTheoMa('rap-du'), mt = MoGoi.muaTheoMa('mua-thu');
    kiem('gói đầu của mùa mới cần 0 sao (ngưỡng tính trong mùa của nó)', g.mua === 'mua-thu' && g.saoCan === 0 && mt.goi.length === 1);
    kiem('mùa chưa mở: gói khóa, lyDo "mua" kèm điều kiện', !MoGoi.goiMo(g, luu({})) && tt('rap-du.1', {}).lyDo === 'mua' && tt('rap-du.1', {}).dieuKien.goi === 'xe');
    kiem('qua hết gói Xe: mùa mở, gói đầu mùa mở', MoGoi.muaMo(mt, luu(tatCa('hai-banh', 1))) && MoGoi.goiMo(g, luu(tatCa('hai-banh', 1))));
    kiem('thêm mùa không đổi ngưỡng mùa khác (Flycam vẫn cần 105 ★ ở mùa 4)', MoGoi.goiTheoMa('flycam').saoCan === 105 && MoGoi.goiTheoMa('flycam').mua === 'mua-4');
    kiem('cờ mua-mo:<mã> giữ mùa mở', MoGoi.muaMo(mt, { saoTot: () => 0, daXem: (c) => c === 'mua-mo:mua-thu' }));
  } finally { TT.mua.pop(); rd.mua = cuMua; rd.sao = cuSao; }
  kiem('trả lại như cũ sau khi thử', MoGoi.dsMua().length === 4 && MoGoi.goiTheoMa('rap-du').mua === 'mua-4' && MoGoi.goiTheoMa('rap-du').saoCan === cuSao);
}

console.log('\n== 4. Ba màn hình (khởi đầu → chọn gói → lưới màn) ==');
{
  const html = doc('choi.html');
  const vt = (f) => html.indexOf('"' + f + '"');
  kiem('choi.html có #sc-dau, #sc-goi, #sc-chon, #sc-choi', ['sc-dau', 'sc-goi', 'sc-chon', 'sc-choi'].every((id) => html.includes('id="' + id + '"')));
  kiem('choi.html nạp mo-goi.js (sau luu.js), man-dau.js, man-goi.js, man-chon.js trước ung-dung.js; tệp có trên đĩa',
    vt('mo-goi.js') > vt('luu.js') && ['mo-goi.js', 'man-dau.js', 'man-goi.js', 'man-chon.js'].every((f) => vt(f) > 0 && vt(f) < vt('ung-dung.js') && fs.existsSync(path.join(day, 'game', f))));
  const ud = doc('ung-dung.js');
  kiem('ung-dung.js: mở khóa qua MoGoi.trangThai, khởi động ở màn đầu (App.hien(\'dau\')), có App.vaoGoi / veGoi / veDau / baoGoiMoi',
    /MoGoi\.trangThai\(m, Luu, App\.moHet\)/.test(ud) && /App\.hien\('dau'\)/.test(ud) && ['App.vaoGoi =', 'App.veGoi =', 'App.veDau =', 'App.baoGoiMoi ='].every((x) => ud.includes(x)));
  const chon = doc('man-chon.js'), goi = doc('man-goi.js'), dau = doc('man-dau.js');
  kiem('lưới màn không còn khung "Hàm của em" (c-thu, viên thuốc hàm)', !/c-thu|pill/.test(chon));
  kiem('Sổ lệnh (thư viện hàm) là một nút bấm mới mở, có ở cả ba màn hình', [chon, goi, dau].every((s) => /data-nut', 'so-lenh'/.test(s) && /SoLenhMan\.mo\(\)/.test(s)));
  kiem('giữ lâu 2 giây (logo / tiêu đề) mở bảng Gỡ lỗi ở cả ba màn hình (dùng được trên link Artifact)', [chon, goi, dau].every((s) => /GIU_LAU_MS = 2000/.test(s) && /GoLoi\.mo\(/.test(s)));
  const gl = doc('go-loi.js');
  kiem('"Mở hết" + vào màn từ lưới thường: App.vaoMan gọi GoLoi.napKhiMoHet(m) (chỉ THÊM hàm cốt truyện còn thiếu, không thay hàm đã có), trước Choi.vao',
    /if \(App\.moHet && window\.GoLoi && GoLoi\.napKhiMoHet\) GoLoi\.napKhiMoHet\(m\);/.test(ud) && ud.indexOf('GoLoi.napKhiMoHet(m)') < ud.indexOf('Choi.vao(m)')
    && /function napKhiMoHet\(m\)/.test(gl) && /napHamChuan\(m, true\)/.test(gl) && /chiThem \|\| giongHam\(co, f\)/.test(gl));
  const chu = doc('chu.js');
  const khoa = new Set([...(chon + goi + dau + doc('bang-mo-khoa.js')).matchAll(/\bt\('([a-zA-Z.\-]+)'/g)].map((x) => x[1]));
  const thieu = [...khoa].filter((k) => !chu.includes("'" + k + "'"));
  kiem('mọi khóa chữ t(\'…\') của ba màn hình + bảng mở gói có trong chu.js', thieu.length === 0, thieu.join(', '));
}

console.log('\n---------------------------------------------\nĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

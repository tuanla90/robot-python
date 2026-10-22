/* ============================================================================
   kiem-goi.mjs — máy kiểm GÓI MÀN + LUẬT MỞ KHÓA + BA MÀN HÌNH MỚI của "Đường học" (bố cục kiểu Cut the Rope, 15/10).
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
  kiem('gói hai chương = chương làm quen + chương chế lệnh của nó (che-*), riêng gói Xưởng hàm = xuong-ham + che-xe',
    goi.filter((g) => g.chuong.length === 2).every((g) => /^che-/.test(g.chuong[1])) && JSON.stringify(goi.find((g) => g.ma === 'ham').chuong) === '["xuong-ham","che-xe"]');
}

console.log('\n== 2. MoGoi.dsGoi: sao cần ==');
{
  const ds = MoGoi.dsGoi(), coMan = ds.filter((g) => !g.sapCo);
  kiem('gói đầu là Xe hai bánh, cần 0 sao', ds[0].ma === 'xe' && ds[0].saoCan === 0);
  let truoc = 0, dung = true, giam = false, cu = 0;
  for (const g of coMan) {
    const mong = Math.floor(MoGoi.TI_LE_SAO * truoc / 5) * 5;
    if (g.saoCan !== mong) dung = false;
    if (g.saoCan < cu) giam = true;
    if (g.saoCan > truoc) dung = false;
    cu = g.saoCan; truoc += g.saoToiDa;
  }
  kiem('sao cần = ' + MoGoi.TI_LE_SAO + ' × tổng sao tối đa các gói trước (làm tròn xuống bội 5), không vượt số sao lấy được', dung, coMan.map((g) => g.ma + ':' + g.saoCan).join(' '));
  kiem('sao cần không giảm theo thứ tự gói', !giam);
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
  kiem('"Mở hết" (moHet) mở mọi màn', ManHoc.danhSach.every((m) => MoGoi.trangThai(m, luu({}), true).mo));
  kiem('tongSao / saoGoi / soQua cộng đúng', MoGoi.tongSao(luu(du)) === 15 && MoGoi.saoGoi(MoGoi.goiTheoMa('xe'), luu(du)) === 15 && MoGoi.soQua(MoGoi.goiTheoMa('xe'), luu(du)) === 5);
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

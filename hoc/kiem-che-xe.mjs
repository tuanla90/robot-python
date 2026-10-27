/* ============================================================================
   kiem-che-xe.mjs — máy kiểm chương `che-xe` (Chế lệnh xe) của "Robot Chấn Hưng" và các luật lõi mới của kế hoạch "Chế lệnh" (KE-HOACH-CHE-LENH.md).
   Gồm:
   - luật bánh (xe hai bánh): bảng tổ hợp (trái, phải) → tiến / lùi / quay đầu / quay phải / quay trái;
   - LENH_NGUOC (cặp lệnh ngược) và dữ liệu Sổ lệnh (so-lenh.js): mọi tên trong taoHam của mọi màn đều có trong SoLenh.ds
     (màn ngân hàng mùa 1 theo thứ tự ngân hàng, rồi màn MỚI của mùa 2 (man-bien-xich, man-hong-ngoai…) theo thứ tự lộ trình lo-trinh-hoc.js;
     gói mùa 2 chế hàm mới chỉ cần thêm mục Sổ lệnh và dòng chương → nhóm ở mục 2);
   - mục tiêu 'bong-mo' (xe mờ): thắng KHI CHẠY XONG, đi ngang qua bóng mờ giữa đường chưa thắng, ô diQua (◆) và sự kiện 'qua-diem', vật đúng ô, cấu hình sai;
   - daoChieu (đấu dây ngược), phanCung / khay (lệnh-chua-mo, lệnh-goc-hong), chinhCoDinh / khoaHamMan;
   - chẩn đoán bằng lời: lech-bong-mo, chua-qua-diem, lenh-chua-mo, lenh-goc-hong;
   - 10 màn che-xe: lời giải 3 sao, BFS nhịp = sao.nhip (bộ dò do-duong-che-xe.mjs), mọi congThucKhac thắng, loiSai đúng mã, chinhCoDinh chặn chương trình chính gửi lên;
   - kế hoạch 3.3b: lời giải các chương cũ vẫn thắng khi kho có u_turn một nhịp và turn_right / turn_left bằng bánh lùi;
   - thẻ script của game/choi.html.
   Các kiểm chung cho cả 170 màn (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs.
   Chạy: node hoc/kiem-che-xe.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
const SoLenh = require(path.join(day, 'so-lenh.js'));
for (const f of fs.readdirSync(day).filter((f) => /^man-.*\.js$/.test(f)).sort()) require(path.join(day, f));          // MỌI tệp màn (kể cả chương mới)
const ManHoc = require(path.join(day, 'man-drone.js'));
const { nhipCheXeNganNhat, nhipCheXeTatCa, toHopChoPhep, hieuQua } = await import('./do-duong-che-xe.mjs');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const maLoi = (kq) => kq.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma);
const maSK = (kq, ma) => kq.suKien.filter((e) => e.ma === ma);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
const vt = (r) => r.x + ',' + r.y;
const tatCa = ManHoc.danhSach;
const che = tatCa.filter((m) => m.chuong === 'che-xe');
const man = (so) => ManHoc.timMa('che-xe.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];

/** Màn MỚI của mùa 2 (tệp ngân hàng man-bien-xich, man-hong-ngoai…: chỉ lo-trinh-hoc.js đưa vào game) theo thứ tự lộ trình, cùng tên chương mùa 2.
    Nạp lộ trình RIÊNG (gỡ cache các tệp hoc/, nạp, rồi trả cache cũ) để ManHoc ngân hàng mà máy kiểm này dùng không bị lộ trình sửa. */
const loTrinhRieng = (() => {
  const laHoc = (k) => k.startsWith(day + path.sep);
  const cu = {};
  for (const k of Object.keys(require.cache)) if (laHoc(k)) { cu[k] = require.cache[k]; delete require.cache[k]; }
  try {
    const LT = require(path.join(day, 'lo-trinh-hoc.js'));
    const tenChuong = require(path.join(day, 'thu-tu-chuong.js')).ten;
    const chuongMua2 = LT.mua2.flatMap((g) => g.chuong.map((c) => c[0]));
    return { tenChuong, manMua2Moi: LT.danhSach.filter((m) => chuongMua2.includes(m.chuong) && !ManHoc.timMa(m.ma)) };
  } finally {
    for (const k of Object.keys(require.cache)) if (laHoc(k)) delete require.cache[k];
    Object.assign(require.cache, cu);
  }
})();

/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải; màn tiết kiệm nhịp sửa riêng, không ghi vào kho). id 'het' = sau cả game. */
function khoTruoc(id) {
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  for (const m of tatCa) {
    if (m.id === id) break;
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi) {
      if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo, { taoHam: m.taoHam });
      kho.sua(h.ten, h.than);
    }
  }
  return kho.ds();
}
const tron = (kho, moi) => {
  const kq = kho.map((h) => H(h.ten, h.than.slice(), h.thamSo.slice()));
  for (const h of moi || []) { const i = kq.findIndex((x) => x.ten === h.ten); const b = H(h.ten, h.than.slice(), (h.thamSo || []).slice()); if (i >= 0) kq[i] = b; else kq.push(b); }
  return kq;
};

const TRONG = ['.........', '.........', '.........', '.........', '.........'];
const BANH_DU = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
function chay(rows, bd, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: BANH_DU }, extra || {}), code);
}
const L = (...d) => d.join('\n') + '\n';
const bd0 = { x: 4, y: 2, huong: 0 };

/* ================================================================= 1. LUẬT BÁNH */
console.log('\n== 1. Luật bánh: tổ hợp (bánh trái, bánh phải) ==');
{
  // (trái, phải) → [tên hiệu quả, ô sau, hướng sau] cho xe bắt đầu ở (4,2) quay lên
  const lenhBanh = { '1': ['left_move()', 'right_move()'], '-1': ['left_back()', 'right_back()'] };
  const bang = [
    [1, 1, 'tien', '4,1', 0], [-1, -1, 'lui', '4,3', 0],
    [1, -1, 'dau', '4,2', 2], [-1, 1, 'dau', '4,2', 2],
    [1, 0, 'phai', '4,2', 1], [0, -1, 'phai', '4,2', 1],
    [0, 1, 'trai', '4,2', 3], [-1, 0, 'trai', '4,2', 3],
    [0, 0, 'cho', '4,2', 0]
  ];
  for (const [t, p, hq, o, h] of bang) {
    const code = (t ? lenhBanh[t][0] + '\n' : '') + (p ? lenhBanh[p][1] + '\n' : '') + 'wait()';
    const kq = chay(TRONG, bd0, code);
    kiem('(' + t + ', ' + p + ') ' + hq + ': ô ' + o + ', hướng ' + h + ', đúng 1 nhịp', vt(kq.robot) === o && kq.robot.huong === h && kq.nhip === 1 && hieuQua(t, p) === hq, vt(kq.robot) + ' h' + kq.robot.huong + ' nhịp ' + kq.nhip);
  }
  kiem('tiến (1,1) và lùi (-1,-1) đi theo hướng mặt: xe quay phải rồi lùi thì đi sang trái màn hình',
    (() => { const k = chay(TRONG, { x: 4, y: 2, huong: 1 }, 'left_back()\nright_back()\nwait()'); return vt(k.robot) === '3,2' && k.robot.huong === 1; })());
}

/* ================================================================= 2. LỆNH NGƯỢC VÀ SỔ LỆNH */
console.log('\n== 2. LENH_NGUOC, Sổ lệnh (so-lenh.js) ==');
{
  const LN = SanHoc.LENH_NGUOC;
  const SAU_CAP = [['left_move', 'left_back'], ['right_move', 'right_back'], ['arm_up', 'arm_down'], ['grab', 'release'], ['go_up', 'go_down'], ['go_left', 'go_right']];
  kiem('LENH_NGUOC có đủ sáu cặp của kế hoạch (left_move↔left_back, right_move↔right_back, arm_up↔arm_down, grab↔release, go_up↔go_down, go_left↔go_right), cả hai chiều',
    SAU_CAP.every(([a, b]) => LN[a] === b && LN[b] === a), J(LN));
  kiem('LENH_NGUOC là phép đối hợp: ngược của ngược là chính nó, không lệnh nào ngược chính nó; wait và lệnh cảm biến / bắn / ném không có lệnh ngược',
    Object.keys(LN).every((a) => LN[LN[a]] === a && LN[a] !== a) && ['wait', 'front_clear', 'left_clear', 'right_clear', 'color', 'front_metal', 'battery', 'throw', 'load', 'aim'].every((t) => LN[t] === undefined));
  kiem('mọi lệnh trong LENH_NGUOC là lệnh gốc của game (có trong kho hàm: tên bị cấm đặt)', Object.keys(LN).every((t) => KhoHam.HAM_GOC_MAC_DINH.includes(t)));
  kiem('lệnh bánh ngược nhau cho tổ hợp bánh đối nhau: left_move + right_move (tiến) và ngược của từng lệnh (lùi) hủy nhau, xe về đúng chỗ',
    (() => { const k = chay(TRONG, bd0, L('left_move()', 'right_move()', 'wait()', 'left_back()', 'right_back()', 'wait()')); return vt(k.robot) === '4,2' && k.robot.huong === 0 && k.nhip === 2; })());
  kiem('lệnh ngược theo từng bánh trả xe về chỗ cũ: (lệnh rồi lệnh ngược) ở hai nhịp liền, cho cả left_* lẫn right_*, theo cả hai thứ tự',
    [['left_move', 'left_back'], ['left_back', 'left_move'], ['right_move', 'right_back'], ['right_back', 'right_move']].every(([a, b]) => {
      const k = chay(TRONG, { x: 4, y: 2, huong: 1 }, L(a + '()', 'wait()', LN[a] + '()', 'wait()'));
      return LN[a] === b && vt(k.robot) === '4,2' && k.robot.huong === 1 && k.nhip === 2;
    }));

  kiem('SoLenh.ds: mỗi mục { ten, nhom, moTa, chuong, man }; nhóm có trong tenNhom và thuTuNhom; moTa là MỘT câu ngắn (≤ 80 chữ cái, không xuống dòng, không dấu chấm cuối); tên không trùng',
    SoLenh.ds.every((h) => typeof h.ten === 'string' && /^[a-z_][a-z_0-9]*$/.test(h.ten) && SoLenh.tenNhom[h.nhom] && SoLenh.thuTuNhom.includes(h.nhom) && typeof h.moTa === 'string' && h.moTa.length >= 8 && h.moTa.length <= 80 && !/[\n]/.test(h.moTa) && !/[.]$/.test(h.moTa) && typeof h.chuong === 'string' && typeof h.man === 'string') &&
      new Set(SoLenh.ds.map((h) => h.ten)).size === SoLenh.ds.length);
  kiem('nhóm của Sổ lệnh đủ loại như kế hoạch: xe, tay, lap, cam-bien, nhen, xich, omni, hoi (súng hơi), mau, son (máy sơn), nam-cham, tay-xoay, nem, drone, tham-so, bang-chuyen, hong-ngoai (mùa 2); mỗi nhóm có tên hiển thị',
    J(Object.keys(SoLenh.tenNhom).sort()) === J(['bang-chuyen', 'cam-bien', 'drone', 'hoi', 'hong-ngoai', 'lap', 'list', 'mau', 'nam-cham', 'nem', 'nhen', 'omni', 'son', 'tay', 'tay-xoay', 'tham-so', 'xe', 'xich']) && J(SoLenh.thuTuNhom.slice().sort()) === J(Object.keys(SoLenh.tenNhom).sort()));
  const dau = {};                                                      // tên hàm → màn đầu tiên tạo nó (ngân hàng mùa 1, rồi màn mới mùa 2 theo lộ trình)
  for (const m of tatCa.concat(loTrinhRieng.manMua2Moi)) for (const t of m.taoHam) if (!dau[t]) dau[t] = m;
  kiem('lộ trình có màn mới mùa 2 (man-hong-ngoai…) cho Sổ lệnh thấy: có che-hong-ngoai.1 tạo go_to_wall', loTrinhRieng.manMua2Moi.some((m) => m.ma === 'che-hong-ngoai.1' && m.taoHam.includes('go_to_wall')), J(loTrinhRieng.manMua2Moi.map((m) => m.ma)));
  const thieu = Object.keys(dau).filter((t) => !SoLenh.tim(t));
  kiem('mọi tên trong taoHam của mọi màn (' + Object.keys(dau).length + ' hàm cốt truyện) đều có trong SoLenh.ds', thieu.length === 0, 'thiếu ' + thieu.join());
  const thua = SoLenh.ds.filter((h) => !dau[h.ten]).map((h) => h.ten);
  kiem('SoLenh.ds không có hàm thừa: mọi mục là một hàm cốt truyện có thật (tổng ' + SoLenh.ds.length + ' = ' + Object.keys(dau).length + ')', thua.length === 0 && SoLenh.ds.length === Object.keys(dau).length, 'thừa ' + thua.join());
  kiem('chuong và man của từng mục khớp màn đầu tiên tạo hàm đó; thứ tự mục = thứ tự chế trong game',
    SoLenh.ds.every((h) => dau[h.ten] && dau[h.ten].chuong === h.chuong && dau[h.ten].ma === h.man) && J(SoLenh.ds.map((h) => h.ten)) === J(Object.keys(dau)), J(SoLenh.ds.filter((h) => !(dau[h.ten] && dau[h.ten].ma === h.man)).map((h) => h.ten + '@' + h.man + '≠' + (dau[h.ten] && dau[h.ten].ma))));
  kiem('chương của mọi mục có tên hiển thị trong ThuTuChuong', SoLenh.ds.every((h) => typeof (ThuTu.ten[h.chuong] || loTrinhRieng.tenChuong[h.chuong]) === 'string'));
  kiem('nhóm của hàm đợt 2 ứng với chương: drone → drone, sung-hoi + che-sung-hoi + luc-ban → hoi, may-nem → nem…; hàm đợt 1 thuộc xe / tay / lap / cam-bien',
    SoLenh.ds.every((h) => ({ 'xuong-ham': 'xe', 'che-xe': 'xe', 'tay-gap': 'tay', 'che-tay': 'tay', 'vong-lap': 'lap', 'che-lap': 'lap', 'khoang-cach': 'cam-bien', 'che-cam-bien': 'cam-bien', 'tham-so': 'tham-so', 'nhen': 'nhen', 'che-nhen': 'nhen', 'list': 'list', 'che-list': 'list', 'xich': 'xich', 'che-xich': 'xich', 'omni': 'omni', 'che-omni': 'omni', 'sung-hoi': 'hoi', 'che-sung-hoi': 'hoi', 'luc-ban': 'hoi', 'mau': 'mau', 'nam-cham': 'nam-cham', 'che-nam-cham': 'nam-cham', 'tay-xoay': 'tay-xoay', 'che-tay-xoay': 'tay-xoay', 'may-nem': 'nem', 'che-may-nem': 'nem', 'drone': 'drone', 'che-drone': 'drone', 'flycam': 'drone', 'che-mau': 'mau', 'may-son': 'son', 'che-may-son': 'son',
      // mùa 2: mỗi chương chế hàm mới thêm một dòng
      'che-hong-ngoai': 'hong-ngoai', 'che-day-thung': 'xich' })[h.chuong] === h.nhom));
  kiem('hàm chế ở che-xe có trong Sổ lệnh với lời lớp 5 (vd dodge_right: "Né sang phải một ô, giữ hướng")',
    ['dodge_right', 'dodge_left', 'back', 'park'].every((t) => SoLenh.tim(t) && SoLenh.tim(t).chuong === 'che-xe') && SoLenh.tim('dodge_right').moTa === 'Né sang phải một ô, giữ hướng');
  kiem('hàm CỦA MÀN (come_back, fixed_move: chỉ đúng cho một màn, 15/10) không còn là hàm cốt truyện: không trong taoHam của màn nào, không trong Sổ lệnh, không là tên khóa của kho', ['come_back', 'fixed_move'].every((t) => !tenCotTruyen.includes(t) && SoLenh.tim(t) === null));
  kiem('SoLenh.theoNhom / theoChuong / tim', SoLenh.theoNhom('xe').length === 11 && SoLenh.theoChuong('che-xe').length === 4 && SoLenh.tim('khong-co') === null);
  kiem('SoLenh.lenhGoc: mỗi mục { ten, nguoc, moTa }; nguoc khớp SanHoc.LENH_NGUOC (null nếu không có); phủ mọi lệnh gốc của game (trừ print, range, len, str, int)',
    SoLenh.lenhGoc.every((l) => l.moTa && (l.nguoc === (SanHoc.LENH_NGUOC[l.ten] || null))) &&
      KhoHam.HAM_GOC_MAC_DINH.filter((t) => !['print', 'range', 'len', 'str', 'int'].includes(t)).every((t) => SoLenh.lenhGoc.some((l) => l.ten === t)) &&
      SoLenh.lenhGoc.every((l) => KhoHam.HAM_GOC_MAC_DINH.includes(l.ten)) && SoLenh.lenhGoc.find((l) => l.ten === 'wait').nguoc === null,
    J(SoLenh.lenhGoc.filter((l) => l.nguoc !== (SanHoc.LENH_NGUOC[l.ten] || null)).map((l) => l.ten)));
  kiem('SoLenh.capNguoc(): mỗi cặp một lần, gồm left_move↔left_back và right_move↔right_back', SoLenh.capNguoc().length === Object.keys(SanHoc.LENH_NGUOC).length / 2 && SoLenh.capNguoc().some((c) => c[0] === 'left_move' && c[1] === 'left_back'));
}

/* ================================================================= 3. BÓNG MỜ (lõi) */
console.log('\n== 3. Mục tiêu bong-mo: thắng khi chạy xong ==');
{
  const BM = (bongMo, extra) => Object.assign({ mucTieu: 'bong-mo', bongMo }, extra || {});
  const TIEN = L('left_move()', 'right_move()', 'wait()');
  const QUAY_PHAI = L('left_move()', 'wait()');
  const QUAY_TRAI = L('right_move()', 'wait()');
  const bd = { x: 2, y: 3, huong: 0 };
  const dung = chay(TRONG, bd, TIEN, BM({ x: 2, y: 2, huong: 0 }));
  kiem('xe chạy xong đúng ô và đúng hướng của bóng mờ: thắng', dung.thang === true && vt(dung.robot) === '2,2' && dung.nhip === 1 && maSK(dung, 'toi-bong-mo').length === 0 && nhipVet(dung)[0].suKien.some((e) => e.ma === 'toi-bong-mo'));
  const quaRoi = chay(TRONG, bd, TIEN + TIEN, BM({ x: 2, y: 2, huong: 0 }));
  kiem('đi NGANG QUA bóng mờ rồi đi tiếp: chưa thắng (không thắng giữa đường), xe dừng ở (2,1)', quaRoi.thang === false && vt(quaRoi.robot) === '2,1' && quaRoi.nhip === 2);
  const saiHuong = chay(TRONG, bd, TIEN + QUAY_PHAI, BM({ x: 2, y: 2, huong: 0 }));
  kiem('dừng ĐÚNG Ô nhưng sai hướng: chưa thắng', saiHuong.thang === false && vt(saiHuong.robot) === '2,2' && saiHuong.robot.huong === 1);
  const dungSauQuay = chay(TRONG, bd, TIEN + QUAY_PHAI + QUAY_TRAI, BM({ x: 2, y: 2, huong: 0 }));
  kiem('xe quay sang rồi quay lại, chương trình hết đúng tư thế: thắng', dungSauQuay.thang === true && dungSauQuay.nhip === 3);
  kiem('thắng KHÔNG dừng chương trình sớm: các lệnh sau vẫn chạy hết (thắng xét ở cuối)', (() => { const k = chay(TRONG, bd, TIEN + L('wait()', 'wait()'), BM({ x: 2, y: 2, huong: 0 })); return k.thang && k.nhip === 3; })());
  const treo = chay(TRONG, bd, L('left_move()', 'right_move()'), BM({ x: 2, y: 2, huong: 0 }));
  kiem('lệnh bánh còn treo (quên wait()): chưa chạy nên không thắng, và có quen-wait', treo.thang === false && vt(treo.robot) === '2,3' && maSK(treo, 'quen-wait').length === 1);
  const loiChay = chay(TRONG, bd, TIEN + 'x = 1 / 0\n', BM({ x: 2, y: 2, huong: 0 }));
  kiem('chương trình dừng vì lỗi chạy (loi) thì không thắng dù xe đứng đúng chỗ', loiChay.thang === false && !!loiChay.loi && vt(loiChay.robot) === '2,2');
  const quaNhip = chay(TRONG, bd, 'for i in range(500):\n    wait()\n', BM({ x: 2, y: 3, huong: 0 }), { nhipToiDa: 30 });
  kiem('quá nhịp (qua-nhieu-nhip) thì không thắng dù bóng mờ ngay chỗ xe đứng', quaNhip.thang === false && quaNhip.loi && quaNhip.loi.loai === 'qua-nhieu-nhip');
  kiem('chương trình rỗng, bóng mờ ngay chỗ xe xuất phát: thắng ngay (0 nhịp)', chay(TRONG, bd, '', BM({ x: 2, y: 3, huong: 0 })).thang === true);

  // ô diQua
  const dq = BM({ x: 2, y: 1, huong: 0, diQua: [{ x: 2, y: 2 }] });
  const quaDiem = chay(TRONG, bd, TIEN + TIEN, dq);
  kiem('có ô diQua: đi qua nó rồi tới bóng mờ thì thắng', quaDiem.thang === true && quaDiem.diQua.length === 1 && quaDiem.diQua[0].da === true && vt(quaDiem.diQua[0]) === '2,2');
  const ev = nhipVet(quaDiem).map((n) => n.suKien.filter((e) => e.ma === 'qua-diem'));
  kiem('sự kiện qua-diem ghi ở NHỊP xe tới ô diQua lần đầu, kèm ô { x, y }; nhịp sau không ghi lại', ev[0].length === 1 && ev[0][0].o.x === 2 && ev[0][0].o.y === 2 && ev[0][0].nhip === 1 && ev[1].length === 0);
  kiem('vết nhịp có diQua [{ x, y, da }]: nhịp 1 đã sáng (da true)', nhipVet(quaDiem)[0].diQua.length === 1 && nhipVet(quaDiem)[0].diQua[0].da === true);
  const vongDiem = chay(TRONG, bd, TIEN + L('left_move()', 'wait()', 'left_move()', 'wait()') + TIEN + L('left_move()', 'wait()', 'left_move()', 'wait()') + TIEN, dq);
  kiem('đi qua ô diQua nhiều lần chỉ ghi qua-diem một lần', nhipVet(vongDiem).reduce((n, t) => n + t.suKien.filter((e) => e.ma === 'qua-diem').length, 0) === 1);
  const boQua = chay(TRONG, bd, L('left_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'right_move()', 'wait()', 'right_move()', 'left_move()', 'wait()') , BM({ x: 2, y: 3, huong: 0, diQua: [{ x: 2, y: 1 }] }));
  kiem('bóng mờ đúng nhưng chưa ghé ô diQua: chưa thắng, diQua[0].da false', boQua.thang === false && boQua.diQua[0].da === false);
  const tuQuaDiem = chay(['.....', '.....', '.....', '.....', '.....'], { x: 2, y: 4, huong: 0 }, TIEN + TIEN + L('left_move()', 'wait()', 'left_move()', 'wait()') + TIEN + TIEN, BM({ x: 2, y: 4, huong: 2, diQua: [{ x: 2, y: 2 }] }));
  kiem('đi qua ◆ rồi quay đầu về chỗ xuất phát thì thắng nếu bóng mờ ở đó (hướng xuống)', tuQuaDiem.thang === true && tuQuaDiem.diQua[0].da === true && vt(tuQuaDiem.robot) === '2,4' && tuQuaDiem.robot.huong === 2, J([tuQuaDiem.thang, tuQuaDiem.robot]));
  kiem('ô diQua cũng được tính khi xe bị băng chuyền đẩy tới (cuối nhịp đứng ở ô đó)',
    (() => { const k = chay(['.....', '.....', '..>..', '.....', '.....'], { x: 2, y: 2, huong: 1 }, L('wait()', 'wait()'), BM({ x: 3, y: 2, huong: 1, diQua: [{ x: 3, y: 2 }] })); return k.diQua[0].da === true && k.thang === true; })());

  // vật đúng ô
  const sanVat = ['.....', '.....', '..o..', '.....', '.....'];
  const vatDung = chay(sanVat, { x: 2, y: 4, huong: 0 }, '', BM({ x: 2, y: 4, huong: 0, vat: [{ x: 2, y: 2 }] }));
  const vatSai = chay(sanVat, { x: 2, y: 4, huong: 0 }, '', BM({ x: 2, y: 4, huong: 0, vat: [{ x: 3, y: 2 }] }));
  const vatThua = chay(sanVat, { x: 2, y: 4, huong: 0 }, '', BM({ x: 2, y: 4, huong: 0, vat: [{ x: 2, y: 2 }, { x: 3, y: 2 }] }));
  kiem('bongMo.vat: vật nằm đúng ô khai thì thắng; sai ô hay thiếu / thừa vật thì chưa thắng', vatDung.thang === true && vatSai.thang === false && vatThua.thang === false);

  // cấu hình sai
  const nem = (f) => { try { f(); return false; } catch (e) { return /bong|diQua|Bóng|bóng|Mục tiêu|không đứng|dao/i.test(e.message); } };
  kiem('cấu hình sai bị từ chối bằng lỗi tiếng Việt: thiếu bongMo; bóng mờ trong tường; hướng sai; diQua trong tường; bongMo với mục tiêu khác',
    nem(() => chay(TRONG, bd, '', { mucTieu: 'bong-mo' })) && nem(() => chay(['.....', '..#..', '.....'], { x: 0, y: 2, huong: 0 }, '', BM({ x: 2, y: 1, huong: 0 }))) &&
      nem(() => chay(TRONG, bd, '', BM({ x: 2, y: 2, huong: 7 }))) && nem(() => chay(['.....', '..#..', '.....'], { x: 0, y: 2, huong: 0 }, '', BM({ x: 3, y: 1, huong: 0, diQua: [{ x: 2, y: 1 }] }))) &&
      nem(() => chay(TRONG, bd, '', { bongMo: { x: 2, y: 2, huong: 0 } })));
  kiem('SanHoc.MUC_TIEU có bong-mo; mục tiêu lạ vẫn bị từ chối', SanHoc.MUC_TIEU.includes('bong-mo') && (() => { try { chay(TRONG, bd, '', { mucTieu: 'lung-tung' }); return false; } catch (e) { return /lạ/.test(e.message); } })());
  const nhieuSan = ChamHoc.cham({ chuong: 'x', loaiRobot: 'banh', hamGoc: BANH_DU, mucTieu: 'bong-mo', san: [TRONG, TRONG], batDau: [{ x: 2, y: 3, huong: 0 }, { x: 2, y: 4, huong: 0 }], bongMo: [{ x: 2, y: 2, huong: 0 }, { x: 2, y: 3, huong: 0 }], khung: { chinh: 10, moiHam: 10 } }, { chinh: ['left_move()', 'right_move()', 'wait()'] }, []);
  kiem('màn nhiều sân: bongMo là mảng song song với san, thắng khi thắng cả hai sân; kết quả có bongMo / diQua của từng sân', nhieuSan.thang === true && nhieuSan.theoSan.length === 2 && nhieuSan.theoSan[0].bongMo.y === 2 && nhieuSan.theoSan[1].bongMo.y === 3);
}

/* ================================================================= 4. ĐẤU DÂY NGƯỢC */
console.log('\n== 4. daoChieu: đấu dây ngược ==');
{
  const dc = (code, dao, extra) => chay(TRONG, bd0, code, Object.assign({ daoChieu: dao }, extra || {}));
  const move = L('left_move()', 'right_move()', 'wait()');
  const ts = dc(move, ['trai']);
  kiem('daoChieu ["trai"]: left_move() làm bánh trái quay LÙI nên move() thành quay đầu tại chỗ', ts.robot.huong === 2 && vt(ts.robot) === '4,2', J(ts.robot));
  kiem('vết lệnh vẫn ghi tên lệnh người chơi gọi (left_move), còn tổ hợp bánh thật nằm ở vết nhịp: { trai: -1, phai: 1 }',
    ts.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten).join() === 'left_move,right_move,wait' && J(nhipVet(ts)[0].robot.banh) === J({ trai: -1, phai: 1 }));
  const tien = dc(L('left_back()', 'right_move()', 'wait()'), ['trai']);
  kiem('left_back() + right_move() với dây trái ngược: xe TIẾN một ô', vt(tien.robot) === '4,1' && tien.robot.huong === 0);
  const lui = dc(L('left_move()', 'right_back()', 'wait()'), ['trai']);
  kiem('left_move() + right_back() với dây trái ngược: xe LÙI một ô', vt(lui.robot) === '4,3' && lui.robot.huong === 0);
  kiem('daoChieu ["phai"] đối xứng: right_back() + left_move() tiến', vt(dc(L('left_move()', 'right_back()', 'wait()'), ['phai']).robot) === '4,1');
  kiem('daoChieu ["trai", "phai"]: cả hai bánh ngược nên move() thành lùi', vt(dc(move, ['trai', 'phai']).robot) === '4,3');
  kiem('daoChieu rỗng hay không khai: như bình thường', vt(dc(move, []).robot) === '4,1' && vt(chay(TRONG, bd0, move).robot) === '4,1');
  kiem('turn_right() thường (left_move + wait) với dây trái ngược thành quay TRÁI; quay trái (right_move + wait) vẫn quay trái', dc(L('left_move()', 'wait()'), ['trai']).robot.huong === 3 && dc(L('right_move()', 'wait()'), ['trai']).robot.huong === 3);
  kiem('banh-goi-lai vẫn bắt hai lệnh cùng một bánh trong nhịp khi dây ngược', maSK(dc(L('left_move()', 'left_back()', 'right_move()', 'wait()'), ['trai']), 'banh-goi-lai').length === 1);
  const nem = (f) => { try { f(); return false; } catch (e) { return /daoChieu/.test(e.message); } };
  kiem('daoChieu sai bị từ chối: không phải mảng, tên lạ, nhện / drone', nem(() => dc('', 'trai')) && nem(() => dc('', ['giua'])) && nem(() => SanHoc.chay({ san: TRONG, batDau: bd0, loaiRobot: 'nhen', daoChieu: ['trai'] }, '')) && nem(() => SanHoc.chay({ san: TRONG, batDau: bd0, loaiRobot: 'drone', daoChieu: ['trai'] }, '')));
  kiem('bộ dò đường: toHopChoPhep tính daoChieu (dây ngược vẫn đủ sáu hiệu quả vì còn đủ hai chiều)', J(toHopChoPhep({ loaiRobot: 'banh', hamGoc: BANH_DU, daoChieu: ['trai'] }).sort()) === J(['cho', 'dau', 'lui', 'phai', 'tien', 'trai']));
}

/* ================================================================= 5. KHAY VÀ PHẦN CỨNG */
console.log('\n== 5. Khay (hamGoc) và phần cứng (phanCung): lenh-chua-mo, lenh-goc-hong ==');
{
  const KHAY_TIEN = ['left_move', 'right_move', 'wait'];
  const manTam = (extra) => Object.assign({ chuong: 'thu', loaiRobot: 'banh', hamGoc: KHAY_TIEN, moXuong: true, camHamCuaEm: false, khung: { chinh: 10, moiHam: 10 }, cauTruc: [], san: ['.....', '.....', '.....', '.....', '.....'], batDau: { x: 2, y: 3, huong: 0 }, mucTieu: 'bong-mo', bongMo: { x: 2, y: 4, huong: 0 } }, extra || {});
  kiem('phanCungMacDinh xe bánh = trọn bộ lệnh (có cả left_back, right_back) cộng lệnh khay; nhện không có lệnh bánh; phanCungCua tôn trọng man.phanCung',
    J(SanHoc.phanCungMacDinh('banh', KHAY_TIEN)) === J(['left_move', 'right_move', 'left_back', 'right_back', 'wait']) && !SanHoc.phanCungMacDinh('nhen', ['go_up']).includes('left_move') && SanHoc.phanCungMacDinh('banh', ['arm_down']).includes('arm_down') &&
      J(SanHoc.phanCungCua({ loaiRobot: 'banh', hamGoc: KHAY_TIEN, phanCung: ['left_back', 'wait'] })) === J(['left_back', 'wait']));

  const lui1 = (code, hamEm) => ChamHoc.cham(manTam(), { chinh: code }, hamEm || []);
  const hamLui = [H('lui', ['left_back()', 'right_back()', 'wait()'])];
  const rLui = lui1(['lui()'], hamLui);
  kiem('hàm của em gọi được left_back / right_back dù khay chưa mở: xe lùi một ô', maLoi(rLui).length === 0 && vt(rLui.theoSan[0].robot) === '2,4' && rLui.soNhip === 1, J(rLui.chanDoan));
  const rChinh = lui1(['left_back()', 'right_back()', 'wait()']);
  kiem('chương trình chính gõ thẳng left_back() khi khay chưa mở: lenh-chua-mo (không phải ham-chua-co), có cho trỏ dòng 1 của chương trình, nêu lệnh trên khay',
    J(maCua(rChinh)) === '["lenh-chua-mo"]' && rChinh.chanDoan[0].ten === 'left_back' && J(rChinh.chanDoan[0].cho) === J({ cot: 'chinh', dong: 1 }) && /chưa có trên khay/.test(rChinh.chanDoan[0].loi) && /left_move, right_move, wait/.test(rChinh.chanDoan[0].loi), J(rChinh.chanDoan));
  kiem('lenh-chua-mo dừng chương trình tại lệnh đó: những lệnh trước nó vẫn chạy, 0 sao', (() => { const r = lui1(['left_move()', 'right_move()', 'wait()', 'left_back()']); return r.sao === 0 && !r.thang && r.theoSan[0].robot.y === 2 && maCua(r).join() === 'lenh-chua-mo'; })());
  const hamMan = ChamHoc.cham(manTam(), { chinh: ['f()'], hamCuaMan: [H('f', ['right_back()', 'wait()'])] }, []);
  kiem('hàm CỦA MÀN gọi left_back / right_back khi khay chưa mở cũng lenh-chua-mo, cho trỏ cot hamMan', J(maCua(hamMan)) === '["lenh-chua-mo"]' && hamMan.chanDoan[0].cho.cot === 'hamMan' && hamMan.chanDoan[0].cho.ten === 'f');
  const khayDu = ChamHoc.cham(manTam({ hamGoc: BANH_DU }), { chinh: ['left_back()', 'right_back()', 'wait()'] }, []);
  kiem('khay mở left_back / right_back (từ 3.4) thì chương trình chính gọi thẳng được', maLoi(khayDu).length === 0 && khayDu.theoSan[0].robot.y === 4);
  kiem('tên hoàn toàn lạ (fly) vẫn là ham-chua-co như cũ', J(maCua(lui1(['fly()']))) === '["ham-chua-co"]');
  kiem('SanHoc.chay gọi thẳng (không có phanCung / nguonDong) giữ hành vi cũ: left_back ngoài khay là "Chưa có biến hay hàm" (lỗi của nhân), không phải lenh-chua-mo',
    (() => { const k = SanHoc.chay({ san: TRONG, batDau: bd0, loaiRobot: 'banh', hamGoc: KHAY_TIEN }, 'left_back()'); return k.loi && k.loi.loai === 'runtime-error' && /Chưa có biến hay hàm/.test(k.loi.thongDiep) && k.loi.ma === undefined; })());
  kiem('cấu hình sai: khay có lệnh mà phần cứng không có → lỗi; lệnh phần cứng không thuộc loại robot → lỗi',
    (() => { try { SanHoc.chay({ san: TRONG, batDau: bd0, loaiRobot: 'banh', hamGoc: KHAY_TIEN, phanCung: ['left_move', 'wait'] }, ''); return false; } catch (e) { return /phần cứng/.test(e.message); } })() &&
      (() => { try { SanHoc.chay({ san: TRONG, batDau: bd0, loaiRobot: 'banh', hamGoc: KHAY_TIEN, phanCung: KHAY_TIEN.concat(['go_up']) }, ''); return false; } catch (e) { return /không thuộc loại robot/.test(e.message); } })());

  // màn hỏng (phanCung hẹp): 3.9
  const m9 = man(9);
  const kho9 = khoTruoc(m9.id);
  const hong = ChamHoc.cham(m9, m9.maMau, kho9);
  const cd = hong.chanDoan.find((c) => c.ma === 'lenh-goc-hong');
  kiem('3.9 chạy bản mẫu (turn_left cũ dùng right_move): lenh-goc-hong, KHÔNG phải ham-chua-co; có cho trỏ dòng 1 của hàm turn_left; lời nêu canhBao, tên lệnh và lệnh còn chạy được',
    !!cd && J(maCua(hong)) === '["lenh-goc-hong"]' && J(cd.cho) === J({ cot: 'hamEm', dong: 1, ten: 'turn_left' }) && cd.ten === 'right_move' && /Xe chỉ còn số lùi/.test(cd.loi) && /right_move\(\) không chạy được ở màn này/.test(cd.loi) && /left_back, right_back, wait/.test(cd.loi), J(hong.chanDoan));
  kiem('3.9: phần cứng KHÔNG gồm bánh tiến nên hàm cũ của em (move, turn_right) hỏng; hamGoc = phanCung = [left_back, right_back, wait]', m9.phanCung.every((t) => !/_move$/.test(t)) && J(m9.hamGoc) === J(m9.phanCung) && m9.canhBao === 'Xe chỉ còn số lùi');
  const chinhTrucTiep = ChamHoc.cham(Object.assign({}, m9, { chinhCoDinh: false }), { chinh: ['left_move()', 'right_move()', 'wait()'] }, kho9);
  kiem('3.9: chương trình chính gõ thẳng left_move() (bánh tiến hỏng): lenh-goc-hong với cho cot chinh (không phải lenh-chua-mo)', J(maCua(chinhTrucTiep)) === '["lenh-goc-hong"]' && chinhTrucTiep.chanDoan[0].cho.cot === 'chinh');
  const sanThu = ChamHoc.thuHam(m9, { chinh: [] }, 'turn_right', kho9);
  kiem('3.9: sân thử trong Xưởng hàm cũng báo lenh-goc-hong khi thử turn_right() cũ', maCua(sanThu).includes('lenh-goc-hong') && sanThu.chanDoan.find((c) => c.ma === 'lenh-goc-hong').cho.ten === 'turn_right', J(sanThu.chanDoan));
  const sanThuOk = ChamHoc.thuHam(m9, { chinh: [] }, 'turn_right', tron(kho9, [H('turn_right', ['right_back()', 'wait()'])]));
  kiem('3.9: sau khi sửa turn_right() sang bánh lùi, sân thử chạy được và xe quay phải', maLoi(sanThuOk).length === 0 && sanThuOk.robot.huong === 1, J(sanThuOk.chanDoan));
  // dùng chung với mọi màn khác: turn_right / turn_left sửa vẫn đúng
  const phai = ChamHoc.thuHam(man(1), { chinh: [] }, 'turn_right', tron(khoTruoc(man(1).id), [H('turn_right', ['right_back()', 'wait()'])]));
  const trai = ChamHoc.thuHam(man(1), { chinh: [] }, 'turn_left', tron(khoTruoc(man(1).id), [H('turn_left', ['left_back()', 'wait()'])]));
  kiem('turn_right = right_back + wait quay phải, turn_left = left_back + wait quay trái ở màn thường (đúng ở mọi màn khác)', phai.robot.huong === 1 && trai.robot.huong === 3 && maLoi(phai).length === 0 && maLoi(trai).length === 0);
}

/* ================================================================= 6. CHƯƠNG TRÌNH CHÍNH CỐ ĐỊNH */
console.log('\n== 6. chinhCoDinh và khoaHamMan ==');
{
  const m1 = man(1), k1 = tron(khoTruoc(m1.id), m1.loiGiai.hamCuaEmMoi);
  const chuan = ChamHoc.cham(m1, m1.loiGiai, k1);
  const doi = ChamHoc.cham(m1, { chinh: ['wait()', 'wait()', 'move()'] }, k1);
  const trong = ChamHoc.cham(m1, { chinh: [] }, k1);
  const ganDoi = (r) => J([r.thang, r.sao, r.soO, r.soNhip, r.chanDoan.map((c) => c.ma), r.py, r.chiTietO]);
  kiem('chinhCoDinh: gửi chương trình chính KHÁC hay RỖNG lên, máy chấm vẫn chạy maMau.chinh (cùng kết quả, cùng mã Python, cùng số ô)', ganDoi(doi) === ganDoi(chuan) && ganDoi(trong) === ganDoi(chuan) && chuan.thang && chuan.sao === 3);
  const tuy = ChamHoc.cham(Object.assign({}, m1, { chinhCoDinh: false }), { chinh: [] }, k1);
  kiem('không chinhCoDinh thì chương trình chính gửi lên có tác dụng (rỗng thì không thắng)', !tuy.thang);
  const m3 = man(3);
  kiem('3.3 và 3.10 KHÔNG chinhCoDinh (người chơi tự viết chương trình chính): chương trình rỗng không thắng; maMau.chinh rỗng',
    [man(3), man(10)].every((m) => m.chinhCoDinh !== true && m.maMau.chinh.length === 0 && !ChamHoc.cham(m, { chinh: [] }, khoTruoc(m.id)).thang) && m3.loiGiai.chinh.length <= m3.khung.chinh);
  const m7 = man(7), k7 = tron(khoTruoc(m7.id), m7.loiGiai.hamCuaEmMoi);
  const comeBack = m7.loiGiai.hamCuaMan.find((h) => h.ten === 'come_back');
  const goOutHong = ChamHoc.cham(m7, { chinh: [], hamCuaMan: [H('go_out', ['move()']), comeBack] }, k7);
  const goOutChuan = ChamHoc.cham(m7, m7.loiGiai, k7);
  kiem('khoaHamMan ["go_out"]: gửi go_out bị sửa lên, máy chấm vẫn dùng bản mẫu của màn (cùng kết quả, 3 sao)', ganDoi(goOutHong) === ganDoi(goOutChuan) && goOutChuan.sao === 3);
  const goOutThieu = ChamHoc.cham(m7, { chinh: [], hamCuaMan: [comeBack] }, k7);
  kiem('khoaHamMan: gửi lên không có go_out thì máy chấm vẫn đặt bản mẫu vào (người chơi không xóa được)', J([goOutThieu.thang, goOutThieu.sao, goOutThieu.soO, goOutThieu.soNhip, goOutThieu.chanDoan.map((c) => c.ma)]) === J([goOutChuan.thang, goOutChuan.sao, goOutChuan.soO, goOutChuan.soNhip, goOutChuan.chanDoan.map((c) => c.ma)]) && goOutThieu.py.includes('def go_out():'));
  kiem('khoaHamMan chỉ khóa go_out: come_back (hàm của màn người chơi viết) KHÔNG khóa — gửi bản khác lên thì máy chấm dùng bản đó (pass thì thua, bản đúng thì thắng)', J(m7.khoaHamMan) === '["go_out"]' && !ChamHoc.cham(m7, { chinh: [], hamCuaMan: [H('come_back', ['pass'])] }, k7).thang && goOutChuan.thang);
  kiem('bản mẫu của màn và bài làm gốc không bị đụng khi chấm (không tác dụng phụ)', J(m7.maMau.hamCuaMan[0].than) === J(['move()', 'move()', 'turn_right()', 'move()']) && J(m7.maMau.hamCuaMan[1].than) === J(['pass']) && J(m1.maMau.chinh) === J(['dodge_right()']));
}

/* ================================================================= 7. CHẨN ĐOÁN BẰNG LỜI */
console.log('\n== 7. Chẩn đoán lech-bong-mo, chua-qua-diem ==');
{
  const manBM = (bongMo, extra) => Object.assign({ chuong: 'thu', loaiRobot: 'banh', hamGoc: BANH_DU, moXuong: true, camHamCuaEm: false, khung: { chinh: 10, moiHam: 10 }, cauTruc: [], mucTieu: 'bong-mo', san: TRONG, batDau: { x: 2, y: 3, huong: 0 }, bongMo }, extra || {});
  const TIEN = ['left_move()', 'right_move()', 'wait()'];
  const qua = (m, chinh) => ChamHoc.cham(m, { chinh }, []);
  const b = { x: 2, y: 2, huong: 0 };
  const lt = qua(manBM(b), ['right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'wait()']);                 // quay trái, tiến, quay phải: sang trái 1 ô, mặt lên → ở (1,3)
  const lechTrai = qua(manBM({ x: 2, y: 3, huong: 0 }), ['right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'wait()']);
  kiem('xe lệch một ô sang trái (đúng hướng): lech-bong-mo nói "Xe dừng lệch một ô về bên trái so với bóng mờ."',
    lechTrai.chanDoan.length === 1 && lechTrai.chanDoan[0].ma === 'lech-bong-mo' && lechTrai.chanDoan[0].loi === 'Xe dừng lệch một ô về bên trái so với bóng mờ.' && lechTrai.chanDoan[0].dx === -1 && lechTrai.chanDoan[0].dy === 0 && lechTrai.chanDoan[0].saiHuong === false, J(lechTrai.chanDoan));
  kiem('lech-bong-mo kèm robot { x, y, huong } và bongMo { x, y, huong } cho giao diện', J(lechTrai.chanDoan[0].robot) === J({ x: 1, y: 3, huong: 0 }) && J(lechTrai.chanDoan[0].bongMo) === J({ x: 2, y: 3, huong: 0 }));
  const phia = (chinh, bm, bd) => qua(manBM(bm, bd ? { batDau: bd } : {}), chinh).chanDoan.find((c) => c.ma === 'lech-bong-mo');
  kiem('xe lệch về phía trên bóng mờ: "Xe dừng lệch một ô về phía trên so với bóng mờ."', phia([], { x: 2, y: 4, huong: 0 }).loi === 'Xe dừng lệch một ô về phía trên so với bóng mờ.', J(phia([], { x: 2, y: 4, huong: 0 })));
  kiem('xe lệch về phía dưới bóng mờ: "Xe dừng lệch hai ô về phía dưới so với bóng mờ."', phia([], { x: 2, y: 1, huong: 0 }).loi === 'Xe dừng lệch hai ô về phía dưới so với bóng mờ.', J(phia([], { x: 2, y: 1, huong: 0 })));
  kiem('xe lệch cả hai phương: "Xe dừng lệch một ô về bên phải và một ô về phía dưới so với bóng mờ."', phia([], { x: 1, y: 2, huong: 0 }).loi === 'Xe dừng lệch một ô về bên phải và một ô về phía dưới so với bóng mờ.', J(phia([], { x: 1, y: 2, huong: 0 })));
  kiem('xe lệch xa ba ô về bên phải: "Xe dừng lệch ba ô về bên phải so với bóng mờ."', phia([], { x: 1, y: 3, huong: 0 }, { x: 4, y: 3, huong: 0 }).loi === 'Xe dừng lệch ba ô về bên phải so với bóng mờ.', J(phia([], { x: 1, y: 3, huong: 0 }, { x: 4, y: 3, huong: 0 })));
  const dungOSaiHuong = qua(manBM(b), TIEN.concat(['left_move()', 'wait()']));
  kiem('đúng ô nhưng sai hướng: "Xe đứng đúng chỗ của bóng mờ nhưng quay mặt sang phải, còn bóng mờ quay mặt lên."',
    dungOSaiHuong.chanDoan.length === 1 && dungOSaiHuong.chanDoan[0].ma === 'lech-bong-mo' && dungOSaiHuong.chanDoan[0].loi === 'Xe đứng đúng chỗ của bóng mờ nhưng quay mặt sang phải, còn bóng mờ quay mặt lên.' && dungOSaiHuong.chanDoan[0].saiHuong === true, J(dungOSaiHuong.chanDoan));
  const lechVaSai = qua(manBM({ x: 2, y: 3, huong: 0 }), ['left_move()', 'wait()', 'left_move()', 'right_move()', 'wait()']);
  kiem('lệch ô và sai hướng cùng lúc: nói cả hai trong MỘT câu', lechVaSai.chanDoan.length === 1 && /^Xe dừng lệch một ô về bên phải so với bóng mờ, lại còn quay mặt sang phải trong khi bóng mờ quay mặt lên\.$/.test(lechVaSai.chanDoan[0].loi), J(lechVaSai.chanDoan));
  const xuongHuong = qua(manBM({ x: 2, y: 3, huong: 2 }), []);
  kiem('hướng nói bằng chữ màn hình: bóng mờ quay mặt xuống, xe quay mặt lên', /quay mặt lên, còn bóng mờ quay mặt xuống/.test(xuongHuong.chanDoan[0].loi), J(xuongHuong.chanDoan));
  const khongDiem = qua(manBM({ x: 2, y: 3, huong: 0, diQua: [{ x: 2, y: 1 }] }), []);
  kiem('chưa ghé ◆ (xe đứng sẵn ở bóng mờ): chỉ chua-qua-diem, không lech-bong-mo; kèm conLai và ô còn thiếu',
    J(maCua(khongDiem)) === '["chua-qua-diem"]' && khongDiem.chanDoan[0].conLai === 1 && J(khongDiem.chanDoan[0].o) === J({ x: 2, y: 1 }) && /điểm ◆/.test(khongDiem.chanDoan[0].loi) && !/còn thiếu/.test(khongDiem.chanDoan[0].loi), J(khongDiem.chanDoan));
  const haiDiem = qua(manBM({ x: 2, y: 3, huong: 0, diQua: [{ x: 2, y: 1 }, { x: 3, y: 1 }] }), []);
  kiem('hai điểm ◆ chưa ghé: nói "còn thiếu 2 điểm"', /còn thiếu 2 điểm/.test(haiDiem.chanDoan[0].loi) && haiDiem.chanDoan[0].conLai === 2);
  const lechVaDiem = qua(manBM({ x: 2, y: 2, huong: 0, diQua: [{ x: 4, y: 4 }] }), []);
  kiem('vừa lệch vừa chưa ghé ◆: có cả lech-bong-mo lẫn chua-qua-diem', J(maCua(lechVaDiem)) === '["lech-bong-mo","chua-qua-diem"]');
  const ok = qua(manBM(b), TIEN);
  kiem('xe đúng tư thế: thắng 1 sao, không có chẩn đoán nào', ok.thang && ok.chanDoan.length === 0 && ok.sao === 1 && ok.bongMo.x === 2 && Array.isArray(ok.diQua));
  const kqLoi = qua(manBM(b), TIEN.concat(['x = 1 / 0']));
  kiem('có lỗi chạy thì chỉ báo lỗi chạy, không thêm lech-bong-mo', J(maCua(kqLoi)) === '["loi-chay"]');
  const sanThu = ChamHoc.thuHam(manBM(b), { chinh: [] }, 'f', [H('f', TIEN)]);
  kiem('sân thử của Xưởng không có bóng mờ: không báo lech-bong-mo / chua-toi-co', maCua(sanThu).length === 0);
}

/* ================================================================= 8. MƯỜI MÀN CHE-XE */
console.log('\n== 8. Chương che-xe: dữ liệu và luật từng màn ==');
{
  kiem('đúng 10 màn, số 1..10, id 3.1…3.10 (chương thứ 3, sau xuong-ham, trước tay-gap), mã che-xe.1…, tên "Chế lệnh xe"',
    che.length === 10 && che.every((m, i) => m.so === i + 1 && m.id === '3.' + (i + 1) && m.ma === 'che-xe.' + (i + 1)) && ThuTu.thuTu[2] === 'che-xe' && ThuTu.thuTu[1] === 'xuong-ham' && ThuTu.thuTu[3] === 'tay-gap' && ThuTu.ten['che-xe'] === 'Chế lệnh xe' && !ThuTu.laDot2('che-xe'));
  kiem('tên các màn: Né phải, Né trái, Đường né, Bánh lùi, Quay đầu một nhịp, Đỗ lùi, Đường về, Đấu dây ngược, Chỉ còn số lùi, Bãi đỗ xe; hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu che-xe',
    J(che.map((m) => m.ten)) === J(['Né phải', 'Né trái', 'Đường né', 'Bánh lùi', 'Quay đầu một nhịp', 'Đỗ lùi', 'Đường về', 'Đấu dây ngược', 'Chỉ còn số lùi', 'Bãi đỗ xe']) &&
      J(che.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && che.every((m) => !!m.huyHieu === (m.so === 10)) && che[9].huyHieu.ma === 'che-xe' && che[9].huyHieu.ten === 'Huy hiệu Chế lệnh xe');
  kiem('lệnh chế ở từng màn (taoHam): dodge_right, dodge_left, —, back, —, park, —, —, —, —; 3.5 sửa u_turn, 3.9 sửa turn_right và turn_left; 3.7 và 3.8 viết / sửa HÀM CỦA MÀN (come_back, fixed_move), không tạo hàm của em',
    J(che.map((m) => m.taoHam)) === J([['dodge_right'], ['dodge_left'], [], ['back'], [], ['park'], [], [], [], []]) && che.filter((m) => [7, 8].includes(m.so)).every((m) => m.loiGiai.hamCuaEmMoi.length === 0 && (m.congThucKhac || []).every((c) => !c.hamCuaEmMoi || c.hamCuaEmMoi.length === 0)) &&
      J(man(5).loiGiai.hamCuaEmMoi.map((h) => h.ten)) === '["u_turn"]' && J(man(9).loiGiai.hamCuaEmMoi.map((h) => h.ten)) === '["turn_right","turn_left"]');
  kiem('3.1–3.3: khay chỉ left_move, right_move, wait nhưng phần cứng vẫn có bánh lùi (mặc định xe bánh); từ 3.4 khay mở left_back, right_back',
    [1, 2, 3].every((i) => J(man(i).hamGoc) === J(['left_move', 'right_move', 'wait']) && SanHoc.phanCungCua(man(i)).includes('left_back') && SanHoc.phanCungCua(man(i)).includes('right_back')) &&
      [4, 5, 6, 7, 8, 10].every((i) => man(i).hamGoc.includes('left_back') && man(i).hamGoc.includes('right_back')));

  for (const m of che) {
    const kho = khoTruoc(m.id);
    const khoNay = tron(kho, m.loiGiai.hamCuaEmMoi);
    const r = ChamHoc.cham(m, m.loiGiai, khoNay);
    kiem(m.id + ' ' + m.ten + ': lời giải cách 1 thắng 3 sao, ' + r.soO + ' ô = sao.o, ' + r.soNhip + ' nhịp = sao.nhip, không chẩn đoán nào',
      r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    const bfs = nhipCheXeTatCa(m, kho);
    kiem(m.id + ': BFS nhịp ngắn nhất trên PHẦN CỨNG của màn = sao.nhip (' + bfs + ')' + (m.khoaHamMan ? ' [tính cả đoạn go_out() cố định]' : ''), bfs === m.sao.nhip, 'BFS = ' + bfs + ', sao.nhip = ' + m.sao.nhip);
    // chương trình chính cố định / tự viết
    if (m.chinhCoDinh) {
      const gui = ChamHoc.cham(m, { chinh: ['wait()', 'wait()', 'wait()'], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính gửi lên bị bỏ qua (kết quả y hệt lời giải)', J([gui.thang, gui.soO, gui.soNhip, gui.py]) === J([r.thang, r.soO, r.soNhip, r.py]) && m.maMau.chinh.length >= 1 && m.maMau.chinh.length <= m.khung.chinh);
    } else {
      kiem(m.id + ': người chơi tự viết chương trình chính (maMau.chinh rỗng, lời giải ≤ 10 dòng)', m.maMau.chinh.length === 0 && m.loiGiai.chinh.length >= 1 && m.loiGiai.chinh.length <= 10);
    }
    // mục tiêu và bóng mờ
    if (m.mucTieu === 'bong-mo') {
      const bm = m.bongMo, san = SanHoc.docSan(m.san);
      kiem(m.id + ': bóng mờ (' + bm.x + ',' + bm.y + ') hướng ' + bm.huong + ' nằm trên ô đi được; kết quả chạy có bongMo, mỗi nhịp thắng đúng ở nhịp cuối',
        !SanHoc.lyDoChan(san, 'banh', bm.x, bm.y) && r.bongMo.x === bm.x && r.bongMo.huong === bm.huong && nhipVet(r).length === r.soNhip && r.theoSan[0].vet.filter((e) => e.loai === 'nhip').slice(-1)[0].suKien.some((e) => e.ma === 'toi-bong-mo'));
      // không thắng giữa đường: bất kỳ nhịp nào trước nhịp cuối mà xe đã đứng đúng tư thế thì sự kiện toi-bong-mo chỉ có ở nhịp cuối
      kiem(m.id + ': toi-bong-mo chỉ ghi ở nhịp cuối', nhipVet(r).slice(0, -1).every((n) => !n.suKien.some((e) => e.ma === 'toi-bong-mo')));
    } else {
      kiem(m.id + ': mục tiêu tới cờ (F) trên sân có cờ', m.mucTieu === undefined && m.san.join('').includes('F') && m.bongMo === undefined);
    }

    // cách chế khác: đều thắng
    kiem(m.id + ': có ít nhất 1 công thức khác (congThucKhac), khác cách 1 (hàm của em mới, hay — màn dùng hàm của màn — baiLam.hamCuaMan khác)', Array.isArray(m.congThucKhac) && m.congThucKhac.length >= 1 && m.congThucKhac.every((c) => c.moTa && (c.baiLam ? J(c.baiLam.hamCuaMan) !== J(m.loiGiai.hamCuaMan) : Array.isArray(c.hamCuaEmMoi) && c.hamCuaEmMoi.length >= 1 && J(c.hamCuaEmMoi) !== J(m.loiGiai.hamCuaEmMoi))));
    m.congThucKhac.forEach((c, i) => {
      const rc = ChamHoc.cham(m, c.baiLam || m.loiGiai, tron(khoNay, c.hamCuaEmMoi));
      kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng, không lỗi — ' + rc.sao + ' sao, ' + rc.soO + ' ô, ' + rc.soNhip + ' nhịp', rc.thang && maLoi(rc).length === 0, J({ thang: rc.thang, cd: rc.chanDoan.map((x) => x.ma) }));
    });
    // lời giải khác (chỉ thêm chú thích): 2 sao
    if (m.loiGiaiKhac) {
      const rk = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kho, m.loiGiaiKhac.hamCuaEmMoi));
      kiem(m.id + ': loiGiaiKhac (' + m.loiGiaiKhac.moTa + ') thắng đúng 2 sao, nhiều ô hơn, cùng nhịp', rk.thang && rk.sao === 2 && rk.soO > m.sao.o && rk.soNhip === m.sao.nhip, J({ sao: rk.sao, soO: rk.soO, soNhip: rk.soNhip }));
    }
    // lời sai
    m.loiSai.forEach((ls, i) => {
      const rs = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi));
      const co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): ' + (ls.phaiCoMa.length ? 'không thắng, có mã ' + ls.phaiCoMa.join('+') : 'thắng nhưng thiếu sao'),
        rs.sao < 3 && thieu.length === 0 && (ls.phaiCoMa.length ? !rs.thang : rs.thang), 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + rs.sao);
    });
    // hàm của em dùng được ở mọi màn: tên taoHam / sửa có trong đề bài
    const khoaTen = m.khoaHamMan || [];
    const suaTen = m.loiGiai.hamCuaEmMoi.map((h) => h.ten).concat(m.loiGiai.hamCuaMan.filter((h) => !khoaTen.includes(h.ten)).map((h) => h.ten));          // hàm em chế / sửa + hàm của màn người chơi viết / sửa
    kiem(m.id + ': đề bài nhắc tên lệnh cần chế / sửa (' + suaTen.join(', ') + ')', suaTen.every((t) => (m.deBai + ' ' + (m.veMaMau || '')).includes(t + '()')) || m.so === 3 || m.so === 10, m.deBai);
    kiem(m.id + ': gợi ý 1–2 câu, không nói tên nút; đề 1–3 câu', m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3);
  }

  // luật riêng từng màn
  const m3 = man(3), k3 = khoTruoc(m3.id);
  kiem('3.3 Đường né: hành lang rộng hai cột, vật cản so le; bắt buộc dùng lệnh né (viết từng bước quay thì tràn 10 ô); chương trình chính gõ left_back() khi khay chưa mở → lenh-chua-mo',
    !ChamHoc.cham(m3, m3.loiSai[2].baiLam, k3).thang && maCua(ChamHoc.cham(m3, m3.loiSai[2].baiLam, k3)).includes('tran-khung') && maCua(ChamHoc.cham(m3, { chinh: ['left_back()'] }, k3)).join() === 'lenh-chua-mo');
  const m4 = man(4), k4 = khoTruoc(m4.id);
  kiem('3.4 Bánh lùi: khay mở left_back, right_back; chương trình chính gọi thẳng left_back() chạy được; back() chế bằng u_turn, move, u_turn cũng tới (2 nhịp quay đầu cũ + 1 + 2 = 5 nhịp, 1 sao)',
    m4.hamGoc.includes('left_back') && maLoi(ChamHoc.cham(Object.assign({}, m4, { chinhCoDinh: false, batBuocTaoHam: false }), { chinh: ['left_back()', 'right_back()', 'wait()'] }, k4)).length === 0 && (() => { const r = ChamHoc.cham(m4, m4.loiGiai, tron(k4, m4.congThucKhac[0].hamCuaEmMoi)); return r.thang && r.soNhip === 5 && r.sao === 1; })());
  const m5 = man(5), k5 = khoTruoc(m5.id);
  const cu = ChamHoc.cham(m5, m5.maMau, k5);
  kiem('3.5 Quay đầu một nhịp: u_turn cũ (turn_right ×2) vẫn tới bóng mờ nhưng 4 nhịp > 3, 1 sao; sao nhịp CHỈ đạt bằng u_turn một nhịp; BFS nhịp = 3 cần quay đầu 1 nhịp',
    cu.thang && cu.soNhip === 4 && cu.sao === 1 && ChamHoc.cham(m5, m5.loiGiai, tron(k5, m5.loiGiai.hamCuaEmMoi)).sao === 3 && nhipCheXeNganNhat(m5).nhip === 3 && nhipCheXeNganNhat(m5, { phanCung: ['left_move', 'right_move', 'wait'] }).nhip === 4 && nhipCheXeNganNhat(m5, { phanCung: ['left_move', 'right_move', 'wait'] }).chuoi.length === 4,
    J([cu.thang, cu.soNhip, cu.sao]));
  kiem('3.5: quay đầu một nhịp = (trái tiến, phải lùi) hoặc (trái lùi, phải tiến); cả hai kiểu đều 3 sao', m5.congThucKhac.some((c) => J(c.hamCuaEmMoi[0].than) === J(['left_back()', 'right_move()', 'wait()'])) && ChamHoc.cham(m5, m5.loiGiai, tron(k5, m5.congThucKhac[0].hamCuaEmMoi)).sao === 3);
  const m6 = man(6), k6 = khoTruoc(m6.id);
  kiem('3.6 Đỗ lùi: park() cách 1 (turn_left, back) 2 nhịp, cách 2 (turn_right, move, u_turn) tới bóng mờ với kho đã có u_turn một nhịp: 3 nhịp, chậm hơn một nhịp, ít sao',
    ChamHoc.cham(m6, m6.loiGiai, tron(k6, m6.loiGiai.hamCuaEmMoi)).soNhip === 2 && (() => { const r = ChamHoc.cham(m6, m6.loiGiai, tron(k6, m6.congThucKhac[0].hamCuaEmMoi)); return r.thang && r.soNhip === 3 && r.sao < 3; })() && J(k6.find((h) => h.ten === 'u_turn').than) === J(['left_move()', 'right_back()', 'wait()']));
  const m7 = man(7), k7 = khoTruoc(m7.id);
  const pre = ChamHoc.cham(Object.assign({}, m7, { chinhCoDinh: false }), { chinh: ['go_out()'], hamCuaMan: m7.maMau.hamCuaMan }, k7);
  kiem('3.7 Đường về: go_out() của màn đưa xe ra (2,1) quay phải sau 4 nhịp; come_back() phải đưa về ô và hướng ban đầu; hàm của màn go_out khóa và xem được (có trong maMau, khoaHamMan)',
    pre.theoSan[0].soNhip === 4 && vt(pre.theoSan[0].robot) === '2,1' && pre.theoSan[0].robot.huong === 1 && J(m7.bongMo) === J({ x: m7.batDau.x, y: m7.batDau.y, huong: m7.batDau.huong }) && J(m7.khoaHamMan) === '["go_out"]' && m7.maMau.hamCuaMan.some((h) => h.ten === 'go_out'));
  kiem('3.7: come_back() là lệnh ngược của go_out() theo thứ tự ngược: go_out = move, move, turn_right, move → come_back = back, turn_left, back, back (move↔back, turn_right↔turn_left)',
    J(m7.loiGiai.hamCuaMan.find((h) => h.ten === 'come_back').than) === J(['back()', 'turn_left()', 'back()', 'back()']) && J(m7.maMau.hamCuaMan[0].than) === J(['move()', 'move()', 'turn_right()', 'move()']));
  const cb7 = m7.maMau.hamCuaMan.find((h) => h.ten === 'come_back'), r7 = ChamHoc.cham(m7, m7.maMau, k7);
  kiem('3.7: come_back() là HÀM CỦA MÀN: thân ban đầu chỉ có `pass` (hợp lệ, không phải lỗi cú pháp); để nguyên thì không thắng, xe đứng lại ở (2,1) quay phải: lech-bong-mo; không còn hàm của em mới, không taoHam; hamCuaEmCan vẫn đủ back, turn_left',
    J(cb7.than) === J(['pass']) && m7.taoHam.length === 0 && m7.loiGiai.hamCuaEmMoi.length === 0 && !r7.thang && J(maCua(r7)) === '["lech-bong-mo"]' && vt(r7.theoSan[0].robot) === '2,1' && ['back', 'turn_left'].every((t) => m7.hamCuaEmCan.includes(t)) && !maCua(r7).includes('loi-cu-phap'));
  const m8 = man(8), k8 = khoTruoc(m8.id);
  const thuMove = ChamHoc.thuHam(m8, { chinh: [] }, 'move', k8);
  kiem('3.8 Đấu dây ngược: daoChieu ["trai"], canhBao có chữ; move() cũ của em thành quay đầu (sân thử: hướng cuối xuống); fixed_move() = left_back + right_move tiến thẳng',
    J(m8.daoChieu) === '["trai"]' && /đấu ngược/.test(m8.canhBao) && thuMove.robot.huong === 2 && ChamHoc.cham(m8, m8.loiGiai, k8).sao === 3, J(thuMove.robot));
  const thuFm = ChamHoc.thuHam(m8, { chinh: [], hamCuaMan: m8.maMau.hamCuaMan }, 'fixed_move', k8);
  kiem('3.8: fixed_move() là HÀM CỦA MÀN: thân ban đầu = move() cũ (left_move, right_move, wait); trong sân thử nó quay đầu (hướng cuối xuống) vì bánh trái ngược; sửa thành left_back, right_move, wait thì tiến thẳng một ô; không taoHam, không hàm của em mới',
    J(m8.maMau.hamCuaMan.map((h) => h.ten)) === '["fixed_move"]' && J(m8.maMau.hamCuaMan[0].than) === J(['left_move()', 'right_move()', 'wait()']) && thuFm.robot.huong === 2 && m8.khoaHamMan === undefined && m8.taoHam.length === 0 && m8.loiGiai.hamCuaEmMoi.length === 0 &&
      (() => { const t = ChamHoc.thuHam(m8, { chinh: [], hamCuaMan: m8.loiGiai.hamCuaMan }, 'fixed_move', k8); return t.robot.huong === 0 && t.robot.y === 1 && maLoi(t).length === 0; })(), J(thuFm.robot));
  const m9 = man(9), k9 = khoTruoc(m9.id);
  const hopPhep = toHopChoPhep(m9).sort();
  kiem('3.9 Chỉ còn số lùi: phần cứng chỉ còn lùi, quay phải, quay trái, đứng yên (không tiến, không quay đầu); BFS = 7 và chuỗi không dùng bánh tiến',
    J(hopPhep) === J(['cho', 'lui', 'phai', 'trai']) && nhipCheXeNganNhat(m9).nhip === 7 && nhipCheXeNganNhat(m9).chuoi.every((a) => ['lui', 'phai', 'trai'].includes(a)));
  kiem('3.9: turn_right / turn_left sửa sang bánh lùi vào kho thì mọi màn khác vẫn đúng: lời giải 3.1 → 3.8 vẫn thắng với kho đó',
    che.filter((m) => m.so < 9).every((m) => ChamHoc.cham(m, m.loiGiai, tron(tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi), man(9).loiGiai.hamCuaEmMoi)).thang));
  const m10 = man(10), k10 = khoTruoc(m10.id);
  const khongDiem = nhipCheXeNganNhat(Object.assign({}, m10, { bongMo: Object.assign({}, m10.bongMo, { diQua: [] }) })).nhip;
  kiem('3.10 Bãi đỗ xe: có ◆ thì đường ngắn nhất dài hơn không có ◆ (' + khongDiem + ' < ' + m10.sao.nhip + ') — ◆ buộc xe chạy qua rồi lùi về; vết có qua-diem và diQua sáng',
    khongDiem < m10.sao.nhip && m10.bongMo.diQua.length === 1 && (() => { const r = ChamHoc.cham(m10, m10.loiGiai, k10); return r.diQua[0].da === true && r.theoSan[0].vet.some((e) => e.loai === 'nhip' && e.suKien.some((s) => s.ma === 'qua-diem')); })());
  kiem('3.10: dùng đủ lệnh chế (dodge_right, back, park) nhưng không dùng hàm thì tràn 10 ô; trùm không khóa chương trình chính; hamCuaEmCan có dodge_right, back, park', man(10).loiGiai.chinh.length === 9 && ['dodge_right', 'back', 'park'].every((t) => m10.hamCuaEmCan.includes(t)) && maCua(ChamHoc.cham(m10, m10.loiSai[3].baiLam, k10)).includes('tran-khung'));
  kiem('mọi màn che-xe: sao.nhip = BFS KHÔNG thua BFS chỉ-với-lệnh-trên-khay ở 3.1–3.3 (lùi không cho đường tắt ở màn chưa mở lùi)',
    [1, 2, 3].every((i) => nhipCheXeNganNhat(man(i), { phanCung: ['left_move', 'right_move', 'wait'] }).nhip === man(i).sao.nhip));
  kiem('bộ dò đường tự kiểm: bỏ vật cản của 3.1 thì bóng mờ vẫn 3 nhịp; mở lối tắt trong 3.3 (bỏ tường hành lang) thì BFS ngắn hơn sao.nhip; hành lang đúng nguyên bản thì đúng 15',
    nhipCheXeNganNhat(Object.assign({}, man(1), { san: TRONG })).nhip === 3 && nhipCheXeNganNhat(Object.assign({}, man(3), { san: ['..F.', '....', '....', '....', '....', '....', '....'], batDau: { x: 1, y: 6, huong: 0 } })).nhip < man(3).sao.nhip && nhipCheXeNganNhat(man(3)).nhip === 15);
}

/* ================================================================= 9. KẾ HOẠCH 3.3b: CHƠI LẠI CÁC CHƯƠNG CŨ */
console.log('\n== 9. Chơi lại các chương cũ với u_turn một nhịp và turn_right / turn_left bằng bánh lùi ==');
{
  const SUA = { u_turn: ['left_move()', 'right_back()', 'wait()'], turn_right: ['right_back()', 'wait()'], turn_left: ['left_back()', 'wait()'] };
  const day = khoTruoc('het');
  const nhanh = tron(day, Object.keys(SUA).map((t) => H(t, SUA[t])));
  kiem('kho thử có u_turn = left_move, right_back, wait; turn_right = right_back, wait; turn_left = left_back, wait',
    Object.keys(SUA).every((t) => J(nhanh.find((h) => h.ten === t).than) === J(SUA[t])));
  for (const ch of ['xuong-ham', 'tay-gap', 'vong-lap', 'khoang-cach']) {
    const dsCh = tatCa.filter((m) => m.chuong === ch);
    const bangKq = dsCh.map((m) => {
      const goc = m.loiGiai.hamCuaEmMoi.filter((h) => !SUA[h.ten]);
      return ChamHoc.cham(m, m.loiGiai, tron(nhanh, goc));
    });
    kiem('chương ' + ch + ': cả 10 lời giải vẫn thắng, không chẩn đoán lỗi, không chậm hơn sao.nhip (dùng bản hàm sửa trong kho)',
      bangKq.every((r, i) => r.thang && maLoi(r).length === 0 && r.soNhip <= dsCh[i].sao.nhip), J(bangKq.map((r, i) => dsCh[i].id + ':' + r.thang + '/' + r.soNhip + '≤' + dsCh[i].sao.nhip)));
  }
  const dsKhac = tatCa.filter((m) => !['hai-banh', 'che-xe'].includes(m.chuong) && m.ma !== 'che-tay.9' && m.ma !== 'robot-hoan-thien.9' && m.ma !== 'che-may-nem.8');           // che-tay.9 (bánh phải kẹt số lùi) tự sửa lại turn_right / u_turn bằng bánh khác: kiem-che-tay.mjs kiểm riêng; robot-hoan-thien.9 (cũng bánh phải kẹt số lùi) dùng u_turn đã sửa đó của kho: kiem-robot-hoan-thien.mjs kiểm riêng
  const loiKhac = dsKhac.filter((m) => { const r = ChamHoc.cham(m, m.loiGiai, tron(nhanh, m.loiGiai.hamCuaEmMoi.filter((h) => !SUA[h.ten]))); return !(r.thang && maLoi(r).length === 0); }).map((m) => m.id);
  kiem('mọi chương còn lại (' + dsKhac.length + ' màn, kể cả đợt 2: xích, omni, băng chuyền…) cũng vẫn thắng với kho đó', loiKhac.length === 0, loiKhac.join());
  const xichSan = ['.....', '.....', '.....', '.....', '.....'], xichBd = { x: 2, y: 3, huong: 0 };
  const xich = (code) => SanHoc.chay({ san: xichSan, batDau: xichBd, loaiRobot: 'xich', hamGoc: BANH_DU }, code);
  kiem('xích: turn_right() mới (right_back + wait) cũng chỉ nửa vòng một lần, hai lần liền đủ 90° (giống turn_right() cũ left_move + wait)',
    xich(L('right_back()', 'wait()')).robot.huong === 0 && xich(L('right_back()', 'wait()', 'right_back()', 'wait()')).robot.huong === 1 && xich(L('left_move()', 'wait()', 'left_move()', 'wait()')).robot.huong === 1);
}

/* ================================================================= 10. THẺ SCRIPT CỦA GAME */
console.log('\n== 10. game/choi.html nạp man-che-xe.js và so-lenh.js đúng thứ tự ==');
{
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có thẻ script ../so-lenh.js và ../man-che-xe.js, mỗi thẻ đúng một lần', tags.filter((t) => t === '../so-lenh.js').length === 1 && tags.filter((t) => t === '../man-che-xe.js').length === 1, J(tags));
  kiem('man-che-xe.js nạp sau man-chuoi-2.js (cùng sổ màn) và trước man-tay-gap.js; so-lenh.js nạp sau thu-tu-chuong.js và trước man-chuoi-1.js',
    vtri('man-che-xe.js') > vtri('man-chuoi-2.js') && vtri('man-che-xe.js') < vtri('man-tay-gap.js') && vtri('so-lenh.js') > vtri('thu-tu-chuong.js') && vtri('so-lenh.js') < vtri('man-chuoi-1.js'));
  kiem('mọi tệp lõi được nạp đều tồn tại trên đĩa', tags.filter((t) => t.startsWith('../') && !t.includes('/nhan/')).every((t) => fs.existsSync(path.join(day, 'game', t))));
}

/* ================================================================= BẢNG */
console.log('\n  Bảng 10 màn che-xe (lời giải cách 1, sao)');
console.log('  màn  | tên                | ô  | nhịp | tạo / sửa           | lời giải (chương trình chính)');
for (const m of che) {
  console.log('  ' + m.id.padEnd(4) + ' | ' + m.ten.padEnd(18) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + String(m.sao.nhip).padEnd(4) + ' | ' + m.loiGiai.hamCuaEmMoi.map((h) => h.ten).join(',').padEnd(19) + ' | ' + m.loiGiai.chinh.join(' ; '));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

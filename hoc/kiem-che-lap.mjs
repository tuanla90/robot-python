/* ============================================================================
   kiem-che-lap.mjs — máy kiểm chương `che-lap` (Chế lệnh có for, chương 7) của "Đường học". Kế hoạch "Chế lệnh" 14/10 (KE-HOACH-CHE-LENH.md, mục 5.2).
   Gồm:
   - bộ dò đường tắt do-duong-che-lap.mjs: màn có vật + tay kẹp (BFS riêng) và tự kiểm bằng cách chạy chuỗi hành động qua SanHoc;
   - 10 màn che-lap: lời giải 3 sao (đúng sao.o ô, sao.nhip nhịp, không chẩn đoán), BFS nhịp = sao.nhip trên PHẦN CỨNG (màn 5 theo lời giải chuẩn: BFS ≤ sao.nhip),
     mọi congThucKhac thắng, loiGiaiKhac đúng 2 sao, loiSai đúng mã, chinhCoDinh chặn chương trình chính gửi lên;
   - luật FOR: mỗi hàm chế có dòng for; trải for ra (cả hàm của em trong kho) thì tràn khung 10 ô (canFor 'tran-khung') hay thắng nhưng nhiều ô hơn sao.o, dưới 3 sao ('mat-sao');
   - luật riêng từng màn (hành lang ép đường, đường về đảo thứ tự + lệnh ngược, lệch một ở hàm của màn, chỉ còn số lùi, giới hạn ba lệnh ở trùm);
   - hàm mới có trong Sổ lệnh (nhóm lap), thẻ script của game/choi.html.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs.
   Chạy: node robotics/hoc/kiem-che-lap.mjs        (trượt thì thoát mã 1)
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
for (const f of ['man-chuoi-2', 'man-che-xe', 'man-tay-gap', 'man-che-tay', 'man-vong-lap', 'man-che-lap', 'man-bang-chuyen', 'man-tham-so', 'man-nhen', 'man-xich', 'man-omni', 'man-tam-day', 'man-khoang-cach', 'man-che-cam-bien', 'man-robot-hoan-thien', 'man-mau', 'man-nam-cham', 'man-may-nem', 'man-sung-bong']) require(path.join(day, f + '.js'));
const ManHoc = require(path.join(day, 'man-drone.js'));
const { nhipCheLapNganNhat, nhipCheLapTatCa, nhipVatNganNhat } = await import('./do-duong-che-lap.mjs');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const maLoi = (kq) => kq.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma);
const vt = (r) => r.x + ',' + r.y;
const tatCa = ManHoc.danhSach;
const che = tatCa.filter((m) => m.chuong === 'che-lap');
const man = (so) => ManHoc.timMa('che-lap.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const coFor = (dong) => dong.some((s) => /^\s*for\b/.test(s));

/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải; màn tiết kiệm nhịp sửa riêng, không ghi vào kho). */
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
/** Trải mọi vòng `for i in range(n):` (kể cả lồng nhau) thành các dòng lặp lại. */
function traiFor(ds) {
  const kq = [];
  for (let i = 0; i < ds.length; i++) {
    const mk = /^for (\w+) in range\((\d+)\):$/.exec(ds[i]);
    if (!mk) { kq.push(ds[i]); continue; }
    const than = [];
    let j = i + 1;
    while (j < ds.length && /^ {4}/.test(ds[j])) { than.push(ds[j].slice(4)); j++; }
    const trong = traiFor(than);
    for (let k = 0; k < +mk[2]; k++) kq.push(...trong);
    i = j - 1;
  }
  return kq;
}
/** Bài làm của học sinh chưa học for: chương trình và MỌI hàm (của màn, của em) đều trải for ra. Hàm khóa của màn vẫn do máy chấm đặt bản mẫu vào. */
function baiKhongFor(m, kho) {
  const bai = { chinh: traiFor(m.loiGiai.chinh), hamCuaMan: m.loiGiai.hamCuaMan.map((h) => H(h.ten, traiFor(h.than), h.thamSo)) };
  const em = tron(kho, m.loiGiai.hamCuaEmMoi).map((h) => H(h.ten, traiFor(h.than), h.thamSo));
  return { bai, em };
}

const BANH_DU = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];

/* ================================================================= 1. BỘ DÒ ĐƯỜNG CHO MÀN CÓ VẬT */
console.log('\n== 1. do-duong-che-lap.mjs: BFS có vật + tay kẹp + ◆, kiểm chéo với SanHoc ==');
{
  const TAY = BANH_DU.concat(['arm_down', 'arm_up', 'grab', 'release']);
  const cfg = (extra) => Object.assign({ loaiRobot: 'banh', hamGoc: TAY, mucTieu: 'bong-mo', san: ['.....', '..o..', '.....'], batDau: { x: 2, y: 2, huong: 0 } }, extra);
  const nhipDong = (a) => {
    const d = [];
    if (a.tt === 'duoi') d.push('arm_down()'); else if (a.tt === 'tren') d.push('arm_up()');
    if (a.kep === 'kep') d.push('grab()'); else if (a.kep === 'tha') d.push('release()');
    const L = { tien: ['left_move()', 'right_move()'], lui: ['left_back()', 'right_back()'], phai: ['left_move()'], trai: ['right_move()'], dau: ['left_move()', 'right_back()'], cho: [] }[a.hq];
    d.push(...L, 'wait()');
    return d;
  };
  // vật 1 ô trước mặt, dời sang phải: bóng mờ vật (3,1), xe về (2,2) hướng lên
  const m1 = cfg({ bongMo: { x: 2, y: 2, huong: 0, vat: [{ x: 3, y: 1 }] } });
  const r1 = nhipVatNganNhat(m1);
  const code1 = r1.chuoi ? r1.chuoi.flatMap(nhipDong).join('\n') + '\n' : '';
  const chay1 = r1.chuoi ? SanHoc.chay(Object.assign({}, m1), code1) : null;
  kiem('BFS dời một vật sang ô bên phải: tìm được chuỗi, chạy chuỗi đó trong SanHoc thì thắng đúng ở nhịp BFS báo (' + r1.nhip + ')', !!chay1 && chay1.thang === true && chay1.nhip === r1.nhip && r1.nhip > 0 && !r1.catNgang, J([r1.nhip, chay1 && chay1.thang]));
  const bd0 = nhipVatNganNhat(cfg({ bongMo: { x: 2, y: 2, huong: 0, vat: [{ x: 2, y: 1 }] } }));
  kiem('vật đã nằm đúng ô bóng mờ và xe đã đúng tư thế: 0 nhịp', bd0.nhip === 0);
  const khongToi = nhipVatNganNhat(cfg({ san: ['.....', '.#o#.', '.....'], bongMo: { x: 2, y: 2, huong: 0, vat: [{ x: 1, y: 1 }] } }));
  kiem('vật không thể tới ô bóng mờ (nằm trong tường): không tới được (nhip null, không phải cắt ngang)', khongToi.nhip === null && khongToi.catNgang === false);
  kiem('hardware không có tay kẹp thì không dời được vật: null', nhipVatNganNhat(cfg({ hamGoc: BANH_DU, bongMo: { x: 2, y: 2, huong: 0, vat: [{ x: 3, y: 1 }] } })).nhip === null);
  // không có vật: nhipCheLapNganNhat = BFS của che-xe
  const sanTrong = ['.....', '.....', '.....'];
  kiem('nhipCheLapNganNhat: sân không vật dùng lại BFS che-xe (đi thẳng hai ô = 2 nhịp, kể cả lùi: lùi hai ô = 2 nhịp)',
    nhipCheLapNganNhat({ loaiRobot: 'banh', hamGoc: BANH_DU, mucTieu: 'bong-mo', san: sanTrong, batDau: { x: 2, y: 2, huong: 0 }, bongMo: { x: 2, y: 0, huong: 0 } }).nhip === 2 &&
      nhipCheLapNganNhat({ loaiRobot: 'banh', hamGoc: BANH_DU, mucTieu: 'bong-mo', san: sanTrong, batDau: { x: 2, y: 0, huong: 0 }, bongMo: { x: 2, y: 2, huong: 0 } }).nhip === 2);
}

/* ================================================================= 2. MƯỜI MÀN CHE-LAP: DỮ LIỆU */
console.log('\n== 2. Chương che-lap: dữ liệu ==');
{
  const idChuong = ThuTu.thuTu.indexOf('che-lap') + 1;
  kiem('đúng 10 màn, số 1..10, id ' + idChuong + '.1…' + idChuong + '.10 (chương thứ 7, sau vong-lap, trước khoang-cach), mã che-lap.1…, tên "Chế lệnh có for", không thuộc đợt 2',
    che.length === 10 && che.every((m, i) => m.so === i + 1 && m.id === idChuong + '.' + (i + 1) && m.ma === 'che-lap.' + (i + 1)) && idChuong === 7 && ThuTu.thuTu[5] === 'vong-lap' && ThuTu.thuTu[7] === 'khoang-cach' && ThuTu.ten['che-lap'] === 'Chế lệnh có for' && !ThuTu.laDot2('che-lap'));
  kiem('tên các màn: Chạy nước rút, Vòng vuông, Tuần tra, Bậc chéo, Dọn hàng, Vòng lồng, Đường về vòng lặp, Lệch một, Số lùi đường dài, Tuần tra kho; hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu che-lap',
    J(che.map((m) => m.ten)) === J(['Chạy nước rút', 'Vòng vuông', 'Tuần tra', 'Bậc chéo', 'Dọn hàng', 'Vòng lồng', 'Đường về vòng lặp', 'Lệch một', 'Số lùi đường dài', 'Tuần tra kho']) &&
      J(che.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) &&
      che.every((m) => !!m.huyHieu === (m.so === 10)) && che[9].huyHieu.ma === 'che-lap' && che[9].huyHieu.ten === 'Huy hiệu Chế lệnh có for');
  kiem('lệnh chế ở từng màn (taoHam): dash, square, —, zigzag, sweep, ring, come_home, —, reverse_run, —; màn 8 sửa hàm CỦA MÀN (không hàm của em mới)',
    J(che.map((m) => m.taoHam)) === J([['dash'], ['square'], [], ['zigzag'], ['sweep'], ['ring'], ['come_home'], [], ['reverse_run'], []]) && che.every((m) => J(m.loiGiai.hamCuaEmMoi.map((h) => h.ten)) === J(m.taoHam)));
  kiem('chung cả chương: xe hai bánh (banh), mục tiêu bong-mo, cauTruc ["for"] (cả khung), chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em, một sân',
    che.every((m) => m.loaiRobot === 'banh' && m.mucTieu === 'bong-mo' && !!m.bongMo && !Array.isArray(m.san[0]) && J(m.cauTruc) === '["for"]' && J(m.khung.cauTruc) === '["for"]' && m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && m.robot.than === 'hai-banh' && J(m.robot.camBien) === '[]'));
  kiem('robot: có tay kẹp (tay "kep", khay thêm arm_down, arm_up, grab, release) chỉ ở màn 5; các màn khác xe trơn',
    che.every((m) => (m.robot.tay === 'kep') === (m.so === 5) && (m.so === 5) === m.hamGoc.includes('arm_down')));
  kiem('khay: màn 9 chỉ left_back, right_back, wait (cùng phanCung, canhBao "Xe chỉ còn số lùi"); mọi màn khác trọn bộ bánh (có bánh lùi), không phanCung hẹp',
    J(man(9).hamGoc) === J(['left_back', 'right_back', 'wait']) && J(man(9).phanCung) === J(man(9).hamGoc) && man(9).canhBao === 'Xe chỉ còn số lùi' &&
      che.filter((m) => m.so !== 9).every((m) => m.phanCung === undefined && m.canhBao === undefined && ['left_move', 'right_move', 'left_back', 'right_back', 'wait'].every((t) => m.hamGoc.includes(t))));
  kiem('chinhCoDinh ở mọi màn trừ 3 và 10 (người chơi tự viết chương trình chính); khoaHamMan ["go_round"] chỉ ở màn 7; gioiHanHam 3 chỉ ở trùm; không màn nào đảo chiều dây (daoChieu)',
    che.every((m) => (m.chinhCoDinh === true) === ![3, 10].includes(m.so) && (m.so === 7) === (J(m.khoaHamMan) === '["go_round"]') && (m.so === 10) === (m.gioiHanHam === 3) && m.daoChieu === undefined));
  kiem('bóng mờ: có ◆ (diQua) ở 2, 3, 6, 10; có vật mờ ở 5 (3 vật); các màn còn lại chỉ xe mờ; hướng xe mờ khai rõ',
    che.every((m) => (m.bongMo.diQua !== undefined) === [2, 3, 6, 10].includes(m.so) && (m.bongMo.vat !== undefined) === (m.so === 5) && [0, 1, 2, 3].includes(m.bongMo.huong)) && man(5).bongMo.vat.length === 3 && man(10).bongMo.diQua.length === 5);
  kiem('mọi màn khai canFor ("mat-sao" hoặc "tran-khung"); lời giải có dùng for ở chương trình, hàm chế hay hàm của màn (màn 3 "dùng": for nằm trong dash() và square() lấy từ kho)',
    che.every((m) => ['mat-sao', 'tran-khung'].includes(m.canFor) && (coFor(m.loiGiai.chinh) || coFor(m.loiGiai.hamCuaEmMoi.flatMap((h) => h.than)) || coFor(m.loiGiai.hamCuaMan.flatMap((h) => h.than)) ||
      (m.so === 3 && ['dash', 'square'].every((t) => coFor(khoTruoc(m.id).find((h) => h.ten === t).than))))));
  kiem('mọi hàm chế (taoHam) có vòng for trong thân hàm; màn 5, 6 có sân hẹp tới mức viết tay tràn 10 ô (canFor "tran-khung")',
    che.every((m) => m.loiGiai.hamCuaEmMoi.every((h) => coFor(h.than))) && [5, 6].every((i) => man(i).canFor === 'tran-khung'));
  kiem('màn 6 dùng for lồng nhau trong thân ring(); màn 7 lồng nhau cả hàm của màn go_round() lẫn come_home()',
    man(6).loiGiai.hamCuaEmMoi[0].than.filter((s) => /^\s*for\b/.test(s)).length === 2 && man(7).loiGiai.hamCuaEmMoi[0].than.filter((s) => /^\s*for\b/.test(s)).length === 2 && man(7).maMau.hamCuaMan[0].than.filter((s) => /^\s*for\b/.test(s)).length === 2);
  const KHONG_DUNG = ['pass_back', 'put_right', 'grab_back', 'drag', 'swap', 'put_back', 'fixed_pick', 'fixed_drop', 'safe_move', 'face_open', 'to_gap', 'bounce', 'follow_right', 'safe_move2', 'fetch_back'];
  const dungHam = (m) => new Set([].concat(m.hamCuaEmCan, m.loiGiai.chinh, ...m.loiGiai.hamCuaEmMoi.map((h) => h.than), ...m.loiGiai.hamCuaMan.map((h) => h.than)).join(' ').match(/[a-z_][a-z_0-9]*/g));
  kiem('chương này chỉ dùng hàm của em ở chương 2–4 và 6 (+ hàm nó tự chế); không gọi hàm của che-tay hay che-cam-bien',
    che.every((m) => KHONG_DUNG.every((t) => !dungHam(m).has(t) && !m.hamCuaEmCan.includes(t))));
  kiem('mỗi màn khai hamCuaEmCan ⊆ kho lúc tới màn; tên hàm cốt truyện của chương không trùng hàm cũ và không là lệnh gốc',
    che.every((m) => m.hamCuaEmCan.every((t) => khoTruoc(m.id).some((h) => h.ten === t))) &&
      che.flatMap((m) => m.taoHam).every((t) => !KhoHam.HAM_GOC_MAC_DINH.includes(t) && tatCa.filter((m) => m.chuong !== 'che-lap').every((m) => !m.taoHam.includes(t))));
  kiem('trong thứ tự chương, che-lap đứng sau vong-lap và trước khoang-cach; thứ tự chương có đủ 21 mã', ThuTu.thuTu.indexOf('che-lap') === ThuTu.thuTu.indexOf('vong-lap') + 1 && ThuTu.thuTu.indexOf('khoang-cach') === ThuTu.thuTu.indexOf('che-lap') + 1);
}

/* ================================================================= 3. TỪNG MÀN */
console.log('\n== 3. Từng màn: lời giải, đường ngắn nhất, công thức khác, lời sai, luật for ==');
const bang = [];
for (const m of che) {
  const kho = khoTruoc(m.id);
  const khoNay = tron(kho, m.loiGiai.hamCuaEmMoi);
  const r = ChamHoc.cham(m, m.loiGiai, khoNay);
  kiem(m.id + ' ' + m.ten + ': lời giải cách 1 thắng 3 sao, ' + r.soO + ' ô = sao.o, ' + r.soNhip + ' nhịp = sao.nhip, không chẩn đoán nào',
    r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
  const bfs = nhipCheLapTatCa(m, kho);
  kiem(m.id + ': BFS nhịp ngắn nhất trên PHẦN CỨNG của màn = ' + (m.nhipTheoLoiGiai ? 'không vượt sao.nhip (tay kẹp chạy theo pick() / drop() chuẩn nên lời giải chuẩn chậm hơn đường ngắn nhất)' : 'sao.nhip') + ' (' + bfs + ')' + (m.khoaHamMan ? ' [tính cả đoạn go_round() cố định]' : ''),
    m.nhipTheoLoiGiai ? (bfs !== null && bfs <= m.sao.nhip && bfs >= 1) : bfs === m.sao.nhip, 'BFS = ' + bfs + ', sao.nhip = ' + m.sao.nhip);
  bang.push({ m, r, bfs });

  // chương trình chính cố định / tự viết
  if (m.chinhCoDinh) {
    const gui = ChamHoc.cham(m, { chinh: ['wait()', 'wait()', 'wait()'], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
    kiem(m.id + ': chinhCoDinh — chương trình chính gửi lên bị bỏ qua (kết quả y hệt lời giải), maMau.chinh dài 1–10 dòng',
      J([gui.thang, gui.soO, gui.soNhip, gui.py]) === J([r.thang, r.soO, r.soNhip, r.py]) && m.maMau.chinh.length >= 1 && m.maMau.chinh.length <= m.khung.chinh);
  } else {
    kiem(m.id + ': người chơi tự viết chương trình chính (maMau.chinh rỗng, lời giải ≤ 10 dòng, chương trình rỗng không thắng)',
      m.maMau.chinh.length === 0 && m.loiGiai.chinh.length >= 1 && m.loiGiai.chinh.length <= 10 && !ChamHoc.cham(m, { chinh: [] }, khoNay).thang);
  }
  // bóng mờ
  const bm = m.bongMo, san = SanHoc.docSan(m.san);
  const vet = r.theoSan[0].vet.filter((e) => e.loai === 'nhip');
  kiem(m.id + ': bóng mờ (' + bm.x + ',' + bm.y + ') hướng ' + bm.huong + ' nằm trên ô đi được; kết quả chạy có bongMo, toi-bong-mo chỉ ghi ở nhịp cuối' + (bm.diQua ? '; ' + bm.diQua.length + ' điểm ◆ đều sáng' : ''),
    !SanHoc.lyDoChan(san, 'banh', bm.x, bm.y) && r.bongMo.x === bm.x && r.bongMo.huong === bm.huong && vet.length === r.soNhip && vet[vet.length - 1].suKien.some((e) => e.ma === 'toi-bong-mo') &&
      vet.slice(0, -1).every((n) => !n.suKien.some((e) => e.ma === 'toi-bong-mo')) && r.diQua.every((q) => q.da === true) && r.diQua.length === (bm.diQua || []).length);

  // cách chế khác: đều thắng
  kiem(m.id + ': có ít nhất 1 công thức khác (congThucKhac), mỗi công thức có moTa và khác cách 1', Array.isArray(m.congThucKhac) && m.congThucKhac.length >= 1 && m.congThucKhac.every((c) => c.moTa && (Array.isArray(c.hamCuaEmMoi) || c.baiLam) && J([c.baiLam, c.hamCuaEmMoi]) !== J([undefined, m.loiGiai.hamCuaEmMoi])));
  const saoKhac = [];
  m.congThucKhac.forEach((c, i) => {
    const rc = ChamHoc.cham(m, c.baiLam || m.loiGiai, tron(khoNay, c.hamCuaEmMoi || []));
    saoKhac.push(rc.sao);
    kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng, không lỗi — ' + rc.sao + ' sao, ' + rc.soO + ' ô, ' + rc.soNhip + ' nhịp', rc.thang && maLoi(rc).length === 0, J({ thang: rc.thang, cd: rc.chanDoan.map((x) => x.ma) }));
  });
  bang[bang.length - 1].saoKhac = saoKhac;
  // lời giải khác (chỉ thêm chú thích): 2 sao
  if (m.loiGiaiKhac) {
    const rk = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kho, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': loiGiaiKhac (' + m.loiGiaiKhac.moTa + ') thắng đúng 2 sao, nhiều ô hơn, cùng nhịp', rk.thang && rk.sao === 2 && rk.soO > m.sao.o && rk.soNhip === m.sao.nhip, J({ sao: rk.sao, soO: rk.soO, soNhip: rk.soNhip }));
  } else kiem(m.id + ': có loiGiaiKhac', false);
  // lời sai
  m.loiSai.forEach((ls, i) => {
    const rs = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi));
    const co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
    kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): không thắng, không đủ 3 sao, có mã ' + ls.phaiCoMa.join('+'),
      rs.sao < 3 && !rs.thang && ls.phaiCoMa.length > 0 && thieu.length === 0, 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + rs.sao + ' · thắng ' + rs.thang);
  });
  // đề bài, gợi ý
  const taoTen = m.loiGiai.hamCuaEmMoi.map((h) => h.ten);
  kiem(m.id + ': đề bài (hay vẽ mẫu) nhắc tên lệnh cần chế (' + (taoTen.join(', ') || 'không') + ')' + (m.khoaHamMan ? ' và hàm khóa của màn' : ''),
    taoTen.every((t) => (m.deBai + ' ' + (m.veMaMau || '')).includes(t + '()')) && (m.khoaHamMan || []).every((t) => m.deBai.includes(t + '()')), m.deBai);
  kiem(m.id + ': đề 1–3 câu (> 20 chữ), gợi ý 1–2 câu, không nói tên nút', m.deBai.length > 20 && m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && m.goiY.every((g) => !/nút|bấm|Chạy/.test(g)));

  // luật FOR: trải for ra thì tràn khung hoặc mất sao
  const { bai, em } = baiKhongFor(m, kho);
  const rf = ChamHoc.cham(Object.assign({}, m, { cauTruc: [], khung: Object.assign({}, m.khung, { cauTruc: ['for'] }) }), bai, em);
  const tran = maCua(rf).includes('tran-khung');
  bang[bang.length - 1].khongFor = tran ? 'tràn khung' : 'ô ' + rf.soO + ' > ' + m.sao.o + ' → ' + rf.sao + ' sao';
  if (m.canFor === 'tran-khung') kiem(m.id + ': CẦN for (tràn khung): trải for ra thì tran-khung, không chạy', tran && !rf.thang && rf.sao === 0, J(maCua(rf)));
  else kiem(m.id + ': for giúp đạt 3 sao: trải for ra vẫn vừa khung, thắng nhưng ' + rf.soO + ' ô > ' + m.sao.o + ' → dưới 3 sao', !tran && rf.thang && rf.soO > m.sao.o && rf.sao < 3, J([maCua(rf), rf.thang, rf.soO, rf.sao]));
}

/* ================================================================= 4. LUẬT RIÊNG TỪNG MÀN */
console.log('\n== 4. Luật riêng từng màn ==');
{
  const k = (so) => khoTruoc(man(so).id);
  // 1 dash
  const m1 = man(1);
  kiem('1 Chạy nước rút: bóng mờ đúng bốn ô trước xe, cùng hướng; sân trống (BFS = 4 = khoảng cách)', m1.bongMo.y === m1.batDau.y - 4 && m1.bongMo.x === m1.batDau.x && nhipCheLapNganNhat(m1).nhip === 4 && m1.san.every((h) => /^\.+$/.test(h)));
  // 2 square
  const m2 = man(2);
  kiem('2 Vòng vuông: ba điểm ◆ ở ba góc, xe mờ ở đúng chỗ xuất phát cùng hướng; đi tắt không được (bỏ ◆ thì BFS = 0, có ◆ thì 12)',
    J(m2.bongMo) !== J(m2.batDau) && m2.bongMo.x === m2.batDau.x && m2.bongMo.y === m2.batDau.y && m2.bongMo.huong === m2.batDau.huong && m2.bongMo.diQua.length === 3 &&
      nhipCheLapNganNhat(Object.assign({}, m2, { bongMo: Object.assign({}, m2.bongMo, { diQua: [] }) })).nhip === 0 && nhipCheLapNganNhat(m2).nhip === 12);
  // 3 tuần tra
  const m3 = man(3);
  kiem('3 Tuần tra: sân là hành lang + khu kệ (vòng vuông quanh một cột); không dùng lệnh đã chế thì tràn 10 ô; đi tắt không được (bỏ ◆ thì BFS ngắn hơn: ' + nhipCheLapNganNhat(Object.assign({}, m3, { bongMo: Object.assign({}, m3.bongMo, { diQua: [] }) })).nhip + ' < 21)',
    nhipCheLapNganNhat(Object.assign({}, m3, { bongMo: Object.assign({}, m3.bongMo, { diQua: [] }) })).nhip < m3.sao.nhip && maCua(ChamHoc.cham(m3, m3.loiSai[3].baiLam, k(3))).includes('tran-khung') && m3.loiGiai.chinh.length === 4);
  // 4 zigzag
  const m4 = man(4);
  const lForm4 = nhipCheLapNganNhat(Object.assign({}, m4, { san: ['....', '....', '....', '....'] })).nhip;
  kiem('4 Bậc chéo: sân là cầu thang hành lang (ép đi từng bậc); sân trống thì đường chữ L ngắn hơn (' + lForm4 + ' < 12), nên hành lang là cần thiết',
    lForm4 < m4.sao.nhip && nhipCheLapNganNhat(m4).nhip === 12 && m4.san.join('').split('').filter((c) => c === '.').length === 7);
  // 5 sweep
  const m5 = man(5);
  const cu5 = nhipCheLapNganNhat(m5);
  kiem('5 Dọn hàng: ba vật ở ba ô liền nhau trước mặt, bóng mờ vật ở cột bên phải; BFS (tay hạ rồi nâng cùng nhịp với bánh) ngắn hơn lời giải chuẩn: ' + cu5.nhip + ' < 21; thực thi thật chuỗi BFS trong SanHoc thắng đúng nhịp đó',
    cu5.nhip < m5.sao.nhip && (() => {
      const nhipDong = (a) => { const d = []; if (a.tt === 'duoi') d.push('arm_down()'); else if (a.tt === 'tren') d.push('arm_up()'); if (a.kep === 'kep') d.push('grab()'); else if (a.kep === 'tha') d.push('release()');
        d.push(...({ tien: ['left_move()', 'right_move()'], lui: ['left_back()', 'right_back()'], phai: ['left_move()'], trai: ['right_move()'], dau: ['left_move()', 'right_back()'], cho: [] })[a.hq], 'wait()'); return d; };
      const code = cu5.chuoi.flatMap(nhipDong).join('\n') + '\n';
      const kq = SanHoc.chay(Object.assign({}, m5, { vat: undefined }), code);
      return kq.thang === true && kq.nhip === cu5.nhip;
    })());
  kiem('5: sweep() với kho chuẩn: 3 vật dời đúng ô, xe đứng ở (2,1) hướng lên; thân hàm tách ra một vòng 1 thùng cũng tới (cách khác); hai vật đầu xong mà thùng cuối chưa dời thì không thắng (có lech-bong-mo)',
    (() => { const r = ChamHoc.cham(m5, m5.loiGiai, tron(k(5), m5.loiGiai.hamCuaEmMoi)); return r.thang && r.vat.filter((v) => v.trangThai === 'dat').map((v) => v.x + ',' + v.y).sort().join(' ') === '3,1 3,2 3,3' && vt(r.theoSan[0].robot) === '2,1'; })() &&
      !ChamHoc.cham(m5, m5.loiSai[0].baiLam, tron(k(5), m5.loiSai[0].hamCuaEmMoi)).thang);
  // 6 ring
  const m6 = man(6);
  kiem('6 Vòng lồng: vòng vuông cạnh ba ô (16 nhịp = 12 bước + 4 lần rẽ); thân ring() có hai vòng for lồng nhau; bỏ ◆ thì BFS = 0 (đứng yên là đủ)',
    nhipCheLapNganNhat(m6).nhip === 16 && nhipCheLapNganNhat(Object.assign({}, m6, { bongMo: Object.assign({}, m6.bongMo, { diQua: [] }) })).nhip === 0 && m6.loiGiai.hamCuaEmMoi[0].than[1] === '    for j in range(3):');
  // 7 come_home
  const m7 = man(7), k7 = k(7);
  const pre = ChamHoc.cham(Object.assign({}, m7, { chinhCoDinh: false }), { chinh: ['go_round()'], hamCuaMan: m7.maMau.hamCuaMan }, k7);
  kiem('7 Đường về vòng lặp: go_round() đưa xe tới (4,0) quay xuống sau 10 nhịp; come_home() phải về ô và hướng ban đầu; hàm go_round khóa và xem được (có trong maMau, khoaHamMan); gửi bản sửa lên thì máy chấm vẫn dùng bản mẫu',
    pre.theoSan[0].soNhip === 10 && vt(pre.theoSan[0].robot) === '4,0' && pre.theoSan[0].robot.huong === 2 && J(m7.bongMo) === J({ x: m7.batDau.x, y: m7.batDau.y, huong: m7.batDau.huong }) && m7.maMau.hamCuaMan.some((h) => h.ten === 'go_round') &&
      J(ChamHoc.cham(m7, { chinh: [], hamCuaMan: [H('go_round', ['move()'])] }, tron(k7, m7.loiGiai.hamCuaEmMoi)).sao) === '3');
  const ngich = (than) => J(than);
  kiem('7: come_home() là go_round() ĐẢO: cùng hai vòng lặp ngoài, trong mỗi vòng thứ tự ngược (go_round: bốn move rồi turn_right → come_home: turn_left rồi bốn back); move ↔ back, turn_right ↔ turn_left',
    ngich(m7.maMau.hamCuaMan[0].than) === ngich(['for i in range(2):', '    for j in range(4):', '        move()', '    turn_right()']) && ngich(m7.loiGiai.hamCuaEmMoi[0].than) === ngich(['for i in range(2):', '    turn_left()', '    for j in range(4):', '        back()']));
  const di = ChamHoc.cham(m7, m7.congThucKhac[1].baiLam || m7.loiGiai, tron(k7, m7.congThucKhac[1].hamCuaEmMoi));
  kiem('7: hành lang chữ L ép đường: sau go_round() không thể gọi lại go_round() để về (xe đâm tường), và đi tiến về rồi quay đầu chậm hơn lùi đúng 1 nhịp (' + di.soNhip + ' > 20)',
    !ChamHoc.cham(m7, { chinh: ['go_round()', 'go_round()'] }, k7).thang && di.thang && di.soNhip === m7.sao.nhip + 1 && di.sao < 3);
  // 8 lệch một
  const m8 = man(8), k8 = k(8);
  const buggy = ChamHoc.cham(m8, m8.maMau, k8);
  kiem('8 Lệch một: hàm go_far() KHÔNG khóa (người chơi sửa được); bản mẫu vừa khung, chạy thì lệch một ô về phía trên, không đâm tường; sửa đúng một con số (5 → 4) thì 3 sao',
    m8.khoaHamMan === undefined && !buggy.thang && buggy.chanDoan.length === 1 && buggy.chanDoan[0].ma === 'lech-bong-mo' && buggy.chanDoan[0].loi === 'Xe dừng lệch một ô về phía trên so với bóng mờ.' && !maCua(buggy).includes('dam-tuong') &&
      J(m8.maMau.hamCuaMan[0].than.map((s) => s.replace('range(5)', 'range(4)'))) === J(m8.loiGiai.hamCuaMan[0].than) && ChamHoc.cham(m8, m8.loiGiai, k8).sao === 3 && m8.loiGiai.hamCuaMan[0].than.length === 5);
  // 9 reverse_run
  const m9 = man(9), k9 = k(9);
  kiem('9 Số lùi đường dài: phần cứng chỉ còn số lùi; bóng mờ cách xe đúng sáu ô phía sau (cùng hướng, sân ngang một hàng giữa để nhãn ⚠ không che xe) nên BFS = 6; move() báo lenh-goc-hong; sân thử cũng báo lenh-goc-hong khi thử move()',
    m9.bongMo.x === m9.batDau.x - 6 && m9.bongMo.y === m9.batDau.y && m9.bongMo.huong === m9.batDau.huong && nhipCheLapNganNhat(m9).nhip === 6 && maCua(ChamHoc.cham(m9, m9.loiSai[0].baiLam, tron(k9, m9.loiSai[0].hamCuaEmMoi))).includes('lenh-goc-hong') &&
      maCua(ChamHoc.thuHam(m9, { chinh: [] }, 'move', k9)).includes('lenh-goc-hong'));
  kiem('9: back() của em (left_back, right_back, wait) chạy được trên phần cứng chỉ còn số lùi; reverse_run không gọi move() hay turn_*', maLoi(ChamHoc.thuHam(m9, { chinh: [] }, 'back', k9)).length === 0 && m9.loiGiai.hamCuaEmMoi[0].than.every((s) => !/move|turn_/.test(s)));
  // 10 trùm
  const m10 = man(10), k10 = k(10);
  const khongDiem10 = nhipCheLapNganNhat(Object.assign({}, m10, { bongMo: Object.assign({}, m10.bongMo, { diQua: [] }) })).nhip;
  kiem('10 Tuần tra kho: có ◆ thì cả vòng quanh kho phải đi (24 nhịp); bỏ ◆ thì đứng yên là đủ (' + khongDiem10 + '); mỗi cạnh ngắn bốn ô và cạnh dài sáu ô; sân rộng 7 × 5',
    khongDiem10 === 0 && nhipCheLapNganNhat(m10).nhip === 24 && m10.san.length === 5 && m10.san[0].length === 7 && m10.bongMo.diQua.length === 5);
  const qua = ChamHoc.cham(m10, m10.loiSai[0].baiLam, k10);
  kiem('10: gioiHanHam 3: gọi bốn hàm của em khác nhau ở chương trình chính thì lỗi khung qua-gioi-han-ham; ba hàm (dash, turn_right, row) thì được; lời giải dùng đúng ba',
    maCua(qua).includes('qua-gioi-han-ham') && ChamHoc.cham(m10, m10.loiGiai, k10).thang && new Set((m10.loiGiai.chinh.join(' ').match(/\b[a-z_]+(?=\()/g) || []).filter((t) => t !== 'range')).size === 3);
  kiem('10: hamCuaEmCan có dash, row, turn_right; bảng dùng row() của chương vong-lap và dash() của chương này', ['dash', 'row', 'turn_right'].every((t) => m10.hamCuaEmCan.includes(t)) && k10.some((h) => h.ten === 'row') && k10.some((h) => h.ten === 'dash'));
}

/* ================================================================= 5. SỔ LỆNH VÀ THẺ SCRIPT */
console.log('\n== 5. Sổ lệnh (so-lenh.js, nhóm lap) và game/choi.html ==');
{
  const moi = ['dash', 'square', 'zigzag', 'sweep', 'ring', 'come_home', 'reverse_run'];
  kiem('7 hàm chế ở che-lap có trong Sổ lệnh: nhóm lap, chương che-lap, màn đầu tiên chế, moTa lớp 5 (một câu ngắn), đúng thứ tự chế; SoLenh.theoChuong("che-lap") có 7 mục',
    moi.every((t) => { const h = SoLenh.tim(t); return h && h.nhom === 'lap' && h.chuong === 'che-lap' && tatCa.find((m) => m.taoHam.includes(t)).ma === h.man; }) && SoLenh.theoChuong('che-lap').length === 7 && J(SoLenh.theoChuong('che-lap').map((h) => h.ten)) === J(moi));
  kiem('mô tả ngắn, không dấu chấm cuối: dash "Chạy thẳng bốn ô"; mục che-lap nằm trong nhóm lap sau các hàm vong-lap (side, row, bend_left, bend_right)',
    SoLenh.tim('dash').moTa === 'Chạy thẳng bốn ô' && SoLenh.theoNhom('lap').map((h) => h.ten).slice(0, 4).join() === 'side,row,bend_left,bend_right' && SoLenh.theoNhom('lap').slice(4, 11).map((h) => h.ten).join() === moi.join());
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có thẻ script ../man-che-lap.js đúng một lần, nạp sau man-vong-lap.js (cùng sổ màn) và trước man-khoang-cach.js; tệp tồn tại', tags.filter((t) => t === '../man-che-lap.js').length === 1 && vtri('man-che-lap.js') > vtri('man-vong-lap.js') && vtri('man-che-lap.js') < vtri('man-khoang-cach.js') && fs.existsSync(path.join(day, 'man-che-lap.js')));
}

/* ================================================================= BẢNG */
console.log('\n  Bảng 10 màn che-lap (lời giải cách 1, sao, viết không dùng for thì?)');
console.log('  màn  | tên                  | ô  | nhịp | BFS | tạo       | lời giải (chương trình chính)                      | cách khác (sao)  | không for');
for (const b of bang) {
  const m = b.m;
  console.log('  ' + m.id.padEnd(4) + ' | ' + m.ten.padEnd(20) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + String(m.sao.nhip).padEnd(4) + ' | ' + String(b.bfs).padEnd(3) + ' | ' + m.taoHam.join(',').padEnd(9) + ' | ' + m.loiGiai.chinh.join(' ; ').slice(0, 50).padEnd(50) + ' | ' + b.saoKhac.join('/').padEnd(16) + ' | ' + b.khongFor);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

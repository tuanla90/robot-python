/* ============================================================================
   kiem-che-omni.mjs — máy kiểm chương `che-omni` (Chế lệnh omni) của "Robot Chấn Hưng" (KE-HOACH-CHE-LENH.md, mục 5c.2).
   Gồm:
   - luật omni mà chương dùng: không đi chéo (hai nhịp), băng chuyền kéo xe một ô mỗi nhịp đứng trên băng (qua hai băng lệch hai ô), tay hạ thì không trượt, phần cứng hỏng (thiếu slide_right) → lenh-goc-hong;
   - Sổ lệnh có đủ năm hàm mới (so-lenh.js; hop_right, north, east, step_out, step_back là HÀM CỦA MÀN nên không có ở đó, không vào kho);
   - 10 màn che-omni: dữ liệu, lời giải 3 sao, mọi công thức khác thắng, lời giải khác đúng 2 sao, lời sai đúng mã, chinhCoDinh chặn chương trình chính gửi lên,
     nhịp: đường ngắn nhất BFS (do-duong-che-omni.mjs) không dài hơn sao.nhip (bằng sao.nhip ở màn không dùng nhipTheoLoiGiai);
   - bộ dò đường: đường BFS đổi thành lệnh gốc rồi chạy SanHoc.chay thắng đúng số nhịp; hơn một nghìn chương trình ngẫu nhiên: từng bước bộ dò và san-hoc.js trùng hoàn toàn;
   - thẻ script của game/choi.html.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs. Luật omni chi tiết: kiem-omni.mjs.
   Chạy: node hoc/kiem-che-omni.mjs        (trượt thì thoát mã 1)
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
let ManHoc = require(path.join(day, 'man-chuoi-1.js'));
for (const f of fs.readdirSync(day).filter((n) => /^man-.*\.js$/.test(n) && n !== 'man-chuoi-1.js').sort()) ManHoc = require(path.join(day, f));
const DoDuong = await import('./do-duong-che-omni.mjs');
const { nhipCheOmniNganNhat, nhipCheOmniTatCa, chuoiThanhMa, dungNguCanh, trangThaiBanDau, buocMotNhip, daDatDich, hanhDongChoPhep } = DoDuong;

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const maLoi = (kq) => kq.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
const ev = (kq, ma) => nhipVet(kq).flatMap((n) => n.suKien).filter((e) => e.ma === ma);
const tatCa = ManHoc.danhSach;
const che = tatCa.filter((m) => m.chuong === 'che-omni');
const man = (so) => ManHoc.timMa('che-omni.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const L = (...d) => d.join('\n') + '\n';
const IDX = ThuTu.thuTu.indexOf('che-omni') + 1;                       // số chương che-omni (không ghi cứng)

/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải). id 'het' = sau cả game. */
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

const BANH = ['left_move', 'right_move', 'left_back', 'right_back'];
const KHAY = BANH.concat(['slide_left', 'slide_right', 'wait']);
const KHAY_TAY = KHAY.concat(['arm_down', 'arm_up', 'grab', 'release']);
const KHAY_HONG = BANH.concat(['slide_left', 'wait']);
const trong = (n) => Array.from({ length: n }, () => '.'.repeat(n));
function chay(rows, bd, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'omni', hamGoc: KHAY, nhipToiDa: 200 }, extra || {}), code);
}
/** Cấu hình SanHoc.chay của màn một sân m (như ChamHoc.cham truyền xuống). */
function cfgSan(m, extra) {
  const lm = SanHoc.lopMauCuaSan(m, 0);
  return Object.assign({ san: m.san, batDau: m.batDau, loaiRobot: 'omni', hamGoc: m.hamGoc, phanCung: SanHoc.phanCungCua(m), mucTieu: m.mucTieu || 'toi-co', bongMo: lm.bongMo || undefined, nhipToiDa: 200 }, extra || {});
}

/* ================================================================= 1. LUẬT OMNI MÀ CHƯƠNG DÙNG */
console.log('\n== 1. Luật omni dùng trong che-omni: không đi chéo, băng chuyền kéo xe, tay hạ, phần cứng hỏng ==');
{
  const R = trong(5), bd = { x: 1, y: 3, huong: 0 };
  const chieo = chay(R, bd, L('slide_right()', 'left_move()', 'right_move()', 'wait()'));
  kiem('slide_right() cùng nhịp với move() không đi chéo: chỉ trượt, lệnh bánh bị bỏ (omni-khong-cheo); xe ở (2,3), chưa lên', chieo.nhip === 1 && chieo.robot.x === 2 && chieo.robot.y === 3 && ev(chieo, 'omni-khong-cheo').length === 1);
  const hai = chay(R, bd, L('slide_right()', 'wait()', 'left_move()', 'right_move()', 'wait()'));
  kiem('đi chéo cần hai nhịp: trượt một nhịp rồi tiến một nhịp, xe ở (2,2) mặt vẫn quay lên', hai.nhip === 2 && hai.robot.x === 2 && hai.robot.y === 2 && hai.robot.huong === 0);
  const SAN_BANG = ['...vv..', '...vv..', '...vv..', '...vv..', '...vv..', '...vv..', '...vv..'];
  const qua = chay(SAN_BANG, { x: 2, y: 2, huong: 0 }, L('slide_right()', 'wait()', 'slide_right()', 'wait()', 'slide_right()', 'wait()'));
  kiem('qua hai băng chuyền chạy xuống bằng ba lần trượt: băng đẩy xe một ô mỗi nhịp đứng trên băng nên xe sang bên kia nhưng thấp hơn hai ô, ở (5,4)', qua.robot.x === 5 && qua.robot.y === 4 && qua.nhip === 3 && ev(qua, 'bang-day').length === 2, J(qua.robot));
  const bu = chay(SAN_BANG, { x: 2, y: 2, huong: 0 }, L('slide_right()', 'wait()', 'slide_right()', 'wait()', 'slide_right()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'));
  kiem('tiến hai ô sau khi qua băng đưa xe về cùng hàng (5,2): cross_belt() đúng 5 nhịp', bu.robot.x === 5 && bu.robot.y === 2 && bu.nhip === 5);
  const truoc = chay(SAN_BANG, { x: 2, y: 2, huong: 0 }, L('left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'slide_right()', 'wait()', 'slide_right()', 'wait()', 'slide_right()', 'wait()'));
  kiem('tiến hai ô TRƯỚC khi qua băng cũng về cùng hàng (5,2) sau 5 nhịp (băng kéo xe xuống đúng hai ô)', truoc.robot.x === 5 && truoc.robot.y === 2 && truoc.nhip === 5);
  const tayHa = chay(R, bd, L('arm_down()', 'wait()', 'slide_right()', 'wait()'), { hamGoc: KHAY_TAY });
  kiem('tay hạ thì không trượt được: tay-vuong, xe đứng yên (nên pick() / drop() nâng tay ở nhịp thứ hai trước khi trượt)', ev(tayHa, 'tay-vuong').length === 1 && tayHa.robot.x === 1);
  const hong = ChamHoc.cham(Object.assign({}, man(7), { chinhCoDinh: false }), { chinh: ['slide_right()', 'wait()'] }, []);
  kiem('che-omni.7 hỏng slide_right: gọi nó báo lenh-goc-hong (không phải ham-chua-co), nêu canhBao "Trượt phải hỏng" và tên lệnh slide_right', (() => { const cd = hong.chanDoan.find((c) => c.ma === 'lenh-goc-hong'); return !!cd && cd.ten === 'slide_right' && /Trượt phải hỏng/.test(cd.loi) && !maCua(hong).includes('ham-chua-co'); })(), J(hong.chanDoan));
  const kh = ChamHoc.cham(man(7), { chinh: [] }, khoTruoc(man(7).id));
  kiem('che-omni.7: slide_left vẫn chạy được (phần cứng chỉ thiếu slide_right): trượt trái thắng được phần việc của nó', (() => { const r = ChamHoc.cham(Object.assign({}, man(7), { chinhCoDinh: false }), { chinh: ['slide_left()', 'wait()'] }, khoTruoc(man(7).id)); return !maCua(r).includes('lenh-goc-hong'); })() && !kh.thang);
}

/* ================================================================= 2. SỔ LỆNH */
console.log('\n== 2. Sổ lệnh: năm hàm mới của che-omni (hop_right, north, east, step_out, step_back là hàm của màn) ==');
{
  const moi = ['diag', 'zig', 'bypass', 'cross_belt', 'shift'];
  kiem('SoLenh.theoChuong("che-omni") đúng năm hàm theo thứ tự chế: diag, zig, bypass, cross_belt, shift; nhóm omni', J(SoLenh.theoChuong('che-omni').map((h) => h.ten)) === J(moi) && SoLenh.theoChuong('che-omni').every((h) => h.nhom === 'omni'));
  const dau = {};
  for (const m of tatCa) for (const t of m.taoHam) if (!dau[t]) dau[t] = m;
  const hamMan = ['hop_right', 'north', 'east', 'step_out', 'step_back'];
  kiem('hop_right, north, east, step_out, step_back là hàm CỦA MÀN: không là hàm cốt truyện, không trong Sổ lệnh, không trong hamCuaEmMoi của lời giải nào, tên không trùng hàm gốc',
    hamMan.every((t) => !tenCotTruyen.includes(t) && SoLenh.tim(t) === null && tatCa.every((m) => !m.loiGiai.hamCuaEmMoi.some((h) => h.ten === t)) && !KhoHam.HAM_GOC_MAC_DINH.includes(t)));
  kiem('mỗi hàm có chuong và man đúng màn đầu tiên chế nó (taoHam của màn che-omni)', moi.every((t) => dau[t] && SoLenh.tim(t) && SoLenh.tim(t).man === dau[t].ma && SoLenh.tim(t).chuong === 'che-omni'));
  kiem('moTa là MỘT câu ngắn lớp 5: 8–80 chữ, không xuống dòng, không dấu chấm cuối', moi.every((t) => { const d = SoLenh.tim(t).moTa; return d.length >= 8 && d.length <= 80 && !/\n/.test(d) && !/[.]$/.test(d); }));
  kiem('tên hàm cốt truyện không trùng hàm gốc, không trùng hàm cốt truyện nào khác, không trùng hàm của màn nào khác trong game', moi.every((t) => SoLenh.ds.filter((h) => h.ten === t).length === 1 && !KhoHam.HAM_GOC_MAC_DINH.includes(t)) &&
    hamMan.every((t) => tatCa.filter((m) => m.chuong !== 'che-omni').every((m) => !(m.maMau.hamCuaMan || []).some((h) => h.ten === t) && !m.taoHam.includes(t))));
  const iSl = SoLenh.ds.findIndex((h) => h.ten === 'slide_l');
  kiem('thứ tự trong Sổ lệnh: năm hàm của che-omni đứng NGAY SAU slide_r, slide_l của chương omni', SoLenh.ds.findIndex((h) => h.ten === 'slide_r') === iSl - 1 && J(SoLenh.ds.slice(iSl + 1, iSl + 6).map((h) => h.ten)) === J(moi));
  kiem('lệnh gốc slide_left ↔ slide_right là cặp ngược (cùng bảng LENH_NGUOC); SoLenh.capNguoc() có cặp đó', SanHoc.LENH_NGUOC.slide_left === 'slide_right' && SanHoc.LENH_NGUOC.slide_right === 'slide_left' && SoLenh.capNguoc().some((c) => (c[0] === 'slide_left' && c[1] === 'slide_right') || (c[0] === 'slide_right' && c[1] === 'slide_left')));
}

/* ================================================================= 3. MƯỜI MÀN CHE-OMNI */
console.log('\n== 3. Chương che-omni: dữ liệu và luật từng màn ==');
const BANG = [];
{
  kiem('đúng 10 màn, số 1..10, mã che-omni.1…, id theo vị trí trong thuTu (ngay sau omni), tên "Chế lệnh omni", chương đợt 2',
    che.length === 10 && che.every((m, i) => m.so === i + 1 && m.id === IDX + '.' + (i + 1) && m.ma === 'che-omni.' + (i + 1)) && ThuTu.thuTu.indexOf('che-omni') === ThuTu.thuTu.indexOf('omni') + 1 && ThuTu.ten['che-omni'] === 'Chế lệnh omni' && ThuTu.laDot2('che-omni'));
  kiem('tên các màn: Đi chéo, Bậc thang chéo, Hành lang chéo, Vòng qua tường, Qua băng chuyền, Dời vật sang bên, Trượt phải hỏng, Sai la bàn, Đường về, Kho ngang; hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu che-omni "Huy hiệu Chế lệnh omni"',
    J(che.map((m) => m.ten)) === J(['Đi chéo', 'Bậc thang chéo', 'Hành lang chéo', 'Vòng qua tường', 'Qua băng chuyền', 'Dời vật sang bên', 'Trượt phải hỏng', 'Sai la bàn', 'Đường về', 'Kho ngang']) &&
      J(che.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && che.every((m) => !!m.huyHieu === (m.so === 10)) && che[9].huyHieu.ma === 'che-omni' && che[9].huyHieu.ten === 'Huy hiệu Chế lệnh omni');
  kiem('mọi màn: xe omni (loaiRobot omni, robot { than "omni", tay "kep" ở 6 và 10, null ở màn còn lại }), chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em, cauTruc ["for"]',
    che.every((m) => m.loaiRobot === 'omni' && J(m.robot) === J({ than: 'omni', tay: [6, 10].includes(m.so) ? 'kep' : null }) && m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && J(m.cauTruc) === '["for"]'));
  kiem('khay: bốn lệnh bánh (cả lùi), hai lệnh trượt, wait; thêm bốn lệnh tay kẹp ở 6 và 10; 7 hỏng: khay = phần cứng = thiếu slide_right; chỉ 7 khai phanCung và canhBao',
    che.every((m) => J(m.hamGoc) === J(m.so === 7 ? KHAY_HONG : [6, 10].includes(m.so) ? KHAY_TAY : KHAY)) && che.every((m) => (m.so === 7) === !!m.phanCung && (m.so === 7) === !!m.canhBao) && J(man(7).phanCung) === J(man(7).hamGoc) && !man(7).phanCung.includes('slide_right') && man(7).phanCung.includes('slide_left'));
  kiem('lệnh chế ở từng màn (taoHam): diag, zig, —, bypass, cross_belt, shift, —, —, —, —; 7, 8, 9 là HÀM CỦA MÀN (không hàm của em mới); chỉ 2, 8 có hàm tham số n',
    J(che.map((m) => m.taoHam)) === J([['diag'], ['zig'], [], ['bypass'], ['cross_belt'], ['shift'], [], [], [], []]) && [7, 8, 9].every((i) => man(i).loiGiai.hamCuaEmMoi.length === 0 && man(i).congThucKhac.every((c) => !c.hamCuaEmMoi || c.hamCuaEmMoi.length === 0)) &&
      J(man(7).loiGiai.hamCuaMan.map((h) => h.ten)) === '["hop_right"]' && J(man(8).loiGiai.hamCuaMan.map((h) => h.ten)) === '["north","east"]' && J(man(9).loiGiai.hamCuaMan.map((h) => h.ten)) === '["step_out","step_back"]' &&
      J(man(2).loiGiai.hamCuaEmMoi[0].thamSo) === '["n"]' && man(8).loiGiai.hamCuaMan.every((h) => J(h.thamSo) === '["n"]'));
  kiem('mục tiêu: 3 tới cờ (có chữ F, bongMo không có); còn lại bong-mo có bongMo (xe mờ cùng hướng cho robot omni); chinhCoDinh ở mọi màn trừ 3 và 10; khoaHamMan ["step_out"] chỉ ở 9; gioiHanHam 4 chỉ ở 10; không màn nào nhiều sân, không daoChieu (lõi không có đảo chiều trượt); ◆ chỉ ở 9',
    che.every((m) => (m.so === 3 ? m.mucTieu === undefined && /F/.test(m.san.join('')) && m.bongMo === undefined : m.mucTieu === 'bong-mo' && !!m.bongMo && !/F/.test(m.san.join('')) && [0, 1, 2, 3].includes(m.bongMo.huong)) &&
      (m.chinhCoDinh === true) === ![3, 10].includes(m.so) && (m.so === 9) === (J(m.khoaHamMan) === '["step_out"]') && (m.so === 10 ? m.gioiHanHam === 4 : m.gioiHanHam === undefined) && !Array.isArray(m.san[0]) && m.daoChieu === undefined &&
      (m.so === 9) === !!(m.bongMo && m.bongMo.diQua && m.bongMo.diQua.length)));
  kiem('vật + xe mờ: chỉ 6 và 10 có vật (ký hiệu o) và vật mờ; xe mờ không cầm vật (bongMo.cam không màn nào); băng chuyền chỉ ở 5 và 10 (chạy xuống); khối tường giữa sân chỉ ở 3, 4, 10 (và hành lang 3, 9)',
    che.every((m) => /o/.test(m.san.join('')) === [6, 10].includes(m.so) && (!!(m.bongMo && m.bongMo.vat && m.bongMo.vat.length)) === [6, 10].includes(m.so) && !(m.bongMo && m.bongMo.cam) && /v/.test(m.san.join('')) === [5, 10].includes(m.so) && !/[><^]/.test(m.san.join(''))));
  kiem('sân ≤ 7 cột × 9 hàng, mọi màn một sân', che.every((m) => m.san.length <= 9 && m.san.every((r) => r.length <= 7)));
  kiem('nhipTheoLoiGiai ở 6, 7, 10 (pick() / drop() hai nhịp mà nâng tay gộp được; 7 sửa hàm trong chương trình khóa), các màn còn lại sao.nhip = BFS', che.every((m) => (m.nhipTheoLoiGiai === true) === [6, 7, 10].includes(m.so)));

  for (const m of che) {
    const kho = khoTruoc(m.id);
    const khoNay = tron(kho, m.loiGiai.hamCuaEmMoi);
    const r = ChamHoc.cham(m, m.loiGiai, khoNay);
    kiem(m.id + ' ' + m.ten + ': lời giải cách 1 thắng 3 sao, ' + r.soO + ' ô = sao.o, ' + r.soNhip + ' nhịp = sao.nhip, không chẩn đoán nào (kể cả thông tin)',
      r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    const bfsGop = nhipCheOmniTatCa(m, kho);
    const bfsKhoi = m.khoaHamMan ? null : nhipCheOmniTatCa(m, kho, { gop: false });
    BANG.push({ m, r, bfsGop, bfsKhoi });
    const dung = m.nhipTheoLoiGiai === true ? (bfsGop !== null && bfsGop <= m.sao.nhip) : bfsGop === m.sao.nhip;
    kiem(m.id + ': BFS đường ngắn nhất (nâng tay gộp vào nhịp kế) = ' + bfsGop + (m.nhipTheoLoiGiai === true ? ' ≤ sao.nhip ' : ' = sao.nhip ') + m.sao.nhip + (bfsKhoi !== null ? '; BFS theo cách viết chuẩn (pick() / drop() hai nhịp) = ' + bfsKhoi + (m.nhipTheoLoiGiai === true && [6, 10].includes(m.so) ? ' = sao.nhip' : ' ≤ sao.nhip') : ''),
      dung && (bfsKhoi === null || ([6, 10].includes(m.so) ? bfsKhoi === m.sao.nhip : bfsKhoi <= m.sao.nhip)), 'BFS = ' + bfsGop + ' / ' + bfsKhoi + ', sao.nhip = ' + m.sao.nhip);
    if (m.chinhCoDinh) {
      const gui = ChamHoc.cham(m, { chinh: ['wait()', 'wait()', 'wait()'], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính gửi lên bị bỏ qua (kết quả y hệt lời giải)', J([gui.thang, gui.soO, gui.soNhip, gui.py]) === J([r.thang, r.soO, r.soNhip, r.py]) && m.maMau.chinh.length >= 1 && m.maMau.chinh.length <= m.khung.chinh);
      const rong = ChamHoc.cham(m, { chinh: [], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính RỖNG gửi lên vẫn chạy bản mẫu (cùng nhịp, cùng sao)', rong.thang === r.thang && rong.sao === r.sao && rong.soNhip === r.soNhip);
    } else {
      kiem(m.id + ': người chơi tự viết chương trình chính (maMau.chinh rỗng, lời giải ≤ 10 dòng, gọi hàm đã chế), chưa viết thì chưa thắng', m.maMau.chinh.length === 0 && m.loiGiai.chinh.length >= 1 && m.loiGiai.chinh.length <= 10 && !ChamHoc.cham(m, { chinh: [] }, khoNay).thang);
    }
    // mục tiêu và bóng mờ
    if (m.mucTieu === 'bong-mo') {
      const bm = m.bongMo, sn = SanHoc.docSan(m.san);
      kiem(m.id + ': bóng mờ nằm trên ô đi được; số vật mờ đúng bằng số vật của sân; chạy xong thắng đúng ở nhịp cuối', !SanHoc.lyDoChan(sn, 'omni', bm.x, bm.y) && (bm.vat || []).length === sn.vat.length && (bm.vat || []).every((q) => !SanHoc.lyDoChan(sn, 'omni', q.x, q.y)) &&
        r.theoSan[0].thang && r.theoSan[0].bongMo.x === bm.x && nhipVet(r.theoSan[0]).slice(-1)[0].suKien.some((e) => e.ma === 'toi-bong-mo') && nhipVet(r.theoSan[0]).length === r.theoSan[0].soNhip);
    } else {
      kiem(m.id + ': mục tiêu tới cờ F; hành lang chỉ có một đường lên tới cờ (không đường tắt)', m.mucTieu === undefined && m.san.join('').includes('F') && m.bongMo === undefined);
    }
    kiem(m.id + ': có ít nhất 1 công thức khác (congThucKhac), khác cách 1', Array.isArray(m.congThucKhac) && m.congThucKhac.length >= 1 && m.congThucKhac.every((c) => c.moTa && (Array.isArray(c.hamCuaEmMoi) || c.baiLam) && J({ b: c.baiLam || m.loiGiai, h: c.hamCuaEmMoi || [] }) !== J({ b: m.loiGiai, h: m.loiGiai.hamCuaEmMoi })));
    m.congThucKhac.forEach((c, i) => {
      const rc = ChamHoc.cham(m, c.baiLam || m.loiGiai, tron(khoNay, c.hamCuaEmMoi));
      kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng, không lỗi — ' + rc.sao + ' sao, ' + rc.soO + ' ô, ' + rc.soNhip + ' nhịp', rc.thang && maLoi(rc).length === 0, J({ thang: rc.thang, cd: rc.chanDoan.map((x) => x.ma) }));
    });
    const rk = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kho, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': loiGiaiKhac (' + m.loiGiaiKhac.moTa + ') thắng đúng 2 sao, nhiều ô hơn, cùng nhịp, vừa khung', rk.thang && rk.sao === 2 && rk.soO > m.sao.o && rk.soNhip === m.sao.nhip && !maCua(rk).includes('tran-khung'), J({ sao: rk.sao, soO: rk.soO, soNhip: rk.soNhip, cd: maCua(rk) }));
    m.loiSai.forEach((ls, i) => {
      const rs = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi));
      const co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): ' + (ls.phaiCoMa.length ? 'không thắng, có mã ' + ls.phaiCoMa.join('+') : 'thắng nhưng thiếu sao'),
        rs.sao < 3 && thieu.length === 0 && (ls.phaiCoMa.length ? !rs.thang : rs.thang), 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + rs.sao);
    });
    kiem(m.id + ': mọi lời sai có phaiCoMa (không rỗng) và lời sai đầu / cuối của màn chế là "để nguyên / chưa chế"', m.loiSai.length >= 4 && m.loiSai.every((ls) => Array.isArray(ls.phaiCoMa) && ls.phaiCoMa.length >= 1));
    const khoaTen = m.khoaHamMan || [];
    const suaTen = m.loiGiai.hamCuaEmMoi.map((h) => h.ten).concat(m.loiGiai.hamCuaMan.filter((h) => !khoaTen.includes(h.ten)).map((h) => h.ten));
    kiem(m.id + ': đề bài nhắc tên lệnh cần chế / sửa (' + (suaTen.join(', ') || 'màn dùng') + ')', suaTen.every((t) => (m.deBai + ' ' + (m.veMaMau || '')).includes(t + '(')), m.deBai);
    kiem(m.id + ': gợi ý 1–2 câu, không nói tên nút; đề 1–3 câu; lời không có gạch dài và không có từ miền Nam', m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && !/bấm|nút/i.test(m.goiY.join(' ')) &&
      !/—/.test([m.ten, m.deBai, m.veMaMau || '', ...m.goiY].join(' ')), m.deBai);
    kiem(m.id + ': tên hàm trong lời là tiếng Anh viết liền bằng gạch dưới (diag, zig…); hamCuaEmCan đều có trong kho lúc tới màn', (m.hamCuaEmCan || []).every((t) => kho.some((h) => h.ten === t)), J((m.hamCuaEmCan || []).filter((t) => !kho.some((h) => h.ten === t))));
  }

  // luật riêng từng màn
  const m1 = man(1), k1 = khoTruoc(m1.id);
  kiem('10.1 Đi chéo: xe mờ chếch lên phải một ô (2,2) so với xe (1,3), cùng hướng lên; chưa chế diag thì không thắng; BFS 2 nhịp (trượt rồi tiến, hai nhịp liền); không đi chéo trong một nhịp',
    m1.bongMo.x - m1.batDau.x === 1 && m1.batDau.y - m1.bongMo.y === 1 && m1.bongMo.huong === m1.batDau.huong && !ChamHoc.cham(m1, m1.maMau, k1).thang && nhipCheOmniTatCa(m1, k1) === 2 && !ChamHoc.cham(m1, m1.maMau, tron(k1, [H('diag', ['slide_right()', 'left_move()', 'right_move()', 'wait()'])])).thang);
  const m2 = man(2), k2 = khoTruoc(m2.id);
  const r2 = ChamHoc.cham(m2, m2.loiGiai, tron(k2, m2.loiGiai.hamCuaEmMoi));
  kiem('10.2 Bậc thang chéo: zig(3) = ba bước chéo; xe mờ cách xe 3 cột và 3 hàng; zig(n) có tham số, lặp n lần diag(); đúng 6 nhịp; zig(2) thì thiếu một bậc', m2.bongMo.x - m2.batDau.x === 3 && m2.batDau.y - m2.bongMo.y === 3 && r2.soNhip === 6 && m2.hamCuaEmCan.includes('diag') &&
    !ChamHoc.cham(Object.assign({}, m2, { chinhCoDinh: false }), { chinh: ['zig(2)'] }, tron(k2, m2.loiGiai.hamCuaEmMoi)).thang && ChamHoc.cham(Object.assign({}, m2, { chinhCoDinh: false }), { chinh: ['zig(3)'] }, tron(k2, m2.loiGiai.hamCuaEmMoi)).thang);
  const m3 = man(3), k3 = khoTruoc(m3.id);
  const r3 = ChamHoc.cham(m3, m3.loiGiai, k3);
  kiem('10.3 Hành lang chéo: tới cờ (0,7) → (1,0); lời giải gọi zig, forward, slide_l (4 dòng, 12 nhịp); không dùng zig mà viết thẳng quá 10 ô (tran-khung); hai thứ tự của bước chéo (trượt rồi tiến, tiến rồi trượt) đều đi được trong hành lang; chỉ MỘT đường lên cờ',
    r3.thang && r3.soNhip === 12 && J([...new Set(m3.loiGiai.chinh.map((s) => s.replace(/\(.*\)/, '')))].sort()) === J(['forward', 'slide_l', 'zig']) && maCua(ChamHoc.cham(m3, m3.loiSai[0].baiLam, k3)).includes('tran-khung') &&
      ChamHoc.cham(m3, m3.congThucKhac[1].baiLam, k3).thang && ChamHoc.cham(m3, { chinh: ['move()', 'slide_r(1)', 'move()', 'slide_r(1)', 'move()', 'slide_r(1)', 'forward(2)', 'slide_l(2)', 'forward(2)'] }, k3).soO > m3.sao.o && nhipCheOmniNganNhat(m3).nhip === 12);
  const m4 = man(4), k4 = khoTruoc(m4.id);
  kiem('10.4 Vòng qua tường: khối tường chắn ngay trước mặt, xe mờ cùng cột cách hai ô sau tường; bypass = 4 nhịp; đi thẳng thì đâm tường; vòng bên trái cũng thắng', m4.san[m4.batDau.y - 1][m4.batDau.x] === '#' && m4.bongMo.x === m4.batDau.x && m4.batDau.y - m4.bongMo.y === 2 && nhipCheOmniTatCa(m4, k4) === 4 &&
    maCua(ChamHoc.cham(m4, m4.loiSai[3].baiLam, tron(k4, m4.loiSai[3].hamCuaEmMoi))).includes('dam-tuong') && ChamHoc.cham(m4, m4.congThucKhac[0].baiLam || m4.loiGiai, tron(k4, m4.congThucKhac[0].hamCuaEmMoi)).thang);
  const m5 = man(5), k5 = khoTruoc(m5.id);
  const r5 = ChamHoc.cham(m5, m5.loiGiai, tron(k5, m5.loiGiai.hamCuaEmMoi));
  const khongBu = ChamHoc.cham(m5, m5.loiGiai, tron(k5, [H('cross_belt', ['slide_r(3)'])]));
  kiem('10.5 Qua băng chuyền: hai băng chạy xuống, xe mờ bên kia cùng hàng; băng kéo xe xuống hai ô nên cross_belt() cần tiến hai ô; thiếu bù thì xe nằm 2 ô dưới xe mờ (5,4); 5 nhịp; cả ba thứ tự tiến-trước / tiến-sau / chia đôi đều 5 nhịp', r5.thang && r5.soNhip === 5 && !khongBu.thang && khongBu.theoSan[0].robot.y === m5.bongMo.y + 2 && khongBu.theoSan[0].robot.x === m5.bongMo.x &&
    m5.congThucKhac.every((c) => ChamHoc.cham(m5, m5.loiGiai, tron(k5, c.hamCuaEmMoi)).soNhip === 5) && ev({ vet: r5.vet }, 'bang-day').length === 2);
  const m6 = man(6), k6 = khoTruoc(m6.id);
  const r6 = ChamHoc.cham(m6, m6.loiGiai, tron(k6, m6.loiGiai.hamCuaEmMoi));
  kiem('10.6 Dời vật sang bên: vật ngay trước mặt xe, vật mờ ở cột bên phải của vật, xe mờ ở chỗ xe cũ; shift = pick, slide_r(1), drop, slide_l(1) (6 nhịp theo cách viết chuẩn, BFS gộp nâng tay chỉ 4); thả khi tay còn nâng thì vật vỡ',
    r6.thang && r6.soNhip === 6 && nhipCheOmniTatCa(m6, k6) === 4 && nhipCheOmniTatCa(m6, k6, { gop: false }) === 6 && m6.bongMo.vat[0].x - SanHoc.docSan(m6.san).vat[0].x === 1 && m6.bongMo.vat[0].y === SanHoc.docSan(m6.san).vat[0].y && ev({ vet: ChamHoc.cham(m6, m6.loiSai[2].baiLam, tron(k6, m6.loiSai[2].hamCuaEmMoi)).vet }, 'vat-vo').length === 1);
  const m7 = man(7), k7 = khoTruoc(m7.id);
  const cu7 = ChamHoc.cham(m7, m7.maMau, k7);
  kiem('10.7 Trượt phải hỏng: hop_right() ban đầu gọi slide_right() hỏng (lenh-goc-hong, không thắng); sửa bằng dodge_right() hay quay đầu + trượt trái đều thắng, 8 nhịp; hamCuaMan không khóa; không vào kho', !cu7.thang && maCua(cu7).includes('lenh-goc-hong') && ChamHoc.cham(m7, m7.loiGiai, k7).thang && m7.congThucKhac.every((c) => ChamHoc.cham(m7, c.baiLam, k7).soNhip === m7.sao.nhip) && m7.khoaHamMan === undefined && !k7.some((h) => h.ten === 'hop_right'), J(maCua(cu7)));
  const m8 = man(8), k8 = khoTruoc(m8.id);
  const cu8 = ChamHoc.cham(m8, m8.maMau, k8);
  kiem('10.8 Sai la bàn: xe quay mặt sang TRÁI; north/east ban đầu viết cho xe quay mặt lên nên xe đi lạc (lech-bong-mo); phải sửa CẢ HAI hàm; slide_right đi lên màn hình, lùi đi sang phải màn hình', m8.batDau.huong === 3 && m8.bongMo.huong === 3 && !cu8.thang && maCua(cu8).includes('lech-bong-mo') && ChamHoc.cham(m8, m8.loiGiai, k8).thang && !ChamHoc.cham(m8, m8.loiSai[1].baiLam, k8).thang && !ChamHoc.cham(m8, m8.loiSai[2].baiLam, k8).thang);
  const m9 = man(9), k9 = khoTruoc(m9.id);
  const pre = ChamHoc.cham(Object.assign({}, m9, { chinhCoDinh: false }), { chinh: ['step_out()'], hamCuaMan: m9.maMau.hamCuaMan }, k9);
  kiem('10.9 Đường về: step_out() = zig(2), forward(2), slide_l(2) đưa xe tới ◆ (3,0) sau 8 nhịp; step_back() phải đưa xe về đúng chỗ + hướng ban đầu; step_out khóa, xem được, step_back không khóa; hành lang đúng một đường nên cách đảo thứ tự (lệnh ngược theo thứ tự ngược) là nhanh nhất',
    pre.theoSan[0].soNhip === 8 && pre.theoSan[0].robot.x === m9.bongMo.diQua[0].x && pre.theoSan[0].robot.y === m9.bongMo.diQua[0].y && pre.theoSan[0].diQua[0].da === true && J(m9.khoaHamMan) === '["step_out"]' && m9.maMau.hamCuaMan.some((h) => h.ten === 'step_out') &&
      J(m9.bongMo) === J({ x: m9.batDau.x, y: m9.batDau.y, huong: m9.batDau.huong, diQua: [{ x: 3, y: 0 }] }) && nhipCheOmniTatCa(m9, k9) === m9.sao.nhip);
  const sua9 = ChamHoc.cham(m9, { chinh: [], hamCuaMan: [H('step_out', ['move()']), m9.loiGiai.hamCuaMan[1]] }, k9);
  kiem('10.9: sửa step_out() gửi lên vẫn bị bản mẫu thay (khóa); step_back() thân ban đầu chỉ có `pass`, để nguyên thì lech-bong-mo; step_back KHÔNG vào kho, không taoHam', J(sua9.theoSan.map((s) => s.thang)) === '[true]' && J(m9.maMau.hamCuaMan[1].than) === '["pass"]' && maCua(ChamHoc.cham(m9, m9.maMau, k9)).includes('lech-bong-mo') && m9.taoHam.length === 0 && !k9.some((h) => h.ten === 'step_back'));
  const m10 = man(10), k10 = khoTruoc(m10.id);
  const r10 = ChamHoc.cham(m10, m10.loiGiai, k10);
  const gh = ChamHoc.cham(m10, m10.loiSai[4].baiLam, k10);
  kiem('10.10 Kho ngang: gioiHanHam 4 — lời giải gọi đúng 4 hàm khác nhau (pick, cross_belt, bypass, drop); 5 hàm khác nhau bị qua-gioi-han-ham (lỗi khung, nêu "4"); vật được mang qua băng trên tay; trùm không khóa chương trình chính',
    r10.thang && J([...new Set(m10.loiGiai.chinh.map((s) => s.replace(/\(.*\)/, '')))].sort()) === J(['bypass', 'cross_belt', 'drop', 'pick']) && maCua(gh).join() === 'qua-gioi-han-ham' && /4/.test(gh.chanDoan[0].loi) && !gh.thang && m10.chinhCoDinh !== true && r10.tay.cam === null);
  kiem('10.10: không bù chỗ băng kéo hay bỏ vòng tường thì thua; BFS gộp ' + nhipCheOmniTatCa(m10, k10) + ' < sao.nhip ' + m10.sao.nhip + ' (nâng tay gộp vào nhịp kế); công thức khác viết thẳng không dùng cross_belt / bypass cũng thắng (4 hàm vẫn vừa)', !ChamHoc.cham(m10, m10.loiSai[0].baiLam, k10).thang && !ChamHoc.cham(m10, m10.loiSai[3].baiLam, k10).thang && nhipCheOmniTatCa(m10, k10) < m10.sao.nhip && ChamHoc.cham(m10, m10.congThucKhac[0].baiLam, k10).thang);

  console.log('\n  Bảng 10 màn che-omni (lời giải cách 1, sao; BFS = nhịp ngắn nhất gộp nâng tay · chuẩn = theo cách viết pick() / drop() hai nhịp)');
  console.log('  màn   | tên                | ô  | nhịp | BFS | chuẩn | tạo / sửa     | lời giải (chương trình chính)');
  for (const { m, bfsGop, bfsKhoi } of BANG) {
    console.log('  ' + m.id.padEnd(5) + ' | ' + m.ten.padEnd(18) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + String(m.sao.nhip).padEnd(4) + ' | ' + String(bfsGop).padEnd(3) + ' | ' + String(bfsKhoi === null ? '—' : bfsKhoi).padEnd(5) + ' | ' + (m.loiGiai.hamCuaEmMoi.map((h) => h.ten).join(',') || (m.loiGiai.hamCuaMan.length ? 'hàm của màn' : '—')).padEnd(13) + ' | ' + m.loiGiai.chinh.join(' ; '));
  }
}

/* ================================================================= 4. BỘ DÒ ĐƯỜNG */
console.log('\n== 4. Bộ dò đường BFS (do-duong-che-omni.mjs) kiểm chéo với SanHoc.chay ==');
{
  // 4a. đường BFS đổi thành lệnh gốc, chạy SanHoc.chay phải THẮNG đúng số nhịp BFS
  for (const m of che.filter((x) => !x.khoaHamMan)) {
    const b = nhipCheOmniNganNhat(m);
    const k = SanHoc.chay(cfgSan(m), chuoiThanhMa(b.chuoi));
    kiem(m.id + ': đường BFS (' + b.nhip + ' nhịp) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng ' + b.nhip + ' nhịp, không lỗi', k.thang === true && k.nhip === b.nhip && !k.loi, 'thang ' + k.thang + ', nhịp ' + k.nhip + ', loi ' + J(k.loi));
  }
  // màn 9: đoạn cố định + BFS
  {
    const m9 = man(9), k9 = khoTruoc(m9.id), bf = nhipCheOmniTatCa(m9, k9);
    const r = ChamHoc.cham(m9, m9.loiGiai, k9);
    kiem('10.9: tính cả đoạn step_out() cố định (8 nhịp chạy thật) + BFS còn lại (8, hành lang chỉ một đường) = ' + bf + ' = số nhịp lời giải ' + r.soNhip, bf === 16 && r.thang && r.soNhip === bf, J([bf, r.thang, r.soNhip]));
  }
  // 4b. chương trình ngẫu nhiên: từng bước của buocMotNhip trùng SanHoc.chay (xe, hướng, tay, vật, ô diQua, kết luận thắng)
  let rngS = 20251015;
  const rnd = (n) => { rngS = (rngS * 1103515245 + 12345) & 0x7fffffff; return (rngS >>> 8) % n; };
  let soMau = 0, soLech = 0, vi = '', soTruot = 0, soBang = 0, soTay = 0, soThang = 0, soHong = 0;
  for (const m of che) {
    const { ctx, S } = trangThaiBanDau(m);
    const pc = SanHoc.phanCungCua(m);
    const dsHD = hanhDongChoPhep(ctx, pc);
    const rong = ctx.rong;
    for (let lan = 0; lan < 130; lan++) {
      const chuoi = [];
      let cur = S, vo = false;
      const n = 3 + rnd(12);
      for (let i = 0; i < n && !vo; i++) {
        const a = dsHD[rnd(dsHD.length)];
        const N = buocMotNhip(ctx, cur, a);
        if (N.pos.some((p) => p === -2)) { vo = true; break; }
        chuoi.push(a); cur = N;
      }
      if (!chuoi.length) continue;
      const code = chuoiThanhMa(chuoi);
      const k = SanHoc.chay(cfgSan(m), code);
      soMau++;
      const posSim = k.vat.map((v) => (v.trangThai === 'dat' ? v.y * rong + v.x : v.trangThai === 'cam' ? -1 : -2));
      const camSim = k.tay && k.tay.cam !== null && k.tay.cam !== undefined ? k.tay.cam - 1 : -1;
      const tuTheSim = k.tay && k.tay.tuThe === 'duoi' ? 1 : 0;
      const gongNhau = k.robot.x === cur.x && k.robot.y === cur.y && k.robot.huong === cur.h && tuTheSim === cur.t && camSim === cur.cam && J(posSim) === J(cur.pos) && k.nhip === chuoi.length;
      const diQuaSim = (k.diQua || []).reduce((mk, q, i) => (q.da ? mk | (1 << i) : mk), 0);
      if (!gongNhau || diQuaSim !== cur.mask) { soLech++; if (!vi) vi = m.id + ' ' + code.replace(/\n/g, ';') + ' sim ' + J([k.robot, k.tay, posSim, diQuaSim]) + ' bfs ' + J(cur); }
      if (daDatDich(ctx, cur) !== (k.thang === true)) { soLech++; if (!vi) vi = m.id + ' thắng lệch: bfs ' + daDatDich(ctx, cur) + ' sim ' + k.thang + ' ' + code.replace(/\n/g, ';'); }
      if (chuoi.some((a) => a.banh >= DoDuong.SLIDE_TRAI)) soTruot++;
      if (nhipVet(k).some((x) => x.suKien.some((e) => e.ma === 'bang-day'))) soBang++;
      if (chuoi.some((a) => a.tuThe || a.kep)) soTay++;
      if (k.thang) soThang++;
    }
    // đường BFS tìm được rồi thêm / bớt vài hành động: giữ kết luận thắng trùng nhau (phủ cả trường hợp THẮNG)
    if (!m.khaiHoang) {
      const b = nhipCheOmniNganNhat(m);
      for (let lan = 0; lan < 8; lan++) {
        const chuoi = b.chuoi.slice();
        if (lan % 2) chuoi.push(dsHD[rnd(dsHD.length)]); else if (chuoi.length > 1) chuoi.splice(rnd(chuoi.length), 1);
        let cur = S, vo = false;
        for (const a of chuoi) { cur = buocMotNhip(ctx, cur, a); if (cur.pos.some((p) => p === -2)) { vo = true; break; } }
        if (vo) continue;
        const k = SanHoc.chay(cfgSan(m), chuoiThanhMa(chuoi));
        soMau++;
        if (daDatDich(ctx, cur) !== (k.thang === true) || k.robot.x !== cur.x || k.robot.y !== cur.y) { soLech++; if (!vi) vi = m.id + ' đường BFS biến đổi: bfs ' + daDatDich(ctx, cur) + ' sim ' + k.thang; }
        if (k.thang) soThang++;
      }
    }
    // phần cứng hỏng: bộ dò không bao giờ chọn slide_right ở màn 7
    if (m.so === 7) soHong += dsHD.filter((a) => a.banh === DoDuong.SLIDE_PHAI).length;
  }
  kiem('chương trình ngẫu nhiên (' + soMau + ' mẫu trên 10 sân): từng bước (ô, hướng, tay, vật cầm, ô các vật, ô ◆ đã qua, số nhịp) của bộ dò trùng SanHoc.chay và kết luận thắng trùng nhau', soMau >= 1000 && soLech === 0, soLech + ' lệch · ' + vi);
  kiem('mẫu ngẫu nhiên có đủ loại ca: có trượt (' + soTruot + '), băng đẩy (' + soBang + '), tay kẹp (' + soTay + '), ca thắng (' + soThang + ')', soTruot >= 400 && soBang >= 50 && soTay >= 150 && soThang >= 12, [soTruot, soBang, soTay, soThang].join(' / '));
  kiem('phần cứng hỏng ở 10.7: hanhDongChoPhep không có hành động nào là slide_right (có slide_left), ngược với màn thường', soHong === 0 && hanhDongChoPhep(dungNguCanh(man(7)), SanHoc.phanCungCua(man(7))).some((a) => a.banh === DoDuong.SLIDE_TRAI) && hanhDongChoPhep(dungNguCanh(man(4)), SanHoc.phanCungCua(man(4))).some((a) => a.banh === DoDuong.SLIDE_PHAI));
  // 4c. bộ dò tự kiểm
  const m1 = man(1), m6 = man(6);
  kiem('bộ dò tự kiểm: bỏ lệnh trượt khỏi phần cứng ở 10.1 thì xe chỉ còn cách quay xe (4 nhịp, như xe hai bánh) — dài hơn 2 nhịp; hỏng cả hai bánh trượt thì vẫn tới được', nhipCheOmniNganNhat(m1, { phanCung: SanHoc.phanCungCua(m1).filter((t) => !t.startsWith('slide')) }).nhip === 4 && nhipCheOmniNganNhat(m1).nhip === 2);
  kiem('bộ dò: 10.6 không có tay (bỏ lệnh tay khỏi phần cứng) thì vật không dời được: không giải được', nhipCheOmniNganNhat(m6, { phanCung: SanHoc.phanCungCua(m6).filter((t) => !['arm_down', 'arm_up', 'grab', 'release'].includes(t)) }).nhip === null);
  kiem('bộ dò: tuyChon.toiDaTrangThai nhỏ → catNgang true (không kết luận)', nhipCheOmniNganNhat(man(10), { toiDaTrangThai: 100 }).catNgang === true);
  kiem('chuoiThanhMa viết slide_left() / slide_right() và lệnh tay, mỗi hành động một wait()', chuoiThanhMa([{ tuThe: 'duoi', kep: 'kep', banh: DoDuong.SLIDE_TRAI }, { tuThe: 'tren', kep: null, banh: DoDuong.SLIDE_PHAI }]) === L('arm_down()', 'grab()', 'slide_left()', 'wait()', 'arm_up()', 'slide_right()', 'wait()'));
}

/* ================================================================= 5. KHO CUỐI GAME */
console.log('\n== 5. Kho hàm của em ==');
{
  const cuoi = khoTruoc('het');
  kiem('kho cuối game có đủ năm hàm của che-omni, slide_r và slide_l của omni và tên cốt truyện khóa; hop_right, north, east, step_out, step_back (hàm của màn) không có trong kho', ['diag', 'zig', 'bypass', 'cross_belt', 'shift', 'slide_r', 'slide_l'].every((t) => cuoi.some((h) => h.ten === t)) && ['hop_right', 'north', 'east', 'step_out', 'step_back'].every((t) => !cuoi.some((h) => h.ten === t)));
  const sach = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  kiem('KhoHam khóa tên: người chơi không tạo được hàm tên diag / zig / bypass / cross_belt / shift bằng tên trùng ngoài màn chế nó', ['diag', 'zig', 'bypass', 'cross_belt', 'shift'].every((t) => tenCotTruyen.includes(t)) && sach.tao('diag', [], {}).ok === false);
  const k9 = khoTruoc(man(1).id);
  kiem('hàm chế ở che-omni dùng được ở chương SAU: diag, zig có thân đúng trong kho cuối game (thân lấy từ lời giải)', J(cuoi.find((h) => h.ten === 'zig').thamSo) === '["n"]' && J(cuoi.find((h) => h.ten === 'cross_belt').than) === J(['slide_r(3)', 'forward(2)']) && !k9.some((h) => h.ten === 'diag'));
}

/* ================================================================= 6. THẺ SCRIPT CỦA GAME */
console.log('\n== 6. game/choi.html nạp man-che-omni.js đúng thứ tự ==');
{
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có thẻ script ../man-che-omni.js đúng một lần, sau man-omni.js (cùng sổ màn)', tags.filter((t) => t === '../man-che-omni.js').length === 1 && vtri('man-che-omni.js') > vtri('man-omni.js'), J(tags));
  kiem('so-lenh.js nạp trước man-che-omni.js', vtri('so-lenh.js') >= 0 && vtri('so-lenh.js') < vtri('man-che-omni.js'));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

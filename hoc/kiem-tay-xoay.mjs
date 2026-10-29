/* ============================================================================
   kiem-tay-xoay.mjs — máy kiểm bộ phận TAY XOAY của "Robot Chấn Hưng" và chương `tay-xoay` (Tay xoay, chương 21; KE-HOACH-CHE-LENH.md, mục 5b.3). Chương chế lệnh: kiem-che-tay-xoay.mjs.
   Gồm:
   - LÕI (san-hoc.js, phần TAY XOAY): arm_left() / arm_right() xoay khớp MỘT nấc giữa trái · trước · phải (lúc đầu "truoc"); grab / release làm ở Ô TAY CHỈ (trước mặt, bên trái, bên phải xe theo hướng xe);
     thứ tự trong nhịp: tay nâng → xoay → tay hạ → kẹp / thả → bánh; tay hạ thì khớp kẹt ('tay-xoay-ket'); hết nấc ('xoay-het-nac'); gọi lại trong một nhịp ('tay-goi-lai' nhom 'xoay');
     sự kiện ghi huongTay; xe quay thì ô tay chỉ đổi theo; tay hạ thì xe không đi; robot không có lệnh xoay thì tay không có trường xoay (các chương cũ không đổi);
   - daoChieu 'xoay' (arm_left ↔ arm_right đổi chỗ), phanCung thiếu arm_left / arm_right (khớp hỏng → 'lenh-goc-hong'), nhện không gắn tay xoay, cặp lệnh ngược trong LENH_NGUOC;
   - bongMo.xoay (nấc khớp của xe mờ; mặc định 'truoc'), chẩn đoán lech-bong-mo nói tay đang chỉ đâu;
   - bộ dò BFS có tay xoay (do-duong-tay-xoay.mjs) kiểm chéo với SanHoc.chay bằng chương trình ngẫu nhiên và bằng chính đường BFS tìm được;
   - 10 màn tay-xoay: lời giải 3 sao (đúng sao.o, sao.nhip), BFS không dài hơn (hoặc bằng khi không nhipTheoLoiGiai), lời giải khác đúng 2 sao, lời sai đúng mã, maMau, daoChieu / phanCung của 21.7 / 21.8, huy hiệu;
   - giao diện (đọc mã nguồn): part tay xoay, VeRobot, đèn khớp xoay, khay, Sổ lệnh, hướng dẫn, thẻ script của game/choi.html.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs.
   Chạy: node hoc/kiem-tay-xoay.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
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
const DoDuong = await import('./do-duong-tay-xoay.mjs');
const { nhipTayXoayNganNhat, nhipTayXoayTatCa, buocMotNhip, trangThaiBanDau, daDatDich, chuoiThanhMa } = DoDuong;

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
const chuong = tatCa.filter((m) => m.chuong === 'tay-xoay');
const man = (so) => ManHoc.timMa('tay-xoay.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const L = (...d) => d.join('\n') + '\n';
const doc = (f) => fs.readFileSync(path.join(day, f), 'utf8');

/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải; màn tiết kiệm nhịp sửa riêng, không ghi vào kho). classic: kho "cổ điển" của kiem-hoc (không nhận bản sửa của che-xe, che-tay, robot-hoan-thien). */
function khoTruoc(id, classic) {
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  for (const m of tatCa) {
    if (m.id === id) break;
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi) {
      if (classic && ['che-xe', 'che-tay', 'robot-hoan-thien'].includes(m.chuong) && kho.tim(h.ten)) continue;
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

const KHAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'];
const SAN = ['.....', '.....', '..o..', '.o.o.', '.....'];          // vật trước mặt (2,2), bên trái (1,3), bên phải (3,3) của xe ở (2,3) quay lên
const bd0 = { x: 2, y: 3, huong: 0 };
function chay(code, extra, rows, bd) {
  return SanHoc.chay(Object.assign({ san: rows || SAN, batDau: bd || bd0, loaiRobot: 'banh', hamGoc: KHAY }, extra || {}), code);
}
const vatTai = (kq, x, y) => kq.vat.find((v) => v.x === x && v.y === y);

/* ================================================================= 1. LÕI: KHỚP XOAY BA NẤC */
console.log('\n== 1. Tay xoay: arm_left() / arm_right() xoay khớp một nấc (trái · trước · phải) ==');
{
  const x0 = chay('');
  kiem('lúc đầu khớp ở nấc "truoc"; kết quả và vết nhịp có tay.xoay (chỉ khi robot có lệnh xoay)', x0.tay.xoay === 'truoc' && J(x0.tay) === J({ tuThe: 'tren', kep: false, cam: null, xoay: 'truoc' }), J(x0.tay));
  const a = chay(L('arm_left()', 'wait()'));
  kiem('arm_left(): truoc → trai trong một nhịp; vết nhịp robot.tay.xoay = "trai"; sự kiện xoay-tay { tu: truoc, den: trai }',
    a.tay.xoay === 'trai' && nhipVet(a)[0].robot.tay.xoay === 'trai' && J(maSK(nhipVet(a)[0], 'xoay-tay')) === J([{ ma: 'xoay-tay', tu: 'truoc', den: 'trai' }]) && a.nhip === 1, J(a.tay));
  const b = chay(L('arm_right()', 'wait()'));
  kiem('arm_right(): truoc → phai', b.tay.xoay === 'phai');
  const c = chay(L('arm_left()', 'wait()', 'arm_right()', 'wait()'));
  kiem('xoay trái rồi xoay phải: về lại nấc "truoc" (hai lệnh là cặp lệnh ngược)', c.tay.xoay === 'truoc');
  const d = chay(L('arm_left()', 'wait()', 'arm_left()', 'wait()'));
  kiem('đã ở nấc trái mà arm_left() nữa: khớp đứng yên, ghi xoay-het-nac (thông tin, kèm nhip, huong, nac, lenh), vẫn mất nhịp', d.tay.xoay === 'trai' && maSK(d, 'xoay-het-nac').length === 1 && maSK(d, 'xoay-het-nac')[0].huong === 'trai' && maSK(d, 'xoay-het-nac')[0].nac === 'trai' && maSK(d, 'xoay-het-nac')[0].nhip === 2 && d.nhip === 2 && maSK(d, 'xoay-het-nac')[0].lenh.ten === 'arm_left', J(d.suKien));
  const e = chay(L('arm_right()', 'wait()', 'arm_right()', 'wait()'));
  kiem('đã ở nấc phải mà arm_right() nữa: xoay-het-nac, khớp vẫn ở nấc phải', e.tay.xoay === 'phai' && maSK(e, 'xoay-het-nac').length === 1);
  const f = chay(L('arm_left()', 'wait()', 'arm_right()', 'wait()', 'arm_right()', 'wait()'));
  kiem('đi từ trái sang phải mất hai nhịp: mỗi nhịp một nấc (trái → trước → phải)', f.tay.xoay === 'phai' && nhipVet(f).map((n) => n.robot.tay.xoay).join() === 'trai,truoc,phai');
  const g = chay(L('arm_left()', 'arm_right()', 'wait()'));
  kiem('hai lệnh xoay cùng một nhịp: lệnh sau bị bỏ, ghi tay-goi-lai nhom "xoay" (kèm truoc), khớp chỉ xoay một nấc',
    g.tay.xoay === 'trai' && maSK(g, 'tay-goi-lai').length === 1 && maSK(g, 'tay-goi-lai')[0].nhom === 'xoay' && maSK(g, 'tay-goi-lai')[0].ten === 'arm_right' && maSK(g, 'tay-goi-lai')[0].truoc.ten === 'arm_left', J(g.suKien));
  const h = chay(L('arm_left()', 'arm_down()', 'grab()', 'wait()'));
  kiem('xoay, hạ tay và kẹp chung MỘT nhịp: thứ tự máy làm xoay → hạ → kẹp nên kẹp được vật bên trái (1,3)', h.tay.cam !== null && h.vat.find((v) => v.id === h.tay.cam).trangThai === 'cam' && h.nhip === 1 && h.tay.xoay === 'trai' && h.tay.tuThe === 'duoi', J(h.tay));
  const i = chay(L('arm_down()', 'arm_left()', 'grab()', 'wait()'));
  kiem('thứ tự VIẾT lệnh không quan trọng: arm_down(); arm_left(); grab() vẫn là xoay trước, hạ sau, kẹp cuối', J(i.tay) === J(h.tay));
  const j = chay(L('arm_down()', 'wait()', 'arm_left()', 'wait()'));
  kiem('tay đã hạ (nhịp trước) rồi arm_left(): khớp kẹt, lệnh bỏ, ghi tay-xoay-ket (lỗi) kèm nhip, huong, lenh; khớp vẫn "truoc"',
    j.tay.xoay === 'truoc' && maSK(j, 'tay-xoay-ket').length === 1 && maSK(j, 'tay-xoay-ket')[0].nhip === 2 && maSK(j, 'tay-xoay-ket')[0].huong === 'trai' && maSK(j, 'tay-xoay-ket')[0].lenh.ten === 'arm_left', J(j.suKien));
  const k = chay(L('arm_down()', 'wait()', 'arm_up()', 'arm_left()', 'wait()'));
  kiem('tay đang hạ mà nhịp này có arm_up(): máy nâng tay TRƯỚC rồi mới xoay, nên xoay được (nâng và xoay chung một nhịp)', k.tay.xoay === 'trai' && k.tay.tuThe === 'tren' && maSK(k, 'tay-xoay-ket').length === 0, J(k.tay));
  const l = chay(L('arm_left()', 'wait()', 'arm_down()', 'arm_right()', 'wait()'));
  kiem('xoay làm TRƯỚC khi hạ: arm_down(); arm_right() cùng nhịp (tay đang nâng) thì xoay được, rồi hạ tay', l.tay.xoay === 'truoc' && l.tay.tuThe === 'duoi' && maSK(l, 'tay-xoay-ket').length === 0, J(l.tay));
  const m = chay(L('arm_left()', 'wait()', 'arm_down()', 'wait()', 'arm_right()', 'wait()'));
  kiem('hạ tay ở nhịp riêng rồi xoay ở nhịp sau: khớp kẹt (tay đã hạ từ nhịp trước)', m.tay.xoay === 'trai' && maSK(m, 'tay-xoay-ket').length === 1);
  const n = chay(L('arm_left()', 'left_move()', 'right_move()', 'wait()'), {}, ['.....', '.....', '.....', '.....', '.....']);
  kiem('xoay khớp và lệnh bánh chung một nhịp: cả hai làm được (tay nâng không cản xe)', n.tay.xoay === 'trai' && vt(n.robot) === '2,2' && n.nhip === 1);
  const o = chay(L('arm_down()', 'wait()', 'left_move()', 'right_move()', 'wait()'));
  kiem('tay hạ thì xe không đi (tay-vuong), như tay kẹp thường', maSK(o, 'tay-vuong').length === 1 && vt(o.robot) === '2,3');
  const p = chay(L('arm_left()', 'wait()', 'left_move()', 'wait()'), {}, SAN, { x: 2, y: 3, huong: 0 });
  kiem('xe quay thì khớp quay theo: quay phải một góc vuông (huong 1), tay vẫn nấc "trai"', p.robot.huong === 1 && p.tay.xoay === 'trai');
}

/* ================================================================= 2. LÕI: GẮP / THẢ Ở Ô TAY CHỈ */
console.log('\n== 2. grab / release làm ở ô mà tay đang chỉ (trước mặt, bên trái, bên phải xe theo hướng xe) ==');
{
  const nhatTrai = chay(L('arm_left()', 'arm_down()', 'grab()', 'wait()'));
  const sk = nhipVet(nhatTrai)[0].suKien.find((e) => e.ma === 'nhat-vat');
  kiem('nhặt bên trái: vật ở ô (1,3) vào kẹp; sự kiện nhat-vat { o: (1,3), huongTay: trai }', sk && sk.o.x === 1 && sk.o.y === 3 && sk.huongTay === 'trai', J(sk));
  const nhatPhai = chay(L('arm_right()', 'arm_down()', 'grab()', 'wait()'));
  kiem('nhặt bên phải: vật ở ô (3,3); huongTay phai', nhatPhai.tay.cam !== null && nhatPhai.vat.find((v) => v.id === nhatPhai.tay.cam).trangThai === 'cam' && nhipVet(nhatPhai)[0].suKien.find((e) => e.ma === 'nhat-vat').o.x === 3);
  const nhatTruoc = chay(L('arm_down()', 'grab()', 'wait()'));
  kiem('khớp ở nấc trước thì như tay kẹp thường: nhặt vật ở ô trước mặt (2,2); sự kiện ghi huongTay "truoc"', nhatTruoc.tay.cam !== null && nhipVet(nhatTruoc)[0].suKien.find((e) => e.ma === 'nhat-vat').huongTay === 'truoc');
  // hướng xe đổi thì ô tay chỉ đổi: xe quay phải (huong 1, nhìn sang phải): nấc trái chỉ lên (ô phía trên xe), nấc phải chỉ xuống
  const san2 = ['.....', '..o..', '.....', '..o..', '.....'];
  const q1 = chay(L('left_move()', 'wait()', 'arm_left()', 'arm_down()', 'grab()', 'wait()'), {}, san2, { x: 2, y: 2, huong: 0 });
  kiem('xe quay phải (huong 1) rồi xoay trái: ô tay chỉ là ô PHÍA TRÊN xe trên màn hình, (2,1): nhặt được vật ở đó', q1.robot.huong === 1 && q1.tay.cam !== null && nhipVet(q1)[1].suKien.find((e) => e.ma === 'nhat-vat').o.y === 1, J(q1.tay));
  const q2 = chay(L('left_move()', 'wait()', 'arm_right()', 'arm_down()', 'grab()', 'wait()'), {}, san2, { x: 2, y: 2, huong: 0 });
  kiem('xe quay phải rồi xoay phải: ô tay chỉ là ô PHÍA DƯỚI xe, (2,3)', q2.tay.cam !== null && nhipVet(q2)[1].suKien.find((e) => e.ma === 'nhat-vat').o.y === 3);
  const q3 = chay(L('arm_left()', 'wait()', 'left_move()', 'right_back()', 'wait()', 'arm_down()', 'grab()', 'wait()'), {}, ['.....', '.....', '.....', '..o..', '.....'], { x: 2, y: 2, huong: 0 });
  kiem('xe quay đầu (huong 2) với tay ở nấc trái: tay chỉ sang bên kia, ô (3,2) — vật ở (2,3) phía dưới không bị kẹp; kẹp hụt ghi kep-hut', q3.robot.huong === 2 && q3.tay.cam === null && maSK(q3, 'kep-hut').length === 1);
  // kẹp hụt
  const hut = chay(L('arm_right()', 'arm_down()', 'grab()', 'wait()'), {}, ['.....', '.....', '.....', '.o...', '.....'], bd0);
  const kh = maSK(hut, 'kep-hut')[0];
  kiem('kẹp hụt bên hông: ô bên phải xe trống → kep-hut lyDo khong-co-vat, o (3,3), huongTay phai', hut.tay.cam === null && kh && kh.lyDo === 'khong-co-vat' && kh.o.x === 3 && kh.huongTay === 'phai', J(kh));
  const hut2 = chay(L('arm_left()', 'grab()', 'wait()'));
  kiem('kẹp ở nấc trái khi tay còn nâng: kep-hut lyDo tay-nang, huongTay trai', maSK(hut2, 'kep-hut').length === 1 && maSK(hut2, 'kep-hut')[0].lyDo === 'tay-nang' && maSK(hut2, 'kep-hut')[0].huongTay === 'trai');
  // đặt vật
  const dat1 = chay(L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_left()', 'wait()', 'arm_down()', 'release()', 'wait()'), {}, ['.....', '.....', '..o..', '.....', '.....'], bd0);
  const dv = nhipVet(dat1)[2].suKien.find((e) => e.ma === 'dat-vat');
  kiem('nhặt trước mặt, nâng + xoay trái, hạ + thả: vật nằm xuống ô bên trái (1,3); dat-vat { o: (1,3), huongTay: trai }', vatTai(dat1, 1, 3) && dv && dv.o.x === 1 && dv.huongTay === 'trai', J(dv));
  // thả bị chặn: ô bên trái là tường / vật
  const chanT = chay(L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_left()', 'wait()', 'arm_down()', 'release()', 'wait()'), {}, ['.....', '.....', '..o..', '.#...', '.....'], bd0);
  const tb = maSK(chanT, 'tha-bi-chan')[0];
  kiem('thả sang ô bên trái là tường: tha-bi-chan (vat "tuong", kieu "kep", huongTay trai), vật vẫn ở tay', tb && tb.vat === 'tuong' && tb.kieu === 'kep' && tb.huongTay === 'trai' && chanT.tay.cam !== null, J(tb));
  const chanV = chay(L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_left()', 'wait()', 'arm_down()', 'release()', 'wait()'), {}, ['.....', '.....', '..o..', '.o...', '.....'], bd0);
  kiem('thả sang ô bên trái đã có vật: tha-bi-chan vat "vat"', maSK(chanV, 'tha-bi-chan')[0] && maSK(chanV, 'tha-bi-chan')[0].vat === 'vat');
  // thả khi tay nâng: vỡ ở ô tay chỉ
  const vo = chay(L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_left()', 'wait()', 'release()', 'wait()'), {}, ['.....', '.....', '..o..', '.....', '.....'], bd0);
  const ev = maSK(vo, 'vat-vo')[0];
  kiem('thả khi tay đang nâng: vật rơi xuống ô bên trái và vỡ (vat-vo o (1,3), huongTay trai)', ev && ev.o.x === 1 && ev.o.y === 3 && ev.huongTay === 'trai' && vatTai(vo, 1, 3) && vatTai(vo, 1, 3).trangThai === 'vo', J(ev));
  // vật cầm đi theo xe và theo khớp
  const mang = chay(L('arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_move()', 'wait()'), {}, ['.....', '.....', '.....', '.....', '.o...'], { x: 2, y: 4, huong: 0 });
  kiem('xe cầm vật ở bên hông rồi tiến: vật đi theo xe (trangThai "cam", x y = ô xe), tay vẫn nấc trái', mang.tay.cam !== null && vt(mang.robot) === '2,3' && mang.vat[0].trangThai === 'cam' && mang.vat[0].x === 2 && mang.vat[0].y === 3 && mang.tay.xoay === 'trai');
  // robot không có lệnh xoay: tay không có trường xoay
  const kepThuong = chay(L('arm_down()', 'grab()', 'wait()'), { hamGoc: ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'] });
  kiem('robot chỉ có bốn lệnh tay (các chương cũ): tay { tuThe, kep, cam } không có trường xoay; vết nhịp cũng không có; sự kiện không có huongTay',
    J(Object.keys(kepThuong.tay)) === '["tuThe","kep","cam"]' && !('xoay' in nhipVet(kepThuong)[0].robot.tay) && !('huongTay' in nhipVet(kepThuong)[0].suKien.find((e) => e.ma === 'nhat-vat')), J(kepThuong.tay));
  const tamLoi = (code) => { try { chay(code, { hamGoc: ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'] }); return null; } catch (e) { return e; } };
  kiem('robot chưa có arm_left: gọi arm_left() báo "chưa có hàm" (khay không có lệnh đó), không phải lỗi lạ', /arm_left/.test((chay(L('arm_left()', 'wait()'), { hamGoc: ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'] }).loi || {}).thongDiep || ''));
  const camLoi = ChamHoc.cham({ san: SAN, batDau: bd0, loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'], khung: { chinh: 10, moiHam: 10 }, moXuong: true, mucTieu: 'dua-vat' }, { chinh: ['arm_left()', 'wait()'], hamCuaMan: [] }, []);
  kiem('chẩn đoán của màn chưa có arm_left: ham-chua-co hay loi-chay có nhắc arm_left, không ném ngoại lệ', camLoi.chanDoan.some((c) => /arm_left/.test(c.loi)), J(camLoi.chanDoan.map((c) => c.ma + ':' + c.loi)));
}

/* ================================================================= 3. daoChieu 'xoay', phanCung, nhện, LENH_NGUOC */
console.log('\n== 3. daoChieu "xoay" (khớp lắp ngược), khớp hỏng (phanCung), nhện không gắn, cặp lệnh ngược ==');
{
  const dc = (code, dao, extra) => chay(code, Object.assign({ daoChieu: dao }, extra || {}));
  const t1 = dc(L('arm_left()', 'wait()'), ['xoay']);
  kiem('daoChieu ["xoay"]: arm_left() xoay khớp sang PHẢI (vết lệnh vẫn ghi tên lệnh người chơi gọi: arm_left)', t1.tay.xoay === 'phai' && t1.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten).join() === 'arm_left,wait');
  const t2 = dc(L('arm_right()', 'arm_down()', 'grab()', 'wait()'), ['xoay']);
  kiem('daoChieu ["xoay"]: arm_right() xoay sang TRÁI nên nhặt được vật bên trái (1,3)', t2.tay.xoay === 'trai' && t2.tay.cam !== null);
  kiem('daoChieu ["xoay"] ghép được với "tay" và "kep" và bánh: arm_up() hạ tay, release() kẹp, left_move() làm bánh trái lùi',
    (() => { const r = dc(L('arm_right()', 'arm_up()', 'release()', 'wait()'), ['xoay', 'tay', 'kep']); return r.tay.xoay === 'trai' && r.tay.tuThe === 'duoi' && r.tay.cam !== null; })() &&
    (() => { const r = dc(L('left_move()', 'wait()'), ['xoay', 'trai']); return r.robot.huong === 3; })());
  const nem = (f) => { try { f(); return false; } catch (e) { return /daoChieu/.test(e.message); } };
  kiem('daoChieu "xoay" cần robot có tay xoay: khay chỉ có bốn lệnh tay bị từ chối; lời nhắc nêu "xoay"',
    nem(() => chay('', { hamGoc: ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'], daoChieu: ['xoay'] })) && (() => { try { dc('', ['giua']); return false; } catch (e) { return /"xoay"/.test(e.message); } })());
  // phần cứng hỏng: thiếu arm_right (hay arm_left)
  const KET = KHAY.filter((t) => t !== 'arm_right');
  const hongRaw = chay(L('arm_right()', 'wait()'), { hamGoc: KET, phanCung: KET });
  kiem('phanCung thiếu arm_right: gọi arm_right() báo "chưa có hàm" ở lõi; arm_left() vẫn chạy', /arm_right/.test((hongRaw.loi || {}).thongDiep || '') && chay(L('arm_left()', 'wait()'), { hamGoc: KET, phanCung: KET }).tay.xoay === 'trai');
  const manKet = { san: SAN, batDau: bd0, loaiRobot: 'banh', hamGoc: KET, phanCung: KET, khung: { chinh: 10, moiHam: 10 }, moXuong: true, mucTieu: 'dua-vat', canhBao: 'Khớp xoay kẹt' };
  const chuanDoan = ChamHoc.cham(manKet, { chinh: ['arm_right()', 'wait()'], hamCuaMan: [] }, []);
  kiem('ChamHoc: lệnh xoay thiếu trong phần cứng là BỘ PHẬN HỎNG (lenh-goc-hong, nói theo canhBao của màn), không phải ham-chua-co', maCua(chuanDoan).includes('lenh-goc-hong') && !maCua(chuanDoan).includes('ham-chua-co') && /Khớp xoay kẹt/.test(chuanDoan.chanDoan.find((c) => c.ma === 'lenh-goc-hong').loi), J(chuanDoan.chanDoan.map((c) => c.ma + ':' + c.loi)));
  const manKet2 = Object.assign({}, manKet, { canhBao: undefined });
  kiem('không khai canhBao: lời mặc định gọi "Khớp xoay hỏng"', /Khớp xoay hỏng/.test(ChamHoc.cham(manKet2, { chinh: ['arm_right()', 'wait()'], hamCuaMan: [] }, []).chanDoan.find((c) => c.ma === 'lenh-goc-hong').loi));
  const rac = (f) => { try { f(); return false; } catch (e) { return /Tay xoay chỉ gắn lên xe có bánh/.test(e.message); } };
  kiem('nhện không gắn tay xoay (không có hướng mặt): lỗi cấu hình tiếng Việt', rac(() => SanHoc.chay({ san: SAN, batDau: bd0, loaiRobot: 'nhen', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'arm_left', 'arm_right'] }, '')));
  kiem('LENH_NGUOC: arm_left ↔ arm_right là một cặp lệnh ngược; Sổ lệnh có hai lệnh gốc đó với lệnh ngược khớp; capNguoc() có cặp', SanHoc.LENH_NGUOC.arm_left === 'arm_right' && SanHoc.LENH_NGUOC.arm_right === 'arm_left' &&
    SoLenh.lenhGoc.find((l) => l.ten === 'arm_left').nguoc === 'arm_right' && SoLenh.lenhGoc.find((l) => l.ten === 'arm_right').nguoc === 'arm_left' && SoLenh.capNguoc().some((c) => c[0] === 'arm_left' && c[1] === 'arm_right'));
  kiem('TAY_LENH có sáu lệnh; TAY_NHOM gom arm_left / arm_right vào nhóm "xoay"; XOAY_NAC ba nấc từ trái sang phải', SanHoc.TAY_LENH.length === 6 && SanHoc.TAY_NHOM.arm_left === 'xoay' && SanHoc.TAY_NHOM.arm_right === 'xoay' && J(SanHoc.XOAY_NAC) === '["trai","truoc","phai"]' && J(SanHoc.TAY_XOAY) === '["arm_left","arm_right"]');
  kiem('kho hàm của em khóa tên arm_left / arm_right (hàm gốc), không đặt tên hàm trùng', KhoHam.HAM_GOC_MAC_DINH.includes('arm_left') && KhoHam.HAM_GOC_MAC_DINH.includes('arm_right') && !KhoHam.moi().tao('arm_left', [], {}).ok);
}

/* ================================================================= 4. BÓNG MỜ: bongMo.xoay */
console.log('\n== 4. bongMo.xoay: xe mờ có tay chỉ đúng nấc khớp ==');
{
  const BM = (bongMo, code, extra) => chay(code, Object.assign({ mucTieu: 'bong-mo', bongMo }, extra || {}), ['.....', '.....', '.....', '.....', '.....']);
  const m0 = BM({ x: 2, y: 3, huong: 0 }, '');
  kiem('robot có tay xoay mà bongMo không khai xoay: mặc định "truoc"; kết quả bongMo.xoay = "truoc"; chương trình rỗng thì thắng (tay ở nấc trước)', m0.thang === true && m0.bongMo.xoay === 'truoc');
  const m1 = BM({ x: 2, y: 3, huong: 0 }, L('arm_left()', 'wait()'));
  kiem('xong mà tay còn chỉ sang trái, xe mờ chỉ phía trước: KHÔNG thắng; chẩn đoán lech-bong-mo nói "Tay xoay đang chỉ bên trái, còn tay của xe mờ chỉ phía trước"',
    m1.thang === false && (() => { const c = ChamHoc.cham({ san: ['.....', '.....', '.....', '.....', '.....'], batDau: bd0, loaiRobot: 'banh', hamGoc: KHAY, khung: { chinh: 10, moiHam: 10 }, moXuong: true, mucTieu: 'bong-mo', bongMo: { x: 2, y: 3, huong: 0 } }, { chinh: ['arm_left()', 'wait()'], hamCuaMan: [] }, []); const d = c.chanDoan.find((x) => x.ma === 'lech-bong-mo'); return d && /Tay xoay đang chỉ bên trái, còn tay của xe mờ chỉ phía trước/.test(d.loi); })());
  const m2 = BM({ x: 2, y: 3, huong: 0, xoay: 'trai' }, L('arm_left()', 'wait()'));
  kiem('bongMo.xoay "trai": tay dừng ở nấc trái thì thắng; ở nấc trước thì không', m2.thang === true && BM({ x: 2, y: 3, huong: 0, xoay: 'trai' }, '').thang === false);
  const m3 = BM({ x: 2, y: 3, huong: 0, xoay: 'phai' }, L('arm_right()', 'wait()'));
  kiem('bongMo.xoay "phai": thắng khi tay chỉ phải', m3.thang === true && m3.bongMo.xoay === 'phai');
  const nem = (f) => { try { f(); return false; } catch (e) { return /bongMo\.xoay/.test(e.message); } };
  kiem('bongMo.xoay lạ bị từ chối ("trai", "truoc" hoặc "phai"); robot không có tay xoay mà khai xoay cũng bị từ chối', nem(() => BM({ x: 2, y: 3, huong: 0, xoay: 'giua' }, '')) &&
    nem(() => chay('', { mucTieu: 'bong-mo', bongMo: { x: 2, y: 3, huong: 0, xoay: 'trai' }, hamGoc: ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'] }, ['.....', '.....', '.....', '.....', '.....'])));
  const m5 = chay('', { mucTieu: 'bong-mo', bongMo: { x: 2, y: 3, huong: 0 }, hamGoc: ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'] }, ['.....', '.....', '.....', '.....', '.....']);
  kiem('robot chỉ có bốn lệnh tay: bongMo.xoay là null (các chương cũ không đổi)', m5.thang === true && m5.bongMo.xoay === null);
  const m6 = BM({ x: 2, y: 3, huong: 0, cam: true }, L('arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()'), { san: ['.....', '.....', '.....', '.o...', '.....'] });
  kiem('xe mờ cầm vật + tay chỉ trước: nhặt vật bên trái rồi xoay về → thắng; thiếu bước xoay về thì không', m6.thang === true && BM({ x: 2, y: 3, huong: 0, cam: true }, L('arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()'), { san: ['.....', '.....', '.....', '.o...', '.....'] }).thang === false);
}

/* ================================================================= 5. BỘ DÒ BFS có tay xoay */
console.log('\n== 5. do-duong-tay-xoay.mjs: BFS kiểm chéo với SanHoc.chay ==');
{
  // ngẫu nhiên có hạt giống cố định
  let seed = 20261015;
  const rnd = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  const manThu = { chuong: 'tay-xoay', so: 0, ma: 'thu', san: ['.....', '.o...', '..o..', '.#.o.', '.....'], batDau: { x: 2, y: 3, huong: 0 }, loaiRobot: 'banh', hamGoc: KHAY, mucTieu: 'toi-co', robot: { than: 'hai-banh', tay: 'xoay', camBien: [] } };
  const ts = ['tren', 'duoi', null], ks = ['kep', 'tha', null], rs = [-1, 0, 1], bs = ['tien', 'lui', 'phai', 'trai', 'dau', 'cho'];
  const { ctx, S: S0 } = trangThaiBanDau(manThu);
  const rong = ctx.rong;
  let soChuoi = 0, soBuoc = 0, lech = '';
  for (let lan = 0; lan < 400 && !lech; lan++) {
    const n = 1 + rnd(14), chuoi = [];
    for (let i = 0; i < n; i++) chuoi.push({ tuThe: ts[rnd(3)], xoay: rs[rnd(3)], kep: ks[rnd(3)], banh: bs[rnd(6)] });
    let S = S0, hongVat = false, buoc = 0;
    const duoc = [];
    for (const a of chuoi) {
      const r = buocMotNhip(ctx, S, a);
      if (!r) { hongVat = true; break; }
      S = r.N; duoc.push(a); buoc++;
    }
    if (hongVat && !duoc.length) continue;
    const phanCung = SanHoc.phanCungCua(manThu);
    const code = chuoiThanhMa(duoc, phanCung);
    const kq = chay(code, { mucTieu: 'toi-co' }, manThu.san, manThu.batDau);
    soChuoi++; soBuoc += duoc.length;
    const tay = kq.tay, pos = kq.vat.map((v) => (v.trangThai === 'dat' ? v.y * rong + v.x : -1));
    const camKq = tay.cam === null ? -1 : tay.cam - 1;
    const kHop = kq.robot.x === S.x && kq.robot.y === S.y && kq.robot.huong === S.h && (tay.tuThe === 'duoi' ? 1 : 0) === S.t && ['trai', 'truoc', 'phai'].indexOf(tay.xoay) === S.r && camKq === S.cam && J(pos) === J(S.pos) && kq.nhip === duoc.length;
    if (!kHop) lech = J({ chuoi: duoc, code, kq: { r: kq.robot, tay, pos, nhip: kq.nhip }, bfs: S });
  }
  kiem('400 chương trình ngẫu nhiên (' + soChuoi + ' chuỗi, ' + soBuoc + ' nhịp): trạng thái BFS (ô xe, hướng, tay hạ / nâng, nấc khớp, vật đang cầm, ô các vật, số nhịp) = kết quả SanHoc.chay', lech === '', lech);
  // đường BFS thật của từng màn tay-xoay làm đúng: chạy mã của đường ngắn nhất qua SanHoc.chay thì thắng, đúng số nhịp
  let ok = true, ghi = '';
  for (const m of chuong) {
    if (m.khongDoBFS || m.khoaHamMan) continue;
    if (Array.isArray(m.san[0])) continue;
    const b = nhipTayXoayNganNhat(m);
    if (b.nhip === null) { ok = false; ghi += m.id + ' không có đường; '; continue; }
    const code = chuoiThanhMa(b.chuoi, SanHoc.phanCungCua(m));
    const kq = SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: 'banh', hamGoc: m.hamGoc, phanCung: SanHoc.phanCungCua(m), mucTieu: m.mucTieu || 'toi-co', bongMo: m.bongMo, vatMau: m.vatMau }, code);       // không truyền daoChieu: mã sinh ra dùng tên theo hiệu quả thật
    if (!kq.thang || kq.nhip !== b.nhip) { ok = false; ghi += m.id + ' thắng=' + kq.thang + ' nhịp ' + kq.nhip + '≠' + b.nhip + '; '; }
  }
  kiem('đường ngắn nhất BFS của mọi màn tay-xoay (trừ màn nhiều vật) viết thành mã lệnh gốc: SanHoc.chay THẮNG, đúng số nhịp BFS', ok, ghi);
  const g3 = ManHoc.timMa('tay-xoay.1');
  kiem('21.1: BFS tìm đúng ba nhịp (xoay + hạ + kẹp; nâng + xoay về; hạ + thả)', nhipTayXoayNganNhat(g3).nhip === 3);
  const vo = { chuong: 'tay-xoay', so: 0, ma: 'thu2', san: ['.....', '.....', '..D..', '..o..', '.....'], batDau: { x: 2, y: 4, huong: 0 }, loaiRobot: 'banh', hamGoc: KHAY, mucTieu: 'dua-vat', robot: { than: 'hai-banh', tay: 'xoay', camBien: [] } };
  kiem('bộ dò: hai vật xếp hàng thẳng trước xe (vật chiếm ô), đích sau vật: nhặt, nâng, tiến, hạ, thả; BFS thắng được', nhipTayXoayNganNhat(vo).nhip !== null);
  const KET = KHAY.filter((t) => t !== 'arm_right');
  const hongMan = Object.assign({}, ManHoc.timMa('tay-xoay.8'));
  kiem('bộ dò theo phanCung: 21.8 (không arm_right) có đường 4 nhịp quay xe; thêm arm_right vào phần cứng thì rút còn ' + nhipTayXoayNganNhat(Object.assign({}, hongMan, { hamGoc: KHAY, phanCung: KHAY })).nhip + ' nhịp (xoay tay thay cho quay xe)',
    nhipTayXoayNganNhat(hongMan).nhip === 4 && nhipTayXoayNganNhat(Object.assign({}, hongMan, { hamGoc: KHAY, phanCung: KHAY })).nhip === 3);
  const khongDuong = { chuong: 'tay-xoay', so: 0, ma: 'thu3', san: ['.....', '.###.', '.#F#.', '.###.', '.....'], batDau: { x: 0, y: 0, huong: 0 }, loaiRobot: 'banh', hamGoc: KHAY, robot: { than: 'hai-banh', tay: 'xoay', camBien: [] } };
  kiem('bộ dò: cờ bị tường vây kín → không tới được (nhip null)', nhipTayXoayNganNhat(khongDuong).nhip === null);
}

/* ================================================================= 6. CHƯƠNG tay-xoay: 10 màn */
console.log('\n== 6. Chương tay-xoay (chương 21): mười màn ==');
{
  const BANH_TAY = KHAY;
  kiem('có 10 màn, hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; mã tay-xoay.1…10; chương có tên "Tay xoay"', chuong.length === 10 && J(chuong.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && chuong.every((m, i) => m.ma === 'tay-xoay.' + (i + 1)) && ThuTu.ten['tay-xoay'] === 'Tay xoay');
  kiem('robot { than "hai-banh", tay "xoay", camBien [] }; xe bánh; chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em; cauTruc for / if / while',
    chuong.every((m) => J(m.robot) === J({ than: 'hai-banh', tay: 'xoay', camBien: [] }) && m.loaiRobot === 'banh' && m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && J(m.cauTruc) === '["for","if","while"]'));
  kiem('khay: bánh đủ (có bánh lùi), wait, bốn lệnh tay và arm_left / arm_right; 21.8 hỏng: không còn arm_right (phanCung cùng tập, khai canhBao)',
    chuong.every((m) => m.so === 8 ? J(m.hamGoc) === J(KHAY.filter((t) => t !== 'arm_right')) && J(m.phanCung) === J(m.hamGoc) && /Khớp xoay kẹt/.test(m.canhBao) : J(m.hamGoc) === J(BANH_TAY) && m.phanCung === undefined));
  kiem('mục tiêu: dua-vat (mọi vật nằm trên ô đích D), riêng 21.6 tới cờ (vật chỉ là chướng ngại)', chuong.every((m) => m.so === 6 ? m.mucTieu === undefined && /F/.test(m.san.join('')) : m.mucTieu === 'dua-vat' && /D/.test(m.san.join('')) && /o/.test(m.san.join(''))));
  kiem('21.7 lắp ngược: daoChieu ["xoay"] + canhBao; các màn khác không khai daoChieu', J(man(7).daoChieu) === '["xoay"]' && /đấu ngược/.test(man(7).canhBao) && chuong.every((m) => m.so === 7 || m.daoChieu === undefined));
  kiem('hai hàm cốt truyện mới: 21.6 clear_left, 21.10 relay (khóa trong kho); mọi màn khác không tạo hàm', J(chuong.flatMap((m) => m.taoHam)) === '["clear_left","relay"]' && man(6).taoHam[0] === 'clear_left' && man(10).taoHam[0] === 'relay' && tenCotTruyen.includes('clear_left') && tenCotTruyen.includes('relay'));
  kiem('Sổ lệnh: clear_left, relay thuộc nhóm "tay-xoay", chương "tay-xoay", đúng màn; tenNhom["tay-xoay"] = "Tay xoay"; thứ tự nhóm: sau nam-cham, trước nem', SoLenh.tim('clear_left').nhom === 'tay-xoay' && SoLenh.tim('clear_left').man === 'tay-xoay.6' && SoLenh.tim('relay').man === 'tay-xoay.10' && SoLenh.tenNhom['tay-xoay'] === 'Tay xoay' &&
    SoLenh.thuTuNhom.indexOf('tay-xoay') === SoLenh.thuTuNhom.indexOf('nam-cham') + 1 && SoLenh.thuTuNhom.indexOf('tay-xoay') < SoLenh.thuTuNhom.indexOf('nem'));
  kiem('21.10 (trùm) có huy hiệu { ma "tay-xoay", ten "Huy hiệu Tay xoay" }; các màn khác không có', J(man(10).huyHieu) === J({ ma: 'tay-xoay', ten: 'Huy hiệu Tay xoay' }) && chuong.every((m) => m.so === 10 || !m.huyHieu));
  kiem('sân tối đa 7 cột × 9 hàng; mỗi màn có 1–3 câu đề bài, 1–2 câu gợi ý', chuong.every((m) => m.san.length <= 9 && m.san[0].length <= 7 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && m.goiY.length >= 1 && m.goiY.length <= 2));

  for (const m of chuong) {
    const kho = khoTruoc(m.id, true);                                    // kho cổ điển: đo đúng-bằng
    const khoThat = khoTruoc(m.id, false);
    const tenTruoc = kho.map((h) => h.ten);
    kiem(m.id + ' ' + m.ten + ': hamCuaEmCan ⊆ kho lúc tới màn, taoHam = hàm lần đầu xuất hiện ở lời giải', m.hamCuaEmCan.every((t) => tenTruoc.includes(t)) && J(m.loiGiai.hamCuaEmMoi.map((h) => h.ten).filter((t) => !tenTruoc.includes(t)).sort()) === J(m.taoHam.slice().sort()), J({ can: m.hamCuaEmCan, truoc: tenTruoc.length }));
    const r = ChamHoc.cham(m, m.loiGiai, tron(kho, m.loiGiai.hamCuaEmMoi));
    kiem(m.id + ': lời giải 3 sao, ' + m.sao.o + ' ô, ' + m.sao.nhip + ' nhịp, không chẩn đoán nào', r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, soNhip: r.soNhip, cd: maCua(r) }));
    const rThat = ChamHoc.cham(m, m.loiGiai, tron(khoThat, m.loiGiai.hamCuaEmMoi));
    kiem(m.id + ': với kho THẬT (đã có u_turn một nhịp…) lời giải vẫn thắng, không lỗi, không chậm hơn sao.nhip', rThat.thang && maLoi(rThat).length === 0 && rThat.soNhip <= m.sao.nhip, J({ thang: rThat.thang, nhip: rThat.soNhip, cd: maCua(rThat) }));
    const bfs = nhipTayXoayTatCa(m, kho);
    kiem(m.id + ': nhịp ngắn nhất (BFS) ' + (m.nhipTheoLoiGiai ? '≤ sao.nhip (nhipTheoLoiGiai)' : '= sao.nhip') + ' (BFS ' + bfs + ')', bfs !== null && (m.nhipTheoLoiGiai ? bfs <= m.sao.nhip : bfs === m.sao.nhip));
    const k = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kho, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': loiGiaiKhac (' + m.loiGiaiKhac.moTa + ') đúng 2 sao: nhiều ô hơn, cùng nhịp', k.thang && k.sao === 2 && k.soO > m.sao.o && k.soNhip === m.sao.nhip && maCua(k).indexOf('tran-khung') < 0, J({ thang: k.thang, sao: k.sao, soO: k.soO, soNhip: k.soNhip }));
    const mm = ChamHoc.cham(m, m.maMau, kho);
    kiem(m.id + ': maMau vừa khung' + (m.maMau.chinh.length ? '' : ' (trống)'), maCua(mm).indexOf('tran-khung') < 0);
    m.loiSai.forEach((ls, i) => {
      const q = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi));
      const co = maCua(q), thieu = ls.phaiCoMa.filter((x) => co.indexOf(x) < 0);
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): không đủ 3 sao, đủ mã ' + (ls.phaiCoMa.join('+') || '—'), q.sao < 3 && thieu.length === 0, 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + q.sao);
    });
  }

  // màn cụ thể
  const r1 = ChamHoc.cham(man(1), man(1).maMau, khoTruoc(man(1).id, true));
  kiem('21.1 (hướng dẫn sáng nút): maMau đã xoay trái, hạ tay và kẹp vật (4 dòng); chạy xong tay đang cầm vật nhưng vật chưa tới đích', man(1).maMau.chinh.length === 4 && r1.thang === false && r1.tay.cam !== null && r1.tay.xoay === 'trai' && maCua(r1).includes('chua-dua-vat'));
  const r2 = ChamHoc.cham(man(2), man(2).maMau, khoTruoc(man(2).id, true));
  kiem('21.2 đố "sai bên": maMau là lời giải 21.1 mà vật nằm bên PHẢI: tay kẹp hụt ô trống (kep-hut huongTay trai); chỉ cần đổi arm_left ↔ arm_right ở hai dòng', !r2.thang && maCua(r2).includes('kep-hut') && J(man(2).maMau.chinh) === J(man(1).loiGiai.chinh) &&
    J(man(2).loiGiai.chinh) === J(man(1).loiGiai.chinh.map((d) => d === 'arm_left()' ? 'arm_right()' : d === 'arm_right()' ? 'arm_left()' : d)));
  const r3 = ChamHoc.cham(man(3), man(3).maMau, khoTruoc(man(3).id, true));
  kiem('21.3 đố "khớp kẹt": maMau thiếu arm_up() nên khớp kẹt (tay-xoay-ket) và vật thả lại chỗ cũ; lời giải chỉ hơn maMau đúng MỘT dòng (arm_up())', maCua(r3).includes('tay-xoay-ket') && man(3).loiGiai.chinh.length === man(3).maMau.chinh.length + 1 && man(3).loiGiai.chinh.filter((d) => d === 'arm_up()').length === 1);
  const r5 = ChamHoc.cham(man(5), man(5).maMau, khoTruoc(man(5).id, true));
  kiem('21.5 "nhanh hơn quay xe": maMau gọi put_right() của che-tay: vẫn thắng nhưng chỉ 1 sao (nhiều nhịp hơn và nhiều ô hơn lời giải xoay tay)', r5.thang && r5.sao === 1 && r5.soNhip > man(5).sao.nhip && r5.soO > man(5).sao.o, J({ sao: r5.sao, nhip: r5.soNhip, o: r5.soO }));
  const r9 = ChamHoc.cham(man(9), { chinh: ['turn_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_left()', 'wait()', 'arm_down()', 'release()', 'wait()'], hamCuaMan: [] }, khoTruoc(man(9).id, true));
  kiem('21.9 "quay xe, tay đi theo": quay xe TRƯỚC rồi nhặt cũng thắng nhưng 4 nhịp (1 sao); lời giải quay trái lúc đang cầm vật (3 nhịp) vì tay quay theo xe', r9.thang && r9.soNhip === 4 && r9.sao === 1 && man(9).sao.nhip === 3);
  const r8 = ChamHoc.cham(man(8), { chinh: ['arm_right()', 'wait()'], hamCuaMan: [] }, khoTruoc(man(8).id, true));
  kiem('21.8 khớp hỏng: gọi arm_right() báo lenh-goc-hong nói "Khớp xoay kẹt: không xoay sang phải"', maCua(r8).includes('lenh-goc-hong') && /Khớp xoay kẹt/.test(r8.chanDoan.find((c) => c.ma === 'lenh-goc-hong').loi));
  const r7 = ChamHoc.cham(man(7), man(7).maMau, khoTruoc(man(7).id, true));
  kiem('21.7 khớp lắp ngược: maMau (viết cho khớp bình thường) xoay sang PHẢI: kẹp hụt ô trống bên trái', !r7.thang && maCua(r7).includes('kep-hut') && r7.tay.xoay === 'truoc');
  // sân thử của Xưởng hàm dùng daoChieu của màn
  const th = ChamHoc.thuHam(man(7), { chinh: [] }, 'put', tron(khoTruoc(man(7).id, true), [H('put', ['arm_left()', 'wait()'])]), {});
  kiem('sân thử của Xưởng hàm cũng dùng daoChieu của màn: ở 21.7, hàm thử arm_left() xoay khớp sang PHẢI', th.tay && th.tay.xoay === 'phai', J(th.tay));
}

/* ================================================================= 7. GIAO DIỆN: part, VeRobot, đèn, khay, hướng dẫn, choi.html */
console.log('\n== 7. Giao diện: part tay xoay, VeRobot, đèn khớp xoay, khay, hướng dẫn ==');
{
  /* V7c2 (28/10): bộ pixel game/part đã xoá; bộ phận, luật ghép, hàm gốc và hình đọc từ bộ vẽ VECTOR (VeVector; lap-rap.js tự nạp ve-vector*.js ở Node) */
  const VV = require(path.join(day, 'lap-rap.js')).veVector();
  const px = VV.lay('tay', 'xoay');
  kiem('bộ phận tay xoay đã đăng ký ở bộ vẽ vector: loại tay, mã "xoay", gắn ở ổ "tay", có điểm neo, mở sáu hàm gốc (bốn lệnh tay + arm_left / arm_right)', !!px && px.gan === 'tay' && !!px.diemNeo && J(VV.hamGoc({ than: 'hai-banh', tay: 'xoay' }).filter((h) => /^(arm|grab|release)/.test(h)).sort()) === J(['arm_down', 'arm_left', 'arm_right', 'arm_up', 'grab', 'release']));
  const anh = (st, than) => VV.robot({ than: than || 'hai-banh', tay: 'xoay', camBien: [] }, { tay: Object.assign({ tuThe: 'tren', kep: 'mo' }, st) }, 0, 48);
  kiem('tay xoay vẽ khác nhau ở ba nấc trái / trước / phải, góc -90 trùng nấc trái, góc giữa chừng (goc) vẽ khác nấc trước (so lệnh vẽ canvas giả)', J(anh({ xoay: 'trai' }).lenh) !== J(anh({ xoay: 'truoc' }).lenh) && J(anh({ xoay: 'phai' }).lenh) !== J(anh({ xoay: 'truoc' }).lenh) && J(anh({ goc: -90 }).lenh) === J(anh({ xoay: 'trai' }).lenh) && J(anh({ goc: 30 }).lenh) !== J(anh({ xoay: 'truoc' }).lenh));
  // VeRobot cần window: nạp trong vm với VeVector có sẵn
  const ctx = vm.createContext({ console, window: null, document: { createElement: () => ({ getContext: () => null }) }, location: { search: '' } });
  ctx.window = ctx; ctx.VeVector = VV;
  vm.runInContext(doc('game/ve-robot.js'), ctx, { filename: 've-robot.js' });
  const VR = ctx.VeRobot;
  kiem('VeRobot.cauHinhCua: màn có arm_left / arm_right (không khai man.robot.tay) → tay "xoay", ưu tiên hơn "kep"; man.robot.tay "xoay" được giữ', VR.cauHinhCua({ hamGoc: ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'] }).tay === 'xoay' && VR.cauHinhCua(man(1)).tay === 'xoay' && VR.cauHinhCua({ hamGoc: ['arm_down', 'grab'] }).tay === 'kep');
  const vq = VR.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'tren', 0), vl = VR.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'tren', -90), vp = VR.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'tren', 90), vh = VR.vatXoay({ than: 'hai-banh', tay: 'xoay' }, 'duoi', 0);
  kiem('VeRobot.vatXoay (vector, 1/100 ô): vật trong kẹp ở phía trước (l = 0), sang trái (l < 0), sang phải (l > 0, đối xứng); tay hạ xa thêm và vật nhỏ lại; khớp ở mũi xe nên f (về phía mũi) cùng cỡ ở hai bên hông',
    Math.abs(vq.l) < 1e-9 && vl.l < -5 && Math.abs(vl.l + vp.l) < 1e-9 && vq.f > vl.f && vl.f === vp.f && vh.f > vq.f && vl.n === vq.n && vh.n < vq.n, J([vq, vl, vp, vh]));
  const chuaChay = vm.createContext({ window: {}, console });
  const dbp = {};
  const ctx2 = vm.createContext({ console, window: dbp });
  vm.runInContext(doc('game/den-bo-phan.js'), ctx2, { filename: 'den-bo-phan.js' });
  const DB = dbp.DenBoPhan;
  kiem('đèn theo bộ phận: màn tay xoay có thêm đèn "xoay" giữa đèn tay và đèn kẹp; màn tay kẹp thường không có', J(DB.boPhanCuaMan(man(1))) === J(['banhT', 'banhP', 'tay', 'xoay', 'kep']) && !DB.boPhanCuaMan(ManHoc.timMa('tay-gap.1')).includes('xoay'), J(DB.boPhanCuaMan(man(1))));
  kiem('đèn "xoay" sáng ở nhịp có arm_left / arm_right (tay và kẹp không sáng nếu nhịp không có lệnh đó)', (() => { const p = DB.phan({ robot: { banh: { trai: 0, phai: 0 } }, suKien: [] }, [{ ten: 'arm_left' }]); return p.xoay === true && p.tay === false && p.kep === false; })() && DB.phan({ robot: {}, suKien: [] }, [{ ten: 'wait' }]).xoay === false);
  const nguon = { tp: doc('game/thanh-phan.js'), sv: doc('game/san-ve.js'), chu: doc('game/chu.js'), ve: doc('game/ve.js'), hd: doc('game/huong-dan-man.js'), html: doc('game/choi.html') };
  kiem('đèn xoay có icon (ve.js CO_ICON denXoay + hình vector VeIcon denXoay) và nhãn chữ; khay có thẻ tay (choi.the.tayXoay, gói V8c: tên "Tay kẹp", cùng một tay kẹp) và hai lệnh arm_left / arm_right trong TAY_TEN, LENH_NHIP, LENH_GOC', /denXoay:/.test(nguon.ve) && /denXoay/.test(doc('game/ve-vector-icon.js')) && /'choi\.den\.xoay'/.test(nguon.chu) && /'choi\.the\.tayXoay': 'Tay kẹp'/.test(nguon.chu) &&
    /var TAY_TEN = \[[^\]]*'arm_left', 'arm_right'\]/.test(nguon.tp) && /LENH_NHIP = \[[^\]]*'arm_left', 'arm_right'/.test(nguon.tp) && /LENH_GOC = \[[^\]]*'arm_left', 'arm_right'/.test(nguon.tp));
  kiem('san-ve.js: tay xoay (laTayKep) vẽ vật trong kẹp, xe mờ có nấc khớp (bongMo.xoay), hoạt cảnh xoay khớp giữa hai nấc trong apTay', /function laTayKep/.test(nguon.sv) && /VeRobot\.vatXoay/.test(nguon.sv) && /GOC_XOAY/.test(nguon.sv) && /xoay: b\.xoay === 'trai'/.test(nguon.sv) && /doiXoay/.test(nguon.sv));
  kiem('game/choi.html nạp ve-vector-tay-xoay.js sau ve-vector-tay-kep.js và trước ve-robot.js; tệp có trên đĩa; nạp man-tay-xoay.js và man-che-tay-xoay.js sau các chương trước',
    nguon.html.indexOf('ve-vector-tay-xoay.js') > nguon.html.indexOf('ve-vector-tay-kep.js') && nguon.html.indexOf('ve-vector-tay-xoay.js') < nguon.html.indexOf('ve-robot.js') && fs.existsSync(path.join(day, 'game', 've-vector-tay-xoay.js')) && nguon.html.indexOf('man-tay-xoay.js') > 0 && nguon.html.indexOf('man-che-tay-xoay.js') > nguon.html.indexOf('man-tay-xoay.js'));
  kiem('hướng dẫn sáng nút cho 21.1 (HD2: màn trình diễn chiChay, chỉ bấm Chạy), 21.2 (chạy thử rồi sửa lệnh xoay) và 21.6 (tạo hàm clear_left rồi ghép thân hàm)', /H\['tay-xoay\.1'\]/.test(nguon.hd) && /H\['tay-xoay\.2'\]/.test(nguon.hd) && /H\['tay-xoay\.6'\]/.test(nguon.hd) && /buocTaoHam\('clear_left'/.test(nguon.hd));
}

console.log('\n---------------------------------------------\nĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

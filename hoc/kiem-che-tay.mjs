/* ============================================================================
   kiem-che-tay.mjs — máy kiểm chương `che-tay` (Chế lệnh tay) của "Đường học" và các luật lõi mới của nó (KE-HOACH-CHE-LENH.md, mục 5.1).
   Gồm:
   - daoChieu 'tay' / 'kep' (tay lắp ngược): arm_up ↔ arm_down, grab ↔ release đổi chỗ; cấu hình sai bị từ chối;
   - bongMo.vat có màu (chấm theo màu) và bongMo.cam (xe mờ cầm vật): thắng / không thắng, cấu hình sai;
   - chẩn đoán lech-bong-mo nói bằng lời vật nào chưa đúng ô / đúng màu, xe cầm thiếu hay thừa vật;
   - Sổ lệnh có đủ năm hàm mới (so-lenh.js); put_back, fixed_pick, fixed_drop là HÀM CỦA MÀN (15/10: chỉ đúng cho một màn) nên không có ở đó, không vào kho;
   - 10 màn che-tay: lời giải 3 sao, mọi công thức khác thắng, lời giải khác đúng 2 sao, lời sai đúng mã, chinhCoDinh chặn chương trình chính gửi lên,
     nhịp: đường ngắn nhất BFS (do-duong-che-tay.mjs, gộp nâng tay với lệnh bánh) và BFS "cách viết chuẩn" (pick / drop là khối 2 nhịp) không dài hơn sao.nhip;
   - bộ dò đường BFS kiểm chéo với SanHoc.chay bằng chương trình ngẫu nhiên và bằng chính đường BFS tìm được;
   - 5.9: hai bản sửa (turn_right bằng bánh trái, u_turn bằng trái lùi + phải tiến) vẫn đúng ở MỌI màn khác của game, không chậm hơn;
   - thẻ script của game/choi.html.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs.
   Chạy: node hoc/kiem-che-tay.mjs        (trượt thì thoát mã 1)
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
const DoDuong = await import('./do-duong-che-tay.mjs');
const { nhipCheTayNganNhat, nhipCheTayTatCa, buocMotNhip, trangThaiBanDau, daDatDich, chuoiThanhMa } = DoDuong;

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
const che = tatCa.filter((m) => m.chuong === 'che-tay');
const man = (so) => ManHoc.timMa('che-tay.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const L = (...d) => d.join('\n') + '\n';

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

const BANH_TAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];
const TRONG = ['.....', '.....', '.....', '.....', '.....'];
const SAN_VAT = ['.....', '.....', '..o..', '.....', '.....'];             // một vật ngay trước mặt xe ở (2,3) quay lên
const bd0 = { x: 2, y: 3, huong: 0 };
function chay(rows, bd, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: BANH_TAY }, extra || {}), code);
}
const PICK = L('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()');
const DROP = L('arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()');

/* ================================================================= 1. TAY LẮP NGƯỢC */
console.log('\n== 1. daoChieu "tay" / "kep": tay lắp ngược ==');
{
  const dc = (code, dao, extra) => chay(SAN_VAT, bd0, code, Object.assign({ daoChieu: dao }, extra || {}));
  const thuong = chay(SAN_VAT, bd0, L('arm_down()', 'grab()', 'wait()'));
  kiem('không đảo: arm_down() + grab() nhặt vật trước mặt (đối chứng)', thuong.tay.cam !== null && thuong.tay.tuThe === 'duoi' && thuong.vat[0].trangThai === 'cam');
  const t1 = dc(L('arm_up()', 'grab()', 'wait()'), ['tay']);
  kiem('daoChieu ["tay"]: arm_up() làm tay HẠ nên arm_up() + grab() nhặt được vật', t1.tay.tuThe === 'duoi' && t1.tay.cam !== null && t1.vat[0].trangThai === 'cam' && nhipVet(t1).some((n) => n.suKien.some((e) => e.ma === 'nhat-vat')), J(t1.tay));
  kiem('vết lệnh vẫn ghi tên lệnh người chơi gọi (arm_up, grab, wait); vết nhịp cho tay hạ', t1.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten).join() === 'arm_up,grab,wait' && nhipVet(t1)[0].robot.tay.tuThe === 'duoi');
  const t2 = dc(L('arm_down()', 'grab()', 'wait()'), ['tay']);
  kiem('daoChieu ["tay"]: arm_down() làm tay NÂNG (đã nâng sẵn) nên kẹp hụt: kep-hut lyDo tay-nang, vật vẫn nằm đất', t2.tay.tuThe === 'tren' && t2.tay.cam === null && maSK(t2, 'kep-hut').length === 1 && maSK(t2, 'kep-hut')[0].lyDo === 'tay-nang' && t2.vat[0].trangThai === 'dat');
  const t3 = dc(L('arm_up()', 'wait()', 'arm_down()', 'wait()'), ['tay']);
  kiem('daoChieu ["tay"]: arm_up() rồi arm_down() — hạ rồi nâng, tay về tư thế nâng', t3.tay.tuThe === 'tren' && nhipVet(t3)[0].robot.tay.tuThe === 'duoi' && nhipVet(t3)[1].robot.tay.tuThe === 'tren');
  const t4 = dc(L('arm_up()', 'wait()', 'left_move()', 'right_move()', 'wait()'), ['tay']);
  kiem('daoChieu ["tay"]: arm_up() hạ tay thật nên xe không đi được: tay-vuong', maSK(t4, 'tay-vuong').length === 1 && vt(t4.robot) === '2,3');
  const t5 = dc(L('arm_up()', 'grab()', 'wait()', 'arm_down()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'arm_up()', 'release()', 'wait()', 'arm_down()', 'wait()'), ['tay']);
  kiem('daoChieu ["tay"]: nhặt, nâng tay, đi một ô, hạ tay, thả — vật nằm xuống ô trước mặt (2,1) (đối chiếu fixed_pick / fixed_drop)', t5.vat[0].trangThai === 'dat' && t5.vat[0].x === 2 && t5.vat[0].y === 1 && vt(t5.robot) === '2,2' && maSK(t5, 'vat-vo').length === 0);
  const k1 = dc(L('arm_down()', 'release()', 'wait()'), ['kep']);
  kiem('daoChieu ["kep"]: release() làm kẹp ĐÓNG nên release() ở tay hạ nhặt được vật', k1.tay.cam !== null && k1.vat[0].trangThai === 'cam');
  const k2 = dc(L('arm_down()', 'release()', 'wait()', 'grab()', 'wait()'), ['kep']);
  kiem('daoChieu ["kep"]: grab() làm kẹp MỞ nên grab() sau đó thả vật xuống ô trước mặt', k2.tay.cam === null && k2.vat[0].trangThai === 'dat' && k2.vat[0].x === 2 && k2.vat[0].y === 2);
  const tk = dc(L('arm_up()', 'release()', 'wait()'), ['tay', 'kep']);
  kiem('daoChieu ["tay","kep"] ghép được: arm_up() hạ tay + release() kẹp nhặt vật', tk.tay.cam !== null && tk.tay.tuThe === 'duoi');
  const tb = dc(L('left_move()', 'right_move()', 'wait()'), ['tay', 'trai']);
  kiem('daoChieu ["tay","trai"] ghép được với đấu dây bánh: left_move() + right_move() thành quay đầu', tb.robot.huong === 2 && vt(tb.robot) === '2,3');
  kiem('daoChieu rỗng hay không có "tay": arm_up / arm_down như thường', J(dc(L('arm_down()', 'grab()', 'wait()'), []).tay) === J(thuong.tay));
  const nem = (f) => { try { f(); return false; } catch (e) { return /daoChieu/.test(e.message); } };
  kiem('daoChieu "tay" / "kep" cần robot có tay kẹp: robot không có lệnh tay bị từ chối; tên lạ vẫn bị từ chối và lời nói rõ "tay", "kep"',
    nem(() => SanHoc.chay({ san: SAN_VAT, batDau: bd0, loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait'], daoChieu: ['tay'] }, '')) &&
      nem(() => SanHoc.chay({ san: SAN_VAT, batDau: bd0, loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait'], daoChieu: ['kep'] }, '')) &&
      (() => { try { dc('', ['giua']); return false; } catch (e) { return /"tay"/.test(e.message) && /"kep"/.test(e.message); } })());
  const cdTay = ChamHoc.thuHam(Object.assign({}, man(8)), { chinh: [] }, 'pick', khoTruoc(man(8).id));
  kiem('sân thử của Xưởng hàm cũng dùng daoChieu của màn: pick() cũ ở 5.8 thành "nâng tay, kẹp hụt, hạ tay" — tay kết thúc ở tư thế HẠ', cdTay.tay && cdTay.tay.tuThe === 'duoi' && cdTay.vat.every((v) => v.trangThai !== 'cam'), J(cdTay.tay));
}

/* ================================================================= 2. BÓNG MỜ: VẬT MỜ CÓ MÀU, XE MỜ CẦM VẬT */
console.log('\n== 2. bongMo.vat có màu (chấm theo màu) và bongMo.cam (xe mờ cầm vật) ==');
{
  const SAN2 = ['.....', '.o.o.', '.....', '.....', '.....'];
  const MAU2 = ['.....', '.r.b.', '.....', '.....', '.....'];
  const bd = { x: 2, y: 3, huong: 0 };
  const BM = (bongMo, extra) => chay(SAN2, bd, '', Object.assign({ mucTieu: 'bong-mo', bongMo, vatMau: MAU2 }, extra || {}));
  const dungMau = BM({ x: 2, y: 3, huong: 0, vat: [{ x: 1, y: 1, mau: 'red' }, { x: 3, y: 1, mau: 'blue' }] });
  kiem('vật nằm đúng ô và đúng màu: thắng (chương trình rỗng)', dungMau.thang === true && dungMau.bongMo.vat[0].mau === 'red' && dungMau.bongMo.vat[1].mau === 'blue');
  const saiMau = BM({ x: 2, y: 3, huong: 0, vat: [{ x: 1, y: 1, mau: 'blue' }, { x: 3, y: 1, mau: 'red' }] });
  kiem('đúng ô nhưng HAI VẬT ĐỔI MÀU cho nhau: chưa thắng (chấm theo màu)', saiMau.thang === false);
  const khongMau = BM({ x: 2, y: 3, huong: 0, vat: [{ x: 1, y: 1 }, { x: 3, y: 1 }] });
  kiem('vật mờ không khai màu: chỉ chấm ô, đúng ô là thắng (như trước)', khongMau.thang === true && khongMau.bongMo.vat[0].mau === undefined);
  const mauMotNua = BM({ x: 2, y: 3, huong: 0, vat: [{ x: 1, y: 1, mau: 'red' }, { x: 3, y: 1 }] });
  kiem('khai màu cho một vật, vật kia không khai: vật có khai thì chấm màu, vật không khai thì chỉ chấm ô', mauMotNua.thang === true);
  const thieuVat = BM({ x: 2, y: 3, huong: 0, vat: [{ x: 1, y: 1, mau: 'red' }] });
  kiem('thừa vật nằm đất ngoài danh sách bongMo.vat: chưa thắng; thiếu vật (khai vật không có thật): chưa thắng',
    thieuVat.thang === false && BM({ x: 2, y: 3, huong: 0, vat: [{ x: 1, y: 1, mau: 'red' }, { x: 3, y: 1, mau: 'blue' }, { x: 0, y: 0 }] }).thang === false);
  const nem = (f) => { try { f(); return false; } catch (e) { return /bongMo|màu/.test(e.message); } };
  kiem('màu vật mờ lạ bị từ chối bằng lỗi tiếng Việt', nem(() => BM({ x: 2, y: 3, huong: 0, vat: [{ x: 1, y: 1, mau: 'tim' }] })));

  // xe mờ cầm vật
  const SAN_C = ['.....', '.....', '..o..', '.....', '.....'];
  const camBM = (bongMo, code, extra) => chay(SAN_C, bd, code, Object.assign({ mucTieu: 'bong-mo', bongMo }, extra || {}));
  const cam1 = camBM({ x: 2, y: 3, huong: 0, cam: true }, PICK);
  kiem('bongMo.cam: nhặt vật rồi dừng — xe đúng ô, đang cầm vật: thắng; kết quả bongMo có cam true, camMau null', cam1.thang === true && cam1.tay.cam !== null && cam1.bongMo.cam === true && cam1.bongMo.camMau === null);
  kiem('bongMo.cam true mà tay không: chưa thắng', camBM({ x: 2, y: 3, huong: 0, cam: true }, '').thang === false);
  kiem('bongMo có vật nằm đất đúng ô mà xe lại đang cầm vật đó: chưa thắng (cam không khai thì tay phải trống)', camBM({ x: 2, y: 3, huong: 0, vat: [{ x: 2, y: 2 }] }, PICK).thang === false);
  const camMau = (mau, code) => chay(SAN_C, bd, code, { mucTieu: 'bong-mo', bongMo: { x: 2, y: 3, huong: 0, cam: { mau } }, vatMau: ['.....', '.....', '..g..', '.....', '.....'] });
  kiem('bongMo.cam { mau }: cầm vật đúng màu (green) thắng, cầm vật màu khác chưa thắng', camMau('green', PICK).thang === true && camMau('red', PICK).thang === false);
  const nhat2 = chay(['.....', '..o..', '.....', '..o..', '.....'], { x: 2, y: 2, huong: 0 }, L('left_move()', 'right_back()', 'wait()') + PICK + L('left_move()', 'right_back()', 'wait()'), { mucTieu: 'bong-mo', bongMo: { x: 2, y: 2, huong: 0, cam: true, vat: [{ x: 2, y: 1 }] } });
  kiem('xe mờ cầm vật + vật mờ nằm đất: nhặt vật SAU LƯNG (quay đầu, nhặt, quay lại) thì thắng; vật trước mặt phải nằm yên', nhat2.thang === true && nhat2.vat.filter((v) => v.trangThai === 'dat').length === 1);
  const nhatNham = chay(['.....', '..o..', '.....', '..o..', '.....'], { x: 2, y: 2, huong: 0 }, PICK, { mucTieu: 'bong-mo', bongMo: { x: 2, y: 2, huong: 0, cam: true, vat: [{ x: 2, y: 1 }] } });
  kiem('nhặt nhầm vật trước mặt: vật sau lưng vẫn nằm đất ở ô khác bongMo.vat → chưa thắng', nhatNham.thang === false);
  const vo = camBM({ x: 2, y: 3, huong: 0, vat: [{ x: 2, y: 2 }] }, PICK + L('release()', 'wait()'));
  kiem('vật bị vỡ (thả khi tay nâng) thì không thắng dù vật mờ khai ô đó', vo.thang === false && maSK(vo, 'vat-vo').length === 1);
  kiem('bongMo.cam cần robot có tay kẹp; màu cam lạ bị từ chối',
    nem(() => chay(SAN_C, bd, '', { hamGoc: ['left_move', 'right_move', 'wait'], mucTieu: 'bong-mo', bongMo: { x: 2, y: 3, huong: 0, cam: true } })) && nem(() => camBM({ x: 2, y: 3, huong: 0, cam: { mau: 'tim' } }, '')));

  // chẩn đoán bằng lời
  const manBM = (bongMo, extra) => Object.assign({ chuong: 'thu', loaiRobot: 'banh', hamGoc: BANH_TAY, moXuong: true, camHamCuaEm: false, khung: { chinh: 10, moiHam: 10 }, cauTruc: [], mucTieu: 'bong-mo', san: SAN_C, batDau: bd, bongMo }, extra || {});
  const qua = (m, chinh) => ChamHoc.cham(m, { chinh }, []);
  const lv = (kq) => kq.chanDoan.find((c) => c.ma === 'lech-bong-mo');
  const chuaCam = qua(manBM({ x: 2, y: 3, huong: 0, cam: true }), []);
  kiem('xe mờ cầm vật mà xe tay không: "Xe đúng chỗ rồi. Xe chưa cầm vật nào, còn xe mờ thì đang cầm một vật."; camLech true, soVatLech 0',
    !!lv(chuaCam) && lv(chuaCam).loi === 'Xe đúng chỗ rồi. Xe chưa cầm vật nào, còn xe mờ thì đang cầm một vật.' && lv(chuaCam).camLech === true && lv(chuaCam).soVatLech === 0, J(chuaCam.chanDoan));
  const camThua = qua(manBM({ x: 2, y: 3, huong: 0, vat: [{ x: 2, y: 2 }] }), PICK.trim().split('\n'));
  kiem('xe còn cầm vật mà bóng mờ không cầm gì: "Xe còn đang cầm một vật, còn bóng mờ thì không cầm gì." và vật chưa nằm đúng ô',
    !!lv(camThua) && /Xe còn đang cầm một vật, còn bóng mờ thì không cầm gì\./.test(lv(camThua).loi) && /Một vật chưa nằm đúng ô như bóng mờ\./.test(lv(camThua).loi) && lv(camThua).camLech === true && lv(camThua).soVatLech === 1, J(camThua.chanDoan));
  const man2 = (bongMo) => manBM(bongMo, { san: SAN2, vatMau: MAU2, batDau: bd });
  const lechMau = qua(man2({ x: 2, y: 3, huong: 0, vat: [{ x: 1, y: 1, mau: 'blue' }, { x: 3, y: 1, mau: 'red' }] }), []);
  kiem('hai vật khác màu chưa đổi chỗ: "Xe đúng chỗ rồi. Còn hai vật chưa nằm đúng ô như bóng mờ." soVatLech 2', !!lv(lechMau) && lv(lechMau).loi === 'Xe đúng chỗ rồi. Còn hai vật chưa nằm đúng ô như bóng mờ.' && lv(lechMau).soVatLech === 2, J(lechMau.chanDoan));
  const motLech = qua(man2({ x: 2, y: 3, huong: 0, vat: [{ x: 1, y: 1, mau: 'red' }, { x: 3, y: 1, mau: 'green' }] }), []);
  kiem('một vật sai màu: nói tên màu vật cần nằm ở ô đó: "Vật màu xanh lá chưa nằm đúng ô như bóng mờ."', !!lv(motLech) && /Vật màu xanh lá chưa nằm đúng ô như bóng mờ\./.test(lv(motLech).loi), J(motLech.chanDoan));
  const xeLechVaVat = qua(man2({ x: 2, y: 2, huong: 0, vat: [{ x: 1, y: 1, mau: 'blue' }, { x: 3, y: 1, mau: 'red' }] }), []);
  kiem('xe lệch ô VÀ vật lệch: một lời nói cả hai (xe trước, vật sau)', !!lv(xeLechVaVat) && /^Xe dừng lệch một ô về phía dưới so với bóng mờ\. Còn hai vật chưa nằm đúng ô như bóng mờ\.$/.test(lv(xeLechVaVat).loi), J(xeLechVaVat.chanDoan));
  const camSaiMau = chay(SAN_C, bd, PICK, { mucTieu: 'bong-mo', bongMo: { x: 2, y: 3, huong: 0, cam: { mau: 'red' } }, vatMau: ['.....', '.....', '..g..', '.....', '.....'] });
  const camSaiMauCham = ChamHoc.cham(manBM({ x: 2, y: 3, huong: 0, cam: { mau: 'red' } }, { vatMau: ['.....', '.....', '..g..', '.....', '.....'] }), { chinh: PICK.trim().split('\n') }, []);
  kiem('xe cầm vật sai màu: "Xe đang cầm vật màu xanh lá, còn xe mờ cầm vật màu đỏ."', !camSaiMau.thang && !!lv(camSaiMauCham) && /Xe đang cầm vật màu xanh lá, còn xe mờ cầm vật màu đỏ\./.test(lv(camSaiMauCham).loi), J(camSaiMauCham.chanDoan));
  const dung = qua(manBM({ x: 2, y: 3, huong: 0, cam: true }), PICK.trim().split('\n'));
  kiem('xe đúng tư thế, cầm vật: thắng, không chẩn đoán nào (và lời cũ chỉ-ô-xe vẫn như trước nếu không có vật mờ: xem kiem-che-xe.mjs)', dung.thang && dung.chanDoan.length === 0);
}

/* ================================================================= 3. SỔ LỆNH */
console.log('\n== 3. Sổ lệnh: năm hàm mới của che-tay (put_back, fixed_pick, fixed_drop là hàm của màn) ==');
{
  const moi = ['pass_back', 'put_right', 'grab_back', 'drag', 'swap'];
  kiem('SoLenh.theoChuong("che-tay") đúng năm hàm theo thứ tự chế: pass_back, put_right, grab_back, drag, swap; nhóm tay',
    J(SoLenh.theoChuong('che-tay').map((h) => h.ten)) === J(moi) && SoLenh.theoChuong('che-tay').every((h) => h.nhom === 'tay'));
  const dau = {};
  for (const m of tatCa) for (const t of m.taoHam) if (!dau[t]) dau[t] = m;
  kiem('put_back, fixed_pick, fixed_drop là hàm CỦA MÀN: không là hàm cốt truyện (không trong taoHam của màn nào), không trong Sổ lệnh, không trong hamCuaEmMoi của lời giải nào',
    ['put_back', 'fixed_pick', 'fixed_drop'].every((t) => !tenCotTruyen.includes(t) && SoLenh.tim(t) === null && tatCa.every((m) => !m.loiGiai.hamCuaEmMoi.some((h) => h.ten === t))));
  kiem('mỗi hàm có chuong và man đúng màn đầu tiên chế nó (taoHam của màn che-tay)', moi.every((t) => dau[t] && SoLenh.tim(t) && SoLenh.tim(t).man === dau[t].ma && SoLenh.tim(t).chuong === 'che-tay'));
  kiem('moTa là MỘT câu ngắn lớp 5: 8–80 chữ, không xuống dòng, không dấu chấm cuối; pass_back: "Chuyền vật trước mặt ra ô sau lưng, xe giữ chỗ và hướng"',
    moi.every((t) => { const d = SoLenh.tim(t).moTa; return d.length >= 8 && d.length <= 80 && !/\n/.test(d) && !/[.]$/.test(d); }) && SoLenh.tim('pass_back').moTa === 'Chuyền vật trước mặt ra ô sau lưng, xe giữ chỗ và hướng');
  kiem('tên hàm cốt truyện không trùng với lệnh gốc hay hàm của chương khác', moi.every((t) => SoLenh.ds.filter((h) => h.ten === t).length === 1 && !KhoHam.HAM_GOC_MAC_DINH.includes(t)));
  kiem('thứ tự trong Sổ lệnh: hàm của che-tay đứng sau carry (tay-gap) và trước hàm của vong-lap', SoLenh.ds.findIndex((h) => h.ten === 'pass_back') > SoLenh.ds.findIndex((h) => h.ten === 'carry') && SoLenh.ds.findIndex((h) => h.ten === 'swap') < SoLenh.ds.findIndex((h) => h.ten === 'side'));
}

/* ================================================================= 4. MƯỜI MÀN CHE-TAY */
console.log('\n== 4. Chương che-tay: dữ liệu và luật từng màn ==');
{
  const BANH_TAY_HONG = ['left_move', 'right_move', 'left_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];
  kiem('đúng 10 màn, số 1..10, mã che-tay.1…, id 5.1…5.10 (chương thứ 5: sau tay-gap, trước vong-lap), tên "Chế lệnh tay"',
    che.length === 10 && che.every((m, i) => m.so === i + 1 && m.id === '5.' + (i + 1) && m.ma === 'che-tay.' + (i + 1)) && ThuTu.thuTu[4] === 'che-tay' && ThuTu.thuTu[3] === 'tay-gap' && ThuTu.thuTu[5] === 'vong-lap' && ThuTu.ten['che-tay'] === 'Chế lệnh tay' && !ThuTu.laDot2('che-tay'));
  kiem('tên các màn: Chuyền ra sau, Đặt sang phải, Dọn đường, Nhặt sau lưng, Lùi mang hàng, Đổi chỗ, Đặt lại chỗ cũ, Tay lắp ngược, Cần cẩu, Kho đồ; hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu che-tay "Huy hiệu Chế lệnh tay"',
    J(che.map((m) => m.ten)) === J(['Chuyền ra sau', 'Đặt sang phải', 'Dọn đường', 'Nhặt sau lưng', 'Lùi mang hàng', 'Đổi chỗ', 'Đặt lại chỗ cũ', 'Tay lắp ngược', 'Cần cẩu', 'Kho đồ']) &&
      J(che.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && che.every((m) => !!m.huyHieu === (m.so === 10)) && che[9].huyHieu.ma === 'che-tay' && che[9].huyHieu.ten === 'Huy hiệu Chế lệnh tay');
  kiem('mọi màn: xe hai bánh gắn tay kẹp (robot { than: "hai-banh", tay: "kep", camBien: [] }), chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em, chưa có for',
    che.every((m) => m.loaiRobot === 'banh' && J(m.robot) === J({ than: 'hai-banh', tay: 'kep', camBien: [] }) && m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && J(m.cauTruc) === '[]'));
  kiem('khay: đủ bánh (cả lùi) và bốn lệnh tay ở mọi màn trừ 5.9; 5.9 hỏng bánh phải: khay = phần cứng = trừ right_back',
    che.every((m) => J(m.hamGoc) === J(m.so === 9 ? BANH_TAY_HONG : BANH_TAY)) && J(man(9).phanCung) === J(BANH_TAY_HONG) && che.every((m) => m.so === 9 || m.phanCung === undefined) && /kẹt số lùi/.test(man(9).canhBao));
  kiem('lệnh chế ở từng màn (taoHam): pass_back, put_right, —, grab_back, drag, swap, —, —, —, —; 5.7 viết put_back và 5.8 sửa fixed_pick, fixed_drop là HÀM CỦA MÀN (không hàm của em mới); 5.9 sửa turn_right và u_turn (không tạo mới)',
    J(che.map((m) => m.taoHam)) === J([['pass_back'], ['put_right'], [], ['grab_back'], ['drag'], ['swap'], [], [], [], []]) && J(man(9).loiGiai.hamCuaEmMoi.map((h) => h.ten)) === '["turn_right","u_turn"]' &&
      [7, 8].every((i) => man(i).loiGiai.hamCuaEmMoi.length === 0 && man(i).congThucKhac.every((c) => !c.hamCuaEmMoi || c.hamCuaEmMoi.length === 0)) && J(man(7).loiGiai.hamCuaMan.map((h) => h.ten)) === '["go_get","put_back"]' && J(man(8).loiGiai.hamCuaMan.map((h) => h.ten)) === '["fixed_pick","fixed_drop"]');
  kiem('mục tiêu: 5.3 tới cờ (có chữ F, vật chỉ là chướng ngại), còn lại bong-mo có bongMo; chinhCoDinh ở mọi màn trừ 5.3 và 5.10; bongMo.cam chỉ ở 5.4; bongMo.vat có màu chỉ ở 5.6 và 5.10; khoaHamMan ["go_get"] chỉ ở 5.7; daoChieu ["tay"] chỉ ở 5.8; gioiHanHam 4 chỉ ở 5.10',
    che.every((m) => (m.so === 3 ? m.mucTieu === undefined && /F/.test(m.san.join('')) && m.bongMo === undefined : m.mucTieu === 'bong-mo' && !!m.bongMo && !/F/.test(m.san.join(''))) &&
      (m.chinhCoDinh === true) === ![3, 10].includes(m.so) && ((m.bongMo && m.bongMo.cam) === true) === (m.so === 4) &&
      ((m.bongMo && m.bongMo.vat) ? m.bongMo.vat.some((q) => q.mau) : false) === [6, 10].includes(m.so) && (m.so === 7) === (J(m.khoaHamMan) === '["go_get"]') &&
      (m.so === 8 ? J(m.daoChieu) === '["tay"]' : m.daoChieu === undefined) && (m.so === 10 ? m.gioiHanHam === 4 : m.gioiHanHam === undefined)));
  kiem('màn nào có vật màu thì khai lớp vatMau cùng cỡ sân (5.6, 5.10) và vật trong sân khớp danh sách vật mờ về MÀU (hai tập màu giống nhau)',
    [6, 10].every((i) => { const m = man(i), sn = SanHoc.docSan(m.san, m.mau, m.vatMau); return sn.vat.length === m.bongMo.vat.length && J(sn.vat.map((v) => v.mau).sort()) === J(m.bongMo.vat.map((q) => q.mau).sort()); }));
  kiem('mọi màn dùng nhipTheoLoiGiai (nâng tay có wait() riêng trong pick / drop nên lời giải chuẩn dài hơn đường ngắn nhất gộp nhịp)', che.every((m) => m.nhipTheoLoiGiai === true));

  const bang = [];
  for (const m of che) {
    const kho = khoTruoc(m.id);
    const khoNay = tron(kho, m.loiGiai.hamCuaEmMoi);
    const r = ChamHoc.cham(m, m.loiGiai, khoNay);
    kiem(m.id + ' ' + m.ten + ': lời giải cách 1 thắng 3 sao, ' + r.soO + ' ô = sao.o, ' + r.soNhip + ' nhịp = sao.nhip, không chẩn đoán nào (kể cả thông tin)',
      r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    // nhịp: BFS gộp (đường ngắn nhất thật) và BFS chuẩn (pick / drop là khối 2 nhịp) không dài hơn sao.nhip
    const bfsGop = nhipCheTayTatCa(m, kho);
    const bfsChuan = m.khoaHamMan ? null : nhipCheTayNganNhat(m, { gop: false }).nhip;
    bang.push({ m, r, bfsGop, bfsChuan });
    kiem(m.id + ': BFS đường ngắn nhất (gộp nâng tay với lệnh bánh) = ' + bfsGop + ' ≤ sao.nhip ' + m.sao.nhip + (bfsChuan !== null ? '; BFS cách viết chuẩn (pick / drop 2 nhịp) = ' + bfsChuan + ' ≤ sao.nhip' : ''),
      bfsGop !== null && bfsGop <= m.sao.nhip && (bfsChuan === null || (bfsChuan !== null && bfsChuan <= m.sao.nhip)), 'BFS = ' + bfsGop + ' / ' + bfsChuan + ', sao.nhip = ' + m.sao.nhip);
    // chương trình chính cố định / tự viết
    if (m.chinhCoDinh) {
      const gui = ChamHoc.cham(m, { chinh: ['wait()', 'wait()', 'wait()'], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính gửi lên bị bỏ qua (kết quả y hệt lời giải)', J([gui.thang, gui.soO, gui.soNhip, gui.py]) === J([r.thang, r.soO, r.soNhip, r.py]) && m.maMau.chinh.length >= 1 && m.maMau.chinh.length <= m.khung.chinh);
      const trong = ChamHoc.cham(m, { chinh: [], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính RỖNG gửi lên vẫn chạy bản mẫu (cùng nhịp, cùng sao)', trong.thang === r.thang && trong.sao === r.sao && trong.soNhip === r.soNhip);
    } else {
      kiem(m.id + ': người chơi tự viết chương trình chính (maMau.chinh rỗng, lời giải ≤ 10 dòng, gọi hàm đã chế)', m.maMau.chinh.length === 0 && m.loiGiai.chinh.length >= 1 && m.loiGiai.chinh.length <= 10 && !ChamHoc.cham(m, { chinh: [] }, khoNay).thang);
    }
    // mục tiêu và bóng mờ
    if (m.mucTieu === 'bong-mo') {
      const bm = m.bongMo, san = SanHoc.docSan(m.san, m.mau, m.vatMau);
      kiem(m.id + ': bóng mờ (' + bm.x + ',' + bm.y + ') hướng ' + bm.huong + ' nằm trên ô đi được; vật mờ ' + bm.vat.length + (bm.cam ? ' + cầm 1' : '') + ' đúng bằng số vật của sân; chạy xong thắng đúng ở nhịp cuối',
        !SanHoc.lyDoChan(san, 'banh', bm.x, bm.y) && r.bongMo.x === bm.x && r.bongMo.huong === bm.huong && bm.vat.length + (bm.cam ? 1 : 0) === san.vat.length && bm.vat.every((q) => !SanHoc.lyDoChan(san, 'banh', q.x, q.y)) &&
          nhipVet(r).length === r.soNhip && nhipVet(r).slice(-1)[0].suKien.some((e) => e.ma === 'toi-bong-mo') && nhipVet(r).slice(0, -1).every((n) => !n.suKien.some((e) => e.ma === 'toi-bong-mo')));
    } else {
      kiem(m.id + ': mục tiêu tới cờ F; sân có vật chắn lối', m.mucTieu === undefined && m.san.join('').includes('F') && /o/.test(m.san.join('')) && m.bongMo === undefined);
    }
    // cách chế khác: đều thắng
    kiem(m.id + ': có ít nhất 1 công thức khác (congThucKhac), khác cách 1', Array.isArray(m.congThucKhac) && m.congThucKhac.length >= 1 && m.congThucKhac.every((c) => c.moTa && (Array.isArray(c.hamCuaEmMoi) || c.baiLam) && J({ b: c.baiLam || m.loiGiai, h: c.hamCuaEmMoi || [] }) !== J({ b: m.loiGiai, h: m.loiGiai.hamCuaEmMoi })));
    m.congThucKhac.forEach((c, i) => {
      const rc = ChamHoc.cham(m, c.baiLam || m.loiGiai, tron(khoNay, c.hamCuaEmMoi));
      kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng, không lỗi — ' + rc.sao + ' sao, ' + rc.soO + ' ô, ' + rc.soNhip + ' nhịp', rc.thang && maLoi(rc).length === 0, J({ thang: rc.thang, cd: rc.chanDoan.map((x) => x.ma) }));
    });
    // lời giải khác (chỉ thêm chú thích hay gói hàm): đúng 2 sao
    const rk = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kho, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': loiGiaiKhac (' + m.loiGiaiKhac.moTa + ') thắng đúng 2 sao, nhiều ô hơn, cùng nhịp, vừa khung', rk.thang && rk.sao === 2 && rk.soO > m.sao.o && rk.soNhip === m.sao.nhip && !maCua(rk).includes('tran-khung'), J({ sao: rk.sao, soO: rk.soO, soNhip: rk.soNhip, cd: maCua(rk) }));
    // lời sai
    m.loiSai.forEach((ls, i) => {
      const rs = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi));
      const co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): ' + (ls.phaiCoMa.length ? 'không thắng, có mã ' + ls.phaiCoMa.join('+') : 'thắng nhưng thiếu sao'),
        rs.sao < 3 && thieu.length === 0 && (ls.phaiCoMa.length ? !rs.thang : rs.thang), 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + rs.sao);
    });
    // đề bài nhắc tên lệnh cần chế / sửa; đề 1–3 câu; gợi ý 1–2 câu
    const khoaTen = m.khoaHamMan || [];
    const suaTen = m.loiGiai.hamCuaEmMoi.map((h) => h.ten).concat(m.loiGiai.hamCuaMan.filter((h) => !khoaTen.includes(h.ten)).map((h) => h.ten));          // hàm em chế / sửa + hàm của màn người chơi viết / sửa
    kiem(m.id + ': đề bài nhắc tên lệnh cần chế / sửa (' + (suaTen.join(', ') || 'màn dùng') + ')', suaTen.every((t) => (m.deBai + ' ' + (m.veMaMau || '')).includes(t + '()')) && (m.taoHam.length || [3, 7, 8, 9, 10].includes(m.so) ? true : false), m.deBai);
    kiem(m.id + ': gợi ý 1–2 câu, không nói tên nút; đề 1–3 câu', m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && !/bấm|nút/i.test(m.goiY.join(' ')));
  }

  // luật riêng từng màn
  const m1 = man(1), k1 = khoTruoc(m1.id);
  kiem('5.1 Chuyền ra sau: xe đứng sẵn ở bóng mờ, chỉ vật phải sang ô sau lưng; chưa chế hàm thì không thắng (xe vẫn ở đó nhưng vật còn trước mặt); BFS gộp 4 nhịp < sao.nhip 6; BFS chuẩn đúng 6',
    !ChamHoc.cham(m1, m1.maMau, k1).thang && J(m1.batDau) === J({ x: m1.bongMo.x, y: m1.bongMo.y, huong: m1.bongMo.huong }) && nhipCheTayNganNhat(m1).nhip === 4 && nhipCheTayNganNhat(m1, { gop: false }).nhip === 6 && m1.sao.nhip === 6);
  const m2 = man(2);
  kiem('5.2 Đặt sang phải: put_right() đặt vật vào ô bên PHẢI của xe, không phải bên trái (vật mờ ở bên phải); BFS chuẩn đúng 6',
    m2.bongMo.vat[0].x === m2.batDau.x + 1 && m2.bongMo.vat[0].y === m2.batDau.y && nhipCheTayNganNhat(m2, { gop: false }).nhip === 6);
  const m3 = man(3), k3 = khoTruoc(m3.id);
  const duongSai = ChamHoc.cham(m3, { chinh: ['move()', 'move()', 'move()', 'move()', 'turn_right()', 'move()', 'move()', 'move()'] }, k3);
  kiem('5.3 Dọn đường: hành lang hẹp có hai vật chắn lối — vật thứ nhất chỉ dẹp được ra SAU LƯNG (bên phải là tường), vật thứ hai ở góc chỉ dẹp được sang PHẢI (sau lưng là tường) hoặc nhặt mang theo; không dẹp thì đâm vật',
    maCua(duongSai).includes('dam-tuong') && !duongSai.thang && SanHoc.docSan(m3.san).vat.length === 2 && m3.loiGiai.chinh.length <= 10 &&
      ChamHoc.cham(m3, { chinh: ['pass_back()', 'move()', 'move()', 'move()', 'turn_right()', 'pass_back()', 'move()', 'move()', 'move()'] }, k3).chanDoan.some((c) => c.ma === 'tha-bi-chan'));
  kiem('5.3: viết thẳng lệnh nhặt thả không gọi hàm đã chế thì tràn 10 ô (tran-khung); lời giải dùng đúng pass_back, put_right, move, turn_right',
    maCua(ChamHoc.cham(m3, m3.loiSai[3].baiLam, k3)).includes('tran-khung') && J([...new Set(m3.loiGiai.chinh.map((s) => s.replace('()', '')))].sort()) === J(['move', 'pass_back', 'put_right', 'turn_right']));
  const m4 = man(4), k4 = khoTruoc(m4.id);
  const r4 = ChamHoc.cham(m4, m4.loiGiai, tron(k4, m4.loiGiai.hamCuaEmMoi));
  kiem('5.4 Nhặt sau lưng: xong tay ĐANG CẦM vật (tay.cam), mặt quay lên, vật bên phải vẫn nằm yên; kết quả có bongMo.cam; vật đang cầm không chiếm ô', r4.tay && r4.tay.cam !== null && m4.bongMo.cam === true && r4.bongMo.cam === true && r4.vat.filter((v) => v.trangThai === 'dat').length === 1 && r4.vat.filter((v) => v.trangThai === 'cam').length === 1);
  const m5 = man(5), k5 = khoTruoc(m5.id);
  kiem('5.5 Lùi mang hàng: drag() đưa vật lùi ĐÚNG HAI ô; lùi một ô hay hai lần tiến đều sai (xem loiSai); hàm back() dùng được ngay', m5.bongMo.vat[0].y - SanHoc.docSan(m5.san).vat[0].y === 2 && m5.bongMo.y - m5.batDau.y === 2 && k5.some((h) => h.ten === 'back'));
  const m6 = man(6), k6 = khoTruoc(m6.id);
  kiem('5.6 Đổi chỗ: vật đỏ ở trước mặt, vật xanh dương bên phải; sau swap() xanh dương ở trước mặt, đỏ bên phải (chấm theo màu); swap() đúng 10 dòng (hết khung), viết thẳng thì tran-khung; ô sau lưng phải trống',
    m6.loiGiai.hamCuaEmMoi[0].than.length === 10 && J(m6.bongMo.vat) === J([{ x: 2, y: 1, mau: 'blue' }, { x: 3, y: 2, mau: 'red' }]) && maCua(ChamHoc.cham(m6, m6.loiSai[2].baiLam, tron(k6, m6.loiSai[2].hamCuaEmMoi))).includes('tran-khung') && SanHoc.docSan(m6.san, m6.mau, m6.vatMau).vat.map((v) => v.mau).join() === 'red,blue');
  const m7 = man(7), k7 = khoTruoc(m7.id);
  const pre = ChamHoc.cham(Object.assign({}, m7, { chinhCoDinh: false }), { chinh: ['go_get()'], hamCuaMan: m7.maMau.hamCuaMan }, k7);
  kiem('5.7 Đặt lại chỗ cũ: go_get() của màn đưa xe lên 2 ô tới ◆ và nhặt vật (xe cầm vật, 4 nhịp, đã qua ◆); put_back() phải đặt vật về ô cũ và đưa xe về ô và hướng ban đầu; go_get khóa và xem được',
    pre.theoSan[0].soNhip === 4 && vt(pre.theoSan[0].robot) === '2,2' && pre.theoSan[0].tay.cam !== null && pre.theoSan[0].diQua[0].da === true && J(m7.bongMo) === J({ x: m7.batDau.x, y: m7.batDau.y, huong: m7.batDau.huong, diQua: [{ x: 2, y: 2 }], vat: [{ x: 2, y: 1 }] }) && J(m7.khoaHamMan) === '["go_get"]' && m7.maMau.hamCuaMan.some((h) => h.ten === 'go_get'));
  kiem('5.7: put_back() là lệnh ngược của go_get() theo thứ tự ngược: go_get = move, move, pick → put_back = drop, back, back (pick↔drop, move↔back); sửa go_get gửi lên vẫn bị bản mẫu thay',
    J(m7.loiGiai.hamCuaMan.find((h) => h.ten === 'put_back').than) === J(['drop()', 'back()', 'back()']) && J(m7.maMau.hamCuaMan[0].than) === J(['move()', 'move()', 'pick()']) && (() => { const pb = m7.loiGiai.hamCuaMan.find((h) => h.ten === 'put_back'); const a = ChamHoc.cham(m7, { chinh: [], hamCuaMan: [H('go_get', ['move()']), pb] }, k7); const b = ChamHoc.cham(m7, m7.loiGiai, k7); return J([a.thang, a.soO, a.soNhip]) === J([b.thang, b.soO, b.soNhip]) && b.sao === 3; })());
  const r7p = ChamHoc.cham(m7, m7.maMau, k7);
  kiem('5.7: put_back() là HÀM CỦA MÀN, thân ban đầu chỉ có `pass` (hợp lệ); để nguyên thì không thắng: xe cầm vật đứng ở chỗ go_get() dừng, lech-bong-mo (không phải lỗi cú pháp); put_back KHÔNG khóa (khoaHamMan chỉ go_get); không vào kho, không taoHam',
    J(m7.maMau.hamCuaMan.map((h) => h.ten)) === '["go_get","put_back"]' && J(m7.maMau.hamCuaMan[1].than) === J(['pass']) && !r7p.thang && J(maCua(r7p)) === '["lech-bong-mo"]' && J(m7.khoaHamMan) === '["go_get"]' && m7.taoHam.length === 0 && !k7.some((h) => h.ten === 'put_back'));
  kiem('5.7: BFS tính cả đoạn go_get() cố định (4 nhịp chạy thật + phần còn lại ngắn nhất = ' + nhipCheTayTatCa(m7, k7) + ' ≤ sao.nhip 8); không tính đoạn đó thì xe phải tự đi qua ◆ rồi về: 4 nhịp (nên chương trình rỗng hay go_get() hỏng KHÔNG thắng chỉ vì xe chưa rời chỗ)', nhipCheTayNganNhat(m7).nhip === 4 && nhipCheTayTatCa(m7, k7) === 7 && !ChamHoc.cham(Object.assign({}, m7, { chinhCoDinh: false }), { chinh: [], hamCuaMan: m7.maMau.hamCuaMan }, k7).thang);
  const m8 = man(8), k8 = khoTruoc(m8.id);
  const thuPick = ChamHoc.thuHam(m8, { chinh: [] }, 'pick', k8);
  kiem('5.8 Tay lắp ngược: daoChieu ["tay"] + canhBao "Dây tay đấu ngược"; pick() cũ trong sân thử cho tay HẠ mà không nhặt gì; fixed_pick / fixed_drop bằng arm_up rồi arm_down chạy đúng',
    J(m8.daoChieu) === '["tay"]' && /đấu ngược/.test(m8.canhBao) && thuPick.tay.tuThe === 'duoi' && thuPick.tay.cam === null && ChamHoc.cham(m8, m8.loiGiai, k8).sao === 3);
  const thuFp = ChamHoc.thuHam(m8, { chinh: [], hamCuaMan: m8.maMau.hamCuaMan }, 'fixed_pick', k8), thuFpDung = ChamHoc.thuHam(m8, { chinh: [], hamCuaMan: m8.loiGiai.hamCuaMan }, 'fixed_pick', k8);
  const r8m = ChamHoc.cham(m8, m8.maMau, k8);
  kiem('5.8: fixed_pick() và fixed_drop() là HÀM CỦA MÀN, không khóa; thân ban đầu = pick() / drop() cũ (arm_down, grab, wait, arm_up, wait) nên chạy sai: sân thử cho tay HẠ mà không nhặt gì; để nguyên thì kep-hut + lech-bong-mo; sửa thì thắng 3 sao; không vào kho, không taoHam, không hàm của em mới',
    J(m8.maMau.hamCuaMan.map((h) => h.ten)) === '["fixed_pick","fixed_drop"]' && J(m8.maMau.hamCuaMan[0].than) === J(['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()']) && J(m8.maMau.hamCuaMan[1].than) === J(['arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()']) && m8.khoaHamMan === undefined && m8.taoHam.length === 0 && m8.loiGiai.hamCuaEmMoi.length === 0 &&
      thuFp.tay.tuThe === 'duoi' && thuFp.tay.cam === null && thuFpDung.tay.tuThe === 'tren' && !r8m.thang && maCua(r8m).includes('kep-hut') && !k8.some((h) => h.ten === 'fixed_pick' || h.ten === 'fixed_drop'), J(maCua(r8m)));
  const m9 = man(9), k9 = khoTruoc(m9.id);
  const cu = ChamHoc.cham(m9, m9.maMau, k9);
  const cd9 = cu.chanDoan.find((c) => c.ma === 'lenh-goc-hong');
  kiem('5.9 Cần cẩu: chạy bản mẫu với turn_right cũ (right_back + wait): lenh-goc-hong (không phải ham-chua-co) trỏ dòng 1 của turn_right; lời nêu canhBao, tên lệnh right_back và các lệnh còn chạy được',
    !!cd9 && J(maCua(cu)) === '["lenh-goc-hong"]' && cd9.ten === 'right_back' && /Bánh phải kẹt số lùi/.test(cd9.loi) && /right_back\(\) không chạy được ở màn này/.test(cd9.loi) && /left_back/.test(cd9.loi) && J(cd9.cho) === J({ cot: 'hamEm', dong: 1, ten: 'turn_right' }), J(cu.chanDoan));
  kiem('5.9: phần cứng chỉ mất right_back: còn left_move, right_move, left_back, wait và bốn lệnh tay (xe tiến, quay phải, quay trái, quay đầu được; không LÙI được: lùi một ô phải quay đầu, tiến, quay đầu lại = 3 nhịp); hamGoc = phanCung',
    J(m9.phanCung) === J(m9.hamGoc) && !m9.phanCung.includes('right_back') && ['tien', 'phai', 'trai', 'dau', 'cho'].every((e) => DoDuong.BANH_EFFECT.includes(e)) &&
      (() => { const eff = nhipCheTayNganNhat(Object.assign({}, m9, { mucTieu: 'bong-mo', bongMo: { x: m9.batDau.x, y: m9.batDau.y + 1, huong: 0 }, san: TRONG })); return eff.nhip === 3 && eff.chuoi.every((a) => a.banh !== 'lui'); })());
  const thuUturn = ChamHoc.thuHam(m9, { chinh: [] }, 'u_turn', tron(k9, m9.loiGiai.hamCuaEmMoi));
  const thuHong = ChamHoc.thuHam(m9, { chinh: [] }, 'u_turn', k9);
  kiem('5.9: sân thử của Xưởng: u_turn() cũ báo lenh-goc-hong; sau khi sửa (trái lùi + phải tiến) xe quay đầu một nhịp', maCua(thuHong).includes('lenh-goc-hong') && maLoi(thuUturn).length === 0 && thuUturn.robot.huong === 2 && thuUturn.soNhip === 1, J(thuUturn.chanDoan));
  const m10 = man(10), k10 = khoTruoc(m10.id);
  const r10 = ChamHoc.cham(m10, m10.loiGiai, k10);
  const gh = ChamHoc.cham(m10, m10.loiSai[1].baiLam, k10);
  kiem('5.10 Kho đồ: gioiHanHam 4 — lời giải gọi 3 hàm khác nhau (u_turn, put_right, swap) vừa giới hạn; 5 hàm khác nhau bị qua-gioi-han-ham (lỗi khung, nêu "4"); trùm không khóa chương trình chính',
    r10.thang && J([...new Set(m10.loiGiai.chinh.map((s) => s.replace('()', '')))].sort()) === J(['put_right', 'swap', 'u_turn']) && maCua(gh).join() === 'qua-gioi-han-ham' && /4/.test(gh.chanDoan[0].loi) && !gh.thang && m10.chinhCoDinh !== true);
  const cong = ChamHoc.cham(m10, m10.congThucKhac[0].baiLam, k10);
  kiem('5.10: công thức khác gọi đúng 4 hàm của em khác nhau (grab_back, turn_left, turn_right, swap) và lệnh tay gốc viết thẳng — vừa giới hạn, thắng', cong.thang && maLoi(cong).length === 0 && J([...new Set(m10.congThucKhac[0].baiLam.chinh.filter((s) => /^[a-z_]+\(\)$/.test(s) && !KhoHam.HAM_GOC_MAC_DINH.includes(s.replace('()', ''))).map((s) => s))].sort()) === J(['grab_back()', 'swap()', 'turn_left()', 'turn_right()']));
  kiem('5.10: swap() cần ô sau lưng trống để cất tạm — còn thùng xanh lá ở đó thì swap() không đặt được (tha-bi-chan), phải dọn thùng sang trái trước (u_turn, put_right, u_turn)',
    maCua(ChamHoc.cham(m10, m10.loiSai[0].baiLam, k10)).includes('tha-bi-chan') && m10.loiGiai.chinh[3] === 'swap()' && m10.loiGiai.chinh.slice(0, 3).join() === 'u_turn(),put_right(),u_turn()');

  console.log('\n  Bảng 10 màn che-tay (lời giải cách 1, sao; BFS = nhịp ngắn nhất gộp nâng tay · chuẩn = pick / drop khối 2 nhịp)');
  console.log('  màn  | tên                | ô  | nhịp | BFS | chuẩn | tạo / sửa             | lời giải (chương trình chính)');
  for (const { m, bfsGop, bfsChuan } of bang) {
    console.log('  ' + m.id.padEnd(4) + ' | ' + m.ten.padEnd(18) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + String(m.sao.nhip).padEnd(4) + ' | ' + String(bfsGop).padEnd(3) + ' | ' + String(bfsChuan === null ? '—' : bfsChuan).padEnd(5) + ' | ' + m.loiGiai.hamCuaEmMoi.map((h) => h.ten).join(',').padEnd(21) + ' | ' + m.loiGiai.chinh.join(' ; '));
  }
}

/* ================================================================= 5. BỘ DÒ ĐƯỜNG */
console.log('\n== 5. Bộ dò đường BFS (do-duong-che-tay.mjs) kiểm chéo với SanHoc.chay ==');
{
  // 5a. đường BFS tìm được, đổi thành lệnh gốc, chạy bằng SanHoc.chay phải THẮNG đúng bằng số nhịp BFS
  for (const m of che.filter((x) => !x.khoaHamMan)) {
    const b = nhipCheTayNganNhat(m);
    const pc = SanHoc.phanCungCua(m);
    const code = chuoiThanhMa(b.chuoi, pc);
    const lm = SanHoc.lopMauCuaSan(m, 0);
    const k = SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: 'banh', hamGoc: m.hamGoc, phanCung: pc, mucTieu: m.mucTieu || 'toi-co', bongMo: lm.bongMo || undefined, vatMau: lm.vatMau, daoChieu: undefined, nhipToiDa: 200 }, code);
    kiem(m.id + ': đường BFS (' + b.nhip + ' nhịp) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng ' + b.nhip + ' nhịp, không lỗi', k.thang === true && k.nhip === b.nhip && !k.loi, 'thang ' + k.thang + ', nhịp ' + k.nhip + ', loi ' + J(k.loi));
  }
  // 5b. chương trình ngẫu nhiên: trạng thái cuối của buocMotNhip (từng bước) trùng SanHoc.chay (xe, tay, vật, ô diQua)
  let rngS = 12345;
  const rnd = (n) => { rngS = (rngS * 1103515245 + 12345) & 0x7fffffff; return rngS % n; };
  let soMau = 0, soLech = 0, vi = '';
  for (const m of che.filter((x) => !x.khoaHamMan)) {
    const { ctx, S } = trangThaiBanDau(m);
    const pc = SanHoc.phanCungCua(m);
    const dsHD = [];
    for (const t of [null, 'duoi', 'tren']) for (const kk of [null, 'kep', 'tha']) for (const bb of DoDuong.BANH_EFFECT) dsHD.push({ tuThe: t, kep: kk, banh: bb });
    let thu = 0;
    for (let lan = 0; lan < 150; lan++) {
      const chuoi = [];
      let cur = S, vo = false;
      const n = 3 + rnd(10);
      for (let i = 0; i < n && !vo; i++) {
        const a = dsHD[rnd(dsHD.length)];
        try { chuoiThanhMa([a], pc); } catch (e) { continue; }                 // hiệu quả phần cứng không làm được (5.9: lùi)
        const r = buocMotNhip(ctx, cur, a, true);
        if (!r) { vo = true; break; }
        chuoi.push(a); cur = r.N;
      }
      if (vo || !chuoi.length) continue;
      const lm = SanHoc.lopMauCuaSan(m, 0);
      const k = SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: 'banh', hamGoc: m.hamGoc, phanCung: pc, mucTieu: m.mucTieu || 'toi-co', bongMo: lm.bongMo || undefined, vatMau: lm.vatMau, nhipToiDa: 200 }, chuoiThanhMa(chuoi, pc));
      soMau++; thu++;
      const rongS = ctx.rong;
      const posSim = k.vat.map((v) => (v.trangThai === 'dat' ? v.y * rongS + v.x : v.trangThai === 'cam' ? -1 : -2));
      const camSim = k.tay.cam !== null ? k.tay.cam - 1 : -1;
      const gongNhau = k.robot.x === cur.x && k.robot.y === cur.y && k.robot.huong === cur.h && (k.tay.tuThe === 'duoi' ? 1 : 0) === cur.t && camSim === cur.cam && J(posSim) === J(cur.pos);
      if (!gongNhau) { soLech++; if (!vi) vi = m.id + ' ' + chuoiThanhMa(chuoi, pc).replace(/\n/g, ';') + ' sim ' + J([k.robot, k.tay, posSim]) + ' bfs ' + J(cur); }
      if (daDatDich(ctx, cur) !== (k.thang === true)) { soLech++; if (!vi) vi = m.id + ' thắng lệch: bfs ' + daDatDich(ctx, cur) + ' sim ' + k.thang + ' ' + chuoiThanhMa(chuoi, pc).replace(/\n/g, ';'); }
    }
  }
  kiem('chương trình ngẫu nhiên (' + soMau + ' mẫu trên 9 sân): trạng thái cuối (ô, hướng, tư thế tay, vật cầm, ô các vật) của bộ dò trùng SanHoc.chay và kết luận thắng trùng nhau', soMau > 500 && soLech === 0, vi);
  // 5c. bộ dò bắt được đường tắt / đường dài
  const m1 = man(1);
  kiem('bộ dò tự kiểm: bỏ vật cản ở 5.1 (vật nằm sẵn ô sau lưng) thì vật đã đúng chỗ — nhưng ô trước mặt trống nên chương trình rỗng là xong: 0 nhịp', nhipCheTayNganNhat(Object.assign({}, m1, { san: ['.....', '.....', '.....', '.....', '..o..'] })).nhip === 0 && nhipCheTayNganNhat(Object.assign({}, m1, { san: ['.....', '.....', '.....', '.....', '..o..'] }, { bongMo: Object.assign({}, m1.bongMo, { vat: [{ x: 2, y: 4 }] }) })).nhip === 0);
  const m4 = man(4);
  kiem('bộ dò: 5.4 (cầm vật) cần 3 nhịp gộp (quay đầu; hạ tay + kẹp; nâng tay + quay lại) và 4 nhịp theo cách viết chuẩn (quay đầu; nhặt 2 nhịp; quay lại)', nhipCheTayNganNhat(m4).nhip === 3 && nhipCheTayNganNhat(m4, { gop: false }).nhip === 4);
  kiem('bộ dò: phần cứng hẹp hơn thì đường dài hơn — 5.1 mà không có hiệu quả quay đầu (chỉ quay phải) vẫn tới đích nhưng nhiều nhịp hơn',
    nhipCheTayNganNhat(m1, { phanCung: ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'] }).nhip > nhipCheTayNganNhat(m1).nhip);
  kiem('bộ dò: vật không bao giờ vỡ trong đường tìm được (chuỗi không thả khi tay nâng): lời giải BFS của 5.1, 5.2, 5.4, 5.5, 5.6, 5.8, 5.9, 5.10 chạy không có vat-vo',
    [1, 2, 4, 5, 6, 8, 9, 10].every((i) => { const m = man(i), pc = SanHoc.phanCungCua(m); const k = SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: 'banh', hamGoc: m.hamGoc, phanCung: pc, mucTieu: 'bong-mo', bongMo: m.bongMo, vatMau: m.vatMau }, chuoiThanhMa(nhipCheTayNganNhat(m).chuoi, pc)); return k.suKien.filter((e) => e.ma === 'vat-vo').length === 0; }));
}

/* ================================================================= 6. BẢN SỬA CỦA 5.9 VẪN ĐÚNG Ở MỌI MÀN KHÁC */
console.log('\n== 6. Bản sửa turn_right / u_turn của 5.9 (bánh trái / trái lùi + phải tiến) vẫn đúng ở mọi màn khác ==');
{
  const sua = man(9).loiGiai.hamCuaEmMoi;
  kiem('5.9 sửa đúng hai hàm: turn_right = left_move, wait (bánh phải không lùi: dùng bánh trái tiến) và u_turn = left_back, right_move, wait (trái lùi + phải tiến); cả hai MỘT nhịp, số dòng bằng bản che-xe (2 và 3)',
    J(sua.find((h) => h.ten === 'turn_right').than) === J(['left_move()', 'wait()']) && J(sua.find((h) => h.ten === 'u_turn').than) === J(['left_back()', 'right_move()', 'wait()']));
  const hongLien = che.filter((m) => m.so !== 9).concat([]);
  const ngoai = [];
  let soMan = 0;
  for (const m of tatCa) {
    if (m.ma === 'che-tay.9' || m.ma === 'che-xe.9') continue;               // hai màn hỏng phần cứng tự sửa các hàm này
    soMan++;
    const kho = tron(tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi), sua);
    const r = ChamHoc.cham(m, m.loiGiai, kho);
    const nhanhHon = r.soNhip <= m.sao.nhip;
    if (!(r.thang && maLoi(r).length === 0 && nhanhHon)) ngoai.push(m.id + ':' + r.thang + '/' + r.soNhip + '≤' + m.sao.nhip + (maLoi(r).length ? '/' + maLoi(r).join('+') : ''));
  }
  kiem('đặt bản sửa 5.9 lên kho (đè cả hàm cùng tên màn tự chế): lời giải của MỌI màn khác (' + soMan + ' màn, trừ che-xe.9 và che-tay.9 tự sửa) vẫn thắng, không lỗi, không chậm hơn sao.nhip', ngoai.length === 0, ngoai.join(' '));
  const kho9 = tron(khoTruoc(man(9).id), sua);
  const pt = ChamHoc.thuHam(man(1), { chinh: [] }, 'turn_right', kho9), ul = ChamHoc.thuHam(man(1), { chinh: [] }, 'u_turn', kho9);
  kiem('trên phần cứng đủ bánh: turn_right sửa quay PHẢI một nhịp, u_turn sửa quay đầu một nhịp', pt.robot.huong === 1 && pt.soNhip === 1 && ul.robot.huong === 2 && ul.soNhip === 1 && maLoi(pt).length === 0 && maLoi(ul).length === 0);
  const cuoi = khoTruoc('het');
  kiem('kho cuối game vẫn có đủ năm hàm của che-tay và tên cốt truyện khóa; put_back, fixed_pick, fixed_drop (hàm của màn) không có trong kho', ['pass_back', 'put_right', 'grab_back', 'drag', 'swap'].every((t) => cuoi.some((h) => h.ten === t)) && ['put_back', 'fixed_pick', 'fixed_drop'].every((t) => !cuoi.some((h) => h.ten === t)));
}

/* ================================================================= 7. THẺ SCRIPT CỦA GAME */
console.log('\n== 7. game/choi.html nạp man-che-tay.js đúng thứ tự ==');
{
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có thẻ script ../man-che-tay.js đúng một lần, sau man-tay-gap.js và trước man-vong-lap.js (cùng sổ màn)', tags.filter((t) => t === '../man-che-tay.js').length === 1 && vtri('man-che-tay.js') > vtri('man-tay-gap.js') && vtri('man-che-tay.js') < vtri('man-vong-lap.js'), J(tags));
  kiem('so-lenh.js nạp trước man-che-tay.js', vtri('so-lenh.js') >= 0 && vtri('so-lenh.js') < vtri('man-che-tay.js'));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

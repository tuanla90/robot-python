/* ============================================================================
   kiem-dem-tu.mjs — máy kiểm ĐỆM TỪ (cơ chế mùa 3, bản thử; luật ở san-hoc.js phần ĐỆM TỪ) và chương `dem-tu-thu` (gói "Thử đệm từ").
   Phần A: lõi (hút / đẩy / giữ / chặn / hố / hai đệm / chắn từ / nhện / drone / cấu hình sai).
   Phần B: màn (khi mau-dem-tu-thu.js có màn): mỗi màn lời giải thắng 3 sao, mỗi lời sai không thắng, mã mẫu màn 1 thắng.
   Chạy: node hoc/kiem-dem-tu.mjs            (trượt thì thoát mã 1)
         node hoc/kiem-dem-tu.mjs --loi-gia  (cố ý bẻ luật: phải ĐỎ; nếu xanh thì máy kiểm không bắt được gì)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const ManHoc = require(path.join(day, 'lo-trinh-hoc.js'));         // nạp cả lộ trình (có mau-dem-tu-thu.js) để lấy kho hàm thật của học sinh lúc tới màn
const KhoHam = require(path.join(day, 'kho-ham.js'));
const TT = require(path.join(day, 'thu-tu-chuong.js'));
const tatCa = ManHoc.danhSach;
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải): như kiem-nam-cham.mjs. */
function khoTruoc(id) {
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  for (const m of tatCa) {
    if (m.id === id) break;
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi) { if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo, { taoHam: m.taoHam }); kho.sua(h.ten, h.than); }
  }
  return kho.ds();
}

/** Kho của học sinh SAU KHI chơi hết chương `c` (mọi màn tới hết màn cuối của chương đó). */
function khoSauChuong(c) {
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  const cuoi = tatCa.filter((m) => m.chuong === c).slice(-1)[0];
  for (const m of tatCa) {
    if (m.tietKiemNhip !== true) for (const h of m.loiGiai.hamCuaEmMoi) { if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo, { taoHam: m.taoHam }); kho.sua(h.ten, h.than); }
    if (m === cuoi) break;
  }
  return kho.ds();
}

const LOI_GIA = process.argv.includes('--loi-gia');
let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const HG = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'magnet_n', 'magnet_s', 'magnet_off'];
const MV = 'left_move()\nright_move()\nwait()\n';            // xe hai bánh tiến 1 ô (lệnh gốc, không cần kho hàm)
const SAN4 = ['.....', '.....', '.....', '.....'];
const chay = (cfg, code) => SanHoc.chay(Object.assign({ loaiRobot: 'banh', hamGoc: HG, mucTieu: 'toi-co' }, cfg), code);
const nhip = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
const maNhip = (kq, i) => nhip(kq)[i - 1].suKien.map((s) => s.ma);
const vt = (kq) => kq.robot.x + ',' + kq.robot.y;

console.log('A. Lõi đệm từ');
{
  // 1 hút lệch làn: đệm S (2,0), xe không bật nam châm đi ngang hàng 2 → ở nhịp 2 đứng (2,2) cách đệm 2 ô cùng cột → bị hút lên (2,1); hướng mặt không đổi
  const kq = chay({ san: SAN4, demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 0, y: 2, huong: 1 } }, MV + MV + MV);
  const e = nhip(kq)[1].suKien.find((s) => s.ma === 'dem-hut');
  kiem('hút: xe không bật nam châm đi ngang đệm S bị kéo lệch 1 ô về phía đệm, cuối (3,1), hướng mặt giữ nguyên',
    vt(kq) === (LOI_GIA ? '3,2' : '3,1') && kq.robot.huong === 1 && !!e && J(e.tu) === J({ x: 2, y: 2 }) && J(e.den) === J({ x: 2, y: 1 }) && J(e.dem) === J({ x: 2, y: 0, cuc: 'S' }) && e.nhip === 2, vt(kq) + ' ' + J(maNhip(kq, 2)));
  // 2 cùng cực → đẩy ra xa
  const kq2 = chay({ san: SAN4, demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 0, y: 2, huong: 1 } }, 'magnet_s()\nwait()\n' + MV + MV + MV);
  kiem('đẩy: xe bật cực S (cùng cực đệm S) bị đẩy ra xa 1 ô, cuối (3,3); sự kiện dem-day ở nhịp 3', vt(kq2) === '3,3' && maNhip(kq2, 3).includes('dem-day'), vt(kq2) + ' ' + J(maNhip(kq2, 3)));
  // 3 khác cực → hút
  const kq3 = chay({ san: SAN4, demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 0, y: 2, huong: 1 } }, 'magnet_n()\nwait()\n' + MV + MV + MV);
  kiem('hút: xe bật cực N (khác cực đệm S) bị hút như không bật, cuối (3,1)', vt(kq3) === '3,1' && maNhip(kq3, 3).includes('dem-hut'), vt(kq3));
  // 4 đệm là khối, sát đệm thì giữ
  const kq4 = chay({ san: SAN4, demTu: [{ x: 2, y: 2, cuc: 'S' }], batDau: { x: 0, y: 2, huong: 1 } }, MV + MV);
  const dt = nhip(kq4)[1].suKien.find((s) => s.ma === 'dam-tuong');
  kiem('khối: xe đâm vào ô đệm như tường (dam-tuong vat dem-tu), đứng sát đệm thì dem-giu (không dời)', vt(kq4) === '1,2' && !!dt && dt.vat === 'dem-tu' && maNhip(kq4, 1).includes('dem-giu'), vt(kq4) + ' ' + J(maNhip(kq4, 2)));
  // 5 hút vào hố → rơi
  const kq5 = chay({ san: ['.....', '..u..', '.....', '.....'], demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 0, y: 2, huong: 1 } }, MV + MV + MV);
  kiem('hố: bị hút vào ô hố thì rơi (dem-hut rồi roi-ho cùng nhịp, chương trình dừng)', kq5.dungSom === 'roi-ho' && maNhip(kq5, 2).includes('dem-hut') && maNhip(kq5, 2).includes('roi-ho') && nhip(kq5).length === 2, J(maNhip(kq5, 2)));
  // 6 hai đệm bằng khoảng, ngược chiều → đứng im
  const kq6 = chay({ san: SAN4, demTu: [{ x: 0, y: 1, cuc: 'N' }, { x: 4, y: 1, cuc: 'S' }], batDau: { x: 2, y: 2, huong: 0 } }, MV);
  kiem('hai đệm cách đều hai bên, không bật nam châm: hai lực ngược nhau, xe đứng im (dem-can)', vt(kq6) === '2,1' && maNhip(kq6, 1).includes('dem-can'), vt(kq6) + ' ' + J(maNhip(kq6, 1)));
  // 7 hai đệm bằng khoảng, cùng chiều → dời
  const kq7 = chay({ san: SAN4, demTu: [{ x: 0, y: 1, cuc: 'N' }, { x: 4, y: 1, cuc: 'S' }], batDau: { x: 2, y: 2, huong: 0 } }, 'magnet_n()\nwait()\n' + MV);
  kiem('hai đệm cách đều, xe bật N: N đẩy sang phải, S hút sang phải, cùng chiều nên dời sang (3,1)', vt(kq7) === '3,1' && maNhip(kq7, 2).includes('dem-day'), vt(kq7));
  // 7b đệm gần hơn thắng: S (2,0) cách 1, N (2,3) cách 2, xe không bật ở (2,1) → S giữ (gần hơn), không bị N kéo xuống
  const kq7b = chay({ san: SAN4, demTu: [{ x: 2, y: 0, cuc: 'S' }, { x: 2, y: 3, cuc: 'N' }], batDau: { x: 1, y: 1, huong: 1 } }, MV);
  kiem('đệm gần hơn thắng: xe tới (2,1) sát S (cách 1) và cách N 2 ô → S giữ, xe không bị N kéo', vt(kq7b) === '2,1' && maNhip(kq7b, 1).includes('dem-giu') && !maNhip(kq7b, 1).includes('dem-hut'), vt(kq7b) + ' ' + J(maNhip(kq7b, 1)));
  // 8 tường giữa chắn từ
  const kq8 = chay({ san: ['.....', '..#..', '.....', '.....'], demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 1, y: 2, huong: 1 } }, MV);
  kiem('chắn từ: tường giữa đệm và xe thì đệm không tác động', vt(kq8) === '2,2' && !maNhip(kq8, 1).some((m) => m.startsWith('dem-')), vt(kq8));
  // 8b tầm 2 ô: cách 3 không bị
  const kq8b = chay({ san: SAN4, demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 1, y: 3, huong: 1 } }, MV);
  kiem('tầm: cách đệm 3 ô cùng cột thì không bị kéo', vt(kq8b) === '2,3' && !maNhip(kq8b, 1).some((m) => m.startsWith('dem-')), vt(kq8b));
  // 9 đẩy bị chặn → đứng im
  const kq9 = chay({ san: ['.....', '.....', '..#..', '.....'], demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 1, y: 1, huong: 1 } }, 'magnet_s()\nwait()\n' + MV);
  const ec = nhip(kq9)[1].suKien.find((s) => s.ma === 'dem-chan');
  kiem('đẩy bị tường chặn: xe đứng im, dem-chan { kieu day, vat tuong }', vt(kq9) === '2,1' && !!ec && ec.kieu === 'day' && ec.vat === 'tuong', vt(kq9) + ' ' + J(maNhip(kq9, 2)));
  // 10 cấu hình sai
  let loi10 = null; try { chay({ san: ['..#..', '.....'], demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 0, y: 1, huong: 1 } }, MV); } catch (e) { loi10 = e.message; }
  let loi10b = null; try { chay({ san: SAN4, demTu: [{ x: 2, y: 0, cuc: 'X' }], batDau: { x: 0, y: 1, huong: 1 } }, MV); } catch (e) { loi10b = e.message; }
  let loi10c = null; try { chay({ san: SAN4, demTu: [{ x: 0, y: 1, cuc: 'N' }], batDau: { x: 0, y: 1, huong: 1 } }, MV); } catch (e) { loi10c = e.message; }
  kiem('cấu hình: đệm trên ô không phải "." / cực lạ / robot xuất phát trên đệm → ném lỗi', /sàn trống/.test(loi10 || '') && /"N" hay "S"/.test(loi10b || '') && /xuất phát trên ô đệm/.test(loi10c || ''), J([loi10, loi10b, loi10c]));
  // 11 nhện bị hút (không có nam châm)
  const kq11 = SanHoc.chay({ loaiRobot: 'nhen', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand'], mucTieu: 'toi-co', san: SAN4, demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 0, y: 2, huong: 1 } }, 'go_right()\ngo_right()\ngo_right()\n');
  kiem('nhện (không nam châm) cũng bị hút như sắt: cuối (3,1)', vt(kq11) === '3,1' && maNhip(kq11, 4).includes('dem-hut'), vt(kq11));
  // 11b MIỄN NHẢY (user 29/10): nhện nhảy đáp xuống ô trong tầm thì nhịp đó KHÔNG bị hút; nhịp sau đứng yên (wait) mới bị hút
  const HG_NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand'];
  const kq11b = SanHoc.chay({ loaiRobot: 'nhen', hamGoc: HG_NHEN, mucTieu: 'toi-co', san: SAN4, demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 0, y: 2, huong: 1 } }, 'crouch()\nwait()\nstand()\ngo_right()\n');
  const nh = nhip(kq11b).find((n) => n.suKien.some((s) => s.ma === 'nhay'));
  kiem('nhện nhảy đáp (2,2): nhịp nhảy KHÔNG có dem-hut, cuối vẫn (2,2) (miễn đệm khi nhảy)', !!nh && !nh.suKien.some((s) => s.ma === 'dem-hut') && vt(kq11b) === (LOI_GIA ? '2,1' : '2,2'), vt(kq11b) + ' ' + J(nhip(kq11b).map((n) => n.suKien.map((s) => s.ma))));
  const kq11c = SanHoc.chay({ loaiRobot: 'nhen', hamGoc: HG_NHEN, mucTieu: 'toi-co', san: SAN4, demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 0, y: 2, huong: 1 } }, 'crouch()\nwait()\nstand()\ngo_right()\nwait()\n');
  kiem('nhện nhảy đáp (2,2) rồi wait(): nhịp wait mới bị hút lên (2,1)', vt(kq11c) === '2,1' && maNhip(kq11c, 4).includes('dem-hut') && !maNhip(kq11c, 3).includes('dem-hut'), vt(kq11c) + ' ' + J(nhip(kq11c).map((n) => n.suKien.map((s) => s.ma))));
  // 11d nhện nhảy đáp (3,2) đúng cột đệm (3,0), cách 2 ô: nhịp nhảy không bị hút lên (3,1) (luật cũ có); đi bộ tới cùng ô thì bị hút (11)
  const kq11d = SanHoc.chay({ loaiRobot: 'nhen', hamGoc: HG_NHEN, mucTieu: 'toi-co', san: SAN4, demTu: [{ x: 3, y: 0, cuc: 'S' }], batDau: { x: 1, y: 2, huong: 1 } }, 'crouch()\nwait()\nstand()\ngo_right()\n');
  kiem('nhện nhảy từ (1,2) qua (2,2) đáp (3,2) ngay dưới đệm (3,0): nhịp nhảy không bị dời, không dem-hut / dem-day', vt(kq11d) === '3,2' && !nhip(kq11d).some((n) => n.suKien.some((s) => s.ma === 'nhay') && n.suKien.some((s) => s.ma === 'dem-hut' || s.ma === 'dem-day')), vt(kq11d) + ' ' + J(nhip(kq11d).map((n) => n.suKien.map((s) => s.ma))));
  // 11e nhện nhảy hụt (bật lên rơi lại ô cũ) cũng là trên không: nhịp đó không có sự kiện đệm nào (kể cả dem-giu). Đệm (3,2) cùng hàng: nhịp crouch nhện bị hút
  //     (1,2) → (2,2) sát đệm; nhảy phải thì ô giữa là đệm (khối) → nhay-hut; nhịp đó không dem-giu (luật cũ có).
  const kq11e = SanHoc.chay({ loaiRobot: 'nhen', hamGoc: HG_NHEN, mucTieu: 'toi-co', san: ['.....', '.....', '.....', '.....'], demTu: [{ x: 3, y: 2, cuc: 'S' }], batDau: { x: 1, y: 2, huong: 1 } }, 'crouch()\nwait()\nstand()\ngo_right()\n');
  const nhe = nhip(kq11e).find((n) => n.suKien.some((s) => s.ma === 'nhay-hut'));
  kiem('nhện bị hút sát đệm (2,2) rồi nhảy hụt (ô giữa là đệm): nhịp nhay-hut không có sự kiện dem-*, cuối (2,2)', !!nhe && !nhe.suKien.some((s) => /^dem-/.test(s.ma)) && vt(kq11e) === '2,2' && maNhip(kq11e, 1).includes('dem-hut'), vt(kq11e) + ' ' + J(nhip(kq11e).map((n) => n.suKien.map((s) => s.ma))));
  // 12 drone không bị
  const kq12 = SanHoc.chay({ loaiRobot: 'drone', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait'], mucTieu: 'toi-co', san: SAN4, demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 0, y: 2, huong: 1 } }, 'go_right()\ngo_right()\ngo_right()\n');
  kiem('drone bay: không bị đệm kéo, bay qua được ô đệm', vt(kq12) === '3,2' && !SanHoc.lyDoChan({ rong: 5, cao: 4, o: SAN4, demTu: { '2,0': { x: 2, y: 0, cuc: 'S' } } }, 'drone', 2, 0), vt(kq12));
  const kq12b = SanHoc.chay({ loaiRobot: 'drone', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait'], mucTieu: 'toi-co', san: SAN4, demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 2, y: 2, huong: 1 } }, 'wait()\nwait()\n');
  kiem('drone lơ lửng wait() cùng cột đệm, cách 2 ô: không bị dời, không dem-*', vt(kq12b) === '2,2' && !nhip(kq12b).some((n) => n.suKien.some((s) => /^dem-/.test(s.ma))), vt(kq12b) + ' ' + J(nhip(kq12b).map((n) => n.suKien.map((s) => s.ma))));
  // 13 cảm biến: front_clear() trước ô đệm trả False
  const kq13 = chay({ san: SAN4, demTu: [{ x: 2, y: 2, cuc: 'S' }], batDau: { x: 1, y: 2, huong: 1 }, hamGoc: HG.concat(['front_clear']) }, 'if front_clear():\n    ' + MV.replace(/\n/g, '\n    ').trim() + '\n');
  kiem('cảm biến: front_clear() trước ô đệm trả False (đệm là khối), xe không đi', vt(kq13) === '1,2', vt(kq13) + ' ' + J(kq13.loi));
  // 14 đẩy hai nhịp liền: đứng sát đệm cùng cực (cách 1) → nhịp sau ra cách 2 → nhịp sau nữa cách 3 (ra khỏi tầm) rồi yên
  const kq14 = chay({ san: ['.....', '.....', '.....', '.....', '.....'], demTu: [{ x: 2, y: 0, cuc: 'N' }], batDau: { x: 2, y: 1, huong: 1 } }, 'magnet_n()\nwait()\nwait()\nwait()\nwait()\n');
  const ys = nhip(kq14).map((n) => n.robot.y);
  kiem('đẩy liên tiếp: xe sát đệm cùng cực bị đẩy 1 ô mỗi nhịp tới khi ra khỏi tầm (y: 2, 3, 3, 3)', J(ys) === J([2, 3, 3, 3]), J(ys));
  // 15 nhiều sân: demTu mảng song song (lopMauCuaSan cắt đúng)
  const lm = SanHoc.lopMauCuaSan({ san: [SAN4, SAN4], demTu: [[{ x: 1, y: 0, cuc: 'N' }], [{ x: 3, y: 0, cuc: 'S' }]] }, 1);
  kiem('màn nhiều sân: lopMauCuaSan cắt demTu theo sân', J(lm.demTu) === J([{ x: 3, y: 0, cuc: 'S' }]), J(lm.demTu));
  // 16 cham.js: bị đệm kéo vào hố → có lời nhắc đệm từ
  const man16 = Object.assign({}, ManHoc.danhSach ? {} : {}, { ma: 'thu.1', id: 'thu.1', chuong: 'dem-tu-thu', so: 1, ten: 'thử', hang: 'lam-quen', deBai: '', san: ['.....', '..u..', '.....', '.....'], demTu: [{ x: 2, y: 0, cuc: 'S' }], batDau: { x: 0, y: 2, huong: 1 }, loaiRobot: 'banh', hamGoc: HG, mucTieu: 'toi-co', cauTruc: [], moXuong: true, camHamCuaEm: false, khung: { chinh: 10, moiHam: 10 }, maMau: { chinh: [] }, hamCuaEmCan: [], taoHam: [], sao: { o: 5, nhip: 5 }, loiGiai: { chinh: ['magnet_s()', 'wait()'] }, loiSai: [], goiY: [], robot: { than: 'hai-banh', tay: 'nam-cham', camBien: [] } });
  const m16 = ManHoc.chuanHoa ? ManHoc.chuanHoa(man16) : man16;
  const cham = ChamHoc.cham(m16, { chinh: ['left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'] }, []);
  const loiDem = (cham.chanDoan || []).find((c) => c.ma === 'dem-roi-ho');
  kiem('cham.js: xe bị đệm hút vào hố → lời nhắc dem-roi-ho nhắc "đệm từ" và cách bật cùng cực', !cham.thang && !!loiDem && /đệm từ/i.test(loiDem.loi) && /magnet_s/.test(loiDem.loi), J((cham.chanDoan || []).map((c) => c.ma + ': ' + c.loi)));
}

console.log('A2. Công tắc nút đè, đệm kéo vật nằm đất, vật bị đệm giữ (P1b, user 30/10)');
{
  const W2 = 'wait()\nwait()\n';
  const evNhip = (kq, i, ma) => nhip(kq)[i - 1].suKien.filter((s) => s.ma === ma);
  // 1 đệm không công tắc kéo sắt nằm đất: sắt (2,1) cách đệm (4,1) 2 ô → nhịp 1 dời về (3,1), nhịp 2 sát đệm thì nằm im
  const k1 = chay({ san: ['.....', '..o..'], vatChat: ['.....', '..s..'], demTu: [{ x: 4, y: 1, cuc: 'N' }], batDau: { x: 0, y: 0, huong: 1 } }, W2);
  const e1 = evNhip(k1, 1, 'dem-vat')[0];
  kiem('vật: đệm kéo sắt nằm đất 1 ô về phía đệm (dem-vat (2,1) → (3,1)), sát đệm thì nằm im', !!e1 && J(e1.tu) === J({ x: 2, y: 1 }) && J(e1.den) === J({ x: 3, y: 1 }) && e1.kieu === 'hut' && !evNhip(k1, 2, 'dem-vat').length, J(maNhip(k1, 1)) + J(maNhip(k1, 2)));
  // 2 gỗ: không gì
  const k2 = chay({ san: ['.....', '..o..'], vatChat: ['.....', '..g..'], demTu: [{ x: 4, y: 1, cuc: 'N' }], batDau: { x: 0, y: 0, huong: 1 } }, W2);
  kiem('vật: gỗ không bị đệm kéo', !nhip(k2).some((n) => n.suKien.some((s) => s.ma === 'dem-vat')));
  // 3 vật nam châm cùng cực bị đẩy ra xa tới hết tầm, khác cực bị hút
  const k3 = chay({ san: ['.....', '.o...'], vatChat: ['.....', '.N...'], demTu: [{ x: 0, y: 1, cuc: 'N' }], batDau: { x: 4, y: 0, huong: 3 } }, W2 + 'wait()\n');
  const d3 = nhip(k3).flatMap((n) => n.suKien.filter((s) => s.ma === 'dem-vat'));
  kiem('vật: nam châm N cạnh đệm N bị đẩy ra xa 1 ô mỗi nhịp, hết tầm (2 ô) thì dừng ở (3,1)', d3.length === 2 && d3.every((e) => e.kieu === 'day') && J(d3[1].den) === J({ x: 3, y: 1 }), J(d3));
  const k3b = chay({ san: ['.....', '...o.'], vatChat: ['.....', '...S.'], demTu: [{ x: 1, y: 1, cuc: 'N' }], batDau: { x: 4, y: 0, huong: 3 } }, W2);
  kiem('vật: nam châm S cách đệm N 2 ô bị hút về ô sát đệm (2,1)', evNhip(k3b, 1, 'dem-vat').length === 1 && J(evNhip(k3b, 1, 'dem-vat')[0].den) === J({ x: 2, y: 1 }));
  // 4 robot đứng giữa chắn từ
  const k4 = chay({ san: ['.....', '..o..'], vatChat: ['.....', '..s..'], demTu: [{ x: 4, y: 1, cuc: 'N' }], batDau: { x: 3, y: 1, huong: 0 } }, W2);
  kiem('vật: robot đứng giữa vật và đệm thì chắn, vật nằm im', !nhip(k4).some((n) => n.suKien.some((s) => s.ma === 'dem-vat')));
  // 5 công tắc khiDe bat: robot xuất phát trên M, nút bị đè từ cuối nhịp 1 → đệm chạy từ nhịp 2
  const k5 = chay({ san: ['M....', '..o..'], vatChat: ['.....', '..s..'], demTu: [{ x: 4, y: 1, cuc: 'N', nut: { x: 0, y: 0 } }], batDau: { x: 0, y: 0, huong: 1 } }, W2);
  kiem('công tắc: đè nút M ở nhịp 1 thì đệm chạy từ nhịp 2 (dem-vat ở nhịp 2, không ở nhịp 1)', !evNhip(k5, 1, 'dem-vat').length && evNhip(k5, 2, 'dem-vat').length === 1, J(maNhip(k5, 1)) + J(maNhip(k5, 2)));
  const k5b = chay({ san: ['.M...', '..o..'], vatChat: ['.....', '..s..'], demTu: [{ x: 4, y: 1, cuc: 'N', nut: { x: 1, y: 0 } }], batDau: { x: 0, y: 0, huong: 0 } }, W2);
  kiem('công tắc: không ai đè nút thì đệm tắt, không kéo gì', !nhip(k5b).some((n) => n.suKien.some((s) => s.ma === 'dem-vat')));
  const k5c = chay({ san: ['M.....', '..o...'], vatChat: ['......', '..N...'], demTu: [{ x: 1, y: 1, cuc: 'N', nut: { x: 0, y: 0 }, khiDe: 'tat' }], batDau: { x: 0, y: 0, huong: 1 } }, W2 + 'wait()\n');   // còn chạy thì nhịp 2 đẩy tiếp
  kiem('công tắc khiDe tat: chạy khi nút chưa bị đè (nhịp 1 kéo), robot đứng trên nút thì tắt từ nhịp 2', evNhip(k5c, 1, 'dem-vat').length === 1 && !evNhip(k5c, 2, 'dem-vat').length && !evNhip(k5c, 3, 'dem-vat').length, J(nhip(k5c).map((n) => n.suKien.map((s) => s.ma))));
  // 6 đệm tắt không kéo robot (thân xe như sắt)
  const k6 = chay({ san: ['.....', '.....', '.....', 'M....'], demTu: [{ x: 2, y: 0, cuc: 'S', nut: { x: 0, y: 3 } }], batDau: { x: 0, y: 2, huong: 1 } }, MV + MV + MV);
  kiem('công tắc: đệm tắt không kéo robot đi ngang (cuối (3,2), không dem-hut)', vt(k6) === '3,2' && !nhip(k6).some((n) => n.suKien.some((s) => s.ma === 'dem-hut')), vt(k6));
  // 7 vật bị đệm giữ: nam châm của robot không hút được; tắt đệm (khiDe tat, robot đứng trên nút) thì nhịp sau hút được
  const k7 = chay({ san: ['.....', '...o.'], vatChat: ['.....', '...s.'], demTu: [{ x: 4, y: 1, cuc: 'N' }], batDau: { x: 1, y: 1, huong: 1 } }, 'magnet_n()\nwait()\n');
  const giu7 = nhip(k7).some((n) => n.suKien.some((s) => s.ma === 'dem-giu-vat')), hut7 = nhip(k7).some((n) => n.suKien.some((s) => s.ma === 'hut-vat'));
  kiem('giữ: sắt sát đệm đang chạy thì nam châm xe không hút được (dem-giu-vat, không hut-vat)', LOI_GIA ? hut7 : giu7 && !hut7, J(nhip(k7).map((n) => n.suKien.map((s) => s.ma))));
  const k7b = chay({ san: ['.....', '.M.o.'], vatChat: ['.....', '...s.'], demTu: [{ x: 4, y: 1, cuc: 'N', nut: { x: 1, y: 1 }, khiDe: 'tat' }], batDau: { x: 1, y: 1, huong: 1 } }, 'magnet_n()\nwait()\nwait()\n');
  const ev7b = nhip(k7b).map((n) => n.suKien.map((s) => s.ma));
  kiem('giữ: đứng trên nút tắt đệm thì nhịp sau nam châm hút được sắt (dem-giu-vat nhịp 1, hut-vat sau đó)', ev7b[0].includes('dem-giu-vat') && ev7b.slice(1).some((a) => a.includes('hut-vat')), J(ev7b));
  // 8 chấm: lời tiếng Việt cho dem-giu-vat
  const mm = ManHoc.chuanHoa({ ma: 'thu-dem-giu', ten: 'thử', chuong: 'thu', so: 1, loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'nam-cham' }, hamGoc: HG, san: ['.....', '...o.', '....F'], vatChat: ['.....', '...s.', '.....'],
    demTu: [{ x: 4, y: 1, cuc: 'N' }], batDau: { x: 1, y: 1, huong: 1 }, maMau: { chinh: ['magnet_n()', 'wait()'] }, loiGiai: { chinh: ['magnet_n()', 'wait()'] }, loiSai: [], sao: { o: 1, nhip: 1 } });
  const kc8 = ChamHoc.cham(mm, { chinh: ['magnet_n()', 'wait()'] }, []);
  const cd8 = (kc8.chanDoan || []).find((c) => c.ma === 'dem-giu-vat');
  kiem('chấm: có lời dem-giu-vat nói tắt đệm trước', !!cd8 && /Tắt đệm/.test(cd8.loi), J((kc8.chanDoan || []).map((c) => c.ma)) + J(kc8.loi));
  // 9 cấu hình sai
  let nem = 0;
  try { chay({ san: ['.....'], demTu: [{ x: 4, y: 0, cuc: 'N', nut: { x: 1, y: 0 } }], batDau: { x: 0, y: 0, huong: 1 } }, 'wait()\n'); } catch (e) { nem++; }
  try { chay({ san: ['.M...'], demTu: [{ x: 4, y: 0, cuc: 'N', nut: { x: 1, y: 0 }, khiDe: 'lat' }], batDau: { x: 0, y: 0, huong: 1 } }, 'wait()\n'); } catch (e) { nem++; }
  try { chay({ san: ['.....'], demTu: [{ x: 4, y: 0, cuc: 'N', khiDe: 'tat' }], batDau: { x: 0, y: 0, huong: 1 } }, 'wait()\n'); } catch (e) { nem++; }
  kiem('cấu hình: nut không phải M / khiDe lạ / khiDe không có nut → ném lỗi', nem === 3, nem);
}

console.log('B. Kho màn mẫu đệm từ (mau-dem-tu-thu.js, không đăng ký lộ trình; kho hàm = học sinh đã chơi hết chương tham-so mùa 2)');
{
  const DS = require(path.join(day, 'mau-dem-tu-thu.js')).manDemTuThu || [];
  kiem('kho mẫu có 5–6 màn, so 1.., mỗi màn có demTu, xe hai bánh tay nam châm', DS.length >= 5 && DS.length <= 6 && DS.every((m, i) => m.so === i + 1 && Array.isArray(m.demTu) && m.demTu.length > 0 && m.loaiRobot === 'banh' && m.robot.tay === 'nam-cham'), DS.length);
  kiem('kho mẫu KHÔNG nằm trong lộ trình (P1 mùa 3: màn thật của đệm từ làm ở P2 gói 4 Bãi từ)', !TT.goi.some((g) => g.ma === 'dem-tu-thu') && !tatCa.some((m) => m.chuong === 'dem-tu-thu'));
  const khoSauThamSo = khoSauChuong('tham-so');
  DS.forEach((m) => {
    const kho = khoSauThamSo;
    const kq = ChamHoc.cham(m, m.loiGiai, kho);
    kiem('màn ' + m.so + ' "' + m.ten + '": lời giải thắng 3 sao (' + (kq.nhip || '?') + ' nhịp)', kq.thang && kq.sao === 3, J({ thang: kq.thang, sao: kq.sao, loi: kq.loi, cd: (kq.chanDoan || []).map((c) => c.ma) }));
    if (m.so === 1) {
      const km = ChamHoc.cham(m, m.maMau, kho);
      kiem('màn 1 trình diễn: mã mẫu bấm Chạy là thắng 3 sao', km.thang && km.sao === 3, J({ thang: km.thang, sao: km.sao }));
    }
    if (m.loiGiaiKhac) {
      const kk = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, kho);
      kiem('màn ' + m.so + ' lời khác (' + m.loiGiaiKhac.moTa + '): ' + (m.loiGiaiKhac.sao !== undefined ? 'thắng ' + m.loiGiaiKhac.sao + ' sao' : 'thắng'), kk.thang && (m.loiGiaiKhac.sao === undefined || kk.sao === m.loiGiaiKhac.sao), J({ thang: kk.thang, sao: kk.sao }));
    }
    (m.loiSai || []).forEach((ls, i) => {
      const ks = ChamHoc.cham(m, ls.baiLam, kho);
      const ma = (ks.chanDoan || []).map((c) => c.ma);
      const du = (ls.phaiCoMa || []).every((x) => ma.includes(x) || (ks.loi && ks.loi.loai === x));
      kiem('màn ' + m.so + ' lời sai ' + (i + 1) + ' (' + ls.moTa + '): không thắng' + (ls.phaiCoMa ? ', có ' + ls.phaiCoMa.join('+') : ''), !ks.thang && du, J({ thang: ks.thang, ma, loi: ks.loi }));
    });
    if (m.so > 1) { const km2 = ChamHoc.cham(m, m.maMau, kho); kiem('màn ' + m.so + ' mã mẫu chưa thắng (phải sửa mới thắng)', !km2.thang, J({ thang: km2.thang })); }
    kiem('màn ' + m.so + ': có lời sai và gợi ý', (m.loiSai || []).length >= 1 && (m.goiY || []).length >= 1);
  });
}

console.log('\n' + (hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) : 'Đạt ' + dat + ' / ' + dat) + (LOI_GIA ? ' (--loi-gia: phải HỎNG)' : ''));
process.exit(hong ? 1 : 0);

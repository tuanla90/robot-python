/* ============================================================================
   kiem-che-cam-bien.mjs — máy kiểm chương `che-cam-bien` (Chế lệnh có if, while + BIẾN ĐẾM) của "Đường học" (KE-HOACH-CHE-LENH.md, mục 5.3).
   Gồm:
   - daoChieu 'cam' (cảm biến khoảng cách lắp ngược): front_clear() / left_clear() / right_clear() trả NGƯỢC, đọc vẫn không tốn nhịp, lỗi cấu hình, chẩn đoán cam-bien-nguoc;
     front_clear() coi vật nằm đất là chắn (luật vật chiếm ô);
   - BIẾN ĐẾM: lõi hiểu `n = 0`, `n = n + 1`, `n += 1`, `for i in range(n)`; khung-code chặn biến ở màn chưa dạy (khung.chanBien → cau-truc-chua-hoc 'bien'); khối trên khay và dòng
     `n = 0` / `n = n + 1` vẽ được (thanh-phan.js nạp với một "document" giả);
   - 10 màn: lời giải 3 sao trên MỌI sân (cả kho thật lẫn kho cổ điển), BFS nhịp (do-duong-che-cam-bien.mjs), mọi congThucKhac thắng, loiGiaiKhac đúng 2 sao, loiSai đúng mã
     (kể cả vòng lặp vô hạn), sao nhịp theo tổng ba sân, chinhCoDinh, chanBien, gioiHanHam, không dùng hàm của che-tay / che-lap;
   - luật riêng từng màn (cứng số bước chỉ đúng một sân, ◆ ở màn 5, vật mờ ở 9 và 10, hàm của màn hỏng ở 8…), Sổ lệnh, thẻ script của game/choi.html.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs.
   Chạy: node robotics/hoc/kiem-che-cam-bien.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
const SoLenh = require(path.join(day, 'so-lenh.js'));
for (const f of ['man-chuoi-2', 'man-che-xe', 'man-tay-gap', 'man-che-tay', 'man-vong-lap', 'man-che-lap', 'man-bang-chuyen', 'man-tham-so', 'man-nhen', 'man-xich', 'man-omni', 'man-tam-day', 'man-khoang-cach', 'man-che-cam-bien', 'man-robot-hoan-thien', 'man-mau', 'man-nam-cham', 'man-may-nem', 'man-sung-bong']) require(path.join(day, f + '.js'));
const ManHoc = require(path.join(day, 'man-drone.js'));
const { nhipCheCamBienSan, nhipCheCamBienTatCa, manCuaSan, soSan } = await import('./do-duong-che-cam-bien.mjs');

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
const vt = (r) => r.x + ',' + r.y;
const tatCa = ManHoc.danhSach;
const che = tatCa.filter((m) => m.chuong === 'che-cam-bien');
const man = (so) => ManHoc.timMa('che-cam-bien.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];

/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước). coDien: kho "cổ điển" của kiem-hoc.mjs — không nhận các bản SỬA hàm cũ của che-xe (u_turn một nhịp, turn_right / turn_left bằng bánh lùi). */
function khoTruoc(id, coDien) {
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  for (const m of tatCa) {
    if (m.id === id) break;
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi) {
      if (coDien && m.chuong === 'che-xe' && kho.tim(h.ten)) continue;
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

const BANH_DU = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const BA_CAM = ['front_clear', 'left_clear', 'right_clear'];
const L = (...d) => d.join('\n') + '\n';
const chay = (rows, bd, code, extra) => SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: BANH_DU.concat(BA_CAM) }, extra || {}), code);

/* ================================================================= 1. CẢM BIẾN LẮP NGƯỢC (lõi) */
console.log('\n== 1. daoChieu "cam": cảm biến khoảng cách trả ngược ==');
{
  const PHONG = ['#####', '#...#', '#...#', '#...#', '#####'];
  const bd = { x: 2, y: 3, huong: 0 };
  // dòng nào của chương trình trả True / False ghi vào vết bằng docCamBien; dùng if để quan sát kết quả bằng chuyển động của xe
  const hoi = (ham, rows, bdx, dao) => {
    const kq = chay(rows, bdx, 'if ' + ham + '():\n    left_move()\n    right_move()\n    wait()\n', dao ? { daoChieu: dao } : {});
    return { trave: nhipVet(kq).length === 1, kq };                                                 // đi được một ô = hàm trả True
  };
  const TRONG_TRUOC = ['.....', '.....', '.....', '.....', '.....'];
  kiem('không đảo: front_clear() True khi ô trước mặt trống; đảo ["cam"]: thành False (xe đứng yên)', hoi('front_clear', TRONG_TRUOC, bd, null).trave === true && hoi('front_clear', TRONG_TRUOC, bd, ['cam']).trave === false);
  const CHAN_TRUOC = ['.....', '.....', '..#..', '.....', '.....'];
  kiem('đảo ["cam"]: ô trước mặt là tường thì front_clear() trả True (xe đi vào tường: đứng yên, vẫn mất một nhịp), không đảo thì False', hoi('front_clear', CHAN_TRUOC, { x: 2, y: 3, huong: 0 }, ['cam']).kq.suKien.some((e) => e.ma === 'dam-tuong') && hoi('front_clear', CHAN_TRUOC, { x: 2, y: 3, huong: 0 }, null).trave === false);
  // trái / phải: xe ở (2,2) quay lên; bên trái (1,2) là tường, bên phải (3,2) trống
  const BEN = ['.....', '.....', '.#...', '.....', '.....'];
  const bBen = { x: 2, y: 2, huong: 0 };
  const dh = (ham, dao) => nhipVet(chay(BEN, bBen, 'if ' + ham + '():\n    left_move()\n    right_move()\n    wait()\n', dao ? { daoChieu: dao } : {})).length === 1;
  kiem('left_clear() và right_clear() cũng trả ngược: không đảo (trái False, phải True), đảo (trái True, phải False)',
    dh('left_clear', null) === false && dh('right_clear', null) === true && dh('left_clear', ['cam']) === true && dh('right_clear', ['cam']) === false);
  kiem('luật vật chiếm ô: front_clear() coi vật nằm đất là chắn (False), kể cả không có tay kẹp; đảo ["cam"] thì True',
    hoi('front_clear', ['.....', '.....', '..o..', '.....', '.....'], { x: 2, y: 3, huong: 0 }, null).trave === false && hoi('front_clear', ['.....', '.....', '..o..', '.....', '.....'], { x: 2, y: 3, huong: 0 }, ['cam']).kq.suKien.some((e) => e.ma === 'dam-tuong'));
  const doc = chay(CHAN_TRUOC, { x: 2, y: 3, huong: 0 }, 'x = front_clear()\n', { daoChieu: ['cam'] });
  const mDoc = doc.vet.find((e) => e.loai === 'lenh');
  kiem('mục lệnh đọc cảm biến có docCamBien { trong: giá trị TRẢ VỀ (đã đảo), thuc: ô thật sự trống hay không, daoNguoc: true }; đọc không tốn nhịp (nhip 0)', !!mDoc && mDoc.docCamBien.trong === true && mDoc.docCamBien.thuc === false && mDoc.docCamBien.daoNguoc === true && doc.nhip === 0 && mDoc.docCamBien.o.x === 2 && mDoc.docCamBien.o.y === 2, J(mDoc));
  const khongDao = chay(CHAN_TRUOC, { x: 2, y: 3, huong: 0 }, 'x = front_clear()\n');
  kiem('không đảo thì docCamBien không có thuc / daoNguoc (giữ nguyên như chương khoang-cach)', khongDao.vet.find((e) => e.loai === 'lenh').docCamBien.thuc === undefined && khongDao.vet.find((e) => e.loai === 'lenh').docCamBien.daoNguoc === undefined);
  kiem('đảo ["cam"] đi chung ["trai"]: cả hai cùng có tác dụng (cảm biến ngược và bánh trái ngược)',
    (() => { const k = chay(TRONG_TRUOC, bd, 'if front_clear():\n    left_move()\n    wait()\n', { daoChieu: ['cam', 'trai'] }); const k2 = chay(TRONG_TRUOC, bd, 'if not front_clear():\n    left_move()\n    wait()\n', { daoChieu: ['cam', 'trai'] }); return k.nhip === 0 && k2.nhip === 1 && k2.robot.huong === 3; })());
  const nem = (f) => { try { f(); return false; } catch (e) { return /daoChieu/.test(e.message); } };
  kiem('cấu hình sai: daoChieu "cam" khi hamGoc không có cảm biến khoảng cách; tên lạ; nhện', nem(() => chay(TRONG_TRUOC, bd, '', { daoChieu: ['cam'], hamGoc: BANH_DU })) && nem(() => chay(TRONG_TRUOC, bd, '', { daoChieu: ['giua'] })) && nem(() => SanHoc.chay({ san: TRONG_TRUOC, batDau: bd, loaiRobot: 'nhen', daoChieu: ['cam'], hamGoc: ['go_up', 'wait'] }, '')));
  // bộ dò đường: daoChieu 'cam' không đổi gì vật lý
  kiem('bộ dò do-duong-che-cam-bien: daoChieu "cam" không đổi nhịp ngắn nhất (cảm biến chỉ giúp chương trình quyết định)', nhipCheCamBienTatCa(man(7)) === nhipCheCamBienTatCa(Object.assign({}, man(7), { daoChieu: [] })));
}

/* ================================================================= 2. CHẨN ĐOÁN cam-bien-nguoc */
console.log('\n== 2. Chẩn đoán cam-bien-nguoc ==');
{
  const m7 = man(7), k7 = khoTruoc(m7.id);
  const cu = ChamHoc.cham(m7, m7.loiSai[0].baiLam, tron(k7, m7.loiSai[0].hamCuaEmMoi));
  const cd = cu.chanDoan.find((c) => c.ma === 'cam-bien-nguoc');
  kiem('safe_move() cũ với cảm biến ngược: có cam-bien-nguoc, mức thông tin (không phải lỗi), kể lần hỏi đầu tiên bằng lời ("ô trước mặt đang trống mà front_clear() lại trả về False")',
    !!cd && cd.muc === 'thong-tin' && /ô trước mặt đang trống mà front_clear\(\) lại trả về False/.test(cd.loi) && cd.thuc === true && cd.traVe === false && cd.ten === 'front_clear', J(cd));
  kiem('cam-bien-nguoc nêu dòng đã hỏi (cho trỏ vào hàm của em safe_move2, dòng 1) và chỉ ghi MỘT lần cho mỗi sân', J(cd.cho) === J({ cot: 'hamEm', dong: 1, ten: 'safe_move2' }) && cu.theoSan.every((s) => s.chanDoan.filter((c) => c.ma === 'cam-bien-nguoc').length <= 1));
  const thang = ChamHoc.cham(m7, m7.loiGiai, tron(k7, m7.loiGiai.hamCuaEmMoi));
  kiem('lời giải đúng (thắng): không có cam-bien-nguoc nào', thang.thang && !maCua(thang).includes('cam-bien-nguoc') && thang.chanDoan.length === 0);
  const chuaHoi = ChamHoc.cham(m7, m7.loiSai[3].baiLam, k7);
  kiem('chưa chế hàm (không hề hỏi cảm biến): chỉ ham-chua-co, không có cam-bien-nguoc', J(maCua(chuaHoi)) === '["ham-chua-co"]');
  const thu = ChamHoc.thuHam(m7, { chinh: [] }, 'safe_move', k7);
  kiem('sân thử trong Xưởng: thử safe_move() cũ cũng nói cảm biến lắp ngược (xe ở giữa sân trống: trước mặt trống mà trả False), nhưng KHÔNG tô đỏ dòng nào (cho null: code có thể đã đúng)', maCua(thu).includes('cam-bien-nguoc') && thu.robot.y === 2 && thu.robot.x === 2 && thu.chanDoan.find((c) => c.ma === 'cam-bien-nguoc').cho === null, J(thu.chanDoan));
  kiem('màn khác (không đảo "cam") không bao giờ có cam-bien-nguoc, kể cả sân thử', !maCua(ChamHoc.thuHam(man(1), { chinh: [] }, 'move', khoTruoc(man(1).id))).includes('cam-bien-nguoc') && !maCua(ChamHoc.cham(man(1), man(1).loiSai[1].baiLam, tron(khoTruoc(man(1).id), man(1).loiSai[1].hamCuaEmMoi))).includes('cam-bien-nguoc'));
}

/* ================================================================= 3. BIẾN ĐẾM */
console.log('\n== 3. Biến đếm: lõi, khung chặn biến, khối trên khay ==');
{
  const HANH = ['###', '#.#', '#.#', '#.#', '#.#'];
  const bd = { x: 1, y: 4, huong: 0 };
  const TIEN = L('left_move()', 'right_move()', 'wait()'), LUI = L('left_back()', 'right_back()', 'wait()');
  const dem = chay(HANH, bd, L('n = 0', 'while front_clear():', '    left_move()', '    right_move()', '    wait()', '    n = n + 1', 'for i in range(n):', '    left_back()', '    right_back()', '    wait()'));
  kiem('lõi: n = 0, n = n + 1 trong while, for i in range(n) với n là biến: đi 3 ô rồi lùi đúng 3 ô (6 nhịp, về chỗ cũ)', dem.nhip === 6 && vt(dem.robot) === '1,4' && !dem.loi, J([dem.nhip, dem.robot, dem.loi]));
  const tang = chay(HANH, bd, L('n = 0', 'while front_clear():', '    left_move()', '    right_move()', '    wait()', '    n += 1', 'for i in range(n):', '    left_back()', '    right_back()', '    wait()'));
  kiem('lõi: n += 1 cũng đếm được (người viết tay Python vẫn đúng)', tang.nhip === 6 && vt(tang.robot) === '1,4');
  const chuaGan = chay(HANH, bd, L('for i in range(n):', '    wait()'));
  kiem('dùng n khi chưa gán: lỗi chạy tiếng Việt "Chưa có biến tên n" (không dùng lời "hàm")', chuaGan.loi && /^Chưa có biến tên "n"/.test(chuaGan.loi.thongDiep));
  const kho = [];
  const manThu = (extra) => Object.assign({ chuong: 'thu', loaiRobot: 'banh', hamGoc: BANH_DU.concat(['front_clear']), moXuong: true, camHamCuaEm: false, khung: { chinh: 10, moiHam: 10 }, cauTruc: ['for', 'if', 'while'], san: HANH, batDau: bd }, extra || {});
  const chanBien = manThu({ khung: { chinh: 10, moiHam: 10, chanBien: true, cauTruc: ['for', 'if', 'while'] } });
  const cb = (chinh, hamCuaMan) => ChamHoc.cham(chanBien, { chinh, hamCuaMan: hamCuaMan || [] }, kho);
  const mauChan = (code) => { const r = cb(code); return J(maCua(r)) === '["cau-truc-chua-hoc"]' && r.chanDoan[0].cauTruc === 'bien'; };
  kiem('khung.chanBien: gán biến trong chương trình bị báo cau-truc-chua-hoc (cauTruc "bien"): n = 0, n = n + 1, n += 1, c = front_clear()',
    mauChan(['n = 0']) && mauChan(['n = 0', 'n = n + 1']) && mauChan(['n = 0', 'n += 1']) && mauChan(['c = front_clear()', 'if c:', '    left_move()', '    right_move()', '    wait()']));
  kiem('khung.chanBien: for i in range(n) với n là biến cũng bị chặn; for i in range(3) (số) thì không', mauChan(['for i in range(n):', '    wait()']) && !maCua(cb(['for i in range(3):', '    wait()'])).includes('cau-truc-chua-hoc'));
  const rc = cb(['n = 0']);
  kiem('lời báo cau-truc-chua-hoc nêu dòng và chữ "biến đếm", cho trỏ vào chương trình dòng 1', /biến đếm/.test(rc.chanDoan[0].loi) && J(rc.chanDoan[0].cho || { cot: rc.chanDoan[0].cot, dong: rc.chanDoan[0].dong }) === J({ cot: 'chinh', dong: 1 }), J(rc.chanDoan));
  kiem('chanBien không chặn so sánh (if n == ...) hay chú thích; hàm của màn cũng bị kiểm',
    KhungCode.kiemTra(chanBien.khung, { chinh: ['if front_clear():', '    wait()', '# n = 0'] }, [], []).length === 0 &&
      KhungCode.kiemTra(chanBien.khung, { chinh: [], hamCuaMan: [H('f', ['n = 0'])] }, [], []).some((e) => e.ma === 'cau-truc-chua-hoc' && e.cot === 'hamMan' && e.ten === 'f'));
  kiem('hàm CỦA EM không bị kiểm biến (như for / if: kho dùng ở mọi màn)', KhungCode.kiemTra(chanBien.khung, { chinh: ['f()'] }, [], [H('f', ['n = 0', 'for i in range(n):', '    wait()'])]).length === 0);
  const khongChan = ChamHoc.cham(manThu(), { chinh: ['n = 0'] }, kho);
  kiem('màn không đặt chanBien (mọi chương cũ, và màn 5–10 của chương này) thì gán biến tự do (không có cau-truc-chua-hoc)', !maCua(khongChan).includes('cau-truc-chua-hoc') && !maCua(ChamHoc.cham(manThu(), { chinh: ['n = 0', 'for i in range(n):', '    wait()'] }, kho)).includes('cau-truc-chua-hoc'));
  kiem('man.bienDem: có ở màn 5–10, không có ở màn 1–4; khung.chanBien ngược lại (đúng một trong hai ở mỗi màn)',
    che.every((m) => (m.so >= 5) === (m.bienDem === true) && (m.so < 5) === (m.khung.chanBien === true) && (m.bienDem === true) !== (m.khung.chanBien === true)));
  kiem('màn nào chặn biến thì lời giải, lời giải khác, bài mẫu và công thức khác (chương trình + hàm của màn) không dùng biến; hàm của em tự do',
    che.filter((m) => m.khung.chanBien).every((m) => [m.maMau, m.loiGiai, m.loiGiaiKhac.baiLam].concat((m.congThucKhac || []).map((c) => c.baiLam).filter(Boolean)).every((b) => KhungCode.kiemTra(m.khung, b, [], []).length === 0)));

  // giao diện: thanh-phan.js nạp với "document" giả để thử các hàm chữ thuần túy; kiểm mã nguồn khay / Xưởng có truyền bienDem
  global.window = global;
  global.document = { addEventListener() {}, getElementById() { return null; }, body: { classList: { add() {}, remove() {} } }, createElement() { return { style: {}, classList: { add() {}, remove() {}, toggle() {} }, appendChild() {}, setAttribute() {}, addEventListener() {}, querySelector() { return null; } }; } };
  let TP = null, loiNap = '';
  try { require(path.join(day, 'game', 'thanh-phan.js')); TP = global.window.TP; } catch (e) { loiNap = e.message; }
  kiem('thanh-phan.js nạp được (document giả) để thử hàm vẽ dòng', !!TP && typeof TP.mauDong === 'function', loiNap);
  if (TP) {
    const md = (s) => TP.mauDong(s);
    kiem('vẽ dòng `n = 0`: tên biến (vr dem), dấu =, số là chữ thường (lit) KHÔNG phải ô chạm được (.num)', /class="vr dem">n<\/span>/.test(md('n = 0')) && /class="lit">0</.test(md('n = 0')) && !/class="num/.test(md('n = 0')));
    kiem('vẽ dòng `n = n + 1`: hai chữ n, dấu + và số 1; vẽ cả khi thụt lề', /class="vr dem">n<\/span>.*class="vr dem">n<\/span>.*\+.*class="lit">1</.test(md('n = n + 1')) && md('    n = n + 1') === md('n = n + 1'));
    kiem('`n = m + 1` (hai biến khác nhau) và `n = 0 # ghi chú` không bị vẽ nhầm thành biến đếm (hiện nguyên chữ)', !/dem/.test(md('n = m + 1')) && !/dem/.test(md('n = 0 # ghi chú')));
    kiem('dòng `for i in range(n):` vẽ ô biến chạm được (.num.bien, data-bien "n"); tachDoiSo ra một đối số n; thayDoiSo đổi sang số 3 và đổi ngược lại',
      /num bien" data-k="0" data-so="0" data-bien="n"/.test(md('for i in range(n):')) && J(TP.tachDoiSo('for i in range(n):').ds) === '["n"]' && TP.thayDoiSo('for i in range(n):', 0, 3) === 'for i in range(3):' && TP.thayDoiSo('for i in range(3):', 0, 'n') === 'for i in range(n):');
  }
  const nguon = (f) => fs.readFileSync(path.join(day, 'game', f), 'utf8');
  kiem('khay có nhóm ĐẾM (thanh-phan.js: nhomDem / gachDem, chu.js: choi.nhom.dem = "ĐẾM"); khay màn chơi (man-choi.js) và khay Xưởng (xuong-ham.js) đều truyền bienDem từ man.bienDem; chưa có bienDem thì không có nhóm',
    /function nhomDem\(\)/.test(nguon('thanh-phan.js')) && /if \(!spec\.bienDem\) return;/.test(nguon('thanh-phan.js')) && /'choi\.nhom\.dem': 'ĐẾM'/.test(nguon('chu.js')) && /bienDem: !!m\.bienDem/.test(nguon('man-choi.js')) && /bienDem: !!man\.bienDem/.test(nguon('xuong-ham.js')));
  kiem('khối trên khay chèn đúng ba dòng: n = 0, n = n + 1, for i in range(n):', ['n = 0', 'n = n + 1', 'for i in range(n):'].every((g) => nguon('thanh-phan.js').includes("gachDem('" + g + "'")));
}

/* ================================================================= 4. MƯỜI MÀN CHE-CAM-BIEN: dữ liệu */
console.log('\n== 4. Chương che-cam-bien: dữ liệu ==');
{
  const soChuong = ManHoc.chuong().findIndex((c) => c.ma === 'che-cam-bien') + 1;
  kiem('đúng 10 màn, số 1..10, id ' + soChuong + '.1…, mã che-cam-bien.1…; chương nằm ngay sau khoang-cach trong thứ tự, tên "Chế lệnh có if, while", đợt 1',
    che.length === 10 && che.every((m, i) => m.so === i + 1 && m.id === soChuong + '.' + (i + 1) && m.ma === 'che-cam-bien.' + (i + 1)) && ThuTu.thuTu.indexOf('che-cam-bien') === ThuTu.thuTu.indexOf('khoang-cach') + 1 && ThuTu.ten['che-cam-bien'] === 'Chế lệnh có if, while' && !ThuTu.laDot2('che-cam-bien'));
  kiem('tên các màn: Đi cẩn thận, Tìm lối mở, Mê cung nhỏ, Cửa hông, Đi rồi về, Bám tường, Cảm biến lắp ngược, Sửa hàm lỗi, Lấy rồi về, Kho hàng; hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu che-cam-bien',
    J(che.map((m) => m.ten)) === J(['Đi cẩn thận', 'Tìm lối mở', 'Mê cung nhỏ', 'Cửa hông', 'Đi rồi về', 'Bám tường', 'Cảm biến lắp ngược', 'Sửa hàm lỗi', 'Lấy rồi về', 'Kho hàng']) &&
      J(che.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && che.every((m) => !!m.huyHieu === (m.so === 10)) && che[9].huyHieu.ma === 'che-cam-bien' && che[9].huyHieu.ten === 'Huy hiệu Chế lệnh cảm biến');
  kiem('lệnh chế ở từng màn (taoHam): safe_move, face_open, —, to_gap, bounce, follow_right, safe_move2, —, fetch_back, —; không màn nào sửa hàm cũ',
    J(che.map((m) => m.taoHam)) === J([['safe_move'], ['face_open'], [], ['to_gap'], ['bounce'], ['follow_right'], ['safe_move2'], [], ['fetch_back'], []]) &&
      che.every((m) => m.loiGiai.hamCuaEmMoi.every((h) => m.taoHam.includes(h.ten))));
  kiem('xe hai bánh (loaiRobot banh), robot { than "hai-banh", tay null (1–8) | "kep" (9, 10), camBien [khoang-cach ở hông] }, Xưởng mở, được dùng hàm của em, chương trình 10 ô, mỗi hàm 10 ô, cauTruc ["for","if","while"] cả ở khung',
    che.every((m) => m.loaiRobot === 'banh' && m.robot.than === 'hai-banh' && m.robot.tay === (m.so >= 9 ? 'kep' : null) && J(m.robot.camBien) === '[{"ma":"khoang-cach","o":"hong"}]' && m.moXuong === true && m.camHamCuaEm === false && m.khung.chinh === 10 && m.khung.moiHam === 10 && J(m.cauTruc) === '["for","if","while"]' && J(m.khung.cauTruc) === J(m.cauTruc)));
  kiem('khay: bánh đủ (kể cả hai lệnh lùi) + cảm biến: front_clear (1, 2, 3, 5, 7, 9), front_clear + right_clear (4, 6, 10), cả ba (8); tay kẹp (arm_down, arm_up, grab, release) chỉ ở 9 và 10',
    che.every((m) => {
      const cam = [1, 2, 3, 5, 7, 9].includes(m.so) ? ['front_clear'] : [4, 6, 10].includes(m.so) ? ['front_clear', 'right_clear'] : BA_CAM;
      return J(m.hamGoc) === J(BANH_DU.concat(m.so >= 9 ? ['arm_down', 'arm_up', 'grab', 'release'] : [], cam));
    }));
  kiem('mọi màn là MẢNG 3 sân cùng khung, batDau song song, bongMo song song (màn bóng mờ), nhipTheo "tong" (sao nhịp = TỔNG nhịp ba sân)',
    che.every((m) => Array.isArray(m.san[0]) && m.san.length === 3 && m.san.every((s) => s.length === m.san[0].length && s.every((r) => r.length === m.san[0][0].length)) && Array.isArray(m.batDau) && m.batDau.length === 3 && m.nhipTheo === 'tong' &&
      (m.mucTieu === 'bong-mo' ? Array.isArray(m.bongMo) && m.bongMo.length === 3 : m.bongMo === undefined)));
  kiem('mục tiêu: bóng mờ ở 1, 2, 4, 5, 7, 9, 10; tới cờ (có chữ F ở cả ba sân) ở 3, 6, 8; sân tối đa 7×7',
    che.every((m) => (m.mucTieu === 'bong-mo') === ![3, 6, 8].includes(m.so) && ([3, 6, 8].includes(m.so) ? m.mucTieu === undefined && m.san.every((s) => s.join('').includes('F')) : true)) && che.every((m) => m.san.every((s) => s.length <= 7 && s[0].length <= 7)));
  kiem('chinhCoDinh ở mọi màn trừ 3 và 10 (người chơi tự viết chương trình chính); khoaHamMan không dùng (hàm của màn 8 sửa được)',
    che.every((m) => (m.chinhCoDinh === true) === ![3, 10].includes(m.so) && m.khoaHamMan === undefined));
  kiem('canhBao và daoChieu chỉ ở màn 7: daoChieu ["cam"], canhBao "Cảm biến lắp ngược"; không màn nào khai phanCung hẹp',
    che.every((m) => (m.so === 7) === (m.daoChieu !== undefined && m.canhBao !== undefined)) && J(man(7).daoChieu) === '["cam"]' && man(7).canhBao === 'Cảm biến lắp ngược' && che.every((m) => m.phanCung === undefined));
  kiem('chỉ trùm khai gioiHanHam (3), huyHieu', che.every((m) => (m.gioiHanHam !== undefined) === (m.so === 10)) && man(10).gioiHanHam === 3);
  // chương này chỉ dùng hàm của chương 2–4, 6, 8: không nhắc tới hàm của che-tay / che-lap
  const cam = new Set(tatCa.filter((m) => m.chuong === 'che-tay' || m.chuong === 'che-lap').flatMap((m) => m.taoHam));
  const dungTen = (b) => (b ? [].concat(b.chinh || [], (b.hamCuaMan || []).flatMap((h) => h.than)) : []).concat((b && b.hamCuaEmMoi) ? [].concat(...b.hamCuaEmMoi.map((h) => h.than)) : []);
  const tatCaCode = (m) => [m.maMau, m.loiGiai, m.loiGiaiKhac, ...(m.congThucKhac || []), ...m.loiSai].flatMap((x) => [x, { chinh: [], hamCuaMan: [], hamCuaEmMoi: [] }]).flatMap((x) => dungTen(x));
  const nhacTen = che.filter((m) => tatCaCode(m).some((s) => [...cam].some((t) => new RegExp('\\b' + t + '\\(').test(s)))).map((m) => m.id);
  kiem('không màn nào gọi hàm của che-tay / che-lap (' + [...cam].join(', ') + ') trong bài mẫu, lời giải, công thức khác hay lời sai', nhacTen.length === 0 && che.every((m) => m.hamCuaEmCan.every((t) => !cam.has(t))), nhacTen.join());
  const cho = new Set(['move', 'turn_right', 'turn_left', 'u_turn', 'corner', 'stair', 'two', 'dodge_right', 'dodge_left', 'back', 'park', 'come_back', 'fixed_move', 'pick', 'drop', 'carry', 'side', 'row', 'bend_left', 'bend_right', 'go_wall'].concat(che.flatMap((m) => m.taoHam)));
  kiem('hamCuaEmCan chỉ gồm hàm của chương 2, 3, 4, 6, 8 và hàm chế trong chính chương này', che.every((m) => m.hamCuaEmCan.every((t) => cho.has(t))), J(che.map((m) => m.hamCuaEmCan.filter((t) => !cho.has(t)))));
}

/* ================================================================= 5. TỪNG MÀN */
console.log('\n== 5. Từng màn: lời giải 3 sao trên mọi sân, BFS, công thức khác, lời sai ==');
const FAIL = new Set(['lech-bong-mo', 'chua-qua-diem', 'chua-toi-co', 'chua-dua-vat', 'vong-vo-han', 'ham-chua-co', 'lenh-chua-mo', 'tran-khung', 'loi-cu-phap', 'loi-thut-le', 'qua-gioi-han-ham', 'loi-chay', 'cau-truc-chua-hoc', 'qua-nhieu-nhip']);
{
  for (const m of che) {
    const kho = khoTruoc(m.id), khoCo = khoTruoc(m.id, true);
    const khoNay = tron(kho, m.loiGiai.hamCuaEmMoi), khoCoNay = tron(khoCo, m.loiGiai.hamCuaEmMoi);
    const r = ChamHoc.cham(m, m.loiGiai, khoNay);
    kiem(m.id + ' ' + m.ten + ': lời giải thắng 3 sao trên CẢ BA sân, ' + r.soO + ' ô = sao.o, ' + r.soNhip + ' nhịp = sao.nhip, không chẩn đoán nào',
      r.thang && r.theoSan.length === 3 && r.theoSan.every((s) => s.thang) && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, theoSan: r.theoSan.map((s) => s.thang), sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    const rc = ChamHoc.cham(m, m.loiGiai, khoCoNay);
    kiem(m.id + ': kho cổ điển (u_turn hai nhịp, chưa có bản sửa của che-xe) cho đúng kết quả y hệt: lời giải không phụ thuộc u_turn', rc.thang && rc.sao === 3 && rc.soO === r.soO && rc.soNhip === r.soNhip, J({ sao: rc.sao, soO: rc.soO, soNhip: rc.soNhip }));
    kiem(m.id + ': sao nhịp theo tổng ba sân (nhipTong ' + r.nhipTong + ' = ' + r.theoSan.map((s) => s.soNhip).join(' + ') + ') = soNhip; nhipMax là sân dài nhất', r.nhipTong === r.theoSan.reduce((a, s) => a + s.soNhip, 0) && r.soNhip === r.nhipTong && r.nhipMax === Math.max(...r.theoSan.map((s) => s.soNhip)) && r.nhipMax < r.nhipTong);
    // BFS
    const bfs = nhipCheCamBienTatCa(m), bfsTungSan = [0, 1, 2].map((i) => nhipCheCamBienSan(m, i).nhip);
    const duocTat = m.nhipTheoLoiGiai === true;
    kiem(m.id + ': BFS nhịp ngắn nhất (' + bfsTungSan.join(' + ') + ' = ' + bfs + ') ' + (duocTat ? '≤ sao.nhip (chấm theo lời giải chuẩn, ' + m.sao.nhip + ')' : '= sao.nhip (' + m.sao.nhip + ')'), duocTat ? (bfs !== null && bfs <= m.sao.nhip) : bfs === m.sao.nhip, 'BFS = ' + bfs + ', sao.nhip = ' + m.sao.nhip);
    if (!duocTat) kiem(m.id + ': mỗi sân lời giải chạy đúng nhịp ngắn nhất của sân đó', r.theoSan.every((s, i) => s.soNhip === bfsTungSan[i]), J(r.theoSan.map((s) => s.soNhip)) + ' vs ' + J(bfsTungSan));
    // chương trình chính
    if (m.chinhCoDinh) {
      const gui = ChamHoc.cham(m, { chinh: ['wait()', 'wait()', 'wait()'], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính gửi lên bị bỏ qua (kết quả y hệt lời giải)', J([gui.thang, gui.soO, gui.soNhip, gui.py]) === J([r.thang, r.soO, r.soNhip, r.py]) && m.maMau.chinh.length >= 1 && m.maMau.chinh.length <= m.khung.chinh);
    } else {
      kiem(m.id + ': người chơi tự viết chương trình chính (maMau.chinh rỗng, lời giải 1–10 dòng, bản rỗng không thắng)', m.maMau.chinh.length === 0 && m.loiGiai.chinh.length >= 1 && m.loiGiai.chinh.length <= 10 && !ChamHoc.cham(m, { chinh: [] }, khoNay).thang);
    }
    // bóng mờ
    if (m.mucTieu === 'bong-mo') {
      kiem(m.id + ': bóng mờ của cả ba sân nằm trên ô đi được, kết quả có bongMo; sân cần di chuyển thì toi-bong-mo ghi ở nhịp cuối; diQua sáng hết',
        m.bongMo.every((bm, i) => !SanHoc.lyDoChan(SanHoc.docSan(m.san[i]), 'banh', bm.x, bm.y)) && r.theoSan.every((s, i) => s.bongMo && s.bongMo.x === m.bongMo[i].x && s.bongMo.huong === m.bongMo[i].huong && s.diQua.every((q) => q.da) &&
          (s.soNhip === 0 || nhipVet(s).slice(-1)[0] === undefined || s.vet.filter((e) => e.loai === 'nhip').slice(-1)[0].suKien.some((e) => e.ma === 'toi-bong-mo'))));
    } else {
      kiem(m.id + ': mục tiêu tới cờ, bản mẫu (maMau) với kho lúc tới màn (chưa chế hàm) không thắng', ChamHoc.cham(m, m.maMau, kho).thang === false);
    }
    // công thức khác
    kiem(m.id + ': có ít nhất 1 công thức khác (congThucKhac), mỗi cái khác cách 1', Array.isArray(m.congThucKhac) && m.congThucKhac.length >= 1 && m.congThucKhac.every((c) => c.moTa && (c.hamCuaEmMoi || c.baiLam) && J([c.hamCuaEmMoi || [], c.baiLam || null]) !== J([m.loiGiai.hamCuaEmMoi, null]) && J(c.baiLam || m.loiGiai) !== J({ chinh: m.loiGiai.chinh, hamCuaMan: m.loiGiai.hamCuaMan }) || (c.hamCuaEmMoi && J(c.hamCuaEmMoi) !== J(m.loiGiai.hamCuaEmMoi))));
    m.congThucKhac.forEach((c, i) => {
      const rk = ChamHoc.cham(m, c.baiLam || m.loiGiai, tron(khoNay, c.hamCuaEmMoi));
      kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng cả ba sân, không lỗi — ' + rk.sao + ' sao, ' + rk.soO + ' ô, ' + rk.soNhip + ' nhịp', rk.thang && rk.theoSan.every((s) => s.thang) && maLoi(rk).length === 0, J({ thang: rk.thang, cd: maCua(rk) }));
    });
    // lời giải khác
    const lk = m.loiGiaiKhac, rk2 = ChamHoc.cham(m, lk.baiLam, tron(kho, lk.hamCuaEmMoi));
    kiem(m.id + ': loiGiaiKhac (' + lk.moTa + ') thắng đúng 2 sao, nhiều ô hơn (' + rk2.soO + ' > ' + m.sao.o + '), cùng nhịp', rk2.thang && rk2.sao === 2 && rk2.soO > m.sao.o && rk2.soNhip === m.sao.nhip && J(lk.baiLam) !== J(m.loiGiai) || (rk2.thang && rk2.sao === 2 && rk2.soO > m.sao.o && rk2.soNhip === m.sao.nhip), J({ sao: rk2.sao, soO: rk2.soO, soNhip: rk2.soNhip }));
    // lời sai
    m.loiSai.forEach((ls, i) => {
      const rs = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi)), co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
      const khongThang = ls.phaiCoMa.some((x) => FAIL.has(x));
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): ' + (khongThang ? 'không thắng' : 'thắng nhưng thiếu sao') + ', có mã ' + ls.phaiCoMa.join('+'),
        rs.sao < 3 && thieu.length === 0 && (khongThang ? !rs.thang : rs.thang), 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · thang ' + rs.thang + ' · sao ' + rs.sao);
    });
    // đề bài, gợi ý
    const tenChe = m.loiGiai.hamCuaEmMoi.map((h) => h.ten);
    kiem(m.id + ': đề bài nhắc tên lệnh cần chế (' + (tenChe.join(', ') || 'màn dùng / sửa hàm') + ')', tenChe.every((t) => (m.deBai + ' ' + (m.veMaMau || '')).includes(t + '()')), m.deBai);
    kiem(m.id + ': đề 1–3 câu, gợi ý 1–2 câu, không nói tên nút', m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && m.goiY.every((g) => !/\bnút\b/i.test(g)), m.deBai);
  }
}

/* ================================================================= 6. LUẬT RIÊNG TỪNG MÀN */
console.log('\n== 6. Luật riêng từng màn ==');
{
  const ch = (m, bai, moi) => ChamHoc.cham(m, bai, tron(khoTruoc(m.id), moi || []));
  const m1 = man(1);
  const cung1 = ch(m1, m1.loiSai[0].baiLam, m1.loiSai[0].hamCuaEmMoi);
  kiem('1: move() thẳng không hỏi cảm biến vẫn tới đúng chỗ (xe húc khối chắn rồi đứng yên) nhưng tốn 9 nhịp > 4: thắng 2 sao, có dam-tuong; hỏi cảm biến thì 4 nhịp (3 + 1 + 0)', cung1.thang && cung1.soNhip === 9 && cung1.sao === 2 && maCua(cung1).includes('dam-tuong') && J(ch(m1, m1.loiGiai, m1.loiGiai.hamCuaEmMoi).theoSan.map((s) => s.soNhip)) === '[3,1,0]');
  const m2 = man(2);
  kiem('2: mỗi sân đúng MỘT lối ra (một ô trống kề bên xe), lối ở bên phải / phía sau / bên trái; quay trái hay quay phải đều tới (3 + 2 + 1 = 6 nhịp); quay trái đúng bằng quay phải ở tổng 3 sân',
    m2.san.every((rows) => { const s = SanHoc.docSan(rows); return [[0, -1], [1, 0], [0, 1], [-1, 0]].filter((v) => !SanHoc.lyDoChan(s, 'banh', 2 + v[0], 2 + v[1])).length === 1; }) && J(m2.bongMo.map((b) => b.huong)) === '[1,2,3]' && ch(m2, m2.loiGiai, m2.congThucKhac[1].hamCuaEmMoi).soNhip === 6);
  const m3 = man(3);
  kiem('3: ba mê cung chỉ rẽ phải (go_wall rồi face_open lặp 3 lần tới cờ ở cả ba sân); lời giải 4 dòng; cứng số bước (11 lệnh move) tràn khung; thiếu một lần lặp thì không tới cờ',
    m3.loiGiai.chinh.length === 4 && ch(m3, m3.loiGiai, []).thang && maCua(ch(m3, { chinh: Array(11).fill('move()') })).includes('tran-khung') && !ch(m3, { chinh: ['go_wall()', 'for i in range(2):', '    face_open()', '    go_wall()'] }).thang);
  const m4 = man(4);
  const cua = m4.san.map((rows, i) => { const s = SanHoc.docSan(rows); let n = 0; for (let y = 0; y < s.cao; y++) if (!SanHoc.lyDoChan(s, 'banh', 2, y) && !SanHoc.lyDoChan(s, 'banh', 1, y)) n++; return n; });
  kiem('4: mỗi hành lang đúng MỘT cửa bên phải, cửa cách xe 2 / 4 / 5 ô (xe đi tới bao nhiêu thì cửa ở đó); đếm cứng theo sân đầu chỉ đúng sân đó', J(cua) === '[1,1,1]' && J(m4.loiGiai.hamCuaEmMoi[0].than) === J(['while not right_clear():', '    move()']) && ChamHoc.cham(m4, m4.loiGiai, tron(khoTruoc(m4.id), m4.loiGiai.hamCuaEmMoi)).theoSan.map((s) => s.soNhip).join() === '2,4,5');
  const m5 = man(5), k5 = tron(khoTruoc(m5.id), m5.loiGiai.hamCuaEmMoi);
  const rong5 = ChamHoc.cham(Object.assign({}, m5, { chinhCoDinh: false }), { chinh: [] }, k5);
  kiem('5: bounce() chưa chế thì ham-chua-co; xe đứng yên (chương trình rỗng) KHÔNG thắng nhờ ◆ ở ô sát tường (không có ◆ thì chương trình rỗng thắng 0 nhịp)',
    !rong5.thang && maCua(ChamHoc.cham(m5, m5.loiSai[0].baiLam, [])).includes('ham-chua-co') && m5.bongMo.every((b) => b.diQua.length === 1) &&
      (() => { const k = ChamHoc.cham(Object.assign({}, m5, { chinhCoDinh: false, bongMo: m5.bongMo.map((b) => ({ x: b.x, y: b.y, huong: b.huong })) }), { chinh: [] }, []); return k.thang && k.soNhip === 0; })());
  kiem('5: ◆ nằm ở ô sát tường (ô cuối cùng xe tới được) và bounce() nhớ số ô bằng biến n: không đếm thì xe về sai chỗ (go_wall hai chiều chạy quá ô xuất phát), n = 1 lúc đầu thì lùi dư một ô',
    m5.bongMo.every((b, i) => { const s = SanHoc.docSan(m5.san[i]); return !SanHoc.lyDoChan(s, 'banh', b.diQua[0].x, b.diQua[0].y) && SanHoc.lyDoChan(s, 'banh', b.diQua[0].x, b.diQua[0].y - 1); }) &&
      m5.loiSai.slice(0, 4).every((ls) => !ChamHoc.cham(m5, ls.baiLam, tron(khoTruoc(m5.id), ls.hamCuaEmMoi)).thang));
  const m6 = man(6);
  // ba mê cung của màn 6 không có vòng (đồ thị đường đi là cây): bám tường luôn tới cờ
  const laCay = m6.san.every((rows) => {
    const s = SanHoc.docSan(rows), o = []; let canh = 0;
    for (let y = 0; y < s.cao; y++) for (let x = 0; x < s.rong; x++) if (!SanHoc.lyDoChan(s, 'banh', x, y)) { o.push(x + ',' + y); if (!SanHoc.lyDoChan(s, 'banh', x + 1, y) && x + 1 < s.rong) canh++; if (!SanHoc.lyDoChan(s, 'banh', x, y + 1) && y + 1 < s.cao) canh++; }
    const thay = new Set([o[0]]), hang = [o[0]];
    while (hang.length) { const [x, y] = hang.pop().split(',').map(Number); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const k = (x + dx) + ',' + (y + dy); if (o.includes(k) && !thay.has(k)) { thay.add(k); hang.push(k); } }); }
    return thay.size === o.length && canh === o.length - 1;
  });
  kiem('6: ba mê cung hành lang liền một khối và không có vòng (cây), nên bám tường tay phải luôn tới cờ; chương trình chính lặp follow_right() 60 lần; sân xuất phát ở chỗ khác nhau', laCay && J(m6.maMau.chinh) === J(['for i in range(60):', '    follow_right()']) && m6.batDau.every((b, i) => i === 0 || J(b) !== J(m6.batDau[0])));
  const m7 = man(7);
  const cu7 = ch(m7, m7.loiSai[0].baiLam, m7.loiSai[0].hamCuaEmMoi);
  kiem('7: safe_move() cũ (if front_clear(): move()) với cảm biến ngược thua ở sân trống phía trước; safe_move2() = if not front_clear(): move() thắng 3 sao 4 nhịp; ba sân: trống ba ô / chắn sau một ô / chắn sát mặt',
    !cu7.thang && cu7.theoSan.map((s) => s.thang).join() === 'false,false,true' && J(m7.loiGiai.hamCuaEmMoi[0].than) === J(['if not front_clear():', '    move()']) && ch(m7, m7.loiGiai, m7.loiGiai.hamCuaEmMoi).sao === 3 && J(ch(m7, m7.loiGiai, m7.loiGiai.hamCuaEmMoi).theoSan.map((s) => s.soNhip)) === '[3,1,0]');
  const m8 = man(8);
  const hong8 = ChamHoc.cham(m8, m8.maMau, khoTruoc(m8.id));
  kiem('8: hàm to_door() của màn hỏng (hỏi left_clear trong khi cửa ở bên phải): chạy mãi → vong-vo-han, trỏ vào dòng while của hàm của màn; hàm của màn SỬA ĐƯỢC (không khoaHamMan) và nằm trong maMau',
    !hong8.thang && maCua(hong8).includes('vong-vo-han') && J(hong8.chanDoan.find((c) => c.ma === 'vong-vo-han').cho) === J({ cot: 'hamMan', dong: 1, ten: 'to_door' }) && m8.maMau.hamCuaMan.length === 1 && m8.maMau.hamCuaMan[0].ten === 'to_door' && m8.khoaHamMan === undefined && J(m8.loiGiai.hamCuaMan[0].than) === J(['while not right_clear():', '    move()']));
  kiem('8: sao.nhip = BFS (22 = 5 + 8 + 9: đi tới cửa, rẽ phải một nhịp, đi tới cờ); chạm điều kiện đổi được: hamGoc có cả left_clear lẫn right_clear', m8.sao.nhip === 22 && nhipCheCamBienTatCa(m8) === 22 && m8.hamGoc.includes('left_clear') && m8.hamGoc.includes('right_clear'));
  const m9 = man(9), k9 = tron(khoTruoc(m9.id), m9.loiGiai.hamCuaEmMoi);
  const r9 = ChamHoc.cham(m9, m9.loiGiai, k9);
  kiem('9: vật mờ nằm ở ô trước mặt chỗ xuất phát; vật cuối hành lang xa 2 / 4 / 5 ô; lời giải 34 nhịp = 2n + 4 mỗi sân (8 + 12 + 14), BFS 28 = 2n + 2 mỗi sân (tay nâng chung nhịp lùi); quên nhặt / quên thả không thắng',
    m9.bongMo.every((b) => J(b.vat) === '[{"x":1,"y":5}]' && b.x === 1 && b.y === 6) && J(r9.theoSan.map((s) => s.soNhip)) === '[8,12,14]' && nhipCheCamBienTatCa(m9) === 28 && m9.loiSai.slice(0, 3).every((ls) => !ChamHoc.cham(m9, ls.baiLam, tron(khoTruoc(m9.id), ls.hamCuaEmMoi)).thang));
  const m10 = man(10), k10 = tron(khoTruoc(m10.id), m10.loiGiai.hamCuaEmMoi);
  const r10 = ChamHoc.cham(m10, m10.loiGiai, k10);
  kiem('10: trùm — gioiHanHam 3 và lời giải gọi đúng 3 hàm của em (to_gap, turn_right, fetch_back); gọi thêm hàm thứ tư thì qua-gioi-han-ham; vật mờ ngay cạnh cửa; mỗi sân có hốc cụt bên trái làm mồi',
    r10.thang && KhungCode.hamEmTrucTiep({ chinh: m10.loiGiai.chinh, hamCuaMan: [] }, k10).join() === 'to_gap,turn_right,fetch_back' && maCua(ChamHoc.cham(m10, { chinh: m10.loiGiai.chinh.concat(['go_wall()']) }, k10)).includes('qua-gioi-han-ham') &&
      m10.bongMo.every((b) => b.huong === 1 && b.vat.length === 1 && b.vat[0].x === b.x + 1 && b.vat[0].y === b.y) && m10.san.every((rows) => rows.some((r) => r[1] === '.')));
  kiem('10: công thức khác rẽ phải bằng lệnh bánh (2 hàm của em) cũng thắng; cứng số ô vào nhánh chỉ đúng sân đầu (n = 1)', ChamHoc.cham(m10, m10.congThucKhac[0].baiLam, k10).thang && (() => { const k = ChamHoc.cham(m10, m10.loiSai[3].baiLam, tron(khoTruoc(m10.id), m10.loiSai[3].hamCuaEmMoi)); return !k.thang && k.theoSan.map((s) => s.thang).join() === 'true,false,false'; })());
}

/* ================================================================= 7. SỔ LỆNH VÀ THẺ SCRIPT */
console.log('\n== 7. Sổ lệnh, game/choi.html ==');
{
  const moi = ['safe_move', 'face_open', 'to_gap', 'bounce', 'follow_right', 'safe_move2', 'fetch_back'];
  kiem('Sổ lệnh có bảy hàm của chương, nhóm cam-bien, chuong che-cam-bien, man khớp màn tạo hàm, lời lớp 5 (≤ 80 chữ, không dấu chấm cuối); theo thứ tự chế',
    moi.every((t, i) => { const h = SoLenh.tim(t); return h && h.nhom === 'cam-bien' && h.chuong === 'che-cam-bien' && h.man === che.find((m) => m.taoHam.includes(t)).ma && h.moTa.length <= 80 && !/[.]$/.test(h.moTa); }) &&
      J(SoLenh.theoChuong('che-cam-bien').map((h) => h.ten)) === J(moi) && SoLenh.tim('safe_move').moTa === 'Tiến một ô nếu trước mặt trống, không thì đứng yên');
  kiem('nhóm cam-bien của Sổ lệnh: go_wall (khoang-cach) rồi bảy hàm của che-cam-bien', J(SoLenh.theoNhom('cam-bien').map((h) => h.ten)) === J(['go_wall'].concat(moi)));
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có đúng một thẻ script ../man-che-cam-bien.js, nạp sau man-khoang-cach.js và sau thu-tu-chuong.js, có file trên đĩa', tags.filter((t) => t === '../man-che-cam-bien.js').length === 1 && vtri('man-che-cam-bien.js') > vtri('man-khoang-cach.js') && vtri('man-che-cam-bien.js') > vtri('thu-tu-chuong.js') && fs.existsSync(path.join(day, 'man-che-cam-bien.js')));
}

/* ================================================================= BẢNG */
console.log('\n  Bảng 10 màn che-cam-bien (lời giải cách 1, sao)');
console.log('  màn  | tên                 | ô  | nhịp (ba sân)   | BFS | tạo        | lời giải (chương trình chính)');
for (const m of che) {
  const kho = tron(khoTruoc(m.id), m.loiGiai.hamCuaEmMoi), r = ChamHoc.cham(m, m.loiGiai, kho);
  console.log('  ' + m.id.padEnd(4) + ' | ' + m.ten.padEnd(19) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + (String(m.sao.nhip) + ' (' + r.theoSan.map((s) => s.soNhip).join('+') + ')').padEnd(15) + ' | ' + String(nhipCheCamBienTatCa(m)).padEnd(3) + ' | ' + m.taoHam.join(',').padEnd(10) + ' | ' + m.loiGiai.chinh.join(' ; '));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

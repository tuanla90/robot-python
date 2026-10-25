/* ============================================================================
   kiem-che-nam-cham.mjs — máy kiểm chương `che-nam-cham` (Chế lệnh nam châm) của "Robot Chấn Hưng" và các luật lõi mới của nó (KE-HOACH-CHE-LENH.md, mục 5b.2).
   Gồm:
   - daoChieu 'cuc' (dây cực đấu ngược): magnet_n() bật cực S thật, magnet_s() bật cực N thật; vết lệnh vẫn ghi tên lệnh gọi; cấu hình sai bị từ chối;
   - màn hỏng (phanCung thiếu magnet_s): gọi lệnh hỏng → lenh-goc-hong nói "Cực S của nam châm hỏng" / canhBao của màn;
   - bongMo.cam với tay nam châm (xe mờ đang DÍNH vật) và chẩn đoán lech-bong-mo nói "dính" (không "cầm");
   - Sổ lệnh có đủ năm hàm mới (so-lenh.js; fixed_grip, go_pull, put_back là HÀM CỦA MÀN nên không có ở đó, không vào kho);
   - 10 màn che-nam-cham: lời giải 3 sao, mọi công thức khác thắng, lời giải khác đúng 2 sao, lời sai đúng mã, chinhCoDinh chặn chương trình chính gửi lên,
     nhịp: đường ngắn nhất BFS (do-duong-che-nam-cham.mjs, lệnh nam châm gộp vào nhịp đi) và BFS "tách nhịp" không dài hơn sao.nhip;
   - đường BFS đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng số nhịp BFS (luật bộ dò và lõi khớp nhau; so chéo ngẫu nhiên nằm ở kiem-nam-cham.mjs);
   - thẻ script của game/choi.html.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs. Luật hút / đẩy / cực của vật: kiem-nam-cham.mjs.
   Chạy: node hoc/kiem-che-nam-cham.mjs        (trượt thì thoát mã 1)
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
const DoDuong = await import('./do-duong-che-nam-cham.mjs');
const { nhipCheNamChamNganNhat, nhipCheNamChamTatCa, chuoiThanhMa } = DoDuong;

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
const ev = (kq, ma) => nhipVet(kq).flatMap((n) => n.suKien).filter((e) => e.ma === ma);
const tatCa = ManHoc.danhSach;
const che = tatCa.filter((m) => m.chuong === 'che-nam-cham');
const man = (so) => ManHoc.timMa('che-nam-cham.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const L = (...d) => d.join('\n') + '\n';
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);

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

const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const NC = ['magnet_n', 'magnet_s', 'magnet_off'];
const KHAY = BANH.concat(NC, ['front_clear', 'front_metal', 'front_pole']);
const trong = (n) => Array.from({ length: n }, () => '.'.repeat(n));
const dat1 = (rows, x, y, ch) => rows.map((r, j) => (j === y ? r.slice(0, x) + ch + r.slice(x + 1) : r));
function chay(rows, bd, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: KHAY }, extra || {}), code);
}
const vatCua = (kq, id) => kq.vat.find((v) => v.id === id);
/** Cấu hình SanHoc.chay của sân thứ i của màn m (như ChamHoc.cham truyền xuống). */
function cfgSan(m, i, extra) {
  const lm = SanHoc.lopMauCuaSan(m, i);
  return Object.assign({ san: sanCua(m)[i], batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, loaiRobot: 'banh', hamGoc: m.hamGoc, phanCung: SanHoc.phanCungCua(m), mucTieu: m.mucTieu || 'toi-co',
    bongMo: lm.bongMo || undefined, vatChat: lm.vatChat, vatMau: lm.vatMau, vat: lm.vatThem || undefined, daoChieu: m.daoChieu, camBien: m.robot.camBien, nhipToiDa: 200 }, extra || {});
}

/* ================================================================= 1. DÂY CỰC ĐẤU NGƯỢC (daoChieu 'cuc') */
console.log('\n== 1. daoChieu "cuc": dây cực đấu ngược ==');
{
  const rows = dat1(trong(7), 3, 1, 'o'), chat = dat1(trong(7), 3, 1, 'N'), bd = { x: 3, y: 3, huong: 0 };
  const dc = (code, dao, extra) => chay(rows, bd, code, Object.assign({ vatChat: chat, daoChieu: dao }, extra || {}));
  const thuong = dc(L('magnet_n()', 'wait()'), []);
  kiem('không đảo: magnet_n() bật cực N thật (cùng chữ N) nên vật bị đẩy (đối chứng)', thuong.namCham.cuc === 'N' && ev(thuong, 'day-vat').length === 1 && thuong.namCham.cam === null);
  const d1 = dc(L('magnet_n()', 'wait()'), ['cuc']);
  kiem('daoChieu ["cuc"]: magnet_n() bật cực S THẬT nên hút được vật chữ N (cuc ghi trong vết là cực thật "S")', d1.namCham.cuc === 'S' && d1.namCham.cam === 1 && ev(d1, 'hut-vat').length === 1 && nhipVet(d1)[0].robot.namCham.cuc === 'S');
  const d2 = dc(L('magnet_s()', 'wait()'), ['cuc']);
  kiem('daoChieu ["cuc"]: magnet_s() bật cực N thật nên đẩy vật chữ N', d2.namCham.cuc === 'N' && ev(d2, 'day-vat').length === 1 && d2.namCham.cam === null);
  kiem('vết lệnh vẫn ghi tên lệnh người chơi gọi (magnet_n, wait)', d1.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten).join() === 'magnet_n,wait');
  const d3 = dc(L('magnet_n()', 'wait()', 'magnet_off()', 'wait()'), ['cuc']);
  kiem('daoChieu "cuc" không đổi magnet_off(): vẫn ngắt điện và thả vật', d3.namCham.cuc === null && d3.namCham.cam === null && ev(d3, 'tha-vat').length === 1);
  kiem('daoChieu "cuc" ghép được với đấu dây bánh (["cuc","trai"]): left_move() + right_move() thành quay đầu, magnet_n() vẫn ra cực S', (() => { const k = dc(L('magnet_n()', 'left_move()', 'right_move()', 'wait()'), ['cuc', 'trai']); return k.robot.huong === 2 && k.namCham.cuc === 'S'; })());
  const nem = (f) => { try { f(); return false; } catch (e) { return /daoChieu/.test(e.message); } };
  kiem('daoChieu "cuc" cần robot có tay nam châm: robot không có lệnh nam châm bị từ chối; tên lạ vẫn bị từ chối',
    nem(() => SanHoc.chay({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait'], daoChieu: ['cuc'] }, '')) && nem(() => dc('', ['giua'])));
  kiem('đảo cực chỉ đổi tên lệnh: bộ dò tính theo cực thật nên chuoiThanhMa ghi ngược (n → magnet_s)', /magnet_s\(\)/.test(chuoiThanhMa([{ nc: 'n', banh: 4 }], { daoChieu: ['cuc'], phanCung: SanHoc.phanCungCua(man(7)) })));
  const thuSan = ChamHoc.thuHam(Object.assign({}, man(7)), { chinh: [], hamCuaMan: man(7).maMau.hamCuaMan }, 'fixed_grip', khoTruoc(man(7).id), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 3, huong: 0 }, vat: [{ x: 2, y: 1, chat: 'nam-cham', cuc: 'N' }] } });
  kiem('sân thử của Xưởng hàm dùng daoChieu của màn: fixed_grip() cũ với vật chữ N ở sân thử: nam châm ra cực N thật (dây ngược) nên vật bị ĐẨY, xe không dính gì', thuSan.namCham && thuSan.namCham.cuc === 'N' && thuSan.namCham.cam === null && thuSan.vat[0].y === 0, J([thuSan.namCham, thuSan.vat]));
}

/* ================================================================= 2. MÀN HỎNG: THIẾU CỰC S */
console.log('\n== 2. Màn hỏng: phanCung thiếu magnet_s ==');
{
  const m8 = man(8);
  kiem('che-nam-cham.8 hỏng cực S: hamGoc = phanCung (có magnet_n, magnet_off; không magnet_s) và canhBao "Cực S hỏng"', J(m8.phanCung) === J(m8.hamGoc) && !m8.phanCung.includes('magnet_s') && m8.phanCung.includes('magnet_n') && m8.phanCung.includes('magnet_off') && /Cực S hỏng/.test(m8.canhBao));
  const k = ChamHoc.cham(m8, { chinh: ['grip()'] }, khoTruoc(m8.id));
  const cd = k.chanDoan.find((c) => c.ma === 'lenh-goc-hong');
  kiem('gọi grip() (cần magnet_s) ở màn hỏng: lenh-goc-hong (không phải ham-chua-co), lời nêu canhBao và tên lệnh magnet_s, chỉ dòng của grip', !!cd && cd.ten === 'magnet_s' && /Cực S hỏng/.test(cd.loi) && /magnet_s\(\) không chạy được/.test(cd.loi) && !maCua(k).includes('ham-chua-co') && cd.cho && cd.cho.cot === 'hamEm' && cd.cho.ten === 'grip', J(k.chanDoan));
  const k2 = ChamHoc.cham(Object.assign({}, m8, { canhBao: undefined }), { chinh: ['grip()'] }, khoTruoc(m8.id));
  kiem('không khai canhBao: lời mặc định "Cực S của nam châm hỏng"', /Cực S của nam châm hỏng/.test((k2.chanDoan.find((c) => c.ma === 'lenh-goc-hong') || {}).loi || ''));
  kiem('kick() (chỉ dùng cực N) chạy được ở màn hỏng: không lenh-goc-hong, không lỗi chạy', (() => { const r = ChamHoc.cham(m8, { chinh: ['kick()'] }, khoTruoc(m8.id)); return !maCua(r).includes('lenh-goc-hong') && !maCua(r).includes('loi-chay') && r.vat.find((v) => v.chat === 'nam-cham').x === 3; })());
  kiem('bộ dò chỉ cho n, off ở màn hỏng; màn thường cho n, s, off', J(DoDuong.lenhNamChamChoPhep(m8)) === '["n","off"]' && J(DoDuong.lenhNamChamChoPhep(man(1))) === '["n","s","off"]');
}

/* ================================================================= 3. XE MỜ DÍNH VẬT, CHẨN ĐOÁN BÓNG MỜ */
console.log('\n== 3. bongMo.cam với tay nam châm (xe mờ dính vật); lech-bong-mo nói "dính" ==');
{
  const SAN = ['.....', '.....', '..o..', '.....', '.....'], bd = { x: 2, y: 4, huong: 0 };
  const CH = ['.....', '.....', '..N..', '.....', '.....'];
  const BM = (bongMo, code, extra) => chay(SAN, bd, code, Object.assign({ mucTieu: 'bong-mo', bongMo, vatChat: CH }, extra || {}));
  const hut = L('magnet_s()', 'wait()');
  const cam1 = BM({ x: 2, y: 4, huong: 0, cam: true }, hut);
  kiem('bongMo.cam: hút vật rồi dừng — xe đúng ô, đang dính vật: thắng; kết quả bongMo có cam true', cam1.thang === true && cam1.namCham.cam === 1 && cam1.bongMo.cam === true && cam1.bongMo.camMau === null);
  kiem('bongMo.cam true mà xe chưa dính gì: chưa thắng', BM({ x: 2, y: 4, huong: 0, cam: true }, '').thang === false);
  kiem('bongMo không khai cam mà xe còn dính vật (vật mờ nằm đất): chưa thắng', BM({ x: 2, y: 4, huong: 0, vat: [{ x: 2, y: 3 }] }, hut).thang === false);
  kiem('bongMo.cam { mau }: vật chữ N mang màu đỏ (theo cực): cam { mau "red" } thắng, "blue" chưa thắng', BM({ x: 2, y: 4, huong: 0, cam: { mau: 'red' } }, hut).thang === true && BM({ x: 2, y: 4, huong: 0, cam: { mau: 'blue' } }, hut).thang === false);
  const nem = (f) => { try { f(); return false; } catch (e) { return /bongMo/.test(e.message); } };
  kiem('bongMo.cam cần robot có tay kẹp hay nam châm: robot không có tay bị từ chối', nem(() => chay(SAN, bd, '', { hamGoc: ['left_move', 'right_move', 'wait'], mucTieu: 'bong-mo', bongMo: { x: 2, y: 4, huong: 0, cam: true } })));
  const manBM = (bongMo, extra) => Object.assign({ chuong: 'thu', loaiRobot: 'banh', hamGoc: KHAY, moXuong: true, camHamCuaEm: false, khung: { chinh: 10, moiHam: 10 }, cauTruc: [], mucTieu: 'bong-mo', san: SAN, vatChat: CH, batDau: bd, bongMo }, extra || {});
  const qua = (m, chinh) => ChamHoc.cham(m, { chinh }, []);
  const lv = (kq) => kq.chanDoan.find((c) => c.ma === 'lech-bong-mo');
  const chuaDinh = qua(manBM({ x: 2, y: 4, huong: 0, cam: true }), []);
  kiem('xe mờ dính vật mà xe chưa dính: "Xe đúng chỗ rồi. Xe chưa dính vật nào, còn xe mờ thì đang dính một vật." (từ "dính", không "cầm")', !!lv(chuaDinh) && lv(chuaDinh).loi === 'Xe đúng chỗ rồi. Xe chưa dính vật nào, còn xe mờ thì đang dính một vật.' && lv(chuaDinh).camLech === true, J(chuaDinh.chanDoan));
  const dinhThua = qua(manBM({ x: 2, y: 4, huong: 0, vat: [{ x: 2, y: 3 }] }), ['magnet_s()', 'wait()']);
  kiem('xe còn dính vật mà bóng mờ không dính: "Xe còn đang dính một vật, còn bóng mờ thì không dính gì." và vật chưa đúng ô', !!lv(dinhThua) && /Xe còn đang dính một vật, còn bóng mờ thì không dính gì\./.test(lv(dinhThua).loi) && /Một vật chưa nằm đúng ô như bóng mờ\./.test(lv(dinhThua).loi), J(dinhThua.chanDoan));
  const camSai = qua(manBM({ x: 2, y: 4, huong: 0, cam: { mau: 'blue' } }), ['magnet_s()', 'wait()']);
  kiem('xe dính vật sai màu: "Xe đang dính vật màu đỏ, còn xe mờ dính vật màu xanh dương."', !!lv(camSai) && /Xe đang dính vật màu đỏ, còn xe mờ dính vật màu xanh dương\./.test(lv(camSai).loi), J(camSai.chanDoan));
  kiem('robot tay kẹp vẫn nói "cầm" như cũ (không đổi chữ của chương che-tay)', (() => { const mt = Object.assign(manBM({ x: 2, y: 4, huong: 0, cam: true }), { hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release']), vatChat: undefined }); const r = qua(mt, []); return lv(r) && /Xe chưa cầm vật nào/.test(lv(r).loi); })());
  const dung = qua(manBM({ x: 2, y: 4, huong: 0, cam: true }), ['magnet_s()', 'wait()']);
  kiem('xe đúng tư thế, đang dính vật: thắng, không chẩn đoán nào', dung.thang && dung.chanDoan.length === 0);
}

/* ================================================================= 4. SỔ LỆNH */
console.log('\n== 4. Sổ lệnh: năm hàm mới của che-nam-cham (fixed_grip, go_pull, put_back là hàm của màn); cặp lệnh ngược ==');
{
  const moi = ['kick', 'reel', 'lane', 'sort', 'fling'];
  kiem('SoLenh.theoChuong("che-nam-cham") đúng năm hàm theo thứ tự chế: kick, reel, lane, sort, fling; nhóm nam-cham', J(SoLenh.theoChuong('che-nam-cham').map((h) => h.ten)) === J(moi) && SoLenh.theoChuong('che-nam-cham').every((h) => h.nhom === 'nam-cham'));
  const dau = {};
  for (const m of tatCa) for (const t of m.taoHam) if (!dau[t]) dau[t] = m;
  kiem('fixed_grip, go_pull, put_back là hàm CỦA MÀN: không là hàm cốt truyện, không trong Sổ lệnh, không trong hamCuaEmMoi của lời giải nào',
    ['fixed_grip', 'go_pull', 'put_back'].every((t) => !tenCotTruyen.includes(t) && SoLenh.tim(t) === null && tatCa.every((m) => !m.loiGiai.hamCuaEmMoi.some((h) => h.ten === t))));
  kiem('mỗi hàm có chuong và man đúng màn đầu tiên chế nó (taoHam của màn che-nam-cham)', moi.every((t) => dau[t] && SoLenh.tim(t) && SoLenh.tim(t).man === dau[t].ma && SoLenh.tim(t).chuong === 'che-nam-cham'));
  kiem('moTa là MỘT câu ngắn lớp 5: 8–80 chữ, không xuống dòng, không dấu chấm cuối; kick: "Đá vật nam châm chữ N ra xa bằng cực N rồi ngắt điện"', moi.every((t) => { const d = SoLenh.tim(t).moTa; return d.length >= 8 && d.length <= 80 && !/\n/.test(d) && !/[.]$/.test(d); }) && SoLenh.tim('kick').moTa === 'Đá vật nam châm chữ N ra xa bằng cực N rồi ngắt điện');
  kiem('tên hàm cốt truyện không trùng với lệnh gốc hay hàm của chương khác', moi.every((t) => SoLenh.ds.filter((h) => h.ten === t).length === 1 && !KhoHam.HAM_GOC_MAC_DINH.includes(t)));
  kiem('thứ tự trong Sổ lệnh: hàm của che-nam-cham đứng sau grip (nam-cham) và trước hàm của may-nem (toss)', SoLenh.ds.findIndex((h) => h.ten === 'kick') > SoLenh.ds.findIndex((h) => h.ten === 'grip') && SoLenh.ds.findIndex((h) => h.ten === 'fling') < SoLenh.ds.findIndex((h) => h.ten === 'toss'));
  const lenhGocNC = ['magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  kiem('lệnh gốc trong Sổ lệnh: magnet_n ↔ magnet_s là cặp ngược (cùng bảng LENH_NGUOC), magnet_off và hai cảm biến từ không có lệnh ngược; không còn magnet_on', lenhGocNC.every((t) => SoLenh.lenhGoc.some((l) => l.ten === t)) && !SoLenh.lenhGoc.some((l) => l.ten === 'magnet_on') &&
    SoLenh.lenhGoc.find((l) => l.ten === 'magnet_n').nguoc === 'magnet_s' && SoLenh.lenhGoc.find((l) => l.ten === 'magnet_s').nguoc === 'magnet_n' && !SoLenh.lenhGoc.find((l) => l.ten === 'magnet_off').nguoc &&
    SoLenh.capNguoc().some((c) => c[0] === 'magnet_n' && c[1] === 'magnet_s'));
  kiem('SanHoc.LENH_NGUOC khớp bảng Sổ lệnh với mọi lệnh gốc nam châm', ['magnet_n', 'magnet_s'].every((t) => SanHoc.LENH_NGUOC[t] === SoLenh.lenhGoc.find((l) => l.ten === t).nguoc));
}

/* ================================================================= 5. MƯỜI MÀN CHE-NAM-CHAM */
console.log('\n== 5. Chương che-nam-cham: dữ liệu và luật từng màn ==');
const BANG = [];
{
  kiem('đúng 10 màn, số 1..10, mã che-nam-cham.1…, id theo vị trí trong thuTu (ngay sau nam-cham), tên "Chế lệnh nam châm"',
    che.length === 10 && che.every((m, i) => m.so === i + 1 && m.id === (ThuTu.thuTu.indexOf('che-nam-cham') + 1) + '.' + (i + 1) && m.ma === 'che-nam-cham.' + (i + 1)) && ThuTu.thuTu.indexOf('che-nam-cham') === ThuTu.thuTu.indexOf('nam-cham') + 1 && ThuTu.ten['che-nam-cham'] === 'Chế lệnh nam châm' && ThuTu.laDot2('che-nam-cham'));
  kiem('tên các màn: Đá vật, Kéo lại gần, Dọn đường, Chuyền sang làn, Phân loại, Bắn vật, Dây cực đấu ngược, Chỉ còn cực N, Đường về, Kho từ; hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu che-nam-cham "Huy hiệu Chế lệnh nam châm"',
    J(che.map((m) => m.ten)) === J(['Đá vật', 'Kéo lại gần', 'Dọn đường', 'Chuyền sang làn', 'Phân loại', 'Bắn vật', 'Dây cực đấu ngược', 'Chỉ còn cực N', 'Đường về', 'Kho từ']) &&
      J(che.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && che.every((m) => !!m.huyHieu === (m.so === 10)) && che[9].huyHieu.ma === 'che-nam-cham' && che[9].huyHieu.ten === 'Huy hiệu Chế lệnh nam châm');
  kiem('mọi màn: xe hai bánh gắn tay nam châm (robot { than: "hai-banh", tay: "nam-cham", camBien: [khoang-cach] }), chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em, cauTruc for/if/while',
    che.every((m) => m.loaiRobot === 'banh' && J(m.robot) === J({ than: 'hai-banh', tay: 'nam-cham', camBien: [{ ma: 'khoang-cach', o: 'hong' }] }) && m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && J(m.cauTruc) === '["for","if","while"]'));
  const KHAY_HONG = BANH.concat(['magnet_n', 'magnet_off'], ['front_clear', 'front_metal', 'front_pole']);
  kiem('khay: đủ bánh (cả lùi), magnet_n / magnet_s / magnet_off và ba cảm biến (front_clear, front_metal, front_pole) ở mọi màn trừ 8; 8 hỏng cực S: khay = phần cứng = trừ magnet_s; không màn nào còn magnet_on',
    che.every((m) => J(m.hamGoc) === J(m.so === 8 ? KHAY_HONG : KHAY) && !m.hamGoc.includes('magnet_on')) && che.every((m) => m.so === 8 || m.phanCung === undefined));
  kiem('lệnh chế ở từng màn (taoHam): kick, reel, —, lane, sort, fling, —, —, —, —; 7 sửa fixed_grip và 9 viết put_back là HÀM CỦA MÀN (không hàm của em mới)',
    J(che.map((m) => m.taoHam)) === J([['kick'], ['reel'], [], ['lane'], ['sort'], ['fling'], [], [], [], []]) && [7, 9].every((i) => man(i).loiGiai.hamCuaEmMoi.length === 0 && man(i).congThucKhac.every((c) => !c.hamCuaEmMoi || c.hamCuaEmMoi.length === 0)) &&
      J(man(7).loiGiai.hamCuaMan.map((h) => h.ten)) === '["fixed_grip"]' && J(man(9).loiGiai.hamCuaMan.map((h) => h.ten)) === '["go_pull","put_back"]');
  kiem('mục tiêu: 3 tới cờ (có chữ F; vật chỉ là chướng ngại), còn lại bong-mo có bongMo; chinhCoDinh ở mọi màn trừ 3, 8 và 10; bongMo.cam không màn nào; khoaHamMan ["go_pull"] chỉ ở 9; daoChieu ["cuc"] + canhBao chỉ ở 7; phanCung + canhBao chỉ ở 8; gioiHanHam 3 chỉ ở 10; màn nhiều sân: 5, 7, 10',
    che.every((m) => (m.so === 3 ? m.mucTieu === undefined && /F/.test(m.san.join('')) && m.bongMo === undefined : m.mucTieu === 'bong-mo' && !!m.bongMo && !/F/.test(m.san.flat(2).join(''))) &&
      (m.chinhCoDinh === true) === ![3, 8, 10].includes(m.so) && (m.so === 9) === (J(m.khoaHamMan) === '["go_pull"]') &&
      (m.so === 7 ? J(m.daoChieu) === '["cuc"]' && /đấu ngược/.test(m.canhBao) : m.daoChieu === undefined) && (m.so === 8) === !!m.phanCung && (m.so === 10 ? m.gioiHanHam === 3 : m.gioiHanHam === undefined) &&
      Array.isArray(m.san[0]) === [5, 7, 10].includes(m.so)));
  kiem('sân ≤ 7 cột × 9 hàng; màn nhiều sân: 3 sân (5, 10) hay 2 sân (7) cùng khung, batDau và bongMo song song, nhipTheo "tong"', che.every((m) => sanCua(m).every((r) => r.length <= 9 && r[0].length <= 7)) &&
    [5, 7, 10].every((i) => { const m = man(i); return m.san.length === (i === 7 ? 2 : 3) && Array.isArray(m.batDau) && m.batDau.length === m.san.length && Array.isArray(m.bongMo) && m.bongMo.length === m.san.length && m.nhipTheo === 'tong' && Array.isArray(m.vatChat[0]); }));
  kiem('mọi màn dùng nhipTheoLoiGiai (lệnh nam châm có wait() riêng nên lời giải chuẩn dài hơn đường ngắn nhất gộp nhịp)', che.every((m) => m.nhipTheoLoiGiai === true));

  for (const m of che) {
    const kho = khoTruoc(m.id);
    const khoNay = tron(kho, m.loiGiai.hamCuaEmMoi);
    const r = ChamHoc.cham(m, m.loiGiai, khoNay);
    kiem(m.id + ' ' + m.ten + ': lời giải cách 1 thắng 3 sao, ' + r.soO + ' ô = sao.o, ' + r.soNhip + ' nhịp = sao.nhip, không chẩn đoán nào (kể cả thông tin)',
      r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    const bfsGop = nhipCheNamChamTatCa(m, kho);
    const bfsTach = m.khoaHamMan ? null : nhipCheNamChamTatCa(m, kho, { tachNhip: true });
    BANG.push({ m, r, bfsGop, bfsTach });
    kiem(m.id + ': BFS đường ngắn nhất (lệnh nam châm gộp vào nhịp đi) = ' + bfsGop + ' ≤ sao.nhip ' + m.sao.nhip + (bfsTach !== null ? '; BFS tách nhịp (lệnh nam châm đứng một mình) = ' + bfsTach + ' ≤ sao.nhip' : ''),
      bfsGop !== null && bfsGop <= m.sao.nhip && (bfsTach === null || (bfsTach !== null && bfsTach <= m.sao.nhip)), 'BFS = ' + bfsGop + ' / ' + bfsTach + ', sao.nhip = ' + m.sao.nhip);
    if (m.chinhCoDinh) {
      const gui = ChamHoc.cham(m, { chinh: ['wait()', 'wait()', 'wait()'], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính gửi lên bị bỏ qua (kết quả y hệt lời giải)', J([gui.thang, gui.soO, gui.soNhip, gui.py]) === J([r.thang, r.soO, r.soNhip, r.py]) && m.maMau.chinh.length >= 1 && m.maMau.chinh.length <= m.khung.chinh);
      const rong = ChamHoc.cham(m, { chinh: [], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính RỖNG gửi lên vẫn chạy bản mẫu (cùng nhịp, cùng sao)', rong.thang === r.thang && rong.sao === r.sao && rong.soNhip === r.soNhip);
    } else {
      kiem(m.id + ': người chơi tự viết chương trình chính (maMau.chinh rỗng, lời giải ≤ 10 dòng, gọi hàm đã chế)', m.maMau.chinh.length === 0 && m.loiGiai.chinh.length >= 1 && m.loiGiai.chinh.length <= 10 && !ChamHoc.cham(m, { chinh: [] }, khoNay).thang);
    }
    // mục tiêu và bóng mờ
    if (m.mucTieu === 'bong-mo') {
      const dsB = [].concat(m.bongMo);
      kiem(m.id + ': bóng mờ nằm trên ô đi được; số vật mờ đúng bằng số vật của sân; chạy xong thắng đúng ở nhịp cuối (mọi sân)', sanCua(m).every((rows, i) => {
        const lm = SanHoc.lopMauCuaSan(m, i), sn = SanHoc.docSan(rows, lm.mau, lm.vatMau, lm.vatChat), bm = dsB[i];
        const rs = r.theoSan[i];
        return !SanHoc.lyDoChan(sn, 'banh', bm.x, bm.y) && bm.vat.length === sn.vat.length && bm.vat.every((q) => !SanHoc.lyDoChan(sn, 'banh', q.x, q.y)) && rs.thang && rs.bongMo.x === bm.x && rs.bongMo.huong === bm.huong &&
          rs.vet.filter((e) => e.loai === 'nhip').length === rs.soNhip && rs.vet.filter((e) => e.loai === 'nhip').slice(-1)[0].suKien.some((e) => e.ma === 'toi-bong-mo');
      }));
    } else {
      kiem(m.id + ': mục tiêu tới cờ F; sân có vật chắn lối', m.mucTieu === undefined && m.san.join('').includes('F') && /o/.test(m.san.join('')) && m.bongMo === undefined);
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
    const khoaTen = m.khoaHamMan || [];
    const suaTen = m.loiGiai.hamCuaEmMoi.map((h) => h.ten).concat(m.loiGiai.hamCuaMan.filter((h) => !khoaTen.includes(h.ten)).map((h) => h.ten));
    kiem(m.id + ': đề bài nhắc tên lệnh cần chế / sửa (' + (suaTen.join(', ') || 'màn dùng') + ')', suaTen.every((t) => (m.deBai + ' ' + (m.veMaMau || '')).includes(t + '()')), m.deBai);
    kiem(m.id + ': gợi ý 1–2 câu, không nói tên nút; đề 1–3 câu', m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && !/bấm|nút/i.test(m.goiY.join(' ')), m.deBai);
  }

  // luật riêng từng màn
  const m1 = man(1), k1 = khoTruoc(m1.id);
  kiem('20.1 Đá vật: chưa chế kick thì không thắng (xe đứng sẵn ở bóng mờ nhưng vật còn nằm giữa sân); vật mờ nằm ở mép trên (2,0) — vật chữ N bị đá trượt hết cột; BFS gộp 1 nhịp (magnet_n + wait) < sao.nhip 2',
    !ChamHoc.cham(m1, m1.maMau, k1).thang && J(m1.batDau) === J({ x: m1.bongMo.x, y: m1.bongMo.y, huong: m1.bongMo.huong }) && nhipCheNamChamTatCa(m1, k1) === 1 && m1.sao.nhip === 2);
  const m2 = man(2), k2 = khoTruoc(m2.id);
  kiem('20.2 Kéo lại gần: vật chữ S cách 3 ô, nằm sát trước mũi xe khi xong; dùng grip() đã chế; BFS = 2 nhịp = sao.nhip', m2.hamCuaEmCan.includes('grip') && k2.some((h) => h.ten === 'grip') && nhipCheNamChamTatCa(m2, k2) === 2 && SanHoc.docSan(m2.san, null, null, m2.vatChat).vat[0].cuc === 'S' && m2.bongMo.vat[0].y - SanHoc.docSan(m2.san).vat[0].y === 2);
  const m3 = man(3), k3 = khoTruoc(m3.id);
  const duongSai = ChamHoc.cham(m3, { chinh: ['move()', 'move()', 'move()', 'turn_right()', 'move()', 'move()'] }, k3);
  kiem('20.3 Dọn đường: hành lang hẹp có hai vật chắn lối (vật N giữa lối, vật S ở chỗ rẽ), có ngách cụt trên chỗ rẽ để đá vật N vào; không dọn thì đâm vật; lời giải gọi kick, grip, move, turn_right và dùng ≤ 10 dòng',
    maCua(duongSai).includes('dam-tuong') && !duongSai.thang && SanHoc.docSan(m3.san, null, null, m3.vatChat).vat.length === 2 && m3.loiGiai.chinh.length <= 10 && J([...new Set(m3.loiGiai.chinh.map((s) => s.replace('()', '')))].sort()) === J(['grip', 'kick', 'move', 'turn_right']));
  kiem('20.3: mang cả vật S theo tới cờ (xe dính vật chạm cờ vẫn thắng) — xe vào ô cờ khi còn dính vật S', (() => { const r3 = ChamHoc.cham(m3, m3.loiGiai, k3); return r3.thang && r3.namCham && r3.namCham.cam !== null; })());
  const m4 = man(4), k4 = khoTruoc(m4.id);
  kiem('20.4 Chuyền sang làn: vật chữ N cách 3 ô, xong nằm ở ô bên PHẢI xe (3,4); BFS gộp 3 (ngắt điện chung nhịp với quay trái) < sao.nhip 4', m4.bongMo.vat[0].x === m4.batDau.x + 1 && m4.bongMo.vat[0].y === m4.batDau.y && nhipCheNamChamTatCa(m4, k4) === 3 && m4.sao.nhip === 4);
  const m5 = man(5), k5 = khoTruoc(m5.id);
  const r5 = ChamHoc.cham(m5, m5.loiGiai, tron(k5, m5.loiGiai.hamCuaEmMoi));
  kiem('20.5 Phân loại: 3 sân (vật N cách 2, S cách 3, N cách 1); vật N sang bên phải xe, vật S sang bên trái; sort() đúng 8 dòng và dùng lane() + grip(); lời giải thắng cả ba sân, mỗi sân một mục theoSan, soNhip = tổng',
    r5.thang && r5.theoSan.length === 3 && r5.theoSan.every((s) => s.thang) && r5.soNhip === r5.theoSan.reduce((a, s) => a + s.soNhip, 0) && m5.loiGiai.hamCuaEmMoi[0].than.length === 8 && m5.hamCuaEmCan.includes('lane') &&
      J(m5.bongMo.map((b) => b.vat[0].x - b.x)) === '[1,-1,1]' && J(r5.theoSan.map((s) => s.soNhip)) === '[4,4,4]');
  const sai5 = ChamHoc.cham(m5, m5.loiSai[0].baiLam, tron(k5, m5.loiSai[0].hamCuaEmMoi));
  kiem('20.5: chuyền mọi vật sang phải thì sân 1 và 3 (vật N) thắng, sân 2 (vật S) thua', J(sai5.theoSan.map((s) => s.thang)) === '[true,false,true]', J(sai5.theoSan.map((s) => s.thang)));
  const m6 = man(6), k6 = khoTruoc(m6.id);
  const daThang = ChamHoc.cham(m6, m6.loiGiai, tron(k6, m6.loiGiai.hamCuaEmMoi));
  const daKick = ChamHoc.cham(m6, m6.loiGiai, tron(k6, [H('fling', ['magnet_n()', 'wait()'])]));
  kiem('20.6 Bắn vật: bắn (hút rồi đổi cực) đưa vật tới (2,2); đá thẳng từ chỗ cũ thì vật trượt tới (2,1), xa hơn vật mờ một ô → chỉ bắn mới thắng; ev day-vat có tuMui true', daThang.thang && !daKick.thang && ev({ vet: daThang.vet }, 'day-vat').some((e) => e.tuMui === true) && daKick.vat[0].y === 1);
  const m7 = man(7), k7 = khoTruoc(m7.id);
  const cu = ChamHoc.cham(m7, m7.maMau, k7);
  kiem('20.7 Dây cực đấu ngược: hàm của màn fixed_grip() cũ (giống grip) chạy sai ở cả hai sân (vật bị đẩy, day-vat); sửa đổi chỗ hai cực thì thắng cả hai sân; grip() trong kho cũng sai ở màn này', !cu.thang && cu.theoSan.every((s) => !s.thang) && maCua(cu).includes('day-vat') && ChamHoc.cham(m7, m7.loiGiai, k7).theoSan.every((s) => s.thang) &&
    !ChamHoc.cham(m7, { chinh: ['grip()', 'turn_right()', 'magnet_off()', 'wait()'] }, k7).thang);
  const chiSuaMot = ChamHoc.cham(m7, m7.loiSai[1].baiLam, k7);
  kiem('20.7: chỉ sửa một nhánh thì một sân thắng một sân thua (sân vật S vẫn hỏng)', chiSuaMot.theoSan.filter((s) => s.thang).length === 1, J(chiSuaMot.theoSan.map((s) => s.thang)));
  const m8 = man(8), k8 = khoTruoc(m8.id);
  const r8 = ChamHoc.cham(m8, m8.loiGiai, k8);
  kiem('20.8 Chỉ còn cực N: chỉ ĐẨY được vật chữ N; phải đá hai lần theo hai hướng (sang phải tới tường, xuống tới tường); lời giải ≤ 10 dòng; không dùng grip / lane (hỏng); BFS với cực N chỉ = ' + nhipCheNamChamTatCa(m8, k8) + ' ≤ sao.nhip 11',
    r8.thang && m8.loiGiai.chinh.length <= 10 && !m8.loiGiai.chinh.some((s) => /grip|reel|lane|sort|fling/.test(s)) && ev({ vet: r8.vet }, 'day-vat').length === 2 && nhipCheNamChamTatCa(m8, k8) <= 11);
  kiem('20.8: nếu có đủ cực S thì còn đường khác (kéo vật rồi mang): BFS với phần cứng đủ cực ngắn hơn hay bằng', nhipCheNamChamNganNhat(m8, { phanCung: SanHoc.phanCungCua(Object.assign({}, m8, { phanCung: undefined, hamGoc: KHAY })) }).nhip <= nhipCheNamChamTatCa(m8, k8));
  const m9 = man(9), k9 = khoTruoc(m9.id);
  const pre = ChamHoc.cham(Object.assign({}, m9, { chinhCoDinh: false }), { chinh: ['go_pull()'], hamCuaMan: m9.maMau.hamCuaMan }, k9);
  kiem('20.9 Đường về: go_pull() của màn đưa xe lên 2 ô và kéo vật chữ N cách 3 ô về (3 nhịp, xe dính vật); put_back() phải bắn vật về đúng chỗ cũ (2,0) rồi đưa xe về ô và hướng ban đầu; go_pull khóa và xem được',
    pre.theoSan[0].soNhip === 3 && pre.theoSan[0].robot.y === 3 && pre.theoSan[0].namCham.cam === 1 && J(m9.khoaHamMan) === '["go_pull"]' && m9.maMau.hamCuaMan.some((h) => h.ten === 'go_pull') && J(m9.bongMo) === J({ x: m9.batDau.x, y: m9.batDau.y, huong: m9.batDau.huong, diQua: [{ x: 2, y: 3 }], vat: [{ x: 2, y: 0 }] }) && pre.theoSan[0].diQua[0].da === true);
  kiem('20.9: put_back() là lệnh ngược của go_pull() theo thứ tự ngược: go_pull = move, move, grip (kéo bằng S) → put_back = magnet_n (đổi cực: bắn), back, back (move↔back, kéo ↔ bắn, S ↔ N); sửa go_pull gửi lên vẫn bị bản mẫu thay',
    J(m9.loiGiai.hamCuaMan.find((h) => h.ten === 'put_back').than) === J(['magnet_n()', 'wait()', 'back()', 'back()']) && (() => { const pb = m9.loiGiai.hamCuaMan.find((h) => h.ten === 'put_back'); const a = ChamHoc.cham(m9, { chinh: [], hamCuaMan: [H('go_pull', ['move()']), pb] }, k9); const b = ChamHoc.cham(m9, m9.loiGiai, k9); return J([a.thang, a.soO, a.soNhip]) === J([b.thang, b.soO, b.soNhip]) && b.sao === 3; })());
  const rp = ChamHoc.cham(m9, m9.maMau, k9);
  kiem('20.9: put_back() thân ban đầu chỉ có `pass`; để nguyên thì không thắng: lech-bong-mo; put_back KHÔNG khóa; không vào kho, không taoHam; ngắt điện thay vì bắn thì vật rơi ô sát mũi (2,2) chứ không về (2,1)',
    J(m9.maMau.hamCuaMan.map((h) => h.ten)) === '["go_pull","put_back"]' && J(m9.maMau.hamCuaMan[1].than) === J(['pass']) && !rp.thang && maCua(rp).includes('lech-bong-mo') && m9.taoHam.length === 0 && !k9.some((h) => h.ten === 'put_back') &&
      (() => { const r = ChamHoc.cham(m9, m9.loiSai[1].baiLam, k9); return !r.thang && r.vat.find((v) => v.chat === 'nam-cham').y === 2; })());
  kiem('20.9: vật ở hàng trên cùng: bắn từ ô sát mũi (2,2) trượt 2 ô, dừng ở mép sân (2,0) — đúng chỗ cũ — và bắn rồi lùi gộp nhịp (BFS 5 = 3 + 2) cũng về đúng chỗ', m9.san[0][2] === 'o' && nhipCheNamChamTatCa(m9, k9) === 5 && ChamHoc.cham(m9, m9.congThucKhac[0].baiLam, k9).thang);
  const m10 = man(10), k10 = khoTruoc(m10.id);
  const r10 = ChamHoc.cham(m10, m10.loiGiai, k10);
  const gh = ChamHoc.cham(m10, m10.loiSai[4].baiLam, k10);
  kiem('20.10 Kho từ: gioiHanHam 3 — lời giải gọi 2 hàm khác nhau (move, sort) vừa giới hạn; 4 hàm khác nhau bị qua-gioi-han-ham (lỗi khung, nêu "3"); ba sân khoảng cách khác nhau; trùm không khóa chương trình chính',
    r10.thang && J([...new Set(m10.loiGiai.chinh.filter((s) => /^\s*[a-z_]+\(\)$/.test(s)).map((s) => s.trim().replace('()', '')))].sort()) === J(['move', 'sort']) && maCua(gh).join() === 'qua-gioi-han-ham' && /3/.test(gh.chanDoan[0].loi) && !gh.thang && m10.chinhCoDinh !== true);
  kiem('20.10: viết cứng số bước (không while) thua ở ít nhất một sân; mỗi sân có đúng 3 vật nam châm xếp dọc cột giữa; nhịp mỗi sân 15, 14, 15', (() => {
    const cung = ChamHoc.cham(m10, m10.loiSai[0].baiLam, k10);
    return !cung.thang && cung.theoSan.filter((s) => s.thang).length < 3 && J(r10.theoSan.map((s) => s.soNhip)) === '[15,14,15]' &&
      sanCua(m10).every((rows, i) => SanHoc.docSan(rows, null, null, m10.vatChat[i]).vat.length === 3 && SanHoc.docSan(rows, null, null, m10.vatChat[i]).vat.every((v) => v.x === 2 && v.chat === 'nam-cham'));
  })());
  const khongFor = ChamHoc.cham(m10, m10.congThucKhac[0].baiLam, k10);
  kiem('20.10: công thức khác không dùng for (ba lần while + sort) chỉ nhiều ô hơn, vẫn 9 dòng ≤ 10', khongFor.thang && m10.congThucKhac[0].baiLam.chinh.length === 9 && khongFor.soO > r10.soO);

  console.log('\n  Bảng 10 màn che-nam-cham (lời giải cách 1, sao; BFS = nhịp ngắn nhất gộp lệnh nam châm · tách = lệnh nam châm một mình trong nhịp)');
  console.log('  màn   | tên                | ô  | nhịp | BFS | tách | tạo / sửa     | lời giải (chương trình chính)');
  for (const { m, bfsGop, bfsTach } of BANG) {
    console.log('  ' + m.id.padEnd(5) + ' | ' + m.ten.padEnd(18) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + String(m.sao.nhip).padEnd(4) + ' | ' + String(bfsGop).padEnd(3) + ' | ' + String(bfsTach === null ? '—' : bfsTach).padEnd(4) + ' | ' + (m.loiGiai.hamCuaEmMoi.map((h) => h.ten).join(',') || (m.loiGiai.hamCuaMan.length ? 'hàm của màn' : '—')).padEnd(13) + ' | ' + m.loiGiai.chinh.join(' ; '));
  }
}

/* ================================================================= 6. ĐƯỜNG BFS CHẠY THẬT */
console.log('\n== 6. Đường BFS (do-duong-che-nam-cham.mjs) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng nhịp BFS ==');
{
  for (const m of che.filter((x) => !x.khoaHamMan)) {
    const nhieu = Array.isArray(m.san[0]);
    const tung = sanCua(m).map((rows, i) => {
      const lm = SanHoc.lopMauCuaSan(m, i);
      const con = Object.assign({}, m, { san: rows, batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vatThem: lm.vatThem, bongMo: lm.bongMo || m.bongMo });
      const b = nhipCheNamChamNganNhat(con);
      const code = chuoiThanhMa(b.chuoi, m);
      const k = SanHoc.chay(cfgSan(m, i), code);
      return { b, k };
    });
    kiem(m.id + ': đường BFS ' + (nhieu ? 'từng sân ' : '') + '(' + tung.map((x) => x.b.nhip).join(' + ') + ' nhịp) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng số nhịp BFS, không lỗi', tung.every(({ b, k }) => k.thang === true && k.nhip === b.nhip && !k.loi), J(tung.map(({ b, k }) => [b.nhip, k.thang, k.nhip, k.loi])));
  }
  // màn 9: đoạn cố định + BFS
  const m9 = man(9), k9 = khoTruoc(m9.id);
  const bf = nhipCheNamChamTatCa(m9, k9);
  const pb = ['magnet_n()', 'back()', 'back()'];
  const r = ChamHoc.cham(m9, { chinh: m9.maMau.chinh, hamCuaMan: [m9.maMau.hamCuaMan[0], H('put_back', pb)] }, k9);
  kiem('20.9: tính cả đoạn go_pull() cố định (3 nhịp chạy thật) + BFS còn lại 2 = ' + bf + '; đường gộp nhịp tương ứng (magnet_n + back chung nhịp, rồi back) chạy thật thắng đúng ' + bf + ' nhịp', bf === 5 && r.thang && r.soNhip === bf, J([bf, r.thang, r.soNhip]));
  // bộ dò tự kiểm
  const m1 = man(1);
  kiem('bộ dò tự kiểm: bỏ vật mờ ở 20.1 (chỉ cần xe đứng đúng chỗ) thì chương trình rỗng là xong: 0 nhịp', nhipCheNamChamNganNhat(Object.assign({}, m1, { bongMo: { x: m1.bongMo.x, y: m1.bongMo.y, huong: 0 } })).nhip === 0);
  kiem('bộ dò: phần cứng thiếu cực S (20.1 vật N): đá vẫn được (1 nhịp); thiếu magnet_n: vật N phải bị hút rồi thả… không đá được: nhiều nhịp hơn hay không giải được', (() => {
    const b0 = nhipCheNamChamNganNhat(m1).nhip, b1 = nhipCheNamChamNganNhat(m1, { phanCung: SanHoc.phanCungCua(m1).filter((t) => t !== 'magnet_s') }).nhip, b2 = nhipCheNamChamNganNhat(m1, { phanCung: SanHoc.phanCungCua(m1).filter((t) => t !== 'magnet_n') }).nhip;
    return b0 === 1 && b1 === 1 && (b2 === null || b2 > 1);
  })());
  kiem('bộ dò: gioiHan toiDaTrangThai nhỏ → catNgang true (không kết luận)', nhipCheNamChamNganNhat(man(10).san ? Object.assign({}, man(10), { san: man(10).san[0], batDau: man(10).batDau[0], vatChat: man(10).vatChat[0], bongMo: man(10).bongMo[0] }) : m1, { toiDaTrangThai: 100 }).catNgang === true);
}

/* ================================================================= 7. KHO CUỐI GAME */
console.log('\n== 7. Kho hàm của em ==');
{
  const cuoi = khoTruoc('het');
  kiem('kho cuối game có đủ năm hàm của che-nam-cham, grip và fetch của nam-cham và tên cốt truyện khóa; fixed_grip, go_pull, put_back (hàm của màn) không có trong kho', ['kick', 'reel', 'lane', 'sort', 'fling', 'grip', 'fetch'].every((t) => cuoi.some((h) => h.ten === t)) && ['fixed_grip', 'go_pull', 'put_back'].every((t) => !cuoi.some((h) => h.ten === t)));
  const sach = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  kiem('KhoHam khóa tên: người chơi không tạo được hàm tên kick / reel / lane / sort / fling / grip bằng tên trùng ngoài màn chế nó', ['kick', 'reel', 'lane', 'sort', 'fling', 'grip'].every((t) => tenCotTruyen.includes(t)) && sach.tao('kick', [], {}).ok === false);
}

/* ================================================================= 8. THẺ SCRIPT CỦA GAME */
console.log('\n== 8. game/choi.html nạp man-che-nam-cham.js đúng thứ tự ==');
{
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có thẻ script ../man-che-nam-cham.js đúng một lần, sau man-nam-cham.js và trước man-may-nem.js (cùng sổ màn)', tags.filter((t) => t === '../man-che-nam-cham.js').length === 1 && vtri('man-che-nam-cham.js') > vtri('man-nam-cham.js') && vtri('man-che-nam-cham.js') < vtri('man-may-nem.js'), J(tags));
  kiem('so-lenh.js nạp trước man-che-nam-cham.js', vtri('so-lenh.js') >= 0 && vtri('so-lenh.js') < vtri('man-che-nam-cham.js'));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

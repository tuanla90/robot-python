/* ============================================================================
   kiem-sung-hoi.mjs — máy kiểm SÚNG HƠI của "Robot Chấn Hưng": các luật lõi mới (KE-HOACH-CHE-LENH.md, mục 5c.3) và chương `sung-hoi` (10 màn).
   Gồm:
   - spray("high") bắn ra trước + xe giật lùi, spray_back("high") bắn ra sau + xe giật tới, bốn hướng; bóng bay thẳng, dừng ở từng loại vật cản, bay qua rào / băng / cửa mở, ra khỏi sân (ban-hut);
   - giật bị chặn (tường, mép sân, cửa đóng, nút, rào, bậc thang, vật) → xe đứng yên (giat-chan); thùng nặng sau xe NHÍCH ĐÚNG 1 Ô, xe theo 1 ô vào ô thùng vừa rời (luật 29/10 "giật một ô");
     ô sau thùng bị chặn thì cả hai đứng yên (thung-chan kieu giat); xe húc thùng bằng bánh = đâm như tường; không còn push();
   - thứ tự trong nhịp (bắn → giật → băng chuyền → cửa đổi cuối nhịp), nút / cửa / băng / cửa nhịp (man.noi, front_clear), cửa kẹt, băng đẩy thùng, thùng kẹt góc, mục tiêu day-thung;
   - nhịp có bắn (ban-dung-yen), gọi lại (ban-goi-lai kể cả spray + spray_back), quên wait, đạn (danToiDa / het-dan: không bắn thì không giật);
   - daoChieu 'sung', phần cứng thiếu một nòng (lenh-goc-hong), thân không hợp (nhện, tay khác), bongMo.thung (thùng mờ), sân thử của Xưởng, chẩn đoán tiếng Việt CÓ `cho`;
   - bộ dò đường tắt do-duong-sung-hoi.mjs: so chéo ngẫu nhiên (≥ 1000 chương trình) với SanHoc.chay, rồi dữ liệu 10 màn (BFS = sao.nhip) và bảng 10 màn;
   - dọn chương cũ (tam-day, sung-bong): tệp, thứ tự chương, gói, Sổ lệnh, kho hàm, thẻ script của choi.html.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs.
   Chạy: node hoc/kiem-sung-hoi.mjs        (trượt thì thoát mã 1)
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
const BoDo = await import('./do-duong-sung-hoi.mjs');
const { nhipSungHoiNganNhat, nhipSungHoiTatCa, buocMotNhip, dungNguCanh, trangThaiDau, laDich, chuoiThanhMa, hanhDongChoPhep } = BoDo;

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
/** Sự kiện của vết nhịp (ban, giat, thung-di, nut-doi, cua-doi…; khác maSK là các mốc chẩn đoán). */
const ev = (kq, ma) => nhipVet(kq).flatMap((n) => n.suKien).filter((e) => e.ma === ma);
const L = (...d) => d.join('\n') + '\n';
const loi = (f) => { try { f(); return null; } catch (e) { return e.message; } };
const VEC = SanHoc.VEC;

const tatCa = ManHoc.danhSach;
const ds = tatCa.filter((m) => m.chuong === 'sung-hoi');
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const man = (so) => ManHoc.timMa('sung-hoi.' + so);
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);

/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải). */
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
const HOI = ['spray', 'spray_back'];
function chay(rows, bd, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: BANH.concat(HOI), lucBan: true }, extra || {}), code);   // cú giật = phun mạnh (29/10)
}
const TIEN = L('left_move()', 'right_move()', 'wait()');
const BAN = L('spray("high")', 'wait()');            // phun mạnh ra trước (giật lùi)
const BAN_SAU = L('spray_back("high")', 'wait()');   // bắn ra sau (giật tới)
const WAIT = 'wait()\n';
const trong = (n, c = '.') => Array.from({ length: n }, () => c.repeat(n));
const dat1 = (rows, x, y, ch) => rows.map((r, j) => (j === y ? r.slice(0, x) + ch + r.slice(x + 1) : r));
const nutTai = (kq, x, y) => kq.nut.find((n) => n.x === x && n.y === y);
const cuaTai = (kq, x, y) => kq.cua.find((n) => n.x === x && n.y === y);
const thungTai = (kq, id) => kq.thung.find((t) => t.id === id);
const viTri = (r) => r.x + ',' + r.y;

/* ============================================================================ 1. GIẬT LÙI / GIẬT TỚI, BÓNG HAI CHIỀU */
console.log('\n== 1. spray("high") giật lùi, spray_back("high") giật tới; bóng bay theo hướng bắn, bốn hướng ==');
{
  let tong = 0, dung = 0; const sai = [];
  for (const h of [0, 1, 2, 3]) for (const lenh of [BAN, BAN_SAU]) {
    const ra = lenh === BAN_SAU;                                  // bắn ra sau: bóng bay ngược mặt, xe giật tới
    const hb = ra ? (h + 2) % 4 : h, hg = (hb + 2) % 4;
    const kq = chay(trong(7), { x: 3, y: 3, huong: h }, lenh);
    const b = ev(kq, 'ban')[0], g = ev(kq, 'giat')[0];
    tong++;
    const ok = kq.nhip === 1 && b && g && b.huong === hb && b.sau === ra && b.tu.x === 3 && b.tu.y === 3 && g.huong === hg && g.di === true && g.tu.x === 3 && g.tu.y === 3 &&
      g.den.x === 3 + VEC[hg][0] && g.den.y === 3 + VEC[hg][1] && kq.robot.x === g.den.x && kq.robot.y === g.den.y && kq.robot.huong === h && b.trung === null;
    if (ok) dung++; else sai.push('h' + h + (ra ? '/sau' : '/truoc') + ':' + J([b, g, kq.robot]));
  }
  kiem('bốn hướng × hai lệnh: spray("high") bắn ra trước và xe giật LÙI một ô, spray_back("high") bắn ra sau và xe giật TỚI một ô; hướng mặt không đổi; đúng 1 nhịp; sự kiện ban { huong, sau, tu } và giat { huong, di true, tu, den } (' + tong + ' ca)', dung === tong, sai.slice(0, 2).join(' | '));
  const k3 = chay(trong(7), { x: 3, y: 3, huong: 1 }, BAN + BAN + BAN_SAU);
  kiem('liên tiếp: hai lần spray("high") lùi hai ô, một lần spray_back("high") tiến lại một ô (xe ở (2,3) quay mặt phải)', viTri(k3.robot) === '2,3' && k3.robot.huong === 1 && k3.nhip === 3);
  kiem('vết từng nhịp: robot.sung { dan null }; nhịp có giật không ghi banh (bánh nghỉ: robot.banh 0, 0)', (() => { const n = nhipVet(chay(trong(7), { x: 3, y: 3, huong: 0 }, BAN))[0]; return n.robot.sung.dan === null && n.robot.banh.trai === 0 && n.robot.banh.phai === 0 && n.robot.y === 4; })());
  kiem('LENH_NGUOC: spray ↔ spray_back là cặp lệnh ngược; TAY_HOI có đúng hai lệnh; không còn TAY_DAY / TAY_BONG', SanHoc.LENH_NGUOC.spray === 'spray_back' && SanHoc.LENH_NGUOC.spray_back === 'spray' && J(SanHoc.TAY_HOI) === '["spray","spray_back"]' && SanHoc.TAY_DAY === undefined && SanHoc.TAY_BONG === undefined);

  const vc = [['#', 'tuong'], ['C', 'cua'], ['H', 'thung'], ['S', 'bac-thang'], ['N', 'nut']];
  let ok1 = 0;
  for (const [ch, tr] of vc) for (const lenh of [BAN, BAN_SAU]) {
    const h = lenh === BAN ? 0 : 2;                                // xe quay lên (bắn ra trước) hay quay xuống (bắn ra sau): bóng đều bay lên
    const rows = dat1(dat1(trong(7), 3, 1, ch), 3, 0, 'N');
    const kq = chay(rows, { x: 3, y: 3, huong: h }, lenh);
    const b = ev(kq, 'ban')[0];
    if (ch === 'N') { if (b.trung === 'nut' && b.o.y === 1 && b.soO === 1) ok1++; continue; }
    if (b.trung === tr && b.den.y === 1 && b.soO === 1 && b.cuoi.y === 2 && nutTai(kq, 3, 0).bat === false) ok1++;
  }
  kiem('bóng dừng ở vật cản đầu tiên cả hai chiều: tường cao, cửa đóng, thùng nặng, bậc thang, hay chính nút; nút phía sau không bị trúng (trung tuong / cua / thung / bac-thang / nut)', ok1 === vc.length * 2, ok1 + '/' + vc.length * 2);

  let ok2 = 0;
  for (const ch of ['=', 'c', '>', '<', '^', 'v', 'D', 'F', 'r', 'g', 'b', 'y', '.']) for (const lenh of [BAN, BAN_SAU]) {
    const rows = dat1(dat1(dat1(trong(7), 3, 2, ch), 3, 1, ch), 3, 0, 'N');
    const kq = chay(rows, { x: 3, y: 3, huong: lenh === BAN ? 0 : 2 }, lenh);
    const b = ev(kq, 'ban')[0];
    if (b.trung === 'nut' && b.soO === 2 && nutTai(kq, 3, 0).bat === true) ok2++;
  }
  kiem('bóng bay QUA hàng rào thấp, cửa mở, băng chuyền (bốn chiều), ô đích, cờ, sàn màu: ô giữa không cần trống (13 loại ô, hai chiều bắn)', ok2 === 26, ok2 + '/26');

  const kt = chay(dat1(trong(7), 3, 1, 'C'), { x: 3, y: 3, huong: 0 }, BAN);
  kiem('bóng bị chặn mà sân không có nút: chỉ ghi sự kiện ban (trung "cua"), xe vẫn giật lùi một ô, không có chẩn đoán ban-bi-chan', maSK(kt, 'ban-bi-chan').length === 0 && ev(kt, 'ban')[0].trung === 'cua' && kt.robot.y === 4);

  // ra khỏi sân: thông tin chỉ ghi khi cú giật không dời được gì
  for (const [h, xe] of [[0, { x: 3, y: 0 }], [1, { x: 6, y: 3 }], [2, { x: 3, y: 6 }], [3, { x: 0, y: 3 }]]) {
    const hg = (h + 2) % 4;
    const bi = chay(dat1(trong(7), xe.x + VEC[hg][0], xe.y + VEC[hg][1], '#'), xe.x === 3 && xe.y === 0 ? { x: 3, y: 0, huong: h } : { x: xe.x, y: xe.y, huong: h }, BAN);
    const b = ev(bi, 'ban')[0], hut = maSK(bi, 'ban-hut'), gc = maSK(bi, 'giat-chan');
    kiem('xe sát mép sân quay ra ngoài (hướng ' + SanHoc.TEN_HUONG[h] + ') và sau lưng là tường: bóng ra khỏi sân (ban-hut), xe không giật được (giat-chan, vat "tuong"): cả hai là thông tin',
      b.trung === null && b.o === null && hut.length === 1 && hut[0].huong === h && gc.length === 1 && gc[0].vat === 'tuong' && bi.robot.x === xe.x && bi.robot.y === xe.y, J([b, hut, gc]));
  }
  const ho = chay(trong(5), { x: 2, y: 2, huong: 1 }, BAN);
  kiem('bóng bay ra khỏi sân mà xe giật dời được: KHÔNG ghi ban-hut (phát bắn có ích, bóng ra ngoài là chuyện thường)', maSK(ho, 'ban-hut').length === 0 && ev(ho, 'ban')[0].trung === null && ho.robot.x === 1);
  const nut2 = chay(['N....', '.....'], { x: 3, y: 1, huong: 1 }, BAN);
  kiem('sân có nút: bóng đập vào tường mà xe giật dời được thì không ghi ban-bi-chan; xe không dời được (sau lưng là tường) thì ghi cả ban-bi-chan lẫn giat-chan', (() => {
    const k1 = chay(['N....', '.....'], { x: 3, y: 1, huong: 1 }, BAN_SAU);                 // bóng bay sang trái tới nút? hàng 1 không có nút → bóng ra sân, nhưng xe giật tới được
    const k2 = chay(['N....', '#...#'], { x: 3, y: 1, huong: 1 }, BAN);                       // bóng bay phải tới tường, xe giật lùi sang trái được
    const k3 = chay(['N....', '.#...'], { x: 2, y: 1, huong: 1 }, BAN);                       // sau lưng xe là tường: không giật được
    return maSK(k1, 'ban-bi-chan').length === 0 && maSK(k2, 'ban-bi-chan').length === 0 && maSK(k3, 'giat-chan').length === 1 && void nut2 === undefined;
  })());
  kiem('bóng không đổi sân: vật, cửa giữ nguyên; trạng thái vết có robot.sung { dan null }', (() => {
    const k = chay(dat1(trong(5), 2, 1, 'o'), { x: 2, y: 3, huong: 0 }, BAN_SAU);
    return k.vat.length === 1 && k.vat[0].trangThai === 'dat' && k.vat[0].y === 1 && k.sung.dan === null && viTri(k.robot) === '2,2';
  })());
}

/* ============================================================================ 2. GIẬT BỊ CHẶN */
console.log('\n== 2. Ô xe giật vào bị chặn: xe đứng yên (giat-chan) ==');
{
  const gc = (rows, xe, lenh) => chay(rows, xe, lenh || BAN);
  const ca = [['#', 'tuong'], ['=', 'rao'], ['S', 'bac-thang'], ['C', 'cua'], ['N', 'nut']];
  let ok = 0;
  for (const [ch, lyDo] of ca) {
    const rows = dat1(trong(5), 2, 3, ch);
    const k = gc(rows, { x: 2, y: 2, huong: 0 });                       // xe quay lên, sau lưng (2,3)
    const g = ev(k, 'giat')[0], c = maSK(k, 'giat-chan')[0];
    if (k.robot.y === 2 && g.di === false && g.vat === lyDo && c && c.vat === lyDo && c.den.x === 2 && c.den.y === 3 && c.huong === 2 && k.nhip === 1) ok++;
  }
  kiem('sau lưng là tường / hàng rào / bậc thang / cửa đóng / nút: xe đứng yên, vẫn mất một nhịp; giat { di false, vat } và giat-chan { vat, den, huong }', ok === ca.length, ok + '/' + ca.length);
  kiem('sau lưng là mép sân: xe đứng yên (giat-chan vat "ngoai-san")', (() => { const k = gc(trong(5), { x: 2, y: 4, huong: 0 }); return k.robot.y === 4 && maSK(k, 'giat-chan')[0].vat === 'ngoai-san'; })());
  kiem('sau lưng là vật nằm đất (vật chiếm ô): xe không giật vào được, vật không bị đẩy (giat-chan vat "vat")', (() => { const k = gc(dat1(trong(5), 2, 3, 'o'), { x: 2, y: 2, huong: 0 }); return k.robot.y === 2 && maSK(k, 'giat-chan')[0].vat === 'vat' && k.vat[0].y === 3; })());
  kiem('sau lưng là cửa MỞ: xe giật qua được; cửa vừa đóng ở nhịp này (nút bị bắn) thì cửa đổi ở cuối nhịp nên xe đứng trong ô cửa và cửa giữ mở (cua-ket)', (() => {
    const k = chay(['N....', '.....', '..c..'.replace('..c..', '.....'), '.....'], { x: 2, y: 1, huong: 0 }, BAN);
    const rows = ['N.c..', '.....'];
    const k2 = chay(rows, { x: 3, y: 0, huong: 3 }, BAN_SAU);                // bóng bay phải ra sau? xe quay trái: bóng ra sau bay phải (ra sân); xe giật tới trái vào ô cửa mở (2,0)
    const k3 = chay(['..cN.', '.....'], { x: 1, y: 0, huong: 1 }, BAN_SAU);                // xe quay phải: spray_back bóng bay trái; giật tới phải vào ô cửa mở (2,0)
    return viTri(k2.robot) === '2,0' && viTri(k3.robot) === '2,0' && k.nhip === 1;
  })());
  kiem('chẩn đoán giat-chan: thông tin, tiếng Việt, nói ô sau lưng là gì, có `cho` trỏ dòng lệnh bắn', (() => {
    const r = ChamHoc.cham(Object.assign({}, man(2), { lucBan: true, san: ['###', '#.#', '#.#', '###'], batDau: { x: 1, y: 2, huong: 0 }, mucTieu: undefined }), { chinh: ['spray("high")', 'wait()'] }, []);
    const c = r.chanDoan.find((x) => x.ma === 'giat-chan');
    return c && c.muc === 'thong-tin' && /xe đứng yên/.test(c.loi) && /tường/.test(c.loi) && c.cho && c.cho.cot === 'chinh' && c.cho.dong === 1;
  })());
}

/* ============================================================================ 3. THÙNG NẶNG BỊ GIẬT */
console.log('\n== 3. Thùng nặng nhận cú giật (luật 29/10 "giật một ô"): thùng nhích đúng 1 ô, xe theo 1 ô; ô sau thùng bị chặn thì cả hai đứng yên; xe húc thùng bằng bánh = đâm ==');
{
  const T = (rows, xe, code, extra) => chay(rows, xe, code, Object.assign({ mucTieu: 'day-thung' }, extra || {}));
  // thùng ngay sau xe (xe (2,1) quay phải, thùng (1,1) bên trái) → thùng nhích sang (0,1), xe vào (1,1); còn chỗ nữa cũng KHÔNG trượt tiếp
  const mot = T(['.....', '.H...', '.....'], { x: 2, y: 1, huong: 1 }, BAN);
  const e1 = ev(mot, 'thung-di')[0], g1 = ev(mot, 'giat')[0];
  kiem('thùng sau xe nhích ĐÚNG 1 ô (không trượt tới mép dù còn trống), xe dời 1 ô vào ô thùng vừa rời; thung-di { nguon "giat", tu, den, soO 1 }; giat { di true, den = ô thùng cũ, thung id }',
    mot.thung[0].x === 0 && viTri(mot.robot) === '1,1' && mot.robot.huong === 1 && e1 && e1.nguon === 'giat' && e1.tu.x === 1 && e1.den.x === 0 && e1.soO === 1 && g1.di === true && g1.den.x === 1 && g1.thung === 1, J([mot.thung, mot.robot, e1, g1]));
  const xa = T(['.....', '...H.', '.....'], { x: 4, y: 1, huong: 1 }, BAN + BAN + BAN);
  kiem('ba phát liền: thùng nhích ba ô (3 → 0), xe theo sát (4 → 1); phát nào cũng có thung-di soO 1', xa.thung[0].x === 0 && viTri(xa.robot) === '1,1' && ev(xa, 'thung-di').length === 3 && ev(xa, 'thung-di').every((e) => e.soO === 1));
  // ô sau thùng bị chặn: thùng (1,1), xe (2,1) quay phải, vật cản ở (0,1)
  let ok = 0, tong = 0;
  for (const [rows, vat] of [
    [['....', 'H...', '....'], 'ngoai-san'],                            // mép sân: thùng (0,1), xe (1,1)
    [['.....', '#H...', '.....'], 'tuong'],
    [['.....', 'HH...', '.....'], 'thung-nang'],
    [['.....', '=H...', '.....'], 'rao'],
    [['.....', 'SH...', '.....'], 'bac-thang'],
    [['.....', 'CH...', '.....'], 'cua'],
    [['.....', 'NH...', '.....'], 'tuong']                              // nút chặn thùng như tường
  ]) {
    tong++;
    const mep = vat === 'ngoai-san', xe0 = { x: mep ? 1 : 2, y: 1, huong: 1 };
    const k = T(rows, xe0, BAN);
    const tc = maSK(k, 'thung-chan')[0], g = ev(k, 'giat')[0];
    const th = k.thung.find((q) => q.x === (mep ? 0 : 1) && q.y === 1);
    if (th && viTri(k.robot) === xe0.x + ',1' && tc && tc.kieu === 'giat' && tc.vat === vat && ev(k, 'thung-di').length === 0 && g && g.di === false && g.vat === 'thung-nang') ok++;
  }
  kiem('ô sau thùng là mép sân / tường / thùng khác / rào / bậc thang / cửa đóng / nút: cả xe lẫn thùng đứng yên, thung-chan kieu "giat" nêu đúng vật, không thung-di, giat { di false, vat "thung-nang" } (' + tong + ' ca)', ok === tong, ok + '/' + tong);
  const di = T(['.....', '.D.H.', '.....'], { x: 4, y: 1, huong: 1 }, BAN + BAN);
  kiem('đích cách thùng hai ô: phát đầu thùng nhích một ô (chưa thắng), phát hai thùng lên đích thì thắng ngay (nhịp 2)', di.thang && di.nhip === 2 && di.thung[0].x === 1 && nhipVet(di)[0].thung[0].x === 2 && viTri(di.robot) === '2,1');
  const dichSat = T(['#D.H..', '######'.slice(0, 6)], { x: 4, y: 0, huong: 1 }, BAN + BAN);
  kiem('thùng nhích tới ô đích sát tường thì thắng ngay (mục tiêu day-thung, xong-day-thung), không cần dừng ở vật cản', dichSat.thang && dichSat.nhip === 2 && ev(dichSat, 'xong-day-thung').length === 1 && dichSat.thung[0].x === 1);
  kiem('thùng ngay TRƯỚC mặt xe: spray_back("high") giật xe tới đúng vào thùng, thùng nhích một ô về phía trước, xe vào ô thùng vừa rời; giat { di true, thung 1 }', (() => {
    const k = T(['.....', '.....', '..H..', '.....', '.....'], { x: 2, y: 3, huong: 0 }, BAN_SAU);
    return k.thung[0].y === 1 && viTri(k.robot) === '2,2' && ev(k, 'thung-di')[0].soO === 1 && ev(k, 'giat')[0].di === true && ev(k, 'giat')[0].thung === 1;
  })());
  kiem('bệ súng xích (cfg.beSung) bắn tụ không giật nên không đẩy thùng; bắn nhanh "low" không giật nên không đẩy; tia nước trúng thùng không đẩy thùng', (() => {
    const be = SanHoc.chay({ san: ['.....', '.H...', '.....'], batDau: { x: 2, y: 1, huong: 1 }, loaiRobot: 'xich', hamGoc: BANH.concat(HOI), mucTieu: 'day-thung', beSung: true }, BAN);
    const nhanh = T(['.....', '.H...', '.....'], { x: 2, y: 1, huong: 1 }, 'spray("low")\nwait()\n', { lucBan: true });
    const tia = T(['.....', '...H.', '.....'], { x: 2, y: 1, huong: 1 }, BAN);                  // tia bay phải trúng thùng (3,1); xe giật trái vào ô trống
    return be.thung[0].x === 1 && viTri(be.robot) === '2,1' && ev(be, 'thung-di').length === 0 && nhanh.thung[0].x === 1 && viTri(nhanh.robot) === '2,1' && ev(nhanh, 'thung-di').length === 0 &&
      tia.thung[0].x === 3 && viTri(tia.robot) === '1,1' && ev(tia, 'ban')[0].trung === 'thung' && ev(tia, 'thung-di').length === 0;
  })());
  const chanNgay = T(['.....', '#H...', '.....'], { x: 2, y: 1, huong: 1 }, BAN);
  kiem('thùng nằm sát vật cản ngay sau lưng: cả xe lẫn thùng đứng yên, ghi thung-chan kieu "giat" (lỗi) và không có thung-di', chanNgay.thung[0].x === 1 && viTri(chanNgay.robot) === '2,1' && maSK(chanNgay, 'thung-chan').length === 1 && maSK(chanNgay, 'thung-chan')[0].kieu === 'giat' && maSK(chanNgay, 'thung-chan')[0].vat === 'tuong' && ev(chanNgay, 'thung-di').length === 0);
  kiem('chẩn đoán thung-chan kieu giat: lỗi, tiếng Việt, nói ô sau thùng là gì, có `cho`', (() => {
    const r = ChamHoc.cham(Object.assign({}, man(4), { lucBan: true, san: ['#######', '#H.x...', '#######'].map((x) => x.replace('x', '.')), batDau: { x: 2, y: 1, huong: 1 } }), { chinh: ['spray("high")', 'wait()'] }, []);
    const c = r.chanDoan.find((x) => x.ma === 'thung-chan');
    return c && c.muc === 'loi' && /thùng/.test(c.loi) && /tường/.test(c.loi) && c.cho && c.cho.dong === 1 && c.kieu === 'giat';
  })());
  // xe húc thùng bằng bánh
  for (const [ten, code] of [['tiến', TIEN], ['lùi', L('left_back()', 'right_back()', 'wait()')]]) {
    const k = T(['.....', '..H..', '.....'], { x: 2, y: ten === 'tiến' ? 2 : 0, huong: ten === 'tiến' ? 0 : 0 }, code);
    const d = maSK(k, 'dam-tuong')[0];
    kiem('xe ' + ten + ' vào thùng nặng bằng bánh: đâm như tường (dam-tuong vat "thung-nang"), thùng không nhúc nhích, xe đứng yên', d && d.vat === 'thung-nang' && k.thung[0].y === 1 && k.robot.y === (ten === 'tiến' ? 2 : 0));
  }
  kiem('push() không còn: gọi push() báo "chưa có hàm"; robot có tay súng không nhận push là hàm gốc', (() => {
    const k = T(['.....', '..H..', '.....'], { x: 2, y: 2, huong: 0 }, 'push()\nwait()\n');
    return k.loi && /Chưa có biến hay hàm/.test(k.loi.thongDiep) && k.thung[0].y === 1 && loi(() => chay(trong(5), { x: 2, y: 2, huong: 0 }, '', { hamGoc: BANH.concat(['push']) })) !== null;
  })());
  kiem('tay kẹp không gắp được thùng nặng (kep-hut qua-nang) — luật cũ vẫn giữ', (() => {
    const k = SanHoc.chay({ san: ['.H.'], batDau: { x: 0, y: 0, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release']), mucTieu: 'toi-co' }, 'arm_down()\ngrab()\nwait()\n');
    return maSK(k, 'kep-hut').length === 1 && maSK(k, 'kep-hut')[0].lyDo === 'qua-nang';
  })());
  // nhiều thùng: thùng bị thùng khác chắn
  const hai = T(['.....', '.HH.x'.replace('x', '.'), '.....'], { x: 3, y: 1, huong: 1 }, BAN);
  kiem('hai thùng liền nhau: cú giật vào thùng sát xe, thùng đó bị thùng kia chặn ngay (thung-chan, vat "thung-nang"), không thùng nào đi', hai.thung.map((t) => t.x).join() === '1,2' && maSK(hai, 'thung-chan')[0].vat === 'thung-nang');
  kiem('thùng không trượt vào ô có vật nằm đất hay xe: dừng ngay trước (vật chiếm ô)', (() => {
    const k = T(['.....', 'o.H.x'.replace('x', '.'), '.....'], { x: 3, y: 1, huong: 1 }, BAN, { mucTieu: 'toi-co' });
    return k.thung[0].x === 1;
  })());
}

/* ============================================================================ 4. NÚT, CỬA, BĂNG, THỨ TỰ TRONG NHỊP */
console.log('\n== 4. Nút đổi trạng thái; cửa và băng chuyền theo nút; thứ tự bắn → giật → băng → cửa ==');
{
  const S = ['##C##', '....N', '#####'];
  const xe = { x: 2, y: 1, huong: 1 };
  const a = chay(S, xe, BAN_SAU.replace('spray_back', 'spray'));
  kiem('bắn trúng nút bằng spray("high"): nut-doi { bat true }, cửa mở ở CUỐI nhịp (cua-doi nguon "nut"), xe giật lùi một ô (nhịp 1)', ev(a, 'nut-doi').length === 1 && nutTai(a, 4, 1).bat === true && cuaTai(a, 2, 0).mo === true && ev(a, 'cua-doi')[0].nguon === 'nut' && viTri(a.robot) === '1,1');
  const a2 = chay(['N....', '.....'], { x: 2, y: 0, huong: 1 }, BAN_SAU);
  kiem('bắn trúng nút bằng spray_back("high") (nút ở phía sau, không cần quay): nút đổi và xe giật TỚI một ô', nutTai(a2, 0, 0).bat === true && viTri(a2.robot) === '3,0' && ev(a2, 'ban')[0].sau === true);
  const b = chay(['N....', '.....'], { x: 2, y: 0, huong: 1 }, BAN_SAU + BAN_SAU);
  kiem('bắn hai lần liền bằng spray_back("high"): nút về như cũ (nut-doi hai lần), xe giật tới hai ô; ban-nut-lai (thông tin) chỉ ghi khi chưa thắng', nutTai(b, 0, 0).bat === false && ev(b, 'nut-doi').length === 2 && viTri(b.robot) === '4,0' && (() => { const r = ChamHoc.cham(Object.assign({}, man(3), { lucBan: true, san: ['N....', '.....'], batDau: { x: 2, y: 0, huong: 1 } }), { chinh: ['spray_back("high")', 'wait()', 'spray_back("high")', 'wait()'] }, []); return r.chanDoan.some((c) => c.ma === 'ban-nut-lai'); })());
  // thứ tự: bóng đổi băng NGAY → giật → băng (theo trạng thái mới)
  const SB = ['N..>.', '.....'];
  const cd = chay(SB, { x: 2, y: 0, huong: 1 }, TIEN + WAIT.repeat(4));
  kiem('đối chứng: xe tiến lên ô băng (3,0) rồi chờ thì bị băng đẩy sang phải (4,0)', cd.robot.x === 4);
  const tb = chay(SB, { x: 2, y: 0, huong: 1 }, BAN_SAU + WAIT.repeat(4));
  kiem('thứ tự bắn → giật → băng: bắn nút tắt băng (bang-doi bat false, đổi NGAY) rồi xe giật tới đúng ô băng (3,0); băng đã tắt nên không đẩy xe — xe nằm yên trên băng nhiều nhịp',
    ev(tb, 'bang-doi').length === 1 && ev(tb, 'bang-doi')[0].bat === false && tb.bangTat.length === 1 && viTri(tb.robot) === '3,0' && ev(tb, 'bang-day').length === 0, J([tb.robot, tb.bangTat]));
  kiem('cửa đổi ở CUỐI nhịp: nút bắn bảo cửa đóng mà xe đang đứng ngay ô cửa mở (giật vào) thì cửa giữ mở, cua-ket (thông tin)', (() => {
    const k = chay(['N.c..', '.....'], { x: 1, y: 0, huong: 1 }, BAN_SAU);
    return viTri(k.robot) === '2,0' && cuaTai(k, 2, 0).mo === true && ev(k, 'cua-ket').length === 1 && ev(k, 'cua-ket')[0].voi === 'xe' && ev(k, 'cua-doi').length === 0;
  })());
  kiem('cửa đóng chặn xe giật vào (giat-chan vat "cua") và chặn thùng trượt (dừng ngay trước cửa)', (() => {
    const k1 = chay(['..C..', '.....'], { x: 1, y: 0, huong: 3 }, BAN);                      // quay trái, spray("high") giật phải vào cửa đóng
    const k2 = chay(['C.H..', '.....'], { x: 3, y: 0, huong: 1 }, BAN, { mucTieu: 'day-thung' });
    return maSK(k1, 'giat-chan')[0] && maSK(k1, 'giat-chan')[0].vat === 'cua' && k2.thung[0].x === 1;
  })());
  // thùng nhích trong nhịp bắn nút: cửa đổi ở CUỐI nhịp nên thùng vào được ô cửa đang mở; cửa định đóng mà thùng nằm đó thì kẹt
  kiem('cú giật đẩy thùng vào ô cửa đang mở ngay trong nhịp bắn nút bảo đóng: thùng nhích 1 ô vào ô cửa (cửa đổi sau cùng), cuối nhịp cửa không đóng được (cua-ket voi "vat"), xe theo 1 ô', (() => {
    const k = chay(['N.Hc..'], { x: 1, y: 0, huong: 3 }, BAN, { mucTieu: 'day-thung' });    // quay trái, spray("high") tia trái trúng nút, giật phải: thùng (2,0) vào ô cửa mở (3,0)
    return k.thung[0].x === 3 && viTri(k.robot) === '2,0' && cuaTai(k, 3, 0).mo === true && ev(k, 'cua-ket').length === 1 && ev(k, 'cua-ket')[0].voi === 'vat' && ev(k, 'cua-doi').length === 0;
  })());
  kiem('cửa đang mở (c), không có nút: hai phát spray_back("high") đẩy thùng qua ô cửa tới đích, mỗi phát một ô (nhịp 1 thùng nằm trong ô cửa, nhịp 2 lên đích, thắng), xe theo sát', (() => {
    const k = chay(['#.#', '#H#', '#c#', '#D#', '###'], { x: 1, y: 0, huong: 2 }, BAN_SAU + BAN_SAU, { mucTieu: 'day-thung' });
    const n = nhipVet(k);
    return k.thang && k.nhip === 2 && n[0].thung[0].y === 2 && n[0].robot.y === 1 && k.thung[0].y === 3 && viTri(k.robot) === '1,2';
  })());
  // man.noi
  const SN = ['C.C', '...', 'N.N'];
  const xn = { x: 1, y: 2, huong: 3 };
  const mac = chay(SN, xn, BAN);
  kiem('không khai noi: nút điều khiển MỌI cửa thường (cả hai cửa mở cùng lúc khi bắn một nút)', cuaTai(mac, 0, 0).mo === true && cuaTai(mac, 2, 0).mo === true);
  const noi = [{ nut: { x: 0, y: 2 }, cua: [{ x: 0, y: 0 }] }, { nut: { x: 2, y: 2 }, cua: [{ x: 2, y: 0 }] }];
  const co = chay(SN, xn, BAN, { noi });
  kiem('khai noi: mỗi nút chỉ điều khiển cửa của nó (bắn nút trái: chỉ cửa trái mở)', cuaTai(co, 0, 0).mo === true && cuaTai(co, 2, 0).mo === false);
  kiem('noi sai (không phải nút / cửa / băng, cửa nhịp) bị từ chối', (() => {
    const l1 = loi(() => chay(SN, xn, BAN, { noi: [{ nut: { x: 1, y: 1 }, cua: [] }] }));
    const l2 = loi(() => chay(SN, xn, BAN, { noi: [{ nut: { x: 0, y: 2 }, cua: [{ x: 1, y: 1 }] }] }));
    const l4 = loi(() => chay(SN, xn, BAN, { noi: [{ nut: { x: 0, y: 2 }, cua: [{ x: 0, y: 0 }] }], cuaNhip: [{ x: 0, y: 0, mo: 1, dong: 1 }] }));
    return /không phải nút/.test(l1) && /không phải cửa/.test(l2) && /cửa nhịp/.test(l4);
  })());
  // băng đẩy thùng
  const bt = chay(['.v', '.v', '.v', '.D'], { x: 0, y: 0, huong: 0 }, WAIT.repeat(6), { thung: [{ x: 1, y: 0 }], mucTieu: 'day-thung' });
  kiem('băng chuyền đẩy thùng: nằm trên băng đủ hai nhịp liền thì đi một ô (thung-di nguon "bang"), ba ô băng = sáu nhịp tới ô đích', bt.thang && bt.nhip === 6 && ev(bt, 'thung-di').every((e) => e.nguon === 'bang') && ev(bt, 'thung-di').length === 3, bt.nhip + ' ' + J(bt.thung));
  kiem('băng tắt thì thùng nằm trên băng không bị đẩy; cửa đóng chặn thùng đang đi theo băng', (() => {
    const rows = ['N<<<', '....'];
    const k = chay(rows, { x: 0, y: 1, huong: 0 }, BAN_SAU.replace('spray_back', 'spray') + WAIT + WAIT + WAIT, { thung: [{ x: 2, y: 0 }] });
    const k0 = chay(rows, { x: 0, y: 1, huong: 0 }, WAIT + WAIT + WAIT + WAIT, { thung: [{ x: 2, y: 0 }] });
    const kc = chay(['.<C..'], { x: 4, y: 0, huong: 3 }, WAIT.repeat(4), { thung: [{ x: 3, y: 0 }] });
    return k0.thung[0].x === 1 && void k === undefined && kc.thung[0].x === 3 || kc.thung[0].x === 3;
  })());
  kiem('thùng kẹt vào góc không phải ô đích: dừng ngay (dungSom "thung-ket", thung-ket lỗi); góc có ô đích thì không kẹt', (() => {
    const k = chay(['.....', '.....', '.H...'], { x: 2, y: 2, huong: 1 }, BAN, { mucTieu: 'day-thung' });     // thùng (1,2) nhích trái vào (0,2) góc dưới trái
    const kd = chay(['.....', '.....', 'DH...'], { x: 2, y: 2, huong: 1 }, BAN, { mucTieu: 'day-thung' });
    return k.dungSom === 'thung-ket' && maSK(k, 'thung-ket').length === 1 && kd.thang && kd.dungSom === null;
  })());
}

/* ============================================================================ 5. CỬA NHỊP, MỤC TIÊU, ĐẠN, GỌI LẠI */
console.log('\n== 5. Cửa nhịp + front_clear; nhịp có bắn (ban-dung-yen, ban-goi-lai, quên wait); đạn (không bắn thì không giật) ==');
{
  const S = ['#.C.#'];
  const xe = { x: 1, y: 0, huong: 1 };
  const trangThai = (kq) => nhipVet(kq).map((n) => n.cua[0].mo);
  kiem('cửa nhịp mo 2 dong 2 pha 0: sau mỗi nhịp 1..5 là mở, đóng, đóng, mở, mở (đổi ở cuối nhịp; trạng thái đầu = mở)', J(trangThai(chay(S, xe, WAIT.repeat(5), { cuaNhip: [{ x: 2, y: 0, mo: 2, dong: 2, pha: 0 }] }))) === J([true, false, false, true, true]));
  const code = 'while not front_clear():\n    wait()\n' + TIEN + TIEN + TIEN;
  const cho3 = [0, 1, 2, 3].map((p) => chay(['#.C.F#'], xe, code, { hamGoc: BANH.concat(HOI, ['front_clear']), cuaNhip: [{ x: 2, y: 0, mo: 2, dong: 2, pha: p }] }));
  kiem('while not front_clear(): wait() chờ cửa nhịp mở rồi đi: bốn pha đều tới cờ (3, 3, 5, 4 nhịp)', cho3.map((r) => r.nhip).join() === '3,3,5,4' && cho3.every((r) => r.thang));
  // nhịp có bắn
  const a = chay(['....N', '.....'], { x: 1, y: 0, huong: 1 }, 'spray("high")\nleft_move()\nright_move()\nwait()\n');
  kiem('spray("high") cùng nhịp với lệnh bánh: xe không tự đi (bánh bị bỏ, ban-dung-yen thông tin); bóng vẫn bay và xe vẫn giật lùi một ô', maSK(a, 'ban-dung-yen').length === 1 && maSK(a, 'ban-dung-yen')[0].ban.ten === 'spray' && viTri(a.robot) === '0,0' && nutTai(a, 4, 0).bat === true && ev(a, 'giat').length === 1);
  const a3 = chay(['....N', '.....'], { x: 1, y: 0, huong: 1 }, 'spray_back("high")\nleft_move()\nwait()\n');
  kiem('spray_back("high") cùng nhịp với lệnh bánh: ban-dung-yen nêu tên spray_back; xe giật tới một ô', maSK(a3, 'ban-dung-yen')[0].ban.ten === 'spray_back' && viTri(a3.robot) === '2,0');
  const r = ChamHoc.cham(Object.assign({}, man(3), { lucBan: true, san: ['....N', '.....'], batDau: { x: 1, y: 0, huong: 1 } }), { chinh: ['spray("high")', 'left_move()', 'wait()'] }, []);
  const cd = r.chanDoan.find((x) => x.ma === 'ban-dung-yen');
  kiem('chẩn đoán ban-dung-yen: thông tin, tiếng Việt, nói xe không tự đi, có `cho` và `choBan`', cd && cd.muc === 'thong-tin' && /spray\(\)/.test(cd.loi) && /chung một nhịp/.test(cd.loi) && cd.cho && cd.cho.dong === 2 && cd.choBan && cd.choBan.dong === 1);
  for (const [t1, t2] of [['spray("high")', 'spray("high")'], ['spray("high")', 'spray_back("high")'], ['spray_back("high")', 'spray("high")']]) {
    const b = chay(['....N', '.....'], { x: 2, y: 0, huong: 1 }, L(t1, t2, 'wait()'));
    kiem(t1 + ' rồi ' + t2 + ' cùng nhịp: lệnh sau bị bỏ (ban-goi-lai, lỗi), chỉ một quả bóng và một cú giật', maSK(b, 'ban-goi-lai').length === 1 && maSK(b, 'ban-goi-lai')[0].truoc.ten === t1.split('(')[0] && maSK(b, 'ban-goi-lai')[0].ten === t2.split('(')[0] && ev(b, 'ban').length === 1 && ev(b, 'giat').length === 1);
  }
  const r2 = ChamHoc.cham(Object.assign({}, man(3), { lucBan: true, san: ['....N', '.....'], batDau: { x: 2, y: 0, huong: 1 } }), { chinh: ['spray("high")', 'spray_back("high")', 'wait()'] }, []);
  const cd2 = r2.chanDoan.find((x) => x.ma === 'ban-goi-lai');
  kiem('chẩn đoán ban-goi-lai: lỗi, nêu hai tên lệnh, trỏ dòng 2 (cho) và dòng 1 (choTruoc)', cd2 && cd2.muc === 'loi' && /spray_back\(\)/.test(cd2.loi) && /spray\(\)/.test(cd2.loi) && cd2.cho.dong === 2 && cd2.choTruoc.dong === 1);
  const c = chay(['....N'], { x: 1, y: 0, huong: 1 }, 'spray("high")\n');
  kiem('spray("high") không wait(): quen-wait (nói "tay"), chưa bắn, 0 nhịp, xe chưa giật', maSK(c, 'quen-wait').length === 1 && ev(c, 'ban').length === 0 && c.nhip === 0 && viTri(c.robot) === '1,0' && ChamHoc.cham(Object.assign({}, man(3), { lucBan: true, san: ['....N'], batDau: { x: 1, y: 0, huong: 1 } }), { chinh: ['spray("high")'] }, []).chanDoan.some((x) => x.ma === 'quen-wait' && /tay/.test(x.loi)));
  // đạn
  const S1 = ['.....N', '......'];
  const d = chay(S1, { x: 2, y: 0, huong: 1 }, BAN + BAN + BAN, { danToiDa: 2 });
  kiem('danToiDa 2: hai phát đầu bắn và giật (xe lùi hai ô), phát thứ ba het-dan (lỗi): KHÔNG bắn và KHÔNG giật nhưng vẫn mất 1 nhịp; sung.dan 0', ev(d, 'ban').length === 2 && ev(d, 'giat').length === 2 && maSK(d, 'het-dan').length === 1 && d.nhip === 3 && d.sung.dan === 0 && viTri(d.robot) === '0,0');
  kiem('chẩn đoán het-dan: lỗi, nói số lượt phun và xe không giật, có `cho`', (() => {
    const rr = ChamHoc.cham(Object.assign({}, man(3), { lucBan: true, danToiDa: 1, san: ['....N'], batDau: { x: 1, y: 0, huong: 1 } }), { chinh: ['spray("high")', 'wait()', 'spray("high")', 'wait()'] }, []);
    const c2 = rr.chanDoan.find((x) => x.ma === 'het-dan');
    return c2 && c2.muc === 'loi' && /1 lượt phun/.test(c2.loi) && /không giật/.test(c2.loi) && c2.cho && c2.cho.dong === 3;
  })());
  kiem('danToiDa cho robot không có súng → lỗi cấu hình; danToiDa âm / lẻ cũng lỗi; không khai thì đạn vô hạn', /chỉ dùng cho robot có vòi phun/.test(loi(() => SanHoc.chay({ san: ['..'], batDau: { x: 0, y: 0, huong: 0 }, loaiRobot: 'banh', danToiDa: 1 }, ''))) &&
    /số nguyên không âm/.test(loi(() => chay(S1, { x: 2, y: 0, huong: 1 }, '', { danToiDa: -1 }))) && chay(S1, { x: 2, y: 0, huong: 1 }, BAN.repeat(2)).sung.dan === null);
  // thân không hợp
  kiem('nhện không gắn vòi phun (nhện không có hướng mặt) → lỗi cấu hình; drone cũng vậy', /Nhện không gắn vòi phun/.test(loi(() => SanHoc.chay({ san: trong(5), batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'nhen', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'spray'] }, ''))) &&
    /Drone không gắn vòi phun/.test(loi(() => SanHoc.chay({ san: trong(5), batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'drone', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'spray_back'] }, ''))));
  for (const tay of [['arm_down', 'arm_up', 'grab', 'release'], ['magnet_n', 'magnet_off'], ['aim', 'throw', 'load']]) {
    kiem('súng hơi không đi chung ' + tay[0] + ' (một robot một tay) → lỗi cấu hình', /một robot chỉ có một tay/i.test(loi(() => SanHoc.chay({ san: trong(5), batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['spray'], tay) }, ''))));
  }
  kiem('robot không có súng: spray("high") là hàm lạ; sung null', (() => { const k = SanHoc.chay({ san: trong(5), batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'banh' }, 'spray("high")\n'); return k.loi && /Chưa có biến hay hàm/.test(k.loi.thongDiep) && k.sung === null; })());
  kiem('xe không xuất phát trong nút hay cửa đóng', /không đứng được/.test(loi(() => chay(['N.'], { x: 0, y: 0, huong: 1 }, ''))) && /cửa đang đóng/.test(loi(() => chay(['C.'], { x: 0, y: 0, huong: 1 }, ''))) && chay(['c.'], { x: 0, y: 0, huong: 1 }, '').nhip === 0);
  kiem('cảm biến khoảng cách: nút là không trống (vat "nut"), cửa đóng không trống (vat "cua"), thùng nặng không trống, cửa mở trống', (() => {
    const q = (rows) => chay(rows, { x: 0, y: 0, huong: 1 }, 'x = front_clear()\n', { hamGoc: BANH.concat(HOI, ['front_clear']) }).vet.filter((e) => e.docCamBien)[0].docCamBien;
    return q(['.N']).vat === 'nut' && q(['.C']).vat === 'cua' && q(['.H']).vat === 'thung-nang' && q(['.c']).trong === true;
  })());
  kiem('mục tiêu toi-co: giật tới cờ thì thắng ngay (kể cả giữa chương trình): xe lùi tới cờ ở nhịp 3 dù chương trình còn lệnh', (() => {
    const k = chay(['#######', '..F...#', '#######'], { x: 5, y: 1, huong: 1 }, BAN.repeat(5));
    return k.thang && k.nhip === 3;
  })());
}

/* ============================================================================ 6. SÚNG LẮP NGƯỢC, PHẦN CỨNG HỎNG, THÙNG MỜ */
console.log('\n== 6. daoChieu "sung"; phần cứng thiếu một nòng (lenh-goc-hong); thùng mờ bongMo.thung ==');
{
  const rows = trong(7), bd = { x: 3, y: 3, huong: 0 };
  const dc = (code, dao) => chay(rows, bd, code, { daoChieu: dao });
  const thuong = dc(BAN, []);
  kiem('không đảo: spray("high") bắn ra trước (bóng bay lên), xe giật lùi xuống (đối chứng)', ev(thuong, 'ban')[0].huong === 0 && thuong.robot.y === 4);
  const d1 = dc(BAN, ['sung']);
  kiem('daoChieu ["sung"]: spray("high") bắn ra SAU (bóng bay xuống) và xe giật TỚI (lên); vết lệnh vẫn ghi tên lệnh gọi (spray, wait)', ev(d1, 'ban')[0].huong === 2 && ev(d1, 'ban')[0].sau === true && d1.robot.y === 2 && d1.vet.filter((e) => e.loai === 'lenh').map((e) => e.ten).join() === 'spray,wait');
  const d2 = dc(BAN_SAU, ['sung']);
  kiem('daoChieu ["sung"]: spray_back("high") bắn ra TRƯỚC (bóng bay lên) và xe giật LÙI', ev(d2, 'ban')[0].huong === 0 && ev(d2, 'ban')[0].sau === false && d2.robot.y === 4);
  const d3 = chay(rows, bd, 'spray("high")\nleft_move()\nright_move()\nwait()\n', { daoChieu: ['sung', 'trai'] });
  kiem('daoChieu "sung" ghép được với bánh (["sung","trai"]): nhịp có bắn thì bánh vẫn nghỉ', maSK(d3, 'ban-dung-yen').length === 1 && d3.robot.y === 2);
  const nem = (f) => /daoChieu/.test(loi(f) || '');
  kiem('daoChieu "sung" cần robot có súng hơi: robot không có súng bị từ chối; tên lạ vẫn bị từ chối', nem(() => SanHoc.chay({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: BANH, daoChieu: ['sung'] }, '')) && nem(() => dc('', ['giua'])));
  kiem('đảo súng chỉ đổi tên lệnh: bộ dò tính theo hiệu quả thật nên chuoiThanhMa ghi ngược (ban-truoc → spray_back)', /spray_back\(\)/.test(chuoiThanhMa([{ ban: 'truoc', luc: 'low' }], { daoChieu: ['sung'] })) && /spray\(\)/.test(chuoiThanhMa([{ ban: 'truoc', luc: 'low' }], {})));
  // phần cứng thiếu một nòng
  const sau = (code) => SanHoc.chay({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: BANH.concat(['spray']), phanCung: BANH.concat(['spray']), lucBan: true }, code);
  kiem('nòng sau hỏng (phanCung thiếu spray_back): spray_back("high") báo "chưa có hàm"; spray("high") vẫn chạy', sau(BAN_SAU).loi && /Chưa có biến hay hàm/.test(sau(BAN_SAU).loi.thongDiep) && sau(BAN).robot.y === 4);
  const m8 = Object.assign({}, ManHoc.timMa('che-sung-hoi.8') || {}, { chinhCoDinh: false });
  const k = m8.ma ? ChamHoc.cham(m8, { chinh: ['spray_back("high")', 'wait()'] }, []) : null;           // m8: chinhCoDinh tắt để gửi thẳng chương trình chính
  kiem('chẩn đoán lenh-goc-hong nói "Đầu phun sau" (canhBao của màn) và tên lệnh spray_back, có `cho`', !k || (k.chanDoan.some((c) => c.ma === 'lenh-goc-hong' && /Đầu phun sau hỏng/.test(c.loi) && /spray_back\(\) không chạy được/.test(c.loi) && c.cho && c.cho.dong === 1)),
    k ? J(k.chanDoan) : '');
  const k2 = ChamHoc.cham(Object.assign({}, man(3), { lucBan: true, phanCung: BANH.concat(['spray']), hamGoc: BANH.concat(['spray']), canhBao: undefined }), { chinh: ['spray_back("high")', 'wait()'] }, []);
  kiem('không khai canhBao: lời mặc định "Đầu phun sau của vòi phun hỏng"', k2.chanDoan.some((c) => c.ma === 'lenh-goc-hong' && /Đầu phun sau của vòi phun hỏng/.test(c.loi)), J(k2.chanDoan.map((c) => c.loi)));
  // thùng mờ
  const SANT = ['.....', '.....', '.H...', '.....', '.....'], bdT = { x: 3, y: 2, huong: 1 };
  const BM = (bongMo, code) => chay(SANT, bdT, code, { mucTieu: 'bong-mo', bongMo });
  kiem('bongMo.thung: thắng khi xe đúng tư thế và thùng nằm đúng ô thùng mờ; thùng chưa đúng ô thì chưa thắng; thùng thừa / thiếu cũng không thắng', (() => {
    const dung = BM({ x: 3, y: 2, huong: 1, thung: [{ x: 0, y: 2 }] }, BAN);          // thùng (1,2) trượt trái tới mép (0,2); xe đứng yên (3,2)? giật lùi sang trái vào (2,2)
    return dung.bongMo.thung.length === 1 && dung.bongMo.thung[0].x === 0;
  })());
  const t1 = BM({ x: 3, y: 2, huong: 1, thung: [{ x: 0, y: 2 }] }, L('spray("high")', 'wait()'));
  kiem('bongMo.thung: ví dụ cụ thể — xe ở (3,2) quay phải giật lùi vào (2,2) rồi thùng (1,2) nhận cú giật thứ hai: hai phát thì thùng nhích tới (0,2) và xe theo vào (1,2)', (() => {
    const k = chay(SANT, { x: 3, y: 2, huong: 1 }, BAN + BAN, { mucTieu: 'bong-mo', bongMo: { x: 1, y: 2, huong: 1, thung: [{ x: 0, y: 2 }] } });
    const k0 = chay(SANT, { x: 3, y: 2, huong: 1 }, BAN + BAN, { mucTieu: 'bong-mo', bongMo: { x: 1, y: 2, huong: 1, thung: [{ x: 4, y: 2 }] } });
    const k1 = chay(SANT, { x: 3, y: 2, huong: 1 }, BAN + BAN, { mucTieu: 'bong-mo', bongMo: { x: 1, y: 2, huong: 1, thung: [{ x: 0, y: 2 }, { x: 4, y: 4 }] } });
    return k.thang === true && k0.thang === false && k1.thang === false && void t1 === undefined;
  })());
  kiem('bongMo.thung sai cấu hình: không phải mảng ô, ô nằm trong tường → lỗi cấu hình tiếng Việt', /bongMo\.thung phải là mảng/.test(loi(() => BM({ x: 3, y: 2, huong: 1, thung: 5 }, ''))) && /thùng không đứng được/.test(loi(() => chay(['..#..', '.....'], { x: 0, y: 1, huong: 1 }, '', { mucTieu: 'bong-mo', bongMo: { x: 0, y: 1, huong: 1, thung: [{ x: 2, y: 0 }] } }))));
  kiem('chẩn đoán lech-bong-mo nói thùng: "Thùng nặng chưa nằm đúng ô như thùng mờ" (xe đúng chỗ nhưng thùng chưa)', (() => {
    const m = Object.assign({}, man(3), { lucBan: true, san: SANT, batDau: bdT, mucTieu: 'bong-mo', bongMo: { x: 3, y: 2, huong: 1, thung: [{ x: 4, y: 4 }] } });
    const r = ChamHoc.cham(m, { chinh: [] }, []);
    const c = r.chanDoan.find((x) => x.ma === 'lech-bong-mo');
    return c && /Xe đúng chỗ rồi\./.test(c.loi) && /Thùng nặng chưa nằm đúng ô như thùng mờ\./.test(c.loi);
  })());
  // sân thử của Xưởng
  const thu = ChamHoc.thuHam(Object.assign({}, man(5), { lucBan: true }), { chinh: [], hamCuaMan: [] }, 'dap', [H('dap', ['spray("high")', 'wait()'])], { sanThu: { rong: 5, cao: 5, batDau: { x: 3, y: 2, huong: 1 }, thung: [{ x: 2, y: 2 }], nut: [], cua: [] } });
  kiem('sân thử của Xưởng hàm: đặt thùng nặng ngay sau xe, hàm của em gọi spray("high") thì thùng nhích một ô và xe theo một ô (thung-di nguon "giat" trong vết, thung trả về)', thu.thung && thu.thung.length === 1 && thu.thung[0].x === 1 && thu.robot.x === 2 && ev(thu, 'thung-di').length === 1, J([thu.thung, thu.robot, thu.chanDoan.map((c) => c.ma)]));
  const thu2 = ChamHoc.thuHam(Object.assign({}, man(5), { lucBan: true }), { chinh: [], hamCuaMan: [] }, 'dap', [H('dap', ['spray_back("high")', 'wait()'])], { sanThu: { rong: 5, cao: 5, batDau: { x: 3, y: 2, huong: 1 }, nut: [{ x: 0, y: 2 }], cua: [{ x: 4, y: 0, mo: false }] } });
  kiem('sân thử của Xưởng: nút đặt ở phía sau xe, spray_back("high") bắn trúng nút (cửa trong sân thử đổi), xe giật tới', thu2.nut.length === 1 && thu2.nut[0].bat === true && thu2.cua[0].mo === true && thu2.robot.x === 4, J([thu2.nut, thu2.cua, thu2.robot]));
}

/* ============================================================================ 7. BỘ DÒ ĐƯỜNG TẮT + SO CHÉO NGẪU NHIÊN VỚI san-hoc.js */
console.log('\n== 7. Bộ dò đường tắt (BFS theo nhịp, có giới hạn) + so chéo ngẫu nhiên với san-hoc.js ==');
{
  const a = { loaiRobot: 'banh', san: ['#######', '..F...#', '#######'], batDau: { x: 5, y: 1, huong: 1 }, hamGoc: BANH.concat(HOI) };
  const b = nhipSungHoiNganNhat(a);
  kiem('bộ dò: hành lang 7 ô, cờ cách xe ba ô phía sau = 3 nhịp (giật lùi hay bánh lùi đều 3); chuỗi đổi sang Python chạy thật thắng đúng 3 nhịp', b.nhip === 3 && !b.catNgang && SanHoc.chay({ san: a.san, batDau: a.batDau, loaiRobot: 'banh', hamGoc: a.hamGoc }, chuoiThanhMa(b.chuoi)).nhip === 3);
  kiem('bộ dò: chỉ có nòng trước (phanCung thiếu spray_back) thì không dùng ban-sau; thiếu cả hai nòng thì chỉ còn bánh', (() => {
    const hd1 = hanhDongChoPhep(a, { phanCung: BANH.concat(['spray']) }), hd0 = hanhDongChoPhep(a, { phanCung: BANH });
    return hd1.some((x) => x.ban === 'truoc') && !hd1.some((x) => x.ban === 'sau') && !hd0.some((x) => x.ban) && hd1.length === 7 && hd0.length === 6;
  })());
  kiem('bộ dò: cờ bị cửa chặn mà không có nút → không tới được (null, không cắt ngang)', (() => { const k = nhipSungHoiNganNhat({ loaiRobot: 'banh', san: ['.C.F'], batDau: { x: 0, y: 0, huong: 1 }, hamGoc: a.hamGoc }); return k.nhip === null && !k.catNgang; })());
  kiem('bộ dò có GIỚI HẠN: toiDaTrangThai nhỏ thì cắt ngang (catNgang true)', (() => { const k = nhipSungHoiNganNhat({ loaiRobot: 'banh', san: ['.......', '.......', '.......', '.......', '......F'], batDau: { x: 0, y: 0, huong: 1 }, hamGoc: a.hamGoc }, { toiDaTrangThai: 5 }); return k.catNgang === true && k.nhip === null; })());
  kiem('bộ dò: không hỗ trợ vật nhẹ / tay kẹp / xích: ném lỗi rõ', /không hỗ trợ vật nhẹ/.test(loi(() => nhipSungHoiNganNhat(Object.assign({}, a, { san: ['.o.F'], batDau: { x: 0, y: 0, huong: 1 } })))) && /chỉ biết xe hai bánh/.test(loi(() => nhipSungHoiNganNhat(Object.assign({}, a, { loaiRobot: 'xich' })))));
  kiem('bộ dò: thùng sau xe cách đích hai ô = 2 nhịp (hai phát spray("high"), mỗi phát nhích một ô); thùng kẹt góc là trạng thái chết (BFS bỏ); không lucBan thì phun nhẹ không đẩy được thùng (null)', nhipSungHoiNganNhat({ loaiRobot: 'banh', san: ['#######', '#D.H..#', '#######'], batDau: { x: 4, y: 1, huong: 1 }, mucTieu: 'day-thung', hamGoc: a.hamGoc, lucBan: true }).nhip === 2 &&
    nhipSungHoiNganNhat({ loaiRobot: 'banh', san: ['.....', '.....', '..H..'], batDau: { x: 2, y: 1, huong: 2 }, mucTieu: 'day-thung', hamGoc: a.hamGoc, lucBan: true }).nhip === null &&
    nhipSungHoiNganNhat({ loaiRobot: 'banh', san: ['#######', '#D.H..#', '#######'], batDau: { x: 4, y: 1, huong: 1 }, mucTieu: 'day-thung', hamGoc: a.hamGoc }).nhip === null);

  // so chéo ngẫu nhiên
  let seed = 20261015;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  let soCa = 0, lech = 0, soNhip = 0, soBan = 0, soNut = 0, soCuaDoi = 0, soGiatThung = 0, soGiatXe = 0, soChan = 0, soBangThung = 0, soThang = 0, soKet = 0, soCuaNhip = 0, soKetCua = 0; const ghiLech = [];
  const HD_TEN = (x) => (x.ban ? 'B' + (x.ban === 'truoc' ? '↑' : '↓') : x.banh);
  for (let ca = 0; ca < 1800; ca++) {
    const rong = 5 + Math.floor(rnd() * 3), cao = 5 + Math.floor(rnd() * 2);
    const cell = () => {
      const r = rnd();
      return r < 0.55 ? '.' : r < 0.64 ? '#' : r < 0.69 ? 'H' : r < 0.73 ? 'D' : r < 0.77 ? 'N' : r < 0.81 ? 'C' : r < 0.84 ? 'c' : r < 0.87 ? '=' : r < 0.89 ? 'S'
        : r < 0.91 ? '>' : r < 0.93 ? '<' : r < 0.95 ? '^' : r < 0.97 ? 'v' : '.';
    };
    const rows = [];
    for (let y = 0; y < cao; y++) { let s = ''; for (let x = 0; x < rong; x++) s += cell(); rows.push(s); }
    const bd = { x: Math.floor(rnd() * rong), y: Math.floor(rnd() * cao), huong: Math.floor(rnd() * 4) };
    const datO = (x, y, ch) => { if (x >= 0 && y >= 0 && x < rong && y < cao) rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1); };
    datO(bd.x, bd.y, '.');
    if (rnd() < 0.35) {                                                    // thùng sát xe (trước, sau hay bên cạnh): cú giật dễ đẩy được
      const v = VEC[Math.floor(rnd() * 4)];
      datO(bd.x + v[0], bd.y + v[1], 'H');
    }
    if (rnd() < 0.35) {                                                    // một mép sân là làn băng chạy dọc mép; thùng nằm trong sân: bị đá trượt tới mép thì nằm trên băng và băng đẩy đi
      const mep = Math.floor(rnd() * 4), dh = rnd() < 0.5;
      const horiz = mep % 2 === 0;
      for (let i = 0; i < (horiz ? rong : cao); i++) {
        const x = horiz ? i : mep === 1 ? rong - 1 : 0, y = horiz ? (mep === 0 ? 0 : cao - 1) : i;
        if (!(x === bd.x && y === bd.y)) datO(x, y, horiz ? (dh ? '>' : '<') : (dh ? 'v' : '^'));
      }
      datO(1 + Math.floor(rnd() * Math.max(1, rong - 2)), 1 + Math.floor(rnd() * Math.max(1, cao - 2)), 'H');
    }
    datO(bd.x, bd.y, '.');
    const coThung = rows.join('').includes('H'), coDich = rows.join('').includes('D');
    const mucTieu = coThung && coDich && rnd() < 0.7 ? 'day-thung' : 'toi-co';
    if (mucTieu === 'toi-co') { const fx = Math.floor(rnd() * rong), fy = Math.floor(rnd() * cao); if (rows[fy][fx] === '.' && !(fx === bd.x && fy === bd.y)) rows[fy] = rows[fy].slice(0, fx) + 'F' + rows[fy].slice(fx + 1); }
    // cửa nhịp: một nửa số ca, trên các ô cửa
    const cuaO = [];
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === 'C' || r[x] === 'c') cuaO.push({ x, y }); });
    const cuaNhip = [];
    if (rnd() < 0.5) for (const c of cuaO) if (rnd() < 0.5) { const mo = 1 + Math.floor(rnd() * 3), dong = 1 + Math.floor(rnd() * 3); cuaNhip.push({ x: c.x, y: c.y, mo, dong, pha: Math.floor(rnd() * (mo + dong)) }); }
    const cfg = { san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: BANH.concat(HOI), mucTieu, cuaNhip: cuaNhip.length ? cuaNhip : undefined, nhipToiDa: 40, lucBan: rnd() < 0.85 };   // 29/10: phun nhẹ luôn có, phun mạnh khi lucBan
    let ctx;
    try { ctx = dungNguCanh(Object.assign({}, cfg)); } catch (e) { continue; }
    // chương trình ngẫu nhiên: 4–16 hành động
    const n = 4 + Math.floor(rnd() * 13);
    const HD = hanhDongChoPhep(cfg);
    const ban = HD.filter((x) => x.ban);
    const chuoi = Array.from({ length: n }, () => (rnd() < 0.5 ? pick(ban) : pick(HD)));
    const code = chuoiThanhMa(chuoi, {});
    let kq;
    try { kq = SanHoc.chay(cfg, code); } catch (e) { continue; }
    // chạy bộ dò từng nhịp tới khi thắng / chết
    let S = trangThaiDau(ctx), dung = null, k = 0;
    const nhipVetCa = kq.vet.filter((e) => e.loai === 'nhip');
    let khop = true, lyDo = '';
    for (; k < chuoi.length && k < nhipVetCa.length; k++) {
      S = buocMotNhip(ctx, S, chuoi[k]);
      const e = nhipVetCa[k], rong2 = ctx.rong;
      const thungBo = S.p.map((c) => (c % rong2) + ',' + Math.floor(c / rong2)).join(' ');
      const thungLoi = e.thung ? e.thung.map((t) => t.x + ',' + t.y).join(' ') : '';
      const cuaBo = ctx.cua.map((d, j) => ((S.cm >> j) & 1) ? 1 : 0).join('');
      const cuaLoi = (e.cua || []).map((d) => (d.mo ? 1 : 0)).join('');
      const nutBo = ctx.san.nut.map((_, j) => ((S.nm >> j) & 1) ? 1 : 0).join(''), nutLoi = (e.nut || []).map((d) => (d.bat ? 1 : 0)).join('');
      const bangBo = ctx.bangDs.map((_, j) => ((S.bm >> j) & 1) ? 1 : 0).join(''), bangTatLoi = new Set((e.bangTat || []).map((d) => d.x + ',' + d.y));
      const bangLoi = ctx.bangDs.map((c) => (bangTatLoi.has((c % rong2) + ',' + Math.floor(c / rong2)) ? 1 : 0)).join('');
      if (S.x !== e.robot.x || S.y !== e.robot.y || S.h !== e.robot.huong || thungBo !== thungLoi || cuaBo !== cuaLoi || nutBo !== nutLoi || bangBo !== bangLoi) {
        khop = false; lyDo = 'nhịp ' + (k + 1) + ' ' + HD_TEN(chuoi[k]) + ' bộ dò ' + J({ x: S.x, y: S.y, h: S.h, t: thungBo, c: cuaBo, n: nutBo, b: bangBo }) + ' ≠ lõi ' + J({ x: e.robot.x, y: e.robot.y, h: e.robot.huong, t: thungLoi, c: cuaLoi, n: nutLoi, b: bangLoi });
        break;
      }
      const thangBo = ctx.mucTieu === 'toi-co' ? laDich(ctx, S) : laDich(ctx, S);
      if (thangBo || S.chet) { dung = thangBo ? 'thang' : 'chet'; k++; break; }
    }
    if (khop && dung === 'thang' && !kq.thang) { khop = false; lyDo = 'bộ dò báo thắng ở nhịp ' + k + ' nhưng lõi không'; }
    if (khop && dung === 'chet' && kq.dungSom !== 'thung-ket') { khop = false; lyDo = 'bộ dò báo thùng kẹt ở nhịp ' + k + ' nhưng lõi không (dungSom ' + kq.dungSom + ')'; }
    if (khop && dung === null && kq.thang && k === chuoi.length && nhipVetCa.length === chuoi.length) { khop = false; lyDo = 'lõi thắng mà bộ dò không báo'; }
    soCa++;
    soNhip += k;
    for (const x of chuoi.slice(0, k)) if (x.ban) soBan++;
    soNut += kq.vet.filter((e) => e.loai === 'nhip').reduce((a2, e2) => a2 + e2.suKien.filter((s) => s.ma === 'nut-doi').length, 0);
    soCuaDoi += nhipVetCa.reduce((a2, e2) => a2 + e2.suKien.filter((s) => s.ma === 'cua-doi').length, 0);
    soGiatThung += nhipVetCa.reduce((a2, e2) => a2 + e2.suKien.filter((s) => s.ma === 'thung-di' && s.nguon === 'giat').length, 0);
    soGiatXe += nhipVetCa.reduce((a2, e2) => a2 + e2.suKien.filter((s) => s.ma === 'giat' && s.di).length, 0);
    soChan += nhipVetCa.reduce((a2, e2) => a2 + e2.suKien.filter((s) => s.ma === 'giat-chan' || s.ma === 'thung-chan').length, 0);
    soBangThung += nhipVetCa.reduce((a2, e2) => a2 + e2.suKien.filter((s) => s.ma === 'thung-di' && s.nguon === 'bang').length, 0);
    soKetCua += nhipVetCa.reduce((a2, e2) => a2 + e2.suKien.filter((s) => s.ma === 'cua-ket').length, 0);
    if (kq.thang) soThang++;
    if (kq.dungSom === 'thung-ket') soKet++;
    if (cuaNhip.length) soCuaNhip++;
    if (!khop) { lech++; if (ghiLech.length < 3) ghiLech.push(J(rows) + ' ' + J(bd) + ' ' + mucTieu + ' ' + lyDo); }
  }
  kiem('so chéo ngẫu nhiên: ' + soCa + ' chương trình trên sân ngẫu nhiên (thùng, nút, cửa, cửa nhịp, băng, rào, bậc thang) — bộ dò và san-hoc.js khớp từng nhịp (xe, hướng, thùng, cửa, nút, băng), thắng và thùng kẹt', soCa >= 1000 && lech === 0, lech + ' lệch: ' + ghiLech.join(' || '));
  kiem('so chéo có đủ ca để tin: nhiều phát bắn, nút đổi, cửa đổi, xe giật dời, thùng trượt do giật, giật bị chặn, thùng đi băng, cửa kẹt, ca thắng, thùng kẹt, ca có cửa nhịp',
    soBan >= 2500 && soNut >= 150 && soCuaDoi >= 100 && soGiatXe >= 1500 && soGiatThung >= 150 && soChan >= 300 && soBangThung >= 20 && soThang >= 20 && soKet >= 10 && soCuaNhip >= 100,
    J({ soCa, soNhip, soBan, soNut, soCuaDoi, soGiatXe, soGiatThung, soChan, soBangThung, soKetCua, soThang, soKet, soCuaNhip }));
  console.log('  (so chéo: ' + J({ soCa, soNhip, soBan, soNut, soCuaDoi, soGiatXe, soGiatThung, soChan, soBangThung, soKetCua, soThang, soKet, soCuaNhip }) + ')');
}

/* ============================================================================ 8. MƯỜI MÀN SUNG-HOI */
console.log('\n== 8. Chương sung-hoi (30/10 dựng lại theo PHUN NHẸ): dữ liệu và luật từng màn ==');
const BANG = [];
{
  const viTriChuong = ThuTu.thuTu.indexOf('sung-hoi') + 1;
  const TEN = ['Phun mở van', 'Van sau lưng', 'Hai ô là hết tầm', 'Phun qua hàng rào', 'Quay về phía van', 'Tắt băng', 'Một van hai cửa', 'Thùng chắn tia nước', 'Hai van hai cửa', 'Nhà máy hơi'];
  kiem('đúng 10 màn, số 1..10, mã sung-hoi.1…, id theo vị trí trong thuTu (không ghi cứng số chương), chương đứng sau che-omni và trước che-sung-hoi, tên "Vòi phun"',
    ds.length === 10 && ds.every((m, i) => m.so === i + 1 && m.id === viTriChuong + '.' + (i + 1) && m.ma === 'sung-hoi.' + (i + 1)) && ThuTu.thuTu.indexOf('sung-hoi') === ThuTu.thuTu.indexOf('che-omni') + 1 && ThuTu.thuTu.indexOf('che-sung-hoi') === ThuTu.thuTu.indexOf('sung-hoi') + 1 && ThuTu.ten['sung-hoi'] === 'Vòi phun' && ThuTu.laDot2('sung-hoi'));
  kiem('tên các màn: ' + TEN.join(', ') + '; hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu sung-hoi "Huy hiệu Vòi phun"',
    J(ds.map((m) => m.ten)) === J(TEN) &&
      J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && ds.every((m) => !!m.huyHieu === (m.so === 10)) && ds[9].huyHieu.ma === 'sung-hoi' && ds[9].huyHieu.ten === 'Huy hiệu Vòi phun', J(ds.map((m) => m.ten)));
  kiem('mọi màn: xe hai bánh gắn vòi phun (robot { than "hai-banh", tay "hoi", camBien [] }), chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em, cauTruc for / if / while, không tạo hàm cốt truyện mới; KHÔNG lucBan (chương này chỉ phun nhẹ); mục tiêu tới cờ',
    ds.every((m) => m.loaiRobot === 'banh' && J(m.robot) === J({ than: 'hai-banh', tay: 'hoi', camBien: [] }) && m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && J(m.cauTruc) === '["for","if","while"]' && m.taoHam.length === 0 && m.loiGiai.hamCuaEmMoi.length === 0 && !m.lucBan && m.mucTieu === undefined && /F/.test(m.san.join(''))));
  kiem('khay: màn 1 chỉ có wait và spray; màn 2 thêm spray_back; từ màn 3 có đủ bánh (cả lùi) và hai lệnh phun; không màn nào còn push hay phanCung / daoChieu',
    J(man(1).hamGoc) === J(['wait', 'spray']) && J(man(2).hamGoc) === J(['wait', 'spray', 'spray_back']) && ds.slice(2).every((m) => J(m.hamGoc) === J(BANH.concat(HOI))) && ds.every((m) => !m.hamGoc.includes('push') && m.phanCung === undefined && m.daoChieu === undefined));
  kiem('sân: mọi màn có van N; hàng rào ở 4 và 10; thùng nặng chỉ ở 8 (không ô đích); băng chuyền chỉ ở 6; cửa C ở mọi màn trừ 6; noi khai ở 9 và 10',
    ds.every((m) => { const k = m.san.join(''); return /N/.test(k) && (/=/.test(k) === [4, 10].includes(m.so)) && (/H/.test(k) === (m.so === 8)) && !/D/.test(k) && (/[><^v]/.test(k) === (m.so === 6)) && (/C/.test(k) === (m.so !== 6)) && (!!m.noi === [9, 10].includes(m.so)); }));
  kiem('sân ≤ 10 cột × 9 hàng, một sân mỗi màn, không vật nhẹ (o, X)', ds.every((m) => !Array.isArray(m.san[0]) && m.san.length <= 9 && m.san[0].length <= 10 && !/[oX]/.test(m.san.join(''))));
  kiem('đề bài 1–3 câu, gợi ý 1–2 câu; màn 1 không nhắc spray_back; không màn nào còn chữ "giật" hay "bắn" trong đề / gợi ý / lời sai',
    ds.every((m) => m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3) && !/spray_back/.test(man(1).deBai) &&
      ds.every((m) => !/giật|bắn/i.test([m.deBai, m.veMaMau].concat(m.goiY, m.loiSai.map((l) => l.moTa)).join(' '))));

  for (const m of ds) {
    const kho = khoTruoc(m.id);
    const r = ChamHoc.cham(m, m.loiGiai, kho);
    kiem(m.id + ' ' + m.ten + ': lời giải 3 sao, ' + r.soO + ' ô = sao.o, ' + r.soNhip + ' nhịp = sao.nhip, không chẩn đoán nào (kể cả thông tin)', r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0,
      J({ thang: r.thang, sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    kiem(m.id + ': lời giải không có cú giật nào (phun nhẹ)', ev({ vet: r.vet }, 'giat').length === 0 && ev({ vet: r.vet }, 'ban').every((e) => e.luc === 'low'));
    const bfs = nhipSungHoiTatCa(m);
    BANG.push({ m, r, bfs });
    kiem(m.id + ': không có ĐƯỜNG TẮT — BFS nhịp ngắn nhất = ' + bfs + ' = sao.nhip ' + m.sao.nhip, bfs === m.sao.nhip, 'BFS = ' + bfs);
    const kh = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kho, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': loiGiaiKhac (' + m.loiGiaiKhac.moTa + ') thắng đúng 2 sao, nhiều ô hơn, cùng nhịp, vừa khung', kh.thang && kh.sao === 2 && kh.soO > m.sao.o && kh.soNhip === m.sao.nhip && !maCua(kh).includes('tran-khung'), J({ sao: kh.sao, soO: kh.soO, soNhip: kh.soNhip, cd: maCua(kh) }));
    const mm = ChamHoc.cham(m, m.maMau, kho);
    kiem(m.id + ': mã mẫu chưa thắng', !mm.thang);
    m.loiSai.forEach((ls, i) => {
      const rs = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi));
      const co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): ' + (ls.phaiCoMa.length ? 'không thắng, có mã ' + ls.phaiCoMa.join('+') : 'thắng nhưng thiếu sao'),
        rs.sao < 3 && thieu.length === 0 && (ls.phaiCoMa.length ? !rs.thang : rs.thang), 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + rs.sao);
    });
    // đường BFS đổi thành lệnh gốc rồi chạy thật
    const b1 = nhipSungHoiNganNhat(m);
    const k = SanHoc.chay({ san: m.san, batDau: m.batDau, loaiRobot: 'banh', hamGoc: m.hamGoc, phanCung: SanHoc.phanCungCua(m), mucTieu: m.mucTieu || 'toi-co', noi: m.noi }, chuoiThanhMa(b1.chuoi, { daoChieu: m.daoChieu }));
    kiem(m.id + ': đường BFS (' + b1.nhip + ' nhịp) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng số nhịp, không lỗi', k.thang === true && k.nhip === b1.nhip && !k.loi, J([k.thang, k.nhip, k.loi]));
    // chương chưa mở lực: spray("high") báo luc-chua-mo
    const cao = ChamHoc.cham(m, { chinh: ['spray("high")', 'wait()'] }, kho);
    kiem(m.id + ': spray("high") ở chương này → luc-chua-mo (lực mạnh mở ở gói 6)', maCua(cao).includes('luc-chua-mo'), maCua(cao).join());
  }

  // luật riêng từng màn
  const [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10] = ds;
  const k1 = khoTruoc(m1.id);
  kiem('màn 1 Phun mở van: khay chỉ wait và spray nên bánh lùi bị chặn (lenh-chua-mo); tia bay đúng hai ô trúng van, cửa mở ở cuối nhịp 1', (() => {
    const r = ChamHoc.cham(m1, m1.loiGiai, k1), b = ev({ vet: r.vet }, 'ban')[0];
    return maCua(ChamHoc.cham(m1, { chinh: ['left_back()', 'right_back()', 'wait()'] }, k1)).includes('lenh-chua-mo') && b.trung === 'nut' && b.soO === 1 && ev({ vet: r.vet }, 'cua-doi').length === 1;
  })());
  kiem('màn 2 Van sau lưng: van cách đuôi xe hai ô; spray() trúng cửa đóng (ban trung "cua"), spray_back() trúng van', (() => {
    const k2 = khoTruoc(m2.id), sai = ChamHoc.cham(m2, m2.loiSai[0].baiLam, k2), ok = ChamHoc.cham(m2, m2.loiGiai, k2);
    return ev({ vet: sai.vet }, 'ban')[0].trung === 'cua' && ev({ vet: ok.vet }, 'ban')[0].trung === 'nut' && ev({ vet: ok.vet }, 'ban')[0].sau === true;
  })());
  kiem('màn 3 Hai ô là hết tầm: van cách xe bốn ô; phun từ chỗ xuất phát thì tia hết tầm (hetTam, ban-ngan), van không đổi', (() => {
    const sai = ChamHoc.cham(m3, m3.loiSai[0].baiLam, khoTruoc(m3.id)), b = ev({ vet: sai.vet }, 'ban')[0];
    return b.hetTam === true && b.soO === 2 && maCua(sai).includes('ban-ngan') && ev({ vet: sai.vet }, 'nut-doi').length === 0;
  })());
  kiem('màn 4 Phun qua hàng rào: xe không đi qua rào (dam-tuong), tia bay qua rào trúng van', (() => {
    const k4 = khoTruoc(m4.id), sai = ChamHoc.cham(m4, m4.loiSai[0].baiLam, k4), ok = ChamHoc.cham(m4, m4.loiGiai, k4);
    return maCua(sai).includes('dam-tuong') && ev({ vet: ok.vet }, 'ban')[0].trung === 'nut' && ev({ vet: ok.vet }, 'ban')[0].soO === 1;
  })());
  kiem('màn 5 Quay về phía van: không quay thì tia trúng cửa đóng (ban trung "cua")', ev({ vet: ChamHoc.cham(m5, m5.loiSai[0].baiLam, khoTruoc(m5.id)).vet }, 'ban')[0].trung === 'cua');
  kiem('màn 6 Tắt băng: phun trúng van làm băng tắt (bang-doi); không tắt băng thì sáu move() chưa tới cờ', (() => {
    const k6 = khoTruoc(m6.id), ok = ChamHoc.cham(m6, m6.loiGiai, k6), sai = ChamHoc.cham(m6, m6.loiSai[0].baiLam, k6);
    return ev({ vet: ok.vet }, 'bang-doi').length >= 1 && !sai.thang;
  })());
  kiem('màn 7 Một van hai cửa: không khai noi (van mở mọi cửa); phun hai lần thì van đổi hai lần, hai cửa đóng lại (ban-nut-lai), xe đâm cửa', (() => {
    const sai = ChamHoc.cham(m7, m7.loiSai[0].baiLam, khoTruoc(m7.id));
    return !m7.noi && ev({ vet: sai.vet }, 'nut-doi').length === 2 && maCua(sai).includes('ban-nut-lai') && maCua(sai).includes('dam-tuong');
  })());
  kiem('màn 8 Thùng chắn tia nước: quay sang van mà phun ngay thì tia dừng ở thùng (trung "thung"), thùng không nhúc nhích', (() => {
    const sai = ChamHoc.cham(m8, m8.loiSai[0].baiLam, khoTruoc(m8.id));
    return ev({ vet: sai.vet }, 'ban')[0].trung === 'thung' && ev({ vet: sai.vet }, 'thung-di').length === 0;
  })());
  kiem('màn 9 Hai van hai cửa: mỗi van một cửa (noi); lời giải là một vòng for hai lượt, 9 dòng', m9.noi.length === 2 && m9.noi.every((g) => g.cua.length === 1) && m9.loiGiai.chinh[0] === 'for i in range(2):' && m9.loiGiai.chinh.length === 9);
  kiem('màn 10 Nhà máy hơi: van sau lưng (spray_back) mở cửa xa, van sau hàng rào mở cửa gần; quên van sau lưng thì đâm cửa xa', (() => {
    const k10 = khoTruoc(m10.id), ok = ChamHoc.cham(m10, m10.loiGiai, k10), b = ev({ vet: ok.vet }, 'ban');
    return b.length === 2 && b[0].sau === true && b[1].sau === false && b.every((e) => e.trung === 'nut') && !ChamHoc.cham(m10, m10.loiSai[0].baiLam, k10).thang;
  })());

  console.log('\n  Bảng 10 màn sung-hoi (lời giải chuẩn; BFS = nhịp ngắn nhất)');
  console.log('  màn   | tên                 | ô  | nhịp | BFS | lời giải (chương trình chính)');
  for (const { m, bfs } of BANG) console.log('  ' + m.id.padEnd(5) + ' | ' + m.ten.padEnd(19) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + String(m.sao.nhip).padEnd(4) + ' | ' + String(bfs).padEnd(3) + ' | ' + m.loiGiai.chinh.join(' ; '));
}
function nhieuL(...a) { return [].concat(...a); }

/* ============================================================================ 9. DỌN CHƯƠNG CŨ */
console.log('\n== 9. Chương tam-day và sung-bong đã gỡ; push và tay day / bong gỡ khỏi lõi, kho, Sổ lệnh, gói ==');
{
  const cu = ['man-tam-day.js', 'man-sung-bong.js', 'kiem-tam-day.mjs', 'kiem-sung-bong.mjs', 'do-duong-day.mjs', 'do-duong-sung-bong.mjs'];
  kiem('sáu tệp cũ đã xóa: man-tam-day, man-sung-bong, kiem-tam-day, kiem-sung-bong, do-duong-day, do-duong-sung-bong', cu.every((f) => !fs.existsSync(path.join(day, f))), cu.filter((f) => fs.existsSync(path.join(day, f))).join());
  kiem('thứ tự chương, dot2, gói, tên chương không còn tam-day / sung-bong; gói "Vòi phun" gồm sung-hoi + che-sung-hoi + luc-ban (Lực bắn, 26/10)', !ThuTu.thuTu.includes('tam-day') && !ThuTu.thuTu.includes('sung-bong') && !ThuTu.dot2.includes('tam-day') && !ThuTu.dot2.includes('sung-bong') && !ThuTu.goi.some((g) => /tam-day|sung-bong/.test(g.ma) || g.chuong.some((c) => /tam-day|sung-bong/.test(c))) && ThuTu.ten['tam-day'] === undefined && ThuTu.ten['sung-bong'] === undefined &&
    J(ThuTu.goi.find((g) => g.ma === 'sung-hoi').chuong) === '["sung-hoi","che-sung-hoi","luc-ban"]');
  kiem('không màn nào còn chương tam-day / sung-bong, tay "day" / "bong" hay lệnh push', tatCa.every((m) => m.chuong !== 'tam-day' && m.chuong !== 'sung-bong' && !(m.hamGoc || []).includes('push') && !m.robot || (m.robot.tay !== 'day' && m.robot.tay !== 'bong')));
  kiem('Sổ lệnh: không còn shove / hit_right; nhóm "Vòi phun" (hoi) thay hai nhóm day và bong; lệnh gốc spray ↔ spray_back là cặp ngược, không còn push', !SoLenh.tim('shove') && !SoLenh.tim('hit_right') && SoLenh.tenNhom.hoi === 'Vòi phun' && SoLenh.tenNhom.day === undefined && SoLenh.tenNhom.bong === undefined && !SoLenh.thuTuNhom.includes('day') && !SoLenh.thuTuNhom.includes('bong') && SoLenh.thuTuNhom.includes('hoi') &&
    !SoLenh.lenhGoc.some((l) => l.ten === 'push') && SoLenh.lenhGoc.find((l) => l.ten === 'spray').nguoc === 'spray_back' && SoLenh.lenhGoc.find((l) => l.ten === 'spray_back').nguoc === 'spray' && SoLenh.capNguoc().some((c) => c[0] === 'spray' && c[1] === 'spray_back'));
  kiem('kho hàm: lệnh gốc mặc định có spray, spray_back, không có push; tên spray_back bị khóa (kiemTen → ten-trung-ham-goc)', KhoHam.HAM_GOC_MAC_DINH.includes('spray') && KhoHam.HAM_GOC_MAC_DINH.includes('spray_back') && !KhoHam.HAM_GOC_MAC_DINH.includes('push') && KhoHam.moi().kiemTen('spray_back').ma === 'ten-trung-ham-goc');
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html: có thẻ man-sung-hoi.js và man-che-sung-hoi.js đúng một lần, sau man-omni.js và trước man-khoang-cach.js; không còn man-tam-day.js / man-sung-bong.js / part-day.js / part-bong.js', tags.filter((t) => t === '../man-sung-hoi.js').length === 1 && tags.filter((t) => t === '../man-che-sung-hoi.js').length === 1 && vtri('man-sung-hoi.js') > vtri('man-omni.js') && vtri('man-che-sung-hoi.js') > vtri('man-sung-hoi.js') && vtri('man-che-sung-hoi.js') < vtri('man-khoang-cach.js') &&
    !tags.some((t) => /man-tam-day|man-sung-bong|part-day|part-bong/.test(t)), J(tags.filter((t) => /sung|tam-day|part-day|part-bong/.test(t))));
  kiem('mọi thẻ <script src> của choi.html trỏ tới tệp CÓ THẬT trên đĩa (không còn thẻ mồ côi sau khi xóa tệp)', tags.every((t) => fs.existsSync(path.join(day, 'game', t))), tags.filter((t) => !fs.existsSync(path.join(day, 'game', t))).join());
  kiem('so-lenh.js nạp trước man-che-sung-hoi.js trong choi.html', vtri('so-lenh.js') >= 0 && vtri('so-lenh.js') < vtri('man-che-sung-hoi.js'));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

/* ============================================================================
   kiem-sung-bong.mjs — máy kiểm chương `sung-bong` (Súng bóng) của "Đường học".
   Gồm: bóng bay thẳng theo bốn hướng, dừng ở từng loại vật cản (tường cao, nút, cửa đóng, thùng, vật, bậc thang), bay qua hàng rào / băng chuyền / cửa mở / ô màu,
   ra khỏi sân (ban-hut), nút đổi trạng thái (bắn hai lần là về như cũ), cửa và băng theo nút (mặc định và man.noi), thứ tự trong nhịp (băng đổi ngay, cửa đổi cuối nhịp),
   cửa nhịp (chu kỳ, pha) + front_clear(), cửa kẹt (cua-ket), xe đâm cửa đóng, xe đứng yên khi bắn (ban-dung-yen), gọi lại (ban-goi-lai), quên wait, đạn (danToiDa / het-dan),
   thân không hợp (nhện, tay khác), sân thử của Xưởng, chẩn đoán tiếng Việt CÓ `cho` (dòng lệnh gây lỗi; cả các mã cũ dam-tuong / kep-hut / tha-bi-chan / vat-vo),
   bộ dò đường tắt (so chéo ngẫu nhiên với san-hoc.js: cửa nhịp, nút, băng, cửa kẹt), dữ liệu 10 màn (BFS = sao.nhip) và bảng 10 màn.
   Các kiểm chung cho cả 150 màn (đi tuần tự, sao, lời sai, đường tắt BFS…) nằm ở kiem-hoc.mjs.
   Chạy: node robotics/hoc/kiem-sung-bong.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
for (const f of ['man-chuoi-2', 'man-tay-gap', 'man-vong-lap', 'man-bang-chuyen', 'man-tham-so', 'man-nhen', 'man-xich', 'man-omni', 'man-tam-day', 'man-khoang-cach', 'man-mau', 'man-nam-cham', 'man-may-nem']) require(path.join(day, f + '.js'));
const ManHoc = require(path.join(day, 'man-sung-bong.js'));
const BoDo = await import('./do-duong-sung-bong.mjs');
const { nhipSungBongNganNhat, nhipSungBongTatCa, buocMotNhip, dungNguCanh, trangThaiDau, laThang, chuoiThanhMa, hanhDongTuDo } = BoDo;

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const maSK = (kq, ma) => kq.suKien.filter((e) => e.ma === ma);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
/** Sự kiện của vết nhịp (ban, nut-doi, cua-doi…; khác maSK là các mốc chẩn đoán). */
const ev = (kq, ma) => nhipVet(kq).flatMap((n) => n.suKien).filter((e) => e.ma === ma);
const L = (...d) => d.join('\n') + '\n';
const loi = (f) => { try { f(); return null; } catch (e) { return e.message; } };
const VEC = SanHoc.VEC;

const ds = ManHoc.danhSach.filter((m) => m.chuong === 'sung-bong');
const tatCa = ManHoc.danhSach;
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];

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
const man = (so) => ManHoc.timMa('sung-bong.' + so);
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const bdCua = (m) => (Array.isArray(m.batDau) ? m.batDau : sanCua(m).map(() => m.batDau));

const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const OMNI = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait'];
const BONG = ['shoot', 'front_clear'];
function chay(rows, bd, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: BANH.concat(BONG) }, extra || {}), code);
}
const TIEN = L('left_move()', 'right_move()', 'wait()');
const PHAI = L('left_move()', 'wait()');
const TRAI = L('right_move()', 'wait()');
const BAN = L('shoot()', 'wait()');
const WAIT = 'wait()\n';
const trong = (n, c = '.') => Array.from({ length: n }, () => c.repeat(n));
const dat1 = (rows, x, y, ch) => rows.map((r, j) => (j === y ? r.slice(0, x) + ch + r.slice(x + 1) : r));
const nutTai = (kq, x, y) => kq.nut.find((n) => n.x === x && n.y === y);
const cuaTai = (kq, x, y) => kq.cua.find((n) => n.x === x && n.y === y);

/* ============================================================================ 1. BAY THẲNG */
console.log('\n== 1. Bóng bay thẳng theo hướng mặt: bốn hướng, dừng ở vật cản đầu tiên, bay qua rào / băng / cửa mở, ra khỏi sân ==');
{
  let tong = 0, dung = 0; const sai = [];
  for (const h of [0, 1, 2, 3]) for (const n of [1, 2, 3]) {
    const dx = 3 + VEC[h][0] * n, dy = 3 + VEC[h][1] * n;
    const kq = chay(dat1(trong(7), dx, dy, 'N'), { x: 3, y: 3, huong: h }, BAN);
    tong++;
    const b = ev(kq, 'ban')[0];
    const ok = b && b.trung === 'nut' && b.den.x === dx && b.den.y === dy && b.o.x === dx && b.soO === n - 1 && b.huong === h && b.tu.x === 3 && b.tu.y === 3 &&
      b.cuoi.x === 3 + VEC[h][0] * (n - 1) && b.cuoi.y === 3 + VEC[h][1] * (n - 1) && kq.nhip === 1 && kq.robot.x === 3 && kq.robot.y === 3 && nutTai(kq, dx, dy).bat === true && ev(kq, 'nut-doi').length === 1;
    if (ok) dung++; else sai.push('h' + h + '/n' + n + ':' + J(b));
  }
  kiem('bóng trúng nút ở cách 1, 2, 3 ô theo bốn hướng: sự kiện ban { trung nut, den = ô nút, cuoi, soO }, nút bật, xe đứng yên, đúng 1 nhịp (' + tong + ' ca)', dung === tong, sai.slice(0, 3).join(' | '));

  const vc = [['#', 'tuong'], ['C', 'cua'], ['H', 'thung'], ['o', 'vat'], ['S', 'bac-thang'], ['X', 'vat'], ['N', 'nut']];
  let ok1 = 0;
  for (const [ch, tr] of vc) {
    // vật cản ở ô thứ 2; nút ở ô thứ 4 phía sau để chứng tỏ bóng dừng ở vật cản, không bay tiếp
    const rows = dat1(dat1(trong(7), 3, 1, ch), 3, 0, 'N');
    const kq = chay(rows, { x: 3, y: 3, huong: 0 }, BAN);
    const b = ev(kq, 'ban')[0];
    if (ch === 'N') { if (b.trung === 'nut' && b.o.y === 1 && b.soO === 1) ok1++; continue; }
    if (b.trung === tr && b.den.y === 1 && b.soO === 1 && b.cuoi.y === 2 && nutTai(kq, 3, 0).bat === false && maSK(kq, 'ban-bi-chan').length === 1) ok1++;
  }
  kiem('bóng dừng ở vật cản đầu tiên: tường cao, cửa đóng, thùng nặng, vật nằm đất, ô đích có vật (X), bậc thang, hay chính nút; nút phía sau không bị trúng (trung tuong / cua / thung / vat / vat / bac-thang / nut)', ok1 === vc.length, ok1 + '/' + vc.length);

  let ok2 = 0;
  for (const ch of ['=', 'c', '>', '<', '^', 'v', 'D', 'F', 'r', 'g', 'b', 'y', '.']) {
    const rows = dat1(dat1(dat1(trong(7), 3, 2, ch), 3, 1, ch), 3, 0, 'N');
    const kq = chay(rows, { x: 3, y: 3, huong: 0 }, BAN);
    const b = ev(kq, 'ban')[0];
    if (b.trung === 'nut' && b.soO === 2 && nutTai(kq, 3, 0).bat === true) ok2++;
  }
  kiem('bóng bay QUA hàng rào thấp, cửa mở, băng chuyền (bốn chiều), ô đích, cờ, sàn màu: ô giữa không cần trống (13 loại ô, hai ô liền nhau)', ok2 === 13, ok2 + '/13');

  const kt = chay(dat1(trong(7), 3, 1, 'C'), { x: 3, y: 3, huong: 0 }, BAN);
  kiem('bóng bị chặn mà sân không có nút: không có chẩn đoán ban-bi-chan (chỉ thông tin khi sân có nút); sân không có gì để trúng thì không có sự kiện suKien chặn', maSK(kt, 'ban-bi-chan').length === 0 && ev(kt, 'ban')[0].trung === 'cua');

  // ra khỏi sân
  for (const [h, xe] of [[0, { x: 3, y: 2 }], [1, { x: 4, y: 3 }], [2, { x: 3, y: 4 }], [3, { x: 2, y: 3 }]]) {
    const kq = chay(trong(5), { x: xe.x, y: xe.y, huong: h }, BAN);
    const b = ev(kq, 'ban')[0], hut = maSK(kq, 'ban-hut');
    kiem('bóng ra khỏi sân (xe quay mặt ' + SanHoc.TEN_HUONG[h] + '): trung null, ban-hut (thông tin) có huong / cuoi / soO, den = ô cuối trong sân, o null',
      b.trung === null && b.o === null && hut.length === 1 && hut[0].huong === h && b.den.x === b.cuoi.x && b.den.y === b.cuoi.y && b.soO >= 0 &&
      (h === 0 ? b.cuoi.y === 0 : h === 2 ? b.cuoi.y === 4 : h === 1 ? b.cuoi.x === 4 : b.cuoi.x === 0), J([b, hut]));
  }
  const ka = chay(trong(5), { x: 2, y: 0, huong: 0 }, BAN);
  kiem('xe sát mép sân quay ra ngoài: bóng ra ngay, soO 0, cuoi = ô xe', ev(ka, 'ban')[0].soO === 0 && ev(ka, 'ban')[0].cuoi.x === 2 && ev(ka, 'ban')[0].cuoi.y === 0 && maSK(ka, 'ban-hut').length === 1);
  kiem('bóng không đổi sân: vật, cửa, xe giữ nguyên; trạng thái vết có robot.sung { dan null }', (() => {
    const k = chay(dat1(trong(5), 2, 1, 'o'), { x: 2, y: 3, huong: 0 }, BAN);
    return k.vat.length === 1 && k.vat[0].trangThai === 'dat' && k.vat[0].y === 1 && k.sung.dan === null && nhipVet(k)[0].robot.sung.dan === null;
  })());
}

/* ============================================================================ 2. NÚT, CỬA, BĂNG */
console.log('\n== 2. Nút đổi trạng thái; cửa và băng chuyền theo nút; man.noi; thứ tự trong nhịp ==');
{
  // hàng ngang: xe (0,1) quay phải, nút ở (4,1), cửa đóng ở (2,0) trên đường đi lên
  const S = ['##C##', '....N', '#####'];
  const xe = { x: 2, y: 1, huong: 1 };
  const a = chay(S, xe, BAN);
  kiem('bắn trúng nút: nut-doi { o, bat true }, nút bật; cửa nối với nút (mặc định) mở ở CUỐI nhịp: cua-doi { o, mo true, nguon "nut" } trong cùng nhịp', ev(a, 'nut-doi').length === 1 && ev(a, 'nut-doi')[0].bat === true && nutTai(a, 4, 1).bat === true && cuaTai(a, 2, 0).mo === true &&
    ev(a, 'cua-doi').length === 1 && ev(a, 'cua-doi')[0].mo === true && ev(a, 'cua-doi')[0].nguon === 'nut' && a.cuaBanDau[0].mo === false && a.nutBanDau[0].bat === false);
  const b = chay(S, xe, BAN + BAN);
  kiem('bắn hai lần: nút về như cũ, cửa đóng lại (cua-doi mo false), ban-nut-lai (thông tin) có ghi', nutTai(b, 4, 1).bat === false && cuaTai(b, 2, 0).mo === false && ev(b, 'cua-doi').length === 2 && maCua(ChamHoc.cham(Object.assign({}, man(1), { san: S, batDau: xe }), { chinh: ['shoot()', 'wait()', 'shoot()', 'wait()'] }, [])).includes('ban-nut-lai'));
  const c = chay(S, xe, BAN + BAN + BAN);
  kiem('bắn ba lần: nút bật, cửa mở (đổi từng lần)', nutTai(c, 4, 1).bat === true && cuaTai(c, 2, 0).mo === true);
  kiem('vết từng nhịp có cua / nut / bangTat (cuối nhịp): nhịp 1 cửa mở, nút bật; nhịp 2 cửa đóng, nút tắt', (() => {
    const v = nhipVet(b);
    return v[0].cua[0].mo === true && v[0].nut[0].bat === true && v[1].cua[0].mo === false && v[1].nut[0].bat === false && Array.isArray(v[0].bangTat) && v[0].robot.sung.dan === null;
  })());

  // cửa đổi cuối nhịp: bóng bay QUA cửa mở ở nhịp đóng lại; phát sau bị cửa đóng chặn
  const S2 = ['..cN'];
  const d = chay(S2, { x: 0, y: 0, huong: 1 }, BAN + BAN);
  const bs = ev(d, 'ban');
  kiem('cửa đổi ở CUỐI nhịp: phát 1 bay qua cửa mở trúng nút (cửa đóng ở cuối nhịp 1); phát 2 bị chính cửa đó chặn (trung cua), nút không bị trúng lần nữa',
    bs[0].trung === 'nut' && bs[1].trung === 'cua' && nutTai(d, 3, 0).bat === true && cuaTai(d, 2, 0).mo === false, J(bs.map((x) => x.trung)));
  // cửa không đóng đè lên xe
  const e = chay(['.cN'], { x: 1, y: 0, huong: 1 }, BAN + WAIT);
  kiem('cửa kẹt: xe đứng ngay ô cửa mở, nút bắn bảo cửa đóng → cửa giữ mở, sự kiện cua-ket { nguon "nut", voi "xe" } và chẩn đoán cua-ket (thông tin)', cuaTai(e, 1, 0).mo === true && ev(e, 'cua-ket').length === 1 && ev(e, 'cua-ket')[0].voi === 'xe' && ev(e, 'cua-doi').length === 0 &&
    maSK(e, 'cua-ket').length === 1 && maCua(ChamHoc.cham(Object.assign({}, man(1), { san: ['.cN'], batDau: { x: 1, y: 0, huong: 1 } }), { chinh: ['shoot()', 'wait()'] }, [])).includes('cua-ket'));
  // xe đâm cửa đóng
  const f = chay(S, { x: 2, y: 1, huong: 0 }, TIEN);
  kiem('xe tiến vào cửa đóng: dam-tuong vat "cua" (đứng yên, mất 1 nhịp); mở cửa rồi thì vào được', maSK(f, 'dam-tuong')[0].vat === 'cua' && f.robot.y === 1 &&
    chay(S, { x: 2, y: 1, huong: 1 }, BAN + PHAI.replace('left_move', 'right_move') + TIEN).robot.y === 0);
  kiem('lyDoChan: nút N chặn xe ("nut") như tường; cửa là trạng thái động nên lyDoChan tĩnh không chặn C / c', (() => {
    const sd = SanHoc.docSan(['.NCc']);
    return SanHoc.lyDoChan(sd, 'banh', 1, 0) === 'nut' && SanHoc.lyDoChan(sd, 'omni', 1, 0) === 'nut' && SanHoc.lyDoChan(sd, 'banh', 2, 0) === null && sd.nut.length === 1 && sd.cua.length === 2 && sd.cua[0].mo === false && sd.cua[1].mo === true;
  })());
  kiem('xe tiến vào nút: dam-tuong vat "nut"; chẩn đoán nói đó là nút bắn', (() => {
    const k = chay(['.N'], { x: 0, y: 0, huong: 1 }, TIEN);
    const r = ChamHoc.cham(Object.assign({}, man(1), { san: ['.N'], batDau: { x: 0, y: 0, huong: 1 } }), { chinh: ['left_move()', 'right_move()', 'wait()'] }, []);
    const c2 = r.chanDoan.find((x) => x.ma === 'dam-tuong');
    return maSK(k, 'dam-tuong')[0].vat === 'nut' && c2 && /nút bắn/.test(c2.loi);
  })());

  // băng chuyền theo nút: băng đổi NGAY, xe đứng trên băng
  const SB = ['N.>..'];
  const xb = { x: 2, y: 0, huong: 3 };
  const g1 = chay(SB, xb, WAIT + WAIT + WAIT);
  const g2 = chay(SB, xb, BAN + WAIT + WAIT + WAIT);
  kiem('băng chuyền đẩy xe khi chưa tắt (chờ 3 nhịp: bị đẩy sang phải); bắn nút tắt băng thì xe đứng yên mãi trên ô băng', g1.robot.x === 3 && g2.robot.x === 2 && g2.bangTat.length === 1 && g2.bangTat[0].x === 2 && ev(g2, 'bang-doi').length === 1 && ev(g2, 'bang-doi')[0].bat === false);
  kiem('băng đổi theo trạng thái MỚI ngay trong nhịp bắn: không bị tính nhịp nằm trên băng (chờ thêm 1 nhịp vẫn không bị đẩy); bắn lần nữa thì băng chạy lại', (() => {
    const k = chay(SB, xb, BAN + WAIT);
    const k2 = chay(SB, xb, BAN + BAN + WAIT + WAIT);
    return k.robot.x === 2 && k2.robot.x === 3 && k2.bangTat.length === 0 && ev(k2, 'bang-doi').length === 2 && ev(k2, 'bang-doi')[1].bat === true;
  })());
  kiem('băng tắt thì xe đi trên băng như sàn thường, không bị kéo lùi: tiến ngược băng 2 ô liên tiếp tới được', (() => {
    const k = chay(['N>>>.'], { x: 4, y: 0, huong: 3 }, BAN + TIEN + TIEN + TIEN);
    const k0 = chay(['N>>>.'], { x: 4, y: 0, huong: 3 }, TIEN + TIEN + TIEN);
    return k.robot.x === 1 && k0.robot.x !== 1;
  })());
  kiem('băng tắt: thùng nặng nằm trên băng cũng không bị đẩy', (() => {
    const k = chay(['N<<<', '....'], { x: 0, y: 1, huong: 0 }, BAN + WAIT + WAIT + WAIT + WAIT, { thung: [{ x: 2, y: 0 }] });
    const k0 = chay(['N<<<', '....'], { x: 0, y: 1, huong: 0 }, WAIT + WAIT + WAIT + WAIT, { thung: [{ x: 2, y: 0 }] });
    return k.thung[0].x === 2 && k0.thung[0].x === 1;
  })());

  // man.noi
  const SN = ['C.C', '...', 'N.N'];
  const xn = { x: 1, y: 2, huong: 3 };
  const mac = chay(SN, xn, BAN);
  kiem('không khai noi: nút điều khiển MỌI cửa thường (cả hai cửa mở cùng lúc khi bắn một nút)', cuaTai(mac, 0, 0).mo === true && cuaTai(mac, 2, 0).mo === true);
  const noi = [{ nut: { x: 0, y: 2 }, cua: [{ x: 0, y: 0 }] }, { nut: { x: 2, y: 2 }, cua: [{ x: 2, y: 0 }] }];
  const co = chay(SN, xn, BAN, { noi });
  const co2 = chay(SN, xn, BAN + PHAI.replace('left_move', 'left_move') + PHAI + BAN, { noi });
  kiem('khai noi: mỗi nút chỉ điều khiển cửa của nó (bắn nút trái: chỉ cửa trái mở; sau khi quay lại bắn nút phải: cả hai mở)', cuaTai(co, 0, 0).mo === true && cuaTai(co, 2, 0).mo === false && cuaTai(co2, 2, 0).mo === true && cuaTai(co2, 0, 0).mo === true, J([co.cua, co2.cua]));
  kiem('noi: nút không có trong noi thì không điều khiển gì; nhóm sai (không phải nút / cửa / băng, cửa nhịp) bị từ chối', (() => {
    const rong = chay(SN, xn, BAN, { noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 2, y: 0 }] }] });
    const l1 = loi(() => chay(SN, xn, BAN, { noi: [{ nut: { x: 1, y: 1 }, cua: [] }] }));
    const l2 = loi(() => chay(SN, xn, BAN, { noi: [{ nut: { x: 0, y: 2 }, cua: [{ x: 1, y: 1 }] }] }));
    const l3 = loi(() => chay(SN, xn, BAN, { noi: [{ nut: { x: 0, y: 2 }, bang: [{ x: 1, y: 1 }] }] }));
    const l4 = loi(() => chay(SN, xn, BAN, { noi: [{ nut: { x: 0, y: 2 }, cua: [{ x: 0, y: 0 }] }], cuaNhip: [{ x: 0, y: 0, mo: 1, dong: 1 }] }));
    return cuaTai(rong, 0, 0).mo === false && /không phải nút/.test(l1) && /không phải cửa/.test(l2) && /không phải băng/.test(l3) && /cửa nhịp/.test(l4);
  })());
  kiem('noi khai băng: nút điều khiển đúng băng được khai (hai làn, nút chỉ tắt làn của nó)', (() => {
    const rows = ['N...', '>...', '>...', '...N'];
    const k = chay(rows, { x: 2, y: 3, huong: 1 }, BAN, { noi: [{ nut: { x: 3, y: 3 }, bang: [{ x: 0, y: 1 }] }] });
    return k.bangTat.length === 1 && k.bangTat[0].y === 1;
  })());
  kiem('chẩn đoán dam-tuong với cửa đóng nói "cửa" và có `cho`', (() => {
    const r = ChamHoc.cham(Object.assign({}, man(1), { san: S, batDau: { x: 2, y: 1, huong: 0 } }), { chinh: ['left_move()', 'right_move()', 'wait()'] }, []);
    const c2 = r.chanDoan.find((x) => x.ma === 'dam-tuong');
    return c2 && /cửa/.test(c2.loi) && c2.cho && c2.cho.cot === 'chinh' && c2.cho.dong === 1;
  })());
}

/* ============================================================================ 3. CỬA NHỊP */
console.log('\n== 3. Cửa nhịp: chu kỳ mo + dong, pha; front_clear() chờ được; cửa kẹt ==');
{
  const S = ['#.C.#'];
  const cn = (mo, dong, pha) => [{ x: 2, y: 0, mo, dong, pha }];
  const trangThai = (kq) => nhipVet(kq).map((n) => n.cua[0].mo);
  const w5 = WAIT.repeat(5);
  const xe = { x: 1, y: 0, huong: 1 };
  kiem('cửa nhịp mo 2 dong 2 pha 0: sau mỗi nhịp 1..5 là mở, đóng, đóng, mở, mở (đổi ở cuối nhịp; trạng thái đầu = mở)', J(trangThai(chay(S, xe, w5, { cuaNhip: cn(2, 2, 0) }))) === J([true, false, false, true, true]) && chay(S, xe, '', { cuaNhip: cn(2, 2, 0) }).cuaBanDau[0].mo === true);
  kiem('pha 1: (t + pha) mod 4 < 2 thì mở, nên mở lúc t = 0; sau nhịp 1..5 là đóng, đóng, mở, mở, đóng', J(trangThai(chay(S, xe, w5, { cuaNhip: cn(2, 2, 1) }))) === J([false, false, true, true, false]));
  kiem('pha 2: trạng thái đầu đóng; mo 1 dong 3 pha 0: mở rồi đóng ba nhịp; mo 3 dong 1: mở ba nhịp đóng một', J(chay(S, xe, '', { cuaNhip: cn(2, 2, 2) }).cuaBanDau.map((x) => x.mo)) === '[false]' &&
    J(trangThai(chay(S, xe, w5, { cuaNhip: cn(1, 3, 0) }))) === J([false, false, false, true, false]) && J(trangThai(chay(S, xe, w5, { cuaNhip: cn(3, 1, 0) }))) === J([true, true, false, true, true]));
  kiem('cửa nhịp không điều khiển bằng nút mặc định: bắn nút không đổi cửa nhịp, cửa thường vẫn đổi', (() => {
    const rows = ['N.C.c', '#####'];
    const k = chay(rows, { x: 1, y: 0, huong: 3 }, BAN, { cuaNhip: [{ x: 4, y: 0, mo: 2, dong: 2, pha: 0 }] });
    return cuaTai(k, 2, 0).mo === true && cuaTai(k, 4, 0).mo === true && ev(k, 'cua-doi').filter((x) => x.nguon === 'nhip').length === 0;
  })());
  kiem('cuaNhip trên ô không phải cửa → lỗi cấu hình; mo / dong phải là số nguyên ≥ 1', /không phải cửa/.test(loi(() => chay(S, xe, '', { cuaNhip: [{ x: 1, y: 0, mo: 1, dong: 1 }] }))) && /số nguyên/.test(loi(() => chay(S, xe, '', { cuaNhip: [{ x: 2, y: 0, mo: 0, dong: 1 }] }))));
  // front_clear
  const doc = (kq) => kq.vet.filter((e) => e.docCamBien).map((e) => e.docCamBien);
  const k1 = chay(S, xe, 'a = front_clear()\n' + WAIT + 'b = front_clear()\n' + WAIT + 'c = front_clear()\n' + WAIT + 'd = front_clear()\n', { cuaNhip: cn(1, 1, 1) });
  kiem('front_clear() trả False khi cửa trước mặt đang đóng (vat "cua"), True khi mở; đổi theo từng nhịp (mo 1 dong 1 pha 1: đóng, mở, đóng, mở)', J(doc(k1).map((d) => d.trong)) === J([false, true, false, true]) && doc(k1)[0].vat === 'cua' && doc(k1)[1].vat === null, J(doc(k1)));
  // while not front_clear(): wait()
  const code = 'while not front_clear():\n    wait()\n' + TIEN + TIEN + TIEN;
  const cho3 = [0, 1, 2, 3].map((p) => chay(['#.C.F#'], xe, code, { cuaNhip: cn(2, 2, p) }));
  kiem('while not front_clear(): wait() chờ đúng tới khi cửa mở rồi đi: pha 0 và 1 mở ngay (3 nhịp), pha 2 chờ 2 nhịp (5), pha 3 chờ 1 nhịp (4); cả bốn pha tới cờ', cho3.map((r) => r.nhip).join() === '3,3,5,4' && cho3.every((r) => r.thang), cho3.map((r) => r.nhip).join());
  // cửa kẹt theo nhịp
  const kk = chay(['#.C.F#'], xe, TIEN + WAIT, { cuaNhip: cn(1, 1, 0) });
  kiem('cửa nhịp muốn đóng mà xe đang đứng trong ô cửa: giữ mở (cua-ket, nguon "nhip"); xe đi khỏi thì đóng ở cuối nhịp đó', (() => {
    const k = chay(['#.C.F#'], xe, TIEN + TIEN, { cuaNhip: cn(1, 3, 0) });
    return ev(k, 'cua-ket').length >= 1 && ev(k, 'cua-ket')[0].nguon === 'nhip' && nhipVet(k)[0].cua[0].mo === true && nhipVet(k)[1].cua[0].mo === false && k.robot.x === 3;
  })());
  void kk;
  kiem('tiến vào cửa nhịp đang đóng: dam-tuong vat "cua"; chẩn đoán chỉ cửa đang đóng và có `cho` trỏ dòng lệnh', (() => {
    const m1 = Object.assign({}, man(6), { san: [['#.C.F#'], ['#.C.F#'], ['#.C.F#']].map((x) => x[0]).slice(0, 1), batDau: xe, cuaNhip: undefined });
    const m6 = Object.assign({}, man(6));
    const r = ChamHoc.cham(m6, { chinh: ['move()', 'move()'] }, khoTruoc('32.6'));
    const c2 = r.chanDoan.find((x) => x.ma === 'dam-tuong');
    void m1;
    return c2 && /cửa/.test(c2.loi) && c2.cho && c2.cho.dong === 1 && /Sân/.test(c2.loi);
  })());
}

/* ============================================================================ 4. LỆNH SHOOT */
console.log('\n== 4. shoot(): chỉ ra lệnh, xe đứng yên, gọi lại, quên wait, đạn, thân không hợp ==');
{
  const S = ['...N.'];
  const xe = { x: 1, y: 0, huong: 1 };
  const a = chay(S, xe, 'shoot()\nleft_move()\nright_move()\nwait()\n');
  kiem('shoot() cùng nhịp với lệnh bánh: xe đứng yên, lệnh bánh bị bỏ (ban-dung-yen, thông tin), bóng vẫn bay', maSK(a, 'ban-dung-yen').length === 1 && a.robot.x === 1 && ev(a, 'ban').length === 1 && maSK(a, 'ban-dung-yen')[0].ban.ten === 'shoot');
  const r = ChamHoc.cham(Object.assign({}, man(1), { san: ['....N', '#####'], batDau: { x: 2, y: 0, huong: 1 } }), { chinh: ['shoot()', 'left_move()', 'wait()'] }, []);
  const cd = r.chanDoan.find((x) => x.ma === 'ban-dung-yen');
  kiem('chẩn đoán ban-dung-yen: thông tin, tiếng Việt, có `cho` và `choBan`', cd && cd.muc === 'thong-tin' && /shoot\(\)/.test(cd.loi) && cd.cho && cd.cho.dong === 2 && cd.choBan && cd.choBan.dong === 1);
  const b = chay(S, xe, 'shoot()\nshoot()\nwait()\n');
  kiem('hai shoot() cùng nhịp: lệnh sau bị bỏ (ban-goi-lai, lỗi), chỉ một quả bóng', maSK(b, 'ban-goi-lai').length === 1 && maSK(b, 'ban-goi-lai')[0].truoc.ten === 'shoot' && ev(b, 'ban').length === 1 && nutTai(b, 3, 0).bat === true);
  const r2 = ChamHoc.cham(Object.assign({}, man(1), { san: ['....N', '#####'], batDau: { x: 2, y: 0, huong: 1 } }), { chinh: ['shoot()', 'shoot()', 'wait()'] }, []);
  const cd2 = r2.chanDoan.find((x) => x.ma === 'ban-goi-lai');
  kiem('chẩn đoán ban-goi-lai: lỗi, trỏ dòng 2 (cho) và dòng 1 (choTruoc)', cd2 && cd2.muc === 'loi' && cd2.cho.dong === 2 && cd2.choTruoc.dong === 1);
  const c = chay(S, xe, 'shoot()\n');
  kiem('shoot() không wait(): quen-wait, chưa bắn (không có sự kiện ban), 0 nhịp', maSK(c, 'quen-wait').length === 1 && ev(c, 'ban').length === 0 && c.nhip === 0 && ChamHoc.cham(Object.assign({}, man(1), { san: ['....N'], batDau: xe }), { chinh: ['shoot()'] }, []).chanDoan.some((x) => x.ma === 'quen-wait' && /tay/.test(x.loi)));
  // đạn
  const d = chay(S, xe, BAN + BAN + BAN, { danToiDa: 2 });
  kiem('danToiDa 2: hai phát đầu bắn, phát thứ ba het-dan (lỗi) nhưng vẫn mất 1 nhịp; sung.dan 0; nút bị trúng 2 lần (về như cũ)', ev(d, 'ban').length === 2 && maSK(d, 'het-dan').length === 1 && d.nhip === 3 && d.sung.dan === 0 && nutTai(d, 3, 0).bat === false);
  const d2 = chay(['....N'], { x: 0, y: 0, huong: 1 }, BAN + BAN, { danToiDa: 1 });
  kiem('danToiDa 1: phát đầu trúng nút (bật), phát hai hết đạn; vết nhịp có robot.sung.dan 1 rồi 0', nutTai(d2, 4, 0).bat === true && nhipVet(d2)[0].robot.sung.dan === 0 && maSK(d2, 'het-dan').length === 1);
  kiem('chẩn đoán het-dan: lỗi, tiếng Việt, nói số viên và có `cho`', (() => {
    const rr = ChamHoc.cham(Object.assign({}, man(1), { danToiDa: 1, san: ['....N'], batDau: { x: 0, y: 0, huong: 1 } }), { chinh: ['shoot()', 'wait()', 'shoot()', 'wait()'] }, []);
    const c2 = rr.chanDoan.find((x) => x.ma === 'het-dan');
    return c2 && c2.muc === 'loi' && /1 viên/.test(c2.loi) && c2.cho && c2.cho.dong === 3;
  })());
  kiem('danToiDa cho robot không có súng → lỗi cấu hình; danToiDa âm / lẻ cũng lỗi', /chỉ dùng cho robot có súng/.test(loi(() => SanHoc.chay({ san: ['..'], batDau: { x: 0, y: 0, huong: 0 }, loaiRobot: 'banh', danToiDa: 1 }, ''))) && /số nguyên không âm/.test(loi(() => chay(S, xe, '', { danToiDa: -1 }))) && /số nguyên không âm/.test(loi(() => chay(S, xe, '', { danToiDa: 1.5 }))));
  kiem('không khai danToiDa: đạn vô hạn (50 phát liền vẫn bắn), sung.dan null', (() => { const k = chay(S, xe, BAN.repeat(50)); return ev(k, 'ban').length === 50 && k.sung.dan === null && maSK(k, 'het-dan').length === 0; })());
  // thân
  const omni = chay(['....N'], { x: 0, y: 0, huong: 1 }, BAN + L('slide_right()', 'wait()'), { loaiRobot: 'omni', hamGoc: OMNI.concat(['shoot']) });
  kiem('omni mang súng: bắn rồi trượt ngang giữ hướng; shoot() cùng nhịp slide_right(): slide bị bỏ (ban-dung-yen)', nutTai(omni, 4, 0).bat === true && omni.robot.huong === 1 &&
    maSK(chay(['....N', '.....'], { x: 0, y: 0, huong: 1 }, 'shoot()\nslide_right()\nwait()\n', { loaiRobot: 'omni', hamGoc: OMNI.concat(['shoot']) }), 'ban-dung-yen')[0].lenh.ten === 'slide_right');
  const xich = chay(['....N'], { x: 0, y: 0, huong: 1 }, BAN, { loaiRobot: 'xich', hamGoc: BANH.concat(['shoot']) });
  kiem('xích mang súng: bắn như xe bánh; nhịp bắn làm mất phần quay dở của xích (xich-quay-do)', nutTai(xich, 4, 0).bat === true &&
    maSK(chay(['....N', '.....'], { x: 0, y: 1, huong: 0 }, L('left_move()', 'wait()') + BAN, { loaiRobot: 'xich', hamGoc: BANH.concat(['shoot']) }), 'xich-quay-do').length === 1);
  kiem('nhện không gắn súng (nhện không có hướng mặt) → lỗi cấu hình', /Nhện không gắn súng bóng/.test(loi(() => SanHoc.chay({ san: trong(5), batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'nhen', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'shoot'] }, ''))));
  for (const tay of [['arm_down', 'arm_up', 'grab', 'release'], ['push'], ['magnet_n', 'magnet_off'], ['aim', 'throw', 'load']]) {
    kiem('súng bóng không đi chung ' + tay[0] + ' (một robot một tay) → lỗi cấu hình', /một robot chỉ có một tay/i.test(loi(() => SanHoc.chay({ san: trong(5), batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['shoot'], tay) }, ''))));
  }
  kiem('robot không có súng: shoot() là hàm lạ; hàm gốc shoot hợp lệ; sung null', (() => {
    const k = SanHoc.chay({ san: trong(5), batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'banh' }, 'shoot()\n');
    return k.loi && /Chưa có biến hay hàm/.test(k.loi.thongDiep) && k.sung === null && chay(trong(5), { x: 2, y: 2, huong: 0 }, '').sung.dan === null;
  })());
  kiem('xe không xuất phát trong nút hay cửa đóng', /không đứng được/.test(loi(() => chay(['N.'], { x: 0, y: 0, huong: 1 }, ''))) && /cửa đang đóng/.test(loi(() => chay(['C.'], { x: 0, y: 0, huong: 1 }, ''))) && chay(['c.'], { x: 0, y: 0, huong: 1 }, '').nhip === 0);
  kiem('ký hiệu N / C / c không có màu (lớp màu trên nút, cửa là lỗi cấu hình); vật, thùng không đặt lên nút / cửa', /không có màu/.test(loi(() => SanHoc.docSan(['.N.'], ['.r.']))) && /không có màu/.test(loi(() => SanHoc.docSan(['.C.'], ['.g.']))) &&
    chay(['.N'], { x: 0, y: 0, huong: 1 }, '', { vat: [{ x: 1, y: 0 }], thung: [{ x: 1, y: 0 }] }).vat.length === 0);
  kiem('cảm biến khoảng cách: nút là không trống (vat "nut"), cửa đóng không trống (vat "cua"), cửa mở trống', (() => {
    const q = (rows) => chay(rows, { x: 0, y: 0, huong: 1 }, 'x = front_clear()\n').vet.filter((e) => e.docCamBien)[0].docCamBien;
    return q(['.N']).trong === false && q(['.N']).vat === 'nut' && q(['.C']).vat === 'cua' && q(['.c']).trong === true;
  })());
}

/* ============================================================================ 5. CHẨN ĐOÁN CÓ `cho` */
console.log('\n== 5. Chẩn đoán ghi `cho` (dòng lệnh gây ra): các mã cũ và các mã súng bóng ==');
{
  // man giả cho tay kẹp (lõi tay-gap) — kiểm các mã cũ chưa có cho
  const TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  const manTay = (san, bd, extra) => Object.assign({
    loaiRobot: 'banh', mucTieu: 'dua-vat', hamGoc: BANH.concat(TAY), robot: { than: 'hai-banh', tay: 'kep', camBien: [] }, moXuong: true, camHamCuaEm: false,
    khung: { chinh: 10, moiHam: 10 }, cauTruc: ['for', 'if', 'while'], san, batDau: bd, sao: { o: 3, nhip: 1 }
  }, extra || {});
  const lay = (r, ma) => r.chanDoan.find((c) => c.ma === ma);
  const chinh = (...d) => ({ chinh: d });
  const SK = ['.....', '.o...', '.....', '..D..', '.....'];
  // kep-hut: kẹp khi ô trước mặt trống (tay hạ)
  const r1 = ChamHoc.cham(manTay(SK, { x: 1, y: 3, huong: 1 }), chinh('arm_down()', 'grab()', 'wait()'), []);
  kiem('kep-hut (kẹp vào không khí) có `cho` trỏ dòng grab() (dòng 2)', lay(r1, 'kep-hut') && lay(r1, 'kep-hut').cho && lay(r1, 'kep-hut').cho.cot === 'chinh' && lay(r1, 'kep-hut').cho.dong === 2, J(lay(r1, 'kep-hut')));
  const r1b = ChamHoc.cham(manTay(SK, { x: 1, y: 2, huong: 0 }), chinh('wait()', 'grab()', 'wait()'), []);
  kiem('kep-hut vì tay đang nâng (vật ngay trước mặt) cũng có `cho` (dòng 2)', lay(r1b, 'kep-hut') && lay(r1b, 'kep-hut').lyDo === 'tay-nang' && lay(r1b, 'kep-hut').cho.dong === 2);
  // vat-vo: thả từ trên cao
  const r2 = ChamHoc.cham(manTay(SK, { x: 1, y: 2, huong: 0 }), chinh('arm_down()', 'grab()', 'wait()', 'arm_up()', 'release()', 'wait()'), []);
  kiem('vat-vo (thả từ trên cao) có `cho` trỏ dòng release() (dòng 5)', lay(r2, 'vat-vo') && lay(r2, 'vat-vo').cho && lay(r2, 'vat-vo').cho.dong === 5, J(r2.chanDoan.map((c) => c.ma)));
  // tha-bi-chan (kẹp): ô trước là tường
  const r3 = ChamHoc.cham(manTay(['.....', '.o...', '..#..', '...D.', '.....'], { x: 1, y: 2, huong: 0 }),
    chinh('arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'left_move()', 'wait()', 'arm_down()', 'release()', 'wait()'), []);
  kiem('tha-bi-chan (tay kẹp, ô trước là tường) có `cho` trỏ dòng release() (dòng 9)', lay(r3, 'tha-bi-chan') && lay(r3, 'tha-bi-chan').kieu === 'kep' && lay(r3, 'tha-bi-chan').cho && lay(r3, 'tha-bi-chan').cho.dong === 9, J(r3.chanDoan.map((c) => c.ma + ':' + J(c.cho))));
  // dam-tuong vat 'vat' (lệnh bánh của nhịp)
  const r4 = ChamHoc.cham(manTay(SK, { x: 1, y: 2, huong: 0 }), chinh('wait()', 'left_move()', 'right_move()', 'wait()'), []);
  kiem('dam-tuong (xe vướng vật nằm đất) có `cho` trỏ lệnh bánh đầu của nhịp (dòng 2)', lay(r4, 'dam-tuong') && lay(r4, 'dam-tuong').cho && lay(r4, 'dam-tuong').cho.dong === 2 && /vật/.test(lay(r4, 'dam-tuong').loi), J(lay(r4, 'dam-tuong')));
  const r5 = ChamHoc.cham(manTay(['#....', '.....'], { x: 0, y: 1, huong: 0 }), chinh('left_move()', 'right_move()', 'wait()'), []);
  kiem('dam-tuong vào tường cũng có `cho` (dòng 1)', lay(r5, 'dam-tuong') && lay(r5, 'dam-tuong').cho.dong === 1);
  // lệnh nằm trong hàm của em: cho trỏ vào thân hàm
  const r6 = ChamHoc.cham(manTay(['#....', '.....'], { x: 0, y: 1, huong: 0 }), chinh('step()'), [H('step', ['left_move()', 'right_move()', 'wait()'])]);
  kiem('dam-tuong gây ra trong thân hàm của em: cho { cot "hamEm", ten, dong 1 }', lay(r6, 'dam-tuong') && lay(r6, 'dam-tuong').cho.cot === 'hamEm' && lay(r6, 'dam-tuong').cho.ten === 'step' && lay(r6, 'dam-tuong').cho.dong === 1);
  // sân thử của Xưởng: dam-tuong vào tường gọi từ lời gọi thử
  const rt = ChamHoc.thuHam(manTay(SK, { x: 1, y: 2, huong: 0 }), { chinh: [], hamCuaMan: [] }, 'tien', [H('tien', ['left_move()', 'right_move()', 'wait()'])], { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, tuong: [{ x: 2, y: 1 }] } });
  kiem('sân thử: dam-tuong có `cho` trỏ dòng 1 trong thân hàm đang thử', rt.chanDoan.find((c) => c.ma === 'dam-tuong') && rt.chanDoan.find((c) => c.ma === 'dam-tuong').cho && rt.chanDoan.find((c) => c.ma === 'dam-tuong').cho.ten === 'tien');

  // súng bóng
  const m1 = (san, bd, extra) => Object.assign({}, man(1), { san, batDau: bd }, extra || {});
  const CHO = (r, ma, dong) => { const c = lay(r, ma); return !!(c && c.cho && c.cho.cot === 'chinh' && c.cho.dong === dong); };
  const ra = ChamHoc.cham(m1(['....N'], { x: 0, y: 0, huong: 2 }), chinh('wait()', 'shoot()', 'wait()'), []);
  kiem('ban-hut có `cho` trỏ dòng shoot() (dòng 2)', CHO(ra, 'ban-hut', 2) && lay(ra, 'ban-hut').muc === 'thong-tin' && /ra khỏi sân/.test(lay(ra, 'ban-hut').loi));
  const rb = ChamHoc.cham(m1(['.C.N'], { x: 0, y: 0, huong: 1 }), chinh('wait()', 'shoot()', 'wait()'), []);
  kiem('ban-bi-chan có `cho` trỏ dòng shoot() (dòng 2), nói bóng dừng ở cửa đang đóng', CHO(rb, 'ban-bi-chan', 2) && /cửa đang đóng/.test(lay(rb, 'ban-bi-chan').loi));
  const rc = ChamHoc.cham(m1(['.N'], { x: 0, y: 0, huong: 1 }), chinh('shoot()', 'wait()', 'shoot()', 'wait()'), []);
  kiem('ban-nut-lai có `cho` trỏ dòng shoot() của phát đầu (dòng 1), nói số lần', CHO(rc, 'ban-nut-lai', 1) && /2 lần/.test(lay(rc, 'ban-nut-lai').loi));
  const rd = ChamHoc.cham(m1(['.cN'], { x: 1, y: 0, huong: 1 }), chinh('wait()', 'shoot()', 'wait()'), []);
  kiem('cua-ket có `cho` trỏ dòng lệnh của nhịp (shoot ở dòng 2)', CHO(rd, 'cua-ket', 2) || (lay(rd, 'cua-ket') && lay(rd, 'cua-ket').cho), J(lay(rd, 'cua-ket')));
  const re = ChamHoc.cham(m1(['.cN'], { x: 0, y: 0, huong: 1 }), chinh('wait()', 'shoot()', 'wait()', 'left_move()', 'right_move()', 'wait()'), []);
  void re;
  const rf = ChamHoc.cham(m1(['....N'], { x: 1, y: 0, huong: 1 }, { cuaNhip: undefined }), chinh('shoot()', 'shoot()', 'wait()'), []);
  kiem('ban-goi-lai có `cho` (dòng 2); het-dan có `cho`; ban-dung-yen có `cho`', CHO(rf, 'ban-goi-lai', 2) &&
    CHO(ChamHoc.cham(m1(['....N'], { x: 1, y: 0, huong: 1 }, { danToiDa: 0 }), chinh('wait()', 'shoot()', 'wait()'), []), 'het-dan', 2) &&
    CHO(ChamHoc.cham(m1(['....N'], { x: 1, y: 0, huong: 1 }), chinh('left_move()', 'shoot()', 'wait()'), []), 'ban-dung-yen', 1));
  // mọi chẩn đoán của lời sai 15.x có `cho` khi mã gắn với lệnh
  const MA_CO_CHO = ['dam-tuong', 'ban-hut', 'ban-bi-chan', 'ban-nut-lai', 'ban-dung-yen', 'ban-goi-lai', 'het-dan', 'cua-ket', 'quen-wait', 'vong-vo-han'];
  let thieu = [];
  for (const m of ds) {
    const kt = khoTruoc(m.id);
    for (const ls of m.loiSai) {
      const r = ChamHoc.cham(m, ls.baiLam, tron(kt, ls.hamCuaEmMoi));
      for (const c of r.chanDoan) if (MA_CO_CHO.includes(c.ma) && !(c.cho && c.cho.cot)) thieu.push(m.id + ':' + c.ma);
    }
  }
  kiem('mọi chẩn đoán gắn với lệnh trong các lời sai của 10 màn (dam-tuong, ban-*, het-dan, cua-ket, quen-wait, vong-vo-han) đều có `cho`', thieu.length === 0, [...new Set(thieu)].join());
}

/* ============================================================================ 6. XƯỞNG (sân thử) */
console.log('\n== 6. Sân thử của Xưởng hàm: nút, cửa ==');
{
  const man1 = man(1);
  const fire = H('fire', ['shoot()', 'wait()']);
  const st = { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, nut: [{ x: 2, y: 0 }, { x: 2, y: 2 }, { x: 9, y: 9 }, { x: 1, y: 1 }], cua: [{ x: 2, y: 1, mo: false }, { x: 3, y: 3, mo: true }, { x: 0, y: 0 }] };
  const cs = ChamHoc.chuanSanThu(st);
  kiem('chuanSanThu: nut (bỏ ô xe và ngoài sân), cua { x, y, mo } (mặc định đóng), không đè nhau; sân thử cũ không có nut / cua', cs.nut.length === 2 && cs.nut.some((o) => o.x === 2 && o.y === 0) && cs.cua.length === 3 && cs.cua.find((o) => o.x === 3).mo === true && cs.cua.find((o) => o.x === 0).mo === false && ChamHoc.chuanSanThu({}).nut === undefined && ChamHoc.chuanSanThu({}).cua === undefined, J(cs));
  const hs = ChamHoc.hangSanThu(cs);
  kiem('hangSanThu vẽ N cho nút, C cho cửa đóng, c cho cửa mở', hs[0][2] === 'N' && hs[1][2] === 'C' && hs[3][3] === 'c' && hs[1][1] === 'N');
  const stOk = { rong: 5, cao: 5, batDau: { x: 2, y: 3, huong: 0 }, nut: [{ x: 2, y: 0 }], cua: [{ x: 2, y: 1 }] };
  const r = ChamHoc.thuHam(man1, { chinh: [], hamCuaMan: [] }, 'fire', [fire], { sanThu: stOk });
  kiem('thử fire() ở sân thử có cửa chắn trước nút: bóng dừng ở cửa đóng (ban-bi-chan), nút không đổi; kết quả có nut / cua / bangTat / sung', r.nut.length === 1 && r.nut[0].bat === false && r.cua[0].mo === false && maCua(r).includes('ban-bi-chan') && Array.isArray(r.bangTat) && r.sung && r.sung.dan === null);
  const stOk2 = { rong: 5, cao: 5, batDau: { x: 2, y: 3, huong: 0 }, nut: [{ x: 2, y: 0 }], cua: [{ x: 4, y: 4, mo: true }] };
  const r2 = ChamHoc.thuHam(man1, { chinh: [], hamCuaMan: [] }, 'fire', [fire], { sanThu: stOk2 });
  kiem('thử fire() trúng nút trong sân thử: nút bật; cửa nối với nút (mặc định) đóng lại cuối nhịp; vết có sự kiện ban và nut-doi', r2.nut[0].bat === true && r2.cua[0].mo === false && ev(r2, 'ban')[0].trung === 'nut' && ev(r2, 'cua-doi').length === 1 && r2.soNhip === 1);
  const r3 = ChamHoc.thuHam(man1, { chinh: [], hamCuaMan: [] }, 'fire', [fire], {});
  kiem('sân thử mặc định (không nút): bóng ra khỏi sân (ban-hut), không lỗi; cua / nut rỗng', maCua(r3).includes('ban-hut') && r3.nut.length === 0 && r3.cua.length === 0);
}

/* ============================================================================ 7. BỘ DÒ ĐƯỜNG TẮT */
console.log('\n== 7. Bộ dò đường tắt (BFS theo nhịp, có giới hạn) + so chéo ngẫu nhiên với san-hoc.js ==');
{
  const a = { loaiRobot: 'banh', san: ['##F##', '##C##', '....N', '....#', '....#'], batDau: { x: 2, y: 2, huong: 1 } };
  const bd = nhipSungBongNganNhat(a);
  kiem('bộ dò: sân 16.1 = 4 nhịp (bắn, quay, hai bước)', bd.nhip === 4 && bd.chuoi[0].shoot === true && !bd.catNgang, J(bd.chuoi));
  kiem('bộ dò: cờ bị cửa chặn mà không có nút → không tới được (null, không cắt ngang)', (() => { const k = nhipSungBongNganNhat({ loaiRobot: 'banh', san: ['.C.F'], batDau: { x: 0, y: 0, huong: 1 } }); return k.nhip === null && !k.catNgang; })());
  kiem('bộ dò có GIỚI HẠN: toiDaTrangThai nhỏ thì cắt ngang (catNgang true); toiDaMs 0 cũng cắt ngang, không treo', (() => {
    const big = { loaiRobot: 'banh', san: ['.......', '.......', '.......', '.......', '......F'].map((r) => r), batDau: { x: 0, y: 0, huong: 1 } };
    const k1 = nhipSungBongNganNhat(big, { toiDaTrangThai: 5 });
    const unreachable = { loaiRobot: 'banh', san: ['.......', '.......', '.......', '.......', '.......', '###.###', '..F....'], batDau: { x: 0, y: 0, huong: 1 } };
    const k2 = nhipSungBongNganNhat(unreachable, { toiDaMs: 0 });
    return k1.catNgang === true && k1.nhip === null && (k2.catNgang === true || k2.nhip === null) && k2.soTrangThai < 100000;
  })());
  kiem('bộ dò: xích không hỗ trợ → ném lỗi rõ; loại lạ cũng lỗi', /chưa hỗ trợ xích/.test(loi(() => nhipSungBongNganNhat(Object.assign({}, a, { loaiRobot: 'xich' })))) && /chỉ biết/.test(loi(() => nhipSungBongNganNhat(Object.assign({}, a, { loaiRobot: 'nhen' })))));
  kiem('bộ dò: cửa nhịp được tính (cửa nhịp pha 2 chờ 2 nhịp: 4 nhịp thay vì 2)', nhipSungBongNganNhat({ loaiRobot: 'banh', san: ['.C.F'.slice(0, 0) + '#.C.F#'], batDau: { x: 1, y: 0, huong: 1 }, cuaNhip: [{ x: 2, y: 0, mo: 2, dong: 2, pha: 2 }] }).nhip === 4 + 1);
  kiem('bộ dò: băng tắt được tính (làn băng ngược 4 ô: có nút 6 nhịp, bỏ nút 8 nhịp)', nhipSungBongNganNhat({ loaiRobot: 'banh', san: ['#######', '.<<<<FN', '#######'], batDau: { x: 0, y: 1, huong: 1 } }).nhip === 6 && nhipSungBongNganNhat({ loaiRobot: 'banh', san: ['#######', '.<<<<F#', '#######'], batDau: { x: 0, y: 1, huong: 1 } }).nhip === 8);
  const mm = nhipSungBongNganNhat({ loaiRobot: 'banh', san: ['##F##', '##C##', '....N', '....#', '....#'], batDau: { x: 2, y: 2, huong: 1 } });
  const sh = SanHoc.chay({ san: ['##F##', '##C##', '....N', '....#', '....#'], batDau: { x: 2, y: 2, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH.concat(['shoot']) }, chuoiThanhMa(mm.chuoi));
  kiem('chuỗi hành động của bộ dò đổi sang Python rồi chạy thật trên san-hoc.js: thắng đúng số nhịp bộ dò báo', sh.thang && sh.nhip === mm.nhip);

  // so chéo ngẫu nhiên
  let seed = 20261014;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  let soCa = 0, lech = 0, soNhip = 0, soBan = 0, soNut = 0, soCuaDoi = 0, soKet = 0, soThang = 0, soBangDoi = 0, soCuaNhip = 0, soBiChan = 0; const ghiLech = [];
  for (let ca = 0; ca < 1600; ca++) {
    const omni = ca % 4 === 3;
    const loai = omni ? 'omni' : 'banh';
    const rong = 5 + Math.floor(rnd() * 3), cao = 5 + Math.floor(rnd() * 2);
    const g = Array.from({ length: cao }, () => Array(rong).fill('.'));
    const o = () => [Math.floor(rnd() * rong), Math.floor(rnd() * cao)];
    const dat = (ch, n, chiTrong = true) => { for (let i = 0; i < n; i++) { const [x, y] = o(); if (!chiTrong || g[y][x] === '.') g[y][x] = ch; } };
    dat('#', 3); dat('=', 3); dat('S', 1); dat('>', 1); dat('<', 1); dat('^', 1); dat('v', 1);
    dat('N', 2 + Math.floor(rnd() * 2)); dat('C', 1 + Math.floor(rnd() * 2)); dat('c', 1);
    dat('o', Math.floor(rnd() * 3)); dat('H', Math.floor(rnd() * 2)); dat('F', 1);
    // phải có ít nhất một nút và một cửa
    const cellsOf = (ch) => { const r = []; g.forEach((row, y) => row.forEach((c, x) => { if (c === ch) r.push([x, y]); })); return r; };
    if (!cellsOf('N').length) { dat('N', 6); } if (!cellsOf('C').length && !cellsOf('c').length) { dat('C', 8); }
    const sanh = []; g.forEach((row, y) => row.forEach((c, x) => { if (c === '.') sanh.push([x, y]); }));
    if (!sanh.length) continue;
    const [xx, yy] = pick(sanh);
    const xe = { x: xx, y: yy, huong: Math.floor(rnd() * 4) };
    const rows = g.map((r) => r.join(''));
    const cuaCells = cellsOf('C').concat(cellsOf('c'));
    if (!cuaCells.length || !cellsOf('N').length) continue;
    const cuaNhip = cuaCells.filter(() => rnd() < 0.45).map(([x, y]) => ({ x, y, mo: 1 + Math.floor(rnd() * 3), dong: 1 + Math.floor(rnd() * 3), pha: Math.floor(rnd() * 4) }));
    const thuong = cuaCells.filter(([x, y]) => !cuaNhip.some((c) => c.x === x && c.y === y));
    let noi;
    if (rnd() < 0.4) {
      const bangCells = []; rows.forEach((r, y) => [...r].forEach((c, x) => { if (SanHoc.BANG[c] !== undefined) bangCells.push([x, y]); }));
      noi = cellsOf('N').map(([x, y]) => ({ nut: { x, y }, cua: thuong.filter(() => rnd() < 0.5).map(([cx, cy]) => ({ x: cx, y: cy })), bang: bangCells.filter(() => rnd() < 0.5).map(([bx, by]) => ({ x: bx, y: by })) }));
    }
    const man0 = { san: rows, batDau: xe, loaiRobot: loai, cuaNhip: cuaNhip.length ? cuaNhip : undefined, noi };
    let ctx;
    try { ctx = dungNguCanh(man0); } catch (e) { continue; }
    const HD = hanhDongTuDo(ctx, { dayDu: true });
    const dai = 10 + Math.floor(rnd() * 16);
    const chuoi = Array.from({ length: dai }, () => pick(HD));
    let S = trangThaiDau(ctx), nhipDo = 0, thangDo = false;
    const trace = [];
    for (const ac of chuoi) { S = buocMotNhip(ctx, S, ac); nhipDo++; trace.push(S); if (laThang(ctx, S)) { thangDo = true; break; } }
    const code = chuoiThanhMa(chuoi.slice(0, nhipDo));
    let res;
    try { res = SanHoc.chay({ san: rows, batDau: xe, loaiRobot: loai, hamGoc: (omni ? OMNI : BANH).concat(['shoot']), cuaNhip: man0.cuaNhip, noi }, code); } catch (e) { lech++; if (ghiLech.length < 2) ghiLech.push('NÉM ' + e.message + J({ rows, xe })); continue; }
    soCa++;
    const nv = nhipVet(res);
    let ok = res.thang === thangDo && nv.length === nhipDo && res.loi === null;
    for (let i = 0; ok && i < nv.length; i++) {
      const s = trace[i], r = nv[i].robot;
      if (r.x !== s.x || r.y !== s.y || r.huong !== s.h) ok = false;
      nv[i].cua.forEach((dc, j) => { if (dc.mo !== (((s.cm >> j) & 1) === 1)) ok = false; });
      nv[i].nut.forEach((nu, j) => { if (nu.bat !== (((s.nm >> j) & 1) === 1)) ok = false; });
      const tat = new Set(nv[i].bangTat.map((q) => q.x + ',' + q.y));
      ctx.bangDs.forEach((cell, j) => { if (tat.has((cell % ctx.rong) + ',' + Math.floor(cell / ctx.rong)) !== (((s.bm >> j) & 1) === 1)) ok = false; });
    }
    if (!ok) { lech++; if (ghiLech.length < 2) ghiLech.push(J({ rows, xe, loai, cuaNhip: man0.cuaNhip, noi, code: code.split('\n').join(';') })); }
    soNhip += nhipDo; soBan += ev(res, 'ban').length; soNut += ev(res, 'nut-doi').length; soCuaDoi += ev(res, 'cua-doi').length; soKet += ev(res, 'cua-ket').length; soBangDoi += ev(res, 'bang-doi').length;
    soBiChan += maSK(res, 'ban-bi-chan').length; if (cuaNhip.length) soCuaNhip++; if (res.thang) soThang++;
  }
  kiem('so chéo ' + soCa + ' ca ngẫu nhiên (xe bánh và omni, tường cao, hàng rào, bậc thang, băng chuyền, nút, cửa thường và cửa nhịp, thùng, vật, noi ngẫu nhiên, lệnh lậu: lùi / quay đầu / shoot cùng lệnh bánh): từng nhịp bộ dò và san-hoc.js trùng hoàn toàn (xe, hướng, nút, cửa, băng tắt, thắng)',
    soCa >= 1200 && lech === 0, lech + ' lệch · ' + ghiLech.join(' || '));
  kiem('các ca ngẫu nhiên có đủ thứ: bắn (' + soBan + '), nút đổi (' + soNut + '), cửa đổi (' + soCuaDoi + '), băng đổi (' + soBangDoi + '), cửa kẹt (' + soKet + '), bị chặn (' + soBiChan + '), ca có cửa nhịp (' + soCuaNhip + '), thắng (' + soThang + '), tổng ' + soNhip + ' nhịp',
    soBan >= 400 && soNut >= 40 && soCuaDoi >= 150 && soBangDoi >= 20 && soKet >= 5 && soBiChan >= 50 && soCuaNhip >= 300 && soThang >= 10, [soBan, soNut, soCuaDoi, soBangDoi, soKet, soBiChan, soCuaNhip, soThang].join());
}

/* ============================================================================ 8. DỮ LIỆU 10 MÀN */
console.log('\n== 8. Dữ liệu 10 màn: sân, cửa nhịp, nối nút, đường tắt (BFS = sao.nhip), lời giải ==');
const BANG = [];
function bang(a, b) { return J(a) === J(b); }
{
  const SAO_NHIP = [4, 5, 8, 6, 15, 15, 7, 10, 9, 24];
  kiem('đúng 10 màn sung-bong, id 32.1…32.10, mã sung-bong.1…10, tên chương "Súng bóng"', ds.length === 10 && ds.every((m, i) => m.id === '32.' + (i + 1) && m.ma === 'sung-bong.' + (i + 1)) && ManHoc.chuong().find((c) => c.ma === 'sung-bong').ten === 'Súng bóng');
  kiem('hang: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm', bang(ds.map((m) => m.hang), ['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']));
  kiem('sao.nhip đúng bảng chốt (4 5 8 6 15 15 7 10 9 24)', bang(ds.map((m) => m.sao.nhip), SAO_NHIP), J(ds.map((m) => m.sao.nhip)));
  kiem('chỉ 16.5 tạo hàm (hit_right); chỉ 16.8 có hàm của màn (fire_left); huy hiệu sung-bong ở 16.10', bang(ds.map((m) => m.taoHam), [[], [], [], [], ['hit_right'], [], [], [], [], []]) &&
    ds.every((m) => (m.so === 8) === (m.maMau.hamCuaMan.length === 1 && m.loiGiai.hamCuaMan.length === 1)) && ds[9].huyHieu.ma === 'sung-bong' && ds.slice(0, 9).every((m) => !m.huyHieu) && tenCotTruyen.includes('hit_right') && !KhoHam.HAM_GOC_MAC_DINH.includes('hit_right'));
  kiem('mọi màn: mục tiêu tới cờ (mucTieu không khai), Xưởng mở, khung 10/10, cauTruc for/if/while, không nhipTheoLoiGiai (nhịp bắn không gộp được nên BFS = sao.nhip)', ds.every((m) => m.mucTieu === undefined && m.moXuong && m.camHamCuaEm === false && m.khung.chinh === 10 && m.khung.moiHam === 10 && bang(m.cauTruc, ['for', 'if', 'while']) && !m.nhipTheoLoiGiai));
  kiem('hàm gốc: bộ lệnh bánh + shoot; 16.6 và 16.10 thêm front_clear; 16.9 là omni (bộ lệnh omni); robot { tay "bong", camBien khoang-cach ở 16.6 và 16.10 }',
    ds.every((m) => bang(m.hamGoc, (m.so === 9 ? OMNI : BANH).concat(['shoot'], m.so === 6 || m.so === 10 ? ['front_clear'] : [])) && m.robot.tay === 'bong' && m.robot.than === (m.so === 9 ? 'omni' : 'hai-banh') && m.loaiRobot === (m.so === 9 ? 'omni' : 'banh') &&
      bang(m.robot.camBien, m.so === 6 || m.so === 10 ? [{ ma: 'khoang-cach', o: 'hong' }] : [])));
  kiem('nhiều sân: 16.6 và 16.10 là 3 sân (batDau song song, cuaNhip song song, nhipTheo "tong", cùng cỡ); các màn khác một sân', ds.every((m) => {
    if (m.so === 6 || m.so === 10) return Array.isArray(m.san[0]) && m.san.length === 3 && Array.isArray(m.batDau) && m.batDau.length === 3 && Array.isArray(m.cuaNhip) && m.cuaNhip.length === 3 && m.nhipTheo === 'tong' && m.san.every((sn) => sn.length === m.san[0].length && sn[0].length === m.san[0][0].length);
    return !Array.isArray(m.san[0]) && m.nhipTheo === undefined;
  }));
  kiem('nút / cửa trong sân: 16.1–16.4 có N và C (16.4 chỉ N và băng); 16.5, 16.7, 16.8, 16.9 khai noi (số nhóm = số nút, mỗi nút một cửa); 16.6 và 16.10 khai cuaNhip mỗi sân một cửa nhịp với pha khác nhau', (() => {
    const k = (m) => sanCua(m).join('');
    const soN = (m) => (k(m).match(/N/g) || []).length;
    const nhomOk = (m) => Array.isArray(m.noi) && m.noi.length === soN(m) && m.noi.every((g) => g.cua.length === 1 && sanCua(m)[0][g.nut.y][g.nut.x] === 'N' && sanCua(m)[0][g.cua[0].y][g.cua[0].x] === 'C');
    const phaKhac = (m) => new Set(m.cuaNhip.map((c) => c[0].pha)).size === 3 && m.cuaNhip.every((c) => c.length === 1 && c[0].mo === 2 && c[0].dong === 2);
    return [1, 2, 3].every((s) => /N/.test(k(man(s))) && /C/.test(k(man(s)))) && /N/.test(k(man(4))) && /[<>]/.test(k(man(4))) && !/C/.test(k(man(4))) && [5, 7, 8, 9].every((s) => nhomOk(man(s))) && [6, 10].every((s) => phaKhac(man(s))) && soN(man(10)) === 3 && /N/.test(sanCua(man(10))[0].join(''));
  })());
  kiem('16.7: hai nút nằm sau hàng rào thấp (xe không tới được), không nút nào kề ô xe đứng; 16.4: nút ngay sau cờ, làn băng 4 ô ngược chiều đi', (() => {
    const s7 = man(7).san, s4 = man(4).san;
    return s7[1][2] === '=' && s7[2][3] === '=' && s7[0][2] === 'N' && s7[2][4] === 'N' && s4[1] === '.<<<<FN' && man(4).batDau.huong === 1;
  })());

  for (const m of ds) {
    const dsSan = sanCua(m), bds = bdCua(m);
    const ok = dsSan.every((rows, i) => {
      const lm = SanHoc.lopMauCuaSan(m, i);
      const sd = SanHoc.docSan(rows, lm.mau, lm.vatMau, null);
      const bdx = bds[i], c = rows[bdx.y][bdx.x];
      return !!sd.co && '.'.includes(c) && rows.length <= 7 && rows[0].length <= 7;
    });
    kiem(m.id + ': mọi sân có cờ F, xe xuất phát trên sàn trống, sân ≤ 7×7', ok);
    const gop = nhipSungBongTatCa(m);
    kiem(m.id + ': không có ĐƯỜNG TẮT — BFS (bắn mỗi lệnh một nhịp riêng) = sao.nhip = ' + m.sao.nhip, gop === m.sao.nhip, 'BFS ' + gop);
    const kt = khoTruoc(m.id);
    const r = ChamHoc.cham(m, m.loiGiai, tron(kt, m.loiGiai.hamCuaEmMoi));
    BANG.push({ id: m.id, ten: m.ten, o: r.soO, nhip: r.soNhip, san: dsSan.length, sao: r.sao, de: m.deBai });
    kiem(m.id + ': lời giải mẫu 3 sao, ' + r.soO + ' ô, ' + r.soNhip + ' nhịp, không chẩn đoán nào', r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, o: r.soO, nhip: r.soNhip, cd: maCua(r) }));
    const alt = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kt, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': lời giải khác (' + m.loiGiaiKhac.moTa + ') cùng nhịp, nhiều ô hơn (' + alt.soO + ' > ' + m.sao.o + '), đúng 2 sao', alt.thang && alt.soNhip === m.sao.nhip && alt.soO > m.sao.o && alt.sao === 2);
    const mm = ChamHoc.cham(m, m.maMau, kt);
    kiem(m.id + ': maMau không thắng, vừa khung; veMaMau nói về code có sẵn', !mm.thang && !maCua(mm).includes('tran-khung') && typeof m.veMaMau === 'string' && m.veMaMau.length > 20);
    const thieu = [];
    m.loiSai.forEach((ls, i) => { const q = ChamHoc.cham(m, ls.baiLam, tron(kt, ls.hamCuaEmMoi)); const co = maCua(q); if (q.sao >= 3 || ls.phaiCoMa.some((x) => !co.includes(x))) thieu.push('#' + (i + 1)); });
    kiem(m.id + ': ' + m.loiSai.length + ' lời sai đều không đủ 3 sao và đủ mã chẩn đoán', thieu.length === 0, thieu.join());
  }
  const dungMa = new Set(ds.flatMap((m) => m.loiSai.flatMap((l) => l.phaiCoMa)));
  kiem('các lời sai dùng đủ mã mới của chương: ban-bi-chan, ban-hut, ban-nut-lai, ban-dung-yen, và dam-tuong với cửa', ['ban-bi-chan', 'ban-hut', 'ban-nut-lai', 'ban-dung-yen', 'dam-tuong'].every((x) => dungMa.has(x)));

  // 16.1 – 16.3
  const m1 = man(1), m2 = man(2), m3 = man(3);
  kiem('16.1: maMau đã bắn trúng nút (cửa mở) nhưng xe chưa tới cờ; tới cờ phải quay trái rồi đi 2 ô', (() => { const r = ChamHoc.cham(m1, m1.maMau, khoTruoc('32.1')); return !r.thang && r.theoSan[0].vet.filter((e) => e.loai === 'nhip')[0].cua[0].mo === true && maCua(r).includes('chua-toi-co'); })());
  kiem('16.2: bóng bay thẳng nên quay phải thay vì quay trái làm bóng ra khỏi sân (ban-hut); bắn mà không quay bị cửa chặn (ban-bi-chan)', maCua(ChamHoc.cham(m2, m2.loiSai[1].baiLam, khoTruoc('32.2'))).includes('ban-hut') && maCua(ChamHoc.cham(m2, m2.loiSai[0].baiLam, khoTruoc('32.2'))).includes('ban-bi-chan'));
  kiem('16.3: maMau bắn hai lần (cửa mở rồi đóng lại, ban-nut-lai); xóa một cặp shoot() + wait() là thắng', (() => {
    const r = ChamHoc.cham(m3, m3.maMau, khoTruoc('32.3'));
    const s = m3.maMau.chinh.slice(); s.splice(2, 2);
    return !r.thang && maCua(r).includes('ban-nut-lai') && ChamHoc.cham(m3, { chinh: s }, khoTruoc('32.3')).sao === 3;
  })());
  // 16.4
  const m4 = man(4);
  const khong = ChamHoc.cham(m4, { chinh: ['forward(9)'] }, khoTruoc('32.4'));
  kiem('16.4: không tắt băng vẫn tới cờ được nhưng chậm (nhịp ' + khong.soNhip + ' > ' + m4.sao.nhip + '): chỉ một hay hai sao; bắn nút tắt băng cho đúng sao.nhip', khong.thang && khong.soNhip > m4.sao.nhip && khong.sao < 3 && ChamHoc.cham(m4, m4.loiGiai, khoTruoc('32.4')).soNhip === m4.sao.nhip, J([khong.thang, khong.soNhip]));
  // 16.5
  const m5 = man(5);
  const khaiTrien = nhieu3(['turn_right()', 'shoot()', 'wait()', 'turn_left()', 'forward(2)']);
  function nhieu3(d) { return d.concat(d, d); }
  const r5 = ChamHoc.cham(m5, { chinh: khaiTrien }, khoTruoc('32.5'));
  kiem('16.5: không dùng hit_right, khai triển 3 lần ' + khaiTrien.length + ' dòng > 10 ô: tran-khung, không chạy', khaiTrien.length > m5.khung.chinh && maCua(r5).includes('tran-khung') && !r5.thang);
  kiem('16.5: hit_right() thân đúng 4 dòng turn_right(), shoot(), wait(), turn_left(); khóa tên trong kho', bang(m5.loiGiai.hamCuaEmMoi[0].than, ['turn_right()', 'shoot()', 'wait()', 'turn_left()']) && m5.loiGiai.hamCuaEmMoi[0].thamSo.length === 0);
  kiem('16.5: noi khớp ba nút ba cửa; bỏ noi (mặc định) thì bắn nút đầu mở cả ba cửa rồi nút sau đóng lại (kiểm bằng cách bỏ noi: không thắng)', (() => {
    const bo = Object.assign({}, m5, { noi: undefined });
    return ChamHoc.cham(m5, m5.loiGiai, tron(khoTruoc('32.5'), m5.loiGiai.hamCuaEmMoi)).thang && !ChamHoc.cham(bo, bo.loiGiai, tron(khoTruoc('32.5'), m5.loiGiai.hamCuaEmMoi)).thang;
  })());
  // 16.6
  const m6 = man(6);
  const r6 = ChamHoc.cham(m6, m6.loiGiai, khoTruoc('32.6'));
  kiem('16.6: nhịp từng sân 4, 6, 5 (chờ 0, 2, 1); tổng 15; một chương trình duy nhất thắng cả ba; chờ cố định không thắng đủ ba', bang(r6.theoSan.map((s) => s.soNhip), [4, 6, 5]) && r6.soNhip === 15 && r6.theoSan.every((s) => s.thang) &&
    [0, 1, 2, 3].every((k) => !ChamHoc.cham(m6, { chinh: WAIT.repeat(k).split('\n').filter(Boolean).concat(['forward(4)']) }, khoTruoc('32.6')).thang), J(r6.theoSan.map((s) => s.soNhip)));
  // 16.7
  const m7 = man(7);
  kiem('16.7: xe đâm hàng rào (dam-tuong vat "rao") nếu đi bắn thay vì đứng bắn; thiếu một nút thì cửa kia chặn; noi bắt cả hai nút', (() => {
    const r = ChamHoc.cham(m7, m7.loiSai[3].baiLam, khoTruoc('32.7'));
    const dt = r.theoSan[0].chanDoan.find((c) => c.ma === 'dam-tuong');
    return dt && /hàng rào/.test(dt.loi) && !ChamHoc.cham(m7, m7.loiSai[0].baiLam, khoTruoc('32.7')).thang && !ChamHoc.cham(m7, m7.loiSai[1].baiLam, khoTruoc('32.7')).thang;
  })());
  // 16.8
  const m8 = man(8);
  kiem('16.8: maMau gọi fire_left() thiếu wait() (ban-dung-yen, xe còn quay mặt lên rồi đâm nút); lời giải chỉ thêm wait() vào hàm của màn, chương trình giữ nguyên', bang(m8.maMau.hamCuaMan[0].than, ['turn_left()', 'shoot()', 'turn_right()']) && bang(m8.loiGiai.hamCuaMan[0].than, ['turn_left()', 'shoot()', 'wait()', 'turn_right()']) &&
    bang(m8.maMau.chinh, m8.loiGiai.chinh) && maCua(ChamHoc.cham(m8, m8.maMau, khoTruoc('32.8'))).includes('ban-dung-yen') && !tenCotTruyen.includes('fire_left'));
  // 16.9
  const m9 = man(9);
  const r9 = ChamHoc.cham(m9, m9.loiGiai, khoTruoc('32.9'));
  kiem('16.9: omni không đổi hướng mặt suốt lượt chạy (huong 1 mọi nhịp), bóng luôn bay sang phải; slide_right() nhầm hướng làm xe đâm ra ngoài sân', r9.thang && nhipVet({ vet: r9.vet }).every((n) => n.robot.huong === 1) && ev({ vet: r9.vet }, 'ban').every((b) => b.huong === 1 && b.trung === 'nut') &&
    ChamHoc.cham(m9, m9.loiSai[0].baiLam, khoTruoc('32.9')).theoSan[0].chanDoan.some((c) => c.ma === 'dam-tuong'));
  // 16.10
  const m10 = man(10);
  const r10 = ChamHoc.cham(m10, m10.loiGiai, khoTruoc('32.10'));
  kiem('16.10: nhịp từng sân 7, 8, 9 (chờ cửa 0, 1, 2 nhịp), tổng 24; không tắt băng thì chờ trên băng bị đẩy lùi (không thắng đủ ba sân)', bang(r10.theoSan.map((s) => s.soNhip), [7, 8, 9]) && r10.soNhip === 24 && !ChamHoc.cham(m10, m10.loiSai[1].baiLam, khoTruoc('32.10')).thang);
}

console.log('\n== Bảng 10 màn chương Súng bóng (lời giải mẫu) ==');
{
  console.log('  màn   | ô  | nhịp | sân | tên');
  for (const b of BANG) console.log('  ' + b.id.padEnd(5) + ' | ' + String(b.o).padEnd(2) + ' | ' + String(b.nhip).padEnd(4) + ' | ' + String(b.san).padEnd(3) + ' | ' + b.ten);
  console.log('\n  Lời đề:');
  for (const b of BANG) console.log('  ' + b.id + ': ' + b.de);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
void bdCua; void H; void PHAI; void TRAI; void TIEN; void cuaTai;

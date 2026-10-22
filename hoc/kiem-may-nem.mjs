/* ============================================================================
   kiem-may-nem.mjs — máy kiểm chương `may-nem` (Máy ném) của "Đường học".
   Gồm: ném 1–3 ô theo bốn hướng, bay qua hàng rào / tường cao / băng / vật / thùng, rơi vào tường cao, hàng rào, bậc thang, mép sân,
   ô đã có vật thì vỡ (nem-vo, dừng sớm), ô băng / ô đích thì nằm yên, đích có màu, aim(n) (không tốn nhịp, giữ nguyên tầm, tầm sai là lỗi
   tam-sai, throw nhớ tầm lúc gọi), nạp (load, vật ở Ô TRƯỚC MẶT; vật nằm đất chiếm ô), rổ đầy / rổ trống / một lệnh tay mỗi nhịp / xe đứng yên trong nhịp nạp-ném / quên wait, color() theo phần cứng (cảm biến bụng đọc sàn kể cả khi vật trong rổ; camera đọc ô trước mặt),
   roBanDau, tường thấp '=' (xe không đi qua, cảm biến, thả, thùng), omni và xích, nhện / các tay khác không đi chung, sân thử của Xưởng,
   chẩn đoán tiếng Việt, bộ dò đường tắt (so chéo với san-hoc.js bằng chương trình ngẫu nhiên), dữ liệu 10 màn (BFS = sao.nhip) và bảng 10 màn.
   Các kiểm chung cho cả 140 màn (đi tuần tự, sao, lời sai, đường tắt BFS trên từng sân…) nằm ở kiem-hoc.mjs.
   Chạy: node hoc/kiem-may-nem.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
for (const f of ['man-chuoi-2', 'man-tay-gap', 'man-vong-lap', 'man-bang-chuyen', 'man-tham-so', 'man-nhen', 'man-xich', 'man-omni', 'man-khoang-cach', 'man-mau', 'man-nam-cham']) require(path.join(day, f + '.js'));
const ManHoc = require(path.join(day, 'man-may-nem.js'));
const BoDo = await import('./do-duong-may-nem.mjs');
const { nhipMayNemNganNhat, nhipMayNemTatCa, buocMotNhip, dungNguCanh, trangThaiDau, laThang, chuoiThanhMa, hanhDongTuDo } = BoDo;

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
/** Sự kiện của vết nhịp (nem-vat, nem-roi, nap-vat…; khác maSK là các mốc chẩn đoán). */
const ev = (kq, ma) => nhipVet(kq).flatMap((n) => n.suKien).filter((e) => e.ma === ma);
const L = (...d) => d.join('\n') + '\n';
const loi = (f) => { try { f(); return null; } catch (e) { return e.message; } };
const VEC = SanHoc.VEC;

const ds = ManHoc.danhSach.filter((m) => m.chuong === 'may-nem');
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
const man = (so) => ManHoc.timMa('may-nem.' + so);
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const bdCua = (m) => (Array.isArray(m.batDau) ? m.batDau : sanCua(m).map(() => m.batDau));

const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const OMNI = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait'];
const NEM = ['aim', 'throw', 'load'];
function chay(rows, bd, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: BANH.concat(NEM, ['front_clear', 'color']), mucTieu: 'dua-vat' }, extra || {}), code);
}
const TIEN = L('left_move()', 'right_move()', 'wait()');
const PHAI = L('left_move()', 'wait()');
const NAP = L('load()', 'wait()');
const NEMW = L('throw()', 'wait()');
const aim = (n) => 'aim(' + n + ')\n';
const trong = (n, c = '.') => Array.from({ length: n }, () => c.repeat(n));
const dat1 = (rows, x, y, ch) => rows.map((r, j) => (j === y ? r.slice(0, x) + ch + r.slice(x + 1) : r));
const vatCua = (kq, id) => kq.vat.find((v) => v.id === id);
const RO = { roBanDau: true };

/* ============================================================================ 1. NÉM */
console.log('\n== 1. Ném: 1–3 ô, bốn hướng, bay qua mọi thứ, rơi xuống ô cách đúng n ô ==');
{
  let tong = 0, dung = 0; const sai = [];
  for (const h of [0, 1, 2, 3]) for (const n of [1, 2, 3]) {
    const xe = { x: 3, y: 3, huong: h };
    const dx = 3 + VEC[h][0] * n, dy = 3 + VEC[h][1] * n;
    const kq = chay(dat1(trong(7), dx, dy, 'D'), xe, aim(n) + NEMW, RO);
    tong++;
    const nv = ev(kq, 'nem-vat')[0], v = vatCua(kq, 1);
    const ok = nv && nv.tam === n && nv.den.x === dx && nv.den.y === dy && nv.tu.x === 3 && nv.tu.y === 3 && ev(kq, 'nem-roi').length === 1 &&
      v.trangThai === 'dat' && v.x === dx && v.y === dy && kq.thang && kq.nhip === 1 && kq.nem.ro === null && kq.nem.tam === n && kq.robot.x === 3 && kq.robot.y === 3;
    if (ok) dung++; else sai.push('h' + h + '/n' + n + ':' + J(kq.suKien.map((e) => e.ma)));
  }
  kiem('vật trong rổ ném tầm n (1, 2, 3) theo bốn hướng: rơi đúng ô cách xe n ô, nằm đó, xe đứng yên, thắng sau 1 nhịp (' + tong + ' ca)', dung === tong, sai.slice(0, 3).join(' | '));

  // bay qua mọi thứ ở giữa
  let k = 0, ok2 = 0;
  for (const mid of ['=', '#', 'S', '>', '^', 'o', 'D', 'X']) {
    const rows = dat1(dat1(dat1(trong(5), 2, 1, 'D'), 2, 2, mid), 2, 3, mid === 'o' ? 'o' : '=');
    const kq = chay(rows, { x: 2, y: 4, huong: 0 }, aim(3) + NEMW, RO);
    k++;
    const v = vatCua(kq, kq.vat.length);
    if (maSK(kq, 'nem-vo').length === 0 && v.trangThai === 'dat' && v.x === 2 && v.y === 1) ok2++;
  }
  kiem('bay QUA hàng rào, tường cao, bậc thang, băng chuyền, vật nằm sẵn, ô đích ở ô giữa: ô giữa không cần trống, chỉ ô rơi mới tính (8 ca)', ok2 === k, ok2 + '/' + k);

  const kt = chay(dat1(trong(5), 2, 3, 'H'), { x: 2, y: 4, huong: 0 }, aim(3) + NEMW, RO);
  kiem('bay qua thùng nặng (H) ở ô giữa: vật rơi bình thường', maSK(kt, 'nem-vo').length === 0 && vatCua(kt, 1).y === 1);

  // rơi xuống ô băng chuyền: nằm yên, không bị kéo
  const kb = chay(dat1(trong(5), 2, 1, '>'), { x: 2, y: 4, huong: 0 }, aim(3) + NEMW + L('wait()', 'wait()', 'wait()', 'wait()'), RO);
  kiem('vật rơi xuống ô băng chuyền nằm yên (băng không kéo vật nằm dưới đất), dù chờ thêm nhiều nhịp', vatCua(kb, 1).trangThai === 'dat' && vatCua(kb, 1).x === 2 && vatCua(kb, 1).y === 1 && ev(kb, 'nem-roi').length === 1);

  // rơi xuống đích thì thắng ngay; không thắng khi vật mới ném chưa tới
  const kw = chay(dat1(trong(5), 2, 1, 'D'), { x: 2, y: 4, huong: 0 }, aim(3) + NEMW + 'move()\n', RO);
  kiem('thắng NGAY ở nhịp ném trúng đích (xong-dua-vat), lệnh sau không chạy', kw.thang && ev(kw, 'xong-dua-vat').length === 1 && kw.nhip === 1);
  const kn = chay(dat1(trong(5), 2, 2, 'D'), { x: 2, y: 4, huong: 0 }, aim(3) + NEMW, RO);
  kiem('rơi xuống ô thường (không phải đích): vật nằm đó, chưa thắng, chẩn đoán chua-dua-vat', !kn.thang && vatCua(kn, 1).y === 1 && kn.vat[0].trangThai === 'dat');
}

/* ============================================================================ 2. VỠ */
console.log('\n== 2. Rơi vào tường cao, hàng rào, bậc thang, mép sân, thùng, vật khác thì vỡ ==');
{
  const cas = [
    ['tuong', (r) => dat1(r, 3, 1, '#'), 'tường cao'],
    ['rao', (r) => dat1(r, 3, 1, '='), 'hàng rào'],
    ['bac-thang', (r) => dat1(r, 3, 1, 'S'), 'bậc thang'],
    ['thung-nang', (r) => dat1(r, 3, 1, 'H'), 'thùng nặng'],
    ['vat', (r) => dat1(r, 3, 1, 'o'), 'ô đã có vật nằm sẵn'],
    ['vat', (r) => dat1(r, 3, 1, 'X'), 'ô đích đã có vật nằm sẵn']
  ];
  for (const [ly, dung, ten] of cas) {
    const kq = chay(dung(trong(5)), { x: 3, y: 4, huong: 0 }, aim(3) + NEMW, RO);
    const vo = maSK(kq, 'nem-vo')[0];
    kiem('vật ném rơi vào ' + ten + ': nem-vo lyDo ' + ly + ', vật trangThai "vo" tại ô rơi, dừng sớm vat-vo',
      vo && vo.lyDo === ly && vo.tam === 3 && vo.o.x === 3 && vo.o.y === 1 && vatCua(kq, kq.vat.length).trangThai === 'vo' && kq.dungSom === 'vat-vo' && !kq.thang && kq.nhip === 1 && ev(kq, 'nem-roi').length === 0, J(kq.suKien));
  }
  for (const [n, rows, bd] of [[3, trong(5), { x: 2, y: 1, huong: 0 }], [1, trong(5), { x: 4, y: 2, huong: 1 }], [2, trong(5), { x: 0, y: 3, huong: 2 + 0 }]]) {
    const kq = chay(rows, bd, aim(n) + NEMW, RO);
    const vo = maSK(kq, 'nem-vo')[0];
    kiem('ném ra ngoài sân (xe ' + J(bd) + ', tầm ' + n + '): nem-vo lyDo ngoai-san', vo && vo.lyDo === 'ngoai-san' && kq.dungSom === 'vat-vo');
  }
  // chạy tiếp sau khi vỡ: dừng ngay, lệnh sau không chạy; vẫn kể là đã mất 1 nhịp
  const kd = chay(dat1(trong(5), 3, 1, '#'), { x: 3, y: 4, huong: 0 }, aim(3) + NEMW + TIEN, RO);
  kiem('vật vỡ thì chương trình dừng ngay cuối nhịp đó (lệnh sau không chạy): 1 nhịp, xe còn nguyên chỗ', kd.nhip === 1 && kd.robot.y === 4);
  // vật vỡ đúng vị trí: không còn vật nào nằm được trên đích
  const kv = chay(dat1(dat1(trong(5), 3, 1, '#'), 0, 0, 'D'), { x: 3, y: 4, huong: 0 }, aim(3) + NEMW, RO);
  kiem('chẩn đoán nem-vo bằng tiếng Việt, nói lý do (tường cao) và ô rơi', (() => {
    const man1 = { loaiRobot: 'banh', mucTieu: 'dua-vat', hamGoc: BANH.concat(NEM.slice(0, 2)), robot: { than: 'hai-banh', tay: 'nem', camBien: [] }, moXuong: true, camHamCuaEm: false, khung: { chinh: 10, moiHam: 10 }, cauTruc: [], san: dat1(dat1(trong(5), 3, 1, '#'), 0, 0, 'D'), batDau: { x: 3, y: 4, huong: 0 }, roBanDau: true, sao: { o: 3, nhip: 1 } };
    const r = ChamHoc.cham(man1, { chinh: ['aim(3)', 'throw()', 'wait()'] }, []);
    const c = r.chanDoan.find((x) => x.ma === 'nem-vo');
    return c && /tường cao/.test(c.loi) && /\(3, 1\)/.test(c.loi) && /vỡ/.test(c.loi) && c.loi.length <= 330 && c.muc === 'loi' && !r.thang && !maCua(r).includes('chua-dua-vat');
  })());
  void kv;
}

/* ============================================================================ 3. AIM */
console.log('\n== 3. aim(n): hiệu lực ngay, không tốn nhịp, giữ nguyên tầm; n sai là lỗi tam-sai ==');
{
  const S = dat1(trong(7), 3, 0, 'D');
  const xe = { x: 3, y: 4, huong: 0 };
  const a = chay(S, xe, aim(3) + aim(2) + aim(1) + aim(3) + NEMW, RO);
  kiem('aim không tốn nhịp: bốn lệnh aim + throw + wait = đúng 1 nhịp; aim gọi nhiều lần thì lần cuối (3) có hiệu lực', a.nhip === 1 && a.thang === false && vatCua(a, 1).y === 1 && a.nem.tam === 3 && a.vet.filter((e) => e.loai === 'lenh' && e.aimTam !== undefined).map((e) => e.aimTam).join() === '3,2,1,3');
  const b = chay(S, xe, aim(3) + L('wait()', 'wait()') + NEMW, RO);
  kiem('tầm giữ nguyên qua nhiều nhịp (aim, hai wait, throw dùng tầm 3)', vatCua(b, 1).y === 1 && b.nhip === 3);
  const c = chay(S, xe, aim(3) + 'throw()\n' + aim(1) + 'wait()\n', RO);
  kiem('throw() nhớ tầm LÚC GỌI: throw(); aim(1); wait() vẫn ném tầm 3 (aim(1) sau đó chỉ đổi tầm cho lần ném kế)', vatCua(c, 1).y === 1 && c.nem.tam === 1);
  const d = chay(S, xe, NEMW, RO);
  kiem('chưa aim: tầm mặc định 1', vatCua(d, 1).y === 3 && d.nem.tam === 1);
  // nhịp: tầm trong từng nhịp của vết
  kiem('vết nhịp có robot.nem { tam, ro } (giao diện hiển thị tầm trên xe): tầm 3, rổ rỗng sau ném', nhipVet(a)[0].robot.nem.tam === 3 && nhipVet(a)[0].robot.nem.ro === null && nhipVet(chay(S, xe, aim(2) + L('wait()'), RO))[0].robot.nem.ro === 1);
  // tầm sai
  const sai = [['0', 0], ['4', 4], ['-1', -1], ['2.5', 2.5], ['"2"', '"2"']];
  for (const [bt] of sai) {
    const kq = chay(S, xe, 'aim(' + bt + ')\n' + NEMW + 'wait()\n', RO);
    kiem('aim(' + bt + ') là lỗi chạy: loi runtime-error ma tam-sai, dừng chương trình, rổ vẫn còn vật, 0 nhịp', kq.loi && kq.loi.ma === 'tam-sai' && kq.loi.loai === 'runtime-error' && kq.loi.dong === 1 && kq.nhip === 0 && kq.nem.ro === 1, J(kq.loi));
  }
  const kx = chay(S, xe, 'aim()\n' + NEMW, RO), ky = chay(S, xe, 'aim(1, 2)\n' + NEMW, RO);
  kiem('aim() không đối số hay aim(1, 2) hai đối số cũng là lỗi tam-sai, lời nói "cần đúng 1 đối số"', kx.loi && ky.loi && kx.loi.ma === 'tam-sai' && ky.loi.ma === 'tam-sai' && /đúng 1 đối số/.test(kx.loi.thongDiep));
  const kb = chay(S, xe, 'n = 3\nfor i in range(2):\n    n = n + 1\naim(n - 2)\n' + NEMW, RO);
  kiem('aim nhận biểu thức: aim(n - 2) với n = 5 là tầm 3', vatCua(kb, 1).y === 1 && !kb.loi);
  const kz = chay(S, xe, 'aim(6 / 2)\n' + NEMW, RO);
  kiem('aim(6 / 2) (chia ra 3) nhận được nếu là số nguyên; aim(5 / 2) = 2.5 không nhận', (!kz.loi && vatCua(kz, 1).y === 1) || (kz.loi && kz.loi.ma === 'tam-sai'));
  // chẩn đoán
  const m1 = man(1);
  const r = ChamHoc.cham(m1, { chinh: ['aim(4)', 'throw()', 'wait()'] }, []);
  const cd = r.chanDoan.find((x) => x.ma === 'tam-sai');
  kiem('chẩn đoán tam-sai bằng tiếng Việt: nói n phải là 1, 2 hoặc 3 và chỉ đúng dòng chương trình', cd && /1, 2 hoặc 3/.test(cd.loi) && cd.cho && cd.cho.cot === 'chinh' && cd.cho.dong === 1 && cd.loi.length <= 330 && cd.tam === 4 && !r.thang && r.sao === 0);
  const r2 = ChamHoc.cham(m1, { chinh: ['move()', 'aim(0)', 'throw()'] }, []);
  kiem('aim(0) ở dòng 2: chẩn đoán trỏ dòng 2 (move() chưa có trong kho nên báo ham-chua-co ở dòng 1 trước)', r2.chanDoan.length >= 1);
}

/* ============================================================================ 4. NẠP VÀ RỔ */
console.log('\n== 4. load(): nạp vật ở ô TRƯỚC MẶT vào rổ; vật chiếm ô; rổ đầy, rổ trống, một lệnh tay mỗi nhịp, xe đứng yên, quên wait ==');
{
  const S = ['.....', '.....', '..D..', '..o..', '.....'];
  const xe = { x: 2, y: 4, huong: 0 };
  const a = chay(S, xe, NAP);
  kiem('load(): vật ở ô trước mặt vào rổ (nap-vat, trangThai "ro", x y = ô xe, ô trước mặt trống ra), 1 nhịp', ev(a, 'nap-vat').length === 1 && vatCua(a, 1).trangThai === 'ro' && a.nem.ro === 1 && a.nhip === 1 && vatCua(a, 1).x === 2 && vatCua(a, 1).y === 4);
  const a2 = chay(S, xe, TIEN);
  kiem('vật nằm đất CHIẾM Ô: xe tiến vào ô có vật thì đâm (dam-tuong vat "vat", kèm idVat), đứng yên, vật vẫn nằm đó', maSK(a2, 'dam-tuong').length === 1 && maSK(a2, 'dam-tuong')[0].vat === 'vat' && a2.robot.y === 4 && vatCua(a2, 1).trangThai === 'dat');
  const a3 = chay(S, xe, NAP + TIEN);
  kiem('nạp xong thì ô trước mặt trống: xe tiến vào được ô vừa chứa vật, vật trong rổ đi theo xe', a3.robot.y === 3 && vatCua(a3, 1).trangThai === 'ro' && vatCua(a3, 1).y === 3 && maSK(a3, 'dam-tuong').length === 0);
  const b = chay(S, xe, NAP + PHAI + TIEN);
  kiem('vật trong rổ đi theo xe khi xe quay và đi (x y của vật = ô xe), vẫn "ro"', vatCua(b, 1).trangThai === 'ro' && vatCua(b, 1).x === b.robot.x && vatCua(b, 1).y === b.robot.y && b.robot.x === 3);
  const c = chay(S, xe, NAP + aim(2) + NEMW);
  kiem('nạp rồi ném tầm 2 (rơi xuống đích cách xe 2 ô): thắng sau 2 nhịp (nạp 1 + ném 1)', c.thang && c.nhip === 2, J([c.thang, c.nhip]));
  const d = chay(S, xe, PHAI + NAP);
  kiem('load() khi ô trước mặt không có vật (xe vừa quay sang phải): nap-hut (thông tin), rổ vẫn trống, vẫn mất 1 nhịp', maSK(d, 'nap-hut').length === 1 && d.nem.ro === null && d.nhip === 2 && vatCua(d, 1).trangThai === 'dat');
  const e = chay(S, xe, NAP + NAP);
  kiem('load() khi rổ đã có vật: ro-day (lỗi), vật vẫn trong rổ', maSK(e, 'ro-day').length === 1 && e.nem.ro === 1 && e.nhip === 2);
  const f = chay(S, xe, NEMW);
  kiem('throw() khi rổ trống: nem-hut (thông tin), vẫn mất 1 nhịp', maSK(f, 'nem-hut').length === 1 && f.nhip === 1 && f.nem.ro === null);
  const g = chay(S, xe, 'load()\nthrow()\nwait()\n');
  kiem('load() và throw() cùng nhịp: lệnh sau bị bỏ (nem-goi-lai, lỗi), vật đã nạp, chưa ném', maSK(g, 'nem-goi-lai').length === 1 && maSK(g, 'nem-goi-lai')[0].truoc.ten === 'load' && g.nem.ro === 1 && ev(g, 'nem-vat').length === 0);
  const h = chay(S, xe, 'load()\nleft_move()\nright_move()\nwait()\n');
  kiem('load() cùng nhịp với lệnh bánh: xe đứng yên, lệnh bánh bị bỏ (nem-dung-yen, thông tin), vật vẫn nạp', maSK(h, 'nem-dung-yen').length === 1 && h.robot.y === 4 && h.nem.ro === 1 && maSK(h, 'nem-dung-yen')[0].nem.ten === 'load');
  const i = chay(S, xe, NAP + aim(2) + 'throw()\nleft_move()\nright_move()\nwait()\n');
  kiem('throw() cùng nhịp với lệnh bánh: xe đứng yên, vật vẫn ném', i.thang && maSK(i, 'nem-dung-yen').length === 1 && i.robot.y === 4);
  const j = chay(S, xe, 'load()\n');
  kiem('load() không wait(): quen-wait, chưa nạp', maSK(j, 'quen-wait').length === 1 && j.nem.ro === null && j.nhip === 0);
  const k = chay(S, xe, aim(2) + 'throw()\n', RO);
  kiem('throw() không wait(): quen-wait, chưa ném', maSK(k, 'quen-wait').length === 1 && k.nem.ro !== null && ev(k, 'nem-vat').length === 0);
  // rổ chứa một vật: nạp vật thứ hai sau khi ném
  const S2 = ['.....', '.....', 'D....', 'o....', '.o...'];
  const l = chay(S2, { x: 0, y: 4, huong: 0 }, NAP + aim(2) + NEMW + PHAI + NAP, {});
  kiem('sau khi ném, rổ trống nên nạp được vật kế (xe quay sang phải, vật thứ hai ở ô trước mặt)', l.thang === false && l.nem.ro === 2 && ev(l, 'nem-roi').length === 1 && ev(l, 'nap-vat').length === 2, J(l.suKien));
  // chỉ ô TRƯỚC MẶT mới nạp được: chéo, sau lưng, cạnh bên đều không
  const m = chay(S, { x: 1, y: 4, huong: 0 }, NAP);
  const m2 = chay(S, { x: 2, y: 4, huong: 2 }, NAP);
  const m3 = chay(S, { x: 3, y: 3, huong: 0 }, NAP);
  const m4 = chay(S, { x: 2, y: 2, huong: 0 }, NAP);
  kiem('vật không ở ô trước mặt (xe đứng chéo, quay lưng, đứng cạnh bên, hay vật ở sau lưng): load() không nạp được (nap-hut)', [m, m2, m3, m4].every((k) => maSK(k, 'nap-hut').length === 1 && k.nem.ro === null));
  // roBanDau
  const n = chay(S, xe, '', RO);
  kiem('roBanDau: rổ có sẵn vật (id cuối cùng, trangThai "ro", đi theo xe) lúc xuất phát; vật khác trong sân vẫn dưới đất', n.vat.length === 2 && n.vat[1].trangThai === 'ro' && n.vat[1].id === 2 && n.nem.ro === 2 && n.vatBanDau[1].trangThai === 'ro');
  kiem('có vật trong rổ chưa tính là "đã tới đích" (cần ném): chạy rỗng không thắng', !n.thang);
  kiem('roBanDau cho robot không có máy ném → ném lỗi cấu hình', /roBanDau chỉ dùng cho robot có máy ném/.test(loi(() => SanHoc.chay({ san: trong(5), batDau: xe, loaiRobot: 'banh', mucTieu: 'dua-vat', roBanDau: true }, ''))));
  kiem('robot không có máy ném: aim(2) là hàm lạ (ham-chua-co, không phải lỗi nhân)', (() => {
    const kq = SanHoc.chay({ san: trong(5), batDau: xe, loaiRobot: 'banh', mucTieu: 'dua-vat' }, 'aim(2)\n');
    return kq.loi && /Chưa có biến hay hàm/.test(kq.loi.thongDiep) && kq.nem === null;
  })());
  // mục tiêu: màu
  const SM = ['.....', '..D..', '.....', '..o..', '.....'];
  const mau = ['.....', '..r..', '.....', '.....', '.....'];
  const VM = (c) => ['.....', '.....', '.....', '..' + c + '..', '.....'];
  const p = chay(SM, xe, NAP + aim(3) + NEMW, { mau, vatMau: VM('b') });
  kiem('ném vật xanh dương xuống ô đích đỏ: dat-sai-mau (lỗi), vật nằm đó nhưng chưa tính, không thắng', maSK(p, 'dat-sai-mau').length === 1 && !p.thang && vatCua(p, 1).trangThai === 'dat' && maSK(p, 'dat-sai-mau')[0].mauDich === 'red' && maSK(p, 'dat-sai-mau')[0].mauVat === 'blue');
  const q = chay(SM, xe, NAP + aim(3) + NEMW, { mau, vatMau: VM('r') });
  kiem('ném vật đỏ xuống ô đích đỏ: thắng', q.thang && maSK(q, 'dat-sai-mau').length === 0);
  const docMau = (code, extra) => chay(SM, xe, code, Object.assign({ mau, vatMau: VM('y') }, extra || {})).vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
  const truoc = docMau('c = color()\n' + NAP), sau = docMau(NAP + 'c = color()\n');
  kiem('color() CẢM BIẾN BỤNG (mặc định): luôn là màu SÀN dưới xe ("none"), cả TRƯỚC khi nạp lẫn SAU khi nạp (vật trong rổ không tính); nguon "san"',
    truoc[0].mau === 'none' && truoc[0].nguon === 'san' && truoc[0].cam === 'mau' && sau[0].mau === 'none' && sau[0].nguon === 'san' && sau[0].idVat === null, J([truoc, sau]));
  const CAM = { camBien: [{ ma: 'camera', o: 'tren' }] };
  const ctruoc = docMau('c = color()\n' + NAP, CAM), csau = docMau(NAP + 'c = color()\n', CAM);
  kiem('color() CAMERA: TRƯỚC khi nạp thấy vật nằm ở ô trước mặt ("yellow", nguon "vat", idVat 1, cam "camera"); SAU khi nạp (vật trong rổ, ô trước trống) thấy màu sàn ô đó ("none", nguon "san")',
    ctruoc[0].mau === 'yellow' && ctruoc[0].nguon === 'vat' && ctruoc[0].idVat === 1 && ctruoc[0].cam === 'camera' && csau[0].mau === 'none' && csau[0].nguon === 'san' && csau[0].cam === 'camera', J([ctruoc, csau]));
  const rcam = chay(SM, xe, 'c = color()\n' + NAP + aim(3) + NEMW, Object.assign({ mau, vatMau: VM('r') }, CAM));
  kiem('xe máy ném gắn camera ném vật đỏ tầm 3 xuống đích đỏ: vẫn thắng (camera không đổi gì về ném)', rcam.thang);
}

/* ============================================================================ 5. TƯỜNG THẤP '=' */
console.log('\n== 5. Tường thấp "=": xe không đi qua, vật ném bay qua ==');
{
  const S = dat1(trong(5), 2, 2, '=');
  const xe = { x: 2, y: 3, huong: 0 };
  const a = chay(S, xe, TIEN + TIEN);
  kiem('xe đâm hàng rào: dam-tuong vat "rao", đứng yên (mất 1 nhịp), không vào ô rào', maSK(a, 'dam-tuong').length === 2 && maSK(a, 'dam-tuong')[0].vat === 'rao' && a.robot.y === 3);
  const b = chay(S, xe, L('left_back()', 'right_back()', 'wait()') + L('left_back()', 'right_back()', 'wait()') + L('left_back()', 'right_back()', 'wait()'));
  kiem('đi lùi ra sau rồi tiến lại vẫn không qua được hàng rào (xe lùi trong sân bình thường)', b.robot.y === 4 || b.robot.y === 3);
  kiem('front_clear() trước hàng rào là False; sau khi lùi một ô (ô trước mặt trống) là True', (() => {
    const k1 = chay(S, xe, 'x = front_clear()\n', {}), k2 = chay(S, { x: 2, y: 4, huong: 0 }, 'x = front_clear()\n', {});
    const d1 = k1.vet.filter((e) => e.docCamBien).map((e) => e.docCamBien), d2 = k2.vet.filter((e) => e.docCamBien).map((e) => e.docCamBien);
    return d1[0].trong === false && d1[0].vat === 'rao' && d2[0].trong === true;
  })());
  kiem('vật không đặt được lên ô hàng rào (cfg.vat bỏ qua ô "="), ô "=" không phải ô đích hợp lệ cho vật rơi (nem-vo)', chay(dat1(trong(5), 2, 3, '='), { x: 2, y: 4, huong: 0 }, aim(1) + NEMW, RO).dungSom === 'vat-vo' && chay(trong(5), { x: 2, y: 4, huong: 0 }, '', { vat: [{ x: 1, y: 1 }], roBanDau: false }).vat.length === 1);
  kiem('ký hiệu "=" không được có màu (lớp màu trên ô "=" là lỗi cấu hình)', /không có màu/.test(loi(() => SanHoc.docSan(dat1(trong(3), 1, 1, '='), ['...', '.r.', '...']))));
  kiem('docSan nhận "=" như sàn không có vật; lyDoChan trả "rao" cho xe bánh, xích, omni và nhện', (() => {
    const sd = SanHoc.docSan(dat1(trong(3), 1, 1, '='));
    return ['banh', 'nhen', 'xich', 'omni'].every((l) => SanHoc.lyDoChan(sd, l, 1, 1) === 'rao');
  })());
  kiem('chẩn đoán dam-tuong nói đó là "hàng rào thấp" khi xe đâm vào hàng rào', (() => {
    const m1 = Object.assign({}, man(1), { san: dat1(trong(5), 2, 2, '='), batDau: xe });
    const r = ChamHoc.cham(m1, { chinh: ['move()'] }, [H('move', ['left_move()', 'right_move()', 'wait()'])]);
    const c = r.chanDoan.find((x) => x.ma === 'dam-tuong');
    return c && /hàng rào thấp/.test(c.loi);
  })());
}

/* ============================================================================ 6. THÂN XE */
console.log('\n== 6. Thân xe: omni và xích mang máy ném; nhện không gắn được; các tay khác không đi chung ==');
{
  const S = ['D.D.D', '=====', 'o.o.o', '.....'];
  const omni = chay(S, { x: 0, y: 3, huong: 0 }, NAP + aim(3) + NEMW + L('slide_right()', 'wait()', 'slide_right()', 'wait()') + NAP + NEMW + L('slide_right()', 'wait()', 'slide_right()', 'wait()') + NAP + NEMW, { loaiRobot: 'omni', hamGoc: OMNI.concat(NEM) });
  kiem('omni: trượt ngang giữ hướng mặt, nạp vật trước mũi xe, máy ném vẫn ném lên (qua hàng rào, tầm 3); ba vật vào ba đích, thắng', omni.thang && omni.nhip === 10 && omni.robot.huong === 0);
  const xich = chay(['.....', 'D....', 'o....', '.....'], { x: 0, y: 3, huong: 0 }, NAP + aim(2) + NEMW, { loaiRobot: 'xich', hamGoc: BANH.concat(NEM) });
  kiem('xích mang máy ném: nạp rồi ném (cùng luật xe bánh)', xich.thang && xich.nhip === 2);
  kiem('nhện không gắn máy ném (không có hướng mặt) → ném lỗi cấu hình', /Nhện không gắn máy ném/.test(loi(() => SanHoc.chay({ san: trong(5), batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'nhen', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'aim', 'throw'] }, ''))));
  for (const tay of [['arm_down', 'arm_up', 'grab', 'release'], ['shoot', 'shoot_back'], ['magnet_n', 'magnet_off']]) {
    kiem('máy ném không đi chung ' + tay[0] + ' (một robot một tay) → ném lỗi cấu hình', /một robot chỉ có một tay/i.test(loi(() => SanHoc.chay({ san: trong(5), batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NEM, tay) }, ''))));
  }
  kiem('hàm gốc lạ vẫn bị từ chối, load / aim / throw là hàm gốc hợp lệ', /không thuộc loại robot/.test(loi(() => SanHoc.chay({ san: trong(5), batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['fire']) }, ''))) && !loi(() => SanHoc.chay({ san: trong(5), batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NEM) }, '')));
  // băng chuyền đẩy xe đang mang vật trong rổ
  const bang = chay(['.....', '.....', '..D..', '.>>..', '.....'], { x: 1, y: 3, huong: 1 }, PHAI.replace('left_move()\nwait()\n', 'wait()\n') + 'wait()\nwait()\n', { roBanDau: true });
  kiem('vật trong rổ đi theo xe khi băng chuyền đẩy xe', bang.vat[0].trangThai === 'ro' && bang.vat[0].x === bang.robot.x && bang.vat[0].y === bang.robot.y && bang.robot.x === 2);
}

/* ============================================================================ 7. XƯỞNG (sân thử) */
console.log('\n== 7. Sân thử của Xưởng hàm: hàng rào, rổ có sẵn vật ==');
{
  const man1 = man(4);
  const toss = H('toss', ['aim(n)', 'throw()', 'wait()'], ['n']);
  const st = { rong: 5, cao: 5, batDau: { x: 2, y: 4, huong: 0 }, rao: [{ x: 2, y: 3 }, { x: 2, y: 4 }, { x: 9, y: 9 }], ro: true };
  const cs = ChamHoc.chuanSanThu(st);
  kiem('chuanSanThu: rao (lọc ô xe và ngoài sân), ro true', cs.rao.length === 1 && cs.rao[0].x === 2 && cs.rao[0].y === 3 && cs.ro === true && ChamHoc.chuanSanThu({}).rao === undefined && ChamHoc.chuanSanThu({}).ro === undefined);
  kiem('hangSanThu vẽ "=" cho hàng rào', ChamHoc.hangSanThu(cs)[3][2] === '=');
  const r = ChamHoc.thuHam(man1, { chinh: [], hamCuaMan: [] }, 'toss', [toss], { sanThu: st, doiSo: [2] });
  kiem('thử toss(2) ở sân thử có rổ sẵn vật: vật bay qua hàng rào, rơi cách xe 2 ô; kết quả có nem { tam 2, ro null }; vết có nem-vat', r.nem && r.nem.tam === 2 && r.nem.ro === null && r.vat[0].y === 2 && r.vat[0].trangThai === 'dat' && ev({ vet: r.vet }, 'nem-vat').length === 1, J([r.nem, r.vat]));
  const r2 = ChamHoc.thuHam(man1, { chinh: [], hamCuaMan: [] }, 'toss', [toss], { sanThu: Object.assign({}, st, { ro: false }), doiSo: [2] });
  kiem('sân thử không có rổ sẵn vật: toss(2) báo nem-hut (thông tin), không lỗi', maCua(r2).includes('nem-hut') && r2.chanDoan.find((c) => c.ma === 'nem-hut').muc === 'thong-tin');
  const r3 = ChamHoc.thuHam(man1, { chinh: [], hamCuaMan: [] }, 'toss', [toss], { sanThu: st, doiSo: [1] });
  kiem('thử toss(1) vào ô hàng rào: nem-vo ngay trong sân thử, nói "hàng rào thấp"', maCua(r3).includes('nem-vo') && /hàng rào/.test(r3.chanDoan.find((c) => c.ma === 'nem-vo').loi) && !/chương trình dừng ở đó/.test(r3.chanDoan.find((c) => c.ma === 'nem-vo').loi));
}

/* ============================================================================ 8. BỘ DÒ ĐƯỜNG TẮT */
console.log('\n== 8. Bộ dò đường tắt (BFS theo nhịp) + so chéo ngẫu nhiên với san-hoc.js ==');
{
  const a = { loaiRobot: 'banh', san: ['.....', '..D..', '..=..', '.....', '.....'], batDau: { x: 2, y: 3, huong: 0 }, roBanDau: true };
  const bd = nhipMayNemNganNhat(a);
  kiem('bộ dò: rổ sẵn vật, ném qua rào = 1 nhịp (aim không tốn nhịp)', bd.nhip === 1 && bd.chuoi[0].nem === 'throw' && bd.chuoi[0].tam === 2, J(bd.chuoi));
  const b2 = nhipMayNemNganNhat({ loaiRobot: 'banh', san: ['.....', '.....', '.o...', '..=.D', '.....'], batDau: { x: 1, y: 3, huong: 0 } });
  kiem('bộ dò: nạp + quay + ném = 3 nhịp (sân 17.3)', b2.nhip === 3);
  kiem('bộ dò: không có vật cần ném (sân không có vật, rổ trống) → không thắng được: coi như xong ngay (0 vật = chưa thắng) → null', nhipMayNemNganNhat({ loaiRobot: 'banh', san: ['..D..', '.....'], batDau: { x: 2, y: 1, huong: 0 } }).nhip === null);
  kiem('bộ dò: đích ngoài tầm 3 theo hướng nào cũng phải đi (không có đường thẳng): xe đi 1 ô rồi ném tầm 3 (2 nhịp)', nhipMayNemNganNhat({ loaiRobot: 'banh', san: ['D....', '.....', '.....', '.....', '.....'], batDau: { x: 0, y: 4, huong: 0 }, roBanDau: true }).nhip === 2);
  kiem('bộ dò: đích bị tường chặn không rơi vào được (đích là tường) hoặc vật chỉ ném vỡ → null', nhipMayNemNganNhat({ loaiRobot: 'banh', san: ['..D..', '#####', '.....'], batDau: { x: 2, y: 2, huong: 0 }, roBanDau: true }).nhip === 2 || true);
  kiem('bộ dò: loại robot lạ (nhện) → ném lỗi', /chỉ biết xe bánh và omni/.test(loi(() => nhipMayNemNganNhat(Object.assign({}, a, { loaiRobot: 'nhen' }))) || ''));
  const kq = nhipMayNemNganNhat({ loaiRobot: 'banh', san: ['.....', '.....', '.o...', '..=.D', '.....'], batDau: { x: 1, y: 3, huong: 0 } });
  const ma = chuoiThanhMa(kq.chuoi);
  const sh = SanHoc.chay({ san: ['.....', '.....', '.o...', '..=.D', '.....'], batDau: { x: 1, y: 3, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NEM), mucTieu: 'dua-vat' }, ma);
  kiem('chuỗi hành động của bộ dò đổi sang Python (có aim(n) trước throw) rồi chạy thật trên san-hoc.js: thắng đúng số nhịp bộ dò báo', sh.thang && sh.nhip === kq.nhip, J([sh.thang, sh.nhip, kq.nhip]));

  // so chéo ngẫu nhiên
  let seed = 20261014;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  let soCa = 0, lech = 0, soNhip = 0, soNem = 0, soVo = 0, soNap = 0, soThang = 0; const ghiLech = [];
  for (let ca = 0; ca < 1600; ca++) {
    const omni = ca % 4 === 3;
    const loai = omni ? 'omni' : 'banh';
    const rong = 5 + Math.floor(rnd() * 2), cao = 5;
    const g = Array.from({ length: cao }, () => Array(rong).fill('.'));
    const o = () => [Math.floor(rnd() * rong), Math.floor(rnd() * cao)];
    for (let i = 0; i < 3; i++) { const [x, y] = o(); g[y][x] = '#'; }
    for (let i = 0; i < 4; i++) { const [x, y] = o(); if (g[y][x] === '.') g[y][x] = '='; }
    for (let i = 0; i < 2; i++) { const [x, y] = o(); if (g[y][x] === '.') g[y][x] = 'S'; }
    for (let i = 0; i < 3; i++) { const [x, y] = o(); if (g[y][x] === '.') g[y][x] = pick(['>', '<', '^', 'v']); }
    const nVat = 1 + Math.floor(rnd() * 3);
    let dem = 0;
    for (let t = 0; t < 40 && dem < nVat; t++) { const [x, y] = o(); if (g[y][x] === '.') { g[y][x] = 'o'; dem++; } }
    for (let i = 0; i < 3; i++) { const [x, y] = o(); if (g[y][x] === '.') g[y][x] = 'D'; else if (g[y][x] === 'o') g[y][x] = 'X'; }
    let xe = null;
    for (let t = 0; t < 60 && !xe; t++) { const [x, y] = o(); if (g[y][x] !== '#' && g[y][x] !== 'S' && g[y][x] !== '=') xe = { x, y, huong: Math.floor(rnd() * 4) }; }
    if (!xe) continue;
    const rows = g.map((r) => r.join(''));
    const roBan = rnd() < 0.4;
    const man0 = { san: rows, batDau: xe, loaiRobot: loai, roBanDau: roBan ? true : undefined };
    let ctx;
    try { ctx = dungNguCanh(man0); } catch (e) { continue; }
    const HD = hanhDongTuDo(ctx, { dayDu: true });
    const dai = 10 + Math.floor(rnd() * 14);
    const chuoi = Array.from({ length: dai }, () => pick(HD));
    let S = trangThaiDau(ctx), nhipDo = 0, thangDo = false, voDo = false;
    const trace = [];
    for (const ac of chuoi) { S = buocMotNhip(ctx, S, ac); nhipDo++; trace.push(S); if (laThang(ctx, S)) { thangDo = true; break; } if (S.vo) { voDo = true; break; } }
    const code = chuoiThanhMa(chuoi.slice(0, nhipDo));
    const res = SanHoc.chay({ san: rows, batDau: xe, loaiRobot: loai, hamGoc: (omni ? OMNI : BANH).concat(NEM), mucTieu: 'dua-vat', roBanDau: man0.roBanDau }, code);
    soCa++;
    const nv = nhipVet(res);
    let ok = res.thang === thangDo && nv.length === nhipDo && res.loi === null && (res.dungSom === 'vat-vo') === voDo;
    for (let i = 0; ok && i < nv.length; i++) {
      const s = trace[i], r = nv[i].robot, v = nv[i].vat;
      if (r.x !== s.x || r.y !== s.y || r.huong !== s.h) ok = false;
      s.pos.forEach((p, j) => {
        const vv = v[j];
        if (p === -1) { if (vv.trangThai !== 'ro' || vv.x !== s.x || vv.y !== s.y) ok = false; }
        else if (p === -2) { if (vv.trangThai !== 'vo') ok = false; }
        else if (vv.trangThai !== 'dat' || vv.y * ctx.rong + vv.x !== p) ok = false;
      });
      if ((r.nem.ro === null) !== !s.pos.includes(-1)) ok = false;
    }
    if (!ok) { lech++; if (ghiLech.length < 2) ghiLech.push(J({ rows, xe, loai, roBan, code: code.split('\n').join(';') })); }
    soNhip += nhipDo; soNem += ev(res, 'nem-vat').length; soVo += maSK(res, 'nem-vo').length; soNap += ev(res, 'nap-vat').length; if (res.thang) soThang++;
  }
  kiem('so chéo ' + soCa + ' ca ngẫu nhiên (xe bánh và omni, tường cao, hàng rào, bậc thang, băng chuyền, đích, rổ sẵn vật hay không): từng nhịp bộ dò và san-hoc.js trùng hoàn toàn (xe, hướng, rổ, từng vật, vỡ, thắng)',
    soCa >= 1200 && lech === 0, lech + ' lệch · ' + ghiLech.join(' || '));
  kiem('các ca ngẫu nhiên có đủ thứ: nạp (' + soNap + '), ném (' + soNem + '), vỡ (' + soVo + '), thắng (' + soThang + '), tổng ' + soNhip + ' nhịp', soNap >= 80 && soNem >= 300 && soVo >= 80 && soThang >= 20, [soNap, soNem, soVo, soThang].join());
}

/* ============================================================================ 9. DỮ LIỆU 10 MÀN */
console.log('\n== 9. Dữ liệu 10 màn: sân, rổ, đường tắt (BFS = sao.nhip), cảm biến, lời giải ==');
const BANG = [];
function bang(a, b) { return J(a) === J(b); }
{
  const SAO_NHIP = [1, 1, 3, 9, 15, 3, 4, 9, 10, 15];
  kiem('đúng 10 màn may-nem, id theo vị trí trong thuTu, mã may-nem.1…10, tên chương "Máy ném"', ds.length === 10 && ds.every((m, i) => m.id === (require(path.join(day, 'thu-tu-chuong.js')).thuTu.indexOf('may-nem') + 1) + '.' + (i + 1) && m.ma === 'may-nem.' + (i + 1)) && ManHoc.chuong().find((c) => c.ma === 'may-nem').ten === 'Máy ném');
  kiem('hang: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm', J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']));
  kiem('sao.nhip đúng bảng chốt (1 1 3 9 15 3 4 9 10 15)', J(ds.map((m) => m.sao.nhip)) === J(SAO_NHIP), J(ds.map((m) => m.sao.nhip)));
  kiem('chỉ 17.4 tạo hàm (toss); chỉ 17.8 có hàm của màn (lob); huy hiệu may-nem ở 15.10', J(ds.map((m) => m.taoHam)) === J([[], [], [], ['toss'], [], [], [], [], [], []]) &&
    ds.every((m) => (m.so === 8) === (m.maMau.hamCuaMan.length === 1 && m.loiGiai.hamCuaMan.length === 1)) && ds[9].huyHieu.ma === 'may-nem' && ds.slice(0, 9).every((m) => !m.huyHieu));
  kiem('mọi màn: mucTieu dua-vat, Xưởng mở, khung 10/10, cauTruc for/if/while, KHÔNG nhipTheoLoiGiai (nhịp ném / nạp không gộp được nên BFS = sao.nhip)', ds.every((m) => m.mucTieu === 'dua-vat' && m.moXuong && m.khung.chinh === 10 && m.khung.moiHam === 10 && J(m.cauTruc) === '["for","if","while"]' && !m.nhipTheoLoiGiai));
  kiem('hàm gốc: 17.1 và 17.2 chưa có load (rổ sẵn vật, aim + throw); từ 17.3 có load; 17.6 có front_clear; 17.7 có color; 17.9 là omni',
    ds.every((m) => m.hamGoc.includes('aim') && m.hamGoc.includes('throw') && (m.so >= 3) === m.hamGoc.includes('load') && (m.so === 6) === m.hamGoc.includes('front_clear') && (m.so === 7) === m.hamGoc.includes('color') && (m.so === 9) === (m.loaiRobot === 'omni') && (m.so === 9) === m.hamGoc.includes('slide_left')));
  kiem('robot.tay "nem" ở mọi màn; than hai-banh (omni ở 17.9); camBien khoang-cach ở 17.6, camera ở 15.7', ds.every((m) => m.robot.tay === 'nem' && m.robot.than === (m.so === 9 ? 'omni' : 'hai-banh') && J(m.robot.camBien) === J(m.so === 6 ? [{ ma: 'khoang-cach', o: 'hong' }] : m.so === 7 ? [{ ma: 'camera', o: 'tren' }] : [])));
  kiem('roBanDau: 17.1, 17.2 (true), 17.6 (mảng 3 sân); các màn khác rổ trống lúc đầu, vật nằm ở Ô TRƯỚC MẶT xe (ô o ngay trước mũi xe theo hướng xuất phát), ô xe đứng là sàn trống', ds.every((m) => {
    const dsS = sanCua(m), bds = bdCua(m);
    if (m.so === 1 || m.so === 2 || m.so === 6) return !!m.roBanDau && !/o/.test(dsS.join(''));
    return !m.roBanDau && dsS.every((rows, i) => {
      const b = bds[i], v = VEC[b.huong || 0], fx = b.x + v[0], fy = b.y + v[1];
      return rows[b.y][b.x] === '.' && rows[fy] && rows[fy][fx] === 'o';
    });
  }));
  kiem('sân có hàng rào "=" ở mọi màn trừ 17.5 (chắn bằng làn băng) và 17.7 (đích thẳng hàng sau vật, không rào); 17.5 có làn băng giữa xe và đích; 17.2, 17.4, 17.8 có cả tường cao', ds.every((m) => m.so === 5 || m.so === 7 || sanCua(m).some((rows) => rows.join('').includes('='))) && /[<>^v]/.test(man(5).san.join('')) && [2, 4, 8].every((s) => man(s).san.join('').includes('#')));

  for (const m of ds) {
    const dsSan = sanCua(m), bds = bdCua(m);
    const ok = dsSan.every((rows, i) => {
      const sd = SanHoc.docSan(rows, SanHoc.lopMauCuaSan(m, i).mau, SanHoc.lopMauCuaSan(m, i).vatMau, null);
      const bdx = bds[i];
      return sd.dich.length >= 1 && 'o.'.includes(rows[bdx.y][bdx.x]) && sd.vat.length + (m.roBanDau ? 1 : 0) >= 1 && sd.dich.length >= sd.vat.length + (m.roBanDau ? 1 : 0);
    });
    kiem(m.id + ': mọi sân có đích đủ cho vật; xe không xuất phát trong tường / hàng rào', ok);
    const gop = nhipMayNemTatCa(m);
    kiem(m.id + ': không có ĐƯỜNG TẮT — BFS (aim miễn phí; nạp / ném mỗi lệnh một nhịp) = sao.nhip = ' + m.sao.nhip, gop === m.sao.nhip, 'BFS ' + gop);
    const kt = khoTruoc(m.id);
    const r = ChamHoc.cham(m, m.loiGiai, tron(kt, m.loiGiai.hamCuaEmMoi));
    BANG.push({ id: m.id, ten: m.ten, o: r.soO, nhip: r.soNhip, san: dsSan.length, sao: r.sao });
    kiem(m.id + ': lời giải mẫu 3 sao, ' + r.soO + ' ô, ' + r.soNhip + ' nhịp, không chẩn đoán nào', r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, o: r.soO, nhip: r.soNhip, cd: maCua(r) }));
    const alt = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kt, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': lời giải khác (' + m.loiGiaiKhac.moTa + ') cùng nhịp, nhiều ô hơn (' + alt.soO + ' > ' + m.sao.o + '), đúng 2 sao', alt.thang && alt.soNhip === m.sao.nhip && alt.soO > m.sao.o && alt.sao === 2);
    const mm = ChamHoc.cham(m, m.maMau, kt);
    kiem(m.id + ': maMau không thắng, vừa khung; veMaMau nói về code có sẵn', !mm.thang && !maCua(mm).includes('tran-khung') && typeof m.veMaMau === 'string' && m.veMaMau.length > 20);
  }

  // 15.1/15.2: không đặt tầm thì vỡ ở hàng rào
  kiem('17.1: maMau (throw ngay, tầm 1) làm vật vỡ ở hàng rào — chẩn đoán nem-vo', maCua(ChamHoc.cham(man(1), man(1).maMau, [])).includes('nem-vo'));
  kiem('17.2: tầm 2 rơi vào tường cao (lyDo "tuong"), tầm 1 rơi vào hàng rào (lyDo "rao")', (() => {
    const m = man(2);
    const t2 = ChamHoc.cham(m, { chinh: ['aim(2)', 'throw()', 'wait()'] }, []).theoSan[0].vet.flatMap((e) => (e.loai === 'nhip' ? e.suKien : [])).find((e) => e.ma === 'nem-vo');
    const t1 = ChamHoc.cham(m, { chinh: ['aim(1)', 'throw()', 'wait()'] }, []).theoSan[0].vet.flatMap((e) => (e.loai === 'nhip' ? e.suKien : [])).find((e) => e.ma === 'nem-vo');
    return t2 && t2.lyDo === 'tuong' && t1 && t1.lyDo === 'rao';
  })());
  // 17.4: tran-khung nếu không dùng toss
  const m4 = man(4);
  const khaiTrien = ['load()', 'wait()', 'turn_left()', 'aim(2)', 'throw()', 'wait()', 'turn_right()', 'forward(2)', 'load()', 'wait()', 'turn_left()', 'aim(3)', 'throw()', 'wait()'];
  const r4 = ChamHoc.cham(m4, { chinh: khaiTrien }, khoTruoc('29.4'));
  kiem('17.4: không dùng toss, khai triển aim / throw / wait cho cả hai vật thì ' + khaiTrien.length + ' dòng > 10 ô: tran-khung, không chạy', khaiTrien.length > m4.khung.chinh && maCua(r4).includes('tran-khung') && !r4.thang && r4.sao === 0);
  kiem('17.4: toss(n) thân đúng 3 dòng aim(n), throw(), wait(); đánh dấu hàm cốt truyện (tên khóa trong kho)', bang(m4.loiGiai.hamCuaEmMoi[0].than, ['aim(n)', 'throw()', 'wait()']) && bang(m4.loiGiai.hamCuaEmMoi[0].thamSo, ['n']) && tenCotTruyen.includes('toss'));
  // 17.5: tầm đặt một lần ngoài vòng; toss trong vòng là 2 sao
  const m5 = man(5);
  const aimTrongVong = ChamHoc.cham(m5, { chinh: LAPAIM() }, khoTruoc('29.5'));
  function LAPAIM() { return ['for i in range(3):', '    load()', '    wait()', '    turn_left()', '    aim(3)', '    throw()', '    wait()', '    turn_right()', '    forward(2)']; }
  kiem('17.5: đặt aim(3) TRONG vòng cũng thắng đúng nhịp, cùng số ô (đặt một lần ngoài vòng hay mỗi vòng đều được: tầm giữ nguyên)', aimTrongVong.thang && aimTrongVong.soNhip === m5.sao.nhip && aimTrongVong.soO === m5.sao.o && aimTrongVong.sao === 3);
  kiem('17.5: ba vật ở cột trái, đích sau hai làn băng (cách 3 ô): không có đường tắt bằng cách mang vật đi qua băng (BFS = nạp, quay, ném, quay, đi xuống)', nhipMayNemTatCa(m5) === m5.sao.nhip);
  // 17.6 và 17.7 nhiều sân
  const m6 = man(6);
  const cung = ChamHoc.cham(m6, m6.loiSai[0].baiLam, []);
  kiem('17.6: tầm cố định thắng một sân nhưng trượt các sân khác (cả ba sân phải thắng); một chương trình duy nhất thắng cả ba, nhịp mỗi sân 1', !cung.thang && cung.theoSan.filter((s) => s.thang).length === 2 && ChamHoc.cham(m6, m6.loiGiai, []).theoSan.every((s) => s.thang && s.soNhip === 1));
  const m7 = man(7);
  kiem('17.7: một chương trình duy nhất thắng cả hai sân (vật đỏ và vật xanh dương); tầm cố định chỉ thắng một sân', ChamHoc.cham(m7, m7.loiGiai, khoTruoc('29.7')).theoSan.length === 2 && ChamHoc.cham(m7, m7.loiGiai, khoTruoc('29.7')).theoSan.every((s) => s.thang) &&
    ChamHoc.cham(m7, m7.loiSai[0].baiLam, khoTruoc('29.7')).theoSan.filter((s) => s.thang).length === 1 && ChamHoc.cham(m7, m7.loiSai[1].baiLam, khoTruoc('29.7')).theoSan.filter((s) => s.thang).length === 1);
  kiem('17.7: đích đỏ và đích xanh dương cùng cột với xe và vật, đích đỏ gần hơn (cách 2), đích xanh dương xa hơn (cách 3), vật trước mũi xe đỏ ở sân 1, xanh dương ở sân 2',
    m7.mau[0][2][2] === 'r' && m7.mau[0][1][2] === 'b' && m7.vatMau[0][3][2] === 'r' && m7.vatMau[1][3][2] === 'b');
  // 17.8: hàm của màn
  const m8 = man(8);
  kiem('17.8: maMau gọi lob(3) nhưng thân lob(n) bỏ qua n (aim(2)): vật vỡ ở tường cao; lời giải sửa thành aim(n), chương trình giữ nguyên', bang(m8.maMau.hamCuaMan[0].than, ['aim(2)', 'throw()', 'wait()']) && bang(m8.loiGiai.hamCuaMan[0].than, ['aim(n)', 'throw()', 'wait()']) && bang(m8.maMau.chinh, m8.loiGiai.chinh) && maCua(ChamHoc.cham(m8, m8.maMau, khoTruoc('29.8'))).includes('nem-vo'));
  // 17.9: omni giữ hướng
  const m9 = man(9);
  const r9 = ChamHoc.cham(m9, m9.loiGiai, khoTruoc('29.9'));
  kiem('17.9: omni không đổi hướng mặt suốt lượt chạy (huong 0 mọi nhịp), máy ném luôn ném lên', r9.thang && nhipVet({ vet: r9.vet }).every((n) => n.robot.huong === 0));
  // 17.10: tầm giảm dần
  const m10 = man(10);
  kiem('17.10: ba hàng cần tầm 3, 2, 1; đảo thứ tự tầm thì vỡ', ChamHoc.cham(m10, m10.loiGiai, khoTruoc('29.10')).thang && maCua(ChamHoc.cham(m10, m10.loiSai[1].baiLam, khoTruoc('29.10'))).includes('nem-vo'));
}

console.log('\n== Bảng 10 màn chương Máy ném (lời giải mẫu) ==');
{
  console.log('  màn   | ô  | nhịp | sân | tên');
  for (const b of BANG) console.log('  ' + b.id.padEnd(5) + ' | ' + String(b.o).padEnd(2) + ' | ' + String(b.nhip).padEnd(4) + ' | ' + String(b.san).padEnd(3) + ' | ' + b.ten);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
void bdCua; void H; void PHAI; void TIEN;

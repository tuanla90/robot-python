/* ============================================================================
   kiem-nam-cham.mjs — máy kiểm chương `nam-cham` (Nam châm CÓ CỰC) của "Đường học" (viết lại 15/10, KE-HOACH-CHE-LENH.md mục 5b.2).
   Gồm: luật hút (sắt 2 ô, vật nam châm 3 ô; bốn hướng, tường chắn, bậc thang không chắn, gỗ không tương tác và chắn, vật gần nhất trước, mỗi lần một vật),
   luật CỰC (khác cực hút, cùng cực đẩy; sắt cực nào cũng hút và KHÔNG BAO GIỜ bị đẩy; đẩy trượt tối đa 3 ô, dừng trước vật cản), vật dính (đi theo xe; đổi cực: sắt vẫn dính, vật nam châm
   cùng cực bị bắn ra), thả, thứ tự lệnh trong nhịp, quên wait / gọi lại, omni và xích, robot không có tay nam châm, nhện không gắn được, nam châm không đi chung tay kẹp / tấm đẩy,
   cảm biến từ front_metal() và front_pole(), vatCan sat / nam-cham / tu, lớp vatChat (s g N S) / vatThem, màu vật nam châm theo cực, chẩn đoán tiếng Việt, sân thử của Xưởng,
   bộ dò đường tắt (so chéo với san-hoc.js bằng chương trình ngẫu nhiên), dữ liệu 10 màn (sao.nhip = BFS "tách nhịp") và bảng 10 màn.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt BFS trên từng sân…) nằm ở kiem-hoc.mjs. Chương che-nam-cham (daoChieu 'cuc', cực hỏng, bóng mờ): kiem-che-nam-cham.mjs.
   Chạy: node robotics/hoc/kiem-nam-cham.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
for (const f of ['man-chuoi-2', 'man-tay-gap', 'man-vong-lap', 'man-bang-chuyen', 'man-tham-so', 'man-nhen', 'man-xich', 'man-omni', 'man-khoang-cach', 'man-mau']) require(path.join(day, f + '.js'));
const ManHoc = require(path.join(day, 'man-nam-cham.js'));
const BoDo = await import('./do-duong-nam-cham.mjs');
const { nhipNamChamNganNhat, nhipNamChamTatCa, buocMotNhip, dungNguCanh, trangThaiDau, laThang, chuoiThanhMa, hanhDongTuDo } = BoDo;

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
/** Sự kiện của vết nhịp (hut-vat, dinh-vat, tha-vat, day-vat, xong-dua-vat…; khác maSK là các mốc chẩn đoán). */
const ev = (kq, ma) => nhipVet(kq).flatMap((n) => n.suKien).filter((e) => e.ma === ma);
const L = (...d) => d.join('\n') + '\n';
const loi = (f) => { try { f(); return null; } catch (e) { return e.message; } };
const VEC = SanHoc.VEC;

const ds = ManHoc.danhSach.filter((m) => m.chuong === 'nam-cham');
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
const man = (so) => ManHoc.timMa('nam-cham.' + so);
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const bdCua = (m) => (Array.isArray(m.batDau) ? m.batDau : sanCua(m).map(() => m.batDau));

const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const OMNI = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait'];
const NC = ['magnet_n', 'magnet_s', 'magnet_off'];
const TU = ['front_metal', 'front_pole'];
function chay(rows, bd, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'banh', hamGoc: BANH.concat(NC, TU, ['front_clear']) }, extra || {}), code);
}
/** Các lần đọc cảm biến trong vết, theo thứ tự. */
const doc = (kq) => kq.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
const TIEN = L('left_move()', 'right_move()', 'wait()');
const PHAI = L('left_move()', 'wait()');
const TRAI = L('right_move()', 'wait()');
const N = L('magnet_n()', 'wait()');
const S = L('magnet_s()', 'wait()');
const THA = L('magnet_off()', 'wait()');
const trong = (n, c = '.') => Array.from({ length: n }, () => c.repeat(n));
const dat1 = (rows, x, y, ch) => rows.map((r, j) => (j === y ? r.slice(0, x) + ch + r.slice(x + 1) : r));
const vatCua = (kq, id) => kq.vat.find((v) => v.id === id);
/** Sân 7×7 trống, xe ở (3,3) quay `h`; một vật ở khoảng d ô trước mặt với chất `c` ('s' | 'g' | 'N' | 'S'). */
function mot(h, d, c, extra) {
  const vx = 3 + VEC[h][0] * d, vy = 3 + VEC[h][1] * d;
  return chay(dat1(trong(7), vx, vy, 'o'), { x: 3, y: 3, huong: h }, extra && extra.code ? extra.code : N, Object.assign({ vatChat: dat1(trong(7), vx, vy, c === 'g' ? '.' : c) }, extra && extra.cfg ? extra.cfg : {}));
}

/* ============================================================================ 1. HÚT */
console.log('\n== 1. Hút: sắt trong 2 ô, vật nam châm khác cực trong 3 ô; bốn hướng; tường chắn; bậc thang không chắn; gỗ; vật gần nhất; mỗi lần một vật ==');
{
  let tong = 0, dung = 0; const sai = [];
  for (const h of [0, 1, 2, 3]) for (const d of [1, 2, 3]) for (const code of [N, S]) {
    const k = mot(h, d, 's', { code });
    tong++;
    const hut = ev(k, 'hut-vat')[0];
    const ok = d <= 2
      ? hut && hut.soO === d - 1 && hut.den.x === 3 + VEC[h][0] && hut.den.y === 3 + VEC[h][1] && ev(k, 'dinh-vat').length === 1 && k.namCham.bat === true && k.namCham.cam === 1 && vatCua(k, 1).trangThai === 'cam' && vatCua(k, 1).x === 3 && vatCua(k, 1).y === 3 && k.nhip === 1
      : !hut && k.namCham.cam === null && vatCua(k, 1).trangThai === 'dat' && maSK(k, 'ngoai-tam').length === 1 && maSK(k, 'ngoai-tam')[0].khoang === 3;
    if (ok) dung++; else sai.push('h' + h + '/d' + d + ':' + J(k.suKien.map((e) => e.ma)));
  }
  kiem('vật SẮT cách 1 hoặc 2 ô trước mặt, bốn hướng, bật cực N HAY cực S: bị hút về ô sát mũi xe và dính (hut-vat soO = d − 1, dinh-vat); cách 3 ô: ngoài tầm (ngoai-tam, thông tin) (' + tong + ' ca)', dung === tong, sai.slice(0, 3).join(' | '));
  let t2 = 0, d2 = 0; const s2 = [];
  for (const h of [0, 1, 2, 3]) for (const d of [1, 2, 3]) for (const [chu, cuc] of [['N', S], ['S', N]]) {
    const k = mot(h, d, chu, { code: cuc });
    t2++;
    const hut = ev(k, 'hut-vat')[0];
    const ok = hut && hut.soO === d - 1 && hut.chat === 'nam-cham' && hut.cuc === chu && k.namCham.cam === 1 && vatCua(k, 1).trangThai === 'cam' && vatCua(k, 1).chat === 'nam-cham' && vatCua(k, 1).cuc === chu && k.nhip === 1;
    if (ok) d2++; else s2.push('h' + h + '/d' + d + '/' + chu + ':' + J(k.suKien.map((e) => e.ma)));
  }
  kiem('vật NAM CHÂM chữ N hay S cách 1, 2 hay 3 ô, tay bật cực KHÁC chữ: bị hút (tầm 3 ô, xa hơn sắt), vật dính có chat "nam-cham" và cuc (' + t2 + ' ca)', d2 === t2, s2.slice(0, 3).join(' | '));
  kiem('vật sắt phía SAU xe hay bên hông: không hút', (() => {
    const k1 = chay(dat1(trong(7), 3, 5, 'o'), { x: 3, y: 3, huong: 0 }, N, { vatChat: dat1(trong(7), 3, 5, 's') });
    const k2 = chay(dat1(trong(7), 4, 3, 'o'), { x: 3, y: 3, huong: 0 }, N, { vatChat: dat1(trong(7), 4, 3, 's') });
    return k1.namCham.cam === null && k2.namCham.cam === null;
  })());

  // tường chắn
  const t1 = chay(dat1(dat1(trong(7), 3, 2, '#'), 3, 1, 'o'), { x: 3, y: 3, huong: 0 }, N, { vatChat: dat1(trong(7), 3, 1, 's') });
  kiem('tường ở ô 1 chắn vật sắt ở ô 2: không hút (và không hut-go: tường không phải vật gỗ)', t1.namCham.cam === null && ev(t1, 'hut-vat').length === 0 && maSK(t1, 'hut-go').length === 0);
  const t2b = chay(dat1(dat1(trong(7), 3, 1, '#'), 3, 2, 'o'), { x: 3, y: 3, huong: 0 }, N, { vatChat: dat1(trong(7), 3, 2, 's') });
  kiem('tường ở ô 2, vật sắt ở ô 1: tường đứng SAU vật nên không cản, vật vẫn bị hút', t2b.namCham.cam === 1);
  const s1 = chay(dat1(dat1(trong(7), 3, 2, 'S'), 3, 1, 'o'), { x: 3, y: 3, huong: 0 }, N, { vatChat: dat1(trong(7), 3, 1, 's') });
  kiem('bậc thang S ở ô 1 KHÔNG chắn: vật sắt ở ô 2 vẫn bị hút (hút xuyên qua bậc thang)', s1.namCham.cam === 1 && ev(s1, 'hut-vat')[0].soO === 1);
  kiem('vật sắt đặt trên ô bậc thang S (khai bằng cfg.vat vì ô S không viết được ký hiệu o): hút được, vật về ô xe', (() => {
    const k = chay(dat1(trong(7), 3, 2, 'S'), { x: 3, y: 4, huong: 0 }, N, { vat: [{ x: 3, y: 2, chat: 'sat' }] });
    return k.namCham.cam === 1 && k.vat[0].x === 3 && k.vat[0].y === 4;
  })());

  // gỗ
  const g1 = chay(dat1(trong(7), 3, 2, 'o'), { x: 3, y: 3, huong: 0 }, N);
  kiem('vật gỗ (mặc định) ở ô 1: cực nào cũng không tương tác, ghi hut-go { id, o, khoang 1 }', g1.namCham.cam === null && maSK(g1, 'hut-go').length === 1 && maSK(g1, 'hut-go')[0].khoang === 1 && maSK(g1, 'hut-go')[0].o.y === 2 && maSK(g1, 'hut-go')[0].id === 1 && vatCua(g1, 1).y === 2, J(g1.suKien));
  const g1s = chay(dat1(trong(7), 3, 2, 'o'), { x: 3, y: 3, huong: 0 }, S);
  kiem('vật gỗ với cực S cũng thế: không hút, không đẩy, nằm yên', g1s.namCham.cam === null && vatCua(g1s, 1).y === 2 && maSK(g1s, 'hut-go').length === 1);
  const g2 = chay(dat1(trong(7), 3, 1, 'o'), { x: 3, y: 3, huong: 0 }, N);
  kiem('vật gỗ ở ô 2: không hút, hut-go khoang 2', g2.namCham.cam === null && maSK(g2, 'hut-go')[0].khoang === 2);
  kiem('vật gỗ khai tường minh chat "go" (cfg.vat) giống mặc định', (() => {
    const k = chay(trong(7), { x: 3, y: 3, huong: 0 }, N, { vat: [{ x: 3, y: 2, chat: 'go' }] });
    return k.namCham.cam === null && maSK(k, 'hut-go').length === 1;
  })());
  // (vật đánh số theo thứ tự đọc từng hàng: vật ở hàng trên có id nhỏ hơn)
  const g3 = chay(dat1(dat1(trong(7), 3, 2, 'o'), 3, 1, 'o'), { x: 3, y: 3, huong: 0 }, N, { vatChat: dat1(trong(7), 3, 1, 's') });
  kiem('gỗ ở ô 1 CHẮN sắt ở ô 2 (id 1 = sắt ở ô 2, id 2 = gỗ ở ô 1): không hút, hut-go nói vật gỗ id 2', g3.namCham.cam === null && maSK(g3, 'hut-go').length === 1 && maSK(g3, 'hut-go')[0].id === 2);
  const g3b = chay(dat1(dat1(trong(7), 3, 2, 'o'), 3, 0, 'o'), { x: 3, y: 3, huong: 0 }, S, { vatChat: dat1(trong(7), 3, 0, 'N') });
  kiem('gỗ ở ô 1 chắn cả vật NAM CHÂM ở ô 3: khác cực mà không hút được', g3b.namCham.cam === null && maSK(g3b, 'hut-go').length === 1 && vatCua(g3b, 1).y === 0);
  const g4 = chay(dat1(dat1(trong(7), 3, 2, 'o'), 3, 1, 'o'), { x: 3, y: 3, huong: 0 }, N, { vatChat: dat1(trong(7), 3, 2, 's') });
  kiem('sắt ở ô 1 (id 2), gỗ ở ô 2 (id 1): hút sắt, gỗ đứng sau không cản, không hut-go', g4.namCham.cam === 2 && maSK(g4, 'hut-go').length === 0);
  const g5 = chay(trong(7), { x: 3, y: 3, huong: 0 }, N);
  kiem('không có vật nào trong tầm: không hút, không hut-go', g5.namCham.cam === null && maSK(g5, 'hut-go').length === 0 && ev(g5, 'hut-vat').length === 0);

  // vật gần nhất trước, mỗi lần một vật
  const hai = dat1(dat1(trong(7), 3, 2, 'o'), 3, 1, 'o'), haiSat = dat1(dat1(trong(7), 3, 2, 's'), 3, 1, 's');
  const n1 = chay(hai, { x: 3, y: 3, huong: 0 }, N, { vatChat: haiSat });
  kiem('hai vật sắt ở ô 1 (id 2) và ô 2 (id 1): hút vật GẦN NHẤT (id 2), vật ở ô 2 nằm yên', n1.namCham.cam === 2 && vatCua(n1, 1).trangThai === 'dat' && vatCua(n1, 1).y === 1 && ev(n1, 'hut-vat').length === 1, J(n1.vat));
  const n2 = chay(hai, { x: 3, y: 3, huong: 0 }, L(N, 'wait()', 'wait()'), { vatChat: haiSat });
  kiem('đang dính một vật thì không hút thêm dù còn vật sắt trong tầm (nhiều nhịp)', n2.namCham.cam === 2 && ev(n2, 'hut-vat').length === 1 && vatCua(n2, 1).trangThai === 'dat');
  const n3 = chay(hai, { x: 3, y: 3, huong: 0 }, L(N, 'magnet_off()', 'wait()', 'magnet_n()', 'wait()'), { vatChat: haiSat });
  kiem('thả vật gần rồi bật lại: vật vừa thả nằm ở ô 1 nên được hút lại đúng vật đó (id 2), không phải vật ở ô 2', n3.namCham.cam === 2 && ev(n3, 'hut-vat').length === 2);
  kiem('nam châm tắt: không hút, không đẩy gì dù vật sắt hay vật nam châm sát mặt', (() => {
    const k = chay(dat1(trong(7), 3, 2, 'o'), { x: 3, y: 3, huong: 0 }, 'wait()', { vatChat: dat1(trong(7), 3, 2, 's') });
    const k2 = chay(dat1(trong(7), 3, 2, 'o'), { x: 3, y: 3, huong: 0 }, 'wait()', { vatChat: dat1(trong(7), 3, 2, 'N') });
    return k.namCham.bat === false && k.namCham.cuc === null && k.namCham.cam === null && vatCua(k, 1).trangThai === 'dat' && vatCua(k2, 1).y === 2 && ev(k2, 'day-vat').length === 0;
  })());
  const du = chay(dat1(trong(7), 3, 3, 'o'), { x: 3, y: 3, huong: 0 }, N, { vatChat: dat1(trong(7), 3, 3, 's') });
  kiem('vật sắt nằm ngay dưới xe: không hút (chỉ hút vật trước mặt)', du.namCham.cam === null);
}

/* ============================================================================ 2. CỰC: KHÁC CỰC HÚT, CÙNG CỰC ĐẨY */
console.log('\n== 2. Cực: khác cực hút, cùng cực đẩy (trượt tối đa 3 ô, dừng trước vật cản); sắt KHÔNG BAO GIỜ bị đẩy ==');
{
  // bảng 2×2
  const bang = [['N', N, 'day'], ['N', S, 'hut'], ['S', S, 'day'], ['S', N, 'hut']];
  kiem('bảng cực (xe, vật ở ô 2): tay N + vật N → ĐẨY; tay S + vật N → HÚT; tay S + vật S → ĐẨY; tay N + vật S → HÚT', bang.every(([chu, lenh, kq]) => {
    const k = mot(0, 2, chu, { code: lenh });
    return kq === 'hut' ? k.namCham.cam === 1 && ev(k, 'hut-vat').length === 1 && ev(k, 'day-vat').length === 0
      : k.namCham.cam === null && ev(k, 'day-vat').length === 1 && ev(k, 'hut-vat').length === 0 && vatCua(k, 1).trangThai === 'dat';
  }));
  // đẩy: bốn hướng, vật ở ô d (1..3), đi ra xa, trượt đúng 3 ô nếu thoáng
  let tong = 0, dung = 0; const sai = [];
  for (const h of [0, 1, 2, 3]) for (const d of [1, 2, 3]) {
    const xe = { x: 3, y: 3, huong: h }, v = VEC[h];
    const vx = 3 + v[0] * d, vy = 3 + v[1] * d;
    const rong = 13;                                          // sân rộng 13×13, xe ở giữa (6,6): vật trượt đủ 3 ô ở mọi hướng và mọi khoảng cách 1–3
    const rows = Array.from({ length: rong }, () => '.'.repeat(rong));
    const xx = 6 + v[0] * d, yy = 6 + v[1] * d;
    const k = chay(dat1(rows, xx, yy, 'o'), { x: 6, y: 6, huong: h }, N, { vatChat: dat1(rows, xx, yy, 'N') });
    tong++;
    const e = ev(k, 'day-vat')[0], vc = vatCua(k, 1);
    const ok = e && e.soO === 3 && e.chan === null && e.tu.x === xx && e.tu.y === yy && vc.x === xx + 3 * v[0] && vc.y === yy + 3 * v[1] && vc.trangThai === 'dat' && k.namCham.cam === null && !e.tuMui && e.cuc === 'N';
    if (ok) dung++; else sai.push('h' + h + '/d' + d + ':' + J([e, vc]));
  }
  kiem('đẩy vật nam châm cùng cực, ở ô 1, 2 hay 3, bốn hướng, sân thoáng: vật trượt thẳng RA XA xe đúng 3 ô (day-vat soO 3, chan null), nằm yên (' + tong + ' ca)', dung === tong, sai.slice(0, 2).join(' | '));
  // dừng trước vật cản
  // xe (3,5) quay lên, vật nam châm chữ N ở (3,3) (cách 2 ô); vật cản đặt ở (3,y); vật nam châm đánh số theo thứ tự đọc từng hàng
  const co = (y, ch) => chay(dat1(dat1(trong(7), 3, 3, 'o'), 3, y, ch), { x: 3, y: 5, huong: 0 }, N, { vatChat: dat1(trong(7), 3, 3, 'N') });
  const idNC = (k) => k.vat.find((v) => v.chat === 'nam-cham').id;
  const chanLai = (ch, soO, lyDo) => { const k = co(3 - soO - 1, ch); const e = ev(k, 'day-vat')[0]; const v = k.vat.find((q) => q.id === idNC(k)); return e && e.soO === soO && e.chan === lyDo && v.y === 3 - soO; };
  kiem('vật nam châm ở (3,3) bị đẩy lên: tường ở ô thứ 3 sau vật → trượt 2 ô (chan "tuong"); tường ở ô thứ 2 → trượt 1 ô; tường ngay sau vật → không nhúc nhích (day-bi-chan, lyDo "tuong", không day-vat)',
    chanLai('#', 2, 'tuong') && chanLai('#', 1, 'tuong') && (() => { const k = co(2, '#'); return maSK(k, 'day-bi-chan').length >= 1 && maSK(k, 'day-bi-chan')[0].lyDo === 'tuong' && !ev(k, 'day-vat').length && k.vat.find((q) => q.chat === 'nam-cham').y === 3; })());
  const ngoai = chay(dat1(trong(5), 2, 1, 'o'), { x: 2, y: 3, huong: 0 }, N, { vatChat: dat1(trong(5), 2, 1, 'N') });
  kiem('đẩy tới mép sân: vật dừng ở hàng trên cùng (soO 1, chan "ngoai-san")', ev(ngoai, 'day-vat')[0].soO === 1 && ev(ngoai, 'day-vat')[0].chan === 'ngoai-san' && vatCua(ngoai, 1).y === 0);
  kiem('dừng trước BẬC THANG S, HÀNG RÀO =, vật khác (gỗ), vật sắt: mỗi thứ chặn vật trượt (trượt 2 ô, chan đúng lý do)', [['S', 'bac-thang'], ['=', 'rao']].every(([ch, ly]) => chanLai(ch, 2, ly)) &&
    [['g', 'vat'], ['s', 'vat']].every(([c, ly]) => { const k = chay(dat1(dat1(trong(7), 3, 3, 'o'), 3, 0, 'o'), { x: 3, y: 5, huong: 0 }, N, { vatChat: dat1(dat1(trong(7), 3, 3, 'N'), 3, 0, c === 's' ? 's' : '.') }); const e = ev(k, 'day-vat')[0]; return e && e.soO === 2 && e.chan === ly && k.vat.find((q) => q.chat === 'nam-cham').y === 1 && k.vat.find((q) => q.y === 0).y === 0; }));
  // SẮT KHÔNG BAO GIỜ BỊ ĐẨY
  kiem('SẮT không bao giờ bị đẩy: với cực N hay S, ở ô 1, 2 (hút) hay 3 (ngoài tầm), bốn hướng, vật sắt không bao giờ ra xa xe hơn lúc đầu (không có sự kiện day-vat)', (() => {
    let ok = true;
    for (const h of [0, 1, 2, 3]) for (const d of [1, 2, 3]) for (const code of [N, S]) {
      const k = mot(h, d, 's', { code });
      const v0 = { x: 3 + VEC[h][0] * d, y: 3 + VEC[h][1] * d }, v1 = vatCua(k, 1);
      const xa = (p) => Math.abs(p.x - 3) + Math.abs(p.y - 3);
      if (ev(k, 'day-vat').length || xa(v1) > xa(v0)) ok = false;
    }
    return ok;
  })());
  // mỗi nhịp nam châm còn bật thì hút / đẩy tiếp
  const lien = chay(trong(9).map((r, i) => (i === 6 ? r : r)), { x: 4, y: 8, huong: 0 }, L(N, 'wait()', 'wait()'), { vat: [{ x: 4, y: 7, chat: 'nam-cham', cuc: 'N' }] });
  kiem('đẩy trượt ra khỏi tầm 3 ô (ô 4 trở đi) thì nam châm bật cũng hết tác dụng: hai nhịp, chỉ một day-vat', ev(lien, 'day-vat').length === 1 && vatCua(lien, 1).y === 4);
  const dai = chay(trong(9), { x: 4, y: 8, huong: 0 }, L(N, TIEN), { vat: [{ x: 4, y: 7, chat: 'nam-cham', cuc: 'N' }] });
  kiem('nam châm BẬT mà xe tiến: vật ở ô 1 bị đẩy ra 3 ô (nhịp 1), xe tiến một ô thì vật lại vào tầm (ô 3) và bị đá thêm (nhịp 2): "xe ủi vật đi trước"', ev(dai, 'day-vat').length === 2 && vatCua(dai, 1).y === 1, J(nhipVet(dai).map((n) => n.vat[0].y)));
  const yen = chay(trong(9), { x: 4, y: 8, huong: 0 }, L(N, 'magnet_off()', 'wait()', TIEN), { vat: [{ x: 4, y: 7, chat: 'nam-cham', cuc: 'N' }] });
  kiem('ngắt điện rồi tiến: vật nằm yên (xe tiến tới sát vật rồi đứng lại)', ev(yen, 'day-vat').length === 1 && vatCua(yen, 1).y === 4);
  // vật gần nhất quyết định; sắt đứng sau vật nam châm không bị đẩy theo, vật đứng sau vật cản không bị đẩy
  const hh = chay(dat1(dat1(trong(7), 3, 2, 'o'), 3, 1, 'o'), { x: 3, y: 4, huong: 0 }, N, { vatChat: dat1(dat1(trong(7), 3, 2, 'N'), 3, 1, 's') });
  kiem('vật nam châm ở ô 2, vật sắt ngay sau nó (ô 3): vật nam châm (gần nhất) bị đẩy nhưng sát sắt nên không nhúc nhích (day-bi-chan, lyDo "vat"); sắt đứng yên (không bao giờ bị đẩy theo)',
    !ev(hh, 'day-vat').length && maSK(hh, 'day-bi-chan').length >= 1 && maSK(hh, 'day-bi-chan')[0].lyDo === 'vat' && hh.vat.find((q) => q.chat === 'nam-cham').y === 2 && hh.vat.find((q) => q.chat === 'sat').y === 1, J(hh.suKien.map((e) => e.ma)));
  // vật nam châm bị đẩy lên ô đích, vẫn tính vật cần về đích khi nằm đó
  const dc = SanHoc.chay({ san: ['.....', '.....', '..D#.', '.....', '..o..', '.....'].map((r, i) => (i === 1 ? '..#..' : r)), batDau: { x: 2, y: 5, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat', vatCan: 'nam-cham', vatChat: ['.....', '.....', '.....', '.....', '..N..', '.....'] }, N);
  kiem('đẩy vật nam châm vào đích rồi dừng ở đó (tường ngay sau đích): thắng ngay cuối nhịp đẩy (xong-dua-vat)', dc.thang === true && ev(dc, 'xong-dua-vat').length === 1 && dc.nhip === 1, J([dc.thang, dc.vat]));
  const traDich = SanHoc.chay({ san: ['.....', '..D..', '.....', '.....', '..o..', '.....'], batDau: { x: 2, y: 5, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat', vatCan: 'nam-cham', vatChat: ['.....', '.....', '.....', '.....', '..N..', '.....'] }, N);
  kiem('vật trượt QUA ô đích mà không dừng ở đó thì không tính (đích ở (2,1), vật trượt từ (2,4) tới (2,1)? nó dừng đúng 3 ô = (2,1): tính)', traDich.thang === true);
  const quaDich = SanHoc.chay({ san: ['.....', '.....', '..D..', '.....', '..o..', '.....'], batDau: { x: 2, y: 5, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat', vatCan: 'nam-cham', vatChat: ['.....', '.....', '.....', '.....', '..N..', '.....'] }, N);
  kiem('vật trượt 3 ô qua đích (2,2) rồi dừng ở (2,1): chưa thắng (trượt không dừng ở đích)', quaDich.thang === false && vatCua(quaDich, 1).y === 1);
}

/* ============================================================================ 3. VẬT ĐANG DÍNH KHI ĐỔI CỰC */
console.log('\n== 3. Vật dính: đi theo xe; đổi cực — sắt vẫn dính, vật nam châm cùng cực bị bắn ra; magnet_off thả không trượt ==');
{
  const rowsS = dat1(trong(7), 3, 1, 'o'), chS = dat1(trong(7), 3, 1, 's');
  const bd = { x: 3, y: 3, huong: 0 };
  const k = chay(rowsS, bd, L(N, TIEN, PHAI, TIEN), { vatChat: chS });
  const nv = nhipVet(k);
  kiem('hút ở nhịp 1 (vật cách 2 ô); xe tiến, rẽ phải, tiến: vật luôn ở ô xe (x, y của vật = x, y của xe), trangThai "cam", vết nhịp có robot.namCham { bat, cuc, cam }',
    nv.length === 4 && nv.every((n) => n.vat[0].trangThai === 'cam' && n.vat[0].x === n.robot.x && n.vat[0].y === n.robot.y && n.robot.namCham.cam === 1 && n.robot.namCham.bat === true && n.robot.namCham.cuc === 'N'), J(nv.map((n) => [n.robot, n.vat[0]])));
  kiem('vết nhịp của robot có tay nam châm có vat với trường chat; vật nam châm có thêm cuc; robot khác thì vật sắt vẫn có chat sat, vật gỗ không có trường chat', nv[0].vat[0].chat === 'sat' && !('cuc' in nv[0].vat[0]) && (() => {
    const c = SanHoc.chay({ san: ['o.D', '...'], batDau: { x: 0, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release']), mucTieu: 'dua-vat', vatChat: ['s..', '...'] }, 'wait()');
    const c2 = SanHoc.chay({ san: ['o.D', '...'], batDau: { x: 0, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release']), mucTieu: 'dua-vat' }, 'wait()');
    const c3 = chay(dat1(trong(5), 2, 1, 'o'), { x: 2, y: 3, huong: 0 }, 'wait()', { vatChat: dat1(trong(5), 2, 1, 'N') });
    return nhipVet(c)[0].vat[0].chat === 'sat' && !('chat' in nhipVet(c2)[0].vat[0]) && nhipVet(c3)[0].vat[0].chat === 'nam-cham' && nhipVet(c3)[0].vat[0].cuc === 'N';
  })());
  // đổi cực khi dính sắt
  const dsat = chay(rowsS, bd, L(N, S, 'wait()'), { vatChat: chS });
  kiem('đang dính SẮT mà đổi sang cực kia: vẫn dính (không bị bắn ra, không bị đẩy), ghi sat-khong-day (thông tin) một lần; cực đổi thật', dsat.namCham.cam === 1 && dsat.namCham.cuc === 'S' && maSK(dsat, 'sat-khong-day').length === 1 && maSK(dsat, 'sat-khong-day')[0].cuc === 'S' && ev(dsat, 'day-vat').length === 0 && vatCua(dsat, 1).trangThai === 'cam', J(dsat.suKien.map((e) => e.ma)));
  kiem('đổi cực mà vẫn cùng cực (bật N hai lần) khi dính sắt: không có sat-khong-day', maSK(chay(rowsS, bd, L(N, N, 'wait()'), { vatChat: chS }), 'sat-khong-day').length === 0);
  // vật nam châm dính rồi đổi cực
  const rowsN = dat1(trong(7), 3, 1, 'o'), chN = dat1(trong(7), 3, 1, 'N');
  const dN = chay(rowsN, bd, L(S, 'magnet_s()', 'wait()'), { vatChat: chN });
  kiem('đang dính vật nam châm chữ N bằng cực S; bật lại cực S: vẫn dính', dN.namCham.cam === 1 && ev(dN, 'day-vat').length === 0);
  const ban = chay(rowsN, bd, L(S, N), { vatChat: chN });
  const eb = ev(ban, 'day-vat')[0];
  kiem('đang dính vật chữ N (bằng cực S) mà đổi sang cực N: vật BỊ BẮN RA — rời mũi xe, rơi xuống ô sát mũi (3,2) rồi trượt tới mép sân (day-vat tuMui true, soO 2, chan "ngoai-san"); xe không dính gì nữa',
    ban.namCham.cam === null && eb && eb.tuMui === true && eb.tu.x === 3 && eb.tu.y === 2 && eb.soO === 2 && eb.chan === 'ngoai-san' && vatCua(ban, 1).trangThai === 'dat' && vatCua(ban, 1).y === 0 && ban.namCham.cuc === 'N', J([eb, ban.vat]));
  const ban2 = chay(dat1(trong(9), 4, 4, 'o'), { x: 4, y: 7, huong: 0 }, L(S, 'wait()', N), { vatChat: dat1(trong(9), 4, 4, 'N') });
  kiem('bắn ra giữa sân thoáng: xe (4,7), vật hút về dính rồi bị bắn: rơi xuống ô sát mũi (4,6) và trượt thêm đúng 3 ô tới (4,3); tổng cộng vật đi ra xa hơn lúc đầu', vatCua(ban2, 1).y === 3 && ev(ban2, 'day-vat')[0].soO === 3, J(ban2.vat));
  const banChan = chay(dat1(dat1(trong(7), 3, 2, 'S'), 3, 1, 'o'), { x: 3, y: 3, huong: 0 }, L(S, N), { vatChat: dat1(trong(7), 3, 1, 'N') });
  kiem('ô sát mũi bị chặn (bậc thang) thì vật dính không bắn ra được: day-bi-chan { tuMui true }, vật vẫn dính', banChan.namCham.cam === 1 && maSK(banChan, 'day-bi-chan').some((e) => e.tuMui === true) && vatCua(banChan, 1).trangThai === 'cam');
  const thaNC = chay(rowsN, bd, L(S, 'magnet_off()', 'wait()'), { vatChat: chN });
  kiem('magnet_off() thả vật nam châm xuống ô sát mũi (3,2), KHÔNG trượt, nam châm tắt (cuc null)', thaNC.namCham.cam === null && thaNC.namCham.cuc === null && thaNC.namCham.bat === false && vatCua(thaNC, 1).y === 2 && ev(thaNC, 'day-vat').length === 0 && ev(thaNC, 'tha-vat').length === 1);
  const quay = chay(rowsN, bd, L(S, PHAI, 'magnet_n()', 'wait()'), { vatChat: chN });
  kiem('đang dính, quay phải rồi đổi sang cực cùng chữ: vật bắn theo hướng mặt MỚI (sang phải): rơi ở (4,3) rồi trượt tới (6,3)', ev(quay, 'day-vat')[0].den.x === 6 && vatCua(quay, 1).x === 6 && vatCua(quay, 1).y === 3, J(ev(quay, 'day-vat')));
  // băng chuyền đẩy xe mang theo vật
  const rowsC = ['.>.o...'].concat(Array(6).fill('.......'));
  const chC = ['...s...'].concat(Array(6).fill('.......'));
  const c = chay(rowsC, { x: 1, y: 0, huong: 1 }, L('magnet_n()', 'wait()', 'wait()'), { vatChat: chC });
  kiem('xe đứng trên băng 2 nhịp bị đẩy 1 ô sang phải, vật dính (hút ở nhịp 1 khi vật cách 2 ô) đi theo: cuối cùng vật ở ô của xe', c.robot.x === 2 && c.namCham.cam === 1 && vatCua(c, 1).x === 2 && vatCua(c, 1).y === 0 && ev(c, 'hut-vat').length === 1, J([c.robot, c.vat]));
  const rowsBang = ['.>>....'].concat(Array(6).fill('.......'));
  const tb = chay(rowsBang, { x: 6, y: 1, huong: 0 }, L('wait()', 'wait()', 'wait()', 'wait()'), { vat: [{ x: 1, y: 0, chat: 'sat' }] });
  kiem('vật nằm trên băng chuyền không trôi (luật chung: vật dưới đất không bị băng kéo)', tb.vat[0].x === 1 && tb.vat[0].y === 0 && tb.nhip === 4);
  const hb = chay(rowsBang, { x: 1, y: 2, huong: 0 }, N, { vat: [{ x: 1, y: 0, chat: 'sat' }] });
  kiem('vật sắt đặt trên ô băng chuyền (cfg.vat) vẫn hút được; vật rời băng, về ô xe', hb.namCham.cam === 1 && hb.vat[0].x === 1 && hb.vat[0].y === 2);
  const trBang = chay(['.>>....'].concat(Array(6).fill('.......')), { x: 0, y: 1, huong: 0 }, N, { vat: [{ x: 1, y: 0, chat: 'nam-cham', cuc: 'N' }] });
  kiem('vật nam châm bị đẩy trượt qua ô băng chuyền: băng không kéo nó (vật nằm yên ở ô rơi)', (() => { const e = ev(trBang, 'day-vat'); return e.length === 0 || vatCua(trBang, 1).trangThai === 'dat'; })());
}

/* ============================================================================ 4. THẢ */
console.log('\n== 4. magnet_off(): thả xuống ô trước mũi; bị chặn thì vẫn dính (tha-bi-chan) ==');
{
  const base = (extra) => Object.assign({ vatChat: dat1(trong(7), 3, 2, 's') }, extra || {});
  const rows = dat1(trong(7), 3, 2, 'o');
  const bd = { x: 3, y: 3, huong: 0 };
  const t0 = chay(rows, { x: 3, y: 4, huong: 0 }, L(N, 'wait()') + L('left_back()', 'right_back()', 'wait()') + THA, base());
  kiem('thả khi ô trước mũi trống: tha-vat { den }, vật nằm yên (dat) đúng ô, cam null, cuc null', t0.namCham.cam === null && t0.namCham.bat === false && t0.namCham.cuc === null && ev(t0, 'tha-vat').length === 1 && vatCua(t0, 1).trangThai === 'dat', J(t0.suKien.map((e) => e.ma)));
  const t1 = chay(rows, bd, L('magnet_n()', 'wait()', 'magnet_off()', 'wait()'), base({}));
  kiem('hút rồi thả liền: vật rơi lại ô trước mũi (3,2), không phải ô lạ', vatCua(t1, 1).x === 3 && vatCua(t1, 1).y === 2 && vatCua(t1, 1).trangThai === 'dat');
  const t2 = chay(trong(7), bd, THA);
  kiem('magnet_off() khi chưa dính gì: tắt nam châm, không sự kiện gì', t2.namCham.bat === false && ev(t2, 'tha-vat').length === 0 && maSK(t2, 'tha-bi-chan').length === 0);
  const chan = (rowsC, xe, ten, ly) => {
    const code = L(N, ...xe.truoc, THA);
    const k = chay(rowsC, xe.bd, code, { vatChat: xe.chat });
    const e = maSK(k, 'tha-bi-chan')[0];
    kiem(ten, e && e.vat === ly && e.nhip === k.nhip && k.namCham.cam === 1 && k.namCham.bat === true && vatCua(k, 1).trangThai === 'cam' && ev(k, 'tha-vat').length === 0, J(k.suKien));
    return k;
  };
  const tu = dat1(dat1(trong(7), 3, 1, 'o'), 4, 3, '#');
  chan(tu, { bd, chat: dat1(trong(7), 3, 1, 's'), truoc: [PHAI.trim()] }, 'thả khi trước mũi là TƯỜNG: tha-bi-chan (vat "tuong"), vật vẫn dính, nam châm vẫn bật', 'tuong');
  chan(dat1(trong(7), 3, 0, 'o'), { bd: { x: 3, y: 2, huong: 0 }, chat: dat1(trong(7), 3, 0, 's'), truoc: [TIEN.trim(), TIEN.trim()] }, 'thả khi trước mũi là MÉP SÂN (xe ở hàng trên cùng, quay lên): tha-bi-chan (vat "ngoai-san")', 'ngoai-san');
  chan(dat1(dat1(trong(7), 3, 1, 'o'), 4, 3, 'S'), { bd, chat: dat1(trong(7), 3, 1, 's'), truoc: [PHAI.trim()] }, 'thả khi trước mũi là BẬC THANG: tha-bi-chan (vat "bac-thang")', 'bac-thang');
  chan(dat1(dat1(trong(7), 3, 1, 'o'), 4, 3, 'o'), { bd, chat: dat1(trong(7), 3, 1, 's'), truoc: [PHAI.trim()] }, 'thả khi trước mũi đã có một vật nằm sẵn (gỗ): tha-bi-chan (vat "vat"), mỗi ô một vật', 'vat');
  const sau = chay(tu, bd, L(N, PHAI, THA, TRAI, TRAI, THA), { vatChat: dat1(trong(7), 3, 1, 's') });
  kiem('bị chặn rồi quay sang ô trống và thả lại: thả được (tha-vat), cam null, nam châm tắt', maSK(sau, 'tha-bi-chan').length === 1 && ev(sau, 'tha-vat').length === 1 && sau.namCham.cam === null && sau.namCham.bat === false, J(sau.suKien.map((e) => e.ma)));
  const winOk = chay(['.o.', '.D.', '...'], { x: 1, y: 2, huong: 0 }, L(N, 'magnet_off()', 'wait()'), { mucTieu: 'dua-vat', vatCan: 'sat', vatChat: ['.s.', '...', '...'] });
  kiem('xe ở (1,2), vật (1,0) bị hút, đích (1,1) ngay trước mũi: thả → thắng, đúng 2 nhịp, sự kiện xong-dua-vat', winOk.thang && winOk.nhip === 2 && ev(winOk, 'xong-dua-vat').length === 1, J([winOk.thang, winOk.nhip]));
  const dangDinh = chay(['.o.', '.D.', '...'], { x: 1, y: 2, huong: 0 }, N, { mucTieu: 'dua-vat', vatCan: 'sat', vatChat: ['.s.', '...', '...'] });
  kiem('vật đang dính (ở mũi xe) trên ô trước đích thì chưa tính: chưa thắng', !dangDinh.thang);
  const tt = chay(['.o.', '...', '.D.', '...'], { x: 1, y: 2, huong: 0 }, L(N, 'magnet_off()', 'left_move()', 'right_move()', 'wait()'), { vatChat: ['.s.', '...', '...', '...'], mucTieu: 'dua-vat', vatCan: 'sat' });
  kiem('thả chung nhịp với lệnh đi: thả TRƯỚC (xuống ô trước mũi cũ (1,1)), rồi xe mới đi: vật vừa thả chiếm ô nên xe đâm vật (dam-tuong, vat "vat"), đứng yên ở (1,2)', vatCua(tt, 1).x === 1 && vatCua(tt, 1).y === 1 && vatCua(tt, 1).trangThai === 'dat' && tt.robot.y === 2 && tt.namCham.cam === null && maSK(tt, 'dam-tuong').length === 1 && maSK(tt, 'dam-tuong')[0].vat === 'vat', J([tt.robot, tt.vat, maSK(tt, 'dam-tuong')]));
}

/* ============================================================================ 5. THỨ TỰ LỆNH, GỘP NHỊP, QUÊN WAIT */
console.log('\n== 5. Thứ tự lệnh trong nhịp, gộp nhịp, quên wait(), gọi lại ==');
{
  const rows = dat1(trong(7), 3, 0, 'o'), chat = dat1(trong(7), 3, 0, 's');
  const g = chay(rows, { x: 3, y: 3, huong: 0 }, L('magnet_n()', TIEN), { vatChat: chat });
  kiem('magnet_n() chung nhịp với một bước đi: một nhịp, hút ở CUỐI nhịp sau khi xe đã đi (vật từ cách 3 ô còn cách 2 ô nên bị hút)', g.nhip === 1 && g.namCham.cam === 1 && g.robot.y === 2, J([g.nhip, g.namCham, g.robot]));
  const g2 = chay(rows, { x: 3, y: 3, huong: 0 }, L(N, TIEN), { vatChat: chat });
  kiem('nếu magnet_n() có wait() riêng thì một nhịp tốn thêm: hai nhịp, vật sắt chưa trong tầm ở nhịp 1 nhưng bị hút ở nhịp 2', g2.nhip === 2 && g2.namCham.cam === 1 && nhipVet(g2)[0].robot.namCham.cam === null);
  const q = chay(rows, { x: 3, y: 3, huong: 0 }, 'magnet_s()');
  kiem('quên wait(): lệnh không chạy, quen-wait liệt kê magnet_s, nam châm vẫn tắt', maSK(q, 'quen-wait').length === 1 && maSK(q, 'quen-wait')[0].lenh[0].ten === 'magnet_s' && q.namCham.bat === false && q.nhip === 0);
  const gl = chay(rows, { x: 3, y: 3, huong: 0 }, L('magnet_n()', 'magnet_s()', 'wait()'));
  kiem('hai lệnh nam châm cùng nhịp: lệnh sau bị bỏ (magnet-goi-lai { ten, dongPy, truoc }), cực N đã đặt', maSK(gl, 'magnet-goi-lai').length === 1 && maSK(gl, 'magnet-goi-lai')[0].ten === 'magnet_s' && maSK(gl, 'magnet-goi-lai')[0].truoc.ten === 'magnet_n' && gl.namCham.cuc === 'N', J(gl.suKien));
  const gl2 = chay(rows, { x: 3, y: 3, huong: 0 }, L('magnet_n()', 'wait()', 'magnet_s()', 'wait()'));
  kiem('bật N rồi bật S ở hai nhịp khác nhau: không phải gọi lại, cực đổi sang S', maSK(gl2, 'magnet-goi-lai').length === 0 && gl2.namCham.cuc === 'S');
  const bw = chay(rows, { x: 3, y: 3, huong: 0 }, L('magnet_n()', 'wait()', 'magnet_off()'));
  kiem('wait rồi lại ra lệnh không wait → quen-wait', maSK(bw, 'quen-wait').length === 1 && bw.namCham.bat === true);
  const lt = chay(rows, { x: 3, y: 3, huong: 0 }, L('magnet_n()', 'left_move()', 'wait()'));
  kiem('lệnh nam châm không chiếm bánh: magnet_n() cùng left_move() không banh-goi-lai', maSK(lt, 'banh-goi-lai').length === 0 && lt.namCham.bat === true && lt.robot.huong === 1);
  kiem('vết lệnh có mục lệnh magnet_n / magnet_off với dongPy', (() => {
    const v = chay(rows, { x: 3, y: 3, huong: 0 }, L('wait()', 'magnet_n()', 'wait()', 'magnet_off()', 'wait()')).vet.filter((e) => e.loai === 'lenh' && /^magnet/.test(e.ten));
    return v.length === 2 && v[0].dongPy === 2 && v[1].dongPy === 4;
  })());
}

/* ============================================================================ 6. LOẠI ROBOT */
console.log('\n== 6. Omni và xích có nam châm; không có tay nam châm; nhện; xung đột tay; tên lệnh ==');
{
  const rows = dat1(dat1(trong(7), 1, 2, 'o'), 5, 4, 'D'), chat = dat1(trong(7), 1, 2, 's');
  const om = SanHoc.chay({ san: rows, batDau: { x: 1, y: 4, huong: 0 }, loaiRobot: 'omni', hamGoc: OMNI.concat(NC), mucTieu: 'dua-vat', vatCan: 'sat', vatChat: chat },
    L(N, 'slide_right()', 'wait()', 'slide_right()', 'wait()', 'slide_right()', 'wait()', 'slide_right()', 'wait()', 'magnet_off()', 'wait()'));
  kiem('omni: hút (cách 2 ô), trượt phải 4 lần giữ hướng mặt, vật dính theo, thả xuống ô trước mũi (5,3)', om.namCham.cam === null && vatCua(om, 1).trangThai === 'dat' && vatCua(om, 1).x === 5 && vatCua(om, 1).y === 3 && om.robot.huong === 0, J([om.robot, om.vat]));
  const om2 = SanHoc.chay({ san: ['...', '.o.', '...', '...'], batDau: { x: 1, y: 3, huong: 0 }, loaiRobot: 'omni', hamGoc: OMNI.concat(NC), vatChat: ['...', '.s.', '...', '...'] }, L('magnet_n()', 'slide_right()', 'wait()'));
  kiem('omni: magnet_n() chung nhịp với slide_right(): trượt xong cột mới không có vật nên không hút', om2.namCham.cam === null && om2.robot.x === 2);
  const om3 = SanHoc.chay({ san: ['...', '.o.', '...', '...'], batDau: { x: 0, y: 3, huong: 0 }, loaiRobot: 'omni', hamGoc: OMNI.concat(NC), vatChat: ['...', '.s.', '...', '...'] }, L('magnet_n()', 'slide_right()', 'wait()'));
  kiem('omni: trượt vào cột có vật cách 2 ô cùng nhịp với magnet_n(): hút ngay ở cuối nhịp', om3.namCham.cam === 1 && om3.robot.x === 1);
  const om4 = SanHoc.chay({ san: ['...', '.o.', '...', '...'], batDau: { x: 0, y: 3, huong: 0 }, loaiRobot: 'omni', hamGoc: OMNI.concat(NC), vatChat: ['...', '.N.', '...', '...'] }, L('magnet_n()', 'slide_right()', 'wait()'));
  kiem('omni: vật nam châm cùng cực ở cột mới: bị đẩy lên (vật chữ N, tay N), xe không dính gì', om4.namCham.cam === null && ev(om4, 'day-vat').length === 1 && vatCua(om4, 1).y === 0);
  const xi = SanHoc.chay({ san: ['...', '.o.', '...', '...'], batDau: { x: 1, y: 3, huong: 0 }, loaiRobot: 'xich', hamGoc: BANH.concat(NC), vatChat: ['...', '.s.', '...', '...'] }, N);
  kiem('xích gắn được nam châm: hút như xe bánh', xi.namCham.cam === 1);
  const khong = SanHoc.chay({ san: ['...', '.o.', '...'], batDau: { x: 1, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH }, 'magnet_n()\nwait()');
  kiem('robot không có tay nam châm: gọi magnet_n() là lỗi "chưa có hàm", namCham null', khong.loi && khong.loi.loai === 'runtime-error' && /Chưa có biến hay hàm/.test(khong.loi.thongDiep) && khong.namCham === null);
  const khong2 = SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release']) }, 'wait()');
  kiem('robot tay kẹp: kết quả namCham null, vết nhịp không có robot.namCham', khong2.namCham === null && !('namCham' in nhipVet(khong2)[0].robot));
  kiem('nhện không gắn nam châm: ném lỗi', /Nhện không gắn nam châm/.test(loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'nhen', hamGoc: ['go_up', 'wait', 'magnet_n', 'magnet_off'] }, 'wait()')) || ''));
  kiem('nhện không gắn cảm biến từ front_metal / front_pole: ném lỗi', ['front_metal', 'front_pole'].every((t) => /Nhện không gắn cảm biến/.test(loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'nhen', hamGoc: ['go_up', 'wait', t] }, 'wait()')) || '')));
  kiem('một robot một tay: nam châm không đi chung tay kẹp', /chỉ có một tay/.test(loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC, ['arm_down', 'grab']) }, 'wait()')) || ''));
  kiem('một robot một tay: nam châm không đi chung súng hơi', /chỉ có một tay/.test(loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC, ['shoot', 'shoot_back']) }, 'wait()')) || ''));
  kiem('hàm gốc lạ vẫn bị từ chối; magnet_on (cũ) không còn là hàm gốc', /không thuộc loại robot/.test(loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['magnet_x']) }, 'wait()')) || '') &&
    /không thuộc loại robot/.test(loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['magnet_on']) }, 'wait()')) || ''));
  kiem('vatCan lạ: ném lỗi; vật nam châm thiếu cực: ném lỗi', /vatCan lạ/.test(loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'banh', vatCan: 'dong' }, 'wait()')) || '') &&
    /phải có cực/.test(loi(() => SanHoc.chay({ san: ['...', '...'], batDau: { x: 1, y: 1, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC), vat: [{ x: 0, y: 0, chat: 'nam-cham' }] }, 'wait()')) || ''));
  kiem('SanHoc.TAY_NAM_CHAM = magnet_n, magnet_s, magnet_off; CAM_TU_HAM = front_metal, front_pole; LENH_NGUOC: magnet_n ↔ magnet_s; tầm hút 2, tầm cực 3, đẩy 3 ô',
    J(SanHoc.TAY_NAM_CHAM) === J(['magnet_n', 'magnet_s', 'magnet_off']) && J(SanHoc.CAM_TU_HAM) === J(['front_metal', 'front_pole']) && SanHoc.LENH_NGUOC.magnet_n === 'magnet_s' && SanHoc.LENH_NGUOC.magnet_s === 'magnet_n' && !SanHoc.LENH_NGUOC.magnet_off && SanHoc.TAM_HUT === 2 && SanHoc.TAM_CUC === 3 && SanHoc.TAM_DAY === 3);
}

/* ============================================================================ 7. CẢM BIẾN TỪ */
console.log('\n== 7. front_metal() và front_pole(): không tốn nhịp; sự kiện doc-cam-bien (cam "tu") ==');
{
  const bd = { x: 3, y: 3, huong: 0 };
  const mk = (cacVat) => { let rows = trong(7), chat = trong(7); for (const [y, c] of cacVat) { rows = dat1(rows, 3, y, 'o'); chat = dat1(chat, 3, y, c === 'g' ? '.' : c); } return { rows, chat }; };
  // [mô tả, vật, front_metal, front_pole]
  const bang = [
    ['sắt ở ô 1', [[2, 's']], true, 'none'], ['sắt ở ô 2', [[1, 's']], true, 'none'], ['sắt ở ô 3', [[0, 's']], false, 'none'],
    ['gỗ ở ô 1', [[2, 'g']], false, 'none'], ['gỗ ở ô 2', [[1, 'g']], false, 'none'],
    ['gỗ ô 1 + sắt ô 2', [[2, 'g'], [1, 's']], false, 'none'], ['sắt ô 1 + gỗ ô 2', [[2, 's'], [1, 'g']], true, 'none'], ['trống', [], false, 'none'],
    ['vật N ở ô 1', [[2, 'N']], false, 'N'], ['vật S ở ô 2', [[1, 'S']], false, 'S'], ['vật N ở ô 3 (xa hơn sắt)', [[0, 'N']], false, 'N'],
    ['gỗ ô 1 + vật N ô 2', [[2, 'g'], [1, 'N']], false, 'none'], ['vật S ô 1 + sắt ô 2', [[2, 'S'], [1, 's']], false, 'S'], ['sắt ô 1 + vật N ô 2', [[2, 's'], [1, 'N']], true, 'none']
  ];
  for (const [ten, vs, km, kp] of bang) {
    const { rows, chat } = mk(vs);
    const k = chay(rows, bd, L('a = front_metal()', 'b = front_pole()'), { vatChat: chat });
    const d = doc(k);
    kiem('front_metal() = ' + km + ' · front_pole() = "' + kp + '" khi ' + ten, d[0].trong === km && d[1].cuc === (kp === 'none' ? null : kp) && d[1].trong === (kp !== 'none'), J(d));
  }
  kiem('front_pole() trả CHUỖI cho chương trình: "N" / "S" / "none" (so sánh được bằng ==)', (() => {
    const { rows, chat } = mk([[1, 'S']]);
    const k = chay(rows, bd, L('c = front_pole()', 'if c == "S":', '    magnet_n()', 'wait()'), { vatChat: chat });
    const k2 = chay(rows, bd, L('if front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'wait()'), { vatChat: chat });
    return k.namCham.cuc === 'N' && k.namCham.cam === 1 && k2.namCham.cuc === 'N' && k2.namCham.cam === 1;
  })());
  const { rows: rw, chat: ct } = mk([[1, 's']]);
  const kt = chay(dat1(rw, 3, 2, '#'), bd, 'a = front_metal()', { vatChat: ct });
  kiem('tường ở ô 1 chắn: front_metal() = False, khoang 0, o null', doc(kt)[0].trong === false && doc(kt)[0].khoang === 0 && doc(kt)[0].o === null);
  const { rows: r2, chat: c2 } = mk([[1, 's']]);
  const ev2 = chay(r2, bd, L('a = front_metal()', 'left_move()', 'right_move()', 'wait()'), { vatChat: c2 });
  const d = doc(ev2)[0];
  kiem('docCamBien { cam "tu", ham, tu, huong, o, khoang, chat "sat", cuc null, idVat, trong, nhip }', d.ma === 'doc-cam-bien' && d.cam === 'tu' && d.ham === 'front_metal' && d.tu.y === 3 && d.huong === 0 && d.o.y === 1 && d.khoang === 2 && d.chat === 'sat' && d.cuc === null && d.idVat === 1 && d.trong === true && d.nhip === 0, J(d));
  kiem('sự kiện doc-cam-bien nằm trong suKien của nhịp kế tiếp', nhipVet(ev2)[0].suKien[0].ma === 'doc-cam-bien' && nhipVet(ev2)[0].suKien[0].cam === 'tu');
  const gg = chay(dat1(trong(7), 3, 2, 'o'), bd, 'a = front_metal()');
  kiem('vật gỗ đầu tiên: chat "go", trong false', doc(gg)[0].chat === 'go' && doc(gg)[0].trong === false);
  const k0 = chay(trong(7), bd, L(...Array(40).fill('front_pole()')));
  kiem('40 lần đọc không tốn nhịp: nhịp 0, soLanDoc 40, không quen-wait, xe đứng yên', k0.nhip === 0 && k0.soLanDoc === 40 && maSK(k0, 'quen-wait').length === 0 && k0.robot.y === 3);
  const vo = chay(trong(7), bd, 'while front_pole() == "none":\n    pass');
  kiem('while front_pole() == "none": pass — quá 1000 lần đọc không có nhịp thì dừng, infinite-loop', vo.loi && vo.loi.loai === 'infinite-loop' && vo.soLanDoc === 1001);
  const hon = chay(trong(7), bd, L(...Array(600).fill('front_metal()'), ...Array(600).fill('front_pole()')));
  kiem('front_metal và front_pole chung bộ đếm 1000 lần (600 + 600 → infinite-loop)', hon.loi && hon.loi.loai === 'infinite-loop');
  const ngoac = chay(trong(7), bd, 'while front_pole() == "none":\n    left_move()\n    right_move()\n    wait()');
  kiem('while front_pole() == "none": tiến — không có vật nam châm thì xe đi hết sân rồi húc tường tới nhipToiDa (qua-nhieu-nhip)', ngoac.loi && ngoac.loi.loai === 'qua-nhieu-nhip');
  const w = chay(dat1(trong(7), 3, 0, 'o'), { x: 3, y: 6, huong: 0 }, 'while front_pole() == "none":\n    left_move()\n    right_move()\n    wait()', { vatChat: dat1(trong(7), 3, 0, 'N') });
  kiem('while front_pole() == "none": tiến — xe dừng khi vật nam châm vào tầm 3 ô (xe ở hàng 3, vật ở hàng 0)', w.robot.y === 3 && w.thang === false && w.loi === null, J(w.robot));
  const khong = chay(trong(7), bd, 'a = front_pole()', { hamGoc: BANH.concat(NC) });
  kiem('hamGoc không có front_pole: gọi là lỗi "chưa có hàm"', khong.loi && /Chưa có biến hay hàm/.test(khong.loi.thongDiep));
  kiem('SanHoc.laHamCamBien nhận front_metal, front_pole; không nhận magnet_n', SanHoc.laHamCamBien('front_metal') && SanHoc.laHamCamBien('front_pole') && SanHoc.laHamCamBien('front_clear') && SanHoc.laHamCamBien('color') && !SanHoc.laHamCamBien('magnet_n'));
  kiem('front_metal() = bật nam châm lúc này sẽ hút được SẮT: so với kết quả hút thật ở các ca sắt / gỗ', bang.filter((b) => !b[1].some(([, c]) => c === 'N' || c === 'S')).every(([ten, vs, km]) => {
    const { rows, chat } = mk(vs);
    const k = chay(rows, bd, N, { vatChat: chat });
    return (k.namCham.cam !== null) === km;
  }));
  kiem('front_pole() ≠ "none" = bật cực KHÁC chữ lúc này sẽ hút được vật nam châm đó', bang.filter((b) => b[3] !== 'none' && b[1].every(([, c]) => c === 'N' || c === 'S' || c === 'g')).every(([ten, vs, , kp]) => {
    const { rows, chat } = mk(vs);
    const k = chay(rows, bd, kp === 'N' ? S : N, { vatChat: chat });
    return k.namCham.cam !== null;
  }));
}

/* ============================================================================ 8. vatChat, vatThem, vatCan, màu theo cực */
console.log('\n== 8. Lớp vatChat (s g N S) / vatThem; vatCan sat / nam-cham / tu; vật nam châm mang màu theo cực; đích có màu ==');
{
  const od = SanHoc.docSan(['oD.', 'X..', 'o..'], null, null, ['s..', 'g..', 'N..']);
  kiem('docSan: vật theo lớp vatChat (s sắt, g gỗ, N nam châm cực N), đích X giữ vật', od.vat.length === 3 && od.vat[0].chat === 'sat' && od.vat[1].chat === 'go' && od.vat[2].chat === 'nam-cham' && od.vat[2].cuc === 'N' && od.dich.length === 2, J(od.vat));
  const od2 = SanHoc.docSan(['oD.', 'X..']);
  kiem('docSan không có lớp chất: vật không có trường chat (các sân cũ giữ nguyên dạng)', od2.vat.every((v) => !('chat' in v)));
  kiem('lớp chất đặt ở ô không có vật: lỗi cấu hình', /không có vật/.test(loi(() => SanHoc.docSan(['o..', '...'], null, null, ['.s.', '...'])) || ''));
  kiem('ký hiệu lạ trong lớp chất (x): lỗi; lớp sai cỡ: lỗi', /Ký hiệu lạ trong lớp chất/.test(loi(() => SanHoc.docSan(['o..', '...'], null, null, ['x..', '...'])) || '') && /cùng cỡ/.test(loi(() => SanHoc.docSan(['o..', '...'], null, null, ['s.', '...'])) || '') && /mảng 2 chuỗi/.test(loi(() => SanHoc.docSan(['o..', '...'], null, null, ['s..'])) || ''));
  kiem('lopMauCuaSan: màn một sân trả nguyên lớp; màn nhiều sân trả lớp của sân thứ i; có vatChat và vatThem', (() => {
    const m1 = { san: ['o'], vatChat: ['s'], vatThem: [{ x: 0, y: 0 }] };
    const m2 = { san: [['o'], ['o']], vatChat: [['s'], ['N']], vatThem: [[{ x: 1, y: 1 }], [{ x: 2, y: 2 }]] };
    const a = SanHoc.lopMauCuaSan(m1, 0), b = SanHoc.lopMauCuaSan(m2, 1);
    return a.vatChat[0] === 's' && a.vatThem.length === 1 && b.vatChat[0] === 'N' && b.vatThem[0].x === 2 && SanHoc.lopMauCuaSan({ san: ['o'] }, 0).vatChat === null;
  })());
  // vatCan
  const hai = { san: ['o.o', '.D.', '...'], vatChat: ['s.g', '...', '...'], batDau: { x: 0, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat' };
  const lamDay = L(N, 'left_move()', 'right_move()', 'wait()', PHAI, THA);
  const k7 = SanHoc.chay(Object.assign({}, hai, { vatCan: 'sat' }), lamDay);
  kiem('vatCan "sat": hút vật sắt, tiến lên, rẽ phải, thả vào đích (1,1): thắng dù vật gỗ nằm yên ở (2,0)', k7.thang === true && vatCua(k7, 2).x === 2 && vatCua(k7, 2).y === 0 && vatCua(k7, 1).x === 1 && vatCua(k7, 1).y === 1, J([k7.thang, k7.vat]));
  kiem('không khai vatCan: phải đưa MỌI vật (kể cả gỗ) tới đích — cùng chương trình đó thì chưa thắng', SanHoc.chay(hai, lamDay).thang === false);
  kiem('vatCan "sat" mà sân không có vật sắt: không bao giờ thắng', SanHoc.chay({ san: ['.o.', '.D.', '...'], batDau: { x: 1, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat', vatCan: 'sat' }, L(N, THA)).thang === false);
  const hon = { san: ['o.o', '.D.', '...'], vatChat: ['s.N', '...', '...'], batDau: { x: 0, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat' };
  kiem('vatCan "nam-cham": chỉ vật nam châm phải về đích (vật sắt đứng yên không sao); "tu": cả sắt lẫn nam châm; "sat": vật nam châm không cần',
    (() => {
      const a = SanHoc.chay(Object.assign({}, hon, { vatCan: 'nam-cham', batDau: { x: 2, y: 2, huong: 0 } }), L(S, 'left_move()', 'right_move()', 'wait()', TRAI, THA));
      return a.thang === true && vatCua(a, 1).x === 0 && vatCua(a, 1).y === 0 && SanHoc.chay(Object.assign({}, hon, { vatCan: 'tu', batDau: { x: 2, y: 2, huong: 0 } }), L(S, 'left_move()', 'right_move()', 'wait()', TRAI, THA)).thang === false && SanHoc.chay(Object.assign({}, hon, { vatCan: 'sat' }), lamDay).thang === true;
    })());
  kiem('chua-dua-vat nói đúng loại vật theo vatCan (sắt / nam châm / có từ) và đếm đúng', (() => {
    const mm = (vc, chat) => Object.assign({}, man(1), { san: ['.o.', '.D.', '...'], batDau: { x: 1, y: 2, huong: 0 }, vatChat: [chat, '...', '...'].map((r, i) => (i === 0 ? '.' + chat.slice(0, 1) + '.' : r)), vatCan: vc });
    const cd = (vc, ch) => ChamHoc.cham(mm(vc, ch), { chinh: ['wait()'] }, []).chanDoan.find((x) => x.ma === 'chua-dua-vat');
    return /vật sắt/.test(cd('sat', 's').loi) && /vật nam châm/.test(cd('nam-cham', 'N').loi) && /vật có từ/.test(cd('tu', 's').loi) && cd('sat', 's').conLai === 1 && cd('tu', 'N').tong === 1;
  })());
  const vt = chay(['...', '...'], { x: 0, y: 1, huong: 0 }, 'wait()', { vat: [{ x: 0, y: 0, chat: 'sat' }, { x: 0, y: 0, chat: 'go' }, { x: 5, y: 5 }] });
  kiem('cfg.vat: mỗi ô một vật (ô trùng bị bỏ), ô ngoài sân bị bỏ', vt.vat.length === 1 && vt.vat[0].chat === 'sat');
  // màu theo cực + đích có màu
  const mc = chay(['oo', '..'], { x: 0, y: 1, huong: 0 }, 'wait()', { vatChat: ['NS', '..'] });
  kiem('vật nam châm tự mang màu theo cực: N đỏ (red), S xanh dương (blue) (nếu màn không khai vatMau)', vatCua(mc, 1).mau === 'red' && vatCua(mc, 2).mau === 'blue' && SanHoc.CUC_MAU.N === 'red' && SanHoc.CUC_MAU.S === 'blue');
  const mp = SanHoc.chay({ san: ['.o.', '.D.', '...'], mau: ['...', '.b.', '...'], vatChat: ['.N.', '...', '...'], batDau: { x: 1, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat', vatCan: 'nam-cham' }, L(S, THA));
  kiem('đích XANH DƯƠNG, vật chữ N (đỏ): thả xuống → dat-sai-mau (mauVat red, mauDich blue, chat nam-cham, cuc N), chưa thắng, vật vẫn nằm đó', !mp.thang && maSK(mp, 'dat-sai-mau').length === 1 && maSK(mp, 'dat-sai-mau')[0].mauVat === 'red' && maSK(mp, 'dat-sai-mau')[0].mauDich === 'blue' && maSK(mp, 'dat-sai-mau')[0].chat === 'nam-cham' && maSK(mp, 'dat-sai-mau')[0].cuc === 'N' && vatCua(mp, 1).trangThai === 'dat');
  const mp2 = SanHoc.chay({ san: ['.o.', '.D.', '...'], mau: ['...', '.r.', '...'], vatChat: ['.N.', '...', '...'], batDau: { x: 1, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat', vatCan: 'nam-cham' }, L(S, THA));
  kiem('đích ĐỎ nhận vật chữ N (phân loại theo cực): thắng', mp2.thang === true);
  const mp3 = SanHoc.chay({ san: ['.o.', '.D.', '...'], mau: ['...', '.r.', '...'], vatChat: ['.S.', '...', '...'], batDau: { x: 1, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat', vatCan: 'nam-cham' }, L(N, THA));
  kiem('đích ĐỎ không nhận vật chữ S (xanh dương): dat-sai-mau, chưa thắng', !mp3.thang && maSK(mp3, 'dat-sai-mau').length === 1);
  const cm = SanHoc.chay({ san: ['.o.', '...', '...'], vatMau: ['.r.', '...', '...'], mau: ['...', '...', '.y.'], vatChat: ['.s.', '...', '...'], batDau: { x: 1, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC, ['color']) }, L('a = color()', N, 'b = color()'));
  const dc = doc(cm);
  kiem('color() (cảm biến bụng): vật sắt đỏ dính ở mũi xe mà color() vẫn là màu SÀN dưới xe "yellow" (trước và sau khi dính; nguon "san", idVat null)', dc.length === 2 && dc.every((x) => x.mau === 'yellow' && x.nguon === 'san' && x.idVat === null && x.cam === 'mau') && cm.namCham.cam === 1, J(dc));
  const cm3 = SanHoc.chay({ san: ['.o..', '....'], mau: ['..y.', '....'], vatChat: ['.s..', '....'], batDau: { x: 3, y: 0, huong: 3 }, loaiRobot: 'banh', hamGoc: BANH.concat(NC, ['color']) }, L('magnet_n()', 'wait()', 'x = color()', TIEN, 'y = color()'));
  kiem('xe đang dính vật sắt đi qua ô vàng: color() đọc đúng sàn mỗi ô ("none" rồi "yellow"), nguon "san"', (() => { const x = doc(cm3); return x.length === 2 && x[0].mau === 'none' && x[1].mau === 'yellow' && x.every((q) => q.nguon === 'san') && cm3.namCham.cam === 1; })(), J(doc(cm3)));
}

/* ============================================================================ 9. CHẨN ĐOÁN, SÂN THỬ */
console.log('\n== 9. Chẩn đoán tiếng Việt; chấm nhiều sân có vatChat; sân thử của Xưởng ==');
{
  const run = (m, chinh, kho) => ChamHoc.cham(m, { chinh }, kho || []);
  const cd = (r, ma) => r.chanDoan.find((c) => c.ma === ma);
  const r1 = run(man(1), ['magnet_n()', 'wait()', 'turn_right()', 'magnet_off()', 'wait()'], khoTruoc('25.1'));
  kiem('tha-bi-chan: không có vì thả được xuống ô trống (đây là thả sớm, chưa tới đích)', !cd(r1, 'tha-bi-chan') && cd(r1, 'chua-dua-vat'));
  const r2 = run(man(7), man(7).maMau.chinh, khoTruoc('25.7'));
  const tb2 = cd(r2, 'tha-bi-chan');
  kiem('tha-bi-chan (lỗi): nói ô trước mũi là gì (mép sân), vật vẫn dính, nam châm vẫn bật, chỉ dòng lệnh magnet_off', tb2 && tb2.muc === 'loi' && /mép sân/.test(tb2.loi) && /vẫn dính/.test(tb2.loi) && tb2.cho && tb2.cho.cot === 'chinh' && tb2.cho.dong === 8, J(tb2));
  const r3 = run(man(2), ['magnet_n()', 'wait()'], khoTruoc('25.2'));
  const hg = cd(r3, 'hut-go');
  kiem('hut-go (thông tin, không phải lỗi): nói vật gỗ chắn; cực nào cũng không làm gì được; gợi ý front_metal / front_pole', hg && hg.muc === 'thong-tin' && /vật GỖ/.test(hg.loi) && /cực nào cũng/.test(hg.loi) && /front_metal/.test(hg.loi) && /front_pole/.test(hg.loi) && hg.khoang === 1, J(hg));
  const r4 = run(man(1), ['magnet_n()', 'magnet_off()', 'wait()'], khoTruoc('25.1'));
  const ml = cd(r4, 'magnet-goi-lai');
  kiem('magnet-goi-lai (lỗi): nói lệnh trước giữ nam châm, chỉ cả hai dòng, nhắc ba lệnh (cực N, cực S, ngắt điện)', ml && ml.muc === 'loi' && /magnet_n/.test(ml.loi) && /magnet_off/.test(ml.loi) && /cực N, bật cực S hoặc ngắt/.test(ml.loi) && ml.cho.dong === 2 && ml.choTruoc.dong === 1, J(ml));
  const qw = cd(run(man(1), ['magnet_n()'], khoTruoc('25.1')), 'quen-wait');
  kiem('quen-wait tính magnet_n là lệnh tay: "chưa có wait() theo sau"', qw && /lệnh tay/.test(qw.loi) && /magnet_n\(\)/.test(qw.loi), J(qw && qw.loi));
  // cực
  const r5 = run(man(3), man(3).maMau.chinh, khoTruoc('25.3'));
  const dv = cd(r5, 'day-vat');
  kiem('day-vat (thông tin): bật cực N với vật chữ N → nói "cực giống nhau thì đẩy nhau", vật đi mấy ô, nhắc bật cực KHÁC chữ; chỉ khi chưa thắng', dv && dv.muc === 'thong-tin' && /cực giống nhau thì đẩy nhau/.test(dv.loi) && /cực N/.test(dv.loi) && /KHÁC chữ/.test(dv.loi) && dv.soO === 1 && !cd(run(man(3), man(3).loiGiai.chinh, khoTruoc('25.3')), 'day-vat'), J(dv));
  const r6 = run(man(2), ['turn_right()', 'forward(2)', 'turn_left()', 'forward(2)', 'turn_left()', 'magnet_s()', 'wait()', 'magnet_n()', 'wait()'], khoTruoc('25.2'));
  const sd = cd(r6, 'sat-khong-day');
  kiem('sat-khong-day (thông tin): đổi cực khi đang dính sắt → "sắt bị hút bởi cực nào cũng được và không bao giờ bị đẩy", chỉ dòng magnet_n', sd && sd.muc === 'thong-tin' && /cực nào cũng được/.test(sd.loi) && /không bao giờ bị đẩy/.test(sd.loi) && /vật nam châm/.test(sd.loi) && sd.cho && sd.cho.dong === 8 && sd.cuc === 'N', J(sd));
  const mNT = Object.assign({}, man(3), { san: ['...', '.o.', '...', '...', '...'], vatChat: ['...', '.s.', '...', '...', '...'], batDau: { x: 1, y: 4, huong: 0 }, vatCan: 'tu' });
  const nt = cd(run(mNT, ['magnet_n()', 'wait()']), 'ngoai-tam');
  kiem('ngoai-tam (thông tin): vật sắt cách 3 ô → "ngoài tầm hút của sắt (chỉ 2 ô)", nhắc vật nam châm xa hơn tới 3 ô', nt && nt.muc === 'thong-tin' && /ngoài tầm hút của sắt/.test(nt.loi) && /chỉ 2 ô/.test(nt.loi) && /tới 3 ô/.test(nt.loi) && nt.khoang === 3, J(nt));
  const mDay = Object.assign({}, man(4));
  const rBC = run(mDay, ['move()', 'move()', 'turn_right()', 'magnet_n()', 'wait()', 'wait()'], khoTruoc('25.4'));
  const dbc = cd(run(Object.assign({}, mDay, { san: ['......', '......', '.o#...', '......', '......'], vatChat: ['......', '......', '.N....', '......', '......'] }), ['move()', 'move()', 'turn_right()', 'magnet_n()', 'wait()'], khoTruoc('25.4')), 'day-bi-chan');
  kiem('day-bi-chan (thông tin): vật nam châm sát tường không nhúc nhích được → nói ô sau là tường', dbc && dbc.muc === 'thong-tin' && /không nhúc nhích được/.test(dbc.loi) && /tường/.test(dbc.loi) && dbc.tuMui === false, J(dbc));
  void rBC;
  const m6 = man(6);
  const r7 = ChamHoc.cham(Object.assign({}, m6, { hamGoc: m6.hamGoc.filter((t) => t !== 'front_pole') }), { chinh: ['while front_pole() == "none":', '    move()'] }, khoTruoc('25.6'));
  const cg = cd(r7, 'chua-gan-cam-bien');
  kiem('chua-gan-cam-bien (màn chưa cho front_pole): nói robot chưa gắn cảm biến từ nên chưa có front_pole()', cg && /front_pole\(\)/.test(cg.loi) && /cảm biến từ/.test(cg.loi) && cg.ten === 'front_pole', J(cg && cg.loi));
  const r7b = ChamHoc.cham(Object.assign({}, m6, { hamGoc: ['left_move', 'right_move', 'wait', 'magnet_n', 'magnet_s', 'magnet_off'], robot: { than: 'hai-banh', tay: 'nam-cham', camBien: [] } }), { chinh: ['a = front_pole()'] }, []);
  kiem('chua-gan-cam-bien (robot chưa gắn cảm biến nào): nói rõ cảm biến từ (kim loại) và tên hàm', cd(r7b, 'chua-gan-cam-bien') && /từ \(kim loại\)/.test(cd(r7b, 'chua-gan-cam-bien').loi) && /front_pole/.test(cd(r7b, 'chua-gan-cam-bien').loi), J(r7b.chanDoan.map((c) => c.loi)));

  // nhiều sân có vatChat
  const r8 = ChamHoc.cham(m6, m6.loiGiai, tron(khoTruoc('25.6'), m6.loiGiai.hamCuaEmMoi));
  kiem('21.6 (3 sân, vatChat song song): lời giải thắng cả ba, mỗi sân một mục theoSan, soNhip = tổng', r8.thang && r8.theoSan.length === 3 && r8.theoSan.every((s) => s.thang) && r8.soNhip === r8.theoSan.reduce((a, s) => a + s.soNhip, 0) && r8.nhipTong === r8.soNhip, J(r8.theoSan.map((s) => s.soNhip)));
  kiem('kết quả cham có namCham (trạng thái cuối, cuc null sau khi thả) và vật có chat / cuc', r8.namCham && r8.namCham.bat === false && r8.namCham.cuc === null && r8.vat.some((v) => v.chat === 'nam-cham' && v.cuc) && r8.theoSan.some((s) => s.vat.some((v) => v.cuc === 'S')), J(r8.vat));

  // sân thử
  const st = ChamHoc.chuanSanThu({ rong: 5, cao: 5, batDau: { x: 2, y: 4, huong: 0 }, vat: [{ x: 2, y: 2, chat: 'sat' }, { x: 1, y: 1 }, { x: 9, y: 9, chat: 'sat' }, { x: 3, y: 1, chat: 'nam-cham', cuc: 'S' }, { x: 4, y: 1, chat: 'nam-cham' }] });
  kiem('chuanSanThu: vật giữ chat "sat", vật nam châm giữ chat + cuc (thiếu cực thì thành gỗ), vật thường không có trường chat, vật ngoài sân bị bỏ', st.vat.length === 4 && st.vat[0].chat === 'sat' && !('chat' in st.vat[1]) && st.vat[2].chat === 'nam-cham' && st.vat[2].cuc === 'S' && !('chat' in st.vat[3]), J(st.vat));
  const hF = () => H('fetch', ['magnet_n()', 'wait()', 'u_turn()', 'move()', 'magnet_off()', 'wait()']);
  const mT = man(5);
  const kT = ChamHoc.thuHam(mT, { chinh: [] }, 'fetch', tron(khoTruoc('25.5'), [hF()]), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 0, chat: 'sat' }] } });
  kiem('Xưởng: thử fetch() trên sân thử 5×5 (xe (2,2) quay lên, vật sắt (2,0)): hút, quay đầu, tiến một ô, thả — nam châm tắt, vật nằm yên ở (2, 4), xe ở (2, 3) quay xuống, không chẩn đoán', kT.namCham && kT.namCham.cam === null && kT.namCham.bat === false && kT.vat[0].trangThai === 'dat' && kT.vat[0].x === 2 && kT.vat[0].y === 4 && kT.robot.y === 3 && kT.robot.huong === 2 && maCua(kT).length === 0, J([kT.vat, kT.robot, maCua(kT)]));
  const kT2 = ChamHoc.thuHam(mT, { chinh: [] }, 'fetch', tron(khoTruoc('25.5'), [hF()]), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [{ x: 2, y: 0 }] } });
  kiem('Xưởng: vật gỗ trong sân thử không dính; có hut-go (thông tin) và vật vẫn nằm ở (2, 0)', maCua(kT2).includes('hut-go') && kT2.vat[0].trangThai === 'dat' && kT2.vat[0].y === 0 && kT2.chanDoan.find((c) => c.ma === 'hut-go').muc === 'thong-tin');
  const kG = ChamHoc.thuHam(man(6), { chinh: [] }, 'grip', tron(khoTruoc('25.6'), [H('grip', man(6).loiGiai.hamCuaEmMoi[0].than)]), { sanThu: { rong: 5, cao: 5, batDau: { x: 2, y: 3, huong: 0 }, vat: [{ x: 2, y: 1, chat: 'nam-cham', cuc: 'N' }] } });
  kiem('Xưởng: thử grip() với vật nam châm chữ N cách 2 ô: grip bật cực S, vật bị hút dính vào xe (cuc "S")', kG.namCham && kG.namCham.cam === 1 && kG.namCham.cuc === 'S' && maCua(kG).length === 0, J([kG.namCham, maCua(kG)]));
}

/* ============================================================================ 10. BỘ DÒ ĐƯỜNG TẮT */
console.log('\n== 10. Bộ dò đường tắt nam châm (do-duong-nam-cham.mjs): luật y hệt san-hoc.js ==');
{
  const mk = (rows, chat, bd, extra) => Object.assign({ san: rows, vatChat: chat, batDau: bd, loaiRobot: 'banh', vatCan: 'tu' }, extra || {});
  const a = mk(['.....', '..o..', '.....', '....D', '.....'], ['.....', '..s..', '.....', '.....', '.....'], { x: 2, y: 3, huong: 0 });
  kiem('bộ dò: màn 21.1 kiểu: hút, rẽ phải, tiến, thả = 4 nhịp tách; gộp cũng 4', nhipNamChamNganNhat(a, { tachNhip: true }).nhip === 4 && nhipNamChamNganNhat(a).nhip === 4);
  const b = mk(['.....', '..oD.', '..o..', '.....', '.....'], ['.....', '..s..', '.....', '.....', '.....'], { x: 2, y: 3, huong: 0 });
  const bTach = nhipNamChamNganNhat(b, { tachNhip: true });
  const iOn = bTach.chuoi.findIndex((a) => a.nc === 'n' || a.nc === 's'), iTien = bTach.chuoi.findIndex((a) => a.banh === BoDo.TIEN);
  kiem('bộ dò: gỗ ngay trước mặt chiếm ô và chắn sắt đứng sau: không đi xuyên, không hút xuyên; tách 9, gộp < 9; đường ngắn nhất rẽ sang bên và tiến TRƯỚC khi bật nam châm', bTach.nhip === 9 && nhipNamChamNganNhat(b).nhip < 9 && iTien >= 0 && iTien < iOn && bTach.chuoi.slice(0, iOn).every((a) => a.nc === null), J(bTach.chuoi));
  kiem('bộ dò: gỗ chiếm ô chặn xe cả khi lối thẳng duy nhất (hành lang một ô rộng, cột bị gỗ chắn, hai bên tường) → null', nhipNamChamNganNhat(mk(['#D#', '#o#', '#o#', '#.#'], ['...', '.s.', '...', '...'], { x: 1, y: 3, huong: 0 })).nhip === null);
  const c = mk(['.....', '.###.', '.#o#.', '.###.', '....D'], ['.....', '.....', '..s..', '.....', '.....'], { x: 0, y: 0, huong: 0 });
  kiem('bộ dò: vật sắt nhốt trong tường kín, ngoài tầm nhìn thẳng: không giải được → null', nhipNamChamNganNhat(c).nhip === null);
  const d = mk(['.....', '.....', '..o..', '.....', '..D..'], ['.....', '.....', '..s..', '.....', '.....'], { x: 2, y: 0, huong: 2 });
  kiem('bộ dò: tách nhịp luôn >= gộp nhịp (và hành động dayDu không tệ hơn thường)', nhipNamChamNganNhat(d, { tachNhip: true }).nhip >= nhipNamChamNganNhat(d).nhip && nhipNamChamNganNhat(d, { dayDu: true }).nhip <= nhipNamChamNganNhat(d).nhip);
  kiem('bộ dò: không có vật cần (vatCan sat, sân toàn gỗ) → không thắng được: null', nhipNamChamNganNhat(mk(['.o.', '.D.', '...'], null, { x: 1, y: 2, huong: 0 }, { vatCan: 'sat' })).nhip === null);
  kiem('bộ dò: loại robot lạ (nhện) → ném lỗi; thùng nặng / nút / cửa → ném lỗi', /chỉ biết xe bánh và omni/.test(loi(() => nhipNamChamNganNhat(Object.assign({}, a, { loaiRobot: 'nhen' }))) || '') && /không hỗ trợ thùng nặng/.test(loi(() => nhipNamChamNganNhat(Object.assign({}, a, { san: ['.H...', '..o..', '.....', '....D', '.....'] }))) || ''));
  // vật nam châm: kéo hay đẩy là đường ngắn nhất
  const dayDe = mk(['......', '......', '.o.D#.', '......', '......'], ['......', '......', '.N....', '......', '......'], { x: 0, y: 4, huong: 0 });
  const rd = nhipNamChamNganNhat(dayDe, { tachNhip: true });
  kiem('bộ dò: màn kiểu 21.4 (đẩy vật N bằng cực N dừng sát tường vào đích) = 4 nhịp tách; chuỗi có magnet_n ("n") chứ không phải hút rồi mang (7 nhịp)', rd.nhip === 4 && rd.chuoi.some((x) => x.nc === 'n'), J(rd.chuoi));
  const rd2 = nhipNamChamNganNhat(Object.assign({}, dayDe, { phanCung: undefined }), { tachNhip: true, hieuQua: ['cho', 'tien', 'phai', 'trai'] });
  kiem('bộ dò: tuyChon.hieuQua giới hạn hiệu quả bánh (không lùi, không quay đầu) vẫn ra 4', rd2.nhip === 4);
  // chuoiThanhMa chạy đúng trên SanHoc
  const kq = nhipNamChamNganNhat(a, { tachNhip: true });
  const ma = chuoiThanhMa(kq.chuoi);
  const sh = SanHoc.chay({ san: a.san, vatChat: a.vatChat, batDau: a.batDau, loaiRobot: 'banh', hamGoc: BANH.concat(NC), mucTieu: 'dua-vat', vatCan: 'tu' }, ma);
  kiem('chuỗi hành động của bộ dò đổi sang Python rồi chạy thật trên san-hoc.js: thắng đúng số nhịp bộ dò báo', sh.thang && sh.nhip === kq.nhip, J([sh.thang, sh.nhip, kq.nhip]));
  const maD = chuoiThanhMa([{ nc: 'n', banh: BoDo.DUNG }, { nc: 's', banh: BoDo.DUNG }], { daoChieu: ['cuc'] });
  kiem('chuoiThanhMa với daoChieu ["cuc"]: cực THẬT N ghi lệnh magnet_s(), cực thật S ghi magnet_n()', /^magnet_s\(\)\nwait\(\)\nmagnet_n\(\)\nwait\(\)\n$/.test(maD), maD);

  // so chéo ngẫu nhiên
  let seed = 20261015;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  let soCa = 0, lech = 0, soNhip = 0, soHut = 0, soDay = 0, soBan = 0, soTha = 0, soThang = 0, soChan = 0; const ghiLech = [];
  for (let ca = 0; ca < 2400; ca++) {
    const omni = ca % 4 === 3;
    const loai = omni ? 'omni' : 'banh';
    const rong = 5 + Math.floor(rnd() * 3), cao = 5 + Math.floor(rnd() * 2);
    let g = Array.from({ length: cao }, () => Array(rong).fill('.'));
    const o = () => [Math.floor(rnd() * rong), Math.floor(rnd() * cao)];
    for (let i = 0; i < 3; i++) { const [x, y] = o(); g[y][x] = '#'; }
    for (let i = 0; i < 2; i++) { const [x, y] = o(); if (g[y][x] === '.') g[y][x] = 'S'; }
    for (let i = 0; i < 1; i++) { const [x, y] = o(); if (g[y][x] === '.') g[y][x] = '='; }
    for (let i = 0; i < 2; i++) { const [x, y] = o(); if (g[y][x] === '.') g[y][x] = pick(['>', '<', '^', 'v']); }
    const nVat = 2 + Math.floor(rnd() * 3);
    const chatRows = Array.from({ length: cao }, () => Array(rong).fill('.'));
    let dem = 0;
    for (let t = 0; t < 60 && dem < nVat; t++) { const [x, y] = o(); if (g[y][x] === '.') { g[y][x] = 'o'; const r = rnd(); chatRows[y][x] = r < 0.25 ? 's' : r < 0.6 ? 'N' : r < 0.9 ? 'S' : '.'; dem++; } }
    for (let i = 0; i < 2; i++) { const [x, y] = o(); if (g[y][x] === '.') g[y][x] = 'D'; else if (g[y][x] === 'o') g[y][x] = 'X'; }
    let xe = null;
    for (let t = 0; t < 60 && !xe; t++) { const [x, y] = o(); if (g[y][x] === '.' || g[y][x] === 'D') xe = { x, y, huong: Math.floor(rnd() * 4) }; }
    if (!xe) continue;
    const rows = g.map((r) => r.join('')), chatL = chatRows.map((r) => r.join(''));
    const vatCan = pick([undefined, 'sat', 'nam-cham', 'tu']);
    const man0 = { san: rows, vatChat: chatL, batDau: xe, loaiRobot: loai, vatCan };
    let ctx;
    try { ctx = dungNguCanh(man0); } catch (e) { continue; }
    const HD = hanhDongTuDo(ctx, { dayDu: true });
    const dai = 8 + Math.floor(rnd() * 14);
    const chuoi = Array.from({ length: dai }, () => pick(HD));
    let Sx = trangThaiDau(ctx), nhipDo = 0, thangDo = false;
    const trace = [];
    for (const ac of chuoi) { Sx = buocMotNhip(ctx, Sx, ac); nhipDo++; trace.push(Sx); if (laThang(ctx, Sx)) { thangDo = true; break; } }
    const code = chuoiThanhMa(chuoi.slice(0, nhipDo));
    const res = SanHoc.chay({ san: rows, vatChat: chatL, batDau: xe, loaiRobot: loai, hamGoc: (omni ? OMNI : BANH).concat(NC), mucTieu: 'dua-vat', vatCan }, code);
    soCa++;
    const nv = nhipVet(res);
    let ok = res.thang === thangDo && nv.length === nhipDo && res.loi === null;
    for (let i = 0; ok && i < nv.length; i++) {
      const s = trace[i], r = nv[i].robot, v = nv[i].vat;
      const cuc = r.namCham.cuc === 'N' ? 1 : r.namCham.cuc === 'S' ? 2 : 0;
      if (r.x !== s.x || r.y !== s.y || r.huong !== s.h || cuc !== s.c || r.namCham.bat !== (s.c > 0)) ok = false;
      s.pos.forEach((p, j) => {
        const vv = v[j];
        if (p === -1) { if (vv.trangThai !== 'cam' || vv.x !== s.x || vv.y !== s.y) ok = false; if (r.namCham.cam !== vv.id) ok = false; }
        else if (vv.trangThai !== 'dat' || vv.y * ctx.rong + vv.x !== p) ok = false;
      });
      if (!s.pos.includes(-1) && r.namCham.cam !== null) ok = false;
    }
    if (!ok) { lech++; if (ghiLech.length < 2) ghiLech.push(J({ rows, chatL, xe, loai, vatCan, code: code.split('\n').join(';') })); }
    const es = nv.flatMap((n) => n.suKien);
    soNhip += nhipDo; soHut += es.filter((e) => e.ma === 'hut-vat').length; soDay += es.filter((e) => e.ma === 'day-vat' && !e.tuMui).length; soBan += es.filter((e) => e.ma === 'day-vat' && e.tuMui).length;
    soTha += es.filter((e) => e.ma === 'tha-vat').length; soChan += maSK(res, 'tha-bi-chan').length; if (res.thang) soThang++;
  }
  kiem('so chéo ' + soCa + ' ca ngẫu nhiên (xe bánh và omni, tường, bậc thang, rào, băng chuyền, vật gỗ / sắt / nam châm N / S, đủ chín tổ hợp bánh + trượt, vatCan 4 kiểu): từng nhịp bộ dò và san-hoc.js trùng hoàn toàn (xe, hướng, cực, từng vật)',
    soCa >= 1800 && lech === 0, lech + ' lệch · ' + ghiLech.join(' || '));
  kiem('các ca ngẫu nhiên có đủ thứ: hút (' + soHut + '), đẩy (' + soDay + '), bắn vật đang dính (' + soBan + '), thả (' + soTha + '), thả bị chặn (' + soChan + '), thắng (' + soThang + '), tổng ' + soNhip + ' nhịp', soHut >= 400 && soDay >= 150 && soBan >= 100 && soTha >= 100 && soChan >= 30 && soThang >= 20, [soHut, soDay, soBan, soTha, soChan, soThang].join());
}

/* ============================================================================ 11. DỮ LIỆU 10 MÀN */
console.log('\n== 11. Dữ liệu 10 màn: sân, vatChat, đường tắt (BFS tách nhịp), cảm biến, canHam ==');
const BANG = [];
{
  const SAO_NHIP = [4, 9, 4, 4, 25, 15, 6, 10, 11, 34];
  const SAO_O = [11, 18, 11, 10, 23, 16, 10, 17, 10, 22];
  kiem('đúng 10 màn nam-cham, id theo vị trí trong thuTu, mã nam-cham.1…10, tên chương "Nam châm"', ds.length === 10 && ds.every((m, i) => m.id === (require(path.join(day, 'thu-tu-chuong.js')).thuTu.indexOf('nam-cham') + 1) + '.' + (i + 1) && m.ma === 'nam-cham.' + (i + 1)) && ManHoc.chuong().find((c) => c.ma === 'nam-cham').ten === 'Nam châm');
  kiem('hang: 3 làm quen · 3 luyện · 3 biến thể · 1 trùm', J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']));
  kiem('sao.nhip và sao.o đúng bảng chốt', J(ds.map((m) => m.sao.nhip)) === J(SAO_NHIP) && J(ds.map((m) => m.sao.o)) === J(SAO_O), J([ds.map((m) => m.sao.nhip), ds.map((m) => m.sao.o)]));
  kiem('hàm cốt truyện: fetch ở 21.5, grip ở 19.6; chỉ 21.8 có hàm của màn (haul); huy hiệu nam-cham ở 19.10', J(ds.map((m) => m.taoHam)) === J([[], [], [], [], ['fetch'], ['grip'], [], [], [], []]) &&
    ds.every((m) => (m.so === 8) === (m.maMau.hamCuaMan.length === 1 && m.loiGiai.hamCuaMan.length === 1)) && ds[9].huyHieu.ma === 'nam-cham' && ds.slice(0, 9).every((m) => !m.huyHieu));
  kiem('mọi màn: mucTieu dua-vat, vatCan tu, nhipTheoLoiGiai, Xưởng mở, khung 10/10, cauTruc for/if/while', ds.every((m) => m.mucTieu === 'dua-vat' && m.vatCan === 'tu' && m.nhipTheoLoiGiai === true && m.moXuong && m.khung.chinh === 10 && m.khung.moiHam === 10 && J(m.cauTruc) === '["for","if","while"]'));
  kiem('khay: 21.1 chỉ magnet_n + magnet_off; 19.2+ đủ ba lệnh nam châm; 21.6 có front_pole (không front_clear); 21.10 có front_clear (cho go_wall), front_pole, color; 21.9 là omni (slide_left / slide_right); không màn nào có front_metal',
    ds.every((m) => J(m.hamGoc.filter((t) => /^magnet/.test(t))) === J(m.so === 1 ? ['magnet_n', 'magnet_off'] : NC) && !m.hamGoc.includes('magnet_on') && (m.so === 6 || m.so === 10) === m.hamGoc.includes('front_pole') && (m.so === 10) === m.hamGoc.includes('color') && (m.so === 10) === m.hamGoc.includes('front_clear') && !m.hamGoc.includes('front_metal') && (m.so === 9) === (m.loaiRobot === 'omni') && (m.so === 9) === m.hamGoc.includes('slide_left')) &&
      J(man(6).robot.camBien) === J([{ ma: 'khoang-cach', o: 'hong' }]) && man(1).robot.camBien.length === 0 && J(man(10).robot.camBien) === J([{ ma: 'khoang-cach', o: 'hong' }, { ma: 'mau', o: 'hong' }]));
  kiem('robot.tay "nam-cham" ở mọi màn; than hai-banh (omni ở 21.9)', ds.every((m) => m.robot.tay === 'nam-cham' && m.robot.than === (m.so === 9 ? 'omni' : 'hai-banh')));

  for (const m of ds) {
    const dsSan = sanCua(m), bds = bdCua(m);
    const chatOK = dsSan.every((rows, i) => {
      const lm = SanHoc.lopMauCuaSan(m, i);
      const sd = SanHoc.docSan(rows, lm.mau, lm.vatMau, lm.vatChat);
      const them = lm.vatThem || [];
      const tatVat = sd.vat.concat(them);
      const bdx = bds[i];
      return tatVat.some((v) => v.chat === 'sat' || v.chat === 'nam-cham') && sd.dich.length >= 1 && rows[bdx.y][bdx.x] !== '#' && them.every((v) => rows[v.y][v.x] !== '#' && v.x >= 0 && v.x < sd.rong && v.y >= 0 && v.y < sd.cao) &&
        (m.so === 7 ? sd.vat.some((v) => v.chat !== 'sat') : true) && sd.rong <= 7 && sd.cao <= 9;
    });
    kiem(m.id + ': mọi sân có ít nhất một vật có từ (sắt hay nam châm), một ô đích, cỡ ≤ 7×9; xe không xuất phát trong tường' + (m.so === 7 ? '; vật sắt chính nằm trên băng (vatThem), vật gỗ chỉ để đủ sân' : ''), chatOK);
    const tach = nhipNamChamTatCa(m, { tachNhip: true }), gop = nhipNamChamTatCa(m);
    kiem(m.id + ': BFS tách nhịp (lệnh nam châm đứng một mình trong nhịp) ' + (m.so === 10 ? '<= ' : '= ') + 'sao.nhip = ' + m.sao.nhip + (m.so === 10 ? ' (go_wall() đi sát vật nên dài hơn đường dừng sớm bằng cảm biến)' : ' (không có đường tắt)') + '; BFS gộp = ' + gop + ' <= sao.nhip', (m.so === 10 ? tach !== null && tach <= m.sao.nhip : tach === m.sao.nhip) && gop !== null && gop <= m.sao.nhip, 'tách ' + tach + ' · gộp ' + gop);
    const kt = khoTruoc(m.id);
    const r = ChamHoc.cham(m, m.loiGiai, tron(kt, m.loiGiai.hamCuaEmMoi));
    BANG.push({ id: m.id, ten: m.ten, o: r.soO, nhip: r.soNhip, gop, san: dsSan.length, sao: r.sao });
    kiem(m.id + ': lời giải mẫu 3 sao, ' + r.soO + ' ô, ' + r.soNhip + ' nhịp, không chẩn đoán nào', r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, o: r.soO, nhip: r.soNhip, cd: maCua(r) }));
    const alt = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kt, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': lời giải khác (' + m.loiGiaiKhac.moTa + ') cùng nhịp, nhiều ô hơn (' + alt.soO + ' > ' + m.sao.o + '), đúng 2 sao', alt.thang && alt.soNhip === m.sao.nhip && alt.soO > m.sao.o && alt.sao === 2);
    const mm = ChamHoc.cham(m, m.maMau, kt);
    kiem(m.id + ': maMau không thắng, vừa khung; veMaMau nói về code có sẵn', !mm.thang && !maCua(mm).includes('tran-khung') && typeof m.veMaMau === 'string' && m.veMaMau.length > 20);
    kiem(m.id + ': gợi ý 1–2 câu không nói tên nút; đề 1–3 câu', m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && !/bấm|nút/i.test(m.goiY.join(' ')), m.deBai);
  }
  // lời giải gộp nhịp cho thấy BFS gộp ngắn hơn: dựng từ chuỗi BFS gộp của vài màn một sân
  for (const so of [2, 3, 4, 5, 7, 8, 9]) {
    const m = man(so);
    const r = nhipNamChamNganNhat(Object.assign({}, m, { san: m.san, batDau: m.batDau, vatThem: m.vatThem }));
    const code = chuoiThanhMa(r.chuoi);
    const sh = SanHoc.chay({ san: m.san, vatChat: m.vatChat, vat: m.vatThem, batDau: m.batDau, loaiRobot: m.loaiRobot, hamGoc: m.hamGoc, mucTieu: 'dua-vat', vatCan: 'tu' }, code);
    kiem(m.id + ': chuỗi BFS gộp nhịp (' + r.nhip + ' nhịp) chạy thật trên san-hoc.js thắng đúng số nhịp đó, ít hơn sao.nhip ' + m.sao.nhip + ' (gộp lệnh nam châm vào nhịp đi: bài tối ưu riêng)', sh.thang && sh.nhip === r.nhip && r.nhip < m.sao.nhip, J([sh.thang, sh.nhip, r.nhip]));
  }

  // 21.5: canHam tran-khung
  const m5 = man(5);
  const khaiTrien = ['for i in range(3):'].concat(m5.loiGiai.hamCuaEmMoi[0].than.map((s) => '    ' + s), ['    turn_left()', '    move()', '    move()', '    turn_left()', '    move()']);
  const r5 = ChamHoc.cham(m5, { chinh: khaiTrien }, khoTruoc('25.5'));
  kiem('21.5 canHam "tran-khung": không dùng fetch, viết thẳng cả vòng thì ' + khaiTrien.length + ' dòng > 10 ô, tran-khung, không chạy', m5.canHam === 'tran-khung' && khaiTrien.length > m5.khung.chinh && maCua(r5).includes('tran-khung') && !r5.thang && r5.sao === 0);
  kiem('21.5: fetch() thân đúng 6 dòng ≤ 10 ô, gọi u_turn và move của kho; maMau là chuyến lấy vật viết thẳng (6 dòng)', bang(m5.loiGiai.hamCuaEmMoi[0].than, ['magnet_n()', 'wait()', 'u_turn()', 'move()', 'magnet_off()', 'wait()']) && bang(m5.maMau.chinh, m5.loiGiai.hamCuaEmMoi[0].than));
  // 21.1–19.4: bài học từng màn
  const m1 = man(1);
  kiem('21.1: khay chưa có magnet_s: gọi magnet_s() là "lenh-chua-mo" không (hàm gốc không có) mà "chưa có hàm"; magnet_n() và magnet_off() có', (() => {
    const r = ChamHoc.cham(m1, { chinh: ['magnet_s()', 'wait()'] }, []);
    return r.chanDoan.some((c) => c.ma === 'ham-chua-co') || r.chanDoan.some((c) => /magnet_s/.test(c.loi));
  })());
  const m2 = man(2);
  kiem('21.2: vật gỗ chiếm ô và chắn nên đường ngắn nhất (tách nhịp) vòng sang bên (rẽ, tiến) TRƯỚC khi bật nam châm; chương trình hút ngay chỗ xuất phát thì hut-go và không thắng', (() => {
    const c = nhipNamChamNganNhat(m2, { tachNhip: true }).chuoi;
    const ca = (a) => a.nc === 'n' || a.nc === 's';
    return c.findIndex((a) => a.banh === BoDo.TIEN) < c.findIndex(ca) && !ChamHoc.cham(m2, m2.maMau, khoTruoc('25.2')).thang && maCua(ChamHoc.cham(m2, m2.maMau, khoTruoc('25.2'))).includes('hut-go');
  })());
  const m3 = man(3);
  kiem('21.3: vật nam châm chữ N cách xe 3 ô (ngoài tầm sắt): bật S hút được; bật N (cùng cực) thì đẩy, không thắng; vật sắt giả thế cùng chỗ thì KHÔNG hút được ở xa 3 ô', (() => {
    const kS = SanHoc.chay({ san: m3.san, vatChat: m3.vatChat, batDau: m3.batDau, loaiRobot: 'banh', hamGoc: m3.hamGoc, mucTieu: 'dua-vat', vatCan: 'tu' }, S);
    const kN = SanHoc.chay({ san: m3.san, vatChat: m3.vatChat, batDau: m3.batDau, loaiRobot: 'banh', hamGoc: m3.hamGoc, mucTieu: 'dua-vat', vatCan: 'tu' }, N);
    const kSat = SanHoc.chay({ san: m3.san, vatChat: ['.....', '..s..', '.....', '.....', '.....'], batDau: m3.batDau, loaiRobot: 'banh', hamGoc: m3.hamGoc, mucTieu: 'dua-vat', vatCan: 'tu' }, S);
    return kS.namCham.cam === 1 && kN.namCham.cam === null && ev(kN, 'day-vat').length === 1 && kSat.namCham.cam === null && maSK(kSat, 'ngoai-tam').length === 1;
  })());
  const m4 = man(4);
  kiem('21.4: đẩy bằng cực N vào đích sát tường (4 nhịp tách); không có tường (bỏ #) thì vật trượt 3 ô qua đích: không thắng; hút rồi mang tới đích cần 7 nhịp', (() => {
    const bo = SanHoc.chay({ san: m4.san.map((r) => r.replace('#', '.')), vatChat: m4.vatChat, batDau: m4.batDau, loaiRobot: 'banh', hamGoc: m4.hamGoc, mucTieu: 'dua-vat', vatCan: 'tu' }, L('move()'.replace('move()', 'left_move()\nright_move()\nwait()'), 'left_move()', 'right_move()', 'wait()', PHAI, N));
    const mang = nhipNamChamNganNhat(Object.assign({}, m4, { san: m4.san }), { tachNhip: true, hieuQua: ['cho', 'tien', 'phai', 'trai'] });
    const mangCode = L(TIEN, TIEN, PHAI, S, TIEN, TIEN, THA);
    const sH = SanHoc.chay({ san: m4.san, vatChat: m4.vatChat, batDau: m4.batDau, loaiRobot: 'banh', hamGoc: m4.hamGoc, mucTieu: 'dua-vat', vatCan: 'tu' }, mangCode);
    return !bo.thang && ev(bo, 'day-vat')[0].soO === 3 && mang.nhip === 4 && sH.thang === true && sH.nhip === 7 && ev(sH, 'day-vat').length === 0;
  })());
  // 21.6: cảm biến — viết cứng trượt, mỗi sân giải riêng
  const m6 = man(6);
  const cung6 = m6.loiSai.find((l) => /cứng/.test(l.moTa));
  const rc6 = ChamHoc.cham(m6, cung6.baiLam, tron(khoTruoc(m6.id), cung6.hamCuaEmMoi));
  kiem('21.6: viết cứng số bước theo sân đầu thì trượt ở sân khác (cả ba sân phải thắng)', !rc6.thang && rc6.theoSan.length === 3 && rc6.theoSan.filter((s) => s.thang).length < 3, J(rc6.theoSan.map((s) => s.thang)));
  const rg6 = ChamHoc.cham(m6, m6.loiGiai, tron(khoTruoc(m6.id), m6.loiGiai.hamCuaEmMoi));
  kiem('21.6: một chương trình duy nhất thắng cả ba sân; nhịp mỗi sân khác nhau (5, 6, 4); sân 1 và 3 vật N (grip bật S), sân 2 vật S (grip bật N)', rg6.thang && J(rg6.theoSan.map((s) => s.soNhip)) === '[5,6,4]' && rg6.theoSan.map((s) => s.namCham.cuc).every((c) => c === null) &&
    J(rg6.theoSan.map((s) => s.vet.filter((e) => e.loai === 'lenh' && /^magnet_[ns]$/.test(e.ten)).map((e) => e.ten))) === J([['magnet_s'], ['magnet_n'], ['magnet_s']]));
  // 19.10
  const m10 = man(10);
  kiem('21.10: mỗi sân đúng một vật cần mang về (sân 1 sắt, sân 2 nam châm N, sân 3 nam châm S) + vật gỗ nằm SAU nó; đúng một ô vàng nằm ngay DƯỚI đúng một ô đích D; ô vàng ở phía xuất phát của vật; ô đích không màu; không băng chuyền', sanCua(m10).every((rows, i) => {
    const lm = SanHoc.lopMauCuaSan(m10, i);
    const s = SanHoc.docSan(rows, lm.mau, lm.vatMau, m10.vatChat[i]);
    const vang = [];
    rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === 'y') vang.push({ x, y }); }));
    const co = s.vat.filter((v) => v.chat === 'sat' || v.chat === 'nam-cham'), go = s.vat.filter((v) => !v.chat || v.chat === 'go');
    return s.dich.length === 1 && vang.length === 1 && s.dich[0].x === vang[0].x && s.dich[0].y === vang[0].y - 1 && !s.dich[0].mau && co.length === 1 && go.length >= 1 && go.every((g2) => g2.y === co[0].y && g2.x > co[0].x) && vang[0].x < co[0].x &&
      co[0].chat === ['sat', 'nam-cham', 'nam-cham'][i] && (i === 0 || co[0].cuc === ['', 'N', 'S'][i]) && !/[<>^v]/.test(rows.join(''));
  }));
  kiem('21.10: lời giải thắng ba sân; mọi lần đọc color() là cảm biến bụng (cam "mau", nguon "san") và ở MỖI sân có đọc color() lúc xe ĐANG DÍNH vật; grip() hút bằng cực N (sắt), cực S (vật N), cực N (vật S)', (() => {
    const r = ChamHoc.cham(m10, m10.loiGiai, khoTruoc('25.10'));
    const cuc = r.theoSan.map((sn) => sn.vet.filter((e) => e.loai === 'lenh' && /^magnet_[ns]$/.test(e.ten)).map((e) => e.ten)[0]);
    return r.thang && J(cuc) === J(['magnet_n', 'magnet_s', 'magnet_n']) && r.theoSan.every((sn) => { let hut = false, sau = 0, sai = 0; for (const e of sn.vet) { if (e.loai === 'lenh' && /^magnet_[ns]$/.test(e.ten)) hut = true; if (e.loai === 'lenh' && e.docCamBien && e.ten === 'color') { if (e.docCamBien.cam !== 'mau' || e.docCamBien.nguon !== 'san') sai++; if (hut) sau++; } } return sai === 0 && sau >= 1; });
  })());
  const sai10 = ChamHoc.cham(m10, { chinh: ['go_wall()', 'grip()', 'turn_right()', 'magnet_off()', 'wait()'] }, khoTruoc('25.10'));
  kiem('21.10: hút rồi rẽ phải thả ngay (không mang về ô vàng) thì không thắng (chua-dua-vat)', !sai10.thang && maCua(sai10).includes('chua-dua-vat'), J(maCua(sai10)));
  // 21.5, 21.7, 21.8, 21.9 giữ luật cũ
  const k5 = SanHoc.chay({ san: man(5).san, vatChat: man(5).vatChat, batDau: man(5).batDau, loaiRobot: 'banh', hamGoc: man(5).hamGoc, mucTieu: 'dua-vat', vatCan: 'tu' }, N);
  kiem('21.5: ba vật sắt ở ba cột (không thẳng hàng); hút lần đầu lấy vật cột đầu', k5.namCham.cam === 1 && ev(k5, 'hut-vat').length === 1, J(k5.vat));
  const m7 = man(7);
  const m7KhongBang = Object.assign({}, m7, { san: m7.san.map((r) => r.replace(/\^/g, '.')) });
  kiem('21.7: bỏ làn băng thì đường tối ưu khác: BFS tách ≠ ' + m7.sao.nhip, nhipNamChamNganNhat(m7KhongBang, { tachNhip: true }).nhip !== m7.sao.nhip);
  const m7DungHang = ChamHoc.cham(m7, { chinh: ['move()', 'magnet_n()', 'wait()', 'move()', 'move()', 'move()', 'move()', 'magnet_off()', 'wait()'] }, khoTruoc('25.7'));
  kiem('21.7: tiến thẳng 4 ô (như khi không có băng) không thắng — băng đẩy xe lên hàng trên; chẩn đoán nói ô trước mũi là mép sân', !m7DungHang.thang && maCua(m7DungHang).includes('tha-bi-chan'));
  const m8 = man(8);
  kiem('21.8: maMau gọi haul() sai (thiếu magnet_off, wait), lời giải sửa thành 6 dòng; sửa xong chương trình chính giữ nguyên', bang(m8.maMau.hamCuaMan[0].than, ['magnet_n()', 'wait()', 'turn_right()', 'move()']) && bang(m8.loiGiai.hamCuaMan[0].than, ['magnet_n()', 'wait()', 'turn_right()', 'move()', 'magnet_off()', 'wait()']) && bang(m8.maMau.chinh, m8.loiGiai.chinh));
  const m9 = man(9);
  const r9 = ChamHoc.cham(m9, m9.loiGiai, khoTruoc('25.9'));
  kiem('21.9: omni không đổi hướng mặt suốt lượt chạy (huong 0 mọi nhịp), nam châm luôn hút lên', nhipVet({ vet: r9.vet }).every((n) => n.robot.huong === 0) && r9.thang);
  const k4 = ChamHoc.cham(m4, { chinh: ['move()', 'move()', 'move()'] }, khoTruoc('25.4'));
  kiem('21.4: xe không đâm bậc thang vì sân không có bậc thang; đi thẳng lên vượt hàng vật thì không thắng', !k4.thang);
}

function bang(a, b) { return J(a) === J(b); }

console.log('\n== Bảng 10 màn chương Nam châm (lời giải mẫu) ==');
{
  console.log('  màn   | ô  | nhịp | gộp | sân | tên');
  for (const b of BANG) console.log('  ' + b.id.padEnd(5) + ' | ' + String(b.o).padEnd(2) + ' | ' + String(b.nhip).padEnd(4) + ' | ' + String(b.gop).padEnd(3) + ' | ' + String(b.san).padEnd(3) + ' | ' + b.ten);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);

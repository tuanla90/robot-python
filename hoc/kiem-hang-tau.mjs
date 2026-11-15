/* ============================================================================
   kiem-hang-tau.mjs — máy kiểm HÀNG TÀU NỐI ĐUÔI (hàng đợi; mùa 4 Cảng sông, hoc/KE-HOACH-GHEP-NHIP.md mục 3d).
   Một bến có nhiều tàu nối đuôi; chỉ tàu đầu hàng ở boong T; mỗi tàu cần đúng MỘT số container. Giao đúng → cuối nhịp tàu rời, tàu kế vào.
   Giao sai → thua giao-nham. read_code() chĩa vào boong trống → số tàu đầu hàng cần, hết tàu → −1. Khai báo: cfg.hangTau = { o, can, cho? }.
     1. Lõi: giao đúng thứ tự thắng; giao số của tàu thứ hai lên tàu đầu → giao-nham; hạ đôi → giao-nham (thừa); read_code ở boong; hết tàu boong thành nước;
        cấu hình sai báo lỗi tiếng Việt; màn tàu chu kỳ cũ (cfg.tau + cfg.giao) không đổi; hàng tàu + tàu chu kỳ cùng sân.
     2. Lời chấm (cham.js): giao-nham của hàng tàu, chua-giao-tau khi còn tàu chờ.
     3. MÀN (đi qua hoc/lo-trinh-hoc.js): đủ màn ở DS_MAN; lời giải thắng mọi sân; màn ép nhiều sân mỗi sân một hàng tàu khác nhau; lời sai không thắng, ra đúng mã.
     4. "Làm theo sân 1": với màn ép nhiều sân, chương trình không đọc số (bỏ nhánh theo read_code) thắng không nổi cả màn.
   Chạy: node hoc/kiem-hang-tau.mjs            (trượt thì thoát mã 1)
         node hoc/kiem-hang-tau.mjs --pha      (nộp lời giải giao sai thứ tự làm "lời giải" → phải in HỎNG và thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const LoTrinh = require(path.join(day, 'lo-trinh-hoc.js'));
const PHA = process.argv.includes('--pha');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const clone = (x) => JSON.parse(JSON.stringify(x));
const evs = (r) => (r.vet || []).reduce((a, v) => a.concat(v.suKien || []), []).concat((r.suKien || []).filter((e) => !(r.vet || []).some((v) => (v.suKien || []).includes(e))));
const maSk = (r) => evs(r).map((e) => e.ma);

// mã màn · ep: màn ép nhiều sân (≥ bao nhiêu sân, mỗi sân một hàng tàu khác) · ghep: màn ghép ngăn xếp + hàng đợi (gói 10)
const DS_MAN = [
  { ma: 'che-ben-tau.1' }, { ma: 'che-ben-tau.2' }, { ma: 'che-ben-tau.3' }, { ma: 'che-ben-tau.4' }, { ma: 'che-ben-tau.5' },
  { ma: 'che-ben-tau.6' }, { ma: 'che-ben-tau.7' }, { ma: 'che-ben-tau.8', ep: 3 }, { ma: 'che-ben-tau.9', ep: 2 }, { ma: 'che-ben-tau.10', ep: 2 },
  { ma: 'trum-mua-cang.7', ep: 2, ghep: true }
];

console.log('\n== 1. Lõi hàng tàu nối đuôi ==');
const CAU = ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'pick_up', 'set_down', 'pick_up2', 'read_code'];
const SAN = ['~~~~~~~', '~~~~~~~', '~~~T~~~', '.D...D.', '...D...', '.......', '.......'];
// bệ (3, 3); boong (3, 2) nấc 0; A (4, 3) nấc 1; B (3, 4) nấc 2; C (2, 3) nấc 3
function cfg(chong, can, them) {
  return Object.assign({ loaiRobot: 'cau', hamGoc: CAU, camBien: [{ ma: 'quet-ma' }], san: SAN, batDau: { x: 3, y: 3, nac: 1, tam: 1 },
    chong: chong.map((c) => ({ x: c[0], y: c[1], cont: c[2].map((so) => ({ so })) })), nhipToiDa: 80, mucTieu: 'giao-tau',
    hangTau: { o: [{ x: 3, y: 2 }], can, cho: [{ x: 4, y: 2 }, { x: 5, y: 2 }] } }, them || {});
}
const LEN = 'pick_up()\nswing_left()\nset_down()\nswing_right()\n';      // kiện trên cùng ở A (nấc 1) lên boong (nấc 0), quay về A: 4 nhịp
{
  const A = [[4, 3, [5, 8, 2]]];                                             // đáy → đỉnh: 5, 8, 2
  let r = SanHoc.chay(cfg(A, [2, 8, 5]), LEN + LEN + LEN);
  kiem('giao đúng thứ tự hàng 2 → 8 → 5: thắng, có xong-giao-tau', r.thang === true && maSk(r).includes('xong-giao-tau'), J(maSk(r)));
  const roi = evs(r).filter((e) => e.ma === 'tau-roi-hang'), vao = evs(r).filter((e) => e.ma === 'tau-vao');
  kiem('ba lần tau-roi-hang đúng số [2, 8, 5], vt 0, 1, 2; hai lần tau-vao báo số kế [8, 5]; cuối cùng het-hang-tau',
    J(roi.map((e) => e.so)) === '[2,8,5]' && J(roi.map((e) => e.vt)) === '[0,1,2]' && J(vao.map((e) => e.can)) === '[8,5]' && maSk(r).includes('het-hang-tau'), J([roi, vao]));
  kiem('tàu rời ngay CUỐI NHỊP hạ (nhịp 3), tàu kế vào cùng nhịp', roi[0].nhip === 3 && vao[0].nhip === 3, J([roi[0], vao[0]]));
  kiem('kết quả: hangTau.dau = 3, daGiaoHang [2, 8, 5], sân hết container', r.hangTau && r.hangTau.dau === 3 && J(r.daGiaoHang) === '[2,8,5]' && r.chong.length === 0, J([r.hangTau, r.daGiaoHang, r.chong]));
  kiem('vết nhịp có hangTau.dau tăng dần 0 → 3', J(r.vet.filter((v) => v.hangTau).map((v) => v.hangTau.dau).filter((x, i, a) => a.indexOf(x) === i)) === "[0,1,2,3]");

  r = SanHoc.chay(cfg(A, [8, 2, 5]), LEN + LEN + LEN);
  const gn = evs(r).find((e) => e.ma === 'giao-nham');
  kiem('giao số của tàu thứ hai (2) lên tàu đầu hàng (cần 8) → thua giao-nham ngay nhịp hạ', r.thang === false && r.dungSom === 'giao-nham' && gn && gn.hang === true && gn.so === 2 && J(gn.can) === '[8]' && gn.vt === 0 && gn.nhip === 3, J(gn));
  kiem('thua rồi thì không có tau-roi-hang, hàng tàu đứng yên (dau = 0)', !maSk(r).includes('tau-roi-hang') && r.hangTau.dau === 0);

  r = SanHoc.chay(cfg(A, [2, 8]), 'pick_up2()\nswing_left()\nset_down()\n');
  const gn2 = evs(r).find((e) => e.ma === 'giao-nham');
  kiem('hạ đôi [8, 2] lên tàu cần 2: mỗi tàu chỉ MỘT container → giao-nham (số 8 không phải của tàu này)', r.dungSom === 'giao-nham' && gn2 && gn2.so === 8, J(gn2));
  r = SanHoc.chay(cfg([[4, 3, [5, 2, 2]]], [2, 2, 5]), 'pick_up2()\nswing_left()\nset_down()\n');
  const gn3 = evs(r).find((e) => e.ma === 'giao-nham');
  kiem('hạ đôi [2, 2] lên tàu cần 2: thừa một cái → giao-nham thua: true', r.dungSom === 'giao-nham' && gn3 && gn3.thua === true && gn3.so === 2, J(gn3));

  // read_code ở boong: số tàu đầu hàng cần; sau mỗi tàu rời thì đổi; hết tàu −1
  const DOC = 'swing_left()\na = read_code()\nswing_right()\n' + LEN + 'swing_left()\nb = read_code()\nswing_right()\nif a == 2:\n    if b == 8:\n        extend()\n';
  r = SanHoc.chay(cfg(A, [2, 8, 5]), DOC);
  const doc = evs(r).filter((e) => e.ma === 'doc-cam-bien');
  kiem('read_code() chĩa vào boong trống: 2, tàu rời rồi đọc lại: 8 (chương trình vươn cần khi cả hai đúng)', r.tam === 2 && J(doc.map((e) => e.so)) === '[2,8]' && doc[0].hangTau === true && doc[0].can === 2 && doc[0].trong === false, J(doc.map((e) => [e.so, e.hangTau, e.trong])) + ' tam ' + r.tam);
  kiem('read_code() ở chồng thường không đổi (đọc container trên cùng, không có cờ hangTau)', (() => { const q = SanHoc.chay(cfg(A, [2, 8, 5]), 'a = read_code()\nwait()\n'); const e = evs(q).find((s) => s.ma === 'doc-cam-bien'); return e.so === 2 && !e.hangTau; })());

  r = SanHoc.chay(cfg(A, [2, 8, 5]), LEN + LEN);
  kiem('giao mới 2 / 3 tàu: chưa thắng, hangTau.dau = 2', r.thang === false && !r.dungSom && r.hangTau.dau === 2);
  r = SanHoc.chay(cfg(A, [2, 8, 5]), 'swing_left()\npick_up()\n');
  const mh = evs(r).find((e) => e.ma === 'moc-hut');
  kiem('móc ở boong trống của tàu đầu hàng → moc-hut trong', mh && mh.vat === 'trong', J(mh));

  // bài ghép ngăn xếp + hàng đợi của kế hoạch 3d: A [5, 2, 8], B trống, hàng tàu 2 → 8 → 5
  const GHEP = 'pick_up()\nswing_right()\nset_down()\nswing_left()\n' + LEN + 'swing_right()\npick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\n' + LEN;
  r = SanHoc.chay(cfg([[4, 3, [5, 2, 8]]], [2, 8, 5]), GHEP);
  kiem('bài ghép 3d: chồng A [5, 2, 8], cất 8 sang B, giao 2, lấy 8 ở B giao, giao 5 → thắng', r.thang === true && J(r.daGiaoHang) === '[2,8,5]', J([r.daGiaoHang, r.dungSom]));
}
{
  const loi = (c, mau) => { try { SanHoc.chay(c, 'wait()\n'); return 'không báo lỗi'; } catch (e) { return mau.test(e.message) ? true : e.message; } };
  const A = [[4, 3, [5, 8, 2]]];
  let k;
  kiem('cấu hình: can rỗng → lỗi tiếng Việt', (k = loi(cfg(A, []), /hangTau: can phải là mảng/)) === true, k);
  kiem('cấu hình: can 9 tàu (quá 8) → lỗi', (k = loi(cfg([[4, 3, [5, 5, 5, 5]], [3, 4, [5, 5, 5, 5]], [2, 3, [5]]], [5, 5, 5, 5, 5, 5, 5, 5, 5]), /hangTau: can phải là mảng 1–8/)) === true, k);
  kiem('cấu hình: số cần không có trên sân → lỗi', (k = loi(cfg(A, [2, 9]), /chỉ có 0/)) === true, k);
  kiem('cấu hình: cần hai container số 2 mà sân chỉ có một → lỗi', (k = loi(cfg(A, [2, 2]), /cần 2 container số 2 mà trên sân chỉ có 1/)) === true, k);
  kiem('cấu hình: ô bến không phải T → lỗi', (k = loi(cfg(A, [2], { hangTau: { o: [{ x: 3, y: 1 }], can: [2] } }), /không phải ô boong T/)) === true, k);
  kiem('cấu hình: ô chờ không phải nước → lỗi', (k = loi(cfg(A, [2], { hangTau: { o: [{ x: 3, y: 2 }], can: [2], cho: [{ x: 3, y: 3 }] } }), /ô chờ .* phải là ô nước/)) === true, k);
  kiem('cấu hình: bến hàng tàu trùng ô tàu chu kỳ → lỗi', (k = loi(cfg(A, [2], { tau: [{ o: [{ x: 3, y: 2 }], co: 3, vang: 2 }] }), /đã thuộc một tàu trong cfg.tau/)) === true, k);
  kiem('cấu hình: hangTau là mảng (không phải { o, can }) → lỗi', (k = loi(cfg(A, [2], { hangTau: [2, 8] }), /hangTau phải là/)) === true, k);
  kiem('cấu hình: ô T không khai tàu nào, không hangTau → lỗi cũ còn nguyên', (k = loi(cfg(A, [2], { hangTau: undefined, tau: undefined }), /không thuộc tàu nào/)) === true, k);
  kiem('hằng HANG_TAU_TOI_DA = 8 xuất ra', SanHoc.HANG_TAU_TOI_DA === 8);
}
{
  // tàu chu kỳ cũ không đổi + cùng sân với hàng tàu
  const SAN2 = ['~~~~~~~', '~~~~~~~', '~~~T~~~', '.DT..D.', '...D...', '.......', '.......'];
  const co = { loaiRobot: 'cau', hamGoc: CAU, camBien: [{ ma: 'quet-ma' }], san: SAN, batDau: { x: 3, y: 3, nac: 1, tam: 1 }, chong: [{ x: 4, y: 3, cont: [{ so: 18 }] }],
    tau: [{ o: [{ x: 3, y: 2 }], co: 3, vang: 2 }], giao: [{ tau: 0, so: [18] }], mucTieu: 'giao-tau', nhipToiDa: 40 };
  let r = SanHoc.chay(co, 'pick_up()\nswing_left()\nset_down()\n');
  kiem('màn tàu chu kỳ cũ (cfg.tau + cfg.giao): vẫn thắng, tau-roi ở nhịp 3, kết quả hangTau = null', r.thang === true && r.hangTau === null && evs(r).some((e) => e.ma === 'tau-roi' && e.nhip === 3), J(maSk(r)));
  const ca2 = { loaiRobot: 'cau', hamGoc: CAU, camBien: [{ ma: 'quet-ma' }], san: SAN2, batDau: { x: 3, y: 3, nac: 1, tam: 1 }, chong: [{ x: 4, y: 3, cont: [{ so: 18 }, { so: 7 }] }],
    tau: [{ o: [{ x: 2, y: 3 }], co: 9, vang: 2 }], giao: [{ tau: 0, so: [18] }], hangTau: { o: [{ x: 3, y: 2 }], can: [7] }, mucTieu: 'giao-tau', nhipToiDa: 40 };
  r = SanHoc.chay(ca2, LEN + 'pick_up()\nswing_left()\nswing_left()\nset_down()\nwait()\nwait()\n');
  kiem('hàng tàu + tàu chu kỳ cùng sân: thắng khi hết hàng tàu VÀ tàu chu kỳ mang đủ', r.thang === true && J(r.daGiaoHang) === '[7]' && J(r.daGiao) === '[[18]]', J([r.daGiaoHang, r.daGiao, r.dungSom]));
  r = SanHoc.chay(ca2, LEN + 'swing_left()\nc = read_code()\nif c == -1:\n    extend()\n');
  const rh = SanHoc.chay(ca2, LEN + 'pick_up()\nswing_left()\nset_down()\n'), hc = evs(rh).find((e) => e.ma === 'ha-bi-chan');
  kiem('hết hàng tàu: boong thành mặt nước, hạ tiếp → ha-bi-chan tau-vang', hc && hc.vat === 'tau-vang' && evs(rh).some((e) => e.ma === 'het-hang-tau'), J(hc));
  const docH = evs(r).filter((e) => e.ma === 'doc-cam-bien');
  kiem('… mới hết hàng tàu, tàu chu kỳ chưa nhận: chưa thắng; read_code() ở boong hết tàu trả −1 (trong: true)', r.thang === false && r.tam === 2 && docH.length === 1 && docH[0].so === -1 && docH[0].trong === true, J(docH) + ' tam ' + r.tam);
}

console.log('\n== 2. Lời chấm ==');
{
  const man = { ma: 'thu-hang-tau', ten: 'Thử hàng tàu', loaiRobot: 'cau', robot: { than: 'cau', tay: 'moc-cau', camBien: [{ ma: 'quet-ma', o: 'tren' }] }, hamGoc: CAU, cauTruc: ['for', 'if', 'while'],
    san: SAN, batDau: { x: 3, y: 3, nac: 1, tam: 1 }, chong: [{ x: 4, y: 3, cont: [{ so: 5 }, { so: 8 }, { so: 2 }] }], hangTau: { o: [{ x: 3, y: 2 }], can: [8, 2, 5] },
    mucTieu: 'giao-tau', khung: { chinh: 20, moiHam: 10 }, hamCuaEmCan: [], taoHam: [] };
  const L = ['pick_up()', 'swing_left()', 'set_down()', 'swing_right()'];
  let r = ChamHoc.cham(man, { chinh: L.concat(L, L), hamCuaMan: [] }, []);
  const cd = (r.chanDoan || []).find((c) => c.ma === 'giao-nham');
  kiem('cham.js: giao sai thứ tự → chẩn đoán giao-nham, lời nói "tàu đầu hàng cần container số 8"', r.thang === false && cd && /tàu đầu hàng cần container số 8/.test(cd.thongDiep || cd.loi || J(cd)), J(cd));
  kiem('cham.js: lời giao-nham hàng tàu không còn chữ "tàu NaN" / "undefined"', cd && !/NaN|undefined|null/.test(J(cd.thongDiep || cd.loi || '')), J(cd));
  man.hangTau.can = [2, 8, 5];
  r = ChamHoc.cham(man, { chinh: L.concat(L), hamCuaMan: [] }, []);
  const cd2 = (r.chanDoan || []).find((c) => c.ma === 'chua-giao-tau');
  kiem('cham.js: giao 2 / 3 tàu rồi hết chương trình → chua-giao-tau "còn 1 tàu … cần container số 5"', r.thang === false && cd2 && /còn 1 tàu/.test(J(cd2)) && /số 5/.test(J(cd2)), J(cd2));
  r = ChamHoc.cham(man, { chinh: L.concat(L, L), hamCuaMan: [] }, []);
  kiem('cham.js: giao đủ ba tàu đúng thứ tự → thắng', r.thang === true, J((r.chanDoan || []).map((c) => c.ma)));
}

/* ---- 3–4. MÀN thật: đi qua lộ trình xuất bản ---- */
const khoHam = new Map(), khoTruoc = new Map();
for (const m of LoTrinh.danhSach) {
  khoTruoc.set(m.ma, [...khoHam.values()].map(clone));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) khoHam.set(h.ten, clone(h));
}
function chamMan(m, lg) {
  const hs = new Map((khoTruoc.get(m.ma) || []).map((h) => [h.ten, clone(h)]));
  for (const h of lg.hamCuaEmMoi || m.loiGiai.hamCuaEmMoi || []) hs.set(h.ten, clone(h));
  return ChamHoc.cham(m, { chinh: lg.chinh, hamCuaMan: lg.hamCuaMan || m.loiGiai.hamCuaMan || [], doi: lg.doi }, [...hs.values()]);
}
const cdMa = (r) => (r.chanDoan || []).map((c) => c.ma);
const soSan = (m) => (Array.isArray(m.san[0]) ? m.san.length : 1);
const hangCua = (m, k) => (Array.isArray(m.hangTau) ? m.hangTau[k] : m.hangTau);
function motSan(m, k) {
  const n = soSan(m), q = clone(m);
  q.taoHam = [];                                           // thử một sân: không đòi tạo hàm (chỉ xem dãy lệnh cố định có thắng sân đó không)
  for (const f of ['san', 'batDau', 'chong', 'bongMo', 'tau', 'giao', 'hangTau']) if (Array.isArray(q[f]) && q[f].length === n && n > 1) q[f] = [q[f][k]];
  return q;
}

console.log('\n== 3. Màn hàng tàu (' + DS_MAN.length + ' màn) ==');
const dsMan = [];
let daPha = false;
for (const d of DS_MAN) {
  const m = LoTrinh.danhSach.find((q) => q.ma === d.ma);
  kiem(d.ma + ' có trong lộ trình xuất bản', !!m);
  if (!m) continue;
  dsMan.push([d, m]);
  const n = soSan(m);
  kiem(d.ma + ' "' + m.ten + '": có hàng tàu nối đuôi ở mọi sân (mục tiêu giao-tau)', m.mucTieu === 'giao-tau' && [...Array(n).keys()].every((k) => hangCua(m, k) && hangCua(m, k).can.length >= 1));
  if (![...Array(n).keys()].every((k) => hangCua(m, k))) continue;
  let giai = m.loiGiai;
  if (PHA && !daPha && (m.loiSai || []).some((ls) => (ls.phaiCoMa || []).includes('giao-nham'))) {
    const ls = m.loiSai.find((q) => (q.phaiCoMa || []).includes('giao-nham'));
    giai = Object.assign({}, ls.baiLam, { hamCuaEmMoi: ls.hamCuaEmMoi }); daPha = true;
  }
  let r = chamMan(m, giai);
  kiem(d.ma + ': lời giải thắng mọi sân (' + n + ' sân)', r.thang === true, J(cdMa(r)));
  const code = [].concat(m.loiGiai.chinh, ...(m.loiGiai.hamCuaEmMoi || []).map((h) => h.than), ...(m.loiGiai.hamCuaMan || []).map((h) => h.than)).join('\n');
  kiem(d.ma + ': lời giải không dùng list (mùa 4 chưa học list)', !/\[|\blist\b|append|pop\(/.test(code), code);
  kiem(d.ma + ': đề và gợi ý không gọi chồng / móc đôi là "hàng đợi" sai chỗ; chữ "hàng đợi" (nếu có) đi với tàu', !/hàng đợi/.test(m.deBai + (m.goiY || []).join(' ')) || /tàu/.test(m.deBai + (m.goiY || []).join(' ')));
  if (d.ep) {
    const hang = [...Array(n).keys()].map((k) => J(hangCua(m, k).can));
    kiem(d.ma + ': ≥ ' + d.ep + ' sân, mỗi sân một hàng tàu khác nhau ' + hang.join(' '), n >= d.ep && new Set(hang).size === n, n + ' sân');
    kiem(d.ma + ': có lời sai ra mã giao-nham', (m.loiSai || []).some((ls) => (ls.phaiCoMa || []).includes('giao-nham')));
    kiem(d.ma + ': lời giải đọc số bằng read_code()', /read_code\(\)/.test(code));
  }
  if (d.ghep) {
    kiem(d.ma + ': gói 10: nhipTheo tong, nhiều sân', m.nhipTheo === 'tong' && n >= 2);
    kiem(d.ma + ': ghép ngăn xếp + hàng đợi: mỗi sân có chồng ≥ 3 container mà tàu đầu hàng KHÔNG cần cái trên cùng', [...Array(n).keys()].every((k) => {
      const ch = (n > 1 ? m.chong[k] : m.chong).filter((c) => c.cont.length >= 3);
      return ch.length >= 1 && ch.every((c) => c.cont[c.cont.length - 1].so !== hangCua(m, k).can[0]);
    }));
  }
  if (m.chinhCoDinh && !(m.loiGiai.hamCuaMan || []).length) kiem(d.ma + ': màn trình diễn khoá mã, không loiSai', (m.loiSai || []).length === 0);
  (m.loiSai || []).forEach((ls) => {
    r = chamMan(m, Object.assign({}, ls.baiLam, { hamCuaEmMoi: ls.hamCuaEmMoi }));
    kiem(d.ma + ' lời sai "' + ls.moTa.slice(0, 60) + '": không thắng, có mã ' + (ls.phaiCoMa || []).join(' + '), r.thang === false && (ls.phaiCoMa || []).every((ma) => cdMa(r).includes(ma)), J(cdMa(r)));
  });
}
kiem('chương che-ben-tau vẫn có màn tạo hàm move_tower2(d1, d2) (gói 7, 9, 10 còn gọi)', LoTrinh.danhSach.some((m) => m.chuong === 'che-ben-tau' && (m.taoHam || []).includes('move_tower2') &&
  (m.loiGiai.hamCuaEmMoi || []).some((h) => h.ten === 'move_tower2' && J(h.thamSo) === '["d1","d2"]')));

console.log('\n== 4. Làm theo sân 1: lời giải riêng của một sân thua cả màn ==');
for (const [d, m] of dsMan) {
  if (!d.ep) continue;
  const ls = (m.loiSai || []).find((q) => q.theoSan1);
  kiem(d.ma + ': có lời sai đánh dấu theoSan1 (dãy lệnh cố định của sân 1)', !!ls);
  if (!ls) continue;
  const bai = Object.assign({}, ls.baiLam, { hamCuaEmMoi: ls.hamCuaEmMoi });
  const r1 = chamMan(motSan(m, 0), bai), r = chamMan(m, bai);
  kiem(d.ma + ': dãy lệnh cố định THẮNG sân 1 một mình', r1.thang === true, J(cdMa(r1)));
  kiem(d.ma + ': cùng dãy lệnh đó THUA cả màn', r.thang === false, J(cdMa(r)));
}

console.log('\n' + (hong ? 'HỎNG ' + hong + ' · ' : '') + 'ĐẠT ' + dat + ' · HỎNG ' + hong + (PHA ? '   (chạy --pha: PHẢI hỏng)' : ''));
process.exit(hong ? 1 : 0);

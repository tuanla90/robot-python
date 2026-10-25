/* ============================================================================
   kiem-hai-robot-man.mjs — máy kiểm chương `hai-robot` (Đội hai robot, 10 màn; man-hai-robot.js) của "Robot Chấn Hưng" (KE-HOACH-HAI-ROBOT.md).
   Gồm:
   - bộ dò đường do-duong-hai-robot.mjs: sân tự dựng (cùng nhắm một ô, đổi chỗ xuyên nhau, đồng đội chắn đường, tách vùng = dò chung); đường BFS của mọi
     sân đổi thành lệnh gốc rồi chạy SanHoc.chay phải thắng đúng bằng số nhịp BFS;
   - 10 màn: hai robot, robot / khay / cấu trúc chung; lời giải 3 sao (đúng sao.o ô, sao.nhip nhịp, không chẩn đoán); BFS ≤ sao.nhip; loiGiaiKhac đúng 2 sao;
     mọi congThucKhac thắng; loiSai đúng mã; hai chương trình rỗng không thắng; thiếu chương trình của một robot không thắng;
   - luật riêng: 11.1 R1 viết sẵn; 4, 5, 10 phải chờ bằng cảm biến (đếm nhịp theo một sân thì hỏng sân khác); 7 hai robot cùng một chương trình; 9 R2 làm mốc;
     trùm có huy hiệu; không hàm cốt truyện mới; thẻ script của game/choi.html.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs.
   Chạy: node hoc/kiem-hai-robot-man.mjs        (trượt thì thoát mã 1)
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
const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
const tags = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
for (const t of tags) if (/^\.\.\/(man-[^/]+|lap-rap)\.js$/.test(t)) require(path.join(day, t.slice(3)));
const ManHoc = require(path.join(day, 'man-chuoi-1.js'));
const { nhipHaiRobotSan, nhipHaiRobotTatCa, soSan, chuoiThanhMaDoi } = await import('./do-duong-hai-robot.mjs');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const tatCa = ManHoc.danhSach;
const ds = tatCa.filter((m) => m.chuong === 'hai-robot');
const man = (so) => ManHoc.timMa('hai-robot.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const B = (c1, c2) => ({ doi: [{ chinh: c1 }, { chinh: c2 }] });

/** Kho THẬT của học sinh lúc tới màn (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải). */
function khoTruoc(ma) {
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  for (const m of tatCa) {
    if (m.ma === ma) break;
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi) { if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo, { taoHam: m.taoHam }); kho.sua(h.ten, h.than); }
  }
  return kho.ds();
}
/** Chạy chuỗi BFS của sân si bằng lõi thật. */
function chayChuoi(m, si, chuoi) {
  const nhieu = Array.isArray(m.san[0]);
  return SanHoc.chay({
    san: nhieu ? m.san[si] : m.san, mucTieu: m.mucTieu, nhipToiDa: 200,
    doi: m.doi.map((d) => ({ batDau: nhieu ? d.batDau[si] : d.batDau, loaiRobot: 'banh', hamGoc: m.hamGoc, camBien: m.robot.camBien }))
  }, chuoiThanhMaDoi(chuoi));
}

console.log('\n== 1. Bộ dò đường hai robot ==');
{
  const mini = (san, bd, mucTieu) => ({ san, mucTieu, doi: bd.map((b) => ({ batDau: b })) });
  const thang = mini(['F..F'], [{ x: 1, y: 0, huong: 3 }, { x: 2, y: 0, huong: 1 }], 'toi-co');
  kiem('hai robot quay lưng, cờ ngay trước mặt: 1 nhịp', nhipHaiRobotSan(thang).nhip === 1);
  // hai robot đối mặt trong hành lang một ô, cờ ở hai đầu sau lưng đồng đội: không đi qua nhau được → không tới (null)
  const doiMat = mini(['#####', 'F...F', '#####'], [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }], 'toi-co');
  kiem('hành lang một ô, mỗi robot phải lùi về cờ sau lưng: 1 nhịp (lùi) — bộ dò thấy cờ nào cũng được', nhipHaiRobotSan(doiMat).nhip === 1);
  const quaNhau = mini(['#####', '#...#', '#F#F#'], [{ x: 2, y: 1, huong: 3 }, { x: 3, y: 1, huong: 3 }], 'toi-co');
  const qn = nhipHaiRobotSan(quaNhau);
  kiem('robot sau không vào được ô robot trước đang rời (không bám đuôi sát): R1 ở (2,1), R2 ở (3,1) cùng quay trái, cờ dưới (1,2) và (3,2)', qn.nhip !== null && qn.nhip >= 2, J(qn.nhip));
  // cùng nhắm một ô: ô giữa (2,1), cờ chỉ ở ô giữa phía dưới — hai robot tiến vào cùng lúc thì cả hai đứng yên
  const cungO = mini(['#####', '#...#', '##F##'], [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }], 'toi-co');
  kiem('một cờ cho hai robot: không bao giờ cả hai tới cờ (null)', nhipHaiRobotSan(cungO).nhip === null);
  const vat = mini(['o..D', '#..#'], [{ x: 1, y: 0, huong: 3 }, { x: 2, y: 1, huong: 0 }], 'dua-vat');
  const rv = nhipHaiRobotSan(vat);
  kiem('đưa vật: bộ dò tìm được, đường chạy thật thắng đúng số nhịp', rv.nhip !== null && (() => { const r = chayChuoi(Object.assign({ hamGoc: man(1).hamGoc, robot: man(1).robot }, vat), 0, rv.chuoi); return r.thang && r.nhip === rv.nhip; })(), J(rv.nhip));
  // tách vùng: hai làn ngăn tường dò riêng = dò chung (sân nhỏ nên dò chung được)
  const hai = mini(['o#o', '.#.', 'D#D'], [{ x: 0, y: 1, huong: 0 }, { x: 2, y: 1, huong: 0 }], 'dua-vat');
  const rieng = nhipHaiRobotSan(hai).nhip;
  const chung = nhipHaiRobotSan(mini(['o.o', '...', 'D.D'], [{ x: 0, y: 1, huong: 0 }, { x: 2, y: 1, huong: 0 }], 'dua-vat')).nhip;
  kiem('tách vùng: hai làn ngăn tường dò riêng ra cùng số nhịp với sân không ngăn (' + rieng + ' = ' + chung + ')', rieng !== null && rieng === chung);
}

console.log('\n== 2. Mười màn: dữ liệu chung ==');
kiem('chương hai-robot đứng ngay sau robot-hoan-thien trong thuTu, thuộc đợt 2, có tên và gói riêng ngay sau gói Robot hoàn thiện',
  ThuTu.thuTu.indexOf('hai-robot') === ThuTu.thuTu.indexOf('robot-hoan-thien') + 1 && ThuTu.laDot2('hai-robot') && ThuTu.ten['hai-robot'] === 'Đội hai robot' &&
    ThuTu.goi.findIndex((g) => g.ma === 'hai-robot') === ThuTu.goi.findIndex((g) => g.ma === 'robot') + 1 && J(ThuTu.goi.find((g) => g.ma === 'hai-robot').chuong) === '["hai-robot"]');
kiem('10 màn, hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm', ds.length === 10 && J(ds.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']));
kiem('mọi màn: hai robot (man.doi 2 phần, mỗi phần có batDau), robot chung { hai-banh, kep, khoang-cach ở hông }, khay = bánh + tay + ba cảm biến, for / if / while, Xưởng mở, khung 10 ô',
  ds.every((m) => Array.isArray(m.doi) && m.doi.length === 2 && m.doi.every((d) => d.batDau) && J(m.robot) === J({ than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] }) &&
    J(m.hamGoc) === J(['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear']) &&
    J(m.cauTruc) === '["for","if","while"]' && m.moXuong === true && m.camHamCuaEm === false && m.khung.chinh === 10 && ['toi-co', 'dua-vat'].includes(m.mucTieu)));
kiem('man.batDau cấp ngoài là của R1 (mã đọc màn một robot không vỡ)', ds.every((m) => J(m.batDau) === J(m.doi[0].batDau)));
kiem('màn nhiều sân: đúng 3 sân cùng khung, batDau mỗi robot là mảng 3, nhipTheo "tong"; màn một sân không có nhipTheo',
  ds.every((m) => (Array.isArray(m.san[0])
    ? m.san.length === 3 && m.san.every((s) => s.length === m.san[0].length && s[0].length === m.san[0][0].length) && m.doi.every((d) => Array.isArray(d.batDau) && d.batDau.length === 3) && m.nhipTheo === 'tong'
    : m.nhipTheo === undefined)));
kiem('sân tối đa 7 cột × 9 hàng', ds.every((m) => (Array.isArray(m.san[0]) ? m.san : [m.san]).every((s) => s.length <= 9 && s[0].length <= 7)));
kiem('không màn nào bắt chế hàm cốt truyện mới (taoHam rỗng, lời giải không thêm hàm của em)', ds.every((m) => m.taoHam.length === 0 && m.loiGiai.hamCuaEmMoi.length === 0));
kiem('màn 10 là trùm, có huy hiệu hai-robot', man(10).hang === 'trum' && man(10).huyHieu && man(10).huyHieu.ma === 'hai-robot');

console.log('\n== 3. Mười màn: lời giải, sao, lời sai, đường tắt ==');
for (const m of ds) {
  const kho = khoTruoc(m.ma);
  const r = ChamHoc.cham(m, m.loiGiai, kho);
  kiem(m.id + ' ' + m.ten + ': lời giải 3 sao, đúng ' + m.sao.o + ' ô, ' + m.sao.nhip + ' nhịp, không chẩn đoán',
    r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, o: r.soO, nhip: r.soNhip, cd: maCua(r) }));
  const k = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, kho);
  kiem(m.id + ': loiGiaiKhac (' + m.loiGiaiKhac.moTa + ') thắng, nhiều ô hơn, đúng 2 sao', k.thang && k.soO > m.sao.o && k.sao === 2, J({ sao: k.sao, o: k.soO }));
  (m.congThucKhac || []).forEach((c) => { const x = ChamHoc.cham(m, c.baiLam, kho); kiem(m.id + ': cách khác thắng (' + c.moTa + ')', x.thang, J(maCua(x))); });
  m.loiSai.forEach((ls) => {
    const x = ChamHoc.cham(m, ls.baiLam, kho);
    const thieu = ls.phaiCoMa.filter((c) => !maCua(x).includes(c));
    kiem(m.id + ' lời sai (' + ls.moTa + '): không thắng, đủ mã ' + ls.phaiCoMa.join('+'), !x.thang && thieu.length === 0, 'thiếu ' + thieu.join() + ' · có ' + maCua(x).join());
  });
  kiem(m.id + ': hai chương trình rỗng không thắng', !ChamHoc.cham(m, B([], []), kho).thang);
  const g = m.loiGiai.doi;
  kiem(m.id + ': chỉ R1 làm (R2 rỗng) không thắng, chỉ R2 làm (R1 rỗng) không thắng',
    !ChamHoc.cham(m, B(g[0].chinh, []), kho).thang && !ChamHoc.cham(m, B([], g[1].chinh), kho).thang);
  // bộ dò: tổng nhịp ngắn nhất ≤ sao.nhip; đường của từng sân chạy thật thắng đúng số nhịp
  let tong = 0, khop = true, chiTiet = [];
  for (let si = 0; si < soSan(m); si++) {
    const b = nhipHaiRobotSan(m, si);
    if (b.nhip === null) { tong = null; break; }
    tong += b.nhip;
    const x = chayChuoi(m, si, b.chuoi);
    if (!(x.thang && x.nhip === b.nhip)) khop = false;
    chiTiet.push(b.nhip + '/' + x.nhip);
  }
  kiem(m.id + ': bộ dò hai robot ' + tong + ' nhịp ≤ sao.nhip ' + m.sao.nhip + ' (chấm theo lời giải chuẩn), đường dò được chạy thật thắng đúng số nhịp',
    tong !== null && tong <= m.sao.nhip && khop && nhipHaiRobotTatCa(m) === tong, chiTiet.join(' '));
}

console.log('\n== 4. Luật riêng từng màn ==');
{
  const m1 = man(1);
  kiem('11.1: R1 đã viết sẵn đúng lời giải, R2 trống; bấm Chạy ngay thì R2 chưa tới cờ',
    J(m1.maMau.doi[0].chinh) === J(m1.loiGiai.doi[0].chinh) && m1.maMau.doi[1].chinh.length === 0 && maCua(ChamHoc.cham(m1, m1.maMau, khoTruoc(m1.ma))).includes('chua-toi-co'));
  const kd = ChamHoc.cham(m1, B(['go_wall()'], []), khoTruoc(m1.ma)).chanDoan.find((c) => c.ma === 'chua-toi-co');
  kiem('11.1: chẩn đoán R2 chưa tới cờ ghi rõ robot (c.xe = 1, lời bắt đầu "R2:")', kd && kd.xe === 1 && /^R2:/.test(kd.loi), J(kd));
  // màn nhiều sân chờ bằng cảm biến: R2 đếm nhịp theo sân ngắn nhất thì hỏng sân dài; chờ đủ cho sân dài nhất thì thắng nhưng chậm hơn (không đủ sao nhanh)
  for (const so of [4, 5, 10]) {
    const m = man(so), kho = khoTruoc(m.ma);
    const saiDem = m.loiSai.find((l) => /đếm nhịp|đi luôn/.test(l.moTa));
    const r = saiDem && ChamHoc.cham(m, saiDem.baiLam, kho);
    kiem(m.id + ': R2 không chờ bằng cảm biến thì có sân hỏng', r && !r.thang && r.theoSan.some((s) => !s.thang), r && J(r.theoSan.map((s) => s.thang)));
  }
  const cham4 = man(4).congThucKhac.map((c) => ChamHoc.cham(man(4), c.baiLam, khoTruoc(man(4).ma)));
  kiem('11.4: chờ đủ lâu cho sân dài nhất thì thắng nhưng chậm hơn lời giải chuẩn', cham4.every((r) => r.thang && r.soNhip > man(4).sao.nhip && r.sao < 3));
  const m7 = man(7);
  kiem('11.7: hai robot cùng MỘT chương trình; số vật mỗi làn khác nhau giữa các sân',
    J(m7.loiGiai.doi[0].chinh) === J(m7.loiGiai.doi[1].chinh) && new Set(m7.san.map((s) => s.join('').split('o').length)).size > 1);
  const m8 = man(8);
  kiem('11.8: R2 không vào hốc thì R1 không đặt được vật vào ô đích', m8.loiSai.every((l) => !ChamHoc.cham(m8, l.baiLam, khoTruoc(m8.ma)).thang));
  const m9 = man(9), r9 = ChamHoc.cham(m9, B(m9.loiGiai.doi[0].chinh, []), khoTruoc(m9.ma));
  kiem('11.9: R2 không làm mốc thì R1 chạy quá ô đích ở cả ba sân', r9.theoSan.every((s) => !s.thang), J(r9.theoSan.map((s) => s.thang)));
  kiem('11.9: ô đích mỗi sân một chỗ, ngõ của R2 đổ xuống ngay sau ô đích', m9.san.every((s, i) => s[2].indexOf('D') + 1 === m9.doi[1].batDau[i].x) && new Set(m9.san.map((s) => s[2].indexOf('D'))).size === 3);
}

console.log('\n== 5. game/choi.html ==');
{
  const vtri = (t) => tags.indexOf('../' + t);
  kiem('choi.html có đúng một thẻ script ../man-hai-robot.js, nạp sau man-robot-hoan-thien.js và thu-tu-chuong.js, có file trên đĩa',
    tags.filter((t) => t === '../man-hai-robot.js').length === 1 && vtri('man-hai-robot.js') > vtri('man-robot-hoan-thien.js') && vtri('man-hai-robot.js') > vtri('thu-tu-chuong.js') && fs.existsSync(path.join(day, 'man-hai-robot.js')));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);

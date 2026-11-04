/* ============================================================================
   kiem-giao-dien-chon-doi.mjs — máy kiểm GIAO DIỆN CHỌN ĐỘI / LẮP ROBOT THỨ HAI / BA ROBOT (gói M9D2 4/11) của "Mật Lệnh Robot". Node, không trình duyệt.
   1. chuanHoa: màn chỉ có chonDoi (không lapRap) cũng được điền bản mặc định (LapRap.macDinh) qua ManHoc.chuanHoa — không cần gọi macDinh tay.
   2. Nguồn: choi.html nạp man-chon-doi.js sau co-may.js / lap-rap.js, thu-mua-9.js nạp cuối; ung-dung.js rẽ đúng nhánh (đọc chuỗi nguồn).
   3. Màn giả của hoc/game/thu-mua-9.js chạy thật qua máy chấm (đội ghép theo cách mẫu thắng).
   Tự chứng minh: mỗi phép đọc nguồn chạy lại trên chuỗi đã đổi tạm → phải đỏ.
   Chạy: node hoc/kiem-giao-dien-chon-doi.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const LapRap = require(path.join(day, 'lap-rap.js'));
const Cham = require(path.join(day, 'cham.js'));
const ManHoc = require(path.join(day, 'man-chuoi-1.js'));
const ThuMua9 = require(path.join(day, 'game', 'thu-mua-9.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); } else { hong++; console.log('  ✗ HỎNG ' + ten + (chiTiet ? '\n      ' + String(chiTiet).slice(0, 1200) : '')); }
}
const J = (o) => JSON.stringify(o);
const docNguon = (p) => fs.readFileSync(path.join(day, p), 'utf8');

console.log('1. chuanHoa điền bản mặc định cho màn chọn đội');
{
  const m = ThuMua9.manChonDoi();                                                       // thu-mua-9.js chỉ gọi ManHoc.chuanHoa, không gọi macDinh tay
  kiem('màn chỉ có chonDoi: chuanHoa điền man.doi theo cachMau[0] (R1 xe chở hàng, R2 xe cứu hỏa), R3 khoá giữ nguyên',
    m.doi[0].loaiRobot === 'banh' && m.doi[1].loaiRobot === 'xich' && m.doi[2].coDinh === true && m.loaiRobot === 'banh' && m.robot.than === 'hai-banh', J(m.doi.map((r) => r.loaiRobot)));
  kiem('chuanHoa: loiGiai đội có đủ 3 chương trình (R3 lấy maMau.doi[2]) và hamCuaEmMoi', Array.isArray(m.loiGiai.doi) && m.loiGiai.doi.length === 3 && Array.isArray(m.loiGiai.hamCuaEmMoi));
  const src = docNguon('man-chuoi-1.js');
  const re = /if \(m\.lapRap \|\| m\.chonDoi\) \{ var LR = laNode \? require\('\.\/lap-rap\.js'\) : window\.LapRap; if \(LR\) LR\.macDinh\(m\); \}/;
  kiem('man-chuoi-1.js: chuanHoaMan gọi LapRap.macDinh khi m.lapRap || m.chonDoi (cả Node lẫn trình duyệt: window.LapRap)', re.test(src));
  kiem('tự chứng minh: bỏ "|| m.chonDoi" → phép trên đỏ', !re.test(src.replace('m.lapRap || m.chonDoi', 'm.lapRap')));
  const thuong = ManHoc.chuanHoa({ ma: 'x', san: ['###', '#.#', '###'], batDau: { x: 1, y: 1, huong: 1 }, loaiRobot: 'banh', maMau: { chinh: [] }, loiGiai: { chinh: [] }, loiSai: [], khung: { chinh: 10 } });
  kiem('màn thường (không chonDoi / lapRap) không bị điền gì thêm', thuong.loaiRobot === 'banh' && thuong.doi === undefined && thuong.robot === undefined);
}

/** Chạy phép `f(nguon)` trên nguồn thật (phải đúng) và trên từng bản đổi tạm (phải sai): tự chứng minh phép đọc chuỗi. */
function kiemNguon(ten, nguon, f, doiTam) {
  kiem(ten, f(nguon));
  doiTam.forEach(([cu, moi], k) => {
    const sai = nguon.includes(cu) ? nguon.split(cu).join(moi) : null;
    kiem('  tự chứng minh ' + (k + 1) + ': đổi "' + cu.slice(0, 50).replace(/\s+/g, ' ') + '" → phép đỏ', sai !== null && !f(sai), sai === null ? 'không thấy chuỗi để đổi' : '');
  });
}

console.log('2. Đường vào màn (ung-dung.js, man-choi.js, luu.js, go-loi.js)');
{
  const ud = docNguon('game/ung-dung.js');
  const than = (s, ten) => { const i = s.indexOf(ten); if (i < 0) return ''; const j = s.indexOf('\n  };', i); return s.slice(i, j < 0 ? undefined : j); };
  kiemNguon('App.vaoMan(ma) chỉ tìm màn rồi gọi App.vaoManDuLieu(m)', ud,
    (s) => /App\.vaoMan = function \(ma\) \{\s*var m = ManHoc\.timMa\(ma\) \|\| ManHoc\.tim\(ma\); if \(!m\) return;\s*App\.vaoManDuLieu\(m\);\s*\};/.test(s), [['App.vaoManDuLieu(m);\n  };', '\n  };']]);
  kiemNguon('vaoManDuLieu: chonDoi rẽ TRƯỚC lapRap (màn Chọn đội → hien("doi") + ChonDoi.vao), rồi lapRap, rồi Choi.vao(m)', ud, (s) => {
    const b = than(s, 'App.vaoManDuLieu = function');
    const iD = b.indexOf('if (m.chonDoi && window.ChonDoi)'), iL = b.indexOf('if (m.lapRap && window.LapRobot)'), iC = b.lastIndexOf('Choi.vao(m);');
    return iD > 0 && iL > iD && iC > iL && /App\.hien\('doi'\);\s*ChonDoi\.vao\(m, \{ chon: Luu\.docDoi\(m\.ma\)/.test(b) && /napMuaTruoc\(m\)/.test(b) && b.indexOf('GoLoi.napKhiMoHet(m)') < iD;
  }, [['if (m.chonDoi && window.ChonDoi)', 'if (false)'], ['chon: Luu.docDoi(m.ma)', 'chon: null']]);
  kiemNguon('nhánh lapRap của màn cũ y như trước (Luu.docLap, ◀ về lưới màn, Lắp xong → Choi.vao(m, cach))', ud,
    (s) => s.includes("LapRobot.vao(m, { cach: Luu.docLap(m.ma), khiVe: function () { App.veChon(); }, khiXong: function (cach) { App.hien('choi'); Choi.vao(m, cach); } });"),
    [['khiVe: function () { App.veChon(); }, khiXong: function (cach) { App.hien(\'choi\'); Choi.vao(m, cach); }', 'khiXong: function () {}']]);
  kiemNguon('sauChonDoi: LapRap.apDungDoi, còn lapRap thì sang Lắp robot trên đội đã ghép, không thì Choi.vao(bản đội)', ud, (s) => {
    const b = than(s, 'function sauChonDoi');
    return /var a = LapRap\.apDungDoi\(goc, chon\);/.test(b) && /if \(goc\.lapRap && window\.LapRobot\)/.test(b) && /LapRobot\.vao\(a,/.test(b) && /Choi\.vao\(a, cach\)/.test(b) && /Choi\.vao\(a\);/.test(b);
  }, [['var a = LapRap.apDungDoi(goc, chon);', 'var a = goc;']]);
  kiemNguon('App.doiDoi: từ màn chơi về Chọn đội với đội đang chơi (m.chonDaChon); ◀ về màn chơi không đổi', ud, (s) => {
    const b = than(s, 'App.doiDoi = function');
    return /goc\.chonDoi/.test(b) && /App\.hien\('doi'\)/.test(b) && /chon: m\.chonDaChon, khiVe: function \(\) \{ App\.hien\('choi'\); \}/.test(b) && /sauChonDoi\(goc, chon/.test(b);
  }, [['chon: m.chonDaChon, khiVe', 'chon: null, khiVe']]);
  kiemNguon('App.lapLai: màn có chonDoi lắp lại trên đội đang chơi (apDungDoi(goc, m.chonDaChon)); màn lắp cũ vẫn dùng goc', ud,
    (s) => /nen = goc\.chonDoi && m\.chonDaChon \? LapRap\.apDungDoi\(goc, m\.chonDaChon\) : goc;/.test(s) && /LapRobot\.vao\(nen, \{ cach: m\.cachLapDaChon/.test(s),
    [['LapRap.apDungDoi(goc, m.chonDaChon) : goc;', 'goc : goc;']]);
  kiemNguon("màn hình 'doi' (sc-doi) có trong MAN_HINH; ChonDoi.dung(sc-doi) lúc khởi động", ud,
    (s) => /doi: 'sc-doi'/.test(s) && /getElementById\('sc-doi'\); if \(kdoi && window\.ChonDoi\) ChonDoi\.dung\(kdoi\);/.test(s), [["doi: 'sc-doi'", "doi: 'sc-x'"]]);

  const mc = docNguon('game/man-choi.js');
  kiemNguon('man-choi.js vao: màn chonDoi vào thẳng → apDungDoi theo đội đã lưu (Luu.docDoi, kiemChon) hay cachMau[0]; lapRap thì lắp trên bản đội (nen)', mc,
    (s) => /if \(goc\.chonDoi && !m\.chonDaChon\) \{[^\n]*\n\s*var ch = Luu\.docDoi\(goc\.ma\);\s*if \(!ch \|\| !LapRap\.kiemChon\(goc, ch\)\.ok\) ch = goc\.chonDoi\.cachMau\[0\]\.chon;\s*m = LapRap\.apDungDoi\(goc, ch\);/.test(s)
      && /if \(goc\.chonDoi\) nen = m;/.test(s) && /m = LapRap\.apDung\(nen, c\)/.test(s), [['m = LapRap.apDungDoi(goc, ch);', ''], ['LapRap.apDung(nen, c)', 'LapRap.apDung(goc, c)']]);
  kiemNguon('man-choi.js: nút "Đổi đội" (data-nut doi-doi, aria-label + title) chỉ hiện ở màn chọn đội, bấm → App.doiDoi; bảng thắng có nút Đổi đội', mc,
    (s) => /data-nut="doi-doi" style="display:none" aria-label="' \+ t\('doi\.doiNhan'\) \+ '" title="' \+ t\('doi\.doiNhan'\)/.test(s) && /E\.doiDoi\.style\.display = goc\.chonDoi \? '' : 'none';/.test(s)
      && /E\.doiDoi\.addEventListener\('click', function \(\) \{ if \(window\.App && App\.doiDoi\) App\.doiDoi\(\); \}\);/.test(s) && /TP\.Hop\.nut\('g-or', t\('doi\.doi'\), function \(\) \{ TP\.Hop\.dong\(\); if \(window\.App && App\.doiDoi\) App\.doiDoi\(\); \}, 'doi-doi'\)/.test(s),
    [["E.doiDoi.style.display = goc.chonDoi ? '' : 'none';", '']]);
  kiemNguon('man-choi.js napBai: robot coDinh (R3 máy khách) luôn lấy maMau.doi[i] — bảng Gỡ lỗi nạp bài thiếu R3 không làm R3 đứng yên', mc,
    (s) => /if \(r\.coDinh && md\[i\] && !m\.chiChay\) return \{ chinh: \(md\[i\]\.chinh \|\| \[\]\)\.slice\(\) \};/.test(s), [['if (r.coDinh && md[i] && !m.chiChay) return', 'if (false) return']]);

  const luu = docNguon('game/luu.js');
  kiemNguon('luu.js: Luu.docDoi / ghiDoi / xoaDoi (khoá duong-hoc:doi:<mã màn>, mảng mã cỗ máy)', luu,
    (s) => /var KHOA_DOI = 'duong-hoc:doi:';/.test(s) && /docDoi: docDoi, ghiDoi: ghiDoi, xoaDoi: xoaDoi/.test(s), [["'duong-hoc:doi:'", "'duong-hoc:lap:'"]]);
  const gl = docNguon('game/go-loi.js');
  kiemNguon('go-loi.js: Xoá tiến độ xoá cả đội đã chọn; lời giải màn chọn đội theo từng cách mẫu (apDungDoi, đổi đội trước khi nạp); lắp R_i của màn đội nạp lời giải đã điền R3', gl,
    (s) => /if \(Luu\.xoaDoi\) Luu\.xoaDoi\(m\.ma\);/.test(s) && /mm = LapRap\.apDungDoi\(goc, cm\)/.test(s) && /bai: chepBai\(mm\.loiGiai\)/.test(s) && /Choi\.vao\(LapRap\.apDungDoi\(goc, c\.chon\)\)/.test(s)
      && /bai: chepBai\(LapRap\.robotLapCua\(goc\) !== null \? mm\.loiGiai : cl\.loiGiai\)/.test(s), [['bai: chepBai(mm.loiGiai)', 'bai: chepBai(cm.loiGiai)']]);
}

console.log('3. Màn giả thu-mua-9.js chạy thật');
{
  for (const [ten, m] of [['manChonDoi', ThuMua9.manChonDoi()], ['manLapRobot2', ThuMua9.manLapRobot2()], ['manBaRobot', ThuMua9.manBaRobot()]]) {
    const lg = LapRap.loiGiaiCua(m.loiGiai, m), r = Cham.cham(m, LapRap.baiCua(lg), []);
    kiem(ten + ': lời giải mặc định thắng (' + m.doi.length + ' robot)', r.thang, J(r.chanDoan && r.chanDoan.slice(0, 2)));
  }
  const b = ThuMua9.manBaRobot();
  kiem('manBaRobot: không còn chonDoi / manGoc (màn đội thường), R3 coDinh, maMau.doi[2] có chương trình', !b.chonDoi && !b.manGoc && b.doi[2].coDinh === true && b.maMau.doi[2].chinh.length > 0);
  const l2 = ThuMua9.manLapRobot2();
  kiem('manLapRobot2: lapRap.robot = 1, R1 xe chở hàng đặt sẵn', LapRap.robotLapCua(l2) === 1 && l2.doi[0].loaiRobot === 'banh');
}

console.log('\n' + dat + ' đạt, ' + hong + ' hỏng');
if (hong) process.exit(1);

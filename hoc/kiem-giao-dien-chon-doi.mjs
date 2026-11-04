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

  const html = docNguon('game/choi.html');
  const viTri = (s, f) => s.indexOf('<script src="' + f + '"></script>');
  kiemNguon('choi.html: có #sc-doi; nạp man-chon-doi.js sau co-may.js / lap-rap.js / chu.js / man-lap.js, trước ung-dung.js; thu-mua-9.js nạp CUỐI', html, (s) => {
    const iCM = viTri(s, '../co-may.js'), iLR = viTri(s, '../lap-rap.js'), iChu = viTri(s, 'chu.js'), iML = viTri(s, 'man-lap.js'), iCD = viTri(s, 'man-chon-doi.js'), iUD = viTri(s, 'ung-dung.js'), iT = viTri(s, 'thu-mua-9.js');
    const sau = s.slice(iT + 1);
    return /id="sc-doi"/.test(s) && iCM >= 0 && iCM < iLR && iLR < iCD && iChu < iCD && iML < iCD && iCD < iUD && iUD < iT && !/<script/.test(sau);
  }, [['<script src="man-chon-doi.js"></script>', ''], ['<script src="thu-mua-9.js"></script>', ''], ['id="sc-doi"', 'id="sc-x"']]);

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

/* ------------------------------------------------------------- 4. màn Chọn đội chạy trên DOM giả (man-chon-doi.js thật, lõi thật; vẽ / lưu là bản giả) */
function DomGia() {
  function El(tag) { this.tagName = String(tag).toUpperCase(); this.con = []; this.attrs = {}; this.nghe = {}; this._t = ''; this.title = ''; this.style = {}; this.cha = null; const self = this;
    this.classList = { _s: new Set(), add(...c) { c.forEach((x) => this._s.add(x)); }, remove(...c) { c.forEach((x) => this._s.delete(x)); }, contains(c) { return this._s.has(c); },
      toggle(c, b) { if (b === undefined) b = !this._s.has(c); if (b) this._s.add(c); else this._s.delete(c); return b; } };
    Object.defineProperty(this, 'className', { get() { return [...self.classList._s].join(' '); }, set(v) { self.classList._s = new Set(String(v).split(/\s+/).filter(Boolean)); } });
  }
  El.prototype.appendChild = function (c) { c.cha = this; this.con.push(c); return c; };
  El.prototype.setAttribute = function (k, v) { this.attrs[k] = String(v); };
  El.prototype.getAttribute = function (k) { return this.attrs[k] === undefined ? null : this.attrs[k]; };
  El.prototype.addEventListener = function (k, f) { (this.nghe[k] = this.nghe[k] || []).push(f); };
  El.prototype.bam = function () { (this.nghe.click || []).forEach((f) => f({ preventDefault() {} })); };
  Object.defineProperty(El.prototype, 'innerHTML', { set(v) { this.con = []; this._t = ''; }, get() { return ''; } });
  Object.defineProperty(El.prototype, 'textContent', { set(v) { this.con = []; this._t = String(v); }, get() { return this._t + this.con.map((c) => c.textContent).join(''); } });
  Object.defineProperty(El.prototype, 'offsetWidth', { get() { return 100; } });
  El.prototype.tatCa = function () { return this.con.flatMap((c) => [c, ...c.tatCa()]); };
  El.prototype.querySelectorAll = function (sel) { const c = sel.replace(/^\./, ''); return this.tatCa().filter((e) => e.classList.contains(c)); };
  El.prototype.querySelector = function (sel) { return this.querySelectorAll(sel)[0] || null; };
  return { El, document: { createElement: (t) => new El(t) } };
}
console.log('4. Màn Chọn đội trên DOM giả (man-chon-doi.js)');
{
  const D = DomGia(), luuGia = {}, CoMay = require(path.join(day, 'co-may.js'));
  const win = {
    CHU: { vi: {} }, LapRap, CoMay,
    TP: { h(tag, cls, noi) { const e = D.document.createElement(tag); if (cls) e.className = cls; if (noi !== undefined && noi !== null) e.textContent = noi; return e; },
      vanBan(el, s) { el.textContent = s; }, Hop: { dong() {}, mo() { return { than: D.document.createElement('div') }; }, nut() { return D.document.createElement('button'); } } },
    Ve: { hydrate() {}, mk(cv) { const e = D.document.createElement('canvas'); e.cfg = cv.cfg; return e; }, ico(ten) { const e = D.document.createElement('svg'); e.setAttribute('data-ico', ten); return e; }, khoa() { const e = D.document.createElement('svg'); e.setAttribute('data-ico', 'lock'); return e; } },
    VeRobot: { PX_O_PART: 24, veCo(cfg) { const e = D.document.createElement('canvas'); e.cfg = cfg; return e; }, heSoCss() { return 1; } },
    Luu: { docDoi: (ma) => luuGia[ma] || null, ghiDoi: (ma, c) => { luuGia[ma] = c.slice(); return true; } },
    BangMau: {}
  };
  win.t = (k, tham) => { let s = win.CHU.vi[k] !== undefined ? win.CHU.vi[k] : k; if (tham) s = s.replace(/\{(\w+)\}/g, (m, x) => (tham[x] === undefined ? m : String(tham[x]))); return s; };
  const nguon = docNguon('game/man-chon-doi.js');
  new Function('window', 'document', 'TP', 'Ve', 'VeRobot', 'Luu', 'LapRap', 't', 'CHU', 'require', nguon)(win, D.document, win.TP, win.Ve, win.VeRobot, win.Luu, LapRap, win.t, win.CHU, undefined);
  const CD = win.ChonDoi, host = D.document.createElement('div');
  kiem('nạp được: window.ChonDoi { dung, vao, trangThai }; chữ doi.* điền vào CHU.vi', !!CD && typeof CD.vao === 'function' && win.CHU.vi['doi.vao'] === 'Vào màn');
  CD.dung(host);
  let xongVoi = null, ve = 0;
  const m = ThuMua9.manChonDoi();
  CD.vao(m, { khiXong: (c) => { xongVoi = c; }, khiVe: () => { ve++; } });
  const khe = () => host.querySelectorAll('cd-khe'), the = () => host.querySelectorAll('cd-the'), nutVao = () => host.tatCa().find((e) => e.getAttribute('data-nut') === 'doi-vao'), loi = () => host.querySelector('cd-loi');
  kiem('3 khe: Sola, Luna (nút bấm) + máy khách R3 (div khoá, có ổ khoá, aria-label + title nói khoá)', khe().length === 3 && khe()[0].tagName === 'BUTTON' && khe()[1].tagName === 'BUTTON' && khe()[2].tagName === 'DIV'
    && khe()[0].textContent.includes('Sola') && khe()[1].textContent.includes('Luna') && khe()[2].classList.contains('khoa') && khe()[2].tatCa().some((e) => e.getAttribute('data-ico') === 'lock') && /khoá/.test(khe()[2].getAttribute('aria-label')) && khe()[2].title === khe()[2].getAttribute('aria-label'),
    J(khe().map((k) => [k.tagName, k.textContent])));
  kiem('R3 máy khách vẽ đúng cỗ máy của nó (xe cứu hỏa, thân xích, đế lam)', /Xe cứu hỏa/.test(khe()[2].textContent) && khe()[2].tatCa().some((e) => e.cfg && e.cfg.than === 'xich' && e.cfg.son === 'lam'));
  kiem('bảng 3 thẻ theo menu (CH, DR, CU): hình robot, tên, một dòng "giỏi"; nút có aria-label + title "Chọn … cho Sola"', the().length === 3 && J(the().map((b) => b.getAttribute('data-ma'))) === '["CH","DR","CU"]'
    && the().every((b) => b.tatCa().some((e) => e.cfg)) && the()[0].textContent.includes('Xe chở hàng') && the()[0].textContent.includes('mang thùng gỗ') && the()[0].getAttribute('aria-label') === 'Chọn xe chở hàng cho Sola' && the()[0].title === 'Chọn xe chở hàng cho Sola',
    J(the().map((b) => [b.textContent, b.getAttribute('aria-label')])));
  kiem('chưa chọn: "Vào màn" khoá, dòng phụ là lý do kiemChon ("Chọn đủ 2 cỗ máy cho đội."); ô lời nhắc chạm thẻ cho Sola', nutVao().classList.contains('khoa') && nutVao().textContent.includes('Chọn đủ 2 cỗ máy cho đội.') && /Sola/.test(loi().textContent));
  nutVao().bam();
  kiem('bấm "Vào màn" khi chưa đủ: không vào, ô lời báo lý do (bad)', xongVoi === null && loi().classList.contains('bad') && /Chọn đủ 2/.test(loi().textContent));
  the()[0].bam();
  kiem('chạm Xe chở hàng → Sola có xe chở hàng (khe vẽ hình), tự sang khe Luna; thẻ CH ghi "Sola"; nhãn thẻ đổi sang "… cho Luna"', /Xe chở hàng/.test(khe()[0].textContent) && khe()[1].classList.contains('chon') && khe()[1].getAttribute('aria-pressed') === 'true'
    && the()[0].querySelector('cd-ai-the').textContent === 'Sola' && the()[1].getAttribute('aria-label') === 'Chọn drone nông nghiệp cho Luna', J([khe()[0].textContent, the()[1].getAttribute('aria-label')]));
  kiem('thẻ CH mờ cho Luna (màn cấm trùng), title = lý do lời Việt của kiemChon', the()[0].classList.contains('mo') && the()[0].title === 'Hai bạn không chọn cùng một xe chở hàng.', the()[0].title);
  the()[0].bam();
  kiem('Luna chạm Xe chở hàng (trùng) → thẻ rung, ô lời báo đúng lý do kiemChon, Luna vẫn trống', the()[0].classList.contains('rung') && loi().classList.contains('bad') && loi().textContent === 'Hai bạn không chọn cùng một xe chở hàng.' && CD.trangThai().chon[1] === null);
  the()[2].bam();
  kiem('Luna chạm Xe cứu hỏa → đủ đội: "Vào màn" sáng (không khoá, aria-disabled false), ô lời là đề bài', !nutVao().classList.contains('khoa') && nutVao().getAttribute('aria-disabled') === 'false' && J(CD.trangThai().chon) === '["CH","CU"]' && loi().classList.contains('de'));
  khe()[0].bam(); the()[0].bam();
  kiem('chạm khe Sola rồi chạm lại thẻ đang gắn → bỏ (Sola trống, "Vào màn" khoá lại)', CD.trangThai().chon[0] === null && nutVao().classList.contains('khoa'));
  the()[1].bam();
  nutVao().bam();
  kiem('Sola chọn drone → "Vào màn": Luu.ghiDoi theo mã màn, khiXong(["DR","CU"])', J(xongVoi) === '["DR","CU"]' && J(luuGia['thu.chon-doi']) === '["DR","CU"]');
  CD.vao(m, { khiXong: () => {}, khiVe: () => { ve++; } });
  kiem('vào lại màn: nạp đội đã lưu (Luu.docDoi), "Vào màn" sáng ngay', J(CD.trangThai().chon) === '["DR","CU"]' && !nutVao().classList.contains('khoa'));
  CD.vao(m, { chon: ['CH', 'CH'], khiVe: () => { ve++; } });
  kiem('đội truyền vào không hợp lệ (trùng) → bỏ, bắt đầu trống', J(CD.trangThai().chon) === '[null,null]');
  host.tatCa().find((e) => e.getAttribute('data-nut') === 'doi-ve').bam();
  kiem('◀ gọi khiVe; nút ◀ có aria-label + title', ve === 1 && !!host.tatCa().find((e) => e.getAttribute('data-nut') === 'doi-ve' && e.getAttribute('aria-label') && e.title));
  const mt = ThuMua9.manChonDoi(); mt.chonDoi.trung = true; mt.ma = 'thu.chon-doi-trung';            // mã khác: không nạp đội đã lưu của màn trên
  CD.vao(mt, {}); the()[0].bam(); the()[0].bam();
  kiem('màn cho trùng (chonDoi.trung): chạm Xe chở hàng hai lần → cả đội xe chở hàng, "Vào màn" sáng', J(CD.trangThai().chon) === '["CH","CH"]' && !nutVao().classList.contains('khoa'));
  kiem('nguồn man-chon-doi.js: không emoji; lời báo lấy lyDo của LapRap.kiemChon (không câu chung chung)', !/\p{Extended_Pictographic}/u.test(nguon) && /datLoi\(r\.lyDo, 'bad', 4200\)/.test(nguon) && /LapRap\.kiemChon\(S\.m, du\)/.test(nguon));
}

/* ------------------------------------------------------------- 5. màn Lắp robot thứ i của màn đội (man-lap.js thật, lõi thật; vẽ / lưu / sân là bản giả) */
console.log('5. Màn Lắp robot thứ i (man-lap.js)');
{
  const D = DomGia(), luuLap = {}, sanGoi = [], CoMay = require(path.join(day, 'co-may.js'));
  D.El.prototype.scrollLeft = 0;
  const win = {
    CHU: { vi: {} }, LapRap, CoMay, BangMau: {},
    addEventListener() {},
    TP: { h(tag, cls, noi) { const e = D.document.createElement(tag); if (cls) e.className = cls; if (noi !== undefined && noi !== null) e.textContent = noi; return e; },
      vanBan(el, s) { el.textContent = s; return el; }, Hop: { dong() {}, mo() { return { than: D.document.createElement('div') }; }, nut() { return D.document.createElement('button'); } } },
    Ve: { hydrate() {}, mk(cv) { const e = D.document.createElement('canvas'); e.cfg = cv.cfg; return e; }, ico(ten) { const e = D.document.createElement('svg'); e.setAttribute('data-ico', ten); return e; }, khoa() { const e = D.document.createElement('svg'); e.setAttribute('data-ico', 'lock'); return e; } },
    VeRobot: { PX_O_PART: 24, veCo(cfg) { const e = D.document.createElement('canvas'); e.cfg = cfg; return e; }, heSoCss() { return 1; } },
    Luu: { docLap: (ma) => luuLap[ma] || null, ghiLap: (ma, c) => { luuLap[ma] = Object.assign({}, c); return true; } },
    DenBoPhan: { mauIcon() { return {}; } },
    SanHoc: { lopMauCuaSan() { return {}; } },
    SanVe: { thuSan(cv, rows, bd) { sanGoi.push(bd); } }
  };
  win.t = (k, tham) => { let s = win.CHU.vi[k] !== undefined ? win.CHU.vi[k] : k; if (tham) s = s.replace(/\{(\w+)\}/g, (m, x) => (tham[x] === undefined ? m : String(tham[x]))); return s; };
  const doc = Object.assign({ getElementById: () => null }, D.document);
  const nguon = docNguon('game/man-lap.js');
  new Function('window', 'document', 'TP', 'Ve', 'VeRobot', 'Luu', 'LapRap', 't', 'CHU', 'DenBoPhan', 'SanHoc', 'SanVe', 'require', nguon)(win, doc, win.TP, win.Ve, win.VeRobot, win.Luu, LapRap, win.t, win.CHU, win.DenBoPhan, win.SanHoc, win.SanVe, undefined);
  const LR = win.LapRobot, host = D.document.createElement('div');
  kiem('nạp được: window.LapRobot; chữ lap.choAi / lap.daCo điền vào CHU.vi', !!LR && win.CHU.vi['lap.choAi'] === 'Lắp cho {ai}' && win.CHU.vi['lap.daCo'] === '{ai} đã có {ten}');
  LR.dung(host);
  const timLop = (c) => host.querySelectorAll(c), nut = (n) => host.tatCa().find((e) => e.getAttribute('data-nut') === n);
  const hinhRobot = () => host.querySelector('lr-robot').tatCa().find((e) => e.cfg);
  let xongVoi = null;
  const m = ThuMua9.manLapRobot2();
  LR.vao(m, { khiXong: (c) => { xongVoi = c; }, khiVe() {} });
  kiem('màn đội lapRap.robot = 1: trangThai().robot = 1; góc hình robot ghi "Lắp cho Luna"', LR.trangThai().robot === 1 && host.querySelector('lr-ai') && host.querySelector('lr-ai').textContent === 'Lắp cho Luna',
    J([LR.trangThai().robot, host.querySelector('lr-ai') && host.querySelector('lr-ai').textContent]));
  kiem('hình robot đang lắp mang màu đế của robot 2 (lam) và thân cách mặc định (xích)', !!hinhRobot() && hinhRobot().cfg.son === 'lam' && hinhRobot().cfg.than === 'xich', J(hinhRobot() && hinhRobot().cfg));
  const ro = timLop('lr-doi-ro');
  kiem('cột đội: một ô Sola (div role img, không bấm được), hình xe chở hàng của R1, aria-label + title "Sola đã có xe chở hàng"', host.querySelector('lr-doi').style.display === '' && ro.length === 1 && ro[0].tagName === 'DIV' && ro[0].getAttribute('role') === 'img'
    && ro[0].getAttribute('aria-label') === 'Sola đã có xe chở hàng' && ro[0].title === 'Sola đã có xe chở hàng' && ro[0].tatCa().some((e) => e.cfg && e.cfg.than === 'hai-banh') && !(ro[0].nghe.click || []).length && ro[0].textContent === 'Sola',
    J(ro.map((o) => [o.tagName, o.getAttribute('aria-label'), o.textContent])));
  const theHaiBanh = host.tatCa().find((e) => e.classList.contains('lr-the') && e.getAttribute('data-khe') === 'than' && e.getAttribute('data-ma') === 'hai-banh');
  theHaiBanh.bam();
  kiem('chạm thẻ Hai bánh: robot 2 đổi thân, vẫn màu lam; cột Sola giữ nguyên', LR.trangThai().cach.than === 'hai-banh' && hinhRobot().cfg.than === 'hai-banh' && hinhRobot().cfg.son === 'lam' && timLop('lr-doi-ro').length === 1);
  nut('lap-de').bam();
  kiem('đề bài: sân thu nhỏ đặt robot ở batDau của robot 2 (6, 2)', J(sanGoi[sanGoi.length - 1]) === J(m.doi[1].batDau), J(sanGoi));
  nut('lap-xong').bam();
  kiem('Lắp xong: Luu.ghiLap theo mã màn, khiXong(cách) → LapRap.apDung gắn vào doi[1], doi[0] không đổi', xongVoi && xongVoi.than === 'hai-banh' && luuLap['thu.lap-r2'] && (() => { const a = LapRap.apDung(m, xongVoi); return a.doi[1].robot.than === 'hai-banh' && a.doi[1].robot.son === 'lam' && J(a.doi[0].robot) === J(m.doi[0].robot); })());

  const R3 = ThuMua9.manChonDoi(), mt = Object.assign({}, R3, { ma: 'thu.lap-r2-ba', lapRap: { robot: 1, than: ['xich', 'hai-banh'], tay: ['hoi'], camBien: [], nganSach: 6, cachLap: [] } });
  delete mt.chonDoi;
  LR.vao(mt, {});
  const ro3 = timLop('lr-doi-ro');
  kiem('màn ba robot lắp R2: cột đội có Sola + máy khách (ô khoá, có ổ khoá, nhãn "Khách đã có xe cứu hỏa")', ro3.length === 2 && ro3[1].classList.contains('khoa') && ro3[1].tatCa().some((e) => e.getAttribute('data-ico') === 'lock')
    && ro3[1].getAttribute('aria-label') === 'Khách đã có xe cứu hỏa' && ro3[0].getAttribute('aria-label') === 'Sola đã có xe chở hàng', J(ro3.map((o) => o.getAttribute('aria-label'))));

  const ManRap = require(path.join(day, 'man-rap-tay.js'));
  const cu = ManRap.danhSach.find((x) => x.lapRap && !x.doi);
  LR.vao(cu, {});
  nut('lap-de').bam();
  kiem('màn lắp một robot (' + cu.ma + ') y như cũ: robot null, không nhãn "Lắp cho", cột đội ẩn, sân đặt man.batDau', LR.trangThai().robot === null && !host.querySelector('lr-ai') && host.querySelector('lr-doi').style.display === 'none'
    && timLop('lr-doi-ro').length === 0 && J(sanGoi[sanGoi.length - 1]) === J(cu.batDau) && hinhRobot() && hinhRobot().cfg.son === undefined);
  kiem('nguồn man-lap.js: không emoji; nhánh đội chỉ chạy khi LapRap.robotLapCua(man) khác null', !/\p{Extended_Pictographic}/u.test(nguon.replace(/◀/g, '')) && /S\.i = LapRap\.robotLapCua\(S\.m\);/.test(nguon) && /if \(S\.i === null\) \{ E\.doi\.style\.display = 'none'; return; \}/.test(nguon));
}

console.log('\n' + dat + ' đạt, ' + hong + ' hỏng');
if (hong) process.exit(1);

/* ============================================================================
   kiem-nhap-mua-8.mjs — máy kiểm NHẬP LIỆU mùa 8 Hang động (KE-HOACH-MUA-8.md, P1): mọi dạng Python của mùa phải LẮP ĐƯỢC BẰNG CHẠM trên khay, không gõ chữ.
   Gồm:
   1. LÕI: các dạng trong bảng mục 3 của kế hoạch chạy đúng như Python; các dạng cấm báo lỗi lời Việt (d.get, .items(), del, .remove, từ điển lồng, phép tập hợp, khoá thiếu).
   2. TÁCH DÒNG (TP.tachDoiSo khi bật chế độ TD): từng dạng tách thành ô có vai (tên / khoá / giá trị / số / in·not in / so sánh); dòng cũ không đổi khi TẮT.
   3. VẼ DÒNG (TP.mauDong): ô chạm được đúng lớp; thuộc tính data-… không vỡ khi có dấu nháy kép (d["a"]).
   4. THÊM / BỎ / THAY: themTDDong, boTDDong, thayDoiSo giữ đúng cú pháp.
   5. KHAY: thẻ Logic có nhóm ÂM THANH / TỪ ĐIỂN / TẬP HỢP theo cờ; thẻ Tay của bánh gai có nhóm LOA (note, beat); hear / listen không lọt vào thẻ Thân;
      cờ đã nối ở man-choi.js và xuong-ham.js; chữ ở chu.js; màu ở choi.css / choi-vector.css.
   6. KHUNG CHƯƠNG TRÌNH (Editor trên DOM giả): chạm in ↔ not in, chạm + thêm cặp, chạm khoá chọn khoá của màn, chạm giá trị có thêm / bỏ ô,
      chạm số có chip hear() / listen() / d["a"] / len(s), n = … chỉ chọn nguồn số; khối kho tự lấy tên đã gán ở trên.
   Chạy: node hoc/kiem-nhap-mua-8.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { napKhay } from './dom-gia-khay.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const R = require(path.join(day, '..', 'nhan', 'san-robot-core.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);

/* ================================================================= 1. LÕI */
function chay(code) {
  const ra = [];
  try { R.chayCode(code, { print: (...a) => { ra.push(a.map(String).join(' ')); return 0; } }); return { ra, loi: null }; }
  catch (e) { if (e && e.cuaGame) return { ra, loi: e.thongDiep }; throw e; }
}
console.log('\n== 1. Lõi: dạng được dạy chạy như Python, dạng cấm báo lời Việt ==');
{
  const dung = [
    ['d = {"ngang": 3}\nprint(d["ngang"])', ['3']],
    ['d = {}\nd["doc"] = 4\nprint(d["doc"])', ['4']],
    ['d = {"a": 1, "b": 2}\nfor k in d:\n    print(k)', ['a', 'b']],
    ['d = {"a": 1}\nprint("a" in d)\nprint("z" not in d)', ['1', '1']],
    ['s = set()\ns.add(3)\ns.add(3)\nprint(len(s))', ['1']],
    ['s = {3, 5}\nprint(5 in s)\nprint(4 not in s)', ['1', '1']],
    ['d = {"a": 1, "b": 1}\nprint(len(d))', ['2']],
    ['d = {1: 2, 3: 4}\nprint(d[3])', ['4']],
    ['d = {"a": 2}\nfor k in d:\n    print(d[k])', ['2']]
  ];
  dung.forEach(([c, mong]) => { const k = chay(c); kiem('chạy: ' + c.replace(/\n/g, ' ⏎ '), !k.loi && J(k.ra) === J(mong), J(k)); });
  const cam = [
    ['d = {"a": 1}\nprint(d.get("a"))', /chưa dạy/], ['d = {"a": 1}\nfor k, v in d.items():\n    print(k)', /./], ['d = {"a": 1}\ndel d["a"]', /./],
    ['s = {1}\ns.remove(1)', /tập hợp \(set\) chỉ có \.add\(x\)/], ['d = {"a": {"b": 1}}', /lồng/], ['s = {1} | {2}', /./],
    ['d = {"a": 1}\nprint(d["z"])', /"z" in d/]
  ];
  cam.forEach(([c, re]) => { const k = chay(c); kiem('cấm, có lời Việt: ' + c.replace(/\n/g, ' ⏎ '), !!k.loi && re.test(k.loi) && !/[A-Z][a-z]+Error:/.test(k.loi), k.loi); });
}

/* ================================================================= 2–4. TÁCH / VẼ / THÊM BỎ */
const K = napKhay();
const { TP } = K;
const KHOA = ['ngang', 'doc'];
TP.datCheTD(true, KHOA, ['hear', 'listen']);

console.log('\n== 2. Tách dòng thành ô có vai ==');
{
  const t = (l) => { const d = TP.tachDoiSo(l); return d && d.loai === 'td' ? d.kieu + ' ' + J(d.ds) + ' ' + J(d.vt) : d ? d.loai + ' ' + J(d.ds) : null; };
  const mau = [
    ['d = {"ngang": 3, "doc": 2}', 'ganDict ["d","\\"ngang\\"","3","\\"doc\\"","2"] ["ten","khoa","gt","khoa","gt"]'],
    ['d = {}', 'ganDict ["d","+"] ["ten","them"]'],
    ['d["doc"] = 4', 'ganKhoa ["d","\\"doc\\"","4"] ["ten","khoa","so"]'],
    ['for k in d:', 'for ["d"] ["ten"]'],
    ['if k in d:', 'in ["k","in","d"] ["so","op","ten"]'],
    ['if "ngang" not in d:', 'in ["\\"ngang\\"","not in","d"] ["so","op","ten"]'],
    ['s = set()', 'ganSet ["s","+"] ["ten","them"]'],
    ['s = {3, 5}', 'ganSet ["s","3","5"] ["ten","gt","gt"]'],
    ['s.add(n)', 'add ["s","n"] ["ten","so"]'],
    ['if n not in s:', 'in ["n","not in","s"] ["so","op","ten"]'],
    ['n = listen()', 'ganN ["n","listen()"] ["bm","so"]'],
    ['n = len(s)', 'ganN ["n","len(s)"] ["bm","so"]'],
    ['while hear() > 0:', 'ss ["hear()",">","0"] ["so","op","so"]'],
    ['if listen() == 3:', 'ss ["listen()","==","3"] ["so","op","so"]'],
    ['if n == 3:', 'ss ["n","==","3"] ["so","op","so"]'],
    ['forward(d["ngang"])', 'goi ["d[\\"ngang\\"]"]'],
    ['forward(hear())', 'goi ["hear()"]'],
    ['note(listen())', 'goi ["listen()"]'],
    ['beat(2)', 'goi ["2"]'],
    ['forward(d[k])', 'goi ["d[k]"]']
  ];
  mau.forEach(([l, mong]) => kiem('tách `' + l + '`', t(l) === mong, t(l)));
  kiem('dòng thường giữ cách tách cũ khi BẬT: for i in range(3): là range, forward(2) là goi', TP.tachDoiSo('for i in range(3):').loai === 'range' && TP.tachDoiSo('forward(2)').loai === 'goi');
  TP.datCheTD(false);
  kiem('TẮT chế độ TD (mùa khác): `d["a"] = 1`, `s.add(1)`, `n = listen()` không tách kiểu mới', ['d["a"] = 1', 's.add(1)', 'n = listen()', 'while hear() > 0:'].every((l) => { const d = TP.tachDoiSo(l); return !d || d.loai !== 'td'; }));
  TP.datCheTD(true, KHOA, ['hear', 'listen']);
  kiem('TP.coTDCua: đúng khi cauTruc có dict / set hay hamGoc có hear / listen', TP.coTDCua({ cauTruc: ['dict'] }) && TP.coTDCua({ cauTruc: ['set'] }) && TP.coTDCua({ hamGoc: ['listen'] }) && !TP.coTDCua({ cauTruc: ['for'], hamGoc: ['forward'] }) && !TP.coTDCua(null));
  kiem('TP.khoaTDCua: khoaTD của màn, không có thì khoá quét từ lời giải (thêm a b c cho đủ ba)',
    J(TP.khoaTDCua({ khoaTD: ['x'] })) === '["x"]' && J(TP.khoaTDCua({ loiGiai: { chinh: ['d = {"ngang": 3}', 'forward(d["doc"])'], hamCuaEmMoi: [] } })) === '["ngang","doc","a"]');
  kiem('TP.nguonAmCua: chỉ hear / listen trong hamGoc', J(TP.nguonAmCua({ hamGoc: ['forward', 'listen', 'note', 'hear'] })) === '["listen","hear"]');
}

console.log('\n== 3. Vẽ dòng: ô chạm được, thuộc tính không vỡ ==');
{
  const m = (l) => TP.mauDong(l);
  const dem = (h, re) => (h.match(re) || []).length;
  kiem('`d = {"ngang": 3, "doc": 2}`: 1 ô tên, 2 ô khoá chữ, 2 ô giá trị', (() => { const h = m('d = {"ngang": 3, "doc": 2}'); return dem(h, /td-ten/g) === 1 && dem(h, /td-khoa/g) === 2 && dem(h, /class="num ptu"/g) === 2; })());
  kiem('`d = {}` và `s = set()` có ô + (thêm cặp / phần tử đầu)', /num ptu them/.test(m('d = {}')) && /num ptu them/.test(m('s = set()')) && /class="fn">set</.test(m('s = set()')));
  kiem('`if k in d:`: ô in·not in (td-op) chạm được, tên từ điển là ô tên', /class="num td-op"[^>]*>in</.test(m('if k in d:')) && /td-ten[^>]*data-bien="d"/.test(m('if k in d:')));
  kiem('`if "ngang" not in d:`: vế trái là ô khoá chữ (không phải ô biến)', /td-khoa[^>]*data-chuoi="ngang"/.test(m('if "ngang" not in d:')));
  kiem('`while hear() > 0:` có chữ while, ô hear() và ô so sánh', /kw wh">while/.test(m('while hear() > 0:')) && /data-bien="hear\(\)"/.test(m('while hear() > 0:')) && /td-op[^>]*>&gt;</.test(m('while hear() > 0:')));
  kiem('`n = listen()`: tên biến là chữ thường, nguồn listen() là ô chạm được', /<span class="vr">n<\/span>/.test(m('n = listen()')) && /num bien bth[^>]*data-bien="listen\(\)"/.test(m('n = listen()')));
  kiem('dấu nháy kép trong thuộc tính được mã hoá: data-bien="d[&quot;ngang&quot;]" (không vỡ thẻ trong trình duyệt thật)', m('forward(d["ngang"])').indexOf('data-bien="d[&quot;ngang&quot;]"') >= 0 && !/data-[a-z]+="[^"]*"[^ >]/.test(m('forward(d["ngang"])') + m('if "ngang" in d:')));
  kiem('`note(1)` / `beat(2)`: tên lệnh loa tô màu tay (ty), số chạm được', /class="ty">note/.test(m('note(1)')) && /class="ty">beat/.test(m('beat(2)')) && /class="num" data-k="0" data-so="2"/.test(m('beat(2)')));
  kiem('đọc lại bằng DOM giả: ô d["ngang"] có data-bien đúng chữ', (() => { const e = new K.El('div'); e.innerHTML = m('forward(d["ngang"])'); const o = e.querySelector('.num'); return !!o && o.getAttribute('data-bien') === 'd["ngang"]'; })());
}

console.log('\n== 4. Thêm / bỏ / thay ô ==');
{
  kiem('themTDDong từ điển: thêm cặp sau cặp đang chạm, khoá chưa dùng của màn', TP.themTDDong('d = {"ngang": 3}', 2) === 'd = {"ngang": 3, "doc": 1}');
  kiem('themTDDong từ điển rỗng → khoá đầu của màn', TP.themTDDong('d = {}', 0) === 'd = {"ngang": 1}');
  kiem('themTDDong tập hợp: set() → {1}; {1, 2} → thêm số nhỏ nhất chưa có', TP.themTDDong('s = set()', 0) === 's = {1}' && TP.themTDDong('s = {1, 2}', 2) === 's = {1, 2, 3}');
  kiem('tối đa 5 cặp / phần tử', TP.themTDDong('s = {1, 2, 3, 4, 5}', 5) === 's = {1, 2, 3, 4, 5}');
  kiem('boTDDong: bỏ cả cặp khi chạm khoá hay giá trị; tập hợp hết phần tử → set()', TP.boTDDong('d = {"ngang": 3, "doc": 2}', 2) === 'd = {"doc": 2}' && TP.boTDDong('d = {"ngang": 3, "doc": 2}', 3) === 'd = {"ngang": 3}' && TP.boTDDong('s = {1}', 1) === 's = set()');
  kiem('thayDoiSo: khoá, giá trị, in → not in, so sánh, nguồn số', TP.thayDoiSo('d["doc"] = 4', 1, '"ngang"') === 'd["ngang"] = 4' && TP.thayDoiSo('d = {"a": 1}', 2, 5) === 'd = {"a": 5}' && TP.thayDoiSo('if k in d:', 1, 'not in') === 'if k not in d:' && TP.thayDoiSo('while hear() > 0:', 1, '<') === 'while hear() < 0:' && TP.thayDoiSo('n = listen()', 1, 'hear()') === 'n = hear()');
  kiem('thụt lề giữ nguyên khi thay: `    s.add(n)` → `    s.add(3)`', TP.thayDoiSo('    s.add(n)', 1, 3) === '    s.add(3)');
}

/* ================================================================= 5. KHAY */
console.log('\n== 5. Khay: nhóm ÂM THANH / TỪ ĐIỂN / TẬP HỢP, thẻ Loa ==');
const GOC = ['forward', 'turn_left', 'turn_right', 'note', 'beat', 'hear', 'listen'];
const spec = (them) => Object.assign({ goc: GOC, loai: 'gai', vong: true, vongWhile: true, cam: TP.camBienCua({ hamGoc: GOC }), dieuKien: true, dict: true, set: true, am: ['hear', 'listen'], em: [], man: [], coNutMoi: true, the: 'than', lamMoi: true }, them || {});
{
  const k = K.khayMoi(); k.pal.dung(spec());
  const q = K.quetThe(k);
  kiem('thẻ Thân: lệnh đi, không có hear / listen / note / beat', q.than && q.than.includes('forward') && !q.than.some((x) => /^(hear|listen|note|beat)$/.test(x)), J(q.than));
  kiem('thẻ Tay của bánh gai: note, beat', q.tay && q.tay.includes('note') && q.tay.includes('beat'), J(q.tay));
  kiem('thẻ Logic: nhóm ÂM THANH, TỪ ĐIỂN, TẬP HỢP theo thứ tự, mỗi nhóm đủ khối', q.cam && J(q.cam.filter((x) => /^## (ÂM THANH|TỪ ĐIỂN|TẬP HỢP)/.test(x))) === J(['## ÂM THANH', '## TỪ ĐIỂN', '## TẬP HỢP']) &&
    ['am-while', 'am-if', 'am-gan', 'nghe-gan', 'nghe-if', 'd-gan', 'd-khoa', 'd-for', 'd-in', 's-gan', 's-add', 's-in'].every((x) => q.cam.includes(x)), J(q.cam));
  k.pal.chonThe('cam');
  const goi = (x) => { const b = K.khoi(k, x); return b && b.getAttribute('data-goi'); };
  kiem('nội dung chèn của khối', goi('d-gan') === 'd = {"a": 1}' && goi('d-khoa') === 'd["a"] = 1' && goi('d-for') === 'for k in d:' && goi('d-in') === 'if k in d:' && goi('s-gan') === 's = set()' && goi('s-add') === 's.add(1)' && goi('s-in') === 'if 1 not in s:' && goi('am-while') === 'while hear() > 0:' && goi('nghe-gan') === 'n = listen()',
    J(['d-gan', 'd-khoa', 'd-for', 'd-in', 's-gan', 's-add', 's-in', 'am-while', 'nghe-gan'].map(goi)));
  const kTay = K.khayMoi(); kTay.pal.dung(spec()); kTay.pal.chonThe('tay');
  const kNgan = K.khayMoi(); kNgan.pal.dung(spec({ nganDai: true })); kNgan.pal.chonThe('tay');
  const goiT = (kk, x) => { const b = K.khoi(kk, x); return b && b.getAttribute('data-goi'); };
  kiem('thẻ Loa: note chèn `note(1)`, beat chèn `beat()` (lõi: beat không nhận đối số); chưa có khối ngân', goiT(kTay, 'note') === 'note(1)' && goiT(kTay, 'beat') === 'beat()' && !K.khoi(kTay, 'note_ngan'), J([goiT(kTay, 'note'), goiT(kTay, 'beat')]));
  kiem('gói Ngân dài (spec.nganDai): thêm khối `note(n, k)` chèn `note(1, 2)`', goiT(kNgan, 'note_ngan') === 'note(1, 2)');
  kiem('khối mới có lớp màu riêng: td (từ điển), th (tập hợp), am (âm thanh)', K.khoi(k, 'd-gan')._cls.has('td') && K.khoi(k, 's-gan')._cls.has('th') && K.khoi(k, 'nghe-gan')._cls.has('am'));
  const chiNghe = K.khayMoi(); chiNghe.pal.dung(spec({ dict: false, set: false, am: ['listen'], vongWhile: false, dieuKien: false }));
  const q2 = K.quetThe(chiNghe);
  kiem('chỉ có listen (gói Mic đầu): nhóm ÂM THANH có n = listen(), không có khối hear / từ điển / tập hợp', q2.cam && q2.cam.includes('nghe-gan') && !q2.cam.some((x) => /^(am-|d-|s-)/.test(x)), J(q2.cam));
  const khong = K.khayMoi(); khong.pal.dung(spec({ dict: false, set: false, am: [], goc: ['forward', 'turn_left'] }));
  kiem('màn không có cờ: không nhóm mới nào', !J(K.quetThe(khong)).match(/ÂM THANH|TỪ ĐIỂN|TẬP HỢP|"(am|nghe|d|s)-/));
  const mc = fs.readFileSync(path.join(day, 'game', 'man-choi.js'), 'utf8'), xh = fs.readFileSync(path.join(day, 'game', 'xuong-ham.js'), 'utf8');
  kiem('cờ đã nối: man-choi.js (datCheTD + spec dict/set/am) và xuong-ham.js',
    /TP\.datCheTD\(TP\.coTDCua\(m\)/.test(mc) && /dict: TP\.coCauTruc\(m, 'dict'\), set: TP\.coCauTruc\(m, 'set'\), am: TP\.nguonAmCua\(m\)/.test(mc) &&
    /TP\.datCheTD\(TP\.coTDCua\(A\.man\(\)\)/.test(xh) && /dict: TP\.coCauTruc\(man, 'dict'\), set: TP\.coCauTruc\(man, 'set'\), am: TP\.nguonAmCua\(man\)/.test(xh));
  kiem('chu.js: TỪ ĐIỂN, TẬP HỢP, ÂM THANH, LOA, Bánh gai', K.ctx.t('choi.nhom.dict') === 'TỪ ĐIỂN' && K.ctx.t('choi.nhom.set') === 'TẬP HỢP' && K.ctx.t('choi.nhom.am') === 'ÂM THANH' && K.ctx.t('choi.nhom.loa') === 'LOA' && K.ctx.t('choi.the.gai') === 'Bánh gai');
  const css = fs.readFileSync(path.join(day, 'game', 'choi.css'), 'utf8'), cv = fs.readFileSync(path.join(day, 'game', 'choi-vector.css'), 'utf8');
  kiem('màu khối và nhãn nhóm có ở choi.css và choi-vector.css', /\.brick\.td,\.brick\.th,\.brick\.am\{/.test(css) && /\.gl\.g-amt\{/.test(css) && /\.gl\.g-tdn\{/.test(css) && /\.gl\.g-thn\{/.test(css) &&
    /\.brick\.td\{--bc/.test(cv) && /\.brick\.th\{--bc/.test(cv) && /\.brick\.am\{--bc/.test(cv) && /\.gl\.g-amt\{/.test(cv));
}

/* ================================================================= 6. KHUNG CHƯƠNG TRÌNH */
console.log('\n== 6. Khung chương trình: chạm ô của dòng mùa 8 ==');
{
  const nutBien = (E) => { const b = E.bang(); return b ? b.querySelectorAll('button').filter((x) => x.getAttribute('data-bien')).map((x) => x.getAttribute('data-bien')) : []; };
  const E = K.dungEditor(['d = {"ngang": 3}', 's = set()', 'for k in d:', '    if k not in s:', '        forward(d[k])', 'n = listen()', 'while hear() > 0:', '    forward(1)']);
  E.cham(3, '.td-op');
  kiem('chạm `not in` → `in` (đổi ngay, không mở bảng)', E.arr[3] === '    if k in s:' && !E.bang(), E.arr[3]);
  E.cham(3, '.td-op');
  kiem('chạm lần nữa → `not in`', E.arr[3] === '    if k not in s:');
  E.cham(1, '.ptu.them');
  kiem('chạm + ở `s = set()` → `s = {1}`', E.arr[1] === 's = {1}', E.arr[1]);
  E.dongBang();
  E.cham(0, '.td-khoa');
  kiem('chạm khoá "ngang" → bảng chọn có các khoá của màn ("ngang", "doc")', J(nutBien(E)) === J(['"ngang"', '"doc"']), J(nutBien(E)));
  const nDoc = E.bang() && E.bang().querySelectorAll('button').find((x) => x.getAttribute('data-bien') === '"doc"');
  if (nDoc) nDoc.click();
  kiem('chọn "doc" → `d = {"doc": 3}`', E.arr[0] === 'd = {"doc": 3}', E.arr[0]);
  E.dongBang();
  E.cham(0, '.ptu[data-td="gt"]');
  const b = E.bang();
  kiem('chạm giá trị 3 → bảng số có nút "thêm ô" và "bỏ ô"', !!b && !!b.querySelector('[data-nut="ptu-them"]') && !!b.querySelector('[data-nut="ptu-bo"]'));
  b.querySelector('[data-nut="ptu-them"]').click();
  kiem('"thêm ô" → thêm cặp mới với khoá chưa dùng', E.arr[0] === 'd = {"doc": 3, "ngang": 1}', E.arr[0]);
  E.dongBang();
  E.cham(4, '.num');
  kiem('chạm d[k] trong forward(d[k]) → chip có d[k] (biến vòng for k in d)', nutBien(E).includes('d[k]'), J(nutBien(E)));
  E.dongBang();
  E.cham(5, '.num');
  const nguon = nutBien(E);
  kiem('chạm listen() trong `n = listen()` → chỉ nguồn số: hear(), listen(), d["…"], len(…)', nguon.length > 0 && nguon.includes('hear()') && nguon.includes('listen()') && nguon.every((x) => /^(hear\(\)|listen\(\)|len\(\w+\)|\w+\[("\w+"|\w+)\])$/.test(x)), J(nguon));
  E.dongBang();
  E.cham(6, '.td-op');
  kiem('chạm `>` trong while hear() > 0: → `!=` (vòng == != > <)', E.arr[6] === 'while hear() != 0:' || E.arr[6] === 'while hear() < 0:', E.arr[6]);
  E.dongBang();
  E.cham(7, '.num');
  kiem('chạm số trong forward(1) (dưới n = listen()) → chip có n, hear(), listen()', ['n', 'hear()', 'listen()'].every((x) => nutBien(E).includes(x)), J(nutBien(E)));
  E.dongBang();

  const E2 = K.dungEditor(['buoc = {"ngang": 2}', '']);
  E2.ed.chenTai('d["a"] = 1', 1, 0);
  kiem('chèn khối `d["a"] = 1` dưới `buoc = {...}` → tự lấy tên buoc và khoá "ngang"', E2.arr[1] === 'buoc["ngang"] = 1', J(E2.arr));
  E2.ed.chenTai('d = {"a": 1}', 2, 0);
  kiem('chèn khối từ điển thứ hai → tên gợi ý chưa dùng (d), khoá đầu của màn', E2.arr[2] === 'd = {"ngang": 1}', J(E2.arr));
  const E3 = K.dungEditor(['da_go = set()', '']);
  E3.ed.chenTai('s.add(1)', 1, 0);
  E3.ed.chenTai('if 1 not in s:', 2, 0);
  kiem('chèn s.add / if … not in s dưới `da_go = set()` → dùng da_go', E3.arr[1] === 'da_go.add(1)' && /not in da_go:$/.test(E3.arr[2]), J(E3.arr));

  // Xưởng hàm: đối số là sổ (follow(book), walk_book(book) của gói 1): kiểu 'td' suy từ lời giải của màn
  const E4 = K.dungEditor(['forward(1)', 'for k in book:', '    rim(1)'], { bienDuoc: () => ['book'], kieuBien: (t) => (t === 'book' ? 'td' : 'so') });
  E4.cham(0, '.num');
  kiem('thân hàm có đối số sổ book: chạm số trong forward(1) → chip book["ngang"], book["doc"]', ['book["ngang"]', 'book["doc"]'].every((x) => nutBien(E4).includes(x)), J(nutBien(E4)));
  E4.dongBang();
  E4.cham(2, '.num');
  kiem('dưới for k in book: chạm số trong rim(1) → chip book[k]', nutBien(E4).includes('book[k]'), J(nutBien(E4)));
  E4.dongBang();
  const E5 = K.dungEditor(['a = {"ngang": 2}', 'b = {"ngang": 3}', 'follow(a)'], { kieuDoiSo: (ten) => (ten === 'follow' ? 'td' : 'so') });
  E5.cham(2, '.num');
  kiem('chạm đối số của follow(a) (đối số là sổ) → chọn tên sổ a, b', ['a', 'b'].every((x) => nutBien(E5).includes(x)) && !nutBien(E5).includes('1'), J(nutBien(E5)));
  E5.dongBang();
}

console.log('\n' + (hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) : 'ĐẠT cả ' + dat) + ' phép kiểm nhập liệu mùa 8');
process.exit(hong ? 1 : 0);

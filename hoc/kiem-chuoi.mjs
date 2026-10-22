/* ============================================================================
   kiem-chuoi.mjs — máy kiểm CHUỖI KÝ TỰ của nhân chạy code Python
   (nhan/san-robot-core.js), dùng cho chương nhện / màu về sau.
   Kiểm: literal "..." và '...', thoát \n \\ \' \", == != < giữa chuỗi, + nối, * lặp, len/str/int,
   in / not in, for c in "UURR":, print chuỗi, hàm game nhận và trả chuỗi, lỗi chạy tiếng Việt
   (chuỗi + số...), lỗi cú pháp chuỗi chưa đóng đúng dòng, True/False vẫn là 1/0, chuỗi == số là False.
   Chạy: node hoc/kiem-chuoi.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const R = require(path.join(day, '..', 'nhan', 'san-robot-core.js'));
const SanHoc = require(path.join(day, 'san-hoc.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);

/** Chạy mã, thu mọi thứ print() in ra. Trả { ra: [chuỗi], loi: null | lỗi của game }. */
function chay(code, apiThem) {
  const ra = [];
  const api = Object.assign({
    print: (...a) => { ra.push(a.map((x) => typeof x === 'number' ? String(Math.round(x * 1e6) / 1e6) : String(x)).join(' ')); return 0; }
  }, apiThem || {});
  try { R.chayCode(code, api); return { ra, loi: null }; }
  catch (e) { if (e && e.cuaGame) return { ra, loi: { loai: e.loai, dong: e.dong, td: e.thongDiep } }; throw e; }
}
const ra = (code, api) => J(chay(code, api).ra);

console.log('\n== 1. Literal chuỗi ==');
{
  kiem('"abc" in ra abc', ra('print("abc")') === J(['abc']));
  kiem("'abc' (nháy đơn) in ra abc", ra("print('abc')") === J(['abc']));
  kiem('hai kiểu nháy lồng nhau: "it\'s" và \'say "hi"\'', ra(`print("it's")\nprint('say "hi"')`) === J(["it's", 'say "hi"']));
  kiem('chuỗi rỗng "" in ra dòng trống', ra('print("")') === J(['']));
  kiem('tiếng Việt có dấu giữ nguyên', ra('print("Xin chào, Đường học")') === J(['Xin chào, Đường học']));
  kiem('thoát \\n: một chuỗi có xuống dòng', chay('x = "a\\nb"\nprint(len(x))').ra[0] === '3');
  kiem('thoát \\\\ thành một dấu \\', chay('x = "a\\\\b"\nprint(len(x))\nprint(x == "a" + "\\\\" + "b")').ra.join('|') === '3|1');
  kiem('thoát \\\' và \\" bên trong chuỗi cùng loại nháy', ra(`print('it\\'s')\nprint("say \\"hi\\"")`) === J(["it's", 'say "hi"']));
  kiem('dấu # trong chuỗi KHÔNG bị coi là chú thích', ra('print("a#b") # chú thích thật') === J(['a#b']));
  kiem("dấu nháy trong chú thích không làm hỏng dòng", ra("print(1) # it's ok\nprint(2)") === J(['1', '2']));
  kiem('print nhiều đối số trộn chuỗi và số', ra('print("x =", 3, "ô")') === J(['x = 3 ô']));
}

console.log('\n== 2. So sánh ==');
{
  const v = (e) => chay('print(' + e + ')').ra[0];
  kiem('"a" == "a" → 1', v('"a" == "a"') === '1');
  kiem('"a" == \'a\' → 1 (hai kiểu nháy như nhau)', v('"a" == \'a\'') === '1');
  kiem('"a" == "b" → 0', v('"a" == "b"') === '0');
  kiem('"a" != "b" → 1', v('"a" != "b"') === '1');
  kiem('"a" != "a" → 0', v('"a" != "a"') === '0');
  kiem('chuỗi == số là False: "1" == 1 → 0', v('"1" == 1') === '0');
  kiem('chuỗi != số là True: "1" != 1 → 1', v('"1" != 1') === '1');
  kiem('"" == 0 → 0', v('"" == 0') === '0');
  kiem('"a" < "b" → 1', v('"a" < "b"') === '1');
  kiem('"b" <= "a" → 0', v('"b" <= "a"') === '0');
  kiem('True == 1 vẫn đúng (True/False là 1/0)', v('True == 1') === '1' && v('False == 0') === '1');
  kiem('so sánh số vẫn như cũ: 3 > 2 and 2 >= 2 → 1', v('3 > 2 and 2 >= 2') === '1');
  const l = chay('x = "a" < 1');
  kiem('"a" < 1 là lỗi chạy tiếng Việt, đúng dòng 1', l.loi && l.loi.loai === 'runtime-error' && l.loi.dong === 1 && /so sánh/.test(l.loi.td) && /chuỗi/.test(l.loi.td), J(l.loi));
}

console.log('\n== 3. Nối (+), lặp (*), += ==');
{
  kiem('"ab" + "cd" → abcd', ra('print("ab" + "cd")') === J(['abcd']));
  kiem('nối ba chuỗi', ra('print("a" + \'b\' + "c")') === J(['abc']));
  kiem('+= nối chuỗi trong vòng lặp', ra('s = ""\nfor i in range(3):\n    s += "ab"\nprint(s)') === J(['ababab']));
  kiem('s = s + "x"', ra('s = "a"\ns = s + "x"\nprint(s)') === J(['ax']));
  kiem('"ab" * 3 → ababab, 2 * "ab" → abab', ra('print("ab" * 3)\nprint(2 * "ab")') === J(['ababab', 'abab']));
  kiem('"ab" * 0 và * -1 → chuỗi rỗng', ra('print(len("ab" * 0))\nprint(len("ab" * -1))') === J(['0', '0']));
  kiem('số + số vẫn như cũ', ra('print(1 + 2)\nx = 5\nx += 1\nprint(x)') === J(['3', '6']));
  const a = chay('x = "ab" + 3');
  kiem('chuỗi + số: lỗi chạy, đúng dòng, nói rõ cộng chuỗi với số và gợi ý str()',
    a.loi && a.loi.loai === 'runtime-error' && a.loi.dong === 1 && /Không cộng được chuỗi với số/.test(a.loi.td) && /str\(/.test(a.loi.td), J(a.loi));
  const b = chay('print("ok")\nx = 3 + "ab"');
  kiem('số + chuỗi: lỗi chạy ở dòng 2; lệnh trước đó vẫn chạy', b.loi && b.loi.dong === 2 && /số với chuỗi/.test(b.loi.td) && J(b.ra) === J(['ok']), J(b));
  const c = chay('s = "a"\ns += 1');
  kiem('s += số: lỗi chạy dòng 2', c.loi && c.loi.dong === 2 && /Không cộng được chuỗi với số/.test(c.loi.td), J(c.loi));
  const d = chay('x = 1\nx += "a"');
  kiem('số += chuỗi: lỗi chạy dòng 2', d.loi && d.loi.dong === 2 && /số với chuỗi/.test(d.loi.td), J(d.loi));
  const e = chay('x = "a" - "b"');
  kiem('chuỗi - chuỗi: lỗi nói rõ phép "-" không dùng với chuỗi', e.loi && /phép "-"/.test(e.loi.td), J(e.loi));
  kiem('chuỗi / số, chuỗi % số, chuỗi // số: đều là lỗi chạy',
    ['"a" / 2', '"a" % 2', '"a" // 2'].every((x) => { const r = chay('x = ' + x); return r.loi && r.loi.loai === 'runtime-error'; }));
  kiem('"a" * "b" và "a" * 1.5: lỗi chạy', ['"a" * "b"', '"a" * 1.5'].every((x) => !!chay('x = ' + x).loi));
  kiem('-"a": lỗi chạy', !!chay('x = -"a"').loi);
  kiem('chuỗi + số không "chạy qua lặng lẽ": lệnh game phía sau không được gọi',
    (() => { let goi = 0; chay('x = "a" + 1\ngo("up")', { go: () => { goi++; return 0; } }); return goi === 0; })());
}

console.log('\n== 4. len, str, int ==');
{
  kiem('len("UURR") → 4, len("") → 0', ra('print(len("UURR"))\nprint(len(""))') === J(['4', '0']));
  kiem('len của biến chuỗi và của chuỗi nối', ra('s = "ab"\nprint(len(s + "cde"))') === J(['5']));
  kiem('len(s) dùng làm số lần lặp: range(len("abc"))', ra('n = 0\nfor i in range(len("abc")):\n    n += 1\nprint(n)') === J(['3']));
  kiem('len(5): lỗi chạy nói len chỉ đếm chuỗi', (() => { const r = chay('x = len(5)'); return r.loi && /len\(\)/.test(r.loi.td); })());
  kiem('len() thiếu đối số: lỗi chạy', !!chay('x = len()').loi);
  kiem('str(3) → "3" và "a" + str(3) → a3', ra('print("a" + str(3))\nprint(str(3) == "3")') === J(['a3', '1']));
  kiem('str(2.5) → 2.5', ra('print("v" + str(2.5))') === J(['v2.5']));
  kiem('int("12") + 1 → 13, int(3.9) → 3', ra('print(int("12") + 1)\nprint(int(3.9))') === J(['13', '3']));
  kiem('int("abc"): lỗi chạy', (() => { const r = chay('x = int("abc")'); return r.loi && /int\(\)/.test(r.loi.td); })());
}

console.log('\n== 5. in / not in ==');
{
  kiem('"U" in "UD" → 1; "L" in "UD" → 0', ra('print("U" in "UD")\nprint("L" in "UD")') === J(['1', '0']));
  kiem('"L" not in "UD" → 1', ra('print("L" not in "UD")\nprint("U" not in "UD")') === J(['1', '0']));
  kiem('"UD" in "xUDx" (chuỗi con) → 1; "" in "a" → 1', ra('print("UD" in "xUDx")\nprint("" in "a")') === J(['1', '1']));
  kiem('if c in "UD": trong vòng lặp', ra('n = 0\nfor c in "UDLRU":\n    if c in "UD":\n        n += 1\nprint(n)') === J(['3']));
  kiem('if c not in "UD": ... else', ra('for c in "UL":\n    if c not in "UD":\n        print("ngang")\n    else:\n        print("dọc")') === J(['dọc', 'ngang']));
  kiem('in kết hợp and / or / not', ra('c = "U"\nprint(c in "UD" and c not in "LR")\nprint(not c in "LR")') === J(['1', '1']));
  kiem('"a" in 5: lỗi chạy tiếng Việt', (() => { const r = chay('x = "a" in 5'); return r.loi && r.loi.loai === 'runtime-error' && /in/.test(r.loi.td); })());
  kiem('5 in "a": lỗi chạy', !!chay('x = 5 in "a"').loi);
}

console.log('\n== 6. for c in chuỗi ==');
{
  kiem('for c in "UURR": in từng ký tự', ra('for c in "UURR":\n    print(c)') === J(['U', 'U', 'R', 'R']));
  kiem("for c in 'ab': nháy đơn", ra("for c in 'ab':\n    print(c)") === J(['a', 'b']));
  kiem('for c in chuỗi rỗng: không chạy lần nào', ra('for c in "":\n    print("x")\nprint("xong")') === J(['xong']));
  kiem('for c in biến chuỗi', ra('d = "ULD"\nfor c in d:\n    print(c)') === J(['U', 'L', 'D']));
  kiem('for c in chuỗi nối', ra('for c in "A" + "B":\n    print(c)') === J(['A', 'B']));
  kiem('break / continue trong for chuỗi', ra('for c in "abcd":\n    if c == "b":\n        continue\n    if c == "d":\n        break\n    print(c)') === J(['a', 'c']));
  kiem('for lồng: chuỗi trong range', ra('for i in range(2):\n    for c in "xy":\n        print(c)') === J(['x', 'y', 'x', 'y']));
  kiem('for range(...) vẫn chạy như cũ (1, 2, 3 đối số)', ra('for i in range(3):\n    print(i)\nfor i in range(1, 3):\n    print(i)\nfor i in range(0, 6, 3):\n    print(i)') === J(['0', '1', '2', '1', '2', '0', '3']));
  const l = chay('for c in 5:\n    print(c)');
  kiem('for c in 5: lỗi chạy dòng 1, nhắc dùng range hoặc chuỗi', l.loi && l.loi.loai === 'runtime-error' && l.loi.dong === 1 && /range/.test(l.loi.td) && /chuỗi/.test(l.loi.td), J(l.loi));
  const m = chay('for c in :\n    print(c)');
  kiem('for c in : (thiếu vế sau) là lỗi cú pháp', m.loi && m.loi.loai === 'syntax-error' && m.loi.dong === 1, J(m.loi));
}

console.log('\n== 7. Hàm game nhận và trả chuỗi ==');
{
  const nhat = [];
  let mau = 'red';
  const api = {
    go: (huong) => { nhat.push(huong); return 0; },
    color: () => mau,
    nghe: () => true
  };
  const r = chay('go("up")\ngo(\'down\')\nif color() == "red":\n    go("stop")\nprint(color())', api);
  kiem('go("up") nhận đúng chuỗi, color() trả "red" so sánh được', J(nhat) === J(['up', 'down', 'stop']) && J(r.ra) === J(['red']), J(nhat) + J(r));
  mau = 'blue';
  nhat.length = 0;
  chay('if color() == "red":\n    go("r")\nelif color() == "blue":\n    go("b")\nelse:\n    go("?")', api);
  kiem('elif so khớp chuỗi màu', J(nhat) === J(['b']), J(nhat));
  nhat.length = 0;
  chay('for c in "UURRD":\n    go(c)', api);
  kiem('for c in "UURRD": go(c) — gọi hàm game với từng ký tự', J(nhat) === J(['U', 'U', 'R', 'R', 'D']), J(nhat));
  nhat.length = 0;
  chay('for c in "UDX":\n    if c in "UD":\n        go(c)\n    else:\n        go("lạ")', api);
  kiem('if c in "UD" quyết định hàm game nào được gọi', J(nhat) === J(['U', 'D', 'lạ']), J(nhat));
  kiem('hàm game trả true (JS boolean) thành 1', ra('print(nghe() + 1)', api) === J(['2']));
  kiem('hàm game trả chuỗi dùng được với len và +', ra('print(len(color() + "!"))', api) === J(['5']));
  kiem('color() + 1 (trả chuỗi cộng số): lỗi chạy', !!chay('x = color() + 1', api).loi);
  kiem('hàm của người chơi nhận và trả chuỗi (def, return)', ra('def hoa(s):\n    return s + "!"\nprint(hoa("hi"))') === J(['hi!']));
  kiem('hàm của người chơi lặp chuỗi truyền vào', ra('def di(duong):\n    for c in duong:\n        go(c)\ndi("UR")', Object.assign({}, api, { go: (h) => { nhat.push('g' + h); return 0; } })) === J([]) && nhat.slice(-2).join() === 'gU,gR');

  // sinh chuỗi qua generator: bên ngoài trả "red" bằng next(kq)
  const g = R.chayCodeGen('x = color()\nif x == "red":\n    stop()', { color: () => 0, stop: () => 0 });
  let buoc = g.next(), thu = [];
  while (!buoc.done) { thu.push(buoc.value.ten + J(buoc.value.thamSo)); buoc = g.next(buoc.value.ten === 'color' ? 'red' : 0); }
  kiem('chayCodeGen: bên ngoài trả "red" cho color() thì nhánh if chạy', J(thu) === J(['color[]', 'stop[]']), J(thu));
  const g2 = R.chayCodeGen('go("up")', { go: () => 0 });
  const v2 = g2.next();
  kiem('chayCodeGen nhường ra thamSo là chuỗi ["up"]', v2.value.ten === 'go' && J(v2.value.thamSo) === J(['up']), J(v2.value));
}

console.log('\n== 8. Lỗi cú pháp chuỗi: lời tiếng Việt, đúng dòng ==');
{
  const loi = (code) => chay(code).loi;
  const a = loi('print("abc)');
  kiem('chuỗi chưa đóng: syntax-error, dòng 1, nói "chưa đóng" và nhắc dấu nháy', a && a.loai === 'syntax-error' && a.dong === 1 && /Chuỗi chưa đóng/.test(a.td) && /"/.test(a.td), J(a));
  const b = loi("move(1)\nx = 'abc\nmove(2)");
  kiem('chuỗi chưa đóng ở dòng 2 → báo dòng 2 (không phải dòng 1 hay 3)', b && b.loai === 'syntax-error' && b.dong === 2, J(b));
  const c = loi('x = "abc\' ');
  kiem('mở bằng " đóng bằng \' vẫn là chưa đóng', c && c.loai === 'syntax-error' && c.dong === 1, J(c));
  const d = loi('print("a\\")');
  kiem('"a\\" : dấu \\ thoát luôn dấu nháy đóng → chưa đóng', d && d.loai === 'syntax-error', J(d));
  kiem('lỗi cú pháp chặn chạy cả chương trình (lệnh print dòng trước không chạy)', chay('print("truoc")\nx = "abc').ra.length === 0);
  const e = loi('print "hi"');
  kiem('print "hi" (thiếu ngoặc) là lỗi cú pháp, không lặng lẽ bỏ qua', e && e.loai === 'syntax-error' && e.dong === 1 && /print/.test(e.td), J(e));
  const f = loi('move() "a"');
  kiem('lệnh có chuỗi thừa sau nó là lỗi cú pháp', f && f.loai === 'syntax-error', J(f));
  const g = loi('go("up" "down")');
  kiem('hai chuỗi liền nhau trong lời gọi: lỗi cú pháp', g && g.loai === 'syntax-error', J(g));
  const h = loi('for c in "ab"\n    print(c)');
  kiem('for c in "ab" thiếu dấu ":" → lỗi cú pháp nói thiếu ":"', h && h.loai === 'syntax-error' && /:/.test(h.td), J(h));
  kiem('qua chayTrenSan: chuỗi chưa đóng ra chẩn đoán syntax-error và loi.dong đúng',
    (() => { const b1 = R.BAI[0]; const r = R.chayTrenSan(b1, b1.san, 'move(1)\nx = "abc'); return r.chanDoan.includes('syntax-error') && r.loi.dong === 2; })());
  kiem('qua chayTrenSan: chuỗi hợp lệ chạy được và print đi vào ketQua.ra',
    (() => { const b1 = R.BAI[0]; const r = R.chayTrenSan(b1, b1.san, 'move(4)\nprint("xong", len("abc"))'); return r.ok && J(r.ra) === J(['xong 3']); })());
}

console.log('\n== 9. Không phá cũ ==');
{
  kiem('True / False vẫn là 1 / 0: True + True → 2, False == 0 → 1', ra('print(True + True)\nprint(False == 0)\nprint(not False)') === J(['2', '1', '1']));
  kiem('and / or / not với số như cũ', ra('print(1 and 2)\nprint(0 or 5)\nprint(not 0)') === J(['2', '5', '1']));
  kiem('hàm tự viết nhiều đối số + return số', ra('def cong(a, b):\n    return a + b\nprint(cong(2, 3))') === J(['5']));
  kiem('gọi hàm thiếu đối số vẫn báo "cần n đối số"', (() => { const r = chay('def f(a, b):\n    return a\nf(1)'); return r.loi && /cần 2 đối số, đang có 1/.test(r.loi.td); })());
  kiem('while + break vẫn chạy', ra('i = 0\nwhile True:\n    i += 1\n    if i > 3:\n        break\nprint(i)') === J(['4']));
  kiem('biến chưa có báo "Chưa có biến tên", đúng dòng', (() => { const r = chay('x = 1\nprint(abc)'); return r.loi && r.loi.dong === 2 && /Chưa có biến tên "abc"/.test(r.loi.td); })());
  kiem('gọi hàm chưa có vẫn báo "Chưa có biến hay hàm tên" (để máy chấm đổi thành ham-chua-co)', (() => { const r = chay('abc()'); return r.loi && /Chưa có biến hay hàm tên "abc"/.test(r.loi.td); })());
  kiem('hàm tự viết đè hàm dựng sẵn len được (như Python)', ra('def len(x):\n    return 99\nprint(len("a"))') === J(['99']));

  // chuỗi trong xe thật: SanHoc chạy mã có chuỗi, hàm game nhận chuỗi nhưng thân hàm của em chạy bình thường
  const kq = SanHoc.chay({ san: ['.....', '..F..'], batDau: { x: 2, y: 0, huong: 2 } },
    'for c in "ab":\n    left_move()\n    right_move()\n    wait()');
  kiem('SanHoc.chay: xe chạy lệnh trong for chuỗi, tới cờ ở nhịp 1', !kq.loi, J(kq.loi));
  kiem('kho hàm cấm tên len / str (hàm dựng sẵn) như hàm gốc', ['len', 'str'].every((t) => KhoHam.moi().kiemTen(t).ma === 'ten-trung-ham-goc'));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);

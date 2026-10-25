/* ============================================================================
   kiem-list.mjs — máy kiểm GÓI LIST: DANH SÁCH (list) của "Học lập trình" (KE-HOACH-LIST-FLYCAM.md, mục 1 và 2). Chưa có màn nào của gói List:
   mọi màn thử dựng TẠM trong bộ nhớ của máy kiểm (một màn thật được nhân bản rồi thêm 'list' vào cauTruc), không thêm màn vào game.
   Gồm:
   1. LÕI list của nhân Python (nhan/san-robot-core.js): literal số / chuỗi / rỗng, gán, len, a[i], a.append(x), x in a / x not in a, for x in a / [..],
      truyền tham chiếu vào hàm của người chơi, so sánh / nối / đúng sai; những thứ KHÔNG làm báo lỗi lời Việt "Game chưa dạy …" (cắt đoạn, a[i] = x, danh sách lồng,
      lệnh khác .pop .sort, list comprehension), lỗi chỉ số (âm, ngoài tầm, nói rõ chỉ số và độ dài), lỗi kiểu (danh sách + số, for qua số, hàm game nhận danh sách…);
   2. KHUNG: cauTruc 'list' (khung-code.js): màn có khai cauTruc mà thiếu 'list' thì dòng dùng danh sách báo cau-truc-chua-hoc;
   3. CHẤM (cham.js) trên màn tạm: chương trình dùng danh sách chạy robot y như viết số thẳng; lỗi lời Việt đúng dòng; cau-truc-chua-hoc;
   4. KHAY (game/thanh-phan.js, Palette trên DOM giả): nhóm DANH SÁCH ở thẻ Logic chỉ khi spec.list; bốn khối; hàm có tham số danh sách chèn `weave([2, 3, 1])`;
      cờ list đã nối ở man-choi.js / xuong-ham.js;
   5. KHUNG CHƯƠNG TRÌNH (Editor trên DOM giả): dòng danh sách tách thành ô chạm được; chạm một phần tử → bảng chọn số / màu + "thêm ô" + "bỏ ô"; danh sách rỗng có ô +;
      chọn a[0] / a[i] / len(a) ở chỗ cần số; chọn / đổi tên danh sách (đổi theo ở các dòng dưới); khối kho tự đặt tên mới; đối số danh sách của hàm.
   Chạy: node hoc/kiem-list.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const R = require(path.join(day, '..', 'nhan', 'san-robot-core.js'));
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhungCode = require(path.join(day, 'khung-code.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
for (const f of ['thu-tu-chuong', 'so-lenh', 'man-chuoi-1']) require(path.join(day, f + '.js'));
for (const f of fs.readdirSync(day).filter((f) => /^man-.*\.js$/.test(f)).sort()) require(path.join(day, f));
const ManHoc = require(path.join(day, 'man-drone.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });

/* ================================================================= 1. LÕI LIST */
/** Chạy mã, thu mọi thứ print() in ra. Trả { ra: [chuỗi], loi: null | { loai, dong, td } }. api: hàm game thêm vào (move…). */
function chay(code, apiThem) {
  const ra = [];
  const api = Object.assign({ print: (...a) => { ra.push(a.map((x) => typeof x === 'number' ? String(Math.round(x * 1e6) / 1e6) : String(x)).join(' ')); return 0; } }, apiThem || {});
  try { R.chayCode(code, api); return { ra, loi: null }; }
  catch (e) { if (e && e.cuaGame) return { ra, loi: { loai: e.loai, dong: e.dong, td: e.thongDiep } }; throw e; }
}
const ra = (code, api) => J(chay(code, api).ra);
const loi = (code, api) => chay(code, api).loi;

console.log('\n== 1a. Danh sách: literal, gán, len, a[i], append ==');
{
  kiem('literal số in ra như Python: [2, 3, 1]', ra('a = [2, 3, 1]\nprint(a)') === J(['[2, 3, 1]']));
  kiem('literal chuỗi: ["red", "blue"] (in bằng nháy đơn như Python)', ra('a = ["red", "blue"]\nprint(a)') === J(["['red', 'blue']"]));
  kiem('danh sách rỗng [] in ra [] và len() = 0', ra('a = []\nprint(a)\nprint(len(a))') === J(['[]', '0']));
  kiem('trộn số và chuỗi, có dấu phẩy thừa cuối [1, 2,]', ra('print([1, "a", 3,])') === J(["[1, 'a', 3]"]));
  kiem('phần tử là biểu thức: [1 + 1, 2 * 3]', ra('print([1 + 1, 2 * 3])') === J(['[2, 6]']));
  kiem('len(a) đếm phần tử, len của chuỗi vẫn như cũ', ra('a = [4, 5, 6]\nprint(len(a))\nprint(len("abcd"))') === J(['3', '4']));
  kiem('a[i]: chỉ số đếm từ 0, i là biến', ra('a = [7, 8, 9]\nprint(a[0])\ni = 2\nprint(a[i])\nprint(a[1 + 1])') === J(['7', '9', '9']));
  kiem('a[i] trong vòng for i in range(len(a))', ra('a = [3, 1, 2]\nfor i in range(len(a)):\n    print(a[i])') === J(['3', '1', '2']));
  kiem('a.append(x) thêm vào cuối, x là số, chuỗi hay biểu thức', ra('a = []\na.append(5)\na.append("go")\na.append(1 + 1)\nprint(a)\nprint(len(a))') === J(["[5, 'go', 2]", '3']));
  kiem('append trong vòng lặp: gom các số chẵn', ra('a = []\nfor i in range(6):\n    a.append(i * 2)\nprint(a)') === J(['[0, 2, 4, 6, 8, 10]']));
  kiem('append rồi đọc lại a[len(a) - 1] (phần tử cuối)', ra('a = [1]\na.append(4)\nprint(a[len(a) - 1])') === J(['4']));
  kiem('a.append(..) ở trong thân hàm game như go("up"): vẫn chạy', ra('a = []\nfor c in "UD":\n    a.append(c)\nprint(a)') === J(["['U', 'D']"]));
  kiem('str(a) cho cùng chữ với print', ra('print(str([1, 2]) + "!")') === J(['[1, 2]!']));
}

console.log('\n== 1b. for x in danh sách, x in a / x not in a ==');
{
  kiem('for x in a: duyệt từng phần tử theo thứ tự', ra('a = [2, 3, 1]\nfor x in a:\n    print(x)') === J(['2', '3', '1']));
  kiem('for x in [4, 5]: danh sách đặt thẳng', ra('for x in [4, 5]:\n    print(x * 10)') === J(['40', '50']));
  kiem('for qua danh sách chuỗi', ra('for c in ["red", "blue"]:\n    print(c)') === J(['red', 'blue']));
  kiem('for qua danh sách rỗng: không chạy lần nào', ra('for x in []:\n    print(1)\nprint(2)') === J(['2']));
  kiem('break / continue trong for qua danh sách', ra('for x in [1, 2, 3, 4]:\n    if x == 2:\n        continue\n    if x == 4:\n        break\n    print(x)') === J(['1', '3']));
  kiem('for lồng: danh sách ngoài, range trong', ra('for x in [1, 2]:\n    for i in range(x):\n        print(x)') === J(['1', '2', '2']));
  kiem('thêm phần tử lúc đang duyệt thì duyệt cả phần tử mới (như Python)', ra('a = [1]\nfor x in a:\n    if len(a) < 3:\n        a.append(x + 1)\n    print(x)') === J(['1', '2', '3']));
  kiem('x in a: so đúng giá trị, trả 1 / 0', ra('a = [1, 2, 3]\nprint(2 in a)\nprint(5 in a)') === J(['1', '0']));
  kiem('x not in a', ra('a = [1, 2, 3]\nprint(5 not in a)\nprint(2 not in a)') === J(['1', '0']));
  kiem('"1" in [1, 2] là 0: chuỗi khác số', ra('print("1" in [1, 2])\nprint("red" in ["red", "blue"])') === J(['0', '1']));
  kiem('x in a dùng làm điều kiện if / while', ra('seen = ["red"]\nif "red" in seen:\n    print("co")\nif "blue" not in seen:\n    print("chua")') === J(['co', 'chua']));
  kiem('"U" in "UD" (chuỗi trong chuỗi) vẫn như cũ', ra('print("U" in "UD")\nprint("L" in "UD")') === J(['1', '0']));
}

console.log('\n== 1c. Tham chiếu: truyền vào hàm, đổi ở trong hàm, trả về; so sánh, nối, đúng / sai ==');
{
  kiem('danh sách làm đối số và tham số hàm: def total(s): for x in s: ...', ra('def total(s):\n    t = 0\n    for x in s:\n        t += x\n    return t\nprint(total([2, 3, 1]))') === J(['6']));
  kiem('truyền biến: hàm nhận đúng danh sách', ra('def first(s):\n    return s[0]\na = [9, 8]\nprint(first(a))') === J(['9']));
  kiem('truyền THAM CHIẾU như Python: append ở trong hàm làm danh sách của nơi gọi đổi', ra('def them(s):\n    s.append(7)\nb = [1]\nthem(b)\nprint(b)') === J(['[1, 7]']));
  kiem('gán b = a: hai tên cùng một danh sách', ra('a = [1]\nb = a\nb.append(2)\nprint(len(a))') === J(['2']));
  kiem('hàm trả về danh sách', ra('def tao():\n    s = []\n    s.append(4)\n    return s\nprint(tao())') === J(['[4]']));
  kiem('hàm có hai đối số, một là danh sách', ra('def at(s, i):\n    return s[i]\nprint(at([5, 6, 7], 2))') === J(['7']));
  kiem('a == b so từng phần tử (không phải so chỗ nhớ); != ngược lại', ra('print([1, 2] == [1, 2])\nprint([1, 2] == [2, 1])\nprint([1] != [1])\nprint([] == [])') === J(['1', '0', '0', '1']));
  kiem('danh sách == số là 0 (khác kiểu, như Python)', ra('print([1] == 1)') === J(['0']));
  kiem('a + b nối hai danh sách thành danh sách mới (a không đổi)', ra('a = [1]\nb = a + [2, 3]\nprint(b)\nprint(a)') === J(['[1, 2, 3]', '[1]']));
  kiem('a += b nối thẳng vào a (như Python)', ra('a = [1]\nb = a\na += [2]\nprint(b)') === J(['[1, 2]']));
  kiem('danh sách rỗng là sai, có phần tử là đúng: if a: / while a: / not a', ra('a = []\nif a:\n    print("co")\nelse:\n    print("rong")\na.append(1)\nif a:\n    print("co")\nprint(not [])') === J(['rong', 'co', '1']));
  kiem('and / or với danh sách theo đúng sai', ra('print([] or 7)\nprint([1] and 7)') === J(['7', '7']));
  kiem('hàm game nhận số lấy từ danh sách: move(a[0]) nhận 3', (() => { const got = []; chay('a = [3, 1]\nmove(a[0])\nmove(len(a))', { move: (n) => { got.push(n); return 0; } }); return J(got) === J([3, 2]); })());
  kiem('vòng for qua danh sách điều khiển hàm game: forward theo từng phần tử', (() => { const got = []; chay('steps = [2, 3, 1]\nfor n in steps:\n    move(n)', { move: (n) => { got.push(n); return 0; } }); return J(got) === J([2, 3, 1]); })());
  kiem('int(), str() trên phần tử vẫn như cũ', ra('a = ["12", 3]\nprint(int(a[0]) + a[1])') === J(['15']));
}

console.log('\n== 1d. Những thứ game CHƯA dạy: báo lỗi lời Việt "Game chưa dạy …" ==');
{
  const chuaDay = (code, regex, loai, dong) => { const l = loi(code); return !!l && /^Game chưa dạy/.test(l.td) && regex.test(l.td) && l.loai === loai && l.dong === dong; };
  kiem('cắt đoạn a[1:3]: lỗi cú pháp ở đúng dòng', chuaDay('a = [1, 2, 3]\nb = a[1:3]', /cắt một đoạn/, 'syntax-error', 2), J(loi('a = [1, 2, 3]\nb = a[1:3]')));
  kiem('cắt đoạn a[:2] và a[1:] cũng vậy', chuaDay('a = [1, 2]\nb = a[:1]', /cắt một đoạn/, 'syntax-error', 2) && chuaDay('a = [1, 2]\nb = a[1:]', /cắt một đoạn/, 'syntax-error', 2));
  kiem('gán vào ô a[0] = x: gợi ý dùng append / gán lại cả danh sách', chuaDay('a = [1, 2]\na[0] = 5', /gán vào một ô/, 'syntax-error', 2) && /append/.test(loi('a = [1]\na[0] = 5').td));
  kiem('a[0] += 1 cũng là gán vào ô', chuaDay('a = [1]\na[0] += 1', /gán vào một ô/, 'syntax-error', 2));
  kiem('lệnh .pop() / .sort() / .insert() / .remove() / .extend() / .reverse() chưa dạy, nói còn mỗi .append(x)',
    ['pop', 'sort', 'insert', 'remove', 'extend', 'reverse', 'index', 'count', 'clear', 'copy'].every((p) => { const l = loi('a = [3, 1]\na.' + p + '()'); return !!l && l.loai === 'syntax-error' && l.dong === 2 && /^Game chưa dạy/.test(l.td) && l.td.indexOf('.' + p + '()') >= 0 && /\.append\(x\)/.test(l.td); }));
  kiem('lệnh lạ khác (a.length) cũng báo, không chạy', chuaDay('a = [1]\nx = a.length', /\.length/, 'syntax-error', 2));
  kiem('danh sách lồng danh sách [[1], [2]]: lỗi chạy', chuaDay('a = [[1], [2]]', /nằm trong danh sách/, 'runtime-error', 1));
  kiem('append danh sách vào danh sách cũng không được', chuaDay('a = [1]\nb = [2]\na.append(b)', /nằm trong danh sách/, 'runtime-error', 3));
  kiem('list comprehension [x for x in a]: lỗi cú pháp, gợi ý a = [] + for + append', chuaDay('a = [1, 2]\nb = [x * 2 for x in a]', /vòng for trong ngoặc vuông/, 'syntax-error', 2) && /append/.test(loi('b = [x for x in [1]]').td));
  kiem('lấy từng chữ của chuỗi s[0]: game chưa dạy (dùng for c in s)', chuaDay('s = "abc"\nx = s[0]', /từng chữ của chuỗi/, 'runtime-error', 2));
  kiem('tên hàm của game không bị nhầm: print("a.pop") (chữ trong nháy) vẫn là chuỗi', ra('print("a.pop")') === J(['a.pop']));
}

console.log('\n== 1e. Lỗi chạy: chỉ số, kiểu, hàm game ==');
{
  const l1 = loi('a = [4, 5, 6]\nx = a[3]');
  kiem('chỉ số ngoài tầm a[3]: nói rõ chỉ số 3, độ dài 3 và dải hợp lệ 0 đến 2, đúng dòng', !!l1 && l1.loai === 'runtime-error' && l1.dong === 2 && /Chỉ số 3 nằm ngoài danh sách/.test(l1.td) && /danh sách a có 3 phần tử/.test(l1.td) && /từ 0 đến 2/.test(l1.td), l1 && l1.td);
  const l2 = loi('a = [4, 5, 6]\nx = a[-1]');
  kiem('chỉ số âm a[-1]: nói rõ -1 là số âm, độ dài 3, chỉ số đếm từ 0', !!l2 && l2.dong === 2 && /Chỉ số -1 là số âm/.test(l2.td) && /3 phần tử/.test(l2.td) && /từ 0 đến 2/.test(l2.td), l2 && l2.td);
  const l3 = loi('a = []\nx = a[0]');
  kiem('danh sách rỗng a[0]: nói đang rỗng (0 phần tử), nhắc append', !!l3 && /đang rỗng/.test(l3.td) && /0 phần tử/.test(l3.td) && /append/.test(l3.td), l3 && l3.td);
  const l4 = loi('for i in range(4):\n    x = [1, 2][i]');
  kiem('danh sách đặt thẳng [1, 2][i]: lỗi ngoài tầm ở i = 2 (không có tên thì gọi là "danh sách")', !!l4 && /Chỉ số 2 nằm ngoài danh sách: danh sách có 2 phần tử/.test(l4.td), l4 && l4.td);
  kiem('chỉ số không nguyên a[0.5] và chỉ số là chuỗi a["x"]', /số nguyên/.test(loi('a = [1]\nx = a[0.5]').td) && /số nguyên/.test(loi('a = [1]\nx = a["x"]').td));
  kiem('a[i] của một số: nói chỉ danh sách mới lấy được bằng [ ]', /danh sách, mà "n" là một số/.test(loi('n = 5\nx = n[0]').td));
  const l5 = loi('a = [1]\nx = a + 1');
  kiem('danh sách + số: lỗi kiểu lời Việt (TypeError), gợi ý append', !!l5 && l5.loai === 'runtime-error' && l5.dong === 2 && /Không cộng được danh sách với số/.test(l5.td) && /append/.test(l5.td), l5 && l5.td);
  kiem('số + danh sách và danh sách + chuỗi cũng báo', /Không cộng được số với danh sách/.test(loi('x = 1 + [1]').td) && /Không cộng được danh sách với chuỗi/.test(loi('x = [1] + "a"').td));
  kiem('a += 3 (danh sách cộng dồn số): lỗi kiểu', /Không cộng được danh sách với số/.test(loi('a = [1]\na += 3').td));
  kiem('danh sách - số, danh sách * số, -danh sách: lỗi lời Việt', /phép "-" với danh sách/.test(loi('x = [1] - 1').td) && /nhân danh sách/.test(loi('x = [1] * 2').td) && /Dấu - không đặt trước danh sách/.test(loi('x = -[1]').td));
  kiem('so sánh thứ tự danh sách < >: lỗi, chỉ có == và !=', /Danh sách chỉ so sánh bằng == hoặc !=/.test(loi('x = [1] < [2]').td));
  kiem('range(a) với a là danh sách: lỗi nói "mà đây là một danh sách", gợi ý for x in a: hay range(len(a))', (() => { const l = loi('a = [1]\nfor i in range(a):\n    pass'); return !!l && l.dong === 2 && /mà đây là một danh sách/.test(l.td) && /for x in a:/.test(l.td) && /range\(len\(a\)\)/.test(l.td); })());
  kiem('for x in 5: lỗi, gợi ý range / chuỗi / danh sách', /không lặp qua được/.test(loi('for x in 5:\n    pass').td) && /một danh sách/.test(loi('for x in 5:\n    pass').td));
  kiem('x in 5 (không phải chuỗi / danh sách): lỗi nói cả hai kiểu hợp lệ', /danh sách/.test(loi('x = 1 in 5').td) && /chuỗi nằm trong chuỗi/.test(loi('x = 1 in 5').td));
  kiem('len(5): lỗi nói chuỗi hoặc danh sách; int(danh sách) lỗi', /chuỗi hoặc danh sách/.test(loi('x = len(5)').td) && /không đổi được danh sách/.test(loi('x = int([1])').td));
  kiem('x.append(1) khi x là số hoặc chuỗi: lỗi nói chỉ dùng với danh sách', /chỉ dùng được với danh sách, mà "x" là số/.test(loi('x = 3\nx.append(1)').td) && /là chuỗi/.test(loi('s = "ab"\ns.append(1)').td));
  kiem('append sai số đối số: lỗi lời Việt', /cần đúng 1 đối số, đang có 2/.test(loi('a = []\na.append(1, 2)').td) && /cần đúng 1 đối số, đang có 0/.test(loi('a = []\na.append()').td));
  kiem('hàm game (move, turn…) không nhận cả danh sách: lỗi, gợi ý lấy từng phần tử', (() => { const l = loi('a = [1]\nmove(a)', { move: () => 0 }); return !!l && l.dong === 2 && /Lệnh move\(\) không nhận cả danh sách/.test(l.td) && /a\[0\]/.test(l.td); })());
  kiem('thiếu "]" hay thiếu ngoặc của append: lỗi cú pháp đúng dòng', (() => { const a = loi('a = [1, 2'); const b = loi('a = [1]\na.append'); return !!a && a.loai === 'syntax-error' && a.dong === 1 && /Thiếu dấu "\]"/.test(a.td) && !!b && b.dong === 2 && /Thiếu cặp ngoặc/.test(b.td); })());
  kiem('danh sách quá dài (append mãi trong for qua chính nó): dừng với lời nói rõ, không treo', (() => { const l = loi('a = [1]\nfor x in a:\n    a.append(x)'); return !!l && l.loai === 'runtime-error' && /Danh sách dài quá/.test(l.td); })());
  kiem('hàm gọi sai số đối số vẫn báo như cũ khi tham số là danh sách', /cần 1 đối số, đang có 0/.test(loi('def f(s):\n    return 1\nx = f()').td));
}

console.log('\n== 1f. Hành vi cũ giữ nguyên (chuỗi, số, in, for range) ==');
{
  kiem('số: 3 > 2 and 2 >= 2 → 1; True == 1; chia / chia nguyên', ra('print(3 > 2 and 2 >= 2)\nprint(True == 1)\nprint(7 // 2)\nprint(7 / 2)') === J(['1', '1', '3', '3.5']));
  kiem('chuỗi: nối, lặp, len, so sánh; chuỗi == số là 0', ra('print("ab" + "cd")\nprint("ab" * 2)\nprint(len("abc"))\nprint("1" == 1)') === J(['abcd', 'abab', '3', '0']));
  kiem('for c in "UURR": lặp từng chữ; for range vẫn đúng', ra('s = ""\nfor c in "UR":\n    s += c\nfor i in range(2):\n    s += "x"\nprint(s)') === J(['URxx']));
  kiem('lỗi cũ giữ lời cũ: chuỗi + số, chưa có biến, chia cho 0', /Không cộng được chuỗi với số/.test(loi('x = "a" + 1').td) && /Chưa có biến tên "zz"/.test(loi('x = zz').td) && /Chia cho 0/.test(loi('x = 1 / 0').td));
  kiem('lệnh gọi hàm game vẫn nhường quyền ra ngoài: move(2) nhận 2', (() => { const got = []; chay('move(1 + 1)', { move: (n) => { got.push(n); return 0; } }); return J(got) === J([2]); })());
  kiem('dấu . trong số thập phân và dấu [ ] không làm hỏng số: 1.5 + 2', ra('print(1.5 + 2)') === J(['3.5']));
  kiem('ký tự lạ vẫn báo "Ký tự lạ" (ví dụ @)', /Ký tự lạ/.test(loi('x = 1 @ 2').td));
}

/* ================================================================= màn tạm (nhân bản màn thật) */
const KHO_TRUOC = (() => {
  const tatCa = ManHoc.danhSach, ten = [...new Set(tatCa.flatMap((m) => m.taoHam))], kho = KhoHam.moi({ tenCoDinh: ten });
  for (const m of tatCa) {
    if (m.id === '99.1') break;
    if (m.id === ManHoc.timMa('tham-so.3').id) break;
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi) { if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo, { taoHam: m.taoHam }); kho.sua(h.ten, h.than); }
  }
  return kho.ds();
})();
const goc3 = ManHoc.timMa('tham-so.3');                                   // đường hành lang: forward(5), turn_left(), forward(3), turn_left(), forward(1)
const manList = (cauTruc, them) => Object.assign({}, goc3, { ma: 'thu-list', id: 'T.1', cauTruc: cauTruc, khung: Object.assign({}, goc3.khung, { cauTruc: cauTruc.slice() }) }, them || {});
const M_LIST = manList(['for', 'list']);
const KHO = KHO_TRUOC.concat([H('forward', ['for i in range(n):', '    move()'], ['n'])]).filter((h, i, l) => l.findIndex((x) => x.ten === h.ten) === i);
const cham = (m, chinh, hamCuaMan, kho) => ChamHoc.cham(m, { chinh, hamCuaMan: hamCuaMan || [] }, kho || KHO);
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);

/* ================================================================= 2. KHUNG: cauTruc 'list' */
console.log('\n== 2. Khung: cauTruc có / không có \'list\' ==');
{
  const k = (cau) => ({ chinh: 10, moiHam: 10, cauTruc: cau });
  const ma = (cau, bai) => KhungCode.kiemTra(k(cau), bai, [], []).map((e) => e.ma);
  kiem('màn có khai cauTruc ["for"] mà thiếu "list": dòng `a = [1, 2]` báo cau-truc-chua-hoc (cauTruc "list")', (() => { const e = KhungCode.kiemTra(k(['for']), { chinh: ['a = [1, 2]', 'for n in a:', '    forward(n)'] }, [], []); return e.length === 1 && e[0].ma === 'cau-truc-chua-hoc' && e[0].cauTruc === 'list' && e[0].cot === 'chinh' && e[0].dong === 1; })());
  kiem('lời báo nêu rõ dòng và "danh sách (list)"', /chương trình, dòng 1/.test(KhungCode.kiemTra(k(['for']), { chinh: ['a = [1, 2]'] }, [], [])[0].loi) && /danh sách \(list\)/.test(KhungCode.kiemTra(k(['for']), { chinh: ['a = [1, 2]'] }, [], [])[0].loi));
  kiem('thêm "list" vào cauTruc thì hợp lệ', ma(['for', 'list'], { chinh: ['a = [1, 2]', 'for n in a:', '    forward(n)', 'a.append(3)', 'forward(a[0])'] }).length === 0);
  kiem('mọi dạng dòng danh sách bị bắt khi thiếu "list": a[0], a.append(1), for n in [1, 2]:, weave([1, 2]), forward(a[i])',
    ['forward(a[0])', 'a.append(1)', 'for n in [1, 2]:', 'weave([1, 2])', 'forward(a[i])', 'a = []'].every((d) => J(ma(['for'], { chinh: [d] })) === '["cau-truc-chua-hoc"]'));
  kiem('không khai cauTruc thì không kiểm (mọi chương cũ)', KhungCode.kiemTra({ chinh: 10, moiHam: 10 }, { chinh: ['a = [1, 2]'] }, [], []).length === 0);
  kiem('dấu [ ] trong chuỗi chữ hay chú thích KHÔNG phải danh sách', ma(['for'], { chinh: ['walk("[UD]")', 'move()  # a = [1, 2]', '# [x]'] }).length === 0);
  kiem('cauTruc [] (chưa dạy gì): `a = [1]` cũng báo; dòng thường thì không', J(ma([], { chinh: ['a = [1]'] })) === '["cau-truc-chua-hoc"]' && ma([], { chinh: ['move()'] }).length === 0);
  kiem('hàm CỦA MÀN dùng danh sách mà màn chưa dạy: báo, nói tên hàm', (() => { const e = KhungCode.kiemTra(k(['for']), { chinh: [], hamCuaMan: [H('f', ['a = [1]'])] }, [], []); return e.length === 1 && e[0].cot === 'hamMan' && e[0].ten === 'f' && /hàm f của màn/.test(e[0].loi); })());
  kiem('hàm CỦA EM không bị kiểm (kho dùng ở mọi màn)', KhungCode.kiemTra(k(['for']), { chinh: ['f()'] }, [], [H('f', ['a = [1]', 'a.append(2)'])]).length === 0);
  kiem('KhungCode.laList: nhận dạng dòng danh sách', KhungCode.laList('a = [1, 2]') && KhungCode.laList('a[0]') && KhungCode.laList('x.append(3)') && !KhungCode.laList('walk("[x]")') && !KhungCode.laList('forward(3)'));
  kiem('mọi chương cũ KHÔNG dùng danh sách nên không bị báo (lời giải 3 sao của mọi màn không có cau-truc-chua-hoc "list")',
    ManHoc.danhSach.every((m) => !KhungCode.kiemTra(m.khung, { chinh: m.loiGiai.chinh, hamCuaMan: m.loiGiai.hamCuaMan || [] }, m.hamGoc, m.loiGiai.hamCuaEmMoi || []).some((e) => e.cauTruc === 'list')));
}

/* ================================================================= 3. CHẤM trên màn tạm */
console.log('\n== 3. Chấm (cham.js) trên màn tạm: dòng danh sách chạy robot như số ==');
{
  const VANG = ['forward(5)', 'turn_left()', 'forward(3)', 'turn_left()', 'forward(1)'];
  const goc = cham(M_LIST, VANG);
  const vt = (r) => J(r.theoSan.map((s) => [s.robot.x, s.robot.y, s.robot.huong, s.nhip]));
  kiem('lời giải gốc (viết số thẳng) thắng ở màn tạm — nền để so', goc.thang === true, J(maCua(goc)));
  const a1 = cham(M_LIST, ['a = [5, 3, 1]', 'forward(a[0])', 'turn_left()', 'forward(a[1])', 'turn_left()', 'forward(a[2])']);
  kiem('a[i] đưa vào forward: đi y như viết số (cùng nhịp, cùng chỗ dừng, thắng)', a1.thang === true && vt(a1) === vt(goc), J(maCua(a1)));
  const a2 = cham(M_LIST, ['a = [5, 3, 1]', 'forward(a[0])', 'for n in a:', '    forward(n)', 'turn_left()']);
  kiem('for n in a: forward(n) chạy từng phần tử (chạy được, không lỗi chạy)', !maCua(a2).includes('loi-chay') && !maCua(a2).includes('loi-cu-phap'), J(maCua(a2)));
  const a3 = cham(M_LIST, ['a = [5, 3, 1]', 'for n in a:', '    forward(n)', '    turn_left()']);
  kiem('for n in a: forward(n); turn_left() — ba đoạn dài khác nhau, thắng (rẽ trái sau đoạn cuối không làm hỏng)', a3.thang === true, J(maCua(a3)));
  const a4 = cham(M_LIST, ['a = []', 'a.append(5)', 'a.append(3)', 'a.append(1)', 'for n in a:', '    forward(n)', '    turn_left()']);
  kiem('a = [] rồi append ba lần: cùng kết quả với a = [5, 3, 1]', a4.thang === true && vt(a4) === vt(a3), J(maCua(a4)));
  const a5 = cham(M_LIST, ['for n in [5, 3, 1]:', '    forward(n)', '    turn_left()']);
  kiem('for n in [5, 3, 1]: (danh sách đặt thẳng) cùng kết quả', a5.thang === true && vt(a5) === vt(a3), J(maCua(a5)));
  const a6 = cham(M_LIST, ['for i in range(3):', '    forward(1)']);
  const w = H('weave', ['for n in steps:', '    forward(n)', '    turn_left()'], ['steps']);
  const a7 = cham(M_LIST, ['weave([5, 3, 1])'], [], KHO.concat([w]));
  kiem('hàm của em nhận danh sách: weave([5, 3, 1]) = for n in steps: forward(n); turn_left() → thắng', a7.thang === true, J(maCua(a7)) + ' ' + a7.chanDoan.map((c) => c.loi).join('|'));
  const a8 = cham(M_LIST, ['a = [5, 3, 1]', 'weave(a)'], [], KHO.concat([w]));
  kiem('truyền biến danh sách vào hàm: weave(a) cũng thắng', a8.thang === true && vt(a8) === vt(a7), J(maCua(a8)));
  const a9 = cham(M_LIST, ['a = [5, 3, 1]', 'for i in range(len(a)):', '    forward(a[i])', '    turn_left()']);
  kiem('for i in range(len(a)): forward(a[i]) cũng thắng', a9.thang === true && vt(a9) === vt(a3), J(maCua(a9)));
  const e1 = cham(M_LIST, ['a = [5, 3]', 'forward(a[2])']);
  const c1 = e1.chanDoan.find((c) => c.ma === 'loi-chay');
  kiem('chỉ số ngoài tầm: loi-chay, lời Việt chỉ rõ chỉ số 2 và 2 phần tử, trỏ vào dòng 2 của chương trình', !!c1 && /Chỉ số 2 nằm ngoài danh sách/.test(c1.loi) && /2 phần tử/.test(c1.loi) && /dòng 2/.test(c1.loi) && !!c1.cho && c1.cho.dong === 2, c1 && c1.loi);
  const e2 = cham(M_LIST, ['a = [5, 3]', 'a[0] = 1']);
  const c2 = e2.chanDoan.find((c) => c.ma === 'loi-cu-phap');
  kiem('"chưa dạy" là lỗi cú pháp lời Việt: a[0] = 1 → loi-cu-phap "Game chưa dạy gán vào một ô…"', !!c2 && /Game chưa dạy gán vào một ô/.test(c2.loi), J(maCua(e2)));
  const e3 = cham(M_LIST, ['a = [5, 3]', 'forward(a)']);
  const c3 = e3.chanDoan.find((c) => c.ma === 'loi-chay');
  kiem('truyền cả danh sách cho forward (số) → hàm của em chạy range(a): loi-chay nói range() cần số, mà đây là danh sách', !!c3 && /range\(\) cần đối số là số, mà đây là một danh sách/.test(c3.loi) && /for x in a:/.test(c3.loi), J(e3.chanDoan.map((c) => c.loi)));
  const e4 = cham(M_LIST, ['a = [5]', 'move(a)']);
  const c4 = e4.chanDoan.find((c) => c.ma === 'loi-chay');
  kiem('hàm gốc nhận danh sách (move(a) của hàm em hay lệnh game): báo lỗi chạy, không treo', e4.thang === false && (!!c4 || maCua(e4).length > 0), J(e4.chanDoan.map((c) => c.loi)));
  const k1 = cham(manList(['for']), ['a = [5, 3, 1]', 'forward(a[0])']);
  kiem('màn khai cauTruc ["for"] (thiếu "list"): đúng MỘT lỗi cau-truc-chua-hoc "list" ở dòng 1 và không chạy sân nào', J(maCua(k1)) === '["cau-truc-chua-hoc"]' && k1.chanDoan[0].cauTruc === 'list' && k1.chanDoan[0].dong === 1 && k1.theoSan.length === 0 && k1.thang === false, J(maCua(k1)));
  kiem('lời chẩn đoán cau-truc-chua-hoc nêu "danh sách (list) chưa được dùng ở màn này"', /danh sách \(list\) chưa được dùng ở màn này/.test(k1.chanDoan[0].loi), k1.chanDoan[0].loi);
  kiem('cùng chương trình ở màn có list thì không bị chặn', !maCua(cham(M_LIST, ['a = [5, 3, 1]', 'forward(a[0])'])).includes('cau-truc-chua-hoc'));
  const t1 = ChamHoc.thuHam(M_LIST, { chinh: [], hamCuaMan: [] }, 'weave', KHO.concat([w]), { doiSo: ['[5, 3, 1]'] });
  kiem('sân thử Xưởng: thuHam với đối số danh sách "[5, 3, 1]" chạy weave được (đúng 11 ... nhịp > 0, không lỗi chạy)', t1.soNhip > 0 && !t1.chanDoan.some((c) => c.ma === 'loi-chay' || c.ma === 'loi-cu-phap'), J(t1.chanDoan.map((c) => c.loi)));
  const t2 = ChamHoc.thuHam(M_LIST, { chinh: [], hamCuaMan: [] }, 'weave', KHO.concat([w]), { doiSo: ['[]'] });
  kiem('sân thử với danh sách rỗng "[]": hàm không làm gì, không lỗi', !t2.chanDoan.some((c) => c.ma === 'loi-chay' || c.ma === 'loi-cu-phap') && t2.soNhip === 0, J(t2.chanDoan.map((c) => c.loi)));
  kiem('mọi màn thật vẫn chạy: lời giải 3 sao của mọi màn không có loi-chay / loi-cu-phap vì danh sách (vd. dấu [ ])',
    ManHoc.danhSach.filter((m) => (m.cauTruc || []).indexOf('list') < 0).every((m) => !/\[|\]/.test([].concat(m.loiGiai.chinh, (m.loiGiai.hamCuaEmMoi || []).flatMap((h) => h.than)).join('\n'))));       // chỉ các màn CHƯA học list (flycam, gói List có cauTruc "list" thì dùng [ ] thoải mái)
}

/* ================================================================= DOM GIẢ (đủ cho Palette, Editor và các bảng chọn của game/thanh-phan.js) */
function unesc(s) { return String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
function khop(el, sel) {                                                   // một phần chọn đơn: tag.a.b[data-x="y"][data-z]
  const tag = /^[a-z]+/.exec(sel);
  if (tag && el.tag !== tag[0]) return false;
  const m = sel.match(/\.[\w-]+|\[[\w-]+(?:="[^"]*")?\]/g) || [];
  return m.every((p) => {
    if (p[0] === '.') return el._cls.has(p.slice(1));
    const a = /\[([\w-]+)(?:="([^"]*)")?\]/.exec(p);
    return a[2] === undefined ? el.attrs[a[1]] !== undefined : el.attrs[a[1]] === a[2];
  });
}
class El {
  constructor(tag) { this.tag = tag; this.children = []; this.attrs = {}; this.handlers = {}; this._cls = new Set(); this.style = {}; this.parentNode = null; this._text = ''; this._html = ''; this.disabled = false; this.scrollTop = 0; this.clientHeight = 400; this.scrollHeight = 300; this.clientWidth = 40; this.scrollWidth = 40; this.offsetHeight = 40; this.offsetWidth = 100; }
  get className() { return [...this._cls].join(' '); }
  set className(v) { this._cls = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get classList() {
    const s = this._cls;
    return { add: (...c) => c.forEach((x) => s.add(x)), remove: (...c) => c.forEach((x) => s.delete(x)), contains: (c) => s.has(c), toggle: (c, f) => { const on = f === undefined ? !s.has(c) : !!f; if (on) s.add(c); else s.delete(c); return on; } };
  }
  appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
  insertBefore(c, ref) { c.parentNode = this; const i = this.children.indexOf(ref); if (i < 0) this.children.push(c); else this.children.splice(i, 0, c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; return c; }
  get firstChild() { return this.children[0] || null; }
  get nextSibling() { const p = this.parentNode; if (!p) return null; const i = p.children.indexOf(this); return p.children[i + 1] || null; }
  set innerHTML(v) {                                                      // chỉ các <span class=".." data-..>…</span> (kể cả lồng nhau) được dựng lại thành phần tử: đủ cho dòng code
    this.children = []; this._html = String(v); this._text = '';
    const re = /<span class="([^"]*)"((?:\s+[\w-]+="[^"]*")*)>|<\/span>|([^<]+)/g, pila = [this];
    let m;
    while ((m = re.exec(this._html))) {
      const top = pila[pila.length - 1];
      if (m[3] !== undefined) { if (top !== this) top._text += unesc(m[3]); continue; }
      if (m[0] === '</span>') { if (pila.length > 1) pila.pop(); continue; }
      const e = new El('span'); e.className = m[1];
      (m[2].match(/[\w-]+="[^"]*"/g) || []).forEach((a) => { const q = /([\w-]+)="([^"]*)"/.exec(a); e.attrs[q[1]] = unesc(q[2]); });
      e.parentNode = top; top.children.push(e); pila.push(e);
    }
  }
  get innerHTML() { return this._html; }
  set textContent(v) { this._text = String(v); this.children = []; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] === undefined ? null : this.attrs[k]; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); }
  click() { if (this.disabled) return; (this.handlers.click || []).forEach((fn) => fn({ stopPropagation() {}, preventDefault() {}, target: this })); }
  contains(el) { for (let n = el; n; n = n.parentNode) if (n === this) return true; return false; }
  closest(sel) { for (let n = this; n; n = n.parentNode) if (n._cls && khop(n, sel)) return n; return null; }
  querySelectorAll(sel) {
    const phan = sel.trim().split(/\s+/), kq = [];
    const di = (n, ngu) => { for (const k of n.children) { const du = ngu < phan.length && khop(k, phan[ngu]); if (du && ngu === phan.length - 1) kq.push(k); di(k, du ? ngu + 1 : ngu); } };
    di(this, 0);
    return kq;
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  getBoundingClientRect() { return { left: 50, right: 80, top: 100, bottom: 120, width: 30, height: 20 }; }
}
const stage = new El('div'); stage.id = 'stage'; stage.offsetWidth = 360; stage.offsetHeight = 640; stage.getBoundingClientRect = () => ({ left: 0, top: 0, right: 360, bottom: 640, width: 360, height: 640 });
const doc = {
  addEventListener() {}, createElement: (tag) => new El(tag), createTextNode: (s) => { const e = new El('#text'); e._text = String(s); return e; },
  getElementById: (id) => (id === 'stage' ? stage : null), body: new El('body')
};
const luuGia = { co: {}, daXem(k) { return !!this.co[k]; }, datDaXem(k) { this.co[k] = true; return true; } };
const ctx = vm.createContext({
  console, document: doc, getComputedStyle: () => ({ fontSize: '11px' }), Ve: { ico: () => new El('i'), khoa: () => new El('i') }, SanHoc, KhungCode, ManHoc, Luu: luuGia,
  setTimeout: (f, ms) => { const h = setTimeout(f, ms); if (h && h.unref) h.unref(); return h; }, clearTimeout, addEventListener() {}, removeEventListener() {}
});
ctx.window = ctx;
for (const f of ['chu.js', 'huong-dan.js', 'thanh-phan.js']) vm.runInContext(fs.readFileSync(path.join(day, 'game', f), 'utf8'), ctx, { filename: f });
const TP = ctx.TP;

function khayMoi(cb) {
  const bang = new El('div'), bh = new El('div'); bh.className = 'bh';
  const tt = new El('span'); tt.className = 'tt'; bh.appendChild(tt);
  const host = new El('div'); host.className = 'pal';
  bang.appendChild(bh); bang.appendChild(host);
  const pal = new TP.Palette(host, Object.assign({ khiChen() {}, khiSua() {}, khiBien() {}, khiMoi() {} }, cb || {}));
  return { pal, host, bh };
}
/** Các nhóm / khối đang hiện trong khay: "## NHÃN NHÓM" / data-ten của khối. */
function noiDung(host) {
  const kq = [];
  (function di(n) { for (const c of n.children) { if (c._cls.has('gl')) kq.push('## ' + c.children[0].textContent); else if (c._cls.has('brick')) kq.push(c.getAttribute('data-ten')); else di(c); } })(host);
  return kq;
}
function quetThe(k) {
  const kq = {}, ds = k.pal.dsThe();
  if (ds.length < 2) { kq[k.pal.theHienTai()] = noiDung(k.host); return kq; }
  const nhan = (c) => k.bh.querySelector('.pal-the').children.filter((x) => x._cls.has('cuon-b'))[c];
  for (let i = 0; i < ds.length; i++) { kq[k.pal.theHienTai()] = noiDung(k.host); nhan(1).click(); }
  return kq;
}
function specMan(m, them) {
  return Object.assign({
    goc: m.hamGoc, loai: m.loaiRobot, vong: TP.coCauTruc(m, 'for'), vongWhile: TP.coCauTruc(m, 'while') && TP.coDieuKienCua(m), cam: TP.camBienCua(m), mau: TP.coMauCua(m), pin: TP.coPinCua(m),
    chuoi: false, dieuKien: TP.coCauTruc(m, 'if') && TP.coDieuKienCua(m), list: TP.coListCua(m),
    em: KHO, man: [], coNutMoi: true, the: 'than', lamMoi: true
  }, them || {});
}

/* ================================================================= 4. KHAY */
console.log('\n== 4. Khay: nhóm DANH SÁCH ở thẻ Logic theo cờ spec.list ==');
{
  const co = khayMoi(); co.pal.dung(specMan(M_LIST));
  const kqCo = quetThe(co);
  const khong = khayMoi(); khong.pal.dung(specMan(manList(['for'])));
  const kqKhong = quetThe(khong);
  kiem('TP.coListCua(man): đúng khi cauTruc có "list", sai khi không (kể cả chưa khai)', TP.coListCua(M_LIST) === true && TP.coListCua(manList(['for'])) === false && TP.coListCua({}) === false && TP.coListCua(null) === false);
  kiem('có cờ list: thẻ Logic ("cam") có nhóm "## DANH SÁCH" ngay sau khối for', kqCo.cam && kqCo.cam.indexOf('## DANH SÁCH') > kqCo.cam.indexOf('for') && kqCo.cam.indexOf('for') >= 0, J(kqCo));
  kiem('bốn khối đúng thứ tự: ls-gan, ls-for, ls-forlit, ls-them', J(kqCo.cam.filter((x) => /^ls-/.test(x))) === J(['ls-gan', 'ls-for', 'ls-forlit', 'ls-them']), J(kqCo.cam));
  const goi = (khoa) => { const b = co.host; let kq = null; (function di(n) { for (const c of n.children) { if (c.getAttribute && c.getAttribute('data-ten') === khoa) kq = c.getAttribute('data-goi'); else di(c); } })(b); return kq; };
  const kCam = khayMoi(); kCam.pal.dung(specMan(M_LIST)); kCam.pal.chonThe('cam');
  const goiCua = (k, khoa) => { let kq = null; (function di(n) { for (const c of n.children) { if (c.getAttribute && c.getAttribute('data-ten') === khoa) kq = c.getAttribute('data-goi'); else di(c); } })(k.host); return kq; };
  kiem('nội dung chèn: `a = [1, 2]`, `for n in a:`, `for n in [1, 2]:`, `a.append(1)`',
    goiCua(kCam, 'ls-gan') === 'a = [1, 2]' && goiCua(kCam, 'ls-for') === 'for n in a:' && goiCua(kCam, 'ls-forlit') === 'for n in [1, 2]:' && goiCua(kCam, 'ls-them') === 'a.append(1)');
  kiem('không có cờ list: không nhóm DANH SÁCH, không khối ls-* ở thẻ nào', Object.values(kqKhong).every((l) => !l.some((x) => /^ls-/.test(x) || x === '## DANH SÁCH')) && J(kqKhong.cam).indexOf('ls-') < 0, J(kqKhong));
  kiem('khay không cờ list giữ y như cũ: for vẫn ở thẻ Logic, thẻ Logic vẫn có (màn có for)', kqKhong.cam && kqKhong.cam.indexOf('for') >= 0);
  const chiList = khayMoi(); chiList.pal.dung(specMan(M_LIST, { vong: false, dieuKien: false }));
  kiem('chỉ có list (không for / if): thẻ Logic vẫn có và chứa nhóm DANH SÁCH (không có nhóm for)', chiList.pal.dsThe().indexOf('cam') >= 0 && quetThe(chiList).cam.filter((x) => /^ls-/.test(x)).length === 4);
  const khongLogic = khayMoi(); khongLogic.pal.dung(specMan(manList([]), { vong: false, dieuKien: false }));
  kiem('không for, không if, không list: không có thẻ Logic (như chương đầu)', khongLogic.pal.dsThe().indexOf('cam') < 0);
  kiem('chạm khối ls-gan gọi khiChen("a = [1, 2]") (cb.khiChen nhận đúng chữ)', (() => { const got = []; const k = khayMoi({ khiChen: (t) => got.push(t) }); k.pal.dung(specMan(M_LIST)); k.pal.chonThe('cam'); let b = null; (function di(n) { for (const c of n.children) { if (c.getAttribute && c.getAttribute('data-ten') === 'ls-them') b = c; else di(c); } })(k.host); b.click(); return J(got) === J(['a.append(1)']); })());
  kiem('hàm của em nhận danh sách (kieuDoiSo "list"): khối chèn `weave([2, 3, 1])` (không phải weave(1))', (() => {
    const got = []; const kho = KHO.concat([H('weave', ['for n in steps:', '    forward(n)'], ['steps'])]);
    const k = khayMoi({ khiChen: (t) => got.push(t), kieuDoiSo: (ten, i) => (ten === 'weave' ? 'list' : 'so') }); k.pal.dung(specMan(M_LIST, { em: kho }));
    let b = null; (function di(n) { for (const c of n.children) { if (c.getAttribute && c.getAttribute('data-ten') === 'weave') b = c; else di(c); } })(k.host);
    if (!b) return false;
    b.click(); return J(got) === J(['weave([2, 3, 1])']);
  })());
  const ngTP = fs.readFileSync(path.join(day, 'game', 'thanh-phan.js'), 'utf8'), mc = fs.readFileSync(path.join(day, 'game', 'man-choi.js'), 'utf8'), xh = fs.readFileSync(path.join(day, 'game', 'xuong-ham.js'), 'utf8');
  kiem('cờ list nối ở màn chơi (veKho: list: TP.coListCua(m); vao: TP.datCheList) và Xưởng (lamPal: list: TP.coListCua(man); mo: TP.datCheList)',
    /list: TP\.coListCua\(m\)/.test(mc) && /TP\.datCheList\(TP\.coListCua\(m\)\)/.test(mc) && /list: TP\.coListCua\(man\)/.test(xh) && /TP\.datCheList\(TP\.coListCua\(A\.man\(\)\)\)/.test(xh));
  kiem('Xưởng: đối số danh sách ở thanh tên hàm (chipList), chạm sửa phần tử, chạy bằng viDuCode ("[2, 3, 1]")', /function chipList\(/.test(xh) && /function moPtuThu\(/.test(xh) && /function viDuCode\(/.test(xh) && /TP\.chonPtu\(/.test(xh) && /DS_LIST_MAC_DINH = \[2, 3, 1\]/.test(xh));
  kiem('choi.html nạp đủ tệp và có chữ DANH SÁCH / thêm ô / bỏ ô trong chu.js', /thanh-phan\.js/.test(fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8')) && ctx.t('choi.nhom.list') === 'DANH SÁCH' && ctx.t('choi.themO') === '+ thêm ô' && ctx.t('choi.boO') === 'bỏ ô');
  kiem('phép kiểm "đang thấy" khối trong khay tìm theo data-ten: `ls-gan` có data-loai "ls" và lớp .ls (CSS xanh chanh)', (() => { let b = null; (function di(n) { for (const c of n.children) { if (c.getAttribute && c.getAttribute('data-ten') === 'ls-gan') b = c; else di(c); } })(kCam.host); return !!b && b.getAttribute('data-loai') === 'ls' && b._cls.has('ls') && /\.brick\.ls\{/.test(fs.readFileSync(path.join(day, 'game', 'choi.css'), 'utf8')); })());
}

/* ================================================================= 5. KHUNG CHƯƠNG TRÌNH (Editor) */
/** Một Editor trên DOM giả. Trả { ed, arr, nDoi, host, hang(i), o(i, sel), cham(i, sel), bang(), nut(sel) }. */
function dungEditor(dong, tuyChon) {
  const arr = dong.slice(), host = new El('div'), st = { nDoi: 0 };
  const ed = new TP.Editor(host, Object.assign({ tong: 10, dung: 10, lay: () => arr, khiDoi: () => { st.nDoi++; }, thutLe: () => true }, tuyChon || {}));
  const hang = (i) => ed.hangEl(i), strip = (i) => hang(i).children[1];
  const o = (i, sel) => strip(i).querySelector(sel);
  const bang = () => stage.children.filter((c) => c._cls.has('chon-so'))[0] || null;
  const nut = (sel) => { const b = bang(); return b ? b.querySelector(sel) : null; };
  const cham = (i, sel) => { const so = o(i, sel); if (!so) throw new Error('không có ô ' + sel + ' ở dòng ' + i); hang(i).handlers.click[0]({ target: { closest: (s) => (s === '.num' ? so : null) }, pointerType: 'mouse' }); };
  const dongBang = () => { TP.dongChonSo(); };
  return Object.assign(st, { ed, arr, host, hang, o, bang, nut, cham, dongBang });
}
const chu = (e) => e.textContent;

console.log('\n== 5a. Dòng danh sách tách thành ô chạm được (TP.tachList, TP.mauDong) ==');
{
  TP.datCheList(true);
  const t = (d) => TP.tachList(d);
  kiem('tachList `a = [2, 3, 1]`: ds = [tên, 2, 3, 1], một đoạn lit từ ô 1 đến 4', (() => { const d = t('a = [2, 3, 1]'); return d.loai === 'ganList' && J(d.ds) === '["a","2","3","1"]' && J(d.cau) === '[{"lit":true,"tu":1,"den":4}]'; })());
  kiem('tachList `a = []`: danh sách rỗng, đoạn lit rỗng (tu == den)', (() => { const d = t('a = []'); return J(d.ds) === '["a"]' && d.cau[0].lit && d.cau[0].tu === d.cau[0].den; })());
  kiem('tachList `for n in a:` (forList, một ô tên) và `for n in [4, 5]:` (forLit, hai phần tử)', (() => { const a = t('for n in a:'), b = t('for n in [4, 5]:'); return a.loai === 'forList' && J(a.ds) === '["a"]' && b.loai === 'forLit' && J(b.ds) === '["4","5"]'; })());
  kiem('tachList `a.append(1)` (themList: tên + giá trị), `a.append(n)` (giá trị là tên biến)', (() => { const a = t('a.append(1)'), b = t('a.append(n)'); return a.loai === 'themList' && J(a.ds) === '["a","1"]' && J(b.ds) === '["a","n"]'; })());
  kiem('tachList `weave([2, 3, 1])`: lời gọi có danh sách → goiList; `route([1], [2, 3], 4)` có hai danh sách và một số', (() => { const a = t('weave([2, 3, 1])'), b = t('route([1], [2, 3], 4)'); return a.loai === 'goiList' && a.ten === 'weave' && J(a.ds) === '["2","3","1"]' && J(b.ds) === '["1","2","3","4"]' && J(b.cau.map((c) => [c.lit, c.tu, c.den])) === '[[true,0,1],[true,1,3],[false,3,4]]'; })());
  kiem('tachList `forward(a[i])` và `forward(len(a))` (đối số có ngoặc) → goi thường, đối số đúng không bị cắt ở dấu ")"', (() => { const a = t('forward(a[i])'), b = t('forward(len(a))'), c = t('step(len(a), a[0])'); return a.loai === 'goi' && J(a.ds) === '["a[i]"]' && J(b.ds) === '["len(a)"]' && J(c.ds) === '["len(a)","a[0]"]'; })());
  kiem('tachList `for i in range(len(a)):` → range, đối số len(a)', (() => { const d = t('for i in range(len(a)):'); return d.loai === 'range' && J(d.ds) === '["len(a)"]'; })());
  kiem('dòng thường (move(), for i in range(3):, wait()) không phải danh sách: tachList trả null', ['move()', 'for i in range(3):', 'wait()', 'forward(3)', 'if front_clear():', 'x = 1'].every((d) => t(d) === null));
  kiem('chuỗi chỉ đường `for c in path:` (tên path / s / chu) không bị coi là danh sách', t('for c in path:') === null && t('for c in s:') === null);
  kiem('cả TP.tachDoiSo trả cùng cấu trúc (dùng chung cho Editor): `a = [1, 2]` có ghep', (() => { const d = TP.tachDoiSo('a = [1, 2]'); return d.loai === 'ganList' && typeof d.ghep === 'function'; })());
  const h1 = TP.mauDong('a = [2, 3, 1]');
  const dem = (html, re) => (html.match(re) || []).length;
  kiem('mauDong `a = [2, 3, 1]`: tên danh sách là ô lsten (data-k 0) + 3 ô phần tử .ptu (data-k 1, 2, 3)', dem(h1, /class="num lsten" data-k="0"/g) === 1 && dem(h1, /class="num ptu"/g) === 3 && /data-k="3" data-seg="0" data-ptu="1" data-so="1"/.test(h1), h1);
  kiem('mauDong `a = []`: một ô + (ptu them, data-them) thay cho các phần tử', /class="num ptu them"/.test(TP.mauDong('a = []')) && dem(TP.mauDong('a = []'), /class="num ptu"/g) === 0);
  kiem('mauDong phần tử chuỗi / màu: chip màu mc-red, mc-blue; chuỗi lạ mc-sai', (() => { const h = TP.mauDong('a = ["red", "blue", "pink"]'); return /mc-red/.test(h) && /mc-blue/.test(h) && /mc-sai/.test(h) && /data-chuoi="red"/.test(h); })());
  kiem('mauDong `for n in a:` có ô tên danh sách; `for n in [4, 5]:` có hai ô phần tử; `a.append(1)` có ô tên + ô số', (() => {
    const a = TP.mauDong('for n in a:'), b = TP.mauDong('for n in [4, 5]:'), c = TP.mauDong('a.append(1)');
    return /lsten/.test(a) && dem(b, /class="num ptu"/g) === 2 && /lsten/.test(c) && /class="num" data-k="1" data-so="1"/.test(c);
  })());
  kiem('mauDong `weave([2, 3, 1])`: tên hàm + 3 ô phần tử; `forward(len(a))`: ô len(a) chạm được (bien)', dem(TP.mauDong('weave([2, 3, 1])'), /class="num ptu"/g) === 3 && /data-bien="len\(a\)"/.test(TP.mauDong('forward(len(a))')) && /data-bien="a\[0\]"/.test(TP.mauDong('forward(a[0])')));
  kiem('mauDong `for i in range(len(a)):` có ô len(a) chạm được', /data-bien="len\(a\)"/.test(TP.mauDong('for i in range(len(a)):')));
  TP.datCheList(false);
  kiem('TẮT chế độ list (màn không có list): `a = [2, 3]` vẽ chữ thường, không có ô chạm được — như trước', !/class="num/.test(TP.mauDong('a = [2, 3]')) && TP.tachDoiSo('a = [2, 3]') === null);
  kiem('TẮT chế độ list: dòng cũ vẫn tách đúng (for c in path: là forChuoi, range(3), forward(2))', TP.tachDoiSo('for c in path:').loai === 'forChuoi' && TP.tachDoiSo('for i in range(3):').loai === 'range' && TP.tachDoiSo('forward(2)').ds[0] === '2');
  TP.datCheList(true);
}

console.log('\n== 5b. Thêm / bỏ phần tử, thay cả danh sách bằng tên (TP.themPtuDong, boPtuDong, litThanhTen) ==');
{
  TP.datCheList(true);
  kiem('thêm ô sau ô k: a = [2, 3] thêm sau ô 1 (số 2) phần tử 9 → [2, 9, 3]', TP.themPtuDong('a = [2, 3]', 0, 1, 9) === 'a = [2, 9, 3]');
  kiem('thêm sau ô cuối: [2, 3] sau ô 2 → [2, 3, 1]', TP.themPtuDong('a = [2, 3]', 0, 2, 1) === 'a = [2, 3, 1]');
  kiem('danh sách rỗng: thêm vào đầu → [1]; `for n in []:` cũng vậy', TP.themPtuDong('a = []', 0, 1, 1) === 'a = [1]' && TP.themPtuDong('for n in []:', 0, 0, 4) === 'for n in [4]:');
  kiem('đủ LIST_TOI_DA (6) ô thì không thêm nữa (dòng không đổi)', TP.themPtuDong('a = [1, 2, 3, 4, 5, 6]', 0, 6, 1) === 'a = [1, 2, 3, 4, 5, 6]' && TP.LIST_TOI_DA === 6 && TP.themPtuDong('a = [1, 2, 3, 4, 5]', 0, 5, 1) === 'a = [1, 2, 3, 4, 5, 1]');
  kiem('bỏ ô: [2, 3, 1] bỏ ô 2 (số 3) → [2, 1]; bỏ hết → []', TP.boPtuDong('a = [2, 3, 1]', 0, 2) === 'a = [2, 1]' && TP.boPtuDong('a = [7]', 0, 1) === 'a = []');
  kiem('hai danh sách trong một lời gọi: thêm vào danh sách thứ hai không đụng danh sách đầu', TP.themPtuDong('route([1], [2, 3], 4)', 1, 1, 9) === 'route([1], [2, 9, 3], 4)' && TP.boPtuDong('route([1], [2, 3], 4)', 0, 0) === 'route([], [2, 3], 4)');
  kiem('danh sách rỗng đứng trước số: route([], 2) thêm phần tử vào danh sách rỗng, số 2 giữ nguyên', TP.themPtuDong('route([], 2)', 0, 0, 5) === 'route([5], 2)');
  kiem('thêm / bỏ ở dòng không phải danh sách thì dòng không đổi', TP.themPtuDong('forward(3)', 0, 0, 1) === 'forward(3)' && TP.boPtuDong('move()', 0, 0) === 'move()');
  kiem('thế cả danh sách bằng tên: weave([2, 3, 1]) → weave(steps); route([1], [2, 3], 4) đoạn 1 → route([1], steps, 4)', TP.litThanhTen('weave([2, 3, 1])', 0, 'steps') === 'weave(steps)' && TP.litThanhTen('route([1], [2, 3], 4)', 1, 'steps') === 'route([1], steps, 4)');
  kiem('thay giá trị một phần tử bằng TP.thayDoiSo: ô 2 của [2, 3, 1] thành 8; thay tên danh sách (ô 0)', TP.thayDoiSo('a = [2, 3, 1]', 2, 8) === 'a = [2, 8, 1]' && TP.thayDoiSo('a = [2, 3, 1]', 0, 'b') === 'b = [2, 3, 1]' && TP.thayDoiSo('for n in a:', 0, 'steps') === 'for n in steps:');
  kiem('màu: thay phần tử 1 bằng "blue"; thêm phần tử sau ô màu là "red"', TP.thayDoiSo('a = ["red", "green"]', 1, '"blue"') === 'a = ["blue", "green"]');
}

console.log('\n== 5c. Chạm phần tử → bảng chọn (số 1–9, màu) + thêm ô + bỏ ô ==');
{
  TP.datCheList(true);
  const E1 = dungEditor(['a = [2, 3, 1]', 'for n in a:', '    forward(n)']);
  E1.cham(0, '.ptu[data-k="2"]');
  const b1 = E1.bang();
  const nhanNut = (b) => b ? b.querySelectorAll('button').map((x) => x.getAttribute('data-nut') || x.getAttribute('data-so') || x.getAttribute('data-mau')) : [];
  kiem('chạm ô phần tử → mở bảng chon-ptu (đúng bảng, không phải bảng số lặp)', !!b1 && b1._cls.has('chon-ptu'), b1 && b1.className);
  kiem('bảng có đủ 9 nút số 1–9, nút "thêm ô" (ptu-them) và "bỏ ô" (ptu-bo); không có hàng màu khi danh sách toàn số và màn không có màu', J(nhanNut(b1)) === J(['1', '2', '3', '4', '5', '6', '7', '8', '9', 'ptu-them', 'ptu-bo']), J(nhanNut(b1)));
  kiem('nút của giá trị đang có sáng (số 3 ở ô 2 có lớp on); chữ nút "+ thêm ô" / "bỏ ô"', b1.querySelector('[data-so="3"]')._cls.has('on') && !b1.querySelector('[data-so="2"]')._cls.has('on') && b1.querySelector('[data-nut="ptu-them"]').textContent === '+ thêm ô' && b1.querySelector('[data-nut="ptu-bo"]').textContent === 'bỏ ô');
  b1.querySelector('[data-so="7"]').click();
  kiem('chọn 7: phần tử đổi, các ô khác giữ, bảng đóng, khung báo đổi (khiDoi)', E1.arr[0] === 'a = [2, 7, 1]' && E1.bang() === null && E1.nDoi === 1, E1.arr[0]);
  E1.cham(0, '.ptu[data-k="1"]');
  E1.nut('[data-nut="ptu-them"]').click();
  kiem('"thêm ô" ở ô 1 (số 2): chèn ngay SAU ô đó phần tử 1 → [2, 1, 7, 1]', E1.arr[0] === 'a = [2, 1, 7, 1]', E1.arr[0]);
  kiem('thêm xong, bảng chọn mở lại ở ô mới (ô 2) để chọn giá trị luôn', (() => { const b = E1.bang(); return !!b && b._cls.has('chon-ptu') && b.querySelector('[data-so="1"]')._cls.has('on'); })());
  E1.dongBang();
  E1.cham(0, '.ptu[data-k="2"]'); E1.nut('[data-nut="ptu-bo"]').click();
  kiem('"bỏ ô": bỏ đúng ô được chạm (ô 2) → [2, 7, 1]; bảng đóng', E1.arr[0] === 'a = [2, 7, 1]' && E1.bang() === null, E1.arr[0]);
  for (let k = 0; k < 3; k++) { E1.cham(0, '.ptu[data-k="1"]'); E1.nut('[data-nut="ptu-bo"]').click(); }
  kiem('bỏ hết các ô: danh sách rỗng `a = []`, dòng vẫn còn, vẽ ô +', E1.arr[0] === 'a = []' && !!E1.o(0, '.ptu.them') && E1.arr.length === 3, E1.arr[0]);
  E1.cham(0, '.ptu.them');
  kiem('chạm ô + ở danh sách rỗng: thêm phần tử đầu (1) rồi mở bảng chọn cho nó', E1.arr[0] === 'a = [1]' && !!E1.bang() && E1.bang()._cls.has('chon-ptu'), E1.arr[0]);
  E1.nut('[data-so="4"]').click();
  kiem('chọn 4 → `a = [4]`', E1.arr[0] === 'a = [4]', E1.arr[0]);
  const E2 = dungEditor(['a = [1, 2, 3, 4, 5, 6]']);
  E2.cham(0, '.ptu[data-k="3"]');
  const them = E2.nut('[data-nut="ptu-them"]');
  kiem('đủ 6 ô: nút "thêm ô" bị tắt (disabled), chạm không làm gì', them.disabled === true && (them.click(), E2.arr[0] === 'a = [1, 2, 3, 4, 5, 6]'));
  E2.dongBang();
  const E3 = dungEditor(['for n in [4, 5]:', '    forward(n)']);
  E3.cham(0, '.ptu[data-k="1"]'); E3.nut('[data-so="9"]').click();
  kiem('danh sách đặt thẳng trong for: chạm sửa được `for n in [4, 9]:`', E3.arr[0] === 'for n in [4, 9]:', E3.arr[0]);
  E3.cham(0, '.ptu[data-k="0"]'); E3.nut('[data-nut="ptu-them"]').click(); E3.dongBang();
  kiem('thêm ô ở for n in [..] → `for n in [4, 1, 9]:`', E3.arr[0] === 'for n in [4, 1, 9]:', E3.arr[0]);
  const E4 = dungEditor(['weave([2, 3, 1])'], { kieuDoiSo: (ten) => (ten === 'weave' ? 'list' : 'so') });
  E4.cham(0, '.ptu[data-k="0"]'); E4.nut('[data-so="8"]').click();
  kiem('danh sách làm đối số của hàm: chạm sửa phần tử `weave([8, 3, 1])`', E4.arr[0] === 'weave([8, 3, 1])', E4.arr[0]);
  E4.cham(0, '.ptu[data-k="2"]'); E4.nut('[data-nut="ptu-bo"]').click();
  kiem('bỏ ô trong đối số: `weave([8, 3])`', E4.arr[0] === 'weave([8, 3])', E4.arr[0]);
  // màu
  const E5 = dungEditor(['a = ["red", "blue"]']);
  E5.cham(0, '.ptu[data-k="2"]');
  const b5 = E5.bang();
  kiem('phần tử là màu: bảng có hàng năm nút màu (red green blue yellow none), nút màu đang có sáng', !!b5 && b5.querySelectorAll('[data-mau]').length === 5 && b5.querySelector('[data-mau="blue"]')._cls.has('on'), J(nhanNut(b5)));
  b5.querySelector('[data-mau="yellow"]').click();
  kiem('chọn yellow → `a = ["red", "yellow"]` (có nháy trong code)', E5.arr[0] === 'a = ["red", "yellow"]', E5.arr[0]);
  E5.cham(0, '.ptu[data-k="1"]'); E5.nut('[data-nut="ptu-them"]').click(); E5.dongBang();
  kiem('thêm ô sau ô màu: phần tử mới là màu "red" (cùng kiểu với ô được chạm)', E5.arr[0] === 'a = ["red", "red", "yellow"]', E5.arr[0]);
  const E6 = dungEditor(['a = [1, 2]'], { listChu: () => true });
  E6.cham(0, '.ptu[data-k="1"]');
  kiem('màn có đọc màu (listChu): danh sách số cũng có hàng màu để đổi sang màu', E6.bang().querySelectorAll('[data-mau]').length === 5 && E6.bang().querySelectorAll('[data-so]').length === 9);
  E6.nut('[data-mau="green"]').click();
  kiem('đổi số thành màu: `a = ["green", 2]`', E6.arr[0] === 'a = ["green", 2]', E6.arr[0]);
  kiem('khung chỉ đọc (chiDoc) không mở bảng, không sửa', (() => { const E7 = dungEditor(['a = [1, 2]'], { chiDoc: () => true, khiChiDoc() {} }); E7.hang(0).handlers.click[0]({ target: { closest: () => null }, pointerType: 'mouse' }); return E7.bang() === null && E7.arr[0] === 'a = [1, 2]'; })());
  E1.dongBang(); E2.dongBang(); E3.dongBang(); E4.dongBang(); E5.dongBang(); E6.dongBang();
}

console.log('\n== 5d. Chỗ cần một số: chọn a[0], a[i], len(a), biến vòng for n in a ==');
{
  TP.datCheList(true);
  const tenChip = (b) => b ? b.querySelectorAll('[data-bien]').map((x) => x.getAttribute('data-bien')) : [];
  const E1 = dungEditor(['a = [2, 3, 1]', 'for n in a:', '    forward(3)', 'forward(2)']);
  E1.cham(2, '.num');
  kiem('forward(3) trong for n in a: bảng số có 9 số + chip n (biến vòng), a[0], len(a)', J(tenChip(E1.bang())) === J(['n', 'a[0]', 'len(a)']) && E1.bang().querySelectorAll('[data-so]').length === 9, J(tenChip(E1.bang())));
  E1.nut('[data-bien="n"]').click();
  kiem('chọn n → forward(n)', E1.arr[2] === '    forward(n)', E1.arr[2]);
  E1.cham(3, '.num');
  kiem('forward(2) NGOÀI vòng: không có chip n (biến vòng chỉ dùng trong vòng); có a[0] và len(a)', J(tenChip(E1.bang())) === J(['a[0]', 'len(a)']), J(tenChip(E1.bang())));
  E1.nut('[data-bien="len(a)"]').click();
  kiem('chọn len(a) → forward(len(a)) và ô vẽ lại là chip chạm được (data-bien len(a))', E1.arr[3] === 'forward(len(a))' && /data-bien="len\(a\)"/.test(TP.mauDong(E1.arr[3])), E1.arr[3]);
  E1.cham(3, '.num');
  kiem('chạm lại ô len(a): bảng mở, chip len(a) đang sáng (on)', E1.bang().querySelector('[data-bien="len(a)"]')._cls.has('on'));
  E1.nut('[data-bien="a[0]"]').click();
  kiem('đổi sang a[0] → forward(a[0])', E1.arr[3] === 'forward(a[0])', E1.arr[3]);
  const E2 = dungEditor(['a = [2, 3, 1]', 'for i in range(len(a)):', '    forward(1)']);
  E2.cham(2, '.num');
  kiem('trong for i in range(len(a)): chip a[i] (i là biến vòng range), a[0], len(a)', J(tenChip(E2.bang())) === J(['a[i]', 'a[0]', 'len(a)']), J(tenChip(E2.bang())));
  E2.nut('[data-bien="a[i]"]').click();
  kiem('chọn a[i] → forward(a[i])', E2.arr[2] === '    forward(a[i])', E2.arr[2]);
  E2.cham(1, '.num');
  kiem('range(len(a)) là ô chạm được: bảng số có a[0], len(a) (range không có chip a[i] vì chưa ở trong vòng)', J(tenChip(E2.bang())) === J(['a[0]', 'len(a)']), J(tenChip(E2.bang())));
  E2.nut('[data-so="4"]').click();
  kiem('đổi range(len(a)) thành range(4)', E2.arr[1] === 'for i in range(4):', E2.arr[1]);
  const E3 = dungEditor(['a = [2, 3]', 'b = [1]', 'forward(1)']);
  E3.cham(2, '.num');
  kiem('hai danh sách a, b: chip cho từng danh sách (a[0], len(a), b[0], len(b))', J(tenChip(E3.bang())) === J(['a[0]', 'len(a)', 'b[0]', 'len(b)']), J(tenChip(E3.bang())));
  E3.dongBang();
  const E4 = dungEditor(['forward(1)']);
  E4.cham(0, '.num');
  kiem('chưa có danh sách nào: bảng số như cũ, không chip a[0] / len(a)', J(tenChip(E4.bang())) === '[]' || E4.bang().querySelectorAll('[data-bien]').length === 0);
  E4.dongBang();
  const E5 = dungEditor(['a = ["red", "blue"]', 'for c in a:', '    forward(1)']);
  E5.cham(2, '.num');
  kiem('vòng for c in a: với danh sách CHỮ: biến c không là số nên không có chip c ở chỗ cần số', tenChip(E5.bang()).indexOf('c') < 0, J(tenChip(E5.bang())));
  E5.dongBang();
  const E6 = dungEditor(['for n in [4, 5]:', '    forward(1)']);
  E6.cham(1, '.num');
  kiem('for n in [4, 5]: (đặt thẳng): n là số nên có chip n ở forward', tenChip(E6.bang()).indexOf('n') >= 0, J(tenChip(E6.bang())));
  E6.dongBang();
  const E7 = dungEditor(['forward(1)'], { bienDuoc: () => ['steps'], kieuBien: () => 'list' });
  E7.cham(0, '.num');
  kiem('Xưởng: hàm có đối số danh sách steps: chip len(steps) và steps[0] ở chỗ cần số', J(tenChip(E7.bang())) === J(['steps[0]', 'len(steps)']), J(tenChip(E7.bang())));
  E7.dongBang();
  TP.datCheList(false);
  const E8 = dungEditor(['a = [2, 3]', 'for n in a:', '    forward(3)']);
  E8.cham(2, '.num');
  kiem('TẮT chế độ list: bảng số cũ (không chip a[0] / len(a) / n)', E8.bang().querySelectorAll('[data-bien]').length === 0);
  E8.dongBang();
  TP.datCheList(true);
}

console.log('\n== 5e. Tên danh sách: chọn tên khác, đổi tên theo các dòng dưới, khối kho tự đặt tên ==');
{
  TP.datCheList(true);
  const tenChip = (b) => b ? b.querySelectorAll('[data-bien]').map((x) => x.getAttribute('data-bien')) : [];
  const E1 = dungEditor(['a = [2, 3]', 'for n in a:', '    forward(n)', 'a.append(1)']);
  E1.cham(0, '.lsten');
  kiem('chạm tên ở dòng gán: bảng gợi ý tên (a b c steps route), tên đang dùng sáng', J(tenChip(E1.bang())) === J(['a', 'b', 'c', 'steps', 'route']) && E1.bang().querySelector('[data-bien="a"]')._cls.has('on'), J(tenChip(E1.bang())));
  E1.nut('[data-bien="steps"]').click();
  kiem('đổi tên thành steps: dòng gán, for n in steps:, steps.append(1) đổi theo; forward(n) giữ', E1.arr.join(' | ') === 'steps = [2, 3] | for n in steps: |     forward(n) | steps.append(1)', E1.arr.join(' | '));
  kiem('đổi tên không đụng chuỗi chữ hay tên khác chứa chữ a: `data`, "a" giữ nguyên', (() => { const E = dungEditor(['a = [1]', 'data = 2', 'x = "a"']); E.cham(0, '.lsten'); E.nut('[data-bien="b"]').click(); return E.arr.join('|') === 'b = [1]|data = 2|x = "a"'; })());
  kiem('đổi tên dừng ở dòng gán lại tên cũ: a = [1]; a.append(2); a = [5]; a.append(3) → chỉ đổi cho tới dòng gán lại', (() => { const E = dungEditor(['a = [1]', 'a.append(2)', 'a = [5]', 'a.append(3)']); E.cham(0, '.lsten'); E.nut('[data-bien="c"]').click(); return E.arr.join('|') === 'c = [1]|c.append(2)|a = [5]|a.append(3)'; })());
  const E2 = dungEditor(['a = [2]', 'b = [3]', 'for n in a:']);
  E2.cham(2, '.lsten');
  kiem('chạm tên ở dòng for n in a: → chọn một trong các danh sách ĐÃ CÓ phía trên (a, b)', J(tenChip(E2.bang())) === J(['a', 'b']), J(tenChip(E2.bang())));
  E2.nut('[data-bien="b"]').click();
  kiem('chọn b → for n in b: (chỉ dòng này đổi)', E2.arr[2] === 'for n in b:' && E2.arr[0] === 'a = [2]', E2.arr.join('|'));
  const E3 = dungEditor(['a = [2]', 'a.append(1)']);
  E3.cham(1, '.lsten');
  kiem('chỉ có một danh sách a: chạm tên ở a.append(1) không có gì để chọn (không mở bảng)', E3.bang() === null);
  const E4 = dungEditor([]);
  kiem('khối kho `a = [1, 2]` đầu tiên giữ tên a', (E4.ed.chen('a = [1, 2]'), E4.arr[0] === 'a = [1, 2]'));
  E4.ed.chen('a = [1, 2]');
  kiem('khối `a = [1, 2]` lần hai tự lấy tên chưa dùng: b', E4.arr[1] === 'b = [1, 2]', E4.arr.join('|'));
  E4.ed.chen('a = [1, 2]');
  kiem('lần ba: c', E4.arr[2] === 'c = [1, 2]', E4.arr.join('|'));
  const E5 = dungEditor(['steps = [2, 3]']);
  E5.ed.chen('for n in a:'); E5.ed.chen('a.append(1)');
  kiem('chèn for n in a: / a.append(1) khi `a` chưa có mà có danh sách steps ở trên: tự dùng steps', E5.arr.join('|') === 'steps = [2, 3]|for n in steps:|    steps.append(1)', E5.arr.join('|'));
  const E6 = dungEditor(['a = [2, 3]']);
  E6.ed.chen('for n in a:'); E6.ed.chen('a.append(1)');
  kiem('có sẵn danh sách a thì for / append giữ tên a', E6.arr.join('|') === 'a = [2, 3]|for n in a:|    a.append(1)', E6.arr.join('|'));
  const E7 = dungEditor(['x = 1']);
  kiem('khối list chèn ở chương trình không có danh sách nào vẫn nguyên chữ (for n in a:) — lỗi chạy sẽ nhắc', (E7.ed.chen('for n in a:'), E7.arr[1] === 'for n in a:'));
  const E8 = dungEditor(['a = [2, 3]', 'a.append(1)']);
  E8.cham(1, '.num[data-k="1"]');
  kiem('giá trị đem thêm a.append(1): bảng số 1–9 như số thường (không phải bảng phần tử)', !E8.bang()._cls.has('chon-ptu') && E8.bang().querySelectorAll('[data-so]').length === 9);
  E8.nut('[data-so="6"]').click();
  kiem('chọn 6 → a.append(6)', E8.arr[1] === 'a.append(6)', E8.arr[1]);
  const E9 = dungEditor(['seen = ["red"]', 'seen.append("blue")']);
  E9.cham(1, '.num[data-k="1"]');
  kiem('giá trị đem thêm là màu: bảng chọn màu, không phải số', !!E9.bang() && E9.bang()._cls.has('mau'), E9.bang() && E9.bang().className);
  E9.nut('[data-mau="green"]').click();
  kiem('chọn green → seen.append("green")', E9.arr[1] === 'seen.append("green")', E9.arr[1]);
  TP.dongChonSo();
}

console.log('\n== 5f. Hàm có đối số danh sách: kiểu "list", thẻ biến thả vào dòng ==');
{
  TP.datCheList(true);
  const kieu = TP.taoKieu(() => ({ man: M_LIST, hamCuaMan: [], kho: [H('weave', ['for n in steps:', '    forward(n)'], ['steps']), H('count', ['t = 0', 'for i in range(len(xs)):', '    t += xs[i]'], ['xs']), H('add', ['s.append(1)'], ['s']), H('hit', ['if x in route:', '    move()'], ['x', 'route']), H('forward', ['for i in range(n):', '    move()'], ['n']), H('ten', [], ['seen'])] }));
  kiem('đối số duyệt bằng for n in steps: → "list" (ở màn có list)', kieu('weave', 0) === 'list');
  kiem('đối số dùng len(xs) / xs[i] → "list"; s.append(1) → "list"; x in route → "list" (route), x vẫn số', kieu('count', 0) === 'list' && kieu('add', 0) === 'list' && kieu('hit', 1) === 'list' && kieu('hit', 0) === 'so');
  kiem('đối số n của forward(n) vẫn là "so"; hàm còn trống nhưng tên đối số là seen → "list" (đoán theo tên)', kieu('forward', 0) === 'so' && kieu('ten', 0) === 'list');
  {
    const kieuSon = TP.taoKieu(() => ({ man: M_LIST, hamCuaMan: [], kho: [H('line', ['pen_down()', 'forward(n)', 'pen_up()', 'wait()'], ['n']), H('color_line', ['ink(c)', 'line(n)'], ['c', 'n']),
      H('stripes', ['for c in colors:', '    color_line(c, 3)'], ['colors']), H('forward', ['for i in range(n):', '    move()'], ['n'])] }));
    kiem('máy sơn: đối số đưa vào ink(c) → "mau", kể cả qua hàm khác; danh sách màu vẫn "list"', kieuSon('color_line', 0) === 'mau' && kieuSon('color_line', 1) === 'so' && kieuSon('stripes', 0) === 'list');
    kiem('máy sơn: ink("blue") và color_line("red", 2) vẽ ô màu chạm được (chuoi-mau)', /chuoi-mau mc-blue/.test(TP.mauDong('ink("blue")')) && /chuoi-mau mc-red/.test(TP.mauDong('color_line("red", 2)')));
  }
  TP.datCheList(false);
  kiem('TẮT chế độ list: for n in steps: vẫn là "ghep" như chương chuỗi (không đổi hành vi cũ)', TP.taoKieu(() => ({ man: manList(['for']), hamCuaMan: [], kho: [H('walk', ['for c in path:', '    go(c)'], ['path'])] }))('walk', 0) === 'ghep');
  TP.datCheList(true);
  const E1 = dungEditor(['weave([2, 3, 1])'], { kieuDoiSo: (ten) => (ten === 'weave' ? 'list' : 'so') });
  kiem('datBien (thẻ biến steps kiểu list) thả vào dòng weave([2, 3, 1]) → weave(steps)', (E1.ed.chon(0), E1.ed.datBien('steps', 'list')) === true && E1.arr[0] === 'weave(steps)', E1.arr[0]);
  const E2 = dungEditor(['weave(a)'], { kieuDoiSo: (ten) => (ten === 'weave' ? 'list' : 'so') });
  E2.ed.chon(0);
  kiem('thả thẻ biến steps lên weave(a): thay tên danh sách (a → steps)', E2.ed.datBien('steps', 'list') === true && E2.arr[0] === 'weave(steps)', E2.arr[0]);
  const E3 = dungEditor(['a = [4]', 'weave(a)'], { kieuDoiSo: (ten) => (ten === 'weave' ? 'list' : 'so') });
  E3.cham(1, '.num[data-k="0"]');
  kiem('chạm tên danh sách trong lời gọi hàm: hết chỗ chọn nếu chỉ có a; có hai danh sách thì chọn được', E3.bang() === null);
  const E4 = dungEditor(['a = [4]', 'b = [5]', 'weave(a)'], { kieuDoiSo: (ten) => (ten === 'weave' ? 'list' : 'so') });
  E4.cham(2, '.num[data-k="0"]');
  kiem('hai danh sách: chạm tên mở bảng chọn a / b', J(E4.bang() ? E4.bang().querySelectorAll('[data-bien]').map((x) => x.getAttribute('data-bien')) : null) === J(['a', 'b']));
  E4.nut('[data-bien="b"]').click();
  kiem('chọn b → weave(b)', E4.arr[2] === 'weave(b)', E4.arr[2]);
  const E5 = dungEditor(['weave(5)'], { kieuDoiSo: (ten) => (ten === 'weave' ? 'list' : 'so') });
  kiem('thẻ biến số n thả vào weave([..]) không thay (không hợp kiểu): datBien("n", "so") → false', (E5.ed.chon(0), E5.ed.datBien('n', 'so')) === false);
  TP.dongChonSo();
}

console.log('\n== 5g. Danh sách màu + điều kiện so màu: biến vòng for c in seen: so được với màu ==');
{
  TP.datCheList(true); TP.datCheMau('color', false);
  const E1 = dungEditor(['seen = ["red", "blue"]', 'for c in seen:', '    if color() == "red":'], { camBien: () => [] });
  E1.cham(2, '[data-vt="lhs"]');
  const dk = E1.bang() ? E1.bang().querySelectorAll('button').map((x) => x.getAttribute('data-dk')) : [];
  kiem('vế trái của `if color() == "red":` trong for c in seen: có thêm lựa chọn `c == "red"` (biến vòng của danh sách màu)', dk.indexOf('c == "red"') >= 0 && dk.indexOf('color() == "red"') >= 0, J(dk));
  E1.dongBang();
  const E2 = dungEditor(['a = [1, 2]', 'for n in a:', '    if color() == "red":'], { camBien: () => [] });
  E2.cham(2, '[data-vt="lhs"]');
  kiem('danh sách SỐ: biến vòng n không là màu nên không có lựa chọn `n == "red"`', (E2.bang() ? E2.bang().querySelectorAll('button').map((x) => x.getAttribute('data-dk')) : []).indexOf('n == "red"') < 0);
  E2.dongBang();
  TP.datCheMau(false, false);
  kiem('dòng gán `c = look()` hay `seen.append(look())`: ô look() là chữ thường (không chạm đổi được), tên danh sách chạm được', (() => { const h = TP.mauDong('seen.append(look())'); return /lsten/.test(h) && !/data-k="1"/.test(h) && /look/.test(h); })());
}

console.log('\n== 5h. Sửa chương trình ở dạng chữ vẫn nhất quán ==');
{
  TP.datCheList(true);
  const d0 = ['a = [2, 3, 1]', 'for n in a:', '    forward(n)', 'a.append(1)', 'weave([2, 3, 1])', 'forward(a[0])'];
  kiem('mọi dòng danh sách ghép lại đúng từng chữ khi không sửa gì (tách rồi ghép) — không làm đổi code', d0.every((d) => { const x = TP.tachDoiSo(d); return !x || !x.ghep || x.ghep(x.ds, x.cau) === d; }));
  kiem('thụt lề được giữ khi sửa ô: `    a.append(1)` đổi giá trị thành 4 → `    a.append(4)`', TP.thayDoiSo('    a.append(1)', 1, 4) === '    a.append(4)');
  kiem('luật dấu của đổi chữ có khoảng trắng lạ: `a=[2,3]` (không dấu cách) vẫn tách và sửa được', (() => { const d = TP.tachDoiSo('a=[2,3]'); return !!d && d.loai === 'ganList' && TP.thayDoiSo('a=[2,3]', 2, 9) === 'a=[2, 9]'; })());
  kiem('ô phần tử là tên biến (a = [n, 2]): ô n không chạm đổi bằng bảng số (hiện chữ thường)', (() => { const h = TP.mauDong('a = [n, 2]'); return !/data-so="n"/.test(h) && /class="ar">n</.test(h) && /class="num ptu"/.test(h); })());
  kiem('nhiều dòng danh sách liền nhau vẽ độc lập (mauDong từng dòng)', TP.mauDong('b = [9]') !== TP.mauDong('a = [2, 3, 1]') && /data-bien="b"/.test(TP.mauDong('b = [9]')));
  TP.datCheList(false);
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);

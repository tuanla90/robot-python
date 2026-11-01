/* ============================================================================
   kiem-tuple.mjs — máy kiểm TUPLE, min / max, abs của nhân Python (nhan/san-robot-core.js), đặc tả hoc/KE-HOACH-MUA-CANG-SONG.md mục 2.10 và 3.7.
   Kiểm:
   1. Tuple: literal (a, b) · ("back", 2) · (a,) · phân biệt với nhóm (a) và lời gọi hàm · () là lỗi lời Việt; t[0] t[1] (lỗi chỉ số nói "tuple");
      len(t); == != (tuple == danh sách là False); < <= > >= so từng phần tử như Python (kiểu lệch là lỗi); gỡ cặp h, s = flow() và a, b = b, a
      (số tên lệch số phần tử là lỗi nói rõ hai con số); return a, b; print / str ra ('back', 2) và (1,); hàm game trả mảng JS thành tuple;
      hàm game không nhận tuple; gán vào t[0] là lỗi "Game chưa dạy"; + hai tuple, tuple lồng, - tuple là lỗi lời Việt; x in t; for x in t.
   2. min / max: 2+ số, 2+ chuỗi, 2+ tuple (so từng phần tử), một danh sách / tuple làm đối số duy nhất; 1 số, 0 đối số, kiểu lệch, danh sách rỗng là lỗi.
   3. abs: số dương / âm / 0; chuỗi, tuple, 2 đối số là lỗi.
   4. Không đổi hành vi cũ: (2 + 3) * 4 là nhóm; f(a, b) hai đối số; danh sách vẫn như cũ.
   Chạy: node nhan/kiem-tuple.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const R = require(path.join(day, 'san-robot-core.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);

/** Chạy mã, thu mọi thứ print() in ra. flow() giả trả mảng JS ["back", 2] (như hàm game thật sẽ trả). */
function chay(code, apiThem) {
  const ra = [];
  const api = Object.assign({
    print: (...a) => { ra.push(a.map((x) => typeof x === 'number' ? String(Math.round(x * 1e6) / 1e6) : String(x)).join(' ')); return 0; },
    flow: () => ['back', 2],
    move: (n) => n
  }, apiThem || {});
  try { R.chayCode(code, api); return { ra, loi: null }; }
  catch (e) { if (e && e.cuaGame) return { ra, loi: { loai: e.loai, dong: e.dong, td: e.thongDiep } }; throw e; }
}
const ra = (code, api) => J(chay(code, api).ra);
const loi = (code, api) => chay(code, api).loi;
/** Lỗi đúng loại, đúng dòng, lời khớp mẫu. */
function loiLa(code, mau, loai, dong) {
  const l = loi(code);
  const ok = !!l && mau.test(l.td) && (!loai || l.loai === loai) && (!dong || l.dong === dong);
  if (!ok) console.log('       (thực tế: ' + J(l) + ')');
  return ok;
}

console.log('\n== 1a. Tuple: literal, in, t[i], len ==');
{
  kiem('("back", 2) in ra như Python', ra('t = ("back", 2)\nprint(t)') === J(["('back', 2)"]));
  kiem('str(t) cũng vậy, nối được vào chuỗi', ra('t = (1, "a")\nprint("t=" + str(t))') === J(["t=(1, 'a')"]));
  kiem('tuple một phần tử (a,) in ra (5,)', ra('a = 5\nt = (a,)\nprint(t)\nprint(len(t))') === J(['(5,)', '1']));
  kiem('ba phần tử, phần tử là biểu thức', ra('print((1 + 1, 2 * 3, "x"))') === J(["(2, 6, 'x')"]));
  kiem('t[0], t[1], chỉ số là biến', ra('t = ("back", 2)\nprint(t[0])\ni = 1\nprint(t[i])') === J(['back', '2']));
  kiem('len(t) = 2', ra('t = ("back", 2)\nprint(len(t))') === J(['2']));
  kiem('t[2] ngoài tầm: lỗi nói "tuple t có 2 phần tử"', loiLa('t = (1, 2)\nx = t[2]', /tuple t có 2 phần tử/, 'runtime-error', 2));
  kiem('t[-1] âm: lỗi lời Việt nói tuple', loiLa('t = (1, 2)\nx = t[-1]', /số âm.*tuple/, 'runtime-error', 2));
  kiem('x[0] với x là số: lỗi cũ (lời giữ nguyên để máy kiểm list không đổi)', loiLa('x = 3\ny = x[0]', /từ một danh sách, mà "x" là một số/, 'runtime-error', 2));
  kiem('() rỗng là lỗi lời Việt "Game chưa dạy tuple rỗng"', loiLa('t = ()', /Game chưa dạy tuple rỗng/, 'syntax-error', 1));
}

console.log('\n== 1b. Phân biệt nhóm (a), gọi hàm f(a, b), tuple (a, b) ==');
{
  kiem('(2 + 3) * 4 vẫn là nhóm = 20', ra('print((2 + 3) * 4)') === J(['20']));
  kiem('(a) là chính a, không phải tuple', ra('a = 7\nb = (a)\nprint(b + 1)') === J(['8']));
  kiem('f(a, b) là hai đối số của hàm người chơi', ra('def f(x, y):\n    return x - y\nprint(f(5, 2))') === J(['3']));
  kiem('print(1, 2) in hai giá trị cách nhau (không phải tuple)', ra('print(1, 2)') === J(['1 2']));
  kiem('print((1, 2)) in một tuple', ra('print((1, 2))') === J(['(1, 2)']));
  kiem('move(3) vẫn nhận số như cũ', ra('x = move(3)\nprint(x)') === J(['3']));
  kiem('tuple lồng trong ngoặc nhóm: ((1, 2)) là tuple', ra('print(((1, 2)))') === J(['(1, 2)']));
}

console.log('\n== 1c. So sánh ==');
{
  kiem('== so từng phần tử', ra('print((1, 2) == (1, 2))\nprint((1, 2) == (1, 3))\nprint(("a", 1) == ("a", 1))') === J(['1', '0', '1']));
  kiem('!= ngược lại; độ dài khác thì khác', ra('print((1, 2) != (1, 2, 3))\nprint((1, 2) != (1, 2))') === J(['1', '0']));
  kiem('tuple == danh sách là False như Python', ra('print((1, 2) == [1, 2])\nprint((1, 2) != [1, 2])') === J(['0', '1']));
  kiem('tuple == số / chuỗi là False', ra('print((1, 2) == 3)\nprint((1,) == 1)\nprint(("a",) == "a")') === J(['0', '0', '0']));
  kiem('< so từng phần tử: (1, 9) < (2, 0); (1, 2) < (1, 3); (1, 2) < (1, 2, 0)', ra('print((1, 9) < (2, 0))\nprint((1, 2) < (1, 3))\nprint((1, 2) < (1, 2, 0))') === J(['1', '1', '1']));
  kiem('> <= >= đúng Python', ra('print((2, 0) > (1, 9))\nprint((1, 2) <= (1, 2))\nprint((1, 2) >= (1, 3))') === J(['1', '1', '0']));
  kiem('chuỗi trong tuple so theo bảng chữ: ("back", 1) < ("front", 0)', ra('print(("back", 1) < ("front", 0))') === J(['1']));
  kiem('tuple < số là lỗi lời Việt', loiLa('x = (1, 2) < 3', /Không so sánh "<".*tuple với số/, 'runtime-error', 1));
  kiem('phần tử lệch kiểu ("a", 1) < (1, 1) là lỗi', loiLa('x = ("a", 1) < (1, 1)', /chuỗi với số|số với chuỗi/, 'runtime-error', 1));
  kiem('danh sách < danh sách vẫn là lỗi cũ (lời nói danh sách)', loiLa('x = [1] < [2]', /Danh sách chỉ so sánh bằng ==/, 'runtime-error', 1));
  kiem('chuỗi < số vẫn là lỗi cũ (TypeError)', loiLa('x = "a" < 1', /TypeError/, 'runtime-error', 1));
  kiem('if t == ("back", 2): dùng được', ra('t = flow()\nif t == ("back", 2):\n    print("ok")') === J(['ok']));
}

console.log('\n== 1d. Gỡ cặp, return a, b, hàm game ==');
{
  kiem('h, s = flow(): hàm game trả mảng JS thành tuple, gỡ ra hai biến', ra('h, s = flow()\nprint(h)\nprint(s)') === J(['back', '2']));
  kiem('t = flow() rồi in: (\'back\', 2)', ra('t = flow()\nprint(t)\nprint(t[1] * 2)') === J(["('back', 2)", '4']));
  kiem('a, b = b, a đổi chỗ', ra('a = 1\nb = 2\na, b = b, a\nprint(a)\nprint(b)') === J(['2', '1']));
  kiem('x, y, z = 1, 2, 3 ba tên', ra('x, y, z = 1, 2, 3\nprint(x + y + z)') === J(['6']));
  kiem('vế phải không ngoặc t = 1, 2 là tuple', ra('t = 1, 2\nprint(t)') === J(['(1, 2)']));
  kiem('return "back", 2 từ hàm người chơi là tuple', ra('def f():\n    return "back", 2\nh, s = f()\nprint(h + str(s))') === J(['back2']));
  kiem('gỡ cặp từ danh sách 2 phần tử cũng được (như Python)', ra('a, b = [3, 4]\nprint(a * b)') === J(['12']));
  kiem('h, s = (1, 2, 3): lỗi nói rõ cần 2 mà có 3', loiLa('h, s = (1, 2, 3)', /Cần 2 giá trị.*h, s.*có 3 phần tử/, 'runtime-error', 1));
  kiem('h, s = 5: lỗi nói vế phải chỉ là một số', loiLa('h, s = 5', /Cần 2 giá trị.*chỉ là một số/, 'runtime-error', 1));
  kiem('h, s += 1 là lỗi cú pháp lời Việt', loiLa('h, s += 1', /chỉ dùng được với dấu = thường/, 'syntax-error', 1));
  kiem('gỡ cặp trong hàm là biến cục bộ (không rò ra ngoài)', loiLa('def f():\n    h, s = flow()\nf()\nprint(h)', /Chưa có biến tên "h"/, 'runtime-error', 4));
  kiem('move((1, 2)): hàm game không nhận tuple', loiLa('move((1, 2))', /không nhận cả tuple/, 'runtime-error', 1));
  kiem('move(t[1]) thì được', ra('t = flow()\nprint(move(t[1]))') === J(['2']));
}

console.log('\n== 1e. Những thứ "Game chưa dạy" / lỗi kiểu ==');
{
  kiem('t[0] = 5 là lỗi cú pháp "Game chưa dạy gán vào một ô"', loiLa('t = (1, 2)\nt[0] = 5', /Game chưa dạy gán vào một ô.*tuple/, 'syntax-error', 2));
  kiem('(1, 2) + (3, 4): "Game chưa dạy cộng hai tuple"', loiLa('x = (1, 2) + (3, 4)', /Game chưa dạy cộng hai tuple/, 'runtime-error', 1));
  kiem('(1, 2) * 2 là lỗi', loiLa('x = (1, 2) * 2', /Không dùng phép "\*"/, 'runtime-error', 1));
  kiem('tuple + số là lỗi', loiLa('x = (1, 2) + 1', /Không dùng phép "\+" giữa tuple và số/, 'runtime-error', 1));
  kiem('-t là lỗi', loiLa('t = (1, 2)\nx = -t', /không đặt trước tuple/, 'runtime-error', 2));
  kiem('tuple lồng tuple là lỗi', loiLa('t = ((1, 2), 3)', /Game chưa dạy tuple lồng/, 'runtime-error', 1));
  kiem('tuple trong danh sách là lỗi', loiLa('a = [(1, 2)]', /Game chưa dạy tuple lồng/, 'runtime-error', 1));
  kiem('a.append((1, 2)) là lỗi', loiLa('a = []\na.append((1, 2))', /Game chưa dạy tuple lồng/, 'runtime-error', 2));
  kiem('int(t) là lỗi nói tuple', loiLa('x = int((1, 2))', /int\(\) không đổi được tuple/, 'runtime-error', 1));
  kiem('t.append(1) là lỗi nói .append() chỉ cho danh sách', loiLa('t = (1, 2)\nt.append(3)', /\.append\(\) chỉ dùng được với danh sách.*tuple/, 'runtime-error', 2));
  kiem('t[0:1] vẫn là lỗi "chưa dạy cắt"', loiLa('t = (1, 2)\nx = t[0:1]', /chưa dạy cắt/, 'syntax-error', 2));
}

console.log('\n== 1f. x in t, for x in t, if t: ==');
{
  kiem('"back" in t', ra('t = flow()\nprint("back" in t)\nprint(3 in t)\nprint(2 not in t)') === J(['1', '0', '0']));
  kiem('for x in t: duyệt từng phần tử', ra('for x in (3, 1, 2):\n    print(x)') === J(['3', '1', '2']));
  kiem('if t: tuple có phần tử là đúng', ra('t = (0,)\nif t:\n    print("co")') === J(['co']));
}

console.log('\n== 2. min / max ==');
{
  kiem('min(3, 1, 2) = 1 · max(3, 1, 2) = 3', ra('print(min(3, 1, 2))\nprint(max(3, 1, 2))') === J(['1', '3']));
  kiem('hai đối số, có số âm và thập phân', ra('print(min(-2, 5))\nprint(max(1.5, 1.25))') === J(['-2', '1.5']));
  kiem('chuỗi: min("b", "a") = a', ra('print(min("b", "a"))\nprint(max("b", "a", "c"))') === J(['a', 'c']));
  kiem('tuple so từng phần tử: max(("left", 1), ("right", 2)) = ("right", 2) (so chữ trước)', ra('print(max(("left", 1), ("right", 2)))') === J(["('right', 2)"]));
  kiem('min của hai tuple (2, "a") và (1, "z") là (1, \'z\')', ra('print(min((2, "a"), (1, "z")))') === J(["(1, 'z')"]));
  kiem('bài gói 7: so sức dòng của hai nhánh bằng max(s1, s2)', ra('s1 = flow()[1]\ns2 = 1\nprint(max(s1, s2))') === J(['2']));
  kiem('một danh sách làm đối số duy nhất (mùa 6)', ra('a = [4, 9, 2]\nprint(min(a))\nprint(max(a))') === J(['2', '9']));
  kiem('một tuple làm đối số duy nhất', ra('print(max((4, 9, 2)))') === J(['9']));
  kiem('min(5) một số là lỗi', loiLa('x = min(5)', /min\(\) cần ít nhất 2 giá trị/, 'runtime-error', 1));
  kiem('max() không đối số là lỗi', loiLa('x = max()', /max\(\) cần ít nhất 2 giá trị/, 'runtime-error', 1));
  kiem('min([]) rỗng là lỗi', loiLa('x = min([])', /rỗng/, 'runtime-error', 1));
  kiem('min(1, "a") lệch kiểu là lỗi TypeError', loiLa('x = min(1, "a")', /TypeError/, 'runtime-error', 1));
  kiem('max(1, (1, 2)) lệch kiểu là lỗi', loiLa('x = max(1, (1, 2))', /Không so sánh/, 'runtime-error', 1));
  kiem('max([1], [2]) hai danh sách là lỗi', loiLa('x = max([1], [2])', /không so được với một danh sách/, 'runtime-error', 1));
  kiem('min / max trả về đúng giá trị dùng tiếp được', ra('x = min(7, 3) + max(1, 2)\nprint(x)') === J(['5']));
  kiem('hàm game cùng tên đè hàm dựng sẵn (như len)', ra('print(min(1, 2))', { min: () => 99 }) === J(['99']));
}

console.log('\n== 3. abs ==');
{
  kiem('abs(-3) = 3 · abs(3) = 3 · abs(0) = 0', ra('print(abs(-3))\nprint(abs(3))\nprint(abs(0))') === J(['3', '3', '0']));
  kiem('abs(dich - x) với biến', ra('dich = 2\nx = 7\nprint(abs(dich - x))') === J(['5']));
  kiem('abs("a") là lỗi nói chuỗi', loiLa('x = abs("a")', /abs\(\) chỉ bỏ dấu được của một số.*chuỗi/, 'runtime-error', 1));
  kiem('abs((1, 2)) là lỗi nói tuple', loiLa('x = abs((1, 2))', /tuple/, 'runtime-error', 1));
  kiem('abs(1, 2) là lỗi số đối số', loiLa('x = abs(1, 2)', /abs\(\) cần đúng 1 đối số, đang có 2/, 'runtime-error', 1));
}

console.log('\n== 4. Hành vi cũ không đổi ==');
{
  kiem('danh sách: literal, append, len, == vẫn như cũ', ra('a = [1]\na.append(2)\nprint(a)\nprint(len(a))\nprint(a == [1, 2])') === J(['[1, 2]', '2', '1']));
  kiem('a[0] = x với danh sách vẫn là lỗi có chữ "gán vào một ô" và gợi ý append', loiLa('a = [1]\na[0] = 5', /gán vào một ô.*append/, 'syntax-error', 2));
  kiem('a += b nối danh sách', ra('a = [1]\nb = [2]\na += b\nprint(a)') === J(['[1, 2]']));
  kiem('x = a + b với số, chuỗi vẫn như cũ', ra('print(1 + 2)\nprint("a" + "b")') === J(['3', 'ab']));
  kiem('return không giá trị vẫn là 0', ra('def f():\n    return\nprint(f())') === J(['0']));
  kiem('while với so sánh số vẫn chạy', ra('i = 0\nwhile i < 3:\n    i += 1\nprint(i)') === J(['3']));
  kiem('R.taoTuple / R.laTuple / R.dangChu có trong API cho lõi sân dùng', R.laTuple(R.taoTuple(['back', 2])) && R.dangChu(R.taoTuple(['back', 2])) === "('back', 2)");
}

console.log('\n---------------------------------------------');
console.log(`ĐẠT ${dat} · HỎNG ${hong}`);
process.exit(hong ? 1 : 0);

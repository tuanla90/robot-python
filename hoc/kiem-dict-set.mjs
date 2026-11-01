/* ============================================================================
   kiem-dict-set.mjs — máy kiểm TỪ ĐIỂN (dict) và TẬP HỢP (set) trong nhân san-robot-core.js
   cho mùa 8 Hang động đá vôi (gói 4 set, gói 7 dict):
     - dict: literal {}, {1: "U", 2: "R"} · dict() · đọc d[k] (KeyError lời Việt khi thiếu) ·
       gán d[k] = v / d[k] += 1 · k in d / k not in d · len(d) · for k in d: (theo thứ tự thêm) ·
       == != · if d: · str(d) / print(d) · khóa số / chuỗi / tuple · cấm khóa list/dict/set.
     - set: literal {1, 2, 3} · set() / set([1, 2, 2]) · s.add(x) · x in s / x not in s ·
       len(s) · for x in s: · == != · if s: · str(s) / print(s) · cấm lấy chỉ số s[0] ·
       phần tử số / chuỗi / tuple · cấm phần tử list/dict/set.
     - giữ nguyên lỗi cú pháp a[0] = x với danh sách và tuple.
   Chạy: node hoc/kiem-dict-set.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const Core = require(path.join(day, '..', 'nhan', 'san-robot-core.js'));
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);

function chay(code, extraApi) {
  const ra = [], buoc = [];
  const api = Object.assign({
    print: (...a) => { ra.push(a.map(String).join(' ')); return 0; },
    step: (x) => { buoc.push(x); return 0; }
  }, extraApi || {});
  try {
    Core.chayCode(code, api);
    return { ok: true, ra, buoc };
  } catch (e) {
    return { ok: false, loi: e, ra, buoc };
  }
}

/* ============================================================ 1. DICT CƠ BẢN */
console.log('\n== 1. Từ điển (dict): literal, đọc/ghi, in, len, for, ==, str ==');
{
  const k1 = chay('d = {}\nprint(len(d), str(d))\nif d:\n    print("co")\nelse:\n    print("rong")');
  kiem('dict rỗng {} · len = 0 · str = "{}" · if d là sai',
    k1.ok && J(k1.ra) === J(['0 {}', 'rong']), J(k1));

  const k1b = chay('d = dict()\nprint(len(d), str(d))');
  kiem('dict() tạo từ điển rỗng',
    k1b.ok && J(k1b.ra) === J(['0 {}']), J(k1b));

  const k2 = chay('d = {1: "up", 2: "right", 3: "down"}\nprint(len(d), d[1], d[3])\nprint(2 in d, 5 in d, 5 not in d)');
  kiem('dict literal {1: "up", ...} · đọc d[k] · k in d / not in d',
    k2.ok && J(k2.ra) === J(['3 up down', '1 0 1']), J(k2));

  const k3 = chay('d = {"a": 10}\nd["b"] = 20\nd["a"] = 15\nd["b"] += 5\nprint(d["a"], d["b"], len(d), d)');
  kiem('gán mới d["b"] = 20, ghi đè d["a"] = 15, cộng dồn d["b"] += 5, giữ thứ tự khóa',
    k3.ok && J(k3.ra) === J(["15 25 2 {'a': 15, 'b': 25}"]), J(k3));

  const k4 = chay('d = {3: "ba", 1: "mot", 2: "hai"}\nfor k in d:\n    step(k)\n    print(k, d[k])');
  kiem('for k in d: duyệt khóa theo đúng thứ tự thêm vào',
    k4.ok && J(k4.buoc) === J([3, 1, 2]) && J(k4.ra) === J(['3 ba', '1 mot', '2 hai']), J(k4));

  const k5 = chay('a = {1: "x", 2: "y"}\nb = {2: "y", 1: "x"}\nc = {1: "x", 2: "z"}\nprint(a == b, a != b, a == c, a == [1, 2])');
  kiem('so sánh == và != giữa hai dict (không phụ thuộc thứ tự khóa)',
    k5.ok && J(k5.ra) === J(['1 0 0 0']), J(k5));

  const k6 = chay('d = {}\nd[(2, 3)] = "hang"\nd[(0, 0)] = "cua"\nprint((2, 3) in d, d[(2, 3)], len(d))');
  kiem('khóa dict là tuple tọa độ (x, y)',
    k6.ok && J(k6.ra) === J(['1 hang 2']), J(k6));

  const k7 = chay('def ghi(b, k, v):\n    b[k] = v\nm = {}\nghi(m, 4, "dong")\nprint(m[4])');
  kiem('truyền dict vào hàm theo tham chiếu: hàm sửa d[k] thì bên ngoài đổi theo',
    k7.ok && J(k7.ra) === J(['dong']), J(k7));
}

/* ============================================================ 2. SET CƠ BẢN */
console.log('\n== 2. Tập hợp (set): literal, set(), .add(), in, len, for, ==, str ==');
{
  const s1 = chay('s = set()\nprint(len(s), str(s))\nif s:\n    print("co")\nelse:\n    print("rong")');
  kiem('set() tạo tập rỗng · len = 0 · str = "set()" · if s là sai',
    s1.ok && J(s1.ra) === J(['0 set()', 'rong']), J(s1));

  const s2 = chay('s = {1, 2, 2, 3, 1}\nprint(len(s), 2 in s, 9 in s, 9 not in s, s)');
  kiem('set literal {1, 2, 2, 3, 1} tự loại phần tử trùng · in / not in',
    s2.ok && J(s2.ra) === J(['3 1 0 1 {1, 2, 3}']), J(s2));

  const s3 = chay('s = set([4, 2, 4, 1])\ns.add(2)\ns.add(5)\nfor x in s:\n    step(x)\nprint(len(s))');
  kiem('set([4, 2, 4, 1]) và s.add(x): không thêm trùng, duyệt theo thứ tự thêm lần đầu',
    s3.ok && J(s3.buoc) === J([4, 2, 1, 5]) && J(s3.ra) === J(['4']), J(s3));

  const s4 = chay('da_qua = set()\nda_qua.add((0, 0))\nda_qua.add((1, 0))\nda_qua.add((0, 0))\nprint(len(da_qua), (1, 0) in da_qua, (2, 0) in da_qua)');
  kiem('set chứa tuple tọa độ (x, y) để đánh dấu ô đã thăm trong hang',
    s4.ok && J(s4.ra) === J(['2 1 0']), J(s4));

  const s5 = chay('a = {1, 2, 3}\nb = {3, 1, 2}\nc = {1, 2}\nprint(a == b, a != b, a == c, a == [1, 2, 3])');
  kiem('so sánh == và != giữa hai set (không phụ thuộc thứ tự)',
    s5.ok && J(s5.ra) === J(['1 0 0 0']), J(s5));
}

/* ============================================================ 3. LỖI TIẾNG VIỆT RÕ RÀNG */
console.log('\n== 3. Báo lỗi tiếng Việt cho dict / set và bảo toàn luật list ==');
{
  const e1 = chay('d = {1: "a"}\nx = d[9]');
  kiem('đọc khóa không có trong dict → lỗi chạy nói rõ khóa và gợi ý in',
    !e1.ok && e1.loi.loai === 'runtime-error' && /Khóa 9 không có trong từ điển/.test(e1.loi.thongDiep), J(e1.loi));

  const e2 = chay('s = {10, 20}\nx = s[0]');
  kiem('lấy chỉ số s[0] trên set → lỗi chạy giải thích set không có thứ tự',
    !e2.ok && e2.loi.loai === 'runtime-error' && /Tập hợp \(set\) không có thứ tự/.test(e2.loi.thongDiep), J(e2.loi));

  const e3 = chay('d = {}\nd[[1, 2]] = 3');
  kiem('dùng danh sách làm khóa dict → lỗi chạy tiếng Việt',
    !e3.ok && e3.loi.loai === 'runtime-error' && /Khóa của từ điển/.test(e3.loi.thongDiep), J(e3.loi));

  const e4 = chay('s = set()\ns.add([1, 2])');
  kiem('thêm danh sách vào set → lỗi chạy tiếng Việt',
    !e4.ok && e4.loi.loai === 'runtime-error' && /Phần tử của tập hợp/.test(e4.loi.thongDiep), J(e4.loi));

  const e5 = chay('a = [1, 2]\na[0] = 9');
  kiem('gán a[0] = 9 trên danh sách vẫn là lỗi cú pháp như cũ',
    !e5.ok && e5.loi.loai === 'syntax-error' && /gán vào một ô của danh sách/.test(e5.loi.thongDiep), J(e5.loi));

  const e6 = chay('d = {}\na = [1, 2]\na[0] = 9');
  kiem('có dict trong bài nhưng gán a[0] = 9 vào biến danh sách vẫn báo lỗi cú pháp',
    !e6.ok && e6.loi.loai === 'syntax-error' && /gán vào một ô của danh sách/.test(e6.loi.thongDiep), J(e6.loi));

  const e7 = chay('s = {1: "a", 2}');
  kiem('trộn dict và set trong cùng cặp ngoặc nhọn → lỗi cú pháp',
    !e7.ok && e7.loi.loai === 'syntax-error', J(e7.loi));

  // Kiểm với ChamHoc: dict() và set() được phép dùng trong bài làm mà không cần khai trong man.hamGoc
  const manThu = {
    id: 'thu-dict-set', ten: 'Thử dict set',
    san: ['..F'], batDau: { x: 0, y: 0, huong: 1 },
    loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait'],
    khung: { chinh: 10, moiHam: 10 }
  };
  const kqCham = ChamHoc.cham(manThu, {
    chinh: [
      's = set()',
      's.add(1)',
      'd = dict()',
      'd[1] = 2',
      'for i in range(d[1]):',
      '    left_move()',
      '    right_move()',
      '    wait()'
    ],
    hamCuaMan: []
  }, []);
  kiem('ChamHoc.cham cho phép gọi set() và dict() như hàm nội bộ chuẩn',
    kqCham.thang === true && kqCham.soNhip === 2, J(kqCham.chanDoan));
}

console.log('\n========================================');
console.log('Tổng kết kiem-dict-set: ' + dat + ' đạt, ' + hong + ' hỏng.');
if (hong > 0) process.exit(1);

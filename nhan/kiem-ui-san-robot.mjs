/* ============================================================================
   kiem-ui-san-robot.mjs — test UI của mockup đợt 1 bằng DOM giả.

   Chạy:  node nhan/kiem-ui-san-robot.mjs

   Việc nó kiểm:
     1. Mọi id mà san-robot-dot-1.js gọi ($('...')) đều CÓ trong file HTML.
     2. Ghép chương trình bằng cách bấm thẻ trên khay → chạy → hạng A.
     3. Đổi sang bản gõ tay, gõ Python có vòng lặp → chạy → hạng A.
     4. Gõ code sai → hiện đúng mã chẩn đoán.
     5. Chuyển bài thì sân và mục tiêu đổi theo.
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const R = require(path.join(day, 'san-robot-core.js'));

const srcHtml = fs.readFileSync(path.join(day, 'san-robot-dot-1.html'), 'utf8');
const srcUi = fs.readFileSync(path.join(day, 'san-robot-dot-1.js'), 'utf8');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet ? ' → ' + chiTiet : '')); }
}

/* --------------------------------------------------------------- DOM giả */

function El(tag) {
  this.tagName = tag; this.children = []; this.parentNode = null;
  this._text = ''; this._html = '';
  this.className = ''; this.value = ''; this.disabled = false;
  this.style = { setProperty() { } };
  this.dataset = {};
  this.classList = { add() { }, remove() { } };
}
El.prototype.appendChild = function (c) { c.parentNode = this; this.children.push(c); return c; };
El.prototype.insertBefore = function (c, ref) {
  c.parentNode = this;
  const i = ref ? this.children.indexOf(ref) : -1;
  if (i < 0) this.children.push(c); else this.children.splice(i, 0, c);
  return c;
};
El.prototype.remove = function () {
  if (!this.parentNode) return;
  const i = this.parentNode.children.indexOf(this);
  if (i >= 0) this.parentNode.children.splice(i, 1);
  this.parentNode = null;
};
Object.defineProperty(El.prototype, 'textContent', {
  get() { return this._text; },
  set(v) { this._text = String(v); this.children = []; }
});
Object.defineProperty(El.prototype, 'innerHTML', {
  get() { return this._html; },
  set(v) { this._html = String(v); if (String(v) === '') this.children = []; }
});
Object.defineProperty(El.prototype, 'nextSibling', {
  get() {
    if (!this.parentNode) return null;
    const i = this.parentNode.children.indexOf(this);
    return this.parentNode.children[i + 1] || null;
  }
});

const ids = new Set();
for (const m of srcHtml.matchAll(/id="([^"]+)"/g)) ids.add(m[1]);

const kho = new Map();
for (const id of ids) { const e = new El('div'); e.id = id; kho.set(id, e); }

const documentGia = {
  getElementById(id) { return kho.get(id) || null; },
  createElement(tag) { return new El(tag); },
  createTextNode(t) { const e = new El('#text'); e.textContent = t; return e; },
  addEventListener() { }
};

globalThis.window = { RobotCore: R };
globalThis.document = documentGia;
globalThis.localStorage = undefined;

/* --------------------------------------------- 1. id phải có trong HTML */

console.log('\n== 1. Id mà UI gọi phải có trong HTML ==');
const idDung = new Set();
for (const m of srcUi.matchAll(/\$\('([^']+)'\)/g)) idDung.add(m[1]);
// id do chính UI tạo ra lúc chạy (không nằm trong HTML tĩnh)
const idUiTuTao = new Set();
for (const m of srcUi.matchAll(/\.id\s*=\s*'([^']+)'/g)) idUiTuTao.add(m[1]);
const thieu = [...idDung].filter((i) => !ids.has(i) && !idUiTuTao.has(i));
kiem(`UI gọi ${idDung.size} id, tất cả đều có trong HTML (hoặc do UI tự tạo)`, thieu.length === 0, thieu.join(', '));

/* --------------------------------------------------------- chạy UI lên */

let loiKhoiDong = null;
try { new Function(srcUi)(); } catch (e) { loiKhoiDong = e; }
kiem('UI khởi động không lỗi', !loiKhoiDong, loiKhoiDong && loiKhoiDong.message);

const $ = (id) => kho.get(id);

// DOM giả không chạy setTimeout đồng bộ được → để "tức thì"
if ($('toc-do')) $('toc-do').value = '0';

function bamThe(vi) {
  const khay = $('khay');
  khay.children[vi].onclick();
}

console.log('\n== 2. Ghép chương trình bằng thẻ rồi chạy ==');
{
  const b = R.BAI[0];
  kiem('bài 1 có đúng 5 thẻ trên khay (khay theo bài)', $('khay').children.length === 5, String($('khay').children.length));
  for (let i = 0; i < 4; i++) bamThe(0);              // thẻ move()
  kiem('bấm thẻ 4 lần → chương trình có 4 dòng', $('chuong-trinh').children.length === 4,
    'có ' + $('chuong-trinh').children.length);
  kiem('ô nhớ đếm đúng 4', $('o-nho').textContent === '4', $('o-nho').textContent);

  $('nut-chay').onclick();
  kiem('thẻ move() × 4 đạt hạng A', /on A/.test($('h-A').className), 'class=' + $('h-A').className);
  kiem('có bảng kết quả sân ẩn', /sân ẩn 2/.test($('ds-san-an').innerHTML));
  kiem('lưu hạng vào chip bài', /· A$/.test($('chips').children[0].textContent),
    $('chips').children[0].textContent);
}

console.log('\n== 3. Nút "chép sang bản gõ tay" ==');
{
  $('nut-chep').onclick();
  kiem('đổi sang tab gõ tay', $('khu-the').className === 'an' && $('khu-go').className === '');
  kiem('code sinh ra đúng 4 dòng move(1)', $('o-code').value === 'move(1)\nmove(1)\nmove(1)\nmove(1)',
    JSON.stringify($('o-code').value));
}

console.log('\n== 4. Gõ Python có vòng lặp ==');
{
  $('o-code').value = 'for i in range(4):\n    move()';
  $('nut-chay').onclick();
  kiem('vòng lặp for đạt hạng A', /on A/.test($('h-A').className), 'class=' + $('h-A').className);
}

console.log('\n== 5. Code sai phải hiện chẩn đoán ==');
{
  $('o-code').value = 'move(4';
  $('nut-chay').onclick();
  kiem('thiếu ")" → hiện syntax-error', /syntax-error/.test($('chan-doan').innerHTML), $('chan-doan').innerHTML.slice(0, 80));
  kiem('không còn hạng A', !/on A/.test($('h-A').className));
}
{
  $('o-code').value = 'move(2)';
  $('nut-chay').onclick();
  kiem('chạy thiếu bước → hiện unfinished', /unfinished/.test($('chan-doan').innerHTML));
}

console.log('\n== 6. Chuyển bài ==');
{
  $('chips').children[2].onclick();                    // bài 3
  kiem('tiêu đề đổi sang bài 3', /Bài 3/.test($('ten-bai').textContent), $('ten-bai').textContent);
  kiem('mục tiêu đổi theo', /Mục tiêu:/.test($('muc-tieu').textContent));
  kiem('sân bài 3 vẽ ra 49 ô (7×7)', ($('san').innerHTML.match(/class="o/g) || []).length === 49,
    'có ' + ($('san').innerHTML.match(/class="o/g) || []).length + ' ô');
  kiem('chương trình bài 3 trống (mỗi bài một chương trình riêng)', $('chuong-trinh').children.length === 0);

  $('nut-goi-y').onclick();
  kiem('nút "Hỏi Khánh" hiện gợi ý', /Khánh:/.test($('goi-y').innerHTML + ($('goi-y').children[0] ? $('goi-y').children[0].textContent : '')),
    JSON.stringify($('goi-y').children.map((c) => c.textContent)));
}

console.log('\n== 7. Chạy bài 5 bằng lời giải mẫu (đường vòng qua vật cản) ==');
{
  $('chips').children[4].onclick();                    // bài 5
  $('tab-go').onclick();
  $('o-code').value = R.BAI[4].loiGiai;
  $('nut-chay').onclick();
  kiem('lời giải mẫu bài 5 đạt hạng A', /on A/.test($('h-A').className), 'class=' + $('h-A').className);
  kiem('bảng trạng thái hiện số tick cuối', /tick/.test($('trang-thai').innerHTML));
}

console.log('\n== 8. Bài 6 (chặng 2) — thẻ lồng được: ghép while + move BẰNG THẺ ==');
{
  kiem('khi ở bài khác thì bảng "thẻ mới" ẩn', $('the-moi').className === 'an', $('the-moi').className);

  $('chips').children[5].onclick();                    // bài 6
  $('tab-the').onclick();                              // về bàn lệnh (bài trước để lại ở tab gõ tay)
  kiem('chọn bài 6 thì hiện bảng thẻ mới', $('the-moi').className === '', $('the-moi').className);
  kiem('bảng thẻ mới nhắc while not at_goal()', /while not at_goal/.test($('the-moi').innerHTML));
  kiem('tiêu đề ghi rõ chặng 2', /chặng 2/.test($('ten-bai').textContent), $('ten-bai').textContent);

  const timThe = (re) => $('khay').children.findIndex((c) => re.test(c.innerHTML));
  const iWhile = timThe(/while not at_goal/);
  kiem('khay bài 6 có thẻ while và bấm được', iWhile >= 0 && $('khay').children[iWhile].disabled !== true);
  kiem('khay bài 6 KHÔNG có turn_left (khay hẹp có chủ ý)', timThe(/turn_left/) < 0,
    $('khay').children.map((c) => c.innerHTML.slice(0, 16)).join(' | '));

  $('khay').children[iWhile].onclick();
  kiem('thẻ while vào chương trình', $('chuong-trinh').children.length === 1, String($('chuong-trinh').children.length));

  const muc = $('chuong-trinh').children[0];
  const than = muc.children.find((c) => /(^| )than/.test(c.className || ''));
  kiem('thẻ while có thân (hàng đầu + thân nằm trong một bọc)', !!than);
  const khe = than && than.children.find((c) => c.className === 'khe');
  kiem('thân rỗng thì có khe để thêm vào', !!khe);

  khe.onclick({ stopPropagation() { } });              // chọn khe thân
  $('khay').children[timThe(/^move/)].onclick();       // thêm move vào thân
  kiem('ô nhớ đếm 2 thẻ (while + move)', $('o-nho').textContent === '2', $('o-nho').textContent);

  $('nut-chep').onclick();
  kiem('code sinh ra có thụt lề đúng', $('o-code').value === 'while not at_goal():\n    move(1)',
    JSON.stringify($('o-code').value));

  $('tab-the').onclick();
  $('nut-chay').onclick();
  kiem('ghép while + move bằng thẻ đạt hạng A', /on A/.test($('h-A').className), 'class=' + $('h-A').className);
}

console.log('\n---------------------------------------------');
console.log(`ĐẠT ${dat} · HỎNG ${hong}`);
process.exit(hong ? 1 : 0);

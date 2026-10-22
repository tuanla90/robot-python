/* ============================================================================
   kiem-ui-game.mjs — TEST KHÓI cho giao diện game (DOM giả, không cần trình duyệt).
   Chạy: node tran/kiem-ui-game.mjs
   Kiểm là giao diện CÓ CHẠY: hai khe, ô nhớ chương trình, nhân vật dẫn dắt,
   nạp mẫu, chạy trận, ra kết quả, lưu tiến độ, hiện lỗi.
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const day = path.dirname(fileURLToPath(import.meta.url));
let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet ? ' → ' + chiTiet : '')); }
}

/* ------------------------------------------------- DOM + localStorage giả */

function the(tag) {
  return {
    tagName: tag, children: [], className: '', textContent: '', value: '', disabled: false,
    title: '', selectionStart: 0, selectionEnd: 0, _html: '',
    style: { setProperty() { } },
    appendChild(c) { this.children.push(c); return c; },
    focus() { },
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = v; if (v === '') this.children = []; }
  };
}
const kho = {};
const doc = {
  getElementById(id) { return kho[id] || (kho[id] = the('div')); },
  createElement: the,
  addEventListener() { }
};
const E = (id) => doc.getElementById(id);
const win = {};
const ls = {
  _d: {},
  getItem(k) { return this._d[k] === undefined ? null : this._d[k]; },
  setItem(k, v) { this._d[k] = String(v); }
};

for (const f of ['../nhan/san-robot-core.js', 'tran-dau.js', 'tran-game.js', 'choi-tran.js']) {
  const src = fs.readFileSync(path.join(day, f), 'utf8');
  new Function('window', 'document', 'localStorage', 'setTimeout', 'clearTimeout', 'console', src)(
    win, doc, ls, setTimeout, clearTimeout, console);
}

const dem = (html, lop) => (html.match(new RegExp('class="[^"]*\\b' + lop + '\\b', 'g')) || []).length;
/** Tìm nút theo chữ trong nút (cây con giả). */
function timNut(goc, chuoi) {
  if (!goc || !goc.children) return null;
  for (const c of goc.children) {
    if (c.children && c.children.length) { const r = timNut(c, chuoi); if (r) return r; }
    else if ((String(c.innerHTML || '') + String(c.textContent || '')).indexOf(chuoi) >= 0) return c;
  }
  return null;
}
const bam = (goc, chuoi) => { const n = timNut(goc, chuoi); if (!n) throw new Error('không thấy nút ' + chuoi); n.onclick(); };

console.log('\n== 1. Trang khởi động (màn 1) ==');
{
  kiem('có 5 chip màn', E('chips').children.length === 5, String(E('chips').children.length));
  kiem('tiêu đề là màn 1', /Màn 1/.test(E('ten-man').textContent), E('ten-man').textContent);
  kiem('sân vẽ đủ 11×7 = 77 ô', dem(E('san').innerHTML, 'o') >= 77);
  kiem('sân có 1 khối và 4 robot',
    dem(E('san').innerHTML, 'khoi') === 1 && dem(E('san').innerHTML, 'robot') === 4);
  kiem('có hai lựa chọn cho khe 1',
    !!timNut(E('chon-pa'), 'TAY_DAI') && !!timNut(E('chon-pa'), 'CHAN_NHANH'));
  kiem('màn 1 CHƯA mở khe 2', /mở ở màn 4/.test(E('hop-khe2').innerHTML), E('hop-khe2').innerHTML.slice(0, 60));
  kiem('có nhân vật nói một câu', /Khánh|thầy Khải|Hà Vy|Quân/.test(E('thoai').innerHTML), E('thoai').innerHTML.slice(0, 80));
  kiem('đồng hồ ô nhớ hiện ra', /Ô nhớ/.test(E('o-nho').innerHTML), E('o-nho').innerHTML.slice(0, 80));
  kiem('màn 1 không hạn ô nhớ', /không hạn chế/.test(E('o-nho').innerHTML));
}

console.log('\n== 2. Đổi phương án → khay thẻ đổi theo (part mở API) ==');
{
  bam(E('chon-pa'), 'CHAN_NHANH');
  const khoa = E('khay').children.filter((b) => /khong/.test(b.className));
  kiem('chân nhanh: thẻ dùng cảm biến bị khoá', khoa.length === 3, String(khoa.length));
  kiem('trong đó có hai thẻ nhắc thẳng item_here',
    khoa.filter((b) => /item_here/.test(b.textContent)).length === 2,
    khoa.map((b) => b.textContent).join(' | '));
  kiem('có nhân vật cảnh báo MÙ', /MÙ/.test(E('thoai').innerHTML));
  bam(E('chon-pa'), 'TAY_DAI');
  kiem('quay lại tay gắp dài thì hết khoá',
    E('khay').children.filter((b) => /khong/.test(b.className)).length === 0);
}

console.log('\n== 3. Nạp mẫu + chạy trận → thắng ==');
{
  E('nut-mau').onclick();
  kiem('R1 có mẫu', /go_to/.test(E('o-code').value), E('o-code').value.slice(0, 40).replace(/\n/g, '⏎'));
  E('tab-r2').onclick();
  kiem('R2 có mẫu', E('o-code').value.length > 10);
  E('tab-r1').onclick();
  E('toc-do').value = '0';
  E('nut-chay').onclick();
  kiem('kết quả hiện THẮNG', /THẮNG/.test(E('ket-qua').innerHTML), E('ket-qua').innerHTML.slice(0, 120));
  kiem('qua màn 1', /Qua màn 1/.test(E('ket-qua').innerHTML));
  kiem('chip màn 1 đánh dấu xong', E('chips').children[0].className.includes('xong'));
  kiem('điểm A = 1', String(E('diem-a').textContent) === '1', String(E('diem-a').textContent));
  kiem('sân sạch khối sau khi chạy', dem(E('san').innerHTML, 'khoi') === 0);
  kiem('tiến độ được lưu', /xongMan/.test(ls.getItem('robot-tran-v4') || ''));
  kiem('chạy xong thì nhân vật khen', /Hà Vy|thầy Khải/.test(E('thoai').innerHTML), E('thoai').innerHTML.slice(0, 80));
}

console.log('\n== 4. Thẻ lệnh chèn được, container đặt con trỏ vào trong thân ==');
{
  E('nut-xoa').onclick();
  const nut = timNut(E('khay'), 'while not item_here');
  E('o-code').selectionStart = 0; E('o-code').selectionEnd = 0;
  nut.onclick();
  kiem('chèn được cả khối while', /while not item_here\(\):\n    wait\(\)/.test(E('o-code').value),
    JSON.stringify(E('o-code').value));
  kiem('con trỏ nhảy vào trong thân (cuối dòng "    ")',
    E('o-code').selectionStart === 'while not item_here():\n    '.length, String(E('o-code').selectionStart));
}

console.log('\n== 5. Màn 4: mở khe 2, hạn ô nhớ, copy-paste bị chặn ==');
{
  E('chips').children[3].onclick();
  kiem('đang ở màn 4', /Màn 4/.test(E('ten-man').textContent));
  kiem('khe 2 đã mở (có bánh omni và bánh xích)',
    !!timNut(E('chon-pa2'), 'OMNI') && !!timNut(E('chon-pa2'), 'XICH'));
  kiem('đồng hồ ô nhớ ghi hạn 24', /hạn 24/.test(E('o-nho').innerHTML), E('o-nho').innerHTML.slice(0, 90));

  E('nut-mau-dai').onclick();       // bản copy-paste: R1 vượt hạn
  kiem('nạp bản copy-paste thì đồng hồ ô nhớ báo QUÁ hạn',
    /qua/.test(E('o-nho').innerHTML) && /quá hạn/.test(E('o-nho').innerHTML), E('o-nho').innerHTML.slice(0, 120));
  kiem('và nhân vật nói về ô nhớ', /thầy Khải/.test(E('thoai').innerHTML) && /hàm/.test(E('thoai').innerHTML),
    E('thoai').innerHTML.slice(0, 100));
  E('toc-do').value = '0'; E('nut-chay').onclick();
  kiem('chạy thì robot bị chặn bằng memory-full', /memory-full/.test(E('ket-qua').innerHTML),
    E('ket-qua').innerHTML.slice(0, 160));
  kiem('kết quả ghi rõ số ô / hạn', /ô nhớ 37\/24/.test(E('ket-qua').innerHTML),
    E('ket-qua').innerHTML.slice(0, 200));

  E('nut-mau').onclick();           // bản gọn (dùng hàm)
  kiem('bản gọn thì đồng hồ hết đỏ', !/qua/.test(E('o-nho').innerHTML), E('o-nho').innerHTML.slice(0, 110));
  E('nut-chay').onclick();
  kiem('bản gọn thì qua màn 4', /Qua màn 4/.test(E('ket-qua').innerHTML), E('ket-qua').innerHTML.slice(0, 160));
}

console.log('\n== 6. Màn 5: bánh xe quyết định ==');
{
  E('chips').children[4].onclick();
  kiem('đang ở màn 5', /Màn 5/.test(E('ten-man').textContent));
  bam(E('chon-pa2'), 'OMNI');
  E('nut-mau').onclick(); E('toc-do').value = '0'; E('nut-chay').onclick();
  kiem('omni thì qua màn 5', /Qua màn 5/.test(E('ket-qua').innerHTML), E('ket-qua').innerHTML.slice(0, 160));
  bam(E('chon-pa2'), 'XICH');
  E('nut-chay').onclick();
  kiem('xích thì KHÔNG qua (chậm ở góc cua)', /Chưa qua màn/.test(E('ket-qua').innerHTML),
    E('ket-qua').innerHTML.slice(0, 160));
}

console.log('\n== 7. Lỗi cú pháp hiện ra cho người chơi thấy ==');
{
  E('tab-r1').onclick(); E('nut-xoa').onclick();
  E('o-code').value = 'move(2\npick()';
  E('o-code').oninput();
  E('nut-chay').onclick();
  kiem('thiếu ngoặc → syntax-error', /syntax-error/.test(E('ket-qua').innerHTML));
  E('nut-xoa').onclick();
  E('o-code').value = 'move(2)\n    wait()';
  E('o-code').oninput();
  E('nut-chay').onclick();
  kiem('thụt lề thừa → indent-error', /indent-error/.test(E('ket-qua').innerHTML));
  E('nut-xoa').onclick(); E('nut-chay').onclick();
  kiem('chương trình rỗng thì không cho chạy', /Chưa chạy được/.test(E('ket-qua').innerHTML));
  kiem('và nhân vật nhắc điền code', /Hà Vy/.test(E('thoai').innerHTML));
}

console.log('\n---------------------------------------------');
console.log(`ĐẠT ${dat} · HỎNG ${hong}`);
process.exit(hong ? 1 : 0);

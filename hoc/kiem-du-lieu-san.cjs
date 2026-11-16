/* ============================================================================
   kiem-du-lieu-san.cjs — máy kiểm các màn DỮ LIỆU THEO SÂN (man.duLieuSan; lõi: cham.js baiTheoSan, man-choi.js chuanDuLieu).
   Với MỖI màn khai duLieuSan, kiểm:
   1. khai báo: nhiều sân, số phần tử duLieuSan = số sân, mọi sân cùng kích thước, các sân khai CÙNG các vế trái theo cùng thứ tự,
      các bộ số KHÁC nhau giữa các sân, và các dòng dữ liệu của sân 1 nằm ĐẦU chương trình ở maMau (nếu maMau có chương trình) và loiGiai;
   2. lời giải chuẩn thắng 3 sao ở mọi sân; lời giải khác (nếu có) thắng ở mọi sân;
   3. mỗi lời sai vẫn ra đủ các mã phaiCoMa;
   4. MẸO: chương trình phẳng (bỏ hết dữ liệu, điền thẳng số của sân 1; hoc/do-meo-dien-so.cjs) phải THUA.
   Chạy: node hoc/kiem-du-lieu-san.cjs            (mọi màn có duLieuSan; trượt thì thoát mã 1)
         node hoc/kiem-du-lieu-san.cjs 142 144     (chỉ các gói có số đầu id là 142, 144)
   ========================================================================== */
const path = require('path');
const { lamPhang, khoCua, ManHoc, ChamHoc } = require(path.join(__dirname, 'do-meo-dien-so.cjs'));

const chiGoi = process.argv.slice(2).filter((x) => /^\d+$/.test(x));
const veTrai = (s) => { const m = /^([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s*=(?!=)/.exec(String(s || '')); return m ? m[1].replace(/\s+/g, '') : null; };
const mang = (x) => (Array.isArray(x) ? x : [x]);
let dat = 0, hong = 0, soMan = 0;
function kiem(ten, ok, chiTiet) { if (ok) dat++; else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); } }

ManHoc.danhSach.forEach((m) => {
  if (!m.duLieuSan) return;
  if (chiGoi.length && !chiGoi.includes(String(m.id).split('.')[0])) return;
  soMan++;
  const T = m.id + ' ' + m.ma + ': ', ds = m.duLieuSan.map(mang), kho = khoCua(m);

  // 1. khai báo
  const nhieu = Array.isArray(m.san[0]);
  kiem(T + 'màn nhiều sân, không phải màn nhiều robot', nhieu && !m.doi);
  if (!nhieu) return;
  kiem(T + 'số phần tử duLieuSan = số sân', ds.length === m.san.length, ds.length + ' / ' + m.san.length);
  kiem(T + 'mọi sân cùng kích thước', m.san.every((s) => s.length === m.san[0].length && s.every((r, i) => r.length === m.san[0][i].length)));
  kiem(T + 'mọi dòng dữ liệu là dòng gán không thụt', ds.every((san) => san.every((d) => !!veTrai(d))), JSON.stringify(ds));
  kiem(T + 'các sân khai cùng vế trái, cùng thứ tự', ds.every((san) => JSON.stringify(san.map(veTrai)) === JSON.stringify(ds[0].map(veTrai))));
  kiem(T + 'bộ số các sân khác nhau', new Set(ds.map((san) => JSON.stringify(san))).size === ds.length);
  const dauDung = (bai) => ds[0].every((d, j) => (bai.chinh || [])[j] === d);
  kiem(T + 'loiGiai mở đầu bằng các dòng dữ liệu của sân 1', dauDung(m.loiGiai), JSON.stringify((m.loiGiai.chinh || []).slice(0, ds[0].length)));
  if (m.maMau && (m.maMau.chinh || []).length) kiem(T + 'maMau mở đầu bằng các dòng dữ liệu của sân 1', dauDung(m.maMau), JSON.stringify(m.maMau.chinh.slice(0, ds[0].length)));

  // 2. lời giải
  const lg = ChamHoc.cham(m, m.loiGiai, kho);
  kiem(T + 'lời giải chuẩn 3 sao ở mọi sân', lg.thang && lg.sao === 3 && lg.theoSan.every((s) => s.thang), 'thắng ' + lg.thang + ', ' + lg.sao + ' sao, từng sân ' + lg.theoSan.map((s) => (s.thang ? '✓' : '✗') + s.soNhip).join(' ') + ' ' + lg.chanDoan.map((c) => c.ma).join(','));
  if (m.loiGiaiKhac && m.loiGiaiKhac.baiLam) {
    const b = m.loiGiaiKhac.baiLam, moi = b.hamCuaEmMoi || m.loiGiaiKhac.hamCuaEmMoi || [];
    const k = ChamHoc.cham(m, b, kho.filter((h) => !moi.some((x) => x.ten === h.ten)).concat(moi));
    kiem(T + 'lời giải khác thắng ở mọi sân', k.thang, k.theoSan.map((s) => (s.thang ? '✓' : '✗')).join('') + ' ' + k.chanDoan.map((c) => c.ma).join(','));
  }

  // 3. lời sai
  (m.loiSai || []).forEach((x, i) => {
    const moi = x.hamCuaEmMoi || x.baiLam.hamCuaEmMoi || null, can = x.phaiCoMa || [];
    const thieuHam = can.includes('ham-chua-co') || can.includes('chua-tao-ham');
    const khoX = moi ? kho.filter((h) => !(m.taoHam || []).includes(h.ten) && !moi.some((y) => y.ten === h.ten)).concat(moi) : thieuHam ? kho.filter((h) => !(m.taoHam || []).includes(h.ten)) : kho;
    const k = ChamHoc.cham(m, x.baiLam, khoX), ma = k.chanDoan.map((c) => c.ma);
    kiem(T + 'lời sai ' + (i + 1) + ' ra đủ mã ' + can.join(','), can.every((c) => ma.includes(c)), 'có ' + ma.join(',') + ' · ' + x.moTa);
  });

  // 4. mẹo điền thẳng số
  let phang = null, lyDo = '';
  try { phang = lamPhang(m.loiGiai, kho, m.hamGoc); } catch (e) { lyDo = e.message; }
  if (!phang) console.log('  (bỏ qua mẹo ' + m.id + ': bộ dò không làm phẳng được — ' + lyDo + ')');
  else {
    const k = ChamHoc.cham(m, { chinh: phang, hamCuaMan: m.loiGiai.hamCuaMan || [] }, kho);
    kiem(T + 'MẸO điền thẳng số phải thua', !k.thang, 'chương trình phẳng thắng: ' + phang.join(' ; '));
  }
});

console.log('\nMàn có duLieuSan đã kiểm: ' + soMan);
console.log(hong ? 'HỎNG ' + hong + ' · đạt ' + dat : 'ĐẠT cả ' + dat + ' phép kiểm dữ liệu theo sân');
process.exit(hong ? 1 : 0);

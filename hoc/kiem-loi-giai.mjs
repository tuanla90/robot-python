/* ============================================================================
   kiem-loi-giai.mjs — máy kiểm NẠP LỜI GIẢI của bảng Gỡ lỗi (game/go-loi.js, 30/10; kế hoạch người chơi: KE-HOACH-LOI-GIAI.md).
   Kiểm:
   1. mã nguồn: GoLoi xuất cachGiai / khoChoCach / chamCach / napLoiGiai; nút trong bảng gọi napLoiGiai(ma, true) (có hỏi); Choi.napBai ghi nháp và vẽ lại;
      địa chỉ loigiai=…; mọi khóa chữ go.* có trong chu.js, không emoji, không gạch dài; lớp CSS có ở cả hai bộ giao diện;
   2. MỌI màn: lời giải đầu tiên (loiGiai chuẩn; màn lắp ráp: cachLap[0]) chấm trên kho khoChoCach thắng 3 sao; đếm các cách khác thắng được;
   3. chạy thử đường nạp thật (napLoiGiai với KhoHam thật, Choi / Luu / hộp hỏi giả) ở vài màn mỗi mùa (màn đầu, màn có taoHam, trùm, màn đội,
      màn lắp ráp): kho nhận hàm, Choi.napBai nhận bài, chấm lại bằng KhoHam.ds() được 3 sao; bài đang viết khác thì hỏi, Hủy không đổi gì.
   Chạy: node hoc/kiem-loi-giai.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ManHoc = require(path.join(day, 'lo-trinh-hoc.js'));             // lộ trình xuất bản, như choi.html: mọi ngân hàng màn rồi xếp lại theo mùa / gói
const TT = require(path.join(day, 'thu-tu-chuong.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));
const doc = (f) => fs.readFileSync(path.join(day, 'game', f), 'utf8');
const J = JSON.stringify;

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}

/* ---------------------------------------------------------------- nạp go-loi.js trong hộp cát */
const tenCotTruyen = ManHoc.hamCotTruyen();
const hoiDa = [];                                         // các lần hộp xác nhận được mở
let traLoi = true;                                        // câu trả lời của hộp xác nhận giả
const ctx = vm.createContext({
  console: { log: console.log, warn: console.warn, error: console.error, info() {} }, ManHoc, ChamHoc, LapRap, ThuTuChuong: TT,
  KhoHam: KhoHam.moi({ tenCoDinh: tenCotTruyen }),
  t: (k, p) => k + (p ? J(p) : ''),
  TP: { h: () => ({}), Hop: { dong() {}, xacNhan: (o) => { hoiDa.push(o); return Promise.resolve(traLoi); } } },
  Luu: { kho: { getItem: () => null, setItem() {} }, ghiKho: () => ({ ok: true }), ghiLap() {} },
  addEventListener() {}, location: { search: '', hash: '' }, setTimeout
});
ctx.window = ctx;
vm.runInContext(doc('go-loi.js'), ctx, { filename: 'go-loi.js' });
const GoLoi = ctx.GoLoi;

console.log('== 1. Mã nguồn ==');
{
  const gl = doc('go-loi.js'), mc = doc('man-choi.js'), chu = doc('chu.js');
  kiem('GoLoi xuất cachGiai, khoChoCach, chamCach, napLoiGiai, giongBai', ['cachGiai', 'khoChoCach', 'chamCach', 'napLoiGiai', 'giongBai'].every((k) => typeof GoLoi[k] === 'function'));
  kiem('nút "Nạp lời giải" trong bảng gọi napLoiGiai(ma, true) (hỏi trước khi ghi đè), khối chỉ hiện ở màn chơi (sc-choi)',
    /TP\.Hop\.nut\('g-gr', t\('go\.napGiai'\)/.test(gl) && /napLoiGiai\(ma, true\)/.test(gl) && /getElementById\('sc-choi'\)/.test(gl));
  kiem('napLoiGiai hỏi qua TP.Hop.xacNhan khi bài khác mã mẫu và lời giải, hay hàm trong kho sắp bị thay', /if \(!hoi \|\| \(!baiKhac && !thay\.length\)\)/.test(gl) && /TP\.Hop\.xacNhan\(/.test(gl));
  kiem('Choi.napBai: xuất ra, ghi nháp (Luu.ghiNhap), nạp lại khung code, vẽ lại khay và đếm hàm',
    /napBai: napBai/.test(mc) && /function napBai\(bai, chu, kieu\)[\s\S]{0,900}Luu\.ghiNhap\(m\.ma, S\.bai\)[\s\S]{0,200}S\.ed\.nap\([\s\S]{0,200}veKho\(true\)/.test(mc));
  kiem('kho không nhận hết hàm (kho đầy, tên hỏng): vẫn nạp bài nhưng báo đỏ go.napGiaiLoi, không báo đã nạp', /if \(kq\.loi\.length\) Choi\.napBai\(c\.bai, t\('go\.napGiaiLoi'[^\n]*'bad'\)/.test(gl));
  kiem('địa chỉ loigiai=… nạp sau khi vào màn qua man=…', /loigiai=\(\[\^&\]\+\)/.test(gl) && gl.indexOf('vaoNgay(m);') < gl.indexOf('loigiai=('));
  const khoa = [...new Set([...gl.matchAll(/t\('(go\.[A-Za-z]+)'/g)].map((x) => x[1]))];
  const thieu = khoa.filter((k) => !chu.includes("'" + k + "':"));
  kiem('mọi khóa chữ go.* trong go-loi.js có trong chu.js (' + khoa.length + ' khóa)', thieu.length === 0, thieu.join(', '));
  const chuMoi = [...chu.matchAll(/'go\.(?:giai|napGiai|daNapGiai)[A-Za-z]*': '([^']*)'/g)].map((x) => x[1]);
  kiem('chữ mới (' + chuMoi.length + ' câu) không emoji, không gạch dài', chuMoi.length >= 12 && chuMoi.every((s) => !/—|–|\p{Extended_Pictographic}/u.test(s)), chuMoi.join(' | '));
  const css = fs.readFileSync(path.join(day, 'game', 'choi.css'), 'utf8'), cssV = fs.readFileSync(path.join(day, 'game', 'choi-vector.css'), 'utf8');
  kiem('lớp go-giai, go-giai-c, go-giai-mo có ở choi.css; go-giai-c, go-giai-mo có bản vector ở choi-vector.css',
    ['go-giai{', 'go-giai-c{', 'go-giai-mo{'].every((c) => css.includes('.' + c)) && ['go-giai-c{', 'go-giai-mo{'].every((c) => cssV.includes('body.ve-vector .' + c)));
  kiem('kế hoạch người chơi hoc/KE-HOACH-LOI-GIAI.md có mặt', fs.existsSync(path.join(day, 'KE-HOACH-LOI-GIAI.md')));
}

console.log('\n== 2. Mọi màn: lời giải đầu tiên thắng 3 sao trên kho khoChoCach ==');
// Màn mà lời giải chuẩn chưa được 3 sao trên kho khoChoCach: ghi { 'mã': 'lý do' } để tha sao (vẫn bắt buộc thắng); session mùa sửa xong thì bỏ. Hiện không có.
const NGOAI_LE = {};
{
  const ds = ManHoc.danhSach, truot = [], dem = { cach: 0, thang: 0, ba: 0 }, khongCo = [];
  for (const m of ds) {
    const cs = GoLoi.cachGiai(m);
    if (!cs.length) { khongCo.push(m.ma); continue; }
    const r = GoLoi.chamCach(m, cs[0]);
    if (!r.thang) truot.push(m.ma + ' ' + cs[0].ma + ' THUA ' + J(r));
    else if (r.sao !== 3 && !NGOAI_LE[m.ma]) truot.push(m.ma + ' ' + cs[0].ma + ' ' + J(r));
    else if (r.sao !== 3) console.log('       ngoại lệ đã biết ' + m.ma + ': ' + r.sao + ' sao (' + NGOAI_LE[m.ma] + ')');
    for (const c of cs.slice(1)) { const rc = GoLoi.chamCach(m, c); dem.cach++; if (rc.thang) dem.thang++; if (rc.sao === 3) dem.ba++; }
  }
  const muaCo = {};
  TT.goi.forEach((g) => g.chuong.forEach((c) => { muaCo[g.mua || 'mua-1'] = (muaCo[g.mua || 'mua-1'] || 0) + ds.filter((m) => m.chuong === c).length; }));
  kiem('đủ mọi mùa đang có trong thu-tu-chuong (' + Object.entries(muaCo).map(([k, n]) => k + ': ' + n + ' màn').join(', ') + '), mọi màn thuộc một gói',
    Object.keys(muaCo).length >= 4 && Object.values(muaCo).every((n) => n > 0) && Object.values(muaCo).reduce((a, b) => a + b, 0) === ds.length);
  kiem('mọi màn (' + ds.length + ') có ít nhất một lời giải đã lưu', khongCo.length === 0, khongCo.join(', '));
  kiem('lời giải đầu tiên của mọi màn thắng, 3 sao trừ ngoại lệ đã biết (' +(ds.length - truot.length) + '/' + ds.length + ')', truot.length === 0, truot.slice(0, 12).join(' · '));
  console.log('       (các cách khác: ' + dem.cach + ' cách, ' + dem.thang + ' thắng, ' + dem.ba + ' được 3 sao)');
  kiem('phần lớn cách khác (loiGiaiKhac, congThucKhac, cách lắp) chạy thắng trên kho này (≥ 90%)', dem.cach > 0 && dem.thang >= 0.9 * dem.cach, dem.thang + '/' + dem.cach);
  // PHÁT HIỆN (chỉ báo, không trượt): kho tham chiếu vượt trần KhoHam (200 hàm) thì người chơi thật không tạo được hàm cốt truyện mới; đó là việc của lõi / lộ trình, không của bảng Gỡ lỗi.
  const tran = KhoHam.SO_HAM_MAC_DINH, vuot = ds.filter((x) => GoLoi.khoChoCach(x, GoLoi.cachGiai(x)[0]).length > tran);
  if (vuot.length) console.log('       PHÁT HIỆN: ' + vuot.length + ' màn có kho tham chiếu vượt trần ' + tran + ' hàm (' + ManHoc.hamCotTruyen().length + ' hàm cốt truyện), từ ' + vuot[0].ma + ' (' + vuot[0].id + '): nạp lời giải ở đó báo đỏ go.napGiaiLoi');
  const m = ManHoc.danhSach.find((x) => x.loiGiaiKhac && !x.lapRap && x.congThucKhac && x.congThucKhac.length);
  const cs = GoLoi.cachGiai(m);
  kiem('cachGiai(' + m.ma + '): chuẩn, khác, rồi từng công thức khác theo thứ tự, mỗi cách có nhãn và mô tả',
    J(cs.map((c) => c.ma)) === J(['chuan', 'khac'].concat(m.congThucKhac.map((_, i) => 'ct' + (i + 1)))) && cs.every((c) => c.nhan && typeof c.moTa === 'string'));
}

console.log('\n== 3. Chạy thử đường nạp thật ở vài màn mỗi mùa ==');
const muaCua = {};
TT.goi.forEach((g) => g.chuong.forEach((c) => { muaCua[c] = g.mua || 'mua-1'; }));
function maMauCua(goc) {
  const mm = goc.maMau || {};
  return JSON.parse(J(mm.doi ? { doi: mm.doi, hamCuaMan: mm.hamCuaMan || [] } : { chinh: mm.chinh || [], hamCuaMan: mm.hamCuaMan || [] }));
}
/** Dựng màn chơi giả cho goc (màn lắp ráp: gắn robot cach), kho thật mới, rồi gọi napLoiGiai(ma, true). Trả về { kq, nap, kho, man }. */
async function thuNap(goc, ma, o = {}) {
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  (o.khoSan || []).forEach((f) => { kho.tao(f.ten, f.thamSo || [], { taoHam: [f.ten] }); kho.sua(f.ten, f.than, f.thamSo || []); });
  let man = goc.lapRap ? LapRap.apDung(goc, o.cach || goc.lapRap.cachLap[0]) : goc;
  const bai = o.bai || maMauCua(goc);
  let nap = null, vaoLai = 0;
  ctx.KhoHam = kho;
  ctx.Choi = {
    trangThai: () => ({ man, bai }),
    napBai: (b) => { nap = JSON.parse(J(b)); return true; },
    vao: (g, cl) => { vaoLai++; man = LapRap.apDung(g, cl); }
  };
  hoiDa.length = 0; traLoi = o.traLoi !== undefined ? o.traLoi : true;
  const kq = await GoLoi.napLoiGiai(ma, true);
  return { kq, nap, kho, man: () => man, vaoLai, hoi: hoiDa.length };
}
const diem = (r) => J({ thang: r.thang, sao: r.sao, cd: r.chanDoan.map((c) => c.ma) });
{
  const mau = {};
  for (const m of ManHoc.danhSach) (mau[muaCua[m.chuong] || '?'] = mau[muaCua[m.chuong] || '?'] || []).push(m);
  for (const [mua, ds] of Object.entries(mau)) {
    const chon = new Map();
    const them = (m) => { if (m) chon.set(m.ma, m); };
    them(ds[0]);
    them(ds.find((m) => (m.taoHam || []).length && !m.lapRap));
    them(ds.filter((m) => m.hang === 'trum').pop());
    them(ds.find((m) => m.doi));
    them(ds.find((m) => m.lapRap));
    for (const m of chon.values()) {
      const t = await thuNap(m, null);
      const r = t.nap ? ChamHoc.cham(t.man(), t.nap, t.kho.ds()) : null;
      const khoDay = !t.kq.ok && t.kq.loi.every((l) => /tối đa/.test(l));               // vượt trần kho (PHÁT HIỆN ở mục 2): lỗi phải là "kho đầy", bài vẫn nạp
      kiem(mua + ' ' + m.ma + (m.doi ? ' (đội)' : m.lapRap ? ' (lắp ráp)' : '') + ': nạp lời giải không hỏi (bài = mã mẫu, kho rỗng), kho nhận hàm' + (khoDay ? ' tới trần 200 (báo kho đầy)' : '') + ', chấm lại bằng KhoHam.ds() được 3 sao',
        (t.kq.ok || khoDay) && t.hoi === 0 && !!r && r.thang && r.sao === 3, J(t.kq.loi) + ' ' + (r ? diem(r) : 'không nạp'));
    }
  }
}
{
  const m = ManHoc.danhSach.find((x) => (x.taoHam || []).length && !x.lapRap && !x.doi && x.loiGiai.chinh.length);
  const sai = { chinh: ['wait()'], hamCuaMan: [] };
  const huy = await thuNap(m, 'chuan', { bai: sai, traLoi: false });
  kiem(m.ma + ': bài đang viết khác mã mẫu và lời giải: hỏi trước; Hủy thì không nạp bài, không đụng kho', huy.hoi === 1 && huy.kq.loi === 'huy' && huy.nap === null && huy.kho.ds().length === 0, J(huy.kq));
  const co = await thuNap(m, 'chuan', { bai: sai, traLoi: true });
  kiem(m.ma + ': đồng ý thì nạp đúng bài chuẩn', co.hoi === 1 && co.kq.ok && GoLoi.giongBai(co.nap, m.loiGiai), J(co.kq));
  const ten = m.taoHam[0], khac = { ten, thamSo: (m.loiGiai.hamCuaEmMoi.find((f) => f.ten === ten) || {}).thamSo || [], than: ['wait()'] };
  const thay = await thuNap(m, 'chuan', { khoSan: [khac], traLoi: true });
  kiem(m.ma + ': bài là mã mẫu nhưng hàm ' + ten + '() trong kho khác bản lời giải: hỏi, hộp nêu tên hàm, đồng ý thì thay',
    thay.hoi === 1 && thay.kq.thay.includes(ten) && J(thay.kho.tim(ten).than) === J(m.loiGiai.hamCuaEmMoi.find((f) => f.ten === ten).than), J(thay.kq));
  const lai = await thuNap(m, 'chuan', { bai: GoLoi.cachGiai(m)[0].bai });
  kiem(m.ma + ': bài đang là đúng lời giải thì không hỏi', lai.hoi === 0 && lai.kq.ok);
}
{
  const m = ManHoc.danhSach.find((x) => x.lapRap && x.lapRap.cachLap.length > 1 && x.lapRap.cachLap[1].loiGiai);
  if (m) {
    const t = await thuNap(m, 'lap1', { cach: m.lapRap.cachLap[1] });
    const r = t.nap ? ChamHoc.cham(t.man(), t.nap, t.kho.ds()) : null;
    kiem(m.ma + ' (lắp ráp, đang gắn cách 2): nạp "Lắp 1" lắp lại robot cách 1 (Choi.vao) rồi nạp bài, thắng 3 sao',
      t.vaoLai === 1 && J(LapRap.chuanCach(t.man().cachLapDaChon)) === J(LapRap.chuanCach(m.lapRap.cachLap[0])) && !!r && r.sao === 3, r ? diem(r) : J(t.kq));
  }
}

console.log('\n' + (hong ? 'HỎNG ' + hong + '/' + (dat + hong) : 'ĐẠT ' + dat + '/' + dat));
process.exit(hong ? 1 : 0);

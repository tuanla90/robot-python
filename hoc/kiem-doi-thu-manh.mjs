/* ============================================================================
   kiem-doi-thu-manh.mjs — Kiểm tra tự động cho gói thử thách "Đọ sức part mạnh" (`doi-thu-manh`, 10 màn, man-doi-thu-manh.js).
   R1 chỉ có part mùa 1 (hai bánh + tay kẹp + cảm biến khoảng cách), R2 gắn một part mạnh và chạy chương trình khóa; R1 thắng nhờ logic.
   ========================================================================== */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Cham = require('./cham.js');
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const GT = require('./gioi-thieu-part.js');

const clone = (x) => JSON.parse(JSON.stringify(x));
let dat = 0;
function kiem(ten, fn) {
  fn();
  dat++;
  console.log('  ok  ' + ten);
}

const kho = new Map();
const khoTruoc = new Map();
for (const m of M.danhSach) {
  khoTruoc.set(m.ma, clone([...kho.values()]));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}
const muaCuaChuong = {};
for (const g of TT.goi) for (const c of g.chuong) muaCuaChuong[c] = g.mua || 'mua-1';      // gói không khai mua là gói mùa 1
const dsMan = M.danhSach.filter((m) => m.chuong === 'doi-thu-manh');
const THAN_MANH = ['xich', 'omni', 'nhen', 'drone'], TAY_MANH = ['hoi', 'nam-cham', 'nem'];

kiem('Đủ 10 màn trong chương doi-thu-manh', () => assert.equal(dsMan.length, 10));

kiem('Gói ở mùa 4, ngay sau gói Chiến thuật đua (che-dua-robot)', () => {
  const i = TT.goi.findIndex((g) => g.ma === 'doi-thu-manh');
  assert.ok(i > 0, 'không có gói doi-thu-manh');
  assert.equal(TT.goi[i].mua, 'mua-4');
  assert.ok(TT.goi[i - 1].chuong.includes('che-dua-robot'), 'gói trước là ' + TT.goi[i - 1].ma);
  assert.ok(TT.thuTu.indexOf('doi-thu-manh') > TT.thuTu.indexOf('che-dua-robot'));
});

for (const m of dsMan) {
  kiem(m.ma + ' (' + m.ten + '): 3 sao; mẫu chưa thắng; lời sai thua đúng mã; lời giải khác 2 sao; hàm cần học ở mùa 1', () => {
    const kt = khoTruoc.get(m.ma) || [];
    const r = Cham.cham(m, m.loiGiai, kt);
    assert.equal(r.thang, true, m.ma + ' không thắng: ' + JSON.stringify(r.chanDoan));
    assert.equal(r.sao, 3, m.ma + ' không đạt 3 sao (soO=' + r.soO + '/' + m.sao.o + ', soNhip=' + r.soNhip + '/' + m.sao.nhip + ')');
    assert.equal(r.soO, m.sao.o, m.ma + ' lệch sao.o');
    assert.equal(r.soNhip, m.sao.nhip, m.ma + ' lệch sao.nhip');
    assert.equal(r.chanDoan.length, 0, m.ma + ' lời giải còn chẩn đoán: ' + r.chanDoan.map((c) => c.ma).join(','));
    assert.equal(Cham.cham(m, m.maMau, kt).thang, false, m.ma + ' maMau đã thắng sẵn');

    assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất hai lời sai');
    for (const ls of m.loiSai) {
      const rs = Cham.cham(m, ls.baiLam, kt);
      assert.equal(rs.thang, false, m.ma + ' loiSai lại thắng: ' + ls.moTa);
      const thieu = ls.phaiCoMa.filter((x) => !rs.chanDoan.some((c) => c.ma === x));
      assert.equal(thieu.length, 0, m.ma + ' lời sai "' + ls.moTa + '" thiếu mã ' + thieu.join(',') + ' (có ' + rs.chanDoan.map((c) => c.ma).join(',') + ')');
    }
    const rk = Cham.cham(m, m.loiGiaiKhac.baiLam, kt);
    assert.ok(rk.thang && rk.sao === 2, m.ma + ' lời giải khác phải đúng 2 sao (sao ' + rk.sao + ')');

    const chuaHoc = m.hamCuaEmCan.filter((t) => !kt.some((h) => h.ten === t));
    assert.equal(chuaHoc.length, 0, m.ma + ' hàm cần chưa học trước màn: ' + chuaHoc.join(','));
    for (const t of m.hamCuaEmCan) {
      const noi = M.danhSach.find((x) => (x.taoHam || []).includes(t));
      assert.ok(noi, m.ma + ': không tìm thấy màn dạy hàm ' + t);
      assert.equal(muaCuaChuong[noi.chuong], 'mua-1', m.ma + ': hàm ' + t + ' dạy ở ' + noi.ma + ' (' + muaCuaChuong[noi.chuong] + '), không phải mùa 1');
    }
  });
}

kiem('R1 chỉ gắn part mùa 1: thân hai bánh, tay kẹp, cảm biến khoảng cách', () => {
  for (const m of dsMan) {
    const rb = m.doi[0].robot;
    assert.equal(rb.than, 'hai-banh', m.ma);
    assert.equal(rb.tay, 'kep', m.ma);
    assert.ok((rb.camBien || []).every((c) => c.ma === 'khoang-cach'), m.ma + ' cảm biến ngoài mùa 1');
  }
});

kiem('R2 gắn đúng part mạnh khai ở m.doiThu, có thẻ giới thiệu (mạnh ở / yếu ở)', () => {
  for (const m of dsMan) {
    const rb = m.doi[1].robot, dt = m.doiThu;
    assert.ok(m.doiKhang && m.doi[1].coDinh, m.ma + ' phải là màn đối kháng, R2 chương trình khóa');
    assert.ok(THAN_MANH.includes(rb.than) || TAY_MANH.includes(rb.tay), m.ma + ' R2 không có part mạnh');
    assert.ok(dt && (dt.part === rb.than || dt.part === rb.tay), m.ma + ' doiThu.part không khớp robot R2');
    assert.ok(GT.DS[dt.part], m.ma + ' part ' + dt.part + ' không có trong GioiThieuPart');
    assert.ok(dt.manh.length && dt.yeu.length, m.ma + ' thẻ đối thủ thiếu mạnh ở / yếu ở');
    const nd = GT.noiDung(dt.part, m.doi[1].hamGoc, null, rb.than, {});
    assert.ok(nd && nd.lenh.length, m.ma + ' thẻ đối thủ không có lệnh nào của part');
  }
});

kiem('Mọi màn có khoDoiThu đủ các hàm mà chương trình khóa của R2 gọi', () => {
  for (const m of dsMan) {
    const goc = new Set(m.doi[1].hamGoc.concat(['range', 'left_clear', 'right_clear']));
    const goi = [...new Set((m.maMau.doi[1].chinh.join('\n').match(/[a-z_]+(?=\()/g) || []))].filter((t) => !goc.has(t));
    const co = new Set(m.khoDoiThu.map((h) => h.ten).concat((m.maMau.hamCuaMan || []).map((h) => h.ten)));
    const thieu = goi.filter((t) => !co.has(t));
    assert.equal(thieu.length, 0, m.ma + ' thiếu hàm của R2: ' + thieu.join(','));
  }
});

kiem('R2 là mối đe dọa thật: R1 đứng yên thì R2 tới cờ (doi-thu-thang), không treo', () => {
  for (const m of dsMan) {
    const r = Cham.cham(m, { doi: [{ chinh: ['wait()'] }, { chinh: m.maMau.doi[1].chinh }], hamCuaMan: m.maMau.hamCuaMan || [] }, khoTruoc.get(m.ma));
    const c = r.chanDoan.filter((x) => x.ma === 'doi-thu-thang');
    assert.ok(c.length >= 1, m.ma + ' R2 một mình không tới cờ: ' + r.chanDoan.map((x) => x.ma).join(','));
  }
});

console.log('ĐẠT ' + dat + ' kiểm tra gói Đọ sức part mạnh.');

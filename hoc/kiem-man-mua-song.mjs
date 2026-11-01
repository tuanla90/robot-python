// Kiểm tra các màn của mùa 5 "Bến sông" (M.muaSong): chấm lời giải (3 sao, đúng ngưỡng o và nhip), lời giải khác, mã mẫu, lời sai và kiểm chữ hiển thị.
// Chạy: node hoc/kiem-man-mua-song.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const Cham = require('./cham.js');
const clone = x => JSON.parse(JSON.stringify(x));

const kho = new Map(), khoTruoc = new Map();
for (const m of M.danhSach) {
  khoTruoc.set(m.ma, [...kho.values()].map(clone));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}
function cham(m, lg, truoc = khoTruoc.get(m.ma) || []) {
  const hs = new Map(truoc.map(h => [h.ten, clone(h)]));
  for (const h of lg.hamCuaEmMoi || []) hs.set(h.ten, clone(h));
  for (const h of m.hamCuaEmCan || []) assert.ok(hs.has(h), m.ma + ' cần hàm chưa được học: ' + h);
  return Cham.cham(m, { chinh: lg.chinh, hamCuaMan: lg.hamCuaMan || [], doi: lg.doi }, [...hs.values()]);
}

const chuongMuaSong = new Set(TT.goi.filter(g => g.mua === 'mua-5').flatMap(g => g.chuong));
const ds = M.danhSach.filter(m => chuongMuaSong.has(m.chuong));
assert.ok(ds.length >= 200, 'chưa có đủ màn mùa bến sông');

if (process.argv.includes('--in-sao')) {
  for (const m of ds) {
    const r = cham(m, m.loiGiai);
    console.log(`  "${m.ma}": { "o": ${r.soO}, "nhip": ${r.soNhip} },`);
  }
}

let dat = 0, hong = 0;
for (const m of ds) {
  try {
    const r = cham(m, m.loiGiai);
    assert.ok(r.thang, 'lời giải không thắng: ' + JSON.stringify(r.chanDoan));
    assert.equal(r.sao, 3, 'lời giải chỉ được ' + r.sao + ' sao (soO=' + r.soO + '/' + m.sao.o + ', soNhip=' + r.soNhip + '/' + m.sao.nhip + ')');
    assert.equal(r.soO, m.sao.o, 'soO ' + r.soO + ' != sao.o ' + m.sao.o);
    assert.equal(r.soNhip, m.sao.nhip, 'soNhip ' + r.soNhip + ' != sao.nhip ' + m.sao.nhip);
    if (!m.chiChay) {
      const rm = cham(m, m.maMau);
      assert.equal(rm.thang, false, 'mã mẫu đã giải sẵn');
      assert.ok((m.loiSai || []).length >= 2, 'cần ít nhất 2 lời sai');
    }
    if (m.loiGiaiKhac) {
      const rk = cham(m, Object.assign({}, m.loiGiaiKhac.baiLam, { hamCuaEmMoi: m.loiGiaiKhac.hamCuaEmMoi || m.loiGiai.hamCuaEmMoi }));
      assert.ok(rk.thang, 'loiGiaiKhac không thắng: ' + JSON.stringify(rk.chanDoan));
    }
    for (const s of m.loiSai || []) {
      const rs = cham(m, Object.assign({}, s.baiLam, { hamCuaEmMoi: s.hamCuaEmMoi }));
      assert.ok(!rs.thang || rs.sao < 3, 'loiSai "' + s.moTa + '" lại thắng 3 sao');
      const ma = (rs.chanDoan || []).map(c => c.ma);
      for (const c of s.phaiCoMa || []) assert.ok(ma.includes(c), 'loiSai "' + s.moTa + '" thiếu mã ' + c + ' (có: ' + ma.join(', ') + ')');
    }
    const chu = [m.ten, m.deBai, m.veMaMau, ...(m.goiY || []), ...(m.loiSai || []).map(x => x.moTa)].filter(Boolean).join(' ');
    assert.ok(!/[—–]/.test(chu), 'chứa dấu gạch dài — / –');
    dat++;
  } catch (e) {
    hong++;
    console.log('  ✗ HỎNG ' + m.ma + ' (' + m.chuong + '.' + m.so + ' ' + m.ten + '): ' + e.message);
  }
}

console.log((hong ? 'HỎNG ' + hong + ' màn; ' : '') + 'ĐẠT ' + dat + '/' + ds.length + ' màn mùa bến sông.');
if (hong) process.exit(1);

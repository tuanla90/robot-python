/* ============================================================================
   kiem-dua-robot.mjs — Kiểm tra tự động cho Hướng 1 (Chế độ Đối kháng & Chuỗi 20 bài `dua-robot` + `che-dua-robot`).
   ========================================================================== */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const SanHoc = require('./san-hoc.js');
const Cham = require('./cham.js');
const M = require('./lo-trinh-hoc.js');

const clone = (x) => JSON.parse(JSON.stringify(x));
let dat = 0;
function kiem(ten, fn) {
  fn();
  dat++;
  console.log('  ok  ' + ten);
}

// 1. Kiểm tra lõi đối kháng (doiKhang: true)
kiem('Lõi doiKhang (toi-co): R1 tới cờ trước R2 -> R1 thắng ngay', () => {
  const san = [
    '######',
    '#..F.#',
    '######',
    '#...F#',
    '######'
  ];
  const r = SanHoc.chay({
    san,
    mucTieu: 'toi-co',
    doiKhang: true,
    doi: [
      { batDau: { x: 1, y: 1, huong: 1 }, loaiRobot: 'banh' },
      { batDau: { x: 1, y: 3, huong: 1 }, loaiRobot: 'banh' }
    ]
  }, [
    'left_move()\nright_move()\nwait()\nleft_move()\nright_move()\nwait()',
    'left_move()\nright_move()\nwait()\nleft_move()\nright_move()\nwait()\nleft_move()\nright_move()\nwait()'
  ]);
  assert.equal(r.thang, true);
  assert.equal(r.nhip, 2);
  assert.equal(r.dungSom, null);
});

kiem('Lõi doiKhang (toi-co): R2 tới cờ trước hoặc cùng nhịp R1 -> R1 thua với doi-thu-thang', () => {
  const san = [
    '######',
    '#..F.#',
    '######',
    '#..F.#',
    '######'
  ];
  // Cùng nhịp (nhịp 2)
  const rCung = SanHoc.chay({
    san,
    mucTieu: 'toi-co',
    doiKhang: true,
    doi: [
      { batDau: { x: 1, y: 1, huong: 1 }, loaiRobot: 'banh' },
      { batDau: { x: 1, y: 3, huong: 1 }, loaiRobot: 'banh' }
    ]
  }, [
    'left_move()\nright_move()\nwait()\nleft_move()\nright_move()\nwait()',
    'left_move()\nright_move()\nwait()\nleft_move()\nright_move()\nwait()'
  ]);
  assert.equal(rCung.thang, false);
  assert.equal(rCung.dungSom, 'doi-thu-thang');
  assert.ok(rCung.suKien.some((e) => e.ma === 'doi-thu-thang' && e.cungNhip === true));

  // R2 tới trước (nhịp 1 vs nhịp 2)
  const rTruoc = SanHoc.chay({
    san,
    mucTieu: 'toi-co',
    doiKhang: true,
    doi: [
      { batDau: { x: 1, y: 1, huong: 1 }, loaiRobot: 'banh' },
      { batDau: { x: 2, y: 3, huong: 1 }, loaiRobot: 'banh' }
    ]
  }, [
    'left_move()\nright_move()\nwait()\nleft_move()\nright_move()\nwait()',
    'left_move()\nright_move()\nwait()'
  ]);
  assert.equal(rTruoc.thang, false);
  assert.equal(rTruoc.dungSom, 'doi-thu-thang');
  assert.ok(rTruoc.suKien.some((e) => e.ma === 'doi-thu-thang' && e.cungNhip === false));
});

kiem('Lõi doiKhang (dua-vat): R1 đặt vật vào đích trước khi R2 tới cờ F thì thắng, chậm hơn thì thua', () => {
  const san = [
    '######',
    '#.oD.#',
    '######',
    '#..F.#',
    '######'
  ];
  const cfg = {
    san,
    mucTieu: 'dua-vat',
    doiKhang: true,
    doi: [
      { batDau: { x: 1, y: 1, huong: 1 }, loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release'] },
      { batDau: { x: 1, y: 3, huong: 1 }, loaiRobot: 'banh' }
    ]
  };
  const rThua = SanHoc.chay(cfg, [
    'wait()\nwait()\nwait()',
    'left_move()\nright_move()\nwait()\nleft_move()\nright_move()\nwait()'
  ]);
  assert.equal(rThua.thang, false);
  assert.equal(rThua.dungSom, 'doi-thu-thang');
});

// 2. Kiểm tra toàn bộ 20 màn của gói `dua-robot` và `che-dua-robot`
const kho = new Map();
const khoTruoc = new Map();
for (const m of M.danhSach) {
  khoTruoc.set(m.ma, clone([...kho.values()]));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}

const dsMan = M.danhSach.filter((m) => m.chuong === 'dua-robot' || m.chuong === 'che-dua-robot');
kiem('Đủ 20 màn trong 2 chương dua-robot và che-dua-robot', () => {
  assert.equal(dsMan.length, 20);
});

for (const m of dsMan) {
  kiem(m.ma + ' (' + m.ten + '): lời giải 3 sao không chẩn đoán; mẫu chưa thắng; hai lời sai thua đúng mã; lời giải khác 2 sao; hàm cần đã học', () => {
    const kt = khoTruoc.get(m.ma) || [];
    const r = Cham.cham(m, m.loiGiai, kt);
    if (!r.thang || r.sao !== 3 || r.soO !== m.sao.o || r.soNhip !== m.sao.nhip) {
      console.error('CHI TIET ' + m.ma + ':', { thang: r.thang, sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, chanDoan: r.chanDoan });
    }
    assert.equal(r.thang, true, m.ma + ' không thắng: ' + JSON.stringify(r.chanDoan));
    assert.equal(r.sao, 3, m.ma + ' không đạt 3 sao (soO=' + r.soO + '/' + m.sao.o + ', soNhip=' + r.soNhip + '/' + m.sao.nhip + ')');
    assert.equal(r.soO, m.sao.o, m.ma + ' lệch sao.o: thực tế ' + r.soO + ' != ' + m.sao.o);
    assert.equal(r.soNhip, m.sao.nhip, m.ma + ' lệch sao.nhip: thực tế ' + r.soNhip + ' != ' + m.sao.nhip);

    const rm = Cham.cham(m, m.maMau, kt);
    assert.equal(rm.thang, false, m.ma + ' maMau đã thắng sẵn');

    assert.equal(r.chanDoan.length, 0, m.ma + ' lời giải còn chẩn đoán: ' + r.chanDoan.map((c) => c.ma).join(','));
    assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất hai lời sai');
    for (const ls of m.loiSai) {
      assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
      assert.notEqual(JSON.stringify([ls.baiLam.doi[0].chinh, ls.baiLam.hamCuaMan]), JSON.stringify([m.maMau.doi[0].chinh, m.maMau.hamCuaMan]), m.ma + ' lời sai trùng chương trình mẫu: ' + ls.moTa);
      const rs = Cham.cham(m, ls.baiLam, kt);
      assert.equal(rs.thang, false, m.ma + ' loiSai lại thắng: ' + ls.moTa);
      const thieu = ls.phaiCoMa.filter((x) => !rs.chanDoan.some((c) => c.ma === x));
      assert.equal(thieu.length, 0, m.ma + ' lời sai "' + ls.moTa + '" thiếu mã ' + thieu.join(',') + ' (có ' + rs.chanDoan.map((c) => c.ma).join(',') + ')');
    }
    const rk = Cham.cham(m, m.loiGiaiKhac.baiLam, kt);
    assert.ok(rk.thang && rk.sao === 2, m.ma + ' lời giải khác phải đúng 2 sao (sao ' + rk.sao + ')');
    const chuaHoc = m.hamCuaEmCan.filter((t) => !kt.some((h) => h.ten === t));
    assert.equal(chuaHoc.length, 0, m.ma + ' hàm cần chưa học trước màn: ' + chuaHoc.join(','));
    const tenEm = new Set(M.danhSach.flatMap((x) => x.taoHam || []));
    const trung = [...new Set([].concat(m.maMau.hamCuaMan || [], m.loiGiai.hamCuaMan || []).map((h) => h.ten))].filter((t) => tenEm.has(t));
    assert.equal(trung.length, 0, m.ma + ' hàm của màn trùng tên hàm của em: ' + trung.join(','));
  });
}

// 3. R2 chạy bằng bộ hàm riêng (man.khoDoiThu), không mượn kho của người chơi
kiem('Mọi màn có khoDoiThu đủ các hàm mà chương trình khóa của R2 gọi', () => {
  const GOC = new Set(['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear', 'range']);
  for (const m of dsMan) {
    const goi = [...new Set((m.maMau.doi[1].chinh.join('\n').match(/[a-z_]+(?=\()/g) || []))].filter((t) => !GOC.has(t));
    const co = new Set(m.khoDoiThu.map((h) => h.ten).concat((m.maMau.hamCuaMan || []).map((h) => h.ten)));
    const thieu = goi.filter((t) => !co.has(t));
    assert.equal(thieu.length, 0, m.ma + ' thiếu hàm của R2: ' + thieu.join(','));
  }
});
kiem('Sửa move() trong kho của mình cho chậm đi KHÔNG làm R2 chậm theo (dua-robot.3, dua-robot.6)', () => {
  const KHO = [{ ten: 'move', thamSo: [], than: ['left_move()', 'right_move()', 'wait()'] }, { ten: 'turn_left', thamSo: [], than: ['left_back()', 'wait()'] }];
  const CHAM = KHO.map((h) => (h.ten === 'move' ? { ten: 'move', thamSo: [], than: ['wait()', 'wait()', 'wait()', 'wait()', 'left_move()', 'right_move()', 'wait()'] } : h));
  for (const ma of ['dua-robot.3', 'dua-robot.6']) {
    const m = M.timMa(ma);
    // R1 chờ k nhịp rồi chạy thẳng bằng lệnh gốc: tìm k nhỏ nhất mà R1 thua với kho chuẩn
    let k = 0, b = null;
    for (; k < 30; k++) {
      b = { doi: [{ chinh: Array(k).fill('wait()').concat(['while front_clear():', '    left_move()', '    right_move()', '    wait()']) }], hamCuaMan: [] };
      const a = Cham.cham(m, b, KHO);
      if (!a.thang && a.chanDoan.some((c) => c.ma === 'doi-thu-thang')) break;
    }
    assert.ok(k < 30, ma + ': không tìm được ca R1 thua');
    assert.equal(Cham.cham(m, b, CHAM).thang, false, ma + ': kho move() chậm làm R2 chậm theo, R1 thắng gian');
  }
});
kiem('Đối kháng giao hàng (dua-vat): R1 đi ngang ô cờ F của R2 thì vẫn đi tiếp, không bị coi là tới đích', () => {
  const r = SanHoc.chay({
    san: ['#######', '#.F.oD#', '#######', '#.....#', '#######'], mucTieu: 'dua-vat', doiKhang: true,
    doi: [
      { batDau: { x: 1, y: 1, huong: 1 }, loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'] },
      { batDau: { x: 1, y: 3, huong: 1 }, loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait'] }
    ]
  }, ['left_move()\nright_move()\nwait()\nleft_move()\nright_move()\nwait()', 'wait()\nwait()\nwait()']);
  assert.equal(r.doi[0].toiCo, false);
  assert.equal(r.doi[0].robot.x, 3);
});

// 4. Chỗ đứng: mùa 4, sau Lắp ráp: Đủ bộ, sau Sân cơ khí (gói dùng bàn xoay, cổng, nút đè)
kiem('Gói Đua đối kháng ở mùa 4, ngay sau gói Lắp ráp: Đủ bộ, đứng sau gói Sân cơ khí', () => {
  const TT = require('./thu-tu-chuong.js');
  const i = TT.goi.findIndex((g) => g.ma === 'dua-robot');
  assert.ok(i > 0, 'không có gói dua-robot');
  assert.equal(TT.goi[i].mua, 'mua-4');
  assert.ok(TT.goi[i - 1].chuong.includes('rap-du'), 'gói trước là ' + TT.goi[i - 1].ma);
  const iCoChe = TT.goi.findIndex((g) => g.chuong.includes('ban-xoay'));
  assert.ok(iCoChe >= 0 && iCoChe < i, 'Sân cơ khí phải đứng trước');
  assert.ok(TT.thuTu.indexOf('dua-robot') > TT.thuTu.indexOf('che-ban-xoay'));
});

console.log('ĐẠT ' + dat + ' kiểm tra gói Đua đối kháng.');

/* ============================================================================
   kiem-ban-xoay.mjs — Kiểm tra tự động cho Hướng 4:
   1. Cơ chế sân tương tác mới trong lõi (hoc/san-hoc.js & hoc/cham.js):
      - Bàn xoay (@ xoay phải 90°, % xoay trái 90°)
      - Nút đè giữ trên sàn (M mở/đóng cửa C/c khi đè, nhả ra cửa đóng lại)
      - Cổng dịch chuyển đôi (1, 2 dịch chuyển tức thì, mang theo vật, chặn khi cổng ra bận)
   2. Chuỗi 20 bài học tương ứng (2 chương: ban-xoay & che-ban-xoay trong hoc/man-ban-xoay.js):
      - Lời giải chuẩn đạt 3 sao (đúng ngưỡng sao.o và sao.nhip)
      - Mã mẫu chưa giải sẵn (thang === false)
      - Mọi kịch bản lỗi sai (loiSai) đều bắt đúng mã chẩn đoán (phaiCoMa)
   ========================================================================== */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const SanHoc = require('./san-hoc.js');
const Cham = require('./cham.js');
const M = require('./lo-trinh-hoc.js');

let dat = 0;
function kiem(ten, fn) {
  fn();
  dat++;
}

/* ------------------------------------------------------------------ 1. LÕI */

kiem('Bàn xoay @ xoay phải 90° và % xoay trái 90° khi bước vào hoặc wait()', () => {
  const san = ['#..@#', '###.#', '##F%#'];
  const kq = SanHoc.chay(
    { san, batDau: { x: 1, y: 0, huong: 1 }, loaiRobot: 'banh' },
    'left_move()\nright_move()\nwait()\n' +
    'left_move()\nright_move()\nwait()\n' +
    'left_move()\nright_move()\nwait()\n' +
    'left_move()\nright_move()\nwait()\n' +
    'wait()\n' +
    'wait()\n' +
    'left_move()\nright_move()\nwait()\n'
  );
  assert.equal(kq.thang, true);
  const skXoay = kq.vet.filter(v => v.loai === 'nhip').flatMap(v => v.suKien).filter(e => e.ma === 'ban-xoay');
  assert.equal(skXoay.length, 4);
  assert.deepEqual(skXoay[0], { ma: 'ban-xoay', huong: 1, tu: 1, den: 2, o: { x: 3, y: 0 } });
  assert.deepEqual(skXoay[1], { ma: 'ban-xoay', huong: -1, tu: 2, den: 1, o: { x: 3, y: 2 } });
  assert.deepEqual(skXoay[2], { ma: 'ban-xoay', huong: -1, tu: 1, den: 0, o: { x: 3, y: 2 } });
  assert.deepEqual(skXoay[3], { ma: 'ban-xoay', huong: -1, tu: 0, den: 3, o: { x: 3, y: 2 } });
});

kiem('Nút đè giữ M mở cửa C khi có xe/vật đè và tự đóng lại khi rời khỏi M', () => {
  const san = ['#.M.CF#'];
  // Xe bước qua M (x=2) ở nhịp 1 -> cửa C (x=4) mở cuối nhịp 1; nhịp 2 xe rời M sang x=3 -> cuối nhịp 2 cửa C đóng lại!
  const kq1 = SanHoc.chay(
    { san, batDau: { x: 1, y: 0, huong: 1 }, loaiRobot: 'banh' },
    'left_move()\nright_move()\nwait()\n' +
    'left_move()\nright_move()\nwait()\n'
  );
  const nhip1 = kq1.vet.filter(v => v.loai === 'nhip')[0];
  const nhip2 = kq1.vet.filter(v => v.loai === 'nhip')[1];
  assert.equal(nhip1.cua[0].mo, true, 'Đứng trên M thì cửa C phải mở');
  assert.equal(nhip1.nutDe[0].bat, true);
  assert.equal(nhip2.cua[0].mo, false, 'Rời khỏi M thì cửa C phải đóng lại');
  assert.equal(nhip2.nutDe[0].bat, false);
});

kiem('Cổng dịch chuyển đôi 1 và 2: kiểm tra cặp cổng, dịch chuyển tức thì và cổng bị chặn', () => {
  assert.throws(() => SanHoc.docSan(['#.1.F#']), /Cổng dịch chuyển "1" phải có đúng 2 ô/);

  // Cổng thông thoáng: bước vào (2,0) nhảy sang (4,0), bước nữa tới F (5,0)
  const kq = SanHoc.chay(
    { san: ['#.1#1F#'], batDau: { x: 1, y: 0, huong: 1 }, loaiRobot: 'banh' },
    'left_move()\nright_move()\nwait()\n' +
    'left_move()\nright_move()\nwait()\n'
  );
  assert.equal(kq.thang, true);
  assert.equal(kq.nhip, 2);

  // Cổng đầu ra có vật chắn -> sự kiện cong-chan, xe đứng lại ở cổng vào
  const kqChan = SanHoc.chay(
    { san: ['#.1#1F#'], vat: [{ x: 4, y: 0 }], batDau: { x: 1, y: 0, huong: 1 }, loaiRobot: 'banh' },
    'left_move()\nright_move()\nwait()\n'
  );
  assert.equal(kqChan.robot.x, 2);
  assert.ok(kqChan.suKien.some(e => e.ma === 'cong-chan' && e.vat === 'vat'));
});

/* ------------------------------------------- 2. CHUỖI 20 BÀI SÂN CƠ KHÍ */

const kho = new Map();
for (const m of M.danhSach) {
  if (m.chuong === 'ban-xoay' || m.chuong === 'che-ban-xoay') {
    const dsKho = [...kho.values()];
    kiem(m.ma + ': lời giải chuẩn thắng 3 sao, mã mẫu chưa thắng, lỗi sai bắt đúng mã', () => {
      const r = Cham.cham(m, m.loiGiai, dsKho);
      assert.equal(r.thang, true, m.ma + ' chưa thắng: ' + JSON.stringify(r.chanDoan));
      assert.equal(r.sao, 3, m.ma + ' sao=' + r.sao);
      assert.equal(r.soO, m.sao.o, m.ma + ' soO=' + r.soO + ' != ' + m.sao.o);
      assert.equal(r.soNhip, m.sao.nhip, m.ma + ' soNhip=' + r.soNhip + ' != ' + m.sao.nhip);

      const rm = Cham.cham(m, m.maMau, dsKho);
      assert.equal(rm.thang, false, m.ma + ' maMau đã thắng sẵn');

      for (const ls of m.loiSai || []) {
        const rl = Cham.cham(m, ls.baiLam, dsKho);
        assert.equal(rl.thang, false, m.ma + ' loiSai "' + ls.moTa + '" lại thắng');
        const maCD = rl.chanDoan.map(c => c.ma);
        for (const ma of ls.phaiCoMa || []) {
          assert.ok(maCD.includes(ma), m.ma + ' loiSai "' + ls.moTa + '" thiếu mã ' + ma + ' (có: ' + maCD.join(',') + ')');
        }
      }
    });
  }
  if (!m.tietKiemNhip) {
    for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, JSON.parse(JSON.stringify(h)));
  }
}

console.log('ĐẠT ' + dat + ' kiểm tra bàn xoay, nút đè, cổng dịch chuyển & 20 màn Sân cơ khí.');

/* ============================================================================
   kiem-loa.mjs — Kiểm tra hệ thống Loa + Bản nhạc + Song tấu 2 bè + Bài nhạc
   chúc mừng chiến thắng (9 đoạn × 8 nhịp = 72 nhịp, gồm Cảng sông).
   Chạy: node hoc/kiem-loa.mjs
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const SoLenh = require(path.join(day, 'so-lenh.js'));
const BM = require(path.join(day, 'game', 'bang-mau.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); }
  else { hong++; console.log('  ✗ HỎNG ' + ten + (chiTiet ? '\n      ' + chiTiet : '')); }
}

console.log('=== 1. SanHoc.docDieu & SanHoc.docDieuDoi ===');
{
  const d1 = SanHoc.docDieu('12345678-x.08');
  kiem('docDieu đọc đủ 1..8, -, x, ., 0', JSON.stringify(d1) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, null, 'x', null, null, 8]), JSON.stringify(d1));
  const d2 = SanHoc.docDieu([1, 'x', null, 8, '-', 5]);
  kiem('docDieu đọc mảng hỗn hợp', JSON.stringify(d2) === JSON.stringify([1, 'x', null, 8, null, 5]), JSON.stringify(d2));
  const dd = SanHoc.docDieuDoi({ r1: '1358', r2: '1.3.' });
  kiem('docDieuDoi đọc { r1, r2 } (kể cả bè đệm kết bằng dấu lặng)', dd && JSON.stringify(dd.r1) === JSON.stringify([1, 3, 5, 8]) && JSON.stringify(dd.r2) === JSON.stringify([1, null, 3, null]), JSON.stringify(dd));
}

console.log('\n=== 2. note(n), note(n, so_nhip), beat(), lỗi và đảo chiều ===');
{
  const HG = ['left_move', 'right_move', 'wait', 'note', 'beat'];
  // note(n) 1 đối số + beat()
  const k1 = SanHoc.chay({
    san: ['#####', '#...#', '#####'],
    batDau: { x: 1, y: 1, huong: 1 },
    hamGoc: HG,
    mucTieu: 'choi-dieu',
    dieu: '1x8'
  }, 'note(1)\nwait()\nbeat()\nwait()\nnote(8)\nwait()');
  kiem('note(1), beat(), note(8) thắng choi-dieu "1x8"', k1.thang && k1.nhip === 3 && JSON.stringify(k1.daChoi.map(x => x.am)) === JSON.stringify([1, 'x', 8]), JSON.stringify({ thang: k1.thang, nhip: k1.nhip, daChoi: k1.daChoi }));

  // note(n, so_nhip) 2 đối số khi đứng yên: 1 lệnh wait() tự kéo dài so_nhip nhịp
  const k2 = SanHoc.chay({
    san: ['#####', '#...#', '#####'],
    batDau: { x: 1, y: 1, huong: 1 },
    hamGoc: HG,
    mucTieu: 'choi-dieu',
    dieu: '11555665'
  }, 'note(1, 2)\nwait()\nnote(5, 3)\nwait()\nnote(6, 2)\nwait()\nnote(5, 1)\nwait()');
  kiem('note(n, so_nhip) đứng yên: 1 wait() ngân đủ so_nhip nhịp (8 nhịp từ 4 cặp lệnh)', k2.thang && k2.nhip === 8 && JSON.stringify(k2.daChoi.map(x => x.am)) === JSON.stringify([1, 1, 5, 5, 5, 6, 6, 5]), JSON.stringify({ thang: k2.thang, nhip: k2.nhip, daChoi: k2.daChoi }));

  // note(n, so_nhip) 2 đối số khi vừa đi vừa ngân
  const k2Move = SanHoc.chay({
    san: ['######', '#...F#', '######'],
    batDau: { x: 1, y: 1, huong: 1 },
    hamGoc: HG,
    mucTieu: 'choi-dieu',
    dieu: '333',
    dieuToiCo: true
  }, 'note(3, 3)\nfor i in range(3):\n    left_move()\n    right_move()\n    wait()');
  kiem('note(3, 3) vừa đi 3 ô tới cờ vừa ngân nốt Mi suốt 3 nhịp', k2Move.thang && k2Move.robot.x === 4 && k2Move.nhip === 3 && JSON.stringify(k2Move.daChoi.map(x => x.am)) === JSON.stringify([3, 3, 3]), JSON.stringify({ thang: k2Move.thang, robot: k2Move.robot, nhip: k2Move.nhip, daChoi: k2Move.daChoi }));

  // Đảo chiều loa: note(1) -> 8, note(8) -> 1
  const kDao = SanHoc.chay({
    san: ['#####', '#...#', '#####'],
    batDau: { x: 1, y: 1, huong: 1 },
    hamGoc: HG,
    daoChieu: ['loa'],
    mucTieu: 'choi-dieu',
    dieu: '871'
  }, 'note(1)\nwait()\nnote(2)\nwait()\nnote(8)\nwait()');
  kiem('daoChieu: ["loa"] đảo nốt n thành 9 - n', kDao.thang && JSON.stringify(kDao.daChoi.map(x => x.am)) === JSON.stringify([8, 7, 1]), JSON.stringify(kDao.daChoi));

  // Lỗi đối số note(0), note(9), note(1, 0), note(1, 9), beat(1)
  for (const [code, nhan] of [
    ['note(0)\nwait()', 'note(0)'],
    ['note(9)\nwait()', 'note(9)'],
    ['note(1, 0)\nwait()', 'note(1, 0)'],
    ['note(1, 9)\nwait()', 'note(1, 9)'],
    ['beat(1)\nwait()', 'beat(1)']
  ]) {
    const kl = SanHoc.chay({
      san: ['#####', '#...#', '#####'],
      batDau: { x: 1, y: 1, huong: 1 },
      hamGoc: HG
    }, code);
    kiem('Bắt lỗi not-sai cho ' + nhan, !!(kl.loi && kl.loi.ma === 'not-sai'), JSON.stringify(kl.loi));
  }
}

console.log('\n=== 3. Chẩn đoán ChamHoc cho Loa (1 robot) ===');
{
  const manMau = {
    ma: 'test.loa.1', id: 'T.1', ten: 'Thử loa',
    san: ['######', '#...F#', '######'],
    batDau: { x: 1, y: 1, huong: 1 },
    robot: { than: 'hai-banh', tay: 'loa' },
    hamGoc: ['left_move', 'right_move', 'wait', 'note', 'beat'],
    mucTieu: 'choi-dieu',
    dieu: '1.3',
    khung: { chinh: 8 },
    maMau: { chinh: [], hamCuaMan: [] },
    sao: { o: 6, nhip: 4 }
  };

  const cSaiNot = ChamHoc.cham(manMau, { chinh: ['note(2)', 'wait()'] }, []);
  kiem('Chẩn đoán sai-not khi cần Đô (1) nhưng phát Rê (2)', cSaiNot.chanDoan.some(c => c.ma === 'sai-not'), JSON.stringify(cSaiNot.chanDoan));

  const cLechNhip = ChamHoc.cham(manMau, { chinh: ['note(1)', 'wait()', 'note(3)', 'wait()'] }, []);
  kiem('Chẩn đoán lech-nhip khi nhịp lặng mà phát âm', cLechNhip.chanDoan.some(c => c.ma === 'lech-nhip'), JSON.stringify(cLechNhip.chanDoan));

  const cLoNhip = ChamHoc.cham(manMau, { chinh: ['note(1)', 'wait()', 'wait()', 'wait()'] }, []);
  kiem('Chẩn đoán lo-nhip khi nhịp cần phát mà im lặng', cLoNhip.chanDoan.some(c => c.ma === 'lo-nhip'), JSON.stringify(cLoNhip.chanDoan));

  const cChuaDu = ChamHoc.cham(manMau, { chinh: ['note(1)', 'wait()', 'wait()'] }, []);
  kiem('Chẩn đoán chua-du-dieu khi dừng sớm trước khi hết bản nhạc', cChuaDu.chanDoan.some(c => c.ma === 'chua-du-dieu'), JSON.stringify(cChuaDu.chanDoan));

  const cQuenWait = ChamHoc.cham(manMau, { chinh: ['note(1)'] }, []);
  kiem('Chẩn đoán quen-wait khi gọi note(1) mà quên wait()', cQuenWait.chanDoan.some(c => c.ma === 'quen-wait'), JSON.stringify(cQuenWait.chanDoan));

  const cGoiLai = ChamHoc.cham(manMau, { chinh: ['note(1)', 'note(2)', 'wait()', 'wait()', 'note(3)', 'wait()'] }, []);
  kiem('Chẩn đoán loa-goi-lai khi gọi 2 lệnh loa trong 1 nhịp', cGoiLai.chanDoan.some(c => c.ma === 'loa-goi-lai'), JSON.stringify(cGoiLai.chanDoan));
}

console.log('\n=== 4. Song tấu 2 bè (R1 + R2) & Bài nhạc Chúc mừng chiến thắng (9 đoạn = 72 nhịp) ===');
{
  // Nạp AmThanh trong ngữ cảnh giả để lấy DOAN_CHIEN_THANG
  const ctx = { window: { addEventListener: () => {} }, Math, Number, String, Array, Object, setTimeout, clearTimeout };
  ctx.globalThis = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(day, 'game', 'am-thanh.js'), 'utf8'), ctx);
  const AmThanh = ctx.window.AmThanh;
  const dsDoan = AmThanh && AmThanh.DOAN_CHIEN_THANG;

  kiem('AmThanh.DOAN_CHIEN_THANG có đúng 9 đoạn (Mùa 1..9, có Cảng sông)', Array.isArray(dsDoan) && dsDoan.length === 9, dsDoan && dsDoan.length);
  kiem('Đoạn 4 là Cảng sông (cang-song)', dsDoan && dsDoan[3] && dsDoan[3].ten === 'cang-song', JSON.stringify(dsDoan && dsDoan[3]));

  let moiDoan8Nhip = true;
  for (const d of (dsDoan || [])) {
    const r1 = SanHoc.docDieu(d.r1, true), r2 = SanHoc.docDieu(d.r2, true);
    if (r1.length !== 8 || r2.length !== 8) moiDoan8Nhip = false;
  }
  kiem('Mỗi đoạn trong 9 đoạn đều dài đúng 8 nhịp cho cả R1 và R2', moiDoan8Nhip);

  // Hàm chuyển chuỗi giai điệu thành lệnh note(n, so_nhip) / beat() / wait() tối ưu bằng 2 tham số
  function codeTuDieu(chuoi) {
    const arr = SanHoc.docDieu(chuoi, true);
    const dong = [];
    let i = 0;
    while (i < arr.length) {
      const am = arr[i];
      if (am === null) {
        dong.push('wait()');
        i++;
      } else if (am === 'x') {
        dong.push('beat()', 'wait()');
        i++;
      } else {
        let dai = 1;
        while (i + dai < arr.length && arr[i + dai] === am && dai < 8) dai++;
        dong.push(dai > 1 ? `note(${am}, ${dai})` : `note(${am})`, 'wait()');
        i += dai;
      }
    }
    return dong;
  }

  // Kiểm tra từng đoạn một trong SanHoc.chay (chế độ đội 2 robot)
  let tatCa9DoanThang = true;
  for (const d of dsDoan) {
    const kq = SanHoc.chay({
      san: ['######', '#....#', '######'],
      mucTieu: 'choi-dieu',
      dieu: { r1: d.r1, r2: d.r2 },
      doi: [
        { batDau: { x: 1, y: 1, huong: 1 }, hamGoc: ['wait', 'note', 'beat'] },
        { batDau: { x: 4, y: 1, huong: 3 }, hamGoc: ['wait', 'note', 'beat'] }
      ]
    }, [codeTuDieu(d.r1).join('\n'), codeTuDieu(d.r2).join('\n')]);
    if (!kq.thang || kq.nhip !== 8) tatCa9DoanThang = false;
  }
  kiem('Tất cả 9 đoạn chiến thắng đều chạy thắng độc lập bằng note(n, so_nhip) trên SanHoc.chay (2 robot)', tatCa9DoanThang);

  // Nối cả 9 đoạn thành Bài nhạc Chúc mừng chiến thắng (72 nhịp) và chấm bằng ChamHoc.cham
  const r1Full = dsDoan.reduce((a, d) => a.concat(d.r1), []);
  const r2Full = dsDoan.reduce((a, d) => a.concat(d.r2), []);
  const manDaiHopXuong = {
    ma: 'ngay-hoi.5', id: '9.5', ten: 'Khúc Khải Hoàn Đội Robot Chấn Hưng',
    san: ['######', '#....#', '######'],
    mucTieu: 'choi-dieu',
    dieu: { r1: r1Full, r2: r2Full },
    doi: [
      { batDau: { x: 1, y: 1, huong: 1 }, robot: { than: 'hai-banh', tay: 'loa' }, hamGoc: ['wait', 'note', 'beat'] },
      { batDau: { x: 4, y: 1, huong: 3 }, robot: { than: 'hai-banh', tay: 'loa' }, hamGoc: ['wait', 'note', 'beat'] }
    ],
    khung: { chinh: 160 },
    maMau: { doi: [{ chinh: [] }, { chinh: [] }], hamCuaMan: [] },
    sao: { o: 300, nhip: 72 }
  };
  const ketFull = ChamHoc.cham(manDaiHopXuong, {
    doi: [
      { chinh: codeTuDieu(r1Full) },
      { chinh: codeTuDieu(r2Full) }
    ],
    hamCuaMan: []
  }, []);
  kiem('Đại hợp xướng 9 đoạn (72 nhịp) thắng 3 sao trên ChamHoc.cham', ketFull.thang && ketFull.sao === 3 && ketFull.soNhip === 72, JSON.stringify({ thang: ketFull.thang, sao: ketFull.sao, soNhip: ketFull.soNhip, chanDoan: ketFull.chanDoan }));

  // Kiểm tra bắt lỗi khi R2 (Luna) đánh sai nốt trong màn song tấu
  const ketSaiR2 = ChamHoc.cham(manDaiHopXuong, {
    doi: [
      { chinh: codeTuDieu(r1Full) },
      { chinh: ['note(7)', 'wait()'] }
    ],
    hamCuaMan: []
  }, []);
  kiem('Song tấu 2 bè bắt đúng lỗi sai-not khi R2 đánh sai bè hòa âm', !ketSaiR2.thang && ketSaiR2.chanDoan.some(c => c.ma === 'sai-not' && c.xe === 1), JSON.stringify(ketSaiR2.chanDoan));
}

console.log('\n=== 5. Sổ lệnh & Bộ phận đèn ===');
{
  const tenGoc = SoLenh.lenhGoc.map(g => g.ten);
  kiem('SoLenh.lenhGoc có note và beat', tenGoc.includes('note') && tenGoc.includes('beat'), JSON.stringify(tenGoc));
  kiem('SoLenh.tenNhom có nhóm loa', SoLenh.tenNhom.loa === 'Loa');

  const ctxDen = { window: { BangMau: BM }, BangMau: BM };
  ctxDen.globalThis = ctxDen.window;
  vm.createContext(ctxDen);
  vm.runInContext(fs.readFileSync(path.join(day, 'game', 'den-bo-phan.js'), 'utf8'), ctxDen);
  const DenBoPhan = ctxDen.window.DenBoPhan;
  const bp = DenBoPhan.boPhanCuaMan({ loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait', 'note', 'beat'] });
  kiem('DenBoPhan.boPhanCuaMan nhận diện bộ phận loa', bp.includes('loa'), JSON.stringify(bp));
}

console.log('\n====================================');
console.log(`KẾT QUẢ KIỂM LOA: ${dat} đạt, ${hong} hỏng.`);
if (hong > 0) process.exit(1);

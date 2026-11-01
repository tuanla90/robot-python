/* ============================================================================
   kiem-mua-hang.mjs — Kiểm tra toàn diện cơ chế Mùa 8: Hang động đá vôi (mua-8)
   Chạy: node hoc/kiem-mua-hang.mjs
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const SoLenh = require(path.join(day, 'so-lenh.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); }
  else { hong++; console.log('  ✗ HỎNG ' + ten + (chiTiet ? '\n      ' + chiTiet : '')); }
}

console.log('=== 1. Thân Bánh gai (gai) + sàn đá ướt I + retract_spikes / extend_spikes ===');
{
  const sanDaUot = [
    '########',
    '#.II..F#',
    '########'
  ];
  // 1a. Bánh gai mặc định (gai = true): bước vào ô 'I' bám chắc từng ô, không trượt
  const kBam = SanHoc.chay({
    san: sanDaUot,
    batDau: { x: 1, y: 1, huong: 1 },
    loaiRobot: 'gai'
  }, 'left_move()\nright_move()\nwait()');
  kiem('Bánh gai mặc định (gai=true) bước vào ô I bám chắc ở (2,1), không trượt',
    kBam.robot.x === 2 && kBam.robot.y === 1 && kBam.gai === true,
    JSON.stringify(kBam.robot));

  // 1b. Xe bánh thường ('banh') bước vào ô 'I' trượt thẳng qua cả dải 'II' tới (4,1)
  const kBanhTruot = SanHoc.chay({
    san: sanDaUot,
    batDau: { x: 1, y: 1, huong: 1 },
    loaiRobot: 'banh'
  }, 'left_move()\nright_move()\nwait()');
  kiem('Xe bánh thường bước vào dải II trượt thẳng tới (4,1) trong 1 nhịp',
    kBanhTruot.robot.x === 4 && kBanhTruot.robot.y === 1 && kBanhTruot.nhip === 1,
    JSON.stringify(kBanhTruot.robot));

  // 1c. Chưa bật thuGai: gọi retract_spikes() báo lỗi lenh-chua-mo
  const kChuaMo = SanHoc.chay({
    san: sanDaUot,
    batDau: { x: 1, y: 1, huong: 1 },
    loaiRobot: 'gai'
  }, 'retract_spikes()\nwait()');
  kiem('Bánh gai chưa bật thuGai gọi retract_spikes() báo lỗi lenh-chua-mo',
    !!(kChuaMo.loi && kChuaMo.loi.ma === 'lenh-chua-mo'),
    JSON.stringify(kChuaMo.loi));

  // 1d. Bật thuGai: retract_spikes() thu gai + lăn vào dải 'II' trượt thẳng tới (4,1), rồi extend_spikes() bung gai đi từng ô tới F (6,1)
  const kThuBung = SanHoc.chay({
    san: [
      '########',
      '#.III.F#',
      '########'
    ],
    batDau: { x: 1, y: 1, huong: 1 },
    loaiRobot: 'gai',
    thuGai: true
  }, [
    'retract_spikes()',
    'left_move()',
    'right_move()',
    'wait()',
    'extend_spikes()',
    'left_move()',
    'right_move()',
    'wait()'
  ].join('\n'));
  kiem('retract_spikes() trượt qua 3 ô I tới (5,1) trong 1 nhịp, rồi extend_spikes() đi 1 ô tới cờ (6,1)',
    kThuBung.thang && kThuBung.nhip === 2 && kThuBung.robot.x === 6 && kThuBung.gai === true,
    JSON.stringify({ thang: kThuBung.thang, nhip: kThuBung.nhip, robot: kThuBung.robot, gai: kThuBung.gai }));

  // 1e. Trượt trên đá ướt gặp hố 'u' thì dừng ngay ở hố và rơi hố
  const kTruotHo = SanHoc.chay({
    san: [
      '########',
      '#.IIu.F#',
      '########'
    ],
    batDau: { x: 1, y: 1, huong: 1 },
    loaiRobot: 'gai',
    thuGai: true
  }, 'retract_spikes()\nleft_move()\nright_move()\nwait()');
  kiem('Thu gai trượt trên I gặp hố u thì rơi xuống hố (roi-ho)',
    !kTruotHo.thang && kTruotHo.dungSom === 'roi-ho' && kTruotHo.robot.x === 4,
    JSON.stringify({ dungSom: kTruotHo.dungSom, robot: kTruotHo.robot }));
}

console.log('\n=== 2. Ngách hang ngầm (ngachHang) ===');
{
  const sanNgach = [
    '#######',
    '#..#..#',
    '#.###F#',
    '#######'
  ];
  // Đi từ (1,1) sang (2,1) là miệng ngách a -> chui sang b ở (4,1), rồi tiến 1 ô sang (5,1), quay phải xuống (5,2) là F
  const kNgach = SanHoc.chay({
    san: sanNgach,
    batDau: { x: 1, y: 1, huong: 1 },
    loaiRobot: 'gai',
    ngachHang: [{ a: { x: 2, y: 1 }, b: { x: 4, y: 1 } }]
  }, [
    'left_move()', 'right_move()', 'wait()',   // bước vào (2,1) -> nhảy sang (4,1) (chỉ 1 lần trong nhịp)
    'left_move()', 'right_move()', 'wait()',   // từ (4,1) sang (5,1)
    'left_move()', 'wait()',                   // quay phải (hướng 2)
    'left_move()', 'right_move()', 'wait()'    // xuống (5,2) = F
  ].join('\n'));
  kiem('Ngách hang ngầm chui từ a (2,1) sang b (4,1) đúng 1 lần trong nhịp và tới cờ',
    kNgach.thang && kNgach.nhip === 4 && kNgach.vet.some(v => v.loai === 'nhip' && v.suKien.some(e => e.ma === 'qua-ngach')),
    JSON.stringify({ thang: kNgach.thang, nhip: kNgach.nhip, robot: kNgach.robot }));

  // Chiều ngược lại: đi vào b (4,1) chui ngược về a (2,1)
  const kNgachNguoc = SanHoc.chay({
    san: [
      '#######',
      '#F.#..#',
      '#######'
    ],
    batDau: { x: 5, y: 1, huong: 3 },
    loaiRobot: 'gai',
    ngachHang: [{ a: { x: 2, y: 1 }, b: { x: 4, y: 1 } }]
  }, [
    'left_move()', 'right_move()', 'wait()',   // vào (4,1) -> chui về (2,1)
    'left_move()', 'right_move()', 'wait()'    // từ (2,1) sang (1,1) = F
  ].join('\n'));
  kiem('Ngách hang ngầm chui 2 chiều: từ b (4,1) về a (2,1) rồi tới cờ (1,1)',
    kNgachNguoc.thang && kNgachNguoc.nhip === 2 && kNgachNguoc.robot.x === 1,
    JSON.stringify({ thang: kNgachNguoc.thang, nhip: kNgachNguoc.nhip, robot: kNgachNguoc.robot }));
}

console.log('\n=== 3. Chuông đá (chuongDa) + Cảm biến âm thanh hear() / listen() (phanAm) ===');
{
  const sanChuong = [
    '########',
    '#.....F#',
    '########'
  ];
  // 3a. hear() trả khoảng cách Manhattan tới chuông đá gần nhất; chưa bật phanAm thì listen() báo lỗi lenh-chua-mo
  const kHear = SanHoc.chay({
    san: sanChuong,
    batDau: { x: 1, y: 1, huong: 1 },
    loaiRobot: 'gai',
    camBien: [{ ma: 'am-thanh', o: 'tren' }],
    chuongDa: [{ x: 4, y: 1, not: 5, phamVi: 6 }]
  }, [
    'while hear() > 1:',
    '    left_move()',
    '    right_move()',
    '    wait()'
  ].join('\n'));
  kiem('hear() đo đúng khoảng cách Manhattan tới chuông đá (dừng ở (3,1) khi hear() == 1)',
    kHear.robot.x === 3 && kHear.robot.y === 1 && kHear.nhip === 2,
    JSON.stringify({ robot: kHear.robot, nhip: kHear.nhip }));

  const kListenChuaMo = SanHoc.chay({
    san: sanChuong,
    batDau: { x: 1, y: 1, huong: 1 },
    loaiRobot: 'gai',
    camBien: [{ ma: 'am-thanh', o: 'tren' }],
    chuongDa: [{ x: 2, y: 1, not: 5 }]
  }, 'n = listen()\nwait()');
  kiem('Chưa bật phanAm thì gọi listen() báo lỗi lenh-chua-mo',
    !!(kListenChuaMo.loi && kListenChuaMo.loi.ma === 'lenh-chua-mo'),
    JSON.stringify(kListenChuaMo.loi));

  // 3b. Bật phanAm: listen() trả đúng nốt 1..8 của chuông đá gần nhất (và 0 khi ngoài phamVi)
  const kListen = SanHoc.chay({
    san: sanChuong,
    batDau: { x: 1, y: 1, huong: 1 },
    loaiRobot: 'gai',
    tay: 'loa',
    camBien: [{ ma: 'am-thanh', o: 'tren' }],
    phanAm: true,
    mucTieu: 'choi-dieu',
    dieu: '57',
    chuongDa: [
      { x: 1, y: 1, not: 5, phamVi: 2 },
      { x: 4, y: 1, not: 7, phamVi: 2 }
    ]
  }, [
    'n1 = listen()',
    'for _ in range(3):',
    '    left_move()',
    '    right_move()',
    '    wait()',
    'n2 = listen()',
    'note(n1)',
    'wait()',
    'note(n2)',
    'wait()'
  ].join('\n'));
  kiem('listen() với phanAm: true đọc đúng nốt của từng chuông đá và phát lại thắng choi-dieu',
    kListen.thang && JSON.stringify(kListen.daChoi.map(x => x.am)) === JSON.stringify([5, 7]),
    JSON.stringify({ thang: kListen.thang, daChoi: kListen.daChoi, loi: kListen.loi }));
}

console.log('\n=== 4. Đá chuông cộng hưởng (daChuong) ===');
{
  const sanDaChuong = [
    '#######',
    '#....F#',
    '#######'
  ];
  // 4a. Khối đá chuông chưa vỡ chặn đường như tường
  const kChan = SanHoc.chay({
    san: sanDaChuong,
    batDau: { x: 1, y: 1, huong: 1 },
    loaiRobot: 'gai',
    tay: 'loa',
    daChuong: [{ x: 2, y: 1, not: 3, ben: 1 }]
  }, 'left_move()\nright_move()\nwait()');
  kiem('Đá chuông chưa vỡ ở (2,1) chặn robot (dam-tuong với vat="da-chuong")',
    kChan.robot.x === 1 && kChan.suKien.some(e => e.ma === 'dam-tuong' && e.vat === 'da-chuong'),
    JSON.stringify({ robot: kChan.robot, suKien: kChan.suKien }));

  // 4b. Phát đúng nốt cộng hưởng (ben: 1 và ben: 2 bằng note(n, 2)) làm vỡ đá chuông để đi tới cờ
  const kVo = SanHoc.chay({
    san: sanDaChuong,
    batDau: { x: 1, y: 1, huong: 1 },
    loaiRobot: 'gai',
    tay: 'loa',
    camBien: [{ ma: 'am-thanh', o: 'tren' }],
    phanAm: true,
    daChuong: [
      { x: 2, y: 1, not: 3, ben: 1 },
      { x: 4, y: 1, not: 6, ben: 2 }
    ]
  }, [
    'note(listen())',
    'wait()',
    'left_move()', 'right_move()', 'wait()',
    'left_move()', 'right_move()', 'wait()',
    'note(listen(), 2)',
    'wait()',
    'left_move()', 'right_move()', 'wait()',
    'left_move()', 'right_move()', 'wait()'
  ].join('\n'));
  kiem('Phát đúng nốt cộng hưởng phá vỡ cả đá chuông ben=1 và ben=2, mở đường tới cờ',
    kVo.thang && kVo.daChuong.every(d => d.daVo === true),
    JSON.stringify({ thang: kVo.thang, daChuong: kVo.daChuong, robot: kVo.robot }));
}

console.log('\n=== 5. Kết hợp dict & set với Mùa 8 trên SanHoc.chay và ChamHoc.cham ===');
{
  const manMua8 = {
    ma: 'hang-dong.test',
    id: '8.T',
    ten: 'Giải mã Chuông Đá bằng Dict & Set',
    san: [
      '########',
      '#.II..F#',
      '########'
    ],
    batDau: { x: 1, y: 1, huong: 1 },
    loaiRobot: 'gai',
    robot: {
      than: 'gai',
      tay: 'loa',
      camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }]
    },
    thuGai: true,
    phanAm: true,
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'retract_spikes', 'extend_spikes', 'note', 'beat', 'hear', 'listen'],
    chuongDa: [
      { x: 1, y: 1, not: 2, phamVi: 1 },
      { x: 4, y: 1, not: 5, phamVi: 1 }
    ],
    daChuong: [
      { x: 5, y: 1, not: 7, ben: 1 }
    ],
    khung: { chinh: 20, moiHam: 10 },
    maMau: { chinh: [], hamCuaMan: [] },
    sao: { o: 25, nhip: 8 }
  };

  const kqCham = ChamHoc.cham(manMua8, {
    chinh: [
      'bang_not = {2: 7, 5: 7}',
      'da_nghe = set()',
      'da_nghe.add(listen())',
      'retract_spikes()',
      'left_move()',
      'right_move()',
      'wait()',
      'n = listen()',
      'if n in bang_not and n not in da_nghe:',
      '    note(bang_not[n])',
      'extend_spikes()',
      'wait()',
      'for _ in range(2):',
      '    left_move()',
      '    right_move()',
      '    wait()'
    ],
    hamCuaMan: []
  }, []);

  kiem('ChamHoc.cham chạy mượt màn Mùa 8 kết hợp dict + set + bánh gai + loa + cảm biến âm thanh + đá chuông (3 sao)',
    kqCham.thang && kqCham.sao === 3 && kqCham.daChuong[0].daVo === true,
    JSON.stringify({ thang: kqCham.thang, sao: kqCham.sao, soNhip: kqCham.soNhip, chanDoan: kqCham.chanDoan }));

  const tenGoc = SoLenh.lenhGoc.map(x => x.ten);
  kiem('SoLenh.lenhGoc và KhoHam.HAM_GOC_MAC_DINH có đủ retract_spikes, extend_spikes, hear, listen, note, beat',
    ['retract_spikes', 'extend_spikes', 'hear', 'listen', 'note', 'beat'].every(t => tenGoc.includes(t) && KhoHam.HAM_GOC_MAC_DINH.includes(t)));
}

console.log('\n====================================');
console.log(`KẾT QUẢ KIỂM MÙA 8 (HANG ĐỘNG): ${dat} đạt, ${hong} hỏng.`);
if (hong > 0) process.exit(1);

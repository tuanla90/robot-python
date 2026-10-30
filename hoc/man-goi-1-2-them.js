/* ============================================================================
   man-goi-1-2-them.js — "Robot Chấn Hưng": MÀN MỚI cho mùa 1, gói 1 "Xe hai bánh" và gói 2 "Tay gắp" (brief SM1-B, 30/10).
   Nghiệm thu độc lập mùa 1 (hoc/ban-giao/nghiem-thu-30-10/nghiem-thu-mua-1.md, Đề xuất 4, 6, 8).
   - hai-banh.11 "Quay đầu, đi hai ô" (chương hai-banh): thay hai-banh.6 "Chữ L ngược" (trùng ý với hai-banh.5 "Chữ L", cất). Quay đầu (hai lần
     quay một bánh) rồi tiến hai ô: 4 nhịp, chương trình vừa đủ 10 ô (khung chính). Đứng sau hai-banh.7 "Quay đầu" (3 nhịp, 7 ô) để chương có một
     màn "lấp đầy khung" trước trùm hai-banh.10 (viết lại trong lo-trinh-hoc.js: 4 nhịp, 10 ô, rẽ phải rồi rẽ trái, dòng bị xáo).
   - vong-lap.11 "Lặp trong lặp" (chương vong-lap): MÀN TRÌNH DIỄN vòng for lồng (chiChay, chương trình khoá, bấm Chạy là thấy), đứng ngay trước
     vong-lap.9 "Vòng lặp lồng nhau" (trước đây for lồng xuất hiện lần đầu ở vong-lap.9 với mã mẫu rỗng, cùng lúc mang thùng). Không tay kẹp, không thùng:
     một màn một điều mới. Hành lang chữ U úp ngược ba đoạn bốn ô (vong-lap.9 là năm ô và mang thùng). Chỗ trong chương: vong-lap.5 "Bậc thang" cất.
   Mã là mã MỚI (không trùng màn nào trong ngân hàng, kể cả màn đã cất).
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manGoi12Them, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  // ba dòng "tiến một ô", hai dòng "quay phải", hai dòng "quay trái" (như man-chuoi-1.js)
  var TIEN = ['left_move()', 'right_move()', 'wait()'];
  var QUAY_PHAI = ['left_move()', 'wait()'];
  var QUAY_TRAI = ['right_move()', 'wait()'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  /** Màn chương hai-banh: như man-chuoi-1.js (chỉ lệnh bánh, khung 10 ô, chưa mở Xưởng hàm, cấm hàm của em). */
  function hb(m) {
    m.chuong = 'hai-banh';
    m.loaiRobot = 'banh'; m.hamGoc = ['left_move', 'right_move', 'wait']; m.khung = { chinh: 10, moiHam: 10 };
    m.moXuong = false; m.camHamCuaEm = true;
    return ManHoc.chuanHoa(m);
  }

  /** Màn chương vong-lap: như man-vong-lap.js (bánh + 4 lệnh tay, Xưởng mở, được dùng hàm của em, khung 10 ô, cấu trúc for). */
  function vl(m) {
    m.chuong = 'vong-lap';
    m.cauTruc = ['for'];
    m.loaiRobot = 'banh'; m.hamGoc = ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    return ManHoc.chuanHoa(m);
  }
  var LONG = ['for i in range(3):', '    turn_right()', '    for j in range(4):', '        move()'];      // lệnh nào cũng chạy, xe dừng đúng ở cờ (không dư lệnh rẽ cuối)

  var DS = [
    hb({
      so: 11, ten: 'Quay đầu, đi hai ô', hang: 'bien-the',
      deBai: 'Lá cờ ở phía sau xe, cách hai ô; hai bên xe là tường. Đưa xe tới cờ.',
      san: ['.#.#.', '.#.#.', '..F..', '.....', '.....'],
      batDau: { x: 2, y: 0, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 10, nhip: 4 },
      loiGiai: { chinh: nhieu(QUAY_PHAI, QUAY_PHAI, TIEN, TIEN) },
      loiSai: [
        { moTa: 'Quay đầu rồi chỉ tiến một ô', baiLam: { chinh: nhieu(QUAY_PHAI, QUAY_PHAI, TIEN) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Mới quay một góc vuông rồi đi: đâm tường', baiLam: { chinh: nhieu(QUAY_PHAI, TIEN, TIEN) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Thêm một dòng chú thích: quá 10 ô', baiLam: { chinh: nhieu(['# quay đầu'], QUAY_PHAI, QUAY_PHAI, TIEN, TIEN) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Quay đầu là hai lần quay về cùng một phía.', 'Bài này vừa khít 10 ô: không còn chỗ cho dòng thừa nào.']
    }),
    vl({
      so: 11, ten: 'Lặp trong lặp', hang: 'bien-the', chiChay: true, chinhCoDinh: true, canFor: 'tran-khung', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Hành lang hình chữ U úp ngược có ba đoạn, đoạn nào cũng là "rẽ phải rồi đi bốn ô". Vòng for bên trong (for j) cho xe đi bốn ô; vòng for bên ngoài (for i) lặp cả cụm đó ba lần. Bấm Chạy xem xe tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá: vòng for j nằm trong thân vòng for i, thụt vào thêm một bậc. Bấm Chạy.',
      san: ['.....', '.###.', '.###.', '.###.', '.###F'],
      batDau: { x: 0, y: 4, huong: 3 },
      maMau: { chinh: LONG.slice() },
      sao: { o: 9, nhip: 15 },
      loiGiai: { chinh: LONG.slice() },
      loiSai: [],
      goiY: ['move() chỉ viết một lần mà chạy mười hai lần: bốn lần mỗi đoạn, ba đoạn.', 'Màn sau em tự viết hai vòng for lồng nhau, mang theo một thùng.']
    })
  ];

  ManHoc.manGoi12Them = DS;
  if (laNode) module.exports = ManHoc;
})();

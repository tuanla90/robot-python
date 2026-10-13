/* ============================================================================
   man-chuoi-1.js — "Đường học": CHUỖI 1 · HAI BÁNH (10 màn, chỉ cột CHÍNH, 8 ô).
   Hàm gốc: left_move, right_move, wait. Chưa có left_back / right_back.
   Gộp vào window.ManHoc (xem man-chuoi-2.js để nối tiếp chuỗi 2).

   Mỗi màn: id, ten, hang, deBai, san, batDau, loaiRobot, hamGoc, thuVien, khung,
            maMau, sao, loiGiai, loiSai[{moTa, baiLam, phaiCoMa}], goiY.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);

  var HAM_GOC = ['left_move', 'right_move', 'wait'];
  var KHUNG = { chinh: 8, ham: 0 };

  // ba dòng "tiến một ô", hai dòng "quay phải", hai dòng "quay trái"
  var TIEN = ['left_move()', 'right_move()', 'wait()'];
  var QUAY_PHAI = ['left_move()', 'wait()'];
  var QUAY_TRAI = ['right_move()', 'wait()'];

  function man(m) {
    m.loaiRobot = 'banh'; m.hamGoc = HAM_GOC; m.thuVien = []; m.khung = m.khung || KHUNG;
    return m;
  }

  var DS = [
    man({
      id: '1.1', ten: 'Bước đầu tiên', hang: 'lam-quen',
      deBai: 'Xe hai bánh đứng ngay trước lá cờ. Chương trình đã viết sẵn, bấm chạy xem xe làm gì.',
      san: ['.....', '.....', '.....', '..F..', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: TIEN.slice() },
      sao: { o: 3, nhip: 1 },
      loiGiai: { chinh: TIEN.slice() },
      loiSai: [
        { moTa: 'Ra lệnh cho hai bánh nhưng quên wait()', baiLam: { chinh: ['left_move()', 'right_move()'] },
          phaiCoMa: ['quen-wait', 'chua-toi-co'] }
      ],
      goiY: ['Mỗi nhịp phải kết thúc bằng wait(); chưa có wait() thì bánh chưa quay.',
        'Hai bánh cùng quay tới thì xe tiến lên một ô.']
    }),

    man({
      id: '1.2', ten: 'Hai bước', hang: 'lam-quen',
      deBai: 'Lá cờ cách xe hai ô. Chương trình có sẵn mới đưa xe đi được một ô.',
      san: ['.....', '.....', '..F..', '.....', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: TIEN.slice() },
      sao: { o: 6, nhip: 2 },
      loiGiai: { chinh: TIEN.concat(TIEN) },
      loiSai: [
        { moTa: 'Mới tiến một ô, xe dừng giữa đường', baiLam: { chinh: TIEN.slice() },
          phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hai lệnh cho cùng một bánh trong một nhịp', baiLam: { chinh: ['left_move()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()'] },
          phaiCoMa: ['banh-goi-lai'] }
      ],
      goiY: ['Một nhịp xe chỉ đi được một ô.', 'Cần bao nhiêu nhịp để tới cờ?']
    }),

    man({
      id: '1.3', ten: 'Đố: rẽ phải', hang: 'lam-quen',
      deBai: 'Lá cờ nằm bên phải xe. Chạy thử chương trình có sẵn, xem nó làm xe xoay thế nào rồi viết tiếp.',
      san: ['.....', '.....', '.....', '.F...', '.....'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: { chinh: QUAY_PHAI.slice() },
      sao: { o: 5, nhip: 2 },
      loiGiai: { chinh: QUAY_PHAI.concat(TIEN) },
      loiSai: [
        { moTa: 'Chỉ quay, quên tiến', baiLam: { chinh: QUAY_PHAI.slice() }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quay nhầm sang trái rồi đi thẳng ra ngoài sân',
          baiLam: { chinh: QUAY_TRAI.concat(TIEN) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Chạy thử mẫu có sẵn: xe quay về phía nào?', 'Sau khi quay xong, xe còn phải đi tới cờ.']
    }),

    man({
      id: '1.4', ten: 'Rẽ trái', hang: 'luyen',
      deBai: 'Lá cờ nằm bên trái xe. Bánh nào quay thì xe rẽ trái? Tự suy ra rồi viết.',
      san: ['.....', '.....', '.....', '.F...', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 5, nhip: 2 },
      loiGiai: { chinh: QUAY_TRAI.concat(TIEN) },
      loiSai: [
        { moTa: 'Dùng nhầm bánh: xe quay ngược sang phải rồi đi lệch cờ',
          baiLam: { chinh: QUAY_PHAI.concat(TIEN) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Ở màn trước, cho bánh trái tiến thì xe rẽ phải. Còn bánh phải thì sao?']
    }),

    man({
      id: '1.5', ten: 'Chữ L', hang: 'luyen',
      deBai: 'Đi một ô lên trên, rẽ phải, rồi đi tiếp một ô tới cờ. Chương trình vừa khít 8 dòng.',
      san: ['.....', '.#...', '..F..', '.....', '.....'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 8, nhip: 3 },
      loiGiai: { chinh: TIEN.concat(QUAY_PHAI, TIEN) },
      loiSai: [
        { moTa: 'Rẽ xong quên đi tiếp', baiLam: { chinh: TIEN.concat(QUAY_PHAI) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên wait() sau lệnh quay: lệnh quay dính sang nhịp sau, xe đi thẳng đâm tường',
          baiLam: { chinh: TIEN.concat(['left_move()'], TIEN) }, phaiCoMa: ['banh-goi-lai', 'dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Mỗi đoạn là một nhịp: đi, rẽ, đi.', 'Đếm dòng: không được vượt quá 8 ô.']
    }),

    man({
      id: '1.6', ten: 'Chữ L ngược', hang: 'luyen',
      deBai: 'Lần này xe quay mặt sang phải ngay từ đầu. Đi một ô, rẽ trái, đi tiếp một ô.',
      san: ['.....', '.....', '..F#.', '.....', '.....'],
      batDau: { x: 1, y: 3, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 8, nhip: 3 },
      loiGiai: { chinh: TIEN.concat(QUAY_TRAI, TIEN) },
      loiSai: [
        { moTa: 'Rẽ nhầm sang phải: xe đi xuống thay vì lên',
          baiLam: { chinh: TIEN.concat(QUAY_PHAI, TIEN) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['"Trái" và "phải" tính theo hướng xe đang quay mặt, không theo màn hình.']
    }),

    man({
      id: '1.7', ten: 'Quay đầu', hang: 'bien-the',
      deBai: 'Lá cờ ở ngay phía sau xe, hai bên là tường. Xe phải quay lại trước khi đi.',
      san: ['.#.#.', '..F..', '.....', '.....', '.....'],
      batDau: { x: 2, y: 0, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 7, nhip: 3 },
      loiGiai: { chinh: QUAY_PHAI.concat(QUAY_PHAI, TIEN) },
      loiSai: [
        { moTa: 'Cứ tiến thẳng, đâm ra khỏi sân', baiLam: { chinh: TIEN.slice() }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Mới quay một góc vuông rồi đi: đâm tường',
          baiLam: { chinh: QUAY_PHAI.concat(TIEN) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Một lần quay xoay xe 90 độ. Quay đầu cần xoay bao nhiêu độ?']
    }),

    man({
      id: '1.8', ten: 'Lạch bạch', hang: 'bien-the',
      deBai: 'Chương trình này làm xe quay qua quay lại tại chỗ, không tiến. Sửa lại cho xe tới cờ.',
      san: ['.....', '.....', '..F..', '.....', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: ['left_move()', 'wait()', 'right_move()', 'wait()'] },
      sao: { o: 3, nhip: 1 },
      loiGiai: { chinh: TIEN.slice() },
      loiSai: [
        { moTa: 'Không sửa gì: xe vẫn lạch bạch',
          baiLam: { chinh: ['left_move()', 'wait()', 'right_move()', 'wait()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thêm cặp lệnh hai bánh nhưng quên wait() ở cuối',
          baiLam: { chinh: ['left_move()', 'wait()', 'right_move()', 'wait()', 'left_move()', 'right_move()'] },
          phaiCoMa: ['quen-wait', 'chua-toi-co'] }
      ],
      goiY: ['Xe chỉ tiến khi cả hai bánh cùng quay trong CÙNG một nhịp.']
    }),

    man({
      id: '1.9', ten: 'Băng chuyền', hang: 'bien-the',
      deBai: 'Ba ô băng chuyền chạy sang phải sẽ đẩy xe đi. Đứng chờ trên băng cũng có thể tới cờ.',
      san: ['.....', '.....', '.....', '>>>F.', '.....'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 8, nhip: 6 },
      loiGiai: { chinh: TIEN.concat(['wait()', 'wait()', 'wait()', 'wait()', 'wait()']) },
      loiSai: [
        { moTa: 'Cố tự lái dọc băng: không đủ ô',
          baiLam: { chinh: TIEN.concat(QUAY_PHAI, TIEN, TIEN) }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Chờ chưa đủ lâu, băng chưa đưa tới cờ',
          baiLam: { chinh: TIEN.concat(['wait()', 'wait()', 'wait()']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Cứ hai nhịp đứng trên băng, băng đẩy xe một ô.', 'Đếm xem phải chờ bao nhiêu nhịp.']
    }),

    man({
      id: '1.10', ten: 'Thuận hay nghịch', hang: 'trum',
      deBai: 'Hai cột băng chuyền: một cột chạy xuống, một cột chạy lên. Chọn cột nào để băng đưa xe tới cờ?',
      san: ['.....', 'v....', 'vF...', 'v^...', '.^...'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 8, nhip: 5 },
      loiGiai: { chinh: QUAY_PHAI.concat(TIEN, ['wait()', 'wait()', 'wait()']) },
      loiSai: [
        { moTa: 'Lao thẳng vào băng ngược chiều: bị đẩy lùi, không tới được',
          baiLam: { chinh: TIEN.concat(TIEN, QUAY_PHAI) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Cố lái qua băng bằng tay: hết ô',
          baiLam: { chinh: TIEN.concat(TIEN, TIEN, QUAY_PHAI, TIEN) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Đi cùng chiều băng thì băng giúp xe; đi ngược chiều thì băng kéo xe lại.']
    })
  ];

  var ManHoc = (typeof window !== 'undefined' && window.ManHoc) || { danhSach: [] };
  ManHoc.danhSach = ManHoc.danhSach || [];
  ManHoc.them = ManHoc.them || function (ds) { ds.forEach(function (m) { ManHoc.danhSach.push(m); }); };
  ManHoc.tim = ManHoc.tim || function (id) { return ManHoc.danhSach.filter(function (m) { return m.id === id; })[0] || null; };
  ManHoc.them(DS);

  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

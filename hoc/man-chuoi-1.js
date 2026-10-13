/* ============================================================================
   man-chuoi-1.js — "Đường học": CHUỖI 1 · HAI BÁNH (10 màn, chỉ có chương trình 10 ô,
   chưa mở Xưởng hàm: moXuong false). Hàm gốc: left_move, right_move, wait. Chưa có
   left_back / right_back. Kho hàm của em chưa có gì, và các màn cấm hàm của em
   (camHamCuaEm true) để ai chơi lại chuỗi này cũng không dùng hàm đã tạo ở chuỗi sau.
   Gộp vào window.ManHoc (xem man-chuoi-2.js để nối tiếp chuỗi 2).

   Mỗi màn: id, ten, hang, deBai (mục tiêu, luôn đúng), veMaMau (nói về code có sẵn, chỉ hiện
            khi bài làm còn là code mẫu), san, batDau, loaiRobot, hamGoc, moXuong, camHamCuaEm,
            khung, maMau { chinh, hamCuaMan }, hamCuaEmCan [tên], taoHam [tên],
            sao { o, nhip }, loiGiai { chinh, hamCuaMan, hamCuaEmMoi },
            loiGiaiKhac (từ 1.3), loiSai [{ moTa, baiLam, hamCuaEmMoi, phaiCoMa }], goiY.
   - hamCuaEmCan: các hàm của em màn này giả định học sinh đã có (kho lúc tới màn).
   - taoHam: các hàm màn này là nơi học sinh LẦN ĐẦU tạo.
   - loiGiai.hamCuaEmMoi: hàm của em học sinh tạo hoặc sửa ở màn này (trộn vào kho khi chấm).
     loiGiaiKhac / loiSai cũng có hamCuaEmMoi (mặc định rỗng) — trộn vào kho theo tên.
   - sao.o: số ô của lời giải GỌN (3 sao) = ô chương trình + thân các hàm thực sự được gọi.
     sao.nhip: số nhịp của đường NGẮN NHẤT (máy kiểm dò bằng BFS để chắc không có đường tắt).
   - loiGiaiKhac: một lời giải khác vừa khung, cùng số nhịp, nhiều ô hơn → đúng 2 sao.
   - huyHieu (màn trùm): thắng thì nhận huy hiệu. Trùm KHÔNG mở khóa gì khác.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   Dòng chú thích (#) cũng là một ô.
   Hai màn cuối là LUYỆN SỬA CODE: 1.9 maMau đầy 10 ô, lời giải = xóa 2 dòng thừa; 1.10 maMau bị
   xáo thứ tự + 1 dòng thừa, lời giải = kéo đổi chỗ + xóa. (Máy kiểm: lời giải là dãy con / hoán vị
   của tập con của maMau.) Hai màn băng chuyền cũ nằm ở man-bang-chuyen.js, chờ chương riêng.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);

  var HAM_GOC = ['left_move', 'right_move', 'wait'];
  var KHUNG = { chinh: 10, moiHam: 10 };

  // ba dòng "tiến một ô", hai dòng "quay phải", hai dòng "quay trái"
  var TIEN = ['left_move()', 'right_move()', 'wait()'];
  var QUAY_PHAI = ['left_move()', 'wait()'];
  var QUAY_TRAI = ['right_move()', 'wait()'];
  function lap(ds, n) { var kq = []; for (var i = 0; i < n; i++) kq = kq.concat(ds); return kq; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  /** Điền các trường mặc định (hàm của màn rỗng, hàm của em rỗng…) cho dữ liệu viết gọn. */
  function chuanHoaMan(m) {
    function bai(b) { if (!b.hamCuaMan) b.hamCuaMan = []; return b; }
    bai(m.maMau);
    bai(m.loiGiai);
    if (!m.loiGiai.hamCuaEmMoi) m.loiGiai.hamCuaEmMoi = [];
    if (m.loiGiaiKhac) {
      bai(m.loiGiaiKhac.baiLam);
      if (!m.loiGiaiKhac.hamCuaEmMoi) m.loiGiaiKhac.hamCuaEmMoi = [];
    }
    m.loiSai.forEach(function (ls) {
      bai(ls.baiLam);
      if (!ls.hamCuaEmMoi) ls.hamCuaEmMoi = [];
    });
    if (!m.hamCuaEmCan) m.hamCuaEmCan = [];
    if (!m.taoHam) m.taoHam = [];
    return m;
  }

  function man(m) {
    m.loaiRobot = 'banh'; m.hamGoc = HAM_GOC; m.khung = KHUNG;
    m.moXuong = false; m.camHamCuaEm = true;
    return chuanHoaMan(m);
  }

  var DS = [
    man({
      id: '1.1', ten: 'Bước đầu tiên', hang: 'lam-quen',
      deBai: 'Xe hai bánh đứng ngay trước lá cờ. Đưa xe tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn, bấm Chạy xem xe làm gì.',
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
      id: '1.2', ten: 'Ba bước', hang: 'lam-quen',
      deBai: 'Lá cờ cách xe ba ô. Đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn mới đưa xe đi được một ô.',
      san: ['.....', '..F..', '.....', '.....', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: TIEN.slice() },
      sao: { o: 9, nhip: 3 },
      loiGiai: { chinh: lap(TIEN, 3) },
      loiSai: [
        { moTa: 'Mới tiến một ô, xe dừng giữa đường', baiLam: { chinh: TIEN.slice() }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hai lệnh cho cùng một bánh trong một nhịp',
          baiLam: { chinh: nhieu(['left_move()', 'left_move()', 'right_move()', 'wait()'], TIEN, TIEN) }, phaiCoMa: ['banh-goi-lai'] },
        { moTa: 'Đi từng ô bằng tay đến bốn lần: hết ô', baiLam: { chinh: lap(TIEN, 4) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Một nhịp xe chỉ đi được một ô.', 'Cần bao nhiêu nhịp để tới cờ?']
    }),

    man({
      id: '1.3', ten: 'Đố: rẽ phải', hang: 'lam-quen',
      deBai: 'Lá cờ nằm bên phải xe. Đưa xe tới cờ.',
      veMaMau: 'Chạy thử chương trình có sẵn, xem nó làm xe xoay thế nào rồi viết tiếp.',
      san: ['.....', '.....', '.....', '..F..', '.....'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: { chinh: QUAY_PHAI.slice() },
      sao: { o: 8, nhip: 3 },
      loiGiai: { chinh: nhieu(QUAY_PHAI, lap(TIEN, 2)) },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, thêm hai dòng chú thích',
        baiLam: { chinh: nhieu(['# quay phải'], QUAY_PHAI, ['# đi hai ô'], lap(TIEN, 2)) }
      },
      loiSai: [
        { moTa: 'Chỉ quay, quên tiến', baiLam: { chinh: QUAY_PHAI.slice() }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quay nhầm sang trái rồi đi thẳng ra ngoài sân',
          baiLam: { chinh: nhieu(QUAY_TRAI, lap(TIEN, 2)) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Chạy thử mẫu có sẵn: xe quay về phía nào?', 'Sau khi quay xong, xe còn phải đi tới cờ.']
    }),

    man({
      id: '1.4', ten: 'Rẽ trái', hang: 'luyen',
      deBai: 'Lá cờ nằm bên trái xe, cách hai ô. Bánh nào quay thì xe rẽ trái? Tự suy ra rồi viết.',
      san: ['.....', '.....', '.....', '.F...', '.....'],
      batDau: { x: 3, y: 3, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 8, nhip: 3 },
      loiGiai: { chinh: nhieu(QUAY_TRAI, lap(TIEN, 2)) },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, thêm hai dòng chú thích',
        baiLam: { chinh: nhieu(['# rẽ trái'], QUAY_TRAI, ['# đi hai ô'], lap(TIEN, 2)) }
      },
      loiSai: [
        { moTa: 'Dùng nhầm bánh: xe quay ngược sang phải rồi đi ra ngoài sân',
          baiLam: { chinh: nhieu(QUAY_PHAI, lap(TIEN, 2)) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Ở màn trước, cho bánh trái tiến thì xe rẽ phải. Còn bánh phải thì sao?']
    }),

    man({
      id: '1.5', ten: 'Chữ L', hang: 'luyen',
      deBai: 'Đi một ô lên trên, rẽ phải, rồi đi tiếp một ô tới cờ.',
      san: ['.....', '.#...', '..F..', '.....', '.....'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 8, nhip: 3 },
      loiGiai: { chinh: nhieu(TIEN, QUAY_PHAI, TIEN) },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, ghi chú từng đoạn',
        baiLam: { chinh: nhieu(['# đi'], TIEN, QUAY_PHAI, TIEN, ['# tới cờ']) }
      },
      loiSai: [
        { moTa: 'Rẽ xong quên đi tiếp', baiLam: { chinh: nhieu(TIEN, QUAY_PHAI) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên wait() sau lệnh quay: lệnh quay dính sang nhịp sau, xe đi thẳng đâm tường',
          baiLam: { chinh: nhieu(TIEN, ['left_move()'], TIEN) }, phaiCoMa: ['banh-goi-lai', 'dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Mỗi đoạn là một nhịp: đi, rẽ, đi.', 'Đếm dòng: chương trình có 10 ô.']
    }),

    man({
      id: '1.6', ten: 'Chữ L ngược', hang: 'luyen',
      deBai: 'Lần này xe quay mặt sang phải ngay từ đầu. Đi một ô, rẽ trái, đi tiếp một ô.',
      san: ['.....', '.....', '..F#.', '.....', '.....'],
      batDau: { x: 1, y: 3, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 8, nhip: 3 },
      loiGiai: { chinh: nhieu(TIEN, QUAY_TRAI, TIEN) },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, ghi chú từng đoạn',
        baiLam: { chinh: nhieu(['# đi'], TIEN, QUAY_TRAI, TIEN, ['# tới cờ']) }
      },
      loiSai: [
        { moTa: 'Rẽ nhầm sang phải: xe đi xuống thay vì lên',
          baiLam: { chinh: nhieu(TIEN, QUAY_PHAI, TIEN) }, phaiCoMa: ['chua-toi-co'] }
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
      loiGiai: { chinh: nhieu(QUAY_PHAI, QUAY_PHAI, TIEN) },
      loiGiaiKhac: {
        moTa: 'Quay đầu bằng hai lần quay trái, có chú thích',
        baiLam: { chinh: nhieu(['# quay đầu'], QUAY_TRAI, QUAY_TRAI, ['# tiến'], TIEN) }
      },
      loiSai: [
        { moTa: 'Cứ tiến thẳng, đâm ra khỏi sân', baiLam: { chinh: TIEN.slice() }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Mới quay một góc vuông rồi đi: đâm tường',
          baiLam: { chinh: nhieu(QUAY_PHAI, TIEN) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Một lần quay xoay xe 90 độ. Quay đầu cần xoay bao nhiêu độ?']
    }),

    man({
      id: '1.8', ten: 'Lạch bạch', hang: 'bien-the',
      deBai: 'Lá cờ ở ngay phía trước, cách xe hai ô. Đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn làm xe quay qua quay lại tại chỗ, không tiến. Sửa lại cho đúng.',
      san: ['.....', '.....', '..F..', '.....', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: ['left_move()', 'wait()', 'right_move()', 'wait()'] },
      sao: { o: 6, nhip: 2 },
      loiGiai: { chinh: lap(TIEN, 2) },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, ghi chú từng ô',
        baiLam: { chinh: nhieu(['# ô thứ nhất'], TIEN, ['# ô thứ hai'], TIEN) }
      },
      loiSai: [
        { moTa: 'Không sửa gì: xe vẫn lạch bạch',
          baiLam: { chinh: ['left_move()', 'wait()', 'right_move()', 'wait()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Tiến một ô, ô thứ hai quên wait() ở cuối',
          baiLam: { chinh: nhieu(TIEN, ['left_move()', 'right_move()']) }, phaiCoMa: ['quen-wait', 'chua-toi-co'] }
      ],
      goiY: ['Xe chỉ tiến khi cả hai bánh cùng quay trong CÙNG một nhịp.']
    }),

    man({
      id: '1.9', ten: 'Dọn dòng thừa', hang: 'bien-the',
      deBai: 'Xe đang quay mặt sang trái. Đi một ô thẳng, rẽ trái rồi đi tiếp một ô tới cờ.',
      veMaMau: 'Chương trình có sẵn đã đầy 10 ô và có hai dòng thừa. Chạy thử để tìm ra chúng. Xóa một dòng: kéo nó vào thùng rác, hoặc rê chuột lên số dòng rồi bấm ✕ (điện thoại: chạm hai lần vào dòng).',
      san: ['.....', '.#...', '..F..', '.....', '.....'],
      batDau: { x: 3, y: 1, huong: 3 },
      // tiến, wait() thừa, left_move() thừa dính vào lệnh rẽ (hai bánh cùng quay: xe tiến thay vì rẽ), rẽ trái, tiến
      maMau: { chinh: nhieu(TIEN, ['wait()'], ['left_move()'], QUAY_TRAI, TIEN) },
      sao: { o: 8, nhip: 3 },
      loiGiai: { chinh: nhieu(TIEN, QUAY_TRAI, TIEN) },
      loiGiaiKhac: {
        moTa: 'Xóa hai dòng thừa, thêm hai dòng chú thích',
        baiLam: { chinh: nhieu(['# đi một ô'], TIEN, ['# rẽ trái'], QUAY_TRAI, TIEN) }
      },
      loiSai: [
        { moTa: 'Chỉ xóa wait() thừa: left_move() thừa vẫn làm xe không rẽ mà đâm tường',
          baiLam: { chinh: nhieu(TIEN, ['left_move()'], QUAY_TRAI, TIEN) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ xóa left_move() thừa: xe tới cờ nhưng chậm một nhịp vì còn wait() thừa',
          baiLam: { chinh: nhieu(TIEN, ['wait()'], QUAY_TRAI, TIEN) }, phaiCoMa: [] }
      ],
      goiY: ['Chạy thử, xem xe sai ở nhịp nào rồi nhìn các dòng của nhịp đó.',
        'Xe rẽ khi chỉ một bánh quay, và tiến khi cả hai bánh cùng quay.']
    }),

    man({
      id: '1.10', ten: 'Xếp lại cho đúng', hang: 'trum',
      deBai: 'Xe đang quay mặt sang phải. Đi một ô thẳng, rẽ phải rồi đi tiếp một ô tới cờ.',
      veMaMau: 'Các dòng có sẵn bị xáo trộn và thừa một dòng. Nhấn giữ một dòng rồi kéo lên hoặc xuống để đổi chỗ.',
      san: ['.....', '..#..', '#F...', '.....', '.....'],
      batDau: { x: 0, y: 1, huong: 1 },
      huyHieu: { ma: 'hai-banh', ten: 'Huy hiệu Hai bánh' },
      // lệnh rẽ bị kéo lên đầu; wait() thừa chen giữa hai lệnh bánh của lần tiến cuối (xe lạch bạch như ở 1.8)
      maMau: { chinh: nhieu(QUAY_PHAI, TIEN, ['left_move()', 'wait()', 'right_move()', 'wait()']) },
      sao: { o: 8, nhip: 3 },
      loiGiai: { chinh: nhieu(TIEN, QUAY_PHAI, TIEN) },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, ghi chú từng đoạn',
        baiLam: { chinh: nhieu(['# đi'], TIEN, ['# rẽ phải'], QUAY_PHAI, TIEN) }
      },
      loiSai: [
        { moTa: 'Xóa wait() thừa nhưng chưa xếp lại: xe rẽ trước khi tiến, đâm tường',
          baiLam: { chinh: nhieu(QUAY_PHAI, TIEN, TIEN) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Xếp lại đúng nhưng quên xóa wait() thừa: xe lạch bạch trước cờ',
          baiLam: { chinh: nhieu(TIEN, QUAY_PHAI, ['left_move()', 'wait()', 'right_move()', 'wait()']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Chạy thử và so từng nhịp của xe với đường cần đi.',
        'Một nhịp gồm các lệnh bánh rồi wait(). Nhịp nào cũng phải đúng việc và đúng chỗ.']
    })
  ];

  var ManHoc = (typeof window !== 'undefined' && window.ManHoc) || { danhSach: [] };
  ManHoc.danhSach = ManHoc.danhSach || [];
  ManHoc.them = ManHoc.them || function (ds) { ds.forEach(function (m) { ManHoc.danhSach.push(m); }); };
  ManHoc.tim = ManHoc.tim || function (id) { return ManHoc.danhSach.filter(function (m) { return m.id === id; })[0] || null; };
  ManHoc.chuanHoa = ManHoc.chuanHoa || chuanHoaMan;
  ManHoc.them(DS);

  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

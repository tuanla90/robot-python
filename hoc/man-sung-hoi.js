/* ============================================================================
   man-sung-hoi.js — "Mật Lệnh Robot": CHƯƠNG `sung-hoi` · VÒI PHUN (10 màn, gói 2 mùa 2).
   29/10 (user chốt "phun nhẹ là mặc định, lực mạnh mở khoá ở gói 6"): chương dựng lại theo PHUN NHẸ. Cú giật, thùng sau lưng, thùng đi băng chuyển sang gói 6 Lực phun.
   Robot là XE HAI BÁNH gắn VÒI PHUN hai đầu: robot { than: 'hai-banh', tay: 'hoi', camBien: [] }.
   Hai lệnh gốc (luật đầy đủ ở san-hoc.js, phần THÙNG NẶNG + SÚNG HƠI), chỉ RA LỆNH, wait() cho nhịp trôi, một nhịp một phát, cặp lệnh ngược:
       spray()       phun tia nước ra TRƯỚC mũi xe
       spray_back()  phun tia nước ra SAU đuôi xe
   Không đối số = PHUN NHẸ: tia bay TỐI ĐA 2 ô (SanHoc.TAM_BAN_NHANH) rồi rơi, xe KHÔNG GIẬT. Tia dừng ở vật cản đầu tiên (tường, cửa đóng, thùng nặng, van);
   bay QUA hàng rào thấp, băng chuyền, cửa mở. Trúng van N thì van đổi (băng đổi ngay, cửa đổi cuối nhịp); phun hai lần là về như cũ. Nhịp có lệnh phun thì bánh nghỉ.
   Chương này chưa có lực mạnh (không cfg.lucBan): spray("high") báo luc-chua-mo.

   Ba hàng: 1–3 làm quen (phun mở van, phun ra sau, tầm hai ô) · 4–6 luyện (quay về phía van, phun qua hàng rào, thùng chắn tia) · 7–9 biến thể (tắt băng, hai van hai cửa
   với vòng for, một van hai cửa: phun hai lần là đóng lại) · 10 trùm (van sau lưng + van sau hàng rào, hai cửa).
   Khay: màn 1 chỉ có wait và spray; màn 2 thêm spray_back; từ màn 3 có đủ lệnh bánh. Hàm của em có sẵn từ các chương trước (move, turn_left, turn_right, u_turn, back…).
   forward(n) chưa có (gói 2 chương 2 tham-so.3 mới tạo): đi nhiều ô bằng for … move(). Mục tiêu: mọi màn tới cờ F. cauTruc ['for', 'if', 'while']; không tạo hàm cốt truyện.

   Sao: sao.nhip = số nhịp của lời giải chuẩn = đường ngắn nhất (BFS do-duong-sung-hoi.mjs: phun nhẹ là một hành động riêng); sao.o = ô của lời giải chuẩn.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên. Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var KHAY_1 = ['wait', 'spray'];                                 // màn 1: chỉ có đầu phun trước
  var KHAY_2 = ['wait', 'spray', 'spray_back'];                   // màn 2: thêm đầu phun sau
  var KHAY = BANH.concat(['spray', 'spray_back']);                // từ màn 3

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function lap(ds, n) { var kq = []; for (var i = 0; i < n; i++) kq = kq.concat(ds); return kq; }

  var PHUN = ['spray()', 'wait()'];                               // phun ra trước
  var PHUN_SAU = ['spray_back()', 'wait()'];                      // phun ra sau

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    m.chuong = 'sung-hoi';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'hoi', camBien: [] };
    m.hamGoc = m.hamGoc || KHAY;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: xe (1,3) quay mặt lên, van (1,1) cách hai ô; cửa (2,3) bên phải xe, cờ (3,3)
  var SAN_1 = ['#####', '#N###', '#.###', '#.CF#', '#####'];
  var BD_1 = { x: 1, y: 3, huong: 0 };
  // 2: hành lang đứng, xe (1,3) quay mặt lên; cửa (1,2) và cờ (1,1) phía trước; van (1,5) sau lưng cách hai ô
  var SAN_2 = ['###', '#F#', '#C#', '#.#', '#.#', '#N#', '###'];
  var BD_2 = { x: 1, y: 3, huong: 0 };
  // 3: hành lang ngang, xe (1,1) quay mặt phải, van (5,1) cách bốn ô: tia chỉ bay hai ô nên phải đi gần; cửa (4,2) dưới ô (4,1), cờ (4,3)
  var SAN_3 = ['#######', '#....N#', '####C##', '####F##', '#######'];
  var BD_3 = { x: 1, y: 1, huong: 1 };
  // 4: hành lang ngang, xe (1,3) quay mặt phải; van (2,1) ở ngách phía trên ô (2,3); cửa (4,3), cờ (6,3) ở mép phải
  var SAN_4 = ['#######', '##N####', '##.####', '#...C.F', '#######'];
  var BD_4 = { x: 1, y: 3, huong: 1 };
  // 5: xe (1,1) quay mặt lên sát tường; hàng rào (2,1) chắn xe nhưng tia bay qua tới van (3,1); cửa (1,3), cờ (1,4)
  var SAN_5 = ['#####', '#.=N#', '#.###', '#C###', '#F###', '#####'];
  var BD_5 = { x: 1, y: 1, huong: 0 };
  // 8 (biến _6): xe (1,1) quay mặt xuống ở góc; thùng nặng (2,1) chắn tia tới van (4,1) trên cùng hàng; đi vòng hàng dưới tới (4,2), quay xuống, phun ra sau trúng van;
  //   cửa (4,3), cờ (4,4)
  var SAN_6 = ['######', '#.H.N#', '#....#', '####C#', '####F#', '######'];
  var BD_6 = { x: 1, y: 1, huong: 2 };
  // 7: hành lang đứng, xe (1,7) quay mặt lên; năm ô băng chạy xuống (y 2..6) đẩy xe lùi; van (2,7) ngay bên phải xe điều khiển băng; cờ (1,1)
  var SAN_7 = ['###', '#F#', '#v#', '#v#', '#v#', '#v#', '#v#', '#.N', '###'];
  var BD_7 = { x: 1, y: 7, huong: 0 };
  // 8: hành lang ngang, xe (1,3) quay mặt phải; hai ngách phía trên có van (2,1) và (5,1); van (2,1) mở cửa (3,3), van (5,1) mở cửa (6,3); cờ (8,3)
  var SAN_8 = ['#########', '##N##N###', '##.##.###', '#..C..C.F', '#########'];
  var BD_8 = { x: 1, y: 3, huong: 1 };
  var NOI_8 = [{ nut: { x: 2, y: 1 }, cua: [{ x: 3, y: 3 }], bang: [] }, { nut: { x: 5, y: 1 }, cua: [{ x: 6, y: 3 }], bang: [] }];
  // 9: như màn 8 nhưng chỉ một van (2,1) và nó mở CẢ HAI cửa (3,3), (6,3): phun một lần là đủ, phun lần nữa thì hai cửa đóng lại
  var SAN_9 = ['#########', '##N######', '##.######', '#..C..C.F', '#########'];
  var BD_9 = { x: 1, y: 3, huong: 1 };
  // 10: xe (2,3) quay mặt phải ngay dưới ngách; van (0,3) sau lưng cách hai ô mở cửa xa (8,3); van (2,1) sau hàng rào (2,2) mở cửa gần (4,3); cờ (9,3)
  var SAN_10 = ['##########', '##N#######', '##=#######', 'N...C...CF', '##########'];
  var BD_10 = { x: 2, y: 3, huong: 1 };
  var NOI_10 = [{ nut: { x: 0, y: 3 }, cua: [{ x: 8, y: 3 }], bang: [] }, { nut: { x: 2, y: 1 }, cua: [{ x: 4, y: 3 }], bang: [] }];

  /* ------------------------------------------------------------- chương trình dùng lại */

  var CHINH_1 = nhieu(PHUN, ['turn_right()', 'move()', 'move()']);
  var CHINH_2 = nhieu(PHUN_SAU, ['move()', 'move()']);
  var CHINH_3 = nhieu(LAP(3, 'move()'), PHUN, ['turn_right()', 'move()', 'move()']);
  var CHINH_4 = nhieu(['move()', 'turn_left()'], PHUN, ['turn_right()'], LAP(4, 'move()'));
  var CHINH_5 = nhieu(['turn_right()'], PHUN, ['turn_right()'], LAP(3, 'move()'));
  var CHINH_6 = nhieu(['move()', 'turn_left()'], LAP(3, 'move()'), ['turn_right()'], PHUN_SAU, ['move()', 'move()']);
  var CHINH_7 = nhieu(['turn_right()'], PHUN, ['turn_left()'], LAP(6, 'move()'));
  var CHINH_8 = nhieu(LAP(2, ['move()', 'turn_left()', 'spray()', 'wait()', 'turn_right()', 'move()', 'move()']), ['move()']);
  var CHINH_9 = nhieu(['move()', 'turn_left()'], PHUN, ['turn_right()'], LAP(6, 'move()'));
  var CHINH_10 = nhieu(PHUN_SAU, ['turn_left()'], PHUN, ['turn_right()'], LAP(7, 'move()'));

  var DS = [
    /* --------------------------------------------- hàng 1: làm quen */
    man({
      so: 1, ten: 'Phun mở van', hang: 'lam-quen', hamGoc: KHAY_1, hamCuaEmCan: ['turn_right', 'move'],
      deBai: 'Xe có vòi phun ở mũi. spray() phun một tia nước ra phía trước; tia trúng van thì van quay, cửa mở. Phun mở van rồi đưa xe qua cửa tới cờ.',
      veMaMau: 'Chương trình có sẵn phun một phát. Chạy thử, xem cửa rồi viết tiếp.',
      san: SAN_1, batDau: BD_1,
      maMau: { chinh: PHUN.slice() },
      sao: { o: 0, nhip: 0 },
      loiGiai: { chinh: CHINH_1.slice() },
      loiGiaiKhac: { moTa: 'Thêm một dòng chú thích trước lệnh phun', baiLam: { chinh: nhieu(['# phun mở van'], CHINH_1) } },
      loiSai: [
        { moTa: 'Không phun: cửa vẫn đóng nên xe đâm vào cửa', baiLam: { chinh: ['turn_right()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đi thiếu một ô: xe dừng ở ô cửa', baiLam: { chinh: nhieu(PHUN, ['turn_right()', 'move()']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Sau spray() phải có wait() thì nhịp mới trôi.', 'Van cách xe hai ô, vừa tầm tia nước.']
    }),

    man({
      so: 2, ten: 'Van sau lưng', hang: 'lam-quen', hamGoc: KHAY_2, hamCuaEmCan: ['move'],
      deBai: 'Van mở cửa nằm sau lưng xe. spray_back() phun tia nước ra phía sau. Đổi lệnh phun cho trúng van, rồi đưa xe qua cửa tới cờ.',
      veMaMau: 'Chương trình có sẵn phun ra trước. Chạy thử, xem tia nước bay về đâu rồi sửa.',
      san: SAN_2, batDau: BD_2,
      maMau: { chinh: CHINH_2.map(function (s) { return s.replace('spray_back', 'spray'); }) },
      sao: { o: 7, nhip: 3 },
      loiGiai: { chinh: CHINH_2.slice() },
      loiGiaiKhac: { moTa: 'Thêm một dòng chú thích trước lệnh phun', baiLam: { chinh: nhieu(['# van ở sau lưng'], CHINH_2) } },
      loiSai: [
        { moTa: 'Phun ra trước bằng spray(): tia nước trúng cửa đóng, cửa vẫn đóng', baiLam: { chinh: nhieu(PHUN, ['move()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên wait() sau spray_back(): bước đầu nằm chung nhịp với lệnh phun nên bị bỏ', baiLam: { chinh: ['spray_back()', 'move()', 'move()'] }, phaiCoMa: ['ban-dung-yen', 'chua-toi-co'] },
        { moTa: 'Đi thiếu một ô: xe dừng ở ô cửa', baiLam: { chinh: nhieu(PHUN_SAU, ['move()']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['spray() phun ra trước, spray_back() phun ra sau: hai lệnh ngược nhau.', 'Van cách đuôi xe hai ô, vừa tầm tia nước.']
    }),

    man({
      so: 3, ten: 'Hai ô là hết tầm', hang: 'lam-quen', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Phun nhẹ chỉ bay xa hai ô rồi rơi xuống. Van ở cuối hành lang, cách xe bốn ô. Đưa xe tới gần, phun mở cửa, rồi đi xuống cờ.',
      veMaMau: 'Chương trình có sẵn phun ngay từ chỗ xuất phát. Chạy thử, xem tia nước rơi ở đâu.',
      san: SAN_3, batDau: BD_3,
      maMau: { chinh: PHUN.slice() },
      sao: { o: 12, nhip: 7 },
      loiGiai: { chinh: CHINH_3.slice() },
      loiGiaiKhac: { moTa: 'Đi ba ô bằng ba lệnh move() viết thẳng', baiLam: { chinh: nhieu(['move()', 'move()', 'move()'], PHUN, ['turn_right()', 'move()', 'move()']) } },
      loiSai: [
        { moTa: 'Phun ngay từ chỗ xuất phát: tia nước rơi giữa đường, cửa vẫn đóng', baiLam: { chinh: nhieu(PHUN, LAP(3, 'move()'), ['turn_right()', 'move()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đi tới mà quên phun: xe đâm vào cửa', baiLam: { chinh: nhieu(LAP(3, 'move()'), ['turn_right()', 'move()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Tia nước bay tối đa hai ô: đứng cách van một hay hai ô rồi hãy phun.', 'Cửa nằm ngay dưới ô sát van.']
    }),

    /* ------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Phun qua hàng rào', hang: 'luyen', hamCuaEmCan: ['turn_right', 'move'],
      deBai: 'Hàng rào thấp chặn xe, nhưng tia nước bay qua được. Van nằm sau hàng rào. Phun mở cửa phía dưới rồi đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn cho xe đi về phía van. Chạy thử, xem hàng rào làm gì.',
      san: SAN_5, batDau: BD_5,
      maMau: { chinh: ['turn_right()', 'move()', 'move()'] },
      sao: { o: 11, nhip: 6 },
      loiGiai: { chinh: CHINH_5.slice() },
      loiGiaiKhac: { moTa: 'Đi xuống bằng ba lệnh move() viết thẳng', baiLam: { chinh: nhieu(['turn_right()'], PHUN, ['turn_right()', 'move()', 'move()', 'move()']) } },
      loiSai: [
        { moTa: 'Đi tới van: hàng rào chặn bánh xe', baiLam: { chinh: ['turn_right()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Phun khi mũi xe còn quay lên: tia nước trúng tường', baiLam: { chinh: nhieu(PHUN, ['turn_right()', 'turn_right()'], LAP(3, 'move()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Quay phải thì mũi xe hướng về hàng rào và van phía sau nó.', 'Van cách xe hai ô: hàng rào không chặn tia nước.']
    }),

    man({
      so: 5, ten: 'Quay về phía van', hang: 'luyen', hamCuaEmCan: ['move', 'turn_left', 'turn_right'],
      deBai: 'Tia nước chỉ bay thẳng theo mũi xe. Van nằm trong ngách phía trên hành lang. Quay mũi xe về phía van mà phun, rồi quay lại đi qua cửa tới cờ.',
      veMaMau: 'Chương trình có sẵn đi một ô rồi phun thẳng. Chạy thử, xem tia nước trúng gì.',
      san: SAN_4, batDau: BD_4,
      maMau: { chinh: nhieu(['move()'], PHUN) },
      sao: { o: 14, nhip: 8 },
      loiGiai: { chinh: CHINH_4.slice() },
      loiGiaiKhac: { moTa: 'Thêm một dòng chú thích trước lần quay', baiLam: { chinh: nhieu(['move()', '# quay lên phía van', 'turn_left()'], PHUN, ['turn_right()'], LAP(4, 'move()')) } },
      loiSai: [
        { moTa: 'Không quay: tia nước bay dọc hành lang, trúng cửa đóng', baiLam: { chinh: nhieu(['move()'], PHUN, LAP(4, 'move()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Phun xong quên quay lại: xe đi lên ngách, đâm vào van', baiLam: { chinh: nhieu(['move()', 'turn_left()'], PHUN, LAP(4, 'move()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Đứng ngay dưới ngách, quay trái thì mũi xe hướng lên van.', 'Phun xong quay phải để mũi xe trở lại hướng cờ.']
    }),

    man({
      so: 6, ten: 'Tắt băng', hang: 'luyen', hamCuaEmCan: ['turn_right', 'turn_left', 'move'],
      deBai: 'Làn băng chuyền đẩy xe lùi lại nên xe đi rất chậm. Van ngay bên phải xe điều khiển băng: tia nước trúng van thì băng tắt. Tắt băng rồi đưa xe tới cờ bằng ít nhịp nhất.',
      veMaMau: 'Chương trình có sẵn cho xe đi thẳng. Chạy thử, xem làn băng làm xe đi chậm thế nào.',
      san: SAN_7, batDau: BD_7,
      maMau: { chinh: LAP(6, 'move()') },
      sao: { o: 13, nhip: 9 },
      loiGiai: { chinh: CHINH_7.slice() },
      loiGiaiKhac: { moTa: 'Thêm một dòng chú thích trước lệnh phun', baiLam: { chinh: nhieu(['turn_right()', '# tắt băng'], PHUN, ['turn_left()'], LAP(6, 'move()')) } },
      loiSai: [
        { moTa: 'Không tắt băng: đi sáu ô vẫn chưa tới cờ vì băng đẩy lùi', baiLam: { chinh: LAP(6, 'move()') }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Phun khi chưa quay: tia nước bay lên dọc làn băng, không trúng van', baiLam: { chinh: nhieu(PHUN, LAP(6, 'move()')) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Van nằm bên phải: quay phải, phun, rồi quay trái lại.', 'Băng tắt thì là sàn thường, xe đi mỗi nhịp một ô.']
    }),

    /* --------------------------------------------- hàng 3: biến thể */
    man({
      so: 7, ten: 'Một van hai cửa', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_left', 'turn_right'],
      deBai: 'Lần này chỉ có một van, và nó mở cả hai cửa. Phun lần nữa thì van quay lại, hai cửa đóng. Phun đúng một lần rồi đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn phun hai lần cho chắc. Chạy thử, xem hai cửa thế nào rồi sửa.',
      san: SAN_9, batDau: BD_9,
      maMau: { chinh: nhieu(['move()', 'turn_left()'], PHUN, PHUN, ['turn_right()'], LAP(6, 'move()')) },
      sao: { o: 14, nhip: 10 },
      loiGiai: { chinh: CHINH_9.slice() },
      loiGiaiKhac: { moTa: 'Thêm một dòng chú thích trước lệnh phun', baiLam: { chinh: nhieu(['move()', 'turn_left()', '# một phát mở cả hai cửa'], PHUN, ['turn_right()'], LAP(6, 'move()')) } },
      loiSai: [
        { moTa: 'Phun hai lần: van quay lại, hai cửa đóng', baiLam: { chinh: nhieu(['move()', 'turn_left()'], PHUN, PHUN, ['turn_right()'], LAP(6, 'move()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không phun: xe đâm vào cửa thứ nhất', baiLam: { chinh: LAP(7, 'move()') }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Mỗi phát trúng làm van quay nửa vòng: mở rồi đóng.', 'Phun một lần ở ngách, rồi tiến sáu ô.']
    }),

    man({
      so: 8, ten: 'Thùng chắn tia nước', hang: 'bien-the', hamCuaEmCan: ['turn_right', 'turn_left', 'move'],
      deBai: 'Thùng nặng chắn tia nước tới van, mà tia nước không đẩy được thùng. Đi vòng hàng dưới tới ngay dưới van, phun trúng van, rồi đi xuống qua cửa tới cờ.',
      veMaMau: 'Chương trình có sẵn quay về phía van rồi phun. Chạy thử, xem tia nước dừng ở đâu.',
      san: SAN_6, batDau: BD_6,
      maMau: { chinh: nhieu(['turn_left()'], PHUN) },
      sao: { o: 16, nhip: 9 },
      loiGiai: { chinh: CHINH_6.slice() },
      loiGiaiKhac: { moTa: 'Thêm một dòng chú thích trước lệnh phun', baiLam: { chinh: nhieu(['move()', 'turn_left()'], LAP(3, 'move()'), ['turn_right()', '# ngay dưới van'], PHUN_SAU, ['move()', 'move()']) } },
      loiSai: [
        { moTa: 'Quay sang van mà phun ngay: tia nước dừng ở thùng, cửa vẫn đóng', baiLam: { chinh: nhieu(['turn_left()'], PHUN, ['turn_right()', 'move()', 'turn_left()'], LAP(3, 'move()'), ['turn_right()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Húc thùng bằng bánh: thùng nặng cản như tường', baiLam: { chinh: ['turn_left()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Tia nước dừng ở vật cản đầu tiên, kể cả thùng.', 'Tới ngay dưới van, quay mặt xuống phía cửa: spray_back() phun lên van mà không phải quay đầu.']
    }),

    man({
      so: 9, ten: 'Hai van hai cửa', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_left', 'turn_right'], noi: NOI_8,
      deBai: 'Hai cửa trên đường tới cờ, mỗi cửa có một van riêng trong ngách phía trên. Hai đoạn đường giống hệt nhau: viết một đoạn trong vòng for.',
      veMaMau: 'Chương trình có sẵn qua được cửa thứ nhất. Chạy thử rồi viết lại bằng vòng for.',
      san: SAN_8, batDau: BD_8,
      maMau: { chinh: ['move()', 'turn_left()', 'spray()', 'wait()', 'turn_right()', 'move()', 'move()'] },
      sao: { o: 16, nhip: 13 },
      loiGiai: { chinh: CHINH_8.slice() },
      loiGiaiKhac: { moTa: 'Thêm một dòng chú thích trong vòng for', baiLam: { chinh: nhieu(LAP(2, ['# một cửa', 'move()', 'turn_left()', 'spray()', 'wait()', 'turn_right()', 'move()', 'move()']), ['move()']) } },
      loiSai: [
        { moTa: 'Mở cửa thứ nhất rồi đi thẳng: cửa thứ hai còn đóng', baiLam: { chinh: nhieu(['move()', 'turn_left()', 'spray()', 'wait()', 'turn_right()', 'move()', 'move()'], LAP(4, 'move()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Viết thẳng hai đoạn: quá 10 ô', baiLam: { chinh: nhieu(lap(['move()', 'turn_left()', 'spray()', 'wait()', 'turn_right()', 'move()', 'move()'], 2), ['move()']) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Một đoạn: tiến một ô, quay trái phun, quay phải, tiến hai ô qua cửa.', 'Lặp đoạn đó hai lần rồi tiến thêm một ô tới cờ.']
    }),

    /* --------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Nhà máy hơi', hang: 'trum', hamCuaEmCan: ['move', 'turn_left', 'turn_right'], noi: NOI_10,
      huyHieu: { ma: 'sung-hoi', ten: 'Huy hiệu Vòi phun' },
      deBai: 'Hai cửa, hai van. Van sau lưng xe mở cửa xa; van kia nằm sau hàng rào trong ngách phía trên, mở cửa gần. Mở cả hai rồi đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn mở được cửa gần. Chạy thử rồi viết tiếp.',
      san: SAN_10, batDau: BD_10,
      maMau: { chinh: nhieu(['turn_left()'], PHUN, ['turn_right()'], LAP(7, 'move()')) },
      sao: { o: 15, nhip: 11 },
      loiGiai: { chinh: CHINH_10.slice() },
      loiGiaiKhac: { moTa: 'Thêm một dòng chú thích trước van thứ hai', baiLam: { chinh: nhieu(PHUN_SAU, ['# van trên ngách', 'turn_left()'], PHUN, ['turn_right()'], LAP(7, 'move()')) } },
      loiSai: [
        { moTa: 'Quên van sau lưng: cửa xa còn đóng', baiLam: { chinh: nhieu(['turn_left()'], PHUN, ['turn_right()'], LAP(7, 'move()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Phun ra trước thay vì quay lên: tia nước bay dọc hành lang trúng cửa gần', baiLam: { chinh: nhieu(PHUN_SAU, PHUN, LAP(7, 'move()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Van sau lưng cách đuôi xe hai ô: spray_back() ngay ở chỗ xuất phát.', 'Van trên ngách: quay trái phun qua hàng rào, quay phải rồi đi thẳng bảy ô.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

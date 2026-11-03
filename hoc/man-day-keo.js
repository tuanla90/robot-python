/* ============================================================================
   man-day-keo.js — Mùa 5 (Bến sông) · Gói 2: Tay Lưới thủy lợi & Bộ cố định tuple
   Chương 1: day-keo (10 màn) — Tung lưới kéo bè (cast_net, drop_net + wait)
   Chương 2: bo-co-dinh (10 màn) — Bộ cố định hai phần (Python B: tuple, gỡ cặp, trả về tuple)
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_DAY_KEO = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'cast_net', 'drop_net'];

  function bai(chinh, ham, moi) {
    return { chinh: chinh, hamCuaMan: ham || [], hamCuaEmMoi: moi || [] };
  }
  function ham(ten, than, thamSo) {
    return { ten: ten, than: than, thamSo: thamSo || [] };
  }

  function manDayKeo(so, hang, ds) {
    return Object.assign({
      chuong: 'day-keo', so: so, hang: hang,
      vo: 'song', loaiRobot: 'xuong',
      robot: { than: 'xuong', tay: 'day-keo', camBien: [] },
      hamGoc: GOC_DAY_KEO.slice(),
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back'],
      taoHam: [],
      cauTruc: ['for', 'if'],
      khung: { chinh: 10, moiHam: 10, cauTruc: ['for', 'if'] },
      mucTieu: 'dua-vat'
    }, ds);
  }

  function manBoCoDinh(so, hang, ds) {
    return Object.assign({
      chuong: 'bo-co-dinh', so: so, hang: hang,
      vo: 'song', loaiRobot: 'xuong',
      robot: { than: 'xuong', tay: 'day-keo', camBien: [] },
      hamGoc: GOC_DAY_KEO.slice(),
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back'],
      taoHam: [],
      bienDem: true,
      cauTruc: ['for', 'if', 'return', 'tuple', 'list'],
      khung: { chinh: 10, moiHam: 10, cauTruc: ['for', 'if', 'return', 'tuple', 'list'] },
      mucTieu: 'dua-vat'
    }, ds);
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: day-keo — Tung lưới kéo bè (10 màn)
       ====================================================================== */
    manDayKeo(1, 'lam-quen', {
      ten: 'Tung lưới bắt bè kéo lùi',
      chiChay: true, chinhCoDinh: true,
      deBai: 'Tàu thủy lợi R1 vừa gắn tay Lưới thủy lợi. Lệnh cast_net() đi kèm wait() tung vòm lưới ra cách 2 ô trước mũi xuồng để chụp giữ bè B. Khi bè đã nằm trong lưới dưới nước, mỗi bước lùi back() của xuồng sẽ kéo dây lưới và bè đi theo 1 ô về bến nhận bè q. Bấm Chạy để xem.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem cast_net() chụp bè ở cách 2 ô rồi kéo lùi vào bến q.',
      san: [
        '........',
        '~~q~~~B.',
        '........'
      ],
      batDau: { x: 4, y: 1, huong: 1 },
      maMau: bai(['cast_net()', 'wait()', 'back()', 'back()', 'back()', 'back()']),
      loiGiai: bai(['cast_net()', 'wait()', 'back()', 'back()', 'back()', 'back()']),
      sao: { o: 11, nhip: 5 },
      goiY: [
        'cast_net() chỉ ra lệnh cho tay lưới; cần wait() để hoàn tất nhịp quăng lưới bắt bè ở cách 2 ô.',
        'Sau khi lưới chụp bè ở (6, 1), 4 bước back() kéo bè lùi về đúng bến q ở (2, 1).'
      ]
    }),

    manDayKeo(2, 'lam-quen', {
      ten: 'Tiến vào tầm lưới hai ô',
      deBai: 'Vòm lưới mặc định quăng ra đúng 2 ô trước mũi xuồng. Chiếc bè B đang nằm ở (6, 1), cách xuồng ở (3, 1) tới 3 ô. Hãy tiến 1 ô lên (4, 1) cho vừa đúng tầm 2 ô, gọi cast_net() và wait() để chụp bè, rồi lùi 3 ô bằng back() kéo bè về bến q ở (3, 1).',
      veMaMau: 'Mã mẫu đã tiến 1 ô và tung lưới bắt bè. Hãy thêm các bước back() để kéo bè về bến q.',
      san: [
        '........',
        '~~~q~~B.',
        '........'
      ],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['move()', 'cast_net()', 'wait()', 'back()']),
      loiGiai: bai(['move()', 'cast_net()', 'wait()', 'back()', 'back()', 'back()']),
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for để lùi 3 bước sau khi tung lưới',
        baiLam: bai(['move()', 'cast_net()', 'wait()', 'for i in range(3):', '    back()'])
      },
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới lùi 1 bước, bè dừng ở (5, 1)', baiLam: bai(['move()', 'cast_net()', 'wait()', 'back()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Tung lưới ngay từ (3, 1) khi bè cách 3 ô: lưới rơi hụt xuống nước trống', baiLam: bai(['cast_net()', 'wait()', 'back()', 'back()', 'back()']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Tiến lên thay vì lùi sau khi tung lưới trước mặt: xuồng dẫm lên dây lưới đang căng', baiLam: bai(['move()', 'cast_net()', 'wait()', 'move()']), phaiCoMa: ['luoi-vuong', 'chua-dua-vat'] }
      ],
      sao: { o: 12, nhip: 5 },
      goiY: [
        'Khi xuồng ở (4, 1) gọi cast_net() và wait(), lưới chụp giữ bè B ở (6, 1).',
        'Lùi 3 bước bằng back() sẽ kéo bè từ (6, 1) qua (5, 1), (4, 1) về đúng bến q ở (3, 1).'
      ]
    }),

    manDayKeo(3, 'lam-quen', {
      ten: 'Tung lưới ra sau đuôi cast_net("back")',
      deBai: 'Tay lưới có thể tung theo 4 hướng tương đối quanh xuồng: "front" (mặc định), "back", "left", "right". Chiếc bè B đang nằm ở (1, 1) cách đuôi xuồng (3, 1) đúng 2 ô. Hãy gọi cast_net("back") và wait() để tung lưới ra sau đuôi bắt bè, rồi gọi forward(4) kéo bè theo sau vào bến q ở (5, 1).',
      veMaMau: 'Mã mẫu đã tung lưới ra sau đuôi bằng cast_net("back") và wait(). Hãy tiến đủ 4 ô để kéo bè vào bến q.',
      san: [
        '.........',
        '~B~~~q~~~',
        '.........'
      ],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['cast_net("back")', 'wait()', 'move()', 'move()']),
      loiGiai: bai(['cast_net("back")', 'wait()', 'forward(4)']),
      loiGiaiKhac: {
        moTa: 'Gọi 4 lần move() sau khi tung lưới ra sau',
        baiLam: bai(['cast_net("back")', 'wait()', 'move()', 'move()', 'move()', 'move()'])
      },
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới tiến 2 ô, bè dừng ở (3, 1) chưa tới bến (5, 1)', baiLam: bai(['cast_net("back")', 'wait()', 'move()', 'move()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi cast_net() mặc định về phía trước thay vì cast_net("back"): lưới hụt ở (5, 1)', baiLam: bai(['cast_net()', 'wait()', 'forward(4)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Lùi xuồng sau khi tung lưới ra sau đuôi: xuồng lùi đè lên dây lưới phía sau', baiLam: bai(['cast_net("back")', 'wait()', 'back()']), phaiCoMa: ['luoi-vuong', 'chua-dua-vat'] }
      ],
      sao: { o: 8, nhip: 5 },
      goiY: [
        'cast_net("back") kèm wait() quăng lưới 2 ô về phía sau đuôi xuồng, bắt lấy bè B ở (1, 1).',
        'Thay hai lệnh move() bằng forward(4) để xuồng tiến từ (3, 1) sang (7, 1), kéo bè theo vào bến (5, 1).'
      ]
    }),

    manDayKeo(4, 'lam-quen', {
      ten: 'Quay mũi tại ngã rẽ kéo bè qua góc cua',
      deBai: 'Dây lưới mềm nằm dưới nước nên khi xuồng quay mũi tại chỗ (turn_right hay turn_left), lưới và bè vẫn nằm yên dưới nước; khi xuồng tiến sang nhánh mới, dây lưới sẽ trượt theo khúc cua! Hãy tiến 1 ô tới ngã rẽ (2, 1), tung lưới bắt bè B ở (4, 1), rẽ phải rồi gọi forward(4) kéo bè qua góc cua vào bến q ở (2, 3).',
      veMaMau: 'Mã mẫu đã bắt bè ở ngã rẽ và quay phải. Hãy tiến 4 ô xuống nhánh dọc để kéo bè vào bến q.',
      san: [
        '......',
        '~~~~B~',
        '..~...',
        '..q...',
        '..~...',
        '..~...'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['move()', 'cast_net()', 'wait()', 'turn_right()']),
      loiGiai: bai(['move()', 'cast_net()', 'wait()', 'turn_right()', 'forward(4)']),
      loiGiaiKhac: {
        moTa: 'Gọi 4 lần move() sau khi rẽ phải',
        baiLam: bai(['move()', 'cast_net()', 'wait()', 'turn_right()', 'move()', 'move()', 'move()', 'move()'])
      },
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới quay phải ở ngã rẽ, chưa tiến xuống nhánh dọc', baiLam: bai(['move()', 'cast_net()', 'wait()', 'turn_right()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Rẽ trái thay vì rẽ phải nên xuồng đâm lên bờ Bắc', baiLam: bai(['move()', 'cast_net()', 'wait()', 'turn_left()', 'forward(4)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Chỉ tiến 2 ô sau khi rẽ phải: bè mới tới góc (2, 1), chưa xuống tới bến (2, 3)', baiLam: bai(['move()', 'cast_net()', 'wait()', 'turn_right()', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 12, nhip: 7 },
      goiY: [
        'Khi xuồng ở (2, 1) gọi turn_right(), xuồng xoay mũi xuống Nam còn bè B vẫn nằm trong lưới ở (4, 1).',
        'Gọi forward(4) để xuồng đi từ (2, 1) xuống (2, 5), kéo bè B trượt qua (3, 1), (2, 1), (2, 2) vào đúng bến q ở (2, 3).'
      ]
    }),

    manDayKeo(5, 'luyen', {
      ten: 'Tung lưới sang trái và thả lưới drop_net()',
      deBai: 'Tại ngã ba (2, 2), chiếc bè B nằm ở nhánh bên trái (2, 0) cần kéo về bến (2, 1), còn cụm lục bình L ở (5, 2) cần kéo về bến (4, 2). Lệnh drop_net() đi kèm wait() dùng để thu lưới, thả vật nổi nằm lại tại chỗ. Hãy dùng cast_net("left"), wait(), move() kéo B vào (2, 1), gọi drop_net(), wait() thả B ra, rồi tung lưới phía trước bắt L và lùi 1 ô!',
      veMaMau: 'Mã mẫu đã kéo bè B vào bến (2, 1). Hãy gọi drop_net(), wait(), rồi bắt tiếp cụm lục bình L kéo về (4, 2).',
      san: [
        '..B....',
        '..q....',
        '~~~~qL.',
        '.......'
      ],
      batDau: { x: 2, y: 2, huong: 1 },
      maMau: bai(['cast_net("left")', 'wait()', 'move()']),
      loiGiai: bai([
        'cast_net("left")',
        'wait()',
        'move()',
        'drop_net()',
        'wait()',
        'cast_net()',
        'wait()',
        'back()'
      ]),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới đưa được bè B vào (2, 1), chưa thả lưới và chưa kéo L', baiLam: bai(['cast_net("left")', 'wait()', 'move()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi drop_net(), wait() trước khi bắt L: báo lỗi đang giữ lưới và khi lùi bị vướng lưới cũ', baiLam: bai(['cast_net("left")', 'wait()', 'move()', 'cast_net()', 'wait()', 'back()']), phaiCoMa: ['dang-keo', 'luoi-vuong', 'chua-dua-vat'] },
        { moTa: 'Tung lưới bắt L nhưng tiến thay vì lùi: xuồng vướng vào dây lưới phía trước', baiLam: bai(['cast_net("left")', 'wait()', 'move()', 'drop_net()', 'wait()', 'cast_net()', 'wait()', 'move()']), phaiCoMa: ['luoi-vuong', 'chua-dua-vat'] }
      ],
      sao: { o: 12, nhip: 5 },
      goiY: [
        'Sau lệnh move() đầu tiên, xuồng ở (3, 2) và bè B đã nằm đúng bến (2, 1). Gọi drop_net() rồi wait() để thả B lại.',
        'Từ (3, 2), cụm lục bình L ở (5, 2) cách mũi đúng 2 ô: gọi cast_net(), wait() rồi back() để kéo L về bến (4, 2).'
      ]
    }),

    manDayKeo(6, 'luyen', {
      ten: 'Tung lưới sang phải bắt bè trong ngách',
      deBai: 'Chiếc bè thứ nhất nằm trong ngách bên phải ở (2, 3) cần kéo lên bến (2, 1), còn chiếc bè thứ hai ở (6, 1) cần kéo về bến (5, 1). Từ (2, 1) hướng sang Đông, hãy gọi cast_net("right"), wait() bắt bè trong ngách, gọi forward(2) để kéo bè lên (2, 1), tháo lưới bằng drop_net(), wait(), rồi bắt tiếp bè thứ hai ở (6, 1) và gọi back()!',
      veMaMau: 'Mã mẫu đã kéo bè thứ nhất lên bến (2, 1) và tháo lưới. Hãy bắt tiếp bè thứ hai ở (6, 1) và kéo lùi về (5, 1).',
      san: [
        '.......',
        '~~q~~qB',
        '..~....',
        '..B....'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        'cast_net("right")',
        'wait()',
        'forward(2)',
        'drop_net()',
        'wait()'
      ]),
      loiGiai: bai([
        'cast_net("right")',
        'wait()',
        'forward(2)',
        'drop_net()',
        'wait()',
        'cast_net()',
        'wait()',
        'back()'
      ]),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới đưa được bè thứ nhất vào bến (2, 1)', baiLam: bai(['cast_net("right")', 'wait()', 'forward(2)', 'drop_net()', 'wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên drop_net(), wait() sau forward(2): khi gọi cast_net() lần hai bị lỗi đang giữ lưới', baiLam: bai(['cast_net("right")', 'wait()', 'forward(2)', 'cast_net()', 'wait()', 'back()']), phaiCoMa: ['dang-keo', 'luoi-vuong', 'chua-dua-vat'] },
        { moTa: 'Chỉ tiến 1 ô thay vì forward(2): bè đầu mới tới (2, 2) và lần tung lưới thứ hai bị hụt', baiLam: bai(['cast_net("right")', 'wait()', 'move()', 'drop_net()', 'wait()', 'cast_net()', 'wait()', 'back()']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      sao: { o: 14, nhip: 6 },
      goiY: [
        'Sau forward(2) và drop_net(), wait(), xuồng đang ở (4, 1) hướng Đông, cách bè thứ hai ở (6, 1) đúng 2 ô.',
        'Gọi tiếp cast_net(), wait() rồi back() để kéo bè thứ hai từ (6, 1) về bến (5, 1).'
      ]
    }),

    manDayKeo(7, 'luyen', {
      ten: 'Lặp nhịp tung lưới hai nhánh kênh',
      deBai: 'Hai nhánh kênh bên trái ở cột 2 và cột 5 có cấu trúc giống hệt nhau: ở mỗi nhánh, bè B nằm ở hàng 0 và bến q nằm ở hàng 1. Khi xuồng đi dọc luồng chính ở hàng 2 hướng sang Đông, hãy dùng vòng lặp for 2 lần: mỗi lần gọi cast_net("left"), wait(), tiến 1 ô bằng move() để kéo bè vào bến q, gọi drop_net(), wait() thả lưới, rồi gọi forward(2) sang nhánh kế tiếp.',
      veMaMau: 'Dùng vòng lặp for i in range(2) để tung lưới sang trái, kéo bè vào bến, thả lưới và tiến sang nhánh kế.',
      san: [
        '..B..B...',
        '..q..q...',
        '~~~~~~~~~',
        '.........'
      ],
      batDau: { x: 2, y: 2, huong: 1 },
      maMau: bai([
        'for i in range(2):',
        '    cast_net("left")',
        '    wait()',
        '    move()'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    cast_net("left")',
        '    wait()',
        '    move()',
        '    drop_net()',
        '    wait()',
        '    forward(2)'
      ]),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: chưa thả lưới ở cuối lượt đầu nên lượt hai báo lỗi đang kéo', baiLam: bai(['for i in range(2):', '    cast_net("left")', '    wait()', '    move()']), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Quên gọi drop_net(), wait() trước forward(2): bè đầu bị kéo tuột khỏi bến (2, 1)', baiLam: bai(['for i in range(2):', '    cast_net("left")', '    wait()', '    move()', '    forward(2)']), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Cuối vòng lặp chỉ tiến 1 ô thay vì forward(2): xuồng dừng ở cột 4, lệch nhánh thứ hai ở cột 5', baiLam: bai(['for i in range(2):', '    cast_net("left")', '    wait()', '    move()', '    drop_net()', '    wait()', '    move()']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      sao: { o: 12, nhip: 10 },
      goiY: [
        'Sau move(), bè đã nằm trên bến q ở hàng 1: gọi drop_net() và wait() để thả bè.',
        'Cuối vòng lặp, gọi forward(2) để xuồng từ cột 3 tiến sang cột 5 cho lượt thứ hai.'
      ]
    }),

    manDayKeo(8, 'thu-thach', {
      ten: 'Kéo hai bè tại ngã ba vịnh hẹp',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'u_turn', 'back'],
      deBai: 'Ở ngã ba (2, 2) hướng sang Đông, chiếc bè đầu tiên nằm ở nhánh trái (2, 0) cần đưa vào bến (2, 1), còn chiếc bè thứ hai nằm ở nhánh phải (2, 5) cần đưa vào bến (2, 4). Hãy tung lưới sang trái bắt bè đầu, rẽ phải tiến 1 ô xuống (2, 3) để kéo bè đầu vào (2, 1), thả lưới, sau đó tung lưới bắt bè thứ hai ở (2, 5), gọi u_turn() quay 180 độ và tiến 1 ô lên (2, 2) kéo bè thứ hai vào (2, 4).',
      veMaMau: 'Lập trình kéo lần lượt 2 chiếc bè vào 2 bến q ở (2, 1) và (2, 4).',
      san: [
        '..B....',
        '..q....',
        '~~~~...',
        '..~....',
        '..q....',
        '..B....'
      ],
      batDau: { x: 2, y: 2, huong: 1 },
      maMau: bai([]),
      loiGiai: bai([
        'cast_net("left")',
        'wait()',
        'turn_right()',
        'move()',
        'drop_net()',
        'wait()',
        'cast_net()',
        'wait()',
        'u_turn()',
        'move()'
      ]),
      loiSai: [
        { moTa: 'Quên gọi drop_net(), wait() sau khi kéo bè đầu vào (2, 1): không bắt được bè thứ hai', baiLam: bai(['cast_net("left")', 'wait()', 'turn_right()', 'move()', 'cast_net()', 'wait()', 'u_turn()', 'move()']), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Ở bước cuối quên gọi u_turn() mà tiến thẳng xuống Nam: xuồng dẫm vào dây lưới đang căng ở (2, 4)', baiLam: bai(['cast_net("left")', 'wait()', 'turn_right()', 'move()', 'drop_net()', 'wait()', 'cast_net()', 'wait()', 'move()']), phaiCoMa: ['luoi-vuong', 'chua-dua-vat'] },
        { moTa: 'Tung lưới mặc định về phía trước ngay từ đầu thay vì cast_net("left")', baiLam: bai(['cast_net()', 'wait()', 'turn_right()', 'move()']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      sao: { o: 19, nhip: 8 },
      goiY: [
        'Từ (2, 2) hướng Đông: gọi cast_net("left"), wait() bắt bè ở (2, 0), rồi turn_right() và move() xuống (2, 3) để kéo bè đầu vào (2, 1).',
        'Gọi drop_net(), wait(), rồi cast_net(), wait() bắt bè ở (2, 5), sau đó u_turn() và move() về (2, 2) kéo bè thứ hai lên (2, 4).'
      ]
    }),

    manDayKeo(9, 'thu-thach', {
      ten: 'Ba nhánh kéo bè liên hoàn',
      deBai: 'Dọc kênh có 3 nhánh bên trái ở các cột 1, 3, 5: mỗi nhánh có bè B ở hàng 0 và bến q ở hàng 1. Khi xuồng đứng ở cột nhánh (1, 3, 5) trên hàng 2 hướng sang Đông, chỉ cần gọi cast_net("left"), wait(), move() là bè trượt ngay vào bến q! Hãy dùng vòng lặp 3 lần để kéo đủ 3 bè, nhớ thả lưới và tiến thêm 1 ô sang cột nhánh kế tiếp.',
      veMaMau: 'Mỗi vòng lặp: tung lưới sang trái, tiến 1 ô kéo bè vào bến, thả lưới, rồi tiến 1 ô sang nhánh tiếp theo.',
      san: [
        '.B.B.B..',
        '.q.q.q..',
        '~~~~~~~~',
        '........'
      ],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: bai([]),
      loiGiai: bai([
        'for i in range(3):',
        '    cast_net("left")',
        '    wait()',
        '    move()',
        '    drop_net()',
        '    wait()',
        '    move()'
      ]),
      loiSai: [
        { moTa: 'Chỉ lặp 2 lần: còn bè thứ ba ở cột 5 chưa vào bến', baiLam: bai(['for i in range(2):', '    cast_net("left")', '    wait()', '    move()', '    drop_net()', '    wait()', '    move()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên drop_net(), wait() trong vòng lặp: bè đầu bị kéo lệch khỏi bến q', baiLam: bai(['for i in range(3):', '    cast_net("left")', '    wait()', '    move()', '    move()']), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Thiếu lệnh move() thứ hai ở cuối vòng lặp: xuồng dừng ở cột 2, tung lưới vào bờ', baiLam: bai(['for i in range(3):', '    cast_net("left")', '    wait()', '    move()', '    drop_net()', '    wait()']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      sao: { o: 10, nhip: 12 },
      goiY: [
        'Xuồng xuất phát ở (1, 2): gọi cast_net("left"), wait() bắt bè ở (1, 0), rồi move() sang (2, 2) kéo bè xuống đúng bến (1, 1).',
        'Tháo lưới bằng drop_net(), wait(), rồi gọi thêm move() để sang cột 3 (và cột 5 ở lượt sau).'
      ]
    }),

    manDayKeo(10, 'trum', {
      ten: 'Trùm: Đội cứu hộ bè nổi',
      huyHieu: { ma: 'day-keo', ten: 'Huy hiệu Tay lưới thủy lợi' },
      nhipTheo: 'tong',
      deBai: 'Đưa cả 2 vật nổi (bè B và cụm lục bình L) ở hai nhánh bên phải (cột 1 và cột 4) vào đúng các bến q ở hàng 3 trên cả hai sân. Xuồng xuất phát ở (0, 2) hướng sang Đông: ở mỗi lượt lặp, hãy tiến 1 ô tới ngã ba nhánh, tung lưới sang phải bắt vật nổi, tiến 1 ô kéo vật lên bến q, thả lưới rồi tiến 1 ô sang trạm kế tiếp.',
      veMaMau: 'Viết chương trình dùng vòng lặp 2 lần chạy đúng trên cả 2 sân.',
      san: [
        [
          '.......',
          '.......',
          '~~~~~~~',
          '.q..q..',
          '.B..L..'
        ],
        [
          '###....',
          '.......',
          '~~~~~~~',
          '.q..q..',
          '.L..B..'
        ]
      ],
      batDau: [
        { x: 0, y: 2, huong: 1 },
        { x: 0, y: 2, huong: 1 }
      ],
      maMau: bai([]),
      loiGiai: bai([
        'for i in range(2):',
        '    move()',
        '    cast_net("right")',
        '    wait()',
        '    move()',
        '    drop_net()',
        '    wait()',
        '    move()'
      ]),
      loiSai: [
        { moTa: 'Chỉ xử lý nhánh đầu tiên mà không lặp 2 lần', baiLam: bai(['move()', 'cast_net("right")', 'wait()', 'move()', 'drop_net()', 'wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên drop_net(), wait() trước khi đi sang nhánh thứ hai: vật đầu tiên bị kéo tuột khỏi bến q', baiLam: bai(['for i in range(2):', '    move()', '    cast_net("right")', '    wait()', '    move()', '    move()']), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Tung lưới sang trái thay vì sang phải: lưới quăng lên bờ cạn', baiLam: bai(['for i in range(2):', '    move()', '    cast_net("left")', '    wait()', '    move()', '    drop_net()', '    wait()', '    move()']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      sao: { o: 12, nhip: 20 },
      goiY: [
        'Đầu mỗi lượt lặp, gọi move() để xuồng vào đúng cột nhánh (cột 1 ở lượt 1, cột 4 ở lượt 2).',
        'Gọi cast_net("right"), wait(), move() để kéo vật từ hàng 4 lên bến q ở hàng 3, sau đó drop_net(), wait() và move().'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: bo-co-dinh — Bộ cố định hai phần (10 màn, Python B: tuple)
       ====================================================================== */
    manBoCoDinh(1, 'lam-quen', {
      ten: 'Bộ hai số cố định và hàm tow_grab',
      taoHam: ['tow_grab'],
      deBai: 'Trong Python, một bộ cố định (tuple) viết trong ngoặc tròn như p = (2, 3) giữ một cặp giá trị không đổi; ta lấy phần tử đầu bằng p[0] và phần tử sau bằng p[1]. Hãy tạo hàm tow_grab() trong Xưởng hàm gồm 2 dòng cast_net() và wait() để tung lưới bắt bè gọn trong 1 lệnh, rồi chạy chương trình dùng cặp bước p = (2, 3) kéo bè qua góc cua.',
      veMaMau: 'Tạo hàm tow_grab() không tham số gồm cast_net() và wait(). Chương trình chính đã dùng p[0] và p[1].',
      san: [
        '.......',
        '~~~~~B.',
        '...q...',
        '...~...',
        '...~...',
        '...~...'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['p = (2, 3)', 'forward(p[0])', 'tow_grab()', 'turn_right()', 'forward(p[1])']),
      loiGiai: bai(
        ['p = (2, 3)', 'forward(p[0])', 'tow_grab()', 'turn_right()', 'forward(p[1])'],
        [],
        [ham('tow_grab', ['cast_net()', 'wait()'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm tow_grab trong Xưởng hàm', baiLam: bai(['p = (2, 3)', 'forward(p[0])', 'tow_grab()', 'turn_right()', 'forward(p[1])']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong tow_grab() chỉ viết wait() mà quên gọi cast_net(): xuồng không bắt được bè B', baiLam: bai(['p = (2, 3)', 'forward(p[0])', 'tow_grab()', 'turn_right()', 'forward(p[1])']), hamCuaEmMoi: [ham('tow_grab', ['wait()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dùng p[0] cho cả hai đoạn: đoạn sau chỉ đi 2 ô thay vì 3 ô nên bè chưa tới bến q', baiLam: bai(['p = (2, 3)', 'forward(p[0])', 'tow_grab()', 'turn_right()', 'forward(p[0])']), hamCuaEmMoi: [ham('tow_grab', ['cast_net()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 14, nhip: 8 },
      goiY: [
        'Mở Xưởng hàm, tạo hàm tow_grab() có 2 dòng: cast_net() và wait().',
        'Với p = (2, 3), p[0] là 2 (tiến tới ngã rẽ (3, 1)) và p[1] là 3 (tiến xuống nhánh dọc kéo bè vào bến (3, 2)).'
      ]
    }),

    manBoCoDinh(2, 'lam-quen', {
      ten: 'Gỡ cặp giá trị và hàm tow_drop',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab'],
      taoHam: ['tow_drop'],
      deBai: 'Thay vì viết p[0], p[1], Python cho phép gỡ cặp trực tiếp: a, b = (2, 3) sẽ gán a = 2 và b = 3 cùng lúc. Hãy tạo hàm tow_drop() gồm 2 dòng drop_net() và wait() để tháo lưới gọn trong 1 lệnh, rồi dùng a, b = (2, 3) kéo 2 chiếc bè qua 2 ngã rẽ vào 2 bến q.',
      veMaMau: 'Tạo hàm tow_drop() gồm drop_net() và wait(). Chương trình chính gỡ cặp a, b = (2, 3).',
      san: [
        '......',
        '~~q~B.',
        '..~...',
        '..~ ~B.'.replace(' ', ''),
        '..q...',
        '..~...',
        '..~...'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        'a, b = (2, 3)',
        'tow_grab()',
        'turn_right()',
        'forward(a)',
        'tow_drop()',
        'turn_left()',
        'tow_grab()',
        'turn_right()',
        'forward(b)'
      ]),
      loiGiai: bai(
        [
          'a, b = (2, 3)',
          'tow_grab()',
          'turn_right()',
          'forward(a)',
          'tow_drop()',
          'turn_left()',
          'tow_grab()',
          'turn_right()',
          'forward(b)'
        ],
        [],
        [ham('tow_drop', ['drop_net()', 'wait()'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm tow_drop', baiLam: bai(['a, b = (2, 3)', 'tow_grab()', 'turn_right()', 'forward(a)', 'tow_drop()', 'turn_left()', 'tow_grab()', 'turn_right()', 'forward(b)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong tow_drop() gọi cast_net() thay vì drop_net(): báo lỗi đang giữ lưới', baiLam: bai(['a, b = (2, 3)', 'tow_grab()', 'turn_right()', 'forward(a)', 'tow_drop()', 'turn_left()', 'tow_grab()', 'turn_right()', 'forward(b)']), hamCuaEmMoi: [ham('tow_drop', ['cast_net()', 'wait()'])], phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Ở đoạn cuối dùng forward(a) thay vì forward(b): bè thứ hai dừng ở (2, 3), thiếu 1 ô tới bến (2, 4)', baiLam: bai(['a, b = (2, 3)', 'tow_grab()', 'turn_right()', 'forward(a)', 'tow_drop()', 'turn_left()', 'tow_grab()', 'turn_right()', 'forward(a)']), hamCuaEmMoi: [ham('tow_drop', ['drop_net()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 24, nhip: 13 },
      goiY: [
        'Tạo hàm tow_drop() trong Xưởng hàm với 2 dòng: drop_net() và wait().',
        'Khi a, b = (2, 3), biến a = 2 kéo bè đầu vào bến (2, 1) và đưa xuồng tới (2, 3); biến b = 3 kéo bè thứ hai vào bến (2, 4).'
      ]
    }),

    manBoCoDinh(3, 'lam-quen', {
      ten: 'Hàm kéo lùi pull_back',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop'],
      taoHam: ['pull_back'],
      deBai: 'Nhiều khi xuồng cần tung lưới bắt bè phía trước rồi lùi thẳng n ô để kéo bè về sau. Hãy tạo hàm pull_back(n) gồm: gọi tow_grab(), rồi lặp n lần lệnh back(). Sau đó dùng cặp bước a, b = (2, 3) để tiến a ô tới (4, 1), rồi kéo lùi bè b ô về đúng bến q ở (3, 1).',
      veMaMau: 'Tạo hàm pull_back(n) gọi tow_grab() rồi lặp n lần back().',
      san: [
        '........',
        '~~~q~~B~',
        '........'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        'a, b = (2, 3)',
        'forward(a)',
        'pull_back(b)'
      ]),
      loiGiai: bai(
        [
          'a, b = (2, 3)',
          'forward(a)',
          'pull_back(b)'
        ],
        [],
        [ham('pull_back', ['tow_grab()', 'for i in range(n):', '    back()'], ['n'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm pull_back', baiLam: bai(['a, b = (2, 3)', 'forward(a)', 'pull_back(b)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong pull_back(n) quên gọi tow_grab() trước khi lùi: xuồng chỉ lùi một mình, bỏ lại bè B', baiLam: bai(['a, b = (2, 3)', 'forward(a)', 'pull_back(b)']), hamCuaEmMoi: [ham('pull_back', ['for i in range(n):', '    back()'], ['n'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Truyền a (bằng 2) thay vì b (bằng 3) vào pull_back: bè dừng ở (4, 1), cách bến q 1 ô', baiLam: bai(['a, b = (2, 3)', 'forward(a)', 'pull_back(a)']), hamCuaEmMoi: [ham('pull_back', ['tow_grab()', 'for i in range(n):', '    back()'], ['n'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 16, nhip: 6 },
      goiY: [
        'Thân hàm pull_back(n) viết: tow_grab(), dòng dưới là for i in range(n):, thụt lề back().',
        'Xuồng tiến a = 2 ô từ (2, 1) lên (4, 1), rồi pull_back(3) bắt bè ở (6, 1) và lùi 3 bước kéo bè về bến q ở (3, 1).'
      ]
    }),

    manBoCoDinh(4, 'lam-quen', {
      ten: 'Duyệt qua từng phần tử của bộ cố định',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop', 'pull_back'],
      deBai: 'Vòng lặp for cũng duyệt trực tiếp qua từng phần tử của một tuple: với steps = (1, 2), viết for a in steps: thì vòng đầu a = 1, vòng hai a = 2. Ở mỗi nhánh dọc (cột 2 và cột 5), hãy rẽ phải, tiến a ô xuống nhánh, gọi pull_back(a) để kéo bè lùi về bến q ở hàng 3, rồi tháo lưới bằng tow_drop(), rẽ trái và tiến 3 ô sang nhánh tiếp theo.',
      veMaMau: 'Trong vòng lặp for a in steps:, sau pull_back(a) hãy tháo lưới, rẽ trái và tiến 3 ô.',
      san: [
        '.........',
        '~~~~~~~~~',
        '..~..~...',
        '..q..q...',
        '..B..~...',
        '.....B...'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        'steps = (1, 2)',
        'for a in steps:',
        '    turn_right()',
        '    forward(a)',
        '    pull_back(a)'
      ]),
      loiGiai: bai([
        'steps = (1, 2)',
        'for a in steps:',
        '    turn_right()',
        '    forward(a)',
        '    pull_back(a)',
        '    tow_drop()',
        '    turn_left()',
        '    forward(3)'
      ]),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: chưa thả lưới và chưa rẽ trái sang nhánh thứ hai', baiLam: bai(['steps = (1, 2)', 'for a in steps:', '    turn_right()', '    forward(a)', '    pull_back(a)']), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Quên gọi tow_drop() sau pull_back(a): khi đi sang nhánh thứ hai bè đầu bị kéo tuột khỏi bến q', baiLam: bai(['steps = (1, 2)', 'for a in steps:', '    turn_right()', '    forward(a)', '    pull_back(a)', '    turn_left()', '    forward(3)']), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Cuối vòng lặp dùng forward(2) thay vì forward(3): xuồng dừng ở cột 4 thay vì cột 5', baiLam: bai(['steps = (1, 2)', 'for a in steps:', '    turn_right()', '    forward(a)', '    pull_back(a)', '    tow_drop()', '    turn_left()', '    forward(2)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 27, nhip: 15 },
      goiY: [
        'Sau pull_back(a), xuồng đã lùi về hàng 1 và bè đã nằm đúng trên bến q ở hàng 3: hãy gọi tow_drop() để tháo lưới.',
        'Tiếp theo gọi turn_left() và forward(3) để đi dọc hàng 1 từ cột 2 sang nhánh thứ hai ở cột 5.'
      ]
    }),

    manBoCoDinh(5, 'luyen', {
      ten: 'Hàm trả về bộ hai phần pair_step',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop', 'pull_back'],
      taoHam: ['pair_step'],
      deBai: 'Một hàm có thể trả về một tuple gồm 2 giá trị bằng lệnh return d, n + 1, và nơi gọi gỡ cặp ngay bằng h, m = pair_step("R", 2). Hãy tạo hàm pair_step(d, n): nếu d == "R" thì turn_right() ngược lại turn_left(), sau đó forward(n), rồi return d, n + 1.',
      veMaMau: 'Tạo hàm pair_step(d, n) thực hiện rẽ theo d, tiến n ô và trả về cặp d, n + 1.',
      san: [
        '~~~~..',
        '...~..',
        '~~q~~B'
      ],
      batDau: { x: 3, y: 0, huong: 1 },
      maMau: bai([
        'h, m = pair_step("R", 2)',
        'turn_left()',
        'pull_back(m)'
      ]),
      loiGiai: bai(
        [
          'h, m = pair_step("R", 2)',
          'turn_left()',
          'pull_back(m)'
        ],
        [],
        [ham('pair_step', [
          'if d == "R":',
          '    turn_right()',
          'else:',
          '    turn_left()',
          'forward(n)',
          't = n + 1',
          'return d, t'
        ], ['d', 'n'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm pair_step', baiLam: bai(['h, m = pair_step("R", 2)', 'turn_left()', 'pull_back(m)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong pair_step chỉ return n + 1 thay vì cặp d, n + 1: lệnh gỡ cặp h, m = ... báo lỗi vì không phải bộ 2 phần', baiLam: bai(['h, m = pair_step("R", 2)', 'turn_left()', 'pull_back(m)']), hamCuaEmMoi: [ham('pair_step', ['if d == "R":', '    turn_right()', 'else:', '    turn_left()', 'forward(n)', 'return n + 1'], ['d', 'n'])], phaiCoMa: ['loi-chay'] },
        { moTa: 'Trả về d, n thay vì d, n + 1: m bằng 2 nên kéo bè thiếu 1 ô tới bến q', baiLam: bai(['h, m = pair_step("R", 2)', 'turn_left()', 'pull_back(m)']), hamCuaEmMoi: [ham('pair_step', ['if d == "R":', '    turn_right()', 'else:', '    turn_left()', 'forward(n)', 'return d, n'], ['d', 'n'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 24, nhip: 8 },
      goiY: [
        'Trong pair_step(d, n): kiểm tra if d == "R": turn_right() else: turn_left(), rồi forward(n) và return d, n + 1.',
        'Khi gọi pair_step("R", 2), xuồng rẽ phải tiến 2 ô xuống (3, 2) và trả về ("R", 3) nên m = 3, đủ để pull_back(m) kéo bè từ (5, 2) về (2, 2).'
      ]
    }),

    manBoCoDinh(6, 'luyen', {
      ten: 'Sửa hàm trả về cặp fix_pair_tow',
      chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop', 'pull_back', 'pair_step'],
      deBai: 'Chương trình chính đã khóa và gọi s, d = fix_pair_tow(1, 2) để tiến 1 ô, kéo lùi bè 2 ô vào bến (3, 1), tháo lưới và nhận về cặp a + b, b. Nhưng hàm fix_pair_tow(a, b) của màn đang quên gọi tow_drop() và trả về sai phần tử đầu. Hãy sửa lại hàm fix_pair_tow(a, b).',
      veMaMau: 'Chương trình chính đã khóa. Hãy sửa hàm fix_pair_tow(a, b) để tháo lưới bằng tow_drop() và return a + b, b.',
      san: [
        '.~....',
        '~~~q~B',
        '.q....',
        '.~....',
        '.~....',
        '.B....'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(
        [
          's, d = fix_pair_tow(1, 2)',
          'turn_right()',
          'forward(d)',
          'pull_back(s)'
        ],
        [ham('fix_pair_tow', ['forward(a)', 'pull_back(b)', 'return a, b'], ['a', 'b'])]
      ),
      loiGiai: bai(
        [
          's, d = fix_pair_tow(1, 2)',
          'turn_right()',
          'forward(d)',
          'pull_back(s)'
        ],
        [ham('fix_pair_tow', ['forward(a)', 'pull_back(b)', 'tow_drop()', 't = a + b', 'return t, b'], ['a', 'b'])]
      ),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: thiếu tow_drop() nên khi đi xuống nhánh dọc kéo bè đầu rời khỏi bến (3, 1)', baiLam: bai(['s, d = fix_pair_tow(1, 2)', 'turn_right()', 'forward(d)', 'pull_back(s)'], [ham('fix_pair_tow', ['forward(a)', 'pull_back(b)', 'return a, b'], ['a', 'b'])]), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Đã thêm tow_drop() nhưng quên sửa return a, b thành return a + b, b: s chỉ bằng 1 nên kéo bè thứ hai thiếu 2 ô', baiLam: bai(['s, d = fix_pair_tow(1, 2)', 'turn_right()', 'forward(d)', 'pull_back(s)'], [ham('fix_pair_tow', ['forward(a)', 'pull_back(b)', 'tow_drop()', 'return a, b'], ['a', 'b'])]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 30, nhip: 12 },
      goiY: [
        'Thêm dòng tow_drop() ngay sau pull_back(b) trong hàm fix_pair_tow(a, b).',
        'Sửa dòng cuối của fix_pair_tow thành return a + b, b để s = 3, kéo bè thứ hai từ (1, 5) về bến (1, 2).'
      ]
    }),

    manBoCoDinh(7, 'luyen', {
      ten: 'So sánh hai bộ cố định',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop', 'pull_back', 'pair_step'],
      deBai: 'Trong Python, hai tuple được so sánh lần lượt từ phần tử đầu tiên: (3, 1) > (2, 5) là đúng vì 3 > 2; nếu phần tử đầu bằng nhau thì mới so tới phần tử thứ hai. Hàm max(p1, p2) cũng chọn bộ lớn hơn theo đúng quy tắc đó. Hãy dùng a, b = max((2, 1), (2, 3)) để lấy cặp bước lớn hơn, tiến a ô rồi gọi pull_back(b) kéo bè vào bến.',
      veMaMau: 'Dùng a, b = max((2, 1), (2, 3)) để lấy a = 2 và b = 3.',
      san: [
        '........',
        '~~~q~~B.',
        '........'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        'a, b = max((2, 1), (2, 3))',
        'forward(a)'
      ]),
      loiGiai: bai([
        'a, b = max((2, 1), (2, 3))',
        'forward(a)',
        'pull_back(b)'
      ]),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới tiến a ô, chưa gọi pull_back(b) để kéo bè', baiLam: bai(['a, b = max((2, 1), (2, 3))', 'forward(a)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dùng min thay vì max: b nhận 1 thay vì 3 nên kéo bè thiếu 2 ô', baiLam: bai(['a, b = min((2, 1), (2, 3))', 'forward(a)', 'pull_back(b)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Kéo bè bằng pull_back(a) thay vì pull_back(b): mới lùi 2 ô, thiếu 1 ô tới bến q', baiLam: bai(['a, b = max((2, 1), (2, 3))', 'forward(a)', 'pull_back(a)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 16, nhip: 6 },
      goiY: [
        'Hai bộ (2, 1) và (2, 3) có cùng phần tử đầu là 2, nên max chọn (2, 3) vì 3 > 1.',
        'Thêm dòng pull_back(b) ở cuối chương trình để bắt bè ở (6, 1) và kéo lùi 3 ô về bến (3, 1).'
      ]
    }),

    manBoCoDinh(8, 'thu-thach', {
      ten: 'Tạo hàm kéo cặp bước tow_pair',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop', 'pull_back'],
      taoHam: ['tow_pair'],
      deBai: 'Hãy đóng gói quy trình tiến tiếp cận, tung lưới kéo lùi bè về bến và tháo lưới thành hàm tow_pair(a, b) trong Xưởng hàm: tiến a ô bằng forward(a), gọi pull_back(b), gọi tow_drop(), rồi return a + b, b. Chương trình chính sẽ gọi s, d = tow_pair(1, 2) để xử lý bè đầu và dùng d cho bè thứ hai.',
      veMaMau: 'Tạo hàm tow_pair(a, b) gồm forward(a), pull_back(b), tow_drop() và return a + b, b.',
      san: [
        '.~....',
        '~~~q~B',
        '.~....',
        '.q....',
        '.~....',
        '.B....'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        's, d = tow_pair(1, 2)',
        'turn_right()',
        'tow_pair(d, d)'
      ]),
      loiGiai: bai(
        [
          's, d = tow_pair(1, 2)',
          'turn_right()',
          'tow_pair(d, d)'
        ],
        [],
        [ham('tow_pair', [
          'forward(a)',
          'pull_back(b)',
          'tow_drop()',
          't = a + b',
          'return t, b'
        ], ['a', 'b'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm tow_pair', baiLam: bai(['s, d = tow_pair(1, 2)', 'turn_right()', 'tow_pair(d, d)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong tow_pair quên gọi tow_drop(): khi đi xuống nhánh dọc kéo bè đầu rời khỏi bến (3, 1)', baiLam: bai(['s, d = tow_pair(1, 2)', 'turn_right()', 'tow_pair(d, d)']), hamCuaEmMoi: [ham('tow_pair', ['forward(a)', 'pull_back(b)', 't = a + b', 'return t, b'], ['a', 'b'])], phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Trong tow_pair trả về a, a thay vì a + b, b: d bằng 1 nên ở nhánh dọc chưa tiếp cận tới tầm lưới của bè thứ hai', baiLam: bai(['s, d = tow_pair(1, 2)', 'turn_right()', 'tow_pair(d, d)']), hamCuaEmMoi: [ham('tow_pair', ['forward(a)', 'pull_back(b)', 'tow_drop()', 'return a, a'], ['a', 'b'])], phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      sao: { o: 27, nhip: 12 },
      goiY: [
        'Thân hàm tow_pair(a, b) gồm 4 dòng: forward(a), pull_back(b), tow_drop(), return a + b, b.',
        'Sau tow_pair(1, 2), xuồng đã lùi về ngã ba (1, 1), bè đầu nằm ở (3, 1) và d = 2.'
      ]
    }),

    manBoCoDinh(9, 'thu-thach', {
      ten: 'Chuỗi hải trình cặp lệnh',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop', 'pull_back', 'pair_step', 'tow_pair'],
      deBai: 'Kết hợp các hàm đã chế tow_pair(a, b), pair_step(d, n) và pull_back(n) để giải cứu 2 chiếc bè: chiếc đầu kéo về bến (3, 1) bằng s, d = tow_pair(1, 2) đưa xuồng lùi về ngã ba (1, 1), sau đó dùng h, m = pair_step("R", d) xuống nhánh dưới và gọi pull_back(s) kéo chiếc bè thứ hai lùi 3 ô về bến q ở (1, 2).',
      veMaMau: 'Kết hợp s, d = tow_pair(1, 2), h, m = pair_step("R", d) và pull_back(s).',
      san: [
        '.~....',
        '~~~q~B',
        '.q....',
        '.~....',
        '.~....',
        '.B....'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        's, d = tow_pair(1, 2)'
      ]),
      loiGiai: bai([
        's, d = tow_pair(1, 2)',
        'h, m = pair_step("R", d)',
        'pull_back(s)'
      ]),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới đưa được bè đầu tiên vào bến (3, 1)', baiLam: bai(['s, d = tow_pair(1, 2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Truyền "L" thay vì "R" vào pair_step: xuồng rẽ trái tiến lên (1, 0) rồi đâm bờ', baiLam: bai(['s, d = tow_pair(1, 2)', 'h, m = pair_step("L", d)', 'pull_back(s)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Gọi pull_back(d) thay vì pull_back(s): bè thứ hai mới lùi 2 ô tới (1, 3), chưa tới bến (1, 2)', baiLam: bai(['s, d = tow_pair(1, 2)', 'h, m = pair_step("R", d)', 'pull_back(d)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 35, nhip: 12 },
      goiY: [
        's, d = tow_pair(1, 2) đưa bè đầu vào (3, 1), xuồng lùi về (1, 1) và trả về s = 3, d = 2.',
        'Gọi h, m = pair_step("R", d) để rẽ phải tiến 2 ô xuống (1, 3), cuối cùng pull_back(s) kéo bè từ (1, 5) về bến (1, 2).'
      ]
    }),

    manBoCoDinh(10, 'trum', {
      ten: 'Trùm: Hải đồ cặp tọa độ',
      huyHieu: { ma: 'bo-co-dinh', ten: 'Huy hiệu Bộ cố định tuple' },
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop', 'pull_back', 'pair_step', 'tow_pair'],
      nhipTheo: 'tong',
      deBai: 'Trên cả hai sân, hãy dùng s, d = tow_pair(1, 2) để kéo vật nổi đầu tiên vào bến (3, 1) và đưa xuồng lùi về ngã ba (1, 1), tiếp tục gọi h, m = pair_step("R", d) để xuống nhánh dọc (1, 3) rồi kéo tiếp vật nổi thứ hai ở (1, 6) lùi 3 ô về bến (1, 3) bằng tow_pair(1, s).',
      veMaMau: 'Kết hợp tow_pair và pair_step với các biến s, d gỡ cặp từ tuple trả về.',
      san: [
        [
          '.~....',
          '~~~q~B',
          '.~....',
          '.q....',
          '.~....',
          '.~....',
          '.L....'
        ],
        [
          '.~###.',
          '~~~q~L',
          '.~###.',
          '.q....',
          '.~....',
          '.~....',
          '.B....'
        ]
      ],
      batDau: [
        { x: 2, y: 1, huong: 1 },
        { x: 2, y: 1, huong: 1 }
      ],
      maMau: bai([]),
      loiGiai: bai([
        's, d = tow_pair(1, 2)',
        'h, m = pair_step("R", d)',
        'tow_pair(1, s)'
      ]),
      loiSai: [
        { moTa: 'Truyền "L" thay vì "R" vào pair_step: xuồng rẽ trái đâm bờ trên', baiLam: bai(['s, d = tow_pair(1, 2)', 'h, m = pair_step("L", d)', 'tow_pair(1, s)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Ở đoạn cuối gọi tow_pair(1, d) thay vì tow_pair(1, s): vật thứ hai mới lùi 2 ô tới (1, 4), chưa tới bến (1, 3)', baiLam: bai(['s, d = tow_pair(1, 2)', 'h, m = pair_step("R", d)', 'tow_pair(1, d)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Ở đoạn cuối gọi tow_pair(0, s) thay vì tow_pair(1, s): xuồng đứng ở (1, 3) cách vật ở (1, 6) tới 3 ô nên tung lưới hụt', baiLam: bai(['s, d = tow_pair(1, 2)', 'h, m = pair_step("R", d)', 'tow_pair(0, s)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      sao: { o: 32, nhip: 28 },
      goiY: [
        's, d = tow_pair(1, 2) đưa vật đầu vào bến (3, 1), xuồng lùi về (1, 1) và trả về s = 3, d = 2.',
        'Tiếp theo: h, m = pair_step("R", d) đưa xuồng xuống (1, 3), rồi tow_pair(1, s) tiến xuống (1, 4), bắt vật ở (1, 6) và kéo lùi 3 ô về bến (1, 3).'
      ]
    })
  ];

  if (M && M.them) M.manDayKeo = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();

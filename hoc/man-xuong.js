/* ============================================================================
   man-xuong.js — Mùa 5 (Bến sông) · Gói 1: Xuồng chân vịt
   Chương 1: xuong (10 màn) — Lướt sóng ra khơi (left_move, right_move, left_back, right_back, wait)
   Chương 2: ham-tra-ve (10 màn) — Hàm trả kết quả (Python A: return trong hàm)
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_XUONG = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];

  function bai(chinh, ham, moi) {
    return { chinh: chinh, hamCuaMan: ham || [], hamCuaEmMoi: moi || [] };
  }
  function ham(ten, than, thamSo) {
    return { ten: ten, than: than, thamSo: thamSo || [] };
  }

  function manXuong(so, hang, ds) {
    return Object.assign({
      chuong: 'xuong', so: so, hang: hang,
      vo: 'song', loaiRobot: 'xuong',
      robot: { than: 'xuong', tay: null, camBien: [] },
      hamGoc: GOC_XUONG.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for'],
      khung: { chinh: 10, moiHam: 10, cauTruc: ['for'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  function manTraVe(so, hang, ds) {
    return Object.assign({
      chuong: 'ham-tra-ve', so: so, hang: hang,
      vo: 'song', loaiRobot: 'xuong',
      robot: { than: 'xuong', tay: null, camBien: [] },
      hamGoc: GOC_XUONG.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      bienDem: true,
      cauTruc: ['for', 'if', 'return'],
      khung: { chinh: 10, moiHam: 10, cauTruc: ['for', 'if', 'return'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: xuong — Lướt sóng ra khơi (10 màn)
       ====================================================================== */
    manXuong(1, 'lam-quen', {
      ten: 'Hạ thủy xuồng máy',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move'],
      deBai: 'Xuồng máy có hai chân vịt trái và phải nhận cùng bộ lệnh với xe hai bánh: left_move() và right_move() cùng chạy trong một nhịp wait() sẽ đẩy xuồng tiến một ô nước. Hàm move() trong kho của em dùng lại được ngay trên mặt nước. Bấm Chạy để xem xuồng lướt tới phao đích.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy: bước đầu gọi trực tiếp hai chân vịt, ba bước sau gọi move().',
      san: ['.....', '~~~~Q', '.....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['left_move()', 'right_move()', 'wait()', 'move()', 'move()', 'move()']),
      loiGiai: bai(['left_move()', 'right_move()', 'wait()', 'move()', 'move()', 'move()']),
      sao: { o: 9, nhip: 4 },
      goiY: [
        'Hai chân vịt quay cùng lúc đẩy xuồng tiến thẳng 1 ô nước.',
        'Xuồng chỉ đi được trên mặt nước, không leo lên bờ đất hai bên.'
      ]
    }),

    manXuong(2, 'lam-quen', {
      ten: 'Hai chân vịt cùng đẩy',
      hamCuaEmCan: ['move'],
      deBai: 'Luồng nước thẳng dẫn tới phao đích cách xuồng 5 ô. Chương trình mẫu mới tiến 4 ô nên dừng trước phao. Hãy thêm 1 bước tiến nữa để xuồng cập phao đích.',
      veMaMau: 'Chạy thử: xuồng dừng cách phao đích 1 ô. Thêm move() vào cuối chương trình.',
      san: ['......', '~~~~~Q', '......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['move()', 'move()', 'move()', 'move()']),
      loiGiai: bai(['move()', 'move()', 'move()', 'move()', 'move()']),
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for để tiến 5 ô nước',
        baiLam: bai(['for i in range(5):', '    move()'])
      },
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới tiến 4 ô, thiếu 1 ô tới phao', baiLam: bai(['move()', 'move()', 'move()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ bật một chân vịt trái ở đầu: xuồng quay vào bờ đất', baiLam: bai(['left_move()', 'wait()', 'move()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 8, nhip: 5 },
      goiY: [
        'Đếm số ô nước từ mũi xuồng tới phao đích Q là 5 ô.',
        'Thêm một dòng move() nữa ở cuối chương trình.'
      ]
    }),

    manXuong(3, 'lam-quen', {
      ten: 'Bẻ lái tránh bờ đất',
      hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Kênh nước rẽ xuống rồi lại mở sang phải tới phao đích. Các hàm turn_right() và turn_left() trong kho của em quay mũi xuồng đúng 90 độ trên mặt nước. Hãy hoàn thành đoạn cuối để xuồng cập phao.',
      veMaMau: 'Mã mẫu đã đưa xuồng tới góc kênh dưới. Hãy rẽ trái rồi tiến vào phao đích.',
      san: [
        '~~~~.',
        '...~.',
        '...~Q'
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['move()', 'move()', 'move()', 'turn_right()', 'move()', 'move()']),
      loiGiai: bai(['move()', 'move()', 'move()', 'turn_right()', 'move()', 'move()', 'turn_left()', 'move()']),
      loiGiaiKhac: {
        moTa: 'Thêm chú thích ở khúc rẽ cuối',
        baiLam: bai(['# tiến dọc kênh rồi rẽ vào phao', 'move()', 'move()', 'move()', 'turn_right()', 'move()', 'move()', 'turn_left()', 'move()'])
      },
      loiSai: [
        { moTa: 'Không sửa gì: xuồng dừng ở góc kênh dưới, chưa vào phao', baiLam: bai(['move()', 'move()', 'move()', 'turn_right()', 'move()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ phải ở góc dưới: mũi xuồng quay vào bờ đất bên trái', baiLam: bai(['move()', 'move()', 'move()', 'turn_right()', 'move()', 'move()', 'turn_right()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 8 },
      goiY: [
        'Khi xuồng đang hướng xuống dưới, bên phía phao Q là bên trái của xuồng.',
        'Thêm turn_left() rồi move() ở cuối chương trình.'
      ]
    }),

    manXuong(4, 'lam-quen', {
      ten: 'Kênh thẳng dài',
      hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Kênh ngang dài 5 ô nước rồi ngoặt xuống 3 ô tới phao đích. Hãy dùng vòng lặp for cho đoạn kênh dọc phía sau khúc rẽ.',
      veMaMau: 'Đoạn ngang và lệnh rẽ phải đã có sẵn. Viết thêm vòng lặp tiến 3 ô xuống phao đích.',
      san: [
        '~~~~~~',
        '.....~',
        '.....~',
        '.....Q'
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['for i in range(5):', '    move()', 'turn_right()']),
      loiGiai: bai(['for i in range(5):', '    move()', 'turn_right()', 'for i in range(3):', '    move()']),
      loiGiaiKhac: {
        moTa: 'Gọi 3 lần move() sau khi rẽ phải',
        baiLam: bai(['for i in range(5):', '    move()', 'turn_right()', 'move()', 'move()', 'move()'])
      },
      loiSai: [
        { moTa: 'Chưa viết đoạn sau khi rẽ: xuồng đứng ở góc kênh', baiLam: bai(['for i in range(5):', '    move()', 'turn_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Vòng lặp sau chỉ đi 2 ô: dừng trước phao đích', baiLam: bai(['for i in range(5):', '    move()', 'turn_right()', 'for i in range(2):', '    move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 10, nhip: 9 },
      goiY: [
        'Sau khi rẽ phải ở cột cuối, phao Q nằm cách 3 ô phía trước mũi xuồng.',
        'Thêm for i in range(3): rồi move() thụt vào trong.'
      ]
    }),

    manXuong(5, 'luyen', {
      ten: 'Khúc sông chữ Z',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left'],
      deBai: 'Con sông uốn chữ Z qua ba đoạn. Hàm forward(n) giúp xuồng tiến liền n ô nước thật gọn. Hãy điều khiển xuồng đi hết cả ba đoạn tới phao đích.',
      veMaMau: 'Mã mẫu đã đi đoạn đầu và rẽ phải. Hãy viết tiếp đoạn giữa và đoạn cuối.',
      san: [
        '~~~~..',
        '...~..',
        '...~~~',
        '.....~',
        '.....Q'
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['forward(3)', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['forward(3)', 'turn_right()', 'forward(2)', 'turn_left()', 'forward(2)', 'turn_right()', 'forward(2)']),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: xuồng dừng ở khúc uốn giữa sông', baiLam: bai(['forward(3)', 'turn_right()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ phải thay vì rẽ trái ở khúc giữa: xuồng lao vào bờ đất', baiLam: bai(['forward(3)', 'turn_right()', 'forward(2)', 'turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đoạn cuối chỉ tiến 1 ô: chưa tới phao Q', baiLam: bai(['forward(3)', 'turn_right()', 'forward(2)', 'turn_left()', 'forward(2)', 'turn_right()', 'forward(1)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 12 },
      goiY: [
        'Tại ô (3, 2), rẽ trái bằng turn_left() rồi forward(2) sang cột 5.',
        'Ở cột 5, rẽ phải bằng turn_right() rồi forward(2) xuống phao Q.'
      ]
    }),

    manXuong(6, 'luyen', {
      ten: 'Lùi xuồng khỏi hốc hẹp',
      hamCuaEmCan: ['move', 'back', 'turn_right', 'forward'],
      deBai: 'Xuồng đang đỗ sâu trong hốc kè đá, mũi hướng vào vách kè bên phải. Hãy dùng back() lùi 2 ô ra ngã rẽ, quay mũi xuống luồng chính rồi tiến tới phao đích.',
      veMaMau: 'Mã mẫu mới lùi 1 ô nên chưa tới ngã rẽ xuống luồng chính.',
      san: [
        '#~~~#',
        '#~###',
        '#~###',
        '#Q###'
      ],
      batDau: { x: 3, y: 0, huong: 1 },
      maMau: bai(['back()', 'turn_right()', 'forward(3)']),
      loiGiai: bai(['back()', 'back()', 'turn_right()', 'forward(3)']),
      loiSai: [
        { moTa: 'Chỉ lùi 1 ô rồi rẽ: lao vào bờ kè đá', baiLam: bai(['back()', 'turn_right()', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Tiến thẳng ngay từ đầu: húc vào vách kè trước mũi', baiLam: bai(['move()', 'back()', 'back()', 'turn_right()', 'forward(3)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Lùi đủ 2 ô nhưng rẽ trái: húc vào kè trên', baiLam: bai(['back()', 'back()', 'turn_left()', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 6 },
      goiY: [
        'Từ ô (3, 0) cần lùi 2 lần bằng back() để về ô ngã rẽ (1, 0).',
        'Tại (1, 0), gọi turn_right() để mũi xuồng hướng xuống rồi forward(3).'
      ]
    }),

    manXuong(7, 'luyen', {
      ten: 'Quay mũi trong vịnh',
      mucTieu: 'bong-mo',
      hamCuaEmCan: ['move', 'u_turn', 'forward', 'turn_right'],
      deBai: 'Xuồng đang ở cuối nhánh vịnh bên trái, mũi hướng vào bờ kè cụt phía dưới. Hãy dùng u_turn() quay đầu 180 độ, vòng qua luồng trên sang nhánh phải và đỗ đúng vị trí bóng mờ.',
      veMaMau: 'Dùng u_turn() để quay ngược mũi xuồng chỉ trong 1 nhịp.',
      san: [
        '#~~~~#',
        '#~##~#',
        '#~##~#',
        '######'
      ],
      batDau: { x: 1, y: 2, huong: 2 },
      bongMo: { x: 4, y: 2, huong: 2 },
      maMau: bai(['u_turn()', 'forward(2)', 'turn_right()']),
      loiGiai: bai(['u_turn()', 'forward(2)', 'turn_right()', 'forward(3)', 'turn_right()', 'forward(2)']),
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích trước khi chạy vòng qua vịnh',
        baiLam: bai(['# quay đầu rời nhánh trái sang nhánh phải', 'u_turn()', 'forward(2)', 'turn_right()', 'forward(3)', 'turn_right()', 'forward(2)'])
      },
      loiSai: [
        { moTa: 'Quên u_turn() đầu tiên: xuồng tiến thẳng vào bờ kè cụt', baiLam: bai(['forward(2)', 'turn_right()', 'forward(3)']), phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Đi ngang 2 ô thay vì 3 ô: rẽ xuống trúng vách đá giữa vịnh', baiLam: bai(['u_turn()', 'forward(2)', 'turn_right()', 'forward(2)', 'turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong', 'lech-bong-mo'] }
      ],
      sao: { o: 16, nhip: 10 },
      goiY: [
        'Sau u_turn(), gọi forward(2) để lên góc trên trái (1, 0).',
        'Từ (1, 0): turn_right(), forward(3) sang (4, 0), rồi turn_right(), forward(2) xuống bóng mờ.'
      ]
    }),

    manXuong(8, 'bien-the', {
      ten: 'Ba khúc quanh bờ kè',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left'],
      deBai: 'Luồng nước uốn 3 bậc giống hệt nhau: mỗi bậc tiến 2 ô, rẽ phải, tiến 1 ô rồi rẽ trái. Hãy đặt 4 lệnh đó vào vòng lặp for để đưa xuồng tới phao đích.',
      veMaMau: 'Mã mẫu mới lặp 2 bậc nên dừng trước bậc cuối.',
      san: [
        '~~~####',
        '##~~~##',
        '####~~~',
        '######Q'
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['for i in range(2):', '    forward(2)', '    turn_right()', '    move()', '    turn_left()']),
      loiGiai: bai(['for i in range(3):', '    forward(2)', '    turn_right()', '    move()', '    turn_left()']),
      loiSai: [
        { moTa: 'Chỉ lặp 2 lần: xuồng dừng ở bậc thứ hai', baiLam: bai(['for i in range(2):', '    forward(2)', '    turn_right()', '    move()', '    turn_left()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Mỗi bậc chỉ tiến 1 ô ngang: rẽ xuống trúng bờ kè', baiLam: bai(['for i in range(3):', '    forward(1)', '    turn_right()', '    move()', '    turn_left()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên turn_left() cuối mỗi bậc: bậc hai đi thẳng xuống bờ kè', baiLam: bai(['for i in range(3):', '    forward(2)', '    turn_right()', '    move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 14 },
      goiY: [
        'Có tất cả 3 bậc từ hàng 0 xuống hàng 3.',
        'Đổi range(2) thành range(3) là xuồng đi trọn 3 bậc tới phao Q.'
      ]
    }),

    manXuong(9, 'bien-the', {
      ten: 'Lách qua cồn cát',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left'],
      deBai: 'Hai cồn cát chắn giữa sông buộc xuồng phải lách qua luồng hẹp rồi vòng ngược về phao đích ở góc dưới. Hãy hoàn thành lộ trình vòng qua hai cồn cát.',
      veMaMau: 'Mã mẫu đã đưa xuồng qua cồn cát đầu tiên tới mép phải. Hãy viết tiếp phần vòng xuống phao đích.',
      san: [
        '~~~~.#.',
        '...~.#.',
        '...~~~~',
        '......~',
        '...Q~~~'
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['forward(3)', 'turn_right()', 'forward(2)', 'turn_left()', 'forward(3)']),
      loiGiai: bai(['forward(3)', 'turn_right()', 'forward(2)', 'turn_left()', 'forward(3)', 'turn_right()', 'forward(2)', 'turn_right()', 'forward(3)']),
      loiSai: [
        { moTa: 'Dừng ở mép phải hàng 2: chưa vòng xuống phao Q', baiLam: bai(['forward(3)', 'turn_right()', 'forward(2)', 'turn_left()', 'forward(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Ở góc dưới phải rẽ trái thay vì rẽ phải: lao ra ngoài bờ', baiLam: bai(['forward(3)', 'turn_right()', 'forward(2)', 'turn_left()', 'forward(3)', 'turn_right()', 'forward(2)', 'turn_left()', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 18, nhip: 17 },
      goiY: [
        'Từ ô (6, 2), gọi turn_right() rồi forward(2) để xuống góc dưới phải (6, 4).',
        'Tại (6, 4), gọi turn_right() lần nữa rồi forward(3) về phao Q ở (3, 4).'
      ]
    }),

    manXuong(10, 'trum', {
      ten: 'Trùm: Vượt luồng ra cửa sông',
      huyHieu: { ma: 'xuong', ten: 'Huy hiệu Lướt sóng ra khơi' },
      hamCuaEmCan: ['move', 'back', 'forward', 'turn_right', 'turn_left'],
      nhipTheo: 'tong',
      deBai: 'Xuồng đỗ trong hốc hẹp ở đầu kênh, mũi hướng vào kè đá. Hãy lùi 2 ô ra đầu luồng, quay mũi xuống rồi dùng vòng lặp vượt qua hai bậc kênh gấp khúc để ra tới phao cửa sông trên cả hai sân.',
      veMaMau: 'Viết toàn bộ chương trình: lùi khỏi hốc, quay xuống, lặp 2 bậc kênh rồi tiến bước cuối vào phao.',
      san: [
        [
          '~~~####',
          '~######',
          '~~~~###',
          '###~###',
          '###~~~~',
          '######Q'
        ],
        [
          '~~~#...',
          '~###...',
          '~~~~.#.',
          '...~.#.',
          '...~~~~',
          '......Q'
        ]
      ],
      batDau: [
        { x: 2, y: 0, huong: 1 },
        { x: 2, y: 0, huong: 1 }
      ],
      maMau: bai([]),
      loiGiai: bai([
        'back()',
        'back()',
        'turn_right()',
        'for i in range(2):',
        '    forward(2)',
        '    turn_left()',
        '    forward(3)',
        '    turn_right()',
        'move()'
      ]),
      loiSai: [
        { moTa: 'Chỉ lùi 1 ô đã rẽ xuống: vướng bờ kè ngay đầu kênh', baiLam: bai(['back()', 'turn_right()', 'for i in range(2):', '    forward(2)', '    turn_left()', '    forward(3)', '    turn_right()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Trong vòng lặp chỉ đi ngang 2 ô: rẽ xuống trúng bờ', baiLam: bai(['back()', 'back()', 'turn_right()', 'for i in range(2):', '    forward(2)', '    turn_left()', '    forward(2)', '    turn_right()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên bước move() cuối sau vòng lặp: dừng sát trên phao Q', baiLam: bai(['back()', 'back()', 'turn_right()', 'for i in range(2):', '    forward(2)', '    turn_left()', '    forward(3)', '    turn_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 21, nhip: 36 },
      goiY: [
        'Lùi 2 lần bằng back() về (0, 0), rồi turn_right() để mũi xuồng hướng xuống.',
        'Mỗi bậc gồm: forward(2), turn_left(), forward(3), turn_right(); lặp 2 lần rồi move() vào Q.'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: ham-tra-ve — Hàm trả kết quả (10 màn)
       ====================================================================== */
    manTraVe(1, 'lam-quen', {
      ten: 'Hàm trả kết quả về',
      chiChay: true, chinhCoDinh: true, khoaHamMan: ['total_run'],
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Trong Python, từ khóa return gửi kết quả tính được từ trong hàm ra ngoài chỗ gọi hàm. Hàm total_run(a, b) cộng hai chặng a và b rồi trả tổng về cho biến d. Bấm Chạy để xem d nhận giá trị 6 và forward(d) đưa xuồng tới phao.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy: total_run(4, 2) trả về 6 cho biến d.',
      san: ['.......', '~~~~~~Q', '.......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['d = total_run(4, 2)', 'forward(d)'], [ham('total_run', ['return a + b'], ['a', 'b'])]),
      loiGiai: bai(['d = total_run(4, 2)', 'forward(d)'], [ham('total_run', ['return a + b'], ['a', 'b'])]),
      sao: { o: 7, nhip: 6 },
      goiY: [
        'return a + b tính tổng a + b và gửi số đó về cho biến d ở chương trình chính.',
        'Khi d bằng 6, forward(d) tiến đúng 6 ô nước.'
      ]
    }),

    manTraVe(2, 'lam-quen', {
      ten: 'Nhận số từ hàm',
      khoaHamMan: ['add_one'],
      hamCuaEmCan: ['move', 'forward', 'turn_right'],
      deBai: 'Hàm add_one(n) của màn trả về n + 1. Chặng ngang cần đi 3 ô nên gọi add_one(2); chặng dọc sau khi rẽ phải cần đi 4 ô tới phao đích. Hãy sửa đối số của lần gọi add_one thứ hai.',
      veMaMau: 'Chạy thử: s2 = add_one(1) chỉ trả về 2 nên xuồng dừng giữa chặng dọc. Đổi đối số trong add_one(1).',
      san: [
        '~~~~.',
        '...~.',
        '...~.',
        '...~.',
        '...Q.'
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['s1 = add_one(2)', 'forward(s1)', 'turn_right()', 's2 = add_one(1)', 'forward(s2)'], [ham('add_one', ['return n + 1'], ['n'])]),
      loiGiai: bai(['s1 = add_one(2)', 'forward(s1)', 'turn_right()', 's2 = add_one(3)', 'forward(s2)'], [ham('add_one', ['return n + 1'], ['n'])]),
      loiGiaiKhac: {
        moTa: 'Thêm chú thích giải thích giá trị trả về',
        baiLam: bai(['# add_one(3) trả về 4 ô cho chặng dọc', 's1 = add_one(2)', 'forward(s1)', 'turn_right()', 's2 = add_one(3)', 'forward(s2)'], [ham('add_one', ['return n + 1'], ['n'])])
      },
      loiSai: [
        { moTa: 'Để nguyên add_one(1): chặng dọc chỉ tiến 2 ô', baiLam: bai(['s1 = add_one(2)', 'forward(s1)', 'turn_right()', 's2 = add_one(1)', 'forward(s2)'], [ham('add_one', ['return n + 1'], ['n'])]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Truyền add_one(2) cho chặng dọc: tiến 3 ô, vẫn thiếu 1 ô tới phao', baiLam: bai(['s1 = add_one(2)', 'forward(s1)', 'turn_right()', 's2 = add_one(2)', 'forward(s2)'], [ham('add_one', ['return n + 1'], ['n'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 12, nhip: 8 },
      goiY: [
        'Chặng dọc từ hàng 0 xuống hàng 4 dài 4 ô.',
        'Muốn add_one(n) trả về 4 thì truyền n bằng 3: s2 = add_one(3).'
      ]
    }),

    manTraVe(3, 'lam-quen', {
      ten: 'Chế lệnh: cộng hai chặng',
      taoHam: ['span_dist'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right'],
      deBai: 'Tạo hàm span_dist(a, b) nhận hai số a, b: tính d = a + b, gọi forward(d) để xuồng đi hết chặng gộp đó, rồi dùng return d trả tổng số ô vừa đi về cho chương trình chính.',
      veMaMau: 'Mở Xưởng hàm, tạo span_dist(a, b) gồm 3 dòng: d = a + b, forward(d), return d.',
      san: [
        '~~~~~#',
        '....~#',
        '....~#',
        '....~#',
        '....Q#'
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['d = span_dist(2, 2)', 'turn_right()', 'forward(d)']),
      loiGiai: bai(
        ['d = span_dist(2, 2)', 'turn_right()', 'forward(d)'],
        [],
        [ham('span_dist', ['d = a + b', 'forward(d)', 'return d'], ['a', 'b'])]
      ),
      loiGiaiKhac: {
        moTa: 'Thêm chú thích trong hàm span_dist',
        baiLam: bai(
          ['d = span_dist(2, 2)', 'turn_right()', 'forward(d)'],
          [],
          [ham('span_dist', ['# tiến a + b ô rồi trả về d', 'd = a + b', 'forward(d)', 'return d'], ['a', 'b'])]
        ),
        hamCuaEmMoi: [ham('span_dist', ['# tiến a + b ô rồi trả về d', 'd = a + b', 'forward(d)', 'return d'], ['a', 'b'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm span_dist', baiLam: bai(['d = span_dist(2, 2)', 'turn_right()', 'forward(d)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trả về a thay vì d: đoạn dọc chỉ tiến 2 ô, chưa tới phao Q', baiLam: bai(['d = span_dist(2, 2)', 'turn_right()', 'forward(d)']), hamCuaEmMoi: [ham('span_dist', ['d = a + b', 'forward(d)', 'return a'], ['a', 'b'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 13, nhip: 9 },
      goiY: [
        'Thân hàm span_dist(a, b) gồm: d = a + b, forward(d), và return d.',
        'Khi span_dist(2, 2) chạy xong, xuồng đã tiến 4 ô và biến d ở ngoài nhận giá trị 4.'
      ]
    }),

    manTraVe(4, 'luyen', {
      ten: 'Ghép nhịp chèo qua vịnh',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'span_dist'],
      deBai: 'Hàm span_dist(a, b) vừa đưa xuồng tiến a + b ô vừa trả số ô đó về. Hãy dùng span_dist cho hai chặng đầu và dùng biến nhận được để đi nốt chặng cuối tới phao đích.',
      veMaMau: 'Hai chặng đầu đã viết sẵn và lưu d = span_dist(1, 2). Hãy rẽ trái rồi gọi forward(d).',
      san: [
        '~~~~~...',
        '....~...',
        '....~...',
        '....~~~Q'
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['span_dist(2, 2)', 'turn_right()', 'd = span_dist(1, 2)']),
      loiGiai: bai(['span_dist(2, 2)', 'turn_right()', 'd = span_dist(1, 2)', 'turn_left()', 'forward(d)']),
      loiSai: [
        { moTa: 'Chưa viết chặng cuối: dừng ở góc dưới (4, 3)', baiLam: bai(['span_dist(2, 2)', 'turn_right()', 'd = span_dist(1, 2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ phải ở góc dưới thay vì rẽ trái: lao vào bờ đất', baiLam: bai(['span_dist(2, 2)', 'turn_right()', 'd = span_dist(1, 2)', 'turn_right()', 'forward(d)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 12 },
      goiY: [
        'Biến d đang giữ giá trị 3 do span_dist(1, 2) trả về.',
        'Thêm turn_left() rồi forward(d) ở cuối chương trình.'
      ]
    }),

    manTraVe(5, 'luyen', {
      ten: 'Chế lệnh: nhân đôi quãng đường',
      taoHam: ['round_steps'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right'],
      deBai: 'Khi luồng sông mở rộng, chặng đầu đi d ô còn chặng sau dài gấp đôi (d * 2 ô). Hãy tạo hàm round_steps(d): gọi forward(d) để đi chặng đầu rồi return d * 2 để trả độ dài chặng sau.',
      veMaMau: 'Mở Xưởng hàm, tạo round_steps(d) gồm 2 dòng: forward(d) và return d * 2.',
      san: [
        '~~~.',
        '..~.',
        '..~.',
        '..~.',
        '..Q.'
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['n = round_steps(2)', 'turn_right()', 'forward(n)']),
      loiGiai: bai(
        ['n = round_steps(2)', 'turn_right()', 'forward(n)'],
        [],
        [ham('round_steps', ['forward(d)', 'return d * 2'], ['d'])]
      ),
      loiGiaiKhac: {
        moTa: 'Trả về d + d thay cho d * 2',
        baiLam: bai(
          ['n = round_steps(2)', 'turn_right()', 'forward(n)'],
          [],
          [ham('round_steps', ['forward(d)', 'return d + d'], ['d'])]
        ),
        hamCuaEmMoi: [ham('round_steps', ['forward(d)', 'return d + d'], ['d'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm round_steps', baiLam: bai(['n = round_steps(2)', 'turn_right()', 'forward(n)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trả về d thay vì d * 2: chặng dọc chỉ tiến 2 ô, chưa tới phao Q', baiLam: bai(['n = round_steps(2)', 'turn_right()', 'forward(n)']), hamCuaEmMoi: [ham('round_steps', ['forward(d)', 'return d'], ['d'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 12, nhip: 7 },
      goiY: [
        'Dòng đầu của round_steps(d) là forward(d) để xuồng tiến d ô.',
        'Dòng thứ hai là return d * 2 để trả số ô gấp đôi cho biến n.'
      ]
    }),

    manTraVe(6, 'luyen', {
      ten: 'Chế lệnh: cộng đà nước êm',
      taoHam: ['calm_bonus'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'round_steps'],
      deBai: 'Tạo hàm calm_bonus(d, extra): gọi n = round_steps(d) để tiến d ô và nhận số gấp đôi n, sau đó gọi forward(extra) để lướt thêm extra ô đà, rồi return n + extra.',
      veMaMau: 'Trong calm_bonus(d, extra), kết hợp round_steps(d), forward(extra) và return n + extra.',
      san: [
        '~~~~.',
        '...~.',
        '...~.',
        '...~.',
        '...~.',
        '...Q.'
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['m = calm_bonus(2, 1)', 'turn_right()', 'forward(m)']),
      loiGiai: bai(
        ['m = calm_bonus(2, 1)', 'turn_right()', 'forward(m)'],
        [],
        [ham('calm_bonus', ['n = round_steps(d)', 'forward(extra)', 'return n + extra'], ['d', 'extra'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm calm_bonus', baiLam: bai(['m = calm_bonus(2, 1)', 'turn_right()', 'forward(m)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi forward(extra): xuồng rẽ sớm vào bờ đất', baiLam: bai(['m = calm_bonus(2, 1)', 'turn_right()', 'forward(m)']), hamCuaEmMoi: [ham('calm_bonus', ['n = round_steps(d)', 'return n + extra'], ['d', 'extra'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ return n mà quên cộng extra: đoạn dọc dừng trước phao Q 1 ô', baiLam: bai(['m = calm_bonus(2, 1)', 'turn_right()', 'forward(m)']), hamCuaEmMoi: [ham('calm_bonus', ['n = round_steps(d)', 'forward(extra)', 'return n'], ['d', 'extra'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 9 },
      goiY: [
        'n = round_steps(2) giúp xuồng tiến 2 ô và nhận n = 4.',
        'Tiếp theo forward(extra) tiến thêm 1 ô tới (3, 0), rồi return n + extra trả về 5.'
      ]
    }),

    manTraVe(7, 'luyen', {
      ten: 'Chế lệnh: rẽ theo mã trả về',
      taoHam: ['turn_code'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left'],
      deBai: 'Lệnh return kết thúc hàm ngay lập tức. Hãy tạo hàm turn_code(side): nếu side == "R" thì gọi turn_right() và return 2; ngược lại gọi turn_left() và return 3. Chương trình chính dùng vừa lệnh rẽ vừa số ô trả về.',
      veMaMau: 'Khi gặp return 2 trong nhánh if, hàm dừng ngay nên các dòng bên dưới không chạy nữa.',
      san: [
        '~~...',
        '.~...',
        '.~~~~',
        '....~',
        '....Q'
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['move()', 'n1 = turn_code("R")', 'forward(n1)', 'n2 = turn_code("L")', 'forward(n2)', 'n3 = turn_code("R")', 'forward(n3)']),
      loiGiai: bai(
        ['move()', 'n1 = turn_code("R")', 'forward(n1)', 'n2 = turn_code("L")', 'forward(n2)', 'n3 = turn_code("R")', 'forward(n3)'],
        [],
        [ham('turn_code', ['if side == "R":', '    turn_right()', '    return 2', 'turn_left()', 'return 3'], ['side'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm turn_code', baiLam: bai(['move()', 'n1 = turn_code("R")', 'forward(n1)', 'n2 = turn_code("L")', 'forward(n2)', 'n3 = turn_code("R")', 'forward(n3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên return 2 trong nhánh if: xuồng rẽ phải xong lại rẽ trái luôn', baiLam: bai(['move()', 'n1 = turn_code("R")', 'forward(n1)', 'n2 = turn_code("L")', 'forward(n2)', 'n3 = turn_code("R")', 'forward(n3)']), hamCuaEmMoi: [ham('turn_code', ['if side == "R":', '    turn_right()', 'turn_left()', 'return 3'], ['side'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 21, nhip: 11 },
      goiY: [
        'Trong nhánh if side == "R": gọi turn_right() rồi return 2.',
        'Ngoài nhánh if: gọi turn_left() rồi return 3.'
      ]
    }),

    manTraVe(8, 'bien-the', {
      ten: 'Sửa hàm: trả thiếu chặng sau',
      chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_left', 'turn_right'],
      deBai: 'Hàm fix_span(a, b) của màn đã tính tổng total = a + b và đưa xuồng tiến total ô, nhưng dòng return lại trả nhầm biến a khiến chặng sau đi thiếu đường. Hãy sửa dòng return trong fix_span.',
      veMaMau: 'Chạy thử: fix_span(2, 1) tiến 3 ô nhưng chỉ trả về 2 nên sau khi rẽ trái xuồng dừng giữa chừng. Sửa return a thành return total.',
      san: [
        '...~~Q',
        '...~..',
        '...~..',
        '~~~~..'
      ],
      batDau: { x: 0, y: 3, huong: 1 },
      maMau: bai(
        ['d = fix_span(2, 1)', 'turn_left()', 'forward(d)', 'turn_right()', 'forward(2)'],
        [ham('fix_span', ['total = a + b', 'forward(total)', 'return a'], ['a', 'b'])]
      ),
      loiGiai: bai(
        ['d = fix_span(2, 1)', 'turn_left()', 'forward(d)', 'turn_right()', 'forward(2)'],
        [ham('fix_span', ['total = a + b', 'forward(total)', 'return total'], ['a', 'b'])]
      ),
      loiSai: [
        { moTa: 'Để nguyên return a: đoạn dọc chỉ lên 2 ô, rẽ phải đâm vào bờ đất', baiLam: bai(['d = fix_span(2, 1)', 'turn_left()', 'forward(d)', 'turn_right()', 'forward(2)'], [ham('fix_span', ['total = a + b', 'forward(total)', 'return a'], ['a', 'b'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đổi thành return b: đoạn dọc chỉ lên 1 ô, rẽ phải đâm bờ đất', baiLam: bai(['d = fix_span(2, 1)', 'turn_left()', 'forward(d)', 'turn_right()', 'forward(2)'], [ham('fix_span', ['total = a + b', 'forward(total)', 'return b'], ['a', 'b'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 10 },
      goiY: [
        'Biến total đã giữ tổng a + b bằng 3.',
        'Đổi dòng cuối của fix_span thành return total.'
      ]
    }),

    manTraVe(9, 'bien-the', {
      ten: 'Chế lệnh: đi góc vuông rồi báo tổng bước',
      taoHam: ['sail_to'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left'],
      deBai: 'Tạo hàm sail_to(a, b) điều khiển xuồng đi một khúc cua vuông góc: gọi forward(a), turn_right(), forward(b), rồi return a + b để báo tổng số ô đã đi trên hai cạnh.',
      veMaMau: 'Chương trình chính hứng d = sail_to(2, 2) rồi dùng d cho đoạn ngang cuối cùng tới phao đích.',
      san: [
        '~~~....',
        '..~....',
        '..~~~~Q'
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['d = sail_to(2, 2)', 'turn_left()', 'forward(d)']),
      loiGiai: bai(
        ['d = sail_to(2, 2)', 'turn_left()', 'forward(d)'],
        [],
        [ham('sail_to', ['forward(a)', 'turn_right()', 'forward(b)', 'return a + b'], ['a', 'b'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm sail_to', baiLam: bai(['d = sail_to(2, 2)', 'turn_left()', 'forward(d)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi forward(b) trong sail_to: xuồng chưa xuống tới hàng 2 đã rẽ', baiLam: bai(['d = sail_to(2, 2)', 'turn_left()', 'forward(d)']), hamCuaEmMoi: [ham('sail_to', ['forward(a)', 'turn_right()', 'return a + b'], ['a', 'b'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Trả về a thay vì a + b: đoạn cuối chỉ tiến 2 ô, dừng trước phao Q', baiLam: bai(['d = sail_to(2, 2)', 'turn_left()', 'forward(d)']), hamCuaEmMoi: [ham('sail_to', ['forward(a)', 'turn_right()', 'forward(b)', 'return a'], ['a', 'b'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 10 },
      goiY: [
        'Thân hàm sail_to(a, b) gồm 4 dòng: forward(a), turn_right(), forward(b), return a + b.',
        'Khi sail_to(2, 2) chạy xong, xuồng ở (2, 2) và trả về d = 4 cho forward(d).'
      ]
    }),

    manTraVe(10, 'trum', {
      ten: 'Trùm: Hải trình tính sẵn',
      huyHieu: { ma: 'ham-tra-ve', ten: 'Huy hiệu Hàm trả kết quả' },
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'turn_code', 'sail_to'],
      nhipTheo: 'tong',
      deBai: 'Đưa xuồng vượt qua tuyến kênh tới phao đích trên cả hai sân. Dùng d = sail_to(2, 2) để đi khúc cua đầu (tiến 2 ô, rẽ phải, tiến 2 ô) và nhận tổng bước d = 4; sau đó gọi n = turn_code("L") để rẽ trái và nhận n = 3, tiến n ô, rồi rẽ phải và tiến đúng d ô tới phao.',
      veMaMau: 'Kết hợp sail_to(2, 2), turn_code("L") và forward với các biến d, n nhận giá trị trả về.',
      san: [
        [
          '~~~###',
          '..~###',
          '..~~~~',
          '.....~',
          '.....~',
          '.....~',
          '.....Q'
        ],
        [
          '~~~...',
          '..~.#.',
          '..~~~~',
          '.#...~',
          '.#...~',
          '.....~',
          '.....Q'
        ]
      ],
      batDau: [
        { x: 0, y: 0, huong: 1 },
        { x: 0, y: 0, huong: 1 }
      ],
      maMau: bai([]),
      loiGiai: bai([
        'd = sail_to(2, 2)',
        'n = turn_code("L")',
        'forward(n)',
        'turn_right()',
        'forward(d)'
      ]),
      loiSai: [
        { moTa: 'Gọi turn_code("R") thay vì "L" sau sail_to: xuồng quay vào bờ', baiLam: bai(['d = sail_to(2, 2)', 'n = turn_code("R")', 'forward(n)', 'turn_right()', 'forward(d)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên gọi forward(n) sau turn_code("L"): xuồng chỉ quay mà không tiến sang cột 5', baiLam: bai(['d = sail_to(2, 2)', 'n = turn_code("L")', 'turn_right()', 'forward(d)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đoạn cuối dùng n (bằng 3) thay vì d (bằng 4): dừng trước phao Q 1 ô', baiLam: bai(['d = sail_to(2, 2)', 'n = turn_code("L")', 'forward(n)', 'turn_right()', 'forward(n)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 23, nhip: 28 },
      goiY: [
        'd = sail_to(2, 2) đưa xuồng tới (2, 2) hướng xuống và trả về d = 4.',
        'Tiếp theo: n = turn_code("L"), forward(n), turn_right(), forward(d).'
      ]
    })
  ];

  if (M && M.them) M.manXuong = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = DS;
})();

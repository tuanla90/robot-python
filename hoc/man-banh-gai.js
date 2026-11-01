/* ============================================================================
   man-banh-gai.js — Mùa 8 (Hang động đá vôi) · Gói 1: Bánh gai
   Chương 1: banh-gai (10 màn) — Bám đá vôi ướt (left_move, right_move, left_back, right_back, wait)
   Chương 2: tu-dien (10 màn) — Từ điển tra cứu (Python dict: {}, d[k], d[k] = v, k in d, for k in d, len(d))
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_GAI = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];

  function bai(chinh, ham, moi) {
    return { chinh: chinh, hamCuaMan: ham || [], hamCuaEmMoi: moi || [] };
  }
  function ham(ten, than, thamSo) {
    return { ten: ten, than: than, thamSo: thamSo || [] };
  }

  function manGai(so, hang, ds) {
    return Object.assign({
      chuong: 'banh-gai', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: { than: 'gai', tay: null, camBien: [] },
      hamGoc: GOC_GAI.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for'],
      khung: { chinh: 10, moiHam: 10, cauTruc: ['for'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  function manTuDien(so, hang, ds) {
    return Object.assign({
      chuong: 'tu-dien', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: { than: 'gai', tay: null, camBien: [] },
      hamGoc: GOC_GAI.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      bienDem: true,
      cauTruc: ['for', 'if', 'return', 'list'],
      khung: { chinh: 12, moiHam: 10, cauTruc: ['for', 'if', 'return', 'list'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: banh-gai — Bám đá vôi ướt (10 màn)
       ====================================================================== */
    manGai(1, 'lam-quen', {
      ten: 'Bánh gai xuống hang',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move'],
      deBai: 'Sàn đá vôi ướt làm bánh thường trượt dài, nhưng bánh gai luôn bám chắc từng ô một. Các hàm move(), forward(), turn_right(), turn_left() trong kho của em dùng lại được ngay trên bánh gai. Bấm Chạy để xem robot bước qua nền đá vôi ướt tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy: bước đầu gọi trực tiếp hai bánh gai, hai bước sau gọi move().',
      san: [
        '######',
        '#.IIF#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['left_move()', 'right_move()', 'wait()', 'move()', 'move()']),
      loiGiai: bai(['left_move()', 'right_move()', 'wait()', 'move()', 'move()']),
      sao: { o: 8, nhip: 3 },
      goiY: [
        'Bánh gai bám chắc trên ô đá vôi ướt I, mỗi nhịp tiến đúng 1 ô.',
        'Nhấn nút Chạy để hoàn thành màn làm quen.'
      ]
    }),

    manGai(2, 'lam-quen', {
      ten: 'Đếm bước trên đá ướt',
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Dải đá vôi ướt dẫn thẳng tới cờ cách robot 4 bước. Mã mẫu mới đi 3 bước nên dừng trước cờ 1 ô. Hãy sửa đối số của forward() để robot tới đúng lá cờ.',
      veMaMau: 'Chạy thử: forward(3) dừng ở ô (4, 1). Đổi số bước trong forward(3) thành 4.',
      san: [
        '#######',
        '#.IIIF#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['forward(3)']),
      loiGiai: bai(['forward(4)']),
      loiSai: [
        { moTa: 'Để nguyên forward(3): dừng trước cờ 1 ô', baiLam: bai(['forward(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 6, nhip: 4 },
      goiY: [
        'Từ ô (1, 1) tới cờ ở (5, 1) là 4 bước.',
        'Sửa forward(3) thành forward(4).'
      ]
    }),

    manGai(3, 'lam-quen', {
      ten: 'Rẽ quanh hố sụt',
      hamCuaEmCan: ['move', 'forward', 'turn_right'],
      deBai: 'Giữa hang có hố sụt sâu (u). Bánh gai bám tốt trên đá ướt nhưng bước vào hố sụt vẫn sẽ rơi xuống. Hãy đi ngang 3 bước qua dải đá ướt, rẽ phải rồi đi xuống 2 bước tới cờ.',
      veMaMau: 'Đoạn ngang và lệnh rẽ phải đã có sẵn. Viết thêm lệnh tiến 2 ô xuống cờ.',
      san: [
        '######',
        '#.II.#',
        '#.uuI#',
        '####F#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['forward(3)', 'turn_right()']),
      loiGiai: bai(['forward(3)', 'turn_right()', 'forward(2)']),
      loiSai: [
        { moTa: 'Chưa viết đoạn sau khi rẽ: dừng ở góc (4, 1)', baiLam: bai(['forward(3)', 'turn_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ đi ngang 2 bước đã rẽ phải: rơi xuống hố sụt (3, 2)', baiLam: bai(['forward(2)', 'turn_right()', 'forward(2)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 10, nhip: 6 },
      goiY: [
        'Sau khi rẽ phải ở (4, 1), cờ nằm cách 2 ô phía trước mặt robot.',
        'Thêm dòng forward(2) vào cuối chương trình.'
      ]
    }),

    manGai(4, 'lam-quen', {
      ten: 'Lùi khỏi ngách cụt',
      hamCuaEmCan: ['move', 'back', 'forward', 'turn_right'],
      deBai: 'Robot đang đứng sát vách đá cuối ngách hẹp bên phải. Hãy dùng back() lùi 2 ô ra ngã ba, rẽ phải rồi tiến 3 bước xuống cờ.',
      veMaMau: 'Mã mẫu mới lùi 1 ô nên rẽ phải sẽ đâm vào vách đá.',
      san: [
        '######',
        '#.III#',
        '##I###',
        '##I###',
        '##F###',
        '######'
      ],
      batDau: { x: 4, y: 1, huong: 1 },
      maMau: bai(['back()', 'turn_right()', 'forward(3)']),
      loiGiai: bai(['back()', 'back()', 'turn_right()', 'forward(3)']),
      loiSai: [
        { moTa: 'Chỉ lùi 1 ô rồi rẽ: húc vào vách đá', baiLam: bai(['back()', 'turn_right()', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 6 },
      goiY: [
        'Robot đang nhìn sang phải ở (4, 1), cần lùi 2 lần bằng back() để về ngã ba (2, 1).',
        'Tại (2, 1), quay phải sẽ hướng xuống dưới để đi thẳng 3 ô tới cờ.'
      ]
    }),

    manGai(5, 'luyen', {
      ten: 'Chế lệnh: bước gai rẽ góc',
      taoHam: ['spike_step'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right'],
      deBai: 'Trong hang động có rất nhiều góc cua vuông. Hãy tạo hàm spike_step(n) gồm hai việc: tiến n bước bằng forward(n) rồi quay phải bằng turn_right(). Chương trình chính sẽ gọi spike_step(3) hai lần để tới cờ.',
      veMaMau: 'Mở Xưởng hàm, tạo spike_step(n) gồm 2 dòng: forward(n) và turn_right().',
      san: [
        '######',
        '#.II.#',
        '####I#',
        '####I#',
        '####F#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['spike_step(3)', 'spike_step(3)']),
      loiGiai: bai(
        ['spike_step(3)', 'spike_step(3)'],
        [],
        [ham('spike_step', ['forward(n)', 'turn_right()'], ['n'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm spike_step', baiLam: bai(['spike_step(3)', 'spike_step(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi turn_right() trong spike_step: đâm tường ở cuối đoạn ngang', baiLam: bai(['spike_step(3)', 'spike_step(3)']), hamCuaEmMoi: [ham('spike_step', ['forward(n)'], ['n'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 11, nhip: 7 },
      goiY: [
        'Trong thân hàm spike_step(n), dòng 1 là forward(n) và dòng 2 là turn_right().',
        'Khi gọi spike_step(3) hai lần, robot đi ngang 3 ô, rẽ phải, rồi đi xuống 3 ô vào cờ.'
      ]
    }),

    manGai(6, 'luyen', {
      ten: 'Vòng quanh hố đá vôi',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Hành lang đá ướt bao quanh một hố sụt lớn ở giữa. Hãy dùng vòng lặp for lặp 3 lần lệnh spike_step(3) để đi 3 cạnh quanh hố sụt tới cờ.',
      veMaMau: 'Mã mẫu mới lặp 2 cạnh nên dừng ở góc dưới phải.',
      san: [
        '######',
        '#.II.#',
        '#u.uI#',
        '#uuu.#',
        '#FII.#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['for i in range(2):', '    spike_step(3)']),
      loiGiai: bai(['for i in range(3):', '    spike_step(3)']),
      loiSai: [
        { moTa: 'Chỉ lặp 2 lần: dừng ở góc dưới phải (4, 4)', baiLam: bai(['for i in range(2):', '    spike_step(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Truyền spike_step(2): rẽ sớm rơi xuống hố sụt', baiLam: bai(['for i in range(3):', '    spike_step(2)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 11, nhip: 11 },
      goiY: [
        'Mỗi cạnh của hành lang dài 3 bước.',
        'Đổi range(2) thành range(3) để đi trọn 3 cạnh tới cờ ở (1, 4).'
      ]
    }),

    manGai(7, 'luyen', {
      ten: 'Chế lệnh: bậc thang đá vôi',
      taoHam: ['cave_zig'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'spike_step'],
      deBai: 'Tạo hàm cave_zig(a, b) để đi một bậc zích zắc: gọi spike_step(a) (tiến a bước rồi rẽ phải), tiếp tục gọi forward(b) để đi xuống b bước, rồi gọi turn_left() để lấy lại hướng ban đầu.',
      veMaMau: 'Trong cave_zig(a, b), kết hợp spike_step(a), forward(b) và turn_left().',
      san: [
        '########',
        '#.II####',
        '###I####',
        '###.IIF#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['cave_zig(2, 2)', 'forward(3)']),
      loiGiai: bai(
        ['cave_zig(2, 2)', 'forward(3)'],
        [],
        [ham('cave_zig', ['spike_step(a)', 'forward(b)', 'turn_left()'], ['a', 'b'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm cave_zig', baiLam: bai(['cave_zig(2, 2)', 'forward(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi turn_left() cuối hàm cave_zig: đoạn sau đi thẳng xuống tường', baiLam: bai(['cave_zig(2, 2)', 'forward(3)']), hamCuaEmMoi: [ham('cave_zig', ['spike_step(a)', 'forward(b)'], ['a', 'b'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 9 },
      goiY: [
        'Thân hàm cave_zig(a, b) gồm 3 dòng: spike_step(a), forward(b), turn_left().',
        'Sau cave_zig(2, 2), robot ở (3, 3) hướng sang phải và đi tiếp forward(3) tới cờ.'
      ]
    }),

    manGai(8, 'bien-the', {
      ten: 'Hai tầng bậc đá ướt',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'spike_step', 'cave_zig'],
      deBai: 'Vách hang chia thành 2 bậc zích zắc liên tiếp: mỗi bậc đi ngang 2 bước, xuống 1 bước rồi lại hướng sang phải. Hãy dùng vòng lặp gọi cave_zig(2, 1) hai lần rồi bước vào cờ.',
      veMaMau: 'Mã mẫu truyền nhầm độ dài trong cave_zig(1, 2) khiến robot lao xuống hố sụt.',
      san: [
        '########',
        '#.II####',
        '#.u.II##',
        '###.u.F#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['for i in range(2):', '    cave_zig(1, 2)', 'move()']),
      loiGiai: bai(['for i in range(2):', '    cave_zig(2, 1)', 'move()']),
      loiSai: [
        { moTa: 'Để nguyên cave_zig(1, 2): rẽ sớm rơi xuống hố (2, 2)', baiLam: bai(['for i in range(2):', '    cave_zig(1, 2)', 'move()']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Quên lệnh move() cuối cùng: dừng sát trước cờ', baiLam: bai(['for i in range(2):', '    cave_zig(2, 1)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 11 },
      goiY: [
        'Mỗi bậc cần đi ngang 2 ô rồi đi xuống 1 ô: cave_zig(2, 1).',
        'Sửa cave_zig(1, 2) thành cave_zig(2, 1).'
      ]
    }),

    manGai(9, 'bien-the', {
      ten: 'Chế lệnh: cua chữ U đá vôi',
      taoHam: ['limestone_bend'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Tạo hàm limestone_bend(a, b, c) để ôm trọn một khúc cua chữ U: gọi spike_step(a), gọi tiếp spike_step(b), rồi đi cạnh thứ ba bằng forward(c).',
      veMaMau: 'Mở Xưởng hàm, tạo limestone_bend(a, b, c) gồm 3 dòng: spike_step(a), spike_step(b), forward(c).',
      san: [
        '#######',
        '#.III.#',
        '#.uuuI#',
        '#FIII.#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['limestone_bend(4, 2, 4)']),
      loiGiai: bai(
        ['limestone_bend(4, 2, 4)'],
        [],
        [ham('limestone_bend', ['spike_step(a)', 'spike_step(b)', 'forward(c)'], ['a', 'b', 'c'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm limestone_bend', baiLam: bai(['limestone_bend(4, 2, 4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thiếu dòng forward(c): dừng ở góc dưới phải (5, 3)', baiLam: bai(['limestone_bend(4, 2, 4)']), hamCuaEmMoi: [ham('limestone_bend', ['spike_step(a)', 'spike_step(b)'], ['a', 'b', 'c'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 13, nhip: 12 },
      goiY: [
        'Hai cạnh đầu vừa đi vừa rẽ phải bằng spike_step(a) và spike_step(b).',
        'Cạnh cuối tiến thẳng tới đích bằng forward(c).'
      ]
    }),

    manGai(10, 'trum', {
      ten: 'Trùm: Hẻm đá vôi ngập nước',
      huyHieu: { ma: 'banh-gai', ten: 'Huy hiệu Bám đá vôi ướt' },
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'spike_step', 'cave_zig', 'limestone_bend'],
      nhipTheo: 'tong',
      deBai: 'Đưa robot vượt qua hẻm đá vôi ướt và các hố sụt trên cả hai sân. Đầu tiên gọi cave_zig(2, 2) để xuống tầng giữa, sau đó gọi limestone_bend(3, 2, 4) để vòng qua hố sụt về cờ.',
      veMaMau: 'Kết hợp hai hàm đã chế: cave_zig(2, 2) và limestone_bend(3, 2, 4).',
      san: [
        [
          '########',
          '#.II####',
          '#.uI####',
          '##u.III#',
          '##.uuuI#',
          '##FIII.#',
          '########'
        ],
        [
          '########',
          '#.I.####',
          '#uu.####',
          '###.II.#',
          '##uuuu.#',
          '##F.II.#',
          '########'
        ]
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      maMau: bai([]),
      loiGiai: bai([
        'cave_zig(2, 2)',
        'limestone_bend(3, 2, 4)'
      ]),
      loiSai: [
        { moTa: 'Truyền nhầm limestone_bend(3, 2, 3): dừng trước cờ 1 ô', baiLam: bai(['cave_zig(2, 2)', 'limestone_bend(3, 2, 3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 19, nhip: 34 },
      goiY: [
        'cave_zig(2, 2) đưa robot từ (1, 1) xuống (3, 3) và giữ hướng sang phải.',
        'Từ (3, 3), gọi limestone_bend(3, 2, 4) để đi sang (6, 3), xuống (6, 5) rồi về cờ ở (2, 5).'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: tu-dien — Từ điển tra cứu (10 màn)
       ====================================================================== */
    manTuDien(1, 'lam-quen', {
      ten: 'Sổ tay địa chất',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Trong Python, từ điển (dict) lưu các cặp khóa: giá_trị trong ngoặc nhọn, ví dụ d = {"ngang": 3, "doc": 2}. Khi viết d["ngang"], Python tra sổ và trả về số 3. Bấm Chạy để xem robot tra từ điển và đi tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy: d["ngang"] trả về 3, d["doc"] trả về 2.',
      san: [
        '######',
        '#.II.#',
        '####I#',
        '####F#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'd = {"ngang": 3, "doc": 2}',
        'spike_step(d["ngang"])',
        'forward(d["doc"])'
      ]),
      loiGiai: bai([
        'd = {"ngang": 3, "doc": 2}',
        'spike_step(d["ngang"])',
        'forward(d["doc"])'
      ]),
      sao: { o: 12, nhip: 6 },
      goiY: [
        'd["ngang"] lấy giá trị gắn với khóa "ngang" là 3.',
        'd["doc"] lấy giá trị gắn với khóa "doc" là 2.'
      ]
    }),

    manTuDien(2, 'lam-quen', {
      ten: 'Tra đúng khóa bản đồ',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Bản đồ từ điển d = {"dong": 4, "nam": 3} ghi chặng hướng đông dài 4 bước và chặng hướng nam dài 3 bước. Mã mẫu đang tra nhầm d["dong"] cho cả hai chặng khiến robot đâm vào vách đá. Hãy sửa khóa ở dòng cuối.',
      veMaMau: 'Chạy thử: forward(d["dong"]) đi 4 bước nên đâm tường dưới. Đổi khóa thành "nam".',
      san: [
        '#######',
        '#.III.#',
        '#####I#',
        '####uI#',
        '#....F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'd = {"dong": 4, "nam": 3}',
        'spike_step(d["dong"])',
        'forward(d["dong"])'
      ]),
      loiGiai: bai([
        'd = {"dong": 4, "nam": 3}',
        'spike_step(d["dong"])',
        'forward(d["nam"])'
      ]),
      loiSai: [
        { moTa: 'Đổi cả hai dòng thành "nam": rẽ sớm rơi xuống hố', baiLam: bai(['d = {"dong": 4, "nam": 3}', 'spike_step(d["nam"])', 'forward(d["nam"])']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 12, nhip: 8 },
      goiY: [
        'Chặng đi xuống từ (5, 1) tới cờ (5, 4) dài 3 bước, ứng với khóa "nam".',
        'Sửa dòng cuối thành forward(d["nam"]).'
      ]
    }),

    manTuDien(3, 'lam-quen', {
      ten: 'Ghi thêm mục mới vào sổ',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Ta có thể khởi tạo từ điển rỗng d = {} rồi ghi thêm từng cặp bằng cú pháp d["a"] = 3. Hãy sửa giá trị của d["b"] để robot đi xuống đúng 3 bước tới cờ.',
      veMaMau: 'Mã mẫu đang gán d["b"] = 1 nên mới đi xuống 1 ô.',
      san: [
        '######',
        '#.II.#',
        '####I#',
        '####I#',
        '####F#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'd = {}',
        'd["a"] = 3',
        'd["b"] = 1',
        'spike_step(d["a"])',
        'forward(d["b"])'
      ]),
      loiGiai: bai([
        'd = {}',
        'd["a"] = 3',
        'd["b"] = 3',
        'spike_step(d["a"])',
        'forward(d["b"])'
      ]),
      loiSai: [
        { moTa: 'Để nguyên d["b"] = 1: dừng ở (4, 2)', baiLam: bai(['d = {}', 'd["a"] = 3', 'd["b"] = 1', 'spike_step(d["a"])', 'forward(d["b"])']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gán d["b"] = 2: vẫn thiếu 1 bước tới cờ', baiLam: bai(['d = {}', 'd["a"] = 3', 'd["b"] = 2', 'spike_step(d["a"])', 'forward(d["b"])']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 7 },
      goiY: [
        'Từ góc (4, 1) xuống cờ (4, 4) là 3 bước.',
        'Sửa d["b"] = 1 thành d["b"] = 3.'
      ]
    }),

    manTuDien(4, 'lam-quen', {
      ten: 'Kiểm tra khóa trong từ điển',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Tra một khóa chưa có trong từ điển sẽ gây lỗi. Ta dùng "b" in d để kiểm tra khóa có tồn tại hay không, và "b" not in d để kiểm tra khóa chưa có. Hãy hoàn thành nhánh if để đi nốt chặng thứ hai.',
      veMaMau: 'Nếu "b" not in d thì gán d["b"] = 2; sau đó kiểm tra nếu "b" in d thì tiến d["b"] bước.',
      san: [
        '######',
        '#.II.#',
        '####I#',
        '####F#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'd = {"a": 3}',
        'if "b" not in d:',
        '    d["b"] = 2',
        'spike_step(d["a"])'
      ]),
      loiGiai: bai([
        'd = {"a": 3}',
        'if "b" not in d:',
        '    d["b"] = 2',
        'spike_step(d["a"])',
        'if "b" in d:',
        '    forward(d["b"])'
      ]),
      loiSai: [
        { moTa: 'Chưa viết đoạn đi xuống: dừng ở góc (4, 1)', baiLam: bai(['d = {"a": 3}', 'if "b" not in d:', '    d["b"] = 2', 'spike_step(d["a"])']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gán d["b"] = 1: đi thiếu 1 ô tới cờ', baiLam: bai(['d = {"a": 3}', 'if "b" not in d:', '    d["b"] = 1', 'spike_step(d["a"])', 'if "b" in d:', '    forward(d["b"])']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 6 },
      goiY: [
        'Sau spike_step(d["a"]), robot đã ở góc (4, 1) và quay mặt xuống dưới.',
        'Thêm if "b" in d: rồi thụt lề forward(d["b"]) (hoặc gọi thẳng forward(d["b"])).'
      ]
    }),

    manTuDien(5, 'luyen', {
      ten: 'Chế lệnh: bước theo khóa',
      taoHam: ['dict_step'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Tạo hàm dict_step(d, k) nhận từ điển d và khóa k: tra số bước trong d[k] rồi gọi spike_step(d[k]) để vừa tiến vừa rẽ phải.',
      veMaMau: 'Mở Xưởng hàm, tạo dict_step(d, k) gồm 1 dòng: spike_step(d[k]).',
      san: [
        '######',
        '#.II.#',
        '####I#',
        '####F#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'd = {"ngang": 3, "doc": 2}',
        'dict_step(d, "ngang")',
        'dict_step(d, "doc")'
      ]),
      loiGiai: bai(
        [
          'd = {"ngang": 3, "doc": 2}',
          'dict_step(d, "ngang")',
          'dict_step(d, "doc")'
        ],
        [],
        [ham('dict_step', ['spike_step(d[k])'], ['d', 'k'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm dict_step', baiLam: bai(['d = {"ngang": 3, "doc": 2}', 'dict_step(d, "ngang")', 'dict_step(d, "doc")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ gọi forward(d[k]) mà không rẽ phải: đâm tường ở cuối đoạn ngang', baiLam: bai(['d = {"ngang": 3, "doc": 2}', 'dict_step(d, "ngang")', 'dict_step(d, "doc")']), hamCuaEmMoi: [ham('dict_step', ['forward(d[k])'], ['d', 'k'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 13, nhip: 6 },
      goiY: [
        'Thân hàm dict_step(d, k) chỉ cần gọi spike_step(d[k]).',
        'Hai lần gọi dict_step trong chương trình chính sẽ đưa robot tới thẳng cờ.'
      ]
    }),

    manTuDien(6, 'luyen', {
      ten: 'Cập nhật số bước trong sổ',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step', 'dict_step'],
      deBai: 'Ta có thể cộng thêm vào giá trị đang lưu trong từ điển bằng d["x"] = d["x"] + 2. Hãy tăng d["x"] thêm 2 bước trước khi gọi dict_step cho chặng thứ hai.',
      veMaMau: 'Chặng đầu đi 2 bước (d["x"] == 2), chặng sau đi xuống dài hơn 2 bước (tức 4 bước).',
      san: [
        '#####',
        '#.I.#',
        '###I#',
        '###I#',
        '###I#',
        '###F#',
        '#####'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'd = {"x": 2}',
        'dict_step(d, "x")',
        'd["x"] = d["x"] + 1',
        'forward(d["x"])'
      ]),
      loiGiai: bai([
        'd = {"x": 2}',
        'dict_step(d, "x")',
        'd["x"] = d["x"] + 2',
        'forward(d["x"])'
      ]),
      loiSai: [
        { moTa: 'Chỉ cộng 1: đi xuống 3 bước, dừng trước cờ 1 ô', baiLam: bai(['d = {"x": 2}', 'dict_step(d, "x")', 'd["x"] = d["x"] + 1', 'forward(d["x"])']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 7 },
      goiY: [
        'Ban đầu d["x"] bằng 2. Muốn chặng dọc đi 4 bước thì cần cộng thêm 2.',
        'Sửa d["x"] = d["x"] + 1 thành d["x"] = d["x"] + 2.'
      ]
    }),

    manTuDien(7, 'luyen', {
      ten: 'Chế lệnh: tra cứu an toàn',
      taoHam: ['safe_lookup'], batBuocTaoHam: false, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Tạo hàm safe_lookup(d, k, m): nếu khóa k có trong từ điển (if k in d:) thì trả về return d[k]; ngược lại trả về giá trị mặc định return m.',
      veMaMau: 'Trong safe_lookup(d, k, m), dùng if k in d: return d[k] rồi return m ở dòng ngoài.',
      san: [
        '#######',
        '#.III.#',
        '#####I#',
        '#####I#',
        '#####F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'd = {"a": 4}',
        'spike_step(safe_lookup(d, "a", 2))',
        'forward(safe_lookup(d, "b", 3))'
      ]),
      loiGiai: bai(
        [
          'd = {"a": 4}',
          'spike_step(safe_lookup(d, "a", 2))',
          'forward(safe_lookup(d, "b", 3))'
        ],
        [],
        [ham('safe_lookup', ['if k in d:', '    return d[k]', 'return m'], ['d', 'k', 'm'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm safe_lookup', baiLam: bai(['d = {"a": 4}', 'spike_step(safe_lookup(d, "a", 2))', 'forward(safe_lookup(d, "b", 3))']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Luôn trả về m mà không kiểm tra k in d: đoạn ngang chỉ đi 2 ô', baiLam: bai(['d = {"a": 4}', 'spike_step(safe_lookup(d, "a", 2))', 'forward(safe_lookup(d, "b", 3))']), hamCuaEmMoi: [ham('safe_lookup', ['return m'], ['d', 'k', 'm'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 12, nhip: 8 },
      goiY: [
        'Khóa "a" có trong d nên safe_lookup(d, "a", 2) trả về 4.',
        'Khóa "b" không có trong d nên safe_lookup(d, "b", 3) trả về giá trị mặc định 3.'
      ]
    }),

    manTuDien(8, 'bien-the', {
      ten: 'Duyệt mọi khóa trong từ điển',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step', 'dict_step'],
      deBai: 'Vòng lặp for k in d: sẽ duyệt lần lượt từng khóa k trong từ điển d theo thứ tự đã tạo. Hãy dùng vòng lặp for k in d: gọi dict_step(d, k) để đi qua cả 3 cạnh quanh hố sụt.',
      veMaMau: 'Thay vì gọi dict_step 3 lần rời rạc, hãy viết for k in d: rồi gọi dict_step(d, k).',
      san: [
        '#######',
        '#.III.#',
        '#.uuuI#',
        '#.uuuI#',
        '#FIII.#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'd = {"a": 4, "b": 3, "c": 4}',
        'dict_step(d, "a")',
        'dict_step(d, "b")'
      ]),
      loiGiai: bai([
        'd = {"a": 4, "b": 3, "c": 4}',
        'for k in d:',
        '    dict_step(d, k)'
      ]),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới đi 2 cạnh, dừng ở (5, 4)', baiLam: bai(['d = {"a": 4, "b": 3, "c": 4}', 'dict_step(d, "a")', 'dict_step(d, "b")']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sửa giá trị "b" thành 2: rẽ sớm rơi vào hố sụt', baiLam: bai(['d = {"a": 4, "b": 2, "c": 4}', 'for k in d:', '    dict_step(d, k)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 13, nhip: 13 },
      goiY: [
        'Viết for k in d: ở dòng thứ hai.',
        'Bên trong vòng lặp thụt lề 4 dấu cách gọi dict_step(d, k).'
      ]
    }),

    manTuDien(9, 'bien-the', {
      ten: 'Chế lệnh: đi hết sổ và đếm mục',
      taoHam: ['walk_dict'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step', 'dict_step'],
      deBai: 'Hàm len(d) cho biết số cặp khóa: giá_trị trong từ điển d. Hãy tạo hàm walk_dict(d): duyệt for k in d: gọi dict_step(d, k), sau đó trả về return len(d) để báo tổng số chặng đã đi.',
      veMaMau: 'Trong walk_dict(d), viết for k in d: gọi dict_step(d, k), rồi ngoài vòng lặp viết return len(d).',
      san: [
        '######',
        '#.II.#',
        '#.uuI#',
        '#F.I.#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'd = {"a": 3, "b": 2}',
        'n = walk_dict(d)',
        'forward(n + 1)'
      ]),
      loiGiai: bai(
        [
          'd = {"a": 3, "b": 2}',
          'n = walk_dict(d)',
          'forward(n + 1)'
        ],
        [],
        [ham('walk_dict', ['for k in d:', '    dict_step(d, k)', 'return len(d)'], ['d'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm walk_dict', baiLam: bai(['d = {"a": 3, "b": 2}', 'n = walk_dict(d)', 'forward(n + 1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trả về 1 thay vì len(d): đoạn cuối đi thiếu 1 ô tới cờ', baiLam: bai(['d = {"a": 3, "b": 2}', 'n = walk_dict(d)', 'forward(n + 1)']), hamCuaEmMoi: [ham('walk_dict', ['for k in d:', '    dict_step(d, k)', 'return 1'], ['d'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 10 },
      goiY: [
        'Thân hàm walk_dict(d) gồm vòng lặp for k in d: gọi dict_step(d, k) và dòng cuối return len(d).',
        'Vì d có 2 khóa nên len(d) trả về 2, và forward(n + 1) đi 3 bước về cờ.'
      ]
    }),

    manTuDien(10, 'trum', {
      ten: 'Trùm: Bản đồ địa chất hang sâu',
      huyHieu: { ma: 'tu-dien', ten: 'Huy hiệu Từ điển tra cứu' },
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'spike_step', 'dict_step', 'safe_lookup', 'walk_dict'],
      nhipTheo: 'tong',
      deBai: 'Chinh phục bản đồ địa chất của 2 khoang hang. Khởi tạo d = {"a": 3, "b": 2}, gọi n = walk_dict(d) để đi 2 cạnh đầu và nhận n = 2, sau đó tiến forward(safe_lookup(d, "c", n)) bước sang trái, rẽ trái bằng turn_left() và tiến n bước xuống cờ.',
      veMaMau: 'Kết hợp walk_dict(d), safe_lookup(d, "c", n), turn_left() và forward(n).',
      san: [
        [
          '######',
          '#.II.#',
          '#.uuI#',
          '#.I..#',
          '#.I###',
          '#.F###',
          '######'
        ],
        [
          '######',
          '#..I.#',
          '#uuu.#',
          '#..I.#',
          '#.I###',
          '#.F###',
          '######'
        ]
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      maMau: bai([]),
      loiGiai: bai([
        'd = {"a": 3, "b": 2}',
        'n = walk_dict(d)',
        'forward(safe_lookup(d, "c", n))',
        'turn_left()',
        'forward(n)'
      ]),
      loiSai: [
        { moTa: 'Quên rẽ trái turn_left() trước đoạn cuối: đâm tường bên trái', baiLam: bai(['d = {"a": 3, "b": 2}', 'n = walk_dict(d)', 'forward(safe_lookup(d, "c", n))', 'forward(n)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đoạn cuối chỉ đi 1 bước: dừng trên ô (2, 4) trước cờ', baiLam: bai(['d = {"a": 3, "b": 2}', 'n = walk_dict(d)', 'forward(safe_lookup(d, "c", n))', 'turn_left()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 20, nhip: 24 },
      goiY: [
        'n = walk_dict(d) đưa robot tới (4, 3) hướng sang trái và trả về n = 2.',
        'Tiếp theo gọi forward(safe_lookup(d, "c", n)) để sang (2, 3), rồi turn_left() và forward(n) xuống cờ (2, 5).'
      ]
    })
  ];

  if (M && M.them) M.manBanhGai = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();

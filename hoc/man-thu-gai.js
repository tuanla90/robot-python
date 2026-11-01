/* ============================================================================
   man-thu-gai.js — Mùa 8 Hang động đá vôi: GÓI 5 "Thu gai trượt đá" (20 màn)
     Chương 1: thu-gai     (10 màn: retract_spikes(), extend_spikes() trượt dải 'I' 1 nhịp)
     Chương 2: che-thu-gai (10 màn: chế hàm lướt đá ướt kết hợp ngách hang, cảm biến âm, dict, set)

   LuậtR1 gói 5:
     - Thân: 'gai' (loaiRobot: 'gai', thuGai: true)
     - Tay: 'loa' (gõ nhịp beat)
     - Cảm biến: 'am-thanh' (hear() đo khoảng cách 1..8 tới chuông đá gần nhất)
     - Khay lệnh: left_move, right_move, left_back, right_back, wait,
                  retract_spikes, extend_spikes, beat, hear
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  function bai(chinh, hamMan, hamEm) {
    return { chinh: chinh || [], hamCuaMan: hamMan || [], hamCuaEmMoi: hamEm || [] };
  }
  function ham(ten, than, thamSo, dong) {
    var h = { ten: ten, thamSo: thamSo || [], than: than || [] };
    if (dong) h.dong = true;
    return h;
  }

  var CAU_TRUC = ['for', 'while', 'if', 'elif', 'else', 'def', 'return', 'list', 'dict', 'set'];
  var HAM_GOC_THU_GAI = [
    'left_move', 'right_move', 'left_back', 'right_back', 'wait',
    'retract_spikes', 'extend_spikes', 'beat', 'hear'
  ];

  function manGaiThu(chuong, so, hang, d) {
    return Object.assign({
      id: chuong + '.' + so,
      chuong: chuong,
      so: so,
      hang: hang,
      loaiRobot: 'gai',
      thuGai: true,
      robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren' }] },
      moXuong: true,
      camHamCuaEm: false,
      taoHam: [],
      hamCuaEmCan: [],
      khung: { ham: 10, chinh: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      hamGoc: HAM_GOC_THU_GAI,
      mucTieu: d.dieu ? 'choi-dieu' : 'toi-co',
      nhipToiDa: d.nhipToiDa || (d.sao && d.sao.nhip ? d.sao.nhip + 12 : 40),
      loiSai: []
    }, d);
  }

  function manThuGai(so, hang, d) { return manGaiThu('thu-gai', so, hang, d); }
  function manCheThuGai(so, hang, d) { return manGaiThu('che-thu-gai', so, hang, d); }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: thu-gai — Thu gai trượt băng (10 màn)
       ====================================================================== */
    manThuGai(1, 'lam-quen', {
      ten: 'Thu gai lướt đá ướt',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move'],
      deBai: 'Khi gọi retract_spikes(), R1 thu gọn đinh gai ở đầu nhịp tiếp theo: bước vào dải đá vôi ướt I sẽ trượt một mạch qua hết dải I chỉ trong 1 nhịp. Gọi extend_spikes() để bung gai bám đá trở lại. Bấm Chạy để xem R1 lướt qua 3 ô I rồi bước vào cờ.',
      veMaMau: 'retract_spikes() rồi move() giúp R1 trượt từ (1, 1) sang (5, 1) trong 1 nhịp; extend_spikes() rồi move() bước nốt vào cờ.',
      san: [
        '########',
        '#.III.F#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'retract_spikes()',
        'move()',
        'extend_spikes()',
        'move()'
      ]),
      loiGiai: bai([
        'retract_spikes()',
        'move()',
        'extend_spikes()',
        'move()'
      ]),
      sao: { o: 7, nhip: 2 },
      goiY: [
        'Bấm nút Chạy để quan sát R1 thu gai trượt vèo qua dải đá ướt I.',
        'Màn 1 chỉ cần chạy thử, chưa cần sửa mã.'
      ]
    }),

    manThuGai(2, 'lam-quen', {
      ten: 'Bung gai thắng trước hố',
      hamCuaEmCan: ['move', 'forward', 'turn_right'],
      deBai: 'Sau khi thu gai trượt hết hành lang ngang sang (5, 1) và rẽ phải, phía Nam là dải đá ướt dẫn thẳng xuống hố sụt u ở (5, 4). Hãy gọi extend_spikes() trước khi đi xuống 2 bước rồi rẽ phải vào cờ.',
      veMaMau: 'Mã mẫu quên bung gai trước khi đi xuống nên R1 trượt thẳng xuống hố sụt.',
      san: [
        '#######',
        '#.III.#',
        '#####I#',
        '####FI#',
        '#####u#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'retract_spikes()',
        'move()',
        'turn_right()',
        'forward(2)',
        'turn_right()',
        'move()'
      ]),
      loiGiai: bai([
        'retract_spikes()',
        'move()',
        'turn_right()',
        'extend_spikes()',
        'forward(2)',
        'turn_right()',
        'move()'
      ]),
      loiSai: [
        { moTa: 'Quên gọi extend_spikes() trước khi đi xuống: trượt thẳng vào hố sụt', baiLam: bai(['retract_spikes()', 'move()', 'turn_right()', 'forward(2)', 'turn_right()', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 14, nhip: 6 },
      goiY: [
        'Chèn lệnh extend_spikes() ngay sau dòng turn_right() đầu tiên.',
        'Khi gai đã bung ra, forward(2) sẽ bước từng ô chắc chắn và dừng ở (5, 3).'
      ]
    }),

    manThuGai(3, 'lam-quen', {
      ten: 'Hai dải băng vuông góc',
      hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Khi đã gọi retract_spikes(), đinh gai vẫn thu gọn ở các nhịp sau cho tới khi gọi extend_spikes(). Hãy bỏ lệnh extend_spikes() thừa ở góc cua để R1 trượt luôn qua dải đá ướt dọc tới thẳng cờ.',
      veMaMau: 'Mã mẫu gọi extend_spikes() ở góc (5, 1) nên bước xuống chỉ đi được 1 ô.',
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
        'retract_spikes()',
        'move()',
        'turn_right()',
        'extend_spikes()',
        'move()'
      ]),
      loiGiai: bai([
        'retract_spikes()',
        'move()',
        'turn_right()',
        'move()'
      ]),
      loiSai: [
        { moTa: 'Để nguyên extend_spikes(): dừng ở (5, 2) chưa tới cờ', baiLam: bai(['retract_spikes()', 'move()', 'turn_right()', 'extend_spikes()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 9, nhip: 3 },
      goiY: [
        'Xóa dòng extend_spikes() ở giữa chương trình.',
        'Khi gai còn thu, lệnh move() cuối sẽ trượt từ (5, 1) qua (5, 2), (5, 3) xuống thẳng cờ (5, 4).'
      ]
    }),

    manThuGai(4, 'lam-quen', {
      ten: 'Đo chuông sau cú trượt',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Ở cả 2 sân, sau khi trượt hết hành lang ngang sang (5, 1) và rẽ phải, phía dưới là dải đá ướt có hố sụt ở cuối nhưng có chuông đá đánh dấu chỗ rẽ vào cờ. Hãy bung gai bằng extend_spikes(), dùng spike_step(hear()) đi tới chuông đá và rẽ phải, rồi bước vào cờ.',
      veMaMau: 'Mã mẫu chưa bung gai và chưa đi nốt đoạn cuối vào cờ.',
      san: [
        [
          '#######',
          '#.III.#',
          '#####I#',
          '####FI#',
          '#####u#',
          '#######'
        ],
        [
          '#######',
          '#.III.#',
          '#####I#',
          '#####I#',
          '####FI#',
          '#####u#',
          '#######'
        ]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 5, y: 3, not: 1, phamVi: 4 }],
        [{ x: 5, y: 4, not: 1, phamVi: 4 }]
      ],
      maMau: bai([
        'retract_spikes()',
        'move()',
        'turn_right()'
      ]),
      loiGiai: bai([
        'retract_spikes()',
        'move()',
        'turn_right()',
        'extend_spikes()',
        'spike_step(hear())',
        'move()'
      ]),
      loiSai: [
        { moTa: 'Chưa đi xuống theo chuông đá', baiLam: bai(['retract_spikes()', 'move()', 'turn_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên gọi extend_spikes() trước spike_step(hear()): trượt xuống hố sụt', baiLam: bai(['retract_spikes()', 'move()', 'turn_right()', 'spike_step(hear())', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 15, nhip: 7 },
      goiY: [
        'Sau turn_right(), gọi extend_spikes() để không bị trượt trên dải I dọc.',
        'Tiếp theo gọi spike_step(hear()) rồi move() để rẽ vào cờ ở cả 2 sân.'
      ]
    }),

    manThuGai(5, 'luyen', {
      ten: 'Chế lệnh: trượt rồi bấm gai',
      taoHam: ['glide_step'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Hãy chế hàm glide_step() gồm 4 dòng: retract_spikes(), move(), extend_spikes(), turn_right(). Hàm này giúp R1 thu gai trượt hết dải đá ướt tới góc khô, rồi bung gai trở lại ngay trong nhịp rẽ phải.',
      veMaMau: 'Viết 4 dòng trong hàm glide_step(): retract_spikes(), move(), extend_spikes(), turn_right().',
      san: [
        '#######',
        '#.III.#',
        '#F###I#',
        '#.III.#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'for i in range(3):',
        '    glide_step()',
        'move()'
      ]),
      loiGiai: bai(
        [
          'for i in range(3):',
          '    glide_step()',
          'move()'
        ],
        [],
        [ham('glide_step', ['retract_spikes()', 'move()', 'extend_spikes()', 'turn_right()'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm glide_step', baiLam: bai(['for i in range(3):', '    glide_step()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thiếu turn_right() trong glide_step: đâm tường ở góc phải', baiLam: bai(['for i in range(3):', '    glide_step()', 'move()']), hamCuaEmMoi: [ham('glide_step', ['retract_spikes()', 'move()', 'extend_spikes()'])], phaiCoMa: ['quen-wait'] }
      ],
      sao: { o: 12, nhip: 7 },
      goiY: [
        'Đặt extend_spikes() ngay trước turn_right() để nhịp quay xe đồng thời bung gai ra.',
        'Ba lần glide_step() đưa R1 về (1, 3) hướng lên Bắc, rồi move() bước vào cờ (1, 2).'
      ]
    }),

    manThuGai(6, 'luyen', {
      ten: 'Lướt vòng xoáy đá ướt',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'glide_step'],
      deBai: 'Sau 3 lần gọi glide_step() quanh hành lang ngoài, R1 về tới (1, 4) hướng lên Bắc với gai đã bung sẵn. Phía trên ô (1, 3) là hố sụt (1, 2), nên chỉ bước 1 ô lên (1, 3) rồi rẽ phải và đi 3 bước vào cờ.',
      veMaMau: 'Mã mẫu lặp glide_step() 4 lần nên ở cạnh thứ tư R1 thu gai trượt thẳng xuống hố sụt (1, 2).',
      san: [
        '#######',
        '#.III.#',
        '#uuuuI#',
        '#II.FI#',
        '#.III.#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'for i in range(4):',
        '    glide_step()'
      ]),
      loiGiai: bai([
        'for i in range(3):',
        '    glide_step()',
        'move()',
        'turn_right()',
        'forward(3)'
      ]),
      loiSai: [
        { moTa: 'Lặp glide_step() 4 lần: cạnh thứ tư trượt vào hố (1, 2)', baiLam: bai(['for i in range(4):', '    glide_step()']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Quên rẽ phải sau move(): đi tiếp lên hố (1, 2)', baiLam: bai(['for i in range(3):', '    glide_step()', 'move()', 'forward(3)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 16, nhip: 11 },
      goiY: [
        'Đổi range(4) thành range(3) để dừng ở góc (1, 4) với đinh gai đang bung.',
        'Thêm move(), turn_right(), forward(3) để đi vào cờ ở (4, 3).'
      ]
    }),

    manThuGai(7, 'luyen', {
      ten: 'Chế lệnh: trượt xuyên ngách',
      taoHam: ['glide_tunnel'], chinhCoDinh: true,
      hamCuaEmCan: ['move'],
      deBai: 'Khi R1 thu gai trượt hết dải đá ướt và đáp đúng lên miệng ngách hang ngầm, nó sẽ chui sang đầu bên kia ngay trong cùng 1 nhịp. Hãy chế hàm glide_tunnel() gồm 4 dòng: retract_spikes(), move(), extend_spikes(), move() để trượt vào ngách rồi bung gai bước ra khỏi đầu ngách bên kia.',
      veMaMau: 'Tạo hàm glide_tunnel() gồm: retract_spikes(), move(), extend_spikes(), move().',
      san: [
        '#######',
        '#.III>#',
        '#######',
        '#>II.F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      ngachHang: [{ a: { x: 5, y: 1 }, b: { x: 1, y: 3 } }],
      maMau: bai([
        'glide_tunnel()',
        'retract_spikes()',
        'move()',
        'extend_spikes()',
        'move()'
      ]),
      loiGiai: bai(
        [
          'glide_tunnel()',
          'retract_spikes()',
          'move()',
          'extend_spikes()',
          'move()'
        ],
        [],
        [ham('glide_tunnel', ['retract_spikes()', 'move()', 'extend_spikes()', 'move()'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm glide_tunnel', baiLam: bai(['glide_tunnel()', 'retract_spikes()', 'move()', 'extend_spikes()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên bước ra khỏi miệng ngách thứ hai trong glide_tunnel: chui ngược lại ngách', baiLam: bai(['glide_tunnel()', 'retract_spikes()', 'move()', 'extend_spikes()', 'move()']), hamCuaEmMoi: [ham('glide_tunnel', ['retract_spikes()', 'move()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 12, nhip: 4 },
      goiY: [
        'Trong glide_tunnel(), cặp retract_spikes() + move() đầu tiên trượt tới (5, 1) và chui sang (1, 3).',
        'Cặp extend_spikes() + move() tiếp theo bung gai và bước sang (2, 3).'
      ]
    }),

    manThuGai(8, 'bien-the', {
      ten: 'Sổ tay chọn chế độ gai',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'glide_step'],
      deBai: 'Từ điển d = {"ngang": 1, "doc": 2} ghi cách đi cho 2 chặng: chặng "ngang" có mã 1 (dùng glide_step() để trượt hết dải băng và rẽ phải), còn chặng "doc" có mã 2 (đã bung gai nên gọi forward(d["doc"]) để bước đúng 2 ô vào cờ trước hố sụt). Hãy hoàn thành chương trình.',
      veMaMau: 'Mã mẫu mới thực hiện chặng ngang, chưa đi chặng dọc vào cờ.',
      san: [
        '#######',
        '#.III.#',
        '#####I#',
        '#####F#',
        '#####u#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'd = {"ngang": 1, "doc": 2}',
        'if d["ngang"] == 1:',
        '    glide_step()'
      ]),
      loiGiai: bai([
        'd = {"ngang": 1, "doc": 2}',
        'if d["ngang"] == 1:',
        '    glide_step()',
        'forward(d["doc"])'
      ]),
      loiSai: [
        { moTa: 'Chưa viết lệnh đi xuống cờ', baiLam: bai(['d = {"ngang": 1, "doc": 2}', 'if d["ngang"] == 1:', '    glide_step()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi glide_step() lần hai thay vì forward(d["doc"]): trượt qua cờ xuống hố', baiLam: bai(['d = {"ngang": 1, "doc": 2}', 'if d["ngang"] == 1:', '    glide_step()', 'glide_step()']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 15, nhip: 4 },
      goiY: [
        'Sau glide_step(), R1 đã đứng ở (5, 1), hướng xuống Nam và đinh gai đã bung.',
        'Thêm dòng forward(d["doc"]) ở cuối chương trình để bước 2 ô xuống cờ (5, 3).'
      ]
    }),

    manThuGai(9, 'bien-the', {
      ten: 'Tập hợp nhịp bước sau trượt',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'glide_step', 'count_unique'],
      deBai: 'Sau khi gọi glide_step() để trượt hết hành lang ngang và rẽ phải tại (5, 1), số bước cần đi tiếp xuống cờ đúng bằng số mẫu đá phân biệt trong danh sách a = [4, 7, 4, 9, 7]. Hãy dùng count_unique(a) và forward() để đi tới cờ.',
      veMaMau: 'Mã mẫu đang đi cứng 2 bước nên dừng trước cờ 1 ô.',
      san: [
        '#######',
        '#.III.#',
        '#####I#',
        '#####I#',
        '#####F#',
        '#####u#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'a = [4, 7, 4, 9, 7]',
        'glide_step()',
        'forward(2)'
      ]),
      loiGiai: bai([
        'a = [4, 7, 4, 9, 7]',
        'glide_step()',
        'forward(count_unique(a))'
      ]),
      loiSai: [
        { moTa: 'Để nguyên forward(2): dừng ở (5, 3) trước cờ', baiLam: bai(['a = [4, 7, 4, 9, 7]', 'glide_step()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Truyền len(a) thay vì count_unique(a): đi 5 bước rơi xuống hố sụt', baiLam: bai(['a = [4, 7, 4, 9, 7]', 'glide_step()', 'forward(len(a))']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 14, nhip: 5 },
      goiY: [
        'Danh sách a = [4, 7, 4, 9, 7] có 3 giá trị phân biệt nên count_unique(a) trả về 3.',
        'Đổi forward(2) thành forward(count_unique(a)).'
      ]
    }),

    manThuGai(10, 'trum', {
      ten: 'Trùm: Đường băng ngầm đá vôi',
      huyHieu: { ma: 'thu-gai', ten: 'Huy hiệu Thu gai trượt băng' },
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'glide_step', 'glide_tunnel'],
      nhipTheo: 'tong',
      deBai: 'Vượt qua 2 khoang hang băng ngầm! Ở mỗi sân, đầu tiên gọi glide_tunnel() để trượt qua dải đá ướt đầu tiên, chui qua ngách ngầm sang tầng giữa và bước ra 1 ô. Tiếp theo gọi glide_step() để trượt hết tầng giữa sang phải rồi rẽ xuống, cuối cùng tiến hear() bước tới cờ.',
      veMaMau: 'Kết hợp glide_tunnel(), glide_step() và forward(hear()).',
      san: [
        [
          '#######',
          '#.III>#',
          '#######',
          '#>III.#',
          '#####I#',
          '#####F#',
          '#####u#',
          '#######'
        ],
        [
          '#######',
          '#.III>#',
          '#######',
          '#>III.#',
          '#####I#',
          '#####I#',
          '#####F#',
          '#####u#',
          '#######'
        ]
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      ngachHang: [
        [{ a: { x: 5, y: 1 }, b: { x: 1, y: 3 } }],
        [{ a: { x: 5, y: 1 }, b: { x: 1, y: 3 } }]
      ],
      chuongDa: [
        [{ x: 5, y: 5, not: 2, phamVi: 4 }],
        [{ x: 5, y: 6, not: 2, phamVi: 4 }]
      ],
      maMau: bai([
        'glide_tunnel()',
        'glide_step()'
      ]),
      loiGiai: bai([
        'glide_tunnel()',
        'glide_step()',
        'forward(hear())'
      ]),
      loiSai: [
        { moTa: 'Chưa đi đoạn cuối theo chuông đá tới cờ', baiLam: bai(['glide_tunnel()', 'glide_step()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng số bước cứng forward(2): sân 2 dừng thiếu trước cờ', baiLam: bai(['glide_tunnel()', 'glide_step()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 18, nhip: 13 },
      goiY: [
        'Sau glide_tunnel() và glide_step(), R1 đứng ở (5, 3) hướng xuống Nam với đinh gai đã bung.',
        'Thêm dòng forward(hear()) để R1 đi đúng 2 bước ở sân 1 và 3 bước ở sân 2 tới cờ.'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: che-thu-gai — Chế lệnh: lướt đá ướt (10 màn)
       ====================================================================== */
    manCheThuGai(1, 'lam-quen', {
      ten: 'Chế lệnh: lướt thẳng rồi thắng',
      taoHam: ['slide_stop'], chinhCoDinh: true,
      hamCuaEmCan: ['move'],
      deBai: 'Khác với glide_step() luôn rẽ phải ở cuối, nhiều khi R1 cần trượt qua một dải đá ướt rồi dừng thẳng hướng trên ô khô tiếp theo với đinh gai đã bung sẵn. Hãy tạo hàm slide_stop() gồm 4 dòng: retract_spikes(), move(), extend_spikes(), move().',
      veMaMau: 'Trong slide_stop(), viết: retract_spikes(), move(), extend_spikes(), move().',
      san: [
        '########',
        '#.II..F#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'slide_stop()',
        'move()'
      ]),
      loiGiai: bai(
        [
          'slide_stop()',
          'move()'
        ],
        [],
        [ham('slide_stop', ['retract_spikes()', 'move()', 'extend_spikes()', 'move()'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm slide_stop', baiLam: bai(['slide_stop()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thiếu move() cuối trong slide_stop: lệnh extend_spikes() chưa được thực thi hết nhịp', baiLam: bai(['slide_stop()', 'move()']), hamCuaEmMoi: [ham('slide_stop', ['retract_spikes()', 'move()', 'extend_spikes()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 9, nhip: 3 },
      goiY: [
        'Trong slide_stop(), retract_spikes() + move() trượt từ (1, 1) sang (4, 1).',
        'Tiếp theo extend_spikes() + move() bung gai và tiến sang (5, 1), rồi move() ở chương trình chính bước vào cờ (6, 1).'
      ]
    }),

    manCheThuGai(2, 'lam-quen', {
      ten: 'Hai dải băng nối tiếp',
      hamCuaEmCan: ['move', 'turn_right', 'slide_stop'],
      deBai: 'Hành lang gồm một dải băng ngang và một dải băng dọc, mỗi dải đều có hố sụt chặn phía sau cờ. Hãy gọi slide_stop() để lướt qua dải ngang và dừng ở (5, 1), rẽ phải bằng turn_right(), rồi gọi tiếp slide_stop() để vào thẳng cờ.',
      veMaMau: 'Mã mẫu quên rẽ phải giữa hai lần gọi slide_stop().',
      san: [
        '########',
        '#.II..u#',
        '#####I##',
        '#####I##',
        '#####.##',
        '#####F##',
        '#####u##',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'slide_stop()',
        'slide_stop()'
      ]),
      loiGiai: bai([
        'slide_stop()',
        'turn_right()',
        'slide_stop()'
      ]),
      loiSai: [
        { moTa: 'Quên turn_right() ở góc (5, 1): trượt tiếp sang phải rơi xuống hố (6, 1)', baiLam: bai(['slide_stop()', 'slide_stop()']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 12, nhip: 5 },
      goiY: [
        'Sau lần slide_stop() đầu tiên, R1 đang đứng ở (5, 1).',
        'Chèn turn_right() vào giữa hai lệnh slide_stop().'
      ]
    }),

    manCheThuGai(3, 'lam-quen', {
      ten: 'Chế lệnh: trượt rẽ trái',
      taoHam: ['glide_left'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_left'],
      deBai: 'Tương tự glide_step() rẽ phải, hãy tạo hàm glide_left() gồm 4 dòng: retract_spikes(), move(), extend_spikes(), turn_left() để trượt hết dải đá ướt rồi vừa bung gai vừa rẽ trái.',
      veMaMau: 'Tạo hàm glide_left() gồm: retract_spikes(), move(), extend_spikes(), turn_left().',
      san: [
        '#######',
        '#####F#',
        '#####I#',
        '#####I#',
        '#.III.#',
        '#######'
      ],
      batDau: { x: 1, y: 4, huong: 1 },
      maMau: bai([
        'glide_left()',
        'retract_spikes()',
        'move()'
      ]),
      loiGiai: bai(
        [
          'glide_left()',
          'retract_spikes()',
          'move()'
        ],
        [],
        [ham('glide_left', ['retract_spikes()', 'move()', 'extend_spikes()', 'turn_left()'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm glide_left', baiLam: bai(['glide_left()', 'retract_spikes()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gọi turn_right() thay vì turn_left(): đâm tường dưới', baiLam: bai(['glide_left()', 'retract_spikes()', 'move()']), hamCuaEmMoi: [ham('glide_left', ['retract_spikes()', 'move()', 'extend_spikes()', 'turn_right()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 12, nhip: 3 },
      goiY: [
        'Trong glide_left(), dòng thứ tư là turn_left().',
        'Sau khi glide_left() đưa R1 tới (5, 4) hướng lên Bắc, retract_spikes() + move() trượt thẳng lên cờ (5, 1).'
      ]
    }),

    manCheThuGai(4, 'lam-quen', {
      ten: 'Zích zắc băng phải trái',
      hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'glide_step', 'glide_left'],
      deBai: 'Kết hợp glide_step() (trượt rồi rẽ phải) và glide_left() (trượt rồi rẽ trái) để đưa R1 lướt qua hành lang zích zắc 3 tầng tới cờ.',
      veMaMau: 'Mã mẫu dùng glide_step() cho cả hai góc nên ở góc thứ hai R1 quay ngược sang trái thay vì hướng sang phải.',
      san: [
        '#######',
        '#.II###',
        '###I###',
        '###.I.#',
        '#####F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'glide_step()',
        'glide_step()',
        'glide_step()',
        'move()'
      ]),
      loiGiai: bai([
        'glide_step()',
        'glide_left()',
        'glide_step()',
        'move()'
      ]),
      loiSai: [
        { moTa: 'Gọi glide_step() ở chặng thứ hai: rẽ phải đâm vào vách đá', baiLam: bai(['glide_step()', 'glide_step()', 'glide_step()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 19, nhip: 7 },
      goiY: [
        'Tại góc (3, 1), glide_step() rẽ phải hướng xuống Nam. Khi trượt xuống (3, 3), R1 cần rẽ trái để hướng sang Đông.',
        'Đổi dòng thứ hai thành glide_left().'
      ]
    }),

    manCheThuGai(5, 'luyen', {
      ten: 'Chế lệnh: trượt khi có tiếng vang',
      taoHam: ['echo_glide'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right', 'glide_step'],
      deBai: 'Có những hành lang chỉ nên thu gai trượt nhanh khi cảm biến âm thanh nghe thấy chuông đá báo hiệu ở cuối dải băng (hear() > 0); nếu im lặng (hear() == 0) thì phía trước có hố sụt sát bên, chỉ được bước 1 ô bằng move(). Hãy tạo hàm echo_glide() thực hiện quy tắc đó.',
      veMaMau: 'Trong echo_glide(), dùng if hear() > 0: gọi glide_step(), ngược lại else: gọi move().',
      san: [
        [
          '#######',
          '#.III.#',
          '#####F#',
          '#######'
        ],
        [
          '#######',
          '#.Fu###',
          '#######',
          '#######'
        ]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 5, y: 2, not: 1, phamVi: 6 }],
        []
      ],
      maMau: bai([
        'echo_glide()',
        'if hear() > 0:',
        '    move()'
      ]),
      loiGiai: bai(
        [
          'echo_glide()',
          'if hear() > 0:',
          '    move()'
        ],
        [],
        [ham('echo_glide', ['if hear() > 0:', '    glide_step()', 'else:', '    move()'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm echo_glide', baiLam: bai(['echo_glide()', 'if hear() > 0:', '    move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Luôn gọi glide_step() không kiểm tra hear(): ở sân 2 trượt thẳng xuống hố sụt', baiLam: bai(['echo_glide()', 'if hear() > 0:', '    move()']), hamCuaEmMoi: [ham('echo_glide', ['glide_step()'])], phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 16, nhip: 3 },
      goiY: [
        'Ở sân 1 có chuông đá tại (5, 2) nên hear() > 0: echo_glide() gọi glide_step() rồi bước xuống cờ (5, 2).',
        'Ở sân 2 không có chuông đá nên hear() == 0: echo_glide() chỉ gọi move() bước 1 ô vào cờ (2, 1).'
      ]
    }),

    manCheThuGai(6, 'luyen', {
      ten: 'Lướt rồi gõ trống báo tin',
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'drum_hit'],
      dieu: 'xx.xxx',
      dieuToiCo: true,
      deBai: 'Vừa di chuyển tới cờ vừa hoàn thành bản nhạc trống xx.xxx! Đầu tiên gõ 2 tiếng trống bằng drum_hit(2), tiếp theo gọi retract_spikes() và move() để trượt một mạch từ (1, 1) tới cờ (5, 1) trong đúng 1 nhịp nghỉ (.), rồi đứng tại cờ gọi drum_hit(3).',
      veMaMau: 'Mã mẫu đang gọi move() khi chưa thu gai nên chỉ bước sang (2, 1) và chưa tới cờ.',
      san: [
        '#######',
        '#.IIIF#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'drum_hit(2)',
        'move()',
        'drum_hit(3)'
      ]),
      loiGiai: bai([
        'drum_hit(2)',
        'retract_spikes()',
        'move()',
        'drum_hit(3)'
      ]),
      loiSai: [
        { moTa: 'Quên gọi retract_spikes() trước move(): hết nhạc mới đi được 1 ô', baiLam: bai(['drum_hit(2)', 'move()', 'drum_hit(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 10, nhip: 6 },
      goiY: [
        'Cú trượt retract_spikes() + move() chỉ tốn đúng 1 nhịp và không gõ trống, tạo ra nhịp nghỉ . giữa xx và xxx.',
        'Chèn retract_spikes() ngay trước move().'
      ]
    }),

    manCheThuGai(7, 'luyen', {
      ten: 'Chế lệnh: trượt và gõ vang',
      taoHam: ['glide_beat'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'drum_hit'],
      dieu: 'xxx',
      dieuToiCo: true,
      deBai: 'Tạo hàm glide_beat(n) nhận số tiếng trống n: đầu tiên gọi glide_step() để trượt hết dải đá ướt và rẽ phải, sau đó gọi drum_hit(n) để gõ n tiếng trống báo hiệu tại góc vừa tới.',
      veMaMau: 'Mở Xưởng hàm, tạo glide_beat(n) gồm 2 dòng: glide_step() và drum_hit(n).',
      san: [
        '#######',
        '#.III.#',
        '#####F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'glide_beat(3)',
        'move()'
      ]),
      loiGiai: bai(
        [
          'glide_beat(3)',
          'move()'
        ],
        [],
        [ham('glide_beat', ['glide_step()', 'drum_hit(n)'], ['n'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm glide_beat', baiLam: bai(['glide_beat(3)', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ gõ drum_hit(1) thay vì drum_hit(n): thiếu tiếng trống', baiLam: bai(['glide_beat(3)', 'move()']), hamCuaEmMoi: [ham('glide_beat', ['glide_step()', 'drum_hit(1)'], ['n'])], phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 16, nhip: 6 },
      goiY: [
        'Trong glide_beat(n), dòng 1 là glide_step() và dòng 2 là drum_hit(n).',
        'Sau khi gõ đủ 3 tiếng trống ở (5, 1), lệnh move() cuối đưa R1 bước vào cờ (5, 2).'
      ]
    }),

    manCheThuGai(8, 'bien-the', {
      ten: 'Bản đồ trượt từ điển',
      hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'glide_step', 'glide_left'],
      deBai: 'Từ điển d = {"a": "R", "b": "L", "c": "R"} lưu hướng rẽ ở cuối mỗi dải đá ướt. Hãy duyệt for k in d:, nếu d[k] == "R" thì gọi glide_step(), ngược lại gọi glide_left(). Sau vòng lặp, bước 1 ô vào cờ.',
      veMaMau: 'Hoàn thành nhánh else trong vòng lặp for k in d: và thêm move() ở cuối.',
      san: [
        '#######',
        '#.II###',
        '###I###',
        '###.I.#',
        '#####F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'd = {"a": "R", "b": "L", "c": "R"}',
        'for k in d:',
        '    if d[k] == "R":',
        '        glide_step()'
      ]),
      loiGiai: bai([
        'd = {"a": "R", "b": "L", "c": "R"}',
        'for k in d:',
        '    if d[k] == "R":',
        '        glide_step()',
        '    else:',
        '        glide_left()',
        'move()'
      ]),
      loiSai: [
        { moTa: 'Thiếu nhánh else và lệnh move() cuối', baiLam: bai(['d = {"a": "R", "b": "L", "c": "R"}', 'for k in d:', '    if d[k] == "R":', '        glide_step()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên lệnh move() sau vòng lặp: dừng ở (5, 3) sát trước cờ', baiLam: bai(['d = {"a": "R", "b": "L", "c": "R"}', 'for k in d:', '    if d[k] == "R":', '        glide_step()', '    else:', '        glide_left()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 22, nhip: 7 },
      goiY: [
        'Thêm else: rồi thụt lề glide_left() bên trong vòng lặp for k in d:.',
        'Ngoài vòng lặp, gọi move() để bước xuống cờ (5, 4).'
      ]
    }),

    manCheThuGai(9, 'bien-the', {
      ten: 'Chế lệnh: lướt theo tập mẫu',
      taoHam: ['unique_glide'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'glide_step', 'count_unique'],
      deBai: 'Tạo hàm unique_glide(a) nhận danh sách a: đầu tiên gọi glide_step() để trượt hết dải băng ngang và rẽ phải, sau đó tiến xuống đúng count_unique(a) bước bằng forward(count_unique(a)).',
      veMaMau: 'Trong unique_glide(a), viết 2 dòng: glide_step() và forward(count_unique(a)).',
      san: [
        '#######',
        '#.III.#',
        '#####I#',
        '#####I#',
        '#####F#',
        '#####u#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'unique_glide([2, 5, 2, 8, 5])'
      ]),
      loiGiai: bai(
        [
          'unique_glide([2, 5, 2, 8, 5])'
        ],
        [],
        [ham('unique_glide', ['glide_step()', 'forward(count_unique(a))'], ['a'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm unique_glide', baiLam: bai(['unique_glide([2, 5, 2, 8, 5])']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi glide_step() trước khi tiến: đâm tường phải', baiLam: bai(['unique_glide([2, 5, 2, 8, 5])']), hamCuaEmMoi: [ham('unique_glide', ['forward(count_unique(a))'], ['a'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 5 },
      goiY: [
        'Thân hàm unique_glide(a) chỉ gồm 2 dòng: glide_step() và forward(count_unique(a)).',
        'Danh sách [2, 5, 2, 8, 5] có 3 số khác nhau nên R1 bước xuống đúng 3 ô tới cờ (5, 4).'
      ]
    }),

    manCheThuGai(10, 'trum', {
      ten: 'Trùm: Vũ điệu lướt đá vôi',
      huyHieu: { ma: 'che-thu-gai', ten: 'Huy hiệu Chế lệnh: lướt đá ướt' },
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'glide_step', 'glide_tunnel', 'drum_hit', 'glide_beat', 'count_unique'],
      nhipTheo: 'tong',
      dieu: 'xx..x',
      dieuToiCo: true,
      deBai: 'Trùm Gói 5! Trên cả 2 sân, đầu tiên gọi glide_tunnel() để trượt qua dải đá ướt tầng trên và chui ngách sang (2, 3). Tiếp theo gọi glide_beat(2) để trượt sang góc (5, 3), rẽ phải và gõ 2 tiếng trống, sau đó tiến count_unique([1, 3, 1]) bước xuống cờ và gõ 1 tiếng trống kết thúc bằng drum_hit(1).',
      veMaMau: 'Kết hợp glide_tunnel(), glide_beat(2), forward(count_unique([1, 3, 1])) và drum_hit(1).',
      san: [
        [
          '#######',
          '#.III>#',
          '#######',
          '#>III.#',
          '#####I#',
          '#####F#',
          '#######'
        ],
        [
          '#######',
          '#.III>#',
          '#######',
          '#>III.#',
          '#####.#',
          '#####F#',
          '#######'
        ]
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      ngachHang: [
        [{ a: { x: 5, y: 1 }, b: { x: 1, y: 3 } }],
        [{ a: { x: 5, y: 1 }, b: { x: 1, y: 3 } }]
      ],
      maMau: bai([
        'glide_tunnel()',
        'glide_beat(2)'
      ]),
      loiGiai: bai([
        'glide_tunnel()',
        'glide_beat(2)',
        'forward(count_unique([1, 3, 1]))',
        'drum_hit(1)'
      ]),
      loiSai: [
        { moTa: 'Thiếu đoạn đi xuống cờ và gõ nhịp cuối', baiLam: bai(['glide_tunnel()', 'glide_beat(2)']), phaiCoMa: ['chua-du-dieu'] },
        { moTa: 'Truyền 3 số khác nhau [1, 3, 5]: đi 3 bước nên lệch nhịp trống cuối', baiLam: bai(['glide_tunnel()', 'glide_beat(2)', 'forward(count_unique([1, 3, 5]))', 'drum_hit(1)']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 24, nhip: 18 },
      goiY: [
        'glide_tunnel() rồi glide_beat(2) đưa R1 tới (5, 3) hướng xuống Nam và gõ xx.',
        'Thêm forward(count_unique([1, 3, 1])) rồi drum_hit(1) để đi 2 bước (..) xuống cờ và gõ x.'
      ]
    })
  ];

  if (M && M.them) M.manThuGai = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();

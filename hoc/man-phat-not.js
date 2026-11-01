/* ============================================================================
   man-phat-not.js — Mùa 8 Hang động đá vôi: GÓI 6 "Phát nốt cộng hưởng" (20 màn)
     Chương 1: phat-not     (10 màn: note(n), note(n, so_nhip) phát giai điệu và phá đá chuông)
     Chương 2: che-phat-not (10 màn: chế hàm tấu khúc phá đá kết hợp thu gai, cảm biến âm, dict, set)

   Luật R1 gói 6:
     - Thân: 'gai' (loaiRobot: 'gai', thuGai: true)
     - Tay: 'loa' (gõ nhịp beat + phát nốt nhạc note(1..8, so_nhip))
     - Cảm biến: 'am-thanh' (hear() đo khoảng cách tới chuông đá / đá chuông chưa vỡ)
     - Khay lệnh: left_move, right_move, left_back, right_back, wait,
                  retract_spikes, extend_spikes, beat, note, hear
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
  var HAM_GOC_PHAT_NOT = [
    'left_move', 'right_move', 'left_back', 'right_back', 'wait',
    'retract_spikes', 'extend_spikes', 'beat', 'note', 'hear'
  ];

  function manGaiNot(chuong, so, hang, d) {
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
      hamGoc: HAM_GOC_PHAT_NOT,
      mucTieu: d.dieu ? 'choi-dieu' : 'toi-co',
      nhipToiDa: d.nhipToiDa || (d.sao && d.sao.nhip ? d.sao.nhip + 12 : 40),
      loiSai: []
    }, d);
  }

  function manPhatNot(so, hang, d) { return manGaiNot('phat-not', so, hang, d); }
  function manChePhatNot(so, hang, d) { return manGaiNot('che-phat-not', so, hang, d); }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: phat-not — Cộng hưởng thạch nhũ (10 màn)
       ====================================================================== */
    manPhatNot(1, 'lam-quen', {
      ten: 'Nốt nhạc phá đá chuông',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Lệnh note(n) phát nốt nhạc bậc n (từ 1 đến 8) ở nhịp wait() kế tiếp. Khi phát đúng tần số cộng hưởng của khối đá chuông trong tầm 3 ô (ở đây là nốt 3), khối đá sẽ nứt vỡ và mở đường. Bấm Chạy để xem R1 phá đá chuông và tiến tới cờ.',
      veMaMau: 'note(3) rồi wait() làm vỡ khối đá chuông ở (3, 1), sau đó forward(4) đưa R1 tới cờ.',
      san: [
        '#######',
        '#.II.F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [{ x: 3, y: 1, not: 3, ben: 1 }],
      maMau: bai([
        'note(3)',
        'wait()',
        'forward(4)'
      ]),
      loiGiai: bai([
        'note(3)',
        'wait()',
        'forward(4)'
      ]),
      sao: { o: 8, nhip: 5 },
      goiY: [
        'Bấm nút Chạy để quan sát sóng âm nốt 3 làm vỡ khối đá chuông ở (3, 1).',
        'Màn 1 chỉ cần chạy thử, chưa cần sửa mã.'
      ]
    }),

    manPhatNot(2, 'lam-quen', {
      ten: 'Đúng tần số cộng hưởng',
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Khối đá chuông ở (3, 1) mang tần số nốt 5. Mã mẫu đang phát nhầm note(2) nên đá không vỡ và R1 đâm vào đá. Hãy sửa lại đúng nốt nhạc.',
      veMaMau: 'Đổi note(2) thành note(5) để phá khối đá chuông.',
      san: [
        '#######',
        '#.II.F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [{ x: 3, y: 1, not: 5, ben: 1 }],
      maMau: bai([
        'note(2)',
        'wait()',
        'forward(4)'
      ]),
      loiGiai: bai([
        'note(5)',
        'wait()',
        'forward(4)'
      ]),
      loiSai: [
        { moTa: 'Để nguyên note(2): đá chuông không vỡ, R1 đâm vào đá', baiLam: bai(['note(2)', 'wait()', 'forward(4)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 8, nhip: 5 },
      goiY: [
        'Quan sát số nốt 5 trên khối đá chuông ở (3, 1).',
        'Sửa dòng đầu thành note(5).'
      ]
    }),

    manPhatNot(3, 'lam-quen', {
      ten: 'Ngân dài phá nhũ đá dày',
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Khối đá chuông dày (độ bền 2) cần âm thanh ngân liên tục đủ 2 nhịp mới vỡ. Ta truyền thêm số nhịp vào lệnh note(4, 2) rồi gọi wait(): loa sẽ tự động ngân nốt 4 suốt 2 nhịp liên tiếp. Hãy sửa mã mẫu để phá khối đá độ bền 2.',
      veMaMau: 'Mã mẫu chỉ gọi note(4) (1 nhịp) nên đá mới rung mà chưa vỡ.',
      san: [
        '#######',
        '#.II.F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [{ x: 3, y: 1, not: 4, ben: 2 }],
      maMau: bai([
        'note(4)',
        'wait()',
        'forward(4)'
      ]),
      loiGiai: bai([
        'note(4, 2)',
        'wait()',
        'forward(4)'
      ]),
      loiSai: [
        { moTa: 'Chỉ phát 1 nhịp note(4): đá chuông ben=2 chưa vỡ', baiLam: bai(['note(4)', 'wait()', 'forward(4)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 8, nhip: 6 },
      goiY: [
        'Đổi note(4) thành note(4, 2) để ngân nốt 4 trong 2 nhịp.',
        'Giữ nguyên wait() và forward(4) phía sau.'
      ]
    }),

    manPhatNot(4, 'lam-quen', {
      ten: 'Khúc nhạc ba nốt vang',
      dieu: '135',
      deBai: 'Khi mục tiêu là chơi bản nhạc (choi-dieu), R1 cần phát chuẩn từng nốt theo bản nhạc 135: nốt 1, nốt 3 rồi nốt 5. Hãy dùng vòng lặp for n in [1, 3, 5]: để phát lần lượt 3 nốt nhạc.',
      veMaMau: 'Mã mẫu có danh sách [1, 3, 4] bị sai nốt cuối.',
      san: [
        '#####',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        'for n in [1, 3, 4]:',
        '    note(n)',
        '    wait()'
      ]),
      loiGiai: bai([
        'for n in [1, 3, 5]:',
        '    note(n)',
        '    wait()'
      ]),
      loiSai: [
        { moTa: 'Để nguyên [1, 3, 4]: sai nốt thứ ba', baiLam: bai(['for n in [1, 3, 4]:', '    note(n)', '    wait()']), phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 3, nhip: 3 },
      goiY: [
        'Bản nhạc yêu cầu 3 nốt 1, 3, 5.',
        'Sửa số 4 trong danh sách thành 5.'
      ]
    }),

    manPhatNot(5, 'luyen', {
      ten: 'Chế lệnh: phát nốt phá đá',
      taoHam: ['play_note'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right', 'glide_step'],
      deBai: 'Tạo hàm play_note(n) gồm 2 dòng: note(n) và wait() để phát gọn 1 nốt nhạc. Chương trình chính sẽ gọi play_note(6) phá khối đá chuông chặn trên dải băng, rồi gọi glide_step() và move() tới cờ.',
      veMaMau: 'Mở Xưởng hàm, tạo play_note(n) gồm 2 dòng: note(n) và wait().',
      san: [
        '#######',
        '#.III.#',
        '#####F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [{ x: 3, y: 1, not: 6, ben: 1 }],
      maMau: bai([
        'play_note(6)',
        'glide_step()',
        'move()'
      ]),
      loiGiai: bai(
        [
          'play_note(6)',
          'glide_step()',
          'move()'
        ],
        [],
        [ham('play_note', ['note(n)', 'wait()'], ['n'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm play_note', baiLam: bai(['play_note(6)', 'glide_step()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi wait() trong play_note: lệnh note(6) bị dồn sang nhịp sau', baiLam: bai(['play_note(6)', 'glide_step()', 'move()']), hamCuaEmMoi: [ham('play_note', ['note(n)'], ['n'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 4 },
      goiY: [
        'Trong play_note(n), dòng 1 là note(n) và dòng 2 là wait().',
        'Khi đá chuông ở (3, 1) vỡ, glide_step() trượt mượt qua (2, 1)..(4, 1) tới (5, 1) rồi rẽ xuống cờ.'
      ]
    }),

    manPhatNot(6, 'luyen', {
      ten: 'Hai tầng thạch nhũ chắn lối',
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'play_note'],
      deBai: 'Mỗi dải đá ướt đều bị một khối đá chuông chặn giữa đường: tầng ngang là nốt 2, tầng dọc là nốt 7. Hãy phá đá rồi trượt qua từng tầng để tới cờ.',
      veMaMau: 'Mã mẫu mới phá tầng đầu và gọi glide_step(), chưa phá khối đá nốt 7 ở tầng dọc.',
      san: [
        '#######',
        '#.III.#',
        '#####I#',
        '#####I#',
        '#####F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [
        { x: 3, y: 1, not: 2, ben: 1 },
        { x: 5, y: 3, not: 7, ben: 1 }
      ],
      maMau: bai([
        'play_note(2)',
        'glide_step()'
      ]),
      loiGiai: bai([
        'play_note(2)',
        'glide_step()',
        'play_note(7)',
        'retract_spikes()',
        'move()'
      ]),
      loiSai: [
        { moTa: 'Chưa đi tầng dọc tới cờ', baiLam: bai(['play_note(2)', 'glide_step()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Trượt xuống mà quên gọi play_note(7): vướng đá chuông ở (5, 3)', baiLam: bai(['play_note(2)', 'glide_step()', 'retract_spikes()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 5 },
      goiY: [
        'Tại góc (5, 1), gọi play_note(7) để phá khối đá ở (5, 3).',
        'Sau đó gọi retract_spikes() rồi move() để trượt thẳng xuống cờ (5, 4).'
      ]
    }),

    manPhatNot(7, 'luyen', {
      ten: 'Chế lệnh: ngân vang mở cổng',
      taoHam: ['crack_glide'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right', 'glide_step'],
      deBai: 'Tạo hàm crack_glide(n, k) nhận tần số nốt n và độ bền k: phát note(n, k), gọi wait() để ngân đủ k nhịp làm vỡ khối đá chuông trên dải băng, rồi gọi glide_step() để trượt hết dải băng và rẽ phải.',
      veMaMau: 'Trong crack_glide(n, k), viết 3 dòng: note(n, k), wait(), glide_step().',
      san: [
        '#######',
        '#.III.#',
        '#####I#',
        '#####I#',
        '####.I#',
        '####F.#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [
        { x: 3, y: 1, not: 4, ben: 2 },
        { x: 5, y: 3, not: 8, ben: 1 }
      ],
      maMau: bai([
        'crack_glide(4, 2)',
        'crack_glide(8, 1)',
        'move()'
      ]),
      loiGiai: bai(
        [
          'crack_glide(4, 2)',
          'crack_glide(8, 1)',
          'move()'
        ],
        [],
        [ham('crack_glide', ['note(n, k)', 'wait()', 'glide_step()'], ['n', 'k'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm crack_glide', baiLam: bai(['crack_glide(4, 2)', 'crack_glide(8, 1)', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ gọi note(n) 1 nhịp thay vì note(n, k): khối đá đầu ben=2 không vỡ', baiLam: bai(['crack_glide(4, 2)', 'crack_glide(8, 1)', 'move()']), hamCuaEmMoi: [ham('crack_glide', ['note(n)', 'wait()', 'glide_step()'], ['n', 'k'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 8 },
      goiY: [
        'Nhớ truyền đủ 2 tham số vào note(n, k) trước lệnh wait().',
        'Hai lần gọi crack_glide đưa R1 tới (5, 5) hướng sang Tây, rồi move() bước vào cờ (4, 5).'
      ]
    }),

    manPhatNot(8, 'bien-the', {
      ten: 'Tra từ điển tần số đá',
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'crack_glide'],
      deBai: 'Cảm biến âm thanh hear() cũng đo được khoảng cách tới khối đá chuông chưa vỡ gần nhất! Ở cả 2 sân, khối đá cách 2 ô có tần số lưu tại d[2], còn khối đá cách 3 ô có tần số lưu tại d[3]. Hãy dùng d[hear()] truyền vào crack_glide(d[hear()], 1) để mở đường tới cờ.',
      veMaMau: 'Mã mẫu đang truyền cứng d[2] nên ở sân 2 (đá cách 3 ô) phát sai tần số.',
      san: [
        [
          '#######',
          '#.III.#',
          '#####F#',
          '#######'
        ],
        [
          '#######',
          '#.III.#',
          '#####F#',
          '#######'
        ]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [{ x: 3, y: 1, not: 5, ben: 1 }],
        [{ x: 4, y: 1, not: 8, ben: 1 }]
      ],
      maMau: bai([
        'd = {2: 5, 3: 8}',
        'crack_glide(d[2], 1)',
        'move()'
      ]),
      loiGiai: bai([
        'd = {2: 5, 3: 8}',
        'crack_glide(d[hear()], 1)',
        'move()'
      ]),
      loiSai: [
        { moTa: 'Để nguyên d[2]: ở sân 2 đá chuông cách 3 ô mang nốt 8 không vỡ', baiLam: bai(['d = {2: 5, 3: 8}', 'crack_glide(d[2], 1)', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 4 },
      goiY: [
        'Ở sân 1, hear() trả về 2 nên d[hear()] là 5; ở sân 2, hear() trả về 3 nên d[hear()] là 8.',
        'Đổi d[2] thành d[hear()].'
      ]
    }),

    manPhatNot(9, 'bien-the', {
      ten: 'Hợp âm không trùng lặp',
      hamCuaEmCan: ['play_note'],
      dieu: '264',
      deBai: 'Bản nhạc yêu cầu 3 nốt phân biệt 264 theo đúng thứ tự xuất hiện đầu tiên trong danh sách khảo sát a = [2, 6, 2, 4, 6]. Hãy dùng tập hợp s = set() để chỉ gọi play_note(x) khi x chưa có trong s (x not in s).',
      veMaMau: 'Mã mẫu phát mọi phần tử trong a nên bị thừa các nốt trùng.',
      san: [
        '#####',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        'a = [2, 6, 2, 4, 6]',
        'for x in a:',
        '    play_note(x)'
      ]),
      loiGiai: bai([
        'a = [2, 6, 2, 4, 6]',
        's = set()',
        'for x in a:',
        '    if x not in s:',
        '        s.add(x)',
        '        play_note(x)'
      ]),
      loiSai: [
        { moTa: 'Không lọc trùng bằng set: phát 5 nốt thay vì 3 nốt 264', baiLam: bai(['a = [2, 6, 2, 4, 6]', 'for x in a:', '    play_note(x)']), phaiCoMa: ['sai-not'] },
        { moTa: 'Quên s.add(x) trong nhánh if: vẫn phát lại các nốt trùng', baiLam: bai(['a = [2, 6, 2, 4, 6]', 's = set()', 'for x in a:', '    if x not in s:', '        play_note(x)']), phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 8, nhip: 3 },
      goiY: [
        'Khởi tạo s = set() trước vòng lặp.',
        'Trong vòng lặp, kiểm tra if x not in s: rồi thụt lề cả s.add(x) và play_note(x).'
      ]
    }),

    manPhatNot(10, 'trum', {
      ten: 'Trùm: Đại sảnh thạch nhũ vang',
      huyHieu: { ma: 'phat-not', ten: 'Huy hiệu Cộng hưởng thạch nhũ' },
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'play_note', 'crack_glide'],
      nhipTheo: 'tong',
      deBai: 'Chinh phục Đại sảnh thạch nhũ trên cả 2 sân! Dùng từ điển d = {2: 4, 3: 7}: ở chặng ngang gọi crack_glide(d[hear()], 2) để ngân 2 nhịp phá thạch nhũ dày rồi trượt tới góc (5, 1), ở chặng dọc gọi play_note(d[hear()]) phá thạch nhũ mảnh rồi thu gai trượt xuống cờ.',
      veMaMau: 'Kết hợp d = {2: 4, 3: 7}, crack_glide(d[hear()], 2), play_note(d[hear()]), retract_spikes() và move().',
      san: [
        [
          '#######',
          '#.III.#',
          '#####I#',
          '#####I#',
          '#####F#',
          '#######'
        ],
        [
          '#######',
          '#.III.#',
          '#####I#',
          '#####I#',
          '#####F#',
          '#######'
        ]
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      daChuong: [
        [
          { x: 3, y: 1, not: 4, ben: 2 },
          { x: 5, y: 4, not: 7, ben: 1 }
        ],
        [
          { x: 4, y: 1, not: 7, ben: 2 },
          { x: 5, y: 3, not: 4, ben: 1 }
        ]
      ],
      maMau: bai([
        'd = {2: 4, 3: 7}',
        'crack_glide(d[hear()], 2)'
      ]),
      loiGiai: bai([
        'd = {2: 4, 3: 7}',
        'crack_glide(d[hear()], 2)',
        'play_note(d[hear()])',
        'retract_spikes()',
        'move()'
      ]),
      loiSai: [
        { moTa: 'Chưa phá đá và trượt ở chặng dọc', baiLam: bai(['d = {2: 4, 3: 7}', 'crack_glide(d[hear()], 2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên play_note(d[hear()]) ở chặng dọc: vướng thạch nhũ thứ hai', baiLam: bai(['d = {2: 4, 3: 7}', 'crack_glide(d[hear()], 2)', 'retract_spikes()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 19, nhip: 12 },
      goiY: [
        'Khi khối đá đầu đã vỡ, tại (5, 1) cảm biến hear() tự động đo khoảng cách tới khối đá thứ hai ở chặng dọc.',
        'Gọi play_note(d[hear()]), sau đó retract_spikes() và move() để trượt thẳng vào cờ (5, 4).'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: che-phat-not — Chế lệnh: tấu khúc phá đá (10 màn)
       ====================================================================== */
    manChePhatNot(1, 'lam-quen', {
      ten: 'Chế lệnh: phá đá rồi tiến',
      taoHam: ['crack_step'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'play_note'],
      deBai: 'Khi khối đá chuông nằm trên nền đá khô hoặc khi cần bước chuẩn từng ô mà không trượt, hãy chế hàm crack_step(n, m) gồm 2 dòng: gọi play_note(n) để phá khối đá tần số n, rồi gọi forward(m) để tiến m bước.',
      veMaMau: 'Trong crack_step(n, m), viết 2 dòng: play_note(n) và forward(m).',
      san: [
        '#######',
        '#..I.F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [{ x: 3, y: 1, not: 3, ben: 1 }],
      maMau: bai([
        'crack_step(3, 4)'
      ]),
      loiGiai: bai(
        [
          'crack_step(3, 4)'
        ],
        [],
        [ham('crack_step', ['play_note(n)', 'forward(m)'], ['n', 'm'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm crack_step', baiLam: bai(['crack_step(3, 4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đặt forward(m) trước play_note(n): đâm vào đá chuông khi chưa phá', baiLam: bai(['crack_step(3, 4)']), hamCuaEmMoi: [ham('crack_step', ['forward(m)', 'play_note(n)'], ['n', 'm'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 10, nhip: 5 },
      goiY: [
        'Thân hàm crack_step(n, m) gồm play_note(n) ở dòng 1 và forward(m) ở dòng 2.',
        'Khi gọi crack_step(3, 4), R1 phá đá ở (3, 1) rồi đi 4 bước tới cờ (5, 1).'
      ]
    }),

    manChePhatNot(2, 'lam-quen', {
      ten: 'Mở hai cổng đá liên tiếp',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'play_note', 'crack_step'],
      deBai: 'Dùng hàm crack_step(n, m) vừa chế để vượt qua 2 cổng đá chuông vuông góc: cổng ngang mang nốt 6 (cần tiến 4 bước tới góc), sau đó rẽ phải và mở cổng dọc mang nốt 2 (tiến 3 bước tới cờ).',
      veMaMau: 'Mã mẫu quên rẽ phải ở góc (5, 1) và truyền nhầm tần số cổng thứ hai.',
      san: [
        '#######',
        '#.II..#',
        '#####I#',
        '#####.#',
        '#####F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [
        { x: 3, y: 1, not: 6, ben: 1 },
        { x: 5, y: 2, not: 2, ben: 1 }
      ],
      maMau: bai([
        'crack_step(6, 4)',
        'crack_step(6, 3)'
      ]),
      loiGiai: bai([
        'crack_step(6, 4)',
        'turn_right()',
        'crack_step(2, 3)'
      ]),
      loiSai: [
        { moTa: 'Quên turn_right() và chưa đổi tần số cổng hai', baiLam: bai(['crack_step(6, 4)', 'crack_step(6, 3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đã thêm turn_right() nhưng vẫn phát nốt 6 thay vì nốt 2 ở cổng dọc', baiLam: bai(['crack_step(6, 4)', 'turn_right()', 'crack_step(6, 3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 10 },
      goiY: [
        'Chèn turn_right() vào sau crack_step(6, 4).',
        'Đổi dòng cuối thành crack_step(2, 3) để phá khối đá nốt 2 ở (5, 2) và đi 3 bước xuống cờ.'
      ]
    }),

    manChePhatNot(3, 'lam-quen', {
      ten: 'Chế lệnh: vừa bước vừa tấu nhạc',
      taoHam: ['march_note'], chinhCoDinh: true,
      dieu: '246',
      dieuToiCo: true,
      deBai: 'Giống như gõ trống, trong cùng một nhịp wait() R1 có thể vừa lăn bánh tiến 1 ô vừa phát 1 nốt nhạc! Hãy tạo hàm march_note(n) gồm 4 dòng: left_move(), right_move(), note(n), wait() để vừa tiến bước vừa phát nốt n.',
      veMaMau: 'Tạo hàm march_note(n) gồm: left_move(), right_move(), note(n), wait().',
      san: [
        '######',
        '#.IIF#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'for x in [2, 4, 6]:',
        '    march_note(x)'
      ]),
      loiGiai: bai(
        [
          'for x in [2, 4, 6]:',
          '    march_note(x)'
        ],
        [],
        [ham('march_note', ['left_move()', 'right_move()', 'note(n)', 'wait()'], ['n'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm march_note', baiLam: bai(['for x in [2, 4, 6]:', '    march_note(x)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ phát note(n) mà quên bật hai bánh: hết nhạc vẫn đứng ở (1, 1)', baiLam: bai(['for x in [2, 4, 6]:', '    march_note(x)']), hamCuaEmMoi: [ham('march_note', ['note(n)', 'wait()'], ['n'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 6, nhip: 3 },
      goiY: [
        'Đặt left_move(), right_move() và note(n) trước cùng một lệnh wait().',
        'Ba lần gọi march_note(x) vừa đưa R1 đi 3 bước tới cờ (4, 1) vừa phát chuẩn giai điệu 246.'
      ]
    }),

    manChePhatNot(4, 'lam-quen', {
      ten: 'Hành khúc mở cổng đá',
      hamCuaEmCan: ['march_note'],
      dieu: '3578',
      dieuToiCo: true,
      deBai: 'Khi dùng march_note(n), ở đầu nhịp loa phát nốt n làm vỡ đá chuông ngay trước khi bánh xe lăn vào ô đó! Hãy sửa danh sách nốt nhạc thành [3, 5, 7, 8] để R1 vừa đi một mạch 4 bước xuyên qua 2 khối đá chuông vừa hoàn thành bản nhạc 3578.',
      veMaMau: 'Mã mẫu đang để danh sách [3, 4, 7, 8] nên ở bước thứ hai không phá được khối đá nốt 5.',
      san: [
        '#######',
        '#.IIIF#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [
        { x: 3, y: 1, not: 5, ben: 1 },
        { x: 5, y: 1, not: 8, ben: 1 }
      ],
      maMau: bai([
        'for x in [3, 4, 7, 8]:',
        '    march_note(x)'
      ]),
      loiGiai: bai([
        'for x in [3, 5, 7, 8]:',
        '    march_note(x)'
      ]),
      loiSai: [
        { moTa: 'Để nguyên [3, 4, 7, 8]: sai nốt thứ hai và đâm vào đá chuông (3, 1)', baiLam: bai(['for x in [3, 4, 7, 8]:', '    march_note(x)']), phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 6, nhip: 4 },
      goiY: [
        'Bước thứ hai tiến vào ô (3, 1) có đá chuông nốt 5 và bản nhạc cũng yêu cầu nốt 5.',
        'Đổi số 4 trong danh sách thành 5.'
      ]
    }),

    manChePhatNot(5, 'luyen', {
      ten: 'Chế lệnh: tấu khúc theo danh sách',
      taoHam: ['play_list'], chinhCoDinh: true,
      hamCuaEmCan: ['march_note'],
      dieu: '147',
      dieuToiCo: true,
      deBai: 'Tạo hàm play_list(a) nhận một danh sách nốt nhạc a: dùng vòng lặp for x in a: gọi march_note(x) để vừa hành quân vừa phát hết danh sách nốt nhạc.',
      veMaMau: 'Trong play_list(a), viết 2 dòng: for x in a: và thụt lề march_note(x).',
      san: [
        '######',
        '#.IIF#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'play_list([1, 4, 7])'
      ]),
      loiGiai: bai(
        [
          'play_list([1, 4, 7])'
        ],
        [],
        [ham('play_list', ['for x in a:', '    march_note(x)'], ['a'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm play_list', baiLam: bai(['play_list([1, 4, 7])']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ gọi note(x) mà không gọi march_note(x): thiếu wait và không tiến tới cờ', baiLam: bai(['play_list([1, 4, 7])']), hamCuaEmMoi: [ham('play_list', ['for x in a:', '    note(x)'], ['a'])], phaiCoMa: ['not-goi-lai', 'chua-du-dieu'] }
      ],
      sao: { o: 7, nhip: 3 },
      goiY: [
        'Trong thân hàm play_list(a), duyệt for x in a: rồi gọi march_note(x).',
        'Khi chạy play_list([1, 4, 7]), R1 tiến 3 bước tới cờ và phát chuẩn 147.'
      ]
    }),

    manChePhatNot(6, 'luyen', {
      ten: 'Khúc cua ngân nhạc',
      hamCuaEmCan: ['turn_right', 'march_note', 'play_list'],
      dieu: '135.24',
      dieuToiCo: true,
      deBai: 'Vừa đi hết hành lang chữ L tới cờ vừa tấu bản nhạc 135.24! Chặng ngang đi 3 bước với play_list([1, 3, 5]), rẽ phải bằng turn_right() (tạo đúng 1 nhịp nghỉ .), rồi đi chặng dọc 2 bước với play_list([2, 4]).',
      veMaMau: 'Mã mẫu truyền nhầm danh sách ở chặng dọc.',
      san: [
        '######',
        '#.II.#',
        '####I#',
        '####F#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [
        { x: 4, y: 1, not: 5, ben: 1 },
        { x: 4, y: 3, not: 4, ben: 1 }
      ],
      maMau: bai([
        'play_list([1, 3, 5])',
        'turn_right()',
        'play_list([2, 6])'
      ]),
      loiGiai: bai([
        'play_list([1, 3, 5])',
        'turn_right()',
        'play_list([2, 4])'
      ]),
      loiSai: [
        { moTa: 'Để nguyên [2, 6]: sai nốt cuối và không phá được đá chuông nốt 4 tại cờ', baiLam: bai(['play_list([1, 3, 5])', 'turn_right()', 'play_list([2, 6])']), phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 11, nhip: 6 },
      goiY: [
        ' hai nốt cuối của bản nhạc 135.24 là 2 và 4 (đồng thời phá khối đá nốt 4 ở (4, 3)).',
        'Sửa play_list([2, 6]) thành play_list([2, 4]).'
      ]
    }),

    manChePhatNot(7, 'luyen', {
      ten: 'Chế lệnh: phá đá theo từ điển',
      taoHam: ['dict_crack'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'crack_glide'],
      deBai: 'Tạo hàm dict_crack(d, k) nhận từ điển tần số d và độ bền k: đo khoảng cách tới khối đá chuông bằng hear(), tra tần số d[hear()] rồi gọi crack_glide(d[hear()], k) để ngân k nhịp phá đá và trượt hết dải băng.',
      veMaMau: 'Trong dict_crack(d, k), viết 1 dòng: crack_glide(d[hear()], k).',
      san: [
        [
          '#######',
          '#.III.#',
          '#####F#',
          '#######'
        ],
        [
          '#######',
          '#.III.#',
          '#####F#',
          '#######'
        ]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [{ x: 3, y: 1, not: 3, ben: 2 }],
        [{ x: 4, y: 1, not: 6, ben: 2 }]
      ],
      maMau: bai([
        'd = {2: 3, 3: 6}',
        'dict_crack(d, 2)',
        'move()'
      ]),
      loiGiai: bai(
        [
          'd = {2: 3, 3: 6}',
          'dict_crack(d, 2)',
          'move()'
        ],
        [],
        [ham('dict_crack', ['crack_glide(d[hear()], k)'], ['d', 'k'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm dict_crack', baiLam: bai(['d = {2: 3, 3: 6}', 'dict_crack(d, 2)', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Truyền cứng độ bền 1 thay vì k trong dict_crack: đá ben=2 không vỡ', baiLam: bai(['d = {2: 3, 3: 6}', 'dict_crack(d, 2)', 'move()']), hamCuaEmMoi: [ham('dict_crack', ['crack_glide(d[hear()], 1)'], ['d', 'k'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 5 },
      goiY: [
        'Thân hàm dict_crack(d, k) chỉ cần gọi crack_glide(d[hear()], k).',
        'Sau khi dict_crack(d, 2) phá đá và trượt tới (5, 1) rẽ phải, lệnh move() bước vào cờ.'
      ]
    }),

    manChePhatNot(8, 'bien-the', {
      ten: 'Bản giao hưởng qua ngách ngầm',
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'glide_tunnel', 'play_note'],
      deBai: 'Miệng ngách hang ở (5, 1) đang bị một khối đá chuông nốt 5 chặn ở (3, 1). Hãy gọi play_note(5) để phá đá, gọi glide_tunnel() để trượt qua dải băng chui sang (1, 3) và bước ra (2, 3), sau đó gọi play_note(8) phá khối đá ở (4, 3) rồi thu gai trượt vào cờ.',
      veMaMau: 'Mã mẫu đã đi qua ngách ngầm sang (2, 3), hãy viết tiếp phần phá khối đá nốt 8 và trượt vào cờ.',
      san: [
        '#######',
        '#.III>#',
        '#######',
        '#>IIIF#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      ngachHang: [{ a: { x: 5, y: 1 }, b: { x: 1, y: 3 } }],
      daChuong: [
        { x: 3, y: 1, not: 5, ben: 1 },
        { x: 4, y: 3, not: 8, ben: 1 }
      ],
      maMau: bai([
        'play_note(5)',
        'glide_tunnel()'
      ]),
      loiGiai: bai([
        'play_note(5)',
        'glide_tunnel()',
        'play_note(8)',
        'retract_spikes()',
        'move()'
      ]),
      loiSai: [
        { moTa: 'Chưa viết phần đi ở tầng dưới', baiLam: bai(['play_note(5)', 'glide_tunnel()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Trượt ở tầng dưới mà quên play_note(8): vướng đá chuông (4, 3)', baiLam: bai(['play_note(5)', 'glide_tunnel()', 'retract_spikes()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 5 },
      goiY: [
        'Sau glide_tunnel(), R1 đang đứng ở (2, 3) cách khối đá (4, 3) đúng 2 ô.',
        'Thêm play_note(8), retract_spikes() và move() để trượt thẳng tới cờ (5, 3).'
      ]
    }),

    manChePhatNot(9, 'bien-the', {
      ten: 'Chế lệnh: lọc nốt trùng và hành quân',
      taoHam: ['unique_notes'], chinhCoDinh: true,
      hamCuaEmCan: ['march_note'],
      dieu: '375',
      dieuToiCo: true,
      deBai: 'Tạo hàm unique_notes(a) nhận danh sách nốt nhạc a có thể bị trùng: khởi tạo s = set(), duyệt for x in a:, nếu x not in s: thì thêm s.add(x) và gọi march_note(x) để vừa bước vừa phát các nốt duy nhất.',
      veMaMau: 'Trong unique_notes(a), dùng s = set() và if x not in s: để lọc trùng trước khi gọi march_note(x).',
      san: [
        '######',
        '#.IIF#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [{ x: 3, y: 1, not: 7, ben: 1 }],
      maMau: bai([
        'unique_notes([3, 7, 3, 5, 7])'
      ]),
      loiGiai: bai(
        [
          'unique_notes([3, 7, 3, 5, 7])'
        ],
        [],
        [ham('unique_notes', ['s = set()', 'for x in a:', '    if x not in s:', '        s.add(x)', '        march_note(x)'], ['a'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm unique_notes', baiLam: bai(['unique_notes([3, 7, 3, 5, 7])']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Không lọc trùng bằng set: phát lại nốt 3 ở bước thứ ba gây sai nốt', baiLam: bai(['unique_notes([3, 7, 3, 5, 7])']), hamCuaEmMoi: [ham('unique_notes', ['for x in a:', '    march_note(x)'], ['a'])], phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 10, nhip: 3 },
      goiY: [
        'Trong unique_notes(a), nhớ viết s.add(x) ngay trước march_note(x) bên trong khối if x not in s:.',
        'Ba nốt phân biệt 3, 7, 5 vừa khớp bản nhạc 375 vừa phá khối đá nốt 7 ở (3, 1).'
      ]
    }),

    manChePhatNot(10, 'trum', {
      ten: 'Trùm: Bản tấu khúc phá thạch nhũ',
      huyHieu: { ma: 'che-phat-not', ten: 'Huy hiệu Chế lệnh: tấu khúc phá đá' },
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'crack_glide', 'dict_crack', 'march_note', 'unique_notes'],
      nhipTheo: 'tong',
      deBai: 'Trùm Gói 6! Ở cả 2 sân, dùng từ điển d = {2: 4, 3: 6} và gọi dict_crack(d, 2) để ngân 2 nhịp phá thạch nhũ dày trên hành lang ngang rồi trượt tới góc (5, 1) và rẽ phải. Sau đó gọi unique_notes([2, 8, 2, 5, 8]) để vừa bước 3 ô dọc xuống cờ vừa phá khối đá chuông nốt 8 ở (5, 3).',
      veMaMau: 'Kết hợp d = {2: 4, 3: 6}, dict_crack(d, 2) và unique_notes([2, 8, 2, 5, 8]).',
      san: [
        [
          '#######',
          '#.III.#',
          '#####I#',
          '#####I#',
          '#####F#',
          '#######'
        ],
        [
          '#######',
          '#.III.#',
          '#####I#',
          '#####I#',
          '#####F#',
          '#######'
        ]
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      daChuong: [
        [
          { x: 3, y: 1, not: 4, ben: 2 },
          { x: 5, y: 3, not: 8, ben: 1 }
        ],
        [
          { x: 4, y: 1, not: 6, ben: 2 },
          { x: 5, y: 3, not: 8, ben: 1 }
        ]
      ],
      maMau: bai([
        'd = {2: 4, 3: 6}',
        'dict_crack(d, 2)'
      ]),
      loiGiai: bai([
        'd = {2: 4, 3: 6}',
        'dict_crack(d, 2)',
        'unique_notes([2, 8, 2, 5, 8])'
      ]),
      loiSai: [
        { moTa: 'Chưa gọi unique_notes cho chặng dọc: dừng ở góc (5, 1)', baiLam: bai(['d = {2: 4, 3: 6}', 'dict_crack(d, 2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Truyền thiếu nốt thứ ba [2, 8, 2, 8]: chỉ đi 2 bước, dừng trước cờ', baiLam: bai(['d = {2: 4, 3: 6}', 'dict_crack(d, 2)', 'unique_notes([2, 8, 2, 8])']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 25, nhip: 14 },
      goiY: [
        'dict_crack(d, 2) phá thạch nhũ ngang, trượt tới (5, 1) và rẽ phải hướng xuống Nam (với gai đã bung).',
        'Thêm dòng unique_notes([2, 8, 2, 5, 8]) để R1 đi 3 bước xuống cờ (5, 4) và phá khối đá nốt 8 trên đường.'
      ]
    })
  ];

  if (M && M.them) M.manPhatNot = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();

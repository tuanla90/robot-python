/* ============================================================================
   man-hang-cu.js - Mùa 8 Hang động đá vôi: GÓI 8 "Hang động cũ" (20 màn)
     Chương 1: hang-cu     (10 màn: kết hợp bánh gai, thu gai, loa, thẩm âm với cửa nhịp C, ngách hang, bàn xoay @, hố u)
     Chương 2: che-hang-cu (10 màn: chế hàm phối hợp cơ học hang động + vật cản cổ điển + dict + set)

   Luật R1 gói 8:
     - Thân: 'gai' (loaiRobot: 'gai', thuGai: true)
     - Tay: 'loa' (beat, note, phatNot: true)
     - Cảm biến: 'am-thanh' nâng cấp thẩm âm (phanAm: true, hear, listen)
     - Khay lệnh: left_move, right_move, left_back, right_back, wait,
                  retract_spikes, extend_spikes, beat, note, hear, listen
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
  var HAM_GOC_HANG_CU = [
    'left_move', 'right_move', 'left_back', 'right_back', 'wait',
    'retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen'
  ];

  function manGaiHangCu(chuong, so, hang, d) {
    var nhieuSan = Array.isArray(d.san && d.san[0]);
    return Object.assign({
      id: chuong + '.' + so,
      chuong: chuong,
      so: so,
      hang: hang,
      loaiRobot: 'gai',
      thuGai: true,
      phatNot: true,
      phanAm: true,
      robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }] },
      moXuong: true,
      camHamCuaEm: false,
      taoHam: [],
      hamCuaEmCan: [],
      khung: { ham: 10, chinh: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      hamGoc: HAM_GOC_HANG_CU,
      mucTieu: d.dieu ? 'choi-dieu' : 'toi-co',
      nhipTheo: nhieuSan ? 'tong' : undefined,
      nhipToiDa: d.nhipToiDa || (d.sao && d.sao.nhip ? d.sao.nhip + 14 : 45),
      loiSai: []
    }, d);
  }

  function manHangCu(so, hang, d) { return manGaiHangCu('hang-cu', so, hang, d); }
  function manCheHangCu(so, hang, d) { return manGaiHangCu('che-hang-cu', so, hang, d); }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: hang-cu - Hang động cũ (10 màn)
       ====================================================================== */
    manHangCu(1, 'lam-quen', {
      ten: 'Cổng nhịp trong hang đá ướt',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'drum_hit'],
      deBai: 'Trong khu hang khai thác cũ, cổng sắt tự động C ở (3, 1) đang đóng ở nhịp đầu và mở ra từ nhịp 2 trở đi. R1 gõ trống drum_hit(1) chờ cổng mở rồi tiến thẳng trên nền đá vôi ướt I tới cờ. Bấm Chạy để quan sát.',
      veMaMau: 'R1 gõ 1 nhịp trống chờ cổng C mở rồi gọi forward(4) tiến về cờ.',
      san: ['#######', '#.ICIF#', '#######'],
      batDau: { x: 1, y: 1, huong: 1 },
      cuaNhip: [{ x: 3, y: 1, mo: 20, dong: 1, pha: 20 }],
      maMau: bai(['drum_hit(1)', 'forward(4)']),
      loiGiai: bai(['drum_hit(1)', 'forward(4)']),
      sao: { o: 10, nhip: 5 },
      goiY: ['Bấm nút Chạy để quan sát R1 chờ cổng nhịp C mở rồi đi qua nền đá ướt.', 'Màn 1 chỉ cần chạy thử, chưa cần sửa mã.']
    }),

    manHangCu(2, 'lam-quen', {
      ten: 'Thu gai trượt kịp cổng nhịp',
      hamCuaEmCan: ['move', 'slide_stop'],
      deBai: 'Cổng C ở (4, 1) mở trong 2 nhịp đầu rồi đóng lại từ nhịp 3. Nếu đi bộ từng bước trên dải đá ướt I, R1 tới cổng quá muộn! Hãy gọi slide_stop() để thu gai trượt vọt qua dải đá ướt trong 1 nhịp rồi bước luôn qua cổng C tới cờ.',
      veMaMau: 'Mã mẫu đi bộ từng bước nên khi tới nơi cổng C đã đóng.',
      san: ['#######', '#.IICF#', '#######'],
      batDau: { x: 1, y: 1, huong: 1 },
      cuaNhip: [{ x: 4, y: 1, mo: 1, dong: 10, pha: 0 }],
      maMau: bai(['move()', 'move()', 'move()', 'move()']),
      loiGiai: bai(['slide_stop()', 'move()']),
      loiSai: [
        { moTa: 'Đi bộ move() 4 lần: tới cổng C ở nhịp 3 khi cổng đã đóng sập', baiLam: bai(['move()', 'move()', 'move()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 9, nhip: 2 },
      goiY: ['slide_stop() trượt qua (2, 1) và (3, 1) ở nhịp 1, rồi bước qua cổng C ở (4, 1) ngay nhịp 2 khi cổng còn mở.', 'Sau slide_stop(), gọi thêm move() để bước vào cờ F.']
    }),

    manHangCu(3, 'lam-quen', {
      ten: 'Tiếng vang dẫn qua cổng hai sân',
      hamCuaEmCan: ['move', 'forward', 'go_echo'],
      deBai: 'Ở 2 sân, chuông đá đặt ngay trước cổng nhịp C (sân 1 cách 2 ô, sân 2 cách 3 ô), và cổng C mở sẵn từ nhịp 2. Hãy dùng go_echo() để tiến tới sát cổng C, sau đó đi tiếp 2 ô tới cờ.',
      veMaMau: 'Mã mẫu dùng forward(2) nên ở sân 2 dừng sớm 1 ô, chưa tới cờ.',
      san: [
        ['#######', '#.I.CF#', '#######'],
        ['########', '#.II.CF#', '########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 2 }],
        [{ x: 4, y: 1, not: 5 }]
      ],
      cuaNhip: [
        [{ x: 4, y: 1, mo: 20, dong: 1, pha: 20 }],
        [{ x: 5, y: 1, mo: 20, dong: 1, pha: 20 }]
      ],
      maMau: bai(['forward(2)', 'forward(2)']),
      loiGiai: bai(['go_echo()', 'forward(2)']),
      loiSai: [
        { moTa: 'Để nguyên forward(2): ở sân 2 chỉ đi được 4 ô, dừng trước cờ', baiLam: bai(['forward(2)', 'forward(2)']), phaiCoMa: ['chua-toi-co'], cung: true }
      ],
      sao: { o: 8, nhip: 9 },
      goiY: ['Chuông đá đặt ngay trước cổng C nên hear() cho biết số bước cần đi tới trước cổng.', 'Đổi dòng đầu thành go_echo(), giữ dòng hai là forward(2).']
    }),

    manHangCu(4, 'lam-quen', {
      ten: 'Bàn xoay giữa vách đá',
      hamCuaEmCan: ['move', 'forward', 'play_note'],
      deBai: 'Ở (3, 1) có bàn xoay @. Khi R1 bước lên @, bàn xoay tự quay R1 sang phải (hướng xuống), đối diện với khối đá chuông ở (3, 2). Hãy tiến 2 ô lên bàn xoay, gọi play_note(listen()) phá đá chuông, rồi tiến 2 ô tới cờ.',
      veMaMau: 'Mã mẫu quên phá đá chuông sau khi lên bàn xoay nên đâm vào đá chuông.',
      san: ['#####', '#.I@#', '###I#', '###F#', '#####'],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [{ x: 3, y: 2, not: 4, ben: 1 }],
      maMau: bai(['forward(2)', 'forward(2)']),
      loiGiai: bai(['forward(2)', 'play_note(listen())', 'forward(2)']),
      loiSai: [
        { moTa: 'Quên play_note(listen()): đâm vào khối đá chuông ở (3, 2)', baiLam: bai(['forward(2)', 'forward(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 10, nhip: 5 },
      goiY: ['Sau forward(2), R1 đứng trên bàn xoay @ và đã quay mặt xuống dưới.', 'Chèn play_note(listen()) giữa hai lệnh forward(2).']
    }),

    manHangCu(5, 'cung-co', {
      ten: 'Chế hàm: Đi theo vang qua cổng nhịp',
      taoHam: ['echo_gate'],
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'turn_right'],
      deBai: 'Trong hang cũ, chuông đá luôn đặt ngay trước cổng nhịp C. Hãy viết hàm echo_gate(): gọi go_echo() để tiến tới chuông đá (đúng lúc cổng C mở ra), rồi gọi move() để bước qua cổng C. Sau đó rẽ phải và tiến 2 bước tới cờ ở cả 2 sân.',
      veMaMau: 'Hàm echo_gate() đang để trống thân hàm.',
      san: [
        ['######', '#.I.C#', '####I#', '####F#', '######'],
        ['#######', '#.II.C#', '#####I#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 1 }],
        [{ x: 4, y: 1, not: 4 }]
      ],
      cuaNhip: [
        [{ x: 4, y: 1, mo: 20, dong: 1, pha: 20 }],
        [{ x: 5, y: 1, mo: 20, dong: 1, pha: 20 }]
      ],
      maMau: bai(['echo_gate()', 'turn_right()', 'forward(2)'], [], [ham('echo_gate', [])]),
      loiGiai: bai(['echo_gate()', 'turn_right()', 'forward(2)'], [], [ham('echo_gate', ['go_echo()', 'move()'])]),
      loiSai: [
        { moTa: 'Để trống echo_gate(): R1 không đi tới cổng C', baiLam: bai(['echo_gate()', 'turn_right()', 'forward(2)'], [], [ham('echo_gate', [])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Thiếu move() trong echo_gate(): dừng trước cổng C và rẽ phải đâm tường', baiLam: bai(['echo_gate()', 'turn_right()', 'forward(2)'], [], [ham('echo_gate', ['go_echo()'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'], cung: true }
      ],
      sao: { o: 13, nhip: 13 },
      goiY: ['Trong echo_gate(), viết 2 dòng: go_echo() và move().', 'Chương trình chính đã gọi sẵn echo_gate(), turn_right(), forward(2).']
    }),

    manHangCu(6, 'cung-co', {
      ten: 'Ngách hang ngầm sau cổng',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'echo_gate', 'play_note'],
      deBai: 'Sau khi vượt qua cổng C bằng echo_gate(), R1 bước thêm 1 ô vào ngách hang ngầm ở (5, 1) để chui sang (5, 2). Tại đây, hãy quay phải, phá đá chuông ở (5, 3) bằng play_note(listen()) rồi tiến 2 ô tới cờ.',
      veMaMau: 'Mã mẫu quên phá đá chuông sau khi chui qua ngách hang.',
      san: ['#######', '#.I.C.#', '#####.#', '#####I#', '#####F#', '#######'],
      batDau: { x: 1, y: 1, huong: 1 },
      chuongDa: [{ x: 3, y: 1, not: 2 }],
      cuaNhip: [{ x: 4, y: 1, mo: 20, dong: 1, pha: 20 }],
      ngachHang: [{ a: { x: 5, y: 1 }, b: { x: 5, y: 2 } }],
      daChuong: [{ x: 5, y: 3, not: 5, ben: 1 }],
      maMau: bai(['echo_gate()', 'move()', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['echo_gate()', 'move()', 'turn_right()', 'play_note(listen())', 'forward(2)']),
      loiSai: [
        { moTa: 'Quên play_note(listen()): đâm vào đá chuông ở (5, 3)', baiLam: bai(['echo_gate()', 'move()', 'turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 8 },
      goiY: ['Sau echo_gate(), R1 ở (4, 1); gọi move() bước sang (5, 1) là ngách hang đưa xuống (5, 2).', 'Sau turn_right(), gọi play_note(listen()) trước forward(2).']
    }),

    manHangCu(7, 'cung-co', {
      ten: 'Chế hàm: Phá đá và trượt rẽ',
      taoHam: ['crack_switch'],
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'play_note'],
      deBai: 'Trước mỗi dải đá ướt có một khối đá chuông chắn ngay đầu dốc. Hãy viết hàm crack_switch(): gọi play_note(listen()) để phá đá chuông, rồi gọi glide_step() để thu gai trượt hết dải đá ướt và rẽ phải. Gọi crack_switch() 2 lần ở chương trình chính.',
      veMaMau: 'Hàm crack_switch() chưa có lệnh phá đá.',
      san: [
        ['######', '#.III#', '####I#', '####I#', '####F#', '######'],
        ['#######', '#.IIII#', '#####I#', '#####I#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [{ x: 2, y: 1, not: 3, ben: 1 }, { x: 4, y: 2, not: 7, ben: 1 }],
        [{ x: 2, y: 1, not: 6, ben: 1 }, { x: 5, y: 2, not: 2, ben: 1 }]
      ],
      maMau: bai(['crack_switch()', 'crack_switch()'], [], [ham('crack_switch', ['glide_step()'])]),
      loiGiai: bai(['crack_switch()', 'crack_switch()'], [], [ham('crack_switch', ['play_note(listen())', 'glide_step()'])]),
      loiSai: [
        { moTa: 'Quên play_note(listen()) trong crack_switch(): đâm ngay vào đá chuông đầu tiên', baiLam: bai(['crack_switch()', 'crack_switch()'], [], [ham('crack_switch', ['glide_step()'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 10 },
      goiY: ['Trong crack_switch(), viết play_note(listen()) ở dòng 1 và glide_step() ở dòng 2.', 'Nhờ đó R1 phá khối đá chuông rồi trượt một mạch qua dải đá ướt.']
    }),

    manHangCu(8, 'van-dung', {
      ten: 'Tránh hố sâu bằng từ điển',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'play_note'],
      deBai: 'Hành lang có hố sâu u ở cuối đường, nhưng từ điển d = {2: 2, 5: 3} cho biết số bước an toàn cần đi sau khi nghe nốt của đá chuông. Hãy phá đá chuông bằng play_note(k), tiến d[k] bước, rẽ phải và bước tới cờ.',
      veMaMau: 'Mã mẫu đi cứng 4 bước nên rơi xuống hố u.',
      san: ['#######', '#.II.u#', '####F##', '#######'],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [{ x: 2, y: 1, not: 5, ben: 1 }],
      maMau: bai(['d = {2: 2, 5: 3}', 'k = listen()', 'play_note(k)', 'forward(4)', 'turn_right()', 'move()']),
      loiGiai: bai(['d = {2: 2, 5: 3}', 'k = listen()', 'play_note(k)', 'forward(d[k])', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'Đi forward(4) thay vì forward(d[k]): rơi xuống hố u ở (5, 1)', baiLam: bai(['d = {2: 2, 5: 3}', 'k = listen()', 'play_note(k)', 'forward(4)', 'turn_right()', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 15, nhip: 6 },
      goiY: ['Tra số bước an toàn trong từ điển d bằng d[k].', 'Đổi forward(4) thành forward(d[k]).']
    }),

    manHangCu(9, 'van-dung', {
      ten: 'Vượt cổng nhịp và chơi điệu hai sân',
      hamCuaEmCan: ['move', 'forward', 'echo_gate', 'march_note'],
      deBai: 'Ở 2 sân, R1 cần dùng echo_gate() vượt qua cổng nhịp C đầu tiên, sau đó dùng vòng for 2 bước gọi march_note(listen()) để vừa tiến qua chuông đá vừa phát đúng 2 nốt nhạc của điệu.',
      veMaMau: 'Mã mẫu chỉ gọi echo_gate() mà chưa phát 2 nốt nhạc cuối hành lang.',
      san: [
        ['########', '#.I.CII#', '########'],
        ['#########', '#.II.CII#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 4 }, { x: 5, y: 1, not: 6 }],
        [{ x: 4, y: 1, not: 3 }, { x: 6, y: 1, not: 7 }]
      ],
      cuaNhip: [
        [{ x: 4, y: 1, mo: 20, dong: 1, pha: 20 }],
        [{ x: 5, y: 1, mo: 20, dong: 1, pha: 20 }]
      ],
      dieu: [[4, 6], [3, 7]],
      maMau: bai(['echo_gate()']),
      loiGiai: bai(['echo_gate()', 'for i in range(2):', '    march_note(listen())']),
      loiSai: [
        { moTa: 'Chỉ gọi echo_gate(): chưa chơi đủ 2 nốt nhạc của điệu', baiLam: bai(['echo_gate()']), phaiCoMa: ['chua-du-dieu'], cung: true }
      ],
      sao: { o: 15, nhip: 11 },
      goiY: ['Sau echo_gate(), R1 đứng trước 2 chuông đá.', 'Thêm vòng for i in range(2): gọi march_note(listen()).']
    }),

    manHangCu(10, 'trum', {
      ten: 'Trùm Hang cũ: Mê cung cổng đá',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'echo_gate', 'crack_switch'],
      deBai: 'Bài trùm 3 sân! Mỗi sân có một cổng C vượt bằng echo_gate(), một hành lang đá chuông trên đá ướt vượt bằng crack_switch(), và một cổng C cuối cùng vượt bằng echo_gate() trước khi bước 1 ô tới cờ.',
      veMaMau: 'Hoàn thiện chương trình để vượt qua cả 3 sân hang cũ.',
      san: [
        ['#######', '#.I.CI#', '#####I#', '#####I#', '##FC.I#', '#######'],
        ['########', '#.II.CI#', '######I#', '######I#', '##FC.II#', '########'],
        ['########', '#.I.CI##', '#####I##', '#####I##', '#####I##', '#FC.II##', '########']
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      chuongDa: [
        [{ x: 3, y: 1, not: 2 }, { x: 4, y: 4, not: 5 }],
        [{ x: 4, y: 1, not: 3 }, { x: 4, y: 4, not: 6 }],
        [{ x: 3, y: 1, not: 4 }, { x: 3, y: 5, not: 7 }]
      ],
      daChuong: [
        [{ x: 5, y: 2, not: 4, ben: 1 }],
        [{ x: 6, y: 2, not: 7, ben: 1 }],
        [{ x: 5, y: 2, not: 3, ben: 1 }]
      ],
      cuaNhip: [
        [{ x: 4, y: 1, mo: 30, dong: 1, pha: 30 }, { x: 3, y: 4, mo: 30, dong: 1, pha: 30 }],
        [{ x: 5, y: 1, mo: 30, dong: 1, pha: 30 }, { x: 3, y: 4, mo: 30, dong: 1, pha: 30 }],
        [{ x: 4, y: 1, mo: 30, dong: 1, pha: 30 }, { x: 2, y: 5, mo: 30, dong: 1, pha: 30 }]
      ],
      maMau: bai(['echo_gate()', 'move()', 'turn_right()', 'crack_switch()']),
      loiGiai: bai(['echo_gate()', 'move()', 'turn_right()', 'crack_switch()', 'echo_gate()', 'move()']),
      loiSai: [
        { moTa: 'Thiếu echo_gate() và move() ở đoạn cuối: dừng trước cổng C thứ hai', baiLam: bai(['echo_gate()', 'move()', 'turn_right()', 'crack_switch()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng forward(3) thay vì echo_gate() đầu tiên: ở sân 2 đâm vào cổng C', baiLam: bai(['forward(3)', 'move()', 'turn_right()', 'crack_switch()', 'echo_gate()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'], cung: true }
      ],
      sao: { o: 24, nhip: 36 },
      goiY: ['Sau crack_switch(), R1 đã trượt xuống góc dưới và quay sang trái hướng về chuông đá thứ hai.', 'Gọi tiếp echo_gate() và move() để qua cổng cuối và về cờ.']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-hang-cu - Chế lệnh: Hang động cũ (10 màn)
       ====================================================================== */
    manCheHangCu(1, 'lam-quen', {
      ten: 'Chế hàm: Chui ngách hang và nghe vang',
      taoHam: ['belt_echo'],
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'turn_right'],
      deBai: 'Ở đầu hành lang có ngách hang ngầm đưa R1 qua vách đá tới vị trí nghe tiếng vang của chuông đá. Hãy viết hàm belt_echo(): gọi move() để bước vào ngách hang, rồi gọi go_echo() để tiến theo tiếng vang. Gọi belt_echo() 2 lần.',
      veMaMau: 'Hàm belt_echo() chưa có go_echo().',
      san: ['#######', '#..#II#', '#####.#', '#####.#', '#####I#', '#####F#', '#######'],
      batDau: { x: 1, y: 1, huong: 1 },
      ngachHang: [
        { a: { x: 2, y: 1 }, b: { x: 4, y: 1 } },
        { a: { x: 5, y: 2 }, b: { x: 5, y: 3 } }
      ],
      chuongDa: [{ x: 5, y: 1, not: 2 }, { x: 5, y: 5, not: 4 }],
      maMau: bai(['belt_echo()', 'turn_right()', 'belt_echo()'], [], [ham('belt_echo', ['move()'])]),
      loiGiai: bai(['belt_echo()', 'turn_right()', 'belt_echo()'], [], [ham('belt_echo', ['move()', 'go_echo()'])]),
      loiSai: [
        { moTa: 'Thiếu go_echo() trong belt_echo(): dừng lại ngay sau ngách hang', baiLam: bai(['belt_echo()', 'turn_right()', 'belt_echo()'], [], [ham('belt_echo', ['move()'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 13, nhip: 6 },
      goiY: ['Trong belt_echo(), viết move() ở dòng 1 và go_echo() ở dòng 2.', 'Chương trình chính đã gọi belt_echo(), turn_right(), belt_echo().']
    }),

    manCheHangCu(2, 'lam-quen', {
      ten: 'Ngách hang và cổng nhịp hai sân',
      hamCuaEmCan: ['move', 'forward', 'belt_echo', 'echo_gate'],
      deBai: 'Ở 2 sân, R1 dùng belt_echo() để chui qua ngách hang tới chuông đá đầu tiên, sau đó dùng echo_gate() để vượt qua cổng nhịp C và bước thêm 1 ô tới cờ.',
      veMaMau: 'Mã mẫu chỉ gọi belt_echo() mà quên vượt cổng C ở cuối đường.',
      san: [
        ['#########', '#..#I.CF#', '#########'],
        ['##########', '#..#II.CF#', '##########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      ngachHang: [
        [{ a: { x: 2, y: 1 }, b: { x: 4, y: 1 } }],
        [{ a: { x: 2, y: 1 }, b: { x: 4, y: 1 } }]
      ],
      chuongDa: [
        [{ x: 5, y: 1, not: 1 }, { x: 5, y: 1, not: 3 }],
        [{ x: 6, y: 1, not: 2 }, { x: 6, y: 1, not: 5 }]
      ],
      cuaNhip: [
        [{ x: 6, y: 1, mo: 20, dong: 1, pha: 20 }],
        [{ x: 7, y: 1, mo: 20, dong: 1, pha: 20 }]
      ],
      maMau: bai(['belt_echo()']),
      loiGiai: bai(['belt_echo()', 'echo_gate()', 'move()']),
      loiSai: [
        { moTa: 'Chỉ gọi belt_echo(): dừng giữa đường, chưa qua cổng C', baiLam: bai(['belt_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 13, nhip: 9 },
      goiY: ['Sau belt_echo(), R1 đứng trước cổng C.', 'Gọi tiếp echo_gate() và move() để vượt cổng C và bước vào cờ F.']
    }),

    manCheHangCu(3, 'lam-quen', {
      ten: 'Chế hàm: Bàn xoay phá đá chuông',
      taoHam: ['spin_crack'],
      hamCuaEmCan: ['move', 'play_note'],
      deBai: 'Khi bước lên bàn xoay @, R1 được xoay sang phải đối diện ngay khối đá chuông. Hãy viết hàm spin_crack(): gọi move() bước lên bàn xoay, play_note(listen()) phá đá chuông, rồi move() bước vào ô đá vừa phá. Gọi spin_crack() 2 lần.',
      veMaMau: 'Hàm spin_crack() chưa có lệnh phá đá và bước ra.',
      san: ['######', '##.@##', '###I##', '#FI@##', '######'],
      batDau: { x: 2, y: 1, huong: 1 },
      daChuong: [{ x: 3, y: 2, not: 3, ben: 1 }, { x: 2, y: 3, not: 6, ben: 1 }],
      maMau: bai(['spin_crack()', 'spin_crack()', 'move()'], [], [ham('spin_crack', ['move()'])]),
      loiGiai: bai(['spin_crack()', 'spin_crack()', 'move()'], [], [ham('spin_crack', ['move()', 'play_note(listen())', 'move()'])]),
      loiSai: [
        { moTa: 'Thiếu play_note(listen()) và move() trong spin_crack(): chưa phá đá chuông', baiLam: bai(['spin_crack()', 'spin_crack()', 'move()'], [], [ham('spin_crack', ['move()'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 11, nhip: 7 },
      goiY: ['Trong spin_crack(), viết 3 dòng: move(), play_note(listen()), move().', 'Hai bàn xoay @ lần lượt quay R1 xuống dưới rồi sang trái hướng thẳng về cờ F.']
    }),

    manCheHangCu(4, 'lam-quen', {
      ten: 'Vòng xoắn bàn xoay hai sân',
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'spin_crack'],
      deBai: 'Ở 2 sân, hai bàn xoay @ đặt ở hai góc hành lang xoay R1 theo chiều kim đồng hồ, và ngay sau mỗi bàn xoay là một khối đá chuông. Hãy dùng spin_crack() hai lần rồi gọi go_echo() tiến nốt đoạn cuối tới cờ.',
      veMaMau: 'Mã mẫu chỉ gọi spin_crack() một lần.',
      san: [
        ['#######', '###.@##', '####I##', '#F.I@##', '#######'],
        ['########', '####.@##', '#####I##', '#F..I@##', '########']
      ],
      batDau: [{ x: 3, y: 1, huong: 1 }, { x: 4, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 1, y: 3, not: 2 }],
        [{ x: 1, y: 3, not: 4 }]
      ],
      daChuong: [
        [{ x: 4, y: 2, not: 5, ben: 1 }, { x: 3, y: 3, not: 2, ben: 1 }],
        [{ x: 5, y: 2, not: 7, ben: 1 }, { x: 4, y: 3, not: 3, ben: 1 }]
      ],
      maMau: bai(['spin_crack()']),
      loiGiai: bai(['spin_crack()', 'spin_crack()', 'go_echo()']),
      loiSai: [
        { moTa: 'Chỉ gọi spin_crack() 1 lần: dừng ở nhánh dọc', baiLam: bai(['spin_crack()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 17 },
      goiY: ['Sau 2 lần spin_crack(), R1 đã quay sang trái đối diện chuông đá ở cờ F.', 'Gọi tiếp go_echo() để về đích ở cả 2 sân.']
    }),

    manCheHangCu(5, 'cung-co', {
      ten: 'Chế hàm: Giải mã nốt vượt cổng từ điển',
      taoHam: ['dict_gate'],
      hamCuaEmCan: ['move', 'forward', 'play_note'],
      deBai: 'Khối đá chuông chắn trước cổng C mang nốt k, và từ điển d cho biết cần tiến mấy bước (d[k]) để vượt qua cổng C tới đích. Hãy viết hàm dict_gate(d): đọc k = listen(), gọi play_note(k) phá đá, rồi gọi forward(d[k]).',
      veMaMau: 'Hàm dict_gate(d) chưa có thân hàm.',
      san: ['########', '#.II.CF#', '########'],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [{ x: 2, y: 1, not: 4, ben: 1 }],
      cuaNhip: [{ x: 5, y: 1, mo: 20, dong: 1, pha: 20 }],
      maMau: bai(['d = {2: 3, 4: 5}', 'dict_gate(d)'], [], [ham('dict_gate', [], ['d'])]),
      loiGiai: bai(['d = {2: 3, 4: 5}', 'dict_gate(d)'], [], [ham('dict_gate', ['k = listen()', 'play_note(k)', 'forward(d[k])'], ['d'])]),
      loiSai: [
        { moTa: 'Để trống dict_gate(d): R1 đứng yên', baiLam: bai(['d = {2: 3, 4: 5}', 'dict_gate(d)'], [], [ham('dict_gate', [], ['d'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên play_note(k): đâm vào đá chuông ở (2, 1)', baiLam: bai(['d = {2: 3, 4: 5}', 'dict_gate(d)'], [], [ham('dict_gate', ['k = listen()', 'forward(d[k])'], ['d'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 12, nhip: 6 },
      goiY: ['Trong dict_gate(d), viết 3 dòng: k = listen(), play_note(k), forward(d[k]).', 'Chương trình chính đã khai báo d = {2: 3, 4: 5} và gọi dict_gate(d).']
    }),

    manCheHangCu(6, 'cung-co', {
      ten: 'Từ điển vượt cổng hai sân',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'dict_gate'],
      deBai: 'Ở 2 sân, mỗi nhánh hành lang có đá chuông mang nốt 3 hoặc 6. Dùng dict_gate(d) với d = {3: 3, 6: 4} hai lần qua khúc cua để vượt cả 2 cổng C và tới cờ.',
      veMaMau: 'Mã mẫu chỉ gọi dict_gate(d) cho nhánh đầu tiên.',
      san: [
        ['######', '#.I.C#', '####I#', '####.#', '####C#', '####F#', '######'],
        ['#######', '#.II.C#', '#####I#', '#####C#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [{ x: 2, y: 1, not: 3, ben: 1 }, { x: 4, y: 2, not: 6, ben: 1 }],
        [{ x: 2, y: 1, not: 6, ben: 1 }, { x: 5, y: 2, not: 3, ben: 1 }]
      ],
      cuaNhip: [
        [{ x: 4, y: 1, mo: 20, dong: 1, pha: 20 }, { x: 4, y: 4, mo: 20, dong: 1, pha: 20 }],
        [{ x: 5, y: 1, mo: 20, dong: 1, pha: 20 }, { x: 5, y: 3, mo: 20, dong: 1, pha: 20 }]
      ],
      maMau: bai(['d = {3: 3, 6: 4}', 'dict_gate(d)', 'turn_right()']),
      loiGiai: bai(['d = {3: 3, 6: 4}', 'dict_gate(d)', 'turn_right()', 'dict_gate(d)']),
      loiSai: [
        { moTa: 'Thiếu dict_gate(d) lần 2: dừng ở góc cua, chưa tới cờ', baiLam: bai(['d = {3: 3, 6: 4}', 'dict_gate(d)', 'turn_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 20 },
      goiY: ['Sau turn_right(), R1 đối diện khối đá chuông thứ hai.', 'Gọi thêm dict_gate(d) ở dòng cuối.']
    }),

    manCheHangCu(7, 'cung-co', {
      ten: 'Chế hàm: Lọc nốt trùng và đi theo vang',
      taoHam: ['unique_echo_step'],
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'play_note'],
      deBai: 'Dọc hành lang có các chuông đá phát nốt nhạc, nhưng điệu nhạc chỉ nhận mỗi nốt một lần (không trùng). Hãy viết hàm unique_echo_step(s): đọc n = listen(), nếu n not in s thì s.add(n) và play_note(n), cuối cùng luôn gọi go_echo() để tiến tới chuông tiếp theo.',
      veMaMau: 'Hàm unique_echo_step(s) chưa lọc nốt trùng bằng tập hợp s.',
      san: ['#########', '#.I.I.IF#', '#########'],
      batDau: { x: 1, y: 1, huong: 1 },
      chuongDa: [
        { x: 3, y: 1, not: 3 },
        { x: 5, y: 1, not: 6 },
        { x: 7, y: 1, not: 6 }
      ],
      dieu: '3....6..',
      dieuToiCo: true,
      maMau: bai(['s = set()', 'for i in range(3):', '    unique_echo_step(s)'], [], [ham('unique_echo_step', ['n = listen()', 'play_note(n)', 'go_echo()'], ['s'])]),
      loiGiai: bai(['s = set()', 'for i in range(3):', '    unique_echo_step(s)'], [], [ham('unique_echo_step', ['n = listen()', 'if n not in s:', '    s.add(n)', '    play_note(n)', 'go_echo()'], ['s'])]),
      loiSai: [
        { moTa: 'Không kiểm tra if n not in s: phát lặp lại nốt 3 làm sai điệu', baiLam: bai(['s = set()', 'for i in range(3):', '    unique_echo_step(s)'], [], [ham('unique_echo_step', ['n = listen()', 'play_note(n)', 'go_echo()'], ['s'])]), phaiCoMa: ['lech-nhip'] }
      ],
      sao: { o: 16, nhip: 8 },
      goiY: ['Trong unique_echo_step(s), bọc s.add(n) và play_note(n) bên trong khối if n not in s:.', 'Lệnh go_echo() đặt ngoài if để bước nào R1 cũng tiến.']
    }),

    manCheHangCu(8, 'van-dung', {
      ten: 'Lọc điệu nhạc qua cổng hai sân',
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'play_note', 'unique_echo_step'],
      deBai: 'Ở 2 sân, 3 chuông đá nằm dọc hành lang có cổng nhịp C. Dùng vòng for 3 lần gọi unique_echo_step(s) để vừa đi qua cổng C vừa phát đúng các nốt không trùng của điệu.',
      veMaMau: 'Mã mẫu chỉ lặp 2 lần nên chưa phát đủ điệu nhạc.',
      san: [
        ['#########', '#.I.CI.F#', '#########'],
        ['##########', '#.II.CI.F#', '##########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 2 }, { x: 5, y: 1, not: 5 }, { x: 7, y: 1, not: 5 }],
        [{ x: 4, y: 1, not: 4 }, { x: 6, y: 1, not: 7 }, { x: 8, y: 1, not: 7 }]
      ],
      cuaNhip: [
        [{ x: 4, y: 1, mo: 20, dong: 1, pha: 20 }],
        [{ x: 5, y: 1, mo: 20, dong: 1, pha: 20 }]
      ],
      dieu: ['2....5..', '4.....7..'],
      dieuToiCo: true,
      maMau: bai(['s = set()', 'for i in range(2):', '    unique_echo_step(s)']),
      loiGiai: bai(['s = set()', 'for i in range(3):', '    unique_echo_step(s)']),
      loiSai: [
        { moTa: 'Chỉ lặp range(2): chưa tới chuông thứ 3, thiếu nốt ở sân 1', baiLam: bai(['s = set()', 'for i in range(2):', '    unique_echo_step(s)']), phaiCoMa: ['chua-du-dieu'], cung: true }
      ],
      sao: { o: 16, nhip: 17 },
      goiY: ['Có 3 trạm chuông đá trên hành lang.', 'Đổi range(2) thành range(3).']
    }),

    manCheHangCu(9, 'van-dung', {
      ten: 'Phối hợp trượt gai và cổng từ điển',
      hamCuaEmCan: ['move', 'forward', 'crack_switch', 'dict_gate'],
      deBai: 'Đầu tiên dùng crack_switch() để phá đá chuông và trượt hết dải đá ướt rẽ phải, sau đó dùng dict_gate(d) với d = {2: 3, 5: 4} để phá đá chuông thứ hai và vượt qua cổng C tới cờ.',
      veMaMau: 'Mã mẫu thiếu dict_gate(d) ở nhánh thứ hai.',
      san: ['######', '#.III#', '####I#', '####.#', '####C#', '####F#', '######'],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [
        { x: 2, y: 1, not: 3, ben: 1 },
        { x: 4, y: 2, not: 5, ben: 1 }
      ],
      cuaNhip: [{ x: 4, y: 4, mo: 20, dong: 1, pha: 20 }],
      maMau: bai(['d = {2: 3, 5: 4}', 'crack_switch()']),
      loiGiai: bai(['d = {2: 3, 5: 4}', 'crack_switch()', 'dict_gate(d)']),
      loiSai: [
        { moTa: 'Quên gọi dict_gate(d): dừng trước đá chuông ở (4, 2)', baiLam: bai(['d = {2: 3, 5: 4}', 'crack_switch()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 21, nhip: 8 },
      goiY: ['Sau crack_switch(), R1 đứng ở (4, 1) quay xuống, đối diện đá chuông nốt 5.', 'Gọi dict_gate(d) để phá đá và tiến 4 ô tới cờ F.']
    }),

    manCheHangCu(10, 'trum', {
      ten: 'Trùm Chế lệnh Hang cũ: Đại sảnh đá vôi',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'crack_switch', 'dict_gate', 'unique_echo_step'],
      deBai: 'Bài trùm 3 sân! Mỗi sân bắt đầu bằng crack_switch() để phá đá chuông và trượt qua dải đá ướt rẽ phải, tiếp theo dùng dict_gate(d) với d = {4: 4, 5: 5} để vượt cổng C, rồi rẽ phải và lặp 2 lần unique_echo_step(s) để phát điệu nhạc không trùng.',
      veMaMau: 'Hoàn thiện chương trình kết hợp crack_switch, dict_gate và unique_echo_step.',
      san: [
        ['#######', '#.III##', '####I##', '####.##', '####C##', '#F.I.##', '#######'],
        ['########', '#.IIII##', '#####I##', '#####.##', '#####C##', '#.F.I.##', '########'],
        ['#######', '#.III##', '####I##', '####I##', '####.##', '####C##', '#F.I.##', '#######']
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      daChuong: [
        [{ x: 2, y: 1, not: 4, ben: 1 }, { x: 4, y: 2, not: 4, ben: 1 }],
        [{ x: 2, y: 1, not: 6, ben: 1 }, { x: 5, y: 2, not: 4, ben: 1 }],
        [{ x: 2, y: 1, not: 3, ben: 1 }, { x: 4, y: 2, not: 5, ben: 1 }]
      ],
      chuongDa: [
        [{ x: 3, y: 5, not: 3 }, { x: 1, y: 5, not: 7 }],
        [{ x: 4, y: 5, not: 2 }, { x: 2, y: 5, not: 2 }],
        [{ x: 3, y: 6, not: 6 }, { x: 1, y: 6, not: 4 }]
      ],
      cuaNhip: [
        [{ x: 4, y: 4, mo: 30, dong: 1, pha: 30 }],
        [{ x: 5, y: 4, mo: 30, dong: 1, pha: 30 }],
        [{ x: 4, y: 5, mo: 30, dong: 1, pha: 30 }]
      ],
      maMau: bai(['d = {4: 4, 5: 5}', 's = set()', 'crack_switch()', 'dict_gate(d)', 'turn_right()']),
      loiGiai: bai(['d = {4: 4, 5: 5}', 's = set()', 'crack_switch()', 'dict_gate(d)', 'turn_right()', 'for i in range(2):', '    unique_echo_step(s)']),
      loiSai: [
        { moTa: 'Thiếu vòng for gọi unique_echo_step(s): chưa tiến tới cờ ở đáy hang', baiLam: bai(['d = {4: 4, 5: 5}', 's = set()', 'crack_switch()', 'dict_gate(d)', 'turn_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Phát cứng play_note(4) và forward(4) thay vì dict_gate(d): ở sân 3 không phá được đá chuông nốt 5', baiLam: bai(['d = {4: 4, 5: 5}', 's = set()', 'crack_switch()', 'play_note(4)', 'forward(4)', 'turn_right()', 'for i in range(2):', '    unique_echo_step(s)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'], cung: true }
      ],
      sao: { o: 31, nhip: 40 },
      goiY: ['Xem kỹ nốt của đá chuông thứ hai ở 3 sân: sân 1 và 2 có nốt 4 (cần tiến 4 bước), sân 3 có nốt 5 (cần tiến 5 bước).', 'Sau turn_right(), thêm vòng for i in range(2): gọi unique_echo_step(s).']
    })
  ];

  M.manHangCu = DS;
})();

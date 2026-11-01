/* ============================================================================
   man-trum-mua-hang.js - Mùa 8 Hang động đá vôi: GÓI 10 "Robot thám hiểm hang động R1" (20 màn)
     Chương 1: tong-hop-hang (10 màn: tổng hợp 7 bộ phận hang động + dict + set, mọi màn 2-3 sân)
     Chương 2: trum-mua-hang (10 màn: thử thách trùm cuối mùa 8, mọi màn 2-3 sân)

   Luật R1 gói 10:
     - Chỉ 1 robot R1 đầy đủ toàn bộ nâng cấp Mùa 8:
       + Thân: 'gai' (loaiRobot: 'gai', thuGai: true)
       + Tay: 'loa' (phatNot: true, beat, note)
       + Cảm biến: 'am-thanh' (phanAm: true, hear, listen)
     - Mọi màn 1..9 có 2 sân, màn 10 (hang: 'trum') có 3 sân, nhipTheo: 'tong'.
     - Mọi màn (trừ chiChay) đều có ít nhất 1 loiSai đánh dấu cung: true.
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
  var HAM_GOC_TRUM_HANG = [
    'left_move', 'right_move', 'left_back', 'right_back', 'wait',
    'retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen'
  ];

  function manGaiTrum(chuong, so, hang, d) {
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
      hamGoc: HAM_GOC_TRUM_HANG,
      mucTieu: d.dieu ? 'choi-dieu' : 'toi-co',
      nhipTheo: 'tong',
      nhipToiDa: d.nhipToiDa || (d.sao && d.sao.nhip ? d.sao.nhip + 16 : 50),
      loiSai: []
    }, d);
  }

  function manTH(so, hang, d) { return manGaiTrum('tong-hop-hang', so, hang, d); }
  function manTrum(so, hang, d) { return manGaiTrum('trum-mua-hang', so, hang, d); }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: tong-hop-hang - Tổng hợp hang động (10 màn, 2-3 sân)
       ====================================================================== */
    manTH(1, 'lam-quen', {
      ten: 'R1 thám hiểm hang sâu toàn diện',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'glide_step', 'play_note', 'crack_switch'],
      deBai: 'R1 nay đã hoàn thiện toàn bộ trang bị thám hiểm hang động đá vôi: bánh gai có thu gai, loa phát nốt ngân nhịp và cảm biến âm thanh thẩm âm. Bấm Chạy để xem R1 dùng crack_switch() và go_echo() vượt qua cả 2 sân.',
      veMaMau: 'R1 tự nghe nốt phá đá chuông, thu gai trượt qua dải đá ướt rẽ phải, rồi đi theo tiếng vang về cờ.',
      san: [
        ['######', '#.III#', '####I#', '####F#', '######'],
        ['#######', '#.IIII#', '#####I#', '#####.#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [{ x: 2, y: 1, not: 3, ben: 1 }],
        [{ x: 2, y: 1, not: 6, ben: 1 }]
      ],
      chuongDa: [
        [{ x: 4, y: 3, not: 2 }],
        [{ x: 5, y: 4, not: 5 }]
      ],
      maMau: bai(['crack_switch()', 'go_echo()']),
      loiGiai: bai(['crack_switch()', 'go_echo()']),
      sao: { o: 18, nhip: 11 },
      goiY: ['Bấm nút Chạy để xem R1 vận hành toàn bộ bộ phận Mùa 8 trên 2 sân.', 'Màn 1 chỉ cần chạy thử, chưa cần sửa mã.']
    }),

    manTH(2, 'lam-quen', {
      ten: 'Ngân nốt phá đá dày và nghe vang',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'glide_step', 'crack_glide', 'auto_crack_glide'],
      deBai: 'Ở cả 2 sân, khối đá chuông đầu dốc dày 2 lớp (ben = 2). Hãy dùng auto_crack_glide(2) để tự đọc tần số, ngân 2 nhịp phá đá và trượt rẽ phải, sau đó gọi go_echo() tiến tới cờ.',
      veMaMau: 'Mã mẫu dùng số bước cứng forward(2) ở nhánh hai nên chưa tới cờ ở sân 2.',
      san: [
        ['######', '#.III#', '####I#', '####F#', '######'],
        ['#######', '#.IIII#', '#####I#', '#####I#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [{ x: 2, y: 1, not: 4, ben: 2 }],
        [{ x: 2, y: 1, not: 7, ben: 2 }]
      ],
      chuongDa: [
        [{ x: 4, y: 3, not: 1 }],
        [{ x: 5, y: 4, not: 3 }]
      ],
      maMau: bai(['auto_crack_glide(2)', 'forward(2)']),
      loiGiai: bai(['auto_crack_glide(2)', 'go_echo()']),
      loiSai: [
        { moTa: 'Để nguyên forward(2): ở sân 2 dừng trước cờ F', baiLam: bai(['auto_crack_glide(2)', 'forward(2)']), phaiCoMa: ['chua-toi-co'], cung: true }
      ],
      sao: { o: 18, nhip: 13 },
      goiY: ['Nhánh dọc có chuông đá đặt tại cờ F.', 'Đổi forward(2) thành go_echo().']
    }),

    manTH(3, 'lam-quen', {
      ten: 'Ngách hang ngầm và đá chuông hai sân',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'echo_tunnel_turn', 'play_note'],
      deBai: 'Ở 2 sân, R1 dùng echo_tunnel_turn() để đi theo vang vào ngách hang ngầm, tiến tiếp tới chuông đá bên kia và rẽ phải. Sau đó gọi play_note(listen()) phá khối đá chuông trước mặt rồi gọi go_echo() tiến tới cờ.',
      veMaMau: 'Mã mẫu dùng forward(2) cứng ở cuối nên chưa tới cờ ở sân 2.',
      san: [
        ['#######', '#.I#I.#', '#####I#', '#####F#', '#######'],
        ['########', '#.II#I.#', '######I#', '######.#', '######F#', '########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      ngachHang: [
        [{ a: { x: 2, y: 1 }, b: { x: 4, y: 1 } }],
        [{ a: { x: 3, y: 1 }, b: { x: 5, y: 1 } }]
      ],
      chuongDa: [
        [{ x: 2, y: 1, not: 1 }, { x: 5, y: 1, not: 4 }, { x: 5, y: 3, not: 4 }],
        [{ x: 3, y: 1, not: 1 }, { x: 6, y: 1, not: 6 }, { x: 6, y: 4, not: 6 }]
      ],
      daChuong: [
        [{ x: 5, y: 2, not: 4, ben: 1 }],
        [{ x: 6, y: 2, not: 6, ben: 1 }]
      ],
      maMau: bai(['echo_tunnel_turn()', 'play_note(listen())', 'forward(2)']),
      loiGiai: bai(['echo_tunnel_turn()', 'play_note(listen())', 'go_echo()']),
      loiSai: [
        { moTa: 'Để nguyên forward(2): ở sân 2 chưa tới cờ F', baiLam: bai(['echo_tunnel_turn()', 'play_note(listen())', 'forward(2)']), phaiCoMa: ['chua-toi-co'], cung: true }
      ],
      sao: { o: 16, nhip: 14 },
      goiY: ['Sau khi play_note(listen()) phá đá chuông, gọi go_echo() để tiến tới chuông đá đặt tại cờ F.', 'Đổi forward(2) thành go_echo().']
    }),

    manTH(4, 'lam-quen', {
      ten: 'Giải mã từ điển cộng hưởng hai sân',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'glide_step', 'crack_glide', 'decode_glide'],
      deBai: 'Ở 2 sân, chuông đá dưới chân R1 báo mã khóa (2 hoặc 4), còn khối đá chuông trước mặt cần tần số d[listen()] trong từ điển d = {2: 5, 4: 7}. Hãy gọi decode_glide(d, 1) rồi gọi go_echo() để về cờ.',
      veMaMau: 'Mã mẫu dùng crack_glide(5, 1) cứng nên không phá được đá ở sân 2.',
      san: [
        ['######', '#.III#', '####I#', '####F#', '######'],
        ['#######', '#.IIII#', '#####I#', '#####.#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 1, y: 1, not: 2 }, { x: 4, y: 3, not: 3 }],
        [{ x: 1, y: 1, not: 4 }, { x: 5, y: 4, not: 6 }]
      ],
      daChuong: [
        [{ x: 2, y: 1, not: 5, ben: 1 }],
        [{ x: 2, y: 1, not: 7, ben: 1 }]
      ],
      maMau: bai(['d = {2: 5, 4: 7}', 'crack_glide(5, 1)', 'go_echo()']),
      loiGiai: bai(['d = {2: 5, 4: 7}', 'decode_glide(d, 1)', 'go_echo()']),
      loiSai: [
        { moTa: 'Dùng crack_glide(5, 1) cứng: ở sân 2 khối đá cần nốt 7 nên không vỡ', baiLam: bai(['d = {2: 5, 4: 7}', 'crack_glide(5, 1)', 'go_echo()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'], cung: true }
      ],
      sao: { o: 19, nhip: 11 },
      goiY: ['Hàm decode_glide(d, 1) tự tra d[listen()] để lấy tần số phá đá.', 'Đổi crack_glide(5, 1) thành decode_glide(d, 1).']
    }),

    manTH(5, 'cung-co', {
      ten: 'Chế hàm: Đi theo vang phá đá rồi tiến',
      taoHam: ['echo_crack_step'],
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'play_note'],
      deBai: 'Trong hang sâu, nhiều trạm có chuông đá đặt ngay trước khối đá chuông. Hãy viết hàm echo_crack_step(): gọi go_echo() để tiến tới chuông đá, gọi play_note(listen()) để phá khối đá chuông sát trước mặt, rồi gọi move() bước vào ô đá vừa phá. Sau đó rẽ phải và tiến 2 bước tới cờ.',
      veMaMau: 'Hàm echo_crack_step() đang để trống thân hàm.',
      san: [
        ['######', '#.I.I#', '####I#', '####F#', '######'],
        ['#######', '#.II.I#', '#####I#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 3 }],
        [{ x: 4, y: 1, not: 5 }]
      ],
      daChuong: [
        [{ x: 4, y: 1, not: 3, ben: 1 }],
        [{ x: 5, y: 1, not: 5, ben: 1 }]
      ],
      maMau: bai(['echo_crack_step()', 'turn_right()', 'forward(2)'], [], [ham('echo_crack_step', [])]),
      loiGiai: bai(['echo_crack_step()', 'turn_right()', 'forward(2)'], [], [ham('echo_crack_step', ['go_echo()', 'play_note(listen())', 'move()'])]),
      loiSai: [
        { moTa: 'Để trống echo_crack_step(): R1 đứng yên', baiLam: bai(['echo_crack_step()', 'turn_right()', 'forward(2)'], [], [ham('echo_crack_step', [])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Dùng forward(2) thay vì go_echo() trong echo_crack_step(): ở sân 2 chưa tới đá chuông đã phát nốt', baiLam: bai(['echo_crack_step()', 'turn_right()', 'forward(2)'], [], [ham('echo_crack_step', ['forward(2)', 'play_note(listen())', 'move()'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'], cung: true }
      ],
      sao: { o: 16, nhip: 15 },
      goiY: ['Trong echo_crack_step(), viết 3 dòng: go_echo(), play_note(listen()), move().', 'Chương trình chính đã gọi sẵn echo_crack_step(), turn_right(), forward(2).']
    }),

    manTH(6, 'cung-co', {
      ten: 'Lọc danh sách nốt nhạc bằng tập hợp',
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'play_note', 'march_note', 'unique_notes', 'echo_crack_step'],
      deBai: 'Ở 2 sân, đầu tiên gọi echo_crack_step() để vượt qua khối đá chuông đầu hành lang. Sau đó gọi unique_notes(a) với a = [4, 4, 7, 4] để lọc bỏ nốt trùng, vừa tiến 2 bước tới cờ vừa phát nốt 4 phá khối đá chuông thứ hai.',
      veMaMau: 'Mã mẫu thiếu unique_notes(a) nên chưa tiến qua khối đá chuông thứ hai tới cờ.',
      san: [
        ['########', '#.I.IIF#', '########'],
        ['#########', '#.II.IIF#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 2 }],
        [{ x: 4, y: 1, not: 5 }]
      ],
      daChuong: [
        [{ x: 4, y: 1, not: 2, ben: 1 }, { x: 6, y: 1, not: 4, ben: 1 }],
        [{ x: 5, y: 1, not: 5, ben: 1 }, { x: 7, y: 1, not: 4, ben: 1 }]
      ],
      maMau: bai(['a = [4, 4, 7, 4]', 'echo_crack_step()']),
      loiGiai: bai(['a = [4, 4, 7, 4]', 'echo_crack_step()', 'unique_notes(a)']),
      loiSai: [
        { moTa: 'Thiếu unique_notes(a): dừng ở giữa hành lang, chưa tới cờ', baiLam: bai(['a = [4, 4, 7, 4]', 'echo_crack_step()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng forward(2) cứng thay vì echo_crack_step(): ở sân 2 đâm vào đá chuông', baiLam: bai(['a = [4, 4, 7, 4]', 'forward(2)', 'play_note(2)', 'move()', 'unique_notes(a)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'], cung: true }
      ],
      sao: { o: 23, nhip: 13 },
      goiY: ['Hàm unique_notes(a) dùng tập hợp set() để chỉ gọi march_note(x) cho mỗi nốt một lần (4 và 7).', 'Thêm dòng unique_notes(a) vào cuối chương trình.']
    }),

    manTH(7, 'cung-co', {
      ten: 'Chế hàm: Đi theo vang, phá đá và trượt rẽ',
      taoHam: ['tunnel_crack_glide'],
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'glide_step', 'play_note', 'crack_switch'],
      deBai: 'Hãy viết hàm tunnel_crack_glide(): gọi go_echo() để tiến tới chuông đá trước dải đá ướt, rồi gọi crack_switch() để phá khối đá chuông, thu gai trượt hết dải đá ướt và rẽ phải. Gọi tunnel_crack_glide() rồi go_echo() để về cờ.',
      veMaMau: 'Hàm tunnel_crack_glide() đang để trống thân hàm.',
      san: [
        ['########', '#.I.III#', '######I#', '######F#', '########'],
        ['#########', '#.II.III#', '#######I#', '#######.#', '#######F#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 4 }, { x: 6, y: 3, not: 2 }],
        [{ x: 4, y: 1, not: 7 }, { x: 7, y: 4, not: 5 }]
      ],
      daChuong: [
        [{ x: 4, y: 1, not: 4, ben: 1 }],
        [{ x: 5, y: 1, not: 7, ben: 1 }]
      ],
      maMau: bai(['tunnel_crack_glide()', 'go_echo()'], [], [ham('tunnel_crack_glide', [])]),
      loiGiai: bai(['tunnel_crack_glide()', 'go_echo()'], [], [ham('tunnel_crack_glide', ['go_echo()', 'crack_switch()'])]),
      loiSai: [
        { moTa: 'Để trống tunnel_crack_glide(): R1 không di chuyển tới dải đá ướt', baiLam: bai(['tunnel_crack_glide()', 'go_echo()'], [], [ham('tunnel_crack_glide', [])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Dùng forward(2) thay vì go_echo() trong tunnel_crack_glide(): ở sân 2 đâm vào đá chuông', baiLam: bai(['tunnel_crack_glide()', 'go_echo()'], [], [ham('tunnel_crack_glide', ['forward(2)', 'crack_switch()'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'], cung: true }
      ],
      sao: { o: 20, nhip: 16 },
      goiY: ['Trong tunnel_crack_glide(), viết 2 dòng: go_echo() và crack_switch().', 'Chương trình chính đã gọi sẵn tunnel_crack_glide() và go_echo().']
    }),

    manTH(8, 'van-dung', {
      ten: 'Quét tập hợp nốt và tiến theo số lượng',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'scan_unique_notes', 'crack_switch'],
      deBai: 'Ở 2 sân, đầu tiên gọi crack_switch() để phá đá chuông và trượt rẽ xuống nhánh dọc. Tại nhánh dọc có 3 chuông đá: hãy gọi n = scan_unique_notes(3) để đi qua 3 chuông đá và đếm số nốt khác nhau, rồi gọi forward(n) để tiến đúng tới cờ.',
      veMaMau: 'Mã mẫu đi cứng forward(2) ở cuối nên chưa tới cờ ở sân 2.',
      san: [
        ['######', '#.III#', '####I#', '####I#', '####I#', '####.#', '####F#', '######'],
        ['#######', '#.IIII#', '#####I#', '#####I#', '#####I#', '#####.#', '#####.#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [{ x: 2, y: 1, not: 3, ben: 1 }],
        [{ x: 2, y: 1, not: 6, ben: 1 }]
      ],
      chuongDa: [
        [{ x: 4, y: 1, not: 2 }, { x: 4, y: 2, not: 2 }, { x: 4, y: 3, not: 5 }],
        [{ x: 5, y: 1, not: 3 }, { x: 5, y: 2, not: 5 }, { x: 5, y: 3, not: 7 }]
      ],
      maMau: bai(['crack_switch()', 'n = scan_unique_notes(3)', 'forward(2)']),
      loiGiai: bai(['crack_switch()', 'n = scan_unique_notes(3)', 'forward(n)']),
      loiSai: [
        { moTa: 'Để nguyên forward(2): ở sân 2 có 3 nốt khác nhau nên thiếu 1 bước tới cờ', baiLam: bai(['crack_switch()', 'n = scan_unique_notes(3)', 'forward(2)']), phaiCoMa: ['chua-toi-co'], cung: true }
      ],
      sao: { o: 23, nhip: 17 },
      goiY: ['Ở sân 1 có 2 nốt khác nhau (2, 5) nên n = 2; ở sân 2 có 3 nốt khác nhau (3, 5, 7) nên n = 3.', 'Đổi forward(2) thành forward(n).']
    }),

    manTH(9, 'van-dung', {
      ten: 'Ngách hang từ điển kết hợp trượt gai',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'tunnel_dict_step', 'crack_switch'],
      deBai: 'Ở 2 sân, dùng tunnel_dict_step(d) với d = {1: 2, 2: 3} để nghe tiếng vang k, chui qua ngách hang ngầm và tiến d[k] bước tới góc hành lang. Sau đó rẽ phải và gọi crack_switch() để phá đá chuông, trượt hết dải đá ướt về cờ.',
      veMaMau: 'Mã mẫu thiếu crack_switch() ở nhánh dọc.',
      san: [
        ['#######', '#.I#..#', '#####I#', '#####I#', '#####F#', '#######'],
        ['#########', '#.II#...#', '#######I#', '#######I#', '#######F#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      ngachHang: [
        [{ a: { x: 2, y: 1 }, b: { x: 3, y: 1 } }],
        [{ a: { x: 3, y: 1 }, b: { x: 4, y: 1 } }]
      ],
      chuongDa: [
        [{ x: 2, y: 1, not: 3 }],
        [{ x: 3, y: 1, not: 6 }]
      ],
      daChuong: [
        [{ x: 5, y: 2, not: 4, ben: 1 }],
        [{ x: 7, y: 2, not: 7, ben: 1 }]
      ],
      maMau: bai(['d = {1: 2, 2: 3}', 'tunnel_dict_step(d)', 'turn_right()']),
      loiGiai: bai(['d = {1: 2, 2: 3}', 'tunnel_dict_step(d)', 'turn_right()', 'crack_switch()']),
      loiSai: [
        { moTa: 'Thiếu crack_switch(): dừng ở đầu nhánh dọc', baiLam: bai(['d = {1: 2, 2: 3}', 'tunnel_dict_step(d)', 'turn_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi cứng forward(3) thay vì tunnel_dict_step(d): ở sân 2 rẽ phải sớm đâm tường', baiLam: bai(['d = {1: 2, 2: 3}', 'forward(3)', 'turn_right()', 'crack_switch()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'], cung: true }
      ],
      sao: { o: 23, nhip: 14 },
      goiY: ['Sau tunnel_dict_step(d) và turn_right(), R1 đứng ngay trước khối đá chuông đầu dốc đá ướt.', 'Thêm crack_switch() ở dòng cuối.']
    }),

    manTH(10, 'trum', {
      ten: 'Trùm Tổng hợp hang động: Ba tầng thạch nhũ',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'glide_step', 'play_note', 'crack_switch', 'tunnel_crack_glide', 'echo_crack_step'],
      deBai: 'Bài trùm 3 sân! Ở mỗi sân, R1 gọi tunnel_crack_glide() để tiến theo tiếng vang, phá đá chuông và trượt qua dải đá ướt rẽ phải xuống nhánh dọc. Tiếp theo gọi echo_crack_step() để tiến tới chuông đá thứ hai, phá khối đá chuông cuối cùng và bước vào cờ.',
      veMaMau: 'Hoàn thiện chương trình kết hợp tunnel_crack_glide và echo_crack_step.',
      san: [
        ['########', '#.I.II.#', '######.#', '######I#', '######F#', '########'],
        ['#########', '#.II.II.#', '#######.#', '#######I#', '#######F#', '#########'],
        ['#########', '#.I.III.#', '#######.#', '#######.#', '#######I#', '#######F#', '#########']
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      chuongDa: [
        [{ x: 3, y: 1, not: 3 }, { x: 6, y: 3, not: 5 }],
        [{ x: 4, y: 1, not: 6 }, { x: 7, y: 3, not: 4 }],
        [{ x: 3, y: 1, not: 2 }, { x: 7, y: 4, not: 7 }]
      ],
      daChuong: [
        [{ x: 4, y: 1, not: 3, ben: 1 }, { x: 6, y: 4, not: 5, ben: 1 }],
        [{ x: 5, y: 1, not: 6, ben: 1 }, { x: 7, y: 4, not: 4, ben: 1 }],
        [{ x: 4, y: 1, not: 2, ben: 1 }, { x: 7, y: 5, not: 7, ben: 1 }]
      ],
      maMau: bai(['tunnel_crack_glide()']),
      loiGiai: bai(['tunnel_crack_glide()', 'echo_crack_step()']),
      loiSai: [
        { moTa: 'Thiếu echo_crack_step() ở cuối: dừng ở đầu nhánh dọc', baiLam: bai(['tunnel_crack_glide()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng forward(2), play_note(5), move() thay vì echo_crack_step() ở cuối: hỏng ở sân 2, 3', baiLam: bai(['tunnel_crack_glide()', 'forward(2)', 'play_note(5)', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'], cung: true }
      ],
      sao: { o: 23, nhip: 29 },
      goiY: ['Sau tunnel_crack_glide(), phía trước R1 là chuông đá đặt ngay trước khối đá chuông tại cờ F.', 'Thêm dòng echo_crack_step() vào cuối chương trình.']
    }),

    /* ========================================================================
       CHƯƠNG 2: trum-mua-hang - Trùm mùa hang động (10 màn, 2-3 sân)
       ====================================================================== */
    manTrum(1, 'lam-quen', {
      ten: 'Chế hàm: Phá đá theo vang và rẽ góc',
      taoHam: ['master_echo_crack'],
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'play_note', 'echo_crack_step', 'crack_switch'],
      deBai: 'Trong tầng sâu nhất của hang đá vôi, mỗi góc cua đều bị khóa bởi một khối đá chuông đặt ngay sau chuông đá. Hãy viết hàm master_echo_crack(): gọi echo_crack_step() để tiến tới chuông đá, phá đá chuông và bước vào ô góc, rồi gọi turn_right().',
      veMaMau: 'Hàm master_echo_crack() đang để trống thân hàm.',
      san: [
        ['######', '#.I.I#', '####I#', '####F#', '######'],
        ['#######', '#.II.I#', '#####I#', '#####I#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 4 }],
        [{ x: 4, y: 1, not: 6 }]
      ],
      daChuong: [
        [{ x: 4, y: 1, not: 4, ben: 1 }, { x: 4, y: 2, not: 4, ben: 1 }],
        [{ x: 5, y: 1, not: 6, ben: 1 }, { x: 5, y: 2, not: 6, ben: 1 }]
      ],
      maMau: bai(['master_echo_crack()', 'crack_switch()'], [], [ham('master_echo_crack', [])]),
      loiGiai: bai(['master_echo_crack()', 'crack_switch()'], [], [ham('master_echo_crack', ['echo_crack_step()', 'turn_right()'])]),
      loiSai: [
        { moTa: 'Để trống master_echo_crack(): R1 không tới góc cua', baiLam: bai(['master_echo_crack()', 'crack_switch()'], [], [ham('master_echo_crack', [])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Viết forward(2) thay vì echo_crack_step() trong master_echo_crack(): hỏng ở sân 2', baiLam: bai(['master_echo_crack()', 'crack_switch()'], [], [ham('master_echo_crack', ['forward(2)', 'play_note(4)', 'move()', 'turn_right()'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'], cung: true }
      ],
      sao: { o: 23, nhip: 15 },
      goiY: ['Trong master_echo_crack(), viết 2 dòng: echo_crack_step() và turn_right().', 'Chương trình chính đã gọi sẵn master_echo_crack() và crack_switch().']
    }),

    manTrum(2, 'lam-quen', {
      ten: 'Hai khúc cua đá chuông liên tiếp',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'play_note', 'echo_crack_step', 'master_echo_crack', 'crack_switch'],
      deBai: 'Ở 2 sân, hành lang chữ U có góc đầu vượt bằng master_echo_crack(), nhánh dọc trượt qua đá ướt bằng crack_switch(), và nhánh đáy vượt bằng master_echo_crack() để phá khối đá chuông cuối cùng vào cờ.',
      veMaMau: 'Mã mẫu thiếu master_echo_crack() ở nhánh đáy.',
      san: [
        [
          '######',
          '#.I.I#',
          '####I#',
          '####I#',
          '#F.. .#'.replace(' ', ''),
          '######'
        ],
        ['#######', '#.II.I#', '#####I#', '#####I#', '#####I#', '#F....#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 3 }, { x: 2, y: 4, not: 7 }],
        [{ x: 4, y: 1, not: 2 }, { x: 2, y: 5, not: 4 }]
      ],
      daChuong: [
        [{ x: 4, y: 1, not: 3, ben: 1 }, { x: 4, y: 2, not: 3, ben: 1 }, { x: 1, y: 4, not: 7, ben: 1 }],
        [{ x: 5, y: 1, not: 2, ben: 1 }, { x: 5, y: 2, not: 2, ben: 1 }, { x: 1, y: 5, not: 4, ben: 1 }]
      ],
      maMau: bai(['master_echo_crack()', 'crack_switch()']),
      loiGiai: bai(['master_echo_crack()', 'crack_switch()', 'master_echo_crack()']),
      loiSai: [
        { moTa: 'Thiếu master_echo_crack() lần 2: dừng ở góc dưới phải', baiLam: bai(['master_echo_crack()', 'crack_switch()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi cứng forward(2), play_note(7), move() ở cuối: ở sân 2 dừng trước đá chuông', baiLam: bai(['master_echo_crack()', 'crack_switch()', 'forward(2)', 'play_note(7)', 'move()']), phaiCoMa: ['chua-toi-co'], cung: true }
      ],
      sao: { o: 24, nhip: 26 },
      goiY: ['Sau crack_switch(), R1 ở góc dưới phải quay sang trái hướng về chuông đá đáy hang.', 'Thêm dòng master_echo_crack() vào cuối chương trình.']
    }),

    manTrum(3, 'lam-quen', {
      ten: 'Chế hàm: Giải mã từ điển trượt và nghe vang',
      taoHam: ['dict_glide_echo'],
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'glide_step', 'crack_glide', 'decode_glide'],
      deBai: 'Hãy viết hàm dict_glide_echo(d): gọi decode_glide(d, 1) để tra từ điển d phá đá chuông và trượt hết dải đá ướt rẽ phải, rồi gọi go_echo() để tiến theo tiếng vang ở nhánh kế tiếp.',
      veMaMau: 'Hàm dict_glide_echo(d) đang để trống thân hàm.',
      san: [
        ['######', '#.III#', '####I#', '####F#', '######'],
        ['#######', '#.IIII#', '#####I#', '#####.#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 1, y: 1, not: 3 }, { x: 4, y: 3, not: 1 }],
        [{ x: 1, y: 1, not: 5 }, { x: 5, y: 4, not: 2 }]
      ],
      daChuong: [
        [{ x: 2, y: 1, not: 6, ben: 1 }],
        [{ x: 2, y: 1, not: 8, ben: 1 }]
      ],
      maMau: bai(['d = {3: 6, 5: 8}', 'dict_glide_echo(d)'], [], [ham('dict_glide_echo', [], ['d'])]),
      loiGiai: bai(['d = {3: 6, 5: 8}', 'dict_glide_echo(d)'], [], [ham('dict_glide_echo', ['decode_glide(d, 1)', 'go_echo()'], ['d'])]),
      loiSai: [
        { moTa: 'Để trống dict_glide_echo(d): R1 đứng yên', baiLam: bai(['d = {3: 6, 5: 8}', 'dict_glide_echo(d)'], [], [ham('dict_glide_echo', [], ['d'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Dùng forward(2) thay vì go_echo() trong dict_glide_echo(d): ở sân 2 chưa tới cờ', baiLam: bai(['d = {3: 6, 5: 8}', 'dict_glide_echo(d)'], [], [ham('dict_glide_echo', ['decode_glide(d, 1)', 'forward(2)'], ['d'])]), phaiCoMa: ['chua-toi-co'], cung: true }
      ],
      sao: { o: 20, nhip: 11 },
      goiY: ['Trong dict_glide_echo(d), viết 2 dòng: decode_glide(d, 1) và go_echo().', 'Chương trình chính đã khai báo d = {3: 6, 5: 8} và gọi dict_glide_echo(d).']
    }),

    manTrum(4, 'lam-quen', {
      ten: 'Chuỗi giải mã trượt gai hai nhánh',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'glide_step', 'crack_glide', 'decode_glide', 'dict_glide_echo'],
      deBai: 'Ở 2 sân, dùng dict_glide_echo(d) với d = {2: 4, 5: 7} để vượt nhánh ngang và tiến tới chuông đá giữa nhánh dọc, sau đó gọi tiếp decode_glide(d, 1) để phá khối đá chuông thứ hai và trượt về cờ.',
      veMaMau: 'Mã mẫu thiếu decode_glide(d, 1) ở đoạn cuối.',
      san: [
        ['######', '#.II.#', '####.#', '####I#', '####F#', '######'],
        ['#######', '#.III.#', '#####.#', '#####.#', '#####I#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 1, y: 1, not: 2 }, { x: 4, y: 2, not: 5 }],
        [{ x: 1, y: 1, not: 5 }, { x: 5, y: 3, not: 2 }]
      ],
      daChuong: [
        [{ x: 2, y: 1, not: 4, ben: 1 }, { x: 4, y: 3, not: 7, ben: 1 }],
        [{ x: 2, y: 1, not: 7, ben: 1 }, { x: 5, y: 4, not: 4, ben: 1 }]
      ],
      maMau: bai(['d = {2: 4, 5: 7}', 'dict_glide_echo(d)']),
      loiGiai: bai(['d = {2: 4, 5: 7}', 'dict_glide_echo(d)', 'decode_glide(d, 1)']),
      loiSai: [
        { moTa: 'Thiếu decode_glide(d, 1): dừng trước khối đá chuông thứ hai', baiLam: bai(['d = {2: 4, 5: 7}', 'dict_glide_echo(d)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi crack_glide(7, 1) cứng thay vì decode_glide(d, 1): ở sân 2 không phá được đá chuông nốt 4', baiLam: bai(['d = {2: 4, 5: 7}', 'dict_glide_echo(d)', 'crack_glide(7, 1)']), phaiCoMa: ['chua-toi-co'], cung: true }
      ],
      sao: { o: 21, nhip: 13 },
      goiY: ['Sau dict_glide_echo(d), R1 đang đứng trên chuông đá thứ hai và đối diện khối đá chuông cuối.', 'Thêm dòng decode_glide(d, 1) vào cuối chương trình.']
    }),

    manTrum(5, 'cung-co', {
      ten: 'Chế hàm: Hành quân lọc điệu nhạc bằng tập hợp',
      taoHam: ['unique_cave_march'],
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'play_note', 'unique_echo_step'],
      deBai: 'Hãy viết hàm unique_cave_march(n, s): dùng vòng lặp for i in range(n): gọi unique_echo_step(s) để đi qua n trạm chuông đá theo tiếng vang và chỉ phát mỗi nốt nhạc một lần không trùng.',
      veMaMau: 'Hàm unique_cave_march(n, s) đang để trống thân hàm.',
      san: [
        ['#########', '#.I.I.IF#', '#########'],
        ['##########', '#.II.I.IF#', '##########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 2 }, { x: 5, y: 1, not: 6 }, { x: 7, y: 1, not: 6 }],
        [{ x: 4, y: 1, not: 5 }, { x: 6, y: 1, not: 8 }, { x: 8, y: 1, not: 8 }]
      ],
      dieu: ['2....6..', '5.....8..'],
      dieuToiCo: true,
      maMau: bai(['s = set()', 'unique_cave_march(3, s)'], [], [ham('unique_cave_march', [], ['n', 's'])]),
      loiGiai: bai(['s = set()', 'unique_cave_march(3, s)'], [], [ham('unique_cave_march', ['for i in range(n):', '    unique_echo_step(s)'], ['n', 's'])]),
      loiSai: [
        { moTa: 'Để trống unique_cave_march(n, s): R1 đứng yên, chưa phát điệu nhạc', baiLam: bai(['s = set()', 'unique_cave_march(3, s)'], [], [ham('unique_cave_march', [], ['n', 's'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Không dùng unique_echo_step(s) mà phát cứng play_note(2), play_note(6): sai điệu ở sân 2', baiLam: bai(['s = set()', 'unique_cave_march(3, s)'], [], [ham('unique_cave_march', ['play_note(2)', 'play_note(6)'], ['n', 's'])]), phaiCoMa: ['lech-nhip', 'sai-not'], cung: true }
      ],
      sao: { o: 17, nhip: 17 },
      goiY: ['Trong unique_cave_march(n, s), viết vòng for i in range(n): và bên trong gọi unique_echo_step(s).', 'Chương trình chính đã khởi tạo s = set() và gọi unique_cave_march(3, s).']
    }),

    manTrum(6, 'cung-co', {
      ten: 'Trượt gai xuống đáy hang lọc chuông đá',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'play_note', 'crack_switch', 'unique_echo_step', 'unique_cave_march'],
      deBai: 'Ở 2 sân, đầu tiên gọi crack_switch() để phá đá chuông đầu dốc và trượt hết dải đá ướt rẽ phải. Sau đó khởi tạo s = set() và gọi unique_cave_march(3, s) để đi dọc qua 3 trạm chuông đá tới cờ.',
      veMaMau: 'Mã mẫu chỉ truyền 2 trạm vào unique_cave_march(2, s).',
      san: [
        ['######', '#.II.#', '####.#', '####.#', '####F#', '######'],
        ['#######', '#.III.#', '#####.#', '#####.#', '#####.#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [{ x: 2, y: 1, not: 4, ben: 1 }],
        [{ x: 2, y: 1, not: 7, ben: 1 }]
      ],
      chuongDa: [
        [{ x: 4, y: 2, not: 4 }, { x: 4, y: 3, not: 3 }, { x: 4, y: 4, not: 6 }],
        [{ x: 5, y: 3, not: 7 }, { x: 5, y: 4, not: 5 }, { x: 5, y: 5, not: 5 }]
      ],
      maMau: bai(['s = set()', 'crack_switch()', 'unique_cave_march(2, s)']),
      loiGiai: bai(['s = set()', 'crack_switch()', 'unique_cave_march(3, s)']),
      loiSai: [
        { moTa: 'Để nguyên unique_cave_march(2, s): dừng ở chuông đá thứ hai, chưa tới cờ', baiLam: bai(['s = set()', 'crack_switch()', 'unique_cave_march(2, s)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Phát cứng play_note(4) thay vì dùng crack_switch(): ở sân 2 không phá được đá chuông nốt 7', baiLam: bai(['s = set()', 'play_note(4)', 'glide_step()', 'unique_cave_march(3, s)']), phaiCoMa: ['chua-toi-co'], cung: true }
      ],
      sao: { o: 26, nhip: 17 },
      goiY: ['Nhánh dọc có 3 trạm chuông đá dẫn tới cờ F.', 'Đổi unique_cave_march(2, s) thành unique_cave_march(3, s).']
    }),

    manTrum(7, 'cung-co', {
      ten: 'Bàn xoay, trượt gai và tiếng vang hai sân',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'go_echo', 'play_note', 'spin_crack', 'tunnel_crack_glide'],
      deBai: 'Ở 2 sân, đầu tiên gọi spin_crack() để bước lên bàn xoay @, phá khối đá chuông nhánh dọc và bước qua. Tiếp theo gọi turn_left() để quay sang phải, gọi tunnel_crack_glide() vượt qua dải đá ướt rồi gọi go_echo() về cờ.',
      veMaMau: 'Mã mẫu thiếu go_echo() ở đoạn cuối.',
      san: [
        ['#########', '#.@######', '##I.III.#', '#######I#', '#######F#', '#########'],
        ['##########', '#.@#######', '##I.I.II.#', '########I#', '########.#', '########F#', '##########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [{ x: 2, y: 2, not: 3, ben: 1 }, { x: 5, y: 2, not: 6, ben: 1 }],
        [{ x: 2, y: 2, not: 5, ben: 1 }, { x: 6, y: 2, not: 2, ben: 1 }]
      ],
      chuongDa: [
        [{ x: 4, y: 2, not: 6 }, { x: 7, y: 4, not: 1 }],
        [{ x: 5, y: 2, not: 2 }, { x: 8, y: 5, not: 4 }]
      ],
      maMau: bai(['spin_crack()', 'turn_left()', 'tunnel_crack_glide()']),
      loiGiai: bai(['spin_crack()', 'turn_left()', 'tunnel_crack_glide()', 'go_echo()']),
      loiSai: [
        { moTa: 'Thiếu go_echo() ở cuối: dừng ở góc trên phải sau khi trượt', baiLam: bai(['spin_crack()', 'turn_left()', 'tunnel_crack_glide()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng forward(2) thay vì go_echo() ở cuối: ở sân 2 dừng trước cờ F', baiLam: bai(['spin_crack()', 'turn_left()', 'tunnel_crack_glide()', 'forward(2)']), phaiCoMa: ['chua-toi-co'], cung: true }
      ],
      sao: { o: 27, nhip: 24 },
      goiY: ['Sau tunnel_crack_glide(), R1 đã quay mặt xuống dưới hướng về chuông đá tại cờ F.', 'Thêm go_echo() ở dòng cuối.']
    }),

    manTrum(8, 'van-dung', {
      ten: 'Ngách hang, cổng từ điển và tiếng vang',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'play_note', 'belt_echo', 'dict_gate'],
      deBai: 'Ở 2 sân, đầu tiên gọi belt_echo() để chui qua ngách hang và tiến theo tiếng vang tới trước khối đá chuông. Tiếp theo gọi dict_gate(d) với d = {3: 3, 6: 4} để phá đá chuông và vượt qua cổng nhịp C tới góc cua, rồi rẽ phải và gọi go_echo() về cờ.',
      veMaMau: 'Mã mẫu dùng forward(3) thay vì dict_gate(d).',
      san: [
        ['#########', '#..#I.C.#', '#######I#', '#######F#', '#########'],
        ['##########', '#..#I.C..#', '########I#', '########.#', '########F#', '##########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      ngachHang: [
        [{ a: { x: 2, y: 1 }, b: { x: 4, y: 1 } }],
        [{ a: { x: 2, y: 1 }, b: { x: 4, y: 1 } }]
      ],
      chuongDa: [
        [{ x: 4, y: 1, not: 3 }, { x: 7, y: 3, not: 2 }],
        [{ x: 4, y: 1, not: 6 }, { x: 8, y: 4, not: 5 }]
      ],
      daChuong: [
        [{ x: 5, y: 1, not: 3, ben: 1 }],
        [{ x: 5, y: 1, not: 6, ben: 1 }]
      ],
      cuaNhip: [
        [{ x: 6, y: 1, mo: 30, dong: 1, pha: 30 }],
        [{ x: 6, y: 1, mo: 30, dong: 1, pha: 30 }]
      ],
      maMau: bai(['d = {3: 3, 6: 4}', 'belt_echo()', 'forward(3)', 'turn_right()', 'go_echo()']),
      loiGiai: bai(['d = {3: 3, 6: 4}', 'belt_echo()', 'dict_gate(d)', 'turn_right()', 'go_echo()']),
      loiSai: [
        { moTa: 'Để nguyên forward(3): đâm vào khối đá chuông ở (5, 1)', baiLam: bai(['d = {3: 3, 6: 4}', 'belt_echo()', 'forward(3)', 'turn_right()', 'go_echo()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Phát cứng play_note(3) và forward(3): ở sân 2 không phá được đá chuông nốt 6', baiLam: bai(['d = {3: 3, 6: 4}', 'belt_echo()', 'play_note(3)', 'forward(3)', 'turn_right()', 'go_echo()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'], cung: true }
      ],
      sao: { o: 20, nhip: 20 },
      goiY: ['Hàm dict_gate(d) tự đọc nốt k = listen(), phát nốt phá đá và tiến d[k] ô qua cổng C.', 'Đổi forward(3) thành dict_gate(d).']
    }),

    manTrum(9, 'van-dung', {
      ten: 'Tổng duyệt trước thềm Đại sảnh Trùm',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'play_note', 'master_echo_crack', 'dict_glide_echo'],
      deBai: 'Ở 2 sân, đầu tiên gọi master_echo_crack() để tiến theo vang, phá đá chuông ở góc thứ nhất và rẽ phải. Sau đó dùng dict_glide_echo(d) với d = {2: 5, 4: 7} để giải mã từ điển phá khối đá chuông thứ hai, trượt qua dải đá ướt rẽ phải và tiến theo vang về cờ.',
      veMaMau: 'Mã mẫu thiếu dict_glide_echo(d).',
      san: [
        ['#######', '#.I.I##', '####I##', '####I##', '#F.II##', '#######'],
        ['########', '#.II.I##', '#####I##', '#####I##', '#####I##', '#F..II##', '########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 3 }, { x: 4, y: 1, not: 2 }, { x: 1, y: 4, not: 6 }],
        [{ x: 4, y: 1, not: 6 }, { x: 5, y: 1, not: 4 }, { x: 1, y: 5, not: 3 }]
      ],
      daChuong: [
        [{ x: 4, y: 1, not: 3, ben: 1 }, { x: 4, y: 2, not: 5, ben: 1 }],
        [{ x: 5, y: 1, not: 6, ben: 1 }, { x: 5, y: 2, not: 7, ben: 1 }]
      ],
      maMau: bai(['d = {2: 5, 4: 7}', 'master_echo_crack()']),
      loiGiai: bai(['d = {2: 5, 4: 7}', 'master_echo_crack()', 'dict_glide_echo(d)']),
      loiSai: [
        { moTa: 'Thiếu dict_glide_echo(d): dừng ở góc (4, 1) sau khi rẽ phải', baiLam: bai(['d = {2: 5, 4: 7}', 'master_echo_crack()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng crack_glide(5, 1) và forward(3) thay vì dict_glide_echo(d): hỏng ở sân 2', baiLam: bai(['d = {2: 5, 4: 7}', 'master_echo_crack()', 'crack_glide(5, 1)', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'], cung: true }
      ],
      sao: { o: 28, nhip: 24 },
      goiY: ['Sau master_echo_crack(), R1 đứng trên chuông đá báo mã khóa (2 hoặc 4) và nhìn xuống dải đá ướt.', 'Thêm dòng dict_glide_echo(d) vào cuối chương trình.']
    }),

    manTrum(10, 'trum', {
      ten: 'Trùm Mùa 8: Bản giao hưởng Hang động Đá vôi',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'play_note', 'master_echo_crack', 'dict_glide_echo', 'echo_crack_step'],
      deBai: 'Thử thách Trùm cuối Mùa 8 trên 3 sân! Ở mỗi sân, hãy gọi master_echo_crack() để vượt góc cua đá chuông đầu tiên, tiếp theo gọi dict_glide_echo(d) với d = {2: 5, 4: 7} để giải mã từ điển trượt qua dải đá ướt và tiến tới chuông đá đáy hang, cuối cùng gọi echo_crack_step() để phá bức tường đá chuông cuối cùng và bước vào cờ chiến thắng!',
      veMaMau: 'Hoàn thiện bản giao hưởng cuối cùng của R1 trên 3 sân hang động đá vôi.',
      san: [
        ['########', '##.I.I##', '#####I##', '#####I##', '#F..II##', '########'],
        ['#########', '##.II.I##', '######I##', '######I##', '######I##', '#F...II##', '#########'],
        ['##########', '##.III.I##', '#######I##', '#######I##', '#######I##', '#F....II##', '##########']
      ],
      batDau: [
        { x: 2, y: 1, huong: 1 },
        { x: 2, y: 1, huong: 1 },
        { x: 2, y: 1, huong: 1 }
      ],
      chuongDa: [
        [{ x: 4, y: 1, not: 3 }, { x: 5, y: 1, not: 2 }, { x: 3, y: 4, not: 4 }, { x: 2, y: 4, not: 6 }],
        [{ x: 5, y: 1, not: 6 }, { x: 6, y: 1, not: 4 }, { x: 4, y: 5, not: 2 }, { x: 2, y: 5, not: 8 }],
        [{ x: 6, y: 1, not: 5 }, { x: 7, y: 1, not: 2 }, { x: 4, y: 5, not: 7 }, { x: 2, y: 5, not: 3 }]
      ],
      daChuong: [
        [{ x: 5, y: 1, not: 3, ben: 1 }, { x: 5, y: 2, not: 5, ben: 1 }, { x: 1, y: 4, not: 6, ben: 1 }],
        [{ x: 6, y: 1, not: 6, ben: 1 }, { x: 6, y: 2, not: 7, ben: 1 }, { x: 1, y: 5, not: 8, ben: 1 }],
        [{ x: 7, y: 1, not: 5, ben: 1 }, { x: 7, y: 2, not: 5, ben: 1 }, { x: 1, y: 5, not: 3, ben: 1 }]
      ],
      maMau: bai(['d = {2: 5, 4: 7}', 'master_echo_crack()', 'dict_glide_echo(d)']),
      loiGiai: bai(['d = {2: 5, 4: 7}', 'master_echo_crack()', 'dict_glide_echo(d)', 'echo_crack_step()']),
      loiSai: [
        { moTa: 'Thiếu echo_crack_step() ở cuối: dừng ở đáy hang trước khối đá chuông cuối cùng', baiLam: bai(['d = {2: 5, 4: 7}', 'master_echo_crack()', 'dict_glide_echo(d)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi cứng forward(1), play_note(6), move() ở đoạn cuối: chỉ qua được sân 1, dừng trước đá chuông ở sân 2, 3', baiLam: bai(['d = {2: 5, 4: 7}', 'master_echo_crack()', 'dict_glide_echo(d)', 'forward(1)', 'play_note(6)', 'move()']), phaiCoMa: ['chua-toi-co'], cung: true }
      ],
      sao: { o: 29, nhip: 45 },
      goiY: ['Sau dict_glide_echo(d), R1 đang hướng về chuông đá sát trước khối đá chuông tại cờ F.', 'Thêm echo_crack_step() ở dòng cuối để phá khối đá chuông cuối và bước vào cờ F.']
    })
  ];

  M.manTrumMuaHang = DS;
})();

/* ============================================================================
   man-m4-than.js — diem10code-python: MÙA 4 Nông trại, CỘT 1 "Thân drone" (Drone + Lưới phao + Camera: tay và cảm biến quen từ mùa 3). DẠY DANH SÁCH.
   Drone không có mũi: go_up / go_down / go_left / go_right, bay qua vật. Camera đọc Ô DƯỚI BỤNG: vật rồi tới màu sàn.
   Lưới bắt vật cách ĐÚNG 2 ô theo cast_net(d) ("front" là phía trên sân, "back" dưới, "left", "right"); vật đi theo đường bay, luôn sau drone 2 ô.
   8 hàng theo khuôn ManHoc.khuon (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['go_up', 'go_down', 'go_left', 'go_right', 'cast_net', 'drop_net', 'color'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than.slice() }; }
  function TRAI() { return [H('trai', ['n'], ['for i in range(n):', '    go_left()'])]; }
  function HAI_HAM() { return TRAI().concat([H('tha', [], ['drop_net()'])]); }
  var SAN_BAY = ['......F', '.......', '.......', '.......'], BD_BAY = { x: 0, y: 3, huong: 0 };
  var SAN_BAO = ['......o', '.D.....', '.......'], BD_BAO = { x: 4, y: 0, huong: 0 };
  function KEO(a) { return ['a = [' + a + ']', 'cast_net("right")', 'for n in a:', '    for i in range(n):', '        go_left()', '    go_down()', 'drop_net()']; }
  function HANG(s) { var r = s.replace(/./g, '.'); return [r, s, r]; }

  function man(so, m) {
    m.chuong = 'm4-c1-than';
    m.loaiRobot = 'drone'; m.robot = { than: 'drone', tay: 'day-keo', camBien: [{ ma: 'camera', o: 'tren' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.vaHoac = true;
    m.bienDem = true;
    m.khaiDoiSo = true;
    m.moXuong = true;
    m.vo = 'nong-trai';
    m.luoiBay = true;
    m.mucTieu = m.mucTieu || 'dua-vat';
    m.phienBanNoiDung = 1;                     // wait() không còn chốt lệnh: bản nháp cũ không dùng nữa
    ManHoc.khuon(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Đường bay trong danh sách',
      deBai: 'Bấm Chạy và xem. a = [2, 3, 1] là một danh sách: nhiều số trong một tên. Vòng for n in a lấy lần lượt từng số. Drone bay sang phải n ô rồi lên một ô.',
      san: SAN_BAY, batDau: BD_BAY, mucTieu: 'toi-co',
      sao: { o: 5, nhip: 9 },
      loiGiai: { chinh: ['a = [2, 3, 1]', 'for n in a:', '    for i in range(n):', '        go_right()', '    go_up()'] } }),

    man(2, { ten: 'Số nào tới lượt',
      deBai: 'Danh sách đã đổi. Đọc code, đoán rồi bấm Chạy.',
      san: SAN_BAY, batDau: BD_BAY, mucTieu: 'toi-co',
      duDoan: { hoi: 'Vòng lặp lần thứ hai, n bằng mấy?', luaChon: ['1', '3', '2'], dung: 1, xacMinh: { x: 6, y: 0, lenh: { go_right: 6 } } },
      sao: { o: 5, nhip: 9 },
      loiGiai: { chinh: ['a = [1, 3, 2]', 'for n in a:', '    for i in range(n):', '        go_right()', '    go_up()'] } }),

    man(3, { ten: 'Tung lưới',
      deBai: 'Bao hạt nằm cách drone 2 ô bên phải: lưới bắt đúng ở khoảng đó. Vật đi theo đường bay, luôn sau drone 2 ô. Code thiếu dòng tung lưới, điền vào.',
      san: SAN_BAO, batDau: BD_BAO,
      maMau: { chinh: KEO('2, 2').map(function (d) { return d === 'cast_net("right")' ? '' : d; }) },
      goiY: ['cast_net("right") tung lưới sang phải, mất 2 nhịp.'],
      sao: { o: 7, nhip: 9 },
      loiGiai: { chinh: KEO('2, 2') } }),

    man(4, { ten: 'Bắt trước, bay sau',
      deBai: 'Đủ dòng nhưng sai thứ tự: drone bay đi rồi mới tung lưới nên bao hạt đã ngoài tầm. Giữ một dòng rồi kéo sang chỗ đúng.',
      san: SAN_BAO, batDau: BD_BAO,
      maMau: { chinh: ['a = [1, 3]', 'for n in a:', '    for i in range(n):', '        go_left()', '    go_down()', 'cast_net("right")', 'drop_net()'] },
      goiY: ['Lưới chỉ bắt vật cách đúng 2 ô: phải tung khi drone còn ở chỗ xuất phát.'],
      sao: { o: 7, nhip: 9 },
      loiGiai: { chinh: KEO('1, 3') } }),

    man(5, { ten: 'Sai một số',
      deBai: 'Code này sai đúng 1 chỗ: một số trong danh sách ngắn quá nên bao hạt dừng lệch đích. Bấm Chạy xem lỗi, rồi sửa.',
      san: SAN_BAO, batDau: BD_BAO,
      maMau: { chinh: KEO('1, 2') },
      goiY: ['Từ chỗ xuất phát tới mép trái là 4 ô, hai số cộng lại phải bằng 4.'],
      sao: { o: 7, nhip: 9 },
      loiGiai: { chinh: KEO('3, 1') } }),

    man(6, { ten: 'Số thứ mấy',
      deBai: 'Màn trống, em tự viết. Hai sân, drone đang đứng trên bao hạt. Lùi 2 ô để bao vào tầm lưới, tung lưới, rồi bay tiếp: bao đỏ a[0] ô, bao xanh dương a[1] ô, với a = [5, 3]. a[0] là số đầu tiên. Hàm trai(n) và tha() có sẵn.',
      san: [HANG('...D.D..o'), HANG('...D.D..o')],
      mau: [HANG('...r.b...'), HANG('...r.b...')],
      vatMau: [HANG('........r'), HANG('........b')],
      batDau: [{ x: 8, y: 1, huong: 0 }, { x: 8, y: 1, huong: 0 }],
      canList: true,
      goiY: ['Đọc c = color() khi còn đứng trên bao, rồi trai(2).', 'Sau khi tung lưới: if c == "red": trai(a[0]), còn lại trai(a[1]), cuối cùng tha().'],
      sao: { o: 12, nhip: 10 },
      loiGiai: { chinh: ['a = [5, 3]', 'c = color()', 'trai(2)', 'cast_net("right")', 'if c == "red":', '    trai(a[0])', 'else:', '    trai(a[1])', 'tha()'], hamCuaMan: HAI_HAM() } }),

    man(7, { ten: 'Hàm nhận danh sách',
      deBai: 'Bay bậc thang tới cờ. Tự viết hàm tên tùy em nhận một danh sách, ví dụ bay(a): với mỗi n trong a, bay phải n ô rồi xuống một ô. Khi đặt tên hàm, thêm một đối số. Chương trình gọi hàm hai lần với hai danh sách.',
      san: ['........', '........', '........', '........', '.......F'],
      batDau: { x: 0, y: 0, huong: 0 }, mucTieu: 'toi-co',
      canThamSo: true,
      goiY: ['Trong hàm: for n in a:, trong đó for i in range(n): go_right(), rồi go_down().', 'Chương trình chính: bay([2, 1]) rồi bay([1, 3]).'],
      sao: { o: 6, nhip: 11 },
      loiGiai: { chinh: ['bay([2, 1])', 'bay([1, 3])'], hamCuaEmMoi: [H('bay', ['a'], ['for n in a:', '    for i in range(n):', '        go_right()', '    go_down()'])] } }),

    man(8, { ten: 'Ba bao ba màu',
      deBai: 'Ba sân, drone đứng trên bao hạt, ba màu. Lùi 2 ô, tung lưới, rồi bay tiếp: bao đỏ 6 ô, xanh dương 4 ô, vàng 2 ô. Đưa bao về đúng ô cùng màu.',
      san: [HANG('...D.D.D.o'), HANG('...D.D.D.o'), HANG('...D.D.D.o')],
      mau: [HANG('...r.b.y..'), HANG('...r.b.y..'), HANG('...r.b.y..')],
      vatMau: [HANG('.........r'), HANG('.........y'), HANG('.........b')],
      batDau: [{ x: 9, y: 1, huong: 0 }, { x: 9, y: 1, huong: 0 }, { x: 9, y: 1, huong: 0 }],
      canList: true,
      sao: { o: 14, nhip: 11 },
      loiGiai: {
        chinh: ['a = [6, 4, 2]', 'c = color()', 'if c == "red":', '    thu(a[0])', 'elif c == "blue":', '    thu(a[1])', 'else:', '    thu(a[2])'],
        hamCuaEmMoi: [H('thu', ['n'], ['for i in range(2):', '    go_left()', 'cast_net("right")', 'for i in range(n):', '    go_left()', 'drop_net()'])]
      },
      huyHieu: { ma: 'duong-bay', ten: 'Đường bay' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();

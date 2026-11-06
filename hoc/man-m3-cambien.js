/* ============================================================================
   man-m3-cambien.js — diem10code-python: MÙA 3 Bến sông, CỘT 3 "Camera màu" (Xuồng + Tay lưới + Camera: combo nhà của mùa). BIẾN GHI MÀU, THAM SỐ CHỮ.
   color() đọc màu ở Ô NGAY TRƯỚC MŨI, không tốn nhịp: bè (lớp vatMau) cho màu của bè; không có bè thì màu ô đó (lớp mau, bến có màu), mặt nước là "none".
   Lưới phao bắt ở cách 2 ô còn camera thấy ở cách 1 ô, nên phải GHI MÀU VÀO BIẾN c rồi mới lùi ra tung lưới: đây là lý do cần biến.
   Bến có màu chỉ nhận bè cùng màu. Vì camera thấy cả màu bến, xuồng xuất phát sau các bến (phía bè) để while color() == "none" không dừng nhầm.
   8 hàng theo khuôn ManHoc.khuon (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['forward', 'backward', 'turn_left', 'turn_right', 'cast_net', 'drop_net', 'color'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than.slice() }; }
  function LUI() { return [H('lui', ['n'], ['for i in range(n):', '    backward()'])]; }
  function BA_HAM() { return LUI().concat([H('bat', [], ['backward()', 'cast_net()']), H('tha', [], ['drop_net()'])]); }
  function SONG(s) { var r = s.replace(/./g, '.'); return [r, s, r]; }
  /** Lời giải chung của hàng 1–5: ghi màu, lùi ra, tung lưới, chọn bến theo màu, thả. */
  var GIAO = ['c = color()', 'backward()', 'cast_net()', 'if c == "red":', '    lui(3)', 'else:', '    lui(1)', 'drop_net()'];
  var SAN = SONG('~~q~qB'), MAU = SONG('..r.b.'), BD = { x: 4, y: 1, huong: 1 };

  function man(so, m) {
    m.chuong = 'm3-c3-cam-bien';
    m.loaiRobot = 'xuong'; m.robot = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'camera', o: 'tren' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.bienDem = true;
    m.khaiDoiSo = true;
    m.moXuong = true;
    m.vo = 'song';
    m.mucTieu = 'dua-vat';
    m.phienBanNoiDung = 1;                     // wait() không còn chốt lệnh: bản nháp cũ không dùng nữa
    ManHoc.khuon(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Camera thấy màu',
      deBai: 'Bấm Chạy và xem. Camera đọc màu ô ngay trước mũi, lưới phao bắt ở cách 2 ô. Nên xuồng ghi màu vào biến c trước, rồi mới lùi ra tung lưới. Bến màu nào nhận bè màu đó.',
      san: SAN, mau: MAU, vatMau: SONG('.....r'), batDau: BD,
      sao: { o: 10, nhip: 7 },
      loiGiai: { chinh: GIAO.slice(), hamCuaMan: LUI() } }),

    man(2, { ten: 'Biến còn nhớ',
      deBai: 'Bè lần này màu xanh dương. Đọc code, đoán rồi bấm Chạy.',
      san: SAN, mau: MAU, vatMau: SONG('.....b'), batDau: BD,
      duDoan: { hoi: 'Xuồng đã lùi ra xa bè rồi mới hỏi c. Bè về đâu?', luaChon: ['Bến đỏ', 'Bến xanh dương', 'Không về đâu, vì lùi ra rồi không thấy màu nữa'], dung: 1, xacMinh: { x: 2, y: 1, vat: [{ x: 4, y: 1 }] } },
      sao: { o: 10, nhip: 5 },
      loiGiai: { chinh: GIAO.slice(), hamCuaMan: LUI() } }),

    man(3, { ten: 'Ghi màu',
      deBai: 'Hai sân: bè đỏ và bè xanh dương. Code dùng biến c mà chưa gán. Điền dòng còn thiếu.',
      san: [SAN, SAN], mau: [MAU, MAU], vatMau: [SONG('.....r'), SONG('.....b')], batDau: [BD, BD],
      maMau: { chinh: [''].concat(GIAO.slice(1)), hamCuaMan: LUI() },
      goiY: ['Phải đọc màu khi bè còn ngay trước mũi, trước khi lùi.'],
      sao: { o: 10, nhip: 7 },
      loiGiai: { chinh: GIAO.slice(), hamCuaMan: LUI() } }),

    man(4, { ten: 'Đọc trước, lùi sau',
      deBai: 'Hai sân. Đủ dòng nhưng sai thứ tự: xuồng lùi rồi mới đọc màu nên chỉ thấy mặt nước. Giữ một dòng rồi kéo sang chỗ đúng.',
      san: [SAN, SAN], mau: [MAU, MAU], vatMau: [SONG('.....r'), SONG('.....b')], batDau: [BD, BD],
      maMau: { chinh: ['backward()', 'c = color()'].concat(GIAO.slice(2)), hamCuaMan: LUI() },
      goiY: ['color() chỉ thấy ô ngay trước mũi: lùi ra thì trước mũi là nước, color() trả "none".'],
      sao: { o: 10, nhip: 7 },
      loiGiai: { chinh: GIAO.slice(), hamCuaMan: LUI() } }),

    man(5, { ten: 'Nhầm màu',
      deBai: 'Code này sai đúng 1 chỗ: bè về nhầm bến. Bấm Chạy xem lỗi, rồi sửa.',
      san: [SAN, SAN], mau: [MAU, MAU], vatMau: [SONG('.....r'), SONG('.....b')], batDau: [BD, BD],
      maMau: { chinh: GIAO.map(function (d) { return d === 'if c == "red":' ? 'if c == "blue":' : d; }), hamCuaMan: LUI() },
      goiY: ['Bến đỏ ở xa hơn, phải lùi 3 ô. Bến xanh dương ở gần, lùi 1 ô.'],
      sao: { o: 10, nhip: 7 },
      loiGiai: { chinh: GIAO.slice(), hamCuaMan: LUI() } }),

    man(6, { ten: 'Bè ở xa',
      deBai: 'Màn trống, em tự viết. Hai sân, bè ở xa gần khác nhau, màu khác nhau. Từ bè về bến đỏ luôn 6 ô, về bến xanh dương luôn 4 ô. Hàm lui(n), bat() và tha() có sẵn trong khay.',
      san: [SONG('~~q~q~~~B'), SONG('~~~q~q~~~B')],
      mau: [SONG('..r.b....'), SONG('...r.b....')],
      vatMau: [SONG('........r'), SONG('.........b')],
      batDau: [{ x: 6, y: 1, huong: 1 }, { x: 6, y: 1, huong: 1 }],
      goiY: ['Mặt nước đọc ra "none": lặp forward() khi color() còn là "none".', 'Dừng rồi thì ghi c = color(), gọi bat() để lùi một ô và tung lưới, chọn số ô cần lùi theo c, cuối cùng tha().'],
      sao: { o: 14, nhip: 11 },
      loiGiai: { chinh: ['while color() == "none":', '    forward()', 'c = color()', 'bat()', 'if c == "red":', '    lui(6)', 'else:', '    lui(4)', 'tha()'], hamCuaMan: BA_HAM() } }),

    man(7, { ten: 'Tham số là màu',
      deBai: 'Hai làn, mỗi làn một bè. Tự viết hàm tên tùy em nhận tham số là màu, ví dụ giao(c): lùi ra, tung lưới, chọn bến theo c, thả. Khi đặt tên hàm, thêm một đối số. Hàm lui(n) có sẵn.',
      san: ['......', '~~q~qB', '~.....', '~~q~qB', '......'],
      mau: ['......', '..r.b.', '......', '..r.b.', '......'],
      vatMau: ['......', '.....r', '......', '.....b', '......'],
      batDau: BD,
      canThamSo: true,
      goiY: ['Trong hàm viết y như các màn trước, chỉ khác là c do nơi gọi truyền vào.', 'Chương trình chính: c = color(), giao(c), sang làn dưới, tới sát bè, c = color(), giao(c).'],
      sao: { o: 19, nhip: 20 },
      loiGiai: {
        chinh: ['c = color()', 'giao(c)', 'turn_right()', 'forward()', 'forward()', 'turn_left()', 'for i in range(4):', '    forward()', 'c = color()', 'giao(c)'],
        hamCuaMan: LUI(),
        hamCuaEmMoi: [H('giao', ['c'], ['backward()', 'cast_net()', 'if c == "red":', '    lui(3)', 'else:', '    lui(1)', 'drop_net()'])]
      } }),

    man(8, { ten: 'Ba bến ba màu',
      deBai: 'Ba sân, bè ở xa gần khác nhau, ba màu. Từ bè về bến đỏ 6 ô, bến xanh dương 4 ô, bến vàng 2 ô. Đưa bè về đúng bến.',
      san: [SONG('~~q~q~q~B'), SONG('~~~q~q~q~B'), SONG('~~q~q~q~B')],
      mau: [SONG('..r.b.y..'), SONG('...r.b.y..'), SONG('..r.b.y..')],
      vatMau: [SONG('........r'), SONG('.........y'), SONG('........b')],
      batDau: [{ x: 7, y: 1, huong: 1 }, { x: 7, y: 1, huong: 1 }, { x: 7, y: 1, huong: 1 }],
      sao: { o: 14, nhip: 10 },
      loiGiai: {
        chinh: ['while color() == "none":', '    forward()', 'c = color()', 'if c == "red":', '    giao(6)', 'elif c == "blue":', '    giao(4)', 'else:', '    giao(2)'],
        hamCuaEmMoi: [H('giao', ['n'], ['backward()', 'cast_net()', 'for i in range(n):', '    backward()', 'drop_net()'])]
      },
      huyHieu: { ma: 'mau', ten: 'Mắt sông' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();

/* ============================================================================
   man-m3-tay.js — diem10code-python: MÙA 3 Bến sông, CỘT 2 "Lưới phao" (Xuồng + Tay lưới + Cảm ứng từ: cảm biến quen từ mùa 2). DẠY THAM SỐ.
   cast_net() tung lưới thẳng trước mũi, bắt vật nổi cách xuồng ĐÚNG 2 ô. Vật không dính vào xuồng mà đi theo sau, luôn cách xuồng 2 ô trên đường xuồng vừa đi.
   drop_net() thả vật tại ô nó đang nằm. Hai lệnh này làm việc ở nhịp kế tiếp, như nam châm. front_metal() đúng khi thùng sắt còn cách 2 ô, đúng tầm lưới.
   8 hàng theo khuôn ManHoc.khuon (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['forward', 'backward', 'turn_left', 'turn_right', 'cast_net', 'drop_net', 'front_metal', 'front_pole'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than.slice() }; }
  function LUI() { return [H('lui', ['n'], ['for i in range(n):', '    backward()'])]; }
  function SONG(s) { var r = s.replace(/./g, '.'); return [r, s, r]; }

  function man(so, m) {
    m.chuong = 'm3-c2-tay';
    m.loaiRobot = 'xuong'; m.robot = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'tu', o: 'hong' }] };
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
    man(1, { ten: 'Tung lưới phao',
      deBai: 'Bấm Chạy và xem: xuồng tung lưới bắt bè cách 2 ô rồi lùi, bè đi theo. Hàm lui(n) có tham số n: gọi lui(3) thì trong hàm n là 3.',
      san: SONG('~~q~~B'),
      batDau: { x: 3, y: 1, huong: 1 },
      sao: { o: 5, nhip: 6 },
      loiGiai: { chinh: ['cast_net()', 'lui(3)', 'drop_net()'], hamCuaMan: LUI() } }),

    man(2, { ten: 'Bè đi theo thế nào',
      deBai: 'Lưới phao không kéo bè sát mũi như nam châm. Đọc code, đoán rồi bấm Chạy.',
      san: SONG('~~q~B'),
      batDau: { x: 2, y: 1, huong: 1 },
      duDoan: { hoi: 'Khi xuồng lùi 2 ô, bè đi thế nào?', luaChon: ['Bè đứng yên ở chỗ cũ', 'Bè đi theo, luôn cách xuồng 2 ô', 'Bè bị kéo dính sát mũi xuồng'], dung: 1, xacMinh: { x: 0, y: 1, vat: [{ x: 2, y: 1 }] } },
      sao: { o: 5, nhip: 5 },
      loiGiai: { chinh: ['cast_net()', 'lui(2)', 'drop_net()'], hamCuaMan: LUI() } }),

    man(3, { ten: 'Lùi mấy ô',
      deBai: 'Thiếu một dòng ở ô trống. Hàm lui(n) có sẵn trong khay: thêm lời gọi và chọn số để bè về đúng bến.',
      san: SONG('~~q~~~B'),
      batDau: { x: 4, y: 1, huong: 1 },
      maMau: { chinh: ['cast_net()', '', 'drop_net()'] , hamCuaMan: LUI() },
      goiY: ['Bè đang ở ô 6, bến ở ô 2. Xuồng lùi bao nhiêu ô thì bè đi bấy nhiêu ô.'],
      sao: { o: 5, nhip: 7 },
      loiGiai: { chinh: ['cast_net()', 'lui(4)', 'drop_net()'], hamCuaMan: LUI() } }),

    man(4, { ten: 'Dò rồi mới tung',
      deBai: 'Đủ dòng nhưng tung lưới quá sớm. Xuồng phải dò tới khi cách thùng sắt 2 ô rồi mới tung. Giữ một dòng rồi kéo sang chỗ đúng.',
      san: SONG('~~q~~~B'),
      vatChat: SONG('......s'),
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: ['cast_net()', 'while not front_metal():', '    forward()', 'lui(4)', 'drop_net()'], hamCuaMan: LUI() },
      goiY: ['front_metal() đúng khi thùng còn cách 2 ô: đúng tầm lưới phao.'],
      sao: { o: 7, nhip: 11 },
      loiGiai: { chinh: ['while not front_metal():', '    forward()', 'cast_net()', 'lui(4)', 'drop_net()'], hamCuaMan: LUI() } }),

    man(5, { ten: 'Lưới không tới',
      deBai: 'Code này sai đúng 1 chỗ: xuồng tung lưới khi còn cách thùng 3 ô nên hụt. Bấm Chạy xem lỗi, rồi sửa.',
      san: SONG('~~~q~~B'),
      vatChat: SONG('......s'),
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: { chinh: ['for i in range(1):', '    forward()', 'cast_net()', 'lui(3)', 'drop_net()'], hamCuaMan: LUI() },
      goiY: ['Lưới phao chỉ bắt được vật cách xuồng đúng 2 ô.'],
      sao: { o: 7, nhip: 8 },
      loiGiai: { chinh: ['for i in range(2):', '    forward()', 'cast_net()', 'lui(3)', 'drop_net()'], hamCuaMan: LUI() } }),

    man(6, { ten: 'Thùng xa, thùng gần',
      deBai: 'Màn trống, em tự viết. Hai sân, thùng sắt ở xa gần khác nhau nhưng từ thùng tới bến luôn 3 ô. Dò ra thùng, tung lưới, kéo về bến rồi thả. Hàm lui(n) có sẵn trong khay.',
      san: [SONG('~~~q~~B'), SONG('~~~~~q~~B')],
      vatChat: [SONG('......s'), SONG('........s')],
      batDau: [{ x: 0, y: 1, huong: 1 }, { x: 0, y: 1, huong: 1 }],
      goiY: ['Dò bằng while not front_metal(), tung lưới, lùi 3 ô, rồi thả.'],
      sao: { o: 7, nhip: 12 },
      loiGiai: { chinh: ['while not front_metal():', '    forward()', 'cast_net()', 'lui(3)', 'drop_net()'], hamCuaMan: LUI() } }),

    man(7, { ten: 'Hai làn: hàm có tham số',
      deBai: 'Làn trên phải kéo 2 ô, làn dưới phải kéo 3 ô. Tự viết MỘT hàm có tham số số ô, tên tùy em, rồi gọi hai lần với hai số khác nhau. Khi đặt tên hàm, thêm một đối số.',
      san: ['......', '~~q~B.', '~.....', '~~q~~B', '......'],
      vatChat: ['......', '....s.', '......', '.....s', '......'],
      batDau: { x: 2, y: 1, huong: 1 },
      khung: { chinh: 8 },
      canThamSo: true,
      goiY: ['Trong hàm: tung lưới, lùi n ô, thả lưới. Thân vòng for dùng range(n).', 'Sang làn dưới rồi dò thùng bằng while, gọi hàm lần nữa với số khác.'],
      sao: { o: 12, nhip: 18 },
      loiGiai: {
        chinh: ['keo_ve(2)', 'turn_right()', 'forward()', 'forward()', 'turn_left()', 'while not front_metal():', '    forward()', 'keo_ve(3)'],
        hamCuaEmMoi: [H('keo_ve', ['n'], ['cast_net()', 'for i in range(n):', '    backward()', 'drop_net()'])]
      } }),

    man(8, { ten: 'Chỉ kéo thùng sắt',
      deBai: 'Hai sân. Mỗi sân có hai làn: một làn thùng sắt, một làn thùng gỗ, không biết làn nào. Dò từ làn trên, chỉ kéo thùng sắt về bến cách thùng 2 ô.',
      san: [['......', '~~q~B.', '..~...', '~~q~B.', '......'], ['......', '~~q~B.', '..~...', '~~q~B.', '......']],
      vatChat: [['......', '....s.', '......', '....g.', '......'], ['......', '....g.', '......', '....s.', '......']],
      vatCan: 'sat',
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      sao: { o: 10, nhip: 9 },
      loiGiai: {
        chinh: ['if not front_metal():', '    turn_right()', '    forward()', '    forward()', '    turn_left()', 'keo_ve()'],
        hamCuaEmMoi: [H('keo_ve', [], ['cast_net()', 'for i in range(2):', '    backward()', 'drop_net()'])]
      },
      huyHieu: { ma: 'day-keo', ten: 'Thợ quăng lưới phao' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();

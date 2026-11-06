/* ============================================================================
   man-m3-san.js — diem10code-python: MÙA 3 Bến sông, CỘT 4 "+Sân" (combo đầy đủ + môi trường bến sông). Hàng 8 là TRÙM CỦA MÙA.
   Dòng nước (lớp dong: { x, y, huong, suc }): mỗi nhịp đẩy xuồng đứng trên ô đó đi suc ô theo huong. Ngược dòng sức 1 thì đứng yên. Bè tự do cũng trôi.
   K = cống đóng, chặn như tường. V = van trên bờ: lưới phao trúng van thì cống đổi đóng / mở và dòng đổi tắt / chạy (mỗi van điều khiển mọi cống, mọi dòng của sân).
   cast_net("left") tung lưới sang trái mũi xuồng, cast_net() tung thẳng. Van có thể cách 1 hay 2 ô.
   8 hàng theo khuôn ManHoc.khuon (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['forward', 'backward', 'turn_left', 'turn_right', 'cast_net', 'drop_net', 'color'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than.slice() }; }
  function BA_HAM() {
    return [H('lui', ['n'], ['for i in range(n):', '    backward()']), H('bat', [], ['backward()', 'cast_net()']), H('tha', [], ['drop_net()'])];
  }
  /** Các ô dòng nước x từ a tới b trên hàng y, chiều h (0 lên, 1 phải, 2 xuống, 3 trái). */
  function DONG(a, b, y, h) { var d = []; for (var x = a; x <= b; x++) d.push({ x: x, y: y, huong: h, suc: 1 }); return d; }
  function HANG(s) { return s.replace(/./g, '.'); }

  function man(so, m) {
    m.chuong = 'm3-c4-san';
    m.loaiRobot = 'xuong'; m.robot = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'camera', o: 'tren' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.bienDem = true;
    m.khaiDoiSo = true;
    m.moXuong = true;
    m.vo = 'song';
    m.phienBanNoiDung = 1;                     // wait() không còn chốt lệnh: bản nháp cũ không dùng nữa
    ManHoc.khuon(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Dòng nước đẩy',
      deBai: 'Bấm Chạy và xem: xuồng đứng trên dòng nước thì bị đẩy theo mũi tên mỗi nhịp. Đi xuôi dòng nhanh gấp đôi.',
      san: ['.....', '~~~~Q', '.....'],
      dong: DONG(1, 3, 1, 1),
      batDau: { x: 0, y: 1, huong: 1 },
      mucTieu: 'toi-co',
      sao: { o: 3, nhip: 2 },
      loiGiai: { chinh: ['n = 2', 'for i in range(n):', '    forward()'] } }),

    man(2, { ten: 'Ngược dòng',
      deBai: 'Van trên bờ tắt dòng nước khi lưới phao trúng nó. cast_net("left") tung lưới sang trái mũi xuồng. Đọc code, đoán rồi bấm Chạy.',
      san: ['.V....', '~~~~~Q', '......'],
      dong: DONG(2, 4, 1, 3),
      batDau: { x: 1, y: 1, huong: 1 },
      mucTieu: 'toi-co',
      duDoan: { hoi: 'Hai lần forward() đầu tiên đi ngược dòng. Sau hai lần đó xuồng ở đâu?', luaChon: ['Vẫn ở chỗ cũ', 'Đi được 2 ô', 'Bị đẩy lùi 2 ô'], dung: 0, xacMinh: { x: 5, y: 1 } },
      sao: { o: 5, nhip: 8 },
      loiGiai: { chinh: ['for i in range(2):', '    forward()', 'cast_net("left")', 'for i in range(4):', '    forward()'] } }),

    man(3, { ten: 'Mở cống',
      deBai: 'Cống đóng chặn đường như tường. Van nằm ngay bên trái mũi xuồng. Thiếu một dòng ở ô trống: điền lệnh tung lưới trúng van để mở cống.',
      san: ['.V....', '~~K~~Q', '......'],
      batDau: { x: 1, y: 1, huong: 1 },
      mucTieu: 'toi-co',
      maMau: { chinh: ['', 'n = 4', 'for i in range(n):', '    forward()'] },
      goiY: ['Chạm vào khối cast_net("left") trên khay. Tung lưới mất 2 nhịp, xong thì cống đã mở.'],
      sao: { o: 4, nhip: 6 },
      loiGiai: { chinh: ['cast_net("left")', 'n = 4', 'for i in range(n):', '    forward()'] } }),

    man(4, { ten: 'Tắt dòng trước',
      deBai: 'Đủ dòng nhưng xuồng cứ đâm đầu ngược dòng trước khi tắt van. Giữ một dòng rồi kéo sang chỗ đúng.',
      san: ['.V...Q', '~~~~~~', '......'],
      dong: DONG(2, 4, 1, 3),
      batDau: { x: 1, y: 1, huong: 1 },
      mucTieu: 'toi-co',
      maMau: { chinh: ['for i in range(4):', '    forward()', 'cast_net("left")', 'turn_left()', 'forward()'] },
      goiY: ['Dòng còn chạy thì forward() không đi được chút nào.'],
      sao: { o: 5, nhip: 8 },
      loiGiai: { chinh: ['cast_net("left")', 'for i in range(4):', '    forward()', 'turn_left()', 'forward()'] } }),

    man(5, { ten: 'Tung nhầm phía',
      deBai: 'Code này sai đúng 1 chỗ: lưới bay sang bờ không có van nên cống vẫn đóng. Bấm Chạy xem lỗi, rồi sửa.',
      san: ['.V.....', '~~K~~~Q', '.......'],
      batDau: { x: 1, y: 1, huong: 1 },
      mucTieu: 'toi-co',
      maMau: { chinh: ['cast_net("right")', 'for i in range(5):', '    forward()'] },
      goiY: ['Xuồng đang quay mũi sang phải sân. Bên trái mũi xuồng là phía trên sân.'],
      sao: { o: 3, nhip: 7 },
      loiGiai: { chinh: ['cast_net("left")', 'for i in range(5):', '    forward()'] } }),

    man(6, { ten: 'Đếm đường về',
      deBai: 'Màn trống, em tự viết. Hai sân, bè sau cống, xa gần khác nhau, về đúng một bến. Mở cống, tới sát bè, vừa đi vừa ĐẾM bằng biến để biết phải lùi mấy ô. Hàm lui(n), bat() và tha() có sẵn.',
      san: [['..V....', '~~qK~~B', '.......'], ['..V.....', '~~qK~~~B', '........']],
      vatMau: [[HANG('..V....'), '......r', HANG('.......')], [HANG('..V.....'), '.......r', HANG('........')]],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      mucTieu: 'dua-vat',
      goiY: ['Đi thêm một ô thì đường về dài thêm một ô: n = 1 rồi mỗi vòng n = n + 1.', 'Tới sát bè thì bat(), lui(n), tha().'],
      sao: { o: 13, nhip: 15 },
      loiGiai: { chinh: ['cast_net("left")', 'n = 1', 'while color() == "none":', '    forward()', '    n = n + 1', 'bat()', 'lui(n)', 'tha()'], hamCuaMan: BA_HAM() } }),

    man(7, { ten: 'Cầu thang: hai tham số',
      deBai: 'Khúc sông như cầu thang, bậc nào cũng đi thẳng rồi rẽ lên nhưng dài ngắn khác nhau. Tự viết hàm tên tùy em có HAI tham số. Chương trình chính chỉ có 4 ô. Khi đặt tên hàm, thêm hai đối số.',
      san: ['.......', '......Q', '......~', '.....~~', 'V.~~~~.', '~K~....', '.......'],
      batDau: { x: 0, y: 5, huong: 1 },
      mucTieu: 'toi-co',
      khung: { chinh: 4 },
      canThamSo: true,
      goiY: ['Mở cống bằng van trước. Một bậc: đi thẳng a ô, quay trái, đi b ô, quay phải.', 'Ba bậc: đi 2 lên 1, đi 3 lên 1, đi 1 lên 2.'],
      sao: { o: 10, nhip: 17 },
      loiGiai: {
        chinh: ['cast_net("left")', 'bac(2, 1)', 'bac(3, 1)', 'bac(1, 2)'],
        hamCuaEmMoi: [H('bac', ['a', 'b'], ['for i in range(a):', '    forward()', 'turn_left()', 'for i in range(b):', '    forward()', 'turn_right()'])]
      } }),

    man(8, { ten: 'Trùm bến sông',
      deBai: 'Màn trùm của mùa. Ba sân: van mở cống và tắt dòng, bè sau cống ở xa gần khác nhau, bến đỏ cách bè 4 ô, bến xanh dương cách bè 3 ô. Đưa bè về đúng bến màu của nó.',
      san: [['.....V..', '~~~qq~KB', '........'], ['.....V...', '~~~~qqK~B', '.........'], ['.....V..', '~~~qq~KB', '........']],
      mau: [['........', '...rb...', '........'], ['.........', '....rb...', '.........'], ['........', '...rb...', '........']],
      vatMau: [['........', '.......r', '........'], ['.........', '........b', '.........'], ['........', '.......b', '........']],
      dong: [DONG(6, 6, 1, 3), DONG(7, 7, 1, 3), DONG(6, 6, 1, 3)],
      batDau: [{ x: 5, y: 1, huong: 1 }, { x: 5, y: 1, huong: 1 }, { x: 5, y: 1, huong: 1 }],
      mucTieu: 'dua-vat',
      sao: { o: 13, nhip: 11 },
      loiGiai: {
        chinh: ['cast_net("left")', 'while color() == "none":', '    forward()', 'c = color()', 'if c == "red":', '    giao(4)', 'else:', '    giao(3)'],
        hamCuaEmMoi: [H('giao', ['n'], ['backward()', 'cast_net()', 'for i in range(n):', '    backward()', 'drop_net()'])]
      },
      huyHieu: { ma: 'ben-tau', ten: 'Trùm bến sông' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();

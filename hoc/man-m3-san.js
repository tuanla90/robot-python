/* ============================================================================
   man-m3-san.js — diem10code-python: MÙA 3 Bến sông, CỘT 4 "+Sân" (combo đầy đủ + môi trường bến sông). Hàng 8 là TRÙM CỦA MÙA.
   Dòng nước (lớp dong: { x, y, huong, suc }): mỗi nhịp đẩy xuồng đứng trên ô đó đi suc ô theo huong. Ngược dòng sức 1 thì đứng yên. Bè tự do cũng trôi.
   K = cống đóng, chặn như tường. V = van trên bờ: lưới phao trúng van thì cống đổi đóng / mở và dòng đổi tắt / chạy (mỗi van điều khiển mọi cống, mọi dòng của sân).
   cast_net("left") tung lưới sang trái mũi xuồng, cast_net() tung thẳng. Van có thể cách 1 hay 2 ô.
   8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
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
    m.phienBanNoiDung = m.phienBanNoiDung || 2;                     // khuôn mới: đánh số lại các màn, bản nháp cũ không dùng nữa
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Ngược dòng',
      deBai: 'Dòng nước đẩy xuồng theo mũi tên mỗi nhịp: xuôi dòng nhanh gấp đôi, ngược dòng thì đứng yên. Van trên bờ tắt dòng khi lưới phao trúng nó, cast_net("left") tung lưới sang trái mũi xuồng. Đọc code, đoán rồi bấm Chạy.',
      san: ['.V....', '~~~~~Q', '......'],
      dong: DONG(2, 4, 1, 3),
      batDau: { x: 1, y: 1, huong: 1 },
      mucTieu: 'toi-co',
      duDoan: { hoi: 'Hai lần forward() đầu tiên đi ngược dòng. Sau hai lần đó xuồng ở đâu?', luaChon: ['Vẫn ở chỗ cũ', 'Đi được 2 ô', 'Bị đẩy lùi 2 ô'], dung: 0, xacMinh: { x: 5, y: 1 } },
      sao: { o: 5, nhip: 8 },
      loiGiai: { chinh: ['for i in range(2):', '    forward()', 'cast_net("left")', 'for i in range(4):', '    forward()'] } }),

    man(2, { phienBanNoiDung: 3, ten: 'Mỗi quãng dài hơn một ô',
      deBai: 'Cống đóng chặn đường như tường, mỗi cống một van trên bờ. Ba quãng sông dài 1, 2, 3 ô, nên biến n tăng dần sau mỗi lượt. Đầu mỗi quãng phải tung lưới trúng van bên trái mũi xuồng để mở cống: điền dòng còn thiếu.',
      san: ['.VV.V...', '~~K~K~KQ', '........'],
      noi: [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [] }, { nut: { x: 2, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [] }, { nut: { x: 4, y: 0 }, cong: [{ x: 6, y: 1 }], dong: [] }],
      batDau: { x: 1, y: 1, huong: 1 },
      mucTieu: 'toi-co',
      maMau: { chinh: ['n = 1', 'for i in range(3):', '', '    for i in range(n):', '        forward()', '    n = n + 1'] },
      goiY: ['Chạm vào khối cast_net("left") trên khay. Tung lưới mất 2 nhịp, xong thì cống phía trước đã mở.', 'Dòng ấy nằm trong vòng for ngoài, đứng trước vòng for trong.'],
      sao: { o: 6, nhip: 12 },
      loiGiai: { chinh: ['n = 1', 'for i in range(3):', '    cast_net("left")', '    for i in range(n):', '        forward()', '    n = n + 1'] } }),

    man(3, { ten: 'Tung nhầm phía',
      deBai: 'Code này sai đúng 1 chỗ: lưới bay sang bờ không có van nên cống vẫn đóng. Bấm Chạy xem lỗi, rồi sửa.',
      san: ['.V.....', '~~K~~~Q', '.......'],
      batDau: { x: 1, y: 1, huong: 1 },
      mucTieu: 'toi-co',
      maMau: { chinh: ['cast_net("right")', 'for i in range(5):', '    forward()'] },
      goiY: ['Xuồng đang quay mũi sang phải sân. Bên trái mũi xuồng là phía trên sân.'],
      sao: { o: 3, nhip: 7 },
      loiGiai: { chinh: ['cast_net("left")', 'for i in range(5):', '    forward()'] } }),

    man(4, { phienBanNoiDung: 3, ten: 'Đếm đường về',
      deBai: 'Màn trống, em tự viết. Hai sân, bè sau cống, xa gần khác nhau, về đúng một bến. Mở cống, tới sát bè, vừa đi vừa ĐẾM bằng biến để biết phải lùi mấy ô. Hàm lui(n), bat() và tha() có sẵn.',
      san: [['...V....', '~~~qK~~B', '........'], ['...V.....', '~~~qK~~~B', '.........']],       // bến cách bờ trái 3 ô: lùi quá đà tới sát bờ thì bè trật bến, không lách được biến đếm
      vatMau: [[HANG('...V....'), '.......r', HANG('........')], [HANG('...V.....'), '........r', HANG('.........')]],
      batDau: [{ x: 3, y: 1, huong: 1 }, { x: 3, y: 1, huong: 1 }],
      mucTieu: 'dua-vat',
      goiY: ['Đi thêm một ô thì đường về dài thêm một ô: n = 1 rồi mỗi vòng n = n + 1.', 'Tới sát bè thì bat(), lui(n), tha().'],
      sao: { o: 13, nhip: 15 },
      loiGiai: { chinh: ['cast_net("left")', 'n = 1', 'while color() == "none":', '    forward()', '    n = n + 1', 'bat()', 'lui(n)', 'tha()'], hamCuaMan: BA_HAM() } }),

    man(5, { ten: 'Đón dòng hay đi thẳng',
      deBai: 'Tới bến phao. Làn dưới nước êm, cứ đi thẳng rồi rẽ lên. Làn trên có dòng nước xuôi, muốn đón thì phải sang làn đó trước. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: ['...........', '~~~~~~~~~~Q', '~~~~~~~~~~~', '...........'],
      dong: DONG(1, 9, 1, 1),
      batDau: { x: 0, y: 2, huong: 1 },
      mucTieu: 'toi-co',
      goiY: ['Trên dòng xuôi, mỗi lần forward() đi được 2 ô.', 'Sang làn trên mất 3 nhịp: quay, đi, quay lại. Đi xa thì vẫn lời.'],
      sao: { o: 4, nhip: 8 },
      doiCho: true,
      loiGiai: { chinh: ['for i in range(10):', '    forward()', 'turn_left()', 'forward()'] },
      cachKhac: [{ chinh: ['turn_left()', 'forward()', 'turn_right()', 'for i in range(5):', '    forward()'] }] }),

    man(6, { ten: 'Cầu thang: hai tham số',
      deBai: 'Khúc sông như cầu thang, bậc nào cũng đi thẳng rồi rẽ lên nhưng dài ngắn khác nhau. Tự viết hàm tên tùy em có HAI tham số. Chương trình chính chỉ có 4 ô. Khi đặt tên hàm, thêm hai đối số.',
      san: ['.......', '......Q', '......~', '.....~~', 'V.~~~~.', '~K~....', '.......'],
      batDau: { x: 0, y: 5, huong: 1 },
      mucTieu: 'toi-co',
      khung: { chinh: 4 },
      canThamSo: true,
      goiY: ['Mở cống bằng van trước. Một bậc: đi thẳng a ô, quay trái, đi b ô, quay phải.', 'Ba bậc: đi 2 lên 1, đi 3 lên 1, đi 1 lên 2.'],
      sao: { o: 10, nhip: 18 },
      loiGiai: {
        chinh: ['cast_net("left")', 'bac(2, 1)', 'bac(3, 1)', 'bac(1, 2)'],
        hamCuaEmMoi: [H('bac', ['a', 'b'], ['for i in range(a):', '    forward()', 'turn_left()', 'for i in range(b):', '    forward()', 'turn_right()'])]
      } }),

    man(7, { ten: 'Hai cống hay đường vòng',
      deBai: 'Bến phao nằm sau hai cống, mỗi cống một van riêng. Phía dưới có đường vòng không cần mở cống. Hàm nào cũng được, tên tùy em. Tìm bài vừa gọn vừa nhanh.',
      san: ['.V..V....', '~~K~~K~~Q', '~.......~', '~~~~~~~~~'],
      noi: [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [] }, { nut: { x: 4, y: 0 }, cong: [{ x: 5, y: 1 }], dong: [] }],
      batDau: { x: 1, y: 1, huong: 1 },
      mucTieu: 'toi-co',
      goiY: ['Tung lưới mất 2 nhịp nhưng đường qua cống ngắn hơn hẳn.', 'Hai lượt qua cống chỉ khác số ô phải đi: một hàm có tham số là đủ.'],
      sao: { o: 5, nhip: 11 },
      loiGiai: {
        chinh: ['qua_cong(3)', 'qua_cong(4)'],
        hamCuaEmMoi: [H('qua_cong', ['n'], ['cast_net("left")', 'for i in range(n):', '    forward()'])]
      },
      cachKhac: [{ chinh: ['backward()', 'turn_right()', 'for i in range(2):', '    forward()', 'turn_left()', 'for i in range(8):', '    forward()', 'turn_left()', 'for i in range(2):', '    forward()'] }] }),

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

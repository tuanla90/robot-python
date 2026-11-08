/* ============================================================================
   man-m3-than.js — diem10code-python: MÙA 3 Bến sông, CỘT 1 "Thân xuồng" (Xuồng + Nam châm + Cảm ứng từ: tay và cảm biến quen từ mùa 2). DẠY BIẾN.
   Xuồng có mũi như xe hai bánh: forward / backward / turn_left / turn_right, mỗi lệnh 1 nhịp. Chỉ đi trên nước, mọi ô khác là bờ.
   Nam châm gắn trước mũi: hút vật sắt trong 2 ô về dính ở mũi, magnet_off() thả xuống ô trước mũi (phải là nước).
   B = thùng trôi trên sông (lớp vatChat: s sắt, N / S nam châm), q = bến nhận, Q = phao đích.
   8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['forward', 'backward', 'turn_left', 'turn_right', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  /** Sân một khúc sông thẳng: bờ trên, mặt nước `s`, bờ dưới. */
  function SONG(s) { var r = s.replace(/./g, '.'); return [r, s, r]; }
  /** Khúc sông có thêm một làn nước phía trên, đủ chỗ cho xuồng quay đầu mang theo thùng ở mũi. Bến ở đầu làn `s`. */
  function HO(s) { var r = s.replace(/./g, '.'); return [r, '.' + r.slice(1).replace(/\./g, '~'), s, r]; }
  /** Lớp vật của HO: `s` là làn có vật. */
  function VAT(s) { var r = s.replace(/./g, '.'); return [r, r, s, r]; }

  function man(so, m) {
    m.chuong = 'm3-c1-than';
    m.loaiRobot = 'xuong'; m.robot = { than: 'xuong', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.bienDem = true;
    m.moXuong = true;
    m.vo = 'song';
    m.phienBanNoiDung = m.phienBanNoiDung || 2;                     // khuôn mới: đánh số lại các màn, bản nháp cũ không dùng nữa
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Hộp đổi số',
      deBai: 'Xuồng có mũi và quay tại chỗ, đi hay quay đều 1 nhịp. n = 2 là một biến: chiếc hộp tên n đang đựng số 2, vòng for đọc số trong hộp. Dòng n = n + 1 lấy số trong hộp, cộng 1, rồi cất lại. Đọc code, đoán rồi bấm Chạy.',
      san: SONG('~~~~~Q'),
      batDau: { x: 0, y: 1, huong: 1 },
      mucTieu: 'toi-co',
      duDoan: { hoi: 'Vòng for thứ hai chạy forward() mấy lần?', luaChon: ['2 lần', '3 lần', '4 lần'], dung: 1, xacMinh: { x: 5, y: 1 } },
      sao: { o: 6, nhip: 5 },
      loiGiai: { chinh: ['n = 2', 'for i in range(n):', '    forward()', 'n = n + 1', 'for i in range(n):', '    forward()'] } }),

    man(2, { phienBanNoiDung: 3, ten: 'Đi bao nhiêu về bấy nhiêu',
      deBai: 'Nam châm gắn trước mũi: bật lên là thùng sắt trong 2 ô bay về dính ở mũi, magnet_off() thả xuống ô trước mũi. Hai sân, thùng xa gần khác nhau, bến ở sau lưng xuồng nên không viết sẵn được số ô phải về. Biến n đếm số ô đã đi: điền dòng còn thiếu.',
      san: [HO('q~~~B~~'), HO('q~~~~~B~')],
      vatChat: [VAT('....s..'), VAT('......s.')],
      batDau: [{ x: 1, y: 2, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      mucTieu: 'dua-vat',
      maMau: { chinh: ['n = 0', 'while not front_metal():', '', '    forward()', 'magnet_n()', 'turn_left()', 'turn_left()', 'for i in range(n):', '    forward()', 'magnet_off()'] },
      goiY: ['Mỗi lần xuồng đi thêm một ô, số trong hộp n phải tăng thêm 1.', 'Dòng ấy nằm trong vòng while, cùng bậc với forward().'],
      sao: { o: 10, nhip: 10 },
      loiGiai: { chinh: ['n = 0', 'while not front_metal():', '    n = n + 1', '    forward()', 'magnet_n()', 'turn_left()', 'turn_left()', 'for i in range(n):', '    forward()', 'magnet_off()'] } }),

    man(3, { phienBanNoiDung: 3, ten: 'Xoáy trôn ốc',
      deBai: 'Code này sai đúng 1 chỗ: xuồng quay tại chỗ mà không rời được khúc đầu. Mỗi vòng xuồng phải đi xa hơn vòng trước một ô. Bấm Chạy xem lỗi, rồi sửa.',
      san: ['....~..', '.Q~~~..', '....~..', '...~~~~', '.......'],       // nước kéo dài quá khúc rẽ: viết thẳng một số thì xuồng chạy quá đà, không nhờ bờ chặn mà tới được đích
      batDau: { x: 3, y: 3, huong: 1 },
      mucTieu: 'toi-co',
      maMau: { chinh: ['n = 0', 'for i in range(3):', '    for i in range(n):', '        forward()', '    turn_left()', '    n = n + 1'] },
      goiY: ['Đoạn đầu chỉ dài 1 ô, rồi 2 ô, rồi 3 ô. Hộp n phải bắt đầu từ số nào?'],
      sao: { o: 6, nhip: 9 },
      loiGiai: { chinh: ['n = 1', 'for i in range(3):', '    for i in range(n):', '        forward()', '    turn_left()', '    n = n + 1'] } }),

    man(4, { phienBanNoiDung: 3, ten: 'Đường về dài hơn một ô',
      deBai: 'Màn trống, em tự viết. Hai sân, thùng xa gần khác nhau. Lần này xuồng xuất phát cách bến 2 ô, nên đường về dài hơn đường đi. Dò ra thùng, vừa đi vừa đếm, hút thùng rồi mang về bến.',
      san: [HO('q~~~~B~'), HO('q~~~~~~B~')],
      vatChat: [VAT('.....s.'), VAT('.......s.')],
      batDau: [{ x: 2, y: 2, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      mucTieu: 'dua-vat',
      goiY: ['Làm như màn trước: đếm số ô đã đi, hút thùng, quay đầu, đi đúng n ô.', 'Chưa đi ô nào thì đường về đã phải dài 1 ô. Hộp n nên bắt đầu từ số nào?'],
      sao: { o: 10, nhip: 11 },
      loiGiai: { chinh: ['n = 1', 'while not front_metal():', '    forward()', '    n = n + 1', 'magnet_n()', 'turn_left()', 'turn_left()', 'for i in range(n):', '    forward()', 'magnet_off()'] } }),

    man(5, { ten: 'Bến gần hay bến xa',
      deBai: 'Hai sân, thùng sắt ở xa gần khác nhau. Có hai bến, thùng vào bến nào cũng được: bến xa nằm thẳng đường, bến gần ở bên trái đường đi. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: [['..q.....', '~~B~~~~q', '........'], ['....q.....', '~~~~B~~~~q', '..........']],
      vatChat: [['........', '..s.....', '........'], ['..........', '....s.....', '..........']],
      batDau: [{ x: 0, y: 1, huong: 1 }, { x: 0, y: 1, huong: 1 }],
      mucTieu: 'dua-vat',
      goiY: ['Thùng dính ở mũi nên quay xuồng thì thùng quay theo: mũi chỉ vào bến là thả được.', 'Xuồng quay chỉ mất 1 nhịp: rẽ vào bến gần rất đáng.'],
      sao: { o: 6, nhip: 7 },
      doiCho: true,
      loiGiai: { chinh: ['while not front_metal():', '    forward()', 'magnet_n()', 'for i in range(6):', '    forward()', 'magnet_off()'] },
      cachKhac: [{ chinh: ['while not front_metal():', '    forward()', 'magnet_n()', 'for i in range(2):', '    forward()', 'turn_left()', 'magnet_off()'] }] }),

    man(6, { phienBanNoiDung: 3, ten: 'Hai làn: tự viết hàm',
      deBai: 'Hai làn sông, mỗi làn một thùng sắt và một bến, thùng xa gần khác nhau và đổi chỗ ở sân sau. Tự viết hàm tên tùy em cho một chuyến, dùng biến đếm trong hàm, rồi gọi hai lần. Chương trình chính chỉ có 6 ô.',
      san: [['........', '.~~~~~~~', 'q~~~~~B~', '.~~~~~~~', 'q~~~B~~~', '........'], ['........', '.~~~~~~~', 'q~~~B~~~', '.~~~~~~~', 'q~~~~~B~', '........']],
      vatChat: [['........', '........', '......s.', '........', '....s...', '........'], ['........', '........', '....s...', '........', '......s.', '........']],
      batDau: [{ x: 1, y: 2, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      mucTieu: 'dua-vat',
      khung: { chinh: 6 },
      goiY: ['Một chuyến giống hệt màn đầu cột: đếm, hút, quay đầu, đi n ô, thả.', 'Thả xong mũi xuồng hướng về bến: quay trái, đi 2 ô sang làn dưới, quay trái lần nữa.'],
      sao: { o: 16, nhip: 20 },
      loiGiai: {
        chinh: ['cho_thung()', 'turn_left()', 'forward()', 'forward()', 'turn_left()', 'cho_thung()'],
        hamCuaEmMoi: [H('cho_thung', ['n = 0', 'while not front_metal():', '    forward()', '    n = n + 1', 'magnet_n()', 'turn_left()', 'turn_left()', 'for i in range(n):', '    forward()', 'magnet_off()'])]
      } }),

    man(7, { ten: 'Hàm dùng chung hay từng chuyến',
      deBai: 'Hai thùng sắt trên một khúc sông, bên trái có bốn bến. Mỗi thùng vào bến nào cũng được. Một hàm giống nhau cho hai chuyến thì gọn, chọn bến gần thì nhanh. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: ['...q.q..q.q.', '~~B~~~~B~~~~', '............'],
      vatChat: ['............', '..s....s....', '............'],
      batDau: { x: 0, y: 1, huong: 1 },
      mucTieu: 'dua-vat',
      goiY: ['Thả xong phải quay mũi lại đường cũ thì mới đi tiếp được.', 'Hai thùng cách nhau 5 ô: một chuyến đi 5 ô thì chuyến sau bắt đầu giống hệt.'],
      sao: { o: 8, nhip: 15 },
      doiCho: true,
      loiGiai: {
        chinh: ['for i in range(2):', '    cho_thung()'],
        hamCuaEmMoi: [H('cho_thung', ['magnet_n()', 'for i in range(5):', '    forward()', 'turn_left()', 'magnet_off()', 'turn_right()'])]
      },
      cachKhac: [{
        chinh: ['tha_gan()', 'turn_right()', 'for i in range(2):', '    forward()', 'tha_gan()'],
        hamCuaEmMoi: [H('tha_gan', ['magnet_n()', 'for i in range(3):', '    forward()', 'turn_left()', 'magnet_off()'])]
      }] }),

    man(8, { ten: 'Thùng có cực',
      deBai: 'Hai sân, thùng nam châm cực khác nhau, ở xa gần khác nhau. Thùng nam châm mạnh hơn sắt: thấy và hút được từ cách 3 ô. Khác cực mới hút, cùng cực thì đẩy ra xa. Mang thùng tới bến cách thùng 2 ô.',
      san: [SONG('~~~~B~q.'), SONG('~~~~~~B~q')],
      vatChat: [SONG('....N...'), SONG('......S..')],
      batDau: [{ x: 0, y: 1, huong: 1 }, { x: 0, y: 1, huong: 1 }],
      mucTieu: 'dua-vat',
      sao: { o: 9, nhip: 9 },
      loiGiai: { chinh: ['while front_pole() == "none":', '    forward()', 'if front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'for i in range(4):', '    forward()', 'magnet_off()'] },
      huyHieu: { ma: 'm3-c1-than', ten: 'Thợ lái xuồng' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();

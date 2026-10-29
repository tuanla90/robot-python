/* ============================================================================
   man-nam-cham-n.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 2 "Nam châm" (KE-HOACH-MUA-3.md; phiên "Mùa 3" tự viết, 29/10).
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3) xếp màn theo dòng chương khai đủ thứ tự.
     - `nam-cham`: chương 1 "Nam châm" một cực N. Màn mới so từ 11 (mã nam-cham.1 … .10 đã có). Thứ tự:
       11 (trình diễn) · 12 · 1 · 4 · 7 · 8 · 14 · 13 · 5 (tạo fetch) · 15 (trùm).
       Cái mới của gói: tay nam châm MỘT cực N (magnet_n, magnet_off; magnet_s mở ở gói 6). Luật nam châm: man-nam-cham.js đầu tệp, san-hoc.js phần NAM CHÂM.
     - `logic-nam-cham`: chương 2 "Logic cho nam châm": and / or với cảm biến khoảng cách (front_clear / left_clear / right_clear).
   Xe hai bánh gắn tay nam châm ở mũi; hàm của em mùa 1, 2 (move, turn_right, turn_left, u_turn, forward(n)…) dùng được.
   Máy kiểm: hoc/kiem-man-mua-3.mjs, hoc/kiem-lo-trinh.mjs mục mùa 3.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var NC_N = ['magnet_n', 'magnet_off'];

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function LAP(n, than) { return ['for i in range(' + n + '):'].concat((Array.isArray(than) ? than : [than]).map(function (s) { return '    ' + s; })); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }

  var HUT = ['magnet_n()', 'wait()'], THA = ['magnet_off()', 'wait()'];

  function man(m) {
    m.chuong = m.chuong || 'nam-cham';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'nam-cham', camBien: m.camBien || [] };
    delete m.camBien;
    m.hamGoc = m.hamGoc || nhieu(BANH, NC_N);
    m.mucTieu = 'dua-vat'; m.vatCan = 'tu';
    m.nhipTheoLoiGiai = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ================================================= chương nam-cham "Nam châm" (cực N) ================================================= */
    man({
      so: 11, ten: 'Hút rồi thả', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'Tay nam châm ở mũi xe. magnet_n() bật cực N: vật sắt cách xe tới 2 ô bị hút bay về dính ở mũi xe. magnet_off() ngắt điện: vật rơi xuống ô ngay trước mũi xe. Bấm Chạy xem vật sắt bay về rồi rơi đúng ô đích.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy.',
      san: ['...', '.o.', '.D.', '...'],
      vatChat: ['...', '.s.', '...', '...'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(nhieu(HUT, THA)),
      loiGiai: bai(nhieu(HUT, THA)),
      sao: { o: 4, nhip: 2 },
      goiY: ['Lệnh nam châm chỉ ra lệnh; wait() cho nhịp trôi để nam châm làm.', 'Vật sắt cách mũi xe 2 ô vẫn bị hút về.']
    }),

    man({
      so: 12, ten: 'Mang vật đi', hang: 'lam-quen', hamCuaEmCan: ['move'],
      deBai: 'Hút vật sắt về mũi xe, chở nó tiến lên hai ô rồi mới ngắt điện để thả vào ô đích. Vật đang dính đi theo xe.',
      veMaMau: 'Chương trình có sẵn hút rồi thả ngay: vật rơi chưa tới đích. Chạy thử rồi sửa.',
      san: ['......', '..oD..', '......'],
      vatChat: ['......', '..s...', '......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(HUT, THA)),
      loiGiai: bai(nhieu(HUT, ['move()', 'move()'], THA)),
      sao: { o: 9, nhip: 4 },
      loiSai: [
        { moTa: 'Tiến trước rồi mới hút: xe đâm vào vật sắt', baiLam: bai(nhieu(['move()', 'move()'], HUT, THA)), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên ngắt điện: vật vẫn dính ở mũi xe', baiLam: bai(nhieu(HUT, ['move()', 'move()'])), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Hút trước, đi sau: vật dính bay theo mũi xe.', 'magnet_off() thả vật xuống ô ngay trước mũi xe.']
    }),

    man({
      so: 13, ten: 'Ba chuyến', hang: 'luyen', hamCuaEmCan: ['move', 'turn_left', 'u_turn'], khung: { chinh: 14, moiHam: 10 },
      deBai: 'Ba vật sắt ở hàng trên, ba ô đích ở hàng dưới. Mỗi chuyến: hút vật phía trước, quay đầu, tiến một ô rồi thả xuống ô đích. Xong một chuyến thì sang cột kế bên phải làm lại. Dùng vòng for cho ba chuyến.',
      veMaMau: 'Chương trình có sẵn làm được chuyến đầu. Đặt nó vào vòng for và thêm đường sang cột kế tiếp.',
      san: ['.o.o.o.', '.......', '.......', '.......', '.D.D.D.'],
      vatChat: ['.s.s.s.', '.......', '.......', '.......', '.......'],
      batDau: { x: 1, y: 2, huong: 0 },
      maMau: bai(nhieu(HUT, ['u_turn()', 'move()'], THA)),
      loiGiai: bai(LAP(3, nhieu(HUT, ['u_turn()', 'move()'], THA, ['turn_left()', 'move()', 'move()', 'turn_left()', 'move()']))),
      sao: { o: 20, nhip: 22 },
      loiSai: [
        { moTa: 'Sang cột kế tiếp mà quên tiến lên một ô: vật sắt thứ hai cách 3 ô, ngoài tầm hút', baiLam: bai(LAP(3, nhieu(HUT, ['u_turn()', 'move()'], THA, ['turn_left()', 'move()', 'move()', 'turn_left()']))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Rẽ phải thay vì rẽ trái: xe đi ra mép sân', baiLam: bai(LAP(3, nhieu(HUT, ['u_turn()', 'move()'], THA, ['turn_right()', 'move()', 'move()', 'turn_left()', 'move()']))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Sau khi thả, xe đang quay mặt xuống: rẽ trái là quay sang phải màn hình.', 'Đi sang hai cột, rẽ trái cho mặt quay lên, tiến một ô để vật sắt cách đúng 2 ô.']
    }),

    man({
      so: 14, ten: 'Hai chuyến', hang: 'luyen', hamCuaEmCan: ['move', 'turn_left', 'u_turn', 'forward'], khung: { chinh: 16, moiHam: 10 },
      deBai: 'Hai vật sắt ở hàng trên cách nhau ba cột, hai ô đích ở hàng dưới. Tiến một ô cho vật sắt đầu cách mũi xe 2 ô. Mỗi chuyến: hút, quay đầu, tiến một ô, thả; rồi sang cột kế tiếp. Dùng vòng for cho hai chuyến.',
      veMaMau: 'Chương trình có sẵn tiến một ô rồi làm được chuyến đầu. Đặt chuyến đó vào vòng for và thêm đường sang cột kế tiếp.',
      san: ['.o..o.', '......', '......', '......', '.D..D.'],
      vatChat: ['.s..s.', '......', '......', '......', '......'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(nhieu(['move()'], HUT, ['u_turn()', 'move()'], THA)),
      loiGiai: bai(nhieu(['move()'], LAP(2, nhieu(HUT, ['u_turn()', 'move()'], THA, ['turn_left()', 'forward(3)', 'turn_left()', 'move()'])))),
      sao: { o: 22, nhip: 15 },
      loiSai: [
        { moTa: 'Sang cột kế tiếp mà quên tiến lên một ô: vật sắt thứ hai cách 3 ô, ngoài tầm hút', baiLam: bai(nhieu(['move()'], LAP(2, nhieu(HUT, ['u_turn()', 'move()'], THA, ['turn_left()', 'forward(3)', 'turn_left()'])))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đi sang hai cột thay vì ba: vật sắt thứ hai không nằm trước mũi xe', baiLam: bai(nhieu(['move()'], LAP(2, nhieu(HUT, ['u_turn()', 'move()'], THA, ['turn_left()', 'forward(2)', 'turn_left()', 'move()'])))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Sau khi thả, xe đang quay mặt xuống: rẽ trái là quay sang phải màn hình.', 'Hai vật cách nhau ba cột: forward(3), rẽ trái, rồi tiến một ô.']
    }),

    man({
      so: 15, ten: 'Kho sắt và vật N', hang: 'trum', khung: { chinh: 12, moiHam: 10 }, hamCuaEmCan: ['fetch', 'move', 'turn_left', 'turn_right', 'forward'],
      deBai: 'Kho có một vật sắt và một vật nam châm chữ N. Vật sắt phải về ô đích ở hàng dưới cùng; vật N phải trượt vào ô đích sát tường bên phải. Cực N hút sắt, còn gặp vật chữ N thì đẩy nó ra xa.',
      veMaMau: 'Chương trình có sẵn mang được vật sắt. Viết tiếp đường đi để đẩy vật N.',
      san: ['.o.....', '...o.D#', '.......', '.......', '.D.....'],
      vatChat: ['.s.....', '...N...', '.......', '.......', '.......'],
      batDau: { x: 1, y: 2, huong: 0 },
      maMau: bai(['fetch()']),
      loiGiai: bai(nhieu(['fetch()', 'turn_left()', 'move()', 'turn_left()', 'forward(2)', 'turn_right()'], HUT)),
      sao: { o: 26, nhip: 11 },
      loiSai: [
        { moTa: 'Đẩy vật N từ quá xa: đứng cách vật ba ô thì vật vẫn trượt nhưng dừng trước ô đích', baiLam: bai(nhieu(['fetch()', 'turn_left()', 'move()', 'turn_left()', 'forward(2)', 'u_turn()', 'move()', 'u_turn()', 'turn_right()'], HUT)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chưa mang vật sắt mà đi đẩy vật N trước: vật sắt còn nằm ngoài đích', baiLam: bai(nhieu(['turn_right()', 'move()', 'turn_left()', 'move()', 'turn_right()'], HUT)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Làm từng việc: fetch() cho vật sắt trước.', 'Đứng sát bên trái vật N, quay mặt sang phải rồi bật cực N: vật trượt tới sát tường.']
    })
  ];

  /* ================================================= chương logic-nam-cham "Logic cho nam châm" (and / or) =================================================
     Thứ tự (MUA_3): 1 (trình diễn and) · che-nam-cham.1 (chế kick) · 2 (ép and, hai sân) · 3 · che-nam-cham.8 · 4 (or) · 5 · 6 · 7 · 8 (trùm).
     Xe có cảm biến khoảng cách ở hông (front_clear / left_clear / right_clear, mùa 1). vaHoac: true bật ô ghép điều kiện hai vế (thanh-phan.js CHE_VH). */
  var CAM = ['front_clear', 'left_clear', 'right_clear'];
  function logic(m) {
    m.chuong = 'logic-nam-cham'; m.vaHoac = true;
    m.camBien = [{ ma: 'khoang-cach', o: 'hong' }];
    m.hamGoc = nhieu(BANH, NC_N, CAM);
    var mt = m.mucTieu; m = man(m);
    if (mt) { m.mucTieu = mt; if (mt !== 'dua-vat') delete m.vatCan; }
    if (Array.isArray(m.san[0])) { if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); }); }
    return m;
  }
  var VA = 'while front_clear() and not right_clear():';
  var BAM = ['while front_clear() or right_clear():', '    if right_clear():', '        turn_right()', '    move()'];

  DS.push(
    logic({
      so: 1, ten: 'Và: đi tới chỗ rẽ', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, mucTieu: 'toi-co', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Điều kiện có thể ghép hai vế bằng and: cả hai vế đúng thì cả điều kiện mới đúng. front_clear() and not right_clear() nghĩa là: trước mặt còn trống VÀ bên phải chưa có lối. Bấm Chạy xem xe dừng đúng chỗ rẽ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy.',
      san: ['######', '......', '###.##', '###F##'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai([VA, '    move()', 'turn_right()', 'move()', 'move()']),
      loiGiai: bai([VA, '    move()', 'turn_right()', 'move()', 'move()']),
      sao: { o: 10, nhip: 6 },
      goiY: ['and: cả hai vế phải đúng.', 'Xe dừng khi gặp tường hoặc khi bên phải có lối.']
    }),

    logic({
      so: 2, ten: 'Lối rẽ có hay không', hang: 'lam-quen', mucTieu: 'bong-mo', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Hai sân: sân 1 có lối rẽ phải giữa hành lang, sân 2 không có lối nào. Đi tới khi gặp lối rẽ hoặc gặp tường; nếu bên phải có lối thì rẽ vào một ô. Xe phải đứng đúng chỗ xe mờ ở cả hai sân.',
      veMaMau: 'Chương trình có sẵn chỉ hỏi front_clear(). Chạy thử: sân 1 xe đi quá chỗ rẽ. Chạm vào điều kiện của while để ghép thêm một vế bằng and.',
      san: [['######', '......', '##.###', '######'], ['######', '......', '######', '######']],
      batDau: { x: 0, y: 1, huong: 1 },
      bongMo: [{ x: 2, y: 2, huong: 2 }, { x: 5, y: 1, huong: 1 }],
      maMau: bai(['while front_clear():', '    move()', 'if right_clear():', '    turn_right()', '    move()']),
      loiGiai: bai([VA, '    move()', 'if right_clear():', '    turn_right()', '    move()']),
      sao: { o: 10, nhip: 5 },
      loiSai: [
        { moTa: 'Chỉ hỏi not right_clear(): sân 2 không có lối nào nên xe húc tường mãi', baiLam: bai(['while not right_clear():', '    move()', 'if right_clear():', '    turn_right()', '    move()']), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Ghép bằng or: chỉ cần một vế đúng là xe vẫn đi, sân 1 đi quá chỗ rẽ', baiLam: bai(['while front_clear() or not right_clear():', '    move()', 'if right_clear():', '    turn_right()', '    move()']), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Xe phải dừng ở chỗ đầu tiên mà trước mặt là tường HOẶC bên phải có lối.', 'Đi tiếp khi: front_clear() and not right_clear().']
    }),

    logic({
      so: 3, ten: 'Vật trong hốc', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Hai sân, mỗi sân một hốc bên phải hành lang, trong hốc có một vật sắt cách miệng hốc 2 ô. Đi tới miệng hốc, quay vào hốc, hút vật sắt ra, rồi quay lại hướng cũ và thả vào ô đích ngay phía trước.',
      veMaMau: 'Chương trình có sẵn tới đúng miệng hốc. Viết tiếp phần hút và thả.',
      san: [['#######', '...D...', '##.####', '##o####'], ['#######', '.....D.', '####.##', '####o##']],
      vatChat: [['.......', '.......', '.......', '..s....'], ['.......', '.......', '.......', '....s..']],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai([VA, '    move()']),
      loiGiai: bai([VA, '    move()', 'turn_right()', 'magnet_n()', 'wait()', 'turn_left()', 'magnet_off()', 'wait()']),
      sao: { o: 15, nhip: 8 },
      loiSai: [
        { moTa: 'Rẽ trái thay vì rẽ phải: mũi xe chĩa vào tường, không hút được gì', baiLam: bai([VA, '    move()', 'turn_left()', 'magnet_n()', 'wait()', 'turn_right()', 'magnet_off()', 'wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên quay lại: vật rơi về chỗ cũ trong hốc', baiLam: bai([VA, '    move()', 'turn_right()', 'magnet_n()', 'wait()', 'magnet_off()', 'wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Ở miệng hốc rẽ phải là mũi xe chĩa vào hốc: vật sắt cách 2 ô, hút được.', 'Rẽ trái để quay về hướng cũ, rồi thả: vật rơi xuống ô ngay trước mũi xe.']
    }),

    logic({
      so: 4, ten: 'Hoặc: bám tường phải', hang: 'luyen', mucTieu: 'bong-mo', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Ghép bằng or thì chỉ cần MỘT vế đúng. Xe đi theo lối: còn trước mặt trống HOẶC bên phải có lối thì đi tiếp; bên phải có lối thì rẽ phải trước. Tới ngõ cụt (cả hai đều chặn) thì dừng. Hai sân, đường khác nhau.',
      veMaMau: 'Chương trình có sẵn chỉ hỏi front_clear(): tới góc đầu tiên là xe dừng. Ghép thêm vế or right_clear().',
      san: [['.....#', '####..', '####..', '##....', '..####'], ['...###', '##.###', '...###', '######', '######']],
      batDau: { x: 0, y: 0, huong: 1 },
      bongMo: [{ x: 2, y: 3, huong: 3 }, { x: 0, y: 2, huong: 3 }],
      maMau: bai(['while front_clear():', '    if right_clear():', '        turn_right()', '    move()']),
      loiGiai: bai(BAM),
      sao: { o: 9, nhip: 11 },
      loiSai: [
        { moTa: 'Ghép bằng and: tới góc thì trước mặt là tường nên xe dừng luôn', baiLam: bai(['while front_clear() and right_clear():', '    if right_clear():', '        turn_right()', '    move()']), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên rẽ: bên phải có lối mà xe cứ đi thẳng, húc tường', baiLam: bai(['while front_clear() or right_clear():', '    move()']), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['or: một trong hai vế đúng là đủ để đi tiếp.', 'Trong vòng lặp: bên phải có lối thì rẽ phải, rồi tiến một ô.']
    }),

    logic({
      so: 5, ten: 'Đá vật ở ngõ cụt', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right', 'kick'],
      deBai: 'Xe bám tường phải đi tới ngõ cụt; ở đó một vật nam châm chữ N chắn trước mũi xe. Dùng hàm kick() của em để đá vật trượt vào ô đích. Hai sân, đường khác nhau.',
      veMaMau: 'Chương trình có sẵn bám tường tới ngõ cụt. Viết tiếp một dòng.',
      san: [['.....#', '####..', '####..', 'Do....', '....##'], ['...###', '##.###', '##o###', '##.###', '##D###']],
      vatChat: [['......', '......', '......', '.N....', '......'], ['......', '......', '..N...', '......', '......']],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(BAM),
      loiGiai: bai(BAM.concat(['kick()'])),
      sao: { o: 14, nhip: 12 },
      loiSai: [
        { moTa: 'Chỉ hỏi front_clear(): tới góc đầu tiên là xe dừng, còn xa vật', baiLam: bai(['while front_clear():', '    if right_clear():', '        turn_right()', '    move()', 'kick()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vật nằm chắn trước mũi xe nên front_clear() là False: xe dừng ngay trước vật.', 'kick() bật cực N rồi ngắt: vật chữ N bị đẩy trượt đi.']
    }),

    logic({
      so: 6, ten: 'Ba kho, một điều kiện', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Ba sân, mỗi sân hốc chứa vật sắt nằm ở một chỗ khác. Chương trình có sẵn viết điều kiện sai nên xe chạy mãi. Sửa điều kiện của while cho xe dừng đúng ở miệng hốc rồi lấy vật như màn Vật trong hốc.',
      veMaMau: 'Chạy thử: xe húc tường mãi không dừng. Chạm chữ or để đổi thành and.',
      san: [['#######', '..D....', '#.#####', '#o#####'], ['#######', '....D..', '###.###', '###o###'], ['#######', '......D', '#####.#', '#####o#']],
      vatChat: [['.......', '.......', '.......', '.s.....'], ['.......', '.......', '.......', '...s...'], ['.......', '.......', '.......', '.....s.']],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['while front_clear() or not right_clear():', '    move()', 'turn_right()', 'magnet_n()', 'wait()', 'turn_left()', 'magnet_off()', 'wait()']),
      loiGiai: bai([VA, '    move()', 'turn_right()', 'magnet_n()', 'wait()', 'turn_left()', 'magnet_off()', 'wait()']),
      sao: { o: 15, nhip: 9 },
      loiSai: [
        { moTa: 'Chỉ hỏi front_clear(): xe đi tới tường cuối hành lang, quá miệng hốc', baiLam: bai(['while front_clear():', '    move()', 'turn_right()', 'magnet_n()', 'wait()', 'turn_left()', 'magnet_off()', 'wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['or: chỉ cần một vế đúng là đi tiếp, nên tới miệng hốc xe vẫn đi.', 'and: phải cả hai vế đúng, nên bên phải có lối là xe dừng.']
    }),

    logic({
      so: 7, ten: 'Hàm to_turn()', hang: 'bien-the', mucTieu: 'bong-mo', hamCuaEmCan: ['move', 'turn_right'], taoHam: ['to_turn'],
      deBai: 'Tạo hàm to_turn(): đi thẳng tới khi trước mặt là tường hoặc bên phải có lối. Hành lang có hai chỗ rẽ phải, mỗi chỗ đường thẳng vẫn chạy tiếp nên phải dừng đúng chỗ rẽ. Hai sân, chỗ rẽ khác nhau.',
      veMaMau: 'Chương trình có sẵn gọi to_turn() ba lần; sau mỗi lần rẽ phải xe tiến một ô (vừa rẽ xong thì bên phải là đường cũ). Tạo hàm to_turn.',
      san: [['.......', '###.###', '###.###', '....###', '###.###'], ['.......', '#####.#', '#####.#', '##....#', '#####.#']],
      batDau: { x: 0, y: 0, huong: 1 },
      bongMo: [{ x: 0, y: 3, huong: 3 }, { x: 2, y: 3, huong: 3 }],
      maMau: bai(['to_turn()', 'turn_right()', 'move()', 'to_turn()', 'turn_right()', 'move()', 'to_turn()']),
      loiGiai: bai(['to_turn()', 'turn_right()', 'move()', 'to_turn()', 'turn_right()', 'move()', 'to_turn()'], { hamCuaEmMoi: [H('to_turn', [], [VA, '    move()'])] }),
      sao: { o: 14, nhip: 13 },
      loiSai: [
        { moTa: 'Chưa tạo hàm to_turn mà đã gọi nó', baiLam: bai(['to_turn()', 'turn_right()', 'move()', 'to_turn()', 'turn_right()', 'move()', 'to_turn()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm chỉ hỏi front_clear(): xe đi quá chỗ rẽ', baiLam: bai(['to_turn()', 'turn_right()', 'move()', 'to_turn()', 'turn_right()', 'move()', 'to_turn()']), hamCuaEmMoi: [H('to_turn', [], ['while front_clear():', '    move()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Thân hàm hai dòng: while front_clear() and not right_clear(): rồi move().', 'Mỗi lần gọi, xe dừng ở chỗ rẽ phải đầu tiên.']
    }),

    logic({
      so: 8, ten: 'Kho mê cung', hang: 'trum', hamCuaEmCan: ['move', 'turn_right', 'kick'],
      deBai: 'Ba kho, mỗi kho một mê cung khác nhau. Ở cuối đường mỗi kho có một vật nam châm chữ N chắn trước mũi xe; phía sau nó là ô đích. Một chương trình phải đưa vật vào đích ở cả ba kho.',
      veMaMau: 'Chương trình có sẵn mới đi thẳng. Viết đường bám tường bằng or rồi đá vật.',
      san: [['.....#', '####..', '####..', 'Do....', '....##'], ['...###', '##.###', '##o###', '##.###', '##D###'], ['......', '#####.', '#####.', '#####.', '#####o', '#####D']],
      vatChat: [['......', '......', '......', '.N....', '......'], ['......', '......', '..N...', '......', '......'], ['......', '......', '......', '......', '.....N', '......']],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['while front_clear():', '    move()']),
      loiGiai: bai(BAM.concat(['kick()'])),
      sao: { o: 14, nhip: 12 },
      loiSai: [
        { moTa: 'Bám tường bằng and: tới góc là xe dừng', baiLam: bai(['while front_clear() and right_clear():', '    if right_clear():', '        turn_right()', '    move()', 'kick()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên đá vật: xe dừng đúng chỗ nhưng vật còn nằm ngoài đích', baiLam: bai(BAM), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Mọi kho đều đi được bằng cách bám tường phải.', 'Ở ngõ cụt vật chắn trước mũi xe: kick() đá nó vào đích.']
    })
  );

  ManHoc.manNamChamN = DS;
  if (laNode) module.exports = ManHoc;
})();

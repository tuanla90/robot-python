/* ============================================================================
   man-doc-cuc.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 7 "Đọc cực" (KE-HOACH-MUA-3.md). HIỆN CHƯA CÓ MÀN.
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `doc-cuc`: chương 1 "Đọc cực" front_pole() (2 màn có sẵn: nam-cham.6, trùm nam-cham.10: màn mới chen TRƯỚC trùm)
     - `che-doc-cuc`: chương 2 "Hàm đọc cực" (7 màn có sẵn của che-nam-cham, trùm che-nam-cham.10: màn mới chen TRƯỚC trùm)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản, KHÔNG trùng mã đã có. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Màn mới nối SAU các màn có sẵn của chương (chen trước
   màn trùm có sẵn nếu màn cuối có sẵn là trùm); muốn xen giữa thì sửa đúng dòng chương đó trong MUA_3. Chương còn trống thì chưa hiện.
   Ràng buộc mùa 3 (hoc/kiem-lo-trinh.mjs mục mùa 3): thân hai bánh / xích / nhện; tay mùa 1–2 + nam châm; cảm biến mùa 1–2 + cảm ứng từ;
   không omni, drone, camera, máy sơn, máy ném, color(); không bậc thang S. Chuỗi làm dữ liệu chỉ từ gói 1 chương 2, and / or chỉ từ gói 2 chương 2;
   magnet_s từ gói 6, front_metal từ gói 3, front_pole từ gói 7, crouch / stand / jump / leap từ gói 5; hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manDocCuc, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  // 29–30/10 phiên Mùa 3. Gói 7 "Đọc cực": cái mới là front_pole() trả CHUỖI "N" / "S" (cực của vật nam châm đầu tiên trong 3 ô) hay "none"; so chuỗi bằng ==,
  // elif, biến giữ chuỗi đọc từ cảm biến, hàm nhận chuỗi. grip() (nam-cham.6) bật cực khác chữ để kéo.
  // Chương doc-cuc (MUA_3): 1 (trình diễn) · 2 · nam-cham.6 (tạo grip) · 3 · 4 · 5 · 6 · 7 · 8 · nam-cham.10 (trùm).
  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var GOC = BANH.concat(['magnet_n', 'magnet_s', 'magnet_off', 'front_clear', 'left_clear', 'right_clear', 'front_metal', 'front_pole']);
  var HN = ['magnet_n()', 'wait()'], HS = ['magnet_s()', 'wait()'], THA = ['magnet_off()', 'wait()'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function man(m) {
    m.chuong = m.chuong || 'doc-cuc'; m.cauTruc = ['for', 'if', 'while']; m.vaHoac = true;
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'nam-cham', camBien: [{ ma: 'khoang-cach', o: 'hong' }, { ma: 'tu', o: 'hong' }] };
    m.hamGoc = m.hamGoc || GOC;
    m.mucTieu = 'dua-vat'; m.vatCan = 'tu';
    m.nhipTheoLoiGiai = true; m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 12, moiHam: 10 }; m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || ['move', 'turn_right', 'turn_left', 'u_turn'];
    if (Array.isArray(m.san[0]) && !Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    return ManHoc.chuanHoa(m);
  }
  var KEO = ['if front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'wait()'];          // như thân grip()
  var DAY = ['if front_pole() == "N":', '    magnet_n()', 'else:', '    magnet_s()', 'wait()'];          // bật cùng cực: đẩy
  var CHIA = ['p = front_pole()', 'grip()', 'if p == "N":', '    turn_left()', 'elif p == "S":', '    turn_right()', 'else:', '    u_turn()'];

  var DS = [
    man({
      so: 1, ten: 'Đọc chữ trên vật', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'front_pole() đọc chữ trên vật nam châm đầu tiên trước mũi xe (trong 3 ô) và trả về một CHUỖI: "N" hay "S"; không có vật nam châm thì là "none". So chuỗi bằng ==. Bấm Chạy: xe đọc được chữ S nên bật cực N để kéo vật về rồi thả.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy.',
      san: ['...', '.o.', '.D.', '...'], vatChat: ['...', '.S.', '...', '...'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(nhieu(['if front_pole() == "S":'], ['    magnet_n()', '    wait()'], THA)),
      loiGiai: bai(nhieu(['if front_pole() == "S":'], ['    magnet_n()', '    wait()'], THA)),
      sao: { o: 5, nhip: 2 },
      goiY: ['front_pole() trả chuỗi có ngoặc kép: "N", "S" hay "none".', 'Chữ trên vật là cực quay về phía xe.']
    }),

    man({
      so: 2, ten: 'Chữ N hay chữ S', hang: 'lam-quen',
      deBai: 'Hai sân: vật trước mặt ghi chữ N ở sân 1, chữ S ở sân 2. Đọc chữ bằng front_pole(), bật cực KHÁC chữ để kéo vật về, rẽ phải rồi thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn lúc nào cũng bật cực S. Chạy thử: sân 2 vật bị đẩy đi. Thêm if / else.',
      san: [['###', '#o#', '#.#', '#.D'], ['###', '#o#', '#.#', '#.D']], vatChat: [['...', '.N.', '...', '...'], ['...', '.S.', '...', '...']],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(nhieu(HS, ['turn_right()'], THA)),
      loiGiai: bai(nhieu(KEO, ['turn_right()'], THA)),
      sao: { o: 10, nhip: 3 },
      loiSai: [
        { moTa: 'So với chữ thường "n": không khớp nên luôn bật cực N', baiLam: bai(nhieu(['if front_pole() == "n":', '    magnet_s()', 'else:', '    magnet_n()', 'wait()', 'turn_right()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Chữ N thì bật cực S; còn lại bật cực N.', 'Phần thả viết một lần sau if / else.']
    }),

    man({
      so: 3, ten: 'Đẩy theo chữ', hang: 'luyen',
      deBai: 'Hai sân, vật nam châm nằm ngay trước mũi xe, ô đích sát bức tường phía xa. Đọc chữ trên vật rồi bật CÙNG cực để đẩy nó trượt vào ô đích.',
      veMaMau: 'Chương trình có sẵn kéo vật về. Đổi lại cho đẩy.',
      san: [['#####', '.o.D#', '#####'], ['#####', '.o.D#', '#####']], vatChat: [['.....', '.N...', '.....'], ['.....', '.S...', '.....']],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(KEO),
      loiGiai: bai(DAY),
      sao: { o: 5, nhip: 1 },
      loiSai: [
        { moTa: 'Lúc nào cũng bật cực N: sân 2 vật chữ S bị hút về', baiLam: bai(HN), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Cùng chữ thì đẩy: N bật N, S bật S.', 'Vật trượt tới khi gặp tường.']
    }),

    man({
      so: 4, ten: 'Biến giữ cực', hang: 'luyen', hamCuaEmCan: ['grip', 'turn_left', 'turn_right'],
      deBai: 'Hai sân. Vật chữ N phải về ô đích ĐỎ bên trái xe, vật chữ S về ô đích XANH bên phải (ô đích màu chỉ nhận vật cùng màu: vật N màu đỏ, vật S màu xanh). Đọc chữ vào biến trước (p = front_pole()), kéo vật về bằng grip(), rồi rẽ theo p và thả.',
      veMaMau: 'Chương trình có sẵn đọc chữ vào p rồi kéo vật. Viết tiếp phần rẽ theo p.',
      san: [['#####', '##o##', '##.##', '#D.D#'], ['#####', '##o##', '##.##', '#D.D#']], vatChat: [['.....', '..N..', '.....', '.....'], ['.....', '..S..', '.....', '.....']],
      mau: [['.....', '.....', '.....', '.r.b.'], ['.....', '.....', '.....', '.r.b.']],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: bai(['p = front_pole()', 'grip()']),
      loiGiai: bai(nhieu(['p = front_pole()', 'grip()', 'if p == "N":', '    turn_left()', 'else:', '    turn_right()'], THA)),
      sao: { o: 17, nhip: 3 },
      loiSai: [
        { moTa: 'Rẽ ngược: vật N sang phải, vật S sang trái', baiLam: bai(nhieu(['p = front_pole()', 'grip()', 'if p == "N":', '    turn_right()', 'else:', '    turn_left()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đọc chữ vào p trước, rồi mới kéo.', 'p giữ chuỗi "N" hay "S" cho tới cuối chương trình.']
    }),

    man({
      so: 5, ten: 'Tới khi thấy vật nam châm', hang: 'luyen', hamCuaEmCan: ['grip', 'move', 'u_turn'],
      deBai: 'Hai sân, cuối hành lang là một vật nam châm, xa gần khác nhau. Đi tới khi front_pole() đọc được chữ (không còn "none"), kéo vật về bằng grip(), quay đầu, thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn đi cứng hai ô. Thay bằng while.',
      san: [['########', 'D...o...', '########'], ['########', '.D...o..', '########']], vatChat: [['........', '....N...', '........'], ['........', '.....S..', '........']],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['move()', 'move()', 'grip()', 'u_turn()'].concat(THA)),
      loiGiai: bai(nhieu(['while front_pole() == "none":', '    move()', 'grip()', 'u_turn()'], THA)),
      sao: { o: 17, nhip: 5 },
      loiSai: [
        { moTa: 'Đi tới khi trước mặt hết trống: xe sát vật rồi mới kéo, thả lệch', baiLam: bai(nhieu(['while front_clear():', '    move()', 'grip()', 'u_turn()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['front_pole() thấy vật nam châm cách tới 3 ô.', 'Đi tiếp khi nó còn trả "none".']
    }),

    man({
      so: 6, ten: 'Ba cửa phân loại', hang: 'bien-the', hamCuaEmCan: ['grip', 'turn_left', 'turn_right', 'u_turn'],
      deBai: 'Ba sân: vật trước mặt là vật chữ N, vật chữ S hoặc vật sắt. Vật N về ô đích bên trái, vật S về ô đích bên phải, vật sắt về ô đích phía sau. Đọc chữ vào p, kéo vật về, rồi dùng if / elif / else để rẽ cho đúng.',
      veMaMau: 'Chương trình có sẵn mới chia hai đường. Thêm nhánh elif.',
      san: [['##o##', '##.##', '#D.D#', '##D##'], ['##o##', '##.##', '#D.D#', '##D##'], ['##o##', '##.##', '#D.D#', '##D##']],
      vatChat: [['..N..', '.....', '.....', '.....'], ['..S..', '.....', '.....', '.....'], ['..s..', '.....', '.....', '.....']],
      mau: [['.....', '.....', '.r.b.', '.....'], ['.....', '.....', '.r.b.', '.....'], ['.....', '.....', '.r.b.', '.....']],
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(nhieu(['p = front_pole()', 'grip()', 'if p == "N":', '    turn_left()', 'else:', '    turn_right()'], THA)),
      loiGiai: bai(nhieu(CHIA, THA)),
      sao: { o: 22, nhip: 3 },
      loiSai: [
        { moTa: 'Thiếu nhánh cho vật sắt: sắt cũng bị mang sang phải', baiLam: bai(nhieu(['p = front_pole()', 'grip()', 'if p == "N":', '    turn_left()', 'else:', '    turn_right()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vật sắt không có chữ: front_pole() trả "none".', 'if p == "N" · elif p == "S" · else.']
    }),

    man({
      so: 7, ten: 'Sửa chữ hoa', hang: 'bien-the', hamCuaEmCan: ['grip', 'turn_left', 'turn_right', 'u_turn'],
      deBai: 'Hai sân: vật chữ N về ô đích đỏ bên trái, vật chữ S về ô đích xanh bên phải. Chương trình có sẵn viết chữ "s" thường nên vật S không bao giờ khớp. Sửa cho đúng.',
      veMaMau: 'Chạy thử: sân 2 vật S bị mang ra phía sau. Chạm chữ "s" để sửa.',
      san: [['##o##', '##.##', '#D.D#', '#####'], ['##o##', '##.##', '#D.D#', '#####']],
      vatChat: [['..N..', '.....', '.....', '.....'], ['..S..', '.....', '.....', '.....']],
      mau: [['.....', '.....', '.r.b.', '.....'], ['.....', '.....', '.r.b.', '.....']],
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(nhieu(['p = front_pole()', 'grip()', 'if p == "N":', '    turn_left()', 'elif p == "s":', '    turn_right()', 'else:', '    u_turn()'], THA)),
      loiGiai: bai(nhieu(CHIA, THA)),
      sao: { o: 19, nhip: 3 },
      loiSai: [
        { moTa: 'Đổi thành "none": vật S lại rơi vào else', baiLam: bai(nhieu(['p = front_pole()', 'grip()', 'if p == "N":', '    turn_left()', 'elif p == "none":', '    turn_right()', 'else:', '    u_turn()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['front_pole() trả chữ HOA: "N", "S".', 'Chuỗi phải giống hệt từng chữ mới bằng nhau.']
    }),

    man({
      so: 8, ten: 'Hành lang phân loại', hang: 'bien-the', khung: { chinh: 14, moiHam: 10 }, hamCuaEmCan: ['grip', 'move', 'turn_left', 'turn_right', 'u_turn'],
      deBai: 'Ba sân. Đi hết hành lang tới ngã ba, ở đó một vật chữ N, chữ S hoặc vật sắt chắn trước mũi xe. Đọc chữ, kéo vật, rồi phân loại như màn Ba cửa: N sang trái, S sang phải, sắt ra phía sau.',
      veMaMau: 'Chương trình có sẵn phân loại được nhưng chưa đi tới ngã ba.',
      san: [['#######', '###o###', '##D.D##', '###D###', '###.###', '###.###', '###.###'], ['#######', '###o###', '##D.D##', '###D###', '###.###', '###.###', '###.###'], ['#######', '###o###', '##D.D##', '###D###', '###.###', '###.###', '###.###']],
      vatChat: [['.......', '...N...', '.......', '.......', '.......', '.......', '.......'], ['.......', '...S...', '.......', '.......', '.......', '.......', '.......'], ['.......', '...s...', '.......', '.......', '.......', '.......', '.......']],
      mau: [['.......', '.......', '..r.b..', '.......', '.......', '.......', '.......'], ['.......', '.......', '..r.b..', '.......', '.......', '.......', '.......'], ['.......', '.......', '..r.b..', '.......', '.......', '.......', '.......']],
      batDau: { x: 3, y: 6, huong: 0 },
      maMau: bai(nhieu(CHIA, THA)),
      loiGiai: bai(nhieu(['while front_clear():', '    move()'], CHIA, THA)),
      sao: { o: 27, nhip: 7 },
      loiSai: [
        { moTa: 'Quên đi tới ngã ba: xe phân loại khi vật còn xa', baiLam: bai(nhieu(CHIA, THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đi tới khi vật chắn trước mặt: while front_clear().', 'Tới ngã ba rồi mới đọc chữ vào p.']
    }),

    man({
      // 30/10 nghiệm thu độc lập: trùm chương Đọc cực (trước: nam-cham.10, không đòi biến p hay elif, nay rời mùa 3). Bản nâng của doc-cuc.8:
      // ba hành lang DÀI KHÁC NHAU (viết số bước cứng là sai sân), vật ở ngã ba khác nhau từng sân; đọc p, ba nhánh N trái / S phải / sắt ra sau.
      so: 9, ten: 'Ba ngã ba, ba độ dài', hang: 'trum', khung: { chinh: 16, moiHam: 10 }, hamCuaEmCan: ['grip', 'move', 'turn_left', 'turn_right', 'u_turn'],
      deBai: 'Trùm Đọc cực. Ba sân, hành lang dài ngắn khác nhau, cuối hành lang là ngã ba có vật chữ N, chữ S hoặc vật sắt. Đi tới khi vật chắn trước mũi, đọc chữ vào p, kéo vật, rồi phân loại: N sang ô đích đỏ bên trái, S sang ô đích xanh bên phải, sắt ra ô đích phía sau.',
      veMaMau: 'Chương trình có sẵn đi đúng bốn ô rồi chỉ chia hai đường. Chạy thử từng sân rồi sửa.',
      san: [
        ['#######', '###o###', '##D.D##', '###D###', '###.###', '#######'],
        ['#######', '###o###', '##D.D##', '###D###', '###.###', '###.###', '###.###', '###.###', '#######'],
        ['#######', '###o###', '##D.D##', '###D###', '###.###', '###.###', '###.###', '#######']
      ],
      vatChat: [
        ['.......', '...S...', '.......', '.......', '.......', '.......'],
        ['.......', '...s...', '.......', '.......', '.......', '.......', '.......', '.......', '.......'],
        ['.......', '...N...', '.......', '.......', '.......', '.......', '.......', '.......']
      ],
      mau: [
        ['.......', '.......', '..r.b..', '.......', '.......', '.......'],
        ['.......', '.......', '..r.b..', '.......', '.......', '.......', '.......', '.......', '.......'],
        ['.......', '.......', '..r.b..', '.......', '.......', '.......', '.......', '.......']
      ],
      batDau: [{ x: 3, y: 4, huong: 0 }, { x: 3, y: 7, huong: 0 }, { x: 3, y: 6, huong: 0 }],
      maMau: bai(nhieu(['for i in range(4):', '    move()', 'p = front_pole()', 'grip()', 'if p == "N":', '    turn_left()', 'else:', '    turn_right()'], THA)),
      loiGiai: bai(nhieu(['while front_clear():', '    move()'], CHIA, THA)),
      sao: { o: 27, nhip: 8 },
      loiSai: [
        { moTa: 'Đi đúng bốn ô: sân 1 đâm vào vật ở ngã ba', baiLam: bai(nhieu(['for i in range(4):', '    move()'], CHIA, THA)), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Chỉ hai nhánh: vật sắt bị đưa sang phải', baiLam: bai(nhieu(['while front_clear():', '    move()', 'p = front_pole()', 'grip()', 'if p == "N":', '    turn_left()', 'else:', '    turn_right()'], THA)), phaiCoMa: ['dat-sai-mau'] }
      ],
      goiY: ['Hành lang mỗi sân một độ dài: while front_clear() đi tới đúng ngã ba.', 'Ba khả năng thì ba nhánh: if, elif, else.']
    })
  ];

  /* ================================================= chương che-doc-cuc "Hàm đọc cực" (7 màn có sẵn + 3 mới) =================================================
     Thứ tự (MUA_3): 1 (trình diễn) · 2 (tạo sort_drop(p)) · 3 · che-nam-cham.2 · .7 · .4 · .5 · .9 · .3 · .10 (trùm).
     Hàm của em mới: sort_drop(p) nhận CHUỖI p ("N" / "S"): rẽ trái nếu p là "N", không thì rẽ phải, rồi thả. */
  function che(m) { m.chuong = 'che-doc-cuc'; return man(m); }
  var T_SORT = ['if p == \"N\":', '    turn_left()', 'else:', '    turn_right()', 'magnet_off()', 'wait()'];
  var MAU_2 = ['.....', '.....', '.r.b.', '.....'];

  DS.push(
    che({
      so: 1, ten: 'Hàm có if bên trong', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoaHamMan: ['catch'],
      deBai: 'Hàm catch() của màn tự đọc chữ trên vật rồi bật cực khác để kéo. Chương trình chính không cần biết vật là N hay S. Bấm Chạy.',
      veMaMau: 'Chương trình và hàm của màn đã viết sẵn, khoá. Mở Xưởng xem catch(), rồi bấm Chạy.',
      san: ['###', '#o#', '#.#', '#.D'], vatChat: ['...', '.N.', '...', '...'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(nhieu(['catch()', 'turn_right()'], THA), { hamCuaMan: [H('catch', [], KEO)] }),
      loiGiai: bai(nhieu(['catch()', 'turn_right()'], THA), { hamCuaMan: [H('catch', [], KEO)] }),
      sao: { o: 11, nhip: 3 },
      goiY: ['Hàm có thể chứa if / else và đọc cảm biến bên trong.', 'Màn sau em tạo hàm nhận một chuỗi.']
    }),

    che({
      so: 2, ten: 'Hàm sort_drop(p)', hang: 'lam-quen', taoHam: ['sort_drop'], hamCuaEmCan: ['grip', 'turn_left', 'turn_right'],
      deBai: 'Tạo hàm sort_drop(p) nhận chuỗi p: p là \"N\" thì rẽ trái, không thì rẽ phải, rồi thả vật. Hai sân: vật N về ô đỏ bên trái, vật S về ô xanh bên phải.',
      veMaMau: 'Chương trình có sẵn đọc chữ vào p, kéo vật, rồi gọi sort_drop(p). Tạo hàm sort_drop có đối số p.',
      san: [['#.o.#', '#...#', '#D.D#', '#...#'], ['#.o.#', '#...#', '#D.D#', '#...#']],
      vatChat: [['..N..', '.....', '.....', '.....'], ['..S..', '.....', '.....', '.....']],
      mau: [MAU_2, MAU_2],
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(['p = front_pole()', 'grip()', 'sort_drop(p)']),
      loiGiai: bai(['p = front_pole()', 'grip()', 'sort_drop(p)'], { hamCuaEmMoi: [H('sort_drop', ['p'], T_SORT)] }),
      sao: { o: 18, nhip: 3 },
      loiSai: [
        { moTa: 'Chưa tạo hàm sort_drop mà đã gọi nó', baiLam: bai(['p = front_pole()', 'grip()', 'sort_drop(p)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm so với \"S\" mà vẫn rẽ trái: vật S sang ô đỏ', baiLam: bai(['p = front_pole()', 'grip()', 'sort_drop(p)']), hamCuaEmMoi: [H('sort_drop', ['p'], ['if p == \"S\":', '    turn_left()', 'else:', '    turn_right()', 'magnet_off()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đối số p là chuỗi được truyền vào: \"N\" hay \"S\".', 'Thân hàm: if p == \"N\": rẽ trái, else: rẽ phải, rồi thả.']
    }),

    che({
      so: 3, ten: 'Phân loại cuối hành lang', hang: 'lam-quen', hamCuaEmCan: ['grip', 'move', 'sort_drop'],
      deBai: 'Hai sân. Đi hết hành lang tới ngã ba, vật chữ N hoặc S chắn trước mũi xe. Đọc chữ, kéo vật, rồi dùng sort_drop(p).',
      veMaMau: 'Chương trình có sẵn mới đi tới ngã ba. Viết tiếp.',
      san: [['###o###', '##D.D##', '###.###', '###.###', '.......', '#.....#'], ['###o###', '##D.D##', '###.###', '###.###', '.......', '#.....#']],
      vatChat: [['...N...', '.......', '.......', '.......', '.......', '.......'], ['...S...', '.......', '.......', '.......', '.......', '.......']],
      mau: [['.......', '..r.b..', '.......', '.......', '.......', '.......'], ['.......', '..r.b..', '.......', '.......', '.......', '.......']],
      batDau: { x: 3, y: 5, huong: 0 },
      maMau: bai(['while front_clear():', '    move()']),
      loiGiai: bai(['while front_clear():', '    move()', 'p = front_pole()', 'grip()', 'sort_drop(p)']),
      sao: { o: 23, nhip: 7 },
      loiSai: [
        { moTa: 'Đọc chữ trước khi đi: vật còn xa nên p là \"none\", vật nào cũng sang phải', baiLam: bai(['p = front_pole()', 'while front_clear():', '    move()', 'grip()', 'sort_drop(p)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đi tới khi vật chắn trước mặt rồi mới đọc chữ.', 'sort_drop(p) làm phần rẽ và thả.']
    })
  );

  ManHoc.manDocCuc = DS;
  if (laNode) module.exports = ManHoc;
})();

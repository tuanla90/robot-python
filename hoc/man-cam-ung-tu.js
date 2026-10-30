/* ============================================================================
   man-cam-ung-tu.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 3 "Cảm biến từ" (KE-HOACH-MUA-3.md; phiên "Mùa 3" tự viết, 29/10).
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `cam-ung-tu`: chương 1 "Cảm ứng từ" front_metal() (chưa có màn)
     - `che-cam-ung-tu`: chương 2 "Hàm cho cảm ứng từ" (chưa có màn)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản, KHÔNG trùng mã đã có. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Màn mới nối SAU các màn có sẵn của chương (chen trước
   màn trùm có sẵn nếu màn cuối có sẵn là trùm); muốn xen giữa thì sửa đúng dòng chương đó trong MUA_3. Chương còn trống thì chưa hiện.
   Ràng buộc mùa 3 (hoc/kiem-lo-trinh.mjs mục mùa 3): thân hai bánh / xích / nhện; tay mùa 1–2 + nam châm; cảm biến mùa 1–2 + cảm ứng từ;
   không omni, drone, camera, máy sơn, máy ném, color(); không bậc thang S. Chuỗi làm dữ liệu chỉ từ gói 1 chương 2, and / or chỉ từ gói 2 chương 2;
   magnet_s từ gói 6, front_metal từ gói 3, front_pole từ gói 7, crouch / stand / jump / leap từ gói 5; hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manCamUngTu, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var GOC = BANH.concat(['magnet_n', 'magnet_off', 'front_clear', 'left_clear', 'right_clear', 'front_metal']);
  var HUT = ['magnet_n()', 'wait()'], THA = ['magnet_off()', 'wait()'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function thut(ds, n) { var p = new Array((n || 1) * 4 + 1).join(' '); return ds.map(function (s) { return p + s; }); }

  function man(m) {
    m.chuong = m.chuong || 'cam-ung-tu';
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'nam-cham', camBien: [{ ma: 'khoang-cach', o: 'hong' }, { ma: 'tu', o: 'hong' }] };
    m.hamGoc = m.hamGoc || GOC;
    m.mucTieu = 'dua-vat'; m.vatCan = 'sat';
    m.nhipTheoLoiGiai = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 12, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || ['move', 'turn_right', 'turn_left', 'u_turn'];
    if (Array.isArray(m.san[0]) && !Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    return ManHoc.chuanHoa(m);
  }

  var SEEK = ['while not front_metal():', '    move()'];
  var LAY = nhieu(HUT, ['u_turn()'], THA);                       // hút vật trước mặt, quay đầu, thả xuống ô trước mũi (ô sau lưng lúc đầu)
  var VA_TU = 'while front_clear() and not front_metal():';
  var DONG_RE = ['if not front_metal():', '    turn_right()'];

  var DS = [
    /* ================================================= chương cam-ung-tu "Dò sắt" =================================================
       Cái mới: front_metal() True khi vật ĐẦU TIÊN trước mũi xe là SẮT và cách xe ≤ 2 ô (gỗ, vật nam châm, tường, không có gì: False). */
    man({
      so: 1, ten: 'Sắt thì hút', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'Cảm biến từ ở hông xe hỏi: vật trước mặt có phải sắt không? front_metal() là True khi vật đầu tiên trước mũi xe là sắt và cách xe tới 2 ô. Bấm Chạy: xe dò thấy sắt nên bật nam châm hút về rồi thả vào ô đích.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn đầu dò chữ U sáng lên khi đọc.',
      san: ['...', '.o.', '.D.', '...'], vatChat: ['...', '.s.', '...', '...'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(nhieu(['if front_metal():'], thut(HUT), THA)),
      loiGiai: bai(nhieu(['if front_metal():'], thut(HUT), THA)),
      sao: { o: 5, nhip: 2 },
      goiY: ['front_metal() chỉ trả lời True hay False, không tốn nhịp.', 'Vật gỗ thì front_metal() là False.']
    }),

    man({
      so: 2, ten: 'Sắt hay gỗ', hang: 'lam-quen',
      deBai: 'Hai sân. Trước mặt xe và bên phải xe mỗi chỗ một vật, cách 2 ô: một vật sắt, một vật gỗ, mỗi sân một kiểu. Nếu trước mặt không phải sắt thì rẽ phải. Rồi hút sắt về, quay đầu, thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn luôn hút thẳng phía trước. Chạy thử: sân 2 trước mặt là gỗ. Thêm if not front_metal(): turn_right() ở đầu.',
      san: [['.o..', '....', '...o', '.D..'], ['.o..', '....', 'D..o', '....']],
      vatChat: [['.s..', '....', '...g', '....'], ['.g..', '....', '...s', '....']],
      batDau: { x: 1, y: 2, huong: 0 },
      maMau: bai(LAY),
      loiGiai: bai(nhieu(DONG_RE, LAY)),
      sao: { o: 12, nhip: 4 },
      loiSai: [
        { moTa: 'Lúc nào cũng rẽ phải: sân 1 sắt ở trước mặt nên hút nhầm vật gỗ', baiLam: bai(nhieu(['turn_right()'], LAY)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên not: sân 1 là sắt mà xe lại rẽ', baiLam: bai(nhieu(['if front_metal():', '    turn_right()'], LAY)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['not front_metal() là True khi trước mặt KHÔNG phải sắt.', 'Rẽ hay không thì sau đó vẫn hút, quay đầu, thả như nhau.']
    }),

    man({
      so: 3, ten: 'Không phải sắt thì sang trái', hang: 'lam-quen',
      deBai: 'Hai sân. Lần này vật thứ hai nằm bên TRÁI xe. Dùng if / else: trước mặt là sắt thì hút luôn, không thì rẽ trái rồi hút. Xong quay đầu thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn chỉ có nhánh if. Thêm else: turn_left() rồi hút.',
      san: [['..o.', '....', 'o...', '..D.'], ['..o.', '....', 'o..D', '....']],
      vatChat: [['..s.', '....', 'g...', '....'], ['..g.', '....', 's...', '....']],
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(nhieu(['if front_metal():'], thut(HUT), ['u_turn()'], THA)),
      loiGiai: bai(nhieu(['if front_metal():'], thut(HUT), ['else:', '    turn_left()'], thut(HUT), ['u_turn()'], THA)),
      sao: { o: 15, nhip: 4 },
      loiGiaiKhac: { moTa: 'Đổi điều kiện: không phải sắt thì rẽ trái, rồi hút một lần ở dưới', baiLam: bai(nhieu(['if not front_metal():', '    turn_left()'], LAY)) },
      loiSai: [
        { moTa: 'Nhánh else rẽ phải: bên phải không có vật', baiLam: bai(nhieu(['if front_metal():'], thut(HUT), ['else:', '    turn_right()'], thut(HUT), ['u_turn()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['else chạy khi điều kiện của if là False.', 'Hai nhánh đều kết thúc bằng hút; phần quay đầu, thả viết một lần ở dưới.']
    }),

    man({
      so: 4, ten: 'Đi tới khi thấy sắt', hang: 'luyen',
      deBai: 'Hai sân, vật sắt nằm ở cuối hành lang, mỗi sân xa gần khác nhau. Đi tới khi front_metal() thấy sắt (cách 2 ô), hút về, quay đầu, thả vào ô đích ngay sau lưng.',
      veMaMau: 'Chương trình có sẵn đi cứng ba ô. Chạy thử: sân 2 vật sắt xa hơn. Thay bằng while not front_metal().',
      san: [['########', '..D..o..', '########'], ['########', '...D..o.', '########']],
      vatChat: [['........', '.....s..', '........'], ['........', '......s.', '........']],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['for i in range(3):', '    move()'], LAY)),
      loiGiai: bai(nhieu(SEEK, LAY)),
      sao: { o: 13, nhip: 7 },
      loiSai: [
        { moTa: 'Đi tới khi trước mặt hết trống: xe sát vật sắt rồi mới hút, thả lệch ô đích', baiLam: bai(nhieu(['while front_clear():', '    move()'], LAY)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thấy sắt cách 2 ô là dừng: while not front_metal(): move().', 'Ô đích ngay sau lưng chỗ xe dừng.']
    }),

    man({
      so: 5, ten: 'Sắt sau góc', hang: 'luyen',
      deBai: 'Hai sân. Đi thẳng tới tường, rẽ phải, rồi đi tới khi thấy sắt. Hút về, quay đầu, thả vào ô đích sau lưng. Mỗi sân góc rẽ và vật sắt ở chỗ khác.',
      veMaMau: 'Chương trình có sẵn tới được góc rẽ. Viết tiếp.',
      san: [['......', '#####.', '#####D', '#####.', '#####.', '#####o'], ['....##', '###D##', '###.##', '###.##', '###o##', '######']],
      vatChat: [['......', '......', '......', '......', '......', '.....s'], ['......', '......', '......', '......', '...s..', '......']],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['while front_clear():', '    move()', 'turn_right()']),
      loiGiai: bai(nhieu(['while front_clear():', '    move()', 'turn_right()'], SEEK, LAY)),
      sao: { o: 18, nhip: 12 },
      loiSai: [
        { moTa: 'Rẽ xong đi tới tường: xe sát vật sắt, thả lệch', baiLam: bai(nhieu(['while front_clear():', '    move()', 'turn_right()', 'while front_clear():', '    move()'], LAY)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đoạn đầu: while front_clear(). Đoạn sau: while not front_metal().', 'Hai vòng while nối nhau, mỗi vòng một điều kiện.']
    }),

    man({
      so: 6, ten: 'Gặp gỗ thì rẽ', hang: 'luyen',
      deBai: 'Hai sân. Hành lang có thể có vật sắt hoặc vật gỗ. Đi tiếp khi trước mặt còn trống VÀ chưa thấy sắt. Dừng rồi: nếu không phải sắt (là gỗ chắn) thì rẽ phải, sắt nằm ở đó. Hút về, quay đầu, thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn chỉ hỏi not front_metal(): sân 2 xe húc vào gỗ mãi. Ghép thêm front_clear() bằng and.',
      san: [['#######', '..D..o.', '#######', '#######'], ['####D##', '.....o.', '####.##', '####o##']],
      vatChat: [['.......', '.....s.', '.......', '.......'], ['.......', '.....g.', '.......', '....s..']],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(SEEK, DONG_RE, LAY)),
      loiGiai: bai(nhieu([VA_TU, '    move()'], DONG_RE, LAY)),
      sao: { o: 17, nhip: 8 },
      loiSai: [
        { moTa: 'Chỉ hỏi front_clear(): sân 1 xe đi sát vật sắt mới dừng', baiLam: bai(nhieu(['while front_clear():', '    move()'], DONG_RE, LAY)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Xe phải dừng khi gặp vật chắn HOẶC khi thấy sắt: đi tiếp khi front_clear() and not front_metal().', 'Dừng trước gỗ thì sắt nằm bên phải.']
    }),

    man({
      so: 7, ten: 'Hai vật sắt', hang: 'bien-the',
      deBai: 'Hành lang có hai vật sắt nối nhau, mỗi vật phải về ô đích ngay sau chỗ dò thấy nó. Mỗi chuyến: đi tới khi thấy sắt, hút, quay đầu, thả, rồi quay đầu đi tiếp. Lặp hai chuyến.',
      veMaMau: 'Chương trình có sẵn làm một chuyến. Đặt nó vào vòng for và quay đầu lại sau khi thả.',
      san: ['##########', '.D..oD..o.', '##########'], vatChat: ['..........', '....s...s.', '..........'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(SEEK, LAY)),
      loiGiai: bai(nhieu(['for i in range(2):'], thut(SEEK), thut(LAY), ['    u_turn()'])),
      sao: { o: 15, nhip: 13 },
      loiSai: [
        { moTa: 'Quên quay đầu sau khi thả: chuyến hai xe đi ngược về đầu hành lang', baiLam: bai(nhieu(['for i in range(2):'], thut(SEEK), thut(LAY))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thả xong xe đang quay mặt về đầu hành lang: u_turn() để đi tiếp.', 'Mỗi chuyến giống nhau nên đặt cả chuyến trong for i in range(2).']
    }),

    man({
      so: 8, ten: 'Sửa điều kiện dò', hang: 'bien-the',
      deBai: 'Ba sân như màn Gặp gỗ thì rẽ, thêm một sân gỗ nằm xa hơn. Chương trình có sẵn ghép điều kiện bằng or nên xe không dừng. Sửa cho đúng.',
      veMaMau: 'Chạy thử: xe húc mãi. Chạm chữ or để đổi thành and.',
      san: [['#######', '..D..o.', '#######', '#######'], ['####D##', '.....o.', '####.##', '####o##'], ['#####D#', '......o', '#####.#', '#####o#']],
      vatChat: [['.......', '.....s.', '.......', '.......'], ['.......', '.....g.', '.......', '....s..'], ['.......', '......g', '.......', '.....s.']],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['while front_clear() or not front_metal():', '    move()'], DONG_RE, LAY)),
      loiGiai: bai(nhieu([VA_TU, '    move()'], DONG_RE, LAY)),
      sao: { o: 17, nhip: 9 },
      loiSai: [
        { moTa: 'Chỉ hỏi not front_metal(): sân gỗ xe húc vào gỗ mãi', baiLam: bai(nhieu(SEEK, DONG_RE, LAY)), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['or: một vế đúng là xe vẫn đi, nên gặp gỗ xe vẫn cố tiến.', 'Đi tiếp chỉ khi cả hai đúng: and.']
    }),

    man({
      so: 9, ten: 'Ba hướng', hang: 'bien-the',
      deBai: 'Ba sân. Vật sắt có thể ở trước mặt, bên phải hoặc bên trái xe, hai chỗ còn lại là gỗ. Không phải sắt thì rẽ phải; vẫn không phải thì quay đầu (nhìn sang bên trái cũ). Rồi hút, quay đầu, thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn mới dò hai hướng. Thêm một if lồng bên trong.',
      san: [['##o##', '##.##', 'o...o', '##D##'], ['##o##', '##.##', 'oD..o', '#####'], ['##o##', '##.##', 'o..Do', '#####']],
      vatChat: [['..s..', '.....', 'g...g', '.....'], ['..g..', '.....', 'g...s', '.....'], ['..g..', '.....', 's...g', '.....']],
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(nhieu(DONG_RE, LAY)),
      loiGiai: bai(nhieu(DONG_RE, ['    if not front_metal():', '        u_turn()'], LAY)),
      sao: { o: 14, nhip: 5 },
      loiSai: [
        { moTa: 'Không phải sắt thì quay đầu ngay: sân 2 sắt ở bên phải bị bỏ qua', baiLam: bai(nhieu(['if not front_metal():', '    u_turn()'], LAY)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Sau khi rẽ phải, hỏi front_metal() lần nữa.', 'Rẽ phải rồi quay đầu là đang nhìn sang bên trái lúc đầu.']
    }),

    man({
      so: 10, ten: 'Kho dò sắt', hang: 'trum', khung: { chinh: 14, moiHam: 10 },
      deBai: 'Ba kho. Đi thẳng tới tường, rẽ phải, rồi đi tiếp khi trước mặt còn trống và chưa thấy sắt. Gặp gỗ chắn thì sắt nằm bên phải. Hút về, quay đầu, thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn tới được góc rẽ. Viết tiếp.',
      san: [['......', '#####.', '#####D', '#####.', '#####.', '#####o'], ['......#', '#####.#', '#####.#', '###o..D', '#####o#'], ['....##', '###D##', '###.##', '###.##', '###o##', '######']],
      vatChat: [['......', '......', '......', '......', '......', '.....s'], ['.......', '.......', '.......', '...s...', '.....g.'], ['......', '......', '......', '......', '...s..', '......']],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['while front_clear():', '    move()', 'turn_right()']),
      loiGiai: bai(nhieu(['while front_clear():', '    move()', 'turn_right()', VA_TU, '    move()'], DONG_RE, LAY)),
      sao: { o: 20, nhip: 13 },
      loiSai: [
        { moTa: 'Đoạn sau chỉ hỏi not front_metal(): kho 2 xe húc vào gỗ mãi', baiLam: bai(nhieu(['while front_clear():', '    move()', 'turn_right()'], SEEK, LAY)), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Hai đoạn: tới tường, rồi tới khi thấy sắt hoặc gặp vật chắn.', 'Dừng trước gỗ thì rẽ phải rồi mới hút.']
    })
  ];

  /* ================================================= chương che-cam-ung-tu "Chế lệnh: dò sắt" =================================================
     Hàm của em mới: seek_iron() (đi tới khi thấy sắt), take_iron() (hút, quay đầu, thả), seek_safe() (and: dừng trước vật chắn hay khi thấy sắt),
     face_iron() (quay về phía có sắt). Sân dùng lại các kiểu sân của chương Dò sắt. */
  var SAN_DAI = [['########', '..D..o..', '########'], ['########', '...D..o.', '########']];
  var CHAT_DAI = [['........', '.....s..', '........'], ['........', '......s.', '........']];
  var SAN_GO = [['#######', '..D..o.', '#######', '#######'], ['#####D#', '......o', '#####.#', '#####o#']];
  var CHAT_GO = [['.......', '.....s.', '.......', '.......'], ['.......', '......g', '.......', '.....s.']];
  function hSeek() { return H('seek_iron', [], SEEK); }
  function hTake(than) { return H('take_iron', [], than || LAY); }
  function hSafe() { return H('seek_safe', [], [VA_TU, '    move()']); }
  function che(m) { m.chuong = 'che-cam-ung-tu'; return man(m); }

  DS.push(
    che({
      so: 1, ten: 'Hàm mang sắt', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoaHamMan: ['haul_iron'],
      deBai: 'Hàm haul_iron() của màn gói cả chuyến mang sắt: hút vật trước mặt, quay đầu, thả. Chương trình chỉ cần đi tới chỗ thấy sắt rồi gọi nó. Bấm Chạy.',
      veMaMau: 'Chương trình và hàm của màn đã viết sẵn, khoá. Mở Xưởng xem haul_iron, rồi bấm Chạy.',
      san: SAN_DAI[0], vatChat: CHAT_DAI[0],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(SEEK, ['haul_iron()']), { hamCuaMan: [H('haul_iron', [], LAY)] }),
      loiGiai: bai(nhieu(SEEK, ['haul_iron()']), { hamCuaMan: [H('haul_iron', [], LAY)] }),
      sao: { o: 14, nhip: 6 },
      goiY: ['Gói nhiều dòng hay dùng vào một hàm thì chương trình chính ngắn lại.', 'Màn sau em tự tạo hàm của mình.']
    }),

    che({
      so: 2, ten: 'Hàm seek_iron()', hang: 'lam-quen', taoHam: ['seek_iron'],
      deBai: 'Tạo hàm seek_iron(): đi tới khi thấy sắt (while not front_metal(): move()). Rồi hút, quay đầu, thả. Hai sân, vật sắt xa gần khác nhau.',
      veMaMau: 'Chương trình có sẵn gọi seek_iron() nhưng em chưa có hàm đó. Bấm Hàm mới.',
      san: SAN_DAI, vatChat: CHAT_DAI,
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['seek_iron()'], LAY)),
      loiGiai: bai(nhieu(['seek_iron()'], LAY), { hamCuaEmMoi: [hSeek()] }),
      sao: { o: 14, nhip: 7 },
      loiSai: [
        { moTa: 'Chưa tạo hàm seek_iron mà đã gọi nó', baiLam: bai(nhieu(['seek_iron()'], LAY)), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm đi cứng ba ô: sân 2 vật sắt xa hơn', baiLam: bai(nhieu(['seek_iron()'], LAY)), hamCuaEmMoi: [H('seek_iron', [], ['for i in range(3):', '    move()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm hai dòng: while not front_metal(): rồi move().', 'Hàm dừng khi vật sắt cách mũi xe 2 ô.']
    }),

    che({
      so: 3, ten: 'Hàm take_iron()', hang: 'lam-quen', taoHam: ['take_iron'], hamCuaEmCan: ['move', 'u_turn', 'seek_iron'],
      deBai: 'Tạo hàm take_iron(): hút vật trước mặt, quay đầu, thả. Chương trình chính chỉ còn hai dòng: seek_iron() rồi take_iron().',
      veMaMau: 'Chương trình có sẵn gọi take_iron() nhưng em chưa có hàm đó. Bấm Hàm mới.',
      san: SAN_DAI, vatChat: CHAT_DAI,
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['seek_iron()', 'take_iron()']),
      loiGiai: bai(['seek_iron()', 'take_iron()'], { hamCuaEmMoi: [hTake()] }),
      sao: { o: 15, nhip: 7 },
      loiSai: [
        { moTa: 'Trong hàm quên quay đầu: vật rơi lại chỗ cũ', baiLam: bai(['seek_iron()', 'take_iron()']), hamCuaEmMoi: [hTake(nhieu(HUT, THA))], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trong hàm quên wait() sau magnet_n(): nam châm chưa kịp hút', baiLam: bai(['seek_iron()', 'take_iron()']), hamCuaEmMoi: [hTake(['magnet_n()', 'u_turn()', 'magnet_off()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm: magnet_n(), wait(), u_turn(), magnet_off(), wait().', 'Lệnh nam châm cần wait() để nhịp trôi.']
    }),

    che({
      so: 4, ten: 'Ngã ba bằng hàm', hang: 'luyen', hamCuaEmCan: ['turn_right', 'u_turn', 'take_iron'],
      deBai: 'Hai sân như màn Sắt hay gỗ: sắt ở trước mặt hoặc bên phải. Không phải sắt thì rẽ phải, rồi gọi take_iron().',
      veMaMau: 'Chương trình có sẵn chỉ gọi take_iron(). Thêm if ở đầu.',
      san: [['#o##', '#.##', '#..o', '#D##'], ['#o##', '#.##', 'D..o', '####']],
      vatChat: [['.s..', '....', '...g', '....'], ['.g..', '....', '...s', '....']],
      batDau: { x: 1, y: 2, huong: 0 },
      maMau: bai(['take_iron()']),
      loiGiai: bai(nhieu(DONG_RE, ['take_iron()'])),
      sao: { o: 13, nhip: 4 },
      loiSai: [
        { moTa: 'Gọi take_iron() trước rồi mới hỏi: sân 2 hút nhầm gỗ', baiLam: bai(nhieu(['take_iron()'], DONG_RE)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Hỏi trước, làm sau: if not front_metal(): turn_right().', 'take_iron() làm hết phần hút, quay đầu, thả.']
    }),

    che({
      so: 5, ten: 'Sửa find_iron()', hang: 'luyen', hamCuaEmCan: ['move', 'take_iron'],
      deBai: 'Hàm find_iron() của màn phải đi tới khi thấy sắt, nhưng nó viết sai nên xe đi sát vật mới dừng. Sửa thân hàm cho xe dừng cách sắt 2 ô ở cả hai sân.',
      veMaMau: 'Chạy thử: xe đi sát vật sắt rồi mới hút, vật rơi lệch. Mở Xưởng sửa find_iron.',
      san: SAN_DAI, vatChat: CHAT_DAI,
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['find_iron()', 'take_iron()'], { hamCuaMan: [H('find_iron', [], ['while front_clear():', '    move()'])] }),
      loiGiai: bai(['find_iron()', 'take_iron()'], { hamCuaMan: [H('find_iron', [], SEEK)] }),
      sao: { o: 15, nhip: 7 },
      loiSai: [
        { moTa: 'Bỏ chữ not: sắt chưa thấy thì xe không đi bước nào', baiLam: bai(['find_iron()', 'take_iron()'], { hamCuaMan: [H('find_iron', [], ['while front_metal():', '    move()'])] }), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['front_clear() chỉ biết trước mặt trống hay không, không biết vật gì.', 'Đổi điều kiện thành not front_metal().']
    }),

    che({
      so: 6, ten: 'Hàm seek_safe()', hang: 'luyen', taoHam: ['seek_safe'], hamCuaEmCan: ['move', 'turn_right', 'take_iron'],
      deBai: 'Tạo hàm seek_safe(): đi tiếp khi trước mặt còn trống VÀ chưa thấy sắt. Hai sân như màn Gặp gỗ thì rẽ: dừng trước gỗ thì sắt ở bên phải.',
      veMaMau: 'Chương trình có sẵn gọi seek_safe() nhưng em chưa có hàm đó. Tạo nó.',
      san: SAN_GO, vatChat: CHAT_GO,
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['seek_safe()'], DONG_RE, ['take_iron()'])),
      loiGiai: bai(nhieu(['seek_safe()'], DONG_RE, ['take_iron()']), { hamCuaEmMoi: [hSafe()] }),
      sao: { o: 19, nhip: 9 },
      loiSai: [
        { moTa: 'Trong hàm chỉ hỏi not front_metal(): sân 2 xe húc vào gỗ mãi', baiLam: bai(nhieu(['seek_safe()'], DONG_RE, ['take_iron()'])), hamCuaEmMoi: [H('seek_safe', [], SEEK)], phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Thân hàm: while front_clear() and not front_metal(): rồi move().', 'Ghép hai vế bằng and trong Xưởng như ở chương trình chính.']
    }),

    che({
      so: 7, ten: 'Hai chuyến bằng hàm', hang: 'bien-the', hamCuaEmCan: ['u_turn', 'seek_iron', 'take_iron'],
      deBai: 'Hành lang có hai vật sắt nối nhau như màn Hai vật sắt. Dùng seek_iron() và take_iron() trong vòng for, nhớ quay đầu sau mỗi chuyến.',
      veMaMau: 'Chương trình có sẵn làm một chuyến bằng hàm. Đặt vào vòng for.',
      san: ['##########', '.D..oD..o.', '##########'], vatChat: ['..........', '....s...s.', '..........'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['seek_iron()', 'take_iron()']),
      loiGiai: bai(['for i in range(2):', '    seek_iron()', '    take_iron()', '    u_turn()']),
      sao: { o: 17, nhip: 13 },
      loiSai: [
        { moTa: 'Quên quay đầu: chuyến hai xe đi ngược', baiLam: bai(['for i in range(2):', '    seek_iron()', '    take_iron()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Một chuyến là ba dòng: seek_iron(), take_iron(), u_turn().', 'Lặp hai lần.']
    }),

    che({
      so: 8, ten: 'Hàm face_iron()', hang: 'bien-the', taoHam: ['face_iron'], hamCuaEmCan: ['turn_right', 'u_turn', 'take_iron'],
      deBai: 'Ba sân như màn Ba hướng: sắt ở trước mặt, bên phải hoặc bên trái. Tạo hàm face_iron() quay xe về phía có sắt (không phải sắt thì rẽ phải; vẫn không phải thì quay đầu), rồi gọi take_iron().',
      veMaMau: 'Chương trình có sẵn gọi face_iron() rồi take_iron(). Tạo hàm face_iron.',
      san: [['##o##', '##.##', 'o...o', '##D##'], ['##o##', '##.##', 'oD..o', '#####'], ['##o##', '##.##', 'o..Do', '#####']],
      vatChat: [['..s..', '.....', 'g...g', '.....'], ['..g..', '.....', 'g...s', '.....'], ['..g..', '.....', 's...g', '.....']],
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(['face_iron()', 'take_iron()']),
      loiGiai: bai(['face_iron()', 'take_iron()'], { hamCuaEmMoi: [H('face_iron', [], nhieu(DONG_RE, ['    if not front_metal():', '        u_turn()']))] }),
      sao: { o: 16, nhip: 5 },
      loiSai: [
        { moTa: 'Chưa tạo hàm face_iron mà đã gọi nó', baiLam: bai(['face_iron()', 'take_iron()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thiếu if lồng: sân 3 sắt bên trái bị bỏ qua', baiLam: bai(['face_iron()', 'take_iron()']), hamCuaEmMoi: [H('face_iron', [], DONG_RE)], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm như màn Ba hướng: hai câu if, câu sau lồng trong câu trước.', 'Hàm chỉ quay xe, chưa hút.']
    }),

    che({
      so: 9, ten: 'Đường vòng bằng hàm', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right', 'seek_safe', 'take_iron'],
      deBai: 'Hai kho như màn Sắt sau góc, có kho gỗ chắn giữa đường. Đi tới tường, rẽ phải, rồi dùng seek_safe(): dừng trước gỗ thì rẽ phải. Cuối cùng take_iron().',
      veMaMau: 'Chương trình có sẵn tới góc rẽ. Viết tiếp bằng các hàm của em.',
      san: [['......', '#####.', '#####D', '#####.', '#####.', '#####o'], ['......#', '#####.#', '#####.#', '###o..D', '#####o#']],
      vatChat: [['......', '......', '......', '......', '......', '.....s'], ['.......', '.......', '.......', '...s...', '.....g.']],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['while front_clear():', '    move()', 'turn_right()']),
      loiGiai: bai(nhieu(['while front_clear():', '    move()', 'turn_right()', 'seek_safe()'], DONG_RE, ['take_iron()'])),
      sao: { o: 22, nhip: 13 },
      loiSai: [
        { moTa: 'Dùng seek_iron() thay seek_safe(): kho 2 xe húc vào gỗ mãi', baiLam: bai(nhieu(['while front_clear():', '    move()', 'turn_right()', 'seek_iron()'], DONG_RE, ['take_iron()'])), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['seek_safe() dừng cả khi gặp gỗ chắn; seek_iron() chỉ dừng khi thấy sắt.', 'Sau seek_safe(): không phải sắt thì rẽ phải.']
    }),

    che({
      so: 10, ten: 'Xưởng dò sắt', hang: 'trum', hamCuaEmCan: ['move', 'turn_right', 'u_turn', 'seek_safe', 'take_iron', 'face_iron'],
      deBai: 'Ba kho. Đi tới tường, rẽ phải, đi bằng seek_safe(). Dừng rồi thì sắt có thể ở trước mặt, bên phải hoặc bên trái: quay về phía có sắt rồi mang nó về ô đích.',
      veMaMau: 'Chương trình có sẵn tới góc rẽ. Viết tiếp bằng các hàm của em.',
      san: [['......', '#####.', '#####D', '#####.', '#####.', '#####o'], ['......#', '#####.#', '#####.#', '###o..D', '#####o#'], ['......##', '#####.##', '###oD..o', '#####o##']],
      vatChat: [['......', '......', '......', '......', '......', '.....s'], ['.......', '.......', '.......', '...s...', '.....g.'], ['........', '........', '...g...s', '.....g..']],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['while front_clear():', '    move()', 'turn_right()']),
      loiGiai: bai(['while front_clear():', '    move()', 'turn_right()', 'seek_safe()', 'face_iron()', 'take_iron()']),
      sao: { o: 25, nhip: 13 },
      loiSai: [
        { moTa: 'Chỉ rẽ phải khi gặp gỗ: kho 3 sắt nằm bên trái', baiLam: bai(nhieu(['while front_clear():', '    move()', 'turn_right()', 'seek_safe()'], DONG_RE, ['take_iron()'])), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['face_iron() đã biết quay về cả ba phía.', 'Ba hàm nối nhau: seek_safe(), face_iron(), take_iron().']
    })
  );

  ManHoc.manCamUngTu = DS;
  if (laNode) module.exports = ManHoc;
})();

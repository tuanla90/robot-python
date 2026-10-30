/* ============================================================================
   man-trum-mua-3.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 10 "Tổng hợp + trùm" (KE-HOACH-MUA-3.md). HIỆN CHƯA CÓ MÀN.
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `tong-hop-3`: chương 1 "Tổng hợp" (chưa có màn)
     - `trum-mua-3`: chương 2 "Trùm mùa" (chưa có màn)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản, KHÔNG trùng mã đã có. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Màn mới nối SAU các màn có sẵn của chương (chen trước
   màn trùm có sẵn nếu màn cuối có sẵn là trùm); muốn xen giữa thì sửa đúng dòng chương đó trong MUA_3. Chương còn trống thì chưa hiện.
   Ràng buộc mùa 3 (hoc/kiem-lo-trinh.mjs mục mùa 3): thân hai bánh / xích / nhện; tay mùa 1–2 + nam châm; cảm biến mùa 1–2 + cảm ứng từ;
   không omni, drone, camera, máy sơn, máy ném, color(); không bậc thang S. Chuỗi làm dữ liệu chỉ từ gói 1 chương 2, and / or chỉ từ gói 2 chương 2;
   magnet_s từ gói 6, front_metal từ gói 3, front_pole từ gói 7, crouch / stand / jump / leap từ gói 5; hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manTrumMua3, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  // 30/10 phiên Mùa 3: 20 màn gói 10. Chương tong-hop-3 ôn từng cặp gói (nhện + nhảy, dò sắt, đệm từ, đảo cực, đọc cực, bụng nhện, đội, and / or);
  // chương trum-mua-3 trộn nhiều gói một màn, khó dần tới trùm mùa. Mọi màn dùng hàm của em đã có trong kho (không tạo hàm mới).
  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var XE = BANH.concat(['magnet_n', 'magnet_s', 'magnet_off', 'front_clear', 'left_clear', 'right_clear', 'front_metal', 'front_pole']);
  var CHAN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var HUT = ['magnet_n()', 'wait()'], THA = ['magnet_off()', 'wait()'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function thut(ds, n) { var p = new Array((n || 1) * 4 + 1).join(' '); return ds.map(function (s) { return p + s; }); }
  function LAP(n, than) { return ['for i in range(' + n + '):'].concat(thut(Array.isArray(than) ? than : [than])); }
  function B(c1, c2) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: [] }; }

  /** Phần chung; m.kieu: 'xe' (hai bánh nam châm, cảm biến khoảng cách + từ), 'nhen' (nhện không tay), 'bung' (nhện nam châm bụng), 'doi' (xích tay kẹp + nhện tay kẹp). */
  function man(m) {
    var kieu = m.kieu; delete m.kieu;
    m.chuong = m.chuong || 'tong-hop-3';
    m.cauTruc = ['for', 'if', 'while']; m.vaHoac = true;
    m.nhipTheoLoiGiai = true; m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 12, moiHam: 10 }; m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    if (kieu === 'xe') {
      m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: 'nam-cham', camBien: [{ ma: 'khoang-cach', o: 'hong' }, { ma: 'tu', o: 'hong' }] }; m.hamGoc = XE;
    } else if (kieu === 'nhen' || kieu === 'bung') {
      m.loaiRobot = 'nhen'; m.robot = { than: 'nhen', tay: kieu === 'bung' ? 'nam-cham' : null, camBien: [] };
      m.hamGoc = kieu === 'bung' ? CHAN.concat(['magnet_n', 'magnet_s', 'magnet_off']) : CHAN;
    } else if (kieu === 'doi') {
      var bd = m.bd; delete m.bd;
      var xich = { loaiRobot: 'xich', robot: { than: 'xich', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] }, hamGoc: BANH.concat(TAY, ['front_clear', 'left_clear', 'right_clear']) };
      var nhen = { loaiRobot: 'nhen', robot: { than: 'nhen', tay: 'kep' }, hamGoc: CHAN.concat(TAY) };
      m.doi = [Object.assign({ batDau: bd[0] }, xich), Object.assign({ batDau: bd[1] }, nhen)];
      if (m.co) { var co = m.co; delete m.co; m.doi.forEach(function (d, i) { if (co[i]) d.co = co[i]; }); }
      m.batDau = bd[0]; m.loaiRobot = 'xich'; m.robot = JSON.parse(JSON.stringify(xich.robot)); m.hamGoc = xich.hamGoc.slice(); m.bienDem = true;
    }
    if (m.mucTieu === undefined) m.mucTieu = 'dua-vat';
    if (m.mucTieu === 'dua-vat' && !m.vatCan && kieu !== 'doi') m.vatCan = 'tu';
    m.taoHam = m.taoHam || [];
    if (Array.isArray(m.san[0]) && !Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ================================================= chương tong-hop-3 "Tổng hợp" ================================================= */
    man({
      // 30/10 nghiệm thu độc lập: ôn chuỗi làm dữ liệu của gói 1 (biến chuỗi + for c in path) cùng elif và nhảy / chui của gói 5 (trước: Nhện vượt chướng, bốn lệnh tuần tự).
      // Chuỗi chín bước (12 ô, ~19 nhịp, đứng sau tong-hop-3.9 cho đường cong): viết thẳng chín lệnh tốn khối hơn vòng for có if / elif / else.
      so: 1, ten: 'Bản đồ chuỗi qua khe', hang: 'lam-quen', kieu: 'nhen', mucTieu: 'toi-co', hamCuaEmCan: ['go', 'jump', 'crawl'],
      deBai: 'Ôn chuỗi: bản đồ đường đi lưu trong biến path = "RJRRCRJRR". Mỗi chữ là một việc: R bước sang phải, J nhảy qua hố, C chui qua gầm. Duyệt for c in path rồi dùng if / elif / else làm đúng việc của từng chữ.',
      veMaMau: 'Chương trình có sẵn đã có path và vòng for, nhưng chữ nào cũng chỉ bước go("R"). Thêm if / elif.',
      san: ['###############', '#..u...n..u..F#', '###############'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['path = "RJRRCRJRR"', 'for c in path:', '    go("R")']),
      loiGiai: bai(['path = "RJRRCRJRR"', 'for c in path:', '    if c == "J":', '        jump("R")', '    elif c == "C":', '        crawl("R")', '    else:', '        go("R")']),
      sao: { o: 25, nhip: 23 },
      loiSai: [
        { moTa: 'Chữ nào cũng bước: rơi hố đầu tiên', baiLam: bai(['path = "RJRRCRJRR"', 'for c in path:', '    go("R")']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Đảo hai nhánh: nhảy ở chỗ gầm, chui ở chỗ hố', baiLam: bai(['path = "RJRRCRJRR"', 'for c in path:', '    if c == "C":', '        jump("R")', '    elif c == "J":', '        crawl("R")', '    else:', '        go("R")']), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['for c in path lấy từng chữ của chuỗi, từ trái sang phải.', 'J thì jump("R"), C thì crawl("R"), còn lại go("R").']
    }),

    man({
      so: 2, ten: 'Sắt xa, sắt gần', hang: 'lam-quen', kieu: 'xe', vatCan: 'sat', hamCuaEmCan: ['seek_iron', 'take_iron'],
      deBai: 'Ôn dò sắt: hai sân, vật sắt xa gần khác nhau, ô đích ngay sau chỗ xe dừng. Dò tới khi thấy sắt, rồi hút, quay đầu, thả. Hai hàm của em làm đủ.',
      veMaMau: 'Chương trình có sẵn đi cứng ba ô. Chạy thử: sân 2 xe đi sát vật.',
      san: [['########', '#..D..o#', '########'], ['########', '#.D..o.#', '########']],
      vatChat: [['........', '......s.', '........'], ['........', '.....s..', '........']],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(nhieu(LAP(3, 'move()'), ['take_iron()'])),
      loiGiai: bai(['seek_iron()', 'take_iron()']),
      sao: { o: 15, nhip: 6 },
      loiSai: [
        { moTa: 'Đi cứng ba ô: sân 2 xe dừng sát vật', baiLam: bai(nhieu(LAP(3, 'move()'), ['take_iron()'])), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đi tới khi hết trống: xe sát vật rồi mới hút', baiLam: bai(['while front_clear():', '    move()', 'take_iron()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['seek_iron() dừng khi vật sắt cách 2 ô.', 'take_iron() thả vật vào ô ngay sau chỗ xe dừng.']
    }),

    man({
      so: 3, ten: 'Gọi sắt rồi đi vòng', hang: 'luyen', kieu: 'xe', vatCan: 'sat', hamCuaEmCan: ['pull_iron', 'loop_right'],
      deBai: 'Ôn bãi từ: xe đứng trên nút bật đệm. pull_iron() gọi vật sắt trong hốc ra rồi hút về. Ô đích ở góc trên bên trái: loop_right(1) đi một vòng nhỏ rồi thả.',
      veMaMau: 'Chương trình có sẵn gọi được sắt. Viết tiếp đoạn đi vòng và thả.',
      san: ['#D#o###', '#M.....', '#...###'], vatChat: ['...s...', '.......', '.......'],
      demTu: [{ x: 3, y: 2, cuc: 'S', nut: { x: 1, y: 1 } }],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['pull_iron()']),
      loiGiai: bai(nhieu(['pull_iron()', 'loop_right(1)'], THA)),
      sao: { o: 17, nhip: 10 },
      loiSai: [
        { moTa: 'Quay đầu thả: vật rơi lên nút, không phải ô đích', baiLam: bai(nhieu(['pull_iron()', 'u_turn()'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'loop_right(2): vòng quá rộng, đụng tường', baiLam: bai(nhieu(['pull_iron()', 'loop_right(2)'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['pull_iron(): đè nút một nhịp, bước khỏi nút, hút.', 'loop_right(1): ba lần rẽ phải đi một ô, mũi xe chĩa lên ô đích.']
    }),

    man({
      so: 4, ten: 'Đổi cực qua hai đệm', hang: 'luyen', kieu: 'xe', mucTieu: 'toi-co', hamCuaEmCan: ['move'],
      deBai: 'Ôn đảo cực: hai đệm trên hai cái hố, đệm đầu cực S, đệm sau cực N. Cùng cực thì đệm đẩy xe vào tường, an toàn. Bật S để qua đệm đầu, đổi sang N để qua đệm sau.',
      veMaMau: 'Chương trình có sẵn chỉ bật N từ đầu. Chạy thử: đệm S hút xe xuống hố.',
      san: ['##.##.##', '##u##u##', '#......F', '########'], demTu: [{ x: 2, y: 0, cuc: 'S' }, { x: 5, y: 0, cuc: 'N' }],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: bai(nhieu(['magnet_n()'], LAP(6, 'move()'))),
      loiGiai: bai(nhieu(['magnet_s()'], LAP(2, 'move()'), ['magnet_n()'], LAP(4, 'move()'))),
      sao: { o: 9, nhip: 6 },
      loiSai: [
        { moTa: 'Chỉ bật N: đệm S khác cực, hút xe xuống hố', baiLam: bai(nhieu(['magnet_n()'], LAP(6, 'move()'))), phaiCoMa: ['dem-roi-ho'] },
        { moTa: 'Bật S suốt: đệm N khác cực, hút xe xuống hố', baiLam: bai(nhieu(['magnet_s()'], LAP(6, 'move()'))), phaiCoMa: ['dem-roi-ho'] }
      ],
      goiY: ['Cùng cực thì đẩy: qua đệm S thì bật S.', 'Đổi cực ở khoảng giữa hai đệm.']
    }),

    man({
      so: 5, ten: 'Chia cột cực', hang: 'luyen', kieu: 'xe', hamCuaEmCan: ['sort', 'move'],
      deBai: 'Ôn đọc cực: ba vật nam châm xếp thành cột trước mặt xe, hai sân thứ tự khác nhau. sort() kéo vật trước mặt rồi thả sang bên theo cực. Lặp ba lần: sort() rồi tiến một ô.',
      veMaMau: 'Chương trình có sẵn kéo rồi thả hết sang trái. Chạy thử rồi sửa.',
      san: [['#####', '##o##', '#.oD#', '#Do.#', '#..D#', '#####'], ['#####', '##o##', '#Do.#', '#.oD#', '#D..#', '#####']],
      vatChat: [['.....', '..N..', '..S..', '..N..', '.....', '.....'], ['.....', '..S..', '..N..', '..S..', '.....', '.....']],
      mau: [['.....', '.....', '...r.', '.b...', '...r.', '.....'], ['.....', '.....', '.b...', '...r.', '.b...', '.....']],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: bai(LAP(3, ['grip()', 'turn_left()', 'magnet_off()', 'wait()', 'turn_right()', 'move()'])),
      loiGiai: bai(LAP(3, ['sort()', 'move()'])),
      sao: { o: 28, nhip: 13 },
      loiSai: [
        { moTa: 'Thả hết sang trái: vật N nằm sai ô đích màu', baiLam: bai(LAP(3, ['grip()', 'turn_left()', 'magnet_off()', 'wait()', 'turn_right()', 'move()'])), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên tiến một ô: vật sau còn xa, thả đè lên ô vừa thả', baiLam: bai(LAP(3, ['sort()'])), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['sort() tự đọc cực: N sang phải, S sang trái.', 'Sau mỗi lần thả, tiến một ô cho vật kế tiếp tới sát mũi.']
    }),

    man({
      so: 6, ten: 'Bụng nhện qua hai hố', hang: 'luyen', kieu: 'bung', hamCuaEmCan: ['hook', 'unhook', 'leap'],
      deBai: 'Ôn bụng nhện và nhảy: nhện đứng trùm trên vật sắt. Hút lên bụng, nhảy qua hai hố, thả xuống ô đích.',
      veMaMau: 'Chương trình có sẵn hút rồi đi bộ: rơi hố. Viết lại.',
      san: ['#######', '#ou.uD#', '#######'], vatChat: ['.......', '.s.....', '.......'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['hook()', 'walk("RRRR")', 'unhook()']),
      loiGiai: bai(['hook()', 'leap("RR")', 'unhook()']),
      sao: { o: 21, nhip: 8 },
      loiSai: [
        { moTa: 'Đi bộ: rơi hố', baiLam: bai(['hook()', 'walk("RRRR")', 'unhook()']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Quên hút: nhện tới ô đích mà vật vẫn ở chỗ cũ', baiLam: bai(['leap("RR")', 'unhook()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vật dính bụng thì bay theo nhện khi nhảy.', 'leap("RR") nhảy hai lần sang phải.']
    }),

    man({
      so: 7, ten: 'Đội chuyền qua hố', hang: 'bien-the', kieu: 'doi', hamCuaEmCan: ['go_wall', 'pass_box', 'wait_n', 'hop_drop'],
      deBai: 'Ôn đội: xích tới hộp, pass_box() thả trước mặt nhện. Nhện wait_n chờ hộp rồi hop_drop("R") qua hố vào ô đích.',
      veMaMau: 'Chương trình có sẵn: nhện gắp ngay khi hộp chưa tới. Thêm wait_n cho nhện.',
      san: ['########', '#o....##', '##.#D###', '##.u.###', '########'],
      bd: [{ x: 5, y: 1, huong: 3 }, { x: 2, y: 3, huong: 0 }],
      maMau: B(['go_wall()', 'pass_box()'], ['hop_drop("R")']),
      loiGiai: B(['go_wall()', 'pass_box()'], ['wait_n(8)', 'hop_drop("R")']),
      sao: { o: 42, nhip: 14 },
      loiSai: [
        { moTa: 'Nhện gắp ngay: hộp chưa tới', baiLam: B(['go_wall()', 'pass_box()'], ['hop_drop("R")']), phaiCoMa: ['kep-hut'] }
      ],
      goiY: ['Xích đi ba ô rồi mới pass_box(): đếm nhịp tới lúc hộp nằm xuống.', 'wait_n(n) chờ đúng n nhịp.']
    }),

    man({
      so: 8, ten: 'Sắt thẳng hay sau góc', hang: 'bien-the', kieu: 'xe', vatCan: 'sat', hamCuaEmCan: ['move', 'take_iron', 'turn_right'],     // 30/10 nghiệm thu: and viết thẳng trong while (trước: giấu trong seek_safe())
      deBai: 'Ôn and / or: hai sân. Tự viết vòng while front_clear() and not front_metal(): move(), đi tới khi trước mặt hết trống hoặc thấy sắt. Nếu thấy sắt thì take_iron(). Không thì rẽ phải, lại đi như vậy rồi take_iron().',
      veMaMau: 'Chương trình có sẵn chỉ đi tới khi trước mặt hết trống. Thêm vế and, rồi if / else.',
      san: [['#######', '#.D..o#', '#######', '#######'], ['######', '#...D#', '####.#', '####.#', '####o#', '######']],
      vatChat: [['.......', '.....s.', '.......', '.......'], ['......', '......', '......', '......', '....s.', '......']],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['while front_clear():', '    move()', 'take_iron()']),
      loiGiai: bai(['while front_clear() and not front_metal():', '    move()', 'if front_metal():', '    take_iron()', 'else:', '    turn_right()', '    while front_clear() and not front_metal():', '        move()', '    take_iron()']),
      sao: { o: 22, nhip: 8 },
      loiSai: [
        { moTa: 'Không hỏi: sân 2 xe hút vào tường', baiLam: bai(['while front_clear() and not front_metal():', '    move()', 'take_iron()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Rẽ trái thay vì rẽ phải', baiLam: bai(['while front_clear() and not front_metal():', '    move()', 'if front_metal():', '    take_iron()', 'else:', '    turn_left()', '    while front_clear() and not front_metal():', '        move()', '    take_iron()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vòng while dừng vì tường hoặc vì sắt: hỏi front_metal() để biết vì sao.', 'Sau khi rẽ, viết lại vòng while đó.']
    }),

    man({
      so: 9, ten: 'Bụng nhện chọn cực', hang: 'bien-the', kieu: 'bung', hamCuaEmCan: ['hook_for', 'trail', 'unhook'],
      deBai: 'Ôn bụng nhện và cực: nhện đứng trùm trên vật chữ N. Hút nó bằng hook_for("N"), mang sang ô đích đỏ. Rồi xuống chỗ vật chữ S, hút bằng hook_for("S"), mang sang ô đích xanh.',
      veMaMau: 'Chương trình có sẵn làm xong vật N. Viết tiếp cho vật S.',
      san: ['#######', '#o.D###', '###.###', '###o.D#', '#######'], vatChat: ['.......', '.N.....', '.......', '...S...', '.......'],
      mau: ['.......', '...r...', '.......', '.....b.', '.......'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['hook_for("N")', 'trail("RR")', 'unhook()']),
      loiGiai: bai(['hook_for("N")', 'trail("RR")', 'unhook()', 'trail("DD")', 'hook_for("S")', 'trail("RR")', 'unhook()']),
      sao: { o: 24, nhip: 16 },
      loiSai: [
        { moTa: 'Hút vật S bằng hook_for("N"): cùng cực, vật nằm yên', baiLam: bai(['hook_for("N")', 'trail("RR")', 'unhook()', 'trail("DD")', 'hook_for("N")', 'trail("RR")', 'unhook()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['hook_for(p) bật cực ngược với p để hút.', 'Thả vật N xong mới đi xuống: unhook() trước trail("DD").']
    }),

    man({
      so: 10, ten: 'Hai cực, hai đệm', hang: 'trum', kieu: 'xe', khung: { chinh: 18, moiHam: 10 }, hamCuaEmCan: ['move', 'u_turn', 'turn_right'],
      deBai: 'Trùm tổng hợp. Vật chữ N cuối hành lang phải, đi qua đệm S trên hố. Vật chữ S cuối hành lang trên, đi qua đệm N trên hố. Bật cực vừa hút được vật vừa được đệm đẩy vào tường: S cho chuyến phải, N cho chuyến trên. Mang về ô đích đỏ bên trái và ô đích xanh bên dưới.',
      veMaMau: 'Chương trình có sẵn mới đi chuyến phải mà bật nhầm cực. Sửa rồi viết tiếp.',
      san: ['#o########', '#.########', '#.########', '#.u.######', '#.##.#####', '#.##u#####', 'D.......o#', '#D########'],
      vatChat: ['.S........', '..........', '..........', '..........', '..........', '..........', '........N.', '..........'],
      mau: ['..........', '..........', '..........', '..........', '..........', '..........', 'r.........', '.b........'],
      demTu: [{ x: 4, y: 4, cuc: 'S' }, { x: 3, y: 3, cuc: 'N' }],
      batDau: { x: 1, y: 6, huong: 1 },
      maMau: bai(nhieu(['magnet_n()'], LAP(4, 'move()'), ['u_turn()'], LAP(4, 'move()'), THA)),
      loiGiai: bai(nhieu(['magnet_s()'], LAP(4, 'move()'), ['u_turn()'], LAP(4, 'move()'), THA, ['turn_right()', 'magnet_n()'], LAP(3, 'move()'), ['u_turn()'], LAP(3, 'move()'), THA)),
      sao: { o: 25, nhip: 19 },
      loiSai: [
        { moTa: 'Chuyến phải bật N: đệm S hút xe xuống hố', baiLam: bai(nhieu(['magnet_n()'], LAP(4, 'move()'), ['u_turn()'], LAP(4, 'move()'), THA, ['turn_right()', 'magnet_n()'], LAP(3, 'move()'), ['u_turn()'], LAP(3, 'move()'), THA)), phaiCoMa: ['dem-roi-ho'] },
        { moTa: 'Chuyến trên vẫn bật S: đệm N hút xe xuống hố', baiLam: bai(nhieu(['magnet_s()'], LAP(4, 'move()'), ['u_turn()'], LAP(4, 'move()'), THA, ['turn_right()', 'magnet_s()'], LAP(3, 'move()'), ['u_turn()'], LAP(3, 'move()'), THA)), phaiCoMa: ['dem-roi-ho'] }
      ],
      goiY: ['Bật S thì hút được vật N (khác cực) mà đệm S lại đẩy xe (cùng cực).', 'Thả vật N xong, rẽ phải là mũi xe chĩa lên hành lang trên.']
    })
  ];

  /* ================================================= chương trum-mua-3 "Trùm mùa" ================================================= */
  function trum(m) { m.chuong = 'trum-mua-3'; return man(m); }
  var DAY_CUC = ['if front_pole() == "N":', '    magnet_n()', 'else:', '    magnet_s()', 'wait()'];

  DS.push(
    trum({
      so: 1, ten: 'Đọc cực rồi đẩy', hang: 'lam-quen', kieu: 'xe', hamCuaEmCan: ['move'],
      deBai: 'Hai sân, vật nam châm cuối hành lang chữ N hoặc chữ S. Tiến năm ô, đọc cực rồi bật CÙNG cực: vật bị đẩy trượt ba ô vào ô đích sát tường.',
      veMaMau: 'Chương trình có sẵn luôn bật N. Chạy thử: sân 2 vật S bị hút về.',
      san: [['#############', '#.......o..D#', '#############'], ['#############', '#.......o..D#', '#############']],
      vatChat: [['.............', '........N....', '.............'], ['.............', '........S....', '.............']],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(nhieu(LAP(5, 'move()'), ['magnet_n()', 'wait()'])),
      loiGiai: bai(nhieu(LAP(5, 'move()'), DAY_CUC)),
      sao: { o: 10, nhip: 6 },
      loiSai: [
        { moTa: 'Bật khác cực: vật bị hút về mũi xe', baiLam: bai(nhieu(LAP(5, 'move()'), ['if front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'wait()'])), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Luôn bật N: sân 2 vật S bị hút', baiLam: bai(nhieu(LAP(5, 'move()'), ['magnet_n()', 'wait()'])), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Cùng cực thì đẩy, khác cực thì hút.', 'Vật bị đẩy trượt tới ba ô, dừng trước tường.']
    }),

    trum({
      so: 2, ten: 'Đứng trên nút tắt mà hút', hang: 'lam-quen', kieu: 'xe', vatCan: 'sat', hamCuaEmCan: ['loop_right'],
      deBai: 'Xe đứng sẵn trên nút TẮT đệm S. Đệm đang giữ vật sắt, nút đổi đệm từ nhịp sau: chờ một nhịp rồi hút. Rồi loop_right(1) đi một vòng nhỏ, thả vào ô đích góc trên.',
      veMaMau: 'Chương trình có sẵn hút ngay nhịp đầu. Chạy thử: đệm còn giữ vật sắt.',
      san: ['#D#####', '#.M.o.#', '#..####'], vatChat: ['.......', '....s..', '.......'],
      demTu: [{ x: 5, y: 1, cuc: 'S', nut: { x: 2, y: 1 }, khiDe: 'tat' }],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(nhieu(HUT, ['loop_right(1)'], THA)),
      loiGiai: bai(nhieu(['wait()'], HUT, ['loop_right(1)'], THA)),
      sao: { o: 15, nhip: 9 },
      loiSai: [
        { moTa: 'Hút ngay: đệm còn chạy, giữ vật sắt, rồi xe rời nút', baiLam: bai(nhieu(['magnet_n()', 'turn_right()', 'loop_right(1)'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đứng trên nút ở nhịp 1 thì đệm tắt từ nhịp 2.', 'Vật đã dính mũi xe thì đệm bật lại cũng không giật ra.']
    }),

    trum({
      so: 3, ten: 'Chui gầm, nhảy hố, mang sắt', hang: 'luyen', kieu: 'bung', vatCan: 'sat', hamCuaEmCan: ['go', 'hook', 'crawl', 'jump', 'unhook'],
      deBai: 'Vật sắt ở ngay bên phải nhện. Bước lên trùm qua nó, hút lên bụng, chui qua gầm, nhảy qua hố, thả vào ô đích. Vật dưới bụng đi theo nhện cả khi chui lẫn khi nhảy.',
      veMaMau: 'Chương trình có sẵn đi bộ: đụng gầm. Viết lại.',
      san: ['########', '#.on.uD#', '########'], vatChat: ['........', '..s.....', '........'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['go("R")', 'hook()', 'walk("RRRR")', 'unhook()']),
      loiGiai: bai(['go("R")', 'hook()', 'crawl("R")', 'jump("R")', 'unhook()']),
      sao: { o: 26, nhip: 12 },
      loiSai: [
        { moTa: 'Đi bộ: đụng gầm', baiLam: bai(['go("R")', 'hook()', 'walk("RRRR")', 'unhook()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chui xong đi bộ: rơi hố', baiLam: bai(['go("R")', 'hook()', 'crawl("R")', 'walk("RR")', 'unhook()']), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['crawl("R") qua gầm rồi đứng dậy; jump("R") bật qua hố.', 'Thả bằng unhook() ở ô đích.']
    }),

    trum({
      so: 4, ten: 'Chui lên nhận hộp', hang: 'luyen', kieu: 'doi', hamCuaEmCan: ['go_wall', 'pass_box', 'crawl', 'wait_n', 'hop_drop'],
      deBai: 'Nhện ở dưới gầm thấp: chui lên tới chỗ nhận hộp, chờ xích pass_box(), rồi hop_drop("R") qua hố vào ô đích.',
      veMaMau: 'Chương trình có sẵn: nhện chưa chui lên. Viết tiếp cho nhện.',
      san: ['########', '#o.....#', '##.#D###', '##.u.###', '##n#####', '##.#####', '########'],
      bd: [{ x: 6, y: 1, huong: 3 }, { x: 2, y: 5, huong: 0 }],      // 30/10: xích lùi xa một ô (đường cong trước màn Hai chuyến qua đệm N)
      maMau: B(['go_wall()', 'pass_box()'], ['hop_drop("R")']),
      loiGiai: B(['go_wall()', 'pass_box()'], ['crawl("U")', 'wait_n(3)', 'hop_drop("R")']),
      sao: { o: 48, nhip: 14 },
      loiSai: [
        { moTa: 'Chui lên rồi gắp ngay: hộp chưa tới', baiLam: B(['go_wall()', 'pass_box()'], ['crawl("U")', 'hop_drop("R")']), phaiCoMa: ['kep-hut'] },
        { moTa: 'Đi đứng lên: đụng gầm', baiLam: B(['go_wall()', 'pass_box()'], ['walk("UU")', 'wait_n(3)', 'hop_drop("R")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['crawl("U") đưa nhện lên hai ô, qua gầm.', 'Đếm nhịp: chui lên xong rồi hộp mới tới.']
    }),

    trum({
      so: 5, ten: 'Hai sắt, hai lối', hang: 'luyen', kieu: 'bung', vatCan: 'sat', hamCuaEmCan: ['hook', 'unhook', 'jump', 'trail', 'crawl'],
      deBai: 'Hai vật sắt, hai ô đích. Vật thứ nhất dưới chân nhện: nhảy qua hố sang ô đích. Vật thứ hai ở dưới hai ô: mang nó chui qua gầm sang trái vào ô đích thứ hai.',
      veMaMau: 'Chương trình có sẵn làm xong vật thứ nhất. Viết tiếp.',
      san: ['#####', '#ouD#', '###.#', '#Dno#', '#####'], vatChat: ['.....', '.s...', '.....', '...s.', '.....'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['hook()', 'jump("R")', 'unhook()']),
      loiGiai: bai(['hook()', 'jump("R")', 'unhook()', 'trail("DD")', 'hook()', 'crawl("L")', 'unhook()']),
      sao: { o: 30, nhip: 16 },
      loiSai: [
        { moTa: 'Mang vật thứ hai đi đứng: đụng gầm', baiLam: bai(['hook()', 'jump("R")', 'unhook()', 'trail("DD")', 'hook()', 'trail("LL")', 'unhook()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên thả vật thứ nhất: nhện mang nó xuống luôn', baiLam: bai(['hook()', 'jump("R")', 'trail("DD")', 'hook()', 'crawl("L")', 'unhook()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thả vật này rồi mới đi lấy vật kia: bụng chỉ giữ một vật.', 'Gầm ở bên trái vật thứ hai: crawl("L").']
    }),

    trum({
      so: 6, ten: 'Hai chuyến qua đệm N', hang: 'bien-the', kieu: 'xe', vatCan: 'sat', hamCuaEmCan: ['fetch_iron', 'turn_right', 'turn_left'],
      deBai: 'Hai vật sắt, mỗi vật cuối một hành lang có đệm N trên hố. fetch_iron(4) lấy vật bên phải, thả vào ô đích bên trái. Rẽ phải, fetch_iron(3) lấy vật phía trên, về rồi rẽ trái thả vào ô đích ở hành lang dưới.',
      veMaMau: 'Chương trình có sẵn làm xong vật thứ nhất. Viết tiếp.',
      san: ['##########', '#o########', '#.########', '#.u.######', '#.##.#####', '#.##u#####', 'D.D....o##', '##########'],
      vatChat: ['..........', '.s........', '..........', '..........', '..........', '..........', '.......s..', '..........'],
      demTu: [{ x: 4, y: 4, cuc: 'N' }, { x: 3, y: 3, cuc: 'N' }],
      batDau: { x: 1, y: 6, huong: 1 },
      maMau: bai(nhieu(['fetch_iron(4)'], THA)),
      loiGiai: bai(nhieu(['fetch_iron(4)'], THA, ['turn_right()', 'fetch_iron(3)', 'turn_left()'], THA)),
      sao: { o: 24, nhip: 20 },
      loiSai: [
        { moTa: 'Chuyến hai fetch_iron(2): vật sắt còn cách 3 ô, ngoài tầm', baiLam: bai(nhieu(['fetch_iron(4)'], THA, ['turn_right()', 'fetch_iron(2)', 'turn_left()'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Về rồi thả luôn: vật rơi xuống tường dưới, không ra ô đích', baiLam: bai(nhieu(['fetch_iron(4)'], THA, ['turn_right()', 'fetch_iron(3)'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['fetch_iron(n): đi n ô có bật N, quay đầu, đi n ô về.', 'Về tới chỗ xuất phát xe quay mặt xuống: rẽ trái là chĩa sang ô đích thứ hai.']
    }),

    trum({
      so: 7, ten: 'Mốc kiêm công tắc', hang: 'bien-the', kieu: 'doi', hamCuaEmCan: ['go_wall', 'pick', 'spin', 'wait_n', 'back', 'drop', 'crawl', 'jump', 'walk'],
      deBai: 'Xích chở hộp sang ô đích, nhưng giữa đường có đệm S trên hố: xích không có nam châm nên bị hút như sắt. Ô ngay sau ô đích là nút TẮT đệm. Nhện chui gầm, nhảy hố, lên đứng trên nút: vừa tắt đệm, vừa làm mốc. Xích chờ rồi mới chở hộp sang.',
      veMaMau: 'Chương trình có sẵn: xích chở sang ngay, bị đệm hút xuống hố. Thêm wait_n cho xích, viết đường nhện.',
      san: ['#####.####', '#####u####', '#o.....DM#', '########.#', '#.n.u....#', '##########'],
      demTu: [{ x: 5, y: 0, cuc: 'S', nut: { x: 8, y: 2 }, khiDe: 'tat' }],
      bd: [{ x: 4, y: 2, huong: 3 }, { x: 1, y: 4, huong: 0 }],
      maMau: B(['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()'], ['crawl("R")']),
      loiGiai: B(['go_wall()', 'pick()', 'spin()', 'wait_n(7)', 'wait_n(7)', 'go_wall()', 'back()', 'drop()'], ['crawl("R")', 'jump("R")', 'walk("RRR")', 'walk("UU")']),
      sao: { o: 56, nhip: 29 },
      loiSai: [
        { moTa: 'Xích không chờ: đệm S còn chạy, hút xích xuống hố', baiLam: B(['go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()'], ['crawl("R")', 'jump("R")', 'walk("RRR")', 'walk("UU")']), phaiCoMa: ['dem-roi-ho'] },
        { moTa: 'Nhện dừng dưới nút: đệm không tắt', baiLam: B(['go_wall()', 'pick()', 'spin()', 'wait_n(7)', 'wait_n(7)', 'go_wall()', 'back()', 'drop()'], ['crawl("R")', 'jump("R")', 'walk("RRR")', 'walk("U")']), phaiCoMa: ['dem-roi-ho'] }
      ],
      goiY: ['Đệm tắt từ nhịp ngay sau khi nhện lên nút.', 'Xích lấy hộp và quay đầu xong ở nhịp 7: còn chờ nhện khá lâu, mà mỗi lần wait_n chỉ chờ tới 12 nhịp.']
    }),

    trum({
      so: 9, ten: 'Bụng nhện đủ ngón', hang: 'bien-the', kieu: 'bung', hamCuaEmCan: ['hook_for', 'unhook', 'jump', 'trail', 'crawl'],
      deBai: 'Nhện đứng trùm trên vật chữ N. Hút bằng hook_for("N"), nhảy qua hố, thả vào ô đích đỏ. Xuống một ô, nhảy qua hố dưới tới vật chữ S, hút bằng hook_for("S"), chui qua gầm sang trái, thả vào ô đích xanh.',
      veMaMau: 'Chương trình có sẵn làm xong vật N. Viết tiếp cho vật S.',
      san: ['#####', '#ouD#', '###.#', '###u#', '#Dno#', '#####'], vatChat: ['.....', '.N...', '.....', '.....', '...S.', '.....'],
      mau: ['.....', '...r.', '.....', '.....', '.b...', '.....'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['hook_for("N")', 'jump("R")', 'unhook()']),
      loiGiai: bai(['hook_for("N")', 'jump("R")', 'unhook()', 'trail("D")', 'jump("D")', 'hook_for("S")', 'crawl("L")', 'unhook()']),
      sao: { o: 34, nhip: 17 },
      loiSai: [
        { moTa: 'Đi bộ xuống: rơi hố', baiLam: bai(['hook_for("N")', 'jump("R")', 'unhook()', 'trail("DD")', 'hook_for("S")', 'crawl("L")', 'unhook()']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Hút vật S bằng hook_for("N"): cùng cực, vật nằm yên', baiLam: bai(['hook_for("N")', 'jump("R")', 'unhook()', 'trail("D")', 'jump("D")', 'hook_for("N")', 'crawl("L")', 'unhook()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Nhảy xuống cũng được: jump("D").', 'hook_for(p) bật cực ngược với p.']
    }),

    trum({
      so: 8, ten: 'Đội bãi từ', hang: 'bien-the', kieu: 'doi', khung: { chinh: 16, moiHam: 10 },      // 30/10 nghiệm thu: trùm mùa cũ (gần bản sao che-doi-xich.19) lùi về vị trí 9
      hamCuaEmCan: ['go_wall', 'pass_box', 'tr_right', 'pick', 'spin', 'wait_n', 'back', 'drop', 'hop_drop', 'walk'],
      deBai: 'Hai hộp, hai ô đích. Xích chuyền hộp gần cho nhện; nhện mang qua hố vào ô đích dưới, rồi đi lên đứng trên nút TẮT đệm S, cũng là mốc sau ô đích trên. Xích lấy hộp xa, chờ nhện lên nút, rồi chở hộp qua chỗ đệm (đã tắt) sang ô đích trên.',
      veMaMau: 'Chương trình có sẵn mới chuyền xong hộp gần. Viết tiếp cả hai.',
      san: ['#####.####', '#####u####', '#oo....DM#', '###.#D##.#', '###.u....#', '##########'],
      demTu: [{ x: 5, y: 0, cuc: 'S', nut: { x: 8, y: 2 }, khiDe: 'tat' }],
      bd: [{ x: 4, y: 2, huong: 3 }, { x: 3, y: 4, huong: 0 }],
      maMau: B(['go_wall()', 'pass_box()'], ['wait_n(6)', 'hop_drop("R")']),
      loiGiai: B(['go_wall()', 'pass_box()', 'tr_right()', 'go_wall()', 'pick()', 'spin()', 'wait_n(8)', 'go_wall()', 'back()', 'drop()'], ['wait_n(6)', 'hop_drop("R")', 'walk("RRR")', 'walk("UU")']),
      sao: { o: 62, nhip: 31 },
      loiSai: [
        { moTa: 'Xích không chờ: đệm còn chạy, hút xích xuống hố', baiLam: B(['go_wall()', 'pass_box()', 'tr_right()', 'go_wall()', 'pick()', 'spin()', 'go_wall()', 'back()', 'drop()'], ['wait_n(6)', 'hop_drop("R")', 'walk("RRR")', 'walk("UU")']), phaiCoMa: ['dem-roi-ho'] },
        { moTa: 'Nhện không lên nút: đệm không tắt', baiLam: B(['go_wall()', 'pass_box()', 'tr_right()', 'go_wall()', 'pick()', 'spin()', 'wait_n(8)', 'go_wall()', 'back()', 'drop()'], ['wait_n(6)', 'hop_drop("R")', 'walk("RRR")']), phaiCoMa: ['dem-roi-ho'] }
      ],
      goiY: ['Nhện làm ba việc: nhận hộp, mang qua hố, lên nút làm mốc.', 'Xích chỉ đi qua chỗ đệm khi nhện đã đứng trên nút từ nhịp trước.']
    }),
    trum({
      // 30/10 nghiệm thu độc lập: trùm mùa kiểm lõi mùa 3. Ba sân (không viết cứng được): vật cực N, vật cực S, quặng sắt ở xa gần khác nhau.
      // while có and (front_pole thấy vật nam châm trong 3 ô, front_metal thấy sắt trong 2 ô: thiếu một vế là xe đâm vào vật), biến chuỗi p = front_pole(),
      // if / elif / else ba việc khác nhau: vật nam châm thì bật CÙNG cực đẩy nó trượt vào ô đích cuối hành lang, sắt thì take_iron() mang về ô đích sau lưng.
      // Không đặt đệm từ: đệm kéo cả robot chưa bật nam châm (luật P1b), đặt trên đường đi tới là xe rơi trước khi kịp đọc cực.
      so: 10, ten: 'Trùm mùa: xe thăm dò phân loại', hang: 'trum', kieu: 'xe', khung: { chinh: 18, moiHam: 10 }, hamCuaEmCan: ['move', 'take_iron'],
      deBai: 'Trùm mùa. Ba sân, cuối hành lang là vật cực N, vật cực S hay quặng sắt, xa gần khác nhau. Tiến tới khi cảm biến thấy vật nam châm HOẶC thấy sắt. Rồi đọc p = front_pole(): vật N thì bật N, vật S thì bật S (cùng cực, vật trượt vào ô đích cuối hành lang); không phải nam châm thì take_iron() mang sắt về ô đích sau lưng. Bật nhầm cực là vật bị hút về mũi xe.',
      veMaMau: 'Chương trình có sẵn chỉ dừng khi thấy vật nam châm rồi luôn take_iron(). Chạy thử từng sân rồi sửa.',
      san: [
        ['#############', '#.......o..D#', '#############'],
        ['#########', '#...o..D#', '#########'],
        ['#########', '#..D..o.#', '#########']
      ],
      vatChat: [
        ['.............', '........N....', '.............'],
        ['.........', '....S....', '.........'],
        ['.........', '......s..', '.........']
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['while front_pole() == "none":', '    move()', 'take_iron()']),
      loiGiai: bai(['while front_pole() == "none" and not front_metal():', '    move()', 'p = front_pole()', 'if p == "N":', '    magnet_n()', '    wait()',
        'elif p == "S":', '    magnet_s()', '    wait()', 'else:', '    take_iron()']),
      sao: { o: 22, nhip: 6 },
      loiSai: [
        { moTa: 'Chỉ dừng khi thấy nam châm: sân 3 xe đâm mãi vào quặng sắt', baiLam: bai(['while front_pole() == "none":', '    move()', 'p = front_pole()', 'if p == "N":', '    magnet_n()', '    wait()',
          'elif p == "S":', '    magnet_s()', '    wait()', 'else:', '    take_iron()']), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Bật khác cực như grip(): vật nam châm bị hút về mũi xe, không vào ô đích', baiLam: bai(['while front_pole() == "none" and not front_metal():', '    move()', 'p = front_pole()', 'if p == "N":', '    magnet_s()', '    wait()',
          'elif p == "S":', '    magnet_n()', '    wait()', 'else:', '    take_iron()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên nhánh sắt: else cũng bật N, sắt bị hút dính mà không về ô đích', baiLam: bai(['while front_pole() == "none" and not front_metal():', '    move()', 'p = front_pole()', 'if p == "S":', '    magnet_s()', '    wait()',
          'else:', '    magnet_n()', '    wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['front_pole() thấy vật nam châm cách 3 ô, front_metal() thấy sắt cách 2 ô: dừng khi một trong hai thấy.', 'Cùng cực thì đẩy, khác cực thì hút. Sắt thì cực nào cũng hút.']
    })
  );

  ManHoc.manTrumMua3 = DS;
  if (laNode) module.exports = ManHoc;
})();

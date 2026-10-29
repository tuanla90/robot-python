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
      so: 1, ten: 'Nhện vượt chướng', hang: 'lam-quen', kieu: 'nhen', mucTieu: 'toi-co', hamCuaEmCan: ['go', 'jump', 'crawl'],
      deBai: 'Ôn nhện và nhảy: hành lang có một hố và một gầm thấp. Bước một ô, nhảy qua hố, chui qua gầm, bước thêm một ô là tới cờ.',
      veMaMau: 'Chương trình có sẵn đi thẳng: nhện rơi hố. Viết lại.',
      san: ['#########', '#..u.n.F#', '#########'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['walk("RRRRRR")']),
      loiGiai: bai(['go("R")', 'jump("R")', 'crawl("R")', 'go("R")']),
      sao: { o: 21, nhip: 12 },
      loiSai: [
        { moTa: 'Đi thẳng: rơi xuống hố', baiLam: bai(['walk("RRRRRR")']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Nhảy xong đi đứng qua gầm: đụng gầm', baiLam: bai(['go("R")', 'jump("R")', 'walk("RRR")']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['jump("R") bật qua đúng một ô hố.', 'crawl("R") chui qua gầm rồi đứng dậy.']
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
      so: 3, ten: 'Gọi sắt rồi đi vòng', hang: 'luyen', kieu: 'xe', vatCan: 'sat', hamCuaEmCan: ['call_iron', 'detour'],
      deBai: 'Ôn bãi từ: xe đứng trên nút bật đệm. call_iron() gọi vật sắt trong hốc ra rồi hút về. Ô đích ở góc trên bên trái: detour(1) đi một vòng nhỏ rồi thả.',
      veMaMau: 'Chương trình có sẵn gọi được sắt. Viết tiếp đoạn đi vòng và thả.',
      san: ['#D#o###', '#M.....', '#...###'], vatChat: ['...s...', '.......', '.......'],
      demTu: [{ x: 3, y: 2, cuc: 'S', nut: { x: 1, y: 1 } }],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['call_iron()']),
      loiGiai: bai(nhieu(['call_iron()', 'detour(1)'], THA)),
      sao: { o: 17, nhip: 10 },
      loiSai: [
        { moTa: 'Quay đầu thả: vật rơi lên nút, không phải ô đích', baiLam: bai(nhieu(['call_iron()', 'u_turn()'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'detour(2): vòng quá rộng, đụng tường', baiLam: bai(nhieu(['call_iron()', 'detour(2)'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['call_iron(): đè nút một nhịp, bước khỏi nút, hút.', 'detour(1): ba lần rẽ phải đi một ô, mũi xe chĩa lên ô đích.']
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
      so: 7, ten: 'Đội chuyền qua hố', hang: 'bien-the', kieu: 'doi', hamCuaEmCan: ['go_wall', 'pass_box', 'idle', 'hop_drop'],
      deBai: 'Ôn đội: xích tới hộp, pass_box() thả trước mặt nhện. Nhện idle chờ hộp rồi hop_drop("R") qua hố vào ô đích.',
      veMaMau: 'Chương trình có sẵn: nhện gắp ngay khi hộp chưa tới. Thêm idle cho nhện.',
      san: ['########', '#o....##', '##.#D###', '##.u.###', '########'],
      bd: [{ x: 5, y: 1, huong: 3 }, { x: 2, y: 3, huong: 0 }],
      maMau: B(['go_wall()', 'pass_box()'], ['hop_drop("R")']),
      loiGiai: B(['go_wall()', 'pass_box()'], ['idle(8)', 'hop_drop("R")']),
      sao: { o: 42, nhip: 14 },
      loiSai: [
        { moTa: 'Nhện gắp ngay: hộp chưa tới', baiLam: B(['go_wall()', 'pass_box()'], ['hop_drop("R")']), phaiCoMa: ['kep-hut'] }
      ],
      goiY: ['Xích đi ba ô rồi mới pass_box(): đếm nhịp tới lúc hộp nằm xuống.', 'idle(n) chờ đúng n nhịp.']
    }),

    man({
      so: 8, ten: 'Sắt thẳng hay sau góc', hang: 'bien-the', kieu: 'xe', vatCan: 'sat', hamCuaEmCan: ['seek_safe', 'take_iron', 'turn_right'],
      deBai: 'Ôn and / or: hai sân. Đi tới khi trước mặt hết trống hoặc thấy sắt (seek_safe()). Nếu thấy sắt thì take_iron(). Không thì rẽ phải, đi tiếp như vậy rồi take_iron().',
      veMaMau: 'Chương trình có sẵn chỉ đúng sân 1. Thêm if / else.',
      san: [['#######', '#.D..o#', '#######', '#######'], ['######', '#...D#', '####.#', '####.#', '####o#', '######']],
      vatChat: [['.......', '.....s.', '.......', '.......'], ['......', '......', '......', '......', '....s.', '......']],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['seek_safe()', 'take_iron()']),
      loiGiai: bai(['seek_safe()', 'if front_metal():', '    take_iron()', 'else:', '    turn_right()', '    seek_safe()', '    take_iron()']),
      sao: { o: 22, nhip: 8 },
      loiSai: [
        { moTa: 'Không hỏi: sân 2 xe hút vào tường', baiLam: bai(['seek_safe()', 'take_iron()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Rẽ trái thay vì rẽ phải', baiLam: bai(['seek_safe()', 'if front_metal():', '    take_iron()', 'else:', '    turn_left()', '    seek_safe()', '    take_iron()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['seek_safe() dừng vì tường hoặc vì sắt: hỏi front_metal() để biết vì sao.', 'Sau khi rẽ, gọi lại seek_safe().']
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

  ManHoc.manTrumMua3 = DS;
  if (laNode) module.exports = ManHoc;
})();

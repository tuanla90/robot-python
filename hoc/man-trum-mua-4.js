/* ============================================================================
   man-trum-mua-4.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 10 "Drone kẻ vạch R1" (gói cuối mùa, KE-HOACH-MUA-4.md; phiên "Mùa 4" tự viết, 30/10).
   Gói xuất xưởng: mỗi màn ghép lại hai, ba thứ của các gói trước (luật recall: gói 9 + 10 nhắc mỗi gói 1–8 ít nhất ba lần, màn mới dùng ít nhất hai gói).
     - `tong-hop-4`: chương 1 "Đủ bộ": ôn từng cặp, đủ các robot của mùa: drone nam châm + camera (gói 4, 7) ghé trạm sạc (gói 5), xe máy sơn + camera bốn hướng
       (gói 2, 3, 6), đội drone và xe (gói 8), drone sơn đọc mật lệnh (gói 4, 9), danh sách hướng bay (gói 1), sửa hàm chấm theo mũi tên (gói 7, 9);
       màn 10 trùm chương: chép bảng mẫu, đáp sạc, vạch qua rào, chấm theo danh sách.
     - `trum-mua-4`: chương 2 "Phố mới kẻ vạch": chế lệnh cho Drone kẻ vạch R1 (mark_dash, charge_if, stair_line, lift_aside cho đội, bar_len, street), sửa pond_frame,
       hàm gọi hàm của em (street_dock, two_dash); trum-mua-4.10 TRÙM CUỐI MÙA 4. Hai màn xe cũ che-may-son.7, .8 từng đứng ở chỗ .8, .9: nay ở mùa 5 (che-may-son-cu).
   Mã màn: tong-hop-4.1 … .10; trum-mua-4.1 … .10.
   Máy kiểm: hoc/kiem-man-mua-4.mjs, hoc/kiem-lo-trinh.mjs mục mùa 4.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var SON = ['ink', 'dot', 'pen_down', 'pen_up'];
  var NC = ['magnet_n', 'magnet_s', 'magnet_off'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var DAP = ['land', 'take_off', 'battery'];
  var CAM_DUOI = { ma: 'camera-4', o: 'tren', taiCho: true };
  var CAM_XE = { ma: 'camera-4', o: 'tren' };
  var KC = { ma: 'khoang-cach', o: 'hong' };
  // Robot của mùa
  var R = {
    'drone-son': { loaiRobot: 'drone', robot: { than: 'drone', tay: 'son', camBien: [CAM_DUOI] }, hamGoc: BAY.concat(SON, ['color'], DAP) },
    'drone-nc': { loaiRobot: 'drone', robot: { than: 'drone', tay: 'nam-cham', camBien: [CAM_DUOI] }, hamGoc: BAY.concat(NC, ['color'], DAP) },
    'xe-son': { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'son', camBien: [CAM_XE] }, hamGoc: BANH.concat(SON, ['color']) },
    'xe-son-kc': { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'son', camBien: [KC] }, hamGoc: BANH.concat(SON, ['front_clear']) },
    'xe-kep': { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'kep', camBien: [CAM_XE, KC] }, hamGoc: BANH.concat(TAY, ['front_clear', 'color']) }
  };
  function chep(x) { return JSON.parse(JSON.stringify(x)); }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  /** Bài làm hai robot (R1, R2). */
  function B(c1, c2, them) { return Object.assign({ doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: [] }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function LAP(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(Array.isArray(than) ? than : [than])); }

  /** m.r: mã robot trong R (m.r2 + m.bd: màn hai robot, R2 khoá chương trình khi m.khoa2). Mục tiêu mặc định: robot sơn thì to-hinh, nam châm thì dua-vat. */
  function man(m) {
    var r = R[m.r], r2 = m.r2 ? R[m.r2] : null, bd = m.bd, khoa2 = m.khoa2;
    delete m.r; delete m.r2; delete m.bd; delete m.khoa2;
    m.chuong = m.chuong || 'tong-hop-4';
    m.cauTruc = ['for', 'if', 'while', 'list'];
    var boPin = function (ds) { return m.pin === undefined ? ds.filter(function (t) { return t !== 'battery'; }) : ds.slice(); };   // battery() cần màn khai pin
    m.loaiRobot = r.loaiRobot; m.robot = chep(r.robot); m.hamGoc = boPin(r.hamGoc);
    var coSon = r.robot.tay === 'son' || (r2 && r2.robot.tay === 'son');
    m.mucTieu = m.mucTieu || (coSon ? 'to-hinh' : 'dua-vat');
    if (m.mucTieu === 'dua-vat') m.vatCan = 'sat';
    m.nhipTheoLoiGiai = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    if (r2) {
      m.batDau = bd[0];
      m.doi = [Object.assign({ batDau: bd[0] }, chep(r)), Object.assign({ batDau: bd[1] }, chep(r2))];
      m.doi.forEach(function (d) { d.hamGoc = boPin(d.hamGoc); });
      if (khoa2) m.doi[1].coDinh = true;
      m.bienDem = true;
      if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
      m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    }
    return ManHoc.chuanHoa(m);
  }
  function manChe(m) { m.chuong = 'trum-mua-4'; if (m.chinhCoDinh !== false) m.chinhCoDinh = true; else delete m.chinhCoDinh; return man(m); }

  /* ---------------------------------------------------------------- chương tong-hop-4 */
  var C_TRAM = ['fly_dock(3)', 'go_right()', 'lift_by_color()'];
  var C_XANH = ['ink("yellow")'].concat(LAP(7, ['dot()', 'green_step()']));
  var C_DON = ['c = color("here")', 'go_right()', 'seek_here(c)', 'deliver_up(2)'];
  var C_DO = ['ink("blue")', 'pen_down()', 'go_to("red")', 'turn_right()', 'go_to("red")'];
  var R2_CHO = ['while front_clear():', '    wait()', 'sort_by_color()'];
  var R1_CHUYEN = ['magnet_n()', 'wait()', 'go_down()', 'go_down()', 'magnet_off()', 'wait()'];
  var C_MAT = ['a = []', 'read_row(a, 4)'].concat(LAP(4, 'go_left()'), ['paint_list(a)']);
  var R2_KE = ['ink("yellow")', 'pen_down()', 'while not front_clear():', '    wait()', 'forward(3)'];
  var R1_DON = ['go_down()', 'magnet_n()', 'wait()', 'go_up()', 'magnet_off()', 'wait()'];
  var C_HUONG = ['path = ["right", "down", "right", "down"]', 'ink("blue")', 'for d in path:', '    dot()', '    if d == "right":', '        go_right()', '    else:', '        go_down()'];
  var C_MUI = ['ink("red")'].concat(LAP(6, 'mark_step()'));
  var C_CA = ['trace_marks(4)', 'dock()', 'go_right()', 'go_right()', 'stripe("yellow", 1)', 'go_down()',
    'for c in ["red", "blue", "red"]:', '    go_left()', '    ink(c)', '    dot()', 'wait()'];
  /* ---------------------------------------------------------------- chương trum-mua-4 */
  var T_DASH = ['for i in range(n):', '    if color("here") == "yellow":', '        dot()', '    go_right()'];
  var T_SAC = ['if battery() < k:', '    land()', '    take_off()'];
  var C_SAC = ['ink("yellow")', 'pen_down()'].concat(LAP(3, ['go_right()', 'go_right()', 'charge_if(4)'], 'j'));
  var T_STAIRS = ['ink(c)', 'pen_down()', 'for i in range(n):', '    go_right()', '    go_down()', 'pen_up()'];
  var C_STAIRS = ['stair_line("red", 2)', 'go_right()', 'stair_line("blue", 1)'];
  var T_FRAME = ['pen_down()'].concat(LAP('n', 'go_right()'), LAP('n', 'go_down()'), LAP('n', 'go_left()'), LAP('n', 'go_up()'));
  var T_FRAME_SAI = ['pen_down()'].concat(LAP('n', 'go_right()'), LAP('n', 'go_down()'), LAP('n', 'go_right()'), LAP('n', 'go_up()'));
  var T_LIFT = ['magnet_n()', 'wait()', 'go_up()', 'magnet_off()', 'wait()'];
  var R1_LIFT = ['go_down()', 'lift_aside()', 'go_right()', 'go_right()', 'go_down()', 'lift_aside()'];
  var R2_LIFT = ['ink("yellow")', 'pen_down()', 'for i in range(2):', '    while not front_clear():', '        wait()', '    forward(2)', 'forward(2)'];
  var T_BAR = ['ink(c)', 'pen_down()', 'for x in a:', '    go_left()', 'pen_up()'];
  var C_BAR = ['a = []', 'count_here(a, 9, "red")', 'go_down()', 'go_down()', 'bar_len("blue", a)'];
  var T_STREET = ['stripe(c, n)', 'go_down()', 'go_down()', 'for i in range(n):', '    go_left()'];
  var C_STREET = ['street("yellow", 5)', 'street("blue", 4)', 'stripe("yellow", 3)'];
  var T_SDOCK = ['street(c, n)', 'charge_if(9)'];
  var C_SDOCK = ['street_dock("yellow", 5)', 'street_dock("blue", 4)', 'stripe("yellow", 3)'];
  var T_TWO = ['mark_dash(n)', 'go_down()', 'go_down()', 'for i in range(n):', '    go_left()'];
  var C_TWO = ['ink("yellow")', 'two_dash(6)', 'mark_dash(6)'];
  var C_R1 = ['trace_marks(4)', 'charge_if(5)', 'ink("yellow")', 'mark_dash(4)', 'charge_if(5)', 'go_down()',
    'for c in ["red", "yellow", "red"]:', '    go_left()', '    ink(c)', '    dot()', 'go_left()', 'charge_if(5)', 'go_down()', 'stripe("blue", 4)'];

  var DS = [
    /* ================================================= chương tong-hop-4 "Đủ bộ" ================================================= */
    man({
      so: 1, ten: 'Ghé trạm rồi phân loại', r: 'drone-nc', pin: 6, hamCuaEmCan: ['fly_dock', 'lift_by_color'],
      deBai: 'Ôn gói Trạm sạc và Nhìn dưới chân. Drone pin 6 phải ghé trạm sạc ở ô thứ tư, rồi bay tới hộp, đọc màu hộp dưới chân: hộp đỏ lên ô đích trên, hộp màu khác xuống ô đích dưới. ' +
        'Hai sân, hộp hai màu. Dùng fly_dock và lift_by_color em đã chế.',
      veMaMau: 'Chương trình có sẵn bay thẳng tới hộp nên hết pin. Ghé trạm bằng fly_dock(3).',
      san: [['....D', '...Po', '....D'], ['....D', '...Po', '....D']],
      mau: [['....r', '.....', '....b'], ['....r', '.....', '....b']],
      vatMau: [['.....', '....r', '.....'], ['.....', '....b', '.....']],
      vatChat: [['.....', '....s', '.....'], ['.....', '....s', '.....']],
      batDau: { x: 0, y: 1 },
      maMau: bai(LAP(4, 'go_right()').concat(['lift_by_color()'])),
      loiGiai: bai(C_TRAM),
      sao: { o: 17, nhip: 9 },
      loiSai: [
        { moTa: 'Không ghé trạm: hết pin', baiLam: bai(LAP(4, 'go_right()').concat(['lift_by_color()'])), phaiCoMa: ['het-pin'] }
      ],
      goiY: ['fly_dock(3) bay ba ô rồi đáp sạc.', 'lift_by_color() đọc màu hộp dưới chân, hút, đưa lên hay xuống rồi thả.']
    }),

    man({
      so: 2, ten: 'Xe chấm theo đường xanh', r: 'xe-son', hamCuaEmCan: ['green_step'],
      deBai: 'Ôn gói Chấm sơn và Camera bốn hướng. Xe máy sơn có camera bốn hướng. Đường xanh lá có một chỗ rẽ: mỗi bước, chấm vàng ô đang đứng rồi green_step() đi theo đường xanh. Hai sân, rẽ hai phía.',
      veMaMau: 'Chương trình có sẵn chỉ đi thẳng nên chấm ra ngoài đường. Dùng green_step() em đã chế.',
      san: [['.....', '.....', '.....'], ['.....', '.....', '.....']],
      mau: [['.....', '..ggg', 'ggg..'], ['ggg..', '..ggg', '.....']],
      hinh: [['.....', '..yy.', 'yyy..'], ['yyy..', '..yy.', '.....']],
      batDau: [{ x: 0, y: 2, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      maMau: bai(['ink("yellow")'].concat(LAP(7, ['dot()', 'move()']))),
      loiGiai: bai(C_XANH),
      sao: { o: 17, nhip: 7 },
      loiSai: [
        { moTa: 'Đi thẳng: chấm ra ngoài đường', baiLam: bai(['ink("yellow")'].concat(LAP(7, ['dot()', 'move()']))), phaiCoMa: ['to-thua'] },
        { moTa: 'Quên chấm', baiLam: bai(['ink("yellow")'].concat(LAP(7, 'green_step()'))), phaiCoMa: [] }
      ],
      goiY: ['dot() làm ở nhịp kế: chấm ô đang đứng trước khi xe đi hay quay.', 'Lúc xe quay tại chỗ, chấm lại ô cũ không sao.']
    }),

    man({
      so: 3, ten: 'Giao hộp theo đơn', r: 'drone-nc', hamCuaEmCan: ['seek_here', 'deliver_up'],
      deBai: 'Ôn gói Phố màu và Nhìn dưới chân. Ô xuất phát là đơn hàng: màu ô đó là màu hộp khách cần. Đọc đơn, rời ô đơn, tìm hộp cùng màu bằng seek_here, rồi deliver_up(2) lên ô đích. Hai sân.',
      veMaMau: 'Chương trình có sẵn đọc đơn rồi nâng luôn ô kế bên. Thêm seek_here(c).',
      san: [['...D..', '......', '...o..'], ['.D....', '......', '.o....']],
      mau: [['......', '......', 'yrg.b.'], ['......', '......', 'b.ryg.']],
      vatMau: [['......', '......', '...y..'], ['......', '......', '.b....']],
      vatChat: [['......', '......', '...s..'], ['......', '......', '.s....']],
      batDau: { x: 0, y: 2 },
      maMau: bai(['c = color("here")', 'go_right()', 'deliver_up(2)']),
      loiGiai: bai(C_DON),
      sao: { o: 12, nhip: 7 },
      loiSai: [
        { moTa: 'Không rời ô đơn: tìm thấy ngay chính ô đơn', baiLam: bai(['c = color("here")', 'seek_here(c)', 'deliver_up(2)']), phaiCoMa: [] },
        { moTa: 'Tìm hộp vàng cố định', baiLam: bai(['c = color("here")', 'go_right()', 'seek_here("yellow")', 'deliver_up(2)']), phaiCoMa: [] }
      ],
      goiY: ['Ô đơn cũng có màu c: rời nó một ô rồi mới tìm.', 'seek_here(c) dừng trên hộp cùng màu đơn.']
    }),

    man({
      so: 4, ten: 'Kẻ tới vạch đỏ', r: 'xe-son', hamCuaEmCan: ['go_to', 'turn_right'],
      deBai: 'Ôn gói Nét liền và Camera bốn hướng. Xe hạ bút kẻ vạch xanh dương, đi tới khi trước mặt là ô đỏ, rẽ phải, lại đi tới ô đỏ thứ hai. Hai sân, ô đỏ ở chỗ khác nhau.',
      veMaMau: 'Chương trình có sẵn đi đúng số ô của sân thứ nhất. Dùng go_to("red") em đã chế.',
      san: [['.....', '.....', '.....', '.....'], ['.....', '.....', '.....', '.....']],
      mau: [['....r', '.....', '.....', '...r.'], ['..r..', '.....', '.....', '.r...']],
      hinh: [['bbbb.', '...b.', '...b.', '.....'], ['bb...', '.b...', '.b...', '.....']],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['ink("blue")', 'pen_down()', 'forward(3)', 'turn_right()', 'forward(2)']),
      loiGiai: bai(C_DO),
      sao: { o: 12, nhip: 6 },
      loiSai: [
        { moTa: 'Đi theo số ô sân thứ nhất', baiLam: bai(['ink("blue")', 'pen_down()', 'forward(3)', 'turn_right()', 'forward(2)']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['go_to(col) đi tới khi ô trước mặt có màu col.', 'Bút hạ thì ô góc lúc xe quay cũng được tô.']
    }),

    man({
      so: 5, ten: 'Đội: chuyền hộp qua rào', r: 'drone-nc', r2: 'xe-kep', khoa2: true, bd: [{ x: 2, y: 0 }, { x: 2, y: 3, huong: 0 }],
      hamCuaEmCan: ['sort_by_color'],
      deBai: 'Ôn gói Đội chia hàng. Hộp sắt nằm sau hàng rào, xe kẹp không với tới. R1 là drone nam châm: hút hộp, bay qua rào, thả xuống ô ngay trước mũi xe. ' +
        'R2 là xe kẹp tự động (đã khoá): chờ tới khi có hộp trước mũi rồi sort_by_color(). Viết R1.',
      veMaMau: 'Chạy thử: xe chờ mãi. Viết chương trình R1.',
      san: ['..o..', '..=..', '.....', '.D.D.'],
      mau: ['.....', '.....', '.....', '.b.r.'],
      vatMau: ['..r..', '.....', '.....', '.....'],
      vatChat: ['..s..', '.....', '.....', '.....'],
      maMau: B(['wait()'], R2_CHO),
      loiGiai: B(R1_CHUYEN, R2_CHO),
      sao: { o: 31, nhip: 8 },
      loiSai: [
        { moTa: 'Thả hộp xuống hàng rào', baiLam: B(['magnet_n()', 'wait()', 'go_down()', 'magnet_off()', 'wait()'], R2_CHO), phaiCoMa: [] }
      ],
      goiY: ['Drone đứng ngay trên hộp: hút luôn.', 'Ô trước mũi xe là ô thứ ba của cột giữa.']
    }),

    man({
      so: 6, ten: 'Chép mật lệnh hàng trên', r: 'drone-son', hamCuaEmCan: ['read_row', 'paint_list'],
      deBai: 'Ôn gói Phố màu và Sơn từ trên cao. Ghi màu bốn ô hàng trên bằng read_row (drone nhìn lên), bay về đầu hàng rồi sơn lại đúng thứ tự bằng paint_list. Hai sân, mật lệnh khác nhau.',
      veMaMau: 'Chương trình có sẵn đã ghi mật lệnh vào a. Viết tiếp: bay về đầu hàng, rồi sơn.',
      san: [['.....', '.....'], ['.....', '.....']],
      mau: [['.rgyb', '.....'], ['.bbry', '.....']],
      hinh: [['.....', 'rgyb.'], ['.....', 'bbry.']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['a = []', 'read_row(a, 4)']),
      loiGiai: bai(C_MAT),
      sao: { o: 12, nhip: 12 },
      loiSai: [
        { moTa: 'Sơn luôn ở cuối hàng: ra ngoài hình', baiLam: bai(['a = []', 'read_row(a, 4)', 'paint_list(a)']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['read_row(a, 4) bay bốn ô sang phải, ghi màu ô phía trên.', 'Bay trái bốn ô về đầu hàng rồi paint_list(a).']
    }),

    man({
      so: 7, ten: 'Đội: dọn lối cho xe kẻ vạch', r: 'drone-nc', r2: 'xe-son-kc', khoa2: true, bd: [{ x: 1, y: 0 }, { x: 0, y: 1, huong: 1 }],
      hamCuaEmCan: ['forward'],
      deBai: 'Ôn gói Đội chia hàng và Nét liền. R2 là xe máy sơn tự động (đã khoá): hạ bút, chờ lối trống rồi kẻ vạch vàng. Hộp sắt chắn ngay trước mũi xe. ' +
        'R1 là drone nam châm đứng trên hộp: hút hộp nhấc lên khỏi đường. Viết R1.',
      veMaMau: 'Chạy thử: xe chờ mãi vì hộp chắn. Viết chương trình R1.',
      san: ['.....', '.o...', '.....'],
      vatChat: ['.....', '.s...', '.....'],
      hinh: ['.....', 'yyyy.', '.....'],
      maMau: B(['wait()'], R2_KE),
      loiGiai: B(R1_DON, R2_KE),
      sao: { o: 16, nhip: 5 },
      loiSai: [
        { moTa: 'Hút mà không bay đi: hộp vẫn chắn', baiLam: B(['go_down()', 'magnet_n()', 'wait()', 'magnet_off()', 'wait()'], R2_KE), phaiCoMa: [] }
      ],
      goiY: ['Drone bay xuống ô có hộp rồi hút.', 'Mang hộp lên hàng trên rồi thả: đường của xe trống.']
    }),

    man({
      so: 8, ten: 'Bay theo danh sách hướng', r: 'drone-son', hamCuaEmCan: [],
      deBai: 'Ôn gói Cất cánh và Chấm sơn. Danh sách path ghi đường bay. Mỗi bước: chấm xanh dương ô đang ở, rồi bay theo hướng trong danh sách.',
      veMaMau: 'Chương trình có sẵn đã bay theo path nhưng chưa sơn. Thêm ink và dot.',
      san: ['...', '...', '...'],
      hinh: ['bb.', '.bb', '...'],
      batDau: { x: 0, y: 0 },
      maMau: bai(['path = ["right", "down", "right", "down"]', 'for d in path:', '    if d == "right":', '        go_right()', '    else:', '        go_down()']),
      loiGiai: bai(C_HUONG),
      sao: { o: 8, nhip: 4 },
      loiSai: [
        { moTa: 'Chấm sau khi bay: lệch một ô', baiLam: bai(['path = ["right", "down", "right", "down"]', 'ink("blue")', 'for d in path:', '    if d == "right":', '        go_right()', '    else:', '        go_down()', '    dot()']), phaiCoMa: [] }
      ],
      goiY: ['dot() làm ở nhịp bay kế tiếp, trước khi bay.', 'Chấm trước, bay sau.']
    }),

    man({
      so: 9, ten: 'Sửa hàm chấm mũi tên', r: 'drone-son', chinhCoDinh: true, hamCuaEmCan: ['arrow_step'],
      deBai: 'Ôn gói Nhìn dưới chân. Hàm của màn mark_step() phải chấm ô đang ở rồi bay theo mũi tên màu (arrow_step của em), nhưng nó bay trước rồi mới chấm. Sửa mark_step; chương trình chính đã khóa. Hai sân.',
      veMaMau: 'Chạy thử: ô xuất phát không được chấm. Đổi thứ tự hai lệnh.',
      san: [['.....', '.....', '.....'], ['.....', '.....', '.....']],
      mau: [['gb...', '.ggb.', '...g.'], ['b....', 'ggb..', '..gg.']],
      hinh: [['rr...', '.rrr.', '...r.'], ['r....', 'rrr..', '..rr.']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_MUI, { hamCuaMan: [H('mark_step', [], ['arrow_step()', 'dot()'])] }),
      loiGiai: bai(C_MUI, { hamCuaMan: [H('mark_step', [], ['dot()', 'arrow_step()'])] }),
      sao: { o: 9, nhip: 6 },
      loiSai: [
        { moTa: 'Không sửa: bay trước rồi mới chấm', baiLam: bai(C_MUI, { hamCuaMan: [H('mark_step', [], ['arrow_step()', 'dot()'])] }), phaiCoMa: [] }
      ],
      goiY: ['dot() chấm ô đang ở ở nhịp bay kế tiếp.', 'arrow_step() đọc mũi tên dưới chân rồi bay một ô.']
    }),

    man({
      so: 10, ten: 'Ca kẻ vạch đầu tiên', hang: 'trum', r: 'drone-son', pin: 14, hamCuaEmCan: ['trace_marks', 'dock', 'stripe'], khung: { chinh: 12, moiHam: 10 },
      deBai: 'Trùm chương: chép bảng mẫu hàng trên xuống bằng trace_marks(4), tới trạm sạc thì dock(), bay qua hàng rào, kẻ hai ô vạch vàng, xuống hàng dưới rồi chấm đỏ, xanh dương, đỏ từ phải sang trái. ' +
        'Hai sân, bảng mẫu khác nhau. Pin 14 không đủ làm một mạch.',
      veMaMau: 'Chương trình có sẵn đã chép bảng mẫu. Viết tiếp phần còn lại.',
      san: [['........', '....P=..', '........'], ['........', '....P=..', '........']],
      mau: [['r.gy....', '........', '........'], ['bb.r....', '........', '........']],
      hinh: [['........', 'r.gy..yy', '....rbr.'], ['........', 'bb.r..yy', '....rbr.']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['trace_marks(4)']),
      loiGiai: bai(C_CA),
      sao: { o: 24, nhip: 14 },
      loiSai: [
        { moTa: 'Không đáp sạc: hết pin', baiLam: bai(C_CA.filter(function (s) { return s !== 'dock()'; })), phaiCoMa: ['het-pin'] },
        { moTa: 'Quên wait(): chấm cuối không kịp tô', baiLam: bai(C_CA.slice(0, -1)), phaiCoMa: [] }
      ],
      goiY: ['trace_marks(4) dừng đúng trên trạm sạc.', 'Hàng dưới: mỗi màu bay trái một ô rồi mới chấm; chấm cuối cần wait().']
    }),

    /* ================================================= chương trum-mua-4 "Phố mới kẻ vạch" ================================================= */
    manChe({
      so: 2, ten: 'Hàm chấm theo dấu', r: 'drone-son', taoHam: ['mark_dash'], hamCuaEmCan: [],
      deBai: 'Drone kẻ vạch R1 sắp xuất xưởng. Chế mark_dash(n): bay qua n ô, ô nào có dấu vàng nhạt thì chấm vàng. Chương trình chính đã khóa: mark_dash(6). Hai sân, dấu khác nhau.',
      veMaMau: 'Mở Xưởng hàm, tạo mark_dash với một đối số n.',
      san: [['.......', '.......'], ['.......', '.......']],
      mau: [['y.yy.y.', '.......'], ['.yy.y..', '.......']],
      hinh: [['y.yy.y.', '.......'], ['.yy.y..', '.......']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['ink("yellow")', 'mark_dash(6)']),
      loiGiai: bai(['ink("yellow")', 'mark_dash(6)'], { hamCuaEmMoi: [H('mark_dash', ['n'], T_DASH)] }),
      sao: { o: 6, nhip: 6 },
      loiSai: [
        { moTa: 'Gọi mark_dash mà chưa chế hàm', baiLam: bai(['ink("yellow")', 'mark_dash(6)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chấm mọi ô', baiLam: bai(['ink("yellow")', 'mark_dash(6)']), hamCuaEmMoi: [H('mark_dash', ['n'], ['for i in range(n):', '    dot()', '    go_right()'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Hỏi color("here") == "yellow" trước khi chấm.', 'go_right() nằm ngoài if.']
    }),

    manChe({
      so: 1, ten: 'Hàm sạc khi yếu', r: 'drone-son', pin: [6, 10], taoHam: ['charge_if'], hamCuaEmCan: [],
      deBai: 'Chế charge_if(k): pin dưới k thì đáp xuống rồi cất cánh (đáp trên trạm là sạc đầy), không thì thôi. Chương trình chính đã khóa: kẻ vạch vàng ba chặng, mỗi chặng hai ô, cuối chặng gọi charge_if(4). ' +
        'Hai sân cùng con phố, drone pin 6 và pin 10.',
      veMaMau: 'Tạo charge_if với một đối số k. Thân hàm là một if; trong if gọi land() rồi take_off() (hay dock() em đã chế).',
      san: [['..P.P..', '.......'], ['..P.P..', '.......']],
      hinh: [['yyyyyyy', '.......'], ['yyyyyyy', '.......']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_SAC),
      loiGiai: bai(C_SAC, { hamCuaEmMoi: [H('charge_if', ['k'], T_SAC)] }),
      sao: { o: 9, nhip: 10 },
      congThucKhac: [{ moTa: 'Gọi dock() em đã chế', hamCuaEmMoi: [H('charge_if', ['k'], ['if battery() < k:', '    dock()'])] }],
      loiSai: [
        { moTa: 'Gọi charge_if mà chưa chế hàm', baiLam: bai(C_SAC), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'So ngược: chỉ sạc khi pin còn nhiều', baiLam: bai(C_SAC), hamCuaEmMoi: [H('charge_if', ['k'], ['if battery() > k:', '    dock()'])], phaiCoMa: ['het-pin'] }
      ],
      goiY: ['battery() là số pin còn lại.', 'Kẻ có bút hạ: mỗi nhịp bay tốn 2 pin.']
    }),

    manChe({
      so: 3, ten: 'Hàm bậc thang', r: 'drone-son', taoHam: ['stair_line'], hamCuaEmCan: [],
      deBai: 'Chế stair_line(c, n): chọn màu c, hạ bút, n lần bay phải một ô rồi xuống một ô, cuối cùng nhấc bút. Chương trình chính đã khóa: bậc thang đỏ hai bậc, bay sang phải, bậc thang xanh dương một bậc.',
      veMaMau: 'Tạo stair_line với hai đối số c và n.',
      san: ['.....', '.....', '.....', '.....'],
      hinh: ['rr...', '.rr..', '..rbb', '....b'],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_STAIRS),
      loiGiai: bai(C_STAIRS, { hamCuaEmMoi: [H('stair_line', ['c', 'n'], T_STAIRS)] }),
      sao: { o: 9, nhip: 7 },
      loiSai: [
        { moTa: 'Gọi stair_line mà chưa chế hàm', baiLam: bai(C_STAIRS), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Xuống trước rồi mới sang phải', baiLam: bai(C_STAIRS), hamCuaEmMoi: [H('stair_line', ['c', 'n'], ['ink(c)', 'pen_down()', 'for i in range(n):', '    go_down()', '    go_right()', 'pen_up()'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Mỗi bậc: go_right() rồi go_down().', 'pen_up() cuối hàm làm ở nhịp bay kế tiếp.']
    }),

    manChe({
      so: 4, ten: 'Sửa hàm khung', r: 'drone-son', hamCuaEmCan: [],
      deBai: 'Hàm của màn pond_frame(n) phải kẻ khung vuông quanh ao: phải, xuống, trái, lên, mỗi cạnh n ô. Cạnh thứ ba lại bay sang phải. Sửa pond_frame; chương trình chính đã khóa: pond_frame(3).',
      veMaMau: 'Chạy thử: drone bay ra mép sân. Sửa lệnh bay trong vòng lặp thứ ba.',
      san: ['....', '.uu.', '.uu.', '....'],
      hinh: ['gggg', 'g..g', 'g..g', 'gggg'],
      batDau: { x: 0, y: 0 },
      maMau: bai(['ink("green")', 'pond_frame(3)'], { hamCuaMan: [H('pond_frame', ['n'], T_FRAME_SAI)] }),
      loiGiai: bai(['ink("green")', 'pond_frame(3)'], { hamCuaMan: [H('pond_frame', ['n'], T_FRAME)] }),
      sao: { o: 11, nhip: 11 },
      loiSai: [
        { moTa: 'Không sửa', baiLam: bai(['ink("green")', 'pond_frame(3)'], { hamCuaMan: [H('pond_frame', ['n'], T_FRAME_SAI)] }), phaiCoMa: [] }
      ],
      goiY: ['Bốn cạnh: phải, xuống, trái, lên.', 'Cạnh thứ ba đi về phía ô xuất phát.']
    }),

    manChe({
      so: 5, ten: 'Đội: hàm nhấc hộp', r: 'drone-nc', r2: 'xe-son-kc', khoa2: true, chinhCoDinh: false, bd: [{ x: 1, y: 0 }, { x: 0, y: 1, huong: 1 }],
      taoHam: ['lift_aside'], hamCuaEmCan: ['forward'],
      deBai: 'Hai hộp sắt chắn đường kẻ vạch. R2 xe máy sơn tự động (đã khoá): hạ bút, chờ lối trống, kẻ hai ô, lặp hai lần, rồi kẻ hai ô cuối. R1 drone nam châm đã có chương trình gọi lift_aside() hai lần. ' +
        'Chế lift_aside(): hút hộp dưới chân, bay lên một ô, thả.',
      veMaMau: 'Mở Xưởng hàm, tạo lift_aside() không có đối số.',
      san: ['.......', '.o.o...', '.......'],
      vatChat: ['.......', '.s.s...', '.......'],
      hinh: ['.......', 'yyyyyyy', '.......'],
      maMau: B(R1_LIFT, R2_LIFT),
      loiGiai: B(R1_LIFT, R2_LIFT, { hamCuaEmMoi: [H('lift_aside', [], T_LIFT)] }),
      sao: { o: 23, nhip: 12 },
      loiSai: [
        { moTa: 'Gọi lift_aside mà chưa chế hàm', baiLam: B(R1_LIFT, R2_LIFT), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thả ngay tại chỗ: hộp vẫn chắn', baiLam: B(R1_LIFT, R2_LIFT), hamCuaEmMoi: [H('lift_aside', [], ['magnet_n()', 'wait()', 'magnet_off()', 'wait()', 'go_up()'])], phaiCoMa: [] }
      ],
      goiY: ['Hộp treo dưới nam châm thì không chắn xe nữa khi đã bay khỏi hàng.', 'magnet_n(), wait(), go_up(), magnet_off(), wait().']
    }),

    manChe({
      so: 6, ten: 'Hàm vạch theo số đếm', r: 'drone-son', taoHam: ['bar_len'], hamCuaEmCan: ['count_here'],
      deBai: 'Chế bar_len(c, a): chọn màu c, hạ bút, mỗi phần tử của a bay sang trái một ô, rồi nhấc bút. Chương trình chính đã khóa: đếm ô đỏ trên chín ô bằng count_here, bay qua hàng rào xuống hàng dưới, ' +
        'kẻ vạch xanh dương bằng bar_len. Hai sân, số ô đỏ khác nhau.',
      veMaMau: 'Tạo bar_len với hai đối số c và a. Vòng for x in a lặp đúng len(a) lần.',
      san: [['..........', '==========', '..........'], ['..........', '==========', '..........']],
      mau: [['.rgr.ryb..', '..........', '..........'], ['.rrgrrybrr', '..........', '..........']],
      hinh: [['..........', '..........', '......bbbb'], ['..........', '..........', '...bbbbbbb']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_BAR),
      loiGiai: bai(C_BAR, { hamCuaEmMoi: [H('bar_len', ['c', 'a'], T_BAR)] }),
      sao: { o: 14, nhip: 17 },
      congThucKhac: [{ moTa: 'Lặp theo len(a)', hamCuaEmMoi: [H('bar_len', ['c', 'a'], ['ink(c)', 'pen_down()', 'for i in range(len(a)):', '    go_left()', 'pen_up()'])] }],
      loiSai: [
        { moTa: 'Gọi bar_len mà chưa chế hàm', baiLam: bai(C_BAR), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Vạch dài cố định ba ô', baiLam: bai(C_BAR), hamCuaEmMoi: [H('bar_len', ['c', 'a'], ['ink(c)', 'pen_down()', 'for i in range(3):', '    go_left()', 'pen_up()'])], phaiCoMa: [] }
      ],
      goiY: ['Bút hạ thì ô xuất phát cũng được tô: n ô bay là n + 1 ô vạch.', 'for x in a: chạy một lần cho mỗi phần tử.']
    }),

    manChe({
      so: 7, ten: 'Hàm kẻ phố', r: 'drone-son', taoHam: ['street'], hamCuaEmCan: ['stripe'],
      deBai: 'Chế street(c, n): kẻ vạch màu c bằng stripe(c, n), bay xuống hai ô, rồi bay trái n ô về đầu hàng. Chương trình chính đã khóa: ba con phố vàng, xanh dương, vàng.',
      veMaMau: 'Tạo street với hai đối số c và n. Gọi stripe em đã chế ở gói Sơn từ trên cao.',
      san: ['.......', '.......', '.......', '.......', '.......'],
      hinh: ['yyyyyy.', '.......', 'bbbbb..', '.......', 'yyyy...'],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_STREET),
      loiGiai: bai(C_STREET, { hamCuaEmMoi: [H('street', ['c', 'n'], T_STREET)] }),
      sao: { o: 13, nhip: 25 },
      loiSai: [
        { moTa: 'Gọi street mà chưa chế hàm', baiLam: bai(C_STREET), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên bay về đầu hàng', baiLam: bai(C_STREET), hamCuaEmMoi: [H('street', ['c', 'n'], ['stripe(c, n)', 'go_down()', 'go_down()'])], phaiCoMa: [] }
      ],
      goiY: ['stripe(c, n) dừng ở cuối vạch, bút đang chờ nhấc.', 'Về đầu hàng: bay trái đúng n ô.']
    }),

    manChe({
      so: 8, ten: 'Phố có trạm sạc', r: 'drone-son', pin: [20, 40], taoHam: ['street_dock'], hamCuaEmCan: ['street', 'charge_if'],
      deBai: 'Chế street_dock(c, n): kẻ một con phố bằng street(c, n), rồi gọi charge_if(9) ở đầu hàng mới. Chương trình chính đã khóa: phố vàng, phố xanh dương, vạch vàng cuối. ' +
        'Hai sân cùng con phố, drone pin 20 và pin 40: sân pin ít phải ghé trạm, sân pin nhiều thì bay luôn.',
      veMaMau: 'Tạo street_dock với hai đối số c và n. Thân hàm chỉ hai dòng, gọi hai hàm em đã chế.',
      san: [['.......', '.......', 'P......', '.......', 'P......'], ['.......', '.......', 'P......', '.......', 'P......']],
      hinh: [['yyyyyy.', '.......', 'bbbbb..', '.......', 'yyyy...'], ['yyyyyy.', '.......', 'bbbbb..', '.......', 'yyyy...']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_SDOCK),
      loiGiai: bai(C_SDOCK, { hamCuaEmMoi: [H('street_dock', ['c', 'n'], T_SDOCK)] }),
      sao: { o: 18, nhip: 29 },
      loiSai: [
        { moTa: 'Gọi street_dock mà chưa chế hàm', baiLam: bai(C_SDOCK), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên ghé trạm: hết pin ở sân pin 20', baiLam: bai(C_SDOCK), hamCuaEmMoi: [H('street_dock', ['c', 'n'], ['street(c, n)'])], phaiCoMa: ['het-pin'] }
      ],
      goiY: ['Hàm của em gọi được hàm em đã chế: street rồi charge_if.', 'street kết thúc ở đầu hàng mới, đúng chỗ trạm sạc P.']
    }),

    manChe({
      so: 9, ten: 'Hai phố theo dấu', r: 'drone-son', taoHam: ['two_dash'], hamCuaEmCan: ['mark_dash'],
      deBai: 'Chế two_dash(n): chấm theo dấu bằng mark_dash(n), bay xuống hai ô, rồi bay trái n ô về đầu hàng. Chương trình chính đã khóa: two_dash(6) rồi mark_dash(6). Hai sân, dấu vàng khác nhau.',
      veMaMau: 'Tạo two_dash với một đối số n, giống street ở màn 7 nhưng thay stripe bằng mark_dash.',
      san: [['.......', '.......', '.......'], ['.......', '.......', '.......']],
      mau: [['y.yy.y.', '.......', '.yy..y.'], ['.y.yy..', '.......', 'yy.y.y.']],
      hinh: [['y.yy.y.', '.......', '.yy..y.'], ['.y.yy..', '.......', 'yy.y.y.']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_TWO),
      loiGiai: bai(C_TWO, { hamCuaEmMoi: [H('two_dash', ['n'], T_TWO)] }),
      sao: { o: 12, nhip: 20 },
      loiSai: [
        { moTa: 'Gọi two_dash mà chưa chế hàm', baiLam: bai(C_TWO), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên bay về đầu hàng', baiLam: bai(C_TWO), hamCuaEmMoi: [H('two_dash', ['n'], ['mark_dash(n)', 'go_down()', 'go_down()'])], phaiCoMa: [] }
      ],
      goiY: ['mark_dash(n) dừng ở ô thứ n + 1 của hàng.', 'Về đầu hàng: bay trái đúng n ô.']
    }),

    manChe({
      so: 10, ten: 'Drone kẻ vạch R1 xuất xưởng', hang: 'trum', r: 'drone-son', pin: 10, chinhCoDinh: false, hamCuaEmCan: ['trace_marks', 'charge_if', 'mark_dash', 'stripe'], khung: { chinh: 15, moiHam: 10 },
      deBai: 'Trùm cuối mùa: Drone kẻ vạch R1 nhận ca đầu tiên ở phố mới. Chép bảng mẫu hàng trên xuống, sạc khi pin yếu ở trạm, chấm vàng các dấu trên đường, sạc lần nữa, ' +
        'chấm đỏ, vàng, đỏ ở hàng dưới từ phải sang trái, bay trái thêm một ô tới trạm thứ ba, sạc, rồi kẻ vạch xanh dương năm ô ở hàng cuối. ' +
        'Tự viết chương trình chính bằng các hàm em đã chế. Hai sân, bảng mẫu và dấu khác nhau.',
      veMaMau: 'Chương trình có sẵn đã chép bảng mẫu. Viết tiếp: charge_if, mark_dash, hàng chấm ba màu, rồi vạch cuối bằng stripe.',
      san: [['.........', '....P...P', '....P....', '.........'], ['.........', '....P...P', '....P....', '.........']],
      mau: [['r.gy.....', '.....yy..', '.........', '.........'], ['bb.r.....', '.....y.y.', '.........', '.........']],
      hinh: [['.........', 'r.gy.yy..', '.....ryr.', '....bbbbb'], ['.........', 'bb.r.y.y.', '.....ryr.', '....bbbbb']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['trace_marks(4)']),
      loiGiai: bai(C_R1),
      sao: { o: 32, nhip: 24 },
      loiSai: [
        { moTa: 'Không sạc: hết pin', baiLam: bai(C_R1.filter(function (s) { return s !== 'charge_if(5)'; })), phaiCoMa: ['het-pin'] },
        { moTa: 'Quên đổi sang sơn vàng', baiLam: bai(C_R1.filter(function (s) { return s !== 'ink("yellow")'; })), phaiCoMa: [] }
      ],
      goiY: ['trace_marks để lại màu sơn cuối cùng của bảng mẫu: ink("yellow") trước mark_dash.', 'Ba trạm sạc: cuối hai chặng hàng trên, và ngay dưới trạm đầu.',
        'Chấm xong ba màu, bay trái một ô tới trạm, sạc, xuống một ô rồi stripe("blue", 4).']
    })
  ];

  ManHoc.manTrumMua4 = DS;
  if (laNode) module.exports = ManHoc;
})();

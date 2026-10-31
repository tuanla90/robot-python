/* ============================================================================
   man-trum-mua-4.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 10 "Drone nông nghiệp R1" (gói cuối mùa, KE-HOACH-MUA-4.md; PDM4c 31/10 KE-HOACH-PART-DUNG-MUA.md).
   PDM4c (31/10): gói 10 "R1 chạy một mình, nhiều sân" (như gói 10 mùa 1, 2, 3):
     - MỌI màn MỘT robot: DRONE NÔNG NGHIỆP R1 ĐẦY ĐỦ = thân drone + bộ gieo hạt (tay: 'son') + camera bốn hướng có mắt bụng (camera-4, taiCho: true).
     - MỌI màn 2-3 SÂN ("ngày làm việc"), sao.nhip = TỔNG nhịp mọi ngày (nhipTheo: 'tong').
     - Một chương trình tổng quát thắng 3 sao mọi ngày; mỗi màn có ít nhất 1 lời sai viết cứng (cung: true) thua ở ít nhất một ngày.
   Mã màn: tong-hop-4.1 … .10; trum-mua-4.1 … .10.
   Máy kiểm: hoc/kiem-man-mua-4.mjs, hoc/kiem-lo-trinh.mjs mục mùa 4, hoc/kiem-part-mua.mjs.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var SON = ['ink', 'dot', 'pen_down', 'pen_up'];
  var DAP = ['land', 'take_off', 'battery'];
  var CAM_DUOI = { ma: 'camera-4', o: 'tren', taiCho: true };

  function chep(x) { return JSON.parse(JSON.stringify(x)); }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice(), hamCuaMan: [], hamCuaEmMoi: [] }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function LAP(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(Array.isArray(than) ? than : [than])); }
  function cung(moTa, baiLam, phaiCoMa, them) { return Object.assign({ moTa: moTa, baiLam: baiLam, phaiCoMa: phaiCoMa, cung: true }, them || {}); }

  /** Điền trường mặc định cho màn gói 10 mùa 4 trên Drone nông nghiệp R1 đầy đủ, nhiều sân, nhipTheo: 'tong'. */
  function man(m) {
    delete m.r;
    m.chuong = m.chuong || 'tong-hop-4';
    m.hang = m.hang || (m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum');
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: 'son', camBien: [chep(CAM_DUOI)] };
    m.hamGoc = BAY.concat(SON, ['color'], m.pin !== undefined ? DAP : []);
    m.mucTieu = m.mucTieu || 'to-hinh';
    m.nhipTheoLoiGiai = true;
    m.moXuong = true;
    m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 12, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    m.taoHam = m.taoHam || [];
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }
  function manChe(m) {
    m.chuong = 'trum-mua-4';
    if (m.chinhCoDinh !== false) m.chinhCoDinh = true; else delete m.chinhCoDinh;
    return man(m);
  }

  /* ---------------------------------------------------------------- chương tong-hop-4 */
  var C_TRAM = ['fly_dock(3)', 'go_right()', 'sow_up(3)'];
  var C_XANH = ['seek_here("yellow")', 'span_sow("yellow", 3)'];
  var C_DON = ['c = color("here")', 'go_right()', 'seek_here(c)', 'span_sow(c, 2)'];
  var C_DO = ['ink("blue")', 'pen_down()', 'while color("right") != "red":', '    go_right()', 'while color("down") != "red":', '    go_down()', 'pen_up()', 'wait()'];
  var C_CONG = ['c = color("here")', 'wait()', 'gate_sow(c)', 'go_right()', 'span_sow(c, 2)'];
  var C_MAT = ['a = []', 'read_row(a, 4)'].concat(LAP(4, 'go_left()'), ['dot_row(a)']);
  var C_DUOI = ['a = []', 'read_below(a, 3)', 'go_down()'].concat(LAP(3, 'go_left()'), ['dot_row(a)']);
  var C_HUONG = ['c = color("here")', 'ink(c)', 'path = ["right", "down", "right", "down"]', 'for d in path:', '    dot()', '    if d == "right":', '        go_right()', '    else:', '        go_down()'];
  var C_MUI = ['ink("red")'].concat(LAP(6, 'sow_step()'));
  var C_CA = ['sow_up(4)', 'dock()', 'go_right()', 'go_right()', 'span_sow("yellow", 1)', 'go_down()',
    'for c in ["red", "blue", "red"]:', '    go_left()', '    ink(c)', '    dot()', 'wait()'];

  /* ---------------------------------------------------------------- chương trum-mua-4 */
  var T_SAC = ['if battery() < k:', '    land()', '    take_off()'];
  var C_SAC = ['ink("yellow")', 'pen_down()'].concat(LAP(3, ['go_right()', 'go_right()', 'charge_if(4)'], 'j'));
  var T_DASH = ['for i in range(n):', '    if color("here") == "yellow":', '        dot()', '    go_right()'];
  var T_STAIRS = ['ink(c)', 'pen_down()', 'for i in range(n):', '    go_right()', '    go_down()', 'pen_up()'];
  var C_STAIRS = ['c = color("here")', 'stair_line(c, 2)', 'go_right()', 'stair_line("blue", 1)'];
  var T_FRAME = ['pen_down()'].concat(LAP('n', 'go_right()'), LAP('n', 'go_down()'), LAP('n', 'go_left()'), LAP('n', 'go_up()'));
  var T_FRAME_SAI = ['pen_down()'].concat(LAP('n', 'go_right()'), LAP('n', 'go_down()'), LAP('n', 'go_right()'), LAP('n', 'go_up()'));
  var C_FRAME = ['c = color("here")', 'ink(c)', 'if c == "green":', '    pond_frame(3)', 'else:', '    pond_frame(2)'];
  var T_UP_SOW = ['c = color("here")', 'ink(c)', 'go_up()', 'dot()', 'wait()', 'go_down()'];
  var C_UP_SOW = ['go_right()', 'up_sow()', 'go_right()', 'go_right()', 'up_sow()'];
  var T_BAR = ['ink(c)', 'pen_down()', 'for x in a:', '    go_left()', 'pen_up()'];
  var C_BAR = ['a = []', 'count_here(a, 9, "red")', 'go_down()', 'go_down()', 'bar_len("blue", a)'];
  var T_STREET = ['span_sow(c, n)', 'go_down()', 'go_down()', 'for i in range(n):', '    go_left()'];
  var C_STREET = ['c = color("here")', 'field_row(c, 5)', 'field_row("blue", 4)', 'span_sow(c, 3)'];
  var T_SDOCK = ['field_row(c, n)', 'charge_if(9)'];
  var C_SDOCK = ['field_dock("yellow", 5)', 'field_dock("blue", 4)', 'span_sow("yellow", 3)'];
  var T_TWO = ['sow_marks(n)', 'go_down()', 'go_down()', 'for i in range(n):', '    go_left()'];
  var C_TWO = ['ink("yellow")', 'two_marks(6)', 'sow_marks(6)'];
  var C_R1 = ['sow_up(4)', 'charge_if(5)', 'ink("yellow")', 'sow_marks(4)', 'charge_if(5)', 'go_down()',
    'for c in ["red", "yellow", "red"]:', '    go_left()', '    ink(c)', '    dot()', 'go_left()', 'charge_if(5)', 'go_down()', 'span_sow("blue", 4)'];

  var DS = [
    /* ================================================= chương tong-hop-4 "Đủ bộ" ================================================= */
    man({
      so: 1, ten: 'Ghé trạm rồi gieo theo mẫu', pin: 7, hamCuaEmCan: ['fly_dock', 'sow_up'],
      deBai: 'Hai ngày làm việc: drone pin 7 phải ghé trạm sạc P ở ô thứ tư bằng fly_dock(3), bay sang phải một ô rồi gọi sow_up(3) đọc ba ô mẫu hàng trên để gieo hoa. Hai ngày mẫu màu khác nhau.',
      veMaMau: 'Chương trình có sẵn bay thẳng không ghé trạm nên hết pin. Dùng fly_dock(3) rồi sow_up(3).',
      san: [['........', '...P....', '........'], ['........', '...P....', '........']],
      mau: [['....ryb.', '........', '........'], ['....byr.', '........', '........']],
      hinh: [['........', '....ryb.', '........'], ['........', '....byr.', '........']],
      batDau: { x: 0, y: 1 },
      maMau: bai(LAP(4, 'go_right()').concat(['sow_up(3)'])),
      loiGiai: bai(C_TRAM),
      sao: { o: 14, nhip: 18 },
      loiSai: [
        { moTa: 'Không ghé trạm: hết pin', baiLam: bai(LAP(4, 'go_right()').concat(['sow_up(3)'])), phaiCoMa: ['het-pin'] },
        cung('Gieo cứng màu đỏ: sai mẫu hàng trên', bai(['fly_dock(3)', 'go_right()', 'span_sow("red", 2)']), ['chua-to-hinh'])
      ],
      goiY: ['fly_dock(3) bay ba ô tới trạm P rồi đáp sạc đầy pin.', 'Bay sang phải một ô rồi gọi sow_up(3) để đọc ba ô mẫu hàng trên và gieo hoa.']
    }),

    man({
      so: 2, ten: 'Dò mốc vàng rồi gieo ngang', hamCuaEmCan: ['seek_here', 'span_sow'],
      deBai: 'Hai ngày làm việc: sau hàng rào =, mốc vàng đầu luống nằm xa gần khác nhau. Dùng seek_here("yellow") dò tới mốc vàng, rồi gọi span_sow("yellow", 3) để gieo luống hoa bốn ô.',
      veMaMau: 'Chương trình có sẵn chỉ bay hai ô nên ngày 2 gieo lệch luống. Dùng seek_here("yellow").',
      san: [['........', '.=......', '........'], ['........', '.=......', '........']],
      mau: [['........', '..y.....', '........'], ['........', '...y....', '........']],
      hinh: [['........', '..yyyy..', '........'], ['........', '...yyyy.', '........']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['go_right()', 'go_right()', 'span_sow("yellow", 3)']),
      loiGiai: bai(C_XANH),
      sao: { o: 9, nhip: 11 },
      loiSai: [
        cung('Bay cứng hai ô như ngày 1: ngày 2 gieo lệch luống', bai(['go_right()', 'go_right()', 'span_sow("yellow", 3)']), ['to-thua']),
        { moTa: 'Gieo thiếu một ô', baiLam: bai(['seek_here("yellow")', 'span_sow("yellow", 2)']), phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['seek_here("yellow") bay sang phải qua hàng rào tới khi ô dưới bụng có màu vàng.', 'span_sow("yellow", 3) gieo trọn bốn ô hoa vàng.']
    }),

    man({
      so: 3, ten: 'Gieo luống theo đơn', hamCuaEmCan: ['seek_here', 'span_sow'],
      deBai: 'Hai ngày làm việc: ô xuất phát là đơn đặt hoa (c = color("here")). Đọc đơn, bay sang phải một ô rời ô đơn, tìm mốc cùng màu bằng seek_here(c), rồi gọi span_sow(c, 2) để gieo ba ô hoa.',
      veMaMau: 'Chương trình có sẵn tìm cứng màu đỏ nên ngày 2 sai đơn. Dùng biến c trong seek_here(c) và span_sow(c, 2).',
      san: [['........', '.=......', '........'], ['........', '.=......', '........']],
      mau: [['........', 'r.yb.r..', '........'], ['........', 'b.ryb...', '........']],
      hinh: [['........', '.....rrr', '........'], ['........', '....bbb.', '........']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['c = color("here")', 'go_right()', 'seek_here("red")', 'span_sow("red", 2)']),
      loiGiai: bai(C_DON),
      sao: { o: 11, nhip: 13 },
      loiSai: [
        cung('Tìm và gieo cứng màu đỏ theo ngày 1: ngày 2 sai màu và vị trí', bai(['c = color("here")', 'go_right()', 'seek_here("red")', 'span_sow("red", 2)']), ['to-thua']),
        { moTa: 'Không rời ô đơn trước khi seek_here(c): dừng ngay tại ô xuất phát', baiLam: bai(['c = color("here")', 'seek_here(c)', 'span_sow(c, 2)']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Ô đơn cũng mang màu c: cần go_right() rời nó một ô rồi mới gọi seek_here(c).', 'Tìm thấy mốc c thì gọi span_sow(c, 2).']
    }),

    man({
      so: 4, ten: 'Gieo tới mốc đỏ', hamCuaEmCan: [],
      deBai: 'Hai ngày làm việc: mốc đỏ nằm ở cột và hàng khác nhau. Chọn hạt xanh dương, hạ miệng gieo, bay sang phải khi color("right") != "red", rồi bay xuống khi color("down") != "red", cuối cùng nhấc miệng gieo và wait().',
      veMaMau: 'Chương trình có sẵn đếm cứng số ô của ngày 1. Thay bằng hai vòng while hỏi camera.',
      san: [['.....', '.....', '.....', '.....'], ['.....', '.....', '.....', '.....']],
      mau: [['....r', '.....', '.....', '...r.'], ['..r..', '.....', '.....', '.r...']],
      hinh: [['bbbb.', '...b.', '...b.', '.....'], ['bb...', '.b...', '.b...', '.....']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['ink("blue")', 'pen_down()', 'for i in range(3):', '    go_right()', 'for i in range(2):', '    go_down()', 'pen_up()', 'wait()']),
      loiGiai: bai(C_DO),
      sao: { o: 8, nhip: 8 },
      loiSai: [
        cung('Đếm cứng số ô theo ngày 1: ngày 2 gieo lố qua mốc đỏ', bai(['ink("blue")', 'pen_down()', 'for i in range(3):', '    go_right()', 'for i in range(2):', '    go_down()', 'pen_up()', 'wait()']), ['to-thua'])
      ],
      goiY: ['while color("right") != "red": go_right() dừng ngay ở ô trước mốc đỏ.', 'Đoạn dọc dùng while color("down") != "red": go_down(), rồi pen_up() và wait().']
    }),

    man({
      so: 5, ten: 'Chờ thùng mở cổng rồi gieo', hamCuaEmCan: ['gate_sow', 'span_sow'],
      deBai: 'Hai ngày làm việc: thùng trên băng chuyền > trượt vào đè nút M mở cổng C, màu đơn đặt ở ô xuất phát (c = color("here")). Đọc c, chờ thêm một nhịp wait() cho thùng tới nút, gọi gate_sow(c), rồi bay sang phải một ô và gọi span_sow(c, 2).',
      veMaMau: 'Chương trình có sẵn gieo cứng màu đỏ nên ngày 2 sai đơn. Đọc c = color("here") rồi truyền c vào hai hàm.',
      san: [['>M.....', '.C.....'], ['>M.....', '.C.....']],
      thungThem: [[{ x: 0, y: 0 }], [{ x: 0, y: 0 }]],
      noi: [[{ nut: { x: 1, y: 0 }, cua: [{ x: 1, y: 1 }] }], [{ nut: { x: 1, y: 0 }, cua: [{ x: 1, y: 1 }] }]],
      mau: [['.......', 'r......'], ['.......', 'y......']],
      hinh: [['.......', '..rrrr.'], ['.......', '..yyyy.']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['wait()', 'gate_sow("red")', 'go_right()', 'span_sow("red", 2)']),
      loiGiai: bai(C_CONG),
      sao: { o: 16, nhip: 16 },
      loiSai: [
        cung('Gieo cứng màu đỏ theo ngày 1: ngày 2 sai màu hoa', bai(['wait()', 'gate_sow("red")', 'go_right()', 'span_sow("red", 2)']), ['chua-to-hinh']),
        { moTa: 'Bay ngay không chờ thùng đè nút: đụng cổng C đang đóng', baiLam: bai(['c = color("here")', 'go_right()', 'go_right()', 'span_sow(c, 3)']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Đọc c = color("here"), gọi wait() rồi gate_sow(c).', 'Sau gate_sow(c), bay sang phải một ô rồi gọi span_sow(c, 2).']
    }),

    man({
      so: 6, ten: 'Chép mật lệnh hàng trên', hamCuaEmCan: ['read_row', 'dot_row'],
      deBai: 'Hai ngày làm việc: ghi bốn màu ở hàng trên vào danh sách a bằng read_row(a, 4), bay trái bốn ô về đầu hàng rồi gieo lại đúng thứ tự bằng dot_row(a).',
      veMaMau: 'Chương trình có sẵn đã ghi mật lệnh vào a. Viết tiếp: bay về đầu hàng rồi gọi dot_row(a).',
      san: [['.....', '.....'], ['.....', '.....']],
      mau: [['.rgyb', '.....'], ['.bbry', '.....']],
      hinh: [['.....', 'rgyb.'], ['.....', 'bbry.']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['a = []', 'read_row(a, 4)']),
      loiGiai: bai(C_MAT),
      sao: { o: 12, nhip: 24 },
      loiSai: [
        { moTa: 'Gieo luôn ở cuối hàng: ra ngoài luống', baiLam: bai(['a = []', 'read_row(a, 4)', 'dot_row(a)']), phaiCoMa: ['to-thua'] },
        cung('Gieo cứng bốn màu của ngày 1: ngày 2 sai màu hoa', bai(['dot_row(["red", "green", "yellow", "blue"])']), ['chua-to-hinh'])
      ],
      goiY: ['read_row(a, 4) bay bốn ô sang phải, ghi màu ô phía trên vào a.', 'Bay trái bốn ô về đầu hàng rồi gọi dot_row(a).']
    }),

    man({
      so: 7, ten: 'Đọc dấu dưới chân rồi gieo hàng dưới', hamCuaEmCan: ['read_below', 'dot_row'],
      deBai: 'Hai ngày làm việc: đọc ba dấu màu dưới chân vào danh sách a bằng read_below(a, 3), bay xuống một hàng, bay trái ba ô về đầu hàng rồi gọi dot_row(a) để gieo luống hoa.',
      veMaMau: 'Chương trình có sẵn chưa lùi về đầu hàng dưới. Thêm vòng lặp bay trái ba ô rồi gọi dot_row(a).',
      san: [['.....', '.....', '.....'], ['.....', '.....', '.....']],
      mau: [['.....', '.ryb.', '.....'], ['.....', '.byr.', '.....']],
      hinh: [['.....', '.....', 'ryb..'], ['.....', '.....', 'byr..']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['a = []', 'read_below(a, 3)', 'go_down()']),
      loiGiai: bai(C_DUOI),
      sao: { o: 13, nhip: 20 },
      loiSai: [
        { moTa: 'Quên bay trái về đầu hàng: gieo lệch sang phải', baiLam: bai(['a = []', 'read_below(a, 3)', 'go_down()', 'dot_row(a)']), phaiCoMa: ['to-thua'] },
        cung('Gieo cứng ba màu của ngày 1: ngày 2 sai màu hoa', bai(['go_down()', 'dot_row(["red", "yellow", "blue"])']), ['chua-to-hinh'])
      ],
      goiY: ['read_below(a, 3) dừng ở cột thứ ba sau khi ghi đủ ba màu.', 'Bay xuống một hàng, lặp ba lần go_left() về cột 0 rồi gọi dot_row(a).']
    }),

    man({
      so: 8, ten: 'Bay theo danh sách hướng', hamCuaEmCan: [],
      deBai: 'Hai ngày làm việc: đọc màu hạt ở ô xuất phát (c = color("here")), chọn hạt ink(c), rồi bay theo danh sách path = ["right", "down", "right", "down"]. Mỗi bước: dot() trước rồi bay theo hướng trong path.',
      veMaMau: 'Chương trình có sẵn đã bay theo path nhưng chưa chọn hạt theo ô xuất phát và chưa dot().',
      san: [['...', '...', '...'], ['...', '...', '...']],
      mau: [['b..', '...', '...'], ['r..', '...', '...']],
      hinh: [['bb.', '.bb', '...'], ['rr.', '.rr', '...']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['path = ["right", "down", "right", "down"]', 'for d in path:', '    if d == "right":', '        go_right()', '    else:', '        go_down()']),
      loiGiai: bai(C_HUONG),
      sao: { o: 9, nhip: 8 },
      loiSai: [
        cung('Chọn cứng màu xanh dương của ngày 1: ngày 2 sai màu hoa', bai(['ink("blue")', 'path = ["right", "down", "right", "down"]', 'for d in path:', '    dot()', '    if d == "right":', '        go_right()', '    else:', '        go_down()']), ['chua-to-hinh']),
        { moTa: 'Gieo sau khi bay: lệch mất ô đầu', baiLam: bai(['c = color("here")', 'ink(c)', 'path = ["right", "down", "right", "down"]', 'for d in path:', '    if d == "right":', '        go_right()', '    else:', '        go_down()', '    dot()']), phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Đọc c = color("here") rồi ink(c) trước vòng lặp.', 'Trong vòng lặp: gọi dot() trước khối if/else để gieo ô đang đứng lúc bay đi.']
    }),

    man({
      so: 9, ten: 'Sửa hàm gieo mũi tên', chinhCoDinh: true, hamCuaEmCan: ['arrow_step'],
      deBai: 'Hai ngày làm việc: hàm của màn sow_step() phải gieo ô đang ở rồi bay theo mũi tên màu dưới chân (arrow_step()), nhưng nó lại bay trước rồi mới gieo. Sửa sow_step; chương trình chính đã khóa.',
      veMaMau: 'Chạy thử: ô xuất phát bị bỏ trống. Đổi thứ tự hai lệnh trong sow_step().',
      san: [['.....', '.....', '.....'], ['.....', '.....', '.....']],
      mau: [['gb...', '.ggb.', '...g.'], ['b....', 'ggb..', '..gg.']],
      hinh: [['rr...', '.rrr.', '...r.'], ['r....', 'rrr..', '..rr.']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_MUI, { hamCuaMan: [H('sow_step', [], ['arrow_step()', 'dot()'])] }),
      loiGiai: bai(C_MUI, { hamCuaMan: [H('sow_step', [], ['dot()', 'arrow_step()'])] }),
      sao: { o: 9, nhip: 12 },
      loiSai: [
        { moTa: 'Không sửa: bay trước rồi mới gieo', baiLam: bai(C_MUI, { hamCuaMan: [H('sow_step', [], ['arrow_step()', 'dot()'])] }), phaiCoMa: ['chua-to-hinh'] },
        cung('Luôn bay sang phải trong sow_step: lệch đường mũi tên', bai(C_MUI, { hamCuaMan: [H('sow_step', [], ['dot()', 'go_right()'])] }), ['to-thua'])
      ],
      goiY: ['dot() gieo ô đang ở ở nhịp bay kế tiếp.', 'arrow_step() đọc mũi tên dưới chân rồi bay một ô.']
    }),

    man({
      so: 10, ten: 'Ca gieo luống đầu tiên', hang: 'trum', pin: 14, hamCuaEmCan: ['sow_up', 'dock', 'span_sow'], khung: { chinh: 12, moiHam: 10 },
      deBai: 'Trùm chương: hai ngày làm việc, chép bảng mẫu hàng trên xuống bằng sow_up(4), tới trạm sạc P thì dock(), bay hai ô qua hàng rào =, gieo hai ô hoa vàng bằng span_sow("yellow", 1), xuống hàng dưới rồi gieo đỏ, xanh dương, đỏ từ phải sang trái.',
      veMaMau: 'Chương trình có sẵn đã chép bảng mẫu bằng sow_up(4). Viết tiếp phần còn lại.',
      san: [['........', '....P=..', '........'], ['........', '....P=..', '........']],
      mau: [['r.gy....', '........', '........'], ['bb.r....', '........', '........']],
      hinh: [['........', 'r.gy..yy', '....rbr.'], ['........', 'bb.r..yy', '....rbr.']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['sow_up(4)']),
      loiGiai: bai(C_CA),
      sao: { o: 24, nhip: 28 },
      loiSai: [
        { moTa: 'Không đáp sạc: hết pin giữa chừng', baiLam: bai(C_CA.filter(function (s) { return s !== 'dock()'; })), phaiCoMa: ['het-pin'] },
        { moTa: 'Quên wait() cuối: bông cuối chưa kịp gieo', baiLam: bai(C_CA.slice(0, -1)), phaiCoMa: ['chua-to-hinh'] },
        cung('Gieo cứng vạch đỏ thay cho sow_up(4): sai mẫu hàng trên', bai(['span_sow("red", 3)', 'go_right()'].concat(C_CA.slice(1))), ['to-thua'])
      ],
      goiY: ['sow_up(4) dừng đúng trên trạm sạc P.', 'Hàng dưới: mỗi màu bay trái một ô rồi mới dot(); bông cuối cần wait().']
    }),

    /* ================================================= chương trum-mua-4 "Drone nông nghiệp R1" ================================================= */
    manChe({
      so: 1, ten: 'Hàm sạc khi yếu', pin: [6, 10], taoHam: ['charge_if'], hamCuaEmCan: [],
      deBai: 'Hai ngày làm việc: chế charge_if(k) kiểm tra nếu battery() < k thì land() rồi take_off() (đáp trên trạm P là sạc đầy), không thì thôi. Chương trình chính đã khóa: gieo luống vàng ba chặng, cuối mỗi chặng gọi charge_if(4).',
      veMaMau: 'Tạo charge_if với một đối số k. Thân hàm là một if; trong if gọi land() rồi take_off() (hay dock() bạn đã chế).',
      san: [['..P.P..', '.......'], ['..P.P..', '.......']],
      hinh: [['yyyyyyy', '.......'], ['yyyyyyy', '.......']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_SAC),
      loiGiai: bai(C_SAC, { hamCuaEmMoi: [H('charge_if', ['k'], T_SAC)] }),
      sao: { o: 9, nhip: 18 },
      congThucKhac: [{ moTa: 'Gọi dock() đã chế', hamCuaEmMoi: [H('charge_if', ['k'], ['if battery() < k:', '    dock()'])] }],
      loiSai: [
        { moTa: 'Gọi charge_if mà chưa chế hàm', baiLam: bai(C_SAC), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'So ngược: chỉ sạc khi pin còn nhiều', baiLam: bai(C_SAC), hamCuaEmMoi: [H('charge_if', ['k'], ['if battery() > k:', '    dock()'])], phaiCoMa: ['het-pin'] },
        cung('Chỉ sạc khi battery() == 6 theo ngày 2: ngày 1 hết pin', bai(C_SAC), ['het-pin'], { hamCuaEmMoi: [H('charge_if', ['k'], ['if battery() == 6:', '    dock()'])] })
      ],
      goiY: ['battery() trả về số pin còn lại.', 'Hạ miệng gieo thì mỗi bước bay tốn 2 pin; dưới k thì đáp sạc.']
    }),

    manChe({
      so: 2, ten: 'Hàm gieo theo dấu', taoHam: ['sow_marks'], hamCuaEmCan: [],
      deBai: 'Hai ngày làm việc: chế sow_marks(n) bay qua n ô, ô nào dưới bụng có dấu vàng (color("here") == "yellow") thì dot(). Chương trình chính đã khóa: ink("yellow") rồi sow_marks(6).',
      veMaMau: 'Mở Xưởng hàm, tạo sow_marks với một đối số n.',
      san: [['.......', '.......'], ['.......', '.......']],
      mau: [['y.yy.y.', '.......'], ['.yy.y..', '.......']],
      hinh: [['y.yy.y.', '.......'], ['.yy.y..', '.......']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['ink("yellow")', 'sow_marks(6)']),
      loiGiai: bai(['ink("yellow")', 'sow_marks(6)'], { hamCuaEmMoi: [H('sow_marks', ['n'], T_DASH)] }),
      sao: { o: 6, nhip: 11 },
      loiSai: [
        { moTa: 'Gọi sow_marks mà chưa chế hàm', baiLam: bai(['ink("yellow")', 'sow_marks(6)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gieo mọi ô không nhìn dấu', baiLam: bai(['ink("yellow")', 'sow_marks(6)']), hamCuaEmMoi: [H('sow_marks', ['n'], ['for i in range(n):', '    dot()', '    go_right()'])], phaiCoMa: ['to-thua'] },
        cung('Gieo cứng các ô của ngày 1: ngày 2 gieo thừa và thiếu', bai(['ink("yellow")', 'sow_marks(6)']), ['to-thua'], { hamCuaEmMoi: [H('sow_marks', ['n'], ['dot()', 'go_right()', 'go_right()', 'dot()', 'go_right()', 'dot()', 'go_right()', 'go_right()', 'dot()', 'go_right()'])] })
      ],
      goiY: ['Hỏi if color("here") == "yellow": trước khi dot().', 'go_right() đặt ngoài if để ô nào drone cũng bay qua.']
    }),

    manChe({
      so: 3, ten: 'Hàm bậc thang', taoHam: ['stair_line'], hamCuaEmCan: [],
      deBai: 'Hai ngày làm việc: chế stair_line(c, n) chọn hạt c, hạ miệng gieo, lặp n lần bay phải một ô rồi xuống một ô, cuối cùng nhấc miệng gieo. Chương trình chính đã khóa: đọc màu c ở ô đầu, gieo bậc thang hai bậc màu c, bay sang phải rồi gieo bậc thang xanh dương một bậc.',
      veMaMau: 'Tạo stair_line với hai đối số c và n.',
      san: [['.....', '.....', '.....', '.....'], ['.....', '.....', '.....', '.....']],
      mau: [['r....', '.....', '.....', '.....'], ['y....', '.....', '.....', '.....']],
      hinh: [['rr...', '.rr..', '..rbb', '....b'], ['yy...', '.yy..', '..ybb', '....b']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_STAIRS),
      loiGiai: bai(C_STAIRS, { hamCuaEmMoi: [H('stair_line', ['c', 'n'], T_STAIRS)] }),
      sao: { o: 10, nhip: 14 },
      loiSai: [
        { moTa: 'Gọi stair_line mà chưa chế hàm', baiLam: bai(C_STAIRS), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Xuống trước rồi mới sang phải', baiLam: bai(C_STAIRS), hamCuaEmMoi: [H('stair_line', ['c', 'n'], ['ink(c)', 'pen_down()', 'for i in range(n):', '    go_down()', '    go_right()', 'pen_up()'])], phaiCoMa: ['to-thua'] },
        cung('Chọn cứng màu đỏ trong stair_line: ngày 2 sai màu bậc thang đầu', bai(C_STAIRS), ['chua-to-hinh'], { hamCuaEmMoi: [H('stair_line', ['c', 'n'], ['ink("red")', 'pen_down()', 'for i in range(n):', '    go_right()', '    go_down()', 'pen_up()'])] })
      ],
      goiY: ['Mỗi bậc trong vòng lặp: go_right() rồi go_down().', 'Cuối hàm nhớ gọi pen_up().']
    }),

    manChe({
      so: 4, ten: 'Sửa hàm viền ao', hamCuaEmCan: [],
      deBai: 'Hai ngày làm việc, hai ao rộng hẹp khác nhau: hàm của màn pond_frame(n) phải gieo viền vuông quanh ao (phải, xuống, trái, lên, mỗi cạnh n ô), nhưng cạnh thứ ba đang bay sang phải. Sửa pond_frame(n); chương trình chính đã khóa.',
      veMaMau: 'Chạy thử: cạnh thứ ba drone bay ra mép sân. Sửa lệnh bay trong vòng lặp thứ ba thành go_left().',
      san: [['....', '.uu.', '.uu.', '....'], ['....', '.u..', '....', '....']],
      mau: [['g...', '....', '....', '....'], ['y...', '....', '....', '....']],
      hinh: [['gggg', 'g..g', 'g..g', 'gggg'], ['yyy.', 'y.y.', 'yyy.', '....']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_FRAME, { hamCuaMan: [H('pond_frame', ['n'], T_FRAME_SAI)] }),
      loiGiai: bai(C_FRAME, { hamCuaMan: [H('pond_frame', ['n'], T_FRAME)] }),
      sao: { o: 15, nhip: 18 },
      loiSai: [
        { moTa: 'Không sửa: cạnh thứ ba bay sang phải', baiLam: bai(C_FRAME, { hamCuaMan: [H('pond_frame', ['n'], T_FRAME_SAI)] }), phaiCoMa: ['dam-tuong', 'chua-to-hinh'] },
        cung('Đếm cứng mỗi cạnh 3 ô theo ngày 1: ngày 2 gieo thừa quanh ao nhỏ', bai(C_FRAME, { hamCuaMan: [H('pond_frame', ['n'], ['pen_down()'].concat(LAP(3, 'go_right()'), LAP(3, 'go_down()'), LAP(3, 'go_left()'), LAP(3, 'go_up()')))] }), ['to-thua'])
      ],
      goiY: ['Bốn cạnh viền quanh ao: phải, xuống, trái, lên, mỗi cạnh lặp n lần.', 'Đổi go_right() ở vòng lặp thứ ba thành go_left().']
    }),

    manChe({
      so: 5, ten: 'Hàm gieo bồn trên', taoHam: ['up_sow'], hamCuaEmCan: [],
      deBai: 'Hai ngày làm việc: chế up_sow() đọc màu dấu dưới chân (c = color("here")), chọn hạt ink(c), bay lên một ô, dot(), wait() rồi bay xuống chỗ cũ. Chương trình chính đã khóa: gọi up_sow() ở hai cột có dấu màu.',
      veMaMau: 'Mở Xưởng hàm, tạo up_sow() không có đối số.',
      san: [['.....', '.....', '.=.=.'], ['.....', '.....', '.=.=.']],
      mau: [['.....', '.r.b.', '.....'], ['.....', '.y.r.', '.....']],
      hinh: [['.r.b.', '.....', '.....'], ['.y.r.', '.....', '.....']],
      batDau: { x: 0, y: 1 },
      maMau: bai(C_UP_SOW),
      loiGiai: bai(C_UP_SOW, { hamCuaEmMoi: [H('up_sow', [], T_UP_SOW)] }),
      sao: { o: 11, nhip: 16 },
      loiSai: [
        { moTa: 'Gọi up_sow mà chưa chế hàm', baiLam: bai(C_UP_SOW), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên bay xuống về hàng dưới: lần thứ hai bay ra ngoài sân', baiLam: bai(C_UP_SOW), hamCuaEmMoi: [H('up_sow', [], ['c = color("here")', 'ink(c)', 'go_up()', 'dot()', 'wait()'])], phaiCoMa: ['mau-son-sai'] },
        cung('Chọn cứng hạt đỏ trong up_sow: sai màu ở cột khác và ngày 2', bai(C_UP_SOW), ['chua-to-hinh'], { hamCuaEmMoi: [H('up_sow', [], ['ink("red")', 'go_up()', 'dot()', 'wait()', 'go_down()'])] })
      ],
      goiY: ['Đọc c = color("here") rồi ink(c) trước khi bay lên.', 'go_up(), dot(), wait(), rồi go_down() về lại hàng dấu.']
    }),

    manChe({
      so: 6, ten: 'Hàm luống theo số đếm', taoHam: ['bar_len'], hamCuaEmCan: ['count_here'],
      deBai: 'Hai ngày làm việc: chế bar_len(c, a) chọn hạt c, hạ miệng gieo, mỗi phần tử của danh sách a bay sang trái một ô, rồi nhấc miệng gieo. Chương trình chính đã khóa: đếm dấu đỏ bằng count_here(a, 9, "red"), bay qua hàng rào xuống hàng dưới rồi gọi bar_len("blue", a).',
      veMaMau: 'Tạo bar_len với hai đối số c và a. Vòng for x in a lặp đúng số dấu đã đếm.',
      san: [['..........', '==========', '..........'], ['..........', '==========', '..........']],
      mau: [['.rgr.ryb..', '..........', '..........'], ['.rrgrrybrr', '..........', '..........']],
      hinh: [['..........', '..........', '......bbbb'], ['..........', '..........', '...bbbbbbb']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_BAR),
      loiGiai: bai(C_BAR, { hamCuaEmMoi: [H('bar_len', ['c', 'a'], T_BAR)] }),
      sao: { o: 14, nhip: 31 },
      congThucKhac: [{ moTa: 'Lặp theo len(a)', hamCuaEmMoi: [H('bar_len', ['c', 'a'], ['ink(c)', 'pen_down()', 'for i in range(len(a)):', '    go_left()', 'pen_up()'])] }],
      loiSai: [
        { moTa: 'Gọi bar_len mà chưa chế hàm', baiLam: bai(C_BAR), phaiCoMa: ['ham-chua-co'] },
        cung('Lặp cứng 3 ô theo ngày 1: ngày 2 gieo thiếu luống', bai(C_BAR), ['chua-to-hinh'], { hamCuaEmMoi: [H('bar_len', ['c', 'a'], ['ink(c)', 'pen_down()', 'for i in range(3):', '    go_left()', 'pen_up()'])] })
      ],
      goiY: ['Hạ miệng gieo thì ô xuất phát cũng được gieo: n bước bay tạo luống n + 1 ô.', 'for x in a: tự lặp đúng số phần tử của danh sách a.']
    }),

    manChe({
      so: 7, ten: 'Hàm gieo luống', taoHam: ['field_row'], hamCuaEmCan: ['span_sow'],
      deBai: 'Hai ngày làm việc: chế field_row(c, n) gieo luống màu c bằng span_sow(c, n), bay xuống hai ô, rồi bay trái n ô về đầu hàng. Chương trình chính đã khóa: đọc màu c ở ô đầu, gieo ba luống c, xanh dương, c.',
      veMaMau: 'Tạo field_row với hai đối số c và n. Gọi span_sow(c, n) bạn đã chế ở gói Vườn cũ rào sắt.',
      san: [['.......', '.......', '.......', '.......', '.......'], ['.......', '.......', '.......', '.......', '.......']],
      mau: [['y......', '.......', '.......', '.......', '.......'], ['r......', '.......', '.......', '.......', '.......']],
      hinh: [['yyyyyy.', '.......', 'bbbbb..', '.......', 'yyyy...'], ['rrrrrr.', '.......', 'bbbbb..', '.......', 'rrrr...']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_STREET),
      loiGiai: bai(C_STREET, { hamCuaEmMoi: [H('field_row', ['c', 'n'], T_STREET)] }),
      sao: { o: 14, nhip: 50 },
      loiSai: [
        { moTa: 'Gọi field_row mà chưa chế hàm', baiLam: bai(C_STREET), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên bay trái về đầu hàng', baiLam: bai(C_STREET), hamCuaEmMoi: [H('field_row', ['c', 'n'], ['span_sow(c, n)', 'go_down()', 'go_down()'])], phaiCoMa: ['to-thua'] },
        cung('Gieo cứng màu vàng trong field_row: ngày 2 sai màu luống đầu và mất màu xanh dương', bai(C_STREET), ['chua-to-hinh'], { hamCuaEmMoi: [H('field_row', ['c', 'n'], ['span_sow("yellow", n)', 'go_down()', 'go_down()', 'for i in range(n):', '    go_left()'])] })
      ],
      goiY: ['span_sow(c, n) dừng ở cuối luống, miệng gieo tự nhấc ở bước kế tiếp.', 'Bay xuống hai ô rồi lặp n lần go_left() về đầu hàng mới.']
    }),

    manChe({
      so: 8, ten: 'Luống có trạm sạc', pin: [20, 40], taoHam: ['field_dock'], hamCuaEmCan: ['field_row', 'charge_if'],
      deBai: 'Hai ngày làm việc: chế field_dock(c, n) gieo một luống bằng field_row(c, n), rồi gọi charge_if(9) ở đầu hàng mới. Chương trình chính đã khóa: luống vàng, luống xanh dương, luống vàng cuối. Hai ngày drone có pin 20 và pin 40.',
      veMaMau: 'Tạo field_dock với hai đối số c và n. Thân hàm chỉ hai dòng, gọi hai hàm bạn đã chế.',
      san: [['.......', '.......', 'P......', '.......', 'P......'], ['.......', '.......', 'P......', '.......', 'P......']],
      hinh: [['yyyyyy.', '.......', 'bbbbb..', '.......', 'yyyy...'], ['yyyyyy.', '.......', 'bbbbb..', '.......', 'yyyy...']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_SDOCK),
      loiGiai: bai(C_SDOCK, { hamCuaEmMoi: [H('field_dock', ['c', 'n'], T_SDOCK)] }),
      sao: { o: 18, nhip: 54 },
      loiSai: [
        { moTa: 'Gọi field_dock mà chưa chế hàm', baiLam: bai(C_SDOCK), phaiCoMa: ['ham-chua-co'] },
        cung('Bỏ qua charge_if(9) theo ngày 2 (pin 40): ngày 1 (pin 20) hết pin giữa chừng', bai(C_SDOCK), ['het-pin'], { hamCuaEmMoi: [H('field_dock', ['c', 'n'], ['field_row(c, n)'])] })
      ],
      goiY: ['Hàm của bạn gọi được hàm bạn đã chế: field_row(c, n) rồi charge_if(9).', 'field_row kết thúc ngay trên trạm sạc P ở đầu hàng mới.']
    }),

    manChe({
      so: 9, ten: 'Hai luống theo dấu', taoHam: ['two_marks'], hamCuaEmCan: ['sow_marks'],
      deBai: 'Hai ngày làm việc: chế two_marks(n) gieo theo dấu bằng sow_marks(n), bay xuống hai ô, rồi bay trái n ô về đầu hàng. Chương trình chính đã khóa: two_marks(6) rồi sow_marks(6). Hai ngày dấu vàng khác nhau.',
      veMaMau: 'Tạo two_marks với một đối số n, giống field_row ở màn 7 nhưng thay span_sow bằng sow_marks.',
      san: [['.......', '.......', '.......'], ['.......', '.......', '.......']],
      mau: [['y.yy.y.', '.......', '.yy..y.'], ['.y.yy..', '.......', 'yy.y.y.']],
      hinh: [['y.yy.y.', '.......', '.yy..y.'], ['.y.yy..', '.......', 'yy.y.y.']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_TWO),
      loiGiai: bai(C_TWO, { hamCuaEmMoi: [H('two_marks', ['n'], T_TWO)] }),
      sao: { o: 12, nhip: 40 },
      loiSai: [
        { moTa: 'Gọi two_marks mà chưa chế hàm', baiLam: bai(C_TWO), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên bay về đầu hàng', baiLam: bai(C_TWO), hamCuaEmMoi: [H('two_marks', ['n'], ['sow_marks(n)', 'go_down()', 'go_down()'])], phaiCoMa: ['dam-tuong', 'chua-to-hinh'] },
        cung('Lùi cứng 4 ô thay vì n ô: lệch đầu hàng', bai(C_TWO), ['chua-to-hinh'], { hamCuaEmMoi: [H('two_marks', ['n'], ['sow_marks(n)', 'go_down()', 'go_down()', 'for i in range(4):', '    go_left()'])] })
      ],
      goiY: ['sow_marks(n) dừng ở cột thứ n của hàng.', 'Về đầu hàng: lặp n lần go_left().']
    }),

    manChe({
      so: 10, ten: 'Drone nông nghiệp R1 xuất xưởng', hang: 'trum', pin: 10, chinhCoDinh: false, hamCuaEmCan: ['sow_up', 'charge_if', 'sow_marks', 'span_sow'], khung: { chinh: 15, moiHam: 10 },
      deBai: 'Trùm cuối mùa: hai ngày làm việc, Drone nông nghiệp R1 nhận ca đầu tiên ở cánh đồng mới. Chép bảng mẫu hàng trên xuống bằng sow_up(4), sạc khi pin yếu bằng charge_if(5), gieo vàng các dấu trên luống bằng sow_marks(4), sạc lần nữa, ' +
        'gieo đỏ, vàng, đỏ ở hàng dưới từ phải sang trái, bay trái thêm một ô tới trạm thứ ba, sạc, rồi gieo luống xanh dương năm ô ở hàng cuối bằng span_sow("blue", 4).',
      veMaMau: 'Chương trình có sẵn đã gọi sow_up(4). Viết tiếp: charge_if, sow_marks, hàng ba màu, rồi luống cuối bằng span_sow.',
      san: [['.........', '....P...P', '....P....', '.........'], ['.........', '....P...P', '....P....', '.........']],
      mau: [['r.gy.....', '.....yy..', '.........', '.........'], ['bb.r.....', '.....y.y.', '.........', '.........']],
      hinh: [['.........', 'r.gy.yy..', '.....ryr.', '....bbbbb'], ['.........', 'bb.r.y.y.', '.....ryr.', '....bbbbb']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['sow_up(4)']),
      loiGiai: bai(C_R1),
      sao: { o: 32, nhip: 48 },
      loiSai: [
        { moTa: 'Không sạc: hết pin giữa ca', baiLam: bai(C_R1.filter(function (s) { return s !== 'charge_if(5)'; })), phaiCoMa: ['het-pin'] },
        { moTa: 'Quên đổi sang hạt vàng trước sow_marks(4)', baiLam: bai(C_R1.filter(function (s) { return s !== 'ink("yellow")'; })), phaiCoMa: ['het-pin'] },
        cung('Gieo vạch liền thay vì dùng sow_marks(4): gieo thừa trên luống', bai(['sow_up(4)', 'charge_if(5)', 'span_sow("yellow", 3)', 'go_right()'].concat(C_R1.slice(4))), ['to-thua'])
      ],
      goiY: ['sow_up(4) để lại màu hạt cuối cùng của bảng mẫu: nhớ gọi ink("yellow") trước sow_marks(4).', 'Ba trạm sạc nằm ở cuối hai chặng hàng trên và ngay dưới trạm đầu.',
        'Gieo xong ba màu đỏ-vàng-đỏ, bay trái một ô tới trạm, gọi charge_if(5), xuống một ô rồi gọi span_sow("blue", 4).']
    })
  ];

  ManHoc.manTrumMua4 = DS;
  if (laNode) module.exports = ManHoc;
})();

/* ============================================================================
   man-vuon-cu.js — Ngân hàng 20 màn GÓI 8 MÙA 4 "Vườn cũ rào sắt" (PDM4c, 31/10):
     · Chương 1 `vuon-cu` (10 màn: 1..10): Bay qua vườn cũ (drone nông nghiệp đủ bộ mùa 4 gặp lại rào =, hố u, băng > < ^ v, thùng nặng H mở cổng C qua nút M, đệm từ)
     · Chương 2 `che-vuon-cu` (10 màn: 1..10): Chế lệnh: qua vườn cũ (chế span_sow, mark_here, gate_sow, sow_up)
   Mọi màn: R1 = Drone nông nghiệp đủ bộ mùa 4 (loaiRobot: 'drone', than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren', taiCho: true }]).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = typeof module !== 'undefined' && module.exports;
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'ink', 'dot', 'pen_down', 'pen_up', 'color', 'land', 'take_off'];
  var KHAY_PIN = KHAY.concat(['battery']);
  var ROBOT = { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren', taiCho: true }] };

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than }; }
  function bai(chinh, them) {
    var kq = { chinh: chinh, hamCuaMan: [], hamCuaEmMoi: [] };
    if (them) {
      if (them.hamCuaMan) kq.hamCuaMan = them.hamCuaMan;
      if (them.hamCuaEmMoi) kq.hamCuaEmMoi = them.hamCuaEmMoi;
    }
    return kq;
  }
  function man(cfg) {
    var coPin = cfg.pin !== undefined;
    var nhieuSan = Array.isArray(cfg.san[0]);
    return Object.assign({
      chuong: 'vuon-cu',
      loaiRobot: 'drone',
      hamGoc: coPin ? KHAY_PIN.slice() : KHAY.slice(),
      robot: JSON.parse(JSON.stringify(ROBOT)),
      mucTieu: 'to-hinh',
      cauTruc: ['for', 'if', 'while', 'list'],                     // như các gói khác của mùa (nhìn dưới chân, nét liền, trạm sạc): lời giải có for / if (soát nhập liệu 2/11)
      nhipTheo: nhieuSan ? 'tong' : undefined,
      taoHam: [],
      hamCuaEmCan: []
    }, cfg);
  }
  function manChe(cfg) {
    return man(Object.assign({ chuong: 'che-vuon-cu', chinhCoDinh: true }, cfg));
  }

  var T_SPAN = ['ink(c)', 'pen_down()', 'for i in range(n):', '    go_right()', 'pen_up()'];
  var T_MARK = ['for i in range(n):', '    m = color("here")', '    if m != "none":', '        ink(m)', '        dot()', '    go_right()'];
  var T_GATE = ['wait()', 'go_right()', 'go_right()', 'ink(c)', 'dot()', 'wait()'];
  var T_SOW_UP = ['for i in range(n):', '    c = color("up")', '    if c != "none":', '        ink(c)', '        dot()', '    go_right()'];

  var DS = [
    // =========================================================================
    // CHƯƠNG 1: vuon-cu (10 màn)
    // =========================================================================

    man({
      so: 1, ten: 'Gieo qua rào cũ', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      deBai: 'Chương trình có sẵn đưa drone bay qua hàng rào =, băng chuyền > và hố u của khu vườn cũ để gieo bốn ô hoa đỏ. Bấm Chạy để xem.',
      veMaMau: 'Bấm Chạy: drone bay trên không nên vượt qua rào, băng chuyền và hố mà không bị cản hay cuốn trôi.',
      san: ['.=.>.u.'],
      hinh: ['r.r.r.r'],
      batDau: { x: 0, y: 0 },
      maMau: bai(['for i in range(3):', '    dot()', '    go_right()', '    go_right()', 'dot()', 'wait()']),
      loiGiai: bai(['for i in range(3):', '    dot()', '    go_right()', '    go_right()', 'dot()', 'wait()']),
      sao: { o: 6, nhip: 7 },
      loiSai: [],
      goiY: ['Drone bay trên cao nên hàng rào, băng chuyền và hố dưới đất không cản đường.', 'Bấm Chạy để xem bốn bông đỏ nở dọc lối vườn cũ.']
    }),

    man({
      so: 2, ten: 'Nhấc miệng gieo qua rào', hang: 'lam-quen',
      deBai: 'Gieo hai ô xanh dương bên trái hàng rào =, nhấc miệng gieo bay qua rào, rồi hạ miệng gieo tiếp hai ô xanh dương bên phải.',
      veMaMau: 'Chương trình có sẵn mới gieo hai ô đầu. Nhấc miệng gieo trước khi bay qua hàng rào =.',
      san: ['..=..'],
      hinh: ['bb.bb'],
      batDau: { x: 0, y: 0 },
      maMau: bai(['ink("blue")', 'pen_down()', 'go_right()']),
      loiGiai: bai(['ink("blue")', 'pen_down()', 'go_right()', 'pen_up()', 'go_right()', 'go_right()', 'pen_down()', 'go_right()']),
      sao: { o: 8, nhip: 4 },
      loiSai: [
        { moTa: 'Quên nhấc miệng gieo khi bay qua hàng rào: gieo đè lên rào', baiLam: bai(['ink("blue")', 'pen_down()', 'for i in range(4):', '    go_right()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Quên chọn hạt xanh dương trước khi hạ miệng gieo', baiLam: bai(['pen_down()', 'go_right()', 'pen_up()', 'go_right()', 'go_right()', 'pen_down()', 'go_right()']), phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Còn hạ miệng gieo mà bay qua ô hàng rào = là gieo ngoài luống.', 'Gọi pen_up() ở ô (1, 0), bay hai ô sang (3, 0) rồi mới pen_down().']
    }),

    man({
      so: 3, ten: 'Gieo ngay trên băng cũ', hang: 'lam-quen',
      deBai: 'Ba ô luống mờ nằm ngay trên băng chuyền >>>. Bay vào ô băng đầu, hạ miệng gieo hạt vàng rồi bay sang phải hai ô để gieo trọn ba ô trên băng.',
      veMaMau: 'Chương trình có sẵn mới bay vào đầu băng chuyền. Chọn hạt vàng và hạ miệng gieo.',
      san: ['.>>>.'],
      hinh: ['.yyy.'],
      batDau: { x: 0, y: 0 },
      maMau: bai(['go_right()', 'ink("yellow")']),
      loiGiai: bai(['go_right()', 'ink("yellow")', 'pen_down()', 'go_right()', 'go_right()', 'pen_up()']),
      sao: { o: 6, nhip: 3 },
      loiSai: [
        { moTa: 'Hạ miệng gieo ngay từ ô xuất phát ngoài luống', baiLam: bai(['ink("yellow")', 'pen_down()', 'for i in range(3):', '    go_right()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Chỉ gieo một ô đầu băng rồi bay qua', baiLam: bai(['go_right()', 'ink("yellow")', 'dot()', 'go_right()', 'go_right()']), phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Drone đang bay nên băng chuyền >>> bên dưới không đẩy lệch đường.', 'Tại ô (1, 0), gọi pen_down() rồi bay sang phải hai ô.']
    }),

    man({
      so: 4, ten: 'Chờ thùng mở cổng', hang: 'luyen',
      deBai: 'Thùng nặng trên băng chuyền >>M đang trôi về nút M để mở cổng C. Bay qua rào = tới trước cổng, chờ một nhịp cho thùng đè nút mở cổng, rồi bay qua gieo hoa đỏ ở ô cuối.',
      veMaMau: 'Chương trình có sẵn bay thẳng qua cổng khi cổng chưa mở. Thêm lệnh chờ trước cổng C.',
      san: ['>>M#', '.=C.', '####'],
      hinh: ['....', '...r', '....'],
      thungThem: [{ x: 1, y: 0, nang: true }],
      batDau: { x: 0, y: 1 },
      maMau: bai(['go_right()', 'go_right()', 'go_right()', 'dot()', 'wait()']),
      loiGiai: bai(['go_right()', 'wait()', 'go_right()', 'go_right()', 'dot()', 'wait()']),
      sao: { o: 6, nhip: 5 },
      loiSai: [
        { moTa: 'Không chờ thùng đè nút: đâm vào cổng C đang đóng', baiLam: bai(['go_right()', 'go_right()', 'go_right()', 'dot()', 'wait()']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Dừng lại gieo ngay trước cổng', baiLam: bai(['go_right()', 'dot()', 'wait()']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Nhịp 1 bay sang (1, 1), thùng còn đang trên băng ở (1, 0).', 'Gọi wait() một nhịp ở (1, 1) để thùng tới nút M mở cổng C, rồi bay tiếp hai ô.']
    }),

    man({
      so: 5, ten: 'Đọc biển bên kia hố', hang: 'luyen',
      deBai: 'Bay sang phải hai ô qua hố u, đọc màu ô chỉ dẫn bên phải bằng color("right"), chọn hạt màu đó rồi bay xuống qua rào = sang ô đích để gieo. Hai sân.',
      veMaMau: 'Chương trình có sẵn mới bay qua hố. Đọc color("right"), chọn hạt rồi bay tới ô đích.',
      san: [['.u.r', '.=..'], ['.u.b', '.=..']],
      hinh: [['....', '...r'], ['....', '...b']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['go_right()', 'go_right()']),
      loiGiai: bai(['go_right()', 'go_right()', 'c = color("right")', 'ink(c)', 'go_down()', 'go_right()', 'dot()', 'wait()']),
      sao: { o: 8, nhip: 10 },
      loiSai: [
        { moTa: 'Cố định hạt đỏ, không đọc ô chỉ dẫn', cung: true, baiLam: bai(['go_right()', 'go_right()', 'ink("red")', 'go_down()', 'go_right()', 'dot()', 'wait()']), phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Đọc color("right") ngay từ đầu khi bên phải là hố trống', baiLam: bai(['c = color("right")', 'ink(c)', 'go_right()', 'go_right()', 'go_down()', 'go_right()', 'dot()', 'wait()']), phaiCoMa: ['mau-son-sai'] }
      ],
      goiY: ['Tại ô (2, 0), ô chỉ dẫn màu nằm ngay bên phải (3, 0).', 'Sau khi ink(c), bay xuống (2, 1) rồi bay phải sang (3, 1) để dot() và wait().']
    }),

    man({
      so: 6, ten: 'Bay qua bãi đệm từ', hang: 'luyen',
      deBai: 'Dưới đất có hai đệm từ N, S nhưng drone nông nghiệp không gắn nam châm nên không bị hút. Bay sang phải bốn ô, ô nào dưới chân có dấu màu thì chọn màu đó và gieo. Hai sân.',
      veMaMau: 'Dùng vòng lặp 4 lần: mỗi bước bay sang phải, đọc m = color("here"), nếu m != "none" thì chọn màu m và dot().',
      san: [['.r.y.', '.....'], ['..b.g', '.....']],
      hinh: [['.r.y.', '.....'], ['..b.g', '.....']],
      demTu: [[{ x: 1, y: 1, cuc: 'N' }, { x: 3, y: 1, cuc: 'S' }], [{ x: 1, y: 1, cuc: 'N' }, { x: 3, y: 1, cuc: 'S' }]],
      batDau: { x: 0, y: 0 },
      maMau: bai(['for i in range(4):', '    go_right()']),
      loiGiai: bai(['for i in range(4):', '    go_right()', '    m = color("here")', '    if m != "none":', '        ink(m)', '        dot()', 'wait()']),
      sao: { o: 6, nhip: 9 },
      congThucKhac: [
        { moTa: 'Lưu color("here") vào biến c rồi xét c != "none"', baiLam: bai(['for i in range(4):', '    go_right()', '    c = color("here")', '    if c != "none":', '        ink(c)', '        dot()', 'wait()']) }
      ],
      loiSai: [
        { moTa: 'Gieo cứng ở ô 1 và ô 3 màu đỏ, vàng theo sân đầu', cung: true, baiLam: bai(['go_right()', 'ink("red")', 'dot()', 'go_right()', 'go_right()', 'ink("yellow")', 'dot()', 'wait()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Không xét khác "none", ô trống cũng gieo', baiLam: bai(['for i in range(4):', '    go_right()', '    m = color("here")', '    ink(m)', '    dot()', 'wait()']), phaiCoMa: ['mau-son-sai'] }
      ],
      goiY: ['Mỗi bước trong vòng lặp: go_right(), đọc m = color("here") rồi hỏi if m != "none":.', 'Cuối vòng lặp gọi wait() để nhịp cuối kịp gieo hạt ở ô thứ tư.']
    }),

    man({
      so: 7, ten: 'Ghé trạm giữa rào', hang: 'bien-the',
      pin: [5, 7],
      deBai: 'Bay ba ô sang phải qua hàng rào = tới ô giữa sân. Nếu pin còn dưới 4 thì đáp xuống trạm P sạc rồi cất cánh, sau đó bay tiếp hai ô và gieo liền hai ô hoa đỏ cuối hàng. Hai sân: sân pin ít có trạm P, sân pin nhiều là hố u.',
      veMaMau: 'Tại ô thứ ba, đọc b = battery() rồi kiểm tra if b < 4: trước khi land() và take_off().',
      san: [['..=P=..'], ['..=u=..']],
      hinh: [['.....rr'], ['.....rr']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['for i in range(3):', '    go_right()']),
      loiGiai: bai(['for i in range(3):', '    go_right()', 'b = battery()', 'if b < 4:', '    land()', '    take_off()', 'go_right()', 'go_right()', 'pen_down()', 'go_right()']),
      sao: { o: 9, nhip: 14 },
      loiSai: [
        { moTa: 'Không sạc khi pin yếu: hết pin giữa đường ở sân đầu', cung: true, baiLam: bai(['for i in range(5):', '    go_right()', 'pen_down()', 'go_right()']), phaiCoMa: ['het-pin'] },
        { moTa: 'Luôn đáp đất không hỏi pin: vướng hố u và hết pin ở sân hai', cung: true, baiLam: bai(['for i in range(3):', '    go_right()', 'land()', 'take_off()', 'go_right()', 'go_right()', 'pen_down()', 'go_right()']), phaiCoMa: [' dap-bi-chan'.trim()] }
      ],
      goiY: ['Sân đầu tới ô (3, 0) chỉ còn 2 pin (< 4) nên cần land() rồi take_off().', 'Sân hai còn 4 pin và dưới chân là hố u, nhờ if b < 4: nên drone bay thẳng qua.']
    }),

    man({
      so: 8, ten: 'Ba luống ngăn hố', hang: 'bien-the',
      deBai: 'Hàng trên đặt ba biển màu ngăn bằng bụi cây, hàng dưới xen kẽ rào =, băng > và hố u. Lặp 3 lần: đọc màu phía trên bằng color("up") để gieo ô hiện tại, rồi bay sang phải hai ô qua chướng ngại. Hai sân.',
      veMaMau: 'Chương trình có sẵn mới lặp một bước bay. Đọc color("up"), chọn hạt, dot() rồi bay hai ô.',
      san: [['r#y#b#', '.=.>.u'], ['b#r#g#', '.=.>.u']],
      hinh: [['......', 'r.y.b.'], ['......', 'b.r.g.']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['for i in range(3):', '    go_right()', '    go_right()']),
      loiGiai: bai(['for i in range(3):', '    m = color("up")', '    ink(m)', '    dot()', '    go_right()', '    go_right()']),
      sao: { o: 5, nhip: 10 },
      loiSai: [
        { moTa: 'Cố định màu đỏ cho cả ba luống, không đọc biển phía trên', cung: true, baiLam: bai(['for i in range(3):', '    ink("red")', '    dot()', '    go_right()', '    go_right()']), phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Chỉ bay một ô mỗi bước nên đọc nhầm bụi cây # phía trên', baiLam: bai(['for i in range(3):', '    m = color("up")', '    ink(m)', '    dot()', '    go_right()']), phaiCoMa: ['mau-son-sai'] }
      ],
      goiY: ['Ở các cột 0, 2, 4, biển màu nằm ngay phía trên nên đọc m = color("up") rồi ink(m).', 'Lệnh go_right() đầu tiên sau dot() vừa bay vừa gieo xuống ô vừa đứng.']
    }),

    man({
      so: 9, ten: 'Sửa nhịp chờ cổng', hang: 'bien-the',
      deBai: 'Thùng nặng trên băng chuyền >>M cần 4 nhịp mới tới nút M mở cổng C, nhưng chương trình chỉ bay một ô rồi chờ 1 nhịp nên đâm vào cổng. Sửa để chờ đủ 3 nhịp rồi qua cổng gieo liền hai ô vàng trên băng chuyền.',
      veMaMau: 'Chạy thử: ở nhịp 3 cổng C chưa mở. Tăng số nhịp chờ trước khi bay qua cổng.',
      san: ['>>M##', '.=C>>', '#####'],
      hinh: ['.....', '...yy', '.....'],
      thungThem: [{ x: 0, y: 0, nang: true }],
      batDau: { x: 0, y: 1 },
      maMau: bai(['go_right()', 'wait()', 'go_right()', 'go_right()', 'ink("yellow")', 'pen_down()', 'go_right()']),
      loiGiai: bai(['go_right()', 'for i in range(3):', '    wait()', 'go_right()', 'go_right()', 'ink("yellow")', 'pen_down()', 'go_right()']),
      sao: { o: 8, nhip: 7 },
      congThucKhac: [
        { moTa: 'Gọi ba lệnh wait() liên tiếp', baiLam: bai(['go_right()', 'wait()', 'wait()', 'wait()', 'go_right()', 'go_right()', 'ink("yellow")', 'pen_down()', 'go_right()']) }
      ],
      loiSai: [
        { moTa: 'Giữ nguyên chỉ chờ 1 nhịp: cổng C chưa mở', baiLam: bai(['go_right()', 'wait()', 'go_right()', 'go_right()', 'ink("yellow")', 'pen_down()', 'go_right()']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Thùng nặng đi 2 ô trên băng chuyền tới (2, 0) mất 4 nhịp.', 'Drone bay sang (1, 1) ở nhịp 1, chờ thêm 3 nhịp (nhịp 2, 3, 4) thì cổng C mở.']
    }),

    man({
      so: 10, ten: 'Trùm vườn cũ', hang: 'trum',
      deBai: 'Đọc màu đơn hàng dưới chân ở ô đầu, bay sang phải một ô qua hàng rào = tới trước cổng C, chờ một nhịp cho thùng nặng trên băng >>M đè nút mở cổng, rồi bay qua cổng hai ô và gieo liền hai ô cuối theo màu đơn hàng. Hai sân.',
      veMaMau: 'Kết hợp đọc color("here"), chờ thùng mở cổng C và hạ miệng gieo pen_down() ở hai ô cuối.',
      san: [['>>M##', 'r=C>.', '#####'], ['>>M##', 'b=C>.', '#####']],
      hinh: [['.....', '...rr', '.....'], ['.....', '...bb', '.....']],
      thungThem: [[{ x: 1, y: 0, nang: true }], [{ x: 1, y: 0, nang: true }]],
      batDau: { x: 0, y: 1 },
      maMau: bai(['c = color("here")', 'ink(c)']),
      loiGiai: bai(['c = color("here")', 'ink(c)', 'go_right()', 'wait()', 'go_right()', 'go_right()', 'pen_down()', 'go_right()']),
      sao: { o: 8, nhip: 10 },
      loiSai: [
        { moTa: 'Cố định hạt đỏ, không đọc đơn hàng', cung: true, baiLam: bai(['ink("red")', 'go_right()', 'wait()', 'go_right()', 'go_right()', 'pen_down()', 'go_right()']), phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Quên chờ thùng nặng mở cổng C', baiLam: bai(['c = color("here")', 'ink(c)', 'for i in range(3):', '    go_right()', 'pen_down()', 'go_right()']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Bước go_right() đầu đưa drone tới (1, 1) ở nhịp 1; gọi wait() ở nhịp 2 để thùng tới nút M.', 'Bay thêm hai bước tới (3, 1) rồi pen_down() và go_right() để gieo (3, 1) và (4, 1).']
    }),

    // =========================================================================
    // CHƯƠNG 2: che-vuon-cu (10 màn)
    // =========================================================================

    manChe({
      so: 1, ten: 'Hàm nhảy rào gieo hạt', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      deBai: 'Hàm có sẵn leap_dot(c) chọn hạt màu c, chấm một ô rồi bay hai ô sang phải vượt qua rào hay hố. Chương trình chính gọi leap_dot ba lần để gieo ba màu. Bấm Chạy để xem.',
      veMaMau: 'Bấm Chạy: mỗi lần gọi leap_dot(c) gieo một ô rồi nhảy cách qua chướng ngại.',
      san: ['.=.>.u.'],
      hinh: ['r.y.b.r'],
      batDau: { x: 0, y: 0 },
      maMau: bai(['leap_dot("red")', 'leap_dot("yellow")', 'leap_dot("blue")', 'ink("red")', 'dot()', 'wait()'],
        { hamCuaMan: [H('leap_dot', ['c'], ['ink(c)', 'dot()', 'go_right()', 'go_right()'])] }),
      loiGiai: bai(['leap_dot("red")', 'leap_dot("yellow")', 'leap_dot("blue")', 'ink("red")', 'dot()', 'wait()'],
        { hamCuaMan: [H('leap_dot', ['c'], ['ink(c)', 'dot()', 'go_right()', 'go_right()'])] }),
      sao: { o: 10, nhip: 7 },
      loiSai: [],
      goiY: ['Hàm có đối số c giúp đổi màu hạt ở mỗi nhịp nhảy qua rào, băng chuyền và hố.', 'Bấm Chạy để xem chương trình hoạt động.']
    }),

    manChe({
      so: 2, ten: 'Hàm gieo luống nhấc miệng', hang: 'lam-quen',
      taoHam: ['span_sow'],
      deBai: 'Chế hàm span_sow(c, n): chọn hạt màu c, hạ miệng gieo pen_down(), lặp n lần go_right(), rồi nhấc miệng gieo pen_up() để bay qua rào không bị lem. Chương trình chính đã khóa.',
      veMaMau: 'Bấm "+ Tạo hàm" để tạo span_sow(c, n): ink(c), pen_down(), lặp n lần go_right(), cuối cùng pen_up().',
      san: ['..=..'],
      hinh: ['rr.bb'],
      batDau: { x: 0, y: 0 },
      maMau: bai(['span_sow("red", 1)', 'go_right()', 'go_right()', 'span_sow("blue", 1)']),
      loiGiai: bai(['span_sow("red", 1)', 'go_right()', 'go_right()', 'span_sow("blue", 1)'],
        { hamCuaEmMoi: [H('span_sow', ['c', 'n'], T_SPAN)] }),
      sao: { o: 9, nhip: 4 },
      congThucKhac: [
        { moTa: 'Dùng while đếm ngược n bước', hamCuaEmMoi: [H('span_sow', ['c', 'n'], ['ink(c)', 'pen_down()', 'while n > 0:', '    go_right()', '    n = n - 1', 'pen_up()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi span_sow mà chưa tạo hàm', baiLam: bai(['span_sow("red", 1)', 'go_right()', 'go_right()', 'span_sow("blue", 1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên pen_up() ở cuối hàm: bay qua hàng rào bị lem hạt', baiLam: bai(['span_sow("red", 1)', 'go_right()', 'go_right()', 'span_sow("blue", 1)']), hamCuaEmMoi: [H('span_sow', ['c', 'n'], ['ink(c)', 'pen_down()', 'for i in range(n):', '    go_right()'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Nhớ gọi pen_up() ở dòng cuối của span_sow để khi rời hàm miệng gieo đã nhấc.', 'Với n = 1, pen_down() rồi go_right() một bước sẽ gieo cả ô đứng lẫn ô kế tiếp.']
    }),

    manChe({
      so: 3, ten: 'Hàm gieo theo dấu dưới chân', hang: 'lam-quen',
      taoHam: ['mark_here'],
      deBai: 'Chế hàm mark_here(n): lặp n lần, mỗi bước nếu ô dưới chân có màu thì chọn màu đó và dot(), sau đó bay sang phải một ô. Chương trình chính đã khóa. Hai sân.',
      veMaMau: 'Bấm "+ Tạo hàm" để tạo mark_here(n) với một vòng lặp n bước: đọc m = color("here"), xét m != "none".',
      san: [['r.b..', '.....'], ['.y.g.', '.....']],
      hinh: [['r.b..', '.....'], ['.y.g.', '.....']],
      demTu: [[{ x: 1, y: 1, cuc: 'N' }, { x: 3, y: 1, cuc: 'S' }], [{ x: 1, y: 1, cuc: 'N' }, { x: 3, y: 1, cuc: 'S' }]],
      batDau: { x: 0, y: 0 },
      maMau: bai(['mark_here(4)', 'wait()']),
      loiGiai: bai(['mark_here(4)', 'wait()'],
        { hamCuaEmMoi: [H('mark_here', ['n'], T_MARK)] }),
      sao: { o: 7, nhip: 7 },
      congThucKhac: [
        { moTa: 'Gán c = color("here") trước khi so sánh', hamCuaEmMoi: [H('mark_here', ['n'], ['for i in range(n):', '    c = color("here")', '    if c != "none":', '        ink(c)', '        dot()', '    go_right()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi mark_here mà chưa tạo hàm', baiLam: bai(['mark_here(4)', 'wait()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Cố định gieo đỏ ở mọi ô có dấu', cung: true, baiLam: bai(['mark_here(4)', 'wait()']), hamCuaEmMoi: [H('mark_here', ['n'], ['for i in range(n):', '    m = color("here")', '    if m != "none":', '        ink("red")', '        dot()', '    go_right()'])], phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Trong vòng lặp for i in range(n):, đọc m = color("here"), kiểm tra if m != "none": rồi mới ink(m) và dot().', 'Lệnh go_right() đặt ngoài khối if để bước nào drone cũng bay sang phải.']
    }),

    manChe({
      so: 4, ten: 'Gieo hai bờ qua hố', hang: 'luyen',
      chinhCoDinh: false, hamCuaEmCan: ['span_sow'],
      deBai: 'Đọc màu đơn hàng dưới chân ở ô đầu vào biến c, bay sang phải một ô, dùng span_sow(c, 1) gieo hai ô bờ trái, bay hai ô qua hố u rồi gọi span_sow(c, 1) gieo hai ô bờ phải. Hai sân.',
      veMaMau: 'Chương trình có sẵn mới đọc màu đơn hàng vào c. Viết tiếp bằng go_right() và span_sow(c, 1).',
      san: [['r..u..'], ['y..u..']],
      hinh: [['.rr.rr'], ['.yy.yy']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['c = color("here")']),
      loiGiai: bai(['c = color("here")', 'go_right()', 'span_sow(c, 1)', 'go_right()', 'go_right()', 'span_sow(c, 1)'],
        { hamCuaEmMoi: [] }),
      sao: { o: 11, nhip: 10 },
      loiSai: [
        { moTa: 'Cố định màu đỏ trong span_sow', cung: true, baiLam: bai(['go_right()', 'span_sow("red", 1)', 'go_right()', 'go_right()', 'span_sow("red", 1)']), phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Chỉ bay một ô sau bờ trái nên gieo đè lên hố u', baiLam: bai(['c = color("here")', 'go_right()', 'span_sow(c, 1)', 'go_right()', 'span_sow(c, 1)']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['span_sow(c, 1) ở (1, 0) đưa drone tới (2, 0) và đã tự nhấc miệng gieo.', 'Từ (2, 0) gọi go_right() hai lần qua hố u ở (3, 0) tới (4, 0), rồi gọi span_sow(c, 1).']
    }),

    manChe({
      so: 5, ten: 'Hàm chờ cổng rồi gieo', hang: 'luyen',
      taoHam: ['gate_sow'],
      deBai: 'Chế hàm gate_sow(c): chờ một nhịp (wait()) cho thùng nặng đè nút M mở cổng C, bay sang phải hai ô qua cổng, chọn hạt màu c rồi dot() và wait(). Chương trình chính đã khóa.',
      veMaMau: 'Bấm "+ Tạo hàm" để tạo gate_sow(c): wait(), bay phải 2 ô, ink(c), dot(), wait().',
      san: ['>>M#', '.=C.', '####'],
      hinh: ['....', '...y', '....'],
      thungThem: [{ x: 1, y: 0, nang: true }],
      batDau: { x: 0, y: 1 },
      maMau: bai(['go_right()', 'gate_sow("yellow")']),
      loiGiai: bai(['go_right()', 'gate_sow("yellow")'],
        { hamCuaEmMoi: [H('gate_sow', ['c'], T_GATE)] }),
      sao: { o: 8, nhip: 5 },
      congThucKhac: [
        { moTa: 'Chọn hạt ink(c) trước khi chờ cổng mở', hamCuaEmMoi: [H('gate_sow', ['c'], ['ink(c)', 'wait()', 'go_right()', 'go_right()', 'dot()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi gate_sow mà chưa tạo hàm', baiLam: bai(['go_right()', 'gate_sow("yellow")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên wait() đầu hàm nên đâm vào cổng C đang đóng', baiLam: bai(['go_right()', 'gate_sow("yellow")']), hamCuaEmMoi: [H('gate_sow', ['c'], ['go_right()', 'go_right()', 'ink(c)', 'dot()', 'wait()'])], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Chương trình chính đã đưa drone tới (1, 1) trước cổng C ở nhịp 1.', 'Trong gate_sow(c), gọi wait() ở đầu để nhịp 2 thùng đè nút M, rồi bay phải 2 ô tới (3, 1) và gieo.']
    }),

    manChe({
      so: 6, ten: 'Qua cổng gieo tiếp luống', hang: 'luyen',
      chinhCoDinh: false, hamCuaEmCan: ['gate_sow', 'span_sow'],
      deBai: 'Đọc màu đơn hàng dưới chân vào biến c, bay sang phải một ô tới trước cổng C, gọi gate_sow(c) để qua cổng gieo ô đầu, rồi bay sang phải một ô và gọi span_sow(c, 1) gieo nốt hai ô trên băng chuyền >>. Hai sân.',
      veMaMau: 'Kết hợp gate_sow(c) và span_sow(c, 1) sau khi đọc c = color("here").',
      san: [['>>M###', 'r=C.>>', '######'], ['>>M###', 'g=C.>>', '######']],
      hinh: [['......', '...rrr', '......'], ['......', '...ggg', '......']],
      thungThem: [[{ x: 1, y: 0, nang: true }], [{ x: 1, y: 0, nang: true }]],
      batDau: { x: 0, y: 1 },
      maMau: bai(['c = color("here")', 'go_right()']),
      loiGiai: bai(['c = color("here")', 'go_right()', 'gate_sow(c)', 'go_right()', 'span_sow(c, 1)']),
      sao: { o: 16, nhip: 14 },
      loiSai: [
        { moTa: 'Cố định màu đỏ cho cả hai hàm', cung: true, baiLam: bai(['go_right()', 'gate_sow("red")', 'go_right()', 'span_sow("red", 1)']), phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Quên gọi gate_sow, chỉ gọi span_sow trước cổng', baiLam: bai(['c = color("here")', 'go_right()', 'span_sow(c, 1)']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Tại (1, 1), gọi gate_sow(c) sẽ chờ cổng C mở rồi bay sang (3, 1) và gieo ô đó.', 'Sau gate_sow(c), gọi go_right() sang (4, 1) rồi span_sow(c, 1) để gieo (4, 1) và (5, 1).']
    }),

    manChe({
      so: 7, ten: 'Hàm đọc biển hàng trên', hang: 'bien-the',
      taoHam: ['sow_up'],
      deBai: 'Chế hàm sow_up(n): lặp n lần, đọc màu phía trên c = color("up"), nếu c != "none" thì chọn hạt c và dot(), sau đó bay sang phải một ô. Chương trình chính đã khóa. Hai sân.',
      veMaMau: 'Bấm "+ Tạo hàm" để tạo sow_up(n) đọc color("up") ở mỗi bước.',
      san: [['r#b#.', '>>>>.'], ['.y#g#', '>>>>.']],
      hinh: [['.....', 'r.b..'], ['.....', '.y.g.']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['sow_up(4)', 'wait()']),
      loiGiai: bai(['sow_up(4)', 'wait()'],
        { hamCuaEmMoi: [H('sow_up', ['n'], T_SOW_UP)] }),
      sao: { o: 8, nhip: 7 },
      congThucKhac: [
        { moTa: 'Hỏi trực tiếp color("up") != "none"', hamCuaEmMoi: [H('sow_up', ['n'], ['for i in range(n):', '    m = color("up")', '    if m != "none":', '        ink(m)', '        dot()', '    go_right()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi sow_up mà chưa tạo hàm', baiLam: bai(['sow_up(4)', 'wait()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đọc nhầm color("here") thay vì color("up")', baiLam: bai(['sow_up(4)', 'wait()']), hamCuaEmMoi: [H('sow_up', ['n'], T_MARK)], phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Biển màu đặt ở hàng trên (y = 0), drone bay trên băng chuyền ở hàng dưới (y = 1).', 'Mỗi bước hỏi c = color("up"), nếu c != "none" thì ink(c) và dot(), rồi go_right().']
    }),

    manChe({
      so: 8, ten: 'Sửa hàm gieo qua rào', hang: 'bien-the',
      deBai: 'Hàm của màn hop_sow(c, n) quên nhấc miệng gieo pen_up() ở cuối nên khi chương trình chính bay qua hàng rào = bị gieo lem lên rào. Sửa lại hop_sow(c, n).',
      veMaMau: 'Thêm pen_up() vào cuối hàm hop_sow(c, n).',
      san: ['..=..'],
      hinh: ['yy.gg'],
      batDau: { x: 0, y: 0 },
      maMau: bai(['hop_sow("yellow", 1)', 'go_right()', 'go_right()', 'hop_sow("green", 1)'],
        { hamCuaMan: [H('hop_sow', ['c', 'n'], ['ink(c)', 'pen_down()', 'for i in range(n):', '    go_right()'])] }),
      loiGiai: bai(['hop_sow("yellow", 1)', 'go_right()', 'go_right()', 'hop_sow("green", 1)'],
        { hamCuaMan: [H('hop_sow', ['c', 'n'], T_SPAN)] }),
      sao: { o: 9, nhip: 4 },
      loiSai: [
        { moTa: 'Không sửa hàm: miệng gieo còn hạ khi bay qua rào', baiLam: bai(['hop_sow("yellow", 1)', 'go_right()', 'go_right()', 'hop_sow("green", 1)'],
          { hamCuaMan: [H('hop_sow', ['c', 'n'], ['ink(c)', 'pen_down()', 'for i in range(n):', '    go_right()'])] }), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Sau vòng lặp for i in range(n):, miệng gieo vẫn đang hạ.', 'Thêm pen_up() ở cuối thân hàm hop_sow.']
    }),

    manChe({
      so: 9, ten: 'Đọc biển rồi kéo luống', hang: 'bien-the',
      chinhCoDinh: false, hamCuaEmCan: ['sow_up', 'span_sow'],
      deBai: 'Dùng sow_up(3) bay dọc hàng giữa qua hố u để gieo theo biển màu hàng trên, sau đó bay xuống một ô và dùng span_sow("yellow", 2) gieo luống vàng ba ô trên băng chuyền <<<. Hai sân.',
      veMaMau: 'Viết chương trình chính gọi sow_up(3), bay xuống rồi gọi span_sow("yellow", 2).',
      san: [['r#b###', '.u.=..', '###<<<'], ['g#r###', '.u.=..', '###<<<']],
      hinh: [['......', 'r.b...', '...yyy'], ['......', 'g.r...', '...yyy']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['sow_up(3)']),
      loiGiai: bai(['sow_up(3)', 'go_down()', 'span_sow("yellow", 2)']),
      sao: { o: 14, nhip: 12 },
      loiSai: [
        { moTa: 'Quên gọi sow_up(3), chỉ bay xuống gieo luống vàng', baiLam: bai(['go_right()', 'go_right()', 'go_right()', 'go_down()', 'span_sow("yellow", 2)']), phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Cố định gieo đỏ và xanh dương thay vì gọi sow_up(3)', cung: true, baiLam: bai(['ink("red")', 'dot()', 'go_right()', 'go_right()', 'ink("blue")', 'dot()', 'go_right()', 'go_down()', 'span_sow("yellow", 2)']), phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['sow_up(3) đưa drone từ (0, 1) sang (3, 1) và gieo hai dấu ở cột 0, cột 2.', 'Từ (3, 1), gọi go_down() xuống (3, 2) rồi gọi span_sow("yellow", 2) để gieo tới (5, 2).']
    }),

    manChe({
      so: 10, ten: 'Trùm chế lệnh vườn cũ', hang: 'trum',
      chinhCoDinh: false, hamCuaEmCan: ['mark_here', 'gate_sow', 'span_sow'],
      deBai: 'Dùng mark_here(3) gieo theo dấu màu qua bãi đệm từ tới ô đơn hàng trước cổng C, đọc c = color("here"), gọi gate_sow(c) để chờ thùng nặng mở cổng C và gieo ô sau cổng, rồi bay sang phải một ô và gọi span_sow(c, 1) gieo hai ô cuối. Hai sân.',
      veMaMau: 'Kết hợp cả ba hàm mark_here, gate_sow và span_sow trong chương trình chính.',
      san: [['>>>M####', 'r..bC.>>', '........'], ['>>>M####', 'y..rC.>>', '........']],
      hinh: [['........', 'r....bbb', '........'], ['........', 'y....rrr', '........']],
      thungThem: [[{ x: 1, y: 0, nang: true }], [{ x: 1, y: 0, nang: true }]],
      demTu: [[{ x: 1, y: 2, cuc: 'N' }], [{ x: 1, y: 2, cuc: 'N' }]],
      batDau: { x: 0, y: 1 },
      maMau: bai(['mark_here(3)']),
      loiGiai: bai(['mark_here(3)', 'c = color("here")', 'gate_sow(c)', 'go_right()', 'span_sow(c, 1)']),
      sao: { o: 21, nhip: 18 },
      loiSai: [
        { moTa: 'Cố định màu xanh dương cho gate_sow và span_sow', cung: true, baiLam: bai(['mark_here(3)', 'gate_sow("blue")', 'go_right()', 'span_sow("blue", 1)']), phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Quên gọi mark_here(3) ở đầu mà chỉ bay thẳng tới cổng', baiLam: bai(['for i in range(3):', '    go_right()', 'c = color("here")', 'gate_sow(c)', 'go_right()', 'span_sow(c, 1)']), phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['mark_here(3) đưa drone từ (0, 1) tới (3, 1) ở nhịp 3 và gieo dấu đầu.', 'Tại (3, 1), đọc c = color("here") rồi gọi gate_sow(c): nhịp 4 chờ thùng tới nút M mở cổng C, rồi bay qua gieo ở (5, 1).', 'Cuối cùng go_right() sang (6, 1) và gọi span_sow(c, 1) để gieo (6, 1) và (7, 1).']
    })
  ];

  ManHoc.manVuonCu = DS;
  if (laNode) module.exports = ManHoc;
})();

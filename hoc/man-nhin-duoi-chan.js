/* ============================================================================
   man-nhin-duoi-chan.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 7 "Nhìn dưới chân" (KE-HOACH-MUA-4.md; PDM4b 31/10 dựng lại trên drone nông nghiệp).
   User 29/10: camera gốc đọc 4 hướng, NÂNG CẤP thêm "tại chỗ". User 30/10 chọn phương án A: chương flycam cũ (look()) sang mùa 5; gói 7 dựng màn mới.
     - `nhin-duoi`: chương 1 "Nhìn xuống đọc màu": drone nông nghiệp gắn bộ gieo hạt dưới bụng + camera bốn hướng bản nâng cấp ({ ma: 'camera-4', o: 'tren', taiCho: true }):
       color("here") đọc ô ngay dưới bụng. Bốn hướng "up" / "down" / "left" / "right" vẫn có: "down" là ô phía dưới trên bản đồ, KHÁC "here".
     - `che-nhin-duoi`: chương 2 "Chế lệnh: đọc đơn hàng".
   Máy kiểm: hoc/kiem-man-mua-4.mjs, hoc/kiem-lo-trinh.mjs mục mùa 4, hoc/kiem-cam-4.mjs (lõi "here").
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var SON = ['ink', 'dot', 'pen_down', 'pen_up'];
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function LAP(n, than) { return ['for i in range(' + n + '):'].concat((Array.isArray(than) ? than : [than]).map(function (s) { return '    ' + s; })); }

  /** Drone nông nghiệp gắn bộ gieo hạt dưới bụng + camera bốn hướng NÂNG CẤP (đọc được "here"); m.nam: true thì mục tiêu to-hinh (gieo hạt). */
  function man(m) {
    var nam = m.nam;
    delete m.nam;
    m.chuong = m.chuong || 'nhin-duoi';
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren', taiCho: true }] };
    m.hamGoc = m.hamGoc || BAY.concat(SON, ['color']);
    m.mucTieu = m.mucTieu || (nam ? 'to-hinh' : 'toi-co');
    if (nam) m.nhipTheoLoiGiai = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }
  function manChe(m) { m.chuong = 'che-nhin-duoi'; if (m.chinhCoDinh !== false) m.chinhCoDinh = true; else delete m.chinhCoDinh; return man(m); }

  var C_TOI_DO = ['m = color("here")', 'while m != "red":', '    go_right()', '    m = color("here")', 'go_down()'];
  var C_DUONG = LAP(5, ['m = color("here")', 'if m == "blue":', '    go_down()', 'else:', '    go_right()']);
  var SAN_DUONG = [['ggb#', '##gb', '###F'], ['b###', 'gb##', '#ggF']];
  var C_DEM = ['n = 0', 'for i in range(4):', '    go_right()', '    m = color("here")', '    if m == "red":', '        n = n + 1', 'for i in range(n):', '    go_down()'];
  var C_GHI = ['a = []', 'for i in range(3):', '    go_right()', '    m = color("here")', '    a.append(m)', 'for c in a:', '    if c == "red":', '        go_down()', '    else:', '        go_right()'];
  var C_HOP = ['go_right()', 'c = color("here")', 'ink(c)', 'if c == "red":', '    go_up()', 'else:', '    go_down()', 'dot()', 'wait()'];
  var C_TIM_DO = ['m = color("here")', 'while m != "red":', '    go_right()', '    m = color("here")', 'go_up()', 'go_up()', 'dot()', 'wait()'];
  var T_SEEK = ['m = color("here")', 'while m != col:', '    go_right()', '    m = color("here")'];
  var T_GHI_DUOI = ['for i in range(n):', '    go_right()', '    m = color("here")', '    a.append(m)'];
  var C_GHI_HAM = ['a = []', 'read_below(a, 3)', 'for c in a:', '    if c == "red":', '        go_down()', '    else:', '        go_right()'];
  var T_MUI_TEN = ['m = color("here")', 'if m == "blue":', '    go_down()', 'else:', '    go_right()'];
  var T_DEM_MAU = ['for i in range(n):', '    go_right()', '    m = color("here")', '    if m == col:', '        a.append(col)'];      // ghi màu thật (nghiệm thu 30/10: mẹo append(1) chỉ dạy một lần ở che-cam-bon.3)
  var C_DEM_HAM = ['a = []', 'count_here(a, 4, "red")', 'for i in range(len(a)):', '    go_down()'];
  var T_NANG = ['for i in range(n):', '    go_up()', 'dot()', 'wait()'];

  var DS = [
    man({
      so: 1, ten: 'Nhìn xuống chân', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, hamCuaEmCan: [],
      deBai: 'Em nâng cấp camera: thêm hướng "here", camera nhìn ô ngay dưới bụng drone. Bấm Chạy xem drone bay sang phải, mỗi ô nhìn xuống, thấy ô đỏ dưới chân thì dừng rồi hạ xuống cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn camera chiếu xuống ô dưới bụng mỗi bước.',
      san: ['.gbr', '...F'],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_TOI_DO),
      loiGiai: bai(C_TOI_DO),
      sao: { o: 3, nhip: 4 },
      goiY: ['"here" là ô drone đang ở; "down" là ô phía dưới trên bản đồ.', 'Đọc màu không tốn nhịp.']
    }),

    man({
      so: 2, ten: 'Dừng trên ô đỏ', hang: 'lam-quen', hamCuaEmCan: [],
      deBai: 'Hai dãy ô màu, ô đỏ ở hai chỗ khác nhau; cờ nằm ngay dưới ô đỏ. Bay cho tới khi ô dưới chân là ô đỏ, rồi hạ xuống cờ.',
      veMaMau: 'Chương trình có sẵn bay đúng ba ô: đúng ở sân thứ nhất. Dùng while với color("here").',
      san: [['.gbr', '...F'], ['.rgb', '.F..']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['go_right()', 'go_right()', 'go_right()', 'go_down()']),
      loiGiai: bai(C_TOI_DO),
      sao: { o: 3, nhip: 4 },
      loiSai: [
        { moTa: 'Bay cố định ba ô: sân thứ hai quá ô đỏ', baiLam: bai(['go_right()', 'go_right()', 'go_right()', 'go_down()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hỏi "right" thay vì "here": dừng sớm một ô', baiLam: bai(['m = color("right")', 'while m != "red":', '    go_right()', '    m = color("right")', 'go_down()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['color("here") đọc ô drone đang ở.', 'Hết vòng while thì drone đứng trên ô đỏ.']
    }),

    man({
      so: 3, ten: 'Đường mũi tên màu', hang: 'lam-quen', hamCuaEmCan: [],
      deBai: 'Mỗi ô trên đường là một mũi tên màu: ô xanh dương nghĩa là bay xuống, ô màu khác nghĩa là bay sang phải. Đọc ô dưới chân rồi bay theo, năm bước tới cờ. Hai sân.',
      veMaMau: 'Chương trình có sẵn bay đúng đường sân thứ nhất. Dùng camera để đọc mũi tên.',
      san: SAN_DUONG,
      batDau: { x: 0, y: 0 },
      maMau: bai(['go_right()', 'go_right()', 'go_down()', 'go_right()', 'go_down()']),
      loiGiai: bai(C_DUONG),
      sao: { o: 5, nhip: 5 },
      loiSai: [
        { moTa: 'Bay theo đường sân thứ nhất', baiLam: bai(['go_right()', 'go_right()', 'go_down()', 'go_right()', 'go_down()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đọc "down" thay vì "here": đọc ô phía dưới, lệch một bước', baiLam: bai(LAP(5, ['m = color("down")', 'if m == "blue":', '    go_down()', 'else:', '    go_right()'])), phaiCoMa: [] }
      ],
      goiY: ['Mỗi bước: đọc ô dưới chân TRƯỚC, rồi mới bay.', 'Ô xuất phát cũng là một mũi tên.']
    }),

    man({
      so: 4, ten: 'Đếm ô đỏ dưới đường bay', hang: 'luyen', bienDem: true, hamCuaEmCan: [],
      deBai: 'Bay bốn ô sang phải, đếm số ô ĐỎ ngay dưới đường bay. Đếm được bao nhiêu thì bay xuống bấy nhiêu ô tới cờ. Hai sân.',
      veMaMau: 'Chương trình có sẵn đã có n = 0, bay bốn ô và bay xuống n ô. Thêm phần đếm.',
      san: [['.rgrr', '####.', '####.', '####F'], ['.grbg', '####F', '####.', '####.']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['n = 0', 'for i in range(4):', '    go_right()', 'for i in range(n):', '    go_down()']),
      loiGiai: bai(C_DEM),
      sao: { o: 7, nhip: 7 },
      loiSai: [
        { moTa: 'Đọc trước khi bay: đếm lệch một ô', baiLam: bai(['n = 0', 'for i in range(4):', '    m = color("here")', '    if m == "red":', '        n = n + 1', '    go_right()', 'for i in range(n):', '    go_down()']), phaiCoMa: [] }
      ],
      goiY: ['Bay sang ô mới rồi mới đọc ô dưới chân.', 'n = n + 1 nằm trong if.']
    }),

    man({
      so: 5, ten: 'Ghi màu đường bay', hang: 'luyen', hamCuaEmCan: [],
      deBai: 'Ba ô đầu đường là mật lệnh: bay qua, ghi màu từng ô dưới chân vào danh sách a. Rồi đi theo mật lệnh: đỏ là bay xuống, màu khác là bay sang phải. Hai sân.',
      veMaMau: 'Chương trình có sẵn đã ghi mật lệnh. Viết phần đi theo: duyệt từng màu trong a.',
      san: [['.rgr..', '###..#', '####F#'], ['.grg..', '###..F', '######']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['a = []', 'for i in range(3):', '    go_right()', '    m = color("here")', '    a.append(m)']),
      loiGiai: bai(C_GHI),
      sao: { o: 9, nhip: 6 },
      loiSai: [
        { moTa: 'Đi ngược mật lệnh', baiLam: bai(['a = []', 'for i in range(3):', '    go_right()', '    m = color("here")', '    a.append(m)', 'for c in a:', '    if c == "red":', '        go_right()', '    else:', '        go_down()']), phaiCoMa: [] }
      ],
      goiY: ['a.append(color("here")) ghi màu ô dưới chân.', 'Mỗi màu trong a là đúng một bước bay.']
    }),

    man({
      so: 6, ten: 'Đọc dấu màu dưới bụng', hang: 'luyen', nam: true, hamCuaEmCan: [],
      deBai: 'Bay sang phải lên ô dấu màu, đọc màu bằng color("here"), chọn màu đó bằng ink(c), rồi nếu là màu đỏ thì bay lên chấm, màu khác thì bay xuống chấm. Hai sân, hai màu khác nhau.',
      veMaMau: 'Chương trình có sẵn luôn chấm màu đỏ ở ô phía trên. Thêm phần đọc màu, chọn màu và rẽ hướng.',
      san: [['..', '.r', '..'], ['..', '.b', '..']],
      hinh: [['.r', '..', '..'], ['..', '..', '.b']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['go_right()', 'go_up()', 'dot()', 'wait()']),
      loiGiai: bai(C_HOP),
      sao: { o: 9, nhip: 3 },
      loiSai: [
        { moTa: 'Không đọc màu: sân thứ hai chấm nhầm lên trên', baiLam: bai(['go_right()', 'go_up()', 'dot()', 'wait()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Đọc màu SAU khi đã rời ô dấu: đọc phải ô không màu', baiLam: bai(['go_right()', 'go_up()', 'c = color("here")', 'ink(c)', 'dot()', 'wait()']), phaiCoMa: ['mau-son-sai'] }
      ],
      goiY: ['Đọc màu khi drone đang đứng ngay trên ô dấu ở giữa.', 'Chọn màu bằng ink(c) rồi mới bay tới ô cần chấm.']
    }),

    man({
      so: 7, ten: 'Nhầm "down" với "here"', hang: 'bien-the', hamCuaEmCan: [],
      deBai: 'Chương trình có sẵn đọc mũi tên bằng color("down"): đó là ô phía dưới trên bản đồ, không phải ô dưới chân. Sửa để drone tới cờ ở cả hai sân.',
      veMaMau: 'Chạm chữ hướng trong color(…) để đổi "down" thành "here".',
      san: [['gb..', '.gb.', '..gF'], ['.b..', 'gggb', '...F']],
      batDau: { x: 0, y: 0 },
      maMau: bai(LAP(5, ['m = color("down")', 'if m == "blue":', '    go_down()', 'else:', '    go_right()'])),
      loiGiai: bai(C_DUONG),
      sao: { o: 5, nhip: 5 },
      loiSai: [
        { moTa: 'Không sửa', baiLam: bai(LAP(5, ['m = color("down")', 'if m == "blue":', '    go_down()', 'else:', '    go_right()'])), phaiCoMa: [] }
      ],
      goiY: ['"here" là ô drone đang ở.', 'Chỉ cần đổi một chữ.']
    }),

    man({
      so: 8, ten: 'Tìm ô đỏ rồi chấm', hang: 'bien-the', nam: true, hamCuaEmCan: [],
      deBai: 'Dưới đường bay là dãy ô màu, trong đó có một ô đỏ. Bay sang phải cho tới khi ô dưới chân là ô đỏ, rồi bay lên hai ô và chấm màu đỏ vào hình mờ. Hai sân, ô đỏ ở hai chỗ.',
      veMaMau: 'Chương trình có sẵn bay cố định hai ô. Dùng while với color("here").',
      san: [['....', '....', 'gbry'], ['....', '....', 'yrgb']],
      hinh: [['..r.', '....', '....'], ['.r..', '....', '....']],
      batDau: { x: 0, y: 2 },
      maMau: bai(['go_right()', 'go_right()', 'go_up()', 'go_up()', 'dot()', 'wait()']),
      loiGiai: bai(C_TIM_DO),
      sao: { o: 6, nhip: 5 },
      loiSai: [
        { moTa: 'Bay cố định hai ô: sân thứ hai chấm lệch ra ngoài hình', baiLam: bai(['go_right()', 'go_right()', 'go_up()', 'go_up()', 'dot()', 'wait()']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['while color("here") != "red": bay sang phải tới đúng ô đỏ.', 'Từ ô đỏ bay lên hai ô rồi dot() và wait().']
    }),

    man({
      so: 9, ten: 'Đếm ô vàng', hang: 'bien-the', bienDem: true, hamCuaEmCan: [],
      deBai: 'Bay qua dãy năm ô màu, đếm ô VÀNG dưới chân. Hết dãy, bay lên đúng bằng số ô vàng tới cờ. Hai sân.',
      veMaMau: 'Như màn Đếm ô đỏ, nhưng bay lên thay vì bay xuống.',
      san: [['.....F', '......', '.ygbyg'], ['......', '.....F', '.rybgb']],
      batDau: { x: 0, y: 2 },
      maMau: bai(['n = 0', 'for i in range(5):', '    go_right()', 'for i in range(n):', '    go_up()']),
      loiGiai: bai(['n = 0', 'for i in range(5):', '    go_right()', '    m = color("here")', '    if m == "yellow":', '        n = n + 1', 'for i in range(n):', '    go_up()']),
      sao: { o: 7, nhip: 7 },
      loiSai: [
        { moTa: 'Đếm ô đỏ thay vì vàng', baiLam: bai(['n = 0', 'for i in range(5):', '    go_right()', '    m = color("here")', '    if m == "red":', '        n = n + 1', 'for i in range(n):', '    go_up()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Camera "here" đọc màu ô dưới drone.', 'Bay lên n ô.']
    }),

    man({
      so: 10, ten: 'Chấm đúng cột theo đơn', hang: 'trum', nam: true, hamCuaEmCan: [], khung: { chinh: 12, moiHam: 10 },
      deBai: 'Ô đầu đường cho biết đơn hàng: màu của ô đó là màu cần tìm và chấm. Đọc đơn hàng vào c, rời ô đơn, bay dọc dãy màu tới ô cùng màu c, chọn màu c rồi bay lên hai ô chấm vào hình mờ. Hai sân, đơn và dãy màu khác nhau.',
      veMaMau: 'Chương trình có sẵn đọc đơn hàng vào biến c. Viết phần tìm ô cùng màu, chọn màu và bay lên chấm.',
      san: [['......', '......', 'yrgyb.'], ['......', '......', 'ggbry.']],
      hinh: [['...y..', '......', '......'], ['.g....', '......', '......']],
      batDau: { x: 0, y: 2 },
      maMau: bai(['c = color("here")']),
      loiGiai: bai(['c = color("here")', 'go_right()', 'm = color("here")', 'while m != c:', '    go_right()', '    m = color("here")', 'ink(c)', 'go_up()', 'go_up()', 'dot()', 'wait()']),
      sao: { o: 9, nhip: 6 },
      loiSai: [
        { moTa: 'Tìm ô đỏ cố định: lệch cột', baiLam: bai(['c = color("here")', 'go_right()', 'm = color("here")', 'while m != "red":', '    go_right()', '    m = color("here")', 'ink(c)', 'go_up()', 'go_up()', 'dot()', 'wait()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Quên rời ô đơn hàng trước khi tìm: vòng while không chạy', baiLam: bai(['c = color("here")', 'm = color("here")', 'while m != c:', '    go_right()', '    m = color("here")', 'ink(c)', 'go_up()', 'go_up()', 'dot()', 'wait()']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Ô đơn hàng cũng có màu c: rời nó một ô rồi mới tìm.', 'while color("here") != c: bay tới ô cùng màu đơn, rồi ink(c) và bay lên chấm.']
    }),

    /* ================================================= chương che-nhin-duoi "Chế lệnh: đọc đơn hàng" ================================================= */
    manChe({
      so: 1, ten: 'Hàm tìm ô màu', hang: 'lam-quen', taoHam: ['seek_here'], hamCuaEmCan: [],
      deBai: 'Chế seek_here(col): bay sang phải cho tới khi ô dưới chân có màu col. Chương trình chính đã khóa: seek_here("red") rồi hạ xuống cờ. Hai sân.',
      veMaMau: 'Mở Xưởng hàm, tạo seek_here với một đối số col. So color("here") với col.',
      san: [['.gbr', '...F'], ['.rgb', '.F..']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['seek_here("red")', 'go_down()']),
      loiGiai: bai(['seek_here("red")', 'go_down()'], { hamCuaEmMoi: [H('seek_here', ['col'], T_SEEK)] }),
      sao: { o: 4, nhip: 4 },
      congThucKhac: [{ moTa: 'Viết bằng not và ==', hamCuaEmMoi: [H('seek_here', ['col'], ['m = color("here")', 't = m == col', 'while not t:', '    go_right()', '    m = color("here")', '    t = m == col'])] }],
      loiSai: [
        { moTa: 'Gọi seek_here mà chưa chế hàm', baiLam: bai(['seek_here("red")', 'go_down()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đọc "right": dừng sớm một ô', baiLam: bai(['seek_here("red")', 'go_down()']), hamCuaEmMoi: [H('seek_here', ['col'], ['m = color("right")', 'while m != col:', '    go_right()', '    m = color("right")'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Còn bay khi màu dưới chân KHÁC col.', 'Chương trình chính đưa "red" vào col.']
    }),

    manChe({
      so: 2, ten: 'Hàm ghi màu dưới chân', hang: 'lam-quen', taoHam: ['read_below'], hamCuaEmCan: [],
      deBai: 'Chế read_below(a, n): bay sang phải n ô, mỗi ô ghi màu dưới chân vào cuối a. Chương trình chính đã khóa: ghi mật lệnh ba ô rồi đi theo (đỏ xuống, màu khác sang phải).',
      veMaMau: 'Tạo read_below với hai đối số a và n.',
      san: [['.rgr..', '###..#', '####F#'], ['.grg..', '###..F', '######']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_GHI_HAM),
      loiGiai: bai(C_GHI_HAM, { hamCuaEmMoi: [H('read_below', ['a', 'n'], T_GHI_DUOI)] }),
      sao: { o: 10, nhip: 6 },
      congThucKhac: [{ moTa: 'Ghi màu vào biến trước', hamCuaEmMoi: [H('read_below', ['a', 'n'], ['for i in range(n):', '    go_right()', '    c = color("here")', '    a.append(c)'])] }],
      loiSai: [
        { moTa: 'Gọi read_below mà chưa chế hàm', baiLam: bai(C_GHI_HAM), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Ghi trước khi bay: lệch một ô', baiLam: bai(C_GHI_HAM), hamCuaEmMoi: [H('read_below', ['a', 'n'], ['for i in range(n):', '    m = color("here")', '    a.append(m)', '    go_right()'])], phaiCoMa: [] }
      ],
      goiY: ['Bay sang ô mới rồi mới đọc.', 'a.append(…) thêm vào cuối a.']
    }),

    manChe({
      so: 3, ten: 'Hàm đọc mũi tên', hang: 'lam-quen', taoHam: ['arrow_step'], hamCuaEmCan: [],
      deBai: 'Chế arrow_step(): đọc ô dưới chân, xanh dương thì bay xuống, màu khác thì bay sang phải. Chương trình chính đã khóa: lặp arrow_step() năm lần.',
      veMaMau: 'Tạo arrow_step() không có đối số. Thân hàm là một if / else.',
      san: SAN_DUONG,
      batDau: { x: 0, y: 0 },
      maMau: bai(LAP(5, 'arrow_step()')),
      loiGiai: bai(LAP(5, 'arrow_step()'), { hamCuaEmMoi: [H('arrow_step', [], T_MUI_TEN)] }),
      sao: { o: 6, nhip: 5 },
      congThucKhac: [{ moTa: 'Hỏi khác xanh dương trước', hamCuaEmMoi: [H('arrow_step', [], ['m = color("here")', 'if m != "blue":', '    go_right()', 'else:', '    go_down()'])] }],
      loiSai: [
        { moTa: 'Gọi arrow_step() mà chưa chế hàm', baiLam: bai(LAP(5, 'arrow_step()')), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Luôn bay sang phải', baiLam: bai(LAP(5, 'arrow_step()')), hamCuaEmMoi: [H('arrow_step', [], ['go_right()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Mỗi lần gọi là một bước bay.', 'Đọc ô dưới chân trước khi bay.']
    }),

    manChe({
      so: 4, ten: 'Hàm đếm theo màu', hang: 'luyen', taoHam: ['count_here'], hamCuaEmCan: [],
      deBai: 'Chế count_here(a, n, col): bay sang phải n ô, ô dưới chân có màu col thì ghi màu đó vào a. Chương trình chính đã khóa: đếm ô đỏ trên bốn ô rồi bay xuống len(a) ô.',
      veMaMau: 'Tạo count_here với ba đối số a, n và col.',
      san: [['.rgrr', '####.', '####.', '####F'], ['.grbg', '####F', '####.', '####.']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_DEM_HAM),
      loiGiai: bai(C_DEM_HAM, { hamCuaEmMoi: [H('count_here', ['a', 'n', 'col'], T_DEM_MAU)] }),
      sao: { o: 8, nhip: 7 },
      congThucKhac: [{ moTa: 'Thêm số 1 thay cho màu: len(a) vẫn đúng', hamCuaEmMoi: [H('count_here', ['a', 'n', 'col'], ['for i in range(n):', '    go_right()', '    m = color("here")', '    if m == col:', '        a.append(1)'])] }],
      loiSai: [
        { moTa: 'Gọi count_here mà chưa chế hàm', baiLam: bai(C_DEM_HAM), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên bay: đọc mãi một ô', baiLam: bai(C_DEM_HAM), hamCuaEmMoi: [H('count_here', ['a', 'n', 'col'], ['for i in range(n):', '    m = color("here")', '    if m == col:', '        a.append(col)'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Ba đối số: danh sách, số ô, màu cần đếm.', 'len(a) là số ô đếm được.']
    }),

    manChe({
      so: 5, ten: 'Hàm bay lên chấm', hang: 'luyen', nam: true, taoHam: ['deliver_up'], hamCuaEmCan: ['seek_here'],
      deBai: 'Chế deliver_up(n): bay lên n ô rồi chấm vào hình mờ. Chương trình chính đã khóa: seek_here("red") tới ô đỏ rồi deliver_up(2). Hai sân.',
      veMaMau: 'Tạo deliver_up với một đối số n.',
      san: [['....', '....', 'gbry'], ['....', '....', 'yrgb']],
      hinh: [['..r.', '....', '....'], ['.r..', '....', '....']],
      batDau: { x: 0, y: 2 },
      maMau: bai(['seek_here("red")', 'deliver_up(2)']),
      loiGiai: bai(['seek_here("red")', 'deliver_up(2)'], { hamCuaEmMoi: [H('deliver_up', ['n'], T_NANG)] }),
      sao: { o: 8, nhip: 5 },
      congThucKhac: [{ moTa: 'Bay lên bằng while đếm ngược', hamCuaEmMoi: [H('deliver_up', ['n'], ['while n > 0:', '    go_up()', '    n = n - 1', 'dot()', 'wait()'])] }],
      loiSai: [
        { moTa: 'Gọi deliver_up mà chưa chế hàm', baiLam: bai(['seek_here("red")', 'deliver_up(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên chấm ở cuối hàm', baiLam: bai(['seek_here("red")', 'deliver_up(2)']), hamCuaEmMoi: [H('deliver_up', ['n'], ['for i in range(n):', '    go_up()'])], phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Lặp n lần go_up() để bay tới ô cần chấm.', 'Cuối hàm gọi dot() rồi wait().']
    }),

    manChe({
      so: 6, ten: 'Hàm chấm theo dấu màu', hang: 'luyen', nam: true, taoHam: ['lift_by_color'], hamCuaEmCan: [],
      deBai: 'Chế lift_by_color(): đọc màu ô dấu dưới chân, chọn màu đó, nếu là đỏ thì bay lên một ô, màu khác thì bay xuống một ô, rồi chấm. Chương trình chính đã khóa.',
      veMaMau: 'Tạo lift_by_color() không có đối số. Đọc màu TRƯỚC khi bay.',
      san: [['..', '.r', '..'], ['..', '.b', '..']],
      hinh: [['.r', '..', '..'], ['..', '..', '.b']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['go_right()', 'lift_by_color()']),
      loiGiai: bai(['go_right()', 'lift_by_color()'], { hamCuaEmMoi: [H('lift_by_color', [], C_HOP.slice(1))] }),
      sao: { o: 10, nhip: 3 },
      congThucKhac: [{ moTa: 'Hỏi khác đỏ trước', hamCuaEmMoi: [H('lift_by_color', [], ['c = color("here")', 'ink(c)', 'if c != "red":', '    go_down()', 'else:', '    go_up()', 'dot()', 'wait()'])] }],
      loiSai: [
        { moTa: 'Gọi lift_by_color() mà chưa chế hàm', baiLam: bai(['go_right()', 'lift_by_color()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đọc màu sau khi đã bay khỏi ô dấu', baiLam: bai(['go_right()', 'lift_by_color()']), hamCuaEmMoi: [H('lift_by_color', [], ['go_up()', 'c = color("here")', 'ink(c)', 'dot()', 'wait()'])], phaiCoMa: ['mau-son-sai'] }
      ],
      goiY: ['c = color("here") đứng đầu hàm, tiếp theo là ink(c).', 'Bay lên hay xuống tùy màu c rồi dot() và wait().']
    }),

    manChe({
      so: 7, ten: 'Sửa hàm tìm màu', hang: 'bien-the', hamCuaEmCan: [],
      deBai: 'Hàm của màn find_col(col) hỏi color("down") nên dừng sai chỗ. Sửa để nó hỏi ô dưới chân; chương trình chính đã khóa: find_col("yellow") rồi hạ xuống cờ.',
      veMaMau: 'Chạm chữ hướng trong find_col để đổi "down" thành "here".',
      san: [['.gbyr', '...F.', '.....'], ['.ybgr', '.F...', '.....']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['find_col("yellow")', 'go_down()'], { hamCuaMan: [H('find_col', ['col'], ['m = color("down")', 'while m != col:', '    go_right()', '    m = color("down")'])] }),
      loiGiai: bai(['find_col("yellow")', 'go_down()'], { hamCuaMan: [H('find_col', ['col'], T_SEEK)] }),
      sao: { o: 4, nhip: 4 },
      loiSai: [
        { moTa: 'Không sửa', baiLam: bai(['find_col("yellow")', 'go_down()'], { hamCuaMan: [H('find_col', ['col'], ['m = color("down")', 'while m != col:', '    go_right()', '    m = color("down")'])] }), phaiCoMa: [] }
      ],
      goiY: ['"down" là ô phía dưới trên bản đồ; "here" là ô drone đang ở.', 'Chỉ đổi một chữ.']
    }),

    manChe({
      so: 8, ten: 'Đơn hàng bằng hàm', hang: 'bien-the', nam: true, chinhCoDinh: false, hamCuaEmCan: ['seek_here', 'deliver_up'],
      deBai: 'Như màn Chấm đúng cột theo đơn, giờ dùng hàm em đã chế. Tự viết chương trình chính: đọc đơn hàng ở ô đầu vào c, rời ô đơn, seek_here(c) tới ô cùng màu, chọn màu c rồi deliver_up(2).',
      veMaMau: 'Chương trình có sẵn đọc đơn hàng vào c. Viết tiếp bằng seek_here, ink và deliver_up.',
      san: [['......', '......', 'yrgyb.'], ['......', '......', 'ggbry.']],
      hinh: [['...y..', '......', '......'], ['.g....', '......', '......']],
      batDau: { x: 0, y: 2 },
      maMau: bai(['c = color("here")']),
      loiGiai: bai(['c = color("here")', 'go_right()', 'seek_here(c)', 'ink(c)', 'deliver_up(2)']),
      sao: { o: 11, nhip: 6 },
      loiSai: [
        { moTa: 'Quên rời ô đơn hàng: seek_here không bay', baiLam: bai(['c = color("here")', 'seek_here(c)', 'ink(c)', 'deliver_up(2)']), phaiCoMa: ['to-thua'] },
        { moTa: 'Tìm ô đỏ cố định', baiLam: bai(['c = color("here")', 'go_right()', 'seek_here("red")', 'ink(c)', 'deliver_up(2)']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['seek_here(c): tìm ô cùng màu đơn hàng.', 'Chọn màu bằng ink(c) trước khi gọi deliver_up(2).']
    }),

    manChe({
      so: 9, ten: 'Sửa hàm bay lên chấm', hang: 'bien-the', nam: true, hamCuaEmCan: ['seek_here'],
      deBai: 'Hàm của màn lift_n(n) phải bay LÊN n ô rồi chấm nhưng lại bay xuống. Sửa lift_n; chương trình chính đã khóa: seek_here("blue") rồi lift_n(2).',
      veMaMau: 'Chạy thử: drone bay xuống đâm tường. Đổi lệnh bay trong vòng lặp.',
      san: [['....', '....', 'rbgy'], ['....', '....', 'gyrb']],
      hinh: [['.r..', '....', '....'], ['...r', '....', '....']],
      batDau: { x: 0, y: 2 },
      maMau: bai(['seek_here("blue")', 'lift_n(2)'], { hamCuaMan: [H('lift_n', ['n'], ['for i in range(n):', '    go_down()', 'dot()', 'wait()'])] }),
      loiGiai: bai(['seek_here("blue")', 'lift_n(2)'], { hamCuaMan: [H('lift_n', ['n'], T_NANG)] }),
      sao: { o: 8, nhip: 6 },
      loiSai: [
        { moTa: 'Không sửa: bay xuống', baiLam: bai(['seek_here("blue")', 'lift_n(2)'], { hamCuaMan: [H('lift_n', ['n'], ['for i in range(n):', '    go_down()', 'dot()', 'wait()'])] }), phaiCoMa: [] }
      ],
      goiY: ['Hình mờ nằm phía trên dãy màu.', 'go_up() thay cho go_down().']
    }),

    manChe({
      so: 10, ten: 'Đếm rồi chấm', hang: 'trum', nam: true, chinhCoDinh: false, hamCuaEmCan: ['count_here', 'deliver_up'],
      deBai: 'Bay qua bốn ô, đếm ô vàng dưới chân. Hết bốn ô, bay lên đúng bằng số ô vàng đếm được rồi chấm vào hình mờ. Tự viết chương trình chính bằng hàm em đã chế. Hai sân.',
      veMaMau: 'Chương trình có sẵn mới tạo danh sách a. Viết tiếp bằng count_here và deliver_up.',
      san: [['.....', '.....', '.....', '.ygyb'], ['.....', '.....', '.....', '.rrgy']],
      hinh: [['.....', '....r', '.....', '.....'], ['.....', '.....', '....r', '.....']],
      batDau: { x: 0, y: 3 },
      maMau: bai(['a = []']),
      loiGiai: bai(['a = []', 'count_here(a, 4, "yellow")', 'deliver_up(len(a))']),
      sao: { o: 11, nhip: 7 },
      loiSai: [
        { moTa: 'Bay lên cố định hai ô', baiLam: bai(['a = []', 'count_here(a, 4, "yellow")', 'deliver_up(2)']), phaiCoMa: ['to-thua'] },
        { moTa: 'Đếm ô đỏ thay vì ô vàng', baiLam: bai(['a = []', 'count_here(a, 4, "red")', 'deliver_up(len(a))']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['count_here(a, 4, "yellow") bay bốn ô và đếm.', 'deliver_up(len(a)) bay lên đúng bằng số ô vàng đếm được rồi chấm.']
    })
  ];

  ManHoc.manNhinDuoiChan = DS;
  if (laNode) module.exports = ManHoc;
})();

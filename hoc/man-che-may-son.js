/* ============================================================================
   man-che-may-son.js — "Robot Chấn Hưng": CHƯƠNG `che-may-son` · CHẾ LỆNH MÁY SƠN (10 màn, 25/10). Chương chế lệnh của bộ phận máy sơn (sau chương `may-son`, hoc/KE-HOACH-MAY-SON.md).
   Robot như chương may-son: XE HAI BÁNH GẮN ĐẦU SƠN, robot { than: 'hai-banh', tay: 'son', camBien: [] }. Mục tiêu 'to-hinh' (tô đúng hình mờ). Chương trình chính khóa (`chinhCoDinh`, bản mẫu
   `maMau.chinh`), người chơi chế hàm; 10 tự viết chương trình chính (gioiHanHam 3). Mỗi lệnh chế có ít nhất một cách khác cũng thắng: `congThucKhac` (kiem-che-may-son.mjs chạy từng cách).
   Ý Python: hàm có tham số mang MÀU (color_line(c, n)), hàm nhận DANH SÁCH MÀU (stripes(colors)), for LỒNG for (grid(r, k)), GHI màu vào danh sách (copy_row), if theo màu đọc được.
   Màn 6, 9, 10 xe gắn THÊM camera bốn hướng của mùa 4 gói 3 (robot XE_CAM, khay có color(huong)): camera đọc cả ô đã sơn (san-hoc.js, CAMERA BỐN HƯỚNG);
   30/10 (nghiệm thu độc lập): trước đó ba màn này dùng cảm biến màu dưới bụng (color() không đối số), part chưa dạy ở mùa 4 và trái quy ước gói 3 (color() để trống là lỗi).
   man.sonBanDau là lớp ô sơn sẵn (vẽ trên sân từ lúc vào màn).

   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-may-son.1 line(n)            = pen_down(), forward(n), pen_up(), wait()              nét n + 1 ô theo hướng xe, nhấc đầu sơn ở cuối
     che-may-son.2 color_line(c, n)   = ink(c), line(n)                                       nét màu c
     che-may-son.3 next_row(n)        = for i in range(n): back(); turn_right(), move(), turn_left()   lùi n ô về đầu hàng rồi xuống hàng dưới, hướng cũ
     che-may-son.5 stripes(colors)    = for c in colors: color_line(c, 3), next_row(3)        mỗi màu một sọc bốn ô, sọc nọ dưới sọc kia
     che-may-son.6 copy_row(n)        = seen = []; đọc n ô bằng seen.append(color("left")); next_row(n); for c in seen: ink(c), dot(), move()   đi hàng giữa, chép hàng trên xuống hàng dưới
     che-may-son.9 fill_gaps(c, n)    = ink(c); for i in range(n): if color("front") == "none": move(), dot() else: move()     lấp ô chưa sơn bằng màu c, giữ ô đã sơn
     che-may-son.7 grid(r, k)         = for i in range(r): dots(k); for j in range(2 * k): back(); turn_right(), move(), move(), turn_left()   lưới chấm r hàng × k cột
     che-may-son.8 border(n)          = for i in range(4): forward(n), turn_right()            khung vuông cạnh n + 1 ô, về chỗ cũ
   HÀM CỦA MÀN (không vào kho): che-may-son.4 stair_step() (thân ban đầu rẽ ngược), 10 (trùm, 3 sân, gioiHanHam 3): ba bức tranh: chép viền hoa văn bằng copy_row, rồi ba sọc
   có hoa văn sơn sẵn ở chỗ khác nhau: copy_row(4); next_row(5); for c in […]: fill_gaps(c, 4); next_row(4).
   Sao: sao.nhip = nhịp lời giải chạy thật (nhipTheoLoiGiai; do-duong-may-son.mjs dò BFS khi hình nhỏ); sao.o = ô của lời giải.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'ink', 'dot', 'pen_down', 'pen_up'];

  function H(ten, than, thamSo) { return { ten: ten, thamSo: (thamSo || []).slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  var T_LINE = ['pen_down()', 'forward(n)', 'pen_up()', 'wait()'];
  var T_COLOR_LINE = ['ink(c)', 'line(n)'];
  var T_NEXT_ROW = ['for i in range(n):', '    back()', 'turn_right()', 'move()', 'turn_left()'];
  var T_STRIPES = ['for c in colors:', '    color_line(c, 3)', '    next_row(3)'];
  var T_COPY_ROW = ['seen = []', 'for i in range(n):', '    seen.append(color("left"))', '    move()', 'next_row(n)', 'for c in seen:', '    ink(c)', '    dot()', '    move()'];
  var T_FILL_GAPS = ['ink(c)', 'for i in range(n):', '    if color("front") == "none":', '        move()', '        dot()', '    else:', '        move()'];
  var T_GRID = ['for i in range(r):', '    dots(k)', '    for j in range(2 * k):', '        back()', '    turn_right()', '    move()', '    move()', '    turn_left()'];
  var T_BORDER = ['for i in range(4):', '    forward(n)', '    turn_right()'];
  var STEP_SAI = ['move()', 'turn_left()', 'move()', 'turn_right()'];
  var STEP_DUNG = ['move()', 'turn_right()', 'move()', 'turn_left()'];

  var C_1 = ['line(3)'];
  var C_2 = ['color_line("red", 2)', 'move()', 'color_line("blue", 2)'];
  var C_3 = ['color_line("red", 3)', 'next_row(3)', 'color_line("blue", 3)'];
  var C_4 = ['pen_down()', 'for i in range(3):', '    stair_step()'];
  var C_5 = ['stripes(["red", "yellow", "blue"])'];
  var C_6 = ['move()', 'copy_row(4)'];
  var C_7 = ['ink("green")', 'grid(3, 3)'];
  var C_8 = ['ink("blue")', 'pen_down()', 'border(6)', 'pen_up()', 'step(2, 2)', 'ink("red")', 'pen_down()', 'border(2)'];
  var C_9 = ['fill_gaps("green", 5)'];
  var L_10 = ['copy_row(4)', 'next_row(5)', 'for c in ["red", "yellow", "blue"]:', '    fill_gaps(c, 4)', '    next_row(4)'];
  var S10 = ['......', '......', '......', '......', '......', '......', '......'];
  // 6, 9, 10: xe gắn THÊM camera bốn hướng (mùa 4 gói 3): color("front" / "left" / "right" / "back") đọc cả màu sơn
  var XE_CAM = { than: 'hai-banh', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren' }] };
  var KHAY_CAM = KHAY.concat(['color']);

  function man(m) {
    m.chuong = 'che-may-son';
    m.loaiRobot = 'banh';
    m.robot = m.robot || { than: 'hai-banh', tay: 'son', camBien: [] };
    m.hamGoc = m.hamGoc || KHAY;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.mucTieu = 'to-hinh';
    m.nhipTheoLoiGiai = true;
    if (m.so < 10) m.chinhCoDinh = true;
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Một nét', hang: 'lam-quen', hamCuaEmCan: ['move', 'forward'], taoHam: ['line'],
      deBai: 'Chương trình chính chỉ gọi line(3). Chế line(n): hạ đầu sơn, đi n bước, rồi nhấc đầu sơn. Hình mờ là nét đỏ bốn ô.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo line với đối số n rồi bấm Chạy.',
      san: ['......', '......', '......'],
      hinh: ['......', '.rrrr.', '......'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: C_1.slice() },
      sao: { o: 10, nhip: 3 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [H('line', T_LINE, ['n'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('line', nhieu(['# hạ, đi, nhấc'], T_LINE), ['n'])] },
      congThucKhac: [
        { moTa: 'Đi bằng vòng for gọi move()', hamCuaEmMoi: [H('line', ['pen_down()', 'for i in range(n):', '    move()', 'pen_up()', 'wait()'], ['n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi line(3) mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đi thiếu một bước: nét ba ô', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('line', ['pen_down()', 'forward(n - 1)', 'pen_up()', 'wait()'], ['n'])], phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Chấm thay vì hạ đầu sơn: chỉ một chấm', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('line', ['dot()', 'forward(n)', 'pen_up()', 'wait()'], ['n'])], phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['line(n) tô n + 1 ô: ô xuất phát và n ô đi tới.', 'Nhấc đầu sơn ở cuối để lần đi sau không vẽ bậy.']
    }),

    man({
      so: 2, ten: 'Nét có màu', hang: 'lam-quen', hamCuaEmCan: ['move', 'forward', 'line'], taoHam: ['color_line'],
      deBai: 'Chế color_line(c, n): chọn màu c rồi vẽ nét bằng line(n). Chương trình chính vẽ một nét đỏ, đi một bước, rồi vẽ một nét xanh dương.',
      veMaMau: 'Tạo color_line với hai đối số c và n. Dùng ink(c) và line(n) của em.',
      san: ['.......', '.......', '.......'],
      hinh: ['.......', 'rrrbbb.', '.......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: C_2.slice() },
      sao: { o: 14, nhip: 6 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('color_line', T_COLOR_LINE, ['c', 'n'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('color_line', nhieu(['# chọn màu rồi vẽ'], T_COLOR_LINE), ['c', 'n'])] },
      congThucKhac: [
        { moTa: 'Viết thẳng các lệnh của line(n) vào hàm', hamCuaEmMoi: [H('color_line', ['ink(c)', 'pen_down()', 'forward(n)', 'pen_up()', 'wait()'], ['c', 'n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi color_line mà chưa chế hàm', baiLam: { chinh: C_2.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chọn màu sau khi vẽ: nét nào cũng mang màu cũ', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('color_line', ['line(n)', 'ink(c)'], ['c', 'n'])], phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Quên chọn màu: cả hai nét đỏ', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('color_line', ['line(n)'], ['c', 'n'])], phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Đối số c là tên màu: đưa nó vào ink(c).', 'Màu phải chọn TRƯỚC khi hạ đầu sơn.']
    }),

    man({
      so: 3, ten: 'Xuống hàng', hang: 'lam-quen', hamCuaEmCan: ['move', 'back', 'turn_right', 'turn_left', 'color_line'], taoHam: ['next_row'],
      deBai: 'Vẽ xong nét đỏ, xe đứng ở cuối hàng. Chế next_row(n): lùi n ô về đầu hàng, rồi xuống hàng dưới, vẫn quay mặt như cũ. Nét xanh dương sẽ nằm ngay dưới nét đỏ.',
      veMaMau: 'Chương trình chính: nét đỏ, next_row(3), nét xanh dương. Đầu sơn đã nhấc nên lùi không vẽ.',
      san: ['......', '......', '......', '......'],
      hinh: ['......', '.rrrr.', '.bbbb.', '......'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: C_3.slice() },
      sao: { o: 26, nhip: 13 },
      loiGiai: { chinh: C_3.slice(), hamCuaEmMoi: [H('next_row', T_NEXT_ROW, ['n'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_3.slice() }, hamCuaEmMoi: [H('next_row', nhieu(['# về đầu hàng, xuống một hàng'], T_NEXT_ROW), ['n'])] },
      congThucKhac: [
        { moTa: 'Xuống hàng trước rồi mới lùi về đầu hàng', hamCuaEmMoi: [H('next_row', ['turn_right()', 'move()', 'turn_left()', 'for i in range(n):', '    back()'], ['n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi next_row mà chưa chế hàm', baiLam: { chinh: C_3.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên lùi về đầu hàng: nét xanh vẽ ra ngoài hình', baiLam: { chinh: C_3.slice() }, hamCuaEmMoi: [H('next_row', ['turn_right()', 'move()', 'turn_left()'], ['n'])], phaiCoMa: ['to-thua'] },
        { moTa: 'Rẽ trái trước: xe lên hàng trên, tô ra ngoài hình', baiLam: { chinh: C_3.slice() }, hamCuaEmMoi: [H('next_row', ['for i in range(n):', '    back()', 'turn_left()', 'move()', 'turn_right()'], ['n'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['back() lùi một ô mà không quay xe.', 'Xuống hàng: rẽ phải, đi một bước, rẽ trái để quay mặt như cũ.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Đố: bậc thang ngược', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Hình mờ là bậc thang đi xuống bên phải. Hàm của màn stair_step() vẽ một bậc nhưng đang rẽ ngược. Sửa stair_step() để vẽ đúng bậc thang.',
      veMaMau: 'Chạy thử: xe rẽ lên trên thay vì xuống dưới. Đầu sơn hạ suốt nên ô góc nào cũng được tô.',
      san: ['.....', '.....', '.....', '.....', '.....'],
      hinh: ['rr...', '.rr..', '..rr.', '...r.', '.....'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: C_4.slice(), hamCuaMan: [H('stair_step', STEP_SAI)] },
      sao: { o: 14, nhip: 11 },
      loiGiai: { chinh: C_4.slice(), hamCuaMan: [H('stair_step', STEP_DUNG)] },
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_4.slice(), hamCuaMan: [H('stair_step', nhieu(['# sang phải, xuống dưới'], STEP_DUNG))] } },
      congThucKhac: [
        { moTa: 'Rẽ bằng lệnh bánh viết thẳng', baiLam: { chinh: C_4.slice(), hamCuaMan: [H('stair_step', ['move()', 'left_move()', 'wait()', 'move()', 'left_back()', 'wait()'])] } }
      ],
      loiSai: [
        { moTa: 'Không sửa gì: bậc thang đi lên, ra ngoài hình', baiLam: { chinh: C_4.slice(), hamCuaMan: [H('stair_step', STEP_SAI)] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Quên rẽ lại: xe đi thẳng xuống', baiLam: { chinh: C_4.slice(), hamCuaMan: [H('stair_step', ['move()', 'turn_right()', 'move()'])] }, phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Mỗi bậc: sang phải một ô, rẽ xuống, đi một ô, rồi quay mặt sang phải lại.', 'Xe quay mặt sang phải thì rẽ phải là quay xuống dưới.']
    }),

    man({
      so: 5, ten: 'Ba sọc màu', hang: 'luyen', hamCuaEmCan: ['color_line', 'next_row'], taoHam: ['stripes'],
      deBai: 'Chế stripes(colors): mỗi màu trong danh sách vẽ một sọc bốn ô, sọc sau nằm ngay dưới sọc trước. Chương trình chính gọi stripes với ba màu đỏ, vàng, xanh dương.',
      veMaMau: 'Tạo stripes với đối số colors. Lặp qua danh sách: color_line(c, 3) rồi next_row(3).',
      san: ['......', '......', '......', '......', '......'],
      hinh: ['......', '.rrrr.', '.yyyy.', '.bbbb.', '......'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: C_5.slice() },
      sao: { o: 27, nhip: 23 },
      khongDoBFS: true,                                                                   // 12 ô hình, BFS chạy lâu: sao.nhip theo lời giải
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [H('stripes', T_STRIPES, ['colors'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('stripes', nhieu(['# mỗi màu một sọc'], T_STRIPES), ['colors'])] },
      congThucKhac: [
        { moTa: 'Lặp theo chỉ số: colors[i]', hamCuaEmMoi: [H('stripes', ['for i in range(len(colors)):', '    color_line(colors[i], 3)', '    next_row(3)'], ['colors'])] }
      ],
      loiSai: [
        { moTa: 'Gọi stripes mà chưa chế hàm', baiLam: { chinh: C_5.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên xuống hàng: các sọc vẽ đè lên nhau', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('stripes', ['for c in colors:', '    color_line(c, 3)'], ['colors'])], phaiCoMa: ['to-thua'] },
        { moTa: 'Vẽ màu đỏ cho mọi sọc', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('stripes', ['for c in colors:', '    color_line("red", 3)', '    next_row(3)'], ['colors'])], phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['for c in colors: c lần lượt là từng màu trong danh sách.', 'Sọc cuối vẽ xong là thắng ngay.']
    }),

    man({
      so: 6, ten: 'Chép màu', hang: 'luyen', hamCuaEmCan: ['move', 'back', 'turn_right', 'turn_left', 'next_row'], taoHam: ['copy_row'],
      robot: XE_CAM, hamGoc: KHAY_CAM,
      deBai: 'Hàng trên đã sơn sẵn bốn màu, xe đứng ở hàng giữa, tiến một bước là ngang ô đầu. Chế copy_row(n): đi dọc hàng giữa, ghi màu ô bên trái từng bước vào danh sách, ' +
        'rồi xuống hàng dưới chép lại đúng các màu đó. Hai sân, hai hàng màu khác nhau: ghi cứng bốn màu thì hỏng một sân.',
      veMaMau: 'Xe chạy sang phải thì ô bên trái xe là ô hàng trên. seen.append(color("left")) ghi màu ô đó vào danh sách seen.',
      san: [['......', '......', '......', '......'], ['......', '......', '......', '......']],
      sonBanDau: [['.rybr.', '......', '......', '......'], ['.bgyb.', '......', '......', '......']],
      hinh: [['.rybr.', '......', '.rybr.', '......'], ['.bgyb.', '......', '.bgyb.', '......']],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: C_6.slice() },
      sao: { o: 26, nhip: 16 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [H('copy_row', T_COPY_ROW, ['n'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('copy_row', nhieu(['# đọc hàng trên, chép xuống hàng dưới'], T_COPY_ROW), ['n'])] },
      congThucKhac: [
        { moTa: 'Chép theo chỉ số: seen[i]', hamCuaEmMoi: [H('copy_row', ['seen = []', 'for i in range(n):', '    seen.append(color("left"))', '    move()', 'next_row(n)', 'for i in range(n):', '    ink(seen[i])', '    dot()', '    move()'], ['n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi copy_row mà chưa chế hàm', baiLam: { chinh: C_6.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đi rồi mới đọc màu: lệch một ô, đọc phải ô không màu', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('copy_row', ['seen = []', 'for i in range(n):', '    move()', '    seen.append(color("left"))', 'next_row(n)', 'for c in seen:', '    ink(c)', '    dot()', '    move()'], ['n'])], phaiCoMa: ['mau-son-sai'] },
        { moTa: 'Ghi cứng bốn màu của sân 1: sân 2 màu khác', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('copy_row', ['for i in range(n):', '    move()', 'next_row(n)', 'for c in ["red", "yellow", "blue", "red"]:', '    ink(c)', '    dot()', '    move()'], ['n'])], phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Quên xuống hàng: chép đè lên hàng giữa', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('copy_row', ['seen = []', 'for i in range(n):', '    seen.append(color("left"))', '    move()', 'for c in seen:', '    ink(c)', '    dot()', '    move()'], ['n'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Đọc màu TRƯỚC khi đi: color("left") đọc ô hàng trên ngang chỗ xe đứng.', 'Xuống hàng bằng next_row(n) rồi lặp qua seen: chọn màu, chấm, đi.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Lưới chấm', hang: 'bien-the', hamCuaEmCan: ['move', 'back', 'turn_right', 'turn_left', 'dots'], taoHam: ['grid'],
      deBai: 'Hình mờ là lưới chín chấm xanh lá: ba hàng, mỗi hàng ba chấm, hàng cách hàng một ô. Chế grid(r, k): r hàng, mỗi hàng dots(k), xong hàng thì lùi về đầu hàng và xuống hai ô.',
      veMaMau: 'Một vòng for cho các hàng, trong đó một vòng for lùi về đầu hàng: for lồng for.',
      san: ['.......', '.......', '.......', '.......', '.......', '.......', '.......'],
      hinh: ['.......', 'g.g.g..', '.......', 'g.g.g..', '.......', 'g.g.g..', '.......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: C_7.slice() },
      sao: { o: 24, nhip: 37 },
      loiGiai: { chinh: C_7.slice(), hamCuaEmMoi: [H('grid', T_GRID, ['r', 'k'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_7.slice() }, hamCuaEmMoi: [H('grid', nhieu(['# r hàng, mỗi hàng k chấm'], T_GRID), ['r', 'k'])] },
      congThucKhac: [
        { moTa: 'Xuống hai ô trước rồi mới lùi về đầu hàng', hamCuaEmMoi: [H('grid', ['for i in range(r):', '    dots(k)', '    turn_right()', '    move()', '    move()', '    turn_left()', '    for j in range(2 * k):', '        back()'], ['r', 'k'])] }
      ],
      loiSai: [
        { moTa: 'Gọi grid mà chưa chế hàm', baiLam: { chinh: C_7.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ lùi k ô: hàng sau lệch sang phải, chấm ra ngoài hình', baiLam: { chinh: C_7.slice() }, hamCuaEmMoi: [H('grid', ['for i in range(r):', '    dots(k)', '    for j in range(k):', '        back()', '    turn_right()', '    move()', '    move()', '    turn_left()'], ['r', 'k'])], phaiCoMa: ['to-thua'] },
        { moTa: 'Chỉ xuống một ô: hàng sau sát hàng trước, ra ngoài hình', baiLam: { chinh: C_7.slice() }, hamCuaEmMoi: [H('grid', ['for i in range(r):', '    dots(k)', '    for j in range(2 * k):', '        back()', '    turn_right()', '    move()', '    turn_left()'], ['r', 'k'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['dots(k) đi 2 × k ô, nên phải lùi 2 × k ô mới về đầu hàng.', 'Hàng cách hàng một ô: xuống hai bước.']
    }),

    man({
      so: 8, ten: 'Khung lồng khung', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'step'], taoHam: ['border'],
      deBai: 'Hình mờ là khung xanh dương bảy ô bao quanh khung đỏ ba ô. Chế border(n): khung vuông mỗi cạnh đi n bước, rồi về đúng chỗ và hướng cũ.',
      veMaMau: 'Chương trình chính vẽ khung to bằng border(6), dời vào trong bằng step(2, 2), rồi vẽ khung nhỏ bằng border(2).',
      san: ['.......', '.......', '.......', '.......', '.......', '.......', '.......'],
      hinh: ['bbbbbbb', 'b.....b', 'b.rrr.b', 'b.r.r.b', 'b.rrr.b', 'b.....b', 'bbbbbbb'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: C_8.slice() },
      sao: { o: 24, nhip: 44 },
      khongDoBFS: true,                                                                   // hình 32 ô
      loiGiai: { chinh: C_8.slice(), hamCuaEmMoi: [H('border', T_BORDER, ['n'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_8.slice() }, hamCuaEmMoi: [H('border', nhieu(['# bốn cạnh, mỗi cạnh n bước'], T_BORDER), ['n'])] },
      congThucKhac: [
        { moTa: 'Đi từng bước bằng vòng for lồng bên trong', hamCuaEmMoi: [H('border', ['for i in range(4):', '    for j in range(n):', '        move()', '    turn_right()'], ['n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi border mà chưa chế hàm', baiLam: { chinh: C_8.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Rẽ trái ở mỗi góc: khung ra ngoài sân, tô ra ngoài hình', baiLam: { chinh: C_8.slice() }, hamCuaEmMoi: [H('border', ['for i in range(4):', '    forward(n)', '    turn_left()'], ['n'])], phaiCoMa: ['to-thua'] },
        { moTa: 'Chỉ ba cạnh: xe không về góc cũ, khung nhỏ lệch chỗ', baiLam: { chinh: C_8.slice() }, hamCuaEmMoi: [H('border', ['for i in range(3):', '    forward(n)', '    turn_right()'], ['n'])], phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['border(n) giống frame() nhưng cạnh dài theo n.', 'Phải về đúng góc cũ thì step(2, 2) mới đưa xe tới góc khung nhỏ.']
    }),

    man({
      so: 9, ten: 'Lấp chỗ trống', hang: 'bien-the', hamCuaEmCan: ['move'], taoHam: ['fill_gaps'],
      robot: XE_CAM, hamGoc: KHAY_CAM,
      deBai: 'Vạch đã có vài ô sơn sẵn đỏ, xanh dương, vàng. Chế fill_gaps(c, n): đi qua n ô, trước mỗi bước nhìn ô phía trước; ô chưa có sơn thì tới đó chấm màu c, ô đã có sơn thì chỉ đi qua.',
      veMaMau: 'color("front") trả "none" khi ô trước mặt chưa có sơn. Tô đè lên ô đã sơn là làm hỏng màu của nó.',
      san: ['.......', '.......', '.......'],
      sonBanDau: ['.......', '.r.b.y.', '.......'],
      hinh: ['.......', '.rgbgy.', '.......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: C_9.slice() },
      sao: { o: 11, nhip: 5 },
      loiGiai: { chinh: C_9.slice(), hamCuaEmMoi: [H('fill_gaps', T_FILL_GAPS, ['c', 'n'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('fill_gaps', nhieu(['# chỉ chấm ô chưa có sơn'], T_FILL_GAPS), ['c', 'n'])] },
      congThucKhac: [
        { moTa: 'Hỏi ngược lại: ô trước đã có sơn thì chỉ đi tiếp', hamCuaEmMoi: [H('fill_gaps', ['ink(c)', 'for i in range(n):', '    if color("front") != "none":', '        move()', '    else:', '        move()', '        dot()'], ['c', 'n'])] },
        { moTa: 'Ghi màu ô trước vào biến rồi mới đi', hamCuaEmMoi: [H('fill_gaps', ['ink(c)', 'for i in range(n):', '    m = color("front")', '    move()', '    if m == "none":', '        dot()'], ['c', 'n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi fill_gaps mà chưa chế hàm', baiLam: { chinh: C_9.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chấm mọi ô: đè mất màu sơn sẵn', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('fill_gaps', ['ink(c)', 'for i in range(n):', '    move()', '    dot()'], ['c', 'n'])], phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Hỏi "khác màu c": ô đỏ, xanh, vàng cũng bị chấm đè', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('fill_gaps', ['ink(c)', 'for i in range(n):', '    if color("front") != c:', '        move()', '        dot()', '    else:', '        move()'], ['c', 'n'])], phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Gọi color() không hướng: camera bốn hướng cần biết nhìn phía nào', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('fill_gaps', ['ink(c)', 'for i in range(n):', '    if color() == "none":', '        move()', '        dot()', '    else:', '        move()'], ['c', 'n'])], phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['Hỏi color("front") == "none" để biết ô phía trước còn trống.', 'Chọn màu một lần ở đầu hàm là đủ.']
    }),

    /* ------------------------------------------------------------ hàng 4: thử thách */
    man({
      so: 10, ten: 'Ba bức tranh hoa văn', hang: 'trum', hamCuaEmCan: ['copy_row', 'next_row', 'fill_gaps'],
      robot: XE_CAM, hamGoc: KHAY_CAM,
      huyHieu: { ma: 'che-may-son', ten: 'Huy hiệu Chế lệnh máy sơn' },
      gioiHanHam: 3,
      deBai: 'Ba bức tranh: hàng trên cùng là viền hoa văn bốn màu, chép nó xuống hàng thứ ba; dưới đó ba sọc đỏ, vàng, xanh dương có vài ô hoa văn xanh lá sơn sẵn ở chỗ khác nhau. ' +
        'Một chương trình phải làm đủ cả ba bức mà không đè lên hoa văn. Chỉ được gọi 3 hàm của em khác nhau.',
      veMaMau: 'Bấm Sân 1, 2, 3 để xem từng bức. copy_row(n) chép hàng trên, fill_gaps(c, n) chỉ chấm ô còn trống, next_row(n) xuống hàng.',
      san: [S10, S10, S10],
      sonBanDau: [['.rybr.', '......', '......', '..g...', '...g..', '......', '......'], ['.gbbg.', '......', '......', '....g.', '.g....', '..g...', '......'],
        ['.yrry.', '......', '......', '..g...', '......', '.g..g.', '......']],
      hinh: [['.rybr.', '......', '.rybr.', '.rgrr.', '.yygy.', '.bbbb.', '......'], ['.gbbg.', '......', '.gbbg.', '.rrrg.', '.gyyy.', '.bgbb.', '......'],
        ['.yrry.', '......', '.yrry.', '.rgrr.', '.yyyy.', '.gbbg.', '......']],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: { chinh: [] },
      sao: { o: 36, nhip: 50 },
      khongDoBFS: true,                                                                   // ba sân, mỗi sân 16 ô hình: sao.nhip theo lời giải
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# chép viền, rồi mỗi sọc: lấp ô trống rồi xuống hàng'], L_10) } },
      loiSai: [
        { moTa: 'Vẽ sọc bằng stripes: đè mất hoa văn', baiLam: { chinh: ['copy_row(4)', 'next_row(5)', 'stripes(["red", "yellow", "blue"])'] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Quên xuống hàng: xe chạy ra ngoài tranh', baiLam: { chinh: ['copy_row(4)', 'next_row(5)', 'for c in ["red", "yellow", "blue"]:', '    fill_gaps(c, 4)'] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Sai thứ tự màu', baiLam: { chinh: ['copy_row(4)', 'next_row(5)', 'for c in ["red", "blue", "yellow"]:', '    fill_gaps(c, 4)', '    next_row(4)'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Quên chép viền', baiLam: { chinh: ['next_row(0)', 'next_row(0)', 'for c in ["red", "yellow", "blue"]:', '    fill_gaps(c, 4)', '    next_row(4)'] }, phaiCoMa: ['to-thua'] }
      ],
      goiY: ['copy_row(4) xong thì xe ở cuối hàng thứ ba: next_row(5) lùi về mép trái rồi xuống sọc đầu.', 'Lặp qua danh sách ba màu: mỗi sọc fill_gaps rồi next_row(4).']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

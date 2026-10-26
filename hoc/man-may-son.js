/* ============================================================================
   man-may-son.js — "Robot Chấn Hưng": CHƯƠNG `may-son` · MÁY SƠN (10 màn, 25/10). Chương làm quen của bộ phận MỚI "máy sơn" (hoc/KE-HOACH-MAY-SON.md), gói mùa 3 "Công cụ", sau gói Cảm biến màu.
   Robot là XE HAI BÁNH GẮN ĐẦU SƠN: robot { than: 'hai-banh', tay: 'son', camBien: [] }. Đầu sơn tô Ô XE ĐANG ĐỨNG. Bốn lệnh gốc:
     ink(c)      chọn màu "red" | "green" | "blue" | "yellow", đổi NGAY, không tốn nhịp (như aim(n))
     dot()       chấm một chấm vào ô đang đứng          ┐ chỉ ra lệnh, wait() cho nhịp trôi;
     pen_down()  hạ đầu sơn, giữ sơn (tô luôn ô đứng)   │ mỗi nhịp đầu sơn nhận MỘT lệnh
     pen_up()    nhấc đầu sơn                           ┘
   LUẬT (san-hoc.js, phần MÁY SƠN): trong một nhịp: lệnh đầu sơn → bánh chạy → đầu sơn đang hạ thì tô ô xe đứng CUỐI nhịp. Nên "dot(); move()" chấm rồi mới đi; đầu sơn hạ thì mọi ô xe đi qua,
   kể cả ô góc khi xe quay tại chỗ để rẽ, đều được tô: một nét liền. Mục tiêu 'to-hinh': HÌNH MỜ (man.hinh, ký tự r g b y) cần tô; thắng NGAY khi mọi ô của hình đúng màu và không ô nào ngoài hình bị tô.
   Tô ra ngoài hình thì không xóa được: chương trình dừng ('to-thua'). Tô sai màu một ô trong hình thì tô lại được.

   KHAY: bánh đủ (có bánh lùi) + bốn lệnh sơn. Chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, dùng được hàm của em các chương trước (move, turn_right, turn_left, forward(n)…).
   Ý Python của chương: lặp để vẽ nét (for), DANH SÁCH MÀU (for c in ["red", "blue"]: màn 7, 10; cauTruc thêm 'list' từ màn 7) và for LỒNG for (màn 10).
   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     may-son.6  dots(n)  = for i in range(n): dot(), move(), move()             n chấm cách nhau một ô, theo hướng xe (2 nhịp mỗi chấm)
     may-son.10 frame()  = for i in range(4): forward(2), turn_right()           khung vuông cạnh 3 ô, quay về đúng chỗ và hướng cũ (12 nhịp)

   Sao: sao.nhip = nhịp của lời giải chạy thật (nhipTheoLoiGiai: do-duong-may-son.mjs dò BFS, luôn ≤); sao.o = ô của lời giải.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'ink', 'dot', 'pen_down', 'pen_up'];

  function H(ten, than, thamSo) { return { ten: ten, thamSo: (thamSo || []).slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  var T_DOTS = ['for i in range(n):', '    dot()', '    move()', '    move()'];
  var T_FRAME = ['for i in range(4):', '    forward(2)', '    turn_right()'];
  var L_10 = ['for c in ["red", "blue"]:', '    ink(c)', '    pen_down()', '    frame()', '    pen_up()', '    forward(3)'];

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    m.chuong = 'may-son';
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'son', camBien: [] };
    m.hamGoc = m.hamGoc || KHAY;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = m.so >= 7 ? ['for', 'if', 'while', 'list'] : ['for', 'if', 'while'];
    m.mucTieu = 'to-hinh';
    m.nhipTheoLoiGiai = true;
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Chấm sơn đầu tiên', hang: 'lam-quen', hamCuaEmCan: ['move'],
      deBai: 'Xe gắn đầu sơn: dot() chấm sơn vào ô xe đang đứng. Hình mờ có hai chấm đỏ cách nhau một ô. Chấm đủ hai chấm, không chấm ra ngoài hình.',
      veMaMau: 'Chương trình có sẵn chấm được chấm thứ nhất. Viết tiếp để xe đi tới chấm thứ hai rồi chấm.',
      san: ['.....', '.....', '.....'],
      hinh: ['.....', 'r.r..', '.....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: ['dot()', 'wait()'] },
      sao: { o: 8, nhip: 3 },
      loiGiai: { chinh: ['dot()', 'move()', 'move()', 'dot()', 'wait()'] },
      loiGiaiKhac: {
        moTa: 'Chấm ở một nhịp riêng rồi mới đi (thêm dòng wait())',
        baiLam: { chinh: ['dot()', 'left_move()', 'right_move()', 'wait()', 'move()', 'dot()', 'wait()'] }
      },
      loiSai: [
        { moTa: 'Không viết thêm: mới có một chấm', baiLam: { chinh: ['dot()', 'wait()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Chấm ở mọi ô: chấm ra ngoài hình', baiLam: { chinh: ['dot()', 'move()', 'dot()', 'move()', 'dot()', 'wait()'] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Quên wait() sau chấm cuối: lệnh chấm chưa chạy', baiLam: { chinh: ['dot()', 'move()', 'move()', 'dot()'] }, phaiCoMa: ['quen-wait', 'chua-to-hinh'] }
      ],
      goiY: ['dot() chỉ ra lệnh: cần wait() (hay một lệnh có wait() như move()) để nhịp chạy.',
        'dot() rồi move() là một nhịp: chấm xong xe mới đi.']
    }),

    man({
      so: 2, ten: 'Đố: sai màu', hang: 'lam-quen', hamCuaEmCan: ['move'],
      deBai: 'Hình mờ có một chấm đỏ và một chấm xanh dương. Chương trình có sẵn chấm cả hai bằng màu đỏ. Thêm ink("blue") đúng chỗ để chấm thứ hai màu xanh dương.',
      veMaMau: 'Lúc đầu đầu sơn mang màu đỏ. ink(c) đổi màu ngay, không tốn nhịp.',
      san: ['.....', '.....', '.....'],
      hinh: ['.....', 'r.b..', '.....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: ['dot()', 'move()', 'move()', 'dot()', 'wait()'] },
      sao: { o: 9, nhip: 3 },
      loiGiai: { chinh: ['dot()', 'move()', 'move()', 'ink("blue")', 'dot()', 'wait()'] },
      loiGiaiKhac: {
        moTa: 'Chọn lại màu đỏ cho chấm đầu cho chắc (thêm ink("red"))',
        baiLam: { chinh: ['ink("red")', 'dot()', 'move()', 'move()', 'ink("blue")', 'dot()', 'wait()'] }
      },
      loiSai: [
        { moTa: 'Không sửa gì: chấm thứ hai vẫn đỏ', baiLam: { chinh: ['dot()', 'move()', 'move()', 'dot()', 'wait()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Viết hoa tên màu: ink("Blue")', baiLam: { chinh: ['dot()', 'move()', 'move()', 'ink("Blue")', 'dot()', 'wait()'] }, phaiCoMa: ['mau-son-sai'] },
        { moTa: 'Đổi màu ngay từ đầu: cả hai chấm xanh dương', baiLam: { chinh: ['ink("blue")', 'dot()', 'move()', 'move()', 'dot()', 'wait()'] }, phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['ink(c) đổi màu ngay lúc chạy tới dòng đó, các chấm sau mới mang màu mới.',
        'Tên màu viết chữ thường, trong dấu nháy: "blue".']
    }),

    man({
      so: 3, ten: 'Đố: nét thiếu', hang: 'lam-quen', hamCuaEmCan: ['move', 'forward'],
      deBai: 'pen_down() hạ đầu sơn và giữ luôn: xe đi tới đâu, ô đó được tô. Hình mờ là một nét đỏ dài bốn ô, chương trình có sẵn mới tô được ba ô. Sửa cho đủ nét.',
      veMaMau: 'Chạy thử và đếm số ô được tô. Đầu sơn tô cả ô xuất phát.',
      san: ['......', '......', '......'],
      hinh: ['......', '.rrrr.', '......'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['pen_down()', 'move()', 'move()'] },
      sao: { o: 7, nhip: 3 },
      loiGiai: { chinh: ['pen_down()', 'forward(3)'] },
      loiGiaiKhac: {
        moTa: 'Bước đầu viết riêng bằng move(), rồi forward(2)',
        baiLam: { chinh: ['pen_down()', 'move()', 'forward(2)'] }
      },
      loiSai: [
        { moTa: 'Không sửa gì: nét mới ba ô', baiLam: { chinh: ['pen_down()', 'move()', 'move()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Đi một bước rồi mới hạ đầu sơn: nét lệch ra ngoài hình', baiLam: { chinh: ['move()', 'pen_down()', 'forward(3)'] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Dùng dot() thay pen_down(): chỉ một chấm, không giữ sơn', baiLam: { chinh: ['dot()', 'forward(3)'] }, phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Nét bốn ô thì xe đi ba bước: ô xuất phát đã được tô lúc hạ đầu sơn.',
        'pen_down() rồi move() là một nhịp: hạ đầu sơn, tô ô đứng, đi, tô ô mới.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Giữ nét qua góc', hang: 'luyen', hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left'],
      deBai: 'Hình mờ là một nét gập góc: ba ô sang phải rồi hai ô xuống. Chương trình có sẵn nhấc đầu sơn ở góc nên nét bị đứt. Giữ đầu sơn hạ suốt lúc xe rẽ để nét liền.',
      veMaMau: 'Xe quay tại chỗ ở góc: đầu sơn vẫn hạ thì ô góc vẫn được tô.',
      san: ['.....', '.....', '.....', '.....', '.....'],
      hinh: ['.....', '.rrr.', '...r.', '...r.', '.....'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['pen_down()', 'forward(2)', 'pen_up()', 'turn_right()', 'forward(2)'] },
      sao: { o: 11, nhip: 5 },
      loiGiai: { chinh: ['pen_down()', 'forward(2)', 'turn_right()', 'forward(2)'] },
      loiGiaiKhac: {
        moTa: 'Bước đầu viết riêng bằng move(), rồi forward(1)',
        baiLam: { chinh: ['pen_down()', 'move()', 'forward(1)', 'turn_right()', 'forward(2)'] }
      },
      loiSai: [
        { moTa: 'Không sửa gì: nhấc đầu sơn ở góc, đoạn dưới không được tô', baiLam: { chinh: ['pen_down()', 'forward(2)', 'pen_up()', 'turn_right()', 'forward(2)'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Rẽ nhầm sang trái: tô ra ngoài hình', baiLam: { chinh: ['pen_down()', 'forward(2)', 'turn_left()', 'forward(2)'] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Đi thẳng ba bước trước khi rẽ: tô ra ngoài hình', baiLam: { chinh: ['pen_down()', 'forward(3)', 'turn_right()', 'forward(2)'] }, phaiCoMa: ['to-thua'] }
      ],
      goiY: ['pen_up() nhấc đầu sơn: các ô xe đi sau đó không được tô nữa.',
        'Rẽ là quay tại chỗ, nên đầu sơn hạ thì ô góc vẫn nằm trong nét.']
    }),

    man({
      so: 5, ten: 'Chữ U', hang: 'luyen', hamCuaEmCan: ['move', 'forward', 'turn_left'],
      deBai: 'Hình mờ là chữ U màu đỏ: xuống hai ô, sang phải hai ô, lên hai ô. Vẽ chữ U bằng một nét liền. Chương trình chỉ có 10 ô.',
      veMaMau: 'Xe đang quay mặt xuống. Mỗi đoạn của chữ U dài hai bước, giữa hai đoạn xe rẽ trái.',
      san: ['.....', '.....', '.....', '.....', '.....'],
      hinh: ['.....', '.r.r.', '.r.r.', '.rrr.', '.....'],
      batDau: { x: 1, y: 1, huong: 2 },
      maMau: { chinh: ['pen_down()'] },
      sao: { o: 11, nhip: 8 },
      loiGiai: { chinh: ['pen_down()', 'for i in range(3):', '    forward(2)', '    turn_left()'] },
      loiGiaiKhac: {
        moTa: 'Lặp hai lần rồi vẽ thêm đoạn cuối',
        baiLam: { chinh: ['pen_down()', 'for i in range(2):', '    forward(2)', '    turn_left()', 'forward(2)'] }
      },
      loiSai: [
        { moTa: 'Rẽ phải thay vì rẽ trái: tô ra ngoài hình', baiLam: { chinh: ['pen_down()', 'for i in range(3):', '    forward(2)', '    turn_right()'] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Lặp hai lần: thiếu đoạn đi lên thứ hai', baiLam: { chinh: ['pen_down()', 'for i in range(2):', '    forward(2)', '    turn_left()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Quên hạ đầu sơn: chưa tô ô nào', baiLam: { chinh: ['for i in range(3):', '    forward(2)', '    turn_left()'] }, phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Ba đoạn giống nhau: đi hai bước rồi rẽ trái. Một vòng for lặp ba lần là đủ.',
        'Ô cuối của hình được tô xong là thắng ngay, lần rẽ cuối không cần chạy.']
    }),

    man({
      so: 6, ten: 'Chấm cách quãng', hang: 'luyen', hamCuaEmCan: ['move'], taoHam: ['dots'],
      deBai: 'Hình mờ là ba chấm đỏ, chấm nọ cách chấm kia một ô. Chế dots(n): chấm n chấm cách quãng như vậy theo hướng xe. Chương trình gọi dots(3).',
      veMaMau: 'Chương trình đã gọi dots(3). Mở Xưởng hàm, tạo dots với đối số n rồi viết thân hàm.',
      san: ['.......', '.......', '.......'],
      hinh: ['.......', 'r.r.r..', '.......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: ['dots(3)'] },
      sao: { o: 8, nhip: 5 },
      loiGiai: { chinh: ['dots(3)'], hamCuaEmMoi: [H('dots', T_DOTS, ['n'])] },
      loiGiaiKhac: {
        moTa: 'Đi hai bước bằng forward(2) thay cho hai lần move()',
        baiLam: { chinh: ['dots(3)'] },
        hamCuaEmMoi: [H('dots', ['for i in range(n):', '    dot()', '    forward(2)'], ['n'])]
      },
      loiSai: [
        { moTa: 'Gọi dots(3) mà chưa chế hàm', baiLam: { chinh: ['dots(3)'] }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ đi một bước giữa hai chấm: chấm ra ngoài hình', baiLam: { chinh: ['dots(3)'] }, hamCuaEmMoi: [H('dots', ['for i in range(n):', '    dot()', '    move()'], ['n'])], phaiCoMa: ['to-thua'] },
        { moTa: 'Hạ đầu sơn thay vì chấm: nét liền, tô cả ô giữa', baiLam: { chinh: ['dots(3)'] }, hamCuaEmMoi: [H('dots', ['for i in range(n):', '    pen_down()', '    move()', '    move()'], ['n'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Mỗi lần lặp: chấm, rồi đi hai bước.', 'dot() và bước đầu tiên chạy chung một nhịp.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Danh sách màu', hang: 'bien-the', hamCuaEmCan: ['move'],
      deBai: 'Hình mờ là ba chấm cách quãng: đỏ, xanh dương, đỏ. Vòng for đi qua danh sách màu, mỗi lần chọn màu c rồi chấm. Sửa danh sách cho đúng thứ tự màu.',
      veMaMau: 'for c in [...]: lặp một lần cho mỗi màu trong danh sách, c lần lượt là từng màu.',
      san: ['.......', '.......', '.......'],
      hinh: ['.......', 'r.b.r..', '.......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: ['for c in ["red", "red", "red"]:', '    ink(c)', '    dot()', '    move()', '    move()'] },
      sao: { o: 8, nhip: 5 },
      loiGiai: { chinh: ['for c in ["red", "blue", "red"]:', '    ink(c)', '    dot()', '    move()', '    move()'] },
      loiGiaiKhac: {
        moTa: 'Đặt tên cho danh sách màu trước khi lặp',
        baiLam: { chinh: ['colors = ["red", "blue", "red"]', 'for c in colors:', '    ink(c)', '    dot()', '    move()', '    move()'] }
      },
      loiSai: [
        { moTa: 'Không sửa danh sách: cả ba chấm đỏ', baiLam: { chinh: ['for c in ["red", "red", "red"]:', '    ink(c)', '    dot()', '    move()', '    move()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Chọn màu sau khi chấm: mỗi chấm mang màu của lần trước', baiLam: { chinh: ['for c in ["red", "blue", "red"]:', '    dot()', '    ink(c)', '    move()', '    move()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Viết hoa tên màu trong danh sách', baiLam: { chinh: ['for c in ["red", "Blue", "red"]:', '    ink(c)', '    dot()', '    move()', '    move()'] }, phaiCoMa: ['mau-son-sai'] }
      ],
      goiY: ['Chạm vào từng màu trong danh sách để đổi màu đó.', 'ink(c) phải chạy trước dot() để chấm mang màu mới.']
    }),

    man({
      so: 8, ten: 'Đổi màu giữa nét', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'turn_right'],
      deBai: 'Hình mờ có hai hàng: hàng trên đỏ, hàng dưới xanh dương. Vẽ cả hai hàng bằng một nét liền, đổi màu khi xe đã rẽ xuống hàng dưới.',
      veMaMau: 'Đầu sơn đang hạ thì mỗi nhịp tô ô xe đứng bằng màu đang chọn, kể cả nhịp xe quay tại chỗ.',
      san: ['.....', '.....', '.....', '.....'],
      hinh: ['.....', '.rrr.', '.bbb.', '.....'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['pen_down()', 'forward(2)', 'turn_right()', 'move()', 'turn_right()', 'forward(2)'] },
      sao: { o: 14, nhip: 7 },
      loiGiai: { chinh: ['pen_down()', 'forward(2)', 'turn_right()', 'ink("blue")', 'move()', 'turn_right()', 'forward(2)'] },
      loiGiaiKhac: {
        moTa: 'Ghi chú chỗ đổi màu bằng một dòng chú thích',
        baiLam: { chinh: ['pen_down()', 'forward(2)', 'turn_right()', '# hàng dưới màu xanh dương', 'ink("blue")', 'move()', 'turn_right()', 'forward(2)'] }
      },
      loiSai: [
        { moTa: 'Không đổi màu: cả hai hàng đỏ', baiLam: { chinh: ['pen_down()', 'forward(2)', 'turn_right()', 'move()', 'turn_right()', 'forward(2)'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Đổi màu trước khi rẽ: ô góc hàng trên bị tô xanh', baiLam: { chinh: ['pen_down()', 'forward(2)', 'ink("blue")', 'turn_right()', 'move()', 'turn_right()', 'forward(2)'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Rẽ trái ở góc dưới: tô ra ngoài hình', baiLam: { chinh: ['pen_down()', 'forward(2)', 'turn_right()', 'ink("blue")', 'move()', 'turn_left()', 'forward(2)'] }, phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Nhịp xe quay ở góc trên vẫn tô ô góc: lúc đó màu phải còn là đỏ.', 'Đổi màu ngay trước bước đi xuống hàng dưới.']
    }),

    man({
      so: 9, ten: 'Khung vuông', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'turn_right'],
      deBai: 'Hình mờ là một khung vuông màu vàng, mỗi cạnh ba ô. Vẽ khung bằng một nét liền, quay về chỗ xuất phát.',
      veMaMau: 'Bốn cạnh giống nhau: đi hai bước rồi rẽ phải.',
      san: ['.....', '.....', '.....', '.....', '.....'],
      hinh: ['.....', '.yyy.', '.y.y.', '.yyy.', '.....'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['ink("yellow")', 'pen_down()'] },
      sao: { o: 12, nhip: 10 },
      loiGiai: { chinh: ['ink("yellow")', 'pen_down()', 'for i in range(4):', '    forward(2)', '    turn_right()'] },
      loiGiaiKhac: {
        moTa: 'Vẽ ba cạnh trong vòng lặp, cạnh cuối viết riêng',
        baiLam: { chinh: ['ink("yellow")', 'pen_down()', 'for i in range(3):', '    forward(2)', '    turn_right()', 'forward(2)'] }
      },
      loiSai: [
        { moTa: 'Quên chọn màu vàng: khung màu đỏ', baiLam: { chinh: ['pen_down()', 'for i in range(4):', '    forward(2)', '    turn_right()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Cạnh dài ba bước: tô ra ngoài hình', baiLam: { chinh: ['ink("yellow")', 'pen_down()', 'for i in range(4):', '    forward(3)', '    turn_right()'] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Chỉ lặp hai lần: thiếu hai cạnh', baiLam: { chinh: ['ink("yellow")', 'pen_down()', 'for i in range(2):', '    forward(2)', '    turn_right()'] }, phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Khung vuông có bốn cạnh, mỗi cạnh ba ô nên xe đi hai bước.', 'Ô cuối được tô là thắng ngay.']
    }),

    /* ------------------------------------------------------------ hàng 4: thử thách */
    man({
      so: 10, ten: 'Hai khung hai màu', hang: 'trum', hamCuaEmCan: ['move', 'forward', 'turn_right'], taoHam: ['frame'],
      huyHieu: { ma: 'may-son', ten: 'Huy hiệu Máy sơn' },
      deBai: 'Hai khung vuông nằm cạnh nhau: khung trái đỏ, khung phải xanh dương. Chế frame() vẽ một khung vuông rồi quay về chỗ cũ. Chương trình lặp qua danh sách màu, mỗi màu vẽ một khung.',
      veMaMau: 'Chương trình có sẵn đã lặp qua hai màu và gọi frame(). Tạo frame() trong Xưởng hàm: lặp bốn cạnh.',
      san: ['.......', '.......', '.......', '.......', '.......'],
      hinh: ['.......', 'rrrbbb.', 'r.rb.b.', 'rrrbbb.', '.......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: L_10.slice() },
      sao: { o: 16, nhip: 25 },
      khongDoBFS: true,                                                                   // hình 16 ô: BFS chạy quá lâu, sao.nhip theo lời giải
      loiGiai: { chinh: L_10.slice(), hamCuaEmMoi: [H('frame', T_FRAME)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách làm, thêm một dòng chú thích trong frame()',
        baiLam: { chinh: L_10.slice() },
        hamCuaEmMoi: [H('frame', nhieu(['# bốn cạnh, mỗi cạnh ba ô'], T_FRAME))]
      },
      loiSai: [
        { moTa: 'Gọi frame() mà chưa chế hàm', baiLam: { chinh: L_10.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên chọn màu trong vòng lặp: cả hai khung đỏ', baiLam: { chinh: ['for c in ["red", "blue"]:', '    pen_down()', '    frame()', '    pen_up()', '    forward(3)'] }, hamCuaEmMoi: [H('frame', T_FRAME)], phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'frame() chỉ ba cạnh: khung hở, xe không về chỗ cũ', baiLam: { chinh: L_10.slice() }, hamCuaEmMoi: [H('frame', ['for i in range(3):', '    forward(2)', '    turn_right()'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['frame() phải đưa xe về đúng chỗ và hướng cũ, như vậy forward(3) mới tới góc khung kế.',
        'Vòng for trong frame() nằm bên trong vòng for qua danh sách màu: for lồng for.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

/* ============================================================================
   man-tay-xoay.js — "Học lập trình": CHƯƠNG `tay-xoay` · TAY XOAY (10 màn). Đợt 2 làm lại theo khuôn (KE-HOACH-CHE-LENH.md, mục 5b.3). Chương làm quen của bộ phận MỚI "tay xoay".
   Robot là XE HAI BÁNH GẮN TAY XOAY: robot { than: 'hai-banh', tay: 'xoay', camBien: [] }. Tay kẹp đời 2: bốn lệnh tay cũ (arm_down, arm_up, grab, release) giữ nguyên, thêm arm_left() / arm_right()
   xoay khớp tay MỘT nấc giữa ba nấc trái · trước · phải. grab / release làm ở Ô MÀ TAY ĐANG CHỈ (trước mặt, bên trái hay bên phải xe), nên nhặt / đặt vật ở bên hông mà không cần quay xe.

   LUẬT TAY XOAY (san-hoc.js, phần TAY XOAY): trong một nhịp máy làm theo thứ tự cố định: tay NÂNG (arm_up) → khớp XOAY (arm_left / arm_right) → tay HẠ (arm_down) → KẸP / THẢ ở ô tay chỉ → bánh chạy.
   Khớp chỉ xoay được khi tay đang nâng (tay hạ sát đất thì khớp kẹt: 'tay-xoay-ket'); khớp ở nấc cuối thì lệnh xoay thêm không làm gì ('xoay-het-nac'); mỗi nhịp một lệnh xoay. Tay hạ thì xe không đi, không quay (như tay kẹp);
   thả khi tay đang nâng thì vật vỡ. Vật nằm đất CHIẾM Ô. Mục tiêu 'dua-vat' (mọi vật nằm trên ô đích D) hoặc 'toi-co' (6.6 dọn lối rồi tới cờ).

   KHAY: bánh đủ (có bánh lùi) + bốn lệnh tay + hai lệnh xoay (thứ tự để khay xếp hai cột: nâng / hạ, trái / phải, kẹp / thả). 3.8 hỏng nên khay hẹp hơn (xem dưới).
   Chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em. Hàm của em có sẵn: mọi hàm các chương trước (move, turn_right, turn_left, u_turn, pick, drop, put_right…).
     pick() = arm_down(), grab(), wait(), arm_up(), wait()     (nhặt vật ở ô tay chỉ, tay về tư thế nâng)
     drop() = arm_down(), release(), wait(), arm_up(), wait()  (đặt vật xuống ô tay chỉ, tay về tư thế nâng)
   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     tay-xoay.6  clear_left() = pick(), arm_left(), drop(), arm_right(), wait()        nhặt vật trước mặt, đặt sang ô bên TRÁI xe, tay về phía trước (5 nhịp)
     tay-xoay.10 relay()      = arm_left(), pick(), arm_right(), wait(), arm_right(), drop(), arm_left(), wait()   chuyền vật bên TRÁI sang ô bên PHẢI xe, tay về phía trước (6 nhịp)
   HÀM TAY TRONG LỜI GIẢI KHÁC: put() (chỉ trong loiGiaiKhac, không vào kho).

   Sao: sao.nhip = số nhịp của lời giải chạy thật; các màn viết thẳng lệnh tay có thể gộp nhịp: do-duong-tay-xoay.mjs (BFS) luôn ngắn hơn hay bằng ở màn dùng pick() / drop() (nhipTheoLoiGiai); sao.o = ô của lời giải.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'];
  var KHAY_KET = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'arm_left', 'grab', 'release'];      // 6.8: khớp kẹt một phía, không còn arm_right

  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  var T_THA = ['arm_down()', 'release()', 'wait()'];                                 // thả, tay còn hạ (thân put() của lời giải khác)
  // lời giải gọn: nhặt vật bên TRÁI rồi đặt ở ô trước mặt (mỗi dòng một lệnh, ba nhịp: [xoay + hạ + kẹp] [nâng + xoay] [hạ + thả])
  var NHAT_TRAI = ['arm_left()', 'arm_down()', 'grab()', 'wait()'];
  var TRAI_RA_TRUOC = nhieu(NHAT_TRAI, ['arm_up()', 'arm_right()', 'wait()', 'arm_down()', 'release()', 'wait()']);
  var PHAI_RA_TRUOC = TRAI_RA_TRUOC.map(function (d) { return d === 'arm_left()' ? 'arm_right()' : d === 'arm_right()' ? 'arm_left()' : d; });
  var TRUOC_SANG_TRAI = ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_left()', 'wait()', 'arm_down()', 'release()', 'wait()'];
  var TRUOC_SANG_PHAI = TRUOC_SANG_TRAI.map(function (d) { return d === 'arm_left()' ? 'arm_right()' : d; });

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    m.chuong = 'tay-xoay';
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'xoay', camBien: [] };
    m.hamGoc = m.hamGoc || KHAY;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if', 'while'];
    if (m.mucTieu === 'toi-co') delete m.mucTieu;                 // mặc định của lõi
    else m.mucTieu = 'dua-vat';
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Xoay sang trái', hang: 'lam-quen',
      deBai: 'Một vật nằm ngay bên trái xe, ô đích nằm ngay trước mặt xe. Tay xoay nhặt được vật ở bên hông mà xe không cần quay. Đưa vật tới ô đích.',
      veMaMau: 'Chương trình có sẵn xoay tay sang trái, hạ tay rồi kẹp vật. Chạy thử xem tay làm gì, rồi viết tiếp để đưa vật tới ô đích.',
      san: ['.....', '.....', '..D..', '.o...', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: NHAT_TRAI.slice() },
      sao: { o: 10, nhip: 3 },
      loiGiai: { chinh: TRAI_RA_TRUOC.slice() },
      loiGiaiKhac: {
        moTa: 'Gói việc thả vào hàm put(), chỉ gọi một lần',
        baiLam: { chinh: nhieu(NHAT_TRAI, ['arm_up()', 'arm_right()', 'wait()', 'put()']) },
        hamCuaEmMoi: [H('put', T_THA)]
      },
      loiSai: [
        { moTa: 'Không sửa gì: xe nhặt vật rồi đứng yên', baiLam: { chinh: NHAT_TRAI.slice() }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên nâng tay trước khi xoay về: khớp kẹt', baiLam: { chinh: nhieu(NHAT_TRAI, ['arm_right()', 'wait()', 'arm_down()', 'release()', 'wait()']) }, phaiCoMa: ['tay-xoay-ket', 'chua-dua-vat'] },
        { moTa: 'Xoay nhầm sang phải: tay kẹp vào ô trống', baiLam: { chinh: nhieu(['arm_right()', 'arm_down()', 'grab()', 'wait()'], ['arm_up()', 'arm_left()', 'wait()', 'arm_down()', 'release()', 'wait()']) }, phaiCoMa: ['kep-hut', 'chua-dua-vat'] },
        { moTa: 'Thả khi tay còn nâng: vật rơi vỡ', baiLam: { chinh: nhieu(NHAT_TRAI, ['arm_up()', 'arm_right()', 'wait()', 'release()', 'wait()']) }, phaiCoMa: ['vat-vo'] },
        { moTa: 'Không xoay tay về trước mặt: vật đặt xuống lại ô bên trái', baiLam: { chinh: nhieu(NHAT_TRAI, ['arm_up()', 'wait()', 'arm_down()', 'release()', 'wait()']) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Khớp xoay chỉ xoay được khi tay đang nâng. Nhặt xong, nâng tay rồi mới xoay về.',
        'Tay kẹp ở ô mà nó đang chỉ: bên trái, trước mặt hay bên phải xe.']
    }),

    man({
      so: 2, ten: 'Đố: sai bên', hang: 'lam-quen',
      deBai: 'Vật nằm bên phải xe, ô đích nằm ngay trước mặt xe. Chương trình có sẵn viết cho vật bên trái nên tay xoay sai bên. Sửa lại để đưa vật tới ô đích.',
      veMaMau: 'Chương trình có sẵn dành cho vật nằm bên trái. Chạy thử, xem tay kẹp vào đâu ở nhịp đầu tiên.',
      san: ['.....', '.....', '..D..', '...o.', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: TRAI_RA_TRUOC.slice() },
      sao: { o: 10, nhip: 3 },
      loiGiai: { chinh: PHAI_RA_TRUOC.slice() },
      loiGiaiKhac: {
        moTa: 'Gói việc thả vào hàm put(), chỉ gọi một lần',
        baiLam: { chinh: nhieu(['arm_right()', 'arm_down()', 'grab()', 'wait()'], ['arm_up()', 'arm_left()', 'wait()', 'put()']) },
        hamCuaEmMoi: [H('put', T_THA)]
      },
      loiSai: [
        { moTa: 'Không sửa gì: tay kẹp vào ô trống bên trái', baiLam: { chinh: TRAI_RA_TRUOC.slice() }, phaiCoMa: ['kep-hut', 'chua-dua-vat'] },
        { moTa: 'Chỉ sửa dòng đầu: tay xoay phải hai lần, vật đặt lại chỗ cũ', baiLam: { chinh: nhieu(['arm_right()', 'arm_down()', 'grab()', 'wait()'], ['arm_up()', 'arm_right()', 'wait()', 'arm_down()', 'release()', 'wait()']) }, phaiCoMa: ['xoay-het-nac', 'chua-dua-vat'] },
        { moTa: 'Sửa đúng bên nhưng quên nâng tay: khớp kẹt', baiLam: { chinh: nhieu(['arm_right()', 'arm_down()', 'grab()', 'wait()'], ['arm_left()', 'wait()', 'arm_down()', 'release()', 'wait()']) }, phaiCoMa: ['tay-xoay-ket', 'chua-dua-vat'] }
      ],
      goiY: ['Chạy thử và để ý tay ở nhịp đầu: nó chỉ vào ô trống hay ô có vật?',
        'Muốn nhặt vật bên phải thì xoay tay sang phải, muốn đưa về trước mặt thì xoay lại sang trái.']
    }),

    man({
      so: 3, ten: 'Đố: khớp kẹt', hang: 'lam-quen',
      deBai: 'Vật nằm ngay trước mặt xe, ô đích nằm bên trái xe. Chương trình có sẵn nhặt được vật nhưng không đưa sang trái được. Sửa lại cho khớp xoay được.',
      veMaMau: 'Chạy thử và đọc lời chẩn đoán: tay ở tư thế nào khi lệnh xoay chạy?',
      san: ['.....', '.....', '..o..', '.D...', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: ['arm_down()', 'grab()', 'wait()', 'arm_left()', 'wait()', 'arm_down()', 'release()', 'wait()'] },
      sao: { o: 9, nhip: 3 },
      loiGiai: { chinh: TRUOC_SANG_TRAI.slice() },
      loiGiaiKhac: {
        moTa: 'Gói việc thả vào hàm put(), chỉ gọi một lần',
        baiLam: { chinh: nhieu(['arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_left()', 'wait()', 'put()']) },
        hamCuaEmMoi: [H('put', T_THA)]
      },
      loiSai: [
        { moTa: 'Không sửa gì: tay còn hạ nên khớp kẹt, vật thả lại chỗ cũ', baiLam: { chinh: ['arm_down()', 'grab()', 'wait()', 'arm_left()', 'wait()', 'arm_down()', 'release()', 'wait()'] }, phaiCoMa: ['tay-xoay-ket', 'chua-dua-vat'] },
        { moTa: 'Nâng tay ở một nhịp riêng: thắng nhưng chậm một nhịp', baiLam: { chinh: nhieu(['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()'], ['arm_left()', 'wait()', 'arm_down()', 'release()', 'wait()']) }, phaiCoMa: [] },
        { moTa: 'Xoay nhầm sang phải: vật đặt ở bên phải', baiLam: { chinh: TRUOC_SANG_PHAI.slice() }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xoay trước khi nhặt: tay kẹp vào ô trống bên trái', baiLam: { chinh: ['arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()'] }, phaiCoMa: ['kep-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Đọc lời chẩn đoán: khớp chỉ xoay được khi tay đang nâng. Tay đang hạ thì phải làm gì trước?',
        'Nâng tay và xoay có thể chạy chung một nhịp.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Mang hàng sang bên', hang: 'luyen', hamCuaEmCan: ['move'],
      deBai: 'Vật nằm bên trái xe, ô đích nằm bên trái xe sau hai ô đi thẳng. Xe cầm vật ở bên hông rồi đi lên, tay vẫn chỉ sang trái. Đưa vật tới ô đích.',
      veMaMau: 'Chương trình có sẵn nhặt vật ở bên trái rồi chạy tiếp. Chạy thử xem xe có đi được không.',
      san: ['.....', '.....', '.D...', '.....', '.o...'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: nhieu(NHAT_TRAI, ['move()', 'move()', 'arm_down()', 'release()', 'wait()']) },
      sao: { o: 13, nhip: 4 },
      loiGiai: { chinh: nhieu(NHAT_TRAI, ['arm_up()', 'move()', 'move()', 'arm_down()', 'release()', 'wait()']) },
      loiGiaiKhac: {
        moTa: 'Gói hai bước đi vào hàm go2(), chỉ gọi một lần',
        baiLam: { chinh: nhieu(NHAT_TRAI, ['arm_up()', 'go2()', 'arm_down()', 'release()', 'wait()']) },
        hamCuaEmMoi: [H('go2', ['move()', 'move()'])]
      },
      loiSai: [
        { moTa: 'Không sửa gì: tay còn hạ nên xe không nhúc nhích, vật thả lại chỗ cũ', baiLam: { chinh: nhieu(NHAT_TRAI, ['move()', 'move()', 'arm_down()', 'release()', 'wait()']) }, phaiCoMa: ['tay-vuong', 'chua-dua-vat'] },
        { moTa: 'Đi thiếu một ô: vật đặt xuống giữa đường', baiLam: { chinh: nhieu(NHAT_TRAI, ['arm_up()', 'move()', 'arm_down()', 'release()', 'wait()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả khi tay còn nâng: vật rơi vỡ', baiLam: { chinh: nhieu(NHAT_TRAI, ['arm_up()', 'move()', 'move()', 'release()', 'wait()']) }, phaiCoMa: ['vat-vo'] },
        { moTa: 'Xoay tay về trước mặt khi đi: vật đặt xuống ô trước mặt, không phải ô đích', baiLam: { chinh: nhieu(NHAT_TRAI, ['arm_up()', 'arm_right()', 'go2()', 'arm_down()', 'release()', 'wait()']) },
          hamCuaEmMoi: [H('go2', ['move()', 'move()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Tay hạ thì xe không đi được: nâng tay lại. Nâng tay và lệnh đi có thể chạy chung một nhịp.',
        'Tay vẫn chỉ sang trái khi xe đi, nên không cần xoay lại.']
    }),

    man({
      so: 5, ten: 'Nhanh hơn quay xe', hang: 'luyen', hamCuaEmCan: ['put_right'],
      deBai: 'Vật nằm trước mặt xe, ô đích nằm bên phải xe. Chương trình có sẵn gọi put_right() và quay cả xe nên dài. Làm lại bằng tay xoay cho ngắn hơn.',
      veMaMau: 'Chương trình có sẵn chỉ gọi put_right() của em. Chạy thử, đếm số nhịp xe mất và số ô chương trình dùng.',
      san: ['.....', '.....', '..o..', '...D.', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: ['put_right()'] },
      sao: { o: 9, nhip: 3 },
      loiGiai: { chinh: TRUOC_SANG_PHAI.slice() },
      loiGiaiKhac: {
        moTa: 'Gói việc thả vào hàm put(), chỉ gọi một lần',
        baiLam: { chinh: nhieu(['arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()', 'put()']) },
        hamCuaEmMoi: [H('put', T_THA)]
      },
      loiSai: [
        { moTa: 'Giữ nguyên put_right(): vẫn thắng nhưng quay cả xe nên dài hơn', baiLam: { chinh: ['put_right()'] }, phaiCoMa: [] },
        { moTa: 'Xoay nhầm sang trái: vật đặt ở bên trái', baiLam: { chinh: TRUOC_SANG_TRAI.slice() }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả khi tay còn nâng: vật rơi vỡ', baiLam: { chinh: ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()', 'release()', 'wait()'] }, phaiCoMa: ['vat-vo'] },
        { moTa: 'Xoay khi tay còn hạ: khớp kẹt', baiLam: { chinh: ['arm_down()', 'grab()', 'wait()', 'arm_right()', 'wait()', 'arm_down()', 'release()', 'wait()'] }, phaiCoMa: ['tay-xoay-ket', 'chua-dua-vat'] }
      ],
      goiY: ['Quay cả xe mất cả nhịp. Chỉ xoay tay thì xe đứng yên.',
        'Nhặt xong, nâng tay và xoay sang phải trong cùng một nhịp.']
    }),

    man({
      so: 6, ten: 'Dọn lối', hang: 'luyen', mucTieu: 'toi-co', hamCuaEmCan: ['move', 'pick', 'drop'], taoHam: ['clear_left'],
      deBai: 'Hai vật chắn giữa hành lang, mà xe cần đi tới cờ. Tạo hàm clear_left(): nhặt vật trước mặt, đặt sang ô bên trái rồi xoay tay về trước. Dùng nó để dọn lối.',
      san: ['#.F.#', '#...#', '#.o.#', '#...#', '#.o.#', '#...#'],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 25, nhip: 15 },
      nhipTheoLoiGiai: true,
      loiGiai: {
        chinh: ['clear_left()', 'move()', 'move()', 'clear_left()', 'move()', 'move()', 'move()'],
        hamCuaEmMoi: [H('clear_left', ['pick()', 'arm_left()', 'drop()', 'arm_right()', 'wait()'])]
      },
      loiGiaiKhac: {
        moTa: 'Tách việc đặt sang trái vào hàm put_left(), clear_left() chỉ nhặt rồi gọi nó',
        baiLam: { chinh: ['clear_left()', 'move()', 'move()', 'clear_left()', 'move()', 'move()', 'move()'] },
        hamCuaEmMoi: [H('put_left', ['arm_left()', 'drop()', 'arm_right()', 'wait()']), H('clear_left', ['pick()', 'put_left()'])]
      },
      loiSai: [
        { moTa: 'Không dọn vật: xe đâm vật chắn lối', baiLam: { chinh: ['move()', 'move()', 'move()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'clear_left() quên xoay tay về: lần nhặt sau tay còn chỉ sang trái', baiLam: { chinh: ['clear_left()', 'move()', 'move()', 'clear_left()', 'move()', 'move()', 'move()'] },
          hamCuaEmMoi: [H('clear_left', ['pick()', 'arm_left()', 'drop()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Viết thẳng từng bước, không gói hàm: quá 10 ô', baiLam: { chinh: ['pick()', 'arm_left()', 'drop()', 'arm_right()', 'wait()', 'move()', 'move()', 'pick()', 'arm_left()', 'drop()', 'arm_right()', 'wait()', 'move()', 'move()', 'move()'] }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Gọi clear_left() mà chưa tạo hàm', baiLam: { chinh: ['clear_left()', 'move()', 'move()', 'clear_left()', 'move()', 'move()', 'move()'] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Việc dọn vật giống nhau ở cả hai chỗ: gói nó thành hàm clear_left().',
        'Dọn xong, nhớ xoay tay về phía trước để lần sau pick() nhặt đúng ô trước mặt.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Đố: khớp lắp ngược', hang: 'bien-the', hamCuaEmCan: [],
      daoChieu: ['xoay'], canhBao: 'Dây khớp xoay đấu ngược',
      deBai: 'Dây khớp xoay bị đấu ngược: arm_left() xoay tay sang phải, arm_right() xoay sang trái. Vật nằm ngay bên trái xe, ô đích nằm ngay trước mặt xe. Sửa chương trình có sẵn để đưa vật tới ô đích.',
      veMaMau: 'Chương trình có sẵn đúng cho một khớp bình thường. Chạy thử, xem tay xoay về phía nào.',
      san: ['.....', '.....', '...D.', '..o..', '.....'],
      batDau: { x: 3, y: 3, huong: 0 },
      maMau: { chinh: TRAI_RA_TRUOC.slice() },
      sao: { o: 10, nhip: 3 },
      loiGiai: { chinh: PHAI_RA_TRUOC.slice() },
      loiGiaiKhac: {
        moTa: 'Gói việc thả vào hàm put(), chỉ gọi một lần',
        baiLam: { chinh: nhieu(['arm_right()', 'arm_down()', 'grab()', 'wait()'], ['arm_up()', 'arm_left()', 'wait()', 'put()']) },
        hamCuaEmMoi: [H('put', T_THA)]
      },
      loiSai: [
        { moTa: 'Không sửa gì: tay xoay sang phải, kẹp vào ô trống', baiLam: { chinh: TRAI_RA_TRUOC.slice() }, phaiCoMa: ['kep-hut', 'chua-dua-vat'] },
        { moTa: 'Chỉ sửa dòng đầu: xoay trái hai lần, tay không về tới trước mặt', baiLam: { chinh: nhieu(['arm_right()', 'arm_down()', 'grab()', 'wait()'], ['arm_up()', 'arm_right()', 'wait()', 'arm_down()', 'release()', 'wait()']) }, phaiCoMa: ['xoay-het-nac', 'chua-dua-vat'] },
        { moTa: 'Sửa đúng bên nhưng quên nâng tay: khớp kẹt', baiLam: { chinh: nhieu(['arm_right()', 'arm_down()', 'grab()', 'wait()'], ['arm_left()', 'wait()', 'arm_down()', 'release()', 'wait()']) }, phaiCoMa: ['tay-xoay-ket', 'chua-dua-vat'] }
      ],
      goiY: ['Thử lệnh arm_left() ở sân thử của Xưởng hàm để xem tay xoay về phía nào.',
        'Muốn tay xoay sang trái thì phải ra lệnh arm_right().']
    }),

    man({
      so: 8, ten: 'Khớp xoay một chiều', hang: 'bien-the', hamGoc: KHAY_KET, hamCuaEmCan: ['turn_right', 'turn_left', 'pick', 'drop'],
      phanCung: KHAY_KET, canhBao: 'Khớp xoay kẹt: không xoay sang phải',
      deBai: 'Khớp xoay kẹt, chỉ còn xoay sang trái. Vật nằm bên phải xe, ô đích nằm ngay trước mặt xe. Đưa vật tới ô đích mà không dùng arm_right().',
      veMaMau: 'Chương trình có sẵn để trống. Tay không xoay sang phải được, nên xe phải tự quay.',
      san: ['.....', '.....', '..D..', '...o.', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 18, nhip: 5 },
      nhipTheoLoiGiai: true,
      loiGiai: { chinh: ['turn_right()', 'pick()', 'turn_left()', 'drop()'] },
      loiGiaiKhac: {
        moTa: 'Gói ba việc đầu vào hàm fetch_right(), chỉ gọi một lần',
        baiLam: { chinh: ['fetch_right()', 'drop()'] },
        hamCuaEmMoi: [H('fetch_right', ['turn_right()', 'pick()', 'turn_left()'])]
      },
      loiSai: [
        { moTa: 'Chương trình để trống: vật vẫn nằm yên', baiLam: { chinh: [] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi arm_right(): khớp hỏng nên lệnh không chạy được', baiLam: { chinh: ['arm_right()', 'pick()', 'arm_left()', 'wait()', 'drop()'] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Quay xe xong không quay lại: đặt vật xuống ô bên phải, không phải ô đích', baiLam: { chinh: ['turn_right()', 'pick()', 'drop()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Nhặt mà không hạ tay: kẹp hụt', baiLam: { chinh: ['turn_right()', 'grab()', 'wait()', 'turn_left()', 'drop()'] }, phaiCoMa: ['kep-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Tay không xoay sang phải được. Xe quay phải thì ô bên phải thành ô trước mặt.',
        'Em đã có pick() và drop() chạy ở ô trước mặt.']
    }),

    man({
      so: 9, ten: 'Quay xe, tay đi theo', hang: 'bien-the', hamCuaEmCan: ['turn_left'],
      deBai: 'Vật nằm bên trái xe, ô đích nằm ngay sau lưng xe. Tay xoay quay theo xe: xe quay thì ô tay chỉ cũng đổi. Đưa vật tới ô đích trong ít nhịp nhất.',
      veMaMau: 'Chương trình có sẵn để trống. Thử quay xe lúc tay đang cầm vật: tay chỉ vào ô nào?',
      san: ['.....', '.....', '.....', '.o...', '..D..'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 10, nhip: 3 },
      loiGiai: { chinh: nhieu(NHAT_TRAI, ['arm_up()', 'right_move()', 'wait()', 'arm_down()', 'release()', 'wait()']) },
      loiGiaiKhac: {
        moTa: 'Dùng turn_left() của em thay cho hai dòng quay trái',
        baiLam: { chinh: nhieu(NHAT_TRAI, ['arm_up()', 'turn_left()', 'arm_down()', 'release()', 'wait()']) }
      },
      loiSai: [
        { moTa: 'Chương trình để trống: vật vẫn nằm yên', baiLam: { chinh: [] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quay xe trước rồi mới nhặt: vẫn thắng nhưng mất bốn nhịp', baiLam: { chinh: ['turn_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_left()', 'wait()', 'arm_down()', 'release()', 'wait()'] }, phaiCoMa: [] },
        { moTa: 'Quay xe sang phải: tay chỉ vào ô bên phải xe lúc đầu', baiLam: { chinh: nhieu(NHAT_TRAI, ['arm_up()', 'left_move()', 'wait()', 'arm_down()', 'release()', 'wait()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quay xe khi tay còn hạ: xe không quay được', baiLam: { chinh: nhieu(NHAT_TRAI, ['right_move()', 'wait()', 'arm_down()', 'release()', 'wait()']) }, phaiCoMa: ['tay-vuong', 'chua-dua-vat'] }
      ],
      goiY: ['Xe quay trái thì ô bên trái xe chuyển về phía sau lưng cũ. Tay đang chỉ sang trái sẽ chỉ theo.',
        'Nâng tay và quay xe có thể chạy chung một nhịp.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Chuyền hàng', hang: 'trum', hamCuaEmCan: ['move', 'pick', 'drop'], taoHam: ['relay'],
      deBai: 'Ba vật nằm bên trái xe, cách nhau hai ô, và mỗi vật có một ô đích bên phải xe, ngay đối diện. Tạo hàm relay() chuyền một vật từ trái sang phải rồi dùng nó. Chương trình chỉ có 10 ô.',
      san: ['.....', '.o.D.', '.....', '.o.D.', '.....', '.o.D.'],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 28, nhip: 20 },
      nhipTheoLoiGiai: true,
      huyHieu: { ma: 'tay-xoay', ten: 'Huy hiệu Tay xoay' },
      loiGiai: {
        chinh: ['relay()', 'move()', 'move()', 'relay()', 'move()', 'move()', 'relay()'],
        hamCuaEmMoi: [H('relay', ['arm_left()', 'pick()', 'arm_right()', 'wait()', 'arm_right()', 'drop()', 'arm_left()', 'wait()'])]
      },
      loiGiaiKhac: {
        moTa: 'Tách relay() thành hai hàm take_left() và give_right()',
        baiLam: { chinh: ['relay()', 'move()', 'move()', 'relay()', 'move()', 'move()', 'relay()'] },
        hamCuaEmMoi: [H('take_left', ['arm_left()', 'pick()', 'arm_right()', 'wait()']), H('give_right', ['arm_right()', 'drop()', 'arm_left()', 'wait()']), H('relay', ['take_left()', 'give_right()'])]
      },
      loiSai: [
        { moTa: 'Không gói hàm: viết thẳng ba chuyến, quá 10 ô', baiLam: { chinh: ['arm_left()', 'pick()', 'arm_right()', 'wait()', 'arm_right()', 'drop()', 'arm_left()', 'wait()', 'move()', 'move()', 'arm_left()', 'pick()'] }, phaiCoMa: ['tran-khung'] },
        { moTa: 'relay() quên xoay tay về: chuyến sau tay không chỉ đúng ô', baiLam: { chinh: ['relay()', 'move()', 'move()', 'relay()', 'move()', 'move()', 'relay()'] },
          hamCuaEmMoi: [H('relay', ['arm_left()', 'pick()', 'arm_right()', 'wait()', 'arm_right()', 'drop()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ xoay một nấc: vật đặt xuống ô trước mặt, không tới ô đích bên phải', baiLam: { chinh: ['relay()', 'move()', 'move()', 'relay()', 'move()', 'move()', 'relay()'] },
          hamCuaEmMoi: [H('relay', ['arm_left()', 'pick()', 'arm_right()', 'wait()', 'drop()', 'arm_left()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên đi lên giữa hai chuyến: tay kẹp vào ô trống', baiLam: { chinh: ['relay()', 'relay()', 'relay()'] },
          hamCuaEmMoi: [H('relay', ['arm_left()', 'pick()', 'arm_right()', 'wait()', 'arm_right()', 'drop()', 'arm_left()', 'wait()'])], phaiCoMa: ['kep-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Ba chuyến chuyền vật đều giống nhau, mà chương trình chỉ có 10 ô.',
        'Một chuyến là: xoay trái, nhặt, xoay về, xoay phải, đặt, xoay về. Giữa hai chuyến xe đi lên hai ô.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

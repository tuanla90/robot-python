/* ============================================================================
   man-kho-hang-them.js — "Robot Chấn Hưng": 4 MÀN MỚI cho mùa 1, gói 4 "Kho hàng", chương 2 `kho-hang` "Chế lệnh: mở kho" (brief SM1-A, 30/10).
   Nghiệm thu độc lập mùa 1 (hoc/ban-giao/nghiem-thu-30-10/nghiem-thu-mua-1.md, Đề xuất 1): chương 2 gói 4 không có màn nào về nút đè.
   Chương mới (lo-trinh-hoc.js xếp chỗ bằng dungChuong, thứ tự: che-xe.1, che-xe.2, che-tay.2, che-tay.1, kho-hang.1, kho-hang.2, kho-hang.3,
   che-tay.6, che-tay.4, kho-hang.4): bốn màn tạo hàm cốt truyện của ngân hàng (put_right, pass_back, swap, grab_back) được viết lại trong lộ trình
   cho dính nút đè (giữ mã, tên và thân hàm; khối "SM1-A" trong lo-trinh-hoc.js); bốn màn mới ở tệp này:
   - kho-hang.1  "Chế lệnh mở lối"     chế set_box() = go_wall(), put_right() (hàm cốt truyện MỚI, có mục Sổ lệnh so-lenh.js); chương trình chính khóa.
   - kho-hang.2  "Mở lối rồi rẽ"       tự viết chương trình chính: set_box(), go_wall() hết hành lang, rẽ trái lên ngách tới cờ.
   - kho-hang.3  "Hai thùng hai cửa"   for i in range(2): set_box(); tới cửa thứ hai rẽ trái lên ngách, rẽ phải tới cờ (mỗi nút giữ một cửa, noi).
     Cờ chỉ tới được qua ô cửa thứ hai (bộ dò của kiem-kho-hang-them.mjs từng bắt đường tắt: nhặt thùng 2 rồi đi thẳng lên ô cờ nằm ngay trên nó).
   - kho-hang.4  "Trùm: ba kho"        ba kho dài ngắn khác nhau: thùng sau lưng (grab_back), đặt lên nút, set_box() cho thùng thứ hai, rẽ lên cờ.
     Trùm mang huy hiệu che-tay (hình có sẵn; che-tay.10 cất). Số nhịp của trùm tính theo sân dài nhất (mặc định cham.js, không nhipTheo 'tong'):
     đếm cứng dư bước (húc tường) vẫn tới cờ nhưng vượt ngưỡng nhịp ở kho dài nhất nên không được 3 sao; đếm đúng một kho thì hụt ở kho khác.
   Mã là mã MỚI (không trùng màn nào trong ngân hàng, kể cả màn đã cất).

   Robot như chương nut-de: xe hai bánh + tay kẹp + cảm biến khoảng cách phía trước (front_clear). Gói 4 đứng trước gói Bánh lùi: KHÔNG lệnh lùi,
   không left_clear / right_clear, không tay xoay, không biến, không hàm có tham số (kiem-lo-trinh.mjs, kiem-kho-hang-them.mjs).
   Kho lúc này: u_turn() còn là bản hai lần turn_right() (2 nhịp); pick() / drop() 2 nhịp; put_right() 6 nhịp, pass_back() 8 nhịp, grab_back() 6 nhịp.
   Luật nút đè: xem đầu man-nut-de.js (M bật khi xe hay thùng nằm trên; C mở khi nút bật; noi = mỗi nút giữ cửa nào).
   Số ô (sao.o) của máy chấm tính cả thân các hàm được gọi, nên gọi hàm đã chế không ít ô hơn viết thẳng: các màn này KHÔNG ép dùng hàm bằng sao ô
   (chương không giới thiệu khái niệm mới; kiem-lach-mua-1.mjs chỉ ép ở màn taoHam, chương trình chính khóa).

   Sao: sao.o / sao.nhip đo bằng cham.js trên lời giải (kiem-kho-hang-them.mjs so khớp đúng từng số).
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manKhoHangThem, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên. Xe quay phải thì "bên phải xe" là ô phía dưới.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'front_clear'];

  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }

  /** Trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    m.chuong = 'kho-hang';
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice();
    m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.nhipTheoLoiGiai = true;
    if (Array.isArray(m.san[0]) && !Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    return ManHoc.chuanHoa(m);
  }

  var T_OPEN_WAY = ['go_wall()', 'put_right()'];
  var C_1 = ['set_box()', 'go_wall()'];
  var DUOI = ['go_wall()', 'turn_left()', 'go_wall()', 'turn_right()', 'go_wall()'];      // đoạn đường cuối của kho-hang.3: tới cửa 2, rẽ trái lên ngách, rẽ phải tới cờ
  var L_2 = ['set_box()', 'go_wall()', 'turn_left()', 'go_wall()'];
  var L_3 = FOR(2, ['set_box()']).concat(DUOI);
  var DAU_4 = ['grab_back()', 'turn_right()', 'drop()', 'turn_left()'];
  var L_4 = DAU_4.concat(['set_box()', 'go_wall()', 'turn_left()', 'go_wall()']);

  var DS = [
    man({
      so: 1, ten: 'Chế lệnh mở lối', chinhCoDinh: true,
      hamCuaEmCan: ['go_wall', 'put_right'], taoHam: ['set_box'],
      deBai: 'Trong kho, việc "đi tới thùng rồi đặt nó lên nút bên phải" lặp đi lặp lại. Chế lệnh set_box() làm đúng việc đó: đi tới trước thùng, đặt thùng sang ô bên phải xe. Chương trình chính gọi set_box() rồi go_wall() qua cửa C tới cờ.',
      veMaMau: 'Chương trình chính bị khóa: set_box() rồi go_wall(). Mở Xưởng hàm, tạo set_box() bằng hai lệnh em đã có, rồi bấm Chạy.',
      san: ['#########', '#...oC.F#', '###M#####', '#########'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: C_1.slice() },
      sao: { o: 27, nhip: 12 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [H('set_box', T_OPEN_WAY)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('set_box', ['# tới thùng, đặt lên nút'].concat(T_OPEN_WAY))] },
      loiSai: [
        { moTa: 'set_box() chỉ đi tới thùng, chưa đặt: cửa C vẫn đóng', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('set_box', ['go_wall()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Nhặt thùng rồi mang theo: không có gì đè nút', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('set_box', ['go_wall()', 'pick()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chuyền thùng ra sau lưng: thùng không nằm trên M', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('set_box', ['go_wall()', 'pass_back()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi set_box() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Thân hàm chỉ cần hai dòng: một lệnh đi, một lệnh đặt.', 'go_wall() rồi put_right(). Hàm này còn dùng lại ở các màn sau.']
    }),

    man({
      so: 2, ten: 'Mở lối rồi rẽ',
      hamCuaEmCan: ['set_box', 'go_wall', 'turn_left'],
      deBai: 'Thùng chắn trước cửa C, nút M ở dưới ô đứng trước thùng. Cờ nằm trong ngách phía trên, cuối hành lang. Dùng set_box() em vừa chế để mở cửa, đi hết hành lang rồi rẽ trái lên ngách tới cờ.',
      veMaMau: 'Chương trình mẫu mới mở cửa. Viết tiếp đoạn đường: đi tới tường rồi rẽ.',
      san: ['#########', '######F##', '######.##', '#..oC..##', '##M######', '#########'],
      batDau: { x: 1, y: 3, huong: 1 },
      maMau: { chinh: ['set_box()'] },
      sao: { o: 29, nhip: 14 },
      loiGiai: { chinh: L_2.slice() },
      loiGiaiKhac: { moTa: 'Cùng đường đi, thêm một dòng chú thích', baiLam: { chinh: ['# mở cửa rồi đi hết hành lang'].concat(L_2) } },
      loiSai: [
        { moTa: 'Mở cửa rồi đi thẳng, không rẽ: xe dừng cuối hành lang', baiLam: { chinh: ['set_box()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ phải thay vì rẽ trái: bên phải là tường', baiLam: { chinh: ['set_box()', 'go_wall()', 'turn_right()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không mở cửa, đi thẳng: thùng chắn, xe đứng yên', baiLam: { chinh: ['go_wall()', 'turn_left()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['set_box() tới thùng, đặt thùng lên M, cửa mở; rồi go_wall() đi tới cuối hành lang.', 'Ngách ở bên trái cuối hành lang: turn_left() rồi go_wall() là tới cờ.']
    }),

    man({
      so: 3, ten: 'Hai thùng hai cửa',
      hamCuaEmCan: ['set_box', 'go_wall', 'turn_left', 'turn_right'],
      noi: [{ nut: { x: 1, y: 4 }, cua: [{ x: 3, y: 3 }] }, { nut: { x: 4, y: 4 }, cua: [{ x: 6, y: 3 }] }],
      deBai: 'Hai thùng, hai nút M, hai cửa C nối tiếp: mỗi nút giữ cánh cửa ngay sau thùng của nó. Ngách lên nằm ngay trên cửa thứ hai, cờ ở bên phải ngách. Dùng set_box() cho từng thùng, rồi đi tới cửa thứ hai, rẽ trái lên ngách, rẽ phải tới cờ.',
      veMaMau: 'Chương trình mẫu mở được cửa thứ nhất. Hai thùng làm giống nhau: lặp bằng for, rồi viết đoạn đường cuối.',
      san: ['#########', '#########', '######.F#', '#.oC.oC##', '#M##M####', '#########'],
      batDau: { x: 1, y: 3, huong: 1 },
      maMau: { chinh: ['set_box()'] },
      sao: { o: 32, nhip: 21 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# mỗi thùng một cửa'].concat(L_3) } },
      loiSai: [
        { moTa: 'Chỉ mở một cửa rồi đi: xe dừng trước thùng thứ hai', baiLam: { chinh: L_2.slice() }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Mở hai cửa nhưng quên đoạn rẽ cuối: xe dừng ở cửa thứ hai', baiLam: { chinh: FOR(2, ['set_box()']).concat(['go_wall()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ ngược bên: rẽ phải trước rồi rẽ trái, xe nhìn vào tường', baiLam: { chinh: FOR(2, ['set_box()']).concat(['go_wall()', 'turn_right()', 'go_wall()', 'turn_left()', 'go_wall()']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['set_box() tự dừng trước thùng dù thùng gần hay xa, nên hai lượt viết giống nhau.', 'Qua cửa thứ hai là hết đường: rẽ trái, đi lên, rẽ phải, đi tới cờ.']
    }),

    man({
      so: 4, ten: 'Trùm: ba kho', huyHieu: { ma: 'che-tay', ten: 'Huy hiệu Chế lệnh mở kho' },
      hamCuaEmCan: ['grab_back', 'turn_right', 'drop', 'turn_left', 'set_box', 'go_wall'],
      noi: [
        [{ nut: { x: 2, y: 4 }, cua: [{ x: 3, y: 3 }] }, { nut: { x: 4, y: 4 }, cua: [{ x: 6, y: 3 }] }],
        [{ nut: { x: 2, y: 4 }, cua: [{ x: 3, y: 3 }] }, { nut: { x: 5, y: 4 }, cua: [{ x: 7, y: 3 }] }],
        [{ nut: { x: 2, y: 4 }, cua: [{ x: 3, y: 3 }] }, { nut: { x: 4, y: 4 }, cua: [{ x: 6, y: 3 }] }]
      ],
      deBai: 'Ba kho dài ngắn khác nhau. Ở kho nào cũng vậy: một thùng nằm sau lưng xe và nút M ở bên phải xe giữ cửa thứ nhất; sau cửa là thùng thứ hai với nút giữ cửa thứ hai; hết hành lang thì rẽ trái lên cờ. Một chương trình phải tới cờ ở cả ba kho.',
      veMaMau: 'Chương trình mẫu đặt được thùng sau lưng lên nút. Viết tiếp cho thùng thứ hai và đoạn rẽ cuối; đừng đếm bước, mỗi kho một khác.',
      san: [
        ['#############', '#########F###', '#########.###', '#o.C.oC...###', '##M#M########', '#############'],
        ['#############', '#############', '###########F#', '#o.C..oC....#', '##M##M#######', '#############'],
        ['#############', '#######F#####', '#######.#####', '#o.C.oC.#####', '##M#M########', '#############']
      ],
      batDau: { x: 2, y: 3, huong: 1 },
      maMau: { chinh: DAU_4.slice() },
      sao: { o: 38, nhip: 27 },
      loiGiai: { chinh: L_4.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: DAU_4.concat(['# thùng thứ hai rồi rẽ lên cờ'], L_4.slice(4)) } },
      loiSai: [
        { moTa: 'Bỏ thùng sau lưng, gọi set_box() ngay: cửa thứ nhất còn đóng, tay kẹp vào cửa', baiLam: { chinh: ['set_box()', 'go_wall()', 'turn_left()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đặt thùng lên nút rồi quên quay lại: set_box() nhìn xuống nút, nhặt lại thùng', baiLam: { chinh: ['grab_back()', 'turn_right()', 'drop()', 'set_box()', 'go_wall()', 'turn_left()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đếm bước theo kho đầu: kho giữa dài hơn, xe rẽ sớm vào tường', baiLam: { chinh: DAU_4.concat(['set_box()'], FOR(5, ['move()']), ['turn_left()', 'move()', 'move()']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Thùng sau lưng: grab_back() nhặt rồi quay về, tay còn cầm thùng; quay phải, drop() lên M, quay lại.', 'Thùng thứ hai: set_box(). Rồi go_wall(), turn_left(), go_wall() ở mọi kho.']
    })
  ];

  ManHoc.manKhoHangThem = DS;
  if (laNode) module.exports = ManHoc;
})();

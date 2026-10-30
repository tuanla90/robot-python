/* ============================================================================
   man-goi-6-7-them.js — "Robot Chấn Hưng": MÀN MỚI cho mùa 1, gói 6 "Tay xoay" (brief SM1-C, 30/10).
   Nghiệm thu độc lập mùa 1 (hoc/ban-giao/nghiem-thu-30-10/nghiem-thu-mua-1.md, Đề xuất 7): làm mượt chỗ nhảy 3 → 15 nhịp trước tay-xoay.6 "Dọn lối",
   bớt chỗ nhảy ô 16 → 45 trước che-tay-xoay.5 "Đổi chỗ hai bên", và cho gói 6 dùng lại for / while (gói 2, 3).
   - tay-xoay.11 "Vật chắn trước mặt" (chương tay-xoay): nhặt vật chắn lối, đặt sang hốc bên trái, rồi go_wall() tới cờ (while của gói 3).
   - tay-xoay.12 "Dọn hai vật" (chương tay-xoay): hai vật liền nhau chắn lối, hốc bên PHẢI; viết thẳng quá 10 ô nên phải dùng vòng for (gói 2).
     Hai màn đệm (nhịp 5 → 9 → 13 → 15) đứng trước tay-xoay.6 (chế clear_left, chương trình chính khóa từ SM1-C).
   - che-tay-xoay.11 "Hai đầu hành lang" (chương che-tay-xoay): chuyền vật trái sang phải, go_wall() tới cuối hành lang, chuyền vật phải sang trái;
     dùng cả bốn hàm em vừa chế (pick_left, drop_right, pick_right, drop_left): đệm ô 26 → 38 → 45 trước che-tay-xoay.5.
   - che-tay-xoay.12 "Dọn hàng sang trái" (chương che-tay-xoay): go_wall() tới hàng ba vật, vòng for ba lần pick(), drop_left(), move();
     đệm nhịp 12 → 15 → 20 trước che-tay-xoay.6 (sort_two: một vật sang trái, một vật sang phải).
   Robot: xe hai bánh, tay xoay, CẢM BIẾN khoảng cách (front_clear cho go_wall(); gói 3 đã học). Mã là mã MỚI (không trùng màn nào, kể cả màn đã cất).
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manGoi67Them, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release', 'front_clear'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function lap(n, ds) { return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; })); }

  /** Trường chung của gói 6 (như man-tay-xoay.js / man-che-tay-xoay.js) + cảm biến khoảng cách. */
  function man(chuong, m) {
    m.chuong = chuong;
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'xoay', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = KHAY.slice();
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if', 'while'];
    if (!m.mucTieu) m.mucTieu = 'dua-vat';
    return ManHoc.chuanHoa(m);
  }

  var L_11 = ['pick()', 'arm_left()', 'drop()', 'arm_right()', 'go_wall()'];
  var THAN_12 = ['pick()', 'arm_right()', 'drop()', 'arm_left()', 'wait()', 'move()'];
  var L_12 = lap(2, THAN_12).concat(['move()']);
  var L_C11 = ['pick_left()', 'drop_right()', 'go_wall()', 'pick_right()', 'drop_left()'];
  var L_C12 = ['go_wall()'].concat(lap(3, ['pick()', 'drop_left()', 'move()']));

  var DS = [
    man('tay-xoay', {
      so: 11, ten: 'Vật chắn trước mặt', hang: 'bien-the', mucTieu: 'bong-mo', hamCuaEmCan: ['pick', 'drop', 'go_wall'],
      deBai: 'Một vật chắn ngay trước mặt xe. Bên trái xe có một hốc trống. Nhặt vật, xoay tay đặt nó vào hốc bên trái như vật mờ, rồi đi tới cuối hành lang, đúng chỗ xe mờ.',
      san: ['####', '##.#', '##.#', '##.#', '##.#', '##o#', '#..#', '####'],
      batDau: { x: 2, y: 6, huong: 0 },
      bongMo: { x: 2, y: 1, huong: 0, vat: [{ x: 1, y: 6 }] },
      maMau: { chinh: ['go_wall()'] },
      sao: { o: 20, nhip: 9 },
      loiGiai: { chinh: L_11.slice() },
      loiGiaiKhac: { moTa: 'Đếm từng ô thay cho go_wall()', baiLam: { chinh: ['pick()', 'arm_left()', 'drop()', 'arm_right()', 'move()', 'move()', 'move()', 'move()', 'move()'] } },
      loiSai: [
        { moTa: 'Chưa dọn vật: go_wall() không đi được ô nào', baiLam: { chinh: ['go_wall()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên xoay tay: vật đặt lại ngay trước mặt', baiLam: { chinh: ['pick()', 'drop()', 'go_wall()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xoay tay sang phải: bên phải là tường, không đặt được', baiLam: { chinh: ['pick()', 'arm_right()', 'drop()', 'go_wall()'] }, phaiCoMa: ['tha-bi-chan', 'lech-bong-mo'] },
        { moTa: 'Cầm vật đi luôn tới cuối hành lang: hốc bên trái vẫn trống', baiLam: { chinh: ['pick()', 'go_wall()'] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Mã mẫu chưa chạy được: vật trước mặt làm front_clear() trả False.', 'pick(), arm_left(), drop(), xoay tay về trước, rồi go_wall().']
    }),
    man('tay-xoay', {
      so: 12, ten: 'Dọn hai vật', hang: 'bien-the', mucTieu: 'bong-mo', hamCuaEmCan: ['pick', 'drop', 'move'],
      deBai: 'Hai vật nằm liền nhau chắn lối. Mỗi lần nhặt, ô bên phải xe là một hốc trống. Dọn cả hai vật vào hốc như vật mờ rồi tới chỗ xe mờ. Viết thẳng từng bước thì quá 10 ô: dùng vòng for.',
      san: ['#####', '##.##', '##o##', '##o.#', '##..#', '#####'],
      batDau: { x: 2, y: 4, huong: 0 },
      bongMo: { x: 2, y: 1, huong: 0, vat: [{ x: 3, y: 4 }, { x: 3, y: 3 }] },
      maMau: { chinh: [] },
      sao: { o: 21, nhip: 13 },
      loiGiai: { chinh: L_12.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# dọn hai vật'].concat(L_12) } },
      loiSai: [
        { moTa: 'Viết thẳng hai lần: quá 10 ô', baiLam: { chinh: THAN_12.concat(THAN_12, ['move()']) }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Quên xoay tay về trước: lần sau tay kẹp vào hốc trống', baiLam: { chinh: lap(2, ['pick()', 'arm_right()', 'drop()', 'move()']).concat(['move()']) }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên bước cuối tới chỗ xe mờ', baiLam: { chinh: lap(2, THAN_12) }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Dọn vật đầu rồi cầm vật sau đi luôn: hốc thứ hai còn trống', baiLam: { chinh: THAN_12.concat(['pick()', 'move()', 'move()']) }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Hai lần dọn giống hệt nhau: nhặt, xoay phải, đặt, xoay về, tiến một ô.', 'Xoay tay về trước rồi wait() cho nhịp trôi, lần nhặt sau mới đúng ô trước mặt.']
    }),
    man('che-tay-xoay', {
      so: 11, ten: 'Hai đầu hành lang', hang: 'luyen', hamCuaEmCan: ['pick_left', 'drop_right', 'pick_right', 'drop_left', 'go_wall'],
      deBai: 'Đầu hành lang: vật bên trái xe, ô đích bên phải. Cuối hành lang thì ngược lại: vật bên phải, ô đích bên trái. Dùng bốn lệnh em đã chế và go_wall() để đưa cả hai vật vào ô đích.',
      san: ['#####', '#D.o#', '##.##', '##.##', '##.##', '#o.D#', '#####'],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 38, nhip: 11 },
      loiGiai: { chinh: L_C11.slice() },
      loiGiaiKhac: { moTa: 'Đếm từng ô thay cho go_wall()', baiLam: { chinh: ['pick_left()', 'drop_right()', 'move()', 'move()', 'move()', 'move()', 'pick_right()', 'drop_left()'] } },
      loiSai: [
        { moTa: 'Quên đi tới cuối hành lang: tay nhặt lại vật vừa đặt bên phải', baiLam: { chinh: ['pick_left()', 'drop_right()', 'pick_right()', 'drop_left()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Làm như nhau ở hai đầu: cuối hành lang tay kẹp vào ô đích trống bên trái', baiLam: { chinh: ['pick_left()', 'drop_right()', 'go_wall()', 'pick_left()', 'drop_right()'] }, phaiCoMa: ['kep-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Lệnh nhặt và lệnh đặt nào cũng xoay tay về trước khi xong.', 'Giữa hai đầu: go_wall() dừng ngay trước tường cuối hành lang.']
    }),
    man('che-tay-xoay', {
      so: 12, ten: 'Dọn hàng sang trái', hang: 'bien-the', hamCuaEmCan: ['pick', 'drop_left', 'move', 'go_wall'],
      deBai: 'Cuối hành lang có ba vật xếp thẳng hàng. Đi tới hàng vật, rồi đưa mỗi vật sang ô đích bên trái, ngay cạnh chỗ xe đứng nhặt nó. Ba lần làm giống hệt nhau: dùng vòng for.',
      san: ['#####', '##o##', '#Do##', '#Do##', '#D.##', '##.##', '##.##', '#####'],
      batDau: { x: 2, y: 6, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 22, nhip: 15 },
      loiGiai: { chinh: L_C12.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# ba vật sang trái'].concat(L_C12) } },
      loiSai: [
        { moTa: 'Quên đi tới hàng vật: tay kẹp vào ô trống', baiLam: { chinh: lap(3, ['pick()', 'drop_left()', 'move()']) }, phaiCoMa: ['kep-hut', 'chua-dua-vat'] },
        { moTa: 'Quên tiến lên: lần nhặt sau kẹp vào ô trống', baiLam: { chinh: ['go_wall()'].concat(lap(3, ['pick()', 'drop_left()'])) }, phaiCoMa: ['kep-hut', 'chua-dua-vat'] },
        { moTa: 'Đặt sang phải: bên phải là tường', baiLam: { chinh: ['go_wall()'].concat(lap(3, ['pick()', 'drop_right()', 'move()'])) }, phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] },
        { moTa: 'Lặp hai lần: vật cuối còn nằm giữa hành lang', baiLam: { chinh: ['go_wall()'].concat(lap(2, ['pick()', 'drop_left()', 'move()'])) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['go_wall() dừng ngay trước vật đầu tiên: vật cũng làm front_clear() trả False.', 'Mỗi lượt: nhặt vật trước mặt, đặt sang trái, tiến vào ô vừa trống.']
    })
  ];

  ManHoc.manGoi67Them = DS;
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

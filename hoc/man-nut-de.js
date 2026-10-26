/* ============================================================================
   man-nut-de.js — "Robot Chấn Hưng": CHƯƠNG `nut-de` · NÚT ĐÈ (10 màn). Mùa 1, gói 4 "Kho hàng", chương 1 (KE-HOACH-MUA-1.md).
   Đứng trước chương `kho-hang` (hàm cho kho). Robot: xe hai bánh + tay kẹp + cảm biến khoảng cách phía trước (front_clear), như khoang-cach.9.

   Luật nút đè (san-hoc.js, phần nút đè / cửa; lõi KHÔNG đổi):
   - `M` nút đè trên sàn: xe hay thùng (vật `o`) đang nằm trên M thì nút "bật". Xe đi qua được ô M (ô sàn); thùng đặt lên M thì chiếm ô như mọi vật.
   - `C` cửa đóng lúc đầu: mở khi có nút bật; hết nút bật thì đóng lại. `c` cửa mở lúc đầu: ngược lại, nút bật thì ĐÓNG.
   - Cửa đổi ở CUỐI nhịp. Cửa đang đóng chặn xe và cảm biến như tường (go_wall() dừng trước cửa đóng). Cửa không đóng xuống ô đang có xe hay vật.
   - Không khai `noi`: mọi nút điều khiển mọi cửa. Màn nhiều cửa khai `noi` = [{ nut, cua }]: mỗi nút chỉ giữ cánh cửa ngay sau nó (đề bài nói rõ, sân không vẽ dây nối).

   Ràng buộc mùa 1 (kiem-lo-trinh.mjs, kiem-nut-de.mjs): không lệnh lùi, không left_clear / right_clear, không tay xoay, không biến, không hàm có tham số.
   Hàm của em dùng được (đã chế ở gói 1–3): move, turn_right, turn_left, u_turn (= hai lần turn_right, 2 nhịp), corner, stair, two, pick, drop, carry,
   side, sweep, row, bend_left, bend_right, go_wall, safe_move, face_open. Chương này KHÔNG tạo hàm của em mới (màn 9 sửa một hàm của màn).
     pick() = arm_down(), grab(), wait(), arm_up(), wait()      2 nhịp, nhặt thùng ở ô trước mặt
     drop() = arm_down(), release(), wait(), arm_up(), wait()   2 nhịp, đặt thùng xuống ô trước mặt
     carry() = pick(), move(), turn_left(), drop(), turn_right()

   Đường cong (KE-HOACH-MUA-1.md, "Đường cong học và recall"): 1–3 làm quen, 4–6 luyện, 7–9 biến thể (đố, sửa hàm, ghép go_wall / for), 10 trùm ba sân.
   Số dòng lời giải và số nhịp mỗi màn không quá 1,5 lần màn trước (trừ trùm): kiem-nut-de.mjs kiểm.
   Sao: sao.o / sao.nhip = số ô / số nhịp của lời giải đo bằng cham.js (kiem-nut-de.mjs so khớp đúng từng số).

   Tệp này KHÔNG tự thêm màn vào ManHoc (chương nut-de chưa có trong thu-tu-chuong.js): nó để danh sách ở ManHoc.manNutDe,
   lo-trinh-hoc.js chèn chương vào lộ trình (gói kho-hang, chương 1) rồi mới ManHoc.them.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'front_clear'];

  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    m.chuong = 'nut-de';
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice();
    m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.nhipTheoLoiGiai = true;
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ------------------------------------------------------------ 1–3: làm quen */
    man({
      so: 1, ten: 'Thùng giữ cửa',
      hamCuaEmCan: ['carry', 'move', 'pick'],
      deBai: 'Cửa C đang đóng. Nút đè M nằm bên trái thùng gỗ: có thùng nằm trên M thì cửa C mở. Dùng carry() để đặt thùng lên M, rồi đi qua cửa tới cờ.',
      veMaMau: 'Chạy thử: thùng chắn đường và cửa C còn đóng. carry() nhặt thùng, tiến một ô, đặt thùng sang bên trái.',
      san: ['#####', '##F##', '##.##', '##C##', '#Mo##', '##.##', '#####'],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: ['move()', 'move()', 'move()'] },
      sao: { o: 26, nhip: 10 },
      loiGiai: { chinh: ['carry()', 'move()', 'move()', 'move()'] },
      loiGiaiKhac: { moTa: 'Cùng đường đi, thêm một dòng chú thích', baiLam: { chinh: ['carry()', '# cửa đã mở', 'move()', 'move()', 'move()'] } },
      loiSai: [
        { moTa: 'Nhặt thùng mang theo, không đặt lên M: cửa C vẫn đóng', baiLam: { chinh: ['pick()', 'move()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đặt thùng lên M rồi đứng yên, chưa tới cờ', baiLam: { chinh: ['carry()', 'move()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['carry() đặt thùng sang bên trái xe, đúng ô M.', 'Thùng nằm trên M thì cửa C mở. Đi thẳng ba ô tới cờ.']
    }),

    man({
      so: 2, ten: 'Tự đặt lên nút',
      hamCuaEmCan: ['pick', 'drop', 'turn_right', 'turn_left', 'go_wall'],
      deBai: 'Nút M nằm ngay dưới xe, thùng ở trước mặt. Nhặt thùng, quay xuống đặt nó lên M cho cửa C mở, rồi quay lại và dùng go_wall() để đi qua cửa tới cờ.',
      veMaMau: 'Chạy thử: go_wall() dừng ngay trước cửa C, vì cảm biến thấy cửa đóng như tường.',
      san: ['#######', '#.oCF##', '#M#####', '#######'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['pick()', 'go_wall()'] },
      sao: { o: 24, nhip: 9 },
      loiGiai: { chinh: ['pick()', 'turn_right()', 'drop()', 'turn_left()', 'go_wall()'] },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['pick()', 'turn_right()', '# đặt thùng lên nút', 'drop()', 'turn_left()', 'go_wall()'] } },
      loiSai: [
        { moTa: 'Mang thùng theo, không đặt lên M: go_wall() dừng trước cửa đóng', baiLam: { chinh: ['pick()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên quay lại sau khi đặt: go_wall() nhìn xuống thùng nên đứng yên', baiLam: { chinh: ['pick()', 'turn_right()', 'drop()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['drop() đặt thùng vào ô trước mặt: quay xuống trước rồi mới drop().', 'Cửa mở rồi thì go_wall() đi qua cửa, tới cờ.']
    }),

    man({
      so: 3, ten: 'Thùng cuối hành lang',
      hamCuaEmCan: ['go_wall', 'pick', 'drop', 'turn_right', 'turn_left'],
      deBai: 'Thùng nằm xa xe. Dùng go_wall() để dừng ngay trước thùng, nhặt nó, đặt lên nút M ở dưới, rồi đi qua cửa C tới cờ.',
      veMaMau: 'go_wall() dừng trước thùng vì cảm biến thấy thùng chắn. Viết tiếp từ đó.',
      san: ['#########', '#...o.CF#', '###M#####', '#########'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['go_wall()'] },
      sao: { o: 25, nhip: 12 },
      loiGiai: { chinh: ['go_wall()', 'pick()', 'turn_right()', 'drop()', 'turn_left()', 'go_wall()'] },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['go_wall()', 'pick()', '# đặt thùng lên M', 'turn_right()', 'drop()', 'turn_left()', 'go_wall()'] } },
      loiSai: [
        { moTa: 'Đặt thùng xuống ngay chỗ cũ: thùng lại chắn đường, cửa vẫn đóng', baiLam: { chinh: ['go_wall()', 'pick()', 'drop()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quay nhầm sang trái nên thả vào tường', baiLam: { chinh: ['go_wall()', 'pick()', 'turn_left()', 'drop()', 'turn_right()', 'go_wall()'] }, phaiCoMa: ['tha-bi-chan'] }
      ],
      goiY: ['Thùng cũng chắn cảm biến: go_wall() dừng ngay trước thùng.', 'Nút M nằm dưới ô xe dừng: quay phải là nhìn xuống M.']
    }),

    /* ------------------------------------------------------------ 4–6: luyện */
    man({
      so: 4, ten: 'Ngách đối diện',
      hamCuaEmCan: ['go_wall', 'turn_left', 'turn_right', 'pick', 'u_turn', 'drop'],
      deBai: 'Thùng nằm trong ngách phía trên hành lang, nút M ở ngách phía dưới, ngay đối diện. Đi tới trước cửa C, nhặt thùng ở ngách trên, quay đầu đặt nó lên M, rồi đi qua cửa tới cờ.',
      veMaMau: 'go_wall() đã đưa xe tới trước cửa C và nhặt được thùng. Viết tiếp: quay đầu, đặt, quay về hướng cửa.',
      san: ['########', '###o####', '#...CF##', '###M####', '########'],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: { chinh: ['go_wall()', 'turn_left()', 'pick()'] },
      sao: { o: 28, nhip: 12 },
      loiGiai: { chinh: ['go_wall()', 'turn_left()', 'pick()', 'u_turn()', 'drop()', 'turn_left()', 'go_wall()'] },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['go_wall()', 'turn_left()', 'pick()', '# quay đầu nhìn xuống M', 'u_turn()', 'drop()', 'turn_left()', 'go_wall()'] } },
      loiSai: [
        { moTa: 'Nhặt thùng rồi đặt lại vào ngách cũ: cửa vẫn đóng', baiLam: { chinh: ['go_wall()', 'turn_left()', 'pick()', 'drop()', 'turn_right()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đặt lên M nhưng quên quay về hướng cửa: go_wall() nhìn xuống thùng', baiLam: { chinh: ['go_wall()', 'turn_left()', 'pick()', 'u_turn()', 'drop()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Cửa đóng làm go_wall() dừng đúng chỗ, giữa hai ngách.', 'Đang nhìn lên thì u_turn() làm xe nhìn xuống M. Đặt xong, turn_left() đưa mũi xe về phía cửa.']
    }),

    man({
      so: 5, ten: 'Hai nút hai cửa',
      hamCuaEmCan: ['pick', 'move', 'turn_right', 'drop', 'turn_left', 'go_wall'],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 4, y: 1 }] }, { nut: { x: 3, y: 2 }, cua: [{ x: 5, y: 1 }] }],
      deBai: 'Hai cửa C nối tiếp nhau. Ở sân này mỗi nút chỉ giữ một cửa: nút M bên trái giữ cửa thứ nhất, nút M bên phải giữ cửa thứ hai. Đặt hai thùng lên hai nút rồi đi qua cả hai cửa tới cờ.',
      veMaMau: 'Chương trình mẫu đặt được một thùng: cửa thứ hai vẫn đóng. Hai thùng làm giống nhau: lặp bằng for.',
      san: ['#########', '#.ooCCF##', '##MM#####', '#########'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()', 'go_wall()'] },
      sao: { o: 26, nhip: 17 },
      loiGiai: { chinh: FOR(2, ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()']).concat(['go_wall()']) },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# mỗi thùng một nút'].concat(FOR(2, ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()']), ['go_wall()']) } },
      loiSai: [
        { moTa: 'Chỉ đặt một thùng: cửa thứ hai vẫn đóng', baiLam: { chinh: ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết thẳng hai lần thay cho for: quá 10 ô', baiLam: { chinh: ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()', 'pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()', 'go_wall()'] }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Quên turn_left() trong vòng lặp: lượt hai nhặt lại thùng trên nút, cửa thứ nhất đóng', baiLam: { chinh: FOR(2, ['pick()', 'move()', 'turn_right()', 'drop()']).concat(['go_wall()']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Mỗi thùng: nhặt, tiến vào chỗ thùng vừa trống, quay xuống đặt lên nút, quay lại.', 'Lặp hai lần rồi go_wall() qua hai cửa.']
    }),

    man({
      so: 6, ten: 'Kho dài',
      hamCuaEmCan: ['go_wall', 'pick', 'turn_right', 'drop', 'turn_left', 'move'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 5, y: 1 }] }, { nut: { x: 7, y: 2 }, cua: [{ x: 9, y: 1 }] }],
      deBai: 'Hai thùng nằm cách xa nhau, mỗi thùng có một nút M ở dưới chỗ đứng nhặt. Mỗi nút giữ cánh cửa C ngay sau thùng của nó. Lặp: đi tới trước thùng, đặt thùng lên nút; xong hai lượt thì đi tới cờ.',
      veMaMau: 'Chương trình mẫu làm đúng một lượt. Khoảng cách hai lượt khác nhau nên không đếm bước: để go_wall() dừng trước thùng.',
      san: ['############', '#...oC..oCF#', '###M###M####', '############'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['go_wall()', 'pick()', 'turn_right()', 'drop()', 'turn_left()', 'go_wall()'] },
      sao: { o: 26, nhip: 21 },
      loiGiai: { chinh: FOR(2, ['go_wall()', 'pick()', 'turn_right()', 'drop()', 'turn_left()']).concat(['go_wall()']) },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: FOR(2, ['go_wall()', 'pick()', 'turn_right()', 'drop()', 'turn_left()']).concat(['# hai cửa đã mở', 'go_wall()']) } },
      loiSai: [
        { moTa: 'Lặp như màn trước, tiến đúng một ô: lượt hai nhặt hụt', baiLam: { chinh: FOR(2, ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()']).concat(['go_wall()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên go_wall() cuối: hai cửa đã mở nhưng xe đứng yên', baiLam: { chinh: FOR(2, ['go_wall()', 'pick()', 'turn_right()', 'drop()', 'turn_left()']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['go_wall() dừng trước thùng dù thùng gần hay xa, và đi qua cửa đã mở.', 'Thân vòng lặp: go_wall(), pick(), turn_right(), drop(), turn_left().']
    }),

    /* ------------------------------------------------------------ 7–9: biến thể */
    man({
      so: 7, ten: 'Đố: xe tự đè nút',
      hamCuaEmCan: ['go_wall', 'turn_right', 'move', 'u_turn', 'pick', 'turn_left', 'drop'],
      deBai: 'Xe tự lăn lên nút M thì cửa C cũng mở. Vì sao chương trình có sẵn vẫn không tới được cờ? Sửa lại: dùng thùng ở dưới xe để giữ cửa thay cho xe.',
      veMaMau: 'Chạy thử và nhìn cửa C lúc xe rời khỏi nút M.',
      san: ['########', '#...CF##', '#o#M####', '########'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['go_wall()', 'turn_right()', 'move()', 'u_turn()', 'move()', 'turn_right()', 'go_wall()'] },
      sao: { o: 27, nhip: 12 },
      loiGiai: { chinh: ['turn_right()', 'pick()', 'turn_left()', 'go_wall()', 'turn_right()', 'drop()', 'turn_left()', 'go_wall()'] },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['turn_right()', 'pick()', 'turn_left()', 'go_wall()', 'turn_right()', '# thùng giữ cửa thay xe', 'drop()', 'turn_left()', 'go_wall()'] } },
      loiSai: [
        { moTa: 'Xe tự đứng lên M rồi rời đi: cửa đóng lại ngay', baiLam: { chinh: ['go_wall()', 'turn_right()', 'move()', 'u_turn()', 'move()', 'turn_right()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đặt thùng lên M rồi lại nhặt lên mang theo: cửa đóng lại', baiLam: { chinh: ['turn_right()', 'pick()', 'turn_left()', 'go_wall()', 'turn_right()', 'drop()', 'pick()', 'turn_left()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Cửa chỉ mở khi có thứ ĐANG nằm trên M. Xe rời M là cửa đóng.', 'Nhặt thùng ở dưới xe trước, rồi mới đi tới chỗ nút.']
    }),

    man({
      so: 8, ten: 'Đố: cửa ngược',
      hamCuaEmCan: ['go_wall', 'turn_left', 'turn_right', 'move'],
      deBai: 'Cửa c (chữ thường) đang mở. Nút M nối với nó theo chiều ngược: có thứ đè lên M thì cửa c ĐÓNG. Đường thẳng tới cờ đi qua M ngay trước cửa. Tìm đường khác, không đè lên M.',
      veMaMau: 'Chạy thử: xe lăn lên M, cửa c đóng sập trước mũi xe.',
      san: ['#######', '#.....#', '#.###.#', '#.McF.#', '#######'],
      batDau: { x: 1, y: 3, huong: 1 },
      maMau: { chinh: ['go_wall()'] },
      sao: { o: 14, nhip: 13 },
      loiGiai: { chinh: ['turn_left()', 'go_wall()'].concat(FOR(3, ['turn_right()', 'go_wall()'])) },
      loiGiaiKhac: { moTa: 'Viết thẳng từng góc, không dùng for (nhiều ô hơn)', baiLam: { chinh: ['turn_left()', 'go_wall()', 'turn_right()', 'go_wall()', 'turn_right()', 'go_wall()', 'turn_right()', 'go_wall()'] } },
      loiSai: [
        { moTa: 'Đi thẳng qua M: cửa c đóng ngay trước mũi xe', baiLam: { chinh: ['move()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Vòng lặp thiếu một lần rẽ: xe dừng ở góc dưới bên phải', baiLam: { chinh: ['turn_left()', 'go_wall()'].concat(FOR(2, ['turn_right()', 'go_wall()'])) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Đi vòng lên hàng trên, sang phải, rồi xuống: không chạm vào M.', 'Ba góc cuối đều là rẽ phải rồi go_wall(): lặp chúng bằng for.']
    }),

    man({
      so: 9, ten: 'Sửa hàm giữ cửa',
      hamCuaEmCan: ['go_wall', 'pick', 'turn_right', 'drop', 'turn_left'],
      chinhCoDinh: true,
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 4, y: 1 }] }, { nut: { x: 5, y: 2 }, cua: [{ x: 7, y: 1 }] }],
      deBai: 'Hàm hold_door() của màn phải đặt thùng trước mặt lên nút M bên phải xe, rồi trả xe về hướng cũ. Nó đang quên một việc nên lượt thứ hai hỏng. Sửa hold_door() để xe qua cả hai cửa tới cờ. Mỗi nút giữ cánh cửa C ngay sau thùng của nó.',
      veMaMau: 'Chương trình chính bị khóa. Chạy thử, xem xe đang nhìn hướng nào khi hold_door() xong.',
      san: ['##########', '#..oC.oCF#', '##M##M####', '##########'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: FOR(2, ['go_wall()', 'hold_door()']).concat(['go_wall()']), hamCuaMan: [H('hold_door', ['pick()', 'turn_right()', 'drop()'])] },
      sao: { o: 27, nhip: 19 },
      loiGiai: { chinh: FOR(2, ['go_wall()', 'hold_door()']).concat(['go_wall()']), hamCuaMan: [H('hold_door', ['pick()', 'turn_right()', 'drop()', 'turn_left()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: { chinh: FOR(2, ['go_wall()', 'hold_door()']).concat(['go_wall()']), hamCuaMan: [H('hold_door', ['pick()', 'turn_right()', 'drop()', '# quay về hướng cũ', 'turn_left()'])] } },
      loiSai: [
        { moTa: 'Hàm chưa sửa: lượt hai nhặt lại thùng trên nút, cửa thứ nhất đóng', baiLam: { chinh: FOR(2, ['go_wall()', 'hold_door()']).concat(['go_wall()']), hamCuaMan: [H('hold_door', ['pick()', 'turn_right()', 'drop()'])] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quay nhầm sang trái để đặt: thả vào tường', baiLam: { chinh: FOR(2, ['go_wall()', 'hold_door()']).concat(['go_wall()']), hamCuaMan: [H('hold_door', ['pick()', 'turn_left()', 'drop()', 'turn_right()'])] }, phaiCoMa: ['tha-bi-chan'] }
      ],
      goiY: ['Sau drop() xe còn nhìn xuống nút. go_wall() lượt sau không đi được.', 'Thêm turn_left() ở cuối hold_door().']
    }),

    /* ------------------------------------------------------------ 10: trùm */
    man({
      so: 10, ten: 'Trùm: kho nhiều cửa', huyHieu: { ma: 'nut-de', ten: 'Huy hiệu Nút đè' },
      hamCuaEmCan: ['go_wall', 'pick', 'turn_right', 'drop', 'turn_left', 'move'],
      nhipTheo: 'tong',
      noi: [
        [{ nut: { x: 3, y: 2 }, cua: [{ x: 5, y: 1 }, { x: 2, y: 1 }] }, { nut: { x: 7, y: 2 }, cua: [{ x: 9, y: 1 }] }],
        [{ nut: { x: 4, y: 2 }, cua: [{ x: 6, y: 1 }, { x: 3, y: 1 }] }, { nut: { x: 7, y: 2 }, cua: [{ x: 9, y: 1 }] }],
        [{ nut: { x: 5, y: 2 }, cua: [{ x: 7, y: 1 }, { x: 2, y: 1 }] }, { nut: { x: 8, y: 2 }, cua: [{ x: 10, y: 1 }] }]
      ],
      deBai: 'Ba kho dài ngắn khác nhau. Mỗi kho có cửa c đang mở ở đầu, hai thùng, hai nút M và hai cửa C phải mở theo thứ tự; cờ ở cuối lối rẽ xuống. Nút đầu giữ cửa C thứ nhất và đóng cửa c sau lưng; nút sau giữ cửa C thứ hai. Một chương trình phải tới cờ ở cả ba kho.',
      veMaMau: 'Chương trình mẫu đặt được thùng đầu. Viết tiếp cho thùng thứ hai và đoạn rẽ cuối; đừng đếm bước, mỗi kho một khác.',
      san: [
        ['#############', '#.c.oC..oC..#', '###M###M###.#', '###########.#', '###########F#', '#############', '#############'],
        ['#############', '#..c.oC.oC..#', '####M##M###.#', '###########F#', '#############', '#############', '#############'],
        ['#############', '#.c...oC.oC.#', '#####M##M##.#', '###########.#', '###########.#', '###########F#', '#############']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: { chinh: ['go_wall()', 'pick()', 'turn_right()', 'drop()', 'turn_left()'] },
      sao: { o: 28, nhip: 78 },
      loiGiai: { chinh: FOR(2, ['go_wall()', 'pick()', 'turn_right()', 'drop()', 'turn_left()']).concat(['go_wall()', 'turn_right()', 'go_wall()']) },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: FOR(2, ['go_wall()', 'pick()', 'turn_right()', 'drop()', 'turn_left()']).concat(['go_wall()', '# rẽ xuống cờ', 'turn_right()', 'go_wall()']) } },
      loiSai: [
        { moTa: 'Quên đoạn rẽ cuối: xe dừng ở góc trên', baiLam: { chinh: FOR(2, ['go_wall()', 'pick()', 'turn_right()', 'drop()', 'turn_left()']).concat(['go_wall()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Lặp một lần: cửa C thứ hai vẫn đóng', baiLam: { chinh: FOR(1, ['go_wall()', 'pick()', 'turn_right()', 'drop()', 'turn_left()']).concat(['go_wall()', 'turn_right()', 'go_wall()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đếm bước thay cho go_wall(): lượt hai nhặt hụt', baiLam: { chinh: FOR(2, ['move()', 'move()', 'pick()', 'turn_right()', 'drop()', 'turn_left()']).concat(['go_wall()', 'turn_right()', 'go_wall()']) }, phaiCoMa: ['kep-hut', 'chua-toi-co'] }
      ],
      goiY: ['Cửa c đóng sau lưng khi thùng đầu lên nút: xe đã qua rồi nên không sao.', 'Một lượt: go_wall() tới trước thùng, nhặt, quay xuống đặt lên nút, quay lại. Lặp hai lượt, rồi go_wall(), turn_right(), go_wall().']
    })
  ];

  ManHoc.manNutDe = DS;
  if (laNode) module.exports = ManHoc;
})();

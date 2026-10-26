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
    })
  ];

  ManHoc.manNutDe = DS;
  if (laNode) module.exports = ManHoc;
})();

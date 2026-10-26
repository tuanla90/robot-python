/* ============================================================================
   man-cam-bien-them.js — "Robot Chấn Hưng": 7 MÀN MỚI cho mùa 1, gói 3 "Cảm biến khoảng cách" (KE-HOACH-MUA-1.md, bảng 10 gói: "1 + 6 mới").
   Robot: xe hai bánh + cảm biến khoảng cách ở hông (front_clear), có màn thêm tay kẹp. Gói 3 đứng sau gói 2 nên được dùng `for`;
   đây là gói giới thiệu `if` / `while`.

   - 1 màn cho chương `khoang-cach` (mã khoang-cach.11, thay khoang-cach.7 đã cất): `while front_clear()` khi đang cầm thùng.
   - 6 màn cho chương `che-cam-bien` (mã che-cam-bien.11 … .16): làm mượt chỗ nhảy vọt trước che-cam-bien.3 (17 nhịp), luyện, biến thể, trùm.
   Mã là mã MỚI (không trùng màn nào trong ngân hàng, kể cả màn đã cất); vị trí hiển thị (so, hang) do lo-trinh-hoc.js đặt bằng dungChuong.

   Chương che-cam-bien ở lộ trình là "Hàm cho cảm biến". Các màn mới KHÔNG tạo hàm của em mới cho kho (mỗi tên trong `taoHam` phải có mục Sổ lệnh,
   so-lenh.js): người chơi viết / sửa thân một HÀM CỦA MÀN (maMau.hamCuaMan, như che-cam-bien.7) mà chương trình chính bị khóa (chinhCoDinh)
   gọi ở nhiều chỗ dài ngắn khác nhau, nên thân hàm phải hỏi cảm biến chứ không đếm bước.

   Ràng buộc mùa 1 (kiem-lo-trinh.mjs, kiem-cam-bien-them.mjs): không lệnh lùi, không left_clear / right_clear, không tay xoay, không biến
   (khung.chanBien), không hàm có tham số, không nút đè M, không bậc thang S. u_turn() lúc này là bản hai lần turn_right() (xuong-ham.7).
   Hàm của em dùng được (đã chế ở gói 1–2 và ở màn đứng trước trong gói 3): move, turn_right, turn_left, u_turn, corner, stair, two, pick, drop,
   carry, side, sweep, row, bend_left, bend_right, go_wall (khoang-cach.5), safe_move (che-cam-bien.1), face_open (che-cam-bien.2).
     pick() / drop() = 2 nhịp (tay hạ, kẹp / thả, chờ, tay nâng, chờ); move() / turn_right() / turn_left() = 1 nhịp; u_turn() = 2 nhịp.

   Sao: sao.o / sao.nhip đo bằng cham.js trên lời giải (kiem-cam-bien-them.mjs so khớp đúng từng số). Mục tiêu: tới cờ, hay bóng mờ
   (xe mờ + vật mờ) ở màn có thùng — để bộ dò đường do-duong-che-cam-bien.mjs dò được.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manCamBienThem, lo-trinh-hoc.js thêm vào hai chương rồi xếp chỗ.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var CAM = ['front_clear'];

  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }

  /** Trường chung. m.tay: true thì có tay kẹp. Trường tay bị bỏ sau khi dùng. */
  function man(m) {
    var coTay = !!m.tay;
    delete m.tay;
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: coTay ? 'kep' : null, camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = BANH.concat(coTay ? TAY : [], CAM);
    m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10, chanBien: true };
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ================================================================ chương khoang-cach (1 màn) */
    man({
      chuong: 'khoang-cach', so: 11, ten: 'Thùng trên tay', tay: true, mucTieu: 'bong-mo', nhipTheoLoiGiai: true,
      hamCuaEmCan: ['pick', 'move', 'turn_left', 'drop'],
      deBai: 'Thùng nằm ngay trước mặt xe. Nhặt thùng, dùng while front_clear() mang nó tới cuối hành lang, rồi quay trái đặt thùng vào ngách phía trên, giống xe mờ và thùng mờ.',
      veMaMau: 'Chương trình có sẵn mới nhặt thùng. Thùng đang cầm trên tay không chắn cảm biến: viết tiếp vòng while.',
      san: ['#######', '#####.#', '#.o...#', '#######'],
      batDau: { x: 1, y: 2, huong: 1 },
      bongMo: { x: 5, y: 2, huong: 0, vat: [{ x: 5, y: 1 }] },
      maMau: { chinh: ['pick()'] },
      sao: { o: 20, nhip: 9 },
      loiGiai: { chinh: ['pick()', 'while front_clear():', '    move()', 'turn_left()', 'drop()'] },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['pick()', '# mang thùng tới tường', 'while front_clear():', '    move()', 'turn_left()', 'drop()'] } },
      loiSai: [
        { moTa: 'Quên nhặt thùng: thùng chắn cảm biến nên xe không đi được bước nào', baiLam: { chinh: ['while front_clear():', '    move()', 'turn_left()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Tới tường rồi thả luôn, quên quay trái: trước mặt là tường', baiLam: { chinh: ['pick()', 'while front_clear():', '    move()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Dùng if thay while: xe chỉ đi được một ô', baiLam: { chinh: ['pick()', 'if front_clear():', '    move()', 'turn_left()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Thùng nằm trên tay thì không chắn cảm biến, chỉ tường mới chắn.', 'Tới tường rồi quay trái là nhìn vào ngách, rồi mới drop().']
    }),

    /* ================================================================ chương che-cam-bien (6 màn) */
    man({
      chuong: 'che-cam-bien', so: 11, ten: 'Một hàm, hai đoạn đường', chinhCoDinh: true, mucTieu: 'bong-mo',
      hamCuaEmCan: ['go_wall', 'turn_right', 'move'],
      deBai: 'Chương trình chính gọi wall_right() hai lần, nhưng hai đoạn đường dài ngắn khác nhau. Viết lại thân hàm wall_right() của màn: đi tới tường rồi rẽ phải, để xe dừng đúng chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa. Thân wall_right() đang đếm cứng một bước: chạy thử, xem lần gọi thứ nhất dừng ở đâu.',
      san: ['####', '#..#', '#.##', '#.##', '####'],
      batDau: { x: 1, y: 3, huong: 0 },
      bongMo: { x: 2, y: 1, huong: 2 },
      maMau: { chinh: ['wall_right()', 'wall_right()'], hamCuaMan: [H('wall_right', ['move()', 'turn_right()'])] },
      sao: { o: 11, nhip: 5 },
      loiGiai: { chinh: ['wall_right()', 'wall_right()'], hamCuaMan: [H('wall_right', ['go_wall()', 'turn_right()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích trong hàm', baiLam: { chinh: ['wall_right()', 'wall_right()'], hamCuaMan: [H('wall_right', ['# đi tới tường rồi rẽ', 'go_wall()', 'turn_right()'])] } },
      loiSai: [
        { moTa: 'Để nguyên thân đếm cứng một bước: đoạn đầu dài hai ô nên xe rẽ sớm', baiLam: { chinh: ['wall_right()', 'wall_right()'], hamCuaMan: [H('wall_right', ['move()', 'turn_right()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đi tới tường mà quên rẽ: lần gọi sau nhìn vào tường', baiLam: { chinh: ['wall_right()', 'wall_right()'], hamCuaMan: [H('wall_right', ['go_wall()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Rẽ trước rồi mới đi: xe quay mặt vào tường ngay từ đầu', baiLam: { chinh: ['wall_right()', 'wall_right()'], hamCuaMan: [H('wall_right', ['turn_right()', 'go_wall()'])] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Hai đoạn dài khác nhau nên đừng đếm bước: để cảm biến báo tường.', 'Thân hàm: go_wall() rồi turn_right().']
    })
  ];

  ManHoc.manCamBienThem = DS;
  if (laNode) module.exports = ManHoc;
})();

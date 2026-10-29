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
    m.cauTruc = m.cauTruc || ['for', 'if', 'while'];                       // HD1: khoang-cach.12 (ép if) đứng trước màn trình diễn while nên chưa có while
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10, chanBien: true };
    if (m.cauTruc.indexOf('while') < 0) m.khung.chanWhile = true;
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

    /* ---- HD1 (29/10, show don't tell): hai màn ÉP của chương khoang-cach, đứng ngay sau màn trình diễn (khoang-cach.1 trình diễn if, khoang-cach.2 trình diễn
       while, cả hai chiChay ở lộ trình). HAI SÂN dài ngắn khác nhau để đếm cứng không đủ sao (húc tường mất nhịp, nhipTheo 'tong') hay thua; sao.o chặt để
       for + if không thay được while. */
    man({
      chuong: 'khoang-cach', so: 12, ten: 'Hỏi rồi mới bước', cauTruc: ['for', 'if'], hamCuaEmCan: ['move'],
      deBai: 'Hai hành lang dài ngắn khác nhau, một chương trình phải đưa xe tới chỗ xe mờ ở cả hai. Lặp đủ nhiều lần, nhưng mỗi lần hỏi front_clear() rồi mới move(): tới tường thì xe tự dừng, không húc.',
      veMaMau: 'Chương trình có sẵn hỏi cảm biến một lần rồi tiến một ô. Bọc nó trong vòng for lặp 5 lần, nhớ thụt lề.',
      mucTieu: 'bong-mo',
      san: [['###', '###', '#.#', '#.#', '#.#'], ['#.#', '#.#', '#.#', '#.#', '#.#']],
      batDau: { x: 1, y: 4, huong: 0 },
      bongMo: [{ x: 1, y: 2, huong: 0 }, { x: 1, y: 0, huong: 0 }],
      maMau: { chinh: ['if front_clear():', '    move()'] },
      sao: { o: 6, nhip: 6 },
      loiGiai: { chinh: ['for i in range(5):', '    if front_clear():', '        move()'] },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# hỏi rồi mới bước', 'for i in range(5):', '    if front_clear():', '        move()'] } },
      loiSai: [
        { moTa: 'Giữ nguyên if: xe chỉ đi được một ô', baiLam: { chinh: ['if front_clear():', '    move()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đếm cứng theo sân ngắn: sân dài xe chưa tới', baiLam: { chinh: ['for i in range(2):', '    move()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đảo điều kiện bằng not: ô trước mặt trống nên xe đứng yên', baiLam: { chinh: ['for i in range(5):', '    if not front_clear():', '        move()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Dùng while ở màn chưa học while', baiLam: { chinh: ['while front_clear():', '    move()'] }, phaiCoMa: ['cau-truc-chua-hoc'] }
      ],
      goiY: ['Sân ngắn 2 ô, sân dài 4 ô: lặp 5 lần là đủ cho cả hai, if lo phần dừng.', 'Đếm cứng số bước thì sân ngắn húc tường, mất nhịp.']
    }),

    man({
      chuong: 'khoang-cach', so: 13, ten: 'Hai hành lang', hamCuaEmCan: ['move'],
      deBai: 'Hai hành lang, một ngắn một dài, xe mờ ở sát tường cuối. Một chương trình phải tới chỗ xe mờ ở cả hai: dùng while front_clear() để xe tự đi tới khi gặp tường, không đếm bước.',
      veMaMau: 'Chương trình có sẵn đếm cứng bốn bước: sân ngắn thì húc tường, sân dài thì chưa tới. Xóa nó đi, dùng while.',
      mucTieu: 'bong-mo',
      san: [['########', '#....###', '########'], ['########', '#......#', '########']],
      batDau: { x: 1, y: 1, huong: 1 },
      bongMo: [{ x: 4, y: 1, huong: 1 }, { x: 6, y: 1, huong: 1 }],
      maMau: { chinh: ['for i in range(4):', '    move()'] },
      sao: { o: 5, nhip: 8 },
      loiGiai: { chinh: ['while front_clear():', '    move()'] },
      loiGiaiKhac: { moTa: 'Vòng for lặp thừa, mỗi vòng hỏi cảm biến bằng if', baiLam: { chinh: ['for i in range(9):', '    if front_clear():', '        move()'] } },
      loiSai: [
        { moTa: 'Giữ nguyên đếm cứng bốn bước: sân dài chưa tới', baiLam: { chinh: ['for i in range(4):', '    move()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Dùng if thay while: xe chỉ đi được một ô', baiLam: { chinh: ['if front_clear():', '    move()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đảo điều kiện bằng not: vòng không chạy lần nào', baiLam: { chinh: ['while not front_clear():', '    move()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thân vòng while chỉ chờ, không tiến: điều kiện không bao giờ sai', baiLam: { chinh: ['while front_clear():', '    wait()'] }, phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['while hỏi lại sau mỗi bước, tới tường thì tự dừng ở cả sân ngắn lẫn sân dài.', 'Đếm cứng số bước thì không sân nào cũng đúng.']
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
    }),

    man({
      chuong: 'che-cam-bien', so: 12, ten: 'Dừng trước thùng', chinhCoDinh: true, tay: true, mucTieu: 'bong-mo',
      hamCuaEmCan: ['go_wall', 'pick', 'turn_right', 'drop', 'move'],
      deBai: 'Thùng nằm ở cuối hành lang. Thùng cũng chắn cảm biến như tường. Viết thân hàm get_box() của màn: đi tới ngay trước thùng rồi nhặt nó. Chương trình chính sẽ quay phải và đặt thùng vào ngách, giống xe mờ và thùng mờ.',
      veMaMau: 'Chương trình chính bị khóa: get_box(), turn_right(), drop(). Thân get_box() đang đi một bước rồi nhặt: chạy thử, xem tay kẹp vào đâu.',
      san: ['####', '#o##', '#..#', '#.##', '#.##', '#.##', '####'],
      batDau: { x: 1, y: 5, huong: 0 },
      bongMo: { x: 1, y: 2, huong: 1, vat: [{ x: 2, y: 2 }] },
      maMau: { chinh: ['get_box()', 'turn_right()', 'drop()'], hamCuaMan: [H('get_box', ['move()', 'pick()'])] },
      sao: { o: 22, nhip: 8 },
      loiGiai: { chinh: ['get_box()', 'turn_right()', 'drop()'], hamCuaMan: [H('get_box', ['go_wall()', 'pick()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích trong hàm', baiLam: { chinh: ['get_box()', 'turn_right()', 'drop()'], hamCuaMan: [H('get_box', ['# thùng chắn cảm biến như tường', 'go_wall()', 'pick()'])] } },
      loiSai: [
        { moTa: 'Để nguyên thân đi một bước: thùng còn xa nên tay kẹp vào chỗ trống', baiLam: { chinh: ['get_box()', 'turn_right()', 'drop()'], hamCuaMan: [H('get_box', ['move()', 'pick()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên nhặt: xe tới trước thùng rồi đi tay không', baiLam: { chinh: ['get_box()', 'turn_right()', 'drop()'], hamCuaMan: [H('get_box', ['go_wall()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Nhặt trước rồi mới đi: tay kẹp vào chỗ trống, rồi xe dừng trước thùng', baiLam: { chinh: ['get_box()', 'turn_right()', 'drop()'], hamCuaMan: [H('get_box', ['pick()', 'go_wall()'])] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['go_wall() dừng ngay trước thùng, vì cảm biến thấy thùng chắn như tường.', 'Thân hàm: go_wall() rồi pick().']
    }),

    man({
      chuong: 'che-cam-bien', so: 13, ten: 'Quay đầu trong vòng lặp', chinhCoDinh: true, mucTieu: 'bong-mo',
      hamCuaEmCan: ['move', 'u_turn'],
      deBai: 'Hàm to_end() của màn phải đi tới cuối hành lang rồi quay đầu. Chương trình chính gọi nó hai lần để xe chạm ô ◆ ở đầu bên phải rồi về đầu bên trái, mặt quay sang phải như xe mờ. Nhưng xe cứ lắc qua lắc lại mãi: sửa thân hàm. Các ngách phía trên không cần ghé.',
      veMaMau: 'Chương trình chính bị khóa: to_end() hai lần. Chạy thử, xem u_turn() đang nằm trong hay ngoài vòng while.',
      san: ['########', '#.#.#.##', '#......#', '########'],
      batDau: { x: 3, y: 2, huong: 1 },
      bongMo: { x: 1, y: 2, huong: 1, diQua: [{ x: 6, y: 2 }] },
      maMau: { chinh: ['to_end()', 'to_end()'], hamCuaMan: [H('to_end', ['while front_clear():', '    move()', '    u_turn()'])] },
      sao: { o: 12, nhip: 12 },
      loiGiai: { chinh: ['to_end()', 'to_end()'], hamCuaMan: [H('to_end', ['while front_clear():', '    move()', 'u_turn()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: { chinh: ['to_end()', 'to_end()'], hamCuaMan: [H('to_end', ['while front_clear():', '    move()', '# tới tường rồi mới quay đầu', 'u_turn()'])] } },
      loiSai: [
        { moTa: 'Chưa sửa: u_turn() thụt vào trong while nên xe đi một ô lại quay đầu, chạy mãi', baiLam: { chinh: ['to_end()', 'to_end()'], hamCuaMan: [H('to_end', ['while front_clear():', '    move()', '    u_turn()'])] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Xóa luôn u_turn(): lần gọi sau nhìn vào tường, xe không về', baiLam: { chinh: ['to_end()', 'to_end()'], hamCuaMan: [H('to_end', ['while front_clear():', '    move()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay đầu trước rồi mới đi: lần đầu chạy về bên trái, chưa chạm ◆', baiLam: { chinh: ['to_end()', 'to_end()'], hamCuaMan: [H('to_end', ['u_turn()', 'while front_clear():', '    move()'])] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Dòng thụt vào dưới while chạy lại mỗi vòng; dòng không thụt chỉ chạy một lần sau khi vòng dừng.', 'Bỏ thụt lề của u_turn() để xe tới tường rồi mới quay đầu.']
    }),

    man({
      chuong: 'che-cam-bien', so: 14, ten: 'Sửa hàm nhặt thùng', chinhCoDinh: true, tay: true, mucTieu: 'bong-mo',
      hamCuaEmCan: ['move', 'pick', 'turn_right', 'drop', 'turn_left', 'go_wall'],
      deBai: 'Hai thùng nằm dọc hành lang, xa gần khác nhau. Chương trình chính lặp hai lần: grab_box(), quay phải đặt thùng vào ngách, quay lại. Hàm grab_box() của màn phải đi tới ngay trước thùng rồi nhặt, nhưng nó chỉ đi được một ô. Sửa hàm để hai thùng nằm trong hai ngách như thùng mờ.',
      veMaMau: 'Chương trình chính bị khóa. Chạy thử, xem grab_box() dừng ở đâu: if chỉ hỏi một lần.',
      san: ['####', '#o##', '#..#', '#.##', '#o##', '#..#', '#.##', '#.##', '####'],
      batDau: { x: 1, y: 7, huong: 0 },
      bongMo: { x: 1, y: 2, huong: 0, vat: [{ x: 2, y: 5 }, { x: 2, y: 2 }] },
      maMau: { chinh: FOR(2, ['grab_box()', 'turn_right()', 'drop()', 'turn_left()']), hamCuaMan: [H('grab_box', ['if front_clear():', '    move()', 'pick()'])] },
      sao: { o: 26, nhip: 17 },
      loiGiai: { chinh: FOR(2, ['grab_box()', 'turn_right()', 'drop()', 'turn_left()']), hamCuaMan: [H('grab_box', ['go_wall()', 'pick()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: { chinh: FOR(2, ['grab_box()', 'turn_right()', 'drop()', 'turn_left()']), hamCuaMan: [H('grab_box', ['# đi tới khi thùng chắn', 'go_wall()', 'pick()'])] } },
      loiSai: [
        { moTa: 'Chưa sửa: if chỉ hỏi một lần nên xe đi một ô rồi kẹp vào chỗ trống', baiLam: { chinh: FOR(2, ['grab_box()', 'turn_right()', 'drop()', 'turn_left()']), hamCuaMan: [H('grab_box', ['if front_clear():', '    move()', 'pick()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đếm cứng hai bước theo thùng đầu: thùng sau xa hơn nên kẹp hụt', baiLam: { chinh: FOR(2, ['grab_box()', 'turn_right()', 'drop()', 'turn_left()']), hamCuaMan: [H('grab_box', ['move()', 'move()', 'pick()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đặt pick() vào trong vòng while: tay kẹp vào chỗ trống ở mỗi bước, tới trước thùng lại không nhặt', baiLam: { chinh: FOR(2, ['grab_box()', 'turn_right()', 'drop()', 'turn_left()']), hamCuaMan: [H('grab_box', ['while front_clear():', '    move()', '    pick()'])] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['if hỏi cảm biến một lần; while hỏi lại sau mỗi bước.', 'Đổi if thành while, hay dùng go_wall() em đã có.']
    }),

    man({
      chuong: 'che-cam-bien', so: 15, ten: 'Rẽ về phía có lối', chinhCoDinh: true, mucTieu: 'toi-co',
      hamCuaEmCan: ['turn_right', 'u_turn', 'go_wall', 'face_open'],
      deBai: 'Hành lang có ba khúc quanh, lúc rẽ phải lúc rẽ trái. Xe chỉ có cảm biến phía trước. Viết thân hàm turn_open() của màn: quay phải; nếu trước mặt vẫn bị chắn thì quay đầu để nhìn sang trái. Chương trình chính lặp go_wall() và turn_open() để tới cờ.',
      veMaMau: 'Chương trình chính bị khóa. Thân turn_open() đang chỉ quay phải: chạy thử, xem xe kẹt ở khúc quanh nào.',
      san: ['#######', '###..F#', '###.###', '#...###', '#.#####', '#.#####', '#######'],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: { chinh: FOR(4, ['go_wall()', 'turn_open()']), hamCuaMan: [H('turn_open', ['turn_right()'])] },
      sao: { o: 15, nhip: 13 },
      loiGiai: { chinh: FOR(4, ['go_wall()', 'turn_open()']), hamCuaMan: [H('turn_open', ['turn_right()', 'if not front_clear():', '    u_turn()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích trong hàm', baiLam: { chinh: FOR(4, ['go_wall()', 'turn_open()']), hamCuaMan: [H('turn_open', ['turn_right()', '# bên phải bị chắn thì nhìn sang trái', 'if not front_clear():', '    u_turn()'])] } },
      loiSai: [
        { moTa: 'Chỉ quay phải: ở khúc rẽ trái xe nhìn vào tường', baiLam: { chinh: FOR(4, ['go_wall()', 'turn_open()']), hamCuaMan: [H('turn_open', ['turn_right()'])] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng face_open(): quay phải mãi nên gặp lối cũ trước lối bên trái, xe đi ngược lại', baiLam: { chinh: FOR(4, ['go_wall()', 'turn_open()']), hamCuaMan: [H('turn_open', ['face_open()'])] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thiếu chữ not: khúc rẽ phải đang mở mà xe lại quay đầu', baiLam: { chinh: FOR(4, ['go_wall()', 'turn_open()']), hamCuaMan: [H('turn_open', ['turn_right()', 'if front_clear():', '    u_turn()'])] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Không có cảm biến bên: quay sang phải rồi hỏi front_clear().', 'Bên phải bị chắn thì u_turn() là nhìn sang trái.']
    }),

    man({
      chuong: 'che-cam-bien', so: 16, ten: 'Giao thùng vào ngách', tay: true, mucTieu: 'bong-mo', nhipTheoLoiGiai: true,
      huyHieu: { ma: 'che-cam-bien', ten: 'Huy hiệu Chế lệnh cảm biến' },
      hamCuaEmCan: ['go_wall', 'pick', 'turn_right', 'u_turn', 'drop', 'face_open', 'move'],
      deBai: 'Ba kho dài ngắn khác nhau. Mỗi kho có một thùng trong hành lang và một ngách ở cuối hành lang, lúc bên phải lúc bên trái. Một chương trình phải đi tới thùng, nhặt, mang tới cuối hành lang rồi đặt thùng vào ngách, giống xe mờ và thùng mờ ở cả ba kho.',
      veMaMau: 'Chương trình có sẵn mới tới được thùng và nhặt. Viết tiếp; đừng đếm bước, mỗi kho một khác.',
      san: [
        ['#####', '#..##', '#.###', '#.###', '#o###', '#.###', '#.###', '#####'],
        ['#####', '#..##', '##o##', '##.##', '##.##', '##.##', '##.##', '#####'],
        ['#####', '#####', '#..##', '#.###', '#.###', '#o###', '#.###', '#####']
      ],
      batDau: [{ x: 1, y: 6, huong: 0 }, { x: 2, y: 6, huong: 0 }, { x: 1, y: 6, huong: 0 }],
      bongMo: [
        { x: 1, y: 1, huong: 1, vat: [{ x: 2, y: 1 }] },
        { x: 2, y: 1, huong: 3, vat: [{ x: 1, y: 1 }] },
        { x: 1, y: 2, huong: 1, vat: [{ x: 2, y: 2 }] }
      ],
      maMau: { chinh: ['go_wall()', 'pick()'] },
      sao: { o: 26, nhip: 31 },
      loiGiai: { chinh: ['go_wall()', 'pick()', 'go_wall()', 'turn_right()', 'if not front_clear():', '    u_turn()', 'drop()'] },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['go_wall()', 'pick()', 'go_wall()', '# ngách bên phải hay bên trái?', 'turn_right()', 'if not front_clear():', '    u_turn()', 'drop()'] } },
      loiSai: [
        { moTa: 'Luôn quay phải rồi đặt: kho có ngách bên trái thì đặt vào tường', baiLam: { chinh: ['go_wall()', 'pick()', 'go_wall()', 'turn_right()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Dùng face_open(): quay phải mãi nên gặp hành lang trước ngách trái, đặt thùng giữa đường', baiLam: { chinh: ['go_wall()', 'pick()', 'go_wall()', 'face_open()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên go_wall() đầu: thùng còn xa nên tay kẹp vào chỗ trống', baiLam: { chinh: ['pick()', 'go_wall()', 'turn_right()', 'if not front_clear():', '    u_turn()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đếm cứng đường của kho đầu: hai kho sau dài ngắn khác', baiLam: { chinh: ['move()', 'pick()', 'for i in range(4):', '    move()', 'turn_right()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['go_wall() dừng trước thùng; nhặt xong, go_wall() lần nữa đưa xe tới cuối hành lang.', 'Quay phải rồi hỏi front_clear(): bị chắn thì u_turn() để nhìn sang ngách bên trái.']
    })
  ];

  ManHoc.manCamBienThem = DS;
  if (laNode) module.exports = ManHoc;
})();

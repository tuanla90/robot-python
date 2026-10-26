/* ============================================================================
   man-banh-lui-them.js — "Robot Chấn Hưng": 8 MÀN MỚI cho mùa 1, gói 5 "Bánh lùi" (KE-HOACH-MUA-1.md, bảng 10 gói: "4 + 4 mới").
   Robot: xe hai bánh + cảm biến khoảng cách (front_clear), có màn thêm tay kẹp. Gói 5 đứng sau gói 1–4 nên được dùng `def`, `for`,
   `if` / `while` / front_clear(), tay kẹp, nút đè M và cửa; đây là gói giới thiệu left_back() / right_back() (hàm của em back(), park(), u_turn một nhịp).

   - 4 màn cho chương `banh-lui` (mã banh-lui.1 … .4; .4 là trùm ba sân, huy hiệu 'banh-lui'): lùi tránh thùng, lùi vào ngách bên trái,
     ghé ◆ ở cuối ngõ rồi lùi ra, trùm "ra khỏi ngõ cụt" (ngã rẽ luôn cách cuối ngõ hai ô, lúc bên phải lúc bên trái).
   - 4 màn cho chương `che-banh-lui` "Hàm có lùi" (mã che-banh-lui.1 … .4): kéo thùng khỏi ngõ cụt (viết thân hàm của màn), đặt thùng lên nút đè
     rồi lùi qua cửa, "đi tới tường rồi lùi một ô" (hàm của màn gọi ở hai khúc dài ngắn khác nhau), sửa hàm dọn thùng thiếu back().
   Mã là mã MỚI (không trùng màn nào trong ngân hàng, kể cả màn đã cất); vị trí hiển thị (so, hang) do lo-trinh-hoc.js đặt bằng dungChuong.

   Các màn mới KHÔNG tạo hàm của em mới (không taoHam, không mục Sổ lệnh mới): người chơi viết / sửa thân HÀM CỦA MÀN (maMau.hamCuaMan)
   mà chương trình chính bị khóa (chinhCoDinh) gọi, như che-xe.7 / che-cam-bien.11–15.
   Ràng buộc mùa 1 (kiem-lo-trinh.mjs, kiem-banh-lui-them.mjs): không left_clear / right_clear, không tay xoay, không biến (khung.chanBien),
   không hàm có tham số, không bậc thang S.
   Hàm của em dùng được: mọi hàm đã chế ở gói 1–4 và ở màn đứng trước trong gói 5 (back che-xe.4, park che-xe.6, u_turn một nhịp che-xe.5,
   drag che-tay.5, …). Ở gói 5: move / turn_right / turn_left / back / u_turn = 1 nhịp; pick() / drop() = 2 nhịp.

   Sao: sao.o / sao.nhip đo bằng cham.js trên lời giải (kiem-banh-lui-them.mjs so khớp đúng từng số).
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manBanhLuiThem, lo-trinh-hoc.js thêm vào hai chương rồi xếp chỗ.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
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

  var LG_TRUM = ['go_wall()'].concat(FOR(2, ['back()']), ['turn_right()', 'if not front_clear():', '    u_turn()', 'go_wall()']);

  var DS = [
    /* ================================================================ chương banh-lui (4 màn) */
    man({
      chuong: 'banh-lui', so: 1, ten: 'Lùi tránh thùng', mucTieu: 'toi-co',
      hamCuaEmCan: ['back', 'turn_right', 'turn_left', 'go_wall'],
      deBai: 'Thùng gỗ chắn ngay trước mặt xe. Lối rẽ sang cờ nằm ở phía sau, cách xe hai ô. Lùi tới lối rẽ, rẽ phải rồi đi tới cờ.',
      veMaMau: 'Chạy thử: go_wall() không đi được bước nào vì thùng chắn cảm biến. Dùng back() để lùi trước.',
      san: ['#######', '##o####', '##.####', '##.####', '#....F#', '#.#.#.#', '#######'],
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: { chinh: ['go_wall()'] },
      sao: { o: 14, nhip: 6 },
      loiGiai: { chinh: ['back()', 'back()', 'turn_right()', 'go_wall()'] },
      loiGiaiKhac: { moTa: 'Cùng đường đi, thêm một dòng chú thích', baiLam: { chinh: ['# lùi tới lối rẽ', 'back()', 'back()', 'turn_right()', 'go_wall()'] } },
      loiSai: [
        { moTa: 'Lùi một ô rồi rẽ: trước mặt là tường', baiLam: { chinh: ['back()', 'turn_right()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ trái: xe đi vào ngõ cụt bên trái', baiLam: { chinh: ['back()', 'back()', 'turn_left()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['back() lùi một ô, mặt xe vẫn quay về phía thùng.', 'Lùi hai ô là tới hàng có lối rẽ. Rẽ phải rồi go_wall().']
    }),

    man({
      chuong: 'banh-lui', so: 2, ten: 'Lùi vào ngách', mucTieu: 'bong-mo',
      hamCuaEmCan: ['go_wall', 'turn_left', 'turn_right', 'back', 'park', 'move'],
      deBai: 'Đi lên tới tường, rẽ trái, đi hết hành lang rồi lùi vào ngách ngay bên trái xe, đầu xe quay ra hành lang như xe mờ. park() chỉ lùi vào chỗ đỗ bên PHẢI xe.',
      veMaMau: 'Chương trình có sẵn đưa xe tới cuối hành lang. Viết tiếp: quay sao cho đuôi xe hướng vào ngách rồi lùi.',
      san: ['#######', '#.#.###', '#.....#', '#.#.#.#', '#.#.#.#', '#.#.#.#', '#######'],
      batDau: { x: 5, y: 5, huong: 0 },
      bongMo: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: ['go_wall()', 'turn_left()', 'go_wall()'] },
      sao: { o: 17, nhip: 10 },
      loiGiai: { chinh: ['go_wall()', 'turn_left()', 'go_wall()', 'turn_right()', 'back()'] },
      loiGiaiKhac: { moTa: 'Cùng đường đi, thêm một dòng chú thích', baiLam: { chinh: ['go_wall()', 'turn_left()', 'go_wall()', '# đuôi xe hướng vào ngách', 'turn_right()', 'back()'] } },
      loiSai: [
        { moTa: 'Dùng park(): park() lùi vào chỗ bên phải xe, tức ngách phía trên', baiLam: { chinh: ['go_wall()', 'turn_left()', 'go_wall()', 'park()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay đầu xe vào ngách rồi tiến: đầu xe quay vào trong', baiLam: { chinh: ['go_wall()', 'turn_left()', 'go_wall()', 'turn_left()', 'move()'] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Xe đi lùi về phía đuôi. Muốn lùi xuống thì đầu xe phải quay lên.', 'Cuối hành lang: turn_right() rồi back().']
    }),

    man({
      chuong: 'banh-lui', so: 3, ten: 'Ghé trạm rồi lùi ra', mucTieu: 'bong-mo',
      hamCuaEmCan: ['go_wall', 'back', 'turn_left', 'turn_right', 'move'],
      deBai: 'Trạm ◆ ở cuối ngõ cụt phía trên. Xe phải chạm ◆, rồi lùi ra tới ngã tư, rẽ trái và đi tới cuối hành lang như xe mờ. Ngã tư cách ◆ ba ô.',
      veMaMau: 'Chương trình có sẵn đưa xe tới ◆. Viết tiếp: lùi ba ô bằng vòng for, rồi rẽ.',
      san: ['#######', '###.###', '###.###', '###.###', '#.....#', '###.###', '###.###', '#######'],
      batDau: { x: 3, y: 6, huong: 0 },
      bongMo: { x: 1, y: 4, huong: 3, diQua: [{ x: 3, y: 1 }] },
      maMau: { chinh: ['go_wall()'] },
      sao: { o: 15, nhip: 11 },
      loiGiai: { chinh: ['go_wall()'].concat(FOR(3, ['back()']), ['turn_left()', 'go_wall()']) },
      loiGiaiKhac: { moTa: 'Cùng đường đi, thêm một dòng chú thích', baiLam: { chinh: ['go_wall()', '# lùi về ngã tư'].concat(FOR(3, ['back()']), ['turn_left()', 'go_wall()']) } },
      loiSai: [
        { moTa: 'Không ghé ◆: rẽ luôn ở ngã tư', baiLam: { chinh: ['move()', 'move()', 'turn_left()', 'go_wall()'] }, phaiCoMa: ['chua-qua-diem'] },
        { moTa: 'Lùi hai ô: rẽ vào tường, xe đứng yên', baiLam: { chinh: ['go_wall()'].concat(FOR(2, ['back()']), ['turn_left()', 'go_wall()']) }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Rẽ phải: xe tới cuối hành lang bên phải', baiLam: { chinh: ['go_wall()'].concat(FOR(3, ['back()']), ['turn_right()', 'go_wall()']) }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Từ ◆, lùi thì mặt xe vẫn quay lên; quay đầu thì tốn thêm một nhịp.', 'for i in range(3): back() rồi turn_left(), go_wall().']
    }),

    man({
      chuong: 'banh-lui', so: 4, ten: 'Ra khỏi ngõ cụt', mucTieu: 'bong-mo', nhipTheoLoiGiai: true,
      huyHieu: { ma: 'banh-lui', ten: 'Huy hiệu Bánh lùi' },
      hamCuaEmCan: ['go_wall', 'back', 'turn_right', 'u_turn', 'move', 'turn_left'],
      deBai: 'Ba ngõ cụt dài ngắn khác nhau, trạm ◆ ở cuối ngõ. Ngã rẽ luôn cách ◆ hai ô, lúc bên phải lúc bên trái. Một chương trình phải chạm ◆, lùi ra tới ngã rẽ rồi đi hết nhánh rẽ như xe mờ, ở cả ba sân.',
      veMaMau: 'Chương trình có sẵn đưa xe tới ◆. Viết tiếp; đừng đếm bước đi tới, mỗi ngõ một khác.',
      san: [
        ['#######', '###.###', '###.###', '###...#', '###.###', '##..###', '###.###', '###.###', '#######'],
        ['#######', '#######', '#######', '###.###', '###..##', '#...###', '###.###', '###.###', '#######'],
        ['#######', '#######', '#####.#', '#####.#', '#.....#', '#####.#', '####..#', '#####.#', '#######']
      ],
      batDau: [{ x: 3, y: 7, huong: 0 }, { x: 3, y: 7, huong: 0 }, { x: 5, y: 7, huong: 0 }],
      bongMo: [
        { x: 5, y: 3, huong: 1, diQua: [{ x: 3, y: 1 }] },
        { x: 1, y: 5, huong: 3, diQua: [{ x: 3, y: 3 }] },
        { x: 1, y: 4, huong: 3, diQua: [{ x: 5, y: 2 }] }
      ],
      maMau: { chinh: ['go_wall()'] },
      sao: { o: 20, nhip: 34 },
      loiGiai: { chinh: LG_TRUM },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['go_wall()', '# lùi ra ngã rẽ'].concat(LG_TRUM.slice(1)) } },
      loiSai: [
        { moTa: 'Luôn rẽ phải: ngõ có nhánh bên trái thì xe nhìn vào tường', baiLam: { chinh: ['go_wall()'].concat(FOR(2, ['back()']), ['turn_right()', 'go_wall()']) }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lùi một ô: chưa tới ngã rẽ, hai bên đều là tường', baiLam: { chinh: ['go_wall()', 'back()', 'turn_right()', 'if not front_clear():', '    u_turn()', 'go_wall()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đếm cứng đường của sân đầu: hai ngõ sau ngắn hơn', baiLam: { chinh: FOR(6, ['move()']).concat(FOR(2, ['back()']), ['turn_right()', 'go_wall()']) }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['go_wall() tới ◆ ở mọi ngõ; từ ◆ lùi hai ô luôn tới ngã rẽ.', 'Quay phải rồi hỏi front_clear(): bị chắn thì u_turn() để nhìn sang trái.']
    }),

    /* ================================================================ chương che-banh-lui (4 màn) */
    man({
      chuong: 'che-banh-lui', so: 1, ten: 'Kéo thùng khỏi ngõ cụt', chinhCoDinh: true, tay: true, mucTieu: 'bong-mo',
      hamCuaEmCan: ['go_wall', 'pick', 'back', 'turn_left', 'drop', 'move'],
      deBai: 'Thùng gỗ kẹt ở cuối ngõ cụt hẹp. Viết thân hàm pull_out() của màn: đi tới ngay trước thùng, nhặt nó, rồi lùi hai ô ra khỏi ngõ. Chương trình chính sẽ quay trái và đặt thùng xuống, giống xe mờ và thùng mờ.',
      veMaMau: 'Chương trình chính bị khóa: pull_out(), turn_left(), drop(). Thân pull_out() mới đi tới thùng và nhặt: chạy thử, xem xe đặt thùng vào đâu.',
      san: ['#######', '###o###', '###.###', '###.###', '#.....#', '#.....#', '#.....#', '#######'],
      batDau: { x: 3, y: 6, huong: 0 },
      bongMo: { x: 3, y: 4, huong: 3, vat: [{ x: 2, y: 4 }] },
      maMau: { chinh: ['pull_out()', 'turn_left()', 'drop()'], hamCuaMan: [H('pull_out', ['go_wall()', 'pick()'])] },
      sao: { o: 27, nhip: 11 },
      loiGiai: { chinh: ['pull_out()', 'turn_left()', 'drop()'], hamCuaMan: [H('pull_out', ['go_wall()', 'pick()', 'back()', 'back()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích trong hàm', baiLam: { chinh: ['pull_out()', 'turn_left()', 'drop()'], hamCuaMan: [H('pull_out', ['go_wall()', 'pick()', '# lùi ra khỏi ngõ', 'back()', 'back()'])] } },
      loiSai: [
        { moTa: 'Chưa lùi: xe còn trong ngõ hẹp, quay trái là đặt thùng vào tường', baiLam: { chinh: ['pull_out()', 'turn_left()', 'drop()'], hamCuaMan: [H('pull_out', ['go_wall()', 'pick()'])] }, phaiCoMa: ['tha-bi-chan'] },
        { moTa: 'Lùi một ô: vẫn còn trong ngõ', baiLam: { chinh: ['pull_out()', 'turn_left()', 'drop()'], hamCuaMan: [H('pull_out', ['go_wall()', 'pick()', 'back()'])] }, phaiCoMa: ['tha-bi-chan'] },
        { moTa: 'Lùi trước rồi mới nhặt: tay kẹp vào chỗ trống', baiLam: { chinh: ['pull_out()', 'turn_left()', 'drop()'], hamCuaMan: [H('pull_out', ['go_wall()', 'back()', 'back()', 'pick()'])] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Ngõ hẹp chỉ vừa một xe. Nhặt xong thì lùi, mặt xe vẫn quay vào ngõ.', 'Thân hàm: go_wall(), pick(), back(), back().']
    }),

    man({
      chuong: 'che-banh-lui', so: 2, ten: 'Lùi qua cửa', tay: true, mucTieu: 'bong-mo',
      hamCuaEmCan: ['put_right', 'back', 'pick', 'turn_left', 'drop', 'turn_right', 'u_turn', 'go_wall'],
      deBai: 'Cửa C ở phía sau lưng xe, đang đóng. Nút đè M nằm bên phải xe, thùng gỗ ở trước mặt. Đặt thùng lên M cho cửa mở, rồi lùi qua cửa tới chỗ xe mờ, đầu xe vẫn quay xuống.',
      veMaMau: 'put_right() đặt thùng sang bên phải xe, đúng ô M. Viết tiếp: lùi bốn ô bằng vòng for.',
      san: ['#######', '###.###', '###.###', '###C###', '###..##', '##M..##', '###o###', '#######'],
      batDau: { x: 3, y: 5, huong: 2 },
      bongMo: { x: 3, y: 1, huong: 2, vat: [{ x: 2, y: 5 }] },
      maMau: { chinh: ['put_right()'] },
      sao: { o: 24, nhip: 10 },
      loiGiai: { chinh: ['put_right()'].concat(FOR(4, ['back()'])) },
      loiGiaiKhac: { moTa: 'Cùng đường đi, thêm một dòng chú thích', baiLam: { chinh: ['put_right()', '# cửa đã mở, lùi qua cửa'].concat(FOR(4, ['back()'])) } },
      loiSai: [
        { moTa: 'Đặt thùng sang bên trái, không lên M: cửa vẫn đóng', baiLam: { chinh: ['pick()', 'turn_left()', 'drop()', 'turn_right()'].concat(FOR(4, ['back()'])) }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay đầu rồi đi qua cửa: tới nơi nhưng đầu xe quay lên', baiLam: { chinh: ['put_right()', 'u_turn()', 'go_wall()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Mang thùng theo, không đặt: cửa vẫn đóng', baiLam: { chinh: ['pick()'].concat(FOR(4, ['back()'])) }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Thùng nằm trên M thì cửa C mở và giữ mở.', 'Lùi thì không cần quay đầu: for i in range(4): back().']
    }),

    man({
      chuong: 'che-banh-lui', so: 3, ten: 'Tới tường rồi lùi một ô', chinhCoDinh: true, mucTieu: 'bong-mo',
      hamCuaEmCan: ['go_wall', 'back', 'turn_right', 'move'],
      deBai: 'Mỗi khúc quanh có một ô cụt thừa ở cuối, lối rẽ nằm ngay trước ô cụt đó. Viết thân hàm before_wall() của màn: đi tới tường rồi lùi một ô. Chương trình chính gọi nó ở hai khúc dài ngắn khác nhau để xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa. Thân before_wall() mới đi tới tường: chạy thử, xem xe rẽ ở đâu.',
      san: ['#######', '#.#####', '#.....#', '#.##.##', '#.##.##', '#.#####', '#.#####', '#######'],
      batDau: { x: 1, y: 6, huong: 0 },
      bongMo: { x: 4, y: 4, huong: 2 },
      maMau: { chinh: FOR(2, ['before_wall()', 'turn_right()']).concat(['go_wall()']), hamCuaMan: [H('before_wall', ['go_wall()'])] },
      sao: { o: 16, nhip: 15 },
      loiGiai: { chinh: FOR(2, ['before_wall()', 'turn_right()']).concat(['go_wall()']), hamCuaMan: [H('before_wall', ['go_wall()', 'back()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích trong hàm', baiLam: { chinh: FOR(2, ['before_wall()', 'turn_right()']).concat(['go_wall()']), hamCuaMan: [H('before_wall', ['go_wall()', '# lùi về lối rẽ', 'back()'])] } },
      loiSai: [
        { moTa: 'Chỉ đi tới tường: xe rẽ ở ô cụt nên nhìn vào tường', baiLam: { chinh: FOR(2, ['before_wall()', 'turn_right()']).concat(['go_wall()']), hamCuaMan: [H('before_wall', ['go_wall()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lùi trước rồi mới đi: lần đầu xe lùi vào tường', baiLam: { chinh: FOR(2, ['before_wall()', 'turn_right()']).concat(['go_wall()']), hamCuaMan: [H('before_wall', ['back()', 'go_wall()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đếm cứng bốn bước theo khúc đầu: khúc sau ngắn hơn', baiLam: { chinh: FOR(2, ['before_wall()', 'turn_right()']).concat(['go_wall()']), hamCuaMan: [H('before_wall', FOR(4, ['move()']))] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Không có cảm biến bên, nên không biết lối rẽ ở đâu. Nhưng lối rẽ luôn ở ngay trước tường một ô.', 'Thân hàm: go_wall() rồi back().']
    }),

    man({
      chuong: 'che-banh-lui', so: 4, ten: 'Sửa hàm dọn thùng', chinhCoDinh: true, tay: true, mucTieu: 'bong-mo',
      hamCuaEmCan: ['go_wall', 'pick', 'back', 'turn_right', 'drop', 'turn_left', 'move'],
      deBai: 'Hai thùng chắn cuối ngõ. Chương trình chính lặp hai lần: tidy(), turn_left(). Hàm tidy() của màn phải đi tới thùng gần nhất, nhặt nó, lùi một ô rồi đặt thùng vào ngách bên phải. Thùng đầu vào được ngách nhưng thùng sau bị đặt vào tường: sửa hàm.',
      veMaMau: 'Chương trình chính bị khóa. Chạy thử, xem lần gọi thứ hai đứng ở đâu khi đặt thùng.',
      san: ['#######', '##o####', '##o####', '##..###', '##..###', '##.####', '##.####', '#######'],
      batDau: { x: 2, y: 6, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 0, vat: [{ x: 3, y: 4 }, { x: 3, y: 3 }] },
      maMau: { chinh: FOR(2, ['tidy()', 'turn_left()']), hamCuaMan: [H('tidy', ['go_wall()', 'pick()', 'turn_right()', 'drop()'])] },
      sao: { o: 30, nhip: 19 },
      loiGiai: { chinh: FOR(2, ['tidy()', 'turn_left()']), hamCuaMan: [H('tidy', ['go_wall()', 'pick()', 'back()', 'turn_right()', 'drop()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: { chinh: FOR(2, ['tidy()', 'turn_left()']), hamCuaMan: [H('tidy', ['go_wall()', 'pick()', '# lùi cho thẳng ngách', 'back()', 'turn_right()', 'drop()'])] } },
      loiSai: [
        { moTa: 'Chưa sửa: lần sau xe đứng sát thùng thứ hai, bên phải là tường', baiLam: { chinh: FOR(2, ['tidy()', 'turn_left()']), hamCuaMan: [H('tidy', ['go_wall()', 'pick()', 'turn_right()', 'drop()'])] }, phaiCoMa: ['tha-bi-chan'] },
        { moTa: 'Lùi hai ô: lần đầu đã đặt thùng vào tường', baiLam: { chinh: FOR(2, ['tidy()', 'turn_left()']), hamCuaMan: [H('tidy', ['go_wall()', 'pick()', 'back()', 'back()', 'turn_right()', 'drop()'])] }, phaiCoMa: ['tha-bi-chan'] },
        { moTa: 'Lùi trước rồi mới nhặt: tay kẹp vào chỗ trống', baiLam: { chinh: FOR(2, ['tidy()', 'turn_left()']), hamCuaMan: [H('tidy', ['go_wall()', 'back()', 'pick()', 'turn_right()', 'drop()'])] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Ngách nằm thấp hơn chỗ xe nhặt thùng một ô.', 'Thêm back() ngay sau pick().']
    })
  ];

  ManHoc.manBanhLuiThem = DS;
  if (laNode) module.exports = ManHoc;
})();

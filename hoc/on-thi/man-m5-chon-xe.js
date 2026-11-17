/* ============================================================================
   man-m5-chon-xe.js — diem10code-python: MÙA 5 Đồng đội, CỘT 3 "Chọn xe": trước khi viết code, em chọn cỗ máy cho từng xe (man.chonDoi, lap-rap.js; màn hình game/man-chon-doi.js).
   Xe nào hợp với địa hình nào: xe nhanh đường thẳng nhưng quay chậm và mang được gỗ; nhện không phải quay, trèo qua thùng; drone bay qua hố và nước nhưng không giữ được nút;
   xuồng chạy trên nước. Hai xe cùng lệnh đi thì dùng chung được một hàm. 8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;
  var CoMay = laNode ? require('../co-may.js') : window.CoMay;

  var NHEN = ManHoc.CO_MAY.NHEN_KEP;   // nhện gắn kẹp: chân cao trèo qua thùng (co-may.js, MAY_NHA.NHEN)
  var DRONE = ManHoc.CO_MAY.DRONE;
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }
  function UP(n) { return FOR(n, ['go_up()']); }
  function TIEN(n) { return FOR(n, ['forward()']); }
  function DOI(r1, r2) { return [ManHoc.xeDoi(r1.may, r1), ManHoc.xeDoi(r2.may, r2)]; }
  /** Cách chọn của màn: chon là mã hai xe, r1 và r2 là code hai xe. */
  function CACH(chon, r1, r2, ham) {
    var lg = { doi: [{ chinh: r1 }, { chinh: r2 }] };
    if (ham) lg.hamCuaEmMoi = ham;
    return { chon: chon, loiGiai: lg };
  }

  function man(so, m) {
    m.chuong = 'm5-c3-chon-xe';
    if (m.chonDoi) {
      var d = CoMay.dung(m.chonDoi.cachMau[0].chon[0]);
      m.loaiRobot = d.loaiRobot; m.robot = d.robot; m.hamGoc = d.hamGoc;
      m.chonDoi.trung = true;
      m.loiGiai = m.chonDoi.cachMau[0].loiGiai;
    } else { m.loaiRobot = m.doi[0].loaiRobot; m.robot = m.doi[0].robot; m.hamGoc = m.doi[0].hamGoc.slice(); }
    m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true;
    m.phienBanNoiDung = 2;
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  var NUT = ['F##F', 'C##o', '.##M', 'u##.', '.##.'];
  var THANG_CO = ['....F.F....', '.#########.', '.#########.', '.#########.', '.##########', '.##########'];
  var LEO = ['######.F', '##.F##.#', '##.###o#', '.u.##..#', '.####.##', '.####.##'];
  var GIU = ['F#######F', 'C#######.', '.#.....M.', '.#.######', 'u#.######', '.#.######', '.#.######'];
  var CAU = ['#o##B####', '....q...D', '####~####', '####~####'];

  ManHoc.them([
    man(1, { ten: 'Mỗi xe một đường',
      deBai: 'Mỗi cỗ máy có một thế mạnh. Nhện đi 2 nhịp một ô, drone bay 1 nhịp một ô, cả hai đều dùng lệnh go_up(). Làn trái có thùng gỗ, làn phải có hố. Đọc code, đoán rồi bấm Chạy.',
      san: ['F..F', 'o..u', '....', '....'],
      doi: DOI({ may: NHEN, batDau: { x: 0, y: 3, huong: 0 }, co: [{ x: 0, y: 0 }] }, { may: DRONE, batDau: { x: 3, y: 3, huong: 0 }, co: [{ x: 3, y: 0 }] }),
      duDoan: { hoi: 'Nhện gặp thùng gỗ giữa đường thì sao?', luaChon: ['Đứng lại, không đi tiếp', 'Trèo qua thùng', 'Đẩy thùng đi trước'], dung: 1, xacMinh: { nhipXe: [6, 3] } },
      sao: { o: 4, nhip: 6 },
      loiGiai: { doi: [{ chinh: UP(3) }, { chinh: UP(3) }] } }),

    man(2, { ten: 'Đọc code, chọn xe',
      deBai: 'Code đã có sẵn, xe thì chưa. Xem lệnh mỗi xe dùng và xem sân: R1 đi lên bằng go_up() và làn của R1 có hố. R2 dùng forward(). Chọn đúng hai cỗ máy, rồi điền dòng còn thiếu của R1.',
      san: ['.F..F', '.....', '.u...', '.....', '.....'],
      doi: [{ batDau: { x: 1, y: 4, huong: 0 }, co: [{ x: 1, y: 0 }] }, { batDau: { x: 4, y: 4, huong: 0 }, co: [{ x: 4, y: 0 }] }],
      chonDoi: { menu: ['XE', 'NHEN', 'DRONE'], cachMau: [CACH(['DRONE', 'XE'], ['go_up()', 'go_up()', 'go_up()', 'go_up()'], TIEN(4))] },
      maMau: { doi: [{ chinh: ['go_up()', 'go_up()', '', 'go_up()'] }, { chinh: TIEN(4) }] },
      goiY: ['Xe không biết lệnh go_up(). Nhện và drone thì biết, nhưng chỉ một trong hai qua được hố.', 'Cần đổi xe thì bấm Đổi xe ở thanh trên, code vẫn được giữ.'],
      sao: { o: 6, nhip: 4 } }),

    man(3, { ten: 'Đổi xe, quên đổi lệnh',
      deBai: 'Làn của R2 có thùng nên xe không qua được, R2 đã đổi sang nhện. Nhưng code của R2 còn sót một lệnh của xe. Giữ đội này, sửa đúng một dòng.',
      san: ['F..F', '...o', '....', '....'],
      doi: [{ batDau: { x: 0, y: 3, huong: 0 }, co: [{ x: 0, y: 0 }] }, { batDau: { x: 3, y: 3, huong: 0 }, co: [{ x: 3, y: 0 }] }],
      chonDoi: { menu: ['XE', 'NHEN', 'DRONE'], macDinh: ['XE', 'NHEN'], cachMau: [CACH(['XE', 'NHEN'], TIEN(3), ['go_up()', 'go_up()', 'go_up()'])] },
      maMau: { doi: [{ chinh: TIEN(3) }, { chinh: ['forward()', 'go_up()', 'go_up()'] }] },
      goiY: ['Dòng tô đỏ là lệnh mà cỗ máy đang chọn không có. Nhện đi bằng lệnh nào?'],
      sao: { o: 5, nhip: 6 } }),

    man(4, { ten: 'Ai giữ nút',
      deBai: 'R1 phải qua hố rồi qua cửa. Cửa chỉ mở khi có xe đứng trên nút, mà R2 còn phải đi tiếp tới cờ, qua một thùng gỗ. Chọn hai cỗ máy rồi viết code.',
      san: NUT,
      doi: [{ batDau: { x: 0, y: 4, huong: 0 }, co: [{ x: 0, y: 0 }] }, { batDau: { x: 3, y: 4, huong: 0 }, co: [{ x: 3, y: 0 }] }],
      chonDoi: { menu: ['XE', 'NHEN', 'DRONE'], cachMau: [CACH(['DRONE', 'NHEN'], ['go_up()', 'go_up()'].concat(FOR(3, ['wait()']), ['go_up()', 'go_up()']), UP(4))] },
      goiY: ['Xe và nhện rơi xuống hố, chỉ có drone qua được. Nhưng drone bay trên nút thì nút không nhận.', 'Nhện tới nút mất 4 nhịp, nên R1 phải đợi trước cửa.'],
      sao: { o: 8, nhip: 8 } }),

    man(5, { ten: 'Nhanh hay gọn',
      deBai: 'Hai đường gấp khúc. Xe tiến nhanh nhưng phải quay nên tốn thêm một dòng và 2 nhịp mỗi lần rẽ. Nhện không phải quay nhưng đi chậm. Một sao cho bài gọn, một sao cho bài nhanh, có thể lấy bằng hai đội khác nhau.',
      san: THANG_CO,
      doi: [{ batDau: { x: 0, y: 5, huong: 0 }, co: [{ x: 4, y: 0 }] }, { batDau: { x: 10, y: 3, huong: 0 }, co: [{ x: 6, y: 0 }] }],
      chonDoi: { menu: ['XE', 'NHEN'], cachMau: [
        CACH(['NHEN', 'NHEN'], UP(5).concat(FOR(4, ['go_right()'])), UP(3).concat(FOR(4, ['go_left()']))),
        CACH(['XE', 'XE'], TIEN(5).concat(['turn_right()'], TIEN(4)), TIEN(3).concat(['turn_left()'], TIEN(4)))
      ] },
      goiY: ['Hai nhện: mỗi xe hai vòng for, không có dòng rẽ.', 'Hai xe: mỗi xe rẽ một lần, tốn thêm một dòng nhưng về đích sớm hơn nhiều.'],
      sao: { o: 8, nhip: 11 },
      doiCho: true }),

    man(6, { ten: 'Hàm dùng chung',
      deBai: 'Nhện và drone cùng dùng lệnh go_up(), go_right(), nên một hàm viết một lần chạy được trên cả hai. Làn R1 có hố, làn R2 có thùng. Chọn xe, tự viết một hàm rồi cho cả hai xe gọi. Mỗi xe chỉ có 3 ô chương trình chính.',
      san: LEO,
      doi: [{ batDau: { x: 0, y: 5, huong: 0 }, co: [{ x: 3, y: 1 }] }, { batDau: { x: 5, y: 5, huong: 0 }, co: [{ x: 7, y: 0 }] }],
      chonDoi: { menu: ['XE', 'NHEN', 'DRONE'], cachMau: [CACH(['DRONE', 'NHEN'], ['leo()', 'go_right()', 'leo()'], ['leo()', 'go_up()', 'leo()'], [H('leo', ['go_up()', 'go_up()', 'go_right()'])])] },
      khung: { chinh: 3 },
      goiY: ['Đoạn lặp lại trên cả hai làn: lên, lên, sang phải.', 'R1 gọi hàm, sang phải, gọi hàm. R2 gọi hàm, lên, gọi hàm.'],
      sao: { o: 9, nhip: 14 } }),

    man(7, { ten: 'Người giữ cửa',
      deBai: 'Drone bay qua hố tới cửa. Xe thứ hai đi đường dài tới nút, đứng giữ cửa rồi đi nốt tới cờ. Người giữ cửa là xe thì nhanh, là nhện thì gọn. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: GIU,
      doi: [{ batDau: { x: 0, y: 6, huong: 0 }, co: [{ x: 0, y: 0 }] }, { batDau: { x: 2, y: 6, huong: 0 }, co: [{ x: 8, y: 0 }] }],
      chonDoi: { menu: ['XE', 'NHEN', 'DRONE'], cachMau: [
        CACH(['DRONE', 'NHEN'], UP(4).concat(FOR(14, ['wait()']), UP(2)), UP(4).concat(FOR(6, ['go_right()']), UP(2))),
        CACH(['DRONE', 'XE'], UP(4).concat(FOR(7, ['wait()']), UP(2)), TIEN(4).concat(['turn_right()'], TIEN(6), ['turn_left()'], TIEN(2)))
      ] },
      goiY: ['Nhện không phải quay nên ít dòng, nhưng 2 nhịp mới được một ô.', 'Dù chọn xe nào, drone cũng phải đợi tới lúc cửa mở.'],
      sao: { o: 12, nhip: 16 },
      doiCho: true }),

    man(8, { ten: 'Bắc cầu qua sông',
      deBai: 'Đưa thùng gỗ tới ô đích bên kia sông và kéo bè vào bến. Thùng nằm trong hốc, lưới không với tới. Bè nằm đúng bến thì thành cầu cho xe đi qua. R2 đứng dưới nước. Chọn hai cỗ máy rồi viết cả hai chương trình.',
      san: CAU,
      mucTieu: 'dua-vat',
      vo: 'song',
      doi: [{ batDau: { x: 0, y: 1, huong: 1 } }, { batDau: { x: 4, y: 2, huong: 0 } }],
      chonDoi: { menu: ['XE', 'NHEN', 'XUONG', 'DRONE'], menuXe: [['XE', 'NHEN', 'DRONE'], ['XUONG', 'DRONE']], cachMau: [CACH(['XE', 'XUONG'],
        ['forward()', 'turn_left()', 'pick()', 'turn_right()'].concat(TIEN(6), ['drop()']),
        ['cast_net()', 'backward()', 'drop_net()'])] },
      sao: { o: 10, nhip: 15 },
      huyHieu: { ma: 'm5-c3-chon-xe', ten: 'Chọn người chọn việc' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();

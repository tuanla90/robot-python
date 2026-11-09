/* ============================================================================
   man-m5-lap-part.js — diem10code-python: MÙA 5 Đồng đội, CỘT 4 "Lắp part": em lắp thân, tay, cảm biến cho từng xe rồi mới viết code.
   Mã cỗ máy là "thân|tay|cảm biến" (co-may.js), chỉ các cặp part đã gặp trong 4 mùa, mỗi xe một cảm biến. m.chonDoi.khe nói màn này có những part nào, giao diện hiện từng khe thay vì thẻ xe.
   Tay kẹp nhặt được cả gỗ lẫn sắt nhưng tốn nhịp, nam châm chỉ hút sắt nhưng nhanh; xe nhanh nhưng phải quay, nhện chậm mà ít dòng; lắp giống nhau mới dùng chung được hàm.
   8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;
  var CoMay = laNode ? require('./co-may.js') : window.CoMay;

  var KEP = 'nhen|kep|khoang-cach', HUT = 'nhen|nam-cham|khoang-cach', DO_TU = 'nhen|nam-cham|tu', XE = 'hai-banh|kep|khoang-cach';
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }
  function DI(huong, n) { return FOR(n, ['go_' + huong + '()']); }
  function TIEN(n) { return FOR(n, ['forward()']); }
  /** Cách lắp của màn: chon là mã hai xe, r1 và r2 là code hai xe. */
  function CACH(chon, r1, r2, ham) {
    var lg = { doi: [{ chinh: r1 }, { chinh: r2 }] };
    if (ham) lg.hamCuaEmMoi = ham;
    return { chon: chon, loiGiai: lg };
  }
  /** Khe part của màn: { than, tay, cam } thành bảng chọn cho LapRap. */
  function LAP(khe, cach, macDinh) {
    var o = { khe: khe, menu: CoMay.menuLap(khe), cachMau: cach };
    if (macDinh) o.macDinh = macDinh;
    return o;
  }
  function XE_CO(ma, them) { return Object.assign(CoMay.dung(ma), them); }

  function man(so, m) {
    m.chuong = 'm5-c4-lap-part';
    if (m.chonDoi) {
      var d = CoMay.dung(m.chonDoi.cachMau[0].chon[0]);
      m.loaiRobot = d.loaiRobot; m.robot = d.robot; m.hamGoc = d.hamGoc;
      m.chonDoi.trung = true;
      m.loiGiai = m.chonDoi.cachMau[0].loiGiai;
    } else { m.loaiRobot = m.doi[0].loaiRobot; m.robot = m.doi[0].robot; m.hamGoc = m.doi[0].hamGoc.slice(); }
    m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true;
    m.phienBanNoiDung = 1;
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  var TAY = { than: ['nhen'], tay: ['kep', 'nam-cham'], cam: ['khoang-cach'] };
  var HAI = { than: ['hai-banh', 'nhen'], tay: ['kep', 'nam-cham'], cam: ['khoang-cach', 'tu'] };
  var HAI_THUNG = ['.oD', '###', '.oD'];
  var DOC_CODE = ['..o.D##', '#######', '..o...D'];
  var HAI_LAN = ['.o...D', '######', '.o...D'];
  var GAP = ['###D#D###', '###.#.###', '###.#.###', '....#....', '.#######.', 'o#######o', '.#######.'];
  var BON = ['.oD...oD...', '...oD...oD.'];
  var MOT_HAI = ['.o.o.....', '.........', '.D.D.....'];
  var TRUM = [
    ['....o..o.D.', '###########', '.......o...', '......D....'],
    ['.o...o.D...', '###########', '....o......', '...D.......']
  ];

  ManHoc.them([
    man(1, { ten: 'Cùng thân, khác tay',
      deBai: 'Hai nhện lắp hai tay khác nhau. Tay kẹp phải đứng lên thùng rồi mới nhặt, mất 2 nhịp, nhặt được cả gỗ lẫn sắt. Nam châm bật trước, đi qua thùng sắt là hút, mỗi lệnh chỉ mất 1 nhịp. Đọc code, đoán rồi bấm Chạy.',
      san: HAI_THUNG,
      vatChat: ['...', '...', '.s.'],
      mucTieu: 'dua-vat',
      doi: [XE_CO(KEP, { batDau: { x: 0, y: 0, huong: 1 } }), XE_CO(HUT, { batDau: { x: 0, y: 2, huong: 1 } })],
      duDoan: { hoi: 'Nhện nào đưa thùng tới đích trước?', luaChon: ['R1 lắp tay kẹp', 'R2 lắp nam châm', 'Cùng lúc'], dung: 1, xacMinh: { nhipXe: [6, 5] } },
      sao: { o: 8, nhip: 8 },
      loiGiai: { doi: [{ chinh: ['go_right()', 'pick()', 'go_right()', 'drop()'] }, { chinh: ['magnet_n()', 'go_right()', 'go_right()', 'magnet_off()'] }] } }),

    man(2, { ten: 'Đọc code, lắp part',
      deBai: 'Code đã có sẵn, part thì chưa. Đọc từng dòng để biết mỗi xe cần gì: lệnh go_ cần thân nhện, pick() cần tay kẹp, magnet_n() cần nam châm, front_clear() cần cảm biến khoảng cách, front_metal() cần cảm biến từ. Lắp đúng, rồi điền dòng còn thiếu của R1.',
      san: DOC_CODE,
      vatChat: ['.......', '.......', '..s....'],
      mucTieu: 'dua-vat',
      doi: [{ batDau: { x: 0, y: 0, huong: 1 } }, { batDau: { x: 0, y: 2, huong: 1 } }],
      chonDoi: LAP(HAI, [CACH([KEP, DO_TU],
        ['go_right()', 'go_right()', 'pick()', 'while front_clear():', '    go_right()', 'drop()'],
        ['if front_metal():', '    magnet_n()'].concat(DI('right', 6), ['magnet_off()']))]),
      maMau: { doi: [{ chinh: ['go_right()', 'go_right()', '', 'while front_clear():', '    go_right()', 'drop()'] }, { chinh: ['if front_metal():', '    magnet_n()'].concat(DI('right', 6), ['magnet_off()']) }] },
      goiY: ['Khay lệnh chỉ hiện lệnh của part đang lắp. Thiếu lệnh nào thì bấm Lắp lại ở thanh trên, code vẫn được giữ.', 'R1 đã có drop() ở cuối, nên phải có lệnh nhặt tương ứng.'],
      sao: { o: 11, nhip: 14 } }),

    man(3, { ten: 'Đổi tay, sót lệnh',
      deBai: 'R1 vừa tháo nam châm để lắp tay kẹp vì thùng của R1 là thùng gỗ. Nhưng code còn sót một lệnh của nam châm. Giữ nguyên part, sửa đúng một dòng.',
      san: HAI_THUNG,
      vatChat: ['...', '...', '.s.'],
      mucTieu: 'dua-vat',
      doi: [{ batDau: { x: 0, y: 0, huong: 1 } }, { batDau: { x: 0, y: 2, huong: 1 } }],
      chonDoi: LAP(TAY, [CACH([KEP, HUT], ['go_right()', 'pick()', 'go_right()', 'drop()'], ['magnet_n()', 'go_right()', 'go_right()', 'magnet_off()'])], [KEP, HUT]),
      maMau: { doi: [{ chinh: ['go_right()', 'pick()', 'go_right()', 'magnet_off()'] }, { chinh: ['magnet_n()', 'go_right()', 'go_right()', 'magnet_off()'] }] },
      goiY: ['Dòng tô đỏ là lệnh mà part đang lắp không có. Tay kẹp đặt thùng xuống bằng lệnh nào?'],
      sao: { o: 8, nhip: 8 } }),

    man(4, { ten: 'Thùng nào tay nấy',
      deBai: 'Trên là thùng gỗ, dưới là thùng sắt, cùng một quãng đường. Lắp tay cho từng nhện rồi viết code. Tay kẹp nào cũng làm được hết, nhưng lắp đúng thì mới đủ ba sao.',
      san: HAI_LAN,
      vatChat: ['......', '......', '.s....'],
      mucTieu: 'dua-vat',
      doi: [{ batDau: { x: 0, y: 0, huong: 1 } }, { batDau: { x: 0, y: 2, huong: 1 } }],
      chonDoi: LAP(TAY, [CACH([KEP, HUT], ['go_right()', 'pick()'].concat(DI('right', 4), ['drop()']), ['magnet_n()'].concat(DI('right', 5), ['magnet_off()']))]),
      goiY: ['Nam châm không hút được gỗ.', 'Thùng sắt dùng nam châm: bật trước rồi đi một mạch, ít dòng hơn và nhanh hơn tay kẹp.'],
      sao: { o: 9, nhip: 14 } }),

    man(5, { ten: 'Bánh hay chân',
      deBai: 'Hai thùng phải qua hai đường gấp khúc. Thân xe nhặt thùng ngay trước mũi và chạy nhanh, nhưng mỗi lần rẽ tốn thêm một dòng và 2 nhịp. Thân nhện phải đứng lên thùng, đi chậm, nhưng không phải rẽ. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: GAP,
      mucTieu: 'dua-vat',
      doi: [{ batDau: { x: 0, y: 6, huong: 0 } }, { batDau: { x: 8, y: 6, huong: 0 } }],
      chonDoi: LAP({ than: ['hai-banh', 'nhen'], tay: ['kep'], cam: ['khoang-cach'] }, [
        CACH([KEP, KEP],
          ['go_up()', 'pick()'].concat(DI('up', 2), DI('right', 3), DI('up', 3), ['drop()']),
          ['go_up()', 'pick()'].concat(DI('up', 2), DI('left', 3), DI('up', 3), ['drop()'])),
        CACH([XE, XE],
          ['pick()'].concat(TIEN(3), ['turn_right()'], TIEN(3), ['turn_left()'], TIEN(2), ['drop()']),
          ['pick()'].concat(TIEN(3), ['turn_left()'], TIEN(3), ['turn_right()'], TIEN(2), ['drop()']))
      ]),
      goiY: ['Nhện: ba vòng for, không có dòng rẽ.', 'Xe: thùng ở ngay trước mũi nên nhặt luôn, tới sát ô đích rồi đặt xuống.'],
      sao: { o: 18, nhip: 16 },
      doiCho: true }),

    man(6, { ten: 'Lắp giống nhau, dùng chung hàm',
      deBai: 'Bốn thùng sắt. Hai xe lắp giống nhau thì một hàm chạy được trên cả hai. Lắp part, tự viết một hàm mang một thùng qua 2 ô, rồi cho cả hai xe gọi. Mỗi xe chỉ có 3 ô chương trình chính.',
      san: BON,
      vatChat: ['.s....s....', '...s....s..'],
      mucTieu: 'dua-vat',
      doi: [{ batDau: { x: 0, y: 0, huong: 1 } }, { batDau: { x: 5, y: 0, huong: 1 } }],
      chonDoi: LAP(TAY, [CACH([HUT, HUT], ['mang()', 'go_down()', 'mang()'], ['mang()', 'go_down()', 'mang()'], [H('mang', ['magnet_n()', 'go_right()', 'go_right()', 'magnet_off()'])])]),
      khung: { chinh: 3 },
      goiY: ['Hàm gồm bốn dòng: bật nam châm, đi hai ô, tắt nam châm.', 'Mỗi xe: gọi hàm, xuống một ô, gọi hàm.'],
      sao: { o: 10, nhip: 14 } }),

    man(7, { ten: 'Một tay làm hết',
      deBai: 'Một thùng gỗ, một thùng sắt. Tay kẹp nhặt được cả hai, nên R1 có thể làm hết: viết gọn nhưng lâu. Hai xe cùng làm thì nhanh nhưng viết nhiều. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: MOT_HAI,
      vatChat: ['...s.....', '.........', '.........'],
      mucTieu: 'dua-vat',
      doi: [{ batDau: { x: 0, y: 0, huong: 1 } }, { batDau: { x: 8, y: 0, huong: 3 } }],
      chonDoi: LAP(TAY, [
        CACH([KEP, KEP], FOR(2, ['go_right()', 'pick()', 'go_down()', 'go_down()', 'drop()', 'go_up()', 'go_up()', 'go_right()']), []),
        CACH([KEP, HUT], ['go_right()', 'pick()', 'go_down()', 'go_down()', 'drop()'], ['magnet_n()'].concat(DI('left', 5), ['go_down()', 'go_down()', 'magnet_off()']))
      ]),
      goiY: ['R1 làm hết: hai thùng cách nhau 2 ô, lặp lại đúng một thao tác.', 'Hai xe: R2 lắp nam châm, bật rồi đi một mạch sang thùng sắt.'],
      sao: { o: 9, nhip: 16 },
      doiCho: true }),

    man(8, { ten: 'Xưởng lắp ráp',
      deBai: 'Hai sân, vật nằm khác chỗ nhau. Trên có thùng gỗ lẫn thùng sắt, phải tìm đúng thùng sắt rồi đưa tới ô đích cách nó 2 ô, thùng gỗ để yên. Dưới có một thùng sắt, dò tới sát thùng, nhặt rồi đặt xuống ô đích ngay bên phải. Tự lắp part, tự viết cả hai chương trình.',
      san: TRUM,
      vatChat: [['.......s...', '...........', '.......s...', '...........'], ['.....s.....', '...........', '....s......', '...........']],
      vatCan: 'tu',
      mucTieu: 'dua-vat',
      doi: [{ batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }] }, { batDau: [{ x: 0, y: 2, huong: 1 }, { x: 0, y: 2, huong: 1 }] }],
      chonDoi: LAP(HAI, [CACH([DO_TU, XE],
        ['while not front_metal():', '    go_right()', 'magnet_n()'].concat(DI('right', 4), ['magnet_off()']),
        ['while front_clear():', '    forward()', 'pick()', 'turn_right()', 'drop()'])]),
      sao: { o: 11, nhip: 20 },
      huyHieu: { ma: 'm5-c4-lap-part', ten: 'Thợ lắp ráp' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();

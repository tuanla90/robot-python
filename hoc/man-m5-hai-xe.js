/* ============================================================================
   man-m5-hai-xe.js — diem10code-python: MÙA 5 Đồng đội, CỘT 2 "Hai chương trình": em viết cả hai xe, xe do màn định sẵn.
   Dạy chia việc: ai giữ cửa, ai lấp hố, một xe làm hết hay hai xe cùng làm, một hàm dùng chung cho cả hai xe.
   8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var XE = ManHoc.CO_MAY.XE, NHEN = ManHoc.CO_MAY.NHEN;
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }
  function CHAT(san, x, y) { return san.map(function (h, j) { return h.replace(/./g, function (c, i) { return i === x && j === y ? 's' : '.'; }); }); }
  function DOI(r1, r2) { return [ManHoc.xeDoi(r1.may || XE, r1), ManHoc.xeDoi(r2.may || XE, r2)]; }

  function man(so, m) {
    m.chuong = 'm5-c2-hai-xe';
    m.loaiRobot = XE.loaiRobot; m.robot = XE.robot; m.hamGoc = XE.hamGoc.slice();
    m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true;
    m.phienBanNoiDung = 1;
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  var CUA = ['..F..', '##C##', '.....', '##.#F'];
  var LAP = ['###F###', '###.###', '.o.u..F', '###.###', '###.###'];
  var GIU = ['..F..', '##C##', '.....', '##M##', '##F##'];
  var TRUM = ['.o..u..C.D', '####.M####', '####o#####', '####.#####'];

  ManHoc.them([
    man(1, { ten: 'Ai nhanh hơn',
      deBai: 'Xe tiến 1 nhịp nhưng quay 2 nhịp. Nhện đi 2 nhịp một ô nhưng không phải quay. Hai xe đi cùng lúc, mỗi xe tới một cờ. Đọc code, đoán rồi bấm Chạy.',
      san: ['.FF.', '....', '....'],
      doi: DOI({ batDau: { x: 0, y: 2, huong: 0 }, co: [{ x: 1, y: 0 }] }, { may: NHEN, batDau: { x: 3, y: 2, huong: 0 }, co: [{ x: 2, y: 0 }] }),
      duDoan: { hoi: 'Xe nào tới cờ trước?', luaChon: ['R1 là xe', 'R2 là nhện', 'Cùng lúc'], dung: 0, xacMinh: { nhipXe: [5, 6] } },
      sao: { o: 7, nhip: 6 },
      loiGiai: { doi: [{ chinh: ['forward()', 'forward()', 'turn_right()', 'forward()'] }, { chinh: ['go_up()', 'go_up()', 'go_left()'] }] } }),

    man(2, { ten: 'Thiếu mỗi xe một lệnh',
      deBai: 'Giờ em viết cả hai xe. R2 đi tới nút M giữ cửa, R1 qua cửa C. Mỗi xe thiếu một lệnh ở ô trống, chạm R1, R2 để điền đủ.',
      san: CUA.map(function (h, j) { return j === 2 ? '....M' : h; }),
      doi: DOI({ batDau: { x: 2, y: 3, huong: 0 }, co: [{ x: 2, y: 0 }] }, { batDau: { x: 0, y: 2, huong: 1 }, co: [{ x: 4, y: 3 }] }),
      maMau: { doi: [{ chinh: ['wait()', '', 'wait()'].concat(FOR(3, ['forward()'])) }, { chinh: ['forward()', 'forward()', 'forward()', 'forward()', '', 'forward()'] }] },
      goiY: ['R1 phải đợi R2 đi qua ô giữa và đứng lên nút M đã.', 'R2 đứng trên nút xong thì quay về phía cờ của nó rồi mới tiến.'],
      sao: { o: 11, nhip: 7 },
      loiGiai: { doi: [{ chinh: ['wait()', 'wait()', 'wait()'].concat(FOR(3, ['forward()'])) }, { chinh: ['forward()', 'forward()', 'forward()', 'forward()', 'turn_right()', 'forward()'] }] } }),

    man(3, { ten: 'Nhện quên thả thùng',
      deBai: 'Nhện mang thùng tới hố mà không lấp, nên nhện không đi tiếp được và xe rơi xuống hố. Sửa đúng một dòng trong code của R2.',
      san: LAP,
      vatChat: CHAT(LAP, 1, 2),
      doi: DOI({ batDau: { x: 3, y: 4, huong: 0 }, co: [{ x: 3, y: 0 }] }, { may: NHEN, batDau: { x: 0, y: 2, huong: 1 }, co: [{ x: 6, y: 2 }] }),
      maMau: { doi: [{ chinh: FOR(10, ['wait()']).concat(FOR(4, ['forward()'])) }, { chinh: ['go_right()', 'magnet_n()', 'go_right()', 'go_right()', 'wait()', 'go_right()', 'go_right()', 'go_right()'] }] },
      goiY: ['Nam châm còn bật thì thùng dưới hố giữ nhện lại. Lệnh nào thả thùng xuống?'],
      sao: { o: 12, nhip: 14 },
      loiGiai: { doi: [{ chinh: FOR(10, ['wait()']).concat(FOR(4, ['forward()'])) }, { chinh: ['go_right()', 'magnet_n()', 'go_right()', 'go_right()', 'magnet_off()', 'go_right()', 'go_right()', 'go_right()'] }] } }),

    man(4, { ten: 'Trao thùng',
      deBai: 'R2 đứng chắn ngay cạnh ô đích D. Để R1 đặt thùng trước mặt R2, rồi R2 nhặt và đặt vào D. Viết code cho cả hai xe.',
      san: ['.o.....', '#####D#'],
      mucTieu: 'dua-vat',
      doi: DOI({ batDau: { x: 0, y: 0, huong: 1 } }, { batDau: { x: 5, y: 0, huong: 3 } }),
      goiY: ['R1 đặt thùng ở ô ngay trước mũi R2. Tay kẹp nhặt và đặt đều làm với ô trước mũi, mất 2 nhịp.', 'R2 phải đợi thùng tới rồi mới nhặt, sau đó quay về phía D.'],
      sao: { o: 9, nhip: 13 },
      loiGiai: { doi: [{ chinh: ['pick()'].concat(FOR(3, ['forward()']), ['drop()']) }, { chinh: FOR(7, ['wait()']).concat(['pick()', 'turn_left()', 'drop()']) }] } }),

    man(5, { ten: 'Ai giữ cửa cũng được',
      deBai: 'Một xe đứng trên nút M giữ cửa C, xe kia qua cửa tới cờ phía trên. Xong xe giữ cửa xuống cờ phía dưới. Xe nào làm việc nào do em chọn.',
      san: GIU,
      doi: DOI({ batDau: { x: 0, y: 2, huong: 1 } }, { batDau: { x: 4, y: 2, huong: 3 } }),
      goiY: ['Cả hai xe đều phải qua ô giữa, nên một xe đi trước, xe kia đợi.', 'Xe giữ cửa chỉ được xuống cờ khi xe kia đã qua hẳn cửa.'],
      sao: { o: 14, nhip: 11 },
      loiGiai: { doi: [{ chinh: ['forward()', 'forward()', 'turn_right()', 'forward()'].concat(FOR(4, ['wait()']), ['forward()']) }, { chinh: FOR(5, ['wait()']).concat(['forward()', 'forward()', 'turn_right()', 'forward()', 'forward()']) }] },
      cachKhac: [{ doi: [{ chinh: FOR(5, ['wait()']).concat(['forward()', 'forward()', 'turn_left()', 'forward()', 'forward()']) }, { chinh: ['forward()', 'forward()', 'turn_left()', 'forward()'].concat(FOR(4, ['wait()']), ['forward()']) }] }] }),

    man(6, { ten: 'Một hàm cho hai xe',
      deBai: 'Hai xe cùng leo hai bậc thang giống nhau. Viết một hàm tự đặt tên rồi cho cả hai xe cùng gọi. Mỗi xe chỉ có 3 ô chương trình chính.',
      san: ['######', '###F#F', '##....', '#....#', '....##'],
      doi: DOI({ batDau: { x: 0, y: 4, huong: 0 }, co: [{ x: 3, y: 1 }] }, { batDau: { x: 2, y: 4, huong: 0 }, co: [{ x: 5, y: 1 }] }),
      khung: { chinh: 3 },
      goiY: ['Một bậc gồm 4 lệnh: quay phải, tiến, quay trái, tiến.', 'Hàm viết một lần, xe nào gọi cũng được. Số ô chỉ tính hàm đó một lần.'],
      sao: { o: 10, nhip: 18 },
      loiGiai: { doi: [{ chinh: ['bac()', 'bac()', 'bac()'] }, { chinh: ['bac()', 'bac()', 'bac()'] }], hamCuaEmMoi: [H('bac', ['turn_right()', 'forward()', 'turn_left()', 'forward()'])] } }),

    man(7, { ten: 'Một xe hay hai xe',
      deBai: 'Có hai thùng và hai ô đích. R1 đứng gần cả hai thùng, R2 ở xa. R1 làm hết thì viết gọn nhưng lâu, hai xe cùng làm thì nhanh nhưng viết nhiều. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: ['.o.o.....', '.........', '.D.D.....'],
      mucTieu: 'dua-vat',
      doi: DOI({ batDau: { x: 1, y: 1, huong: 0 } }, { batDau: { x: 8, y: 1, huong: 3 } }),
      goiY: ['Cả hai thùng cùng một kiểu: nhặt ở trên, đặt ở dưới. Một xe làm hết thì lặp lại đúng thao tác đó.', 'R2 đi tới thùng bên phải rồi cũng làm thao tác đó, hai xe xong gần như cùng lúc.'],
      sao: { o: 9, nhip: 15 },
      doiCho: true,
      loiGiai: { doi: [{ chinh: FOR(2, ['pick()', 'turn_right()', 'turn_right()', 'drop()', 'turn_left()', 'forward()', 'forward()', 'turn_left()']) }, { chinh: [] }] },
      cachKhac: [{ doi: [{ chinh: ['pick()', 'turn_right()', 'turn_right()', 'drop()'] }, { chinh: FOR(5, ['forward()']).concat(['turn_right()', 'pick()', 'turn_right()', 'turn_right()', 'drop()']) }] }] }),

    man(8, { ten: 'Lấp hố rồi giữ cửa',
      deBai: 'R1 phải đưa thùng gỗ tới ô đích D. Trên đường có một hố và một cửa. Nhện phải lấp hố rồi đứng lên nút M giữ cửa. Viết cả hai chương trình.',
      san: TRUM,
      vatChat: CHAT(TRUM, 4, 2),
      mucTieu: 'dua-vat',
      doi: DOI({ batDau: { x: 0, y: 0, huong: 1 } }, { may: NHEN, batDau: { x: 4, y: 3, huong: 0 } }),
      sao: { o: 15, nhip: 17 },
      loiGiai: { doi: [{ chinh: ['pick()'].concat(FOR(3, ['forward()']), FOR(5, ['wait()']), FOR(5, ['forward()']), ['drop()']) }, { chinh: ['go_up()', 'magnet_n()', 'go_up()', 'go_up()', 'magnet_off()', 'go_down()', 'go_right()'] }] },
      huyHieu: { ma: 'm5-c2-hai-xe', ten: 'Chia việc cho đội' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();

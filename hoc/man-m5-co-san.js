/* ============================================================================
   man-m5-co-san.js — diem10code-python: MÙA 5 Đồng đội, CỘT 1 "Xe có sẵn": sân có hai xe, em viết R1, R2 khóa nhưng mở xem được code.
   Dạy đọc code xe kia để biết phải đợi mấy nhịp. Xe chạy cùng lúc; đụng nhau là thua; chạy xong mỗi xe phải đứng đúng cờ của mình.
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
  /** R1 của em, R2 khóa. */
  function DOI(r1, r2) { return [ManHoc.xeDoi(XE, r1), Object.assign(ManHoc.xeDoi(r2.may || XE, r2), { coDinh: true })]; }

  function man(so, m) {
    m.chuong = 'm5-c1-co-san';
    m.loaiRobot = XE.loaiRobot; m.robot = XE.robot; m.hamGoc = XE.hamGoc.slice();
    m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true;
    m.phienBanNoiDung = 1;
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  var CUA = ['..F..', '##C##', 'M....', 'F#.##'];
  var LAP = ['###F###', '###.###', '.o.u..F', '###.###', '###.###'];
  var NHEN_LAP = ['go_right()', 'magnet_n()', 'go_right()', 'go_right()', 'magnet_off()', 'go_right()', 'go_right()', 'go_right()'];
  var TRUM = ['..o.u.D', '####.##', '####o##', '####.##'];

  ManHoc.them([
    man(1, { ten: 'Ai qua ngã tư trước',
      deBai: 'Sân này có hai xe, mỗi xe một chương trình, chạy cùng lúc. Chạm R1, R2 để xem code từng xe. wait() đứng yên 1 nhịp. Hai xe đụng nhau là thua, chạy xong mỗi xe phải đứng đúng cờ của mình. Đọc code, đoán rồi bấm Chạy.',
      san: ['..F..', '.....', '....F', '.....', '.....'],
      doi: DOI({ batDau: { x: 0, y: 2, huong: 1 }, co: [{ x: 4, y: 2 }] }, { batDau: { x: 2, y: 4, huong: 0 }, co: [{ x: 2, y: 0 }] }),
      duDoan: { hoi: 'Xe nào tới cờ trước?', luaChon: ['R1', 'R2', 'Cùng lúc'], dung: 1, xacMinh: { nhipXe: [6, 4] } },
      sao: { o: 4, nhip: 6 },
      loiGiai: { doi: [{ chinh: FOR(2, ['wait()']).concat(FOR(4, ['forward()'])) }, { chinh: FOR(4, ['forward()']) }] } }),

    man(2, { ten: 'Nhường đường',
      deBai: 'R2 chạy ngang qua ô giữa. R1 đi thẳng lên thì đụng R2. Điền một lệnh vào ô trống để R1 nhường đường.',
      san: ['..F..', '....F', '.....', '.....'],
      doi: DOI({ batDau: { x: 2, y: 3, huong: 0 }, co: [{ x: 2, y: 0 }] }, { batDau: { x: 0, y: 1, huong: 1 }, co: [{ x: 4, y: 1 }] }),
      maMau: { doi: [{ chinh: ['wait()', '', 'forward()', 'forward()', 'forward()'] }, { chinh: [] }] },
      goiY: ['R2 vào ô giữa ở nhịp 2 và rời đi ở nhịp 3. Xe kia đi khỏi hẳn rồi mới vào ô đó được, nên R1 phải đứng yên 2 nhịp.'],
      sao: { o: 5, nhip: 5 },
      loiGiai: { doi: [{ chinh: ['wait()', 'wait()', 'forward()', 'forward()', 'forward()'] }, { chinh: FOR(4, ['forward()']) }] } }),

    man(3, { ten: 'Đi sớm là đâm cửa',
      deBai: 'R2 đi tới nút M rồi đứng đó giữ cửa C mở, xong mới về cờ của nó. R1 đợi ít quá nên đụng R2. Mở thẻ R2 đọc code, rồi sửa đúng một số ở R1.',
      san: CUA,
      doi: DOI({ batDau: { x: 2, y: 3, huong: 0 }, co: [{ x: 2, y: 0 }] }, { batDau: { x: 4, y: 2, huong: 3 }, co: [{ x: 0, y: 3 }] }),
      maMau: { doi: [{ chinh: FOR(1, ['wait()']).concat(FOR(3, ['forward()'])) }, { chinh: [] }] },
      goiY: ['R2 tới nút M ở nhịp 4, cửa mở từ lúc đó. R1 cũng phải đợi R2 đi khỏi ô giữa.'],
      sao: { o: 4, nhip: 10 },
      loiGiai: { doi: [{ chinh: FOR(3, ['wait()']).concat(FOR(3, ['forward()'])) }, { chinh: FOR(4, ['forward()']).concat(FOR(3, ['wait()']), ['turn_left()', 'forward()']) }] } }),

    man(4, { ten: 'Đợi nhện lấp hố',
      deBai: 'R2 là nhện, đang mang thùng sắt đi lấp hố. Hố chưa lấp mà R1 đi vào thì rơi. Mở thẻ R2 đếm xem bao giờ nhện rời khỏi ô hố, rồi viết code cho R1 tới cờ.',
      san: LAP,
      vatChat: CHAT(LAP, 1, 2),
      doi: DOI({ batDau: { x: 3, y: 4, huong: 0 }, co: [{ x: 3, y: 0 }] }, { may: NHEN, batDau: { x: 0, y: 2, huong: 1 }, co: [{ x: 6, y: 2 }] }),
      goiY: ['Nhện đi 1 ô mất 2 nhịp, nam châm mất 1 nhịp. Cộng lại đến lúc nhện đi khỏi ô hố.', 'Xe có thể tiến trước rồi đợi, hay đợi xong mới tiến, miễn đừng vào ô hố quá sớm.'],
      sao: { o: 4, nhip: 14 },
      loiGiai: { doi: [{ chinh: FOR(10, ['wait()']).concat(FOR(4, ['forward()'])) }, { chinh: NHEN_LAP }] } }),

    man(5, { ten: 'Đợi hay đi vòng',
      deBai: 'R2 đang chiếm lối bên trái một lúc. R1 có thể đợi R2 đi khỏi rồi đi tiếp, hay đi vòng bên phải. Em chọn đường nào cũng được.',
      san: ['....F', '.###.', '.F...', '.###.', '.....'],
      doi: DOI({ batDau: { x: 0, y: 4, huong: 0 }, co: [{ x: 4, y: 0 }] }, { batDau: { x: 0, y: 1, huong: 2 }, co: [{ x: 1, y: 2 }] }),
      goiY: ['Đi vòng bên phải không phải đợi ai, đi bên trái thì phải đợi R2.'],
      sao: { o: 6, nhip: 12 },
      loiGiai: { doi: [{ chinh: ['turn_right()'].concat(FOR(4, ['forward()']), ['turn_left()'], FOR(4, ['forward()'])) }, { chinh: ['forward()', 'turn_left()', 'forward()'] }] },
      cachKhac: [{ doi: [{ chinh: ['forward()'].concat(FOR(3, ['wait()']), FOR(3, ['forward()']), ['turn_right()'], FOR(4, ['forward()'])) }, { chinh: ['forward()', 'turn_left()', 'forward()'] }] }] }),

    man(6, { ten: 'Bậc thang: đợi rồi leo',
      deBai: 'R1 leo bậc thang, R2 cắt ngang lối ở giữa đường. Gom một bậc vào hàm tự đặt tên, chương trình chính của R1 chỉ có 5 ô.',
      san: ['###F', '##..', 'F...', '..##'],
      doi: DOI({ batDau: { x: 0, y: 3, huong: 0 }, co: [{ x: 3, y: 0 }] }, { batDau: { x: 3, y: 2, huong: 3 }, co: [{ x: 0, y: 2 }] }),
      khung: { chinh: 5 },
      goiY: ['Một bậc gồm 4 lệnh: quay phải, tiến, quay trái, tiến. Có 3 bậc.', 'R2 đi qua ô giữa bậc thang ở nhịp 7, R1 phải đợi nó đi hẳn.'],
      sao: { o: 9, nhip: 21 },
      loiGiai: { doi: [{ chinh: FOR(3, ['wait()']).concat(['bac()', 'bac()', 'bac()']), }, { chinh: FOR(5, ['wait()']).concat(FOR(3, ['forward()'])) }], hamCuaEmMoi: [H('bac', ['turn_right()', 'forward()', 'turn_left()', 'forward()'])] } }),

    man(7, { ten: 'Đợi cho gọn, vòng cho nhanh',
      deBai: 'R2 đứng chắn lối thẳng một lúc lâu rồi mới đi. Một sao cho bài gọn, một sao cho bài nhanh, hai sao này lấy bằng hai bài khác nhau được. Em đợi hay đi vòng?',
      san: ['###F###', 'F......', '.......'],
      doi: DOI({ batDau: { x: 6, y: 1, huong: 3 }, co: [{ x: 0, y: 1 }] }, { batDau: { x: 3, y: 1, huong: 0 }, co: [{ x: 3, y: 0 }] }),
      goiY: ['Đợi rồi đi thẳng thì chỉ cần hai vòng lặp, nhưng lâu.', 'Đi vòng xuống hàng dưới thì tới sớm, nhưng phải quay nhiều và viết dài hơn.'],
      sao: { o: 4, nhip: 14 },
      doiCho: true,
      loiGiai: { doi: [{ chinh: FOR(12, ['wait()']).concat(FOR(6, ['forward()'])) }, { chinh: FOR(13, ['wait()']).concat(['forward()']) }] },
      cachKhac: [{ doi: [{ chinh: ['turn_left()', 'forward()', 'turn_right()'].concat(FOR(6, ['forward()']), ['turn_right()', 'forward()']) }, { chinh: FOR(13, ['wait()']).concat(['forward()']) }] }] }),

    man(8, { ten: 'Thùng qua hố',
      deBai: 'R1 phải đưa thùng gỗ tới ô đích D, nhưng hố chắn đường. R2 là nhện, sẽ mang thùng sắt tới lấp hố. Tự tính nhịp.',
      san: TRUM,
      vatChat: CHAT(TRUM, 4, 2),
      mucTieu: 'dua-vat',
      doi: DOI({ batDau: { x: 1, y: 0, huong: 1 } }, { may: NHEN, batDau: { x: 4, y: 3, huong: 0 } }),
      sao: { o: 8, nhip: 14 },
      loiGiai: { doi: [{ chinh: ['pick()'].concat(FOR(2, ['forward()']), FOR(6, ['wait()']), FOR(2, ['forward()']), ['drop()']) }, { chinh: ['go_up()', 'magnet_n()', 'go_up()', 'go_up()', 'magnet_off()', 'go_down()'] }] },
      huyHieu: { ma: 'm5-c1-co-san', ten: 'Đọc code đồng đội' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();

/* ============================================================================
   man-loa.js — Mùa 8 (Hang động đá vôi) · Gói 2: Bộ gõ nhịp
   Chương 1: loa (10 màn) — Gõ nhịp vang hang (beat, wait, dieu, dieuToiCo)
   Chương 2: tap-hop (10 màn) — Tập hợp không trùng (Python set: {a, b}, set(), s.add(x), x in s, for x in s, len(s))
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_LOA = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'beat'];

  function bai(chinh, ham, moi) {
    return { chinh: chinh, hamCuaMan: ham || [], hamCuaEmMoi: moi || [] };
  }
  function ham(ten, than, thamSo) {
    return { ten: ten, than: than, thamSo: thamSo || [] };
  }

  function manLoa(so, hang, ds) {
    return Object.assign({
      chuong: 'loa', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: { than: 'gai', tay: 'loa', camBien: [] },
      hamGoc: GOC_LOA.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for'],
      khung: { chinh: 10, moiHam: 10, cauTruc: ['for'] },
      mucTieu: 'choi-dieu'
    }, ds);
  }

  function manTapHop(so, hang, ds) {
    return Object.assign({
      chuong: 'tap-hop', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: { than: 'gai', tay: 'loa', camBien: [] },
      hamGoc: GOC_LOA.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      bienDem: true,
      cauTruc: ['for', 'if', 'return', 'list'],
      khung: { chinh: 12, moiHam: 10, cauTruc: ['for', 'if', 'return', 'list'] },
      mucTieu: 'choi-dieu'
    }, ds);
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: loa — Gõ nhịp vang hang (10 màn)
       ====================================================================== */
    manLoa(1, 'lam-quen', {
      ten: 'Ba tiếng gõ đầu tiên',
      chiChay: true, chinhCoDinh: true,
      dieu: 'xxx',
      deBai: 'Bộ gõ nhịp ở cánh tay phát tiếng trống vang qua vách đá vôi. Mỗi lần gọi beat(), bộ gõ sẽ phát một tiếng trống ở nhịp kế tiếp khi gặp wait(). Bấm Chạy để nghe 3 tiếng gõ liên tiếp.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy: mỗi cặp beat() và wait() tạo ra một nhịp trống x.',
      san: [
        '#####',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['beat()', 'wait()', 'beat()', 'wait()', 'beat()', 'wait()']),
      loiGiai: bai(['beat()', 'wait()', 'beat()', 'wait()', 'beat()', 'wait()']),
      sao: { o: 6, nhip: 3 },
      goiY: [
        'Lệnh beat() chuẩn bị gõ trống, và lệnh wait() kết thúc nhịp để tiếng trống vang lên.',
        'Nhấn nút Chạy để hoàn thành bản nhịp xxx.'
      ]
    }),

    manLoa(2, 'lam-quen', {
      ten: 'Bốn nhịp trống đều',
      dieu: 'xxxx',
      deBai: 'Hang động yêu cầu chuỗi 4 tiếng gõ liên tiếp (xxxx), nhưng mã mẫu mới gõ 3 tiếng. Hãy thêm tiếng gõ thứ tư vào cuối chương trình.',
      veMaMau: 'Chạy thử: mới có 3 tiếng trống. Thêm beat() rồi wait() ở cuối.',
      san: [
        '#####',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['beat()', 'wait()', 'beat()', 'wait()', 'beat()', 'wait()']),
      loiGiai: bai(['beat()', 'wait()', 'beat()', 'wait()', 'beat()', 'wait()', 'beat()', 'wait()']),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới gõ 3 tiếng, thiếu 1 nhịp trống', baiLam: bai(['beat()', 'wait()', 'beat()', 'wait()', 'beat()', 'wait()']), phaiCoMa: ['chua-du-dieu'] },
        { moTa: 'Gọi hai lần beat() liền nhau mà thiếu wait() ở giữa', baiLam: bai(['beat()', 'wait()', 'beat()', 'wait()', 'beat()', 'beat()', 'wait()']), phaiCoMa: ['loa-goi-lai', 'chua-du-dieu'] }
      ],
      sao: { o: 8, nhip: 4 },
      goiY: [
        'Mỗi tiếng trống cần một cặp beat() và wait().',
        'Thêm beat() và wait() vào cuối chương trình.'
      ]
    }),

    manLoa(3, 'lam-quen', {
      ten: 'Vòng lặp tiếng trống',
      dieu: 'xxxxx',
      deBai: 'Dùng vòng lặp for để gõ 5 nhịp trống đều đặn (xxxxx) thật gọn thay vì viết lặp 10 dòng lệnh.',
      veMaMau: 'Mã mẫu mới lặp 4 lần. Đổi số lần lặp trong range(4) thành 5.',
      san: [
        '#####',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['for i in range(4):', '    beat()', '    wait()']),
      loiGiai: bai(['for i in range(5):', '    beat()', '    wait()']),
      loiSai: [
        { moTa: 'Để nguyên range(4): mới gõ 4 nhịp trống', baiLam: bai(['for i in range(4):', '    beat()', '    wait()']), phaiCoMa: ['chua-du-dieu'] },
        { moTa: 'Quên wait() trong vòng lặp: các lệnh beat() đè lên nhau', baiLam: bai(['for i in range(5):', '    beat()']), phaiCoMa: ['quen-wait'] }
      ],
      sao: { o: 3, nhip: 5 },
      goiY: [
        'Chuỗi nhịp xxxxx có 5 tiếng trống liên tiếp.',
        'Sửa range(4) thành range(5).'
      ]
    }),

    manLoa(4, 'lam-quen', {
      ten: 'Nhịp nghỉ giữa hang',
      dieu: 'x.xx',
      deBai: 'Trong bản nhịp x.xx, dấu chấm . là một nhịp nghỉ lặng (chỉ gọi wait() mà không gọi beat()). Hãy bổ sung nhịp nghỉ ở giữa để khớp đúng tiết tấu x.xx.',
      veMaMau: 'Mã mẫu gõ liền 3 tiếng xxx mà quên nhịp nghỉ . sau tiếng trống đầu tiên.',
      san: [
        '#####',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['beat()', 'wait()', 'beat()', 'wait()', 'beat()', 'wait()']),
      loiGiai: bai(['beat()', 'wait()', 'wait()', 'beat()', 'wait()', 'beat()', 'wait()']),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: gõ ngay ở nhịp thứ hai trong khi bản nhạc cần nghỉ', baiLam: bai(['beat()', 'wait()', 'beat()', 'wait()', 'beat()', 'wait()']), phaiCoMa: ['lech-nhip'] },
        { moTa: 'Nghỉ 2 nhịp thay vì 1 nhịp: bị trễ ở nhịp thứ ba', baiLam: bai(['beat()', 'wait()', 'wait()', 'wait()', 'beat()', 'wait()', 'beat()', 'wait()']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 7, nhip: 4 },
      goiY: [
        'Sau cặp beat() và wait() đầu tiên, thêm một dòng wait() để nghỉ 1 nhịp.',
        'Hai nhịp cuối giữ nguyên beat(), wait(), beat(), wait().'
      ]
    }),

    manLoa(5, 'luyen', {
      ten: 'Chế lệnh: hồi trống liền',
      taoHam: ['drum_hit'], chinhCoDinh: true,
      dieu: 'xxxx',
      deBai: 'Tạo hàm drum_hit(n) để gõ liền n nhịp trống bằng vòng lặp for i in range(n): chứa beat() và wait(). Chương trình chính sẽ gọi drum_hit(4).',
      veMaMau: 'Mở Xưởng hàm, tạo drum_hit(n) gồm 3 dòng: for i in range(n):, beat(), wait().',
      san: [
        '#####',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['drum_hit(4)']),
      loiGiai: bai(
        ['drum_hit(4)'],
        [],
        [ham('drum_hit', ['for i in range(n):', '    beat()', '    wait()'], ['n'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm drum_hit', baiLam: bai(['drum_hit(4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gõ thiếu trong drum_hit (chỉ gõ 1 lần ngoài vòng lặp)', baiLam: bai(['drum_hit(4)']), hamCuaEmMoi: [ham('drum_hit', ['beat()', 'wait()'], ['n'])], phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 4, nhip: 4 },
      goiY: [
        'Trong thân hàm drum_hit(n), viết for i in range(n): rồi thụt lề beat() và wait().',
        'Khi drum_hit(4) chạy, robot gõ đúng 4 nhịp trống xxxx.'
      ]
    }),

    manLoa(6, 'luyen', {
      ten: 'Tiếng vọng đôi và ba',
      hamCuaEmCan: ['drum_hit'],
      dieu: 'xx.xxx',
      deBai: 'Kết hợp hàm drum_hit(n) với lệnh wait() để gõ tiết tấu xx.xxx: gõ 2 tiếng trống, nghỉ 1 nhịp, rồi gõ 3 tiếng trống.',
      veMaMau: 'Mã mẫu đã gõ 2 tiếng đầu và nghỉ 1 nhịp. Hãy gọi thêm drum_hit(3) ở cuối.',
      san: [
        '#####',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['drum_hit(2)', 'wait()']),
      loiGiai: bai(['drum_hit(2)', 'wait()', 'drum_hit(3)']),
      loiSai: [
        { moTa: 'Chưa viết hồi trống sau nhịp nghỉ', baiLam: bai(['drum_hit(2)', 'wait()']), phaiCoMa: ['chua-du-dieu'] },
        { moTa: 'Gọi drum_hit(2) ở cuối thay vì drum_hit(3): thiếu tiếng trống cuối', baiLam: bai(['drum_hit(2)', 'wait()', 'drum_hit(2)']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 6, nhip: 6 },
      goiY: [
        'Sau lệnh wait() ở dòng 2, cần 3 nhịp trống liên tiếp.',
        'Thêm dòng drum_hit(3) vào cuối chương trình.'
      ]
    }),

    manLoa(7, 'luyen', {
      ten: 'Chế lệnh: vừa bước vừa gõ',
      taoHam: ['march_beat'], chinhCoDinh: true,
      dieu: 'xxx',
      dieuToiCo: true,
      deBai: 'Trong cùng một nhịp wait(), robot có thể vừa lăn bánh tiến 1 ô vừa gõ 1 tiếng trống. Hãy tạo hàm march_beat(n) lặp n lần 4 lệnh: left_move(), right_move(), beat(), wait() để vừa đi 3 bước qua đá ướt tới cờ vừa gõ đủ xxx.',
      veMaMau: 'Mở Xưởng hàm, tạo march_beat(n) có vòng lặp for i in range(n): gọi left_move(), right_move(), beat(), wait().',
      san: [
        '######',
        '#.IIF#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['march_beat(3)']),
      loiGiai: bai(
        ['march_beat(3)'],
        [],
        [ham('march_beat', ['for i in range(n):', '    left_move()', '    right_move()', '    beat()', '    wait()'], ['n'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm march_beat', baiLam: bai(['march_beat(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ gõ trống mà quên bật hai bánh: đứng yên tại chỗ chưa tới cờ', baiLam: bai(['march_beat(3)']), hamCuaEmMoi: [ham('march_beat', ['for i in range(n):', '    beat()', '    wait()'], ['n'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 6, nhip: 3 },
      goiY: [
        'Đặt left_move(), right_move() và beat() trước cùng một lệnh wait() trong thân vòng lặp.',
        'Khi kết thúc 3 nhịp, robot vừa đứng trên cờ (4, 1) vừa hoàn thành chuỗi nhịp xxx.'
      ]
    }),

    manLoa(8, 'bien-the', {
      ten: 'Khúc cua gõ nhịp',
      hamCuaEmCan: ['turn_right', 'march_beat'],
      dieu: 'xxx.xx',
      dieuToiCo: true,
      deBai: 'Khi rẽ phải bằng turn_right(), robot dùng 1 nhịp để xoay người và không gõ trống, tạo ra đúng 1 nhịp nghỉ . trong bản nhạc xxx.xx. Hãy sửa số bước của hai lần gọi march_beat để vừa khớp nhạc vừa tới cờ.',
      veMaMau: 'Mã mẫu truyền nhầm march_beat(2) rồi march_beat(3) nên lệch nhịp nghỉ.',
      san: [
        '######',
        '#.II.#',
        '####I#',
        '####F#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['march_beat(2)', 'turn_right()', 'march_beat(3)']),
      loiGiai: bai(['march_beat(3)', 'turn_right()', 'march_beat(2)']),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: nghỉ ở nhịp thứ 3 thay vì nhịp thứ 4', baiLam: bai(['march_beat(2)', 'turn_right()', 'march_beat(3)']), phaiCoMa: ['lo-nhip'] },
        { moTa: 'Quên gọi turn_right() ở góc cua: gõ liền 5 tiếng và đâm tường', baiLam: bai(['march_beat(3)', 'march_beat(2)']), phaiCoMa: ['lech-nhip'] }
      ],
      sao: { o: 10, nhip: 6 },
      goiY: [
        'Đoạn ngang dài 3 bước ứng với xxx -> gọi march_beat(3).',
        'Sau turn_right() (ứng với .), đoạn dọc xuống cờ dài 2 bước ứng với xx -> gọi march_beat(2).'
      ]
    }),

    manLoa(9, 'bien-the', {
      ten: 'Chế lệnh: hai hồi trống cách nhịp',
      taoHam: ['echo_pause'], chinhCoDinh: true,
      hamCuaEmCan: ['drum_hit'],
      dieu: 'xxx.xx',
      deBai: 'Tạo hàm echo_pause(a, b) để gõ hồi trống đầu gồm a tiếng bằng drum_hit(a), nghỉ 1 nhịp bằng wait(), rồi gõ hồi trống sau gồm b tiếng bằng drum_hit(b).',
      veMaMau: 'Trong echo_pause(a, b), gọi lần lượt drum_hit(a), wait(), drum_hit(b).',
      san: [
        '#####',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['echo_pause(3, 2)']),
      loiGiai: bai(
        ['echo_pause(3, 2)'],
        [],
        [ham('echo_pause', ['drum_hit(a)', 'wait()', 'drum_hit(b)'], ['a', 'b'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm echo_pause', baiLam: bai(['echo_pause(3, 2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên wait() giữa hai lần drum_hit: mất nhịp nghỉ giữa bản nhạc', baiLam: bai(['echo_pause(3, 2)']), hamCuaEmMoi: [ham('echo_pause', ['drum_hit(a)', 'drum_hit(b)'], ['a', 'b'])], phaiCoMa: ['lech-nhip'] }
      ],
      sao: { o: 7, nhip: 6 },
      goiY: [
        'Thân hàm echo_pause(a, b) gồm 3 dòng: drum_hit(a), wait(), drum_hit(b).',
        'Khi echo_pause(3, 2) chạy, robot phát chuẩn chuỗi nhịp xxx.xx.'
      ]
    }),

    manLoa(10, 'trum', {
      ten: 'Trùm: Hành khúc đá vôi',
      huyHieu: { ma: 'loa', ten: 'Huy hiệu Gõ nhịp vang hang' },
      hamCuaEmCan: ['turn_right', 'drum_hit', 'march_beat', 'echo_pause'],
      nhipTheo: 'tong',
      dieu: 'xxxx.xxx.xx.x',
      dieuToiCo: true,
      deBai: 'Trùm Chương 1! Hãy vừa hành quân tới cờ ở (5, 4) vừa gõ đúng bản nhạc xxxx.xxx.xx.x trên cả hai sân: dùng march_beat(4) đi ngang 4 bước, turn_right() rẽ xuống (tạo nhịp nghỉ đầu), march_beat(3) đi xuống 3 bước tới cờ, rồi đứng tại cờ gọi wait() và echo_pause(2, 1).',
      veMaMau: 'Kết hợp march_beat(4), turn_right(), march_beat(3), wait() và echo_pause(2, 1).',
      san: [
        [
          '#######',
          '#.III.#',
          '#.uuuI#',
          '#####I#',
          '#####F#',
          '#######'
        ],
        [
          '#######',
          '#..II.#',
          '#uuuu.#',
          '#####I#',
          '#####F#',
          '#######'
        ]
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      maMau: bai([]),
      loiGiai: bai([
        'march_beat(4)',
        'turn_right()',
        'march_beat(3)',
        'wait()',
        'echo_pause(2, 1)'
      ]),
      loiSai: [
        { moTa: 'Quên wait() trước echo_pause(2, 1): thiếu nhịp nghỉ sau khi tới cờ', baiLam: bai(['march_beat(4)', 'turn_right()', 'march_beat(3)', 'echo_pause(2, 1)']), phaiCoMa: ['lech-nhip'] },
        { moTa: 'Đi xuống chỉ 2 bước march_beat(2): chưa tới cờ và lệch nhịp', baiLam: bai(['march_beat(4)', 'turn_right()', 'march_beat(2)', 'wait()', 'echo_pause(2, 1)']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 18, nhip: 26 },
      goiY: [
        'march_beat(4), turn_right(), march_beat(3) vừa đưa robot tới cờ (5, 4) vừa tạo xxxx.xxx.',
        'Đứng tại cờ gọi thêm wait() rồi echo_pause(2, 1) để hoàn thành phần .xx.x cuối bản nhạc.'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: tap-hop — Tập hợp không trùng (10 màn)
       ====================================================================== */
    manTapHop(1, 'lam-quen', {
      ten: 'Tập hợp tự lọc trùng',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['march_beat'],
      dieu: 'xxx',
      dieuToiCo: true,
      deBai: 'Trong Python, tập hợp (set) viết bằng ngoặc nhọn {1, 2, 1, 3} (không có dấu : như từ điển) sẽ tự động loại bỏ các phần tử bị trùng lặp. Bấm Chạy để xem len(s) đếm đúng 3 phần tử duy nhất và đưa robot tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Tập hợp {1, 2, 1, 3} tự bỏ số 1 trùng nên len(s) bằng 3.',
      san: [
        '######',
        '#.IIF#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        's = {1, 2, 1, 3}',
        'march_beat(len(s))'
      ]),
      loiGiai: bai([
        's = {1, 2, 1, 3}',
        'march_beat(len(s))'
      ]),
      sao: { o: 7, nhip: 3 },
      goiY: [
        'Dù viết 4 số trong {1, 2, 1, 3}, số 1 xuất hiện hai lần nên tập hợp chỉ giữ 3 số {1, 2, 3}.',
        'Nhấn nút Chạy để march_beat(len(s)) bước 3 ô và gõ xxx.'
      ]
    }),

    manTapHop(2, 'lam-quen', {
      ten: 'Đủ bốn mẫu thạch nhũ',
      hamCuaEmCan: ['march_beat'],
      dieu: 'xxxx',
      dieuToiCo: true,
      deBai: 'Cờ cách robot 4 bước (xxxx), nhưng tập hợp s = {2, 4, 2, 4} trong mã mẫu chỉ có 2 giá trị khác nhau nên len(s) mới bằng 2. Hãy sửa tập hợp s để có đúng 4 giá trị khác nhau.',
      veMaMau: 'Chạy thử: s = {2, 4, 2, 4} lọc trùng chỉ còn 2 phần tử. Đổi thành 4 số khác nhau.',
      san: [
        '#######',
        '#.IIIF#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        's = {2, 4, 2, 4}',
        'march_beat(len(s))'
      ]),
      loiGiai: bai([
        's = {2, 4, 6, 8}',
        'march_beat(len(s))'
      ]),
      loiSai: [
        { moTa: 'Để nguyên s = {2, 4, 2, 4}: len(s) bằng 2 nên chỉ đi 2 bước', baiLam: bai(['s = {2, 4, 2, 4}', 'march_beat(len(s))']), phaiCoMa: ['chua-du-dieu'] },
        { moTa: 'Mới đổi 1 số thành s = {2, 4, 6, 4}: len(s) bằng 3 nên vẫn thiếu 1 bước', baiLam: bai(['s = {2, 4, 6, 4}', 'march_beat(len(s))']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 7, nhip: 4 },
      goiY: [
        'Viết 4 số đôi một khác nhau trong ngoặc nhọn, ví dụ s = {2, 4, 6, 8}.',
        'Khi len(s) bằng 4, march_beat(len(s)) sẽ đưa robot tới thẳng cờ.'
      ]
    }),

    manTapHop(3, 'lam-quen', {
      ten: 'Thêm mẫu vào tập rỗng',
      hamCuaEmCan: ['march_beat'],
      dieu: 'xxx',
      dieuToiCo: true,
      deBai: 'Để tạo tập hợp rỗng, ta viết s = set() (vì {} là từ điển rỗng). Dùng lệnh s.add(x) để thêm phần tử vào tập hợp. Hãy thêm mẫu khoáng vật thứ ba vào s để len(s) bằng 3.',
      veMaMau: 'Mã mẫu thêm "a", "b", "a" nên tập hợp mới có 2 mẫu khác nhau. Hãy đổi lần thêm thứ ba thành "c".',
      san: [
        '######',
        '#.IIF#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        's = set()',
        's.add("a")',
        's.add("b")',
        's.add("a")',
        'march_beat(len(s))'
      ]),
      loiGiai: bai([
        's = set()',
        's.add("a")',
        's.add("b")',
        's.add("c")',
        'march_beat(len(s))'
      ]),
      loiSai: [
        { moTa: 'Để nguyên s.add("a") lần hai: tập hợp chỉ có 2 phần tử', baiLam: bai(['s = set()', 's.add("a")', 's.add("b")', 's.add("a")', 'march_beat(len(s))']), phaiCoMa: ['chua-du-dieu'] },
        { moTa: 'Đổi thành s.add("b"): vẫn trùng với "b" đã có', baiLam: bai(['s = set()', 's.add("a")', 's.add("b")', 's.add("b")', 'march_beat(len(s))']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 10, nhip: 3 },
      goiY: [
        'Khi gọi s.add("a") lần thứ hai, tập hợp không tăng kích thước vì "a" đã có sẵn.',
        'Đổi dòng thứ tư thành s.add("c") để tập hợp có 3 phần tử.'
      ]
    }),

    manTapHop(4, 'lam-quen', {
      ten: 'Kiểm tra mẫu trong tập hợp',
      mucTieu: 'toi-co',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Giống từ điển, ta dùng x in s hoặc x not in s để kiểm tra phần tử trong tập hợp. Hãy thêm "c" và "d" vào s = {"a", "b"}, sau đó kiểm tra nếu "d" in s thì đi ngang len(s) bước, rẽ phải và đi xuống 2 bước tới cờ.',
      veMaMau: 'Mã mẫu đã thêm "c" và "d" (nên len(s) bằng 4). Hãy viết tiếp nhánh if "d" in s: để tới cờ.',
      san: [
        '#######',
        '#.III.#',
        '#####I#',
        '#####F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        's = {"a", "b"}',
        's.add("c")',
        's.add("d")',
        'if "d" in s:',
        '    spike_step(len(s))'
      ]),
      loiGiai: bai([
        's = {"a", "b"}',
        's.add("c")',
        's.add("d")',
        'if "d" in s:',
        '    spike_step(len(s))',
        '    forward(2)'
      ]),
      loiSai: [
        { moTa: 'Chưa viết forward(2) sau spike_step: dừng ở góc (5, 1)', baiLam: bai(['s = {"a", "b"}', 's.add("c")', 's.add("d")', 'if "d" in s:', '    spike_step(len(s))']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bỏ mất dòng s.add("c"): len(s) chỉ bằng 3 nên rẽ sớm đâm tường', baiLam: bai(['s = {"a", "b"}', 's.add("d")', 'if "d" in s:', '    spike_step(len(s))', '    forward(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 7 },
      goiY: [
        'Sau khi thêm "c" và "d", len(s) bằng 4 nên spike_step(len(s)) đưa robot tới góc (5, 1) và quay mặt xuống.',
        'Thêm dòng forward(2) thụt lề bên trong khối if "d" in s:.'
      ]
    }),

    manTapHop(5, 'luyen', {
      ten: 'Chế lệnh: đếm mẫu không trùng',
      taoHam: ['count_unique'], batBuocTaoHam: false, chinhCoDinh: true,
      hamCuaEmCan: ['march_beat'],
      dieu: 'xxx',
      dieuToiCo: true,
      deBai: 'Tạo hàm count_unique(a) nhận một danh sách a: khởi tạo tập hợp rỗng s = set(), duyệt for x in a: gọi s.add(x), rồi trả về return len(s) (số phần tử phân biệt trong danh sách).',
      veMaMau: 'Mở Xưởng hàm, tạo count_unique(a) gồm 4 dòng: s = set(), for x in a:, s.add(x), return len(s).',
      san: [
        '######',
        '#.IIF#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'a = [5, 2, 5, 8, 2]',
        'march_beat(count_unique(a))'
      ]),
      loiGiai: bai(
        [
          'a = [5, 2, 5, 8, 2]',
          'march_beat(count_unique(a))'
        ],
        [],
        [ham('count_unique', ['s = set()', 'for x in a:', '    s.add(x)', 'return len(s)'], ['a'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm count_unique', baiLam: bai(['a = [5, 2, 5, 8, 2]', 'march_beat(count_unique(a))']), phaiCoMa: ['ham-chua-co'] }
      ],
      sao: { o: 7, nhip: 3 },
      goiY: [
        'Danh sách [5, 2, 5, 8, 2] có 5 phần tử nhưng chỉ có 3 số khác nhau là 5, 2, 8.',
        'Nhờ s.add(x) tự lọc trùng, return len(s) trả về đúng 3.'
      ]
    }),

    manTapHop(6, 'luyen', {
      ten: 'Hai danh sách thạch nhũ',
      mucTieu: 'toi-co',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step', 'count_unique'],
      deBai: 'Dùng hàm count_unique cho hai danh sách khảo sát a = [1, 1, 2, 3] và b = [4, 5, 4, 6] để đi hết hành lang chữ L tới cờ.',
      veMaMau: 'Đoạn ngang đã dùng spike_step(count_unique(a)). Hãy dùng forward(count_unique(b)) cho đoạn dọc.',
      san: [
        '######',
        '#.II.#',
        '####I#',
        '####I#',
        '####F#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'a = [1, 1, 2, 3]',
        'b = [4, 5, 4, 6]',
        'spike_step(count_unique(a))'
      ]),
      loiGiai: bai([
        'a = [1, 1, 2, 3]',
        'b = [4, 5, 4, 6]',
        'spike_step(count_unique(a))',
        'forward(count_unique(b))'
      ]),
      loiSai: [
        { moTa: 'Chưa viết đoạn dọc: dừng ở góc (4, 1)', baiLam: bai(['a = [1, 1, 2, 3]', 'b = [4, 5, 4, 6]', 'spike_step(count_unique(a))']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 13, nhip: 7 },
      goiY: [
        'Cả a và b đều có 3 giá trị phân biệt nên count_unique(a) và count_unique(b) đều trả về 3.',
        'Thêm dòng forward(count_unique(b)) vào cuối chương trình.'
      ]
    }),

    manTapHop(7, 'luyen', {
      ten: 'Chế lệnh: báo hiệu mẫu đá mới',
      taoHam: ['add_if_new'], chinhCoDinh: true,
      hamCuaEmCan: ['drum_hit'],
      dieu: 'xxx',
      deBai: 'Tạo hàm add_if_new(s, x): kiểm tra nếu x chưa có trong tập hợp s (if x not in s:) thì thêm s.add(x) và gõ 1 tiếng trống bằng drum_hit(1). Khi duyệt qua ["da", "voi", "da", "nhu"], robot sẽ chỉ gõ trống ở 3 mẫu mới.',
      veMaMau: 'Mở Xưởng hàm, tạo add_if_new(s, x) gồm: if x not in s:, thụt lề s.add(x) và drum_hit(1).',
      san: [
        '#####',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        's = set()',
        'for x in ["da", "voi", "da", "nhu"]:',
        '    add_if_new(s, x)'
      ]),
      loiGiai: bai(
        [
          's = set()',
          'for x in ["da", "voi", "da", "nhu"]:',
          '    add_if_new(s, x)'
        ],
        [],
        [ham('add_if_new', ['if x not in s:', '    s.add(x)', '    drum_hit(1)'], ['s', 'x'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm add_if_new', baiLam: bai(['s = set()', 'for x in ["da", "voi", "da", "nhu"]:', '    add_if_new(s, x)']), phaiCoMa: ['ham-chua-co'] }
      ],
      sao: { o: 9, nhip: 3 },
      goiY: [
        'Trong nhánh if x not in s:, phải có cả hai dòng s.add(x) và drum_hit(1).',
        'Nhờ s.add(x), lần gặp "da" thứ hai sẽ bị bỏ qua.'
      ]
    }),

    manTapHop(8, 'bien-the', {
      ten: 'Duyệt qua tập hợp',
      mucTieu: 'toi-co',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Ta có thể duyệt từng phần tử trong tập hợp bằng vòng lặp for x in s:. Cho tập hợp s = {4, 3, 4}, hãy dùng for x in s: gọi spike_step(x) để đi chặng ngang 4 bước rồi chặng dọc 3 bước tới cờ.',
      veMaMau: 'Khởi tạo s = {4, 3, 4} rồi viết vòng lặp for x in s: gọi spike_step(x).',
      san: [
        '#######',
        '#.III.#',
        '#####I#',
        '#####I#',
        '#####F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        's = {4, 2, 4}',
        'for x in s:',
        '    spike_step(x)'
      ]),
      loiGiai: bai([
        's = {4, 3, 4}',
        'for x in s:',
        '    spike_step(x)'
      ]),
      loiSai: [
        { moTa: 'Để nguyên s = {4, 2, 4}: chặng dọc chỉ đi 2 bước, dừng trước cờ', baiLam: bai(['s = {4, 2, 4}', 'for x in s:', '    spike_step(x)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đổi thành s = {3, 3, 4}: chặng ngang chỉ đi 3 bước nên rẽ sớm đâm tường', baiLam: bai(['s = {3, 3, 4}', 'for x in s:', '    spike_step(x)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 12, nhip: 8 },
      goiY: [
        'Tập hợp {4, 3, 4} lọc bỏ số 4 trùng thứ hai, giữ lại 4 rồi 3.',
        'Sửa số 2 trong s = {4, 2, 4} thành 3.'
      ]
    }),

    manTapHop(9, 'bien-the', {
      ten: 'Chế lệnh: hành quân theo tập mẫu',
      taoHam: ['unique_march'], chinhCoDinh: true,
      hamCuaEmCan: ['march_beat', 'count_unique'],
      dieu: 'xxxx',
      dieuToiCo: true,
      deBai: 'Tạo hàm unique_march(a) nhận danh sách a: tính số mẫu phân biệt n = count_unique(a), gọi march_beat(n) để vừa tiến n bước vừa gõ trống, rồi trả về return n.',
      veMaMau: 'Trong unique_march(a), viết 3 dòng: n = count_unique(a), march_beat(n), return n.',
      san: [
        '#######',
        '#.IIIF#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'unique_march([1, 3, 1, 5, 7, 3])'
      ]),
      loiGiai: bai(
        [
          'unique_march([1, 3, 1, 5, 7, 3])'
        ],
        [],
        [ham('unique_march', ['n = count_unique(a)', 'march_beat(n)', 'return n'], ['a'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm unique_march', baiLam: bai(['unique_march([1, 3, 1, 5, 7, 3])']), phaiCoMa: ['ham-chua-co'] }
      ],
      sao: { o: 9, nhip: 4 },
      goiY: [
        'Danh sách [1, 3, 1, 5, 7, 3] có 4 số khác nhau nên n = count_unique(a) bằng 4.',
        'march_beat(n) đưa robot đi 4 bước tới cờ và gõ xxxx.'
      ]
    }),

    manTapHop(10, 'trum', {
      ten: 'Trùm: Bộ sưu tập đá vôi',
      huyHieu: { ma: 'tap-hop', ten: 'Huy hiệu Tập hợp không trùng' },
      hamCuaEmCan: ['turn_right', 'march_beat', 'count_unique', 'unique_march'],
      nhipTheo: 'tong',
      dieu: 'xxxx.xxx',
      dieuToiCo: true,
      deBai: 'Trùm Gói 2! Dùng unique_march với hai danh sách mẫu đá trên cả hai sân để vừa đi hết hành lang chữ L (ngang 4 bước, rẽ phải nghỉ 1 nhịp, xuống 3 bước) vừa gõ chuẩn bản nhạc xxxx.xxx tới cờ.',
      veMaMau: 'Gọi unique_march([1, 2, 1, 3, 4]), turn_right() rồi unique_march([5, 6, 5, 7]).',
      san: [
        [
          '#######',
          '#.III.#',
          '#.uuuI#',
          '#####I#',
          '#####F#',
          '#######'
        ],
        [
          '#######',
          '#..II.#',
          '#uuuu.#',
          '#####I#',
          '#####F#',
          '#######'
        ]
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      maMau: bai([]),
      loiGiai: bai([
        'unique_march([1, 2, 1, 3, 4])',
        'turn_right()',
        'unique_march([5, 6, 5, 7])'
      ]),
      loiSai: [
        { moTa: 'Đảo ngược hai danh sách: đi ngang 3 bước rồi rẽ xuống hố sụt', baiLam: bai(['unique_march([5, 6, 5, 7])', 'turn_right()', 'unique_march([1, 2, 1, 3, 4])']), phaiCoMa: ['lo-nhip'] },
        { moTa: 'Danh sách sau chỉ có 2 số khác nhau: dừng trước cờ 1 ô', baiLam: bai(['unique_march([1, 2, 1, 3, 4])', 'turn_right()', 'unique_march([5, 6, 5, 6])']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 13, nhip: 16 },
      goiY: [
        'Đoạn ngang dài 4 bước: gọi unique_march([1, 2, 1, 3, 4]) rồi turn_right().',
        'Đoạn dọc dài 3 bước: gọi unique_march([5, 6, 5, 7]) để tới cờ.'
      ]
    })
  ];

  if (M && M.them) M.manLoa = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();

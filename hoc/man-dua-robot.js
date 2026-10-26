/* ============================================================================
   man-dua-robot.js — "Robot Chấn Hưng": GÓI ĐỐI KHÁNG · ĐUA ROBOT TRÊN CÙNG SÂN
   (2 chương × 10 màn = 20 màn: `dua-robot` và `che-dua-robot`).
   Mọi màn bật `doiKhang: true`:
   - R1 (sơn vàng): robot của người chơi.
   - R2 (sơn đỏ, `coDinh: true`): robot đối thủ tự động chạy theo chương trình khóa
     (người chơi bấm thẻ R2 để đọc bài đối thủ và tìm chiến thuật thắng).
   - Luật đối kháng (`san-hoc.js` + `cham.js`):
     + R1 phải hoàn thành mục tiêu (`toi-co` hoặc `dua-vat`) TRƯỚC khi R2 chạm cờ `F`.
     + Nếu R2 chạm cờ `F` trước hoặc cùng nhịp với R1 → R1 thua (`doi-thu-thang`).
   - R2 chạy bằng bộ hàm riêng KHO_DOI_THU (man.khoDoiThu), không mượn kho của người chơi. Màn giao hàng: R1 đi qua F không dừng.
   - Mỗi màn: hai lời sai (bảng SAI), lời giải khác 2 sao (thêm dòng chú thích), hamCuaEmCan theo đúng hàm lời giải dùng.
   - Đường tắt: node tools/do-tat-dua.mjs (do-duong-dua-robot.mjs, chấm thật từng nhánh). Đường nhanh hơn ngưỡng chỉ được là gộp nâng tay vào nhịp đi.
   - Gói neo cuối mùa 4 (sau rap-du, sau Sân cơ khí).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var ROBOT = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  function ham(ten, than, thamSo) { return { ten: ten, thamSo: thamSo || [], than: than.slice() }; }

  // Bộ hàm RIÊNG của R2 (man.khoDoiThu, cham.js chamDoi): bản chuẩn của các hàm cốt truyện mà chương trình khóa của R2 gọi.
  // R2 không mượn kho của người chơi, nên tốc độ R2 như nhau với mọi người chơi và sửa hàm của mình không làm R2 chậm đi.
  var KHO_DOI_THU = [
    ham('move', ['left_move()', 'right_move()', 'wait()']),
    ham('back', ['left_back()', 'right_back()', 'wait()']),
    ham('turn_left', ['left_back()', 'wait()']),
    ham('turn_right', ['left_move()', 'wait()']),
    ham('u_turn', ['left_back()', 'right_move()', 'wait()']),
    ham('pick', ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()']),
    ham('drop', ['arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()']),
    ham('go_wall', ['while front_clear():', '    move()'])
  ];

  /** Hàm của em mà lời giải của R1 cần (chương trình chính + thân hàm của màn), theo đúng tên trong KHO_DOI_THU; go_wall() kéo theo move(). */
  function hamCan(c1, hm) {
    var nguon = (c1 || []).concat.apply(c1 || [], (hm || []).map(function (h) { return h.than; })).join('\n');
    var kq = KHO_DOI_THU.map(function (h) { return h.ten; }).filter(function (t) { return new RegExp('(^|[^a-z_])' + t + '\\(').test(nguon); });
    if (kq.indexOf('go_wall') >= 0 && kq.indexOf('move') < 0) kq.unshift('move');
    return kq;
  }

  // Lời sai của từng màn: lỗi R1 hay gặp (khác chương trình mẫu), mã chẩn đoán đo bằng ChamHoc.cham. hm: [[tên hàm của màn, thân]] thay bản mẫu.
  function S(moTa, c1, phaiCoMa, hm) { return { moTa: moTa, c1: c1, phaiCoMa: phaiCoMa, hm: hm || null }; }
  var SAI = {
    'dua-robot.1': [S('Đi hai ô rồi dừng giữa hành lang', ['move()', 'move()'], ['chua-toi-co']), S('Rẽ nhầm hướng ngay từ đầu', ['turn_right()', 'go_wall()'], ['chua-toi-co'])],
    'dua-robot.2': [S('Tự quay phải trong khi bàn xoay đã quay xe', ['move()', 'move()', 'turn_right()', 'move()', 'move()'], ['doi-thu-thang']), S('Thiếu một bước cuối', ['move()', 'move()', 'move()'], ['doi-thu-thang'])],
    'dua-robot.3': [S('Chờ một nhịp như R2 rồi mới đi', ['wait()', 'move()', 'move()'], ['chua-toi-co']), S('Chỉ đi một ô', ['move()'], ['doi-thu-thang'])],
    'dua-robot.4': [S('Không chốt cửa, chạy thẳng tới cờ', ['turn_right()', 'go_wall()'], ['doi-thu-thang']), S('Nhặt hộp nhưng thả lại ngay chỗ cũ', ['pick()', 'drop()', 'turn_right()', 'go_wall()'], ['doi-thu-thang'])],
    'dua-robot.5': [S('Chờ một nhịp rồi mới nhặt: R2 giành mất', ['wait()', 'pick()', 'u_turn()', 'drop()'], ['doi-thu-thang']), S('Không quay đầu, thả lại chỗ cũ', ['pick()', 'drop()'], ['doi-thu-thang'])],
    'dua-robot.6': [S('Rẽ nhầm sang phải', ['turn_right()', 'go_wall()'], ['doi-thu-thang']), S('Chỉ đi một ô', ['move()'], ['chua-toi-co'])],
    'dua-robot.7': [S('Thiếu một bước: dừng trước cờ', FOR(5, ['move()']), ['chua-toi-co']), S('Thêm wait() sau mỗi bước nên chậm gấp đôi', FOR(6, ['move()', 'wait()']), ['chua-toi-co'])],
    'dua-robot.8': [S('Chờ cứng một nhịp thay vì hỏi cảm biến', ['wait()', 'move()', 'move()', 'move()'], ['doi-thu-thang']), S('Đảo điều kiện: chờ khi trước mặt trống', ['while front_clear():', '    wait()', 'move()', 'move()', 'move()'], ['doi-thu-thang'])],
    'dua-robot.9': [S('Lùi thiếu một ô', ['pick()', 'back()', 'move()', 'move()', 'drop()'], ['chua-dua-vat']), S('Tiến thiếu một ô trước khi thả', ['pick()', 'back()', 'back()', 'move()', 'drop()'], ['chua-dua-vat'])],
    'dua-robot.10': [S('Rẽ phải ở góc thứ hai', ['go_wall()', 'turn_right()', 'go_wall()', 'turn_right()', 'go_wall()'], ['chua-toi-co']), S('Rẽ trái ở góc đầu', ['go_wall()', 'turn_left()', 'go_wall()', 'turn_left()', 'go_wall()'], ['chua-toi-co'])],
    'che-dua-robot.1': [S('warp_step() rẽ nhầm sang trái', ['warp_step()', 'warp_step()'], ['chua-toi-co'], [['warp_step', ['turn_left()', 'move()']]]), S('warp_step() chỉ đứng chờ', ['warp_step()', 'warp_step()'], ['chua-toi-co'], [['warp_step', ['wait()', 'wait()']]])],
    'che-dua-robot.2': [S('Chốt cửa nhưng quên quay về hướng cờ', ['seal_gate()', 'go_wall()'], ['chua-toi-co'], [['seal_gate', ['pick()', 'move()', 'turn_right()', 'drop()', 'move()']]]),
      S('Không chốt cửa, chỉ chạy', ['seal_gate()', 'go_wall()'], ['doi-thu-thang'], [['seal_gate', ['pick()', 'move()', 'move()', 'turn_right()']]])],
    'che-dua-robot.3': [S('Quên lùi vào cổng trước khi thả', ['steal_box()'], ['chua-dua-vat'], [['steal_box', ['pick()', 'move()', 'drop()']]]), S('Lùi rồi thả ngay, chưa tới đích', ['steal_box()'], ['chua-dua-vat'], [['steal_box', ['pick()', 'back()', 'drop()']]])],
    'che-dua-robot.4': [S('Chờ cứng một nhịp thay vì chờ cổng mở', ['wait()', 'go_wall()'], ['chua-toi-co']), S('Chờ cổng mở rồi chỉ đi một bước', ['wait_open()', 'move()'], ['chua-toi-co'])],
    'che-dua-robot.5': [S('Rẽ nhầm sang trái ở cuối', ['blitz()'], ['chua-toi-co'], [['blitz', ['go_wall()', 'turn_left()', 'move()']]]), S('Rẽ phải nhưng quên bước cuối', ['blitz()'], ['chua-toi-co'], [['blitz', ['go_wall()', 'turn_right()']]])],
    'che-dua-robot.6': [S('Chờ một nhịp rồi mới đi nhặt: R2 giành mất', ['wait()', 'move()', 'pick()', 'back()', 'u_turn()', 'drop()'], ['doi-thu-thang']), S('Quên lùi trước khi quay đầu', ['move()', 'pick()', 'u_turn()', 'drop()'], ['chua-dua-vat'])],
    'che-dua-robot.7': [S('Rẽ trái thay vì rẽ phải', ['rush()'], ['doi-thu-thang'], [['rush', ['move()', 'turn_left()', 'go_wall()']]]), S('Quên bước tiến đầu tiên', ['rush()'], ['doi-thu-thang'], [['rush', ['turn_right()', 'go_wall()']]])],
    'che-dua-robot.8': [S('Thả hộp rồi quên quay lại', ['lock_rival()', 'go_wall()', 'turn_right()', 'go_wall()'], ['chua-toi-co'], [['lock_rival', ['pick()', 'turn_left()', 'drop()']]]),
      S('Thả hộp sang trái nhưng quay lại sai hướng', ['lock_rival()', 'go_wall()', 'turn_right()', 'go_wall()'], ['chua-toi-co'], [['lock_rival', ['pick()', 'turn_left()', 'drop()', 'turn_left()']]])],
    'che-dua-robot.9': [S('Đi thiếu một ô trước khi quay đầu', ['warp_deliver()'], ['doi-thu-thang'], [['warp_deliver', ['move()', 'pick()', 'move()', 'u_turn()', 'drop()']]]),
      S('Quên quay đầu trước khi thả', ['warp_deliver()'], ['doi-thu-thang'], [['warp_deliver', ['move()', 'pick()', 'move()', 'move()', 'drop()']]])],
    'che-dua-robot.10': [S('Không chờ cửa mở, lao luôn', ['raid()'], ['doi-thu-thang'], [['raid', ['go_wall()', 'turn_right()', 'pick()', 'turn_right()', 'drop()']]]),
      S('Rẽ trái ở góc cuối', ['raid()'], ['doi-thu-thang'], [['raid', ['while not front_clear():', '    wait()', 'go_wall()', 'turn_left()', 'pick()', 'turn_left()', 'drop()']]])]
  };
  function FOR(n, body) {
    return ['for i in range(' + n + '):'].concat(body.map(function (s) { return '    ' + s; }));
  }
  function B(c1, c2, hm) {
    return {
      doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }],
      hamCuaMan: (hm || []).map(function (f) { return ham(f.ten, f.than, f.thamSo); })
    };
  }

  // Ngưỡng 3 sao { o, nhip } đo tự động bằng ChamHoc.cham
  var SAO = {
    'dua-robot.1':      { o: 11, nhip: 3 },
    'dua-robot.2':      { o: 12, nhip: 4 },
    'dua-robot.3':      { o: 8,  nhip: 2 },
    'dua-robot.4':      { o: 34, nhip: 14 },
    'dua-robot.5':      { o: 25, nhip: 4 },
    'dua-robot.6':      { o: 10, nhip: 2 },
    'dua-robot.7':      { o: 12, nhip: 6 },
    'dua-robot.8':      { o: 16, nhip: 5 },
    'dua-robot.9':      { o: 35, nhip: 7 },
    'dua-robot.10':     { o: 17, nhip: 48 },
    'che-dua-robot.1':  { o: 13, nhip: 3 },
    'che-dua-robot.2':  { o: 35, nhip: 14 },
    'che-dua-robot.3':  { o: 25, nhip: 5 },
    'che-dua-robot.4':  { o: 17, nhip: 5 },
    'che-dua-robot.5':  { o: 18, nhip: 8 },
    'che-dua-robot.6':  { o: 26, nhip: 6 },
    'che-dua-robot.7':  { o: 15, nhip: 4 },
    'che-dua-robot.8':  { o: 37, nhip: 13 },
    'che-dua-robot.9':  { o: 26, nhip: 7 },
    'che-dua-robot.10': { o: 35, nhip: 33 }
  };

  function taoMan(chuong, m) {
    var bd = m.bd, r2Code = m.r2;
    delete m.bd; delete m.r2;
    m.chuong = chuong;
    m.ma = chuong + '.' + m.so;
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.doiKhang = true;
    m.khoDoiThu = sao(KHO_DOI_THU);
    m.mucTieu = m.mucTieu || 'toi-co';
    m.loaiRobot = 'banh';
    m.robot = sao(ROBOT);
    m.hamGoc = BANH.concat(TAY, BA_HUONG);
    m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true;
    m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    var nhieuSan = Array.isArray(m.san[0]);
    if (nhieuSan) m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    m.doi = [
      { batDau: bd[0], robot: Object.assign({}, sao(ROBOT), { son: 'vang' }) },
      { batDau: bd[1], robot: Object.assign({}, sao(ROBOT), { son: 'do' }), coDinh: true }
    ];
    m.batDau = bd[0];
    var hmMau = m.hmMau || m.hm || [];
    var hmGiai = m.hmGiai || m.hm || [];
    delete m.hm; delete m.hmMau; delete m.hmGiai;
    m.hamCuaEmCan = hamCan(m.c1Giai, hmGiai);
    m.maMau = B(m.c1Mau || [], r2Code, hmMau);
    m.loiGiai = B(m.c1Giai, r2Code, hmGiai);
    // lời giải khác (2 sao): cùng cách giải, thêm một dòng chú thích nên nhiều ô hơn
    m.loiGiaiKhac = { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: B(['# đọc bài R2 trước khi viết'].concat(m.c1Giai), r2Code, hmGiai) };
    // lời sai: bảng SAI (mỗi màn hai lỗi hay gặp, khác chương trình mẫu); s.hm thay thân hàm của màn
    m.loiSai = (SAI[m.ma] || []).map(function (s) {
      return { moTa: s.moTa, baiLam: B(s.c1, r2Code, s.hm ? s.hm.map(function (h) { return ham(h[0], h[1]); }) : hmMau), phaiCoMa: s.phaiCoMa.slice() };
    });
    delete m.c1Mau; delete m.c1Giai;
    m.sao = SAO[m.ma] || { o: 15, nhip: 20 };
    return ManHoc.chuanHoa(m);
  }

  /* ==========================================================================
     CHƯƠNG 1: dua-robot — Đua robot đối kháng (10 màn)
     ======================================================================== */
  var ds1 = [
    // 1. Đọc bài đối thủ
    taoMan('dua-robot', {
      so: 1, ten: 'Đọc bài đối thủ',
      deBai: 'Robot đỏ (R2) là đối thủ tự động. Bấm thẻ R2 để xem chương trình của đối thủ: R2 phải đi vòng mất 6 nhịp mới tới cờ F. Hãy viết chương trình cho R1 chạy thẳng hết hành lang để chạm cờ F trước R2.',
      veMaMau: 'R1 mới đi 1 ô nên dừng giữa đường và bị R2 vượt qua. Dùng go_wall() cho R1.',
      san: [
        '######',
        '#...F#',
        '#.###.',
        '#....#'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      r2: ['for i in range(3):', '    move()', 'turn_left()', 'move()', 'move()'],
      c1Mau: ['move()'],
      c1Giai: ['go_wall()'],
      goiY: [
        'Bấm vào thẻ R2 màu đỏ ở đầu khung chương trình để xem đường đi của đối thủ.',
        'Hành lang của R1 thông thẳng tới cờ F: chỉ cần gọi go_wall() là R1 tới đích ở nhịp 3.'
      ]
    }),

    // 2. Khúc cua bàn xoay
    taoMan('dua-robot', {
      so: 2, ten: 'Khúc cua bàn xoay',
      deBai: 'R1 và R2 cùng đua tới cờ F ở giữa. Góc cua của R1 có bàn xoay @ tự xoay xe sang phải 90° không tốn nhịp rẽ, còn R2 phải tốn 1 nhịp turn_left(). Bỏ lệnh quay thừa để R1 về đích ở nhịp 4 trước khi R2 tới ở nhịp 5.',
      veMaMau: 'Lệnh turn_right() sau khi vào bàn xoay @ làm R1 quay thừa.',
      san: [
        '#######',
        '#@.F..#',
        '#.###.#',
        '#.#...#',
        '#######'
      ],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 5, y: 3, huong: 0 }],
      r2: ['move()', 'move()', 'turn_left()', 'move()', 'move()'],
      c1Mau: ['move()', 'move()', 'turn_right()', 'move()'],
      c1Giai: FOR(4, ['move()']),
      goiY: [
        'Khi R1 tiến vào ô @(1, 1), bàn xoay đã xoay mặt R1 sang phải (hướng về cờ F).',
        'Dùng vòng lặp for i in range(4): move() để đi liền 4 bước tới cờ.'
      ]
    }),

    // 3. Đường tắt dịch chuyển
    taoMan('dua-robot', {
      so: 3, ten: 'Đường tắt dịch chuyển',
      deBai: 'R2 chỉ cách cờ F có 3 nhịp, còn R1 bị bức tường chắn ngang. Hãy cho R1 bước vào cổng dịch chuyển 1 để nhảy vọt sang cạnh cờ F và về đích ngay ở nhịp 2.',
      san: [
        '########',
        '#.1..1F#',
        '#.####.#',
        '#....#.#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 6, y: 3, huong: 0 }],
      r2: ['wait()', 'move()', 'move()'],
      c1Mau: [],
      c1Giai: ['move()', 'move()'],
      goiY: [
        'Bước thứ nhất đưa R1 vào cổng 1 ở (2, 1) và dịch chuyển ngay sang cổng 1 ở (5, 1).',
        'Bước thứ hai đưa R1 từ (5, 1) vào thẳng cờ F(6, 1) ở nhịp 2.'
      ]
    }),

    // 4. Chốt cửa chặn đường
    taoMan('dua-robot', {
      so: 4, ten: 'Chốt cửa chặn đường',
      deBai: 'Cờ F nằm ngay trên cửa đang mở c, R2 chỉ còn vài bước. Hãy cho R1 nhặt hộp o trước mặt, tiến lên ô của hộp rồi quay phải đặt hộp lên nút đè M để đóng sập cửa c, rồi chạy tới cờ F.',
      san: [
        '#######',
        '#.....F',
        '#oM###c',
        '#....#.',
        '######.'
      ],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 6, y: 4, huong: 0 }],
      r2: FOR(4, ['wait()']).concat(FOR(20, ['if front_clear():', '    move()', 'else:', '    wait()'])),
      c1Mau: ['turn_right()', 'move()'],
      c1Giai: ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()', 'move()', 'turn_right()', 'go_wall()'],
      goiY: [
        'Nút đè M(2, 2) nối với cửa đang mở c(6, 2): khi có hộp đè lên M, cửa c sẽ đóng lại và giữ chặt.',
        'pick() nhặt hộp ở (1, 2), move() tiến lên ô đó, turn_right() rồi drop() đặt hộp lên M(2, 2); sau đó turn_left(), move(), turn_right() và go_wall() tới cờ.'
      ]
    }),

    // 5. Giành kiện hàng
    taoMan('dua-robot', {
      so: 5, ten: 'Giành kiện hàng',
      mucTieu: 'dua-vat',
      deBai: 'Mục tiêu của R1 là đưa kiện hàng o về ô đích D trước khi R2 chạm cờ F. R2 đang lao tới định cuỗm kiện hàng! Hãy cho R1 gắp kiện hàng ngay nhịp đầu trước khi R2 tới, quay đầu và thả vào đích D.',
      san: [
        '#######',
        '#D.o..#',
        '###.###',
        '#....F#',
        '#######'
      ],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 3, y: 3, huong: 0 }],
      r2: ['move()', 'pick()', 'u_turn()', 'move()', 'turn_left()', 'go_wall()'],
      c1Mau: ['wait()', 'pick()'],
      c1Giai: ['pick()', 'u_turn()', 'drop()'],
      goiY: [
        'Hộp o ở (3, 1) nằm ngay trước mũi R1, còn R2 ở (3, 3) phải mất 1 nhịp move() mới tới sát hộp.',
        'Gọi pick() ngay nhịp đầu để nhặt hộp trước R2, rồi u_turn() và drop() vào D(1, 1).'
      ]
    }),

    // 6. Chiếm ngã tư
    taoMan('dua-robot', {
      so: 6, ten: 'Chiếm ngã tư',
      deBai: 'Hai đường đua cắt nhau ở ngã tư (3, 2) ngay trước cờ F(3, 1). R2 xuất phát từ bên phải. Hãy cho R1 lao thẳng qua ngã tư ngay từ nhịp đầu để vượt qua trước khi R2 kịp rẽ lên cờ.',
      san: [
        '#######',
        '###F###',
        '#.....#',
        '###.###',
        '###.###',
        '#######'
      ],
      bd: [{ x: 3, y: 3, huong: 0 }, { x: 5, y: 2, huong: 3 }],
      r2: ['move()', 'move()', 'turn_right()', 'move()'],
      c1Mau: ['wait()', 'wait()', 'go_wall()'],
      c1Giai: ['go_wall()'],
      goiY: [
        'Nếu R1 chờ 1 nhịp, cả R1 và R2 sẽ cùng lao vào ngã tư (3, 2) ở nhịp 2 và chặn nhau.',
        'Bỏ lệnh wait(), chỉ gọi go_wall() để R1 tiến thẳng 2 ô lên cờ F(3, 1).'
      ]
    }),

    // 7. Đua qua ba bàn xoay
    taoMan('dua-robot', {
      so: 7, ten: 'Đua qua ba bàn xoay',
      deBai: 'Đường chữ Z của R1 có hai bàn xoay phải @ và một bàn xoay trái % nối tiếp nhau. Tận dụng cả ba bàn xoay để R1 chỉ cần chạy thẳng 6 nhịp về cờ F trước khi R2 đi hết hành lang dưới.',
      san: [
        '########',
        '#@.@...#',
        '#.#%F..#',
        '#.#.####',
        '#......#',
        '########'
      ],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 4, huong: 1 }],
      r2: ['for i in range(5):', '    move()', 'turn_left()', 'move()', 'move()'],
      c1Mau: FOR(4, ['move()']),
      c1Giai: FOR(6, ['move()']),
      goiY: [
        'R1 đi 2 bước lên @(1, 1) xoay phải, đi 2 bước sang @(3, 1) xoay xuống, đi 1 bước xuống %(3, 2) xoay trái (về hướng phải), rồi đi 1 bước vào F(4, 2).',
        'Dùng for i in range(6): move() để R1 tự uốn qua cả ba bàn xoay tới thẳng cờ F.'
      ]
    }),

    // 8. Mượn chân đối thủ
    taoMan('dua-robot', {
      so: 8, ten: 'Mượn chân đối thủ',
      deBai: 'Cửa C trước mặt R1 đang đóng, nhưng dãy nút đè M điều khiển cửa lại nằm ngay trên đường chạy của R2! Hãy cho R1 chờ tới khi R2 dẫm lên M làm cửa mở ra, rồi vọt thẳng vào cổng 1 để về cờ F trước R2.',
      san: [
        '########',
        '#.C1.1F#',
        '#.####.#',
        '#..MM..#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      r2: ['move()', 'move()', 'move()', 'move()', 'move()', 'turn_left()', 'move()', 'move()'],
      c1Mau: ['move()', 'move()', 'move()'],
      c1Giai: ['while not front_clear():', '    wait()', 'move()', 'move()', 'move()'],
      goiY: [
        'Ở nhịp 2, R2 bước lên nút đè M(3, 3) khiến cửa C(2, 1) mở ra ở cuối nhịp 2.',
        'Dùng while not front_clear(): wait() để chờ cửa mở, rồi tiến 3 bước qua C -> cổng 1 -> cờ F.'
      ]
    }),

    // 9. Đánh tráo qua cổng
    taoMan('dua-robot', {
      so: 9, ten: 'Đánh tráo qua cổng',
      mucTieu: 'dua-vat',
      deBai: 'Nhặt kiện hàng o, lùi vào cổng dịch chuyển 1 để nhảy sang kho bên dưới và đặt kiện hàng vào đích D trước khi R2 kịp chạy tới cờ F.',
      san: [
        '########',
        '#1..o..#',
        '######.#',
        '#1..D..F',
        '########'
      ],
      bd: [{ x: 3, y: 1, huong: 1 }, { x: 6, y: 1, huong: 2 }],
      r2: ['move()', 'move()', 'turn_left()', 'wait()', 'wait()', 'wait()', 'u_turn()', 'move()'],
      c1Mau: ['pick()', 'back()'],
      c1Giai: ['pick()', 'back()', 'back()', 'move()', 'move()', 'drop()'],
      goiY: [
        'Sau khi pick() kiện hàng ở (4, 1), lùi 2 bước về cổng 1(1, 1) để nhảy sang cổng 1(1, 3).',
        'Từ (1, 3), tiến 2 bước tới (3, 3) và drop() kiện hàng vào D(4, 3).'
      ]
    }),

    // 10. Trùm: Đường đua cơ khí (3 sân)
    taoMan('dua-robot', {
      so: 10, ten: 'Trùm: Đường đua cơ khí',
      huyHieu: { ma: 'dua-robot', ten: 'Tay đua đối kháng' },
      deBai: 'Ba sân đua có chiều dài các chặng khác nhau. Trên cả ba sân, R1 đều đi hết hành lang đầu tới tường, rẽ phải chạy qua bàn xoay @ vào cổng dịch chuyển 1, rồi rẽ trái chạy về cờ F. Viết một chương trình chung với go_wall() để thắng R2 trên cả ba sân.',
      san: [
        [
          '########',
          '#.....@#',
          '#.####1#',
          '#.#1..F#',
          '#.######',
          '#......#',
          '########'
        ],
        [
          '#########',
          '#......@#',
          '#.#####1#',
          '#.#1...F#',
          '#.#######',
          '#.......#',
          '#########'
        ],
        [
          '##########',
          '#.......@#',
          '#.######1#',
          '#.#1....F#',
          '#.########',
          '#........#',
          '##########'
        ]
      ],
      bd: [
        [{ x: 1, y: 4, huong: 0 }, { x: 1, y: 4, huong: 0 }, { x: 1, y: 4, huong: 0 }],
        [{ x: 1, y: 5, huong: 1 }, { x: 1, y: 5, huong: 1 }, { x: 1, y: 5, huong: 1 }]
      ],
      r2: FOR(8, ['wait()', 'move()']),
      c1Mau: ['go_wall()', 'turn_right()', 'go_wall()'],
      c1Giai: ['go_wall()', 'turn_right()', 'go_wall()', 'turn_left()', 'go_wall()'],
      goiY: [
        'Chặng 1: go_wall() đưa R1 lên (1, 1), rồi turn_right() quay sang phải.',
        'Chặng 2: go_wall() đưa R1 qua bàn xoay @ vào cổng 1, nhảy sang cổng 1 ở (3, 3) và dừng trước tường dưới. Gọi turn_left() rồi go_wall() để về cờ F!'
      ]
    })
  ];

  /* ==========================================================================
     CHƯƠNG 2: che-dua-robot — Chiến thuật đối kháng (10 màn)
     ======================================================================== */
  var ds2 = [
    // 1. Chế hàm nước rút
    taoMan('che-dua-robot', {
      so: 1, ten: 'Chế hàm nước rút',
      chinhCoDinh: true,
      deBai: 'Chương trình chính của R1 bị khóa và gọi warp_step() hai lần. Mỗi lần warp_step() cần đưa R1 tiến 2 bước để nhảy qua cổng 1 rồi nhảy tiếp qua cổng 2 về cờ F trước R2. Hãy sửa hàm warp_step() của màn.',
      veMaMau: 'Hàm warp_step() hiện mới đi 1 bước nên R1 chưa tới được cổng dịch chuyển.',
      san: [
        '#########',
        '#.1.12.2F',
        '#.#####.#',
        '#.......#',
        '#########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      r2: ['go_wall()', 'turn_left()', 'move()', 'move()'],
      hmMau: [ham('warp_step', ['move()'])],
      hmGiai: [ham('warp_step', ['move()', 'move()'])],
      c1Mau: ['warp_step()', 'warp_step()'],
      c1Giai: ['warp_step()', 'warp_step()'],
      goiY: [
        'Lần warp_step() đầu tiên: bước 1 vào cổng 1(2, 1) nhảy sang (4, 1), bước 2 vào cổng 2(5, 1) nhảy sang (7, 1).',
        'Sửa thân hàm warp_step() thành hai lệnh move().'
      ]
    }),

    // 2. Chế hàm khóa cửa
    taoMan('che-dua-robot', {
      so: 2, ten: 'Chế hàm khóa cửa',
      chinhCoDinh: true,
      deBai: 'Chương trình chính bị khóa: gọi seal_gate() rồi go_wall() tới cờ F. Hãy hoàn thiện seal_gate() để R1 nhặt hộp trước mặt, tiến lên ô đó, quay phải đặt hộp lên nút đè M(2, 2) khóa cửa c chặn R2, rồi bước lên hành lang cờ.',
      veMaMau: 'seal_gate() mới nhặt hộp mà chưa đặt lên nút đè M và chưa bước lên hành lang.',
      san: [
        '#######',
        '#.....F',
        '#oM###c',
        '#....#.',
        '######.'
      ],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 6, y: 4, huong: 0 }],
      r2: FOR(4, ['wait()']).concat(FOR(20, ['if front_clear():', '    move()', 'else:', '    wait()'])),
      hmMau: [ham('seal_gate', ['pick()', 'turn_right()'])],
      hmGiai: [ham('seal_gate', ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()', 'move()', 'turn_right()'])],
      c1Mau: ['seal_gate()', 'go_wall()'],
      c1Giai: ['seal_gate()', 'go_wall()'],
      goiY: [
        'Sau pick(), gọi move() rồi turn_right() để M(2, 2) nằm ngay trước mũi, rồi drop().',
        'Tiếp theo turn_left(), move(), turn_right() để R1 đứng ở (1, 1) quay về phía cờ cho go_wall() chạy.'
      ]
    }),

    // 3. Chế hàm hớt tay trên
    taoMan('che-dua-robot', {
      so: 3, ten: 'Chế hàm hớt tay trên',
      mucTieu: 'dua-vat',
      chinhCoDinh: true,
      deBai: 'Chương trình chính gọi steal_box() để giành kiện hàng o ngay trước mũi R2, nhảy qua cổng 1 về đặt vào đích D. Hoàn thiện hàm steal_box() trong Xưởng hàm.',
      veMaMau: 'steal_box() mới nhặt kiện hàng mà chưa lùi vào cổng 1 và đặt vào đích D.',
      san: [
        '#######',
        '#1.o..#',
        '#####.#',
        '#1.D..F',
        '#######'
      ],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 5, y: 1, huong: 2 }],
      r2: ['wait()', 'wait()', 'move()', 'move()'],
      hmMau: [ham('steal_box', ['pick()'])],
      hmGiai: [ham('steal_box', ['pick()', 'back()', 'move()', 'drop()'])],
      c1Mau: ['steal_box()'],
      c1Giai: ['steal_box()'],
      goiY: [
        'Từ (2, 1), sau khi pick() hộp ở (3, 1), gọi back() để lùi vào cổng 1(1, 1) và dịch chuyển sang cổng 1(1, 3).',
        'Từ (1, 3), tiến 1 bước sang (2, 3) rồi drop() hộp vào D(3, 3).'
      ]
    }),

    // 4. Chờ nhịp mở cổng
    taoMan('che-dua-robot', {
      so: 4, ten: 'Chờ nhịp mở cổng',
      deBai: 'R2 đi qua dãy nút đè M sẽ mở cửa C cho R1. Dùng hàm wait_open() của màn để chờ cửa mở rồi chạy thẳng qua cổng dịch chuyển 1 về cờ F trước R2.',
      san: [
        '########',
        '#.C1..1F',
        '#.####.#',
        '#..MM..#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      r2: ['move()', 'move()', 'move()', 'move()', 'move()', 'turn_left()', 'move()', 'move()'],
      hm: [ham('wait_open', ['while not front_clear():', '    wait()'])],
      c1Mau: ['go_wall()'],
      c1Giai: ['wait_open()', 'go_wall()'],
      goiY: [
        'Nếu gọi go_wall() ngay, R1 thấy cửa C đang đóng nên dừng luôn ở nhịp 0.',
        'Gọi wait_open() trước rồi mới gọi go_wall() để R1 chờ cửa mở và phóng qua cổng 1 tới cờ F.'
      ]
    }),

    // 5. Bẻ lái liên hoàn
    taoMan('che-dua-robot', {
      so: 5, ten: 'Bẻ lái liên hoàn',
      deBai: 'Đường đua của R1 có bàn xoay phải @, cổng dịch chuyển 1 và bàn xoay trái %. Hãy hoàn thiện hàm blitz() rồi gọi nó để R1 về đích trước khi R2 chạm cờ.',
      san: [
        '########',
        '#@.1...#',
        '#.####.#',
        '#.#1.%F#',
        '#.#.####',
        '#......#',
        '########'
      ],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 5, huong: 1 }],
      r2: ['for i in range(5):', '    move()', 'turn_left()', 'move()', 'move()'],
      hmMau: [ham('blitz', ['go_wall()'])],
      hmGiai: [ham('blitz', ['go_wall()', 'turn_right()', 'move()'])],
      c1Mau: ['blitz()'],
      c1Giai: ['blitz()'],
      goiY: [
        'Khi R1 gọi go_wall(), R1 đi lên @(1, 1) tự xoay phải, nhảy qua cổng 1(3, 1) xuống (3, 3) rồi tới %(5, 3) tự xoay trái (quay mặt lên trên) và dừng trước tường #(5, 2).',
        'Từ %(5, 3) đang quay mặt lên trên, thêm turn_right() rồi move() vào thân hàm blitz() để bước vào cờ F(6, 3).'
      ]
    }),

    // 6. Cản nhịp giao hàng
    taoMan('che-dua-robot', {
      so: 6, ten: 'Cản nhịp giao hàng',
      mucTieu: 'dua-vat',
      deBai: 'R1 phải đưa kiện hàng o về đích D trước khi R2 tới cờ F. Hãy cho R1 tiến lên ngã tư (3, 2) ngay nhịp đầu để đứng chắn đường R2 trong lúc nhặt kiện hàng o(3, 1), rồi lùi về quay đầu thả vào đích D(3, 4).',
      san: [
        '########',
        '###o####',
        '#.....F#',
        '###.####',
        '###D####',
        '########'
      ],
      bd: [{ x: 3, y: 3, huong: 0 }, { x: 1, y: 2, huong: 1 }],
      r2: FOR(7, ['move()']),
      c1Mau: ['wait()', 'move()', 'pick()'],
      c1Giai: ['move()', 'pick()', 'back()', 'u_turn()', 'drop()'],
      goiY: [
        'Bước 1: move() đưa R1 lên ngã tư (3, 2) trước R2. Khi R1 gọi pick() tại (3, 2), R2 lao tới bị R1 chặn lại 2 nhịp.',
        'Sau khi pick(), gọi back() về (3, 3), u_turn() quay xuống và drop() kiện hàng vào D(3, 4).'
      ]
    }),

    // 7. Đố: về đích cùng nhịp
    taoMan('che-dua-robot', {
      so: 7, ten: 'Đố: về đích cùng nhịp',
      deBai: 'Chương trình có sẵn của R1 đi đường thường nên chạm cờ F ở nhịp 8 — CÙNG LÚC với R2 chạm cờ của nó nên vẫn bị xử thua! Hãy sửa hàm rush() để R1 đi qua cổng dịch chuyển 1 và về đích ở nhịp 4.',
      veMaMau: 'Về đích cùng nhịp với đối thủ vẫn thua: phải tới cờ TRƯỚC R2 ít nhất 1 nhịp.',
      san: [
        '########',
        '#.1..1F#',
        '#......#',
        '#.####F#',
        '#......#',
        '########'
      ],
      bd: [{ x: 1, y: 2, huong: 0 }, { x: 1, y: 4, huong: 1 }],
      r2: ['wait()', 'go_wall()', 'turn_left()', 'move()'],
      hmMau: [ham('rush', ['turn_right()', 'go_wall()', 'turn_left()', 'move()'])],
      hmGiai: [ham('rush', ['move()', 'turn_right()', 'go_wall()'])],
      c1Mau: ['rush()'],
      c1Giai: ['rush()'],
      goiY: [
        'Cổng 1(2, 1) nằm ở hàng trên: từ (1, 2), chỉ cần tiến 1 bước lên (1, 1), quay phải rồi go_wall() qua cổng 1 tới thẳng cờ F.',
        'Sửa thân hàm rush() thành: move(), turn_right(), go_wall().'
      ]
    }),

    // 8. Đố: quên chốt cửa
    taoMan('che-dua-robot', {
      so: 8, ten: 'Đố: quên chốt cửa',
      chinhCoDinh: true,
      deBai: 'Chương trình chính gọi lock_rival() rồi chạy tới cờ F. Hàm lock_rival() hiện quay phải đặt hộp vào tường thay vì đặt xuống nút đè M(2, 4) bên dưới, khiến cửa c(6, 2) vẫn mở cho R2 về cờ trước! Sửa lock_rival() để đặt hộp đúng lên nút M.',
      veMaMau: 'Hộp chưa đè lên nút M(2, 4) nên cửa c không đóng lại.',
      san: [
        '#######',
        '#.....F',
        '#..###c',
        '#o...#.',
        '#.M..#.',
        '#######'
      ],
      bd: [{ x: 2, y: 3, huong: 3 }, { x: 6, y: 4, huong: 0 }],
      r2: FOR(4, ['wait()']).concat(FOR(20, ['if front_clear():', '    move()', 'else:', '    wait()'])),
      hmMau: [ham('lock_rival', ['pick()', 'turn_right()', 'drop()', 'turn_right()'])],
      hmGiai: [ham('lock_rival', ['pick()', 'turn_left()', 'drop()', 'u_turn()'])],
      c1Mau: ['lock_rival()', 'go_wall()', 'turn_right()', 'go_wall()'],
      c1Giai: ['lock_rival()', 'go_wall()', 'turn_right()', 'go_wall()'],
      goiY: [
        'R1 ở (2, 3) đang quay mặt sang trái (hướng 3). Nút đè M(2, 4) nằm ngay bên dưới (bên trái của hướng 3).',
        'Trong lock_rival(): sau khi pick(), gọi turn_left() để quay xuống M(2, 4), gọi drop() để đè nút M, rồi gọi u_turn() để quay mặt lên trên cho go_wall() chạy.'
      ]
    }),

    // 9. Hai tầng dịch chuyển
    taoMan('che-dua-robot', {
      so: 9, ten: 'Hai tầng dịch chuyển',
      mucTieu: 'dua-vat',
      deBai: 'Sân có cả cổng 1 và cổng 2. Dùng hàm warp_deliver() để R1 tiến qua cổng 1, nhặt hộp o, bước tiếp vào cổng 2 nhảy về cạnh đích D và thả hộp trước khi R2 tới cờ F.',
      san: [
        '#########',
        '#.1..1o2#',
        '#.#####.#',
        '#D2....F#',
        '#########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 3, huong: 1 }],
      r2: FOR(4, ['wait()', 'move()']),
      hmMau: [ham('warp_deliver', ['move()', 'pick()'])],
      hmGiai: [ham('warp_deliver', ['move()', 'pick()', 'move()', 'move()', 'u_turn()', 'drop()'])],
      c1Mau: ['warp_deliver()'],
      c1Giai: ['warp_deliver()'],
      goiY: [
        'Bước 1: move() vào cổng 1(2, 1) nhảy sang (5, 1), đứng ngay trước hộp o(6, 1).',
        'Sau khi pick() hộp ở (6, 1), gọi move(), move() để bước vào cổng 2(7, 1) nhảy xuống (2, 3), rồi u_turn() quay về trái và drop() vào D(1, 3).'
      ]
    }),

    // 10. Trùm: Đại chiến cơ khí (3 sân)
    taoMan('che-dua-robot', {
      so: 10, ten: 'Trùm: Đại chiến cơ khí',
      mucTieu: 'dua-vat',
      huyHieu: { ma: 'che-dua-robot', ten: 'Chiến lược gia đối kháng' },
      deBai: 'Ba sân đối kháng liên hoàn: cửa C trước mặt R1 mở khi R2 đi qua dãy nút đè M. Hoàn thiện hàm raid() rồi dùng nó để R1 chờ cửa mở, phóng qua cổng 1 tới nhặt kiện hàng o ở cuối hành lang, quay sang trái và đặt lên đích D trước khi R2 chạm cờ F trên cả ba sân.',
      san: [
        [
          '#########',
          '#.C1.1D.#',
          '#.#####o#',
          '#..MM..F#',
          '#########'
        ],
        [
          '##########',
          '#.C1..1D.#',
          '#.######o#',
          '#..MM...F#',
          '##########'
        ],
        [
          '###########',
          '#.C1...1D.#',
          '#.#######o#',
          '#..MM....F#',
          '###########'
        ]
      ],
      bd: [
        [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
        [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }]
      ],
      r2: ['move()', 'move()', 'move()', 'wait()', 'wait()', 'wait()', 'wait()', 'wait()', 'wait()', 'go_wall()'],
      hmMau: [ham('raid', ['while not front_clear():', '    wait()', 'go_wall()'])],
      hmGiai: [ham('raid', ['while not front_clear():', '    wait()', 'go_wall()', 'turn_right()', 'pick()', 'turn_right()', 'drop()'])],
      c1Mau: ['raid()'],
      c1Giai: ['raid()'],
      goiY: [
        'Sau khi cửa C mở, go_wall() đưa R1 qua cổng 1 tới thẳng ô cuối hành lang trên (ngay trên hộp o và ngay bên phải ô đích D).',
        'Tại góc cuối hành lang trên: gọi turn_right(), pick() để nhặt hộp o bên dưới, rồi turn_right() quay sang trái và drop() vào D!'
      ]
    })
  ];

  ManHoc.chuongCoChe = ManHoc.chuongCoChe || [];
  // Neo cuối mùa 4, sau gói Lắp ráp: Đủ bộ (KE-HOACH-MUA.md mục 4: đối kháng thuộc mùa Kỹ sư). Gói dùng bàn xoay, cổng dịch chuyển, nút đè của Sân cơ khí
  // nên phải đứng sau gói đó; gói nhận mùa và ngưỡng sao từ gói đứng trước (lo-trinh-hoc.js).
  ManHoc.chuongCoChe.push({
    sau: 'rap-du',
    goi: { ma: 'dua-robot', ten: 'Đua đối kháng', loai: 'khai-niem', hinh: 'dua-robot' },
    chuong: [
      { ma: 'dua-robot', ten: 'Đua robot đối kháng' },
      { ma: 'che-dua-robot', ten: 'Chiến thuật đối kháng' }
    ],
    ds: ds1.concat(ds2)
  });
})();

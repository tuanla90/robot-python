/* ============================================================================
   thu-mua-9.js — "Mật Lệnh Robot": MÀN GIẢ ĐỂ SOÁT GIAO DIỆN MÙA 9 (window.ThuMua9 / module.exports). Gói M9D2 (4/11).
   CHỈ DÙNG KHI GỠ LỖI: không thêm màn nào vào lộ trình; không gọi thì không có gì xảy ra. Nạp CUỐI choi.html (sau ung-dung.js).
   Dữ liệu chép từ màn giả của hoc/kiem-chon-doi.mjs (gói M9D1): cùng sân, cùng lời giải mẫu. Khác một chỗ: R3 máy khách sơn 'tim' (bản gốc 'lam' trùng màu hồng của Luna R2).
     ThuMua9.manChonDoi()   → màn chọn đội: bảng 3 cỗ máy (CH, DR, CU), chọn 2 cho Sola / Luna; R3 máy khách khoá (xe cứu hỏa) chạy maMau.doi[2]
     ThuMua9.manLapRobot2() → màn đội, lắp robot thứ hai (lapRap.robot = 1): R1 xe chở hàng đặt sẵn, Luna tự lắp (xích / hai bánh, tay vòi phun)
     ThuMua9.manBaRobot()   → màn đội thường ba robot (đội đã ghép sẵn, không chọn), R3 khoá
     ThuMua9.vao('chon-doi' | 'lap-r2' | 'ba-robot')   (trình duyệt) vào thẳng màn giả qua App.vaoManDuLieu (cùng đường với App.vaoMan)
     ThuMua9.vao('cuu-nguoi' | 'thac' | 'rac-cat' | 'phao' | 'gio' | 'nam-cham' | 'gau' | 'xe-toi' | 'phun-van' | 'cont-troi' | 'be-sac' | 'lap-ho' | 'binh-xit')   (M9H1; binh-xit M9L15) màn giả một robot soát hình sân mùa 9; ThuMua9.dsSan9 = danh sách
     ThuMua9.vao('cont-chan')   (M9T5; ThuMua9.manContChan(), màn ĐỘI nên không nằm trong dsSan9) màn giả hai robot: xe cứu hỏa đâm chồng container (contChan), cần cẩu nhấc đi rồi xe qua ủi thùng vào đích
   Node: máy kiểm hoc/kiem-giao-dien-chon-doi.mjs require tệp này (cần co-may.js, man-chuoi-1.js).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  function CoMay() { return laNode ? require('../co-may.js') : window.CoMay; }
  function ManHoc() { return laNode ? require('../man-chuoi-1.js') : window.ManHoc; }
  function LapRap() { return laNode ? require('../lap-rap.js') : window.LapRap; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var FWD = { ten: 'forward', thamSo: ['n'], than: ['for i in range(n):', '    left_move()', '    right_move()', '    wait()'] };
  var WN = { ten: 'wait_n', thamSo: ['n'], than: ['for i in range(n):', '    wait()'] };
  var FLY = { ten: 'fly_right', thamSo: ['n'], than: ['for i in range(n):', '    go_right()'] };
  var QUAY_BANH = { ten: 'turn_back', thamSo: [], than: ['for i in range(2):', '    left_move()', '    wait()'] };
  var QUAY_XICH = { ten: 'turn_back', thamSo: [], than: ['for i in range(4):', '    left_move()', '    wait()'] };
  function ham() { return [FWD, WN, FLY].map(clone); }
  var SAN3 = ['########', '#.....F#', '#M....F#', '#..C..F#', '########'];
  var R2_GIU_CUA = ['forward(1)', 'wait_n(10)', 'turn_back()', 'forward(5)'];

  /** Chương gắn cho màn giả: chương đang xem (trình duyệt) để ◀ về lưới màn không vỡ; Node: 'thu'. */
  function chuongThu() {
    if (!laNode && window.App && App.chuong) return App.chuong;
    if (!laNode && window.ManHoc && ManHoc.danhSach && ManHoc.danhSach[0]) return ManHoc.danhSach[0].chuong;
    return 'thu';
  }
  function chuan(m) { return ManHoc().chuanHoa(m); }

  function thoChonDoi() {
    var r3 = Object.assign(CoMay().dung('CU', { son: 'tim', batDau: { x: 1, y: 3, huong: 1 } }), { coDinh: true, co: [{ x: 6, y: 3 }] });
    return {
      ma: 'thu.chon-doi', id: 'T9.1', chuong: chuongThu(), so: 1, ten: 'Thử chọn đội', hang: 'lam-quen', san: SAN3.slice(),
      noi: [{ nut: { x: 1, y: 2 }, cua: [{ x: 3, y: 3 }] }],
      batDau: { x: 1, y: 1, huong: 1 }, mucTieu: 'toi-co', khung: { chinh: 10, moiHam: 8 }, cauTruc: ['for'], hamCuaEmCan: [], camHamCuaEm: false,
      deBai: 'Chọn hai cỗ máy. Một bạn giữ cửa cho xe cứu hỏa.',
      doi: [{ batDau: { x: 1, y: 1, huong: 1 }, co: [{ x: 6, y: 1 }] }, { batDau: { x: 2, y: 2, huong: 3 }, co: [{ x: 6, y: 2 }] }, r3],
      chonDoi: {
        menu: ['CH', 'DR', 'CU'],
        cachMau: [
          { chon: ['CH', 'CU'], ghiChu: 'đôi tốt', loiGiai: { doi: [{ chinh: ['forward(5)'] }, { chinh: R2_GIU_CUA.slice() }], hamCuaMan: ham().concat([clone(QUAY_XICH)]) } },
          { chon: ['DR', 'CH'], loiGiai: { doi: [{ chinh: ['fly_right(5)'] }, { chinh: R2_GIU_CUA.slice() }], hamCuaMan: ham().concat([clone(QUAY_BANH)]) } }
        ]
      },
      maMau: { doi: [{ chinh: [] }, { chinh: [] }, { chinh: ['wait_n(4)', 'forward(5)'] }], hamCuaMan: ham() },
      loiSai: [], sao: { o: 20, nhip: 24 }
    };
  }
  function manChonDoi() { return chuan(thoChonDoi()); }

  function manLapRobot2() {
    var r1 = Object.assign(CoMay().dung('CH', { batDau: { x: 1, y: 1, huong: 1 } }), { co: [{ x: 6, y: 1 }] });
    return chuan({
      ma: 'thu.lap-r2', id: 'T9.2', chuong: chuongThu(), so: 2, ten: 'Thử lắp R2', hang: 'lam-quen', san: ['########', '#.....F#', '#.....F#', '########'],
      batDau: { x: 1, y: 1, huong: 1 }, mucTieu: 'toi-co', khung: { chinh: 10, moiHam: 8 }, cauTruc: ['for'], hamCuaEmCan: [], camHamCuaEm: false,
      deBai: 'Lắp robot cho Luna rồi đưa hai bạn tới cờ.',
      loaiRobot: r1.loaiRobot, robot: clone(r1.robot), hamGoc: r1.hamGoc.slice(),
      doi: [r1, { batDau: { x: 6, y: 2, huong: 3 }, co: [{ x: 6, y: 2 }], son: 'lam' }],
      lapRap: {
        robot: 1, than: ['xich', 'hai-banh'], tay: ['hoi'], camBien: [], nganSach: 6,
        cachLap: [
          { than: 'xich', tay: 'hoi', loiGiai: { doi: [{ chinh: ['forward(5)'] }, { chinh: ['forward(1)', 'turn_back()', 'forward(1)'] }], hamCuaMan: ham().concat([clone(QUAY_XICH)]) } },
          { than: 'hai-banh', tay: null, loiGiai: { doi: [{ chinh: ['forward(5)'] }, { chinh: ['forward(1)', 'turn_back()', 'forward(1)'] }], hamCuaMan: ham().concat([clone(QUAY_BANH)]) } }
        ]
      },
      maMau: { doi: [{ chinh: [] }, { chinh: [] }], hamCuaMan: ham() },
      loiSai: [], sao: { o: 20, nhip: 20 }
    });
  }

  /** Màn đội ba robot đã ghép sẵn (không chọn đội): đội = cách mẫu đầu của màn chọn đội; R3 khoá chạy maMau.doi[2]. */
  function manBaRobot() {
    var tho = thoChonDoi(), a = LapRap().apDungDoi(tho, tho.chonDoi.cachMau[0]);
    var m = Object.assign({}, a);
    delete m.chonDoi; delete m.manGoc; delete m.chonDaChon;
    m.ma = 'thu.ba-robot'; m.id = 'T9.3'; m.so = 3; m.ten = 'Thử ba robot';
    m.deBai = 'Giữ cửa cho xe cứu hỏa.';
    m.doi = a.doi.map(function (r) { return clone(r); });
    return chuan(m);
  }

  /* ---- M9H1 (4/11): màn giả MỘT robot để soát hình sân mùa 9 (người cần cứu, thác, cát, phao, giỏ, nam châm, gầu, xe tời, phun van).
     Sân + lời giải chép từ sân mẫu hoc/kiem-ve-mua-9.mjs / kiem-lai-mua-9.mjs; lời giải nạp sẵn vào ô lệnh (maMau), bấm Chạy là xem.
     Container trôi, bè sạc, container lấp hố: 'cont-troi' / 'be-sac' / 'lap-ho' (thêm sau khi cham.js đưa ba lớp này xuống lõi). */
  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TIEN9 = ['left_move()', 'right_move()', 'wait()'];
  function manSan9(ma, ten, deBai, lai, cach, them, chinh) {
    var tho = Object.assign({
      ma: 'thu.' + ma, id: 'T9.' + ma, chuong: chuongThu(), so: 9, ten: ten, hang: 'lam-quen', deBai: deBai,
      mucTieu: 'toi-co', khung: { chinh: 12, moiHam: 8 }, cauTruc: [], hamCuaEmCan: [], camHamCuaEm: false,
      maMau: { chinh: chinh.slice() }, loiGiai: { chinh: chinh.slice() }, loiSai: [], sao: { o: 20, nhip: 40 }
    }, them);
    if (lai) {                                                                                  // robot lai: LapRap.apDung như máy kiểm lõi; bỏ lapRap để vào thẳng màn chơi
      tho.lapRap = { moLai: [lai] };
      tho = LapRap().apDung(tho, cach);
      delete tho.lapRap; delete tho.manGoc; delete tho.cachLapDaChon; delete tho.giaLap; delete tho.loiGiai;
      tho.loiGiai = { chinh: chinh.slice() };
    }
    return chuan(tho);
  }
  var SAN9 = {
    'cuu-nguoi': function () { return manSan9('cuu-nguoi', 'Thử kéo người', 'Quăng lưới kéo người lên bờ.', null, null,
      { san: ['~~~~~', '~~~~~', '.....', '....F'], batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'xuong', robot: { than: 'xuong', tay: 'day-keo', camBien: [] },
        hamGoc: BANH.concat(['cast_net', 'drop_net']), mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 1 }], tramCuu: [{ x: 3, y: 3 }] },   // M9H2: trạm cứu cạnh cờ F (trước ở ngay ô F, hai hình chồng nhau)
      ['cast_net()', 'wait()', 'wait()', 'wait()', 'wait()', 'wait()']); },
    'thac': function () { return manSan9('thac', 'Thử thác', 'Người trôi vào thác (thua).', null, null,
      { san: ['~~~~', '....', '...F'], batDau: { x: 0, y: 1, huong: 1 }, hamGoc: BANH, mucTieu: 'cuu-nguoi', nguoi: [{ x: 0, y: 0 }], tramCuu: [{ x: 3, y: 2 }],
        thac: [{ x: 1, y: 0 }], dong: [{ x: 0, y: 0, huong: 1, suc: 1 }] }, ['wait()', 'wait()']); },
    'rac-cat': function () { return manSan9('rac-cat', 'Thử rắc cát', 'Rắc cát lên bùn trơn rồi đi qua.', 'R', { than: 'hai-banh', tay: 'son' },
      { san: ['..I.F', '.....'], batDau: { x: 2, y: 0, huong: 1 } }, ['ink("yellow")', 'dot()', 'wait()'].concat(TIEN9)); },
    'phao': function () { return manSan9('phao', 'Thử phao', 'Thả phao cho người bám.', 'L10', { than: 'drone', tay: 'day-keo' },
      { san: ['~~~~~', '~~~~~', '...F.'], batDau: { x: 2, y: 0 }, nguoi: [{ x: 1, y: 0 }], tramCuu: [{ x: 0, y: 2 }], dong: [1, 2, 3].map(function (x) { return { x: x, y: 0, huong: 1, suc: 1 }; }) },
      ['cast_net()', 'wait()', 'wait()']); },
    'gio': function () { return manSan9('gio', 'Thử giỏ cứu hộ', 'Cẩu vớt người bằng giỏ, đặt lên bờ.', 'L9', { than: 'cau', tay: 'day-keo' },
      { san: ['~~~~~', '.....', '.....'], batDau: { x: 2, y: 1, nac: 0, tam: 1 }, mucTieu: 'cuu-nguoi', nguoi: [{ x: 2, y: 0 }], tramCuu: [{ x: 0, y: 2 }] },
      ['cast_net()', 'swing_left()', 'swing_left()', 'drop_net()', 'wait()', 'wait()']); },
    'nam-cham': function () { return manSan9('nam-cham', 'Thử cẩu nam châm', 'Hút thanh sắt, quay, thả.', 'L1', { than: 'cau', tay: 'nam-cham' },
      { san: ['.....', '.....', '.#o..', '....F'], batDau: { x: 0, y: 2, nac: 2, tam: 1 }, vatChat: ['.....', '.....', '..s..', '.....'] },
      ['extend()', 'magnet_n()', 'swing_left()', 'magnet_off()']); },
    'gau': function () { return manSan9('gau', 'Thử cẩu gầu', 'Gầu ngoạm thùng, quay, thả.', 'L8', { than: 'cau', tay: 'kep' },
      { san: ['.....', '.....', '.#o..', '....F'], batDau: { x: 0, y: 2, nac: 2, tam: 1 } }, ['extend()', 'grab()', 'swing_left()', 'release()']); },
    'xe-toi': function () { return manSan9('xe-toi', 'Thử xe tời bờ', 'Xe trên bờ quăng lưới kéo bè.', 'L3', { than: 'hai-banh', tay: 'day-keo' },
      { san: ['.~~B', '...F'], batDau: { x: 0, y: 0, huong: 1 } }, ['set_length(3)', 'cast_net()', 'wait()']); },
    'phun-van': function () { return manSan9('phun-van', 'Thử phun van', 'Phun nước gạt van mở cống.', null, null,
      { san: ['.V...', '~K~~~', '#####'], batDau: { x: 0, y: 0, huong: 1 }, robot: { than: 'hai-banh', tay: 'hoi', camBien: [] }, hamGoc: BANH.concat(['spray']) },
      ['spray()', 'wait()']); },
    // 4/11 sau M9H1: cham.js đã đưa contTroi / beSac / contLapHo xuống lõi — màn giả cho ba lớp này (sân chép kiem-lai-mua-9.mjs L2 / T4 / T2)
    'cont-troi': function () { return manSan9('cont-troi', 'Thử container trôi', 'Đọc số container trôi trước mũi.', 'L2', { than: 'xuong', tay: 'day-keo', camBien: 'quet-ma' },
      { san: ['~~~~~', '~~B~~', '~~~~Q'], batDau: { x: 1, y: 1, huong: 1 }, contTroi: [{ x: 2, y: 1, so: 12 }] }, ['a = read_code()', 'wait()']); },
    'be-sac': function () { return manSan9('be-sac', 'Thử bè sạc', 'Drone đáp lên bè sạc đang trôi.', null, null,
      { san: ['~B~~', '....', '...F'], batDau: { x: 0, y: 1 }, loaiRobot: 'drone', robot: { than: 'drone', tay: null, camBien: [] }, hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'land', 'take_off'],
        pin: 6, dong: [{ x: 1, y: 0, huong: 1, suc: 1 }, { x: 2, y: 0, huong: 1, suc: 1 }], beSac: [{ x: 1, y: 0 }] }, ['go_right()', 'go_right()', 'go_right()', 'go_up()', 'land()']); },
    'lap-ho': function () { return manSan9('lap-ho', 'Thử lấp hố', 'Cẩu hạ container xuống hố.', null, null,
      { san: ['.....', '.#u#.', '.....', '....F'], batDau: { x: 2, y: 0, nac: 5, tam: 2 }, loaiRobot: 'cau', robot: { than: 'cau', tay: 'moc-cau', camBien: [] },
        hamGoc: ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'pick_up', 'set_down'], contLapHo: true, chong: [{ x: 0, y: 2, cont: [{ so: 5 }] }] },
      ['pick_up()', 'swing_left()', 'retract()', 'set_down()']); },
    // M9L15 (4/11): drone + bình xịt bụng — bay qua hàng rào tới ô lửa, xịt (lửa tắt), rồi bay ra van V giữa nước, xịt (van đổi), về cờ
    'binh-xit': function () { return manSan9('binh-xit', 'Thử bình xịt', 'Drone xịt tắt lửa, rồi xịt gạt van giữa nước.', 'L15', { than: 'drone', tay: 'hoi' },
      { san: ['.=.....', '.=..~V~', '......F'], batDau: { x: 0, y: 0 }, lua: [{ x: 2, y: 0, suc: 1 }] },
      ['go_right()', 'go_right()', 'spray()', 'go_right()', 'go_down()', 'go_right()', 'go_right()', 'spray()', 'go_down()', 'go_right()']); }
  };

  // M9T5 (5/11): chồng container chặn như tường (cfg.contChan). Đội hai robot, mục tiêu đẩy thùng: xe cứu hỏa (Sola, xích) tiến vào chồng ở (1, 2) → đâm hai lần (nhịp 1, 2);
  //   cần cẩu (Luna, bệ trên ray hàng trên) đầu cần trên chồng, nhấc đi ở nhịp 2 rồi hạ sang (3, 0) → nhịp 3 xích đi qua ô chồng cũ, ủi thùng H vào ô đích D (nhịp 5).
  function manContChan() {
    var xe = CoMay().dung('CU', { batDau: { x: 0, y: 2, huong: 1 } });
    var cau = CoMay().dung('CC', { batDau: { x: 1, y: 0, nac: 4, tam: 2 }, son: 'lam' });
    var bai = { doi: [{ chinh: ['for i in range(5):', '    left_move()', '    right_move()', '    wait()'] }, { chinh: ['wait()', 'pick_up()', 'swing_left()', 'swing_left()', 'set_down()'] }] };
    var tho = Object.assign({
      ma: 'thu.cont-chan', id: 'T9.cont-chan', chuong: chuongThu(), so: 9, ten: 'Thử chồng chặn', hang: 'lam-quen', deBai: 'Xe đâm chồng container. Cẩu nhấc đi, xe qua ủi thùng.',
      san: ['RRR..', '.....', '..H.D'], batDau: clone(xe.batDau), robot: clone(xe.robot), hamGoc: xe.hamGoc.slice(),
      doi: [xe, cau], contChan: true, chong: [{ x: 1, y: 2, cont: [{ so: 3 }] }],
      mucTieu: 'day-thung', khung: { chinh: 12, moiHam: 8 }, cauTruc: ['for'], hamCuaEmCan: [], camHamCuaEm: false,
      maMau: clone(bai), loiGiai: clone(bai), loiSai: [], sao: { o: 20, nhip: 40 }
    }, { loaiRobot: xe.loaiRobot, xichDay: true, lucBan: true });
    return chuan(tho);
  }

  var API = { manChonDoi: manChonDoi, manLapRobot2: manLapRobot2, manBaRobot: manBaRobot, manContChan: manContChan };
  API.san9 = function (ten) { var f = SAN9[ten]; return f ? f() : null; };
  API.dsSan9 = Object.keys(SAN9);
  /** Trình duyệt: vào thẳng màn giả (App.vaoManDuLieu cùng đường với App.vaoMan). */
  API.vao = function (ten) {
    var tao = { 'chon-doi': manChonDoi, 'lap-r2': manLapRobot2, 'ba-robot': manBaRobot, 'cont-chan': manContChan }[ten || 'chon-doi'] || SAN9[ten];
    if (!tao || laNode || !window.App || !App.vaoManDuLieu) return null;
    var m = tao();
    App.vaoManDuLieu(m);
    return m;
  };

  if (laNode) module.exports = API; else window.ThuMua9 = API;
})();

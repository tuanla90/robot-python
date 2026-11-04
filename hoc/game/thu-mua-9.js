/* ============================================================================
   thu-mua-9.js — "Mật Lệnh Robot": MÀN GIẢ ĐỂ SOÁT GIAO DIỆN MÙA 9 (window.ThuMua9 / module.exports). Gói M9D2 (4/11).
   CHỈ DÙNG KHI GỠ LỖI: không thêm màn nào vào lộ trình; không gọi thì không có gì xảy ra. Nạp CUỐI choi.html (sau ung-dung.js).
   Dữ liệu chép từ màn giả của hoc/kiem-chon-doi.mjs (gói M9D1): cùng sân, cùng lời giải mẫu.
     ThuMua9.manChonDoi()   → màn chọn đội: bảng 3 cỗ máy (CH, DR, CU), chọn 2 cho Sola / Luna; R3 máy khách khoá (xe cứu hỏa) chạy maMau.doi[2]
     ThuMua9.manLapRobot2() → màn đội, lắp robot thứ hai (lapRap.robot = 1): R1 xe chở hàng đặt sẵn, Luna tự lắp (xích / hai bánh, tay vòi phun)
     ThuMua9.manBaRobot()   → màn đội thường ba robot (đội đã ghép sẵn, không chọn), R3 khoá
     ThuMua9.vao('chon-doi' | 'lap-r2' | 'ba-robot')   (trình duyệt) vào thẳng màn giả qua App.vaoManDuLieu (cùng đường với App.vaoMan)
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
    var r3 = Object.assign(CoMay().dung('CU', { son: 'lam', batDau: { x: 1, y: 3, huong: 1 } }), { coDinh: true, co: [{ x: 6, y: 3 }] });
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

  var API = { manChonDoi: manChonDoi, manLapRobot2: manLapRobot2, manBaRobot: manBaRobot };
  /** Trình duyệt: vào thẳng màn giả (App.vaoManDuLieu cùng đường với App.vaoMan). */
  API.vao = function (ten) {
    var tao = { 'chon-doi': manChonDoi, 'lap-r2': manLapRobot2, 'ba-robot': manBaRobot }[ten || 'chon-doi'];
    if (!tao || laNode || !window.App || !App.vaoManDuLieu) return null;
    var m = tao();
    App.vaoManDuLieu(m);
    return m;
  };

  if (laNode) module.exports = API; else window.ThuMua9 = API;
})();

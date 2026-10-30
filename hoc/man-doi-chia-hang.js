/* ============================================================================
   man-doi-chia-hang.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 8 "Đội chia hàng" (KE-HOACH-MUA-4.md; phiên "Mùa 4", 30/10).
   Gói 8 dùng hai chương đội có sẵn (man-doi-nam-cham.js): R1 xe hai bánh gắn NAM CHÂM + cảm biến khoảng cách, R2 xe hai bánh gắn TAY KẸP + camera bốn hướng
   + cảm biến khoảng cách (lo-trinh-hoc.js đổi camera trước cũ thành camera-4, sort_color thành sort_by_color).
   Tệp này thêm hai MÀN CẦU NỐI cho đường cong (user 30/10 "sửa gói 8"; đo bằng cong4.js: dòng / nhịp / ô không vượt max(1,5 × màn trước, màn trước + lề)):
     - doi-nam-cham.11 "Lại gần mới hút được": như doi-nam-cham.3 nhưng R1 đứng xa, phải tiến ba ô cho vật sắt vào tầm hút; cả hai robot em viết.
       Nối doi-nam-cham.3 (4 dòng / 7 nhịp) với doi-nam-cham.8 (8 dòng / 15 nhịp): R1 tiến ba ô.
     - doi-nam-cham.12 "Hai trạm sát nhau": bản hai trạm (cạnh nhau, step(0, 1)) của doi-nam-cham.9 "Ba trạm"; R2 khoá, em viết R1 (8 dòng).
       Nối doi-nam-cham.4 (6 dòng / 15 nhịp / 10 ô) với doi-nam-cham.9 (12 dòng / 27 nhịp; sân bít hai ô thừa còn 22 ô, lo-trinh-hoc.js).
   Thứ tự chương khai trong MUA_4 (lo-trinh-hoc.js). Máy kiểm: hoc/kiem-man-mua-4.mjs, hoc/kiem-lo-trinh.mjs mục mùa 4.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var NC = ['magnet_n', 'magnet_s', 'magnet_off'];
  var XE_NC = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'nam-cham', camBien: [{ ma: 'khoang-cach', o: 'hong' }] }, hamGoc: BANH.concat(NC, ['front_clear', 'front_metal', 'front_pole']) };
  var XE_MAU = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'camera-4', o: 'tren' }, { ma: 'khoang-cach', o: 'hong' }] }, hamGoc: BANH.concat(TAY, ['front_clear', 'left_clear', 'right_clear', 'color']) };
  function chep(x) { return JSON.parse(JSON.stringify(x)); }
  function B(c1, c2) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: [], hamCuaEmMoi: [] }; }
  function LAP(n, lenh) { return ['for i in range(' + n + '):'].concat(lenh.map(function (s) { return '    ' + s; })); }
  var CHO_HANG = ['while front_clear():', '    wait()'];

  /** Màn hai robot của gói 8: m.bd = [batDau R1, batDau R2]; m.khoa2: R2 tự động (chương trình khoá). */
  function man(m) {
    var bd = m.bd, khoa2 = m.khoa2; delete m.bd; delete m.khoa2;
    m.chuong = m.chuong || 'doi-nam-cham';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = 'dua-vat';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    m.nhipTheoLoiGiai = true;
    m.doi = [Object.assign({ batDau: bd[0] }, chep(XE_NC)), Object.assign({ batDau: bd[1] }, chep(XE_MAU))];
    if (khoa2) m.doi[1].coDinh = true;
    m.batDau = bd[0]; m.loaiRobot = XE_NC.loaiRobot; m.robot = chep(XE_NC.robot); m.hamGoc = XE_NC.hamGoc.slice();
    m.taoHam = m.taoHam || []; m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }

  var CHO_SORT = CHO_HANG.concat(['sort_by_color()']);
  var R1_GAN = ['move()', 'move()', 'move()', 'lane()'];
  var THAN_TRAM = ['step(0, 1)', 'magnet_n()', 'wait()', 'u_turn()', 'magnet_off()', 'wait()', 'u_turn()'];
  var R2_TRAM = LAP(2, ['step(0, 1)'].concat(CHO_HANG, ['pass_back()']));

  var DS = [
    man({
      so: 11, ten: 'Lại gần mới hút được', hamCuaEmCan: ['lane', 'move', 'sort_by_color'],
      deBai: 'Vật sắt nằm sau hàng rào, nhưng R1 đứng xa: nam châm chỉ hút được sắt cách mũi xe hai ô. R1 tiến lại gần rồi dùng lane() kéo vật qua rào, đặt trước mũi R2. ' +
        'R2 chờ tới khi có vật trước mũi rồi sort_by_color() đặt vào đích cùng màu. Viết cả hai robot.',
      veMaMau: 'Chạy thử: R1 bật nam châm từ xa nên không hút được gì, R2 gắp hụt. Cho R1 tiến lại gần, cho R2 chờ.',
      san: ['######', '##o###', '##=#D#', '#....#', '##.#D#', '##.###', '##.###', '######'],
      vatChat: ['......', '..s...', '......', '......', '......', '......', '......', '......'],
      vatMau: ['......', '..r...', '......', '......', '......', '......', '......', '......'],
      mau: ['......', '......', '....r.', '......', '....b.', '......', '......', '......'],
      bd: [{ x: 2, y: 6, huong: 0 }, { x: 4, y: 3, huong: 3 }],
      maMau: B(['lane()'], ['sort_by_color()']),
      loiGiai: B(R1_GAN, CHO_SORT),
      sao: { o: 44, nhip: 10 },
      loiSai: [
        { moTa: 'R1 tiến hai ô: vật còn cách ba ô, ngoài tầm hút', baiLam: B(['move()', 'move()', 'lane()'], CHO_SORT), phaiCoMa: [] },
        { moTa: 'R2 không chờ: gắp hụt', baiLam: B(R1_GAN, ['sort_by_color()']), phaiCoMa: [] }
      ],
      goiY: ['Sắt bị hút khi cách mũi xe nhiều nhất hai ô; hàng rào không chắn lực hút.', 'R2: while front_clear(): wait() rồi sort_by_color().']
    }),

    man({
      so: 12, ten: 'Hai trạm sát nhau', hamCuaEmCan: ['step', 'u_turn', 'pass_back'],
      deBai: 'Hai vật sắt nằm sau hai hàng rào cạnh nhau, hai ô đích nằm trong hai hốc dưới đáy. R2 tự động (đã khoá): dịch sang trạm, chờ vật rồi chuyền ra sau lưng vào hốc. ' +
        'Viết R1: ở mỗi trạm dịch sang phải một ô (step(0, 1)), hút vật qua rào, quay đầu thả vào ô giữa, rồi quay lại. Lặp hai trạm.',
      veMaMau: 'Chương trình có sẵn của R1 mới làm trạm đầu. Bọc lại bằng vòng lặp cho cả hai trạm.',
      san: ['######', '##oo##', '##==##', '#...##', '#...##', '#...##', '##DD##', '######'],
      vatChat: ['......', '..ss..', '......', '......', '......', '......', '......', '......'],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      khoa2: true,
      maMau: B(THAN_TRAM, R2_TRAM),
      loiGiai: B(LAP(2, THAN_TRAM), R2_TRAM),
      sao: { o: 43, nhip: 19 },
      congThucKhac: [{ moTa: 'Hút bằng grip()', baiLam: B(LAP(2, ['step(0, 1)', 'grip()', 'u_turn()', 'magnet_off()', 'wait()', 'u_turn()']), R2_TRAM) }],
      loiSai: [
        { moTa: 'Quên quay lại sau khi thả: trạm hai dịch sai hướng', baiLam: B(LAP(2, THAN_TRAM.slice(0, -1)), R2_TRAM), phaiCoMa: [] },
        { moTa: 'Không dịch trạm: lần hai hút hụt', baiLam: B(LAP(2, THAN_TRAM.slice(1)), R2_TRAM), phaiCoMa: [] }
      ],
      goiY: ['step(0, 1) dịch sang phải một ô, giữ nguyên hướng mặt.', 'Sau khi thả, u_turn() để mặt lại hướng lên hàng rào.']
    })
  ];

  ManHoc.manDoiChiaHang = DS;
  if (laNode) module.exports = ManHoc;
})();

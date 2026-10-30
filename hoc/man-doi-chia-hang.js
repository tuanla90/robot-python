/* ============================================================================
   man-doi-chia-hang.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 8 "Đội chia hàng" (KE-HOACH-MUA-4.md; phiên "Mùa 4", 30/10).
   Gói 8 dùng hai chương đội có sẵn (man-doi-nam-cham.js): R1 xe hai bánh gắn NAM CHÂM + cảm biến khoảng cách, R2 xe hai bánh gắn TAY KẸP + camera bốn hướng
   + cảm biến khoảng cách (lo-trinh-hoc.js đổi camera trước cũ thành camera-4, sort_color thành sort_by_color).
   User 30/10: "tối ưu cho hợp tính giáo dục nhất". Thứ tự giữ đúng thang kỹ năng gốc của gói (chờ bằng cảm biến → kéo qua rào → gỗ, chờ có hạn, đường lui
   → đảo vai → sửa → hàm hold_on / hand_off / plan_b), không hai màn sửa liền nhau, và đường cong không nhảy (cong4.js). Bốn màn mới chen đúng chỗ khái niệm:
     - doi-nam-cham.11 "Lại gần mới hút được" (sau Kéo qua rào): sắt chỉ bị hút khi cách mũi xe ≤ 2 ô, R1 tiến ba ô rồi lane(); R2 chờ + sort_by_color.
     - doi-nam-cham.12 "Chuyền ra sau lưng" (giữa hai màn sửa Chờ quá ngắn và Bó tay cho sớm): R2 dùng pass_back() (màn sau R2 tự động dùng lại).
     - che-doi-nam-cham.11 "Hai trạm sát nhau" (mở chương 2, ôn vòng lặp cả đội sau trùm chương 1): hai robot cùng lặp hai trạm, dịch trạm bằng step(0, 1).
     - che-doi-nam-cham.12 "Hai trạm có hạn" (giữa hai màn sửa của chương 2): cùng việc ấy viết bằng hàm em đã chế (hand_off, hold_on): chương trình ngắn hẳn.
   Màn cũ nhường chỗ (sang mùa 5, ẩn, gói chứa doi-nam-cham-cu): doi-nam-cham.6 Hai chuyến tự động, .9 Ba trạm, che-doi-nam-cham.4 Ba trạm có hạn, .9 Hốc nhường đường.
   Thứ tự chương khai trong MUA_4 (lo-trinh-hoc.js). Máy kiểm: hoc/kiem-man-mua-4.mjs, hoc/kiem-doi-nam-cham.mjs, hoc/kiem-goi-doi.mjs, hoc/kiem-lo-trinh.mjs.
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
  var R1_CHUYEN = ['turn_left()', 'move()', 'move()', 'lane()'];
  var CHO_CHUYEN = CHO_HANG.concat(['pass_back()']);
  // hai trạm sát nhau: robot đứng bên trái trạm đầu, mỗi vòng dịch phải một ô rồi làm trạm
  var R1_TRAM = LAP(2, ['step(0, 1)', 'grip()', 'u_turn()', 'magnet_off()', 'wait()', 'u_turn()']);
  var R2_TRAM = LAP(2, ['step(0, 1)'].concat(CHO_HANG, ['pass_back()']));
  var R1_TRAM_HAM = LAP(2, ['step(0, 1)', 'hand_off()', 'u_turn()']);
  var R2_TRAM_HAM = LAP(2, ['step(0, 1)', 'hold_on(5)', 'pass_back()']);
  var SAN_TRAM = ['######', '##oo##', '##==##', '#...##', '##..##', '#...##', '##DD##', '######'];
  var VAT_TRAM = ['......', '..ss..', '......', '......', '......', '......', '......', '......'];

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
      so: 12, ten: 'Chuyền ra sau lưng', hamCuaEmCan: ['turn_left', 'lane', 'move', 'pass_back'],
      deBai: 'Ô đích nằm ngay SAU LƯNG R2. R1 đang quay ngang: quay lên, tiến hai ô rồi lane() kéo vật sắt qua rào, đặt trước mũi R2. R2 chờ có vật rồi pass_back(): gắp vật, quay đầu, đặt vào ô đích sau lưng, quay lại. ' +
        'Viết cả hai robot.',
      veMaMau: 'Chạy thử: R2 nhìn màu rồi đặt sang bên, mà hai bên là tường. Đổi sang pass_back().',
      san: ['#######', '##o####', '##=####', '#....D#', '##.####', '##.####', '#######'],
      vatChat: ['.......', '..s....', '.......', '.......', '.......', '.......', '.......'],
      bd: [{ x: 2, y: 5, huong: 1 }, { x: 4, y: 3, huong: 3 }],
      maMau: B(R1_CHUYEN, CHO_SORT),
      loiGiai: B(R1_CHUYEN, CHO_CHUYEN),
      sao: { o: 41, nhip: 10 },
      loiSai: [
        { moTa: 'R2 đặt sang bên: hai bên là tường', baiLam: B(R1_CHUYEN, CHO_SORT), phaiCoMa: [] },
        { moTa: 'R2 không chờ: gắp hụt', baiLam: B(R1_CHUYEN, ['pass_back()']), phaiCoMa: [] }
      ],
      goiY: ['pass_back() = gắp, quay đầu, đặt xuống, quay lại.', 'R2 vẫn phải chờ vật tới trước: while front_clear(): wait().']
    }),

    man({
      chuong: 'che-doi-nam-cham', so: 11, ten: 'Hai trạm sát nhau', hamCuaEmCan: ['step', 'grip', 'u_turn', 'pass_back'],
      deBai: 'Hai vật sắt nằm sau hai hàng rào cạnh nhau, hai ô đích nằm trong hai hốc dưới đáy. Ở mỗi trạm, R1 dịch sang phải một ô (step(0, 1)), kéo vật qua rào, quay đầu thả vào ô giữa rồi quay lại; ' +
        'R2 cũng dịch sang phải một ô, chờ vật rồi chuyền ra sau lưng vào hốc. Cả hai lặp hai trạm.',
      veMaMau: 'Chương trình có sẵn mới làm trạm đầu. Bọc chương trình của mỗi robot trong vòng lặp hai lần.',
      san: SAN_TRAM,
      vatChat: VAT_TRAM,
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      maMau: B(R1_TRAM.slice(1).map(function (s) { return s.slice(4); }), R2_TRAM.slice(1).map(function (s) { return s.slice(4); })),
      loiGiai: B(R1_TRAM, R2_TRAM),
      sao: { o: 47, nhip: 19 },
      loiSai: [
        { moTa: 'Chỉ R1 lặp: R2 dừng sau trạm đầu', baiLam: B(R1_TRAM, R2_TRAM.slice(1).map(function (s) { return s.slice(4); })), phaiCoMa: [] },
        { moTa: 'R1 quên quay lại sau khi thả: trạm hai dịch sai hướng', baiLam: B(R1_TRAM.slice(0, -1), R2_TRAM), phaiCoMa: [] }
      ],
      goiY: ['step(0, 1) dịch sang phải một ô, giữ nguyên hướng mặt.', 'Sau khi thả, u_turn() để mặt lại hướng lên hàng rào.']
    }),

    man({
      chuong: 'che-doi-nam-cham', so: 12, ten: 'Hai trạm có hạn', hamCuaEmCan: ['step', 'hand_off', 'u_turn', 'hold_on', 'pass_back'],
      deBai: 'Lại hai trạm sát nhau như màn đầu chương, nhưng lần này viết bằng các hàm em đã chế: R1 dùng hand_off() để kéo vật về và thả, R2 dùng hold_on(5) để chờ. ' +
        'Mỗi robot chỉ còn ba dòng trong vòng lặp.',
      veMaMau: 'Chương trình có sẵn mới làm trạm đầu. Viết vòng lặp hai trạm, thay từng đoạn bằng hàm em đã chế cho gọn.',
      san: SAN_TRAM,
      vatChat: VAT_TRAM,
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      maMau: B(['step(0, 1)', 'hand_off()', 'u_turn()'], ['step(0, 1)', 'hold_on(5)', 'pass_back()']),
      congThucKhac: [{ moTa: 'Bản viết tay như màn đầu chương', baiLam: B(R1_TRAM, R2_TRAM) }],
      loiGiai: B(R1_TRAM_HAM, R2_TRAM_HAM),
      sao: { o: 50, nhip: 19 },
      loiSai: [
        { moTa: 'R2 chờ quá ngắn: gắp khi vật chưa tới', baiLam: B(R1_TRAM_HAM, LAP(2, ['step(0, 1)', 'hold_on(1)', 'pass_back()'])), phaiCoMa: [] },
        { moTa: 'R1 quên quay lại sau hand_off()', baiLam: B(LAP(2, ['step(0, 1)', 'hand_off()']), R2_TRAM_HAM), phaiCoMa: [] }
      ],
      goiY: ['hand_off() = grip(), u_turn(), magnet_off(), wait(): sau đó R1 đang quay mặt xuống, cần u_turn() quay lại.', 'hold_on(5) chờ nhiều nhất năm nhịp, vật tới thì thôi chờ.']
    })
  ];

  ManHoc.manDoiChiaHang = DS;
  if (laNode) module.exports = ManHoc;
})();

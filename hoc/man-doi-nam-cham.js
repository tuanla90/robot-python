/* ============================================================================
   man-doi-nam-cham.js — "Robot Chấn Hưng": GÓI ĐỘI NAM CHÂM VÀ MÀU (20 màn, gói đội ngay sau gói Nam châm). Kế hoạch: hoc/KE-HOACH-PHOI-HOP.md (§3, §3b, §4, §8).
   Hai robot khác tay: R1 là xe hai bánh gắn NAM CHÂM + cảm biến từ (front_clear, front_metal, front_pole): hút sắt 2 ô, vật nam châm 3 ô, lực hút đi
   qua hàng rào và hố, nhưng bó tay với GỖ; R2 là xe hai bánh gắn TAY KẸP + CAMERA (color() đọc ô trước mặt) + cảm biến khoảng cách: gắp được mọi vật
   kể cả gỗ, phân loại theo màu, nhưng không với qua rào / hố. Kỹ năng phối hợp của gói là K7, ĐƯỜNG LUI: R2 chờ R1 có giới hạn
   (for + if front_clear()), quá hạn thì tự đi lấy (fetch_back); R1 hỏi cảm biến từ trước, gặp gỗ thì nhường đường ngay.

   Chương doi-nam-cham (lời giải chuẩn; [khóa] = robot tự động, chương trình chỉ đọc):
     1  Hai làn, hai tay        R2 đã có sort_color(); em viết R1 kéo vật nam châm bằng grip() rồi rẽ trái thả vào đích
     2  Nam châm tự động        [R1 khóa] kéo vật chữ N qua hố, quay đầu thả trước mũi R2; em viết R2 chờ bằng cảm biến rồi phân loại vào hốc đích
     3  Kéo qua rào             R1 lane(): kéo vật sắt qua hàng rào, thả trước mũi R2; R2 đã có chương trình chờ + phân loại vào hốc đích
     4  Gỗ thì tự lấy           [R1 khóa] thấy sắt / nam châm thì giao, gặp gỗ thì tránh; em viết R2 chờ tối đa 3 nhịp, hết hạn thì fetch_back()
     5  Dọn gỗ cho nam châm     R2 gắp khúc gỗ chắn lực hút rồi phân loại; R1 chờ tới khi front_pole() thấy vật sau rào, kéo về thả vào đích
     6  Hai chuyến tự động      [R1 khóa] hai chuyến dài ngắn khác nhau (dò bằng front_metal); R2 lặp chờ bằng cảm biến (đếm nhịp thì mất sao)
     7  Chờ quá ngắn            sửa R2: giới hạn chờ 2 nhịp ngắn hơn lúc R1 giao (nhịp 3), camera nhìn sớm nên vật đỏ vào nhầm đích
     8  Bó tay cho sớm          [R2 khóa: chờ 3 nhịp, đường lui, pass_back] sửa R1: hỏi cảm biến từ trước, gặp gỗ thì tránh ngay sang phải
     9  Ba trạm                 ba vật sắt sau ba rào, đích trong hốc; cả hai lặp, dịch trạm bằng step(0, 2) (viết thẳng tràn khung)
     10 Ca nam châm             trùm ba sân, mỗi sân hai vật (sắt + nam châm N sau rào / sắt rồi gỗ / gỗ rồi sắt); cả hai lặp hai lượt:
                                R1 hỏi cảm biến từ, giao rồi quay lại hay tránh; R2 chờ có hạn + đường lui + sort_color
   Chương che-doi-nam-cham (hàm cốt truyện mới, khóa trong kho: hold_on(n) = for i in range(n): if front_clear(): wait();
   hand_off() = grip(), u_turn(), magnet_off(), wait(); plan_b() = if front_clear(): fetch_back()):
     1  Hàm chờ có hạn          tạo hold_on(n); R2 chờ hai lần: lần đầu có hàng, lần sau R1 gặp gỗ nên R2 hết hạn tự đi lấy
     2  Hàm bàn giao            tạo hand_off(); R1 kéo hai vật qua hố (sắt rồi vật chữ N), R2 hold_on + sort_color
     3  Phương án B             [R1 khóa] tạo plan_b(); R2 lặp hold_on(3), plan_b(), sort_color(): lượt đầu có hàng, lượt sau tự lấy gỗ
     4  Ba trạm có hạn          trạm sắt / gỗ / nam châm; R1 lặp if + hand_off + dodge_right, R2 lặp hold_on + plan_b + pass_back + dodge_right
     5  Ba màu một hàng         ba vật một hàng (sắt đỏ, sắt xanh lá, nam châm xanh dương); R1 lặp hand_off, R2 lặp hold_on + phân loại ba hướng
     6  Giao cho kịp            [R2 khóa] gọi hold_on(3); em viết R1 giao trong 3 nhịp (lệnh nam châm chung nhịp với lệnh quay) rồi tránh lối
     7  Sửa thứ tự giao         [R2 khóa] sửa hàm của màn lane_left(): thả trước khi quay nên vật vướng rào
     8  Sửa hàm dò cực          [R1 khóa] sửa hàm của màn scan_wait(n) viết ngược điều kiện; em viết R2 dọn khúc gỗ
     9  Hốc nhường đường        [R2 khóa] cờ riêng doi[i].co: hai robot đổi chỗ; sửa tuck_in() quên gắp gỗ trong hốc; em viết R1 hút sắt chắn lối, chờ rồi đi
     10 Ca đêm nam châm         trùm ba sân, mỗi sân hai vật: sắt + gỗ / hai vật nam châm sau rào / gỗ chắn đầu; cả đội dùng hold_on, hand_off, plan_b

   Cần cả đội: vật R1 kéo nằm sau rào / hố (R2 không với tới), đích nằm trong hốc chỉ R2 với tới hay R1 không mang được gỗ (tools/do-mot-robot.mjs).
   Một sân ở màn 1–9 nên chương trình biết trước sân vẫn có thể bỏ bước chờ có hạn (vd chờ cứng đúng số nhịp): trùm ba sân và các màn lặp
   (doi 6, 9, 10; che 1, 3) mới buộc chờ bằng cảm biến có giới hạn. Lời sai tiêu biểu từng màn: hoc/kiem-doi-nam-cham.mjs.
   Tệp chỉ khai báo chương (ManHoc.chuongThem); lo-trinh-hoc.js chèn hai chương ngay sau che-nam-cham. Khung dữ liệu nhiều robot: man.doi = [R1, R2].
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-nam-cham';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {
    'doi-nam-cham.1': { o: 34, nhip: 4 },
    'doi-nam-cham.2': { o: 37, nhip: 7 },
    'doi-nam-cham.3': { o: 38, nhip: 7 },
    'doi-nam-cham.4': { o: 50, nhip: 15 },
    'doi-nam-cham.5': { o: 41, nhip: 5 },
    'doi-nam-cham.6': { o: 56, nhip: 18 },
    'doi-nam-cham.7': { o: 38, nhip: 7 },
    'doi-nam-cham.8': { o: 47, nhip: 15 },
    'doi-nam-cham.9': { o: 47, nhip: 27 },
    'doi-nam-cham.10': { o: 63, nhip: 73 },
    'che-doi-nam-cham.1': { o: 60, nhip: 28 },
    'che-doi-nam-cham.2': { o: 45, nhip: 13 },
    'che-doi-nam-cham.3': { o: 63, nhip: 28 },
    'che-doi-nam-cham.4': { o: 62, nhip: 38 },
    'che-doi-nam-cham.5': { o: 52, nhip: 19 },
    'che-doi-nam-cham.6': { o: 54, nhip: 26 },
    'che-doi-nam-cham.7': { o: 45, nhip: 13 },
    'che-doi-nam-cham.8': { o: 47, nhip: 6 },
    'che-doi-nam-cham.9': { o: 35, nhip: 16 },
    'che-doi-nam-cham.10': { o: 73, nhip: 73 }
  };
  // @sao-cuoi

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var NC = ['magnet_n', 'magnet_s', 'magnet_off'];
  var XE_NC = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'nam-cham', camBien: [{ ma: 'khoang-cach', o: 'hong' }] }, hamGoc: BANH.concat(NC, ['front_clear', 'front_metal', 'front_pole']) };
  var XE_MAU = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'camera', o: 'tren' }, { ma: 'khoang-cach', o: 'hong' }] }, hamGoc: BANH.concat(TAY, ['front_clear', 'left_clear', 'right_clear', 'color']) };

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  /** Bài làm hai robot: R1 nam châm, R2 màu. */
  function B(c1, c2, hamMan) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: (hamMan || []).map(sao) }; }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function LAP(n, lenh) { return ['for i in range(' + n + '):'].concat(lenh.map(function (s) { return '    ' + s; })); }
  var CHO_HANG = ['while front_clear():', '    wait()'];
  // R1 tự động: thấy sắt / vật nam châm thì kéo về, quay đầu, thả trước mũi đồng đội; gặp gỗ thì rẽ trái nhường đường
  var R1_TU_DONG = ['if front_metal() or front_pole() != "none":', '    grip()', '    u_turn()', '    magnet_off()', '    wait()', 'else:', '    turn_left()', '    move()'];
  // R2 tự động: chờ nhiều nhất 3 nhịp; trước mũi vẫn trống thì tự đi lấy (fetch_back); rồi phân loại theo màu
  // doi 8: R2 tự động chờ 3 nhịp, tự đi lấy nếu cần, rồi chuyền vật ra sau lưng
  var R2_CHUYEN = LAP(3, ['if front_clear():', '    wait()']).concat(['if front_clear():', '    fetch_back()', 'pass_back()']);
  var R2_TU_DONG = LAP(3, ['if front_clear():', '    wait()']).concat(['if front_clear():', '    fetch_back()', 'sort_color()']);
  // hàm chế của chương che-doi-nam-cham
  var T_HOLD_ON = ['for i in range(n):', '    if front_clear():', '        wait()'];
  var T_HAND_OFF = ['grip()', 'u_turn()', 'magnet_off()', 'wait()'];
  var T_PLAN_B = ['if front_clear():', '    fetch_back()'];
  function hHoldOn(than) { return H('hold_on', ['n'], than || T_HOLD_ON); }
  function hHandOff(than) { return H('hand_off', [], than || T_HAND_OFF); }
  function hPlanB(than) { return H('plan_b', [], than || T_PLAN_B); }
  // R1 giao bằng hand_off(); R2 nhận bằng hold_on(3) + plan_b()
  var R1_GIAO = ['if front_metal() or front_pole() != "none":', '    hand_off()', '    u_turn()', 'else:', '    turn_left()', '    move()'];
  var R2_NHAN = ['hold_on(3)', 'plan_b()'];
  var BA_HUONG = ['if color() == "green":', '    pass_back()', 'else:', '    sort_color()'];    // xanh lá ra sau lưng, đỏ sang phải, còn lại sang trái
  var R2_BA_MAU = R2_NHAN.concat(BA_HUONG);
  /** Lời giải có hàm của em mới. */
  function BM(bai, dsHam) { bai.hamCuaEmMoi = dsHam; return bai; }

  /** m.bd: [batDau R1, batDau R2]; m.khoa: chỉ số robot tự động khóa (doi[i].coDinh); m.co: [cờ riêng R1, cờ riêng R2] (mục tiêu toi-co). */
  function man(m) {
    var bd = m.bd, khoa = m.khoa, co = m.co;
    delete m.bd; delete m.khoa; delete m.co;
    m.chuong = m.chuong || CHUONG;
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'dua-vat';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    m.doi = [Object.assign({ batDau: bd[0] }, sao(XE_NC)), Object.assign({ batDau: bd[1] }, sao(XE_MAU))];
    if (khoa !== undefined) m.doi[khoa].coDinh = true;
    if (co) { m.doi[0].co = co[0]; m.doi[1].co = co[1]; }
    m.batDau = bd[0]; m.loaiRobot = XE_NC.loaiRobot; m.robot = sao(XE_NC.robot); m.hamGoc = XE_NC.hamGoc.slice();
    m.taoHam = m.taoHam || []; m.loiSai = [];
    m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    m.sao = SAO[m.chuong + '.' + m.so] || { o: 1, nhip: 1 };
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    man({
      so: 1, ten: 'Hai làn, hai tay',
      deBai: 'Hai robot ở hai làn riêng. Robot màu (R2) đã có chương trình: nhìn màu hộp rồi đặt hộp đỏ sang phải. Viết chương trình cho robot nam châm (R1): kéo vật nam châm về rồi thả vào ô đích phía trên.',
      veMaMau: 'Chạy thử: R2 làm xong phần của nó, R1 đứng yên. Viết chương trình R1.',
      san: ['#######', '#D....#', '#...o.#', '#######', '#.o...#', '#D....#', '#######'],
      vatChat: ['.......', '.......', '....S..', '.......', '.......', '.......', '.......'],
      vatMau: ['.......', '.......', '.......', '.......', '..r....', '.......', '.......'],
      mau: ['.......', '.......', '.......', '.......', '.......', '.r.....', '.......'],
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 1, y: 4, huong: 1 }],
      maMau: B([], ['sort_color()']), loiGiai: B(['grip()', 'turn_left()', 'magnet_off()', 'wait()'], ['sort_color()']),
      hamCuaEmCan: ['grip', 'turn_left', 'sort_color'],
      goiY: ['Vật nam châm cách R1 đúng 3 ô: grip() bật cực khác chữ trên vật để kéo nó về.', 'Kéo xong, R1 rẽ trái là mũi xe quay vào ô đích, rồi mới ngắt điện.']
    }),
    man({
      so: 2, ten: 'Nam châm tự động', khoa: 0,
      deBai: 'R1 là robot tự động, chương trình đã khóa: nó kéo vật nam châm bên kia cái hố về (grip), quay đầu rồi thả trước mũi R2. Hai ô đích nằm trong hốc hai bên R2, chỉ R2 với tới. Viết R2: chờ tới khi vật nằm trước mũi, rồi đặt vật vào đích đúng màu.',
      veMaMau: 'Chạy thử: R2 gắp hụt vì vật chưa tới. Đọc chương trình R1 rồi thêm vòng chờ cho R2.',
      san: ['#######', '###o###', '###u###', '###.###', '###.###', '##D.D##', '#######'],
      vatChat: ['.......', '...N...', '.......', '.......', '.......', '.......', '.......'],
      mau: ['.......', '.......', '.......', '.......', '.......', '..b.r..', '.......'],
      bd: [{ x: 3, y: 3, huong: 0 }, { x: 3, y: 5, huong: 0 }],
      maMau: B(['grip()', 'u_turn()', 'magnet_off()', 'wait()'], ['sort_color()']), loiGiai: B(['grip()', 'u_turn()', 'magnet_off()', 'wait()'], CHO_HANG.concat(['sort_color()'])),
      hamCuaEmCan: ['grip', 'u_turn', 'sort_color'],
      goiY: ['Vật nằm trước mũi R2 thì front_clear() trả False.', 'while front_clear(): wait() đặt trước sort_color().']
    }),
    man({
      so: 3, ten: 'Kéo qua rào',
      deBai: 'Vật sắt nằm sau hàng rào thấp: robot màu không với tới, nhưng lực hút của nam châm đi qua rào. Hai ô đích nằm trong hốc trên và dưới R2, chỉ R2 với tới. R1 kéo vật về rồi đặt ngay trước mũi R2. R2 đã có chương trình chờ hàng rồi phân loại theo màu.',
      veMaMau: 'Chạy thử: R1 kéo được vật nhưng giữ mãi. Viết tiếp R1 để thả vật trước mũi R2.',
      san: ['######', '##o###', '##=#D#', '#....#', '####D#', '######'],
      vatChat: ['......', '..s...', '......', '......', '......', '......'],
      vatMau: ['......', '..b...', '......', '......', '......', '......'],
      mau: ['......', '......', '....r.', '......', '....b.', '......'],
      bd: [{ x: 2, y: 3, huong: 0 }, { x: 4, y: 3, huong: 3 }],
      maMau: B(['magnet_n()', 'wait()'], CHO_HANG.concat(['sort_color()'])), loiGiai: B(['lane()'], CHO_HANG.concat(['sort_color()'])),
      hamCuaEmCan: ['lane', 'sort_color'],
      goiY: ['Ô trước mũi R2 nằm ngay bên phải R1.', 'lane() kéo vật về, rẽ phải, thả, rồi quay lại.']
    }),
    man({
      so: 4, ten: 'Gỗ thì tự lấy', khoa: 0,
      deBai: 'R1 tự động: thấy sắt hay vật nam châm thì kéo về đặt trước mũi R2, gặp vật gỗ thì chịu, rẽ sang bên nhường đường. Lần này là vật gỗ. Viết R2: chờ R1 nhiều nhất 3 nhịp; hết 3 nhịp mà trước mũi vẫn trống thì tự đi lấy vật (fetch_back), rồi đặt vào đích đúng màu.',
      veMaMau: 'Chạy thử: R2 chờ mãi một vật không bao giờ tới. Đổi vòng chờ thành chờ có giới hạn và thêm đường lui.',
      san: ['#####', '##o##', '#...#', '#...#', '#D.D#', '#####'],
      vatChat: ['.....', '..g..', '.....', '.....', '.....', '.....'],
      vatMau: ['.....', '..b..', '.....', '.....', '.....', '.....'],
      mau: ['.....', '.....', '.....', '.....', '.b.r.', '.....'],
      bd: [{ x: 2, y: 2, huong: 0 }, { x: 2, y: 4, huong: 0 }],
      maMau: B(R1_TU_DONG, CHO_HANG.concat(['sort_color()'])),
      loiGiai: B(R1_TU_DONG,
        LAP(3, ['if front_clear():', '    wait()']).concat(['if front_clear():', '    fetch_back()', 'sort_color()'])),
      hamCuaEmCan: ['grip', 'u_turn', 'turn_left', 'move', 'fetch_back', 'sort_color'],
      goiY: ['for i in range(3): if front_clear(): wait() — vật tới sớm thì các vòng sau không chờ nữa.', 'Sau vòng chờ, hỏi lại front_clear(): còn trống thì fetch_back().']
    }),
    man({
      so: 5, ten: 'Dọn gỗ cho nam châm',
      deBai: 'Vật nam châm nằm sau hàng rào, nhưng một khúc gỗ chắn ngay trước mũi R1: gỗ chắn cả lực hút. R2 gắp khúc gỗ, nhìn màu rồi đặt vào đích cùng màu. R1 chờ tới khi front_pole() thấy vật nam châm, rồi kéo nó về và thả vào ô đích sau lưng.',
      veMaMau: 'Chạy thử: R1 bật nam châm ngay nên chỉ gặp gỗ. Viết R2 dọn gỗ, và cho R1 chờ bằng cảm biến từ.',
      san: ['#######', '###o###', '###=###', '#..o..#', '#.D...#', '###D###', '#######'],
      vatChat: ['.......', '...S...', '.......', '...g...', '.......', '.......', '.......'],
      vatMau: ['.......', '.......', '.......', '...r...', '.......', '.......', '.......'],
      mau: ['.......', '.......', '.......', '.......', '..r....', '.......', '.......'],
      bd: [{ x: 3, y: 4, huong: 0 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['grip()', 'u_turn()', 'magnet_off()', 'wait()'], []),
      loiGiai: B(['while front_pole() == "none":', '    wait()', 'grip()', 'u_turn()', 'magnet_off()', 'wait()'], ['move()', 'sort_color()']),
      hamCuaEmCan: ['grip', 'u_turn', 'move', 'sort_color'],
      goiY: ['Lúc gỗ còn đó, vật đầu tiên trước mũi R1 là gỗ nên front_pole() trả "none".', 'R2 tiến một ô là đứng cạnh khúc gỗ; sort_color() nhìn màu, gắp, rồi đặt sang bên.']
    }),
    man({
      so: 6, ten: 'Hai chuyến tự động', khoa: 0,
      deBai: 'R1 tự động chở hai vật sắt: kéo vật gần về, thả trước mũi R2, rồi dùng cảm biến từ tiến tới vật xa, kéo về và thả lần nữa. Hai vật tới lúc sớm lúc muộn. Viết R2: mỗi lần chờ vật bằng cảm biến rồi đặt vào đích đúng màu.',
      veMaMau: 'Chạy thử: R2 gắp hụt. Đếm nhịp từng chuyến thì dài dòng: dùng vòng lặp và chờ bằng cảm biến.',
      san: ['#########', '#####D.D#', '######.##', '#o..o..##', '#########'],
      vatChat: ['.........', '.........', '.........', '.s..s....', '.........'],
      vatMau: ['.........', '.........', '.........', '.b..r....', '.........'],
      mau: ['.........', '.....r.b.', '.........', '.........', '.........'],
      bd: [{ x: 6, y: 3, huong: 3 }, { x: 6, y: 1, huong: 2 }],
      maMau: B(['lane()', 'while not front_metal():', '    move()', 'magnet_n()', 'wait()', 'u_turn()', 'go_wall()', 'turn_left()', 'magnet_off()', 'wait()'], ['sort_color()']),
      loiGiai: B(['lane()', 'while not front_metal():', '    move()', 'magnet_n()', 'wait()', 'u_turn()', 'go_wall()', 'turn_left()', 'magnet_off()', 'wait()'],
        LAP(2, CHO_HANG.concat(['sort_color()']))),
      hamCuaEmCan: ['lane', 'go_wall', 'u_turn', 'turn_left', 'sort_color'],
      goiY: ['Mỗi chuyến giống nhau: chờ tới khi trước mũi có vật, rồi sort_color().', 'for i in range(2): bọc vòng chờ và sort_color().']
    }),
    man({
      so: 7, ten: 'Chờ quá ngắn',
      deBai: 'R1 kéo vật sắt về rồi quay đầu thả trước mũi R2, mất 3 nhịp. R2 được dặn chờ nhiều nhất 2 nhịp rồi nhìn màu: hết giờ chờ quá sớm nên camera chưa thấy gì, vật đỏ bị đặt nhầm sang đích xanh. Sửa chương trình R2 cho giới hạn chờ đủ dài.',
      veMaMau: 'Chương trình R1 đã đúng. Chạy thử từng nhịp, xem R1 thả vật ở nhịp nào rồi sửa R2.',
      san: ['########', '##D#####', '#.....o#', '##D#####', '########'],
      vatChat: ['........', '........', '......s.', '........', '........'],
      vatMau: ['........', '........', '......r.', '........', '........'],
      mau: ['........', '..b.....', '........', '..r.....', '........'],
      bd: [{ x: 4, y: 2, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      maMau: B(T_HAND_OFF, LAP(2, ['if front_clear():', '    wait()']).concat(['sort_color()'])),
      loiGiai: B(T_HAND_OFF, LAP(3, ['if front_clear():', '    wait()']).concat(['sort_color()'])),
      hamCuaEmCan: ['grip', 'u_turn', 'sort_color'],
      goiY: ['Giới hạn chờ phải dài hơn thời gian đồng đội cần để giao hàng.', 'R1 thả vật ở nhịp thứ 3, nên R2 phải chờ được ít nhất 3 nhịp.']
    }),
    man({
      so: 8, ten: 'Bó tay cho sớm', khoa: 1,
      deBai: 'R2 tự động, chương trình đã khóa: chờ R1 nhiều nhất 3 nhịp rồi tự đi lấy vật và chuyền ra sau lưng vào đích. Vật lần này là gỗ. R1 cứ bật nam châm thử rồi mới tránh đường, nên R2 lao lên đúng lúc R1 còn đứng giữa lối. Sửa R1: hỏi cảm biến từ trước, gặp gỗ thì tránh ngay (bên phải R1 là tường).',
      veMaMau: 'Chạy thử: R1 tránh đường quá muộn. Đọc chương trình R2 rồi sửa R1.',
      san: ['#####', '##D##', '##.##', '##.##', '#..##', '##o##', '#####'],
      vatChat: ['.....', '.....', '.....', '.....', '.....', '..g..', '.....'],
      bd: [{ x: 2, y: 4, huong: 2 }, { x: 2, y: 2, huong: 2 }],
      maMau: B(['grip()', 'u_turn()', 'magnet_off()', 'wait()', 'turn_left()', 'move()'], R2_CHUYEN),
      loiGiai: B(R1_TU_DONG.slice(0, 6).concat(['    turn_right()', '    move()']), R2_CHUYEN),
      hamCuaEmCan: ['grip', 'u_turn', 'turn_right', 'move', 'fetch_back', 'pass_back'],
      goiY: ['Gỗ không bị hút: front_metal() là False, front_pole() là "none".', 'Đặt phần kéo vật vào if; else: rẽ phải (xe đang quay mặt xuống) rồi tiến một ô cho R2 đi qua.']
    }),
    man({
      so: 9, ten: 'Ba trạm',
      deBai: 'Ba vật sắt nằm sau ba hàng rào, ba ô đích nằm trong ba hốc dưới đáy. Ở mỗi trạm, R1 kéo vật qua rào, quay đầu thả vào ô giữa; R2 chờ vật rồi chuyền nó ra sau lưng vào hốc đích. Xong một trạm thì cả hai cùng dịch sang phải hai ô (step(0, 2)). Viết thẳng ba trạm thì tràn khung: dùng vòng lặp.',
      veMaMau: 'Chương trình có sẵn làm xong trạm đầu. Bọc lại bằng vòng lặp cho cả ba trạm.',
      san: ['########', '#o#o#o##', '#=#=#=##', '#.....##', '#.....##', '#.....##', '#D#D#D##', '########'],
      vatChat: ['........', '.s.s.s..', '........', '........', '........', '........', '........', '........'],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      maMau: B(['grip()', 'u_turn()', 'magnet_off()', 'wait()', 'u_turn()', 'step(0, 2)'], CHO_HANG.concat(['pass_back()', 'step(0, 2)'])),
      loiGiai: B(LAP(3, ['grip()', 'u_turn()', 'magnet_off()', 'wait()', 'u_turn()', 'step(0, 2)']), LAP(3, CHO_HANG.concat(['pass_back()', 'step(0, 2)']))),
      hamCuaEmCan: ['grip', 'u_turn', 'step', 'pass_back'],
      goiY: ['Mỗi trạm giống hệt nhau, chỉ dịch sang phải hai ô: step(0, 2) giữ nguyên hướng mặt.', 'for i in range(3): bọc chương trình của từng robot.']
    }),
    man({
      so: 10, ten: 'Ca nam châm',
      deBai: 'Ba sân, mỗi sân hai vật xếp hàng trước mũi R1: sân này sắt rồi vật nam châm chữ N sau hàng rào (chỉ R1 kéo được), sân kia sắt rồi gỗ, sân nọ gỗ chắn ngay đầu rồi mới tới sắt. Cả hai lặp hai lượt. R1: kéo được thì kéo về thả trước mũi R2 rồi quay lại, không thì tránh sang trái. R2: chờ R1 có giới hạn, hết giờ mà chưa có hàng thì tự đi lấy, rồi đặt vật vào đích đúng màu.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: [
        ['#####', '##o##', '##o##', '##=##', '#...#', '#...#', '#D.D#', '#####'],
        ['#####', '#####', '##o##', '##o##', '#...#', '#...#', '#D.D#', '#####'],
        ['#####', '#####', '##o##', '##o##', '#...#', '#...#', '#D.D#', '#####']
      ],
      vatChat: [
        ['.....', '..N..', '..s..', '.....', '.....', '.....', '.....', '.....'],
        ['.....', '.....', '..g..', '..s..', '.....', '.....', '.....', '.....'],
        ['.....', '.....', '..s..', '..g..', '.....', '.....', '.....', '.....']
      ],
      vatMau: [
        ['.....', '.....', '..b..', '.....', '.....', '.....', '.....', '.....'],
        ['.....', '.....', '..g..', '..r..', '.....', '.....', '.....', '.....'],
        ['.....', '.....', '..r..', '..b..', '.....', '.....', '.....', '.....']
      ],
      mau: [
        ['.....', '.....', '.....', '.....', '.....', '.....', '.b.r.', '.....'],
        ['.....', '.....', '.....', '.....', '.....', '.....', '.g.r.', '.....'],
        ['.....', '.....', '.....', '.....', '.....', '.....', '.b.r.', '.....']
      ],
      bd: [[{ x: 2, y: 4, huong: 0 }, { x: 2, y: 4, huong: 0 }, { x: 2, y: 4, huong: 0 }], [{ x: 2, y: 6, huong: 0 }, { x: 2, y: 6, huong: 0 }, { x: 2, y: 6, huong: 0 }]],
      maMau: B([], []),
      loiGiai: B(LAP(2, R1_TU_DONG.slice(0, 5).concat(['    u_turn()'], R1_TU_DONG.slice(5))), LAP(2, R2_TU_DONG)),
      hamCuaEmCan: ['grip', 'u_turn', 'turn_left', 'move', 'fetch_back', 'sort_color'],
      goiY: ['R1: for i in range(2): if front_metal() or front_pole() != "none": kéo, giao, u_turn() quay lại; else: tránh sang trái.', 'R2: for i in range(2): chờ tối đa 3 nhịp bằng for và if; còn trống thì fetch_back(); rồi sort_color().'],
      huyHieu: { ma: CHUONG, ten: 'Huy hiệu Đội nam châm và màu' }
    }),

    /* ================================ chương 2: che-doi-nam-cham ================================ */
    man({
      so: 1, chuong: 'che-' + CHUONG, ten: 'Hàm chờ có hạn', taoHam: ['hold_on'],
      deBai: 'Tạo hàm hold_on(n): chờ nhiều nhất n nhịp, trước mũi có vật thì thôi chờ ngay (for i in range(n): if front_clear(): wait()). R2 chờ hai lần: lần đầu R1 đưa vật sắt tới, lần sau R1 gặp gỗ nên tránh đường, R2 hết giờ chờ thì tự đi lấy.',
      veMaMau: 'Chạy thử: lần chờ thứ hai của R2 kéo dài mãi. Tạo hàm hold_on(n) trong Xưởng rồi thay hai vòng while bằng hold_on(5).',
      san: ['#####', '##o##', '##o##', '#...#', '#...#', '#D.D#', '#####'],
      vatChat: ['.....', '..g..', '..s..', '.....', '.....', '.....', '.....'],
      vatMau: ['.....', '..b..', '..r..', '.....', '.....', '.....', '.....'],
      mau: ['.....', '.....', '.....', '.....', '.....', '.b.r.', '.....'],
      bd: [{ x: 2, y: 3, huong: 0 }, { x: 2, y: 5, huong: 0 }],
      maMau: B(['grip()', 'u_turn()', 'magnet_off()', 'wait()', 'turn_right()', 'move()'], CHO_HANG.concat(['sort_color()'], CHO_HANG, ['fetch_back()', 'sort_color()'])),
      loiGiai: BM(B(['grip()', 'u_turn()', 'magnet_off()', 'wait()', 'turn_right()', 'move()'], ['hold_on(5)', 'sort_color()', 'hold_on(5)', 'fetch_back()', 'sort_color()']), [hHoldOn()]),
      hamCuaEmCan: ['grip', 'u_turn', 'turn_right', 'move', 'fetch_back', 'sort_color'],
      goiY: ['while front_clear() chờ mãi: lần thứ hai không có vật nào tới.', 'Trong vòng for, chỉ wait() khi front_clear() còn đúng: vật tới sớm thì các vòng còn lại trôi qua ngay.']
    }),
    man({
      so: 2, chuong: 'che-' + CHUONG, ten: 'Hàm bàn giao', taoHam: ['hand_off'],
      deBai: 'Hai vật nằm bên kia cái hố, chỉ lực hút của nam châm với qua được. Tạo hàm hand_off(): kéo vật trước mặt về bằng grip(), quay đầu rồi thả xuống ô sau lưng, đúng chỗ trước mũi R2. R1 gọi hand_off() hai lần; R2 đã có chương trình chờ và phân loại.',
      veMaMau: 'Chương trình có sẵn của R1 mới giao vật đầu. Gói bốn dòng đó thành hàm hand_off() rồi gọi nó cho cả hai vật.',
      san: ['########', '######D#', '#oou...#', '######D#', '########'],
      vatChat: ['........', '........', '.Ns.....', '........', '........'],
      vatMau: ['........', '........', '..b.....', '........', '........'],
      mau: ['........', '......r.', '........', '......b.', '........'],
      bd: [{ x: 4, y: 2, huong: 3 }, { x: 6, y: 2, huong: 3 }],
      maMau: B(T_HAND_OFF, LAP(2, ['hold_on(4)', 'sort_color()'])),
      loiGiai: BM(B(['hand_off()', 'u_turn()', 'hand_off()'], LAP(2, ['hold_on(4)', 'sort_color()'])), [hHandOff()]),
      hamCuaEmCan: ['grip', 'u_turn', 'hold_on', 'sort_color'],
      goiY: ['Vật đầu là sắt, vật sau là nam châm chữ N: grip() tự chọn cực đúng cho cả hai.', 'grip(), u_turn(), magnet_off(), wait()']
    }),
    man({
      so: 3, chuong: 'che-' + CHUONG, ten: 'Phương án B', taoHam: ['plan_b'], khoa: 0,
      deBai: 'Tạo hàm plan_b(): trước mũi vẫn trống thì tự đi lấy vật (fetch_back). R1 tự động giao vật nam châm rồi tránh xuống dưới, vì sau đó chỉ còn khúc gỗ. R2 lặp hai lần: hold_on(3), plan_b(), sort_color(). Lần đầu plan_b() không phải làm gì; lần sau nó cứu cả đội.',
      veMaMau: 'Chạy thử: lượt sau R2 gắp hụt vì không có hàng. Tạo hàm plan_b() rồi gọi nó sau hold_on(3).',
      san: ['########', '######D#', '#o.o...#', '####.#D#', '########'],
      vatChat: ['........', '........', '.g.N....', '........', '........'],
      vatMau: ['........', '........', '.b......', '........', '........'],
      mau: ['........', '......r.', '........', '......b.', '........'],
      bd: [{ x: 4, y: 2, huong: 3 }, { x: 6, y: 2, huong: 3 }],
      maMau: B(['hand_off()', 'u_turn()', 'turn_left()', 'move()'], LAP(2, ['hold_on(3)', 'sort_color()'])),
      loiGiai: BM(B(['hand_off()', 'u_turn()', 'turn_left()', 'move()'], LAP(2, R2_NHAN.concat(['sort_color()']))), [hPlanB()]),
      hamCuaEmCan: ['hand_off', 'u_turn', 'turn_left', 'move', 'hold_on', 'fetch_back', 'sort_color'],
      goiY: ['Vật đã tới thì front_clear() là False: plan_b() không làm gì.', 'if front_clear(): fetch_back()']
    }),
    man({
      so: 4, chuong: 'che-' + CHUONG, ten: 'Ba trạm có hạn',
      deBai: 'Ba trạm: vật sắt sau rào, khúc gỗ không rào, vật nam châm sau rào. Ở mỗi trạm R1 hỏi cảm biến từ: kéo được thì hand_off() rồi quay lại; rồi dịch sang trạm kế. R2 ở mỗi trạm: hold_on(3), plan_b(), chuyền vật ra sau lưng vào đích, rồi dịch sang phải. Cả hai lặp ba lần.',
      veMaMau: 'Tự viết cả hai vòng lặp.',
      san: ['######', '#ooo##', '#=.=##', '#...##', '#...##', '#...##', '#DDD##', '######'],
      vatChat: ['......', '.sgS..', '......', '......', '......', '......', '......', '......'],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      maMau: B([], []),
      loiGiai: B(LAP(3, ['if front_metal() or front_pole() != "none":', '    hand_off()', '    u_turn()', 'dodge_right()']), LAP(3, R2_NHAN.concat(['pass_back()', 'dodge_right()']))),
      hamCuaEmCan: ['hand_off', 'u_turn', 'dodge_right', 'hold_on', 'plan_b', 'pass_back'],
      goiY: ['Trạm giữa là gỗ: R1 không kéo được, cứ dịch sang trạm kế; R2 hết giờ chờ thì plan_b().', 'R1: for i in range(3): if …: hand_off(); u_turn() rồi dodge_right() (ngoài if).']
    }),
    man({
      so: 5, chuong: 'che-' + CHUONG, ten: 'Ba màu một hàng',
      deBai: 'Ba vật xếp một hàng trước mũi R1: sắt đỏ, sắt xanh lá, rồi vật nam châm xanh dương ở xa nhất. R1 lặp ba lần: hand_off() rồi quay lại. R2 lặp ba lần: hold_on(3), rồi nhìn màu: xanh lá chuyền ra sau lưng (pass_back), màu khác thì sort_color().',
      veMaMau: 'Tự viết cả hai vòng lặp.',
      san: ['#####', '##o##', '##o##', '##o##', '#...#', '#...#', '#D.D#', '##D##', '#####'],
      vatChat: ['.....', '..S..', '..s..', '..s..', '.....', '.....', '.....', '.....', '.....'],
      vatMau: ['.....', '.....', '..g..', '..r..', '.....', '.....', '.....', '.....', '.....'],
      mau: ['.....', '.....', '.....', '.....', '.....', '.....', '.b.r.', '..g..', '.....'],
      bd: [{ x: 2, y: 4, huong: 0 }, { x: 2, y: 6, huong: 0 }],
      maMau: B([], []),
      loiGiai: B(LAP(3, ['hand_off()', 'u_turn()']), LAP(3, ['hold_on(3)'].concat(BA_HUONG))),
      hamCuaEmCan: ['hand_off', 'u_turn', 'hold_on', 'pass_back', 'sort_color'],
      goiY: ['Camera đọc màu vật trước mũi: color() == "green" thì pass_back().', 'Vật xa nhất là vật nam châm: grip() trong hand_off() vẫn kéo được nó từ 3 ô.']
    }),
    man({
      so: 6, chuong: 'che-' + CHUONG, ten: 'Giao cho kịp', khoa: 1,
      deBai: 'R2 tự động: mỗi lượt hold_on(3) rồi plan_b(). Vật sắt nằm bên trái R1, sau hàng rào; R1 phải đưa nó tới trước mũi R2 trong 3 nhịp, chậm một nhịp là R2 bỏ đi lấy hàng. Lượt sau là khúc gỗ phía trên: R1 phải tránh khỏi lối. Mẹo: lệnh nam châm đi chung nhịp với lệnh quay (magnet_n() rồi turn_left() là một nhịp).',
      veMaMau: 'Chạy thử: R1 giao chậm một nhịp nên R2 lao lên. Sửa R1 cho kịp giờ.',
      san: ['######', '###o##', '###.##', '#o=..#', '###.##', '##D.D#', '###.##', '######'],
      vatChat: ['......', '...g..', '......', '.s....', '......', '......', '......', '......'],
      vatMau: ['......', '...b..', '......', '.r....', '......', '......', '......', '......'],
      mau: ['......', '......', '......', '......', '......', '..b.r.', '......', '......'],
      bd: [{ x: 3, y: 3, huong: 0 }, { x: 3, y: 5, huong: 0 }],
      maMau: B(['turn_left()', 'magnet_n()', 'wait()', 'turn_left()', 'magnet_off()', 'wait()', 'turn_left()', 'move()'], LAP(2, R2_NHAN.concat(['sort_color()']))),
      loiGiai: B(['magnet_n()', 'turn_left()', 'turn_left()', 'magnet_off()', 'wait()', 'turn_left()', 'move()'], LAP(2, R2_NHAN.concat(['sort_color()']))),
      hamCuaEmCan: ['turn_left', 'move', 'hold_on', 'plan_b', 'sort_color'],
      goiY: ['magnet_n() chỉ ra lệnh; turn_left() ngay sau nó cho nhịp trôi: xe quay xong mới hút, cùng một nhịp.', 'magnet_n(), turn_left(), turn_left(), magnet_off(), wait() là đúng 3 nhịp.']
    }),
    man({
      so: 7, chuong: 'che-' + CHUONG, ten: 'Sửa thứ tự giao', khoa: 1,
      deBai: 'R1 gọi hàm của màn lane_left() hai lần để chuyền hai vật qua rào sang ô bên trái nó, ngay trước mũi R2. Nhưng hàm thả vật trước rồi mới quay, nên vật vướng hàng rào. R2 tự động chờ có hạn rồi phân loại. Sửa hàm lane_left.',
      veMaMau: 'Chương trình chính của R1 đã đúng. Mở hàm lane_left trong Xưởng và sửa thứ tự.',
      san: ['#######', '#oo=..#', '####.##', '###D.D#', '#######'],
      vatChat: ['.......', '.Ns....', '.......', '.......', '.......'],
      vatMau: ['.......', '..b....', '.......', '.......', '.......'],
      mau: ['.......', '.......', '.......', '...b.r.', '.......'],
      bd: [{ x: 4, y: 1, huong: 3 }, { x: 4, y: 3, huong: 0 }],
      maMau: B(LAP(2, ['lane_left()']), LAP(2, R2_NHAN.concat(['sort_color()'])), [H('lane_left', [], ['grip()', 'magnet_off()', 'wait()', 'turn_left()', 'turn_right()'])]),
      loiGiai: B(LAP(2, ['lane_left()']), LAP(2, R2_NHAN.concat(['sort_color()'])), [H('lane_left', [], ['grip()', 'turn_left()', 'magnet_off()', 'wait()', 'turn_right()'])]),
      hamCuaEmCan: ['grip', 'turn_left', 'turn_right', 'hold_on', 'plan_b', 'sort_color'],
      goiY: ['magnet_off() thả vật xuống ô ngay trước mũi: lúc đó mũi xe còn chĩa vào hàng rào.', 'Quay trái trước, rồi mới magnet_off() và wait().']
    }),
    man({
      so: 8, chuong: 'che-' + CHUONG, ten: 'Sửa hàm dò cực', khoa: 0,
      deBai: 'R1 tự động gọi hàm của màn scan_wait(6): chờ nhiều nhất 6 nhịp cho tới khi front_pole() thấy vật nam châm sau khúc gỗ, rồi hand_off(). Nhưng điều kiện trong hàm bị viết ngược nên R1 không chờ chút nào. Sửa hàm, rồi viết R2: tới gắp khúc gỗ và đặt vào đích màu vàng.',
      veMaMau: 'Chạy thử: R1 bật nam châm ngay vào khúc gỗ. Sửa scan_wait rồi viết chương trình R2.',
      san: ['########', '###..D##', '##o=o.D#', '########'],
      vatChat: ['........', '........', '..N.g...', '........'],
      vatMau: ['........', '........', '....y...', '........'],
      mau: ['........', '.....y..', '......r.', '........'],
      bd: [{ x: 5, y: 2, huong: 3 }, { x: 3, y: 1, huong: 1 }],
      maMau: B(['scan_wait(6)', 'hand_off()'], [], [H('scan_wait', ['n'], ['for i in range(n):', '    if front_pole() != "none":', '        wait()'])]),
      loiGiai: B(['scan_wait(6)', 'hand_off()'], ['move()', 'turn_right()', 'sort_color()'], [H('scan_wait', ['n'], ['for i in range(n):', '    if front_pole() == "none":', '        wait()'])]),
      hamCuaEmCan: ['hand_off', 'move', 'turn_right', 'sort_color'],
      goiY: ['Còn gỗ thì front_pole() là "none": lúc đó mới phải chờ.', 'R2: tiến một ô, rẽ phải là mũi xe chạm khúc gỗ; sort_color() đặt gỗ vàng sang bên.']
    }),
    man({
      so: 9, chuong: 'che-' + CHUONG, ten: 'Hốc nhường đường', khoa: 1, mucTieu: 'toi-co',
      co: [[{ x: 9, y: 2 }], [{ x: 1, y: 2 }]],
      deBai: 'Hai robot đổi chỗ: R1 về cờ bên phải, R2 về cờ bên trái, mỗi robot chỉ tính đúng cờ của mình. Lối đi rộng một ô, có một hốc chứa khúc gỗ. R2 tự động gọi tuck_in(): tới hốc, gắp gỗ rồi vào hốc nhường đường, nhưng tuck_in() quên gắp gỗ. Sửa tuck_in(), rồi viết R1: hút vật sắt chắn lối, đi tới khi bị chặn, chờ R2 vào hốc rồi đi tiếp.',
      veMaMau: 'Chạy thử: R2 đâm vào khúc gỗ. Sửa hàm tuck_in rồi viết chương trình R1.',
      san: ['###########', '#####o#####', '#F..o....F#', '###########'],
      vatChat: ['...........', '.....g.....', '....s......', '...........'],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 8, y: 2, huong: 3 }],
      maMau: B([], ['tuck_in()', 'for i in range(3):', '    wait()', 'back()', 'turn_left()', 'forward(4)'], [H('tuck_in', [], ['forward(3)', 'turn_right()', 'move()'])]),
      loiGiai: B(['magnet_n()', 'wait()', 'go_wall()', 'while not front_clear():', '    wait()', 'go_wall()'], ['tuck_in()', 'for i in range(3):', '    wait()', 'back()', 'turn_left()', 'forward(4)'], [H('tuck_in', [], ['forward(3)', 'turn_right()', 'pick()', 'move()'])]),
      hamCuaEmCan: ['forward', 'turn_right', 'turn_left', 'pick', 'move', 'back', 'go_wall'],
      goiY: ['Gỗ chiếm ô hốc: phải pick() trước khi move() vào hốc.', 'R1: go_wall() dừng sau lưng R2; while not front_clear(): wait(); rồi go_wall() lần nữa.']
    }),
    man({
      so: 10, chuong: 'che-' + CHUONG, ten: 'Ca đêm nam châm',
      deBai: 'Ba sân, mỗi sân hai vật xếp hàng trước mũi R1: sân này sắt rồi gỗ, sân kia hai vật nam châm sau rào, sân nọ gỗ chắn ngay đầu. R1 lặp hai lượt: kéo được thì hand_off(), không thì tránh xuống dưới. R2 lặp hai lượt: hold_on(3), plan_b(), rồi phân loại ba màu: đỏ lên trên, xanh dương xuống dưới, xanh lá ra sau lưng.',
      veMaMau: 'Tự viết cả hai chương trình, dùng các hàm đã chế.',
      san: [
        ['#########', '######D##', '##oo...D#', '####.#D##', '#########'],
        ['#########', '######D##', '#oo=...D#', '####.#D##', '#########'],
        ['#########', '######D##', '##oo...D#', '####.#D##', '#########']
      ],
      vatChat: [
        ['.........', '.........', '..gs.....', '.........', '.........'],
        ['.........', '.........', '.NS......', '.........', '.........'],
        ['.........', '.........', '..sg.....', '.........', '.........']
      ],
      vatMau: [
        ['.........', '.........', '..gr.....', '.........', '.........'],
        ['.........', '.........', '.........', '.........', '.........'],
        ['.........', '.........', '..bg.....', '.........', '.........']
      ],
      mau: [
        ['.........', '......r..', '.......g.', '......b..', '.........'],
        ['.........', '......r..', '.......g.', '......b..', '.........'],
        ['.........', '......r..', '.......g.', '......b..', '.........']
      ],
      bd: [[{ x: 4, y: 2, huong: 3 }, { x: 4, y: 2, huong: 3 }, { x: 4, y: 2, huong: 3 }], [{ x: 6, y: 2, huong: 3 }, { x: 6, y: 2, huong: 3 }, { x: 6, y: 2, huong: 3 }]],
      maMau: B([], []),
      loiGiai: B(LAP(2, R1_GIAO), LAP(2, R2_BA_MAU)),
      hamCuaEmCan: ['hand_off', 'u_turn', 'turn_left', 'move', 'hold_on', 'plan_b', 'pass_back', 'sort_color'],
      goiY: ['R1: if front_metal() or front_pole() != "none": hand_off(); u_turn() else: turn_left(); move()', 'R2: hold_on(3), plan_b(), rồi if color() == "green": pass_back() else: sort_color()'],
      huyHieu: { ma: 'che-' + CHUONG, ten: 'Huy hiệu Chế lệnh đội nam châm' }
    })
  ];

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'che-nam-cham', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội nam châm và màu' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội nam châm' }],
    goi: { ma: CHUONG, ten: 'Đội nam châm và màu', hinh: 'nam-cham' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

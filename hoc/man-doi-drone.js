/* ============================================================================
   man-doi-drone.js — "Đường học": GÓI ĐỘI DRONE VÀ MÁY NÉM (20 màn = hai chương doi-drone + che-doi-drone). Kế hoạch: hoc/KE-HOACH-PHOI-HOP.md (§3, §3b, §4, §8).
   Gói đứng ngay sau gói Flycam (chương flycam), trước Lắp ráp: Đủ bộ. Kỹ năng phối hợp mới: K9 PHÂN VAI TRÊN KHÔNG / MẶT ĐẤT, QUẢN LÝ PIN CẢ ĐỘI.
   Hai robot khác tầng (luật nhiều robot trong san-hoc.js: drone và xe dưới đất không chặn nhau):
     R1 XE HAI BÁNH gắn MÁY NÉM (aim / load / throw) và cảm biến khoảng cách ở hông: nạp hộp trước mũi, ném bay qua tường cao và hàng rào,
        nhưng không qua được hàng rào '=' và không vào được ô có vật nằm. Cảm biến của xe KHÔNG thấy drone (khác tầng), chỉ thấy vật, tường, rào.
     R2 DRONE gắn nam châm treo (hút hộp SẮT ở ô ngay dưới bụng; hộp gỗ thì không), camera nhìn xuống look() và (màn có pin) battery():
        bay qua rào, băng, vật và cả bay ngang qua đầu xe; không qua tường cao '#'. Không thả hộp được xuống ô xe đang đứng (tha-bi-chan).
        PIN: mỗi nhịp drone tốn 1 pin, kể cả khi đã hết chương trình mà còn lơ lửng chờ đồng đội; về 0 là cả trận dừng (het-pin).
        Đứng trên ô sạc P thì cuối nhịp pin đầy lại, nên drone chờ hay nghỉ thì đậu trên ô sạc.
   Ô đích thường nằm trong hốc tường cao: drone không bay vào được, chỉ hộp ném mới rơi vào; hộp sắt ở chỗ xe không tới thì chỉ drone lấy được. Vì thế cần cả đội.

   Chương 1 `doi-drone` (lời giải chuẩn; R1 = xe máy ném, R2 = drone):
     1  Hai tầng, hai làn       hai làn riêng: xe đã có launch(3); em viết drone chở hộp sắt qua rào và băng bằng ship(path)
     2  Hàng từ trên trời       XE TỰ ĐỘNG (khóa) chờ hộp trước mũi rồi ném; em viết drone lấy hộp sau rào, bay ngang qua đầu xe, thả trước mũi xe
     3  Nhấc hộp chắn lối       drone nhấc hộp sắt chắn trước mũi xe đem cất; xe chờ lối trống (while not front_clear()) rồi tiến và ném
     4  Gỗ cho xe, sắt cho drone  phân vai: xe ném hộp gỗ của mình trước, drone mang hộp sắt từ sau rào tới; xe chờ bằng cảm biến rồi ném nốt
     5  Ném sang, bay tiếp      xe ném hộp qua tường xuống ô sạc nơi drone đậu chờ (look()); drone chở tiếp theo đường có ô sạc (đường kia hết pin)
     6  Drone chạy theo pin     DRONE TỰ ĐỘNG (khóa): fly(path) ghé sạc khi pin thấp nên không đoán được lúc tới; em cho xe chờ bằng cảm biến
     7  Sửa vòng chờ của drone  ô hẹn màu vàng: while look() == "none" thoát ngay; sửa thành chờ khi còn thấy màu vàng
     8  Hộp chắn đường xe       drone thả hộp giữa lối xe đi nên xe kẹt sớm, ném trượt; sửa đường bay cho hộp nằm đúng chỗ xe sẽ chờ
     9  Ba hộp, ba chuyến       drone lặp airlift(4), xe lặp chờ + side_throw(2) + lùi chỗ chờ: viết thẳng thì xe tràn khung
     10 Ca trực ba sân          trùm: pin, đường bay và phía đích khác nhau; drone dò ô vàng, ghé sạc, thả rồi về đậu ô sạc; xe chờ và chọn phía bằng cảm biến

   Chương 2 `che-doi-drone` (chế lệnh phối hợp). Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-doi-drone.1 receive()           = while front_clear(): wait(), load(), wait()            xe: chờ có hộp trước mũi rồi nạp
     che-doi-drone.2 snatch()            = while look() == "none": wait(), magnet_n(), wait()     drone: chờ hộp rơi xuống dưới bụng rồi hút
     che-doi-drone.3 courier(path, back) = ship(path), walk(back)                                  drone: chở, thả, rồi về đậu ô sạc
   Hàm CỦA MÀN (không vào kho): 7 drop_off(path) thả trước khi bay (sửa thứ tự); 8 standby() chờ cứng ba nhịp (sửa thành snatch()).
     1  Xe nhận hàng            DRONE khóa thả hộp trước mũi xe; em chế receive() thay cho load() nạp hụt
     2  Drone đỡ hàng           XE khóa ném hộp xanh xuống chỗ drone đậu; em chế snatch() thay cho bật nam châm quá sớm
     3  Giao rồi về đậu         pin 6: thả xong lơ lửng thì hết pin lúc xe còn ném; em chế courier(path, back) về đậu ô sạc
     4  Đổi hàng hai chiều      xe ném hộp đỏ cho drone (snatch), drone chở hộp sắt về trước mũi xe (receive): hàm chế cho cả hai robot
     5  Drone tự động hai chuyến  DRONE khóa gọi courier() hai lần (pin 7 vừa đủ); em viết xe lặp receive() với tầm n = 2, 3
     6  Ba chuyến, ghé sạc      pin 10: courier lên dải ô sạc mới về được hộp kế; cả hai robot lặp, xe viết thẳng thì tràn khung
     7  Sửa hàm thả hàng        DRONE khóa gọi drop_off() của màn: magnet_off() đứng trước walk() nên hộp nằm lại chỗ cũ
     8  Chờ cứng ba nhịp        DRONE khóa gọi standby() của màn: chờ 3 nhịp mà xe cần 7; sửa thành chờ bằng camera
     9  Đổi chỗ hai tầng        cờ riêng doi[i].co: xe và drone đổi đầu lối hẹp, drone chở hộp chắn bay ngang qua đầu xe cất vào hốc
     10 Ca tiếp sức ba sân      trùm: hộp của xe, ô đích của drone, pin (8, 5, 4) đổi theo sân; xe go_wall + receive về đầu lối ném,
                                drone snatch() rồi dò ô vàng có ghé sạc

   Tệp chỉ khai báo (ManHoc.chuongThem); lo-trinh-hoc.js chèn hai chương ngay sau flycam. Ngưỡng sao: node tools/do-goi-doi.mjs hoc/man-doi-drone.js --ghi.
   Máy kiểm riêng: hoc/kiem-doi-drone.mjs (lời sai, lối tắt, ý từng màn).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-drone';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {
    'doi-drone.1': { o: 23, nhip: 8 },
    'doi-drone.2': { o: 25, nhip: 10 },
    'doi-drone.3': { o: 28, nhip: 10 },
    'doi-drone.4': { o: 31, nhip: 12 },
    'doi-drone.5': { o: 25, nhip: 9 },
    'doi-drone.6': { o: 30, nhip: 21 },
    'doi-drone.7': { o: 33, nhip: 11 },
    'doi-drone.8': { o: 43, nhip: 10 },
    'doi-drone.9': { o: 30, nhip: 30 },
    'doi-drone.10': { o: 28, nhip: 63 },
    'che-doi-drone.1': { o: 28, nhip: 9 },
    'che-doi-drone.2': { o: 25, nhip: 7 },
    'che-doi-drone.3': { o: 30, nhip: 7 },
    'che-doi-drone.4': { o: 40, nhip: 18 },
    'che-doi-drone.5': { o: 37, nhip: 17 },
    'che-doi-drone.6': { o: 39, nhip: 39 },
    'che-doi-drone.7': { o: 28, nhip: 8 },
    'che-doi-drone.8': { o: 34, nhip: 12 },
    'che-doi-drone.9': { o: 27, nhip: 10 },
    'che-doi-drone.10': { o: 36, nhip: 78 }
  };
  // @sao-cuoi

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var NC = ['magnet_n', 'magnet_s', 'magnet_off'];
  var XE = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'nem', camBien: [{ ma: 'khoang-cach', o: 'hong' }] }, hamGoc: BANH.concat(['aim', 'throw', 'load'], BA_HUONG) };
  /** Drone gắn nam châm treo + camera nhìn xuống; có pin thì thêm battery(). pin: số, hay mảng theo sân. */
  function drone(pin) {
    var coPin = pin !== undefined;
    var d = { loaiRobot: 'drone', robot: { than: 'drone', tay: 'nam-cham', camBien: [{ ma: 'camera-bay', o: 'bung' }].concat(coPin ? [{ ma: 'pin', o: 'than' }] : []) },
      hamGoc: BAY.concat(NC, ['look'], coPin ? ['battery'] : []) };
    if (coPin) d.pin = pin;
    return d;
  }

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  /** Bài làm hai robot: c1 của xe, c2 của drone. */
  function B(c1, c2, hamCuaMan) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: hamCuaMan || [] }; }
  var CHO_HANG = ['while front_clear():', '    wait()'];

  /** m.bd: [batDau xe, batDau drone]; m.pin: pin drone (không khai thì vô hạn); m.khoa: 0 | 1 robot tự động khóa; m.co: [cờ riêng xe, cờ riêng drone]. */
  function man(m) {
    var bd = m.bd, pin = m.pin, khoa = m.khoa, co = m.co;
    delete m.bd; delete m.pin; delete m.khoa; delete m.co;
    m.chuong = m.chuong || CHUONG;                                         // chương 2 của gói khai chuong: 'che-' + CHUONG
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.mucTieu = m.mucTieu || 'dua-vat';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    m.doi = [Object.assign({ batDau: bd[0] }, sao(XE)), Object.assign({ batDau: bd[1] }, drone(pin))];
    if (m.ro) { m.doi[0].roBanDau = true; delete m.ro; }
    if (khoa !== undefined) m.doi[khoa].coDinh = true;
    if (co) co.forEach(function (c, i) { if (c) m.doi[i].co = c; });
    // Cấp ngoài là của R1 để mã đọc màn một robot không vỡ.
    m.batDau = bd[0]; m.loaiRobot = XE.loaiRobot; m.robot = sao(XE.robot); m.hamGoc = XE.hamGoc.slice();
    m.taoHam = m.taoHam || []; m.loiSai = [];
    m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    m.sao = SAO[m.chuong + '.' + m.so] || { o: 1, nhip: 1 };
    return ManHoc.chuanHoa(m);
  }

  // màn 6: drone tự động — hút hộp, bay theo pin (fly ghé sạc khi pin thấp), thả rồi đậu ô sạc ngay trên
  var DRONE_6 = ['magnet_n()', 'wait()', 'fly("RRRRRRRR")', 'magnet_off()', 'go_up()'];
  // màn 10: drone dò tới ô vàng, ghé sạc dọc đường, hạ xuống ô giao, thả rồi bay lên đậu ô sạc
  var DRONE_10 = ['magnet_n()', 'wait()', 'while look() != "yellow":', '    go_right()', '    recharge()', 'go_down()', 'magnet_off()', 'go_up()', 'go_up()'];
  var XE_10 = CHO_HANG.concat(['load()', 'wait()', 'if left_clear():', '    turn_left()', 'else:', '    turn_right()', 'toss(3)']);

  /* ---- chương 2: ba hàm phối hợp em tự chế (tên cốt truyện, khóa trong kho) ---- */
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  var T_RECEIVE = CHO_HANG.concat(['load()', 'wait()']);                                  // xe: chờ có hộp trước mũi rồi nạp vào rổ
  var T_SNATCH = ['while look() == "none":', '    wait()', 'magnet_n()', 'wait()'];        // drone: chờ hộp rơi xuống ô dưới bụng rồi hút lên
  var T_COURIER = ['ship(path)', 'walk(back)'];                                           // drone: chở hộp dưới bụng theo path, thả, rồi bay theo back về chỗ đậu
  function hReceive(than) { return H('receive', [], than || T_RECEIVE); }
  function hSnatch(than) { return H('snatch', [], than || T_SNATCH); }
  function hCourier(than) { return H('courier', ['path', 'back'], than || T_COURIER); }
  // hàm CỦA MÀN (không vào kho): 7 drop_off(path) thả trước khi bay; 8 standby() chờ cứng ba nhịp
  var T_DROP_OFF_HONG = ['magnet_n()', 'wait()', 'magnet_off()', 'walk(path)'];
  var T_DROP_OFF = ['magnet_n()', 'wait()', 'walk(path)', 'magnet_off()', 'wait()'];
  var T_STANDBY_HONG = ['for i in range(3):', '    wait()', 'magnet_n()', 'wait()'];
  var T_STANDBY = ['snatch()'];
  var XE_C5 = ['n = 2', 'for i in range(2):', '    receive()', '    turn_right()', '    toss(n)', '    turn_left()', '    n = n + 1'];
  var DRONE_C5 = ['courier("DLRD", "UU")', 'courier("DRLD", "UU")'];
  var DRONE_C8 = ['standby()', 'walk("RRR")', 'magnet_off()', 'wait()'];
  var XE_C10 = ['go_wall()', 'receive()', 'u_turn()', 'go_wall()', 'turn_right()', 'toss(3)'];
  var DRONE_C10 = ['snatch()', 'while look() != "yellow":', '    go_right()', '    recharge()', 'magnet_off()', 'wait()'];
  function C2(m) { m.chuong = 'che-' + CHUONG; return man(m); }

  var DS = [
    man({
      so: 1, ten: 'Hai tầng, hai làn',
      deBai: 'Hai robot ở hai làn riêng. Xe máy ném đã có chương trình ném hộp gỗ qua tường vào đích. Làn trên có hàng rào và băng chuyền mà xe không đi qua được: viết chương trình cho drone bay tới hộp sắt, hút lên rồi chở vào ô đích.',
      veMaMau: 'Chạy thử: xe ném xong, drone đứng yên. Viết chương trình R2 (drone).',
      san: ['#########', '#..o=>=D#', '#########', '#.o#D...#', '#########'], vatChat: ['.........', '...s.....', '.........', '.........', '.........'],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1, huong: 0 }],
      maMau: B(['launch(3)'], []), loiGiai: B(['launch(3)'], ['ship("RRRRRR")']),
      hamCuaEmCan: ['launch', 'walk', 'go', 'ship'],
      goiY: ['Nam châm treo hút hộp sắt ở ô ngay dưới bụng. Bật rồi bay ngang qua hộp là hộp dính lên.', 'ship(path) bật nam châm, bay theo path rồi thả: ship("RRRRRR").']
    }),
    man({
      so: 2, ten: 'Hàng từ trên trời', khoa: 0,
      deBai: 'Xe máy ném là robot tự động: nó chờ tới khi có hộp trước mũi rồi ném qua tường vào đích. Hộp sắt nằm sau hàng rào, xe không tới được. Viết chương trình cho drone lấy hộp rồi thả xuống ngay trước mũi xe. Drone bay ngang qua đầu xe được.',
      veMaMau: 'Chương trình xe bị khóa, bấm vào thẻ R1 để đọc. Viết chương trình drone.',
      san: ['#########', '#######o#', '#######=#', '###D#...#', '#########'], vatChat: ['.........', '.......s.', '.........', '.........', '.........'],
      bd: [{ x: 6, y: 3, huong: 3 }, { x: 7, y: 3, huong: 0 }],
      maMau: B(CHO_HANG.concat(['launch(3)']), []), loiGiai: B(CHO_HANG.concat(['launch(3)']), ['ship("UUDDLL")']),
      hamCuaEmCan: ['launch', 'walk', 'go', 'ship'],
      goiY: ['Xe đứng dưới đất, drone bay trên cao nên drone bay qua đầu xe được, nhưng thả hộp thì phải thả xuống ô đất trống.', 'Ô trước mũi xe là ô bên trái xe: ship("UUDDLL").']
    }),
    man({
      so: 3, ten: 'Nhấc hộp chắn lối',
      deBai: 'Rổ của xe đã có một hộp, nhưng một hộp sắt chắn ngay trước mũi xe. Drone bay qua rào, nhấc hộp chắn đem thả vào ô đích bên dưới. Xe chờ tới khi lối trống, tiến sát tường rồi ném hộp của mình vào đích sau tường.',
      veMaMau: 'Chạy thử: xe kẹt ngay ô đầu nên ném hụt. Viết chương trình drone và thêm vòng chờ cho xe.',
      san: ['##########', '#.o....#D#', '##=#######', '##D.######', '##########'], vatChat: ['..........', '..s.......', '..........', '..........', '..........'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 3, huong: 0 }], ro: true,
      maMau: B(['go_wall()', 'toss(2)'], []),
      loiGiai: B(['while not front_clear():', '    wait()', 'go_wall()', 'toss(2)'], ['ship("LUUDD")']),
      hamCuaEmCan: ['go_wall', 'toss', 'walk', 'go', 'ship'],
      goiY: ['Lúc đầu trước mũi xe có hộp: chờ cho tới khi trước mặt TRỐNG.', 'while not front_clear(): wait() rồi go_wall() và toss(2).']
    }),
    man({
      so: 4, ten: 'Gỗ cho xe, sắt cho drone',
      deBai: 'Hai hộp, hai ô đích trong hốc tường. Hộp gỗ nằm sau lưng xe: nam châm không hút gỗ nên xe tự quay lại ném. Hộp sắt nằm sau hàng rào: chỉ drone lấy được, mang tới thả trước mũi xe. Xe ném hộp gỗ trước, quay về chờ hộp sắt rồi ném nốt.',
      veMaMau: 'Xe mới ném được hộp gỗ. Viết tiếp cho xe và viết chương trình drone.',
      san: ['##########', '#o=..#####', '####.#####', '##D#..o#D#', '##########'], vatChat: ['..........', '.s........', '..........', '..........', '..........'],
      bd: [{ x: 5, y: 3, huong: 3 }, { x: 4, y: 1, huong: 0 }],
      maMau: B(['u_turn()', 'launch(3)'], []),
      loiGiai: B(['u_turn()', 'launch(3)', 'u_turn()'].concat(CHO_HANG, ['launch(3)']), ['ship("LLLRRRDD")']),
      hamCuaEmCan: ['u_turn', 'launch', 'walk', 'go', 'ship'],
      goiY: ['Hai robot làm song song: lúc xe ném hộp gỗ thì drone đang bay đi lấy hộp sắt.', 'Xe quay về rồi chờ: while front_clear(): wait(), rồi launch(3).']
    }),
    man({
      so: 5, ten: 'Ném sang, bay tiếp', pin: 4,
      deBai: 'Xe ném hộp sắt đỏ qua tường, rơi xuống ô sạc nơi drone đang đậu. Drone chờ tới khi camera thấy hộp, hút lên rồi chở tới ô đích. Pin drone chỉ có 4: bay đường không có ô sạc thì rơi giữa đường.',
      veMaMau: 'Chạy thử: drone bay đi tay không vì hộp chưa tới, và đường bay trên không có ô sạc. Viết chương trình xe, sửa chương trình drone.',
      san: ['#########', '#.o#P...#', '####.##.#', '####.P.D#', '#########'], vatChat: ['.........', '..s......', '.........', '.........', '.........'],
      vatMau: ['.........', '..r......', '.........', '.........', '.........'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 4, y: 1, huong: 0 }],
      maMau: B([], ['ship("RRRDD")']),
      loiGiai: B(['launch(3)'], ['while look() == "none":', '    wait()', 'ship("DDRRR")']),
      hamCuaEmCan: ['launch', 'walk', 'go', 'ship'],
      goiY: ['Đậu chờ trên ô sạc thì pin không hao. Camera thấy hộp đỏ thì look() trả "red".', 'Hai đường tới đích dài bằng nhau, nhưng chỉ đường dưới có ô sạc ở giữa.']
    }),
    man({
      so: 6, ten: 'Drone chạy theo pin', pin: 5, khoa: 1,
      deBai: 'Drone là robot tự động: hút hộp, bay theo fly() (pin thấp thì ghé ô sạc phía trên), thả hộp trước mũi xe rồi đậu lên ô sạc. Đếm nhịp lúc hộp tới rất khó. Viết chương trình xe: chờ tới khi có hộp trước mũi, nạp, quay xuống rồi ném qua tường vào đích.',
      veMaMau: 'Chương trình drone bị khóa, bấm thẻ R2 để đọc. Chạy thử: xe nạp hụt vì hộp chưa tới.',
      san: ['############', '###P#P#P#P##', '#o.........#', '############', '##########D#', '############'],
      vatChat: ['............', '............', '.s..........', '............', '............', '............'],
      bd: [{ x: 10, y: 2, huong: 3 }, { x: 1, y: 2, huong: 0 }],
      maMau: B(['load()', 'wait()', 'turn_left()', 'toss(2)'], DRONE_6),
      loiGiai: B(CHO_HANG.concat(['load()', 'wait()', 'turn_left()', 'toss(2)']), DRONE_6),
      hamCuaEmCan: ['fly', 'recharge', 'go', 'turn_left', 'toss'],
      goiY: ['Không cần đếm: hộp nằm trước mũi thì front_clear() trả False.', 'while front_clear(): wait() đặt trước load().']
    }),
    man({
      so: 7, ten: 'Sửa vòng chờ của drone',
      deBai: 'Xe lấy hộp sắt rồi ném qua tường xuống ô hẹn màu vàng, nơi drone đang chờ. Nhưng drone bay đi ngay từ đầu mà không mang hộp. Chương trình xe đã đúng: tìm chỗ sai trong vòng chờ của drone và sửa.',
      veMaMau: 'Chạy thử, xem camera đọc được gì ở ô vàng khi chưa có hộp.',
      san: ['##########', '#....o#..#', '##########', '##########', '##..y..D##', '##########'], vatChat: ['..........', '.....s....', '..........', '..........', '..........', '..........'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 4, y: 4, huong: 0 }],
      maMau: B(['go_wall()', 'load()', 'wait()', 'turn_right()', 'toss(3)'], ['while look() == "none":', '    wait()', 'ship("RRR")']),
      loiGiai: B(['go_wall()', 'load()', 'wait()', 'turn_right()', 'toss(3)'], ['while look() == "yellow":', '    wait()', 'ship("RRR")']),
      hamCuaEmCan: ['go_wall', 'turn_right', 'toss', 'walk', 'go', 'ship'],
      goiY: ['Chưa có hộp thì camera nhìn thấy sàn vàng; hộp sắt không màu thì look() trả "none".', 'Chờ khi nào còn thấy màu vàng: while look() == "yellow".']
    }),
    man({
      so: 8, ten: 'Hộp chắn đường xe',
      deBai: 'Xe ném hộp gỗ xuống đích dưới, rồi tiến ba ô tới chỗ chờ hộp sắt. Drone thả hộp sắt ngay giữa lối xe đi: hộp nằm đất chiếm ô nên xe kẹt lại, nạp hộp sai chỗ rồi ném hỏng. Chương trình xe đã đúng: sửa đường bay của drone để hộp nằm đúng ô trước mũi chỗ xe sẽ chờ.',
      veMaMau: 'Chạy thử, xem hộp sắt nằm ở đâu lúc xe tiến.',
      san: ['##########', '##o#######', '##=#######', '#......###', '#o########', '##########', '#D##D#####', '##########'],
      vatChat: ['..........', '..s.......', '..........', '..........', '..........', '..........', '..........', '..........'],
      bd: [{ x: 1, y: 3, huong: 1 }, { x: 2, y: 1, huong: 0 }],
      maMau: B(['turn_right()', 'launch(3)', 'turn_left()', 'forward(3)'].concat(CHO_HANG, ['side_throw(3)']), ['ship("DD")']),
      loiGiai: B(['turn_right()', 'launch(3)', 'turn_left()', 'forward(3)'].concat(CHO_HANG, ['side_throw(3)']), ['ship("DDRRR")']),
      hamCuaEmCan: ['turn_right', 'turn_left', 'launch', 'forward', 'side_throw', 'walk', 'go', 'ship'],
      goiY: ['Drone bay qua đầu xe được, nhưng hộp nằm dưới đất thì chắn xe như tường.', 'Xe chờ ở ô thứ tư của lối đi; thả hộp ở ô ngay sau đó.']
    }),
    man({
      so: 9, ten: 'Ba hộp, ba chuyến',
      deBai: 'Ba hộp sắt nằm sau hàng rào. Mỗi chuyến drone chở một hộp sang phải 4 ô, thả trước mũi xe rồi bay về lấy hộp kế. Xe chờ hộp, ném lên đích phía trên rồi tiến lên một ô chờ hộp sau. Viết thẳng ba chuyến thì chương trình xe tràn khung: dùng vòng lặp cho cả hai robot.',
      veMaMau: 'Chương trình đã làm được chuyến thứ nhất. Bọc vào vòng lặp.',
      san: ['##########', '##########', '######DDD#', '##########', '#ooo=....#', '##########'], vatChat: ['..........', '..........', '..........', '..........', '.sss......', '..........'],
      bd: [{ x: 8, y: 4, huong: 3 }, { x: 4, y: 4, huong: 0 }],
      maMau: B(CHO_HANG.concat(['side_throw(2)', 'move()']), ['go_left()', 'airlift(4)']),
      loiGiai: B(['for i in range(3):', '    while front_clear():', '        wait()', '    side_throw(2)', '    move()'], ['for i in range(3):', '    go_left()', '    airlift(4)']),
      hamCuaEmCan: ['side_throw', 'move', 'airlift'],
      goiY: ['Hộp nào cũng cách chỗ thả của nó đúng 4 ô, nên chuyến nào drone cũng chỉ là go_left() rồi airlift(4).', 'Xe lặp ba lần: chờ, side_throw(2), move().']
    }),
    man({
      so: 10, ten: 'Ca trực ba sân',
      pin: [9, 6, 4],
      deBai: 'Ba sân: pin drone 9, 6 rồi 4, ô giao (dưới ô vàng) xa gần khác nhau, ô đích lúc bên trái lúc bên phải xe. Drone hút hộp, bay sang phải tới ô vàng (pin thấp thì ghé ô sạc phía trên), hạ xuống thả hộp trước mũi xe rồi bay lên đậu ô sạc. Xe chờ hộp, nạp, quay về phía có lối rồi ném qua tường. Một chương trình cho mỗi robot phải thắng cả ba sân.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: [
        ['##PPPPPPPPPP#', '#o.........##', '##########.##', '#######D#..##', '#############'],
        ['##PPPPPP#####', '#o......#####', '#######.#####', '#######..#D##', '#############'],
        ['##PPPPPPPPP##', '#o........###', '#########.###', '#########..#D', '#############']
      ],
      mau: [
        ['.............', '..........y..', '.............', '.............', '.............'],
        ['.............', '.......y.....', '.............', '.............', '.............'],
        ['.............', '.........y...', '.............', '.............', '.............']
      ],
      vatChat: [
        ['.............', '.s...........', '.............', '.............', '.............'],
        ['.............', '.s...........', '.............', '.............', '.............'],
        ['.............', '.s...........', '.............', '.............', '.............']
      ],
      bd: [[{ x: 10, y: 3, huong: 0 }, { x: 7, y: 3, huong: 0 }, { x: 9, y: 3, huong: 0 }], [{ x: 1, y: 1, huong: 0 }, { x: 1, y: 1, huong: 0 }, { x: 1, y: 1, huong: 0 }]],
      maMau: B([], []),
      loiGiai: B(XE_10, DRONE_10),
      hamCuaEmCan: ['recharge', 'toss'],
      goiY: ['Pin mỗi sân một khác nên lúc hộp tới cũng khác: xe phải chờ bằng cảm biến. Drone xong việc vẫn tốn pin, nên phải về đậu ô sạc.',
        'Lối trống còn một ô sàn trước tường; phía kia sát tường. Ô đích cách xe ba ô.'],
      huyHieu: { ma: CHUONG, ten: 'Huy hiệu Đội drone và máy ném' }
    }),

    /* ======================= chương 2 `che-doi-drone`: chế lệnh phối hợp ======================= */
    C2({
      so: 1, ten: 'Xe nhận hàng', taoHam: ['receive'], khoa: 1,
      deBai: 'Drone tự động chở hộp sắt qua rào, thả trước mũi xe. Chương trình xe chỉ gọi receive(), rồi quay phải và ném. Em tự chế lệnh receive(): chờ tới khi có hộp trước mũi, rồi nạp hộp vào rổ.',
      veMaMau: 'Chạy thử: xe nạp ngay khi hộp chưa tới nên ném rổ trống. Mở Xưởng hàm tạo receive(), rồi dùng nó thay cho load() và wait().',
      san: ['#########', '#o=.#####', '###..####', '####.##D#', '#########'], vatChat: ['.........', '.s.......', '.........', '.........', '.........'],
      bd: [{ x: 4, y: 3, huong: 0 }, { x: 1, y: 1, huong: 0 }],
      maMau: B(['load()', 'wait()', 'turn_right()', 'toss(3)'], ['ship("RRDR")']),
      loiGiai: Object.assign(B(['receive()', 'turn_right()', 'toss(3)'], ['ship("RRDR")']), { hamCuaEmMoi: [hReceive()] }),
      hamCuaEmCan: ['ship', 'turn_right', 'toss'],
      goiY: ['Nạp ngay thì rổ trống: hộp chưa tới. Chờ trước, nạp sau.', 'receive(): while front_clear(): wait(), rồi load() và wait().']
    }),
    C2({
      so: 2, ten: 'Drone đỡ hàng', taoHam: ['snatch'], khoa: 0,
      deBai: 'Xe tự động ném hộp sắt xanh qua tường, rơi xuống đúng ô drone đang đậu. Chương trình drone gọi snatch() rồi chở hộp qua rào vào đích. Em tự chế lệnh snatch(): chờ tới khi camera thấy hộp dưới bụng, rồi bật nam châm hút lên.',
      veMaMau: 'Chạy thử: drone bật nam châm khi hộp chưa rơi tới nên bay đi tay không. Mở Xưởng hàm tạo snatch(), rồi dùng nó thay cho magnet_n() và wait().',
      san: ['#########', '#.o#..=D#', '#########'], vatChat: ['.........', '..s......', '.........'], vatMau: ['.........', '..b......', '.........'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 4, y: 1, huong: 0 }],
      maMau: B(['launch(3)'], ['magnet_n()', 'wait()', 'walk("RRR")', 'magnet_off()', 'wait()']),
      loiGiai: Object.assign(B(['launch(3)'], ['snatch()', 'walk("RRR")', 'magnet_off()', 'wait()']), { hamCuaEmMoi: [hSnatch()] }),
      hamCuaEmCan: ['launch', 'walk', 'go'],
      goiY: ['Chưa có hộp thì camera nhìn sàn trống, look() trả "none".', 'snatch(): while look() == "none": wait(), rồi magnet_n() và wait().']
    }),
    C2({
      so: 3, ten: 'Giao rồi về đậu', taoHam: ['courier'], pin: 6, khoa: 0,
      deBai: 'Drone hút hộp, bay qua rào xuống ô trước mũi xe rồi thả. Pin chỉ có 6, và xe còn phải nạp, quay rồi ném: drone lơ lửng chờ thì hết pin giữa chừng. Em tự chế lệnh courier(path, back): chở hộp theo path, thả, rồi bay theo back về đậu ô sạc.',
      veMaMau: 'Chạy thử: drone thả hộp xong lơ lửng chờ nên hết pin. Mở Xưởng hàm tạo courier có hai đối số path và back, rồi gọi courier("RD", "UR") thay cho ship("RD").',
      san: ['##########', '####o=P###', '#####.####', '#####.##D#', '##########'], vatChat: ['..........', '....s.....', '..........', '..........', '..........'],
      bd: [{ x: 5, y: 3, huong: 0 }, { x: 4, y: 1, huong: 0 }],
      maMau: B(['receive()', 'turn_right()', 'toss(3)'], ['ship("RD")']),
      loiGiai: Object.assign(B(['receive()', 'turn_right()', 'toss(3)'], ['courier("RD", "UR")']), { hamCuaEmMoi: [hCourier()] }),
      hamCuaEmCan: ['receive', 'turn_right', 'toss', 'ship', 'walk', 'go'],
      goiY: ['Thả hộp xong drone vẫn tốn pin mỗi nhịp, kể cả lúc chờ. Đậu trên ô sạc thì pin đầy lại.', 'courier(path, back): ship(path) rồi walk(back).']
    }),
    C2({
      so: 4, ten: 'Đổi hàng hai chiều',
      deBai: 'Xe ném hộp đỏ qua tường cho drone; drone đỡ bằng snatch() rồi chở vào đích bên phải. Sau đó drone lấy hộp sắt bên dưới, bay qua rào thả vào ô trước mũi xe vừa trống. Xe nhận bằng receive() rồi quay xuống ném vào đích dưới.',
      veMaMau: 'Chạy thử: xe ném xong thì đứng yên, drone chưa có chương trình. Viết tiếp cho cả hai robot, dùng các lệnh em đã chế.',
      san: ['##########', '#.o#...D##', '##==.o####', '##########', '#D########', '##########'],
      vatChat: ['..........', '..s.......', '.....s....', '..........', '..........', '..........'], vatMau: ['..........', '..r.......', '..........', '..........', '..........', '..........'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 4, y: 1, huong: 0 }],
      maMau: B(['launch(3)'], []),
      loiGiai: B(['launch(3)', 'receive()', 'turn_right()', 'toss(3)'], ['snatch()', 'walk("RRR")', 'magnet_off()', 'walk("LLD")', 'ship("LLLU")']),
      hamCuaEmCan: ['launch', 'receive', 'turn_right', 'toss', 'snatch', 'walk', 'go', 'ship'],
      goiY: ['Ô trước mũi xe trống ngay sau cú ném đầu: đó là chỗ drone thả hộp thứ hai.', 'Drone thả hộp đỏ cùng nhịp với bước bay đầu tiên của walk("LLD").']
    }),
    C2({
      so: 5, ten: 'Drone tự động hai chuyến', pin: 7, khoa: 1,
      deBai: 'Drone tự động gọi courier() em đã chế: lấy hộp bên trái, thả trước mũi xe, về đậu ô sạc; rồi lấy hộp bên phải. Xe nhận hộp thứ nhất ném vào đích gần (tầm 2), hộp thứ hai vào đích xa (tầm 3). Dùng vòng lặp với biến n cho xe.',
      veMaMau: 'Chương trình drone bị khóa, bấm thẻ R2 để đọc. Viết chương trình xe.',
      san: ['###P#####', '##o=o####', '###.#####', '###.#DD##', '#########'], vatChat: ['.........', '..s.s....', '.........', '.........', '.........'],
      bd: [{ x: 3, y: 3, huong: 0 }, { x: 3, y: 0, huong: 0 }],
      maMau: B([], DRONE_C5),
      loiGiai: B(XE_C5, DRONE_C5),
      hamCuaEmCan: ['courier', 'receive', 'turn_right', 'turn_left', 'toss', 'walk', 'go'],
      goiY: ['Mỗi lần nhận: receive(), quay phải, ném, quay về.', 'n = 2 rồi lặp hai lần, mỗi lần ném xong tăng n thêm 1.']
    }),
    C2({
      so: 6, ten: 'Ba chuyến, ghé sạc', pin: 10,
      deBai: 'Ba hộp sắt sau hàng rào. Mỗi chuyến drone chở một hộp sang phải 4 ô thả trước mũi xe, rồi bay lên dải ô sạc, về phía trái và hạ xuống hộp kế. Pin 10 không đủ bay thẳng về. Xe nhận hộp, quay xuống ném qua tường rồi tiến một ô. Dùng vòng lặp cho cả hai robot.',
      veMaMau: 'Chương trình đã làm được chuyến thứ nhất. Bọc vào vòng lặp.',
      san: ['#PPPPPPPP##', '#========##', '#.ooo=....#', '###########', '#######DDD#', '###########'],
      vatChat: ['...........', '...........', '..sss......', '...........', '...........', '...........'],
      bd: [{ x: 9, y: 2, huong: 3 }, { x: 4, y: 2, huong: 0 }],
      maMau: B(['receive()', 'turn_left()', 'toss(2)', 'turn_right()', 'move()'], ['courier("RRRR", "UULLLLLDD")']),
      loiGiai: B(['for i in range(3):', '    receive()', '    turn_left()', '    toss(2)', '    turn_right()', '    move()'], ['for i in range(3):', '    courier("RRRR", "UULLLLLDD")']),
      hamCuaEmCan: ['receive', 'turn_left', 'turn_right', 'toss', 'move', 'courier', 'ship', 'walk', 'go'],
      goiY: ['Bay thẳng về theo hàng hộp thì hết pin; bay lên dải ô sạc thì pin đầy lại.', 'Chuyến nào cũng giống nhau: courier("RRRR", "UULLLLLDD").']
    }),
    C2({
      so: 7, ten: 'Sửa hàm thả hàng', khoa: 1,
      deBai: 'Drone tự động gọi drop_off(path) để chở hộp qua rào, bay ngang qua đầu xe, thả trước mũi xe. Nhưng hộp nằm lại chỗ cũ: hàm drop_off của màn này thả hộp trước khi bay. Sửa hàm drop_off cho đúng thứ tự.',
      veMaMau: 'Chương trình hai robot đã đúng. Mở Xưởng hàm, sửa hàm drop_off của màn.',
      san: ['########', '#o=..###', '########', '########', '###D####', '########'], vatChat: ['........', '.s......', '........', '........', '........', '........'],
      bd: [{ x: 3, y: 1, huong: 1 }, { x: 1, y: 1, huong: 0 }],
      maMau: B(['receive()', 'turn_right()', 'toss(3)'], ['drop_off("RRR")'], [H('drop_off', ['path'], T_DROP_OFF_HONG)]),
      loiGiai: B(['receive()', 'turn_right()', 'toss(3)'], ['drop_off("RRR")'], [H('drop_off', ['path'], T_DROP_OFF)]),
      hamCuaEmCan: ['receive', 'turn_right', 'toss', 'walk', 'go'],
      goiY: ['magnet_off() thả hộp ngay ở nhịp kế tiếp, trước khi drone bay.', 'Bay theo path trước, rồi mới magnet_off() và wait().']
    }),
    C2({
      so: 8, ten: 'Chờ cứng ba nhịp', pin: 5, khoa: 1,
      deBai: 'Drone tự động đậu trên ô sạc, gọi standby() để chờ hộp xe ném tới rồi chở vào đích. Nhưng standby() chỉ chờ đúng ba nhịp, còn xe phải đi tới hộp, nạp, quay rồi mới ném. Sửa hàm standby của màn để drone chờ bằng camera.',
      veMaMau: 'Chương trình hai robot đã đúng. Mở Xưởng hàm, sửa hàm standby của màn.',
      san: ['##########', '#.....o###', '##########', '##########', '#####P..D#', '##########'], vatChat: ['..........', '......s...', '..........', '..........', '..........', '..........'],
      vatMau: ['..........', '......r...', '..........', '..........', '..........', '..........'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 5, y: 4, huong: 0 }],
      maMau: B(['go_wall()', 'load()', 'wait()', 'turn_right()', 'toss(3)'], DRONE_C8, [H('standby', [], T_STANDBY_HONG)]),
      loiGiai: B(['go_wall()', 'load()', 'wait()', 'turn_right()', 'toss(3)'], DRONE_C8, [H('standby', [], T_STANDBY)]),
      hamCuaEmCan: ['go_wall', 'turn_right', 'toss', 'snatch', 'walk', 'go'],
      goiY: ['Xe cần bao lâu thì tùy đường, đoán số nhịp dễ sai.', 'Em đã chế snatch(): chờ bằng camera rồi hút. standby() chỉ cần gọi nó.']
    }),
    C2({
      so: 9, ten: 'Đổi chỗ hai tầng', mucTieu: 'toi-co',
      co: [[{ x: 7, y: 2 }], [{ x: 1, y: 2 }]],
      deBai: 'Xe và drone đổi chỗ cho nhau qua một lối hẹp: cờ của xe ở chỗ drone đứng, cờ của drone ở chỗ xe đứng. Khác tầng nên hai robot bay, chạy ngang qua nhau được, nhưng hộp sắt giữa lối chắn xe. Drone nhấc hộp, chở bay ngang qua đầu xe, cất vào hốc phía trên gần cờ của mình rồi hạ xuống cờ; xe chờ lối trống rồi đi tới cờ của mình.',
      veMaMau: 'Chạy thử: drone tới cờ nhưng xe kẹt trước hộp. Sửa cả hai chương trình.',
      san: ['#########', '##.######', '#F..o..F#', '#########'], vatChat: ['.........', '.........', '....s....', '.........'],
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 7, y: 2, huong: 0 }],
      maMau: B(['go_wall()'], ['walk("LLLLLL")']),
      loiGiai: B(['go_wall()', 'while not front_clear():', '    wait()', 'go_wall()'], ['courier("LLLLLU", "DL")']),
      hamCuaEmCan: ['go_wall', 'walk', 'go', 'courier', 'ship'],
      goiY: ['Cờ có vạch màu của robot nào thì chỉ robot đó tới mới tính.', 'Drone: courier("LLLLLU", "DL"). Xe: go_wall(), chờ lối trống, go_wall().']
    }),
    C2({
      so: 10, ten: 'Ca tiếp sức ba sân',
      pin: [8, 5, 4],
      deBai: 'Ba sân: hộp vàng của xe xa gần khác nhau, ô đích vàng của drone xa gần khác nhau, pin drone 8, 5 rồi 4. Xe đi tới hộp, nạp, về đầu lối rồi ném hộp qua tường xuống ô sạc nơi drone đậu chờ. Drone đỡ hộp, bay sang phải tới ô vàng (pin thấp thì ghé ô sạc phía trên) rồi thả. Một chương trình cho mỗi robot phải thắng cả ba sân.',
      veMaMau: 'Tự viết cả hai chương trình, dùng các lệnh em đã chế.',
      san: [
        ['############', '#PPPPPPPPPP#', '#P....D....#', '############', '############', '#...o......#', '############'],
        ['############', '#PPPPPPPPPP#', '#P.......D.#', '############', '############', '#......o...#', '############'],
        ['############', '#PPPPPPPPPP#', '#P........D#', '############', '############', '#..o.......#', '############']
      ],
      mau: [
        ['............', '............', '......y.....', '............', '............', '............', '............'],
        ['............', '............', '.........y..', '............', '............', '............', '............'],
        ['............', '............', '..........y.', '............', '............', '............', '............']
      ],
      vatChat: [
        ['............', '............', '............', '............', '............', '....s.......', '............'],
        ['............', '............', '............', '............', '............', '.......s....', '............'],
        ['............', '............', '............', '............', '............', '...s........', '............']
      ],
      vatMau: [
        ['............', '............', '............', '............', '............', '....y.......', '............'],
        ['............', '............', '............', '............', '............', '.......y....', '............'],
        ['............', '............', '............', '............', '............', '...y........', '............']
      ],
      bd: [[{ x: 1, y: 5, huong: 1 }, { x: 1, y: 5, huong: 1 }, { x: 1, y: 5, huong: 1 }], [{ x: 1, y: 2, huong: 0 }, { x: 1, y: 2, huong: 0 }, { x: 1, y: 2, huong: 0 }]],
      maMau: B([], []),
      loiGiai: B(XE_C10, DRONE_C10),
      hamCuaEmCan: ['go_wall', 'receive', 'u_turn', 'turn_right', 'toss', 'snatch', 'recharge'],
      goiY: ['Xe về đầu lối bằng go_wall() nên hộp luôn rơi đúng ô sạc của drone, dù hộp xa hay gần.',
        'Drone đỡ bằng snatch(), rồi lặp: while look() != "yellow": go_right(), recharge().'],
      huyHieu: { ma: 'che-' + CHUONG, ten: 'Huy hiệu Chế lệnh đội drone' }
    })
  ];

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'flycam', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội drone và máy ném' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội drone' }],
    goi: { ma: CHUONG, ten: 'Đội drone và máy ném', hinh: 'drone' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

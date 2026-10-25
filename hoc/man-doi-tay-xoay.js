/* ============================================================================
   man-doi-tay-xoay.js — "Robot Chấn Hưng": GÓI ĐỘI TAY XOAY VÀ NAM CHÂM (20 màn, hai chương, ngay sau che-tay-xoay). Kế hoạch: hoc/KE-HOACH-PHOI-HOP.md (§3, §3b, §4, §8).
   Hai xe hai bánh, cùng cảm biến khoảng cách ở hông: R1 gắn NAM CHÂM CÓ CỰC (kéo vật sắt / vật nam châm từ xa, bắn vật nam châm ra xa; front_metal(), front_pole()),
   R2 gắn TAY XOAY (gắp, đặt ở ô trước mặt, bên trái hay bên phải mà không quay xe). Mỗi robot một chương trình, chạy theo nhịp chung.
   Kỹ năng phối hợp của gói (K8): DÂY CHUYỀN NHIỀU VẬT. Ô bàn giao chỉ chứa được một vật: còn vật thì robot đứng trước phải chờ; nhiều vật thì cả hai lặp.

   Ba kiểu dây chuyền (luật lõi ở san-hoc.js, phần NAM CHÂM và TAY XOAY; robot đồng đội chặn vật đang trượt):
     - BĂNG BẮN: nam châm kéo vật chữ N trong kho về mũi (grip(): bật cực S), quay đầu, kick() đổi sang cực N nên vật bị bắn ra, trượt tối đa 3 ô,
       dừng trước vật cản (tường, vật khác, robot). Băng có tường ở cuối thì ô sát tường là ô bàn giao: còn vật mà bắn tiếp thì hai vật ùn lại,
       nam châm chờ băng trống bằng front_pole() (thấy vật nam châm trong 3 ô).
     - ĐÓN ĐẦU BĂNG: tay xoay đứng giữa băng, vật trượt tới dừng ngay trước mũi; nhặt, đặt sang bên rồi tiến một ô đón vật sau.
     - BĂNG XẾP HÀNG: tay xoay đặt vật vào ô bàn giao trước mũi nam châm (chờ ô trống bằng right_clear()); nam châm kéo vật về, quay đầu bắn vào hàng ô đích,
       vật sau dừng trước vật trước.

   Chương doi-tay-xoay (lời giải chuẩn):
     1  Hai làn: từ và tay        R1 đã có reel(); em viết tay xoay chuyền vật trái sang phải
     2  Nam châm giao hàng        R1 tự động (khóa): tiến một ô, hút vật sau rào về ô bàn giao; em viết R2 chờ bằng left_clear() rồi chuyền vào đích
     3  Nhấc gỗ chắn đường        R2 tới nhấc khúc gỗ khỏi đường hút; R1 chờ front_pole() rồi hút vật sau rào vào đích
     4  Chờ băng trống            băng bắn, ô bàn giao cuối băng: R2 bận dọn gỗ, R1 chờ front_pole() == "none" mới bắn vật thứ hai
     5  Băng xếp hàng             R2 đặt hai vật vào ô bàn giao sau rào, chờ right_clear(); R1 tới trễ, hút về rồi bắn vào hàng đích
     6  Theo kịp nam châm         R1 tự động (khóa) bắn ba vật, vật cuối phải tiến lấy nên chậm hơn; R2 đón đầu băng, chờ bằng cảm biến (đếm nhịp tốn ô)
     7  Tay xoay chờ cứng         R2 chờ cứng 2 nhịp rồi đặt vật thứ hai nhưng R1 tới trễ hơn: đổi sang chờ bằng right_clear()
     8  Sửa thứ tự quay           R1 bắn trước khi quay đầu nên vật bay ngược về ô bàn giao: đổi chỗ hai dòng
     9  Ba vật một băng           đón đầu băng, kho ở phía trên nam châm: viết thẳng tràn khung, cả hai phải lặp
     10 Ca dây chuyền             trùm ba sân: số vật, phía ô đích và độ dài băng khác nhau; R1 lặp theo front_pole(), R2 hỏi right_clear()

   Chương che-doi-tay-xoay (chế lệnh phối hợp; hàm mới ở khối DS2 bên dưới):
     1  Nạp băng                  chế load_belt() cho R1, viết chương trình R1 gọi hai lần; R2 đã có
     2  Đón băng                  chế catch_belt() cho R2 (chờ trong hàm), gọi ba lần
     3  Lệnh chờ băng             chế wait_belt() (hàm chờ ô bàn giao trống), chèn trước kick() của R1
     4  Cả đội vào ca             mỗi robot chỉnh chỗ đứng một lần rồi lặp hàm đã chế
     5  Tay xoay tự động          R2 khóa gọi catch_belt(); em viết R1, vật thứ ba nằm phía trên kho
     6  Xếp hàng bằng nạp băng    đổi chiều: R2 giao vào ô bàn giao sau rào (chờ right_clear()), R1 tới trễ rồi load_belt() bắn vào hàng đích
     7  Sửa hàm nạp               hàm của màn load_up() quên ngắt điện: cực N đẩy vật trong kho ra ngoài tầm
     8  Sửa hàm chờ               R1 khóa gọi hàm của màn wait_cargo() chờ ngược điều kiện
     9  Lùi vào hốc nhường đường  cờ riêng doi[i].co: R2 dời sắt bằng make_way() (của màn, quên quay xe) rồi lùi vào hốc, R1 hút sắt đi qua
     10 Ca dây chuyền tự chế      trùm ba sân: R1 hỏi front_pole() để quay về kho, R2 hỏi front_clear() để quay vào băng; cả hai lặp hàm đã chế

   Tệp chỉ khai báo chương (ManHoc.chuongThem); lo-trinh-hoc.js chèn hai chương ngay sau che-tay-xoay. Khung dữ liệu nhiều robot như man-doi-ho-bang.js:
   man.doi = [phần riêng R1 (nam châm), phần riêng R2 (tay xoay)]; robot khóa doi[i].coDinh với chương trình ở maMau.doi[i].
   Sân viết bằng chữ của tệp này (hàm S): N / Z vật nam châm chữ N / chữ S (chữ quay về phía xe), s vật sắt, w gỗ, W gỗ nằm sẵn trên ô đích; S() đổi ra o / X + lớp vatChat.
   CẦN CẢ ĐỘI (tools/do-mot-robot.mjs): hàng rào '=' chặn xe nhưng nam châm hút xuyên qua được, nên vật sau rào chỉ nam châm lấy được và vùng sau rào chỉ tay xoay vào được;
   ở màn nam châm giao cho tay xoay, tay xoay đứng sẵn ở lối duy nhất vào vùng ô đích (bận dọn gỗ trước) nên nam châm không tự chở vật vào đích được.
   Mục tiêu 'dua-vat' + vatCan 'tu': vật sắt và vật nam châm phải nằm trên ô đích, gỗ để đâu cũng được. Máy kiểm riêng: kiem-doi-tay-xoay.mjs.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-tay-xoay';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {
    'doi-tay-xoay.1': { o: 25, nhip: 3 },
    'doi-tay-xoay.2': { o: 31, nhip: 6 },
    'doi-tay-xoay.3': { o: 31, nhip: 5 },
    'doi-tay-xoay.4': { o: 63, nhip: 15 },
    'doi-tay-xoay.5': { o: 48, nhip: 14 },
    'doi-tay-xoay.6': { o: 46, nhip: 18 },
    'doi-tay-xoay.7': { o: 52, nhip: 17 },
    'doi-tay-xoay.8': { o: 45, nhip: 11 },
    'doi-tay-xoay.9': { o: 39, nhip: 16 },
    'doi-tay-xoay.10': { o: 48, nhip: 38 },
    'che-doi-tay-xoay.1': { o: 39, nhip: 11 },
    'che-doi-tay-xoay.2': { o: 40, nhip: 16 },
    'che-doi-tay-xoay.3': { o: 64, nhip: 15 },
    'che-doi-tay-xoay.4': { o: 42, nhip: 17 },
    'che-doi-tay-xoay.5': { o: 46, nhip: 17 },
    'che-doi-tay-xoay.6': { o: 49, nhip: 14 },
    'che-doi-tay-xoay.7': { o: 52, nhip: 11 },
    'che-doi-tay-xoay.8': { o: 46, nhip: 11 },
    'che-doi-tay-xoay.9': { o: 46, nhip: 16 },
    'che-doi-tay-xoay.10': { o: 44, nhip: 39 }
  };
  // @sao-cuoi

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var CAM_BIEN = [{ ma: 'khoang-cach', o: 'hong' }];
  var NAM = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'nam-cham', camBien: CAM_BIEN }, hamGoc: BANH.concat(['magnet_n', 'magnet_s', 'magnet_off'], BA_HUONG, ['front_metal', 'front_pole']) };
  var XOAY = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'xoay', camBien: CAM_BIEN }, hamGoc: BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'], BA_HUONG) };

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  /** Bài làm hai robot; hm: hàm của màn (dùng chung). */
  function B(c1, c2, hm) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: (hm || []).map(sao) }; }
  /** Lời giải có hàm của em mới (màn chế lệnh). */
  function BM(c1, c2, moi) { var b = B(c1, c2); b.hamCuaEmMoi = moi.map(sao); return b; }
  /** Thân vòng lặp: thụt mọi dòng thêm một bậc. */
  function T(ds) { return ds.map(function (d) { return '    ' + d; }); }
  function lap(dau, than) { return [dau].concat(T(than)); }

  var KY = { N: ['o', 'N'], Z: ['o', 'S'], s: ['o', 's'], w: ['o', 'g'], W: ['X', 'g'] };
  /** Sân viết bằng chữ của tệp → { san, vatChat } (một sân) hay mảng song song (nhiều sân). */
  function S(rows) {
    if (Array.isArray(rows[0])) { var ds = rows.map(S); return { san: ds.map(function (d) { return d.san; }), vatChat: ds.map(function (d) { return d.vatChat; }) }; }
    var san = [], chat = [];
    rows.forEach(function (r) {
      var a = '', b = '';
      for (var i = 0; i < r.length; i++) { var k = KY[r[i]]; a += k ? k[0] : r[i]; b += k ? k[1] : '.'; }
      san.push(a); chat.push(b);
    });
    return { san: san, vatChat: chat };
  }

  /** m.bd: [batDau nam châm, batDau tay xoay]; m.so_do: sân viết bằng chữ của tệp (xem S); m.khoa: chỉ số robot tự động (khóa). */
  function man(m) {
    var bd = m.bd, sc = S(m.so_do), khoa = m.khoa;
    delete m.bd; delete m.so_do; delete m.khoa;
    m.san = sc.san; m.vatChat = sc.vatChat;
    m.chuong = m.chuong || CHUONG;                                         // chương 2 khai chuong: 'che-' + CHUONG
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'dua-vat';
    if (m.mucTieu === 'dua-vat') m.vatCan = 'tu';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    m.doi = [Object.assign({ batDau: bd[0] }, sao(NAM)), Object.assign({ batDau: bd[1] }, sao(XOAY))];
    if (khoa !== undefined) m.doi[khoa].coDinh = true;
    if (m.co) { m.doi[0].co = m.co[0]; m.doi[1].co = m.co[1]; delete m.co; }
    // Cấp ngoài là của R1 để mã đọc màn một robot không vỡ.
    m.batDau = bd[0]; m.loaiRobot = NAM.loaiRobot; m.robot = sao(NAM.robot); m.hamGoc = NAM.hamGoc.slice();
    m.taoHam = m.taoHam || []; m.loiSai = [];
    m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    m.sao = SAO[m.chuong + '.' + m.so] || { o: 1, nhip: 1 };
    return ManHoc.chuanHoa(m);
  }

  // ---- đoạn chương trình dùng nhiều lần
  var NAP = ['grip()', 'u_turn()', 'kick()', 'u_turn()'];                          // nam châm: kéo một vật trong kho về, quay đầu, bắn sang băng, quay lại kho
  var CHO_BANG = ['while front_pole() != "none":', '    wait()'];                // nam châm: chờ băng trống (không còn vật nam châm trong 3 ô trước mặt)
  var CHO_VAT = ['while front_clear():', '    wait()'];                          // chờ có vật trước mặt
  var DON = CHO_VAT.concat(['pick()', 'drop_right()', 'move()']);                  // tay xoay đón đầu băng: chờ vật, nhặt, đặt sang phải, tiến một ô
  // 1.4: tay xoay dọn khúc gỗ trên ô đích trước mặt vào hốc phía sau rồi mới chuyển hai vật từ ô bàn giao (bên trái) sang hai ô đích
  var DON_GO = ['pick()', 'turn_right()', 'move()', 'drop()', 'back()', 'turn_left()', 'pick_left()', 'drop_right()', 'pick_left()', 'drop()'];
  // 1.7: nam châm đi đường vòng tới sát hàng rào rồi hút hai vật xuyên rào, bắn vào hàng ô đích
  var R1_VONG = ['forward(3)', 'turn_right()', 'forward(5)'].concat(lap('for i in range(2):', NAP));

  var DS = [
    man({
      so: 1, ten: 'Hai làn: từ và tay',
      deBai: 'Hai robot ở hai làn riêng. Nam châm đã có chương trình kéo vật sắt về ô đích ngay trước mũi. Ở làn dưới, viết chương trình cho tay xoay chuyển vật bên trái sang ô đích bên phải mà không quay xe.',
      veMaMau: 'Chạy thử: nam châm xong phần của nó, tay xoay đứng yên. Viết chương trình R2.',
      so_do: ['#######', '#..Ds.#', '#######', '#.s.D.#', '#######'], bd: [{ x: 2, y: 1, huong: 1 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(['reel()'], []), loiGiai: B(['reel()'], ['pick_left()', 'drop_right()']),
      hamCuaEmCan: ['reel', 'grip', 'pick_left', 'drop_right'],
      goiY: ['pick_left() nhặt vật bên trái, drop_right() đặt vật sang bên phải; tay về phía trước sau mỗi lệnh.', 'Tay xoay đặt vật sang hai bên mà xe không cần quay.']
    }),
    man({
      so: 2, ten: 'Nam châm giao hàng', khoa: 0,
      deBai: 'Vật nam châm chữ S nằm sau hàng rào: tay xoay không với tới, nam châm thì hút xuyên rào được. Nam châm tự động (chương trình khóa, xem được): tiến một ô rồi kéo vật về ô ngay bên trái tay xoay. Viết chương trình cho tay xoay chờ tới khi thấy vật, rồi chuyển vật vào ô đích bên phải.',
      veMaMau: 'Chương trình nam châm bị khóa. Viết chương trình R2: nhặt ngay thì tay kẹp hụt vì vật chưa tới.',
      so_do: ['#######', '#######', '#...=Z#', '###.###', '###D###', '#######'], bd: [{ x: 1, y: 2, huong: 1 }, { x: 3, y: 3, huong: 1 }],
      maMau: B(['move()', 'reel()'], []), loiGiai: B(['move()', 'reel()'], ['while left_clear():', '    wait()', 'pick_left()', 'drop_right()']),
      hamCuaEmCan: ['move', 'reel', 'grip', 'pick_left', 'drop_right'],
      goiY: ['Vật nằm bên trái thì left_clear() trả False.', 'while left_clear(): wait() đặt trước pick_left().']
    }),
    man({
      so: 3, ten: 'Nhấc gỗ chắn đường',
      deBai: 'Khúc gỗ nằm trên ô đích chắn đường hút: nam châm không kéo được vật chữ S sau hàng rào. Tay xoay chạy lên, nhấc khúc gỗ trước mặt đặt sang bên phải. Nam châm chờ tới khi thấy vật nam châm (front_pole() khác "none") rồi mới kéo vật về ô đích.',
      veMaMau: 'Nam châm kéo ngay nên chỉ chạm vào gỗ; tay xoay mới đi tới nơi. Thêm vòng chờ cho R1 và viết tiếp R2.',
      so_do: ['######', '######', '#.W=Z#', '##..##', '##.###', '##.###', '######'], bd: [{ x: 1, y: 2, huong: 1 }, { x: 2, y: 5, huong: 0 }],
      maMau: B(['reel()'], ['forward(2)']),
      loiGiai: B(['while front_pole() == "none":', '    wait()', 'reel()'], ['forward(2)', 'pick()', 'drop_right()']),
      hamCuaEmCan: ['reel', 'grip', 'forward', 'move', 'pick', 'drop_right'],
      goiY: ['Gỗ đứng trước thì front_pole() trả "none"; nhấc gỗ đi thì nam châm thấy vật chữ S sau rào.', 'Tay xoay chỉ cần nhấc gỗ ra khỏi ô đích; nam châm đưa vật vào.']
    }),
    man({
      so: 4, ten: 'Chờ băng trống',
      deBai: 'Nam châm kéo từng vật chữ N trong kho về rồi quay đầu, kick() bắn vật trượt sang băng. Vật dừng ở ô sát tường, ngay bên trái tay xoay: đó là ô bàn giao. Tay xoay còn bận dọn khúc gỗ trên ô đích phía trước. Bắn vật thứ hai khi vật thứ nhất còn nằm đó thì hai vật ùn lại: nam châm phải chờ băng trống.',
      veMaMau: 'Chương trình tay xoay đã đúng. Chạy thử: vật thứ hai dừng giữa băng vì vật thứ nhất chưa được nhặt. Thêm vòng chờ cho nam châm.',
      so_do: ['#########', '#########', '#NN....##', '######.W#', '######D##', '######.##', '#########'], bd: [{ x: 3, y: 2, huong: 3 }, { x: 6, y: 3, huong: 1 }],
      maMau: B(lap('for i in range(2):', NAP), DON_GO),
      loiGiai: B(lap('for i in range(2):', ['grip()', 'u_turn()'].concat(CHO_BANG, ['kick()', 'u_turn()'])), DON_GO),
      hamCuaEmCan: ['grip', 'kick', 'u_turn', 'move', 'back', 'turn_left', 'turn_right', 'pick', 'drop', 'pick_left', 'drop_right'],
      goiY: ['front_pole() trả "N" khi còn vật nam châm trong 3 ô trước mặt, kể cả vật nằm ở ô bàn giao.', 'Chờ ngay trước kick(): while front_pole() != "none": wait()']
    }),
    man({
      so: 5, ten: 'Băng xếp hàng',
      deBai: 'Lần này tay xoay giao hàng: nhặt vật bên trái, đặt vào ô bàn giao bên phải, rồi nhặt vật trước mặt. Ô bàn giao nằm sau hàng rào: nam châm hút xuyên rào được nhưng còn đang chạy tới, nên ô bàn giao còn vật thì tay xoay phải chờ (right_clear()). Tới nơi, nam châm kéo từng vật về, quay đầu bắn vào hàng ô đích: vật sau dừng trước vật trước.',
      veMaMau: 'Tay xoay đặt vật thứ hai khi ô bàn giao còn vật nên tay vẫn cầm. Thêm vòng chờ cho R2, viết tiếp vòng lặp cho R1.',
      so_do: ['###########', '#..DD...=.#', '########N.#', '#########N#', '###########'], bd: [{ x: 1, y: 1, huong: 1 }, { x: 9, y: 2, huong: 3 }],
      maMau: B(['forward(6)'], ['pick_left()', 'drop_right()', 'pick()', 'drop_right()']),
      loiGiai: B(['forward(6)'].concat(lap('for i in range(2):', NAP)),
        ['pick_left()', 'drop_right()', 'pick()', 'while not right_clear():', '    wait()', 'drop_right()']),
      hamCuaEmCan: ['forward', 'move', 'grip', 'kick', 'u_turn', 'pick', 'pick_left', 'drop_right'],
      goiY: ['right_clear() trả False khi ô bên phải còn vật.', 'Nam châm tiến tới sát hàng rào rồi lặp hai chuyến: grip(), u_turn(), kick(), u_turn().']
    }),
    man({
      so: 6, ten: 'Theo kịp nam châm', khoa: 0,
      deBai: 'Nam châm tự động (khóa, xem được) bắn lần lượt ba vật sang băng. Vật cuối nằm xa trong kho nên nam châm phải tiến một ô lấy rồi lùi về, chậm hơn hai vật đầu. Tay xoay đứng giữa băng: mỗi vật trượt tới dừng ngay trước mũi. Viết chương trình cho tay xoay đón cả ba vật, đặt từng vật sang ô đích bên phải.',
      veMaMau: 'Chương trình nam châm bị khóa. Viết chương trình R2: chờ vật bằng cảm biến thì một vòng lặp dùng được cho cả ba vật.',
      so_do: ['#############', '#########DDD#', '#.N.NN......#', '#############'], bd: [{ x: 6, y: 2, huong: 3 }, { x: 11, y: 2, huong: 3 }],
      maMau: B(lap('for i in range(2):', NAP).concat(['move()', 'grip()', 'back()', 'u_turn()', 'kick()']), []),
      loiGiai: B(lap('for i in range(2):', NAP).concat(['move()', 'grip()', 'back()', 'u_turn()', 'kick()']), lap('for i in range(3):', DON)),
      hamCuaEmCan: ['grip', 'kick', 'u_turn', 'move', 'back', 'pick', 'drop_right'],
      goiY: ['Vật dừng ngay trước mũi tay xoay thì front_clear() trả False.', 'Đếm nhịp thì mỗi vật một số khác nhau; chờ bằng cảm biến thì một vòng lặp là đủ.']
    }),
    man({
      so: 7, ten: 'Tay xoay chờ cứng',
      deBai: 'Tay xoay đặt hai vật vào ô bàn giao sau hàng rào; nam châm đi đường vòng tới, hút từng vật xuyên rào rồi bắn vào hàng ô đích. Tay xoay được dặn chờ cứng 2 nhịp rồi đặt vật thứ hai, nhưng nam châm tới trễ hơn thế nên ô bàn giao còn vật và tay vẫn cầm. Sửa chương trình tay xoay để chờ ô bàn giao trống, không đoán số nhịp.',
      veMaMau: 'Chương trình nam châm đã đúng. Thay vòng chờ đếm nhịp của tay xoay.',
      so_do: ['##########', '##########', '#.DD...=.#', '#.#####N.#', '#.######N#', '#.########', '##########'], bd: [{ x: 1, y: 5, huong: 0 }, { x: 8, y: 3, huong: 3 }],
      maMau: B(R1_VONG, ['pick_left()', 'drop_right()', 'pick()', 'for i in range(2):', '    wait()', 'drop_right()']),
      loiGiai: B(R1_VONG, ['pick_left()', 'drop_right()', 'pick()', 'while not right_clear():', '    wait()', 'drop_right()']),
      hamCuaEmCan: ['forward', 'move', 'turn_right', 'grip', 'kick', 'u_turn', 'pick', 'pick_left', 'drop_right'],
      goiY: ['Số nhịp đoán đúng ở sân này cũng sai khi đồng đội tới trễ hơn; cảm biến thì luôn biết.', 'while not right_clear(): wait()']
    }),
    man({
      so: 8, ten: 'Sửa thứ tự quay',
      deBai: 'Tay xoay đặt từng vật vào ô bàn giao trước mũi nam châm. Nam châm kéo vật về rồi phải quay mũi lên hàng ô đích phía trên mới bắn, nhưng chương trình bắn trước khi quay nên vật bay ngược về ô bàn giao. Sửa thứ tự trong chương trình nam châm.',
      veMaMau: 'Chương trình tay xoay đã đúng. Chạy thử, xem nhịp kick() mũi nam châm đang quay về đâu.',
      so_do: ['########', '#####D##', '#####D##', '#####.##', '#####..#', '#####N.#', '######N#', '########'], bd: [{ x: 5, y: 4, huong: 1 }, { x: 6, y: 5, huong: 3 }],
      maMau: B(lap('for i in range(2):', ['while front_pole() == "none":', '    wait()', 'grip()', 'kick()', 'turn_left()', 'turn_right()']),
        ['pick_left()', 'drop_right()', 'pick()', 'while not right_clear():', '    wait()', 'drop_right()']),
      loiGiai: B(lap('for i in range(2):', ['while front_pole() == "none":', '    wait()', 'grip()', 'turn_left()', 'kick()', 'turn_right()']),
        ['pick_left()', 'drop_right()', 'pick()', 'while not right_clear():', '    wait()', 'drop_right()']),
      hamCuaEmCan: ['grip', 'kick', 'turn_left', 'turn_right', 'pick', 'pick_left', 'drop_right'],
      goiY: ['kick() bắn vật theo hướng mũi xe đang quay.', 'Quay lên trước rồi mới kick(), bắn xong quay về.']
    }),
    man({
      so: 9, ten: 'Ba vật một băng',
      deBai: 'Ba vật chữ N xếp trong kho phía trên nam châm. Nam châm kéo từng vật, quay sang băng, bắn, quay về kho. Tay xoay đứng giữa băng đón từng vật, đặt sang ô đích bên trái rồi tiến một ô. Viết thẳng từng chuyến thì tràn khung 10 ô: cả hai robot phải lặp.',
      veMaMau: 'Mỗi robot mới có một chuyến. Lặp cho đủ ba vật.',
      so_do: ['##########', '###N######', '###N######', '###N######', '#.........', '######DDD#', '##########'], bd: [{ x: 3, y: 4, huong: 0 }, { x: 8, y: 4, huong: 3 }],
      maMau: B(['grip()', 'turn_right()', 'kick()', 'turn_left()'], CHO_VAT.concat(['pick()', 'drop_left()', 'move()'])),
      loiGiai: B(lap('for i in range(3):', ['grip()', 'turn_right()', 'kick()', 'turn_left()']), lap('for i in range(3):', CHO_VAT.concat(['pick()', 'drop_left()', 'move()']))),
      hamCuaEmCan: ['grip', 'kick', 'turn_right', 'turn_left', 'move', 'pick', 'drop_left'],
      goiY: ['Mỗi chuyến của mỗi robot giống hệt nhau: bọc nó trong for i in range(3).', 'Tay xoay chờ bằng cảm biến trong vòng lặp nên không cần đếm nhịp.']
    }),
    man({
      so: 10, ten: 'Ca dây chuyền',
      deBai: 'Ba sân, mỗi sân một băng: số vật trong kho, độ dài băng và phía hàng ô đích (trên hay dưới tay xoay) khác nhau. Một chương trình cho mỗi robot phải chuyển hết vật vào đích ở cả ba sân.',
      veMaMau: 'Tự viết cả hai chương trình.',
      so_do: [
        ['###########', '########DD#', '#.NN......#', '###########', '###########'],
        ['###########', '###########', '#NNN.....##', '######DDD##', '###########'],
        ['###########', '#######DD##', '#N.N.....##', '###########', '###########']
      ],
      bd: [[{ x: 4, y: 2, huong: 3 }, { x: 4, y: 2, huong: 3 }, { x: 4, y: 2, huong: 3 }], [{ x: 9, y: 2, huong: 3 }, { x: 8, y: 2, huong: 3 }, { x: 8, y: 2, huong: 3 }]],
      maMau: B([], []),
      loiGiai: B(lap('while front_pole() == "N":', NAP),
        lap('for i in range(3):', CHO_VAT.concat(['pick()', 'if right_clear():', '    drop_right()', 'else:', '    drop_left()', 'move()']))),
      hamCuaEmCan: ['grip', 'kick', 'u_turn', 'move', 'pick', 'drop_right', 'drop_left'],
      goiY: ['Nam châm lặp tới khi front_pole() không còn thấy vật chữ N trong kho.', 'Tay xoay hỏi right_clear(): ô đích ở bên phải thì ô đó trống, ở bên trái thì bên phải là tường.'],
      huyHieu: { ma: CHUONG, ten: 'Huy hiệu Đội tay xoay và nam châm' }
    })
  ];

  // ---- chương 2: chế lệnh đội tay xoay. Hàm của em mới (tên cốt truyện, khóa trong kho):
  //   che-doi-tay-xoay.1 load_belt()  = grip(), u_turn(), kick(), u_turn()                         nạp một vật trong kho lên băng rồi quay về kho (5 nhịp)
  //   che-doi-tay-xoay.2 catch_belt() = while front_clear(): wait(); pick(); drop_right(); move()   đón một vật trên băng: chờ, nhặt, đặt sang phải, tiến một ô
  //   che-doi-tay-xoay.3 wait_belt()  = while front_pole() != "none": wait()                       chờ băng trống (không còn vật nam châm trong 3 ô trước mũi)
  // Hàm của màn (chỉ đúng cho một màn, sửa ngay trong màn): 7 load_up() quên ngắt điện, 8 wait_cargo() chờ ngược điều kiện, 9 make_way() quên quay xe trước khi lùi vào hốc.
  var C2 = 'che-' + CHUONG;
  var H_NAP = H('load_belt', NAP), H_DON = H('catch_belt', DON), H_CHO = H('wait_belt', CHO_BANG);
  var DON_TRAI = CHO_VAT.concat(['pick()', 'drop_left()', 'move()', 'catch_belt()']);   // 2.7: vật đầu sang trái (ô đích chỉ tay xoay với tới), vật sau catch_belt()
  var GIAO_PHAI = ['pick_left()', 'drop_right()', 'pick()', 'while not right_clear():', '    wait()', 'drop_right()'];
  var DON_GO_TRAI = ['pick()', 'turn_left()', 'move()', 'drop()', 'back()', 'turn_right()', 'pick_right()', 'drop_left()', 'pick_right()', 'drop()'];   // DON_GO soi gương

  var DS2 = [
    man({
      chuong: C2, so: 1, ten: 'Nạp băng', taoHam: ['load_belt'],
      deBai: 'Em tự chế lệnh load_belt() cho nam châm: kéo một vật chữ N trong kho về, quay đầu, bắn sang băng, rồi quay lại kho. Chương trình nam châm gọi load_belt() hai lần. Tay xoay đã có chương trình đón vật.',
      veMaMau: 'Mở Xưởng hàm, tạo load_belt(), rồi viết chương trình R1 gọi nó hai lần.',
      so_do: ['##########', '#######DD#', '#.NN.....#', '##########'], bd: [{ x: 4, y: 2, huong: 3 }, { x: 8, y: 2, huong: 3 }],
      maMau: B([], lap('for i in range(2):', DON)),
      loiGiai: BM(lap('for i in range(2):', ['load_belt()']), lap('for i in range(2):', DON), [H_NAP]),
      hamCuaEmCan: ['grip', 'kick', 'u_turn', 'pick', 'drop_right', 'move'],
      goiY: ['grip() kéo vật chữ N về mũi, kick() đổi cực nên vật bị bắn ra rồi ngắt điện.', 'Thân hàm: grip(), u_turn(), kick(), u_turn()']
    }),
    man({
      chuong: C2, so: 2, ten: 'Đón băng', taoHam: ['catch_belt'],
      deBai: 'Nam châm nạp ba vật lên băng bằng load_belt(). Em tự chế lệnh catch_belt() cho tay xoay: chờ tới khi có vật trước mũi, nhặt, đặt sang ô đích bên phải rồi tiến một ô. Chương trình tay xoay gọi catch_belt() ba lần.',
      veMaMau: 'Mở Xưởng hàm, tạo catch_belt(), rồi viết chương trình R2 gọi nó ba lần.',
      so_do: ['###########', '#######DDD#', '#NNN......#', '###########'], bd: [{ x: 4, y: 2, huong: 3 }, { x: 9, y: 2, huong: 3 }],
      maMau: B(lap('for i in range(3):', ['load_belt()']), []),
      loiGiai: BM(lap('for i in range(3):', ['load_belt()']), lap('for i in range(3):', ['catch_belt()']), [H_DON]),
      hamCuaEmCan: ['load_belt', 'grip', 'kick', 'u_turn', 'pick', 'drop_right', 'move'],
      goiY: ['Vật dừng ngay trước mũi thì front_clear() trả False: chờ ngay trong hàm.', 'Thân hàm: while front_clear(): wait(), pick(), drop_right(), move()']
    }),
    man({
      chuong: C2, so: 3, ten: 'Lệnh chờ băng', taoHam: ['wait_belt'],
      deBai: 'Kho nằm bên phải nam châm, băng chạy sang trái tới ô bàn giao sát tường, ngay bên phải tay xoay. Tay xoay còn bận dọn khúc gỗ trên ô đích trước mặt: bắn vật thứ hai sớm thì hai vật ùn lại. Em tự chế lệnh chờ wait_belt(): chờ tới khi không còn vật nam châm nào trong 3 ô trước mũi, rồi gọi nó ngay trước kick().',
      veMaMau: 'Chạy thử: vật thứ hai dừng giữa băng. Mở Xưởng hàm, tạo wait_belt(), rồi gọi nó trong chương trình R1.',
      so_do: ['#########', '#########', '##....NN#', '#W.######', '##D######', '##.######', '#########'], bd: [{ x: 5, y: 2, huong: 1 }, { x: 2, y: 3, huong: 3 }],
      maMau: B(lap('for i in range(2):', NAP), DON_GO_TRAI),
      loiGiai: BM(lap('for i in range(2):', ['grip()', 'u_turn()', 'wait_belt()', 'kick()', 'u_turn()']), DON_GO_TRAI, [H_CHO]),
      hamCuaEmCan: ['grip', 'kick', 'u_turn', 'move', 'back', 'turn_left', 'turn_right', 'pick', 'drop', 'pick_right', 'drop_left'],
      goiY: ['front_pole() thấy vật nam châm trong 3 ô trước mũi, kể cả vật nằm ở ô bàn giao.', 'Thân hàm: while front_pole() != "none": wait()']
    }),
    man({
      chuong: C2, so: 4, ten: 'Cả đội vào ca',
      deBai: 'Nam châm đứng quay mũi ra băng, tay xoay đứng xa quá một ô nên vật trượt chưa tới mũi. Mỗi robot chỉnh chỗ đứng một lần rồi lặp lệnh đã chế của mình cho đủ ba vật.',
      veMaMau: 'Tự viết cả hai chương trình bằng load_belt() và catch_belt().',
      so_do: ['############', '#######DDD##', '#NNN.......#', '############'], bd: [{ x: 4, y: 2, huong: 1 }, { x: 10, y: 2, huong: 3 }],
      maMau: B([], []),
      loiGiai: B(['u_turn()'].concat(lap('for i in range(3):', ['load_belt()'])), ['move()'].concat(lap('for i in range(3):', ['catch_belt()']))),
      hamCuaEmCan: ['load_belt', 'catch_belt', 'u_turn', 'move'],
      goiY: ['Vật bắn ra trượt tối đa 3 ô: tay xoay phải đứng trong tầm đó.', 'Nam châm quay về kho trước khi lặp load_belt().']
    }),
    man({
      chuong: C2, so: 5, ten: 'Tay xoay tự động', khoa: 1,
      deBai: 'Tay xoay tự động (khóa, xem được) gọi catch_belt() ba lần. Hai vật nằm trong kho bên trái nam châm, vật thứ ba nằm phía trên. Viết chương trình nam châm nạp đủ ba vật lên băng cho tay xoay đón.',
      veMaMau: 'Chương trình tay xoay bị khóa. Viết chương trình R1.',
      so_do: ['###########', '#####N#####', '#####.#DDD#', '#..NN.....#', '###########'], bd: [{ x: 5, y: 3, huong: 3 }, { x: 9, y: 3, huong: 3 }],
      maMau: B([], lap('for i in range(3):', ['catch_belt()'])),
      loiGiai: B(lap('for i in range(2):', ['load_belt()']).concat(['turn_right()', 'grip()', 'turn_right()', 'kick()']), lap('for i in range(3):', ['catch_belt()'])),
      hamCuaEmCan: ['load_belt', 'catch_belt', 'grip', 'kick', 'turn_right'],
      goiY: ['Sau hai lần load_belt() mũi nam châm quay về kho bên trái; vật thứ ba ở phía trên.', 'Quay phải, grip(), quay phải lần nữa là mũi hướng ra băng.']
    }),
    man({
      chuong: C2, so: 6, ten: 'Xếp hàng bằng nạp băng',
      deBai: 'Đổi chiều dây chuyền: tay xoay đặt hai vật vào ô bàn giao bên phải. Ô bàn giao nằm sau hàng rào, nam châm hút xuyên rào được. Nam châm tới trễ, rồi load_belt() kéo từng vật về, bắn sang hàng ô đích phía sau. Ô bàn giao còn vật thì tay xoay chờ.',
      veMaMau: 'Tự viết cả hai chương trình.',
      so_do: ['##############', '##############', '####.=...DD..#', '###N.#########', '####N#########', '##############'], bd: [{ x: 12, y: 2, huong: 3 }, { x: 4, y: 3, huong: 3 }],
      maMau: B([], []),
      loiGiai: B(['forward(6)'].concat(lap('for i in range(2):', ['load_belt()'])), GIAO_PHAI),
      hamCuaEmCan: ['load_belt', 'forward', 'move', 'pick', 'pick_left', 'drop_right'],
      goiY: ['load_belt() kéo vật ở ô bàn giao về, quay đầu bắn ra phía sau rồi quay lại.', 'Tay xoay hỏi right_clear() trước khi đặt vật thứ hai.']
    }),
    man({
      chuong: C2, so: 7, ten: 'Sửa hàm nạp',
      deBai: 'Kho nằm phía trên nam châm. Hàm của màn load_up() nạp một vật lên băng nhưng quên ngắt điện: quay về kho mà cực N còn bật nên vật chữ N trong kho bị đẩy ra xa, ngoài tầm. Sửa load_up(). Tay xoay đặt vật thứ nhất xuống ô đích bên trái, vật thứ hai sang bên phải.',
      veMaMau: 'Hai chương trình chính đã đúng. Mở Xưởng hàm, sửa load_up().',
      so_do: ['#########', '###.#####', '###.#####', '###N#####', '###N##D##', '###.....#', '#######D#', '#########'], bd: [{ x: 3, y: 5, huong: 0 }, { x: 7, y: 5, huong: 3 }],
      maMau: B(lap('for i in range(2):', ['load_up()']), DON_TRAI, [H('load_up', ['grip()', 'turn_right()', 'magnet_n()', 'wait()', 'turn_left()'])]),
      loiGiai: B(lap('for i in range(2):', ['load_up()']), DON_TRAI, [H('load_up', ['grip()', 'turn_right()', 'kick()', 'turn_left()'])]),
      hamCuaEmCan: ['catch_belt', 'grip', 'kick', 'turn_right', 'turn_left', 'pick', 'drop_left', 'move'],
      goiY: ['Nam châm còn bật thì cuối mỗi nhịp lại hút hay đẩy vật trước mũi.', 'kick() bắn vật rồi ngắt điện luôn.']
    }),
    man({
      chuong: C2, so: 8, ten: 'Sửa hàm chờ', khoa: 0,
      deBai: 'Nam châm tự động (khóa) gọi wait_cargo() rồi load_belt() cho từng vật tay xoay đặt vào ô bàn giao. Hàm của màn wait_cargo() chờ ngược điều kiện nên nam châm kéo hụt khi chưa có vật, rồi đứng chờ mãi. Sửa wait_cargo() để chờ tới khi có vật trước mũi.',
      veMaMau: 'Chương trình nam châm bị khóa, tay xoay đã đúng. Mở Xưởng hàm, sửa wait_cargo().',
      so_do: ['#######', '###N###', '##N..##', '####.##', '####.##', '####.##', '####D##', '####D##', '#######'], bd: [{ x: 4, y: 3, huong: 0 }, { x: 3, y: 2, huong: 0 }],
      maMau: B(lap('for i in range(2):', ['wait_cargo()', 'load_belt()']), GIAO_PHAI, [H('wait_cargo', ['while not front_clear():', '    wait()'])]),
      loiGiai: B(lap('for i in range(2):', ['wait_cargo()', 'load_belt()']), GIAO_PHAI, [H('wait_cargo', CHO_VAT)]),
      hamCuaEmCan: ['load_belt', 'grip', 'kick', 'u_turn', 'pick', 'pick_left', 'drop_right'],
      goiY: ['Có vật trước mũi thì front_clear() trả False.', 'Chờ khi ô trước mũi còn trống: while front_clear(): wait()']
    }),
    man({
      chuong: C2, so: 9, ten: 'Lùi vào hốc nhường đường', mucTieu: 'toi-co', co: [[{ x: 8, y: 1 }], [{ x: 1, y: 1 }]],
      deBai: 'Hai robot đổi đầu hành lang: nam châm tới cờ bên phải, tay xoay tới cờ bên trái (mỗi cờ có vạch màu của robot được tới). Hành lang chỉ rộng một ô; hốc bên dưới có vật sắt. Tay xoay dời vật sắt ra hành lang bằng make_way() rồi lùi vào hốc; nam châm hút vật sắt, đi qua; tay xoay ra khỏi hốc về cờ. Hàm make_way() của màn đang quên quay xe.',
      veMaMau: 'Chương trình tay xoay đã có, make_way() còn sai. Sửa make_way() và viết chương trình nam châm.',
      so_do: ['##########', '#F......F#', '#####s####', '##########'], bd: [{ x: 2, y: 1, huong: 1 }, { x: 7, y: 1, huong: 3 }],
      maMau: B([], ['forward(2)', 'make_way()', 'while front_clear():', '    wait()', 'while not front_clear():', '    wait()', 'move()', 'turn_left()', 'forward(4)'], [H('make_way', ['pick_left()', 'drop()', 'back()'])]),
      loiGiai: B(['while not front_metal():', '    wait()', 'grip()', 'forward(6)'],
        ['forward(2)', 'make_way()', 'while front_clear():', '    wait()', 'while not front_clear():', '    wait()', 'move()', 'turn_left()', 'forward(4)'], [H('make_way', ['pick_left()', 'drop()', 'turn_right()', 'back()'])]),
      hamCuaEmCan: ['grip', 'forward', 'move', 'back', 'turn_right', 'turn_left', 'pick_left', 'drop'],
      goiY: ['Muốn lùi vào hốc phía dưới thì xe phải quay mặt lên trên trước.', 'Nam châm chờ thấy vật sắt (front_metal()), hút nó rồi mới đi: lúc đó tay xoay đã vào hốc.']
    }),
    man({
      chuong: C2, so: 10, ten: 'Ca dây chuyền tự chế',
      deBai: 'Ba sân: nam châm lúc quay mũi về kho, lúc quay ra băng; số vật trong kho khác nhau; tay xoay lúc quay mặt vào băng, lúc quay lưng lại. Một chương trình cho mỗi robot, dùng các lệnh đã chế, phải chuyển hết vật vào đích ở cả ba sân.',
      veMaMau: 'Tự viết cả hai chương trình.',
      so_do: [
        ['###########', '########DD#', '#.NN......#', '###########'],
        ['###########', '######DDD##', '#NNN.....##', '###########'],
        ['###########', '########DD#', '#N.N......#', '###########']
      ],
      bd: [[{ x: 4, y: 2, huong: 3 }, { x: 4, y: 2, huong: 1 }, { x: 4, y: 2, huong: 3 }], [{ x: 9, y: 2, huong: 3 }, { x: 8, y: 2, huong: 1 }, { x: 9, y: 2, huong: 1 }]],
      maMau: B([], []),
      loiGiai: B(['if front_pole() == "none":', '    u_turn()'].concat(lap('while front_pole() == "N":', ['load_belt()'])),
        ['if not front_clear():', '    u_turn()'].concat(lap('for i in range(3):', ['catch_belt()']))),
      hamCuaEmCan: ['load_belt', 'catch_belt', 'u_turn'],
      goiY: ['Nam châm quay mũi ra băng thì front_pole() trả "none": quay đầu về kho trước.', 'Tay xoay quay lưng vào tường thì front_clear() trả False.'],
      huyHieu: { ma: C2, ten: 'Huy hiệu Chế lệnh đội tay xoay' }
    })
  ];

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'che-tay-xoay', ds: DS.concat(DS2),
    chuong: [{ ma: CHUONG, ten: 'Đội tay xoay và nam châm' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội tay xoay' }],
    goi: { ma: CHUONG, ten: 'Đội tay xoay và nam châm', hinh: 'tay-xoay' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

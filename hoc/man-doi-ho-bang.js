/* ============================================================================
   man-doi-ho-bang.js — "Robot Chấn Hưng": GÓI ĐỘI VƯỢT HỐ VÀ BĂNG CHUYỀN (20 màn, sau gói Thân nhện): chương `doi-ho-bang` (phối hợp, 10 màn dưới đây)
   và chương `che-doi-ho-bang` "Chế lệnh đội vượt hố" (10 màn, khối chương 2 ở cuối tệp; máy kiểm riêng kiem-doi-ho-bang.mjs).
   Hai robot khác thân: R1 là xe hai bánh (tay kẹp, cảm biến khoảng cách ở hông) đi được băng chuyền nhưng rơi xuống hố;
   R2 là nhện (màn 3 trở đi có tay kẹp) bật qua hố, chui gầm thấp nhưng không có cảm biến. Mỗi robot một chương trình, chạy theo nhịp chung.
   Nhện không hỏi được gì nên chương trình của nhện cố định; xe là robot biết chờ: thấy vật / đồng đội trước mặt bằng front_clear().

   Mười màn (lời giải chuẩn):
     1  Hai làn, hai thân        toi-co   R1 đã có go_wall() trên băng; em viết cú nhảy của nhện
     2  Chui gầm, xuôi băng      toi-co   R2 đã có crawl(); em đưa xe qua khúc quanh có băng
     3  Nhện chở hàng qua hố     dua-vat  hai làn riêng: nhện pick, đi, jump, drop; xe đã có chương trình
     4  Bàn giao qua hố          dua-vat  nhện mang hộp qua hố đặt trước mũi xe; xe chờ bằng while front_clear(): wait()
     5  Xe giao, nhện chở        dua-vat  xe đặt hộp ở mép hố trước khi nhện tới; nhện đi đường vòng rồi chở hộp qua hố
     6  Hai hộp, hai chuyến      dua-vat  bàn giao hai lần: nhện quay về lấy hộp thứ hai, xe chờ lại bằng cảm biến
     7  Sửa cú nhảy              dua-vat  crouch(); stand() cùng nhịp không phải cú nhảy: nhện rơi xuống hố
     8  Sửa giờ chờ              dua-vat  xe đếm wait() cứng nên gắp hụt: đổi sang chờ bằng cảm biến
     9  Qua gầm rồi qua hố       dua-vat  nhện chui gầm, nhận hộp xe vừa đặt, bật qua hố tới đích
     10 Ca vượt địa hình         dua-vat  trùm ba sân: phần nhện giống nhau, đường xe tới đích khác nhau; xe chờ và chọn hướng bằng cảm biến

   Tệp chỉ khai báo chương (ManHoc.chuongThem); lo-trinh-hoc.js chèn nó ngay sau che-nhen (gói ngay sau gói Thân nhện). Bản gốc thu-tu-chuong.js
   không đổi để mọi id cũ giữ nguyên cho các máy kiểm chương. Màn dùng chung khung dữ liệu nhiều robot của man-hai-robot.js: man.doi = [phần riêng R1, phần riêng R2].
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-ho-bang';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {
    'doi-ho-bang.1': { o: 21, nhip: 7 },
    'doi-ho-bang.2': { o: 27, nhip: 9 },
    'doi-ho-bang.3': { o: 37, nhip: 8 },
    'doi-ho-bang.4': { o: 44, nhip: 17 },
    'doi-ho-bang.5': { o: 39, nhip: 18 },
    'doi-ho-bang.6': { o: 50, nhip: 28 },
    'doi-ho-bang.7': { o: 44, nhip: 18 },
    'doi-ho-bang.8': { o: 41, nhip: 18 },
    'doi-ho-bang.9': { o: 38, nhip: 13 },
    'doi-ho-bang.10': { o: 51, nhip: 65 },
    'che-doi-ho-bang.1': { o: 34, nhip: 10 },
    'che-doi-ho-bang.2': { o: 45, nhip: 15 },
    'che-doi-ho-bang.3': { o: 44, nhip: 14 },
    'che-doi-ho-bang.4': { o: 45, nhip: 27 },
    'che-doi-ho-bang.5': { o: 41, nhip: 24 },
    'che-doi-ho-bang.6': { o: 45, nhip: 30 },
    'che-doi-ho-bang.7': { o: 45, nhip: 20 },
    'che-doi-ho-bang.8': { o: 46, nhip: 16 },
    'che-doi-ho-bang.9': { o: 27, nhip: 23 },
    'che-doi-ho-bang.10': { o: 49, nhip: 65 }
  };
  // @sao-cuoi

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand'];
  var XE = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] }, hamGoc: BANH.concat(TAY, BA_HUONG) };
  var NHEN_TRAN = { loaiRobot: 'nhen', robot: { than: 'nhen', tay: null }, hamGoc: NHEN };
  var NHEN_KEP = { loaiRobot: 'nhen', robot: { than: 'nhen', tay: 'kep' }, hamGoc: NHEN.concat(TAY) };

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  /** Bài làm hai robot; hm: hàm của màn (chương 2). */
  function B(c1, c2, hm) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: (hm || []).map(sao) }; }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  var CHO_HANG = ['while front_clear():', '    wait()'];

  /** m.bd: [batDau xe, batDau nhện]; m.nhen: NHEN_TRAN | NHEN_KEP; m.khoa: số thứ tự robot tự động khóa (chương trình = maMau.doi[khoa]);
   *  m.co: [cờ riêng xe, cờ riêng nhện] (mảng ô {x, y}). */
  function man(m) {
    var bd = m.bd, nhen = m.nhen || NHEN_KEP, khoa = m.khoa, co = m.co, taoHam = m.taoHam || [];
    delete m.bd; delete m.nhen; delete m.khoa; delete m.co;
    m.chuong = m.chuong || CHUONG;                                         // chương 2 của gói khai chuong: 'che-' + CHUONG
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'dua-vat';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    m.doi = [Object.assign({ batDau: bd[0] }, sao(XE)), Object.assign({ batDau: bd[1] }, sao(nhen))];
    if (khoa !== undefined) m.doi[khoa].coDinh = true;
    if (co) co.forEach(function (c, i) { if (c) m.doi[i].co = sao(c); });
    // Cấp ngoài là của R1 để mã đọc màn một robot không vỡ.
    m.batDau = bd[0]; m.loaiRobot = XE.loaiRobot; m.robot = sao(XE.robot); m.hamGoc = XE.hamGoc.slice();
    m.taoHam = taoHam; m.loiSai = [];
    m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    m.sao = SAO[m.chuong + '.' + m.so] || { o: 1, nhip: 1 };
    return ManHoc.chuanHoa(m);
  }

  var NHEN_GIAO = ['pick()', 'walk("RR")', 'jump("R")', 'drop()'];
  var XE_NHAN = ['pick()', 'turn_left()', 'go_wall()', 'turn_right()', 'drop()'];

  var DS = [
    man({
      so: 1, ten: 'Hai làn, hai thân', mucTieu: 'toi-co', nhen: NHEN_TRAN,
      deBai: 'Hai robot ở hai làn riêng. Xe bánh đã có chương trình đi trên băng chuyền. Làn của nhện có một hố: viết chương trình cho nhện bật qua hố tới cờ.',
      veMaMau: 'Chạy thử: xe tới cờ, nhện đứng yên. Viết chương trình R2.',
      san: ['#######', '#..u.F#', '#######', '#.>>>F#', '#######'], bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: B(['go_wall()'], []), loiGiai: B(['go_wall()'], ['go("R")', 'jump("R")', 'go("R")']),
      hamCuaEmCan: ['go_wall', 'go', 'jump'],
      goiY: ['jump(d) bật qua đúng một ô, nên nhện phải đứng sát hố trước khi nhảy.', 'go("R"), jump("R"), go("R")']
    }),
    man({
      so: 2, ten: 'Chui gầm, xuôi băng', mucTieu: 'toi-co', nhen: NHEN_TRAN,
      deBai: 'Nhện đã có chương trình chui qua gầm thấp. Xe không vào được gầm nhưng có làn riêng: đi tới tường, rẽ phải rồi để băng chuyền đưa xe tới cờ.',
      veMaMau: 'Chương trình R2 đã xong. Viết chương trình R1.',
      san: ['#######', '#.n..F#', '#######', '#..>>.#', '#####v#', '#####F#', '#######'], bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: B([], ['crawl("R")', 'walk("RR")']), loiGiai: B(['go_wall()', 'turn_right()', 'go_wall()'], ['crawl("R")', 'walk("RR")']),
      hamCuaEmCan: ['go_wall', 'turn_right', 'crawl', 'walk'],
      goiY: ['Băng chuyền đẩy xe theo mũi tên nên xe đi nhanh hơn.', 'go_wall(), turn_right(), go_wall()']
    }),
    man({
      so: 3, ten: 'Nhện chở hàng qua hố',
      deBai: 'Mỗi robot chở một hộp vào ô đích ở làn của mình. Tay kẹp của nhện luôn quay về bên phải. Nhện nhặt hộp, đi tới sát hố, bật qua rồi thả hộp vào đích.',
      veMaMau: 'Chương trình của xe đã xong. Viết chương trình cho nhện.',
      san: ['#######', '#.ou.D#', '#######', '#.o>>.#', '#####D#', '#######'], bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: B(['pick()', 'go_wall()', 'turn_right()', 'drop()'], []),
      loiGiai: B(['pick()', 'go_wall()', 'turn_right()', 'drop()'], ['pick()', 'go("R")', 'jump("R")', 'drop()']),
      hamCuaEmCan: ['pick', 'drop', 'go_wall', 'turn_right', 'go', 'jump'],
      goiY: ['Nhặt xong thì ô hộp trống, nhện bước vào được.', 'Nhện vẫn nhảy được khi đang kẹp hộp.']
    }),
    man({
      so: 4, ten: 'Bàn giao qua hố',
      deBai: 'Chỉ nhện qua được hố để lấy hộp. Nhện mang hộp qua hố, đặt ngay trước mũi xe. Xe chờ tới khi thấy hộp, rồi nhặt và đưa xuống băng chuyền vào ô đích.',
      veMaMau: 'Chạy thử: xe nhặt hụt vì hộp chưa tới. Thêm vòng chờ cho xe.',
      san: ['#########', '#.o.u...#', '#######v#', '#######v#', '######D.#', '#########'], bd: [{ x: 7, y: 1, huong: 3 }, { x: 1, y: 1, huong: 1 }],
      maMau: B(XE_NHAN, NHEN_GIAO), loiGiai: B(CHO_HANG.concat(XE_NHAN), NHEN_GIAO),
      hamCuaEmCan: ['pick', 'drop', 'turn_left', 'turn_right', 'go_wall', 'walk', 'jump'],
      goiY: ['Hộp nằm trước mũi xe thì front_clear() trả False.', 'while front_clear(): wait() đặt trước pick().']
    }),
    man({
      so: 5, ten: 'Xe giao, nhện chở',
      deBai: 'Lần này hộp ở phía xe. Xe nhặt hộp, đi băng chuyền rồi đặt hộp xuống ô dưới mũi. Nhện đi đường vòng tới ngay dưới ô đó, nhặt hộp, bật qua hố rồi thả vào đích. Tay nhện quay lên trên.',
      veMaMau: 'Nhện mới đi tới chỗ nhận hàng. Viết chương trình cho xe và phần còn lại của nhện.',
      san: ['#########', '#.o>>.###', '#####.#D#', '#####.u.#', '#####.###', '#.....###', '#########'], bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 5, huong: 0 }],
      maMau: B([], ['walk("RRRRUU")']), loiGiai: B(['pick()', 'go_wall()', 'turn_right()', 'drop()'], ['walk("RRRRUU")', 'pick()', 'jump("R")', 'drop()']),
      hamCuaEmCan: ['pick', 'drop', 'go_wall', 'turn_right', 'walk', 'jump'],
      goiY: ['Xe đi băng chuyền nhanh nên đặt hộp xong trước khi nhện tới.', 'Nhện đứng ngay dưới hộp: pick(), jump("R"), drop().']
    }),
    man({
      so: 6, ten: 'Hai hộp, hai chuyến',
      deBai: 'Nhện mang lần lượt hai hộp qua hố, mỗi lần đặt ở cùng một ô trước mũi xe. Xe chờ hộp thứ nhất, đặt lên đích phía trên, rồi chờ hộp thứ hai và đặt xuống đích phía dưới.',
      veMaMau: 'Chương trình đã chuyền xong hộp thứ nhất. Viết tiếp chuyến thứ hai cho cả hai robot.',
      san: ['#########', '###.o##D#', '#.o.u...#', '#######D#', '#########'], bd: [{ x: 7, y: 2, huong: 3 }, { x: 1, y: 2, huong: 1 }],
      maMau: B(CHO_HANG.concat(['put_right()']), NHEN_GIAO),
      loiGiai: B(CHO_HANG.concat(['put_right()'], CHO_HANG, ['pick()', 'turn_left()', 'drop()']),
        NHEN_GIAO.concat(['jump("L")', 'go("U")', 'pick()', 'go("D")', 'jump("R")', 'drop()'])),
      hamCuaEmCan: ['pick', 'drop', 'put_right', 'turn_left', 'walk', 'go', 'jump'],
      goiY: ['Hộp thứ hai nằm phía trên mép hố. Nhện nhảy về, đi lên một ô rồi nhặt.', 'Xe dùng lại vòng chờ trước khi nhặt hộp thứ hai.']
    }),
    man({
      so: 7, ten: 'Sửa cú nhảy',
      deBai: 'Nhện phải bật qua hai hố rồi đặt hộp trước mũi xe, nhưng nhện rơi ở hố thứ hai. Tìm chỗ sai trong chương trình nhện và sửa.',
      veMaMau: 'Chương trình xe đã đúng. Chạy thử rồi sửa chương trình nhện.',
      san: ['#############', '###########D#', '#.ou.u...>>.#', '#############'], bd: [{ x: 8, y: 2, huong: 3 }, { x: 1, y: 2, huong: 1 }],
      maMau: B(CHO_HANG.concat(['pick()', 'u_turn()', 'go_wall()', 'turn_left()', 'drop()']), ['pick()', 'go("R")', 'jump("R")', 'crouch()', 'stand()', 'go("R")', 'drop()']),
      loiGiai: B(CHO_HANG.concat(['pick()', 'u_turn()', 'go_wall()', 'turn_left()', 'drop()']), ['pick()', 'go("R")', 'jump("R")', 'jump("R")', 'drop()']),
      hamCuaEmCan: ['pick', 'drop', 'u_turn', 'go_wall', 'turn_left', 'go', 'jump'],
      goiY: ['Mỗi nhịp chân chỉ nhận một lệnh: co rồi duỗi ngay trong cùng nhịp là sai.', 'Thay ba dòng đó bằng jump("R").']
    }),
    man({
      so: 8, ten: 'Sửa giờ chờ',
      deBai: 'Xe được dặn chờ 4 nhịp rồi nhặt hộp, nhưng nhện chui gầm và bật qua hố lâu hơn thế nên xe gắp hụt. Sửa chương trình xe để chờ đúng lúc hộp tới, không đoán số nhịp.',
      veMaMau: 'Chương trình nhện đã đúng. Thay vòng chờ đếm nhịp của xe.',
      san: ['###########', '#.on.u...##', '########v##', '########v##', '########.D#', '###########'], bd: [{ x: 8, y: 1, huong: 3 }, { x: 1, y: 1, huong: 1 }],
      maMau: B(['for i in range(4):', '    wait()', 'pick()', 'turn_left()', 'go_wall()', 'turn_left()', 'drop()'], ['pick()', 'go("R")', 'crawl_jump("R")', 'drop()']),
      loiGiai: B(CHO_HANG.concat(['pick()', 'turn_left()', 'go_wall()', 'turn_left()', 'drop()']), ['pick()', 'go("R")', 'crawl_jump("R")', 'drop()']),
      hamCuaEmCan: ['pick', 'drop', 'turn_left', 'go_wall', 'go', 'crawl_jump'],
      goiY: ['Cảm biến biết lúc hộp tới; số nhịp đoán thì dễ sai.', 'while front_clear(): wait()']
    }),
    man({
      so: 9, ten: 'Nhện đếm nhịp',
      deBai: 'Xe chở hộp qua băng chuyền rồi đặt xuống ngay trên đầu nhện. Nhện không có cảm biến nên không biết hộp tới lúc nào: cho nhện chờ đủ số nhịp xe cần, rồi nhặt hộp, bật qua hố và thả vào đích.',
      veMaMau: 'Chạy thử: nhện gắp hụt vì hộp chưa tới. Đếm nhịp của xe rồi thêm vòng chờ cho nhện.',
      san: ['##########', '#.o>>>.###', '######.#D#', '######.u.#', '##########'], bd: [{ x: 1, y: 1, huong: 1 }, { x: 6, y: 3, huong: 0 }],
      maMau: B(['pick()', 'go_wall()', 'turn_right()', 'drop()'], ['pick()', 'jump("R")', 'drop()']),
      loiGiai: B(['pick()', 'go_wall()', 'turn_right()', 'drop()'], ['for i in range(7):', '    wait()', 'pick()', 'jump("R")', 'drop()']),
      hamCuaEmCan: ['pick', 'drop', 'go_wall', 'turn_right', 'jump'],
      goiY: ['Bấm chạy từng nhịp và xem nhịp nào hộp nằm xuống ô trên đầu nhện.', 'Chờ ít quá thì gắp hụt; chờ nhiều quá vẫn thắng nhưng mất sao nhịp.']
    }),
    man({
      so: 10, ten: 'Ca vượt địa hình',
      deBai: 'Ba sân có cùng làn của nhện: hai hố và một gầm thấp. Đường băng của xe tới đích dài ngắn khác nhau, đích lúc ở bên này lúc ở bên kia. Một chương trình cho mỗi robot phải giao hộp vào đích ở cả ba sân.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: [
        ['#############', '#.ou.n.u...##', '##########v##', '##########.D#', '#############', '#############', '#############'],
        ['#############', '#.ou.n.u...##', '##########v##', '##########v##', '##########v##', '#########D.##', '#############'],
        ['#############', '#.ou.n.u...##', '##########v##', '##########.##', '##########.D#', '#############', '#############']
      ],
      bd: [[{ x: 10, y: 1, huong: 3 }, { x: 10, y: 1, huong: 3 }, { x: 10, y: 1, huong: 3 }], [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }]],
      maMau: B([], []),
      loiGiai: B(CHO_HANG.concat(['pick()', 'turn_left()', 'go_wall()', 'if left_clear():', '    turn_left()', 'else:', '    turn_right()', 'drop()']),
        ['pick()', 'go("R")', 'jump("R")', 'crawl_jump("R")', 'drop()']),
      hamCuaEmCan: ['pick', 'drop', 'turn_left', 'turn_right', 'go_wall', 'go', 'jump', 'crawl_jump'],
      goiY: ['Làn nhện giống nhau ở cả ba sân nên chương trình nhện không cần hỏi gì.', 'Xuống hết băng rồi hỏi left_clear() để biết đích ở bên nào.'],
      huyHieu: { ma: CHUONG, ten: 'Huy hiệu Đội vượt hố và băng chuyền' }
    })
  ];

  /* ------------------------------------------------------------ chương 2 `che-doi-ho-bang`: CHẾ LỆNH ĐỘI VƯỢT HỐ (KE-HOACH-PHOI-HOP.md §3b)
     Hàm của em MỚI (tên cốt truyện):
       1 hop_box(d)  = pick(), jump(d), drop()               nhện nhặt hộp ở cạnh tay, bật qua hố theo hướng d rồi đặt hộp xuống (7 nhịp)
       2 take_box()  = while front_clear(): wait(), pick()   xe chờ tới khi thấy hộp trước mũi rồi nhặt
       3 pause(n)    = for i in range(n): wait()             nhện không có cảm biến: đứng chờ đúng n nhịp */
  var T_HOP = ['pick()', 'jump(d)', 'drop()'];
  var T_TAKE = CHO_HANG.concat(['pick()']);
  var T_PAUSE = ['for i in range(n):', '    wait()'];
  function hHop(than) { return H('hop_box', ['d'], than || T_HOP); }
  function hTake(than) { return H('take_box', [], than || T_TAKE); }
  function hPause(than) { return H('pause', ['n'], than || T_PAUSE); }
  function lg(bai, ham) { bai.hamCuaEmMoi = ham || []; return bai; }
  var CHE = 'che-' + CHUONG;

  var XE_3 = ['pick()', 'u_turn()', 'go_wall()', 'turn_left()', 'drop()'];
  var XE_7 = ['take_box()', 'turn_right()', 'go_wall()', 'turn_left()', 'drop()'];
  var XE_8 = ['pick()', 'turn_left()', 'go_wall()', 'turn_right()', 'go_wall()', 'turn_left()', 'drop()'];
  // hàm của màn: 7 hop_two(d) viết cứng "R" (quên dùng tham số); 8 meet() chờ quá ít nhịp
  function hHopTwo(than) { return H('hop_two', ['d'], than || ['hop_box("R")', 'hop_box("R")']); }
  function hMeet(than) { return H('meet', [], than || ['pause(4)', 'hop_box("R")']); }

  DS = DS.concat([
    man({
      so: 1, chuong: CHE, ten: 'Chở hộp qua hố', khoa: 0, taoHam: ['hop_box'],
      deBai: 'Xe tự động đã có chương trình: chờ hộp rồi đưa vào đích. Em chế hop_box(d) để nhện nhặt hộp trên đầu, bật qua hố theo hướng d rồi đặt hộp xuống trước mũi xe; chương trình nhện chỉ cần gọi hop_box("R").',
      veMaMau: 'Chương trình xe bị khóa. Mở Xưởng hàm, tạo hop_box(d), rồi viết chương trình nhện gọi nó.',
      san: ['#######', '#o#..D#', '#.u.###', '#######'], bd: [{ x: 4, y: 1, huong: 3 }, { x: 1, y: 2, huong: 0 }],
      maMau: B(CHO_HANG.concat(['pick()', 'u_turn()', 'drop()']), []),
      loiGiai: lg(B(CHO_HANG.concat(['pick()', 'u_turn()', 'drop()']), ['hop_box("R")']), [hHop()]),
      hamCuaEmCan: ['pick', 'drop', 'u_turn', 'jump'],
      goiY: ['Tay nhện quay lên trên: hộp nằm ngay trên đầu nhện.', 'pick(), jump(d), drop(): nhặt, nhảy, đặt.']
    }),
    man({
      so: 2, chuong: CHE, ten: 'Chờ hộp tới', khoa: 1, taoHam: ['take_box'],
      deBai: 'Nhện tự động đã có chương trình: bước tới trên hộp rồi dùng hop_box("R") mang hộp qua hố, đặt xuống trước mũi xe. Tay nhện quay xuống dưới. Em chế take_box() cho xe: chờ tới khi thấy hộp rồi nhặt. Nhặt xong, xe quay đầu, đi băng chuyền tới cuối rồi thả hộp xuống ô đích phía dưới.',
      veMaMau: 'Chương trình nhện bị khóa. Tạo take_box() trong Xưởng hàm rồi viết tiếp chương trình xe.',
      san: ['#########', '#..u.####', '##o#..>.#', '#######D#', '#########'], bd: [{ x: 5, y: 2, huong: 3 }, { x: 1, y: 1, huong: 2 }],
      maMau: B(['take_box()'], ['go("R")', 'hop_box("R")']),
      loiGiai: lg(B(['take_box()', 'u_turn()', 'go_wall()', 'turn_right()', 'drop()'], ['go("R")', 'hop_box("R")']), [hTake()]),
      hamCuaEmCan: ['pick', 'drop', 'u_turn', 'go_wall', 'turn_right', 'go', 'hop_box'],
      goiY: ['Hộp tới trước mũi thì front_clear() trả False.', 'Chờ bằng while front_clear(): wait(), rồi pick().']
    }),
    man({
      so: 3, chuong: CHE, ten: 'Đếm nhịp của xe', khoa: 0, taoHam: ['pause'],
      deBai: 'Xe tự động chở hộp qua băng chuyền rồi đặt xuống ngay trên đầu nhện. Nhện không có cảm biến: em chế pause(n) để nhện đứng chờ đúng n nhịp, rồi đọc chương trình xe để biết phải chờ bao nhiêu nhịp trước khi gọi hop_box("R").',
      veMaMau: 'Chương trình xe bị khóa, xem được. Tạo pause(n) rồi viết chương trình nhện.',
      san: ['#########', '#..<<<.o#', '#.#D#####', '#.u.#####', '#########'], bd: [{ x: 6, y: 1, huong: 1 }, { x: 1, y: 3, huong: 0 }],
      maMau: B(XE_3, []),
      loiGiai: lg(B(XE_3, ['pause(8)', 'hop_box("R")']), [hPause()]),
      hamCuaEmCan: ['pick', 'drop', 'u_turn', 'go_wall', 'turn_left', 'hop_box'],
      goiY: ['Bấm chạy từng nhịp, xem nhịp nào hộp nằm xuống trên đầu nhện.', 'Chờ ít quá thì nhện nhặt hụt; chờ nhiều quá vẫn thắng nhưng mất sao nhịp.']
    }),
    man({
      so: 4, chuong: CHE, ten: 'Ba hố liền',
      deBai: 'Nhện phải chở hộp qua ba hố liền nhau rồi đặt trước mũi xe. Xe chờ hộp, đưa xuống băng chuyền rồi thả vào ô đích. Dùng hop_box() và take_box() em đã chế.',
      veMaMau: 'Tự viết cả hai chương trình bằng các hàm em đã chế.',
      san: ['############', '#o#.#.#..>.#', '#.u.u.u.##D#', '############'], bd: [{ x: 8, y: 1, huong: 3 }, { x: 1, y: 2, huong: 0 }],
      maMau: B([], []),
      loiGiai: B(['take_box()', 'u_turn()', 'go_wall()', 'turn_right()', 'drop()'], ['for i in range(3):', '    hop_box("R")']),
      hamCuaEmCan: ['take_box', 'u_turn', 'go_wall', 'turn_right', 'drop', 'hop_box'],
      goiY: ['Mỗi lần hop_box("R") nhện đặt hộp lên ô trên đầu, lần sau nhặt lại đúng hộp đó.', 'Ba lần hop_box("R") là ba cú nhảy: dùng vòng for.']
    }),
    man({
      so: 5, chuong: CHE, ten: 'Hai phía, một vòng lặp',
      deBai: 'Hai hộp ở hai đầu, xe đứng giữa. Nhện chở hộp bên trái qua hố đặt trước mũi xe, rồi sang bên phải chở hộp thứ hai qua hố đặt sau lưng xe. Xe nhận mỗi hộp, quay phải thả vào đích, rồi quay phải lần nữa để chờ hộp kế: dùng vòng lặp cho xe.',
      veMaMau: 'Xe đã nhận được hộp thứ nhất. Bọc chương trình xe vào vòng lặp và viết chương trình nhện.',
      san: ['#########', '####D####', '#o#...#o#', '#.u.D.u.#', '#########'], bd: [{ x: 4, y: 2, huong: 3 }, { x: 1, y: 3, huong: 0 }],
      maMau: B(['take_box()', 'turn_right()', 'drop()', 'turn_right()'], []),
      loiGiai: B(['for i in range(2):', '    take_box()', '    turn_right()', '    drop()', '    turn_right()'], ['hop_box("R")', 'walk("RR")', 'jump("R")', 'hop_box("L")']),
      hamCuaEmCan: ['take_box', 'turn_right', 'drop', 'hop_box', 'walk', 'jump'],
      goiY: ['Sau hai lần quay phải xe nhìn sang bên kia, đúng chỗ hộp thứ hai sẽ tới.', 'Hộp thứ hai bay qua hố theo hướng "L".']
    }),
    man({
      so: 6, chuong: CHE, ten: 'Xe tự động dùng hàm của em', khoa: 0,
      deBai: 'Xe tự động gọi take_box() em đã chế, hai lần: hộp thứ nhất thả lên đích phía trên, hộp thứ hai thả xuống đích phía dưới. Nhện phải đưa lần lượt hai hộp tới trước mũi xe. Hộp gần đang nằm chắn đường của hộp xa: chở hộp nào trước?',
      veMaMau: 'Chương trình xe bị khóa, xem được. Viết chương trình nhện.',
      san: ['########', '######D#', '#o#o#..#', '#.u.u.D#', '########'], bd: [{ x: 6, y: 2, huong: 3 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(['take_box()', 'turn_right()', 'drop()', 'turn_left()', 'take_box()', 'turn_left()', 'drop()'], []),
      loiGiai: B(['take_box()', 'turn_right()', 'drop()', 'turn_left()', 'take_box()', 'turn_left()', 'drop()'], ['hop_box("R")', 'leap("LL")', 'hop_box("R")', 'hop_box("R")']),
      hamCuaEmCan: ['take_box', 'turn_right', 'turn_left', 'drop', 'hop_box', 'leap'],
      goiY: ['Hộp xa phải đi qua chỗ của hộp gần, nên hộp gần đi trước.', 'Đưa xong hộp gần thì nhện nhảy về hai lần rồi chở hộp xa hai chặng.']
    }),
    man({
      so: 7, chuong: CHE, ten: 'Hàm quên tham số', khoa: 1,
      deBai: 'Nhện tự động gọi hop_two("L") để chở hộp qua hai hố sang trái, nhưng hàm hop_two(d) của màn lại nhảy sang phải nên nhện đâm tường. Sửa hàm hop_two(d) cho nhện nhảy theo hướng d.',
      veMaMau: 'Chương trình nhện bị khóa, chương trình xe đã đúng. Chạy thử rồi sửa hàm hop_two(d) trong Xưởng hàm.',
      san: ['########', '#..#.#o#', '#..u.u.#', '#.D#####', '########'], bd: [{ x: 1, y: 1, huong: 1 }, { x: 6, y: 2, huong: 0 }],
      maMau: B(XE_7, ['hop_two("L")'], [hHopTwo()]),
      loiGiai: B(XE_7, ['hop_two("L")'], [hHopTwo(['hop_box(d)', 'hop_box(d)'])]),
      hamCuaEmCan: ['take_box', 'turn_right', 'go_wall', 'turn_left', 'drop', 'hop_box'],
      goiY: ['Trong thân hàm, d là hướng người gọi đưa vào. Chữ "R" viết cứng thì gọi hướng nào cũng nhảy sang phải.', 'Thay "R" bằng d.']
    }),
    man({
      so: 8, chuong: CHE, ten: 'Hẹn giờ trong hàm', khoa: 0, chinhCoDinh: true,
      deBai: 'Xe tự động đi hai đoạn băng chuyền rồi đặt hộp lên ô trên đầu nhện. Nhện gọi meet(): hàm của màn chờ quá ít nhịp nên nhện nhặt hụt. Đọc chương trình xe, sửa số nhịp chờ trong meet().',
      veMaMau: 'Cả hai chương trình chính bị khóa. Sửa hàm meet() của màn trong Xưởng hàm.',
      san: ['##########', '#.>>>.####', '#o###v####', '#####v####', '#####..#D#', '######.u.#', '##########'], bd: [{ x: 1, y: 1, huong: 2 }, { x: 6, y: 5, huong: 0 }],
      maMau: B(XE_8, ['meet()'], [hMeet()]),
      loiGiai: B(XE_8, ['meet()'], [hMeet(['pause(10)', 'hop_box("R")'])]),
      hamCuaEmCan: ['pick', 'turn_left', 'turn_right', 'go_wall', 'drop', 'pause', 'hop_box'],
      goiY: ['Đếm nhịp của xe: mỗi lệnh quay, mỗi bước, mỗi lần nhặt hay thả tốn bao nhiêu nhịp?', 'Chạy từng nhịp và xem nhịp hộp nằm xuống trên đầu nhện.']
    }),
    man({
      so: 9, chuong: CHE, ten: 'Đổi phía', mucTieu: 'toi-co', nhen: NHEN_TRAN, co: [[{ x: 9, y: 1 }], [{ x: 1, y: 1 }]],
      deBai: 'Xe và nhện đổi phía cho nhau qua một hành lang hẹp: mỗi robot phải tới cờ có vạch màu của mình. Xe đã có chương trình. Hành lang có một hốc nhỏ: nhện tránh vào hốc, chờ xe đi qua bằng pause() rồi mới ra.',
      veMaMau: 'Chạy thử: nhện gặp xe giữa hành lang, hai robot chặn nhau. Sửa chương trình nhện.',
      san: ['###########', '#F.......F#', '##.####.###', '##.########', '##.########', '##.########', '###########'], bd: [{ x: 2, y: 5, huong: 0 }, { x: 9, y: 1, huong: 0 }],
      maMau: B(['go_wall()', 'turn_right()', 'go_wall()'], ['walk("LLLLLLLL")']),
      loiGiai: B(['go_wall()', 'turn_right()', 'go_wall()'], ['walk("LL")', 'go("D")', 'pause(3)', 'go("U")', 'walk("LLLLLL")']),
      hamCuaEmCan: ['go_wall', 'turn_right', 'walk', 'go', 'pause'],
      goiY: ['Nhện ra khỏi hốc sớm quá thì gặp xe giữa hành lang. Đếm nhịp xe cần để đi qua hốc.', 'Nhện không có cảm biến: chờ trong hốc bằng pause(n).']
    }),
    man({
      so: 10, chuong: CHE, ten: 'Ca giao hàng lớn',
      deBai: 'Ba sân có cùng làn của nhện: hai hố, hộp chuyển tới ô bên trái chân hành lang của xe. Hành lang dọc của xe dài ngắn khác nhau, đích lúc ở bên trái lúc ở bên phải đầu hành lang. Một chương trình cho mỗi robot phải giao hộp vào đích ở cả ba sân.',
      veMaMau: 'Tự viết cả hai chương trình bằng các hàm em đã chế.',
      san: [
        ['############', '########D.##', '#########.##', '#########.##', '#########.##', '####o#.#..##', '####.u.u.###', '############'],
        ['############', '############', '#########.D#', '#########.##', '#########.##', '####o#.#..##', '####.u.u.###', '############'],
        ['############', '#########.D#', '#########.##', '#########.##', '#########.##', '####o#.#..##', '####.u.u.###', '############']
      ],
      bd: [[{ x: 9, y: 1, huong: 2 }, { x: 9, y: 2, huong: 2 }, { x: 9, y: 3, huong: 2 }], [{ x: 4, y: 6, huong: 0 }, { x: 4, y: 6, huong: 0 }, { x: 4, y: 6, huong: 0 }]],
      maMau: B([], []),
      loiGiai: B(['go_wall()', 'turn_right()', 'take_box()', 'turn_right()', 'go_wall()', 'if left_clear():', '    turn_left()', 'else:', '    turn_right()', 'drop()'],
        ['hop_box("R")', 'hop_box("R")']),
      hamCuaEmCan: ['go_wall', 'turn_right', 'turn_left', 'take_box', 'drop', 'hop_box'],
      goiY: ['Xe không biết hành lang dài bao nhiêu: go_wall() đưa xe tới cuối, cả lúc xuống lẫn lúc lên.', 'Lên tới đầu hành lang thì hỏi left_clear() để biết đích ở bên nào.'],
      huyHieu: { ma: CHE, ten: 'Huy hiệu Chế lệnh đội vượt hố' }
    })
  ]);

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'che-nhen', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội vượt hố và băng chuyền' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội vượt hố' }],
    goi: { ma: CHUONG, ten: 'Đội vượt hố và băng chuyền', hinh: 'nhen' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

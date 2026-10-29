/* ============================================================================
   man-doi-mau.js — "Robot Chấn Hưng": GÓI ĐỘI MÀU VÀ SÚNG HƠI (20 màn, hai chương), đặt ngay sau chương che-mau. Kế hoạch: hoc/KE-HOACH-PHOI-HOP.md (§3, §3b, §4, §8).
   Hai robot khác part: R1 là ROBOT MÀU (xe hai bánh, camera đọc ô trước mặt, tay kẹp, cảm biến khoảng cách; không bắn được),
   R2 là ROBOT SÚNG HƠI (xe hai bánh, súng hơi, cảm biến khoảng cách; không đọc màu, không cầm vật). Kỹ năng phối hợp K6: BÁO NHAU BẰNG VỊ TRÍ.
   Không có lệnh tín hiệu: R1 nhìn màu hộp rồi tới đứng chờ trước cửa phòng cùng màu, ngay sát bên trái hay bên phải R2; R2 hỏi
   left_clear() / right_clear() rồi bắn nút trước mặt hay sau lưng (mỗi nút mở một cửa, khai bằng man.noi). Mở cửa sớm thì go_wall() của R1 chạy tuột
   vào phòng, nên R2 phải chờ tín hiệu; súng nhiều màn chỉ có một viên (danToiDa) nên không bắn cả hai nút được.

   Chương doi-mau (lời giải chuẩn; khóa = robot tự động, chương trình hiện ra nhưng không sửa):
     1  Hai làn, một cửa        R2 khóa   R2 bắn nút mở cửa làn R1; em viết R1 đi qua cửa rồi sort_color()
     2  Kho màu khóa cửa        R1 khóa   R1 chờ trước cửa kho; em đưa R2 tới đúng hàng nút rồi bắn
     3  Dọn đường bắn           —         hộp chắn bóng của R2: R1 dọn hộp vào đích màu, R2 chờ front_clear() rồi bắn, R1 vào kho phân loại hộp hai
     4  Đứng bên nào            —         phòng màu: R1 đứng chờ trước cửa cùng màu (tín hiệu), R2 chờ một bên có người rồi bắn đúng nút
     5  Phòng ở phía dưới       —         sân lộn ngược: trái phải tính theo mũi robot (R1 dodge_right sang tây, R2 hỏi right_clear)
     6  Cổng nhịp               R1 khóa   R1 qua cổng tự đóng mở rồi mới tới; R2 chờ bằng cảm biến, mở sớm thì R1 tuột vào kho
     7  Sửa vòng chờ            R1 khóa   R2 chờ bằng "or" nên chờ mãi: sửa thành "and"
     8  Nhìn trước khi nhặt     R2 khóa   R1 nhặt rồi mới nhìn màu (camera thấy ô trống): đổi thứ tự hai dòng
     9  Ba cổng một nút         —         một nút đổi cả ba cổng; R2 đi theo R1, bắn đúng lúc R1 tới mỗi cổng; cả hai phải lặp (viết thẳng tràn khung)
     10 Ca phân loại            R1 khóa   trùm ba sân: hộp đổi màu, R2 xuất phát xa gần khác nhau, go_wall() lên chốt rồi đọc tín hiệu
   Chương che-doi-mau (hàm của em MỚI, tên cốt truyện):
     1  Canh hai bên            R1 khóa   chế watch_side() = while left_clear() and right_clear(): wait()
     2  Trả lời theo phía       R1 khóa   chế answer_side() = bên trái có người thì spray(), không thì spray_back(); wait()
     3  Báo màu                 R2 khóa   chế show_color() = c = color(), pick(), đỏ thì dodge_left() không thì dodge_right()
     4  Lộn ngược               —         cả đội dùng ba hàm trên sân lộn ngược: hàm tính theo mũi robot nên vẫn đúng
     5  Chốt trên cao           R1 khóa   R1 tự động gọi show_color(); R2 đi xuống chốt, quay mặt xuống, nút trên mở cửa đỏ
     6  Chia phòng              —         cờ riêng (doi[i].co): R1 vào phòng cùng màu thẻ, R2 đọc phía rồi vào phòng còn lại
     7  Sửa hàm chọn phía       R1 khóa   hàm của màn pick_side() né ngược: sửa thân hàm
     8  Vòng chờ quên nhịp      R1 khóa   hàm của màn stand_by() dùng pass nên vòng chờ không có nhịp: thay bằng wait()
     9  Sửa đường về cờ         —         chia phòng lộn ngược, cờ riêng: R2 né về phía R1, sửa hai nhánh
     10 Ca đêm                  —         trùm ba sân: hộp gần xa, đỏ xanh; R1 go_wall() + show_color(), R2 watch_side() + answer_side()
   Trùng lời giải CỐ Ý (sân khác): doi-mau.8 = lời giải của 4 (màn sửa lỗi: đáp án là chương trình đúng của màn 4, lỗi nằm ở mẫu);
   che-doi-mau.4 = 3 và 9 = 6 (sân lộn ngược 180°: cùng chương trình vẫn đúng vì hàm tính trái phải, trước sau theo mũi robot — đó là ý của màn).
   Màn 1–9 ghi cứng được phía (một sân); trùm đổi màu hộp và thời điểm nên phải đọc tín hiệu. Máy kiểm riêng: kiem-doi-mau.mjs.

   Tệp chỉ khai báo chương (ManHoc.chuongThem); lo-trinh-hoc.js chèn hai chương ngay sau che-mau. Khung dữ liệu nhiều robot như man-doi-ho-bang.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-mau';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {
    'doi-mau.1': { o: 31, nhip: 7 },
    'doi-mau.2': { o: 40, nhip: 10 },
    'doi-mau.3': { o: 37, nhip: 15 },
    'doi-mau.4': { o: 39, nhip: 13 },
    'doi-mau.5': { o: 39, nhip: 13 },
    'doi-mau.6': { o: 39, nhip: 13 },
    'doi-mau.7': { o: 39, nhip: 14 },
    'doi-mau.8': { o: 39, nhip: 14 },
    'doi-mau.9': { o: 42, nhip: 16 },
    'doi-mau.10': { o: 40, nhip: 33 },
    'che-doi-mau.1': { o: 39, nhip: 14 },
    'che-doi-mau.2': { o: 34, nhip: 9 },
    'che-doi-mau.3': { o: 43, nhip: 10 },
    'che-doi-mau.4': { o: 43, nhip: 10 },
    'che-doi-mau.5': { o: 46, nhip: 10 },
    'che-doi-mau.6': { o: 43, nhip: 14 },
    'che-doi-mau.7': { o: 43, nhip: 11 },
    'che-doi-mau.8': { o: 41, nhip: 15 },
    'che-doi-mau.9': { o: 43, nhip: 14 },
    'che-doi-mau.10': { o: 47, nhip: 33 }
  };
  // @sao-cuoi

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var KC = ['front_clear', 'left_clear', 'right_clear'];
  var MAU = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'camera', o: 'tren' }, { ma: 'khoang-cach', o: 'hong' }] }, hamGoc: BANH.concat(TAY, ['color'], KC) };
  var SUNG = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'hoi', camBien: [{ ma: 'khoang-cach', o: 'hong' }] }, hamGoc: BANH.concat(['spray', 'spray_back'], KC) };

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Bài làm hai robot. */
  function B(c1, c2, hamCuaMan) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: hamCuaMan || [] }; }
  function H(ten, than, thamSo) { return { ten: ten, thamSo: (thamSo || []).slice(), than: than.slice() }; }
  /** Lớp màu cùng cỡ sân: o = { 'x,y': 'r'|'g'|'b'|'y' }. */
  function lop(san, o) {
    return san.map(function (hang, y) { var d = ''; for (var x = 0; x < hang.length; x++) d += (o[x + ',' + y] || '.'); return d; });
  }

  /**
   * m.bd: [batDau R1, batDau R2] (màn nhiều sân: mỗi phần tử là mảng theo sân); m.khoa: 0 | 1 (robot tự động khóa); m.dan: số viên của súng R2;
   * m.co: [cờ riêng R1, cờ riêng R2] (mỗi phần tử null | [{x,y}] | mảng theo sân).
   */
  function man(m) {
    var bd = m.bd, khoa = m.khoa, dan = m.dan, co = m.co;
    delete m.bd; delete m.khoa; delete m.dan; delete m.co;
    m.chuong = m.chuong || CHUONG;                                         // chương 2 của gói khai chuong: 'che-' + CHUONG
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'dua-vat';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    var r = [Object.assign({ batDau: bd[0] }, sao(MAU)), Object.assign({ batDau: bd[1] }, sao(SUNG))];
    if (khoa !== undefined) r[khoa].coDinh = true;
    if (dan) r[1].danToiDa = dan;
    if (co) co.forEach(function (c, i) { if (c) r[i].co = c; });
    m.doi = r;
    // Cấp ngoài là của R1 để mã đọc màn một robot không vỡ.
    m.batDau = bd[0]; m.loaiRobot = MAU.loaiRobot; m.robot = sao(MAU.robot); m.hamGoc = MAU.hamGoc.slice();
    m.taoHam = m.taoHam || []; m.loiSai = m.loiSai || [];
    m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    m.sao = SAO[m.chuong + '.' + m.so] || { o: 1, nhip: 1 };
    return ManHoc.chuanHoa(m);
  }

  var CHO_CUA = ['while not front_clear():', '    wait()'];
  var CHO_BAO = ['while left_clear() and right_clear():', '    wait()'];
  var TRA_LOI = ['if not left_clear():', '    spray()', 'else:', '    spray_back()', 'wait()'];

  /* ---- sân */
  // 1: làn trên của R1: cửa (3,2), hộp đỏ (5,2), đích xanh (4,1) / đỏ (4,3); làn dưới của R2: nút (1,5) sau lưng R2 (5,5)
  var SAN_1 = ['#######', '####D##', '#..C.o#', '####D##', '#######', '#N....#', '#######'];
  // 2: R1 đi băng ngang tới cửa (5,2), hộp xanh (7,2) trong kho; R2 đi lên rồi quay phải bắn nút (7,5)
  var SAN_2 = ['#########', '######D##', '#....C.o#', '######D##', '#########', '#......N#', '#.#######', '#.#######', '#########'];
  // 3: hộp đỏ (3,4) chắn đường bắn của R2 (3,5) lên nút (3,1); R1 (1,4) phải tiến một ô mới với tới hộp; cửa kho (5,4), hộp xanh (7,4)
  var SAN_3 = ['#########', '###N#####', '###.#####', '##D.##D##', '#..o.C.o#', '##D.##D##', '#########'];
  // 4 (phòng màu): đích đỏ (2,1) sau cửa (2,2), đích xanh (4,1) sau cửa (4,2); nút A (3,2) trước mặt R2 (3,3), nút B (3,4) sau lưng; hộp (4,4) trước mặt R1 (4,5)
  var SAN_4 = ['#######', '##D#D##', '##CNC##', '##...##', '##.No##', '##...##', '#######'];
  var NOI_4 = [{ nut: { x: 3, y: 2 }, cua: [{ x: 2, y: 2 }] }, { nut: { x: 3, y: 4 }, cua: [{ x: 4, y: 2 }] }];

  // 5: phòng màu lộn ngược: R1 (4,1) quay xuống nhìn hộp (4,2); R2 (3,3) quay xuống, nút A (3,4) trước mặt mở cửa đỏ (2,4), nút B (3,2) sau lưng mở cửa xanh (4,4)
  var SAN_5 = ['#######', '##...##', '##.No##', '##...##', '##CNC##', '##D#D##', '#######'];
  var NOI_5 = [{ nut: { x: 3, y: 4 }, cua: [{ x: 2, y: 4 }] }, { nut: { x: 3, y: 2 }, cua: [{ x: 4, y: 4 }] }];
  // 6: cổng nhịp (3,2) trên đường R1; R1 chờ ở (6,2) trước cửa kho (7,2), ngay trên R2 (6,3); R2 quay phải, nút (9,3) cuối hàng
  var SAN_6 = ['##########', '########D#', '#..C...C.o', '######..N#', '##########'];
  // 7: phòng màu, R1 (2,6) ở làn đỏ, hộp xanh (2,5); hành lang dài hơn
  var SAN_7 = ['#######', '##D#D##', '##CNC##', '##...##', '##.N.##', '##o#.##', '##...##', '#######'];
  // 8: phòng màu, R1 (4,6) ở làn xanh, hộp đỏ (4,5)
  var SAN_8 = ['#######', '##D#D##', '##CNC##', '##...##', '##.N.##', '##.#o##', '##...##', '#######'];
  var NOI_PHONG = [{ nut: { x: 3, y: 2 }, cua: [{ x: 2, y: 2 }] }, { nut: { x: 3, y: 4 }, cua: [{ x: 4, y: 2 }] }];
  // 9: ba cổng (3,2) đóng, (5,2) mở, (7,2) đóng; MỘT nút (9,3) đổi cả ba; R2 đi hàng dưới, mỗi lần R1 tới trước cổng thì R2 đứng ngay dưới R1
  var SAN_9 = ['##########', '########D#', '#..C.c.C.o', '#........N', '##########'];
  var NOI_9 = [{ nut: { x: 9, y: 3 }, cua: [{ x: 3, y: 2 }, { x: 5, y: 2 }, { x: 7, y: 2 }] }];
  // 10 (trùm): phòng màu, R2 đi lên cột giữa tới chốt (3,3) rồi mới đọc; nút B ở cuối cột; hộp đổi màu, R2 xuất phát xa gần khác nhau
  var SAN_10 = [
    ['#######', '##D#D##', '##CNC##', '##...##', '##..o##', '##...##', '###N###', '#######'],
    ['#######', '##D#D##', '##CNC##', '##...##', '##..o##', '##...##', '###.###', '###.###', '###N###', '#######'],
    ['#######', '##D#D##', '##CNC##', '##...##', '##..o##', '##...##', '###.###', '###N###', '#######']
  ];
  function noi10(yB) { return [{ nut: { x: 3, y: 2 }, cua: [{ x: 2, y: 2 }] }, { nut: { x: 3, y: yB }, cua: [{ x: 4, y: 2 }] }]; }

  var R1_4 = ['c = color()', 'pick()', 'if c == "red":', '    dodge_left()', '    dodge_left()', 'go_wall()'];
  var R1_PHONG = nhieu(R1_4, CHO_CUA, ['move()', 'drop()']);
  var R1_7 = nhieu(['c = color()', 'pick()', 'if c == "blue":', '    dodge_right()', '    dodge_right()', 'go_wall()'], CHO_CUA, ['move()', 'drop()']);
  var R1_5 = nhieu(['c = color()', 'pick()', 'if c == "red":', '    dodge_right()', '    dodge_right()', 'go_wall()'], CHO_CUA, ['move()', 'drop()']);
  var R1_6 = nhieu(['go_wall()'], CHO_CUA, ['go_wall()'], CHO_CUA, ['go_wall()', 'sort_color()']);
  /* ---- chương 2: sân, hàm, chương trình */
  var CHE = 'che-' + CHUONG;
  var T_WATCH = ['while left_clear() and right_clear():', '    wait()'];
  var T_ANSWER = ['if not left_clear():', '    spray()', 'else:', '    spray_back()', 'wait()'];
  var T_SHOW = ['c = color()', 'pick()', 'if c == "red":', '    dodge_left()', 'else:', '    dodge_right()'];
  var T_PICK_HONG = ['c = color()', 'pick()', 'if c == "red":', '    dodge_right()', 'else:', '    dodge_left()'];
  var T_STAND_HONG = ['while left_clear() and right_clear():', '    pass'];
  // C1: R1 (1,1) đi phải rồi xuống tới (4,4), bên phải R2 (3,4); cửa kho (4,5), hộp (4,7), đích (3,6) đỏ / (5,6) xanh; nút (3,3) trước mặt R2
  var SAN_C1 = ['#######', '#....##', '####.##', '###N.##', '##...##', '####C##', '###D.D#', '####o##', '#######'];
  // C3: phòng màu đối xứng: hộp (3,4) giữa, R1 (3,5); nút A (3,2) trước mặt R2, nút B (3,6) cuối cột
  // C2: phòng màu, hành lang dài: R1 (4,7) ở làn xanh, hộp (4,6)
  var SAN_C2 = ['#######', '##D#D##', '##CNC##', '##...##', '##.N.##', '##.#.##', '##.#o##', '##...##', '#######'];
  // C8: phòng màu, hành lang dài: R1 (2,7) ở làn đỏ, hộp (2,6)
  var SAN_C8 = ['#######', '##D#D##', '##CNC##', '##...##', '##.N.##', '##.#.##', '##o#.##', '##...##', '#######'];
  var SAN_C3 = ['#######', '##D#D##', '##CNC##', '##...##', '##.o.##', '##...##', '###N###', '#######'];
  var NOI_C3 = [{ nut: { x: 3, y: 2 }, cua: [{ x: 2, y: 2 }] }, { nut: { x: 3, y: 6 }, cua: [{ x: 4, y: 2 }] }];
  // C4: phòng màu đối xứng lộn ngược: phòng đỏ phía đông (4,6), xanh phía tây (2,6); A (3,5) trước mặt R2 mở cửa đông, B (3,1) mở cửa tây
  var SAN_C4 = ['#######', '###N###', '##...##', '##.o.##', '##...##', '##CNC##', '##D#D##', '#######'];
  var NOI_C4 = [{ nut: { x: 3, y: 5 }, cua: [{ x: 4, y: 5 }] }, { nut: { x: 3, y: 1 }, cua: [{ x: 2, y: 5 }] }];
  // C5: R2 (3,1) đi xuống cột giữa tới (3,3); nút trên (3,0) mở cửa đỏ (2,2), nút dưới (3,6) mở cửa xanh (4,2)
  var SAN_C5 = ['###N###', '##D.D##', '##C.C##', '##...##', '##.o.##', '##...##', '###N###', '#######'];
  var NOI_C5 = [{ nut: { x: 3, y: 0 }, cua: [{ x: 2, y: 2 }] }, { nut: { x: 3, y: 6 }, cua: [{ x: 4, y: 2 }] }];
  // C6: hai phòng có cờ riêng (2,1) của R1, (4,1) của R2; một nút (3,2) mở cả hai cửa
  var SAN_C6 = ['#######', '##F#F##', '##CNC##', '##...##', '##.o.##', '##...##', '#######'];
  var NOI_C6 = [{ nut: { x: 3, y: 2 }, cua: [{ x: 2, y: 2 }, { x: 4, y: 2 }] }];
  // C7: phòng màu đối xứng, nút B (3,4) ngay sau lưng R2, hộp (3,5), R1 (3,6)
  var SAN_C7 = ['#######', '##D#D##', '##CNC##', '##...##', '##.N.##', '##.o.##', '##...##', '#######'];
  // C9: chia phòng lộn ngược: R1 (3,1) quay xuống, thẻ (3,2); cờ (2,5) của R1, (4,5) của R2; một nút (3,4) mở cả hai cửa
  var SAN_C9 = ['#######', '##...##', '##.o.##', '##...##', '##CNC##', '##F#F##', '#######'];
  var NOI_C9 = [{ nut: { x: 3, y: 4 }, cua: [{ x: 2, y: 4 }, { x: 4, y: 4 }] }];
  // C10 (trùm): phòng màu đối xứng, hộp (3,4); R1 ở (3,5), (3,7) hay (3,6); nút B cuối cột
  var SAN_C10 = [SAN_C3,
    ['#######', '##D#D##', '##CNC##', '##...##', '##.o.##', '##...##', '###.###', '###.###', '###N###', '#######'],
    ['#######', '##D#D##', '##CNC##', '##...##', '##.o.##', '##...##', '###.###', '###N###', '#######']];
  function noiC10(yB) { return [{ nut: { x: 3, y: 2 }, cua: [{ x: 2, y: 2 }] }, { nut: { x: 3, y: yB }, cua: [{ x: 4, y: 2 }] }]; }

  var R1_C1 = nhieu(['go_wall()', 'turn_right()', 'go_wall()'], CHO_CUA, ['go_wall()', 'sort_color()']);
  var R2_C1 = ['watch_side()', 'spray()', 'wait()'];
  var R2_HAM = ['watch_side()', 'answer_side()'];
  var R1_HAM = nhieu(['show_color()', 'go_wall()'], CHO_CUA, ['move()', 'drop()']);
  var R1_C6 = nhieu(['show_color()', 'go_wall()'], CHO_CUA, ['go_wall()']);
  var R2_C6 = ['watch_side()', 'if left_clear():', '    spray()', '    wait()', '    dodge_left()', 'else:', '    spray()', '    wait()', '    dodge_right()', 'go_wall()'];
  var R2_C9_HONG = ['watch_side()', 'if left_clear():', '    spray()', '    wait()', '    dodge_right()', 'else:', '    spray()', '    wait()', '    dodge_left()', 'go_wall()'];
  var R1_C7 = nhieu(['pick_side()', 'go_wall()'], CHO_CUA, ['move()', 'drop()']);
  var R2_C8 = ['stand_by()', 'answer_side()'];

  var R2_5 = nhieu(CHO_BAO, ['if not right_clear():', '    spray()', 'else:', '    spray_back()', 'wait()']);

  var DS = [
    man({
      so: 1, ten: 'Hai làn, một cửa', khoa: 1,
      deBai: 'Hai robot ở hai làn riêng. Robot vòi phun R2 đã có chương trình: bắn ra sau trúng van, cửa trên làn của R1 mở. Viết chương trình cho robot màu R1: đi qua cửa, nhìn màu hộp rồi đặt vào ô đích cùng màu.',
      veMaMau: 'Chương trình R2 bị khóa, bấm thẻ R2 để xem. Viết chương trình R1.',
      san: SAN_1, mau: lop(SAN_1, { '4,1': 'b', '4,3': 'r' }), vatMau: lop(SAN_1, { '5,2': 'r' }),
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 5, y: 5, huong: 1 }],
      maMau: B([], ['spray_back()', 'wait()']), loiGiai: B(['forward(3)', 'sort_color()'], ['spray_back()', 'wait()']),
      hamCuaEmCan: ['forward', 'sort_color'],
      goiY: ['Cửa mở xong ở cuối nhịp đầu, nên R1 đi thẳng qua được.', 'sort_color() nhìn màu hộp trước mặt rồi đặt sang phải nếu đỏ, sang trái nếu không.']
    }),
    man({
      so: 2, ten: 'Kho màu khóa cửa', khoa: 0,
      deBai: 'Robot màu R1 tự động: đi tới cửa kho, chờ cửa mở rồi vào phân loại hộp. Van mở cửa ở cuối hành lang của R2. Viết chương trình cho R2 tới đúng chỗ bắn trúng van.',
      veMaMau: 'Chương trình R1 bị khóa, bấm thẻ R1 để xem. Viết chương trình R2.',
      san: SAN_2, mau: lop(SAN_2, { '6,1': 'b', '6,3': 'r' }), vatMau: lop(SAN_2, { '7,2': 'b' }),
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 1, y: 7, huong: 0 }],
      maMau: B(nhieu(['go_wall()'], CHO_CUA, ['go_wall()', 'sort_color()']), []),
      loiGiai: B(nhieu(['go_wall()'], CHO_CUA, ['go_wall()', 'sort_color()']), ['forward(2)', 'turn_right()', 'spray()', 'wait()']),
      hamCuaEmCan: ['go_wall', 'sort_color', 'forward', 'turn_right'],
      goiY: ['Tia nước bay thẳng theo hướng mũi xe: R2 phải đứng cùng hàng với van.', 'forward(2), turn_right(), rồi bắn.']
    }),
    man({
      so: 3, ten: 'Dọn đường bắn',
      deBai: 'Hộp đỏ nằm ngay trước mũi R2, chắn đường tia nước lên van mở kho. R1 nhặt hộp đó đặt vào đích cùng màu; R2 chờ tới khi trước mặt trống rồi mới bắn. Cửa mở thì R1 vào kho phân loại hộp thứ hai.',
      veMaMau: 'Chạy thử: tia nước của R2 trúng hộp. Thêm vòng chờ cho R2 và viết tiếp cho R1.',
      san: SAN_3, mau: lop(SAN_3, { '2,3': 'b', '2,5': 'r', '6,3': 'b', '6,5': 'r' }), vatMau: lop(SAN_3, { '3,4': 'r', '7,4': 'b' }),
      bd: [{ x: 1, y: 4, huong: 1 }, { x: 3, y: 5, huong: 0 }],
      maMau: B(['move()', 'sort_color()'], ['spray()', 'wait()']),
      loiGiai: B(['move()', 'sort_color()', 'go_wall()', 'sort_color()'], ['while not front_clear():', '    wait()', 'spray()', 'wait()']),
      hamCuaEmCan: ['move', 'sort_color', 'go_wall'],
      goiY: ['Hộp còn nằm trước mũi R2 thì front_clear() trả False.', 'R1: move(), sort_color(), go_wall(), sort_color().']
    }),
    man({
      so: 4, ten: 'Đứng bên nào', dan: 1, noi: NOI_4,
      deBai: 'Mỗi màu một phòng: đích đỏ sau cửa trái, đích xanh sau cửa phải. R1 nhìn màu hộp rồi tới đứng chờ trước cửa cùng màu, ngay bên trái hay bên phải R2. R2 không biết màu, chỉ có một lượt phun: hỏi bên nào có đồng đội rồi bắn van trước mặt (cửa trái) hay van sau lưng (cửa phải).',
      veMaMau: 'R1 đã tới chỗ chờ. Viết tiếp cho R1 và viết chương trình R2.',
      san: SAN_4, mau: lop(SAN_4, { '2,1': 'r', '4,1': 'b' }), vatMau: lop(SAN_4, { '4,4': 'r' }),
      bd: [{ x: 4, y: 5, huong: 0 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(R1_4, []), loiGiai: B(nhieu(R1_4, CHO_CUA, ['move()', 'drop()']), nhieu(CHO_BAO, TRA_LOI)),
      hamCuaEmCan: ['pick', 'drop', 'move', 'dodge_left', 'go_wall'],
      goiY: ['Đồng đội đứng bên trái thì left_clear() trả False.', 'Chờ tới khi một bên có người, rồi mới hỏi bên nào.']
    }),
    man({
      so: 5, ten: 'Phòng ở phía dưới', dan: 1, noi: NOI_5,
      deBai: 'Sân lộn ngược: phòng màu ở dưới, hai robot đều quay mặt xuống. Trái phải tính theo mũi robot: R1 rẽ sang phía tây là dodge_right(), và R1 đứng ở phía tây thì là bên PHẢI của R2. Van trước mặt R2 mở cửa đỏ, van sau lưng mở cửa xanh.',
      veMaMau: 'R1 đã nhặt hộp. Viết tiếp cho R1 và viết chương trình R2.',
      san: SAN_5, mau: lop(SAN_5, { '2,5': 'r', '4,5': 'b' }), vatMau: lop(SAN_5, { '4,2': 'r' }),
      bd: [{ x: 4, y: 1, huong: 2 }, { x: 3, y: 3, huong: 2 }],
      maMau: B(['c = color()', 'pick()'], []), loiGiai: B(R1_5, R2_5),
      hamCuaEmCan: ['pick', 'drop', 'move', 'dodge_right', 'go_wall'],
      goiY: ['Robot quay mặt xuống thì bên trái của nó là phía đông của sân.', 'R2 hỏi right_clear(): đồng đội ở phía tây.']
    }),
    man({
      so: 6, ten: 'Cổng nhịp', khoa: 0, cuaNhip: [{ x: 3, y: 2, mo: 2, dong: 4, pha: 4 }],
      deBai: 'R1 tự động đi qua một cổng tự đóng mở theo nhịp, rồi tới đứng chờ trước cửa kho, ngay phía trên R2. Không ai biết trước R1 tới lúc nào. R2 chờ bằng cảm biến tới khi thấy R1, rồi mới bắn van mở kho: mở sớm thì R1 chạy tuột vào kho.',
      veMaMau: 'Chương trình R1 bị khóa, bấm thẻ R1 để xem. Viết chương trình R2.',
      san: SAN_6, mau: lop(SAN_6, { '8,1': 'b' }), vatMau: lop(SAN_6, { '9,2': 'b' }),
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 6, y: 3, huong: 1 }],
      maMau: B(R1_6, []), loiGiai: B(R1_6, ['while left_clear():', '    wait()', 'spray()', 'wait()']),
      hamCuaEmCan: ['go_wall', 'sort_color'],
      goiY: ['R2 quay mặt sang phải thì bên trái của R2 là phía trên.', 'while left_clear(): wait() rồi mới spray().']
    }),
    man({
      so: 7, ten: 'Sửa vòng chờ', khoa: 0, dan: 1, noi: NOI_PHONG,
      deBai: 'Hộp xanh, R1 tự động sang đứng bên phải R2. Nhưng R2 cứ chờ mãi không bắn: điều kiện của vòng chờ sai. Sửa chương trình R2.',
      veMaMau: 'Chạy thử: R2 chờ mãi. Xem lại dòng while của R2.',
      san: SAN_7, mau: lop(SAN_7, { '2,1': 'r', '4,1': 'b' }), vatMau: lop(SAN_7, { '2,5': 'b' }),
      bd: [{ x: 2, y: 6, huong: 0 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(R1_7, nhieu(['while left_clear() or right_clear():', '    wait()'], TRA_LOI)), loiGiai: B(R1_7, nhieu(CHO_BAO, TRA_LOI)),
      hamCuaEmCan: ['pick', 'drop', 'move', 'dodge_right', 'go_wall'],
      goiY: ['or cần cả hai bên cùng có người mới thôi chờ.', 'Chỉ chờ khi CẢ HAI bên đều trống: and.']
    }),
    man({
      so: 8, ten: 'Nhìn trước khi nhặt', khoa: 1, dan: 1, noi: NOI_PHONG,
      deBai: 'R1 nhặt hộp đỏ rồi mới nhìn màu, nên camera chỉ thấy ô trống: R1 sang nhầm phòng xanh và R2 mở nhầm cửa. Sửa chương trình R1.',
      veMaMau: 'Chạy thử: hộp đỏ vào phòng xanh. Sửa thứ tự hai dòng đầu của R1.',
      san: SAN_8, mau: lop(SAN_8, { '2,1': 'r', '4,1': 'b' }), vatMau: lop(SAN_8, { '4,5': 'r' }),
      bd: [{ x: 4, y: 6, huong: 0 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(nhieu(['pick()', 'c = color()'], R1_4.slice(2), CHO_CUA, ['move()', 'drop()']), nhieu(CHO_BAO, TRA_LOI)),
      loiGiai: B(R1_PHONG, nhieu(CHO_BAO, TRA_LOI)),
      hamCuaEmCan: ['pick', 'drop', 'move', 'dodge_left', 'go_wall'],
      goiY: ['Camera nhìn ô trước mặt: hộp đã nhặt lên thì ô đó trống, color() trả "none".', 'Đổi chỗ: c = color() trước, pick() sau.']
    }),
    man({
      so: 9, ten: 'Ba cổng một van', noi: NOI_9,
      deBai: 'Một van đổi cả ba cổng: cổng đóng thì mở, cổng mở thì đóng. R1 phải qua cả ba cổng rồi đặt hộp vào đích. Mỗi lần R1 tới trước một cổng, R2 đứng ngay dưới R1 và bắn đúng lúc đó; bắn sai lúc thì cổng trước mặt R1 lại đóng. Viết thẳng thì không đủ ô.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: SAN_9, mau: lop(SAN_9, { '8,1': 'b' }), vatMau: lop(SAN_9, { '9,2': 'b' }),
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: B([], []),
      loiGiai: B(nhieu(['for i in range(3):', '    go_wall()', '    while not front_clear():', '        wait()', '    move()'], ['go_wall()', 'sort_color()']),
        ['for i in range(3):', '    while left_clear():', '        wait()', '    spray()', '    wait()', '    forward(3)']),
      hamCuaEmCan: ['go_wall', 'move', 'sort_color', 'forward'],
      goiY: ['Bắn xong R2 giật lùi một ô, nên phải tiến ba ô mới tới cổng sau.', 'Mỗi lượt R1: go_wall(), chờ cổng mở, move().']
    }),
    man({
      so: 10, ten: 'Ca phân loại', khoa: 0, dan: 1, noi: [noi10(6), noi10(8), noi10(7)],
      deBai: 'Ba sân, R1 tự động phân loại một hộp mỗi sân. Màu hộp đổi theo sân, R2 xuất phát xa gần khác nhau. R2 đi lên tới chốt giữa hai van, chờ R1 báo bằng chỗ đứng, rồi bắn đúng cửa. Một chương trình R2 cho cả ba sân.',
      veMaMau: 'Chương trình R1 bị khóa. Viết chương trình R2.',
      san: SAN_10,
      mau: SAN_10.map(function (s) { return lop(s, { '2,1': 'r', '4,1': 'b' }); }),
      vatMau: [lop(SAN_10[0], { '4,4': 'r' }), lop(SAN_10[1], { '4,4': 'b' }), lop(SAN_10[2], { '4,4': 'r' })],
      bd: [[{ x: 4, y: 5, huong: 0 }, { x: 4, y: 5, huong: 0 }, { x: 4, y: 5, huong: 0 }], [{ x: 3, y: 5, huong: 0 }, { x: 3, y: 7, huong: 0 }, { x: 3, y: 6, huong: 0 }]],
      maMau: B(R1_PHONG, []), loiGiai: B(R1_PHONG, nhieu(['go_wall()'], CHO_BAO, TRA_LOI)),
      hamCuaEmCan: ['pick', 'drop', 'move', 'dodge_left', 'go_wall'],
      goiY: ['go_wall() đưa R2 lên tới chốt: trước mặt là van nên dừng.', 'Không đếm nhịp được: mỗi sân R1 tới lúc khác.'],
      huyHieu: { ma: CHUONG, ten: 'Huy hiệu Đội màu và vòi phun' }
    }),

    /* =================================================================== chương 2: che-doi-mau */
    man({
      chuong: CHE, so: 1, ten: 'Canh hai bên', khoa: 0, taoHam: ['watch_side'],
      deBai: 'R1 tự động đi vòng tới đứng chờ cạnh R2 rồi vào kho phân loại hộp. R2 không biết R1 sẽ đứng bên nào. Chế lệnh watch_side(): R2 đứng chờ cho tới khi có đồng đội sát bên trái hoặc bên phải.',
      veMaMau: 'R2 mới có dòng gọi watch_side() mà hàm chưa có. Mở Xưởng hàm tạo watch_side(), rồi viết tiếp cho R2 bắn van.',
      san: SAN_C1, mau: lop(SAN_C1, { '3,6': 'r', '5,6': 'b' }), vatMau: lop(SAN_C1, { '4,7': 'r' }),
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 4, huong: 0 }],
      maMau: B(R1_C1, ['watch_side()']), loiGiai: Object.assign(B(R1_C1, R2_C1), { hamCuaEmMoi: [H('watch_side', T_WATCH)] }),
      hamCuaEmCan: ['go_wall', 'turn_right', 'sort_color'],
      goiY: ['Chờ khi CẢ HAI bên đều trống: while left_clear() and right_clear(): wait()', 'Chỉ canh bên trái thì R2 chờ mãi: R1 tới bên phải.']
    }),
    man({
      chuong: CHE, so: 2, ten: 'Trả lời theo phía', khoa: 0, dan: 1, noi: NOI_PHONG, taoHam: ['answer_side'],
      deBai: 'Phòng màu: đồng đội đứng bên trái thì bắn van trước mặt (cửa đỏ), đứng bên phải thì bắn van sau lưng (cửa xanh). Chế lệnh answer_side() cho R2 làm việc đó; R2 dùng watch_side() để chờ trước.',
      veMaMau: 'R2 đã chờ bằng watch_side(). Tạo answer_side() trong Xưởng hàm rồi gọi nó ngay sau.',
      san: SAN_C2, mau: lop(SAN_C2, { '2,1': 'r', '4,1': 'b' }), vatMau: lop(SAN_C2, { '4,6': 'b' }),
      bd: [{ x: 4, y: 7, huong: 0 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(R1_PHONG, ['watch_side()']), loiGiai: Object.assign(B(R1_PHONG, R2_HAM), { hamCuaEmMoi: [H('answer_side', T_ANSWER)] }),
      hamCuaEmCan: ['watch_side', 'pick', 'drop', 'move', 'dodge_left', 'go_wall'],
      goiY: ['Bắn xong phải có wait() thì phát bắn mới chạy.', 'if not left_clear(): spray() / else: spray_back() / wait()']
    }),
    man({
      chuong: CHE, so: 3, ten: 'Báo màu', khoa: 1, dan: 1, noi: NOI_C3, taoHam: ['show_color'],
      deBai: 'Hộp nằm giữa, hai phòng hai bên. Chế lệnh show_color() cho R1: nhìn màu hộp, nhặt lên, rồi né sang trái nếu hộp đỏ, sang phải nếu không. R2 tự động đọc chỗ R1 đứng.',
      veMaMau: 'R1 mới có dòng gọi show_color() mà hàm chưa có. Tạo show_color(), rồi viết tiếp cho R1 tới chờ cửa và đặt hộp.',
      san: SAN_C3, mau: lop(SAN_C3, { '2,1': 'r', '4,1': 'b' }), vatMau: lop(SAN_C3, { '3,4': 'r' }),
      bd: [{ x: 3, y: 5, huong: 0 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(['show_color()'], R2_HAM), loiGiai: Object.assign(B(R1_HAM, R2_HAM), { hamCuaEmMoi: [H('show_color', T_SHOW)] }),
      hamCuaEmCan: ['watch_side', 'answer_side', 'pick', 'drop', 'move', 'dodge_left', 'dodge_right', 'go_wall'],
      goiY: ['Nhìn màu TRƯỚC khi nhặt: c = color() rồi mới pick().', 'dodge_left() né sang trái một ô và vẫn quay mặt như cũ.']
    }),
    man({
      chuong: CHE, so: 4, ten: 'Lộn ngược', dan: 1, noi: NOI_C4,
      deBai: 'Phòng ở dưới, hai robot quay mặt xuống. Phòng đỏ ở phía đông vì đó là bên trái của R1. Dùng show_color(), watch_side(), answer_side() đã chế: hàm tính trái phải theo mũi robot nên vẫn đúng.',
      veMaMau: 'Tự viết cả hai chương trình bằng các hàm đã chế.',
      san: SAN_C4, mau: lop(SAN_C4, { '4,6': 'r', '2,6': 'b' }), vatMau: lop(SAN_C4, { '3,3': 'b' }),
      bd: [{ x: 3, y: 2, huong: 2 }, { x: 3, y: 4, huong: 2 }],
      maMau: B([], []), loiGiai: B(R1_HAM, R2_HAM),
      hamCuaEmCan: ['show_color', 'watch_side', 'answer_side', 'go_wall', 'move', 'drop'],
      goiY: ['Quay mặt xuống thì bên trái là phía đông.', 'R1: show_color(), go_wall(), chờ cửa, move(), drop().']
    }),
    man({
      chuong: CHE, so: 5, ten: 'Chốt trên cao', khoa: 0, dan: 1, noi: NOI_C5,
      deBai: 'R1 tự động dùng show_color(). R2 xuất phát ở trên, phải đi xuống hai ô tới chốt giữa hai phòng, quay mặt xuống. Van trên cùng mở cửa đỏ, van dưới cùng mở cửa xanh. Viết chương trình R2.',
      veMaMau: 'Chương trình R1 bị khóa. Viết chương trình R2.',
      san: SAN_C5, mau: lop(SAN_C5, { '2,1': 'r', '4,1': 'b' }), vatMau: lop(SAN_C5, { '3,4': 'r' }),
      bd: [{ x: 3, y: 5, huong: 0 }, { x: 3, y: 1, huong: 2 }],
      maMau: B(R1_HAM, []), loiGiai: B(R1_HAM, nhieu(['forward(2)'], R2_HAM)),
      hamCuaEmCan: ['show_color', 'watch_side', 'answer_side', 'forward', 'go_wall', 'move', 'drop'],
      goiY: ['R2 quay mặt xuống: van trước mặt là van dưới, van sau lưng là van trên.', 'forward(2), watch_side(), answer_side()']
    }),
    man({
      chuong: CHE, so: 6, ten: 'Chia phòng', mucTieu: 'toi-co', co: [[{ x: 2, y: 1 }], [{ x: 4, y: 1 }]], noi: NOI_C6,
      deBai: 'Mỗi robot một lá cờ riêng. R1 vào phòng cùng màu thẻ; R2 vào phòng còn lại. Một van mở cả hai cửa. R2 chờ R1 báo bằng chỗ đứng, bắn van, rồi né sang phía KHÔNG có R1 và đi lên cờ của mình.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: SAN_C6, vatMau: lop(SAN_C6, { '3,4': 'r' }),
      bd: [{ x: 3, y: 5, huong: 0 }, { x: 3, y: 3, huong: 0 }],
      maMau: B([], []), loiGiai: B(R1_C6, R2_C6),
      hamCuaEmCan: ['show_color', 'watch_side', 'go_wall', 'dodge_left', 'dodge_right'],
      goiY: ['Bắn xong R2 giật lùi một ô, rồi mới né sang bên.', 'Đọc bên nào trống TRƯỚC khi bắn.']
    }),
    man({
      chuong: CHE, so: 7, ten: 'Sửa hàm chọn phía', khoa: 0, dan: 1, noi: NOI_PHONG,
      deBai: 'R1 tự động gọi hàm của màn pick_side() để báo màu, nhưng hộp đỏ lại vào phòng xanh. Sửa thân hàm pick_side().',
      veMaMau: 'Chạy thử rồi mở Xưởng hàm, sửa pick_side().',
      san: SAN_C7, mau: lop(SAN_C7, { '2,1': 'r', '4,1': 'b' }), vatMau: lop(SAN_C7, { '3,5': 'r' }),
      bd: [{ x: 3, y: 6, huong: 0 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(R1_C7, R2_HAM, [H('pick_side', T_PICK_HONG)]), loiGiai: B(R1_C7, R2_HAM, [H('pick_side', T_SHOW)]),
      hamCuaEmCan: ['watch_side', 'answer_side', 'pick', 'drop', 'move', 'dodge_left', 'dodge_right', 'go_wall'],
      goiY: ['Phòng đỏ ở bên trái R1.', 'Đổi chỗ dodge_left() và dodge_right() trong hai nhánh.']
    }),
    man({
      chuong: CHE, so: 8, ten: 'Vòng chờ quên nhịp', khoa: 0, dan: 1, noi: NOI_PHONG,
      deBai: 'R2 gọi hàm của màn stand_by() để chờ đồng đội, nhưng chạy là báo vòng lặp không dừng: trong vòng chờ không có nhịp nào trôi. Sửa thân hàm stand_by().',
      veMaMau: 'Chạy thử rồi mở Xưởng hàm, sửa stand_by().',
      san: SAN_C8, mau: lop(SAN_C8, { '2,1': 'r', '4,1': 'b' }), vatMau: lop(SAN_C8, { '2,6': 'b' }),
      bd: [{ x: 2, y: 7, huong: 0 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(R1_7, R2_C8, [H('stand_by', T_STAND_HONG)]), loiGiai: B(R1_7, R2_C8, [H('stand_by', T_WATCH)]),
      hamCuaEmCan: ['answer_side', 'pick', 'drop', 'move', 'dodge_right', 'go_wall'],
      goiY: ['pass không làm nhịp trôi: R1 không bao giờ tới.', 'Thay pass bằng wait().']
    }),
    man({
      chuong: CHE, so: 9, ten: 'Sửa đường về cờ', mucTieu: 'toi-co', co: [[{ x: 2, y: 5 }], [{ x: 4, y: 5 }]], noi: NOI_C9,
      deBai: 'Sân lộn ngược, mỗi robot một cờ riêng. R2 đã có chương trình nhưng lại né về phía R1, đi theo R1 vào nhầm phòng. Sửa chương trình R2 cho R2 vào phòng còn lại.',
      veMaMau: 'R1 đã đúng. Chạy thử rồi sửa hai nhánh của R2.',
      san: SAN_C9, vatMau: lop(SAN_C9, { '3,2': 'b' }),
      bd: [{ x: 3, y: 1, huong: 2 }, { x: 3, y: 3, huong: 2 }],
      maMau: B(R1_C6, R2_C9_HONG), loiGiai: B(R1_C6, R2_C6),
      hamCuaEmCan: ['show_color', 'watch_side', 'go_wall', 'dodge_left', 'dodge_right'],
      goiY: ['Bên trái còn trống nghĩa là R1 ở bên phải: né sang trái.', 'Hai nhánh đang né ngược nhau.']
    }),
    man({
      chuong: CHE, so: 10, ten: 'Ca đêm', dan: 1, noi: [NOI_C3, noiC10(8), noiC10(7)],
      deBai: 'Ba sân: hộp đỏ hay xanh, nằm gần hay xa R1. Cả đội dùng các lệnh đã chế: R1 tới trước hộp, báo màu, chờ cửa rồi đặt hộp; R2 canh hai bên rồi bắn đúng van. Một chương trình cho mỗi robot chạy đúng cả ba sân.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: SAN_C10,
      mau: SAN_C10.map(function (s) { return lop(s, { '2,1': 'r', '4,1': 'b' }); }),
      vatMau: [lop(SAN_C10[0], { '3,4': 'r' }), lop(SAN_C10[1], { '3,4': 'b' }), lop(SAN_C10[2], { '3,4': 'r' })],
      bd: [[{ x: 3, y: 5, huong: 0 }, { x: 3, y: 7, huong: 0 }, { x: 3, y: 6, huong: 0 }], [{ x: 3, y: 3, huong: 0 }, { x: 3, y: 3, huong: 0 }, { x: 3, y: 3, huong: 0 }]],
      maMau: B([], []), loiGiai: B(nhieu(['go_wall()'], R1_HAM), R2_HAM),
      hamCuaEmCan: ['show_color', 'watch_side', 'answer_side', 'go_wall', 'move', 'drop'],
      goiY: ['go_wall() trước: R1 tới sát hộp dù hộp gần hay xa.', 'Màu hộp đổi theo sân nên R2 phải canh và trả lời, không đoán trước.'],
      huyHieu: { ma: CHE, ten: 'Huy hiệu Chế lệnh đội màu' }
    })
  ];

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'che-mau', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội màu và vòi phun' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội màu' }],
    goi: { ma: CHUONG, ten: 'Đội màu và vòi phun', hinh: 'mau' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

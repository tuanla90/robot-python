/* ============================================================================
   man-trum-mua-2.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 2, gói 10 "Xe cứu hỏa R1 xuất xưởng" (gói cuối mùa, KE-HOACH-PART-DUNG-MUA.md).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `tong-hop-2` (mã tong-hop-2.1 … tong-hop-2.10): chương 1 "Dập lửa" (màn 10 trùm, huy hiệu tong-hop-2)
     - `trum-mua-2` (mã trum-mua-2.1 … trum-mua-2.10): chương 2 "Chế lệnh: dập lửa" (màn 10 là TRÙM CUỐI MÙA 2, huy hiệu nha-may-chay)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): robot chỉ dùng part mùa 2 (xích + vòi phun + hồng ngoại); không bậc thang S, hố u, gầm n;
   biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so); hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manTrumMua2, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   PDM2c2 (31/10, brief hoc/ban-giao/brief-PDM2c2-mua-2-goi-10.md): gói 10 "R1 chạy một mình, nhiều sân" như gói 10 mùa 1 (PDM1):
     - MỌI màn MỘT robot: XE CỨU HỎA ĐẦY ĐỦ = xích + vòi phun (lucBan: squirt "low" / "high") + hồng ngoại (distance, warm); xichDay. KHÔNG còn cfg.beSung
       (Bệ vòi xích đã cất khỏi mùa 2): phun mạnh thì xe GIẬT một ô như mọi xe (ô sau trống thì lùi, bị chặn thì đứng yên); fence_shot() của gói 8 bù cú giật.
     - MỌI màn 2–3 SÂN ("ngày làm việc": lửa to nhỏ / xa gần, van, thùng, cửa ở chỗ khác); mảng song song: san, batDau, lua, noi, thungThem.
       Sao: MỌI màn sao.nhip = TỔNG nhịp mọi ngày (nhipTheo 'tong'). Khác mùa 1 (ngày dài nhất): với ngưỡng theo ngày dài nhất, một dãy cố định viết cho ngày
       khó nhất (phun thừa, đi thừa húc tường) vẫn 3 sao ở mọi ngày (bộ dò dayChung chứng minh); tính tổng thì nhịp phí ở ngày dễ làm mất sao.
     - Mỗi màn: MỘT chương trình tổng quát (while / if với distance() / warm()) thắng 3 sao mọi ngày; ≥ 1 lời sai VIẾT CỨNG (đếm số bước / số lần phun theo một ngày,
       loiSai.cung = true) thua ở ít nhất một ngày (phaiCoMa). Không còn màn hai robot; ba màn đội cũ (tong-hop-2.8, .9, trum-mua-2.5) thành màn một robot giữ mã.
     - Chương tong-hop-2 "Dập lửa" ôn gói 1–9 (bảng recall ở kiem-trum-mua-2.mjs: gói 8 = Góc kho cũ, gói 9 = Đội "chờ bằng cảm biến"), chương trum-mua-2 chế hàm dập lửa.
   Lửa: cfg.lua = [{ x, y, suc }] (luật ở san-hoc.js, mục SÚNG BÓNG, đoạn LỬA): lửa chắn xe, chắn tia, distance() đếm tới lửa, warm() thấy lửa nóng; mỗi lần tia trúng
   suc giảm 1; phun nhẹ bay tối đa 2 ô (không giật), phun mạnh bay tới vật cản đầu tiên (xe giật). Mục tiêu dap-lua: hết lửa (+ đứng ở cờ).
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back'];
  var MAT = ['distance', 'warm'];
  var HN = [{ ma: 'hong-ngoai', o: 'tren' }];

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  /** Thụt mọi dòng vào một bậc (4 dấu cách). */
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(than)); }
  function WHILE(dk, than) { return ['while ' + dk + ':'].concat(thut(than)); }
  function IF(dk, co, khong) { return ['if ' + dk + ':'].concat(thut(co), khong ? ['else:'].concat(thut(khong)) : []); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, hamCuaMan) { return { chinh: chinh.slice(), hamCuaMan: sao(hamCuaMan || []) }; }
  function o(x, y) { return { x: x, y: y }; }
  /** Đám cháy ở (x, y), cỡ suc (số lần tia nước trúng mới tắt). */
  function lua(x, y, suc) { return { x: x, y: y, suc: suc }; }
  /** Nhóm nối: van (x, y) mở các cửa [[x, y], …]. */
  function noi(x, y, cua) { return { nut: o(x, y), cua: cua.map(function (c) { return o(c[0], c[1]); }) }; }
  /** Lời sai viết cứng (đếm số bước / số lần phun theo một ngày): thua ở ít nhất một ngày. */
  function cung(moTa, baiLam, phaiCoMa) { return { moTa: moTa, baiLam: baiLam, phaiCoMa: phaiCoMa, cung: true }; }
  /** Dập lửa trước mũi: còn nóng thì phun nhẹ (lửa trong tầm hai ô). */
  var DAP = WHILE('warm()', ['squirt("low")']);
  /** Dập lửa xa gần tuỳ ý: còn nóng thì auto_spray() (gói 6: xa thì mạnh, gần thì nhẹ). */
  var DAP_XA = WHILE('warm()', ['auto_spray()']);

  /**
   * Điền trường chung. Mọi màn: XE CỨU HỎA ĐẦY ĐỦ (xích + vòi phun + hồng ngoại), xichDay + lucBan, KHÔNG beSung; 2–3 sân ("ngày"),
   * batDau một ô thì dùng chung cho mọi ngày; sao.nhip = tổng nhịp mọi ngày.
   */
  function man(m) {
    m.hang = m.hang || (m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum');
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'xich';
    m.robot = { than: 'xich', tay: 'hoi', camBien: HN };
    m.hamGoc = BANH.concat(MAT);
    m.xichDay = true;
    m.lucBan = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (!m.mucTieu) m.mucTieu = 'toi-co';
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    m.taoHam = m.taoHam || [];
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- chương tong-hop-2 "Dập lửa": sân, chương trình */

  // 1 (trình diễn): hành lang, xe (1,1) quay phải, cờ cuối hành lang. Ngày 1: lửa cỡ 1 cách hai ô (phun nhẹ tới); ngày 2: lửa cỡ 2 sát mũi, hành lang ngắn hơn.
  var SAN_T1 = [['########', '#.....F#', '########'], ['#######', '#....F#', '#######']];
  var LUA_T1 = [[lua(3, 1, 1)], [lua(2, 1, 2)]];
  var L_T1 = nhieu(DAP, ['go_to_wall()']);
  // 2: em tự viết. Ngày 1: lửa cỡ 3 sát mũi; ngày 2: lửa cỡ 1 cách hai ô, hành lang dài hơn.
  var SAN_T2 = [['########', '#.....F#', '########'], ['########', '#.....F#', '########']];
  var LUA_T2 = [[lua(2, 1, 3)], [lua(3, 1, 1)]];
  // 3 (lực phun): ngày 1 lửa cỡ 1 cách ba ô (phun nhẹ không tới: auto_spray chọn mạnh; xe ở đầu hành lang, tường sau lưng nên không giật); ngày 2 lửa cỡ 2 sát mũi.
  var SAN_T3 = [['#########', '#......F#', '#########'], ['########', '#.....F#', '########']];
  var LUA_T3 = [[lua(5, 1, 1)], [lua(2, 1, 2)]];
  var L_T3 = nhieu(DAP_XA, ['go_to_wall()']);
  // 4 (đẩy thùng): xe (2,1) làn trên quay phải; sidestep() xuống làn dưới (2,2); trước mũi là đám cháy (cỡ 1 / 2, cách 0 / 1 ô) rồi thùng gần / xa, ô đích cách thùng hai ô: push(2).
  var SAN_T4 = [['########', '#......#', '##..H.D#', '########'], ['#########', '#.......#', '##...H.D#', '#########']];
  var LUA_T4 = [[lua(3, 2, 1)], [lua(4, 2, 2)]];
  var L_T4 = nhieu(['sidestep()'], DAP, ['push(2)']);
  // 5 (van + cửa, bù giật): xe (2,1) quay phải, ô sau lưng (1,1) trống; lửa gần / xa, to nhỏ; van cuối hành lang mở cửa dưới chân xe (2,2); cờ (2,3).
  //   fence_shot() của gói 8: phun mạnh (xe giật lùi một ô) rồi tiến một ô bù lại. Ngày 2 lửa ở xa: auto_spray mạnh, xe giật tới sát tường, fence_shot không giật nữa
  //   nhưng tiến một ô đúng về trạm.
  var SAN_T5 = [['#######', '#....N#', '##C####', '##F####', '#######'], ['########', '#.....N#', '##C#####', '##F#####', '########']];
  var LUA_T5 = [[lua(3, 1, 1)], [lua(5, 1, 2)]];
  var NOI_T5 = [[noi(5, 1, [[2, 2]])], [noi(6, 1, [[2, 2]])]];
  var L_T5 = nhieu(DAP_XA, ['fence_shot()', 'tr_right()', 'forward(2)']);
  // 6 (sửa hàm): xe (3,4) quay phải ở trạm; giếng trên: lửa (cỡ 1 sát / cỡ 2 cách một ô) chắn van (3,1) cách hai ô (phải phun mạnh; sau lưng là van dưới nên không giật);
  //   van dưới (3,5) sát đuôi: phun nhẹ ra sau là tới. Van trên mở cửa (4,4), van dưới mở cửa (5,4); cờ (6,4).
  var SAN_T6 = [['########', '###N####', '###.####', '###.####', '###.CCF#', '###N####', '########'], ['########', '###N####', '###.####', '###.####', '###.CCF#', '###N####', '########']];
  var LUA_T6 = [[lua(3, 3, 1)], [lua(3, 2, 2)]];
  var NOI_T6 = [[noi(3, 1, [[4, 4]]), noi(3, 5, [[5, 4]])], [noi(3, 1, [[4, 4]]), noi(3, 5, [[5, 4]])]];
  var C_T6 = ['tr_left()', 'pair_spray()', 'tr_right()', 'forward(3)'];
  var T_PAIR = nhieu(DAP, ['squirt("high")', 'squirt_back("low")']);
  var T_PAIR_LOI = ['squirt("high")', 'squirt_back("low")'];
  // 7 (hàm của màn douse()): hành lang rồi rẽ xuống giếng tới cờ; hai đám cháy to nhỏ, xa gần khác nhau mỗi ngày; chương trình chính khóa: douse(), go_to_wall() hai lượt.
  var SAN_T7 = [['########', '#......#', '######.#', '######.#', '######.#', '######F#', '########'], ['#######', '#.....#', '#####.#', '#####.#', '#####F#', '#######']];
  var LUA_T7 = [[lua(3, 1, 1), lua(6, 3, 3)], [lua(2, 1, 2), lua(5, 3, 1)]];
  var C_T7 = ['douse()', 'go_to_wall()', 'tr_right()', 'douse()', 'go_to_wall()'];
  var T_DOUSE = DAP;
  // 8 (băng chuyền + chờ bằng cảm biến, gói 4 + gói 9): hành lang (1..7, 3) cắt ngang băng chuyền dọc x = 4 chở thùng nặng xuống; lửa (2,3) cỡ 1 / 3.
  //   Ngày 1 thùng tới ngã tư đúng lúc xe tới: step_clear() của gói Đội (sát vật thì chờ, rồi tiến); ngày 2 lửa to hơn nên thùng đã qua.
  var SAN_T8 = [['#########', '####.####', '####v####', '#...v..F#', '####v####', '####.####', '#########'], ['#########', '####.####', '####v####', '#...v..F#', '####v####', '####.####', '#########']];
  var LUA_T8 = [[lua(2, 3, 1)], [lua(2, 3, 3)]];
  var THUNG_T8 = [[o(4, 2)], [o(4, 2)]];
  var L_T8 = nhieu(DAP, FOR(6, ['step_clear()']));
  // 9 (hàng rào, gói 8): hành lang tới cửa; trạm là ô cách cửa một ô (go_safe(1)); giếng trái: lửa, rồi hàng rào (tia qua, xe không), rồi van mở cửa; hốc dưới trạm để xe giật.
  //   Ngày 1 trạm (2,4), lửa cỡ 2 sát; ngày 2 trạm (4,4), lửa cỡ 1 cách một ô.
  var SAN_T9 = [['########', '##N#####', '##=#####', '##.#####', '#...CF##', '##.#####', '########'], ['##########', '####N#####', '####=#####', '####.#####', '####.#####', '#.....CF##', '####.#####', '##########']];
  var LUA_T9 = [[lua(2, 3, 2)], [lua(4, 3, 1)]];
  var NOI_T9 = [[noi(2, 1, [[4, 4]])], [noi(4, 1, [[6, 5]])]];
  var BD_T9 = [{ x: 1, y: 4, huong: 1 }, { x: 1, y: 5, huong: 1 }];
  var L_T9 = nhieu(['go_safe(1)', 'tr_left()'], DAP, ['fence_shot()', 'tr_right()', 'go_to_wall()']);
  // 10 (trùm, ba sân, một chương trình): xe (1,1) quay phải ở đầu hành lang cháy (tường sau lưng: phun mạnh không giật); đám cháy cỡ 1 / 2 / 3, gần xa khác nhau;
  //   hành lang dài 5 / 7 / 9 ô rồi tường; cờ ở cuối giếng hai ô phía dưới đầu kia. while warm(): squirt("high"), go_to_wall(), tr_right(), forward(2).
  var SAN_T10 = [
    ['#######', '#.....#', '#####.#', '#####F#', '#######'],
    ['#########', '#.......#', '#######.#', '#######F#', '#########'],
    ['###########', '#.........#', '#########.#', '#########F#', '###########']
  ];
  var LUA_T10 = [[lua(3, 1, 1)], [lua(5, 1, 2)], [lua(2, 1, 3)]];
  var L_T10 = WHILE('warm()', ['squirt("high")']).concat(['go_to_wall()', 'tr_right()', 'forward(2)']);

  /* ------------------------------------------------------------------- chương trum-mua-2 "Chế lệnh: dập lửa": sân, chương trình */

  // 1: xe (1,1) quay phải; đám cháy sát mũi rồi hành lang tới góc (4,1), rẽ xuống: đám cháy sát mũi; cờ (4,4). Ngày 1 cỡ 3 + 1, ngày 2 cỡ 1 + 2.
  var SAN_U1 = [['######', '#....#', '####.#', '####.#', '####F#', '######'], ['######', '#....#', '####.#', '####.#', '####F#', '######']];
  var LUA_U1 = [[lua(2, 1, 3), lua(4, 2, 1)], [lua(2, 1, 1), lua(4, 2, 2)]];
  var C_U1 = ['put_out()', 'forward(3)', 'tr_right()', 'put_out()', 'forward(3)'];
  var T_PUT = DAP;
  // 2 (dap-lua): hành lang (1..6, 3), xe (1,3) quay phải; hai giếng trái đang cháy (sát / cách một ô, to nhỏ đổi theo ngày); cờ (7,3). Lửa không chắn đường: phải dập hết.
  var SAN_U2 = [['#########', '######.##', '###.##.##', '#......F#', '#########'], ['#########', '###.##.##', '###.##.##', '#......F#', '#########']];
  var LUA_U2 = [[lua(3, 2, 1), lua(6, 1, 2)], [lua(3, 1, 2), lua(6, 2, 1)]];
  var C_U2 = ['forward(2)', 'put_out_left()', 'forward(3)', 'put_out_left()', 'move()'];
  var T_PUTL = ['tr_left()', 'put_out()', 'tr_right()'];
  // 3 (sửa hàm): hành lang (1..7, 1), xe (1,1) quay phải; lửa ở xa (cách hai, ba ô: phun nhẹ không tới); góc (7,1) rẽ xuống, lửa xa; cờ (7,6). put_far() của Sola phun nhẹ: lặp mãi.
  //   Xe ở đầu hành lang và ở góc đều có tường sau lưng: phun mạnh không giật. Chương trình chính: put_far(), go_to_wall() hai lượt.
  var SAN_U3 = [['#########', '#.......#', '#######.#', '#######.#', '#######.#', '#######.#', '#######F#', '#########'], ['#########', '#.......#', '#######.#', '#######.#', '#######.#', '#######.#', '#######F#', '#########']];
  var LUA_U3 = [[lua(4, 1, 2), lua(7, 5, 1)], [lua(5, 1, 1), lua(7, 4, 2)]];
  var C_U3 = ['put_far()', 'go_to_wall()', 'tr_right()', 'put_far()', 'go_to_wall()'];
  var T_PUTFAR_LOI = DAP;
  var T_PUTFAR = WHILE('warm()', ['squirt("high")']);
  // 4 (tham số, dap-lua): hành lang (1..7, 3), xe (1,3) quay phải; ba giếng trái cách đều hai ô, lửa to nhỏ / sát hay cách một ô đổi theo ngày; cờ (8,3). clear_row(3), move().
  var SAN_U4 = [['##########', '###.#.#.##', '###.#.#.##', '#.......F#', '##########'], ['##########', '###.#.#.##', '###.#.#.##', '#.......F#', '##########']];
  var LUA_U4 = [[lua(3, 2, 1), lua(5, 1, 2), lua(7, 2, 1)], [lua(3, 1, 2), lua(5, 2, 1), lua(7, 1, 2)]];
  var C_U4 = ['clear_row(3)', 'move()'];
  var T_ROW = FOR('n', ['forward(2)', 'put_out_left()']);
  // 5 (chờ bằng cảm biến, một robot: thay màn đội cũ, giữ mã): hành lang (1..9, 4), xe (1,4) quay phải, lửa ở trạm (4,4); trên trạm là giếng (4,3) rồi băng chuyền ngang
  //   (hàng 2, chạy sang phải) chở thùng nặng, rồi van (4,1) mở cửa (5,4); cờ (9,4). Thùng trên băng đi ngang qua giếng thì chắn tia: box_spray() chờ tới khi giếng trống
  //   (distance() == 2 là tới van) rồi phun mạnh (sau lưng trạm là tường: không giật). Ngày 1 lửa nhỏ, thùng đã đi qua; ngày 2 lửa to hơn nhưng thùng tới giếng đúng lúc
  //   (ngày phải chờ là ngày lửa to: dãy cố định "phun hai lần" không thay được nhịp chờ, nên tổng nhịp của nó quá ngưỡng).
  var SAN_U5 = [['###########', '####N######', '#>>>>>>>..#', '####.######', '#....C...F#', '###########'], ['###########', '####N######', '#>>>>>>>..#', '####.######', '#....C...F#', '###########']];
  var LUA_U5 = [[lua(4, 4, 1)], [lua(4, 4, 2)]];
  var NOI_U5 = [[noi(4, 1, [[5, 4]])], [noi(4, 1, [[5, 4]])]];
  var THUNG_U5 = [[o(2, 2)], [o(1, 2)]];
  var C_U5 = ['forward(2)', 'put_out()', 'move()', 'tr_left()', 'box_spray()', 'tr_right()', 'forward(5)'];
  var T_BOXS = WHILE('distance() < 2', ['wait()']).concat(['squirt("high")']);
  // 6 (hàm gọi hàm, day-thung): hai làn gấp khúc, mỗi làn: lửa trước thùng, thùng xa gần khác nhau, van ở xa bên trái khi xe đứng sát thùng (sau lưng là tường: không giật),
  //   cửa ngay sau thùng, ô đích sau cửa. gate_push(): go_to_wall() tới sát thùng, squirt_left("high") mở cửa, push(2).
  var SAN_U6 = [
    ['##N######', '##.######', '#..HCD###', '####.####', '####...N#', '####H####', '####C####', '####D####', '#########'],
    ['###N#####', '###.#####', '#...HCD##', '#####.###', '#####.###', '#####..N#', '#####H###', '#####C###', '#####D###', '#########']
  ];
  var LUA_U6 = [[lua(2, 2, 2)], [lua(2, 2, 1)]];
  var NOI_U6 = [[noi(2, 0, [[4, 2]]), noi(7, 4, [[4, 6]])], [noi(3, 0, [[5, 2]]), noi(7, 5, [[5, 7]])]];
  var C_U6 = ['put_out()', 'gate_push()', 'tr_right()', 'gate_push()'];
  var T_GATE = ['go_to_wall()', 'squirt_left("high")', 'push(2)'];
  // 7 (hàm gọi hàm): hành lang (1..7, 3), xe (1,3) quay phải; hai trạm (2,3), (5,3): giếng trái đang cháy (sát / cách một ô, to nhỏ đổi theo ngày) chắn van (·,0) cách hai ô
  //   sau khi hết lửa; hốc dưới trạm để xe giật; van mở cửa (3,3), (6,3); cờ (7,3). fire_valve() = tr_left(), put_out(), fence_shot(), tr_right().
  var SAN_U7 = [['##N##N###', '##.##.###', '##.##.###', '#..C..CF#', '##.##.###', '#########'], ['##N##N###', '##.##.###', '##.##.###', '#..C..CF#', '##.##.###', '#########']];
  var LUA_U7 = [[lua(2, 2, 1), lua(5, 2, 2)], [lua(2, 1, 2), lua(5, 2, 1)]];
  var NOI_U7 = [[noi(2, 0, [[3, 3]]), noi(5, 0, [[6, 3]])], [noi(2, 0, [[3, 3]]), noi(5, 0, [[6, 3]])]];
  var C_U7 = ['move()', 'fire_valve()', 'forward(3)', 'fire_valve()', 'forward(2)'];
  var T_FV = ['tr_left()', 'put_out()', 'fence_shot()', 'tr_right()'];
  // 8 (đố, dap-lua): xe (1,3) quay phải; giếng trái ở (3,·): lửa (3,2) sát trạm, van (3,0) ở cuối giếng nối cánh cửa (4,3) đang MỞ; cờ (6,3); sau lưng trạm là tường (không giật).
  //   Sola phun mạnh hai lần cho chắc: ngày lửa một ngọn, lần thừa bay qua chỗ lửa đã tắt, trúng van, cửa đóng lại; ngày lửa hai ngọn thì vừa đủ.
  var SAN_U8 = [['########', '###N####', '###.####', '###.####', '#...c.F#', '########'], ['########', '###N####', '###.####', '###.####', '#...c.F#', '########']];
  var LUA_U8 = [[lua(3, 3, 1)], [lua(3, 3, 2)]];
  var NOI_U8 = [[noi(3, 1, [[4, 4]])], [noi(3, 1, [[4, 4]])]];
  var M_U8 = ['forward(2)', 'tr_left()', 'squirt("high")', 'squirt("high")', 'tr_right()', 'forward(3)'];
  var L_U8 = ['forward(2)', 'tr_left()', 'put_out()', 'tr_right()', 'forward(3)'];
  // 9 (biến, day-thung): đường rắn ba đoạn, mỗi đoạn một thùng; thùng cách xe d ô thì ô đích cách thùng d ô: far_push() = d = distance(), push(d). Lửa trước thùng đầu.
  //   Ngày 1 d = 1 / 2 / 1 (xe (4,4) quay lên); ngày 2 d = 2 / 1 / 2 (xe (4,6) quay lên).
  var SAN_U9 = [
    ['###########', '####D######', '####H..H.D#', '####.###.##', '####.###H##', '########D##', '###########'],
    ['###########', '####D######', '####..HD###', '####H#.####', '####.#.####', '####.#H####', '####.#.####', '######D####', '###########']
  ];
  var LUA_U9 = [[lua(4, 3, 2)], [lua(4, 5, 1)]];
  var BD_U9 = [{ x: 4, y: 4, huong: 0 }, { x: 4, y: 6, huong: 0 }];
  var C_U9 = ['put_out()', 'far_push()', 'tr_right()', 'far_push()', 'tr_right()', 'far_push()'];
  var T_FAR = ['d = distance()', 'push(d)'];
  // 10 (TRÙM CUỐI MÙA 2, hai dây chuyền, một chương trình): xe (1,3) quay phải ở trạm đầu hành lang: lửa sát mũi (cỡ 1 / 3), giếng trái đang cháy (cỡ 1 / 2) chắn van (1,0)
  //   mở cửa trên hành lang; hốc (1,4) để xe giật. Hành lang dài ngắn khác nhau, hết ở tường: go_to_wall(). Né xuống làn dưới (sidestep): thùng xa gần khác nhau, van ở xa
  //   bên trái khi đứng sát thùng (giếng riêng, tường ngăn với hành lang), cửa ngay sau thùng, ô đích sau cửa: gate_push().
  var SAN_U10 = [
    ['#N##########', '#.#####N####', '#.#####.####', '#...C.#.####', '#.###...HCD#', '############'],
    ['#N#############', '#.########N####', '#.########.####', '#....C...#.####', '#.######...HCD#', '###############']
  ];
  var LUA_U10 = [[lua(2, 3, 1), lua(1, 2, 1)], [lua(2, 3, 3), lua(1, 1, 2)]];
  var NOI_U10 = [[noi(1, 0, [[4, 3]]), noi(7, 1, [[9, 4]])], [noi(1, 0, [[5, 3]]), noi(10, 1, [[12, 4]])]];
  var L_U10 = ['put_out()', 'fire_valve()', 'go_to_wall()', 'sidestep()', 'gate_push()'];
  var M_U10 = ['put_out()', 'fire_valve()', 'forward(4)', 'sidestep()', 'forward(2)', 'squirt_left("high")', 'push(2)'];

  var DS = [
    /* ================================================================ chương tong-hop-2: Dập lửa */
    man({
      chuong: 'tong-hop-2', so: 1, ten: 'Đám cháy đầu tiên', yMoi: 'trình diễn: đám cháy chắn lối như tường, warm() thấy lửa nóng; while warm(): phun nhẹ tới khi tắt hẳn rồi đi tới cờ',
      kieuBai: 'trinh-dien', chiChay: true, chinhCoDinh: true, hamCuaEmCan: ['squirt', 'go_to_wall', 'forward', 'move'],
      deBai: 'Nhà máy của Sola bốc cháy! Đám cháy chắn ngang hành lang: còn cháy thì xe không đi qua được, như gặp tường. Mỗi lần tia nước trúng, lửa nhỏ đi một ngọn; hết ngọn thì tắt hẳn. ' +
        'Mỗi ngày lửa to nhỏ, xa gần khác nhau. Bấm Chạy xem: còn nóng thì phun nhẹ, hết nóng thì go_to_wall() tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, xem cả hai ngày: warm() còn True là còn lửa.',
      san: SAN_T1, batDau: { x: 1, y: 1, huong: 1 }, lua: LUA_T1,
      maMau: bai(L_T1),
      sao: { o: 10, nhip: 12 },
      loiGiai: bai(L_T1),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# còn nóng là còn lửa'].concat(L_T1)) },
      loiSai: [
        { moTa: 'Đi ngay chưa dập lửa: xe đâm vào đám cháy', baiLam: bai(['forward(5)']), phaiCoMa: ['dam-tuong'] },
        cung('Đếm cứng theo ngày đầu: phun một lần rồi đi năm ô; ngày sau lửa hai ngọn, xe đâm vào', bai(['squirt("low")', 'forward(5)']), ['dam-tuong'])
      ],
      goiY: ['Số ngọn lửa là số lần tia nước phải trúng.', 'warm() hỏi được bao nhiêu lần cũng được: while warm(): squirt("low").']
    }),

    man({
      chuong: 'tong-hop-2', so: 2, ten: 'Lửa to', yMoi: 'em tự viết while warm(): lửa một hay ba ngọn đều tắt hẳn; đếm cứng số lần phun thì sai ở ngày lửa to',
      kieuBai: 'lua-to', hamCuaEmCan: ['squirt', 'go_to_wall', 'forward', 'move'],
      deBai: 'Hôm nay đám cháy ba ngọn ngay trước mũi xe, hôm sau một ngọn ở xa hơn. Viết một chương trình đúng cho cả hai ngày: còn nóng thì phun nhẹ, rồi go_to_wall() tới cờ.',
      veMaMau: 'Chương trình có sẵn phun một lần rồi đi: ngày lửa ba ngọn, xe dừng trước đám cháy.',
      san: SAN_T2, batDau: { x: 1, y: 1, huong: 1 }, lua: LUA_T2,
      maMau: bai(['squirt("low")', 'go_to_wall()']),
      sao: { o: 10, nhip: 14 },
      loiGiai: bai(L_T1),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# phun tới khi hết nóng'].concat(L_T1)) },
      congThucKhac: [{ moTa: 'Phun cố định ba lần: cả hai ngày đều tắt, nhưng ngày lửa một ngọn phí hai nhịp', baiLam: bai(FOR(3, ['squirt("low")']).concat(['go_to_wall()'])) }],
      loiSai: [
        { moTa: 'Để nguyên một lần phun: ngày lửa ba ngọn, xe dừng trước đám cháy', baiLam: bai(['squirt("low")', 'go_to_wall()']), phaiCoMa: ['chua-toi-co'] },
        cung('Đếm cứng: phun hai lần rồi đi năm ô; ngày ba ngọn xe đâm vào lửa', bai(['squirt("low")', 'squirt("low")', 'forward(5)']), ['dam-tuong']),
        { moTa: 'Viết while not warm(): lửa đang nóng nên không phun lần nào', baiLam: bai(WHILE('not warm()', ['squirt("low")']).concat(['go_to_wall()'])), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Đếm ngọn lửa bằng warm(): còn nóng thì phun tiếp.', 'while warm(): squirt("low"), rồi go_to_wall().']
    }),

    man({
      chuong: 'tong-hop-2', so: 3, ten: 'Lửa ở xa', yMoi: 'ôn lực phun (gói 6): lửa cách ba ô thì phun nhẹ không tới; auto_spray() xa thì mạnh, gần thì nhẹ',
      kieuBai: 'luc-phun', hamCuaEmCan: ['auto_spray', 'squirt', 'go_to_wall', 'forward', 'move'],
      deBai: 'Hôm nay đám cháy ở xa, cách ba ô: phun nhẹ chỉ bay hai ô rồi rơi, phải phun mạnh. Hôm sau lửa hai ngọn ngay sát mũi. ' +
        'auto_spray() của gói Lực phun tự chọn: xa thì mạnh, gần thì nhẹ. Xe đứng đầu hành lang, tường sau lưng nên phun mạnh không giật.',
      veMaMau: 'Chương trình có sẵn phun nhẹ một lần: ngày lửa ở xa, tia nước rơi giữa đường.',
      san: SAN_T3, batDau: { x: 1, y: 1, huong: 1 }, lua: LUA_T3,
      maMau: bai(['squirt("low")', 'go_to_wall()']),
      sao: { o: 14, nhip: 14 },
      loiGiai: bai(L_T3),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# xa thì mạnh, gần thì nhẹ'].concat(L_T3)) },
      congThucKhac: [{ moTa: 'Phun mạnh tới khi hết nóng (tường sau lưng, không giật)', baiLam: bai(WHILE('warm()', ['squirt("high")']).concat(['go_to_wall()'])) }],
      loiSai: [
        { moTa: 'Phun nhẹ tới khi hết nóng: ngày lửa ở xa, tia nước không bao giờ tới, lặp mãi', baiLam: bai(nhieu(DAP, ['go_to_wall()'])), phaiCoMa: ['vong-vo-han'] },
        cung('Đếm cứng: phun mạnh một lần rồi đi sáu ô; ngày lửa hai ngọn, xe đâm vào', bai(['squirt("high")', 'forward(6)']), ['dam-tuong'])
      ],
      goiY: ['Phun nhẹ bay tối đa hai ô; phun mạnh bay tới vật cản đầu tiên.', 'while warm(): auto_spray(), rồi go_to_wall().']
    }),

    man({
      chuong: 'tong-hop-2', so: 4, ten: 'Thùng ở làn dưới', yMoi: 'ôn sidestep() của gói Bánh xích + xích đẩy thùng (gói 5): làn dưới đang cháy trước thùng; thùng xa gần khác nhau nên push(2) chứ không đếm bước',
      kieuBai: 'day-thung', mucTieu: 'day-thung', hamCuaEmCan: ['sidestep', 'push', 'squirt', 'forward', 'move'],
      deBai: 'Thùng hàng nằm ở làn dưới, xe xích đứng ở làn trên. Né xuống bằng sidestep() của gói Bánh xích; nhưng làn dưới đang cháy, lửa chắn giữa xe và thùng ' +
        '(mỗi ngày to nhỏ, xa gần khác). Dập lửa rồi đẩy thùng hai ô vào ô đích bằng push(2) của gói Đẩy thùng: thùng mỗi ngày một chỗ.',
      veMaMau: 'Chương trình có sẵn né xuống rồi đẩy ngay: xe đâm vào lửa.',
      san: SAN_T4, batDau: { x: 2, y: 1, huong: 1 }, lua: LUA_T4,
      maMau: bai(['sidestep()', 'push(2)']),
      sao: { o: 21, nhip: 20 },
      loiGiai: bai(L_T4),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# xuống làn dưới, dập lửa, đẩy'].concat(L_T4)) },
      loiSai: [
        { moTa: 'Né xuống rồi đẩy ngay: xe đâm vào lửa', baiLam: bai(['sidestep()', 'push(2)']), phaiCoMa: ['dam-tuong'] },
        cung('Đếm cứng: phun nhẹ một lần; ngày lửa hai ngọn xe đâm vào', bai(['sidestep()', 'squirt("low")', 'push(2)']), ['dam-tuong']),
        cung('Đếm cứng forward(3) theo ngày đầu thay push(2): ngày thùng ở xa, thùng chưa tới ô đích', bai(nhieu(['sidestep()'], DAP, ['forward(3)'])), ['chua-day-thung'])
      ],
      goiY: ['sidestep() xuống làn dưới, quay lại hướng cũ; rồi while warm(): squirt("low").', 'push(2) tự tới sát thùng rồi đẩy đúng hai ô.']
    }),

    man({
      chuong: 'tong-hop-2', so: 5, ten: 'Van cuối hành lang', yMoi: 'ôn van mở cửa (gói 4) + bù giật (gói 8): phun mạnh thì xe giật lùi một ô, fence_shot() tiến lại; lửa xa gần chắn tia',
      kieuBai: 'mo-cua', hamCuaEmCan: ['auto_spray', 'fence_shot', 'squirt', 'tr_right', 'forward', 'move'],
      deBai: 'Van ở cuối hành lang mở cánh cửa ngay dưới chân xe; cờ ở sau cửa. Giữa đường có đám cháy chắn tia nước, mỗi ngày xa gần, to nhỏ khác. ' +
        'Dập lửa bằng while warm(): auto_spray(). Rồi phun mạnh mở van: xe giật lùi một ô, nên dùng fence_shot() của Góc kho cũ (phun mạnh rồi tiến một ô bù lại). Quay phải, hai ô tới cờ.',
      veMaMau: 'Chương trình có sẵn phun mạnh ngay: tia trúng lửa, xe giật lùi, rẽ phải đâm tường.',
      san: SAN_T5, batDau: { x: 2, y: 1, huong: 1 }, lua: LUA_T5, noi: NOI_T5,
      maMau: bai(['squirt("high")', 'tr_right()', 'forward(2)']),
      sao: { o: 21, nhip: 15 },
      loiGiai: bai(L_T5),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# dập lửa, mở van, bù cú giật'].concat(L_T5)) },
      loiSai: [
        cung('Đếm cứng: phun nhẹ rồi phun mạnh; ngày lửa ở xa, phun nhẹ không tới, van chưa mở, cửa đóng', bai(['squirt("low")', 'squirt("high")', 'move()', 'tr_right()', 'forward(2)']), ['dam-tuong']),
        { moTa: 'Quên bù giật: xe lùi một ô rồi rẽ phải vào tường', baiLam: bai(nhieu(DAP_XA, ['squirt("high")', 'tr_right()', 'forward(2)'])), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Phun nhẹ mở van: van ở xa, tia nước rơi giữa hành lang, cửa đóng', baiLam: bai(nhieu(DAP_XA, ['squirt("low")', 'tr_right()', 'forward(2)'])), phaiCoMa: ['ban-ngan', 'dam-tuong'] }
      ],
      goiY: ['Lửa chắn tia: dập trước, mở van sau.', 'fence_shot() = squirt("high"), move(): giật lùi rồi tiến lại đúng trạm.']
    }),

    man({
      chuong: 'tong-hop-2', so: 6, ten: 'Sửa hàm pair_spray()', yMoi: 'sửa hàm lỗi: lửa chắn tia trước van trên; dập lửa, phun mạnh mở van trên, phun nhẹ ra sau mở van dưới (gói 4 + gói 6)',
      kieuBai: 'sua-ham', chinhCoDinh: true, hamCuaEmCan: ['squirt', 'squirt_back', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Ở trạm có hai van: một ở cuối giếng phía trên cách hai ô, một ngay sau đuôi xe; mỗi van mở một cánh cửa phía trước. Xe quay lên ở trạm: van trên trước mặt, van dưới sau lưng. ' +
        'pair_spray() của Sola viết từ trước khi cháy: squirt("high") rồi squirt_back("low"). Nay giếng trên đang cháy (mỗi ngày lửa to nhỏ, xa gần khác), chắn tia tới van trên. ' +
        'Chương trình chính đã khóa. Sửa hàm cho cả hai cửa đều mở, cả hai ngày.',
      veMaMau: 'Chạy thử. Hai cánh cửa: cánh nào mở, cánh nào không?',
      san: SAN_T6, batDau: { x: 3, y: 4, huong: 1 }, lua: LUA_T6, noi: NOI_T6,
      maMau: bai(C_T6, [H('pair_spray', [], T_PAIR_LOI)]),
      sao: { o: 23, nhip: 21 },
      loiGiai: bai(C_T6, [H('pair_spray', [], T_PAIR)]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_T6, [H('pair_spray', [], ['# dập lửa, van trên, van dưới'].concat(T_PAIR))]) },
      congThucKhac: [{ moTa: 'Phun ra sau trước, rồi dập lửa và mở van trên', baiLam: bai(C_T6, [H('pair_spray', [], nhieu(['squirt_back("low")'], DAP, ['squirt("high")']))]) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: lần phun đầu trúng lửa, van trên chưa mở', baiLam: bai(C_T6, [H('pair_spray', [], T_PAIR_LOI)]), phaiCoMa: ['dam-tuong'] },
        cung('Đếm cứng: phun nhẹ một lần rồi phun mạnh; ngày lửa hai ngọn, lần mạnh trúng lửa chứ không trúng van', bai(C_T6, [H('pair_spray', [], ['squirt("low")', 'squirt("high")', 'squirt_back("low")'])]), ['dam-tuong']),
        { moTa: 'Phun mạnh ra sau: van dưới sát đuôi, xe giật TỚI vào giếng rồi rẽ phải đâm tường', baiLam: bai(C_T6, [H('pair_spray', [], nhieu(DAP, ['squirt("high")', 'squirt_back("high")']))]), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Lửa chắn tia: dập trước (while warm(): squirt("low")), rồi squirt("high") mở van trên.', 'Van dưới sát đuôi: squirt_back("low") là đủ, không giật.']
    }),

    man({
      chuong: 'tong-hop-2', so: 7, ten: 'Hai đám cháy', yMoi: 'hàm của màn douse(): while warm() phun tới khi hết nóng; hai đám cháy mỗi ngày cỡ khác, hành lang dài ngắn khác; chương trình chính khóa',
      kieuBai: 'doc-nhiet', chinhCoDinh: true, hamCuaEmCan: ['squirt', 'go_to_wall', 'tr_right', 'forward', 'move'],
      deBai: 'Hành lang có hai đám cháy: một trước mặt, một sau góc rẽ; mỗi ngày to nhỏ, xa gần khác nhau. Chương trình chính đã khóa: douse() rồi go_to_wall(), hai lượt. ' +
        'Viết thân douse() để lần nào gọi cũng dập tắt hẳn lửa trước mũi xe, dù lửa to hay nhỏ.',
      veMaMau: 'Chương trình chính bị khóa. douse() có sẵn phun một lần: đám ba ngọn còn hai ngọn.',
      san: SAN_T7, batDau: { x: 1, y: 1, huong: 1 }, lua: LUA_T7,
      maMau: bai(C_T7, [H('douse', [], ['squirt("low")'])]),
      sao: { o: 17, nhip: 27 },
      loiGiai: bai(C_T7, [H('douse', [], T_DOUSE)]),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(C_T7, [H('douse', [], ['# còn nóng là còn lửa'].concat(T_DOUSE))]) },
      congThucKhac: [{ moTa: 'Phun cố định ba lần: tắt được mọi đám nhưng phí nhịp ở đám nhỏ', baiLam: bai(C_T7, [H('douse', [], FOR(3, ['squirt("low")']))]) }],
      loiSai: [
        cung('Để nguyên một lần phun: đám ba ngọn còn cháy, xe dừng trước lửa', bai(C_T7, [H('douse', [], ['squirt("low")'])]), ['chua-toi-co']),
        { moTa: 'Viết if warm(): chỉ phun một lần như cũ', baiLam: bai(C_T7, [H('douse', [], IF('warm()', ['squirt("low")']))]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết while not warm(): lửa đang nóng nên không phun lần nào, go_to_wall() không bao giờ tới', baiLam: bai(C_T7, [H('douse', [], WHILE('not warm()', ['squirt("low")']))]), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['warm() là True khi trước mũi xe còn lửa.', 'Thân douse(): while warm(): squirt("low").']
    }),

    man({
      chuong: 'tong-hop-2', so: 8, ten: 'Thùng qua ngã tư', yMoi: 'ôn băng chuyền (gói 4) + chờ bằng cảm biến (gói Đội): băng chở thùng cắt ngang hành lang; step_clear() sát vật thì chờ rồi tiến',
      kieuBai: 'cho-thung', hamCuaEmCan: ['step_clear', 'yield_step', 'wait_clear', 'squirt', 'forward', 'move'],
      deBai: 'Băng chuyền dọc chở một thùng nặng xuống, cắt ngang hành lang của xe. Đầu hành lang đang cháy (mỗi ngày to nhỏ khác), nên có ngày thùng tới ngã tư đúng lúc xe tới, có ngày đã đi qua. ' +
        'Dập lửa, rồi đi sáu bước bằng step_clear() của gói Đội: có gì sát mũi thì chờ, trống thì tiến.',
      veMaMau: 'Chương trình có sẵn dập lửa rồi forward(6): ngày thùng đang ở ngã tư, xe húc thùng ra khỏi băng.',
      san: SAN_T8, batDau: { x: 1, y: 3, huong: 1 }, lua: LUA_T8, thungThem: THUNG_T8,
      maMau: bai(nhieu(DAP, ['forward(6)'])),
      sao: { o: 12, nhip: 17 },
      loiGiai: bai(L_T8),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# sát thùng thì chờ'].concat(L_T8)) },
      congThucKhac: [{ moTa: 'Viết thẳng vòng while distance() == 0: wait() rồi move()', baiLam: bai(nhieu(DAP, FOR(6, WHILE('distance() == 0', ['wait()']).concat(['move()'])))) }],
      loiSai: [
        cung('Đếm cứng forward(6): ngày thùng đang ở ngã tư, xe húc thùng ra khỏi băng, thùng chắn cờ', bai(nhieu(DAP, ['forward(6)'])), ['chua-toi-co']),
        { moTa: 'Dùng yield_step() (chờ khi warm()): thùng không nóng, xe vẫn húc thùng', baiLam: bai(nhieu(DAP, FOR(6, ['yield_step()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng wait_clear() như gói Đội để chờ lửa: lửa không tự tắt, chờ mãi', baiLam: bai(nhieu(['wait_clear()'], DAP, FOR(6, ['step_clear()']))), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['distance() là 0 khi ngay trước mũi có thùng.', 'for i in range(6): step_clear().']
    }),

    man({
      chuong: 'tong-hop-2', so: 9, ten: 'Van sau rào', yMoi: 'ôn Góc kho cũ (gói 8): tia nước bay qua hàng rào, xe không; go_safe(1) dừng cách cửa một ô để trạm mỗi ngày một chỗ',
      kieuBai: 'rao', hamCuaEmCan: ['go_safe', 'go_to_wall', 'fence_shot', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Hành lang tới cánh cửa đóng; trạm là ô cách cửa một ô (mỗi ngày hành lang dài ngắn khác: go_safe(1) của gói Hồng ngoại). Bên trái trạm là giếng: đám cháy, ' +
        'rồi hàng rào, rồi van mở cửa. Tia nước bay qua rào, xe thì không. Dập lửa, fence_shot() phun mạnh qua rào (xe giật xuống hốc rồi tiến lại), quay lại, go_to_wall() tới cờ.',
      veMaMau: 'Chương trình có sẵn phun mạnh ngay: tia trúng lửa, van chưa mở; xe giật xuống hốc.',
      san: SAN_T9, batDau: BD_T9, lua: LUA_T9, noi: NOI_T9,
      maMau: bai(['go_safe(1)', 'tr_left()', 'squirt("high")', 'tr_right()', 'go_to_wall()']),
      sao: { o: 24, nhip: 25 },
      loiGiai: bai(L_T9),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# dập lửa, phun qua rào, bù giật'].concat(L_T9)) },
      loiSai: [
        cung('Đếm cứng theo ngày đầu: đi một ô rồi phun; ngày sau trạm ở xa hơn, tia trúng tường', bai(nhieu(['move()', 'tr_left()'], DAP, ['fence_shot()', 'tr_right()', 'go_to_wall()'])), ['chua-toi-co']),
        { moTa: 'Phun mạnh không bù giật: xe tụt xuống hốc, go_to_wall() húc tường hốc', baiLam: bai(nhieu(['go_safe(1)', 'tr_left()'], DAP, ['squirt("high")', 'tr_right()', 'go_to_wall()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Phun nhẹ qua rào: van ở xa, tia nước rơi trước van', baiLam: bai(nhieu(['go_safe(1)', 'tr_left()'], DAP, ['squirt("low")', 'tr_right()', 'go_to_wall()'])), phaiCoMa: ['ban-ngan', 'chua-toi-co'] }
      ],
      goiY: ['go_safe(1): tiến tới khi trước mũi còn đúng một ô trống (cửa đóng là vật cản).', 'Hốc dưới trạm là để xe giật: fence_shot() tiến lại đúng trạm.']
    }),

    man({
      chuong: 'tong-hop-2', so: 10, ten: 'Trùm: Ba hành lang cháy', yMoi: 'một chương trình cho ba sân: while warm() dập lửa cỡ và xa gần khác nhau, go_to_wall() tới cuối hành lang, rẽ xuống cờ',
      hang: 'trum', kieuBai: 'trum', hamCuaEmCan: ['go_to_wall', 'squirt', 'tr_right', 'forward', 'move'],
      huyHieu: { ma: 'tong-hop-2', ten: 'Huy hiệu Dập lửa' },
      deBai: 'Ba hành lang đang cháy, một chương trình. Đám cháy to nhỏ khác nhau, xa gần khác nhau; hành lang dài ngắn khác nhau. Dập tắt lửa, đi tới cuối hành lang, ' +
        'rẽ phải rồi xuống hai ô tới cờ. Phun mạnh thì tia bay tới lửa ở mọi khoảng cách (tường sau lưng, không giật); warm() còn True là còn lửa.',
      veMaMau: 'Chương trình có sẵn đếm cứng theo sân đầu: sân sau lửa to hơn, hành lang dài hơn.',
      san: SAN_T10, batDau: { x: 1, y: 1, huong: 1 }, lua: LUA_T10,
      maMau: bai(['squirt("high")', 'forward(4)', 'tr_right()', 'forward(2)']),
      sao: { o: 17, nhip: 36 },
      loiGiai: bai(L_T10),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# dập hết lửa, tới tường, rẽ xuống cờ'].concat(L_T10)) },
      congThucKhac: [{ moTa: 'Phun mạnh ba lần cố định: vẫn tới cờ nhưng phí nhịp ở lửa nhỏ', baiLam: bai(FOR(3, ['squirt("high")']).concat(['go_to_wall()', 'tr_right()', 'forward(2)'])) }],
      loiSai: [
        cung('Đếm cứng theo sân đầu: sân sau lửa còn cháy, xe đâm vào', bai(['squirt("high")', 'forward(4)', 'tr_right()', 'forward(2)']), ['dam-tuong']),
        { moTa: 'Phun nhẹ: lửa ở xa, tia nước rơi trước lửa', baiLam: bai(WHILE('warm()', ['squirt("low")']).concat(['go_to_wall()', 'tr_right()', 'forward(2)'])), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Đi tới tường trước rồi mới dập: go_to_wall() dừng ngay trước lửa, rẽ xuống tường', baiLam: bai(['go_to_wall()'].concat(WHILE('warm()', ['squirt("high")']), ['tr_right()', 'forward(2)'])), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['while warm(): squirt("high") dập lửa to nhỏ, xa gần đều được.', 'Rồi go_to_wall(), tr_right(), forward(2).']
    }),

    /* ================================================================ chương trum-mua-2: Chế lệnh: dập lửa */
    man({
      chuong: 'trum-mua-2', so: 1, ten: 'Hàm put_out()', yMoi: 'chế hàm put_out(): while warm() phun nhẹ tới khi hết nóng; chương trình chính khóa gọi ở hai đám cháy, mỗi ngày to nhỏ khác',
      kieuBai: 'che-ham', chinhCoDinh: true, taoHam: ['put_out'], hamCuaEmCan: ['squirt', 'tr_right', 'forward', 'move'],
      deBai: 'Từ giờ em chế lệnh dập lửa cho xe cứu hỏa. put_out(): còn nóng (còn lửa trước mũi) thì phun nhẹ, tới khi hết nóng. Hàm này sẽ theo em suốt chương. ' +
        'Chương trình chính đã khóa: dập đám trước mặt, đi tới góc, quay phải, dập đám sau rồi xuống cờ. Mỗi ngày hai đám to nhỏ đổi chỗ.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo put_out() hai dòng.',
      san: SAN_U1, batDau: { x: 1, y: 1, huong: 1 }, lua: LUA_U1,
      maMau: bai(C_U1),
      sao: { o: 17, nhip: 23 },
      loiGiai: { chinh: C_U1.slice(), hamCuaEmMoi: [H('put_out', [], T_PUT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U1), hamCuaEmMoi: [H('put_out', [], ['# còn nóng là còn lửa'].concat(T_PUT))] },
      congThucKhac: [{ moTa: 'Phun mạnh tới khi hết nóng (tường sau lưng ở cả hai đám)', baiLam: bai(C_U1), hamCuaEmMoi: [H('put_out', [], WHILE('warm()', ['squirt("high")']))] }],
      loiSai: [
        Object.assign(cung('Phun cố định một lần: đám ba ngọn còn hai ngọn, xe đâm vào lửa', bai(C_U1), ['dam-tuong']), { hamCuaEmMoi: [H('put_out', [], ['squirt("low")'])] }),
        { moTa: 'Viết if warm(): chỉ phun một lần', baiLam: bai(C_U1), hamCuaEmMoi: [H('put_out', [], IF('warm()', ['squirt("low")']))], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['warm() là True khi trước mũi xe còn lửa.', 'Thân put_out(): while warm(): squirt("low").']
    }),

    man({
      chuong: 'trum-mua-2', so: 2, ten: 'Hàm put_out_left()', yMoi: 'mục tiêu dập hết lửa: lửa trong giếng bên trái không chắn đường; chế put_out_left() gọi put_out()',
      kieuBai: 'ban-ben', mucTieu: 'dap-lua', chinhCoDinh: true, taoHam: ['put_out_left'], hamCuaEmCan: ['put_out', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Dọc hành lang có hai giếng bên trái đang cháy (mỗi ngày lửa to nhỏ, sát hay cách một ô khác nhau). Lửa không chắn đường đi, nhưng màn này phải dập hết lửa rồi mới về cờ. ' +
        'Em chế put_out_left(): quay trái, gọi put_out() của em, quay lại. Chương trình chính đã khóa.',
      veMaMau: 'Chương trình chính bị khóa. Tạo put_out_left() ba dòng.',
      san: SAN_U2, batDau: { x: 1, y: 3, huong: 1 }, lua: LUA_U2,
      maMau: bai(C_U2),
      sao: { o: 23, nhip: 34 },
      loiGiai: { chinh: C_U2.slice(), hamCuaEmMoi: [H('put_out_left', [], T_PUTL)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U2), hamCuaEmMoi: [H('put_out_left', [], ['# quay trái, dập, quay lại'].concat(T_PUTL))] },
      congThucKhac: [{ moTa: 'Viết thẳng vòng while trong hàm', baiLam: bai(C_U2), hamCuaEmMoi: [H('put_out_left', [], nhieu(['tr_left()'], DAP, ['tr_right()']))] }],
      loiSai: [
        Object.assign(cung('Phun cố định một lần: đám hai ngọn còn một ngọn', bai(C_U2), ['con-lua']), { hamCuaEmMoi: [H('put_out_left', [], ['tr_left()', 'squirt("low")', 'tr_right()'])] }),
        { moTa: 'Quên quay lại: xe đi vào giếng', baiLam: bai(C_U2), hamCuaEmMoi: [H('put_out_left', [], ['tr_left()', 'put_out()'])], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Giống squirt_left() của gói Lực phun, nhưng giữa hai lần quay là put_out().', 'tr_left(), put_out(), tr_right().']
    }),

    man({
      chuong: 'trum-mua-2', so: 3, ten: 'Sửa hàm put_far()', yMoi: 'sửa hàm lỗi: lửa ở xa, phun nhẹ không tới nên while warm() lặp mãi; phải phun mạnh',
      kieuBai: 'sua-ham', chinhCoDinh: true, hamCuaEmCan: ['auto_spray', 'squirt', 'go_to_wall', 'tr_right', 'forward', 'move'],
      deBai: 'Sola chép put_out() thành put_far() cho những đám cháy ở xa. Chạy thử: xe đứng phun mãi, lửa không nhỏ đi. Lửa cách xe hai, ba ô trống: phun nhẹ chỉ bay hai ô. ' +
        'Xe ở đầu hành lang và ở góc đều có tường sau lưng nên phun mạnh không giật. Chương trình chính đã khóa. Sửa put_far() cho tia nước tới được lửa, cả hai ngày.',
      veMaMau: 'Chạy thử. Tia nước rơi ở đâu?',
      san: SAN_U3, batDau: { x: 1, y: 1, huong: 1 }, lua: LUA_U3,
      maMau: bai(C_U3, [H('put_far', [], T_PUTFAR_LOI)]),
      sao: { o: 17, nhip: 32 },
      loiGiai: bai(C_U3, [H('put_far', [], T_PUTFAR)]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_U3, [H('put_far', [], ['# lửa ở xa: phun mạnh'].concat(T_PUTFAR))]) },
      congThucKhac: [{ moTa: 'Để auto_spray() chọn lực theo xa gần', baiLam: bai(C_U3, [H('put_far', [], WHILE('warm()', ['auto_spray()']))]) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: phun nhẹ không tới lửa, lặp mãi', baiLam: bai(C_U3, [H('put_far', [], T_PUTFAR_LOI)]), phaiCoMa: ['vong-vo-han'] },
        cung('Phun mạnh cố định một lần, bỏ vòng lặp: đám hai ngọn còn một ngọn, xe dừng trước lửa', bai(C_U3, [H('put_far', [], ['squirt("high")'])]), ['chua-toi-co'])
      ],
      goiY: ['Phun nhẹ bay tối đa hai ô; phun mạnh bay tới vật cản đầu tiên.', 'Đổi "low" thành "high".']
    }),

    man({
      chuong: 'trum-mua-2', so: 4, ten: 'Hàm clear_row(n)', yMoi: 'hàm có tham số gọi hàm của em: n lần forward(2) rồi put_out_left(); ba giếng cháy to nhỏ khác nhau',
      kieuBai: 'tham-so', mucTieu: 'dap-lua', chinhCoDinh: true, taoHam: ['clear_row'], hamCuaEmCan: ['put_out_left', 'put_out', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Ba giếng bên trái hành lang đang cháy, cách đều nhau hai ô, lửa to nhỏ mỗi ngày mỗi khác. Em chế clear_row(n): n lần đi hai ô rồi put_out_left(). ' +
        'Chương trình chính đã khóa: clear_row(3) rồi một bước tới cờ. Phải dập hết lửa.',
      veMaMau: 'Chương trình chính bị khóa. Tạo clear_row(n) có tham số n.',
      san: SAN_U4, batDau: { x: 1, y: 3, huong: 1 }, lua: LUA_U4,
      maMau: bai(C_U4),
      sao: { o: 23, nhip: 47 },
      loiGiai: { chinh: C_U4.slice(), hamCuaEmMoi: [H('clear_row', ['n'], T_ROW)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U4), hamCuaEmMoi: [H('clear_row', ['n'], ['# n giếng, mỗi giếng cách hai ô'].concat(T_ROW))] },
      loiSai: [
        Object.assign(cung('Viết cứng range(2): giếng thứ ba còn cháy', bai(C_U4), ['con-lua']), { hamCuaEmMoi: [H('clear_row', ['n'], FOR(2, ['forward(2)', 'put_out_left()']))] }),
        { moTa: 'Quên đi hai ô: xe đứng nguyên ở đầu hành lang', baiLam: bai(C_U4), hamCuaEmMoi: [H('clear_row', ['n'], FOR('n', ['put_out_left()']))], phaiCoMa: ['con-lua'] }
      ],
      goiY: ['Tham số n là số giếng.', 'for i in range(n): forward(2), put_out_left().']
    }),

    man({
      chuong: 'trum-mua-2', so: 5, ten: 'Hàm box_spray()', yMoi: 'chế hàm chờ bằng cảm biến (gói Đội): thùng trên băng chuyền chắn tia thì chờ (distance() < 2), rồi phun mạnh',
      kieuBai: 'cho-tia', chinhCoDinh: true, taoHam: ['box_spray'], hamCuaEmCan: ['put_out', 'clear_squirt', 'wait_clear', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Trạm đang cháy; trên trạm là giếng, băng chuyền ngang chở thùng nặng chạy cắt qua giếng, cuối giếng là van mở cửa. Thùng đi ngang qua giếng thì chắn tia nước; ' +
        'thùng không nóng nên warm() không thấy nó. Em chế box_spray(): còn thấy gì cách dưới hai ô (distance() < 2) thì chờ, rồi phun mạnh. ' +
        'Có ngày thùng tới giếng đúng lúc xe tới, có ngày đã đi qua. Chương trình chính đã khóa.',
      veMaMau: 'Chương trình chính bị khóa. Tạo box_spray() ba dòng.',
      san: SAN_U5, batDau: { x: 1, y: 4, huong: 1 }, lua: LUA_U5, noi: NOI_U5, thungThem: THUNG_U5,
      maMau: bai(C_U5),
      sao: { o: 25, nhip: 30 },
      loiGiai: { chinh: C_U5.slice(), hamCuaEmMoi: [H('box_spray', [], T_BOXS)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U5), hamCuaEmMoi: [H('box_spray', [], ['# thùng còn trong giếng thì chờ'].concat(T_BOXS))] },
      congThucKhac: [{ moTa: 'Chờ khi distance() == 1 (thùng ở đúng ô băng)', baiLam: bai(C_U5), hamCuaEmMoi: [H('box_spray', [], WHILE('distance() == 1', ['wait()']).concat(['squirt("high")']))] }],
      loiSai: [
        Object.assign(cung('Viết cứng phun ngay, không chờ: ngày thùng đang trong giếng, tia nước trúng thùng, cửa không mở', bai(C_U5), ['ban-bi-chan', 'dam-tuong']), { hamCuaEmMoi: [H('box_spray', [], ['squirt("high")'])] }),
        { moTa: 'Dùng clear_squirt("high") (chờ bằng warm): thùng không nóng, tia nước trúng thùng', baiLam: bai(C_U5), hamCuaEmMoi: [H('box_spray', [], ['clear_squirt("high")'])], phaiCoMa: ['ban-bi-chan', 'dam-tuong'] },
        { moTa: 'Chờ khi distance() == 0: thùng trong giếng cách một ô nên không chờ, tia nước trúng thùng', baiLam: bai(C_U5), hamCuaEmMoi: [H('box_spray', [], WHILE('distance() == 0', ['wait()']).concat(['squirt("high")']))], phaiCoMa: ['ban-bi-chan', 'dam-tuong'] }
      ],
      goiY: ['Giếng trống thì distance() là 2 (tới van); có thùng thì là 1.', 'while distance() < 2: wait(), rồi squirt("high").']
    }),

    man({
      chuong: 'trum-mua-2', so: 6, ten: 'Hàm gate_push()', yMoi: 'hàm gọi hàm: go_to_wall() tới sát thùng, squirt_left("high") mở cửa, push(2); hai làn gấp khúc, thùng xa gần mỗi ngày khác',
      kieuBai: 'cam-bien-xa', mucTieu: 'day-thung', chinhCoDinh: true, taoHam: ['gate_push'], hamCuaEmCan: ['put_out', 'go_to_wall', 'squirt_left', 'push', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Hai làn gấp khúc. Trên mỗi làn: thùng xa gần khác nhau, sau thùng là cánh cửa đóng rồi ô đích; van mở cửa ở xa bên trái xe khi xe đứng sát thùng (tường sau lưng nên không giật). ' +
        'Giữa xe và thùng đầu có một đám cháy: chương trình chính gọi put_out() của em trước. Em chế gate_push(): go_to_wall() tới sát thùng, squirt_left("high") mở cửa, push(2). ' +
        'Chương trình chính đã khóa: put_out(), gate_push(), quay phải, gate_push().',
      veMaMau: 'Chương trình chính bị khóa. Tạo gate_push() ba dòng.',
      san: SAN_U6, batDau: { x: 1, y: 2, huong: 1 }, lua: LUA_U6, noi: NOI_U6,
      maMau: bai(C_U6),
      sao: { o: 28, nhip: 43 },
      loiGiai: { chinh: C_U6.slice(), hamCuaEmMoi: [H('gate_push', [], T_GATE)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U6), hamCuaEmMoi: [H('gate_push', [], ['# tới sát thùng, mở cửa, đẩy qua'].concat(T_GATE))] },
      congThucKhac: [{ moTa: 'Viết thẳng tr_left(), squirt("high"), tr_right() thay squirt_left("high")', baiLam: bai(C_U6), hamCuaEmMoi: [H('gate_push', [], ['go_to_wall()', 'tr_left()', 'squirt("high")', 'tr_right()', 'push(2)'])] }],
      loiSai: [
        Object.assign(cung('Đi cứng một ô rồi phun: ngày thùng ở xa, tia trúng tường, cửa đóng', bai(C_U6), ['dam-tuong']), { hamCuaEmMoi: [H('gate_push', [], ['move()', 'squirt_left("high")', 'push(2)'])] }),
        { moTa: 'Đẩy trước rồi mới phun: thùng vướng cửa đóng', baiLam: bai(C_U6), hamCuaEmMoi: [H('gate_push', [], ['push(2)', 'squirt_left("high")'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Phun nhẹ: van ở xa, tia nước rơi giữa giếng', baiLam: bai(C_U6), hamCuaEmMoi: [H('gate_push', [], ['go_to_wall()', 'squirt_left("low")', 'push(2)'])], phaiCoMa: ['ban-ngan', 'dam-tuong'] }
      ],
      goiY: ['Thùng cũng là vật cản: go_to_wall() dừng sát thùng.', 'go_to_wall(), squirt_left("high"), push(2).']
    }),

    man({
      chuong: 'trum-mua-2', so: 7, ten: 'Hàm fire_valve()', yMoi: 'hàm gọi hàm: dập lửa chắn trước van bằng put_out() rồi fence_shot() phun mạnh bù giật; hai trạm, lửa to nhỏ khác nhau',
      kieuBai: 'doc-nhiet', chinhCoDinh: true, taoHam: ['fire_valve'], hamCuaEmCan: ['put_out', 'fence_shot', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Hai trạm, mỗi trạm có giếng bên trái: cuối giếng là van mở cánh cửa ngay phía trước, nhưng giữa giếng đang cháy, lửa chắn tia nước (mỗi ngày to nhỏ khác). ' +
        'Dưới mỗi trạm là hốc: phun mạnh thì xe giật xuống hốc, nên dùng fence_shot() để tiến lại. Em chế fire_valve(): quay trái, put_out(), fence_shot(), quay lại. Chương trình chính đã khóa.',
      veMaMau: 'Chương trình chính bị khóa. Tạo fire_valve() bốn dòng.',
      san: SAN_U7, batDau: { x: 1, y: 3, huong: 1 }, lua: LUA_U7, noi: NOI_U7,
      maMau: bai(C_U7),
      sao: { o: 26, nhip: 42 },
      loiGiai: { chinh: C_U7.slice(), hamCuaEmMoi: [H('fire_valve', [], T_FV)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U7), hamCuaEmMoi: [H('fire_valve', [], ['# dập lửa trước, mở van sau'].concat(T_FV))] },
      congThucKhac: [{ moTa: 'Viết thẳng squirt("high") rồi move() thay fence_shot()', baiLam: bai(C_U7), hamCuaEmMoi: [H('fire_valve', [], ['tr_left()', 'put_out()', 'squirt("high")', 'move()', 'tr_right()'])] }],
      loiSai: [
        Object.assign(cung('Phun nhẹ cố định một lần rồi fence_shot(): ngày lửa hai ngọn, tia mạnh trúng lửa chứ không trúng van', bai(C_U7), ['dam-tuong']), { hamCuaEmMoi: [H('fire_valve', [], ['tr_left()', 'squirt("low")', 'fence_shot()', 'tr_right()'])] }),
        { moTa: 'Quên dập lửa: tia nước trúng lửa, van chưa mở', baiLam: bai(C_U7), hamCuaEmMoi: [H('fire_valve', [], ['tr_left()', 'fence_shot()', 'tr_right()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Phun mạnh không bù giật: xe tụt xuống hốc rồi quay phải húc tường', baiLam: bai(C_U7), hamCuaEmMoi: [H('fire_valve', [], ['tr_left()', 'put_out()', 'squirt("high")', 'tr_right()'])], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Lửa chắn tia: dập trước, mở van sau.', 'tr_left(), put_out(), fence_shot(), tr_right().']
    }),

    man({
      chuong: 'trum-mua-2', so: 8, ten: 'Đố: phun thừa một lần', yMoi: 'tìm lỗi: phun mạnh hai lần cho chắc; ngày lửa một ngọn, lần thừa bay qua chỗ lửa đã tắt, trúng van, cửa đóng lại',
      kieuBai: 'do', mucTieu: 'dap-lua', hamCuaEmCan: ['put_out', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Sola phun mạnh hai lần vào đám cháy trong giếng cho chắc. Ngày lửa hai ngọn thì ổn, nhưng ngày lửa một ngọn cánh cửa trên hành lang lại đóng. Vì sao? ' +
        'Lần phun thứ hai bay qua chỗ lửa đã tắt, trúng van cuối giếng, van đóng cửa lại. Sửa cho ngày nào lửa cũng tắt mà cửa vẫn mở.',
      veMaMau: 'Chạy thử chương trình của Sola ở cả hai ngày. Lần phun thứ hai trúng gì?',
      san: SAN_U8, batDau: { x: 1, y: 4, huong: 1 }, lua: LUA_U8, noi: NOI_U8,
      maMau: bai(M_U8),
      sao: { o: 20, nhip: 21 },
      loiGiai: bai(L_U8),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích', baiLam: bai(['# phun tới khi hết nóng là vừa đủ'].concat(L_U8)) },
      congThucKhac: [{ moTa: 'Viết thẳng while warm(): squirt("low") thay put_out()', baiLam: bai(nhieu(['forward(2)', 'tr_left()'], DAP, ['tr_right()', 'forward(3)'])) }],
      loiSai: [
        cung('Để nguyên hai lần phun của Sola: ngày lửa một ngọn, van đóng cửa lại', bai(M_U8), ['dam-tuong']),
        cung('Bớt còn một lần phun: ngày lửa hai ngọn, tới cờ mà lửa còn cháy', bai(['forward(2)', 'tr_left()', 'squirt("high")', 'tr_right()', 'forward(3)']), ['con-lua']),
        { moTa: 'Bỏ hẳn lần phun: tới cờ mà lửa còn cháy', baiLam: bai(['forward(5)']), phaiCoMa: ['con-lua'] }
      ],
      goiY: ['Đếm ngọn lửa bằng warm(): hết nóng thì thôi.', 'Thay hai dòng squirt("high") bằng put_out().']
    }),

    man({
      chuong: 'trum-mua-2', so: 9, ten: 'Hàm far_push()', yMoi: 'biến d = distance() dùng làm tham số: thùng cách d ô thì push(d); ba đoạn xa gần mỗi ngày khác; put_out() dập lửa trước thùng đầu',
      kieuBai: 'bien', mucTieu: 'day-thung', chinhCoDinh: true, taoHam: ['far_push'], hamCuaEmCan: ['put_out', 'push', 'go_to_wall', 'tr_right', 'forward', 'move'],
      deBai: 'Đường rắn ba đoạn, mỗi đoạn một thùng. Thùng cách xe bao nhiêu ô thì ô đích cũng cách thùng bấy nhiêu, mỗi ngày mỗi khác. Em chế far_push(): đo d = distance() rồi push(d) của gói Đẩy thùng. ' +
        'Giữa xe và thùng đầu có một đám cháy: lửa còn thì distance() đo tới lửa. Chương trình chính đã khóa: put_out(), rồi far_push(), quay phải, far_push(), quay phải, far_push().',
      veMaMau: 'Chương trình chính bị khóa. Tạo far_push() hai dòng, có biến d.',
      san: SAN_U9, batDau: BD_U9, lua: LUA_U9,
      maMau: bai(C_U9),
      sao: { o: 21, nhip: 29 },
      loiGiai: { chinh: C_U9.slice(), hamCuaEmMoi: [H('far_push', [], T_FAR)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U9), hamCuaEmMoi: [H('far_push', [], ['# xa bao nhiêu, đẩy bấy nhiêu'].concat(T_FAR))] },
      congThucKhac: [{ moTa: 'Viết thẳng push(distance())', baiLam: bai(C_U9), hamCuaEmMoi: [H('far_push', [], ['push(distance())'])] }],
      loiSai: [
        Object.assign(cung('Đẩy cứng một ô: đoạn thùng cách hai ô chưa tới ô đích', bai(C_U9), ['chua-day-thung']), { hamCuaEmMoi: [H('far_push', [], ['push(1)'])] }),
        { moTa: 'Đo sau khi đã tới sát thùng: d luôn là 0, không đẩy', baiLam: bai(C_U9), hamCuaEmMoi: [H('far_push', [], ['go_to_wall()', 'd = distance()', 'push(d)'])], phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Đo trước khi đi: d = distance() ở đầu đoạn.', 'push(d) tới sát thùng rồi đẩy đúng d ô.']
    }),

    man({
      chuong: 'trum-mua-2', so: 10, ten: 'Trùm: Nhà máy chạy lại', yMoi: 'trùm cuối mùa 2: một chương trình cho hai dây chuyền, nối năm hàm của em: put_out, fire_valve, go_to_wall, sidestep, gate_push',
      hang: 'trum', kieuBai: 'trum', mucTieu: 'day-thung',
      hamCuaEmCan: ['put_out', 'fire_valve', 'go_to_wall', 'sidestep', 'gate_push', 'squirt_left', 'push', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      huyHieu: { ma: 'nha-may-chay', ten: 'Huy hiệu Nhà máy chạy lại' },
      deBai: 'Dập đám cháy cuối cùng là nhà máy của Sola chạy lại trọn vẹn: hai dây chuyền, một chương trình. Ở trạm xuất phát: lửa sát mũi xe (to nhỏ khác nhau) và giếng bên trái đang cháy ' +
        'chắn van mở cửa trên hành lang (hốc dưới trạm để xe giật). Hành lang dài ngắn khác nhau rồi hết ở tường. Né xuống làn dưới: thùng xa gần khác nhau, van ở xa bên trái khi đứng sát thùng, ' +
        'cửa sau thùng, ô đích sau cửa. Nối các hàm của em: put_out(), fire_valve(), go_to_wall(), sidestep(), gate_push().',
      veMaMau: 'Chương trình có sẵn đếm cứng theo dây chuyền đầu: dây chuyền sau hành lang dài hơn, thùng ở xa hơn.',
      san: SAN_U10, batDau: { x: 1, y: 3, huong: 1 }, lua: LUA_U10, noi: NOI_U10,
      maMau: bai(M_U10),
      sao: { o: 38, nhip: 58 },
      loiGiai: bai(L_U10),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# dập lửa, mở cửa trên, tới tường, né xuống, đẩy thùng qua cửa'].concat(L_U10)) },
      congThucKhac: [{ moTa: 'Viết thẳng go_to_wall(), squirt_left("high"), push(2) thay gate_push()', baiLam: bai(['put_out()', 'fire_valve()', 'go_to_wall()', 'sidestep()', 'go_to_wall()', 'squirt_left("high")', 'push(2)']) }],
      loiSai: [
        cung('Đếm cứng theo dây chuyền đầu: dây chuyền sau hành lang dài hơn, thùng ở xa hơn', bai(M_U10), ['dam-tuong']),
        { moTa: 'Quên fire_valve(): cửa hành lang còn đóng, go_to_wall() dừng ngay trước cửa', baiLam: bai(['put_out()', 'go_to_wall()', 'sidestep()', 'gate_push()']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Phun nhẹ một lần thay put_out(): dây chuyền sau lửa ba ngọn còn cháy', baiLam: bai(['squirt("low")', 'fire_valve()', 'go_to_wall()', 'sidestep()', 'gate_push()']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Dập lửa trước: put_out(). Trạm: fire_valve() mở cửa. go_to_wall() tới tường. Làn dưới: sidestep(), gate_push().', 'Mỗi hàm lo một đoạn; nối đúng thứ tự.']
    })
  ];

  ManHoc.manTrumMua2 = DS;
  if (laNode) module.exports = ManHoc;
})();

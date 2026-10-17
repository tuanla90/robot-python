/* ============================================================================
   man-flycam.js — "Đường học": CHƯƠNG `flycam` · FLYCAM (10 màn). Kế hoạch KE-HOACH-LIST-FLYCAM.md mục 4, làm 17/10.
   Chương cuối gói Drone (drone → che-drone → flycam). Robot là DRONE gắn CAMERA NHÌN XUỐNG dưới bụng:
     robot { than: 'drone', tay: null | 'nam-cham', camBien: [{ ma: 'camera-bay', o: 'bung' }] (+ { ma: 'pin', o: 'than' } ở màn có pin) }, hamGoc có `look` (xem san-hoc.js, CAMERA NHÌN XUỐNG).
   look() trả CHUỖI "red" | "green" | "blue" | "yellow" | "none" của ô ngay DƯỚI drone (vật nằm đất thì màu vật; rào / thùng / cửa đóng thì "none"; vật đang dính nam châm không tính), không tốn nhịp, không tốn pin.
   Chủ đề: "NHÌN TRƯỚC, LÀM SAU". Camera chỉ thấy MỘT ô dưới bụng, nên muốn biết cả một hàng ô thì phải bay qua và GHI LẠI: seen.append(look()). Có hai lý do THẬT để ghi:
     (a) THÔNG TIN Ở MỘT CHỖ, VIỆC LÀM Ở CHỖ KHÁC — "tờ đơn" là một dải ô màu ở góc sân (đỏ / xanh dương / xanh lá), còn việc cần làm (bay theo đơn, chở hộp theo đơn) ở chỗ khác, nơi không còn thấy dải ô màu;
         ba sân có ba tờ đơn khác nhau nên không viết cứng được (viết cứng một tờ thì trượt hai sân kia);
     (b) CÂY SỐ ĐÃ ĐI — hành lang dài ngắn mỗi sân một khác, drone không có bản đồ: số phần tử trong seen chính là số ô đã bay qua, dùng để bay về đúng chỗ cũ (len(seen) / for c in seen).
   Mọi lời giải nhập được bằng CHẠM trên khay: tên danh sách trong chương trình chính / hàm là `a` (khối `a = [1, 2]`), trong hàm là đối số `seen` (thẻ BIẾN), biến vòng `for c in seen:` (khối DANH SÁCH),
   điều kiện so màu `c == "red"` (bảng chọn vế trái liệt kê biến vòng của danh sách màu), `a.append(look())` (khối DANH SÁCH có look()).
   Mục tiêu `bong-mo` cho cả chương (như che-drone): drone phải ĐỨNG đúng ô bóng mờ khi chương trình CHẠY XONG, vật mờ cho biết hộp phải nằm ở ô nào, ◆ là ô phải ghé qua. Màn nhiều sân (ba sân, nhipTheo 'tong') khác nhau
   ở màu ô, nên một chương trình phải đúng cả ba. `chinhCoDinh: true` — chương trình chính khóa, người chơi chỉ sửa / tạo hàm trong Xưởng; 7, 8 khóa; 10 (trùm) tự viết chương trình chính.
   Khung 10 ô cho chương trình chính và mỗi hàm; cauTruc ['for', 'if', 'while'] ở 1, 2 (làm quen look() trước, chưa dạy list), thêm 'list' từ 3.

   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     flycam.1 seek_red()        = while look() != "red": go_right()                              bay sang phải tới khi camera thấy ô đỏ
     flycam.2 steer()           = if look() == "red": go_up() elif look() == "blue": go_down() else: go_right()     nhìn ô bên dưới rồi bay đúng MỘT ô
     flycam.3 survey(seen)      = while look() != "none": seen.append(look()); go_right()          bay qua các ô có màu, ghi màu từng ô vào seen
     flycam.4 obey(seen)        = for c in seen: đỏ → go_down(), xanh dương → go_right(), còn lại → go_up()   bay theo từng màu đã ghi, đúng thứ tự
     flycam.5 dispatch(seen)    = for c in seen: go_down(); đỏ → airlift(2), còn lại → airlift(3)   xuống từng hộp rồi chở đi theo màu đã ghi
     flycam.6 patrol(seen)      = bay tới ô vàng ghi màu vào seen, ghé sạc; rồi for c in seen: go_left(), ghé sạc
   HÀM CỦA MÀN (không vào kho, không có trong Sổ lệnh):
     flycam.7 go_out(seen) khóa, xem được: bay xuống cầu thang tới ô vàng, mỗi bậc ghi một phần tử; come_back(seen) thân ban đầu `pass`, lời giải for c in seen: go_up(), go_left()
     flycam.8 scan_row(seen) thân ban đầu GHI SAU VÒNG LẶP (seen.append(look()) đứng ngoài while nên seen chỉ có một phần tử); lời giải đưa dòng ghi vào trong vòng lặp, trước go_right()
     flycam.9 fetch_red()     thân ban đầu dùng look() (camera hỏng nên báo lenh-goc-hong); lời giải: tự đếm bằng mắt, go_down() hai lần rồi airlift(2)
   10 (trùm) không hàm mới: tự viết chương trình chính dùng survey(), airlift() — tờ đơn có thêm màu xanh lá nghĩa là "để hộp lại".

   Sao: sao.nhip = số nhịp của lời giải cách 1 chạy thật. Vì phải đọc màu mới biết đường nên đường ngắn nhất của TỪNG sân (BFS, do-duong-che-drone.mjs / do-duong-flycam.mjs) có thể ngắn hơn lời giải (nhipTheoLoiGiai);
   kiem-hoc.mjs / kiem-flycam.mjs kiểm BFS ≤ sao.nhip (bằng nhau ở 1, 3, 7, 8; nhipTheoLoiGiai ở 2, 4, 5, 6, 9, 10). LOOK() KHÔNG ĐỔI VẬT LÝ nên bộ dò là do-duong-che-drone.mjs (không cần bộ dò riêng);
   kiem-flycam.mjs so chéo: đường BFS đổi thành lệnh gốc rồi SanHoc.chay thắng đúng nhịp, và đường BFS của sân đầu (viết cứng) trượt sân khác — đó là bằng chứng lý do đọc rồi nhớ là thật.
   sao.o = ô chương trình + thân các hàm thực sự được gọi (kể cả hàm lồng nhau, mỗi hàm tính một lần).
   Hướng: drone không có hướng mặt (batDau.huong luôn 0). (x, y) với y = 0 ở hàng trên.
   Nối tiếp man-che-drone.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-che-drone.js') : window.ManHoc;

  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var NC = ['magnet_n', 'magnet_s', 'magnet_off'];

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hay mảng) `n` lần (n là số hay tên biến). */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }

  // thân các hàm chế (cách 1, cách người chơi thường chọn)
  var T_SEEK_RED = ['while look() != "red":', '    go_right()'];
  var T_STEER = ['if look() == "red":', '    go_up()', 'elif look() == "blue":', '    go_down()', 'else:', '    go_right()'];
  var T_SURVEY = ['while look() != "none":', '    seen.append(look())', '    go_right()'];
  var T_OBEY = ['for c in seen:', '    if c == "red":', '        go_down()', '    elif c == "blue":', '        go_right()', '    else:', '        go_up()'];
  var T_DISPATCH = ['for c in seen:', '    go_down()', '    if c == "red":', '        airlift(2)', '    else:', '        airlift(3)'];
  var T_PATROL = ['while look() != "yellow":', '    seen.append(look())', '    go_right()', '    recharge()', 'for c in seen:', '    go_left()', '    recharge()'];
  function hSeekRed(than) { return H('seek_red', [], than || T_SEEK_RED); }
  function hSteer(than) { return H('steer', [], than || T_STEER); }
  function hSurvey(than) { return H('survey', ['seen'], than || T_SURVEY); }
  function hObey(than) { return H('obey', ['seen'], than || T_OBEY); }
  function hDispatch(than) { return H('dispatch', ['seen'], than || T_DISPATCH); }
  function hPatrol(than) { return H('patrol', ['seen'], than || T_PATROL); }

  // hàm của màn
  var T_GO_OUT = ['while look() != "yellow":', '    seen.append(look())', '    go_right()', '    go_down()'];
  var T_COME_BACK_TRONG = ['pass'];                                                      // thân ban đầu của come_back() ở 7: chưa làm gì (lõi hiểu pass), người chơi viết thay nó
  var T_COME_BACK = ['for c in seen:', '    go_up()', '    go_left()'];
  var T_SCAN_ROW_SAI = ['while look() != "yellow":', '    go_right()', 'seen.append(look())'];             // 8: ghi SAU vòng lặp, một lần duy nhất
  var T_SCAN_ROW = ['while look() != "yellow":', '    seen.append(look())', '    go_right()'];
  var T_FETCH_RED_CU = ['while look() != "red":', '    go_down()', 'airlift(2)'];                          // 9: dùng look() (camera hỏng)
  var T_FETCH_RED = ['go_down()', 'go_down()', 'airlift(2)'];

  /**
   * Điền các trường chung của chương (không đụng tới trường màn đã khai).
   * m.nam: true thì có nam châm treo (+ magnet_n / magnet_s / magnet_off trên khay). m.bat: true thì có battery() (cần m.pin). m.hong: true thì camera hỏng (khay và phần cứng không có look).
   */
  function man(m) {
    var nam = m.nam, bat = m.bat, hong = m.hong;
    delete m.nam; delete m.bat; delete m.hong;
    m.chuong = 'flycam';
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: nam ? 'nam-cham' : null, camBien: [{ ma: 'camera-bay', o: 'bung' }].concat(bat ? [{ ma: 'pin', o: 'than' }] : []) };
    m.hamGoc = m.hamGoc || nhieu(BAY, nam ? NC : [], hong ? [] : ['look'], bat ? ['battery'] : []);
    if (hong) m.phanCung = m.hamGoc.slice();
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = m.so <= 2 ? ['for', 'if', 'while'] : ['for', 'if', 'while', 'list'];                // 1, 2 chỉ look() + while / if (chưa dạy list): khay chưa có nhóm DANH SÁCH; từ 3 có list
    m.mucTieu = 'bong-mo';
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  // chương trình chính khóa của từng màn (maMau.chinh)
  var C_1 = ['seek_red()'];
  var C_2 = LAP(6, 'steer()');
  var C_3 = ['seen = []', 'survey(seen)', 'for c in seen:', '    if c == "red":', '        go_down()', '    else:', '        go_right()'];
  var C_4 = ['seen = []', 'survey(seen)', 'obey(seen)'];
  var C_5 = ['seen = []', 'survey(seen)', 'dispatch(seen)'];
  var C_6 = ['seen = []', 'patrol(seen)'];
  var C_7 = ['seen = []', 'go_out(seen)', 'come_back(seen)'];
  var C_8 = ['seen = []', 'scan_row(seen)', 'for c in seen:', '    go_left()'];
  var C_9 = ['fetch_red()'];
  // 10 (người chơi tự viết): đọc đơn, rồi xuống từng hộp: đỏ chở 2 ô, xanh dương chở 3 ô, xanh lá để lại
  var L_10 = ['a = []', 'survey(a)', 'for c in a:', '    go_down()', '    if c == "red":', '        airlift(2)', '    elif c == "blue":', '        airlift(3)'];

  /* ------------------------------------------------------------------- sân */

  // 1: hành lang một hàng, ô đỏ ở x = 3, 4, 6; ô khác màu (xanh dương, xanh lá, vàng) đứng chắn trước ô đỏ để chương trình "bay tới ô có màu đầu tiên" bị trượt
  var SAN_1 = [['.b.r...', '#######'], ['..g.r..', '#######'], ['.y....r', '#######']];
  var BM_1 = [{ x: 3, y: 0 }, { x: 4, y: 0 }, { x: 6, y: 0 }];
  // 2: ba sân 7×3, drone ở (0,1); ô đỏ bảo lên, ô xanh dương bảo xuống, ô không màu bảo sang phải; mỗi sân sáu bước, dừng ở (4,1), (3,0), (2,1)
  var SAN_2 = [['...b...', '.r.....', '.......'], ['.......', '.b.r...', '..r....'], ['..b....', 'b.r....', '..r....']];
  var BM_2 = [{ x: 4, y: 1 }, { x: 3, y: 0 }, { x: 2, y: 1 }];
  // 3: tờ đơn ở hàng trên (x = 0..2), drone xuất phát ở (0,0) và bay tới (3,0); đơn [đỏ, xanh dương, đỏ] / [xanh dương, xanh dương, đỏ] / [đỏ, đỏ, xanh dương]; đỏ = xuống, xanh dương = sang phải
  var SAN_3 = [['rbr....', '.......', '.......'], ['bbr....', '.......', '.......'], ['rrb....', '.......', '.......']];
  var BM_3 = [{ x: 4, y: 2, diQua: [{ x: 4, y: 1 }] }, { x: 5, y: 1, diQua: [{ x: 5, y: 0 }] }, { x: 4, y: 2, diQua: [{ x: 3, y: 2 }] }];
  // 4: tờ đơn bốn ô ở hàng 1 (x = 0..3), drone xuống bậc (4,1); đỏ = xuống, xanh dương = sang phải, xanh lá = lên; hành lang rộng một ô, mọi ô khác là tường
  var SAN_4 = [['#######', 'brrb..#', '#####.#', '#####..', '#######'], ['#######', 'rbgb...', '####..#', '#######', '#######'], ['#######', 'rrbg.##', '####..#', '####..#', '#######']];
  var BM_4 = [{ x: 6, y: 3 }, { x: 6, y: 1 }, { x: 5, y: 2 }];
  // 5: tờ đơn ở hàng trên (x = 0..2); cột ba hộp sắt (x = 3, y = 1..3), hàng rào ở x = 4, hai làn ở x = 5 (chở 2 ô) và x = 6 (chở 3 ô)
  var SAN_5 = [['rbr....', '###o=..', '###o=..', '###o=..'], ['bbr....', '###o=..', '###o=..', '###o=..'], ['rrb....', '###o=..', '###o=..', '###o=..']];
  var CHAT_5 = ['.......', '...s...', '...s...', '...s...'];
  var BM_5 = [{ x: 3, y: 3, vat: [{ x: 5, y: 1 }, { x: 6, y: 2 }, { x: 5, y: 3 }] }, { x: 3, y: 3, vat: [{ x: 6, y: 1 }, { x: 6, y: 2 }, { x: 5, y: 3 }] }, { x: 3, y: 3, vat: [{ x: 5, y: 1 }, { x: 5, y: 2 }, { x: 6, y: 3 }] }];
  // 6: dải ô sạc P phía trên, hành lang phía dưới (y = 1); ô vàng ở x = 3, 4, 5; pin 4
  var SAN_6 = [['PPPPPPP', '.r.y...'], ['PPPPPPP', '..b.y..'], ['PPPPPPP', '.g...y.']];
  var BM_6 = [{ x: 0, y: 1, diQua: [{ x: 3, y: 1 }] }, { x: 0, y: 1, diQua: [{ x: 4, y: 1 }] }, { x: 0, y: 1, diQua: [{ x: 5, y: 1 }] }];
  // 7: cầu thang một ô rộng (0,0) → (4,4); ô vàng ở bậc 2, 3, 4 của ba sân; go_out(): ghi rồi sang phải, xuống; về: lên rồi sang trái
  var SAN_7 = [['..###', '#..##', '##y.#', '###..', '####.'], ['..###', '#..##', '##..#', '###y.', '####.'], ['..###', '#..##', '##..#', '###..', '####y']];
  var BM_7 = [{ x: 0, y: 0, diQua: [{ x: 2, y: 2 }] }, { x: 0, y: 0, diQua: [{ x: 3, y: 3 }] }, { x: 0, y: 0, diQua: [{ x: 4, y: 4 }] }];
  // 8: hành lang một hàng, ô vàng ở x = 3, 4, 5
  var SAN_8 = [['.g.y...', '#######'], ['..r.y..', '#######'], ['.b...y.', '#######']];
  var BM_8 = [{ x: 0, y: 0, diQua: [{ x: 3, y: 0 }] }, { x: 0, y: 0, diQua: [{ x: 4, y: 0 }] }, { x: 0, y: 0, diQua: [{ x: 5, y: 0 }] }];
  // 9: MỘT sân (camera hỏng, em tự nhìn màu): cột ba hộp sắt (xanh dương, đỏ, xanh lá) ở x = 3, drone xuất phát ở (3,0); hàng rào ở x = 4, hai làn ở x = 5 và 6
  var SAN_9 = ['.......', '...o=..', '...o=..', '...o=..'];
  var CHAT_9 = ['.......', '...s...', '...s...', '...s...'];
  var VATMAU_9 = ['.......', '...b...', '...r...', '...g...'];
  var BM_9 = { x: 3, y: 2, vat: [{ x: 3, y: 1 }, { x: 5, y: 2 }, { x: 3, y: 3 }] };
  // 10: như 5 nhưng tờ đơn có cả xanh lá (để hộp lại): [đỏ, xanh lá, xanh dương] / [xanh dương, đỏ, xanh lá] / [xanh lá, xanh dương, đỏ]
  var SAN_10 = [['rgb....', '###o=..', '###o=..', '###o=..'], ['brg....', '###o=..', '###o=..', '###o=..'], ['gbr....', '###o=..', '###o=..', '###o=..']];
  var BM_10 = [{ x: 3, y: 3, vat: [{ x: 5, y: 1 }, { x: 3, y: 2 }, { x: 6, y: 3 }] }, { x: 3, y: 3, vat: [{ x: 6, y: 1 }, { x: 5, y: 2 }, { x: 3, y: 3 }] }, { x: 3, y: 3, vat: [{ x: 3, y: 1 }, { x: 6, y: 2 }, { x: 5, y: 3 }] }];

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Tìm ô đỏ', hang: 'lam-quen', taoHam: ['seek_red'],
      deBai: 'Drone có camera dưới bụng: look() cho biết màu của ô ngay bên dưới. Ba sân có ô đỏ ở chỗ khác nhau. Chương trình chính chỉ gọi seek_red(): em chế lệnh đó để drone bay sang phải tới khi thấy ô đỏ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi seek_red(). Mở Xưởng hàm, tạo seek_red rồi bấm Chạy.',
      san: SAN_1, batDau: { x: 0, y: 0, huong: 0 }, bongMo: BM_1,
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 3, nhip: 13 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [hSeekRed()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_1.slice() },
        hamCuaEmMoi: [hSeekRed(nhieu(['# bay tới ô đỏ'], T_SEEK_RED))]
      },
      congThucKhac: [
        { moTa: 'Vòng for sáu lần, mỗi lần chỉ bay khi chưa thấy ô đỏ', hamCuaEmMoi: [hSeekRed(['for i in range(6):', '    if look() != "red":', '        go_right()'])] },
        { moTa: 'Gọi go("R") thay cho go_right()', hamCuaEmMoi: [hSeekRed(['while look() != "red":', '    go("R")'])] }
      ],
      loiSai: [
        { moTa: 'Gọi seek_red() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Bay tới ô có màu đầu tiên (look() == "none" thì bay tiếp): drone dừng ở ô xanh dương / xanh lá / vàng chắn trước ô đỏ', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hSeekRed(['while look() == "none":', '    go_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết cứng ba ô: chỉ đúng ở sân đầu, hai sân kia lệch', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hSeekRed(LAP(3, 'go_right()'))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'So sánh với "Red" viết hoa: camera không bao giờ trả về chữ đó', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hSeekRed(['while look() != "Red":', '    go_right()'])], phaiCoMa: ['ten-mau-sai'] },
        { moTa: 'Quên dấu nháy quanh red: red là tên biến chưa có', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hSeekRed(['while look() != red:', '    go_right()'])], phaiCoMa: ['mau-thieu-nhay'] }
      ],
      goiY: ['Hỏi camera sau mỗi lần bay một ô: ô bên dưới đã là "red" chưa?',
        'Vòng while lặp khi điều kiện còn đúng, nên cần điều kiện "chưa thấy red".']
    }),

    man({
      so: 2, ten: 'Rẽ theo màu', hang: 'lam-quen', taoHam: ['steer'], nhipTheoLoiGiai: true,
      deBai: 'Ô đỏ bảo drone bay lên, ô xanh dương bảo bay xuống, ô không màu thì bay sang phải. Chương trình chính gọi steer() sáu lần. Em chế steer(): nhìn ô bên dưới rồi bay đúng một ô.',
      veMaMau: 'Chương trình chính bị khóa: lặp steer() sáu lần. Mở Xưởng hàm, tạo steer rồi bấm Chạy.',
      san: SAN_2, batDau: { x: 0, y: 1, huong: 0 }, bongMo: BM_2,
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 8, nhip: 18 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [hSteer()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_2.slice() },
        hamCuaEmMoi: [hSteer(nhieu(['# nhìn rồi bay một ô'], T_STEER))]
      },
      congThucKhac: [
        { moTa: 'Xét ô xanh dương trước ô đỏ', hamCuaEmMoi: [hSteer(['if look() == "blue":', '    go_down()', 'elif look() == "red":', '    go_up()', 'else:', '    go_right()'])] },
        { moTa: 'Nhớ màu vào biến c rồi mới so sánh', hamCuaEmMoi: [hSteer(['c = look()', 'if c == "red":', '    go_up()', 'elif c == "blue":', '    go_down()', 'else:', '    go_right()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi steer() mà chưa chế hàm', baiLam: { chinh: C_2.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đổi nhầm hai hướng: đỏ bay xuống, xanh dương bay lên', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hSteer(['if look() == "red":', '    go_down()', 'elif look() == "blue":', '    go_up()', 'else:', '    go_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thiếu else: ô không màu drone đứng yên, hết sáu lần vẫn chưa tới nơi', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hSteer(['if look() == "red":', '    go_up()', 'elif look() == "blue":', '    go_down()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Hai if rời nhau: sau khi rẽ drone nhìn lại ô mới rồi bay thêm một ô', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hSteer(['if look() == "red":', '    go_up()', 'if look() == "blue":', '    go_down()', 'else:', '    go_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đọc bằng color(): drone không có cảm biến màu, chỉ có camera look()', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hSteer(['if color() == "red":', '    go_up()', 'elif color() == "blue":', '    go_down()', 'else:', '    go_right()'])], phaiCoMa: ['chua-gan-cam-bien'] }
      ],
      goiY: ['Mỗi lần steer() chỉ bay một ô: nhìn màu rồi chọn một trong ba hướng.',
        'Ba trường hợp thì dùng if, elif, else.']
    }),

    man({
      so: 3, ten: 'Đọc đơn', hang: 'lam-quen', taoHam: ['survey'],
      deBai: 'Ba ô màu ở hàng trên là một tờ đơn: đỏ bảo bay xuống, xanh dương bảo bay sang phải. Chương trình chính bay theo đơn nhưng cần danh sách seen. Em chế survey(seen): bay qua các ô có màu, ghi màu từng ô vào seen.',
      veMaMau: 'Chương trình chính bị khóa. Đọc xem nó làm gì với danh sách seen, rồi mở Xưởng hàm, tạo survey và bấm Chạy.',
      san: SAN_3, batDau: { x: 0, y: 0, huong: 0 }, bongMo: BM_3,
      chinhCoDinh: true,
      maMau: { chinh: C_3.slice() },
      sao: { o: 10, nhip: 18 },
      loiGiai: { chinh: C_3.slice(), hamCuaEmMoi: [hSurvey()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_3.slice() },
        hamCuaEmMoi: [hSurvey(nhieu(['# ghi màu từng ô'], T_SURVEY))]
      },
      congThucKhac: [
        { moTa: 'Vòng for ba lần thay cho while (tờ đơn nào cũng ba ô)', hamCuaEmMoi: [hSurvey(['for i in range(3):', '    seen.append(look())', '    go_right()'])] },
        { moTa: 'Gọi go("R") thay cho go_right()', hamCuaEmMoi: [hSurvey(['while look() != "none":', '    seen.append(look())', '    go("R")'])] }
      ],
      loiSai: [
        { moTa: 'Gọi survey(seen) mà chưa chế hàm', baiLam: { chinh: C_3.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Bay qua tờ đơn mà không ghi gì: seen trống nên chương trình chính không bay theo đơn nào', baiLam: { chinh: C_3.slice() }, hamCuaEmMoi: [hSurvey(['while look() != "none":', '    go_right()'])], phaiCoMa: ['chua-qua-diem', 'lech-bong-mo'] },
        { moTa: 'Bay trước rồi mới ghi: seen ghi màu của ô kế tiếp nên lệch một ô so với tờ đơn', baiLam: { chinh: C_3.slice() }, hamCuaEmMoi: [hSurvey(['while look() != "none":', '    go_right()', '    seen.append(look())'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Ghi mãi một màu đỏ: ba sân bay theo cùng một đơn nên hai sân lệch', baiLam: { chinh: C_3.slice() }, hamCuaEmMoi: [hSurvey(['while look() != "none":', '    seen.append("red")', '    go_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên go_right(): drone đứng mãi trên ô đầu, ghi vô tận', baiLam: { chinh: C_3.slice() }, hamCuaEmMoi: [hSurvey(['while look() != "none":', '    seen.append(look())'])], phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Mỗi ô có màu: ghi màu của nó vào seen rồi bay sang ô kế.',
        'Dừng khi ô bên dưới không còn màu, tức look() trả về "none".']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Làm theo đơn', hang: 'luyen', taoHam: ['obey'], hamCuaEmCan: ['survey'], nhipTheoLoiGiai: true,
      deBai: 'Tờ đơn dài hơn, có thêm ô xanh lá: đỏ bay xuống, xanh dương sang phải, xanh lá bay lên. Chương trình chính đọc đơn bằng survey(seen) rồi gọi obey(seen). Em chế obey(seen) để drone bay theo đúng thứ tự đã ghi.',
      veMaMau: 'Chương trình chính bị khóa: survey(seen) rồi obey(seen). Mở Xưởng hàm, tạo obey rồi bấm Chạy.',
      san: SAN_4, batDau: { x: 0, y: 1, huong: 0 }, bongMo: BM_4,
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 13, nhip: 24 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [hObey()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_4.slice() },
        hamCuaEmMoi: [hObey(nhieu(['# làm theo từng màu'], T_OBEY))]
      },
      congThucKhac: [
        { moTa: 'Xét xanh lá bằng elif thay cho else', hamCuaEmMoi: [hObey(['for c in seen:', '    if c == "red":', '        go_down()', '    elif c == "blue":', '        go_right()', '    elif c == "green":', '        go_up()'])] },
        { moTa: 'Xét xanh dương trước ô đỏ', hamCuaEmMoi: [hObey(['for c in seen:', '    if c == "blue":', '        go_right()', '    elif c == "red":', '        go_down()', '    else:', '        go_up()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi obey(seen) mà chưa chế hàm', baiLam: { chinh: C_4.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đổi nhầm đỏ và xanh dương: hành lang một ô, drone đâm tường ngay bước đầu', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hObey(['for c in seen:', '    if c == "red":', '        go_right()', '    elif c == "blue":', '        go_down()', '    else:', '        go_up()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Quên ô xanh lá: không có else nên drone đứng yên ở bước đó', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hObey(['for c in seen:', '    if c == "red":', '        go_down()', '    elif c == "blue":', '        go_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Hỏi look() thay vì c: bay xong mỗi bước drone nhìn ô sàn không màu nên cứ bay lên, đâm tường', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hObey(['for c in seen:', '    if look() == "red":', '        go_down()', '    elif look() == "blue":', '        go_right()', '    else:', '        go_up()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Viết cứng ba bước của sân đầu mà không đọc seen: hai sân kia đâm tường', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hObey(['go_right()', 'go_down()', 'go_down()', 'go_right()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] }
      ],
      goiY: ['Mỗi phần tử của seen là một lệnh: đọc lần lượt từng màu rồi bay theo nó.',
        'Vòng for chạy qua từng màu trong seen; if, elif, else chọn hướng bay.']
    }),

    man({
      so: 5, ten: 'Giao theo đơn', hang: 'luyen', nam: true, taoHam: ['dispatch'], hamCuaEmCan: ['survey', 'airlift'], nhipTheoLoiGiai: true,
      deBai: 'Đơn ghi màu của ba hộp sắt xếp thành cột: đỏ chở sang phải 2 ô, xanh dương chở 3 ô. Chương trình chính đọc đơn bằng survey(seen) rồi gọi dispatch(seen). Em chế dispatch(seen): xuống từng hộp rồi chở nó đi bằng airlift().',
      veMaMau: 'Chương trình chính bị khóa: survey(seen) rồi dispatch(seen). Mở Xưởng hàm, tạo dispatch rồi bấm Chạy.',
      san: SAN_5, vatChat: [CHAT_5, CHAT_5, CHAT_5], batDau: { x: 0, y: 0, huong: 0 }, bongMo: BM_5,
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 19, nhip: 71 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [hDispatch()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_5.slice() },
        hamCuaEmMoi: [hDispatch(nhieu(['# giao từng hộp theo đơn'], T_DISPATCH))]
      },
      congThucKhac: [
        { moTa: 'Xét xanh dương trước, còn lại chở 2 ô', hamCuaEmMoi: [hDispatch(['for c in seen:', '    go_down()', '    if c == "blue":', '        airlift(3)', '    else:', '        airlift(2)'])] },
        { moTa: 'Gọi go("D") thay cho go_down()', hamCuaEmMoi: [hDispatch(['for c in seen:', '    go("D")', '    if c == "red":', '        airlift(2)', '    else:', '        airlift(3)'])] }
      ],
      loiSai: [
        { moTa: 'Gọi dispatch(seen) mà chưa chế hàm', baiLam: { chinh: C_5.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên go_down(): ba lần airlift ở cùng một ô nên chỉ hộp đầu được chở', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hDispatch(['for c in seen:', '    if c == "red":', '        airlift(2)', '    else:', '        airlift(3)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đổi nhầm hai khoảng cách: đỏ chở 3 ô, xanh dương chở 2 ô', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hDispatch(['for c in seen:', '    go_down()', '    if c == "red":', '        airlift(3)', '    else:', '        airlift(2)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chở một ô: thả ngay trên hàng rào, hàng rào không nhận vật', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hDispatch(['for c in seen:', '    go_down()', '    if c == "red":', '        airlift(1)', '    else:', '        airlift(3)'])], phaiCoMa: ['tha-bi-chan', 'lech-bong-mo'] },
        { moTa: 'Chở mọi hộp 2 ô, không xét màu: hộp xanh dương nằm sai làn', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hDispatch(['for c in seen:', '    go_down()', '    airlift(2)'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Mỗi phần tử của seen là một hộp: xuống ô hộp đó, rồi nhìn màu để biết chở bao xa.',
        'airlift(n) em đã chế ở chương Chế lệnh drone, n là số ô chở sang phải.']
    }),

    man({
      so: 6, ten: 'Về nhà có sạc', hang: 'luyen', bat: true, pin: 4, taoHam: ['patrol'], hamCuaEmCan: ['recharge'], nhipTheoLoiGiai: true,
      deBai: 'Hành lang mỗi sân dài ngắn khác nhau, ô vàng là điểm cuối, dải ô sạc P chạy phía trên. Chương trình chính chỉ gọi patrol(seen). Em chế patrol(seen): bay tới ô vàng và ghi màu từng ô đã qua vào seen, rồi bay về đúng chỗ cũ, ghé sạc khi pin thấp.',
      veMaMau: 'Chương trình chính bị khóa: tạo danh sách seen rồi gọi patrol(seen). Mở Xưởng hàm, tạo patrol rồi bấm Chạy.',
      san: SAN_6, batDau: { x: 0, y: 1, huong: 0 }, bongMo: BM_6,
      chinhCoDinh: true,
      maMau: { chinh: C_6.slice() },
      sao: { o: 12, nhip: 66 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [hPatrol()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_6.slice() },
        hamCuaEmMoi: [hPatrol(nhieu(['# đi và ghi, về theo seen'], T_PATROL))]
      },
      congThucKhac: [
        { moTa: 'Bay về bằng range(len(seen)) thay cho for c in seen', hamCuaEmMoi: [hPatrol(['while look() != "yellow":', '    seen.append(look())', '    go_right()', '    recharge()', 'for i in range(len(seen)):', '    go_left()', '    recharge()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi patrol(seen) mà chưa chế hàm', baiLam: { chinh: C_6.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Không ghé sạc: pin 4 không đủ cho cả đi lẫn về', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hPatrol(['while look() != "yellow":', '    seen.append(look())', '    go_right()', 'for c in seen:', '    go_left()'])], phaiCoMa: ['het-pin'] },
        { moTa: 'Chỉ ghé sạc lúc đi: lúc về pin cạn giữa đường', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hPatrol(['while look() != "yellow":', '    seen.append(look())', '    go_right()', '    recharge()', 'for c in seen:', '    go_left()'])], phaiCoMa: ['het-pin'] },
        { moTa: 'Viết cứng ba ô: chỉ đúng sân ngắn nhất, hai sân kia lệch', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hPatrol(nhieu(LAP(3, ['seen.append(look())', 'go_right()', 'recharge()']), ['for c in seen:', '    go_left()', '    recharge()']))], phaiCoMa: ['chua-qua-diem'] },
        { moTa: 'Bay về bằng go_right(): drone bay ngược, ra khỏi hành lang', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hPatrol(['while look() != "yellow":', '    seen.append(look())', '    go_right()', '    recharge()', 'for c in seen:', '    go_right()', '    recharge()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['seen có bao nhiêu phần tử thì drone đã bay bấy nhiêu ô, nên cứ mỗi phần tử bay lại một ô.',
        'recharge() em đã chế ở chương Drone: gọi nó sau mỗi lần bay.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Đường về', hang: 'bien-the',
      deBai: 'Hàm go_out(seen) của màn bay xuống cầu thang tới ô vàng và ghi mỗi bậc vào seen, nó bị khóa. Em viết thân hàm come_back(seen) để drone bay về đúng nhà, như bóng mờ. Cầu thang mỗi sân dài ngắn khác nhau.',
      veMaMau: 'Chương trình chính bị khóa: go_out(seen) rồi come_back(seen). Hàm go_out chỉ xem được. Thân hàm come_back đang chỉ có dòng pass, nghĩa là chưa làm gì: em viết lệnh thay cho nó. Ô vàng là chỗ go_out dừng.',
      san: SAN_7, batDau: { x: 0, y: 0, huong: 0 }, bongMo: BM_7,
      chinhCoDinh: true, khoaHamMan: ['go_out'],
      maMau: { chinh: C_7.slice(), hamCuaMan: [H('go_out', ['seen'], T_GO_OUT), H('come_back', ['seen'], T_COME_BACK_TRONG)] },
      sao: { o: 10, nhip: 36 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [H('go_out', ['seen'], T_GO_OUT), H('come_back', ['seen'], T_COME_BACK)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', ['seen'], T_GO_OUT), H('come_back', ['seen'], nhieu(['# làm ngược lại go_out'], T_COME_BACK))] }
      },
      congThucKhac: [
        { moTa: 'Bay về bằng range(len(seen)) thay cho for c in seen', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', ['seen'], T_GO_OUT), H('come_back', ['seen'], ['for i in range(len(seen)):', '    go_up()', '    go_left()'])] } },
        { moTa: 'Mỗi bậc đi lại bằng walk("UL")', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', ['seen'], T_GO_OUT), H('come_back', ['seen'], ['for c in seen:', '    walk("UL")'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: drone vẫn đứng ở ô vàng, chưa về nhà', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', ['seen'], T_GO_OUT), H('come_back', ['seen'], T_COME_BACK_TRONG)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Bay lên và sang phải: không đổi hướng, drone đâm tường', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', ['seen'], T_GO_OUT), H('come_back', ['seen'], ['for c in seen:', '    go_up()', '    go_right()'])] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Sang trái trước rồi mới lên: hành lang chỉ rộng một ô, drone đâm tường', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', ['seen'], T_GO_OUT), H('come_back', ['seen'], ['for c in seen:', '    go_left()', '    go_up()'])] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Viết cứng hai bậc: chỉ đúng sân ngắn nhất', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', ['seen'], T_GO_OUT), H('come_back', ['seen'], LAP(2, ['go_up()', 'go_left()']))] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm come_back() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', ['seen'], T_GO_OUT)] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Mỗi phần tử trong seen là một bậc đã đi xuống, nên về thì đi lên đúng bấy nhiêu bậc.',
        'Một bậc đi xuống gồm sang phải rồi xuống. Đi lên thì ngược lại: lên rồi sang trái.']
    }),

    man({
      so: 8, ten: 'Ghi thiếu', hang: 'bien-the',
      deBai: 'Hàm scan_row(seen) của màn bay dọc hành lang tới ô vàng và ghi hành lang vào seen. Chương trình chính bay về theo seen nhưng drone không về tới nhà. Sửa thân scan_row để drone về đúng chỗ cũ, như bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa: scan_row(seen) rồi bay về theo seen. Chạy thử, xem seen có mấy phần tử rồi sửa thân hàm scan_row của màn.',
      san: SAN_8, batDau: { x: 0, y: 0, huong: 0 }, bongMo: BM_8,
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice(), hamCuaMan: [H('scan_row', ['seen'], T_SCAN_ROW_SAI)] },
      sao: { o: 7, nhip: 24 },
      loiGiai: { chinh: C_8.slice(), hamCuaMan: [H('scan_row', ['seen'], T_SCAN_ROW)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_8.slice(), hamCuaMan: [H('scan_row', ['seen'], nhieu(['# ghi mỗi ô trước khi bay'], T_SCAN_ROW))] }
      },
      congThucKhac: [
        { moTa: 'Ghi sau khi bay (trong vòng lặp): seen vẫn đủ số phần tử nên drone vẫn về được', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('scan_row', ['seen'], ['while look() != "yellow":', '    go_right()', '    seen.append(look())'])] } },
        { moTa: 'Gọi go("R") thay cho go_right()', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('scan_row', ['seen'], ['while look() != "yellow":', '    seen.append(look())', '    go("R")'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên scan_row(): seen chỉ có một phần tử nên drone chỉ bay về một ô', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('scan_row', ['seen'], T_SCAN_ROW_SAI)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đưa dòng ghi lên trước vòng lặp: vẫn chỉ ghi một lần', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('scan_row', ['seen'], ['seen.append(look())', 'while look() != "yellow":', '    go_right()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thụt dòng ghi vào vòng lặp nhưng bỏ go_right(): drone đứng mãi, ghi vô tận', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('scan_row', ['seen'], ['while look() != "yellow":', '    seen.append(look())'])] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Ghi hai lần mỗi ô: seen dài gấp đôi nên drone bay về quá tay, đâm mép sân; vẫn về được nhà nhưng thừa nhịp', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('scan_row', ['seen'], ['while look() != "yellow":', '    seen.append(look())', '    seen.append(look())', '    go_right()'])] }, phaiCoMa: [] },
        { moTa: 'Xóa mất hàm scan_row() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_8.slice(), hamCuaMan: [] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Chạy thử: drone bay về được mấy ô? Số ô đó bằng số phần tử của seen.',
        'Dòng ghi seen.append(look()) cần nằm trong vòng lặp, để mỗi ô bay qua được ghi một lần.']
    }),

    man({
      so: 9, ten: 'Camera hỏng', hang: 'bien-the', nam: true, hong: true, canhBao: 'Camera dưới bụng drone hỏng', hamCuaEmCan: ['airlift'], nhipTheoLoiGiai: true,
      deBai: 'Camera dưới bụng drone hỏng nên look() không chạy được. Chương trình chính gọi fetch_red() của màn, mà thân hàm đó vẫn hỏi look(). Sửa fetch_red() để drone chở hộp đỏ sang phải 2 ô: em tự nhìn sân xem hộp đỏ nằm ở đâu.',
      veMaMau: 'Chương trình chính bị khóa: fetch_red(). Chạy thử, xem lệnh nào bị báo hỏng rồi sửa thân hàm fetch_red của màn. Camera hỏng thì drone không đọc được màu, em phải đếm bằng mắt.',
      san: SAN_9, vatChat: CHAT_9, vatMau: VATMAU_9, batDau: { x: 3, y: 0, huong: 0 }, bongMo: BM_9,
      chinhCoDinh: true,
      maMau: { chinh: C_9.slice(), hamCuaMan: [H('fetch_red', [], T_FETCH_RED_CU)] },
      sao: { o: 11, nhip: 7 },
      loiGiai: { chinh: C_9.slice(), hamCuaMan: [H('fetch_red', [], T_FETCH_RED)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fetch_red', [], nhieu(['# camera hỏng, tự đếm hai ô'], T_FETCH_RED))] }
      },
      congThucKhac: [
        { moTa: 'Vòng for hai lần go_down()', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fetch_red', [], nhieu(LAP(2, 'go_down()'), ['airlift(2)']))] } },
        { moTa: 'Bay xuống bằng walk("DD")', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fetch_red', [], ['walk("DD")', 'airlift(2)'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên fetch_red(): look() hỏng nên báo camera hỏng', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fetch_red', [], T_FETCH_RED_CU)] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Chỉ xuống một ô: nhầm hộp xanh dương, hộp đỏ nằm yên', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fetch_red', [], ['go_down()', 'airlift(2)'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xuống ba ô: nhầm hộp xanh lá', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fetch_red', [], ['go_down()', 'go_down()', 'go_down()', 'airlift(2)'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chở một ô: thả ngay trên hàng rào, hàng rào không nhận vật', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fetch_red', [], ['go_down()', 'go_down()', 'airlift(1)'])] }, phaiCoMa: ['tha-bi-chan', 'lech-bong-mo'] },
        { moTa: 'Chở ba ô: hộp đỏ nằm sai làn', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fetch_red', [], ['go_down()', 'go_down()', 'airlift(3)'])] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Nhìn sân: hộp đỏ nằm ở hộp thứ mấy trong cột, tính từ chỗ drone đứng?',
        'Không có look() thì đếm ô bằng mắt: drone xuống đúng bấy nhiêu ô rồi mới chở.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Kho đơn hàng', hang: 'trum', nam: true, gioiHanHam: 3, nhipTheoLoiGiai: true, hamCuaEmCan: ['survey', 'airlift'],
      huyHieu: { ma: 'flycam', ten: 'Huy hiệu Flycam' },
      deBai: 'Tờ đơn có thêm ô xanh lá: xanh lá nghĩa là để hộp lại. Tự viết chương trình chính: đọc đơn, rồi xuống từng hộp, đỏ chở 2 ô, xanh dương chở 3 ô. Em chỉ được gọi tối đa 3 hàm của em khác nhau.',
      veMaMau: 'Chương trình chính còn trống. Hai hàm em đã chế, survey(seen) và airlift(n), làm gần hết việc.',
      san: SAN_10, vatChat: [CHAT_5, CHAT_5, CHAT_5], batDau: { x: 0, y: 0, huong: 0 }, bongMo: BM_10,
      maMau: { chinh: [] },
      sao: { o: 18, nhip: 54 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# đọc đơn rồi giao từng hộp'], L_10) }
      },
      congThucKhac: [
        { moTa: 'Xét xanh dương trước ô đỏ', baiLam: { chinh: ['a = []', 'survey(a)', 'for c in a:', '    go_down()', '    if c == "blue":', '        airlift(3)', '    elif c == "red":', '        airlift(2)'] } },
        { moTa: 'Hai if rời nhau thay cho elif', baiLam: { chinh: ['a = []', 'survey(a)', 'for c in a:', '    go_down()', '    if c == "red":', '        airlift(2)', '    if c == "blue":', '        airlift(3)'] } }
      ],
      loiSai: [
        { moTa: 'Coi xanh lá như xanh dương (else): hộp xanh lá cũng bị chở 3 ô', baiLam: { chinh: ['a = []', 'survey(a)', 'for c in a:', '    go_down()', '    if c == "red":', '        airlift(2)', '    else:', '        airlift(3)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên go_down(): mọi airlift ở cùng một ô nên chỉ hộp đầu được chở', baiLam: { chinh: ['a = []', 'survey(a)', 'for c in a:', '    if c == "red":', '        airlift(2)', '    elif c == "blue":', '        airlift(3)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đổi nhầm hai khoảng cách: đỏ chở 3 ô, xanh dương chở 2 ô', baiLam: { chinh: ['a = []', 'survey(a)', 'for c in a:', '    go_down()', '    if c == "red":', '        airlift(3)', '    elif c == "blue":', '        airlift(2)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Không đọc đơn: chở theo đơn của sân đầu cho cả ba sân', baiLam: { chinh: ['go_down()', 'airlift(2)', 'go_down()', 'go_down()', 'airlift(3)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi 4 hàm khác nhau (survey, airlift, go, walk): vượt giới hạn 3 hàm', baiLam: { chinh: ['a = []', 'survey(a)', 'go("D")', 'airlift(2)', 'walk("D")', 'airlift(3)'] }, phaiCoMa: ['qua-gioi-han-ham'] }
      ],
      goiY: ['Đọc đơn bằng survey, rồi mỗi phần tử của đơn ứng với một hộp: xuống hộp đó, nhìn màu để biết chở bao xa.',
        'Màu xanh lá không có việc gì: chỉ cần xuống hộp kế tiếp.']
    })
  ];


  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

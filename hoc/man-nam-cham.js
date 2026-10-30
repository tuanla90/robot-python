/* ============================================================================
   man-nam-cham.js — "Robot Chấn Hưng": CHƯƠNG `nam-cham` · NAM CHÂM CÓ CỰC (10 màn). Viết lại 15/10 theo KE-HOACH-CHE-LENH.md mục 5b.2 (user chốt: nam châm có cực N / S,
   "nam châm đẩy sắt nghe điêu lắm"). Giữ MÃ nam-cham.1…10 để không mất tiến độ; nội dung viết lại.
   Robot là XE HAI BÁNH (loaiRobot 'banh'; màn 9 là XE OMNI) gắn TAY NAM CHÂM ở mũi xe:
   robot { than: 'hai-banh' | 'omni', tay: 'nam-cham', camBien: [] | [{ ma: 'khoang-cach', o: 'hong' }] (6, 10: cảm biến từ / khoảng cách ở hông) (+ { ma: 'mau', o: 'hong' } ở 10: cảm biến màu Ở BỤNG) }.
   Lệnh gốc (luật đầy đủ ở san-hoc.js, phần NAM CHÂM), đều chỉ RA LỆNH, wait() cho nhịp trôi, mỗi nhịp một lệnh nam châm:
       magnet_n()    bật cực N (đỏ)         magnet_s()    bật cực S (xanh dương)         magnet_off()  ngắt điện, thả vật đang dính
   Màn 1 chỉ mở magnet_n và magnet_off; từ màn 2 có cả ba. Màn 6 mở cảm biến front_pole(); màn 10 có front_clear() (cho go_wall), front_pole() và color() (cảm biến màu ở bụng). front_metal() (sắt hay không) dùng ở chương che-nam-cham.
   LUẬT ĐÃ CHỐT:
   - Vật có CHẤT, khai bằng lớp \`vatChat\` (mảng chuỗi cùng cỡ sân, đặt đúng ô có vật o; màn nhiều sân thì mảng song song với \`san\`):
       s = SẮT: bị hút bởi cực N hay S trong tầm 2 ô, KHÔNG BAO GIỜ bị đẩy · g (hay .) = GỖ: không tương tác, chiếm ô, chắn đường của nam châm ·
       N / S = VẬT NAM CHÂM, chữ là cực quay về phía xe: KHÁC cực với tay thì bị hút, CÙNG cực thì bị ĐẨY ra xa (trượt thẳng tối đa 3 ô, dừng trước vật cản); tầm 3 ô.
     Vật nam châm mang màu theo cực (N đỏ, S xanh dương). Vật nằm đất chiếm ô: xe không đi xuyên; front_clear() = False trước vật.
   - Nam châm có cực, chưa dính vật: ở CUỐI mỗi nhịp nhìn thẳng ra trước ô 1, 2 rồi 3: VẬT ĐẦU TIÊN gặp quyết định (gỗ, tường, thùng chắn). Mỗi lần dính một vật.
   - magnet_off() thả vật xuống ô ngay trước mũi xe nếu ô đó trống; bị chặn thì vật vẫn dính (tha-bi-chan). Vật dính lơ lửng ở mũi xe, không chiếm ô.
     Sắt đang dính vẫn dính khi đổi cực; vật nam châm đang dính mà tay đổi sang CÙNG cực thì bị hất ra.
   - color() (10) là CẢM BIẾN MÀU Ở BỤNG: luôn đọc màu SÀN ô dưới xe, kể cả khi xe đang dính vật.
   - Vật nằm dưới đất không bị băng chuyền kéo; vật nằm trên băng vẫn hút được. Vật đặt ở ô không viết được bằng ký hiệu o (vd trên băng) khai ở \`vatThem: [{ x, y, chat?, cuc? }]\`.
   - Mục tiêu 'dua-vat' + vatCan 'tu': vật sắt và vật nam châm phải nằm trên ô đích; vật gỗ để yên ở đâu cũng được (dùng ở cả 10 màn).
   - CẢM BIẾN TỪ (gắn vào cảm biến khoảng cách ở hông): front_metal() True nếu vật đầu tiên là SẮT trong 2 ô; front_pole() là "N" / "S" cực của vật nam châm đầu tiên trong 3 ô, không thì "none".
   - Nhịp: lệnh nam châm gộp được vào nhịp đi / quay ("magnet_n()  move()" là một nhịp; hút / đẩy ở cuối nhịp, sau khi đi). Lời giải chuẩn của chương viết lệnh nam châm kèm wait() (một nhịp riêng):
     màn nào có lệnh nam châm đều khai nhipTheoLoiGiai (BFS gộp <= sao.nhip). kiem-nam-cham.mjs kiểm chặt hơn: BFS "tách nhịp" (lệnh nam châm đứng một mình trong nhịp) PHẢI đúng bằng sao.nhip,
     trừ màn 10 (go_wall() đi sát vật nên lời giải dài hơn đường dừng sớm bằng cảm biến: BFS tách <= sao.nhip).

   Hàm của em MỚI (tên cốt truyện, bị khóa trong kho, xem KhoHam.datTenCoDinh):
     nam-cham.5   fetch() = magnet_n(), wait(), u_turn(), move(), magnet_off(), wait()      (6 ô)
         Một chuyến lấy vật sắt: hút vật phía trước, quay đầu, tiến một ô, thả xuống ô đích sau lưng. Dùng ở 5 (và tạo thói quen "gói chuyến thành hàm").
     nam-cham.6   grip()  = if front_pole() == "N": magnet_s() else: magnet_n(), rồi wait()  (5 ô)
         Bật cực KHÁC chữ trên vật nam châm trước mặt (vật không có chữ, như sắt, thì bật cực N: cực nào cũng hút sắt). Dùng ở 6 và 10, và ở chương che-nam-cham.
   HÀM CỦA MÀN: 8 haul() (hút, rẽ phải, tiến, QUÊN thả).
   Tên không trùng hàm cốt truyện chương trước và không phải hàm gốc.

   Nhiều sân: màn 6 và 10 (san là mảng 3 sân, batDau mảng song song, nhipTheo 'tong'); các màn còn lại một sân. cauTruc ['for', 'if', 'while'].
   canHam: 'tran-khung' — 5: viết thẳng chuyến lấy vật (không dùng fetch) thì tràn khung 10 ô.

   Nối tiếp man-mau.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-mau.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var OMNI = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait'];
  var NC_1 = ['magnet_n', 'magnet_off'];                       // màn 1: mới có cực N và ngắt điện
  var NC = ['magnet_n', 'magnet_s', 'magnet_off'];

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }

  // thân các hàm của chương
  var T_FETCH = ['magnet_n()', 'wait()', 'u_turn()', 'move()', 'magnet_off()', 'wait()'];
  function hFetch(than) { return H('fetch', [], than || T_FETCH); }
  var T_GRIP = ['if front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'wait()'];
  function hGrip(than) { return H('grip', [], than || T_GRIP); }
  // 8: haul() của màn: hút vật trước mặt, mang sang phải một ô, QUÊN thả
  var T_LOAD_SAI = ['magnet_n()', 'wait()', 'turn_right()', 'move()'];
  var T_LOAD = T_LOAD_SAI.concat(['magnet_off()', 'wait()']);
  function hLoad(than) { return H('haul', [], than || T_LOAD); }

  /**
   * m.cb: 'cuc' (front_pole, màn 6) | 'tu-mau' (front_clear + front_pole + color, màn 10) | không có.
   * m.omni: true thì xe omni (màn 9). m.nc1: true thì khay mới có magnet_n và magnet_off (màn 1). Ba trường này bị bỏ sau khi dùng.
   * Màn nhiều sân (san là mảng sân) tự có nhipTheo 'tong' và batDau song song.
   */
  function man(m) {
    var cb = m.cb, omni = m.omni, nc1 = m.nc1;
    delete m.cb; delete m.omni; delete m.nc1;
    m.chuong = 'nam-cham';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = omni ? 'omni' : 'banh';
    var camBien = [];
    if (cb) camBien.push({ ma: 'khoang-cach', o: 'hong' });
    if (cb === 'tu-mau') camBien.push({ ma: 'mau', o: 'hong' });
    m.robot = { than: omni ? 'omni' : 'hai-banh', tay: 'nam-cham', camBien: camBien };
    m.hamGoc = nhieu(omni ? OMNI : BANH, nc1 ? NC_1 : NC, cb === 'cuc' ? ['front_pole'] : [], cb === 'tu-mau' ? ['front_clear', 'front_pole', 'color'] : []);
    m.mucTieu = 'dua-vat'; m.vatCan = 'tu';
    m.nhipTheoLoiGiai = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: vật sắt cách xe 2 ô phía trước; đích bên phải xe (xe phải rẽ phải rồi tiến một ô để đứng sát đích)
  var SAN_1 = ['.....', '..o..', '.....', '....D', '.....'];
  var CHAT_1 = ['.....', '..s..', '.....', '.....', '.....'];
  var BD_1 = { x: 2, y: 3, huong: 0 };
  // 2: vật gỗ (2,2) ngay trước mặt xe chiếm ô và chắn đường hút của vật sắt (2,1) đứng sau nó; phải vòng sang phải, đứng ở (4,1) quay mặt sang trái:
  // vật sắt cách xe 2 ô, ô đích (3,1) nằm giữa xe và vật sắt (ngay trước mũi xe)
  var SAN_2 = ['.....', '..oD.', '..o..', '.....', '.....'];
  var CHAT_2 = ['.....', '..s..', '.....', '.....', '.....'];
  // 3: vật nam châm chữ N cách xe 3 ô (xa hơn tầm hút của sắt); đích (3,3): kéo về bằng cực S, tiến một ô, rẽ phải, thả
  var SAN_3 = ['.....', '..o..', '.....', '...D.', '.....'];
  var CHAT_3 = ['.....', '..N..', '.....', '.....', '.....'];
  var BD_3 = { x: 2, y: 4, huong: 0 };
  // 4: vật nam châm chữ N ở hàng giữa, bên phải xe một cột; tường (4,2) chặn ngay sau ô đích (3,2): đẩy từ bên trái thì vật trượt hai ô rồi dừng đúng đích
  var SAN_4 = ['......', '......', '.o.D#.', '......', '......'];
  var CHAT_4 = ['......', '......', '.N....', '......', '......'];
  var BD_4 = { x: 0, y: 4, huong: 0 };
  // 5: ba vật sắt ở hàng trên, ba đích ở hàng dưới; xe đứng giữa
  var SAN_5 = ['.o.o.o.', '.......', '.......', '.......', '.D.D.D.'];
  var CHAT_5 = ['.s.s.s.', '.......', '.......', '.......', '.......'];
  var BD_5 = { x: 1, y: 2, huong: 0 };
  // 6: ba hành lang (hàng 1), xe ở (0,1) quay sang phải. Vật nam châm ở xa, chữ khác nhau; xe tiến tới khi front_pole() thấy vật (cách 3 ô), kéo về rồi rẽ phải: đích ở ô ngay bên dưới chỗ xe dừng.
  var SAN_6 = [
    ['#######', '.....o.', '##D####'],      // N ở (5,1): xe dừng ở x = 2
    ['#######', '......o', '###D###'],      // S ở (6,1): xe dừng ở x = 3
    ['#######', '....o..', '#D#####']       // N ở (4,1): xe dừng ở x = 1
  ];
  var CHAT_6 = [
    ['.......', '.....N.', '.......'],
    ['.......', '......S', '.......'],
    ['.......', '....N..', '.......']
  ];
  var BD_6 = { x: 0, y: 1, huong: 1 };
  // 7: làn băng chuyền hai ô (cột 3, 4) chạy lên cả chiều cao sân; vật sắt nằm trên băng (vatThem); đích bên kia làn, ở hàng trên hàng xe một ô
  var SAN_7 = ['o..^^..', '...^^..', '...^^.D', '...^^..', '...^^..'];
  var CHAT_7 = ['.......', '.......', '.......', '.......', '.......'];
  var THEM_7 = [{ x: 3, y: 3, chat: 'sat' }];
  var BD_7 = { x: 1, y: 3, huong: 1 };
  // 8: hai vật sắt xếp chéo; đích bên phải mỗi vật
  var SAN_8 = ['.....', '..o..', '.o...', '....D', '...D.'];
  var CHAT_8 = ['.....', '..s..', '.s...', '.....', '.....'];
  var BD_8 = { x: 1, y: 4, huong: 0 };
  // 9: omni: hàng trên là ba vật sắt, hàng giữa là ba đích xen kẽ, xe ở hàng dưới quay mặt lên
  var SAN_9 = ['o.o.o.', '.D.D.D', '......'];
  var CHAT_9 = ['s.s.s.', '......', '......'];
  var BD_9 = { x: 0, y: 2, huong: 0 };
  // 10: kho = ba hành lang ngang, xe ở (0,1) quay sang phải. Mỗi sân một vật cần mang về, có vật gỗ nằm sau nó: sân 1 vật SẮT (xe dừng khi front_metal() thấy, cách 2 ô), sân 2 vật nam châm N, sân 3 vật nam châm S
  // (xe dừng khi front_pole() thấy, cách 3 ô). Ô đích nằm ngay PHÍA TRÊN một ô vàng "chỗ thả": hút xong, quay đầu, MANG VẬT về tới ô vàng (cảm biến bụng đọc sàn dù đang dính vật), rẽ phải là mũi xe quay vào đích.
  var SAN_10 = [
    ['##D####', '..y..oo', '#######'],
    ['#D#####', '.y...oo', '#######'],
    ['D######', 'y...ooo', '#######']
  ];
  var CHAT_10 = [
    ['.......', '.....s.', '.......'],
    ['.......', '.....N.', '.......'],
    ['.......', '....S..', '.......']
  ];
  var BD_10 = { x: 0, y: 1, huong: 1 };

  /* ------------------------------------------------------------- chương trình dùng lại */

  // 1: hút (2 ô), rẽ phải, tiến một ô, thả
  var CHINH_1 = ['magnet_n()', 'wait()', 'turn_right()', 'move()', 'magnet_off()', 'wait()'];
  // 2: vòng sang phải qua vật gỗ (rẽ phải, hai ô, rẽ trái, hai ô lên), rẽ trái cho mũi xe quay về phía vật sắt, hút bằng cực S (vật bay về mũi xe, trên ô đích), thả
  var CHINH_2 = ['turn_right()', 'forward(2)', 'turn_left()', 'forward(2)', 'turn_left()', 'magnet_s()', 'wait()', 'magnet_off()', 'wait()'];
  var CHINH_2_KHAC = ['turn_right()', 'forward(2)', 'turn_left()', 'move()', 'move()', 'turn_left()', 'magnet_s()', 'wait()', 'magnet_off()', 'wait()'];
  // 3: kéo vật N về bằng cực S (3 ô), tiến một ô, rẽ phải, thả
  var CHINH_3 = ['magnet_s()', 'wait()', 'move()', 'turn_right()', 'magnet_off()', 'wait()'];
  var CHINH_3_KHAC = ['magnet_s()', 'wait()', 'forward(1)', 'turn_right()', 'magnet_off()', 'wait()'];
  // 4: lên hai ô cho đứng cạnh vật, quay mặt sang phải, bật cực N cùng chữ trên vật: vật trượt hai ô, dừng sát tường đúng đích
  var CHINH_4 = ['move()', 'move()', 'turn_right()', 'magnet_n()', 'wait()'];
  var CHINH_4_KHAC = ['forward(2)', 'turn_right()', 'magnet_n()', 'wait()'];
  // 5: ba chuyến fetch(); giữa hai chuyến: rẽ trái, đi sang hai cột, rẽ trái, tiến một ô
  var CHINH_5 = nhieu(LAP(2, ['fetch()', 'turn_left()', 'move()', 'move()', 'turn_left()', 'move()']), ['fetch()']);
  var CHINH_5_KHAC = nhieu(LAP(2, ['fetch()', 'turn_left()', 'forward(2)', 'turn_left()', 'move()']), ['fetch()']);
  // 6: tiến tới khi front_pole() thấy vật, kéo vật về bằng grip(), rẽ phải, thả
  var CHINH_6 = ['while front_pole() == "none":', '    move()', 'grip()', 'turn_right()', 'magnet_off()', 'wait()'];
  var CHINH_6_KHAC = ['while front_pole() == "none":', '    forward(1)', 'grip()', 'turn_right()', 'magnet_off()', 'wait()'];
  // 7: tiến một ô, hút, qua làn băng (3 ô: băng đẩy xe lên một hàng), thả
  var CHINH_7 = ['move()', 'magnet_n()', 'wait()', 'for i in range(3):', '    move()', 'magnet_off()', 'wait()'];
  var CHINH_7_KHAC = ['move()', 'magnet_n()', 'wait()', 'move()', 'move()', 'move()', 'magnet_off()', 'wait()'];
  // 8: hai lần haul(), giữa hai lần rẽ trái rồi tiến một ô
  var CHINH_8 = LAP(2, ['haul()', 'turn_left()', 'move()']);
  var CHINH_8_KHAC = LAP(2, ['haul()', 'turn_left()', 'forward(1)']);
  // 9: omni: hút, trượt phải, thả, trượt phải; lặp ba lần
  var CHINH_9 = LAP(3, ['magnet_n()', 'wait()', 'slide_r(1)', 'magnet_off()', 'wait()', 'slide_r(1)']);
  var CHINH_9_KHAC = LAP(3, ['magnet_n()', 'wait()', 'slide_r(1)', 'magnet_off()', 'wait()', 'slide_right()', 'wait()']);
  // 10: đi sát vật (go_wall: vật chiếm ô nên front_clear() sai ngay trước vật), kéo vật về bằng grip() (sắt hay vật nam châm đều được), quay đầu, MANG VẬT về tới ô vàng (đọc sàn bằng cảm biến bụng), rẽ phải, thả
  var CHINH_10 = ['go_wall()', 'grip()', 'u_turn()', 'while color() != "yellow":', '    move()', 'turn_right()', 'magnet_off()', 'wait()'];
  var CHINH_10_KHAC = ['go_wall()', 'grip()', 'u_turn()', 'while color() != "yellow":', '    forward(1)', 'turn_right()', 'magnet_off()', 'wait()'];

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Hút vật sắt', hang: 'lam-quen', hamCuaEmCan: ['move', 'turn_right'], nc1: true,
      deBai: 'Tay nam châm ở mũi xe: magnet_n() bật cực N, magnet_off() ngắt điện, còn wait() cho nhịp trôi. Cực N hút vật sắt cách xe tới 2 ô (tay kẹp ở màn Hàm đặt drop phải lái sát mới gắp được), ngắt điện thì vật rơi xuống ô ngay trước mũi xe. Hút vật sắt rồi thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn mới ra lệnh bật nam châm, chưa có wait() nên nam châm chưa chạy. Chạy thử rồi viết tiếp.',
      san: SAN_1, vatChat: CHAT_1,
      batDau: BD_1,
      maMau: { chinh: ['magnet_n()'] },
      sao: { o: 11, nhip: 4 },
      loiGiai: { chinh: CHINH_1.slice() },
      loiGiaiKhac: { moTa: 'Tiến bằng forward(1) thay cho move()', baiLam: { chinh: ['magnet_n()', 'wait()', 'turn_right()', 'forward(1)', 'magnet_off()', 'wait()'] } },
      loiSai: [
        { moTa: 'Chỉ có magnet_n(), quên wait(): lệnh chưa chạy', baiLam: { chinh: ['magnet_n()'] }, phaiCoMa: ['quen-wait', 'chua-dua-vat'] },
        { moTa: 'Rẽ trước khi hút: rẽ xong thì phía trước không còn vật', baiLam: { chinh: ['turn_right()', 'magnet_n()', 'wait()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả ngay sau khi hút: vật rơi lại ngay trước mũi xe, chưa tới đích', baiLam: { chinh: ['magnet_n()', 'wait()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên magnet_off(): vật vẫn dính ở xe', baiLam: { chinh: ['magnet_n()', 'wait()', 'turn_right()', 'move()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả khi chưa tiến sát ô đích: vật rơi cách đích một ô', baiLam: { chinh: ['magnet_n()', 'wait()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'magnet_n() và magnet_off() cùng một nhịp: lệnh sau bị bỏ', baiLam: { chinh: ['magnet_n()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['magnet-goi-lai', 'chua-dua-vat'] }
      ],
      goiY: ['Nam châm hút được vật sắt cách xe tới 2 ô; hút xong, vật dính ở mũi xe và đi theo xe.',
        'magnet_off() thả vật xuống ô ngay trước mũi xe: xe phải đứng sát ô đích và quay mặt về phía nó.']
    }),

    man({
      so: 2, ten: 'Cực S và vật gỗ', hang: 'lam-quen', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'forward'],
      deBai: 'Cực S hút vật sắt giống cực N: sắt bị hút bởi cả hai cực. Vật gỗ thì không bị hút, lại chiếm ô: xe không đi xuyên qua và nam châm cũng không hút xuyên qua. Vòng sang bên rồi hút vật sắt từ hướng khác, ô đích nằm ngay cạnh vật sắt.',
      veMaMau: 'Chương trình có sẵn bật nam châm ngay chỗ xe đang đứng. Chạy thử và xem vật nào nằm ngay trước mặt xe.',
      san: SAN_2, vatChat: CHAT_2,
      batDau: BD_1,
      maMau: { chinh: ['magnet_n()', 'wait()'] },
      sao: { o: 18, nhip: 9 },
      loiGiai: { chinh: CHINH_2.slice() },
      loiGiaiKhac: { moTa: 'Tiến bằng move() thay cho forward(2)', baiLam: { chinh: CHINH_2_KHAC.slice() } },
      loiSai: [
        { moTa: 'Chưa sửa gì: vật gỗ chắn đường hút, nam châm không dính vật nào', baiLam: { chinh: ['magnet_n()', 'wait()'] }, phaiCoMa: ['hut-go', 'chua-dua-vat'] },
        { moTa: 'Hút từ chỗ cũ rồi vẫn mang đi: vật gỗ chắn nên không có vật nào dính, thả ra cũng trống', baiLam: { chinh: ['magnet_s()', 'wait()', 'turn_right()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['hut-go', 'chua-dua-vat'] },
        { moTa: 'Đi thẳng lên: vật gỗ chiếm ô nên xe đâm vào vật', baiLam: { chinh: ['move()', 'magnet_s()', 'wait()', 'turn_right()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Vòng sang bên nhưng quên bật nam châm', baiLam: { chinh: ['turn_right()', 'forward(2)', 'turn_left()', 'forward(2)', 'turn_left()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dừng sớm một ô, vẫn ở hàng của vật gỗ: nam châm lại gặp vật gỗ chắn', baiLam: { chinh: ['turn_right()', 'forward(2)', 'turn_left()', 'forward(1)', 'turn_left()', 'magnet_s()', 'wait()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['hut-go', 'chua-dua-vat'] },
        { moTa: 'Quên magnet_off(): vật sắt vẫn dính ở xe', baiLam: { chinh: ['turn_right()', 'forward(2)', 'turn_left()', 'forward(2)', 'turn_left()', 'magnet_s()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Hút sắt rồi đổi sang cực kia để đẩy nó đi: sắt cực nào cũng hút, không bị đẩy, nên vẫn dính', baiLam: { chinh: ['turn_right()', 'forward(2)', 'turn_left()', 'forward(2)', 'turn_left()', 'magnet_s()', 'wait()', 'magnet_n()', 'wait()'] }, phaiCoMa: ['sat-khong-day', 'chua-dua-vat'] }
      ],
      goiY: ['Vật gỗ ngay trước mặt xe chiếm ô và chắn đường hút. Xe không đi xuyên qua nó, nên hãy sang hàng của vật sắt và quay mặt vào nó từ bên hông, cách nó 2 ô.',
        'Ô đích nằm ngay trước mũi xe, giữa xe và vật sắt: hút xong thì ngắt điện, vật rơi xuống đích.']
    }),

    man({
      so: 3, ten: 'Vật nam châm', hang: 'lam-quen', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Vật nam châm có chữ N hoặc S: đó là cực quay về phía xe. Cực khác nhau thì hút nhau, và hút được tới 3 ô, xa hơn vật sắt. Bật cực khác với chữ trên vật để kéo nó về, rồi thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn bật cực N, mà vật cũng có chữ N. Chạy thử và xem vật đi đâu.',
      san: SAN_3, vatChat: CHAT_3,
      batDau: BD_3,
      maMau: { chinh: ['magnet_n()', 'wait()', 'move()', 'turn_right()', 'magnet_off()', 'wait()'] },
      sao: { o: 11, nhip: 4 },
      loiGiai: { chinh: CHINH_3.slice() },
      loiGiaiKhac: { moTa: 'Tiến bằng forward(1) thay cho move()', baiLam: { chinh: CHINH_3_KHAC.slice() } },
      loiSai: [
        { moTa: 'Bật cực N giống chữ N trên vật: cùng cực thì đẩy, vật bị đẩy ra xa', baiLam: { chinh: ['magnet_n()', 'wait()', 'move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['day-vat', 'chua-dua-vat'] },
        { moTa: 'Quên wait() sau magnet_off(): lệnh ngắt điện chưa chạy', baiLam: { chinh: ['magnet_s()', 'wait()', 'move()', 'turn_right()', 'magnet_off()'] }, phaiCoMa: ['quen-wait', 'chua-dua-vat'] },
        { moTa: 'Thả ngay sau khi hút: vật rơi lại trước mũi xe, chưa tới đích', baiLam: { chinh: ['magnet_s()', 'wait()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên magnet_off(): vật vẫn dính ở xe', baiLam: { chinh: ['magnet_s()', 'wait()', 'move()', 'turn_right()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Rẽ trái thay vì rẽ phải: vật rơi sai bên', baiLam: { chinh: ['magnet_s()', 'wait()', 'move()', 'turn_left()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Chữ trên vật là N, nên cực khác là cực S. Vật nam châm cách xe 3 ô vẫn hút được.',
        'Hút xong thì xe mang vật đi: tiến một ô, rẽ phải, rồi ngắt điện để vật rơi xuống đích.']
    }),

    /* ------------------------------------------------------------- hàng 2: luyện */
    man({
      so: 4, ten: 'Cùng cực thì đẩy', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right', 'forward'],
      deBai: 'Cực giống nhau thì đẩy nhau. Bật cực trùng với chữ trên vật thì vật trượt thẳng ra xa xe, tối đa 3 ô, và dừng ngay trước vật cản. Hãy đẩy vật nam châm vào ô đích.',
      veMaMau: 'Chương trình có sẵn mới đưa xe lên ngang hàng với vật. Chạy thử rồi viết tiếp.',
      san: SAN_4, vatChat: CHAT_4,
      batDau: BD_4,
      maMau: { chinh: ['move()', 'move()'] },
      sao: { o: 10, nhip: 4 },
      loiGiai: { chinh: CHINH_4.slice() },
      loiGiaiKhac: { moTa: 'Đi lên hai ô bằng forward(2)', baiLam: { chinh: CHINH_4_KHAC.slice() } },
      loiSai: [
        { moTa: 'Bật cực S: khác chữ N nên vật bị hút dính vào xe, không bị đẩy đi', baiLam: { chinh: ['move()', 'move()', 'turn_right()', 'magnet_s()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên quay mặt về phía vật: nam châm chỉ tác dụng thẳng phía trước', baiLam: { chinh: ['move()', 'move()', 'magnet_n()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên wait(): lệnh nam châm chưa chạy', baiLam: { chinh: ['move()', 'move()', 'turn_right()', 'magnet_n()'] }, phaiCoMa: ['quen-wait', 'chua-dua-vat'] },
        { moTa: 'Dừng sai hàng (mới lên một ô): vật không nằm trước mặt', baiLam: { chinh: ['move()', 'turn_right()', 'magnet_n()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đẩy từ phía bên kia (đứng bên phải vật): vật trượt ngược về phía xe xuất phát', baiLam: { chinh: ['move()', 'move()', 'turn_left()', 'magnet_n()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vật nằm bên phải xe, nên xe phải quay mặt về phía nó rồi mới bật nam châm.',
        'Chữ trên vật là N: bật cực N thì cùng cực, vật bị đẩy đi.']
    }),

    man({
      so: 5, ten: 'Hàm fetch()', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['move', 'turn_left', 'u_turn'], taoHam: ['fetch'],
      deBai: 'Mỗi chuyến lấy vật gồm: hút vật sắt phía trước, quay đầu, tiến một ô, rồi thả xuống ô đích sau lưng. Tạo hàm fetch() làm trọn chuyến đó, rồi dùng nó để đưa cả ba vật sắt về ba ô đích.',
      veMaMau: 'Chương trình có sẵn làm trọn một chuyến lấy vật ở cột đầu. Chạy thử, gói chuyến đó thành hàm fetch() rồi viết tiếp cho hai cột còn lại.',
      san: SAN_5, vatChat: CHAT_5,
      batDau: BD_5,
      maMau: { chinh: T_FETCH.slice() },
      sao: { o: 23, nhip: 25 },
      loiGiai: { chinh: CHINH_5.slice(), hamCuaEmMoi: [hFetch()] },
      loiGiaiKhac: { moTa: 'Đi sang hai cột bằng forward(2)', baiLam: { chinh: CHINH_5_KHAC.slice() }, hamCuaEmMoi: [hFetch()] },
      loiSai: [
        { moTa: 'Gọi fetch() mà chưa tạo hàm', baiLam: { chinh: CHINH_5.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'fetch() quên magnet_off(): vật vẫn dính, các chuyến sau không lấy thêm được', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hFetch(['magnet_n()', 'wait()', 'u_turn()', 'move()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'fetch() quên u_turn(): xe tiến về phía vật, thả sai chỗ', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hFetch(['magnet_n()', 'wait()', 'move()', 'magnet_off()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ gọi fetch() một lần', baiLam: { chinh: ['fetch()'] }, hamCuaEmMoi: [hFetch()], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không dùng hàm, viết thẳng cả ba chuyến trong vòng for: tràn khung 10 ô', baiLam: { chinh: LAP(3, nhieu(T_FETCH, ['turn_left()', 'move()', 'move()', 'turn_left()', 'move()'])) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Cả chuyến lấy vật lặp lại y hệt ở mỗi cột, nên hãy gói nó vào một hàm có tên fetch.',
        'Giữa hai chuyến xe phải sang cột kế bên: rẽ trái, đi hai ô, rẽ trái, tiến một ô cho đứng đúng chỗ.']
    }),

    man({
      so: 6, ten: 'Hỏi cực của vật', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right'], cb: 'cuc', taoHam: ['grip'],
      deBai: 'front_pole() cho biết chữ trên vật nam châm trước mặt trong 3 ô: "N", "S", hoặc "none" nếu không có. Tạo hàm grip() bật cực khác chữ đó rồi dùng nó. Ở mỗi sân, tiến tới khi thấy vật, kéo vật về, rẽ phải và thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn dò vật rồi lúc nào cũng bật cực N. Chạy thử, xem sân nào vật không dính vào xe.',
      san: SAN_6, vatChat: CHAT_6,
      batDau: BD_6,
      maMau: { chinh: ['while front_pole() == "none":', '    move()', 'magnet_n()', 'wait()', 'turn_right()', 'magnet_off()', 'wait()'] },
      sao: { o: 16, nhip: 15 },
      loiGiai: { chinh: CHINH_6.slice(), hamCuaEmMoi: [hGrip()] },
      loiGiaiKhac: { moTa: 'Mỗi bước tiến dùng forward(1) thay cho move()', baiLam: { chinh: CHINH_6_KHAC.slice() }, hamCuaEmMoi: [hGrip()] },
      loiSai: [
        { moTa: 'Gọi grip() mà chưa tạo hàm', baiLam: { chinh: CHINH_6.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'grip() lúc nào cũng bật cực N: gặp vật N thì cùng cực nên vật bị đẩy đi', baiLam: { chinh: CHINH_6.slice() }, hamCuaEmMoi: [hGrip(['magnet_n()', 'wait()'])], phaiCoMa: ['day-vat', 'chua-dua-vat'] },
        { moTa: 'grip() bật cùng cực với chữ trên vật: vật bị đẩy chứ không bị hút', baiLam: { chinh: CHINH_6.slice() }, hamCuaEmMoi: [hGrip(['if front_pole() == "N":', '    magnet_n()', 'else:', '    magnet_s()', 'wait()'])], phaiCoMa: ['day-vat', 'chua-dua-vat'] },
        { moTa: 'Viết cứng số bước của sân đầu: các sân khác vật nằm chỗ khác', baiLam: { chinh: ['move()', 'move()', 'grip()', 'turn_right()', 'magnet_off()', 'wait()'] }, hamCuaEmMoi: [hGrip()], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đảo điều kiện: while front_pole() != "none" không chạy lần nào lúc xe còn xa vật', baiLam: { chinh: ['while front_pole() != "none":', '    move()', 'grip()', 'turn_right()', 'magnet_off()', 'wait()'] }, hamCuaEmMoi: [hGrip()], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên rẽ phải trước khi thả: vật rơi xuống ô trước mũi xe, không phải ô đích', baiLam: { chinh: ['while front_pole() == "none":', '    move()', 'grip()', 'magnet_off()', 'wait()'] }, hamCuaEmMoi: [hGrip()], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên magnet_off(): vật vẫn dính ở xe', baiLam: { chinh: ['while front_pole() == "none":', '    move()', 'grip()', 'turn_right()'] }, hamCuaEmMoi: [hGrip()], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Chữ trên vật là N thì bật cực S, là S thì bật cực N: cực khác nhau mới hút nhau.',
        'Xe tiến từng ô cho tới khi front_pole() không còn là "none". Lúc đó vật cách xe đúng 3 ô.']
    }),

    /* ------------------------------------------------------------- hàng 3: biến thể */
    man({
      so: 7, ten: 'Qua làn băng', hang: 'bien-the', hamCuaEmCan: ['move'],
      deBai: 'Vật sắt nằm trên làn băng chuyền hai ô, nam châm hút được cả vật nằm trên băng. Xe đứng trên băng đủ 2 nhịp liên tiếp thì bị đẩy một ô, kể cả khi đang đi từ ô băng này sang ô băng kia. Mang vật qua làn băng tới ô đích.',
      veMaMau: 'Chương trình có sẵn đã hút được vật và đi qua làn băng, nhưng thả không trúng đích. Chạy thử, xem băng đẩy xe đi đâu rồi sửa.',
      san: SAN_7, vatChat: CHAT_7, vatThem: THEM_7,
      batDau: BD_7,
      maMau: { chinh: ['move()', 'magnet_n()', 'wait()', 'move()', 'move()', 'move()', 'move()', 'magnet_off()', 'wait()'] },
      sao: { o: 10, nhip: 6 },
      loiGiai: { chinh: CHINH_7.slice() },
      loiGiaiKhac: { moTa: 'Ba lần move() viết thẳng', baiLam: { chinh: CHINH_7_KHAC.slice() } },
      loiSai: [
        { moTa: 'Chưa sửa gì: đi bốn ô, băng đẩy xe lên hàng trên nên xe đứng ngay trên ô đích và thả ra ngoài sân', baiLam: { chinh: ['move()', 'magnet_n()', 'wait()', 'move()', 'move()', 'move()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] },
        { moTa: 'Hút khi đang đứng trên băng: băng đẩy xe đi trước khi nam châm hút xong', baiLam: { chinh: ['move()', 'move()', 'magnet_n()', 'wait()', 'move()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đi ít một ô: thả xuống ô trống chưa phải ô đích', baiLam: { chinh: ['move()', 'magnet_n()', 'wait()', 'move()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên magnet_off(): vật vẫn dính ở xe', baiLam: { chinh: ['move()', 'magnet_n()', 'wait()', 'move()', 'move()', 'move()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không bật nam châm: xe đi qua làn băng tay không', baiLam: { chinh: ['move()', 'move()', 'move()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Làn băng hai ô: nhịp thứ hai ở trên băng làm xe bị đẩy lên một hàng, nên xe sang bên kia ở hàng trên.',
        'Thử chạy và xem xe nằm ở ô nào sau mỗi nhịp; xe chỉ cần đi một ô ít hơn.']
    }),

    man({
      so: 8, ten: 'Sửa hàm haul()', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'forward'],
      deBai: 'Chương trình dùng hàm haul() của màn: hút vật trước mặt rồi mang sang phải một ô. Nhưng vật không rơi xuống đích. Sửa hàm haul để cả hai vật sắt nằm trên hai ô đích.',
      veMaMau: 'Chạy thử: sau mỗi lần haul() vật vẫn dính ở xe. Xem hàm haul còn thiếu lệnh nào.',
      san: SAN_8, vatChat: CHAT_8,
      batDau: BD_8,
      maMau: { chinh: CHINH_8.slice(), hamCuaMan: [hLoad(T_LOAD_SAI)] },
      sao: { o: 17, nhip: 10 },
      loiGiai: { chinh: CHINH_8.slice(), hamCuaMan: [hLoad()] },
      loiGiaiKhac: { moTa: 'Sửa haul như vậy, tiến bằng forward(1) trong chương trình', baiLam: { chinh: CHINH_8_KHAC.slice(), hamCuaMan: [hLoad()] } },
      loiSai: [
        { moTa: 'Chưa sửa gì: vật dính mãi ở xe, lần haul thứ hai không hút thêm được', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hLoad(T_LOAD_SAI)] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thêm magnet_off() nhưng đặt trước khi rẽ: vật rơi lại chỗ cũ', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hLoad(['magnet_n()', 'wait()', 'magnet_off()', 'wait()', 'turn_right()', 'move()'])] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thêm magnet_n() thay cho magnet_off(): nam châm vẫn giữ vật', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hLoad(T_LOAD_SAI.concat(['magnet_n()', 'wait()']))] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Bật và ngắt nam châm cùng một nhịp trong haul(): lệnh sau bị bỏ', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hLoad(T_LOAD_SAI.concat(['magnet_n()', 'magnet_off()', 'wait()']))] }, phaiCoMa: ['magnet-goi-lai', 'chua-dua-vat'] },
        { moTa: 'Chỉ gọi haul() một lần', baiLam: { chinh: ['haul()'], hamCuaMan: [hLoad()] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Sau khi haul() xong, vật vẫn dính ở nam châm. Lệnh nào làm vật rơi xuống ô ngay trước mũi xe?',
        'Thêm lệnh vào CUỐI hàm haul, khi xe đã quay sang phải và đứng sát ô đích.']
    }),

    man({
      so: 9, ten: 'Omni và nam châm', hang: 'bien-the', hamCuaEmCan: ['slide_r'], omni: true,
      deBai: 'Xe omni trượt ngang mà không quay mặt, nên nam châm luôn hướng lên trên. Hút ba vật sắt ở hàng trên, thả mỗi vật xuống ô đích nằm giữa hai cột vật.',
      veMaMau: 'Chương trình có sẵn mới hút và thả vật đầu tiên rồi trượt sang phải. Chạy thử rồi lặp lại cho hai vật còn lại.',
      san: SAN_9, vatChat: CHAT_9,
      batDau: BD_9,
      maMau: { chinh: ['magnet_n()', 'wait()', 'slide_r(1)', 'magnet_off()', 'wait()', 'slide_r(1)'] },
      sao: { o: 10, nhip: 11 },
      loiGiai: { chinh: CHINH_9.slice() },
      loiGiaiKhac: { moTa: 'Một lần trượt viết thẳng slide_right() và wait()', baiLam: { chinh: CHINH_9_KHAC.slice() } },
      loiSai: [
        { moTa: 'Chỉ lặp hai lần: vật cuối chưa tới đích', baiLam: { chinh: LAP(2, ['magnet_n()', 'wait()', 'slide_r(1)', 'magnet_off()', 'wait()', 'slide_r(1)']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trượt sang trái: xe ra khỏi sân', baiLam: { chinh: LAP(3, ['magnet_n()', 'wait()', 'slide_left()', 'wait()', 'magnet_off()', 'wait()', 'slide_left()', 'wait()']) }, phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Quên magnet_off(): vật đầu dính mãi nên xe không hút thêm được', baiLam: { chinh: LAP(3, ['magnet_n()', 'wait()', 'slide_r(2)']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trượt hai ô sau khi thả: xe bỏ qua cột vật kế tiếp', baiLam: { chinh: LAP(3, ['magnet_n()', 'wait()', 'slide_r(1)', 'magnet_off()', 'wait()', 'slide_r(2)']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả ngay tại cột vật: vật rơi lại ô ngay trước mũi xe, không phải ô đích', baiLam: { chinh: LAP(3, ['magnet_n()', 'wait()', 'magnet_off()', 'wait()', 'slide_r(2)']) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Xe không quay nên nam châm luôn nhìn lên: chỉ cần trượt ngang cho tới cột có vật, hút, rồi trượt tới cột có ô đích để thả.',
        'Vật và đích xen kẽ từng cột: mỗi vật cần đúng một lần trượt phải để tới đích, và một lần nữa để tới vật kế.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Kho từ', hang: 'trum', hamCuaEmCan: ['go_wall', 'u_turn', 'grip', 'move', 'turn_right'], cb: 'tu-mau',
      deBai: 'Ba hành lang trong kho, mỗi nơi có một vật cần mang về: vật sắt, vật nam châm N hoặc vật nam châm S, kèm vật gỗ phía sau. Tiến sát vật, kéo nó về bằng grip(), mang tới ô vàng ("yellow") rồi thả vào ô đích ngay phía trên. Cảm biến màu ở bụng xe vẫn đọc được sàn khi xe đang dính vật.',
      veMaMau: 'Chương trình có sẵn đi sát vật rồi lúc nào cũng bật cực N. Chạy thử, xem sân nào vật không dính vào xe.',
      san: SAN_10, vatChat: CHAT_10,
      batDau: BD_10,
      maMau: { chinh: ['go_wall()', 'magnet_n()', 'wait()', 'u_turn()', 'while color() != "yellow":', '    move()', 'turn_right()', 'magnet_off()', 'wait()'] },
      sao: { o: 22, nhip: 34 },
      huyHieu: { ma: 'nam-cham', ten: 'Huy hiệu Nam châm' },
      loiGiai: { chinh: CHINH_10.slice() },
      loiGiaiKhac: { moTa: 'Mỗi bước tiến dùng forward(1) thay cho move()', baiLam: { chinh: CHINH_10_KHAC.slice() } },
      loiSai: [
        { moTa: 'Viết cứng số bước theo sân đầu: các sân khác vật và ô vàng nằm chỗ khác', baiLam: { chinh: ['forward(4)', 'grip()', 'u_turn()', 'forward(2)', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Lúc nào cũng bật cực N: gặp vật nam châm chữ N thì cùng cực nên vật bị đẩy đi', baiLam: { chinh: ['go_wall()', 'magnet_n()', 'wait()', 'u_turn()', 'while color() != "yellow":', '    move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['day-bi-chan', 'chua-dua-vat'] },
        { moTa: 'Viết hoa "Yellow": không khớp màu nào nên xe không dừng ở ô vàng', baiLam: { chinh: ['go_wall()', 'grip()', 'u_turn()', 'while color() != "Yellow":', '    move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['ten-mau-sai'] },
        { moTa: 'Quên quay đầu sau khi hút: xe tiến tiếp về phía cuối hành lang', baiLam: { chinh: ['go_wall()', 'grip()', 'while color() != "yellow":', '    move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Quên rẽ phải ở ô vàng: ô trước mũi xe không phải ô đích', baiLam: { chinh: ['go_wall()', 'grip()', 'u_turn()', 'while color() != "yellow":', '    move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Hút rồi rẽ phải thả ngay, không mang về ô vàng: ô trước mũi xe không phải ô đích', baiLam: { chinh: ['go_wall()', 'grip()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Dùng go_wall() để tiến sát vật, rồi grip() chọn đúng cực: vật sắt hay vật nam châm đều kéo về được.',
        'Ở ô vàng, rẽ phải thì mũi xe quay đúng vào ô đích phía trên; rồi mới ngắt điện.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

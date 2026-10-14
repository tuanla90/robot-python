/* ============================================================================
   man-mau.js — "Đường học": CHƯƠNG `mau` · CẢM BIẾN MÀU (10 màn).
   Robot là XE HAI BÁNH (loaiRobot 'banh') gắn CẢM BIẾN MÀU ở bụng xe (đọc ô ngay dưới xe):
   robot { than: 'hai-banh', tay: null | 'kep', camBien: [{ ma: 'mau', o: 'hong' }] (+ { ma: 'khoang-cach', o: 'hong' } ở màn 7) }.
   hamGoc có thêm hàm màu (luật đầy đủ ở san-hoc.js, phần CẢM BIẾN MÀU):
       color()   trả về MỘT CHUỖI chữ thường: "red", "green", "blue", "yellow" hoặc "none" (ô không màu) của ô dưới xe
   Đọc màu KHÔNG tốn nhịp, nhưng ghi sự kiện 'doc-cam-bien' (cam: 'mau') để giao diện nháy cảm biến.

   LUẬT ĐÃ CHỐT (xem san-hoc.js):
   - Ô màu: ký hiệu r g b y trong sân (sàn màu, đi lại như sàn thường), hay lớp \`mau\` riêng (man.mau, mảng chuỗi cùng cỡ sân)
     khi ô vừa có màu vừa là cờ F / ô đích D. Màn nhiều sân thì man.mau và man.vatMau là mảng song song với man.san.
   - Vật có màu: lớp man.vatMau (ký tự r g b y đặt đúng ô có vật). Ô đích có màu chỉ nhận vật CÙNG MÀU; thả sai màu thì 'dat-sai-mau'.
   - color() khi đang CẦM vật (luật vật 14/10) trả màu CỦA VẬT đang cầm ("none" nếu vật không màu); không cầm gì thì trả màu SÀN dưới xe.
     Vật nằm đất chiếm ô nên không bao giờ nằm dưới xe: muốn biết màu vật phải NHẶT nó lên rồi mới đọc color().
     Hệ quả: lúc đang cầm vật, xe không đọc được màu sàn (vạch kẻ, ô đích): đọc vạch kẻ khi tay không, đọc màu vật sau khi nhặt.

   Chương này tiếp tục dùng NHIỀU SÂN từ hàng Luyện (màn 4–10: \`san\` là mảng 3 sân, \`batDau\` mảng song song, nhipTheo 'tong'),
   cauTruc ['for', 'if', 'while'] (while đã học ở chương 11). Mục tiêu: tới cờ ('toi-co'); 8 và 10 là 'dua-vat' (tay kẹp).
   Các sân vạch kẻ là hành lang MỘT LỐI (dựng bằng đường đi, kiểm tra không có đường tắt): ô màu chỉ là tín hiệu, không phải tường.
   Sao nhịp: tổng nhịp mọi sân; bằng nhịp ngắn nhất (BFS) ở 1–7 và 9; 8, 10 (pick() / drop() chưa gộp nhịp) khai nhipTheoLoiGiai.
   Ở 8 và 10 đích có màu, vật có màu; thả sai màu thì không thắng ('dat-sai-mau'). Ô đích 8 màu đỏ / xanh dương, ở 10 màu xanh lá / vàng
   (cố ý KHÁC màu vạch kẻ đỏ / xanh dương: nếu không, read_turn() sẽ rẽ nhầm khi xe tình cờ đứng trên ô đích sai).

   QUY ƯỚC VẠCH KẺ trong đề: ô đỏ ("red") rẽ phải, ô xanh dương ("blue") rẽ trái, ô xanh lá ("green") rẽ phải (màn 2, 3), ô vàng ("yellow") là vạch dừng.
   Trong mỗi vòng lặp: đọc màu, rẽ nếu cần, rồi move() — nên sau khi rẽ xe tiến ra khỏi ô màu, không đọc lại ô cũ.

   Hàm của em MỚI (tên cốt truyện, bị khóa trong kho, xem KhoHam.datTenCoDinh):
     mau.5    read_turn()  = đọc màu, đỏ thì rẽ phải, xanh dương thì rẽ trái      (4 ô). Dùng ở 5, 10.
   (Màn 10 không tạo hàm mới: chương trình chính đúng 10 dòng, vừa khít khung.)
   Tên không trùng hàm cốt truyện chương trước và không phải hàm gốc.

   Trường riêng của chương này:
   - mau / vatMau (lớp màu), robot.camBien, nhipTheo 'tong'.
   - loiSai có lời so chuỗi sai ("Red", gõ nhầm "bule", quên nháy) báo ten-mau-sai / mau-thieu-nhay, và lời viết cứng trượt sân khác.

   Nối tiếp man-khoang-cach.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-khoang-cach.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  /** Lớp màu cùng cỡ sân (rong × cao), đặt các ô { 'x,y': 'r'|'g'|'b'|'y' }. */
  function lop(rong, cao, o) {
    var kq = [];
    for (var y = 0; y < cao; y++) {
      var d = '';
      for (var x = 0; x < rong; x++) d += (o[x + ',' + y] || '.');
      kq.push(d);
    }
    return kq;
  }

  // thân các hàm của chương
  var T_READ_TURN = ['if color() == "red":', '    turn_right()', 'elif color() == "blue":', '    turn_left()'];
  function hReadTurn(than) { return H('read_turn', [], than || T_READ_TURN); }

  /**
   * m.kc: true thì robot có thêm cảm biến khoảng cách (front_clear, màn 7). m.tay: true thì có tay kẹp (màn 8, 10). Hai trường này bị bỏ sau khi dùng.
   * Màn nhiều sân (san là mảng sân) tự có nhipTheo 'tong' và batDau song song.
   */
  function man(m) {
    var kc = m.kc, tay = m.tay;
    delete m.kc; delete m.tay;
    m.chuong = 'mau';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: tay ? 'kep' : null, camBien: [{ ma: 'mau', o: 'hong' }].concat(kc ? [{ ma: 'khoang-cach', o: 'hong' }] : []) };
    m.hamGoc = nhieu(BANH, tay ? TAY : [], ['color'], kc ? ['front_clear'] : []);
    if (tay) m.mucTieu = 'dua-vat';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân (dựng từ đường đi, kiểm bằng máy) */

  // 1: hành lang đứng, ô đỏ ở khúc quẹo (có ô xanh lá nhiễu), rẽ phải rồi hai ô tới cờ
  var SAN_1 = ['#####', '#r.F#', '#.###', '#g###', '#.###', '#####'];
  var BD_1 = { x: 1, y: 4, huong: 0 };
  // 2: ba khúc quẹo phải, đều đánh dấu bằng ô xanh lá
  var SAN_2 = ['#######', '#g...g#', '#.###.#', '#.###.#', '#.###.#', '#.#F.g#', '#######'];
  // 3: xanh lá rẽ phải, xanh dương rẽ trái
  var SAN_3 = ['#######', '###g.F#', '###.###', '#g.b###', '#.#####', '#.#####', '#######'];
  // 4: ba vạch kẻ: đỏ rẽ phải, xanh dương rẽ trái; ô vàng / xanh lá nằm ở đoạn thẳng là nhiễu
  var SAN_4 = [
    ['#######', '####rF#', '####.##', '#r..b##', '#y#####', '#.#####', '#######'],
    ['#######', '##ryF##', '##.####', '##r..b#', '#####g#', '#####.#', '#######'],
    ['#######', '#r.y.r#', '#.###.#', '#r.b#.#', '###.#F#', '###.###', '#######']
  ];
  var BD_4 = [{ x: 1, y: 5, huong: 0 }, { x: 5, y: 5, huong: 0 }, { x: 3, y: 5, huong: 0 }];
  // 5: bậc thang liên tục, rắn năm khúc, bậc ngang
  var SAN_5 = [
    ['#######', '####rF#', '###rb##', '##rb###', '#rb####', '#.#####', '#######'],
    ['#######', '#######', '#rgr###', '#.#.###', '#.#b.r#', '#.###F#', '#######'],
    ['#######', '#####.#', '#####.#', '###byr#', '###.###', '#F.r###', '#######']
  ];
  var BD_5 = [{ x: 1, y: 5, huong: 0 }, { x: 1, y: 5, huong: 0 }, { x: 5, y: 1, huong: 2 }];
  // 6: ô vàng ở khúc quẹo, cờ trên ô xanh dương (lớp màu); khúc quẹo ở ba chỗ khác nhau
  var SAN_6 = [
    ['#######', '#######', '#y...F#', '#.#####', '#b#####', '#.#####', '#######'],
    ['#######', '#y.F###', '#.#####', '#g#####', '#.#####', '#.#####', '#######'],
    ['#######', '#######', '#######', '#######', '#y.r.F#', '#.#####', '#######']
  ];
  var MAU_6 = [lop(7, 7, { '5,2': 'b' }), lop(7, 7, { '3,1': 'b' }), lop(7, 7, { '5,4': 'b' })];
  var BD_DUNG = { x: 1, y: 5, huong: 0 };
  // 7: hành lang đứng; ô vàng ở lối rẽ phải (hai sân), không có ô vàng (sân giữa, lối rẽ ở sát tường); sau ô vàng hành lang còn tiếp tục
  var SAN_7 = [
    ['#######', '#.#####', '#.#####', '#y.F###', '#r#####', '#.#####', '#######'],
    ['#######', '#..F###', '#.#####', '#g#####', '#.#####', '#.#####', '#######'],
    ['#######', '#.#####', '#.#####', '#.#####', '#y.F###', '#.#####', '#######']
  ];
  // 8: xe đứng giữa hành lang ngang, mặt hướng lên; vật nằm trong ngách ngay TRƯỚC mặt (3,1); đích xanh dương bên trái (1,2), đích đỏ bên phải (5,2).
  // Màu sàn dưới xe (3,2) chỉ là nhiễu: vàng, xanh lá, không màu. Màu vật (đỏ, xanh dương, đỏ) chỉ đọc được sau khi nhặt.
  var SAN_8 = [
    ['#######', '###o###', '#D...D#', '#######'],
    ['#######', '###o###', '#D...D#', '#######'],
    ['#######', '###o###', '#D...D#', '#######']
  ];
  var MAU_8 = [lop(7, 4, { '1,2': 'b', '5,2': 'r', '3,2': 'y' }), lop(7, 4, { '1,2': 'b', '5,2': 'r', '3,2': 'g' }), lop(7, 4, { '1,2': 'b', '5,2': 'r' })];
  var VAT_MAU_8 = [lop(7, 4, { '3,1': 'r' }), lop(7, 4, { '3,1': 'b' }), lop(7, 4, { '3,1': 'r' })];
  var BD_8 = { x: 3, y: 2, huong: 0 };
  // 9: ba vạch kẻ dài hơn, có cả đỏ và xanh dương
  var SAN_9 = [
    ['#######', '###r.F#', '#rgb###', '#.#####', '#.#####', '#.#####', '#######'],
    ['#######', '#######', '#######', '###b.b#', '#F.r#y#', '#####.#', '#######'],
    ['#######', '#######', '#r.g.r#', '#.###.#', '#r.b#F#', '###.###', '#######']
  ];
  var BD_9 = [{ x: 1, y: 5, huong: 0 }, { x: 5, y: 5, huong: 0 }, { x: 3, y: 5, huong: 0 }];
  // 10: hai nửa. Nửa dưới là vạch kẻ (đỏ rẽ phải, xanh dương rẽ trái) dẫn xe tay không tới ô vàng "vạch dừng" (3,2); sát mặt xe, trong ngách (3,1), là vật.
  // Nhặt vật, đọc màu (color() lúc đang cầm = màu vật), rẽ về đích cùng màu: đích vàng ở (1,2) bên trái, đích xanh lá ở (5,2) bên phải, mỗi đích cách vạch dừng hai ô.
  // Lúc đang cầm vật xe không đọc được màu sàn, nên mọi vạch kẻ phải đọc TRƯỚC khi nhặt. Ô xanh lá (3,3) ở sân 3 là nhiễu trên đoạn thẳng.
  var SAN_10 = [
    ['#######', '###o###', '#D.y.D#', '###.###', '#r.b###', '#.#####', '#######'],
    ['#######', '###o###', '#D.y.D#', '###.###', '###r.b#', '#####.#', '#######'],
    ['#######', '###o###', '#D.y.D#', '###g###', '##rb###', '##.####', '#######']
  ];
  var MAU_10 = [
    lop(7, 7, { '1,2': 'y', '5,2': 'g' }),
    lop(7, 7, { '1,2': 'y', '5,2': 'g' }),
    lop(7, 7, { '1,2': 'y', '5,2': 'g' })
  ];
  var VAT_MAU_10 = [lop(7, 7, { '3,1': 'g' }), lop(7, 7, { '3,1': 'y' }), lop(7, 7, { '3,1': 'g' })];
  var BD_10 = [{ x: 1, y: 5, huong: 0 }, { x: 5, y: 5, huong: 0 }, { x: 2, y: 5, huong: 0 }];

  /* ------------------------------------------------------------- chương trình dùng lại */

  var THEO_VACH = ['if color() == "red":', '    turn_right()', 'elif color() == "blue":', '    turn_left()', 'move()'];
  // 1: tới ô đỏ, rẽ phải, hai ô
  var CHINH_1 = ['while color() != "red":', '    move()', 'turn_right()', 'move()', 'move()'];
  // 2: xanh lá thì rẽ phải
  var CHINH_2 = LAP(20, ['if color() == "green":', '    turn_right()', 'move()']);
  // 3: xanh lá rẽ phải, xanh dương rẽ trái (chữ thường)
  var CHINH_3 = LAP(12, ['if color() == "green":', '    turn_right()', 'elif color() == "blue":', '    turn_left()', 'move()']);
  var CHINH_3_SAI = LAP(12, ['if color() == "Green":', '    turn_right()', 'elif color() == "Blue":', '    turn_left()', 'move()']);
  // 4: đỏ phải, xanh dương trái
  var CHINH_4 = LAP(30, THEO_VACH);
  // 5: dùng read_turn()
  var CHINH_5 = LAP(30, ['read_turn()', 'move()']);
  // 6: tới ô vàng, rẽ phải, tới ô xanh dương
  var CHINH_6 = ['while color() != "yellow":', '    move()', 'turn_right()', 'while color() != "blue":', '    move()'];
  // 7: đi tới khi gặp tường hoặc ô vàng
  var CHINH_7 = ['while front_clear() and color() != "yellow":', '    move()', 'turn_right()', 'move()', 'move()'];
  // 8: nhặt vật trước mặt, đọc màu vật đang cầm, rẽ về phía đích cùng màu, đi một ô tới sát đích, thả
  var CHINH_8 = ['pick()', 'if color() == "red":', '    turn_right()', 'elif color() == "blue":', '    turn_left()', 'move()', 'drop()'];
  // 9: gọi hàm của màn go_by_color() cho mỗi bước
  var CHINH_9 = LAP(40, 'go_by_color()');
  var T_GO_BY_COLOR = ['if color() == "red":', '    turn_right()', 'elif color() == "blue":', '    turn_left()', 'move()'];
  var T_GO_BY_COLOR_SAI = ['if color() == red:', '    turn_right()', 'elif color() == "Blue":', '    turn_left()', 'move()'];
  function hGoByColor(than) { return H('go_by_color', [], than || T_GO_BY_COLOR); }
  // 10: theo vạch kẻ (tay không) tới ô vàng, nhặt vật trước mặt, đọc màu vật, rẽ về đích cùng màu, đi một ô, thả
  var CHINH_10 = ['while color() != "yellow":', '    read_turn()', '    move()', 'pick()', 'if color() == "green":', '    turn_right()', 'else:', '    turn_left()', 'move()', 'drop()'];

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Đi tới ô đỏ', hang: 'lam-quen', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Cảm biến màu ở bụng xe: color() trả về tên màu của ô dưới xe, là một chuỗi chữ thường: "red", "green", "blue", "yellow" hoặc "none" (ô không màu). Đưa xe đi thẳng tới ô đỏ, rẽ phải rồi đi hai ô tới cờ.',
      veMaMau: 'Chương trình có sẵn dùng if nên xe chỉ đi được một ô. Chạy thử rồi sửa.',
      san: SAN_1,
      batDau: BD_1,
      maMau: { chinh: ['if color() != "red":', '    move()'] },
      sao: { o: 10, nhip: 6 },
      loiGiai: { chinh: CHINH_1.slice() },
      loiGiaiKhac: { moTa: 'Ghi màu vào biến, đọc lại sau mỗi bước', baiLam: { chinh: nhieu(['c = color()', 'while c != "red":', '    move()', '    c = color()'], ['turn_right()', 'move()', 'move()']) } },
      loiSai: [
        { moTa: 'Giữ nguyên if: xe chỉ đi được một ô', baiLam: { chinh: nhieu(['if color() != "red":', '    move()'], ['turn_right()', 'move()', 'move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đảo so sánh thành == : ô đầu không đỏ nên vòng không chạy lần nào', baiLam: { chinh: nhieu(['while color() == "red":', '    move()'], ['turn_right()', 'move()', 'move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thân vòng while chỉ chờ, không tiến: điều kiện không bao giờ đổi', baiLam: { chinh: ['while color() != "red":', '    wait()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Viết hoa chữ đầu "Red": không màu nào khớp nên xe đi quá khúc quẹo', baiLam: { chinh: nhieu(['while color() != "Red":', '    move()'], ['turn_right()', 'move()', 'move()']) }, phaiCoMa: ['ten-mau-sai'] },
        { moTa: 'Quên dấu nháy quanh tên màu: Python tưởng red là một biến', baiLam: { chinh: nhieu(['while color() != red:', '    move()'], ['turn_right()', 'move()', 'move()']) }, phaiCoMa: ['mau-thieu-nhay'] },
        { moTa: 'Dừng ở ô xanh lá (đoạn thẳng có ô nhiễu): rẽ nhầm chỗ', baiLam: { chinh: nhieu(['while color() == "none":', '    move()'], ['turn_right()', 'move()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Vòng while lặp chừng nào color() còn khác "red". Ô nào không màu thì color() trả về "none".',
        'Xe dừng khi đứng trên ô đỏ; sau đó rẽ phải rồi đi hai ô.']
    }),

    man({
      so: 2, ten: 'Mũi tên xanh lá', hang: 'lam-quen', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Các ô xanh lá ("green") là mũi tên: xe đứng trên ô xanh lá thì phải rẽ phải. Đi theo các mũi tên tới cờ.',
      veMaMau: 'Chương trình có sẵn cho xe đi thẳng mãi, chưa đọc màu. Chạy thử rồi viết tiếp.',
      san: SAN_2,
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: { chinh: LAP(20, 'move()') },
      sao: { o: 9, nhip: 17 },
      loiGiai: { chinh: CHINH_2.slice() },
      loiGiaiKhac: { moTa: 'Ghi màu vào biến rồi mới so sánh', baiLam: { chinh: LAP(20, ['c = color()', 'if c == "green":', '    turn_right()', 'move()']) } },
      loiSai: [
        { moTa: 'Không đọc màu, xe đi thẳng húc tường mãi', baiLam: { chinh: LAP(20, 'move()') }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Rẽ trái thay vì rẽ phải ở ô xanh lá', baiLam: { chinh: LAP(20, ['if color() == "green":', '    turn_left()', 'move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết hoa chữ đầu "Green": không khớp màu nào nên xe không rẽ', baiLam: { chinh: LAP(20, ['if color() == "Green":', '    turn_right()', 'move()']) }, phaiCoMa: ['ten-mau-sai', 'chua-toi-co'] },
        { moTa: 'Lặp quá ít lượt: xe chưa tới cờ', baiLam: { chinh: LAP(8, ['if color() == "green":', '    turn_right()', 'move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thiếu dấu hai chấm sau điều kiện if', baiLam: { chinh: LAP(20, ['if color() == "green"', '    turn_right()', 'move()']) }, phaiCoMa: ['loi-cu-phap'] }
      ],
      goiY: ['Mỗi lượt: nếu color() là "green" thì rẽ phải, rồi tiến một ô.',
        'Xe rẽ xong vẫn đứng trên ô xanh lá, nên phải tiến ra khỏi ô đó trước khi đọc lại.']
    }),

    man({
      so: 3, ten: 'Chữ hoa, chữ thường', hang: 'lam-quen', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Ô xanh lá ("green") rẽ phải, ô xanh dương ("blue") rẽ trái. Hai chuỗi chỉ bằng nhau khi giống từng chữ, kể cả chữ hoa chữ thường. Sửa chương trình có sẵn để xe tới cờ.',
      veMaMau: 'Chương trình có sẵn viết hoa chữ đầu tên màu. Chạy thử, xem xe làm gì rồi sửa.',
      san: SAN_3,
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: { chinh: CHINH_3_SAI.slice() },
      sao: { o: 13, nhip: 11 },
      loiGiai: { chinh: CHINH_3.slice() },
      loiGiaiKhac: { moTa: 'Ghi màu vào biến rồi so sánh', baiLam: { chinh: LAP(12, ['c = color()', 'if c == "green":', '    turn_right()', 'elif c == "blue":', '    turn_left()', 'move()']) } },
      loiSai: [
        { moTa: 'Chưa sửa gì: "Green" và "Blue" không khớp màu nào, xe đi thẳng húc tường', baiLam: { chinh: CHINH_3_SAI.slice() }, phaiCoMa: ['ten-mau-sai', 'chua-toi-co'] },
        { moTa: 'Mới sửa "Green", còn "Blue" viết hoa: xe không rẽ trái được', baiLam: { chinh: LAP(12, ['if color() == "green":', '    turn_right()', 'elif color() == "Blue":', '    turn_left()', 'move()']) }, phaiCoMa: ['ten-mau-sai', 'chua-toi-co'] },
        { moTa: 'Gõ nhầm chữ: "gren" thiếu một chữ e', baiLam: { chinh: LAP(12, ['if color() == "gren":', '    turn_right()', 'elif color() == "blue":', '    turn_left()', 'move()']) }, phaiCoMa: ['ten-mau-sai', 'chua-toi-co'] },
        { moTa: 'Dùng một dấu = (gán) thay cho == (so sánh)', baiLam: { chinh: LAP(12, ['if color() = "green":', '    turn_right()', 'elif color() == "blue":', '    turn_left()', 'move()']) }, phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Đổi hai hướng rẽ: xanh lá rẽ trái, xanh dương rẽ phải', baiLam: { chinh: LAP(12, ['if color() == "green":', '    turn_left()', 'elif color() == "blue":', '    turn_right()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Python phân biệt chữ hoa và chữ thường: "Green" và "green" là hai chuỗi khác nhau.',
        'color() chỉ trả về chữ thường; đối chiếu lại các chuỗi trong chương trình với đề.']
    }),

    /* ------------------------------------------------------------- hàng 2: luyện (nhiều sân) */
    man({
      so: 4, ten: 'Theo vạch kẻ', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Ba đường vạch kẻ khác nhau. Ô đỏ ("red") rẽ phải, ô xanh dương ("blue") rẽ trái, ô màu khác thì đi thẳng. Một chương trình phải đưa xe tới cờ ở cả ba sân.',
      veMaMau: 'Chương trình có sẵn cho xe đi thẳng, chưa đọc màu. Chạy thử, xem xe dừng ở đâu ở từng sân rồi viết tiếp.',
      san: SAN_4,
      batDau: BD_4,
      maMau: { chinh: LAP(30, 'move()') },
      sao: { o: 13, nhip: 40 },
      loiGiai: { chinh: CHINH_4.slice() },
      loiGiaiKhac: { moTa: 'Ghi màu vào biến rồi so sánh', baiLam: { chinh: LAP(30, ['c = color()', 'if c == "red":', '    turn_right()', 'elif c == "blue":', '    turn_left()', 'move()']) } },
      loiSai: [
        { moTa: 'Viết cứng đường đi của sân đầu: các sân sau rẽ ở chỗ khác', baiLam: { chinh: nhieu(LAP(2, 'move()'), ['turn_right()'], LAP(3, 'move()'), ['turn_left()'], LAP(2, 'move()'), ['turn_right()', 'move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ xử lý ô đỏ, quên ô xanh dương: xe đi thẳng húc tường ở khúc rẽ trái', baiLam: { chinh: LAP(30, ['if color() == "red":', '    turn_right()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Ô nào không đỏ cũng rẽ trái (else): xe quay vòng trên đoạn thẳng', baiLam: { chinh: LAP(30, ['if color() == "red":', '    turn_right()', 'else:', '    turn_left()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Ô nào có màu cũng rẽ phải: ô vàng, xanh lá ở đoạn thẳng làm xe rẽ nhầm', baiLam: { chinh: LAP(30, ['if color() != "none":', '    turn_right()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đọc màu hai lần trong một lượt sau khi đã rẽ: xe rẽ hai lần ở cùng ô', baiLam: { chinh: LAP(30, ['if color() == "red":', '    turn_right()', 'if color() == "red":', '    turn_right()', 'if color() == "blue":', '    turn_left()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Đoạn đường nào cũng làm lại một việc: đọc màu, rẽ nếu cần, rồi tiến một ô. Đặt việc đó trong vòng for đủ dài.',
        'Dùng elif để nối hai màu rẽ; màu khác thì không có nhánh nào, xe cứ đi thẳng.']
    }),

    man({
      so: 5, ten: 'Hàm read_turn()', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right', 'turn_left'], taoHam: ['read_turn'],
      deBai: 'Tạo hàm read_turn(): đọc màu dưới xe, "red" thì rẽ phải, "blue" thì rẽ trái, màu khác thì không làm gì. Dùng nó dọc ba vạch kẻ: bậc thang, đường rắn và bậc ngang.',
      veMaMau: 'Chương trình có sẵn gọi read_turn(), nhưng em chưa có hàm đó. Tạo hàm read_turn trong Xưởng hàm rồi chạy lại.',
      san: SAN_5,
      batDau: BD_5,
      maMau: { chinh: CHINH_5.slice() },
      sao: { o: 14, nhip: 40 },
      loiGiai: { chinh: CHINH_5.slice(), hamCuaEmMoi: [hReadTurn()] },
      loiGiaiKhac: {
        moTa: 'read_turn() ghi màu vào biến trước khi so sánh',
        baiLam: { chinh: CHINH_5.slice() },
        hamCuaEmMoi: [hReadTurn(['c = color()', 'if c == "red":', '    turn_right()', 'elif c == "blue":', '    turn_left()'])]
      },
      loiSai: [
        { moTa: 'Gọi read_turn() mà chưa tạo hàm', baiLam: { chinh: CHINH_5.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'read_turn chỉ xử lý ô đỏ: xe đi thẳng húc tường ở khúc rẽ trái', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hReadTurn(['if color() == "red":', '    turn_right()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'read_turn đổi hai hướng rẽ', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hReadTurn(['if color() == "red":', '    turn_left()', 'elif color() == "blue":', '    turn_right()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'read_turn so với "Red" viết hoa: không khớp màu nào nên xe không rẽ', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hReadTurn(['if color() == "Red":', '    turn_right()', 'elif color() == "blue":', '    turn_left()'])], phaiCoMa: ['ten-mau-sai', 'chua-toi-co'] },
        { moTa: 'Chương trình chỉ gọi read_turn(), không tiến: xe đứng yên ở ô đầu', baiLam: { chinh: LAP(30, 'read_turn()') }, hamCuaEmMoi: [hReadTurn()], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Thân read_turn chỉ có if / elif: đọc màu, rẽ phải khi đỏ, rẽ trái khi xanh dương. Việc tiến một ô để ở chương trình chính.',
        'Hàm này không gọi move(): rẽ xong, chương trình chính mới tiến ra khỏi ô màu.']
    }),

    man({
      so: 6, ten: 'Dừng đúng ô màu', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Ba sân có khúc quẹo ở ba chỗ khác nhau, được đánh dấu bằng ô vàng ("yellow"); cờ nằm trên ô xanh dương ("blue"). Đi tới ô vàng, rẽ phải, rồi đi tới ô xanh dương.',
      veMaMau: 'Chương trình có sẵn mới đi hết đoạn đầu. Chạy thử, xem xe dừng ở đâu ở từng sân rồi viết tiếp.',
      san: SAN_6, mau: MAU_6,
      batDau: BD_DUNG,
      maMau: { chinh: ['while color() != "yellow":', '    move()'] },
      sao: { o: 10, nhip: 21 },
      loiGiai: { chinh: CHINH_6.slice() },
      loiGiaiKhac: { moTa: 'Đoạn đầu dùng vòng for chứa if thay cho while', baiLam: { chinh: nhieu(LAP(9, ['if color() != "yellow":', '    move()']), ['turn_right()', 'while color() != "blue":', '    move()']) } },
      loiSai: [
        { moTa: 'Đếm cứng theo sân đầu (3 ô): các sân khác khúc quẹo ở chỗ khác', baiLam: { chinh: ['move()', 'move()', 'move()', 'turn_right()', 'move()', 'move()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên rẽ phải sau khi tới ô vàng', baiLam: { chinh: ['while color() != "yellow":', '    move()', 'while color() != "blue":', '    move()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Đảo so sánh thành == : đứng ở ô không màu nên vòng không chạy lần nào', baiLam: { chinh: ['while color() == "yellow":', '    move()', 'turn_right()', 'while color() == "blue":', '    move()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gõ nhầm "yelow": không khớp màu nào nên xe không dừng được ở ô vàng', baiLam: { chinh: ['while color() != "yelow":', '    move()', 'turn_right()', 'while color() != "blue":', '    move()'] }, phaiCoMa: ['ten-mau-sai'] },
        { moTa: 'Vòng thứ hai chờ mà không tiến: điều kiện không bao giờ đổi', baiLam: { chinh: ['while color() != "yellow":', '    move()', 'turn_right()', 'while color() != "blue":', '    wait()'] }, phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Mỗi đoạn đường dùng một vòng while với điều kiện là màu cần dừng; giữa hai đoạn là lệnh rẽ.',
        'Xe vừa rẽ vẫn đứng trên ô vàng. Vòng thứ hai chỉ dừng khi gặp ô xanh dương.']
    }),

    /* ------------------------------------------------------------- hàng 3: biến thể */
    man({
      so: 7, ten: 'Tường hay ô vàng', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right'],
      kc: true,
      deBai: 'Xe có cả cảm biến khoảng cách và cảm biến màu. Hành lang rẽ phải ở ô vàng ("yellow") nếu có, nếu không thì rẽ ở chỗ hết đường. Đi thẳng tới khi gặp tường hoặc ô vàng, rẽ phải rồi đi hai ô tới cờ.',
      veMaMau: 'Chương trình có sẵn chỉ chờ tường, chưa để ý ô vàng. Chạy thử, xem xe dừng ở đâu ở từng sân rồi sửa.',
      san: SAN_7,
      batDau: BD_DUNG,
      maMau: { chinh: ['while front_clear():', '    move()', 'turn_right()', 'move()', 'move()'] },
      sao: { o: 10, nhip: 16 },
      loiGiai: { chinh: CHINH_7.slice() },
      loiGiaiKhac: { moTa: 'Vòng for chứa if, điều kiện ghép bằng and', baiLam: { chinh: nhieu(LAP(9, ['if front_clear() and color() != "yellow":', '    move()']), ['turn_right()', 'move()', 'move()']) } },
      loiSai: [
        { moTa: 'Chỉ chờ tường (chương trình có sẵn): ở sân có ô vàng xe đi quá chỗ rẽ', baiLam: { chinh: ['while front_clear():', '    move()', 'turn_right()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ chờ ô vàng: sân không có ô vàng thì xe húc tường mãi', baiLam: { chinh: ['while color() != "yellow":', '    move()', 'turn_right()', 'move()', 'move()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Dùng or thay and: ở ô không màu điều kiện luôn đúng nên vòng không dừng, xe húc tường mãi', baiLam: { chinh: ['while front_clear() or color() != "yellow":', '    move()', 'turn_right()', 'move()', 'move()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Đảo điều kiện ô vàng: == "yellow" thì vòng không chạy lần nào', baiLam: { chinh: ['while front_clear() and color() == "yellow":', '    move()', 'turn_right()', 'move()', 'move()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết hoa "Yellow": không khớp màu nào nên xe chỉ dừng ở tường', baiLam: { chinh: ['while front_clear() and color() != "Yellow":', '    move()', 'turn_right()', 'move()', 'move()'] }, phaiCoMa: ['ten-mau-sai'] }
      ],
      goiY: ['Điều kiện của while ghép hai cảm biến bằng and: còn đường đi VÀ chưa gặp ô vàng.',
        'Sân giữa không có ô vàng nên xe chỉ dừng nhờ tường; hai sân kia hành lang còn tiếp tục sau ô vàng.']
    }),

    man({
      so: 8, ten: 'Phân loại theo màu', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'pick', 'drop'], nhipTheoLoiGiai: true,
      tay: true,
      deBai: 'Vật nằm ngay trước mặt xe. Nhặt vật lên, color() sẽ cho biết màu của vật đang cầm. Đích xanh dương ("blue") ở bên trái, đích đỏ ("red") ở bên phải, mỗi đích chỉ nhận vật cùng màu: mang vật tới đích của nó.',
      veMaMau: 'Chương trình có sẵn mới nhặt vật và ghi màu. Chạy thử rồi viết tiếp. Màu của vật chỉ đọc được SAU khi nhặt; trước khi nhặt, color() chỉ thấy màu sàn dưới xe.',
      san: SAN_8, mau: MAU_8, vatMau: VAT_MAU_8,
      batDau: BD_8,
      maMau: { chinh: ['pick()', 'c = color()'] },
      sao: { o: 24, nhip: 15 },
      loiGiai: { chinh: CHINH_8.slice() },
      loiGiaiKhac: {
        moTa: 'Ghi màu vật vào biến, nhánh else cho đích còn lại',
        baiLam: { chinh: ['pick()', 'c = color()', 'if c == "red":', '    turn_right()', 'else:', '    turn_left()', 'move()', 'drop()'] }
      },
      loiSai: [
        { moTa: 'Luôn rẽ phải: vật xanh dương bị mang tới đích đỏ', baiLam: { chinh: ['pick()', 'turn_right()', 'move()', 'drop()'] }, phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] },
        { moTa: 'Đọc màu TRƯỚC khi nhặt: color() chỉ thấy sàn dưới xe (vàng, xanh lá, không màu), không nhánh nào chạy', baiLam: { chinh: ['c = color()', 'pick()', 'if c == "red":', '    turn_right()', 'elif c == "blue":', '    turn_left()', 'move()', 'drop()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên đi tới đích: thả vật ngay trước mũi xe, ô đó không phải ô đích', baiLam: { chinh: ['pick()', 'if color() == "red":', '    turn_right()', 'elif color() == "blue":', '    turn_left()', 'drop()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Viết hoa "Red": vật đỏ không nhánh nào nhận nên xe không rẽ', baiLam: { chinh: ['pick()', 'if color() == "Red":', '    turn_right()', 'elif color() == "blue":', '    turn_left()', 'move()', 'drop()'] }, phaiCoMa: ['ten-mau-sai', 'chua-dua-vat'] },
        { moTa: 'Quên thả vật xuống ở đích', baiLam: { chinh: ['pick()', 'if color() == "red":', '    turn_right()', 'elif color() == "blue":', '    turn_left()', 'move()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Xe nhặt vật ở ô ngay trước mặt. Sau khi nhặt, color() là màu của vật đang cầm, dùng nó để chọn hướng rẽ.',
        'Đích cùng màu với vật: đỏ bên phải, xanh dương bên trái. Rẽ xong tiến một ô là xe đứng sát đích, rồi thả.']
    }),

    man({
      so: 9, ten: 'Hàm dò màu bị sai', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Chương trình dùng hàm go_by_color() của màn để theo vạch kẻ: đỏ ("red") rẽ phải, xanh dương ("blue") rẽ trái. Hàm này so sánh màu sai chuỗi, nên xe không tới cờ. Sửa hàm go_by_color.',
      veMaMau: 'Chạy thử: Python báo lỗi trong hàm go_by_color của màn. Sửa từng chỗ sai rồi chạy lại.',
      san: SAN_9,
      batDau: BD_9,
      maMau: { chinh: CHINH_9.slice(), hamCuaMan: [hGoByColor(T_GO_BY_COLOR_SAI)] },
      sao: { o: 14, nhip: 36 },
      loiGiai: { chinh: CHINH_9.slice(), hamCuaMan: [hGoByColor()] },
      loiGiaiKhac: {
        moTa: 'Sửa hàm go_by_color: ghi màu vào biến trước khi so sánh',
        baiLam: { chinh: CHINH_9.slice(), hamCuaMan: [hGoByColor(['c = color()', 'if c == "red":', '    turn_right()', 'elif c == "blue":', '    turn_left()', 'move()'])] }
      },
      loiSai: [
        { moTa: 'Chưa sửa gì: red không có dấu nháy nên Python báo lỗi ngay ở hàm', baiLam: { chinh: CHINH_9.slice(), hamCuaMan: [hGoByColor(T_GO_BY_COLOR_SAI)] }, phaiCoMa: ['mau-thieu-nhay'] },
        { moTa: 'Mới thêm dấu nháy cho red, còn "Blue" viết hoa: xe không rẽ trái được', baiLam: { chinh: CHINH_9.slice(), hamCuaMan: [hGoByColor(['if color() == "red":', '    turn_right()', 'elif color() == "Blue":', '    turn_left()', 'move()'])] }, phaiCoMa: ['ten-mau-sai', 'chua-toi-co'] },
        { moTa: 'Gõ nhầm "bule": không khớp màu nào nên xe không rẽ trái', baiLam: { chinh: CHINH_9.slice(), hamCuaMan: [hGoByColor(['if color() == "red":', '    turn_right()', 'elif color() == "bule":', '    turn_left()', 'move()'])] }, phaiCoMa: ['ten-mau-sai', 'chua-toi-co'] },
        { moTa: 'Sửa được chuỗi nhưng đổi hai hướng rẽ', baiLam: { chinh: CHINH_9.slice(), hamCuaMan: [hGoByColor(['if color() == "red":', '    turn_left()', 'elif color() == "blue":', '    turn_right()', 'move()'])] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Bỏ hẳn lệnh move() khỏi hàm: xe chỉ rẽ tại chỗ', baiLam: { chinh: CHINH_9.slice(), hamCuaMan: [hGoByColor(['if color() == "red":', '    turn_right()', 'elif color() == "blue":', '    turn_left()'])] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Màn có hai chỗ sai khác loại: một chỗ thiếu dấu nháy quanh tên màu, một chỗ viết hoa chữ đầu.',
        'Sửa hết các chuỗi rồi mới chạy lại; lỗi thứ hai chỉ lộ ra khi lỗi thứ nhất đã hết.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Vạch kẻ và phân loại', hang: 'trum', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'pick', 'drop', 'read_turn'], nhipTheoLoiGiai: true,
      tay: true,
      deBai: 'Theo vạch kẻ (đỏ "red" rẽ phải, xanh dương "blue" rẽ trái) tới ô vàng ("yellow"): vật nằm ngay trước mặt xe ở đó. Nhặt vật, đọc màu của nó, rồi mang tới đích cùng màu: đích xanh lá ("green") ở bên phải, đích vàng ("yellow") ở bên trái.',
      veMaMau: 'Chương trình có sẵn mới theo vạch kẻ tới ô vàng. Chạy thử rồi viết tiếp. Cầm vật rồi thì color() là màu của vật, không còn thấy vạch kẻ nữa.',
      san: SAN_10, mau: MAU_10, vatMau: VAT_MAU_10,
      batDau: BD_10,
      maMau: { chinh: ['while color() != "yellow":', '    read_turn()', '    move()'] },
      sao: { o: 31, nhip: 35 },
      huyHieu: { ma: 'mau', ten: 'Huy hiệu Cảm biến màu' },
      loiGiai: { chinh: CHINH_10.slice() },
      loiGiaiKhac: {
        moTa: 'Mỗi bước tiến dùng forward(1) thay cho move()',
        baiLam: { chinh: ['while color() != "yellow":', '    read_turn()', '    forward(1)', 'pick()', 'if color() == "green":', '    turn_right()', 'else:', '    turn_left()', 'forward(1)', 'drop()'] }
      },
      loiSai: [
        { moTa: 'Luôn rẽ phải: vật vàng bị mang tới đích xanh lá', baiLam: { chinh: ['while color() != "yellow":', '    read_turn()', '    move()', 'pick()', 'turn_right()', 'move()', 'drop()'] }, phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] },
        { moTa: 'Gõ nhầm "yelow": không khớp màu nào nên xe không dừng được ở ô vàng, đi quá chỗ nhặt', baiLam: { chinh: ['while color() != "yelow":', '    read_turn()', '    move()', 'pick()', 'if color() == "green":', '    turn_right()', 'else:', '    turn_left()', 'move()', 'drop()'] }, phaiCoMa: ['ten-mau-sai'] },
        { moTa: 'Quên read_turn() trong vòng: xe đi thẳng, không theo vạch', baiLam: { chinh: ['while color() != "yellow":', '    move()', 'pick()', 'if color() == "green":', '    turn_right()', 'else:', '    turn_left()', 'move()', 'drop()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Đọc màu TRƯỚC khi nhặt: c là màu sàn ô vàng (luôn "yellow"), xe luôn rẽ trái nên vật xanh lá bị mang tới đích vàng', baiLam: { chinh: ['while color() != "yellow":', '    read_turn()', '    move()', 'c = color()', 'pick()', 'if c == "yellow":', '    turn_left()', 'move()', 'drop()'] }, phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] },
        { moTa: 'Viết hoa "Green": vật xanh lá không nhánh nào nhận nên xe rẽ trái nhầm', baiLam: { chinh: ['while color() != "yellow":', '    read_turn()', '    move()', 'pick()', 'if color() == "Green":', '    turn_right()', 'else:', '    turn_left()', 'move()', 'drop()'] }, phaiCoMa: ['ten-mau-sai', 'chua-dua-vat'] },
        { moTa: 'Quên thả vật xuống ở đích', baiLam: { chinh: ['while color() != "yellow":', '    read_turn()', '    move()', 'pick()', 'if color() == "green":', '    turn_right()', 'else:', '    turn_left()', 'move()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Hai việc, hai lúc: khi tay còn không, color() đọc vạch kẻ (đỏ, xanh dương) và ô vàng; sau khi nhặt vật, color() đọc màu của vật.',
        'Vòng while đi theo vạch (read_turn rồi move) cho tới ô vàng. Rồi nhặt, chọn hướng theo màu vật, tiến một ô, thả.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

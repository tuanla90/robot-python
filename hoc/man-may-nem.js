/* ============================================================================
   man-may-nem.js — "Robot Chấn Hưng": CHƯƠNG `may-nem` · MÁY NÉM (10 màn).
   Robot là XE HAI BÁNH (loaiRobot 'banh'; màn 9 là XE OMNI) gắn MÁY NÉM ở mũi xe:
   robot { than: 'hai-banh' | 'omni', tay: 'nem', camBien: [] | [{ ma: 'khoang-cach', o: 'hong' }] (6) | [{ ma: 'camera', o: 'tren' }] (7: CAMERA nhìn ô trước mặt, không phải cảm biến màu ở bụng) }.
   hamGoc: bộ lệnh bánh + aim, throw (màn 1–2), thêm load (màn 3–10); màn 6 thêm front_clear, màn 7 thêm color (xe gắn camera nên color() đọc Ô TRƯỚC MẶT: màu vật nằm ở đó), màn 9 là bộ lệnh omni.
   LUẬT ĐÃ CHỐT (đầy đủ ở san-hoc.js, phần MÁY NÉM):
       aim(n)    đặt tầm n = 1, 2 hoặc 3 ô: có hiệu lực NGAY, KHÔNG tốn nhịp, giữ nguyên tới lần aim kế. n sai (0, 4, 2.5, chữ…) là LỖI dừng chương trình (tam-sai).
       load()    nạp vật nằm ở Ô TRƯỚC MẶT xe vào rổ (rổ chứa một vật) \\ chỉ RA LỆNH, wait() cho nhịp trôi; mỗi nhịp một lệnh tay;
       throw()   ném vật trong rổ bay thẳng theo hướng mặt, rơi xuống   /  nhịp có load() hay throw() thì xe đứng yên.
                 ô cách xe đúng `aim` ô (throw nhớ tầm LÚC GỌI)
   - Vật bay QUA hàng rào '=', tường '#', băng, vật khác. Ô rơi là tường cao, hàng rào, bậc thang, mép sân, hay ô đã có vật khác thì vật VỠ (nem-vo).
     Ô rơi là sàn trống (kể cả ô băng, ô đích) thì vật nằm đó. Vật vỡ thì không thắng được nữa (dừng ngay).
   - Vật nằm đất CHIẾM Ô (luật 14/10): xe không đi vào ô có vật; muốn nạp thì quay mũi xe về phía vật rồi load().
   - Màn 1–2: rổ có sẵn một vật (man.roBanDau). Từ màn 3 rổ trống lúc đầu, xe nạp vật nằm ngay trước mũi bằng load()
     (màn 3, 4, 5, 8, 10 xe nạp rồi quay sang phải ném, màn 4, 5, 8, 10 xe quay mặt xuống nạp; màn 7 và 9 vật nằm đúng hướng ném).
   - Mục tiêu: dua-vat (mọi vật nằm trên ô đích; đích có màu chỉ nhận vật cùng màu). Nhịp: aim không tốn, load / throw mỗi lệnh một nhịp riêng,
     không gộp với lệnh bánh, nên BFS (do-duong-may-nem.mjs) cho ĐÚNG sao.nhip của lời giải chuẩn.

   Hàm của em MỚI (tên cốt truyện, bị khóa trong kho, xem KhoHam.datTenCoDinh):
     may-nem.4   toss(n) = aim(n), throw(), wait()      (3 ô; ném một vật tới ô cách xe n ô)
   Hàm CỦA MÀN (tạm): màn 8 cho sẵn lob(n) đặt NHẦM tầm cố định 2.
   Học thêm: tham số n của aim(n) và tính khoảng cách; ném thay vì đi vòng; if theo khoảng cách (front_clear) hay theo màu (color của camera: nhìn màu vật ở ô trước mặt TRƯỚC khi load(), vì nạp xong ô đó trống).
   Vì tầm giữ nguyên tới lần aim kế, ở các vòng for lặp lại cùng một tầm thì đặt aim(n) một lần ngoài vòng là gọn nhất (5, 9);
   toss(n) có lợi khi gọi ở nhiều chỗ khác tầm (4).

   Nhiều sân: màn 6 (3 sân) và 7 (2 sân) (san là mảng sân, batDau mảng song song, nhipTheo 'tong'); các màn còn lại một sân. cauTruc ['for', 'if', 'while'].
   Nối tiếp man-nam-cham.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-nam-cham.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var OMNI = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait'];

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  /** Lớp cùng cỡ sân (rong × cao), đặt các ô { 'x,y': ký tự }. */
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
  var T_TOSS = ['aim(n)', 'throw()', 'wait()'];
  function hToss(than) { return H('toss', ['n'], than || T_TOSS); }
  // 8: lob(n) của màn nhầm tầm cố định 2 (bỏ qua n)
  var T_LOB_SAI = ['aim(2)', 'throw()', 'wait()'];
  var T_LOB = ['aim(n)', 'throw()', 'wait()'];
  function hLob(than) { return H('lob', ['n'], than || T_LOB); }

  /**
   * m.cb: 'kc' (front_clear, màn 6) | 'mau' (color, màn 7) | không có. m.omni: true thì xe omni (màn 9). m.coLoad: false thì chưa có load() (màn 1–2).
   * Các trường này bị bỏ sau khi dùng. Màn nhiều sân (san là mảng sân) tự có nhipTheo 'tong' và batDau song song.
   */
  function man(m) {
    var cb = m.cb, omni = m.omni, coLoad = m.coLoad !== false;
    delete m.cb; delete m.omni; delete m.coLoad;
    m.chuong = 'may-nem';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = omni ? 'omni' : 'banh';
    m.robot = { than: omni ? 'omni' : 'hai-banh', tay: 'nem', camBien: cb === 'kc' ? [{ ma: 'khoang-cach', o: 'hong' }] : cb === 'mau' ? [{ ma: 'camera', o: 'tren' }] : [] };
    m.hamGoc = nhieu(omni ? OMNI : BANH, ['aim', 'throw'], coLoad ? ['load'] : [], cb === 'kc' ? ['front_clear'] : [], cb === 'mau' ? ['color'] : []);
    m.mucTieu = 'dua-vat';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: xe quay mặt lên; ô 1 là hàng rào, ô 2 là đích. Rổ có sẵn vật
  var SAN_1 = ['.....', '..D..', '..=..', '.....', '.....'];
  var BD_1 = { x: 2, y: 3, huong: 0 };
  // 2: xe quay mặt sang phải; ô 1 hàng rào, ô 2 tường cao, ô 3 đích
  var SAN_2 = ['.....', '.....', '.=#D.', '.....', '.....'];
  var BD_2 = { x: 0, y: 2, huong: 1 };
  // 3: vật ngay trước mũi xe (xe quay mặt lên); đích bên phải xe, cách 3 ô, có hàng rào ở ô 1
  var SAN_3 = ['.....', '.....', '.o...', '..=.D', '.....'];
  var BD_3 = { x: 1, y: 3, huong: 0 };
  // 4: xe quay mặt xuống, hai vật ở cột trái ngay phía dưới; đích đầu cách 2 ô sau hàng rào, đích sau cách 3 ô sau hàng rào và tường cao
  var SAN_4 = ['.....', '.=D..', 'o....', '.=#D.', 'o....'];
  var BD_4 = { x: 0, y: 1, huong: 2 };
  // 5: hai làn băng chuyền (cột 1, 2) giữa xe và đích; xe quay mặt xuống ở cột trái, ba vật nằm ngay dưới ba chỗ đứng (hàng 0, 2, 4), ba đích sau làn băng (cách 3 ô)
  var SAN_5 = ['.^^D.', 'o^^..', '.^^D.', 'o^^..', '.^^D.', 'o^^..'];
  var BD_5 = { x: 0, y: 0, huong: 2 };
  // 6: ba sân; xe ở đáy quay mặt lên, rổ có sẵn vật. S1: hàng rào sát mũi xe, đích ô 2. S2: ô 1 trống, hàng rào ô 2, đích ô 3. S3: tường cao sát mũi xe, đích ô 2
  var SAN_6 = [
    ['.....', '.....', '..D..', '..=..', '.....'],
    ['.....', '..D..', '..=..', '.....', '.....'],
    ['.....', '.....', '..D..', '..#..', '.....']
  ];
  var BD_6 = { x: 2, y: 4, huong: 0 };
  // 7: hai sân giống nhau, vật ngay trước mũi xe MÀU KHÁC nhau (đỏ / xanh dương); trên cùng hướng xe: đích đỏ cách xe 2 ô, đích xanh dương cách 3 ô.
  // Xe gắn CAMERA: color() thấy màu vật ở ô trước mặt (2,3); nạp vật vào rổ rồi thì ô đó trống, camera chỉ thấy sàn không màu.
  var SAN_7 = ['.....', '..D..', '..D..', '..o..', '.....'];
  var MAU_7 = lop(5, 5, { '2,2': 'r', '2,1': 'b' });
  var VMAU_7 = [lop(5, 5, { '2,3': 'r' }), lop(5, 5, { '2,3': 'b' })];
  var BD_7 = { x: 2, y: 4, huong: 0 };
  // 8: như 4 nhưng cả hai đích cách 3 ô (hàng rào rồi tường cao); xe quay mặt xuống, vật ngay phía dưới
  var SAN_8 = ['.=#D.', 'o....', '.=#D.', 'o....', '.....'];
  var BD_8 = { x: 0, y: 0, huong: 2 };
  // 9: xe omni quay mặt lên ở hàng dưới; ba vật ngay trước mũi xe ở ba chỗ đứng, hàng rào chắn ngang ở giữa, ba đích cách xe 3 ô
  var SAN_9 = ['D.D.D', '=====', 'o.o.o', '.....'];
  var BD_9 = { x: 0, y: 3, huong: 0 };
  // 10: kho hàng 7×6: xe quay mặt xuống ở cột trái, ba vật ngay dưới ba chỗ đứng; đích hàng trên cách 3 ô (hàng rào, băng), hàng giữa cách 2 ô (hàng rào), hàng dưới cách 1 ô
  var SAN_10 = ['.=>D...', 'o......', '.=D....', 'o......', '.D.....', 'o......'];
  var BD_10 = { x: 0, y: 0, huong: 2 };

  /* ------------------------------------------------------------- chương trình dùng lại */

  // 1–2: đặt tầm rồi ném
  var CHINH_1 = ['aim(2)', 'throw()', 'wait()'];
  var CHINH_2 = ['aim(3)', 'throw()', 'wait()'];
  // 3: nạp, rẽ phải, ném tầm 3
  var CHINH_3 = ['load()', 'wait()', 'turn_right()', 'aim(3)', 'throw()', 'wait()'];
  // 4: xe quay mặt xuống: nạp, quay sang phải, toss(2), quay xuống, xuống hai ô, nạp, quay sang phải, toss(3)
  var CHINH_4 = ['load()', 'wait()', 'turn_left()', 'toss(2)', 'turn_right()', 'forward(2)', 'load()', 'wait()', 'turn_left()', 'toss(3)'];
  // 5: đặt tầm 3 một lần ngoài vòng; mỗi vòng nạp vật phía dưới, quay sang phải ném, quay xuống, đi xuống hai ô
  var CHINH_5 = nhieu(['aim(3)'], LAP(3, ['load()', 'wait()', 'turn_left()', 'throw()', 'wait()', 'turn_right()', 'forward(2)']));
  var CHINH_5_KHAC = LAP(3, ['load()', 'wait()', 'turn_left()', 'toss(3)', 'turn_right()', 'forward(2)']);
  // 6: tầm 3 nếu ô 1 trống, không thì tầm 2
  var CHINH_6 = ['if front_clear():', '    aim(3)', 'else:', '    aim(2)', 'throw()', 'wait()'];
  var CHINH_6_KHAC = ['if front_clear():', '    toss(3)', 'else:', '    toss(2)'];
  // 7: camera nhìn màu vật ở ô trước mặt (ghi vào biến) TRƯỚC khi nạp; nạp xong ô đó trống
  var CHINH_7 = ['c = color()', 'load()', 'wait()', 'if c == "red":', '    aim(2)', 'else:', '    aim(3)', 'throw()', 'wait()'];
  var CHINH_7_KHAC = ['c = color()', 'load()', 'wait()', 'if c == "red":', '    toss(2)', 'else:', '    toss(3)'];
  // 8: lặp hai lần, lob(3)
  var CHINH_8 = LAP(2, ['load()', 'wait()', 'turn_left()', 'lob(3)', 'turn_right()', 'forward(2)']);
  // 9: omni; tầm 3 đặt một lần
  var CHINH_9 = nhieu(['aim(3)'], LAP(3, ['load()', 'wait()', 'throw()', 'wait()', 'slide_r(2)']));
  var CHINH_9_KHAC = LAP(3, ['load()', 'wait()', 'toss(3)', 'slide_r(2)']);
  // 10: tầm 3, 2, 1 theo vòng
  var CHINH_10 = LAP(3, ['load()', 'wait()', 'turn_left()', 'aim(3 - i)', 'throw()', 'wait()', 'turn_right()', 'forward(2)']);
  var CHINH_10_KHAC = LAP(3, ['load()', 'wait()', 'turn_left()', 'toss(3 - i)', 'turn_right()', 'forward(2)']);

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Ném qua hàng rào', hang: 'lam-quen', coLoad: false, hamCuaEmCan: [],
      deBai: 'Máy ném ở mũi xe, trong rổ đã có sẵn một vật. aim(n) đặt tầm ném là n ô (n là 1, 2 hoặc 3); throw() rồi wait() ném vật bay thẳng tới ô cách xe n ô, bay qua được hàng rào (rào đã chặn xe hai bánh ở màn Tạo hàm forward). Ném vật vào ô đích.',
      veMaMau: 'Chương trình có sẵn ném ngay với tầm mặc định. Chạy thử, xem vật rơi xuống đâu rồi đặt tầm cho đúng.',
      san: SAN_1, batDau: BD_1, roBanDau: true,
      maMau: { chinh: ['throw()', 'wait()'] },
      sao: { o: 3, nhip: 1 },
      loiGiai: { chinh: CHINH_1.slice() },
      loiGiaiKhac: { moTa: 'Dùng biến n cho tầm ném', baiLam: { chinh: ['n = 2', 'aim(n)', 'throw()', 'wait()'] } },
      loiSai: [
        { moTa: 'Ném ngay không đặt tầm: tầm mặc định 1 làm vật rơi xuống hàng rào', baiLam: { chinh: ['throw()', 'wait()'] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Đặt tầm 3: vật bay qua đích, rơi ra sau', baiLam: { chinh: ['aim(3)', 'throw()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đặt tầm 1: vật rơi vào hàng rào nên vỡ', baiLam: { chinh: ['aim(1)', 'throw()', 'wait()'] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Quên wait() sau throw(): lệnh ném chưa chạy', baiLam: { chinh: ['aim(2)', 'throw()'] }, phaiCoMa: ['quen-wait', 'chua-dua-vat'] },
        { moTa: 'Chỉ đặt tầm, quên throw()', baiLam: { chinh: ['aim(2)', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đặt tầm 4: máy ném không ném xa tới vậy', baiLam: { chinh: ['aim(4)', 'throw()', 'wait()'] }, phaiCoMa: ['tam-sai'] }
      ],
      goiY: ['Tầm mặc định là 1 ô: vật rơi ngay xuống ô sát mũi xe. aim(n) đặt tầm n ô, n là 1, 2 hoặc 3.',
        'Đếm từ xe lên: ô đầu tiên là hàng rào, ô thứ hai là ô đích. Vật bay qua hàng rào nên chỉ cần ô rơi là ô đích.']
    }),

    man({
      so: 2, ten: 'Chọn tầm đúng', hang: 'lam-quen', coLoad: false, hamCuaEmCan: [],
      deBai: 'Ô đích nằm sau một hàng rào thấp rồi tới một ô tường cao. Vật ném bay qua được cả hai, nhưng không được rơi vào ô tường hay ô hàng rào. Chọn tầm đúng để vật rơi trúng ô đích.',
      veMaMau: 'Chương trình có sẵn ném với tầm 2. Chạy thử, xem vật rơi xuống đâu và tại sao nó vỡ.',
      san: SAN_2, batDau: BD_2, roBanDau: true,
      maMau: { chinh: ['aim(2)', 'throw()', 'wait()'] },
      sao: { o: 3, nhip: 1 },
      loiGiai: { chinh: CHINH_2.slice() },
      loiGiaiKhac: { moTa: 'Dùng biến n cho tầm ném', baiLam: { chinh: ['n = 3', 'aim(n)', 'throw()', 'wait()'] } },
      loiSai: [
        { moTa: 'Tầm 2: vật rơi vào ô tường cao nên vỡ', baiLam: { chinh: ['aim(2)', 'throw()', 'wait()'] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Tầm 1: vật rơi vào hàng rào nên vỡ', baiLam: { chinh: ['aim(1)', 'throw()', 'wait()'] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Không đặt tầm: tầm mặc định 1', baiLam: { chinh: ['throw()', 'wait()'] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Đặt tầm 3 nhưng quên throw()', baiLam: { chinh: ['aim(3)', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Tầm 5 không có: chỉ 1, 2 hoặc 3', baiLam: { chinh: ['aim(5)', 'throw()', 'wait()'] }, phaiCoMa: ['tam-sai'] }
      ],
      goiY: ['Đếm số ô từ xe tới ô đích: ô đầu là hàng rào, ô hai là tường cao, ô ba là gì?',
        'Máy ném không cần đường trống ở giữa, chỉ cần ô rơi là sàn trống (ở đây là ô đích).']
    }),

    man({
      so: 3, ten: 'Nạp rồi ném', hang: 'lam-quen', hamCuaEmCan: ['turn_right', 'right'],
      deBai: 'Rổ máy ném lúc đầu trống. Vật nằm ngay trước mũi xe thì load() rồi wait() nạp vật vào rổ (rổ chỉ chứa một vật). Nạp vật, quay xe về phía đích rồi ném vật vào ô đích.',
      veMaMau: 'Chương trình có sẵn ném ngay trong khi rổ còn trống. Chạy thử, xem chuyện gì xảy ra với throw().',
      san: SAN_3, batDau: BD_3,
      maMau: { chinh: ['aim(3)', 'throw()', 'wait()'] },
      sao: { o: 8, nhip: 3 },
      loiGiai: { chinh: CHINH_3.slice() },
      loiGiaiKhac: { moTa: 'Quay bằng right(1) của em', baiLam: { chinh: ['load()', 'wait()', 'right(1)', 'aim(3)', 'throw()', 'wait()'] } },
      loiSai: [
        { moTa: 'Ném ngay khi rổ còn trống: không có gì để ném', baiLam: { chinh: ['aim(3)', 'throw()', 'wait()'] }, phaiCoMa: ['nem-hut', 'chua-dua-vat'] },
        { moTa: 'Nạp xong ném luôn mà không quay xe: vật bay lên phía trên', baiLam: { chinh: ['load()', 'wait()', 'aim(3)', 'throw()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên wait() sau load(): lệnh quay bị bỏ vì nhịp nạp vật xe không đi', baiLam: { chinh: ['load()', 'turn_right()', 'aim(3)', 'throw()', 'wait()'] }, phaiCoMa: ['nem-dung-yen', 'chua-dua-vat'] },
        { moTa: 'Tầm 2: vật rơi vào ô trống trước đích', baiLam: { chinh: ['load()', 'wait()', 'turn_right()', 'aim(2)', 'throw()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Tầm 1: vật rơi vào hàng rào nên vỡ', baiLam: { chinh: ['load()', 'wait()', 'turn_right()', 'aim(1)', 'throw()', 'wait()'] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Nạp hai lần: rổ đã có vật', baiLam: { chinh: ['load()', 'wait()', 'load()', 'wait()', 'turn_right()', 'aim(3)', 'throw()', 'wait()'] }, phaiCoMa: ['ro-day'] },
        { moTa: 'Quay xe sang phải trước khi nạp: vật không còn ở trước mũi xe nên load() không nạp được', baiLam: { chinh: ['turn_right()', 'load()', 'wait()', 'aim(3)', 'throw()', 'wait()'] }, phaiCoMa: ['nap-hut', 'nem-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Nạp vật khi nó nằm ngay trước mũi xe: load() rồi wait(). Muốn ném sang phải thì xe phải quay mặt sang phải trước.',
        'Máy ném luôn ném thẳng theo hướng mặt xe. Hàng rào ở ngay ô sát mũi xe, đích cách xe 3 ô.']
    }),

    /* ------------------------------------------------------------- hàng 2: luyện */
    man({
      so: 4, ten: 'Hàm toss(n)', hang: 'luyen', hamCuaEmCan: ['turn_right', 'turn_left', 'forward', 'right'], taoHam: ['toss'],
      deBai: 'Xe quay mặt xuống, hai vật nằm ở cột trái ngay phía dưới chỗ xe đứng. Nạp vật rồi quay sang phải: một vật ném tới đích cách 2 ô, một vật ném tới đích cách 3 ô. Mỗi lần ném phải đặt tầm, ném rồi wait(); tạo hàm toss(n) làm trọn ba việc đó để dùng cho cả hai vật.',
      veMaMau: 'Chương trình có sẵn mới ném được vật đầu tiên bằng cách viết thẳng từng lệnh. Chạy thử, gói phần ném thành hàm toss(n) rồi viết tiếp cho vật thứ hai.',
      san: SAN_4, batDau: BD_4,
      maMau: { chinh: ['load()', 'wait()', 'turn_left()', 'aim(2)', 'throw()', 'wait()'] },
      sao: { o: 22, nhip: 9 },
      loiGiai: { chinh: CHINH_4.slice(), hamCuaEmMoi: [hToss()] },
      loiGiaiKhac: { moTa: 'Quay xuống bằng right(1) thay cho turn_right()', baiLam: { chinh: ['load()', 'wait()', 'turn_left()', 'toss(2)', 'right(1)', 'forward(2)', 'load()', 'wait()', 'turn_left()', 'toss(3)'] }, hamCuaEmMoi: [hToss()] },
      loiSai: [
        { moTa: 'Gọi toss() mà chưa tạo hàm', baiLam: { chinh: CHINH_4.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'toss(n) quên wait(): lệnh ném chưa chạy khi xe đã quay đi', baiLam: { chinh: CHINH_4.slice() }, hamCuaEmMoi: [hToss(['aim(n)', 'throw()'])], phaiCoMa: ['nem-dung-yen', 'chua-dua-vat'] },
        { moTa: 'toss(n) quên throw(): chỉ đặt tầm, không ném', baiLam: { chinh: CHINH_4.slice() }, hamCuaEmMoi: [hToss(['aim(n)', 'wait()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'toss(n) đặt tầm cố định 2 thay vì n: vật thứ hai rơi vào tường cao', baiLam: { chinh: CHINH_4.slice() }, hamCuaEmMoi: [hToss(['aim(2)', 'throw()', 'wait()'])], phaiCoMa: ['nem-vo'] },
        { moTa: 'Quên nạp vật thứ hai: rổ trống nên throw() không ném gì', baiLam: { chinh: ['load()', 'wait()', 'turn_left()', 'toss(2)', 'turn_right()', 'forward(2)', 'turn_left()', 'toss(3)'] }, hamCuaEmMoi: [hToss()], phaiCoMa: ['nem-hut', 'chua-dua-vat'] },
        { moTa: 'Không dùng hàm, viết thẳng aim, throw, wait cho cả hai vật: tràn khung 10 ô', baiLam: { chinh: ['load()', 'wait()', 'turn_left()', 'aim(2)', 'throw()', 'wait()', 'turn_right()', 'forward(2)', 'load()', 'wait()', 'turn_left()', 'aim(3)', 'throw()', 'wait()'] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Mỗi lần ném đều gồm aim(n), throw(), wait(): gói ba dòng đó vào một hàm có tham số n tên toss.',
        'Nạp vật phía dưới xong xe phải quay sang phải để ném. Giữa hai vật xe quay mặt xuống lại và đi xuống hai ô, rồi nạp vật thứ hai, lại quay sang phải.']
    }),

    man({
      so: 5, ten: 'Ném qua làn băng', hang: 'luyen', hamCuaEmCan: ['turn_right', 'turn_left', 'forward'],
      deBai: 'Hai làn băng chuyền chắn giữa xe và các ô đích, cách xe 3 ô: xe đứng trên băng sẽ bị đẩy đi lệch, nhưng vật ném bay qua băng được. Xe quay mặt xuống, ba vật nằm ở cột trái ngay phía dưới ba chỗ xe sẽ đứng. Nạp từng vật, quay sang phải rồi ném qua làn băng tới ba ô đích.',
      veMaMau: 'Chương trình có sẵn đã ném được vật đầu tiên. Chạy thử, rồi lặp lại cho hai vật còn lại ở dưới.',
      san: SAN_5, batDau: BD_5,
      maMau: { chinh: ['aim(3)', 'load()', 'wait()', 'turn_left()', 'throw()', 'wait()'] },
      sao: { o: 18, nhip: 15 },
      loiGiai: { chinh: CHINH_5.slice() },
      loiGiaiKhac: { moTa: 'Ném bằng toss(3) trong vòng lặp', baiLam: { chinh: CHINH_5_KHAC.slice() }, hamCuaEmMoi: [] },
      loiSai: [
        { moTa: 'Quên đặt tầm: tầm mặc định 1 làm vật rơi xuống làn băng, không tới đích', baiLam: { chinh: LAP(3, ['load()', 'wait()', 'turn_left()', 'throw()', 'wait()', 'turn_right()', 'forward(2)']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đặt tầm 2: vật rơi vào ô băng, không tới đích', baiLam: { chinh: nhieu(['aim(2)'], LAP(3, ['load()', 'wait()', 'turn_left()', 'throw()', 'wait()', 'turn_right()', 'forward(2)'])) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ lặp hai lần: còn một vật chưa ném', baiLam: { chinh: nhieu(['aim(3)'], LAP(2, ['load()', 'wait()', 'turn_left()', 'throw()', 'wait()', 'turn_right()', 'forward(2)'])) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên quay sang phải trước khi ném: xe còn quay mặt xuống nên vật bay xuống rơi trúng vật khác và vỡ', baiLam: { chinh: nhieu(['aim(3)'], LAP(3, ['load()', 'wait()', 'throw()', 'wait()', 'turn_right()', 'forward(2)'])) }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Nạp xong nhưng quên throw(): rổ đầy, lần nạp sau báo rổ đã có vật', baiLam: { chinh: nhieu(['aim(3)'], LAP(3, ['load()', 'wait()', 'turn_left()', 'turn_right()', 'forward(2)'])) }, phaiCoMa: ['ro-day'] }
      ],
      goiY: ['Xe đứng yên ở cột trái, làn băng không đụng tới xe. Tầm ném giữ nguyên tới lần aim kế nên chỉ cần đặt một lần.',
        'Mỗi vòng: nạp vật phía dưới, quay sang phải ném, rồi quay mặt xuống và đi xuống hai ô sang vật kế.']
    }),

    man({
      so: 6, ten: 'Đo rồi ném', hang: 'luyen', hamCuaEmCan: ['toss'], cb: 'kc',
      deBai: 'Ba sân khác nhau: có sân hàng rào nằm ngay sát mũi xe, có sân ô trước mặt còn trống và hàng rào ở xa hơn. Ô đích luôn nằm ngay sau hàng rào hoặc tường. Dùng front_clear() để chọn tầm, ném vật vào đích ở cả ba sân.',
      veMaMau: 'Chương trình có sẵn ném luôn với tầm 2. Chạy thử, xem sân nào thắng, sân nào vật bị vỡ.',
      san: SAN_6, batDau: BD_6, roBanDau: [true, true, true],
      maMau: { chinh: ['aim(2)', 'throw()', 'wait()'] },
      sao: { o: 6, nhip: 3 },
      loiGiai: { chinh: CHINH_6.slice() },
      loiGiaiKhac: { moTa: 'Ném bằng toss(n) của em', baiLam: { chinh: CHINH_6_KHAC.slice() } },
      loiSai: [
        { moTa: 'Tầm cố định 2: sân thứ hai vật rơi vào hàng rào nên vỡ', baiLam: { chinh: ['aim(2)', 'throw()', 'wait()'] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Tầm cố định 3: ở hai sân kia vật bay quá đích', baiLam: { chinh: ['aim(3)', 'throw()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đảo hai nhánh if: tầm sai ở cả ba sân', baiLam: { chinh: ['if front_clear():', '    aim(2)', 'else:', '    aim(3)', 'throw()', 'wait()'] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Chọn tầm đúng nhưng quên throw()', baiLam: { chinh: ['if front_clear():', '    aim(3)', 'else:', '    aim(2)', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Điều kiện sai: not front_clear() chọn nhầm tầm', baiLam: { chinh: ['if not front_clear():', '    aim(3)', 'else:', '    aim(2)', 'throw()', 'wait()'] }, phaiCoMa: ['nem-vo'] }
      ],
      goiY: ['front_clear() cho biết ô ngay trước mũi xe có trống không: nó cho biết hàng rào gần hay xa.',
        'Ô trước mặt trống thì hàng rào nằm xa hơn, nên đích ở xa hơn: dùng if ... else để chọn tầm.']
    }),

    /* ------------------------------------------------------------- hàng 3: biến thể */
    man({
      so: 7, ten: 'Đích đúng màu', hang: 'bien-the', hamCuaEmCan: ['toss'], cb: 'mau',
      deBai: 'Xe màn này gắn camera: color() cho biết màu của thứ ở ô ngay trước mặt xe. Vật nằm ngay trước mũi xe có màu đỏ hoặc xanh dương, ở hai sân; ô đích màu nào chỉ nhận vật màu đó: đích đỏ cách xe 2 ô, đích xanh dương cách xe 3 ô, cùng hướng với vật. Nhìn màu vật để chọn tầm, nạp vật vào rổ rồi ném vào đúng đích ở cả hai sân.',
      veMaMau: 'Chương trình có sẵn nạp vật rồi ném với tầm 2. Chạy thử, xem vật màu nào rơi đúng đích, màu nào sai.',
      san: [SAN_7, SAN_7], mau: [MAU_7, MAU_7], vatMau: VMAU_7, batDau: BD_7,
      maMau: { chinh: ['load()', 'wait()', 'aim(2)', 'throw()', 'wait()'] },
      sao: { o: 9, nhip: 4 },
      loiGiai: { chinh: CHINH_7.slice() },
      loiGiaiKhac: { moTa: 'Ném bằng toss(n) của em', baiLam: { chinh: CHINH_7_KHAC.slice() } },
      loiSai: [
        { moTa: 'Tầm cố định 2: vật xanh dương rơi xuống đích đỏ nên không được tính', baiLam: { chinh: ['load()', 'wait()', 'aim(2)', 'throw()', 'wait()'] }, phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] },
        { moTa: 'Tầm cố định 3: vật đỏ rơi xuống đích xanh dương nên không được tính', baiLam: { chinh: ['load()', 'wait()', 'aim(3)', 'throw()', 'wait()'] }, phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] },
        { moTa: 'Nhìn màu SAU khi nạp: vật đã vào rổ, ô trước mặt trống nên camera chỉ thấy sàn không màu, luôn là "none"', baiLam: { chinh: ['load()', 'wait()', 'c = color()', 'if c == "red":', '    aim(2)', 'else:', '    aim(3)', 'throw()', 'wait()'] }, phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] },
        { moTa: 'Viết hoa "Red": không khớp màu nào nên luôn chọn nhánh else', baiLam: { chinh: ['c = color()', 'load()', 'wait()', 'if c == "Red":', '    aim(2)', 'else:', '    aim(3)', 'throw()', 'wait()'] }, phaiCoMa: ['ten-mau-sai', 'chua-dua-vat'] },
        { moTa: 'Đảo hai nhánh: vật nào cũng rơi nhầm đích', baiLam: { chinh: ['c = color()', 'load()', 'wait()', 'if c == "red":', '    aim(3)', 'else:', '    aim(2)', 'throw()', 'wait()'] }, phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] }
      ],
      goiY: ['Camera nhìn ô ngay trước mũi xe, nơi vật đang nằm. load() lấy vật đi nên màu vật phải được nhìn (và ghi vào một biến) TRƯỚC khi load().',
        'Lưu màu vào một biến, rồi dùng if ... else để chọn tầm cho đích đỏ hay đích xanh dương.']
    }),

    man({
      so: 8, ten: 'Sửa tầm ném', hang: 'bien-the', hamCuaEmCan: ['turn_right', 'turn_left', 'forward', 'right'],
      deBai: 'Màn cho sẵn hàm lob(n) để ném vật tới ô cách xe n ô, nhưng hàm đang làm vật vỡ. Sửa lỗi trong lob(n) rồi chạy chương trình để ném cả hai vật qua hàng rào và tường cao vào hai ô đích. Xe quay mặt xuống nạp vật ngay phía dưới, rồi quay sang phải mới ném.',
      veMaMau: 'Chương trình có sẵn gọi lob(3) cho từng vật. Chạy thử, xem vật rơi xuống đâu rồi sửa hàm lob.',
      san: SAN_8, batDau: BD_8,
      maMau: { chinh: LAP(2, ['load()', 'wait()', 'turn_left()', 'lob(3)', 'turn_right()', 'forward(2)']), hamCuaMan: [hLob(T_LOB_SAI)] },
      sao: { o: 19, nhip: 9 },
      loiGiai: { chinh: CHINH_8.slice(), hamCuaMan: [hLob()] },
      loiGiaiKhac: { moTa: 'Sửa lob bằng tầm cố định 3 và quay xuống bằng right(1)', baiLam: { chinh: LAP(2, ['load()', 'wait()', 'turn_left()', 'lob(3)', 'right(1)', 'forward(2)']), hamCuaMan: [hLob(['aim(3)', 'throw()', 'wait()'])] } },
      loiSai: [
        { moTa: 'Chưa sửa lob(n): tầm cố định 2 làm vật rơi vào tường cao nên vỡ', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hLob(T_LOB_SAI)] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Sửa lob(n) thành aim(1): vật rơi vào hàng rào', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hLob(['aim(1)', 'throw()', 'wait()'])] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Sửa lob(n) quên wait(): xe quay đi trước khi ném chạy', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hLob(['aim(n)', 'throw()'])] }, phaiCoMa: ['nem-dung-yen', 'chua-dua-vat'] },
        { moTa: 'Sửa lob(n) bỏ throw(): chỉ đặt tầm, không ném', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hLob(['aim(n)', 'wait()'])] }, phaiCoMa: ['ro-day'] },
        { moTa: 'Gọi lob(2) trong chương trình: tầm 2 rơi vào tường cao', baiLam: { chinh: LAP(2, ['load()', 'wait()', 'turn_left()', 'lob(2)', 'turn_right()', 'forward(2)']), hamCuaMan: [hLob()] }, phaiCoMa: ['nem-vo'] }
      ],
      goiY: ['Chạy thử, xem ô vật rơi xuống: lob(3) đặt tầm bao nhiêu? Hàm lob đang bỏ qua tham số n.',
        'Cho aim() dùng chính tham số n của hàm, không phải một số cố định.']
    }),

    man({
      so: 9, ten: 'Omni ném sang ngang', hang: 'bien-the', hamCuaEmCan: ['toss', 'slide_r'], omni: true,
      deBai: 'Xe omni quay mặt lên, hàng rào chắn ngang nên xe không đi lên được. Ba vật nằm ngay trước mũi xe ở ba chỗ đứng của hàng dưới, ba đích cách xe 3 ô, bên kia hàng rào. Xe omni trượt ngang mà không phải quay: nạp, ném rồi trượt tới chỗ đứng kế.',
      veMaMau: 'Chương trình có sẵn nạp và ném vật đầu tiên. Chạy thử, rồi lặp lại cho hai vật còn lại.',
      san: SAN_9, batDau: BD_9,
      maMau: { chinh: ['aim(3)', 'load()', 'wait()', 'throw()', 'wait()'] },
      sao: { o: 10, nhip: 10 },
      loiGiai: { chinh: CHINH_9.slice() },
      loiGiaiKhac: { moTa: 'Ném bằng toss(3) trong vòng lặp', baiLam: { chinh: CHINH_9_KHAC.slice() } },
      loiSai: [
        { moTa: 'Quên đặt tầm: tầm mặc định 1 làm vật rơi lại đúng ô vừa nhặt, không tới đích', baiLam: { chinh: LAP(3, ['load()', 'wait()', 'throw()', 'wait()', 'slide_r(2)']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đặt tầm 2: vật rơi vào hàng rào nên vỡ', baiLam: { chinh: nhieu(['aim(2)'], LAP(3, ['load()', 'wait()', 'throw()', 'wait()', 'slide_r(2)'])) }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Trượt một ô thay vì hai: lần nạp kế tiếp không có vật trước mũi xe', baiLam: { chinh: nhieu(['aim(3)'], LAP(3, ['load()', 'wait()', 'throw()', 'wait()', 'slide_r(1)'])) }, phaiCoMa: ['nap-hut', 'nem-hut', 'chua-dua-vat'] },
        { moTa: 'Quên nạp vật: rổ trống nên throw() không ném gì', baiLam: { chinh: nhieu(['aim(3)'], LAP(3, ['throw()', 'wait()', 'slide_r(2)'])) }, phaiCoMa: ['nem-hut', 'chua-dua-vat'] },
        { moTa: 'Chỉ lặp hai lần: còn một vật chưa ném', baiLam: { chinh: nhieu(['aim(3)'], LAP(2, ['load()', 'wait()', 'throw()', 'wait()', 'slide_r(2)'])) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Hàng rào chắn ngang nên xe chỉ đi ngang được: slide_r(n) trượt sang phải n ô mà vẫn quay mặt lên.',
        'Ba chỗ đứng cách nhau hai ô. Nhớ đặt tầm một lần trước vòng lặp: tầm giữ nguyên cho tới lần aim kế.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Kho hàng có rào', hang: 'trum', hamCuaEmCan: ['turn_right', 'turn_left', 'forward', 'toss'],
      deBai: 'Trong kho, xe quay mặt xuống, ba vật nằm ở cột trái ngay phía dưới ba chỗ xe đứng. Ba ô đích nằm bên phải: có hàng cách 3 ô (sau hàng rào và làn băng), có hàng cách 2 ô (sau hàng rào), có hàng cách 1 ô. Nạp từng vật, quay sang phải rồi đặt tầm đúng cho mỗi hàng để ném vào đích.',
      veMaMau: 'Chương trình có sẵn ném vật đầu tiên bằng tầm 3 rồi dừng. Chạy thử rồi dùng vòng lặp cho cả ba hàng.',
      san: SAN_10, batDau: BD_10,
      maMau: { chinh: ['load()', 'wait()', 'turn_left()', 'aim(3)', 'throw()', 'wait()'] },
      sao: { o: 18, nhip: 15 },
      huyHieu: { ma: 'may-nem', ten: 'Huy hiệu Máy ném' },
      loiGiai: { chinh: CHINH_10.slice() },
      loiGiaiKhac: { moTa: 'Ném bằng toss(3 - i) trong vòng lặp', baiLam: { chinh: CHINH_10_KHAC.slice() } },
      loiSai: [
        { moTa: 'Tầm cố định 3 cho cả ba hàng: hàng giữa và hàng dưới vật rơi quá ô đích', baiLam: { chinh: nhieu(['aim(3)'], LAP(3, ['load()', 'wait()', 'turn_left()', 'throw()', 'wait()', 'turn_right()', 'forward(2)'])) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Tầm tăng dần 1, 2, 3 (đảo thứ tự): hàng trên vật rơi vào hàng rào nên vỡ', baiLam: { chinh: LAP(3, ['load()', 'wait()', 'turn_left()', 'aim(i + 1)', 'throw()', 'wait()', 'turn_right()', 'forward(2)']) }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Quên quay sang phải trước khi ném: xe còn quay mặt xuống nên vật bay xuống rơi trúng vật khác và vỡ', baiLam: { chinh: LAP(3, ['load()', 'wait()', 'aim(3 - i)', 'throw()', 'wait()', 'turn_right()', 'forward(2)']) }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Chỉ lặp hai lần: hàng dưới chưa có vật', baiLam: { chinh: LAP(2, ['load()', 'wait()', 'turn_left()', 'aim(3 - i)', 'throw()', 'wait()', 'turn_right()', 'forward(2)']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên nạp vật: rổ trống nên throw() không ném gì', baiLam: { chinh: LAP(3, ['turn_left()', 'aim(3 - i)', 'throw()', 'wait()', 'turn_right()', 'forward(2)']) }, phaiCoMa: ['nem-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Hàng trên cần tầm 3, hàng giữa tầm 2, hàng dưới tầm 1: tầm giảm dần 3, 2, 1 theo mỗi vòng lặp.',
        'Dùng biến của vòng for để tính tầm: i chạy 0, 1, 2 thì 3 - i chạy 3, 2, 1.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

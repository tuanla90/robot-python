/* ============================================================================
   man-xich.js — "Đường học": CHƯƠNG `xich` · BÁNH XÍCH (10 màn).
   Robot là XE BÁNH XÍCH (loaiRobot 'xich'; mỗi màn khai robot: { than: 'xich', tay: 'kep' | null } để giao diện
   vẽ đúng part). CÙNG bộ lệnh với xe hai bánh: left_move / right_move / left_back / right_back / wait (và 4 lệnh
   tay kẹp ở 7, 10). Xưởng hàm mở (moXuong true), được dùng hàm của em. Chương trình 10 ô; mỗi hàm một khung
   riêng 10 ô. Đã học `for` và `if` ở các chương trước nên cauTruc ['for', 'if'].

   LUẬT XÍCH (san-hoc.js):
   - Tiến / lùi: 1 ô mỗi nhịp như xe bánh, nên move() cũ VẪN đúng.
   - QUAY CHẬM: một nhịp chỉ một bên xích chạy (hay hai bên ngược chiều) thì xe chỉ "nhích nửa vòng". Cần 2 nhịp
     LIÊN TIẾP CÙNG tổ hợp lệnh mới quay đủ 90°. Nhịp kế không cùng tổ hợp thì phần quay dở MẤT ('xich-quay-do').
     Hệ quả: turn_right() / turn_left() / u_turn() của xe bánh (1 nhịp) quay sai trên xích.
   - Leo được bậc thang S như đi trên sàn (xe bánh thì không).
   - Băng chuyền KHÔNG đẩy được xích (bám chắc), xuôi hay ngược chiều đều vậy.
   - LUẬT VẬT (14/10): vật nằm đất CHIẾM Ô (xe không tiến / lùi vào được); pick() / drop() nhặt và thả ở Ô TRƯỚC MŨI XE, nên xe dừng
     SÁT vật (mũi xe hướng về vật) rồi mới nhặt, và dừng sát ô đích rồi mới thả. Vật đang cầm thì không chiếm ô.

   BÀI HỌC: code phụ thuộc phần cứng. Mỗi thân cần bộ hàm quay riêng. Học sinh KHÔNG sửa đè hàm cũ (xe bánh ở chương
   khác vẫn cần chúng) mà tạo hàm mới cho xích.

   Hàm của em MỚI (tên cốt truyện, bị khóa trong kho, xem KhoHam.datTenCoDinh):
     xich.3   tr_right() = quay phải 90° (2 nhịp):  for i in range(2): left_move(); wait()        (3 ô)
     xich.4   tr_left()  = quay trái 90° (2 nhịp):  for i in range(2): right_move(); wait()       (3 ô)
   Tên không trùng hàm cốt truyện chương trước. Hàm CỦA MÀN (tạm): 8 cho sẵn tr_sai() quay thiếu một nhịp.

   Trường riêng của chương này:
   - canHam: 'tran-khung' — viết KHÔNG dùng hàm (mỗi khúc quẹo viết thẳng 2 nhịp quay, rút gọn bằng for) thì tràn khung 10 ô.
             (kiem-xich.mjs tự đếm từ vết chạy của lời giải để chứng minh.)
   - nhipTheoLoiGiai: true — sao.nhip là nhịp của lời giải CHUẨN, có thể dài hơn đường ngắn nhất (BFS): màn có pick() /
             drop() (7, 10) vì chúng còn nâng tay ở nhịp riêng.

   Sân là HÀNH LANG (mọi ô ngoài đường đi là tường) nên không có đường tắt; BFS cho xích (do-duong-xich.mjs) xác nhận.
   Màn 9 có VÒNG hai đường: đường ngắn gấp khúc (xe bánh chọn nó) và đường dài ít khúc quẹo (xích chọn nó).

   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_XICH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var HAM_XICH_TAY = HAM_XICH.concat(['arm_down', 'arm_up', 'grab', 'release']);

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }

  // thân các hàm của chương
  var T_TR_RIGHT = LAP(2, ['left_move()', 'wait()']);                  // for i in range(2): left_move(); wait()
  var T_TR_LEFT = LAP(2, ['right_move()', 'wait()']);
  var T_TR_RIGHT_DAI = ['left_move()', 'wait()', 'left_move()', 'wait()'];
  var T_TR_LEFT_DAI = ['right_move()', 'wait()', 'right_move()', 'wait()'];
  function hTrRight(than) { return H('tr_right', [], than || T_TR_RIGHT); }
  function hTrLeft(than) { return H('tr_left', [], than || T_TR_LEFT); }
  // 8: tr_sai() quay thiếu một nhịp (chỉ một nhịp quay thay vì hai)
  var T_TR_SAI = ['left_move()', 'wait()'];
  function hTrSai(than) { return H('tr_sai', [], than || T_TR_RIGHT); }

  function man(m, coTay) {
    m.chuong = 'xich';
    m.cauTruc = ['for', 'if'];
    m.loaiRobot = 'xich';
    m.robot = { than: 'xich', tay: coTay ? 'kep' : null };
    m.hamGoc = coTay ? HAM_XICH_TAY : HAM_XICH;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------- chương trình dùng lại */

  // 2: lên 3, quẹo phải, sang phải 4
  var CHINH_2_CU = nhieu(LAP(3, 'move()'), ['turn_right()'], LAP(4, 'move()'));                    // maMau: hàm turn_right() cũ
  var CHINH_2 = nhieu(LAP(3, 'move()'), LAP(2, ['left_move()', 'wait()']), LAP(4, 'move()'));      // lời giải: tự viết quay 2 nhịp
  var CHINH_2_KHAC = nhieu(LAP(3, 'move()'), T_TR_RIGHT_DAI, LAP(4, 'move()'));
  // 3: lên 2, quẹo phải, sang phải 3, quẹo phải, xuống 2
  var CHINH_3 = nhieu(LAP(2, 'move()'), ['tr_right()'], LAP(3, 'move()'), ['tr_right()'], LAP(2, 'move()'));
  // 4: sang phải 2, quẹo trái, lên 1, quẹo phải, sang phải 2, quẹo trái, lên 1
  var CHINH_4 = ['move()', 'move()', 'tr_left()', 'move()', 'tr_right()', 'move()', 'move()', 'tr_left()', 'move()'];
  // 5: sang phải 3 (qua bậc thang), quẹo trái, lên 3 (qua bậc thang), quẹo phải, sang phải 3
  var CHINH_5 = nhieu(LAP(3, 'move()'), ['tr_left()'], LAP(3, 'move()'), ['tr_right()'], LAP(3, 'move()'));
  // 6: xuống 3, quẹo trái, sang phải 4, quẹo phải, xuống 2
  var CHINH_6 = nhieu(LAP(3, 'move()'), ['tr_left()'], LAP(4, 'move()'), ['tr_right()'], LAP(2, 'move()'));
  // 7: tiến sát vật, nhặt (vật ở ô trước mũi xe), mang sang phải 3 (qua bậc thang), quẹo trái, lên 2 (qua bậc thang) tới sát ô đích, thả xuống ô trước mũi xe
  var CHINH_7 = nhieu(['move()', 'pick()'], LAP(3, 'move()'), ['tr_left()'], LAP(2, 'move()'), ['drop()']);
  // 8: vòng quanh sân 4×4: 3 lần (đi 3 ô, quẹo phải) rồi đi 1 ô
  var CHINH_8 = nhieu(['for i in range(3):', '    for j in range(3):', '        move()', '    tr_sai()'], ['move()']);
  // 9: đường dài ít khúc quẹo (17 nhịp) và đường ngắn gấp khúc (19 nhịp)
  var CHINH_9 = nhieu(LAP(6, 'move()'), ['tr_right()'], LAP(4, 'move()'), ['tr_right()'], LAP(3, 'move()'));
  var CHINH_9_NGAN = nhieu(['tr_right()', 'move()', 'move()'], LAP(2, ['tr_left()', 'move()', 'tr_right()', 'move()']), ['tr_left()', 'move()']);
  // 10: tiến sát vật, nhặt, bước vào ô vật vừa nằm, leo cầu thang 3 nấc (quẹo trái, 1 ô, quẹo phải, 1 ô) tới sát ô đích rồi thả xuống ô trước mũi xe
  var CHINH_10 = nhieu(['move()', 'pick()', 'move()'], LAP(3, ['tr_left()', 'move()', 'tr_right()', 'move()']), ['drop()']);

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Đường thẳng', hang: 'lam-quen',
      deBai: 'Xe bánh xích dùng chung lệnh với xe hai bánh, nên hàm move() của em chạy được ngay. Đưa xe xích tới cờ.',
      veMaMau: 'Chương trình có sẵn mới đưa xe đi hai ô. Chạy thử rồi viết tiếp.',
      san: ['#######', '......F', '#######'],
      batDau: { x: 0, y: 1, huong: 1 },
      hamCuaEmCan: ['move'],
      maMau: { chinh: ['move()', 'move()'] },
      sao: { o: 5, nhip: 6 },
      loiGiai: { chinh: LAP(6, 'move()') },
      loiGiaiKhac: {
        moTa: 'Gọi move() từng lần một, không dùng vòng lặp',
        baiLam: { chinh: lap('move()', 6) }
      },
      loiSai: [
        { moTa: 'Đi thiếu một ô: xe dừng sát cờ', baiLam: { chinh: LAP(5, 'move()') }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ ra lệnh cho hai bánh mà quên wait(): bánh chưa quay', baiLam: { chinh: ['left_move()', 'right_move()'] }, phaiCoMa: ['quen-wait', 'chua-toi-co'] },
        { moTa: 'Cho hai bánh quay lùi: xe lùi ra ngoài sân', baiLam: { chinh: LAP(6, ['left_back()', 'right_back()', 'wait()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Xe xích tiến khi cả hai bên xích cùng quay tới, giống hai bánh: move() của em làm đúng việc đó.',
        'Đếm số ô từ xe tới cờ rồi lặp move() đúng số lần.']
    }, false),

    man({
      so: 2, ten: 'Quay nửa vòng', hang: 'lam-quen',
      deBai: 'Đưa xe xích tới cờ qua một khúc quẹo phải. Hàm turn_right() của em chỉ đúng với xe hai bánh, còn xe xích quay chậm hơn.',
      veMaMau: 'Chương trình có sẵn gọi turn_right() của em ở chỗ quẹo phải. Chạy thử, xem xe làm gì ở chỗ đó.',
      san: ['#####', '....F', '.####', '.####', '.####'],
      batDau: { x: 0, y: 4, huong: 0 },
      hamCuaEmCan: ['move', 'turn_right'],
      maMau: { chinh: CHINH_2_CU.slice() },
      sao: { o: 10, nhip: 9 },
      loiGiai: { chinh: CHINH_2.slice() },
      loiGiaiKhac: {
        moTa: 'Viết hai nhịp quay thẳng bốn dòng, không dùng vòng lặp',
        baiLam: { chinh: CHINH_2_KHAC.slice() }
      },
      loiSai: [
        { moTa: 'Không sửa gì: turn_right() chỉ quay nửa vòng, xe đâm tường', baiLam: { chinh: CHINH_2_CU.slice() }, phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Hai nhịp quay dùng hai lệnh khác nhau: không cộng lại thành 90°', baiLam: { chinh: nhieu(LAP(3, 'move()'), ['left_move()', 'wait()', 'right_back()', 'wait()'], LAP(4, 'move()')) }, phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chen wait() giữa hai nhịp quay: phần quay dở mất', baiLam: { chinh: nhieu(LAP(3, 'move()'), ['left_move()', 'wait()', 'wait()', 'left_move()', 'wait()'], LAP(4, 'move()')) }, phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quay nhầm sang trái: xe đâm tường', baiLam: { chinh: nhieu(LAP(3, 'move()'), LAP(2, ['right_move()', 'wait()']), LAP(4, 'move()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Chạy từng nhịp và nhìn xe ở chỗ quẹo: nó quay được bao nhiêu độ sau lệnh turn_right()?',
        'Xe xích cần hai nhịp liên tiếp cùng một lệnh mới quay đủ 90°.']
    }, false),

    man({
      so: 3, ten: 'Hàm tr_right()', hang: 'lam-quen', canHam: 'tran-khung', hamCuaEmCan: ['move'], taoHam: ['tr_right'],
      deBai: 'Mỗi thân robot cần bộ hàm quay riêng. Tạo hàm tr_right() quay phải 90° cho xe xích, rồi đưa xe qua hai khúc quẹo phải tới cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi tr_right() ở hai chỗ quẹo, nhưng em chưa có hàm đó. Tạo hàm tr_right không có đối số.',
      san: ['####', '....', '.##.', '.##F'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: { chinh: CHINH_3.slice() },
      sao: { o: 14, nhip: 11 },
      loiGiai: { chinh: CHINH_3.slice(), hamCuaEmMoi: [hTrRight()] },
      loiGiaiKhac: {
        moTa: 'Hàm tr_right() gọi turn_right() cũ hai lần liền (hai nhịp quay cùng lệnh)',
        baiLam: { chinh: CHINH_3.slice() },
        hamCuaEmMoi: [hTrRight(['turn_right()', 'turn_right()'])]
      },
      loiSai: [
        { moTa: 'Gọi tr_right() mà chưa tạo hàm', baiLam: { chinh: CHINH_3.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'tr_right() chỉ có một nhịp quay (như turn_right() cũ): xe quay nửa vòng', baiLam: { chinh: CHINH_3.slice() }, hamCuaEmMoi: [hTrRight(T_TR_SAI)], phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'tr_right() quên wait() trong vòng lặp: các lệnh left_move() dồn vào một nhịp', baiLam: { chinh: CHINH_3.slice() }, hamCuaEmMoi: [hTrRight(LAP(2, 'left_move()'))], phaiCoMa: ['banh-goi-lai', 'chua-toi-co'] },
        { moTa: 'tr_right() dùng right_move(): xe quay sang trái', baiLam: { chinh: CHINH_3.slice() }, hamCuaEmMoi: [hTrRight(T_TR_LEFT)], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không dùng hàm: viết thẳng các nhịp quay vào chương trình, quá 10 ô', baiLam: { chinh: nhieu(LAP(2, 'move()'), T_TR_RIGHT, LAP(3, 'move()'), T_TR_RIGHT, LAP(2, 'move()')) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Quay phải là left_move() rồi wait(); xe xích phải làm đúng như vậy hai nhịp liên tiếp.',
        'Hai lệnh left_move() và wait() lặp hai lần: dùng vòng for cho gọn.']
    }, false),

    /* ------------------------------------------------------------- hàng 2: luyện */
    man({
      so: 4, ten: 'Hàm tr_left()', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['move', 'tr_right'], taoHam: ['tr_left'],
      deBai: 'Quay trái cũng cần hai nhịp liên tiếp cùng một lệnh. Tạo hàm tr_left() quay trái 90°, rồi đưa xe qua đường gấp khúc tới cờ.',
      veMaMau: 'Chương trình có sẵn gọi tr_left() ở hai chỗ, nhưng em chưa có hàm đó. Tạo hàm tr_left không có đối số.',
      san: ['###HF', '##...', '...##'],                                               // thùng nặng H cạnh cờ: xích không đẩy được (màn gặp khó trước Súng hơi)
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: { chinh: CHINH_4.slice() },
      sao: { o: 18, nhip: 12 },
      loiGiai: { chinh: CHINH_4.slice(), hamCuaEmMoi: [hTrLeft()] },
      loiGiaiKhac: {
        moTa: 'Hàm tr_left() viết hai nhịp quay thẳng bốn dòng, không dùng vòng lặp',
        baiLam: { chinh: CHINH_4.slice() },
        hamCuaEmMoi: [hTrLeft(T_TR_LEFT_DAI)]
      },
      loiSai: [
        { moTa: 'Gọi tr_left() mà chưa tạo hàm', baiLam: { chinh: CHINH_4.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'tr_left() chỉ có một nhịp quay: xe quay nửa vòng rồi đâm tường', baiLam: { chinh: CHINH_4.slice() }, hamCuaEmMoi: [hTrLeft(['right_move()', 'wait()'])], phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'tr_left() dùng left_move(): xe quay sang phải', baiLam: { chinh: CHINH_4.slice() }, hamCuaEmMoi: [hTrLeft(T_TR_RIGHT)], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Hai nhịp quay của tr_left() dùng hai lệnh khác nhau: không cộng lại', baiLam: { chinh: CHINH_4.slice() }, hamCuaEmMoi: [hTrLeft(['right_move()', 'wait()', 'left_back()', 'wait()'])], phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Dùng tr_right() ở chỗ cần quẹo trái đầu tiên: xe đâm tường', baiLam: { chinh: CHINH_4.map(function (s, i) { return i === 2 ? 'tr_right()' : s; }) }, hamCuaEmMoi: [hTrLeft()], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Quay trái là right_move() rồi wait(), làm hai nhịp liên tiếp: giống tr_right() nhưng bên kia.',
        'Chỗ nào đường rẽ trái thì gọi tr_left(), rẽ phải thì gọi tr_right().']
    }, false),

    man({
      so: 5, ten: 'Bậc thang', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['move', 'tr_right', 'tr_left'],
      deBai: 'Ô S là bậc thang, như ở màn Bậc thang của Xưởng hàm: xe hai bánh không leo được, còn xe xích leo như đi trên sàn. Đưa xe xích qua các bậc thang tới cờ.',
      veMaMau: 'Chương trình có sẵn đưa xe tới chân khúc quẹo đầu tiên. Chạy thử rồi viết tiếp.',
      san: ['#######', '###...F', '###.###', '###S###', '.SS.###'],
      batDau: { x: 0, y: 4, huong: 1 },
      maMau: { chinh: LAP(3, 'move()') },
      sao: { o: 17, nhip: 13 },
      loiGiai: { chinh: CHINH_5.slice() },
      loiGiaiKhac: {
        moTa: 'Đoạn đầu gọi move() từng lần một',
        baiLam: { chinh: nhieu(lap('move()', 3), CHINH_5.slice(2)) }
      },
      loiSai: [
        { moTa: 'Thiếu một move() trên đoạn cuối: xe dừng sát cờ', baiLam: { chinh: nhieu(CHINH_5.slice(0, -2), LAP(2, 'move()')) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng turn_left() cũ của xe hai bánh: xe chỉ quay nửa vòng', baiLam: { chinh: CHINH_5.map(function (s) { return s === 'tr_left()' ? 'turn_left()' : s; }) }, phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quẹo phải thay vì quẹo trái ở khúc đầu: xe đâm tường', baiLam: { chinh: CHINH_5.map(function (s, i) { return i === 2 ? 'tr_right()' : s; }) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không dùng hàm quay: viết thẳng các nhịp quay, quá 10 ô', baiLam: { chinh: nhieu(LAP(3, 'move()'), T_TR_LEFT, LAP(3, 'move()'), T_TR_RIGHT, LAP(3, 'move()')) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Bậc thang S đi qua như một ô thường; mỗi lệnh move() vẫn đi đúng một ô.',
        'Chỗ nào quẹo trái gọi tr_left(), quẹo phải gọi tr_right(); hàm turn_left() cũ không dùng cho xe xích.']
    }, false),

    man({
      so: 6, ten: 'Băng chuyền bất lực', hang: 'luyen', hamCuaEmCan: ['move', 'tr_right', 'tr_left'],
      deBai: 'Băng chuyền từng đẩy xe hai bánh trôi đi. Xe xích bám chắc nên băng chuyền, xuôi hay ngược chiều, đều không đẩy được nó. Đi qua các băng chuyền tới cờ như đi trên sàn.',
      veMaMau: 'Chương trình có sẵn đưa xe xuống ba ô trên băng chuyền ngược chiều. Chạy thử rồi viết tiếp.',
      san: ['.####', '^####', '^####', '^><<<', '####^', '####F'],
      batDau: { x: 0, y: 0, huong: 2 },
      maMau: { chinh: LAP(3, 'move()') },
      sao: { o: 17, nhip: 13 },
      loiGiai: { chinh: CHINH_6.slice() },
      loiGiaiKhac: {
        moTa: 'Chia đoạn thứ nhất thành hai vòng lặp',
        baiLam: { chinh: nhieu(LAP(2, 'move()'), ['move()'], CHINH_6.slice(2)) }
      },
      loiSai: [
        { moTa: 'Đứng chờ băng chuyền đưa đi: băng không đẩy được xe xích nên xe không tới cờ', baiLam: { chinh: nhieu(LAP(3, 'move()'), LAP(4, 'wait()')) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quẹo phải thay vì quẹo trái ở góc đầu tiên: xe đâm tường', baiLam: { chinh: CHINH_6.map(function (s, i) { return i === 2 ? 'tr_right()' : s; }) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Thiếu một move() ở đoạn cuối: xe dừng sát cờ', baiLam: { chinh: nhieu(CHINH_6.slice(0, -2), ['move()']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Băng chuyền chỉ ghi vào ô mũi tên chiều đẩy; xe xích không bị đẩy nên cứ đi như thường.',
        'Đếm số ô của từng đoạn thẳng, kể cả ô băng chuyền.']
    }, false),

    /* ------------------------------------------------------------- hàng 3: biến thể */
    man({
      so: 7, ten: 'Xích gắp hàng', hang: 'bien-the', hamCuaEmCan: ['move', 'tr_left', 'pick', 'drop'],
      mucTieu: 'dua-vat', nhipTheoLoiGiai: true,
      deBai: 'Xe xích gắn tay kẹp, dùng pick() và drop() như xe hai bánh: nhặt và thả ở ô ngay trước mũi xe, còn vật nằm đất chiếm ô nên xe phải dừng sát vật. Nhặt vật, mang qua các bậc thang, dừng sát ô đích (khung vàng) rồi thả.',
      veMaMau: 'Chương trình có sẵn đưa xe tới sát vật và nhặt nó. Chạy thử rồi viết tiếp phần còn lại.',
      san: ['####D', '####.', '####S', '..oS.'],
      vatChat: ['.....', '.....', '.....', '..N..'],                                     // vật nam châm chữ N: tay kẹp gắp như vật thường (màn gặp khó trước Nam châm)
      batDau: { x: 0, y: 3, huong: 1 },
      maMau: { chinh: ['move()', 'pick()'] },
      sao: { o: 24, nhip: 11 },
      loiGiai: { chinh: CHINH_7.slice() },
      loiGiaiKhac: {
        moTa: 'Đoạn sau khi nhặt vật (trước khúc quẹo) gọi move() từng lần một',
        baiLam: { chinh: nhieu(['move()', 'pick()'], lap('move()', 3), ['tr_left()'], LAP(2, 'move()'), ['drop()']) }
      },
      loiSai: [
        { moTa: 'Quên pick(): xe tới đích tay không', baiLam: { chinh: CHINH_7.filter(function (s) { return s !== 'pick()'; }) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên drop(): vật vẫn nằm trên tay', baiLam: { chinh: CHINH_7.slice(0, -1) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Hạ tay và kẹp rồi quay luôn: tay vướng sàn nên xe không quay được', baiLam: { chinh: nhieu(['move()', 'arm_down()', 'grab()'], LAP(3, 'move()'), ['tr_left()'], LAP(2, 'move()'), ['drop()']) }, phaiCoMa: ['tay-vuong', 'chua-dua-vat'] },
        { moTa: 'Thả bằng release() khi tay còn nâng: vật rơi vỡ', baiLam: { chinh: nhieu(CHINH_7.slice(0, -1), ['release()', 'wait()']) }, phaiCoMa: ['vat-vo'] }
      ],
      goiY: ['pick() và drop() tự hạ tay, kẹp hoặc thả rồi nâng tay lên lại, nên xe quay và đi được ngay sau đó.',
        'Dừng sát vật mới nhặt được, và dừng sát ô đích (mũi xe hướng về nó) mới thả đúng chỗ; chú ý ô nào là bậc thang.']
    }, true),

    man({
      so: 8, ten: 'Sửa hàm tr_sai', hang: 'bien-the', hamCuaEmCan: ['move'],
      deBai: 'Hàm tr_sai() của màn muốn quay phải 90° nhưng xe xích lại không quay đủ. Tìm chỗ thiếu rồi sửa để xe đi hết một vòng sân tới cờ.',
      veMaMau: 'Chương trình có sẵn đi hết vòng bằng tr_sai(). Chạy thử, xem xe sai từ chỗ nào rồi sửa thân hàm.',
      san: ['....', '###.', 'F##.', '....'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: CHINH_8.slice(), hamCuaMan: [hTrSai(T_TR_SAI)] },
      sao: { o: 11, nhip: 16 },
      loiGiai: { chinh: CHINH_8.slice(), hamCuaMan: [hTrSai(T_TR_RIGHT)] },
      loiGiaiKhac: {
        moTa: 'Sửa tr_sai() bằng hai nhịp quay viết thẳng bốn dòng',
        baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hTrSai(T_TR_RIGHT_DAI)] }
      },
      loiSai: [
        { moTa: 'Không sửa gì: tr_sai() chỉ quay nửa vòng, xe đâm tường', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hTrSai(T_TR_SAI)] }, phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Sửa thành quay trái (right_move): xe quay sai bên và đâm tường', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hTrSai(T_TR_LEFT)] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Thêm wait() thừa giữa hai nhịp quay: phần quay dở mất', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hTrSai(['left_move()', 'wait()', 'wait()', 'left_move()', 'wait()'])] }, phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Thêm lệnh quay thứ hai nhưng quên wait(): lệnh dồn sang nhịp của move()', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hTrSai(['left_move()', 'wait()', 'left_move()'])] }, phaiCoMa: ['banh-goi-lai', 'chua-toi-co'] }
      ],
      goiY: ['Chạy thử và xem nhịp nào xe quay chưa đủ: tr_sai() cho xe quay bao nhiêu nhịp?',
        'Xe xích cần hai nhịp liên tiếp cùng một lệnh để quay đủ 90°.']
    }, false),

    man({
      so: 9, ten: 'Đường nào nhanh hơn', hang: 'bien-the', hamCuaEmCan: ['move', 'tr_right', 'tr_left'],
      deBai: 'Có hai đường tới cờ: một đường ngắn nhưng gấp khúc, một đường dài nhưng ít khúc quẹo. Mỗi khúc quẹo tốn xe xích hai nhịp, hãy chọn đường tới cờ trong ít nhịp nhất.',
      veMaMau: 'Chương trình có sẵn đi đường ngắn gấp khúc và tới được cờ, nhưng mất nhiều nhịp. Tìm đường khác nhanh hơn.',
      san: ['.....#', '.###.#', '.###.#', '.###F#', '.##..#', '.#..##', '...###'],
      batDau: { x: 0, y: 6, huong: 0 },
      maMau: { chinh: CHINH_9_NGAN.slice() },
      sao: { o: 14, nhip: 17 },
      loiGiai: { chinh: CHINH_9.slice() },
      loiGiaiKhac: {
        moTa: 'Mỗi đoạn dài chia làm hai vòng lặp',
        baiLam: { chinh: nhieu(LAP(3, 'move()'), LAP(3, 'move()'), ['tr_right()'], LAP(4, 'move()'), ['tr_right()'], LAP(3, 'move()')) }
      },
      loiSai: [
        { moTa: 'Đi đường ngắn gấp khúc: tới cờ nhưng mất 19 nhịp, nhiều hơn đường dài', baiLam: { chinh: CHINH_9_NGAN.slice() }, phaiCoMa: [] },
        { moTa: 'Đi đường dài nhưng thiếu một ô ở đoạn cuối: xe dừng sát cờ', baiLam: { chinh: nhieu(CHINH_9.slice(0, -2), LAP(2, 'move()')) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi đường dài nhưng dùng turn_right() cũ: xe quay nửa vòng rồi đâm tường', baiLam: { chinh: CHINH_9.map(function (s) { return s === 'tr_right()' ? 'turn_right()' : s; }) }, phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Đếm nhịp của từng đường: mỗi ô đi tốn 1 nhịp, mỗi khúc quẹo của xe xích tốn 2 nhịp.',
        'Đường dài nhưng ít khúc quẹo có thể tới cờ sớm hơn đường ngắn nhiều khúc quẹo.']
    }, false),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Cầu thang dài', hang: 'trum', canHam: 'tran-khung', hamCuaEmCan: ['move', 'tr_right', 'tr_left', 'pick', 'drop'],
      mucTieu: 'dua-vat', nhipTheoLoiGiai: true,
      deBai: 'Mang vật qua con đường dài có bậc thang và băng chuyền tới ô đích: nhặt và thả đều ở ô ngay trước mũi xe, nên xe dừng sát vật và dừng sát ô đích. Dùng vòng lặp cùng các hàm quay của xe xích cho gọn.',
      veMaMau: 'Chương trình có sẵn đưa xe tới sát vật rồi nhặt nó. Viết tiếp phần leo lên sát ô đích và thả vật.',
      san: ['####.>D', '###S^##', '##S<###', '.So####'],
      batDau: { x: 0, y: 3, huong: 1 },
      maMau: { chinh: ['move()', 'pick()'] },
      sao: { o: 28, nhip: 23 },
      huyHieu: { ma: 'xich', ten: 'Huy hiệu Bánh xích' },
      loiGiai: { chinh: CHINH_10.slice() },
      loiGiaiKhac: {
        moTa: 'Bước đầu tiên viết trong một vòng lặp một lần',
        baiLam: { chinh: nhieu(LAP(1, 'move()'), CHINH_10.slice(1)) }
      },
      loiSai: [
        { moTa: 'Quên pick(): xe leo tới đích tay không', baiLam: { chinh: CHINH_10.filter(function (s) { return s !== 'pick()'; }) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên drop(): vật vẫn nằm trên tay', baiLam: { chinh: CHINH_10.slice(0, -1) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dùng turn_left() và turn_right() cũ: xe chỉ quay nửa vòng, đâm tường', baiLam: { chinh: CHINH_10.map(function (s) { return s.replace('tr_left', 'turn_left').replace('tr_right', 'turn_right'); }) }, phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Đổi thứ tự quay trong vòng lặp (phải rồi trái): xe đâm tường', baiLam: { chinh: CHINH_10.map(function (s) { return s === '    tr_left()' ? '    tr_right()' : s === '    tr_right()' ? '    tr_left()' : s; }) }, phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Không dùng vòng lặp cho cầu thang: quá 10 ô', baiLam: { chinh: nhieu(['move()', 'pick()', 'move()'], ['tr_left()', 'move()', 'tr_right()', 'move()', 'tr_left()', 'move()', 'tr_right()', 'move()', 'tr_left()', 'move()', 'tr_right()', 'move()'], ['drop()']) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Mỗi bậc cầu thang là: quẹo trái, đi một ô, quẹo phải, đi một ô. Đặt bốn dòng đó vào một vòng for.',
        'Băng chuyền không đẩy được xe xích; nhớ pick() trước khi leo và drop() khi tới ô đích.']
    }, true)
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

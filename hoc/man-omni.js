/* ============================================================================
   man-omni.js — "Đường học": CHƯƠNG `omni` · BÁNH OMNI (10 màn).
   Robot là XE BÁNH OMNI (loaiRobot 'omni'; mỗi màn khai robot: { than: 'omni', tay: 'kep' | null } để giao diện
   vẽ đúng part). Có MỌI lệnh bánh của xe hai bánh (left_move / right_move / left_back / right_back / wait) với đúng luật
   cũ, nên move(), turn_right(), turn_left() của em vẫn chạy ĐÚNG. Thêm HAI lệnh gốc mới:
       slide_left()   trượt ngang 1 ô sang TRÁI so với hướng mặt, không đổi hướng
       slide_right()  trượt ngang 1 ô sang PHẢI so với hướng mặt, không đổi hướng
   (và 4 lệnh tay kẹp ở 6, 10). Cũng chỉ RA LỆNH; wait() cho nhịp trôi. Xưởng hàm mở (moXuong true), được dùng hàm
   của em. Chương trình 10 ô; mỗi hàm một khung riêng 10 ô. cauTruc ['for', 'if'].

   LUẬT OMNI (san-hoc.js):
   - KHÔNG ĐI CHÉO: một nhịp chỉ trượt ngang HOẶC tiến / lùi / quay. Nhịp có slide mà còn lệnh bánh thì lệnh bánh bị
     bỏ ('omni-khong-cheo', chẩn đoán thông tin). slide_left() cùng slide_right() một nhịp thì lệnh sau bị bỏ ('slide-goi-lai').
   - slide tính theo HƯỚNG MẶT: xe quay mặt sang trái thì slide_right() đi LÊN màn hình.
   - Không leo bậc thang S (như xe bánh).
   - Băng chuyền đẩy omni MẠNH HƠN: bánh nhỏ trơn, đứng trên băng chỉ 1 nhịp đã bị đẩy 1 ô. Đi xuôi băng = 2 ô / nhịp;
     đi ngược băng thì đứng im.
   - Tay hạ thì xe không đi, không quay, không trượt được (tay vướng sàn).

   BÀI HỌC: hướng TƯƠNG ĐỐI (theo mặt xe) khác hướng tuyệt đối (theo màn hình); trượt ngang thay quay thì ít nhịp, ít ô hơn;
   băng chuyền vừa là địa hình vừa là đòn bẩy.

   Hàm của em MỚI (tên cốt truyện, bị khóa trong kho, xem KhoHam.datTenCoDinh):
     omni.3   slide_r(n)  = for i in range(n): slide_right(); wait()      (3 ô, có tham số n, như forward(n) của chương 6)
     omni.4   slide_l(n)  = for i in range(n): slide_left(); wait()       (3 ô)
   Tên không trùng hàm cốt truyện chương trước và không phải hàm gốc. Hàm CỦA MÀN (tạm): 8 cho sẵn side_r(n) trượt nhầm
   sang trái (slide_left) để học sinh sửa.

   Trường riêng của chương này:
   - canHam: 'tran-khung' — viết KHÔNG dùng hàm trượt (hay hàm tiến) thì tràn khung 10 ô (kiem-omni.mjs tự khai triển
             lời giải để chứng minh).
   - nhipTheoLoiGiai: true — sao.nhip là nhịp của lời giải CHUẨN, có thể dài hơn đường ngắn nhất (BFS) đúng 1 nhịp: màn có
             pick() / drop() (6, 10) vì nâng tay của pick() gộp được vào nhịp trượt kế tiếp.

   Sân là HÀNH LANG (mọi ô ngoài đường đi là tường), trừ 2 (ba cột) và 7 (hai băng, một đường bị băng chặn), nên không có đường tắt; BFS cho omni
   (do-duong-omni.mjs) xác nhận. Omni quay mặt lên (huong 0) ở mọi màn trừ 5 (quay mặt sang trái) và 10 (quay mặt sang phải).

   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_OMNI = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait'];
  var HAM_OMNI_TAY = HAM_OMNI.concat(['arm_down', 'arm_up', 'grab', 'release']);

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần; n là số hoặc tên biến. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }

  // thân các hàm của chương
  var T_SLIDE_R = LAP('n', ['slide_right()', 'wait()']);
  var T_SLIDE_L = LAP('n', ['slide_left()', 'wait()']);
  function hSlideR(than) { return H('slide_r', ['n'], than || T_SLIDE_R); }
  function hSlideL(than) { return H('slide_l', ['n'], than || T_SLIDE_L); }
  function hSideR(than) { return H('side_r', ['n'], than || T_SLIDE_R); }                   // hàm của màn 8
  var T_SIDE_SAI = LAP('n', ['slide_left()', 'wait()']);                                     // 8: trượt NHẦM sang trái

  function man(m, coTay) {
    m.chuong = 'omni';
    m.cauTruc = ['for', 'if'];
    m.loaiRobot = 'omni';
    m.robot = { than: 'omni', tay: coTay ? 'kep' : null };
    m.hamGoc = coTay ? HAM_OMNI_TAY : HAM_OMNI;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------- chương trình dùng lại */

  // 1: trượt phải 4 lần
  var CHINH_1 = LAP(4, ['slide_right()', 'wait()']);
  // 2: lên 1, trượt phải, lên 2, trượt trái, lên 1
  var CHINH_2 = ['move()', 'slide_right()', 'wait()', 'move()', 'move()', 'slide_left()', 'wait()', 'move()'];
  var CHINH_2_KHAC = ['left_move()', 'right_move()', 'wait()', 'slide_right()', 'wait()', 'move()', 'move()', 'slide_left()', 'wait()', 'move()'];
  // 3: phải 3, lên 2, phải 2, lên 2, phải 1, lên 2
  var CHINH_3 = ['slide_r(3)', 'forward(2)', 'slide_r(2)', 'forward(2)', 'slide_r(1)', 'forward(2)'];
  // 4: rắn: trái 4, lên 2, phải 4, lên 2, trái 4, lên 2
  var CHINH_4 = ['slide_l(4)', 'forward(2)', 'slide_r(4)', 'forward(2)', 'slide_l(4)', 'forward(2)'];
  // 5: xe quay mặt sang TRÁI: tiến (sang trái) 2, slide_right (đi LÊN) 3, tiến 3, slide_left (đi XUỐNG) 2
  var CHINH_5 = ['forward(2)', 'slide_r(3)', 'forward(3)', 'slide_l(2)'];
  // 6: tiến 2, trượt trái, pick, trượt phải, tiến 1, trượt phải, drop (viết thẳng slide_*: vừa khít 10 dòng)
  var CHINH_6 = ['forward(2)', 'slide_left()', 'wait()', 'pick()', 'slide_right()', 'wait()', 'move()', 'slide_right()', 'wait()', 'drop()'];
  var CHINH_6_KHAC = ['forward(2)', 'slide_l(1)', 'pick()', 'slide_r(1)', 'move()', 'slide_r(1)', 'drop()'];
  // 7: trượt xuôi băng ngang 3 nhịp (6 ô), rồi lên xuôi băng dọc 2 nhịp
  var CHINH_7 = ['slide_r(3)', 'move()', 'move()'];
  // 8: bậc thang: phải 2, lên 2, phải 2, lên 2, phải 2
  var CHINH_8 = ['side_r(2)', 'forward(2)', 'side_r(2)', 'forward(2)', 'side_r(2)'];
  // 9: bốn bậc thang: mỗi bậc một lần trượt phải rồi một lần tiến
  var CHINH_9_CHEO = LAP(4, ['slide_right()', 'move()']);                                     // maMau: gộp trượt với tiến trong một nhịp
  var CHINH_9 = LAP(4, ['slide_right()', 'wait()', 'move()']);
  // 10: xe quay mặt sang PHẢI: tiến 2, slide_left (đi LÊN) nhặt, slide_right (đi XUỐNG) 3 ô theo băng, tiến 3, slide_left, thả
  var CHINH_10 = ['forward(2)', 'slide_l(1)', 'pick()', 'slide_r(3)', 'forward(3)', 'slide_l(1)', 'drop()'];
  var CHINH_10_KHAC = ['forward(2)', 'slide_l(1)', 'pick()', 'slide_r(1)', 'slide_r(2)', 'forward(3)', 'slide_l(1)', 'drop()'];

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Trượt ngang', hang: 'lam-quen',
      deBai: 'Xe omni có thêm hai lệnh slide_left() và slide_right(): trượt ngang một ô sang trái hay phải mà không quay mặt. Đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn cho xe trượt một ô sang phải. Chạy thử, xem mặt xe có quay không, rồi viết tiếp.',
      san: ['#####', '....F', '#####'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: ['slide_right()', 'wait()'] },
      sao: { o: 3, nhip: 4 },
      loiGiai: { chinh: CHINH_1.slice() },
      loiGiaiKhac: {
        moTa: 'Gọi slide_right() và wait() từng lần một, không dùng vòng lặp',
        baiLam: { chinh: nhieu(['slide_right()', 'wait()'], ['slide_right()', 'wait()'], ['slide_right()', 'wait()'], ['slide_right()', 'wait()']) }
      },
      loiSai: [
        { moTa: 'Quên wait(): bốn lệnh trượt dồn vào một nhịp, xe chưa trượt', baiLam: { chinh: LAP(4, 'slide_right()') }, phaiCoMa: ['slide-goi-lai', 'quen-wait', 'chua-toi-co'] },
        { moTa: 'Trượt thiếu một lần: xe dừng sát cờ', baiLam: { chinh: LAP(3, ['slide_right()', 'wait()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Trượt sang trái: xe ra ngoài sân', baiLam: { chinh: LAP(4, ['slide_left()', 'wait()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quay phải rồi tiến như xe hai bánh: tới cờ nhưng mất thêm một nhịp quay', baiLam: { chinh: nhieu(['turn_right()'], LAP(4, 'move()')) }, phaiCoMa: [] }
      ],
      goiY: ['Mỗi lệnh slide chỉ ra lệnh cho xe; wait() mới cho nhịp trôi, như các lệnh bánh.',
        'Lá cờ ở bên phải xe, cách bốn ô: slide_right() sang phải một ô mỗi nhịp.']
    }, false),

    man({
      so: 2, ten: 'Né vật cản', hang: 'lam-quen', hamCuaEmCan: ['move'],
      deBai: 'Một khối tường chắn đường thẳng tới cờ. Trượt vòng qua khối tường mà không cần quay mặt, rồi đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn đưa xe tiến một ô. Chạy thử rồi viết tiếp.',
      san: ['#F#', '...', '.#.', '...', '...'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: ['move()'] },
      sao: { o: 11, nhip: 6 },
      loiGiai: { chinh: CHINH_2.slice() },
      loiGiaiKhac: {
        moTa: 'Nhịp đầu viết thẳng left_move(), right_move(), wait() thay cho move()',
        baiLam: { chinh: CHINH_2_KHAC.slice() }
      },
      loiSai: [
        { moTa: 'Đi thẳng vào khối tường', baiLam: { chinh: LAP(4, 'move()') }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Trượt cùng một phía hai lần: xe trượt ra khỏi sân', baiLam: { chinh: ['move()', 'slide_right()', 'wait()', 'move()', 'move()', 'slide_right()', 'wait()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên wait() sau lệnh trượt: lệnh trượt dính chung nhịp với move()', baiLam: { chinh: ['move()', 'slide_right()', 'move()', 'move()', 'slide_left()', 'wait()', 'move()'] }, phaiCoMa: ['omni-khong-cheo', 'chua-toi-co'] }
      ],
      goiY: ['move() của em vẫn chạy đúng trên xe omni. Trượt sang một bên đúng lúc cần tránh, rồi trượt về.',
        'Đi qua khối tường cần trượt sang một bên, đi hết hai ô, rồi trượt về lại cột giữa.']
    }, false),

    man({
      so: 3, ten: 'Hàm slide_r(n)', hang: 'lam-quen', canHam: 'tran-khung', hamCuaEmCan: ['move', 'forward'], taoHam: ['slide_r'],
      deBai: 'Tạo hàm slide_r(n) trượt sang phải n ô, giống cách forward(n) tiến n ô. Dùng nó và forward(n) đưa xe omni leo hết các khúc tới cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi slide_r() ở ba chỗ, nhưng em chưa có hàm đó. Tạo hàm slide_r có một tham số n.',
      san: ['######F', '######.', '#####..', '#####.#', '###...#', '###.###', '....###'],
      batDau: { x: 0, y: 6, huong: 0 },
      maMau: { chinh: CHINH_3.slice() },
      sao: { o: 14, nhip: 12 },
      loiGiai: { chinh: CHINH_3.slice(), hamCuaEmMoi: [hSlideR()] },
      loiGiaiKhac: {
        moTa: 'Đoạn lên cuối gọi move() từng lần thay vì forward(2)',
        baiLam: { chinh: nhieu(CHINH_3.slice(0, 5), ['move()', 'move()']) },
        hamCuaEmMoi: [hSlideR()]
      },
      loiSai: [
        { moTa: 'Gọi slide_r() mà chưa tạo hàm', baiLam: { chinh: CHINH_3.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'slide_r(n) chỉ trượt một ô mỗi lần gọi (chưa dùng vòng lặp với n)', baiLam: { chinh: CHINH_3.slice() }, hamCuaEmMoi: [hSlideR(['slide_right()', 'wait()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'slide_r(n) lặp số ô cố định thay vì n', baiLam: { chinh: CHINH_3.slice() }, hamCuaEmMoi: [hSlideR(LAP(2, ['slide_right()', 'wait()']))], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'slide_r(n) quên wait() trong vòng lặp: các lệnh trượt dồn vào một nhịp', baiLam: { chinh: CHINH_3.slice() }, hamCuaEmMoi: [hSlideR(LAP('n', 'slide_right()'))], phaiCoMa: ['slide-goi-lai', 'chua-toi-co'] },
        { moTa: 'slide_r(n) dùng slide_left(): xe trượt sang trái', baiLam: { chinh: CHINH_3.slice() }, hamCuaEmMoi: [hSlideR(T_SLIDE_L)], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không dùng hàm slide_r: viết thẳng ba vòng lặp trượt, quá 10 ô', baiLam: { chinh: nhieu(LAP(3, ['slide_right()', 'wait()']), ['forward(2)'], LAP(2, ['slide_right()', 'wait()']), ['forward(2)'], LAP(1, ['slide_right()', 'wait()']), ['forward(2)']) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Thân slide_r(n) giống thân forward(n), chỉ đổi lệnh tiến thành lệnh trượt phải, kèm wait().',
        'Đếm số ô của từng đoạn trượt ngang và từng đoạn đi lên rồi truyền vào ngoặc.']
    }, false),

    /* ------------------------------------------------------------- hàng 2: luyện */
    man({
      so: 4, ten: 'Hàm slide_l(n)', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['move', 'forward', 'slide_r'], taoHam: ['slide_l'],
      deBai: 'Tạo hàm slide_l(n) trượt sang trái n ô. Dùng slide_l, slide_r và forward đưa xe omni qua hành lang uốn rắn tới cờ mà không phải quay mặt lần nào.',
      veMaMau: 'Chương trình có sẵn đã gọi slide_l() ở hai chỗ, nhưng em chưa có hàm đó. Tạo hàm slide_l có một tham số n.',
      san: ['F####', '.####', '.....', '####.', '.....', '.####', '.....'],
      batDau: { x: 4, y: 6, huong: 0 },
      maMau: { chinh: CHINH_4.slice() },
      sao: { o: 17, nhip: 18 },
      loiGiai: { chinh: CHINH_4.slice(), hamCuaEmMoi: [hSlideL()] },
      loiGiaiKhac: {
        moTa: 'Đoạn lên cuối gọi move() từng lần thay vì forward(2)',
        baiLam: { chinh: nhieu(CHINH_4.slice(0, 5), ['move()', 'move()']) },
        hamCuaEmMoi: [hSlideL()]
      },
      loiSai: [
        { moTa: 'Gọi slide_l() mà chưa tạo hàm', baiLam: { chinh: CHINH_4.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'slide_l(n) trượt sang phải (dùng slide_right): xe ra ngoài sân', baiLam: { chinh: CHINH_4.slice() }, hamCuaEmMoi: [hSlideL(T_SLIDE_R)], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'slide_l() không có tham số n: gọi slide_l(4) báo lỗi', baiLam: { chinh: CHINH_4.slice() }, hamCuaEmMoi: [H('slide_l', [], LAP(4, ['slide_left()', 'wait()']))], phaiCoMa: ['loi-chay'] },
        { moTa: 'Quay mặt rồi tiến như xe hai bánh: 12 dòng, quá 10 ô', baiLam: { chinh: ['turn_left()', 'forward(4)', 'turn_right()', 'forward(2)', 'turn_right()', 'forward(4)', 'turn_left()', 'forward(2)', 'turn_left()', 'forward(4)', 'turn_right()', 'forward(2)'] }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Đoạn thứ ba trượt phải thay vì trái: xe đâm tường', baiLam: { chinh: CHINH_4.map(function (s, i) { return i === 4 ? 'slide_r(4)' : s; }) }, hamCuaEmMoi: [hSlideL()], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Thân slide_l(n) giống slide_r(n) nhưng dùng lệnh trượt trái.',
        'Đường uốn rắn: trượt trái, lên, trượt phải, lên, trượt trái, lên. Mặt xe luôn quay lên trên.']
    }, false),

    man({
      so: 5, ten: 'Mặt xe quay sang trái', hang: 'luyen', hamCuaEmCan: ['move', 'forward', 'slide_r', 'slide_l'],
      deBai: 'Lần này xe quay mặt sang trái. slide_left() và slide_right() tính theo hướng mặt của xe, không theo màn hình. Đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn đưa xe tiến hai ô, theo hướng mặt xe. Chạy thử rồi viết tiếp.',
      san: ['#######', '#....##', '#.##.##', '#F##.##', '####...'],
      batDau: { x: 6, y: 4, huong: 3 },
      maMau: { chinh: ['forward(2)'] },
      sao: { o: 15, nhip: 10 },
      loiGiai: { chinh: CHINH_5.slice() },
      loiGiaiKhac: {
        moTa: 'Đoạn đi thẳng ở giữa gọi move() từng lần thay vì forward(3)',
        baiLam: { chinh: ['forward(2)', 'slide_r(3)', 'move()', 'move()', 'move()', 'slide_l(2)'] }
      },
      loiSai: [
        { moTa: 'Nghĩ slide_left() là sang trái màn hình: thực ra xe đi xuống và đâm tường', baiLam: { chinh: ['forward(2)', 'slide_l(3)', 'forward(3)', 'slide_r(2)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Trượt thiếu một ô ở đoạn cuối: xe dừng sát cờ', baiLam: { chinh: ['forward(2)', 'slide_r(3)', 'forward(3)', 'slide_l(1)'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quay mặt lên rồi tiến như xe hai bánh: tới cờ nhưng nhiều nhịp và nhiều ô hơn', baiLam: { chinh: ['forward(2)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(3)', 'turn_left()', 'forward(2)'] }, phaiCoMa: [] }
      ],
      goiY: ['Xe quay mặt sang trái: phía bên phải của xe là phía trên màn hình, phía bên trái là phía dưới.',
        'Nghĩ như đang ngồi trên xe: tiến thì đi về phía mặt xe, slide_right() sang tay phải em.']
    }, false),

    man({
      so: 6, ten: 'Nhặt bên cạnh', hang: 'luyen', hamCuaEmCan: ['move', 'forward', 'pick', 'drop'],
      mucTieu: 'dua-vat', nhipTheoLoiGiai: true,
      deBai: 'Vật nằm trong một hốc ở bên cạnh hành lang, ô đích nằm trong hốc bên kia. Xe omni trượt sang nhặt, trượt ra, rồi trượt sang thả, không cần quay mặt.',
      veMaMau: 'Chương trình có sẵn đưa xe tiến hai ô tới ngang chỗ vật. Chạy thử rồi viết tiếp phần còn lại.',
      san: ['###', '#.D', 'o.#', '#.#', '#.#'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: ['forward(2)'] },
      sao: { o: 25, nhip: 9 },
      loiGiai: { chinh: CHINH_6.slice() },
      loiGiaiKhac: {
        moTa: 'Mỗi lần trượt gọi slide_l(1) hoặc slide_r(1) thay vì hai dòng slide và wait()',
        baiLam: { chinh: CHINH_6_KHAC.slice() }
      },
      loiSai: [
        { moTa: 'Quên pick(): xe trượt qua lại tay không', baiLam: { chinh: CHINH_6.filter(function (s) { return s !== 'pick()'; }) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên drop(): vật vẫn nằm trên tay', baiLam: { chinh: CHINH_6.slice(0, -1) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Hạ tay và kẹp rồi trượt luôn: tay vướng sàn nên xe không trượt được', baiLam: { chinh: ['forward(2)', 'slide_left()', 'wait()', 'arm_down()', 'grab()', 'wait()', 'slide_right()', 'wait()'] }, phaiCoMa: ['tay-vuong', 'chua-dua-vat'] },
        { moTa: 'Trượt sang phải ở hốc bên kia trước: ô đích chưa có vật, còn vật thì nằm hốc trái', baiLam: { chinh: ['forward(2)', 'slide_right()', 'wait()', 'pick()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['pick() và drop() tự hạ tay, kẹp hoặc thả rồi nâng tay lên lại, nên xe trượt được ngay sau đó.',
        'Vật ở hốc bên trái xe, ô đích ở hốc bên phải: trượt sang trái nhặt, trượt về, tiến một ô, trượt sang phải thả.']
    }, true),

    /* ------------------------------------------------------------- hàng 3: biến thể */
    man({
      so: 7, ten: 'Băng đẩy mạnh', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'slide_r'],
      deBai: 'Băng chuyền đẩy xe omni ngay sau một nhịp, vì bánh nhỏ trơn. Đi xuôi băng thì được thêm một ô mỗi nhịp, đi ngược băng thì đứng im. Chọn đường tới cờ.',
      veMaMau: 'Chương trình có sẵn cho xe trượt một nhịp sang phải. Chạy thử và đếm xem xe đi được mấy ô.',
      san: ['......F', 'v#####^', 'v#####^', 'v#####^', '.>>>>>.'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { chinh: ['slide_r(1)'] },
      sao: { o: 9, nhip: 5 },
      loiGiai: { chinh: CHINH_7.slice() },
      loiGiaiKhac: {
        moTa: 'Đoạn lên gọi forward(2) thay cho hai lần move()',
        baiLam: { chinh: ['slide_r(3)', 'forward(2)'] }
      },
      loiSai: [
        { moTa: 'Đi lên cột trái: băng chuyền đẩy xe xuống nên xe đứng im', baiLam: { chinh: ['forward(4)'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đếm theo số ô: trượt sáu lần, nhưng băng đã đưa xe tới sát tường sau ba lần', baiLam: { chinh: ['slide_r(6)', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Trượt sang trái: xe ra ngoài sân', baiLam: { chinh: ['slide_l(3)', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Lên thiếu một nhịp: xe dừng ngay trước cờ', baiLam: { chinh: ['slide_r(3)', 'move()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Xuôi băng, mỗi nhịp xe đi hai ô: một ô tự đi, một ô băng đẩy. Đếm số nhịp chứ không đếm số ô.',
        'Hai băng có chiều khác nhau: một bên đẩy xe xuống, một bên đẩy xe về phía cờ.']
    }, false),

    man({
      so: 8, ten: 'Sửa hàm side_r', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'slide_r'],
      deBai: 'Hàm side_r(n) của màn muốn trượt xe sang phải n ô, nhưng xe lại trượt đi hướng khác. Tìm chỗ nhầm rồi sửa để xe leo bậc thang tới cờ.',
      veMaMau: 'Chương trình có sẵn dùng side_r() cho các đoạn ngang. Chạy thử, xem xe trượt sang phía nào rồi sửa thân hàm.',
      san: ['####..F', '####.##', '##...##', '##.####', '...####'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { chinh: CHINH_8.slice(), hamCuaMan: [hSideR(T_SIDE_SAI)] },
      sao: { o: 13, nhip: 10 },
      loiGiai: { chinh: CHINH_8.slice(), hamCuaMan: [hSideR()] },
      loiGiaiKhac: {
        moTa: 'Sửa side_r() thành một lời gọi slide_r(n) của em',
        baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hSideR(['slide_r(n)'])] }
      },
      loiSai: [
        { moTa: 'Không sửa gì: side_r() trượt sang trái, xe ra ngoài sân', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hSideR(T_SIDE_SAI)] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Sửa thành slide_right() nhưng quên wait(): các lệnh trượt dồn vào một nhịp', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hSideR(LAP('n', 'slide_right()'))] }, phaiCoMa: ['slide-goi-lai', 'chua-toi-co'] },
        { moTa: 'Sửa thành right_move(): xe quay chứ không trượt', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hSideR(LAP('n', ['right_move()', 'wait()']))] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Chạy thử và nhìn xe ở lần gọi side_r() đầu tiên: xe trượt về phía nào, ngược với ý muốn?',
        'slide_left() trượt sang trái, slide_right() trượt sang phải so với hướng mặt xe.']
    }, false),

    man({
      so: 9, ten: 'Không đi chéo', hang: 'bien-the', hamCuaEmCan: ['move', 'slide_r'],
      deBai: 'Bánh omni không đi chéo: một nhịp chỉ trượt ngang HOẶC tiến, quay. Cầu thang này mỗi bậc gồm một lần trượt phải rồi một lần tiến. Đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn muốn đi chéo bằng cách gộp trượt với tiến. Chạy thử, xem xe làm gì rồi sửa.',
      san: ['####F', '###..', '##..#', '#..##', '..###'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { chinh: CHINH_9_CHEO.slice() },
      sao: { o: 7, nhip: 8 },
      loiGiai: { chinh: CHINH_9.slice() },
      loiGiaiKhac: {
        moTa: 'Mỗi lần trượt gọi slide_r(1) (đã có wait()) thay vì slide_right() và wait()',
        baiLam: { chinh: LAP(4, ['slide_r(1)', 'move()']) }
      },
      loiSai: [
        { moTa: 'Không sửa gì: slide_right() và move() dính chung một nhịp, xe chỉ trượt', baiLam: { chinh: CHINH_9_CHEO.slice() }, phaiCoMa: ['omni-khong-cheo', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Tách nhịp nhưng tiến trước rồi mới trượt: xe đâm tường ngay từ nhịp đầu', baiLam: { chinh: LAP(4, ['move()', 'slide_right()', 'wait()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ lặp ba bậc thang: xe dừng ngay dưới cờ', baiLam: { chinh: LAP(3, ['slide_right()', 'wait()', 'move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quay phải rồi tiến, quay trái rồi tiến như xe hai bánh: tới cờ nhưng nhiều nhịp hơn', baiLam: { chinh: LAP(4, ['turn_right()', 'move()', 'turn_left()', 'move()']) }, phaiCoMa: [] }
      ],
      goiY: ['Mỗi nhịp xe omni làm một việc: trượt ngang hoặc tiến. Hai việc phải ở hai nhịp khác nhau.',
        'wait() kết thúc một nhịp; đặt nó giữa lệnh trượt và lệnh tiến.']
    }, false),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Hành trình omni', hang: 'trum', canHam: 'tran-khung', hamCuaEmCan: ['move', 'forward', 'slide_r', 'slide_l', 'pick', 'drop'],
      mucTieu: 'dua-vat', nhipTheoLoiGiai: true,
      deBai: 'Xe omni quay mặt sang phải. Nhặt vật ở hốc phía trên, nhờ băng chuyền đưa xuống đáy sân, rồi mang tới ô đích ở hốc bên kia và thả.',
      veMaMau: 'Chương trình có sẵn đưa xe tiến hai ô tới ngang chỗ vật. Chạy thử rồi viết tiếp phần còn lại.',
      san: ['##o####', '...####', '##v####', '##v####', '##v##D#', '##....#'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: ['forward(2)'] },
      sao: { o: 28, nhip: 13 },
      huyHieu: { ma: 'omni', ten: 'Huy hiệu Bánh omni' },
      loiGiai: { chinh: CHINH_10.slice() },
      loiGiaiKhac: {
        moTa: 'Đoạn xuống chia hai lần gọi slide_r(1) rồi slide_r(2)',
        baiLam: { chinh: CHINH_10_KHAC.slice() }
      },
      loiSai: [
        { moTa: 'Quên pick(): xe đi hết đường tay không', baiLam: { chinh: CHINH_10.filter(function (s) { return s !== 'pick()'; }) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên drop(): vật vẫn nằm trên tay', baiLam: { chinh: CHINH_10.slice(0, -1) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Nghĩ slide_right() là sang phải màn hình: thực ra xe quay mặt sang phải nên trượt phải là đi xuống', baiLam: { chinh: ['forward(2)', 'slide_r(1)', 'pick()', 'slide_l(3)', 'forward(3)', 'slide_r(1)', 'drop()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả bằng release() khi tay còn nâng: vật rơi vỡ', baiLam: { chinh: nhieu(CHINH_10.slice(0, -1), ['release()', 'wait()']) }, phaiCoMa: ['vat-vo'] }
      ],
      goiY: ['Mặt xe quay sang phải: tiến là đi sang phải màn hình, slide_left() đi lên, slide_right() đi xuống.',
        'Băng chuyền xuôi chiều đẩy xe thêm một ô mỗi nhịp: đếm nhịp để xe dừng đúng ở đáy sân.']
    }, true)
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

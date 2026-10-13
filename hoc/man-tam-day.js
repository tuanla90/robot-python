/* ============================================================================
   man-tam-day.js — "Đường học": CHƯƠNG `tam-day` · TẤM ĐẨY (10 màn).
   Robot gắn tay TẤM ĐẨY (robot.tay 'day'; hamGoc có 'push'). Thân: hai bánh (loaiRobot 'banh') ở hầu hết các màn, xích ở 10.8.
   Mục tiêu 'day-thung': đưa MỌI thùng nặng (ký hiệu H, h) lên ô đích (D, h). Luật đầy đủ ở san-hoc.js (phần THÙNG NẶNG + TẤM ĐẨY):
   - thùng nặng chiếm ô, tay kẹp không gắp được; xe TIẾN vào thùng thì đẩy thùng 1 ô nếu ô sau thùng trống;
     ô sau bị chặn thì xe và thùng đứng im ('thung-chan'); lùi / quay / trượt thì không đẩy;
   - push() (chỉ ra lệnh, wait() cho nhịp trôi): thùng ngay trước mặt xe trượt thẳng tới khi gặp vật cản, không dừng ở đích;
   - băng chuyền đẩy thùng: nằm trên băng đủ 2 nhịp liên tiếp thì bị đẩy 1 ô;
   - thùng kẹt vào GÓC (hai cạnh vuông góc là tường / mép sân) mà không phải ô đích thì không đẩy ra được: dừng ngay ('thung-ket').

   BÀI HỌC: lập kế hoạch kiểu Sokoban. Xe chỉ đẩy thùng về phía mũi xe, nên phải vòng ra sau thùng; mỗi cách đẩy sai có thể làm thùng kẹt góc.

   Hàm của em MỚI (tên cốt truyện, bị khóa trong kho, xem KhoHam.datTenCoDinh):
     tam-day.6   shove(n) = forward(n); turn_left(); move(); turn_right(); move(); turn_right()    (6 ô)
         Đẩy thùng n ô, rồi đưa xe vòng lên phía trước-trái, qua ngoài góc rẽ, để đứng sau thùng và quay mặt theo hướng thùng
         rẽ phải (theo chiều kim đồng hồ) cho lần đẩy kế tiếp. Dùng liên tiếp để đẩy thùng vòng quanh một vật chắn.
   Tên không trùng hàm cốt truyện chương trước và không phải hàm gốc.

   Trường riêng của chương này:
   - canHam: 'tran-khung' — 10.6, 10.10: viết KHÔNG dùng shove thì tràn khung 10 ô (kiem-tam-day.mjs tự khai triển để chứng minh).
   - sân là Sokoban nhỏ (≤ 7×7); bộ dò đường tắt do-duong-day.mjs (BFS có thùng) xác nhận sao.nhip = số nhịp ngắn nhất.

   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'push'];
  var HAM_XICH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'push'];

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }

  // thân các hàm của chương
  var T_SHOVE = ['forward(n)', 'turn_left()', 'move()', 'turn_right()', 'move()', 'turn_right()'];
  function hShove(than) { return H('shove', ['n'], than || T_SHOVE); }
  var PUSH = ['push()', 'wait()'];

  /** than: 'hai-banh' (mặc định) hoặc 'xich'. */
  function man(m, than) {
    than = than || 'hai-banh';
    m.chuong = 'tam-day';
    m.cauTruc = ['for', 'if'];
    m.loaiRobot = than === 'xich' ? 'xich' : 'banh';
    m.robot = { than: than, tay: 'day' };
    m.hamGoc = than === 'xich' ? HAM_XICH : HAM_BANH;
    m.mucTieu = 'day-thung';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------- chương trình dùng lại */

  // 10.1: tiến hai ô, thùng đi hai ô
  var CHINH_1 = ['move()', 'move()'];
  // 10.2: đẩy mạnh một lệnh
  var CHINH_2 = PUSH.slice();
  // 10.3: vòng lên, sang phải ba ô, xuống sau thùng (bên phải), quay mặt sang trái, đẩy một ô
  var CHINH_3 = ['turn_left()', 'move()', 'turn_right()', 'forward(3)', 'turn_right()', 'move()', 'turn_right()', 'move()'];
  var CHINH_3_KHAC = ['turn_left()', 'move()', 'turn_right()', 'forward(1)', 'forward(2)', 'turn_right()', 'move()', 'turn_right()', 'move()'];
  // 10.4: lên hai ô, quay phải, đẩy thùng sang phải hai ô, vòng lên trên thùng, đẩy xuống một ô
  var CHINH_4 = ['forward(2)', 'turn_right()', 'forward(2)', 'turn_left()', 'move()', 'turn_right()', 'move()', 'turn_right()', 'move()'];
  var CHINH_4_KHAC = ['move()', 'move()', 'turn_right()', 'forward(2)', 'turn_left()', 'move()', 'turn_right()', 'move()', 'turn_right()', 'move()'];
  // 10.5: đẩy thùng phải xuống trước, rồi thùng trái sang trái, rồi thùng đã xuống sang phải
  var CHINH_5 = ['forward(4)', 'turn_right()', 'move()', 'turn_right()', 'move()', 'turn_left()', 'move()', 'turn_left()', 'move()'];
  var CHINH_5_KHAC = ['forward(2)', 'forward(2)', 'turn_right()', 'move()', 'turn_right()', 'move()', 'turn_left()', 'move()', 'turn_left()', 'move()'];
  // 10.6: vòng quanh khối tường: sang phải 1, xuống 2, sang trái 1
  var CHINH_6 = ['shove(1)', 'shove(2)', 'shove(1)'];
  // 10.7: đưa thùng lên làn băng rồi chờ băng đưa xuống
  var CHINH_7 = nhieu(['forward(2)', 'turn_right()', 'forward(2)'], LAP(5, 'wait()'));
  // 10.8: xích, quay bằng tr_right() / tr_left()
  var CHINH_8 = ['forward(2)', 'tr_right()', 'forward(2)', 'tr_left()', 'move()', 'tr_right()', 'move()', 'tr_right()', 'move()'];
  // 10.9: vòng lên hàng trên, ra sau thùng bên trái, push() cho thùng trượt tới khi chạm thùng nằm sẵn
  // 10.10: trượt thùng bên trái xuống mép, đẩy thùng trên cùng vào làn băng, rồi ba lần shove(2) cho thùng vòng quanh khối tường
  var CHINH_10 = nhieu(PUSH, ['turn_left()', 'forward(3)', 'turn_right()'], LAP(3, 'shove(2)'));
  var CHINH_10_KHAC = nhieu(PUSH, ['turn_left()', 'forward(3)', 'turn_right()', 'shove(2)', 'shove(2)', 'forward(2)']);
  var CHINH_9 = nhieu(['turn_right()', 'move()', 'turn_left()', 'forward(2)', 'turn_left()', 'move()', 'turn_left()'], PUSH);

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Đẩy thẳng', hang: 'lam-quen', hamCuaEmCan: ['move', 'forward'],
      deBai: 'Xe có tấm đẩy ở mũi: xe tiến vào thùng nặng thì thùng bị đẩy đi một ô cùng hướng. Đẩy thùng vào ô đích có khung vàng.',
      veMaMau: 'Chương trình có sẵn đẩy thùng đi được một ô. Chạy thử, xem thùng nằm ở đâu rồi viết tiếp.',
      san: ['......', '.H.D..', '......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: ['move()'] },
      sao: { o: 5, nhip: 2 },
      loiGiai: { chinh: CHINH_1.slice() },
      loiGiaiKhac: { moTa: 'Dùng forward(2) thay cho hai lần move()', baiLam: { chinh: ['forward(2)'] } },
      loiSai: [
        { moTa: 'Đẩy thiếu một ô: thùng dừng trước đích', baiLam: { chinh: ['move()'] }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đi vòng qua phía trên thùng thay vì đẩy nó: thùng vẫn nằm yên', baiLam: { chinh: ['turn_left()', 'move()', 'turn_right()', 'forward(3)'] }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Quay phải rồi đi: xe không đụng thùng, đi xuống ra ngoài sân', baiLam: { chinh: ['turn_right()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-day-thung'] }
      ],
      goiY: ['Thùng nặng không gắp được, chỉ đẩy được. Xe tiến vào thùng thì thùng đi thêm một ô.',
        'Thùng cách đích hai ô, nên cần đẩy hai lần.']
    }),

    man({
      so: 2, ten: 'Đẩy mạnh', hang: 'lam-quen', hamCuaEmCan: ['move', 'forward'],
      deBai: 'Lệnh push() đẩy mạnh: thùng ngay trước mặt xe trượt thẳng cho tới khi gặp tường hoặc vật chắn. Đưa thùng vào ô đích bằng ít nhịp nhất.',
      veMaMau: 'Chương trình có sẵn đẩy thùng từng ô. Chạy thử, đếm số nhịp rồi tìm cách đẩy nhanh hơn.',
      san: ['......', '.H..D#', '......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: ['forward(3)'] },
      sao: { o: 2, nhip: 1 },
      loiGiai: { chinh: CHINH_2.slice() },
      loiGiaiKhac: { moTa: 'Bọc push() và wait() trong vòng for chạy một lần', baiLam: { chinh: LAP(1, PUSH) } },
      loiSai: [
        { moTa: 'Quên wait(): lệnh push() chưa kịp chạy', baiLam: { chinh: ['push()'] }, phaiCoMa: ['quen-wait', 'chua-day-thung'] },
        { moTa: 'Đẩy từng ô bằng forward(2): thùng dừng sớm trước đích', baiLam: { chinh: ['forward(2)'] }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Hai lệnh push() trong cùng một nhịp: lệnh sau bị bỏ', baiLam: { chinh: ['push()', 'push()', 'wait()'] }, phaiCoMa: ['push-goi-lai'] },
        { moTa: 'Quay mặt đi hướng khác rồi push(): trước mặt xe không có thùng', baiLam: { chinh: ['turn_left()', 'push()', 'wait()'] }, phaiCoMa: ['day-hut', 'chua-day-thung'] }
      ],
      goiY: ['push() chỉ ra lệnh như các lệnh bánh: cần wait() để nhịp trôi.',
        'Thùng trượt cho tới khi gặp vật cản: nhìn xem phía sau ô đích có gì.']
    }),

    man({
      so: 3, ten: 'Đố: kẹt góc', hang: 'lam-quen', hamCuaEmCan: ['move', 'forward', 'turn_left', 'turn_right'],
      deBai: 'Thùng bị đẩy vào góc sân thì không đẩy ra được nữa. Đưa thùng vào ô đích mà không để nó kẹt góc.',
      veMaMau: 'Chương trình có sẵn đẩy thùng thẳng về phía trước. Chạy thử, xem thùng đi đâu rồi viết lại.',
      san: ['.....', '.....', '.DH..'],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: { chinh: ['forward(3)'] },
      sao: { o: 17, nhip: 10 },
      loiGiai: { chinh: CHINH_3.slice() },
      loiGiaiKhac: { moTa: 'Đoạn đi sang phải gọi forward(1) rồi forward(2) thay vì forward(3)', baiLam: { chinh: CHINH_3_KHAC.slice() } },
      loiSai: [
        { moTa: 'Cứ đẩy thẳng về bên phải: thùng kẹt vào góc dưới bên phải', baiLam: { chinh: ['forward(3)'] }, phaiCoMa: ['thung-ket'] },
        { moTa: 'Vòng tới sau thùng nhưng quên quay mặt sang trái: xe đi xuống ra ngoài sân', baiLam: { chinh: ['turn_left()', 'move()', 'turn_right()', 'forward(3)', 'turn_right()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-day-thung'] },
        { moTa: 'Vòng chưa đủ xa: xe tiến xuống đúng ô của thùng, đẩy thùng ra ngoài sân', baiLam: { chinh: ['turn_left()', 'move()', 'turn_right()', 'forward(2)', 'turn_right()', 'move()', 'turn_right()', 'move()'] }, phaiCoMa: ['thung-chan', 'chua-day-thung'] }
      ],
      goiY: ['Thùng nằm sát mép dưới nên chỉ trượt dọc theo mép được, còn xe đang đứng bên trái thùng.',
        'Muốn đẩy thùng sang trái, xe phải đứng ở bên phải thùng và quay mặt sang trái.']
    }),

    /* ------------------------------------------------------------- hàng 2: luyện */
    man({
      so: 4, ten: 'Hai hướng', hang: 'luyen', hamCuaEmCan: ['move', 'forward', 'turn_left', 'turn_right'],
      deBai: 'Thùng nằm lệch so với ô đích nên phải đẩy theo hai hướng. Xe chỉ đẩy được thùng về phía mũi xe, nên có lúc phải vòng ra sau thùng.',
      veMaMau: 'Chương trình có sẵn đưa xe tới sau thùng và đẩy thùng sang phải hai ô. Chạy thử rồi viết tiếp.',
      san: ['.....', '.H...', '...D.', '.....'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: { chinh: ['forward(2)', 'turn_right()', 'forward(2)'] },
      sao: { o: 18, nhip: 11 },
      loiGiai: { chinh: CHINH_4.slice() },
      loiGiaiKhac: { moTa: 'Hai lần đầu đi lên viết move() từng lần thay cho forward(2)', baiLam: { chinh: CHINH_4_KHAC.slice() } },
      loiSai: [
        { moTa: 'Đẩy thùng sang phải xong là dừng: thùng còn ở hàng trên', baiLam: { chinh: ['forward(2)', 'turn_right()', 'forward(2)'] }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đẩy thùng sang phải quá tay: thùng chạm mép phải', baiLam: { chinh: ['forward(2)', 'turn_right()', 'forward(5)'] }, phaiCoMa: ['thung-chan', 'chua-day-thung'] },
        { moTa: 'Vòng lên trên thùng nhưng quên quay xuống: xe đi sang phải rồi dừng', baiLam: { chinh: ['forward(2)', 'turn_right()', 'forward(2)', 'turn_left()', 'move()', 'turn_right()', 'move()'] }, phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Đẩy thùng sang phải trước. Sau đó xe ở bên trái thùng, nhưng muốn đẩy thùng xuống thì xe phải ở phía trên thùng.',
        'Khi vòng lên trên thùng, nhớ quay mặt xuống trước lần đẩy cuối.']
    }),

    man({
      so: 5, ten: 'Thứ tự đẩy', hang: 'luyen', hamCuaEmCan: ['move', 'forward', 'turn_left', 'turn_right'],
      deBai: 'Hai thùng nằm cạnh nhau, hai ô đích ở hai chỗ khác nhau. Xe không đẩy được hai thùng cùng lúc, nên thứ tự đẩy rất quan trọng.',
      veMaMau: 'Chương trình có sẵn đưa xe lên sát thùng bên phải. Chạy thử rồi viết tiếp.',
      san: ['......', '......', '..DHH.', '.....D'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: ['forward(4)'] },
      sao: { o: 18, nhip: 12 },
      loiGiai: { chinh: CHINH_5.slice() },
      loiGiaiKhac: { moTa: 'Đoạn đi sang phải chia thành hai lần forward(2)', baiLam: { chinh: CHINH_5_KHAC.slice() } },
      loiSai: [
        { moTa: 'Vào hàng giữa từ phía trái rồi đẩy thẳng: thùng trái bị thùng phải chặn', baiLam: { chinh: ['turn_right()', 'move()', 'turn_left()', 'forward(4)'] }, phaiCoMa: ['thung-chan', 'chua-day-thung'] },
        { moTa: 'Chỉ đẩy thùng phải xuống rồi dừng', baiLam: { chinh: ['forward(4)', 'turn_right()', 'move()'] }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đẩy thùng phải xuống hai ô: thùng chạm đáy sân', baiLam: { chinh: ['forward(4)', 'turn_right()', 'forward(3)'] }, phaiCoMa: ['thung-chan', 'chua-day-thung'] }
      ],
      goiY: ['Thùng bên trái bị thùng bên phải chắn đường sang phải. Thử đẩy thùng nào trước thì xe còn đứng được sau thùng kia?',
        'Một thùng phải đi xuống một hàng rồi mới sang phải.']
    }),

    man({
      so: 6, ten: 'Hàm shove(n)', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['move', 'forward', 'turn_left', 'turn_right'], taoHam: ['shove'],
      deBai: 'Tạo hàm shove(n): đẩy thùng n ô, rồi đưa xe vòng ra sau thùng cho lần đẩy kế tiếp khi thùng rẽ phải. Dùng nó đưa thùng vòng qua khối tường tới ô đích.',
      veMaMau: 'Chương trình có sẵn gọi shove() ở ba chỗ, nhưng em chưa có hàm đó. Tạo hàm shove có một tham số n.',
      san: ['.....', '.H...', '.#...', '.D...'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: CHINH_6.slice() },
      sao: { o: 18, nhip: 14 },
      loiGiai: { chinh: CHINH_6.slice(), hamCuaEmMoi: [hShove()] },
      loiGiaiKhac: {
        moTa: 'Lần đẩy cuối viết thẳng lệnh bánh thay cho shove(1)',
        baiLam: { chinh: ['shove(1)', 'shove(2)', 'left_move()', 'right_move()', 'wait()'] },
        hamCuaEmMoi: [hShove()]
      },
      loiSai: [
        { moTa: 'Gọi shove() mà chưa tạo hàm', baiLam: { chinh: CHINH_6.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'shove(n) chỉ đẩy, không vòng ra sau thùng: lần đẩy thứ hai vẫn đẩy sang phải tới mép', baiLam: { chinh: CHINH_6.slice() }, hamCuaEmMoi: [H('shove', ['n'], ['forward(n)'])], phaiCoMa: ['thung-chan', 'chua-day-thung'] },
        { moTa: 'shove(n) vòng xuống phía dưới thay vì phía trên: xe đâm vào khối tường', baiLam: { chinh: CHINH_6.slice() }, hamCuaEmMoi: [hShove(['forward(n)', 'turn_right()', 'move()', 'turn_left()', 'move()', 'turn_left()'])], phaiCoMa: ['dam-tuong', 'chua-day-thung'] },
        { moTa: 'Gọi shove() không có số', baiLam: { chinh: ['shove()', 'shove(2)', 'shove(1)'] }, hamCuaEmMoi: [hShove()], phaiCoMa: ['loi-chay'] },
        { moTa: 'Đếm sai đoạn xuống: shove(1) ba lần, thùng đâm vào khối tường', baiLam: { chinh: lap('shove(1)', 3) }, hamCuaEmMoi: [hShove()], phaiCoMa: ['thung-chan', 'chua-day-thung'] },
        { moTa: 'Không dùng hàm shove: viết thẳng, quá 10 ô', baiLam: { chinh: nhieu(['forward(1)', 'turn_left()', 'move()', 'turn_right()', 'move()', 'turn_right()'], ['forward(2)', 'turn_left()', 'move()', 'turn_right()', 'move()', 'turn_right()'], ['forward(1)']) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Sau khi đẩy xong, xe đang đứng sau thùng. Cuối mỗi lần gọi shove, xe phải đứng sau thùng theo hướng thùng đi tiếp, và quay mặt đúng hướng đó.',
        'Vòng qua phía ngoài góc rẽ: quay trái, đi một ô, quay phải, đi một ô, rồi quay phải.']
    }),

    /* ------------------------------------------------------------- hàng 3: biến thể */
    man({
      so: 7, ten: 'Thùng đi băng', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'turn_left', 'turn_right'],
      deBai: 'Băng chuyền đẩy cả thùng nặng: nằm trên băng đủ hai nhịp liên tiếp thì thùng bị đẩy một ô. Đưa thùng lên làn băng và để băng đưa nó tới ô đích.',
      veMaMau: 'Chương trình có sẵn đưa xe tới sát thùng. Chạy thử, xem rồi viết tiếp.',
      san: ['......', '..Hv..', '..#v#.', '..#v#.', '...D..'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: { chinh: ['forward(2)', 'turn_right()', 'forward(1)'] },
      sao: { o: 12, nhip: 10 },
      loiGiai: { chinh: CHINH_7.slice() },
      loiGiaiKhac: { moTa: 'Chờ bằng năm lần wait() viết thẳng thay cho vòng for', baiLam: { chinh: nhieu(['forward(2)', 'turn_right()', 'forward(2)'], lap('wait()', 5)) } },
      loiSai: [
        { moTa: 'Chờ thiếu một nhịp: thùng dừng giữa làn băng', baiLam: { chinh: nhieu(['forward(2)', 'turn_right()', 'forward(2)'], LAP(4, 'wait()')) }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đẩy xong là dừng chương trình, không chờ băng', baiLam: { chinh: ['forward(2)', 'turn_right()', 'forward(2)'] }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Xe cứ tiến tiếp thay vì chờ: đẩy thùng khỏi làn băng', baiLam: { chinh: ['forward(2)', 'turn_right()', 'forward(7)'] }, phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Mỗi ô băng giữ thùng hai nhịp mới đẩy đi. Làn băng dài mấy ô thì thùng cần chờ bấy nhiêu lần hai nhịp.',
        'Xe không cần đi theo thùng: sau khi đẩy lên băng, xe chỉ cần chờ.']
    }),

    man({
      so: 8, ten: 'Xích đẩy thùng', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'tr_right', 'tr_left'],
      deBai: 'Thân xích bám chắc nên không bị băng chuyền kéo đi, nhưng mỗi lần quay phải mất hai nhịp. Đưa thùng vào ô đích.',
      veMaMau: 'Chương trình có sẵn dùng turn_right() quen thuộc. Chạy thử, xem xe xích có quay đủ một góc vuông không.',
      san: ['...<..', '.H....', '...D..', '......'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: { chinh: ['forward(2)', 'turn_right()', 'forward(2)'] },
      sao: { o: 20, nhip: 15 },
      loiGiai: { chinh: CHINH_8.slice() },
      loiGiaiKhac: { moTa: 'Đoạn đi lên đầu tiên gọi forward(1) hai lần', baiLam: { chinh: ['forward(1)', 'forward(1)', 'tr_right()', 'forward(2)', 'tr_left()', 'move()', 'tr_right()', 'move()', 'tr_right()', 'move()'] } },
      loiSai: [
        { moTa: 'Dùng turn_right() cũ: xe xích chỉ quay nửa vòng nên đi nhầm hướng', baiLam: { chinh: ['forward(2)', 'turn_right()', 'forward(2)'] }, phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-day-thung'] },
        { moTa: 'Quay phải nhầm thành quay trái ở chỗ vòng lên trên thùng', baiLam: { chinh: ['forward(2)', 'tr_right()', 'forward(2)', 'tr_left()', 'move()', 'tr_left()', 'move()'] }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Chỉ đẩy thùng sang phải rồi dừng', baiLam: { chinh: ['forward(2)', 'tr_right()', 'forward(2)'] }, phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Xe xích cần hai nhịp liên tiếp cùng một lệnh để quay đủ 90°: dùng tr_right() và tr_left() em đã tạo.',
        'Ô băng chuyền trên đường vòng không làm xe xích lệch hướng.']
    }, 'xich'),

    man({
      so: 9, ten: 'Thùng chặn thùng', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'turn_left', 'turn_right'],
      deBai: 'Một thùng đã nằm sẵn trên đích. Đưa thùng còn lại vào ô đích bên cạnh nó. Nhớ rằng push() đẩy thùng trượt thẳng, không tự dừng ở ô đích.',
      veMaMau: 'Chương trình có sẵn đưa xe lên hàng trên. Chạy thử rồi viết tiếp.',
      san: ['.....', '.H.Dh', '.....'],
      batDau: { x: 2, y: 1, huong: 3 },
      maMau: { chinh: ['turn_right()', 'move()', 'turn_left()'] },
      sao: { o: 18, nhip: 9 },
      loiGiai: { chinh: CHINH_9.slice() },
      loiGiaiKhac: { moTa: 'Quay phải đầu tiên bằng right(1) thay cho turn_right()', baiLam: { chinh: nhieu(['right(1)', 'move()', 'turn_left()', 'forward(2)', 'turn_left()', 'move()', 'turn_left()'], PUSH) } },
      loiSai: [
        { moTa: 'push() ngay từ chỗ đứng: xe đang quay mặt về phía thùng cần đẩy, nên thùng bị đẩy ra mép trái thay vì vào đích', baiLam: { chinh: PUSH.slice() }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đẩy từng ô bằng forward(2) thay cho push(): thắng nhưng thêm một nhịp', baiLam: { chinh: nhieu(['turn_right()', 'move()', 'turn_left()', 'forward(2)', 'turn_left()', 'move()', 'turn_left()'], ['forward(2)']) }, phaiCoMa: [] },
        { moTa: 'Quên wait() sau push(): lệnh chưa chạy', baiLam: { chinh: ['turn_right()', 'move()', 'turn_left()', 'forward(2)', 'turn_left()', 'move()', 'turn_left()', 'push()'] }, phaiCoMa: ['quen-wait', 'chua-day-thung'] }
      ],
      goiY: ['Thùng nằm trên đích bên cạnh sẽ chặn thùng đang trượt. Xem thùng cần đứng ở ô nào thì push() dừng đúng chỗ.',
        'Thùng cần đẩy ở bên trái xe, nên xe phải vòng ra phía bên trái thùng.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Kho hàng', hang: 'trum', canHam: 'tran-khung', hamCuaEmCan: ['move', 'forward', 'turn_left', 'turn_right', 'shove'],
      deBai: 'Đưa cả ba thùng nặng vào ô đích. Một thùng cần trượt xuống mép sân, một thùng cần lên làn băng chuyền, và một thùng phải vòng qua khối tường. Thùng ở trên đang chắn chỗ xe cần đứng.',
      veMaMau: 'Chương trình có sẵn đã đẩy thùng sát xe xuống mép sân. Chạy thử rồi viết tiếp.',
      san: ['...H>>v', 'HD#H..v', '..#...v', '......D', '.......', 'D......'],
      batDau: { x: 0, y: 0, huong: 2 },
      maMau: { chinh: PUSH.slice() },
      sao: { o: 22, nhip: 22 },
      huyHieu: { ma: 'tam-day', ten: 'Huy hiệu Tấm đẩy' },
      loiGiai: { chinh: CHINH_10.slice() },
      loiGiaiKhac: { moTa: 'Hai lần shove(2) trong vòng for rồi forward(2) cho đoạn cuối, không dùng for cho cả ba lần', baiLam: { chinh: CHINH_10_KHAC.slice() } },
      loiSai: [
        { moTa: 'Quên đẩy thùng sát xe: đoạn vòng cuối của shove còn đẩy nó vào góc sân', baiLam: { chinh: nhieu(['turn_left()', 'forward(3)', 'turn_right()'], LAP(3, 'shove(2)')) }, phaiCoMa: ['thung-ket'] },
        { moTa: 'Không dùng hàm shove: viết thẳng từng đoạn vòng, quá 10 ô', baiLam: { chinh: nhieu(PUSH, ['turn_left()', 'forward(3)', 'turn_right()'], ['forward(2)', 'turn_left()', 'move()', 'turn_right()', 'move()', 'turn_right()', 'forward(2)', 'turn_left()', 'move()', 'turn_right()', 'move()', 'turn_right()', 'forward(2)']) }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Gọi shove(1) cho đoạn đầu: thùng đi xuống chỉ một ô rồi bị chặn lối', baiLam: { chinh: nhieu(PUSH, ['turn_left()', 'forward(3)', 'turn_right()', 'shove(1)', 'shove(2)', 'forward(2)']) }, hamCuaEmMoi: [], phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đẩy thùng trên cùng quá tay: thùng chạy hết làn băng ngang rồi bị chặn, xe đứng lại', baiLam: { chinh: nhieu(PUSH, ['turn_left()', 'forward(4)', 'turn_right()'], LAP(3, 'shove(2)')) }, phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Thùng nằm ngay trên thùng cần vòng đang chắn chỗ xe cần đứng: dời nó trước, băng chuyền sẽ tự mang nó đi.',
        'Thùng cần vòng đi hai ô mỗi đoạn, ba đoạn liền nhau: gọi shove(2) trong vòng for.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

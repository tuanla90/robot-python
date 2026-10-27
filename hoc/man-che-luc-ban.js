/* ============================================================================
   man-che-luc-ban.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 2, gói 6 "Lực bắn" (KE-HOACH-MUA-2.md).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `che-luc-ban` (mã che-luc-ban.1 … che-luc-ban.10): chương 2 "Hàm lực bắn" (chương 1 là luc-ban có sẵn, man-luc-ban.js)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): robot chỉ dùng part mùa 1 + xích + súng hơi (+ hồng ngoại khi lõi có); không bậc thang S, hố u, gầm n;
   biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so); hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manCheLucBan, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   NỘI DUNG (27/10): XE HAI BÁNH gắn SÚNG HƠI + MẮT HỒNG NGOẠI (robot { than: 'hai-banh', tay: 'hoi', camBien: [hong-ngoai] }), mọi màn lucBan: true.
   Đi tiếp chương luc-ban (fire(p), fire_back(p), smart_fire() đọc front_clear()): bắn nhanh "fast" bay TỐI ĐA 2 Ô, không giật; bắn tụ "charge" bay tới vật cản, xe giật một ô
   (luật ở san-hoc.js, mục LỰC BẮN). Mắt hồng ngoại đếm được số ô trống tới nút: distance() là 0 hay 1 thì bắn nhanh tới, từ 2 trở lên phải bắn tụ.
   Nên điều kiện đúng là distance() > 1 (không phải > 2: nút cách 3 ô có distance() = 2, bắn nhanh rơi giữa đường; cũng không phải > 0 như smart_fire:
   nút cách 2 ô thì smart_fire bắn tụ, xe giật lùi).
   Màn chọn lực bằng cảm biến đều KHÓA chương trình chính và gọi hàm ở nhiều chỗ xa gần khác nhau (hay trùm nhiều sân): thân hàm cố định không thắng được.
   MỘT SÂN mỗi màn (luật lộ trình: nhiều sân chỉ ở trùm). kiem-che-luc-ban.mjs + do-duong-che-luc-ban.mjs kiểm.
   Không beSung (gói 9), không warm() (gói 7).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'shoot', 'shoot_back', 'distance'];

  /** Thụt mọi dòng vào một bậc (4 dấu cách). */
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(than)); }
  function IF(dk, co, khong) { return ['if ' + dk + ':'].concat(thut(co), khong ? ['else:'].concat(thut(khong)) : []); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, hamCuaMan) { return { chinh: chinh.slice(), hamCuaMan: (hamCuaMan || []).slice() }; }

  // thân các hàm (cách chuẩn)
  var T_AIM = IF('distance() > 1', ['fire("charge")'], ['fire("fast")']);
  var AIM = function () { return H('aim_fire', [], T_AIM); };
  var T_AIM_LEFT = ['turn_left()', 'aim_fire()', 'turn_right()'];

  /** Điền trường chung: xe hai bánh, súng hơi, mắt hồng ngoại; mọi màn chọn được lực bắn. */
  function man(m) {
    m.chuong = 'che-luc-ban';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] };
    m.hamGoc = HAM_GOC;
    m.lucBan = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (!m.mucTieu) m.mucTieu = 'toi-co';
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: xe (3,4) quay lên, nút xa (3,1) có distance() = 2: bắn tụ, xe giật xuống (3,5). Quay phải: nút gần (5,5) có distance() = 1, thùng (2,5) sau lưng.
  //    Cửa (3,6) theo nút gần, cửa (3,7) theo nút xa, xe mờ (3,8) quay xuống, thùng phải nằm yên.
  var SAN_1 = ['#######', '###N###', '###.###', '###.###', '###.###', '#.H..N#', '###C###', '###C###', '###.###', '#######'];
  var NOI_1 = [{ nut: { x: 5, y: 5 }, cua: [{ x: 3, y: 6 }] }, { nut: { x: 3, y: 1 }, cua: [{ x: 3, y: 7 }] }];
  // 2: xe (1,4) quay phải. Trạm 1: nút trên (1,1), distance() = 2: bắn tụ, xe giật xuống làn dưới (1,5). Trạm 2 (2,5) là cửa của nút 1:
  //    nút trên (2,3), distance() = 1: bắn nhanh (bắn tụ thì xe giật xuống hốc (2,6)). Nút 2 mở cửa (3,5), cờ (4,5).
  var SAN_2 = ['#######', '#N#####', '#.#####', '#.N####', '#..####', '#.CCF##', '##.####', '#######'];
  var NOI_2 = [{ nut: { x: 1, y: 1 }, cua: [{ x: 2, y: 5 }] }, { nut: { x: 2, y: 3 }, cua: [{ x: 3, y: 5 }] }];

  /* ------------------------------------------------------------- chương trình */

  var C_1 = ['aim_fire()', 'turn_right()', 'aim_fire()', 'turn_right()', 'forward(3)'];
  var C_2 = ['aim_left()', 'move()', 'aim_left()', 'forward(2)'];

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Hàm aim_fire()', yMoi: 'chọn lực bằng mắt hồng ngoại: distance() > 1 thì bắn tụ, còn không thì bắn nhanh',
      mucTieu: 'bong-mo', hamCuaEmCan: ['fire', 'turn_right', 'forward', 'move'], taoHam: ['aim_fire'], chinhCoDinh: true,
      deBai: 'Bắn nhanh bay tối đa 2 ô, nên nút có distance() là 0 hay 1 thì bắn nhanh tới, từ 2 trở lên phải bắn tụ. ' +
        'Em chế aim_fire(): đo bằng mắt hồng ngoại rồi tự chọn lực. Chương trình chính đã khóa, gọi aim_fire() hai lần: một nút xa, một nút gần có thùng sau lưng. Thùng phải nằm yên.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo aim_fire() với if distance() > 1: … else: … dùng fire(p) của em.',
      san: SAN_1, batDau: { x: 3, y: 4, huong: 0 }, noi: NOI_1,
      bongMo: { x: 3, y: 8, huong: 2, thung: [{ x: 2, y: 5 }] },
      maMau: bai(C_1),
      sao: { o: 18, nhip: 7 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [AIM()] },
      loiGiaiKhac: { moTa: 'Viết điều kiện distance() >= 2 kèm một dòng chú thích: đúng, thêm một ô', baiLam: bai(C_1), hamCuaEmMoi: [H('aim_fire', [], ['# 2 ô trở lên thì bắn tụ'].concat(IF('distance() >= 2', ['fire("charge")'], ['fire("fast")'])))] },
      loiSai: [
        { moTa: 'So với 0 như smart_fire: nút cách 2 ô cũng bị bắn tụ, xe giật lùi xô thùng', baiLam: bai(C_1), hamCuaEmMoi: [H('aim_fire', [], IF('distance() > 0', ['fire("charge")'], ['fire("fast")']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'So với 2: nút xa có distance() đúng bằng 2 nên bị bắn nhanh, bóng rơi giữa đường', baiLam: bai(C_1), hamCuaEmMoi: [H('aim_fire', [], IF('distance() > 2', ['fire("charge")'], ['fire("fast")']))], phaiCoMa: ['ban-ngan'] },
        { moTa: 'Đảo hai nhánh: nút xa bị bắn nhanh, nút gần bị bắn tụ', baiLam: bai(C_1), hamCuaEmMoi: [H('aim_fire', [], IF('distance() > 1', ['fire("fast")'], ['fire("charge")']))], phaiCoMa: ['ban-ngan'] }
      ],
      goiY: ['Bóng bắn nhanh đi qua ô thứ nhất, ô thứ hai rồi rơi. Nút ở ô thứ hai thì distance() là 1.',
        'if distance() > 1: fire("charge") còn else: fire("fast").']
    }),

    man({
      so: 2, ten: 'Hàm aim_left()', yMoi: 'hàm gọi hàm có cảm biến: quay trái, aim_fire(), quay lại',
      hamCuaEmCan: ['aim_fire', 'fire', 'turn_left', 'turn_right', 'forward', 'move'], taoHam: ['aim_left'], chinhCoDinh: true,
      deBai: 'Hành lang có hai nút ở bên trái, xa gần khác nhau; mỗi nút mở một cánh cửa phía trước. Em chế aim_left(): quay trái, gọi aim_fire() của em, rồi quay lại. ' +
        'Chương trình chính đã khóa, gọi aim_left() ở hai chỗ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo aim_left() trong Xưởng hàm: ba dòng.',
      san: SAN_2, batDau: { x: 1, y: 4, huong: 1 }, noi: NOI_2,
      maMau: bai(C_2),
      sao: { o: 22, nhip: 9 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('aim_left', [], T_AIM_LEFT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_2), hamCuaEmMoi: [H('aim_left', [], ['# quay về phía nút rồi tự chọn lực'].concat(T_AIM_LEFT))] },
      congThucKhac: [{ moTa: 'Viết thẳng if / else trong aim_left() thay cho gọi aim_fire()', baiLam: bai(C_2), hamCuaEmMoi: [H('aim_left', [], nhieu(['turn_left()'], T_AIM, ['turn_right()']))] }],
      loiSai: [
        { moTa: 'Viết cứng fire("charge"): ở nút gần xe giật lùi xuống hốc', baiLam: bai(C_2), hamCuaEmMoi: [H('aim_left', [], ['turn_left()', 'fire("charge")', 'turn_right()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết cứng fire("fast"): nút đầu cách 3 ô, bóng rơi giữa đường', baiLam: bai(C_2), hamCuaEmMoi: [H('aim_left', [], ['turn_left()', 'fire("fast")', 'turn_right()'])], phaiCoMa: ['ban-ngan'] },
        { moTa: 'Quên quay lại: xe vẫn quay mặt lên, đi vào tường', baiLam: bai(C_2), hamCuaEmMoi: [H('aim_left', [], ['turn_left()', 'aim_fire()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Hàm của em gọi được hàm của em khác: aim_fire() đã làm ở màn trước.',
        'Quay trái thì mắt hồng ngoại nhìn về phía nút; bắn xong quay phải để đi tiếp.']
    })
  ];

  ManHoc.manCheLucBan = DS;
  if (laNode) module.exports = ManHoc;
})();

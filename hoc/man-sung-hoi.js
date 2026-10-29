/* ============================================================================
   man-sung-hoi.js — "Robot Chấn Hưng": CHƯƠNG `sung-hoi` · SÚNG HƠI (10 màn). Thay hai chương cũ `tam-day` (tấm đẩy) và `sung-bong` (súng bóng): giữ ba ý hay của chúng
   (thùng nặng trượt vào đích, nút mở cửa, băng chuyền bật tắt) và thêm cái mới của GIẬT. Kế hoạch KE-HOACH-CHE-LENH.md mục 5c.3 (user chốt 15/10).
   Robot là XE HAI BÁNH gắn SÚNG HƠI có hai nòng: robot { than: 'hai-banh', tay: 'hoi', camBien: [] }.
   Hai lệnh gốc (luật đầy đủ ở san-hoc.js, phần THÙNG NẶNG + SÚNG HƠI), chỉ RA LỆNH, wait() cho nhịp trôi, một nhịp một phát, cặp lệnh ngược:
       spray()       bắn bóng ra TRƯỚC mũi xe; xe GIẬT LÙI một ô
       spray_back()  bắn bóng ra SAU đuôi xe;  xe GIẬT TỚI một ô
   Ô xe giật vào bị chặn (tường, mép sân, cửa đóng, nút, hàng rào, vật…) thì xe đứng yên; ô đó có THÙNG NẶNG thì thùng NHÍCH ĐÚNG 1 Ô theo hướng giật và xe dời 1 ô theo vào ô thùng vừa rời
   (luật 29/10 "giật một ô", như xích đẩy thùng); ô sau thùng bị chặn thì cả hai đứng yên. Xe húc thùng bằng bánh = đâm như tường. Bóng bay thẳng tới vật cản đầu tiên, qua hàng rào / băng chuyền / cửa mở; trúng nút N thì nút đổi (băng đổi ngay, cửa đổi cuối nhịp).
   Thứ tự trong nhịp: bắn → giật → băng chuyền → cửa đổi. Nhịp có lệnh bắn thì bánh nghỉ (khay chặn luôn lệnh bánh cùng nhịp).

   Ba hàng: 1–3 làm quen (giật lùi, giật tới, bóng ra sau mở cửa) · 4–6 luyện (thùng nặng sau xe, hai thùng hai phía, quay để đẩy) · 7–9 biến thể (thùng đi băng, tắt băng cho xe, thùng chắn đường bắn) · 10 trùm.
   Khay: màn 1 chỉ có wait và spray; màn 2 thêm spray_back; từ màn 3 có đủ lệnh bánh (kể cả bánh lùi). Hàm của em có sẵn từ các chương trước (move, turn_left, back, forward…).
   Mục tiêu: 1–3 và 8–9 tới cờ F; 4–7 và 10 'day-thung' (mọi thùng nặng nằm trên ô đích). Sân ≤ 7×9; cauTruc ['for', 'if', 'while']; chương này không tạo hàm cốt truyện mới.

   Sao: sao.nhip = số nhịp của lời giải chuẩn = đường ngắn nhất (BFS do-duong-sung-hoi.mjs, mỗi phát bắn một nhịp riêng, không gộp với lệnh bánh); sao.o = ô của lời giải chuẩn.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên. Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var KHAY_1 = ['wait', 'spray'];                                 // màn 1: chỉ có nòng trước
  var KHAY_2 = ['wait', 'spray', 'spray_back'];                   // màn 2: thêm nòng sau
  var KHAY = BANH.concat(['spray', 'spray_back']);                // từ màn 3

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function lap(ds, n) { var kq = []; for (var i = 0; i < n; i++) kq = kq.concat(ds); return kq; }

  var BAN = ['spray()', 'wait()'];                                // bắn ra trước (giật lùi)
  var BAN_SAU = ['spray_back()', 'wait()'];                       // bắn ra sau (giật tới)

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    m.chuong = 'sung-hoi';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'hoi', camBien: [] };
    m.hamGoc = m.hamGoc || KHAY;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (m.mucTieu === 'toi-co') delete m.mucTieu;                  // mặc định của lõi
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: hành lang ngang, xe quay mặt phải ở (5,1), cờ ở (2,1) PHÍA SAU xe; tường bên phải chặn bóng
  var SAN_1 = ['#######', '..F...#', '#######'];
  var BD_1 = { x: 5, y: 1, huong: 1 };
  // 2: hành lang đứng, xe quay mặt lên ở (1,5), cờ ở (1,2) PHÍA TRƯỚC xe; tường dưới chân chặn bóng
  var SAN_2 = ['###', '#.#', '#F#', '#.#', '#.#', '#.#', '###'];
  var BD_2 = { x: 1, y: 5, huong: 0 };
  // 3: nút ở tường trái (0,1) PHÍA SAU xe quay mặt phải; cửa ở (4,1), cờ ở (6,1)
  var SAN_3 = ['#######', 'N...C.F', '#######'];
  var BD_3 = { x: 2, y: 1, huong: 1 };
  // 4: xe (4,1) quay mặt phải, thùng ngay sau xe ở (3,1), ô đích sát tường ở (1,1): hai phát, mỗi phát thùng nhích một ô (xe theo một ô)
  var SAN_4 = ['#######', '#D.H..#', '#######'];
  var BD_4 = { x: 4, y: 1, huong: 1 };
  // 5: hành lang đứng, xe (1,3) quay mặt lên giữa hai thùng (1,2) và (1,4); đích sát tường ở (1,1) và (1,5). Đẩy thùng này xong xe đã dời một ô, nên phải giật về phía kia hai lần
  var SAN_5 = ['###', '#D#', '#H#', '#.#', '#H#', '#D#', '###'];
  var BD_5 = { x: 1, y: 3, huong: 0 };
  // 6: xe (2,3) quay mặt lên; thùng trước mặt ở (2,2) (đích (2,1)); thùng kia ở (3,2) (đích (4,2) sát mép phải): đẩy thùng trước xong, xe ở (2,2) và thùng kia nằm ngay bên phải
  var SAN_6 = ['.....', '..D..', '..HHD', '.....', '.....'];
  var BD_6 = { x: 2, y: 3, huong: 0 };
  // 7: xe (1,1) quay mặt phải sát tường trái, thùng ở (2,1); cú giật đẩy thùng một ô sang (3,1) lên làn băng chạy xuống, băng đưa tới ô đích (3,4)
  var SAN_7 = ['#####', '#.Hv#', '###v#', '###v#', '###D#'];
  var BD_7 = { x: 1, y: 1, huong: 1 };
  // 8: hành lang đứng, xe (1,7) quay mặt lên; năm ô băng chạy xuống (y 2..6) đẩy xe lùi; cờ (1,1), nút ngay sau cờ ở (1,0)
  var SAN_8 = ['#N#', '#F#', '#v#', '#v#', '#v#', '#v#', '#v#', '#.#', '#.#'];
  var BD_8 = { x: 1, y: 7, huong: 0 };
  // 9: nút ở tường trái (0,1) bị thùng (1,1) chắn đường bắn; xe (1,2) quay mặt lên; cửa (3,1), cờ (4,1); ô (1,0) để thùng nhích lên, xe theo vào (1,1) vừa ngang van
  var SAN_9 = ['#.###', 'NH.CF', '#.###', '#####'];
  var BD_9 = { x: 1, y: 2, huong: 0 };
  // 10: xe (1,3) quay mặt lên; thùng (1,2) ngay trước mặt chắn đường bắn tới nút (0,2), đích (1,1); đẩy xong xe ở (1,2) ngang nút; bắn nút xong xe giật sang (2,2) đứng ngay trên
  //     thùng thứ hai (2,3), dưới nó là cửa (2,4) rồi đích (2,5): quay mặt lên, bắn hai phát, mỗi phát thùng nhích một ô qua cửa đang mở (tia bay lên tường (2,1), không chạm nút lần nữa)
  var SAN_10 = ['#######', '#D#####', 'NH.####', '#.H.###', '##C####', '##D####', '#######'];   // (3,3) trống để thùng (2,3) không nằm trong góc chết (cửa đóng dưới nó tính như tường)
  var BD_10 = { x: 1, y: 3, huong: 0 };

  /* ------------------------------------------------------------- chương trình dùng lại */

  var CHINH_1 = LAP(3, BAN);
  var CHINH_2 = LAP(3, BAN_SAU);
  var CHINH_3 = nhieu(BAN_SAU, ['forward(3)']);
  var CHINH_4 = LAP(2, BAN);
  var CHINH_5 = nhieu(BAN, BAN_SAU, BAN_SAU);
  var CHINH_6 = nhieu(BAN_SAU, ['turn_left()'], BAN);
  var CHINH_7 = nhieu(BAN_SAU, LAP(5, 'wait()'));
  var CHINH_8 = nhieu(BAN, ['forward(7)']);
  var CHINH_9 = nhieu(BAN_SAU, ['turn_left()'], BAN, ['back()', 'back()']);
  var CHINH_10 = nhieu(BAN_SAU, ['turn_left()'], BAN, ['turn_right()'], LAP(2, BAN));

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Bắn là lùi', hang: 'lam-quen', hamGoc: KHAY_1,
      deBai: 'Xe có vòi phun ở mũi. spray() bắn một tia nước ra phía trước, và cú giật làm xe lùi một ô. Lá cờ nằm phía sau xe: bắn để lùi tới cờ.',
      veMaMau: 'Chương trình có sẵn bắn một phát. Chạy thử, xem xe lùi mấy ô rồi viết tiếp.',
      san: SAN_1, batDau: BD_1,
      maMau: { chinh: BAN.slice() },
      sao: { o: 3, nhip: 3 },
      loiGiai: { chinh: CHINH_1.slice() },
      loiGiaiKhac: { moTa: 'Viết thẳng ba cặp spray(), wait() không dùng vòng for', baiLam: { chinh: lap(BAN, 3) } },
      loiSai: [
        { moTa: 'Quên wait(): chỉ phát bắn đầu được tính, hai phát sau bị bỏ', baiLam: { chinh: ['spray()', 'spray()', 'spray()'] }, phaiCoMa: ['ban-goi-lai', 'quen-wait', 'chua-toi-co'] },
        { moTa: 'Bắn thiếu một phát: xe dừng cách cờ một ô', baiLam: { chinh: LAP(2, BAN) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng bánh để lùi: lệnh left_back() chưa có trên khay ở màn này', baiLam: { chinh: ['left_back()', 'right_back()', 'wait()'] }, phaiCoMa: ['lenh-chua-mo'] }
      ],
      goiY: ['Bắn ra trước thì xe bị giật lùi một ô. Sau spray() phải có wait() thì nhịp mới trôi.',
        'Cờ cách xe ba ô, nên cần ba phát bắn.']
    }),

    man({
      so: 2, ten: 'Bắn ra sau', hang: 'lam-quen', hamGoc: KHAY_2,
      deBai: 'spray_back() bắn tia nước ra phía sau, và cú giật đẩy xe tiến một ô. Cờ nằm phía trước xe: bắn ra sau để tiến tới cờ.',
      veMaMau: 'Chương trình có sẵn bắn một phát. Chạy thử, xem xe đi mấy ô rồi viết tiếp.',
      san: SAN_2, batDau: BD_2,
      maMau: { chinh: BAN_SAU.slice() },
      sao: { o: 3, nhip: 3 },
      loiGiai: { chinh: CHINH_2.slice() },
      loiGiaiKhac: { moTa: 'Viết thẳng ba cặp spray_back(), wait() không dùng vòng for', baiLam: { chinh: lap(BAN_SAU, 3) } },
      loiSai: [
        { moTa: 'Dùng spray() thay cho spray_back(): xe giật lùi mà sau lưng là tường nên xe không nhúc nhích', baiLam: { chinh: LAP(3, BAN) }, phaiCoMa: ['giat-chan', 'chua-toi-co'] },
        { moTa: 'Quên wait(): chỉ phát bắn đầu được tính', baiLam: { chinh: ['spray_back()', 'spray_back()', 'spray_back()'] }, phaiCoMa: ['ban-goi-lai', 'quen-wait', 'chua-toi-co'] },
        { moTa: 'Bắn thiếu một phát: xe dừng cách cờ một ô', baiLam: { chinh: LAP(2, BAN_SAU) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['spray() bắn ra trước và xe lùi, spray_back() bắn ra sau và xe tiến: hai lệnh ngược nhau.',
        'Cờ cách xe ba ô.']
    }),

    man({
      so: 3, ten: 'Van ở sau lưng', hang: 'lam-quen', hamCuaEmCan: ['forward', 'move'],
      deBai: 'Cửa đóng chắn đường tới cờ, còn van mở cửa gắn trên tường phía sau xe. spray_back() bắn tia nước ra sau, trúng van thì cửa mở. Mở cửa rồi đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn đã bắn trúng van. Chạy thử, xem cửa, rồi viết tiếp phần đưa xe tới cờ.',
      san: SAN_3, batDau: BD_3,
      maMau: { chinh: BAN_SAU.slice() },
      sao: { o: 8, nhip: 4 },
      loiGiai: { chinh: CHINH_3.slice() },
      loiGiaiKhac: { moTa: 'Chia đoạn đi thành forward(2) rồi move()', baiLam: { chinh: nhieu(BAN_SAU, ['forward(2)', 'move()']) } },
      loiSai: [
        { moTa: 'Không bắn van: cửa vẫn đóng nên xe đâm vào cửa', baiLam: { chinh: ['forward(3)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Bắn ra trước bằng spray(): tia nước bay về phía cửa chứ không tới van, cửa vẫn đóng', baiLam: { chinh: nhieu(BAN, ['forward(3)']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên wait() sau spray_back(): lệnh bánh nằm chung nhịp với lệnh bắn nên bị bỏ', baiLam: { chinh: ['spray_back()', 'forward(3)'] }, phaiCoMa: ['ban-dung-yen', 'chua-toi-co'] },
        { moTa: 'Đi thiếu một ô: xe dừng ngay trước cờ', baiLam: { chinh: nhieu(BAN_SAU, ['forward(2)']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Van ở sau lưng nên không cần quay xe: bắn ra sau là trúng, và cú giật còn đẩy xe tiến một ô.',
        'Sau khi bắn, xe còn ba ô nữa mới tới cờ.']
    }),

    /* ------------------------------------------------------------- hàng 2: luyện */
    man({
      so: 4, ten: 'Thùng sau lưng', hang: 'luyen', mucTieu: 'day-thung', hamCuaEmCan: ['forward', 'u_turn', 'move'],
      deBai: 'Thùng nặng không gắp được, xe húc bằng bánh cũng không đẩy được. Nhưng thùng nằm ngay sau xe thì cú giật đẩy nó nhích một ô, và xe lùi theo một ô. Đưa thùng vào ô đích có khung vàng.',
      veMaMau: 'Chương trình có sẵn cho xe tiến hai ô. Chạy thử, xem thùng có nhúc nhích không rồi sửa.',
      san: SAN_4, batDau: BD_4,
      maMau: { chinh: ['forward(2)'] },
      sao: { o: 3, nhip: 2 },
      loiGiai: { chinh: CHINH_4.slice() },
      loiGiaiKhac: { moTa: 'Viết thẳng hai cặp spray(), wait() không dùng vòng for', baiLam: { chinh: lap(BAN, 2) } },
      loiSai: [
        { moTa: 'Quay đầu rồi húc thùng bằng bánh: thùng nặng cản như tường', baiLam: { chinh: ['u_turn()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-day-thung'] },
        { moTa: 'Dùng spray_back(): xe giật tới, cách xa thùng, thùng không nhúc nhích', baiLam: { chinh: BAN_SAU.slice() }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Bắn một phát: thùng mới nhích một ô, chưa tới đích', baiLam: { chinh: BAN.slice() }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Quên wait(): lệnh bắn chưa kịp chạy', baiLam: { chinh: ['spray()'] }, phaiCoMa: ['quen-wait', 'chua-day-thung'] }
      ],
      goiY: ['Thùng nằm sau xe: bắn ra trước, xe giật lùi đúng vào thùng.',
        'Mỗi phát thùng nhích một ô, xe theo sát: đích cách thùng hai ô thì bắn hai phát.']
    }),

    man({
      so: 5, ten: 'Hai thùng hai phía', hang: 'luyen', mucTieu: 'day-thung',
      deBai: 'Xe đứng giữa hai thùng nặng, mỗi thùng có một ô đích nằm sát tường. Thùng ở phía nào thì phải chọn đúng lệnh: spray() đẩy thùng sau xe, spray_back() đẩy thùng trước mặt xe. Đưa cả hai thùng vào đích.',
      veMaMau: 'Chương trình có sẵn đẩy được một thùng. Chạy thử, xem xe dừng ở đâu rồi đẩy nốt thùng còn lại.',
      san: SAN_5, batDau: BD_5,
      maMau: { chinh: BAN.slice() },
      sao: { o: 6, nhip: 3 },
      loiGiai: { chinh: CHINH_5.slice() },
      loiGiaiKhac: { moTa: 'Thêm một dòng chú thích giữa hai chiều bắn', baiLam: { chinh: nhieu(BAN, ['# xong thùng sau, giật tới hai lần cho thùng trước'], BAN_SAU, BAN_SAU) } },
      loiSai: [
        { moTa: 'Chỉ đẩy thùng phía sau: thùng phía trước vẫn nằm giữa hành lang', baiLam: { chinh: BAN.slice() }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Bắn hai lần cùng một chiều: thùng phía sau đã sát tường, không nhúc nhích nữa', baiLam: { chinh: nhieu(BAN, BAN) }, phaiCoMa: ['thung-chan', 'chua-day-thung'] },
        { moTa: 'Giật tới chỉ một lần: xe đã lùi theo thùng sau nên phát này chưa chạm thùng trước', baiLam: { chinh: nhieu(BAN, BAN_SAU) }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Quên wait() sau lệnh bắn thứ hai: lệnh đó chưa kịp chạy', baiLam: { chinh: nhieu(BAN, ['spray_back()']) }, phaiCoMa: ['quen-wait', 'chua-day-thung'] }
      ],
      goiY: ['Xe giật về phía nào thì thùng nằm phía đó bị đẩy: bắn ra trước giật lùi, bắn ra sau giật tới.',
        'Đẩy xong thùng này, xe đã dời một ô theo nó, nên cách thùng kia hai ô: giật về phía đó hai lần.']
    }),

    man({
      so: 6, ten: 'Quay rồi đẩy', hang: 'luyen', mucTieu: 'day-thung', hamCuaEmCan: ['turn_left', 'turn_right'],
      deBai: 'Hai thùng nặng, hai ô đích. Một thùng ở trước xe; đẩy nó xong, xe tiến theo một ô và thùng kia nằm ngay bên phải xe. Xe phải quay để thùng nằm trước hoặc sau xe, rồi mới đẩy được.',
      veMaMau: 'Chương trình có sẵn đẩy thùng ở trước xe. Chạy thử, xem xe dừng ở đâu rồi viết tiếp cho thùng bên phải.',
      san: SAN_6, batDau: BD_6,
      maMau: { chinh: BAN_SAU.slice() },
      sao: { o: 7, nhip: 3 },
      loiGiai: { chinh: CHINH_6.slice() },
      loiGiaiKhac: { moTa: 'Thêm một dòng chú thích trước lần quay', baiLam: { chinh: nhieu(BAN_SAU, ['# quay trái để thùng nằm sau xe'], ['turn_left()'], BAN) } },
      loiSai: [
        { moTa: 'Không quay: bắn ra trước thì xe giật lùi xuống, thùng bên phải không nhúc nhích', baiLam: { chinh: nhieu(BAN_SAU, BAN) }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Quay phải rồi bắn ra trước: xe giật về bên trái, xa khỏi thùng', baiLam: { chinh: nhieu(BAN_SAU, ['turn_right()'], BAN) }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Chỉ quay, quên bắn: thùng bên phải còn nguyên', baiLam: { chinh: nhieu(BAN_SAU, ['turn_left()']) }, phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Cú giật chỉ đẩy được thùng nằm ngay trước hoặc ngay sau xe, cùng hàng với mũi xe.',
        'Thùng bên phải: quay trái rồi bắn ra trước, hoặc quay phải rồi bắn ra sau.']
    }),

    /* ------------------------------------------------------------- hàng 3: biến thể */
    man({
      so: 7, ten: 'Thùng đi băng', hang: 'bien-the', mucTieu: 'day-thung',
      deBai: 'Băng chuyền cũng đẩy được thùng nặng: nằm trên băng đủ hai nhịp liền thì thùng đi một ô. Đẩy thùng lên đầu làn băng, rồi chờ băng đưa nó tới ô đích.',
      veMaMau: 'Chương trình có sẵn chỉ cho xe đứng chờ. Chạy thử, xem thùng ở đâu rồi viết tiếp.',
      san: SAN_7, batDau: BD_7,
      maMau: { chinh: ['wait()', 'wait()'] },
      sao: { o: 4, nhip: 6 },
      loiGiai: { chinh: CHINH_7.slice() },
      loiGiaiKhac: { moTa: 'Chờ bằng năm lần wait() viết thẳng thay cho vòng for', baiLam: { chinh: nhieu(BAN_SAU, lap(['wait()'], 5)) } },
      loiSai: [
        { moTa: 'Chờ thiếu một nhịp: thùng dừng giữa làn băng', baiLam: { chinh: nhieu(BAN_SAU, LAP(4, 'wait()')) }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đẩy xong là dừng chương trình, không chờ băng', baiLam: { chinh: BAN_SAU.slice() }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Dùng spray(): xe giật lùi mà sau lưng là tường, thùng không bị đẩy', baiLam: { chinh: nhieu(BAN, LAP(5, 'wait()')) }, phaiCoMa: ['giat-chan', 'chua-day-thung'] }
      ],
      goiY: ['Thùng nằm ngay trước mũi xe, sát làn băng: bắn ra sau, xe giật tới đẩy thùng nhích một ô lên băng.',
        'Làn băng dài mấy ô thì thùng cần chờ bấy nhiêu lần hai nhịp.']
    }),

    man({
      so: 8, ten: 'Tắt băng', hang: 'bien-the', hamCuaEmCan: ['forward', 'move'],
      deBai: 'Làn băng chuyền đẩy xe lùi lại nên xe đi rất chậm. Van ở cuối làn điều khiển băng: tia nước trúng van thì băng tắt. Tắt băng rồi đưa xe tới cờ bằng ít nhịp nhất.',
      veMaMau: 'Chương trình có sẵn cho xe đi thẳng. Chạy thử, xem làn băng làm xe đi chậm thế nào.',
      san: SAN_8, batDau: BD_8,
      maMau: { chinh: ['forward(10)'] },
      sao: { o: 8, nhip: 8 },
      loiGiai: { chinh: CHINH_8.slice() },
      loiGiaiKhac: { moTa: 'Đi bằng move() bảy lần thay cho forward(7)', baiLam: { chinh: nhieu(BAN, lap(['move()'], 7)) } },
      loiSai: [
        { moTa: 'Không tắt băng: xe vẫn tới cờ nhưng chậm hơn nhiều', baiLam: { chinh: ['forward(10)'] }, phaiCoMa: [] },
        { moTa: 'Quên wait() sau spray(): bước đầu của xe bị bỏ', baiLam: { chinh: ['spray()', 'forward(7)'] }, phaiCoMa: ['ban-dung-yen'] },
        { moTa: 'Dùng spray_back(): tia nước bay ra sau tới tường, không tới van, băng vẫn chạy', baiLam: { chinh: nhieu(BAN_SAU, ['forward(10)']) }, phaiCoMa: [] }
      ],
      goiY: ['Van ở phía trước, nên bắn ra trước. Cú giật làm xe lùi một ô nhưng đáng giá.',
        'Tia nước bay qua làn băng và qua cả ô cờ rồi mới trúng van.']
    }),

    man({
      so: 9, ten: 'Thùng chắn tia nước', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_left', 'back'],
      deBai: 'Van mở cửa nằm ở tường bên trái, nhưng thùng nặng đứng chắn đường bắn. Đẩy thùng ra khỏi đường bắn, bắn trúng van, rồi đưa xe qua cửa tới cờ.',
      veMaMau: 'Chương trình có sẵn đẩy thùng lên một ô. Chạy thử, xem xe dừng ở đâu rồi viết tiếp.',
      san: SAN_9, batDau: BD_9,
      maMau: { chinh: BAN_SAU.slice() },
      sao: { o: 12, nhip: 5 },
      loiGiai: { chinh: CHINH_9.slice() },
      loiGiaiKhac: { moTa: 'Thêm một dòng chú thích trước lệnh bắn van', baiLam: { chinh: nhieu(BAN_SAU, ['turn_left()'], ['# quay trái, bắn trúng van'], BAN, ['back()', 'back()']) } },
      loiSai: [
        { moTa: 'Húc thùng bằng bánh: thùng nặng cản như tường, xe không lên được', baiLam: { chinh: ['move()', 'turn_left()', 'spray()', 'wait()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đẩy thùng rồi lùi mà quên bắn van: cửa vẫn đóng', baiLam: { chinh: nhieu(BAN_SAU, ['turn_left()'], ['back()', 'back()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Bắn van rồi tiến thẳng: xe đang quay mặt về phía van nên đâm vào tường', baiLam: { chinh: nhieu(BAN_SAU, ['turn_left()'], BAN, ['move()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Bắn van khi thùng còn chắn: tia nước dừng ở thùng, cửa vẫn đóng', baiLam: { chinh: nhieu(['turn_left()'], BAN) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Thùng nằm ngay trước xe: bắn ra sau để đẩy nó lên một ô, bỏ trống đường bắn; xe tiến theo, vừa đúng ngang van.',
        'Bắn van bên trái xong xe giật sang phải. Muốn qua cửa thì lùi tiếp, khỏi phải quay mặt lại.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Kho hàng', hang: 'trum', mucTieu: 'day-thung', hamCuaEmCan: ['move', 'turn_left'],
      huyHieu: { ma: 'sung-hoi', ten: 'Huy hiệu Vòi phun' },
      deBai: 'Đưa cả hai thùng nặng vào ô đích. Thùng ở trước xe đang chắn đường bắn tới van ở tường bên trái; thùng thứ hai nằm trước cánh cửa đóng, cửa mở bằng van đó.',
      veMaMau: 'Chương trình có sẵn đẩy được một thùng. Chạy thử rồi viết tiếp.',
      san: SAN_10, batDau: BD_10,
      maMau: { chinh: BAN_SAU.slice() },
      sao: { o: 13, nhip: 6 },
      loiGiai: { chinh: CHINH_10.slice() },
      loiGiaiKhac: { moTa: 'Viết thẳng hai cặp spray(), wait() cuối không dùng vòng for', baiLam: { chinh: nhieu(BAN_SAU, ['turn_left()'], BAN, ['turn_right()'], BAN, BAN) } },
      loiSai: [
        { moTa: 'Húc thùng trước mặt bằng bánh: thùng nặng cản như tường, xe không lên được hàng van', baiLam: { chinh: ['move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-day-thung'] },
        { moTa: 'Đẩy thùng thứ hai chỉ một phát: nó dừng ngay trên ô cửa, chưa tới đích', baiLam: { chinh: nhieu(BAN_SAU, ['turn_left()'], BAN, ['turn_right()'], BAN) }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Quay trái rồi bắn ra sau: tia nước bay sang phải, không tới van; xe giật vào van nên đứng yên, cửa vẫn đóng chặn thùng', baiLam: { chinh: nhieu(BAN_SAU, ['turn_left()'], BAN_SAU, ['turn_right()'], LAP(2, BAN)) }, phaiCoMa: ['giat-chan', 'chua-day-thung'] },
        { moTa: 'Viết thẳng từng lệnh bánh, không dùng turn_left() và turn_right(): quá 10 ô', baiLam: { chinh: nhieu(BAN_SAU, ['right_move()', 'wait()'], BAN, ['left_move()', 'wait()'], BAN, BAN) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Đẩy thùng trước mặt lên ô đích: xe tiến theo một ô, vừa đúng ngang van.',
        'Bắn van xong xe giật sang phải, đứng ngay trên thùng thứ hai: quay mặt lên rồi bắn hai phát, mỗi phát thùng nhích một ô qua cửa đang mở.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

/* ============================================================================
   man-sung-bong.js — "Đường học": CHƯƠNG `sung-bong` · SÚNG BÓNG (10 màn).
   Robot là XE HAI BÁNH (loaiRobot 'banh'; màn 9 là XE OMNI) gắn SÚNG BÓNG ở mũi xe:
   robot { than: 'hai-banh' | 'omni', tay: 'bong', camBien: [] | [{ ma: 'khoang-cach', o: 'hong' }] (6, 10) }.
   hamGoc: bộ lệnh bánh + shoot; màn 6 và 10 thêm front_clear; màn 9 là bộ lệnh omni.
   LUẬT ĐÃ CHỐT (đầy đủ ở san-hoc.js, phần SÚNG BÓNG):
       shoot()  chỉ RA LỆNH, wait() cho nhịp trôi. Nhịp có shoot thì xe ĐỨNG YÊN (lệnh bánh cùng nhịp bị bỏ). Đạn vô hạn.
                Bóng bay THẲNG theo hướng mặt, ô tới ô trong cùng nhịp, dừng ở vật cản đầu tiên (tường cao, nút, cửa đóng, thùng, vật, bậc thang);
                bay QUA hàng rào thấp '=' và băng chuyền.
   - Ký hiệu sân MỚI: N nút bắn (nằm trên tường, xe không vào), C cửa đóng, c cửa mở. Bóng trúng N thì nút ĐỔI trạng thái; cửa nối với nút đổi ở CUỐI nhịp,
     băng chuyền nối với nút đổi NGAY (băng tắt thì không đẩy). Mặc định mọi nút điều khiển mọi cửa thường và mọi băng của sân; man.noi khai nhóm riêng.
     Cửa nhịp (man.cuaNhip) tự đóng mở theo chu kỳ, front_clear() = False khi cửa trước mặt đang đóng.
   - Mục tiêu: tới cờ F (mặc định). Nhịp: shoot mỗi lệnh một nhịp riêng, không gộp với lệnh bánh, nên BFS (do-duong-sung-bong.mjs) cho ĐÚNG sao.nhip của lời giải chuẩn.

   Hàm của em MỚI (tên cốt truyện, bị khóa trong kho, xem KhoHam.datTenCoDinh):
     sung-bong.5   hit_right() = turn_right(), shoot(), wait(), turn_left()      (bắn nút bên phải rồi quay lại)
   Hàm CỦA MÀN (tạm): màn 8 cho sẵn fire_left() thiếu wait() sau shoot() nên lệnh quay lại bị bỏ.
   Học thêm: nút đổi từng lần (bắn hai lần là về như cũ), bóng chỉ bay thẳng, cửa mở bằng nút, tắt băng chuyền bằng nút, `while not front_clear(): wait()` chờ cửa tự đóng mở,
   hàng rào không chặn bóng, nhiều nút nhiều cửa, xe omni bắn mà không phải quay.

   Nhiều sân: màn 6 và 10 (3 sân; san là mảng sân, batDau mảng song song, cuaNhip mảng song song, nhipTheo 'tong'); các màn còn lại một sân. cauTruc ['for', 'if', 'while'].
   Nối tiếp man-may-nem.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-may-nem.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var OMNI = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait'];

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }

  // thân các hàm của chương
  var T_HIT_RIGHT = ['turn_right()', 'shoot()', 'wait()', 'turn_left()'];
  function hHit(than) { return H('hit_right', [], than || T_HIT_RIGHT); }
  // 8: fire_left() của màn thiếu wait() sau shoot(): lệnh quay lại nằm chung nhịp với shoot nên bị bỏ
  var T_FIRE_SAI = ['turn_left()', 'shoot()', 'turn_right()'];
  var T_FIRE = ['turn_left()', 'shoot()', 'wait()', 'turn_right()'];
  function hFire(than) { return H('fire_left', [], than || T_FIRE); }

  /**
   * m.cb: 'kc' (front_clear, màn 6 và 10) | không có. m.omni: true thì xe omni (màn 9). Các trường này bị bỏ sau khi dùng.
   * Màn nhiều sân (san là mảng sân) tự có nhipTheo 'tong' và batDau song song.
   */
  function man(m) {
    var cb = m.cb, omni = m.omni;
    delete m.cb; delete m.omni;
    m.chuong = 'sung-bong';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = omni ? 'omni' : 'banh';
    m.robot = { than: omni ? 'omni' : 'hai-banh', tay: 'bong', camBien: cb === 'kc' ? [{ ma: 'khoang-cach', o: 'hong' }] : [] };
    m.hamGoc = nhieu(omni ? OMNI : BANH, ['shoot'], cb === 'kc' ? ['front_clear'] : []);
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: nút ở cuối hành lang bên phải xe (xe quay mặt sang phải, nút cách 2 ô); cửa ngay phía trên xe, cờ sau cửa
  var SAN_1 = ['##F##', '##C##', '....N', '....#', '....#'];
  var BD_1 = { x: 2, y: 2, huong: 1 };
  // 2: xe quay mặt lên (về phía cửa), nút ở tường bên trái, cách 2 ô
  var SAN_2 = ['##F##', '##C##', 'N....', '.....'];
  var BD_2 = { x: 2, y: 2, huong: 0 };
  // 3: hành lang dài, nút ở cuối, cửa ở cột 4; xe quay mặt sang phải ở đầu hành lang
  var SAN_3 = ['####F##', '####C##', '......N', '#######'];
  var BD_3 = { x: 0, y: 2, huong: 1 };
  // 4: làn băng chuyền đẩy xe lùi (4 ô), cờ sau băng, nút ngay sau cờ
  var SAN_4 = ['#######', '.<<<<FN', '#######'];
  var BD_4 = { x: 0, y: 1, huong: 1 };
  // 5: ba cửa nối nhau theo hành lang đứng, mỗi cửa có nút ở tường bên phải, ngay bên phải chỗ xe đứng trước cửa
  var SAN_5 = ['#F#', '#C#', '#.N', '#C#', '#.N', '#C#', '#.N'];
  var BD_5 = { x: 1, y: 6, huong: 0 };
  var NOI_5 = [
    { nut: { x: 2, y: 6 }, cua: [{ x: 1, y: 5 }] },
    { nut: { x: 2, y: 4 }, cua: [{ x: 1, y: 3 }] },
    { nut: { x: 2, y: 2 }, cua: [{ x: 1, y: 1 }] }
  ];
  // 6: ba sân giống nhau, cửa nhịp ở ô thứ hai trước mặt xe (mở 2 nhịp, đóng 2 nhịp), pha khác nhau
  var SAN_6 = ['#######', '#.C..F#', '#######'];
  var BD_6 = { x: 1, y: 1, huong: 1 };
  function cuaNhip6(pha) { return [{ x: 2, y: 1, mo: 2, dong: 2, pha: pha }]; }
  // 7: buồng nhỏ: nút B ở phía trên sau hàng rào, nút A bên phải sau hàng rào, hai cửa nối nhau ở phía dưới, cờ cuối
  var SAN_7 = ['##N##', '##=##', '##.=N', '##C##', '##C##', '##F##'];
  var BD_7 = { x: 2, y: 2, huong: 0 };
  var NOI_7 = [
    { nut: { x: 2, y: 0 }, cua: [{ x: 2, y: 3 }] },
    { nut: { x: 4, y: 2 }, cua: [{ x: 2, y: 4 }] }
  ];
  // 8: hành lang ngang, hai cửa; mỗi cửa có một nút ở tường phía trên chỗ xe đứng trước cửa
  var SAN_8 = ['#N#N###', '#.C.CF#', '#######'];
  var BD_8 = { x: 1, y: 1, huong: 1 };
  var NOI_8 = [
    { nut: { x: 1, y: 0 }, cua: [{ x: 2, y: 1 }] },
    { nut: { x: 3, y: 0 }, cua: [{ x: 4, y: 1 }] }
  ];
  // 9: xe omni quay mặt sang phải ở đáy hành lang đứng; ở các hàng 6, 4, 2 có nút bên phải, cửa ở các hàng 5, 3, 1, cờ ở đỉnh
  var SAN_9 = ['F###', 'C###', '...N', 'C###', '...N', 'C###', '...N'];
  var BD_9 = { x: 0, y: 6, huong: 1 };
  var NOI_9 = [
    { nut: { x: 3, y: 6 }, cua: [{ x: 0, y: 5 }] },
    { nut: { x: 3, y: 4 }, cua: [{ x: 0, y: 3 }] },
    { nut: { x: 3, y: 2 }, cua: [{ x: 0, y: 1 }] }
  ];
  // 10: ba sân; nút ngay phía trên xe, hai ô băng chuyền đẩy xe lùi, rồi cửa nhịp (mở 2, đóng 2) và cờ
  var SAN_10 = ['#N#####', '#.<<C.F', '#######'];
  var BD_10 = { x: 1, y: 1, huong: 0 };
  function cuaNhip10(pha) { return [{ x: 4, y: 1, mo: 2, dong: 2, pha: pha }]; }

  /* ------------------------------------------------------------- chương trình dùng lại */

  var CHINH_1 = ['shoot()', 'wait()', 'turn_left()', 'move()', 'move()'];
  var CHINH_2 = ['turn_left()', 'shoot()', 'wait()', 'turn_right()', 'move()', 'move()'];
  var CHINH_3 = ['shoot()', 'wait()', 'forward(4)', 'turn_left()', 'forward(2)'];
  var CHINH_4 = ['shoot()', 'wait()', 'forward(5)'];
  var CHINH_5 = LAP(3, ['hit_right()', 'forward(2)']);
  var CHINH_6 = ['while not front_clear():', '    wait()', 'forward(4)'];
  var CHINH_7 = ['shoot()', 'wait()', 'turn_right()', 'shoot()', 'wait()', 'turn_right()', 'forward(3)'];
  var CHINH_8 = LAP(2, ['fire_left()', 'forward(2)']);
  var CHINH_9 = LAP(3, ['shoot()', 'wait()', 'slide_l(2)']);
  var CHINH_10 = ['shoot()', 'wait()', 'turn_right()', 'forward(2)', 'while not front_clear():', '    wait()', 'forward(3)'];

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Bắn trúng nút', hang: 'lam-quen', hamCuaEmCan: ['turn_left', 'move', 'forward'],
      deBai: 'Cửa đóng chắn đường tới cờ. Trên tường có một nút: bóng bắn trúng nút thì cửa mở. shoot() rồi wait() bắn một quả bóng bay thẳng theo hướng xe quay mặt; mở cửa rồi đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn đã bắn trúng nút. Chạy thử, xem cửa, rồi viết tiếp phần đưa xe tới cờ.',
      san: SAN_1, batDau: BD_1,
      maMau: { chinh: ['shoot()', 'wait()'] },
      sao: { o: 10, nhip: 4 },
      loiGiai: { chinh: CHINH_1.slice() },
      loiGiaiKhac: { moTa: 'Đi bằng forward(2)', baiLam: { chinh: ['shoot()', 'wait()', 'turn_left()', 'forward(2)'] } },
      loiSai: [
        { moTa: 'Không bắn nút: cửa vẫn đóng nên xe đâm vào cửa', baiLam: { chinh: ['turn_left()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên wait() sau shoot(): lệnh quay nằm chung nhịp với shoot nên bị bỏ', baiLam: { chinh: ['shoot()', 'turn_left()', 'move()', 'move()'] }, phaiCoMa: ['ban-dung-yen', 'chua-toi-co'] },
        { moTa: 'Quay lên trước khi bắn: bóng bay lên và bị cửa đóng chặn, không tới nút', baiLam: { chinh: ['turn_left()', 'shoot()', 'wait()', 'move()', 'move()'] }, phaiCoMa: ['ban-bi-chan', 'dam-tuong'] },
        { moTa: 'Bắn hai lần: nút đổi hai lần nên cửa lại đóng', baiLam: { chinh: ['shoot()', 'wait()', 'shoot()', 'wait()', 'turn_left()', 'move()', 'move()'] }, phaiCoMa: ['ban-nut-lai', 'dam-tuong'] },
        { moTa: 'Đi thiếu một ô: xe dừng giữa cửa', baiLam: { chinh: ['shoot()', 'wait()', 'turn_left()', 'move()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quay phải thay vì quay trái: xe đi xuống', baiLam: { chinh: ['shoot()', 'wait()', 'turn_right()', 'move()', 'move()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Sau shoot() phải có wait() thì quả bóng mới bay. Bóng trúng nút thì cửa mở ở cuối nhịp đó.',
        'Xe đang quay mặt sang phải, còn cửa và cờ nằm phía trên xe: bắn xong phải quay lại trước khi đi.']
    }),

    man({
      so: 2, ten: 'Quay về phía nút', hang: 'lam-quen', hamCuaEmCan: ['turn_left', 'turn_right', 'move', 'forward'],
      deBai: 'Xe quay mặt về phía cửa đóng, còn nút nằm ở tường bên trái. Bóng chỉ bay thẳng theo hướng mặt xe, nên phải quay xe về phía nút trước khi bắn. Mở cửa rồi đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn đi thẳng vào cửa. Chạy thử, xem xe bị chặn ở đâu rồi thêm các lệnh mở cửa.',
      san: SAN_2, batDau: BD_2,
      maMau: { chinh: ['move()', 'move()'] },
      sao: { o: 13, nhip: 5 },
      loiGiai: { chinh: CHINH_2.slice() },
      loiGiaiKhac: { moTa: 'Đi bằng forward(2)', baiLam: { chinh: ['turn_left()', 'shoot()', 'wait()', 'turn_right()', 'forward(2)'] } },
      loiSai: [
        { moTa: 'Bắn mà không quay: bóng bay lên và bị cửa đóng chặn', baiLam: { chinh: ['shoot()', 'wait()', 'move()', 'move()'] }, phaiCoMa: ['ban-bi-chan', 'dam-tuong'] },
        { moTa: 'Quay sang phải: bóng bay ra ngoài sân, không trúng nút', baiLam: { chinh: ['turn_right()', 'shoot()', 'wait()', 'turn_left()', 'move()', 'move()'] }, phaiCoMa: ['ban-hut', 'dam-tuong'] },
        { moTa: 'Bắn xong không quay lại: xe còn quay mặt sang trái nên tiến vào nút', baiLam: { chinh: ['turn_left()', 'shoot()', 'wait()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên wait() sau shoot(): lệnh quay lại nằm chung nhịp với shoot nên bị bỏ', baiLam: { chinh: ['turn_left()', 'shoot()', 'turn_right()', 'move()', 'move()'] }, phaiCoMa: ['ban-dung-yen', 'chua-toi-co'] },
        { moTa: 'Bắn hai lần: nút đổi hai lần nên cửa lại đóng', baiLam: { chinh: ['turn_left()', 'shoot()', 'wait()', 'shoot()', 'wait()', 'turn_right()', 'move()', 'move()'] }, phaiCoMa: ['ban-nut-lai', 'dam-tuong'] }
      ],
      goiY: ['Bóng bay thẳng theo hướng mặt xe, nên phải quay trước khi shoot().',
        'Nút nằm ở bên trái xe: quay trái một lần, bắn, rồi quay phải để mặt lại hướng cửa.']
    }),

    man({
      so: 3, ten: 'Bắn một lần thôi', hang: 'lam-quen', hamCuaEmCan: ['forward', 'turn_left', 'move'],
      deBai: 'Cửa ở trên hành lang, nút nằm ở cuối hành lang. Mỗi quả bóng trúng nút đổi nút một lần, nên cửa lúc mở lúc đóng. Mở cửa rồi đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn bắn hai lần. Chạy thử, xem cửa lúc xe tới nơi, rồi sửa.',
      san: SAN_3, batDau: BD_3,
      maMau: { chinh: ['shoot()', 'wait()', 'shoot()', 'wait()', 'forward(4)', 'turn_left()', 'forward(2)'] },
      sao: { o: 12, nhip: 8 },
      loiGiai: { chinh: CHINH_3.slice() },
      loiGiaiKhac: { moTa: 'Đoạn cuối đi bằng move() hai lần', baiLam: { chinh: ['shoot()', 'wait()', 'forward(4)', 'turn_left()', 'move()', 'move()'] } },
      loiSai: [
        { moTa: 'Bắn hai lần: cửa mở rồi lại đóng nên xe đâm vào cửa', baiLam: { chinh: ['shoot()', 'wait()', 'shoot()', 'wait()', 'forward(4)', 'turn_left()', 'forward(2)'] }, phaiCoMa: ['ban-nut-lai', 'dam-tuong'] },
        { moTa: 'Không bắn: cửa vẫn đóng', baiLam: { chinh: ['forward(4)', 'turn_left()', 'forward(2)'] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bắn xong không đi đủ 4 ô: xe quay lên giữa hành lang', baiLam: { chinh: ['shoot()', 'wait()', 'forward(3)', 'turn_left()', 'forward(2)'] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên wait() sau shoot(): bóng bắn rồi nhưng bước đầu của xe bị bỏ', baiLam: { chinh: ['shoot()', 'forward(4)', 'turn_left()', 'forward(2)'] }, phaiCoMa: ['ban-dung-yen', 'dam-tuong'] },
        { moTa: 'Rẽ phải thay vì rẽ trái: xe quay xuống tường', baiLam: { chinh: ['shoot()', 'wait()', 'forward(4)', 'turn_right()', 'forward(2)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Mỗi quả bóng trúng nút đổi nút một lần: bắn hai lần là mọi thứ về như lúc đầu.',
        'Sửa bằng cách xóa bớt lệnh bắn thừa, giữ lại đúng một cặp shoot() và wait().']
    }),

    /* ------------------------------------------------------------- hàng 2: luyện */
    man({
      so: 4, ten: 'Tắt băng chuyền', hang: 'luyen', hamCuaEmCan: ['forward', 'move'],
      deBai: 'Làn băng chuyền đẩy xe lùi lại nên xe đi ngược băng rất chậm. Nút ở cuối hành lang điều khiển làn băng: bóng trúng nút thì băng tắt, không đẩy nữa. Tắt băng rồi đưa xe tới cờ bằng ít nhịp nhất.',
      veMaMau: 'Chương trình có sẵn cho xe đi thẳng. Chạy thử, xem làn băng làm xe đi chậm thế nào.',
      san: SAN_4, batDau: BD_4,
      maMau: { chinh: ['forward(5)'] },
      sao: { o: 8, nhip: 6 },
      loiGiai: { chinh: CHINH_4.slice() },
      loiGiaiKhac: { moTa: 'Đi bằng move() năm lần', baiLam: { chinh: ['shoot()', 'wait()', 'move()', 'move()', 'move()', 'move()', 'move()'] } },
      loiSai: [
        { moTa: 'Không tắt băng: xe bị đẩy lùi nên đi quá chậm, chưa tới cờ', baiLam: { chinh: ['forward(5)'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên wait() sau shoot(): bước đầu của xe bị bỏ', baiLam: { chinh: ['shoot()', 'forward(5)'] }, phaiCoMa: ['ban-dung-yen', 'chua-toi-co'] },
        { moTa: 'Quay lưng lại nút rồi bắn: bóng bay ra ngoài sân', baiLam: { chinh: ['u_turn()', 'shoot()', 'wait()', 'u_turn()', 'forward(5)'] }, phaiCoMa: ['ban-hut', 'chua-toi-co'] },
        { moTa: 'Bắn hai lần: băng tắt rồi lại chạy', baiLam: { chinh: ['shoot()', 'wait()', 'shoot()', 'wait()', 'forward(5)'] }, phaiCoMa: ['ban-nut-lai', 'chua-toi-co'] },
        { moTa: 'Đi thiếu một ô: xe dừng trên băng, chưa tới cờ', baiLam: { chinh: ['shoot()', 'wait()', 'forward(4)'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Bóng bay qua làn băng chuyền, không bị băng chặn. Nút ở cuối hành lang, ngay phía trước xe.',
        'Băng đã tắt thì xe đi trên băng như đi trên sàn thường.']
    }),

    man({
      so: 5, ten: 'Hàm hit_right', hang: 'luyen', hamCuaEmCan: ['turn_right', 'turn_left', 'forward', 'move'], taoHam: ['hit_right'],
      deBai: 'Ba cửa nối nhau, mỗi cửa có một nút ở tường bên phải, ngay bên phải chỗ xe đứng trước cửa. Việc bắn nút lặp lại ba lần: tạo hàm hit_right() quay phải, bắn, rồi quay lại. Mở từng cửa rồi đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn mới mở được cửa đầu tiên bằng cách viết thẳng từng lệnh. Chạy thử, gói phần bắn nút thành hàm hit_right() rồi viết tiếp cho hai cửa còn lại.',
      san: SAN_5, batDau: BD_5, noi: NOI_5,
      maMau: { chinh: ['turn_right()', 'shoot()', 'wait()', 'turn_left()', 'forward(2)'] },
      sao: { o: 16, nhip: 15 },
      loiGiai: { chinh: CHINH_5.slice(), hamCuaEmMoi: [hHit()] },
      loiGiaiKhac: { moTa: 'Viết ba cặp hit_right(), forward(2) không dùng vòng for', baiLam: { chinh: ['hit_right()', 'forward(2)', 'hit_right()', 'forward(2)', 'hit_right()', 'forward(2)'] }, hamCuaEmMoi: [hHit()] },
      loiSai: [
        { moTa: 'Gọi hit_right() mà chưa tạo hàm', baiLam: { chinh: CHINH_5.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'hit_right() quên wait(): lệnh quay lại bị bỏ nên xe còn quay mặt sang phải', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hHit(['turn_right()', 'shoot()', 'turn_left()'])], phaiCoMa: ['ban-dung-yen', 'dam-tuong'] },
        { moTa: 'hit_right() quên quay lại: xe còn quay mặt sang phải khi đi', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hHit(['turn_right()', 'shoot()', 'wait()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'hit_right() quay trái: bóng bay vào tường, không tới nút', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hHit(['turn_left()', 'shoot()', 'wait()', 'turn_right()'])], phaiCoMa: ['ban-bi-chan', 'dam-tuong'] },
        { moTa: 'Không dùng hàm, viết thẳng cho cả ba cửa: tràn khung 10 ô', baiLam: { chinh: nhieu(['turn_right()', 'shoot()', 'wait()', 'turn_left()', 'forward(2)'], ['turn_right()', 'shoot()', 'wait()', 'turn_left()', 'forward(2)'], ['turn_right()', 'shoot()', 'wait()', 'turn_left()', 'forward(2)']) }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Chỉ lặp hai lần: còn một cửa chưa mở', baiLam: { chinh: LAP(2, ['hit_right()', 'forward(2)']) }, hamCuaEmMoi: [hHit()], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Mỗi cửa làm cùng một việc: quay phải, bắn, chờ nhịp, quay lại. Gói bốn dòng đó vào hàm hit_right.',
        'Sau khi bắn và quay lại, xe còn quay mặt lên: đi qua cửa vừa mở và tới chỗ đứng trước cửa kế bằng forward(2).']
    }),

    man({
      so: 6, ten: 'Cửa tự đóng mở', hang: 'luyen', hamCuaEmCan: ['forward', 'move'], cb: 'kc',
      deBai: 'Cửa này tự đóng mở theo nhịp, và mỗi sân cửa mở vào một lúc khác nhau. front_clear() cho biết ô trước mặt đã trống chưa. Chờ cho cửa mở rồi đưa xe qua cửa tới cờ ở cả ba sân.',
      veMaMau: 'Chương trình có sẵn đi thẳng qua cửa. Chạy thử, xem sân nào thắng, sân nào xe đâm vào cửa đóng.',
      san: [SAN_6, SAN_6, SAN_6], batDau: BD_6, cuaNhip: [cuaNhip6(0), cuaNhip6(2), cuaNhip6(3)],
      maMau: { chinh: ['forward(4)'] },
      sao: { o: 8, nhip: 15 },
      loiGiai: { chinh: CHINH_6.slice() },
      loiGiaiKhac: { moTa: 'Đi bằng move() bốn lần', baiLam: { chinh: ['while not front_clear():', '    wait()', 'move()', 'move()', 'move()', 'move()'] } },
      loiSai: [
        { moTa: 'Đi thẳng không chờ: chỉ sân có cửa đang mở thắng', baiLam: { chinh: ['forward(4)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chờ cố định hai nhịp: ở sân có cửa mở sẵn thì tới nơi cửa đã đóng', baiLam: { chinh: ['wait()', 'wait()', 'forward(4)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Điều kiện ngược: chờ khi cửa đang mở rồi đi vào lúc cửa đóng', baiLam: { chinh: ['while front_clear():', '    wait()', 'forward(4)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Vòng while không có wait() trong thân: nhịp không trôi nên cửa không bao giờ mở', baiLam: { chinh: ['while not front_clear():', '    x = 1', 'forward(4)'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Chờ xong chỉ đi 3 ô: xe dừng ngay trước cờ', baiLam: { chinh: ['while not front_clear():', '    wait()', 'forward(3)'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Dùng while not front_clear(): wait() để chờ cho tới khi ô trước mặt trống.',
        'Cửa mở lúc nào tùy sân, nên số nhịp phải chờ khác nhau: để vòng while tự đếm thay em.']
    }),

    /* ------------------------------------------------------------- hàng 3: biến thể */
    man({
      so: 7, ten: 'Bóng bay qua hàng rào', hang: 'bien-the', hamCuaEmCan: ['turn_right', 'forward', 'right', 'move'],
      deBai: 'Hai nút nằm sau hàng rào thấp: xe không đi tới được nhưng bóng bay qua hàng rào. Mỗi nút mở một cửa riêng trên đường xuống cờ, và cả hai cửa đều cần mở. Bắn trúng cả hai nút rồi đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn mới bắn một nút. Chạy thử rồi bắn nút còn lại.',
      san: SAN_7, batDau: BD_7, noi: NOI_7,
      maMau: { chinh: ['shoot()', 'wait()'] },
      sao: { o: 14, nhip: 7 },
      loiGiai: { chinh: CHINH_7.slice() },
      loiGiaiKhac: { moTa: 'Quay xuống bằng right(1)', baiLam: { chinh: ['shoot()', 'wait()', 'turn_right()', 'shoot()', 'wait()', 'right(1)', 'forward(3)'] } },
      loiSai: [
        { moTa: 'Chỉ bắn nút phía trên: cửa thứ hai vẫn đóng', baiLam: { chinh: ['shoot()', 'wait()', 'turn_right()', 'turn_right()', 'forward(3)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ bắn nút bên phải: cửa thứ nhất vẫn đóng', baiLam: { chinh: ['turn_right()', 'shoot()', 'wait()', 'turn_right()', 'forward(3)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Bắn nút phía trên hai lần: nút đổi hai lần nên cửa lại đóng', baiLam: { chinh: ['shoot()', 'wait()', 'shoot()', 'wait()', 'turn_right()', 'shoot()', 'wait()', 'turn_right()', 'forward(3)'] }, phaiCoMa: ['ban-nut-lai', 'dam-tuong'] },
        { moTa: 'Bắn xong nút bên phải mà không quay xuống: xe tiến vào hàng rào', baiLam: { chinh: ['shoot()', 'wait()', 'turn_right()', 'shoot()', 'wait()', 'forward(3)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quay xuống rồi mới bắn: bóng bị cửa đóng chặn, không tới nút nào', baiLam: { chinh: ['turn_right()', 'turn_right()', 'shoot()', 'wait()', 'forward(3)'] }, phaiCoMa: ['ban-bi-chan', 'dam-tuong'] }
      ],
      goiY: ['Hàng rào thấp chặn xe nhưng không chặn bóng: bắn ngay từ chỗ đang đứng.',
        'Có hai nút nên cần hai lần bắn, mỗi lần quay mặt về một nút. Xong mới quay mặt xuống phía hai cửa.']
    }),

    man({
      so: 8, ten: 'Sửa hàm fire_left', hang: 'bien-the', hamCuaEmCan: ['forward', 'right', 'move', 'turn_left', 'turn_right'],
      deBai: 'Màn cho sẵn hàm fire_left() quay trái, bắn nút phía trên rồi quay lại. Hàm đang làm xe không quay lại như mong muốn. Sửa hàm rồi đưa xe qua hai cửa tới cờ.',
      veMaMau: 'Chương trình có sẵn gọi fire_left() hai lần. Chạy thử, xem xe quay mặt về đâu sau mỗi lần bắn rồi sửa hàm.',
      san: SAN_8, batDau: BD_8, noi: NOI_8,
      maMau: { chinh: CHINH_8.slice(), hamCuaMan: [hFire(T_FIRE_SAI)] },
      sao: { o: 16, nhip: 10 },
      loiGiai: { chinh: CHINH_8.slice(), hamCuaMan: [hFire()] },
      loiGiaiKhac: { moTa: 'Sửa hàm, quay lại bằng right(1)', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hFire(['turn_left()', 'shoot()', 'wait()', 'right(1)'])] } },
      loiSai: [
        { moTa: 'Chưa sửa hàm: lệnh quay lại nằm chung nhịp với shoot nên bị bỏ', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hFire(T_FIRE_SAI)] }, phaiCoMa: ['ban-dung-yen', 'dam-tuong'] },
        { moTa: 'Sửa thành quay phải: bóng bay xuống tường, không tới nút', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hFire(['turn_right()', 'shoot()', 'wait()', 'turn_left()'])] }, phaiCoMa: ['ban-bi-chan', 'dam-tuong'] },
        { moTa: 'Bỏ shoot() khỏi hàm: không có quả bóng nào bay nên cửa vẫn đóng', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hFire(['turn_left()', 'wait()', 'turn_right()'])] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ gọi fire_left() một lần: cửa thứ hai vẫn đóng', baiLam: { chinh: ['fire_left()', 'forward(2)', 'forward(2)'], hamCuaMan: [hFire()] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Sửa hàm đúng nhưng chương trình chỉ đi 1 ô sau mỗi lần bắn', baiLam: { chinh: LAP(2, ['fire_left()', 'forward(1)']), hamCuaMan: [hFire()] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Chạy thử và xem xe quay mặt về đâu sau khi fire_left() chạy xong.',
        'Nhịp có shoot() thì xe đứng yên: lệnh quay nằm chung nhịp đó bị bỏ.']
    }),

    man({
      so: 9, ten: 'Omni không cần quay', hang: 'bien-the', hamCuaEmCan: ['slide_l', 'slide_r'], omni: true,
      deBai: 'Xe omni luôn quay mặt sang phải, nơi có một nút ở mỗi tầng; mỗi nút mở cửa phía trên tầng đó. Xe omni trượt lên xuống mà không cần quay, và bóng luôn bay sang phải. Mở cả ba cửa rồi đưa xe lên cờ.',
      veMaMau: 'Chương trình có sẵn bắn nút đầu tiên rồi trượt lên một tầng. Chạy thử, rồi lặp lại cho hai tầng còn lại.',
      san: SAN_9, batDau: BD_9, noi: NOI_9,
      maMau: { chinh: ['shoot()', 'wait()', 'slide_l(2)'] },
      sao: { o: 7, nhip: 9 },
      loiGiai: { chinh: CHINH_9.slice() },
      loiGiaiKhac: { moTa: 'Viết ba lần bắn, trượt không dùng vòng for', baiLam: { chinh: ['shoot()', 'wait()', 'slide_l(2)', 'shoot()', 'wait()', 'slide_l(2)', 'shoot()', 'wait()', 'slide_l(2)'] } },
      loiSai: [
        { moTa: 'Dùng slide_r(2) (trượt xuống) thay vì slide_l(2): xe ra ngoài sân', baiLam: { chinh: LAP(3, ['shoot()', 'wait()', 'slide_r(2)']) }, hamCuaEmMoi: [], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Trượt trước khi bắn: cửa còn đóng nên xe đâm vào cửa', baiLam: { chinh: LAP(3, ['slide_l(2)', 'shoot()', 'wait()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên wait() sau shoot(): lệnh trượt nằm chung nhịp với shoot nên bị bỏ', baiLam: { chinh: LAP(3, ['shoot()', 'slide_l(2)']) }, phaiCoMa: ['ban-dung-yen', 'chua-toi-co'] },
        { moTa: 'Chỉ lặp hai lần: còn một cửa chưa mở', baiLam: { chinh: LAP(2, ['shoot()', 'wait()', 'slide_l(2)']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Trượt một ô mỗi lần: lần bắn sau lệch tầng, bóng bay vào tường', baiLam: { chinh: LAP(3, ['shoot()', 'wait()', 'slide_l(1)']) }, phaiCoMa: ['ban-bi-chan', 'chua-toi-co'] }
      ],
      goiY: ['Xe đang quay mặt sang phải: slide_left() trượt xe lên phía trên, slide_right() trượt xuống.',
        'Mỗi tầng làm cùng ba việc: bắn, chờ nhịp, trượt lên hai ô. Hai ô vì cửa nằm ngay phía trên chỗ xe đứng.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Hành lang băng và cửa', hang: 'trum', hamCuaEmCan: ['turn_right', 'forward', 'move'], cb: 'kc',
      deBai: 'Nút gắn trên tường ngay phía trên xe, điều khiển làn băng chuyền đang đẩy xe lùi. Phía sau băng là một cửa tự đóng mở theo nhịp, mỗi sân một khác. Tắt băng, chờ cửa mở rồi đưa xe tới cờ ở cả ba sân.',
      veMaMau: 'Chương trình có sẵn tắt băng rồi đi thẳng. Chạy thử, xem sân nào thắng, sân nào xe đâm vào cửa đóng.',
      san: [SAN_10, SAN_10, SAN_10], batDau: BD_10, cuaNhip: [cuaNhip10(0), cuaNhip10(3), cuaNhip10(2)],
      maMau: { chinh: ['shoot()', 'wait()', 'turn_right()', 'forward(5)'] },
      sao: { o: 14, nhip: 24 },
      huyHieu: { ma: 'sung-bong', ten: 'Huy hiệu Súng bóng' },
      loiGiai: { chinh: CHINH_10.slice() },
      loiGiaiKhac: { moTa: 'Đi bằng move() thay cho forward', baiLam: { chinh: ['shoot()', 'wait()', 'turn_right()', 'move()', 'move()', 'while not front_clear():', '    wait()', 'move()', 'move()', 'move()'] } },
      loiSai: [
        { moTa: 'Không chờ cửa: chỉ sân có cửa đang mở thắng', baiLam: { chinh: ['shoot()', 'wait()', 'turn_right()', 'forward(5)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chờ cửa nhưng không tắt băng: băng đẩy xe lùi nên không tới cờ', baiLam: { chinh: ['turn_right()', 'forward(2)', 'while not front_clear():', '    wait()', 'forward(3)'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quay phải rồi mới bắn: bóng bay dọc hành lang, không trúng nút', baiLam: { chinh: ['turn_right()', 'shoot()', 'wait()', 'forward(2)', 'while not front_clear():', '    wait()', 'forward(3)'] }, phaiCoMa: ['ban-bi-chan', 'chua-toi-co'] },
        { moTa: 'Điều kiện ngược: chờ khi cửa đang mở rồi đi vào lúc cửa đóng', baiLam: { chinh: ['shoot()', 'wait()', 'turn_right()', 'forward(2)', 'while front_clear():', '    wait()', 'forward(3)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên wait() sau shoot(): lệnh quay bị bỏ nên xe còn quay mặt lên', baiLam: { chinh: ['shoot()', 'turn_right()', 'forward(2)', 'while not front_clear():', '    wait()', 'forward(3)'] }, phaiCoMa: ['ban-dung-yen', 'dam-tuong'] }
      ],
      goiY: ['Bóng chỉ cần bay một lần: nút ở ngay phía trên xe. Tắt băng trước khi đi, rồi mới tính chuyện chờ cửa.',
        'Đi tới sát cửa rồi mới dùng while not front_clear(): wait(); số nhịp phải chờ khác nhau ở mỗi sân.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

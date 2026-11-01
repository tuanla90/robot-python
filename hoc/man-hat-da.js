/* ============================================================================
   man-hat-da.js — "Robot Chấn Hưng": GÓI 2 MÙA 6 "TAY HẤT ĐÁ"
   Gồm 20 màn mới trên Máy mỏ đá R1 (thân omni + tay hất đá, tầm cố định 2 ô, chưa cảm biến):
   - may-nem.11..20 (10 màn chương may-nem "Hất đá qua rào")
   - che-may-nem.11..20 (10 màn chương che-may-nem "Chế lệnh: hất đá")
   Nạp sau man-luoi-2d.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC_NEM = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw'];
  var ROBOT_NEM = { than: 'omni', tay: 'nem', camBien: [] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  function bai(chinh, Phu) {
    return {
      chinh: chinh,
      hamCuaMan: (Phu && Phu.hamCuaMan) || [],
      hamCuaEmMoi: (Phu && Phu.hamCuaEmMoi) || []
    };
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than }; }
  function nhieu(ds) {
    var kq = [];
    for (var i = 0; i < ds.length; i++) {
      var x = ds[i];
      if (Array.isArray(x)) { for (var k = 0; k < x[0]; k++) kq = kq.concat(x[1]); }
      else kq.push(x);
    }
    return kq;
  }

  var T_LOB = ['load()', 'wait()', 'throw()', 'wait()'];
  var T_LOB_R = ['lob()', 'slide_r(n)'];
  var T_SLIDE_LOB = ['load()', 'wait()', 'slide_r(n)', 'throw()', 'wait()'];
  var T_LOB_RIGHT = ['load()', 'wait()', 'turn_right()', 'throw()', 'wait()', 'turn_left()'];
  var T_LOB_ROW = ['for n in r:', '    slide_r(n)', '    lob()'];

  function manMayNem(cfg) {
    return Object.assign({
      chuong: 'may-nem',
      loaiRobot: 'omni',
      robot: ROBOT_NEM,
      tamNemMacDinh: 2,
      hamGoc: HAM_GOC_NEM,
      moXuong: true,
      mucTieu: 'dua-vat',
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      taoHam: [],
      hamCuaEmCan: ['move'],
      loiSai: [],
      goiY: [],
      phienBanNoiDung: 2
    }, cfg);
  }

  function manCheNem(cfg) {
    return Object.assign({
      chuong: 'che-may-nem',
      loaiRobot: 'omni',
      robot: ROBOT_NEM,
      tamNemMacDinh: 2,
      hamGoc: HAM_GOC_NEM,
      moXuong: true,
      mucTieu: 'dua-vat',
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      taoHam: [],
      hamCuaEmCan: ['move'],
      loiSai: [],
      goiY: [],
      phienBanNoiDung: 2
    }, cfg);
  }

  var DS = [
    /* ================================================= chương may-nem: Hất đá qua rào (10 màn: 11..20) ================================================= */
    manMayNem({
      so: 11, ten: 'Tay hất đá hai ô', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'Sola làm mẫu: R1 vừa gắn tay hất đá ở mũi xe. Lệnh load() kèm wait() xúc tảng đá ở ô ngay trước mặt vào máng; lệnh throw() kèm wait() hất tảng đá bay thẳng tới ô cách mũi xe đúng 2 ô. Bấm Chạy xem R1 xúc đá rồi hất vào ô đích.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem load() xúc đá vào máng rồi throw() hất đá bay xa 2 ô vào đích.',
      san: ['###', '#D#', '#o#', '#.#'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(T_LOB),
      loiGiai: bai(T_LOB),
      sao: { o: 4, nhip: 2 },
      goiY: ['Luna: load() xúc vật ở ô trước mặt vào máng, cần wait() để hết nhịp.', 'Luna: throw() hất vật trong máng bay xa 2 ô theo hướng mũi xe, cũng cần wait().']
    }),

    manMayNem({
      so: 12, ten: 'Hất đá vào đích', hang: 'lam-quen',
      deBai: 'Sola nhờ bạn: tảng đá nằm ngay trước mũi xe, còn ô đích nằm cách mũi xe 2 ô. Chương trình có sẵn mới xúc đá vào máng bằng load() và wait(). Hãy thêm lệnh hất đá để đưa tảng đá vào đích.',
      veMaMau: 'Chạy thử bản có sẵn: xe mới xúc đá lên máng mà chưa hất. Thêm throw() và wait() ở cuối chương trình.',
      san: ['#####', '##D##', '##o##', '##.##'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: bai(['load()', 'wait()']),
      loiGiai: bai(T_LOB),
      sao: { o: 4, nhip: 2 },
      loiGiaiKhac: {
        moTa: 'Thêm một nhịp chờ sau khi đã hất đá vào đích',
        baiLam: bai(['load()', 'wait()', 'throw()', 'wait()', 'wait()'])
      },
      loiSai: [
        { moTa: 'Chưa thêm throw(): đá vẫn nằm trong máng xe', baiLam: bai(['load()', 'wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi throw() mà quên wait() ở cuối: lệnh hất đá chưa kịp thực hiện', baiLam: bai(['load()', 'wait()', 'throw()']), phaiCoMa: ['quen-wait', 'chua-dua-vat'] },
        { moTa: 'Gọi throw() trước load(): máng trống nên hất vào không khí', baiLam: bai(['throw()', 'wait()', 'load()', 'wait()']), phaiCoMa: ['nem-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau load() và wait(), gọi throw() rồi wait().', 'Luna: Mọi lệnh của tay hất đá đều cần wait() để kết thúc nhịp.']
    }),

    manMayNem({
      so: 13, ten: 'Trượt ngang tới tảng đá', hang: 'luyen', hamCuaEmCan: ['slide_r'],
      deBai: 'Sola nhờ bạn: tảng đá và ô đích nằm lệch sang bên phải 2 ô. Hãy dùng slide_r(2) trượt ngang tới đứng ngay dưới tảng đá, rồi xúc đá và hất vào ô đích.',
      veMaMau: 'Chương trình có sẵn đã trượt phải 2 ô tới trước tảng đá. Viết tiếp phần xúc đá và hất vào đích.',
      san: ['#####', '###D#', '###o#', '#...#'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['slide_r(2)']),
      loiGiai: bai(['slide_r(2)', 'load()', 'wait()', 'throw()', 'wait()']),
      sao: { o: 8, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Trượt phải bằng hai lần slide_right() kèm wait()',
        baiLam: bai(['slide_right()', 'wait()', 'slide_right()', 'wait()', 'load()', 'wait()', 'throw()', 'wait()'])
      },
      loiSai: [
        { moTa: 'Chưa xúc và hất đá sau khi trượt tới', baiLam: bai(['slide_r(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xúc đá ở ngay ô xuất phát trước khi trượt: ô trước mặt trống nên xúc hụt', baiLam: bai(['load()', 'wait()', 'slide_r(2)', 'throw()', 'wait()']), phaiCoMa: ['nap-hut', 'chua-dua-vat'] },
        { moTa: 'Trượt thiếu 1 ô (slide_r(1)) đã xúc đá: xúc hụt', baiLam: bai(['slide_r(1)', 'load()', 'wait()', 'throw()', 'wait()']), phaiCoMa: ['nap-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau slide_r(2), tảng đá đã nằm ngay trước mũi xe.', 'Luna: Gọi load(), wait(), throw(), wait() để xúc và hất đá vào đích.']
    }),

    manMayNem({
      so: 14, ten: 'Chế hàm hất đá lob', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['slide_r'], taoHam: ['lob'],
      deBai: 'Sola nhờ bạn: có ba tảng đá xếp dọc theo ba cột. Hãy vào Xưởng hàm tạo hàm lob() gồm bốn dòng: load(), wait(), throw(), wait(). Sau đó dùng lob() và slide_r(2) để hất cả ba tảng đá vào ba ô đích.',
      veMaMau: 'Chương trình chính đã gọi lob() ở tảng đá đầu tiên. Hãy tạo hàm lob() trong Xưởng hàm rồi viết tiếp cho hai tảng đá còn lại.',
      san: ['#######', '#D#D#D#', '#o#o#o#', '#.....#'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['lob()']),
      loiGiai: bai(['lob()', 'slide_r(2)', 'lob()', 'slide_r(2)', 'lob()'], { hamCuaEmMoi: [H('lob', [], T_LOB)] }),
      sao: { o: 12, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for 2 lần cho hai tảng đá đầu rồi gọi lob() cuối',
        baiLam: bai(['for i in range(2):', '    lob()', '    slide_r(2)', 'lob()']),
        hamCuaEmMoi: [H('lob', [], T_LOB)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm lob() trong Xưởng hàm mà đã bấm Chạy', baiLam: bai(['lob()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ hất tảng đá đầu tiên mà chưa trượt sang hai tảng tiếp theo', baiLam: bai(['lob()']), hamCuaEmMoi: [H('lob', [], T_LOB)], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Viết thẳng toàn bộ load, wait, throw không dùng hàm lob làm tràn 10 ô', baiLam: bai([].concat(T_LOB, ['slide_r(2)'], T_LOB, ['slide_r(2)'], T_LOB)), phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Luna: Thân hàm lob() gồm: load(), wait(), throw(), wait().', 'Luna: Trong chương trình chính: lob(), slide_r(2), lob(), slide_r(2), lob().']
    }),

    manMayNem({
      so: 15, ten: 'Chở đá trên máng', hang: 'luyen', hamCuaEmCan: ['slide_r'],
      deBai: 'Sola nhờ bạn: tảng đá nằm ở cột bên trái nhưng ô đích lại nằm bên kia hàng rào ở cột bên phải cách đó 3 ô. Khi đã load() đá vào máng, xe trượt ngang thì đá đi theo xe. Hãy xúc đá, trượt phải 3 ô rồi mới throw() qua hàng rào vào đích.',
      veMaMau: 'Chương trình có sẵn đã xúc đá vào máng. Hãy trượt phải 3 ô rồi hất đá qua rào.',
      san: ['######', '####D#', '#o##=#', '#....#'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['load()', 'wait()']),
      loiGiai: bai(['load()', 'wait()', 'slide_r(3)', 'throw()', 'wait()']),
      sao: { o: 8, nhip: 5 },
      loiGiaiKhac: {
        moTa: 'Trượt phải 2 ô rồi thêm 1 ô bằng slide_right()',
        baiLam: bai(['load()', 'wait()', 'slide_r(2)', 'slide_right()', 'wait()', 'throw()', 'wait()'])
      },
      loiSai: [
        { moTa: 'Hất đá ngay tại cột trái trước khi trượt: đá đập vào tường vỡ', baiLam: bai(['load()', 'wait()', 'throw()', 'wait()', 'slide_r(3)']), phaiCoMa: ['nem-vo'] },
        { moTa: 'Trượt phải 3 ô trước rồi mới load(): ở cột phải là hàng rào nên xúc hụt', baiLam: bai(['slide_r(3)', 'load()', 'wait()', 'throw()', 'wait()']), phaiCoMa: ['nap-hut', 'chua-dua-vat'] },
        { moTa: 'Trượt thiếu 1 ô (slide_r(2)) đã throw(): đá rơi vào tường', baiLam: bai(['load()', 'wait()', 'slide_r(2)', 'throw()', 'wait()']), phaiCoMa: ['nem-vo'] }
      ],
      goiY: ['Luna: Đá nằm trong máng đi theo xe khi xe trượt ngang.', 'Luna: Sau load() và wait(), gọi slide_r(3) rồi throw(), wait().']
    }),

    manMayNem({
      so: 16, ten: 'Hai chuyến chở đá', hang: 'luyen', hamCuaEmCan: ['slide_r', 'slide_l'],
      deBai: 'Sola nhờ bạn: hai tảng đá nằm ở bên trái, còn hai ô đích nằm bên kia hàng rào ở bên phải. Xúc tảng thứ nhất, trượt phải 2 ô rồi hất qua rào vào đích đầu; sau đó trượt trái 1 ô về trước tảng thứ hai, xúc lên, trượt phải 2 ô rồi hất vào đích thứ hai.',
      veMaMau: 'Chương trình có sẵn đã đưa tảng đá đầu tiên vào đích. Hãy trượt trái 1 ô để lấy tảng thứ hai và đưa vào đích còn lại.',
      san: ['######', '###DD#', '#oo==#', '#....#'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['load()', 'wait()', 'slide_r(2)', 'throw()', 'wait()']),
      loiGiai: bai(['load()', 'wait()', 'slide_r(2)', 'throw()', 'wait()', 'slide_l(1)', 'load()', 'wait()', 'slide_r(2)', 'throw()', 'wait()']),
      khung: { chinh: 12, moiHam: 10, cauTruc: CAU_TRUC },
      sao: { o: 17, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for 2 lần, cuối mỗi lượt trượt trái 1 ô',
        baiLam: bai(['for i in range(2):', '    load()', '    wait()', '    slide_r(2)', '    throw()', '    wait()', '    slide_l(1)'])
      },
      loiSai: [
        { moTa: 'Chỉ hất tảng đá đầu tiên mà chưa lấy tảng thứ hai', baiLam: bai(['load()', 'wait()', 'slide_r(2)', 'throw()', 'wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên slide_l(1) để lùi về cột 2 lấy tảng đá thứ hai: xúc hụt', baiLam: bai(['load()', 'wait()', 'slide_r(2)', 'throw()', 'wait()', 'load()', 'wait()', 'slide_r(2)', 'throw()', 'wait()']), phaiCoMa: ['nap-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau khi hất tảng đầu ở cột 3, tảng thứ hai đang ở cột 2 nên cần slide_l(1).', 'Luna: Có thể dùng vòng lặp for i in range(2) để làm gọn cả hai chuyến.']
    }),

    manMayNem({
      so: 17, ten: 'Danh sách khoảng trượt', hang: 'bien-the', hamCuaEmCan: ['slide_r', 'lob'],
      deBai: 'Sola nhờ bạn: ba tảng đá đặt cách nhau theo danh sách s = [1, 2, 2]. Duyệt từng số n trong s: trượt phải n ô tới trước tảng đá rồi gọi lob() để hất vào đích.',
      veMaMau: 'Chương trình có sẵn đã khai báo s = [1, 2, 2] và vòng lặp for n in s. Hãy thêm lệnh gọi lob() vào thân vòng lặp.',
      san: ['#######', '##D#D#D', '##o#o#o', '#......'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['s = [1, 2, 2]', 'for n in s:', '    slide_r(n)']),
      loiGiai: bai(['s = [1, 2, 2]', 'for n in s:', '    slide_r(n)', '    lob()']),
      sao: { o: 11, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Duyệt theo chỉ số i trong range(len(s))',
        baiLam: bai(['s = [1, 2, 2]', 'for i in range(len(s)):', '    slide_r(s[i])', '    lob()'])
      },
      loiSai: [
        { moTa: 'Chưa gọi lob() trong vòng lặp: xe chỉ trượt qua các tảng đá', baiLam: bai(['s = [1, 2, 2]', 'for n in s:', '    slide_r(n)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đặt lob() ở ngoài vòng lặp for: chỉ hất được tảng đá cuối cùng', baiLam: bai(['s = [1, 2, 2]', 'for n in s:', '    slide_r(n)', 'lob()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi lob() trước slide_r(n): xúc hụt ở ngay ô xuất phát', baiLam: bai(['s = [1, 2, 2]', 'for n in s:', '    lob()', '    slide_r(n)']), phaiCoMa: ['nap-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong thân vòng lặp for n in s:, sau slide_r(n) xe đã đứng ngay trước tảng đá.', 'Luna: Thụt lề dòng lob() vào trong vòng lặp for.']
    }),

    manMayNem({
      so: 18, ten: 'Dọn đá mở đường', hang: 'bien-the', mucTieu: 'toi-co', hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left'],
      deBai: 'Sola nhờ bạn: một tảng đá chắn ngang hành lang hẹp dẫn lên lá cờ. Hãy tiến 1 ô tới trước tảng đá, xúc nó vào máng, quay phải hất qua hàng rào vào hốc trống bên phải, rồi quay trái lại và tiến 3 ô lên cờ.',
      veMaMau: 'Chương trình có sẵn mới tiến 1 ô và xúc tảng đá lên. Hãy quay phải hất đá sang hốc bên phải rồi quay lại đi tới cờ.',
      san: ['##F###', '##.###', '##o###', '##.=.#', '##.###'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: bai(['move()', 'load()', 'wait()']),
      loiGiai: bai(['move()', 'load()', 'wait()', 'turn_right()', 'throw()', 'wait()', 'turn_left()', 'forward(3)']),
      sao: { o: 17, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng ba lệnh move() thay cho forward(3)',
        baiLam: bai(['move()', 'load()', 'wait()', 'turn_right()', 'throw()', 'wait()', 'turn_left()', 'move()', 'move()', 'move()'])
      },
      loiSai: [
        { moTa: 'Xúc đá xong đứng yên chưa hất và chưa đi tới cờ', baiLam: bai(['move()', 'load()', 'wait()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hất thẳng lên phía trước thay vì quay phải: đá rơi ngay vào ô trước cờ chắn đường xe', baiLam: bai(['move()', 'load()', 'wait()', 'throw()', 'wait()', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quay phải hất đá xong quên turn_left() mà gọi forward(3) luôn: xe đâm vào hàng rào', baiLam: bai(['move()', 'load()', 'wait()', 'turn_right()', 'throw()', 'wait()', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Đứng ở (2, 3), quay phải (turn_right()) rồi throw(), wait() sẽ hất đá qua rào vào ô (4, 3).', 'Luna: Hất xong nhớ turn_left() để quay mặt lên rồi forward(3) tới cờ.']
    }),

    manMayNem({
      so: 19, ten: 'Bản đồ hai tầng hất đá', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob'],
      deBai: 'Sola nhờ bạn: lưới g = [[2, 1], [2, 2]] ghi đường lên hai bậc mỏ, ở đầu mỗi bậc đều có một tảng đá chờ hất vào đích. Với mỗi hàng r trong g: trượt phải r[0] ô, tiến lên r[1] ô rồi gọi lob() để hất đá vào đích.',
      veMaMau: 'Chương trình có sẵn đã trượt phải r[0] và tiến lên r[1] theo từng hàng của g. Thêm lob() vào cuối vòng lặp.',
      san: ['####D#', '####o#', '##D..#', '##o..#', '##...#', '...###'],
      batDau: { x: 0, y: 5, huong: 0 },
      maMau: bai(['g = [[2, 1], [2, 2]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])']),
      loiGiai: bai(['g = [[2, 1], [2, 2]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])', '    lob()']),
      sao: { o: 17, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Dùng hàm run_row(r) đã chế ở gói 1 rồi gọi lob()',
        baiLam: bai(['g = [[2, 1], [2, 2]]', 'for r in g:', '    run_row(r)', '    lob()'])
      },
      loiSai: [
        { moTa: 'Chưa thêm lob() vào vòng lặp: xe chỉ đi qua hai bậc mà không hất đá', baiLam: bai(['g = [[2, 1], [2, 2]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi lob() trước khi tiến lên r[1] ô: xúc hụt vì chưa tới trước tảng đá', baiLam: bai(['g = [[2, 1], [2, 2]]', 'for r in g:', '    slide_r(r[0])', '    lob()', '    forward(r[1])']), phaiCoMa: ['nap-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau slide_r(r[0]) và forward(r[1]), xe đứng ngay dưới tảng đá của bậc đó.', 'Luna: Thêm dòng lob() thụt lề bên trong vòng lặp for r in g.']
    }),

    manMayNem({
      so: 20, ten: 'Ba bậc đá mỏ', hang: 'trum', hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob'],
      huyHieu: { ma: 'may-nem', ten: 'Huy hiệu Hất đá qua rào' },
      deBai: 'Sola nhờ bạn: trùm chương Hất đá qua rào có ba tảng đá trên ba bậc mỏ theo lưới g = [[1, 1], [2, 1], [2, 2]]. Ở mỗi bậc r trong g, trượt phải r[0] ô, tiến lên r[1] ô rồi gọi lob() để hất cả ba tảng đá vào ba ô đích.',
      veMaMau: 'Chương trình có sẵn đã khai báo lưới g. Hãy viết vòng lặp duyệt từng hàng r trong g để đi tới từng tảng đá và gọi lob().',
      san: ['#####D#', '#####o#', '###D..#', '#D#o..#', '#o....#', '#...###', '..#####'],
      batDau: { x: 0, y: 6, huong: 0 },
      maMau: bai(['g = [[1, 1], [2, 1], [2, 2]]']),
      loiGiai: bai(['g = [[1, 1], [2, 1], [2, 2]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])', '    lob()']),
      sao: { o: 17, nhip: 15 },
      loiGiaiKhac: {
        moTa: 'Gọi run_row(r) kết hợp lob() trong vòng lặp',
        baiLam: bai(['g = [[1, 1], [2, 1], [2, 2]]', 'for r in g:', '    run_row(r)', '    lob()'])
      },
      loiSai: [
        { moTa: 'Chưa viết vòng lặp duyệt lưới g', baiLam: bai(['g = [[1, 1], [2, 1], [2, 2]]']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi lob() ở cuối mỗi vòng lặp', baiLam: bai(['g = [[1, 1], [2, 1], [2, 2]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đặt lob() ở ngoài vòng lặp for: chỉ hất được tảng đá cuối cùng', baiLam: bai(['g = [[1, 1], [2, 1], [2, 2]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])', 'lob()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Duyệt for r in g: rồi lần lượt gọi slide_r(r[0]), forward(r[1]) và lob().', 'Luna: Có thể gọi run_row(r) rồi lob() trong vòng lặp.']
    }),

    /* ================================================= chương che-may-nem: Chế lệnh: hất đá (10 màn: 11..20) ================================================= */
    manCheNem({
      so: 11, ten: 'Hất xong trượt tiếp', hang: 'lam-quen', canHam: 'tran-khung', hamCuaEmCan: ['slide_r', 'lob'], taoHam: ['lob_r'],
      deBai: 'Sola nhờ bạn: chế hàm lob_r(n) để hất tảng đá trước mũi bằng lob() rồi trượt phải n ô sang cột tiếp theo. Dùng lob_r(2) hai lần rồi lob() ở cột cuối để hất ba tảng đá vào đích.',
      veMaMau: 'Chương trình chính đã viết sẵn lời gọi lob_r(2) và lob(). Hãy vào Xưởng hàm tạo hàm lob_r(n).',
      san: ['#######', '#D#D#D#', '#o#o#o#', '#.....#'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['lob_r(2)', 'lob_r(2)', 'lob()']),
      loiGiai: bai(['lob_r(2)', 'lob_r(2)', 'lob()'], { hamCuaEmMoi: [H('lob_r', ['n'], T_LOB_R)] }),
      sao: { o: 12, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Lặp 2 lần lob_r(2) bằng for rồi gọi lob()',
        baiLam: bai(['for i in range(2):', '    lob_r(2)', 'lob()']),
        hamCuaEmMoi: [H('lob_r', ['n'], T_LOB_R)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm lob_r mà đã bấm Chạy', baiLam: bai(['lob_r(2)', 'lob_r(2)', 'lob()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân lob_r(n) trượt trước rồi mới lob(): bỏ sót tảng đá đầu tiên', baiLam: bai(['lob_r(2)', 'lob_r(2)', 'lob()']), hamCuaEmMoi: [H('lob_r', ['n'], ['slide_r(n)', 'lob()'])], phaiCoMa: ['nap-hut', 'chua-dua-vat'] },
        { moTa: 'Thân lob_r(n) trượt cứng 1 ô thay vì n ô: xúc hụt ở lần thứ hai', baiLam: bai(['lob_r(2)', 'lob_r(2)', 'lob()']), hamCuaEmMoi: [H('lob_r', ['n'], ['lob()', 'slide_r(1)'])], phaiCoMa: ['nap-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Hàm lob_r có tham số n.', 'Luna: Thân hàm lob_r(n) chỉ gồm hai dòng: lob() rồi slide_r(n).']
    }),

    manCheNem({
      so: 12, ten: 'Xúc đá trượt ngang rồi hất', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['slide_r', 'slide_l'], taoHam: ['slide_lob'],
      deBai: 'Sola nhờ bạn: chế hàm slide_lob(n) để xúc tảng đá trước mũi (load(), wait()), trượt phải n ô mang theo đá, rồi hất qua rào (throw(), wait()). Dùng slide_lob(2) để đưa hai tảng đá bên trái sang hai ô đích bên phải.',
      veMaMau: 'Chương trình chính đã gọi slide_lob(2), trượt trái 1 ô rồi gọi slide_lob(2) lần nữa. Hãy tạo hàm slide_lob(n) trong Xưởng hàm.',
      san: ['######', '###DD#', '#oo==#', '#....#'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['slide_lob(2)', 'slide_l(1)', 'slide_lob(2)']),
      loiGiai: bai(['slide_lob(2)', 'slide_l(1)', 'slide_lob(2)'], { hamCuaEmMoi: [H('slide_lob', ['n'], T_SLIDE_LOB)] }),
      sao: { o: 14, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for 2 lần gọi slide_lob(2) và slide_l(1)',
        baiLam: bai(['for i in range(2):', '    slide_lob(2)', '    slide_l(1)']),
        hamCuaEmMoi: [H('slide_lob', ['n'], T_SLIDE_LOB)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm slide_lob mà đã bấm Chạy', baiLam: bai(['slide_lob(2)', 'slide_l(1)', 'slide_lob(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong slide_lob(n) gọi throw() trước khi slide_r(n): đá đập vào tường', baiLam: bai(['slide_lob(2)', 'slide_l(1)', 'slide_lob(2)']), hamCuaEmMoi: [H('slide_lob', ['n'], ['load()', 'wait()', 'throw()', 'wait()', 'slide_r(n)'])], phaiCoMa: ['nem-vo'] },
        { moTa: 'Quên wait() sau load() trong slide_lob(n): xe vừa xúc vừa trượt nên lệnh trượt bị bỏ', baiLam: bai(['slide_lob(2)', 'slide_l(1)', 'slide_lob(2)']), hamCuaEmMoi: [H('slide_lob', ['n'], ['load()', 'slide_r(n)', 'throw()', 'wait()'])], phaiCoMa: ['nem-vo'] }
      ],
      goiY: ['Luna: Thân hàm slide_lob(n) gồm 5 dòng: load(), wait(), slide_r(n), throw(), wait().', 'Luna: Nhớ đặt wait() sau load() trước khi gọi slide_r(n).']
    }),

    manCheNem({
      so: 13, ten: 'Sửa hàm chở đá khứ hồi', hang: 'luyen', hamCuaEmCan: ['slide_r', 'slide_l', 'slide_lob'],
      deBai: 'Sola viết vội, nhờ bạn sửa: hàm send_rock(n) của màn dùng để xúc đá, trượt phải n ô hất vào đích bằng slide_lob(n), rồi trượt trái về chỗ cũ. Nhưng thân hàm lại viết nhầm slide_r(n) ở dòng thứ hai khiến xe trượt tiếp sang phải. Hãy sửa lại hàm send_rock(n).',
      veMaMau: 'Mở hàm send_rock(n) của màn và đổi dòng thứ hai từ slide_r(n) thành slide_l(n).',
      san: ['#######', '###D#D#', '#o===.#', '#.....#'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['send_rock(2)'], { hamCuaMan: [H('send_rock', ['n'], ['slide_lob(n)', 'slide_r(n)'])] }),
      loiGiai: bai(['send_rock(2)'], { hamCuaMan: [H('send_rock', ['n'], ['slide_lob(n)', 'slide_l(n)'])] }),
      mucTieu: 'bong-mo',
      bongMo: { x: 1, y: 3, huong: 0, vat: [{ x: 3, y: 1 }] },
      sao: { o: 14, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Thêm một chú thích trong hàm send_rock(n)',
        baiLam: bai(['send_rock(2)'], { hamCuaMan: [H('send_rock', ['n'], ['# hất rồi lùi về', 'slide_lob(n)', 'slide_l(n)'])] })
      },
      loiSai: [
        { moTa: 'Không sửa hàm send_rock(n): xe trượt sang phải tới (5, 3) lệch bóng mờ', baiLam: bai(['send_rock(2)'], { hamCuaMan: [H('send_rock', ['n'], ['slide_lob(n)', 'slide_r(n)'])] }), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất dòng thứ hai trong send_rock(n): xe dừng ở (3, 3) chưa về bóng mờ', baiLam: bai(['send_rock(2)'], { hamCuaMan: [H('send_rock', ['n'], ['slide_lob(n)'])] }), phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Luna: Bóng mờ của xe nằm tại ô xuất phát (1, 3).', 'Luna: Đổi slide_r(n) thành slide_l(n) trong hàm send_rock(n) để xe quay về (1, 3).']
    }),

    manCheNem({
      so: 14, ten: 'Chế hàm hất đá sang phải', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['move', 'turn_right', 'turn_left'], taoHam: ['lob_right'],
      deBai: 'Sola nhờ bạn: khi xe đi dọc hành lang đứng, tảng đá nằm trước mũi xe (phía trên) nhưng ô đích lại nằm bên phải hàng rào ngang tầm xe. Hãy chế hàm lob_right() để xúc đá trước mũi, quay phải (turn_right()), hất đá sang phải 2 ô qua rào, rồi quay trái (turn_left()) trở lại hướng lên.',
      veMaMau: 'Chương trình chính đã gọi lob_right(), tiến 2 ô rồi gọi lob_right() lần nữa. Hãy tạo hàm lob_right() trong Xưởng hàm.',
      san: ['#####', '#o###', '#.=D#', '#o###', '#.=D#'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['lob_right()', 'move()', 'move()', 'lob_right()']),
      loiGiai: bai(['lob_right()', 'move()', 'move()', 'lob_right()'], { hamCuaEmMoi: [H('lob_right', [], T_LOB_RIGHT)] }),
      sao: { o: 17, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng forward(2) thay cho hai lệnh move()',
        baiLam: bai(['lob_right()', 'forward(2)', 'lob_right()']),
        hamCuaEmMoi: [H('lob_right', [], T_LOB_RIGHT)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm lob_right mà đã bấm Chạy', baiLam: bai(['lob_right()', 'move()', 'move()', 'lob_right()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong lob_right() quay phải trước rồi mới load(): xúc vào hàng rào bên phải nên xúc hụt', baiLam: bai(['lob_right()', 'move()', 'move()', 'lob_right()']), hamCuaEmMoi: [H('lob_right', [], ['turn_right()', 'load()', 'wait()', 'throw()', 'wait()', 'turn_left()'])], phaiCoMa: ['nap-hut', 'chua-dua-vat'] },
        { moTa: 'Quên turn_left() ở cuối lob_right(): xe giữ nguyên mặt hướng phải nên đâm vào rào khi move()', baiLam: bai(['lob_right()', 'move()', 'move()', 'lob_right()']), hamCuaEmMoi: [H('lob_right', [], ['load()', 'wait()', 'turn_right()', 'throw()', 'wait()'])], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Phải load() và wait() khi mặt xe còn hướng lên vào tảng đá.', 'Luna: Sau đó turn_right(), throw(), wait(), rồi turn_left() để trả lại hướng mặt.']
    }),

    manCheNem({
      so: 15, ten: 'Vừa dọn đá vừa tiến lên', hang: 'luyen', hamCuaEmCan: ['move', 'lob_right'],
      deBai: 'Sola nhờ bạn: ba tảng đá chắn dọc lối đi lên mỏ, bên phải mỗi vị trí đứng của xe là hàng rào và ô đích. Ở mỗi bước, gọi lob_right() để xúc tảng đá trước mặt hất sang ô đích bên phải, rồi gọi move() tiến vào ô vừa dọn trống. Lặp 3 lần để dọn sạch cả ba tảng đá.',
      veMaMau: 'Chương trình có sẵn mới lặp 3 lần move() nên đâm vào tảng đá đầu tiên. Hãy gọi lob_right() trước move() trong vòng lặp.',
      san: ['#####', '#.###', '#o=D#', '#o=D#', '#o=D#', '#.=D#'],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: bai(['for i in range(3):', '    move()']),
      loiGiai: bai(['for i in range(3):', '    lob_right()', '    move()']),
      sao: { o: 16, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Viết tường minh 3 lần lob_right() và move()',
        baiLam: bai(['lob_right()', 'move()', 'lob_right()', 'move()', 'lob_right()', 'move()'])
      },
      loiSai: [
        { moTa: 'Không sửa gì: xe đâm vào tảng đá đầu tiên', baiLam: bai(['for i in range(3):', '    move()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Gọi nhầm lob() thay vì lob_right(): hất đá thẳng vào tảng đá phía trên làm vỡ đá', baiLam: bai(['for i in range(3):', '    lob()', '    move()']), phaiCoMa: ['nem-vo'] },
        { moTa: 'Chỉ lặp range(2): còn sót tảng đá thứ ba trên cùng', baiLam: bai(['for i in range(2):', '    lob_right()', '    move()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi gọi lob_right(), tảng đá ngay trước mặt được xúc lên và hất sang phải, ô trước mặt trống ra.', 'Luna: Ngay sau lob_right(), gọi move() để tiến lên sát tảng đá kế tiếp.']
    }),

    manCheNem({
      so: 16, ten: 'Hàm hất đá theo danh sách', hang: 'bien-the', hamCuaEmCan: ['slide_r', 'lob'], taoHam: ['lob_row'],
      deBai: 'Sola nhờ bạn: chế hàm lob_row(r) nhận một danh sách khoảng trượt r, duyệt từng số n trong r: trượt phải n ô (slide_r(n)) rồi hất đá (lob()). Chương trình chính sẽ gọi lob_row([1, 2, 2]).',
      veMaMau: 'Chương trình chính đã gọi lob_row([1, 2, 2]). Hãy vào Xưởng hàm tạo hàm lob_row(r).',
      san: ['#######', '##D#D#D', '##o#o#o', '#......'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['lob_row([1, 2, 2])']),
      loiGiai: bai(['lob_row([1, 2, 2])'], { hamCuaEmMoi: [H('lob_row', ['r'], T_LOB_ROW)] }),
      sao: { o: 11, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Duyệt theo chỉ số i trong thân hàm lob_row(r)',
        baiLam: bai(['lob_row([1, 2, 2])']),
        hamCuaEmMoi: [H('lob_row', ['r'], ['for i in range(len(r)):', '    slide_r(r[i])', '    lob()'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm lob_row mà đã bấm Chạy', baiLam: bai(['lob_row([1, 2, 2])']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong lob_row(r) gọi lob() trước slide_r(n): xúc hụt ngay từ đầu', baiLam: bai(['lob_row([1, 2, 2])']), hamCuaEmMoi: [H('lob_row', ['r'], ['for n in r:', '    lob()', '    slide_r(n)'])], phaiCoMa: ['nap-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Hàm lob_row có một tham số r.', 'Luna: Trong thân lob_row(r), viết for n in r: rồi thụt lề hai dòng slide_r(n) và lob().']
    }),

    manCheNem({
      so: 17, ten: 'Hai tầng danh sách đá', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'slide_r', 'slide_l', 'lob', 'lob_row'],
      deBai: 'Sola nhờ bạn: mỏ đá có hai tầng, mỗi tầng có hai tảng đá theo một hàng trong lưới g = [[1, 2], [1, 2]]. Sau khi gọi lob_row(g[0]) ở tầng dưới, hãy trượt trái 3 ô về cột đầu, tiến lên 3 ô sang tầng trên rồi gọi lob_row(g[1]).',
      veMaMau: 'Chương trình có sẵn đã xử lý tầng dưới bằng lob_row(g[0]). Hãy đưa xe lên đầu tầng trên và gọi lob_row(g[1]).',
      san: ['#####', '.D#D#', '.o#o#', '....#', '.D#D#', '.o#o#', '.....'],
      batDau: { x: 0, y: 6, huong: 0 },
      maMau: bai(['g = [[1, 2], [1, 2]]', 'lob_row(g[0])']),
      loiGiai: bai(['g = [[1, 2], [1, 2]]', 'lob_row(g[0])', 'slide_l(3)', 'forward(3)', 'lob_row(g[1])']),
      sao: { o: 23, nhip: 20 },
      loiGiaiKhac: {
        moTa: 'Truyền trực tiếp [1, 2] cho hai lần gọi lob_row',
        baiLam: bai(['lob_row([1, 2])', 'slide_l(3)', 'forward(3)', 'lob_row([1, 2])'])
      },
      loiSai: [
        { moTa: 'Chưa đưa xe lên tầng trên để hất hai tảng đá còn lại', baiLam: bai(['g = [[1, 2], [1, 2]]', 'lob_row(g[0])']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên slide_l(3) trước khi tiến lên: đâm vào tường tầng dưới', baiLam: bai(['g = [[1, 2], [1, 2]]', 'lob_row(g[0])', 'forward(3)', 'lob_row(g[1])']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Chỉ tiến 2 ô thay vì 3 ô: chưa tới hàng đứng của tầng trên', baiLam: bai(['g = [[1, 2], [1, 2]]', 'lob_row(g[0])', 'slide_l(3)', 'forward(2)', 'lob_row(g[1])']), phaiCoMa: ['nap-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau lob_row(g[0]), xe đang ở (3, 6); gọi slide_l(3) để về cột 0.', 'Luna: Từ (0, 6) gọi forward(3) lên (0, 3) rồi gọi lob_row(g[1]).']
    }),

    manCheNem({
      so: 18, ten: 'Chở đá trượt trên băng', hang: 'bien-the', hamCuaEmCan: ['slide_r', 'slide_l', 'slide_lob'],
      deBai: 'Sola nhờ bạn: hành lang ngang có băng chuyền đẩy sang phải. Khi gọi slide_lob(n) trên băng chuyền, mỗi nhịp trượt xuôi băng đưa xe (cùng tảng đá trong máng) đi 2 ô. Hãy chọn đúng đối số cho slide_lob để đưa tảng đá từ cột 1 sang cột 5 (cách 4 ô) chỉ với 2 nhịp trượt.',
      veMaMau: 'Chạy thử bản có sẵn: slide_lob(1) mới trượt 1 nhịp tới cột 3 đã hất đá vào tường. Hãy sửa số trong ngoặc.',
      san: ['#######', '#####D#', '#o###=#', '#.>>>.#'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['slide_lob(1)']),
      loiGiai: bai(['slide_lob(2)']),
      sao: { o: 9, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Viết trực tiếp load, wait, slide_r(2), throw, wait',
        baiLam: bai(['load()', 'wait()', 'slide_r(2)', 'throw()', 'wait()'])
      },
      loiSai: [
        { moTa: 'Giữ nguyên slide_lob(1): mới tới cột 3 đã hất đá vào tường', baiLam: bai(['slide_lob(1)']), phaiCoMa: ['nem-vo'] },
        { moTa: 'Đếm theo số ô thành slide_lob(4): xe đâm tường bên phải 2 lần mới hất đá', baiLam: bai(['slide_lob(4)']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Luna: Từ cột 1 sang cột 5 là 4 ô, nhưng có băng chuyền đẩy sang phải.', 'Luna: Đi xuôi băng mỗi nhịp trượt được 2 ô nên chỉ cần slide_lob(2).']
    }),

    manCheNem({
      so: 19, ten: 'Hai màu đá đúng đích', hang: 'bien-the', hamCuaEmCan: ['slide_r', 'slide_l', 'slide_lob'],
      deBai: 'Sola nhờ bạn: tảng đá đỏ ở cột 1 cần vào ô đích đỏ ở cột 3, còn tảng đá xanh dương ở cột 2 cần vào ô đích xanh dương ở cột 4. Mỗi tảng đều cần trượt sang phải 2 ô sau khi xúc. Hãy dùng slide_lob(2) và slide_l(1) để đặt cả hai tảng đá đúng màu đích.',
      veMaMau: 'Chương trình có sẵn mới đưa tảng đá đỏ sang đích đỏ. Hãy trượt trái 1 ô về cột 2 rồi dùng slide_lob(2) cho tảng đá xanh dương.',
      san: ['######', '###DD#', '#oo==#', '#....#'],
      vatMau: ['......', '......', '.rb...', '......'],
      mau: ['......', '...rb.', '......', '......'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['slide_lob(2)']),
      loiGiai: bai(['slide_lob(2)', 'slide_l(1)', 'slide_lob(2)']),
      sao: { o: 14, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Lặp 2 lần slide_lob(2) và slide_l(1)',
        baiLam: bai(['for i in range(2):', '    slide_lob(2)', '    slide_l(1)'])
      },
      loiSai: [
        { moTa: 'Chưa đưa tảng đá xanh dương vào đích', baiLam: bai(['slide_lob(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trượt phải 3 ô cho tảng đá đỏ (slide_lob(3)): đá đỏ rơi vào đích xanh dương nên sai màu', baiLam: bai(['slide_lob(3)', 'slide_l(2)', 'slide_lob(1)']), phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Cả hai tảng đá đều nằm cách ô đích cùng màu của nó đúng 2 cột về bên phải.', 'Luna: Sau slide_lob(2) đầu tiên, gọi slide_l(1) rồi slide_lob(2) lần nữa.']
    }),

    manCheNem({
      so: 20, ten: 'Tổng tiến công mỏ đá', hang: 'trum', hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'slide_r', 'lob', 'lob_right', 'lob_row'],
      huyHieu: { ma: 'che-may-nem', ten: 'Huy hiệu Chế lệnh: hất đá' },
      deBai: 'Sola nhờ bạn: trùm cuối gói Tay hất đá! Tầng dưới có hai tảng đá theo danh sách [1, 2] chờ hất lên bằng lob_row([1, 2]). Sau đó trượt phải 1 ô sang lối đi cột 4, tiến lên 2 ô tới sát tảng đá thứ ba và gọi lob_right() để hất nó qua rào sang đích bên phải.',
      veMaMau: 'Chương trình có sẵn đã hất hai tảng đá tầng dưới bằng lob_row([1, 2]). Hãy trượt phải 1 ô, tiến lên 2 ô rồi gọi lob_right().',
      san: ['#######', '####o##', '#D#D.=D', '#o#o.##', '.....##'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: bai(['lob_row([1, 2])']),
      loiGiai: bai(['lob_row([1, 2])', 'slide_r(1)', 'forward(2)', 'lob_right()']),
      sao: { o: 27, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Dùng hai lệnh move() thay cho forward(2)',
        baiLam: bai(['lob_row([1, 2])', 'slide_r(1)', 'move()', 'move()', 'lob_right()'])
      },
      loiSai: [
        { moTa: 'Chỉ chạy lob_row([1, 2]) mà chưa lên xử lý tảng đá thứ ba', baiLam: bai(['lob_row([1, 2])']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên slide_r(1) trước khi tiến lên: đâm vào tảng đá vừa hất ở cột 3', baiLam: bai(['lob_row([1, 2])', 'forward(2)', 'lob_right()']), phaiCoMa: ['dam-tuong', 'nem-vo'] },
        { moTa: 'Dùng lob() thay vì lob_right() cho tảng đá thứ ba: hất thẳng ra ngoài sân thay vì sang phải', baiLam: bai(['lob_row([1, 2])', 'slide_r(1)', 'forward(2)', 'lob()']), phaiCoMa: ['nem-vo'] }
      ],
      goiY: ['Luna: Sau lob_row([1, 2]), xe đang đứng ở (3, 4); gọi slide_r(1) để sang lối đi ở (4, 4).', 'Luna: Gọi forward(2) để lên (4, 2) ngay dưới tảng đá thứ ba, rồi gọi lob_right().']
    })
  ];

  ManHoc.manHatDa = DS;
  if (laNode) module.exports = DS;
})();

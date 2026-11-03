/* ============================================================================
   man-radar-tron.js — "Robot Chấn Hưng": GÓI 3 MÙA 6 "RADAR TRÒN"
   Gồm 20 màn mới trên Máy mỏ đá R1 (thân omni + tay hất đá + radar tròn):
   - radar-tron.1..10 (10 màn chương radar-tron "Quét quanh một vòng")
   - che-radar-tron.1..10 (10 màn chương che-radar-tron "Chế lệnh: quét mỏ")
   Nạp sau man-hat-da.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC_RADAR = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar'];
  var ROBOT_RADAR = { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  function bai(chinh, Phu) {
    return {
      chinh: chinh,
      hamCuaMan: (Phu && Phu.hamCuaMan) || [],
      hamCuaEmMoi: (Phu && Phu.hamCuaEmMoi) || []
    };
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than }; }

  var T_LOB_IF = ['g = radar()', 't = g[0][1]', 'if t == "V":', '    lob()'];
  var T_CLEAR_STEP = ['g = radar()', 't = g[0][1]', 'if t == "V":', '    lob_right()', 'move()'];
  var T_SAFE_STEP = ['g = radar()', 't = g[0][1]', 'if t == "u":', '    slide_r(1)', 'move()'];
  var T_SEEK_LOB = ['g = radar()', 't = g[0][2]', 'if t == "V":', '    slide_r(1)', 'else:', '    slide_r(2)', 'lob()'];
  var T_SCAN_ROW = ['for i in range(n):', '    slide_r(1)', '    lob_if()'];
  var T_SMART_LOB = ['g = radar()', 't = g[0][2]', 'if t == "#":', '    slide_lob(2)', 'else:', '    lob()'];

  function manRadar(cfg) {
    return Object.assign({
      chuong: 'radar-tron',
      loaiRobot: 'omni',
      robot: ROBOT_RADAR,
      tamNemMacDinh: 2,
      hamGoc: HAM_GOC_RADAR,
      moXuong: true,
      mucTieu: 'toi-co',
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      taoHam: [],
      hamCuaEmCan: ['move', 'slide_r'],
      loiSai: [],
      goiY: [],
      phienBanNoiDung: 2
    }, cfg);
  }

  function manCheRadar(cfg) {
    return Object.assign({
      chuong: 'che-radar-tron',
      loaiRobot: 'omni',
      robot: ROBOT_RADAR,
      tamNemMacDinh: 2,
      hamGoc: HAM_GOC_RADAR,
      moXuong: true,
      mucTieu: 'dua-vat',
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      taoHam: [],
      hamCuaEmCan: ['move', 'slide_r', 'lob'],
      loiSai: [],
      goiY: [],
      phienBanNoiDung: 2
    }, cfg);
  }

  var DS = [
    /* ================================================= chương radar-tron: Quét quanh một vòng (10 màn: 1..10) ================================================= */
    manRadar({
      so: 1, ten: 'Mắt radar ba nhân ba', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'Sola làm mẫu: R1 vừa lắp thêm Radar tròn trên nóc. Lệnh radar() quét ngay lưới 3x3 quanh xe và trả về danh sách 2 chiều g, trong đó g[1][1] là ô xe đang đứng, hàng 0 là phía trên và cột 2 là bên phải. Bấm Chạy xem R1 thấy cờ ở góc trên phải g[0][2] rồi đi tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem radar() đọc lưới 3x3 quanh xe mà không tốn nhịp.',
      san: ['#####', '###F#', '#...#', '#####'],
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(['g = radar()', 't = g[0][2]', 'if t == "F":', '    slide_r(1)', '    move()']),
      loiGiai: bai(['g = radar()', 't = g[0][2]', 'if t == "F":', '    slide_r(1)', '    move()']),
      sao: { o: 10, nhip: 2 },
      goiY: ['Luna: radar() trả về lưới 3x3 quanh xe, không tốn nhịp.', 'Luna: g[0][2] là ô góc trên bên phải của xe.']
    }),

    manRadar({
      so: 2, ten: 'Nhìn hai bên tìm cờ', hang: 'lam-quen', hamCuaEmCan: ['slide_l', 'slide_r'],
      deBai: 'Sola nhờ bạn: màn này có hai sân thử, lá cờ có thể nằm ngay bên trái xe tại g[1][0] hoặc ngay bên phải xe tại g[1][2]. Hãy dùng radar() kiểm tra cả hai bên để trượt đúng về phía lá cờ.',
      veMaMau: 'Chương trình có sẵn mới kiểm tra bên trái g[1][0] == "F". Hãy thêm câu lệnh if kiểm tra bên phải g[1][2] == "F" để trượt phải 1 ô.',
      san: [
        ['#####', '#...#', '#F..#', '#####'],
        ['#####', '#...#', '#..F#', '#####']
      ],
      batDau: [{ x: 2, y: 2, huong: 0 }, { x: 2, y: 2, huong: 0 }],
      maMau: bai(['g = radar()', 't = g[1][0]', 'if t == "F":', '    slide_l(1)']),
      loiGiai: bai(['g = radar()', 't = g[1][0]', 'if t == "F":', '    slide_l(1)', 't = g[1][2]', 'if t == "F":', '    slide_r(1)']),
      sao: { o: 11, nhip: 1 },
      loiGiaiKhac: {
        moTa: 'Dùng if và else thay vì hai câu if rời',
        baiLam: bai(['g = radar()', 't = g[1][0]', 'if t == "F":', '    slide_l(1)', 'else:', '    slide_r(1)', 'wait()'])
      },
      loiSai: [
        { moTa: 'Chưa kiểm tra bên phải g[1][2]: đứng yên ở sân thứ hai', baiLam: bai(['g = radar()', 't = g[1][0]', 'if t == "F":', '    slide_l(1)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đoán mò trượt phải luôn không dùng radar(): thua ở sân thứ nhất', baiLam: bai(['slide_r(1)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Trong lưới 3x3 của radar(), g[1][0] là ô bên trái và g[1][2] là ô bên phải.', 'Luna: Thêm if g[1][2] == "F": rồi thụt lề slide_r(1).']
    }),

    manRadar({
      so: 3, ten: 'Né hố hai bên', hang: 'luyen', hamCuaEmCan: ['move', 'slide_l', 'slide_r'],
      deBai: 'Sola nhờ bạn: tiến lên 1 ô rồi dùng radar() quét xung quanh. Nếu ô bên trái g[1][0] là hố sâu ("u") thì trượt sang phải 1 ô, ngược lại trượt sang trái 1 ô, rồi tiến 1 ô lên cờ.',
      veMaMau: 'Chương trình có sẵn đã tiến 1 ô và đọc g = radar(). Hãy viết tiếp nhánh else và lệnh tiến lên cờ ở cuối.',
      san: [
        ['#####', '#..F#', '#u..#', '##.##'],
        ['#####', '#F..#', '#..u#', '##.##']
      ],
      batDau: [{ x: 2, y: 3, huong: 0 }, { x: 2, y: 3, huong: 0 }],
      maMau: bai(['move()', 'g = radar()', 't = g[1][0]', 'if t == "u":', '    slide_r(1)']),
      loiGiai: bai(['move()', 'g = radar()', 't = g[1][0]', 'if t == "u":', '    slide_r(1)', 'else:', '    slide_l(1)', 'move()']),
      sao: { o: 16, nhip: 3 },
      loiGiaiKhac: {
        moTa: 'Dùng hai câu if kiểm tra g[1][0] và g[1][2]',
        baiLam: bai(['move()', 'g = radar()', 't = g[1][0]', 'if t == "u":', '    slide_r(1)', 't = g[1][2]', 'if t == "u":', '    slide_l(1)', 'move()'])
      },
      loiSai: [
        { moTa: 'Thiếu nhánh else và thiếu move() cuối: chưa tới cờ', baiLam: bai(['move()', 'g = radar()', 't = g[1][0]', 'if t == "u":', '    slide_r(1)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Trượt nhầm vào phía có hố: xe rơi xuống hố', baiLam: bai(['move()', 'g = radar()', 't = g[1][0]', 'if t == "u":', '    slide_l(1)', 'else:', '    slide_r(1)', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['Luna: Ký hiệu "u" trong lưới radar() cho biết ô đó là hố sâu.', 'Luna: Sau khối if / else, nhớ gọi move() ở ngoài để tiến lên cờ.']
    }),

    manRadar({
      so: 4, ten: 'Dò tảng đá ở góc chéo', hang: 'luyen', mucTieu: 'dua-vat', hamCuaEmCan: ['slide_l', 'slide_r', 'lob'],
      deBai: 'Sola nhờ bạn: tảng đá ("V" trên radar) nằm ở hàng phía trước nhưng lệch sang cột bên trái (g[0][0]) hoặc cột bên phải (g[0][2]). Hãy dùng radar() xem đá ở bên nào để trượt sang cột đó rồi gọi lob() hất đá vào đích.',
      veMaMau: 'Chương trình có sẵn đã kiểm tra g[0][0] == "V" để trượt trái. Hãy thêm nhánh else trượt phải rồi gọi lob() ở cuối.',
      san: [
        ['#####', '#D###', '#o###', '#...#'],
        ['#####', '###D#', '###o#', '#...#']
      ],
      batDau: [{ x: 2, y: 3, huong: 0 }, { x: 2, y: 3, huong: 0 }],
      maMau: bai(['g = radar()', 't = g[0][0]', 'if t == "V":', '    slide_l(1)']),
      loiGiai: bai(['g = radar()', 't = g[0][0]', 'if t == "V":', '    slide_l(1)', 'else:', '    slide_r(1)', 'lob()']),
      sao: { o: 16, nhip: 3 },
      loiGiaiKhac: {
        moTa: 'Viết hai câu if riêng cho g[0][0] và g[0][2]',
        baiLam: bai(['g = radar()', 't = g[0][0]', 'if t == "V":', '    slide_l(1)', 't = g[0][2]', 'if t == "V":', '    slide_r(1)', 'lob()'])
      },
      loiSai: [
        { moTa: 'Chưa có nhánh else và chưa gọi lob()', baiLam: bai(['g = radar()', 't = g[0][0]', 'if t == "V":', '    slide_l(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi lob() trước khi trượt sang cột có đá: xúc hụt', baiLam: bai(['g = radar()', 'lob()', 't = g[0][0]', 'if t == "V":', '    slide_l(1)', 'else:', '    slide_r(1)']), phaiCoMa: ['nap-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Trên radar(), mọi vật hay tảng đá nằm trên sân đều hiện là "V".', 'Luna: g[0][0] là ô chéo trước-trái, còn g[0][2] là ô chéo trước-phải.']
    }),

    manRadar({
      so: 5, ten: 'Quét dọc hàng đá', hang: 'luyen', mucTieu: 'dua-vat', hamCuaEmCan: ['slide_r', 'lob'],
      deBai: 'Sola nhờ bạn: trượt qua 3 cột liên tiếp. Ở mỗi cột, dùng radar() kiểm tra ô ngay trước mũi xe g[0][1]: nếu thấy tảng đá ("V") thì gọi lob() để hất vào đích, sau đó trượt phải 1 ô sang cột kế tiếp.',
      veMaMau: 'Chương trình có sẵn đã lặp 3 lần và đọc g = radar(). Hãy kiểm tra nếu g[0][1] == "V" thì gọi lob(), rồi trượt phải 1 ô.',
      san: [
        ['######', '#D#D.#', '#o#o.#', '#....#'],
        ['######', '#.DD.#', '#.oo.#', '#....#']
      ],
      batDau: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 3, huong: 0 }],
      maMau: bai(['for i in range(3):', '    g = radar()', '    slide_r(1)']),
      loiGiai: bai(['for i in range(3):', '    g = radar()', '    t = g[0][1]', '    if t == "V":', '        lob()', '    slide_r(1)']),
      sao: { o: 12, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Dùng radar()[0][1] trực tiếp trong câu if',
        baiLam: bai(['g = 0', 'for i in range(3):', '    t = radar()', '    k = t[0][1]', '    if k == "V":', '        lob()', '    slide_r(1)'])
      },
      loiSai: [
        { moTa: 'Chỉ trượt qua 3 cột mà chưa hất đá', baiLam: bai(['for i in range(3):', '    g = radar()', '    slide_r(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi lob() ở mọi cột không kiểm tra radar: xúc hụt ở cột trống', baiLam: bai(['for i in range(3):', '    lob()', '    slide_r(1)']), phaiCoMa: ['nap-hut', 'nem-hut'] }
      ],
      goiY: ['Luna: Ô ngay trước mũi xe (khi mặt hướng lên) là g[0][1].', 'Luna: Chỉ gọi lob() bên trong khối if g[0][1] == "V":, còn slide_r(1) nằm ngoài if.']
    }),

    manRadar({
      so: 6, ten: 'Thấy đá chắn thì hất sang phải', hang: 'luyen', mucTieu: 'dua-vat', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'lob_right'],
      deBai: 'Sola nhờ bạn: đi dọc hành lang 3 bước. Ở mỗi bước, quét radar(): nếu ô trước mặt g[0][1] có tảng đá ("V") chắn lối thì gọi lob_right() để xúc đá hất qua rào sang ô đích bên phải, rồi mới move() tiến lên.',
      veMaMau: 'Chương trình có sẵn mới tiến thẳng nên đâm vào đá. Hãy thêm kiểm tra g[0][1] == "V" để gọi lob_right() trước move().',
      san: [
        ['#####', '#.###', '#o###', '#.=D#', '#o###', '#.=D#'],
        ['#####', '#.###', '#o###', '#o=D#', '#.=D#', '#...#']
      ],
      batDau: [{ x: 1, y: 5, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      maMau: bai(['for i in range(3):', '    g = radar()', '    move()']),
      loiGiai: bai(['for i in range(3):', '    g = radar()', '    t = g[0][1]', '    if t == "V":', '        lob_right()', '    move()']),
      sao: { o: 18, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Gán biến kiểm tra trước khi gọi lob_right() và move()',
        baiLam: bai(['g = 0', 'for i in range(3):', '    t = radar()', '    k = t[0][1]', '    if k == "V":', '        lob_right()', '    move()'])
      },
      loiSai: [
        { moTa: 'Chưa gọi lob_right() khi gặp đá: xe đâm vào tảng đá', baiLam: bai(['for i in range(3):', '    g = radar()', '    move()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Gọi lob_right() ở mọi bước không kiểm tra: xúc hụt ở ô trống', baiLam: bai(['for i in range(3):', '    lob_right()', '    move()']), phaiCoMa: ['nap-hut', 'nem-hut'] }
      ],
      goiY: ['Luna: Khi g[0][1] == "V", gọi lob_right() sẽ xúc tảng đá trước mặt và hất sang đích bên phải.', 'Luna: Sau khi hất xong, ô trước mặt đã trống nên gọi move() tiến lên được ngay.']
    }),

    manRadar({
      so: 7, ten: 'Đo bước trượt bằng góc radar', hang: 'bien-the', mucTieu: 'dua-vat', hamCuaEmCan: ['slide_r', 'lob'],
      deBai: 'Sola nhờ bạn: có hai tảng đá đặt cách nhau 1 hoặc 2 cột. Nhờ lưới 3x3 của radar(), ngay từ chỗ đang đứng bạn đã thấy ô chéo trước-phải g[0][2]: nếu g[0][2] == "V" thì tảng đá kế tiếp chỉ cách 1 cột (slide_r(1)), ngược lại nó cách 2 cột (slide_r(2)). Lặp 2 lần để hất cả hai tảng đá.',
      veMaMau: 'Chương trình có sẵn đã kiểm tra g[0][2] == "V" để trượt 1 ô. Hãy thêm nhánh else trượt 2 ô rồi gọi lob().',
      san: [
        ['######', '#D#D##', '#o#o##', '......'],
        ['######', '##DD##', '##oo##', '......']
      ],
      batDau: [{ x: 0, y: 3, huong: 0 }, { x: 0, y: 3, huong: 0 }],
      maMau: bai(['for i in range(2):', '    g = radar()', '    t = g[0][2]', '    if t == "V":', '        slide_r(1)']),
      loiGiai: bai(['for i in range(2):', '    g = radar()', '    t = g[0][2]', '    if t == "V":', '        slide_r(1)', '    else:', '        slide_r(2)', '    lob()']),
      sao: { o: 14, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Trượt 1 ô trước rồi kiểm tra g[0][1] xem đã tới đá chưa',
        baiLam: bai(['for i in range(2):', '    slide_r(1)', '    g = radar()', '    t = g[0][1]', '    if t != "V":', '        slide_r(1)', '    lob()'])
      },
      loiSai: [
        { moTa: 'Thiếu nhánh else và thiếu lob(): chưa hất đá', baiLam: bai(['for i in range(2):', '    g = radar()', '    t = g[0][2]', '    if t == "V":', '        slide_r(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Luôn trượt cứng 2 ô không dùng radar: bỏ sót tảng đá ở sân thứ nhất', baiLam: bai(['for i in range(2):', '    slide_r(2)', '    lob()']), phaiCoMa: ['nap-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Ô g[0][2] nằm ở hàng phía trước và lệch sang phải 1 cột so với xe.', 'Luna: Sau khối if / else chọn slide_r(1) hay slide_r(2), gọi lob() để hất đá.']
    }),

    manRadar({
      so: 8, ten: 'Lách tường lên cờ', hang: 'bien-the', mucTieu: 'toi-co', hamCuaEmCan: ['move', 'slide_r'],
      deBai: 'Sola nhờ bạn: đường lên cờ dài 3 hàng nhưng có một bức tường ("#") chắn ngang ở một trong các hàng. Trong vòng lặp 3 bước, hãy dùng radar() kiểm tra ô trước mặt g[0][1]: nếu gặp "#" thì trượt phải 1 ô để sang làn trống rồi mới move() tiến lên.',
      veMaMau: 'Chương trình có sẵn đã lặp 3 lần và đọc g = radar(). Hãy thêm if g[0][1] == "#": slide_r(1) trước lệnh move().',
      san: [
        ['#####', '##F##', '##.##', '#...#', '#...#'],
        ['#####', '##F##', '##.##', '##.##', '#...#']
      ],
      batDau: [{ x: 1, y: 4, huong: 0 }, { x: 1, y: 4, huong: 0 }],
      maMau: bai(['for i in range(3):', '    g = radar()', '    move()']),
      loiGiai: bai(['for i in range(3):', '    g = radar()', '    t = g[0][1]', '    if t == "#":', '        slide_r(1)', '    move()']),
      sao: { o: 11, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra trực tiếp radar()[0][1] == "#"',
        baiLam: bai(['g = 0', 'for i in range(3):', '    t = radar()', '    k = t[0][1]', '    if k == "#":', '        slide_r(1)', '    move()'])
      },
      loiSai: [
        { moTa: 'Chưa tránh tường trước khi tiến: xe đâm vào tường', baiLam: bai(['for i in range(3):', '    g = radar()', '    move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Trượt phải ở mọi bước kể cả khi không có tường: đâm tường bên phải', baiLam: bai(['for i in range(3):', '    slide_r(1)', '    move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Trên radar(), tường và hàng rào đều có ký hiệu "#".', 'Luna: Nếu g[0][1] == "#" thì gọi slide_r(1), sau đó gọi move().']
    }),

    manRadar({
      so: 9, ten: 'Phân biệt đá chắn và hố sâu', hang: 'bien-the', mucTieu: 'toi-co', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'slide_r', 'lob_right'],
      deBai: 'Sola nhờ bạn: trên đường tiến 3 bước lên cờ, xe sẽ gặp cả tảng đá ("V") lẫn hố sâu ("u") ở ô trước mặt g[0][1]. Nếu gặp đá ("V") thì gọi lob_right() để hất đá sang phải dọn đường; nếu gặp hố ("u") thì gọi slide_r(1) để né sang làn phải; sau đó gọi move() tiến lên.',
      veMaMau: 'Chương trình có sẵn đã xử lý trường hợp gặp đá g[0][1] == "V". Hãy thêm câu if cho trường hợp gặp hố g[0][1] == "u" rồi gọi move().',
      san: [
        ['######', '##F###', '#u..##', '#o..##', '#.=.##'],
        ['######', '##F###', '##o###', '#u.=.#', '#...##']
      ],
      batDau: [{ x: 1, y: 4, huong: 0 }, { x: 1, y: 4, huong: 0 }],
      maMau: bai(['for i in range(3):', '    g = radar()', '    t = g[0][1]', '    if t == "V":', '        lob_right()']),
      loiGiai: bai(['for i in range(3):', '    g = radar()', '    t = g[0][1]', '    if t == "V":', '        lob_right()', '    t = g[0][1]', '    if t == "u":', '        slide_r(1)', '    move()']),
      sao: { o: 23, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra hố trước rồi kiểm tra đá sau',
        baiLam: bai(['for i in range(3):', '    g = radar()', '    t = g[0][1]', '    k = g[0][1]', '    if t == "u":', '        slide_r(1)', '    elif k == "V":', '        lob_right()', '    move()'])
      },
      loiSai: [
        { moTa: 'Chưa né hố và chưa gọi move(): xe đứng yên', baiLam: bai(['for i in range(3):', '    g = radar()', '    t = g[0][1]', '    if t == "V":', '        lob_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ dọn đá mà quên né khi g[0][1] == "u": xe lao xuống hố', baiLam: bai(['for i in range(3):', '    g = radar()', '    t = g[0][1]', '    if t == "V":', '        lob_right()', '    move()']), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['Luna: Gặp "V" thì dọn đá bằng lob_right(), gặp "u" thì né sang phải bằng slide_r(1).', 'Luna: Cuối mỗi vòng lặp gọi move() để tiến lên một hàng.']
    }),

    manRadar({
      so: 10, ten: 'Trùm quét mỏ ba tầng', hang: 'trum', mucTieu: 'dua-vat', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'slide_r', 'lob_right'],
      huyHieu: { ma: 'radar-tron', ten: 'Huy hiệu Radar tròn' },
      deBai: 'Sola nhờ bạn: trùm chương Quét quanh một vòng có 3 tầng đá. Ở mỗi tầng trong 3 bước lặp: tiến lên 1 ô (move()), dùng radar() kiểm tra ô trước mặt g[0][1] xem đã đứng ngay dưới tảng đá ("V") chưa; nếu chưa ("V" nằm lệch bên phải) thì trượt phải 1 ô (slide_r(1)), rồi gọi lob_right() hất đá vào đích bên phải.',
      veMaMau: 'Chương trình có sẵn đã lặp 3 lần, tiến 1 ô và đọc g = radar(). Hãy kiểm tra nếu g[0][1] != "V" thì trượt phải 1 ô, rồi gọi lob_right().',
      san: [
        ['#######', '###o###', '##o.=D#', '#o.=D##', '#.=D###', '#.#####'],
        ['#######', '###o###', '##o.=D#', '##o=D##', '#..=D##', '#.#####']
      ],
      batDau: [{ x: 1, y: 5, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      maMau: bai(['for i in range(3):', '    move()', '    g = radar()']),
      loiGiai: bai(['for i in range(3):', '    move()', '    g = radar()', '    t = g[0][1]', '    if t != "V":', '        slide_r(1)', '    lob_right()']),
      sao: { o: 22, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra g[0][2] == "V" để biết đá lệch sang phải',
        baiLam: bai(['for i in range(3):', '    move()', '    g = radar()', '    t = g[0][2]', '    if t == "V":', '        slide_r(1)', '    lob_right()'])
      },
      loiSai: [
        { moTa: 'Chưa trượt sang cột có đá và chưa gọi lob_right()', baiLam: bai(['for i in range(3):', '    move()', '    g = radar()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên trượt phải khi g[0][1] != "V": xúc hụt ở tầng đá lệch phải', baiLam: bai(['for i in range(3):', '    move()', '    lob_right()']), phaiCoMa: ['nap-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau khi move() lên tầng mới, tảng đá nằm ở g[0][1] hoặc lệch phải ở g[0][2].', 'Luna: Nếu g[0][1] != "V", gọi slide_r(1) rồi gọi lob_right().']
    }),

    /* ================================================= chương che-radar-tron: Chế lệnh: quét mỏ (10 màn: 1..10) ================================================= */
    manCheRadar({
      so: 1, ten: 'Chế hàm gặp đá thì hất', hang: 'lam-quen', canHam: 'tran-khung', hamCuaEmCan: ['slide_r', 'lob'], taoHam: ['lob_if'],
      deBai: 'Sola nhờ bạn: chế hàm lob_if() dùng radar() kiểm tra ô trước mũi xe g[0][1], nếu thấy tảng đá ("V") thì gọi lob(). Sau đó lặp 3 lần: gọi lob_if() rồi trượt phải 1 ô.',
      veMaMau: 'Chương trình chính đã viết sẵn vòng lặp gọi lob_if() và slide_r(1). Hãy vào Xưởng hàm tạo hàm lob_if().',
      san: [
        ['######', '#D#D.#', '#o#o.#', '#....#'],
        ['######', '#.DD.#', '#.oo.#', '#....#']
      ],
      batDau: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 3, huong: 0 }],
      maMau: bai(['for i in range(3):', '    lob_if()', '    slide_r(1)']),
      loiGiai: bai(['for i in range(3):', '    lob_if()', '    slide_r(1)'], { hamCuaEmMoi: [H('lob_if', [], T_LOB_IF)] }),
      sao: { o: 13, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Gọi trực tiếp lob_if() và slide_r(1) từng bước',
        baiLam: bai(['lob_if()', 'slide_r(1)', 'lob_if()', 'slide_r(1)', 'lob_if()']),
        hamCuaEmMoi: [H('lob_if', [], T_LOB_IF)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm lob_if mà đã bấm Chạy', baiLam: bai(['for i in range(3):', '    lob_if()', '    slide_r(1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong lob_if() gọi thẳng lob() không kiểm tra radar: xúc hụt ở cột trống', baiLam: bai(['for i in range(3):', '    lob_if()', '    slide_r(1)']), hamCuaEmMoi: [H('lob_if', [], ['lob()'])], phaiCoMa: ['nap-hut', 'nem-hut'] },
        { moTa: 'Kiểm tra nhầm g[1][1] == "V" thay vì g[0][1] == "V": không hất tảng đá nào', baiLam: bai(['for i in range(3):', '    lob_if()', '    slide_r(1)']), hamCuaEmMoi: [H('lob_if', [], ['g = radar()', 't = g[1][1]', 'if t == "V":', '    lob()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Thân hàm lob_if() gồm: g = radar(), if g[0][1] == "V":, thụt lề lob().', 'Luna: Nhớ kiểm tra ô phía trước g[0][1] chứ không phải ô giữa g[1][1].']
    }),

    manCheRadar({
      so: 2, ten: 'Chế hàm dọn đá tiến lên', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'lob_right'], taoHam: ['clear_step'],
      deBai: 'Sola nhờ bạn: chế hàm clear_step() để quét radar(), nếu ô trước mặt g[0][1] có đá ("V") thì gọi lob_right() hất sang đích bên phải, sau đó gọi move() tiến lên 1 ô. Chương trình chính lặp 3 lần clear_step().',
      veMaMau: 'Chương trình chính đã gọi clear_step() 3 lần. Hãy vào Xưởng hàm tạo hàm clear_step().',
      san: [
        ['#####', '#.###', '#o###', '#.=D#', '#o###', '#.=D#'],
        ['#####', '#.###', '#o###', '#o=D#', '#.=D#', '#...#']
      ],
      batDau: [{ x: 1, y: 5, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      maMau: bai(['for i in range(3):', '    clear_step()']),
      loiGiai: bai(['for i in range(3):', '    clear_step()'], { hamCuaEmMoi: [H('clear_step', [], T_CLEAR_STEP)] }),
      sao: { o: 19, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Gọi 3 lần clear_step() liên tiếp',
        baiLam: bai(['clear_step()', 'clear_step()', 'clear_step()']),
        hamCuaEmMoi: [H('clear_step', [], T_CLEAR_STEP)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm clear_step mà đã bấm Chạy', baiLam: bai(['for i in range(3):', '    clear_step()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thụt lề nhầm move() vào trong khối if: khi không có đá xe đứng im', baiLam: bai(['for i in range(3):', '    clear_step()']), hamCuaEmMoi: [H('clear_step', [], ['g = radar()', 't = g[0][1]', 'if t == "V":', '    lob_right()', '    move()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi move() trước khi kiểm tra đá: xe đâm vào tảng đá', baiLam: bai(['for i in range(3):', '    clear_step()']), hamCuaEmMoi: [H('clear_step', [], ['move()', 'g = radar()', 't = g[0][1]', 'if t == "V":', '    lob_right()'])], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Luna: Trong clear_step(), kiểm tra if g[0][1] == "V": để gọi lob_right() trước.', 'Luna: Dòng move() đặt ở ngoài khối if để bước nào xe cũng tiến lên.']
    }),

    manCheRadar({
      so: 3, ten: 'Sửa hàm né hố tiến lên', hang: 'luyen', mucTieu: 'toi-co', hamCuaEmCan: ['move', 'slide_r'],
      deBai: 'Sola viết vội, nhờ bạn sửa: hàm safe_step() của màn dùng để kiểm tra nếu ô trước mặt g[0][1] là hố sâu ("u") thì trượt phải 1 ô né hố rồi tiến lên. Nhưng trong thân hàm đang viết nhầm điều kiện thành g[0][1] == "#" khiến xe lao thẳng xuống hố. Hãy sửa lại hàm safe_step().',
      veMaMau: 'Mở hàm safe_step() của màn và đổi "#" thành "u" trong điều kiện if.',
      san: [
        ['#####', '##F##', '##.##', '#u..#', '#...#'],
        ['#####', '##F##', '#u..#', '#...#', '#...#']
      ],
      batDau: [{ x: 1, y: 4, huong: 0 }, { x: 1, y: 4, huong: 0 }],
      maMau: bai(['for i in range(3):', '    safe_step()'], { hamCuaMan: [H('safe_step', [], ['g = radar()', 't = g[0][1]', 'if t == "#":', '    slide_r(1)', 'move()'])] }),
      loiGiai: bai(['for i in range(3):', '    safe_step()'], { hamCuaMan: [H('safe_step', [], T_SAFE_STEP)] }),
      sao: { o: 12, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Gọi 3 lần safe_step() tường minh',
        baiLam: bai(['safe_step()', 'safe_step()', 'safe_step()'], { hamCuaMan: [H('safe_step', [], T_SAFE_STEP)] })
      },
      loiSai: [
        { moTa: 'Không sửa hàm safe_step(): xe không nhận ra hố và rơi xuống hố', baiLam: bai(['for i in range(3):', '    safe_step()'], { hamCuaMan: [H('safe_step', [], ['g = radar()', 't = g[0][1]', 'if t == "#":', '    slide_r(1)', 'move()'])] }), phaiCoMa: ['roi-ho'] },
        { moTa: 'Xóa mất lệnh move() ở cuối safe_step(): xe chỉ đứng ở hàng dưới', baiLam: bai(['for i in range(3):', '    safe_step()'], { hamCuaMan: [H('safe_step', [], ['g = radar()', 't = g[0][1]', 'if t == "u":', '    slide_r(1)'])] }), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Hố sâu trên radar có ký hiệu là "u" chứ không phải "#".', 'Luna: Trong hàm safe_step(), đổi điều kiện thành if g[0][1] == "u":.']
    }),

    manCheRadar({
      so: 4, ten: 'Chế hàm dò đá chéo rồi hất', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['slide_r', 'lob'], taoHam: ['seek_lob'],
      deBai: 'Sola nhờ bạn: chế hàm seek_lob() để quét radar(), nếu ô chéo trước-phải g[0][2] có đá ("V") thì trượt phải 1 ô (slide_r(1)), ngược lại trượt phải 2 ô (slide_r(2)), rồi gọi lob() hất đá vào đích.',
      veMaMau: 'Chương trình chính đã lặp 2 lần gọi seek_lob(). Hãy vào Xưởng hàm tạo hàm seek_lob().',
      san: [
        ['######', '#D#D##', '#o#o##', '......'],
        ['######', '##DD##', '##oo##', '......']
      ],
      batDau: [{ x: 0, y: 3, huong: 0 }, { x: 0, y: 3, huong: 0 }],
      maMau: bai(['for i in range(2):', '    seek_lob()']),
      loiGiai: bai(['for i in range(2):', '    seek_lob()'], { hamCuaEmMoi: [H('seek_lob', [], T_SEEK_LOB)] }),
      sao: { o: 15, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Gọi hai lần seek_lob() liên tiếp',
        baiLam: bai(['seek_lob()', 'seek_lob()']),
        hamCuaEmMoi: [H('seek_lob', [], T_SEEK_LOB)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm seek_lob mà đã bấm Chạy', baiLam: bai(['for i in range(2):', '    seek_lob()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong seek_lob() viết ngược 1 và 2 ô: trượt lệch cột đá nên xúc hụt', baiLam: bai(['for i in range(2):', '    seek_lob()']), hamCuaEmMoi: [H('seek_lob', [], ['g = radar()', 't = g[0][2]', 'if t == "V":', '    slide_r(2)', 'else:', '    slide_r(1)', 'lob()'])], phaiCoMa: ['nap-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi g[0][2] == "V", tảng đá nằm ngay cột kế bên nên chỉ cần slide_r(1).', 'Luna: Ngược lại (else:) gọi slide_r(2), và cuối hàm gọi lob().']
    }),

    manCheRadar({
      so: 5, ten: 'Chế hàm quét hàng đá', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['slide_r', 'lob', 'lob_if'], taoHam: ['scan_row'],
      deBai: 'Sola nhờ bạn: chế hàm scan_row(n) có tham số n để lặp n lần: mỗi lần trượt phải 1 ô (slide_r(1)) rồi gọi lob_if() để hất đá nếu cột đó có đá. Chương trình chính sẽ gọi scan_row(4).',
      veMaMau: 'Chương trình chính đã gọi scan_row(4). Hãy vào Xưởng hàm tạo hàm scan_row(n).',
      san: [
        ['######', '#D.DD#', '#o.oo#', '.....#'],
        ['######', '##DDD#', '##ooo#', '.....#']
      ],
      batDau: [{ x: 0, y: 3, huong: 0 }, { x: 0, y: 3, huong: 0 }],
      maMau: bai(['scan_row(4)']),
      loiGiai: bai(['scan_row(4)'], { hamCuaEmMoi: [H('scan_row', ['n'], T_SCAN_ROW)] }),
      sao: { o: 14, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Gọi hai lần scan_row(2)',
        baiLam: bai(['scan_row(2)', 'scan_row(2)']),
        hamCuaEmMoi: [H('scan_row', ['n'], T_SCAN_ROW)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm scan_row mà đã bấm Chạy', baiLam: bai(['scan_row(4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong scan_row(n) gọi lob() thay vì lob_if(): xúc hụt ở cột không có đá', baiLam: bai(['scan_row(4)']), hamCuaEmMoi: [H('scan_row', ['n'], ['for i in range(n):', '    slide_r(1)', '    lob()'])], phaiCoMa: ['nap-hut', 'nem-hut'] },
        { moTa: 'Trong scan_row(n) lặp cứng range(2) thay vì range(n): bỏ sót các cột cuối', baiLam: bai(['scan_row(4)']), hamCuaEmMoi: [H('scan_row', ['n'], ['for i in range(2):', '    slide_r(1)', '    lob_if()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Hàm scan_row có tham số n.', 'Luna: Thân hàm gồm for i in range(n): rồi thụt lề slide_r(1) và lob_if().']
    }),

    manCheRadar({
      so: 6, ten: 'Quét hai tầng mỏ đá', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'slide_r', 'slide_l', 'lob', 'lob_if', 'scan_row'],
      deBai: 'Sola nhờ bạn: mỏ đá có hai tầng, mỗi tầng rộng 3 cột nhưng vị trí các tảng đá thay đổi theo từng sân. Sau khi gọi scan_row(3) ở tầng dưới, hãy trượt trái 3 ô về cột đầu (slide_l(3)), tiến lên 3 ô sang tầng trên (forward(3)) rồi gọi scan_row(3) lần nữa.',
      veMaMau: 'Chương trình có sẵn mới quét tầng dưới bằng scan_row(3). Hãy đưa xe lên đầu tầng trên và quét tiếp.',
      san: [
        ['#####', '#D.D#', '#o.o#', '....#', '.#DD#', '.#oo#', '....#'],
        ['#####', '#.DD#', '#.oo#', '....#', '.D.D#', '.o.o#', '....#']
      ],
      batDau: [{ x: 0, y: 6, huong: 0 }, { x: 0, y: 6, huong: 0 }],
      maMau: bai(['scan_row(3)']),
      loiGiai: bai(['scan_row(3)', 'slide_l(3)', 'forward(3)', 'scan_row(3)']),
      sao: { o: 25, nhip: 20 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp 2 lần cho cả hai tầng',
        baiLam: bai(['for i in range(2):', '    scan_row(3)', '    slide_l(3)', '    forward(3)'])
      },
      loiSai: [
        { moTa: 'Chưa lên tầng trên để quét tiếp', baiLam: bai(['scan_row(3)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên slide_l(3) trước khi tiến lên: đâm vào đá đã hất ở tầng dưới', baiLam: bai(['scan_row(3)', 'forward(3)', 'scan_row(3)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau scan_row(3), xe đang ở cột 3 nên cần slide_l(3) về cột 0.', 'Luna: Gọi forward(3) lên tầng trên rồi gọi scan_row(3).']
    }),

    manCheRadar({
      so: 7, ten: 'Chế hàm tự chọn kiểu hất đá', hang: 'bien-the', hamCuaEmCan: ['slide_r', 'lob', 'slide_lob'], taoHam: ['smart_lob'],
      deBai: 'Sola nhờ bạn: khi đứng trước tảng đá, nếu ô chéo trước-phải g[0][2] là hàng rào ("#") thì đích nằm lệch sang phải 2 cột bên kia rào (cần gọi slide_lob(2)); ngược lại đích nằm ngay thẳng phía trước (chỉ cần gọi lob()). Hãy chế hàm smart_lob() để tự chọn cách hất đá.',
      veMaMau: 'Chương trình chính đã gọi smart_lob(). Hãy vào Xưởng hàm tạo hàm smart_lob().',
      san: [
        ['######', '###D##', '#o==##', '#....#'],
        ['######', '#D####', '#o.###', '#....#']
      ],
      batDau: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 3, huong: 0 }],
      maMau: bai(['smart_lob()']),
      loiGiai: bai(['smart_lob()'], { hamCuaEmMoi: [H('smart_lob', [], T_SMART_LOB)] }),
      sao: { o: 18, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra g[0][2] == "." để gọi lob() trước',
        baiLam: bai(['smart_lob()']),
        hamCuaEmMoi: [H('smart_lob', [], ['g = radar()', 't = g[0][2]', 'if t == ".":', '    lob()', 'else:', '    slide_lob(2)'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm smart_lob mà đã bấm Chạy', baiLam: bai(['smart_lob()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong smart_lob() luôn gọi lob(): ở sân thứ nhất đá đập vào tường', baiLam: bai(['smart_lob()']), hamCuaEmMoi: [H('smart_lob', [], ['lob()'])], phaiCoMa: ['nem-vo'] },
        { moTa: 'Trong smart_lob() luôn gọi slide_lob(2): ở sân thứ hai đá đập vào tường', baiLam: bai(['smart_lob()']), hamCuaEmMoi: [H('smart_lob', [], ['slide_lob(2)'])], phaiCoMa: ['nem-vo'] }
      ],
      goiY: ['Luna: Hàng rào "=" khi quét bằng radar() sẽ trả về "#".', 'Luna: Trong smart_lob(), viết if g[0][2] == "#": slide_lob(2), else: lob().']
    }),

    manCheRadar({
      so: 8, ten: 'Dọn dọc lối rồi quét ngang', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'slide_r', 'lob', 'lob_right', 'lob_if', 'clear_step', 'scan_row'],
      deBai: 'Sola nhờ bạn: đi dọc hành lang trái 2 bước bằng clear_step() để dọn tảng đá chắn đường sang ô đích bên phải, sau đó dùng scan_row(2) quét ngang sang phải 2 cột để hất nốt tảng đá trên tầng cao.',
      veMaMau: 'Chương trình có sẵn đã đi 2 bước clear_step(). Hãy gọi thêm scan_row(2) để quét 2 cột bên phải.',
      san: [
        ['######', '##D###', '##o###', '#...=#', '#o=.##', '#.=D##'],
        ['######', '###D##', '###o##', '#o..=#', '#.=D##', '#.=.##']
      ],
      batDau: [{ x: 1, y: 5, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      maMau: bai(['clear_step()', 'clear_step()']),
      loiGiai: bai(['clear_step()', 'clear_step()', 'scan_row(2)']),
      sao: { o: 33, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for 2 lần cho clear_step() rồi gọi scan_row(2)',
        baiLam: bai(['for i in range(2):', '    clear_step()', 'scan_row(2)'])
      },
      loiSai: [
        { moTa: 'Mới dọn hành lang dọc mà chưa quét hàng ngang phía trên', baiLam: bai(['clear_step()', 'clear_step()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi scan_row(2) trước khi đi lên bằng clear_step(): đâm vào hàng rào', baiLam: bai(['scan_row(2)', 'clear_step()', 'clear_step()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau hai lần clear_step(), xe đang đứng ở (1, 3) ngay đầu hàng đá tầng trên.', 'Luna: Gọi scan_row(2) để xe trượt qua cột 2 và cột 3 hất nốt các tảng đá.']
    }),

    manCheRadar({
      so: 9, ten: 'Ba bước nhảy dò đá', hang: 'bien-the', hamCuaEmCan: ['slide_r', 'lob', 'seek_lob'],
      deBai: 'Sola nhờ bạn: trên hành lang ngang dài 7 cột có 3 tảng đá đặt cách nhau 1 hoặc 2 cột tùy từng sân. Hãy dùng vòng lặp gọi seek_lob() 3 lần để tự dò khoảng cách và hất đủ 3 tảng đá vào đích.',
      veMaMau: 'Chương trình có sẵn mới gọi seek_lob() một lần. Hãy lặp 3 lần seek_lob().',
      san: [
        ['#######', '#D#D#D#', '#o#o#o#', '.......'],
        ['#######', '##DD#D#', '##oo#o#', '.......']
      ],
      batDau: [{ x: 0, y: 3, huong: 0 }, { x: 0, y: 3, huong: 0 }],
      maMau: bai(['seek_lob()']),
      loiGiai: bai(['for i in range(3):', '    seek_lob()']),
      sao: { o: 15, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Gọi 3 lần seek_lob() liên tiếp',
        baiLam: bai(['seek_lob()', 'seek_lob()', 'seek_lob()'])
      },
      loiSai: [
        { moTa: 'Chỉ gọi seek_lob() 1 lần', baiLam: bai(['seek_lob()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ lặp range(2): còn sót tảng đá thứ ba', baiLam: bai(['for i in range(2):', '    seek_lob()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Mỗi lần gọi seek_lob() xe sẽ tự nhìn g[0][2] để trượt 1 hoặc 2 ô tới tảng đá tiếp theo.', 'Luna: Lặp for i in range(3): seek_lob() là xong cả 3 tảng đá.']
    }),

    manCheRadar({
      so: 10, ten: 'Trùm chế lệnh quét mỏ', hang: 'trum', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'slide_r', 'lob', 'lob_right', 'lob_if', 'clear_step', 'scan_row'],
      huyHieu: { ma: 'che-radar-tron', ten: 'Huy hiệu Chế lệnh: quét mỏ' },
      deBai: 'Sola nhờ bạn: trùm cuối gói Radar tròn! Đầu tiên gọi scan_row(3) để quét qua 3 cột tầng dưới. Sau đó trượt phải 1 ô (slide_r(1)) sang lối đi cột 4, rồi gọi clear_step() 2 lần để vừa tiến lên vừa hất các tảng đá chắn đường sang đích bên phải.',
      veMaMau: 'Chương trình có sẵn đã quét tầng dưới bằng scan_row(3). Hãy trượt phải 1 ô rồi gọi clear_step() 2 lần.',
      san: [
        ['#######', '#######', '####.##', '#D.Do=#', '#o.o.=D', '.....##'],
        ['#######', '#######', '####.##', '#.DD.=#', '#.ooo=#', '.....=D']
      ],
      batDau: [{ x: 0, y: 5, huong: 0 }, { x: 0, y: 5, huong: 0 }],
      maMau: bai(['scan_row(3)']),
      loiGiai: bai(['scan_row(3)', 'slide_r(1)', 'clear_step()', 'clear_step()']),
      sao: { o: 32, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for 2 lần cho clear_step()',
        baiLam: bai(['scan_row(3)', 'slide_r(1)', 'for i in range(2):', '    clear_step()'])
      },
      loiSai: [
        { moTa: 'Mới quét tầng dưới mà chưa sang cột 4 đi lên', baiLam: bai(['scan_row(3)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên slide_r(1) trước khi gọi clear_step(): hất nhầm đá ở cột 3 vào rào vỡ', baiLam: bai(['scan_row(3)', 'clear_step()', 'clear_step()']), phaiCoMa: ['nem-vo'] }
      ],
      goiY: ['Luna: Sau scan_row(3), xe đang ở (3, 5); gọi slide_r(1) để sang (4, 5).', 'Luna: Từ (4, 5), gọi clear_step() hai lần để vừa đi lên vừa hất đá sang đích cột 6.']
    })
  ];

  ManHoc.manRadarTron = DS;
  if (laNode) module.exports = DS;
})();

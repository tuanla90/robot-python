/* ============================================================================
   man-san-mo-da.js — "Robot Chấn Hưng": GÓI 4 MÙA 6 "BÀN XOAY & SÀN DỐC"
   Gồm 20 màn mới trên Máy mỏ đá R1 (thân omni + tay hất đá + radar tròn):
   - ban-xoay.11..20 (10 màn chương ban-xoay "Lấp hố, trượt dốc")
   - che-ban-xoay.11..20 (10 màn chương che-ban-xoay "Chế lệnh: vượt mỏ đá")
   Ba yếu tố sân mỏ đá:
   1. Hất đá tròn ('o') rơi vào hố ('u') để lấp hố thành sàn trống (daLapHo: true).
   2. Sàn dốc một chiều (sanDoc: '^', 'v', '<', '>') làm xe trôi 1 ô cuối nhịp.
   3. Bàn xoay ('@' xoay phải 90 độ, '%' xoay trái 90 độ) và nút đè giữ trên sàn ('M').
   Nạp sau man-radar-tron.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC_SAN = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar'];
  var ROBOT_SAN = { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  function bai(chinh, Phu) {
    return {
      chinh: chinh,
      hamCuaMan: (Phu && Phu.hamCuaMan) || [],
      hamCuaEmMoi: (Phu && Phu.hamCuaEmMoi) || []
    };
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than }; }

  var T_FILL_PIT = ['lob()', 'forward(2)'];
  var T_AUTO_FILL = ['g = radar()', 't = g[0][1]', 'if t == "V":', '    lob()', 'move()'];
  var T_BRIDGE_SLOPE = ['fill_pit()', 'move()'];
  var T_SPIN_LOB = ['load()', 'wait()', 'slide_r(1)', 'throw()', 'wait()'];
  var T_FILL_ROW = ['for i in range(n):', '    slide_r(1)', '    lob()'];

  function manBanXoay(cfg) {
    return Object.assign({
      chuong: 'ban-xoay',
      loaiRobot: 'omni',
      robot: ROBOT_SAN,
      tamNemMacDinh: 2,
      daLapHo: true,
      hamGoc: HAM_GOC_SAN,
      moXuong: true,
      mucTieu: 'toi-co',
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      taoHam: [],
      hamCuaEmCan: ['move', 'forward', 'lob'],
      loiSai: [],
      goiY: [],
      phienBanNoiDung: 2
    }, cfg);
  }

  function manCheBanXoay(cfg) {
    return Object.assign({
      chuong: 'che-ban-xoay',
      loaiRobot: 'omni',
      robot: ROBOT_SAN,
      tamNemMacDinh: 2,
      daLapHo: true,
      hamGoc: HAM_GOC_SAN,
      moXuong: true,
      mucTieu: 'toi-co',
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      taoHam: [],
      hamCuaEmCan: ['move', 'forward', 'lob'],
      loiSai: [],
      goiY: [],
      phienBanNoiDung: 2
    }, cfg);
  }

  var DS = [
    /* ================================================= chương ban-xoay: Lấp hố, trượt dốc (10 màn: 11..20) ================================================= */
    manBanXoay({
      so: 11, ten: 'Hất đá lấp hố sâu', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, hamCuaEmCan: ['move', 'forward', 'lob'],
      deBai: 'Sola làm mẫu: ở mỏ đá, khi R1 dùng lob() hất tảng đá tròn rơi trúng ô hố sâu ("u") cách 2 ô phía trước, tảng đá sẽ lấp đầy hố thành mặt sàn phẳng để xe lăn bánh đi qua. Bấm Chạy xem R1 lấp hố rồi tiến thẳng tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem tảng đá lấp đầy ô hố thành đường đi.',
      san: ['###', '#F#', '#u#', '#o#', '#.#', '###'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['lob()', 'forward(3)']),
      loiGiai: bai(['lob()', 'forward(3)']),
      sao: { o: 11, nhip: 5 },
      goiY: ['Luna: Khi lob() hất tảng đá ở (1, 3) bay 2 ô tới (1, 2), ô hố "u" biến thành sàn phẳng.', 'Luna: Sau đó forward(3) đưa xe đi qua chỗ vừa lấp tới thẳng lá cờ.']
    }),

    manBanXoay({
      so: 12, ten: 'Bắc cầu qua hai hố', hang: 'lam-quen', hamCuaEmCan: ['move', 'forward', 'lob'],
      deBai: 'Sola nhờ bạn: dọc đường hầm có 2 hố sâu liên tiếp, trước mỗi hố đều có sẵn một tảng đá. Hãy lặp 2 lần: gọi lob() để lấp hố rồi gọi forward(2) tiến lên ô vừa lấp; cuối cùng gọi move() bước vào lá cờ.',
      veMaMau: 'Chương trình có sẵn mới gọi lob() trong vòng lặp. Hãy thêm forward(2) vào trong vòng lặp và move() ở ngoài vòng lặp.',
      san: ['###', '#F#', '#u#', '#o#', '#u#', '#o#', '#.#', '###'],
      batDau: { x: 1, y: 6, huong: 0 },
      maMau: bai(['for i in range(2):', '    lob()']),
      loiGiai: bai(['for i in range(2):', '    lob()', '    forward(2)', 'move()']),
      sao: { o: 13, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Viết tường minh từng bước lấp hố và tiến lên',
        baiLam: bai(['lob()', 'forward(2)', 'lob()', 'forward(3)'])
      },
      loiSai: [
        { moTa: 'Chưa tiến lên sau khi lấp hố đầu tiên: lần lob() thứ hai xúc hụt', baiLam: bai(['for i in range(2):', '    lob()']), phaiCoMa: ['nap-hut', 'chua-toi-co'] },
        { moTa: 'Chỉ tiến thẳng mà không gọi lob(): xe đâm vào tảng đá', baiLam: bai(['for i in range(2):', '    forward(2)', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Sau mỗi lần lob(), cả ô đá lẫn ô hố phía trước đều đã thành sàn trống.', 'Luna: Gọi forward(2) trong vòng lặp để tiến tới sát tảng đá tiếp theo, rồi hết vòng lặp gọi move().']
    }),

    manBanXoay({
      so: 13, ten: 'Trượt theo sàn dốc', hang: 'lam-quen', hamCuaEmCan: ['move', 'slide_r'],
      deBai: 'Sola nhờ bạn: mặt sàn mỏ đá có những bậc dốc một chiều (mũi tên ">"). Cuối mỗi nhịp, nếu xe đang đứng trên ô dốc thì mặt dốc tự đẩy xe trôi thêm 1 ô theo chiều mũi tên mà không tốn nhịp. Chỉ cần lặp 3 lần move() để xe vừa tiến lên vừa trôi ngang tới cờ.',
      veMaMau: 'Chương trình có sẵn mới tiến 1 bước. Hãy dùng vòng lặp for lặp 3 lần lệnh move().',
      san: ['#######', '####.F#', '###..##', '##..###', '##.####', '#######'],
      sanDoc: ['.......', '....>..', '...>...', '..>....', '.......', '.......'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: bai(['move()']),
      loiGiai: bai(['for i in range(3):', '    move()']),
      sao: { o: 5, nhip: 3 },
      loiGiaiKhac: {
        moTa: 'Gọi 3 lần move() liên tiếp',
        baiLam: bai(['move()', 'move()', 'move()'])
      },
      loiSai: [
        { moTa: 'Mới đi 1 bước nên chưa tới cờ', baiLam: bai(['move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi nhầm slide_r(1) thay vì move(): xe đâm vào tường bên phải và không lên được bậc dốc', baiLam: bai(['for i in range(3):', '    slide_r(1)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Ô sàn dốc ">" tự động đẩy xe sang phải 1 ô ngay cuối nhịp move().', 'Luna: Bạn không cần gọi slide_r(1), chỉ cần lặp 3 lần move().']
    }),

    manBanXoay({
      so: 14, ten: 'Bàn xoay đổi hướng', hang: 'luyen', hamCuaEmCan: ['move', 'forward', 'turn_right'],
      deBai: 'Sola nhờ bạn: trên đường đi có hai bàn xoay cơ khí: ô "@" tự xoay xe 90 độ sang phải, còn ô "%" tự xoay xe 90 độ sang trái ngay cuối nhịp xe bước vào. Hãy dùng một lệnh forward(7) để xe lướt qua cả hai bàn xoay tới thẳng cờ.',
      veMaMau: 'Chương trình có sẵn mới đi 2 bước tới bàn xoay đầu tiên. Hãy đổi số bước trong forward() để đi hết quãng đường.',
      san: ['######', '####F#', '####.#', '#@..%#', '#.####', '#.####', '######'],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: bai(['forward(2)']),
      loiGiai: bai(['forward(7)']),
      sao: { o: 6, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp 7 lần move()',
        baiLam: bai(['for i in range(7):', '    move()'])
      },
      loiSai: [
        { moTa: 'Mới đi tới bàn xoay đầu tiên rồi dừng', baiLam: bai(['forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi thêm turn_right() sau khi bàn xoay @ đã xoay xe: bị quay ngược xuống tường', baiLam: bai(['forward(2)', 'turn_right()', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Bước lên "@" ở (1, 3) xe tự quay mặt sang phải; bước lên "%" ở (4, 3) xe tự quay mặt lên trên.', 'Luna: Tổng cộng chỉ cần gọi forward(7).']
    }),

    manBanXoay({
      so: 15, ten: 'Bàn xoay trợ lực hất đá', hang: 'luyen', mucTieu: 'dua-vat', hamCuaEmCan: ['move', 'turn_right', 'slide_r'],
      deBai: 'Sola nhờ bạn: xúc tảng đá trước mặt vào rổ (load(), wait()), sau đó trượt phải 1 ô (slide_r(1)) bước lên bàn xoay "@". Bàn xoay sẽ tự quay mũi xe sang phải hướng về phía ô đích bên kia rào, lúc này bạn chỉ cần gọi throw(), wait() để hất đá vào đích!',
      veMaMau: 'Chương trình có sẵn đã xúc đá và trượt lên bàn xoay "@". Hãy thêm lệnh ném đá vào đích.',
      san: ['######', '#o####', '#.@=D#', '######'],
      batDau: { x: 1, y: 2, huong: 0 },
      maMau: bai(['load()', 'wait()', 'slide_r(1)']),
      loiGiai: bai(['load()', 'wait()', 'slide_r(1)', 'throw()', 'wait()']),
      sao: { o: 8, nhip: 3 },
      loiGiaiKhac: {
        moTa: 'Đứng chờ thêm 1 nhịp sau khi ném xong',
        baiLam: bai(['load()', 'wait()', 'slide_r(1)', 'throw()', 'wait()', 'wait()'])
      },
      loiSai: [
        { moTa: 'Chưa gọi throw() sau khi lên bàn xoay', baiLam: bai(['load()', 'wait()', 'slide_r(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Tự gọi thêm turn_right() trên bàn xoay: ném đá đập vào tường phía dưới', baiLam: bai(['load()', 'wait()', 'slide_r(1)', 'turn_right()', 'throw()', 'wait()']), phaiCoMa: ['nem-vo'] }
      ],
      goiY: ['Luna: Khi trượt sang ô "@" ở (2, 2), bàn xoay tự xoay mũi xe sang phải mà không mất nhịp quay.', 'Luna: Thêm throw() và wait() ở cuối chương trình là đá bay qua rào vào đích.']
    }),

    manBanXoay({
      so: 16, ten: 'Hất đá đè nút mở cửa', hang: 'luyen', hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'lob_right'],
      deBai: 'Sola nhờ bạn: cánh cửa "C" phía trên chỉ mở khi có vật đè lên nút sàn "M" bên kia hàng rào. Hãy gọi lob_right() để xúc tảng đá trước mặt và hất qua rào đè lên nút "M", sau đó gọi forward(3) đi qua cửa tới cờ.',
      veMaMau: 'Chương trình có sẵn mới gọi lob_right() để hất đá đè nút M. Hãy gọi thêm forward(3) để tiến lên cờ.',
      san: ['######', '#F####', '#C####', '#o####', '#.=M##', '######'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['lob_right()']),
      loiGiai: bai(['lob_right()', 'forward(3)']),
      sao: { o: 17, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp 3 lần move() sau khi gọi lob_right()',
        baiLam: bai(['lob_right()', 'for i in range(3):', '    move()'])
      },
      loiSai: [
        { moTa: 'Mới hất đá mở cửa mà chưa đi lên cờ', baiLam: bai(['lob_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi thẳng không hất đá đè nút M: đâm vào tảng đá và cửa đóng', baiLam: bai(['forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Khi tảng đá rơi xuống ô "M", nút đè giữ cửa "C" mở suốt thời gian còn lại.', 'Luna: Sau lob_right(), gọi forward(3) để đi tới cờ.']
    }),

    manBanXoay({
      so: 17, ten: 'Trượt dốc rồi lấp hố', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'lob'],
      deBai: 'Sola nhờ bạn: kết hợp cả lấp hố lẫn sàn dốc! Trong mỗi lượt của 2 bậc thang: gọi lob() để hất tảng đá trước mặt lấp đầy hố sâu, rồi gọi forward(3) để đi qua chỗ vừa lấp và bước lên ô dốc ">" cho mặt dốc đẩy xe sang cột kế tiếp.',
      veMaMau: 'Chương trình có sẵn đã lặp 2 lần và gọi lob(). Hãy thêm forward(3) vào trong vòng lặp.',
      san: ['#####', '##.F#', '##u##', '##o##', '#..##', '#u###', '#o###', '#.###', '#####'],
      sanDoc: ['.....', '..>..', '.....', '.....', '.>...', '.....', '.....', '.....', '.....'],
      batDau: { x: 1, y: 7, huong: 0 },
      maMau: bai(['for i in range(2):', '    lob()']),
      loiGiai: bai(['for i in range(2):', '    lob()', '    forward(3)']),
      sao: { o: 12, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Viết tách từng lượt lob() và forward(3)',
        baiLam: bai(['lob()', 'forward(3)', 'lob()', 'forward(3)'])
      },
      loiSai: [
        { moTa: 'Chưa tiến lên sau khi lấp hố', baiLam: bai(['for i in range(2):', '    lob()']), phaiCoMa: ['nap-hut', 'chua-toi-co'] },
        { moTa: 'Chỉ đi forward(2) thay vì forward(3): chưa bước tới ô sàn dốc ">"', baiLam: bai(['for i in range(2):', '    lob()', '    forward(2)']), phaiCoMa: ['nap-hut', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Mỗi lần lob() dọn thông 2 ô phía trước, và ô thứ 3 phía trước là sàn dốc ">".', 'Luna: Gọi forward(3) sau lob() để bước lên ô dốc ">" và trôi sang cột bên phải.']
    }),

    manBanXoay({
      so: 18, ten: 'Quét radar lấp hố cản đường', hang: 'bien-the', hamCuaEmCan: ['move', 'lob'],
      deBai: 'Sola nhờ bạn: trên đường hầm dài 4 bước lên cờ có một cặp đá chắn và hố sâu nhưng vị trí thay đổi theo từng sân. Trong vòng lặp 4 bước, hãy dùng radar() kiểm tra ô trước mặt g[0][1]: nếu thấy đá ("V") thì gọi lob() để vừa dọn đá vừa lấp hố phía sau nó, rồi gọi move() tiến lên.',
      veMaMau: 'Chương trình có sẵn mới lặp 4 lần đọc g = radar() và move(). Hãy thêm t = g[0][1], rồi if t == "V": lob() trước move().',
      san: [
        ['###', '#F#', '#u#', '#o#', '#.#', '#.#', '###'],
        ['###', '#F#', '#.#', '#u#', '#o#', '#.#', '###']
      ],
      batDau: [{ x: 1, y: 5, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      maMau: bai(['for i in range(4):', '    g = radar()', '    move()']),
      loiGiai: bai(['for i in range(4):', '    g = radar()', '    t = g[0][1]', '    if t == "V":', '        lob()', '    move()']),
      sao: { o: 12, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Đặt tên biến khác: t là lưới radar, k là ô trước mặt',
        baiLam: bai(['g = 0', 'for i in range(4):', '    t = radar()', '    k = t[0][1]', '    if k == "V":', '        lob()', '    move()'])
      },
      loiSai: [
        { moTa: 'Chưa gọi lob() khi gặp đá: xe đâm vào tảng đá chắn đường', baiLam: bai(['for i in range(4):', '    g = radar()', '    move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Thụt lề nhầm move() vào trong if: gặp ô trống xe đứng yên không đi', baiLam: bai(['for i in range(4):', '    g = radar()', '    t = g[0][1]', '    if t == "V":', '        lob()', '        move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Tảng đá nằm ngay trước hố sâu, nên khi thấy ô trước mặt g[0][1] là "V" thì gọi lob() sẽ lấp luôn hố.', 'Luna: Sau khối if, gọi move() để tiến lên từng bước tới cờ.']
    }),

    manBanXoay({
      so: 19, ten: 'Lấp hố vượt bàn xoay và dốc', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'lob'],
      deBai: 'Sola nhờ bạn: đầu tiên gọi lob() để hất tảng đá trước mặt lấp đầy hố sâu, rồi gọi forward(3) để tiến lên bàn xoay "@" ở góc trên trái. Sau khi bàn xoay tự quay mũi xe sang phải, hãy gọi forward(2) để đi sang ô sàn dốc "v" ở góc phải và trượt xuống cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi lob() và forward(3) lên bàn xoay. Hãy gọi thêm forward(2) để đi sang sàn dốc.',
      san: ['#####', '#@..#', '#u.F#', '#o###', '#.###', '#####'],
      sanDoc: ['.....', '...v.', '.....', '.....', '.....', '.....'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['lob()', 'forward(3)']),
      loiGiai: bai(['lob()', 'forward(3)', 'forward(2)']),
      sao: { o: 12, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng hai lệnh move() ở đoạn cuối thay vì forward(2)',
        baiLam: bai(['lob()', 'forward(3)', 'move()', 'move()'])
      },
      loiSai: [
        { moTa: 'Dừng lại trên bàn xoay mà chưa đi tiếp sang phải', baiLam: bai(['lob()', 'forward(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ đi thêm 1 bước sau bàn xoay: chưa chạm tới ô sàn dốc "v"', baiLam: bai(['lob()', 'forward(3)', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Khi forward(3) dừng ở (1, 1), bàn xoay "@" đã quay mũi xe sang phải.', 'Luna: Gọi tiếp forward(2) để xe đi tới (3, 1), nơi sàn dốc "v" đẩy xe xuống (3, 2) trúng đích cờ.']
    }),

    manBanXoay({
      so: 20, ten: 'Trùm lấp hố trượt dốc', hang: 'trum', hamCuaEmCan: ['move', 'lob'],
      huyHieu: { ma: 'ban-xoay', ten: 'Huy hiệu Lấp hố, trượt dốc' },
      deBai: 'Sola nhờ bạn: trùm chương Lấp hố, trượt dốc gồm 8 bước di chuyển qua hai tầng dốc và một bàn xoay "@". Ở mỗi bước trong vòng lặp 8 lần: dùng radar() kiểm tra nếu ô phía trên g[0][1] có tảng đá ("V") thì gọi lob() để lấp hố sâu phía trước, sau đó gọi move(). Các ô dốc ">" và bàn xoay "@" sẽ tự động chuyển làn đưa xe về đích cờ!',
      veMaMau: 'Chương trình có sẵn đã lặp 8 lần và đọc g = radar(). Hãy thêm t = g[0][1], rồi if t == "V": lob() và gọi move().',
      san: [
        ['######', '##@.F#', '##u###', '##o###', '#..###', '#.####', '#u####', '#o####', '#.####', '######'],
        ['######', '##@.F#', '##u###', '##o###', '#..###', '#u####', '#o####', '#.####', '#.####', '######']
      ],
      sanDoc: [
        ['......', '...>..', '......', '......', '.>....', '......', '......', '......', '......', '......'],
        ['......', '...>..', '......', '......', '.>....', '......', '......', '......', '......', '......']
      ],
      batDau: [{ x: 1, y: 8, huong: 0 }, { x: 1, y: 8, huong: 0 }],
      maMau: bai(['for i in range(8):', '    g = radar()']),
      loiGiai: bai(['for i in range(8):', '    g = radar()', '    t = g[0][1]', '    if t == "V":', '        lob()', '    move()']),
      sao: { o: 12, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Đặt tên biến khác trong vòng lặp 8 bước: t là lưới radar, k là ô trước mặt',
        baiLam: bai(['g = 0', 'for i in range(8):', '    t = radar()', '    k = t[0][1]', '    if k == "V":', '        lob()', '    move()'])
      },
      loiSai: [
        { moTa: 'Chưa viết lệnh lấp hố và di chuyển trong vòng lặp', baiLam: bai(['for i in range(8):', '    g = radar()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi thẳng 8 bước không gọi lob() khi gặp đá: xe đâm vào tảng đá', baiLam: bai(['for i in range(8):', '    g = radar()', '    move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Cả hai tầng đều đi hướng lên cho tới khi gặp bàn xoay "@" ở bước thứ 7.', 'Luna: Trong vòng lặp 8 lần, viết t = g[0][1], if t == "V": lob(), rồi gọi move() ở ngoài if.']
    }),

    /* ================================================= chương che-ban-xoay: Chế lệnh: vượt mỏ đá (10 màn: 11..20) ================================================= */
    manCheBanXoay({
      so: 11, ten: 'Chế hàm lấp hố tiến lên', hang: 'lam-quen', canHam: 'tran-khung', hamCuaEmCan: ['move', 'forward', 'lob'], taoHam: ['fill_pit'],
      deBai: 'Sola nhờ bạn: chế hàm fill_pit() gồm hai việc: gọi lob() để hất tảng đá trước mặt lấp đầy hố sâu cách 2 ô, rồi gọi forward(2) để tiến lên đứng ngay trên ô hố vừa lấp. Chương trình chính gọi fill_pit() 2 lần rồi move() vào cờ.',
      veMaMau: 'Chương trình chính đã gọi fill_pit() 2 lần và move(). Hãy vào Xưởng hàm tạo hàm fill_pit().',
      san: ['###', '#F#', '#u#', '#o#', '#u#', '#o#', '#.#', '###'],
      batDau: { x: 1, y: 6, huong: 0 },
      maMau: bai(['fill_pit()', 'fill_pit()', 'move()']),
      loiGiai: bai(['fill_pit()', 'fill_pit()', 'move()'], { hamCuaEmMoi: [H('fill_pit', [], T_FILL_PIT)] }),
      sao: { o: 14, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp 2 lần gọi fill_pit() rồi move()',
        baiLam: bai(['for i in range(2):', '    fill_pit()', 'move()']),
        hamCuaEmMoi: [H('fill_pit', [], T_FILL_PIT)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm fill_pit mà đã bấm Chạy', baiLam: bai(['fill_pit()', 'fill_pit()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong fill_pit() chỉ tiến 1 ô move() thay vì forward(2): lần thứ hai xúc hụt', baiLam: bai(['fill_pit()', 'fill_pit()', 'move()']), hamCuaEmMoi: [H('fill_pit', [], ['lob()', 'move()'])], phaiCoMa: ['nap-hut', 'chua-toi-co'] },
        { moTa: 'Trong fill_pit() gọi forward(2) trước lob(): xe đâm vào tảng đá', baiLam: bai(['fill_pit()', 'fill_pit()', 'move()']), hamCuaEmMoi: [H('fill_pit', [], ['forward(2)', 'lob()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Thân hàm fill_pit() gồm 2 dòng: lob() rồi forward(2).', 'Luna: Nhớ gọi lob() trước để dọn đá và lấp hố rồi mới tiến 2 ô.']
    }),

    manCheBanXoay({
      so: 12, ten: 'Chế hàm tự dò đá lấp hố', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['move', 'lob'], taoHam: ['auto_fill'],
      deBai: 'Sola nhờ bạn: chế hàm auto_fill() để quét radar(), nếu ô trước mặt g[0][1] có tảng đá ("V") thì gọi lob() lấp hố phía sau tảng đá, sau đó gọi move() tiến lên 1 ô. Chương trình chính lặp 4 lần auto_fill().',
      veMaMau: 'Chương trình chính đã lặp 4 lần auto_fill(). Hãy vào Xưởng hàm tạo hàm auto_fill().',
      san: [
        ['###', '#F#', '#u#', '#o#', '#.#', '#.#', '###'],
        ['###', '#F#', '#.#', '#u#', '#o#', '#.#', '###']
      ],
      batDau: [{ x: 1, y: 5, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      maMau: bai(['for i in range(4):', '    auto_fill()']),
      loiGiai: bai(['for i in range(4):', '    auto_fill()'], { hamCuaEmMoi: [H('auto_fill', [], T_AUTO_FILL)] }),
      sao: { o: 13, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Gọi 4 lần auto_fill() liên tiếp',
        baiLam: bai(['auto_fill()', 'auto_fill()', 'auto_fill()', 'auto_fill()']),
        hamCuaEmMoi: [H('auto_fill', [], T_AUTO_FILL)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm auto_fill mà đã bấm Chạy', baiLam: bai(['for i in range(4):', '    auto_fill()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong auto_fill() thụt lề nhầm move() vào trong if: gặp ô trống xe đứng yên', baiLam: bai(['for i in range(4):', '    auto_fill()']), hamCuaEmMoi: [H('auto_fill', [], ['g = radar()', 't = g[0][1]', 'if t == "V":', '    lob()', '    move()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Trong auto_fill() chỉ gọi move() không kiểm tra đá: xe đâm vào tảng đá', baiLam: bai(['for i in range(4):', '    auto_fill()']), hamCuaEmMoi: [H('auto_fill', [], ['move()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Thân hàm auto_fill() gồm: g = radar(), t = g[0][1], if t == "V": lob(), và move() ở ngoài if.', 'Luna: Dòng move() đặt ngoài if để bước nào xe cũng tiến lên 1 ô.']
    }),

    manCheBanXoay({
      so: 13, ten: 'Sửa hàm lấp hố trượt dốc', hang: 'luyen', hamCuaEmCan: ['move', 'forward', 'lob', 'fill_pit'],
      deBai: 'Sola viết vội, nhờ bạn sửa: hàm bridge_slope() của màn dùng để lấp hố bằng fill_pit() rồi tiến thêm 1 ô bước lên sàn dốc ">". Nhưng trong hàm đang thiếu lệnh move() cuối cùng nên xe chỉ dừng ở ô hố vừa lấp mà chưa chạm tới sàn dốc. Hãy sửa lại hàm bridge_slope().',
      veMaMau: 'Mở hàm bridge_slope() của màn và thêm lệnh move() sau fill_pit().',
      san: ['#####', '##.F#', '##u##', '##o##', '#..##', '#u###', '#o###', '#.###', '#####'],
      sanDoc: ['.....', '..>..', '.....', '.....', '.>...', '.....', '.....', '.....', '.....'],
      batDau: { x: 1, y: 7, huong: 0 },
      maMau: bai(['for i in range(2):', '    bridge_slope()'], { hamCuaMan: [H('bridge_slope', [], ['fill_pit()'])] }),
      loiGiai: bai(['for i in range(2):', '    bridge_slope()'], { hamCuaMan: [H('bridge_slope', [], T_BRIDGE_SLOPE)] }),
      sao: { o: 15, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Viết lob() và forward(3) trong thân hàm bridge_slope()',
        baiLam: bai(['for i in range(2):', '    bridge_slope()'], { hamCuaMan: [H('bridge_slope', [], ['lob()', 'forward(3)'])] })
      },
      loiSai: [
        { moTa: 'Không sửa hàm bridge_slope(): xe chưa bước tới ô sàn dốc ">"', baiLam: bai(['for i in range(2):', '    bridge_slope()'], { hamCuaMan: [H('bridge_slope', [], ['fill_pit()'])] }), phaiCoMa: ['nap-hut', 'chua-toi-co'] },
        { moTa: 'Xóa mất fill_pit() chỉ để lại move(): xe đâm vào tảng đá', baiLam: bai(['for i in range(2):', '    bridge_slope()'], { hamCuaMan: [H('bridge_slope', [], ['move()'])] }), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Hàm fill_pit() mới đưa xe tiến 2 ô tới ô hố vừa lấp, còn ô sàn dốc ">" nằm ở ô thứ 3.', 'Luna: Thêm move() vào cuối hàm bridge_slope() để bước lên sàn dốc.']
    }),

    manCheBanXoay({
      so: 14, ten: 'Chế hàm trượt lên bàn xoay hất đá', hang: 'luyen', canHam: 'tran-khung', mucTieu: 'dua-vat', hamCuaEmCan: ['move', 'forward', 'turn_left', 'slide_r'], taoHam: ['spin_lob'],
      deBai: 'Sola nhờ bạn: chế hàm spin_lob() gồm: xúc đá trước mặt (load(), wait()), trượt phải 1 ô bước lên bàn xoay "@" (slide_r(1)) để bàn xoay tự quay xe sang phải, rồi ném đá qua rào vào đích (throw(), wait()). Chương trình chính sẽ dùng spin_lob() cho cả hai tầng.',
      veMaMau: 'Chương trình chính đã viết sẵn. Hãy vào Xưởng hàm tạo hàm spin_lob().',
      san: ['#######', '##o####', '##.@=D#', '#o.####', '#.@=D##', '#######'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['spin_lob()', 'turn_left()', 'forward(2)', 'spin_lob()']),
      loiGiai: bai(['spin_lob()', 'turn_left()', 'forward(2)', 'spin_lob()'], { hamCuaEmMoi: [H('spin_lob', [], T_SPIN_LOB)] }),
      sao: { o: 19, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng hai lệnh move() thay vì forward(2) khi chuyển tầng',
        baiLam: bai(['spin_lob()', 'turn_left()', 'move()', 'move()', 'spin_lob()']),
        hamCuaEmMoi: [H('spin_lob', [], T_SPIN_LOB)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm spin_lob mà đã bấm Chạy', baiLam: bai(['spin_lob()', 'turn_left()', 'forward(2)', 'spin_lob()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong spin_lob() gọi slide_r(1) trước khi load(): xúc hụt trên bàn xoay', baiLam: bai(['spin_lob()', 'turn_left()', 'forward(2)', 'spin_lob()']), hamCuaEmMoi: [H('spin_lob', [], ['slide_r(1)', 'load()', 'wait()', 'throw()', 'wait()'])], phaiCoMa: ['nap-hut', 'nem-hut'] }
      ],
      goiY: ['Luna: Phải xúc đá vào rổ bằng load(), wait() trước khi trượt sang bàn xoay "@".', 'Luna: Thân hàm spin_lob() gồm: load(), wait(), slide_r(1), throw(), wait().']
    }),

    manCheBanXoay({
      so: 15, ten: 'Chế hàm lấp hàng hố ngang', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['move', 'forward', 'slide_r', 'slide_l', 'lob'], taoHam: ['fill_row'],
      deBai: 'Sola nhờ bạn: chế hàm fill_row(n) có tham số n để lặp n lần: mỗi lần trượt phải 1 ô (slide_r(1)) rồi gọi lob() hất tảng đá trước mặt lấp đầy ô hố phía trên. Sau khi gọi fill_row(3) bắc xong cây cầu 3 ô, xe sẽ tiến 2 ô lên cầu và trượt trái 3 ô về cờ.',
      veMaMau: 'Chương trình chính đã gọi fill_row(3), forward(2), slide_l(3). Hãy vào Xưởng hàm tạo hàm fill_row(n).',
      san: ['######', '######', '#Fuuu#', '##ooo#', '#....#', '######'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['fill_row(3)', 'forward(2)', 'slide_l(3)']),
      loiGiai: bai(['fill_row(3)', 'forward(2)', 'slide_l(3)'], { hamCuaEmMoi: [H('fill_row', ['n'], T_FILL_ROW)] }),
      sao: { o: 21, nhip: 14 },
      loiGiaiKhac: {
        moTa: 'Gọi fill_row(2) rồi fill_row(1) trước khi lên cầu',
        baiLam: bai(['fill_row(2)', 'fill_row(1)', 'forward(2)', 'slide_l(3)']),
        hamCuaEmMoi: [H('fill_row', ['n'], T_FILL_ROW)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm fill_row mà đã bấm Chạy', baiLam: bai(['fill_row(3)', 'forward(2)', 'slide_l(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong fill_row(n) chỉ trượt ngang mà quên gọi lob(): hố chưa lấp nên khi tiến lên xe đâm vào đá', baiLam: bai(['fill_row(3)', 'forward(2)', 'slide_l(3)']), hamCuaEmMoi: [H('fill_row', ['n'], ['for i in range(n):', '    slide_r(1)'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Hàm fill_row có tham số n.', 'Luna: Thân hàm gồm for i in range(n): rồi thụt lề slide_r(1) và lob().']
    }),

    manCheBanXoay({
      so: 16, ten: 'Mở cửa rồi lấp hố sâu', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'lob', 'lob_right', 'fill_pit'],
      deBai: 'Sola nhờ bạn: đầu tiên gọi lob_right() để hất tảng đá thứ nhất qua rào đè lên nút sàn "M" giữ cho cửa "C" mở. Tiếp theo gọi forward(2) bước lên ô cửa "C", gọi fill_pit() để hất tảng đá thứ hai lấp hố sâu phía trên và tiến lên 2 ô, rồi gọi move() tới cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi lob_right() và forward(2). Hãy gọi tiếp fill_pit() và move().',
      san: ['######', '#F####', '#u####', '#o####', '#C####', '#o####', '#.=M##', '######'],
      batDau: { x: 1, y: 6, huong: 0 },
      maMau: bai(['lob_right()', 'forward(2)']),
      loiGiai: bai(['lob_right()', 'forward(2)', 'fill_pit()', 'move()']),
      sao: { o: 25, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Gọi lob() và forward(3) thay cho fill_pit() và move()',
        baiLam: bai(['lob_right()', 'forward(2)', 'lob()', 'forward(3)'])
      },
      loiSai: [
        { moTa: 'Dừng ở cửa C mà chưa lấp hố phía trên', baiLam: bai(['lob_right()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên gọi lob_right() để mở cửa C: đâm vào tảng đá đầu tiên', baiLam: bai(['forward(2)', 'fill_pit()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Sau forward(2), xe đang đứng ở (1, 4) ngay trước tảng đá thứ hai ở (1, 3) và hố ở (1, 2).', 'Luna: Gọi fill_pit() để lấp hố và tiến lên (1, 2), rồi gọi move() vào cờ.']
    }),

    manCheBanXoay({
      so: 17, ten: 'Quét hàng đá lấp hố ngẫu nhiên', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'slide_r', 'slide_l', 'lob', 'lob_if', 'scan_row'],
      deBai: 'Sola nhờ bạn: cây cầu ngang phía trên có 3 ô nhưng chỉ một số ô bị sụt thành hố sâu ("u") kèm tảng đá ("o") đặt sẵn phía trước tùy theo từng sân. Hãy gọi scan_row(3) để tự quét radar và chỉ hất đá lấp những cột có đá, sau đó gọi forward(2) lên đầu cầu và slide_l(3) về cờ.',
      veMaMau: 'Chương trình có sẵn mới gọi scan_row(3) để lấp các hố. Hãy thêm forward(2) và slide_l(3) để đi qua cầu về cờ.',
      san: [
        ['######', '######', '#Fu.u#', '##o=o#', '#....#', '######'],
        ['######', '######', '#F.uu#', '##=oo#', '#....#', '######']
      ],
      batDau: [{ x: 1, y: 4, huong: 0 }, { x: 1, y: 4, huong: 0 }],
      maMau: bai(['scan_row(3)']),
      loiGiai: bai(['scan_row(3)', 'forward(2)', 'slide_l(3)']),
      sao: { o: 24, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Dùng hai lệnh move() thay vì forward(2) khi bước lên cầu',
        baiLam: bai(['scan_row(3)', 'move()', 'move()', 'slide_l(3)'])
      },
      loiSai: [
        { moTa: 'Mới lấp xong cầu mà chưa bước lên cầu về cờ', baiLam: bai(['scan_row(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ quét scan_row(2): ở sân thứ nhất gặp hàng rào chắn ở cột 3', baiLam: bai(['scan_row(2)', 'forward(2)', 'slide_l(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Hàm scan_row(3) tự dùng lob_if() nên cột nào có đá mới hất, cột rào sẽ bỏ qua.', 'Luna: Sau scan_row(3), xe ở (4, 4); gọi forward(2) lên (4, 2) rồi slide_l(3) sang (1, 2).']
    }),

    manCheBanXoay({
      so: 18, ten: 'Bàn xoay kép và dốc một chiều', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'lob', 'auto_fill'],
      deBai: 'Sola nhờ bạn: lặp 3 lần auto_fill() để vừa tự dò đá lấp hố dọc hành lang trái vừa bước lên sàn dốc ">" trôi sang cột 2. Sau đó gọi forward(3) để đi qua cặp bàn xoay "@" (xoay phải) và "%" (xoay trái) tiến thẳng vào cờ.',
      veMaMau: 'Chương trình có sẵn đã lặp 3 lần auto_fill(). Hãy thêm forward(3) ở cuối.',
      san: [
        ['#####', '###F#', '##@%#', '#..##', '#u###', '#o###', '#.###', '#####'],
        ['#####', '###F#', '##@%#', '#u.##', '#o###', '#.###', '#.###', '#####']
      ],
      sanDoc: [
        ['.....', '.....', '.....', '.>...', '.....', '.....', '.....', '.....'],
        ['.....', '.....', '.....', '.>...', '.....', '.....', '.....', '.....']
      ],
      batDau: [{ x: 1, y: 6, huong: 0 }, { x: 1, y: 6, huong: 0 }],
      maMau: bai(['for i in range(3):', '    auto_fill()']),
      loiGiai: bai(['for i in range(3):', '    auto_fill()', 'forward(3)']),
      sao: { o: 16, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng 3 lần move() ở cuối thay cho forward(3)',
        baiLam: bai(['for i in range(3):', '    auto_fill()', 'move()', 'move()', 'move()'])
      },
      loiSai: [
        { moTa: 'Dừng lại ở chân bàn xoay sau khi trôi qua dốc', baiLam: bai(['for i in range(3):', '    auto_fill()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi thẳng bằng forward(6) không gọi auto_fill(): xe đâm vào tảng đá', baiLam: bai(['forward(6)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Sau 3 lần auto_fill(), sàn dốc ">" ở (1, 3) đã đẩy xe sang (2, 3) ngay dưới bàn xoay "@".', 'Luna: Gọi thêm forward(3) để xe đi qua "@" và "%" lên thẳng lá cờ ở (3, 1).']
    }),

    manCheBanXoay({
      so: 19, ten: 'Lấp hố rồi xoay bàn hất đá', hang: 'bien-the', mucTieu: 'dua-vat', hamCuaEmCan: ['move', 'forward', 'turn_left', 'slide_r', 'lob', 'fill_pit', 'spin_lob'],
      deBai: 'Sola nhờ bạn: mỏ đá có 2 bậc liên tiếp. Ở mỗi bậc trong vòng lặp 2 lần: gọi fill_pit() để lấy tảng đá đầu tiên lấp hố và tiến lên 2 ô; tiếp theo gọi spin_lob() để xúc tảng đá thứ hai, trượt sang bàn xoay "@" và hất đá vào đích bên phải; cuối cùng gọi turn_left() để quay mặt lại hướng lên cho bậc tiếp theo.',
      veMaMau: 'Chương trình có sẵn đã lặp 2 lần và gọi fill_pit(). Hãy thêm spin_lob() và turn_left() vào trong vòng lặp.',
      san: ['#######', '##o####', '##u@=D#', '#oo####', '#u@=D##', '#o#####', '#.#####', '#######'],
      batDau: { x: 1, y: 6, huong: 0 },
      maMau: bai(['for i in range(2):', '    fill_pit()']),
      loiGiai: bai(['for i in range(2):', '    fill_pit()', '    spin_lob()', '    turn_left()']),
      sao: { o: 25, nhip: 15 },
      loiGiaiKhac: {
        moTa: 'Không cần turn_left() ở lượt cuối cùng',
        baiLam: bai(['fill_pit()', 'spin_lob()', 'turn_left()', 'fill_pit()', 'spin_lob()'])
      },
      loiSai: [
        { moTa: 'Mới gọi fill_pit() mà chưa gọi spin_lob() để hất đá vào đích', baiLam: bai(['for i in range(2):', '    fill_pit()']), phaiCoMa: ['nem-vo'] },
        { moTa: 'Quên gọi turn_left() sau spin_lob(): ở bậc thứ hai xe vẫn quay mặt sang phải nên đâm vào hàng rào', baiLam: bai(['for i in range(2):', '    fill_pit()', '    spin_lob()']), phaiCoMa: ['nap-hut', 'nem-hut'] }
      ],
      goiY: ['Luna: Sau fill_pit(), trước mặt xe là tảng đá thứ hai và bên phải xe là bàn xoay "@".', 'Luna: Gọi spin_lob() để hất đá vào đích, rồi gọi turn_left() để mũi xe hướng lên trên.']
    }),

    manCheBanXoay({
      so: 20, ten: 'Trùm chế lệnh vượt mỏ đá', hang: 'trum', hamCuaEmCan: ['move', 'forward', 'slide_r', 'slide_l', 'lob', 'lob_if', 'scan_row', 'auto_fill'],
      huyHieu: { ma: 'che-ban-xoay', ten: 'Huy hiệu Chế lệnh: vượt mỏ đá' },
      deBai: 'Sola nhờ bạn: trùm cuối gói Bàn xoay và Sàn dốc! Đầu tiên gọi scan_row(3) để quét và lấp cây cầu hố sâu ở tầng giữa, rồi gọi forward(2) bước lên cầu và slide_l(3) trượt về cột 1. Từ đó, lặp 3 lần auto_fill() để vừa tự lấp hố dọc đường vừa tiến lên sàn dốc ">" ở đỉnh mỏ trượt vào cờ!',
      veMaMau: 'Chương trình có sẵn đã bắc cầu bằng scan_row(3), forward(2), slide_l(3). Hãy thêm vòng lặp 3 lần auto_fill() ở cuối.',
      san: [
        ['######', '#.F###', '#u####', '#o####', '#.u.u#', '##o=o#', '#....#', '######'],
        ['######', '#uF###', '#o####', '#.####', '#..uu#', '##=oo#', '#....#', '######']
      ],
      sanDoc: [
        ['......', '.>....', '......', '......', '......', '......', '......', '......'],
        ['......', '.>....', '......', '......', '......', '......', '......', '......']
      ],
      batDau: [{ x: 1, y: 6, huong: 0 }, { x: 1, y: 6, huong: 0 }],
      maMau: bai(['scan_row(3)', 'forward(2)', 'slide_l(3)']),
      loiGiai: bai(['scan_row(3)', 'forward(2)', 'slide_l(3)', 'for i in range(3):', '    auto_fill()']),
      sao: { o: 30, nhip: 17 },
      loiGiaiKhac: {
        moTa: 'Gọi 3 lần auto_fill() liên tiếp ở đoạn cuối',
        baiLam: bai(['scan_row(3)', 'forward(2)', 'slide_l(3)', 'auto_fill()', 'auto_fill()', 'auto_fill()'])
      },
      loiSai: [
        { moTa: 'Mới đi qua cầu về cột 1 mà chưa đi lên đỉnh mỏ', baiLam: bai(['scan_row(3)', 'forward(2)', 'slide_l(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng forward(3) thay vì auto_fill() ở cột 1: xe đâm vào tảng đá', baiLam: bai(['scan_row(3)', 'forward(2)', 'slide_l(3)', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Sau slide_l(3), xe đang đứng ở (1, 4) hướng lên trên.', 'Luna: Thêm for i in range(3): auto_fill() để xe tự dọn đá lấp hố lên tới (1, 1) và trôi sang cờ.']
    })
  ];

  ManHoc.manSanMoDa = DS;
  if (laNode) module.exports = DS;
})();

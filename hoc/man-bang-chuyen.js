/* ============================================================================
   man-bang-chuyen.js — "Đường học": CHƯƠNG `bang-chuyen` · BĂNG CHUYỀN (10 màn).
   Xe hai bánh có tay gắp, Xưởng hàm mở (moXuong true), được dùng hàm của em. Hàm gốc như chương
   vong-lap (bánh, wait, 4 lệnh tay). Chương trình 10 ô; mỗi hàm một khung riêng 10 ô.
   Đã học `for` ở chương vong-lap nên cauTruc ['for'].

   LUẬT BĂNG CHUYỀN (san-hoc.js): sau mỗi nhịp, nếu xe đang đứng trên ô băng thì đếm +1; đủ 2 nhịp
   liền thì băng đẩy xe 1 ô theo mũi tên (bị chặn thì đứng yên) rồi đếm về 0. Xe quay hay đứng chờ
   trên băng cũng được đếm. Tay hạ sát đất không cản băng đẩy; vật xe đang cầm đi theo xe; vật nằm dưới
   đất không bị băng đẩy.
     - Đi cùng chiều băng: 3 ô / 2 nhịp.   - Đi ngược chiều băng: 1 ô / 2 nhịp.   - Đứng chờ: 1 ô / 2 nhịp.
   Các màn không tạo hàm mới (taoHam rỗng): chỉ dùng kho từ chương trước.
   Hàm của em các màn giả định: move, turn_right, turn_left, pick, drop, carry, bend_left, bend_right.

   Sân dựng thành HÀNH LANG (mọi ô ngoài đường đi là tường) để không có đường tắt. Hai chỗ có hai lối thật:
   5.3 (hai cột băng: một cột giúp xe, một cột cản) và 5.4 (phòng hở, dải băng bốn hàng đẩy xe lệch).
   BFS tính cả băng chuyền (tới cờ: kiem-hoc.mjs; dua-vat: do-duong-tay.mjs) xác nhận đường nhanh nhất.

   Trường riêng của chương này:
   - canFor: 'tran-khung' — viết KHÔNG dùng for (trải hết vòng lặp ra) thì tràn khung 10 ô;
             'mat-sao'    — viết không dùng for vẫn vừa khung nhưng không đạt 3 sao (nhiều ô hơn).
     (kiem-bang-chuyen.mjs tự trải for của lời giải để chứng minh.)
   - nhipTheoLoiGiai: true — sao.nhip là nhịp của lời giải CHUẨN, có thể dài hơn đường ngắn nhất (BFS)
     do pick() / drop() còn nâng tay ở nhịp riêng, hoặc do chọn cách chờ băng cho dễ viết (5.9).
     Máy kiểm chỉ đòi BFS <= sao.nhip. Các màn đặt cờ này: 5.5, 5.9, 5.10.

   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   (Hai màn băng chuyền cũ bc.1 / bc.2 từng ở tệp này đã được thay bằng 5.1 và 5.3.)
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];

  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for: dòng đầu rồi thân thụt 4 dấu cách. */
  function FOR(n, than, bien) {
    return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; }));
  }

  function man(m) {
    m.chuong = 'bang-chuyen';
    m.cauTruc = ['for'];
    m.loaiRobot = 'banh'; m.hamGoc = HAM_GOC;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------- sân dùng lại */

  // 5.6: một bậc thang (đi, rẽ phải, đi, rẽ trái); ô băng nằm giữa hàng đẩy xe cả lúc xe đang quay
  var CUM_BAC = ['move()', 'turn_right()', 'move()', 'turn_left()'];
  // 5.10: một chuyến chở qua đoạn băng 3 ô rồi rẽ phải đi tới vật kế tiếp
  var CHUYEN = ['carry()', 'turn_right()', 'move()'];

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Lên băng', hang: 'lam-quen', canFor: 'mat-sao', hamCuaEmCan: ['move'],
      deBai: 'Băng chuyền đẩy xe đang đứng trên nó đi một ô sau mỗi hai nhịp, theo chiều mũi tên. Đưa xe tới cờ trong ít nhịp nhất.',
      veMaMau: 'Chương trình có sẵn cho xe đứng yên ba nhịp trên băng chuyền. Chạy thử, xem băng đưa xe đi bao xa rồi nghĩ cách tới cờ nhanh hơn.',
      san: ['#######', '>>>>>>F', '#######'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: FOR(3, ['wait()']) },
      sao: { o: 5, nhip: 4 },
      loiGiai: { chinh: FOR(4, ['move()']) },
      loiGiaiKhac: { moTa: 'Không dùng vòng lặp: gọi move() bốn lần', baiLam: { chinh: lap('move()', 4) } },
      loiSai: [
        { moTa: 'Chỉ đứng chờ trên băng: tới cờ nhưng chậm', baiLam: { chinh: FOR(12, ['wait()']) }, phaiCoMa: [] },
        { moTa: 'Chờ chưa đủ lâu: băng chưa đưa xe tới cờ', baiLam: { chinh: FOR(8, ['wait()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi ba nhịp rồi dừng: xe còn cách cờ một ô', baiLam: { chinh: FOR(3, ['move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dòng move() không thụt lề vào thân vòng lặp', baiLam: { chinh: ['for i in range(4):', 'move()'] }, phaiCoMa: ['loi-cu-phap'] }
      ],
      goiY: ['Cứ hai nhịp đứng trên băng, băng đẩy xe thêm một ô. Xe tự đi cùng chiều thì được cả hai.',
        'Thử đếm xem nếu nhịp nào xe cũng đi thì cần mấy nhịp.']
    }),

    man({
      so: 2, ten: 'Ngược dòng', hang: 'lam-quen', canFor: 'mat-sao', hamCuaEmCan: ['move'],
      deBai: 'Băng chuyền chạy ngược chiều xe: cứ hai nhịp xe đứng trên băng thì bị kéo lùi một ô. Đưa xe tới cờ ở đầu bên kia.',
      san: ['#######', 'F>>>>>.', '#######'],
      batDau: { x: 6, y: 1, huong: 3 },
      maMau: { chinh: [] },
      sao: { o: 5, nhip: 10 },
      loiGiai: { chinh: FOR(10, ['move()']) },
      loiGiaiKhac: { moTa: 'Vòng lặp năm lần, mỗi lần hai move()', baiLam: { chinh: FOR(5, ['move()', 'move()']) } },
      loiSai: [
        { moTa: 'Đếm theo số ô: lặp sáu lần, xe chưa qua hết băng', baiLam: { chinh: FOR(6, ['move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Lặp thiếu một lần: range(9)', baiLam: { chinh: FOR(9, ['move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không dùng vòng lặp: mười một dòng, quá 10 ô', baiLam: { chinh: lap('move()', 11) }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Thêm một vòng lặp dư: vẫn tới nhưng tốn ô hơn', baiLam: { chinh: nhieu(FOR(10, ['move()']), FOR(2, ['move()'])) }, phaiCoMa: [] }
      ],
      goiY: ['Xe đi ngược chiều băng: cứ hai nhịp thì băng kéo xe lùi một ô.',
        'Thử số lần lặp nhỏ, xem xe dừng ở đâu rồi tăng dần.']
    }),

    man({
      so: 3, ten: 'Chọn cột băng', hang: 'lam-quen', canFor: 'tran-khung', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Hai cột băng chuyền dài bằng nhau dẫn lên hàng cờ: một cột chạy lên, một cột chạy xuống. Chọn cột để xe tới cờ trong ít nhịp nhất.',
      san: ['#..F..#', '#v###^#', '#v###^#', '#v###^#', '#v###^#', '#v###^#', '#.....#'],
      batDau: { x: 3, y: 6, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 16, nhip: 11 },
      loiGiai: { chinh: nhieu(['turn_right()'], FOR(2, ['move()']), ['turn_left()'], FOR(4, ['move()']), ['turn_left()'], FOR(2, ['move()'])) },
      loiGiaiKhac: {
        moTa: 'Cùng cột đó, cột băng đi bằng vòng lặp hai move() mỗi lần',
        baiLam: { chinh: nhieu(['turn_right()'], FOR(2, ['move()']), ['turn_left()'], FOR(2, ['move()', 'move()']), ['turn_left()'], FOR(2, ['move()'])) }
      },
      loiSai: [
        { moTa: 'Chọn cột chạy xuống: băng kéo xe lùi nên tới cờ rất chậm',
          baiLam: { chinh: nhieu(['turn_left()'], FOR(2, ['move()']), ['turn_right()'], FOR(10, ['move()']), ['turn_right()'], FOR(2, ['move()'])) }, phaiCoMa: [] },
        { moTa: 'Đi lố lên cột một lần: xe đâm vào mép sân',
          baiLam: { chinh: nhieu(['turn_right()'], FOR(2, ['move()']), ['turn_left()'], FOR(5, ['move()']), ['turn_left()'], FOR(2, ['move()'])) }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên rẽ trái ở hàng cờ: xe chạy ra ngoài sân',
          baiLam: { chinh: nhieu(['turn_right()'], FOR(2, ['move()']), ['turn_left()'], FOR(4, ['move()']), FOR(2, ['move()'])) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không dùng vòng lặp: mười một dòng, quá 10 ô',
          baiLam: { chinh: nhieu(['turn_right()'], lap('move()', 2), ['turn_left()'], lap('move()', 4), ['turn_left()'], lap('move()', 2)) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Băng chạy cùng chiều xe đi thì giúp xe; chạy ngược chiều thì kéo xe lại.',
        'Hai cột dài bằng nhau, nên chỉ cần so xem băng nào giúp xe.']
    }),

    /* ------------------------------------------------------------- hàng 2 */
    man({
      so: 4, ten: 'Trôi lệch', hang: 'luyen', canFor: 'mat-sao', hamCuaEmCan: ['move', 'turn_left'],
      deBai: 'Xe phải đi thẳng lên qua một dải băng chuyền rộng bốn hàng, nhưng băng sẽ đẩy xe lệch sang bên. Đưa xe tới cờ.',
      san: ['#..F..#', '#.....#', '#>>>>>#', '#>>>>>#', '#>>>>>#', '#>>>>>#', '#.....#'],
      batDau: { x: 3, y: 6, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 10, nhip: 9 },
      loiGiai: { chinh: nhieu(FOR(6, ['move()']), ['turn_left()'], FOR(2, ['move()'])) },
      loiGiaiKhac: { moTa: 'Không dùng vòng lặp: gọi move() từng lần', baiLam: { chinh: nhieu(lap('move()', 6), ['turn_left()'], lap('move()', 2)) } },
      loiSai: [
        { moTa: 'Đi thẳng sáu ô rồi dừng: xe đã lệch phải, chưa tới cờ', baiLam: { chinh: FOR(6, ['move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bù nhầm hướng: rẽ phải, đâm vào tường', baiLam: { chinh: nhieu(FOR(6, ['move()']), ['turn_right()'], FOR(2, ['move()'])) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Bù thiếu một ô: xe dừng cạnh cờ', baiLam: { chinh: nhieu(FOR(6, ['move()']), ['turn_left()'], ['move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ trái trước khi hết dải băng: băng lại đẩy xe lệch tiếp', baiLam: { chinh: nhieu(FOR(4, ['move()']), ['turn_left()'], FOR(4, ['move()'])) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Băng đẩy xe sang bên mỗi khi xe đã ở trên băng đủ hai nhịp, kể cả lúc đang đi qua.',
        'Chạy thử đi thẳng một mạch và xem xe tới ô nào của hàng trên cùng.']
    }),

    man({
      so: 5, ten: 'Chở qua băng', hang: 'luyen', canFor: 'mat-sao', hamCuaEmCan: ['move', 'turn_right', 'pick', 'drop'],
      deBai: 'Xe đứng trên vật. Mang vật đi qua đoạn băng chuyền, rẽ xuống rồi đặt vật lên ô đích.',
      san: ['o.>>>>.', '######.', '######D'],
      batDau: { x: 0, y: 0, huong: 1 },
      mucTieu: 'dua-vat', nhipTheoLoiGiai: true,
      maMau: { chinh: [] },
      sao: { o: 22, nhip: 11 },
      loiGiai: { chinh: nhieu(['pick()'], FOR(5, ['move()']), ['turn_right()'], FOR(2, ['move()']), ['drop()']) },
      loiGiaiKhac: { moTa: 'Không dùng vòng lặp: gọi move() từng lần', baiLam: { chinh: nhieu(['pick()'], lap('move()', 5), ['turn_right()'], lap('move()', 2), ['drop()']) } },
      loiSai: [
        { moTa: 'Đếm theo số ô: lặp sáu lần, xe đâm vào mép sân một nhịp', baiLam: { chinh: nhieu(['pick()'], FOR(6, ['move()']), ['turn_right()'], FOR(2, ['move()']), ['drop()']) }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Lặp thiếu hai lần: xe rẽ khi còn ở giữa băng, rồi đâm tường', baiLam: { chinh: nhieu(['pick()'], FOR(3, ['move()']), ['turn_right()'], FOR(2, ['move()']), ['drop()']) }, phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Quên pick(): xe đi tay không rồi thả, chẳng có vật nào', baiLam: { chinh: nhieu(FOR(5, ['move()']), ['turn_right()'], FOR(2, ['move()']), ['drop()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả vật bằng release() khi tay còn nâng: vật vỡ', baiLam: { chinh: nhieu(['pick()'], FOR(5, ['move()']), ['turn_right()'], FOR(2, ['move()']), ['release()', 'wait()']) }, phaiCoMa: ['vat-vo'] }
      ],
      goiY: ['Băng chuyền đẩy cả xe lẫn vật xe đang cầm. Cứ hai nhịp đứng trên băng là xe được đẩy một ô.',
        'Số lần gọi move() ít hơn số ô xe phải đi; thử đếm theo từng nhịp.']
    }),

    man({
      so: 6, ten: 'Bậc thang băng', hang: 'luyen', canFor: 'tran-khung', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Đường xuống ba bậc thang, mỗi bậc có một ô băng chuyền chạy sang phải. Đưa xe tới cờ ở bậc cuối trong ít nhịp nhất.',
      san: ['.>.####', '##.>.##', '####.>.', '######F'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 12, nhip: 11 },
      loiGiai: { chinh: FOR(3, CUM_BAC) },
      loiGiaiKhac: { moTa: 'Vòng lặp hai bậc, bậc cuối viết riêng', baiLam: { chinh: nhieu(FOR(2, CUM_BAC), ['move()', 'turn_right()', 'move()']) } },
      loiSai: [
        { moTa: 'Đi hai ô mỗi bậc, không để ý băng: tới cờ nhưng chậm', baiLam: { chinh: FOR(3, ['move()', 'move()', 'turn_right()', 'move()', 'turn_left()']) }, phaiCoMa: [] },
        { moTa: 'Lặp hai bậc thay vì ba: xe dừng giữa đường', baiLam: { chinh: FOR(2, CUM_BAC) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên rẽ trái cuối mỗi bậc: xe đi sai hướng, đâm tường', baiLam: { chinh: FOR(3, ['move()', 'turn_right()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không dùng vòng lặp: hơn 10 dòng', baiLam: { chinh: nhieu(CUM_BAC, CUM_BAC, CUM_BAC) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Băng đẩy xe sau khi xe ở trên nó đủ hai nhịp, dù xe đang đi hay đang quay.',
        'Thử xem chuyện gì xảy ra khi xe quay ngay trên ô băng.']
    }),

    /* ------------------------------------------------------------- hàng 3 */
    man({
      so: 7, ten: 'Sửa số lần lặp', hang: 'bien-the', canFor: 'tran-khung', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Xe đi sang phải ngược chiều dải băng chuyền, rẽ phải ở cuối hàng rồi đi xuống tới cờ.',
      veMaMau: 'Chương trình có sẵn lặp sáu lần, đúng bằng số ô xe phải đi, nhưng xe lại rẽ sai chỗ. Chạy thử, xem xe rẽ ở đâu rồi chỉnh số lần lặp.',
      san: ['.<<<<<.', '######.', '######.', '######.', '######F'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: nhieu(FOR(6, ['move()']), ['turn_right()'], FOR(4, ['move()'])) },
      sao: { o: 10, nhip: 15 },
      loiGiai: { chinh: nhieu(FOR(10, ['move()']), ['turn_right()'], FOR(4, ['move()'])) },
      loiGiaiKhac: { moTa: 'Chỗ đi ngược băng viết thành năm lần hai move()', baiLam: { chinh: nhieu(FOR(5, ['move()', 'move()']), ['turn_right()'], FOR(4, ['move()'])) } },
      loiSai: [
        { moTa: 'Không sửa gì: lặp sáu lần nên xe rẽ giữa dải băng', baiLam: { chinh: nhieu(FOR(6, ['move()']), ['turn_right()'], FOR(4, ['move()'])) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Sửa thiếu: range(9) vẫn rẽ khi xe còn trên băng', baiLam: { chinh: nhieu(FOR(9, ['move()']), ['turn_right()'], FOR(4, ['move()'])) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sửa dư: range(12), xe đâm vào mép sân vài nhịp rồi mới rẽ', baiLam: { chinh: nhieu(FOR(12, ['move()']), ['turn_right()'], FOR(4, ['move()'])) }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Không dùng vòng lặp: mười lăm dòng, quá 10 ô', baiLam: { chinh: nhieu(lap('move()', 10), ['turn_right()'], lap('move()', 4)) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Xe đi ngược chiều băng: cứ hai nhịp lại bị kéo lùi một ô, nên cần nhiều nhịp hơn số ô.',
        'Chạy thử rồi nhìn từng nhịp: xe có đứng ở ô cuối của hàng khi bắt đầu rẽ không?']
    }),

    man({
      so: 8, ten: 'Rắn băng', hang: 'bien-the', canFor: 'tran-khung', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'bend_left', 'bend_right'],
      deBai: 'Hành lang ba hàng, mỗi hàng là một dải băng chuyền chạy sang phải. Xe đi hàng trên sang phải, hàng giữa sang trái, hàng dưới sang phải tới cờ.',
      san: ['.>>>>>.', '######.', '.>>>>>.', '.######', '.>>>>>F'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 23, nhip: 26 },
      loiGiai: { chinh: nhieu(FOR(4, ['move()']), ['bend_right()'], FOR(10, ['move()']), ['bend_left()'], FOR(4, ['move()'])) },
      loiGiaiKhac: { moTa: 'Hàng giữa viết thành năm lần hai move()', baiLam: { chinh: nhieu(FOR(4, ['move()']), ['bend_right()'], FOR(5, ['move()', 'move()']), ['bend_left()'], FOR(4, ['move()'])) } },
      loiSai: [
        { moTa: 'Đếm hàng giữa theo số ô: lặp sáu lần, xe dừng giữa hàng', baiLam: { chinh: nhieu(FOR(4, ['move()']), ['bend_right()'], FOR(6, ['move()']), ['bend_left()'], FOR(4, ['move()'])) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Cả ba hàng đều lặp bốn lần: hàng giữa đi ngược băng nên thiếu nhiều', baiLam: { chinh: nhieu(FOR(4, ['move()']), ['bend_right()'], FOR(4, ['move()']), ['bend_left()'], FOR(4, ['move()'])) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ nhầm hướng ở chỗ nối thứ hai: xe đâm tường', baiLam: { chinh: nhieu(FOR(4, ['move()']), ['bend_right()'], FOR(10, ['move()']), ['bend_right()'], FOR(4, ['move()'])) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không dùng vòng lặp: hơn 10 dòng', baiLam: { chinh: nhieu(lap('move()', 4), ['bend_right()'], lap('move()', 10), ['bend_left()'], lap('move()', 4)) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Cùng một dải băng, hàng đi xuôi chiều và hàng đi ngược chiều cần số lần lặp khác nhau.',
        'Chỗ nối hai hàng là một khúc rẽ ngoài băng: em đã có hàm cho nó.']
    }),

    man({
      so: 9, ten: 'Chờ băng', hang: 'bien-the', canFor: 'mat-sao', hamCuaEmCan: ['move', 'pick', 'drop'],
      deBai: 'Xe đứng trên vật, đường tới ô đích là một lối băng chuyền có khúc cua. Mang vật tới ô đích.',
      veMaMau: 'Chương trình có sẵn mang vật lên băng, chờ rồi thả, nhưng thả sớm quá. Chạy thử, xem xe đã tới đâu lúc thả rồi chỉnh số lần chờ.',
      san: ['o>>v###', '###v###', '###D###'],
      batDau: { x: 0, y: 0, huong: 1 },
      mucTieu: 'dua-vat', nhipTheoLoiGiai: true,
      maMau: { chinh: nhieu(['pick()', 'move()'], FOR(4, ['wait()']), ['drop()']) },
      sao: { o: 18, nhip: 11 },
      loiGiai: { chinh: nhieu(['pick()', 'move()'], FOR(7, ['wait()']), ['drop()']) },
      loiGiaiKhac: { moTa: 'Chờ viết thành ba lần hai wait() rồi thêm một wait()', baiLam: { chinh: nhieu(['pick()', 'move()'], FOR(3, ['wait()', 'wait()']), ['wait()', 'drop()']) } },
      loiSai: [
        { moTa: 'Không sửa gì: chờ bốn nhịp rồi thả, vật bị đặt giữa lối băng', baiLam: { chinh: nhieu(['pick()', 'move()'], FOR(4, ['wait()']), ['drop()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chờ thiếu một nhịp: thả khi xe còn đứng trên ô băng cuối', baiLam: { chinh: nhieu(['pick()', 'move()'], FOR(6, ['wait()']), ['drop()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chờ dư vài nhịp: vật vẫn tới đích nhưng chậm', baiLam: { chinh: nhieu(['pick()', 'move()'], FOR(9, ['wait()']), ['drop()']) }, phaiCoMa: [] },
        { moTa: 'Quên cho xe lên băng: đứng chờ ngay chỗ cũ', baiLam: { chinh: nhieu(['pick()'], FOR(7, ['wait()']), ['drop()']) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Băng chuyền tự đưa xe và vật đi, kể cả qua khúc cua; cứ hai nhịp xe đứng trên băng là đi thêm một ô.',
        'Đếm các ô băng từ chỗ xe lên đến ô đích, mỗi ô mất hai nhịp chờ.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Ba chuyến băng', hang: 'trum', canFor: 'tran-khung', hamCuaEmCan: ['move', 'turn_right', 'pick', 'drop', 'carry'],
      deBai: 'Ba vật nằm trên một đường dài có nhiều đoạn băng chuyền, mỗi vật có một ô đích riêng. Đưa cả ba vật tới ô đích.',
      san: ['###o>>D', '######o', '######v', '######v', '##D>>oD'],
      batDau: { x: 3, y: 0, huong: 1 },
      mucTieu: 'dua-vat', nhipTheoLoiGiai: true,
      maMau: { chinh: [] },
      sao: { o: 27, nhip: 23 },
      huyHieu: { ma: 'bang-chuyen', ten: 'Huy hiệu Băng chuyền' },
      loiGiai: { chinh: nhieu(FOR(2, CHUYEN), ['pick()'], FOR(4, ['move()']), ['drop()']) },
      loiGiaiKhac: { moTa: 'Không dùng vòng lặp cho hai chuyến đầu', baiLam: { chinh: nhieu(CHUYEN, CHUYEN, ['pick()'], FOR(4, ['move()']), ['drop()']) } },
      loiSai: [
        { moTa: 'Chuyến cuối cũng dùng carry(): đi ngược băng, hai bước không đủ', baiLam: { chinh: FOR(3, CHUYEN) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chuyến cuối đi bốn bước nhưng thả bằng release() khi tay còn nâng: vật vỡ', baiLam: { chinh: nhieu(FOR(2, CHUYEN), ['pick()'], FOR(4, ['move()']), ['release()', 'wait()']) }, phaiCoMa: ['vat-vo'] },
        { moTa: 'Quên rẽ giữa hai chuyến: xe đâm tường', baiLam: { chinh: nhieu(FOR(2, ['carry()', 'move()']), ['pick()'], FOR(4, ['move()']), ['drop()']) }, phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Chuyến cuối đi thiếu một bước: vật bị thả giữa băng', baiLam: { chinh: nhieu(FOR(2, CHUYEN), ['pick()'], FOR(3, ['move()']), ['drop()']) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Có những chuyến giống hệt nhau, và có một chuyến băng chạy ngược chiều xe.',
        'Xe chở xong một chuyến vẫn phải rẽ rồi đi tới vật kế tiếp.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

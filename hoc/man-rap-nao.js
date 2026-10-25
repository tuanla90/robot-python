/* ============================================================================
   man-rap-nao.js — "Học lập trình": CHƯƠNG `rap-nao` · LẮP RÁP: THÂN + NÃO (10 màn, chế độ lắp ráp: KE-HOACH-LAP-RAP.md, lõi lap-rap.js).
   Người chơi tự chọn THÂN (hai bánh · xích · omni · nhện) và NÃO = cảm biến (khoảng cách · màu · camera · không gắn) dưới một NGÂN SÁCH XU, rồi mới viết code.
   Không có tay, không có drone, không có cảm biến từ. Yếu tố sân chỉ dùng thứ đã gặp tới gói Cảm biến màu: tường, bậc thang S, gầm thấp n, hố u, băng chuyền, ô màu, vật.
   Giá (lap-rap.js): thân 2 · 3 · 4 · 4 (hai bánh · xích · omni · nhện); não 0 · 1 · 2 · 2 (không · khoảng cách · màu · camera).

   KHUNG 10 DÒNG (điều phối 17/10): khung chương trình chính của giao diện chỉ có 10 dòng (khung.chinh = 10, mỗi hàm cũng 10), nên MỌI lời giải của chương (lời giải mặc định, loiGiaiKhac,
   congThucKhac, mọi cachLap[i].loiGiai, lời sai) là chương trình chính ≤ 10 dòng, viết bằng các hàm của em đã chế ở các chương trước (forward, move, turn_right, stair, dodge_right, to_gap, go_wall,
   read_turn, follow_right, tr_right, sidestep, slide_r, go, walk…) cùng vài lệnh gốc. Màn khai `lapRap.dungKho: true`: lap-rap.js chạy lời giải mẫu trên KHO THAM CHIẾU (LapRap.khoMau: mọi hàm của em
   các màn thường đứng trước) nên bảng "Cách lắp khác" và máy kiểm không phụ thuộc kho thật của người chơi. hamCuaEmCan để trống (hàm là tuỳ chọn, khay chỉ hiện hàm hợp với robot đang lắp);
   lời giải KHÔNG tạo / sửa hàm của em nào (taoHam rỗng).

   SAO Ô (sao.o): sao.o = ô của lời giải cách đầu = ô LỚN NHẤT trong các cách viết tự nhiên (hàm khác của kho, có hay không vòng for, viết thẳng lệnh gốc nếu vừa 10 dòng); mọi biến thể tự nhiên
   đánh dấu dat3sao: true trong congThucKhac đạt 3 sao (kiem-rap-nao.mjs kiểm trên kho THẬT lẫn kho CỔ ĐIỂN), nên dùng hàm của kho không mất sao ô. Lời giải khác (2 sao) viết dài hơn một chút
   (bỏ vòng lặp, thêm biến) nên nhiều ô hơn sao.o, cùng nhịp.

   Luật cân màn (lap-rap.js kiemCanMan + kiem-rap-nao.mjs): mỗi màn có ≥ 2 cách lắp mẫu (`lapRap.cachLap`), mỗi cách một lời giải chạy thật; cachLap[0] là cách 3 sao (sao.nhip, sao.o);
   không cách nào hơn hẳn cách khác ở cả giá, nhịp lẫn ô. Máy kiểm còn dò BFS (do-duong-rap-nao.mjs) cho MỌI cách lắp vừa ngân sách: không thân nào đi nhanh hơn sao.nhip.
   Ngoại lệ có chủ ý: NHỆN CÓ THỂ "NHẢY CÓC" (co chân rồi duỗi chân cùng bước đi = bật qua một ô, 2 ô trong 2 nhịp) nên BFS của nhện thấp hơn lời giải tự nhiên; màn có nhện làm
   cách 3 sao hay làm cách tham chiếu khai `nhipTheoLoiGiai: true` (sao.nhip = nhịp của lời giải chuẩn, BFS ≤ sao.nhip) và máy kiểm chỉ cho phép CHÍNH nhện đi dưới ngưỡng đó.

   Bảng màn (xu · nhịp · ô của cách mẫu, kiểu ngưỡng; sao.o = ô cách đầu):
     1  Qua bậc thang      một sân    bậc thang chặn đường thẳng      xích 3xu/3n/6ô (leo thẳng) · hai bánh 2xu/8n/15ô (đi vòng)
     2  Hành lang chéo     một sân    sáu ô chéo, rẽ liên tục          omni 4xu/6n/9ô (trượt ngang) · hai bánh 2xu/11n/13ô (rẽ rồi rẽ lại)
     3  Chui gầm           một sân    tường có một ô gầm thấp          nhện 4xu/8n/12ô (co chân chui) · hai bánh 2xu/15n/15ô (vòng xa)
     4  Ngược dòng         một sân    băng chuyền chạy ngược chiều xe  xích 3xu/8n/6ô (băng không đẩy được) · hai bánh 2xu/13n/6ô (bị đẩy lùi)
     5  Tìm cửa hông       ba sân     cửa hông ở hàng khác nhau (cần khoảng cách)   omni + khoảng cách 5xu/20n/11ô · hai bánh + khoảng cách 3xu/23n/12ô
     6  Mê cung ngõ cụt    ba sân     vạch màu báo rẽ + ngõ cụt hai bên    hai bánh + màu 4xu/55n/14ô (đi thẳng tới đích) · hai bánh + khoảng cách 3xu/77n/16ô (dò từng ngõ)
     7  Ba lối đi          một sân    bậc thang · gầm · lối hở xa      nhện 4xu/12n/12ô · xích 3xu/14n/17ô · hai bánh 2xu/19n/15ô
     8  Nhảy qua hố        một sân    hàng hố chừa lối bên phải        nhện 4xu/10n/15ô (nhảy) · hai bánh 2xu/17n/15ô (vòng)
     9  Hộp chỉ đường      ba sân     hộp màu ở ngã ba chỉ lối (cần camera)  omni + camera 6xu/21n/17ô · hai bánh + camera 4xu/27n/21ô
    10  Kho hàng (trùm)    ba sân     bậc thang + hộp chỉ đường, hành lang dài ngắn khác nhau   xích + camera 5xu/39n/23ô · nhện + camera 6xu/54n/17ô

   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  /* ------------------------------------------------------------------ lệnh gốc dựng sẵn */
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  /** Vòng for lặp các lệnh `lenh` (mảng) `n` lần. */
  function LAP(n, lenh) { return ['for i in range(' + n + '):'].concat(thut(lenh)); }
  var TIEN = ['left_move()', 'right_move()', 'wait()'];            // xe hai bánh / xích / omni tiến một ô
  var QUAY_PHAI = ['left_move()', 'wait()'];                       // hai bánh / omni rẽ phải 90° (1 nhịp)
  var QUAY_TRAI = ['right_move()', 'wait()'];
  var TRUOT_PHAI = ['slide_right()', 'wait()'], TRUOT_TRAI = ['slide_left()', 'wait()'];
  function dem(n, s) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }

  /**
   * Dựng một màn lắp ráp: điền chương, cấu trúc cho phép, khung 10 dòng, kho tham chiếu cho lời giải mẫu, nhiều sân (nhipTheo 'tong', batDau song song). ManHoc.chuanHoa điền robot mặc định theo cachLap[0].
   */
  function man(m) {
    m.chuong = 'rap-nao';
    m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.lapRap.dungKho = true;
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    m.maMau = { chinh: [] };
    return ManHoc.chuanHoa(m);
  }

  /* ---------------------------------------------------------------------------- sân */
  // 1: bậc thang ngay trước cờ, một lối hẹp bên trái
  var SAN_1 = ['.....', '..F..', '#.S##', '.....', '.....'];
  // 2: hành lang chéo sáu ô (lên, phải, lên, phải, lên, phải), tường kín hai bên
  var SAN_2 = ['####', '##.F', '#..#', '..##', '.###'];
  // 3: tường chắn ngang, một ô gầm thấp bên trái, một lối hở bên phải
  var SAN_3 = ['F....', '.....', 'n###.', '.....', '.....'];
  // 4: hành lang hẹp dài, sáu ô băng chuyền chạy xuống (ngược chiều xe đi lên)
  var SAN_4 = ['..F..', '##v##', '##v##', '##v##', '##v##', '##v##', '##v##', '.....', '.....'];
  // 5: hành lang dọc cột 1; cửa hông dẫn tới cờ F ở bên phải nằm ở hàng j (ba sân j = 1, 4, 2), các hàng khác tường kín
  function cuaHong(j) { var r = []; for (var y = 0; y < 7; y++) r.push(y === j ? '#...F#' : '#.####'); return r; }
  var SAN_5 = [cuaHong(1), cuaHong(4), cuaHong(2)];
  var BD_5 = { x: 1, y: 6, huong: 0 };
  // 6: ba mê cung một lối có ngõ cụt hai bên đường (bộ ba chọn bằng bộ sinh: chương trình viết mù cho cả ba sân rất tốn nhịp); ô đỏ = rẽ phải, ô xanh dương = rẽ trái (đặt đúng ô góc)
  var SAN_6 = [
    ['####F.b', '######.', 'r.....b', '.######', 'rb#####', '#...###', '#.#####'],
    ['##r...r', '##.###.', '##.#b.r', '##.#F##', '##.####', '##..###', '##.####'],
    ['#######', '#######', 'b...b##', '.#.#.##', '.###...', 'b.F#.##', '####.##']
  ];
  var BD_6 = [{ x: 1, y: 6, huong: 0 }, { x: 2, y: 6, huong: 0 }, { x: 4, y: 6, huong: 0 }];
  // 7: tường chắn ngang có ba lối: gầm thấp (thẳng trước mặt), bậc thang (bên cạnh), lối hở (xa nhất)
  var SAN_7 = ['.F.....', '.......', '.......', '#nS###.', '.......', '.......', '.......'];
  // 8: hàng hố chừa lối bên phải
  var SAN_8 = ['F....', '.....', '.....', 'uuuu.', '.....', '.....', '.....'];
  // 9: ngã ba có hộp chỉ đường màu ở giữa (vật có màu): đỏ = cờ ở lối phải, xanh dương = cờ ở lối trái
  function nga3(trai) { return ['#' + (trai ? 'F' : '.') + '#' + (trai ? '.' : 'F') + '#', '#.#.#', '#.#.#', '#.o.#', '#...#', '##.##', '##.##']; }
  function bien9(c) { return ['.....', '.....', '.....', '..' + c + '..', '.....', '.....', '.....']; }
  var SAN_9 = [nga3(true), nga3(false), nga3(false)];
  var VAT_MAU_9 = [bien9('b'), bien9('r'), bien9('r')];
  var BD_9 = { x: 2, y: 6, huong: 0 };
  // 10: kho hàng: hành lang dưới có bậc thang S, ngã ba có hộp chỉ đường; hàng ngã ba (yp) và hàng bậc thang (yS) khác nhau ở mỗi sân
  function kho10(yp, trai, yS) {
    var rows = [];
    for (var y = 0; y < 9; y++) {
      var r = '';
      for (var x = 0; x < 7; x++) {
        var c = '#';
        if (y < yp - 1) { if (x === 2) c = (y === 0 && trai) ? 'F' : '.'; if (x === 4) c = (y === 0 && !trai) ? 'F' : '.'; }
        else if (y === yp - 1) { if (x === 2 || x === 4) c = '.'; if (x === 3) c = 'o'; }
        else if (y === yp) { if (x >= 2 && x <= 4) c = '.'; }
        else if (x === 3) c = (y === yS) ? 'S' : '.';
        r += c;
      }
      rows.push(r);
    }
    return rows;
  }
  function bien10(yp, c) { var r = []; for (var y = 0; y < 9; y++) r.push(y === yp - 1 ? '...' + c + '...' : '.......'); return r; }
  var SAN_10 = [kho10(4, true, 6), kho10(3, false, 7), kho10(5, false, 6)];
  var VAT_MAU_10 = [bien10(4, 'b'), bien10(3, 'r'), bien10(5, 'r')];
  var BD_10 = { x: 3, y: 8, huong: 0 };

  /* --------------------------------------------------------------------- lời giải mẫu */
  // Mọi lời giải của chương là chương trình chính ≤ 10 dòng (khung của giao diện), viết bằng hàm của em đã chế ở các chương trước (kho tham chiếu LapRap.khoMau, lapRap.dungKho) cùng vài lệnh gốc.
  // Hàm dùng: forward(n) · move() · turn_right() / turn_left() · stair() · dodge_right() / dodge_left() · to_gap() · go_wall() · read_turn() · follow_right() · tr_right() / tr_left() · sidestep()
  //           · slide_r(n) / slide_l(n) · go(d) / walk(path) (nhện).

  /* ------------------------------------------------------------ hàng 1: làm quen */
  var DS = [
    man({
      so: 1, ten: 'Qua bậc thang', hang: 'lam-quen',
      deBai: 'Một bậc thang chắn ngay trước lá cờ. Lắp robot rồi đưa nó tới cờ. Em có 3 xu.',
      san: SAN_1, batDau: { x: 2, y: 4, huong: 0 },
      sao: { o: 6, nhip: 3, re: { gia: 2, o: 15 } },
      lapRap: {
        than: ['hai-banh', 'xich', 'omni'], tay: [], camBien: [], nganSach: 3, dungKho: true,
        cachLap: [
          { than: 'xich', camBien: null, tay: null, loiGiai: { chinh: ['forward(3)'] }, ghiChu: 'Leo thẳng qua bậc thang: nhanh và gọn, nhưng tốn 3 xu.' },
          { than: 'hai-banh', camBien: null, tay: null, loiGiai: { chinh: ['turn_left()', 'move()', 'turn_right()', 'forward(3)', 'turn_right()', 'move()'] }, ghiChu: 'Hai bánh không leo được bậc: đi vòng bên trái, rẻ nhưng đường dài.' }
        ]
      },
      loiGiaiKhac: { moTa: 'Cùng đường đi, mỗi ô viết riêng bằng forward(1) (nhiều ô hơn forward(3))', baiLam: { chinh: ['forward(1)', 'forward(1)', 'forward(1)'] } },
      congThucKhac: [
        { moTa: 'Ba lần move() thay cho forward(3)', dat3sao: true, baiLam: { chinh: ['move()', 'move()', 'move()'] } },
        { moTa: 'Viết thẳng lệnh gốc trong vòng for', dat3sao: true, baiLam: { chinh: ['for i in range(3):', '    left_move()', '    right_move()', '    wait()'] } }
      ],
      loiSai: [
        { moTa: 'Mới tiến hai ô, xe dừng trước cờ', baiLam: { chinh: ['forward(2)'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên wait(): bánh chưa quay nên xe đứng yên', baiLam: { chinh: LAP(3, ['left_move()', 'right_move()']) }, phaiCoMa: ['quen-wait', 'chua-toi-co'] },
        { moTa: 'Đi vòng như xe hai bánh: xích rẽ chậm nên rẽ dở rồi đâm tường', baiLam: { chinh: ['turn_left()', 'move()', 'turn_right()', 'forward(3)', 'turn_right()', 'move()'] }, phaiCoMa: ['xich-quay-do'] }
      ],
      goiY: ['Xe hai bánh không leo được bậc thang, nhưng đi vòng được.', 'Bánh xích leo thẳng qua bậc thang, và đắt hơn.']
    }),

    man({
      so: 2, ten: 'Hành lang chéo', hang: 'lam-quen',
      deBai: 'Hành lang đi lên theo từng nấc chéo, rẽ liên tục. Lắp robot cho hợp rồi tới cờ. Em có 4 xu.',
      san: SAN_2, batDau: { x: 0, y: 4, huong: 0 },
      sao: { o: 9, nhip: 6, re: { gia: 2, o: 13 } },
      lapRap: {
        than: ['hai-banh', 'xich', 'omni'], tay: [], camBien: [], nganSach: 4, dungKho: true,
        cachLap: [
          { than: 'omni', camBien: null, tay: null, loiGiai: { chinh: ['for i in range(3):', '    move()', '    slide_r(1)'] }, ghiChu: 'Trượt ngang, không phải quay mặt: ít nhịp, ít dòng, nhưng tốn 4 xu.' },
          { than: 'hai-banh', camBien: null, tay: null, loiGiai: { chinh: ['for i in range(3):', '    stair()'] }, ghiChu: 'Mỗi nấc phải rẽ phải, bước, rẽ trái lại: rẻ nhưng chậm.' }
        ]
      },
      loiGiaiKhac: { moTa: 'Cùng đường đi, mỗi nấc viết riêng không dùng vòng lặp', baiLam: { chinh: ['move()', 'slide_r(1)', 'move()', 'slide_r(1)', 'move()', 'slide_r(1)'] } },
      congThucKhac: [
        { moTa: 'Viết thẳng lệnh gốc trong vòng for', dat3sao: true, baiLam: { chinh: ['for i in range(3):', '    left_move()', '    right_move()', '    wait()', '    slide_right()', '    wait()'] } }
      ],
      loiSai: [
        { moTa: 'Cứ tiến thẳng: xe đâm tường ở nấc đầu', baiLam: { chinh: ['forward(3)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Trượt mà quên wait(): lệnh trượt chưa chạy', baiLam: { chinh: LAP(3, nhieu(TIEN, ['slide_right()'])) }, phaiCoMa: ['quen-wait'] },
        { moTa: 'Tiến và trượt trong cùng một nhịp: omni không đi chéo nên chỉ trượt', baiLam: { chinh: LAP(3, ['left_move()', 'right_move()', 'slide_right()', 'wait()']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Xe hai bánh phải rẽ rồi rẽ lại ở mỗi nấc.', 'Bánh omni trượt sang phải một ô mà không cần quay.']
    }),

    man({
      so: 3, ten: 'Chui gầm', hang: 'lam-quen',
      deBai: 'Tường chắn ngang sân có một ô gầm thấp và một lối hở tận bên phải. Lắp robot tới cờ, em có 4 xu.',
      san: SAN_3, batDau: { x: 0, y: 4, huong: 0 },
      sao: { o: 12, nhip: 8, re: { gia: 2, o: 15 } },
      lapRap: {
        than: ['hai-banh', 'xich', 'omni', 'nhen'], tay: [], camBien: [], nganSach: 4, dungKho: true,
        cachLap: [
          { than: 'nhen', camBien: null, tay: null, loiGiai: { chinh: ['crouch()', 'walk("UUUU")'] }, ghiChu: 'Co chân chui qua gầm rồi đi thẳng một mạch: nhanh, nhưng tốn 4 xu.' },
          { than: 'hai-banh', camBien: null, tay: null, loiGiai: { chinh: ['turn_right()', 'forward(4)', 'turn_left()', 'forward(4)', 'turn_left()', 'forward(4)'] }, ghiChu: 'Không chui được gầm: đi vòng sang lối hở bên phải, rẻ nhưng đường rất dài.' }
        ]
      },
      loiGiaiKhac: { moTa: 'Cùng đường đi, bốn lần go("U") viết riêng không dùng vòng lặp', baiLam: { chinh: nhieu(['crouch()'], dem(4, 'go("U")')) } },
      congThucKhac: [
        { moTa: 'Vòng for gọi go("U") thay cho walk', dat3sao: true, baiLam: { chinh: ['crouch()', 'for i in range(4):', '    go("U")'] } },
        { moTa: 'Viết thẳng go_up() trong vòng for', dat3sao: true, baiLam: { chinh: ['crouch()', 'for i in range(4):', '    go_up()'] } }
      ],
      loiSai: [
        { moTa: 'Quên co chân: nhện đứng thẳng nên đâm vào gầm thấp', baiLam: { chinh: LAP(4, ['go_up()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Mới đi ba ô, nhện dừng ngay trong gầm', baiLam: { chinh: nhieu(['crouch()'], LAP(3, ['go_up()'])) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Ô gầm thấp chỉ có thân nhện đang co chân mới chui qua được.', 'Lệnh crouch() co chân; thân khác phải đi vòng sang lối hở.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Ngược dòng', hang: 'luyen',
      deBai: 'Băng chuyền chạy ngược chiều xe, cứ hai nhịp đẩy xe lùi một ô. Lắp robot tới cờ, em có 4 xu.',
      san: SAN_4, batDau: { x: 2, y: 8, huong: 0 },
      sao: { o: 6, nhip: 8, re: { gia: 2, o: 6 } },
      lapRap: {
        than: ['hai-banh', 'xich', 'omni'], tay: [], camBien: [], nganSach: 4, dungKho: true,
        khongQua: [
          { than: 'omni', lyDo: 'Bánh omni trơn: đi ngược băng chuyền thì bị đẩy về, đứng im tại chỗ.' }
        ],
        cachLap: [
          { than: 'xich', camBien: null, tay: null, loiGiai: { chinh: ['forward(8)'] }, ghiChu: 'Băng chuyền không đẩy được bánh xích: đi một mạch, tốn 3 xu.' },
          { than: 'hai-banh', camBien: null, tay: null, loiGiai: { chinh: ['forward(13)'] }, ghiChu: 'Hai bánh vẫn qua được, nhưng bị đẩy lùi nên phải bước thêm nhiều nhịp.' }
        ]
      },
      loiGiaiKhac: { moTa: 'Cùng đường đi, tám ô chia thành hai lần forward(4)', baiLam: { chinh: ['forward(4)', 'forward(4)'] } },
      congThucKhac: [
        { moTa: 'Vòng for gọi move() thay cho forward(8)', dat3sao: true, baiLam: { chinh: ['for i in range(8):', '    move()'] } },
        { moTa: 'Viết thẳng lệnh gốc trong vòng for', dat3sao: true, baiLam: { chinh: ['for i in range(8):', '    left_move()', '    right_move()', '    wait()'] } }
      ],
      loiSai: [
        { moTa: 'Chỉ tiến năm ô: xe nằm lại trong băng chuyền', baiLam: { chinh: ['forward(5)'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi lùi vào đường: xe tới cờ muộn hay không tới', baiLam: { chinh: LAP(8, ['left_back()', 'right_back()', 'wait()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Bánh xích bám chắc nên băng chuyền không đẩy được.', 'Hai bánh bị đẩy lùi cứ hai nhịp một lần, và bánh omni còn bị đẩy mạnh hơn.']
    }),

    man({
      so: 5, ten: 'Tìm cửa hông', hang: 'luyen',
      deBai: 'Cửa hông dẫn tới cờ nằm ở chỗ khác nhau ở ba sân. Viết một chương trình cho cả ba. Em có 5 xu.',
      san: SAN_5, batDau: BD_5,
      sao: { o: 11, nhip: 20, re: { gia: 3, o: 12 } },
      lapRap: {
        than: ['hai-banh', 'xich', 'omni'], tay: [], camBien: ['khoang-cach', 'mau'], nganSach: 5, dungKho: true,
        cachLap: [
          { than: 'omni', camBien: 'khoang-cach', tay: null, loiGiai: { chinh: ['to_gap()', 'while right_clear():', '    slide_r(1)'] }, ghiChu: 'Thấy cửa thì trượt thẳng sang phải, không phải quay: gọn và nhanh, nhưng tốn đủ 5 xu.' },
          { than: 'hai-banh', camBien: 'khoang-cach', tay: null, loiGiai: { chinh: ['to_gap()', 'turn_right()', 'go_wall()'] }, ghiChu: 'Thấy cửa thì phải rẽ phải trước khi đi tiếp: rẻ hơn, nhưng dài và chậm hơn.' }
        ]
      },
      loiGiaiKhac: { moTa: 'Cùng đường đi, ba lần trượt viết riêng không dùng vòng lặp', baiLam: { chinh: ['to_gap()', 'slide_r(1)', 'slide_r(1)', 'slide_r(1)'] } },
      congThucKhac: [
        { moTa: 'Trượt đúng ba ô bằng slide_r(3) (cửa cách đường chính đúng ba ô ở cả ba sân)', dat3sao: true, baiLam: { chinh: ['to_gap()', 'slide_r(3)'] } },
        { moTa: 'Viết thẳng lệnh gốc: đi lên tới khi bên phải hở, rồi trượt sang phải', dat3sao: true, baiLam: { chinh: nhieu(['while not right_clear():'], thut(TIEN), ['while right_clear():'], thut(TRUOT_PHAI)) } }
      ],
      loiSai: [
        { moTa: 'Viết cứng số ô theo sân đầu: hai sân sau xe đi sai chỗ', baiLam: { chinh: nhieu(LAP(5, TIEN), LAP(3, TRUOT_PHAI)) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng color() nhưng robot chỉ gắn cảm biến khoảng cách', baiLam: { chinh: nhieu(['while color() == "none":'], thut(TIEN)) }, phaiCoMa: ['chua-gan-cam-bien'] },
        { moTa: 'Quên trượt sang phải: xe đi lên mãi, qua luôn cửa hông', baiLam: { chinh: nhieu(['while front_clear():'], thut(TIEN)) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Cảm biến khoảng cách cho biết bên phải đã có cửa hở chưa.', 'Không gắn cảm biến thì chương trình phải đoán mò từng hàng, rất tốn nhịp.']
    }),

    man({
      so: 6, ten: 'Mê cung ngõ cụt', hang: 'luyen',
      deBai: 'Ba mê cung có ngõ cụt. Ô đỏ báo rẽ phải, ô xanh dương báo rẽ trái. Tới cờ ít nhịp nhất, em có 4 xu.',
      san: SAN_6, batDau: BD_6,
      sao: { o: 14, nhip: 55, re: { gia: 3, o: 16 } },
      lapRap: {
        than: ['hai-banh'], tay: [], camBien: ['khoang-cach', 'mau', 'camera'], nganSach: 4, dungKho: true,
        cachLap: [
          { than: 'hai-banh', camBien: 'mau', tay: null, loiGiai: { chinh: ['for i in range(40):', '    read_turn()', '    move()'] }, ghiChu: 'Đọc ô đỏ và xanh dương để rẽ, bỏ qua ngõ cụt: nhanh hơn nhiều, tốn 4 xu.' },
          { than: 'hai-banh', camBien: 'khoang-cach', tay: null, loiGiai: { chinh: ['for i in range(60):', '    follow_right()'] }, ghiChu: 'Chỉ thấy tường nên phải dò từng ngõ cụt bên tay phải: rẻ hơn nhưng vòng vèo, lâu hơn.' }
        ]
      },
      loiGiaiKhac: { moTa: 'Cùng cách đọc màu, bước tiến viết bằng forward(1)', baiLam: { chinh: ['for i in range(40):', '    read_turn()', '    forward(1)'] } },
      congThucKhac: [
        { moTa: 'Viết rẽ bằng turn_right() / turn_left() ngay trong vòng for', dat3sao: true, baiLam: { chinh: ['for i in range(40):', '    if color() == "red":', '        turn_right()', '    elif color() == "blue":', '        turn_left()', '    move()'] } },
        { moTa: 'Viết thẳng lệnh gốc trong vòng for', dat3sao: true, baiLam: { chinh: nhieu(['for i in range(40):', '    if color() == "red":'], thut(thut(QUAY_PHAI)), ['    elif color() == "blue":'], thut(thut(QUAY_TRAI)), thut(TIEN)) } }
      ],
      loiSai: [
        { moTa: 'Chỉ rẽ ở ô đỏ, quên ô xanh dương: xe đâm tường ở khúc rẽ trái', baiLam: { chinh: ['for i in range(40):', '    if color() == "red":', '        turn_right()', '    move()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết hoa "Red": không màu nào khớp nên xe không bao giờ rẽ', baiLam: { chinh: ['for i in range(40):', '    if color() == "Red":', '        turn_right()', '    elif color() == "blue":', '        turn_left()', '    move()'] }, phaiCoMa: ['ten-mau-sai'] },
        { moTa: 'Dùng front_clear() nhưng robot gắn cảm biến màu', baiLam: { chinh: nhieu(['while front_clear():'], thut(TIEN)) }, phaiCoMa: ['chua-gan-cam-bien'] }
      ],
      goiY: ['Cảm biến màu đọc ô xe đang đứng: đỏ thì rẽ phải, xanh dương thì rẽ trái, còn lại đi thẳng.', 'Cảm biến khoảng cách rẻ hơn, nhưng nó không thấy ô màu nên phải dò cả ngõ cụt.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Ba lối đi', hang: 'bien-the', nhipTheoLoiGiai: true,
      deBai: 'Tường có ba lối: gầm thấp, bậc thang và lối hở ở xa. Mỗi thân hợp một lối. Tới cờ nhanh nhất, em có 4 xu.',
      san: SAN_7, batDau: { x: 1, y: 6, huong: 0 },
      sao: { o: 12, nhip: 12, re: { gia: 2, o: 15 } },
      lapRap: {
        than: ['hai-banh', 'xich', 'omni', 'nhen'], tay: [], camBien: [], nganSach: 4, dungKho: true,
        cachLap: [
          { than: 'nhen', camBien: null, tay: null, loiGiai: { chinh: ['crouch()', 'walk("UUUUUU")'] }, ghiChu: 'Co chân chui qua gầm, đi thẳng: nhanh nhất và gọn nhất, tốn 4 xu.' },
          { than: 'xich', camBien: null, tay: null, loiGiai: { chinh: ['tr_right()', 'move()', 'tr_left()', 'forward(6)', 'tr_left()', 'move()'] }, ghiChu: 'Leo bậc thang ở bên cạnh, mất thêm nhịp để rẽ chậm: tốn 3 xu.' },
          { than: 'hai-banh', camBien: null, tay: null, loiGiai: { chinh: ['turn_right()', 'forward(5)', 'turn_left()', 'forward(6)', 'turn_left()', 'forward(5)'] }, ghiChu: 'Đi vòng sang lối hở xa nhất: rẻ nhất nhưng đường dài.' }
        ]
      },
      loiGiaiKhac: { moTa: 'Cùng đường đi, sáu lần go("U") viết riêng không dùng vòng lặp', baiLam: { chinh: nhieu(['crouch()'], dem(6, 'go("U")')) } },
      congThucKhac: [
        { moTa: 'Vòng for gọi go("U") thay cho walk', dat3sao: true, baiLam: { chinh: ['crouch()', 'for i in range(6):', '    go("U")'] } },
        { moTa: 'Viết thẳng go_up() trong vòng for', dat3sao: true, baiLam: { chinh: ['crouch()', 'for i in range(6):', '    go_up()'] } }
      ],
      loiSai: [
        { moTa: 'Quên co chân: nhện đâm vào gầm thấp', baiLam: { chinh: LAP(6, ['go_up()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đi thẳng như xe: nhện không có lệnh left_move()', baiLam: { chinh: LAP(6, TIEN) }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Xích leo được bậc thang, nhện chui được gầm, hai thân kia phải đi vòng.', 'Thân đắt hơn thường đi ít nhịp hơn.']
    }),

    man({
      so: 8, ten: 'Nhảy qua hố', hang: 'bien-the', nhipTheoLoiGiai: true,
      deBai: 'Hàng hố chắn ngang sân, chỉ chừa lối bên phải. Rơi xuống hố là thua. Lắp robot tới cờ, em có 4 xu.',
      san: SAN_8, batDau: { x: 0, y: 6, huong: 0 },
      sao: { o: 15, nhip: 10, re: { gia: 2, o: 15 } },
      lapRap: {
        than: ['hai-banh', 'xich', 'omni', 'nhen'], tay: [], camBien: [], nganSach: 4, dungKho: true,
        cachLap: [
          { than: 'nhen', camBien: null, tay: null, loiGiai: { chinh: ['go("U")', 'crouch()', 'go("U")', 'stand()', 'walk("UUU")'] }, ghiChu: 'Co chân rồi duỗi chân lúc bước thì nhảy qua một ô hố: đi thẳng, tốn 4 xu.' },
          { than: 'hai-banh', camBien: null, tay: null, loiGiai: { chinh: ['turn_right()', 'forward(4)', 'turn_left()', 'forward(6)', 'turn_left()', 'forward(4)'] }, ghiChu: 'Không nhảy được: đi vòng sang lối bên phải, rẻ nhưng đường dài.' }
        ]
      },
      loiGiaiKhac: { moTa: 'Cùng đường nhảy, ba bước cuối chia thành go("U") và walk("UU")', baiLam: { chinh: ['go("U")', 'crouch()', 'go("U")', 'stand()', 'go("U")', 'walk("UU")'] } },
      congThucKhac: [
        { moTa: 'Nhảy bằng leap("UUUUU"): hàm của chương nhện, một bước nhảy mỗi ô (ít nhịp hơn)', dat3sao: true, baiLam: { chinh: ['leap("UUUUU")'] } },
        { moTa: 'Ba bước cuối viết bằng vòng for gọi go("U")', dat3sao: true, baiLam: { chinh: ['go("U")', 'crouch()', 'go("U")', 'stand()', 'for i in range(3):', '    go("U")'] } },
        { moTa: 'Viết thẳng go_up() với vòng for', dat3sao: true, baiLam: { chinh: ['go_up()', 'crouch()', 'go_up()', 'stand()', 'for i in range(3):', '    go_up()'] } }
      ],
      loiSai: [
        { moTa: 'Đi thẳng vào hố mà không nhảy: nhện rơi', baiLam: { chinh: LAP(6, ['go_up()']) }, phaiCoMa: ['roi-ho'] },
        { moTa: 'Duỗi chân mà chưa co chân: không có cú nhảy, nhện rơi xuống hố', baiLam: { chinh: nhieu(['go_up()', 'go_up()', 'stand()', 'go_up()', 'go_up()']) }, phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['Nhện đang co chân mà duỗi chân (stand) cùng lúc với một bước thì nhảy qua một ô.', 'Thân khác không nhảy được, phải đi vòng qua lối bên phải.']
    }),

    man({
      so: 9, ten: 'Hộp chỉ đường', hang: 'bien-the',
      deBai: 'Cuối hành lang có hộp màu: đỏ chỉ sang phải, xanh dương chỉ sang trái, cờ ở lối hộp chỉ. Em có 6 xu.',
      san: SAN_9, vatMau: VAT_MAU_9, batDau: BD_9,
      sao: { o: 17, nhip: 21, re: { gia: 4, o: 21 } },
      lapRap: {
        than: ['hai-banh', 'omni'], tay: [], camBien: ['khoang-cach', 'mau', 'camera'], nganSach: 6, dungKho: true,
        cachLap: [
          { than: 'omni', camBien: 'camera', tay: null, loiGiai: { chinh: ['forward(2)', 'if color() == "red":', '    slide_r(1)', 'else:', '    slide_l(1)', 'forward(4)'] }, ghiChu: 'Camera đọc hộp, omni trượt sang bên không cần quay: nhanh và gọn, tốn đủ 6 xu.' },
          { than: 'hai-banh', camBien: 'camera', tay: null, loiGiai: { chinh: ['forward(2)', 'if color() == "red":', '    dodge_right()', 'else:', '    dodge_left()', 'forward(4)'] }, ghiChu: 'Đọc hộp, rồi phải rẽ, bước, rẽ lại: chậm hơn và dài hơn, nhưng chỉ tốn 4 xu.' }
        ]
      },
      loiGiaiKhac: { moTa: 'Cùng cách đọc hộp, bước tiến viết riêng từng ô', baiLam: { chinh: ['move()', 'move()', 'if color() == "red":', '    slide_r(1)', 'else:', '    slide_l(1)', 'move()', 'move()', 'move()', 'move()'] } },
      congThucKhac: [
        { moTa: 'Trượt viết thẳng slide_right() + wait() thay cho slide_r(1)', dat3sao: true, baiLam: { chinh: ['forward(2)', 'if color() == "red":', '    slide_right()', '    wait()', 'else:', '    slide_left()', '    wait()', 'forward(4)'] } }
      ],
      loiSai: [
        { moTa: 'Luôn trượt sang phải: sân có hộp xanh dương thì xe vào lối cụt', baiLam: { chinh: ['forward(2)', 'slide_r(1)', 'forward(4)'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng front_clear() nhưng robot gắn camera', baiLam: { chinh: nhieu(['while front_clear():'], thut(TIEN)) }, phaiCoMa: ['chua-gan-cam-bien'] },
        { moTa: 'Đọc màu quá sớm, ngay lúc xuất phát: ô trước mặt chưa phải hộp', baiLam: { chinh: ['if color() == "red":', '    slide_r(1)', 'else:', '    slide_l(1)', 'forward(6)'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Camera đọc màu của vật hay ô ngay trước mặt, kể cả hộp chỉ đường.', 'Không có camera thì robot phải đoán mò từng lối, rất tốn nhịp.']
    }),

    /* ------------------------------------------------------------ hàng 4: trùm */
    man({
      so: 10, ten: 'Kho hàng', hang: 'trum', nhipTheoLoiGiai: true,
      huyHieu: { ma: 'rap-nao', ten: 'Huy hiệu Lắp ráp: Thân + Não' },
      deBai: 'Mỗi kho có bậc thang ở hành lang và hộp chỉ đường ở ngã ba, dài ngắn khác nhau. Em có 6 xu.',
      san: SAN_10, vatMau: VAT_MAU_10, batDau: BD_10,
      sao: { o: 23, nhip: 39, re: { gia: 5, o: 23 } },
      lapRap: {
        than: ['hai-banh', 'xich', 'omni', 'nhen'], tay: [], camBien: ['khoang-cach', 'mau', 'camera'], nganSach: 6, dungKho: true,
        khongQua: [
          { than: 'hai-banh', lyDo: 'Đường tới cờ ở sân nào cũng có bậc thang, mà xe hai bánh không leo được bậc thang.' },
          { than: 'omni', lyDo: 'Đường tới cờ ở sân nào cũng có bậc thang, mà bánh omni không leo được bậc thang.' }
        ],
        cachLap: [
          { than: 'xich', camBien: 'camera', tay: null, loiGiai: { chinh: ['while color() == "none":', '    move()', 'if color() == "red":', '    sidestep()', 'else:', '    tr_left()', '    move()', '    tr_right()', 'forward(8)'] }, ghiChu: 'Xích leo bậc, camera đọc hộp: ít nhịp nhất, nhưng mỗi lần rẽ mất hai nhịp và chương trình nhiều ô hơn. Tốn 5 xu.' },
          { than: 'nhen', camBien: 'camera', tay: null, loiGiai: { chinh: ['while color() == "none":', '    go("U")', 'if color() == "red":', '    go("R")', 'else:', '    go("L")', 'walk("UUUUUUUU")'] }, ghiChu: 'Nhện không phải quay nên chương trình ngắn gọn hơn, nhưng mỗi ô tốn hai nhịp. Tốn đủ 6 xu.' }
        ]
      },
      loiGiaiKhac: { moTa: 'Cùng cách đọc hộp, gán color() vào biến c rồi mới so (thêm một dòng)', baiLam: { chinh: ['while color() == "none":', '    move()', 'c = color()', 'if c == "red":', '    sidestep()', 'else:', '    tr_left()', '    move()', '    tr_right()', 'forward(8)'] } },
      congThucKhac: [
        { moTa: 'Bước tiến viết bằng forward(1) trong vòng while', dat3sao: true, baiLam: { chinh: ['while color() == "none":', '    forward(1)', 'if color() == "red":', '    sidestep()', 'else:', '    tr_left()', '    move()', '    tr_right()', 'forward(8)'] } }
      ],
      loiSai: [
        { moTa: 'Viết cứng hai ô tiến theo kho đầu: các kho khác xe rẽ sai chỗ', baiLam: { chinh: ['forward(2)', 'if color() == "red":', '    sidestep()', 'else:', '    tr_left()', '    move()', '    tr_right()', 'forward(8)'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đọc hộp xong rẽ như xe hai bánh (một nhịp): xích rẽ dở nên đâm tường', baiLam: { chinh: ['while color() == "none":', '    move()', 'if color() == "red":', '    dodge_right()', 'else:', '    dodge_left()', 'forward(8)'] }, phaiCoMa: ['xich-quay-do'] },
        { moTa: 'Dùng front_clear() nhưng robot gắn camera', baiLam: { chinh: nhieu(['while front_clear():'], thut(TIEN)) }, phaiCoMa: ['chua-gan-cam-bien'] }
      ],
      goiY: ['Chỉ thân xích và thân nhện leo được bậc thang.', 'Nhện không dùng được cảm biến khoảng cách, nhưng dùng được camera.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

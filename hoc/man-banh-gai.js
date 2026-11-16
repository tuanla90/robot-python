/* ============================================================================
   man-banh-gai.js — Mùa 8 Hang động · Gói 1: Bánh gai (viết lại 2/11, KE-HOACH-MUA-8.md)
   Chương 1: banh-gai "Bám đá ướt" (10 màn): thân bánh gai, sàn đá vôi ướt I (bánh gai bám từng ô), hố sụt u; hàm kho cũ; chế rim(n)
   Chương 2: tu-dien "Sổ tay đường hang" (10 màn): từ điển: tạo, đọc d["k"], sửa giá trị, thêm cặp, gán khoá, for k in d, if "k" in d,
             hàm nhận từ điển (follow, walk_book, step_book, trip)
   Lời: "Giúp Sola với!", gợi ý của Luna, gọi người chơi là "bạn".
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_GAI = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];

  function bai(chinh, ham, moi) {
    return { chinh: chinh, hamCuaMan: ham || [], hamCuaEmMoi: moi || [] };
  }
  function ham(ten, than, thamSo) {
    return { ten: ten, than: than, thamSo: thamSo || [] };
  }

  function manGai(so, hang, ds) {
    return Object.assign({
      chuong: 'banh-gai', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: { than: 'gai', tay: null, camBien: [] },
      hamGoc: GOC_GAI.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  function manTuDien(so, hang, ds) {
    return Object.assign({
      chuong: 'tu-dien', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: { than: 'gai', tay: null, camBien: [] },
      hamGoc: GOC_GAI.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for', 'if', 'else', 'dict'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for', 'if', 'else', 'dict'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  var RIM = ham('rim', ['forward(n)', 'turn_right()'], ['n']);
  var FOLLOW = ham('follow', ['forward(book["ngang"])', 'turn_right()', 'forward(book["doc"])', 'turn_left()'], ['book']);
  var WALK_BOOK = ham('walk_book', ['for k in book:', '    rim(book[k])'], ['book']);
  var STEP_BOOK = ham('step_book', ['forward(book["ngang"])', 'if "doc" in book:', '    turn_right()', '    forward(book["doc"])', '    turn_left()'], ['book']);

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: banh-gai — Bám đá ướt
       ====================================================================== */
    manGai(1, 'lam-quen', {
      ten: 'Bánh gai bám đá',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Sola làm mẫu. Sàn đá vôi ướt (ô I) trơn lắm: xe bánh thường bước lên là trượt một mạch tới hết dải, ở đây là lao xuống hố sụt. Bánh gai của R1 bám chắc từng ô nên dừng được ngay sát mép hố. Bấm Chạy để xem.',
      veMaMau: 'Chương trình Sola viết sẵn và đã khoá: tiến 3 ô, rẽ phải, tiến 2 ô.',
      san: [
        '########',
        '#.IIIuu#',
        '####I###',
        '####F###',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['forward(3)', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['forward(3)', 'turn_right()', 'forward(2)']),
      sao: { o: 10, nhip: 6 },
      goiY: [
        'Luna: Bánh gai đi như xe hai bánh: move(), forward(n), turn_right() trong kho của bạn dùng được hết.',
        'Luna: Ô I không làm bánh gai trượt, mỗi bước vẫn đúng một ô. Hố sụt u thì vẫn rơi.'
      ]
    }),

    manGai(2, 'lam-quen', {
      ten: 'Dừng giữa dải đá',
      hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Giúp Sola với! Dải đá ướt dài tới tận miệng hố sụt. Lối xuống cờ nằm ở giữa dải. Đưa R1 dừng đúng chỗ rẽ rồi xuống cờ.',
      veMaMau: 'Sola đếm nhầm số ô. Chạy thử xem R1 dừng ở đâu.',
      san: [
        '#########',
        '#.IIIIIu#',
        '#uuuuI###',
        '#####F###',
        '#########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['forward(6)', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['forward(4)', 'turn_right()', 'forward(2)']),
      loiSai: [
        { moTa: 'Để nguyên forward(6): R1 bước vào hố sụt', baiLam: bai(['forward(6)', 'turn_right()', 'forward(2)']), phaiCoMa: ['roi-ho'] },
        { moTa: 'forward(3): rẽ sớm một ô, R1 rơi xuống hố', baiLam: bai(['forward(3)', 'turn_right()', 'forward(2)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 10, nhip: 7 },
      goiY: [
        'Luna: Đếm từ ô R1 đứng tới ô ngay trên lối xuống.',
        'Luna: Lối xuống ở cột thứ năm, R1 đứng ở cột thứ nhất: cần 4 bước.'
      ]
    }),

    manGai(3, 'lam-quen', {
      ten: 'Lùi khỏi miệng hố',
      hamCuaEmCan: ['back', 'forward', 'turn_right'],
      deBai: 'Giúp Sola với! R1 đứng ngay trước một hố sụt. Đi tiếp là rơi. Lùi ra chỗ ngã rẽ rồi xuống cờ.',
      veMaMau: 'Sola mới cho R1 lùi một ô. Chạy thử xem.',
      san: [
        '######',
        '#.IIu#',
        '#I####',
        '#F####',
        '######'
      ],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['back()', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['back()', 'back()', 'turn_right()', 'forward(2)']),
      loiSai: [
        { moTa: 'Lùi một ô rồi rẽ: R1 đâm vào vách', baiLam: bai(['back()', 'turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Tiến thay vì lùi: R1 rơi xuống hố', baiLam: bai(['move()', 'turn_right()', 'forward(2)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 14, nhip: 5 },
      goiY: [
        'Luna: back() lùi một ô mà không quay đầu.',
        'Luna: Ngã rẽ ở cột đầu tiên, R1 phải lùi 2 ô.'
      ]
    }),

    manGai(4, 'luyen', {
      ten: 'Rẽ trái men hố',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left'],
      deBai: 'Giúp Sola với! Hai bên lối đi toàn hố sụt. R1 phải xuống hai ô rồi rẽ sang phải màn hình để tới cờ.',
      veMaMau: 'Sola rẽ nhầm phía ở góc dưới. Chạy thử xem R1 đi đâu.',
      san: [
        '#######',
        '#.Iuuu#',
        '#uIuuu#',
        '#uIIIF#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['move()', 'turn_right()', 'forward(2)', 'turn_right()', 'forward(3)']),
      loiGiai: bai(['move()', 'turn_right()', 'forward(2)', 'turn_left()', 'forward(3)']),
      loiSai: [
        { moTa: 'Rẽ phải ở góc dưới: R1 quay sang trái màn hình rồi rơi xuống hố', baiLam: bai(['move()', 'turn_right()', 'forward(2)', 'turn_right()', 'forward(3)']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Quên rẽ ở góc dưới: R1 đâm vào vách đáy', baiLam: bai(['move()', 'turn_right()', 'forward(2)', 'forward(3)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 14, nhip: 8 },
      goiY: [
        'Luna: Ở góc dưới R1 đang nhìn xuống. Muốn sang phải màn hình thì R1 phải rẽ về tay trái của nó.',
        'Luna: Đổi turn_right() thứ hai thành turn_left().'
      ]
    }),

    manGai(5, 'luyen', {
      ten: 'Bậc đá ướt',
      hamCuaEmCan: ['move', 'stair'],
      deBai: 'Giúp Sola với! Lối đi xuống như ba bậc thang, mỗi bậc một ô sang phải rồi một ô xuống. Kho của bạn có sẵn stair(). Đưa R1 tới cờ.',
      veMaMau: 'Sola mới lặp hai bậc. Chạy thử xem.',
      san: [
        '########',
        '#.Iuuuu#',
        '#uIIuuu#',
        '#uuIIuu#',
        '#uuuIF##',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['for i in range(2):', '    stair()', 'move()']),
      loiGiai: bai(['for i in range(3):', '    stair()', 'move()']),
      loiSai: [
        { moTa: 'Lặp hai bậc: R1 dừng giữa đường', baiLam: bai(['for i in range(2):', '    stair()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết stair() ba dòng thay vì lặp: tới cờ nhưng tốn ô', baiLam: bai(['stair()', 'stair()', 'stair()', 'move()']) }
      ],
      sao: { o: 14, nhip: 13 },
      goiY: [
        'Luna: stair() đi một ô, rẽ phải, đi một ô, rẽ trái: đúng một bậc.',
        'Luna: Ba bậc thì lặp ba lần, xong còn một bước tới cờ.'
      ]
    }),

    manGai(6, 'luyen', {
      ten: 'Chế lệnh: men vách rẽ phải',
      taoHam: ['rim'], chinhCoDinh: true,
      hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Giúp Sola với! Trong hang, R1 hay phải đi một đoạn rồi rẽ phải. Chế hàm rim(n): tiến n ô rồi rẽ phải. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi rim(4), rim(2) rồi forward(4). Mở Xưởng hàm, chế rim(n) rồi bấm Chạy.',
      san: [
        '#######',
        '#.IIII#',
        '#uuuuI#',
        '#FIIII#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['rim(4)', 'rim(2)', 'forward(4)']),
      loiGiai: bai(['rim(4)', 'rim(2)', 'forward(4)'], [], [RIM]),
      loiSai: [
        { moTa: 'Chưa chế hàm rim', baiLam: bai(['rim(4)', 'rim(2)', 'forward(4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên rẽ phải trong rim: R1 đâm vào vách cuối dải', baiLam: bai(['rim(4)', 'rim(2)', 'forward(4)']), hamCuaEmMoi: [ham('rim', ['forward(n)'], ['n'])], phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 12, nhip: 12 },
      goiY: [
        'Luna: Thân rim(n) có hai dòng: forward(n) rồi turn_right().',
        'Luna: n là số ô mỗi lần gọi đưa vào, rim(4) thì n là 4.'
      ]
    }),

    manGai(7, 'bien-the', {
      ten: 'Vòng quanh hố lớn',
      hamCuaEmCan: ['rim'],
      deBai: 'Giúp Sola với! Một hố sụt lớn chiếm giữa hang. R1 phải đi vòng ba cạnh quanh hố, cạnh nào cũng dài 3 ô.',
      veMaMau: 'Sola mới lặp hai cạnh. Chạy thử xem.',
      san: [
        '######',
        '#.III#',
        '#uuuI#',
        '#uuuI#',
        '#FIII#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['for i in range(2):', '    rim(3)']),
      loiGiai: bai(['for i in range(3):', '    rim(3)']),
      loiSai: [
        { moTa: 'Lặp hai lần: R1 dừng ở góc dưới phải', baiLam: bai(['for i in range(2):', '    rim(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'rim(2): rẽ sớm, R1 rơi xuống hố', baiLam: bai(['for i in range(3):', '    rim(2)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 11, nhip: 11 },
      goiY: [
        'Luna: Ba cạnh giống nhau, mỗi cạnh là rim(3).',
        'Luna: Rẽ thêm một lần khi đã đứng trên cờ cũng không sao.'
      ]
    }),

    manGai(8, 'bien-the', {
      ten: 'Xoắn ốc vào lõi hang',
      hamCuaEmCan: ['rim', 'move'],
      deBai: 'Giúp Sola với! Lối đi xoắn ốc vào giữa hang, mỗi vòng ngắn hơn. Đưa R1 tới cờ ở lõi.',
      veMaMau: 'Sola viết đúng ba đoạn đầu. Chạy thử rồi viết tiếp.',
      san: [
        '#######',
        '#.IIII#',
        '#uuuuI#',
        '#uIF#I#',
        '#uIIII#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['rim(4)', 'rim(3)', 'rim(3)']),
      loiGiai: bai(['rim(4)', 'rim(3)', 'rim(3)', 'rim(1)', 'move()']),
      loiSai: [
        { moTa: 'Dừng sau ba đoạn đầu: R1 còn ở góc dưới trái', baiLam: bai(['rim(4)', 'rim(3)', 'rim(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'rim(2) ở đoạn thứ tư: R1 đi quá chỗ rẽ, rơi xuống hố', baiLam: bai(['rim(4)', 'rim(3)', 'rim(3)', 'rim(2)', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 14, nhip: 16 },
      goiY: [
        'Luna: Sau ba đoạn đầu, R1 ở góc dưới trái, mặt nhìn lên.',
        'Luna: Lên một ô rồi rẽ phải là rim(1), xong một bước nữa là tới cờ.'
      ]
    }),

    manGai(9, 'bien-the', {
      ten: 'Đường rắn bò',
      hamCuaEmCan: ['forward', 'bend_right', 'bend_left'],
      deBai: 'Giúp Sola với! Lối đi uốn qua lại như rắn bò. Kho của bạn còn bend_right() và bend_left() từ hồi ở kho hàng: quay, đi 2 ô, quay cùng phía.',
      veMaMau: 'Sola dùng bend_right() cho cả hai khúc cua. Chạy thử xem.',
      san: [
        '######',
        '#.III#',
        '#uuuI#',
        '#IIII#',
        '#Iuuu#',
        '#IIIF#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['forward(3)', 'bend_right()', 'forward(3)', 'bend_right()', 'forward(3)']),
      loiGiai: bai(['forward(3)', 'bend_right()', 'forward(3)', 'bend_left()', 'forward(3)']),
      loiSai: [
        { moTa: 'bend_right() ở khúc thứ hai: R1 quay lên rồi rơi xuống hố', baiLam: bai(['forward(3)', 'bend_right()', 'forward(3)', 'bend_right()', 'forward(3)']), phaiCoMa: ['roi-ho'] },
        { moTa: 'forward(2) ở hàng giữa: R1 cua sớm, rơi xuống hố', baiLam: bai(['forward(3)', 'bend_right()', 'forward(2)', 'bend_left()', 'forward(3)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 22, nhip: 17 },
      goiY: [
        'Luna: Ở hàng giữa R1 nhìn sang trái màn hình. Muốn xuống thì rẽ về tay trái của nó.',
        'Luna: Khúc cua thứ hai là bend_left().'
      ]
    }),

    manGai(10, 'trum', {
      ten: 'Trùm: Hẻm rắn bò dài',
      hamCuaEmCan: ['forward', 'bend_right', 'bend_left'],
      deBai: 'Giúp Sola với! Hẻm rắn bò dài gấp đôi, hai bên toàn hố sụt. Chương trình chỉ được 8 ô.',
      veMaMau: 'Chương trình Sola viết sẵn chỉ đi được khúc đầu.',
      san: [
        '######',
        '#.III#',
        '#uuuI#',
        '#IIII#',
        '#Iuuu#',
        '#IIII#',
        '#uuuI#',
        '#IIII#',
        '#Iuuu#',
        '#IIIF#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['forward(3)', 'bend_right()']),
      loiGiai: bai(['for i in range(2):', '    forward(3)', '    bend_right()', '    forward(3)', '    bend_left()', 'forward(3)']),
      loiSai: [
        { moTa: 'Lặp hai lần mà quên forward(3) cuối: R1 dừng ở góc dưới trái', baiLam: bai(['for i in range(2):', '    forward(3)', '    bend_right()', '    forward(3)', '    bend_left()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Trong vòng lặp dùng bend_right() hai lần: R1 rơi xuống hố', baiLam: bai(['for i in range(2):', '    forward(3)', '    bend_right()', '    forward(3)', '    bend_right()', 'forward(3)']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Viết thẳng hết, không lặp: tới cờ nhưng quá 8 ô', baiLam: bai(['forward(3)', 'bend_right()', 'forward(3)', 'bend_left()', 'forward(3)', 'bend_right()', 'forward(3)', 'bend_left()', 'forward(3)']) }
      ],
      sao: { o: 23, nhip: 31 },
      goiY: [
        'Luna: Một vòng gồm sang phải, cua xuống, sang trái, cua xuống. Hẻm có hai vòng như thế.',
        'Luna: Sau hai vòng còn một đoạn sang phải tới cờ.'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: tu-dien — Sổ tay đường hang
       ====================================================================== */
    manTuDien(1, 'lam-quen', {
      ten: 'Sổ tay của Luna',
      chiChay: true, chinhCoDinh: true,
      khoaTD: ['ngang', 'doc'],
      hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Sola làm mẫu. Luna ghi đường hang vào một cuốn sổ tay: từ điển d. Mỗi dòng sổ có một khoá (chữ trong ngoặc kép) và một giá trị (số). d["ngang"] đọc giá trị ghi ở khoá "ngang". Bấm Chạy xem R1 đi theo sổ.',
      veMaMau: 'Dòng đầu tạo sổ d với hai khoá "ngang" và "doc". Hai dòng forward đọc số bước từ sổ.',
      san: [
        '########',
        '#.IIIIu#',
        '#####I##',
        '#####F##',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['d = {"ngang": 4, "doc": 2}', 'forward(d["ngang"])', 'turn_right()', 'forward(d["doc"])']),
      loiGiai: bai(['d = {"ngang": 4, "doc": 2}', 'forward(d["ngang"])', 'turn_right()', 'forward(d["doc"])']),
      sao: { o: 11, nhip: 7 },
      goiY: [
        'Luna: d["ngang"] là 4 nên forward(d["ngang"]) giống forward(4).',
        'Luna: Đổi số trong sổ thì mọi chỗ đọc sổ đổi theo.'
      ]
    }),

    manTuDien(2, 'lam-quen', {
      ten: 'Chế lệnh: đi theo sổ',
      taoHam: ['follow'], chinhCoDinh: true,
      khoaTD: ['ngang', 'doc'],
      hamCuaEmCan: ['forward', 'turn_right', 'turn_left'],
      deBai: 'Giúp Sola với! Luna ghi hai đoạn đường vào hai cuốn sổ a và b. Chế hàm follow(book): đi ngang book["ngang"] ô, rẽ phải, đi xuống book["doc"] ô, rẽ trái. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính tạo sổ a, b rồi gọi follow(a), follow(b). Mở Xưởng hàm, chế follow(book). Chạm ô số để chọn book["ngang"].',
      san: [
        '########',
        '#.II####',
        '#uuIIII#',
        '#uuuuuI#',
        '######F#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['a = {"ngang": 2, "doc": 1}', 'b = {"ngang": 3, "doc": 2}', 'follow(a)', 'follow(b)']),
      loiGiai: bai(['a = {"ngang": 2, "doc": 1}', 'b = {"ngang": 3, "doc": 2}', 'follow(a)', 'follow(b)'], [], [FOLLOW]),
      loiSai: [
        { moTa: 'Chưa chế hàm follow', baiLam: bai(['a = {"ngang": 2, "doc": 1}', 'b = {"ngang": 3, "doc": 2}', 'follow(a)', 'follow(b)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Viết số cứng forward(2) thay cho book["ngang"]: sổ b dài hơn nên R1 rẽ sớm', baiLam: bai(['a = {"ngang": 2, "doc": 1}', 'b = {"ngang": 3, "doc": 2}', 'follow(a)', 'follow(b)']), hamCuaEmMoi: [ham('follow', ['forward(2)', 'turn_right()', 'forward(book["doc"])', 'turn_left()'], ['book'])], phaiCoMa: ['roi-ho'] },
        { moTa: 'Quên rẽ trái cuối hàm: lần gọi thứ hai R1 đi xuống rồi đâm vách', baiLam: bai(['a = {"ngang": 2, "doc": 1}', 'b = {"ngang": 3, "doc": 2}', 'follow(a)', 'follow(b)']), hamCuaEmMoi: [ham('follow', ['forward(book["ngang"])', 'turn_right()', 'forward(book["doc"])'], ['book'])], phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 17, nhip: 11 },
      goiY: [
        'Luna: Trong thân hàm, sổ tên là book. Lần gọi follow(a) thì book là sổ a, lần follow(b) thì book là sổ b.',
        'Luna: Hai sổ ghi số khác nhau nên phải đọc book["ngang"], book["doc"], không viết số cứng.'
      ]
    }),

    manTuDien(3, 'lam-quen', {
      ten: 'Sửa số trong sổ',
      khoaTD: ['ngang', 'doc'],
      hamCuaEmCan: ['follow'],
      deBai: 'Giúp Sola với! Luna ghi nhầm một số trong sổ b. Sửa sổ để R1 tới cờ.',
      veMaMau: 'Chạy thử xem R1 rẽ sai ở đâu, rồi chạm vào số trong sổ để sửa.',
      san: [
        '#########',
        '#.III####',
        '#uuuI####',
        '#uuuIIIF#',
        '#########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['a = {"ngang": 3, "doc": 2}', 'b = {"ngang": 1, "doc": 0}', 'follow(a)', 'forward(b["ngang"])']),
      loiGiai: bai(['a = {"ngang": 3, "doc": 2}', 'b = {"ngang": 3, "doc": 0}', 'follow(a)', 'forward(b["ngang"])']),
      loiSai: [
        { moTa: 'Để nguyên b["ngang"] là 1: R1 dừng giữa đường', baiLam: bai(['a = {"ngang": 3, "doc": 2}', 'b = {"ngang": 1, "doc": 0}', 'follow(a)', 'forward(b["ngang"])']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sửa nhầm a["ngang"] thành 4: R1 đâm vách ở hàng trên', baiLam: bai(['a = {"ngang": 4, "doc": 2}', 'b = {"ngang": 1, "doc": 0}', 'follow(a)', 'forward(b["ngang"])']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 17, nhip: 10 },
      goiY: [
        'Luna: Sau follow(a), R1 đứng ở góc hàng dưới, mặt sang phải. Cờ còn cách 3 ô.',
        'Luna: forward(b["ngang"]) đọc khoá "ngang" của sổ b: sửa số đó thành 3.'
      ]
    }),

    manTuDien(4, 'luyen', {
      ten: 'Thêm dòng vào sổ',
      khoaTD: ['ngang', 'doc'],
      hamCuaEmCan: ['follow'],
      deBai: 'Giúp Sola với! Sổ d mới ghi khoá "ngang", chưa có khoá "doc", nên follow(d) không đọc được. Thêm cặp "doc" vào sổ.',
      veMaMau: 'Chạy thử để xem báo lỗi. Chạm dấu + trong dòng tạo sổ để thêm một cặp khoá: giá trị.',
      san: [
        '#######',
        '#.IIu##',
        '#uuI###',
        '#uuI###',
        '#uuIIF#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['d = {"ngang": 2}', 'follow(d)', 'forward(2)']),
      loiGiai: bai(['d = {"ngang": 2, "doc": 3}', 'follow(d)', 'forward(2)']),
      loiSai: [
        { moTa: 'Sổ chưa có khoá "doc": chương trình dừng vì không tìm thấy khoá', baiLam: bai(['d = {"ngang": 2}', 'follow(d)', 'forward(2)']), phaiCoMa: ['loi-chay'] },
        { moTa: 'Thêm "doc": 2: R1 rẽ sớm một hàng rồi đâm vách', baiLam: bai(['d = {"ngang": 2, "doc": 2}', 'follow(d)', 'forward(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 16, nhip: 9 },
      goiY: [
        'Luna: Muốn đọc d["doc"] thì sổ phải có khoá "doc".',
        'Luna: Từ hàng trên xuống hàng có cờ là 3 ô.'
      ]
    }),

    manTuDien(5, 'luyen', {
      ten: 'Ghi lại một dòng',
      khoaTD: ['ngang', 'doc'],
      hamCuaEmCan: ['follow'],
      deBai: 'Giúp Sola với! Hai bậc đá: bậc dưới hẹp hơn bậc trên. Giữa hai lần follow(d), ghi lại khoá "ngang" của sổ bằng một dòng gán d["ngang"] = …',
      veMaMau: 'Sola gọi follow(d) hai lần với cùng một sổ. Chạy thử xem lần hai R1 đi đâu.',
      san: [
        '########',
        '#.III###',
        '#uuuIIu#',
        '#uuuuF##',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['d = {"ngang": 3, "doc": 1}', 'follow(d)', 'follow(d)']),
      loiGiai: bai(['d = {"ngang": 3, "doc": 1}', 'follow(d)', 'd["ngang"] = 1', 'follow(d)']),
      loiSai: [
        { moTa: 'Không ghi lại: lần hai R1 đi ngang 3 ô, rơi xuống hố', baiLam: bai(['d = {"ngang": 3, "doc": 1}', 'follow(d)', 'follow(d)']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Ghi lại trước lần gọi đầu: R1 rẽ ngay, rơi xuống hố', baiLam: bai(['d = {"ngang": 3, "doc": 1}', 'd["ngang"] = 1', 'follow(d)', 'follow(d)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 17, nhip: 9 },
      goiY: [
        'Luna: d["ngang"] = 1 ghi đè số cũ trong sổ. Lần đọc sau sẽ ra 1.',
        'Luna: Ghi lại sau lần follow(d) đầu, trước lần thứ hai.'
      ]
    }),

    manTuDien(6, 'luyen', {
      ten: 'Lật từng trang sổ',
      khoaTD: ['dau', 'giua', 'cuoi'],
      hamCuaEmCan: ['rim'],
      deBai: 'Giúp Sola với! for k in d: lặp qua từng khoá của sổ, theo đúng thứ tự đã ghi. Mỗi lượt R1 đi rim(d[k]). Sổ có một số ghi sai.',
      veMaMau: 'Chạy thử: R1 đi đúng hai đoạn đầu rồi dừng sớm. Sửa số ở khoá "cuoi".',
      san: [
        '#######',
        '#.IIII#',
        '#uuuuI#',
        '#uFIII#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['d = {"dau": 4, "giua": 2, "cuoi": 2}', 'for k in d:', '    rim(d[k])']),
      loiGiai: bai(['d = {"dau": 4, "giua": 2, "cuoi": 3}', 'for k in d:', '    rim(d[k])']),
      loiSai: [
        { moTa: 'Để "cuoi": 2: R1 dừng trước cờ một ô', baiLam: bai(['d = {"dau": 4, "giua": 2, "cuoi": 2}', 'for k in d:', '    rim(d[k])']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đổi "giua" thành 3: R1 xuống quá hàng có cờ, đâm vách', baiLam: bai(['d = {"dau": 4, "giua": 3, "cuoi": 3}', 'for k in d:', '    rim(d[k])']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 12, nhip: 11 },
      goiY: [
        'Luna: Lượt 1 k là "dau", lượt 2 là "giua", lượt 3 là "cuoi". d[k] là số ghi ở khoá đó.',
        'Luna: Đoạn cuối đi từ góc phải hàng dưới sang cờ: 3 ô.'
      ]
    }),

    manTuDien(7, 'bien-the', {
      ten: 'Chế lệnh: đọc hết sổ',
      taoHam: ['walk_book'], chinhCoDinh: true,
      khoaTD: ['dau', 'giua', 'cuoi'],
      hamCuaEmCan: ['rim', 'u_turn'],
      deBai: 'Giúp Sola với! Hai cuốn sổ, cuốn a có hai dòng, cuốn b có ba dòng. Chế hàm walk_book(book): lặp qua mọi khoá của book, mỗi lượt gọi rim(book[k]). Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi walk_book(a), quay đầu, rồi walk_book(b). Chế walk_book(book) với vòng for k in book.',
      san: [
        '########',
        '#.II####',
        '#uuI####',
        '#uuIIII#',
        '#uuuuuI#',
        '#uuuFII#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['a = {"dau": 2, "giua": 2}', 'b = {"dau": 3, "giua": 2, "cuoi": 2}', 'walk_book(a)', 'u_turn()', 'walk_book(b)']),
      loiGiai: bai(['a = {"dau": 2, "giua": 2}', 'b = {"dau": 3, "giua": 2, "cuoi": 2}', 'walk_book(a)', 'u_turn()', 'walk_book(b)'], [], [WALK_BOOK]),
      loiSai: [
        { moTa: 'Chưa chế hàm walk_book', baiLam: bai(['a = {"dau": 2, "giua": 2}', 'b = {"dau": 3, "giua": 2, "cuoi": 2}', 'walk_book(a)', 'u_turn()', 'walk_book(b)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Viết cứng ba lần rim: sổ a chỉ có hai dòng, không có khoá "cuoi" nên chương trình dừng', baiLam: bai(['a = {"dau": 2, "giua": 2}', 'b = {"dau": 3, "giua": 2, "cuoi": 2}', 'walk_book(a)', 'u_turn()', 'walk_book(b)']), hamCuaEmMoi: [ham('walk_book', ['rim(book["dau"])', 'rim(book["giua"])', 'rim(book["cuoi"])'], ['book'])], phaiCoMa: ['loi-chay'] }
      ],
      sao: { o: 19, nhip: 16 },
      goiY: [
        'Luna: Thân hàm: dòng for k in book: rồi dòng thụt vào rim(book[k]).',
        'Luna: Vòng for tự dừng khi hết dòng sổ, nên sổ hai dòng hay ba dòng đều đúng.'
      ]
    }),

    manTuDien(8, 'bien-the', {
      ten: 'Sổ có dòng xuống không',
      taoHam: ['step_book'], chinhCoDinh: true,
      khoaTD: ['ngang', 'doc'],
      hamCuaEmCan: ['forward', 'turn_right', 'turn_left'],
      deBai: 'Giúp Sola với! Có sổ ghi cả đoạn ngang và đoạn xuống, có sổ chỉ ghi đoạn ngang. Chế step_book(book): đi ngang book["ngang"] ô; nếu sổ có khoá "doc" thì rẽ phải, đi xuống book["doc"] ô, rẽ trái.',
      veMaMau: 'Chương trình chính đã khoá: ba sổ a, b, c rồi ba lần step_book. Dùng điều kiện if "doc" in book:.',
      san: [
        '#########',
        '#.IIu####',
        '#uuI#####',
        '#uuIIIIu#',
        '#uuuuuI##',
        '######F##',
        '#########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['a = {"ngang": 2, "doc": 2}', 'b = {"ngang": 2}', 'c = {"ngang": 1, "doc": 2}', 'step_book(a)', 'step_book(b)', 'step_book(c)']),
      loiGiai: bai(['a = {"ngang": 2, "doc": 2}', 'b = {"ngang": 2}', 'c = {"ngang": 1, "doc": 2}', 'step_book(a)', 'step_book(b)', 'step_book(c)'], [], [STEP_BOOK]),
      loiSai: [
        { moTa: 'Chưa chế hàm step_book', baiLam: bai(['a = {"ngang": 2, "doc": 2}', 'b = {"ngang": 2}', 'c = {"ngang": 1, "doc": 2}', 'step_book(a)', 'step_book(b)', 'step_book(c)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Không hỏi "doc" in book: sổ b không có khoá "doc" nên chương trình dừng', baiLam: bai(['a = {"ngang": 2, "doc": 2}', 'b = {"ngang": 2}', 'c = {"ngang": 1, "doc": 2}', 'step_book(a)', 'step_book(b)', 'step_book(c)']), hamCuaEmMoi: [FOLLOW && ham('step_book', ['forward(book["ngang"])', 'turn_right()', 'forward(book["doc"])', 'turn_left()'], ['book'])], phaiCoMa: ['loi-chay'] }
      ],
      sao: { o: 20, nhip: 12 },
      goiY: [
        'Luna: "doc" in book đúng khi sổ có khoá "doc". Sổ b không có nên R1 chỉ đi ngang.',
        'Luna: Ba dòng rẽ phải, xuống, rẽ trái thụt vào dưới if.'
      ]
    }),

    manTuDien(9, 'bien-the', {
      ten: 'Ghép hai cách đọc sổ',
      khoaTD: ['dau', 'giua', 'cuoi', 'ngang', 'doc'],
      hamCuaEmCan: ['walk_book', 'step_book'],
      deBai: 'Giúp Sola với! Lối đi có một khúc bậc thang rồi một khúc vòng quanh hố. Kho của bạn đã có step_book và walk_book. Tự ghi sổ và gọi hàm cho đúng.',
      veMaMau: 'Sola mới ghi sổ cho khúc bậc thang. Chạy thử rồi viết tiếp.',
      san: [
        '#########',
        '#.IIuuuu#',
        '#uuIIIIu#',
        '#uuuuuIu#',
        '#uuuuuIu#',
        '#uuuFIIu#',
        '#########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['a = {"ngang": 2, "doc": 1}', 'step_book(a)']),
      loiGiai: bai(['a = {"ngang": 2, "doc": 1}', 'step_book(a)', 'b = {"dau": 3, "giua": 3, "cuoi": 2}', 'walk_book(b)']),
      loiSai: [
        { moTa: 'Chỉ có khúc bậc thang: R1 dừng giữa đường', baiLam: bai(['a = {"ngang": 2, "doc": 1}', 'step_book(a)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sổ b ghi "giua": 2: R1 rẽ sớm rồi rơi xuống hố', baiLam: bai(['a = {"ngang": 2, "doc": 1}', 'step_book(a)', 'b = {"dau": 3, "giua": 2, "cuoi": 2}', 'walk_book(b)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 22, nhip: 15 },
      goiY: [
        'Luna: Sau step_book(a), R1 ở hàng thứ hai, mặt sang phải. Từ đó đi 3, rẽ phải, đi 3, rẽ phải, đi 2.',
        'Luna: walk_book gọi rim cho từng khoá theo thứ tự đã ghi.'
      ]
    }),

    manTuDien(10, 'trum', {
      ten: 'Trùm: Ba trang sổ hang',
      taoHam: ['trip'], chinhCoDinh: true,
      khoaTD: ['ngang', 'doc', 'lui'],
      hamCuaEmCan: ['forward', 'turn_right', 'turn_left', 'back'],
      deBai: 'Giúp Sola với! Ba trang sổ, trang nào cũng có "ngang" và "doc". Trang nào có thêm khoá "lui" thì sau khi đi ngang, R1 phải lùi đúng số ô đó trước khi rẽ xuống. Chế trip(book).',
      veMaMau: 'Chương trình chính đã khoá. Chế trip(book): đi ngang, nếu có "lui" thì lùi, rồi rẽ phải, xuống, rẽ trái.',
      san: [
        '##########',
        '#.IIIu####',
        '#uIuuu####',
        '#uIIIIu###',
        '#uuuIuu###',
        '#uuuIIII##',
        '#uuuuuuI##',
        '#######F##',
        '##########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['a = {"ngang": 3, "lui": 2, "doc": 2}', 'b = {"ngang": 3, "lui": 1, "doc": 2}', 'c = {"ngang": 3, "doc": 2}', 'trip(a)', 'trip(b)', 'trip(c)']),
      loiGiai: bai(['a = {"ngang": 3, "lui": 2, "doc": 2}', 'b = {"ngang": 3, "lui": 1, "doc": 2}', 'c = {"ngang": 3, "doc": 2}', 'trip(a)', 'trip(b)', 'trip(c)'], [], [
        ham('trip', ['forward(book["ngang"])', 'if "lui" in book:', '    for i in range(book["lui"]):', '        back()', 'turn_right()', 'forward(book["doc"])', 'turn_left()'], ['book'])
      ]),
      loiSai: [
        { moTa: 'Chưa chế hàm trip', baiLam: bai(['a = {"ngang": 3, "lui": 2, "doc": 2}', 'b = {"ngang": 3, "lui": 1, "doc": 2}', 'c = {"ngang": 3, "doc": 2}', 'trip(a)', 'trip(b)', 'trip(c)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên lùi: R1 rẽ xuống từ cuối dải, rơi xuống hố', baiLam: bai(['a = {"ngang": 3, "lui": 2, "doc": 2}', 'b = {"ngang": 3, "lui": 1, "doc": 2}', 'c = {"ngang": 3, "doc": 2}', 'trip(a)', 'trip(b)', 'trip(c)']), hamCuaEmMoi: [FOLLOW && ham('trip', ['forward(book["ngang"])', 'turn_right()', 'forward(book["doc"])', 'turn_left()'], ['book'])], phaiCoMa: ['roi-ho'] },
        { moTa: 'Lùi mà không hỏi "lui" in book: trang c không có khoá "lui" nên chương trình dừng', baiLam: bai(['a = {"ngang": 3, "lui": 2, "doc": 2}', 'b = {"ngang": 3, "lui": 1, "doc": 2}', 'c = {"ngang": 3, "doc": 2}', 'trip(a)', 'trip(b)', 'trip(c)']), hamCuaEmMoi: [ham('trip', ['forward(book["ngang"])', 'for i in range(book["lui"]):', '    back()', 'turn_right()', 'forward(book["doc"])', 'turn_left()'], ['book'])], phaiCoMa: ['loi-chay'] }
      ],
      sao: { o: 25, nhip: 23 },
      goiY: [
        'Luna: Lùi book["lui"] ô là một vòng for i in range(book["lui"]): với back() bên trong.',
        'Luna: Đặt vòng lùi dưới if "lui" in book: để trang c không bị lỗi.'
      ]
    })
  ];

  if (M && M.them) M.manBanhGai = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();

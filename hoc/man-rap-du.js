/* ============================================================================
   man-rap-du.js — "Robot Chấn Hưng": CHƯƠNG `rap-du` · LẮP RÁP: ĐỦ BỘ (10 màn, chương CUỐI của game, chế độ lắp ráp: KE-HOACH-LAP-RAP.md).
   Mỗi màn người chơi tự chọn THÂN + TAY + NÃO (cảm biến) dưới một NGÂN SÁCH XU (lapRap.nganSach), rồi viết code giải màn. Không part nào trội: part đắt thì nhanh / gọn code hơn nhưng tốn xu
   (và pin), part rẻ thì đi vòng / chậm. Cảm biến không đổi vật lý, chỉ giúp chương trình quyết định — ở màn nhiều sân, mắt giúp một chương trình đúng cả ba sân.
   Part (LapRap.DANH_MUC): thân hai-banh 2 · xich 3 · omni 4 · nhen 4 · drone 5; tay kep 2 · xoay 3 · nam-cham 3 · nem 3 · hoi 3; não khoang-cach 1 · mau 2 · camera 2 · tu 2 · camera-bay 2 (chỉ drone).
   Dữ liệu màn: `lapRap { than, tay, camBien, nganSach, phaiCo?, cachLap: [...] }`. KHÔNG khai robot / hamGoc / loiGiai ở màn: ManHoc.chuanHoa điền bản mặc định theo cachLap[0] (cách ứng với 3 sao: sao.nhip, sao.o
   khớp lời giải của cách đó); game chơi LapRap.apDung(màn, cách người chơi chọn). Mỗi cách mẫu có lời giải chạy thật. Màn khai `lapRap.dungKho: true` (man() ở dưới): lời giải mẫu dùng hàm của em có sẵn trong kho
   (move, turn_right, forward, pick, walk, jet_back, grip, ship… ) và chạy trên KHO THAM CHIẾU (LapRap.khoMau: mọi hàm của em các màn thường đứng trước), nên bảng "Cách lắp khác" không phụ thuộc kho thật của người chơi;
   không màn nào tạo / sửa hàm của em (taoHam rỗng, không hamCuaEmMoi), các hàm kho vẫn bị khóa. Ô = dòng chương trình + thân các hàm thực sự được gọi.
   Khung 10 ô cho chương trình chính và mỗi hàm; cauTruc ['for', 'if', 'while', 'list']; chương trình chính tự viết (maMau rỗng).
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.

   SAO: cachLap[0] = cách nhanh nhất trong ngân sách (3 sao). sao.nhip = nhịp ngắn nhất của cách đó (BFS ở do-duong-rap-du.mjs: không loại robot nào, kể cả đắt hơn, thắng nhanh hơn robot mặc định);
   màn khai nhipTheoLoiGiai (6, 9) thì sao.nhip là nhịp của lời giải tự nhiên và BFS có thể ngắn hơn (6: gộp lệnh hút vào nhịp bay; 9: đổi cực lúc quay xe để "bắn" hộp ra sau).
   sao.o = MAX(ô lời giải TỰ NHIÊN dùng hàm kho, ô lời giải viết thuần lệnh gốc) (luật điều phối 17/10): lời giải mặc định của cách 0 (cachLap[0].loiGiai) là lời giải dùng hàm kho, và cachLap[0].loiGiaiPhu
   (khi có) là cách viết thuần lệnh gốc / ngắn hơn; kiem-rap-du.mjs kiểm CẢ HAI đạt 3 sao và sao.o đúng bằng ô lớn hơn.

   Mười màn (cách lắp mẫu: giá xu · nhịp · ô; ba hay hai cách mỗi màn, cách rẻ hơn thì chậm hơn hay dài hơn):
     1  Qua sông       thân      tới cờ qua sông (hố): drone bay thẳng 5·4·11 · nhện nhảy hố 4·6·5 · hai bánh vòng qua cầu 2·12·12                  (5 xu)
     2  Ném qua rào    tay       đưa hộp qua hàng rào: hai bánh + máy ném 5·2·7 · hai bánh + tay kẹp đi vòng 4·12·27                                  (5 xu)
     3  Tìm lối        não       ba sân, lối hở khác nhau: hai bánh + khoảng cách 3·33·16 · nhện nhảy rào không cần mắt 4·51·8                        (4 xu)
     4  Cửa sắt        tay       nút mở cửa chỉ bắn trúng mới bấm: hai bánh + súng hơi 5·6·12 · drone bay vòng 5·11·6 · hai bánh đi vòng 2·14·16     (5 xu)
     5  Băng ngược     thân      băng chuyền ngược: drone 5·9·11 · xích bám chắc 3·11·11 · hai bánh bị đẩy lùi 2·14·11                               (5 xu)
     6  Hàng sắt có pin tay+thân đưa hộp sắt qua sông, pin + ô sạc P: drone + nam châm 8·8·16 · nhện + kẹp nhảy 6·11·18 · hai bánh + kẹp vòng 4·15·27 (10 xu)
     7  Đẩy thùng      thân      ba thùng nặng vào ô đích bằng cú giật (mỗi thùng nhích một ô, xe theo): omni + súng hơi (trượt ngang) 7·9·13 · hai bánh + súng hơi (quay) 5·15·20     (7 xu)
     8  Phân loại màu  não+tay   ba sân, hộp đỏ / xanh dương, camera đọc màu hộp: hai bánh + tay xoay + camera 7·9·17 · tay kẹp 6·12·21                 (7 xu)
     9  Hút từ xa      não+tay   hộp nam châm cực ẩn: hai bánh + nam châm + cảm biến từ 7·9·12 · hai bánh + tay kẹp đi lấy 4·24·23                  (7 xu)
     10 Cổng năm lối   trùm      bức tường năm lối (rào, cửa + nút, gầm, bậc thang, hố), ô sạc P: hai bánh + súng hơi 5·6·12 · drone 5·7·6 · nhện 4·10·9 · xích 3·13·14   (5 xu)
   Nối tiếp man-flycam.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-flycam.js') : window.ManHoc;

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hay mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }

  /**
   * Điền các trường chung của chương. Màn nhiều sân (san là mảng sân) tự có nhipTheo 'tong' và batDau song song.
   * Không đụng tới trường màn đã khai.
   */
  function man(m) {
    m.chuong = 'rap-du';
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.lapRap.dungKho = true;                                                     // lời giải mẫu chạy trên KHO THAM CHIẾU (LapRap.khoMau): được dùng move(), forward(n), pick(), walk(path)… không khai lại hàm
    if (!m.maMau) m.maMau = { chinh: [] };
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */
  // 1: sông (hố u) ở cột 3, chỉ có cầu ở hàng trên cùng; xe ở (1,3) quay lên, cờ ở (5,3)
  var SAN_1 = ['.......', '...u...', '...u...', '...u.F.', '...u...'];

  // 2: hàng rào (cột 3), cầu ở hàng trên cùng; xe ở (1,2) quay phải, vật ngay trước mặt (2,2), ô đích ở (4,2) bên kia rào
  var SAN_2 = ['.......', '...=...', '..o=D..', '...=...', '...=...'];

  // 3: ba hành lang cùng khung: hàng rào ở cột 2, chỉ có MỘT lối mở ở hàng 1 / 2 / 4 (mỗi sân một khác); xe ở (1,5) quay lên, cờ ở (5,0)
  function hanhLang(lo) {
    var kq = [];
    for (var y = 0; y < 6; y++) kq.push(y === 0 ? '#.=.' + '.F#' : '#.' + (y === lo ? '.' : '=') + '...#');
    return kq;
  }
  var SAN_3 = [hanhLang(1), hanhLang(2), hanhLang(4)];

  // 4: bức tường cột 3 chỉ có CỬA ở (3,3); nút bắn ở (1,0) trên tường; đường vòng ở hàng dưới cùng. Xe ở (1,2) quay lên, cờ ở (5,3)
  var SAN_4 = ['#N#####', '#..#..#', '#..#..#', '#..C.F#', '#..#..#', '#..#..#', '#.....#'];

  // 5: băng chuyền chạy NGƯỢC (về bên trái) dài 5 ô; xe ở (0,3) quay phải, hết băng thì rẽ lên cột cuối tới cờ (6,0)
  var SAN_5 = ['######F', '######.', '######.', '.<<<<<.', '#######'];

  // 6: sông (hố) ở cột 3, hộp SẮT ở (1,2), ô đích ở (6,2), ô sạc P ở (4,2) ngay trên đường bay; xe ở (0,2) quay phải; pin 5 (chỉ drone)
  var SAN_6 = ['.......', '...u...', '.o.uP.D', '...u...', '...u...'];
  var CHAT_6 = ['.......', '.......', '.s.....', '.......', '.......'];

  // 7: ba hàng, mỗi hàng một thùng nặng (cột 2) và một ô đích (cột 6); xe đi theo cột 0 giữa các hàng; xe ở (0,1) quay phải
  var SAN_7 = ['#######', '#.HD###', '#.#####', '#.HD###', '#.#####', '#.HD###', '#######'];     // luật giật một ô (29/10): mỗi hàng thùng (2,y) nhích một ô vào đích (3,y), xe theo vào (2,y) rồi lùi về cột 1

  // 8: ba sân giống nhau, hộp ở (2,1) trước mặt xe (2,2); ô đích ĐỎ ở (1,2) bên trái, ô đích XANH DƯƠNG ở (3,2) bên phải; màu hộp: đỏ / xanh dương / đỏ
  var SAN_8 = ['.....', '..o..', '.D.D.'];
  var MAU_8 = ['.....', '.....', '.r.b.'];
  function hopMau(c) { return ['.....', '..' + c + '..', '.....']; }

  // 9: hộp nam châm ở (4,1) cách xe (1,1) ba ô, sau lưng hộp là tường; ô đích D sau lưng xe ở (0,1); cực quay về phía xe: N / S / N
  var SAN_9 = ['######', 'D...o#', '######'];
  function chatCuc(c) { return ['......', '....' + c + '.', '......']; }

  // 10 (trùm): bức tường cột 3 có NĂM lối: rào (3,1), cửa (3,3) mở bằng nút ở (1,0), gầm (3,4), bậc thang (3,5), hố (3,6); (3,2) là tường. Ô sạc P ở (2,2). Xe ở (1,2) quay lên, cờ ở (5,3); pin 6 (chỉ drone)
  var SAN_10 = ['#N#####', '#..=..#', '#.P#..#', '#..C.F#', '#..n..#', '#..S..#', '#..u..#', '#######'];

  var DS = [
    man({
      so: 1, ten: 'Qua sông', hang: 'lam-quen',
      deBai: 'Lá cờ ở bên kia sông, cây cầu thì ở tận hàng trên cùng. Em có 5 xu: hãy lắp robot rồi đưa nó tới cờ.',
      veMaMau: 'Chương trình còn trống. Bấm từng thẻ part để xem nó vượt được gì, lắp xong rồi mới viết.',
      san: SAN_1, batDau: { x: 1, y: 3, huong: 0 },
      lapRap: {
        than: ['hai-banh', 'xich', 'omni', 'nhen', 'drone'], tay: [], camBien: [], nganSach: 5,
        cachLap: [
          { than: 'drone', tay: null, camBien: null, loiGiai: { chinh: ['walk("RRRR")'] }, loiGiaiPhu: { moTa: 'viết thẳng lệnh gốc', chinh: LAP(4, 'go_right()') }, ghiChu: 'Bay thẳng qua sông: nhanh nhất, tốn 5 xu.' },
          { than: 'nhen', tay: null, camBien: null, loiGiai: { chinh: ['crouch()', 'go_right()', 'stand()', 'go_right()', 'go_right()'] }, ghiChu: 'Co chân rồi nhảy qua hố: rẻ hơn drone, chậm hơn.' },
          { than: 'hai-banh', tay: null, camBien: null, loiGiai: { chinh: ['forward(3)', 'turn_right()', 'forward(4)', 'turn_right()', 'forward(3)'] }, ghiChu: 'Đi vòng qua cầu: rẻ nhất, nhưng đường dài.' }
        ]
      },
      sao: { o: 11, nhip: 4, re: { gia: 2, o: 12 } },
      loiGiaiKhac: { moTa: 'Cùng đường bay, chia làm hai đoạn walk', baiLam: { chinh: ['walk("RR")', 'walk("RR")'] } },
      loiSai: [
        { moTa: 'Bay sang phải có ba ô: drone dừng cách cờ một ô', baiLam: { chinh: LAP(3, 'go_right()') }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Robot rẻ phải đi vòng qua cầu; robot biết bay hay nhảy thì đi thẳng.', 'Cờ cách robot bốn ô sang phải.']
    }),

    man({
      so: 2, ten: 'Ném qua rào', hang: 'lam-quen', mucTieu: 'dua-vat',
      deBai: 'Hộp nằm ngay trước xe, ô đích ở bên kia hàng rào. Em có 5 xu: lắp tay gắp để mang hộp đi vòng, hoặc lắp tay ném để ném hộp qua rào.',
      veMaMau: 'Chương trình còn trống. Tay ném cần nạp hộp vào rổ trước, rồi mới ném.',
      san: SAN_2, batDau: { x: 1, y: 2, huong: 1 },
      lapRap: {
        than: ['hai-banh', 'xich'], tay: ['kep', 'nam-cham', 'nem'], camBien: [], nganSach: 5, phaiCo: ['tay'],
        khongQua: [
          { than: 'hai-banh', tay: 'nam-cham', lyDo: 'Vật là gỗ, nam châm không hút được. Cần tay kẹp hoặc máy ném để đưa vật sang bên kia rào.' }
        ],
        cachLap: [
          { than: 'hai-banh', tay: 'nem', camBien: null, loiGiai: { chinh: ['launch(3)'] }, loiGiaiPhu: { moTa: 'viết thẳng lệnh gốc', chinh: ['load()', 'wait()', 'aim(3)', 'throw()', 'wait()'] }, ghiChu: 'Nạp hộp rồi ném qua rào: chỉ hai nhịp, tốn 5 xu.' },
          { than: 'hai-banh', tay: 'kep', camBien: null, loiGiai: { chinh: ['pick()', 'turn_left()', 'forward(2)', 'turn_right()', 'forward(3)', 'turn_right()', 'move()', 'drop()'] }, ghiChu: 'Kẹp hộp đi vòng qua cầu: rẻ hơn, nhưng đường dài.' }
        ]
      },
      sao: { o: 7, nhip: 2, re: { gia: 4, o: 27 } },
      loiGiaiKhac: { moTa: 'Cùng cách ném viết bằng lệnh gốc, thêm ba dòng chú thích', baiLam: { chinh: ['# nạp hộp rồi ném', '# tầm 3 ô', '# qua hàng rào', 'load()', 'wait()', 'aim(3)', 'throw()', 'wait()'] } },
      loiSai: [
        { moTa: 'Ném tầm 2: hộp rơi đúng lên hàng rào và vỡ', baiLam: { chinh: ['load()', 'wait()', 'aim(2)', 'throw()', 'wait()'] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Quên nạp hộp: rổ trống nên ném hụt', baiLam: { chinh: ['aim(3)', 'throw()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Ném trúng ô đích thì đếm từ xe: ô thứ nhất, thứ hai, thứ ba. Hàng rào là ô thứ hai.', 'aim(n) đặt tầm ném, load() nạp hộp ở ô trước mặt, throw() ném.']
    }),

    man({
      so: 3, ten: 'Tìm lối', hang: 'lam-quen', nhipTheoLoiGiai: false,
      deBai: 'Hành lang có hàng rào, chỉ một chỗ hở, và chỗ hở mỗi sân một khác. Em có 4 xu: lắp robot rồi viết một chương trình đúng cho cả ba sân.',
      veMaMau: 'Chương trình còn trống. Robot có mắt thì tự tìm chỗ hở; robot không mắt phải biết sẵn đường.',
      san: SAN_3, batDau: { x: 1, y: 5, huong: 0 },
      lapRap: {
        than: ['hai-banh', 'xich', 'nhen'], tay: [], camBien: ['khoang-cach', 'mau'], nganSach: 4,
        cachLap: [
          { than: 'hai-banh', tay: null, camBien: 'khoang-cach', loiGiai: { chinh: ['to_gap()', 'turn_right()', 'go_wall()', 'turn_left()', 'go_wall()'] }, loiGiaiPhu: { moTa: 'viết thẳng vòng while', chinh: ['while not right_clear():', '    move()', 'turn_right()', 'while front_clear():', '    move()', 'turn_left()', 'while front_clear():', '    move()'] }, ghiChu: 'Mắt khoảng cách tự tìm chỗ hở: đúng cả ba sân, chỉ tốn 3 xu.' },
          { than: 'nhen', tay: null, camBien: null, loiGiai: { chinh: ['crouch()', 'wait()', 'stand()', 'go_right()', 'for i in range(2):', '    go_right()', 'for i in range(5):', '    go_up()'] }, ghiChu: 'Nhện nhảy qua rào ở hàng dưới cùng, không cần mắt: code ngắn nhưng đi chậm.' }
        ]
      },
      sao: { o: 16, nhip: 33, re: { gia: 3, o: 16 } },
      loiGiaiKhac: { moTa: 'Cùng cách đi, ghi chú từng đoạn', baiLam: { chinh: ['# tìm chỗ hở bên phải', 'to_gap()', 'turn_right()', '# đi hết hàng', 'go_wall()', 'turn_left()', 'go_wall()'] } },
      loiSai: [
        { moTa: 'Đi thẳng lên hết hành lang rồi mới rẽ: hàng trên cùng là rào kín', baiLam: { chinh: ['while front_clear():', '    move()', 'turn_right()', 'while front_clear():', '    move()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết cứng: đi lên hai ô rồi rẽ, chỉ đúng một sân', baiLam: { chinh: ['forward(2)', 'turn_right()', 'forward(4)', 'turn_left()', 'forward(3)'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Rào ở bên phải xe thì right_clear() là False, tới chỗ hở thì thành True.', 'Rẽ phải qua chỗ hở, đi tới tường, rồi rẽ trái đi tiếp lên cờ.']
    }),

    man({
      so: 4, ten: 'Cửa sắt', hang: 'luyen',
      deBai: 'Cửa sắt chặn giữa đường tới cờ, còn lối vòng ở tận hàng dưới cùng. Van trên tường mở được cửa, nhưng chỉ tia nước bắn trúng mới quay được. Em có 5 xu.',
      veMaMau: 'Chương trình còn trống. Vòi phun bắn thẳng về phía trước, và mỗi lần bắn xe giật lùi một ô.',
      san: SAN_4, batDau: { x: 1, y: 2, huong: 0 },
      lapRap: {
        than: ['hai-banh', 'xich', 'nhen', 'drone'], tay: ['hoi'], camBien: [], nganSach: 5,
        cachLap: [
          { than: 'hai-banh', tay: 'hoi', camBien: null, loiGiai: { chinh: ['jet_back()', 'turn_right()', 'forward(4)'] }, loiGiaiPhu: { moTa: 'viết thẳng lệnh gốc spray()', chinh: ['spray()', 'wait()', 'turn_right()', 'forward(4)'] }, ghiChu: 'Bắn trúng van, cửa mở, đi thẳng: nhanh nhất nhưng tốn 5 xu.' },
          { than: 'drone', tay: null, camBien: null, loiGiai: { chinh: nhieu(LAP(4, 'go_down()'), LAP(4, 'go_right()'), LAP(3, 'go_up()')) }, ghiChu: 'Bay vòng qua hàng dưới cùng, không cần mở cửa: code ngắn, đường dài.' },
          { than: 'hai-banh', tay: null, camBien: null, loiGiai: { chinh: ['u_turn()', 'forward(4)', 'turn_left()', 'forward(4)', 'turn_left()', 'forward(3)'] }, ghiChu: 'Đi vòng dưới cùng: rẻ nhất, đường dài nhất.' }
        ]
      },
      sao: { o: 12, nhip: 6, re: { gia: 2, o: 16 } },
      loiGiaiKhac: { moTa: 'Cùng cách bắn, ghi chú từng việc', baiLam: { chinh: ['# bắn trúng van', 'jet_back()', '# qua cửa', 'turn_right()', 'forward(4)'] } },
      loiSai: [
        { moTa: 'Không bắn van: xe đâm vào cửa đóng', baiLam: { chinh: ['turn_right()', 'forward(4)'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bắn xong quên wait(): lệnh quay dính vào nhịp bắn nên bị bỏ', baiLam: { chinh: ['spray()', 'turn_right()', 'forward(4)'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Tia nước chỉ bắn thẳng. Xe quay mặt lên thì van ở ngay phía trước.', 'Cửa mở xong thì quay phải rồi đi thẳng bốn ô.']
    }),

    man({
      so: 5, ten: 'Băng ngược', hang: 'luyen',
      deBai: 'Băng chuyền dài chạy ngược lại, cuối băng rẽ lên cột cuối để tới cờ. Em có 5 xu: robot nào bị băng đẩy lùi, robot nào đứng vững?',
      veMaMau: 'Chương trình còn trống. Thử chạy một robot lên băng để xem băng đẩy nó thế nào.',
      san: SAN_5, batDau: { x: 0, y: 3, huong: 1 },
      lapRap: {
        than: ['hai-banh', 'xich', 'omni', 'nhen', 'drone'], tay: [], camBien: [], nganSach: 5,
        khongQua: [
          { than: 'omni', lyDo: 'Bánh omni trơn: đi ngược băng chuyền thì bị đẩy về, đứng im tại chỗ.' }
        ],
        cachLap: [
          { than: 'drone', tay: null, camBien: null, loiGiai: { chinh: ['walk("RRRRRRUUU")'] }, loiGiaiPhu: { moTa: 'viết thẳng hai vòng for', chinh: nhieu(LAP(6, 'go_right()'), LAP(3, 'go_up()')) }, ghiChu: 'Bay trên băng, băng không đẩy được: nhanh nhất, tốn 5 xu.' },
          { than: 'xich', tay: null, camBien: null, loiGiai: { chinh: ['forward(6)', 'tr_left()', 'forward(3)'] }, ghiChu: 'Xích bám chắc, băng không đẩy được; chỉ quay hơi chậm.' },
          { than: 'hai-banh', tay: null, camBien: null, loiGiai: { chinh: ['forward(5)', 'forward(5)', 'turn_left()', 'forward(3)'] }, ghiChu: 'Bị băng đẩy lùi nên cứ hai nhịp mới tiến được một ô; rẻ nhất.' }
        ]
      },
      sao: { o: 11, nhip: 9, re: { gia: 2, o: 11 } },
      loiGiaiKhac: { moTa: 'Cùng đường bay, chia hai đoạn walk', baiLam: { chinh: ['walk("RRRRRR")', 'walk("UUU")'] } },
      loiSai: [
        { moTa: 'Bay sang phải có năm ô rồi lên: drone đâm vào tường ở cột năm', baiLam: { chinh: nhieu(LAP(5, 'go_right()'), LAP(3, 'go_up()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Mới bay hết băng mà chưa rẽ lên cột cuối', baiLam: { chinh: LAP(6, 'go_right()') }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Băng chạy ngược đẩy xe lùi; xích bám chắc, drone bay phía trên nên đều không bị đẩy.', 'Robot bị đẩy phải tiến nhiều bước hơn số ô cần đi.']
    }),

    man({
      so: 6, ten: 'Hàng sắt có pin', hang: 'luyen', mucTieu: 'dua-vat', vatCan: 'sat', pin: 5, nhipTheoLoiGiai: true,
      deBai: 'Hộp sắt nằm bên này sông, ô đích bên kia. Drone nhanh nhưng pin chỉ đủ năm nhịp, may có ô sạc P ngay trên đường bay. Em có 10 xu.',
      veMaMau: 'Chương trình còn trống. Mỗi nhịp bay tốn một pin; bay qua ô P thì pin đầy lại.',
      san: SAN_6, vatChat: CHAT_6, batDau: { x: 0, y: 2, huong: 1 },
      lapRap: {
        than: ['hai-banh', 'xich', 'nhen', 'drone'], tay: ['kep', 'nam-cham'], camBien: ['camera-bay'], nganSach: 10, phaiCo: ['tay'],
        cachLap: [
          { than: 'drone', tay: 'nam-cham', camBien: null, loiGiai: { chinh: ['ship("RRRRRR")'] }, loiGiaiPhu: { moTa: 'viết thẳng lệnh gốc, gộp lệnh hút vào nhịp bay đầu tiên (7 nhịp)', chinh: nhieu(['magnet_n()'], LAP(6, 'go_right()'), ['magnet_off()', 'wait()']) }, ghiChu: 'Hút hộp rồi bay thẳng qua ô sạc: nhanh nhất, tốn 8 xu.' },
          { than: 'nhen', tay: 'kep', camBien: null, loiGiai: { chinh: nhieu(['pick()'], LAP(2, ['crouch()', 'wait()', 'stand()', 'go_right()']), ['go_right()', 'drop()']) }, ghiChu: 'Kẹp hộp rồi nhảy qua sông bằng chân nhện: 6 xu, chậm hơn.' },
          { than: 'hai-banh', tay: 'kep', camBien: null, loiGiai: { chinh: ['pick()', 'turn_left()', 'forward(2)', 'turn_right()', 'forward(6)', 'turn_right()', 'move()', 'drop()'] }, ghiChu: 'Kẹp hộp đi vòng qua cầu trên cùng: rẻ nhất, đường dài nhất.' }
        ]
      },
      sao: { o: 16, nhip: 8, re: { gia: 4, o: 27 } },
      loiGiaiKhac: { moTa: 'Cùng cách chở, ghi chú hai dòng', baiLam: { chinh: ['# hút, bay qua sông, thả', '# ghé ô sạc trên đường', 'ship("RRRRRR")'] } },
      loiSai: [
        { moTa: 'Bay vòng lên hàng trên, không qua ô sạc: pin cạn giữa đường', baiLam: { chinh: nhieu(['magnet_n()', 'go_right()', 'go_up()'], LAP(5, 'go_right()'), ['go_down()', 'magnet_off()', 'wait()']) }, phaiCoMa: ['het-pin'] },
        { moTa: 'Quên magnet_off(): hộp còn dính dưới bụng, chưa nằm trên ô đích', baiLam: { chinh: nhieu(['magnet_n()'], LAP(6, 'go_right()'), ['wait()']) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Drone bay qua sông và qua ô P trên cùng một hàng; lệnh nam châm làm ở nhịp bay kế tiếp.', 'Robot không bay phải kẹp hộp rồi tìm đường qua sông.']
    }),

    man({
      so: 7, ten: 'Đẩy thùng', hang: 'bien-the', mucTieu: 'day-thung',
      deBai: 'Ba thùng nặng nằm trên ba hàng, mỗi hàng có một ô đích ngay sau thùng. Chỉ cú giật của vòi phun mới đẩy được thùng nặng: thùng nhích một ô, xe theo một ô. Em có 7 xu.',
      veMaMau: 'Chương trình còn trống. Bắn ra sau thì xe giật tới: đứng sát thùng, quay mặt về phía thùng rồi bắn ra sau.',
      san: SAN_7, batDau: { x: 1, y: 1, huong: 1 },
      lapRap: {
        than: ['hai-banh', 'xich', 'omni'], tay: ['hoi'], camBien: [], nganSach: 7, phaiCo: ['tay'],
        cachLap: [
          { than: 'omni', tay: 'hoi', camBien: null, loiGiai: { chinh: nhieu(['jet_fwd()'], LAP(2, ['back()', 'slide_r(2)', 'jet_fwd()'])) }, ghiChu: 'Omni trượt ngang sang hàng kế mà không phải quay: nhanh hơn, tốn 7 xu.' },
          { than: 'hai-banh', tay: 'hoi', camBien: null, loiGiai: { chinh: nhieu(['jet_fwd()'], LAP(2, ['u_turn()', 'move()', 'turn_left()', 'forward(2)', 'turn_left()', 'jet_fwd()'])) }, ghiChu: 'Hai bánh phải quay mỗi lần đổi hàng: rẻ hơn, chậm hơn.' }
        ]
      },
      sao: { o: 13, nhip: 9, re: { gia: 5, o: 20 } },
      loiGiaiKhac: { moTa: 'Cùng cách đẩy, ghi chú từng việc', baiLam: { chinh: nhieu(['# thùng hàng đầu'], ['jet_fwd()'], ['# hai hàng còn lại'], LAP(2, ['back()', 'slide_r(2)', 'jet_fwd()'])) } },
      loiSai: [
        { moTa: 'Bắn ra trước thay vì ra sau: xe giật lùi, thùng đứng yên', baiLam: { chinh: nhieu(['spray()', 'wait()'], LAP(2, ['back()', 'slide_r(2)', 'spray()', 'wait()'])) }, phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Chỉ đẩy thùng hàng đầu rồi dừng', baiLam: { chinh: ['jet_fwd()'] }, phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Mặt quay về phía thùng, bắn ra sau: xe giật tới, thùng nhích một ô vào đích và xe theo vào chỗ thùng.', 'Lùi một ô về cột trống rồi đổi hàng: xe quay hay trượt ngang, tùy robot.']
    }),

    man({
      so: 8, ten: 'Phân loại màu', hang: 'bien-the', mucTieu: 'dua-vat',
      deBai: 'Hộp đỏ phải vào ô đích đỏ, hộp xanh dương phải vào ô đích xanh dương, mà mỗi sân hộp một màu khác. Robot cần nhìn màu hộp trước khi nhặt. Em có 7 xu.',
      veMaMau: 'Chương trình còn trống. Cảm biến màu ở bụng chỉ đọc màu sàn; camera nhìn được màu của hộp ở ô trước mặt.',
      san: [SAN_8, SAN_8, SAN_8], mau: [MAU_8, MAU_8, MAU_8], vatMau: [hopMau('r'), hopMau('b'), hopMau('r')], batDau: { x: 2, y: 2, huong: 0 },
      lapRap: {
        than: ['hai-banh', 'xich'], tay: ['kep', 'xoay'], camBien: ['khoang-cach', 'mau', 'camera'], nganSach: 7, phaiCo: ['tay'],
        cachLap: [
          { than: 'hai-banh', tay: 'xoay', camBien: 'camera', loiGiai: { chinh: ['c = color()', 'pick()', 'if c == "red":', '    arm_left()', 'else:', '    arm_right()', 'drop()'] }, ghiChu: 'Tay xoay thả sang trái hay phải mà không phải quay xe: nhanh hơn, tốn 7 xu.' },
          { than: 'hai-banh', tay: 'kep', camBien: 'camera', loiGiai: { chinh: ['c = color()', 'pick()', 'if c == "red":', '    turn_left()', 'else:', '    turn_right()', 'drop()'] }, ghiChu: 'Tay kẹp phải quay xe về phía ô đích: rẻ hơn, thêm một nhịp mỗi sân.' }
        ]
      },
      sao: { o: 17, nhip: 9, re: { gia: 6, o: 21 } },
      loiGiaiKhac: { moTa: 'Cùng cách phân loại, ghi chú từng việc', baiLam: { chinh: ['# nhìn màu hộp', 'c = color()', 'pick()', 'if c == "red":', '    arm_left()', 'else:', '    arm_right()', 'drop()'] } },
      loiSai: [
        { moTa: 'Không nhìn màu: luôn xoay trái, hộp xanh dương vào nhầm ô đích', baiLam: { chinh: ['pick()', 'arm_left()', 'drop()'] }, phaiCoMa: ['dat-sai-mau'] },
        { moTa: 'Nhìn màu sau khi nhặt: lúc đó ô trước mặt đã trống', baiLam: { chinh: ['pick()', 'c = color()', 'if c == "red":', '    arm_left()', 'else:', '    arm_right()', 'drop()'] }, phaiCoMa: ['dat-sai-mau'] }
      ],
      goiY: ['Nhìn màu hộp trước, nhớ vào biến, rồi mới nhặt.', 'Ô đích đỏ ở bên trái xe, ô đích xanh dương ở bên phải.']
    }),

    man({
      so: 9, ten: 'Hút từ xa', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheoLoiGiai: true,
      deBai: 'Hộp nam châm nằm cách xe ba ô, mỗi sân hộp quay một cực khác: khác cực thì hút, cùng cực thì đẩy. Hút hộp về rồi thả xuống ô đích sau lưng xe. Em có 7 xu.',
      veMaMau: 'Chương trình còn trống. Cảm biến từ cho biết cực của hộp ở trước mặt: front_pole() trả "N" hay "S".',
      san: [SAN_9, SAN_9, SAN_9], vatChat: [chatCuc('N'), chatCuc('S'), chatCuc('N')], batDau: { x: 1, y: 1, huong: 1 },
      lapRap: {
        than: ['hai-banh', 'xich'], tay: ['kep', 'nam-cham'], camBien: ['khoang-cach', 'mau', 'tu'], nganSach: 7, phaiCo: ['tay'],
        cachLap: [
          { than: 'hai-banh', tay: 'nam-cham', camBien: 'tu', loiGiai: { chinh: ['grip()', 'u_turn()', 'magnet_off()', 'wait()'] }, loiGiaiPhu: { moTa: 'viết thẳng if / else', chinh: ['if front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'wait()', 'u_turn()', 'magnet_off()', 'wait()'] }, ghiChu: 'Đọc cực rồi bật cực ngược lại, hút hộp từ xa: ba nhịp, tốn 7 xu.' },
          { than: 'hai-banh', tay: 'kep', camBien: null, loiGiai: { chinh: ['forward(2)', 'pick()', 'u_turn()', 'forward(2)', 'drop()'] }, ghiChu: 'Đi tới kẹp hộp rồi mang về: rẻ hơn nhiều, nhưng thêm nhiều nhịp.' }
        ]
      },
      sao: { o: 12, nhip: 9, re: { gia: 4, o: 23 } },
      loiGiaiKhac: { moTa: 'Cùng cách hút, ghi chú một dòng', baiLam: { chinh: ['# đọc cực rồi hút hộp', 'grip()', 'u_turn()', 'magnet_off()', 'wait()'] } },
      loiSai: [
        { moTa: 'Luôn bật cực N: hộp cực N bị đẩy chứ không bị hút', baiLam: { chinh: ['magnet_n()', 'wait()', 'u_turn()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên quay xe trước khi thả: hộp rơi ngay trước mặt, không phải ô đích', baiLam: { chinh: ['if front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'wait()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Hộp cực N thì bật cực S để hút; hộp cực S thì bật cực N.', 'Hút xong, quay xe lại rồi mới thả: ô đích ở sau lưng.']
    }),

    man({
      so: 10, ten: 'Cổng năm lối', hang: 'trum', pin: 6,
      huyHieu: { ma: 'rap-du', ten: 'Huy hiệu Lắp ráp: Đủ bộ' },
      deBai: 'Bức tường có năm lối: rào thấp, cửa sắt, gầm thấp, bậc thang và hố. Mỗi robot chỉ qua được một số lối, và lối nào cũng có giá của nó. Em có 5 xu.',
      veMaMau: 'Chương trình còn trống. Chọn robot theo lối nó qua được: ô sạc P giúp drone đầy pin, van trên tường mở cửa sắt.',
      san: SAN_10, batDau: { x: 1, y: 2, huong: 0 },
      lapRap: {
        than: ['hai-banh', 'xich', 'omni', 'nhen', 'drone'], tay: ['hoi'], camBien: [], nganSach: 5,
        khongQua: [
          { than: 'hai-banh', tay: null, lyDo: 'Năm lối đều có vật cản: hàng rào, cửa đóng, gầm thấp, bậc thang, hố. Xe hai bánh không gắn vòi phun thì không qua được lối nào.' },
          { than: 'omni', lyDo: 'Năm lối đều có vật cản: hàng rào, cửa đóng, gầm thấp, bậc thang, hố. Bánh omni không qua được lối nào.' }
        ],
        cachLap: [
          { than: 'hai-banh', tay: 'hoi', camBien: null, loiGiai: { chinh: ['jet_back()', 'turn_right()', 'forward(4)'] }, loiGiaiPhu: { moTa: 'viết thẳng lệnh gốc spray()', chinh: ['spray()', 'wait()', 'turn_right()', 'forward(4)'] }, ghiChu: 'Bắn trúng van, cửa sắt mở, đi thẳng: nhanh nhất.' },
          { than: 'drone', tay: null, camBien: null, loiGiai: { chinh: nhieu(['go_right()', 'go_up()'], LAP(3, 'go_right()'), LAP(2, 'go_down()')) }, ghiChu: 'Bay qua rào, ghé ô sạc trên đường: code ngắn nhất, đường dài hơn một nhịp.' },
          { than: 'nhen', tay: null, camBien: null, loiGiai: { chinh: ['go_up()', 'crouch()', 'go_right()', 'stand()', 'go_right()', 'crouch()', 'go_right()', 'stand()', 'go_down()'] }, ghiChu: 'Nhảy qua rào bằng chân nhện: rẻ hơn, chậm hơn.' },
          { than: 'xich', tay: null, camBien: null, loiGiai: { chinh: nhieu(LAP(3, 'back()'), ['tr_left()'], LAP(4, 'back()'), ['tr_left()'], LAP(2, 'back()')) }, ghiChu: 'Leo bậc thang bằng xích, đi lùi cho khỏi quay: rẻ nhất, đường dài nhất.' }
        ]
      },
      sao: { o: 12, nhip: 6, re: { gia: 3, o: 14 } },
      loiGiaiKhac: { moTa: 'Cùng cách bắn, ghi chú từng việc', baiLam: { chinh: ['# bắn trúng van', 'jet_back()', '# qua cửa', 'turn_right()', 'forward(4)'] } },
      loiSai: [
        { moTa: 'Không bắn van: xe đâm vào tường cạnh cửa đóng', baiLam: { chinh: ['turn_right()', 'forward(4)'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bắn ra sau thay vì ra trước: van không quay, cửa vẫn đóng', baiLam: { chinh: ['spray_back()', 'wait()', 'turn_right()', 'forward(4)'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Lối nào cũng đi được nếu robot đủ sức; so xem robot nào tới cờ nhanh nhất và robot nào rẻ nhất.', 'Xe quay mặt lên thì van ở ngay phía trước; drone phải ghé ô sạc P trên đường.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

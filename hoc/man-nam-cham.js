/* ============================================================================
   man-nam-cham.js — "Đường học": CHƯƠNG `nam-cham` · NAM CHÂM (10 màn).
   Robot là XE HAI BÁNH (loaiRobot 'banh'; màn 9 là XE OMNI) gắn TAY NAM CHÂM ở mũi xe:
   robot { than: 'hai-banh' | 'omni', tay: 'nam-cham', camBien: [] | [{ ma: 'khoang-cach', o: 'hong' }] (+ { ma: 'mau', o: 'hong' } ở màn 10) }.
   hamGoc có thêm hai lệnh tay (luật đầy đủ ở san-hoc.js, phần NAM CHÂM):
       magnet_on()    bật nam châm          \ chỉ RA LỆNH, wait() cho nhịp trôi (như mọi lệnh bánh, lệnh tay)
       magnet_off()   tắt nam châm, thả vật /
   LUẬT ĐÃ CHỐT:
   - Vật có CHẤT: sắt hay gỗ (mặc định gỗ). Khai bằng lớp `vatChat` (mảng chuỗi cùng cỡ sân, ký tự s = sắt, đặt đúng ô có vật o; màn nhiều sân
     thì mảng song song với `san`, như `vatMau`). Chọn lớp riêng, không thêm ký hiệu mới vào sân, để vật sắt vẫn dùng chung ô đích, màu vật và bộ dò cũ.
   - Nam châm bật, chưa dính vật: ở CUỐI mỗi nhịp, nhìn thẳng ra trước ô 1 rồi ô 2 (tường, mép sân chắn): vật đầu tiên gặp là SẮT thì bị hút về
     ô sát mũi xe rồi DÍNH, đi theo xe. Là GỖ thì không hút, và còn chắn vật sắt đứng sau nó (chẩn đoán thông tin hut-go). Mỗi lần dính một vật.
   - magnet_off() thả vật xuống ô ngay trước mũi xe nếu ô đó trống (không tường, mép sân, bậc thang, vật); bị chặn thì vật vẫn dính (tha-bi-chan).
   - Vật dính lơ lửng ở mũi xe, không chiếm ô; xe đi qua mọi ô xe đi được. Bậc thang S không chắn nam châm (hút xuyên qua được).
   - Vật nằm dưới đất không bị băng chuyền kéo (luật chung của sân); vật nằm trên băng vẫn hút được. Vật đặt ở ô không viết được bằng ký hiệu
     o (vd trên băng) khai ở `vatThem: [{ x, y, chat?, mau? }]` (màn nhiều sân thì mảng song song với san).
   - Mục tiêu 'dua-vat' + vatCan 'sat': chỉ vật SẮT phải nằm trên ô đích; vật gỗ để yên ở đâu cũng được (dùng ở cả 10 màn).
   - CẢM BIẾN TỪ front_metal() (QUYẾT ĐỊNH: thêm, gắn vào cảm biến khoảng cách ở hông; có từ màn 6): True nếu vật đầu tiên trong 2 ô trước mặt là SẮT
     (cùng phép tìm với nam châm), False nếu là gỗ, bị tường chắn hay không có vật. Đọc không tốn nhịp. Màn 6 và 10 còn có front_clear(), màn 10 có color().
   - Nhịp: magnet_on() / magnet_off() có thể gộp vào cùng nhịp với lệnh đi / quay ("magnet_on()  move()" là một nhịp; hút ở cuối nhịp, sau khi đi).
     Lời giải chuẩn của chương viết "magnet_on()  wait()" (một nhịp riêng), như chương tay gắp viết pick() / drop() chưa gộp nhịp: màn nào có lệnh
     nam châm đều khai nhipTheoLoiGiai (BFS gộp <= sao.nhip). Máy kiểm kiem-nam-cham.mjs kiểm chặt hơn: BFS "tách nhịp" (lệnh nam châm đứng một mình
     trong nhịp) PHẢI đúng bằng sao.nhip, nên lời giải chuẩn không có đường tắt.

   Hàm của em MỚI (tên cốt truyện, bị khóa trong kho, xem KhoHam.datTenCoDinh):
     nam-cham.3   fetch() = magnet_on(), wait(), u_turn(), move(), magnet_off(), wait()      (6 ô)
         Một chuyến lấy vật: hút vật phía trước, quay đầu, tiến một ô, thả xuống ô đích sau lưng. Dùng ở 3 (và tạo thói quen "gói chuyến thành hàm").
   Tên không trùng hàm cốt truyện chương trước và không phải hàm gốc.

   Nhiều sân: màn 6 và 10 (san là mảng 3 sân, batDau mảng song song, nhipTheo 'tong'); các màn còn lại một sân. cauTruc ['for', 'if', 'while'].
   canHam: 'tran-khung' — 3: viết thẳng chuyến lấy vật (không dùng fetch) thì tràn khung 10 ô.

   Nối tiếp man-mau.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-mau.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var OMNI = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait'];
  var NC = ['magnet_on', 'magnet_off'];

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  /** Lớp cùng cỡ sân (rong × cao), đặt các ô { 'x,y': ký tự }. */
  function lop(rong, cao, o) {
    var kq = [];
    for (var y = 0; y < cao; y++) {
      var d = '';
      for (var x = 0; x < rong; x++) d += (o[x + ',' + y] || '.');
      kq.push(d);
    }
    return kq;
  }

  // thân các hàm của chương
  var T_FETCH = ['magnet_on()', 'wait()', 'u_turn()', 'move()', 'magnet_off()', 'wait()'];
  function hFetch(than) { return H('fetch', [], than || T_FETCH); }
  // 8: load() của màn: hút vật trước mặt, mang sang phải một ô, QUÊN thả
  var T_LOAD_SAI = ['magnet_on()', 'wait()', 'turn_right()', 'move()'];
  var T_LOAD = T_LOAD_SAI.concat(['magnet_off()', 'wait()']);
  function hLoad(than) { return H('load', [], than || T_LOAD); }

  /**
   * m.cb: 'kc' (front_clear + front_metal, màn 6) | 'kc-mau' (front_clear + front_metal + color, màn 10) | không có.
   * m.omni: true thì xe omni (màn 9). Hai trường này bị bỏ sau khi dùng.
   * Màn nhiều sân (san là mảng sân) tự có nhipTheo 'tong' và batDau song song.
   */
  function man(m) {
    var cb = m.cb, omni = m.omni;
    delete m.cb; delete m.omni;
    m.chuong = 'nam-cham';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = omni ? 'omni' : 'banh';
    var camBien = [];
    if (cb) camBien.push({ ma: 'khoang-cach', o: 'hong' });
    if (cb === 'kc-mau') camBien.push({ ma: 'mau', o: 'hong' });
    m.robot = { than: omni ? 'omni' : 'hai-banh', tay: 'nam-cham', camBien: camBien };
    m.hamGoc = nhieu(omni ? OMNI : BANH, NC, cb ? ['front_clear', 'front_metal'] : [], cb === 'kc-mau' ? ['color'] : []);
    m.mucTieu = 'dua-vat'; m.vatCan = 'sat';
    m.nhipTheoLoiGiai = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: vật sắt cách xe 2 ô phía trước; đích bên phải xe (xe phải rẽ phải rồi tiến một ô để đứng sát đích)
  var SAN_1 = ['.....', '..o..', '.....', '....D', '.....'];
  var CHAT_1 = ['.....', '..s..', '.....', '.....', '.....'];
  var BD_1 = { x: 2, y: 3, huong: 0 };
  // 2: vật gỗ ngay trước mặt chắn vật sắt đứng sau nó
  var SAN_2 = ['.....', '..o..', '..o.D', '.....', '.....'];
  var CHAT_2 = ['.....', '..s..', '.....', '.....', '.....'];
  // 3: ba vật sắt ở hàng trên, ba đích ở hàng dưới; xe đứng giữa
  var SAN_3 = ['.o.o.o.', '.......', '.......', '.......', '.D.D.D.'];
  var CHAT_3 = ['.s.s.s.', '.......', '.......', '.......', '.......'];
  var BD_3 = { x: 1, y: 2, huong: 0 };
  // 4: vật sắt trong ngăn kín sau một ô bậc thang (xe bánh không leo được)
  var SAN_4 = ['#..o..#', '###S###', '#.....#', '#....D#', '#.....#'];
  var CHAT_4 = ['...s...', '.......', '.......', '.......', '.......'];
  var BD_4 = { x: 3, y: 4, huong: 0 };
  // 5: ba vật sắt thẳng hàng trước mặt xe, ba đích bên phải, mỗi đích cạnh một ô của hàng vật
  var SAN_5 = ['..o..', '..oD.', '..oD.', '...D.'];
  var CHAT_5 = ['..s..', '..s..', '..s..', '.....'];
  var BD_5 = { x: 2, y: 3, huong: 0 };
  // 6: hành lang (ô 1–5), đích ở ô phía trên đầu hành lang (1, 0), xe bắt đầu ở ô 2 quay mặt sang phải; ba sân khác nhau chỗ đặt vật gỗ / vật sắt
  var SAN_6 = [
    ['#D#####', '#..o.o#', '#######'],
    ['#D#####', '#..oo.#', '#######'],
    ['#D#####', '#..oo.#', '#######']
  ];
  var CHAT_6 = [
    ['.......', '.....s.', '.......'],
    ['.......', '...s...', '.......'],
    ['.......', '....s..', '.......']
  ];
  var BD_6 = { x: 2, y: 1, huong: 1 };
  // 7: làn băng chuyền hai ô (cột 3, 4) chạy lên cả chiều cao sân; vật sắt nằm trên băng (vatThem); đích bên kia làn, ở hàng trên hàng xe một ô
  var SAN_7 = ['o..^^..', '...^^..', '...^^.D', '...^^..', '...^^..'];
  var CHAT_7 = ['.......', '.......', '.......', '.......', '.......'];
  var THEM_7 = [{ x: 3, y: 3, chat: 'sat' }];
  var BD_7 = { x: 1, y: 3, huong: 1 };
  // 8: hai vật sắt xếp chéo; đích bên phải mỗi vật
  var SAN_8 = ['.....', '..o..', '.o...', '....D', '...D.'];
  var CHAT_8 = ['.....', '..s..', '.s...', '.....', '.....'];
  var BD_8 = { x: 1, y: 4, huong: 0 };
  // 9: omni: hàng trên là ba vật sắt, hàng giữa là ba đích xen kẽ, xe ở hàng dưới quay mặt lên
  var SAN_9 = ['o.o.o.', '.D.D.D', '......'];
  var CHAT_9 = ['s.s.s.', '......', '......'];
  var BD_9 = { x: 0, y: 2, huong: 0 };
  // 10: kho = ba hành lang ngang; đích nằm ngay phía trên một ô vàng; vật gỗ (hay vật sắt) nằm ở nửa phải; có làn băng chuyền
  var SAN_10 = [
    ['##D####', '....oo.', '#######'],
    ['###D###', '.>>..oo', '#######'],
    ['#D#####', '...<<oo', '#######']
  ];
  var MAU_10 = [lop(7, 3, { '2,1': 'y' }), lop(7, 3, { '3,1': 'y' }), lop(7, 3, { '1,1': 'y' })];
  var CHAT_10 = [
    ['.......', '.....s.', '.......'],
    ['.......', '......s', '.......'],
    ['.......', '......s', '.......']
  ];
  var BD_10 = { x: 0, y: 1, huong: 1 };

  /* ------------------------------------------------------------- chương trình dùng lại */

  // 1: hút (2 ô), rẽ phải, tiến một ô, thả
  var CHINH_1 = ['magnet_on()', 'wait()', 'turn_right()', 'move()', 'magnet_off()', 'wait()'];
  // 2: tiến một ô (lên ô vật gỗ), hút vật sắt ngay sau nó, rẽ phải, tiến một ô, thả
  var CHINH_2 = ['move()', 'magnet_on()', 'wait()', 'turn_right()', 'move()', 'magnet_off()', 'wait()'];
  // 3: ba chuyến fetch(); giữa hai chuyến: rẽ trái, đi sang hai cột, rẽ trái, tiến một ô
  var CHINH_3 = nhieu(LAP(2, ['fetch()', 'turn_left()', 'move()', 'move()', 'turn_left()', 'move()']), ['fetch()']);
  var CHINH_3_KHAC = nhieu(LAP(2, ['fetch()', 'turn_left()', 'forward(2)', 'turn_left()', 'move()']), ['fetch()']);
  // 4: hai ô lên, hút qua bậc thang, rẽ phải đi hai ô, rẽ phải, thả
  var CHINH_4 = ['move()', 'move()', 'magnet_on()', 'wait()', 'turn_right()', 'move()', 'move()', 'turn_right()', 'magnet_off()', 'wait()'];
  var CHINH_4_KHAC = ['move()', 'move()', 'magnet_on()', 'wait()', 'turn_right()', 'forward(2)', 'turn_right()', 'magnet_off()', 'wait()'];
  // 5: hút vật gần nhất, rẽ phải thả, rẽ trái tiến một ô; lặp ba lần. Tiến một ô viết thẳng ba lệnh bánh (không dùng move() của em: move() thiếu wait trong kho sẽ trôi sang
  // nhịp hút kế tiếp và vẫn thắng, nên máy kiểm 'sửa move() thành bản lỗi' không bắt được; lời giải khác dùng move())
  var CHINH_5 = LAP(3, ['magnet_on()', 'wait()', 'turn_right()', 'magnet_off()', 'wait()', 'turn_left()', 'left_move()', 'right_move()', 'wait()']);
  var CHINH_5_KHAC = LAP(3, ['magnet_on()', 'wait()', 'turn_right()', 'magnet_off()', 'wait()', 'turn_left()', 'move()']);
  // 6: đi tới khi front_metal(), hút, quay đầu, về tới tường, rẽ phải, thả
  var CHINH_6 = ['while not front_metal():', '    move()', 'magnet_on()', 'wait()', 'u_turn()', 'while front_clear():', '    move()', 'turn_right()', 'magnet_off()', 'wait()'];
  var CHINH_6_KHAC = ['while not front_metal():', '    move()', 'magnet_on()', 'wait()', 'u_turn()', 'go_wall()', 'turn_right()', 'magnet_off()', 'wait()'];
  // 7: tiến một ô, hút, qua làn băng (3 ô: băng đẩy xe lên một hàng), thả
  var CHINH_7 = ['move()', 'magnet_on()', 'wait()', 'for i in range(3):', '    move()', 'magnet_off()', 'wait()'];
  var CHINH_7_KHAC = ['move()', 'magnet_on()', 'wait()', 'move()', 'move()', 'move()', 'magnet_off()', 'wait()'];
  // 8: hai lần load(), giữa hai lần rẽ trái rồi tiến một ô
  var CHINH_8 = LAP(2, ['load()', 'turn_left()', 'move()']);
  var CHINH_8_KHAC = LAP(2, ['load()', 'turn_left()', 'forward(1)']);
  // 9: omni: hút, trượt phải, thả, trượt phải; lặp ba lần
  var CHINH_9 = LAP(3, ['magnet_on()', 'wait()', 'slide_r(1)', 'magnet_off()', 'wait()', 'slide_r(1)']);
  var CHINH_9_KHAC = LAP(3, ['magnet_on()', 'wait()', 'slide_r(1)', 'magnet_off()', 'wait()', 'slide_right()', 'wait()']);
  // 10: tìm vật sắt, hút, quay đầu, về tới ô vàng, rẽ phải, thả
  var CHINH_10 = ['while not front_metal():', '    move()', 'magnet_on()', 'wait()', 'u_turn()', 'while color() != "yellow":', '    move()', 'turn_right()', 'magnet_off()', 'wait()'];
  var CHINH_10_KHAC = ['while not front_metal():', '    forward(1)', 'magnet_on()', 'wait()', 'u_turn()', 'while color() != "yellow":', '    forward(1)', 'turn_right()', 'magnet_off()', 'wait()'];

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Hút vật sắt', hang: 'lam-quen', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Nam châm ở mũi xe: magnet_on() bật nó, magnet_off() tắt nó, và cũng cần wait() cho nhịp trôi. Đang bật, nam châm hút vật sắt trong 2 ô trước mặt về dính vào xe; tắt đi thì vật rơi xuống ô ngay trước mũi xe. Hút vật sắt rồi thả nó xuống ô đích.',
      veMaMau: 'Chương trình có sẵn mới ra lệnh bật nam châm, chưa có wait() nên nam châm chưa chạy. Chạy thử rồi viết tiếp.',
      san: SAN_1, vatChat: CHAT_1,
      batDau: BD_1,
      maMau: { chinh: ['magnet_on()'] },
      sao: { o: 11, nhip: 4 },
      loiGiai: { chinh: CHINH_1.slice() },
      loiGiaiKhac: { moTa: 'Tiến bằng forward(1) thay cho move()', baiLam: { chinh: ['magnet_on()', 'wait()', 'turn_right()', 'forward(1)', 'magnet_off()', 'wait()'] } },
      loiSai: [
        { moTa: 'Chỉ có magnet_on(), quên wait(): lệnh chưa chạy', baiLam: { chinh: ['magnet_on()'] }, phaiCoMa: ['quen-wait', 'chua-dua-vat'] },
        { moTa: 'Rẽ trước khi hút: rẽ xong thì phía trước không còn vật', baiLam: { chinh: ['turn_right()', 'magnet_on()', 'wait()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả ngay sau khi hút: vật rơi lại ngay trước mũi xe, chưa tới đích', baiLam: { chinh: ['magnet_on()', 'wait()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên magnet_off(): vật vẫn dính ở xe', baiLam: { chinh: ['magnet_on()', 'wait()', 'turn_right()', 'move()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả khi chưa tiến sát ô đích: vật rơi cách đích một ô', baiLam: { chinh: ['magnet_on()', 'wait()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'magnet_on() và magnet_off() cùng một nhịp: lệnh sau bị bỏ', baiLam: { chinh: ['magnet_on()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['magnet-goi-lai', 'chua-dua-vat'] }
      ],
      goiY: ['Nam châm hút được vật sắt cách xe tới 2 ô; hút xong, vật dính ở mũi xe và đi theo xe.',
        'magnet_off() thả vật xuống ô ngay trước mũi xe: xe phải đứng sát ô đích và quay mặt về phía nó.']
    }),

    man({
      so: 2, ten: 'Vật gỗ không dính', hang: 'lam-quen', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Nam châm chỉ hút vật sắt. Vật gỗ không bị hút, và còn chắn đường hút của vật sắt đứng sau nó. Đưa vật sắt tới ô đích, vật gỗ để yên cũng được.',
      veMaMau: 'Chương trình có sẵn bật nam châm ngay chỗ xe đang đứng. Chạy thử và xem vật nào nằm ngay trước mặt xe.',
      san: SAN_2, vatChat: CHAT_2,
      batDau: BD_1,
      maMau: { chinh: ['magnet_on()', 'wait()'] },
      sao: { o: 12, nhip: 5 },
      loiGiai: { chinh: CHINH_2.slice() },
      loiGiaiKhac: { moTa: 'Tiến bằng forward(1) thay cho move()', baiLam: { chinh: ['forward(1)', 'magnet_on()', 'wait()', 'turn_right()', 'forward(1)', 'magnet_off()', 'wait()'] } },
      loiSai: [
        { moTa: 'Chưa sửa gì: vật gỗ chắn đường hút, nam châm không dính vật nào', baiLam: { chinh: ['magnet_on()', 'wait()'] }, phaiCoMa: ['hut-go', 'chua-dua-vat'] },
        { moTa: 'Hút từ chỗ cũ rồi vẫn mang đi: vật gỗ chắn nên không có vật nào dính, thả ra cũng trống', baiLam: { chinh: ['magnet_on()', 'wait()', 'turn_right()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['hut-go', 'chua-dua-vat'] },
        { moTa: 'Rẽ phải ngay từ đầu: phía trước không còn vật nào', baiLam: { chinh: ['turn_right()', 'magnet_on()', 'wait()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Tiến lên rồi quên bật nam châm', baiLam: { chinh: ['move()', 'turn_right()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên magnet_off(): vật sắt vẫn dính ở xe', baiLam: { chinh: ['move()', 'magnet_on()', 'wait()', 'turn_right()', 'move()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vật gỗ ngay trước mặt xe chắn đường hút. Xe đi qua được ô có vật, nên hãy đổi chỗ đứng.',
        'Đứng ngay trên ô vật gỗ thì vật sắt chỉ còn cách xe một ô, và không còn gì chắn.']
    }),

    man({
      so: 3, ten: 'Hàm fetch()', hang: 'lam-quen', canHam: 'tran-khung', hamCuaEmCan: ['move', 'turn_left', 'u_turn'], taoHam: ['fetch'],
      deBai: 'Mỗi chuyến lấy vật gồm: hút vật phía trước, quay đầu, tiến một ô, rồi thả xuống ô đích sau lưng. Tạo hàm fetch() làm trọn chuyến đó, rồi dùng nó để đưa cả ba vật sắt về ba ô đích.',
      veMaMau: 'Chương trình có sẵn làm trọn một chuyến lấy vật ở cột đầu. Chạy thử, gói chuyến đó thành hàm fetch() rồi viết tiếp cho hai cột còn lại.',
      san: SAN_3, vatChat: CHAT_3,
      batDau: BD_3,
      maMau: { chinh: T_FETCH.slice() },
      sao: { o: 23, nhip: 25 },
      loiGiai: { chinh: CHINH_3.slice(), hamCuaEmMoi: [hFetch()] },
      loiGiaiKhac: { moTa: 'Đi sang hai cột bằng forward(2)', baiLam: { chinh: CHINH_3_KHAC.slice() }, hamCuaEmMoi: [hFetch()] },
      loiSai: [
        { moTa: 'Gọi fetch() mà chưa tạo hàm', baiLam: { chinh: CHINH_3.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'fetch() quên magnet_off(): vật vẫn dính, các chuyến sau không lấy thêm được', baiLam: { chinh: CHINH_3.slice() }, hamCuaEmMoi: [hFetch(['magnet_on()', 'wait()', 'u_turn()', 'move()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'fetch() quên u_turn(): xe tiến về phía vật, thả sai chỗ', baiLam: { chinh: CHINH_3.slice() }, hamCuaEmMoi: [hFetch(['magnet_on()', 'wait()', 'move()', 'magnet_off()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ gọi fetch() một lần', baiLam: { chinh: ['fetch()'] }, hamCuaEmMoi: [hFetch()], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không dùng hàm, viết thẳng cả ba chuyến trong vòng for: tràn khung 10 ô', baiLam: { chinh: LAP(3, nhieu(T_FETCH, ['turn_left()', 'move()', 'move()', 'turn_left()', 'move()'])) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Cả chuyến lấy vật lặp lại y hệt ở mỗi cột, nên hãy gói nó vào một hàm có tên fetch.',
        'Giữa hai chuyến xe phải sang cột kế bên: rẽ trái, đi hai ô, rẽ trái, tiến một ô cho đứng đúng chỗ.']
    }),

    /* ------------------------------------------------------------- hàng 2: luyện */
    man({
      so: 4, ten: 'Hút qua bậc thang', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right', 'forward'],
      deBai: 'Vật sắt nằm trong ngăn kín, sau một ô bậc thang (S) mà xe bánh không leo được. Nam châm vẫn hút xuyên qua bậc thang, miễn là vật cách xe không quá 2 ô. Đưa vật sắt tới ô đích.',
      veMaMau: 'Chương trình có sẵn bật nam châm ở chỗ xe đứng, còn xa vật. Chạy thử, xem vật cách xe bao nhiêu ô rồi viết tiếp.',
      san: SAN_4, vatChat: CHAT_4,
      batDau: BD_4,
      maMau: { chinh: ['magnet_on()', 'wait()'] },
      sao: { o: 15, nhip: 8 },
      loiGiai: { chinh: CHINH_4.slice() },
      loiGiaiKhac: { moTa: 'Đoạn đi sang phải bằng forward(2)', baiLam: { chinh: CHINH_4_KHAC.slice() } },
      loiSai: [
        { moTa: 'Hút từ xa quá: vật cách xe 3 ô, ngoài tầm nam châm', baiLam: { chinh: ['move()', 'magnet_on()', 'wait()', 'turn_right()', 'move()', 'move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Cho xe leo bậc thang: xe bánh đâm vào bậc thang', baiLam: { chinh: ['move()', 'move()', 'move()', 'magnet_on()', 'wait()'] }, phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Thả ngay khi hút xong: ô trước mũi xe là bậc thang, không thả được', baiLam: { chinh: ['move()', 'move()', 'magnet_on()', 'wait()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] },
        { moTa: 'Đi quá xa về bên phải: trước mũi xe là tường, không thả được', baiLam: { chinh: ['move()', 'move()', 'magnet_on()', 'wait()', 'turn_right()', 'move()', 'move()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['dam-tuong', 'tha-bi-chan'] },
        { moTa: 'Rẽ phải sớm một ô: thả xuống ô trống chưa phải ô đích', baiLam: { chinh: ['move()', 'move()', 'magnet_on()', 'wait()', 'turn_right()', 'move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Xe đứng sát bậc thang thì vật nằm đúng 2 ô phía trước, trong tầm nam châm.',
        'Hút xong, rẽ phải đi hai ô, rồi rẽ phải lần nữa cho mũi xe quay xuống ô đích.']
    }),

    man({
      so: 5, ten: 'Hút theo thứ tự', hang: 'luyen', hamCuaEmCan: ['turn_right', 'turn_left'],
      deBai: 'Ba vật sắt xếp thẳng hàng trước mặt xe. Nam châm luôn hút vật GẦN NHẤT trước, và mỗi lần chỉ dính một vật. Đưa cả ba vật tới ba ô đích ở bên phải.',
      veMaMau: 'Chương trình có sẵn mới hút và thả một vật. Chạy thử, rồi lặp lại cho hai vật còn lại.',
      san: SAN_5, vatChat: CHAT_5,
      batDau: BD_5,
      maMau: { chinh: ['magnet_on()', 'wait()', 'turn_right()', 'magnet_off()', 'wait()'] },
      sao: { o: 14, nhip: 13 },
      loiGiai: { chinh: CHINH_5.slice() },
      loiGiaiKhac: { moTa: 'Tiến lên một ô bằng move() của em', baiLam: { chinh: CHINH_5_KHAC.slice() } },
      loiSai: [
        { moTa: 'Quên tiến lên sau mỗi vật: lần thả thứ hai trúng ô đích đã có vật', baiLam: { chinh: LAP(3, ['magnet_on()', 'wait()', 'turn_right()', 'magnet_off()', 'wait()', 'turn_left()']) }, phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] },
        { moTa: 'Chỉ lặp hai lần: còn một vật chưa tới đích', baiLam: { chinh: LAP(2, ['magnet_on()', 'wait()', 'turn_right()', 'magnet_off()', 'wait()', 'turn_left()', 'move()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Rẽ trái rồi tiến mà không rẽ lại: xe đi lệch hàng vật', baiLam: { chinh: LAP(3, ['magnet_on()', 'wait()', 'turn_right()', 'magnet_off()', 'wait()', 'move()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên magnet_off(): vật đầu dính mãi, xe không hút thêm được', baiLam: { chinh: LAP(3, ['magnet_on()', 'wait()', 'turn_right()', 'turn_left()', 'move()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Bật và tắt nam châm cùng một nhịp: lệnh sau bị bỏ', baiLam: { chinh: LAP(3, ['magnet_on()', 'magnet_off()', 'wait()', 'turn_right()', 'turn_left()', 'move()']) }, phaiCoMa: ['magnet-goi-lai', 'chua-dua-vat'] }
      ],
      goiY: ['Mỗi vòng làm đủ một vật: hút, rẽ phải, thả, rẽ trái, tiến lên một ô cho vật kế tiếp tới sát xe.',
        'Lặp lại đúng ba lần; vật thứ ba thả xong là thắng ngay.']
    }),

    man({
      so: 6, ten: 'Sắt hay gỗ?', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right', 'u_turn', 'go_wall'], cb: 'kc',
      deBai: 'Mỗi hành lang có một vật sắt lẫn một vật gỗ, đặt khác nhau ở ba sân. Cảm biến từ front_metal() trả True khi vật đầu tiên trong 2 ô trước mặt là sắt, tức là bật nam châm lúc đó sẽ hút được. Mang vật sắt về ô đích ở phía trên đầu hành lang, ở cả ba sân.',
      veMaMau: 'Chương trình có sẵn mới đi tới khi front_metal() báo vật sắt đã trong tầm, chưa hút. Chạy thử, xem xe dừng ở đâu ở từng sân rồi viết tiếp.',
      san: SAN_6, vatChat: CHAT_6,
      batDau: BD_6,
      maMau: { chinh: ['while not front_metal():', '    move()'] },
      sao: { o: 17, nhip: 22 },
      loiGiai: { chinh: CHINH_6.slice() },
      loiGiaiKhac: { moTa: 'Quay về bằng go_wall() của em', baiLam: { chinh: CHINH_6_KHAC.slice() } },
      loiSai: [
        { moTa: 'Viết cứng số bước của sân đầu: các sân khác vật nằm chỗ khác', baiLam: { chinh: ['move()', 'move()', 'magnet_on()', 'wait()', 'u_turn()', 'move()', 'move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đảo điều kiện: while front_metal() chỉ chạy khi vật sắt đã trong tầm', baiLam: { chinh: ['while front_metal():', '    move()', 'magnet_on()', 'wait()', 'u_turn()', 'while front_clear():', '    move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Hút ngay từ đầu, không dò: vật gỗ đứng trước nên không dính gì', baiLam: { chinh: ['magnet_on()', 'wait()', 'u_turn()', 'while front_clear():', '    move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['hut-go', 'chua-dua-vat'] },
        { moTa: 'Quên quay đầu sau khi hút: xe lại tiến về phía cuối hành lang', baiLam: { chinh: ['while not front_metal():', '    move()', 'magnet_on()', 'wait()', 'while front_clear():', '    move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không rẽ phải trước khi thả: ô trước mũi xe là tường', baiLam: { chinh: ['while not front_metal():', '    move()', 'magnet_on()', 'wait()', 'u_turn()', 'while front_clear():', '    move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] },
        { moTa: 'Dùng nhầm front_clear() thay cho front_metal(): xe chạy tới tường rồi mới hút, vật đã nằm sau lưng', baiLam: { chinh: ['while front_clear():', '    move()', 'magnet_on()', 'wait()', 'u_turn()', 'while front_clear():', '    move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vật gỗ đứng trước cũng làm front_metal() trả False, nên xe cứ tiến từng ô cho tới khi vật sắt đầu tiên vào tầm.',
        'Về bằng vòng while front_clear(): move() cho tới tường, rồi rẽ phải để mũi xe quay vào ô đích.']
    }),

    /* ------------------------------------------------------------- hàng 3: biến thể */
    man({
      so: 7, ten: 'Qua làn băng', hang: 'bien-the', hamCuaEmCan: ['move'],
      deBai: 'Vật sắt nằm trên làn băng chuyền hai ô, nam châm hút được cả vật nằm trên băng. Xe đứng trên băng đủ 2 nhịp liên tiếp thì bị đẩy một ô, kể cả khi đang đi từ ô băng này sang ô băng kia. Mang vật qua làn băng tới ô đích.',
      veMaMau: 'Chương trình có sẵn đã hút được vật và đi qua làn băng, nhưng thả không trúng đích. Chạy thử, xem băng đẩy xe đi đâu rồi sửa.',
      san: SAN_7, vatChat: CHAT_7, vatThem: THEM_7,
      batDau: BD_7,
      maMau: { chinh: ['move()', 'magnet_on()', 'wait()', 'move()', 'move()', 'move()', 'move()', 'magnet_off()', 'wait()'] },
      sao: { o: 10, nhip: 6 },
      loiGiai: { chinh: CHINH_7.slice() },
      loiGiaiKhac: { moTa: 'Ba lần move() viết thẳng', baiLam: { chinh: CHINH_7_KHAC.slice() } },
      loiSai: [
        { moTa: 'Chưa sửa gì: đi bốn ô, băng đẩy xe lên hàng trên nên xe đứng ngay trên ô đích và thả ra ngoài sân', baiLam: { chinh: ['move()', 'magnet_on()', 'wait()', 'move()', 'move()', 'move()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] },
        { moTa: 'Hút khi đang đứng trên băng: băng đẩy xe đi trước khi nam châm hút xong', baiLam: { chinh: ['move()', 'move()', 'magnet_on()', 'wait()', 'move()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đi ít một ô: thả xuống ô trống chưa phải ô đích', baiLam: { chinh: ['move()', 'magnet_on()', 'wait()', 'move()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên magnet_off(): vật vẫn dính ở xe', baiLam: { chinh: ['move()', 'magnet_on()', 'wait()', 'move()', 'move()', 'move()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không bật nam châm: xe đi qua làn băng tay không', baiLam: { chinh: ['move()', 'move()', 'move()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Làn băng hai ô: nhịp thứ hai ở trên băng làm xe bị đẩy lên một hàng, nên xe sang bên kia ở hàng trên.',
        'Thử chạy và xem xe nằm ở ô nào sau mỗi nhịp; xe chỉ cần đi một ô ít hơn.']
    }),

    man({
      so: 8, ten: 'Sửa hàm load()', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'forward'],
      deBai: 'Chương trình dùng hàm load() của màn: hút vật trước mặt rồi mang sang phải một ô. Nhưng vật không rơi xuống đích. Sửa hàm load để cả hai vật sắt nằm trên hai ô đích.',
      veMaMau: 'Chạy thử: sau mỗi lần load() vật vẫn dính ở xe. Xem hàm load còn thiếu lệnh nào.',
      san: SAN_8, vatChat: CHAT_8,
      batDau: BD_8,
      maMau: { chinh: CHINH_8.slice(), hamCuaMan: [hLoad(T_LOAD_SAI)] },
      sao: { o: 17, nhip: 10 },
      loiGiai: { chinh: CHINH_8.slice(), hamCuaMan: [hLoad()] },
      loiGiaiKhac: { moTa: 'Sửa load như vậy, tiến bằng forward(1) trong chương trình', baiLam: { chinh: CHINH_8_KHAC.slice(), hamCuaMan: [hLoad()] } },
      loiSai: [
        { moTa: 'Chưa sửa gì: vật dính mãi ở xe, lần load thứ hai không hút thêm được', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hLoad(T_LOAD_SAI)] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thêm magnet_off() nhưng đặt trước khi rẽ: vật rơi lại chỗ cũ', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hLoad(['magnet_on()', 'wait()', 'magnet_off()', 'wait()', 'turn_right()', 'move()'])] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thêm magnet_on() thay cho magnet_off(): nam châm vẫn giữ vật', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hLoad(T_LOAD_SAI.concat(['magnet_on()', 'wait()']))] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Bật và tắt nam châm cùng một nhịp trong load(): lệnh sau bị bỏ', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hLoad(T_LOAD_SAI.concat(['magnet_on()', 'magnet_off()', 'wait()']))] }, phaiCoMa: ['magnet-goi-lai', 'chua-dua-vat'] },
        { moTa: 'Chỉ gọi load() một lần', baiLam: { chinh: ['load()'], hamCuaMan: [hLoad()] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Sau khi load() xong, vật vẫn dính ở nam châm. Lệnh nào làm vật rơi xuống ô ngay trước mũi xe?',
        'Thêm lệnh vào CUỐI hàm load, khi xe đã quay sang phải và đứng sát ô đích.']
    }),

    man({
      so: 9, ten: 'Omni và nam châm', hang: 'bien-the', hamCuaEmCan: ['slide_r'], omni: true,
      deBai: 'Xe omni trượt ngang mà không quay mặt, nên nam châm luôn hướng lên trên. Hút ba vật sắt ở hàng trên, thả mỗi vật xuống ô đích nằm giữa hai cột vật.',
      veMaMau: 'Chương trình có sẵn mới hút và thả vật đầu tiên rồi trượt sang phải. Chạy thử rồi lặp lại cho hai vật còn lại.',
      san: SAN_9, vatChat: CHAT_9,
      batDau: BD_9,
      maMau: { chinh: ['magnet_on()', 'wait()', 'slide_r(1)', 'magnet_off()', 'wait()', 'slide_r(1)'] },
      sao: { o: 10, nhip: 11 },
      loiGiai: { chinh: CHINH_9.slice() },
      loiGiaiKhac: { moTa: 'Một lần trượt viết thẳng slide_right() và wait()', baiLam: { chinh: CHINH_9_KHAC.slice() } },
      loiSai: [
        { moTa: 'Chỉ lặp hai lần: vật cuối chưa tới đích', baiLam: { chinh: LAP(2, ['magnet_on()', 'wait()', 'slide_r(1)', 'magnet_off()', 'wait()', 'slide_r(1)']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trượt sang trái: xe ra khỏi sân', baiLam: { chinh: LAP(3, ['magnet_on()', 'wait()', 'slide_left()', 'wait()', 'magnet_off()', 'wait()', 'slide_left()', 'wait()']) }, phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Quên magnet_off(): vật đầu dính mãi nên xe không hút thêm được', baiLam: { chinh: LAP(3, ['magnet_on()', 'wait()', 'slide_r(2)']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trượt hai ô sau khi thả: xe bỏ qua cột vật kế tiếp', baiLam: { chinh: LAP(3, ['magnet_on()', 'wait()', 'slide_r(1)', 'magnet_off()', 'wait()', 'slide_r(2)']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả ngay tại cột vật: vật rơi lại ô ngay trước mũi xe, không phải ô đích', baiLam: { chinh: LAP(3, ['magnet_on()', 'wait()', 'magnet_off()', 'wait()', 'slide_r(2)']) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Xe không quay nên nam châm luôn nhìn lên: chỉ cần trượt ngang cho tới cột có vật, hút, rồi trượt tới cột có ô đích để thả.',
        'Vật và đích xen kẽ từng cột: mỗi vật cần đúng một lần trượt phải để tới đích, và một lần nữa để tới vật kế.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Kho sắt và gỗ', hang: 'trum', hamCuaEmCan: ['move', 'turn_right', 'u_turn', 'forward'], cb: 'kc-mau',
      deBai: 'Ba hành lang trong kho, mỗi nơi có một vật sắt lẫn vật gỗ, có khi cả làn băng chuyền. Ô đích nằm ngay phía trên một ô vàng ("yellow"). Tìm vật sắt bằng front_metal(), hút, rồi quay về ô vàng và thả vật vào đích.',
      veMaMau: 'Chương trình có sẵn mới đi tới khi front_metal() báo có vật sắt trong tầm. Chạy thử rồi viết tiếp.',
      san: SAN_10, mau: MAU_10, vatChat: CHAT_10,
      batDau: BD_10,
      maMau: { chinh: ['while not front_metal():', '    move()'] },
      sao: { o: 17, nhip: 36 },
      huyHieu: { ma: 'nam-cham', ten: 'Huy hiệu Nam châm' },
      loiGiai: { chinh: CHINH_10.slice() },
      loiGiaiKhac: { moTa: 'Mỗi bước tiến dùng forward(1) thay cho move()', baiLam: { chinh: CHINH_10_KHAC.slice() } },
      loiSai: [
        { moTa: 'Viết cứng số bước theo sân đầu: các sân khác vật và ô vàng nằm chỗ khác', baiLam: { chinh: ['forward(4)', 'magnet_on()', 'wait()', 'u_turn()', 'forward(2)', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Hút ngay từ đầu, không dò: chưa có vật nào trong tầm, xe quay đầu rồi chạy mãi về phía tường', baiLam: { chinh: ['magnet_on()', 'wait()', 'u_turn()', 'while color() != "yellow":', '    move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Viết hoa "Yellow": không khớp màu nào nên xe không dừng ở ô vàng', baiLam: { chinh: ['while not front_metal():', '    move()', 'magnet_on()', 'wait()', 'u_turn()', 'while color() != "Yellow":', '    move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['ten-mau-sai'] },
        { moTa: 'Quên quay đầu sau khi hút: xe tiến tiếp về phía cuối hành lang', baiLam: { chinh: ['while not front_metal():', '    move()', 'magnet_on()', 'wait()', 'while color() != "yellow":', '    move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Quên rẽ phải ở ô vàng: ô trước mũi xe không phải ô đích', baiLam: { chinh: ['while not front_metal():', '    move()', 'magnet_on()', 'wait()', 'u_turn()', 'while color() != "yellow":', '    move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đảo điều kiện: while front_metal() không chạy lần nào khi chưa thấy vật sắt, nên không bao giờ hút được', baiLam: { chinh: ['while front_metal():', '    move()', 'magnet_on()', 'wait()', 'u_turn()', 'while color() != "yellow":', '    move()', 'turn_right()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Dò vật sắt bằng while not front_metal(): move(); rồi hút, quay đầu, và quay về bằng while color() != "yellow": move().',
        'Ở ô vàng, rẽ phải thì mũi xe quay đúng vào ô đích phía trên; rồi mới thả.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

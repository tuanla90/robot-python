/* ============================================================================
   man-doi-sung-hoi.js — "Học lập trình": GÓI ĐỘI SÚNG HƠI VÀ OMNI (20 màn, hai chương), đứng ngay sau gói Súng hơi (chương che-sung-hoi).
   Kế hoạch: hoc/KE-HOACH-PHOI-HOP.md (§3, §3b, §4, §8). Kỹ năng phối hợp mới: K5 MỞ ĐƯỜNG CHO ĐỒNG ĐỘI.
   R1 là xe hai bánh gắn SÚNG HƠI (shoot / shoot_back: bóng trúng nút N đổi cửa C / c và bật tắt băng chuyền; cú giật đẩy xe, ô giật vào có thùng nặng
   thì thùng trượt đi); một số màn R1 có thêm cảm biến khoảng cách. R2 là xe BÁNH OMNI (trượt ngang slide_left / slide_right, bị băng đẩy mạnh), luôn có
   cảm biến khoảng cách nên chờ được cửa mở bằng `while not front_clear(): wait()`; màn chở hộp thì có thêm tay kẹp. Mỗi robot một chương trình, nhịp chung;
   đồng đội là vật cản (chặn bánh, chặn cú giật, chặn bóng, chặn thùng đang trượt). Cờ có chủ (doi[i].co): robot nào tới đúng cờ của mình.

   Chương 1 `doi-sung-hoi` (lời giải chuẩn; khóa = robot có chương trình cố định, chỉ đọc):
     1  Băng ngược chiều      toi-co     hai làn riêng: omni đã có chương trình; em bắn nút tắt băng rồi lùi về cờ
     2  Dọn thùng khỏi lối    toi-co     R1 khóa: giật lùi đẩy thùng xuống hốc; em đưa omni trượt qua lối vừa trống
     3  Mở cửa cho bạn        toi-co     mỗi robot đã có nửa chương trình: R1 quay, bắn nút (giật về cờ); R2 chờ cửa bằng cảm biến rồi qua
     4  Tắt băng cho bạn      toi-co     R1 chạy tới chỗ ngắm rồi bắn; omni cứ thử đi ngược băng (go_wall) tới khi băng tắt
     5  Chặn thùng giúp bạn   day-thung  omni đứng chắn dưới ô đích để thùng trượt dừng đúng chỗ; súng không có cảm biến nên phải chờ đủ nhịp
     6  Bạn tới thì bắn       toi-co     R1 khóa có cảm biến: chờ thấy omni trước mặt mới quay sang bắn nút; omni tới đúng chỗ rồi chờ cửa
     7  Canh cửa theo chu kỳ  toi-co     R1 khóa tựa lưng vào tường bắn theo chu kỳ (cửa mở, đóng, mở); omni viết nhầm `while front_clear()`
     8  Sửa giờ bắn           toi-co     R2 khóa đi vào khoang giữa hai cửa (một nút: cửa mở đóng lại, cửa đóng mở ra); R1 bắn sớm thì omni kẹt ngoài
     9  Bốn cửa bốn nút       toi-co     mỗi nút một cửa (cfg.noi); viết thẳng tràn khung, hai robot cùng lặp
     10 Ca mở đường           toi-co     trùm ba sân: nút bên trái hay bên phải, cửa xa gần, sân ba là băng chuyền thay cửa; một chương trình mỗi robot

   Chương 2 `che-doi-sung-hoi` (chế lệnh phối hợp). Hàm của em MỚI (tên cốt truyện, vào kho):
     1 wait_gate()   = while not front_clear(): wait()                      omni chờ cửa trước mặt mở                       (R2 khóa gọi hàm; em viết R1)
     2 fire_clear()  = while not front_clear(): wait(); shoot(); wait()     xe súng chờ đồng đội ra khỏi mũi rồi mới bắn   (R1 khóa gọi hàm; em viết R2)
     3 pass_gate()   = wait_gate(); forward(2)                              qua cửa (hàm gọi hàm), omni kẹp chở hộp        (R1 khóa)
     5 catch_crate() = while front_clear(): wait()                          chờ tới khi CÓ thùng trước mặt (ngược wait_gate)
     6 open_step()   = kick_right(); forward(2)                             robot khóa gọi hàm em chế: bắn nút bên trái rồi tới nút kế
     4 cả hai robot cùng gọi wait_gate() (đồng đội trước mặt cũng là "chưa trống") · 5 đỡ ba thùng: hai robot cùng lặp
   HÀM CỦA MÀN (không vào kho; maMau.hamCuaMan là bản hỏng):
     7 open_gate() bắn hai phát nên cửa mở rồi đóng (R1 khóa) · 8 open_back() bắn nhầm nòng trước (R1 khóa, em viết R2)
     9 make_way() (R2 khóa) ra khỏi hốc quá sớm: thiếu bước chờ xe súng tới ngang hốc; cờ có chủ, hai robot đổi phía
     10 trùm ba sân: một, hai, ba cửa (mỗi nút một cửa, cfg.noi theo sân); xe súng hỏi left_clear() ở từng ô, omni bốn lần pass_gate()

   Tệp chỉ khai báo (ManHoc.chuongThem); lo-trinh-hoc.js chèn hai chương ngay sau che-sung-hoi. Máy kiểm riêng: hoc/kiem-doi-sung-hoi.mjs.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-sung-hoi';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {
    'doi-sung-hoi.1': { o: 17, nhip: 6 },
    'doi-sung-hoi.2': { o: 20, nhip: 8 },
    'doi-sung-hoi.3': { o: 13, nhip: 7 },
    'doi-sung-hoi.4': { o: 17, nhip: 9 },
    'doi-sung-hoi.5': { o: 16, nhip: 5 },
    'doi-sung-hoi.6': { o: 19, nhip: 7 },
    'doi-sung-hoi.7': { o: 26, nhip: 11 },
    'doi-sung-hoi.8': { o: 13, nhip: 7 },
    'doi-sung-hoi.9': { o: 21, nhip: 20 },
    'doi-sung-hoi.10': { o: 20, nhip: 23 },
    'che-doi-sung-hoi.1': { o: 16, nhip: 8 },
    'che-doi-sung-hoi.2': { o: 18, nhip: 4 },
    'che-doi-sung-hoi.3': { o: 29, nhip: 8 },
    'che-doi-sung-hoi.4': { o: 21, nhip: 9 },
    'che-doi-sung-hoi.5': { o: 24, nhip: 13 },
    'che-doi-sung-hoi.6': { o: 23, nhip: 14 },
    'che-doi-sung-hoi.7': { o: 25, nhip: 9 },
    'che-doi-sung-hoi.8': { o: 19, nhip: 8 },
    'che-doi-sung-hoi.9': { o: 25, nhip: 12 },
    'che-doi-sung-hoi.10': { o: 23, nhip: 42 }
  };
  // @sao-cuoi

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var CB = [{ ma: 'khoang-cach', o: 'hong' }];
  var SUNG = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'hoi', camBien: [] }, hamGoc: BANH.concat(['shoot', 'shoot_back']) };
  var SUNG_CB = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'hoi', camBien: CB }, hamGoc: BANH.concat(['shoot', 'shoot_back'], BA_HUONG) };
  var OMNI = { loaiRobot: 'omni', robot: { than: 'omni', tay: null, camBien: CB }, hamGoc: BANH.concat(['slide_left', 'slide_right'], BA_HUONG) };
  var OMNI_KEP = { loaiRobot: 'omni', robot: { than: 'omni', tay: 'kep', camBien: CB }, hamGoc: BANH.concat(['slide_left', 'slide_right'], TAY, BA_HUONG) };

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Thụt các dòng vào một mức (thân vòng lặp). */
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  /** Bài làm hai robot. */
  function B(c1, c2, hamCuaMan) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: sao(hamCuaMan || []) }; }
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  var CHO_CUA = ['while not front_clear():', '    wait()'];                    // chờ tới khi ô trước mặt trống (cửa mở)

  /** m.bd: [batDau R1, batDau R2] (trùm: mỗi phần là mảng ba sân); m.r: [SUNG | SUNG_CB, OMNI | OMNI_KEP]; m.co: [cờ R1, cờ R2]; m.khoa: số thứ tự robot khóa (0 / 1). */
  function man(m) {
    var bd = m.bd, r = m.r || [SUNG, OMNI], co = m.co, khoa = m.khoa;
    delete m.bd; delete m.r; delete m.co; delete m.khoa;
    m.chuong = m.chuong || CHUONG;                                         // chương 2 khai chuong: 'che-' + CHUONG
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'toi-co';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    m.doi = r.map(function (x, i) {
      var d = Object.assign({ batDau: bd[i] }, sao(x));
      if (co && co[i]) d.co = sao(co[i]);
      if (khoa === i) d.coDinh = true;
      return d;
    });
    // Cấp ngoài là của R1 để mã đọc màn một robot không vỡ.
    m.batDau = bd[0]; m.loaiRobot = r[0].loaiRobot; m.robot = sao(r[0].robot); m.hamGoc = r[0].hamGoc.slice();
    m.taoHam = m.taoHam || []; m.loiSai = [];
    m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    m.sao = SAO[m.chuong + '.' + m.so] || { o: 1, nhip: 1 };
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------- chương trình dùng lại (lời giải chuẩn) */

  var L1 = [['shoot()', 'wait()', 'for i in range(4):', '    back()'], ['slide_l(4)', 'forward(2)']];
  var L2 = [['shoot()', 'wait()', 'turn_right()', 'forward(2)'], ['slide_r(6)', 'for i in range(2):', '    back()']];
  var L3 = [['turn_left()', 'shoot()', 'wait()'], nhieu(CHO_CUA, ['forward(5)'])];
  var L4 = [['turn_left()', 'forward(3)', 'turn_right()', 'shoot()', 'wait()'], ['go_wall()']];
  var L5 = [['forward(2)', 'turn_left()', 'wait()', 'shoot()', 'wait()'], ['slide_l(4)']];
  var L6 = [['while front_clear():', '    wait()', 'turn_right()', 'shoot()', 'wait()'], nhieu(['slide_r(3)'], CHO_CUA, ['forward(2)'])];
  var L7 = [['for i in range(3):', '    shoot()', '    wait()', '    wait()', '    wait()', 'turn_right()', 'move()'],
    nhieu(['for i in range(3):', '    back()', 'slide_r(3)'], CHO_CUA, ['forward(3)'])];
  var L8 = [['while left_clear():', '    wait()', 'shoot()', 'wait()'], nhieu(['forward(4)'], CHO_CUA, ['forward(3)'])];
  var L9 = [['for i in range(4):', '    move()', '    kick_right()', '    move()'], nhieu(['for i in range(4):'], thut(CHO_CUA), ['    forward(2)'])];
  var L10 = [['go_wall()', 'if left_clear():', '    turn_right()', 'else:', '    turn_left()', 'shoot()', 'wait()'], nhieu(['go_wall()'], CHO_CUA, ['go_wall()'])];

  var DS = [
    man({
      so: 1, ten: 'Băng ngược chiều',
      deBai: 'Hai robot ở hai làn riêng. Omni đã có chương trình trượt tới cờ. Làn của xe súng là băng chuyền chạy về phía nút N, đẩy xe xa cờ. Bắn trúng nút thì băng tắt: cho xe súng tới cờ của nó.',
      veMaMau: 'Chạy thử: omni tới cờ, xe súng đứng yên. Viết chương trình R1.',
      san: ['#########', '#N<<<<<F#', '#########', '#.....###', '#####.###', '#####F###', '#########'],
      bd: [{ x: 2, y: 1, huong: 3 }, { x: 1, y: 3, huong: 2 }], co: [[{ x: 7, y: 1 }], [{ x: 5, y: 5 }]],
      maMau: B([], L1[1]), loiGiai: B(L1[0], L1[1]),
      hamCuaEmCan: ['back', 'slide_l', 'forward'],
      goiY: ['Xe đứng trên băng đang chạy hai nhịp liền là bị đẩy lùi một ô. Bắn nút trước để tắt băng.', 'shoot() làm xe giật lùi một ô về phía cờ; sau đó back() thêm bốn lần.']
    }),
    man({
      so: 2, ten: 'Dọn thùng khỏi lối', khoa: 0,
      deBai: 'Thùng nặng chắn lối của omni, omni không đẩy được. Xe súng đã có chương trình cố định: bắn lên tường để cú giật đẩy thùng xuống hốc, rồi về cờ. Viết chương trình cho omni đi qua lối vừa trống tới cờ của nó.',
      veMaMau: 'Chương trình R1 bị khóa, bấm vào thẻ R1 để đọc. Viết chương trình R2.',
      san: ['#########', '####..F##', '#...H...#', '####.##.#', '#######F#', '#########'],
      bd: [{ x: 4, y: 1, huong: 0 }, { x: 1, y: 2, huong: 0 }], co: [[{ x: 6, y: 1 }], [{ x: 7, y: 4 }]],
      maMau: B(L2[0], []), loiGiai: B(L2[0], L2[1]),
      hamCuaEmCan: ['turn_right', 'forward', 'slide_r', 'back'],
      goiY: ['Omni quay mặt lên: slide_right() trượt sang phải mà không cần quay.', 'Tới mép phải thì back() để đi xuống mà vẫn quay mặt lên.']
    }),
    man({
      so: 3, ten: 'Mở cửa cho bạn',
      deBai: 'Cửa C chắn đường omni. Xe súng quay sang trái, bắn trúng nút N thì cửa mở, và cú giật đưa xe lùi đúng vào cờ của nó. Omni chờ tới khi trước mặt trống rồi mới đi tiếp.',
      veMaMau: 'Mỗi robot đã có nửa chương trình. Viết tiếp cho cả hai.',
      san: ['#########', '##.C...F#', '#########', 'N...F####', '#########'],
      bd: [{ x: 3, y: 3, huong: 0 }, { x: 2, y: 1, huong: 1 }], co: [[{ x: 4, y: 3 }], [{ x: 7, y: 1 }]],
      maMau: B(['turn_left()'], CHO_CUA), loiGiai: B(L3[0], L3[1]),
      hamCuaEmCan: ['turn_left', 'forward'],
      goiY: ['Cửa đóng thì front_clear() trả False, nên vòng while giữ omni đứng chờ.', 'Cửa đổi ở cuối nhịp bắn; nhịp sau omni mới đi qua được.']
    }),
    man({
      so: 4, ten: 'Tắt băng cho bạn',
      deBai: 'Cờ của omni ở đầu một dải băng chuyền chạy xuống. Omni đi ngược băng thì cứ bị đẩy về chỗ cũ. Xe súng chạy tới dưới nút N, bắn để tắt băng (cú giật đưa xe về cờ của nó). Omni cứ thử đi lên, băng tắt là lên được.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: ['#N#######', '#.....#F#', '#.....#v#', '#.....#v#', '#F#...#v#', '#######.#', '#########'],
      bd: [{ x: 4, y: 3, huong: 0 }, { x: 7, y: 5, huong: 0 }], co: [[{ x: 1, y: 4 }], [{ x: 7, y: 1 }]],
      maMau: B([], []), loiGiai: B(L4[0], L4[1]),
      hamCuaEmCan: ['turn_left', 'turn_right', 'forward', 'go_wall'],
      goiY: ['Bóng bay thẳng: xe phải đứng ngay dưới nút, quay mặt lên rồi mới bắn.', 'Băng đang chạy thì front_clear() vẫn là True: go_wall() cứ thử đi mãi, băng tắt là omni lên tới cờ.']
    }),
    man({
      so: 5, ten: 'Chặn thùng giúp bạn', mucTieu: 'day-thung',
      deBai: 'Phải đưa thùng nặng vào ô đích. Cú giật đẩy thùng trượt xuống tới khi gặp vật cản, nên nó trượt quá ô đích. Omni tới đứng ngay dưới ô đích làm chốt chặn, xe súng bắn lên để giật thùng xuống. Xe súng không có cảm biến: xem omni cần mấy nhịp rồi chờ cho đủ.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: ['#########', '#...#####', '###H#####', '###.#####', '###D#####', '#.......#', '#########'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 7, y: 5, huong: 0 }],
      maMau: B([], []), loiGiai: B(L5[0], L5[1]),
      hamCuaEmCan: ['forward', 'turn_left', 'slide_l'],
      goiY: ['Thùng trượt dừng ngay trước robot đồng đội, như trước tường.', 'Omni cần 4 nhịp để tới chỗ chặn; xe súng tới chỗ bắn sau 3 nhịp, nên chờ thêm một nhịp.']
    }),
    man({
      so: 6, ten: 'Bạn tới thì bắn', khoa: 0, r: [SUNG_CB, OMNI],
      deBai: 'Xe súng có cảm biến và chương trình cố định: chờ tới khi thấy omni đứng ngay trước mũi, rồi quay sang bắn nút mở cửa. Đưa omni tới đúng chỗ đó, chờ cửa mở rồi lên cờ của nó.',
      veMaMau: 'Đọc chương trình R1 bị khóa. Viết chương trình R2.',
      san: ['#########', '####F####', '####C####', '#.......#', '###F..N##', '#########'],
      bd: [{ x: 4, y: 4, huong: 0 }, { x: 1, y: 3, huong: 0 }], co: [[{ x: 3, y: 4 }], [{ x: 4, y: 1 }]],
      maMau: B(L6[0], []), loiGiai: B(L6[0], L6[1]),
      hamCuaEmCan: ['turn_right', 'slide_r', 'forward'],
      goiY: ['Omni chưa tới trước mũi xe súng thì cửa không bao giờ mở.', 'Tới nơi thì chờ bằng while not front_clear(): wait(), không đoán số nhịp.']
    }),
    man({
      so: 7, ten: 'Canh cửa theo chu kỳ', khoa: 0,
      deBai: 'Xe súng tựa lưng vào tường, cứ ba nhịp bắn nút một lần: cửa mở, đóng, rồi mở lại. Omni tới cửa đúng lúc cửa đang đóng nhưng lại lao vào cửa. Sửa điều kiện chờ của omni.',
      veMaMau: 'R1 bị khóa. Chạy thử, xem omni đâm cửa ở nhịp nào rồi sửa chương trình R2.',
      san: ['#N#######', '#.F.....#', '####C##.#', '####.##.#', '####F##.#', '#########'],
      bd: [{ x: 1, y: 1, huong: 0 }, { x: 7, y: 4, huong: 2 }], co: [[{ x: 2, y: 1 }], [{ x: 4, y: 4 }]],
      maMau: B(L7[0], nhieu(['for i in range(3):', '    back()', 'slide_r(3)', 'while front_clear():', '    wait()', 'forward(3)'])), loiGiai: B(L7[0], L7[1]),
      hamCuaEmCan: ['turn_right', 'move', 'back', 'slide_r', 'forward'],
      goiY: ['while front_clear(): wait() chờ khi cửa đang MỞ, ngược với điều em muốn.', 'Thêm not: chờ khi trước mặt chưa trống.']
    }),
    man({
      so: 8, ten: 'Sửa giờ bắn', khoa: 1, r: [SUNG_CB, OMNI],
      deBai: 'Một nút điều khiển hai cửa: bắn trúng thì cửa đang mở đóng lại, cửa đang đóng mở ra. Omni (chương trình cố định) đi qua cửa mở vào khoang giữa, chờ cửa kia mở. Xe súng bắn ngay từ đầu nên omni bị nhốt ngoài. Sửa cho xe súng chờ omni vào tới cửa đầu (cảm biến bên trái) rồi mới bắn.',
      veMaMau: 'R2 bị khóa. Chạy thử rồi sửa chương trình R1.',
      san: ['##########', '#...c.C.F#', '###F.N####', '##########'],
      bd: [{ x: 4, y: 2, huong: 1 }, { x: 1, y: 1, huong: 1 }], co: [[{ x: 3, y: 2 }], [{ x: 8, y: 1 }]],
      maMau: B(['shoot()', 'wait()'], L8[1]), loiGiai: B(L8[0], L8[1]),
      hamCuaEmCan: ['forward'],
      goiY: ['Cửa không đóng xuống chỗ đang có robot. Bắn lúc omni đã tới cửa đầu thì không nhốt được omni.', 'Xe súng quay mặt sang phải nên cửa đầu nằm bên trái xe: while left_clear(): wait().']
    }),
    man({
      so: 9, ten: 'Bốn cửa bốn nút',
      deBai: 'Làn dưới có bốn cửa, mỗi cửa một nút riêng trên tường làn trên. Xe súng đi dọc làn trên, tới dưới mỗi nút thì quay lên bắn. Omni qua từng cửa khi nó mở. Viết thẳng thì tràn khung: dùng vòng lặp cho cả hai.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: ['##N#N#N#N##', '#........F#', '###########', '#.C.C.C.CF#', '###########'],
      noi: [2, 4, 6, 8].map(function (x) { return { nut: { x: x, y: 0 }, cua: [{ x: x, y: 3 }] }; }),
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }], co: [[{ x: 9, y: 1 }], [{ x: 9, y: 3 }]],
      maMau: B([], []), loiGiai: B(L9[0], L9[1]),
      hamCuaEmCan: ['move', 'kick_right', 'forward'],
      goiY: ['kick_right() quay trái, bắn, quay lại: đúng động tác bắn nút phía trên khi xe quay mặt sang phải.', 'Mỗi lượt omni: chờ cửa trước mặt mở rồi forward(2).']
    }),
    man({
      so: 10, ten: 'Ca mở đường', r: [SUNG_CB, OMNI],
      deBai: 'Ba sân. Xe súng lên hết lối thì gặp nút ở bên trái hay bên phải; bắn trúng nút là cú giật đưa xe sang cờ bên kia. Omni đi lên: cửa đóng ở chỗ xa chỗ gần, sân ba là băng chuyền chạy xuống thay cho cửa. Một chương trình cho mỗi robot phải thắng cả ba sân.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: [
        ['#########', '##N.F.F##', '###.##.##', '###.##C##', '###.##.##', '###.##.##', '#########'],
        ['#########', '##F.N.F##', '###.##C##', '###.##.##', '######.##', '######.##', '#########'],
        ['#########', '##N.F.F##', '###.##v##', '###.##v##', '###.##v##', '######.##', '#########']
      ],
      bd: [[{ x: 3, y: 5, huong: 0 }, { x: 3, y: 3, huong: 0 }, { x: 3, y: 4, huong: 0 }], [{ x: 6, y: 5, huong: 0 }, { x: 6, y: 5, huong: 0 }, { x: 6, y: 5, huong: 0 }]],
      co: [[[{ x: 4, y: 1 }], [{ x: 2, y: 1 }], [{ x: 4, y: 1 }]], [[{ x: 6, y: 1 }], [{ x: 6, y: 1 }], [{ x: 6, y: 1 }]]],
      maMau: B([], []), loiGiai: B(L10[0], L10[1]),
      hamCuaEmCan: ['go_wall', 'turn_left', 'turn_right'],
      goiY: ['Nút nằm trên tường nên left_clear() là False khi nút ở bên trái.', 'Omni: go_wall() tới cửa, chờ cửa mở, rồi go_wall() lần nữa. Băng chạy thì go_wall() cứ thử đi lên tới khi băng tắt.'],
      huyHieu: { ma: CHUONG, ten: 'Huy hiệu Đội súng hơi và omni' }
    })
  ];

  /* ------------------------------------------------------------------ chương 2: CHẾ LỆNH ĐỘI SÚNG HƠI (che-doi-sung-hoi) */

  var CHE = 'che-' + CHUONG;
  // hàm của em mới (tên cốt truyện, vào kho)
  var T_WAIT_GATE = ['while not front_clear():', '    wait()'];
  var T_FIRE_CLEAR = ['while not front_clear():', '    wait()', 'shoot()', 'wait()'];
  var T_PASS_GATE = ['wait_gate()', 'forward(2)'];
  var T_CATCH_CRATE = ['while front_clear():', '    wait()'];
  var T_OPEN_STEP = ['kick_right()', 'forward(2)'];
  // hàm của màn (thân ban đầu hỏng / bản sửa)
  var T_OPEN_GATE_CU = ['turn_left()', 'shoot()', 'wait()', 'shoot()', 'wait()', 'turn_right()'];
  var T_OPEN_GATE = ['turn_left()', 'shoot()', 'wait()', 'turn_right()'];
  var T_OPEN_BACK_CU = ['shoot()', 'wait()'];
  var T_OPEN_BACK = ['shoot_back()', 'wait()'];
  var T_MAKE_WAY_CU = ['slide_left()', 'wait()', 'while not right_clear():', '    wait()', 'slide_right()', 'wait()'];
  var T_MAKE_WAY = ['slide_left()', 'wait()', 'while right_clear():', '    wait()', 'while not right_clear():', '    wait()', 'slide_right()', 'wait()'];

  var C1 = [['forward(2)', 'turn_right()', 'shoot()', 'wait()'], ['forward(2)', 'wait_gate()', 'forward(4)']];
  var C2 = [['fire_clear()', 'turn_right()', 'move()'], ['slide_l(1)', 'move()', 'slide_l(2)']];
  var C3 = [['forward(3)', 'turn_left()', 'shoot()', 'wait()'], ['pick()', 'forward(2)', 'pass_gate()', 'drop()']];
  var C4 = [['wait_gate()', 'forward(2)', 'turn_left()', 'shoot()', 'wait()', 'turn_right()', 'move()'], ['forward(2)', 'wait_gate()', 'forward(4)']];
  var C5 = [['for i in range(3):', '    move()', '    kick_right()', '    move()'], ['slide_r(1)', 'for i in range(3):', '    catch_crate()', '    slide_r(2)']];
  var C6 = [['for i in range(3):', '    open_step()'], ['for i in range(3):', '    pass_gate()']];
  var C7 = [['open_gate()', 'turn_right()', 'go_wall()'], ['forward(4)', 'pass_gate()', 'move()']];
  var C8 = [['forward(2)', 'open_back()', 'go_wall()'], ['move()', 'pass_gate()', 'forward(3)']];
  var C9 = [['turn_left()', 'shoot()', 'wait()', 'turn_right()', 'forward(5)'], ['move()', 'make_way()', 'forward(4)']];
  var C10 = [['while front_clear():', '    if not left_clear():', '        kick_right()', '    move()'], ['for i in range(4):', '    pass_gate()']];

  /** Trùm chương 2: hàng nút trên tường làn trên (x trong dsX), mỗi nút một cửa ngay dưới ở làn omni. */
  function sanNut(dsX) {
    var tren = '#', duoi = '#';
    for (var x = 1; x <= 9; x++) {
      var co = dsX.indexOf(x) >= 0;
      tren += co ? 'N' : '.';
      duoi += x === 9 ? 'F' : co ? 'C' : '.';
    }
    return [tren + '#', '#........F#', '###########', duoi + '#', '###########'];
  }
  function noiNut(dsX) { return dsX.map(function (x) { return { nut: { x: x, y: 0 }, cua: [{ x: x, y: 3 }] }; }); }
  var NUT_10 = [[4], [2, 6], [2, 4, 8]];

  DS = DS.concat([
    man({
      so: 1, chuong: CHE, ten: 'Hàm chờ cửa', khoa: 1, taoHam: ['wait_gate'],
      deBai: 'Chương trình của omni bị khóa và gọi wait_gate(): em tự chế lệnh này để omni đứng chờ tới khi cửa trước mặt mở. Rồi viết cho xe súng lên hai ô, quay phải và bắn nút N (cú giật đưa xe về cờ của nó).',
      veMaMau: 'Mở Xưởng hàm, tạo wait_gate(). Viết chương trình R1.',
      san: ['#########', '#...C..F#', '#########', '#F.....N#', '##.######', '##.######', '#########'],
      bd: [{ x: 2, y: 5, huong: 0 }, { x: 1, y: 1, huong: 1 }], co: [[{ x: 1, y: 3 }], [{ x: 7, y: 1 }]],
      maMau: B([], C1[1]), loiGiai: Object.assign(B(C1[0], C1[1]), { hamCuaEmMoi: [H('wait_gate', T_WAIT_GATE)] }),
      hamCuaEmCan: ['turn_right', 'forward'],
      goiY: ['Cửa đóng thì front_clear() là False: lặp wait() khi trước mặt chưa trống.', 'wait_gate() = while not front_clear(): wait()']
    }),
    man({
      so: 2, chuong: CHE, ten: 'Bắn khi đường trống', khoa: 0, r: [SUNG_CB, OMNI], taoHam: ['fire_clear'],
      deBai: 'Omni đứng ngay trước mũi xe súng, chắn đường bóng tới nút N. Xe súng (bị khóa) gọi fire_clear(): em chế lệnh này để xe chờ tới khi trước mặt trống rồi mới bắn. Rồi đưa omni tránh khỏi đường bắn, qua cửa vừa mở tới cờ.',
      veMaMau: 'Tạo fire_clear() trong Xưởng hàm, rồi viết chương trình R2.',
      san: ['####N####', '#FC..####', '###..####', '####.F###', '#########'],
      bd: [{ x: 4, y: 3, huong: 0 }, { x: 4, y: 2, huong: 0 }], co: [[{ x: 5, y: 3 }], [{ x: 1, y: 1 }]],
      maMau: B(C2[0], []), loiGiai: Object.assign(B(C2[0], C2[1]), { hamCuaEmMoi: [H('fire_clear', T_FIRE_CLEAR)] }),
      hamCuaEmCan: ['turn_right', 'move', 'slide_l'],
      goiY: ['Bóng dừng ở robot đồng đội. Omni phải ra khỏi cả cột trước mũi xe súng, không chỉ ô sát mũi.', 'Omni trượt sang trái trước, rồi mới đi lên.']
    }),
    man({
      so: 3, chuong: CHE, ten: 'Chở hộp qua cửa', khoa: 0, r: [SUNG, OMNI_KEP], mucTieu: 'dua-vat', taoHam: ['pass_gate'],
      deBai: 'Omni có tay kẹp phải chở hộp qua cửa vào ô đích. Chế pass_gate(): chờ cửa mở (dùng wait_gate) rồi tiến hai ô. Xe súng đã có chương trình cố định: chạy lên, quay trái, bắn nút.',
      veMaMau: 'Tạo pass_gate() rồi viết chương trình R2.',
      san: ['#########', '#.o.C.D.#', '#########', '#N.....##', '###.#####', '###.#####', '###.#####', '#########'],
      bd: [{ x: 3, y: 6, huong: 0 }, { x: 1, y: 1, huong: 1 }],
      maMau: B(C3[0], []), loiGiai: Object.assign(B(C3[0], C3[1]), { hamCuaEmMoi: [H('pass_gate', T_PASS_GATE)] }),
      hamCuaEmCan: ['forward', 'turn_left', 'pick', 'drop', 'wait_gate'],
      goiY: ['Hàm của em gọi được hàm em đã chế: wait_gate() rồi forward(2).', 'pick() gắp hộp ở ô trước mặt; tới sát ô đích thì drop().']
    }),
    man({
      so: 4, chuong: CHE, ten: 'Cả hai cùng chờ', r: [SUNG_CB, OMNI],
      deBai: 'Hai robot chung một hành lang, omni đứng ngay trước xe súng. Xe súng phải tới dưới nút N bắn mở cửa, rồi về cờ của nó, đúng chỗ omni đang đứng chờ cửa. Cả hai robot dùng wait_gate() để không húc nhau.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: ['###N######', '#...FC..F#', '##########'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }], co: [[{ x: 4, y: 1 }], [{ x: 8, y: 1 }]],
      maMau: B([], []), loiGiai: B(C4[0], C4[1]),
      hamCuaEmCan: ['wait_gate', 'forward', 'turn_left', 'turn_right', 'move'],
      goiY: ['Đồng đội trước mặt cũng làm front_clear() là False, nên wait_gate() chờ được cả bạn lẫn cửa.', 'Xe súng: wait_gate() trước khi tiến, vì omni còn đứng chắn.']
    }),
    man({
      so: 5, chuong: CHE, ten: 'Đỡ ba thùng', mucTieu: 'day-thung', taoHam: ['catch_crate'],
      deBai: 'Ba thùng nặng phải trượt vào ba ô đích. Xe súng đi dọc làn trên, giật từng thùng xuống. Omni chạy dọc làn dưới làm chốt chặn. Chế catch_crate(): omni đứng chờ tới khi thùng nằm ngay trước mặt, rồi mới sang cột kế.',
      veMaMau: 'Tạo catch_crate(), rồi viết cả hai chương trình bằng vòng lặp.',
      san: ['#########', '#.......#', '##H#H#H##', '##.#.#.##', '##D#D#D##', '#.......#', '#########'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 5, huong: 0 }],
      maMau: B([], []), loiGiai: Object.assign(B(C5[0], C5[1]), { hamCuaEmMoi: [H('catch_crate', T_CATCH_CRATE)] }),
      hamCuaEmCan: ['move', 'kick_right', 'slide_r'],
      goiY: ['catch_crate() ngược với wait_gate(): chờ khi trước mặt CÒN trống.', 'Omni đi trước một cột, đỡ xong thùng mới trượt hai ô sang cột kế.']
    }),
    man({
      so: 6, chuong: CHE, ten: 'Robot gác gọi hàm em', khoa: 0, taoHam: ['open_step'],
      deBai: 'Xe súng bị khóa: ba lần gọi open_step(). Mỗi nút dưới tường làn dưới mở một cửa ở làn trên. Chế open_step() để xe bắn nút bên trái rồi tiến tới nút kế (hai ô). Rồi cho omni qua ba cửa bằng pass_gate().',
      veMaMau: 'Tạo open_step(), rồi viết chương trình R2.',
      san: ['#########', '#FC.C.C.#', '#########', '#F......#', '##N#N#N##'],
      noi: [6, 4, 2].map(function (x) { return { nut: { x: x, y: 4 }, cua: [{ x: x, y: 1 }] }; }),
      bd: [{ x: 6, y: 3, huong: 3 }, { x: 7, y: 1, huong: 3 }], co: [[{ x: 1, y: 3 }], [{ x: 1, y: 1 }]],
      maMau: B(C6[0], []), loiGiai: Object.assign(B(C6[0], C6[1]), { hamCuaEmMoi: [H('open_step', T_OPEN_STEP)] }),
      hamCuaEmCan: ['kick_right', 'forward', 'pass_gate'],
      goiY: ['Xe quay mặt sang trái nên nút dưới chân nằm bên trái xe: kick_right() bắn đúng phía đó.', 'open_step() = kick_right(), forward(2)']
    }),
    man({
      so: 7, chuong: CHE, ten: 'Sửa hàm mở cửa', khoa: 0, r: [SUNG_CB, OMNI],
      deBai: 'Xe súng (bị khóa) gọi open_gate() để mở cửa cho omni. Nhưng hàm bắn hai phát: cửa mở rồi đóng lại trước khi omni tới. Sửa thân open_gate().',
      veMaMau: 'Chương trình hai robot đã đúng. Chỉ sửa hàm của màn open_gate().',
      san: ['##########', '#.....C.F#', '##########', '#N......F#', '##########'],
      bd: [{ x: 2, y: 3, huong: 0 }, { x: 1, y: 1, huong: 1 }], co: [[{ x: 8, y: 3 }], [{ x: 8, y: 1 }]],
      maMau: B(C7[0], C7[1], [H('open_gate', T_OPEN_GATE_CU)]), loiGiai: B(C7[0], C7[1], [H('open_gate', T_OPEN_GATE)]),
      hamCuaEmCan: ['turn_right', 'go_wall', 'forward', 'pass_gate', 'move'],
      goiY: ['Mỗi phát trúng nút đổi cửa một lần: hai phát là về như cũ.', 'Bỏ phát bắn thứ hai.']
    }),
    man({
      so: 8, chuong: CHE, ten: 'Sửa nòng bắn', khoa: 0, r: [SUNG_CB, OMNI],
      deBai: 'Nút N nằm sau đuôi xe súng. Hàm của màn open_back() bắn nhầm nòng trước nên bóng bay vào tường và xe giật lùi. Sửa open_back(), rồi viết cho omni qua cửa tới cờ.',
      veMaMau: 'R1 bị khóa. Sửa open_back() và viết chương trình R2.',
      san: ['#########', '#N.....F#', '#########', '#..C...F#', '#########'],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }], co: [[{ x: 7, y: 1 }], [{ x: 7, y: 3 }]],
      maMau: B(C8[0], [], [H('open_back', T_OPEN_BACK_CU)]), loiGiai: B(C8[0], C8[1], [H('open_back', T_OPEN_BACK)]),
      hamCuaEmCan: ['forward', 'go_wall', 'move', 'pass_gate'],
      goiY: ['shoot_back() bắn ra sau đuôi, và xe giật tới một ô.', 'Omni: tới sát cửa rồi pass_gate().']
    }),
    man({
      so: 9, chuong: CHE, ten: 'Đổi chỗ cho nhau', khoa: 1,
      deBai: 'Hai robot đổi phía: cờ của xe súng ở sau lưng omni, cờ của omni ở sau lưng xe súng. Hành lang một làn, giữa có cửa. Omni (bị khóa) gọi make_way() để nép vào hốc nhường đường, nhưng hàm ra khỏi hốc quá sớm nên hai robot chặn nhau. Sửa make_way() và viết chương trình xe súng.',
      veMaMau: 'R2 bị khóa. Sửa make_way() và viết chương trình R1.',
      san: ['##N######', '#F..C..F#', '#####.###', '#########'],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 6, y: 1, huong: 3 }], co: [[{ x: 7, y: 1 }], [{ x: 1, y: 1 }]],
      maMau: B([], C9[1], [H('make_way', T_MAKE_WAY_CU)]), loiGiai: B(C9[0], C9[1], [H('make_way', T_MAKE_WAY)]),
      hamCuaEmCan: ['turn_left', 'turn_right', 'forward', 'move'],
      goiY: ['Trong hốc, omni quay mặt sang trái nên hành lang nằm bên phải nó: right_clear().', 'Chờ xe súng tới ngang hốc, rồi chờ nó đi qua hẳn mới ra.']
    }),
    man({
      so: 10, chuong: CHE, ten: 'Hành lang nhiều cửa', r: [SUNG_CB, OMNI],
      deBai: 'Ba sân, số cửa và chỗ đặt nút khác nhau. Mỗi nút trên tường mở cửa ngay dưới nó ở làn omni. Xe súng đi dọc làn trên, gặp nút ở bên trái thì bắn. Omni đi qua bốn đoạn hai ô bằng pass_gate(). Một chương trình mỗi robot cho cả ba sân.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: NUT_10.map(sanNut), noi: NUT_10.map(noiNut),
      bd: [[0, 1, 2].map(function () { return { x: 1, y: 1, huong: 1 }; }), [0, 1, 2].map(function () { return { x: 1, y: 3, huong: 1 }; })],
      co: [[0, 1, 2].map(function () { return [{ x: 9, y: 1 }]; }), [0, 1, 2].map(function () { return [{ x: 9, y: 3 }]; })],
      maMau: B([], []), loiGiai: B(C10[0], C10[1]),
      hamCuaEmCan: ['kick_right', 'move', 'pass_gate'],
      goiY: ['Ô trống phía trên làn thì left_clear() là True; nút N thì False.', 'Đoạn không có cửa thì wait_gate() trong pass_gate() không phải chờ.'],
      huyHieu: { ma: CHE, ten: 'Huy hiệu Chế lệnh đội súng hơi' }
    })
  ]);

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'che-sung-hoi', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội súng hơi và omni' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội súng hơi' }],
    goi: { ma: CHUONG, ten: 'Đội súng hơi và omni', hinh: 'sung-hoi' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

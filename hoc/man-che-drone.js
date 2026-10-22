/* ============================================================================
   man-che-drone.js — "Đường học": CHƯƠNG `che-drone` · CHẾ LỆNH DRONE (10 màn). Kế hoạch "Chế lệnh" (KE-HOACH-CHE-LENH.md, mục 5c.6), làm 15/10.
   Chương thứ 30 (cuối, ngay sau Drone, man-drone.js). Robot là DRONE: robot { than: 'drone', tay: null | 'nam-cham', camBien: [] | [{ ma: 'pin', o: 'than' }] }. Xưởng hàm mở, được dùng hàm của em.
   Luật thiết kế (như che-xe): lệnh gốc chỉ đổi MỘT trạng thái (bay một ô, bật / ngắt nam châm); động tác hay (vòng qua cột, bậc thang bay, chở hộp qua rào rồi về) là thứ NGƯỜI CHƠI TỰ CHẾ.
   Mỗi lệnh chế được ít nhất hai cách và cả hai đều thắng: `congThucKhac: [{ moTa, hamCuaEmMoi }]` (kiem-che-drone.mjs chạy từng cách).
   Màn dùng HÀM CỦA MÀN (7, 8, 9: hàm chỉ đúng cho màn đó, không vào kho) khai cách khác bằng `{ moTa, baiLam: { chinh, hamCuaMan } }`.

   LUẬT DRONE (san-hoc.js, phần DRONE; chương drone dạy): bốn lệnh bay go_up / go_down / go_left / go_right (mỗi lệnh đúng 1 NHỊP, không cần wait()), wait() lơ lửng; bay QUA hàng rào =, băng chuyền, vật nằm đất;
   KHÔNG qua tường cao # và mép sân. PIN (màn khai pin): mỗi nhịp tốn 1 pin; ô sạc P: cuối nhịp đang ở trên P thì pin đầy lại; pin về 0 mà chưa xong thì drone rơi. battery() trả pin còn lại, không tốn nhịp.
   NAM CHÂM TREO dưới bụng: magnet_n() / magnet_s() / magnet_off() chỉ ra lệnh, làm ở nhịp kế (go_*() hay wait()): thả TRƯỚC khi bay, hút vật sắt ở ô dưới drone SAU khi bay (cực nào cũng hút sắt).
   Mục tiêu `bong-mo` (san-hoc.js, phần BÓNG MỜ) cho cả chương, kể cả màn chở hộp (6, 10): drone phải ĐỨNG đúng ô bóng mờ khi chương trình CHẠY XONG (drone không có hướng mặt, bỏ huong), vật mờ cho biết hộp phải nằm ở ô nào,
   ◆ là ô phải ghé qua. Chọn `bong-mo` thay cho `dua-vat` ở màn chở hộp vì `dua-vat` thắng NGAY khi mọi hộp tới đích, còn việc cần chế ở đây là cả chuyến (chở rồi bay VỀ chỗ cũ); bóng mờ đòi cả hai.
   Hệ quả: thắng xét ở cuối chương trình nên nhịp pin về 0 (kể cả nhịp cuối) là rơi: lời giải phải còn ít nhất 1 pin lúc dừng. Màn bóng mờ không vẽ ô đích D (vật mờ thay chỗ của nó).
   `chinhCoDinh: true` — chương trình chính khóa (bản mẫu `maMau.chinh`), người chơi chỉ sửa / tạo hàm trong Xưởng. 3 và 10 không khóa: người chơi tự viết chương trình chính.

   KHAY: bốn lệnh bay + wait() cả chương; 5 và 8 thêm battery() (màn có pin); 6 và 10 (màn có hộp) thêm magnet_n / magnet_s / magnet_off. Màn 9 là màn HỎNG: khay = phần cứng = go_up, go_left, go_right, wait, battery (thiếu go_down).
   Hàm của em có sẵn ở chương này: go(d), walk(path) (nhện), recharge(), ship(path) (drone) và hàm các chương trước (hàm của xe không chạy trên drone).
   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-drone.1 hurdle()    = go_up(), go_right(), go_right(), go_down()          vòng qua một cột đá chắn ngay bên phải, đáp xuống ô ngay sau cột, cùng hàng (4 nhịp)
     che-drone.2 scout(n)    = for n lần go_right(), rồi for n lần go_left()       bay ra n ô sang phải rồi bay về đúng chỗ cũ (2n nhịp)
     che-drone.4 glide(n)    = for n lần: go_right(), go_down()                    bay xuống n bậc thang: mỗi bậc sang phải một ô rồi xuống một ô (2n nhịp)
     che-drone.5 fly(path)   = for c in path: go(c), recharge()                    bay theo chuỗi chỉ đường, sau mỗi ô xét pin: thấp thì ghé ô sạc ngay phía trên (3 ô + go 8 ô + recharge 3 ô)
     che-drone.6 airlift(n)  = magnet_n(), wait(), for n go_right(), magnet_off(), for n go_left()   hút hộp sắt dưới bụng, chở sang phải n ô, thả (cùng nhịp với bước bay về đầu tiên), bay về chỗ cũ (2n + 1 nhịp)
   HÀM CỦA MÀN (không vào kho, không có trong Sổ lệnh; `maMau.hamCuaMan`):
     che-drone.7 go_out()       khóa, xem được: hurdle(), glide(2); come_back() thân ban đầu `pass`, lời giải for 3 lần (go_up, go_left), go_left, go_down   đi NGƯỢC lại go_out(): đảo thứ tự, mỗi lệnh đổi thành lệnh ngược
     che-drone.8 safe_fly(path) thân ban đầu = bay theo chuỗi, thiếu pin thì ghé ô sạc ngay phía TRÊN (go_up rồi go_down), nhưng ô sạc của sân nằm phía DƯỚI; lời giải đổi thành go_down rồi go_up
     che-drone.9 fixed_fly(path) thân ban đầu = fly() (for c in path: go(c), recharge()), chạy hỏng vì cánh xuống hỏng (không có go_down) nên recharge() không dùng được; ô sạc nằm ngay trên đường bay, lời giải bỏ recharge()
                                (là hàm CỦA MÀN chứ không sửa fly() của em: bản bỏ recharge() chỉ đúng khi cánh hỏng, sửa vào kho sẽ làm fly() hỏng ở các màn khác)

   Sao: sao.nhip = số nhịp của lời giải cách 1 chạy thật; máy kiểm (kiem-hoc.mjs, do-duong-che-drone.mjs) dò BFS rằng không có đường tắt (BFS = sao.nhip, hoặc ≤ khi nhipTheoLoiGiai).
   nhipTheoLoiGiai (BFS ngắn hơn sao.nhip, kiểm BFS ≤ sao.nhip) chỉ ở 5 và 8 (lời giải chuẩn ghé sạc mỗi khi pin thấp, còn đường ngắn nhất bay dọc dải ô sạc không cần xét pin), 6 và 10 (lời giải chuẩn nhấc hộp bằng nhịp riêng, còn đường ngắn nhất nhấc hộp cùng nhịp với bước bay xuống ô kế).
   sao.o = ô chương trình + thân các hàm thực sự được gọi (kể cả hàm lồng nhau, mỗi hàm tính một lần).
   Hướng: drone không có hướng mặt (batDau.huong luôn 0). (x, y) với y = 0 ở hàng trên.
   Nối tiếp man-drone.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-drone.js') : window.ManHoc;

  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var NC = ['magnet_n', 'magnet_s', 'magnet_off'];
  var BAY_HONG = ['go_up', 'go_left', 'go_right', 'wait', 'battery'];                  // 9: cánh xuống hỏng (không có go_down)

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hay mảng) `n` lần (n là số hay tên biến). */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  function W(chuoi) { return 'walk("' + chuoi + '")'; }

  // thân các hàm chế (cách 1, cách người chơi thường chọn)
  var T_HURDLE = ['go_up()', 'go_right()', 'go_right()', 'go_down()'];
  var T_SCOUT = nhieu(LAP('n', 'go_right()'), LAP('n', 'go_left()'));
  var T_GLIDE = LAP('n', ['go_right()', 'go_down()']);
  var T_FLY = ['for c in path:', '    go(c)', '    recharge()'];
  var T_AIRLIFT = nhieu(['magnet_n()', 'wait()'], LAP('n', 'go_right()'), ['magnet_off()'], LAP('n', 'go_left()'));
  function hHurdle(than) { return H('hurdle', [], than || T_HURDLE); }
  function hScout(than) { return H('scout', ['n'], than || T_SCOUT); }
  function hGlide(than) { return H('glide', ['n'], than || T_GLIDE); }
  function hFly(than) { return H('fly', ['path'], than || T_FLY); }
  function hAirlift(than) { return H('airlift', ['n'], than || T_AIRLIFT); }

  // hàm của màn
  var T_GO_OUT = ['hurdle()', 'glide(2)'];
  var T_COME_BACK_TRONG = ['pass'];                                                      // thân ban đầu của come_back() ở 7: chưa làm gì (lõi hiểu pass), người chơi viết thay nó
  var T_COME_BACK = nhieu(LAP(3, ['go_up()', 'go_left()']), ['go_left()', 'go_down()']);
  var T_SAFE_FLY_SAI = ['for c in path:', '    go(c)', '    if battery() < 2:', '        go_up()', '        go_down()'];       // 8: ô sạc nằm phía DƯỚI nhưng hàm bay lên
  var T_SAFE_FLY = ['for c in path:', '    go(c)', '    if battery() < 2:', '        go_down()', '        go_up()'];
  var T_FIXED_FLY_CU = T_FLY.slice();                                                    // 9: fixed_fly(path) của màn, thân ban đầu = fly() (có recharge(), chạy hỏng vì recharge() cần go_down())
  var T_FIXED_FLY = ['for c in path:', '    go(c)'];                                      // 9: bản sửa, bỏ recharge()

  /**
   * Điền các trường chung của chương (không đụng tới trường màn đã khai).
   * m.nam: true thì có nam châm treo (+ lệnh magnet_n / magnet_s / magnet_off trên khay). m.bat: true thì có battery() (cần m.pin).
   */
  function man(m) {
    var nam = m.nam, bat = m.bat;
    delete m.nam; delete m.bat;
    m.chuong = 'che-drone';
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: nam ? 'nam-cham' : null, camBien: bat ? [{ ma: 'pin', o: 'than' }] : [] };
    m.hamGoc = m.hamGoc || nhieu(BAY, nam ? NC : [], bat ? ['battery'] : []);
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = 'bong-mo';
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  // chương trình chính khóa của từng màn (maMau.chinh)
  var C_1 = ['hurdle()'];
  var C_2 = ['scout(3)'];
  var C_4 = ['glide(4)'];
  var C_5 = ['fly("RRRRRR")'];
  var C_6 = nhieu(LAP(2, ['airlift(3)', 'go_down()']), ['airlift(3)']);
  var C_7 = ['go_out()', 'come_back()'];
  var C_8 = ['safe_fly("RRRRRR")'];
  var C_9 = ['fixed_fly("RRURRURR")'];
  // 3 (người chơi tự viết): ba cột đá liên tiếp, mỗi cột một lần hurdle()
  var L_3 = LAP(3, 'hurdle()');
  // 10 (người chơi tự viết): vòng qua cột, xuống hai bậc tới hộp thứ nhất, chở sang phải hai ô, xuống hộp thứ hai, chở tiếp
  var L_10 = ['hurdle()', 'glide(2)', 'airlift(2)', 'go_down()', 'airlift(2)'];

  /* ------------------------------------------------------------------- sân */

  // 1: cột đá ở (1,1) ngay bên phải drone (0,1); bóng mờ ở (2,1) sau cột
  var SAN_1 = ['.....', '.#...', '.....'];
  // 2: hành lang một hàng; ◆ ở (3,0); bóng mờ cùng ô với drone (0,0)
  var SAN_2 = ['.....', '#####'];
  // 3: rừng ba cột đá ở (1,1) (3,1) (5,1); ◆ ở (2,1) và (4,1) ép drone đi qua giữa hàng, bóng mờ ở (6,1)
  var SAN_3 = ['.......', '.#.#.#.', '.......'];
  // 4: hành lang bậc thang bốn bậc, rộng đúng một ô: (0,0) → (4,4)
  var SAN_4 = ['..###', '#..##', '##..#', '###..', '####.'];
  // 5: hành lang một hàng (y = 1); ĐƯỜNG RAY SẠC là cả hàng P ngay phía trên: ghé lên P ở ô nào cũng được. Ba sân, ba mức pin
  var SAN_5 = ['PPPPPPP', '.......'];
  var PIN_5 = [7, 6, 5];
  // 6: ba hộp sắt ở cột 0 (drone xuất phát ngay trên hộp đầu), hàng rào ở cột 1 (xe không qua được, drone bay qua), ba ô trống ở cột 3 là chỗ hộp phải nằm
  var SAN_6 = ['o=..', 'o=..', 'o=..'];
  var CHAT_6 = ['s...', 's...', 's...'];
  // 7: hành lang rộng đúng một ô: nhà (0,1); hurdle() vòng qua cột (1,1) tới (2,1); glide(2) xuống (3,1) (3,2) (4,2) (4,3); ◆ ở (4,3)
  var SAN_7 = ['...##', '.#..#', '###..', '####.'];
  // 8: đường ray sạc nằm phía DƯỚI hành lang (hàng P), một sân, pin yếu
  var SAN_8 = ['.......', 'PPPPPPP'];
  // 9: cầu thang đi lên chéo sang phải (0,2) → (6,0), rộng đúng một ô; ô sạc P nằm ngay trên đường bay, ở (4,1)
  var SAN_9 = ['####...', '##..P##', '...####'];
  // 10: kho trên cao: nhà (0,1); cột đá (1,1); hai bậc thang xuống tới hộp sắt thứ nhất (4,3), hộp thứ hai (4,4) ngay dưới nó; hàng rào ở cột 5; chỗ đặt hộp ở (6,3) và (6,4)
  var SAN_10 = ['...####', '.#..###', '###..##', '####o=.', '####o=.'];
  var CHAT_10 = ['.......', '.......', '.......', '....s..', '....s..'];

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Vòng qua cột', hang: 'lam-quen', taoHam: ['hurdle'],
      deBai: 'Một cột đá chắn ngay trước drone. Chương trình chính chỉ gọi hurdle(). Em tự chế lệnh hurdle() để drone bay vòng qua cột rồi đáp xuống ô ngay sau cột, đúng chỗ bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi hurdle(). Mở Xưởng hàm, tạo hurdle() rồi bấm Chạy.',
      san: SAN_1,
      batDau: { x: 0, y: 1, huong: 0 },
      bongMo: { x: 2, y: 1 },
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 5, nhip: 4 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [hHurdle()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_1.slice() },
        hamCuaEmMoi: [hHurdle(nhieu(['# vòng qua cột đá'], T_HURDLE))]
      },
      congThucKhac: [
        { moTa: 'Bay vòng phía dưới cột: xuống, sang phải hai ô, rồi lên', hamCuaEmMoi: [hHurdle(['go_down()', 'go_right()', 'go_right()', 'go_up()'])] },
        { moTa: 'Gọi walk() với chuỗi chỉ đường URRD', hamCuaEmMoi: [hHurdle([W('URRD')])] }
      ],
      loiSai: [
        { moTa: 'Gọi hurdle() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Bay vòng mà quên bay xuống: drone dừng ở hàng trên, phía trên bóng mờ', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hHurdle(['go_up()', 'go_right()', 'go_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Bay thẳng sang phải, không vòng: drone đâm vào cột đá', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hHurdle(['go_right()', 'go_right()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Bay vòng thiếu một ô sang phải: drone đáp xuống đúng ô của cột đá nên đâm', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hHurdle(['go_up()', 'go_right()', 'go_down()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Bay vòng phía dưới mà lại xuống thêm một ô: drone đâm mép sân', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hHurdle(['go_down()', 'go_right()', 'go_right()', 'go_down()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] }
      ],
      goiY: ['Cột đá chắn lối nên drone phải bay vòng: lên một ô, qua cột, rồi xuống lại đúng hàng cũ.',
        'Bóng mờ cách drone hai ô sang phải. Vòng qua cột cần đủ lên, phải, phải, xuống.']
    }),

    man({
      so: 2, ten: 'Bay ra rồi về', hang: 'lam-quen', taoHam: ['scout'],
      deBai: 'Drone phải bay ra tới điểm ◆ rồi bay về đúng chỗ cũ, như bóng mờ. Chương trình chính chỉ gọi scout(3). Em tự chế lệnh scout(n): bay ra n ô sang phải rồi bay về.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi scout(3). Mở Xưởng hàm, tạo scout có đối số n rồi bấm Chạy.',
      san: SAN_2,
      batDau: { x: 0, y: 0, huong: 0 },
      bongMo: { x: 0, y: 0, diQua: [{ x: 3, y: 0 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 5, nhip: 6 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [hScout()] },
      loiGiaiKhac: {
        moTa: 'Không dùng đối số n: viết thẳng ba lệnh go_right() rồi ba lệnh go_left()',
        baiLam: { chinh: C_2.slice() },
        hamCuaEmMoi: [hScout(nhieu(lap('go_right()', 3), lap('go_left()', 3)))]
      },
      congThucKhac: [
        { moTa: 'Gọi go("R") và go("L") thay cho go_right() và go_left()', hamCuaEmMoi: [hScout(nhieu(LAP('n', 'go("R")'), LAP('n', 'go("L")')))] }
      ],
      loiSai: [
        { moTa: 'Gọi scout(3) mà chưa chế hàm', baiLam: { chinh: C_2.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ bay ra, quên bay về: drone dừng ở điểm ◆', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hScout(LAP('n', 'go_right()'))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Bay về thiếu một ô: lặp n - 1 lần', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hScout(nhieu(LAP('n', 'go_right()'), LAP('n - 1', 'go_left()')))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết cứng 2 thay cho n: drone không tới được điểm ◆', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hScout(nhieu(LAP(2, 'go_right()'), LAP(2, 'go_left()')))], phaiCoMa: ['chua-qua-diem'] },
        { moTa: 'Bay về trước rồi mới bay ra: drone đâm mép sân, cuối cùng dừng ở điểm ◆', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hScout(nhieu(LAP('n', 'go_left()'), LAP('n', 'go_right()')))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] }
      ],
      goiY: ['Bay ra bằng một vòng lặp n lần go_right(), rồi bay về bằng một vòng lặp n lần go_left().',
        'Số lần lặp lấy từ đối số n, để scout(3) hay scout(5) đều đúng.']
    }),

    man({
      so: 3, ten: 'Rừng cột đá', hang: 'lam-quen', hamCuaEmCan: ['hurdle'],
      deBai: 'Ba cột đá nối nhau trên đường tới bóng mờ, và drone phải ghé qua hai điểm ◆ ở giữa các cột. Tự viết chương trình chính, dùng hurdle() em đã chế. Chương trình chỉ có 10 ô.',
      veMaMau: 'Chương trình chính còn trống. Mỗi cột đá cần một lần vòng qua: hãy tìm lệnh em đã chế cho việc đó.',
      san: SAN_3,
      batDau: { x: 0, y: 1, huong: 0 },
      bongMo: { x: 6, y: 1, diQua: [{ x: 2, y: 1 }, { x: 4, y: 1 }] },
      maMau: { chinh: [] },
      sao: { o: 6, nhip: 12 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: {
        moTa: 'Gọi hurdle() ba lần, không dùng vòng for',
        baiLam: { chinh: lap('hurdle()', 3) }
      },
      congThucKhac: [
        { moTa: 'Mỗi cột vòng bằng walk("URRD")', baiLam: { chinh: lap(W('URRD'), 3) } },
        { moTa: 'Không gọi hurdle(): vòng for ba lần bốn lệnh bay gốc', baiLam: { chinh: LAP(3, ['go_up()', 'go_right()', 'go_right()', 'go_down()']) } }
      ],
      loiSai: [
        { moTa: 'Bay thẳng sang phải, không vòng: drone đâm vào cột đầu tiên', baiLam: { chinh: LAP(6, 'go_right()') }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Bay trên hàng trên của cả rừng cột: tới được bóng mờ nhưng không ghé qua các điểm ◆', baiLam: { chinh: nhieu(['go_up()'], LAP(6, 'go_right()'), ['go_down()']) }, phaiCoMa: ['chua-qua-diem'] },
        { moTa: 'Mới vòng qua hai cột: drone dừng giữa đường, ở điểm ◆ thứ hai', baiLam: { chinh: LAP(2, 'hurdle()') }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Vòng bốn lần: lần thứ tư drone đâm mép sân hai lần nên thừa nhịp', baiLam: { chinh: LAP(4, 'hurdle()') }, phaiCoMa: [] }
      ],
      goiY: ['Cột nào cũng giống nhau: một lần hurdle() qua một cột, rồi tới ngay cột kế.',
        'Ba cột giống nhau thì dùng vòng for cho gọn.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Bậc thang bay', hang: 'luyen', taoHam: ['glide'],
      deBai: 'Hành lang dốc xuống phía phải như cầu thang, rộng đúng một ô. Chương trình chính chỉ gọi glide(4). Em tự chế lệnh glide(n) để drone bay xuống n bậc: mỗi bậc sang phải một ô rồi xuống một ô.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi glide(4). Mở Xưởng hàm, tạo glide có đối số n rồi bấm Chạy.',
      san: SAN_4,
      batDau: { x: 0, y: 0, huong: 0 },
      bongMo: { x: 4, y: 4 },
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 4, nhip: 8 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [hGlide()] },
      loiGiaiKhac: {
        moTa: 'Không dùng đối số n: viết thẳng bốn lần go_right() và go_down()',
        baiLam: { chinh: C_4.slice() },
        hamCuaEmMoi: [hGlide(nhieu(['go_right()', 'go_down()'], ['go_right()', 'go_down()'], ['go_right()', 'go_down()'], ['go_right()', 'go_down()']))]
      },
      congThucKhac: [
        { moTa: 'Mỗi bậc gọi walk("RD")', hamCuaEmMoi: [hGlide(LAP('n', W('RD')))] },
        { moTa: 'Mỗi bậc gọi go("R") rồi go("D")', hamCuaEmMoi: [hGlide(LAP('n', ['go("R")', 'go("D")']))] }
      ],
      loiSai: [
        { moTa: 'Gọi glide(4) mà chưa chế hàm', baiLam: { chinh: C_4.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Hàm không dùng đối số n mà lặp cố định ba lần: drone dừng ở bậc thứ ba', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hGlide(LAP(3, ['go_right()', 'go_down()']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xuống trước rồi mới sang phải: drone đâm tường ngay ô đầu tiên', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hGlide(LAP('n', ['go_down()', 'go_right()']))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Quên go_down() trong mỗi bậc: drone đâm tường', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hGlide(LAP('n', 'go_right()'))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Mỗi bậc sang trái rồi xuống: drone bay ngược lại và đâm tường', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hGlide(LAP('n', ['go_left()', 'go_down()']))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] }
      ],
      goiY: ['Một bậc gồm hai việc: sang phải một ô, rồi xuống một ô. Cả cầu thang là n bậc như thế.',
        'Vòng for chạy n lần: số lần lấy từ đối số n của hàm.']
    }),

    man({
      so: 5, ten: 'Bay có sạc', hang: 'luyen', bat: true, taoHam: ['fly'], hamCuaEmCan: ['go', 'recharge'], nhipTheoLoiGiai: true,
      deBai: 'Ba sân giống nhau, chỉ khác pin: 7, 6 và 5. Chương trình chính chỉ gọi fly("RRRRRR"), phía trên đường bay có dải ô sạc P. Em tự chế lệnh fly(path): bay theo từng chữ của path, sau mỗi ô xét pin, pin thấp thì ghé ô sạc.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi fly("RRRRRR"). Mở Xưởng hàm, tạo fly có đối số path rồi bấm Chạy.',
      san: [SAN_5, SAN_5, SAN_5],
      pin: PIN_5,
      batDau: { x: 0, y: 1, huong: 0 },
      bongMo: [{ x: 6, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 1 }],
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 15, nhip: 26 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [hFly()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_5.slice() },
        hamCuaEmMoi: [hFly(nhieu(['# bay rồi xét pin'], T_FLY))]
      },
      congThucKhac: [
        { moTa: 'Xét pin trước khi bay mỗi ô (recharge() đặt đầu vòng lặp)', hamCuaEmMoi: [hFly(['for c in path:', '    recharge()', '    go(c)'])] },
        { moTa: 'Không gọi recharge(): tự viết if battery() < 2 ngay trong fly()', hamCuaEmMoi: [hFly(['for c in path:', '    go(c)', '    if battery() < 2:', '        go_up()', '        go_down()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi fly("RRRRRR") mà chưa chế hàm', baiLam: { chinh: C_5.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'fly() chỉ bay, không ghé sạc: hai sân ít pin hết pin trước bóng mờ', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hFly(['walk(path)'])], phaiCoMa: ['het-pin'] },
        { moTa: 'recharge() đặt ngoài vòng lặp: chỉ xét pin một lần, sau khi bay xong', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hFly(['for c in path:', '    go(c)', 'recharge()'])], phaiCoMa: ['het-pin'] },
        { moTa: 'Ngưỡng quá thấp (battery() < 1): tới lúc xét pin thì drone đã rơi', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hFly(['for c in path:', '    go(c)', '    if battery() < 1:', '        go_up()', '        go_down()'])], phaiCoMa: ['het-pin'] },
        { moTa: 'Ghé sạc xuống phía dưới thay vì lên phía trên: drone đâm mép sân rồi bay lạc lên dải ô sạc, dừng sai hàng', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hFly(['for c in path:', '    go(c)', '    if battery() < 3:', '        go_down()', '        go_up()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] }
      ],
      goiY: ['Em đã có go(d) để bay một ô và recharge() để ghé ô sạc khi pin dưới 3. Ghép chúng trong một vòng lặp.',
        'Vòng for đi qua từng chữ của path, như walk(). Xét pin sau mỗi ô.']
    }),

    man({
      so: 6, ten: 'Cẩu hàng', hang: 'luyen', nam: true, taoHam: ['airlift'], nhipTheoLoiGiai: true,
      deBai: 'Ba hộp sắt nằm sau hàng rào, drone đứng ngay trên hộp đầu. Chương trình chính chỉ gọi airlift(3) và xuống một ô giữa các lần. Em tự chế lệnh airlift(n): hút hộp, chở sang phải n ô, thả rồi bay về chỗ cũ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ gọi airlift(3) và go_down(). Mở Xưởng hàm, tạo airlift có đối số n rồi bấm Chạy.',
      san: SAN_6, vatChat: CHAT_6,
      batDau: { x: 0, y: 0, huong: 0 },
      bongMo: { x: 0, y: 2, vat: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_6.slice() },
      sao: { o: 11, nhip: 23 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [hAirlift()] },
      loiGiaiKhac: {
        moTa: 'Không dùng đối số n: viết thẳng ba lệnh go_right() và ba lệnh go_left()',
        baiLam: { chinh: C_6.slice() },
        hamCuaEmMoi: [hAirlift(nhieu(['magnet_n()', 'wait()'], lap('go_right()', 3), ['magnet_off()'], lap('go_left()', 3)))]
      },
      congThucKhac: [
        { moTa: 'Gọi go("R") và go("L") thay cho go_right() và go_left()', hamCuaEmMoi: [hAirlift(nhieu(['magnet_n()', 'wait()'], LAP('n', 'go("R")'), ['magnet_off()'], LAP('n', 'go("L")')))] },
        { moTa: 'Cực S cũng hút sắt; thả bằng nhịp riêng rồi mới bay về (chậm hơn một nhịp mỗi hộp)', hamCuaEmMoi: [hAirlift(nhieu(['magnet_s()', 'wait()'], LAP('n', 'go_right()'), ['magnet_off()', 'wait()'], LAP('n', 'go_left()')))] }
      ],
      loiSai: [
        { moTa: 'Gọi airlift(3) mà chưa chế hàm', baiLam: { chinh: C_6.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên bật nam châm: drone bay qua mà không hút, hộp nằm nguyên chỗ cũ', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hAirlift(nhieu(LAP('n', 'go_right()'), LAP('n', 'go_left()')))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên magnet_off(): hộp dính mãi dưới bụng drone', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hAirlift(nhieu(['magnet_n()', 'wait()'], LAP('n', 'go_right()'), LAP('n', 'go_left()')))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chở thiếu một ô: lặp n - 1 lần, hộp rơi vào ô trống không phải ô hộp mờ', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hAirlift(nhieu(['magnet_n()', 'wait()'], LAP('n - 1', 'go_right()'), ['magnet_off()'], LAP('n - 1', 'go_left()')))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chở có một ô: thả ngay trên hàng rào, hàng rào không nhận vật', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hAirlift(nhieu(['magnet_n()', 'wait()'], LAP(1, 'go_right()'), ['magnet_off()'], LAP(1, 'go_left()')))], phaiCoMa: ['tha-bi-chan', 'lech-bong-mo'] },
        { moTa: 'Chở hộp tới nơi rồi quên bay về: lần airlift kế tiếp bắt đầu sai chỗ', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hAirlift(nhieu(['magnet_n()', 'wait()'], LAP('n', 'go_right()'), ['magnet_off()', 'wait()']))], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Hút hộp dưới bụng, chở sang phải n ô, thả rồi bay về n ô: cần hai vòng lặp, một vòng go_right() và một vòng go_left().',
        'Lệnh magnet_off() thả hộp xuống ô dưới drone. Nhớ chờ một nhịp sau magnet_n() để nam châm kịp hút.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Đường về', hang: 'bien-the', hamCuaEmCan: ['hurdle', 'glide', 'go', 'walk'],
      deBai: 'Hàm go_out() của màn đưa drone từ nhà qua cột đá và cầu thang tới điểm ◆, nó bị khóa. Viết thân hàm come_back() của màn để drone bay về đúng nhà, như bóng mờ. Chương trình chỉ có 10 ô.',
      veMaMau: 'Chương trình chính bị khóa: go_out() rồi come_back(). Hàm go_out() cũng bị khóa, em chỉ xem được thân hàm. Thân hàm come_back() đang chỉ có dòng pass, nghĩa là chưa làm gì: em viết lệnh thay cho nó. Điểm ◆ là chỗ go_out() dừng.',
      san: SAN_7,
      batDau: { x: 0, y: 1, huong: 0 },
      bongMo: { x: 0, y: 1, diQua: [{ x: 4, y: 3 }] },       // ◆ ở chỗ go_out() dừng: chương trình rỗng hay go_out() hỏng không qua ◆, không thể "thắng" chỉ vì drone còn nguyên chỗ cũ
      chinhCoDinh: true, khoaHamMan: ['go_out'],
      maMau: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], T_COME_BACK_TRONG)] },
      sao: { o: 16, nhip: 16 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], T_COME_BACK)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], nhieu(['# làm ngược lại go_out()'], T_COME_BACK))] }
      },
      congThucKhac: [
        { moTa: 'Cả đường về là một chuỗi chỉ đường walk("ULULULLD")', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], [W('ULULULLD')])] } },
        { moTa: 'Viết thẳng tám lệnh bay, không dùng vòng for', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], ['go_up()', 'go_left()', 'go_up()', 'go_left()', 'go_up()', 'go_left()', 'go_left()', 'go_down()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: drone vẫn đứng ở điểm ◆, chưa về nhà', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], T_COME_BACK_TRONG)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đảo thứ tự nhưng quên đổi hướng: drone bay xuống và sang phải, đâm mép sân', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], nhieu(LAP(3, ['go_down()', 'go_right()']), ['go_right()', 'go_up()']))] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Đổi hướng nhưng giữ thứ tự cũ (hurdle rồi glide): drone đâm tường ngay những lệnh đầu', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], ['go_down()', 'go_left()', 'go_left()', 'go_up()', 'go_left()', 'go_up()', 'go_left()', 'go_up()'])] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Thiếu lệnh go_left() ở cuối đoạn cầu thang: drone dừng lệch một hàng', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT), H('come_back', [], nhieu(LAP(3, ['go_up()', 'go_left()']), ['go_down()']))] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Xóa mất hàm come_back() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', [], T_GO_OUT)] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Làm ngược lại go_out() từng bước, theo thứ tự ngược: bước cuối của go_out() là bước đầu của đường về.',
        'Mỗi lệnh có một lệnh ngược: lên thì xuống, phải thì trái. Bậc thang và cột đá cũng bay theo chiều ngược lại.']
    }),

    man({
      so: 8, ten: 'Sạc ở phía dưới', hang: 'bien-the', bat: true, pin: 4, nhipTheoLoiGiai: true, hamCuaEmCan: ['go'],
      deBai: 'Pin yếu, chỉ có 4, và dải ô sạc P chạy suốt phía dưới đường bay. Hàm safe_fly(path) của màn cứ bay lên mỗi khi pin thấp nên không ghé được ô sạc. Sửa nó để drone tới bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa: safe_fly("RRRRRR"). Chạy thử, xem drone dừng ở đâu rồi sửa thân hàm safe_fly của màn.',
      san: SAN_8,
      batDau: { x: 0, y: 0, huong: 0 },
      bongMo: { x: 6, y: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice(), hamCuaMan: [H('safe_fly', ['path'], T_SAFE_FLY_SAI)] },
      sao: { o: 14, nhip: 10 },
      loiGiai: { chinh: C_8.slice(), hamCuaMan: [H('safe_fly', ['path'], T_SAFE_FLY)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_8.slice(), hamCuaMan: [H('safe_fly', ['path'], nhieu(['# ghé ô sạc phía dưới'], T_SAFE_FLY))] }
      },
      congThucKhac: [
        { moTa: 'Xét pin trước khi bay mỗi ô, ô sạc vẫn ở phía dưới', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('safe_fly', ['path'], ['for c in path:', '    if battery() < 2:', '        go_down()', '        go_up()', '    go(c)'])] } },
        { moTa: 'Bay dọc dải ô sạc: xuống hàng sạc, bay hết đường, rồi lên lại', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('safe_fly', ['path'], ['go_down()', 'for c in path:', '    go(c)', 'go_up()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên safe_fly(): drone bay lên đâm mép sân, pin cạn nên rơi', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('safe_fly', ['path'], T_SAFE_FLY_SAI)] }, phaiCoMa: ['dam-tuong', 'het-pin'] },
        { moTa: 'Bỏ phần ghé sạc: bay một mạch thì pin chỉ đủ bốn ô', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('safe_fly', ['path'], ['for c in path:', '    go(c)'])] }, phaiCoMa: ['het-pin'] },
        { moTa: 'Đổi hai lệnh thành go_down() hai lần: drone ở lại hàng sạc, đâm mép sân và dừng sai hàng', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('safe_fly', ['path'], ['for c in path:', '    go(c)', '    if battery() < 2:', '        go_down()', '        go_down()'])] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Đổi chỗ hai lệnh nhưng ngưỡng battery() < 1: tới lúc xét pin thì drone đã rơi', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('safe_fly', ['path'], ['for c in path:', '    go(c)', '    if battery() < 1:', '        go_down()', '        go_up()'])] }, phaiCoMa: ['het-pin'] },
        { moTa: 'Xóa mất hàm safe_fly() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_8.slice(), hamCuaMan: [] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Chạy thử và xem drone nằm ở hàng nào lúc dừng. Ô sạc P nằm ở phía nào của đường bay?',
        'Muốn ghé ô sạc ở phía dưới thì phải bay xuống trước, rồi mới bay lên lại.']
    }),

    man({
      so: 9, ten: 'Cánh xuống hỏng', hang: 'bien-the', bat: true, pin: 5, hamGoc: BAY_HONG, phanCung: BAY_HONG, canhBao: 'Cánh bay xuống hỏng', hamCuaEmCan: ['go', 'walk', 'recharge'],
      deBai: 'Cánh bay xuống của drone hỏng, go_down() không chạy được, nên recharge() cũng hỏng. May là ô sạc P nằm ngay trên đường bay lên cầu thang. Sửa fixed_fly(path) của màn để drone tới bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa: fixed_fly("RRURRURR"). Hàm fixed_fly(path) của màn đang gọi recharge() mà recharge() cần go_down(): chạy thử, xem lệnh nào bị báo hỏng rồi sửa thân hàm.',
      san: SAN_9,
      batDau: { x: 0, y: 2, huong: 0 },
      bongMo: { x: 6, y: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_9.slice(), hamCuaMan: [H('fixed_fly', ['path'], T_FIXED_FLY_CU)] },
      sao: { o: 11, nhip: 8 },
      loiGiai: { chinh: C_9.slice(), hamCuaMan: [H('fixed_fly', ['path'], T_FIXED_FLY)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fixed_fly', ['path'], nhieu(['# cánh xuống hỏng, bỏ recharge()'], T_FIXED_FLY))] }
      },
      congThucKhac: [
        { moTa: 'fixed_fly() chỉ gọi walk(path)', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fixed_fly', ['path'], ['walk(path)'])] } },
        { moTa: 'Mỗi chữ rẽ nhánh bằng if: R thì go_right(), U thì go_up()', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fixed_fly', ['path'], ['for c in path:', '    if c == "R":', '        go_right()', '    elif c == "U":', '        go_up()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên fixed_fly(): recharge() cần go_down() nên báo cánh hỏng', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fixed_fly', ['path'], T_FIXED_FLY_CU)] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Thay recharge() bằng go_up() rồi go_down() viết thẳng: go_down() vẫn hỏng', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fixed_fly', ['path'], ['for c in path:', '    go(c)', '    if battery() < 3:', '        go_up()', '        go_down()'])] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Chỉ bay lên khi pin thấp mà không xuống: drone đâm tường rồi hết pin', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fixed_fly', ['path'], ['for c in path:', '    go(c)', '    if battery() < 3:', '        go_up()'])] }, phaiCoMa: ['dam-tuong', 'het-pin'] },
        { moTa: 'Bỏ vòng lặp, đưa cả chuỗi vào go(): không nhánh nào khớp nên drone đứng yên', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('fixed_fly', ['path'], ['go(path)'])] }, phaiCoMa: ['drone-khong-bay', 'lech-bong-mo'] },
        { moTa: 'Xóa mất hàm fixed_fly() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_9.slice(), hamCuaMan: [] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Cánh xuống hỏng thì recharge() chạy hỏng. Đường bay đã đi qua ô sạc P rồi, drone có cần ghé thêm không?',
        'Sửa fixed_fly(path): bỏ những lệnh dùng cánh đã hỏng.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Kho hàng trên cao', hang: 'trum', nam: true, gioiHanHam: 3, nhipTheoLoiGiai: true, hamCuaEmCan: ['hurdle', 'glide', 'airlift'],
      huyHieu: { ma: 'che-drone', ten: 'Huy hiệu Chế lệnh drone' },
      deBai: 'Hai hộp sắt nằm dưới chân bậc thang, sau hàng rào là hai ô trống dành cho hộp mờ. Tự viết chương trình chính đưa hai hộp tới hộp mờ rồi để drone đứng ở chỗ bóng mờ. Em chỉ được gọi tối đa 3 hàm của em khác nhau.',
      veMaMau: 'Chương trình chính còn trống. Chạm ảnh drone mờ để xem drone sẽ đứng ở đâu.',
      san: SAN_10, vatChat: CHAT_10,
      batDau: { x: 0, y: 1, huong: 0 },
      bongMo: { x: 4, y: 4, vat: [{ x: 6, y: 3 }, { x: 6, y: 4 }] },
      maMau: { chinh: [] },
      sao: { o: 19, nhip: 19 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: {
        moTa: 'Vòng qua cột bằng walk("URRD") (dài hơn nhiều ô vì walk gọi cả go)',
        baiLam: { chinh: [W('URRD'), 'glide(2)', 'airlift(2)', 'go_down()', 'airlift(2)'] }
      },
      congThucKhac: [
        { moTa: 'Xuống hai bậc bằng walk("RDRD")', baiLam: { chinh: ['hurdle()', W('RDRD'), 'airlift(2)', 'go_down()', 'airlift(2)'] } },
        { moTa: 'Chở hộp dưới trước, hộp trên sau rồi xuống lại một ô', baiLam: { chinh: ['hurdle()', 'glide(2)', 'go_down()', 'airlift(2)', 'go_up()', 'airlift(2)', 'go_down()'] } }
      ],
      loiSai: [
        { moTa: 'Không vòng qua cột đá: drone đâm cột, không tới được hộp', baiLam: { chinh: ['glide(2)', 'airlift(2)', 'go_down()', 'airlift(2)'] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Mới chở hộp thứ nhất: hộp thứ hai nằm nguyên chỗ cũ', baiLam: { chinh: ['hurdle()', 'glide(2)', 'airlift(2)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên go_down(): hai lần airlift ở cùng một ô nên hộp thứ hai không được chở', baiLam: { chinh: ['hurdle()', 'glide(2)', 'airlift(2)', 'airlift(2)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chở một ô thay vì hai: hộp bị thả ngay trên hàng rào, hàng rào không nhận vật', baiLam: { chinh: ['hurdle()', 'glide(2)', 'airlift(1)', 'go_down()', 'airlift(1)'] }, phaiCoMa: ['tha-bi-chan', 'lech-bong-mo'] },
        { moTa: 'Gọi 4 hàm khác nhau (hurdle, glide, airlift, go): vượt giới hạn 3 hàm', baiLam: { chinh: ['hurdle()', 'glide(2)', 'airlift(2)', 'go("D")', 'airlift(2)'] }, phaiCoMa: ['qua-gioi-han-ham'] }
      ],
      goiY: ['Đường đi có cột đá, rồi bậc thang, rồi chở hộp: em đã chế một lệnh cho từng việc đó.',
        'Hộp thứ hai nằm ngay dưới hộp thứ nhất. Chở xong hộp đầu thì drone đã về ô cũ, chỉ cần xuống một ô.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();

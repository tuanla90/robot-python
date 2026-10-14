/* ============================================================================
   man-drone.js — "Đường học": CHƯƠNG `drone` · DRONE (10 màn).
   Robot là DRONE (loaiRobot 'drone'): robot { than: 'drone', tay: null | 'nam-cham', camBien: [] | [{ ma: 'pin', o: 'than' }] }.
   LUẬT ĐÃ CHỐT (đầy đủ ở san-hoc.js, phần DRONE):
   - Bốn lệnh bay CÙNG TÊN với nhện: go_up / go_down / go_left / go_right (theo màn hình), wait() lơ lửng. Mỗi lệnh bay đúng 1 ô và tự tốn đúng 1 NHỊP
     (nhện: 2 nhịp / ô), không cần wait() sau nó. Nên hàm go(d) và walk(path) em viết ở chương nhện CHẠY ĐƯỢC trên drone mà không sửa (màn 2).
   - BAY QUA hàng rào thấp (=), băng chuyền (băng không đẩy drone), vật nằm đất, thùng nặng, bậc thang S. Không qua tường cao (#), cửa đóng, mép sân.
   - PIN (màn khai pin): mỗi nhịp bay tốn 1 pin, kể cả wait() và nhịp đâm tường; về 0 mà chưa tới đích thì drone hạ cánh khẩn (het-pin). Ô sạc P:
     cuối nhịp drone đang ở trên P thì pin đầy lại. battery() (từ màn 5) trả pin còn lại, không tốn nhịp.
   - NAM CHÂM TREO dưới bụng (từ màn 7): magnet_on() / magnet_off() chỉ ra lệnh, làm ở nhịp kế (go_*() hay wait()). Hút vật SẮT ở ô ngay DƯỚI drone (cuối nhịp),
     thả vật xuống ô ngay dưới drone (đầu nhịp, trước khi bay) nếu ô đó nhận được (không phải hàng rào, vật khác, bậc thang). Vật gỗ không hút (hut-go).
     Lời giải chuẩn viết "magnet_on()  wait()" / "magnet_off()  wait()" (nhịp riêng) nên các màn nam châm khai nhipTheoLoiGiai; kiem-drone.mjs kiểm BFS "tách nhịp" = sao.nhip.
   - Mục tiêu: tới cờ (1–6); đưa vật sắt lên ô đích (7–10, mucTieu 'dua-vat' + vatCan 'sat').

   Hàm của em MỚI (tên cốt truyện, bị khóa trong kho, xem KhoHam.datTenCoDinh):
     drone.5   recharge() = if battery() < 3: go_up(), go_down()     (3 ô)   ghé ô sạc ngay phía trên khi pin thấp
     drone.10  ship(path) = magnet_on(), wait(), walk(path), magnet_off(), wait()   (5 ô)   hút vật dưới bụng, bay theo path, thả
   Hàm CỦA MÀN (tạm): màn 8 cho sẵn ferry(path) thả vật TRƯỚC khi bay (sai thứ tự).
   Dùng lại hàm go(d), walk(path) của chương nhện (hamCuaEmCan ['go', 'walk'] ở màn 2, 8, 9, 10).

   Nhiều sân: màn 6 (3 sân cùng bản đồ, pin 7, 5, 4; san là mảng sân, batDau và pin là mảng song song, nhipTheo 'tong'); các màn còn lại một sân.
   cauTruc ['for', 'if', 'while'] (đã học đủ). canHam 'tran-khung' ở màn 10: không dùng ship() thì tràn khung 10 ô.

   Nối tiếp man-sung-bong.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-sung-bong.js') : window.ManHoc;

  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var NC = ['magnet_on', 'magnet_off'];

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }

  // thân các hàm của chương
  var T_RECHARGE = ['if battery() < 3:', '    go_up()', '    go_down()'];
  function hRecharge(than) { return H('recharge', [], than || T_RECHARGE); }
  var T_SHIP = ['magnet_on()', 'wait()', 'walk(path)', 'magnet_off()', 'wait()'];
  function hShip(than) { return H('ship', ['path'], than || T_SHIP); }
  // 8: ferry(path) của màn thả vật TRƯỚC khi bay
  var T_FERRY_SAI = ['magnet_on()', 'wait()', 'magnet_off()', 'wait()', 'walk(path)'];
  var T_FERRY = ['magnet_on()', 'wait()', 'walk(path)', 'magnet_off()', 'wait()'];
  function hFerry(than) { return H('ferry', ['path'], than || T_FERRY); }

  /**
   * m.pin: pin (số hay mảng song song với san). m.nam: true thì có nam châm treo. m.bat: true thì có battery().
   * Các trường nam, bat bị bỏ sau khi dùng. Màn nhiều sân tự có nhipTheo 'tong' và batDau song song.
   */
  function man(m) {
    var nam = m.nam, bat = m.bat;
    delete m.nam; delete m.bat;
    m.chuong = 'drone';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: nam ? 'nam-cham' : null, camBien: bat ? [{ ma: 'pin', o: 'than' }] : [] };
    m.hamGoc = nhieu(BAY, nam ? NC : [], bat ? ['battery'] : []);
    if (nam) { m.mucTieu = 'dua-vat'; m.vatCan = 'sat'; m.nhipTheoLoiGiai = true; }
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  /** Đi theo chuỗi chữ bằng walk(): một dòng. */
  function W(chuoi) { return 'walk("' + chuoi + '")'; }

  /* ------------------------------------------------------------------- sân */

  var BD0 = { x: 0, y: 0, huong: 0 };
  var BD1 = { x: 0, y: 1, huong: 0 };
  // 1: hành lang gấp khúc, hàng rào ở (2,0), làn băng NGƯỢC chiều đi ở cột 4 (xe bánh hay nhện đi xuống sẽ bị đẩy lùi)
  var SAN_1 = ['..=..', '####^', '####^', '####F'];
  // 2: hành lang dài hơn: hàng rào, làn băng ngược chiều (đi sang trái ngược mũi tên >)
  var SAN_2 = ['..=..', '####^', 'F>>>.'];
  // 3: hai hàng rào chắn đường thẳng, đường vòng trên hàng trên dài hơn pin
  var SAN_3 = ['.......', '.=.=..F', '.......'];
  // 4: một ngách có ô sạc P ngay trên ô thứ 3 của hành lang
  var SAN_4 = ['##P####', '......F', '#######'];
  // 5, 6: hai ngách sạc ở cột 2 và 4
  var SAN_5 = ['##P#P##', '......F', '#######'];
  // 7: vật sắt ở (2,1), hàng rào ở (3,1), ô đích ở (6,1)
  var SAN_7 = ['#######', '..o=..D', '#######'];
  var CHAT_7 = ['.......', '..s....', '.......'];
  // 8: hai vật sắt ở (1,1) và (5,1); hai ô đích nằm trong hai ngách phía trên, ở (3,0) và (5,0)
  var SAN_8 = ['###D#D#', '.o...o.'];
  var CHAT_8 = ['.......', '.s...s.'];
  // 9: vật sắt (2,1), vật GỖ (3,1), vật sắt thứ hai nằm trên làn băng (4,1) (vatThem); đích ở (2,0) và (4,0)
  var SAN_9 = ['##D#D##', '..oo>..'];
  var CHAT_9 = ['.......', '..s....'];
  var THEM_9 = [{ x: 4, y: 1, chat: 'sat' }];
  // 10: ngách sạc P ở (1,0), hai ô đích ở (3,0) và (5,0); hai vật sắt ở (2,2) và (4,2), một vật gỗ ở (6,2); rào ở (2,1), (4,1), băng ở (3,1)
  var SAN_10 = ['#P#D#D#', '..=>=..', '..o.o.o', '#######'];
  var CHAT_10 = ['.......', '.......', '..s.s..', '.......'];

  /* ------------------------------------------------------------- chương trình dùng lại */

  // 5, 6: ba vòng "bay hai ô, ghé sạc nếu pin thấp"
  var CHINH_5 = LAP(3, ['go_right()', 'go_right()', 'recharge()']);
  var CHINH_5_KHAC = ['go_right()', 'go_right()', 'recharge()', 'go_right()', 'go_right()', 'recharge()', 'go_right()', 'go_right()'];
  // 7: bay tới trên vật, hút; bay qua rào tới ô đích, thả
  var CHINH_7 = nhieu(LAP(2, 'go_right()'), ['magnet_on()', 'wait()'], LAP(4, 'go_right()'), ['magnet_off()', 'wait()']);
  var CHINH_7_KHAC = nhieu(lap('go_right()', 2), ['magnet_on()', 'wait()'], lap('go_right()', 4), ['magnet_off()', 'wait()']);
  // 8
  var CHINH_8 = [W('R'), 'ferry("RRU")', W('DRR'), 'ferry("U")'];
  var CHINH_8_KHAC = [W('R'), 'ferry("RRU")', W('D'), W('RR'), 'ferry("U")'];
  // 9: bay tới trên vật sắt thứ nhất, rồi lặp hai lần: hút, lên ô đích, thả, xuống và sang vật kế
  var CHINH_9 = nhieu([W('RR')], LAP(2, ['magnet_on()', 'wait()', 'go_up()', 'magnet_off()', 'wait()', W('DRR')]));
  var CHINH_9_KHAC = nhieu([W('R'), W('R')], LAP(2, ['magnet_on()', 'wait()', 'go_up()', 'magnet_off()', 'wait()', W('DRR')]));
  // 10: tới vật 1, chuyến 1 qua ô sạc (U L U D R R U), tới vật 2, chuyến 2
  var CHINH_10 = [W('RRD'), 'ship("ULUDRRU")', W('DRD'), 'ship("URU")'];
  var CHINH_10_KHAC = [W('RR'), W('D'), 'ship("ULUDRRU")', W('DRD'), 'ship("URU")'];

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Bay qua rào', hang: 'lam-quen',
      deBai: 'Drone bay trên cao: go_up(), go_down(), go_left(), go_right() bay một ô, mất một nhịp. Drone bay qua được hàng rào thấp (=) và băng chuyền, nhưng không qua được tường cao (#). Đưa drone tới cờ.',
      veMaMau: 'Chương trình có sẵn mới bay được ba ô sang phải. Chạy thử, xem drone dừng ở đâu rồi viết tiếp.',
      san: SAN_1, batDau: BD0,
      maMau: { chinh: LAP(3, 'go_right()') },
      sao: { o: 4, nhip: 7 },
      loiGiai: { chinh: nhieu(LAP(4, 'go_right()'), LAP(3, 'go_down()')) },
      loiGiaiKhac: { moTa: 'Viết từng lệnh một, không dùng vòng lặp', baiLam: { chinh: nhieu(lap('go_right()', 4), lap('go_down()', 3)) } },
      loiSai: [
        { moTa: 'Bay xuống thiếu một ô: drone dừng sát cờ', baiLam: { chinh: nhieu(LAP(4, 'go_right()'), LAP(2, 'go_down()')) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bay xuống trước khi sang phải: drone đâm vào tường cao', baiLam: { chinh: nhieu(LAP(3, 'go_down()'), LAP(4, 'go_right()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Dùng lệnh của xe bánh, drone không có lệnh đó', baiLam: { chinh: ['left_move()', 'right_move()', 'wait()'] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Hàng rào và làn băng không cản được drone: cứ bay thẳng qua.',
        'Đếm số ô cần bay theo từng hướng rồi lặp lệnh đúng số lần.']
    }),

    man({
      so: 2, ten: 'Dùng lại walk()', hang: 'lam-quen', hamCuaEmCan: ['go', 'walk'],
      deBai: 'Hàm go(d) và walk(path) em viết cho nhện cũng chạy được trên drone, vì drone dùng cùng các lệnh go_*(). Gọi walk() với chuỗi chỉ đường (U lên, D xuống, L trái, R phải) để đưa drone tới cờ. Drone bay một ô mất một nhịp, nhanh gấp đôi nhện.',
      veMaMau: 'Chương trình có sẵn mới đưa drone tới đầu đoạn đi xuống. Sửa chuỗi để drone đi hết đường tới cờ.',
      san: SAN_2, batDau: BD0,
      maMau: { chinh: [W('RRRR')] },
      sao: { o: 11, nhip: 10 },
      loiGiai: { chinh: [W('RRRRDDLLLL')] },
      loiGiaiKhac: { moTa: 'Chia đường đi làm ba đoạn walk()', baiLam: { chinh: [W('RRRR'), W('DD'), W('LLLL')] } },
      loiSai: [
        { moTa: 'Viết chuỗi bằng chữ thường: drone không hiểu chữ nào nên đứng im', baiLam: { chinh: [W('rrrrddllll')] }, phaiCoMa: ['drone-khong-bay', 'chua-toi-co'] },
        { moTa: 'Thiếu chữ cuối cùng: drone dừng sát cờ', baiLam: { chinh: [W('RRRRDDLLL')] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Nhầm chữ cuối thành U: drone đâm tường', baiLam: { chinh: [W('RRRRDDLLLU')] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên dấu nháy quanh chuỗi', baiLam: { chinh: ['walk(RRRRDDLLLL)'] }, phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['Mỗi chữ trong chuỗi là một ô: đếm các đoạn thẳng của đường đi.',
        'Chuỗi viết trong ngoặc kép, chữ HOA: "U", "D", "L", "R".']
    }),

    man({
      so: 3, ten: 'Pin có hạn', hang: 'lam-quen', pin: 7,
      deBai: 'Drone chạy bằng pin: mỗi nhịp bay, kể cả khi lơ lửng đứng yên (wait()), tốn 1 pin; hết pin thì drone rơi xuống và dừng. Màn này pin chỉ có 7. Chọn đường đủ pin tới cờ.',
      veMaMau: 'Chương trình có sẵn bay vòng lên hàng trên để né hàng rào. Chạy thử, xem pin còn bao nhiêu khi tới đó.',
      san: SAN_3, batDau: BD1,
      maMau: { chinh: nhieu(['go_up()'], LAP(6, 'go_right()')) },
      sao: { o: 2, nhip: 6 },
      loiGiai: { chinh: LAP(6, 'go_right()') },
      loiGiaiKhac: { moTa: 'Viết từng lệnh một, không dùng vòng lặp', baiLam: { chinh: lap('go_right()', 6) } },
      loiSai: [
        { moTa: 'Bay vòng trên hàng trên để né hàng rào: tốn 8 nhịp, hết pin', baiLam: { chinh: nhieu(['go_up()'], LAP(6, 'go_right()'), ['go_down()']) }, phaiCoMa: ['het-pin'] },
        { moTa: 'Chen hai wait() vào đường thẳng: lơ lửng cũng tốn pin nên hết pin trước cờ', baiLam: { chinh: nhieu(['wait()', 'wait()'], LAP(6, 'go_right()')) }, phaiCoMa: ['het-pin'] },
        { moTa: 'Bay thiếu một ô: drone dừng sát cờ', baiLam: { chinh: LAP(5, 'go_right()') }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Mỗi nhịp tốn 1 pin, nên đường càng ngắn càng đủ pin.',
        'Drone bay qua được hàng rào: không cần vòng.']
    }),

    /* ------------------------------------------------------------- hàng 2: luyện */
    man({
      so: 4, ten: 'Ghé ô sạc', hang: 'luyen', pin: 5,
      deBai: 'Ô có chữ P là ô sạc: cuối nhịp mà drone đang ở trên ô P thì pin đầy lại. Pin chỉ có 5, còn cờ cách xa hơn. Ghé ô sạc giữa đường rồi bay tiếp.',
      veMaMau: 'Chương trình có sẵn bay thẳng một mạch. Chạy thử, xem drone dừng ở đâu vì sao.',
      san: SAN_4, batDau: BD1,
      maMau: { chinh: LAP(6, 'go_right()') },
      sao: { o: 6, nhip: 8 },
      loiGiai: { chinh: nhieu(LAP(2, 'go_right()'), ['go_up()', 'go_down()'], LAP(4, 'go_right()')) },
      loiGiaiKhac: { moTa: 'Viết từng lệnh một, không dùng vòng lặp', baiLam: { chinh: nhieu(lap('go_right()', 2), ['go_up()', 'go_down()'], lap('go_right()', 4)) } },
      loiSai: [
        { moTa: 'Bay thẳng, không ghé ô sạc: hết pin trước cờ', baiLam: { chinh: LAP(6, 'go_right()') }, phaiCoMa: ['het-pin'] },
        { moTa: 'Ghé muộn ở cột 4: ở đó là tường, và pin đã cạn', baiLam: { chinh: nhieu(LAP(4, 'go_right()'), ['go_up()', 'go_down()'], LAP(2, 'go_right()')) }, phaiCoMa: ['dam-tuong', 'het-pin'] },
        { moTa: 'Ghé ô sạc nhưng không bay xuống lại: drone bị kẹt ngách và đâm tường', baiLam: { chinh: nhieu(LAP(2, 'go_right()'), ['go_up()'], LAP(4, 'go_right()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Ghé sạc rồi bay thiếu một ô: drone dừng sát cờ', baiLam: { chinh: nhieu(LAP(2, 'go_right()'), ['go_up()', 'go_down()'], LAP(3, 'go_right()')) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Ô sạc nằm trong ngách phía trên ô thứ ba của hành lang. Bay vào đó rồi quay ra, pin đầy lại.',
        'Đếm pin: 5 pin bay được tối đa 5 nhịp. Ghé sạc ở ô nào thì còn đủ?']
    }),

    man({
      so: 5, ten: 'Hàm recharge()', hang: 'luyen', canHam: 'tran-khung', pin: 5, bat: true, taoHam: ['recharge'],
      deBai: 'battery() cho biết pin còn lại và không tốn nhịp. Tạo hàm recharge(): nếu battery() nhỏ hơn 3 thì bay lên ô sạc ngay phía trên rồi bay xuống. Dùng nó mỗi lần bay xong hai ô để tới cờ.',
      veMaMau: 'Chương trình có sẵn bay từng đôi ô nhưng chưa có hàm recharge(). Chạy thử, xem pin cạn ở đâu rồi tạo hàm.',
      san: SAN_5, batDau: BD1,
      maMau: { chinh: LAP(3, ['go_right()', 'go_right()']) },
      sao: { o: 7, nhip: 8 },
      loiGiai: { chinh: CHINH_5.slice(), hamCuaEmMoi: [hRecharge()] },
      loiGiaiKhac: { moTa: 'Viết từng lệnh một, không dùng vòng lặp', baiLam: { chinh: CHINH_5_KHAC.slice() }, hamCuaEmMoi: [hRecharge()] },
      loiSai: [
        { moTa: 'Gọi recharge() mà chưa tạo hàm', baiLam: { chinh: CHINH_5.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'recharge() không xét pin, lần nào cũng ghé sạc: vẫn tới cờ nhưng thừa nhịp', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hRecharge(['go_up()', 'go_down()'])], phaiCoMa: [] },
        { moTa: 'Ngưỡng quá thấp (battery() < 1): tới lúc kiểm tra pin đã cạn', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hRecharge(['if battery() < 1:', '    go_up()', '    go_down()'])], phaiCoMa: ['het-pin'] },
        { moTa: 'recharge() bay xuống thay vì bay lên: ở đó là tường', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hRecharge(['if battery() < 3:', '    go_down()', '    go_up()'])], phaiCoMa: ['dam-tuong', 'het-pin'] },
        { moTa: 'Quên dấu hai chấm sau điều kiện if', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hRecharge(['if battery() < 3', '    go_up()', '    go_down()'])], phaiCoMa: ['loi-cu-phap'] }
      ],
      goiY: ['battery() trả một số. So sánh nó với 3 bằng dấu < trong câu lệnh if.',
        'Ô sạc nằm ngay phía trên chỗ drone dừng sau 2 ô và sau 4 ô: bay lên một ô rồi xuống một ô.']
    }),

    man({
      so: 6, ten: 'Ba mức pin', hang: 'luyen', bat: true, hamCuaEmCan: ['recharge'],
      pin: [7, 5, 4],
      deBai: 'Ba sân giống nhau nhưng pin khác nhau: 7, 5 và 4. Một chương trình phải thắng cả ba: sân nhiều pin thì bay thẳng, sân ít pin mới ghé ô sạc. Số nhịp tính theo tổng ba sân.',
      veMaMau: 'Chương trình có sẵn bay thẳng bằng cặp go_right(). Chạy thử, xem sân nào hết pin.',
      san: [SAN_5, SAN_5, SAN_5], batDau: BD1,
      maMau: { chinh: LAP(3, ['go_right()', 'go_right()']) },
      sao: { o: 7, nhip: 24 },
      loiGiai: { chinh: CHINH_5.slice() },
      loiGiaiKhac: { moTa: 'Viết từng lệnh một, không dùng vòng lặp', baiLam: { chinh: CHINH_5_KHAC.slice() } },
      loiSai: [
        { moTa: 'Bay thẳng, không ghé sạc: sân ít pin hết pin trước cờ', baiLam: { chinh: LAP(6, 'go_right()') }, phaiCoMa: ['het-pin'] },
        { moTa: 'Ghé sạc cố định sau 2 ô: sân ít pin nhất vẫn hết pin trước cờ', baiLam: { chinh: nhieu(LAP(2, 'go_right()'), ['go_up()', 'go_down()'], LAP(4, 'go_right()')) }, phaiCoMa: ['het-pin'] },
        { moTa: 'recharge() không xét pin: sân nào cũng ghé sạc hai lần, thắng nhưng thừa nhịp', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hRecharge(['go_up()', 'go_down()'])], phaiCoMa: [] },
        { moTa: 'Ngưỡng quá thấp (battery() < 1): sân ít pin hết pin trước khi kịp ghé sạc', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hRecharge(['if battery() < 1:', '    go_up()', '    go_down()'])], phaiCoMa: ['het-pin'] }
      ],
      goiY: ['Sân nhiều pin thì không cần ghé sạc: để battery() quyết định có ghé hay không.',
        'Mỗi sân chạy cùng một chương trình; chỉ pin ban đầu khác nhau.']
    }),

    /* ------------------------------------------------------------- hàng 3: biến thể */
    man({
      so: 7, ten: 'Nam châm treo', hang: 'bien-the', nam: true,
      deBai: 'Nam châm treo dưới bụng drone: magnet_on() bật, magnet_off() tắt, và cũng cần wait() cho nhịp trôi. Nó hút vật sắt nằm ngay dưới drone, và thả vật xuống ô ngay dưới drone. Hút vật sắt, bay qua hàng rào, thả vật lên ô đích D.',
      veMaMau: 'Chương trình có sẵn mới bay tới trên vật sắt và hút nó. Chạy thử rồi viết tiếp.',
      san: SAN_7, vatChat: CHAT_7, batDau: BD1,
      maMau: { chinh: nhieu(LAP(2, 'go_right()'), ['magnet_on()', 'wait()']) },
      sao: { o: 8, nhip: 8 },
      loiGiai: { chinh: CHINH_7.slice() },
      loiGiaiKhac: { moTa: 'Viết từng lệnh bay một, không dùng vòng lặp', baiLam: { chinh: CHINH_7_KHAC.slice() } },
      loiSai: [
        { moTa: 'Quên bật nam châm: drone bay qua vật mà không hút', baiLam: { chinh: nhieu(LAP(2, 'go_right()'), LAP(4, 'go_right()'), ['magnet_off()', 'wait()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả khi đang ở trên hàng rào: hàng rào không nhận vật', baiLam: { chinh: nhieu(LAP(2, 'go_right()'), ['magnet_on()', 'wait()', 'go_right()', 'magnet_off()', 'wait()']) }, phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] },
        { moTa: 'Thả sớm một ô: vật rơi xuống ô trống chưa phải ô đích', baiLam: { chinh: nhieu(LAP(2, 'go_right()'), ['magnet_on()', 'wait()'], LAP(3, 'go_right()'), ['magnet_off()', 'wait()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên magnet_off(): vật vẫn dính dưới bụng drone', baiLam: { chinh: nhieu(LAP(2, 'go_right()'), ['magnet_on()', 'wait()'], LAP(4, 'go_right()')) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thiếu wait() sau magnet_off(): lệnh thả chưa kịp chạy', baiLam: { chinh: nhieu(LAP(2, 'go_right()'), ['magnet_on()', 'wait()'], LAP(4, 'go_right()'), ['magnet_off()']) }, phaiCoMa: ['quen-wait', 'chua-dua-vat'] },
        { moTa: 'magnet_on() và magnet_off() cùng một nhịp: lệnh sau bị bỏ', baiLam: { chinh: nhieu(LAP(2, 'go_right()'), ['magnet_on()', 'magnet_off()', 'wait()']) }, phaiCoMa: ['magnet-goi-lai', 'chua-dua-vat'] }
      ],
      goiY: ['Nam châm chỉ hút vật nằm ngay dưới bụng drone: bay tới đúng ô có vật rồi mới bật.',
        'Vật rơi xuống ô ngay dưới drone khi tắt nam châm: drone phải đang ở trên ô đích. Hàng rào không nhận vật.']
    }),

    man({
      so: 8, ten: 'Sửa hàm ferry()', hang: 'bien-the', nam: true, hamCuaEmCan: ['go', 'walk'],
      deBai: 'Hàm ferry(path) của màn phải hút vật dưới bụng, bay theo path rồi thả vật. Nhưng hai vật cứ nằm nguyên chỗ cũ. Sửa hàm ferry để hai vật sắt tới hai ô đích.',
      veMaMau: 'Chạy thử: sau mỗi lần ferry() vật vẫn nằm chỗ cũ. Xem thứ tự các dòng trong hàm ferry.',
      san: SAN_8, vatChat: CHAT_8, batDau: BD1,
      maMau: { chinh: CHINH_8.slice(), hamCuaMan: [hFerry(T_FERRY_SAI)] },
      sao: { o: 19, nhip: 12 },
      loiGiai: { chinh: CHINH_8.slice(), hamCuaMan: [hFerry()] },
      loiGiaiKhac: { moTa: 'Sửa như vậy, đoạn walk("DRR") chia làm hai lần gọi', baiLam: { chinh: CHINH_8_KHAC.slice(), hamCuaMan: [hFerry()] } },
      loiSai: [
        { moTa: 'Chưa sửa gì: ferry() thả vật ngay chỗ cũ rồi mới bay', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hFerry(T_FERRY_SAI)] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xóa hai dòng thả: vật dính theo drone nhưng không bao giờ rơi xuống đích', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hFerry(['magnet_on()', 'wait()', 'walk(path)'])] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả bằng magnet_off() mà thiếu wait(): lần thả cuối không kịp chạy', baiLam: { chinh: CHINH_8.slice(), hamCuaMan: [hFerry(['magnet_on()', 'wait()', 'walk(path)', 'magnet_off()'])] }, phaiCoMa: ['quen-wait', 'chua-dua-vat'] },
        { moTa: 'Chỉ gọi ferry() cho vật thứ nhất', baiLam: { chinh: [W('R'), 'ferry("RRU")'], hamCuaMan: [hFerry()] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Chạy thử và xem vật nằm ở đâu sau mỗi lần ferry(): hàm thả vật vào lúc nào?',
        'Hút, bay theo path, rồi mới thả: thả phải nằm SAU lệnh bay.']
    }),

    man({
      so: 9, ten: 'Sắt lẫn gỗ', hang: 'bien-the', nam: true, hamCuaEmCan: ['go', 'walk'],
      deBai: 'Vật gỗ không bị nam châm hút, còn vật sắt nằm trên làn băng chuyền vẫn hút được. Drone bay qua vật gỗ thoải mái. Đưa hai vật sắt tới hai ô đích; vật gỗ để yên cũng được.',
      veMaMau: 'Chương trình có sẵn mới bay tới trên vật sắt thứ nhất và hút nó. Chạy thử rồi viết tiếp.',
      san: SAN_9, vatChat: CHAT_9, vatThem: THEM_9, batDau: BD1,
      maMau: { chinh: [W('RR'), 'magnet_on()', 'wait()'] },
      sao: { o: 18, nhip: 11 },
      loiGiai: { chinh: CHINH_9.slice() },
      loiGiaiKhac: { moTa: 'Đoạn walk("RR") đầu tiên chia làm hai lần gọi', baiLam: { chinh: CHINH_9_KHAC.slice() } },
      loiSai: [
        { moTa: 'Quên bay lên ô đích: nam châm tắt ngay chỗ hút, vật nằm lại ô cũ', baiLam: { chinh: nhieu([W('RR')], LAP(2, ['magnet_on()', 'wait()', 'magnet_off()', 'wait()', W('DRR')])) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Bật nam châm khi đang ở trên vật gỗ: không hút được gì', baiLam: { chinh: [W('RRR'), 'magnet_on()', 'wait()', 'go_up()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['hut-go', 'chua-dua-vat'] },
        { moTa: 'Chỉ lặp một lần: còn một vật sắt chưa tới đích', baiLam: { chinh: nhieu([W('RR')], LAP(1, ['magnet_on()', 'wait()', 'go_up()', 'magnet_off()', 'wait()'])) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên magnet_off(): vật thứ nhất dính mãi nên không hút thêm được vật thứ hai', baiLam: { chinh: nhieu([W('RR')], LAP(2, ['magnet_on()', 'wait()', 'go_up()', W('DRR')])) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vật gỗ nằm giữa hai vật sắt chỉ là chỗ bay qua. Hai lượt hút và thả giống hệt nhau, cách nhau một đoạn bay về.',
        'Từ ô đích bay xuống một ô, rồi sang phải hai ô là tới vật sắt kế tiếp.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Trạm giao hàng', hang: 'trum', canHam: 'tran-khung', nam: true, bat: true, pin: 14, hamCuaEmCan: ['go', 'walk'], taoHam: ['ship'],
      deBai: 'Hai vật sắt, hai ô đích, mà pin chỉ có 14 nên phải ghé ô sạc P giữa đường. Tạo hàm ship(path): hút vật dưới bụng, bay theo path rồi thả vật; dùng nó cùng walk() để giao cả hai vật.',
      veMaMau: 'Chương trình có sẵn mới bay tới trên vật sắt thứ nhất. Tạo hàm ship với một đối số path rồi viết tiếp.',
      san: SAN_10, vatChat: CHAT_10, batDau: BD1,
      maMau: { chinh: [W('RRD')] },
      sao: { o: 19, nhip: 20 },
      huyHieu: { ma: 'drone', ten: 'Huy hiệu Drone' },
      loiGiai: { chinh: CHINH_10.slice(), hamCuaEmMoi: [hShip()] },
      loiGiaiKhac: { moTa: 'Đoạn walk("RRD") đầu tiên chia làm hai lần gọi', baiLam: { chinh: CHINH_10_KHAC.slice() }, hamCuaEmMoi: [hShip()] },
      loiSai: [
        { moTa: 'Gọi ship() mà chưa tạo hàm', baiLam: { chinh: CHINH_10.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Không ghé ô sạc: hai chuyến bay thẳng cần 16 pin, hết pin trước khi xong', baiLam: { chinh: [W('RRD'), 'ship("URU")', W('DRD'), 'ship("URU")'] }, hamCuaEmMoi: [hShip()], phaiCoMa: ['het-pin'] },
        { moTa: 'ship() quên wait() sau magnet_on(): drone bay đi ngay nên chưa hút được vật dưới bụng', baiLam: { chinh: CHINH_10.slice() }, hamCuaEmMoi: [hShip(['magnet_on()', 'walk(path)', 'magnet_off()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'ship() quên magnet_off(): vật dính mãi dưới bụng', baiLam: { chinh: CHINH_10.slice() }, hamCuaEmMoi: [hShip(['magnet_on()', 'wait()', 'walk(path)'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không dùng ship(): mỗi chuyến viết walk, hút, walk, thả riêng, quá 10 ô', baiLam: { chinh: [W('RRD'), 'magnet_on()', 'wait()', W('ULUDRRU'), 'magnet_off()', 'wait()', W('DRD'), 'magnet_on()', 'wait()', W('URU'), 'magnet_off()', 'wait()'] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Hút rồi bay đi rồi thả: ba việc đó lặp lại ở mỗi chuyến, nên gói chúng vào hàm ship(path).',
        'Hết pin thì drone rơi: ô sạc P nằm trong ngách phía trên hành lang. Chuyến thứ nhất ghé qua đó giữa đường.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
